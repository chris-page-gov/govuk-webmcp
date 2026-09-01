import { spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { arch, platform, release, tmpdir } from "node:os";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
  win32,
} from "node:path";
import { fileURLToPath } from "node:url";

import {
  fetchPublicDeploymentMetadata,
  PUBLIC_CAPTURE_TARGET,
} from "./lib/chrome-devtools-capture-target.mjs";
import {
  EXPECTED_RUN_COUNT,
  LOCAL_MODEL,
  LOCAL_MODEL_INVENTORY_SHA256,
  loadAndValidateCaseSet,
} from "./prepare-personal-agent-evals.mjs";
import {
  summariseEvaluationCapture,
  validateLiveReleaseReceipt,
} from "./verify-personal-agent-evals.mjs";

const scriptPath = fileURLToPath(import.meta.url);
export const repositoryRoot = resolve(dirname(scriptPath), "..");
const defaultConfig = join(repositoryRoot, "docs/competition/demo-video-script-v0.4.0-rc.1.json");
const defaultOutput = join(repositoryRoot, "output/govuk-webmcp-demo-v0.4.0-rc.1.mp4");
const transcriptPath = join(repositoryRoot, "docs/competition/demo-transcript-v0.4.0-rc.1.md");
const captionsPath = join(repositoryRoot, "docs/competition/demo-captions.v0.4.0-rc.1.en-GB.vtt");
const verificationPath = join(repositoryRoot, "docs/competition/evidence/demo-video-build-v0.4.0-rc.1.json");
const expectedInteractionCaptureReceipt = "docs/competition/evidence/demo-live-interaction-capture-v0.4.0-rc.1.json";
const expectedPrivateEvaluationCapture = ".evals/personal-agent-media/v0.4.0-rc.1/private-capture.json";
const expectedPrivateLiveReleaseReceipt = ".evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json";
const expectedPrivateAuthenticatedSummary = ".evals/personal-agent-media/v0.4.0-rc.1/authenticated-summary.json";
const MAXIMUM_VIDEO_DURATION_SECONDS = 180;
const COMMIT = /^[a-f0-9]{40}$/u;
const RUN_ID = /^[1-9][0-9]*$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const FEDERATED_RECORD_ID = /^govuk-discovery:federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5})$/u;

export const demoReleaseEnvironment = Object.freeze({
  productCommit: "GOVUK_WEBMCP_DEMO_COMMIT",
  pagesRunId: "GOVUK_WEBMCP_DEMO_PAGES_RUN_ID",
});

export const expectedToolNames = [
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
  "present_resource_evidence",
];

export const requiredVoiceOverJourneyIds = [
  "page-title-and-headings",
  "skip-link-and-main-focus",
  "persistent-view-navigation",
  "evidence-presentation-action",
  "evidence-answer-sections",
  "source-link-role-and-destination",
  "comparison-guide",
  "technical-review-controls",
  "focus-restoration",
];

export const personalAgentSceneContracts = Object.freeze({
  "copilot-personal-ai": Object.freeze({
    hostId: "copilot-mcp-workspace",
    arrangement: "cloud-personal-ai",
    product: "Microsoft Copilot MCP Workspace",
    caseId: "US-09",
    repetition: 1,
    mediaPath: "output/demo-clips/v0.4.0-rc.1/04-copilot-personal-ai.mov",
    evidencePath: ".evals/personal-agent-media/v0.4.0-rc.1/copilot-video-capture.json",
    captureMethod: "manual-visible-screen-recording",
  }),
  "ollama-local": Object.freeze({
    hostId: "ollama-local",
    arrangement: "local-personal-ai",
    product: "Ollama through webmcp-evals",
    caseId: "US-09",
    repetition: 1,
    mediaPath: "output/demo-clips/v0.4.0-rc.1/07-ollama-local.mov",
    evidencePath: ".evals/personal-agent-media/v0.4.0-rc.1/ollama-video-capture.json",
    captureMethod: "operator-recorded-local-evaluation",
  }),
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value, label, maximum = 1_000) {
  invariant(typeof value === "string" && value.length > 0 && value.length <= maximum, `${label} must be a non-empty string of at most ${maximum} characters`);
  return value;
}

function hostname(value, label) {
  nonEmptyString(value, label, 253);
  invariant(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/u.test(value), `${label} is not a lowercase ASCII hostname`);
  return value;
}

function exactKeys(value, allowed, required, label) {
  invariant(isObject(value), `${label} must be an object`);
  const keys = Object.keys(value);
  const unknown = keys.filter((key) => !allowed.includes(key));
  const missing = required.filter((key) => !keys.includes(key));
  invariant(unknown.length === 0, `${label} has unknown fields: ${unknown.join(", ")}`);
  invariant(missing.length === 0, `${label} is missing fields: ${missing.join(", ")}`);
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = capture ? `\n${result.stderr || result.stdout}` : "";
    throw new Error(`${command} failed with exit code ${result.status}${detail}`);
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function ffmpeg(args, options) {
  return run("ffmpeg", ["-nostdin", "-hide_banner", ...args], options);
}

function probe(path) {
  return JSON.parse(run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size,format_name:stream=index,codec_name,codec_type,width,height,r_frame_rate,pix_fmt,sample_rate,channels:stream_tags=language,title",
    "-of", "json",
    path,
  ], { capture: true }).stdout);
}

function durationOf(probeResult, label) {
  const duration = Number(probeResult?.format?.duration);
  invariant(Number.isFinite(duration) && duration > 0, `${label} has no positive finite duration`);
  return duration;
}

