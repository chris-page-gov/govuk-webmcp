import assert from "node:assert/strict";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { createCombinedKnowledgeRuntime } from "../../dist/src/combined-knowledge-runtime.js";
import { createEvidenceRuntime } from "../../dist/src/evidence-runtime.js";
import { createFederatedSearchRuntime } from "../../dist/src/federated-search-runtime.js";
import { createFederationRuntime } from "../../dist/src/federation-runtime.js";
import { projectReviewedAnswer } from "../../dist/src/beginner-presentation.js";
import { executePresentResourceEvidence } from "../../dist/src/present-resource-evidence.js";
import { createKnowledgeDiscoveryRuntime } from "../../dist/src/webmcp-tools.js";
import {
  EXPECTED_RUN_COUNT,
  LOCAL_MODEL,
  LOCAL_MODEL_INVENTORY_SHA256,
  PRIVACY_MARKERS,
  TOOL_NAMES,
  buildGeneratedArtifacts,
  canonicalJson,
  checkGeneratedArtifacts,
  createPersonalAgentCanonicalRuntime,
  loadAndValidateCaseSet,
  sha256Hex,
  writeGeneratedArtifacts,
} from "../../scripts/prepare-personal-agent-evals.mjs";
import {
  CAPTURE_SCHEMA,
  authenticateEvaluationReleaseReceipt,
  disposeEvaluationReleaseReceipt,
  summariseEvaluationCapture,
  validateEvaluationCapture,
  validateLiveReleaseReceipt,
  verifyEvaluationCapture,
} from "../../scripts/verify-personal-agent-evals.mjs";
import {
  LIVE_PAGES_LIMITS,
  authenticateLivePagesReceipt,
} from "../../scripts/verify-live-pages-artifact.mjs";
import {
  convertPersonalAgentReport,
  runCommand,
} from "../../scripts/run-personal-agent-evals.mjs";
import { mergePersonalAgentCaptures } from "../../scripts/import-copilot-personal-agent-capture.mjs";

const loaded = await loadAndValidateCaseSet();
const readData = (name) => readFile(new URL(`../../app/data/${name}`, import.meta.url), "utf8");
const digestJson = (value) => sha256Hex(Buffer.from(canonicalJson(value), "utf8"));
const LIVE_COMMIT = "a".repeat(40);
const PUBLIC_URL = "https://chris-page-gov.github.io/govuk-webmcp/";

function liveReleaseReceipt() {
  return {
    schema: "govuk-webmcp.live-pages-verification.v2",
    observedAt: "2026-09-01T12:00:00.000Z",
    repository: "chris-page-gov/govuk-webmcp",
    baseUrl: PUBLIC_URL,
    commit: LIVE_COMMIT,
    runId: "123456789",
    artifact: {
      id: 987654321,
      apiDigest: `sha256:${"b".repeat(64)}`,
      tarSha256: "c".repeat(64),
    },
    fileCount: 1883,
    byteCount: 131_064_000,
    manifestSha256: "d".repeat(64),
    statusCounts: { "200": 1883 },
    mismatches: [],
    boundaries: {
      comparedEveryRegularArtifactFile: true,
      followedRedirects: false,
      cacheBustingQueryUsed: true,
      browserJourneyObserved: false,
      budgets: structuredClone(LIVE_PAGES_LIMITS),
    },
  };
}

async function authenticatedReleaseReceipt(
  candidate = liveReleaseReceipt(),
  runtimeSnapshotImplementation = async () => ({
    runtimeFactory: createPersonalAgentCanonicalRuntime,
    verifyGeneratedArtifacts: async () => {},
    revalidate: async () => {},
    dispose: async () => {},
  }),
) {
  return authenticateEvaluationReleaseReceipt(candidate, {
    authenticateImplementation: (value) => authenticateLivePagesReceipt(
      value,
      async () => ({
        receipt: {
          ...structuredClone(value),
          observedAt: "2026-09-01T12:01:00.000Z",
        },
      }),
    ),
    gitIdentityImplementation: async () => ({ commit: candidate.commit, status: "" }),
    localBindingImplementation: async (value) => value,
    runtimeSnapshotImplementation,
  });
}

let runtimePromise;
function runtimes() {
  runtimePromise ??= (async () => {
    const [rawCatalogue, rawCatalogueChecksum, rawReceipts, rawReceiptsChecksum, rawEvidence, rawEvidenceChecksum] =
      await Promise.all([
        readData("catalogue.json"),
        readData("catalogue.json.sha256"),
        readData("receipts.json"),
        readData("receipts.json.sha256"),
        readData("evidence-traces.json"),
        readData("evidence-traces.json.sha256"),
      ]);
    const catalogue = JSON.parse(rawCatalogue);
    const reviewed = await createKnowledgeDiscoveryRuntime(
      rawCatalogue,
      rawCatalogueChecksum,
      rawReceipts,
      rawReceiptsChecksum,
    );
    const evidence = await createEvidenceRuntime(
      rawEvidence,
      rawEvidenceChecksum,
      reviewed.bundleDigest,
      catalogue.records,
    );
    const admitted = await createFederationRuntime(
      await readData("federation.json"),
      await readData("federation.json.sha256"),
      reviewed.bundleDigest,
      reviewed.recordCount,
    );
    const federated = await createFederatedSearchRuntime(
      await readData("federated-search/manifest.json"),
      await readData("federated-search/manifest.json.sha256"),
      async (path) => new Uint8Array(await readFile(resolve("app", path))),
      admitted.federatedSearch,
    );
    return { evidence, combined: createCombinedKnowledgeRuntime(reviewed, federated) };
  })();
  return runtimePromise;
}

function hostIdentity(hostId) {
  return hostId === "copilot-mcp-workspace"
    ? {
        modelStatus: "not-disclosed",
        model: null,
        inventorySha256: null,
        executionBound: "not-observable",
      }
    : {
        modelStatus: "observed-exact",
        model: LOCAL_MODEL,
        inventorySha256: LOCAL_MODEL_INVENTORY_SHA256,
        executionBound: true,
      };
}

