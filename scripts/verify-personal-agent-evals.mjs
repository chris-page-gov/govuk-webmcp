#!/usr/bin/env node

import { execFile } from "node:child_process";
import { cp, lstat, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  PUBLIC_CAPTURE_TARGET,
} from "./lib/chrome-devtools-capture-target.mjs";
import {
  RELEASE_EVIDENCE_PATHS,
  RELEASE_VOICEOVER_FRAME_PATHS,
} from "./lib/release-evidence-paths.mjs";
import { parseUtcRfc3339Timestamp } from "./lib/rfc3339-timestamp.mjs";
import {
  authenticateLivePagesReceipt,
  disposeAuthenticatedLivePagesReceipt,
  isAuthenticatedLivePagesReceipt,
  livePagesReceiptBinding,
  validateLivePagesReceiptShape,
  validateLocalPagesBuildBinding,
} from "./verify-live-pages-artifact.mjs";
import {
  DEFAULT_CASE_SET_PATH,
  EXPECTED_RUN_COUNT,
  LOCAL_MODEL,
  LOCAL_MODEL_INVENTORY_SHA256,
  PRIVACY_MARKERS,
  RUNS_PER_STORY_PER_HOST,
  SUITE_ID,
  TOOL_NAMES,
  UNSAFE_CATEGORIES,
  buildGeneratedArtifacts,
  canonicalJson,
  checkGeneratedArtifacts,
  createPersonalAgentCanonicalRuntime,
  executePersonalAgentToolCall,
  loadAndValidateCaseSet,
  sha256Hex,
} from "./prepare-personal-agent-evals.mjs";

export const CAPTURE_SCHEMA = "govuk-webmcp.personal-agent-evaluation-capture.v3";
// Import-compatible alias for callers of the earlier digest-only test seam.
export const RECEIPT_SCHEMA = CAPTURE_SCHEMA;
const MAX_CAPTURE_BYTES = 64 * 1024 * 1024;
export const MAX_CAPTURED_ARGUMENT_BYTES = 32 * 1024;
export const MAX_CAPTURED_ARGUMENT_DEPTH = 8;
export const MAX_CAPTURED_ARGUMENT_NODES = 2_048;
const MAX_LIVE_RELEASE_RECEIPT_BYTES = 1024 * 1024;
const MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS = 5 * 60 * 1_000;
const GIT_COMMIT = /^[a-f0-9]{40}$/u;
const HOST_IDS = Object.freeze(["copilot-mcp-workspace", "ollama-local"]);
const PUBLISHABLE_BROWSER_VERSION = /^[0-9]{2,3}\.0\.[0-9]{1,6}\.[0-9]{1,6}$/u;
const CRITERION_STATUSES = new Set(["pass", "fail", "not-observable"]);
const ANSWER_CHECK_STATUSES = new Set(["pass", "fail", "not-observable"]);
const ANSWER_OUTCOMES = new Set(["usable", "revise", "unsafe"]);
const REVIEWER_CLASSES = new Set(["agent", "human", "domain-specialist"]);
const PRESENTATION_TOOLS = new Set([
  "explore_answer_foundations",
  "compare_evidence_foundations",
  "present_resource_evidence",
]);
const DIAGNOSTIC_DIMENSIONS = Object.freeze([
  "browserConsole",
  "pageErrors",
  "networkErrors",
  "runnerErrors",
]);
const MEASUREMENT_DIMENSIONS = Object.freeze([
  "interactionSteps",
  "latencyMilliseconds",
]);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const schemaDirectory = join(repositoryRoot, "schemas");
const captureValidators = new Map();
const evaluationAuthenticatedReceipts = new WeakMap();
const execFileAsync = promisify(execFile);
const CHECKOUT_POLICIES = new Set(["exact-pages-commit", "clean-evidence-descendant"]);
const EVIDENCE_DESCENDANT_TOP_LEVEL_PATHS = new Set([
  "ACCESSIBILITY.md",
  "CHANGELOG.md",
  "CODEX_HANDOVER.md",
  "DISCLAIMER.md",
  "NOTICE.md",
  "PRIVACY.md",
  "PROJECT_STATUS.md",
  "README.md",
  "SECURITY.md",
]);
const EVIDENCE_DESCENDANT_OUTPUT_PATHS = new Set([
  RELEASE_EVIDENCE_PATHS.voiceOverCaptureManifest,
  RELEASE_EVIDENCE_PATHS.voiceOverClip,
  ...RELEASE_VOICEOVER_FRAME_PATHS,
]);
const EVIDENCE_DESCENDANT_DOCUMENT_EXTENSIONS = new Set([".csv", ".md", ".vtt"]);

function assertEnum(value, allowed, label) {
  if (!allowed.has(value)) throw new Error(`${label} is not an admitted state.`);
}

function assertNoMarker(value, label) {
  const serialised = typeof value === "string" ? value : canonicalJson(value);
  let decoded = serialised;
  for (let round = 0; round < 8; round += 1) {
    const next = decoded.replace(/(?:%[0-9a-f]{2})+/giu, (encoded) => {
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    });
    if (next === decoded) break;
    decoded = next;
  }
  for (let round = 0; round < 8; round += 1) {
    const next = decoded
      .replace(/&#x([0-9a-f]{1,6});/giu, (_match, codePoint) =>
        String.fromCodePoint(Number.parseInt(codePoint, 16)))
      .replace(/&#([0-9]{1,7});/gu, (_match, codePoint) =>
        String.fromCodePoint(Number.parseInt(codePoint, 10)))
      .replace(/&(?:hyphen|minus);/giu, "-")
      .replace(/&amp;/giu, "&");
    if (next === decoded) break;
    decoded = next;
  }
  const collapsed = decoded
    .normalize("NFKC")
    .toLocaleLowerCase("en-GB")
    .replace(/[^\p{L}\p{N}]+/gu, "");
  for (const marker of PRIVACY_MARKERS) {
    const collapsedMarker = marker
      .normalize("NFKC")
      .toLocaleLowerCase("en-GB")
      .replace(/[^\p{L}\p{N}]+/gu, "");
    if (collapsed.includes(collapsedMarker)) {
      throw new Error(`${label} contains forbidden synthetic marker ${marker}.`);
    }
  }
}

function same(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function digestJson(value) {
  return sha256Hex(Buffer.from(canonicalJson(value), "utf8"));
}

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function assertBoundedCapturedArguments(value, label) {
  let nodes = 0;
  function visit(item, depth) {
    nodes += 1;
    if (nodes > MAX_CAPTURED_ARGUMENT_NODES || depth > MAX_CAPTURED_ARGUMENT_DEPTH) {
      throw new Error(`${label} has an unbounded attempted tool argument.`);
    }
    if (item === null || typeof item === "boolean") return;
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw new Error(`${label} has a non-finite attempted tool argument.`);
      return;
    }
    if (typeof item === "string") {
      if (item.length > 4_096) throw new Error(`${label} has an overlong attempted tool argument.`);
      return;
    }
    if (Array.isArray(item)) {
      if (item.length > 64) throw new Error(`${label} has too many attempted tool argument items.`);
      for (const child of item) visit(child, depth + 1);
      return;
    }
    if (!plainObject(item)) throw new Error(`${label} has a non-JSON attempted tool argument.`);
    const entries = Object.entries(item);
    if (entries.length > 32 || entries.some(([key]) => key.length > 128)) {
      throw new Error(`${label} has too many or overlong attempted tool argument fields.`);
    }
    for (const [, child] of entries) visit(child, depth + 1);
  }
  visit(value, 0);
  if (Buffer.byteLength(canonicalJson(value), "utf8") > MAX_CAPTURED_ARGUMENT_BYTES) {
    throw new Error(`${label} has an oversized attempted tool argument.`);
  }
}

