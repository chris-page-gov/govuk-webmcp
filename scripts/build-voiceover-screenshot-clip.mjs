import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
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

import { chromium } from "@playwright/test";

import {
  repositoryRoot,
  requiredVoiceOverJourneyIds,
  validateConfig,
} from "./build-demo-video.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const captureRoot = resolve(repositoryRoot, "output/voiceover-capture");
const defaultManifestPath = join(captureRoot, "capture-manifest.json");
export const voiceOverScreenshotOutput = resolve(
  repositoryRoot,
  "output/demo-clips/demo-scene-06-voiceover-2026-08-30.mov",
);
const demoConfigPath = resolve(repositoryRoot, "docs/competition/demo-video-script.json");
const requiredLimitation = "This screenshot sequence is not a continuous recording.";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, allowed, required, label) {
  invariant(isObject(value), `${label} must be an object`);
  const keys = Object.keys(value);
  const unknown = keys.filter((key) => !allowed.includes(key));
  const missing = required.filter((key) => !keys.includes(key));
  invariant(unknown.length === 0, `${label} has unknown fields: ${unknown.join(", ")}`);
  invariant(missing.length === 0, `${label} is missing fields: ${missing.join(", ")}`);
}

function nonEmptyString(value, label, maximum = 500) {
  invariant(
    typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= maximum,
    `${label} must be a trimmed non-empty string of at most ${maximum} characters`,
  );
  invariant(!/[\u0000-\u001f\u007f]/u.test(value), `${label} contains a control character`);
  return value;
}

function validTimestamp(value, label) {
  const match = typeof value === "string"
    ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/u.exec(value)
    : null;
  const parsed = match ? Date.parse(value) : Number.NaN;
  invariant(match && Number.isFinite(parsed), `${label} must be an RFC 3339 timestamp`);
  const [, year, month, day, hour, minute, second, fraction = "", zone, sign, zoneHour = "00", zoneMinute = "00"] = match;
  invariant(Number(zoneHour) <= 14 && Number(zoneMinute) <= 59 && !(Number(zoneHour) === 14 && Number(zoneMinute) !== 0), `${label} has an invalid time-zone offset`);
  const offsetMinutes = zone === "Z" ? 0 : (sign === "+" ? 1 : -1) * ((Number(zoneHour) * 60) + Number(zoneMinute));
  const local = new Date(parsed + (offsetMinutes * 60_000));
  invariant(
    local.getUTCFullYear() === Number(year)
      && local.getUTCMonth() + 1 === Number(month)
      && local.getUTCDate() === Number(day)
      && local.getUTCHours() === Number(hour)
      && local.getUTCMinutes() === Number(minute)
      && local.getUTCSeconds() === Number(second)
      && local.getUTCMilliseconds() === Number(fraction.padEnd(3, "0") || "0"),
    `${label} has an invalid calendar date or time`,
  );
  return parsed;
}

