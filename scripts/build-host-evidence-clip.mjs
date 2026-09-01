import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import {
  bindReleaseConfig,
  repositoryRoot,
  validateConfig,
  validateHostMediaReceipt,
  validateInteractionCaptureEvidence,
  validateSupportedHostEvidence,
  verifyDemoDeployment,
} from "./build-demo-video.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const configPath = resolve(repositoryRoot, "docs/competition/demo-video-script-v0.4.0-rc.1.json");
const reconstructionLabel = "Receipt reconstruction — not a host recording";

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

function repositoryPath(value, label) {
  invariant(typeof value === "string" && value.length > 0 && !isAbsolute(value), `${label} must be repository-relative`);
  const path = resolve(repositoryRoot, value);
  invariant(inside(repositoryRoot, path), `${label} resolves outside the repository`);
  return path;
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

async function regularFile(relativePath, label, extensions, maximumBytes) {
  const path = repositoryPath(relativePath, label);
  invariant(extensions.includes(extname(path).toLowerCase()), `${label} has an unsupported extension`);
  const info = await lstat(path);
  invariant(info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= maximumBytes, `${label} must be a bounded regular non-symbolic file`);
  invariant(inside(await realpath(repositoryRoot), await realpath(path)), `${label} resolves outside the repository`);
  return {
    absolutePath: path,
    relativePath,
    sha256: createHash("sha256").update(await readFile(path)).digest("hex"),
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

function pageHtml(evidence) {
  const search = evidence.calls.find(({ name }) => name === "search_government_knowledge");
  const record = evidence.calls.find(({ name }) => name === "get_resource_record");
  const compare = evidence.calls.find(({ name }) => name === "compare_evidence_foundations");
  const present = evidence.calls.find(({ name }) => name === "present_resource_evidence");
  const tools = evidence.discovery.tools.map(({ name }) => name);
  const observed = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/London",
  }).format(new Date(evidence.capturedAt));
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <style>
    *{box-sizing:border-box}html,body{width:1920px;height:1080px;margin:0;overflow:hidden}
    body{background:#f6f4ef;color:#17232c;font:27px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{display:grid;grid-template-columns:690px 1fr;gap:28px;width:100%;height:100%;padding:36px}
    section{border:3px solid #526169;background:#fff;padding:26px;min-width:0;overflow:hidden}
    .label{display:inline-block;border:4px solid #b58800;background:#fff2cc;padding:8px 12px;font-size:19px;font-weight:850}
    .eyebrow{margin:20px 0 5px;color:#006853;font-size:21px;font-weight:850;text-transform:uppercase;letter-spacing:.07em}
    h1{font-size:44px;line-height:1.02;margin:8px 0 14px}.host{font-size:21px;margin:0 0 18px}
    .tools{display:grid;gap:8px}.tool{border-left:9px solid #7d8a90;background:#f1f3f3;padding:9px 12px;font:700 17px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;animation:pulse 7s ease-in-out infinite}
    .tool:nth-child(2){animation-delay:1s}.tool:nth-child(3){animation-delay:2s}.tool:nth-child(4){animation-delay:3s}.tool:nth-child(5){animation-delay:4s}.tool:nth-child(6){animation-delay:5s}
    h2{font-size:31px;margin:0 0 12px}.card{border-left:10px solid #006853;background:#e6f4ea;padding:15px 18px;margin:0 0 15px}
    .card.warning{border-color:#b58800;background:#fff2cc}.card strong{display:block;margin-bottom:5px}.mono{font:17px/1.34 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
    ul{margin:8px 0 0;padding-left:27px}.digest{font-size:15px}.progress{position:fixed;left:0;bottom:0;height:7px;width:100%;background:#006853;transform-origin:left;animation:progress 40s linear both}
    @keyframes pulse{0%,13%,100%{border-left-color:#7d8a90;transform:translateX(0)}5%,9%{border-left-color:#006853;transform:translateX(7px)}}
    @keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  </style>
</head>
<body>
  <main>
    <section>
      <div class="label">${escapeHtml(reconstructionLabel)}</div>
      <p class="eyebrow">Observed supported-host receipt</p>
      <h1>Six bounded WebMCP tools</h1>
      <p class="host">Receipt from <strong>${escapeHtml(evidence.host.name)} ${escapeHtml(evidence.host.version)}</strong><br>observed ${escapeHtml(observed)}</p>
      <div class="tools">${tools.map((tool) => `<div class="tool">${escapeHtml(tool)}</div>`).join("")}</div>
    </section>
    <section>
      <h2>Same evidence, progressive retrieval</h2>
      <div class="card"><strong>Four-source search</strong><span class="mono">${escapeHtml(search.input.query)} · limit ${escapeHtml(search.input.limit)}<br>${escapeHtml(search.input.collections.join(" · "))}</span></div>
      <div class="card"><strong>Bound federated record and provenance</strong><span class="mono">${escapeHtml(record.input.recordId)}</span><br>${escapeHtml(record.result.record.sourceAuthority)} · no item receipt</div>
      <div class="card"><strong>Reviewed evidence comparison</strong>${escapeHtml(compare.input.claimIds.join(" · "))}<br><span class="mono digest">SHA-256 ${escapeHtml(compare.canonicalResultDigest)}</span></div>
      <div class="card"><strong>Evidence answer presentation</strong><span class="mono">${escapeHtml(present.input.recordId)}</span><br><span class="mono digest">Evidence SHA-256 ${escapeHtml(present.result.evidenceDigest)}</span></div>
      <div class="card warning"><strong>Personal-AI boundary</strong>The closed search schema has no personal-context field. The executable check rejected <span class="mono">personalContext</span>; only field names and the deterministic error are retained.</div>
      <div class="card warning"><strong>What this visual proves</strong>It reconstructs an exact host receipt. It does not embed or imitate a host-owned recording and does not claim support in any other host.</div>
    </section>
  </main>
  <div class="progress"></div>
</body>
</html>`;
}

async function loadInputs() {
  const rawConfig = validateConfig(JSON.parse(await readFile(configPath, "utf8")));
  const config = bindReleaseConfig(rawConfig);
  await verifyDemoDeployment(config);
  const scene = config.scenes.find(({ kind }) => kind === "receipt-visualisation");
  invariant(scene, "Demo config has no supported-host receipt scene");

  const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
  const mediaById = new Map();
  for (const interactionScene of interactionScenes) {
    const mediaFile = await regularFile(interactionScene.media.path, `Interaction media ${interactionScene.id}`, [".mov", ".mp4", ".mkv"], 1_500_000_000);
    mediaById.set(interactionScene.id, { sha256: mediaFile.sha256, durationSeconds: probeDuration(mediaFile.absolutePath) });
  }
  const interactionFile = await regularFile(config.interactionCaptureReceipt, "Live interaction receipt", [".json"], 10_000_000);
  const interaction = JSON.parse(await readFile(interactionFile.absolutePath, "utf8"));
  const interactionSummary = validateInteractionCaptureEvidence(interaction, config, interactionScenes, mediaById);

  const evidenceFile = await regularFile(scene.evidence, "Supported-host evidence", [".json"], 10_000_000);
  const evidence = JSON.parse(await readFile(evidenceFile.absolutePath, "utf8"));
  validateSupportedHostEvidence(evidence, config, interactionSummary.demonstratedRecordId);
  const artefactFiles = new Map();
  for (const artefact of evidence.artefacts) {
    const file = await regularFile(artefact.path, `Supported-host artefact ${artefact.path}`, [".json", ".png", ".jpg", ".jpeg", ".txt"], 50_000_000);
    invariant(file.sha256 === artefact.sha256, `Supported-host artefact SHA-256 has drifted: ${artefact.path}`);
    artefactFiles.set(file.relativePath, file);
  }
  return { config, scene, evidence, evidenceFile, artefactFiles };
}

async function placeOutputs(entries, overwrite) {
  for (const { destination } of entries) {
    invariant(inside(repositoryRoot, destination), `Destination is outside the repository: ${destination}`);
    if (await exists(destination)) {
      const info = await lstat(destination);
      invariant(info.isFile() && !info.isSymbolicLink(), `Destination is not a regular file: ${destination}`);
      invariant(overwrite, `Output exists; rerun with --overwrite after review: ${destination}`);
    }
  }
  const prepared = [];
  const backups = [];
  const committed = [];
  try {
    for (const { source, destination } of entries) {
      await mkdir(dirname(destination), { recursive: true });
      invariant(inside(await realpath(repositoryRoot), await realpath(dirname(destination))), `Destination parent resolves outside the repository: ${dirname(destination)}`);
      const temporary = `${destination}.pending-${process.pid}-${randomUUID()}`;
      await copyFile(source, temporary);
      prepared.push({ temporary, destination });
    }
    for (const { destination } of prepared) {
      if (await exists(destination)) {
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
    for (const { destination, backup } of backups.reverse()) if (await exists(backup)) await rename(backup, destination);
    for (const { temporary } of prepared) await rm(temporary, { force: true });
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const unknown = argv.filter((argument) => argument !== "--overwrite");
  invariant(unknown.length === 0, `Unknown argument: ${unknown.join(", ")}`);
  const overwrite = argv.includes("--overwrite");
  run("ffmpeg", ["-version"], { capture: true });
  run("ffprobe", ["-version"], { capture: true });
  const inputs = await loadInputs();
  const outputPath = repositoryPath(inputs.scene.media.path, "Supported-host clip output");
  const receiptPath = repositoryPath(inputs.scene.mediaReceipt, "Supported-host clip receipt");
  const work = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-host-clip-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: work, size: { width: 1920, height: 1080 } }, offline: true });
    await context.route(/^(?:https?|wss?):/u, (route) => route.abort("blockedbyclient"));
    const page = await context.newPage();
    const recordedVideo = page.video();
    await page.setContent(pageHtml(inputs.evidence), { waitUntil: "load" });
    await page.waitForTimeout(40_000);
    await page.close();
    await context.close();
    const sourceVideo = await recordedVideo.path();
    const converted = resolve(work, "supported-host-webmcp.mov");
    run("ffmpeg", [
      "-nostdin", "-hide_banner", "-y", "-i", sourceVideo,
      "-an", "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", converted,
    ]);
    const durationSeconds = probeDuration(converted);
    const mediaSha256 = createHash("sha256").update(await readFile(converted)).digest("hex");
    const receipt = {
      schema: "trusted-govuk-discovery.supported-host-webmcp-clip.v1",
      builtAt: new Date().toISOString(),
      page: { url: inputs.config.productUrl, release: inputs.config.release, productCommit: inputs.config.productCommit, pagesRunId: inputs.config.pagesRunId },
      sourceEvidence: { path: inputs.evidenceFile.relativePath, sha256: inputs.evidenceFile.sha256 },
      sourceArtefacts: [...inputs.artefactFiles.values()].map(({ relativePath, sha256 }) => ({ path: relativePath, sha256 })).sort((left, right) => left.path.localeCompare(right.path, "en-GB")),
      rendering: { kind: "receipt-reconstruction", hostRecordingEmbedded: false, hostOwnedSurfaceEmbedded: false, visibleLabel: reconstructionLabel },
      media: { path: inputs.scene.media.path, sha256: mediaSha256, durationSeconds, startSeconds: inputs.scene.media.startSeconds, endSeconds: durationSeconds },
    };
    validateHostMediaReceipt(receipt, inputs.config, inputs.scene, { sha256: mediaSha256, durationSeconds }, inputs.evidenceFile, inputs.artefactFiles);
    const temporaryReceipt = resolve(work, "supported-host-webmcp-clip.json");
    await writeFile(temporaryReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    await placeOutputs([
      { source: converted, destination: outputPath },
      { source: temporaryReceipt, destination: receiptPath },
    ], overwrite);
    process.stdout.write(`${JSON.stringify({ output: inputs.scene.media.path, receipt: inputs.scene.mediaReceipt, durationSeconds, sha256: mediaSha256 }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
