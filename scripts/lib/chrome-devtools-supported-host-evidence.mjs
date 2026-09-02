import { createHash } from "node:crypto";

import {
  EVIDENCE_RELEASE,
  RELEASE_EVIDENCE_PATHS,
} from "./release-evidence-paths.mjs";
import { parseUtcRfc3339Timestamp } from "./rfc3339-timestamp.mjs";

export const SUPPORTED_HOST_CAPTURE_SCHEMA = "govuk-webmcp.supported-host-webmcp-capture.v4";
export const SUPPORTED_HOST_RELEASE = EVIDENCE_RELEASE;
export const SUPPORTED_HOST_PUBLIC_URL = "https://chris-page-gov.github.io/govuk-webmcp/";
export const SUPPORTED_HOST_RAW_RECEIPT_PATH = ".evals/chrome-devtools-mcp-public.json";
export const SUPPORTED_HOST_REVIEWED_EVIDENCE_PATH =
  RELEASE_EVIDENCE_PATHS.reviewedChromeEvidence;
export const SUPPORTED_HOST_REVIEWED_LIMITATIONS = Object.freeze([
  "This time-bound capture proves browser-native WebMCP discovery and deterministic execution in Chrome DevTools MCP 1.8.0 against exact public release v0.4.0-rc.1; it is not a general compatibility claim.",
  "Chrome DevTools MCP did not select or evaluate a model, and no model provider was contacted.",
  "The static page tools are page-scoped progressive enhancement, not a durable government MCP service.",
  "Source-derived content remains untrusted; this capture did not refetch or independently certify the cited sources.",
  "The Chrome bridge exposed tool names, descriptions, schemas and annotations but not the application-registered titles; title absence is recorded rather than inferred.",
  "The reviewed public record omits the disposable profile path, host page identifiers, network headers and cookies.",
]);
export const SUPPORTED_HOST_CAPTURE_LIMITATIONS = Object.freeze([
  "This time-bound receipt covers one observed Google Chrome stable and Chrome DevTools MCP version; it is not a general browser-support claim.",
  "Chrome DevTools MCP invoked fixed calls directly. No model selected a tool and no model provider received the exchange.",
  "The raw receipt and this reviewed projection do not show a host-owned surface; the video uses a receipt visualisation and labels it as such.",
  "Source-derived content remains untrusted, and the capture does not refetch or independently certify cited sources.",
  "The Chrome bridge exposed tool names, descriptions, schemas and annotations but not the application-registered titles; title absence is recorded rather than inferred.",
]);
export const SUPPORTED_HOST_FEDERATED_RECORD_ID =
  "govuk-discovery:federated:land-registry:57845";
export const SUPPORTED_HOST_DEPLOYMENT_CHECK_LABELS = Object.freeze([
  "initial",
  "after-page-load",
  "after-execution",
]);

export const SUPPORTED_HOST_DEMONSTRATION_INPUTS = Object.freeze({
  query: "housing",
  collections: Object.freeze([
    "uk-living",
    "ons",
    "government-apis",
    "land-registry",
  ]),
  limit: 8,
  reviewedAnswerId: "answer:new-child-starting-points",
  reviewedClaimIds: Object.freeze([
    "claim:register-a-birth",
    "claim:check-parental-pay-and-leave",
  ]),
  excludedHostname: "legislation.gov.uk",
});

export const SUPPORTED_HOST_EXPECTED_CALLS = Object.freeze([
  Object.freeze({
    name: "search_government_knowledge",
    readOnly: true,
    input: Object.freeze({
      query: SUPPORTED_HOST_DEMONSTRATION_INPUTS.query,
      collections: SUPPORTED_HOST_DEMONSTRATION_INPUTS.collections,
      limit: SUPPORTED_HOST_DEMONSTRATION_INPUTS.limit,
    }),
    schema: "trusted-govuk-discovery.search-result.v2",
  }),
  Object.freeze({
    name: "get_resource_record",
    readOnly: true,
    input: Object.freeze({ recordId: SUPPORTED_HOST_FEDERATED_RECORD_ID }),
    schema: "govuk-webmcp.federated-resource-record-result.v1",
  }),
  Object.freeze({
    name: "show_provenance",
    readOnly: true,
    input: Object.freeze({ recordId: SUPPORTED_HOST_FEDERATED_RECORD_ID }),
    schema: "govuk-webmcp.federated-provenance-result.v1",
  }),
  Object.freeze({
    name: "explore_answer_foundations",
    readOnly: false,
    input: Object.freeze({
      answerId: SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedAnswerId,
      claimId: SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedClaimIds[0],
    }),
    schema: "trusted-govuk-discovery.evidence-exploration-result.v1",
  }),
  Object.freeze({
    name: "compare_evidence_foundations",
    readOnly: false,
    input: Object.freeze({
      answerId: SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedAnswerId,
      claimIds: SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedClaimIds,
    }),
    schema: "trusted-govuk-discovery.evidence-comparison-result.v1",
  }),
  Object.freeze({
    name: "present_resource_evidence",
    readOnly: false,
    input: Object.freeze({ recordId: SUPPORTED_HOST_FEDERATED_RECORD_ID }),
    schema: "govuk-webmcp.present-resource-evidence-result.v1",
  }),
]);

