#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertPinnedWebmcpEvalsVersion,
  browserEvalChildEnvironment,
  buildBrowserEvalArguments,
  CHROME_CHANNEL,
  createLocalStaticServer,
  EXPECTED_RESULT_SCHEMAS,
  MAX_BROWSER_AGENT_STEPS,
  observeOllamaLoadedModel,
  parseBrowserEvalConfiguration,
  PINNED_WEBMCP_EVALS_VERSION,
  preflightOllamaModel,
  validateBrowserFixture,
  withoutProviderCredentials,
} from "./lib/webmcp-evals-harness.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const fixturePath = join(repositoryRoot, "evals", "webmcp-browser.json");
const outputRoot = join(repositoryRoot, ".evals", "webmcp-browser");
const webmcpEvalsPackagePath = join(repositoryRoot, "node_modules", "webmcp-evals", "package.json");
const webmcpEvalsCliPath = join(
  repositoryRoot,
  "node_modules",
  "webmcp-evals",
  "dist",
  "bin",
  "webmcp-evals.js",
);
const MAX_COMMAND_DURATION_MS = 30 * 60 * 1_000;
export const MAX_BROWSER_REPORT_BYTES = 32 * 1024 * 1024;
export const MAX_BROWSER_REPORTED_STEPS_PER_CASE =
  MAX_BROWSER_AGENT_STEPS * Object.keys(EXPECTED_RESULT_SCHEMAS).length;

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function isWithin(parent, child) {
  const childRelative = relative(resolve(parent), resolve(child));
  return childRelative !== ".." && !childRelative.startsWith(`..${sep}`);
}

export function assertBrowserReportByteLength(byteLength) {
  if (
    !Number.isSafeInteger(byteLength)
    || byteLength < 0
    || byteLength > MAX_BROWSER_REPORT_BYTES
  ) {
    throw new Error("The browser evaluation report exceeds the bounded file-size allowance.");
  }
}

async function rejectSymlinkIfPresent(path, label) {
  try {
    if ((await lstat(path)).isSymbolicLink()) throw new Error(`${label} must not be a symbolic link.`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function createRunDirectory(createdAt) {
  if (!isWithin(repositoryRoot, outputRoot)) {
    throw new Error("The browser evaluation output root is outside the repository.");
  }
  await rejectSymlinkIfPresent(join(repositoryRoot, ".evals"), ".evals");
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  await rejectSymlinkIfPresent(outputRoot, "The browser evaluation output root");
  await chmod(outputRoot, 0o700);
  const runName = `${createdAt.replace(/[:.]/gu, "-")}-${process.pid}`;
  const runDirectory = join(outputRoot, runName);
  await mkdir(runDirectory, { mode: 0o700 });
  return runDirectory;
}

function runCommand(command, arguments_, { cwd, env, timeoutMs = MAX_COMMAND_DURATION_MS }) {
  return new Promise((resolveResult, reject) => {
    const detached = process.platform !== "win32";
    const child = spawn(command, arguments_, {
      cwd,
      detached,
      env,
      stdio: ["ignore", "inherit", "inherit"],
    });
    let timedOut = false;
    let forcedTermination;
    const signalProcessTree = (signal) => {
      try {
        if (detached && child.pid) process.kill(-child.pid, signal);
        else child.kill(signal);
      } catch (error) {
        if (error?.code !== "ESRCH") {
          try {
            child.kill(signal);
          } catch {
            // The child may have exited between the timeout and fallback signal.
          }
        }
      }
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      signalProcessTree("SIGTERM");
      forcedTermination = setTimeout(() => signalProcessTree("SIGKILL"), 5_000);
      forcedTermination.unref();
    }, timeoutMs);
    timeout.unref();
    child.once("error", (error) => {
      clearTimeout(timeout);
      clearTimeout(forcedTermination);
      reject(error);
    });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timeout);
      clearTimeout(forcedTermination);
      resolveResult({ exitCode: exitCode ?? 1, signal: signal || null, timedOut });
    });
  });
}

