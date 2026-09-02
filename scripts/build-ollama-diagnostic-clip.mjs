import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import {
  bindReleaseConfig,
  ollamaDiagnosticSceneContract,
  repositoryRoot,
  validateConfig,
  validateOllamaDiagnosticClipReceipt,
  validateOllamaDiagnosticEvidence,
} from "./build-demo-video.mjs";
import { loadAndValidateCaseSet } from "./prepare-personal-agent-evals.mjs";
import { summariseEvaluationCapture } from "./verify-personal-agent-evals.mjs";
import { resolveCanonicalRepositoryPath } from "./lib/repository-relative-path.mjs";
import { placeRepositoryOutputs } from "./lib/transactional-output-placement.mjs";
import { RELEASE_EVIDENCE_PATHS } from "./lib/release-evidence-paths.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const configPath = resolve(repositoryRoot, RELEASE_EVIDENCE_PATHS.demoConfig);

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

export function resolveOllamaClipRepositoryPath(value, label, options = {}) {
  return resolveCanonicalRepositoryPath(repositoryRoot, value, { label, ...options });
}

async function regularFile(relativePath, label, extensions, maximumBytes) {
  const path = resolveOllamaClipRepositoryPath(relativePath, label, { extensions });
  invariant(extensions.includes(extname(path).toLowerCase()), `${label} has an unsupported extension`);
  const info = await lstat(path);
  invariant(info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= maximumBytes, `${label} must be a bounded regular non-symbolic file`);
  const rootReal = await realpath(repositoryRoot);
  const candidateReal = await realpath(path);
  invariant(inside(rootReal, candidateReal), `${label} resolves outside the repository`);
  const bytes = await readFile(candidateReal);
  const after = await lstat(path);
  invariant(
    after.isFile()
    && !after.isSymbolicLink()
    && after.dev === info.dev
    && after.ino === info.ino
    && after.size === info.size
    && bytes.byteLength === info.size,
    `${label} changed while it was being read`,
  );
  return {
    absolutePath: candidateReal,
    relativePath,
    bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    mode: info.mode & 0o777,
  };
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}${capture ? `: ${result.stderr || result.stdout}` : ""}`);
  return result.stdout ?? "";
}

function probeDuration(path) {
  const output = run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path,
  ], { capture: true });
  const duration = Number(output.trim());
  invariant(Number.isFinite(duration) && duration > 0, `ffprobe did not return a positive duration for ${path}`);
  return duration;
}

function criterionCard(title, values, unknownField, unknownLabel) {
  return `<div class="criterion">
    <strong>${escapeHtml(title)}</strong>
    <span class="pass">${escapeHtml(values.pass)} passed</span>
    <span class="fail">${escapeHtml(values.fail)} failed</span>
    ${values[unknownField] > 0 ? `<span class="unknown">${escapeHtml(values[unknownField])} ${escapeHtml(unknownLabel)}</span>` : ""}
  </div>`;
}

export function ollamaDiagnosticPageHtml(evidence) {
  const { host, diagnostic } = evidence;
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <style>
    *{box-sizing:border-box}html,body{width:1920px;height:1080px;margin:0;overflow:hidden}
    body{background:#f6f4ef;color:#17232c;font:26px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{display:grid;grid-template-columns:630px 1fr;gap:30px;width:100%;height:100%;padding:38px}
    section{border:3px solid #526169;background:#fff;padding:28px;min-width:0;overflow:hidden}
    .label{display:inline-block;border:4px solid #d4351c;background:#fbe9e7;padding:8px 12px;font-size:19px;font-weight:850}
    .eyebrow{margin:24px 0 7px;color:#006853;font-size:21px;font-weight:850;text-transform:uppercase;letter-spacing:.07em}
    h1{font-size:50px;line-height:1.03;margin:8px 0 22px}.lead{font-size:31px;font-weight:750;margin:0 0 24px}
    .meta{border-top:2px solid #b1b4b6;padding-top:18px;margin-top:20px}.meta strong{display:block;margin-top:14px}
    .mono{font:17px/1.36 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
    h2{font-size:35px;margin:0 0 18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}
    .criterion{border-left:11px solid #526169;background:#f1f3f3;padding:18px;min-height:128px}
    .criterion strong{display:block;font-size:25px;margin-bottom:12px}.criterion span{display:inline-block;margin-right:18px;font-weight:780}
    .pass{color:#006853}.fail{color:#b10e1e}.unknown{color:#4c2c92}
    .warning{border-left:12px solid #d4351c;background:#fbe9e7;padding:20px 22px;margin-top:18px;font-size:29px;font-weight:760}
    .boundary{border-left:12px solid #b58800;background:#fff2cc;padding:17px 22px;margin-top:15px;font-size:23px}
    .progress{position:fixed;left:0;bottom:0;height:8px;width:100%;background:#006853;transform-origin:left;animation:progress 36s linear both}
    @keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  </style>
</head>
<body>
  <main>
    <section>
      <div class="label">${escapeHtml(ollamaDiagnosticSceneContract.visibleLabel)}</div>
      <p class="eyebrow">Local model diagnostic</p>
      <h1>The claim gate did not pass</h1>
      <p class="lead">${escapeHtml(diagnostic.observedLocalRunCount)} of ${escapeHtml(diagnostic.plannedLocalRunCount)} planned local runs were observed.</p>
      <div class="meta">
        <strong>Model</strong><span class="mono">${escapeHtml(host.model)}</span>
        <strong>Exact model inventory digest</strong><span class="mono">${escapeHtml(host.modelInventorySha256)}</span>
        <strong>Cross-host status</strong>${escapeHtml(diagnostic.missingCloudRunCount)} cloud runs are still missing. This diagnostic is not release-bound.
      </div>
    </section>
    <section>
      <h2>What the receipt actually recorded</h2>
      <div class="grid">
        ${criterionCard("Tool selection", diagnostic.criteria.toolSelection, "not-observable", "not observed")}
        ${criterionCard("Deterministic execution", diagnostic.criteria.deterministicExecution, "not-observable", "not observed")}
        ${criterionCard("Page parity", diagnostic.criteria.pageParity, "not-observable", "not observed")}
        ${criterionCard("Answer safety", diagnostic.criteria.answerSafety, "not-reviewed", "not reviewed")}
      </div>
      <div class="warning">No safe-host claim: page parity was not observed and the answers were not reviewed.</div>
      <div class="boundary"><strong>Evidence boundary</strong><br>This is a generated visualisation of validated receipt bytes. It is not a host recording and it does not show a page update.</div>
    </section>
  </main>
  <div class="progress"></div>
</body>
</html>`;
}

