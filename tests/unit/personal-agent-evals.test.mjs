import assert from "node:assert/strict";
import { lstat, mkdir, readFile, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
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
  inspectEvaluationGitCheckout,
  parseGitNameStatusZ,
  summariseEvaluationCapture,
  validateEvidenceDescendantChanges,
  validateEvaluationCheckoutIdentity,
  validateEvaluationCapture,
  validateLiveReleaseReceipt,
  verifyEvaluationCapture,
} from "../../scripts/verify-personal-agent-evals.mjs";
import {
  LIVE_PAGES_LIMITS,
  authenticateLivePagesReceipt,
  disposeAuthenticatedLivePagesReceipt,
  isAuthenticatedLivePagesReceipt,
} from "../../scripts/verify-live-pages-artifact.mjs";
import {
  convertPersonalAgentReport,
  createPrivateEvaluationRunDirectory,
  readSingleJsonReport,
  runCommand,
} from "../../scripts/run-personal-agent-evals.mjs";
import {
  createPrivateMergedEvaluationRunDirectory,
  mergePersonalAgentCaptures,
  writePrivateJsonExclusive,
} from "../../scripts/import-copilot-personal-agent-capture.mjs";

const loaded = await loadAndValidateCaseSet();
const readData = (name) => readFile(new URL(`../../app/data/${name}`, import.meta.url), "utf8");
const digestJson = (value) => sha256Hex(Buffer.from(canonicalJson(value), "utf8"));
const LIVE_COMMIT = "a".repeat(40);
const PUBLIC_URL = "https://chris-page-gov.github.io/govuk-webmcp/";

test("private personal-agent output rejects symlinked confidentiality roots", async (context) => {
  const parent = await mkdtemp(join(tmpdir(), "govuk-webmcp-private-output-"));
  context.after(() => rm(parent, { recursive: true, force: true }));
  const outside = join(parent, "outside");
  await mkdir(outside);

  const symlinkedEvalsRoot = join(parent, "repo-evals-link");
  await mkdir(symlinkedEvalsRoot);
  await symlink(outside, join(symlinkedEvalsRoot, ".evals"));
  await assert.rejects(
    createPrivateEvaluationRunDirectory("2026-09-02T00:00:00.000Z", symlinkedEvalsRoot),
    /private \.evals directory.*non-symbolic/u,
  );

  const symlinkedOutputRoot = join(parent, "repo-output-link");
  await mkdir(join(symlinkedOutputRoot, ".evals"), { recursive: true });
  await symlink(outside, join(symlinkedOutputRoot, ".evals", "personal-agent-local"));
  await assert.rejects(
    createPrivateEvaluationRunDirectory("2026-09-02T00:00:01.000Z", symlinkedOutputRoot),
    /personal-agent output root.*non-symbolic/u,
  );

  const safeRoot = join(parent, "repo-safe");
  await mkdir(safeRoot);
  const runDirectory = await createPrivateEvaluationRunDirectory("2026-09-02T00:00:02.000Z", safeRoot);
  assert.match(runDirectory, /\.evals\/personal-agent-local\/2026-09-02T00-00-02-000Z-/u);
  await assert.rejects(
    createPrivateEvaluationRunDirectory("2026-09-02", safeRoot),
    /RFC 3339 UTC timestamp/u,
  );
  await assert.rejects(
    createPrivateEvaluationRunDirectory("2099-01-01T00:00:00Z", safeRoot),
    /five minutes in the future/u,
  );
});

test("private Copilot merge output rejects symlinked confidentiality roots and creates a fresh run child", async (context) => {
  const parent = await mkdtemp(join(tmpdir(), "govuk-webmcp-private-merge-"));
  context.after(() => rm(parent, { recursive: true, force: true }));
  const outside = join(parent, "outside");
  await mkdir(outside);
  const createdAt = new Date().toISOString();

  const symlinkedEvalsRoot = join(parent, "repo-evals-link");
  await mkdir(symlinkedEvalsRoot);
  await symlink(outside, join(symlinkedEvalsRoot, ".evals"));
  await assert.rejects(
    createPrivateMergedEvaluationRunDirectory(createdAt, symlinkedEvalsRoot, () => "evals-link"),
    /private merged \.evals directory.*non-symbolic/u,
  );

  const symlinkedOutputRoot = join(parent, "repo-output-link");
  await mkdir(join(symlinkedOutputRoot, ".evals"), { recursive: true });
  await symlink(outside, join(symlinkedOutputRoot, ".evals", "personal-agent-merged"));
  await assert.rejects(
    createPrivateMergedEvaluationRunDirectory(createdAt, symlinkedOutputRoot, () => "output-link"),
    /private merged personal-agent output root.*non-symbolic/u,
  );

  const safeRoot = join(parent, "repo-safe");
  await mkdir(safeRoot);
  const runDirectory = await createPrivateMergedEvaluationRunDirectory(createdAt, safeRoot, () => "fixed-run");
  assert.match(runDirectory, /\.evals\/personal-agent-merged\/.*-fixed-run$/u);
  const state = await lstat(runDirectory);
  assert.equal(state.isDirectory() && !state.isSymbolicLink(), true);
  await assert.rejects(
    createPrivateMergedEvaluationRunDirectory(createdAt, safeRoot, () => "fixed-run"),
    /EEXIST/u,
  );
});