export const FINAL_PAGE_EVALUATION_FUNCTION = `() => {
  const evidenceAnswer = document.querySelector("#evidence-answer-view");
  const diagnostic = document.querySelector("#diagnostic-last-action");
  return {
    lastPresentationAction: diagnostic?.textContent?.trim() ?? null,
    selectedRecordId: evidenceAnswer?.dataset.selectionId ?? null,
    displayEvidenceDigest: evidenceAnswer?.dataset.evidenceDigest ?? null,
  };
}`;

const SHA256 = /^[a-f0-9]{64}$/u;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function exactKeys(value, expected, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object.`);
  invariant(
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort()),
    `${label} has unknown or missing fields.`,
  );
}

function sameValues(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function validateSupportedHostDeploymentChecks(
  checks,
  deployment,
  observedAt,
) {
  invariant(Array.isArray(checks), "Supported-host deployment checks must be an array.");
  invariant(
    sameValues(checks.map(({ label }) => label), SUPPORTED_HOST_DEPLOYMENT_CHECK_LABELS),
    "Supported-host deployment checks must retain the ordered initial, after-page-load and after-execution observations.",
  );
  const expectedRunId = String(deployment?.runId);
  const times = checks.map((check) => {
    exactKeys(
      check,
      ["label", "observedAt", "metadataSha256", "commit", "runId"],
      `Supported-host deployment check ${String(check?.label)}`,
    );
    invariant(
      check.metadataSha256 === deployment?.metadataSha256
        && check.commit === deployment?.commit
        && check.runId === expectedRunId,
      `Supported-host deployment check ${String(check.label)} does not bind the exact stable deployment.`,
    );
    return parseUtcRfc3339Timestamp(
      check.observedAt,
      `Supported-host deployment check ${String(check.label)}`,
    );
  });
  invariant(
    times.every((value, index) => index === 0 || value >= times[index - 1]),
    "Supported-host deployment checks are not chronological.",
  );
  const observed = parseUtcRfc3339Timestamp(observedAt, "Supported-host observation time");
  invariant(
    observed >= times.at(-1),
    "Supported-host observation time predates its final deployment check.",
  );
  return checks;
}

export function assertSupportedHostDemoPlan(config) {
  invariant(config?.release === SUPPORTED_HOST_RELEASE, "The supported-host capture release drifted from the v0.4 plan.");
  invariant(config?.productUrl === SUPPORTED_HOST_PUBLIC_URL, "The supported-host capture URL drifted from the v0.4 plan.");
  const inputs = config?.demonstrationInputs;
  exactKeys(
    inputs,
    ["query", "collections", "limit", "reviewedAnswerId", "reviewedClaimIds", "excludedHostname"],
    "Demo demonstrationInputs",
  );
  invariant(inputs.query === SUPPORTED_HOST_DEMONSTRATION_INPUTS.query, "The demo search query drifted from the supported-host capture.");
  invariant(sameValues(inputs.collections, SUPPORTED_HOST_DEMONSTRATION_INPUTS.collections), "The demo collections drifted from the supported-host capture.");
  invariant(inputs.limit === SUPPORTED_HOST_DEMONSTRATION_INPUTS.limit, "The demo result limit drifted from the supported-host capture.");
  invariant(inputs.reviewedAnswerId === SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedAnswerId, "The demo reviewed answer drifted from the supported-host capture.");
  invariant(sameValues(inputs.reviewedClaimIds, SUPPORTED_HOST_DEMONSTRATION_INPUTS.reviewedClaimIds), "The demo reviewed claims drifted from the supported-host capture.");
  invariant(inputs.excludedHostname === SUPPORTED_HOST_DEMONSTRATION_INPUTS.excludedHostname, "The demo excluded hostname drifted from the supported-host capture.");
  return config;
}

export function parseEvaluateScriptResult(envelope) {
  if (
    envelope
    && typeof envelope === "object"
    && !Array.isArray(envelope)
    && Object.hasOwn(envelope, "lastPresentationAction")
  ) {
    exactKeys(
      envelope,
      ["lastPresentationAction", "selectedRecordId", "displayEvidenceDigest"],
      "Chrome DevTools direct page observation",
    );
    return envelope;
  }

  let text;
  if (Array.isArray(envelope)) {
    invariant(
      envelope.length === 1 && typeof envelope[0] === "string",
      "Chrome DevTools evaluate_script returned an unreadable JSON envelope.",
    );
    [text] = envelope;
  } else if (envelope && typeof envelope === "object") {
    exactKeys(envelope, ["message"], "Chrome DevTools evaluate_script envelope");
    invariant(
      typeof envelope.message === "string",
      "Chrome DevTools evaluate_script returned an unreadable JSON envelope.",
    );
    text = envelope.message;
  } else {
    throw new Error("Chrome DevTools evaluate_script returned an unreadable JSON envelope.");
  }

  invariant(
    text.length > 0 && text.length <= 16_384,
    "Chrome DevTools evaluate_script returned an unreadable JSON envelope.",
  );

  const prefix = "Script ran on page and returned:\n```json\n";
  const suffix = "\n```";
  invariant(
    text.startsWith(prefix) && text.endsWith(suffix),
    "Chrome DevTools evaluate_script returned an unreadable JSON envelope.",
  );
  const body = text.slice(prefix.length, -suffix.length);
  invariant(
    body.length > 0 && body.length <= 8_192 && !body.includes("```"),
    "Chrome DevTools evaluate_script returned an unreadable JSON envelope.",
  );
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Chrome DevTools evaluate_script returned malformed page-observation JSON.");
  }
}

