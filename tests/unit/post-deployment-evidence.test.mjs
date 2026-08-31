import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PRODUCT_COMMIT = "edd4ce6b60c38c3c9fbac86408d6b58d1495671f";
const PAGES_RUN_ID = 33323152751;
const PAGES_ARTIFACT_ID = 9735478602;
const ARTIFACT_API_DIGEST = "sha256:98b0641c6cdbfa444d7aee455976823a53b9d7ece97321ea0c01fa7ab4f942d0";
const DEPLOYMENT_SHA256 = "4a4778dea35bb9e0ad0884291d6f1246fe0b26d0a94cdf472c3fff449469546e";
const ARTIFACT_TAR_SHA256 = "bc7f2b34b376d425aaace8949eb5de4d8233fec232a02f8de1dd987813f6482f";
const PUBLIC_RAW_SHA256 = "5c6ae3d0f806e4d697e74cbeb69c27c697d47453a2f296284f675c4816b73704";
const SITE_URL = "https://chris-page-gov.github.io/govuk-webmcp/";

const EVIDENCE_DIRECTORY = "docs/competition/evidence";
const LIVE_PATH = `${EVIDENCE_DIRECTORY}/live-artifact-verification-2026-08-30-edd4ce6.json`;
const DEPLOYMENT_PATH = `${EVIDENCE_DIRECTORY}/live-deployment-metadata-2026-08-30-edd4ce6.json`;
const SITE_MANIFEST_PATH = `${EVIDENCE_DIRECTORY}/site-SHA256SUMS-2026-08-30-edd4ce6`;
const CHROME_PATH = `${EVIDENCE_DIRECTORY}/chrome-devtools-mcp-2026-08-30-edd4ce6.json`;
const CURRENT_CHROME_PATH = `${EVIDENCE_DIRECTORY}/chrome-devtools-mcp-v0.3.0-rc.1.json`;
const NATIVE_PATH = `${EVIDENCE_DIRECTORY}/native-devtools-webmcp-2026-08-30-edd4ce6.json`;
const CHALLENGE_PATH = `${EVIDENCE_DIRECTORY}/challenge-provenance.json`;
const DEVPOST_PATH = `${EVIDENCE_DIRECTORY}/devpost-read-only-status-2026-08-30-edd4ce6.json`;
const CURRENT_DEVPOST_PATH = `${EVIDENCE_DIRECTORY}/devpost-read-only-status-v0.3.0-rc.1.json`;
const VIDEO_REVIEW_PATH = `${EVIDENCE_DIRECTORY}/demo-video-technical-review-2026-08-30.json`;
const CURRENT_MANUAL_VOICEOVER_PATH = `${EVIDENCE_DIRECTORY}/manual-voiceover-journey-v0.3.0-rc.1.json`;
const CURRENT_VIDEO_BUILD_PATH = `${EVIDENCE_DIRECTORY}/demo-video-build-v0.3.0-rc.1.json`;
const CURRENT_VIDEO_REVIEW_PATH = `${EVIDENCE_DIRECTORY}/demo-video-technical-review-v0.3.0-rc.1.json`;
const CURRENT_FINAL_COMPLIANCE_PATH = "docs/competition/final-devpost-compliance-review-2026-08-31.md";
const CURRENT_FINAL_COMPLIANCE_SHA256 = "aa30c6437467747cc4de7868c7c16808174066c5d1cb3e9cbf39e57eb9c41d1c";
const REPORT_PATH = `${EVIDENCE_DIRECTORY}/public-deployment-verification-2026-08-30-edd4ce6.md`;

const CURRENT_PRODUCT_COMMIT = "b0bd634579a3abf82bdd1fc83ff688535e0db0bf";
const CURRENT_PAGES_RUN_ID = "33356452048";
const CURRENT_CHROME_SHA256 = "4d87c3d55379266f68f633896e016f9294b991aa88458ea3f4b91b883c430396";
const CURRENT_VIDEO_SHA256 = "e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4";
const CURRENT_VIDEO_INPUTS = [
  {
    path: "docs/competition/demo-video-script.json",
    sizeBytes: 7401,
    sha256: "ae23117cf75ca25bfdd7a8181d90c2795fe80348ac4f09fbf2c40ba5c5bf5096",
  },
  {
    path: "docs/competition/evidence/demo-live-interaction-capture-v0.3.0-rc.1.json",
    sizeBytes: 7497,
    sha256: "8fba32b9d28d1d82d5fbbbb1276bf8e8ea84860c2f5f2b5536736b6d6bcdbd9b",
  },
  {
    path: CURRENT_MANUAL_VOICEOVER_PATH,
    sizeBytes: 5451,
    sha256: "ca749f8db049ea2411ca52f44c9335f34fa0362177e714bc31ba513180b66e87",
  },
  {
    path: "docs/competition/evidence/supported-host-webmcp-capture-v0.3.0-rc.1.json",
    sizeBytes: 124751,
    sha256: "5ca7e19372dc00f9704474ff5bf513a236b48e8843a37871d6b6f0831722e5ea",
  },
  {
    path: "docs/competition/evidence/supported-host-webmcp-clip-v0.3.0-rc.1.json",
    sizeBytes: 1195,
    sha256: "ee0b8932854a44e44a03571537fcd0dcfba8e37f841f251e481d928bb677f0f8",
  },
  {
    path: "docs/competition/evidence/supported-host-webmcp-raw-receipt-v0.3.0-rc.1.json",
    sizeBytes: 123373,
    sha256: "91e25ca1d560c9cdb42f64a5c6289f6b9ff5bff17071452e2dd9afe8a87e80f8",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/01-overview.mov",
    sizeBytes: 4801413,
    sha256: "c6a93eece50493ecc54ae9f3913d3c60b677ab4d227624430cf9e4dc266ef228",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/02-federated-search.mov",
    sizeBytes: 6333300,
    sha256: "0719f5899b0d940795e9c732473d2e64dbf336a8af7cad7906e40850632b4080",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/03-federated-record.mov",
    sizeBytes: 4511418,
    sha256: "c9b0d5cd90619692a4fa918c46daec38a8f4b9ad864d0ade79a9da83e9ad29ba",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/04-supported-host-webmcp.mov",
    sizeBytes: 2777999,
    sha256: "512c9cb9a0c703b8ef0047418969220e79d49b8500c467b7b15b47c2db132878",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/05-reviewed-foundations.mov",
    sizeBytes: 2770903,
    sha256: "a9108e4ddaa9503b03770bc8f76a1b0f7764250908cb7c651c1ceabc359bb7e5",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/06-voiceover.mov",
    sizeBytes: 1011644,
    sha256: "e77d8f277d19db7af372090b78ae83b76b50a1221cef69fccb5f047e9e4a62d0",
  },
  {
    path: "output/demo-clips/v0.3.0-rc.1/07-boundary.mov",
    sizeBytes: 6653154,
    sha256: "5bb9c2f6b3f396585b274c8886c51e8f6a61cbebe6527c4781611b0f0d43d7f2",
  },
  {
    path: "output/voiceover-capture/v0.3.0-rc.1-capture-manifest.json",
    sizeBytes: 4248,
    sha256: "3ff39de4fb1355728504a5e29eaf1bf93b7e71b34ad7ac1c7493e21aeb1d2629",
  },
];

const CURRENT_VOICEOVER_JOURNEY = [
  ["page-title-and-headings", "limitation"],
  ["skip-link-and-main-focus", "pass"],
  ["analytical-index-controls", "pass"],
  ["selected-foundation", "pass"],
  ["comparison-table", "pass"],
  ["live-status", "limitation"],
  ["search-and-record", "pass"],
  ["source-link-role-and-destination", "pass"],
  ["focus-restoration", "pass"],
];

const TOOL_NAMES = [
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
];

const RESULT_SCHEMAS = [
  "trusted-govuk-discovery.search-result.v1",
  "trusted-govuk-discovery.resource-record-result.v1",
  "trusted-govuk-discovery.provenance-result.v1",
  "trusted-govuk-discovery.evidence-exploration-result.v1",
  "trusted-govuk-discovery.evidence-comparison-result.v1",
];

