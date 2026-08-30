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

const scriptPath = fileURLToPath(import.meta.url);
export const repositoryRoot = resolve(dirname(scriptPath), "..");
const defaultConfig = join(repositoryRoot, "docs/competition/demo-video-script.json");
const defaultOutput = join(repositoryRoot, "output/govuk-webmcp-demo-2026-08-30.mp4");
const transcriptPath = join(repositoryRoot, "docs/competition/demo-transcript.md");
const captionsPath = join(repositoryRoot, "docs/competition/demo-captions.en-GB.vtt");
const verificationPath = join(repositoryRoot, "docs/competition/evidence/demo-video-build-2026-08-30.json");
const expectedInteractionCaptureReceipt = "docs/competition/evidence/demo-live-interaction-capture-2026-08-30.json";

export const expectedToolNames = [
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
];

export const requiredVoiceOverJourneyIds = [
  "page-title-and-headings",
  "skip-link-and-main-focus",
  "analytical-index-controls",
  "selected-foundation",
  "comparison-table",
  "live-status",
  "search-and-record",
  "authoritative-links",
  "focus-restoration",
];

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
  invariant(isObject(page), `${label}.page must be an object`);
  const expected = new URL(config.productUrl);
  const observed = new URL(page.url);
  invariant(observed.origin === expected.origin && observed.pathname === expected.pathname, `${label} page URL does not identify the configured product`);
  invariant(page.release === config.release, `${label} release does not match the script`);
  invariant(page.productCommit === config.productCommit, `${label} product commit does not match the script`);
}

function assertBoundary(boundaries, field, expected, label) {
  invariant(isObject(boundaries) && boundaries[field] === expected, `${label} must record ${field}=${JSON.stringify(expected)}`);
}

