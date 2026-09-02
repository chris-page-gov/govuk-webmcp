import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, lstat, readFile, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  assertMatchingPublicDeploymentSnapshot,
  assertPublicEvidenceAdmissionTarget,
  fetchPublicDeploymentMetadata,
  parseDevtoolsCaptureTarget,
} from "./lib/chrome-devtools-capture-target.mjs";
import { completeChromeDevtoolsCaptureCleanup } from "./lib/chrome-devtools-capture-cleanup.mjs";
import {
  assertSupportedHostDemoPlan,
  buildSupportedHostEvidence,
  FINAL_PAGE_EVALUATION_FUNCTION,
  parseEvaluateScriptResult,
  SUPPORTED_HOST_EXPECTED_CALLS,
  SUPPORTED_HOST_FEDERATED_RECORD_ID,
  SUPPORTED_HOST_RAW_RECEIPT_PATH,
  SUPPORTED_HOST_REVIEWED_LIMITATIONS,
  SUPPORTED_HOST_REVIEWED_EVIDENCE_PATH,
  validateSupportedHostDeploymentChecks,
  validateCapturedPageObservation,
} from "./lib/chrome-devtools-supported-host-evidence.mjs";
import { admitEvidenceSet } from "./lib/public-evidence-admission.mjs";
import { ensurePrivateDirectory } from "./lib/private-directory.mjs";
import { RELEASE_EVIDENCE_PATHS } from "./lib/release-evidence-paths.mjs";
import { withoutProviderCredentials } from "./lib/webmcp-evals-harness.mjs";
import {
  validateSupportedHostEvidence,
  validateSupportedHostReviewedArtefact,
} from "./build-demo-video.mjs";
import {
  authenticateLivePagesReceipt,
  disposeAuthenticatedLivePagesReceipt,
} from "./verify-live-pages-artifact.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(import.meta.dirname, "..");
const cliPath = resolve(repositoryRoot, "node_modules/.bin/chrome-devtools");
const captureTarget = parseDevtoolsCaptureTarget(process.env);
const outputPath = resolve(repositoryRoot, ".evals", captureTarget.receiptName);
const outputDirectory = dirname(outputPath);
const reviewedEvidencePath = resolve(
  repositoryRoot,
  SUPPORTED_HOST_REVIEWED_EVIDENCE_PATH,
);
const supportedHostEvidencePath = resolve(
  repositoryRoot,
  RELEASE_EVIDENCE_PATHS.supportedHostEvidence,
);
const liveVerificationPath = resolve(
  repositoryRoot,
  RELEASE_EVIDENCE_PATHS.reviewedLivePagesVerification,
);
const privateLiveVerificationRelativePath = RELEASE_EVIDENCE_PATHS.privateLivePagesVerification;
const privateLiveVerificationPath = resolve(repositoryRoot, privateLiveVerificationRelativePath);
const demoVideoScriptPath = resolve(
  repositoryRoot,
  RELEASE_EVIDENCE_PATHS.demoConfig,
);
const portText = process.env.WEBMCP_DEVTOOLS_PORT ?? "4231";
const port = Number(portText);
const expectedChromeDevtoolsMcpVersion = "1.8.0";
const CLI_TIMEOUT_MS = 60_000;
const cliArguments = new Set(process.argv.slice(2));
const admittedArguments = new Set(["--admit-public-evidence", "--overwrite-reviewed-evidence", "--overwrite-raw-evidence"]);
for (const argument of cliArguments) {
  if (!admittedArguments.has(argument)) throw new Error(`Unknown argument: ${argument}`);
}
const admitPublicEvidence = cliArguments.has("--admit-public-evidence");
const overwriteReviewedEvidence = cliArguments.has("--overwrite-reviewed-evidence");
const overwriteRawEvidence = cliArguments.has("--overwrite-raw-evidence");
if (overwriteReviewedEvidence && !admitPublicEvidence) {
  throw new Error("--overwrite-reviewed-evidence requires --admit-public-evidence.");
}
assertPublicEvidenceAdmissionTarget(captureTarget, admitPublicEvidence);