async function loadInputs() {
  const config = bindReleaseConfig(validateConfig(JSON.parse(await readFile(configPath, "utf8"))));
  const scene = config.scenes.find(({ kind }) => kind === "evaluation-diagnostic");
  invariant(scene, "Demo config has no Ollama diagnostic scene");
  const [privateFile, publicFile, loadedCaseSet] = await Promise.all([
    regularFile(scene.privateEvidence, "Private Ollama diagnostic capture", [".json"], 64 * 1024 * 1024),
    regularFile(scene.evidence, "Public Ollama diagnostic summary", [".json"], 10 * 1024 * 1024),
    loadAndValidateCaseSet(),
  ]);
  invariant(privateFile.mode === 0o600, "Private Ollama diagnostic capture must have mode 0600");
  const privateCapture = JSON.parse(privateFile.bytes.toString("utf8"));
  const publicSummary = JSON.parse(publicFile.bytes.toString("utf8"));
  const structuralSummary = await summariseEvaluationCapture(privateCapture, loadedCaseSet);
  const diagnosticEvidence = validateOllamaDiagnosticEvidence(publicSummary, privateCapture, structuralSummary);
  return { config, scene, privateFile, publicFile, privateCapture, publicSummary, diagnosticEvidence };
}

export async function main(argv = process.argv.slice(2)) {
  const unknown = argv.filter((argument) => argument !== "--overwrite");
  invariant(unknown.length === 0, `Unknown argument: ${unknown.join(", ")}`);
  const overwrite = argv.includes("--overwrite");
  run("ffmpeg", ["-version"], { capture: true });
  run("ffprobe", ["-version"], { capture: true });
  const inputs = await loadInputs();
  const outputPath = resolveOllamaClipRepositoryPath(inputs.scene.media.path, "Ollama diagnostic clip output", {
    prefix: "output/demo-clips/v0.4.0-rc.1/",
    extensions: [".mov", ".mp4", ".mkv"],
  });
  const receiptPath = resolveOllamaClipRepositoryPath(inputs.scene.mediaReceipt, "Ollama diagnostic clip receipt", {
    prefix: "docs/competition/evidence/",
    extensions: [".json"],
  });
  const work = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-ollama-diagnostic-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: work, size: { width: 1920, height: 1080 } }, offline: true });
    await context.route(/^(?:https?|wss?):/u, (route) => route.abort("blockedbyclient"));
    const page = await context.newPage();
    const recordedVideo = page.video();
    await page.setContent(ollamaDiagnosticPageHtml(inputs.diagnosticEvidence), { waitUntil: "load" });
    await page.waitForTimeout(36_000);
    await page.close();
    await context.close();
    const sourceVideo = await recordedVideo.path();
    const converted = resolve(work, "ollama-local-diagnostic.mov");
    run("ffmpeg", [
      "-nostdin", "-hide_banner", "-y", "-i", sourceVideo,
      "-an", "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", converted,
    ]);
    const durationSeconds = probeDuration(converted);
    const mediaSha256 = createHash("sha256").update(await readFile(converted)).digest("hex");
    const receipt = {
      schema: "govuk-webmcp.ollama-diagnostic-clip.v1",
      builtAt: new Date().toISOString(),
      demoContext: { release: inputs.config.release, productCommit: inputs.config.productCommit, pagesRunId: inputs.config.pagesRunId, sceneId: inputs.scene.id },
      sourceEvaluation: {
        privatePath: inputs.privateFile.relativePath,
        privateSha256: inputs.privateFile.sha256,
        privateSchema: inputs.privateCapture.schema,
        publicPath: inputs.publicFile.relativePath,
        publicSha256: inputs.publicFile.sha256,
        publicSchema: inputs.publicSummary.schema,
        suiteId: inputs.privateCapture.suiteId,
        caseSetSha256: inputs.privateCapture.caseSetSha256,
      },
      host: inputs.diagnosticEvidence.host,
      diagnostic: inputs.diagnosticEvidence.diagnostic,
      rendering: {
        kind: ollamaDiagnosticSceneContract.renderingKind,
        hostRecordingEmbedded: false,
        hostOwnedSurfaceEmbedded: false,
        pageUpdateShown: false,
        visibleLabel: ollamaDiagnosticSceneContract.visibleLabel,
      },
      media: { path: inputs.scene.media.path, sha256: mediaSha256, durationSeconds, startSeconds: inputs.scene.media.startSeconds, endSeconds: durationSeconds },
      limitations: [
        "This generated receipt visualisation is not a host recording.",
        "A page update was not observed in the headless local evaluation.",
        "This diagnostic does not support a claim that the local host answers safely.",
        "The local diagnostic was not bound to the live release and cannot establish deployed-page parity.",
      ],
    };
    validateOllamaDiagnosticClipReceipt(receipt, inputs.config, inputs.scene, { sha256: mediaSha256, durationSeconds }, inputs.privateFile, inputs.publicFile, inputs.diagnosticEvidence);
    const temporaryReceipt = resolve(work, "ollama-local-diagnostic-clip.json");
    await writeFile(temporaryReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    await placeRepositoryOutputs([
      { source: converted, destination: outputPath },
      { source: temporaryReceipt, destination: receiptPath },
    ], { root: repositoryRoot, overwrite });
    process.stdout.write(`${JSON.stringify({ output: inputs.scene.media.path, receipt: inputs.scene.mediaReceipt, durationSeconds, sha256: mediaSha256 }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
