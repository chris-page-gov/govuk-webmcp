import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

import {
  authenticateFinalVideoPersonalAgentSummary,
  bindReleaseConfig,
  canonicalJson,
  demoReleaseEnvironment,
  describePrivateInputPublication,
  expectedToolNames,
  ollamaDiagnosticSceneContract,
  personalAgentSceneContracts,
  requiredVoiceOverCaptureLimitations,
  requiredVoiceOverJourneyIds,
  supportedHostCandidateReleaseContract,
  validateConfig,
  validateCrossReceiptPresentationParity,
  validateAuthenticatedPersonalAgentSummary,
  validateFinalVideo,
  validateHostMediaReceipt,
  validateInteractionCaptureEvidence,
  validateOllamaDiagnosticClipReceipt,
  validateOllamaDiagnosticEvidence,
  validatePersonalAgentCaptureEvidence,
  validatePersonalAgentObservationClipReceipt,
  validatePersonalAgentObservationEvidence,
  validateSupportedHostDeploymentObservation,
  validateSupportedHostEvidence as validateSupportedHostEvidenceForDeployment,
  validateSupportedHostLiveReceiptPair,
  validateSupportedHostRawReceipt,
  validateSupportedHostReviewedArtefact as validateSupportedHostReviewedArtefactForRelease,
  validateVoiceOverEvidence,
  validateVoiceOverCaptureManifest,
  validateVoiceOverFrameFile,
  validateVoiceOverMediaBinding,
  verifyDemoDeployment,
  wrapCaption,
} from "../../scripts/build-demo-video.mjs";
import {
  ollamaDiagnosticPageHtml,
  resolveOllamaClipRepositoryPath,
} from "../../scripts/build-ollama-diagnostic-clip.mjs";
import {
  resolveHostClipRepositoryPath,
} from "../../scripts/build-host-evidence-clip.mjs";
import {
  authenticatePersonalAgentComparisonEvidence,
  personalAgentComparisonPageHtml,
  resolvePersonalAgentComparisonClipPath,
} from "../../scripts/build-personal-agent-comparison-clip.mjs";
import {
  resolveLiveCaptureRepositoryPath,
  waitForRenderedSearchResult,
} from "../../scripts/capture-live-demo-clips.mjs";
import { assertCanonicalRepositoryRelativePath } from "../../scripts/lib/repository-relative-path.mjs";
import {
  RELEASE_EVIDENCE_PATHS,
  RELEASE_VOICEOVER_FRAME_PATHS,
} from "../../scripts/lib/release-evidence-paths.mjs";
import { TOOL_TITLES } from "../../dist/src/webmcp-tools.js";
import {
  CAPTURE_SCHEMA,
  authenticateEvaluationReleaseReceipt,
  disposeEvaluationReleaseReceipt,
} from "../../scripts/verify-personal-agent-evals.mjs";
import { loadAndValidateCaseSet } from "../../scripts/prepare-personal-agent-evals.mjs";
import {
  authenticateLivePagesReceipt,
  disposeAuthenticatedLivePagesReceipt,
  isAuthenticatedLivePagesReceipt,
} from "../../scripts/verify-live-pages-artifact.mjs";
import {
  assertSupportedHostDemoPlan,
  buildSupportedHostEvidence,
  FINAL_PAGE_EVALUATION_FUNCTION,
  mapChromeToolDefinition,
  parseEvaluateScriptResult,
  SUPPORTED_HOST_DEMONSTRATION_INPUTS,
  SUPPORTED_HOST_EXPECTED_CALLS,
  SUPPORTED_HOST_CAPTURE_LIMITATIONS,
  SUPPORTED_HOST_REVIEWED_LIMITATIONS,
  validateCapturedPageObservation,
} from "../../scripts/lib/chrome-devtools-supported-host-evidence.mjs";

const environment = {
  [demoReleaseEnvironment.productCommit]: "a4d2db44e60024c3eadbdb2b1722153ce19dff4c",
  [demoReleaseEnvironment.pagesRunId]: "33657069203",
};
const rawConfig = validateConfig(JSON.parse(await readFile("docs/competition/demo-video-script-v0.4.0-rc.1.json", "utf8")));
const config = bindReleaseConfig(rawConfig, environment);
const releasedSupportedHostPath = "docs/competition/evidence/supported-host-webmcp-capture-v0.4.0-rc.1.json";
const releasedSupportedHostBytes = await readFile(releasedSupportedHostPath);
const releasedSupportedHostEvidence = JSON.parse(releasedSupportedHostBytes.toString("utf8"));
const releasedPersonalAgentObservation = JSON.parse(await readFile("docs/competition/evidence/personal-agent-comparison-v0.4.0-rc.1.json", "utf8"));
const releasedPrivateAuthenticatedSummary = structuredClone(releasedPersonalAgentObservation);
const releasedPersonalAgentObservationBytes = Buffer.from(`${JSON.stringify(releasedPersonalAgentObservation, null, 2)}\n`);
const releasedPersonalAgentObservationClipReceipt = JSON.parse(await readFile("docs/competition/evidence/personal-agent-comparison-clip-v0.4.0-rc.1.json", "utf8"));
const releasedRawChromePath = ".evals/chrome-devtools-mcp-public.json";
const releasedReviewedChromePath = "docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json";
const releasedReviewedChromeBytes = await readFile(releasedReviewedChromePath);
const releasedReviewedChrome = JSON.parse(releasedReviewedChromeBytes.toString("utf8"));
const releasedRawChrome = {
  schema: supportedHostCandidateReleaseContract.rawCaptureSchema,
  observedAt: releasedReviewedChrome.observedAt,
  target: structuredClone(releasedReviewedChrome.target),
  deploymentChecks: structuredClone(releasedReviewedChrome.deploymentChecks),
  environment: structuredClone(releasedReviewedChrome.environment),
  discovery: {
    command: "list_webmcp_tools",
    pageId: 2,
    toolCount: releasedReviewedChrome.discovery.toolCount,
    tools: structuredClone(releasedReviewedChrome.discovery.tools),
  },
  calls: releasedReviewedChrome.calls.map((call) => ({
    command: "execute_webmcp_tool",
    pageId: 2,
    ...structuredClone(call),
  })),
  finalPageObservation: {
    command: "evaluate_script",
    pageId: 2,
    ...structuredClone(releasedSupportedHostEvidence.finalPageObservation),
  },
  rejectedCall: {
    command: "execute_webmcp_tool",
    pageId: 2,
    toolName: releasedReviewedChrome.rejectedCall.toolName,
    input: {
      query: "birth",
      personalContext: "synthetic context that the page contract must reject",
    },
    status: releasedReviewedChrome.rejectedCall.status,
    output: structuredClone(releasedReviewedChrome.rejectedCall.output),
    canonicalOutputSha256: releasedReviewedChrome.rejectedCall.canonicalOutputSha256,
  },
  console: {
    command: "list_console_messages",
    ...structuredClone(releasedReviewedChrome.console),
  },
  boundaries: structuredClone(releasedReviewedChrome.boundaries),
  limitations: [
    "This public-page capture binds discovery and execution to the validated deployment metadata returned at capture time; it does not independently compare every live byte with the Pages artefact.",
    "Chrome DevTools MCP execution does not measure whether a model chooses the right tool.",
    "The receipt contains source-derived tool output and must be reviewed before admission to public evidence.",
  ],
};
const releasedRawChromeBytes = Buffer.from(`${JSON.stringify(releasedRawChrome, null, 2)}\n`);
const releasedLiveVerificationPath = "docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json";
const releasedLiveVerificationBytes = await readFile(releasedLiveVerificationPath);
const releasedLiveVerification = JSON.parse(releasedLiveVerificationBytes.toString("utf8"));
const authenticatedReleasedLiveVerification = await authenticateLivePagesReceipt(
  releasedLiveVerification,
  async () => ({ receipt: structuredClone(releasedLiveVerification) }),
);
const releasedInteractionCapture = JSON.parse(await readFile("docs/competition/evidence/demo-live-interaction-capture-v0.4.0-rc.1.json", "utf8"));
const releasedHostClipReceipt = JSON.parse(await readFile("docs/competition/evidence/supported-host-webmcp-clip-v0.4.0-rc.1.json", "utf8"));
const recordIds = {
  "uk-living": "govuk-discovery:federated:uk-living:1",
  ons: "govuk-discovery:federated:ons:2",
  "government-apis": "govuk-discovery:federated:government-apis:3",
  "land-registry": "govuk-discovery:federated:land-registry:4",
};
const demonstratedRecordId = releasedSupportedHostEvidence.calls.find(({ name }) => name === "get_resource_record").input.recordId;

function jsonFile(relativePath, parsed, { bytes = Buffer.from(`${JSON.stringify(parsed, null, 2)}\n`), mode = 0o600 } = {}) {
  return {
    relativePath,
    bytes,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: bytes.byteLength,
    mode,
  };
}

function rawReceiptFor(evidence, reviewed) {
  const raw = structuredClone(releasedRawChrome);
  raw.schema = supportedHostCandidateReleaseContract.rawCaptureSchema;
  raw.observedAt = reviewed.observedAt;
  raw.target = structuredClone(reviewed.target);
  raw.deploymentChecks = structuredClone(reviewed.deploymentChecks);
  raw.environment = structuredClone(reviewed.environment);
  raw.finalPageObservation = {
    command: "evaluate_script",
    pageId: 2,
    ...structuredClone(evidence.finalPageObservation),
  };
  return raw;
}

function releaseContextFor(reviewed, evidence, context) {
  const publicLiveVerification = structuredClone(context.liveVerification);
  const publicBytes = context.liveVerificationFile?.bytes
    ?? (context.liveVerification === releasedLiveVerification ? releasedLiveVerificationBytes : Buffer.from(`${JSON.stringify(publicLiveVerification, null, 2)}\n`));
  const publicLiveVerificationFile = {
    ...jsonFile("docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json", publicLiveVerification, { bytes: publicBytes, mode: 0o644 }),
    ...context.liveVerificationFile,
    bytes: publicBytes,
    sizeBytes: publicBytes.byteLength,
    sha256: createHash("sha256").update(publicBytes).digest("hex"),
  };
  const privateLiveVerification = structuredClone(context.privateLiveVerification ?? publicLiveVerification);
  const privateLiveVerificationFile = context.privateLiveVerificationFile
    ?? jsonFile(".evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json", privateLiveVerification);
  const rawReceipt = context.rawReceipt ?? releasedRawChrome;
  const rawReceiptFile = context.rawReceiptFile ?? jsonFile(releasedRawChromePath, rawReceipt, { bytes: releasedRawChromeBytes });
  return {
    config: context.config ?? config,
    deployment: context.deployment,
    liveVerificationFile: publicLiveVerificationFile,
    liveVerification: publicLiveVerification,
    privateLiveVerificationFile,
    privateLiveVerification,
    authenticatedLiveReceipt: context.authenticatedLiveReceipt ?? authenticatedReleasedLiveVerification,
    rawReceiptFile,
    rawReceipt,
  };
}

function validateSupportedHostEvidence(evidence, selectedConfig, expectedRecordId, deployment = releasedInteractionCapture.deployment) {
  return validateSupportedHostEvidenceForDeployment(evidence, selectedConfig, expectedRecordId, deployment);
}

function validateSupportedHostReviewedArtefact(reviewed, evidence, reviewedFile, context) {
  return validateSupportedHostReviewedArtefactForRelease(reviewed, evidence, reviewedFile, releaseContextFor(reviewed, evidence, context));
}

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

function redigestCall(call) {
  call.canonicalResultDigest = digest(call.result);
}

function redigestPresentation(evidence) {
  const presentation = evidence.calls.find(({ name }) => name === "present_resource_evidence");
  presentation.result.evidenceDigest = digest(presentation.result.evidence);
  redigestCall(presentation);
  evidence.finalPageObservation.displayEvidenceDigest = presentation.result.evidenceDigest;
  evidence.finalPageObservation.toolEvidenceDigest = presentation.result.evidenceDigest;
}

function supportedHostDeploymentChecks(observedAt, deployment = releasedInteractionCapture.deployment, selectedConfig = config) {
  return ["initial", "after-page-load", "after-execution"].map((label) => ({
    label,
    observedAt,
    metadataSha256: deployment.metadataSha256,
    commit: selectedConfig.productCommit,
    runId: selectedConfig.pagesRunId,
  }));
}

test("v4 video script is an unbound eight-scene UK-English Evidence answer plan with an honest host comparison", () => {
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
  assert.deepEqual(config.scenes.map(({ id }) => id), ["evidence-answer", "present-evidence", "comparison-guide", "personal-agent-comparison", "webmcp", "technical-review", "voiceover", "boundary"]);
  assert.equal(config.reviews.rights, "pending-human-review");
  assert.equal(config.reviews.personalAgentCapturePublication, "not-included-unobservable");
  assert.equal(config.reviews.finalHumanPlayback, "pending");
  assert.equal(config.interactionCaptureReceipt, "docs/competition/evidence/demo-live-interaction-capture-v0.4.0-rc.1.json");
  assert.ok(config.scenes.every(({ media }) => media.path.startsWith("output/demo-clips/v0.4.0-rc.1/")));
  assert.equal(config.scenes.find(({ id }) => id === "webmcp").mediaReceipt, "docs/competition/evidence/supported-host-webmcp-clip-v0.4.0-rc.1.json");
  assert.deepEqual(config.scenes.filter(({ kind }) => kind === "personal-agent-capture"), []);
  const personalAgentObservation = config.scenes.find(({ id }) => id === "personal-agent-comparison");
  assert.equal(personalAgentObservation.kind, "evaluation-observation");
  assert.equal(personalAgentObservation.evidence, "docs/competition/evidence/personal-agent-comparison-v0.4.0-rc.1.json");
  assert.equal(personalAgentObservation.mediaReceipt, "docs/competition/evidence/personal-agent-comparison-clip-v0.4.0-rc.1.json");
  assert.match(personalAgentObservation.cues.join(" "), /not observable/iu);
  assert.deepEqual(config.scenes.filter(({ kind }) => kind === "evaluation-diagnostic"), []);
  for (const scene of config.scenes) {
    for (const cue of scene.cues) {
      const lines = wrapCaption(cue).split("\n");
      assert.ok(lines.length <= 2);
      assert.ok(lines.every((line) => line.length <= 42));
    }
  }
});