test("private Copilot merge output writes with no-follow, no-clobber file semantics", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-private-merge-files-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const outside = join(root, "outside.json");
  const linkedOutput = join(root, "private-capture.json");
  const existingOutput = join(root, "public-summary.json");
  await writeFile(outside, "outside remains\n");
  await symlink(outside, linkedOutput);
  await writeFile(existingOutput, "existing remains\n");

  await assert.rejects(
    writePrivateJsonExclusive(linkedOutput, { private: true }, "The private capture"),
    /EEXIST/u,
  );
  await assert.rejects(
    writePrivateJsonExclusive(existingOutput, { summary: true }, "The public summary"),
    /EEXIST/u,
  );
  assert.equal(await readFile(outside, "utf8"), "outside remains\n");
  assert.equal(await readFile(existingOutput, "utf8"), "existing remains\n");
});

test("local evaluator report admission rejects a child-created symbolic output", async (context) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-private-evaluator-report-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const outside = join(root, "outside.json");
  const report = join(root, "report-1.json");
  await writeFile(outside, '{"outside":true}\n', { mode: 0o600 });
  await symlink(outside, report);

  await assert.rejects(
    readSingleJsonReport(root),
    /local evaluator JSON report.*regular non-symbolic/u,
  );
  assert.equal(await readFile(outside, "utf8"), '{"outside":true}\n');
  assert.equal((await lstat(outside)).mode & 0o777, 0o600);
});

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
  freshObservedAt = "2026-09-01T13:00:00.000Z",
) {
  return authenticateEvaluationReleaseReceipt(candidate, {
    authenticateImplementation: (value) => authenticateLivePagesReceipt(
      value,
      async () => ({
        receipt: {
          ...structuredClone(value),
          observedAt: freshObservedAt,
        },
      }),
    ),
    gitIdentityImplementation: async () => ({ commit: candidate.commit, status: "" }),
    localBindingImplementation: async (value) => value,
    runtimeSnapshotImplementation,
  });
}

function cleanEvidenceIdentity(overrides = {}) {
  return {
    commit: "b".repeat(40),
    status: "",
    productIsAncestor: true,
    changedEntries: [{ status: "M", paths: ["docs/competition/evidence/example.json"] }],
    ...overrides,
  };
}

test("evaluation checkout policy defaults to the exact clean Pages commit", () => {
  assert.equal(
    validateEvaluationCheckoutIdentity(
      { commit: LIVE_COMMIT, status: "" },
      LIVE_COMMIT,
    ).commit,
    LIVE_COMMIT,
  );
  assert.throws(
    () => validateEvaluationCheckoutIdentity(cleanEvidenceIdentity(), LIVE_COMMIT),
    /exact Pages commit/u,
  );
  assert.equal(
    validateEvaluationCheckoutIdentity({
      commit: LIVE_COMMIT,
      status: "",
      productIsAncestor: true,
      changedEntries: [],
    }, LIVE_COMMIT, "clean-evidence-descendant").commit,
    LIVE_COMMIT,
  );
});

test("clean evidence descendants admit only documentation and exact VoiceOver release assets", () => {
  const paths = [
    "docs/competition/evidence/live.json",
    "CHANGELOG.md",
    "SECURITY.md",
    "output/demo-clips/v0.4.0-rc.1/06-voiceover.mov",
    "output/voiceover-capture/v0.4.0-rc.1-capture-manifest.json",
    "output/voiceover-capture/v0.4.0-rc.1-frame-01-page-title-and-headings.png",
    "output/voiceover-capture/v0.4.0-rc.1-frame-09-focus-restoration.png",
  ];
  const identity = cleanEvidenceIdentity({
    changedEntries: paths.map((path, index) => ({
      status: index % 2 === 0 ? "A" : "M",
      paths: [path],
    })),
  });
  assert.equal(
    validateEvaluationCheckoutIdentity(identity, LIVE_COMMIT, "clean-evidence-descendant").changes.length,
    paths.length,
  );

  for (const path of [
    "AGENTS.md",
    ".github/workflows/ci.yml",
    "package.json",
    "scripts/verify-personal-agent-evals.mjs",
    "src/application-actions.ts",
    "output/demo-clips/v0.4.0-rc.1/04-copilot-personal-ai.mov",
    "output/demo-clips/v0.4.0-rc.1/06-voiceover.mp4",
    "output/voiceover-capture/v0.4.0-rc.1-frame-10-focus-restoration.png",
    "docs/competition/demo-video-script-v0.4.0-rc.1.json",
    "docs/competition/run-review.mjs",
    "docs/competition/review.html",
  ]) {
    assert.throws(
      () => validateEvidenceDescendantChanges([{ status: "M", paths: [path] }]),
      /page-runtime or unapproved path/u,
    );
  }
  for (const entry of [
    { status: "D", paths: ["README.md"] },
    { status: "T", paths: ["docs/example.md"] },
    { status: "R100", paths: ["docs/old.md", "docs/new.md"] },
    { status: "C100", paths: ["docs/old.md", "docs/new.md"] },
    { status: "Z", paths: ["docs/example.md"] },
  ]) {
    assert.throws(
      () => validateEvidenceDescendantChanges([entry]),
      /rejected change status/u,
    );
  }
  for (const path of ["/docs/example.md", "docs\\example.md", "docs//example.md", "docs/../README.md"]) {
    assert.throws(
      () => validateEvidenceDescendantChanges([{ status: "M", paths: [path] }]),
      /non-canonical repository path/u,
    );
  }
  assert.throws(
    () => validateEvaluationCheckoutIdentity(
      cleanEvidenceIdentity({ status: "M docs/example.md" }),
      LIVE_COMMIT,
      "clean-evidence-descendant",
    ),
    /clean checkout/u,
  );
  assert.throws(
    () => validateEvaluationCheckoutIdentity(
      cleanEvidenceIdentity({ productIsAncestor: false }),
      LIVE_COMMIT,
      "clean-evidence-descendant",
    ),
    /not an ancestor/u,
  );
});