if (captureTarget.mode === "local" && (!Number.isInteger(port) || port < 1024 || port > 65_535)) {
  throw new Error("WEBMCP_DEVTOOLS_PORT must be an integer from 1024 to 65535.");
}

const targetUrl = captureTarget.targetUrl ?? `http://127.0.0.1:${port}/`;
const expectedTools = SUPPORTED_HOST_EXPECTED_CALLS;

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function readPrivateReceiptBytes(path, label, maximumBytes = 1_000_000) {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0 || before.size > maximumBytes || (before.mode & 0o777) !== 0o600) {
    throw new Error(`${label} must be a bounded mode-0600 regular non-symbolic file.`);
  }
  const bytes = await readFile(path);
  const after = await lstat(path);
  if (!after.isFile() || after.isSymbolicLink() || before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || bytes.byteLength !== before.size) {
    throw new Error(`${label} changed while its exact bytes were read.`);
  }
  return bytes;
}

async function runCli(args) {
  const result = await execFileAsync(cliPath, args, {
    cwd: repositoryRoot,
    env: {
      ...withoutProviderCredentials(process.env),
      CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS: "1",
      CI: "1",
    },
    killSignal: "SIGTERM",
    maxBuffer: 64 * 1024 * 1024,
    timeout: CLI_TIMEOUT_MS,
  });
  return result.stdout.trim();
}

