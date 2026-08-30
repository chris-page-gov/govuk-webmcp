import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, lstat, mkdtemp, mkdir, readFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import {
  repositoryRoot,
  validateConfig,
  validateSupportedHostEvidence,
} from "./build-demo-video.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const configPath = join(repositoryRoot, "docs/competition/demo-video-script.json");
const evidencePath = join(
  repositoryRoot,
  "docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json",
);
const screenshotPath = join(
  repositoryRoot,
  "docs/competition/evidence/demo-scene-04-comparison-2026-08-30.jpg",
);
const outputPath = join(
  repositoryRoot,
  "output/demo-clips/supported-host-webmcp-call-2026-08-30.mov",
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}${capture ? `: ${result.stderr || result.stdout}` : ""}`);
  }
  return result.stdout ?? "";
}

function probeDuration(path) {
  const output = run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path,
  ], { capture: true });
  const duration = Number(output.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`ffprobe did not return a positive duration for ${path}`);
  return duration;
}

function pageHtml(evidence, screenshotDataUrl) {
  const compare = evidence.calls.find(({ name }) => name === "compare_evidence_foundations");
  const tools = evidence.discovery.tools.map(({ name }) => name);
  const digest = evidence.finalPageObservation.displayResultDigest;
  const status = evidence.finalPageObservation.visibleStatus;
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { width: 1920px; height: 1080px; margin: 0; overflow: hidden; }
    body { background: #f6f4ef; color: #17232c; font: 28px/1.32 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .frame { display: grid; grid-template-columns: 760px 1fr; gap: 34px; width: 100%; height: 100%; padding: 42px; }
    .receipt, .page { border: 3px solid #526169; background: #fff; min-width: 0; overflow: hidden; }
    .receipt { padding: 30px; display: flex; flex-direction: column; }
    .badge { align-self: flex-start; border: 3px solid #526169; padding: 7px 11px; font-size: 19px; font-weight: 800; }
    .eyebrow { margin-top: 22px; color: #006853; font-size: 22px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 8px 0 10px; font-size: 49px; line-height: 1.02; letter-spacing: -.025em; }
    .boundary { border-left: 10px solid #b58800; background: #fff2cc; margin: 10px 0 18px; padding: 13px 16px; font-size: 19px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
    .metric { background: #e7eeeb; padding: 10px 12px; }
    .metric strong { display: block; font-size: 29px; }
    .metric span { font-size: 16px; }
    .tools { display: grid; gap: 8px; }
    .tool { border-left: 9px solid #7d8a90; background: #f1f3f3; padding: 8px 12px; font: 700 18px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; animation: toolPulse 7s ease-in-out infinite; }
    .tool:nth-child(2) { animation-delay: 1.1s; }
    .tool:nth-child(3) { animation-delay: 2.2s; }
    .tool:nth-child(4) { animation-delay: 3.3s; }
    .tool:nth-child(5) { animation-delay: 4.4s; }
    .call { margin-top: 16px; border: 2px solid #526169; padding: 13px; white-space: pre-wrap; font: 16px/1.34 ui-monospace, SFMono-Regular, Menlo, monospace; }
    .digest { margin-top: 12px; border: 3px solid #006853; background: #e6f4ea; padding: 11px; font: 700 15px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; animation: digestPulse 5s ease-in-out infinite; }
    .page { position: relative; display: flex; align-items: center; justify-content: center; background: #e7eeeb; }
    .page img { width: 100%; height: 100%; object-fit: contain; filter: saturate(.92); animation: slowPan 40s ease-in-out both; }
    .status { position: absolute; left: 28px; right: 28px; bottom: 28px; border: 3px solid #006853; background: rgba(255,255,255,.96); padding: 16px 19px; font-size: 20px; font-weight: 750; }
    .progress { position: absolute; left: 0; bottom: 0; width: 100%; height: 7px; background: #006853; transform-origin: left; animation: progress 40s linear both; }
    @keyframes toolPulse { 0%, 13%, 100% { border-left-color: #7d8a90; background: #f1f3f3; transform: translateX(0); } 5%, 9% { border-left-color: #006853; background: #e6f4ea; transform: translateX(7px); } }
    @keyframes digestPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,104,83,0); } 50% { box-shadow: 0 0 0 9px rgba(0,104,83,.14); } }
    @keyframes slowPan { from { transform: scale(1.01) translateY(0); } to { transform: scale(1.07) translateY(-14px); } }
    @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  </style>
</head>
<body>
  <main class="frame">
    <section class="receipt">
      <div class="badge">Independent experimental prototype</div>
      <div class="eyebrow">Codex in-app browser receipt visualisation</div>
      <h1>Five tools. Five successful calls.</h1>
      <div class="boundary">Local visualisation reconstructed from a machine-level host receipt — not a recording of a Site tools surface or a claim about another host.</div>
      <div class="summary">
        <div class="metric"><strong>${evidence.discovery.toolCount}</strong><span>tools discovered</span></div>
        <div class="metric"><strong>${evidence.calls.length}</strong><span>successful calls</span></div>
        <div class="metric"><strong>PASS</strong><span>result/display parity</span></div>
      </div>
      <div class="tools">${tools.map((tool) => `<div class="tool">${escapeHtml(tool)}</div>`).join("")}</div>
      <div class="call">compare_evidence_foundations({
  answerId: ${escapeHtml(JSON.stringify(compare.input.answerId))},
  claimIds: ${escapeHtml(JSON.stringify(compare.input.claimIds))}
})</div>
      <div class="digest">SHA-256 result/display digest<br>${escapeHtml(digest)}</div>
    </section>
    <section class="page">
      <img src="${screenshotDataUrl}" alt="Public release comparison view">
      <div class="status">${escapeHtml(status)}</div>
      <div class="progress"></div>
    </section>
  </main>
</body>
</html>`;
}

async function main() {
  const overwrite = process.argv.slice(2).includes("--overwrite");
  if ((await exists(outputPath)) && !overwrite) {
    throw new Error(`Output exists; rerun with --overwrite after review: ${outputPath}`);
  }

  const config = validateConfig(JSON.parse(await readFile(configPath, "utf8")));
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  validateSupportedHostEvidence(evidence, config);
  const screenshot = await readFile(screenshotPath);
  const screenshotDataUrl = `data:image/jpeg;base64,${screenshot.toString("base64")}`;

  const work = await mkdtemp(join(tmpdir(), "govuk-webmcp-host-clip-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: work, size: { width: 1920, height: 1080 } },
    });
    await context.route("**/*", (route) => route.abort("blockedbyclient"));
    const page = await context.newPage();
    const recordedVideo = page.video();
    await page.setContent(pageHtml(evidence, screenshotDataUrl), { waitUntil: "load" });
    await page.waitForTimeout(40_000);
    await page.close();
    await context.close();
    const sourceVideo = await recordedVideo.path();
    const converted = join(work, "supported-host-webmcp-call.mov");
    run("ffmpeg", [
      "-nostdin", "-hide_banner", "-y", "-i", sourceVideo,
      "-an", "-vf", "fps=30,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "18",
      converted,
    ]);
    await mkdir(dirname(outputPath), { recursive: true });
    const pending = `${outputPath}.pending-${process.pid}`;
    await copyFile(converted, pending);
    if (overwrite) await rm(outputPath, { force: true });
    await rename(pending, outputPath);
    const sha256 = createHash("sha256").update(await readFile(outputPath)).digest("hex");
    const durationSeconds = probeDuration(outputPath);
    process.stdout.write(`${JSON.stringify({ output: outputPath, durationSeconds, sha256 }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