export function validateSupportedHostEvidence(evidence, config) {
  invariant(evidence?.schema === "trusted-govuk-discovery.supported-host-webmcp-capture.v1", "Supported-host evidence has the wrong schema");
  validObservedAt(evidence.capturedAt, "Supported-host capturedAt");
  validatePageIdentity(evidence.page, config, "Supported-host evidence");
  invariant(evidence.host?.name === "Codex In-app Browser", "Supported-host evidence must name Codex In-app Browser");
  invariant(evidence.host?.type === "iab" && evidence.host?.capabilities?.includes("webmcp"), "Supported-host evidence must record the native WebMCP capability");

  const tools = evidence.discovery?.tools;
  invariant(evidence.discovery?.toolCount === expectedToolNames.length, "Supported-host evidence must record five discovered tools");
  invariant(sameSet(tools?.map(({ name }) => name), expectedToolNames), "Supported-host discovery does not contain the exact five tools");
  const expectedReadOnly = new Map([
    ["search_government_knowledge", true],
    ["get_resource_record", true],
    ["show_provenance", true],
    ["explore_answer_foundations", false],
    ["compare_evidence_foundations", false],
  ]);
  for (const tool of tools) {
    invariant(tool.annotations?.readOnlyHint === expectedReadOnly.get(tool.name), `${tool.name} has the wrong readOnlyHint`);
    invariant(tool.annotations?.untrustedContentHint === true, `${tool.name} must retain untrustedContentHint=true`);
  }

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

  for (const name of ["search_government_knowledge", "get_resource_record"]) {
    const boundaries = byName.get(name).result.boundaries;
    assertBoundary(boundaries, "providerCall", false, name);
    assertBoundary(boundaries, "readOnly", true, name);
  }
  const provenance = byName.get("show_provenance").result.boundaries;
  assertBoundary(provenance, "sourceWasNotRefetched", true, "show_provenance");
  assertBoundary(provenance, "cryptographicSignatureVerified", false, "show_provenance");

  for (const name of ["explore_answer_foundations", "compare_evidence_foundations"]) {
    const boundaries = byName.get(name).result.boundaries;
    assertBoundary(boundaries, "providerCall", false, name);
    assertBoundary(boundaries, "storageWrite", false, name);
    assertBoundary(boundaries, "catalogueMutation", false, name);
    assertBoundary(boundaries, "externalStateChange", false, name);
    assertBoundary(boundaries, "presentationEffect", "transient-local-selection", name);
  }

  const comparison = byName.get("compare_evidence_foundations");
  invariant(comparison.input?.answerId === config.webmcpComparison.answerId, "Comparison call used the wrong answer ID");
  invariant(sameValues(comparison.input?.claimIds, config.webmcpComparison.claimIds), "Comparison call used the wrong claim IDs");
  invariant(comparison.result?.answerId === config.webmcpComparison.answerId, "Comparison result used the wrong answer ID");
  invariant(sameValues(comparison.result?.claimIds, config.webmcpComparison.claimIds), "Comparison result used the wrong claim IDs");

  const observation = evidence.finalPageObservation;
  invariant(observation?.lastPresentationAction === "WebMCP: compare_evidence_foundations", "Final page observation does not record the comparison action");
  invariant(sameValues(observation.selectedClaims, config.webmcpComparison.claimIds), "Final page observation selected the wrong claims");
  invariant(observation.comparisonRowCount === 11, "Final page observation must record the 11-row comparison");
  const computedDigest = sha256Text(canonicalJson(comparison.result));
  invariant(/^[a-f0-9]{64}$/u.test(observation.displayResultDigest), "Displayed result digest is malformed");
  invariant(observation.canonicalCallResultDigest === computedDigest, "Recorded canonical call-result digest does not match the captured result");
  invariant(observation.displayResultDigest === computedDigest && observation.digestParity === true, "Displayed result digest does not match the canonical call result");
  return { canonicalCallResultDigest: computedDigest };
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
    exactKeys(item, ["id", "result", "observation", "limitation"], ["id", "result", "observation"], `VoiceOver journey ${item.id}`);
    invariant(["pass", "limitation", "issue-observed"].includes(item.result), `VoiceOver journey result is invalid for ${item.id}`);
    nonEmptyString(item.observation, `VoiceOver observation ${item.id}`, 1_500);
    if (item.result === "pass") invariant(item.limitation === undefined, `Passing VoiceOver journey ${item.id} must not claim a limitation`);
    else nonEmptyString(item.limitation, `VoiceOver limitation acknowledgement ${item.id}`, 1_000);
  }
  invariant(Array.isArray(evidence.limitations) && evidence.limitations.length > 0, "VoiceOver evidence must record at least one limitation");
  for (const limitation of evidence.limitations) nonEmptyString(limitation, "VoiceOver limitation", 1_000);
  const nonPassing = evidence.journey.filter(({ result }) => result !== "pass");
  for (const item of nonPassing) invariant(evidence.limitations.includes(item.limitation), `VoiceOver journey ${item.id} has an unacknowledged limitation`);
  if (evidence.overallStatus === "completed") invariant(nonPassing.length === 0, "Completed VoiceOver evidence cannot contain limitations or observed issues");
  if (evidence.overallStatus === "completed-with-limitations") invariant(nonPassing.length > 0, "Completed-with-limitations VoiceOver evidence requires an acknowledged journey limitation or issue");
  exactKeys(evidence.media,
    ["path", "sha256", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt"],
    ["path", "sha256", "startSeconds", "endSeconds", "captureStartedAt", "captureEndedAt"],
    "VoiceOver media binding");
  nonEmptyString(evidence.media.path, "VoiceOver media path", 300);
  invariant(/^[a-f0-9]{64}$/u.test(evidence.media.sha256), "VoiceOver media SHA-256 is invalid");
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

export function validateInteractionCaptureEvidence(evidence, config, interactionScenes, mediaById) {
  exactKeys(evidence,
    ["schema", "product", "captureMethod", "browser", "capturedAt", "reviews", "noBrowserChrome", "audioCaptured", "clips"],
    ["schema", "product", "captureMethod", "browser", "capturedAt", "reviews", "noBrowserChrome", "audioCaptured", "clips"],
    "Live interaction capture receipt");
  invariant(evidence.schema === "trusted-govuk-discovery.demo-live-interaction-capture.v1", "Live interaction capture receipt has the wrong schema");
  exactKeys(evidence.product, ["url", "release", "commit"], ["url", "release", "commit"], "Live interaction capture product");
  invariant(evidence.product.url === config.productUrl && evidence.product.release === config.release && evidence.product.commit === config.productCommit, "Live interaction capture receipt does not identify the configured release");
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
    exactKeys(clip, ["sceneId", "path", "sha256", "durationSeconds", "capturedAt", "actions", "sourceUrl"], ["sceneId", "path", "sha256", "durationSeconds", "capturedAt", "actions", "sourceUrl"], `Live interaction clip ${clip.sceneId}`);
    const scene = interactionScenes.find(({ id }) => id === clip.sceneId);
    const media = mediaById.get(clip.sceneId);
    invariant(scene && media, `Live interaction clip ${clip.sceneId} has no configured scene media`);
    invariant(clip.path === scene.media.path && clip.sha256 === media.sha256, `Live interaction clip ${clip.sceneId} does not match its configured media`);
    invariant(Number.isFinite(clip.durationSeconds) && clip.durationSeconds > 0 && Math.abs(clip.durationSeconds - media.durationSeconds) <= 0.05, `Live interaction clip ${clip.sceneId} duration does not match its media`);
    validObservedAt(clip.capturedAt, `Live interaction clip ${clip.sceneId} capture timestamp`);
    const configuredUrl = new URL(config.productUrl);
    const sourceUrl = new URL(clip.sourceUrl);
    invariant(sourceUrl.origin === configuredUrl.origin && sourceUrl.pathname === configuredUrl.pathname && sourceUrl.search === "" && (!sourceUrl.hash || /^#(?:answer|claim|record|foundation|compare)=[A-Za-z0-9%:,_-]+(?:&(?:answer|claim|record|foundation|compare)=[A-Za-z0-9%:,_-]+)*$/u.test(sourceUrl.hash)), `Live interaction clip ${clip.sceneId} source URL does not identify the configured release`);
    invariant(Array.isArray(clip.actions) && clip.actions.length > 0, `Live interaction clip ${clip.sceneId} must record actions`);
    invariant(sameValues(clip.actions, scene.requiredActions), `Live interaction clip ${clip.sceneId} actions do not match the required scene actions`);
  }
  return { clipCount: evidence.clips.length, captureMethod: evidence.captureMethod };
}

export function validateConfig(config) {
  exactKeys(config,
    ["schema", "title", "language", "productUrl", "productCommit", "release", "narration", "reviews", "webmcpComparison", "interactionCaptureReceipt", "scenes"],
    ["schema", "title", "language", "productUrl", "productCommit", "release", "narration", "reviews", "webmcpComparison", "interactionCaptureReceipt", "scenes"],
    "Demo script");
  invariant(config.schema === "trusted-govuk-discovery.demo-video-script.v2", "Demo script has the wrong schema");
  nonEmptyString(config.title, "Demo title", 100);
  invariant(config.language === "en-GB", "Demo language must be en-GB");
  const product = new URL(config.productUrl);
  invariant(product.protocol === "https:" && !product.username && !product.password, "Product URL must be credential-free HTTPS");
  invariant(/^[a-f0-9]{40}$/u.test(config.productCommit), "Product commit must be a full Git commit ID");
  nonEmptyString(config.release, "Release", 40);
  exactKeys(config.narration,
    ["type", "engine", "voice", "locale", "speechRate", "publicationBasis"],
    ["type", "engine", "voice", "locale", "speechRate", "publicationBasis"],
    "Narration");
  invariant(config.narration.type === "synthetic-local-review", "Narration type must describe the local synthetic review track");
  invariant(config.narration.engine === "macOS Speech Synthesis" && config.narration.locale === "en-GB", "Narration must identify the macOS en-GB engine boundary");
  nonEmptyString(config.narration.voice, "Narration voice", 80);
  invariant(Number.isInteger(config.narration.speechRate) && config.narration.speechRate >= 140 && config.narration.speechRate <= 190, "Narration speech rate must be 140 to 190 words per minute");
  invariant(config.narration.publicationBasis === "pending-owner-review", "Narration publication basis must remain pending owner review");
  invariant(config.reviews?.privacy === "pending-human-review" && config.reviews?.branding === "pending-human-review" && config.reviews?.voicePublicationBasis === "pending-owner-review", "Privacy, branding and voice-publication reviews must remain pending in the local build script");
  invariant(config.interactionCaptureReceipt === expectedInteractionCaptureReceipt, "Demo script must use the reviewed live-interaction capture receipt path");
  invariant(/^answer:/u.test(config.webmcpComparison?.answerId), "WebMCP comparison answer ID is invalid");
  invariant(Array.isArray(config.webmcpComparison?.claimIds) && config.webmcpComparison.claimIds.length === 2 && new Set(config.webmcpComparison.claimIds).size === 2, "WebMCP comparison must contain two unique claim IDs");
  invariant(Array.isArray(config.scenes) && config.scenes.length > 0, "Demo script contains no scenes");
  const ids = new Set();
  const numbers = new Set();
  for (const scene of config.scenes) {
    exactKeys(scene,
      ["id", "number", "kind", "eyebrow", "title", "media", "evidence", "requiredActions", "cues"],
      ["id", "number", "kind", "eyebrow", "title", "media", "cues"],
      `Scene ${scene?.id ?? "unknown"}`);
    nonEmptyString(scene.id, "Scene ID", 40);
    invariant(!ids.has(scene.id), `Duplicate scene ID: ${scene.id}`);
    ids.add(scene.id);
    invariant(/^\d{2}$/u.test(scene.number) && !numbers.has(scene.number), `Scene ${scene.id} has an invalid or duplicate number`);
    numbers.add(scene.number);
    invariant(["interaction", "receipt-visualisation", "voiceover", "context"].includes(scene.kind), `Scene ${scene.id} has an invalid kind`);
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
    if (["receipt-visualisation", "voiceover"].includes(scene.kind)) nonEmptyString(scene.evidence, `Scene ${scene.id} evidence path`, 240);
    else invariant(scene.evidence === undefined, `Scene ${scene.id} must not claim unrelated evidence`);
    if (scene.kind === "interaction") {
      invariant(Array.isArray(scene.requiredActions) && scene.requiredActions.length > 0 && scene.requiredActions.length <= 8, `Scene ${scene.id} must name its required live-capture actions`);
      for (const action of scene.requiredActions) nonEmptyString(action, `Scene ${scene.id} required action`, 120);
      invariant(new Set(scene.requiredActions).size === scene.requiredActions.length, `Scene ${scene.id} required actions must be unique`);
    } else invariant(scene.requiredActions === undefined, `Scene ${scene.id} must not claim unrelated live-capture actions`);
  }
  invariant(config.scenes.filter(({ kind }) => kind === "receipt-visualisation").length === 1, "Demo must contain exactly one supported-host receipt visualisation");
  invariant(config.scenes.filter(({ kind }) => kind === "voiceover").length === 1, "Demo must contain exactly one VoiceOver scene");
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
  return { absolutePath: candidateReal, relativePath: value, sizeBytes: info.size };
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
    config = validateConfig(JSON.parse(await readFile(configFile.absolutePath, "utf8")));
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
          const parsed = JSON.parse(await readFile(file.absolutePath, "utf8"));
          const summary = scene.kind === "receipt-visualisation"
            ? validateSupportedHostEvidence(parsed, config)
            : validateVoiceOverEvidence(parsed, config);
          evidence.set(scene.id, { ...file, parsed, summary });
          inputs.push(file);
        } catch (error) { errors.push(error.message); }
      }
    }
    for (const scene of config.scenes.filter(({ kind }) => kind === "voiceover")) {
      try {
        const mediaInput = media.get(scene.id);
        const evidenceInput = evidence.get(scene.id);
        invariant(mediaInput && evidenceInput, `VoiceOver scene ${scene.id} must have both media and evidence before binding`);
        validateVoiceOverMediaBinding(evidenceInput.parsed, scene, mediaInput);
      } catch (error) { errors.push(error.message); }
    }
    try {
      const interactionCaptureFile = await regularRepositoryFile(config.interactionCaptureReceipt, "Live interaction capture receipt", [".json"], 10_000_000);
      const interactionCapture = JSON.parse(await readFile(interactionCaptureFile.absolutePath, "utf8"));
      const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
      const summary = validateInteractionCaptureEvidence(interactionCapture, config, interactionScenes, media);
      evidence.set("live-interaction-capture", { ...interactionCaptureFile, parsed: interactionCapture, summary });
      inputs.push(interactionCaptureFile);
    } catch (error) { errors.push(error.message); }
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
    "- Source-clip audio: omitted from the edit",
    "- Music: none",
    "",
    "The reviewed live-interaction clips are paired with an original British-English script. The supported-host scene is a local visualisation of its machine receipt, not a host recording. The VoiceOver evidence record, not the synthetic soundtrack, is the basis for the bounded assistive-technology observation.",
    "",
    ...config.scenes.flatMap((scene) => [`## ${scene.number}. ${scene.title}`, "", scene.cues.join(" "), ""]),
    "## Boundary",
    "",
    "This local review cut is not published. It does not establish official endorsement, comprehensive coverage, access authority, WCAG conformance or support in an untested host.",
    "",
  ].join("\n");
}