async function runCliJson(args) {
  const text = await runCli([...args, "--output-format=json"]);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Chrome DevTools MCP returned non-JSON output for ${args[0]}.`);
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`The local evidence server exited with code ${server.exitCode}.`);
    }
    try {
      const response = await fetch(targetUrl, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // The server may not yet have bound its loopback socket.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`The local evidence server did not become ready at ${targetUrl}.`);
}

async function pythonCommand() {
  const localPython = resolve(repositoryRoot, ".venv/bin/python");
  try {
    await access(localPython);
    return localPython;
  } catch {
    return "python3";
  }
}

async function chromeVersion() {
  const candidates = process.platform === "darwin"
    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    : ["google-chrome", "google-chrome-stable"];
  for (const candidate of candidates) {
    try {
      const { stdout } = await execFileAsync(candidate, ["--version"], {
        killSignal: "SIGTERM",
        maxBuffer: 1024 * 1024,
        timeout: 5_000,
      });
      return stdout.trim();
    } catch {
      // Try the next recognised stable-Chrome executable.
    }
  }
  throw new Error("The installed Google Chrome stable version could not be identified.");
}

const publicDeployment = captureTarget.publicTarget
  ? await fetchPublicDeploymentMetadata({ expectedCommit: captureTarget.expectedCommit })
  : null;
const deploymentChecks = publicDeployment
  ? [{
      label: "initial",
      observedAt: new Date().toISOString(),
      metadataSha256: publicDeployment.sha256,
      commit: publicDeployment.metadata.commit,
      runId: String(publicDeployment.metadata.runId),
    }]
  : [];

const status = await runCli(["status"]);
if (!status.includes("is not running")) {
  throw new Error(
    "A chrome-devtools-mcp daemon is already running. Stop it deliberately before this isolated capture.",
  );
}

const packageValue = JSON.parse(await readFile(
  resolve(repositoryRoot, "node_modules/chrome-devtools-mcp/package.json"),
  "utf8",
));
if (packageValue.version !== expectedChromeDevtoolsMcpVersion) {
  throw new Error(
    `Expected chrome-devtools-mcp ${expectedChromeDevtoolsMcpVersion}, received ${String(packageValue.version)}. Run npm ci.`,
  );
}

const {
  TOOL_DESCRIPTIONS: applicationDescriptions,
  TOOL_INPUT_SCHEMAS: applicationSchemas,
  TOOL_TITLES: applicationTitles,
} = await import(pathToFileURL(
  resolve(repositoryRoot, "dist/src/webmcp-tools.js"),
).href);
const demoConfig = JSON.parse(await readFile(demoVideoScriptPath, "utf8"));
assertSupportedHostDemoPlan(demoConfig);

const server = captureTarget.mode === "local"
  ? spawn(
      await pythonCommand(),
      ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", "dist"],
      { cwd: repositoryRoot, stdio: ["ignore", "ignore", "pipe"] },
    )
  : null;
let serverErrors = "";
if (server) {
  server.stderr.setEncoding("utf8");
  server.stderr.on("data", (chunk) => {
    serverErrors = `${serverErrors}${chunk}`.slice(-8_192);
  });
}

let daemonStarted = false;
let daemonStartAttempted = false;
let primaryFailed = false;
let authenticatedLiveReceipt;
try {
  if (server) await waitForServer(server);
  daemonStartAttempted = true;
  await runCli([
    "start",
    "--headless=true",
    "--isolated=true",
    "--channel=stable",
    "--category-experimental-webmcp=true",
    "--chrome-arg=--enable-features=WebMCP",
    `--allowed-url-pattern=${targetUrl}*`,
    "--no-usage-statistics",
    "--no-performance-crux",
    "--redact-network-headers=true",
    "--no-category-extensions",
  ]);
  daemonStarted = true;

  await runCliJson(["new_page", targetUrl, "--timeout=30000"]);
  const pages = await runCliJson(["list_pages"]);
  const page = pages.pages?.find((candidate) => candidate.url === targetUrl);
  if (!page || !Number.isInteger(page.id)) {
    throw new Error("Chrome DevTools MCP did not expose the expected page ID.");
  }
  if (publicDeployment) {
    const afterPageLoadDeployment = await fetchPublicDeploymentMetadata({ expectedCommit: captureTarget.expectedCommit });
    assertMatchingPublicDeploymentSnapshot(
      publicDeployment,
      afterPageLoadDeployment,
      "Public deployment after Chrome page load",
    );
    deploymentChecks.push({
      label: "after-page-load",
      observedAt: new Date().toISOString(),
      metadataSha256: afterPageLoadDeployment.sha256,
      commit: afterPageLoadDeployment.metadata.commit,
      runId: String(afterPageLoadDeployment.metadata.runId),
    });
  }

  const discovery = await runCliJson(["list_webmcp_tools", String(page.id)]);
  const names = discovery.webmcpTools?.map(({ name }) => name) ?? [];
  if (canonicalJson([...names].sort()) !== canonicalJson(expectedTools.map(({ name }) => name).sort())) {
    throw new Error(`Unexpected WebMCP tool set: ${JSON.stringify(names)}.`);
  }
  for (const expected of expectedTools) {
    const observed = discovery.webmcpTools.find(({ name }) => name === expected.name);
    if (observed.title !== undefined && observed.title !== applicationTitles[expected.name]) {
      throw new Error(`${expected.name} did not expose the exact canonical application title.`);
    }
    if (observed.description !== applicationDescriptions[expected.name]) {
      throw new Error(`${expected.name} did not expose the exact canonical application description.`);
    }
    if (canonicalJson(observed.inputSchema) !== canonicalJson(applicationSchemas[expected.name])) {
      throw new Error(`${expected.name} did not expose the exact closed application input schema.`);
    }
    const expectedAnnotations = { readOnly: expected.readOnly, untrustedContent: true };
    if (canonicalJson(observed.annotations) !== canonicalJson(expectedAnnotations)) {
      throw new Error(`${expected.name} exposed unexpected read-only or untrusted-content annotations.`);
    }
  }

  const calls = [];
  for (const expected of expectedTools) {
    const envelope = await runCliJson([
      "execute_webmcp_tool",
      String(page.id),
      expected.name,
      `--input=${JSON.stringify(expected.input)}`,
    ]);
    let execution;
    try {
      execution = JSON.parse(envelope.message);
    } catch {
      throw new Error(`${expected.name} returned an unreadable execution envelope.`);
    }
    if (execution.status !== "Completed" || execution.output?.ok !== true) {
      throw new Error(`${expected.name} did not complete successfully.`);
    }
    if (execution.output.schema !== expected.schema) {
      throw new Error(`${expected.name} returned ${execution.output.schema}, expected ${expected.schema}.`);
    }
    calls.push({
      command: "execute_webmcp_tool",
      pageId: page.id,
      toolName: expected.name,
      input: expected.input,
      status: execution.status,
      output: execution.output,
      canonicalOutputSha256: sha256(canonicalJson(execution.output)),
    });
  }

  const presentationCall = calls.find(({ toolName }) => toolName === "present_resource_evidence");
  const pageEvaluation = await runCliJson([
    "evaluate_script",
    FINAL_PAGE_EVALUATION_FUNCTION,
    `--pageId=${String(page.id)}`,
    "--waitForStableDom=false",
  ]);
  const finalPageObservation = validateCapturedPageObservation(
    parseEvaluateScriptResult(pageEvaluation),
    presentationCall?.output?.evidenceDigest,
    SUPPORTED_HOST_FEDERATED_RECORD_ID,
  );

  const rejectedInput = {
    query: "birth",
    personalContext: "synthetic context that the page contract must reject",
  };
  const rejectedEnvelope = await runCliJson([
    "execute_webmcp_tool",
    String(page.id),
    "search_government_knowledge",
    `--input=${JSON.stringify(rejectedInput)}`,
  ]);
  let rejectedExecution;
  try {
    rejectedExecution = JSON.parse(rejectedEnvelope.message);
  } catch {
    throw new Error("The invalid-input check returned an unreadable execution envelope.");
  }
  if (rejectedExecution.status !== "Completed" ||
      rejectedExecution.output?.ok !== false ||
      rejectedExecution.output?.schema !== "trusted-govuk-discovery.error.v1" ||
      rejectedExecution.output.error?.code !== "invalid_search_request") {
    throw new Error("The invalid personal-context field did not fail closed as expected.");
  }

  const consoleState = await runCliJson(["list_console_messages", String(page.id)]);
  let consoleMessages = null;
  if (Array.isArray(consoleState.consoleMessages)) {
    consoleMessages = consoleState.consoleMessages;
  } else if (
    consoleState !== null
    && typeof consoleState === "object"
    && !Array.isArray(consoleState)
    && Object.keys(consoleState).length === 0
  ) {
    // Version 1.8.0 returns an empty structured-content object when there are
    // no console messages; its human-readable marker is omitted in JSON mode.
    consoleMessages = [];
  } else if (
    Array.isArray(consoleState)
    && consoleState.some((value) =>
      typeof value === "string" && value.includes("<no console messages found>"))
  ) {
    consoleMessages = [];
  } else if (
    typeof consoleState.message === "string"
    && consoleState.message.includes("<no console messages found>")
  ) {
    consoleMessages = [];
  }
  if (!consoleMessages) {
    throw new Error("Chrome DevTools MCP did not return a readable console-message list.");
  }
  const consoleErrors = consoleMessages.filter(({ type }) => type === "error");
  if (consoleErrors.length > 0) {
    throw new Error(`The isolated WebMCP journey emitted ${consoleErrors.length} console error(s).`);
  }
  if (publicDeployment) {
    const afterExecutionDeployment = await fetchPublicDeploymentMetadata({ expectedCommit: captureTarget.expectedCommit });
    assertMatchingPublicDeploymentSnapshot(
      publicDeployment,
      afterExecutionDeployment,
      "Public deployment after Chrome WebMCP execution",
    );
    deploymentChecks.push({
      label: "after-execution",
      observedAt: new Date().toISOString(),
      metadataSha256: afterExecutionDeployment.sha256,
      commit: afterExecutionDeployment.metadata.commit,
      runId: String(afterExecutionDeployment.metadata.runId),
    });
  }

  const observedAt = new Date().toISOString();
  if (publicDeployment) {
    validateSupportedHostDeploymentChecks(
      deploymentChecks,
      {
        metadataSha256: publicDeployment.sha256,
        commit: publicDeployment.metadata.commit,
        runId: String(publicDeployment.metadata.runId),
      },
      observedAt,
    );
  }
  const receipt = {
    schema: "trusted-govuk-discovery.chrome-devtools-webmcp-capture.v2",
    observedAt,
    target: {
      url: targetUrl,
      mode: captureTarget.mode,
      localBuild: captureTarget.mode === "local",
      personalDataUsed: false,
      ...(publicDeployment ? {
        deployment: {
          metadataUrl: publicDeployment.url,
          metadataSha256: publicDeployment.sha256,
          ...publicDeployment.metadata,
          expectedCommit: captureTarget.expectedCommit,
        },
      } : {}),
    },
    deploymentChecks,
    environment: {
      chrome: await chromeVersion(),
      chromeChannel: "stable",
      chromeDevtoolsMcp: packageValue.version,
      node: process.version,
      isolatedProfile: true,
      allowedUrlPattern: `${targetUrl}*`,
      usageStatistics: false,
      updateChecks: false,
      performanceCrux: false,
      networkHeadersRedacted: true,
    },
    discovery: {
      command: "list_webmcp_tools",
      pageId: page.id,
      toolCount: discovery.webmcpTools.length,
      tools: discovery.webmcpTools,
    },
    calls,
    finalPageObservation: {
      command: "evaluate_script",
      pageId: page.id,
      ...finalPageObservation,
    },
    rejectedCall: {
      command: "execute_webmcp_tool",
      pageId: page.id,
      toolName: "search_government_knowledge",
      input: rejectedInput,
      status: rejectedExecution.status,
      output: rejectedExecution.output,
      canonicalOutputSha256: sha256(canonicalJson(rejectedExecution.output)),
    },
    console: {
      command: "list_console_messages",
      messageCount: consoleMessages.length,
      errorCount: consoleErrors.length,
      types: [...new Set(consoleMessages.map(({ type }) => type))].sort(),
    },
    boundaries: {
      browserNativeWebMcp: true,
      bridge: "Chrome DevTools MCP CLI over its local MCP daemon",
      deploymentMetadataValidated: publicDeployment !== null,
      modelSelectionEvaluated: false,
      durableGovernmentService: false,
      remoteProviderCalled: false,
      reportContainsToolOutputs: true,
    },
    limitations: captureTarget.mode === "local"
      ? [
          "This local deterministic capture proves discovery and execution through Chrome DevTools MCP; it does not measure whether a model chooses the right tool.",
          "The receipt can contain source-derived tool output and must be reviewed before publication.",
          "The local URL is not evidence that the fixed working tree has been deployed publicly.",
        ]
      : [
          "This public-page capture binds discovery and execution to the validated deployment metadata returned at capture time; it does not independently compare every live byte with the Pages artefact.",
          "Chrome DevTools MCP execution does not measure whether a model chooses the right tool.",
          "The receipt contains source-derived tool output and must be reviewed before admission to public evidence.",
        ],
  };
  const repositoryState = await lstat(repositoryRoot);
  if (!repositoryState.isDirectory() || repositoryState.isSymbolicLink()) {
    throw new Error("The capture repository root must be a real non-symbolic directory.");
  }
  await ensurePrivateDirectory(
    outputDirectory,
    await realpath(repositoryRoot),
    "The local .evals evidence directory",
  );
  const rawReceiptContent = `${JSON.stringify(receipt, null, 2)}\n`;

  if (admitPublicEvidence) {
    if (await fileExists(outputPath) && !overwriteRawEvidence) {
      throw new Error("The bound raw receipt already exists; inspect the new capture and rerun with --overwrite-raw-evidence only when replacing it together with both public projections.");
    }
    if (!overwriteReviewedEvidence && (
      await fileExists(reviewedEvidencePath)
      || await fileExists(supportedHostEvidencePath)
    )) {
      throw new Error(
        "Reviewed public evidence already exists; inspect the new ignored receipt and rerun with --overwrite-reviewed-evidence only after reviewing both public projections.",
      );
    }
    const liveVerificationBytes = await readFile(liveVerificationPath);
    const liveVerification = JSON.parse(liveVerificationBytes.toString("utf8"));
    const privateLiveVerificationBytes = await readPrivateReceiptBytes(privateLiveVerificationPath, "Private live Pages verification receipt");
    const privateLiveVerification = JSON.parse(privateLiveVerificationBytes.toString("utf8"));
    if (liveVerification.schema !== "govuk-webmcp.live-pages-verification.v2" ||
        liveVerification.baseUrl !== targetUrl ||
        liveVerification.commit !== publicDeployment.metadata.commit ||
        String(liveVerification.runId) !== publicDeployment.metadata.runId ||
        liveVerification.mismatches?.length !== 0 ||
        liveVerification.boundaries?.comparedEveryRegularArtifactFile !== true) {
      throw new Error("The current live-byte verification does not bind the captured public deployment.");
    }
    authenticatedLiveReceipt = await authenticateLivePagesReceipt(liveVerification);
    const sourceReceiptBytes = Buffer.from(rawReceiptContent, "utf8");
    const sourceReceiptSha256 = sha256(sourceReceiptBytes);
    const reviewedEvidence = {
      schema: "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v3",
      observedAt: receipt.observedAt,
      sourceReceipt: {
        path: ".evals/chrome-devtools-mcp-public.json",
        sha256: sourceReceiptSha256,
        sizeBytes: sourceReceiptBytes.byteLength,
        tracking: "ignored local source",
        review: "The exact tool definitions, inputs, outputs, statuses and canonical output digests below were copied from the reviewed source receipt; local page identifiers were omitted.",
      },
      target: receipt.target,
      deploymentChecks: structuredClone(receipt.deploymentChecks),
      releaseEvidence: {
        productCommit: authenticatedLiveReceipt.commit,
        pagesRunId: String(authenticatedLiveReceipt.runId),
        pagesArtifactId: authenticatedLiveReceipt.artifact.id,
        artifactApiDigest: authenticatedLiveReceipt.artifact.apiDigest,
        artifactTarSha256: authenticatedLiveReceipt.artifact.tarSha256,
        liveArtifactVerification: RELEASE_EVIDENCE_PATHS.reviewedLivePagesVerification,
        liveArtifactVerificationSha256: sha256(liveVerificationBytes),
        comparedFileCount: authenticatedLiveReceipt.fileCount,
        comparedByteCount: authenticatedLiveReceipt.byteCount,
        liveManifestSha256: authenticatedLiveReceipt.manifestSha256,
      },
      environment: receipt.environment,
      capture: {
        mechanism: receipt.boundaries.bridge,
        modelSelected: false,
        modelProviderCalled: false,
        exactToolOutputsRetained: true,
        redactions: {
          localProfilePath: "not retained",
          hostPageIdentifiers: "not retained",
          networkHeaders: "not retained",
          cookies: "not inspected or retained",
        },
      },
      boundaries: receipt.boundaries,
      discovery: {
        toolCount: receipt.discovery.toolCount,
        tools: receipt.discovery.tools,
      },
      calls: receipt.calls.map(({ toolName, input, status: callStatus, output, canonicalOutputSha256 }) => ({
        toolName,
        input,
        status: callStatus,
        output,
        canonicalOutputSha256,
      })),
      rejectedCall: {
        toolName: receipt.rejectedCall.toolName,
        inputFieldNames: Object.keys(receipt.rejectedCall.input).sort(),
        status: receipt.rejectedCall.status,
        output: receipt.rejectedCall.output,
        canonicalOutputSha256: receipt.rejectedCall.canonicalOutputSha256,
      },
      console: {
        messageCount: receipt.console.messageCount,
        errorCount: receipt.console.errorCount,
        types: receipt.console.types,
      },
      limitations: [...SUPPORTED_HOST_REVIEWED_LIMITATIONS],
    };
    const reviewedEvidenceContent = `${JSON.stringify(reviewedEvidence, null, 2)}\n`;
    const reviewedEvidenceBytes = Buffer.from(reviewedEvidenceContent, "utf8");
    const reviewedEvidenceSha256 = sha256(reviewedEvidenceBytes);
    const liveVerificationSha256 = sha256(liveVerificationBytes);
    const supportedHostEvidence = buildSupportedHostEvidence({
      receipt,
      sourceReceiptSha256,
      sourceReceiptSizeBytes: sourceReceiptBytes.byteLength,
      reviewedEvidenceSha256,
      reviewedEvidenceSizeBytes: reviewedEvidenceBytes.byteLength,
      liveVerification: authenticatedLiveReceipt,
      demoConfig,
    });
    const releaseConfig = {
      ...demoConfig,
      productCommit: authenticatedLiveReceipt.commit,
      pagesRunId: String(authenticatedLiveReceipt.runId),
    };
    validateSupportedHostEvidence(
      supportedHostEvidence,
      releaseConfig,
      SUPPORTED_HOST_FEDERATED_RECORD_ID,
      {
        metadataUrl: publicDeployment.url,
        metadataSha256: publicDeployment.sha256,
      },
    );
    validateSupportedHostReviewedArtefact(
      reviewedEvidence,
      supportedHostEvidence,
      {
        relativePath: SUPPORTED_HOST_REVIEWED_EVIDENCE_PATH,
        sha256: reviewedEvidenceSha256,
        sizeBytes: reviewedEvidenceBytes.byteLength,
      },
      {
        config: releaseConfig,
        liveVerificationFile: {
          relativePath: RELEASE_EVIDENCE_PATHS.reviewedLivePagesVerification,
          sha256: liveVerificationSha256,
          sizeBytes: liveVerificationBytes.byteLength,
          bytes: liveVerificationBytes,
        },
        liveVerification,
        privateLiveVerificationFile: {
          relativePath: privateLiveVerificationRelativePath,
          sha256: sha256(privateLiveVerificationBytes),
          sizeBytes: privateLiveVerificationBytes.byteLength,
          bytes: privateLiveVerificationBytes,
        },
        privateLiveVerification,
        authenticatedLiveReceipt,
        deployment: {
          metadataUrl: publicDeployment.url,
          metadataSha256: publicDeployment.sha256,
        },
        rawReceiptFile: {
          relativePath: SUPPORTED_HOST_RAW_RECEIPT_PATH,
          sha256: sourceReceiptSha256,
          sizeBytes: sourceReceiptBytes.byteLength,
          bytes: sourceReceiptBytes,
        },
        rawReceipt: receipt,
      },
    );
    await admitEvidenceSet({
      repositoryRoot,
      entries: [
        {
          path: outputPath,
          content: rawReceiptContent,
          mode: 0o600,
          replaceExisting: overwriteRawEvidence,
        },
        {
          path: reviewedEvidencePath,
          content: reviewedEvidenceContent,
          mode: 0o644,
          replaceExisting: overwriteReviewedEvidence,
        },
        {
          path: supportedHostEvidencePath,
          content: `${JSON.stringify(supportedHostEvidence, null, 2)}\n`,
          mode: 0o644,
          replaceExisting: overwriteReviewedEvidence,
        },
      ],
    });
    console.log(`Captured ${calls.length} Chrome DevTools MCP calls in ${outputPath}.`);
    console.log(`Admitted reviewed Chrome evidence in ${reviewedEvidencePath}.`);
    console.log(`Admitted reviewed supported-host evidence in ${supportedHostEvidencePath}.`);
  } else {
    await admitEvidenceSet({
      repositoryRoot,
      entries: [{
        path: outputPath,
        content: rawReceiptContent,
        mode: 0o600,
        replaceExisting: overwriteRawEvidence,
      }],
    });
    console.log(`Captured ${calls.length} Chrome DevTools MCP calls in ${outputPath}.`);
  }
} catch (error) {
  primaryFailed = true;
  throw error;
} finally {
  if (authenticatedLiveReceipt !== undefined) {
    disposeAuthenticatedLivePagesReceipt(authenticatedLiveReceipt);
  }
  const cleanupSteps = [];
  if (daemonStarted || daemonStartAttempted) cleanupSteps.push(() => runCli(["stop"]));
  if (server) {
    cleanupSteps.push(async () => {
      if (server.exitCode === null) server.kill("SIGTERM");
      await new Promise((resolveExit) => {
        if (server.exitCode !== null) {
          resolveExit();
          return;
        }
        const forcedTermination = setTimeout(() => {
          if (server.exitCode === null) server.kill("SIGKILL");
        }, 5_000);
        forcedTermination.unref();
        server.once("exit", () => {
          clearTimeout(forcedTermination);
          resolveExit();
        });
      });
      if (server.exitCode && serverErrors) process.stderr.write(serverErrors);
    });
  }
  await completeChromeDevtoolsCaptureCleanup({ primaryFailed, cleanupSteps });
}