const CURRENT_RESULT_SCHEMAS = [
  "trusted-govuk-discovery.search-result.v2",
  "trusted-govuk-discovery.resource-record-result.v1",
  "trusted-govuk-discovery.provenance-result.v1",
  "trusted-govuk-discovery.evidence-exploration-result.v1",
  "trusted-govuk-discovery.evidence-comparison-result.v1",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function jsonSha256(value) {
  return sha256(jsonBytes(value));
}

function coDigestCurrentEvidenceChain(chain) {
  const manualInput = chain.videoBuild.inputs.find(({ path }) => path === CURRENT_MANUAL_VOICEOVER_PATH);
  if (manualInput) {
    const bytes = jsonBytes(chain.manualVoiceOver);
    manualInput.sizeBytes = bytes.length;
    manualInput.sha256 = sha256(bytes);
  }
  chain.videoReview.artefact.buildReceipt.sha256 = jsonSha256(chain.videoBuild);
  chain.challenge.currentReleaseEvidence.manualVoiceOver.evidenceSha256 = jsonSha256(chain.manualVoiceOver);
  chain.challenge.currentReleaseEvidence.demoVideoBuild.evidenceSha256 = jsonSha256(chain.videoBuild);
  chain.challenge.currentReleaseEvidence.demoVideoTechnicalReview.evidenceSha256 = jsonSha256(chain.videoReview);
  return chain;
}

function validateCurrentEvidenceChain({ challenge, manualVoiceOver, videoBuild, videoReview }) {
  assert.deepEqual(
    manualVoiceOver.journey.map(({ id, result }) => [id, result]),
    CURRENT_VOICEOVER_JOURNEY,
    "VoiceOver journey checkpoint semantics drifted",
  );
  assert.deepEqual(
    manualVoiceOver.journey.find(({ id }) => id === "source-link-role-and-destination")?.details,
    {
      linkRole: "producer-declared-source",
      destinationHostname: "www.gov.uk",
      sourceAuthority: "Not independently established",
    },
    "VoiceOver source-link evidence drifted",
  );
  assert.deepEqual(manualVoiceOver.limitations, [
    "The page title and level-one heading were visible while VoiceOver was active, but a heading-rotor selection was not retained in the nine-frame sequence.",
    "The Caption Panel showed ‘Filter results, collapsed, summary’ rather than the visible ‘797 matching records; 8 shown.’ status, so the automatic spoken live-status wording was not proved.",
    "VoiceOver speech audio was not captured; the retained sequence uses the Caption Panel and manual Safari observations.",
    "This screenshot sequence is not a continuous recording.",
    "This observation covers one manual environment and does not establish WCAG conformance.",
  ], "VoiceOver limitations drifted");

  const inputPaths = videoBuild.inputs.map(({ path }) => path);
  assert.equal(
    new Set(inputPaths).size,
    inputPaths.length,
    "current video input paths must be unique",
  );
  assert.deepEqual(
    inputPaths,
    [...inputPaths].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right))),
    "current video inputs must remain bytewise ordered",
  );
  assert.deepEqual(
    videoBuild.inputs,
    CURRENT_VIDEO_INPUTS,
    "current video input chain must retain all 14 exact bindings",
  );

  assert.deepEqual(videoBuild.product, {
    url: SITE_URL,
    release: "v0.3.0-rc.1",
    commit: CURRENT_PRODUCT_COMMIT,
    pagesRunId: CURRENT_PAGES_RUN_ID,
  });
  assert.deepEqual(videoBuild.video, {
    fileName: "govuk-webmcp-demo-v0.3.0-rc.1.mp4",
    sha256: CURRENT_VIDEO_SHA256,
    durationSeconds: 156.023,
    streams: [
      {
        index: 0,
        codec_name: "h264",
        codec_type: "video",
        width: 1920,
        height: 1080,
        pix_fmt: "yuv420p",
        r_frame_rate: "30/1",
        tags: { language: "und" },
      },
      {
        index: 1,
        codec_name: "aac",
        codec_type: "audio",
        sample_rate: "48000",
        channels: 1,
        r_frame_rate: "0/0",
        tags: { language: "und" },
      },
      {
        index: 2,
        codec_name: "mov_text",
        codec_type: "subtitle",
        r_frame_rate: "0/0",
        tags: { language: "eng" },
      },
    ],
    publicUrl: null,
    signedOutPlaybackVerified: false,
  }, "current video contract drifted");
  assert.deepEqual(videoBuild.captions, {
    path: "docs/competition/demo-captions.en-GB.vtt",
    sha256: "513158c2ef2231486f28d7fbb48b48b0f37816315854f64a3549c64628c3b2b9",
    language: "en-GB",
    embeddedTrack: true,
    publicPlayerTrackVerified: false,
  });
  assert.deepEqual(videoBuild.transcript, {
    path: "docs/competition/demo-transcript.md",
    sha256: "8f896858d3f8c69078c7f3e490206e5d10d50b1e558a0cb004ca3b900910d62f",
  });
  assert.deepEqual(videoBuild.script, {
    path: "docs/competition/demo-video-script.json",
    sha256: "ae23117cf75ca25bfdd7a8181d90c2795fe80348ac4f09fbf2c40ba5c5bf5096",
  });
  assert.deepEqual(videoBuild.reviews, {
    privacy: "pending-human-review",
    branding: "pending-human-review",
    rights: "pending-human-review",
    voicePublicationBasis: "pending-owner-review",
    finalHumanPlayback: "pending",
    finalHumanReviewRequiredBeforePublication: true,
  });

  assert.deepEqual(videoReview.productBoundary, {
    url: SITE_URL,
    release: "v0.3.0-rc.1",
    commit: CURRENT_PRODUCT_COMMIT,
    shortCommit: "b0bd634",
    pagesRunId: CURRENT_PAGES_RUN_ID,
  });
  assert.equal(videoReview.artefact.path, "output/govuk-webmcp-demo-v0.3.0-rc.1.mp4");
  assert.equal(videoReview.artefact.sha256, CURRENT_VIDEO_SHA256);
  assert.equal(videoReview.artefact.sizeBytes, 27193896);
  assert.equal(videoReview.artefact.buildReceipt.path, CURRENT_VIDEO_BUILD_PATH);
  assert.equal(
    videoReview.artefact.buildReceipt.sha256,
    jsonSha256(videoBuild),
    "technical review must bind the exact video-build receipt bytes",
  );
  assert.deepEqual(videoReview.artefact.buildReceipt, {
    path: CURRENT_VIDEO_BUILD_PATH,
    sha256: jsonSha256(videoBuild),
    videoDigestMatched: true,
    productBoundaryMatched: true,
    durationMatched: true,
    streamContractMatched: true,
  });
  assert.equal(videoReview.probe.format.durationSeconds, videoBuild.video.durationSeconds);
  assert.equal(videoReview.probe.format.sizeBytes, videoReview.artefact.sizeBytes);
  assert.deepEqual(
    videoReview.probe.streams.map(({ index, type, codec }) => ({ index, type, codec })),
    [
      { index: 0, type: "video", codec: "h264" },
      { index: 1, type: "audio", codec: "aac" },
      { index: 2, type: "subtitle", codec: "mov_text" },
    ],
  );
  assert.equal(videoReview.decode.videoAndAudioCompleteDecode, true);
  assert.equal(videoReview.decode.exitStatus, 0);
  assert.deepEqual(videoReview.decode.reportedDecodeErrors, []);
  assert.equal(videoReview.decode.decodedVideoFrames, 4678);
  assert.deepEqual(videoReview.captionsAndNarration.trackedCaptions, {
    path: videoBuild.captions.path,
    sha256: videoBuild.captions.sha256,
    cueCount: 40,
  });
  assert.deepEqual(videoReview.captionsAndNarration.script, {
    path: videoBuild.script.path,
    sha256: videoBuild.script.sha256,
    cueCount: 40,
    normalisedNarrationMatched: true,
  });
  assert.deepEqual(videoReview.captionsAndNarration.transcript, {
    path: videoBuild.transcript.path,
    sha256: videoBuild.transcript.sha256,
    sectionCount: 7,
    normalisedNarrationMatched: true,
  });
  assert.equal(videoReview.captionsAndNarration.audioSignal.audiblePlaybackPerformed, false);
  assert.equal(videoReview.review.readyForHumanReview, true);
  assert.equal(videoReview.review.publicationApproved, false);
  assert.deepEqual(videoReview.approvalBoundary, {
    technicalAgentReviewOnly: true,
    humanContinuousPlaybackApproval: false,
    brandingApproval: false,
    privacyApproval: false,
    rightsApproval: false,
    syntheticVoicePublicationApproval: false,
    signedOutPublishedPlaybackVerified: false,
    ownerPublicationApproval: false,
  });

  const currentEvidence = challenge.currentReleaseEvidence;
  assert.equal(currentEvidence.manualVoiceOver.evidenceSha256, jsonSha256(manualVoiceOver));
  assert.equal(currentEvidence.demoVideoBuild.evidenceSha256, jsonSha256(videoBuild));
  assert.equal(currentEvidence.demoVideoTechnicalReview.evidenceSha256, jsonSha256(videoReview));
  assert.equal(currentEvidence.manualVoiceOver.journeyCheckpointCount, CURRENT_VOICEOVER_JOURNEY.length);
  assert.equal(currentEvidence.manualVoiceOver.passedCheckpointCount, 7);
  assert.equal(currentEvidence.manualVoiceOver.limitedCheckpointCount, 2);
  assert.equal(currentEvidence.manualVoiceOver.media.continuousRecording, false);
  assert.equal(currentEvidence.demoVideoBuild.videoSha256, CURRENT_VIDEO_SHA256);
  assert.equal(currentEvidence.demoVideoBuild.publicUrl, null);
  assert.equal(currentEvidence.demoVideoBuild.signedOutPlaybackVerified, false);
  assert.equal(currentEvidence.demoVideoTechnicalReview.videoSha256, CURRENT_VIDEO_SHA256);
  assert.equal(currentEvidence.demoVideoTechnicalReview.readyForHumanReview, true);
  assert.equal(currentEvidence.demoVideoTechnicalReview.humanPublicationReview, "pending");
  assert.equal(
    currentEvidence.localTechnicalComplianceReview.evidenceSha256,
    CURRENT_FINAL_COMPLIANCE_SHA256,
    "current local technical compliance review digest drifted",
  );

  const currentGates = currentEvidence.accessibilityVideoAndSubmissionGates;
  assert.equal(currentGates.priorInvalidCaptureAttempt.admitted, false);
  assert.equal(currentGates.priorInvalidCaptureAttempt.supersededByCleanRecapture, true);
  assert.equal(currentGates.currentReleaseVoiceOverCaptureAttemptValid, true);
  assert.equal(currentGates.currentReleaseVoiceOverCaptureAdmitted, true);
  assert.equal(currentGates.currentReleaseManualVoiceOverEvidenceCompleted, true);
  assert.equal(currentGates.currentReleaseVoiceOverClipBuilt, true);
  assert.equal(currentGates.currentReleaseFinalVideoBuilt, true);
  assert.equal(currentGates.currentReleaseVideoTechnicalReviewCompleted, true);
  for (const gate of [
    "ownerPrivacyReviewCompleted",
    "ownerBrandingReviewCompleted",
    "ownerSyntheticVoicePublicationApproval",
    "ownerContinuousAudiblePlaybackCompleted",
    "publicYouTubeVideoPublished",
    "signedOutPublicPlayerAudioVerified",
    "signedOutPublicPlayerCaptionsVerified",
    "finalDevpostAttestationsCompleted",
    "devpostSubmissionAuthorised",
    "devpostSubmissionPerformed",
  ]) {
    assert.equal(currentGates[gate], false, `${gate} must remain open`);
  }

  assert.equal(challenge.gates.currentReleaseSupportedHostToolDiscoveryObserved, true);
  assert.equal(challenge.gates.currentReleaseSupportedHostToolCallObserved, true);
  assert.equal(challenge.gates.currentReleaseRulesNamedChromeToolDiscoveryObserved, true);
  assert.equal(challenge.gates.currentReleaseRulesNamedChromeToolCallObserved, true);
  assert.equal(challenge.gates.currentReleaseUniversalBrowserSupportEstablished, false);
  assert.equal(challenge.gates.currentReleaseLocalTechnicalComplianceReviewCompleted, true);
  assert.equal(challenge.gates.currentReleaseFinalPreSubmissionRefreshCompleted, false);
  assert.equal("currentReleaseFinalDevpostComplianceReviewCompleted" in challenge.gates, false);
  assert.equal(challenge.gates.currentReleaseDemoVideoHumanReviewComplete, false);
  assert.equal(challenge.gates.currentReleaseVideoPublished, false);
  assert.equal(challenge.gates.currentReleaseSignedOutPublicPlayerVerified, false);
  assert.equal(challenge.gates.currentReleaseDevpostSubmissionPerformed, false);
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function validateCurrentChromeEvidence(evidence) {
  assert.deepEqual(Object.keys(evidence).sort(), [
    "boundaries",
    "calls",
    "capture",
    "console",
    "discovery",
    "environment",
    "limitations",
    "observedAt",
    "rejectedCall",
    "releaseEvidence",
    "schema",
    "sourceReceipt",
    "target",
  ]);
  assert.equal(evidence.schema, "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v2");
  assert.equal(evidence.observedAt, "2026-08-31T18:49:38.356Z");
  assert.deepEqual(evidence.target, {
    url: SITE_URL,
    mode: "public",
    localBuild: false,
    personalDataUsed: false,
    deployment: {
      metadataUrl: `${SITE_URL}deployment.json`,
      metadataSha256: "a7b1f8e2f2c99da7051a091bb72a7948379af53c826a9c66d3bc98f89c67f728",
      schema: "trusted-govuk-discovery.deployment.v1",
      repository: "chris-page-gov/govuk-webmcp",
      commit: CURRENT_PRODUCT_COMMIT,
      runId: CURRENT_PAGES_RUN_ID,
      expectedCommit: CURRENT_PRODUCT_COMMIT,
    },
  });
  assert.deepEqual(evidence.releaseEvidence, {
    productCommit: CURRENT_PRODUCT_COMMIT,
    pagesRunId: CURRENT_PAGES_RUN_ID,
    pagesArtifactId: 9745316971,
    artifactApiDigest: "sha256:3d7a7eb777d3b99504c9fb0533b89cb37ffc2d66dcad7a000e86ca6674e5727d",
    artifactTarSha256: "872384696f587572d794de3a4e07485aee7d2816598c86546ed178cd5aa03bf2",
    liveArtifactVerification: "docs/competition/evidence/live-artifact-verification-v0.3.0-rc.1.json",
    liveArtifactVerificationSha256: "5a869aa5c462fb6b63a300388199930cee7a71f11ccccacb1410d45c6653f79f",
    comparedFileCount: 1879,
    comparedByteCount: 128548215,
    liveManifestSha256: "4b2336a8927d34951c94008703dec27ed79f1ad87a318526c6807eeaa4bc0183",
  });
  assert.deepEqual(evidence.sourceReceipt, {
    path: ".evals/chrome-devtools-mcp-public.json",
    sha256: "3f1424bebabb5ba954a0e5eb5b278fc8b7324761cad17f1c703eb307e2bccad6",
    sizeBytes: 113898,
    tracking: "ignored local source",
    review: "The exact tool definitions, inputs, outputs, statuses and canonical output digests below were copied from the reviewed source receipt; local page identifiers were omitted.",
  });
  assert.deepEqual(evidence.environment, {
    chrome: "Google Chrome 152.0.7977.64",
    chromeChannel: "stable",
    chromeDevtoolsMcp: "1.8.0",
    node: "v26.7.0",
    isolatedProfile: true,
    allowedUrlPattern: "https://chris-page-gov.github.io/govuk-webmcp/*",
    usageStatistics: false,
    updateChecks: false,
    performanceCrux: false,
    networkHeadersRedacted: true,
  });
  assert.deepEqual(evidence.capture, {
    mechanism: "Chrome DevTools MCP CLI over its local MCP daemon",
    modelSelected: false,
    modelProviderCalled: false,
    exactToolOutputsRetained: true,
    redactions: {
      localProfilePath: "not retained",
      hostPageIdentifiers: "not retained",
      networkHeaders: "not retained",
      cookies: "not inspected or retained",
    },
  });

  assert.equal(evidence.discovery.toolCount, 5);
  assert.deepEqual(evidence.discovery.tools.map(({ name }) => name), TOOL_NAMES);
  assert.ok(evidence.discovery.tools.every(({ inputSchema }) =>
    inputSchema.type === "object" && inputSchema.additionalProperties === false));
  assert.deepEqual(
    evidence.discovery.tools.map(({ annotations }) => annotations.readOnly),
    [true, true, true, false, false],
  );
  assert.ok(evidence.discovery.tools.every(({ annotations }) => annotations.untrustedContent === true));
  assert.deepEqual(
    evidence.discovery.tools[0].inputSchema.$defs.knowledgeCollection.enum,
    ["deep-evidence", "uk-living", "ons", "government-apis", "land-registry"],
  );

  const expectedInputs = [
    { query: "register a birth", collections: ["deep-evidence"], limit: 3 },
    { recordId: "govuk-discovery:govuk-content:28389deb-8fd3-44dc-95a9-e7d1935ac363" },
    { recordId: "govuk-discovery:govuk-content:28389deb-8fd3-44dc-95a9-e7d1935ac363" },
    { answerId: "answer:new-child-starting-points", claimId: "claim:register-a-birth" },
    {
      answerId: "answer:new-child-starting-points",
      claimIds: ["claim:register-a-birth", "claim:check-child-benefit"],
    },
  ];
  const expectedDigests = [
    "a2eba8d7056ecd0a38bec5e49687cf9d27b05499f53c8b5c66b89c88194c34d4",
    "7a6b9a14afa8a21eadb082f8ad62b71ab1cf69c5ce1a6048665068ff12ebb869",
    "db5d93d8eb48ac7f18effdbb967a836a87cf40cb0d515957b5b0cc78f3f59838",
    "598e35479aa1336855e306483e249bb05696194f6d39eb0b26d7f369f143b717",
    "3baa3281849855b86e929fd5fad8984580066ac4e275063341c1d9102dc903b1",
  ];
  assert.deepEqual(evidence.calls.map(({ toolName }) => toolName), TOOL_NAMES);
  assert.deepEqual(evidence.calls.map(({ input }) => input), expectedInputs);
  assert.deepEqual(evidence.calls.map(({ status }) => status), Array(5).fill("Completed"));
  assert.deepEqual(evidence.calls.map(({ output }) => output.schema), CURRENT_RESULT_SCHEMAS);
  assert.ok(evidence.calls.every(({ output }) => output.ok === true));
  for (const [index, call] of evidence.calls.entries()) {
    assert.equal(
      sha256(canonicalJson(call.output)),
      call.canonicalOutputSha256,
      `${call.toolName} canonical output digest drifted`,
    );
    assert.equal(
      call.canonicalOutputSha256,
      expectedDigests[index],
      `${call.toolName} exact current-release output changed`,
    );
  }

  const [search, record, provenance, explore, compare] = evidence.calls;
  assert.deepEqual(search.output.selectedCollections, ["deep-evidence"]);
  assert.equal(search.output.totalMatches, 36);
  assert.equal(search.output.returned, 3);
  assert.equal(search.output.evidenceEstate.reviewedRecordCount, 80);
  assert.equal(search.output.evidenceEstate.federatedSourceRecordCount, 58655);
  assert.equal(search.output.evidenceEstate.federatedQuarantinedRecordCount, 3);
  assert.equal(search.output.evidenceEstate.federatedRecordCount, 58652);
  assert.equal(search.output.boundaries.providerCall, false);
  assert.equal(search.output.boundaries.officialApiCall, false);
  assert.equal(search.output.boundaries.personalContextAccepted, false);
  assert.ok(search.output.results.every(({ canonicalHumanUrl }) =>
    canonicalHumanUrl.startsWith("https://www.gov.uk/")));
  assert.equal(record.output.record.id, expectedInputs[1].recordId);
  assert.equal(record.output.record.canonicalHumanUrl, "https://www.gov.uk/register-birth");
  assert.equal(record.output.boundaries.providerCall, false);
  assert.equal(record.output.boundaries.accessAuthorityGranted, false);
  assert.equal(provenance.output.recordId, expectedInputs[2].recordId);
  assert.ok(provenance.output.sources.some(({ url }) => url === "https://www.gov.uk/register-birth"));
  assert.equal(provenance.output.boundaries.sourceWasNotRefetched, true);
  assert.deepEqual(explore.output.selection, {
    mode: "claim",
    answerId: expectedInputs[3].answerId,
    claimIds: [expectedInputs[3].claimId],
  });
  assert.equal(explore.output.boundaries.presentationEffect, "transient-local-selection");
  assert.equal(compare.output.answerId, expectedInputs[4].answerId);
  assert.deepEqual(compare.output.claimIds, expectedInputs[4].claimIds);
  assert.equal(compare.output.rows.length, 2);
  assert.deepEqual(compare.output.comparedFacets, [
    "authority",
    "assertionStatus",
    "verification",
    "freshness",
    "integrity",
    "access",
    "rights",
    "coverage",
  ]);
  for (const call of [explore, compare]) {
    assert.equal(call.output.boundaries.catalogueMutation, false);
    assert.equal(call.output.boundaries.storageWrite, false);
    assert.equal(call.output.boundaries.providerCall, false);
    assert.equal(call.output.boundaries.externalStateChange, false);
    assert.equal(call.output.boundaries.singleTrustScore, false);
  }

  assert.deepEqual(Object.keys(evidence.rejectedCall.input).sort(), ["personalContext", "query"]);
  assert.equal(evidence.rejectedCall.toolName, "search_government_knowledge");
  assert.equal(evidence.rejectedCall.status, "Completed");
  assert.equal(evidence.rejectedCall.output.schema, "trusted-govuk-discovery.error.v1");
  assert.equal(evidence.rejectedCall.output.ok, false);
  assert.equal(evidence.rejectedCall.output.error.code, "invalid_search_request");
  assert.equal(
    sha256(canonicalJson(evidence.rejectedCall.output)),
    evidence.rejectedCall.canonicalOutputSha256,
  );
  assert.equal(
    evidence.rejectedCall.canonicalOutputSha256,
    "b784977475cf73d2ac5e587fed165549cbe53cc9cb969c567f2388900f67eddd",
  );
  assert.deepEqual(evidence.console, { messageCount: 0, errorCount: 0, types: [] });
  assert.deepEqual(evidence.boundaries, {
    browserNativeWebMcp: true,
    bridge: "Chrome DevTools MCP CLI over its local MCP daemon",
    deploymentMetadataValidated: true,
    modelSelectionEvaluated: false,
    durableGovernmentService: false,
    remoteProviderCalled: false,
    reportContainsToolOutputs: true,
  });
  assert.ok(evidence.limitations.some((limitation) => /not a general compatibility claim/u.test(limitation)));
  assert.ok(evidence.limitations.some((limitation) => /no model provider was contacted/u.test(limitation)));
}

