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
const NATIVE_PATH = `${EVIDENCE_DIRECTORY}/native-devtools-webmcp-2026-08-30-edd4ce6.json`;
const CHALLENGE_PATH = `${EVIDENCE_DIRECTORY}/challenge-provenance.json`;
const DEVPOST_PATH = `${EVIDENCE_DIRECTORY}/devpost-read-only-status-2026-08-30-edd4ce6.json`;
const VIDEO_REVIEW_PATH = `${EVIDENCE_DIRECTORY}/demo-video-technical-review-2026-08-30.json`;
const REPORT_PATH = `${EVIDENCE_DIRECTORY}/public-deployment-verification-2026-08-30-edd4ce6.md`;

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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
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

  assert.equal(challenge.latestEvidenceAt, "2026-08-30T17:57:48Z");
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

  assert.equal(devpost.observedAt, challenge.latestEvidenceAt);
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

  assert.equal(video.artefact.sha256, "efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a");
  assert.equal(video.probe.format.durationSeconds, 142.92);
  assert.equal(video.decode.decodedVideoFrames, 4284);
  assert.equal(video.captionsAndNarration.trackedCaptions.cueCount, 38);
  assert.equal(video.captionsAndNarration.audioSignal.audiblePlaybackPerformed, false);
  assert.equal(video.review.publicationApproved, false);
  assert.equal(video.approvalBoundary.humanContinuousPlaybackApproval, false);
  assert.equal(video.probe.nonFatalObservation.classification, "non-blocking-container-metadata-warning");
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