function executionContext(hostId) {
  const local = hostId === "ollama-local";
  return {
    hostVersion: { status: "observed", value: local ? "Ollama test; webmcp-evals 0.0.4" : "Microsoft Copilot MCP Workspace observed" },
    browser: {
      status: "observed",
      product: local ? "Google Chrome" : "Microsoft Edge",
      version: local ? "Google Chrome 152.0.1.2" : "140.0.1.2",
    },
    visibleMode: local ? "headless" : "visible",
    exposedTools: { status: "observed", names: [...TOOL_NAMES] },
    share: local
      ? { status: "not-applicable", url: null }
      : { status: "observed", url: "https://copilot.microsoft.com/shares/G6UPWiDJ2VK4RfGycoxdr" },
    deployment: {
      kind: local ? "local-loopback" : "public-pages",
      url: local ? "http://127.0.0.1:4173/" : PUBLIC_URL,
      commitSha: LIVE_COMMIT,
      worktreeStatus: local ? "clean" : "not-applicable",
    },
    diagnostics: { status: "observed", browserConsoleErrors: [], runnerErrors: [] },
  };
}

function pageState(evidence) {
  return evidence === null
    ? { renderedEvidence: null, evidenceDigest: null }
    : { renderedEvidence: structuredClone(evidence), evidenceDigest: digestJson(evidence) };
}

function observedPage(evidence, hostId) {
  const url = hostId === "ollama-local" ? "http://127.0.0.1:4173/" : PUBLIC_URL;
  const storage = { localStorage: [], sessionStorage: [] };
  return {
    status: "observed",
    before: pageState(null),
    after: pageState(evidence),
    url: { status: "observed", before: url, after: url },
    history: {
      status: "observed",
      lengthBefore: 1,
      lengthAfter: 1,
      stateJsonBefore: "null",
      stateJsonAfter: "null",
    },
    storage: { status: "observed", before: storage, after: structuredClone(storage) },
  };
}

function reviewedAnswer(evalCase) {
  const text = evalCase.id === "US-11"
    ? "Which service or task do you mean, and what are you trying to do?"
    : evalCase.id === "US-12"
      ? "A concise response based only on the ordinary question."
      : "This answer states what the captured evidence supports, links to its source, explains the material limitation in plain English and gives a safe next check.";
  const bytes = Buffer.from(text, "utf8");
  return {
    status: "reviewed",
    outcome: "usable",
    text,
    transcriptSha256: sha256Hex(bytes),
    byteLength: bytes.byteLength,
    reviewerClass: "human",
    checks: evalCase.answerReview.requiredChecks.map((id) => ({ id, outcome: "pass" })),
    unsafeCategories: [],
  };
}

function publicSearchArguments(expected) {
  return {
    query: expected.arguments.queryTerms.join(" ").replaceAll("-", " "),
    collections: structuredClone(expected.arguments.preferredCollections),
    limit: expected.arguments.limitMaximum,
  };
}

async function executeCall(expected, runtime) {
  const arguments_ = expected.tool === "search_government_knowledge"
    ? publicSearchArguments(expected)
    : structuredClone(expected.arguments);
  let output;
  switch (expected.tool) {
    case "search_government_knowledge":
      output = await runtime.combined.search(arguments_);
      break;
    case "get_resource_record":
      output = await runtime.combined.getRecord(arguments_);
      break;
    case "show_provenance":
      output = await runtime.combined.showProvenance(arguments_);
      break;
    case "explore_answer_foundations":
      output = await runtime.evidence.explore(arguments_);
      break;
    case "compare_evidence_foundations":
      output = await runtime.evidence.compare(arguments_);
      break;
    case "present_resource_evidence":
      output = (await executePresentResourceEvidence(runtime.combined, arguments_)).result;
      break;
    default:
      throw new Error(`Unsupported test tool ${expected.tool}.`);
  }
  return { name: expected.tool, arguments: arguments_, output };
}

let caseExecutionsPromise;
function caseExecutions() {
  caseExecutionsPromise ??= (async () => {
    const runtime = await runtimes();
    const executions = new Map();
    for (const evalCase of loaded.caseSet.cases) {
      const callsById = new Map(
        [...evalCase.callPolicy.requiredCalls, ...evalCase.callPolicy.optionalCalls]
          .map((call) => [call.id, call]),
      );
      const calls = [];
      for (const id of evalCase.callPolicy.preferredSequence) {
        calls.push(await executeCall(callsById.get(id), runtime));
      }
      calls.forEach((call, index) => { call.ordinal = index + 1; });
      const action = [...calls].reverse().find(({ name }) =>
        ["explore_answer_foundations", "compare_evidence_foundations", "present_resource_evidence"].includes(name));
      const evidence = action === undefined
        ? null
        : action.name === "present_resource_evidence"
          ? action.output.evidence
          : await projectReviewedAnswer(action.output);
      executions.set(evalCase.id, { calls, evidence });
    }
    return executions;
  })();
  return caseExecutionsPromise;
}

let capturePromise;
async function completeSyntheticCapture() {
  capturePromise ??= (async () => {
    const executions = await caseExecutions();
    const runs = [];
    for (const hostId of ["copilot-mcp-workspace", "ollama-local"]) {
      for (const evalCase of loaded.caseSet.cases) {
        for (let repetition = 1; repetition <= 3; repetition += 1) {
          const execution = executions.get(evalCase.id);
          runs.push({
            hostId,
            caseId: evalCase.id,
            repetition,
            observedAt: `2026-09-01T12:${String(repetition).padStart(2, "0")}:00Z`,
            hostIdentity: hostIdentity(hostId),
            executionContext: executionContext(hostId),
            callTrace: { status: "observed", calls: structuredClone(execution.calls) },
            pageObservation: observedPage(execution.evidence, hostId),
            criteria: {
              toolSelection: "pass",
              deterministicExecution: "pass",
              pageParity: "pass",
              answerSafety: "pass",
            },
            answerReview: reviewedAnswer(evalCase),
          });
        }
      }
    }
    return {
      schema: CAPTURE_SCHEMA,
      suiteId: loaded.caseSet.suiteId,
      caseSetSha256: loaded.caseSetSha256,
      comparisonDesign: "observational",
      createdAt: "2026-09-01T13:00:00Z",
      runs,
    };
  })();
  return structuredClone(await capturePromise);
}

