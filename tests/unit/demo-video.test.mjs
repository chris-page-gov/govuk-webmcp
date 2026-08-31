import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  bindReleaseConfig,
  canonicalJson,
  demoReleaseEnvironment,
  expectedToolNames,
  requiredVoiceOverJourneyIds,
  validateConfig,
  validateFinalVideo,
  validateHostMediaReceipt,
  validateInteractionCaptureEvidence,
  validateSupportedHostEvidence,
  validateVoiceOverEvidence,
  validateVoiceOverMediaBinding,
  verifyDemoDeployment,
  wrapCaption,
} from "../../scripts/build-demo-video.mjs";
import { waitForRenderedSearchResult } from "../../scripts/capture-live-demo-clips.mjs";

const environment = {
  [demoReleaseEnvironment.productCommit]: "a".repeat(40),
  [demoReleaseEnvironment.pagesRunId]: "33333333333",
};
const rawConfig = validateConfig(JSON.parse(await readFile("docs/competition/demo-video-script.json", "utf8")));
const config = bindReleaseConfig(rawConfig, environment);
const recordIds = {
  "uk-living": "govuk-discovery:federated:uk-living:1",
  ons: "govuk-discovery:federated:ons:2",
  "government-apis": "govuk-discovery:federated:government-apis:3",
  "land-registry": "govuk-discovery:federated:land-registry:4",
};
const demonstratedRecordId = recordIds["land-registry"];

test("live capture waits for a visible result card but accepts collapsed structured JSON", async () => {
  const waits = [];
  const resultCard = {
    waitFor: async (options) => {
      waits.push(["result-card", options.state]);
      assert.equal(options.state, "visible");
    },
  };
  const structuredResult = {
    waitFor: async (options) => {
      waits.push(["structured-result", options.state]);
      assert.equal(options.state, "attached");
    },
  };
  const page = {
    locator: (selector) => {
      if (selector === "#results article.result") return { first: () => resultCard };
      if (selector === "#results details.structured pre") return structuredResult;
      throw new Error(`Unexpected selector: ${selector}`);
    },
  };

  assert.equal(await waitForRenderedSearchResult(page), structuredResult);
  assert.deepEqual(waits, [
    ["result-card", "visible"],
    ["structured-result", "attached"],
  ]);
});

function digest(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

test("v3 video script is an unbound seven-scene UK-English editorial plan", () => {
  assert.equal(Object.hasOwn(rawConfig, "productCommit"), false);
  assert.equal(Object.hasOwn(rawConfig, "pagesRunId"), false);
  assert.equal(config.productCommit, environment.GOVUK_WEBMCP_DEMO_COMMIT);
  assert.equal(config.pagesRunId, environment.GOVUK_WEBMCP_DEMO_PAGES_RUN_ID);
  assert.equal(config.release, "v0.3.0-rc.1");
  assert.equal(config.language, "en-GB");
  assert.equal(config.demonstrationInputs.query, "housing");
  assert.equal(config.demonstrationInputs.limit, 8);
  assert.deepEqual(config.demonstrationInputs.collections, ["uk-living", "ons", "government-apis", "land-registry"]);
  assert.deepEqual(config.scenes.map(({ id }) => id), ["overview", "federated-search", "federated-record", "webmcp", "reviewed-foundations", "voiceover", "boundary"]);
  assert.equal(config.interactionCaptureReceipt, "docs/competition/evidence/demo-live-interaction-capture-v0.3.0-rc.1.json");
  assert.ok(config.scenes.every(({ media }) => media.path.startsWith("output/demo-clips/v0.3.0-rc.1/")));
  assert.equal(config.scenes.find(({ id }) => id === "webmcp").mediaReceipt, "docs/competition/evidence/supported-host-webmcp-clip-v0.3.0-rc.1.json");
  for (const scene of config.scenes) {
    for (const cue of scene.cues) {
      const lines = wrapCaption(cue).split("\n");
      assert.ok(lines.length <= 2);
      assert.ok(lines.every((line) => line.length <= 42));
    }
  }
});

test("release binding fails closed without an exact commit and Pages run", () => {
  assert.throws(() => bindReleaseConfig(rawConfig, {}), /GOVUK_WEBMCP_DEMO_COMMIT/u);
  assert.throws(() => bindReleaseConfig(rawConfig, { ...environment, GOVUK_WEBMCP_DEMO_COMMIT: "A".repeat(40) }), /lowercase 40-character/u);
  assert.throws(() => bindReleaseConfig(rawConfig, { ...environment, GOVUK_WEBMCP_DEMO_PAGES_RUN_ID: "0" }), /Pages deployment run ID/u);
  const historical = structuredClone(rawConfig);
  historical.schema = "trusted-govuk-discovery.demo-video-script.v2";
  assert.throws(() => validateConfig(historical), /wrong schema/u);
});

test("release binding revalidates the exact public deployment commit and run", async () => {
  const responseFor = (runId) => async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({
      schema: "trusted-govuk-discovery.deployment.v1",
      repository: "chris-page-gov/govuk-webmcp",
      commit: config.productCommit,
      runId,
    }),
  });
  assert.equal((await verifyDemoDeployment(config, responseFor(config.pagesRunId))).metadata.runId, config.pagesRunId);
  await assert.rejects(() => verifyDemoDeployment(config, responseFor("1")), /deployment run does not match/u);
});