async function installedChromeVersion() {
  const candidates = process.platform === "darwin"
    ? [["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--version"]]]
    : [["google-chrome", ["--version"]], ["google-chrome-stable", ["--version"]]];
  for (const [command, arguments_] of candidates) {
    try {
      const result = await new Promise((resolveResult, reject) => {
        const child = spawn(command, arguments_, { stdio: ["ignore", "pipe", "ignore"] });
        const chunks = [];
        const timeout = setTimeout(() => child.kill("SIGKILL"), 5_000);
        timeout.unref();
        child.stdout.on("data", (chunk) => chunks.push(chunk));
        child.once("error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once("close", (code) => {
          clearTimeout(timeout);
          resolveResult({
            code,
            value: Buffer.concat(chunks).toString("utf8").trim(),
          });
        });
      });
      if (result.code === 0 && result.value) return result.value;
    } catch {
      // Try the next standard Chrome stable binary name.
    }
  }
  throw new Error("The installed Google Chrome stable channel could not be identified.");
}

async function reportFiles(runDirectory) {
  const reports = [];
  for (const entry of await readdir(runDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !/^report-\d+\.(?:html|json)$/u.test(entry.name)) continue;
    const path = join(runDirectory, entry.name);
    await chmod(path, 0o600);
    assertBrowserReportByteLength((await lstat(path)).size);
    const value = await readFile(path);
    assertBrowserReportByteLength(value.byteLength);
    reports.push({
      format: entry.name.endsWith(".json") ? "json" : "html",
      path: entry.name,
      bytes: value.byteLength,
      sha256: createHash("sha256").update(value).digest("hex"),
    });
  }
  return reports.sort((left, right) => left.path.localeCompare(right.path, "en-GB"));
}