function validateFinalVideo(result) {
  const duration = durationOf(result, "Final video");
  invariant(duration < 180, `Final video duration ${duration} is not under 180 seconds`);
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
      schema: "trusted-govuk-discovery.demo-video-build.v2",
      status: "local-review-build-not-published",
      product: { url: config.productUrl, release: config.release, commit: config.productCommit },
      environment: { node: process.version, platform: platform(), operatingSystemRelease: release(), architecture: arch(), tools },
      inputs: inputs.map(({ relativePath, sizeBytes, sha256 }) => ({ path: relativePath, sizeBytes, sha256 })).sort((a, b) => a.path.localeCompare(b.path, "en-GB")),
      video: { fileName: basename(options.output), sha256: await sha256File(finalVideo), durationSeconds: duration, streams: finalProbe.streams, publicUrl: null, signedOutPlaybackVerified: false },
      captions: { path: "docs/competition/demo-captions.en-GB.vtt", sha256: await sha256File(tempCaptions), language: config.language, embeddedTrack: true, publicPlayerTrackVerified: false },
      transcript: { path: "docs/competition/demo-transcript.md", sha256: await sha256File(tempTranscript) },
      script: { path: "docs/competition/demo-video-script.json", sha256: await sha256File(preflightResult.configFile.absolutePath) },
      narration: { type: config.narration.type, engine: config.narration.engine, voice: config.narration.voice, locale: config.narration.locale, speechRate: config.narration.speechRate, publicationBasis: config.narration.publicationBasis, sourceClipAudioIncluded: false, backgroundMusic: false, measuredOutput: finalLoudness },
      evidence: {
        interactionCapture: evidence.get("live-interaction-capture").summary,
        supportedHost: evidence.get("webmcp").summary,
        voiceOver: evidence.get("voiceover").summary,
      },
      reviews: { privacy: "pending-human-review", branding: "pending-human-review", voicePublicationBasis: "pending-owner-review", finalHumanPlayback: "pending", finalHumanReviewRequiredBeforePublication: true },
      limitations: [
        "This record proves a bounded local review build, not public YouTube publication or signed-out playback.",
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
    process.stdout.write(`${JSON.stringify({ status: "preflight-passed", inputs: result.inputs.map(({ relativePath, sha256 }) => ({ path: relativePath, sha256 })), tools: result.tools }, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(await build(options, result), null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await main();
}