function tool(name) {
  const searchSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      query: {}, resourceTypes: {}, publishers: {}, accessStatuses: {}, collections: {}, limit: {},
    },
    required: ["query"],
    $defs: {
      knowledgeCollection: { enum: ["deep-evidence", "uk-living", "ons", "government-apis", "land-registry"] },
    },
  };
  return {
    name,
    inputSchema: name === "search_government_knowledge" ? searchSchema : { type: "object", additionalProperties: false, properties: {} },
    annotations: {
      readOnlyHint: ["search_government_knowledge", "get_resource_record", "show_provenance"].includes(name),
      untrustedContentHint: true,
    },
  };
}

function call(name, input, result) {
  return { name, input, result, canonicalResultDigest: digest(result) };
}

function hostEvidenceFixture() {
  const searchResult = {
    schema: "trusted-govuk-discovery.search-result.v2",
    ok: true,
    selectedCollections: config.demonstrationInputs.collections,
    returned: 4,
    evidenceEstate: {
      reviewedRecordCount: 80,
      federatedSourceRecordCount: 58_655,
      federatedQuarantinedRecordCount: 3,
      federatedRecordCount: 58_652,
    },
    results: config.demonstrationInputs.collections.map((collectionId) => ({
      recordId: recordIds[collectionId],
      collectionId,
      evidenceTier: "federated-source-snapshot",
      canonicalHumanUrl: `https://www.gov.uk/${collectionId}`,
    })),
    collectionStatuses: config.demonstrationInputs.collections.map((collectionId) => ({
      collectionId, evidenceTier: "federated-source-snapshot", status: "ready",
    })),
    boundaries: { providerCall: false, personalContextAccepted: false, readOnly: true },
  };
  const recordResult = {
    schema: "govuk-webmcp.federated-resource-record-result.v1",
    ok: true,
    evidenceTier: "federated-source-snapshot",
    record: {
      id: demonstratedRecordId,
      collectionId: "land-registry",
      sourceAuthority: "Not independently established",
      linkRole: "producer-declared-source",
      canonicalHumanUrl: "https://www.gov.uk/land-registry",
    },
    boundaries: {
      readOnly: true,
      officialApiCall: false,
      accessAuthorityGranted: false,
      itemLevelReview: false,
      evidenceReceiptAvailable: false,
    },
  };
  const provenanceResult = {
    schema: "govuk-webmcp.federated-provenance-result.v1",
    ok: true,
    recordId: demonstratedRecordId,
    evidenceTier: "federated-source-snapshot",
    evidenceReceiptAvailable: false,
    authoritativeLink: { url: "https://www.gov.uk/land-registry", role: "producer-declared-source" },
    collection: { id: "land-registry" },
    boundaries: {
      sameOriginSnapshotVerified: true,
      sourceWasNotRefetchedAtRuntime: true,
      itemLevelReview: false,
      evidenceReceiptAvailable: false,
      cryptographicSignatureVerified: false,
      accessAuthorityGranted: false,
    },
  };
  const presentationBoundaries = {
    providerCall: false,
    storageWrite: false,
    catalogueMutation: false,
    externalStateChange: false,
    presentationEffect: "transient-local-selection",
  };
  const explorationResult = { schema: "trusted-govuk-discovery.evidence-exploration-result.v1", ok: true, boundaries: presentationBoundaries };
  const comparisonResult = {
    schema: "trusted-govuk-discovery.evidence-comparison-result.v1",
    ok: true,
    answerId: config.demonstrationInputs.reviewedAnswerId,
    claimIds: config.demonstrationInputs.reviewedClaimIds,
    boundaries: presentationBoundaries,
  };
  const rejectedResult = { schema: "trusted-govuk-discovery.error.v1", ok: false, error: { code: "invalid_search_request", message: "Unknown input field: personalContext." } };
  const comparisonDigest = digest(comparisonResult);
  return {
    schema: "trusted-govuk-discovery.supported-host-webmcp-capture.v2",
    capturedAt: "2026-08-31T10:00:00Z",
    page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    host: { name: "Example host", version: "1.2.3", capabilities: ["webmcp"] },
    capture: { method: "Native host tool discovery and invocation.", hostOwnedSurfaceObserved: false, hostRecordingCaptured: false, modelSelected: false, modelProviderCalled: false },
    artefacts: [{ path: "docs/competition/evidence/example-host-receipt.json", sha256: "b".repeat(64), kind: "raw-receipt", hostOwnedSurface: false, purpose: "Exact raw host receipt.", limitation: "This is machine evidence, not a host screenshot." }],
    discovery: { toolCount: 5, tools: expectedToolNames.map(tool) },
    calls: [
      call("search_government_knowledge", { query: "housing", collections: config.demonstrationInputs.collections, limit: 8 }, searchResult),
      call("get_resource_record", { recordId: demonstratedRecordId }, recordResult),
      call("show_provenance", { recordId: demonstratedRecordId }, provenanceResult),
      call("explore_answer_foundations", { answerId: config.demonstrationInputs.reviewedAnswerId, claimId: config.demonstrationInputs.reviewedClaimIds[0] }, explorationResult),
      call("compare_evidence_foundations", { answerId: config.demonstrationInputs.reviewedAnswerId, claimIds: config.demonstrationInputs.reviewedClaimIds }, comparisonResult),
    ],
    rejectedCall: {
      name: "search_government_knowledge",
      rejectedField: "personalContext",
      inputFieldNames: ["query", "personalContext"],
      result: rejectedResult,
      canonicalResultDigest: digest(rejectedResult),
    },
    finalPageObservation: {
      lastPresentationAction: "WebMCP: compare_evidence_foundations",
      selectedClaims: config.demonstrationInputs.reviewedClaimIds,
      comparisonRowCount: 11,
      displayResultDigest: comparisonDigest,
      canonicalCallResultDigest: comparisonDigest,
      digestParity: true,
    },
    limitations: ["One observed host and version does not establish support elsewhere."],
  };
}