test("personal-agent observation retains the complete but non-claimable release-bound matrix", () => {
  assert.deepEqual(validatePersonalAgentObservationEvidence(releasedPersonalAgentObservation, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary), {
    comparisonDesign: "observational",
    observedRunCount: 72,
    claimGatePassed: false,
    causalClaimSupported: false,
    copilot: { observedRunCount: 36, callTraceStatus: "not-observable", pageParityStatus: "not-observable" },
    ollama: { observedRunCount: 36, toolSelectionPass: 6, toolSelectionFail: 30, runnerErrorRuns: 3 },
  });

  const inventedCopilotTools = structuredClone(releasedPersonalAgentObservation);
  inventedCopilotTools.hosts.find(({ hostId }) => hostId === "copilot-mcp-workspace").exposedTools = { observed: 36, "not-observable": 0 };
  assert.throws(() => validatePersonalAgentObservationEvidence(inventedCopilotTools, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary), /Copilot tool observability boundary/u);

  const unsafePublication = structuredClone(releasedPersonalAgentObservation);
  unsafePublication.privateLink = "https://copilot.microsoft.com/shares/PRIVATE";
  assert.throws(() => validatePersonalAgentObservationEvidence(unsafePublication, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary), /unknown fields|private account or share-link/u);

  const nestedPrivatePublication = structuredClone(releasedPersonalAgentObservation);
  nestedPrivatePublication.hosts[0].browsers[0].accountEmail = "private@example.invalid";
  assert.throws(
    () => validatePersonalAgentObservationEvidence(nestedPrivatePublication, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary),
    /Copilot browser has unknown fields: accountEmail/u,
  );

  for (const mutate of [
    (summary) => { summary.liveReleaseBinding.artifact.id += 1; },
    (summary) => { summary.liveReleaseBinding.fileCount += 1; },
    (summary) => { summary.liveReleaseBinding.byteCount += 1; },
    (summary) => { summary.liveReleaseBinding.manifestSha256 = "f".repeat(64); },
  ]) {
    const forgedReleaseBinding = structuredClone(releasedPersonalAgentObservation);
    mutate(forgedReleaseBinding);
    assert.throws(
      () => validatePersonalAgentObservationEvidence(forgedReleaseBinding, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary),
      /does not exactly match the freshly authenticated live release/u,
    );
  }
  assert.throws(
    () => validatePersonalAgentObservationEvidence(releasedPersonalAgentObservation, config, structuredClone(authenticatedReleasedLiveVerification), releasedPrivateAuthenticatedSummary),
    /requires a freshly authenticated live Pages receipt/u,
  );
  assert.throws(
    () => validatePersonalAgentObservationEvidence(releasedPersonalAgentObservation, config, authenticatedReleasedLiveVerification),
    /requires the independently replayed private authenticated summary/u,
  );
  const driftedPrivateSummary = structuredClone(releasedPrivateAuthenticatedSummary);
  driftedPrivateSummary.answerOutcomes["not-reviewed"] = 71;
  driftedPrivateSummary.answerOutcomes.missing = 1;
  assert.throws(
    () => validatePersonalAgentObservationEvidence(releasedPersonalAgentObservation, config, authenticatedReleasedLiveVerification, driftedPrivateSummary),
    /does not exactly match the independently replayed private authenticated summary/u,
  );

  const duplicateCopilotCase = structuredClone(releasedPersonalAgentObservation);
  duplicateCopilotCase.hosts.find(({ hostId }) => hostId === "copilot-mcp-workspace").caseEvidence[1].caseId = "US-01";
  assert.throws(
    () => validatePersonalAgentObservationEvidence(duplicateCopilotCase, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary),
    /exact ordered unique US-01 to US-12/u,
  );

  const missingOllamaCase = structuredClone(releasedPersonalAgentObservation);
  missingOllamaCase.hosts.find(({ hostId }) => hostId === "ollama-local").caseEvidence.pop();
  assert.throws(
    () => validatePersonalAgentObservationEvidence(missingOllamaCase, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary),
    /exact ordered unique US-01 to US-12/u,
  );

  const aggregateDrift = structuredClone(releasedPersonalAgentObservation);
  aggregateDrift.hosts.find(({ hostId }) => hostId === "ollama-local").caseEvidence[0].observedRunCount = 2;
  assert.throws(
    () => validatePersonalAgentObservationEvidence(aggregateDrift, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary),
    /must retain exactly three observations|does not reconcile/u,
  );
});

test("personal-agent comparison clip visibly retains both hosts and the non-claimable boundary", () => {
  const scene = config.scenes.find(({ id }) => id === "personal-agent-comparison");
  const evidenceFile = {
    relativePath: scene.evidence,
    sha256: createHash("sha256").update(releasedPersonalAgentObservationBytes).digest("hex"),
    parsed: releasedPersonalAgentObservation,
  };
  const observation = validatePersonalAgentObservationEvidence(releasedPersonalAgentObservation, config, authenticatedReleasedLiveVerification, releasedPrivateAuthenticatedSummary);
  const media = {
    sha256: releasedPersonalAgentObservationClipReceipt.media.sha256,
    durationSeconds: releasedPersonalAgentObservationClipReceipt.media.durationSeconds,
  };
  assert.deepEqual(validatePersonalAgentObservationClipReceipt(releasedPersonalAgentObservationClipReceipt, config, scene, media, evidenceFile, observation), {
    kind: "privacy-minimised-observation-visualisation",
    durationSeconds: releasedPersonalAgentObservationClipReceipt.media.durationSeconds,
    observedRunCount: 72,
    claimGatePassed: false,
  });
  const html = personalAgentComparisonPageHtml(releasedPersonalAgentObservation);
  assert.match(html, /Personal Microsoft Copilot/u);
  assert.match(html, /Pinned local Ollama model/u);
  assert.match(html, /No Site tool invocation or Evidence answer update was observed/u);
  assert.match(html, /6 passed · 30 failed/u);
  assert.match(html, /not a host recording/u);

  const overstated = structuredClone(releasedPersonalAgentObservationClipReceipt);
  overstated.rendering.hostRecordingEmbedded = true;
  assert.throws(() => validatePersonalAgentObservationClipReceipt(overstated, config, scene, media, evidenceFile, observation), /overstates its evidence/u);
});