export function validateBrowserEvaluationReport(
  report,
  configuration,
  targetUrl,
  fixture,
) {
  const fixtureSummary = validateBrowserFixture(fixture);
  if (
    report?.config?.backend !== "vercel"
    || report?.config?.model !== configuration.model
    || report?.config?.runs !== configuration.runs
    || report?.config?.maxSteps !== MAX_BROWSER_AGENT_STEPS
    || report?.config?.url !== targetUrl
  ) {
    throw new Error("The JSON report configuration does not match the authorised evaluation.");
  }
  const results = report.results;
  for (const field of ["testCount", "passCount", "failCount", "errorCount"]) {
    if (!Number.isInteger(results?.[field]) || results[field] < 0) {
      throw new Error(`The JSON report has no valid ${field}.`);
    }
  }
  if (results.testCount !== fixtureSummary.caseCount * configuration.runs) {
    throw new Error("The JSON report case count does not match the bounded run configuration.");
  }
  const expectedResultCount = (
    fixtureSummary.expectedStepCount + fixtureSummary.noCallCaseCount
  ) * configuration.runs;
  if (!Array.isArray(results.results)) {
    throw new Error("The JSON report has no per-step results.");
  }
  const reportedResultCount = results.passCount + results.failCount + results.errorCount;
  const maximumResultCount = fixtureSummary.caseCount
    * configuration.runs
    * MAX_BROWSER_REPORTED_STEPS_PER_CASE;
  if (reportedResultCount > maximumResultCount || results.results.length > maximumResultCount) {
    throw new Error("The JSON report exceeds the bounded per-case tool-step allowance.");
  }
  if (results.results.length !== reportedResultCount) {
    throw new Error("The JSON report outcome counts do not match its per-step results.");
  }

  const expectedGroups = [];
  for (let runIndex = 1; runIndex <= configuration.runs; runIndex += 1) {
    for (const evalCase of fixture) {
      const expectedCalls = evalCase.expectedCall === null ? [null] : evalCase.expectedCall;
      if (expectedCalls.length > MAX_BROWSER_REPORTED_STEPS_PER_CASE) {
        throw new Error("The authored fixture exceeds the bounded per-case tool-step allowance.");
      }
      expectedGroups.push({
        authoredExpectedCall: evalCase.expectedCall,
        expectedCalls,
        messages: evalCase.messages,
        name: evalCase.name,
        runIndex,
      });
    }
  }

  const outcomeCounts = { pass: 0, fail: 0, error: 0 };
  let additionalStepCount = 0;
  let missingStepCount = 0;
  let resultIndex = 0;
  for (const expectedGroup of expectedGroups) {
    let groupStepIndex = 0;
    let terminalError = false;
    while (resultIndex < results.results.length) {
      const result = results.results[resultIndex];
      if (
        result?.runIndex !== expectedGroup.runIndex
        || result.test?.name !== expectedGroup.name
      ) {
        break;
      }
      groupStepIndex += 1;
      if (groupStepIndex > MAX_BROWSER_REPORTED_STEPS_PER_CASE) {
        throw new Error(
          `The JSON report case ${expectedGroup.name} exceeds the bounded tool-step allowance.`,
        );
      }
      if (
        canonicalJson(result.test?.messages) !== canonicalJson(expectedGroup.messages)
        || result.stepIndex !== groupStepIndex
        || !["pass", "fail", "error"].includes(result.outcome)
      ) {
        throw new Error(
          `The JSON report row ${resultIndex + 1} does not match the authored fixture trajectory.`,
        );
      }
      if (
        Object.hasOwn(result, "trajectory")
        && (
          !Array.isArray(result.trajectory)
          || result.trajectory.length > MAX_BROWSER_AGENT_STEPS
        )
      ) {
        throw new Error(
          `The JSON report row ${resultIndex + 1} exceeds the bounded agent trajectory.`,
        );
      }
      if (
        Object.hasOwn(result, "browserConsoleErrors")
        && !Array.isArray(result.browserConsoleErrors)
      ) {
        throw new Error(
          `The JSON report row ${resultIndex + 1} has an invalid browser-console diagnostic.`,
        );
      }
      if (result.browserConsoleErrors?.length > 0) {
        throw new Error(
          `The JSON report row ${resultIndex + 1} contains a browser console or page error.`,
        );
      }

      const isTerminalError = groupStepIndex === 1
        && result.outcome === "error"
        && canonicalJson(result.test?.expectedCall)
          === canonicalJson(expectedGroup.authoredExpectedCall);
      if (isTerminalError) {
        if (result.response !== null) {
          throw new Error(
            `The JSON report row ${resultIndex + 1} has an invalid terminal error result.`,
          );
        }
        outcomeCounts.error += 1;
        missingStepCount += expectedGroup.expectedCalls.length;
        resultIndex += 1;
        terminalError = true;
        break;
      }
      if (result.outcome === "error") {
        throw new Error(
          `The JSON report row ${resultIndex + 1} has an invalid non-terminal error result.`,
        );
      }

      const isAdditionalStep = groupStepIndex > expectedGroup.expectedCalls.length;
      const expectedCall = isAdditionalStep
        ? null
        : expectedGroup.expectedCalls[groupStepIndex - 1];
      const expectedCallMetadata = expectedCall === null ? null : [expectedCall];
      if (canonicalJson(result.test?.expectedCall) !== canonicalJson(expectedCallMetadata)) {
        throw new Error(
          `The JSON report row ${resultIndex + 1} does not match the authored fixture trajectory.`,
        );
      }
      if (isAdditionalStep && result.outcome !== "fail") {
        throw new Error("The JSON report has an invalid additional unrequested tool step outcome.");
      }
      if (isAdditionalStep) additionalStepCount += 1;

      if (result.outcome === "pass") {
        if (expectedCall === null) {
          if (result.response?.functionName) {
            throw new Error("The model-backed no-call case executed an unexpected page tool.");
          }
        } else {
          const expectedSchema = EXPECTED_RESULT_SCHEMAS[expectedCall.functionName];
          if (
            result.response?.functionName !== expectedCall.functionName
            || canonicalJson(result.response?.args) !== canonicalJson(expectedCall.arguments)
          ) {
            throw new Error(
              `The model-backed ${expectedCall.functionName} step did not match the exact authored call.`,
            );
          }
          if (
            result.response?.result?.ok !== true
            || result.response?.result?.schema !== expectedSchema
            || Object.hasOwn(result.response.result, "error")
          ) {
            throw new Error(
              `The model-backed ${expectedCall.functionName} result was not a successful ${expectedSchema} envelope.`,
            );
          }
        }
      }

      outcomeCounts[result.outcome] += 1;
      resultIndex += 1;
    }
    if (!terminalError && groupStepIndex < expectedGroup.expectedCalls.length) {
      throw new Error(`The JSON report is missing an authored step for ${expectedGroup.name}.`);
    }
  }
  if (resultIndex !== results.results.length) {
    throw new Error(`The JSON report row ${resultIndex + 1} does not match the authored fixture trajectory.`);
  }
  if (
    outcomeCounts.pass !== results.passCount
    || outcomeCounts.fail !== results.failCount
    || outcomeCounts.error !== results.errorCount
  ) {
    throw new Error("The JSON report outcome totals do not match its per-step outcomes.");
  }

  const privacyCaseName = "Minimise context sent to a catalogue search";
  const privacyResults = results.results.filter(({ stepIndex, test }) =>
    test?.name === privacyCaseName && stepIndex === 1);
  if (privacyResults.length !== configuration.runs) {
    throw new Error("The JSON report does not contain one context-minimisation result per run.");
  }
  for (const result of privacyResults) {
    if (result.outcome !== "pass") continue;
    const arguments_ = result?.response?.args;
    if (
      result.response?.functionName !== "search_government_knowledge"
      || !arguments_
      || arguments_.query !== "flooding"
      || canonicalJson(arguments_.collections) !== canonicalJson(["deep-evidence"])
      || arguments_.limit !== 3
      || Object.keys(arguments_).sort().join(",") !== "collections,limit,query"
    ) {
      throw new Error("The model-backed context-minimisation call was not exact.");
    }
  }

  return {
    additionalStepCount,
    browserConsoleErrorCount: 0,
    errorCount: results.errorCount,
    expectedStepCount: expectedResultCount,
    failCount: results.failCount,
    missingStepCount,
    passCount: results.passCount,
    reportedStepCount: reportedResultCount,
    testCount: results.testCount,
  };
}