test("the authored case set and private capture contract are closed and complete", async () => {
  assert.equal(loaded.caseSet.cases.length, 12);
  assert.equal(loaded.captureSchema.$id, "urn:govuk-webmcp:schema:personal-agent-evaluation-capture:v2");
  const naturalPrompts = loaded.caseSet.cases.map(({ messages }) => messages[0].content).join("\n");
  for (const toolName of TOOL_NAMES) assert.equal(naturalPrompts.includes(toolName), false);
  for (const marker of PRIVACY_MARKERS) assert.equal(naturalPrompts.includes(marker), false);
  const us10 = loaded.caseSet.cases.find(({ id }) => id === "US-10");
  assert.deepEqual(us10.hostOnlyInput.map(({ value }) => value), PRIVACY_MARKERS);
});

test("claim authentication uses the ignored live receipt before tracked evidence admission", async () => {
  const protocol = await readFile("docs/competition/personal-agent-evaluation-protocol.md", "utf8");
  assert.match(protocol, /\.evals\/live-artifact-verification-v0\.4\.0-rc\.1\.json/u);
  assert.match(protocol, /completely clean before, during and after replay/u);
  assert.match(protocol, /npm run deployment:metadata/u);
  assert.match(protocol, /otherwise identical local manifest one file short/u);
  assert.match(protocol, /separate post-deployment evidence change/u);
  assert.doesNotMatch(
    protocol,
    /scripts\/(?:verify-personal-agent-evals|import-copilot-personal-agent-capture)\.mjs[\s\S]{0,400}docs\/competition\/evidence\/live-artifact-verification-v0\.4\.0-rc\.1\.json/u,
  );
});