test("supported-host v2 receipt binds all five tools to the exact four-source record", () => {
  const evidence = hostEvidenceFixture();
  const summary = validateSupportedHostEvidence(evidence, config, demonstratedRecordId);
  assert.equal(summary.demonstratedRecordId, demonstratedRecordId);
  assert.equal(summary.host, "Example host");

  const duplicateSource = hostEvidenceFixture();
  const search = duplicateSource.calls[0];
  search.result.results.push({ ...search.result.results[0], recordId: "govuk-discovery:federated:uk-living:5" });
  search.result.returned = 5;
  search.canonicalResultDigest = digest(search.result);
  assert.equal(validateSupportedHostEvidence(duplicateSource, config, demonstratedRecordId).fourSourceResultCount, 5);

  const missingSource = hostEvidenceFixture();
  missingSource.calls[0].result.results.pop();
  missingSource.calls[0].result.returned = 3;
  missingSource.calls[0].canonicalResultDigest = digest(missingSource.calls[0].result);
  assert.throws(() => validateSupportedHostEvidence(missingSource, config, demonstratedRecordId), /representative result from every/u);

  const legislation = hostEvidenceFixture();
  legislation.calls[0].result.results[0].canonicalHumanUrl = "https://legislation.gov.uk/example";
  legislation.calls[0].canonicalResultDigest = digest(legislation.calls[0].result);
  assert.throws(() => validateSupportedHostEvidence(legislation, config, demonstratedRecordId), /excluded legislation link/u);

  const wrongRecord = hostEvidenceFixture();
  assert.throws(() => validateSupportedHostEvidence(wrongRecord, config, recordIds.ons), /deployment-selected federated record/u);

  const retainedValue = hostEvidenceFixture();
  retainedValue.rejectedCall.input = { query: "housing", personalContext: "do not retain this" };
  assert.throws(() => validateSupportedHostEvidence(retainedValue, config, demonstratedRecordId), /unknown fields/u);

  const openSchema = hostEvidenceFixture();
  delete openSchema.discovery.tools[0].inputSchema.properties.collections;
  assert.throws(() => validateSupportedHostEvidence(openSchema, config, demonstratedRecordId), /six declared fields/u);

  const historical = hostEvidenceFixture();
  historical.schema = "trusted-govuk-discovery.supported-host-webmcp-capture.v1";
  assert.throws(() => validateSupportedHostEvidence(historical, config, demonstratedRecordId), /wrong schema/u);
});