function parseSha256Manifest(text) {
  assert.equal(text.includes("\r"), false, "site manifest must use LF line endings");
  return text.trimEnd().split("\n").map((line) => {
    const match = line.match(/^([a-f0-9]{64})  ([A-Za-z0-9][A-Za-z0-9._/-]*)$/u);
    assert.ok(match, `Malformed site-manifest entry: ${line}`);
    return { sha256: match[1], path: match[2] };
  });
}

function assertReleaseBinding(binding) {
  assert.equal(binding.productCommit, PRODUCT_COMMIT);
  assert.equal(binding.pagesRunId, PAGES_RUN_ID);
  assert.equal(binding.pagesArtifactId, PAGES_ARTIFACT_ID);
  assert.equal(binding.artifactApiDigest, ARTIFACT_API_DIGEST);
  assert.equal(binding.deploymentMetadataSha256, DEPLOYMENT_SHA256);
  assert.equal(binding.artifactTarSha256, ARTIFACT_TAR_SHA256);
}

test("corrected Pages metadata and all 20 live files are bound to the artefact", async () => {
  const deploymentBytes = await readFile(DEPLOYMENT_PATH);
  const deployment = JSON.parse(deploymentBytes.toString("utf8"));
  assert.equal(sha256(deploymentBytes), DEPLOYMENT_SHA256);
  assert.deepEqual(deployment, {
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit: PRODUCT_COMMIT,
    runId: String(PAGES_RUN_ID),
  });

  const live = JSON.parse(await readFile(LIVE_PATH, "utf8"));
  assert.equal(live.schema, "trusted-govuk-discovery.live-artifact-verification.v1");
  assert.equal(live.site, SITE_URL);
  assert.equal(live.productCommit, PRODUCT_COMMIT);
  assert.equal(live.pagesRunId, PAGES_RUN_ID);
  assert.equal(live.artifactId, PAGES_ARTIFACT_ID);
  assert.equal(live.artifactApiDigest, ARTIFACT_API_DIGEST);
  assert.equal(live.artifactTarSha256, ARTIFACT_TAR_SHA256);
  assert.equal(
    live.sourceObservationSha256,
    "a1163a51e71a7d8e58e783b248084ab7b0bd8e333a1293a848eac0609cb2c028",
  );
  assert.equal(live.results.length, 20);
  assert.ok(live.results.every((result) => result.status === 200));
  assert.ok(live.results.every((result) => result.equalsPagesArtifact === true));
  assert.ok(live.results.every((result) => Number.isInteger(result.byteCount) && result.byteCount > 0));
  assert.ok(live.results.every((result) => /^[a-f0-9]{64}$/u.test(result.sha256)));

  const manifest = parseSha256Manifest(await readFile(SITE_MANIFEST_PATH, "utf8"));
  assert.equal(manifest.length, 20);
  assert.deepEqual(manifest.map(({ path }) => path), [...manifest.map(({ path }) => path)].sort());
  assert.equal(new Set(manifest.map(({ path }) => path)).size, manifest.length);
  assert.deepEqual(
    manifest,
    live.results.map(({ path, sha256: digest }) => ({ path, sha256: digest })),
  );
  assert.equal(
    manifest.find(({ path }) => path === "deployment.json")?.sha256,
    DEPLOYMENT_SHA256,
  );
});