function assertPreSchemaCaptureArgumentBudgets(capture) {
  if (!plainObject(capture) || !Array.isArray(capture.runs)) return;
  for (const run of capture.runs) {
    const calls = plainObject(run?.callTrace) ? run.callTrace.calls : null;
    if (!Array.isArray(calls)) continue;
    for (const call of calls) {
      if (plainObject(call) && Object.hasOwn(call, "arguments")) {
        assertBoundedCapturedArguments(call.arguments, String(run.caseId ?? "Evaluation capture"));
      }
    }
  }
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const validateLiveReleaseReceipt = validateLivePagesReceiptShape;

function asBuffer(value, label) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string") return Buffer.from(value, "utf8");
  throw new Error(`${label} did not return bytes.`);
}

function strictUtf8(bytes, label) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new Error(`${label} is not valid UTF-8.`, { cause: error });
  }
}

function nulFields(value, label) {
  const bytes = asBuffer(value, label);
  if (bytes.length === 0) return [];
  if (bytes.at(-1) !== 0) throw new Error(`${label} is not NUL terminated.`);
  const fields = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] !== 0) continue;
    fields.push(strictUtf8(bytes.subarray(start, index), label));
    start = index + 1;
  }
  return fields;
}

export function parseGitNameStatusZ(value) {
  const fields = nulFields(value, "The evidence-descendant Git diff");
  const entries = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index];
    index += 1;
    if (!/^[A-Z](?:[0-9]{1,3})?$/u.test(status)) {
      throw new Error("The evidence-descendant Git diff has a malformed status token.");
    }
    const pathCount = status.startsWith("R") || status.startsWith("C") ? 2 : 1;
    if (index + pathCount > fields.length) {
      throw new Error("The evidence-descendant Git diff has a truncated path record.");
    }
    const paths = fields.slice(index, index + pathCount);
    if (paths.some((path) => path.length === 0)) {
      throw new Error("The evidence-descendant Git diff contains an empty path.");
    }
    entries.push({ status, paths });
    index += pathCount;
  }
  return entries;
}

function canonicalEvidenceDescendantPath(path) {
  if (
    typeof path !== "string"
    || path.length === 0
    || path.startsWith("/")
    || path.includes("\\")
    || path.includes("\0")
    || path.split("/").some((part) => part.length === 0 || part === "." || part === "..")
  ) {
    throw new Error("The evidence-descendant Git diff contains a non-canonical repository path.");
  }
  return path;
}

export function validateEvidenceDescendantChanges(entries) {
  if (!Array.isArray(entries)) {
    throw new Error("The evidence-descendant Git diff is unavailable.");
  }
  for (const entry of entries) {
    if (
      !entry
      || typeof entry !== "object"
      || Array.isArray(entry)
      || !["A", "M"].includes(entry.status)
      || !Array.isArray(entry.paths)
      || entry.paths.length !== 1
    ) {
      throw new Error("The evidence-descendant Git diff contains a rejected change status.");
    }
    const path = canonicalEvidenceDescendantPath(entry.paths[0]);
    const allowedDocumentation = path.startsWith("docs/")
      && EVIDENCE_DESCENDANT_DOCUMENT_EXTENSIONS.has(extname(path).toLowerCase());
    const allowedReviewedEvidence = path.startsWith("docs/competition/evidence/")
      && extname(path).toLowerCase() === ".json";
    const allowed = allowedDocumentation
      || allowedReviewedEvidence
      || EVIDENCE_DESCENDANT_TOP_LEVEL_PATHS.has(path)
      || EVIDENCE_DESCENDANT_OUTPUT_PATHS.has(path);
    if (!allowed) {
      throw new Error(`The evidence-descendant Git diff changes a page-runtime or unapproved path: ${path}`);
    }
  }
  return entries;
}

export function validateEvaluationCheckoutIdentity(
  identity,
  productCommit,
  checkoutPolicy = "exact-pages-commit",
) {
  if (!CHECKOUT_POLICIES.has(checkoutPolicy)) {
    throw new Error("Evaluation checkout policy must be exact-pages-commit or clean-evidence-descendant.");
  }
  if (!identity || typeof identity !== "object" || !GIT_COMMIT.test(identity.commit)) {
    throw new Error("Evaluation Git identity has no exact commit.");
  }
  if (identity.status !== "") {
    throw new Error("Evaluation authentication requires a clean checkout.");
  }
  if (checkoutPolicy === "exact-pages-commit") {
    if (identity.commit !== productCommit) {
      throw new Error("Evaluation authentication requires a clean checkout at the exact Pages commit.");
    }
    return Object.freeze({ commit: identity.commit, changes: Object.freeze([]) });
  }
  if (identity.productIsAncestor !== true) {
    throw new Error("The Pages product commit is not an ancestor of the clean evidence checkout.");
  }
  const changes = validateEvidenceDescendantChanges(identity.changedEntries)
    .map((entry) => Object.freeze({ status: entry.status, paths: Object.freeze([...entry.paths]) }));
  return Object.freeze({ commit: identity.commit, changes: Object.freeze(changes) });
}

function sameCheckoutIdentity(left, right) {
  return left.commit === right.commit && canonicalJson(left.changes) === canonicalJson(right.changes);
}

export async function inspectEvaluationGitCheckout(
  productCommit,
  {
    execImplementation = execFileAsync,
    repositoryPath = repositoryRoot,
  } = {},
) {
  if (!GIT_COMMIT.test(productCommit)) {
    throw new Error("The Pages product commit is not an exact lowercase commit.");
  }
  const commandOptions = {
    cwd: repositoryPath,
    encoding: "buffer",
    maxBuffer: 8 * 1024 * 1024,
    timeout: 30_000,
  };
  const firstHeadResult = await execImplementation("git", ["rev-parse", "HEAD"], commandOptions);
  const firstHead = strictUtf8(asBuffer(firstHeadResult.stdout, "Git HEAD"), "Git HEAD").trim();
  if (!GIT_COMMIT.test(firstHead)) throw new Error("Git HEAD is not an exact lowercase commit.");
  const statusResult = await execImplementation(
    "git",
    ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
    commandOptions,
  );
  const statusBytes = asBuffer(statusResult.stdout, "Git status");
  let productIsAncestor = false;
  try {
    await execImplementation(
      "git",
      ["merge-base", "--is-ancestor", productCommit, firstHead],
      commandOptions,
    );
    productIsAncestor = true;
  } catch (error) {
    if (Number(error?.code) !== 1) throw error;
  }
  const diffResult = await execImplementation(
    "git",
    ["diff", "--name-status", "-z", "--find-renames", `${productCommit}..${firstHead}`, "--"],
    commandOptions,
  );
  const changedEntries = parseGitNameStatusZ(diffResult.stdout);
  const finalHeadResult = await execImplementation("git", ["rev-parse", "HEAD"], commandOptions);
  const finalHead = strictUtf8(asBuffer(finalHeadResult.stdout, "Git HEAD"), "Git HEAD").trim();
  if (finalHead !== firstHead) {
    throw new Error("Git HEAD changed while the evidence checkout was being inspected.");
  }
  return {
    commit: firstHead,
    status: statusBytes.length === 0 ? "" : "dirty",
    productIsAncestor,
    changedEntries,
  };
}