function voiceOverFixture() {
  return {
    schema: "trusted-govuk-discovery.manual-voiceover-journey.v1",
    observedAt: "2026-08-31T10:00:00Z",
    page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    method: "manual-operator-driven",
    manual: true,
    assistiveTechnologyActuallyUsed: true,
    withoutWebMCP: true,
    noWcagConformanceClaim: true,
    screenReaderAudioCaptured: false,
    environment: { operatingSystem: "macOS", operatingSystemVersion: "26.5.2", operatingSystemBuild: "25F84", browser: "Safari", browserVersion: "26.5.2", screenReader: "VoiceOver", screenReaderVersion: "10" },
    overallStatus: "completed",
    journey: requiredVoiceOverJourneyIds.map((id) => ({
      id,
      result: "pass",
      observation: `Manual observation recorded for ${id}.`,
      ...(id === "source-link-role-and-destination" ? { details: { linkRole: "producer-declared-source", destinationHostname: "www.gov.uk", sourceAuthority: "Not independently established" } } : {}),
    })),
    limitations: ["One manual journey in one environment is not a WCAG conformance assessment."],
    media: {
      path: "output/demo-clips/v0.3.0-rc.1/06-voiceover.mov",
      sha256: "c".repeat(64),
      startSeconds: 0,
      endSeconds: 30,
      captureStartedAt: "2026-08-31T09:55:00Z",
      captureEndedAt: "2026-08-31T10:05:00Z",
      captureManifestPath: "output/voiceover-capture/capture-manifest.json",
      captureManifestSha256: "d".repeat(64),
    },
  };
}

test("VoiceOver gate requires exact candidate, manual use and bounded source-link evidence", () => {
  assert.equal(validateVoiceOverEvidence(voiceOverFixture(), config).overallStatus, "completed");
  const automated = voiceOverFixture();
  automated.manual = false;
  assert.throws(() => validateVoiceOverEvidence(automated, config), /genuine manual/u);
  const oldRun = voiceOverFixture();
  oldRun.page.pagesRunId = "1";
  assert.throws(() => validateVoiceOverEvidence(oldRun, config), /Pages run/u);
  const overclaim = voiceOverFixture();
  overclaim.journey.find(({ id }) => id === "source-link-role-and-destination").details.sourceAuthority = "Official";
  assert.throws(() => validateVoiceOverEvidence(overclaim, config), /not-independently-established/u);
});