test("reviewed Chrome DevTools MCP evidence retains exact five-tool outputs", async () => {
  const text = await readFile(CHROME_PATH, "utf8");
  assert.doesNotMatch(text, /\/Users\/|\/private\/tmp\/|--user-data-dir|authorization\s*[:=]|cookie\s*:/iu);
  const evidence = JSON.parse(text);

  assert.equal(evidence.schema, "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v1");
  assert.equal(evidence.sourceReceipt.path, ".evals/chrome-devtools-mcp-public.json");
  assert.equal(evidence.sourceReceipt.sha256, PUBLIC_RAW_SHA256);
  assert.equal(evidence.target.url, SITE_URL);
  assert.equal(evidence.target.mode, "public");
  assert.equal(evidence.target.localBuild, false);
  assert.equal(evidence.target.personalDataUsed, false);
  assert.deepEqual(evidence.target.deployment, {
    metadataUrl: `${SITE_URL}deployment.json`,
    metadataSha256: DEPLOYMENT_SHA256,
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit: PRODUCT_COMMIT,
    runId: String(PAGES_RUN_ID),
    expectedCommit: PRODUCT_COMMIT,
  });
  assertReleaseBinding(evidence.releaseEvidence);

  assert.equal(evidence.environment.chrome, "Google Chrome 152.0.7977.64");
  assert.equal(evidence.environment.chromeDevtoolsMcp, "1.8.0");
  assert.equal(evidence.environment.isolatedProfile, true);
  assert.equal(evidence.environment.updateChecks, false);
  assert.equal(evidence.capture.modelSelected, false);
  assert.equal(evidence.capture.modelProviderCalled, false);
  assert.equal(evidence.capture.exactToolOutputsRetained, true);
  assert.deepEqual(evidence.capture.redactions, {
    localProfilePath: "not retained",
    hostPageIdentifiers: "not retained",
    networkHeaders: "not retained",
    cookies: "not inspected or retained",
  });

  assert.equal(evidence.discovery.toolCount, 5);
  assert.deepEqual(evidence.discovery.tools.map(({ name }) => name), TOOL_NAMES);
  assert.ok(evidence.discovery.tools.every(({ inputSchema }) => inputSchema.additionalProperties === false));
  assert.deepEqual(
    evidence.discovery.tools.map(({ annotations }) => annotations.readOnly),
    [true, true, true, false, false],
  );
  assert.ok(evidence.discovery.tools.every(({ annotations }) => annotations.untrustedContent === true));

  assert.deepEqual(evidence.calls.map(({ toolName }) => toolName), TOOL_NAMES);
  assert.deepEqual(evidence.calls.map(({ output }) => output.schema), RESULT_SCHEMAS);
  assert.ok(evidence.calls.every(({ status }) => status === "Completed"));
  assert.ok(evidence.calls.every(({ output }) => output.ok === true));
  for (const call of evidence.calls) {
    assert.equal(
      sha256(canonicalJson(call.output)),
      call.canonicalOutputSha256,
      `${call.toolName} exact output digest drifted`,
    );
  }

  const [search, record, provenance, explore, compare] = evidence.calls;
  assert.equal(search.output.totalMatches, 36);
  assert.equal(search.output.returned, 3);
  assert.ok(search.output.results.every(({ canonicalHumanUrl }) =>
    canonicalHumanUrl.startsWith("https://www.gov.uk/")));
  assert.ok(search.output.results.every(({ limitations }) => limitations.length > 0));
  assert.equal(record.output.record.canonicalHumanUrl, "https://www.gov.uk/register-birth");
  assert.equal(record.output.record.id, provenance.output.recordId);
  assert.ok(provenance.output.sources.some(({ url }) => url === "https://www.gov.uk/register-birth"));
  assert.equal(explore.output.boundaries.presentationEffect, "transient-local-selection");
  assert.equal(compare.output.boundaries.presentationEffect, "transient-local-selection");
  for (const call of [explore, compare]) {
    assert.equal(call.output.boundaries.catalogueMutation, false);
    assert.equal(call.output.boundaries.storageWrite, false);
    assert.equal(call.output.boundaries.providerCall, false);
    assert.equal(call.output.boundaries.externalStateChange, false);
  }

  assert.equal(evidence.rejectedCall.status, "Completed");
  assert.equal(evidence.rejectedCall.input.personalContext.includes("synthetic"), true);
  assert.equal(evidence.rejectedCall.output.schema, "trusted-govuk-discovery.error.v1");
  assert.equal(evidence.rejectedCall.output.ok, false);
  assert.equal(evidence.rejectedCall.output.error.code, "invalid_search_request");
  assert.match(evidence.rejectedCall.output.error.message, /Unknown input field: personalContext/u);
  assert.equal(
    sha256(canonicalJson(evidence.rejectedCall.output)),
    evidence.rejectedCall.canonicalOutputSha256,
  );
  assert.equal(evidence.console.messageCount, 0);
  assert.equal(evidence.console.errorCount, 0);
  assert.equal(evidence.boundaries.modelSelectionEvaluated, false);
  assert.equal(evidence.boundaries.remoteProviderCalled, false);
});