test("standalone personal-agent comparison authenticates the canonical private pair before rendering", async () => {
  const sourceCapture = { caseSetSha256: releasedPersonalAgentObservation.caseSetSha256 };
  let authenticateLiveCalls = 0;
  let replayCalls = 0;
  let borrowedEvaluationCalls = 0;
  let disposeCalls = 0;
  const replayedSummaries = [];
  const dependencies = {
    authenticateLiveImplementation: async (candidate) => {
      authenticateLiveCalls += 1;
      assert.equal(candidate.manifestSha256, releasedLiveVerification.manifestSha256);
      return authenticatedReleasedLiveVerification;
    },
    replaySummaryImplementation: async (input, options) => {
      replayCalls += 1;
      assert.equal(input.sourceCapture, sourceCapture);
      replayedSummaries.push(input.suppliedSummary);
      assert.equal(input.suppliedSummary.caseSetSha256, releasedPrivateAuthenticatedSummary.caseSetSha256);
      assert.equal(input.preRunLiveRelease.manifestSha256, releasedLiveVerification.manifestSha256);
      const borrowed = await options.authenticateImplementation(input.preRunLiveRelease, { checkoutPolicy: "clean-evidence-descendant" });
      assert.equal(borrowed, authenticatedReleasedLiveVerification);
      return { status: "authenticated", caseSetSha256: input.suppliedSummary.caseSetSha256 };
    },
    authenticateEvaluationImplementation: async (candidate, options) => {
      borrowedEvaluationCalls += 1;
      assert.equal(options.checkoutPolicy, "clean-evidence-descendant");
      assert.equal(options.liveReceiptLease, "borrowed");
      return options.authenticateImplementation(candidate);
    },
    disposeLiveImplementation: async (receipt) => {
      disposeCalls += 1;
      assert.equal(receipt, authenticatedReleasedLiveVerification);
    },
  };
  assert.deepEqual(await authenticatePersonalAgentComparisonEvidence({
    config,
    publicSummary: releasedPersonalAgentObservation,
    sourceCapture,
    authenticatedPrivateSummary: releasedPrivateAuthenticatedSummary,
    privateLiveRelease: releasedLiveVerification,
    loadedCaseSet: { fixture: true },
  }, dependencies), {
    comparisonDesign: "observational",
    observedRunCount: 72,
    claimGatePassed: false,
    causalClaimSupported: false,
    copilot: { observedRunCount: 36, callTraceStatus: "not-observable", pageParityStatus: "not-observable" },
    ollama: { observedRunCount: 36, toolSelectionPass: 6, toolSelectionFail: 30, runnerErrorRuns: 3 },
  });
  assert.equal(replayedSummaries[0], releasedPrivateAuthenticatedSummary);
  assert.deepEqual({ authenticateLiveCalls, replayCalls, borrowedEvaluationCalls, disposeCalls }, { authenticateLiveCalls: 1, replayCalls: 1, borrowedEvaluationCalls: 1, disposeCalls: 1 });

  const driftedPrivateSummary = structuredClone(releasedPrivateAuthenticatedSummary);
  driftedPrivateSummary.hosts[0].privateAccount = "private@example.invalid";
  await assert.rejects(
    authenticatePersonalAgentComparisonEvidence({
      config,
      publicSummary: releasedPersonalAgentObservation,
      sourceCapture,
      authenticatedPrivateSummary: driftedPrivateSummary,
      privateLiveRelease: releasedLiveVerification,
      loadedCaseSet: { fixture: true },
    }, dependencies),
    /does not exactly match the independently replayed private authenticated summary/u,
  );

  const builderSource = await readFile("scripts/build-personal-agent-comparison-clip.mjs", "utf8");
  assert.match(builderSource, /RELEASE_EVIDENCE_PATHS\.privateEvaluationCapture[\s\S]*?RELEASE_EVIDENCE_PATHS\.privateAuthenticatedSummary[\s\S]*?RELEASE_EVIDENCE_PATHS\.privateLivePagesVerification/u);
  assert.match(builderSource, /mode === 0o600[\s\S]*?authenticatePersonalAgentComparisonEvidence/u);
  assert.match(builderSource, /liveReceiptLease:\s*"borrowed"/u);
  assert.match(builderSource, /offline:\s*true/u);
  assert.match(builderSource, /context\.route\([^\n]+https\?\|wss\?/u);
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
  reconstructedPersonalAgentScene.scenes.find(({ id }) => id === "personal-agent-comparison").kind = "personal-agent-capture";
  assert.throws(() => validateConfig(reconstructedPersonalAgentScene), /personal-agent|hostId|capture/u);
  const ambiguousFutureReceipt = structuredClone(rawConfig);
  ambiguousFutureReceipt.scenes.find(({ id }) => id === "personal-agent-comparison").mediaReceipt = "docs/competition/evidence/latest.json";
  assert.throws(() => validateConfig(ambiguousFutureReceipt), /exact privacy-minimised comparison evidence and clip receipt/u);
  for (const unsafePath of [
    "output/demo-clips/../escape.mov",
    "output/demo-clips/../../.evals/private.mov",
    "output\\demo-clips\\v0.4.0-rc.1\\escape.mov",
    "C:\\output\\demo-clips\\v0.4.0-rc.1\\escape.mov",
  ]) {
    const unsafeConfig = structuredClone(rawConfig);
    unsafeConfig.scenes[0].media.path = unsafePath;
    assert.throws(() => validateConfig(unsafeConfig), /canonical POSIX|repository-relative|unsafe path|stay beneath/u);
  }
  assert.throws(
    () => assertCanonicalRepositoryRelativePath("C:../escape.json"),
    /repository-relative/u,
  );
});

test("standalone media entry points reject path aliases outside their exact release subtrees", () => {
  const clipOptions = {
    prefix: "output/demo-clips/v0.4.0-rc.1/",
    extensions: [".mov", ".mp4", ".mkv"],
  };
  for (const resolvePath of [
    resolveLiveCaptureRepositoryPath,
    resolveHostClipRepositoryPath,
    resolveOllamaClipRepositoryPath,
    resolvePersonalAgentComparisonClipPath,
  ]) {
    assert.throws(
      () => resolvePath("output/demo-clips/../escape.mov", "Test output", clipOptions),
      /canonical POSIX|stay beneath/u,
    );
    assert.throws(
      () => resolvePath("../../.evals/private.mov", "Test output", clipOptions),
      /canonical POSIX|unsafe path|stay beneath/u,
    );
    assert.match(
      resolvePath("output/demo-clips/v0.4.0-rc.1/example.mov", "Test output", clipOptions),
      /output\/demo-clips\/v0\.4\.0-rc\.1\/example\.mov$/u,
    );
  }
  assert.equal(
    assertCanonicalRepositoryRelativePath("docs/competition/evidence/example.json", {
      label: "Receipt",
      prefix: "docs/competition/evidence/",
      extensions: [".json"],
    }),
    "docs/competition/evidence/example.json",
  );
});

test("release binding revalidates the exact public deployment commit and run", async () => {
  const responseFor = (runId) => async () => new Response(JSON.stringify({
      schema: "trusted-govuk-discovery.deployment.v1",
      repository: "chris-page-gov/govuk-webmcp",
      commit: config.productCommit,
      runId,
    }), { status: 200 });
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

function minimalHostEvidenceFixture() {
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
    resultKind: "federated-record",
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
    schema: "govuk-webmcp.supported-host-webmcp-capture.v4",
    capturedAt: "2026-08-31T10:00:00Z",
    page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
    deploymentChecks: supportedHostDeploymentChecks("2026-08-31T10:00:00Z"),
    host: { name: "Example host", version: "1.2.3", capabilities: ["webmcp"] },
    capture: { method: "Native host tool discovery and invocation.", hostOwnedSurfaceObserved: false, hostRecordingCaptured: false, modelSelected: false, modelProviderCalled: false },
    artefacts: [{ path: "docs/competition/evidence/example-host-receipt.json", sha256: "b".repeat(64), sizeBytes: 1_024, kind: "raw-receipt", hostOwnedSurface: false, purpose: "Exact raw host receipt.", limitation: "This is machine evidence, not a host screenshot." }],
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

function hostEvidenceFixture() {
  const evidence = structuredClone(releasedSupportedHostEvidence);
  evidence.schema = "govuk-webmcp.supported-host-webmcp-capture.v4";
  evidence.page.productCommit = config.productCommit;
  evidence.page.pagesRunId = config.pagesRunId;
  evidence.deploymentChecks = supportedHostDeploymentChecks(evidence.capturedAt);
  evidence.limitations = [...SUPPORTED_HOST_CAPTURE_LIMITATIONS];
  for (const tool of evidence.discovery.tools) tool.title = TOOL_TITLES[tool.name];
  for (const artefact of evidence.artefacts) artefact.sizeBytes ??= 1_024;
  if (!evidence.artefacts.some(({ kind }) => kind === "reviewed-public-evidence")) {
    evidence.artefacts.push({
      path: "docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json",
      sha256: "c".repeat(64),
      sizeBytes: 2_048,
      kind: "reviewed-public-evidence",
      hostOwnedSurface: false,
      purpose: "Tracked reviewed projection used by the test fixture.",
      limitation: "This is machine evidence, not a host screenshot.",
    });
  }
  return evidence;
}

test("supported-host v4 receipt binds all six tools to one exact four-source record", () => {
  const evidence = hostEvidenceFixture();
  const summary = validateSupportedHostEvidence(evidence, config, demonstratedRecordId);
  assert.equal(summary.demonstratedRecordId, demonstratedRecordId);
  assert.equal(summary.host, evidence.host.name);

  assert.equal(summary.fourSourceResultCount, evidence.calls[0].result.returned);

  const missingSource = hostEvidenceFixture();
  const removedCollection = missingSource.calls[0].result.results[0].collectionId;
  missingSource.calls[0].result.results = missingSource.calls[0].result.results.filter(({ collectionId }) => collectionId !== removedCollection);
  missingSource.calls[0].result.returned = missingSource.calls[0].result.results.length;
  missingSource.calls[0].canonicalResultDigest = digest(missingSource.calls[0].result);
  assert.throws(() => validateSupportedHostEvidence(missingSource, config, demonstratedRecordId), /representative result from every/u);

  const legislation = hostEvidenceFixture();
  legislation.calls[0].result.results[0].canonicalHumanUrl = "https://legislation.gov.uk/example";
  legislation.calls[0].canonicalResultDigest = digest(legislation.calls[0].result);
  assert.throws(() => validateSupportedHostEvidence(legislation, config, demonstratedRecordId), /excluded legislation link/u);

  for (const excludedUrl of [
    "https://www.legislation.gov.uk/example",
    "https://www.legislation.gov.uk./example",
  ]) {
    const excluded = hostEvidenceFixture();
    excluded.calls[0].result.results[0].canonicalHumanUrl = excludedUrl;
    excluded.calls[0].canonicalResultDigest = digest(excluded.calls[0].result);
    assert.throws(() => validateSupportedHostEvidence(excluded, config, demonstratedRecordId), /excluded legislation link/u);
  }

  const successfulPrivateInput = hostEvidenceFixture();
  successfulPrivateInput.calls[0].input.personalContext = "PRIVATE-VALUE";
  assert.throws(() => validateSupportedHostEvidence(successfulPrivateInput, config, demonstratedRecordId), /published closed schema/u);

  for (const unsafeUrl of [
    "javascript:alert(1)",
    "https://user:password@www.gov.uk/example",
    "https://www.gov.uk:443/example",
  ]) {
    const unsafe = hostEvidenceFixture();
    unsafe.calls[0].result.results[0].canonicalHumanUrl = unsafeUrl;
    unsafe.calls[0].canonicalResultDigest = digest(unsafe.calls[0].result);
    assert.throws(() => validateSupportedHostEvidence(unsafe, config, demonstratedRecordId), /published closed schema/u);
  }

  const unknownResultField = hostEvidenceFixture();
  unknownResultField.calls[0].result.results[0].trustScore = 100;
  unknownResultField.calls[0].canonicalResultDigest = digest(unknownResultField.calls[0].result);
  assert.throws(() => validateSupportedHostEvidence(unknownResultField, config, demonstratedRecordId), /published closed schema/u);

  const excludedRecord = hostEvidenceFixture();
  const recordCall = excludedRecord.calls.find(({ name }) => name === "get_resource_record");
  recordCall.result.record.canonicalHumanUrl = "https://catalogue.legislation.gov.uk/example";
  recordCall.canonicalResultDigest = digest(recordCall.result);
  assert.throws(() => validateSupportedHostEvidence(excludedRecord, config, demonstratedRecordId), /excluded legislation link|source URL does not match/u);

  const excludedProvenance = hostEvidenceFixture();
  const provenanceCall = excludedProvenance.calls.find(({ name }) => name === "show_provenance");
  provenanceCall.result.authoritativeLink.url = "https://www.legislation.gov.uk./example";
  provenanceCall.canonicalResultDigest = digest(provenanceCall.result);
  assert.throws(() => validateSupportedHostEvidence(excludedProvenance, config, demonstratedRecordId), /excluded legislation link|authoritative link does not match/u);

  const wrongRecord = hostEvidenceFixture();
  assert.throws(() => validateSupportedHostEvidence(wrongRecord, config, recordIds.ons), /deployment-selected federated record/u);

  const queryDrift = hostEvidenceFixture();
  const querySearch = queryDrift.calls.find(({ name }) => name === "search_government_knowledge");
  querySearch.result.query = "housing drift";
  redigestCall(querySearch);
  assert.throws(() => validateSupportedHostEvidence(queryDrift, config, demonstratedRecordId), /result query does not match/u);

  const explorationDrift = hostEvidenceFixture();
  const explorationCall = explorationDrift.calls.find(({ name }) => name === "explore_answer_foundations");
  explorationCall.result.selection.answerId = "answer:drifted-starting-points";
  redigestCall(explorationCall);
  assert.throws(() => validateSupportedHostEvidence(explorationDrift, config, demonstratedRecordId), /selection does not exactly reflect/u);

  for (const rowMutation of ["duplicate", "omitted"]) {
    const comparisonDrift = hostEvidenceFixture();
    const comparisonCall = comparisonDrift.calls.find(({ name }) => name === "compare_evidence_foundations");
    if (rowMutation === "duplicate") comparisonCall.result.rows[1] = structuredClone(comparisonCall.result.rows[0]);
    else comparisonCall.result.rows.pop();
    redigestCall(comparisonCall);
    assert.throws(
      () => validateSupportedHostEvidence(comparisonDrift, config, demonstratedRecordId),
      /ordered one-to-one projection|published closed schema/u,
    );
  }

  const acceptedInputDrift = hostEvidenceFixture();
  const acceptedPresentation = acceptedInputDrift.calls.find(({ name }) => name === "present_resource_evidence");
  acceptedPresentation.result.evidence.acceptedInput.recordId = recordIds.ons;
  redigestPresentation(acceptedInputDrift);
  assert.throws(() => validateSupportedHostEvidence(acceptedInputDrift, config, demonstratedRecordId), /acceptedInput does not exactly reflect/u);

  const sourceDigestDrift = hostEvidenceFixture();
  const sourceDigestPresentation = sourceDigestDrift.calls.find(({ name }) => name === "present_resource_evidence");
  sourceDigestPresentation.result.evidence.sourceResultDigests.recordResult = "f".repeat(64);
  redigestPresentation(sourceDigestDrift);
  assert.throws(() => validateSupportedHostEvidence(sourceDigestDrift, config, demonstratedRecordId), /source-result digests do not bind/u);

  const provenanceFieldDrift = hostEvidenceFixture();
  const driftedProvenance = provenanceFieldDrift.calls.find(({ name }) => name === "show_provenance");
  driftedProvenance.result.authoritativeLink.label = "A different source label";
  redigestCall(driftedProvenance);
  assert.throws(() => validateSupportedHostEvidence(provenanceFieldDrift, config, demonstratedRecordId), /provenance authoritative link does not match/u);

  const limitationProjectionDrift = hostEvidenceFixture();
  const limitationSearch = limitationProjectionDrift.calls.find(({ name }) => name === "search_government_knowledge");
  const limitationRecord = limitationProjectionDrift.calls.find(({ name }) => name === "get_resource_record");
  const limitationProvenance = limitationProjectionDrift.calls.find(({ name }) => name === "show_provenance");
  const coordinatedLimitations = structuredClone(limitationRecord.result.record.limitations);
  coordinatedLimitations[0] = "Co-digested limitation drift that must not bypass the presentation projection.";
  limitationSearch.result.results.find(({ recordId }) => recordId === demonstratedRecordId).limitations = structuredClone(coordinatedLimitations);
  limitationRecord.result.record.limitations = structuredClone(coordinatedLimitations);
  limitationProvenance.result.limitations = structuredClone(coordinatedLimitations);
  redigestCall(limitationSearch);
  redigestCall(limitationRecord);
  redigestCall(limitationProvenance);
  const limitationPresentation = limitationProjectionDrift.calls.find(({ name }) => name === "present_resource_evidence");
  limitationPresentation.result.evidence.sourceResultDigests.recordResult = digest(limitationRecord.result);
  limitationPresentation.result.evidence.sourceResultDigests.provenanceResult = digest(limitationProvenance.result);
  redigestPresentation(limitationProjectionDrift);
  assert.throws(() => validateSupportedHostEvidence(limitationProjectionDrift, config, demonstratedRecordId), /presentation limitations do not exactly project/u);

  const integrityNoteDrift = hostEvidenceFixture();
  const integrityPresentation = integrityNoteDrift.calls.find(({ name }) => name === "present_resource_evidence");
  integrityPresentation.result.evidence.foundations[0].integrityBasis.note = "A digest proves that this statement is correct and current.";
  redigestPresentation(integrityNoteDrift);
  assert.throws(
    () => validateSupportedHostEvidence(integrityNoteDrift, config, demonstratedRecordId),
    /complete deterministic record projection/u,
  );

  const cannotDecideDrift = hostEvidenceFixture();
  const cannotDecidePresentation = cannotDecideDrift.calls.find(({ name }) => name === "present_resource_evidence");
  cannotDecidePresentation.result.evidence.cannotDecide[0].statement = "This evidence decides what applies to the person's circumstances.";
  redigestPresentation(cannotDecideDrift);
  assert.throws(
    () => validateSupportedHostEvidence(cannotDecideDrift, config, demonstratedRecordId),
    /complete deterministic record projection/u,
  );

  const titleDrift = hostEvidenceFixture();
  titleDrift.discovery.tools.find(({ name }) => name === "present_resource_evidence").title = "Changed evidence title";
  assert.throws(() => validateSupportedHostEvidence(titleDrift, config, demonstratedRecordId), /canonical application title/u);

  const hostOmittedTitles = hostEvidenceFixture();
  for (const tool of hostOmittedTitles.discovery.tools) delete tool.title;
  assert.doesNotThrow(() => validateSupportedHostEvidence(hostOmittedTitles, config, demonstratedRecordId));

  for (const unsafePageUrl of [
    "https://user:secret@chris-page-gov.github.io/govuk-webmcp/",
    "https://chris-page-gov.github.io/govuk-webmcp/?unexpected=1",
    "https://chris-page-gov.github.io/govuk-webmcp/#view=technical",
  ]) {
    const unsafePage = hostEvidenceFixture();
    unsafePage.page.url = unsafePageUrl;
    assert.throws(() => validateSupportedHostEvidence(unsafePage, config, demonstratedRecordId), /exact configured product/u);
  }

  const coDigestedPresentationMutation = hostEvidenceFixture();
  const presentation = coDigestedPresentationMutation.calls.find(({ name }) => name === "present_resource_evidence");
  presentation.result.evidence.resultKind = "reviewed-record";
  presentation.canonicalResultDigest = digest(presentation.result);
  assert.throws(
    () => validateSupportedHostEvidence(coDigestedPresentationMutation, config, demonstratedRecordId),
    /published closed schema|digest does not match the complete presented evidence object/u,
  );

  const retainedValue = hostEvidenceFixture();
  retainedValue.rejectedCall.input = { query: "housing", personalContext: "do not retain this" };
  assert.throws(() => validateSupportedHostEvidence(retainedValue, config, demonstratedRecordId), /unknown fields/u);

  const openSchema = hostEvidenceFixture();
  delete openSchema.discovery.tools[0].inputSchema.properties.collections;
  assert.throws(() => validateSupportedHostEvidence(openSchema, config, demonstratedRecordId), /published closed contract|six declared fields/u);

  const coordinatedSchemaMutation = hostEvidenceFixture();
  coordinatedSchemaMutation.discovery.tools.find(({ name }) => name === "get_resource_record").inputSchema.properties.personalContext = { type: "string", maxLength: 10 };
  assert.throws(() => validateSupportedHostEvidence(coordinatedSchemaMutation, config, demonstratedRecordId), /published closed contract/u);

  const loosenedSchemaBound = hostEvidenceFixture();
  loosenedSchemaBound.discovery.tools.find(({ name }) => name === "search_government_knowledge").inputSchema.properties.query.maxLength += 1;
  assert.throws(() => validateSupportedHostEvidence(loosenedSchemaBound, config, demonstratedRecordId), /published closed contract/u);

  const hostSurfaceClaim = hostEvidenceFixture();
  hostSurfaceClaim.capture.hostOwnedSurfaceObserved = true;
  hostSurfaceClaim.capture.hostRecordingCaptured = true;
  assert.throws(() => validateSupportedHostEvidence(hostSurfaceClaim, config, demonstratedRecordId), /no-host-surface, no-recording and no-model boundary/u);

  const missingLimitations = hostEvidenceFixture();
  missingLimitations.limitations = [];
  assert.throws(() => validateSupportedHostEvidence(missingLimitations, config, demonstratedRecordId), /fixed capture boundary statements/u);

  const unknownToolField = hostEvidenceFixture();
  unknownToolField.discovery.tools[0].privateNarrative = "must not survive the closed wrapper";
  assert.throws(() => validateSupportedHostEvidence(unknownToolField, config, demonstratedRecordId), /unknown fields: privateNarrative/u);

  const unknownCallField = hostEvidenceFixture();
  unknownCallField.calls[0].privateNarrative = "must not survive the closed wrapper";
  assert.throws(() => validateSupportedHostEvidence(unknownCallField, config, demonstratedRecordId), /unknown fields: privateNarrative/u);

  const historical = hostEvidenceFixture();
  historical.schema = "trusted-govuk-discovery.supported-host-webmcp-capture.v2";
  assert.throws(() => validateSupportedHostEvidence(historical, config, demonstratedRecordId), /wrong schema/u);

  for (const invalidTimestamp of ["1", "2026-08-31", "31 August 2026 10:00 UTC", "2026-02-30T10:00:00Z"]) {
    const invalidTime = hostEvidenceFixture();
    invalidTime.capturedAt = invalidTimestamp;
    assert.throws(
      () => validateSupportedHostEvidence(invalidTime, config, demonstratedRecordId),
      /RFC 3339 UTC|invalid calendar date/u,
    );
  }
});

test("current tracked supported-host evidence validates without fixture normalisation", async () => {
  const reviewedState = await stat(releasedReviewedChromePath);
  const liveVerificationState = await stat(releasedLiveVerificationPath);
  const reviewedSha256 = createHash("sha256").update(releasedReviewedChromeBytes).digest("hex");
  const liveVerificationSha256 = createHash("sha256").update(releasedLiveVerificationBytes).digest("hex");

  const supportedSummary = validateSupportedHostEvidence(
    releasedSupportedHostEvidence,
    config,
    demonstratedRecordId,
  );
  const reviewedSummary = validateSupportedHostReviewedArtefact(
    releasedReviewedChrome,
    releasedSupportedHostEvidence,
    {
      relativePath: releasedReviewedChromePath,
      sha256: reviewedSha256,
      sizeBytes: reviewedState.size,
    },
    {
      liveVerificationFile: {
        relativePath: releasedLiveVerificationPath,
        sha256: liveVerificationSha256,
        sizeBytes: liveVerificationState.size,
      },
      liveVerification: releasedLiveVerification,
      deployment: releasedInteractionCapture.deployment,
    },
  );

  assert.equal(supportedSummary.host, releasedSupportedHostEvidence.host.name);
  assert.deepEqual(reviewedSummary, {
    rawReceiptSha256: releasedSupportedHostEvidence.artefacts.find(({ kind }) => kind === "raw-receipt").sha256,
    reviewedEvidenceSha256: reviewedSha256,
  });
});

async function futureSupportedHostReleaseFixture() {
  const futureConfig = Object.freeze({
    ...config,
    productCommit: "c".repeat(40),
    pagesRunId: "44556677889",
  });
  const deployment = {
    metadataUrl: new URL("deployment.json", futureConfig.productUrl).href,
    metadataSha256: "d".repeat(64),
  };
  const publicLiveReceipt = structuredClone(releasedLiveVerification);
  publicLiveReceipt.observedAt = "2026-09-02T02:10:00.000Z";
  publicLiveReceipt.commit = futureConfig.productCommit;
  publicLiveReceipt.runId = futureConfig.pagesRunId;
  publicLiveReceipt.artifact.id = 10_123_456_789;
  publicLiveReceipt.artifact.apiDigest = `sha256:${"e".repeat(64)}`;
  publicLiveReceipt.artifact.tarSha256 = "f".repeat(64);
  publicLiveReceipt.fileCount = 1_900;
  publicLiveReceipt.byteCount = 129_000_000;
  publicLiveReceipt.manifestSha256 = "a".repeat(64);
  publicLiveReceipt.statusCounts["200"] = publicLiveReceipt.fileCount;
  const privateLiveReceipt = structuredClone(publicLiveReceipt);
  privateLiveReceipt.observedAt = "2026-09-02T02:11:00.000Z";
  const authenticatedLiveReceipt = await authenticateLivePagesReceipt(
    publicLiveReceipt,
    async () => ({
      receipt: {
        ...structuredClone(publicLiveReceipt),
        observedAt: "2026-09-02T02:12:00.000Z",
      },
    }),
  );
  const publicLiveReceiptFile = jsonFile("docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json", publicLiveReceipt, { mode: 0o644 });
  const privateLiveReceiptFile = jsonFile(".evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json", privateLiveReceipt);

  const evidence = hostEvidenceFixture();
  evidence.capturedAt = "2026-09-02T02:11:30.000Z";
  evidence.page.productCommit = futureConfig.productCommit;
  evidence.page.pagesRunId = futureConfig.pagesRunId;
  evidence.deploymentChecks = supportedHostDeploymentChecks(evidence.capturedAt, deployment, futureConfig);
  evidence.host.version = "Google Chrome 153.0.8000.1";

  const reviewed = structuredClone(releasedReviewedChrome);
  reviewed.observedAt = evidence.capturedAt;
  reviewed.target.deployment.metadataSha256 = deployment.metadataSha256;
  reviewed.target.deployment.commit = futureConfig.productCommit;
  reviewed.target.deployment.runId = futureConfig.pagesRunId;
  reviewed.target.deployment.expectedCommit = futureConfig.productCommit;
  reviewed.deploymentChecks = structuredClone(evidence.deploymentChecks);
  reviewed.releaseEvidence.productCommit = futureConfig.productCommit;
  reviewed.releaseEvidence.pagesRunId = futureConfig.pagesRunId;
  reviewed.releaseEvidence.pagesArtifactId = publicLiveReceipt.artifact.id;
  reviewed.releaseEvidence.artifactApiDigest = publicLiveReceipt.artifact.apiDigest;
  reviewed.releaseEvidence.artifactTarSha256 = publicLiveReceipt.artifact.tarSha256;
  reviewed.releaseEvidence.liveArtifactVerificationSha256 = publicLiveReceiptFile.sha256;
  reviewed.releaseEvidence.comparedFileCount = publicLiveReceipt.fileCount;
  reviewed.releaseEvidence.comparedByteCount = publicLiveReceipt.byteCount;
  reviewed.releaseEvidence.liveManifestSha256 = publicLiveReceipt.manifestSha256;
  reviewed.environment.chrome = evidence.host.version;
  reviewed.environment.chromeDevtoolsMcp = "1.9.0";
  reviewed.environment.node = "v27.0.0";
  for (const tool of reviewed.discovery.tools) {
    const projected = evidence.discovery.tools.find(({ name }) => name === tool.name);
    tool.title = projected.title;
  }

  const rawReceipt = rawReceiptFor(evidence, reviewed);
  const rawReceiptFile = jsonFile(releasedRawChromePath, rawReceipt);
  const rawArtefact = evidence.artefacts.find(({ kind }) => kind === "raw-receipt");
  rawArtefact.sha256 = rawReceiptFile.sha256;
  rawArtefact.sizeBytes = rawReceiptFile.sizeBytes;
  reviewed.sourceReceipt.sha256 = rawReceiptFile.sha256;
  reviewed.sourceReceipt.sizeBytes = rawReceiptFile.sizeBytes;

  const reviewedBytes = Buffer.from(`${JSON.stringify(reviewed, null, 2)}\n`);
  const reviewedFile = jsonFile(releasedReviewedChromePath, reviewed, { bytes: reviewedBytes, mode: 0o644 });
  const reviewedArtefact = evidence.artefacts.find(({ kind }) => kind === "reviewed-public-evidence");
  reviewedArtefact.sha256 = reviewedFile.sha256;
  reviewedArtefact.sizeBytes = reviewedFile.sizeBytes;
  const context = {
    config: futureConfig,
    deployment,
    liveVerificationFile: publicLiveReceiptFile,
    liveVerification: publicLiveReceipt,
    privateLiveVerificationFile: privateLiveReceiptFile,
    privateLiveVerification: privateLiveReceipt,
    authenticatedLiveReceipt,
    rawReceiptFile,
    rawReceipt,
  };
  return { futureConfig, deployment, publicLiveReceipt, privateLiveReceipt, authenticatedLiveReceipt, publicLiveReceiptFile, privateLiveReceiptFile, evidence, reviewed, reviewedFile, rawReceipt, rawReceiptFile, context };
}

test("future protected-main release identity is supplied entirely by config and exact receipts", async () => {
  const fixture = await futureSupportedHostReleaseFixture();
  const hostSummary = validateSupportedHostEvidenceForDeployment(
    fixture.evidence,
    fixture.futureConfig,
    demonstratedRecordId,
    fixture.deployment,
  );
  assert.equal(hostSummary.host, supportedHostCandidateReleaseContract.supportedHostName);
  assert.equal(
    validateSupportedHostReviewedArtefactForRelease(
      fixture.reviewed,
      fixture.evidence,
      fixture.reviewedFile,
      fixture.context,
    ).reviewedEvidenceSha256,
    fixture.reviewedFile.sha256,
  );
  const release = validateSupportedHostLiveReceiptPair(fixture.futureConfig, {
    deployment: fixture.deployment,
    publicLiveReceiptFile: fixture.publicLiveReceiptFile,
    publicLiveReceipt: fixture.publicLiveReceipt,
    privateLiveReceiptFile: fixture.privateLiveReceiptFile,
    privateLiveReceipt: fixture.privateLiveReceipt,
    authenticatedLiveReceipt: fixture.authenticatedLiveReceipt,
  });
  assert.deepEqual(
    {
      productCommit: release.productCommit,
      pagesRunId: release.pagesRunId,
      pagesArtifactId: release.pagesArtifactId,
      comparedFileCount: release.comparedFileCount,
      chrome: fixture.rawReceipt.environment.chrome,
      node: fixture.rawReceipt.environment.node,
    },
    {
      productCommit: fixture.futureConfig.productCommit,
      pagesRunId: fixture.futureConfig.pagesRunId,
      pagesArtifactId: fixture.publicLiveReceipt.artifact.id,
      comparedFileCount: fixture.publicLiveReceipt.fileCount,
      chrome: "Google Chrome 153.0.8000.1",
      node: "v27.0.0",
    },
  );
});

test("final-video evaluation replay can reuse one authenticated live receipt before supported-host publication", async () => {
  const fixture = await futureSupportedHostReleaseFixture();
  const authenticatedEvaluationRelease = await authenticateEvaluationReleaseReceipt(
    fixture.publicLiveReceipt,
    {
      authenticateImplementation: async () => fixture.authenticatedLiveReceipt,
      gitIdentityImplementation: async () => ({ commit: fixture.futureConfig.productCommit, status: "" }),
      liveReceiptLease: "borrowed",
      localBindingImplementation: async () => {},
      runtimeSnapshotImplementation: async () => ({
        runtimeFactory: async () => { throw new Error("Runtime replay is outside this receipt-reuse test."); },
        verifyGeneratedArtifacts: async () => {},
        revalidate: async () => {},
        dispose: async () => {},
      }),
    },
  );
  await disposeEvaluationReleaseReceipt(authenticatedEvaluationRelease);
  assert.equal(isAuthenticatedLivePagesReceipt(authenticatedEvaluationRelease), true);

  assert.equal(
    validateSupportedHostLiveReceiptPair(fixture.futureConfig, {
      deployment: fixture.deployment,
      publicLiveReceiptFile: fixture.publicLiveReceiptFile,
      publicLiveReceipt: fixture.publicLiveReceipt,
      privateLiveReceiptFile: fixture.privateLiveReceiptFile,
      privateLiveReceipt: fixture.privateLiveReceipt,
      authenticatedLiveReceipt: authenticatedEvaluationRelease,
    }).pagesArtifactId,
    fixture.publicLiveReceipt.artifact.id,
  );
  assert.equal(disposeAuthenticatedLivePagesReceipt(authenticatedEvaluationRelease), true);
  assert.equal(isAuthenticatedLivePagesReceipt(authenticatedEvaluationRelease), false);
});

test("supported-host admission rejects authentication before either stored receipt observation", async () => {
  const fixture = await futureSupportedHostReleaseFixture();
  for (const observedAt of [
    "2026-09-02T02:09:59.999Z",
    "2026-09-02T02:10:59.999Z",
  ]) {
    const earlierAuthentication = await authenticateLivePagesReceipt(
      fixture.publicLiveReceipt,
      async () => ({
        receipt: {
          ...structuredClone(fixture.publicLiveReceipt),
          observedAt,
        },
      }),
    );
    assert.throws(
      () => validateSupportedHostLiveReceiptPair(fixture.futureConfig, {
        deployment: fixture.deployment,
        publicLiveReceiptFile: fixture.publicLiveReceiptFile,
        publicLiveReceipt: fixture.publicLiveReceipt,
        privateLiveReceiptFile: fixture.privateLiveReceiptFile,
        privateLiveReceipt: fixture.privateLiveReceipt,
        authenticatedLiveReceipt: earlierAuthentication,
      }),
      /at or after both stored public and private receipt observations/u,
    );
    assert.equal(disposeAuthenticatedLivePagesReceipt(earlierAuthentication), true);
  }
});

test("a newer private release receipt invalidates dependent supported-host evidence", async () => {
  const fixture = await futureSupportedHostReleaseFixture();
  const newerPrivateReceipt = structuredClone(fixture.privateLiveReceipt);
  newerPrivateReceipt.observedAt = "2026-09-02T02:11:31.000Z";
  assert.throws(
    () => validateSupportedHostReviewedArtefactForRelease(
      fixture.reviewed,
      fixture.evidence,
      fixture.reviewedFile,
      {
        ...fixture.context,
        privateLiveVerification: newerPrivateReceipt,
        privateLiveVerificationFile: jsonFile(
          fixture.privateLiveReceiptFile.relativePath,
          newerPrivateReceipt,
        ),
      },
    ),
    /newer than the supported-host capture; recapture/u,
  );
});

test("future release cross-receipt drift fails closed", async () => {
  const fixture = await futureSupportedHostReleaseFixture();
  const pairContext = {
    deployment: fixture.deployment,
    publicLiveReceiptFile: fixture.publicLiveReceiptFile,
    publicLiveReceipt: fixture.publicLiveReceipt,
    privateLiveReceiptFile: fixture.privateLiveReceiptFile,
    privateLiveReceipt: fixture.privateLiveReceipt,
    authenticatedLiveReceipt: fixture.authenticatedLiveReceipt,
  };
  assert.throws(
    () => validateSupportedHostLiveReceiptPair(fixture.futureConfig, {
      ...pairContext,
      authenticatedLiveReceipt: structuredClone(fixture.authenticatedLiveReceipt),
    }),
    /fresh process-local authenticated live Pages receipt/u,
  );

  const coordinatedPublicReceipt = structuredClone(fixture.publicLiveReceipt);
  coordinatedPublicReceipt.artifact.id += 1;
  const coordinatedPrivateReceipt = structuredClone(coordinatedPublicReceipt);
  coordinatedPrivateReceipt.observedAt = fixture.privateLiveReceipt.observedAt;
  const coordinatedPublicFile = jsonFile(pairContext.publicLiveReceiptFile.relativePath, coordinatedPublicReceipt, { mode: 0o644 });
  const coordinatedPrivateFile = jsonFile(pairContext.privateLiveReceiptFile.relativePath, coordinatedPrivateReceipt);
  assert.throws(
    () => validateSupportedHostLiveReceiptPair(fixture.futureConfig, {
      ...pairContext,
      publicLiveReceipt: coordinatedPublicReceipt,
      publicLiveReceiptFile: coordinatedPublicFile,
      privateLiveReceipt: coordinatedPrivateReceipt,
      privateLiveReceiptFile: coordinatedPrivateFile,
    }),
    /do not match the fresh authenticated release, artefact, complete-file or manifest binding/u,
  );

  for (const mutate of [
    (receipt) => { receipt.artifact.id += 1; },
    (receipt) => { receipt.artifact.apiDigest = `sha256:${"0".repeat(64)}`; },
    (receipt) => { receipt.artifact.tarSha256 = "0".repeat(64); },
    (receipt) => { receipt.fileCount += 1; receipt.statusCounts["200"] += 1; },
    (receipt) => { receipt.byteCount += 1; },
    (receipt) => { receipt.manifestSha256 = "0".repeat(64); },
  ]) {
    const privateLiveReceipt = structuredClone(fixture.privateLiveReceipt);
    mutate(privateLiveReceipt);
    const privateLiveReceiptFile = jsonFile(pairContext.privateLiveReceiptFile.relativePath, privateLiveReceipt);
    assert.throws(
      () => validateSupportedHostLiveReceiptPair(fixture.futureConfig, { ...pairContext, privateLiveReceipt, privateLiveReceiptFile }),
      /different release, artefact, complete-file or manifest bindings/u,
    );
  }

  const metadataDrift = structuredClone(fixture.reviewed);
  metadataDrift.target.deployment.metadataSha256 = "0".repeat(64);
  assert.throws(
    () => validateSupportedHostReviewedArtefactForRelease(metadataDrift, fixture.evidence, fixture.reviewedFile, fixture.context),
    /deployment-metadata digest|exact stable deployment/u,
  );
  const hostDrift = structuredClone(fixture.evidence);
  hostDrift.host.version = "Google Chrome 154.0.8100.2";
  assert.throws(
    () => validateSupportedHostReviewedArtefactForRelease(fixture.reviewed, hostDrift, fixture.reviewedFile, fixture.context),
    /supported Chrome host class|exact private Chrome receipt/u,
  );
  const nodeDrift = structuredClone(fixture.reviewed);
  nodeDrift.environment.node = "v28.0.0";
  assert.throws(
    () => validateSupportedHostReviewedArtefactForRelease(nodeDrift, fixture.evidence, fixture.reviewedFile, fixture.context),
    /different browser, bridge, Node or isolation identities/u,
  );
  const presentationDrift = structuredClone(fixture.rawReceipt);
  presentationDrift.finalPageObservation.displayEvidenceDigest = "0".repeat(64);
  const presentationDriftFile = jsonFile(fixture.rawReceiptFile.relativePath, presentationDrift);
  const presentationEvidence = structuredClone(fixture.evidence);
  const presentationReviewed = structuredClone(fixture.reviewed);
  presentationEvidence.artefacts.find(({ kind }) => kind === "raw-receipt").sha256 = presentationDriftFile.sha256;
  presentationEvidence.artefacts.find(({ kind }) => kind === "raw-receipt").sizeBytes = presentationDriftFile.sizeBytes;
  presentationReviewed.sourceReceipt.sha256 = presentationDriftFile.sha256;
  presentationReviewed.sourceReceipt.sizeBytes = presentationDriftFile.sizeBytes;
  assert.throws(
    () => validateSupportedHostReviewedArtefactForRelease(presentationReviewed, presentationEvidence, fixture.reviewedFile, { ...fixture.context, rawReceipt: presentationDrift, rawReceiptFile: presentationDriftFile }),
    /different final presentation identity or digest/u,
  );
});

test("Chrome DevTools capture plan cannot drift from the six release demonstration calls", () => {
  assert.equal(assertSupportedHostDemoPlan(rawConfig), rawConfig);
  assert.deepEqual(
    structuredClone(SUPPORTED_HOST_DEMONSTRATION_INPUTS),
    rawConfig.demonstrationInputs,
  );
  assert.deepEqual(
    SUPPORTED_HOST_EXPECTED_CALLS.map(({ name, input }) => ({ name, input: structuredClone(input) })),
    [
      {
        name: "search_government_knowledge",
        input: {
          query: "housing",
          collections: ["uk-living", "ons", "government-apis", "land-registry"],
          limit: 8,
        },
      },
      {
        name: "get_resource_record",
        input: { recordId: "govuk-discovery:federated:land-registry:57845" },
      },
      {
        name: "show_provenance",
        input: { recordId: "govuk-discovery:federated:land-registry:57845" },
      },
      {
        name: "explore_answer_foundations",
        input: {
          answerId: "answer:new-child-starting-points",
          claimId: "claim:register-a-birth",
        },
      },
      {
        name: "compare_evidence_foundations",
        input: {
          answerId: "answer:new-child-starting-points",
          claimIds: ["claim:register-a-birth", "claim:check-parental-pay-and-leave"],
        },
      },
      {
        name: "present_resource_evidence",
        input: { recordId: "govuk-discovery:federated:land-registry:57845" },
      },
    ],
  );

  const drifted = structuredClone(rawConfig);
  drifted.demonstrationInputs.reviewedClaimIds[1] = "claim:check-child-benefit";
  assert.throws(() => assertSupportedHostDemoPlan(drifted), /reviewed claims drifted/u);
});

test("publication consumers authenticate the live release before validating or admitting supported-host evidence", async () => {
  const [captureSource, clipSource, finalVideoSource] = await Promise.all([
    readFile("scripts/capture-chrome-devtools-webmcp.mjs", "utf8"),
    readFile("scripts/build-host-evidence-clip.mjs", "utf8"),
    readFile("scripts/build-demo-video.mjs", "utf8"),
  ]);
  assert.match(captureSource, /authenticatedLiveReceipt = await authenticateLivePagesReceipt\(liveVerification\)[\s\S]*?validateSupportedHostReviewedArtefact\([\s\S]*?authenticatedLiveReceipt[\s\S]*?await admitEvidenceSet\([\s\S]*?finally[\s\S]*?disposeAuthenticatedLivePagesReceipt\(authenticatedLiveReceipt\)/u);
  assert.match(captureSource, /validateSupportedHostEvidence\([\s\S]*?publicDeployment\.sha256[\s\S]*?validateSupportedHostReviewedArtefact\(/u);
  assert.match(captureSource, /config:\s*releaseConfig[\s\S]*?privateLiveVerificationFile[\s\S]*?privateLiveVerification[\s\S]*?authenticatedLiveReceipt[\s\S]*?rawReceiptFile[\s\S]*?rawReceipt:\s*receipt/u);
  assert.match(captureSource, /readPrivateReceiptBytes\(privateLiveVerificationPath/u);
  assert.match(clipSource, /const authenticatedLiveReceipt = await authenticateLivePagesReceipt\(liveVerification\)[\s\S]*?try[\s\S]*?validateSupportedHostReviewedArtefact\([\s\S]*?authenticatedLiveReceipt[\s\S]*?finally[\s\S]*?disposeAuthenticatedLivePagesReceipt\(authenticatedLiveReceipt\)/u);
  assert.match(clipSource, /metadataUrl:\s*liveDeployment\.url[\s\S]*?metadataSha256:\s*liveDeployment\.sha256/u);
  assert.match(clipSource, /config,[\s\S]*?privateLiveVerificationFile[\s\S]*?privateLiveVerification[\s\S]*?authenticatedLiveReceipt[\s\S]*?rawReceiptFile[\s\S]*?rawReceipt/u);
  assert.match(clipSource, /mode === 0o600/u);
  assert.match(finalVideoSource, /try[\s\S]*?authenticatedLiveVerification = await authenticateLivePagesReceipt\(liveRelease\)[\s\S]*?authenticateFinalVideoPersonalAgentSummary\([\s\S]*?authenticateEvaluationReleaseReceipt\(candidate,[\s\S]*?checkoutPolicy:\s*authenticationOptions\.checkoutPolicy[\s\S]*?return authenticatedLiveVerification[\s\S]*?liveReceiptLease:\s*"borrowed"[\s\S]*?validateSupportedHostReviewedArtefact\([\s\S]*?authenticatedLiveReceipt:\s*authenticatedLiveVerification[\s\S]*?finally[\s\S]*?disposeAuthenticatedLivePagesReceipt\(authenticatedLiveVerification\)/u);
  assert.match(finalVideoSource, /personalAgentObservationScenes = config\.scenes\.filter[\s\S]*?expectedPrivateEvaluationCapture[\s\S]*?publiclyReportable = false[\s\S]*?expectedPrivateAuthenticatedSummary[\s\S]*?publiclyReportable = false[\s\S]*?authenticateFinalVideoPersonalAgentSummary\([\s\S]*?inputs\.push\(sourceCaptureFile, authenticatedSummaryFile\)[\s\S]*?for \(const scene of personalAgentObservationScenes\)[\s\S]*?validatePersonalAgentObservationEvidence\([\s\S]*?authenticatedLiveVerification,[\s\S]*?authenticatedSummary,/u);
  assert.equal((finalVideoSource.match(/clean-evidence-descendant/gu) ?? []).length, 1);
});

test("Chrome DevTools final page observation binds diagnostic, selection and digest parity", () => {
  assert.match(FINAL_PAGE_EVALUATION_FUNCTION, /#diagnostic-last-action/u);
  assert.match(FINAL_PAGE_EVALUATION_FUNCTION, /#evidence-answer-view/u);
  assert.match(FINAL_PAGE_EVALUATION_FUNCTION, /dataset\.selectionId/u);
  assert.match(FINAL_PAGE_EVALUATION_FUNCTION, /dataset\.evidenceDigest/u);
  const evidenceDigest = "d".repeat(64);
  const observed = {
    lastPresentationAction: "WebMCP: present_resource_evidence",
    selectedRecordId: "govuk-discovery:federated:land-registry:57845",
    displayEvidenceDigest: evidenceDigest,
  };
  const parsed = parseEvaluateScriptResult([
    `Script ran on page and returned:\n\`\`\`json\n${JSON.stringify(observed)}\n\`\`\``,
  ]);
  assert.deepEqual(validateCapturedPageObservation(parsed, evidenceDigest), {
    ...observed,
    toolEvidenceDigest: evidenceDigest,
    digestParity: true,
  });
  assert.deepEqual(parseEvaluateScriptResult(observed), observed);
  assert.deepEqual(parseEvaluateScriptResult({
    message: `Script ran on page and returned:\n\`\`\`json\n${JSON.stringify(observed)}\n\`\`\``,
  }), observed);
  assert.throws(
    () => parseEvaluateScriptResult({
      message: `\`\`\`json\n${JSON.stringify(observed)}\n\`\`\``,
      navigatedToUrl: "https://example.invalid/",
    }),
    /unknown or missing fields/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult([
      "Script ran on page and returned:",
      `\`\`\`json\n${JSON.stringify(observed)}\n\`\`\``,
    ]),
    /unreadable JSON envelope/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult({ message: "Script ran but returned no JSON." }),
    /unreadable JSON envelope/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult(JSON.stringify(observed)),
    /unreadable JSON envelope/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult({
      message: `Notice:\nScript ran on page and returned:\n\`\`\`json\n${JSON.stringify(observed)}\n\`\`\``,
    }),
    /unreadable JSON envelope/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult({
      message: `Script ran on page and returned:\n\`\`\`json\n${JSON.stringify(observed)}\n\`\`\`\n\`\`\`json\n{}\n\`\`\``,
    }),
    /unreadable JSON envelope/u,
  );
  assert.throws(
    () => parseEvaluateScriptResult({
      message: `Script ran on page and returned:\n\`\`\`json\n${"x".repeat(16_384)}\n\`\`\``,
    }),
    /unreadable JSON envelope/u,
  );

  const wrongDigest = { ...observed, displayEvidenceDigest: "e".repeat(64) };
  assert.throws(
    () => validateCapturedPageObservation(wrongDigest, evidenceDigest),
    /differs from the presentation tool digest/u,
  );
  const wrongRecord = { ...observed, selectedRecordId: "govuk-discovery:federated:land-registry:1" };
  assert.throws(
    () => validateCapturedPageObservation(wrongRecord, evidenceDigest),
    /selected a different record/u,
  );
});

test("Chrome reviewed evidence maps annotations and excludes the rejected private value", () => {
  const source = hostEvidenceFixture();
  const rawReceipt = {
    observedAt: source.capturedAt,
    target: {
      url: rawConfig.productUrl,
      mode: "public",
      deployment: {
        metadataSha256: releasedInteractionCapture.deployment.metadataSha256,
        commit: config.productCommit,
        runId: config.pagesRunId,
      },
    },
    deploymentChecks: supportedHostDeploymentChecks(source.capturedAt),
    environment: {
      chrome: releasedRawChrome.environment.chrome,
      chromeDevtoolsMcp: "1.8.0",
    },
    discovery: {
      tools: source.discovery.tools.map((definition) => ({
        ...structuredClone(definition),
        annotations: {
          readOnly: definition.annotations.readOnlyHint,
          untrustedContent: definition.annotations.untrustedContentHint,
        },
      })),
    },
    calls: source.calls.map(({ name, input, result, canonicalResultDigest }) => ({
      toolName: name,
      input: structuredClone(input),
      output: structuredClone(result),
      canonicalOutputSha256: canonicalResultDigest,
    })),
    rejectedCall: {
      toolName: source.rejectedCall.name,
      input: {
        query: "housing",
        personalContext: "synthetic private value that public evidence must omit",
      },
      output: structuredClone(source.rejectedCall.result),
      canonicalOutputSha256: source.rejectedCall.canonicalResultDigest,
    },
    finalPageObservation: structuredClone(source.finalPageObservation),
  };
  const evidence = buildSupportedHostEvidence({
    receipt: rawReceipt,
    sourceReceiptSha256: "b".repeat(64),
    sourceReceiptSizeBytes: 1_024,
    reviewedEvidenceSha256: "c".repeat(64),
    reviewedEvidenceSizeBytes: 2_048,
    liveVerification: { commit: config.productCommit, runId: config.pagesRunId },
    demoConfig: rawConfig,
  });
  assert.deepEqual(evidence.rejectedCall.inputFieldNames, ["personalContext", "query"]);
  assert.doesNotMatch(JSON.stringify(evidence), /synthetic private value/u);
  assert.deepEqual(evidence.artefacts.map(({ path, sha256, sizeBytes, kind }) => ({ path, sha256, sizeBytes, kind })), [
    { path: ".evals/chrome-devtools-mcp-public.json", sha256: "b".repeat(64), sizeBytes: 1_024, kind: "raw-receipt" },
    { path: "docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json", sha256: "c".repeat(64), sizeBytes: 2_048, kind: "reviewed-public-evidence" },
  ]);
  assert.deepEqual(
    evidence.discovery.tools.map(({ annotations }) => annotations),
    source.discovery.tools.map(({ annotations }) => annotations),
  );
  assert.equal(
    validateSupportedHostEvidence(evidence, config, demonstratedRecordId).demonstratedRecordId,
    demonstratedRecordId,
  );

  const escapedRejectedValue = "private \\\"quoted\\\" \\\\path\\nline";
  const escapedRejectedValueReceipt = structuredClone(rawReceipt);
  escapedRejectedValueReceipt.rejectedCall.input.personalContext = escapedRejectedValue;
  escapedRejectedValueReceipt.rejectedCall.output.error.message =
    `Unknown input field: personalContext. Rejected value: ${escapedRejectedValue}`;
  escapedRejectedValueReceipt.rejectedCall.canonicalOutputSha256 =
    digest(escapedRejectedValueReceipt.rejectedCall.output);
  assert.throws(
    () => buildSupportedHostEvidence({
      receipt: escapedRejectedValueReceipt,
      sourceReceiptSha256: "b".repeat(64),
      sourceReceiptSizeBytes: 1_024,
      reviewedEvidenceSha256: "c".repeat(64),
      reviewedEvidenceSizeBytes: 2_048,
      liveVerification: { commit: config.productCommit, runId: config.pagesRunId },
      demoConfig: rawConfig,
    }),
    /retained the rejected personal-context value/u,
  );

  const nonStringRejectedValueReceipt = structuredClone(rawReceipt);
  nonStringRejectedValueReceipt.rejectedCall.input.personalContext = { private: true };
  assert.throws(
    () => buildSupportedHostEvidence({
      receipt: nonStringRejectedValueReceipt,
      sourceReceiptSha256: "b".repeat(64),
      sourceReceiptSizeBytes: 1_024,
      reviewedEvidenceSha256: "c".repeat(64),
      reviewedEvidenceSizeBytes: 2_048,
      liveVerification: { commit: config.productCommit, runId: config.pagesRunId },
      demoConfig: rawConfig,
    }),
    /must be a string/u,
  );

  const mapped = mapChromeToolDefinition({
    name: "example",
    description: "Example tool",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnly: true, untrustedContent: true },
  });
  assert.deepEqual(mapped.annotations, { readOnlyHint: true, untrustedContentHint: true });
  assert.equal(Object.hasOwn(mapped.annotations, "readOnly"), false);

  const liveVerification = structuredClone(releasedLiveVerification);
  liveVerification.commit = config.productCommit;
  liveVerification.runId = config.pagesRunId;
  const liveVerificationFile = {
    relativePath: "docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json",
    sha256: createHash("sha256").update(releasedLiveVerificationBytes).digest("hex"),
    sizeBytes: 4_096,
  };
  const deployment = {
    metadataUrl: `${rawConfig.productUrl}deployment.json`,
    metadataSha256: releasedInteractionCapture.deployment.metadataSha256,
  };
  const reviewed = {
    schema: "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v3",
    observedAt: source.capturedAt,
    sourceReceipt: {
      path: ".evals/chrome-devtools-mcp-public.json",
      sha256: "b".repeat(64),
      sizeBytes: 1_024,
      tracking: "ignored local source",
      review: "Reviewed fixture retaining the exact ignored raw-receipt binding.",
    },
    target: {
      url: rawConfig.productUrl,
      mode: "public",
      localBuild: false,
      personalDataUsed: false,
      deployment: {
        ...deployment,
        schema: "trusted-govuk-discovery.deployment.v1",
        repository: "chris-page-gov/govuk-webmcp",
        commit: config.productCommit,
        runId: config.pagesRunId,
        expectedCommit: config.productCommit,
      },
    },
    deploymentChecks: supportedHostDeploymentChecks(source.capturedAt),
    releaseEvidence: {
      productCommit: config.productCommit,
      pagesRunId: config.pagesRunId,
      pagesArtifactId: liveVerification.artifact.id,
      artifactApiDigest: liveVerification.artifact.apiDigest,
      artifactTarSha256: liveVerification.artifact.tarSha256,
      liveArtifactVerification: liveVerificationFile.relativePath,
      liveArtifactVerificationSha256: liveVerificationFile.sha256,
      comparedFileCount: liveVerification.fileCount,
      comparedByteCount: liveVerification.byteCount,
      liveManifestSha256: liveVerification.manifestSha256,
    },
    environment: {
      chrome: rawReceipt.environment.chrome,
      chromeChannel: "stable",
      chromeDevtoolsMcp: "1.8.0",
      node: releasedRawChrome.environment.node,
      isolatedProfile: true,
      allowedUrlPattern: `${rawConfig.productUrl}*`,
      usageStatistics: false,
      updateChecks: false,
      performanceCrux: false,
      networkHeadersRedacted: true,
    },
    capture: {
      mechanism: evidence.capture.method,
      modelSelected: false,
      modelProviderCalled: false,
      exactToolOutputsRetained: true,
      redactions: {
        localProfilePath: "not retained",
        hostPageIdentifiers: "not retained",
        networkHeaders: "not retained",
        cookies: "not inspected or retained",
      },
    },
    boundaries: {
      browserNativeWebMcp: true,
      bridge: evidence.capture.method,
      deploymentMetadataValidated: true,
      modelSelectionEvaluated: false,
      durableGovernmentService: false,
      remoteProviderCalled: false,
      reportContainsToolOutputs: true,
    },
    discovery: { toolCount: rawReceipt.discovery.tools.length, tools: structuredClone(rawReceipt.discovery.tools) },
    calls: rawReceipt.calls.map((call) => ({ ...structuredClone(call), status: "Completed" })),
    rejectedCall: {
      toolName: rawReceipt.rejectedCall.toolName,
      inputFieldNames: Object.keys(rawReceipt.rejectedCall.input).sort(),
      status: "Completed",
      output: structuredClone(rawReceipt.rejectedCall.output),
      canonicalOutputSha256: rawReceipt.rejectedCall.canonicalOutputSha256,
    },
    console: { messageCount: 0, errorCount: 0, types: [] },
    limitations: [...SUPPORTED_HOST_REVIEWED_LIMITATIONS],
  };
  const reviewedFile = {
    relativePath: "docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json",
    sha256: "c".repeat(64),
    sizeBytes: 2_048,
  };
  const exactRawReceipt = rawReceiptFor(evidence, reviewed);
  const exactRawReceiptFile = jsonFile(releasedRawChromePath, exactRawReceipt);
  const exactRawArtefact = evidence.artefacts.find(({ kind }) => kind === "raw-receipt");
  exactRawArtefact.sha256 = exactRawReceiptFile.sha256;
  exactRawArtefact.sizeBytes = exactRawReceiptFile.sizeBytes;
  reviewed.sourceReceipt.sha256 = exactRawReceiptFile.sha256;
  reviewed.sourceReceipt.sizeBytes = exactRawReceiptFile.sizeBytes;
  const releaseContext = {
    liveVerificationFile,
    liveVerification,
    deployment,
    rawReceipt: exactRawReceipt,
    rawReceiptFile: exactRawReceiptFile,
  };
  assert.deepEqual(validateSupportedHostReviewedArtefact(reviewed, evidence, reviewedFile, releaseContext), {
    rawReceiptSha256: exactRawReceiptFile.sha256,
    reviewedEvidenceSha256: "c".repeat(64),
  });

  const rawBindingDrift = structuredClone(reviewed);
  rawBindingDrift.sourceReceipt.sha256 = "0".repeat(64);
  assert.throws(
    () => validateSupportedHostReviewedArtefact(rawBindingDrift, evidence, reviewedFile, releaseContext),
    /raw-receipt binding/u,
  );
  const deploymentDrift = structuredClone(reviewed);
  deploymentDrift.target.deployment.commit = "0".repeat(40);
  assert.throws(
    () => validateSupportedHostReviewedArtefact(deploymentDrift, evidence, reviewedFile, releaseContext),
    /deployment identity|exact stable deployment/u,
  );
  const reviewedResultDrift = structuredClone(reviewed);
  reviewedResultDrift.calls[0].output.returned += 1;
  assert.throws(
    () => validateSupportedHostReviewedArtefact(reviewedResultDrift, evidence, reviewedFile, releaseContext),
    /result differs/u,
  );
  const duplicateCall = structuredClone(reviewed);
  duplicateCall.calls.push(structuredClone(duplicateCall.calls[0]));
  assert.throws(
    () => validateSupportedHostReviewedArtefact(duplicateCall, evidence, reviewedFile, releaseContext),
    /different call count/u,
  );
  const releaseDrift = structuredClone(reviewed);
  releaseDrift.releaseEvidence.artifactApiDigest = `sha256:${"0".repeat(64)}`;
  assert.throws(
    () => validateSupportedHostReviewedArtefact(releaseDrift, evidence, reviewedFile, releaseContext),
    /Pages artefact binding|fixed candidate artefact binding/u,
  );
  const liveReceiptDrift = structuredClone(releaseContext);
  liveReceiptDrift.liveVerification.fileCount += 1;
  assert.throws(
    () => validateSupportedHostReviewedArtefact(reviewed, evidence, reviewedFile, liveReceiptDrift),
    /does not bind HTTP 200|complete-file binding|fixed candidate receipt/u,
  );
  const limitationDrift = structuredClone(reviewed);
  limitationDrift.limitations[0] = "This replacement limitation is non-empty but does not retain the reviewed boundary.";
  assert.throws(
    () => validateSupportedHostReviewedArtefact(limitationDrift, evidence, reviewedFile, releaseContext),
    /fixed public boundary statements/u,
  );
  const titleDrift = structuredClone(reviewed);
  titleDrift.discovery.tools[0].title = "Different title";
  assert.throws(
    () => validateSupportedHostReviewedArtefact(titleDrift, evidence, reviewedFile, releaseContext),
    /definition differs/u,
  );
  const retainedRejectedValue = structuredClone(reviewed);
  retainedRejectedValue.rejectedCall.input = { personalContext: "PRIVATE-VALUE", query: "housing" };
  assert.throws(
    () => validateSupportedHostReviewedArtefact(retainedRejectedValue, evidence, reviewedFile, releaseContext),
    /unknown fields/u,
  );
  const nodeDrift = structuredClone(reviewed);
  nodeDrift.environment.node = "v999.0.0";
  assert.throws(
    () => validateSupportedHostReviewedArtefact(nodeDrift, evidence, reviewedFile, releaseContext),
    /different browser, bridge, Node or isolation identities/u,
  );
  assert.throws(
    () => validateSupportedHostReviewedArtefact(reviewed, evidence, { ...reviewedFile, sha256: "0".repeat(64) }, releaseContext),
    /bytes do not match/u,
  );
});

test("co-digested supported-host identity drift fails semantic candidate validation", () => {
  const evidence = hostEvidenceFixture();
  const reviewed = structuredClone(releasedReviewedChrome);
  reviewed.schema = "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v3";
  reviewed.deploymentChecks = supportedHostDeploymentChecks(reviewed.observedAt);
  reviewed.limitations = [...SUPPORTED_HOST_REVIEWED_LIMITATIONS];
  evidence.host.name = "Generic browser through a generic bridge";
  evidence.host.version = "Google Chrome 999.0.0.0";
  reviewed.environment.chrome = evidence.host.version;

  const reviewedBytes = Buffer.from(`${JSON.stringify(reviewed, null, 2)}\n`);
  const reviewedSha256 = createHash("sha256").update(reviewedBytes).digest("hex");
  const reviewedArtefact = evidence.artefacts.find(({ kind }) => kind === "reviewed-public-evidence");
  reviewedArtefact.sha256 = reviewedSha256;
  reviewedArtefact.sizeBytes = reviewedBytes.byteLength;

  const evidenceBytes = Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`);
  const evidenceSha256 = createHash("sha256").update(evidenceBytes).digest("hex");
  const clipReceipt = structuredClone(releasedHostClipReceipt);
  clipReceipt.sourceEvidence.sha256 = evidenceSha256;
  clipReceipt.sourceArtefacts.find(({ path }) => path === releasedReviewedChromePath).sha256 = reviewedSha256;

  const scene = config.scenes.find(({ id }) => id === "webmcp");
  const evidenceFile = { relativePath: releasedSupportedHostPath, sha256: evidenceSha256 };
  const reviewedFile = {
    relativePath: releasedReviewedChromePath,
    sha256: reviewedSha256,
    sizeBytes: reviewedBytes.byteLength,
  };
  const liveVerificationSha256 = createHash("sha256").update(releasedLiveVerificationBytes).digest("hex");
  const artefactFiles = new Map([
    [releasedReviewedChromePath, { sha256: reviewedSha256 }],
    [releasedLiveVerificationPath, { sha256: liveVerificationSha256 }],
  ]);
  const media = {
    sha256: releasedHostClipReceipt.media.sha256,
    durationSeconds: releasedHostClipReceipt.media.durationSeconds,
  };
  assert.equal(
    validateHostMediaReceipt(clipReceipt, config, scene, media, evidenceFile, artefactFiles).sourceArtefactCount,
    2,
  );

  assert.throws(
    () => validateSupportedHostEvidence(evidence, config, demonstratedRecordId),
    /supported Chrome host class and version/u,
  );
  assert.throws(
    () => validateSupportedHostReviewedArtefact(
      reviewed,
      evidence,
      reviewedFile,
      {
        liveVerificationFile: {
          relativePath: releasedLiveVerificationPath,
          sha256: liveVerificationSha256,
          sizeBytes: releasedLiveVerificationBytes.byteLength,
        },
        liveVerification: releasedLiveVerification,
        deployment: releasedInteractionCapture.deployment,
      },
    ),
    /supported Chrome host class|exact private Chrome receipt/u,
  );
});

test("release evidence timestamps reject future observations", () => {
  const futureEvidence = hostEvidenceFixture();
  futureEvidence.capturedAt = "2099-01-01T00:00:00.000Z";
  assert.throws(
    () => validateSupportedHostEvidence(futureEvidence, config, demonstratedRecordId),
    /five minutes in the future/u,
  );

  const futureReviewed = structuredClone(releasedReviewedChrome);
  futureReviewed.schema = "trusted-govuk-discovery.chrome-devtools-webmcp-public-evidence.v3";
  futureReviewed.deploymentChecks = supportedHostDeploymentChecks(futureReviewed.observedAt);
  futureReviewed.limitations = [...SUPPORTED_HOST_REVIEWED_LIMITATIONS];
  futureReviewed.observedAt = "2099-01-01T00:00:00.000Z";
  const supportedEvidence = hostEvidenceFixture();
  const reviewedArtefact = supportedEvidence.artefacts.find(({ kind }) => kind === "reviewed-public-evidence");
  assert.throws(
    () => validateSupportedHostReviewedArtefact(
      futureReviewed,
      supportedEvidence,
      {
        relativePath: releasedReviewedChromePath,
        sha256: reviewedArtefact.sha256,
        sizeBytes: reviewedArtefact.sizeBytes,
      },
      {
        liveVerificationFile: {
          relativePath: releasedLiveVerificationPath,
          sha256: createHash("sha256").update(releasedLiveVerificationBytes).digest("hex"),
          sizeBytes: releasedLiveVerificationBytes.byteLength,
        },
        liveVerification: releasedLiveVerification,
        deployment: releasedInteractionCapture.deployment,
      },
    ),
    /five minutes in the future/u,
  );
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
    limitations: [
      "One manual journey in one environment is not a WCAG conformance assessment.",
      requiredVoiceOverCaptureLimitations.at(-1),
    ],
    media: {
      path: "output/demo-clips/v0.4.0-rc.1/06-voiceover.mov",
      sha256: "c".repeat(64),
      startSeconds: 0,
      endSeconds: 30,
      captureStartedAt: "2026-08-31T09:55:00Z",
      captureEndedAt: "2026-08-31T10:05:00Z",
      captureManifestPath: RELEASE_EVIDENCE_PATHS.voiceOverCaptureManifest,
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
  const excludedSubdomain = voiceOverFixture();
  excludedSubdomain.journey.find(({ id }) => id === "source-link-role-and-destination").details.destinationHostname = "www.legislation.gov.uk";
  assert.throws(() => validateVoiceOverEvidence(excludedSubdomain, config), /excluded legislation hostname/u);
  const falseAudioClaim = voiceOverFixture();
  falseAudioClaim.screenReaderAudioCaptured = true;
  assert.throws(() => validateVoiceOverEvidence(falseAudioClaim, config), /screen-reader audio was not captured/u);
  const missingDeploymentBoundary = voiceOverFixture();
  missingDeploymentBoundary.limitations.pop();
  assert.throws(() => validateVoiceOverEvidence(missingDeploymentBoundary, config), /capture-time cryptographic binding/u);
  const privateEnvironmentDetail = voiceOverFixture();
  privateEnvironmentDetail.environment.accountEmail = "private@example.invalid";
  assert.throws(() => validateVoiceOverEvidence(privateEnvironmentDetail, config), /VoiceOver environment has unknown fields/u);
  const alternateManifestRoot = voiceOverFixture();
  alternateManifestRoot.media.captureManifestPath = "output/voiceover-capture/alternate/v0.4.0-rc.1-capture-manifest.json";
  assert.throws(() => validateVoiceOverEvidence(alternateManifestRoot, config), /exact canonical release path/u);
});

test("VoiceOver media is bound to the scene and immutable capture manifest", () => {
  const scene = config.scenes.find(({ id }) => id === "voiceover");
  const evidence = voiceOverFixture();
  validateVoiceOverMediaBinding(evidence, scene, { sha256: "c".repeat(64), durationSeconds: 35 });
  evidence.media.sha256 = "e".repeat(64);
  assert.throws(() => validateVoiceOverMediaBinding(evidence, scene, { sha256: "c".repeat(64), durationSeconds: 35 }), /SHA-256/u);
});

function voiceOverCaptureFixture() {
  const evidence = voiceOverFixture();
  evidence.observedAt = "2026-08-31T10:05:00Z";
  const holdSeconds = [4, 4, 4, 3, 3, 3, 3, 3, 3];
  const start = Date.parse(evidence.media.captureStartedAt);
  return {
    evidence,
    manifest: {
      schema: "trusted-govuk-discovery.voiceover-screenshot-sequence-capture.v1",
      capturedAt: evidence.observedAt,
      page: structuredClone(evidence.page),
      captureMethod: "manual-safari-voiceover-screenshot-sequence",
      manual: true,
      assistiveTechnologyActuallyUsed: true,
      withoutWebMCP: true,
      noWcagConformanceClaim: true,
      browser: { name: "Safari", version: "26.5.2 (21624.2.5.11.8)" },
      screenReader: { name: "VoiceOver", version: "10 (993)" },
      continuousRecording: false,
      frames: requiredVoiceOverJourneyIds.map((id, index) => ({
        id,
        path: RELEASE_VOICEOVER_FRAME_PATHS[index],
        sha256: String(index + 1).repeat(64),
        capturedAt: new Date(start + (index * 75_000)).toISOString().replace(".000Z", "Z"),
        holdSeconds: holdSeconds[index],
        label: `Manual checkpoint ${index + 1}: ${id}`,
      })),
      limitations: [...requiredVoiceOverCaptureLimitations],
    },
  };
}

test("final-video VoiceOver preflight revalidates the manifest and every frame byte binding", () => {
  const { evidence, manifest } = voiceOverCaptureFixture();
  assert.deepEqual(validateVoiceOverCaptureManifest(manifest, evidence, config), { frameCount: 9, totalHoldSeconds: 30 });
  const file = { relativePath: manifest.frames[0].path, sizeBytes: 12_000, sha256: manifest.frames[0].sha256 };
  assert.equal(validateVoiceOverFrameFile(manifest.frames[0], file), file);

  const coDigestedManifestMutation = structuredClone(manifest);
  coDigestedManifestMutation.frames[0].sha256 = "e".repeat(64);
  assert.throws(
    () => validateVoiceOverFrameFile(coDigestedManifestMutation.frames[0], file),
    /SHA-256 has drifted/u,
  );
  const missingBoundary = structuredClone(manifest);
  missingBoundary.limitations = missingBoundary.limitations.filter((value) => !value.includes("WCAG"));
  assert.throws(() => validateVoiceOverCaptureManifest(missingBoundary, evidence, config), /WCAG conformance/u);
  const outsideInterval = structuredClone(manifest);
  outsideInterval.frames[0].capturedAt = "2026-08-31T09:54:59Z";
  assert.throws(() => validateVoiceOverCaptureManifest(outsideInterval, evidence, config), /outside the manual capture interval/u);
  const alternateFrameRoot = structuredClone(manifest);
  alternateFrameRoot.frames[0].path = "output/voiceover-capture/alternate/v0.4.0-rc.1-frame-01-page-title-and-headings.png";
  assert.throws(() => validateVoiceOverCaptureManifest(alternateFrameRoot, evidence, config), /exact nine canonical release frame paths/u);
});

function interactionCaptureFixture() {
  const interactionScenes = config.scenes.filter(({ kind }) => kind === "interaction");
  const deploymentCheckLabels = [
    "initial",
    ...interactionScenes.flatMap(({ id }) => [`before:${id}`, `after:${id}`]),
    "complete",
  ];
  const mediaById = new Map(interactionScenes.map((scene, index) => [scene.id, { sha256: String(index + 1).repeat(64), durationSeconds: 32 }]));
  const observations = {
    "evidence-answer": { activeView: "guided", heading: "Evidence answer", activity: "No AI action was presented to this page.", presentationState: "empty" },
    "present-evidence": { query: "housing", collections: config.demonstrationInputs.collections, limit: 8, selectedRecordId: demonstratedRecordId, resultKind: "federated-record", evidenceDigest: "f".repeat(64), sourceCount: 1, limitationCount: 2, routeView: "guided" },
    "comparison-guide": { selectedRecordId: demonstratedRecordId, actionEvidenceDigest: "f".repeat(64), restoredEvidenceDigest: "e".repeat(64), restoredAcceptedInput: null, sameEvidenceExceptAcceptedInput: true, guideHeadings: ["From this page", "From your AI", "Check carefully"], sourceLinkCount: 1, limitationCount: 2 },
    "technical-review": { activeView: "technical", answerId: config.demonstrationInputs.reviewedAnswerId, claimIds: config.demonstrationInputs.reviewedClaimIds, comparisonRowCount: 11, registeredToolCount: 0, expectedToolCount: 6, trustScoreShown: false, legacyRoutePreserved: true },
    boundary: { sameOriginOnly: true, browserStorage: { local: 0, session: 0, cookies: "" }, modelProviderRequestCount: 0, officialApiRequestCount: 0, landRegistryMetadataOnly: true, standaloneLegislationCollection: false, standaloneLegislationPayload: false, standaloneLegislationIndex: false, legislationRuntimeRequestCount: 0, excludedHostnameResultLinkCount: 0, impactClaimsFramedAsHypotheses: true, remoteProviderDisclosureVisible: true, registeredToolCount: 0, expectedToolCount: 6, reviewedRecordCount: 80, federatedSourceRecordCount: 58_655, federatedRecordCount: 58_652, federatedQuarantinedRecordCount: 3 },
  };
  return {
    interactionScenes,
    mediaById,
    evidence: {
      schema: "govuk-webmcp.demo-live-interaction-capture.v4",
      capturedAt: "2026-08-31T10:00:00Z",
      page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
      deployment: { metadataUrl: `${config.productUrl}deployment.json`, metadataSha256: "9".repeat(64) },
      deploymentChecks: deploymentCheckLabels.map((label) => ({
        label,
        observedAt: "2026-08-31T10:00:00Z",
        metadataSha256: "9".repeat(64),
        commit: config.productCommit,
        runId: config.pagesRunId,
      })),
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

function validateInteractionFixture(fixture, expectedDeploymentSha256 = fixture.evidence.deployment.metadataSha256) {
  return validateInteractionCaptureEvidence(
    fixture.evidence,
    config,
    fixture.interactionScenes,
    fixture.mediaById,
    expectedDeploymentSha256,
  );
}

test("live interaction v4 receipt binds Evidence answer, Technical review and boundaries", () => {
  const fixture = interactionCaptureFixture();
  assert.deepEqual(validateInteractionFixture(fixture), {
    clipCount: 5,
    captureMethod: "playwright-public-site-interaction",
    deployment: fixture.evidence.deployment,
    demonstratedRecordId,
    presentationDigest: "f".repeat(64),
  });
  const missing = interactionCaptureFixture();
  missing.evidence.clips.find(({ sceneId }) => sceneId === "comparison-guide").observation.guideHeadings.pop();
  assert.throws(() => validateInteractionFixture(missing), /three plain-English perspectives/u);
  const legislation = interactionCaptureFixture();
  legislation.evidence.clips.find(({ sceneId }) => sceneId === "boundary").observation.legislationRuntimeRequestCount = 1;
  assert.throws(() => validateInteractionFixture(legislation), /legislation.gov.uk exclusion/u);
  const digestDrift = interactionCaptureFixture();
  digestDrift.evidence.clips[0].sha256 = "0".repeat(64);
  assert.throws(() => validateInteractionFixture(digestDrift), /configured media/u);
  const ambiguousClipTime = interactionCaptureFixture();
  ambiguousClipTime.evidence.clips[0].capturedAt = "1";
  assert.throws(
    () => validateInteractionFixture(ambiguousClipTime),
    /RFC 3339 UTC/u,
  );
  const receiptBeforeClips = interactionCaptureFixture();
  receiptBeforeClips.evidence.capturedAt = "2026-08-31T09:59:59Z";
  assert.throws(() => validateInteractionFixture(receiptBeforeClips), /receipt predates one or more captured clips/u);
  const staleReceipt = interactionCaptureFixture();
  staleReceipt.evidence.capturedAt = "2026-08-31T10:05:01Z";
  assert.throws(() => validateInteractionFixture(staleReceipt), /more than five minutes after the final captured clip/u);
  const deploymentDrift = interactionCaptureFixture();
  assert.throws(
    () => validateInteractionFixture(deploymentDrift, "a".repeat(64)),
    /differs from the fresh public deployment/u,
  );
  const missingDeploymentCheck = interactionCaptureFixture();
  missingDeploymentCheck.evidence.deploymentChecks.splice(2, 1);
  assert.throws(
    () => validateInteractionFixture(missingDeploymentCheck),
    /ordered initial, before, after and complete deployment checks/u,
  );
  const deploymentCheckDrift = interactionCaptureFixture();
  deploymentCheckDrift.evidence.deploymentChecks[3].metadataSha256 = "a".repeat(64);
  assert.throws(
    () => validateInteractionFixture(deploymentCheckDrift),
    /does not bind the exact stable deployment/u,
  );
  const deploymentCheckOrderDrift = interactionCaptureFixture();
  deploymentCheckOrderDrift.evidence.deploymentChecks[4].observedAt = "2026-08-31T09:59:59Z";
  assert.throws(
    () => validateInteractionFixture(deploymentCheckOrderDrift),
    /deployment checks are not chronological/u,
  );
  const historical = interactionCaptureFixture();
  historical.evidence.schema = "trusted-govuk-discovery.demo-live-interaction-capture.v2";
  assert.throws(() => validateInteractionFixture(historical), /wrong schema/u);

  for (const unsafeSourceUrl of [
    "https://user:secret@chris-page-gov.github.io/govuk-webmcp/",
    "https://chris-page-gov.github.io:443/govuk-webmcp/",
    "https://chris-page-gov.github.io/govuk-webmcp/?unexpected=1",
    "https://chris-page-gov.github.io/govuk-webmcp/#other=1",
  ]) {
    const unsafeSource = interactionCaptureFixture();
    unsafeSource.evidence.clips[0].sourceUrl = unsafeSourceUrl;
    assert.throws(
      () => validateInteractionFixture(unsafeSource),
      /source URL does not identify the configured release/u,
    );
  }
});

test("human and supported-host receipts must retain one Evidence answer digest", () => {
  const hostSummary = validateSupportedHostEvidence(
    hostEvidenceFixture(),
    config,
    demonstratedRecordId,
  );
  assert.equal(
    validateCrossReceiptPresentationParity(
      { presentationDigest: hostSummary.presentationDigest },
      hostSummary,
    ),
    hostSummary.presentationDigest,
  );
  assert.throws(
    () => validateCrossReceiptPresentationParity(
      { presentationDigest: "0".repeat(64) },
      hostSummary,
    ),
    /do not present the same Evidence answer digest/u,
  );
});

test("supported-host clip receipt binds evidence, artefacts and rendered media", () => {
  const scene = config.scenes.find(({ id }) => id === "webmcp");
  const evidenceFile = { relativePath: scene.evidence, sha256: "1".repeat(64), parsed: { capturedAt: "2026-08-31T09:59:00Z" } };
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
  const premature = structuredClone(receipt);
  premature.builtAt = "2026-08-31T09:58:59Z";
  assert.throws(() => validateHostMediaReceipt(premature, config, scene, media, evidenceFile, artefactFiles), /built before its source evidence/u);
  const future = structuredClone(receipt);
  future.builtAt = "2099-01-01T00:00:00Z";
  assert.throws(() => validateHostMediaReceipt(future, config, scene, media, evidenceFile, artefactFiles), /five minutes in the future/u);
  const invalidRange = structuredClone(receipt);
  invalidRange.media.endSeconds = 0;
  assert.throws(() => validateHostMediaReceipt(invalidRange, config, scene, media, evidenceFile, artefactFiles), /invalid media range/u);
  receipt.media.sha256 = "4".repeat(64);
  assert.throws(() => validateHostMediaReceipt(receipt, config, scene, media, evidenceFile, artefactFiles), /path or SHA-256/u);
});

test("current tracked supported-host clip receipt binds the actual clone-side sources", () => {
  const scene = config.scenes.find(({ id }) => id === "webmcp");
  const supportedHostSha256 = createHash("sha256").update(releasedSupportedHostBytes).digest("hex");
  const reviewedChromeSha256 = createHash("sha256").update(releasedReviewedChromeBytes).digest("hex");
  const liveVerificationSha256 = createHash("sha256").update(releasedLiveVerificationBytes).digest("hex");
  const evidenceFile = {
    relativePath: releasedSupportedHostPath,
    sha256: supportedHostSha256,
  };
  const artefactFiles = new Map([
    [releasedReviewedChromePath, { sha256: reviewedChromeSha256 }],
    [releasedLiveVerificationPath, { sha256: liveVerificationSha256 }],
  ]);
  const media = {
    sha256: releasedHostClipReceipt.media.sha256,
    durationSeconds: releasedHostClipReceipt.media.durationSeconds,
  };

  assert.deepEqual(releasedHostClipReceipt.sourceEvidence, {
    path: releasedSupportedHostPath,
    sha256: supportedHostSha256,
  });
  assert.deepEqual(releasedHostClipReceipt.sourceArtefacts, [
    { path: releasedReviewedChromePath, sha256: reviewedChromeSha256 },
    { path: releasedLiveVerificationPath, sha256: liveVerificationSha256 },
  ]);
  assert.equal(
    validateHostMediaReceipt(
      releasedHostClipReceipt,
      config,
      scene,
      media,
      evidenceFile,
      artefactFiles,
    ).sourceArtefactCount,
    2,
  );

  const duplicatedBinding = structuredClone(releasedHostClipReceipt);
  duplicatedBinding.sourceArtefacts[1] = structuredClone(duplicatedBinding.sourceArtefacts[0]);
  assert.throws(
    () => validateHostMediaReceipt(
      duplicatedBinding,
      config,
      scene,
      media,
      evidenceFile,
      artefactFiles,
    ),
    /every host artefact exactly once/u,
  );

  const hostSurfaceClaim = structuredClone(releasedHostClipReceipt);
  hostSurfaceClaim.rendering.hostOwnedSurfaceEmbedded = true;
  assert.throws(
    () => validateHostMediaReceipt(
      hostSurfaceClaim,
      config,
      scene,
      media,
      evidenceFile,
      artefactFiles,
    ),
    /without host-owned recording content/u,
  );
});

const personalAgentStoryIds = Array.from({ length: 12 }, (_, index) => `US-${String(index + 1).padStart(2, "0")}`);

function ollamaDiagnosticEvidenceFixture() {
  const caseSetSha256 = "e".repeat(64);
  const privateCapture = {
    schema: CAPTURE_SCHEMA,
    suiteId: "beginner-evidence-v1",
    caseSetSha256,
    comparisonDesign: "observational",
    runs: personalAgentStoryIds.flatMap((caseId) => [1, 2, 3].map((repetition) => ({
      hostId: "ollama-local",
      caseId,
      repetition,
      observedAt: "2026-09-01T21:25:56.524Z",
      hostIdentity: {
        modelStatus: "observed-exact",
        model: "ollama:gpt-oss:20b",
        inventorySha256: "17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7",
        executionBound: true,
      },
      executionContext: { deployment: { kind: "local-loopback", url: "http://127.0.0.1:4173/" } },
    }))),
  };
  const publicSummary = {
    schema: "govuk-webmcp.personal-agent-evaluation-summary.v2",
    suiteId: "beginner-evidence-v1",
    caseSetSha256,
    comparisonDesign: "observational",
    causalClaimSupported: false,
    evidenceStatus: "partial",
    plannedRunCount: 72,
    observedRunCount: 36,
    missingRunCount: 36,
    missingRunKeys: personalAgentStoryIds.flatMap((caseId) => [1, 2, 3].map((repetition) => `copilot-mcp-workspace/${caseId}/${repetition}`)),
    matrixComplete: false,
    observationWindow: { earliest: "2026-09-01T21:25:56.524Z", latest: "2026-09-01T21:25:56.524Z" },
    hosts: [{ hostId: "ollama-local", observedRunCount: 36, missingRunCount: 0, callTrace: { observed: 36, "not-observable": 0 } }],
    liveReleaseBinding: { status: "not-supplied", boundRunCount: 0, unboundRunCount: 36 },
    criteria: {
      toolSelection: { pass: 6, fail: 30, "not-observable": 0, missing: 36 },
      deterministicExecution: { pass: 6, fail: 30, "not-observable": 0, missing: 36 },
      pageParity: { pass: 0, fail: 0, "not-observable": 36, missing: 36 },
      answerSafety: { pass: 0, fail: 0, "not-reviewed": 36, missing: 36 },
    },
    claimGatePassed: false,
  };
  return { privateCapture, publicSummary, structuralSummary: structuredClone(publicSummary) };
}

function ollamaDiagnosticClipFixture() {
  const source = ollamaDiagnosticEvidenceFixture();
  const diagnosticEvidence = validateOllamaDiagnosticEvidence(source.publicSummary, source.privateCapture, source.structuralSummary);
  const scene = {
    id: ollamaDiagnosticSceneContract.sceneId,
    media: { path: ollamaDiagnosticSceneContract.mediaPath, startSeconds: 0 },
    evidence: ollamaDiagnosticSceneContract.publicEvidencePath,
    privateEvidence: ollamaDiagnosticSceneContract.privateEvidencePath,
    mediaReceipt: ollamaDiagnosticSceneContract.mediaReceiptPath,
  };
  const privateFile = { relativePath: scene.privateEvidence, sha256: "1".repeat(64) };
  const publicFile = { relativePath: scene.evidence, sha256: "2".repeat(64) };
  const media = { sha256: "3".repeat(64), durationSeconds: 36 };
  const receipt = {
    schema: "govuk-webmcp.ollama-diagnostic-clip.v1",
    builtAt: "2026-09-01T22:30:00Z",
    demoContext: { release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId, sceneId: scene.id },
    sourceEvaluation: {
      privatePath: privateFile.relativePath,
      privateSha256: privateFile.sha256,
      privateSchema: source.privateCapture.schema,
      publicPath: publicFile.relativePath,
      publicSha256: publicFile.sha256,
      publicSchema: source.publicSummary.schema,
      suiteId: source.privateCapture.suiteId,
      caseSetSha256: source.privateCapture.caseSetSha256,
    },
    host: diagnosticEvidence.host,
    diagnostic: diagnosticEvidence.diagnostic,
    rendering: {
      kind: "diagnostic-receipt-visualisation",
      hostRecordingEmbedded: false,
      hostOwnedSurfaceEmbedded: false,
      pageUpdateShown: false,
      visibleLabel: "Diagnostic receipt — not a host recording",
    },
    media: { path: scene.media.path, sha256: media.sha256, durationSeconds: 36, startSeconds: 0, endSeconds: 36 },
    limitations: [
      "This generated receipt visualisation is not a host recording.",
      "A page update was not observed in the headless local evaluation.",
      "This diagnostic does not support a claim that the local host answers safely.",
      "The local diagnostic was not bound to the live release and cannot establish deployed-page parity.",
    ],
  };
  return { ...source, diagnosticEvidence, scene, privateFile, publicFile, media, receipt };
}

test("Ollama scene discloses an independently replayed diagnostic failure rather than a host capture", () => {
  const fixture = ollamaDiagnosticClipFixture();
  assert.deepEqual(fixture.diagnosticEvidence.diagnostic.criteria, {
    toolSelection: { pass: 6, fail: 30, "not-observable": 0 },
    deterministicExecution: { pass: 6, fail: 30, "not-observable": 0 },
    pageParity: { pass: 0, fail: 0, "not-observable": 36 },
    answerSafety: { pass: 0, fail: 0, "not-reviewed": 36 },
  });
  const result = validateOllamaDiagnosticClipReceipt(fixture.receipt, config, fixture.scene, fixture.media, fixture.privateFile, fixture.publicFile, fixture.diagnosticEvidence);
  assert.equal(result.renderingKind, "diagnostic-receipt-visualisation");
  assert.equal(result.claimGatePassed, false);
  assert.equal(result.liveReleaseBindingStatus, "not-supplied");
  const html = ollamaDiagnosticPageHtml(fixture.diagnosticEvidence);
  assert.match(html, /Diagnostic receipt — not a host recording/u);
  assert.match(html, /30 failed/u);
  assert.match(html, /36 not observed/u);
  assert.match(html, /36 not reviewed/u);
  assert.match(html, /No safe-host claim/u);
});

test("Ollama diagnostic receipt fails closed on source, model, status and presentation drift", () => {
  const publicDrift = ollamaDiagnosticEvidenceFixture();
  publicDrift.publicSummary.criteria.toolSelection.fail = 29;
  assert.throws(() => validateOllamaDiagnosticEvidence(publicDrift.publicSummary, publicDrift.privateCapture, publicDrift.structuralSummary), /fresh replay/u);

  const modelDrift = ollamaDiagnosticEvidenceFixture();
  modelDrift.privateCapture.runs[0].hostIdentity.inventorySha256 = "0".repeat(64);
  assert.throws(() => validateOllamaDiagnosticEvidence(modelDrift.publicSummary, modelDrift.privateCapture, modelDrift.structuralSummary), /exact pinned local model/u);

  const privateDigestDrift = ollamaDiagnosticClipFixture();
  privateDigestDrift.receipt.sourceEvaluation.privateSha256 = "0".repeat(64);
  assert.throws(() => validateOllamaDiagnosticClipReceipt(privateDigestDrift.receipt, config, privateDigestDrift.scene, privateDigestDrift.media, privateDigestDrift.privateFile, privateDigestDrift.publicFile, privateDigestDrift.diagnosticEvidence), /exact private evaluation bytes/u);

  const presentationDrift = ollamaDiagnosticClipFixture();
  presentationDrift.receipt.rendering.pageUpdateShown = true;
  assert.throws(() => validateOllamaDiagnosticClipReceipt(presentationDrift.receipt, config, presentationDrift.scene, presentationDrift.media, presentationDrift.privateFile, presentationDrift.publicFile, presentationDrift.diagnosticEvidence), /not a host recording or page update/u);

  const prematureBuild = ollamaDiagnosticClipFixture();
  prematureBuild.receipt.builtAt = "2026-09-01T21:25:55Z";
  assert.throws(() => validateOllamaDiagnosticClipReceipt(prematureBuild.receipt, config, prematureBuild.scene, prematureBuild.media, prematureBuild.privateFile, prematureBuild.publicFile, prematureBuild.diagnosticEvidence), /built before its source observation window ended/u);

  const futureBuild = ollamaDiagnosticClipFixture();
  futureBuild.receipt.builtAt = "2099-01-01T00:00:00Z";
  assert.throws(() => validateOllamaDiagnosticClipReceipt(futureBuild.receipt, config, futureBuild.scene, futureBuild.media, futureBuild.privateFile, futureBuild.publicFile, futureBuild.diagnosticEvidence), /five minutes in the future/u);
});

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
        ? { status: "observed", url: "https://copilot.microsoft.com/shares/SYNTHETICTESTSHARE0001" }
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
  const contract = personalAgentSceneContracts[sceneId];
  const scene = hostId === "copilot-mcp-workspace"
    ? { id: sceneId, media: { path: contract.mediaPath, startSeconds: 0 } }
    : config.scenes.find(({ id }) => id === sceneId);
  const selected = selectedPersonalAgentRun(hostId);
  const runs = ["copilot-mcp-workspace", "ollama-local"].flatMap((matrixHostId) =>
    personalAgentStoryIds.flatMap((caseId) => [1, 2, 3].map((repetition) =>
      matrixHostId === hostId && caseId === "US-09" && repetition === 1
        ? selected
        : { hostId: matrixHostId, caseId, repetition })));
  const sourceCapture = {
    schema: CAPTURE_SCHEMA,
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
  structural.liveReleaseBinding.status = "authenticated";
  structural.evidenceStatus = "complete";
  structural.claimGatePassed = true;
  const authenticated = structuredClone(structural);
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

test("media admission accepts only an exact fresh authenticated summary replay", () => {
  const fixture = personalAgentSummaryFixture();
  assert.deepEqual(validateAuthenticatedPersonalAgentSummary(fixture.authenticated, fixture.structural, config, fixture.sourceCapture, fixture.liveRelease), {
    status: "authenticated",
    claimGatePassed: true,
    caseSetSha256: fixture.sourceCapture.caseSetSha256,
  });
  const overstated = personalAgentSummaryFixture();
  overstated.structural.criteria.toolSelection["not-observable"] = 1;
  assert.throws(() => validateAuthenticatedPersonalAgentSummary(overstated.authenticated, overstated.structural, config, overstated.sourceCapture, overstated.liveRelease), /inconsistent claim gate/u);

  const forged = personalAgentSummaryFixture();
  forged.structural.liveReleaseBinding.status = "structurally-valid";
  assert.throws(
    () => validateAuthenticatedPersonalAgentSummary(forged.authenticated, forged.structural, config, forged.sourceCapture, forged.liveRelease),
    /requires a fresh in-process authenticated replay/u,
  );
});

function chronologyOnlyCapture(caseSetSha256, observedAt, createdAt, liveRelease) {
  const notObservableValue = { status: "not-observable", value: null };
  const notObservableErrors = { status: "not-observable", errors: null };
  return {
    schema: CAPTURE_SCHEMA,
    suiteId: "beginner-evidence-v1",
    caseSetSha256,
    comparisonDesign: "observational",
    createdAt,
    runs: [{
      hostId: "copilot-mcp-workspace",
      caseId: "US-01",
      repetition: 1,
      observedAt,
      hostIdentity: {
        modelStatus: "not-disclosed",
        model: null,
        inventorySha256: null,
        executionBound: "not-observable",
      },
      executionContext: {
        hostVersion: structuredClone(notObservableValue),
        browser: { status: "not-observable", product: null, version: null },
        visibleMode: "not-observable",
        exposedTools: { status: "not-observable", names: null },
        share: { status: "not-observable", url: null },
        deployment: {
          kind: "public-pages",
          url: liveRelease.baseUrl,
          commitSha: liveRelease.commit,
          worktreeStatus: "not-applicable",
        },
        diagnostics: {
          browserConsole: structuredClone(notObservableErrors),
          pageErrors: structuredClone(notObservableErrors),
          networkErrors: structuredClone(notObservableErrors),
          runnerErrors: structuredClone(notObservableErrors),
        },
        measurements: {
          interactionSteps: structuredClone(notObservableValue),
          latencyMilliseconds: structuredClone(notObservableValue),
        },
      },
      callTrace: { status: "not-observable", calls: null },
      pageObservation: {
        status: "not-observable",
        before: null,
        after: null,
        url: null,
        history: null,
        storage: null,
      },
      criteria: {
        toolSelection: "not-observable",
        deterministicExecution: "not-observable",
        pageParity: "not-observable",
        answerSafety: "not-reviewed",
      },
      answerReview: {
        status: "not-captured",
        outcome: null,
        text: null,
        transcriptSha256: null,
        byteLength: null,
        reviewerClass: null,
        checks: [],
        unsafeCategories: [],
      },
    }],
  };
}

test("final-video preflight rejects a run one millisecond before its authenticated pre-run receipt and disposes authentication", async () => {
  const loadedCaseSet = await loadAndValidateCaseSet();
  const preRunLiveRelease = structuredClone(releasedLiveVerification);
  preRunLiveRelease.observedAt = "2026-09-01T20:56:25.967Z";
  const freshObservedAt = "2026-09-01T21:00:00.000Z";
  const sourceCapture = chronologyOnlyCapture(
    loadedCaseSet.caseSetSha256,
    "2026-09-01T20:56:25.966Z",
    freshObservedAt,
    preRunLiveRelease,
  );
  let authenticatedRelease;
  let requestedCheckoutPolicy = null;

  await assert.rejects(
    () => authenticateFinalVideoPersonalAgentSummary(
      {
        sourceCapture,
        loadedCaseSet,
        suppliedSummary: {},
        config,
        preRunLiveRelease,
      },
      {
        authenticateImplementation: async (candidate, authenticationOptions) => {
          requestedCheckoutPolicy = authenticationOptions.checkoutPolicy;
          authenticatedRelease = await authenticateEvaluationReleaseReceipt(candidate, {
            authenticateImplementation: (value) => authenticateLivePagesReceipt(
              value,
              async () => ({ receipt: { ...structuredClone(value), observedAt: freshObservedAt } }),
            ),
            checkoutPolicy: authenticationOptions.checkoutPolicy,
            gitIdentityImplementation: async () => ({
              commit: candidate.commit,
              status: "",
              productIsAncestor: true,
              changedEntries: [],
            }),
            localBindingImplementation: async () => {},
            runtimeSnapshotImplementation: async () => ({
              runtimeFactory: async () => { throw new Error("The chronology gate must run before canonical replay."); },
              verifyGeneratedArtifacts: async () => {},
              revalidate: async () => {},
              dispose: async () => {},
            }),
          });
          return authenticatedRelease;
        },
      },
    ),
    /observedAt must not be earlier than the supplied pre-run live receipt observedAt/u,
  );
  assert.ok(authenticatedRelease);
  assert.equal(requestedCheckoutPolicy, "clean-evidence-descendant");
  assert.equal(await disposeEvaluationReleaseReceipt(authenticatedRelease), false);
});

test("personal-agent media retains the genuine release-bound Copilot gates", () => {
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

test("final verification scopes private-input publication without hiding the public provenance binding", () => {
  const disclosure = describePrivateInputPublication([
    { publiclyReportable: false },
    { publiclyReportable: false },
    { publiclyReportable: true },
  ]);
  assert.deepEqual(disclosure, {
    directlyVerifiedCount: 2,
    directPrivateInputInventoryPublished: false,
    publicProvenanceBindings: [
      {
        privateInputPath: ".evals/chrome-devtools-mcp-public.json",
        publicReceiptPaths: [
          "docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json",
          "docs/competition/evidence/supported-host-webmcp-capture-v0.4.0-rc.1.json",
        ],
        privateInputPathAndSha256BindingPublished: true,
        bindingCount: 1,
        sourceBytesDirectlyVerifiedByBuild: false,
        purpose: "Retain one deduplicated binding to the ignored raw Chrome receipt in the reviewed supported-host evidence without publishing those receipt bytes.",
      },
    ],
  });
  assert.equal(Object.hasOwn(disclosure, "pathsAndDigestsPublished"), false);
});