export function wrapCaption(text, width = 42) {
  const words = text.split(/\s+/u);
  const lines = [];
  let line = "";
  for (const word of words) {
    invariant(word.length <= width, `Caption word exceeds ${width} characters: ${word}`);
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  invariant(lines.length <= 2, `Caption needs more than two ${width}-character lines: ${text}`);
  return lines.join("\n");
}

function formatTimestamp(seconds) {
  const milliseconds = Math.max(0, Math.round(seconds * 1_000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((milliseconds % 60_000) / 1_000);
  const remainder = milliseconds % 1_000;
  return `${[hours, minutes, wholeSeconds].map((value) => String(value).padStart(2, "0")).join(":")}.${String(remainder).padStart(3, "0")}`;
}

function sameValues(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameSet(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function validObservedAt(value, label) {
  invariant(typeof value === "string" && Number.isFinite(Date.parse(value)), `${label} must be an RFC 3339 timestamp`);
}

function validatePageIdentity(page, config, label) {
  exactKeys(page, ["url", "release", "productCommit", "pagesRunId"], ["url", "release", "productCommit", "pagesRunId"], `${label}.page`);
  const expected = new URL(config.productUrl);
  const observed = new URL(page.url);
  invariant(observed.origin === expected.origin && observed.pathname === expected.pathname, `${label} page URL does not identify the configured product`);
  invariant(page.release === config.release, `${label} release does not match the script`);
  invariant(page.productCommit === config.productCommit, `${label} product commit does not match the script`);
  invariant(page.pagesRunId === config.pagesRunId, `${label} Pages run does not match the script`);
}

function assertBoundary(boundaries, field, expected, label) {
  invariant(isObject(boundaries) && boundaries[field] === expected, `${label} must record ${field}=${JSON.stringify(expected)}`);
}

export function validateSupportedHostEvidence(evidence, config, expectedFederatedRecordId) {
  exactKeys(evidence,
    ["schema", "capturedAt", "page", "host", "capture", "artefacts", "discovery", "calls", "rejectedCall", "finalPageObservation", "limitations"],
    ["schema", "capturedAt", "page", "host", "capture", "artefacts", "discovery", "calls", "rejectedCall", "finalPageObservation", "limitations"],
    "Supported-host evidence");
  invariant(evidence?.schema === "govuk-webmcp.supported-host-webmcp-capture.v3", "Supported-host evidence has the wrong schema");
  validObservedAt(evidence.capturedAt, "Supported-host capturedAt");
  validatePageIdentity(evidence.page, config, "Supported-host evidence");
  exactKeys(evidence.host, ["name", "version", "capabilities"], ["name", "version", "capabilities"], "Supported-host identity");
  nonEmptyString(evidence.host?.name, "Supported-host name", 120);
  nonEmptyString(evidence.host?.version, "Supported-host version", 120);
  invariant(Array.isArray(evidence.host.capabilities) && evidence.host.capabilities.includes("webmcp"), "Supported-host evidence must record the native WebMCP capability");
  exactKeys(evidence.capture,
    ["method", "hostOwnedSurfaceObserved", "hostRecordingCaptured", "modelSelected", "modelProviderCalled"],
    ["method", "hostOwnedSurfaceObserved", "hostRecordingCaptured", "modelSelected", "modelProviderCalled"],
    "Supported-host capture");
  nonEmptyString(evidence.capture.method, "Supported-host capture method", 600);
  invariant(typeof evidence.capture.hostOwnedSurfaceObserved === "boolean" && typeof evidence.capture.hostRecordingCaptured === "boolean", "Supported-host capture must state whether a host-owned surface and recording were observed");
  invariant(typeof evidence.capture.modelSelected === "boolean" && typeof evidence.capture.modelProviderCalled === "boolean", "Supported-host evidence must state whether a model selected or received the calls");
  invariant(!evidence.capture.modelSelected || evidence.capture.modelProviderCalled, "A model-selected host call must record that the model provider received the bounded host exchange");
  invariant(Array.isArray(evidence.artefacts) && evidence.artefacts.length > 0, "Supported-host evidence must bind at least one host artefact");
  for (const artefact of evidence.artefacts) {
    exactKeys(artefact,
      ["path", "sha256", "kind", "hostOwnedSurface", "purpose", "limitation"],
      ["path", "sha256", "kind", "hostOwnedSurface", "purpose", "limitation"],
      "Supported-host artefact");
    nonEmptyString(artefact.path, "Supported-host artefact path", 300);
    invariant(SHA256.test(artefact.sha256), "Supported-host artefact SHA-256 is invalid");
    invariant(["raw-receipt", "host-screenshot"].includes(artefact.kind), "Supported-host artefact kind is invalid");
    invariant(typeof artefact.hostOwnedSurface === "boolean", "Supported-host artefact must state whether it shows a host-owned surface");
    nonEmptyString(artefact.purpose, "Supported-host artefact purpose", 500);
    nonEmptyString(artefact.limitation, "Supported-host artefact limitation", 500);
  }
  invariant(evidence.artefacts.some(({ kind }) => kind === "raw-receipt" || kind === "host-screenshot"), "Supported-host evidence lacks a raw receipt or host screenshot");
  if (evidence.capture.hostOwnedSurfaceObserved) {
    invariant(evidence.artefacts.some(({ kind, hostOwnedSurface }) => kind === "host-screenshot" && hostOwnedSurface === true), "A claimed host-owned surface must be bound to a host screenshot");
  }
  const tools = evidence.discovery?.tools;
  invariant(evidence.discovery?.toolCount === expectedToolNames.length, "Supported-host evidence must record six discovered tools");
  invariant(sameSet(tools?.map(({ name }) => name), expectedToolNames), "Supported-host discovery does not contain the exact six tools");
  const expectedReadOnly = new Map([
    ["search_government_knowledge", true],
    ["get_resource_record", true],
    ["show_provenance", true],
    ["explore_answer_foundations", false],
    ["compare_evidence_foundations", false],
    ["present_resource_evidence", false],
  ]);
  for (const tool of tools) {
    invariant(tool.annotations?.readOnlyHint === expectedReadOnly.get(tool.name), `${tool.name} has the wrong readOnlyHint`);
    invariant(tool.annotations?.untrustedContentHint === true, `${tool.name} must retain untrustedContentHint=true`);
    invariant(tool.inputSchema?.additionalProperties === false, `${tool.name} must retain a closed input schema`);
  }
  const searchTool = tools.find(({ name }) => name === "search_government_knowledge");
  invariant(sameSet(Object.keys(searchTool.inputSchema?.properties ?? {}), ["query", "resourceTypes", "publishers", "accessStatuses", "collections", "limit"]), "Search schema must expose exactly the six declared fields");
  invariant(sameValues(searchTool.inputSchema?.required, ["query"]), "Search schema must require only query");
  invariant(sameSet(searchTool.inputSchema?.$defs?.knowledgeCollection?.enum, ["deep-evidence", "uk-living", "ons", "government-apis", "land-registry"]), "Search schema must retain the exact five-value collection enum");
  invariant(!Object.hasOwn(searchTool.inputSchema?.properties ?? {}, "personalContext"), "Search schema must not expose personalContext");

  const calls = evidence.calls;
  invariant(sameSet(calls?.map(({ name }) => name), expectedToolNames), "Supported-host evidence must contain one call for every fixed tool");
  const byName = new Map(calls.map((call) => [call.name, call]));
  for (const name of expectedToolNames) {
    const call = byName.get(name);
    invariant(call?.result?.ok === true, `${name} was not recorded as a successful call`);
    invariant(
      call.canonicalResultDigest === sha256Text(canonicalJson(call.result)),
      `${name} canonical result digest does not match its captured result`,
    );
  }

  const search = byName.get("search_government_knowledge");
  const inputs = config.demonstrationInputs;
  invariant(search.input?.query === inputs.query, "Search call used the wrong fixed query");
  invariant(sameValues(search.input?.collections, inputs.collections), "Search call did not use the exact four federated collections");
  invariant(search.input?.limit === inputs.limit, "Search call used the wrong fixed result limit");
  invariant(search.result?.schema === "trusted-govuk-discovery.search-result.v2", "Search call did not return the combined evidence-tier result");
  invariant(sameValues(search.result?.selectedCollections, inputs.collections), "Search result selected the wrong collections");
  invariant(search.result?.evidenceEstate?.reviewedRecordCount === 80, "Search result lost the reviewed evidence population");
  invariant(search.result?.evidenceEstate?.federatedSourceRecordCount === 58_655 && search.result?.evidenceEstate?.federatedQuarantinedRecordCount === 3 && search.result?.evidenceEstate?.federatedRecordCount === 58_652, "Search result lost the exact federated source, quarantine or searchable population");
  invariant(sameSet(search.result?.collectionStatuses?.map(({ collectionId }) => collectionId), inputs.collections), "Search result did not report all four federated collection states");
  invariant(search.result.collectionStatuses.every(({ evidenceTier, status }) => evidenceTier === "federated-source-snapshot" && status === "ready"), "Search result did not retain four ready source-snapshot tiers");
  invariant(sameSet([...new Set(search.result?.results?.map(({ collectionId }) => collectionId))], inputs.collections), "Search result limit did not return a representative result from every federated collection");
  invariant(search.result.returned === search.result.results.length && search.result.returned <= inputs.limit, "Search result returned count is inconsistent with the captured result array or limit");
  invariant(search.result.results.every(({ evidenceTier, canonicalHumanUrl }) => evidenceTier === "federated-source-snapshot" && (!canonicalHumanUrl || new URL(canonicalHumanUrl).hostname !== inputs.excludedHostname)), "Search results lost their federated tier or published an excluded legislation link");
  assertBoundary(search.result.boundaries, "providerCall", false, "search_government_knowledge");
  assertBoundary(search.result.boundaries, "personalContextAccepted", false, "search_government_knowledge");

  assertBoundary(search.result.boundaries, "readOnly", true, "search_government_knowledge");
  const record = byName.get("get_resource_record");
  const provenanceCall = byName.get("show_provenance");
  const demonstratedRecordId = record.input?.recordId;
  invariant(FEDERATED_RECORD_ID.test(expectedFederatedRecordId), "Final preflight must supply the deployment-selected federated record ID");
  invariant(demonstratedRecordId === expectedFederatedRecordId, "Exact-record call did not use the deployment-selected federated record");
  invariant(search.result.results.some(({ recordId }) => recordId === demonstratedRecordId), "Exact-record call did not use a result from the fixed four-source search");
  const demonstratedSummary = search.result.results.find(({ recordId }) => recordId === demonstratedRecordId);
  invariant(record.result?.evidenceTier === "federated-source-snapshot" && record.result?.record?.id === demonstratedRecordId, "Exact-record call did not retain the federated source-snapshot tier");
  invariant(record.result.record.collectionId === demonstratedSummary.collectionId, "Exact federated record collection does not match the fixed search result");
  invariant(record.result.record.sourceAuthority === "Not independently established", "Exact federated record must retain the not-independently-established authority label");
  invariant(record.result.record.linkRole === "producer-declared-source", "Exact federated record must retain the producer-declared-source link role");
  invariant(record.result.record.canonicalHumanUrl === null || new URL(record.result.record.canonicalHumanUrl).hostname !== inputs.excludedHostname, "Exact federated record published an excluded legislation link");
  invariant(record.result?.boundaries?.itemLevelReview === false && record.result?.boundaries?.evidenceReceiptAvailable === false, "Exact federated record must not claim item-level review or a receipt");
  assertBoundary(record.result.boundaries, "readOnly", true, "get_resource_record");
  assertBoundary(record.result.boundaries, "officialApiCall", false, "get_resource_record");
  assertBoundary(record.result.boundaries, "accessAuthorityGranted", false, "get_resource_record");
  invariant(provenanceCall.input?.recordId === demonstratedRecordId && provenanceCall.result?.recordId === demonstratedRecordId, "Provenance call did not use the demonstrated federated record");
  invariant(provenanceCall.result?.collection?.id === demonstratedSummary.collectionId, "Federated provenance collection does not match the fixed search result");
  invariant(provenanceCall.result?.evidenceTier === "federated-source-snapshot" && provenanceCall.result?.evidenceReceiptAvailable === false, "Federated provenance must retain its tier and no-item-receipt boundary");
  invariant(provenanceCall.result?.authoritativeLink?.url === null || new URL(provenanceCall.result.authoritativeLink.url).hostname !== inputs.excludedHostname, "Federated provenance published an excluded legislation link");
  const provenance = byName.get("show_provenance").result.boundaries;
  assertBoundary(provenance, "sameOriginSnapshotVerified", true, "show_provenance");
  assertBoundary(provenance, "sourceWasNotRefetchedAtRuntime", true, "show_provenance");
  assertBoundary(provenance, "itemLevelReview", false, "show_provenance");
  assertBoundary(provenance, "evidenceReceiptAvailable", false, "show_provenance");
  assertBoundary(provenance, "cryptographicSignatureVerified", false, "show_provenance");
  assertBoundary(provenance, "accessAuthorityGranted", false, "show_provenance");

  for (const name of ["explore_answer_foundations", "compare_evidence_foundations"]) {
    const boundaries = byName.get(name).result.boundaries;
    assertBoundary(boundaries, "providerCall", false, name);
    assertBoundary(boundaries, "storageWrite", false, name);
    assertBoundary(boundaries, "catalogueMutation", false, name);
    assertBoundary(boundaries, "externalStateChange", false, name);
    assertBoundary(boundaries, "presentationEffect", "transient-local-selection", name);
  }

  const exploration = byName.get("explore_answer_foundations");
  invariant(exploration.input?.answerId === inputs.reviewedAnswerId && inputs.reviewedClaimIds.includes(exploration.input?.claimId), "Exploration call did not use the reviewed evidence-tier example");
  const comparison = byName.get("compare_evidence_foundations");
  invariant(comparison.input?.answerId === inputs.reviewedAnswerId, "Comparison call used the wrong answer ID");
  invariant(sameValues(comparison.input?.claimIds, inputs.reviewedClaimIds), "Comparison call used the wrong claim IDs");
  invariant(comparison.result?.answerId === inputs.reviewedAnswerId, "Comparison result used the wrong answer ID");
  invariant(sameValues(comparison.result?.claimIds, inputs.reviewedClaimIds), "Comparison result used the wrong claim IDs");

  const presentation = byName.get("present_resource_evidence");
  invariant(presentation.input?.recordId === demonstratedRecordId, "Evidence presentation did not use the demonstrated federated record");
  invariant(presentation.result?.schema === "govuk-webmcp.present-resource-evidence-result.v1", "Evidence presentation returned the wrong result contract");
  invariant(presentation.result?.evidence?.selectionId === demonstratedRecordId, "Evidence presentation selected a different record");
  invariant(SHA256.test(presentation.result?.evidenceDigest), "Evidence presentation digest is malformed");

  const rejected = evidence.rejectedCall;
  exactKeys(rejected,
    ["name", "rejectedField", "inputFieldNames", "result", "canonicalResultDigest"],
    ["name", "rejectedField", "inputFieldNames", "result", "canonicalResultDigest"],
    "Supported-host rejected call");
  invariant(rejected?.name === "search_government_knowledge" && rejected.rejectedField === "personalContext", "Supported-host evidence must retain the rejected personalContext field name");
  invariant(sameSet(rejected.inputFieldNames, ["query", "personalContext"]), "Rejected-call evidence must retain field names only");
  invariant(rejected.result?.ok === false && rejected.result?.error?.code === "invalid_search_request", "personalContext must be rejected by executable validation");
  invariant(rejected.canonicalResultDigest === sha256Text(canonicalJson(rejected.result)), "Rejected-call digest does not match its captured result");

  const observation = evidence.finalPageObservation;
  exactKeys(observation,
    ["lastPresentationAction", "selectedRecordId", "displayEvidenceDigest", "toolEvidenceDigest", "digestParity"],
    ["lastPresentationAction", "selectedRecordId", "displayEvidenceDigest", "toolEvidenceDigest", "digestParity"],
    "Supported-host final page observation");
  invariant(observation.lastPresentationAction === "WebMCP: present_resource_evidence", "Final page observation does not record the Evidence answer action");
  invariant(observation.selectedRecordId === demonstratedRecordId, "Final page observation selected the wrong record");
  invariant(SHA256.test(observation.displayEvidenceDigest), "Displayed Evidence answer digest is malformed");
  invariant(observation.toolEvidenceDigest === presentation.result.evidenceDigest, "Recorded tool Evidence answer digest does not match the captured result");
  invariant(observation.displayEvidenceDigest === presentation.result.evidenceDigest && observation.digestParity === true, "Displayed Evidence answer digest does not match the tool result");
  const computedDigest = sha256Text(canonicalJson(presentation.result));
  return {
    canonicalCallResultDigest: computedDigest,
    demonstratedRecordId,
    fourSourceResultCount: search.result.results.length,
    host: evidence.host.name,
  };
}

export function validateVoiceOverEvidence(evidence, config) {
  exactKeys(evidence,
    ["schema", "observedAt", "page", "method", "manual", "assistiveTechnologyActuallyUsed", "withoutWebMCP", "noWcagConformanceClaim", "screenReaderAudioCaptured", "environment", "overallStatus", "journey", "limitations", "media"],
    ["schema", "observedAt", "page", "method", "manual", "assistiveTechnologyActuallyUsed", "withoutWebMCP", "noWcagConformanceClaim", "screenReaderAudioCaptured", "environment", "overallStatus", "journey", "limitations", "media"],
    "VoiceOver evidence");
  invariant(evidence?.schema === "trusted-govuk-discovery.manual-voiceover-journey.v1", "VoiceOver evidence has the wrong schema");
  validObservedAt(evidence.observedAt, "VoiceOver observedAt");
  validatePageIdentity(evidence.page, config, "VoiceOver evidence");
  invariant(evidence.method === "manual-operator-driven", "VoiceOver evidence method must be manual-operator-driven");
  invariant(evidence.manual === true && evidence.assistiveTechnologyActuallyUsed === true, "VoiceOver evidence must record genuine manual assistive-technology use");
  invariant(evidence.withoutWebMCP === true, "VoiceOver journey must record the human fallback without WebMCP");
  invariant(evidence.noWcagConformanceClaim === true, "VoiceOver evidence must retain the no-WCAG-conformance boundary");
  invariant(typeof evidence.screenReaderAudioCaptured === "boolean", "VoiceOver evidence must state whether screen-reader audio was captured");
  invariant(evidence.environment?.operatingSystem === "macOS", "VoiceOver evidence must identify macOS");
  nonEmptyString(evidence.environment?.operatingSystemVersion, "VoiceOver operating-system version", 80);
  nonEmptyString(evidence.environment?.operatingSystemBuild, "VoiceOver operating-system build", 80);
  invariant(evidence.environment?.browser === "Safari", "VoiceOver evidence must identify Safari");
  nonEmptyString(evidence.environment?.browserVersion, "VoiceOver Safari version", 80);
  invariant(evidence.environment?.screenReader === "VoiceOver", "VoiceOver evidence must identify VoiceOver");
  nonEmptyString(evidence.environment?.screenReaderVersion, "VoiceOver version", 80);
  invariant(["completed", "completed-with-limitations"].includes(evidence.overallStatus), "VoiceOver overall status is invalid");
  invariant(Array.isArray(evidence.journey), "VoiceOver evidence must contain a journey array");
  const journeyIds = evidence.journey.map(({ id }) => id);
  invariant(sameSet(journeyIds, requiredVoiceOverJourneyIds), "VoiceOver journey IDs must be exactly the required journey");
  for (const item of evidence.journey) {
    exactKeys(item, ["id", "result", "observation", "limitation", "details"], ["id", "result", "observation"], `VoiceOver journey ${item.id}`);
    invariant(["pass", "limitation", "issue-observed"].includes(item.result), `VoiceOver journey result is invalid for ${item.id}`);
    nonEmptyString(item.observation, `VoiceOver observation ${item.id}`, 1_500);
    if (item.result === "pass") invariant(item.limitation === undefined, `Passing VoiceOver journey ${item.id} must not claim a limitation`);
    else nonEmptyString(item.limitation, `VoiceOver limitation acknowledgement ${item.id}`, 1_000);
    if (item.id === "source-link-role-and-destination") {
      exactKeys(item.details,
        ["linkRole", "destinationHostname", "sourceAuthority"],
        ["linkRole", "destinationHostname", "sourceAuthority"],
        "VoiceOver source-link observation details");
      invariant(item.details.linkRole === "producer-declared-source", "VoiceOver source-link observation must retain the producer-declared-source role");
      hostname(item.details.destinationHostname, "VoiceOver source-link destination hostname");
      invariant(item.details.destinationHostname !== config.demonstrationInputs.excludedHostname, "VoiceOver source-link observation must not use the excluded legislation hostname");
      invariant(item.details.sourceAuthority === "Not independently established", "VoiceOver source-link observation must retain the not-independently-established authority label");
    } else invariant(item.details === undefined, `VoiceOver journey ${item.id} must not claim unrelated source-link details`);
  }
  invariant(Array.isArray(evidence.limitations) && evidence.limitations.length > 0, "VoiceOver evidence must record at least one limitation");
  for (const limitation of evidence.limitations) nonEmptyString(limitation, "VoiceOver limitation", 1_000);
  const nonPassing = evidence.journey.filter(({ result }) => result !== "pass");
  for (const item of nonPassing) invariant(evidence.limitations.includes(item.limitation), `VoiceOver journey ${item.id} has an unacknowledged limitation`);
  if (evidence.overallStatus === "completed") invariant(nonPassing.length === 0, "Completed VoiceOver evidence cannot contain limitations or observed issues");
  if (evidence.overallStatus === "completed-with-limitations") invariant(nonPassing.length > 0, "Completed-with-limitations VoiceOver evidence requires an acknowledged journey limitation or issue");
  exactKeys(evidence.media,
    ["path", "sha256", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt", "captureManifestPath", "captureManifestSha256"],
    ["path", "sha256", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt", "captureManifestPath", "captureManifestSha256"],
    "VoiceOver media binding");
  nonEmptyString(evidence.media.path, "VoiceOver media path", 300);
  invariant(SHA256.test(evidence.media.sha256), "VoiceOver media SHA-256 is invalid");
  nonEmptyString(evidence.media.captureManifestPath, "VoiceOver capture manifest path", 300);
  invariant(evidence.media.captureManifestPath.startsWith("output/voiceover-capture/") && evidence.media.captureManifestPath.endsWith(".json"), "VoiceOver capture manifest must stay beneath output/voiceover-capture");
  invariant(SHA256.test(evidence.media.captureManifestSha256), "VoiceOver capture manifest SHA-256 is invalid");
  invariant(Number.isFinite(evidence.media.startSeconds) && evidence.media.startSeconds >= 0 && Number.isFinite(evidence.media.endSeconds) && evidence.media.endSeconds > evidence.media.startSeconds, "VoiceOver media time range is invalid");
  validObservedAt(evidence.media.captureStartedAt, "VoiceOver media capture start");
  validObservedAt(evidence.media.captureEndedAt, "VoiceOver media capture end");
  invariant(Date.parse(evidence.media.captureEndedAt) >= Date.parse(evidence.media.captureStartedAt), "VoiceOver media capture range is invalid");
  invariant(Date.parse(evidence.observedAt) >= Date.parse(evidence.media.captureStartedAt) && Date.parse(evidence.observedAt) <= Date.parse(evidence.media.captureEndedAt), "VoiceOver observation must occur within the bound media capture range");
  return { overallStatus: evidence.overallStatus, screenReaderAudioCaptured: evidence.screenReaderAudioCaptured };
}

export function validateVoiceOverMediaBinding(evidence, scene, media) {
  invariant(evidence.media.path === scene.media.path, "VoiceOver evidence media path does not match its configured scene");
  invariant(evidence.media.sha256 === media.sha256, "VoiceOver evidence media SHA-256 does not match its configured scene");
  invariant(evidence.media.startSeconds === scene.media.startSeconds, "VoiceOver evidence media start does not match its configured scene");
  invariant(evidence.media.endSeconds <= media.durationSeconds, "VoiceOver evidence media range exceeds its configured clip");
}

export function validateHostMediaReceipt(receipt, config, scene, media, evidenceFile, artefactFiles) {
  exactKeys(receipt,
    ["schema", "builtAt", "page", "sourceEvidence", "sourceArtefacts", "rendering", "media"],
    ["schema", "builtAt", "page", "sourceEvidence", "sourceArtefacts", "rendering", "media"],
    "Supported-host media receipt");
  invariant(receipt.schema === "trusted-govuk-discovery.supported-host-webmcp-clip.v1", "Supported-host media receipt has the wrong schema");
  validObservedAt(receipt.builtAt, "Supported-host media build time");
  validatePageIdentity(receipt.page, config, "Supported-host media receipt");
  exactKeys(receipt.sourceEvidence, ["path", "sha256"], ["path", "sha256"], "Supported-host source evidence binding");
  invariant(receipt.sourceEvidence.path === evidenceFile.relativePath && receipt.sourceEvidence.sha256 === evidenceFile.sha256, "Supported-host media receipt is not bound to the exact host evidence bytes");
  invariant(Array.isArray(receipt.sourceArtefacts) && receipt.sourceArtefacts.length === artefactFiles.size, "Supported-host media receipt does not bind every host artefact");
  for (const binding of receipt.sourceArtefacts) {
    exactKeys(binding, ["path", "sha256"], ["path", "sha256"], "Supported-host source artefact binding");
    const artefact = artefactFiles.get(binding.path);
    invariant(artefact && binding.sha256 === artefact.sha256, `Supported-host media receipt artefact binding is wrong for ${String(binding.path)}`);
  }
  exactKeys(receipt.rendering,
    ["kind", "hostRecordingEmbedded", "hostOwnedSurfaceEmbedded", "visibleLabel"],
    ["kind", "hostRecordingEmbedded", "hostOwnedSurfaceEmbedded", "visibleLabel"],
    "Supported-host media rendering boundary");
  invariant(receipt.rendering.kind === "receipt-reconstruction" && receipt.rendering.hostRecordingEmbedded === false, "Supported-host media must remain a receipt reconstruction, not a host recording");
  invariant(typeof receipt.rendering.hostOwnedSurfaceEmbedded === "boolean", "Supported-host media receipt must state whether a host-owned surface was embedded");
  invariant(receipt.rendering.visibleLabel === "Receipt reconstruction — not a host recording", "Supported-host media must retain its exact reconstruction label");
  exactKeys(receipt.media,
    ["path", "sha256", "durationSeconds", "startSeconds", "endSeconds"],
    ["path", "sha256", "durationSeconds", "startSeconds", "endSeconds"],
    "Supported-host media binding");
  invariant(receipt.media.path === scene.media.path && receipt.media.sha256 === media.sha256, "Supported-host media receipt path or SHA-256 does not match the configured clip");
  invariant(receipt.media.startSeconds === scene.media.startSeconds && receipt.media.endSeconds <= media.durationSeconds, "Supported-host media receipt time range does not fit the configured clip");
  invariant(Number.isFinite(receipt.media.durationSeconds) && Math.abs(receipt.media.durationSeconds - media.durationSeconds) <= 0.05, "Supported-host media receipt duration does not match the configured clip");
  return {
    kind: receipt.rendering.kind,
    sourceArtefactCount: receipt.sourceArtefacts.length,
    durationSeconds: receipt.media.durationSeconds,
  };
}

function validatePersonalAgentRunMatrix(capture) {
  invariant(capture?.schema === "govuk-webmcp.personal-agent-evaluation-capture.v2", "Personal-agent source capture has the wrong schema");
  invariant(capture.suiteId === "beginner-evidence-v1" && capture.comparisonDesign === "observational", "Personal-agent source capture has the wrong suite or comparison design");
  invariant(SHA256.test(capture.caseSetSha256), "Personal-agent source capture has an invalid case-set digest");
  invariant(Array.isArray(capture.runs) && capture.runs.length === EXPECTED_RUN_COUNT, "Personal-agent source capture must contain the complete 72-run matrix");
  const keys = capture.runs.map(({ hostId, caseId, repetition }) => `${hostId}/${caseId}/${repetition}`);
  invariant(new Set(keys).size === EXPECTED_RUN_COUNT, "Personal-agent source capture contains duplicate run identities");
  for (const hostId of ["copilot-mcp-workspace", "ollama-local"]) {
    invariant(capture.runs.filter((run) => run.hostId === hostId).length === EXPECTED_RUN_COUNT / 2, `Personal-agent source capture must contain 36 ${hostId} runs`);
  }
}

function authenticatedClaimGate(summary) {
  const criteria = Object.values(summary.criteria ?? {});
  const criterionFailure = criteria.some((counts) => (counts.fail ?? 0) > 0);
  const criterionUnknown = criteria.some((counts) => (counts["not-observable"] ?? 0) > 0 || (counts["not-reviewed"] ?? 0) > 0);
  const privacy = Object.entries(summary.privacyChecks ?? {}).filter(([field]) => field !== "publicSummary");
  const privacyFailure = privacy.some(([, counts]) => (counts.fail ?? 0) > 0);
  const privacyUnknown = privacy.some(([, counts]) => (counts["not-observable"] ?? 0) > 0 || (counts.missing ?? 0) > 0);
  return summary.matrixComplete === true
    && !criterionFailure
    && !criterionUnknown
    && !privacyFailure
    && !privacyUnknown
    && summary.executionContext?.incomplete === 0
    && summary.answerOutcomes?.unsafe === 0
    && summary.answerOutcomes?.["not-reviewed"] === 0
    && summary.reviewerClasses?.agent === 0
    && summary.reviewerClasses?.["not-reviewed"] === 0;
}

export function validateAuthenticatedPersonalAgentSummary(authenticated, structural, config, sourceCapture, liveRelease) {
  const keys = [
    "schema", "suiteId", "caseSetSha256", "comparisonDesign", "causalClaimSupported", "evidenceStatus",
    "plannedRunCount", "observedRunCount", "missingRunCount", "missingRunKeys", "matrixComplete",
    "observationWindow", "hosts", "liveReleaseBinding", "executionContext", "criteria", "answerOutcomes",
    "reviewerClasses", "unsafeCategoryCounts", "privacyChecks", "claimGatePassed",
  ];
  exactKeys(authenticated, keys, keys, "Authenticated personal-agent summary");
  invariant(authenticated.schema === "govuk-webmcp.personal-agent-evaluation-summary.v2" && authenticated.suiteId === "beginner-evidence-v1" && authenticated.comparisonDesign === "observational" && authenticated.causalClaimSupported === false, "Authenticated personal-agent summary has the wrong identity or causal boundary");
  invariant(authenticated.caseSetSha256 === sourceCapture.caseSetSha256 && authenticated.plannedRunCount === EXPECTED_RUN_COUNT && authenticated.observedRunCount === EXPECTED_RUN_COUNT && authenticated.missingRunCount === 0 && authenticated.missingRunKeys.length === 0 && authenticated.matrixComplete === true, "Authenticated personal-agent summary does not bind the complete source matrix");
  invariant(authenticated.liveReleaseBinding?.status === "authenticated" && authenticated.liveReleaseBinding.repository === liveRelease.repository && authenticated.liveReleaseBinding.baseUrl === config.productUrl && authenticated.liveReleaseBinding.commit === config.productCommit && authenticated.liveReleaseBinding.runId === config.pagesRunId && authenticated.liveReleaseBinding.manifestSha256 === liveRelease.manifestSha256, "Authenticated personal-agent summary does not bind the configured live release");
  const expected = structuredClone(structural);
  expected.liveReleaseBinding.status = "authenticated";
  expected.evidenceStatus = expected.observedRunCount === 0 ? "planned-unrun" : expected.matrixComplete ? "complete" : "partial";
  expected.claimGatePassed = authenticatedClaimGate(expected);
  invariant(canonicalJson(authenticated) === canonicalJson(expected), "Authenticated personal-agent summary does not match a fresh structural replay of the exact source capture");
  return Object.freeze({
    status: "authenticated",
    claimGatePassed: authenticated.claimGatePassed,
    caseSetSha256: authenticated.caseSetSha256,
  });
}

function validatePersonalAgentExecutionContext(run, config, contract) {
  const context = run.executionContext;
  invariant(context?.hostVersion?.status === "observed", `${contract.product} version must have been observed in the private capture`);
  invariant(context?.browser?.status === "observed", `${contract.product} browser identity must have been observed in the private capture`);
  invariant(context?.exposedTools?.status === "observed" && sameValues(context.exposedTools.names, expectedToolNames), `${contract.product} must expose the exact six Site tools`);
  invariant(context.visibleMode === "visible" || (contract.hostId === "ollama-local" && context.visibleMode === "headless"), `${contract.product} has the wrong visible-mode observation`);
  invariant(context.deployment?.commitSha === config.productCommit, `${contract.product} is not bound to the configured release commit`);
  if (contract.hostId === "copilot-mcp-workspace") {
    invariant(context.browser.product === "Microsoft Edge" && context.visibleMode === "visible", "Copilot media must show a visible Microsoft Edge MCP Workspace run");
    invariant(context.deployment.kind === "public-pages" && context.deployment.url === config.productUrl && context.deployment.worktreeStatus === "not-applicable", "Copilot media must bind the canonical public Pages deployment");
    invariant(context.share?.status === "observed" && /^https:\/\/copilot\.microsoft\.com\/shares\/[A-Za-z0-9]{16,80}$/u.test(context.share.url), "Copilot media must bind an observed canonical private share link");
    invariant(run.hostIdentity?.modelStatus === "not-disclosed" && run.hostIdentity.model === null && run.hostIdentity.inventorySha256 === null && run.hostIdentity.executionBound === "not-observable", "Copilot media must retain the undisclosed model boundary");
  } else {
    const deploymentUrl = new URL(context.deployment?.url);
    invariant(context.deployment.kind === "local-loopback" && context.deployment.worktreeStatus === "clean", "Ollama media must bind a clean local-loopback deployment");
    invariant(deploymentUrl.protocol === "http:" && deploymentUrl.hostname === "127.0.0.1" && deploymentUrl.port !== "" && deploymentUrl.pathname === "/" && deploymentUrl.search === "" && deploymentUrl.hash === "" && deploymentUrl.href === context.deployment.url, "Ollama media must use an exact credential-free loopback root URL");
    invariant(run.hostIdentity?.modelStatus === "observed-exact" && run.hostIdentity.model === LOCAL_MODEL && run.hostIdentity.inventorySha256 === LOCAL_MODEL_INVENTORY_SHA256 && run.hostIdentity.executionBound === true, "Ollama media must bind the exact pinned local model and inventory digest");
  }
}

export function validatePersonalAgentCaptureEvidence(
  receipt,
  config,
  scene,
  media,
  sourceCaptureFile,
  sourceCapture,
  authenticatedSummaryFile,
  authenticatedSummaryBinding,
  liveReleaseFile,
  liveRelease,
) {
  const contract = personalAgentSceneContracts[scene.id];
  invariant(contract, `Scene ${scene.id} has no personal-agent media contract`);
  exactKeys(receipt,
    ["schema", "capturedAt", "release", "host", "sourceEvaluation", "liveRelease", "capture", "reviews", "media", "limitations"],
    ["schema", "capturedAt", "release", "host", "sourceEvaluation", "liveRelease", "capture", "reviews", "media", "limitations"],
    `Personal-agent capture ${scene.id}`);
  invariant(receipt.schema === "govuk-webmcp.personal-agent-video-capture.v1", `Personal-agent capture ${scene.id} has the wrong schema`);
  validObservedAt(receipt.capturedAt, `Personal-agent capture ${scene.id} timestamp`);
  validatePageIdentity(receipt.release, config, `Personal-agent capture ${scene.id}`);

  exactKeys(receipt.host, ["id", "arrangement", "product"], ["id", "arrangement", "product"], `Personal-agent host ${scene.id}`);
  invariant(receipt.host.id === contract.hostId && receipt.host.arrangement === contract.arrangement && receipt.host.product === contract.product, `Personal-agent capture ${scene.id} has the wrong host identity`);

  exactKeys(receipt.sourceEvaluation,
    ["path", "sha256", "schema", "suiteId", "caseSetSha256", "caseId", "repetition", "authenticatedSummaryPath", "authenticatedSummarySha256", "claimGatePassed"],
    ["path", "sha256", "schema", "suiteId", "caseSetSha256", "caseId", "repetition", "authenticatedSummaryPath", "authenticatedSummarySha256", "claimGatePassed"],
    `Personal-agent evaluation binding ${scene.id}`);
  invariant(receipt.sourceEvaluation.path === expectedPrivateEvaluationCapture && sourceCaptureFile.relativePath === expectedPrivateEvaluationCapture, `Personal-agent capture ${scene.id} must use the fixed private evaluation path`);
  invariant(receipt.sourceEvaluation.sha256 === sourceCaptureFile.sha256, `Personal-agent capture ${scene.id} is not bound to the exact private evaluation bytes`);
  invariant(receipt.sourceEvaluation.schema === "govuk-webmcp.personal-agent-evaluation-capture.v2" && receipt.sourceEvaluation.suiteId === "beginner-evidence-v1", `Personal-agent capture ${scene.id} has the wrong source evaluation identity`);
  invariant(receipt.sourceEvaluation.caseSetSha256 === sourceCapture.caseSetSha256, `Personal-agent capture ${scene.id} has the wrong case-set digest`);
  invariant(receipt.sourceEvaluation.caseId === contract.caseId && receipt.sourceEvaluation.repetition === contract.repetition, `Personal-agent capture ${scene.id} selects the wrong evaluation run`);
  invariant(receipt.sourceEvaluation.authenticatedSummaryPath === expectedPrivateAuthenticatedSummary && authenticatedSummaryFile.relativePath === expectedPrivateAuthenticatedSummary && receipt.sourceEvaluation.authenticatedSummarySha256 === authenticatedSummaryFile.sha256, `Personal-agent capture ${scene.id} is not bound to the exact authenticated evaluation summary`);
  invariant(authenticatedSummaryBinding.status === "authenticated" && receipt.sourceEvaluation.claimGatePassed === authenticatedSummaryBinding.claimGatePassed, `Personal-agent capture ${scene.id} does not retain the authenticated evaluation claim status`);
  validatePersonalAgentRunMatrix(sourceCapture);

  exactKeys(receipt.liveRelease, ["path", "sha256", "schema"], ["path", "sha256", "schema"], `Personal-agent live-release binding ${scene.id}`);
  invariant(receipt.liveRelease.path === expectedPrivateLiveReleaseReceipt && liveReleaseFile.relativePath === expectedPrivateLiveReleaseReceipt, `Personal-agent capture ${scene.id} must use the fixed private live-release receipt path`);
  invariant(receipt.liveRelease.sha256 === liveReleaseFile.sha256 && receipt.liveRelease.schema === "govuk-webmcp.live-pages-verification.v2", `Personal-agent capture ${scene.id} is not bound to the exact live-release receipt`);
  invariant(liveRelease.commit === config.productCommit && liveRelease.runId === config.pagesRunId && liveRelease.baseUrl === config.productUrl, `Personal-agent capture ${scene.id} does not match the configured live release`);

  const selectedRuns = sourceCapture.runs.filter(({ hostId, caseId, repetition }) =>
    hostId === contract.hostId && caseId === contract.caseId && repetition === contract.repetition);
  invariant(selectedRuns.length === 1, `Personal-agent capture ${scene.id} does not identify one exact evaluation run`);
  const [run] = selectedRuns;
  validObservedAt(run.observedAt, `Personal-agent run ${scene.id} timestamp`);
  validatePersonalAgentExecutionContext(run, config, contract);
  invariant(["observed", "not-observable"].includes(run.callTrace?.status), `Personal-agent capture ${scene.id} has an invalid call-trace state`);
  const callTraceObserved = run.callTrace.status === "observed";
  invariant(callTraceObserved || contract.hostId === "copilot-mcp-workspace", `Personal-agent capture ${scene.id} requires a complete observable call trace`);
  invariant(callTraceObserved ? Array.isArray(run.callTrace.calls) && run.callTrace.calls.length > 0 : run.callTrace.calls === null, `Personal-agent capture ${scene.id} has an inconsistent call trace`);
  const toolCallNames = callTraceObserved ? run.callTrace.calls.map(({ name }) => name) : null;
  if (callTraceObserved) {
    invariant(new Set(toolCallNames).size === toolCallNames.length && toolCallNames.every((name) => expectedToolNames.includes(name)), `Personal-agent capture ${scene.id} contains an invalid or repeated Site tool call`);
    invariant(toolCallNames.includes("present_resource_evidence"), `Personal-agent capture ${scene.id} did not call the Evidence answer presentation tool`);
  }
  invariant(run.pageObservation?.status === "observed" && run.pageObservation.after?.renderedEvidence !== null, `Personal-agent capture ${scene.id} did not observe an Evidence answer update`);
  exactKeys(run.criteria, ["toolSelection", "deterministicExecution", "pageParity", "answerSafety"], ["toolSelection", "deterministicExecution", "pageParity", "answerSafety"], `Personal-agent criteria ${scene.id}`);
  invariant(run.criteria.deterministicExecution === "pass" && run.criteria.pageParity === "pass" && run.criteria.answerSafety === "pass", `Personal-agent capture ${scene.id} has a material evaluation criterion that did not pass`);
  invariant(run.criteria.toolSelection === (callTraceObserved ? "pass" : "not-observable"), `Personal-agent capture ${scene.id} overstates its tool-selection observation`);
  invariant(run.answerReview?.status === "reviewed" && run.answerReview.outcome === "usable" && ["human", "domain-specialist"].includes(run.answerReview.reviewerClass), `Personal-agent capture ${scene.id} requires a usable human-reviewed answer`);

  exactKeys(receipt.capture,
    ["method", "genuineScreenRecording", "hostSurfaceVisible", "siteToolsVisible", "siteToolInvocationVisible", "evidenceAnswerUpdateVisible", "reconstructed", "sourceAudioIncluded", "browserChromeIncluded", "accountEmailVisible", "avatarVisible", "unrelatedBrowserContentVisible", "redactionsApplied", "callTraceStatus", "toolCallNames", "selectedRecordId", "evidenceDigest"],
    ["method", "genuineScreenRecording", "hostSurfaceVisible", "siteToolsVisible", "siteToolInvocationVisible", "evidenceAnswerUpdateVisible", "reconstructed", "sourceAudioIncluded", "browserChromeIncluded", "accountEmailVisible", "avatarVisible", "unrelatedBrowserContentVisible", "redactionsApplied", "callTraceStatus", "toolCallNames", "selectedRecordId", "evidenceDigest"],
    `Personal-agent recording boundary ${scene.id}`);
  invariant(receipt.capture.method === contract.captureMethod, `Personal-agent capture ${scene.id} has the wrong recording method`);
  invariant(receipt.capture.genuineScreenRecording === true && receipt.capture.hostSurfaceVisible === true && receipt.capture.siteToolsVisible === true && receipt.capture.siteToolInvocationVisible === true && receipt.capture.evidenceAnswerUpdateVisible === true && receipt.capture.reconstructed === false, `Personal-agent capture ${scene.id} must be a genuine visible recording, not a reconstruction`);
  invariant(receipt.capture.sourceAudioIncluded === false, `Personal-agent capture ${scene.id} must omit source audio from the final edit`);
  invariant(typeof receipt.capture.browserChromeIncluded === "boolean" && (contract.hostId !== "copilot-mcp-workspace" || receipt.capture.browserChromeIncluded === true), `Copilot capture ${scene.id} must visibly identify Microsoft Edge MCP Workspace`);
  invariant(receipt.capture.accountEmailVisible === false && receipt.capture.avatarVisible === false && receipt.capture.unrelatedBrowserContentVisible === false, `Personal-agent capture ${scene.id} exposes an account email, avatar or unrelated browser content`);
  invariant(Array.isArray(receipt.capture.redactionsApplied) && new Set(receipt.capture.redactionsApplied).size === receipt.capture.redactionsApplied.length && receipt.capture.redactionsApplied.every((redaction) => ["account-email", "profile-image", "unrelated-browser-content"].includes(redaction)), `Personal-agent capture ${scene.id} has an invalid redaction record`);
  if (contract.hostId === "copilot-mcp-workspace") invariant(sameSet(receipt.capture.redactionsApplied, ["account-email", "profile-image", "unrelated-browser-content"]), `Copilot capture ${scene.id} must record all three required privacy redactions`);
  invariant(receipt.capture.callTraceStatus === run.callTrace.status, `Personal-agent capture ${scene.id} call-trace status does not match the exact private run`);
  invariant(callTraceObserved ? sameValues(receipt.capture.toolCallNames, toolCallNames) : receipt.capture.toolCallNames === null, `Personal-agent capture ${scene.id} tool-call names do not match the exact private run`);
  const after = run.pageObservation.after;
  invariant(receipt.capture.selectedRecordId === after.renderedEvidence.selectionId && FEDERATED_RECORD_ID.test(receipt.capture.selectedRecordId), `Personal-agent capture ${scene.id} selected the wrong Evidence answer record`);
  invariant(receipt.capture.evidenceDigest === after.evidenceDigest && SHA256.test(receipt.capture.evidenceDigest), `Personal-agent capture ${scene.id} has the wrong Evidence answer digest`);

  exactKeys(receipt.reviews,
    ["privacy", "branding", "content", "reviewerClass", "reviewedAt"],
    ["privacy", "branding", "content", "reviewerClass", "reviewedAt"],
    `Personal-agent clip reviews ${scene.id}`);
  invariant(receipt.reviews.privacy === "human-reviewed-redaction-pass" && receipt.reviews.branding === "human-reviewed-contextual-use-pass" && receipt.reviews.content === "owner-reviewed-pass" && receipt.reviews.reviewerClass === "owner-human", `Personal-agent capture ${scene.id} has not passed every clip-level human review gate`);
  validObservedAt(receipt.reviews.reviewedAt, `Personal-agent clip review ${scene.id}`);

  exactKeys(receipt.media,
    ["path", "sha256", "durationSeconds", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt"],
    ["path", "sha256", "durationSeconds", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt"],
    `Personal-agent media binding ${scene.id}`);
  invariant(receipt.media.path === scene.media.path && receipt.media.sha256 === media.sha256, `Personal-agent capture ${scene.id} does not bind the exact configured clip`);
  invariant(Number.isFinite(receipt.media.durationSeconds) && Math.abs(receipt.media.durationSeconds - media.durationSeconds) <= 0.05, `Personal-agent capture ${scene.id} duration does not match its clip`);
  invariant(receipt.media.startSeconds === scene.media.startSeconds && receipt.media.endSeconds > receipt.media.startSeconds && receipt.media.endSeconds <= media.durationSeconds, `Personal-agent capture ${scene.id} has an invalid media range`);
  validObservedAt(receipt.media.captureStartedAt, `Personal-agent capture ${scene.id} media start`);
  validObservedAt(receipt.media.captureEndedAt, `Personal-agent capture ${scene.id} media end`);
  const captureStart = Date.parse(receipt.media.captureStartedAt);
  const captureEnd = Date.parse(receipt.media.captureEndedAt);
  invariant(captureEnd >= captureStart && Date.parse(receipt.capturedAt) >= captureStart && Date.parse(receipt.capturedAt) <= captureEnd && Date.parse(run.observedAt) >= captureStart && Date.parse(run.observedAt) <= captureEnd, `Personal-agent capture ${scene.id} timestamps do not bind the recorded run`);
  invariant(Date.parse(receipt.reviews.reviewedAt) >= captureEnd, `Personal-agent capture ${scene.id} was marked reviewed before recording ended`);
  invariant(Array.isArray(receipt.limitations) && receipt.limitations.length > 0, `Personal-agent capture ${scene.id} must state its limitations`);
  for (const limitation of receipt.limitations) nonEmptyString(limitation, `Personal-agent limitation ${scene.id}`, 1_000);
  invariant(receipt.limitations.some((limitation) => /observational/iu.test(limitation) && /causal/iu.test(limitation)), `Personal-agent capture ${scene.id} must retain the observational, non-causal comparison boundary`);
  if (!callTraceObserved) invariant(receipt.limitations.some((limitation) => /call trace/iu.test(limitation) && /not observable/iu.test(limitation)), `Personal-agent capture ${scene.id} must disclose that its exact call trace was not observable`);
  if (!authenticatedSummaryBinding.claimGatePassed) invariant(receipt.limitations.some((limitation) => /claim gate/iu.test(limitation) && /did not pass/iu.test(limitation)), `Personal-agent capture ${scene.id} must disclose that the authenticated evaluation claim gate did not pass`);

  return {
    hostId: contract.hostId,
    caseId: contract.caseId,
    repetition: contract.repetition,
    callTraceStatus: run.callTrace.status,
    toolCallNames,
    selectionId: receipt.capture.selectedRecordId,
    evidenceDigest: receipt.capture.evidenceDigest,
    evaluationClaimGatePassed: authenticatedSummaryBinding.claimGatePassed,
    genuineScreenRecording: true,
    clipLevelHumanReviewsPassed: true,
  };
}

export function validateInteractionCaptureEvidence(evidence, config, interactionScenes, mediaById) {
  exactKeys(evidence,
    ["schema", "capturedAt", "page", "deployment", "demonstration", "captureMethod", "browser", "reviews", "noBrowserChrome", "audioCaptured", "clips"],
    ["schema", "capturedAt", "page", "deployment", "demonstration", "captureMethod", "browser", "reviews", "noBrowserChrome", "audioCaptured", "clips"],
    "Live interaction capture receipt");
  invariant(evidence.schema === "govuk-webmcp.demo-live-interaction-capture.v3", "Live interaction capture receipt has the wrong schema");
  validatePageIdentity(evidence.page, config, "Live interaction capture receipt");
  exactKeys(evidence.deployment, ["metadataUrl", "metadataSha256"], ["metadataUrl", "metadataSha256"], "Live interaction capture deployment binding");
  invariant(evidence.deployment.metadataUrl === new URL("deployment.json", config.productUrl).href, "Live interaction capture deployment metadata URL is wrong");
  invariant(SHA256.test(evidence.deployment.metadataSha256), "Live interaction capture deployment metadata SHA-256 is invalid");
  exactKeys(evidence.demonstration,
    ["query", "collections", "limit", "federatedRecordId", "reviewedAnswerId", "reviewedClaimIds", "excludedHostname"],
    ["query", "collections", "limit", "federatedRecordId", "reviewedAnswerId", "reviewedClaimIds", "excludedHostname"],
    "Live interaction demonstration binding");
  invariant(evidence.demonstration.query === config.demonstrationInputs.query, "Live interaction query does not match the script");
  invariant(sameValues(evidence.demonstration.collections, config.demonstrationInputs.collections), "Live interaction collections do not match the script");
  invariant(evidence.demonstration.limit === config.demonstrationInputs.limit, "Live interaction limit does not match the script");
  invariant(FEDERATED_RECORD_ID.test(evidence.demonstration.federatedRecordId), "Live interaction federated record ID is not canonical");
  invariant(evidence.demonstration.reviewedAnswerId === config.demonstrationInputs.reviewedAnswerId, "Live interaction reviewed answer does not match the script");
  invariant(sameValues(evidence.demonstration.reviewedClaimIds, config.demonstrationInputs.reviewedClaimIds), "Live interaction reviewed claims do not match the script");
  invariant(evidence.demonstration.excludedHostname === config.demonstrationInputs.excludedHostname, "Live interaction exclusion does not match the script");
  invariant(evidence.captureMethod === "playwright-public-site-interaction", "Live interaction capture receipt must record the public-site Playwright method");
  exactKeys(evidence.browser, ["name", "version"], ["name", "version"], "Live interaction capture browser");
  nonEmptyString(evidence.browser.name, "Live interaction capture browser name", 80);
  nonEmptyString(evidence.browser.version, "Live interaction capture browser version", 160);
  validObservedAt(evidence.capturedAt, "Live interaction capture timestamp");
  exactKeys(evidence.reviews, ["privacy", "branding", "humanPublicationReview"], ["privacy", "branding", "humanPublicationReview"], "Live interaction capture reviews");
  invariant(evidence.reviews.privacy === "agent-reviewed-pass" && evidence.reviews.branding === "agent-reviewed-pass" && evidence.reviews.humanPublicationReview === "pending", "Live interaction capture receipt must retain the guarded local-review status");
  invariant(evidence.noBrowserChrome === true && evidence.audioCaptured === false, "Live interaction capture receipt must record a chrome-free, silent capture");
  invariant(Array.isArray(evidence.clips), "Live interaction capture receipt must contain clips");
  const expectedIds = interactionScenes.map(({ id }) => id);
  invariant(sameSet(evidence.clips.map(({ sceneId }) => sceneId), expectedIds), "Live interaction capture receipt must contain exactly the configured interaction scenes");
  for (const clip of evidence.clips) {
    exactKeys(clip, ["sceneId", "path", "sha256", "durationSeconds", "capturedAt", "actions", "sourceUrl", "observation"], ["sceneId", "path", "sha256", "durationSeconds", "capturedAt", "actions", "sourceUrl", "observation"], `Live interaction clip ${clip.sceneId}`);
    const scene = interactionScenes.find(({ id }) => id === clip.sceneId);
    const media = mediaById.get(clip.sceneId);
    invariant(scene && media, `Live interaction clip ${clip.sceneId} has no configured scene media`);
    invariant(clip.path === scene.media.path && clip.sha256 === media.sha256, `Live interaction clip ${clip.sceneId} does not match its configured media`);
    invariant(Number.isFinite(clip.durationSeconds) && clip.durationSeconds > 0 && Math.abs(clip.durationSeconds - media.durationSeconds) <= 0.05, `Live interaction clip ${clip.sceneId} duration does not match its media`);
    validObservedAt(clip.capturedAt, `Live interaction clip ${clip.sceneId} capture timestamp`);
    const configuredUrl = new URL(config.productUrl);
    const sourceUrl = new URL(clip.sourceUrl);
    invariant(sourceUrl.origin === configuredUrl.origin && sourceUrl.pathname === configuredUrl.pathname && sourceUrl.search === "" && (!sourceUrl.hash || /^#(?:view|answer|claim|record|foundation|compare)=[A-Za-z0-9%:,_-]+(?:&(?:view|answer|claim|record|foundation|compare)=[A-Za-z0-9%:,_-]+)*$/u.test(sourceUrl.hash)), `Live interaction clip ${clip.sceneId} source URL does not identify the configured release`);
    invariant(Array.isArray(clip.actions) && clip.actions.length > 0, `Live interaction clip ${clip.sceneId} must record actions`);
    invariant(sameValues(clip.actions, scene.requiredActions), `Live interaction clip ${clip.sceneId} actions do not match the required scene actions`);
  }

  const byId = new Map(evidence.clips.map((clip) => [clip.sceneId, clip]));
  const initial = byId.get("evidence-answer")?.observation;
  exactKeys(initial,
    ["activeView", "heading", "activity", "presentationState"],
    ["activeView", "heading", "activity", "presentationState"],
    "Initial Evidence answer observation");
  invariant(initial.activeView === "guided" && initial.heading === "Evidence answer", "Bare URL did not open the Evidence answer view");
  invariant(initial.activity === "No AI action was presented to this page." && initial.presentationState === "empty", "Initial Evidence answer overstates an action or selection");

  const presented = byId.get("present-evidence")?.observation;
  exactKeys(presented,
    ["query", "collections", "limit", "selectedRecordId", "resultKind", "evidenceDigest", "sourceCount", "limitationCount", "routeView"],
    ["query", "collections", "limit", "selectedRecordId", "resultKind", "evidenceDigest", "sourceCount", "limitationCount", "routeView"],
    "Presented Evidence answer observation");
  invariant(presented.query === evidence.demonstration.query && sameValues(presented.collections, evidence.demonstration.collections) && presented.limit === evidence.demonstration.limit, "Presented Evidence answer does not retain the fixed search input");
  invariant(presented.selectedRecordId === evidence.demonstration.federatedRecordId && FEDERATED_RECORD_ID.test(presented.selectedRecordId), "Presented Evidence answer used the wrong record");
  invariant(presented.resultKind === "resource-record" && SHA256.test(presented.evidenceDigest), "Presented Evidence answer lost its result kind or digest");
  invariant(Number.isInteger(presented.sourceCount) && presented.sourceCount > 0 && Number.isInteger(presented.limitationCount) && presented.limitationCount > 0, "Presented Evidence answer must retain a source and limitation");
  invariant(presented.routeView === "guided", "Human presentation did not navigate to Evidence answer");

  const guide = byId.get("comparison-guide")?.observation;
  exactKeys(guide,
    ["selectedRecordId", "evidenceDigest", "guideHeadings", "sourceLinkCount", "limitationCount"],
    ["selectedRecordId", "evidenceDigest", "guideHeadings", "sourceLinkCount", "limitationCount"],
    "Evidence comparison-guide observation");
  invariant(guide.selectedRecordId === presented.selectedRecordId && guide.evidenceDigest === presented.evidenceDigest, "Comparison guide does not show the same deterministic Evidence answer");
  invariant(sameValues(guide.guideHeadings, ["From this page", "From your AI", "Check carefully"]), "Comparison guide lost one of its three plain-English perspectives");
  invariant(guide.sourceLinkCount > 0 && guide.limitationCount > 0, "Comparison guide capture lost source or limitation evidence");

  const technical = byId.get("technical-review")?.observation;
  exactKeys(technical,
    ["activeView", "answerId", "claimIds", "comparisonRowCount", "expectedToolCount", "trustScoreShown", "legacyRoutePreserved"],
    ["activeView", "answerId", "claimIds", "comparisonRowCount", "expectedToolCount", "trustScoreShown", "legacyRoutePreserved"],
    "Technical review observation");
  invariant(technical.activeView === "technical" && technical.legacyRoutePreserved === true, "Legacy evidence route did not preserve Technical review");
  invariant(technical.answerId === evidence.demonstration.reviewedAnswerId && sameValues(technical.claimIds, evidence.demonstration.reviewedClaimIds), "Technical review used the wrong reviewed answer or claims");
  invariant(technical.comparisonRowCount === 11 && technical.expectedToolCount === 6 && technical.trustScoreShown === false, "Technical review lost comparison, six-tool or no-score behaviour");

  const boundary = byId.get("boundary")?.observation;
  exactKeys(boundary,
    ["sameOriginOnly", "browserStorage", "modelProviderRequestCount", "officialApiRequestCount", "landRegistryMetadataOnly", "standaloneLegislationCollection", "standaloneLegislationPayload", "standaloneLegislationIndex", "legislationRuntimeRequestCount", "excludedHostnameResultLinkCount", "impactClaimsFramedAsHypotheses", "remoteProviderDisclosureVisible", "expectedToolCount", "reviewedRecordCount", "federatedSourceRecordCount", "federatedRecordCount", "federatedQuarantinedRecordCount"],
    ["sameOriginOnly", "browserStorage", "modelProviderRequestCount", "officialApiRequestCount", "landRegistryMetadataOnly", "standaloneLegislationCollection", "standaloneLegislationPayload", "standaloneLegislationIndex", "legislationRuntimeRequestCount", "excludedHostnameResultLinkCount", "impactClaimsFramedAsHypotheses", "remoteProviderDisclosureVisible", "expectedToolCount", "reviewedRecordCount", "federatedSourceRecordCount", "federatedRecordCount", "federatedQuarantinedRecordCount"],
    "Boundary observation");
  exactKeys(boundary.browserStorage, ["local", "session", "cookies"], ["local", "session", "cookies"], "Boundary browser storage observation");
  invariant(boundary.sameOriginOnly === true && boundary.browserStorage.local === 0 && boundary.browserStorage.session === 0 && boundary.browserStorage.cookies === "", "Boundary observation must retain same-origin-only, storage-free execution");
  invariant(boundary.modelProviderRequestCount === 0 && boundary.officialApiRequestCount === 0, "Boundary observation recorded a model-provider or official-API runtime request");
  invariant(boundary.landRegistryMetadataOnly === true, "Boundary observation must retain the HM Land Registry metadata-only scope");
  invariant(boundary.standaloneLegislationCollection === false && boundary.standaloneLegislationPayload === false && boundary.standaloneLegislationIndex === false && boundary.legislationRuntimeRequestCount === 0 && boundary.excludedHostnameResultLinkCount === 0, "Boundary observation lost the legislation.gov.uk exclusion");
  invariant(boundary.impactClaimsFramedAsHypotheses === true && boundary.remoteProviderDisclosureVisible === true, "Boundary observation must retain the impact-hypothesis and remote-provider disclosure");
  invariant(boundary.expectedToolCount === 6, "Boundary observation must retain the six-tool contract");
  invariant(boundary.reviewedRecordCount === 80 && boundary.federatedSourceRecordCount === 58_655 && boundary.federatedRecordCount === 58_652 && boundary.federatedQuarantinedRecordCount === 3, "Boundary observation lost the exact evidence population");

  return {
    clipCount: evidence.clips.length,
    captureMethod: evidence.captureMethod,
    demonstratedRecordId: evidence.demonstration.federatedRecordId,
    presentationDigest: presented.evidenceDigest,
  };
}

export function bindReleaseConfig(config, environment = process.env) {
  const productCommit = environment[demoReleaseEnvironment.productCommit];
  const pagesRunId = environment[demoReleaseEnvironment.pagesRunId];
  invariant(
    typeof productCommit === "string" && COMMIT.test(productCommit),
    `${demoReleaseEnvironment.productCommit} must be the exact lowercase 40-character deployed commit`,
  );
  invariant(
    typeof pagesRunId === "string" && RUN_ID.test(pagesRunId),
    `${demoReleaseEnvironment.pagesRunId} must be the exact Pages deployment run ID`,
  );
  return Object.freeze({ ...config, productCommit, pagesRunId });
}

export async function verifyDemoDeployment(config, fetchImplementation = fetch) {
  invariant(config.productUrl === PUBLIC_CAPTURE_TARGET, "Demo release is restricted to the allowlisted public Pages URL");
  const deployment = await fetchPublicDeploymentMetadata({ expectedCommit: config.productCommit, fetchImplementation });
  invariant(deployment.metadata.runId === config.pagesRunId, "Public deployment run does not match GOVUK_WEBMCP_DEMO_PAGES_RUN_ID");
  return deployment;
}

export function validateConfig(config) {
  exactKeys(config,
    ["schema", "title", "language", "productUrl", "release", "delivery", "narration", "reviews", "demonstrationInputs", "interactionCaptureReceipt", "scenes"],
    ["schema", "title", "language", "productUrl", "release", "delivery", "narration", "reviews", "demonstrationInputs", "interactionCaptureReceipt", "scenes"],
    "Demo script");
  invariant(config.schema === "govuk-webmcp.demo-video-script.v4", "Demo script has the wrong schema");
  nonEmptyString(config.title, "Demo title", 100);
  invariant(config.language === "en-GB", "Demo language must be en-GB");
  const product = new URL(config.productUrl);
  invariant(product.protocol === "https:" && !product.username && !product.password, "Product URL must be credential-free HTTPS");
  invariant(config.release === "v0.4.0-rc.1", "Demo release must target v0.4.0-rc.1");
  exactKeys(config.delivery,
    ["maximumDurationSeconds", "audioRequired", "captionsRequired", "captionLanguage"],
    ["maximumDurationSeconds", "audioRequired", "captionsRequired", "captionLanguage"],
    "Demo delivery contract");
  invariant(config.delivery.maximumDurationSeconds === MAXIMUM_VIDEO_DURATION_SECONDS && config.delivery.audioRequired === true && config.delivery.captionsRequired === true && config.delivery.captionLanguage === "en-GB", "Demo delivery must remain under 180 seconds with English audio and captions");
  exactKeys(config.narration,
    ["type", "engine", "voice", "locale", "speechRate", "publicationBasis"],
    ["type", "engine", "voice", "locale", "speechRate", "publicationBasis"],
    "Narration");
  invariant(config.narration.type === "synthetic-local-review", "Narration type must describe the local synthetic review track");
  invariant(config.narration.engine === "macOS Speech Synthesis" && config.narration.locale === "en-GB", "Narration must identify the macOS en-GB engine boundary");
  nonEmptyString(config.narration.voice, "Narration voice", 80);
  invariant(Number.isInteger(config.narration.speechRate) && config.narration.speechRate >= 140 && config.narration.speechRate <= 190, "Narration speech rate must be 140 to 190 words per minute");
  invariant(config.narration.publicationBasis === "pending-owner-review", "Narration publication basis must remain pending owner review");
  exactKeys(config.reviews,
    ["privacy", "branding", "rights", "voicePublicationBasis", "personalAgentCapturePublication", "finalHumanPlayback"],
    ["privacy", "branding", "rights", "voicePublicationBasis", "personalAgentCapturePublication", "finalHumanPlayback"],
    "Demo reviews");
  invariant(config.reviews.privacy === "pending-human-review" && config.reviews.branding === "pending-human-review" && config.reviews.rights === "pending-human-review" && config.reviews.voicePublicationBasis === "pending-owner-review" && config.reviews.personalAgentCapturePublication === "pending-capture-and-human-review" && config.reviews.finalHumanPlayback === "pending", "Privacy, branding, rights, personal-agent capture, voice-publication and final-playback reviews must remain pending in the local build script");
  invariant(config.interactionCaptureReceipt === expectedInteractionCaptureReceipt, "Demo script must use the reviewed live-interaction capture receipt path");
  exactKeys(config.demonstrationInputs,
    ["query", "collections", "limit", "reviewedAnswerId", "reviewedClaimIds", "excludedHostname"],
    ["query", "collections", "limit", "reviewedAnswerId", "reviewedClaimIds", "excludedHostname"],
    "Demonstration inputs");
  invariant(config.demonstrationInputs.query === "housing", "Demonstration query must be housing");
  invariant(sameValues(config.demonstrationInputs.collections, ["uk-living", "ons", "government-apis", "land-registry"]), "Demonstration collections must name the exact four federated sources in order");
  invariant(config.demonstrationInputs.limit === 8, "Demonstration result limit must be the smallest human-interface value, 8");
  invariant(/^answer:/u.test(config.demonstrationInputs.reviewedAnswerId), "Reviewed demonstration answer ID is invalid");
  invariant(Array.isArray(config.demonstrationInputs.reviewedClaimIds) && config.demonstrationInputs.reviewedClaimIds.length === 2 && new Set(config.demonstrationInputs.reviewedClaimIds).size === 2, "Reviewed demonstration comparison must contain two unique claim IDs");
  invariant(config.demonstrationInputs.excludedHostname === "legislation.gov.uk", "Demonstration exclusion must name legislation.gov.uk");
  invariant(Array.isArray(config.scenes) && config.scenes.length > 0, "Demo script contains no scenes");
  const ids = new Set();
  const numbers = new Set();
  for (const scene of config.scenes) {
    exactKeys(scene,
      ["id", "number", "kind", "hostId", "caseId", "repetition", "eyebrow", "title", "media", "evidence", "mediaReceipt", "requiredActions", "cues"],
      ["id", "number", "kind", "eyebrow", "title", "media", "cues"],
      `Scene ${scene?.id ?? "unknown"}`);
    nonEmptyString(scene.id, "Scene ID", 40);
    invariant(!ids.has(scene.id), `Duplicate scene ID: ${scene.id}`);
    ids.add(scene.id);
    invariant(/^\d{2}$/u.test(scene.number) && !numbers.has(scene.number), `Scene ${scene.id} has an invalid or duplicate number`);
    numbers.add(scene.number);
    invariant(["interaction", "receipt-visualisation", "personal-agent-capture", "voiceover", "context"].includes(scene.kind), `Scene ${scene.id} has an invalid kind`);
    nonEmptyString(scene.eyebrow, `Scene ${scene.id} eyebrow`, 80);
    nonEmptyString(scene.title, `Scene ${scene.id} title`, 100);
    exactKeys(scene.media, ["type", "path", "startSeconds"], ["type", "path", "startSeconds"], `Scene ${scene.id} media`);
    invariant(scene.media.type === "video", `Scene ${scene.id} must use an authentic video clip`);
    invariant(scene.media.path.startsWith("output/demo-clips/") && !scene.media.path.startsWith("output/demo-preview-clips/"), `Scene ${scene.id} must use a production clip outside the preview directory`);
    invariant(typeof scene.media.startSeconds === "number" && Number.isFinite(scene.media.startSeconds) && scene.media.startSeconds >= 0, `Scene ${scene.id} startSeconds is invalid`);
    invariant(Array.isArray(scene.cues) && scene.cues.length > 0, `Scene ${scene.id} has no narration cues`);
    for (const cue of scene.cues) {
      nonEmptyString(cue, `Scene ${scene.id} cue`, 84);
      invariant(!cue.includes("-->") && !/[\r\n]/u.test(cue), `Scene ${scene.id} has unsafe WebVTT cue text`);
      wrapCaption(cue);
    }
    if (["receipt-visualisation", "personal-agent-capture", "voiceover"].includes(scene.kind)) nonEmptyString(scene.evidence, `Scene ${scene.id} evidence path`, 240);
    else invariant(scene.evidence === undefined, `Scene ${scene.id} must not claim unrelated evidence`);
    if (scene.kind === "receipt-visualisation") nonEmptyString(scene.mediaReceipt, `Scene ${scene.id} media receipt path`, 240);
    else invariant(scene.mediaReceipt === undefined, `Scene ${scene.id} must not claim an unrelated media receipt`);
    if (scene.kind === "interaction") {
      invariant(Array.isArray(scene.requiredActions) && scene.requiredActions.length > 0 && scene.requiredActions.length <= 8, `Scene ${scene.id} must name its required live-capture actions`);
      for (const action of scene.requiredActions) nonEmptyString(action, `Scene ${scene.id} required action`, 120);
      invariant(new Set(scene.requiredActions).size === scene.requiredActions.length, `Scene ${scene.id} required actions must be unique`);
    } else invariant(scene.requiredActions === undefined, `Scene ${scene.id} must not claim unrelated live-capture actions`);
    if (scene.kind === "personal-agent-capture") {
      const contract = personalAgentSceneContracts[scene.id];
      invariant(contract, `Scene ${scene.id} is not one of the two fixed personal-agent scenes`);
      invariant(scene.hostId === contract.hostId && scene.caseId === contract.caseId && scene.repetition === contract.repetition, `Scene ${scene.id} has the wrong fixed personal-agent run identity`);
      invariant(scene.media.path === contract.mediaPath && scene.evidence === contract.evidencePath, `Scene ${scene.id} has the wrong future clip or receipt path`);
    } else {
      invariant(scene.hostId === undefined && scene.caseId === undefined && scene.repetition === undefined, `Scene ${scene.id} must not claim an unrelated personal-agent run`);
    }
  }
  invariant(config.scenes.filter(({ kind }) => kind === "receipt-visualisation").length === 1, "Demo must contain exactly one supported-host receipt visualisation");
  invariant(config.scenes.filter(({ kind }) => kind === "personal-agent-capture").length === 2, "Demo must contain exactly two genuine personal-agent captures");
  invariant(config.scenes.filter(({ kind }) => kind === "voiceover").length === 1, "Demo must contain exactly one VoiceOver scene");
  invariant(sameValues(config.scenes.map(({ id }) => id), ["evidence-answer", "present-evidence", "comparison-guide", "copilot-personal-ai", "webmcp", "technical-review", "ollama-local", "voiceover", "boundary"]), "Demo must contain the exact nine-scene Evidence answer story in order");
  return config;
}

function safeRelativePath(value, label, extensions) {
  nonEmptyString(value, label, 300);
  invariant(!isAbsolute(value) && !win32.isAbsolute(value), `${label} must be repository-relative`);
  invariant(!value.includes("\\") && posix.normalize(value) === value, `${label} is not a canonical POSIX path`);
  invariant(!value.split("/").some((part) => part === "." || part === ".." || part === ""), `${label} contains an unsafe path segment`);
  invariant(extensions.includes(extname(value).toLowerCase()), `${label} has an unsupported extension`);
  return resolve(repositoryRoot, value);
}

function inside(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot);
}

async function regularRepositoryFile(value, label, extensions, maximumBytes) {
  const candidate = safeRelativePath(value, label, extensions);
  const info = await lstat(candidate);
  invariant(info.isFile() && !info.isSymbolicLink(), `${label} must be a regular non-symbolic-link file`);
  invariant(info.size > 0 && info.size <= maximumBytes, `${label} has an invalid size`);
  const rootReal = await realpath(repositoryRoot);
  const candidateReal = await realpath(candidate);
  invariant(inside(rootReal, candidateReal), `${label} resolves outside the repository`);
  return { absolutePath: candidateReal, relativePath: value, sizeBytes: info.size, mode: info.mode & 0o777 };
}

function parseArguments(argv) {
  const options = { config: defaultConfig, output: defaultOutput, overwrite: false, preflightOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--overwrite") options.overwrite = true;
    else if (argument === "--preflight-only") options.preflightOnly = true;
    else if (argument === "--config" || argument === "--output") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value`);
      options[argument.slice(2)] = value;
      index += 1;
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  const output = isAbsolute(options.output) ? resolve(options.output) : resolve(repositoryRoot, options.output);
  const outputRoot = resolve(repositoryRoot, "output");
  invariant(inside(outputRoot, output) && extname(output).toLowerCase() === ".mp4", "Output must be an MP4 beneath the repository output directory");
  options.output = output;
  const config = isAbsolute(options.config) ? resolve(options.config) : resolve(repositoryRoot, options.config);
  invariant(inside(repositoryRoot, config) && extname(config).toLowerCase() === ".json", "Config must be a JSON file inside the repository");
  options.config = config;
  return options;
}

async function pathExists(path) {
  try { await lstat(path); return true; } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function firstLine(value) {
  return value.split(/\r?\n/u).find(Boolean) ?? "unknown";
}

async function preflight(options) {
  const errors = [];
  let config;
  let configFile;
  try {
    const relativeConfig = posix.normalize(relative(repositoryRoot, options.config).split(sep).join("/"));
    configFile = await regularRepositoryFile(relativeConfig, "Demo config", [".json"], 256_000);
    config = bindReleaseConfig(validateConfig(JSON.parse(await readFile(configFile.absolutePath, "utf8"))));
    await verifyDemoDeployment(config);
  } catch (error) { errors.push(error.message); }

  const tools = {};
  try {
    const ffmpegVersion = run("ffmpeg", ["-version"], { capture: true }).stdout;
    const encoders = run("ffmpeg", ["-hide_banner", "-encoders"], { capture: true }).stdout;
    invariant(/\blibx264\b/u.test(encoders) && /\baac\b/u.test(encoders) && /\bmov_text\b/u.test(encoders), "ffmpeg lacks libx264, AAC or mov_text encoding support");
    tools.ffmpeg = firstLine(ffmpegVersion);
  } catch (error) { errors.push(error.message); }
  try { tools.ffprobe = firstLine(run("ffprobe", ["-version"], { capture: true }).stdout); } catch (error) { errors.push(error.message); }
  try {
    const voices = run("say", ["-v", "?"], { capture: true }).stdout;
    if (config) {
      const expectedLocale = config.narration.locale.replaceAll("-", "_");
      invariant(
        voices.split(/\r?\n/u).some((line) => new RegExp(`^${config.narration.voice.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s+${expectedLocale}(?:\\s|$)`, "u").test(line)),
        `Installed voice ${config.narration.voice} does not provide ${config.narration.locale}`,
      );
    }
    tools.say = config ? `${config.narration.voice} ${config.narration.locale}` : "available";
  } catch (error) { errors.push(error.message); }

  const inputs = [];
  const media = new Map();
  const evidence = new Map();
  if (config && configFile) {
    inputs.push(configFile);
    for (const scene of config.scenes) {
      try {
        invariant(scene.media.path.startsWith("output/demo-clips/") && !scene.media.path.startsWith("output/demo-preview-clips/"), `Scene ${scene.id} raw clip must stay beneath ignored production output/demo-clips, not demo-preview-clips`);
        const file = await regularRepositoryFile(scene.media.path, `Scene ${scene.id} clip`, [".mov", ".mp4", ".mkv"], 1_500_000_000);
        const mediaProbe = probe(file.absolutePath);
        invariant(mediaProbe.streams?.some((stream) => stream.codec_type === "video"), `Scene ${scene.id} clip has no video stream`);
        const durationSeconds = durationOf(mediaProbe, `Scene ${scene.id} clip`);
        invariant(durationSeconds > scene.media.startSeconds, `Scene ${scene.id} clip starts after its end`);
        media.set(scene.id, { ...file, probe: mediaProbe, durationSeconds, sha256: await sha256File(file.absolutePath) });
        inputs.push(file);
      } catch (error) { errors.push(error.message); }
      if (scene.evidence) {
        try {
          const file = await regularRepositoryFile(scene.evidence, `Scene ${scene.id} evidence`, [".json"], 10_000_000);
          if (scene.kind === "personal-agent-capture") file.publiclyReportable = false;
          const parsed = JSON.parse(await readFile(file.absolutePath, "utf8"));
          const summary = scene.kind === "voiceover" ? validateVoiceOverEvidence(parsed, config) : null;
          evidence.set(scene.id, { ...file, parsed, summary });
          inputs.push(file);
        } catch (error) { errors.push(error.message); }
      }
    }
    try {
      const personalAgentScenes = config.scenes.filter(({ kind }) => kind === "personal-agent-capture");
      if (personalAgentScenes.length > 0) {
        const loadedCaseSet = await loadAndValidateCaseSet();
        const sourceCaptureFile = await regularRepositoryFile(expectedPrivateEvaluationCapture, "Private personal-agent evaluation capture", [".json"], 64 * 1024 * 1024);
        sourceCaptureFile.sha256 = await sha256File(sourceCaptureFile.absolutePath);
        sourceCaptureFile.publiclyReportable = false;
        invariant(sourceCaptureFile.mode === 0o600, "Private personal-agent evaluation capture must have mode 0600");
        const sourceCapture = JSON.parse(await readFile(sourceCaptureFile.absolutePath, "utf8"));

        const liveReleaseFile = await regularRepositoryFile(expectedPrivateLiveReleaseReceipt, "Private live Pages verification receipt", [".json"], 1_000_000);
        liveReleaseFile.sha256 = await sha256File(liveReleaseFile.absolutePath);
        liveReleaseFile.publiclyReportable = false;
        invariant(liveReleaseFile.mode === 0o600, "Private live Pages verification receipt must have mode 0600");
        const liveRelease = validateLiveReleaseReceipt(JSON.parse(await readFile(liveReleaseFile.absolutePath, "utf8")));
        invariant(liveRelease.commit === config.productCommit && liveRelease.runId === config.pagesRunId && liveRelease.baseUrl === config.productUrl, "Private live Pages verification receipt does not match the configured release");

        const authenticatedSummaryFile = await regularRepositoryFile(expectedPrivateAuthenticatedSummary, "Private authenticated personal-agent summary", [".json"], 8 * 1024 * 1024);
        authenticatedSummaryFile.sha256 = await sha256File(authenticatedSummaryFile.absolutePath);
        authenticatedSummaryFile.publiclyReportable = false;
        invariant(authenticatedSummaryFile.mode === 0o600, "Private authenticated personal-agent summary must have mode 0600");
        const authenticatedSummary = JSON.parse(await readFile(authenticatedSummaryFile.absolutePath, "utf8"));
        const structuralSummary = await summariseEvaluationCapture(sourceCapture, loadedCaseSet, liveRelease);
        const authenticatedSummaryBinding = validateAuthenticatedPersonalAgentSummary(authenticatedSummary, structuralSummary, config, sourceCapture, liveRelease);
        inputs.push(sourceCaptureFile, liveReleaseFile, authenticatedSummaryFile);

        for (const scene of personalAgentScenes) {
          try {
            const receiptInput = evidence.get(scene.id);
            const mediaInput = media.get(scene.id);
            invariant(receiptInput && mediaInput, `Personal-agent scene ${scene.id} must have both an exact receipt and clip`);
            invariant(receiptInput.mode === 0o600, `Personal-agent receipt ${scene.id} must have mode 0600`);
            receiptInput.sha256 = await sha256File(receiptInput.absolutePath);
            receiptInput.summary = validatePersonalAgentCaptureEvidence(
              receiptInput.parsed,
              config,
              scene,
              mediaInput,
              sourceCaptureFile,
              sourceCapture,
              authenticatedSummaryFile,
              authenticatedSummaryBinding,
              liveReleaseFile,
              liveRelease,
            );
          } catch (error) { errors.push(error.message); }
        }
      }
    } catch (error) {
      errors.push(error.message);
    }
    for (const scene of config.scenes.filter(({ kind }) => kind === "voiceover")) {
      try {
        const mediaInput = media.get(scene.id);
        const evidenceInput = evidence.get(scene.id);
        invariant(mediaInput && evidenceInput, `VoiceOver scene ${scene.id} must have both media and evidence before binding`);
        validateVoiceOverMediaBinding(evidenceInput.parsed, scene, mediaInput);
        const manifestFile = await regularRepositoryFile(evidenceInput.parsed.media.captureManifestPath, `VoiceOver scene ${scene.id} capture manifest`, [".json"], 256_000);
        manifestFile.sha256 = await sha256File(manifestFile.absolutePath);
        invariant(manifestFile.sha256 === evidenceInput.parsed.media.captureManifestSha256, `VoiceOver scene ${scene.id} capture manifest SHA-256 has drifted`);
        inputs.push(manifestFile);
      } catch (error) { errors.push(error.message); }
    }
    let interactionSummary;
    try {
      const interactionCaptureFile = await regularRepositoryFile(config.interactionCaptureReceipt, "Live interaction capture receipt", [".json"], 10_000_000);
      const interactionCapture = JSON.parse(await readFile(interactionCaptureFile.absolutePath, "utf8"));
      const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
      const summary = validateInteractionCaptureEvidence(interactionCapture, config, interactionScenes, media);
      interactionSummary = summary;
      evidence.set("live-interaction-capture", { ...interactionCaptureFile, parsed: interactionCapture, summary });
      inputs.push(interactionCaptureFile);
    } catch (error) { errors.push(error.message); }

    for (const scene of config.scenes.filter(({ kind }) => kind === "receipt-visualisation")) {
      try {
        invariant(interactionSummary, "Supported-host evidence cannot be validated before the exact live interaction record is bound");
        const hostEvidence = evidence.get(scene.id);
        invariant(hostEvidence, `Scene ${scene.id} host evidence is unavailable`);
        const hostSummary = validateSupportedHostEvidence(hostEvidence.parsed, config, interactionSummary.demonstratedRecordId);
        hostEvidence.summary = hostSummary;
        hostEvidence.sha256 = await sha256File(hostEvidence.absolutePath);

        const artefactFiles = new Map();
        for (const artefact of hostEvidence.parsed.artefacts) {
          const file = await regularRepositoryFile(artefact.path, `Supported-host artefact ${artefact.path}`, [".json", ".png", ".jpg", ".jpeg", ".txt"], 50_000_000);
          file.sha256 = await sha256File(file.absolutePath);
          invariant(file.sha256 === artefact.sha256, `Supported-host artefact SHA-256 has drifted: ${artefact.path}`);
          artefactFiles.set(file.relativePath, file);
          inputs.push(file);
        }

        const receiptFile = await regularRepositoryFile(scene.mediaReceipt, `Scene ${scene.id} media receipt`, [".json"], 1_000_000);
        receiptFile.sha256 = await sha256File(receiptFile.absolutePath);
        const receipt = JSON.parse(await readFile(receiptFile.absolutePath, "utf8"));
        const receiptSummary = validateHostMediaReceipt(receipt, config, scene, media.get(scene.id), hostEvidence, artefactFiles);
        evidence.set(`${scene.id}-media`, { ...receiptFile, parsed: receipt, summary: receiptSummary });
        inputs.push(receiptFile);
      } catch (error) { errors.push(error.message); }
    }
  }

  for (const destination of [options.output, captionsPath, transcriptPath, verificationPath]) {
    try {
      if (await pathExists(destination)) {
        const info = await lstat(destination);
        invariant(info.isFile() && !info.isSymbolicLink(), `Existing generated destination is not a regular file: ${destination}`);
        invariant(options.overwrite, `Generated destination exists; rerun with --overwrite after review: ${destination}`);
      }
    } catch (error) { errors.push(error.message); }
  }

  if (errors.length) throw new Error(`Demo video preflight failed:\n- ${errors.join("\n- ")}`);
  const uniqueInputs = [...new Map(inputs.map((input) => [input.relativePath, input])).values()];
  for (const input of uniqueInputs) input.sha256 = await sha256File(input.absolutePath);
  return { config, configFile, tools, inputs: uniqueInputs, media, evidence };
}

function concatManifest(paths) {
  return `${paths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n")}\n`;
}

async function prepareSceneNarration(scene, config, work) {
  const cueAudio = [];
  const cues = [];
  let localTimeline = 0;
  for (const [index, text] of scene.cues.entries()) {
    const stem = `${scene.number}-${String(index + 1).padStart(2, "0")}`;
    const textPath = join(work, `cue-${stem}.txt`);
    const aiffPath = join(work, `cue-${stem}.aiff`);
    const wavPath = join(work, `cue-${stem}.wav`);
    await writeFile(textPath, `${text}\n`, "utf8");
    run("say", ["-v", config.narration.voice, "-r", String(config.narration.speechRate), "-f", textPath, "-o", aiffPath]);
    const speechDuration = durationOf(probe(aiffPath), `Narration cue ${stem}`);
    invariant(speechDuration >= 1 && speechDuration <= 8.5, `Narration cue ${stem} lasts ${speechDuration.toFixed(3)} seconds; split or revise it`);
    ffmpeg(["-y", "-i", aiffPath, "-af", "apad=pad_dur=0.28,aresample=48000", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", wavPath]);
    const paddedDuration = durationOf(probe(wavPath), `Padded narration cue ${stem}`);
    cues.push({ scene: scene.id, text, caption: wrapCaption(text), start: localTimeline, end: localTimeline + speechDuration });
    localTimeline += paddedDuration;
    cueAudio.push(wavPath);
  }
  const listPath = join(work, `narration-${scene.number}.txt`);
  const narrationPath = join(work, `narration-${scene.number}.wav`);
  await writeFile(listPath, concatManifest(cueAudio), "utf8");
  ffmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", narrationPath]);
  return { narrationPath, duration: durationOf(probe(narrationPath), `Scene ${scene.id} narration`), cues };
}

async function buildScene(scene, media, narration, work) {
  const sourceDuration = durationOf(media.probe, `Scene ${scene.id} clip`) - scene.media.startSeconds;
  invariant(sourceDuration + 0.02 >= narration.duration, `Scene ${scene.id} clip has ${sourceDuration.toFixed(3)} seconds after its start point but narration needs ${narration.duration.toFixed(3)} seconds`);
  const segmentPath = join(work, `scene-${scene.number}.mkv`);
  ffmpeg([
    "-y", "-ss", String(scene.media.startSeconds), "-i", media.absolutePath,
    "-i", narration.narrationPath,
    "-t", String(narration.duration),
    "-filter_complex", "[0:v]fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xf6f4ef,setsar=1,format=yuv420p[v];[1:a]aresample=48000,aformat=sample_fmts=s16:channel_layouts=mono[a]",
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "pcm_s16le", segmentPath,
  ]);
  return { path: segmentPath, duration: durationOf(probe(segmentPath), `Scene ${scene.id} segment`) };
}

function parseLoudness(stderr) {
  const start = stderr.lastIndexOf("{");
  const end = stderr.lastIndexOf("}");
  invariant(start >= 0 && end > start, "ffmpeg did not return loudness measurements");
  return JSON.parse(stderr.slice(start, end + 1));
}

function buildVtt(cues) {
  const lines = ["WEBVTT", ""];
  cues.forEach((cue, index) => {
    lines.push(String(index + 1), `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}`, cue.caption, "");
  });
  return lines.join("\n");
}

function buildTranscript(config) {
  return [
    "# Demonstration video transcript",
    "",
    `**${config.title}**`,
    "",
    `- Language: British English (\`${config.language}\`)`,
    `- Product release: \`${config.release}\` at commit \`${config.productCommit}\``,
    `- Demonstrated URL: <${config.productUrl}>`,
    `- Narration: original script synthesised locally with the installed macOS \`${config.narration.voice}\` voice at rate ${config.narration.speechRate}`,
    "- Narration publication basis: pending owner review",
    "- Privacy, branding and rights review: pending human review",
    "- Source-clip audio: omitted from the edit",
    "- Music: none",
    "",
    "The reviewed live-interaction clips are paired with an original British-English script. The Copilot and Ollama scenes must be genuine, exact-release recordings with clip-level privacy, branding and owner review; they cannot be reconstructed. The supported-host scene is a separate local visualisation of its machine receipt, not a host recording. The VoiceOver evidence record, not the synthetic soundtrack, is the basis for the bounded assistive-technology observation.",
    "",
    ...config.scenes.flatMap((scene) => [`## ${scene.number}. ${scene.title}`, "", scene.cues.join(" "), ""]),
    "## Boundary",
    "",
    "This local review cut is not published. It does not establish official endorsement, comprehensive coverage, access authority, WCAG conformance or support in an untested host.",
    "",
  ].join("\n");
}

export function validateFinalVideo(result) {
  const duration = durationOf(result, "Final video");
  invariant(duration < MAXIMUM_VIDEO_DURATION_SECONDS, `Final video duration ${duration} is not under 180 seconds`);
  const video = result.streams?.find(({ codec_type }) => codec_type === "video");
  const audio = result.streams?.find(({ codec_type }) => codec_type === "audio");
  const subtitle = result.streams?.find(({ codec_type }) => codec_type === "subtitle");
  invariant(video?.codec_name === "h264" && video.width === 1920 && video.height === 1080 && video.r_frame_rate === "30/1" && video.pix_fmt === "yuv420p", "Final video must be H.264 1920x1080 at 30 fps using yuv420p");
  invariant(audio?.codec_name === "aac" && audio.sample_rate === "48000", "Final audio must be AAC at 48 kHz");
  invariant(subtitle?.codec_name === "mov_text" && subtitle.tags?.language === "eng", "Final video must contain an English mov_text caption track");
  return duration;
}

async function placeOutputs(entries, overwrite) {
  const prepared = [];
  const backups = [];
  const committed = [];
  try {
    for (const { source, destination } of entries) {
      await mkdir(dirname(destination), { recursive: true });
      const temporary = `${destination}.pending-${process.pid}-${randomUUID()}`;
      await copyFile(source, temporary, fsConstants.COPYFILE_EXCL);
      prepared.push({ temporary, destination });
    }
    for (const { destination } of prepared) {
      if (await pathExists(destination)) {
        invariant(overwrite, `Destination appeared during build without --overwrite: ${destination}`);
        const backup = `${destination}.backup-${process.pid}-${randomUUID()}`;
        await rename(destination, backup);
        backups.push({ destination, backup });
      }
    }
    for (const item of prepared) {
      await rename(item.temporary, item.destination);
      committed.push(item.destination);
    }
    for (const { backup } of backups) await rm(backup, { force: true });
  } catch (error) {
    for (const destination of committed.reverse()) await rm(destination, { force: true });
    for (const { destination, backup } of backups.reverse()) {
      if (await pathExists(backup)) await rename(backup, destination);
    }
    for (const { temporary } of prepared) await rm(temporary, { force: true });
    throw error;
  }
}

async function build(options, preflightResult) {
  const { config, tools, inputs, media, evidence } = preflightResult;
  const work = await mkdtemp(join(tmpdir(), "govuk-webmcp-demo-"));
  try {
    const sceneSegments = [];
    const timedCues = [];
    let timeline = 0;
    for (const scene of config.scenes) {
      const narration = await prepareSceneNarration(scene, config, work);
      const segment = await buildScene(scene, media.get(scene.id), narration, work);
      for (const cue of narration.cues) timedCues.push({ ...cue, start: timeline + cue.start, end: timeline + cue.end });
      timeline += segment.duration;
      sceneSegments.push(segment.path);
    }

    const sceneList = join(work, "scenes.txt");
    const joined = join(work, "joined.mkv");
    const normalised = join(work, "normalised.mp4");
    const finalVideo = join(work, "final.mp4");
    const tempCaptions = join(work, "demo-captions.en-GB.vtt");
    const tempTranscript = join(work, "demo-transcript.md");
    const tempVerification = join(work, "demo-video-build.json");
    await writeFile(sceneList, concatManifest(sceneSegments), "utf8");
    ffmpeg(["-y", "-f", "concat", "-safe", "0", "-i", sceneList, "-c", "copy", joined]);
    const measured = parseLoudness(ffmpeg(["-i", joined, "-af", "loudnorm=I=-16:LRA=7:TP=-1.5:print_format=json", "-f", "null", "-"], { capture: true }).stderr);
    const loudnessFilter = `loudnorm=I=-16:LRA=7:TP=-1.5:measured_I=${measured.input_i}:measured_LRA=${measured.input_lra}:measured_TP=${measured.input_tp}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`;
    ffmpeg(["-y", "-i", joined, "-c:v", "copy", "-af", loudnessFilter, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", normalised]);
    await writeFile(tempCaptions, buildVtt(timedCues), "utf8");
    await writeFile(tempTranscript, buildTranscript(config), "utf8");
    ffmpeg(["-y", "-i", normalised, "-i", tempCaptions, "-map", "0:v:0", "-map", "0:a:0", "-map", "1:0", "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text", "-metadata:s:s:0", "language=eng", "-metadata:s:s:0", "title=English (UK)", "-movflags", "+faststart", finalVideo]);

    const finalProbe = probe(finalVideo);
    const duration = validateFinalVideo(finalProbe);
    const finalLoudness = parseLoudness(ffmpeg(["-i", finalVideo, "-af", "loudnorm=I=-16:LRA=7:TP=-1.5:print_format=json", "-f", "null", "-"], { capture: true }).stderr);
    const verification = {
      schema: "govuk-webmcp.demo-video-build.v4",
      status: "local-review-build-not-published",
      product: { url: config.productUrl, release: config.release, commit: config.productCommit, pagesRunId: config.pagesRunId },
      environment: { node: process.version, platform: platform(), operatingSystemRelease: release(), architecture: arch(), tools },
      inputs: inputs.filter(({ publiclyReportable }) => publiclyReportable !== false).map(({ relativePath, sizeBytes, sha256 }) => ({ path: relativePath, sizeBytes, sha256 })).sort((a, b) => a.path.localeCompare(b.path, "en-GB")),
      privateInputs: { verifiedCount: inputs.filter(({ publiclyReportable }) => publiclyReportable === false).length, pathsAndDigestsPublished: false },
      video: { fileName: basename(options.output), sha256: await sha256File(finalVideo), durationSeconds: duration, streams: finalProbe.streams, publicUrl: null, signedOutPlaybackVerified: false },
      captions: { path: "docs/competition/demo-captions.v0.4.0-rc.1.en-GB.vtt", sha256: await sha256File(tempCaptions), language: config.language, embeddedTrack: true, publicPlayerTrackVerified: false },
      transcript: { path: "docs/competition/demo-transcript-v0.4.0-rc.1.md", sha256: await sha256File(tempTranscript) },
      script: { path: "docs/competition/demo-video-script-v0.4.0-rc.1.json", sha256: await sha256File(preflightResult.configFile.absolutePath) },
      narration: { type: config.narration.type, engine: config.narration.engine, voice: config.narration.voice, locale: config.narration.locale, speechRate: config.narration.speechRate, publicationBasis: config.narration.publicationBasis, sourceClipAudioIncluded: false, backgroundMusic: false, measuredOutput: finalLoudness },
      evidence: {
        interactionCapture: evidence.get("live-interaction-capture").summary,
        personalAgentCaptures: Object.fromEntries(config.scenes
          .filter(({ kind }) => kind === "personal-agent-capture")
          .map((scene) => [scene.hostId, evidence.get(scene.id).summary])),
        supportedHost: evidence.get("webmcp").summary,
        supportedHostMedia: evidence.get("webmcp-media").summary,
        voiceOver: evidence.get("voiceover").summary,
      },
      reviews: { privacy: "pending-human-review", branding: "pending-human-review", rights: "pending-human-review", personalAgentClipReviews: "passed", voicePublicationBasis: "pending-owner-review", finalHumanPlayback: "pending", finalHumanReviewRequiredBeforePublication: true },
      limitations: [
        "This record proves a bounded local review build, not public YouTube publication or signed-out playback.",
        "The personal-agent scenes are observational host captures and do not support a causal comparison between models.",
        "The installed macOS synthetic voice was used locally; its publication basis remains pending owner review.",
        "Source-clip audio is omitted. The retained VoiceOver record, not this soundtrack, supports the manual accessibility observation.",
      ],
    };
    await writeFile(tempVerification, `${JSON.stringify(verification, null, 2)}\n`, "utf8");
    await placeOutputs([
      { source: finalVideo, destination: options.output },
      { source: tempCaptions, destination: captionsPath },
      { source: tempTranscript, destination: transcriptPath },
      { source: tempVerification, destination: verificationPath },
    ], options.overwrite);
    return { output: options.output, verification: verificationPath, durationSeconds: duration, sha256: verification.video.sha256 };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const result = await preflight(options);
  if (options.preflightOnly) {
    process.stdout.write(`${JSON.stringify({ status: "preflight-passed", inputs: result.inputs.filter(({ publiclyReportable }) => publiclyReportable !== false).map(({ relativePath, sha256 }) => ({ path: relativePath, sha256 })), privateInputs: { verifiedCount: result.inputs.filter(({ publiclyReportable }) => publiclyReportable === false).length, pathsAndDigestsPublished: false }, tools: result.tools }, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(await build(options, result), null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await main();
}
