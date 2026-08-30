import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import test, { after, before } from "node:test";

import { validateConfig } from "../../scripts/build-demo-video.mjs";
import {
  preflightCapture,
  validateCaptureManifest,
  validateRenderedClip,
} from "../../scripts/build-voiceover-screenshot-clip.mjs";

const config = validateConfig(JSON.parse(await readFile("docs/competition/demo-video-script.json", "utf8")));
const journeyIds = [
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
const unitDirectory = `output/voiceover-capture/unit-${process.pid}-${randomUUID()}`;

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function resolveForRepository(path) {
  return new URL(`../../${path}`, import.meta.url).pathname;
}

function manifestFixture() {
  return {
    schema: "trusted-govuk-discovery.voiceover-screenshot-sequence-capture.v1",
    capturedAt: "2026-08-30T10:10:00Z",
    page: {
      url: config.productUrl,
      release: config.release,
      productCommit: config.productCommit,
    },
    captureMethod: "manual-safari-voiceover-screenshot-sequence",
    manual: true,
    assistiveTechnologyActuallyUsed: true,
    withoutWebMCP: true,
    noWcagConformanceClaim: true,
    browser: { name: "Safari", version: "26.5.2 (21624.2.5.11.8)" },
    screenReader: { name: "VoiceOver", version: "10 (993)" },
    continuousRecording: false,
    frames: journeyIds.map((id, index) => ({
      id,
      path: `${unitDirectory}/frame-${String(index + 1).padStart(2, "0")}.png`,
      sha256: String(index + 1).repeat(64),
      capturedAt: `2026-08-30T10:0${index}:00Z`,
      holdSeconds: index < 3 ? 3 : 2,
      label: `Checkpoint ${index + 1}: ${id}`,
    })),
    limitations: [
      "This screenshot sequence is not a continuous recording.",
      "One manual journey in one environment is not a WCAG conformance assessment.",
    ],
  };
}

before(async () => {
  await mkdir(unitDirectory, { recursive: true });
  const result = spawnSync("ffmpeg", [
    "-nostdin", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=1:duration=9",
    "-frames:v", "9", `${unitDirectory}/frame-%02d.png`,
  ], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

after(async () => {
  await rm(unitDirectory, { recursive: true, force: true });
});

test("screenshot manifest is release-bound and covers the nine checkpoints in order", () => {
  const fixture = manifestFixture();
  assert.deepEqual(validateCaptureManifest(fixture, config), { frameCount: 9, totalDurationSeconds: 21 });

  const missing = manifestFixture();
  missing.frames.pop();
  assert.throws(() => validateCaptureManifest(missing, config), /exactly nine/u);

  const duplicate = manifestFixture();
  duplicate.frames[8].id = duplicate.frames[0].id;
  assert.throws(() => validateCaptureManifest(duplicate, config), /exact nine VoiceOver journey IDs in order/u);

  const unordered = manifestFixture();
  [unordered.frames[0], unordered.frames[1]] = [unordered.frames[1], unordered.frames[0]];
  assert.throws(() => validateCaptureManifest(unordered, config), /exact nine VoiceOver journey IDs in order/u);

  const duplicateBytes = manifestFixture();
  duplicateBytes.frames[1].sha256 = duplicateBytes.frames[0].sha256;
  assert.throws(() => validateCaptureManifest(duplicateBytes, config), /duplicates another frame's bytes/u);

  const unorderedTime = manifestFixture();
  unorderedTime.frames[1].capturedAt = unorderedTime.frames[0].capturedAt;
  assert.throws(() => validateCaptureManifest(unorderedTime, config), /timestamps must be strictly increasing/u);

  const looseTimestamp = manifestFixture();
  looseTimestamp.frames[0].capturedAt = "Aug 30 2026 10:00:00 GMT+00:00";
  assert.throws(() => validateCaptureManifest(looseTimestamp, config), /RFC 3339/u);

  const invalidCalendarDate = manifestFixture();
  invalidCalendarDate.frames[0].capturedAt = "2026-02-30T10:00:00Z";
  assert.throws(() => validateCaptureManifest(invalidCalendarDate, config), /invalid calendar date or time/u);

  const future = manifestFixture();
  future.capturedAt = "2999-08-30T10:10:00Z";
  assert.throws(() => validateCaptureManifest(future, config), /five minutes in the future/u);

  const excessiveSpan = manifestFixture();
  excessiveSpan.frames[8].capturedAt = "2026-08-30T10:31:00Z";
  excessiveSpan.capturedAt = "2026-08-30T10:32:00Z";
  assert.throws(() => validateCaptureManifest(excessiveSpan, config), /more than 30 minutes/u);
});

test("screenshot manifest rejects continuous-recording and unsafe path claims", () => {
  const wrongCommit = manifestFixture();
  wrongCommit.page.productCommit = "f".repeat(40);
  assert.throws(() => validateCaptureManifest(wrongCommit, config), /product commit does not match/u);

  const continuous = manifestFixture();
  continuous.continuousRecording = true;
  assert.throws(() => validateCaptureManifest(continuous, config), /must not claim to be a continuous recording/u);

  const outside = manifestFixture();
  outside.frames[0].path = "docs/competition/evidence/frame.png";
  assert.throws(() => validateCaptureManifest(outside, config), /must stay beneath output\/voiceover-capture/u);

  const preview = manifestFixture();
  preview.frames[0].path = "output/voiceover-capture/demo-preview/frame.png";
  assert.throws(() => validateCaptureManifest(preview, config), /must not use a preview path/u);
});

test("rendered screenshot sequence validator rejects weak output media", () => {
  const validProbe = {
    format: { duration: "21.000", size: "1000000", format_name: "mov,mp4,m4a,3gp,3g2,mj2" },
    streams: [{ codec_type: "video", codec_name: "h264", width: 1920, height: 1080, r_frame_rate: "30/1", pix_fmt: "yuv420p" }],
  };
  assert.equal(validateRenderedClip(validProbe, 21).codec, "h264");
  assert.throws(() => validateRenderedClip({ ...validProbe, format: { ...validProbe.format, size: "1000" } }, 21), /too small/u);
  assert.throws(() => validateRenderedClip({ ...validProbe, streams: [{ ...validProbe.streams[0], width: 1280 }] }, 21), /1920x1080/u);
});

test("capture preflight verifies bytes and rejects hash drift, symlinks and weak frames", async () => {
  const valid = manifestFixture();
  for (const frame of valid.frames) frame.sha256 = digest(await readFile(frame.path));
  const validPath = `${unitDirectory}/valid.json`;
  await writeFile(validPath, `${JSON.stringify(valid, null, 2)}\n`, "utf8");
  const result = await preflightCapture(resolveForRepository(validPath));
  assert.equal(result.summary.frameCount, 9);

  const drift = structuredClone(valid);
  drift.frames[0].sha256 = "f".repeat(64);
  const driftPath = `${unitDirectory}/drift.json`;
  await writeFile(driftPath, `${JSON.stringify(drift, null, 2)}\n`, "utf8");
  await assert.rejects(() => preflightCapture(resolveForRepository(driftPath)), /SHA-256 has drifted/u);

  const linked = structuredClone(valid);
  linked.frames[0].path = `${unitDirectory}/linked.png`;
  await symlink("frame-01.png", linked.frames[0].path);
  const linkedPath = `${unitDirectory}/linked.json`;
  await writeFile(linkedPath, `${JSON.stringify(linked, null, 2)}\n`, "utf8");
  await assert.rejects(() => preflightCapture(resolveForRepository(linkedPath)), /must not be a symbolic link/u);

  const directoryTarget = `${unitDirectory}/directory-target`;
  const directoryLink = `${unitDirectory}/directory-link`;
  await mkdir(directoryTarget);
  await copyFile(`${unitDirectory}/frame-01.png`, `${directoryTarget}/frame.png`);
  await symlink("directory-target", directoryLink);
  const linkedDirectory = structuredClone(valid);
  linkedDirectory.frames[0].path = `${directoryLink}/frame.png`;
  linkedDirectory.frames[0].sha256 = digest(await readFile(`${directoryTarget}/frame.png`));
  const linkedDirectoryPath = `${unitDirectory}/linked-directory.json`;
  await writeFile(linkedDirectoryPath, `${JSON.stringify(linkedDirectory, null, 2)}\n`, "utf8");
  await assert.rejects(() => preflightCapture(resolveForRepository(linkedDirectoryPath)), /must not be a symbolic link/u);

  const weak = structuredClone(valid);
  weak.frames[0].path = `${unitDirectory}/weak.png`;
  const weakResult = spawnSync("ffmpeg", [
    "-nostdin", "-v", "error", "-f", "lavfi", "-i", "color=size=1x1:duration=1", "-frames:v", "1", weak.frames[0].path,
  ], { encoding: "utf8" });
  assert.equal(weakResult.status, 0, weakResult.stderr || weakResult.error?.message);
  weak.frames[0].sha256 = digest(await readFile(weak.frames[0].path));
  const weakPath = `${unitDirectory}/weak.json`;
  await writeFile(weakPath, `${JSON.stringify(weak, null, 2)}\n`, "utf8");
  await assert.rejects(() => preflightCapture(resolveForRepository(weakPath)), /weak or excessive file size|too small/u);
});