function sameValues(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function inside(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

function canonicalCapturePath(value, label, extensions) {
  nonEmptyString(value, label, 320);
  invariant(!isAbsolute(value) && !win32.isAbsolute(value), `${label} must be repository-relative`);
  invariant(!value.includes("\\") && posix.normalize(value) === value, `${label} is not a canonical POSIX path`);
  invariant(!value.split("/").some((part) => part === "" || part === "." || part === ".."), `${label} has an unsafe path segment`);
  invariant(value.startsWith("output/voiceover-capture/"), `${label} must stay beneath output/voiceover-capture`);
  invariant(!/preview/iu.test(value), `${label} must not use a preview path`);
  invariant(extensions.includes(extname(value).toLowerCase()), `${label} has an unsupported extension`);
  const absolutePath = resolve(repositoryRoot, value);
  invariant(inside(captureRoot, absolutePath), `${label} resolves outside output/voiceover-capture`);
  return absolutePath;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
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

function probe(path) {
  return JSON.parse(run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size,format_name:stream=codec_name,codec_type,width,height,r_frame_rate,pix_fmt",
    "-of", "json",
    path,
  ], { capture: true }).stdout);
}

function parseArguments(argv) {
  const options = { manifestPath: defaultManifestPath, overwrite: false, preflightOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--overwrite") options.overwrite = true;
    else if (argument === "--preflight-only") options.preflightOnly = true;
    else if (argument === "--manifest") {
      const value = argv[index + 1];
      if (!value) throw new Error("--manifest requires a value");
      options.manifestPath = canonicalCapturePath(value, "Capture manifest", [".json"]);
      index += 1;
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  invariant(inside(captureRoot, options.manifestPath), "Capture manifest must stay beneath output/voiceover-capture");
  return options;
}

export function validateCaptureManifest(manifest, config) {
  exactKeys(
    manifest,
    [
      "schema", "capturedAt", "page", "captureMethod", "manual",
      "assistiveTechnologyActuallyUsed", "withoutWebMCP", "noWcagConformanceClaim",
      "browser", "screenReader", "continuousRecording",
      "frames", "limitations",
    ],
    [
      "schema", "capturedAt", "page", "captureMethod", "manual",
      "assistiveTechnologyActuallyUsed", "withoutWebMCP", "noWcagConformanceClaim",
      "browser", "screenReader", "continuousRecording",
      "frames", "limitations",
    ],
    "VoiceOver screenshot capture manifest",
  );
  invariant(
    manifest.schema === "trusted-govuk-discovery.voiceover-screenshot-sequence-capture.v1",
    "VoiceOver screenshot capture manifest has the wrong schema",
  );
  const capturedAt = validTimestamp(manifest.capturedAt, "Capture manifest capturedAt");
  exactKeys(manifest.page, ["url", "release", "productCommit"], ["url", "release", "productCommit"], "Capture manifest page");
  invariant(manifest.page.url === config.productUrl, "Capture manifest page URL does not match the exact public product URL");
  invariant(manifest.page.release === config.release, "Capture manifest release does not match the video script");
  invariant(manifest.page.productCommit === config.productCommit, "Capture manifest product commit does not match the video script");
  invariant(manifest.captureMethod === "manual-safari-voiceover-screenshot-sequence", "Capture method must identify a manual Safari VoiceOver screenshot sequence");
  invariant(manifest.manual === true && manifest.assistiveTechnologyActuallyUsed === true, "Capture manifest must record genuine manual VoiceOver use");
  invariant(manifest.withoutWebMCP === true, "Capture manifest must record the human journey without WebMCP");
  invariant(manifest.noWcagConformanceClaim === true, "Capture manifest must retain the no-WCAG-conformance boundary");
  exactKeys(manifest.browser, ["name", "version"], ["name", "version"], "Capture manifest browser");
  invariant(manifest.browser.name === "Safari", "Capture manifest browser must be Safari");
  nonEmptyString(manifest.browser.version, "Safari version", 100);
  exactKeys(manifest.screenReader, ["name", "version"], ["name", "version"], "Capture manifest screen reader");
  invariant(manifest.screenReader.name === "VoiceOver", "Capture manifest screen reader must be VoiceOver");
  nonEmptyString(manifest.screenReader.version, "VoiceOver version", 100);
  invariant(manifest.continuousRecording === false, "Screenshot capture must not claim to be a continuous recording");
  invariant(Array.isArray(manifest.limitations) && manifest.limitations.includes(requiredLimitation), `Capture limitations must include: ${requiredLimitation}`);
  for (const limitation of manifest.limitations) nonEmptyString(limitation, "Capture limitation", 1_000);

  invariant(Array.isArray(manifest.frames), "Capture manifest frames must be an array");
  invariant(manifest.frames.length === requiredVoiceOverJourneyIds.length, "Capture manifest must contain exactly nine VoiceOver frames");
  const ids = manifest.frames.map(({ id }) => id);
  invariant(sameValues(ids, requiredVoiceOverJourneyIds), "Capture frame IDs must cover the exact nine VoiceOver journey IDs in order");
  invariant(new Set(ids).size === ids.length, "Capture frame IDs must be unique");
  let previousTimestamp = -Infinity;
  let firstTimestamp;
  let totalDurationSeconds = 0;
  const paths = new Set();
  const hashes = new Set();
  for (const [index, frame] of manifest.frames.entries()) {
    exactKeys(frame, ["id", "path", "sha256", "capturedAt", "holdSeconds", "label"], ["id", "path", "sha256", "capturedAt", "holdSeconds", "label"], `Capture frame ${index + 1}`);
    canonicalCapturePath(frame.path, `Capture frame ${frame.id} path`, [".png", ".jpg", ".jpeg"]);
    invariant(!paths.has(frame.path), `Capture frame path is duplicated: ${frame.path}`);
    paths.add(frame.path);
    invariant(/^[a-f0-9]{64}$/u.test(frame.sha256), `Capture frame ${frame.id} SHA-256 is invalid`);
    invariant(!hashes.has(frame.sha256), `Capture frame ${frame.id} duplicates another frame's bytes`);
    hashes.add(frame.sha256);
    const timestamp = validTimestamp(frame.capturedAt, `Capture frame ${frame.id} capturedAt`);
    invariant(timestamp > previousTimestamp, "Capture frame timestamps must be strictly increasing");
    invariant(timestamp <= capturedAt, `Capture frame ${frame.id} occurs after manifest capturedAt`);
    firstTimestamp ??= timestamp;
    previousTimestamp = timestamp;
    invariant(Number.isFinite(frame.holdSeconds) && frame.holdSeconds >= 2 && frame.holdSeconds <= 5, `Capture frame ${frame.id} holdSeconds must be from 2 to 5 seconds`);
    totalDurationSeconds += frame.holdSeconds;
    nonEmptyString(frame.label, `Capture frame ${frame.id} label`, 90);
  }
  invariant(capturedAt <= Date.now() + (5 * 60 * 1_000), "Capture manifest capturedAt must not be more than five minutes in the future");
  invariant(previousTimestamp - firstTimestamp >= 30_000, "Screenshot journey must span at least 30 seconds of observation");
  invariant(previousTimestamp - firstTimestamp <= 30 * 60 * 1_000, "Screenshot journey must not span more than 30 minutes");
  invariant(capturedAt - previousTimestamp <= 5 * 60 * 1_000, "Capture manifest capturedAt must be within five minutes of the final frame");
  invariant(totalDurationSeconds >= 21 && totalDurationSeconds <= 40, "Screenshot sequence must last from 21 to 40 seconds");
  return { frameCount: manifest.frames.length, totalDurationSeconds };
}

async function assertNoSymlinkComponents(path, root) {
  const rootInfo = await lstat(root);
  invariant(rootInfo.isDirectory() && !rootInfo.isSymbolicLink(), "output/voiceover-capture must be a real directory, not a symbolic link");
  const parts = relative(root, path).split(sep);
  let cursor = root;
  for (const part of parts) {
    cursor = join(cursor, part);
    const info = await lstat(cursor);
    invariant(!info.isSymbolicLink(), `${relative(repositoryRoot, cursor).split(sep).join("/")} must not be a symbolic link`);
  }
}

async function readRegularCaptureFile(relativePath, label, extensions, minimumBytes, maximumBytes) {
  const path = canonicalCapturePath(relativePath, label, extensions);
  await assertNoSymlinkComponents(path, captureRoot);
  const rootReal = await realpath(captureRoot);
  const fileReal = await realpath(path);
  invariant(inside(rootReal, fileReal), `${label} resolves outside output/voiceover-capture`);
  const handle = await open(fileReal, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    invariant(info.isFile(), `${label} must be a regular non-symbolic-link file`);
    invariant(info.size >= minimumBytes && info.size <= maximumBytes, `${label} has a weak or excessive file size`);
    const bytes = await handle.readFile();
    invariant(bytes.length === info.size, `${label} changed while it was read`);
    return { path: fileReal, sizeBytes: info.size, bytes };
  } finally {
    await handle.close();
  }
}

async function inspectFrame(frame) {
  const file = await readRegularCaptureFile(frame.path, `Capture frame ${frame.id}`, [".png", ".jpg", ".jpeg"], 10_000, 40_000_000);
  invariant(sha256(file.bytes) === frame.sha256, `Capture frame ${frame.id} SHA-256 has drifted`);
  const snapshot = await mkdtemp(join(tmpdir(), "govuk-webmcp-voiceover-frame-"));
  try {
    const extension = extname(frame.path).toLowerCase();
    const snapshotPath = join(snapshot, `verified${extension}`);
    await writeFile(snapshotPath, file.bytes, { flag: "wx" });
    const result = probe(snapshotPath);
    const streams = result.streams ?? [];
    invariant(streams.length === 1 && streams[0].codec_type === "video", `Capture frame ${frame.id} must contain exactly one image stream`);
    const image = streams[0];
    invariant((extension === ".png" && image.codec_name === "png") || ([".jpg", ".jpeg"].includes(extension) && image.codec_name === "mjpeg"), `Capture frame ${frame.id} extension does not match its image codec`);
    invariant(image.width >= 1280 && image.height >= 720, `Capture frame ${frame.id} is too small; at least 1280x720 is required`);
    invariant(image.width <= 10_000 && image.height <= 10_000, `Capture frame ${frame.id} dimensions are excessive`);
    const aspect = image.width / image.height;
    invariant(aspect >= 1.2 && aspect <= 2.5, `Capture frame ${frame.id} has an implausible screen aspect ratio`);
    run("ffmpeg", ["-v", "error", "-i", snapshotPath, "-frames:v", "1", "-f", "null", "-"], { capture: true });
    return { ...file, sha256: frame.sha256, width: image.width, height: image.height, codec: image.codec_name };
  } finally {
    await rm(snapshot, { recursive: true, force: true });
  }
}

export async function preflightCapture(manifestPath = defaultManifestPath) {
  invariant(inside(captureRoot, manifestPath), "Capture manifest must stay beneath output/voiceover-capture");
  const relativeManifest = relative(repositoryRoot, manifestPath).split(sep).join("/");
  const manifestFile = await readRegularCaptureFile(relativeManifest, "Capture manifest", [".json"], 100, 256_000);
  const config = validateConfig(JSON.parse(await readFile(demoConfigPath, "utf8")));
  const manifest = JSON.parse(manifestFile.bytes.toString("utf8"));
  const summary = validateCaptureManifest(manifest, config);
  const frames = [];
  for (const frame of manifest.frames) frames.push({ manifest: frame, file: await inspectFrame(frame) });
  run("ffmpeg", ["-version"], { capture: true });
  run("ffprobe", ["-version"], { capture: true });
  const encoders = run("ffmpeg", ["-hide_banner", "-encoders"], { capture: true }).stdout;
  invariant(/\blibx264\b/u.test(encoders), "ffmpeg lacks libx264 encoding support");
  return {
    config,
    manifest,
    manifestFile: { ...manifestFile, sha256: sha256(manifestFile.bytes) },
    frames,
    summary,
  };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function renderLabelledFrames(preflight, work) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-background-networking", "--disable-component-update", "--no-default-browser-check"],
  });
  const rendered = [];
  const networkRequests = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, offline: true });
    await context.route(/^(?:https?|wss?):/u, async (route) => {
      networkRequests.push(route.request().url());
      await route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    for (const [index, frame] of preflight.frames.entries()) {
      const extension = extname(frame.manifest.path).toLowerCase();
      const mime = extension === ".png" ? "image/png" : "image/jpeg";
      const data = frame.file.bytes.toString("base64");
      const captured = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Europe/London",
      }).format(new Date(frame.manifest.capturedAt));
      await page.setContent(`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>
        *{box-sizing:border-box}html,body{width:1920px;height:1080px;margin:0;overflow:hidden;background:#f3f2f1;color:#0b0c0c;font-family:Arial,sans-serif}
        body{display:grid;grid-template-rows:112px 884px 84px}
        header{background:#0b0c0c;color:#fff;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;border-bottom:8px solid #1d70b8}
        header strong{font-size:34px;letter-spacing:.2px}header span{font-size:25px;font-weight:700;color:#ffdd00;border:3px solid #ffdd00;padding:10px 15px}
        main{display:flex;align-items:center;justify-content:center;overflow:hidden;background:#505a5f}main img{display:block;max-width:100%;max-height:100%;object-fit:contain}
        footer{background:#fff;padding:16px 40px;display:flex;align-items:center;gap:24px;border-top:3px solid #b1b4b6;font-size:27px;font-weight:700}
        footer b{color:#1d70b8}footer small{margin-left:auto;font-size:21px;font-weight:400;color:#505a5f}
      </style></head><body><header><strong>Manual Safari + VoiceOver observation</strong><span>SCREENSHOT SEQUENCE — NOT A CONTINUOUS RECORDING</span></header><main><img alt="" src="data:${mime};base64,${data}"></main><footer><b>${String(index + 1).padStart(2, "0")} / ${String(preflight.frames.length).padStart(2, "0")}</b><span>${escapeHtml(frame.manifest.label)}</span><small>${escapeHtml(captured)}</small></footer></body></html>`, { waitUntil: "load" });
      await page.locator("img").evaluate((image) => image.decode());
      const destination = join(work, `labelled-${String(index + 1).padStart(2, "0")}.png`);
      await page.screenshot({ path: destination, fullPage: false, animations: "disabled" });
      rendered.push({ path: destination, duration: frame.manifest.holdSeconds });
    }
    await context.close();
  } finally {
    await browser.close();
  }
  invariant(networkRequests.length === 0, `Label rendering attempted network requests: ${networkRequests.join(", ")}`);
  return rendered;
}