test("current Chrome DevTools MCP evidence binds five exact-release calls", async () => {
  const bytes = await readFile(CURRENT_CHROME_PATH);
  const text = bytes.toString("utf8");
  assert.equal(sha256(bytes), CURRENT_CHROME_SHA256);
  assert.doesNotMatch(
    text,
    /\/Users\/|\/private\/tmp\/|--user-data-dir|authorization\s*[:=]|cookie\s*:/iu,
  );
  const evidence = JSON.parse(text);
  validateCurrentChromeEvidence(evidence);

  const challenge = JSON.parse(await readFile(CHALLENGE_PATH, "utf8"));
  assert.deepEqual(challenge.currentReleaseEvidence.rulesNamedChromeWebmcp, {
    observedAt: evidence.observedAt,
    evidencePath: CURRENT_CHROME_PATH,
    evidenceSha256: CURRENT_CHROME_SHA256,
    host: "Google Chrome 152.0.7977.64",
    bridge: "Chrome DevTools MCP 1.8.0",
    productCommit: CURRENT_PRODUCT_COMMIT,
    pagesRunId: Number(CURRENT_PAGES_RUN_ID),
    discoveredToolCount: 5,
    successfulCallCount: 5,
    rejectedField: "personalContext",
    rejectedErrorCode: "invalid_search_request",
    consoleErrorCount: 0,
    modelSelected: false,
    modelProviderCalled: false,
    universalBrowserSupportEstablished: false,
    scope: "One time-bound rules-named Chrome and Chrome DevTools MCP version. Browser-native discovery and deterministic execution do not establish model selection, provider behaviour or universal browser compatibility.",
  });

  const coDigested = structuredClone(evidence);
  coDigested.calls[0].output.boundaries.providerCall = true;
  coDigested.calls[0].canonicalOutputSha256 = sha256(canonicalJson(coDigested.calls[0].output));
  assert.throws(
    () => validateCurrentChromeEvidence(coDigested),
    /exact current-release output changed/u,
    "a co-digested provider-call mutation must remain inadmissible",
  );

  const relabelledModelRun = structuredClone(evidence);
  relabelledModelRun.capture.modelSelected = true;
  assert.throws(
    () => validateCurrentChromeEvidence(relabelledModelRun),
    /modelSelected/u,
    "a deterministic Chrome call must not be relabelled as model selection",
  );
});

test("native Chrome DevTools evidence records five valid calls and one invalid call", async () => {
  const text = await readFile(NATIVE_PATH, "utf8");
  assert.doesNotMatch(text, /\/Users\/|\/private\/tmp\/|--user-data-dir|authorization\s*[:=]|cookie\s*:/iu);
  const evidence = JSON.parse(text);

  assert.equal(evidence.schema, "trusted-govuk-discovery.native-devtools-webmcp-evidence.v1");
  assert.equal(evidence.page.url, SITE_URL);
  assert.equal(evidence.page.authenticationRequired, false);
  assert.equal(evidence.page.personalDataUsed, false);
  assertReleaseBinding(evidence.deploymentBinding);
  assert.deepEqual(
    evidence.sourceReceipts.map(({ sha256: digest }) => digest),
    [
      "79ffcccdf6f396509a06feb6dfbb3dd70421deccf957277c0b11e58acb86ced6",
      "994899d50cc56ffa713fa1a12f84dac36d0b37d961aade8755d126f8be259367",
    ],
  );
  assert.equal(evidence.host.browserVersion, "152.0.7977.64");
  assert.equal(evidence.host.surface, "Application → WebMCP");
  assert.deepEqual(evidence.host.featureState, [
    "WebMCP",
    "DevToolsWebMCPSupport",
    "WebMCPTesting",
  ]);
  assert.match(evidence.capture.method, /Playwright.*native DevTools frontend.*loopback-only/iu);
  assert.equal(evidence.capture.browserUiWasNative, true);
  assert.equal(evidence.capture.modelBacked, false);
  assert.equal(evidence.capture.modelSelected, false);
  assert.equal(evidence.capture.modelProviderCalled, false);

  assert.equal(evidence.discovery.toolCount, 5);
  assert.deepEqual([...evidence.discovery.toolNames].sort(), [...TOOL_NAMES].sort());
  assert.deepEqual(evidence.validCalls.map(({ toolName }) => toolName), TOOL_NAMES);
  assert.deepEqual(evidence.validCalls.map(({ observedResultSchema }) => observedResultSchema), RESULT_SCHEMAS);
  assert.ok(evidence.validCalls.every(({ status }) => status === "Completed"));
  assert.ok(evidence.validCalls.every(({ observedOk }) => observedOk === true));
  assert.ok(evidence.validCalls.every(({ panelResultSummary }) => /ok: true/u.test(panelResultSummary)));

  const chrome = JSON.parse(await readFile(CHROME_PATH, "utf8"));
  for (const [index, call] of evidence.validCalls.entries()) {
    const exact = chrome.calls[index];
    assert.deepEqual(call.input, exact.input);
    assert.equal(call.corroboratingExactOutput.samePublicTargetAndInput, true);
    assert.equal(call.corroboratingExactOutput.canonicalOutputSha256, exact.canonicalOutputSha256);
  }
  assert.equal(evidence.validCalls[3].pageObservation.comparisonVisible, false);
  assert.equal(evidence.validCalls[4].pageObservation.comparisonVisible, true);
  assert.equal(evidence.validCalls[4].pageObservation.comparisonRows, 11);

  assert.equal(evidence.invalidCall.toolName, "search_government_knowledge");
  assert.deepEqual(evidence.invalidCall.input, { query: "register a birth", limit: 21 });
  assert.equal(evidence.invalidCall.beforeCount, 5);
  assert.equal(evidence.invalidCall.afterCount, 6);
  assert.equal(evidence.invalidCall.dispatchAttempted, true);
  assert.equal(evidence.invalidCall.status, "Completed");
  assert.equal(evidence.invalidCall.observedResultSchema, "trusted-govuk-discovery.error.v1");
  assert.equal(evidence.invalidCall.observedOk, false);
  assert.equal(evidence.invalidCall.observedErrorCode, "invalid_search_request");
  assert.equal("deterministicExpectedResult" in evidence.invalidCall, false);
  assert.match(evidence.invalidCall.exactResultLimitation, /collapsed.*does not reconstruct/iu);
  assert.deepEqual(evidence.consoleErrors, []);

  assert.equal(evidence.artefacts.length, 2);
  for (const artefact of evidence.artefacts) {
    const bytes = await readFile(artefact.path);
    assert.equal(sha256(bytes), artefact.sha256, `${artefact.path} digest drifted`);
    assert.equal(artefact.mediaType, "image/jpeg");
    assert.equal(artefact.pixelWidth, 1019);
    assert.equal(artefact.pixelHeight, 768);
    assert.equal(artefact.privacyReview.personalDataObserved, false);
    assert.equal(artefact.privacyReview.identityGpsOrAuthorExifObserved, false);
  }
  assert.equal(evidence.boundaries.nativeDevtoolsPanelObserved, true);
  assert.equal(evidence.boundaries.fiveValidCallsCompleted, true);
  assert.equal(evidence.boundaries.invalidCallCompletedWithErrorEnvelope, true);
  assert.equal(evidence.boundaries.browserUiAutomated, true);
  assert.equal(evidence.boundaries.modelBacked, false);
  assert.equal(evidence.boundaries.modelSelectionEvaluated, false);
  assert.equal(evidence.boundaries.generalBrowserCompatibilityEstablished, false);
});

