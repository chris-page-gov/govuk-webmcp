import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  requiredVoiceOverJourneyIds,
  validateConfig,
  validateInteractionCaptureEvidence,
  validateSupportedHostEvidence,
  validateVoiceOverEvidence,
  validateVoiceOverMediaBinding,
  wrapCaption,
} from "../../scripts/build-demo-video.mjs";

const config = validateConfig(JSON.parse(await readFile(
  "docs/competition/demo-video-script.json",
  "utf8",
)));

test("demo video manifest is release-bound and names guarded production media", () => {
  assert.equal(config.productUrl, "https://chris-page-gov.github.io/govuk-webmcp/");
  assert.equal(config.productCommit, "9235ee5db4df637bdb2a12e87449e871614afe68");
  assert.equal(config.release, "v0.2.0-rc.1");
  assert.equal(config.language, "en-GB");
  assert.equal(config.scenes.length, 7);
  assert.deepEqual(config.scenes.map(({ number }) => number), ["01", "02", "03", "04", "05", "06", "07"]);
  assert.ok(config.scenes.every(({ media }) => media.path.startsWith("output/demo-clips/")));
  assert.ok(config.scenes.every(({ media }) => !media.path.startsWith("output/demo-preview-clips/")));
  assert.ok(config.scenes.every(({ media }) => media.type === "video"));
  assert.equal(config.interactionCaptureReceipt, "docs/competition/evidence/demo-live-interaction-capture-2026-08-30.json");
  assert.deepEqual(
    config.scenes.filter(({ kind }) => kind === "interaction").map(({ id }) => id),
    ["overview", "trace", "facets", "comparison", "estate"],
  );
  assert.ok(config.scenes.filter(({ kind }) => kind === "interaction").every(({ requiredActions }) => requiredActions.length > 0));
  assert.equal(config.scenes.filter(({ kind }) => kind === "receipt-visualisation").length, 1);
  assert.equal(config.reviews.privacy, "pending-human-review");
  assert.equal(config.reviews.branding, "pending-human-review");
  assert.equal(config.narration.publicationBasis, "pending-owner-review");
  for (const scene of config.scenes) {
    for (const cue of scene.cues) {
      const lines = wrapCaption(cue).split("\n");
      assert.ok(lines.length <= 2);
      assert.ok(lines.every((line) => line.length <= 42));
    }
  }
});

test("video pipeline accepts the exact five-call supported-host receipt", async () => {
  const evidence = JSON.parse(await readFile(
    "docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json",
    "utf8",
  ));
  const summary = validateSupportedHostEvidence(evidence, config);
  assert.equal(
    summary.canonicalCallResultDigest,
    "3baa3281849855b86e929fd5fad8984580066ac4e275063341c1d9102dc903b1",
  );
});

function voiceOverFixture() {
  return {
    schema: "trusted-govuk-discovery.manual-voiceover-journey.v1",
    observedAt: "2026-08-30T10:00:00Z",
    page: {
      url: config.productUrl,
      release: config.release,
      productCommit: config.productCommit,
    },
    method: "manual-operator-driven",
    manual: true,
    assistiveTechnologyActuallyUsed: true,
    withoutWebMCP: true,
    noWcagConformanceClaim: true,
    screenReaderAudioCaptured: false,
    environment: {
      operatingSystem: "macOS",
      operatingSystemVersion: "26.5.2",
      operatingSystemBuild: "25F84",
      browser: "Safari",
      browserVersion: "26.5.2 (21624.2.5.11.8)",
      screenReader: "VoiceOver",
      screenReaderVersion: "10 (993)",
    },
    overallStatus: "completed",
    journey: requiredVoiceOverJourneyIds.map((id) => ({
      id,
      result: "pass",
      observation: `Manual observation recorded for ${id}.`,
    })),
    limitations: [
      "One manual journey in one environment is not a WCAG conformance assessment.",
    ],
    media: {
      path: "output/demo-clips/demo-scene-06-voiceover-2026-08-30.mov",
      sha256: "a".repeat(64),
      startSeconds: 0,
      endSeconds: 30,
      captureStartedAt: "2026-08-30T09:55:00Z",
      captureEndedAt: "2026-08-30T10:05:00Z",
    },
  };
}

