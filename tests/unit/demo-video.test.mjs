import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  bindReleaseConfig,
  canonicalJson,
  demoReleaseEnvironment,
  expectedToolNames,
  personalAgentSceneContracts,
  requiredVoiceOverJourneyIds,
  validateConfig,
  validateAuthenticatedPersonalAgentSummary,
  validateFinalVideo,
  validateHostMediaReceipt,
  validateInteractionCaptureEvidence,
  validatePersonalAgentCaptureEvidence,
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
const rawConfig = validateConfig(JSON.parse(await readFile("docs/competition/demo-video-script-v0.4.0-rc.1.json", "utf8")));
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

test("v4 video script is an unbound nine-scene UK-English Evidence answer plan", () => {
  assert.equal(Object.hasOwn(rawConfig, "productCommit"), false);
  assert.equal(Object.hasOwn(rawConfig, "pagesRunId"), false);
  assert.equal(config.productCommit, environment.GOVUK_WEBMCP_DEMO_COMMIT);
  assert.equal(config.pagesRunId, environment.GOVUK_WEBMCP_DEMO_PAGES_RUN_ID);
  assert.equal(config.release, "v0.4.0-rc.1");
  assert.equal(config.language, "en-GB");
  assert.deepEqual(config.delivery, { maximumDurationSeconds: 180, audioRequired: true, captionsRequired: true, captionLanguage: "en-GB" });
  assert.equal(config.demonstrationInputs.query, "housing");
  assert.equal(config.demonstrationInputs.limit, 8);
  assert.deepEqual(config.demonstrationInputs.collections, ["uk-living", "ons", "government-apis", "land-registry"]);
  assert.deepEqual(config.scenes.map(({ id }) => id), ["evidence-answer", "present-evidence", "comparison-guide", "copilot-personal-ai", "webmcp", "technical-review", "ollama-local", "voiceover", "boundary"]);
  assert.equal(config.reviews.rights, "pending-human-review");
  assert.equal(config.reviews.personalAgentCapturePublication, "pending-capture-and-human-review");
  assert.equal(config.reviews.finalHumanPlayback, "pending");
  assert.equal(config.interactionCaptureReceipt, "docs/competition/evidence/demo-live-interaction-capture-v0.4.0-rc.1.json");
  assert.ok(config.scenes.every(({ media }) => media.path.startsWith("output/demo-clips/v0.4.0-rc.1/")));
  assert.equal(config.scenes.find(({ id }) => id === "webmcp").mediaReceipt, "docs/competition/evidence/supported-host-webmcp-clip-v0.4.0-rc.1.json");
  assert.deepEqual(config.scenes.filter(({ kind }) => kind === "personal-agent-capture").map(({ id, hostId, caseId, repetition, evidence }) => ({ id, hostId, caseId, repetition, evidence })), [
    { id: "copilot-personal-ai", hostId: "copilot-mcp-workspace", caseId: "US-09", repetition: 1, evidence: personalAgentSceneContracts["copilot-personal-ai"].evidencePath },
    { id: "ollama-local", hostId: "ollama-local", caseId: "US-09", repetition: 1, evidence: personalAgentSceneContracts["ollama-local"].evidencePath },
  ]);
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
  historical.schema = "trusted-govuk-discovery.demo-video-script.v3";
  assert.throws(() => validateConfig(historical), /wrong schema/u);
  const missingRightsReview = structuredClone(rawConfig);
  delete missingRightsReview.reviews.rights;
  assert.throws(() => validateConfig(missingRightsReview), /Demo reviews is missing fields: rights/u);
  const unknownReview = structuredClone(rawConfig);
  unknownReview.reviews.editorial = "passed";
  assert.throws(() => validateConfig(unknownReview), /Demo reviews has unknown fields: editorial/u);
  const relaxedDelivery = structuredClone(rawConfig);
  relaxedDelivery.delivery.maximumDurationSeconds = 180.001;
  assert.throws(() => validateConfig(relaxedDelivery), /under 180 seconds/u);
  const reconstructedPersonalAgentScene = structuredClone(rawConfig);
  reconstructedPersonalAgentScene.scenes.find(({ id }) => id === "copilot-personal-ai").kind = "receipt-visualisation";
  assert.throws(() => validateConfig(reconstructedPersonalAgentScene), /personal-agent|supported-host|media receipt/u);
  const ambiguousFutureReceipt = structuredClone(rawConfig);
  ambiguousFutureReceipt.scenes.find(({ id }) => id === "ollama-local").evidence = ".evals/personal-agent-media/latest.json";
  assert.throws(() => validateConfig(ambiguousFutureReceipt), /future clip or receipt path/u);
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
  const evidence = {
    schema: "govuk-webmcp.beginner-presentation.v1",
    resultKind: "resource-record",
    selectionId: demonstratedRecordId,
  };
  const presentationResult = {
    schema: "govuk-webmcp.present-resource-evidence-result.v1",
    ok: true,
    evidence,
    evidenceDigest: digest(evidence),
  };
  const rejectedResult = { schema: "trusted-govuk-discovery.error.v1", ok: false, error: { code: "invalid_search_request", message: "Unknown input field: personalContext." } };
  return {
    schema: "govuk-webmcp.supported-host-webmcp-capture.v3",
    capturedAt: "2026-08-31T10:00:00Z",
    page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    host: { name: "Example host", version: "1.2.3", capabilities: ["webmcp"] },
    capture: { method: "Native host tool discovery and invocation.", hostOwnedSurfaceObserved: false, hostRecordingCaptured: false, modelSelected: false, modelProviderCalled: false },
    artefacts: [{ path: "docs/competition/evidence/example-host-receipt.json", sha256: "b".repeat(64), kind: "raw-receipt", hostOwnedSurface: false, purpose: "Exact raw host receipt.", limitation: "This is machine evidence, not a host screenshot." }],
    discovery: { toolCount: 6, tools: expectedToolNames.map(tool) },
    calls: [
      call("search_government_knowledge", { query: "housing", collections: config.demonstrationInputs.collections, limit: 8 }, searchResult),
      call("get_resource_record", { recordId: demonstratedRecordId }, recordResult),
      call("show_provenance", { recordId: demonstratedRecordId }, provenanceResult),
      call("explore_answer_foundations", { answerId: config.demonstrationInputs.reviewedAnswerId, claimId: config.demonstrationInputs.reviewedClaimIds[0] }, explorationResult),
      call("compare_evidence_foundations", { answerId: config.demonstrationInputs.reviewedAnswerId, claimIds: config.demonstrationInputs.reviewedClaimIds }, comparisonResult),
      call("present_resource_evidence", { recordId: demonstratedRecordId }, presentationResult),
    ],
    rejectedCall: {
      name: "search_government_knowledge",
      rejectedField: "personalContext",
      inputFieldNames: ["query", "personalContext"],
      result: rejectedResult,
      canonicalResultDigest: digest(rejectedResult),
    },
    finalPageObservation: {
      lastPresentationAction: "WebMCP: present_resource_evidence",
      selectedRecordId: demonstratedRecordId,
      displayEvidenceDigest: presentationResult.evidenceDigest,
      toolEvidenceDigest: presentationResult.evidenceDigest,
      digestParity: true,
    },
    limitations: ["One observed host and version does not establish support elsewhere."],
  };
}

test("supported-host v3 receipt binds all six tools to one exact four-source record", () => {
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
  historical.schema = "trusted-govuk-discovery.supported-host-webmcp-capture.v2";
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
      path: "output/demo-clips/v0.4.0-rc.1/06-voiceover.mov",
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
    "evidence-answer": { activeView: "guided", heading: "Evidence answer", activity: "No AI action was presented to this page.", presentationState: "empty" },
    "present-evidence": { query: "housing", collections: config.demonstrationInputs.collections, limit: 8, selectedRecordId: demonstratedRecordId, resultKind: "resource-record", evidenceDigest: "f".repeat(64), sourceCount: 1, limitationCount: 2, routeView: "guided" },
    "comparison-guide": { selectedRecordId: demonstratedRecordId, evidenceDigest: "f".repeat(64), guideHeadings: ["From this page", "From your AI", "Check carefully"], sourceLinkCount: 1, limitationCount: 2 },
    "technical-review": { activeView: "technical", answerId: config.demonstrationInputs.reviewedAnswerId, claimIds: config.demonstrationInputs.reviewedClaimIds, comparisonRowCount: 11, expectedToolCount: 6, trustScoreShown: false, legacyRoutePreserved: true },
    boundary: { sameOriginOnly: true, browserStorage: { local: 0, session: 0, cookies: "" }, modelProviderRequestCount: 0, officialApiRequestCount: 0, landRegistryMetadataOnly: true, standaloneLegislationCollection: false, standaloneLegislationPayload: false, standaloneLegislationIndex: false, legislationRuntimeRequestCount: 0, excludedHostnameResultLinkCount: 0, impactClaimsFramedAsHypotheses: true, remoteProviderDisclosureVisible: true, expectedToolCount: 6, reviewedRecordCount: 80, federatedSourceRecordCount: 58_655, federatedRecordCount: 58_652, federatedQuarantinedRecordCount: 3 },
  };
  return {
    interactionScenes,
    mediaById,
    evidence: {
      schema: "govuk-webmcp.demo-live-interaction-capture.v3",
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

test("live interaction v3 receipt binds Evidence answer, Technical review and boundaries", () => {
  const fixture = interactionCaptureFixture();
  assert.deepEqual(validateInteractionCaptureEvidence(fixture.evidence, config, fixture.interactionScenes, fixture.mediaById), {
    clipCount: 5,
    captureMethod: "playwright-public-site-interaction",
    demonstratedRecordId,
    presentationDigest: "f".repeat(64),
  });
  const missing = interactionCaptureFixture();
  missing.evidence.clips.find(({ sceneId }) => sceneId === "comparison-guide").observation.guideHeadings.pop();
  assert.throws(() => validateInteractionCaptureEvidence(missing.evidence, config, missing.interactionScenes, missing.mediaById), /three plain-English perspectives/u);
  const legislation = interactionCaptureFixture();
  legislation.evidence.clips.find(({ sceneId }) => sceneId === "boundary").observation.legislationRuntimeRequestCount = 1;
  assert.throws(() => validateInteractionCaptureEvidence(legislation.evidence, config, legislation.interactionScenes, legislation.mediaById), /legislation.gov.uk exclusion/u);
  const digestDrift = interactionCaptureFixture();
  digestDrift.evidence.clips[0].sha256 = "0".repeat(64);
  assert.throws(() => validateInteractionCaptureEvidence(digestDrift.evidence, config, digestDrift.interactionScenes, digestDrift.mediaById), /configured media/u);
  const historical = interactionCaptureFixture();
  historical.evidence.schema = "trusted-govuk-discovery.demo-live-interaction-capture.v2";
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

const personalAgentStoryIds = Array.from({ length: 12 }, (_, index) => `US-${String(index + 1).padStart(2, "0")}`);

function selectedPersonalAgentRun(hostId, observedAt = "2026-09-01T10:00:00Z") {
  const cloud = hostId === "copilot-mcp-workspace";
  return {
    hostId,
    caseId: "US-09",
    repetition: 1,
    observedAt,
    hostIdentity: cloud
      ? { modelStatus: "not-disclosed", model: null, inventorySha256: null, executionBound: "not-observable" }
      : { modelStatus: "observed-exact", model: "ollama:gpt-oss:20b", inventorySha256: "17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7", executionBound: true },
    executionContext: {
      hostVersion: { status: "observed", value: cloud ? "Microsoft Copilot MCP Workspace observed" : "Ollama test; webmcp-evals 0.0.4" },
      browser: { status: "observed", product: cloud ? "Microsoft Edge" : "Google Chrome", version: "140.0.7339.101" },
      visibleMode: cloud ? "visible" : "headless",
      exposedTools: { status: "observed", names: expectedToolNames },
      share: cloud
        ? { status: "observed", url: "https://copilot.microsoft.com/shares/G6UPWiDJ2VK4RfGycoxdr" }
        : { status: "not-applicable", url: null },
      deployment: cloud
        ? { kind: "public-pages", url: config.productUrl, commitSha: config.productCommit, worktreeStatus: "not-applicable" }
        : { kind: "local-loopback", url: "http://127.0.0.1:4173/", commitSha: config.productCommit, worktreeStatus: "clean" },
      diagnostics: { status: "observed", browserConsoleErrors: [], runnerErrors: [] },
    },
    callTrace: {
      status: "observed",
      calls: [
        { ordinal: 1, name: "search_government_knowledge" },
        { ordinal: 2, name: "present_resource_evidence" },
      ],
    },
    pageObservation: {
      status: "observed",
      before: { renderedEvidence: null, evidenceDigest: null },
      after: { renderedEvidence: { selectionId: demonstratedRecordId }, evidenceDigest: "d".repeat(64) },
    },
    criteria: { toolSelection: "pass", deterministicExecution: "pass", pageParity: "pass", answerSafety: "pass" },
    answerReview: { status: "reviewed", outcome: "usable", reviewerClass: "human" },
  };
}

function personalAgentCaptureFixture(hostId) {
  const sceneId = hostId === "copilot-mcp-workspace" ? "copilot-personal-ai" : "ollama-local";
  const scene = config.scenes.find(({ id }) => id === sceneId);
  const contract = personalAgentSceneContracts[sceneId];
  const selected = selectedPersonalAgentRun(hostId);
  const runs = ["copilot-mcp-workspace", "ollama-local"].flatMap((matrixHostId) =>
    personalAgentStoryIds.flatMap((caseId) => [1, 2, 3].map((repetition) =>
      matrixHostId === hostId && caseId === "US-09" && repetition === 1
        ? selected
        : { hostId: matrixHostId, caseId, repetition })));
  const sourceCapture = {
    schema: "govuk-webmcp.personal-agent-evaluation-capture.v2",
    suiteId: "beginner-evidence-v1",
    caseSetSha256: "e".repeat(64),
    comparisonDesign: "observational",
    runs,
  };
  const sourceCaptureFile = {
    relativePath: ".evals/personal-agent-media/v0.4.0-rc.1/private-capture.json",
    sha256: "a".repeat(64),
  };
  const authenticatedSummaryFile = {
    relativePath: ".evals/personal-agent-media/v0.4.0-rc.1/authenticated-summary.json",
    sha256: "f".repeat(64),
  };
  const authenticatedSummaryBinding = { status: "authenticated", claimGatePassed: true, caseSetSha256: sourceCapture.caseSetSha256 };
  const liveReleaseFile = {
    relativePath: ".evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json",
    sha256: "b".repeat(64),
  };
  const liveRelease = {
    schema: "govuk-webmcp.live-pages-verification.v2",
    baseUrl: config.productUrl,
    commit: config.productCommit,
    runId: config.pagesRunId,
  };
  const media = { sha256: "c".repeat(64), durationSeconds: 35 };
  const receipt = {
    schema: "govuk-webmcp.personal-agent-video-capture.v1",
    capturedAt: selected.observedAt,
    release: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    host: { id: hostId, arrangement: contract.arrangement, product: contract.product },
    sourceEvaluation: {
      path: sourceCaptureFile.relativePath,
      sha256: sourceCaptureFile.sha256,
      schema: sourceCapture.schema,
      suiteId: sourceCapture.suiteId,
      caseSetSha256: sourceCapture.caseSetSha256,
      caseId: contract.caseId,
      repetition: contract.repetition,
      authenticatedSummaryPath: authenticatedSummaryFile.relativePath,
      authenticatedSummarySha256: authenticatedSummaryFile.sha256,
      claimGatePassed: authenticatedSummaryBinding.claimGatePassed,
    },
    liveRelease: { path: liveReleaseFile.relativePath, sha256: liveReleaseFile.sha256, schema: liveRelease.schema },
    capture: {
      method: contract.captureMethod,
      genuineScreenRecording: true,
      hostSurfaceVisible: true,
      siteToolsVisible: true,
      siteToolInvocationVisible: true,
      evidenceAnswerUpdateVisible: true,
      reconstructed: false,
      sourceAudioIncluded: false,
      browserChromeIncluded: hostId === "copilot-mcp-workspace",
      accountEmailVisible: false,
      avatarVisible: false,
      unrelatedBrowserContentVisible: false,
      redactionsApplied: hostId === "copilot-mcp-workspace" ? ["account-email", "profile-image", "unrelated-browser-content"] : [],
      callTraceStatus: selected.callTrace.status,
      toolCallNames: selected.callTrace.calls.map(({ name }) => name),
      selectedRecordId: demonstratedRecordId,
      evidenceDigest: selected.pageObservation.after.evidenceDigest,
    },
    reviews: {
      privacy: "human-reviewed-redaction-pass",
      branding: "human-reviewed-contextual-use-pass",
      content: "owner-reviewed-pass",
      reviewerClass: "owner-human",
      reviewedAt: "2026-09-01T10:10:00Z",
    },
    media: {
      path: scene.media.path,
      sha256: media.sha256,
      durationSeconds: media.durationSeconds,
      startSeconds: scene.media.startSeconds,
      endSeconds: 30,
      captureStartedAt: "2026-09-01T09:55:00Z",
      captureEndedAt: "2026-09-01T10:05:00Z",
    },
    limitations: ["This is an observational host comparison and does not establish a causal model effect."],
  };
  return { receipt, scene, media, sourceCaptureFile, sourceCapture, authenticatedSummaryFile, authenticatedSummaryBinding, liveReleaseFile, liveRelease };
}

function validatePersonalAgentFixture(fixture) {
  return validatePersonalAgentCaptureEvidence(
    fixture.receipt,
    config,
    fixture.scene,
    fixture.media,
    fixture.sourceCaptureFile,
    fixture.sourceCapture,
    fixture.authenticatedSummaryFile,
    fixture.authenticatedSummaryBinding,
    fixture.liveReleaseFile,
    fixture.liveRelease,
  );
}

function personalAgentSummaryFixture() {
  const structural = {
    schema: "govuk-webmcp.personal-agent-evaluation-summary.v2",
    suiteId: "beginner-evidence-v1",
    caseSetSha256: "e".repeat(64),
    comparisonDesign: "observational",
    causalClaimSupported: false,
    evidenceStatus: "partial",
    plannedRunCount: 72,
    observedRunCount: 72,
    missingRunCount: 0,
    missingRunKeys: [],
    matrixComplete: true,
    observationWindow: { earliest: "2026-09-01T10:00:00.000Z", latest: "2026-09-01T11:00:00.000Z" },
    hosts: [],
    liveReleaseBinding: {
      status: "structurally-valid",
      repository: "chris-page-gov/govuk-webmcp",
      baseUrl: config.productUrl,
      commit: config.productCommit,
      runId: config.pagesRunId,
      artifact: { id: 1, apiDigest: `sha256:${"1".repeat(64)}`, tarSha256: "2".repeat(64) },
      fileCount: 1,
      byteCount: 1,
      manifestSha256: "3".repeat(64),
      boundRunCount: 72,
      unboundRunCount: 0,
    },
    executionContext: { complete: 72, incomplete: 0, missing: 0 },
    criteria: Object.fromEntries(["toolSelection", "deterministicExecution", "pageParity", "answerSafety"].map((criterion) => [criterion, { pass: 72, fail: 0, "not-observable": 0, "not-reviewed": 0, missing: 0 }])),
    answerOutcomes: { usable: 72, revise: 0, unsafe: 0, "not-reviewed": 0, missing: 0 },
    reviewerClasses: { agent: 0, human: 72, "domain-specialist": 0, "not-reviewed": 0, missing: 0 },
    unsafeCategoryCounts: {},
    privacyChecks: { toolArguments: { pass: 6, fail: 0, "not-observable": 0, missing: 0 }, publicSummary: { pass: 1, fail: 0 } },
    claimGatePassed: false,
  };
  const authenticated = structuredClone(structural);
  authenticated.liveReleaseBinding.status = "authenticated";
  authenticated.evidenceStatus = "complete";
  authenticated.claimGatePassed = true;
  const sourceCapture = { caseSetSha256: structural.caseSetSha256 };
  const liveRelease = {
    repository: structural.liveReleaseBinding.repository,
    baseUrl: config.productUrl,
    commit: config.productCommit,
    runId: config.pagesRunId,
    manifestSha256: structural.liveReleaseBinding.manifestSha256,
  };
  return { authenticated, structural, sourceCapture, liveRelease };
}

test("media admission binds an earlier authenticated summary without inspecting current checkout state", () => {
  const fixture = personalAgentSummaryFixture();
  assert.deepEqual(validateAuthenticatedPersonalAgentSummary(fixture.authenticated, fixture.structural, config, fixture.sourceCapture, fixture.liveRelease), {
    status: "authenticated",
    claimGatePassed: true,
    caseSetSha256: fixture.sourceCapture.caseSetSha256,
  });
  const overstated = personalAgentSummaryFixture();
  overstated.structural.criteria.toolSelection["not-observable"] = 1;
  assert.throws(() => validateAuthenticatedPersonalAgentSummary(overstated.authenticated, overstated.structural, config, overstated.sourceCapture, overstated.liveRelease), /fresh structural replay/u);
});

test("personal-agent media requires genuine release-bound Copilot and Ollama captures", () => {
  const copilot = personalAgentCaptureFixture("copilot-mcp-workspace");
  assert.deepEqual(validatePersonalAgentFixture(copilot), {
    hostId: "copilot-mcp-workspace",
    caseId: "US-09",
    repetition: 1,
    callTraceStatus: "observed",
    toolCallNames: ["search_government_knowledge", "present_resource_evidence"],
    selectionId: demonstratedRecordId,
    evidenceDigest: "d".repeat(64),
    evaluationClaimGatePassed: true,
    genuineScreenRecording: true,
    clipLevelHumanReviewsPassed: true,
  });

  const ollama = personalAgentCaptureFixture("ollama-local");
  assert.equal(validatePersonalAgentFixture(ollama).hostId, "ollama-local");

  const hiddenCopilotTrace = personalAgentCaptureFixture("copilot-mcp-workspace");
  const hiddenRun = hiddenCopilotTrace.sourceCapture.runs.find(({ hostId, caseId, repetition }) => hostId === "copilot-mcp-workspace" && caseId === "US-09" && repetition === 1);
  hiddenRun.callTrace = { status: "not-observable", calls: null };
  hiddenRun.criteria.toolSelection = "not-observable";
  hiddenCopilotTrace.authenticatedSummaryBinding.claimGatePassed = false;
  hiddenCopilotTrace.receipt.sourceEvaluation.claimGatePassed = false;
  hiddenCopilotTrace.receipt.capture.callTraceStatus = "not-observable";
  hiddenCopilotTrace.receipt.capture.toolCallNames = null;
  hiddenCopilotTrace.receipt.limitations.push("The exact Copilot call trace was not observable in this host surface.");
  hiddenCopilotTrace.receipt.limitations.push("The authenticated evaluation claim gate did not pass because tool selection was not observable.");
  assert.equal(validatePersonalAgentFixture(hiddenCopilotTrace).callTraceStatus, "not-observable");
});

test("personal-agent media fails closed on reconstruction, identity, digest and review drift", () => {
  const reconstructed = personalAgentCaptureFixture("copilot-mcp-workspace");
  reconstructed.receipt.capture.reconstructed = true;
  assert.throws(() => validatePersonalAgentFixture(reconstructed), /genuine visible recording/u);

  const wrongEdge = personalAgentCaptureFixture("copilot-mcp-workspace");
  wrongEdge.sourceCapture.runs.find(({ hostId, caseId, repetition }) => hostId === "copilot-mcp-workspace" && caseId === "US-09" && repetition === 1).executionContext.browser.product = "Google Chrome";
  assert.throws(() => validatePersonalAgentFixture(wrongEdge), /Microsoft Edge MCP Workspace/u);

  const wrongModel = personalAgentCaptureFixture("ollama-local");
  wrongModel.sourceCapture.runs.find(({ hostId, caseId, repetition }) => hostId === "ollama-local" && caseId === "US-09" && repetition === 1).hostIdentity.inventorySha256 = "0".repeat(64);
  assert.throws(() => validatePersonalAgentFixture(wrongModel), /exact pinned local model/u);

  const privateDigestDrift = personalAgentCaptureFixture("ollama-local");
  privateDigestDrift.receipt.sourceEvaluation.sha256 = "0".repeat(64);
  assert.throws(() => validatePersonalAgentFixture(privateDigestDrift), /exact private evaluation bytes/u);

  const pendingHumanReview = personalAgentCaptureFixture("copilot-mcp-workspace");
  pendingHumanReview.receipt.reviews.content = "pending";
  assert.throws(() => validatePersonalAgentFixture(pendingHumanReview), /human review gate/u);

  const visibleAvatar = personalAgentCaptureFixture("copilot-mcp-workspace");
  visibleAvatar.receipt.capture.avatarVisible = true;
  assert.throws(() => validatePersonalAgentFixture(visibleAvatar), /account email, avatar/u);
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
  const noAudio = probe(120);
  noAudio.streams = noAudio.streams.filter(({ codec_type }) => codec_type !== "audio");
  assert.throws(() => validateFinalVideo(noAudio), /Final audio/u);
  const noCaptions = probe(120);
  noCaptions.streams = noCaptions.streams.filter(({ codec_type }) => codec_type !== "subtitle");
  assert.throws(() => validateFinalVideo(noCaptions), /caption track/u);
});