test("video, Devpost and challenge receipts retain the latest human gates", async () => {
  const reviewedPaths = [
    LIVE_PATH,
    DEPLOYMENT_PATH,
    CHROME_PATH,
    NATIVE_PATH,
    CHALLENGE_PATH,
    DEVPOST_PATH,
    VIDEO_REVIEW_PATH,
    CURRENT_DEVPOST_PATH,
    CURRENT_MANUAL_VOICEOVER_PATH,
    CURRENT_VIDEO_BUILD_PATH,
    CURRENT_VIDEO_REVIEW_PATH,
  ];
  const reviewedTexts = await Promise.all(reviewedPaths.map((path) => readFile(path, "utf8")));
  for (const [index, text] of reviewedTexts.entries()) {
    assert.doesNotMatch(
      text,
      /\/Users\/|\/private\/tmp\/|--user-data-dir|authorization\s*[:=]|cookie\s*:/iu,
      `${reviewedPaths[index]} retained a host-specific path or sensitive field`,
    );
  }

  const challenge = JSON.parse(reviewedTexts[4]);
  const devpost = JSON.parse(reviewedTexts[5]);
  const video = JSON.parse(reviewedTexts[6]);
  const currentDevpost = JSON.parse(reviewedTexts[7]);
  const currentManualVoiceOver = JSON.parse(reviewedTexts[8]);
  const currentVideoBuild = JSON.parse(reviewedTexts[9]);
  const currentVideoReview = JSON.parse(reviewedTexts[10]);

  validateCurrentEvidenceChain({
    challenge,
    manualVoiceOver: currentManualVoiceOver,
    videoBuild: currentVideoBuild,
    videoReview: currentVideoReview,
  });
  for (const binding of currentVideoBuild.inputs.filter(({ path }) => path.startsWith("docs/"))) {
    const bytes = await readFile(binding.path);
    assert.equal(bytes.length, binding.sizeBytes, `${binding.path} byte count drifted`);
    assert.equal(sha256(bytes), binding.sha256, `${binding.path} digest drifted`);
  }
  for (const binding of [currentVideoBuild.captions, currentVideoBuild.transcript, currentVideoBuild.script]) {
    assert.equal(sha256(await readFile(binding.path)), binding.sha256, `${binding.path} digest drifted`);
  }

  assert.equal(
    challenge.latestEvidenceAt,
    challenge.currentReleaseEvidence.observationWindow.completedAt,
  );
  assert.equal(challenge.latestEvidenceAt, "2026-08-31T18:49:38.356Z");
  assert.equal(challenge.observationWindow.completedAt, challenge.latestEvidenceAt);
  assert.equal(
    challenge.postReleaseEvidence.devpostReadOnlyStatus.evidencePath,
    DEVPOST_PATH,
  );
  assert.equal(
    challenge.postReleaseEvidence.devpostReadOnlyStatus.registrationEvidencePath,
    `${EVIDENCE_DIRECTORY}/devpost-read-only-status-2026-08-30.json`,
  );
  assert.equal(
    challenge.postReleaseEvidence.demoVideoTechnicalReview.evidencePath,
    VIDEO_REVIEW_PATH,
  );
  assert.equal(challenge.gates.demoVideoTechnicalReviewComplete, true);
  assert.equal(challenge.gates.demoVideoHumanReviewComplete, false);
  assert.equal(challenge.gates.videoPublished, false);
  assert.equal(challenge.gates.devpostSubmissionPerformed, false);

  assert.equal(
    devpost.observedAt,
    challenge.postReleaseEvidence.devpostReadOnlyStatus.observedAt,
  );
  assert.ok(
    Date.parse(devpost.observedAt) < Date.parse(challenge.latestEvidenceAt),
    "the historical Devpost receipt must predate the current-release evidence endpoint",
  );
  assert.equal(devpost.project.id, 1406973);
  assert.equal(devpost.project.name, "Untitled");
  assert.equal(devpost.project.state, "submission_pre_draft");
  assert.equal(devpost.project.taglinePresent, false);
  assert.equal(devpost.project.descriptionPresent, false);
  assert.equal(devpost.project.videoUrlPresent, false);
  assert.equal(devpost.project.submittedAt, null);
  assert.equal(devpost.repositoryReadinessAtObservation.ownerApprovedPublicYouTubeVideo, false);
  assert.equal(devpost.repositoryReadinessAtObservation.completeDevpostProjectFields, false);
  assert.equal(devpost.repositoryReadinessAtObservation.finalHumanAttestations, false);
  assert.equal(devpost.repositoryReadinessAtObservation.submitted, false);
  assert.equal(devpost.actionsPerformed.projectChanged, false);
  assert.equal(devpost.actionsPerformed.submissionPerformed, false);

  assert.equal(currentDevpost.schema, "trusted-govuk-discovery.devpost-read-only-status.v2");
  assert.equal(currentDevpost.observedAt, "2026-08-31T12:16:25Z");
  assert.deepEqual(currentDevpost.observationWindow, {
    startedAt: "2026-08-31T12:16:23Z",
    completedAt: "2026-08-31T12:16:25Z",
  });
  assert.deepEqual(currentDevpost.sourceCalls, {
    projectFetchedAt: "2026-08-31T12:16:23Z",
    requirementsFetchedAt: "2026-08-31T12:16:23Z",
    keyDatesFetchedAt: "2026-08-31T12:16:24Z",
    announcementsFetchedAt: "2026-08-31T12:16:25Z",
  });
  assert.equal(currentDevpost.hackathon.submissionsEndAt, "2026-09-03T20:00:00Z");
  assert.equal(currentDevpost.project.id, 1406973);
  assert.equal(currentDevpost.project.name, "Untitled");
  assert.equal(currentDevpost.project.state, "submission_pre_draft");
  assert.equal(currentDevpost.project.taglinePresent, false);
  assert.equal(currentDevpost.project.descriptionPresent, false);
  assert.equal(currentDevpost.project.videoUrlPresent, false);
  assert.equal(currentDevpost.project.publishedAt, null);
  assert.equal(currentDevpost.project.submittedAt, null);
  assert.deepEqual(
    currentDevpost.officialSubmissionRequirements.requiredCustomFields.map(({ id }) => id),
    [28249, 28250, 28252, 28254, 28256, 28257, 28258, 28259, 28260],
  );
  assert.equal(currentDevpost.latestAnnouncement.id, 46123);
  assert.equal(currentDevpost.latestAnnouncement.sentAt, "2026-08-30T16:31:51Z");
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.technicalVideoCandidateUnderThreeMinutes, false);
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.ownerVideoReviewCompleted, false);
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.ownerApprovedPublicYouTubeVideo, false);
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.completeDevpostProjectFields, false);
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.finalHumanAttestations, false);
  assert.equal(currentDevpost.currentReleaseReadinessAtObservation.submitted, false);
  assert.equal(currentDevpost.actionsPerformed.projectChanged, false);
  assert.equal(currentDevpost.actionsPerformed.submissionPerformed, false);
  assert.equal(
    challenge.currentReleaseEvidence.devpostReadOnlyStatus.evidencePath,
    CURRENT_DEVPOST_PATH,
  );
  assert.equal(
    challenge.currentReleaseEvidence.devpostReadOnlyStatus.evidenceSha256,
    sha256(await readFile(CURRENT_DEVPOST_PATH)),
  );
  assert.equal(
    challenge.currentReleaseEvidence.devpostReadOnlyStatus.observedAt,
    currentDevpost.observedAt,
  );
  assert.deepEqual(
    challenge.currentReleaseEvidence.devpostReadOnlyStatus.requiredCustomFieldIds,
    currentDevpost.officialSubmissionRequirements.requiredCustomFields.map(({ id }) => id),
  );
  assert.equal(challenge.currentReleaseEvidence.devpostReadOnlyStatus.submissionPerformed, false);

  assert.equal(
    challenge.currentReleaseEvidence.devpostReadOnlyStatus.currentReleaseTechnicalVideoCandidateUnderThreeMinutes,
    false,
    "the immutable Devpost observation predates the local current-release video build",
  );

  assert.equal(
    currentManualVoiceOver.schema,
    "trusted-govuk-discovery.manual-voiceover-journey.v1",
  );
  assert.equal(currentManualVoiceOver.observedAt, "2026-08-31T17:49:23Z");
  assert.deepEqual(currentManualVoiceOver.page, {
    url: SITE_URL,
    release: "v0.3.0-rc.1",
    productCommit: "b0bd634579a3abf82bdd1fc83ff688535e0db0bf",
    pagesRunId: "33356452048",
  });
  assert.equal(currentManualVoiceOver.method, "manual-operator-driven");
  assert.equal(currentManualVoiceOver.manual, true);
  assert.equal(currentManualVoiceOver.assistiveTechnologyActuallyUsed, true);
  assert.equal(currentManualVoiceOver.withoutWebMCP, true);
  assert.equal(currentManualVoiceOver.noWcagConformanceClaim, true);
  assert.equal(currentManualVoiceOver.screenReaderAudioCaptured, false);
  assert.equal(currentManualVoiceOver.environment.browserVersion, "26.5.2 (21624.2.5.11.8)");
  assert.equal(currentManualVoiceOver.environment.screenReaderVersion, "10 (993)");
  assert.equal(currentManualVoiceOver.overallStatus, "completed-with-limitations");
  assert.equal(currentManualVoiceOver.journey.length, 9);
  assert.equal(currentManualVoiceOver.journey.filter(({ result }) => result === "pass").length, 7);
  assert.equal(currentManualVoiceOver.journey.filter(({ result }) => result === "limitation").length, 2);
  assert.equal(currentManualVoiceOver.media.path, "output/demo-clips/v0.3.0-rc.1/06-voiceover.mov");
  assert.equal(
    currentManualVoiceOver.media.sha256,
    "e77d8f277d19db7af372090b78ae83b76b50a1221cef69fccb5f047e9e4a62d0",
  );
  assert.equal(currentManualVoiceOver.media.endSeconds - currentManualVoiceOver.media.startSeconds, 27);
  assert.equal(
    currentManualVoiceOver.media.captureManifestSha256,
    "3ff39de4fb1355728504a5e29eaf1bf93b7e71b34ad7ac1c7493e21aeb1d2629",
  );
  assert.ok(currentManualVoiceOver.limitations.includes("This screenshot sequence is not a continuous recording."));
  assert.ok(currentManualVoiceOver.limitations.some((limitation) => /does not establish WCAG conformance/u.test(limitation)));

  assert.equal(currentVideoBuild.schema, "trusted-govuk-discovery.demo-video-build.v3");
  assert.equal(currentVideoBuild.status, "local-review-build-not-published");
  assert.deepEqual(currentVideoBuild.product, {
    url: SITE_URL,
    release: "v0.3.0-rc.1",
    commit: "b0bd634579a3abf82bdd1fc83ff688535e0db0bf",
    pagesRunId: "33356452048",
  });
  assert.equal(
    currentVideoBuild.inputs.find(({ path }) => path === CURRENT_MANUAL_VOICEOVER_PATH)?.sha256,
    sha256(await readFile(CURRENT_MANUAL_VOICEOVER_PATH)),
  );
  assert.equal(
    currentVideoBuild.inputs.find(({ path }) => path.endsWith("v0.3.0-rc.1-capture-manifest.json"))?.sha256,
    currentManualVoiceOver.media.captureManifestSha256,
  );
  assert.equal(
    currentVideoBuild.video.sha256,
    "e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4",
  );
  assert.equal(currentVideoBuild.video.durationSeconds, 156.023);
  assert.ok(currentVideoBuild.video.durationSeconds < 180);
  assert.deepEqual(
    currentVideoBuild.video.streams.map(({ codec_name, codec_type }) => ({ codec_name, codec_type })),
    [
      { codec_name: "h264", codec_type: "video" },
      { codec_name: "aac", codec_type: "audio" },
      { codec_name: "mov_text", codec_type: "subtitle" },
    ],
  );
  assert.equal(currentVideoBuild.video.publicUrl, null);
  assert.equal(currentVideoBuild.video.signedOutPlaybackVerified, false);
  assert.equal(currentVideoBuild.captions.language, "en-GB");
  assert.equal(currentVideoBuild.captions.embeddedTrack, true);
  assert.equal(currentVideoBuild.captions.publicPlayerTrackVerified, false);
  assert.equal(currentVideoBuild.narration.publicationBasis, "pending-owner-review");
  assert.deepEqual(currentVideoBuild.reviews, {
    privacy: "pending-human-review",
    branding: "pending-human-review",
    rights: "pending-human-review",
    voicePublicationBasis: "pending-owner-review",
    finalHumanPlayback: "pending",
    finalHumanReviewRequiredBeforePublication: true,
  });

  assert.equal(
    currentVideoReview.schema,
    "trusted-govuk-discovery.demo-video-technical-review.v1",
  );
  assert.equal(currentVideoReview.status, "technical-review-complete-with-non-fatal-observation");
  assert.equal(currentVideoReview.reviewedAt, "2026-08-31T18:14:36Z");
  assert.equal(currentVideoReview.productBoundary.release, "v0.3.0-rc.1");
  assert.equal(
    currentVideoReview.productBoundary.commit,
    "b0bd634579a3abf82bdd1fc83ff688535e0db0bf",
  );
  assert.equal(currentVideoReview.productBoundary.pagesRunId, "33356452048");
  assert.equal(currentVideoReview.artefact.sha256, currentVideoBuild.video.sha256);
  assert.equal(currentVideoReview.artefact.sizeBytes, 27193896);
  assert.equal(currentVideoReview.artefact.buildReceipt.path, CURRENT_VIDEO_BUILD_PATH);
  assert.equal(
    currentVideoReview.artefact.buildReceipt.sha256,
    sha256(await readFile(CURRENT_VIDEO_BUILD_PATH)),
  );
  assert.equal(currentVideoReview.probe.format.durationSeconds, currentVideoBuild.video.durationSeconds);
  assert.equal(currentVideoReview.decode.videoAndAudioCompleteDecode, true);
  assert.equal(currentVideoReview.decode.decodedVideoFrames, 4678);
  assert.equal(currentVideoReview.captionsAndNarration.trackedCaptions.cueCount, 40);
  assert.equal(currentVideoReview.captionsAndNarration.audioSignal.audiblePlaybackPerformed, false);
  assert.equal(
    currentVideoReview.probe.nonFatalObservation.classification,
    "non-blocking-container-metadata-warning",
  );
  assert.equal(currentVideoReview.review.readyForHumanReview, true);
  assert.equal(currentVideoReview.review.publicationApproved, false);
  assert.deepEqual(currentVideoReview.approvalBoundary, {
    technicalAgentReviewOnly: true,
    humanContinuousPlaybackApproval: false,
    brandingApproval: false,
    privacyApproval: false,
    rightsApproval: false,
    syntheticVoicePublicationApproval: false,
    signedOutPublishedPlaybackVerified: false,
    ownerPublicationApproval: false,
  });

  const currentEvidence = challenge.currentReleaseEvidence;
  assert.equal(
    currentEvidence.observationWindow.completedAt,
    currentEvidence.rulesNamedChromeWebmcp.observedAt,
  );
  assert.equal(currentEvidence.manualVoiceOver.evidencePath, CURRENT_MANUAL_VOICEOVER_PATH);
  assert.equal(
    currentEvidence.manualVoiceOver.evidenceSha256,
    sha256(await readFile(CURRENT_MANUAL_VOICEOVER_PATH)),
  );
  assert.equal(currentEvidence.manualVoiceOver.journeyCheckpointCount, 9);
  assert.equal(currentEvidence.manualVoiceOver.passedCheckpointCount, 7);
  assert.equal(currentEvidence.manualVoiceOver.limitedCheckpointCount, 2);
  assert.equal(currentEvidence.manualVoiceOver.screenReaderAudioCaptured, false);
  assert.equal(currentEvidence.manualVoiceOver.media.continuousRecording, false);
  assert.equal(currentEvidence.demoVideoBuild.evidencePath, CURRENT_VIDEO_BUILD_PATH);
  assert.equal(
    currentEvidence.demoVideoBuild.evidenceSha256,
    sha256(await readFile(CURRENT_VIDEO_BUILD_PATH)),
  );
  assert.equal(currentEvidence.demoVideoBuild.underThreeMinutes, true);
  assert.equal(currentEvidence.demoVideoBuild.publicUrl, null);
  assert.equal(currentEvidence.demoVideoBuild.signedOutPlaybackVerified, false);
  assert.equal(currentEvidence.demoVideoTechnicalReview.evidencePath, CURRENT_VIDEO_REVIEW_PATH);
  assert.equal(
    currentEvidence.demoVideoTechnicalReview.evidenceSha256,
    sha256(await readFile(CURRENT_VIDEO_REVIEW_PATH)),
  );
  assert.equal(currentEvidence.demoVideoTechnicalReview.readyForHumanReview, true);
  assert.equal(currentEvidence.demoVideoTechnicalReview.humanPublicationReview, "pending");
  assert.deepEqual(currentEvidence.localTechnicalComplianceReview, {
    reviewedAt: "2026-08-31T18:49:38.356Z",
    evidencePath: CURRENT_FINAL_COMPLIANCE_PATH,
    evidenceSha256: CURRENT_FINAL_COMPLIANCE_SHA256,
    status: "local-video-technical-pass-submission-blocked",
    scope: "Read-only compliance review after the local technical video pass. Owner review, public YouTube publication, signed-out public-player verification, final human attestations and authorised submission remain open.",
  });
  assert.equal(
    currentEvidence.localTechnicalComplianceReview.evidenceSha256,
    sha256(await readFile(CURRENT_FINAL_COMPLIANCE_PATH)),
    "current local technical compliance review bytes drifted",
  );
  assert.equal("finalDevpostComplianceReview" in currentEvidence, false);

  const currentGates = currentEvidence.accessibilityVideoAndSubmissionGates;
  assert.equal(currentGates.priorInvalidCaptureAttempt.status, "rejected-before-admission");
  assert.equal(currentGates.priorInvalidCaptureAttempt.admitted, false);
  assert.equal(currentGates.priorInvalidCaptureAttempt.supersededByCleanRecapture, true);
  assert.equal(currentGates.currentReleaseVoiceOverCaptureAttemptValid, true);
  assert.equal(currentGates.currentReleaseVoiceOverCaptureAdmitted, true);
  assert.equal(currentGates.cleanVoiceOverRecaptureRequired, false);
  assert.equal(currentGates.currentReleaseManualVoiceOverEvidenceCompleted, true);
  assert.equal(currentGates.currentReleaseVoiceOverClipBuilt, true);
  assert.equal(currentGates.currentReleaseFinalVideoBuilt, true);
  assert.equal(currentGates.currentReleaseVideoTechnicalReviewCompleted, true);
  for (const gate of [
    "ownerPrivacyReviewCompleted",
    "ownerBrandingReviewCompleted",
    "ownerSyntheticVoicePublicationApproval",
    "ownerContinuousAudiblePlaybackCompleted",
    "publicYouTubeVideoPublished",
    "signedOutPublicPlayerAudioVerified",
    "signedOutPublicPlayerCaptionsVerified",
    "finalDevpostAttestationsCompleted",
    "devpostSubmissionAuthorised",
    "devpostSubmissionPerformed",
  ]) {
    assert.equal(currentGates[gate], false, `${gate} must remain open`);
  }
  assert.equal(challenge.gates.currentReleaseManualScreenReaderEvidenceCompleted, true);
  assert.equal(challenge.gates.currentReleaseLocalDemoVideoBuilt, true);
  assert.equal(challenge.gates.currentReleaseDemoVideoTechnicalReviewComplete, true);
  assert.equal(challenge.gates.currentReleaseRulesNamedChromeToolDiscoveryObserved, true);
  assert.equal(challenge.gates.currentReleaseRulesNamedChromeToolCallObserved, true);
  assert.equal(challenge.gates.currentReleaseUniversalBrowserSupportEstablished, false);
  assert.equal(challenge.gates.currentReleaseLocalTechnicalComplianceReviewCompleted, true);
  assert.equal(challenge.gates.currentReleaseFinalPreSubmissionRefreshCompleted, false);
  assert.equal("currentReleaseFinalDevpostComplianceReviewCompleted" in challenge.gates, false);
  assert.equal(challenge.gates.currentReleaseDemoVideoHumanReviewComplete, false);
  assert.equal(challenge.gates.currentReleaseVideoPublished, false);
  assert.equal(challenge.gates.currentReleaseSignedOutPublicPlayerVerified, false);
  assert.equal(challenge.gates.currentReleaseDevpostSubmissionPerformed, false);

  assert.equal(video.artefact.sha256, "efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a");
  assert.equal(video.probe.format.durationSeconds, 142.92);
  assert.equal(video.decode.decodedVideoFrames, 4284);
  assert.equal(video.captionsAndNarration.trackedCaptions.cueCount, 38);
  assert.equal(video.captionsAndNarration.audioSignal.audiblePlaybackPerformed, false);
  assert.equal(video.review.publicationApproved, false);
  assert.equal(video.approvalBoundary.humanContinuousPlaybackApproval, false);
  assert.equal(video.probe.nonFatalObservation.classification, "non-blocking-container-metadata-warning");
});