async function readEvaluationSummary(runDirectory, reports, configuration, targetUrl, fixture) {
  const jsonReports = reports.filter(({ format }) => format === "json");
  const htmlReports = reports.filter(({ format }) => format === "html");
  if (jsonReports.length !== 1 || htmlReports.length !== 1) {
    throw new Error("The browser evaluation did not produce exactly one JSON and one HTML report.");
  }
  const reportBytes = await readFile(join(runDirectory, jsonReports[0].path));
  assertBrowserReportByteLength(reportBytes.byteLength);
  if (reportBytes.byteLength !== jsonReports[0].bytes) {
    throw new Error("The JSON browser evaluation report changed after it was inventoried.");
  }
  const report = JSON.parse(reportBytes.toString("utf8"));
  return validateBrowserEvaluationReport(report, configuration, targetUrl, fixture);
}

function validatedLocalModelInventoryIdentity(identity, configuration, label) {
  if (
    identity === null
    || typeof identity !== "object"
    || Array.isArray(identity)
    || Object.getPrototypeOf(identity) !== Object.prototype
    || Object.keys(identity).sort().join(",") !== "digest,name"
    || identity.name !== configuration.modelIdentifier
    || !/^[a-f0-9]{64}$/u.test(identity.digest)
  ) {
    throw new Error(`The local model inventory ${label} identity is missing or invalid.`);
  }
  return {
    name: identity.name,
    digest: identity.digest,
  };
}