test("VoiceOver gate requires genuine manual use and every named journey step", () => {
  const valid = voiceOverFixture();
  assert.deepEqual(validateVoiceOverEvidence(valid, config), {
    overallStatus: "completed",
    screenReaderAudioCaptured: false,
  });

  const automated = voiceOverFixture();
  automated.manual = false;
  assert.throws(
    () => validateVoiceOverEvidence(automated, config),
    /genuine manual assistive-technology use/u,
  );

  const incomplete = voiceOverFixture();
  incomplete.journey = incomplete.journey.slice(1);
  assert.throws(
    () => validateVoiceOverEvidence(incomplete, config),
    /exactly the required journey/u,
  );

  const allFailed = voiceOverFixture();
  allFailed.journey = allFailed.journey.map((item) => ({
    ...item,
    result: "issue-observed",
    limitation: "One manual journey in one environment is not a WCAG conformance assessment.",
  }));
  assert.throws(
    () => validateVoiceOverEvidence(allFailed, config),
    /Completed VoiceOver evidence cannot contain/u,
  );

  const acknowledged = voiceOverFixture();
  acknowledged.overallStatus = "completed-with-limitations";
  acknowledged.journey[0] = {
    ...acknowledged.journey[0],
    result: "limitation",
    limitation: acknowledged.limitations[0],
  };
  assert.equal(validateVoiceOverEvidence(acknowledged, config).overallStatus, "completed-with-limitations");
});

test("VoiceOver media evidence is path, hash and time bound to the configured scene", () => {
  const scene = config.scenes.find(({ id }) => id === "voiceover");
  const evidence = voiceOverFixture();
  const media = { sha256: "a".repeat(64), durationSeconds: 35 };
  validateVoiceOverMediaBinding(evidence, scene, media);

  const unrelated = voiceOverFixture();
  unrelated.media.sha256 = "b".repeat(64);
  assert.throws(
    () => validateVoiceOverMediaBinding(unrelated, scene, media),
    /SHA-256/u,
  );
});

function interactionCaptureFixture() {
  const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
  const mediaById = new Map(interactionScenes.map((scene, index) => [scene.id, {
    sha256: String(index + 1).repeat(64),
    durationSeconds: 35,
  }]));
  return {
    interactionScenes,
    mediaById,
    evidence: {
      schema: "trusted-govuk-discovery.demo-live-interaction-capture.v1",
      product: { url: config.productUrl, release: config.release, commit: config.productCommit },
      captureMethod: "playwright-public-site-interaction",
      browser: { name: "Chromium", version: "1" },
      capturedAt: "2026-08-30T10:00:00Z",
      reviews: { privacy: "agent-reviewed-pass", branding: "agent-reviewed-pass", humanPublicationReview: "pending" },
      noBrowserChrome: true,
      audioCaptured: false,
      clips: interactionScenes.map((scene, index) => ({
        sceneId: scene.id,
        path: scene.media.path,
        sha256: String(index + 1).repeat(64),
        durationSeconds: 35,
        capturedAt: "2026-08-30T10:00:00Z",
        actions: scene.requiredActions,
        sourceUrl: `${config.productUrl}#answer=answer%3Anew-child-starting-points`,
      })),
    },
  };
}

test("live interaction receipt requires exact reviewed media hashes and actions", () => {
  const fixture = interactionCaptureFixture();
  assert.deepEqual(
    validateInteractionCaptureEvidence(fixture.evidence, config, fixture.interactionScenes, fixture.mediaById),
    { clipCount: 5, captureMethod: "playwright-public-site-interaction" },
  );

  const digestMismatch = interactionCaptureFixture();
  digestMismatch.evidence.clips[0].sha256 = "f".repeat(64);
  assert.throws(
    () => validateInteractionCaptureEvidence(digestMismatch.evidence, config, digestMismatch.interactionScenes, digestMismatch.mediaById),
    /does not match its configured media/u,
  );

  const unrelated = interactionCaptureFixture();
  unrelated.evidence.clips[0].path = "output/demo-preview-clips/demo-scene-01-overview-2026-08-30.mov";
  assert.throws(
    () => validateInteractionCaptureEvidence(unrelated.evidence, config, unrelated.interactionScenes, unrelated.mediaById),
    /does not match its configured media/u,
  );
});