test("VoiceOver media is bound to the scene and immutable capture manifest", () => {
  const scene = config.scenes.find(({ id }) => id === "voiceover");
  const evidence = voiceOverFixture();
  validateVoiceOverMediaBinding(evidence, scene, { sha256: "c".repeat(64), durationSeconds: 35 });
  evidence.media.sha256 = "e".repeat(64);
  assert.throws(() => validateVoiceOverMediaBinding(evidence, scene, { sha256: "c".repeat(64), durationSeconds: 35 }), /SHA-256/u);
});

function interactionCaptureFixture() {
  const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
  const mediaById = new Map(interactionScenes.map((scene, index) => [scene.id, { sha256: String(index + 1).repeat(64), durationSeconds: 32 }]));
  const observations = {
    overview: { reviewedRecordCount: 80, federatedSourceRecordCount: 58_655, federatedRecordCount: 58_652, federatedQuarantinedRecordCount: 3, reviewedTierLabel: "Reviewed evidence", federatedTierLabel: "Federated discovery" },
    "federated-search": {
      query: "housing", collections: config.demonstrationInputs.collections, limit: 8,
      resultIds: Object.values(recordIds), resultCollectionIds: Object.keys(recordIds),
      collectionStatuses: config.demonstrationInputs.collections.map((collectionId) => ({ collectionId, evidenceTier: "federated-source-snapshot", status: "ready" })),
      excludedHostnameResultCount: 0, canonicalResultDigest: "f".repeat(64),
    },
    "federated-record": { recordId: demonstratedRecordId, collectionId: "land-registry", evidenceTier: "federated-source-snapshot", sourceAuthority: "Not independently established", linkRole: "producer-declared-source", linkHostname: "www.gov.uk", itemLevelReview: false, evidenceReceiptAvailable: false, limitationsCount: 2, recordResultDigest: "a".repeat(64), provenanceResultDigest: "b".repeat(64) },
    "reviewed-foundations": { answerId: config.demonstrationInputs.reviewedAnswerId, claimIds: config.demonstrationInputs.reviewedClaimIds, foundationFacetLabels: ["Authority", "Assertion", "Verification", "Freshness", "Integrity", "Access", "Rights", "Coverage"], comparisonRowCount: 11, trustScoreShown: false },
    boundary: { sameOriginOnly: true, browserStorage: { local: 0, session: 0, cookies: "" }, modelProviderRequestCount: 0, officialApiRequestCount: 0, landRegistryMetadataOnly: true, standaloneLegislationCollection: false, standaloneLegislationPayload: false, standaloneLegislationIndex: false, legislationRuntimeRequestCount: 0, excludedHostnameResultLinkCount: 0, impactClaimsFramedAsHypotheses: true, remoteProviderDisclosureVisible: true },
  };
  return {
    interactionScenes,
    mediaById,
    evidence: {
      schema: "trusted-govuk-discovery.demo-live-interaction-capture.v2",
      capturedAt: "2026-08-31T10:00:00Z",
      page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
      deployment: { metadataUrl: `${config.productUrl}deployment.json`, metadataSha256: "9".repeat(64) },
      demonstration: { ...config.demonstrationInputs, federatedRecordId: demonstratedRecordId },
      captureMethod: "playwright-public-site-interaction",
      browser: { name: "Chromium", version: "1" },
      capturedAt: "2026-08-31T10:00:00Z",
      reviews: { privacy: "agent-reviewed-pass", branding: "agent-reviewed-pass", humanPublicationReview: "pending" },
      noBrowserChrome: true,
      audioCaptured: false,
      clips: interactionScenes.map((scene, index) => ({
        sceneId: scene.id,
        path: scene.media.path,
        sha256: String(index + 1).repeat(64),
        durationSeconds: 32,
        capturedAt: "2026-08-31T10:00:00Z",
        actions: scene.requiredActions,
        sourceUrl: config.productUrl,
        observation: observations[scene.id],
      })),
    },
  };
}