function localModelInventoryBinding(
  configuration,
  localModelInventoryBefore,
  localModelInventoryAfter,
  localModelLoadedAfter,
) {
  if (configuration.provider !== "ollama") {
    if (
      (localModelInventoryBefore !== null && localModelInventoryBefore !== undefined)
      || (localModelInventoryAfter !== null && localModelInventoryAfter !== undefined)
      || (localModelLoadedAfter !== null && localModelLoadedAfter !== undefined)
    ) {
      throw new Error("A remote provider receipt must not contain a local model identity.");
    }
    return null;
  }

  const before = validatedLocalModelInventoryIdentity(
    localModelInventoryBefore,
    configuration,
    "before",
  );
  const after = localModelInventoryAfter === null
    ? null
    : validatedLocalModelInventoryIdentity(localModelInventoryAfter, configuration, "after");
  const loadedAfter = localModelLoadedAfter === null
    ? null
    : validatedLocalModelInventoryIdentity(localModelLoadedAfter, configuration, "loaded-after");
  const stable = after !== null
    && before.name === after.name
    && before.digest === after.digest;
  return {
    before,
    after,
    loadedAfter,
    stable,
    executionBound: stable
      && loadedAfter !== null
      && before.name === loadedAfter.name
      && before.digest === loadedAfter.digest,
  };
}

export function createBrowserEvalReceipt({
  applicationPackage,
  browserVersion,
  commandResult,
  configuration,
  createdAt,
  evaluation,
  failurePhase,
  fixtureSha256,
  fixtureSummary,
  localModelInventoryAfter,
  localModelInventoryBefore,
  localModelLoadedAfter,
  reports,
}) {
  const inventoryBinding = localModelInventoryBinding(
    configuration,
    localModelInventoryBefore,
    localModelInventoryAfter,
    localModelLoadedAfter,
  );
  const effectiveFailurePhase = failurePhase === null && inventoryBinding?.executionBound === false
    ? "model-postflight"
    : failurePhase;
  const passed = effectiveFailurePhase === null
    && commandResult?.exitCode === 0
    && commandResult?.timedOut === false
    && evaluation?.browserConsoleErrorCount === 0
    && evaluation?.failCount === 0
    && evaluation?.errorCount === 0;
  return {
    schema: "trusted-govuk-discovery.webmcp-evals-browser-receipt.v2",
    createdAt,
    status: passed ? "passed" : "failed",
    runner: {
      applicationPackage: {
        name: applicationPackage.name,
        version: applicationPackage.version,
      },
      browserVersion,
      chromeChannel: CHROME_CHANNEL,
      nodeVersion: process.version,
      webmcpEvalsVersion: PINNED_WEBMCP_EVALS_VERSION,
    },
    model: {
      identifier: configuration.model,
      provider: configuration.provider,
      providerClass: configuration.providerClass,
      backend: configuration.backend,
      runs: configuration.runs,
      presentationApproved: configuration.presentationApproved,
      remoteProviderApproved: configuration.remoteProviderApproved,
      credentialConfigured: configuration.providerClass === "remote",
      localInventory: inventoryBinding,
    },
    fixture: {
      path: "evals/webmcp-browser.json",
      sha256: fixtureSha256,
      ...fixtureSummary,
    },
    execution: {
      target: "same-origin loopback build",
      command: commandResult,
      failurePhase: effectiveFailurePhase,
      evaluation,
    },
    reports,
    assurance: {
      autoAnalysisRun: false,
      autoOpenUsed: false,
      browserConsoleErrorsAccepted: false,
      containsCredentialValues: false,
      fullReportsIgnored: true,
      personalContextBoundary:
        "The fixture sends only authored synthetic prompts and bounded tool inputs; remote providers receive the evaluation prompt, tool metadata and tool results.",
    },
  };
}