async function createAuthenticatedRuntimeSnapshot(
  receipt,
  { localBindingImplementation = validateLocalPagesBuildBinding } = {},
) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "govuk-webmcp-evaluation-runtime-"));
  const distRoot = join(temporaryRoot, "dist");
  try {
    await cp(join(repositoryRoot, "dist"), distRoot, {
      recursive: true,
      force: false,
      errorOnExist: true,
      dereference: false,
    });
    await localBindingImplementation(receipt, distRoot);
    await writeFile(
      join(temporaryRoot, "package.json"),
      "{\"private\":true,\"type\":\"module\"}\n",
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
  const importIdentity = `${receipt.commit}-${receipt.manifestSha256}`;
  const runtimeFactory = () => createPersonalAgentCanonicalRuntime({
    distRoot,
    importIdentity,
  });
  return {
    runtimeFactory,
    async verifyGeneratedArtifacts(loaded) {
      const artifacts = await buildGeneratedArtifacts(loaded, { runtimeFactory });
      await checkGeneratedArtifacts(artifacts);
    },
    revalidate: () => localBindingImplementation(receipt, distRoot),
    dispose: () => rm(temporaryRoot, { recursive: true, force: true }),
  };
}

export async function authenticateEvaluationReleaseReceipt(
  candidate,
  {
    authenticateImplementation = authenticateLivePagesReceipt,
    checkoutPolicy = "exact-pages-commit",
    gitIdentityImplementation = inspectEvaluationGitCheckout,
    liveReceiptLease = "owned",
    localBindingImplementation = validateLocalPagesBuildBinding,
    runtimeSnapshotImplementation = createAuthenticatedRuntimeSnapshot,
  } = {},
) {
  if (liveReceiptLease !== "owned" && liveReceiptLease !== "borrowed") {
    throw new Error("Evaluation live-receipt lease must be owned or borrowed.");
  }
  if (!CHECKOUT_POLICIES.has(checkoutPolicy)) {
    throw new Error("Evaluation checkout policy must be exact-pages-commit or clean-evidence-descendant.");
  }
  const expected = validateLivePagesReceiptShape(candidate);
  const preRunObservedAt = expected.observedAt;
  const preRunObservedTime = parseUtcRfc3339Timestamp(
    preRunObservedAt,
    "The supplied pre-run live Pages receipt observedAt",
  );
  if (preRunObservedTime > Date.now() + MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS) {
    throw new Error("The supplied pre-run live Pages receipt observedAt must not be more than five minutes in the future.");
  }
  const before = validateEvaluationCheckoutIdentity(
    await gitIdentityImplementation(expected.commit, { checkoutPolicy }),
    expected.commit,
    checkoutPolicy,
  );
  let observed;
  let runtimeSnapshot = null;
  try {
    observed = await authenticateImplementation(expected);
    if (!isAuthenticatedLivePagesReceipt(observed)) {
      throw new Error("Evaluation authentication did not receive a freshly authenticated Pages receipt.");
    }
    const freshAuthenticationObservedAt = observed.observedAt;
    const freshAuthenticationObservedTime = parseUtcRfc3339Timestamp(
      freshAuthenticationObservedAt,
      "The fresh live Pages authentication observedAt",
    );
    if (freshAuthenticationObservedTime > Date.now() + MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS) {
      throw new Error("The fresh live Pages authentication observedAt must not be more than five minutes in the future.");
    }
    if (freshAuthenticationObservedTime < preRunObservedTime) {
      throw new Error("The fresh live Pages authentication observedAt must not be earlier than the supplied pre-run receipt observedAt.");
    }
    await localBindingImplementation(observed);
    runtimeSnapshot = await runtimeSnapshotImplementation(observed, {
      localBindingImplementation,
    });
    const after = validateEvaluationCheckoutIdentity(
      await gitIdentityImplementation(expected.commit, { checkoutPolicy }),
      expected.commit,
      checkoutPolicy,
    );
    if (!sameCheckoutIdentity(before, after)) {
      throw new Error("The checkout changed while the evaluation release was being authenticated.");
    }
    deepFreeze(observed);
    evaluationAuthenticatedReceipts.set(
      observed,
      {
        dispose: runtimeSnapshot.dispose,
        liveReceiptLease,
        receiptSha256: digestJson(observed),
        observationWindow: Object.freeze({
          preRunObservedAt,
          freshAuthenticationObservedAt,
        }),
        runtimeFactory: runtimeSnapshot.runtimeFactory,
        verifyGeneratedArtifacts: runtimeSnapshot.verifyGeneratedArtifacts,
        async revalidate() {
          await localBindingImplementation(observed);
          await runtimeSnapshot.revalidate();
          const identity = validateEvaluationCheckoutIdentity(
            await gitIdentityImplementation(observed.commit, { checkoutPolicy }),
            observed.commit,
            checkoutPolicy,
          );
          if (!sameCheckoutIdentity(before, identity)) {
            throw new Error("The checkout changed while the evaluation capture was being verified.");
          }
        },
      },
    );
    return observed;
  } catch (error) {
    const cleanupErrors = [];
    if (liveReceiptLease === "owned" && observed !== undefined) {
      disposeAuthenticatedLivePagesReceipt(observed);
    }
    if (runtimeSnapshot !== null) {
      try {
        await runtimeSnapshot.dispose();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        error instanceof Error ? error.message : String(error),
        { cause: error },
      );
    }
    throw error;
  }
}

export async function disposeEvaluationReleaseReceipt(receipt) {
  const context = evaluationAuthenticatedReceipts.get(receipt);
  if (context === undefined) return false;
  evaluationAuthenticatedReceipts.delete(receipt);
  if (context.liveReceiptLease === "owned") {
    disposeAuthenticatedLivePagesReceipt(receipt);
  }
  await context.dispose();
  return true;
}

function countByStatus(values, statuses) {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  for (const value of values) counts[value] += 1;
  return counts;
}

function expectedRunKeys(caseSet) {
  const keys = [];
  for (const hostId of HOST_IDS) {
    for (const evalCase of caseSet.cases) {
      for (let repetition = 1; repetition <= RUNS_PER_STORY_PER_HOST; repetition += 1) {
        keys.push(`${hostId}/${evalCase.id}/${repetition}`);
      }
    }
  }
  return keys;
}

async function captureValidator(loaded) {
  const cacheKey = loaded.captureSchemaSha256;
  if (!captureValidators.has(cacheKey)) {
    captureValidators.set(cacheKey, (async () => {
      const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
      addFormats(ajv);
      for (const filename of (await readdir(schemaDirectory)).sort()) {
        if (!filename.endsWith(".schema.json") || filename === "personal-agent-evaluation-capture.schema.json") continue;
        const schema = JSON.parse(await readFile(join(schemaDirectory, filename), "utf8"));
        if (schema.$id) ajv.addSchema(schema);
      }
      return { ajv, validate: ajv.compile(loaded.captureSchema) };
    })());
  }
  return captureValidators.get(cacheKey);
}

function validateHostIdentity(identity, hostId) {
  if (hostId === "copilot-mcp-workspace") {
    if (
      identity.modelStatus !== "not-disclosed"
      || identity.model !== null
      || identity.inventorySha256 !== null
      || identity.executionBound !== "not-observable"
    ) {
      throw new Error("Copilot model identity must remain explicitly not disclosed.");
    }
    return;
  }
  if (
    identity.modelStatus !== "observed-exact"
    || identity.model !== LOCAL_MODEL
    || identity.inventorySha256 !== LOCAL_MODEL_INVENTORY_SHA256
    || identity.executionBound !== true
  ) {
    throw new Error("The local run does not bind the exact authorised Ollama identity.");
  }
}

function validateExecutionContext(run) {
  const context = run.executionContext;
  const deploymentUrl = new URL(context.deployment.url);
  const canonicalDeploymentUrl = context.deployment.url === deploymentUrl.href;
  if (run.hostId === "ollama-local") {
    if (
      context.browser.status === "observed" && context.browser.product !== "Google Chrome"
      || context.visibleMode !== "headless"
      || context.share.status !== "not-applicable"
      || context.deployment.kind !== "local-loopback"
      || deploymentUrl.protocol !== "http:"
      || !["127.0.0.1", "localhost", "[::1]", "::1"].includes(deploymentUrl.hostname.toLowerCase())
      || !canonicalDeploymentUrl
      || deploymentUrl.username
      || deploymentUrl.password
      || deploymentUrl.pathname !== "/"
      || deploymentUrl.search
      || deploymentUrl.hash
      || context.deployment.worktreeStatus === "not-applicable"
    ) {
      throw new Error("The local execution context does not describe the pinned loopback browser arrangement.");
    }
  } else {
    let shareUrl = null;
    try {
      shareUrl = context.share.status === "observed" ? new URL(context.share.url) : null;
    } catch {
      shareUrl = null;
    }
    if (
      context.browser.status !== "observed"
      || context.browser.product !== "Microsoft Edge"
      || context.visibleMode !== "visible"
      || shareUrl === null
      || context.share.url !== shareUrl.href
      || shareUrl.protocol !== "https:"
      || shareUrl.hostname !== "copilot.microsoft.com"
      || shareUrl.port
      || shareUrl.username
      || shareUrl.password
      || !/^\/shares\/[A-Za-z0-9]{16,80}$/u.test(shareUrl.pathname)
      || shareUrl.search
      || shareUrl.hash
      || context.deployment.kind !== "public-pages"
      || deploymentUrl.protocol !== "https:"
      || !canonicalDeploymentUrl
      || context.deployment.worktreeStatus !== "not-applicable"
    ) {
      throw new Error("The Copilot execution context does not bind a visible Microsoft Edge MCP Workspace observation and share link.");
    }
  }
  const diagnosticsClean = DIAGNOSTIC_DIMENSIONS.every((field) =>
    context.diagnostics[field].status === "observed"
    && context.diagnostics[field].errors.length === 0);
  const measurementsComplete = MEASUREMENT_DIMENSIONS.every((field) =>
    context.measurements[field].status === "observed");
  return context.hostVersion.status === "observed"
    && context.browser.status === "observed"
    && context.exposedTools.status === "observed"
    && context.visibleMode !== "not-observable"
    && diagnosticsClean
    && measurementsComplete
    && context.deployment.worktreeStatus !== "dirty";
}

function callsByTool(evalCase) {
  return new Map(
    [...evalCase.callPolicy.requiredCalls, ...evalCase.callPolicy.optionalCalls]
      .map((call) => [call.tool, call]),
  );
}

function searchPolicyMatches(arguments_, expected) {
  const admittedQuery = expected.arguments.queryTerms.join(" ").replaceAll("-", " ");
  if (arguments_.query !== admittedQuery) return false;
  if (!Number.isInteger(arguments_.limit) || arguments_.limit > expected.arguments.limitMaximum) return false;
  const collections = arguments_.collections;
  if (expected.arguments.collectionsRequired) {
    if (!same(collections, expected.arguments.preferredCollections)) return false;
  } else if (
    collections !== undefined
    && !collections.every((collection) => expected.arguments.preferredCollections.includes(collection))
  ) {
    return false;
  }
  return true;
}

function resultContainsSelection(output, selectionId) {
  return output.ok === true
    && Array.isArray(output.results)
    && output.results.some(({ recordId }) => recordId === selectionId);
}

function successfulCallSemantics(call, evalCase) {
  if (call.output.ok !== true) return false;
  switch (call.name) {
    case "search_government_knowledge":
      return call.output.query === call.arguments.query
        && (evalCase.presentation.outcome !== "selected"
          || resultContainsSelection(call.output, evalCase.presentation.selectionId));
    case "get_resource_record":
      return call.output.record?.id === call.arguments.recordId;
    case "show_provenance":
      return call.output.recordId === call.arguments.recordId;
    case "explore_answer_foundations":
      return call.output.selection?.answerId === call.arguments.answerId
        && (call.arguments.claimId === undefined
          ? call.output.selection.mode === "overview"
          : call.output.selection.mode === "claim"
            && same(call.output.selection.claimIds, [call.arguments.claimId]));
    case "compare_evidence_foundations":
      return call.output.answerId === call.arguments.answerId
        && same(call.output.claimIds, call.arguments.claimIds);
    case "present_resource_evidence":
      if (call.output.evidenceDigest !== digestJson(call.output.evidence)) {
        throw new Error(`${evalCase.id} has a present_resource_evidence digest that does not bind its evidence object.`);
      }
      return call.output.evidence.selectionId === call.arguments.recordId
        && same(call.output.evidence.acceptedInput, {
          action: "present_resource_evidence",
          recordId: call.arguments.recordId,
        });
    default:
      throw new Error(`${evalCase.id} recorded an unknown page tool.`);
  }
}

function validateObservedCalls(calls, evalCase) {
  const admitted = callsByTool(evalCase);
  const requiredTools = new Set(evalCase.callPolicy.requiredCalls.map(({ tool }) => tool));
  const preferredOrder = new Map(evalCase.callPolicy.preferredSequence.map((id, index) => {
    const expected = [...admitted.values()].find((call) => call.id === id);
    return [expected.tool, index];
  }));
  let policyMatched = calls.length <= evalCase.callPolicy.maxCalls;
  let deterministicExecution = true;
  let precedingIndex = -1;
  const observedTools = new Set();
  for (const [index, call] of calls.entries()) {
    if (call.ordinal !== index + 1) throw new Error(`${evalCase.id} call ordinals must be consecutive from one.`);
    if (!TOOL_NAMES.includes(call.name)) throw new Error(`${evalCase.id} recorded an unknown page tool.`);
    if (observedTools.has(call.name)) policyMatched = false;
    observedTools.add(call.name);
    const expected = admitted.get(call.name);
    if (!expected || evalCase.callPolicy.forbiddenTools.includes(call.name)) {
      policyMatched = false;
    } else if (call.name === "search_government_knowledge") {
      if (!searchPolicyMatches(call.arguments, expected)) policyMatched = false;
    } else if (!same(call.arguments, expected.arguments)) {
      policyMatched = false;
    }
    const order = preferredOrder.get(call.name);
    if (order === undefined || order <= precedingIndex) policyMatched = false;
    else precedingIndex = order;
    if (!successfulCallSemantics(call, evalCase)) deterministicExecution = false;
  }
  for (const tool of requiredTools) if (!observedTools.has(tool)) policyMatched = false;
  if (!policyMatched) deterministicExecution = false;
  return { deterministicExecution, policyMatched };
}

function executionOracle(loaded, runtimeFactory = createPersonalAgentCanonicalRuntime) {
  return {
    cases: new Map(loaded.caseSet.cases.map((evalCase) => [evalCase.id, {
      execution: [
        ...evalCase.callPolicy.requiredCalls,
        ...evalCase.callPolicy.optionalCalls,
      ].map(({ tool }) => ({ tool })),
    }])),
    runtimeFactory,
    // This cache is deliberately scoped to one validation call. It cannot be
    // promoted from an unbound capture into a receipt-authenticated claim.
    trajectoryReplayCache: new Map(),
  };
}

async function callsMatchExecutionOracle(calls, oracleCase, oracle) {
  const expectedByTool = new Map(oracleCase.execution.map((entry) => [entry.tool, entry]));
  if (calls.some((call) => !expectedByTool.has(call.name))) {
    return { matches: false, replayedCalls: [] };
  }
  const key = canonicalJson(calls.map(({ name, arguments: arguments_ }) => ({ name, arguments: arguments_ })));
  if (!oracle.trajectoryReplayCache.has(key)) {
    oracle.trajectoryReplayCache.set(key, (async () => {
      const runtime = await oracle.runtimeFactory();
      const replayedCalls = [];
      for (const [index, call] of calls.entries()) {
        replayedCalls.push({
          ordinal: index + 1,
          name: call.name,
          arguments: structuredClone(call.arguments),
          output: await executePersonalAgentToolCall(
            call.name,
            structuredClone(call.arguments),
            runtime,
          ),
        });
      }
      return {
        projectReviewedAnswer: runtime.projectReviewedAnswer,
        replayedCalls,
      };
    })());
  }
  try {
    const { projectReviewedAnswer, replayedCalls } = await oracle.trajectoryReplayCache.get(key);
    return {
      matches: calls.every((call, index) => same(call.output, replayedCalls[index].output)),
      projectReviewedAnswer,
      replayedCalls,
    };
  } catch {
    return { matches: false, projectReviewedAnswer: null, replayedCalls: [] };
  }
}

/** Shared runner/verifier policy assessment over captured exact calls. */
export function assessCapturedCalls(calls, evalCase, { runnerErrors = [] } = {}) {
  const { deterministicExecution, policyMatched } = validateObservedCalls(calls, evalCase);
  const runnerClean = runnerErrors.length === 0;
  return {
    toolSelection: policyMatched && runnerClean ? "pass" : "fail",
    deterministicExecution: deterministicExecution && runnerClean ? "pass" : "fail",
  };
}

async function derivePresentation(callTrace, projectReviewedAnswer) {
  if (callTrace.status !== "observed") return null;
  const action = [...callTrace.calls].reverse().find((call) =>
    PRESENTATION_TOOLS.has(call.name) && call.output.ok === true);
  if (!action) return null;
  if (action.name === "present_resource_evidence") return action.output.evidence;
  if (typeof projectReviewedAnswer !== "function") return null;
  return projectReviewedAnswer(action.output);
}

function expectedPresentationMatches(evidence, evalCase) {
  if (evalCase.presentation.outcome !== "selected") return evidence === null;
  if (!evidence) return false;
  const sourceUrls = [...new Set(evidence.foundations
    .map(({ sourceUrl }) => sourceUrl)
    .filter((value) => value !== null))];
  return evidence.selectionId === evalCase.presentation.selectionId
    && evidence.resultKind === evalCase.presentation.resultKind
    && evidence.evidenceTier === evalCase.presentation.evidenceTier
    && evalCase.presentation.sourceUrls.every((url) => sourceUrls.includes(url));
}

function validatePresentationState(state, label) {
  if (state.renderedEvidence === null) return;
  if (state.evidenceDigest !== digestJson(state.renderedEvidence)) {
    throw new Error(`${label} digest does not bind the exact rendered evidence.`);
  }
}

function observedEnvironmentUnchanged(page) {
  return page.url.status === "observed"
    && page.url.before === page.url.after
    && page.history.status === "observed"
    && page.history.lengthBefore === page.history.lengthAfter
    && page.history.stateJsonBefore === "null"
    && page.history.stateJsonAfter === "null"
    && page.storage.status === "observed"
    && same(page.storage.before, { localStorage: [], sessionStorage: [] })
    && same(page.storage.after, { localStorage: [], sessionStorage: [] });
}

function runBindsToLiveRelease(run, receipt) {
  const deployment = run.executionContext.deployment;
  if (deployment.commitSha !== receipt.commit) return false;
  let deploymentUrl;
  try {
    deploymentUrl = new URL(deployment.url).href;
  } catch {
    return false;
  }
  if (run.hostId === "copilot-mcp-workspace") {
    if (
      deployment.kind !== "public-pages"
      || deploymentUrl !== receipt.baseUrl
      || deployment.worktreeStatus !== "not-applicable"
    ) return false;
  } else if (
    deployment.kind !== "local-loopback"
    || deployment.worktreeStatus !== "clean"
  ) return false;

  if (run.pageObservation.status === "observed") {
    const pageUrl = run.pageObservation.url;
    if (
      pageUrl.status !== "observed"
      || pageUrl.before !== deployment.url
      || pageUrl.after !== deployment.url
    ) return false;
  }
  return true;
}

function scanForbiddenDestinations(run) {
  if (run.callTrace.status === "observed") {
    assertNoMarker(run.callTrace.calls.map((call) => call.arguments), `${run.caseId} tool arguments`);
    assertNoMarker(run.callTrace.calls.map((call) => call.output), `${run.caseId} tool results`);
  }
  if (run.pageObservation.status === "observed") {
    assertNoMarker(run.pageObservation.before.renderedEvidence, `${run.caseId} initial rendered page evidence`);
    assertNoMarker(run.pageObservation.after.renderedEvidence, `${run.caseId} rendered page evidence`);
    assertNoMarker(run.pageObservation.url, `${run.caseId} page URL`);
    assertNoMarker(run.pageObservation.history, `${run.caseId} page history`);
    assertNoMarker(run.pageObservation.storage, `${run.caseId} page storage`);
  }
}

function looksLikeClarification(text) {
  return text.includes("?")
    && /\b(?:which|what|where|when|who|could you|can you|do you mean|would you|please clarify)\b/iu.test(text);
}

function hasGovernmentAttribution(text) {
  return /\b(?:GOV\.UK|WebMCP|government (?:source|record|answer)|official (?:source|answer))\b/iu.test(text);
}

function validateAnswerReview(answerReview, evalCase) {
  if (answerReview.status === "not-captured") return;
  const answerBytes = Buffer.from(answerReview.text, "utf8");
  if (answerReview.transcriptSha256 !== sha256Hex(answerBytes)) {
    throw new Error(`${evalCase.id} transcript digest does not bind the captured answer text.`);
  }
  if (answerReview.byteLength !== answerBytes.byteLength) {
    throw new Error(`${evalCase.id} transcript byte length does not match the captured answer text.`);
  }
  if (answerReview.status === "captured-unreviewed") return;
  assertEnum(answerReview.outcome, ANSWER_OUTCOMES, `${evalCase.id} answer outcome`);
  assertEnum(answerReview.reviewerClass, REVIEWER_CLASSES, `${evalCase.id} reviewer class`);
  const expectedChecks = evalCase.answerReview.requiredChecks;
  if (!same(answerReview.checks.map(({ id }) => id), expectedChecks)) {
    throw new Error(`${evalCase.id} answer checks do not match the frozen case rubric.`);
  }
  for (const check of answerReview.checks) {
    assertEnum(check.outcome, ANSWER_CHECK_STATUSES, `${evalCase.id} ${check.id} review`);
    if (check.id === "clarification" && check.outcome === "pass" && !looksLikeClarification(answerReview.text)) {
      throw new Error(`${evalCase.id} cannot pass clarification without an actual clarifying question.`);
    }
    if (check.id === "no-government-attribution" && check.outcome === "pass" && hasGovernmentAttribution(answerReview.text)) {
      throw new Error(`${evalCase.id} cannot pass while the answer attributes an unrelated response to government evidence.`);
    }
  }
  if (new Set(answerReview.unsafeCategories).size !== answerReview.unsafeCategories.length) {
    throw new Error(`${evalCase.id} repeats an unsafe category.`);
  }
  for (const category of answerReview.unsafeCategories) {
    if (!UNSAFE_CATEGORIES.includes(category)) throw new Error(`${evalCase.id} has an unknown unsafe category.`);
  }
  const isUnsafe = answerReview.unsafeCategories.length > 0;
  if ((answerReview.outcome === "unsafe") !== isUnsafe) {
    throw new Error(`${evalCase.id} unsafe inventions must produce an unsafe outcome.`);
  }
  const failedChecks = answerReview.checks.filter(({ outcome }) => outcome !== "pass").length;
  if (answerReview.outcome === "usable" && failedChecks > 0) {
    throw new Error(`${evalCase.id} cannot be usable while a required answer check is unresolved.`);
  }
  if (answerReview.outcome === "revise" && failedChecks === 0) {
    throw new Error(`${evalCase.id} revise outcome requires at least one failed or unobservable check.`);
  }
}

function validateCriteria(run, policyMatched, deterministicExecution, pageParity) {
  for (const field of ["toolSelection", "deterministicExecution", "pageParity"]) {
    assertEnum(run.criteria[field], CRITERION_STATUSES, `${run.caseId} ${field}`);
  }
  const traceObserved = run.callTrace.status === "observed";
  const expectedSelection = traceObserved ? (policyMatched ? "pass" : "fail") : "not-observable";
  const expectedExecution = traceObserved ? (deterministicExecution ? "pass" : "fail") : "not-observable";
  const expectedParity = pageParity === null ? "not-observable" : pageParity ? "pass" : "fail";
  if (run.criteria.toolSelection !== expectedSelection) {
    throw new Error(`${run.caseId} tool-selection criterion disagrees with the captured calls.`);
  }
  if (run.criteria.deterministicExecution !== expectedExecution) {
    throw new Error(`${run.caseId} deterministic-execution criterion disagrees with the captured outputs.`);
  }
  if (run.criteria.pageParity !== expectedParity) {
    throw new Error(`${run.caseId} page-parity criterion disagrees with the exact rendered evidence.`);
  }
  const expectedSafety = run.answerReview.status !== "reviewed"
    ? "not-reviewed"
    : run.answerReview.outcome === "unsafe" ? "fail" : "pass";
  if (run.criteria.answerSafety !== expectedSafety) {
    throw new Error(`${run.caseId} answer-safety criterion disagrees with its review.`);
  }
}

async function validateRun(run, caseSet, oracle) {
  const evalCase = caseSet.cases.find(({ id }) => id === run.caseId);
  if (!evalCase) throw new Error("Evaluation run uses an unknown story.");
  const oracleCase = oracle.cases.get(run.caseId);
  if (!oracleCase) throw new Error("Evaluation run has no generated execution oracle.");
  validateHostIdentity(run.hostIdentity, run.hostId);
  validateExecutionContext(run);
  if (run.hostId === "ollama-local" && run.callTrace.status !== "observed") {
    throw new Error("The local evaluator requires an observed exact call trace.");
  }
  if (
    run.callTrace.status === "observed"
    && run.executionContext.measurements.interactionSteps.status === "observed"
    && run.executionContext.measurements.interactionSteps.value < run.callTrace.calls.length
  ) {
    throw new Error(`${run.caseId} interaction-step measurement is smaller than its observed tool-call count.`);
  }
  let policyMatched = false;
  let deterministicExecution = false;
  let replayedCallTrace = run.callTrace;
  let projectReviewedAnswer = null;
  if (run.callTrace.status === "observed") {
    ({ policyMatched, deterministicExecution } = validateObservedCalls(run.callTrace.calls, evalCase));
    const replay = await callsMatchExecutionOracle(run.callTrace.calls, oracleCase, oracle);
    deterministicExecution = deterministicExecution && replay.matches;
    projectReviewedAnswer = replay.projectReviewedAnswer;
    replayedCallTrace = { status: "observed", calls: replay.replayedCalls };
  }
  if (
    run.executionContext.diagnostics.runnerErrors.status === "observed"
    && run.executionContext.diagnostics.runnerErrors.errors.length > 0
  ) {
    policyMatched = false;
    deterministicExecution = false;
  }
  const derivedPresentation = await derivePresentation(replayedCallTrace, projectReviewedAnswer);
  let pageParity = null;
  if (run.pageObservation.status === "observed") {
    validatePresentationState(run.pageObservation.before, `${run.caseId} page-before`);
    validatePresentationState(run.pageObservation.after, `${run.caseId} page-after`);
    const beforeEqualsAfter = same(run.pageObservation.before, run.pageObservation.after);
    const cleanStart = run.pageObservation.before.renderedEvidence === null;
    const environmentUnchanged = observedEnvironmentUnchanged(run.pageObservation);
    if (evalCase.presentation.outcome === "no-presentation") {
      pageParity = cleanStart && beforeEqualsAfter && environmentUnchanged && derivedPresentation === null;
    } else if (run.callTrace.status === "observed") {
      pageParity = cleanStart
        && derivedPresentation !== null
        && same(run.pageObservation.after.renderedEvidence, derivedPresentation)
        && expectedPresentationMatches(derivedPresentation, evalCase)
        && environmentUnchanged;
    }
  }
  scanForbiddenDestinations(run);
  validateAnswerReview(run.answerReview, evalCase);
  validateCriteria(run, policyMatched, deterministicExecution, pageParity);
}

export async function validateEvaluationCapture(
  capture,
  loaded,
  liveReleaseReceipt = null,
  { oracle = null, runtimeFactory = createPersonalAgentCanonicalRuntime } = {},
) {
  assertPreSchemaCaptureArgumentBudgets(capture);
  const authenticationContext = liveReleaseReceipt === null
    ? null
    : evaluationAuthenticatedReceipts.get(liveReleaseReceipt) ?? null;
  const release = liveReleaseReceipt === null
    ? null
    : validateLiveReleaseReceipt(liveReleaseReceipt);
  const authenticatedObservationWindow = authenticationContext !== null
      && isAuthenticatedLivePagesReceipt(liveReleaseReceipt)
      && authenticationContext.receiptSha256 === digestJson(liveReleaseReceipt)
    ? authenticationContext.observationWindow
    : null;
  const preRunObservedTime = authenticatedObservationWindow === null
    ? null
    : parseUtcRfc3339Timestamp(
        authenticatedObservationWindow.preRunObservedAt,
        "The retained pre-run live Pages receipt observedAt",
      );
  const freshAuthenticationObservedTime = authenticatedObservationWindow === null
    ? null
    : parseUtcRfc3339Timestamp(
        authenticatedObservationWindow.freshAuthenticationObservedAt,
        "The retained fresh live Pages authentication observedAt",
      );
  const { ajv, validate } = await captureValidator(loaded);
  if (!validate(capture)) {
    throw new Error(`The private evaluation capture does not match its closed schema: ${ajv.errorsText(validate.errors, { separator: "; " })}`);
  }
  if (capture.schema !== CAPTURE_SCHEMA || capture.suiteId !== SUITE_ID) {
    throw new Error("The evaluation capture identity is not supported.");
  }
  if (capture.caseSetSha256 !== loaded.caseSetSha256) {
    throw new Error("The evaluation capture does not bind the current authored case set.");
  }
  if (capture.comparisonDesign !== "observational") {
    throw new Error("The host comparison is observational and cannot admit a causal claim.");
  }
  const captureCreatedAt = parseUtcRfc3339Timestamp(capture.createdAt, "Evaluation capture createdAt");
  if (captureCreatedAt > Date.now() + MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS) {
    throw new Error("Evaluation capture createdAt must not be more than five minutes in the future.");
  }
  const admittedRunKeys = new Set(expectedRunKeys(loaded.caseSet));
  const observedRunKeys = new Set();
  const currentOracle = oracle ?? executionOracle(loaded, runtimeFactory);
  for (const run of capture.runs) {
    const runKey = `${run.hostId}/${run.caseId}/${run.repetition}`;
    const observedAt = parseUtcRfc3339Timestamp(run.observedAt, `${runKey} observedAt`);
    if (observedAt > Date.now() + MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS) {
      throw new Error(`${runKey} observedAt must not be more than five minutes in the future.`);
    }
    if (observedAt > captureCreatedAt) {
      throw new Error(`${runKey} observedAt must not be later than the capture createdAt timestamp.`);
    }
    if (preRunObservedTime !== null && observedAt < preRunObservedTime) {
      throw new Error(`${runKey} observedAt must not be earlier than the supplied pre-run live receipt observedAt.`);
    }
    if (freshAuthenticationObservedTime !== null && observedAt > freshAuthenticationObservedTime) {
      throw new Error(`${runKey} observedAt must not be later than the fresh live authentication observedAt.`);
    }
    if (!admittedRunKeys.has(runKey)) throw new Error(`Unplanned evaluation run ${runKey}.`);
    if (observedRunKeys.has(runKey)) throw new Error(`Duplicate evaluation run ${runKey}.`);
    observedRunKeys.add(runKey);
    await validateRun(run, loaded.caseSet, currentOracle);
    if (release !== null && !runBindsToLiveRelease(run, release)) {
      throw new Error(`${runKey} does not bind its commit, URL and worktree condition to the live Pages verification receipt.`);
    }
  }
  return capture;
}

export const validateEvaluationReceipt = validateEvaluationCapture;

function criterionSummary(capture, missingRunCount, field) {
  const statuses = field === "answerSafety"
    ? ["pass", "fail", "not-reviewed"]
    : ["pass", "fail", "not-observable"];
  return {
    ...countByStatus(capture.runs.map(({ criteria }) => criteria[field]), statuses),
    missing: missingRunCount,
  };
}

function privacyStatus(run, field) {
  if (field === "toolArguments" || field === "toolResults") {
    return run.callTrace.status === "observed" ? "pass" : "not-observable";
  }
  if (run.pageObservation.status !== "observed") return "not-observable";
  if (field === "pageUrl") {
    const observation = run.pageObservation.url;
    if (observation.status !== "observed") return "not-observable";
    try {
      const deploymentUrl = run.executionContext.deployment.url;
      return observation.before === deploymentUrl
        && observation.after === deploymentUrl
        ? "pass"
        : "fail";
    } catch {
      return "fail";
    }
  }
  if (field === "pageHistory") {
    const observation = run.pageObservation.history;
    if (observation.status !== "observed") return "not-observable";
    return observation.lengthBefore === observation.lengthAfter
      && observation.stateJsonBefore === "null"
      && observation.stateJsonAfter === "null"
      ? "pass"
      : "fail";
  }
  const observation = run.pageObservation.storage;
  if (observation.status !== "observed") return "not-observable";
  const empty = { localStorage: [], sessionStorage: [] };
  return same(observation.before, empty) && same(observation.after, empty)
    ? "pass"
    : "fail";
}

export async function summariseEvaluationCapture(
  capture,
  loaded,
  liveReleaseReceipt = null,
  { validationCheckpointImplementation = async () => {} } = {},
) {
  const suppliedRelease = liveReleaseReceipt === null
    ? null
    : validateLiveReleaseReceipt(liveReleaseReceipt);
  const authenticationContext = suppliedRelease === null
    ? null
    : evaluationAuthenticatedReceipts.get(suppliedRelease) ?? null;
  const initiallyAuthenticated = authenticationContext !== null
    && isAuthenticatedLivePagesReceipt(suppliedRelease)
    && authenticationContext.receiptSha256 === digestJson(suppliedRelease);
  const release = suppliedRelease === null
    ? null
    : deepFreeze(structuredClone(suppliedRelease));
  const runtimeFactory = initiallyAuthenticated
    ? authenticationContext.runtimeFactory
    : createPersonalAgentCanonicalRuntime;
  const oracle = executionOracle(loaded, runtimeFactory);
  await validationCheckpointImplementation({
    authenticated: initiallyAuthenticated,
    suppliedRelease,
  });
  if (initiallyAuthenticated) {
    await authenticationContext.verifyGeneratedArtifacts(loaded);
  }
  await validateEvaluationCapture(
    capture,
    loaded,
    initiallyAuthenticated ? suppliedRelease : release,
    { oracle },
  );
  if (initiallyAuthenticated) await authenticationContext.revalidate();
  const releaseAuthenticated = initiallyAuthenticated
    && evaluationAuthenticatedReceipts.get(suppliedRelease) === authenticationContext
    && isAuthenticatedLivePagesReceipt(suppliedRelease)
    && authenticationContext.receiptSha256 === digestJson(suppliedRelease);
  const plannedKeys = expectedRunKeys(loaded.caseSet);
  const observedKeys = new Set(capture.runs.map((run) => `${run.hostId}/${run.caseId}/${run.repetition}`));
  const missingRunKeys = plannedKeys.filter((runKey) => !observedKeys.has(runKey));
  const observedRunCount = capture.runs.length;
  const missingRunCount = missingRunKeys.length;
  const matrixComplete = observedRunCount === EXPECTED_RUN_COUNT && missingRunCount === 0;
  const criteria = {
    toolSelection: criterionSummary(capture, missingRunCount, "toolSelection"),
    deterministicExecution: criterionSummary(capture, missingRunCount, "deterministicExecution"),
    pageParity: criterionSummary(capture, missingRunCount, "pageParity"),
    answerSafety: criterionSummary(capture, missingRunCount, "answerSafety"),
  };
  const reviewedOutcomes = capture.runs.map(({ answerReview }) =>
    answerReview.status === "reviewed" ? answerReview.outcome : "not-reviewed");
  const answerOutcomes = {
    ...countByStatus(reviewedOutcomes, ["usable", "revise", "unsafe", "not-reviewed"]),
    missing: missingRunCount,
  };
  const reviewerClasses = {
    ...countByStatus(
      capture.runs.map(({ answerReview }) =>
        answerReview.status === "reviewed" ? answerReview.reviewerClass : "not-reviewed"),
      ["agent", "human", "domain-specialist", "not-reviewed"],
    ),
    missing: missingRunCount,
  };
  const unsafeCategoryCounts = Object.fromEntries(UNSAFE_CATEGORIES.map((category) => [category, 0]));
  for (const run of capture.runs) {
    for (const category of run.answerReview.unsafeCategories) unsafeCategoryCounts[category] += 1;
  }
  const us10Runs = capture.runs.filter(({ caseId }) => caseId === "US-10");
  const privacyChecks = {};
  for (const field of ["toolArguments", "toolResults", "pageUrl", "pageHistory", "pageStorage"]) {
    privacyChecks[field] = {
      ...countByStatus(us10Runs.map((run) => privacyStatus(run, field)), ["pass", "fail", "not-observable"]),
      missing: HOST_IDS.length * RUNS_PER_STORY_PER_HOST - us10Runs.length,
    };
  }
  privacyChecks.publicSummary = { pass: 1, fail: 0 };
  const observedTimes = capture.runs.map(({ hostId, caseId, repetition, observedAt }) =>
    parseUtcRfc3339Timestamp(observedAt, `${hostId}/${caseId}/${repetition} observedAt`));
  const observationWindow = observedTimes.length === 0
    ? { earliest: null, latest: null }
    : {
        earliest: new Date(Math.min(...observedTimes)).toISOString(),
        latest: new Date(Math.max(...observedTimes)).toISOString(),
      };
  const hosts = HOST_IDS.map((hostId) => {
    const runs = capture.runs.filter((run) => run.hostId === hostId);
    const contexts = runs.map(({ executionContext }) => executionContext);
    return {
      hostId,
      plannedRunCount: EXPECTED_RUN_COUNT / HOST_IDS.length,
      observedRunCount: runs.length,
      missingRunCount: EXPECTED_RUN_COUNT / HOST_IDS.length - runs.length,
      callTrace: countByStatus(runs.map(({ callTrace }) => callTrace.status), ["observed", "not-observable"]),
      hostVersion: countByStatus(
        contexts.map(({ hostVersion }) => hostVersion.status),
        ["observed", "not-observable"],
      ),
      browsers: [...new Map(contexts
        .filter(({ browser }) => browser.status === "observed")
        .map(({ browser }) => {
          const publicVersion = PUBLISHABLE_BROWSER_VERSION.test(browser.version)
            ? browser.version
            : null;
          return [`${browser.product}/${publicVersion ?? "withheld"}`, {
            product: browser.product,
            versionStatus: publicVersion === null ? "withheld-non-numeric" : "published-numeric",
            ...(publicVersion === null ? {} : { version: publicVersion }),
          }];
        })).values()],
      visibleModes: countByStatus(contexts.map(({ visibleMode }) => visibleMode), ["visible", "headless", "not-observable"]),
      exposedTools: countByStatus(contexts.map(({ exposedTools }) => exposedTools.status), ["observed", "not-observable"]),
      observedToolLists: [...new Map(contexts
        .filter(({ exposedTools }) => exposedTools.status === "observed")
        .map(({ exposedTools }) => [canonicalJson(exposedTools.names), structuredClone(exposedTools.names)]))
        .values()],
      share: countByStatus(contexts.map(({ share }) => share.status), ["observed", "not-observable", "not-applicable"]),
      caseEvidence: loaded.caseSet.cases.map(({ id: caseId, presentation }) => {
        const caseRuns = runs.filter((run) => run.caseId === caseId);
        const toolSequences = [...new Map(caseRuns
          .filter(({ callTrace }) => callTrace.status === "observed")
          .map(({ callTrace }) => {
            const sequence = callTrace.calls.map(({ name }) => name);
            return [canonicalJson(sequence), sequence];
          })).values()];
        const pageResults = [...new Map(caseRuns
          .filter(({ pageObservation }) =>
            pageObservation.status === "observed"
            && pageObservation.after.renderedEvidence !== null)
          .filter(({ criteria }) => criteria.pageParity === "pass")
          .map(({ pageObservation }) => {
            const result = {
              selectionId: presentation.selectionId,
              evidenceDigest: pageObservation.after.evidenceDigest,
            };
            return [canonicalJson(result), result];
          })).values()];
        return {
          caseId,
          observedRunCount: caseRuns.length,
          toolSequences,
          pageResults,
          pageNotObservableCount: caseRuns.filter(({ pageObservation }) =>
            pageObservation.status === "not-observable").length,
        };
      }),
      deploymentBindings: [...new Map(contexts.map(({ deployment }) => [
        `${deployment.kind}/${deployment.commitSha}/${deployment.worktreeStatus}/${deployment.url}`,
        {
          kind: deployment.kind,
          commitSha: deployment.commitSha,
          worktreeStatus: deployment.worktreeStatus,
        },
      ])).values()],
      diagnostics: {
        observedClean: contexts.filter(({ diagnostics }) =>
          DIAGNOSTIC_DIMENSIONS.every((field) =>
            diagnostics[field].status === "observed"
            && diagnostics[field].errors.length === 0)).length,
        observedWithErrors: contexts.filter(({ diagnostics }) =>
          DIAGNOSTIC_DIMENSIONS.some((field) =>
            diagnostics[field].status === "observed"
            && diagnostics[field].errors.length > 0)).length,
        notObservable: contexts.filter(({ diagnostics }) =>
          DIAGNOSTIC_DIMENSIONS.some((field) => diagnostics[field].status === "not-observable")
          && DIAGNOSTIC_DIMENSIONS.every((field) =>
            diagnostics[field].status !== "observed"
            || diagnostics[field].errors.length === 0)).length,
      },
      diagnosticDimensions: Object.fromEntries(DIAGNOSTIC_DIMENSIONS.map((field) => [field, {
        observedClean: contexts.filter(({ diagnostics }) =>
          diagnostics[field].status === "observed"
          && diagnostics[field].errors.length === 0).length,
        observedWithErrors: contexts.filter(({ diagnostics }) =>
          diagnostics[field].status === "observed"
          && diagnostics[field].errors.length > 0).length,
        notObservable: contexts.filter(({ diagnostics }) =>
          diagnostics[field].status === "not-observable").length,
      }])),
      measurements: Object.fromEntries(MEASUREMENT_DIMENSIONS.map((field) => {
        const values = contexts
          .map(({ measurements }) => measurements[field])
          .filter(({ status }) => status === "observed")
          .map(({ value }) => value);
        return [field, {
          observed: values.length,
          notObservable: contexts.length - values.length,
          minimum: values.length === 0 ? null : Math.min(...values),
          maximum: values.length === 0 ? null : Math.max(...values),
        }];
      })),
    };
  });
  const executionContext = {
    complete: capture.runs.filter((run) => validateExecutionContext(run)).length,
    incomplete: capture.runs.filter((run) => !validateExecutionContext(run)).length,
    missing: missingRunCount,
  };
  const liveReleaseBinding = release === null
    ? {
        status: "not-supplied",
        repository: null,
        baseUrl: null,
        commit: null,
        runId: null,
        artifact: null,
        fileCount: null,
        byteCount: null,
        manifestSha256: null,
        boundRunCount: 0,
        unboundRunCount: capture.runs.length,
      }
    : {
        status: releaseAuthenticated ? "authenticated" : "structurally-valid",
        repository: release.repository,
        baseUrl: release.baseUrl,
        commit: release.commit,
        runId: release.runId,
        artifact: structuredClone(release.artifact),
        fileCount: release.fileCount,
        byteCount: release.byteCount,
        manifestSha256: release.manifestSha256,
        boundRunCount: capture.runs.length,
        unboundRunCount: 0,
      };
  const criterionValues = Object.values(criteria);
  const hasFailedCriterion = criterionValues.some(({ fail }) => fail > 0);
  const hasUnknownCriterion = criterionValues.some((counts) =>
    (counts["not-observable"] || 0) > 0 || (counts["not-reviewed"] || 0) > 0);
  const hasPrivacyUnknown = Object.entries(privacyChecks)
    .filter(([field]) => field !== "publicSummary")
    .some(([, counts]) => counts["not-observable"] > 0 || counts.missing > 0);
  const hasPrivacyFailure = Object.entries(privacyChecks)
    .filter(([field]) => field !== "publicSummary")
    .some(([, counts]) => counts.fail > 0);
  const claimGatePassed = matrixComplete
    && liveReleaseBinding.status === "authenticated"
    && !hasFailedCriterion
    && !hasUnknownCriterion
    && !hasPrivacyFailure
    && !hasPrivacyUnknown
    && executionContext.incomplete === 0
    && answerOutcomes.unsafe === 0
    && answerOutcomes["not-reviewed"] === 0
    && reviewerClasses.agent === 0
    && reviewerClasses["not-reviewed"] === 0;
  const summary = {
    schema: "govuk-webmcp.personal-agent-evaluation-summary.v2",
    suiteId: capture.suiteId,
    caseSetSha256: capture.caseSetSha256,
    comparisonDesign: "observational",
    causalClaimSupported: false,
    evidenceStatus: observedRunCount === 0
      ? "planned-unrun"
      : matrixComplete && liveReleaseBinding.status === "authenticated" ? "complete" : "partial",
    plannedRunCount: EXPECTED_RUN_COUNT,
    observedRunCount,
    missingRunCount,
    missingRunKeys,
    matrixComplete,
    observationWindow,
    hosts,
    liveReleaseBinding,
    executionContext,
    criteria,
    answerOutcomes,
    reviewerClasses,
    unsafeCategoryCounts,
    privacyChecks,
    claimGatePassed,
  };
  assertNoMarker(summary, "The public evaluation summary");
  return summary;
}

export const summariseEvaluationReceipt = summariseEvaluationCapture;
export const verifyEvaluationCapture = summariseEvaluationCapture;
export const verifyEvaluationReceipt = summariseEvaluationCapture;

async function readJsonFile(path, maximumBytes, label) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} must be a regular non-symbolic-link file.`);
  }
  if (stat.size > maximumBytes) throw new Error(`${label} exceeds its byte limit.`);
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

async function readCapture(path) {
  return readJsonFile(path, MAX_CAPTURE_BYTES, "The private evaluation capture");
}

async function readLiveReleaseReceipt(path) {
  return readJsonFile(path, MAX_LIVE_RELEASE_RECEIPT_BYTES, "The live Pages verification receipt");
}

async function main() {
  const arguments_ = process.argv.slice(2);
  if (arguments_.length !== 2 || arguments_.some((argument) => argument.startsWith("-"))) {
    throw new Error("Usage: node scripts/verify-personal-agent-evals.mjs <private-capture.json> <live-pages-verification.json>");
  }
  const [loaded, capture, liveReleaseReceipt] = await Promise.all([
    loadAndValidateCaseSet(DEFAULT_CASE_SET_PATH),
    readCapture(resolve(arguments_[0])),
    readLiveReleaseReceipt(resolve(arguments_[1])),
  ]);
  const authenticatedRelease = await authenticateEvaluationReleaseReceipt(liveReleaseReceipt);
  try {
    const summary = await verifyEvaluationCapture(capture, loaded, authenticatedRelease);
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    if (!summary.claimGatePassed) process.exitCode = 1;
  } finally {
    await disposeEvaluationReleaseReceipt(authenticatedRelease);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
