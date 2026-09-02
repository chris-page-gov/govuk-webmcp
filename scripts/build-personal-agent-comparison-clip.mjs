import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import {
  authenticateFinalVideoPersonalAgentSummary,
  bindReleaseConfig,
  canonicalJson,
  repositoryRoot,
  validateConfig,
  validatePersonalAgentObservationClipReceipt,
  validatePersonalAgentObservationEvidence,
} from "./build-demo-video.mjs";
import { resolveCanonicalRepositoryPath } from "./lib/repository-relative-path.mjs";
import { placeRepositoryOutputs } from "./lib/transactional-output-placement.mjs";
import { RELEASE_EVIDENCE_PATHS } from "./lib/release-evidence-paths.mjs";
import { loadAndValidateCaseSet } from "./prepare-personal-agent-evals.mjs";
import {
  authenticateEvaluationReleaseReceipt,
  validateLiveReleaseReceipt,
} from "./verify-personal-agent-evals.mjs";
import {
  authenticateLivePagesReceipt,
  disposeAuthenticatedLivePagesReceipt,
  isAuthenticatedLivePagesReceipt,
  livePagesReceiptBinding,
} from "./verify-live-pages-artifact.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const configPath = resolve(repositoryRoot, RELEASE_EVIDENCE_PATHS.demoConfig);
const clipDurationMilliseconds = 38_000;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inside(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

export function resolvePersonalAgentComparisonClipPath(value, label, options = {}) {
  return resolveCanonicalRepositoryPath(repositoryRoot, value, { label, ...options });
}

async function regularFile(relativePath, label, extensions, maximumBytes) {
  const path = resolvePersonalAgentComparisonClipPath(relativePath, label, { extensions });
  invariant(extensions.includes(extname(path).toLowerCase()), `${label} has an unsupported extension`);
  const info = await lstat(path);
  invariant(info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= maximumBytes, `${label} must be a bounded regular non-symbolic file`);
  const rootReal = await realpath(repositoryRoot);
  const candidateReal = await realpath(path);
  invariant(inside(rootReal, candidateReal), `${label} resolves outside the repository`);
  const bytes = await readFile(candidateReal);
  const after = await lstat(path);
  invariant(after.isFile() && !after.isSymbolicLink() && after.dev === info.dev && after.ino === info.ino && after.size === info.size && bytes.byteLength === info.size, `${label} changed while it was being read`);
  return { absolutePath: candidateReal, relativePath, bytes, sizeBytes: bytes.byteLength, mode: info.mode & 0o777, sha256: createHash("sha256").update(bytes).digest("hex"), parsed: JSON.parse(bytes.toString("utf8")) };
}

export async function authenticatePersonalAgentComparisonEvidence({
  config,
  publicSummary,
  sourceCapture,
  authenticatedPrivateSummary,
  privateLiveRelease,
  loadedCaseSet,
}, {
  authenticateLiveImplementation = authenticateLivePagesReceipt,
  replaySummaryImplementation = authenticateFinalVideoPersonalAgentSummary,
  authenticateEvaluationImplementation = authenticateEvaluationReleaseReceipt,
  disposeLiveImplementation = disposeAuthenticatedLivePagesReceipt,
} = {}) {
  const liveRelease = validateLiveReleaseReceipt(privateLiveRelease);
  invariant(liveRelease.repository === "chris-page-gov/govuk-webmcp" && liveRelease.baseUrl === config.productUrl && liveRelease.commit === config.productCommit && liveRelease.runId === config.pagesRunId, "Private live Pages verification does not match the configured comparison release");
  let authenticatedLiveRelease;
  try {
    authenticatedLiveRelease = await authenticateLiveImplementation(liveRelease);
    invariant(isAuthenticatedLivePagesReceipt(authenticatedLiveRelease), "Standalone comparison requires a freshly authenticated live Pages receipt");
    const replayBinding = await replaySummaryImplementation({
      sourceCapture,
      loadedCaseSet,
      suppliedSummary: authenticatedPrivateSummary,
      config,
      preRunLiveRelease: liveRelease,
    }, {
      authenticateImplementation: (candidate, authenticationOptions) => authenticateEvaluationImplementation(candidate, {
        checkoutPolicy: authenticationOptions.checkoutPolicy,
        authenticateImplementation: async (expected) => {
          invariant(
            isAuthenticatedLivePagesReceipt(authenticatedLiveRelease)
              && canonicalJson(livePagesReceiptBinding(authenticatedLiveRelease)) === canonicalJson(livePagesReceiptBinding(expected)),
            "Standalone comparison replay does not match the fresh live Pages receipt",
          );
          return authenticatedLiveRelease;
        },
        liveReceiptLease: "borrowed",
      }),
    });
    invariant(replayBinding?.status === "authenticated" && replayBinding.caseSetSha256 === authenticatedPrivateSummary.caseSetSha256, "Standalone comparison did not complete an authenticated private summary replay");
    return validatePersonalAgentObservationEvidence(publicSummary, config, authenticatedLiveRelease, authenticatedPrivateSummary);
  } finally {
    if (authenticatedLiveRelease !== undefined) await disposeLiveImplementation(authenticatedLiveRelease);
  }
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}${capture ? `: ${result.stderr || result.stdout}` : ""}`);
  return result.stdout ?? "";
}

function probeDuration(path) {
  const output = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path], { capture: true });
  const duration = Number(output.trim());
  invariant(Number.isFinite(duration) && duration > 0, `ffprobe did not return a positive duration for ${path}`);
  return duration;
}

function metric(label, value, className = "") {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong class="${escapeHtml(className)}">${escapeHtml(value)}</strong></div>`;
}