export async function runWebmcpBrowserEvaluation(environment = process.env) {
  const fixtureBytes = await readFile(fixturePath);
  const fixture = JSON.parse(fixtureBytes.toString("utf8"));
  const configuration = parseBrowserEvalConfiguration(environment);
  const fixtureSummary = validateBrowserFixture(fixture);
  const fixtureSha256 = createHash("sha256").update(fixtureBytes).digest("hex");
  const webmcpEvalsPackage = JSON.parse(await readFile(webmcpEvalsPackagePath, "utf8"));
  assertPinnedWebmcpEvalsVersion(webmcpEvalsPackage.version);
  const applicationPackage = JSON.parse(await readFile(join(repositoryRoot, "package.json"), "utf8"));
  const browserVersion = await installedChromeVersion();
  const localModelInventoryBefore = await preflightOllamaModel(configuration);

  const createdAt = new Date().toISOString();
  const runDirectory = await createRunDirectory(createdAt);
  const receiptPath = join(runDirectory, "receipt.json");
  const isolatedHome = await mkdtemp(join(tmpdir(), "govuk-webmcp-browser-home-"));
  await chmod(isolatedHome, 0o700);
  const executionEnvironment = {
    ...environment,
    HOME: isolatedHome,
    USERPROFILE: isolatedHome,
  };
  let commandResult = null;
  let evaluation = null;
  let failure = null;
  let failurePhase = "build";
  let localModelInventoryAfter = null;
  let localModelLoadedAfter = null;
  let reports = [];
  let server;
  try {
    const buildResult = await runCommand("npm", ["run", "build"], {
      cwd: repositoryRoot,
      env: withoutProviderCredentials(executionEnvironment),
    });
    if (buildResult.exitCode !== 0 || buildResult.timedOut) {
      throw new Error("The deterministic application build failed or timed out.");
    }

    failurePhase = "serve";
    server = await createLocalStaticServer(join(repositoryRoot, "dist"));
    const targetUrl = `${server.origin}/`;
    failurePhase = "evaluate";
    commandResult = await runCommand(
      process.execPath,
      buildBrowserEvalArguments({
        configuration,
        cliPath: webmcpEvalsCliPath,
        fixturePath,
        outputDirectory: runDirectory,
        targetUrl,
      }),
      {
        cwd: runDirectory,
        env: browserEvalChildEnvironment(executionEnvironment, configuration),
      },
    );
    if (commandResult.exitCode !== 0 || commandResult.timedOut) {
      throw new Error("The model-backed WebMCP browser evaluation failed or timed out.");
    }

    failurePhase = "verify-reports";
    reports = await reportFiles(runDirectory);
    evaluation = await readEvaluationSummary(
      runDirectory,
      reports,
      configuration,
      targetUrl,
      fixture,
    );
    if (evaluation.failCount > 0 || evaluation.errorCount > 0) {
      throw new Error("The model-backed WebMCP browser evaluation contained failed or errored checks.");
    }
    failurePhase = null;
  } catch (error) {
    failure = error;
  } finally {
    if (configuration.provider === "ollama") {
      try {
        localModelInventoryAfter = await preflightOllamaModel(configuration);
      } catch {
        localModelInventoryAfter = null;
      }
      try {
        localModelLoadedAfter = await observeOllamaLoadedModel(configuration);
      } catch {
        localModelLoadedAfter = null;
      }
    }
    if (server) await server.close();
    await rm(isolatedHome, { recursive: true, force: true });
    if (reports.length === 0) reports = await reportFiles(runDirectory);
    const receipt = createBrowserEvalReceipt({
      applicationPackage,
      browserVersion,
      commandResult,
      configuration,
      createdAt,
      evaluation,
      failurePhase,
      fixtureSha256,
      fixtureSummary,
      localModelInventoryAfter,
      localModelInventoryBefore,
      localModelLoadedAfter,
      reports,
    });
    if (failure === null && receipt.execution.failurePhase === "model-postflight") {
      failurePhase = receipt.execution.failurePhase;
      failure = new Error(
        localModelInventoryAfter === null
          ? "The loopback Ollama model identity could not be observed after evaluation."
          : localModelLoadedAfter === null
            ? "The loopback Ollama model was not reported as loaded after evaluation."
            : "The loopback Ollama model identity was not bound to the evaluated model.",
      );
    }
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
    await chmod(receiptPath, 0o600);
    console.log(`WebMCP browser evaluation receipt: ${receiptPath}`);
  }

  if (failure) throw failure;
  return receiptPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runWebmcpBrowserEvaluation().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