test("current evidence validation rejects fully co-digested semantic mutations", async () => {
  const base = {
    challenge: JSON.parse(await readFile(CHALLENGE_PATH, "utf8")),
    manualVoiceOver: JSON.parse(await readFile(CURRENT_MANUAL_VOICEOVER_PATH, "utf8")),
    videoBuild: JSON.parse(await readFile(CURRENT_VIDEO_BUILD_PATH, "utf8")),
    videoReview: JSON.parse(await readFile(CURRENT_VIDEO_REVIEW_PATH, "utf8")),
  };

  const missingInput = structuredClone(base);
  missingInput.videoBuild.inputs = missingInput.videoBuild.inputs.filter(
    ({ path }) => path !== "docs/competition/evidence/supported-host-webmcp-raw-receipt-v0.3.0-rc.1.json",
  );
  coDigestCurrentEvidenceChain(missingInput);
  assert.throws(
    () => validateCurrentEvidenceChain(missingInput),
    /all 14 exact bindings/u,
    "co-digesting the reduced input set must not make it admissible",
  );

  const duplicateInput = structuredClone(base);
  duplicateInput.videoBuild.inputs.splice(3, 0, structuredClone(duplicateInput.videoBuild.inputs[2]));
  coDigestCurrentEvidenceChain(duplicateInput);
  assert.throws(
    () => validateCurrentEvidenceChain(duplicateInput),
    /paths must be unique/u,
    "co-digesting a duplicate input path must not make it admissible",
  );

  const changedSourceLink = structuredClone(base);
  const sourceLink = changedSourceLink.manualVoiceOver.journey.find(
    ({ id }) => id === "source-link-role-and-destination",
  );
  sourceLink.details.destinationHostname = "example.com";
  sourceLink.observation = sourceLink.observation.replace("www.gov.uk", "example.com");
  coDigestCurrentEvidenceChain(changedSourceLink);
  assert.throws(
    () => validateCurrentEvidenceChain(changedSourceLink),
    /source-link evidence drifted/u,
    "co-digesting a substituted source-link destination must not make it admissible",
  );

  const changedCheckpoint = structuredClone(base);
  const liveStatus = changedCheckpoint.manualVoiceOver.journey.find(({ id }) => id === "live-status");
  const searchAndRecord = changedCheckpoint.manualVoiceOver.journey.find(({ id }) => id === "search-and-record");
  liveStatus.result = "pass";
  delete liveStatus.limitation;
  searchAndRecord.result = "limitation";
  searchAndRecord.limitation = changedCheckpoint.manualVoiceOver.limitations[1];
  coDigestCurrentEvidenceChain(changedCheckpoint);
  assert.throws(
    () => validateCurrentEvidenceChain(changedCheckpoint),
    /checkpoint semantics drifted/u,
    "preserving the 7-to-2 count cannot hide which VoiceOver checkpoint was limited",
  );

  const approvedWithoutHumanReview = structuredClone(base);
  approvedWithoutHumanReview.videoReview.approvalBoundary.ownerPublicationApproval = true;
  coDigestCurrentEvidenceChain(approvedWithoutHumanReview);
  assert.throws(
    () => validateCurrentEvidenceChain(approvedWithoutHumanReview),
    /ownerPublicationApproval/u,
    "co-digesting an unsupported owner-publication gate must not make it admissible",
  );

  const universalSupportOverclaim = structuredClone(base);
  universalSupportOverclaim.challenge.gates.currentReleaseUniversalBrowserSupportEstablished = true;
  assert.throws(
    () => validateCurrentEvidenceChain(universalSupportOverclaim),
    /true !== false/u,
    "one current Chrome capture must not be relabelled as universal browser support",
  );
});

test("human-readable verification reports exact bindings and limitations", async () => {
  const report = await readFile(REPORT_PATH, "utf8");
  for (const value of [
    PRODUCT_COMMIT,
    String(PAGES_RUN_ID),
    String(PAGES_ARTIFACT_ID),
    DEPLOYMENT_SHA256,
    ARTIFACT_TAR_SHA256,
    ARTIFACT_API_DIGEST,
    PUBLIC_RAW_SHA256,
  ]) {
    assert.match(report, new RegExp(value, "u"));
  }
  assert.match(report, /all\s+20 files.*matched.*byte for byte/isu);
  assert.match(report, /WebMCP.*DevToolsWebMCPSupport.*WebMCPTesting/su);
  assert.match(report, /Playwright.*native DevTools frontend.*loopback-only/isu);
  assert.match(report, /not\s+a model-backed run/iu);
  assert.match(report, /not a general browser compatibility claim/iu);
});