export function validateCapturedPageObservation(
  observation,
  toolEvidenceDigest,
  expectedRecordId = SUPPORTED_HOST_FEDERATED_RECORD_ID,
) {
  exactKeys(
    observation,
    ["lastPresentationAction", "selectedRecordId", "displayEvidenceDigest"],
    "Chrome DevTools final page observation",
  );
  invariant(
    observation.lastPresentationAction === "WebMCP: present_resource_evidence",
    "The page diagnostic did not retain the final WebMCP presentation action.",
  );
  invariant(
    observation.selectedRecordId === expectedRecordId,
    "The Evidence answer selected a different record from the presentation tool.",
  );
  invariant(
    typeof observation.displayEvidenceDigest === "string" && SHA256.test(observation.displayEvidenceDigest),
    "The Evidence answer did not expose a valid display digest.",
  );
  invariant(
    typeof toolEvidenceDigest === "string" && SHA256.test(toolEvidenceDigest),
    "The presentation tool did not return a valid evidence digest.",
  );
  invariant(
    observation.displayEvidenceDigest === toolEvidenceDigest,
    "The displayed Evidence answer digest differs from the presentation tool digest.",
  );
  return {
    ...structuredClone(observation),
    toolEvidenceDigest,
    digestParity: true,
  };
}

export function mapChromeToolDefinition(tool) {
  invariant(typeof tool?.name === "string", "Chrome discovery returned a tool without a name.");
  exactKeys(tool.annotations, ["readOnly", "untrustedContent"], `${tool.name} Chrome annotations`);
  invariant(typeof tool.annotations.readOnly === "boolean", `${tool.name} has no readOnly annotation.`);
  invariant(tool.annotations.untrustedContent === true, `${tool.name} lost its untrusted-content annotation.`);
  const mapped = {
    name: tool.name,
    description: tool.description,
    inputSchema: structuredClone(tool.inputSchema),
    annotations: {
      readOnlyHint: tool.annotations.readOnly,
      untrustedContentHint: tool.annotations.untrustedContent,
    },
  };
  if (typeof tool.title === "string" && tool.title) mapped.title = tool.title;
  return mapped;
}