test("the compiler emits deterministic adapters, a capture-bound oracle and 72 unrun slots", async (t) => {
  const first = await buildGeneratedArtifacts(loaded);
  assert.deepEqual(first, await buildGeneratedArtifacts(loaded));
  assert.equal(first.fixture.length, 12);
  assert.equal(first.runPlan.plannedRunCount, EXPECTED_RUN_COUNT);
  assert.equal(first.runPlan.observedRunCount, 0);
  assert.equal(first.runPlan.evidenceStatus, "planned-unrun");
  assert.equal(first.runPlan.captureContract.sha256, loaded.captureSchemaSha256);
  assert.equal(first.oracle.captureContract.schemaSha256, loaded.captureSchemaSha256);
  assert.equal(first.manifest.authored.captureSchema.sha256, loaded.captureSchemaSha256);
  assert.equal(JSON.stringify(first.oracle).includes(PRIVACY_MARKERS[0]), false);

  const directory = await mkdtemp(join(tmpdir(), "govuk-webmcp-personal-agent-evals-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeGeneratedArtifacts(first, directory);
  await checkGeneratedArtifacts(first, directory);
  await writeFile(join(directory, "personal-agent-run-plan.json"), "{}\n", "utf8");
  await assert.rejects(() => checkGeneratedArtifacts(first, directory), /is stale/u);
});

test("the local evaluator builds before importing and checking the canonical runtime", async () => {
  const source = await readFile(
    new URL("../../scripts/run-personal-agent-evals.mjs", import.meta.url),
    "utf8",
  );
  const isolatedHomeIndex = source.indexOf("govuk-webmcp-personal-agent-home-");
  const buildIndex = source.indexOf('runCommand("npm", ["run", "build"]');
  const runtimeCheckIndex = source.indexOf("checkGeneratedArtifacts(await buildGeneratedArtifacts(loaded))");
  assert.ok(isolatedHomeIndex >= 0);
  assert.ok(buildIndex > isolatedHomeIndex);
  assert.ok(runtimeCheckIndex > buildIndex);
  assert.ok(source.includes("env: withoutProviderCredentials(childEnvironment)"));
});

test("the local evaluator escalates a refused SIGTERM without hanging", async () => {
  const startedAt = Date.now();
  const result = await runCommand(
    process.execPath,
    ["-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1_000);"],
    {
      cwd: resolve("."),
      env: process.env,
      timeoutMs: 20,
      terminationGraceMs: 20,
      killSettleMs: 200,
    },
  );
  assert.equal(result.timedOut, true);
  assert.ok(Date.now() - startedAt < 1_000);
});

test("a complete synthetic exact capture validates all six tools and page parity", async () => {
  const capture = await completeSyntheticCapture();
  const unboundSummary = await verifyEvaluationCapture(capture, loaded);
  assert.equal(unboundSummary.evidenceStatus, "partial");
  assert.equal(unboundSummary.liveReleaseBinding.status, "not-supplied");
  assert.equal(unboundSummary.claimGatePassed, false);

  const rawSummary = await verifyEvaluationCapture(capture, loaded, liveReleaseReceipt());
  assert.equal(rawSummary.claimGatePassed, false);
  assert.equal(rawSummary.liveReleaseBinding.status, "structurally-valid");

  const release = await authenticatedReleaseReceipt();
  const summary = await verifyEvaluationCapture(capture, loaded, release);
  assert.equal(capture.runs.length, EXPECTED_RUN_COUNT);
  assert.equal(summary.observedRunCount, EXPECTED_RUN_COUNT);
  assert.equal(summary.matrixComplete, true);
  assert.equal(summary.claimGatePassed, true);
  assert.equal(summary.liveReleaseBinding.status, "authenticated");
  assert.equal(summary.liveReleaseBinding.boundRunCount, EXPECTED_RUN_COUNT);
  assert.equal(summary.executionContext.complete, EXPECTED_RUN_COUNT);
  assert.equal(summary.causalClaimSupported, false);
  assert.equal(summary.privacyChecks.toolArguments.pass, 6);

  const localOnly = {
    ...structuredClone(capture),
    runs: capture.runs.filter(({ hostId }) => hostId === "ollama-local"),
  };
  const localOnlySummary = await summariseEvaluationCapture(localOnly, loaded, liveReleaseReceipt());
  assert.equal(localOnlySummary.evidenceStatus, "partial");
  assert.equal(localOnlySummary.matrixComplete, false);
  assert.equal(localOnlySummary.claimGatePassed, false);
});

test("receipt-authenticated replay never reuses an earlier unbound execution cache", async () => {
  const capture = await completeSyntheticCapture();
  await validateEvaluationCapture(capture, loaded);
  let authenticatedRuntimeStarts = 0;
  const release = await authenticatedReleaseReceipt(
    liveReleaseReceipt(),
    async () => ({
      runtimeFactory: async () => {
        authenticatedRuntimeStarts += 1;
        return createPersonalAgentCanonicalRuntime();
      },
      verifyGeneratedArtifacts: async () => {},
      revalidate: async () => {},
      dispose: async () => {},
    }),
  );
  const summary = await summariseEvaluationCapture(capture, loaded, release);
  assert.ok(authenticatedRuntimeStarts > 0);
  assert.equal(summary.liveReleaseBinding.status, "authenticated");
  assert.equal(summary.claimGatePassed, true);
});

test("public evaluation metadata omits private host values and exposes only bounded four-part browser versions", async () => {
  const capture = await completeSyntheticCapture();
  const cloud = capture.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace");
  cloud.executionContext.hostVersion.value = "Microsoft Copilot for chris@example.test";
  capture.runs.find(({ hostId, repetition }) =>
    hostId === "copilot-mcp-workspace" && repetition === 2)
    .executionContext.browser.version = "447.700900.123447.700900";
  const summary = await summariseEvaluationCapture(capture, loaded, liveReleaseReceipt());
  const serialised = JSON.stringify(summary);
  assert.equal(serialised.includes("chris@example.test"), false);
  assert.equal(serialised.includes(cloud.executionContext.hostVersion.value), false);
  assert.equal(serialised.includes(cloud.executionContext.share.url), false);
  assert.equal(serialised.includes(
    sha256Hex(Buffer.from(cloud.executionContext.hostVersion.value, "utf8")),
  ), false);
  assert.deepEqual(summary.hosts[0].hostVersion, { observed: 36, "not-observable": 0 });
  assert.ok(summary.hosts.flatMap(({ browsers }) => browsers).every((browser) =>
    !Object.hasOwn(browser, "versionSha256")));
  assert.ok(summary.hosts.flatMap(({ deploymentBindings }) => deploymentBindings).every((binding) =>
    !Object.hasOwn(binding, "urlSha256")));
  assert.equal(summary.hosts[0].browsers[0].version, "140.0.1.2");
  assert.equal(summary.hosts[0].browsers[0].versionStatus, "published-numeric");
  assert.deepEqual(summary.observationWindow, {
    earliest: "2026-09-01T12:01:00.000Z",
    latest: "2026-09-01T12:03:00.000Z",
  });
  assert.deepEqual(summary.hosts[0].observedToolLists, [[...TOOL_NAMES]]);
  const us02Selection = loaded.caseSet.cases.find(({ id }) => id === "US-02").presentation.selectionId;
  assert.ok(summary.hosts[0].caseEvidence.some(({ caseId, pageResults }) =>
    caseId === "US-02"
    && pageResults.length === 1
    && pageResults[0].selectionId === us02Selection
    && /^[a-f0-9]{64}$/u.test(pageResults[0].evidenceDigest)));
  assert.ok(summary.hosts[0].browsers.some(({ versionStatus }) =>
    versionStatus === "withheld-non-numeric"));
  assert.equal(serialised.includes("447.700900"), false);
  assert.equal(Object.hasOwn(summary.hosts[1].browsers[0], "version"), false);
  assert.equal(summary.hosts[1].browsers[0].versionStatus, "withheld-non-numeric");

  const failedPageCapture = await completeSyntheticCapture();
  const privateSelectionId = "answer:private-account-observation";
  const failedPageRun = failedPageCapture.runs.find(({ hostId, caseId, repetition }) =>
    hostId === "copilot-mcp-workspace" && caseId === "US-02" && repetition === 1);
  failedPageRun.pageObservation.after.renderedEvidence.selectionId = privateSelectionId;
  failedPageRun.pageObservation.after.evidenceDigest = digestJson(
    failedPageRun.pageObservation.after.renderedEvidence,
  );
  failedPageRun.criteria.pageParity = "fail";
  const failedPageSummary = await summariseEvaluationCapture(
    failedPageCapture,
    loaded,
    liveReleaseReceipt(),
  );
  const failedPageSerialised = JSON.stringify(failedPageSummary);
  assert.equal(failedPageSerialised.includes(privateSelectionId), false);
  assert.ok(failedPageSummary.hosts.flatMap(({ caseEvidence }) => caseEvidence)
    .every(({ pageResults }) => pageResults.every(({ selectionId }) =>
      loaded.caseSet.cases.some(({ presentation }) => presentation.selectionId === selectionId))));
});

test("the isolated local adapter accepts optional-call omissions and emits 36 exact private captures", async () => {
  const source = await completeSyntheticCapture();
  const fixture = (await buildGeneratedArtifacts(loaded)).fixture;
  const fixtureById = new Map(fixture.map((item) => [item.name.slice(0, 5), item]));
  const rows = [];
  for (const run of source.runs.filter(({ hostId }) => hostId === "ollama-local")) {
    const evalCase = loaded.caseSet.cases.find(({ id }) => id === run.caseId);
    const requiredTools = new Set(evalCase.callPolicy.requiredCalls.map(({ tool }) => tool));
    const requiredCalls = run.callTrace.calls.filter(({ name }) => requiredTools.has(name));
    const fixtureCase = fixtureById.get(run.caseId);
    if (requiredCalls.length === 0) {
      rows.push({
        test: { name: fixtureCase.name, messages: fixtureCase.messages, expectedCall: null },
        response: { text: run.answerReview.text },
        outcome: "pass",
        runIndex: run.repetition,
        stepIndex: 1,
        trajectory: [{ text: run.answerReview.text }],
      });
      continue;
    }
    requiredCalls.forEach((call, index) => rows.push({
      test: { name: fixtureCase.name, messages: fixtureCase.messages, expectedCall: null },
      response: { functionName: call.name, args: call.arguments, result: call.output },
      outcome: "pass",
      runIndex: run.repetition,
      stepIndex: index + 1,
      trajectory: [{ text: run.answerReview.text }],
    }));
  }
  const report = {
    config: {
      backend: "vercel",
      model: LOCAL_MODEL,
      runs: 3,
      maxSteps: 6,
      url: "http://127.0.0.1:4173/",
    },
    results: { testCount: 36, passCount: rows.length, failCount: 0, errorCount: 0, results: rows },
  };
  const capture = await convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z");
  assert.equal(capture.runs.length, 36);
  assert.ok(capture.runs.every(({ pageObservation }) => pageObservation.status === "not-observable"));
  assert.ok(capture.runs.every(({ answerReview }) => answerReview.status === "captured-unreviewed"));
  const summary = await summariseEvaluationCapture(capture, loaded);
  assert.equal(summary.evidenceStatus, "partial");
  assert.equal(summary.executionContext.incomplete, 36);
  assert.equal(summary.claimGatePassed, false);

  for (const url of [
    "http://user:password@127.0.0.1:4173/",
    "http://127.0.0.1:4173/demo",
    "http://127.0.0.1:4173/?private=context",
    "http://127.0.0.1:4173/#private-context",
    "http://127.0.0.1:4173/DEV-EXAMPLE/..",
    "http://127.0.0.1:4173/%44%45%56-EXAMPLE/..",
    "http://127.0.0.1:80/",
    " http://127.0.0.1:4173/ ",
  ]) {
    const unboundedReport = structuredClone(report);
    unboundedReport.config.url = url;
    await assert.rejects(
      () => convertPersonalAgentReport(unboundedReport, loaded, "2026-09-01T14:00:00Z"),
      /pinned local/u,
    );
  }
});

test("the Copilot import helper requires and merges two exact 36-slot host matrices", async () => {
  const complete = await completeSyntheticCapture();
  const local = { ...structuredClone(complete), runs: complete.runs.filter(({ hostId }) => hostId === "ollama-local") };
  const copilot = { ...structuredClone(complete), runs: complete.runs.filter(({ hostId }) => hostId === "copilot-mcp-workspace") };
  const release = await authenticatedReleaseReceipt();
  const merged = await mergePersonalAgentCaptures(
    local,
    copilot,
    loaded,
    release,
    "2026-09-01T15:00:00Z",
  );
  assert.equal(merged.runs.length, 72);
  assert.equal((await summariseEvaluationCapture(merged, loaded, release)).claimGatePassed, true);

  await assert.rejects(
    () => mergePersonalAgentCaptures(local, copilot, loaded),
    /requires the exact live Pages verification receipt/u,
  );

  copilot.runs.pop();
  await assert.rejects(
    () => mergePersonalAgentCaptures(local, copilot, loaded, release),
    /exactly the 36 copilot-mcp-workspace run slots/u,
  );
});

test("host, browser, visible-mode, tool-list, share, deployment and diagnostics context is fail-closed", async () => {
  const capture = await completeSyntheticCapture();
  const local = capture.runs.find(({ hostId }) => hostId === "ollama-local");
  local.executionContext.share = { status: "observed", url: "https://example.test/share" };
  await assert.rejects(
    () => validateEvaluationCapture(capture, loaded),
    /pinned loopback browser arrangement/u,
  );

  const dirty = await completeSyntheticCapture();
  dirty.runs.find(({ hostId }) => hostId === "ollama-local").executionContext.deployment.worktreeStatus = "dirty";
  const summary = await summariseEvaluationCapture(dirty, loaded);
  assert.equal(summary.executionContext.incomplete, 1);
  assert.equal(summary.claimGatePassed, false);

  const wrongCloudBrowser = await completeSyntheticCapture();
  wrongCloudBrowser.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace")
    .executionContext.browser.product = "Google Chrome";
  await assert.rejects(
    () => validateEvaluationCapture(wrongCloudBrowser, loaded),
    /Microsoft Edge MCP Workspace/u,
  );

  const missingShare = await completeSyntheticCapture();
  missingShare.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace")
    .executionContext.share = { status: "not-observable", url: null };
  await assert.rejects(
    () => validateEvaluationCapture(missingShare, loaded),
    /Microsoft Edge MCP Workspace/u,
  );

  for (const deploymentUrl of [
    "http://user:password@127.0.0.1:4173/",
    "http://127.0.0.1:4173/demo",
    "http://127.0.0.1:4173/?private=context",
    "http://127.0.0.1:4173/#private-context",
    "http://127.0.0.1:4173/DEV-EXAMPLE/..",
    "http://127.0.0.1:4173/%44%45%56-EXAMPLE/..",
    "http://127.0.0.1:80/",
  ]) {
    const unboundedLocal = await completeSyntheticCapture();
    unboundedLocal.runs.find(({ hostId }) => hostId === "ollama-local")
      .executionContext.deployment.url = deploymentUrl;
    await assert.rejects(
      () => validateEvaluationCapture(unboundedLocal, loaded),
      /pinned loopback browser arrangement/u,
    );
  }

  for (const shareUrl of [
    "https://copilot.microsoft.com/private/../shares/G6UPWiDJ2VK4RfGycoxdr",
    "https://copilot.microsoft.com:443/shares/G6UPWiDJ2VK4RfGycoxdr",
  ]) {
    const shareAlias = await completeSyntheticCapture();
    shareAlias.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace")
      .executionContext.share.url = shareUrl;
    await assert.rejects(
      () => validateEvaluationCapture(shareAlias, loaded),
      /closed schema|Microsoft Edge MCP Workspace/u,
    );
  }

  const deploymentAlias = await completeSyntheticCapture();
  deploymentAlias.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace")
    .executionContext.deployment.url = "https://chris-page-gov.github.io/private/../govuk-webmcp/";
  await assert.rejects(
    () => validateEvaluationCapture(deploymentAlias, loaded),
    /Microsoft Edge MCP Workspace/u,
  );
});

test("the claim gate requires a closed live receipt and exact per-run release binding", async () => {
  const receipt = liveReleaseReceipt();
  assert.equal(validateLiveReleaseReceipt(receipt), receipt);

  const structurallyValid = await summariseEvaluationCapture(
    await completeSyntheticCapture(),
    loaded,
    receipt,
  );
  assert.equal(structurallyValid.liveReleaseBinding.status, "structurally-valid");
  assert.equal(structurallyValid.claimGatePassed, false);

  const authenticated = await authenticatedReleaseReceipt(receipt);
  const authenticatedSummary = await summariseEvaluationCapture(
    await completeSyntheticCapture(),
    loaded,
    authenticated,
  );
  assert.equal(authenticatedSummary.liveReleaseBinding.status, "authenticated");
  assert.equal(authenticatedSummary.claimGatePassed, true);

  assert.equal(Reflect.set(authenticated, "manifestSha256", "e".repeat(64)), false);
  const immutableAfterAuthentication = await summariseEvaluationCapture(
    await completeSyntheticCapture(),
    loaded,
    authenticated,
  );
  assert.equal(immutableAfterAuthentication.liveReleaseBinding.status, "authenticated");
  assert.equal(immutableAfterAuthentication.claimGatePassed, true);

  let mutationAccepted = null;
  const immutableDuringValidation = await summariseEvaluationCapture(
    await completeSyntheticCapture(),
    loaded,
    authenticated,
    {
      validationCheckpointImplementation: async ({ suppliedRelease }) => {
        mutationAccepted = Reflect.set(suppliedRelease, "observedAt", "2026-09-01T13:00:00.000Z");
      },
    },
  );
  assert.equal(mutationAccepted, false);
  assert.equal(immutableDuringValidation.liveReleaseBinding.status, "authenticated");
  assert.equal(immutableDuringValidation.claimGatePassed, true);

  await assert.rejects(
    () => authenticateEvaluationReleaseReceipt(receipt, {
      authenticateImplementation: (value) => authenticateLivePagesReceipt(
        value,
        async () => ({
          receipt: {
            ...structuredClone(value),
            manifestSha256: "f".repeat(64),
            observedAt: "2026-09-01T12:02:00.000Z",
          },
        }),
      ),
      gitIdentityImplementation: async () => ({ commit: receipt.commit, status: "" }),
      localBindingImplementation: async (value) => value,
    }),
    /does not match a fresh authenticated observation/u,
  );

  const wrongRepository = structuredClone(receipt);
  wrongRepository.repository = "someone-else/govuk-webmcp";
  assert.throws(
    () => validateLiveReleaseReceipt(wrongRepository),
    /canonical repository/u,
  );

  const mismatched = structuredClone(receipt);
  mismatched.mismatches.push({ path: "index.html", status: 200, reason: "different bytes" });
  assert.throws(
    () => validateLiveReleaseReceipt(mismatched),
    /not a clean byte comparison/u,
  );

  const incompleteBoundary = structuredClone(receipt);
  incompleteBoundary.boundaries.comparedEveryRegularArtifactFile = false;
  assert.throws(
    () => validateLiveReleaseReceipt(incompleteBoundary),
    /full byte-comparison boundary/u,
  );

  const wrongCommit = await completeSyntheticCapture();
  wrongCommit.runs[0].executionContext.deployment.commitSha = "e".repeat(40);
  await assert.rejects(
    () => summariseEvaluationCapture(wrongCommit, loaded, receipt),
    /does not bind its commit, URL and worktree condition/u,
  );

  const wrongPublicUrl = await completeSyntheticCapture();
  const cloud = wrongPublicUrl.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace");
  cloud.executionContext.deployment.url = "https://example.test/";
  cloud.pageObservation.url.before = "https://example.test/";
  cloud.pageObservation.url.after = "https://example.test/";
  await assert.rejects(
    () => summariseEvaluationCapture(wrongPublicUrl, loaded, receipt),
    /does not bind its commit, URL and worktree condition/u,
  );

  const wrongObservedPage = await completeSyntheticCapture();
  const observed = wrongObservedPage.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace");
  observed.pageObservation.url.before = `${PUBLIC_URL}#different`;
  observed.pageObservation.url.after = `${PUBLIC_URL}#different`;
  await assert.rejects(
    () => summariseEvaluationCapture(wrongObservedPage, loaded, receipt),
    /does not bind its commit, URL and worktree condition/u,
  );
});

test("authenticated runtime snapshots are disposed on authentication failure and retryable cleanup", async () => {
  const receipt = liveReleaseReceipt();
  const authenticateImplementation = (value) => authenticateLivePagesReceipt(
    value,
    async () => ({
      receipt: {
        ...structuredClone(value),
        observedAt: "2026-09-01T12:01:00.000Z",
      },
    }),
  );
  let identityCalls = 0;
  let failedAuthenticationDisposals = 0;
  await assert.rejects(
    () => authenticateEvaluationReleaseReceipt(receipt, {
      authenticateImplementation,
      gitIdentityImplementation: async () => {
        identityCalls += 1;
        if (identityCalls === 2) throw new Error("Injected Git identity failure.");
        return { commit: receipt.commit, status: "" };
      },
      localBindingImplementation: async (value) => value,
      runtimeSnapshotImplementation: async () => ({
        runtimeFactory: createPersonalAgentCanonicalRuntime,
        verifyGeneratedArtifacts: async () => {},
        revalidate: async () => {},
        dispose: async () => { failedAuthenticationDisposals += 1; },
      }),
    }),
    /Injected Git identity failure/u,
  );
  assert.equal(failedAuthenticationDisposals, 1);

  let cleanupCalls = 0;
  const authenticated = await authenticatedReleaseReceipt(
    liveReleaseReceipt(),
    async () => ({
      runtimeFactory: createPersonalAgentCanonicalRuntime,
      verifyGeneratedArtifacts: async () => {},
      revalidate: async () => {},
      dispose: async () => {
        cleanupCalls += 1;
        if (cleanupCalls === 1) throw new Error("Injected cleanup failure.");
      },
    }),
  );
  await assert.rejects(
    () => disposeEvaluationReleaseReceipt(authenticated),
    /Injected cleanup failure/u,
  );
  assert.equal(await disposeEvaluationReleaseReceipt(authenticated), true);
  assert.equal(cleanupCalls, 2);
  assert.equal(await disposeEvaluationReleaseReceipt(authenticated), false);
});

test("72 arbitrary digest assertions cannot pass as execution evidence", async () => {
  const capture = await completeSyntheticCapture();
  for (const [index, run] of capture.runs.entries()) {
    run.callTrace = {
      status: "observed",
      callCount: 1,
      toolNames: ["search_government_knowledge"],
      argumentsDigest: sha256Hex(Buffer.from(`arbitrary-arguments-${index}`, "utf8")),
      resultsDigest: sha256Hex(Buffer.from(`arbitrary-results-${index}`, "utf8")),
    };
  }
  await assert.rejects(
    () => validateEvaluationCapture(capture, loaded),
    /does not match its closed schema/u,
  );
});

test("co-digested page substitutions and unbound tool evidence are rejected", async () => {
  const substituted = await completeSyntheticCapture();
  const pageRun = substituted.runs.find(({ caseId }) => caseId === "US-02");
  pageRun.pageObservation.after.renderedEvidence.heading = "A different but self-digested heading";
  pageRun.pageObservation.after.evidenceDigest = digestJson(pageRun.pageObservation.after.renderedEvidence);
  await assert.rejects(
    () => validateEvaluationCapture(substituted, loaded),
    /page-parity criterion disagrees/u,
  );

  const unbound = await completeSyntheticCapture();
  const present = unbound.runs.find(({ caseId }) => caseId === "US-02").callTrace.calls.at(-1);
  present.output.evidenceDigest = sha256Hex(Buffer.from("arbitrary", "utf8"));
  await assert.rejects(
    () => validateEvaluationCapture(unbound, loaded),
    /does not bind its evidence object/u,
  );

  const coDigested = await completeSyntheticCapture();
  const coDigestedRun = coDigested.runs.find(({ caseId }) => caseId === "US-02");
  const coDigestedCall = coDigestedRun.callTrace.calls.at(-1);
  coDigestedCall.output.evidence.heading = "A fabricated but consistently self-digested heading";
  coDigestedCall.output.evidenceDigest = digestJson(coDigestedCall.output.evidence);
  coDigestedRun.pageObservation.after = pageState(coDigestedCall.output.evidence);
  await assert.rejects(
    () => validateEvaluationCapture(coDigested, loaded),
    /deterministic-execution criterion disagrees/u,
  );

  const divergentRepetition = await completeSyntheticCapture();
  const divergentRun = divergentRepetition.runs.find(({ caseId, repetition }) =>
    caseId === "US-02" && repetition === 2);
  divergentRun.callTrace.calls.at(-1).output.evidence.heading = "Only this repetition differs";
  divergentRun.callTrace.calls.at(-1).output.evidenceDigest = digestJson(
    divergentRun.callTrace.calls.at(-1).output.evidence,
  );
  divergentRun.pageObservation.after = pageState(divergentRun.callTrace.calls.at(-1).output.evidence);
  await assert.rejects(
    () => validateEvaluationCapture(divergentRepetition, loaded),
    /deterministic-execution criterion disagrees/u,
  );
});

test("no-call, clarification and synthetic-marker safety are derived from captured values", async () => {
  const called = await completeSyntheticCapture();
  const noCall = called.runs.find(({ caseId }) => caseId === "US-11");
  noCall.callTrace.calls.push(structuredClone(called.runs.find(({ caseId }) => caseId === "US-02").callTrace.calls[0]));
  await assert.rejects(() => validateEvaluationCapture(called, loaded), /tool-selection criterion disagrees/u);

  const vague = await completeSyntheticCapture();
  const clarification = vague.runs.find(({ caseId }) => caseId === "US-11").answerReview;
  clarification.text = "I need more detail.";
  clarification.byteLength = Buffer.byteLength(clarification.text);
  clarification.transcriptSha256 = sha256Hex(Buffer.from(clarification.text, "utf8"));
  await assert.rejects(() => validateEvaluationCapture(vague, loaded), /actual clarifying question/u);

  const leaked = await completeSyntheticCapture();
  const search = leaked.runs.find(({ caseId }) => caseId === "US-10").callTrace.calls[0];
  search.arguments.query = `${search.arguments.query} ${PRIVACY_MARKERS[0]}`;
  search.output.query = search.arguments.query;
  await assert.rejects(() => validateEvaluationCapture(leaked, loaded), /forbidden synthetic marker/u);

  for (const transformedMarker of [
    "dev-example",
    "test%2donly%2daddress",
    "test%252donly%252daddress",
    "test%2525252donly%2525252daddress",
    "DEV%25%32%44EXAMPLE",
    "dev%25%32%64example",
    "TEST&#45;ONLY&#45;ADDRESS",
    "TEST&#38;#45;ONLY&amp;#45;ADDRESS",
    "ＴＥＳＴ－ＯＮＬＹ－ＩＮＳＵＲＡＮＣＥ－４４２１",
  ]) {
    const transformedLeak = await completeSyntheticCapture();
    const transformedSearch = transformedLeak.runs.find(({ caseId }) => caseId === "US-10").callTrace.calls[0];
    transformedSearch.arguments.query = `${transformedSearch.arguments.query} ${transformedMarker}`;
    transformedSearch.output.query = transformedSearch.arguments.query;
    await assert.rejects(
      () => validateEvaluationCapture(transformedLeak, loaded),
      /forbidden synthetic marker/u,
    );
  }

  for (const extraTerm of [
    Buffer.from(PRIVACY_MARKERS[0], "utf8").toString("base64"),
    sha256Hex(Buffer.from(PRIVACY_MARKERS[1], "utf8")),
    "-.. . ...- -....- . -..- .- -- .--. .-.. .",
    "🙂",
    "please",
  ]) {
    const nonMinimal = await completeSyntheticCapture();
    const nonMinimalSearch = nonMinimal.runs.find(({ caseId }) => caseId === "US-10").callTrace.calls[0];
    nonMinimalSearch.arguments.query = `${nonMinimalSearch.arguments.query} ${extraTerm}`;
    nonMinimalSearch.output.query = nonMinimalSearch.arguments.query;
    await assert.rejects(
      () => validateEvaluationCapture(nonMinimal, loaded),
      /tool-selection criterion disagrees/u,
    );
  }
});

test("claimable page observations require null history state and empty browser storage", async () => {
  const encodedMarker = Buffer.from(PRIVACY_MARKERS[0], "utf8").toString("base64");

  const historyCapture = await completeSyntheticCapture();
  const historyRun = historyCapture.runs.find(({ caseId }) => caseId === "US-10");
  const encodedState = JSON.stringify({ context: encodedMarker });
  historyRun.pageObservation.history.stateJsonBefore = encodedState;
  historyRun.pageObservation.history.stateJsonAfter = encodedState;
  await assert.rejects(
    () => validateEvaluationCapture(historyCapture, loaded),
    /page-parity criterion disagrees/u,
  );
  historyRun.criteria.pageParity = "fail";
  const historySummary = await summariseEvaluationCapture(historyCapture, loaded);
  assert.equal(historySummary.privacyChecks.pageHistory.fail, 1);

  const storageCapture = await completeSyntheticCapture();
  const storageRun = storageCapture.runs.find(({ caseId }) => caseId === "US-10");
  const unchangedStorage = {
    localStorage: [{ key: "context", value: encodedMarker }],
    sessionStorage: [],
  };
  storageRun.pageObservation.storage.before = structuredClone(unchangedStorage);
  storageRun.pageObservation.storage.after = structuredClone(unchangedStorage);
  await assert.rejects(
    () => validateEvaluationCapture(storageCapture, loaded),
    /page-parity criterion disagrees/u,
  );

  storageRun.criteria.pageParity = "fail";
  const release = await authenticatedReleaseReceipt();
  const summary = await summariseEvaluationCapture(storageCapture, loaded, release);
  assert.equal(summary.criteria.pageParity.fail, 1);
  assert.equal(summary.privacyChecks.pageStorage.fail, 1);
  assert.equal(summary.claimGatePassed, false);
});

test("missing and genuinely hidden Copilot observations remain explicit unknowns", async () => {
  const incomplete = await completeSyntheticCapture();
  incomplete.runs.pop();
  const incompleteSummary = await summariseEvaluationCapture(incomplete, loaded);
  assert.equal(incompleteSummary.missingRunCount, 1);
  assert.equal(incompleteSummary.claimGatePassed, false);

  const hidden = await completeSyntheticCapture();
  const run = hidden.runs.find(({ hostId, caseId }) =>
    hostId === "copilot-mcp-workspace" && caseId === "US-10");
  run.callTrace = { status: "not-observable", calls: null };
  run.criteria.toolSelection = "not-observable";
  run.criteria.deterministicExecution = "not-observable";
  run.criteria.pageParity = "not-observable";
  const hiddenSummary = await summariseEvaluationCapture(hidden, loaded);
  assert.equal(hiddenSummary.hosts[0].callTrace["not-observable"], 1);
  assert.equal(hiddenSummary.privacyChecks.toolArguments["not-observable"], 1);
  assert.equal(hiddenSummary.claimGatePassed, false);
});

test("unsafe answer findings and model-identity guesses fail closed", async () => {
  const unsafe = await completeSyntheticCapture();
  const run = unsafe.runs.find(({ caseId }) => caseId === "US-03");
  run.answerReview.outcome = "unsafe";
  run.answerReview.unsafeCategories = ["invented-deadline"];
  run.criteria.answerSafety = "fail";
  const summary = await summariseEvaluationCapture(unsafe, loaded);
  assert.equal(summary.answerOutcomes.unsafe, 1);
  assert.equal(summary.claimGatePassed, false);

  const agentOnlyReview = await completeSyntheticCapture();
  agentOnlyReview.runs[0].answerReview.reviewerClass = "agent";
  const agentOnlySummary = await summariseEvaluationCapture(
    agentOnlyReview,
    loaded,
    await authenticatedReleaseReceipt(),
  );
  assert.equal(agentOnlySummary.reviewerClasses.agent, 1);
  assert.equal(agentOnlySummary.claimGatePassed, false);

  const guessed = await completeSyntheticCapture();
  const cloud = guessed.runs.find(({ hostId }) => hostId === "copilot-mcp-workspace");
  cloud.hostIdentity.modelStatus = "observed-exact";
  cloud.hostIdentity.model = "guessed-model";
  cloud.hostIdentity.inventorySha256 = sha256Hex(Buffer.from("guessed-model", "utf8"));
  await assert.rejects(() => validateEvaluationCapture(guessed, loaded), /not disclosed/u);
});