function concatManifest(frames) {
  const lines = [];
  for (const frame of frames) {
    lines.push(`file '${frame.path.replaceAll("'", "'\\''")}'`, `duration ${frame.duration.toFixed(3)}`);
  }
  lines.push(`file '${frames.at(-1).path.replaceAll("'", "'\\''")}'`);
  return `${lines.join("\n")}\n`;
}

export function validateRenderedClip(result, expectedDuration) {
  const duration = Number(result?.format?.duration);
  invariant(Number.isFinite(duration) && Math.abs(duration - expectedDuration) <= 0.15, "Rendered VoiceOver sequence duration does not match its manifest");
  const video = result?.streams?.filter(({ codec_type }) => codec_type === "video") ?? [];
  invariant(video.length === 1, "Rendered VoiceOver sequence must contain exactly one video stream");
  invariant(!result?.streams?.some(({ codec_type }) => codec_type === "audio"), "Rendered VoiceOver sequence must not contain an unrelated audio stream");
  invariant(video[0].codec_name === "h264", "Rendered VoiceOver sequence must use H.264");
  invariant(video[0].width === 1920 && video[0].height === 1080, "Rendered VoiceOver sequence must be 1920x1080");
  invariant(video[0].r_frame_rate === "30/1" && video[0].pix_fmt === "yuv420p", "Rendered VoiceOver sequence must use 30 fps yuv420p");
  invariant(String(result?.format?.format_name ?? "").split(",").includes("mov"), "Rendered VoiceOver sequence must use a MOV-compatible container");
  invariant(Number(result?.format?.size) >= 250_000, "Rendered VoiceOver sequence output is too small to be credible media");
  return { durationSeconds: duration, width: video[0].width, height: video[0].height, codec: video[0].codec_name, pixelFormat: video[0].pix_fmt };
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function placeOutput(source, overwrite) {
  await mkdir(dirname(voiceOverScreenshotOutput), { recursive: true });
  const parentReal = await realpath(dirname(voiceOverScreenshotOutput));
  invariant(inside(resolve(repositoryRoot, "output"), parentReal), "VoiceOver output directory resolves outside output");
  if (await pathExists(voiceOverScreenshotOutput)) {
    const info = await lstat(voiceOverScreenshotOutput);
    invariant(info.isFile() && !info.isSymbolicLink(), "Existing VoiceOver output must be a regular non-symbolic-link file");
    invariant(overwrite, "VoiceOver output exists; rerun with --overwrite after review");
  }
  const pending = `${voiceOverScreenshotOutput}.pending-${process.pid}-${randomUUID()}`;
  await copyFile(source, pending, fsConstants.COPYFILE_EXCL);
  let backup;
  try {
    if (overwrite && await pathExists(voiceOverScreenshotOutput)) {
      backup = `${voiceOverScreenshotOutput}.backup-${process.pid}-${randomUUID()}`;
      await rename(voiceOverScreenshotOutput, backup);
    }
    await rename(pending, voiceOverScreenshotOutput);
    if (backup) await rm(backup);
  } catch (error) {
    await rm(pending, { force: true });
    if (backup && await pathExists(backup)) await rename(backup, voiceOverScreenshotOutput);
    throw error;
  }
}

async function build(preflight, overwrite) {
  const work = await mkdtemp(join(tmpdir(), "govuk-webmcp-voiceover-sequence-"));
  try {
    const frames = await renderLabelledFrames(preflight, work);
    const listPath = join(work, "frames.txt");
    const moviePath = join(work, "voiceover-screenshot-sequence.mov");
    await writeFile(listPath, concatManifest(frames), "utf8");
    run("ffmpeg", [
      "-nostdin", "-y", "-f", "concat", "-safe", "0", "-i", listPath,
      "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p",
      "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
      "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", moviePath,
    ]);
    const media = validateRenderedClip(probe(moviePath), preflight.summary.totalDurationSeconds);
    await placeOutput(moviePath, overwrite);
    return {
      status: "built-local-screenshot-sequence-not-continuous-recording",
      output: relative(repositoryRoot, voiceOverScreenshotOutput).split(sep).join("/"),
      sha256: sha256(await readFile(voiceOverScreenshotOutput)),
      ...media,
      manifest: {
        path: relative(repositoryRoot, preflight.manifestFile.path).split(sep).join("/"),
        sha256: preflight.manifestFile.sha256,
      },
      frames: preflight.frames.map(({ manifest, file }) => ({ id: manifest.id, path: manifest.path, sha256: file.sha256 })),
      limitation: requiredLimitation,
    };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const preflight = await preflightCapture(options.manifestPath);
  if (options.preflightOnly) {
    process.stdout.write(`${JSON.stringify({
      status: "preflight-passed-for-screenshot-sequence",
      manifest: relative(repositoryRoot, preflight.manifestFile.path).split(sep).join("/"),
      ...preflight.summary,
    }, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(await build(preflight, options.overwrite), null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