test("NUL-safe Git diff parsing preserves unusual valid paths and rejects malformed bytes", () => {
  assert.deepEqual(
    parseGitNameStatusZ(Buffer.from("M\0docs/name with space.md\0A\0docs/tab\tand\nline.md\0", "utf8")),
    [
      { status: "M", paths: ["docs/name with space.md"] },
      { status: "A", paths: ["docs/tab\tand\nline.md"] },
    ],
  );
  assert.deepEqual(
    parseGitNameStatusZ(Buffer.from("R100\0docs/old.md\0docs/new.md\0", "utf8")),
    [{ status: "R100", paths: ["docs/old.md", "docs/new.md"] }],
  );
  assert.throws(() => parseGitNameStatusZ(Buffer.from("M\0docs/example.md", "utf8")), /NUL terminated/u);
  assert.throws(() => parseGitNameStatusZ(Buffer.from([0x4d, 0x00, 0xff, 0x00])), /valid UTF-8/u);
  assert.throws(() => parseGitNameStatusZ(Buffer.from("R100\0docs/old.md\0", "utf8")), /truncated/u);
});

test("Git checkout inspection rejects an internal HEAD change", async () => {
  let headReads = 0;
  await assert.rejects(
    inspectEvaluationGitCheckout(LIVE_COMMIT, {
      repositoryPath: "/unused/unit/repository",
      async execImplementation(_command, args) {
        if (args[0] === "rev-parse") {
          headReads += 1;
          return { stdout: Buffer.from(`${headReads === 1 ? LIVE_COMMIT : "b".repeat(40)}\n`, "utf8") };
        }
        if (args[0] === "status" || args[0] === "diff") return { stdout: Buffer.alloc(0) };
        if (args[0] === "merge-base") return { stdout: Buffer.alloc(0) };
        throw new Error(`Unexpected Git test command ${args[0]}`);
      },
    }),
    /HEAD changed while/u,
  );
});

test("Git checkout inspection rejects an invalid product commit before execution", async () => {
  let executed = false;
  await assert.rejects(
    inspectEvaluationGitCheckout("--is-ancestor", {
      repositoryPath: "/unused/unit/repository",
      async execImplementation() {
        executed = true;
        throw new Error("Git must not execute for an invalid product commit.");
      },
    }),
    /product commit is not an exact lowercase commit/u,
  );
  assert.equal(executed, false);
});

test("evidence-descendant authentication pins one clean HEAD through authentication and replay", async () => {
  const receipt = liveReleaseReceipt();
  const runtimeSnapshotImplementation = async () => ({
    runtimeFactory: createPersonalAgentCanonicalRuntime,
    verifyGeneratedArtifacts: async () => {},
    revalidate: async () => {},
    dispose: async () => {},
  });
  const freshAuthentication = (value) => authenticateLivePagesReceipt(
    value,
    async () => ({
      receipt: {
        ...structuredClone(value),
        observedAt: "2026-09-02T00:00:00.000Z",
      },
    }),
  );

  let changedDuringAuthenticationCalls = 0;
  await assert.rejects(
    authenticateEvaluationReleaseReceipt(receipt, {
      authenticateImplementation: freshAuthentication,
      checkoutPolicy: "clean-evidence-descendant",
      gitIdentityImplementation: async () => {
        changedDuringAuthenticationCalls += 1;
        return cleanEvidenceIdentity({
          commit: changedDuringAuthenticationCalls === 1 ? "b".repeat(40) : "c".repeat(40),
        });
      },
      localBindingImplementation: async () => {},
      runtimeSnapshotImplementation,
    }),
    /checkout changed while the evaluation release/u,
  );

  let replayIdentityCalls = 0;
  const authenticated = await authenticateEvaluationReleaseReceipt(receipt, {
    authenticateImplementation: freshAuthentication,
    checkoutPolicy: "clean-evidence-descendant",
    gitIdentityImplementation: async () => {
      replayIdentityCalls += 1;
      return cleanEvidenceIdentity({
        commit: replayIdentityCalls <= 2 ? "b".repeat(40) : "c".repeat(40),
      });
    },
    localBindingImplementation: async () => {},
    runtimeSnapshotImplementation,
  });
  await assert.rejects(
    summariseEvaluationCapture(await completeSyntheticCapture(), loaded, authenticated),
    /checkout changed while the evaluation capture/u,
  );
  await disposeEvaluationReleaseReceipt(authenticated);
});

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