test("live interaction v2 receipt binds observed search, record, tiers and boundaries", () => {
  const fixture = interactionCaptureFixture();
  assert.deepEqual(validateInteractionCaptureEvidence(fixture.evidence, config, fixture.interactionScenes, fixture.mediaById), {
    clipCount: 5,
    captureMethod: "playwright-public-site-interaction",
    demonstratedRecordId,
    searchResultDigest: "f".repeat(64),
  });
  const missing = interactionCaptureFixture();
  missing.evidence.clips.find(({ sceneId }) => sceneId === "federated-search").observation.resultCollectionIds.pop();
  assert.throws(() => validateInteractionCaptureEvidence(missing.evidence, config, missing.interactionScenes, missing.mediaById), /do not align|every selected collection/u);
  const legislation = interactionCaptureFixture();
  legislation.evidence.clips.find(({ sceneId }) => sceneId === "boundary").observation.legislationRuntimeRequestCount = 1;
  assert.throws(() => validateInteractionCaptureEvidence(legislation.evidence, config, legislation.interactionScenes, legislation.mediaById), /legislation.gov.uk exclusion/u);
  const digestDrift = interactionCaptureFixture();
  digestDrift.evidence.clips[0].sha256 = "0".repeat(64);
  assert.throws(() => validateInteractionCaptureEvidence(digestDrift.evidence, config, digestDrift.interactionScenes, digestDrift.mediaById), /configured media/u);
  const historical = interactionCaptureFixture();
  historical.evidence.schema = "trusted-govuk-discovery.demo-live-interaction-capture.v1";
  assert.throws(() => validateInteractionCaptureEvidence(historical.evidence, config, historical.interactionScenes, historical.mediaById), /wrong schema/u);
});

test("supported-host clip receipt binds evidence, artefacts and rendered media", () => {
  const scene = config.scenes.find(({ id }) => id === "webmcp");
  const evidenceFile = { relativePath: scene.evidence, sha256: "1".repeat(64) };
  const artefactFiles = new Map([["docs/competition/evidence/raw.json", { sha256: "2".repeat(64) }]]);
  const media = { sha256: "3".repeat(64), durationSeconds: 40 };
  const receipt = {
    schema: "trusted-govuk-discovery.supported-host-webmcp-clip.v1",
    builtAt: "2026-08-31T10:00:00Z",
    page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    sourceEvidence: { path: evidenceFile.relativePath, sha256: evidenceFile.sha256 },
    sourceArtefacts: [{ path: "docs/competition/evidence/raw.json", sha256: "2".repeat(64) }],
    rendering: { kind: "receipt-reconstruction", hostRecordingEmbedded: false, hostOwnedSurfaceEmbedded: false, visibleLabel: "Receipt reconstruction — not a host recording" },
    media: { path: scene.media.path, sha256: media.sha256, durationSeconds: 40, startSeconds: 0, endSeconds: 40 },
  };
  assert.equal(validateHostMediaReceipt(receipt, config, scene, media, evidenceFile, artefactFiles).sourceArtefactCount, 1);
  receipt.media.sha256 = "4".repeat(64);
  assert.throws(() => validateHostMediaReceipt(receipt, config, scene, media, evidenceFile, artefactFiles), /path or SHA-256/u);
});

test("final video guard accepts 179.999 seconds and rejects 180 seconds", () => {
  const probe = (duration) => ({
    format: { duration: String(duration) },
    streams: [
      { codec_type: "video", codec_name: "h264", width: 1920, height: 1080, r_frame_rate: "30/1", pix_fmt: "yuv420p" },
      { codec_type: "audio", codec_name: "aac", sample_rate: "48000" },
      { codec_type: "subtitle", codec_name: "mov_text", tags: { language: "eng" } },
    ],
  });
  assert.equal(validateFinalVideo(probe(179.999)), 179.999);
  assert.throws(() => validateFinalVideo(probe(180)), /not under 180/u);
});