export function personalAgentComparisonPageHtml(summary) {
  const copilot = summary.hosts.find(({ hostId }) => hostId === "copilot-mcp-workspace");
  const ollama = summary.hosts.find(({ hostId }) => hostId === "ollama-local");
  const edge = copilot.browsers[0];
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <style>
    *{box-sizing:border-box}html,body{width:1920px;height:1080px;margin:0;overflow:hidden}
    body{background:#f6f4ef;color:#17232c;font:24px/1.28 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{height:100%;padding:34px 42px 30px}.top{display:flex;align-items:flex-start;justify-content:space-between;gap:30px;margin-bottom:22px}
    .label{display:inline-block;border:4px solid #006853;background:#e7f4ef;padding:8px 13px;font-size:19px;font-weight:850}
    .eyebrow{margin:14px 0 4px;color:#006853;font-size:20px;font-weight:850;text-transform:uppercase;letter-spacing:.07em}
    h1{font-size:47px;line-height:1.04;margin:0}.summary{max-width:640px;border-left:11px solid #d4351c;background:#fbe9e7;padding:15px 20px;font-size:24px;font-weight:760}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.host{border:3px solid #526169;background:#fff;padding:24px 26px;min-height:675px}
    h2{font-size:34px;margin:0 0 4px}.host-meta{color:#526169;font-size:19px;margin:0 0 18px}.metric{display:flex;justify-content:space-between;gap:20px;border-top:2px solid #d7dbdd;padding:12px 0}.metric span{font-weight:650}.metric strong{text-align:right}.pass{color:#006853}.fail{color:#b10e1e}.unknown{color:#4c2c92}
    .finding{border-left:11px solid #d4351c;background:#fbe9e7;padding:16px 18px;margin-top:16px;font-size:24px;font-weight:760}
    .boundary{border-left:11px solid #b58800;background:#fff2cc;padding:14px 20px;margin-top:20px;font-size:21px}
    .progress{position:fixed;left:0;bottom:0;height:8px;width:100%;background:#006853;transform-origin:left;animation:progress 38s linear both}@keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  </style>
</head>
<body>
  <main>
    <div class="top">
      <div><div class="label">Observation summary — not a host recording</div><p class="eyebrow">Cloud and local personal-AI evaluation</p><h1>What was observed — and what was not</h1></div>
      <div class="summary">${escapeHtml(summary.observedRunCount)} of ${escapeHtml(summary.plannedRunCount)} planned observations were captured. The claim gate did not pass.</div>
    </div>
    <div class="grid">
      <section class="host">
        <h2>Personal Microsoft Copilot</h2>
        <p class="host-meta">Visible Edge ${escapeHtml(edge.version)} · underlying model undisclosed</p>
        ${metric("Answer observations", `${copilot.observedRunCount} of ${copilot.plannedRunCount}`, "pass")}
        ${metric("Site-tool list", `${copilot.exposedTools["not-observable"]} not observable`, "unknown")}
        ${metric("Exact call traces", `${copilot.callTrace["not-observable"]} not observable`, "unknown")}
        ${metric("Evidence answer parity", "36 not observable", "unknown")}
        ${metric("Answer safety", "36 not reviewed", "unknown")}
        <div class="finding">No Site tool invocation or Evidence answer update was observed. No Copilot safety or compatibility claim is made.</div>
      </section>
      <section class="host">
        <h2>Pinned local Ollama model</h2>
        <p class="host-meta">Headless evaluation harness · exact model identity retained in private evidence</p>
        ${metric("Runs with exposed tools", `${ollama.exposedTools.observed} of ${ollama.plannedRunCount}`, "pass")}
        ${metric("Tool selection", "6 passed · 30 failed", "fail")}
        ${metric("Deterministic execution", "6 passed · 30 failed", "fail")}
        ${metric("Evidence answer parity", "36 not observable", "unknown")}
        ${metric("Runner errors", `${ollama.diagnosticDimensions.runnerErrors.observedWithErrors} runs`, "fail")}
        <div class="finding">The tools were visible, but the result does not support a claim that this local host answers safely.</div>
      </section>
    </div>
    <div class="boundary"><strong>Evidence boundary</strong> — observational comparison only; no causal model claim. Personal identifiers, share links and answer text are omitted.</div>
  </main>
  <div class="progress"></div>
</body>
</html>`;
}

async function loadInputs() {
  const config = bindReleaseConfig(validateConfig(JSON.parse(await readFile(configPath, "utf8"))));
  const scene = config.scenes.find(({ kind }) => kind === "evaluation-observation");
  invariant(scene, "Demo config has no personal-agent comparison scene");
  const [
    evidenceFile,
    sourceCaptureFile,
    authenticatedSummaryFile,
    privateLiveReleaseFile,
    loadedCaseSet,
  ] = await Promise.all([
    regularFile(scene.evidence, "Personal-agent comparison evidence", [".json"], 10 * 1024 * 1024),
    regularFile(RELEASE_EVIDENCE_PATHS.privateEvaluationCapture, "Private personal-agent evaluation capture", [".json"], 64 * 1024 * 1024),
    regularFile(RELEASE_EVIDENCE_PATHS.privateAuthenticatedSummary, "Private authenticated personal-agent summary", [".json"], 8 * 1024 * 1024),
    regularFile(RELEASE_EVIDENCE_PATHS.privateLivePagesVerification, "Private live Pages verification receipt", [".json"], 1_000_000),
    loadAndValidateCaseSet(),
  ]);
  invariant(sourceCaptureFile.mode === 0o600 && authenticatedSummaryFile.mode === 0o600 && privateLiveReleaseFile.mode === 0o600, "Canonical private comparison inputs must retain mode 0600");
  const observation = await authenticatePersonalAgentComparisonEvidence({
    config,
    publicSummary: evidenceFile.parsed,
    sourceCapture: sourceCaptureFile.parsed,
    authenticatedPrivateSummary: authenticatedSummaryFile.parsed,
    privateLiveRelease: privateLiveReleaseFile.parsed,
    loadedCaseSet,
  });
  return { config, scene, evidenceFile, observation };
}

export async function main(argv = process.argv.slice(2)) {
  const unknown = argv.filter((argument) => argument !== "--overwrite");
  invariant(unknown.length === 0, `Unknown argument: ${unknown.join(", ")}`);
  const overwrite = argv.includes("--overwrite");
  run("ffmpeg", ["-version"], { capture: true });
  run("ffprobe", ["-version"], { capture: true });
  const inputs = await loadInputs();
  const outputPath = resolvePersonalAgentComparisonClipPath(inputs.scene.media.path, "Personal-agent comparison clip output", { prefix: "output/demo-clips/v0.4.0-rc.1/", extensions: [".mov", ".mp4", ".mkv"] });
  const receiptPath = resolvePersonalAgentComparisonClipPath(inputs.scene.mediaReceipt, "Personal-agent comparison clip receipt", { prefix: "docs/competition/evidence/", extensions: [".json"] });
  const work = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-personal-agent-comparison-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: work, size: { width: 1920, height: 1080 } }, offline: true });
    await context.route(/^(?:https?|wss?):/u, (route) => route.abort("blockedbyclient"));
    const page = await context.newPage();
    const recordedVideo = page.video();
    await page.setContent(personalAgentComparisonPageHtml(inputs.evidenceFile.parsed), { waitUntil: "load" });
    await page.waitForTimeout(clipDurationMilliseconds);
    await page.close();
    await context.close();
    const sourceVideo = await recordedVideo.path();
    const converted = resolve(work, "personal-agent-comparison.mov");
    run("ffmpeg", ["-nostdin", "-hide_banner", "-y", "-i", sourceVideo, "-an", "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", converted]);
    const durationSeconds = probeDuration(converted);
    const mediaSha256 = createHash("sha256").update(await readFile(converted)).digest("hex");
    const receipt = {
      schema: "govuk-webmcp.personal-agent-comparison-clip.v1",
      builtAt: new Date().toISOString(),
      demoContext: { release: inputs.config.release, productCommit: inputs.config.productCommit, pagesRunId: inputs.config.pagesRunId, sceneId: inputs.scene.id },
      sourceEvidence: { path: inputs.evidenceFile.relativePath, sha256: inputs.evidenceFile.sha256, schema: inputs.evidenceFile.parsed.schema, suiteId: inputs.evidenceFile.parsed.suiteId, caseSetSha256: inputs.evidenceFile.parsed.caseSetSha256, observationWindow: inputs.evidenceFile.parsed.observationWindow },
      rendering: { kind: "privacy-minimised-observation-visualisation", hostRecordingEmbedded: false, hostOwnedSurfaceEmbedded: false, pageUpdateShown: false, visibleLabel: "Observation summary — not a host recording" },
      media: { path: inputs.scene.media.path, sha256: mediaSha256, durationSeconds, startSeconds: inputs.scene.media.startSeconds, endSeconds: durationSeconds },
      limitations: [
        "This privacy-minimised generated visualisation is not a host recording.",
        "No Site tool invocation or Evidence answer update was observed in the Copilot surface.",
        "Neither host result supports a safe-host or safe-answer claim.",
        "The observational comparison does not establish a causal model effect.",
        "Personal identifiers, private share links and answer text are not published.",
      ],
    };
    validatePersonalAgentObservationClipReceipt(receipt, inputs.config, inputs.scene, { sha256: mediaSha256, durationSeconds }, inputs.evidenceFile, inputs.observation);
    const temporaryReceipt = resolve(work, "personal-agent-comparison-clip.json");
    await writeFile(temporaryReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    await placeRepositoryOutputs([{ source: converted, destination: outputPath }, { source: temporaryReceipt, destination: receiptPath }], { root: repositoryRoot, overwrite });
    process.stdout.write(`${JSON.stringify({ output: inputs.scene.media.path, receipt: inputs.scene.mediaReceipt, durationSeconds, sha256: mediaSha256 }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