function executionContext(hostId, interactionSteps = 1) {
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
    diagnostics: {
      browserConsole: { status: "observed", errors: [] },
      pageErrors: { status: "observed", errors: [] },
      networkErrors: { status: "observed", errors: [] },
      runnerErrors: { status: "observed", errors: [] },
    },
    measurements: {
      interactionSteps: { status: "observed", value: interactionSteps },
      latencyMilliseconds: { status: "observed", value: 250 },
    },
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
            executionContext: executionContext(hostId, Math.max(1, execution.calls.length)),
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

async function completeLocalAdapterReport() {
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
  return {
    config: {
      backend: "vercel",
      model: LOCAL_MODEL,
      runs: 3,
      maxSteps: 6,
      url: "http://127.0.0.1:4173/",
    },
    results: { testCount: 36, passCount: rows.length, failCount: 0, errorCount: 0, results: rows },
  };
}

test("evaluation capture timestamps are strict, bounded and chronological", async () => {
  const future = await completeSyntheticCapture();
  future.createdAt = "2099-01-01T00:00:00Z";
  for (const run of future.runs) run.observedAt = "2099-01-01T00:00:00Z";
  await assert.rejects(() => validateEvaluationCapture(future, loaded), /five minutes in the future/u);

  const reversed = await completeSyntheticCapture();
  reversed.runs[0].observedAt = "2026-09-01T13:00:01Z";
  await assert.rejects(
    () => validateEvaluationCapture(reversed, loaded),
    /observedAt must not be later than the capture createdAt/u,
  );
});

test("authenticated capture chronology is enclosed by the retained pre-run and fresh observations", async (context) => {
  const authenticated = await authenticatedReleaseReceipt();
  context.after(() => disposeEvaluationReleaseReceipt(authenticated));

  const beforePreRun = await completeSyntheticCapture();
  beforePreRun.runs[0].observedAt = "2026-09-01T11:59:59.999Z";
  await assert.rejects(
    () => summariseEvaluationCapture(beforePreRun, loaded, authenticated),
    /observedAt must not be earlier than the supplied pre-run live receipt observedAt/u,
  );

  const afterFreshAuthentication = await completeSyntheticCapture();
  afterFreshAuthentication.createdAt = "2026-09-01T13:00:00.001Z";
  afterFreshAuthentication.runs[0].observedAt = "2026-09-01T13:00:00.001Z";
  await assert.rejects(
    () => summariseEvaluationCapture(afterFreshAuthentication, loaded, authenticated),
    /observedAt must not be later than the fresh live authentication observedAt/u,
  );

  const boundaryEquality = await completeSyntheticCapture();
  boundaryEquality.runs[0].observedAt = "2026-09-01T12:00:00.000Z";
  boundaryEquality.runs[1].observedAt = "2026-09-01T13:00:00.000Z";
  const boundarySummary = await summariseEvaluationCapture(boundaryEquality, loaded, authenticated);
  assert.equal(boundarySummary.liveReleaseBinding.status, "authenticated");
  assert.equal(boundarySummary.claimGatePassed, true);

  const structurallyValidOnly = await summariseEvaluationCapture(
    beforePreRun,
    loaded,
    liveReleaseReceipt(),
  );
  assert.equal(structurallyValidOnly.liveReleaseBinding.status, "structurally-valid");
  assert.equal(structurallyValidOnly.claimGatePassed, false);
});

test("the authored case set and private capture contract are closed and complete", async () => {
  assert.equal(loaded.caseSet.cases.length, 12);
  assert.equal(loaded.captureSchema.$id, "urn:govuk-webmcp:schema:personal-agent-evaluation-capture:v3");
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

test("imported captures reject deeply nested attempted arguments before recursive schema validation", async () => {
  const capture = await completeSyntheticCapture();
  const run = capture.runs.find(({ callTrace }) => callTrace.status === "observed" && callTrace.calls.length > 0);
  let nested = true;
  for (let depth = 0; depth < 2_048; depth += 1) nested = { nested };
  run.callTrace.calls[0].arguments = nested;
  run.callTrace.calls[0].output = {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code: "invalid_search_request", message: "Rejected.", details: {} },
    limitations: ["No substitute source was selected."],
  };
  await assert.rejects(
    () => validateEvaluationCapture(capture, loaded),
    (error) => error instanceof Error
      && !(error instanceof RangeError)
      && /unbounded attempted tool argument/u.test(error.message),
  );
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
  const report = await completeLocalAdapterReport();
  const capture = await convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z");
  assert.equal(capture.runs.length, 36);
  assert.ok(capture.runs.every(({ pageObservation }) => pageObservation.status === "not-observable"));
  assert.ok(capture.runs.every(({ answerReview }) => answerReview.status === "captured-unreviewed"));
  const summary = await summariseEvaluationCapture(capture, loaded);
  assert.equal(summary.evidenceStatus, "partial");
  assert.equal(summary.executionContext.incomplete, 36);
  assert.equal(summary.claimGatePassed, false);
  assert.deepEqual(summary.hosts[1].diagnosticDimensions.browserConsole, {
    observedClean: 0,
    observedWithErrors: 0,
    notObservable: 36,
  });
  assert.deepEqual(summary.hosts[1].diagnosticDimensions.runnerErrors, {
    observedClean: 36,
    observedWithErrors: 0,
    notObservable: 0,
  });
  assert.equal(summary.hosts[1].measurements.interactionSteps.observed, 36);
  assert.equal(summary.hosts[1].measurements.interactionSteps.notObservable, 0);
  assert.equal(summary.hosts[1].measurements.interactionSteps.minimum, 1);
  assert.equal(summary.hosts[1].measurements.interactionSteps.maximum, 2);
  assert.deepEqual(summary.hosts[1].measurements.latencyMilliseconds, {
    observed: 0,
    notObservable: 36,
    minimum: null,
    maximum: null,
  });
  assert.ok(capture.runs.every(({ executionContext }) =>
    executionContext.diagnostics.browserConsole.status === "not-observable"
    && executionContext.diagnostics.pageErrors.status === "not-observable"
    && executionContext.diagnostics.networkErrors.status === "not-observable"
    && executionContext.diagnostics.runnerErrors.status === "observed"
    && executionContext.measurements.interactionSteps.status === "observed"
    && executionContext.measurements.latencyMilliseconds.status === "not-observable"));
  for (const run of capture.runs) {
    const fixtureName = `${run.caseId} ${loaded.caseSet.cases.find(({ id }) => id === run.caseId).title}`;
    const rowCount = report.results.results.filter(({ test: test_, runIndex }) =>
      test_.name === fixtureName && runIndex === run.repetition).length;
    assert.equal(run.executionContext.measurements.interactionSteps.value, rowCount);
  }

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

test("the local adapter rejects a seven-step case even when the aggregate report remains bounded", async () => {
  const report = await completeLocalAdapterReport();
  const evalCase = loaded.caseSet.cases.find(({ id }) => id === "US-02");
  const fixtureName = `${evalCase.id} ${evalCase.title}`;
  const existing = report.results.results
    .filter((row) => row.test.name === fixtureName && row.runIndex === 1)
    .sort((left, right) => left.stepIndex - right.stepIndex);
  assert.equal(existing.length, 2);
  const extraRows = Array.from({ length: 5 }, (_, index) => ({
    ...structuredClone(existing.at(-1)),
    response: { text: `Bounded non-call step ${String(index + 3)}.` },
    trajectory: [{ text: `Bounded non-call step ${String(index + 3)}.` }],
    stepIndex: index + 3,
  }));
  report.results.results.push(...extraRows);
  report.results.passCount += extraRows.length;
  assert.ok(report.results.results.length < 12 * 3 * 6);
  await assert.rejects(
    () => convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z"),
    /bounded six-step case trajectory/u,
  );
});

test("the local adapter records unavailable and missing-result attempts without admitting them", async () => {
  const report = await completeLocalAdapterReport();
  const name = loaded.caseSet.cases.find(({ id }) => id === "US-02");
  const fixtureName = `${name.id} ${name.title}`;
  const existing = report.results.results
    .filter((row) => row.test.name === fixtureName && row.runIndex === 1)
    .sort((left, right) => left.stepIndex - right.stepIndex);
  assert.equal(existing.length, 2);

  const unavailable = structuredClone(existing[0]);
  unavailable.stepIndex = 2;
  unavailable.outcome = "fail";
  unavailable.response = {
    functionName: "search_government_analysis",
    args: { value: "unavailable" },
    result: null,
  };
  const missingResult = structuredClone(existing[0]);
  missingResult.stepIndex = 3;
  missingResult.outcome = "fail";
  missingResult.response = {
    functionName: "show_provenance",
    args: {
      recordId: "govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114",
    },
    result: null,
  };
  existing[1].stepIndex = 4;
  report.results.results = [
    ...report.results.results.filter((row) =>
      row.test.name !== fixtureName || row.runIndex !== 1),
    existing[0],
    unavailable,
    missingResult,
    existing[1],
  ];
  report.results.failCount += 2;

  const capture = await convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z");
  const run = capture.runs.find(({ caseId, repetition }) => caseId === "US-02" && repetition === 1);
  assert.deepEqual(
    run.callTrace.calls.map(({ name: toolName }) => toolName),
    ["search_government_knowledge", "present_resource_evidence"],
  );
  assert.deepEqual(run.executionContext.diagnostics.runnerErrors.errors, [
    "Model tool attempt at step 2 named an unavailable page tool.",
    "Model tool attempt at step 3 did not return an exact executable result.",
  ]);
  assert.equal(run.criteria.toolSelection, "fail");
  assert.equal(run.criteria.deterministicExecution, "fail");
});

test("the local adapter retains deterministically rejected closed-schema calls as exact failures", async () => {
  const report = await completeLocalAdapterReport();
  const fixtureName = `${loaded.caseSet.cases.find(({ id }) => id === "US-02").id} ${loaded.caseSet.cases.find(({ id }) => id === "US-02").title}`;
  const row = report.results.results.find(({ test: test_, runIndex, stepIndex }) =>
    test_.name === fixtureName && runIndex === 1 && stepIndex === 1);
  row.response.args = { query: "house prices", unexpected: "record exactly as rejected" };
  row.response.result = {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: {
      code: "invalid_search_request",
      message: "The search input contains an unknown field.",
      details: {},
    },
    limitations: [
      "No substitute source was selected.",
      "No official API, model provider or personal context was contacted.",
    ],
  };
  row.outcome = "fail";

  const capture = await convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z");
  const run = capture.runs.find(({ caseId, repetition }) => caseId === "US-02" && repetition === 1);
  assert.deepEqual(run.callTrace.calls[0].arguments, row.response.args);
  assert.deepEqual(run.callTrace.calls[0].output, row.response.result);
  assert.equal(run.criteria.toolSelection, "fail");
  assert.equal(run.criteria.deterministicExecution, "fail");
  const summary = await summariseEvaluationCapture(capture, loaded);
  assert.equal(summary.claimGatePassed, false);
  assert.equal(JSON.stringify(summary).includes("record exactly as rejected"), false);
});

test("the local adapter classifies a valid-input deterministic error in only the rejected-call branch", async () => {
  const report = await completeLocalAdapterReport();
  const fixtureName = `${loaded.caseSet.cases.find(({ id }) => id === "US-04").id} ${loaded.caseSet.cases.find(({ id }) => id === "US-04").title}`;
  const row = report.results.results.find(({ test: test_, runIndex }) =>
    test_.name === fixtureName && runIndex === 1);
  row.response.functionName = "get_resource_record";
  row.response.args = {
    recordId: "govuk-discovery:govuk-content:ae6c8a6e-2c70-4d54-a3d2-1c2b5a0a2db6",
  };
  row.response.result = {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: {
      code: "record_not_found",
      message: "No catalogue record matched the supplied identifier.",
      details: { recordId: row.response.args.recordId },
    },
    limitations: ["No substitute record was selected."],
  };
  row.outcome = "fail";

  const capture = await convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z");
  const run = capture.runs.find(({ caseId, repetition }) => caseId === "US-04" && repetition === 1);
  const retained = run.callTrace.calls.find(({ ordinal }) => ordinal === row.stepIndex);
  assert.equal(retained.name, "get_resource_record");
  assert.deepEqual(retained.arguments, row.response.args);
  assert.deepEqual(retained.output, row.response.result);
  assert.equal(run.criteria.toolSelection, "fail");
  assert.equal(run.criteria.deterministicExecution, "fail");
});

test("the local adapter refuses unbounded rejected-call arguments before receipt validation", async () => {
  const report = await completeLocalAdapterReport();
  const row = report.results.results.find(({ response }) => response?.functionName);
  row.response.args = { query: "x", nested: { a: { b: { c: { d: { e: { f: { g: { h: { i: true } } } } } } } } } };
  row.response.result = {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code: "invalid_search_request", message: "Rejected.", details: {} },
    limitations: ["No substitute source was selected."],
  };
  await assert.rejects(
    () => convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z"),
    /unbounded attempted tool argument/u,
  );
});

test("the local adapter rejects a parallel-call trajectory above six attempts", async () => {
  const report = await completeLocalAdapterReport();
  const name = loaded.caseSet.cases.find(({ id }) => id === "US-01");
  const fixtureName = `${name.id} ${name.title}`;
  const original = report.results.results.find((row) =>
    row.test.name === fixtureName && row.runIndex === 1);
  const parallelToolCalls = Array.from({ length: 7 }, (_value, index) => ({
    toolCallId: `parallel-${String(index + 1)}`,
    toolName: original.response.functionName,
    input: structuredClone(original.response.args),
  }));
  const parallelRows = parallelToolCalls.map((_call, index) => ({
    ...structuredClone(original),
    stepIndex: index + 1,
    trajectory: [{
      ...structuredClone(original.trajectory[0]),
      toolCalls: structuredClone(parallelToolCalls),
    }],
  }));
  report.results.results = [
    ...report.results.results.filter((row) =>
      row.test.name !== fixtureName || row.runIndex !== 1),
    ...parallelRows,
  ];
  report.results.passCount += parallelRows.length - 1;

  await assert.rejects(
    () => convertPersonalAgentReport(report, loaded, "2026-09-01T14:00:00Z"),
    /bounded six-step case trajectory/u,
  );
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

  const unacknowledgedRunnerError = await completeSyntheticCapture();
  const unacknowledgedRun = unacknowledgedRunnerError.runs.find(({ hostId, caseId }) =>
    hostId === "ollama-local" && caseId === "US-02");
  unacknowledgedRun.executionContext.diagnostics.runnerErrors.errors.push(
    "Model tool attempt did not return an exact executable result.",
  );
  await assert.rejects(
    () => validateEvaluationCapture(unacknowledgedRunnerError, loaded),
    /tool-selection criterion disagrees/u,
  );

  const acknowledgedRunnerError = structuredClone(unacknowledgedRunnerError);
  const acknowledgedRun = acknowledgedRunnerError.runs.find(({ hostId, caseId }) =>
    hostId === "ollama-local" && caseId === "US-02");
  acknowledgedRun.criteria.toolSelection = "fail";
  acknowledgedRun.criteria.deterministicExecution = "fail";
  const diagnosticSummary = await summariseEvaluationCapture(acknowledgedRunnerError, loaded);
  assert.equal(diagnosticSummary.criteria.toolSelection.fail, 1);
  assert.equal(diagnosticSummary.criteria.deterministicExecution.fail, 1);
  assert.equal(diagnosticSummary.executionContext.incomplete, 1);
  assert.equal(diagnosticSummary.claimGatePassed, false);
  assert.equal(
    JSON.stringify(diagnosticSummary).includes(
      "Model tool attempt did not return an exact executable result.",
    ),
    false,
  );

  const privateDiagnosticText = "Private browser diagnostic must stay private.";
  const browserDiagnostic = await completeSyntheticCapture();
  const browserDiagnosticRun = browserDiagnostic.runs.find(({ hostId, caseId }) =>
    hostId === "copilot-mcp-workspace" && caseId === "US-02");
  browserDiagnosticRun.executionContext.diagnostics.browserConsole.errors.push(privateDiagnosticText);
  const browserDiagnosticSummary = await summariseEvaluationCapture(browserDiagnostic, loaded);
  assert.equal(browserDiagnosticSummary.hosts[0].diagnosticDimensions.browserConsole.observedWithErrors, 1);
  assert.equal(browserDiagnosticSummary.executionContext.incomplete, 1);
  assert.equal(JSON.stringify(browserDiagnosticSummary).includes(privateDiagnosticText), false);

  for (const [field, value] of [
    ["interactionSteps", 0],
    ["interactionSteps", 7],
    ["latencyMilliseconds", 600001],
  ]) {
    const outOfRange = await completeSyntheticCapture();
    outOfRange.runs[0].executionContext.measurements[field].value = value;
    await assert.rejects(
      () => validateEvaluationCapture(outOfRange, loaded),
      /closed schema/u,
    );
  }

  const underCount = await completeSyntheticCapture();
  const underCountRun = underCount.runs.find(({ callTrace }) =>
    callTrace.status === "observed" && callTrace.calls.length > 1);
  underCountRun.executionContext.measurements.interactionSteps.value =
    underCountRun.callTrace.calls.length - 1;
  await assert.rejects(
    () => validateEvaluationCapture(underCount, loaded),
    /smaller than its observed tool-call count/u,
  );

  const sixStepBoundary = await completeSyntheticCapture();
  sixStepBoundary.runs[0].executionContext.measurements.interactionSteps.value = 6;
  await validateEvaluationCapture(sixStepBoundary, loaded);

  const inconsistentUnknown = await completeSyntheticCapture();
  inconsistentUnknown.runs[0].executionContext.diagnostics.networkErrors = {
    status: "not-observable",
    errors: [],
  };
  await assert.rejects(
    () => validateEvaluationCapture(inconsistentUnknown, loaded),
    /closed schema/u,
  );

  const unexpectedMetric = await completeSyntheticCapture();
  unexpectedMetric.runs[0].executionContext.measurements.modelTokens = {
    status: "observed",
    value: 1,
  };
  await assert.rejects(
    () => validateEvaluationCapture(unexpectedMetric, loaded),
    /closed schema/u,
  );

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

test("owned evaluation authentication is revoked on every failure and successful disposal", async () => {
  const receipt = liveReleaseReceipt();
  const successfulSnapshot = () => ({
    runtimeFactory: createPersonalAgentCanonicalRuntime,
    verifyGeneratedArtifacts: async () => {},
    revalidate: async () => {},
    dispose: async () => {},
  });

  async function expectOwnedFailureRevoked({
    expectedError,
    freshObservedAt = "2026-09-01T12:01:00.000Z",
    gitIdentityImplementation = async () => ({ commit: receipt.commit, status: "" }),
    localBindingImplementation = async (value) => value,
    runtimeSnapshotImplementation = async () => successfulSnapshot(),
  }) {
    let retainedObservation;
    await assert.rejects(
      () => authenticateEvaluationReleaseReceipt(receipt, {
        authenticateImplementation: async (value) => {
          retainedObservation = await authenticateLivePagesReceipt(
            value,
            async () => ({
              receipt: {
                ...structuredClone(value),
                observedAt: freshObservedAt,
              },
            }),
          );
          return retainedObservation;
        },
        gitIdentityImplementation,
        localBindingImplementation,
        runtimeSnapshotImplementation,
      }),
      expectedError,
    );
    assert.ok(retainedObservation);
    assert.equal(isAuthenticatedLivePagesReceipt(retainedObservation), false);
  }

  await expectOwnedFailureRevoked({
    freshObservedAt: "2026-09-01T11:59:59.999Z",
    expectedError: /earlier than the supplied pre-run receipt/u,
  });
  await expectOwnedFailureRevoked({
    expectedError: /Injected local binding failure/u,
    localBindingImplementation: async () => { throw new Error("Injected local binding failure."); },
  });
  await expectOwnedFailureRevoked({
    expectedError: /Injected runtime snapshot failure/u,
    runtimeSnapshotImplementation: async () => { throw new Error("Injected runtime snapshot failure."); },
  });
  await expectOwnedFailureRevoked({
    expectedError: /Injected context construction failure/u,
    runtimeSnapshotImplementation: async () => ({
      runtimeFactory: createPersonalAgentCanonicalRuntime,
      verifyGeneratedArtifacts: async () => {},
      revalidate: async () => {},
      get dispose() { throw new Error("Injected context construction failure."); },
    }),
  });

  let identityCalls = 0;
  let failedAuthenticationDisposals = 0;
  await expectOwnedFailureRevoked({
    expectedError: /Injected Git identity failure/u,
    gitIdentityImplementation: async () => {
      identityCalls += 1;
      if (identityCalls === 2) throw new Error("Injected Git identity failure.");
      return { commit: receipt.commit, status: "" };
    },
    runtimeSnapshotImplementation: async () => ({
      ...successfulSnapshot(),
      dispose: async () => { failedAuthenticationDisposals += 1; },
    }),
  });
  assert.equal(failedAuthenticationDisposals, 1);

  let retainedDuringFailureCleanup;
  let releaseFailureCleanup;
  let signalFailureCleanup;
  const failureCleanupGate = new Promise((resolveCleanup) => { releaseFailureCleanup = resolveCleanup; });
  const failureCleanupStarted = new Promise((resolveStarted) => { signalFailureCleanup = resolveStarted; });
  let gatedIdentityCalls = 0;
  const pendingAuthenticationFailure = authenticateEvaluationReleaseReceipt(receipt, {
    authenticateImplementation: async (value) => {
      retainedDuringFailureCleanup = await authenticateLivePagesReceipt(
        value,
        async () => ({
          receipt: {
            ...structuredClone(value),
            observedAt: "2026-09-01T12:01:00.000Z",
          },
        }),
      );
      return retainedDuringFailureCleanup;
    },
    gitIdentityImplementation: async () => {
      gatedIdentityCalls += 1;
      if (gatedIdentityCalls === 2) throw new Error("Gated Git identity failure.");
      return { commit: receipt.commit, status: "" };
    },
    localBindingImplementation: async (value) => value,
    runtimeSnapshotImplementation: async () => ({
      ...successfulSnapshot(),
      dispose: async () => {
        signalFailureCleanup();
        await failureCleanupGate;
        throw new Error("Gated runtime cleanup failure.");
      },
    }),
  });
  await failureCleanupStarted;
  assert.equal(isAuthenticatedLivePagesReceipt(retainedDuringFailureCleanup), false);
  releaseFailureCleanup();
  await assert.rejects(
    pendingAuthenticationFailure,
    (error) => error instanceof AggregateError
      && error.message === "Gated Git identity failure."
      && error.cause?.message === "Gated Git identity failure."
      && error.errors.some(({ message }) => message === "Gated runtime cleanup failure."),
  );

  const owned = await authenticatedReleaseReceipt();
  assert.equal(isAuthenticatedLivePagesReceipt(owned), true);
  assert.equal(await disposeEvaluationReleaseReceipt(owned), true);
  assert.equal(isAuthenticatedLivePagesReceipt(owned), false);
  assert.equal(await disposeEvaluationReleaseReceipt(owned), false);

  let releaseCleanup;
  const cleanupGate = new Promise((resolveCleanup) => { releaseCleanup = resolveCleanup; });
  const gated = await authenticatedReleaseReceipt(
    liveReleaseReceipt(),
    async () => ({
      ...successfulSnapshot(),
      dispose: async () => cleanupGate,
    }),
  );
  const pendingDisposal = disposeEvaluationReleaseReceipt(gated);
  assert.equal(isAuthenticatedLivePagesReceipt(gated), false);
  assert.equal(await disposeEvaluationReleaseReceipt(gated), false);
  releaseCleanup();
  assert.equal(await pendingDisposal, true);

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
  assert.equal(isAuthenticatedLivePagesReceipt(authenticated), false);
  assert.equal(cleanupCalls, 1);
  assert.equal(await disposeEvaluationReleaseReceipt(authenticated), false);
});

test("borrowed evaluation authentication remains valid until its outer owner revokes it", async () => {
  const receipt = liveReleaseReceipt();
  await assert.rejects(
    () => authenticateEvaluationReleaseReceipt(receipt, { liveReceiptLease: "shared" }),
    /must be owned or borrowed/u,
  );
  const borrowed = await authenticateLivePagesReceipt(
    receipt,
    async () => ({
      receipt: {
        ...structuredClone(receipt),
        observedAt: "2026-09-01T12:01:00.000Z",
      },
    }),
  );
  const evaluated = await authenticateEvaluationReleaseReceipt(receipt, {
    authenticateImplementation: async () => borrowed,
    gitIdentityImplementation: async () => ({ commit: receipt.commit, status: "" }),
    liveReceiptLease: "borrowed",
    localBindingImplementation: async (value) => value,
    runtimeSnapshotImplementation: async () => ({
      runtimeFactory: createPersonalAgentCanonicalRuntime,
      verifyGeneratedArtifacts: async () => {},
      revalidate: async () => {},
      dispose: async () => {},
    }),
  });
  assert.equal(evaluated, borrowed);
  assert.equal(await disposeEvaluationReleaseReceipt(evaluated), true);
  assert.equal(isAuthenticatedLivePagesReceipt(borrowed), true);
  assert.equal(disposeAuthenticatedLivePagesReceipt(borrowed), true);
  assert.equal(isAuthenticatedLivePagesReceipt(borrowed), false);
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