export function buildSupportedHostEvidence({
  receipt,
  sourceReceiptSha256,
  sourceReceiptSizeBytes,
  reviewedEvidenceSha256,
  reviewedEvidenceSizeBytes,
  liveVerification,
  demoConfig,
}) {
  assertSupportedHostDemoPlan(demoConfig);
  invariant(receipt?.target?.mode === "public" && receipt.target.url === SUPPORTED_HOST_PUBLIC_URL, "Supported-host evidence must come from the allowlisted public capture.");
  invariant(receipt?.target?.deployment?.commit === liveVerification?.commit, "The raw receipt and live verification commit differ.");
  invariant(String(receipt?.target?.deployment?.runId) === String(liveVerification?.runId), "The raw receipt and live verification Pages run differ.");
  invariant(SHA256.test(sourceReceiptSha256), "The raw supported-host receipt SHA-256 is invalid.");
  invariant(Number.isInteger(sourceReceiptSizeBytes) && sourceReceiptSizeBytes > 0, "The raw supported-host receipt size is invalid.");
  invariant(SHA256.test(reviewedEvidenceSha256), "The reviewed Chrome evidence SHA-256 is invalid.");
  invariant(Number.isInteger(reviewedEvidenceSizeBytes) && reviewedEvidenceSizeBytes > 0, "The reviewed Chrome evidence size is invalid.");
  validateSupportedHostDeploymentChecks(
    receipt.deploymentChecks,
    receipt.target.deployment,
    receipt.observedAt,
  );
  const tools = receipt.discovery.tools.map(mapChromeToolDefinition);
  const calls = receipt.calls.map(({ toolName, input, output, canonicalOutputSha256 }) => ({
    name: toolName,
    input: structuredClone(input),
    result: structuredClone(output),
    canonicalResultDigest: canonicalOutputSha256,
  }));
  const rejectedInputFieldNames = Object.keys(receipt.rejectedCall.input).sort();
  invariant(
    sameValues(rejectedInputFieldNames, ["personalContext", "query"]),
    "The raw rejected call did not contain exactly query and personalContext.",
  );
  const finalPageObservation = {
    lastPresentationAction: receipt.finalPageObservation.lastPresentationAction,
    selectedRecordId: receipt.finalPageObservation.selectedRecordId,
    displayEvidenceDigest: receipt.finalPageObservation.displayEvidenceDigest,
    toolEvidenceDigest: receipt.finalPageObservation.toolEvidenceDigest,
    digestParity: receipt.finalPageObservation.digestParity,
  };
  const evidence = {
    schema: SUPPORTED_HOST_CAPTURE_SCHEMA,
    capturedAt: receipt.observedAt,
    page: {
      url: SUPPORTED_HOST_PUBLIC_URL,
      release: SUPPORTED_HOST_RELEASE,
      productCommit: liveVerification.commit,
      pagesRunId: String(liveVerification.runId),
    },
    deploymentChecks: structuredClone(receipt.deploymentChecks),
    host: {
      name: "Google Chrome stable through Chrome DevTools MCP",
      version: receipt.environment.chrome,
      capabilities: ["webmcp"],
    },
    capture: {
      method: `Chrome DevTools MCP ${receipt.environment.chromeDevtoolsMcp} used native list_webmcp_tools, execute_webmcp_tool and evaluate_script commands in an isolated stable-Chrome profile.`,
      hostOwnedSurfaceObserved: false,
      hostRecordingCaptured: false,
      modelSelected: false,
      modelProviderCalled: false,
    },
    artefacts: [
      {
        path: SUPPORTED_HOST_RAW_RECEIPT_PATH,
        sha256: sourceReceiptSha256,
        sizeBytes: sourceReceiptSizeBytes,
        kind: "raw-receipt",
        hostOwnedSurface: false,
        purpose: "Ignored exact Chrome DevTools receipt containing discovered definitions, six bounded calls, the rejected call and final page observation.",
        limitation: "This machine-readable source remains outside Git; its reviewed tracked projection carries this exact byte binding.",
      },
      {
        path: SUPPORTED_HOST_REVIEWED_EVIDENCE_PATH,
        sha256: reviewedEvidenceSha256,
        sizeBytes: reviewedEvidenceSizeBytes,
        kind: "reviewed-public-evidence",
        hostOwnedSurface: false,
        purpose: "Tracked reviewed projection of the exact Chrome DevTools receipt, used as the reproducible input to the labelled receipt visualisation.",
        limitation: "This reviewed machine evidence is not a recording or screenshot of a host-owned surface.",
      },
    ],
    discovery: {
      toolCount: tools.length,
      tools,
    },
    calls,
    rejectedCall: {
      name: receipt.rejectedCall.toolName,
      rejectedField: "personalContext",
      inputFieldNames: rejectedInputFieldNames,
      result: structuredClone(receipt.rejectedCall.output),
      canonicalResultDigest: receipt.rejectedCall.canonicalOutputSha256,
    },
    finalPageObservation,
    limitations: [...SUPPORTED_HOST_CAPTURE_LIMITATIONS],
  };
  const rejectedValue = receipt.rejectedCall.input.personalContext;
  invariant(
    typeof rejectedValue !== "string" || !canonicalJson(evidence).includes(rejectedValue),
    "The reviewed supported-host evidence retained the rejected personal-context value.",
  );
  for (const call of calls) {
    invariant(
      call.canonicalResultDigest === sha256(canonicalJson(call.result)),
      `${call.name} reviewed result digest does not match the raw result.`,
    );
  }
  invariant(
    evidence.rejectedCall.canonicalResultDigest === sha256(canonicalJson(evidence.rejectedCall.result)),
    "The rejected-call reviewed result digest does not match the raw result.",
  );
  return evidence;
}
