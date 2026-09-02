import type {
  AccessStatus,
  AssertionStatus,
  AuthorityLinkRole,
  EvidenceTier,
  JsonObject,
} from "./contracts.js";
import { canonicalJson, isRfc3339DateTime, sha256Hex } from "./integrity.js";
import {
  CANNOT_DECIDE_COPY,
  COVERAGE_COPY,
  EVIDENCE_TIER_LABELS,
  INTEGRITY_COPY,
  NEXT_CHECK_COPY,
  PRIMARY_LIMITATION_BY_SELECTION,
  RIGHTS_NOTES,
} from "./beginner-presentation-copy.js";

export type BeginnerResultKind = "reviewed-answer" | "reviewed-record" | "federated-record";
export type PresentationAssertionStatus = AssertionStatus | "unclassified" | "not-established";
export type RightsStatus = "confirmed" | "missing" | "conflicting" | "not-applicable";
export type CannotDecideKind =
  | "personalised-applicability"
  | "currentness"
  | "eligibility"
  | "item-level-authority"
  | "access-and-rights"
  | "live-value"
  | "legal-effect"
  | "ownership";

export interface AcceptedExploreInput {
  readonly action: "explore_answer_foundations";
  readonly answerId: string;
  readonly claimId: string | null;
}

export interface AcceptedCompareInput {
  readonly action: "compare_evidence_foundations";
  readonly answerId: string;
  readonly claimIds: string[];
}

export interface AcceptedRecordInput {
  readonly action: "present_resource_evidence";
  readonly recordId: string;
}

export type AcceptedPresentationInput =
  | AcceptedExploreInput
  | AcceptedCompareInput
  | AcceptedRecordInput
  | null;

export interface BeginnerResourceDetails {
  readonly recordId: string | null;
  readonly resourceType: string | null;
  readonly collectionId: string | null;
  readonly sourceNativeId: string | null;
  readonly snapshot: string | null;
  readonly revision: string | null;
}

export interface BeginnerIntegrityBasis {
  readonly status: "sha256-bound" | "snapshot-file-integrity";
  readonly digest: string;
  readonly note: string;
}

export interface BeginnerAccess {
  readonly status: AccessStatus;
  readonly note: string;
}

export interface BeginnerRights {
  readonly status: RightsStatus;
  readonly title: string | null;
  readonly url: string | null;
  readonly note: string;
}

export interface BeginnerCoverage {
  readonly status: "one-record" | "one-source-snapshot-record" | "not-applicable";
  readonly note: string;
}

export interface BeginnerFoundation {
  readonly claimId: string | null;
  readonly supportedStatement: string;
  readonly publisher: string;
  readonly resourceDetails: BeginnerResourceDetails;
  readonly sourceTitle: string;
  readonly sourceAuthority: string;
  readonly sourceRole: AuthorityLinkRole;
  readonly sourceUrl: string | null;
  readonly sourceHostname: string | null;
  readonly assertionStatus: PresentationAssertionStatus;
  readonly observedAt: string;
  readonly integrityBasis: BeginnerIntegrityBasis;
  readonly access: BeginnerAccess;
  readonly rights: BeginnerRights;
  readonly coverage: BeginnerCoverage;
  readonly primaryLimitation: string | null;
  readonly allLimitations: string[];
}

export interface BeginnerBoundaries {
  readonly presentationEffect: "transient-local-selection";
  readonly pageScoped: true;
  readonly sameOriginStaticReads: true;
  readonly modelHostedByPage: false;
  readonly aiAnswerObserved: false;
  readonly providerCall: false;
  readonly officialApiCall: false;
  readonly sourceRefetchedAtRuntime: false;
  readonly catalogueMutation: false;
  readonly storageWrite: false;
  readonly externalStateChange: false;
  readonly personalContextAccepted: false;
  readonly durableReceiptCreated: false;
  readonly accessAuthorityGranted: false;
  readonly itemLevelReview: boolean;
  readonly evidenceReceiptAvailable: boolean;
  readonly cryptographicSignatureVerified: false;
  readonly sourceDerivedContentIsUntrusted: true;
  readonly singleTrustScore: false;
  readonly personalisedDecision: false;
  readonly eligibilityDecision: false;
  readonly legalDecision: false;
  readonly liveValueProvided: false;
  readonly ownershipRecordProvided: false;
}

export interface CannotDecideItem {
  readonly kind: CannotDecideKind;
  readonly statement: string;
}

export interface BeginnerPresentation extends JsonObject {
  readonly schema: "govuk-webmcp.beginner-presentation.v1";
  readonly ok: true;
  readonly selectionId: string;
  readonly resultKind: BeginnerResultKind;
  readonly evidenceTier: EvidenceTier;
  readonly evidenceTierLabel: string;
  readonly heading: string;
  readonly foundations: BeginnerFoundation[];
  readonly primaryLimitation: string | null;
  readonly allLimitations: string[];
  readonly boundaries: BeginnerBoundaries;
  readonly nextCheck: string;
  readonly cannotDecide: CannotDecideItem[];
  readonly acceptedInput: AcceptedPresentationInput;
  readonly sourceResultDigests: {
    readonly evidenceTrace: string | null;
    readonly recordResult: string | null;
    readonly provenanceResult: string | null;
  };
}

export interface ProjectionOptions {
  /** Set false only for initial, deep-link or history restoration. */
  readonly actionWasAccepted?: boolean;
}

export interface RecordProjectionDigests {
  readonly recordResult: string;
  readonly provenanceResult: string;
}

const SHA256 = /^[a-f0-9]{64}$/u;
const ANSWER_ID = /^answer:[a-z0-9][a-z0-9-]{2,88}$/u;
const CLAIM_ID = /^claim:[a-z0-9][a-z0-9-]{2,89}$/u;
const REVIEWED_RECORD_ID = /^govuk-discovery:(?!federated:)[a-z0-9][a-z0-9._:-]{2,111}$/u;
const FEDERATED_RECORD_ID = /^govuk-discovery:federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5})$/u;
const ASSERTION_STATUSES = new Set<PresentationAssertionStatus>([
  "official-source", "producer-declared", "normalised", "inferred", "model-derived", "unclassified",
]);
const ACCESS_STATUSES = new Set<AccessStatus>([
  "public", "restricted", "authentication-required", "access-not-established", "not-applicable",
]);
const RIGHTS_STATUSES = new Set<RightsStatus>(["confirmed", "missing", "conflicting", "not-applicable"]);
const SOURCE_ROLES = new Set<AuthorityLinkRole>([
  "official-source", "producer-declared-source", "producer-record", "no-direct-authority-link",
]);
const JURISDICTION_SELECTIONS = new Set([
  "govuk-discovery:federated:uk-living:6959",
  "govuk-discovery:federated:uk-living:7155",
  "govuk-discovery:federated:uk-living:7132",
]);
const LIVE_VALUE_SELECTIONS = new Set([
  "govuk-discovery:federated:ons:11396",
  "govuk-discovery:federated:ons:9783",
]);
const OWNERSHIP_SELECTIONS = new Set(["govuk-discovery:federated:land-registry:57975"]);
const ELIGIBILITY_SELECTIONS = new Set([
  "answer:new-child-starting-points",
  "govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114",
  ...JURISDICTION_SELECTIONS,
]);

export class BeginnerPresentationContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BeginnerPresentationContractError";
  }
}

function fail(message: string): never {
  throw new BeginnerPresentationContractError(message);
}

function dataObject(value: unknown, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    return fail(`${label} must be a plain data object.`);
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") return fail(`${label} contains a non-string field.`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      return fail(`${label} must contain enumerable data fields only.`);
    }
  }
  return value as JsonObject;
}

function dataArray(value: unknown, label: string, minimum = 0, maximum = 64): unknown[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    return fail(`${label} must contain from ${minimum} to ${maximum} values.`);
  }
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      return fail(`${label} must contain indexed data values only.`);
    }
  }
  return value;
}

function requiredString(value: unknown, label: string, maximum: number, pattern?: RegExp): string {
  if (typeof value !== "string" || value.length < 1 || value.length > maximum || /[\u0000-\u001F\u007F]/u.test(value)) {
    return fail(`${label} must be a bounded text value.`);
  }
  if (pattern && !pattern.test(value)) return fail(`${label} has an unsupported value.`);
  return value;
}

function nullableString(value: unknown, label: string, maximum: number): string | null {
  if (value === null) return null;
  return requiredString(value, label, maximum);
}

function exactEnum<T extends string>(value: unknown, allowed: ReadonlySet<T>, label: string): T {
  if (typeof value !== "string" || !allowed.has(value as T)) return fail(`${label} has an unsupported value.`);
  return value as T;
}

function stringArray(value: unknown, label: string, maximum = 40, itemMaximum = 1_200): string[] {
  const values = dataArray(value, label, 0, maximum).map((item, index) =>
    requiredString(item, `${label}[${index}]`, itemMaximum));
  return values;
}

function stableLimitations(...groups: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const group of groups) {
    for (const limitation of group) {
      if (!seen.has(limitation)) {
        seen.add(limitation);
        output.push(limitation);
      }
    }
  }
  return output;
}

function sourceDestination(value: unknown, label: string): { url: string | null; hostname: string | null } {
  if (value === null) return { url: null, hostname: null };
  const text = requiredString(value, label, 2_048);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return fail(`${label} is not a valid URL.`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.toString() !== text) {
    return fail(`${label} is not an exact credential-free HTTPS URL.`);
  }
  return { url: text, hostname: url.hostname };
}

function digest(value: unknown, label: string): string {
  return requiredString(value, label, 64, SHA256);
}

function observation(value: unknown, label: string): string {
  if (!isRfc3339DateTime(value)) return fail(`${label} is not an RFC 3339 date-time.`);
  return value;
}

function boundaries(itemLevelReview: boolean, evidenceReceiptAvailable: boolean): BeginnerBoundaries {
  return {
    presentationEffect: "transient-local-selection",
    pageScoped: true,
    sameOriginStaticReads: true,
    modelHostedByPage: false,
    aiAnswerObserved: false,
    providerCall: false,
    officialApiCall: false,
    sourceRefetchedAtRuntime: false,
    catalogueMutation: false,
    storageWrite: false,
    externalStateChange: false,
    personalContextAccepted: false,
    durableReceiptCreated: false,
    accessAuthorityGranted: false,
    itemLevelReview,
    evidenceReceiptAvailable,
    cryptographicSignatureVerified: false,
    sourceDerivedContentIsUntrusted: true,
    singleTrustScore: false,
    personalisedDecision: false,
    eligibilityDecision: false,
    legalDecision: false,
    liveValueProvided: false,
    ownershipRecordProvided: false,
  };
}

function mappedPrimary(selectionId: string): string | null {
  return PRIMARY_LIMITATION_BY_SELECTION[selectionId] ?? null;
}

function withPrimary(limitations: readonly string[], primary: string | null): string[] {
  return stableLimitations(limitations, primary === null ? [] : [primary]);
}

function cannotDecide(selectionId: string, tier: EvidenceTier, answer: boolean): CannotDecideItem[] {
  const items: CannotDecideItem[] = [
    CANNOT_DECIDE_COPY.personalisedApplicability,
    CANNOT_DECIDE_COPY.currentness,
  ];
  if (answer || ELIGIBILITY_SELECTIONS.has(selectionId)) items.push(CANNOT_DECIDE_COPY.eligibility);
  if (tier === "federated-source-snapshot") {
    items.push(CANNOT_DECIDE_COPY.itemLevelAuthority, CANNOT_DECIDE_COPY.accessAndRights);
  }
  if (LIVE_VALUE_SELECTIONS.has(selectionId)) items.push(CANNOT_DECIDE_COPY.liveValue);
  if (JURISDICTION_SELECTIONS.has(selectionId)) items.push(CANNOT_DECIDE_COPY.legalEffect);
  if (OWNERSHIP_SELECTIONS.has(selectionId)) {
    items.push(CANNOT_DECIDE_COPY.legalEffect, CANNOT_DECIDE_COPY.ownership);
  }
  return items;
}

function nextCheck(selectionId: string, tier: EvidenceTier, sourceUrl: string | null): string {
  if (LIVE_VALUE_SELECTIONS.has(selectionId)) return NEXT_CHECK_COPY.liveValue;
  if (OWNERSHIP_SELECTIONS.has(selectionId)) return NEXT_CHECK_COPY.ownership;
  if (JURISDICTION_SELECTIONS.has(selectionId)) return NEXT_CHECK_COPY.jurisdiction;
  if (tier === "reviewed-deep-evidence") return NEXT_CHECK_COPY.reviewed;
  return sourceUrl === null ? NEXT_CHECK_COPY.noRecordedLink : NEXT_CHECK_COPY.federated;
}

function assertionForDescription(record: JsonObject): PresentationAssertionStatus {
  const assertions = dataArray(record.assertions, "Record assertions", 1, 40).map((value) =>
    dataObject(value, "Record assertion"));
  const selected = assertions.find(({ field }) => field === "description") ??
    assertions.find(({ field }) => field === "title");
  if (!selected) return "not-established";
  return exactEnum(selected.status, ASSERTION_STATUSES, "Record assertion status");
}

function rightsFromRecord(record: JsonObject): BeginnerRights {
  const licence = dataObject(record.licence, "Record licence");
  const status = exactEnum(licence.status, RIGHTS_STATUSES, "Record licence status");
  const title = licence.title === undefined ? null : nullableString(licence.title, "Record licence title", 300);
  const destination = licence.url === undefined ? { url: null } : sourceDestination(licence.url, "Record licence URL");
  return { status, title, url: destination.url, note: RIGHTS_NOTES[status] };
}

function accessFromRecord(record: JsonObject): BeginnerAccess {
  const access = dataObject(record.access, "Record access");
  return {
    status: exactEnum(access.status, ACCESS_STATUSES, "Record access status"),
    note: requiredString(access.note, "Record access note", 1_000),
  };
}

function reviewedRecordFoundation(record: JsonObject, limitations: string[], primary: string | null): BeginnerFoundation {
  const provenance = dataObject(record.provenance, "Reviewed record provenance");
  const sources = dataArray(provenance.sources, "Reviewed record sources", 1, 12);
  const firstSource = dataObject(sources[0], "Reviewed record primary source");
  const destination = sourceDestination(record.canonicalHumanUrl, "Reviewed record source URL");
  if (destination.url !== firstSource.url) return fail("The reviewed record and provenance source URLs do not match.");
  const dates = dataObject(record.dates, "Reviewed record dates");
  return {
    claimId: null,
    supportedStatement: requiredString(record.description, "Reviewed record description", 1_200),
    publisher: requiredString(record.publisher, "Reviewed record publisher", 200),
    resourceDetails: {
      recordId: requiredString(record.id, "Reviewed record ID", 128, REVIEWED_RECORD_ID),
      resourceType: requiredString(record.resourceType, "Reviewed record resource type", 80),
      collectionId: "deep-evidence",
      sourceNativeId: null,
      snapshot: null,
      revision: null,
    },
    sourceTitle: requiredString(firstSource.title, "Reviewed record source title", 300),
    sourceAuthority: requiredString(record.sourceAuthority, "Reviewed record source authority", 300),
    sourceRole: "official-source",
    sourceUrl: destination.url,
    sourceHostname: destination.hostname,
    assertionStatus: assertionForDescription(record),
    observedAt: observation(dates.observed, "Reviewed record observation date"),
    integrityBasis: {
      status: "sha256-bound",
      digest: digest(provenance.recordDigest, "Reviewed record digest"),
      note: INTEGRITY_COPY.reviewed,
    },
    access: accessFromRecord(record),
    rights: rightsFromRecord(record),
    coverage: COVERAGE_COPY.reviewedRecord,
    primaryLimitation: primary,
    allLimitations: limitations,
  };
}

function federatedRecordFoundation(record: JsonObject, limitations: string[], primary: string | null): BeginnerFoundation {
  const link = dataObject(record.authoritativeLink, "Federated record source link");
  const role = exactEnum(link.role, SOURCE_ROLES, "Federated record source role");
  if (role === "official-source") return fail("A federated source-snapshot record cannot claim the reviewed official-source role.");
  const destination = sourceDestination(link.url, "Federated record source URL");
  if ((role === "no-direct-authority-link") !== (destination.url === null)) {
    return fail("The federated source role and recorded URL do not match.");
  }
  const dates = dataObject(record.dates, "Federated record dates");
  return {
    claimId: null,
    supportedStatement: requiredString(record.description, "Federated record description", 1_200),
    publisher: requiredString(record.publisher, "Federated record publisher", 200),
    resourceDetails: {
      recordId: requiredString(record.id, "Federated record ID", 160, FEDERATED_RECORD_ID),
      resourceType: requiredString(record.resourceType, "Federated record resource type", 80),
      collectionId: requiredString(record.collectionId, "Federated collection ID", 80),
      sourceNativeId: requiredString(record.sourceNativeId, "Federated source-native ID", 500),
      snapshot: nullableString(record.snapshot, "Federated snapshot", 200),
      revision: requiredString(record.revision, "Federated revision", 40, /^[a-f0-9]{40}$/u),
    },
    sourceTitle: requiredString(link.label, "Federated source title", 300),
    sourceAuthority: requiredString(record.sourceAuthority, "Federated source authority", 300),
    sourceRole: role,
    sourceUrl: destination.url,
    sourceHostname: destination.hostname,
    assertionStatus: exactEnum(record.assertionStatus, ASSERTION_STATUSES, "Federated assertion status"),
    observedAt: observation(dates.observed, "Federated observation date"),
    integrityBasis: {
      status: "snapshot-file-integrity",
      digest: digest(record.recordDigest, "Federated record digest"),
      note: INTEGRITY_COPY.federated,
    },
    access: accessFromRecord(record),
    rights: rightsFromRecord(record),
    coverage: COVERAGE_COPY.federatedRecord,
    primaryLimitation: primary,
    allLimitations: limitations,
  };
}

function isSuccessful(value: JsonObject): boolean {
  return value.ok === true;
}

/** Return the canonical ID from a successful record result, never from caller-owned input. */
export function canonicalRecordIdFromResult(recordResultValue: unknown): string {
  const recordResult = dataObject(recordResultValue, "Record result");
  if (!isSuccessful(recordResult)) return fail("A failed record result has no canonical record ID.");
  const record = dataObject(recordResult.record, "Record result record");
  if (recordResult.schema === "trusted-govuk-discovery.resource-record-result.v1") {
    return requiredString(record.id, "Reviewed record ID", 128, REVIEWED_RECORD_ID);
  }
  if (recordResult.schema === "govuk-webmcp.federated-resource-record-result.v1") {
    return requiredString(record.id, "Federated record ID", 160, FEDERATED_RECORD_ID);
  }
  return fail("The record result schema is not supported by Evidence answer.");
}

function validateReviewedPair(recordResult: JsonObject, provenanceResult: JsonObject): JsonObject {
  if (
    recordResult.schema !== "trusted-govuk-discovery.resource-record-result.v1" ||
    provenanceResult.schema !== "trusted-govuk-discovery.provenance-result.v1" ||
    recordResult.evidenceTier !== undefined || provenanceResult.evidenceTier !== undefined
  ) return fail("The reviewed record and provenance evidence tiers do not match their contracts.");
  const record = dataObject(recordResult.record, "Reviewed record");
  const recordId = requiredString(record.id, "Reviewed record ID", 128, REVIEWED_RECORD_ID);
  if (provenanceResult.recordId !== recordId) return fail("The reviewed record and provenance IDs do not match.");
  const recordProvenance = dataObject(record.provenance, "Reviewed record provenance");
  const receipt = dataObject(provenanceResult.evidenceReceipt, "Reviewed evidence receipt");
  const output = dataObject(receipt.output, "Reviewed evidence receipt output");
  const recordDigest = digest(recordProvenance.recordDigest, "Reviewed record digest");
  const bundleDigest = digest(recordProvenance.bundleDigest, "Reviewed record bundle digest");
  if (
    provenanceResult.recordDigest !== recordDigest ||
    provenanceResult.bundleDigest !== bundleDigest ||
    output.recordId !== recordId || output.recordDigest !== recordDigest || output.bundleDigest !== bundleDigest
  ) return fail("The reviewed record and provenance digest bindings do not match.");
  return record;
}

function validateFederatedPair(recordResult: JsonObject, provenanceResult: JsonObject): JsonObject {
  if (
    recordResult.schema !== "govuk-webmcp.federated-resource-record-result.v1" ||
    provenanceResult.schema !== "govuk-webmcp.federated-provenance-result.v1" ||
    recordResult.evidenceTier !== "federated-source-snapshot" ||
    provenanceResult.evidenceTier !== "federated-source-snapshot"
  ) return fail("The federated record and provenance evidence tiers do not match.");
  const record = dataObject(recordResult.record, "Federated record");
  if (record.evidenceTier !== "federated-source-snapshot") {
    return fail("The federated record carries a mismatched evidence tier.");
  }
  const recordId = requiredString(record.id, "Federated record ID", 160, FEDERATED_RECORD_ID);
  if (provenanceResult.recordId !== recordId) return fail("The federated record and provenance IDs do not match.");
  const integrity = dataObject(recordResult.integrity, "Federated record integrity");
  const collection = dataObject(provenanceResult.collection, "Federated provenance collection");
  const link = dataObject(record.authoritativeLink, "Federated record source link");
  const provenanceLink = dataObject(provenanceResult.authoritativeLink, "Federated provenance source link");
  const recordDigest = digest(record.recordDigest, "Federated record digest");
  if (
    provenanceResult.recordDigest !== recordDigest || integrity.recordDigest !== recordDigest ||
    provenanceResult.sourceDigest !== record.sourceSha256 || provenanceResult.sourceFileDigest !== record.sourceSha256 ||
    collection.id !== record.collectionId || collection.sourceNativeId !== record.sourceNativeId ||
    collection.sourceNativeIdSha256 !== record.sourceNativeIdSha256 || collection.revision !== record.revision ||
    collection.snapshot !== record.snapshot || collection.deploymentId !== record.deploymentId ||
    provenanceResult.revision !== record.revision || provenanceResult.snapshot !== record.snapshot ||
    link.url !== provenanceLink.url || link.role !== provenanceLink.role || link.label !== provenanceLink.label
  ) return fail("The federated record and provenance bindings do not match.");
  return record;
}

/**
 * Project a validated record result and its matching provenance into the closed
 * Evidence answer contract. The two source objects are hashed untouched.
 */
export function projectRecordEvidenceWithDigests(
  recordResultValue: unknown,
  provenanceResultValue: unknown,
  sourceResultDigests: RecordProjectionDigests,
  options: ProjectionOptions = {},
): BeginnerPresentation {
  const recordResult = dataObject(recordResultValue, "Record result");
  const provenanceResult = dataObject(provenanceResultValue, "Provenance result");
  if (!isSuccessful(recordResult) || !isSuccessful(provenanceResult)) {
    return fail("Evidence answer requires successful record and provenance results.");
  }
  const federated = recordResult.schema === "govuk-webmcp.federated-resource-record-result.v1";
  const record = federated
    ? validateFederatedPair(recordResult, provenanceResult)
    : validateReviewedPair(recordResult, provenanceResult);
  const selectionId = canonicalRecordIdFromResult(recordResult);
  const tier: EvidenceTier = federated ? "federated-source-snapshot" : "reviewed-deep-evidence";
  const primary = mappedPrimary(selectionId);
  const recordLimitations = stringArray(record.limitations, "Record limitations", 24, 1_000);
  const provenanceLimitations = stringArray(provenanceResult.limitations, "Provenance limitations", 24, 1_000);
  const receiptLimitations = federated
    ? []
    : stringArray(
        dataObject(provenanceResult.evidenceReceipt, "Reviewed evidence receipt").limitations,
        "Evidence receipt limitations",
        24,
        1_000,
      );
  const allLimitations = withPrimary(
    stableLimitations(recordLimitations, provenanceLimitations, receiptLimitations),
    primary,
  );
  const foundation = federated
    ? federatedRecordFoundation(record, allLimitations, primary)
    : reviewedRecordFoundation(record, allLimitations, primary);
  const recordResultDigest = digest(sourceResultDigests.recordResult, "Record result digest");
  const provenanceResultDigest = digest(sourceResultDigests.provenanceResult, "Provenance result digest");
  const actionWasAccepted = options.actionWasAccepted !== false;
  return {
    schema: "govuk-webmcp.beginner-presentation.v1",
    ok: true,
    selectionId,
    resultKind: federated ? "federated-record" : "reviewed-record",
    evidenceTier: tier,
    evidenceTierLabel: EVIDENCE_TIER_LABELS[tier],
    heading: requiredString(record.title, "Record title", 300),
    foundations: [foundation],
    primaryLimitation: primary,
    allLimitations,
    boundaries: boundaries(!federated, !federated),
    nextCheck: nextCheck(selectionId, tier, foundation.sourceUrl),
    cannotDecide: cannotDecide(selectionId, tier, false),
    acceptedInput: actionWasAccepted ? { action: "present_resource_evidence", recordId: selectionId } : null,
    sourceResultDigests: {
      evidenceTrace: null,
      recordResult: recordResultDigest,
      provenanceResult: provenanceResultDigest,
    },
  };
}

/**
 * Project one record using SHA-256 values calculated over the untouched source
 * results. Release tooling can call the synchronous helper above with its own
 * canonical digests and therefore validate the complete runtime projection.
 */
export async function projectRecordEvidence(
  recordResultValue: unknown,
  provenanceResultValue: unknown,
  options: ProjectionOptions = {},
): Promise<BeginnerPresentation> {
  const [recordResultDigest, provenanceResultDigest] = await Promise.all([
    sha256Hex(canonicalJson(recordResultValue)),
    sha256Hex(canonicalJson(provenanceResultValue)),
  ]);
  return projectRecordEvidenceWithDigests(
    recordResultValue,
    provenanceResultValue,
    { recordResult: recordResultDigest, provenanceResult: provenanceResultDigest },
    options,
  );
}

interface ReviewedSelection {
  readonly selectionId: string;
  readonly answerId: string;
  readonly claimIds: string[];
  readonly acceptedInput: AcceptedExploreInput | AcceptedCompareInput;
}

function reviewedSelection(result: JsonObject): ReviewedSelection {
  if (result.schema === "trusted-govuk-discovery.evidence-exploration-result.v1") {
    const selection = dataObject(result.selection, "Evidence exploration selection");
    const answerId = requiredString(selection.answerId, "Evidence answer ID", 96, ANSWER_ID);
    const claimIds = stringArray(selection.claimIds, "Selected claim IDs", 6, 96);
    if (!claimIds.length || claimIds.some((id) => !CLAIM_ID.test(id)) || new Set(claimIds).size !== claimIds.length) {
      return fail("The evidence exploration selected invalid claim IDs.");
    }
    if (selection.mode === "claim") {
      if (claimIds.length !== 1) return fail("A claim exploration must select exactly one claim.");
      return {
        selectionId: claimIds[0]!,
        answerId,
        claimIds,
        acceptedInput: { action: "explore_answer_foundations", answerId, claimId: claimIds[0]! },
      };
    }
    if (selection.mode !== "overview") return fail("The evidence exploration mode is unsupported.");
    return {
      selectionId: answerId,
      answerId,
      claimIds,
      acceptedInput: { action: "explore_answer_foundations", answerId, claimId: null },
    };
  }
  if (result.schema === "trusted-govuk-discovery.evidence-comparison-result.v1") {
    const answerId = requiredString(result.answerId, "Evidence answer ID", 96, ANSWER_ID);
    const claimIds = stringArray(result.claimIds, "Compared claim IDs", 4, 96);
    if (
      claimIds.length < 2 || claimIds.some((id) => !CLAIM_ID.test(id)) ||
      new Set(claimIds).size !== claimIds.length
    ) return fail("The evidence comparison selected invalid claim IDs.");
    return {
      selectionId: answerId,
      answerId,
      claimIds,
      acceptedInput: { action: "compare_evidence_foundations", answerId, claimIds },
    };
  }
  return fail("The reviewed Evidence answer result schema is unsupported.");
}

function traceFoundation(
  claimId: string,
  answerId: string,
  nodeMap: ReadonlyMap<string, JsonObject>,
  edges: readonly JsonObject[],
  orderedLimitationNodes: readonly JsonObject[],
): BeginnerFoundation {
  const claim = nodeMap.get(claimId);
  if (!claim || claim.kind !== "claim") return fail(`The reviewed answer is missing claim ${claimId}.`);
  const sourceEdges = edges.filter((edge) =>
    edge.target === claimId && edge.relation === "supports" && nodeMap.get(String(edge.source))?.kind === "source");
  if (sourceEdges.length !== 1) return fail(`Claim ${claimId} does not have one exact source foundation.`);
  const source = nodeMap.get(String(sourceEdges[0]!.source))!;
  if (source.recordId !== claim.recordId) return fail(`Claim ${claimId} and its source record IDs do not match.`);
  const destination = sourceDestination(source.url, `Source URL for ${claimId}`);
  if (destination.url === null) return fail(`Reviewed claim ${claimId} has no official source URL.`);
  const facets = dataObject(claim.facets, `Claim facets for ${claimId}`);
  const sourceFacets = dataObject(source.facets, `Source facets for ${claimId}`);
  const freshness = dataObject(facets.freshness, `Freshness for ${claimId}`);
  const integrity = dataObject(facets.integrity, `Integrity for ${claimId}`);
  const access = dataObject(facets.access, `Access for ${claimId}`);
  const rights = dataObject(facets.rights, `Rights for ${claimId}`);
  const coverage = dataObject(facets.coverage, `Coverage for ${claimId}`);
  const limitationIds = new Set(edges
    .filter((edge) => edge.relation === "qualifies" && (edge.target === answerId || edge.target === claimId))
    .map((edge) => edge.source));
  const limitations = orderedLimitationNodes
    .filter((node) => limitationIds.has(node.id))
    .map((node) => requiredString(node.statement, `Limitation for ${claimId}`, 600));
  const primary = mappedPrimary(claimId);
  return {
    claimId,
    supportedStatement: requiredString(claim.statement, `Statement for ${claimId}`, 600),
    publisher: requiredString(sourceFacets.authority, `Publisher for ${claimId}`, 300),
    resourceDetails: {
      recordId: requiredString(source.recordId, `Record ID for ${claimId}`, 128, REVIEWED_RECORD_ID),
      resourceType: "govuk-content",
      collectionId: "deep-evidence",
      sourceNativeId: null,
      snapshot: null,
      revision: null,
    },
    sourceTitle: requiredString(source.label, `Source title for ${claimId}`, 300),
    sourceAuthority: requiredString(sourceFacets.authority, `Source authority for ${claimId}`, 300),
    sourceRole: "official-source",
    sourceUrl: destination.url,
    sourceHostname: destination.hostname,
    assertionStatus: exactEnum(facets.assertionStatus, ASSERTION_STATUSES, `Assertion status for ${claimId}`),
    observedAt: observation(freshness.observedAt, `Observation date for ${claimId}`),
    integrityBasis: {
      status: "sha256-bound",
      digest: digest(integrity.digest, `Integrity digest for ${claimId}`),
      note: INTEGRITY_COPY.reviewedAnswer,
    },
    access: {
      status: exactEnum(access.status, ACCESS_STATUSES, `Access status for ${claimId}`),
      note: requiredString(access.note, `Access note for ${claimId}`, 1_000),
    },
    rights: {
      status: exactEnum(rights.status, RIGHTS_STATUSES, `Rights status for ${claimId}`),
      title: rights.title === undefined ? null : nullableString(rights.title, `Rights title for ${claimId}`, 300),
      url: null,
      note: requiredString(rights.note, `Rights note for ${claimId}`, 1_000),
    },
    coverage: {
      status: coverage.status === "one-record" ? "one-record" : "not-applicable",
      note: requiredString(coverage.note, `Coverage note for ${claimId}`, 1_000),
    },
    primaryLimitation: primary,
    allLimitations: withPrimary(limitations, primary),
  };
}

/** Project a successful explore or compare result into one reviewed Evidence answer. */
export async function projectReviewedAnswer(
  resultValue: unknown,
  options: ProjectionOptions = {},
): Promise<BeginnerPresentation> {
  const result = dataObject(resultValue, "Reviewed answer result");
  if (!isSuccessful(result)) return fail("Evidence answer requires a successful reviewed result.");
  const selection = reviewedSelection(result);
  const trace = dataObject(result.trace, "Evidence Trace");
  if (trace.schema !== "trusted-govuk-discovery.evidence-trace.v1" || trace.id !== selection.answerId) {
    return fail("The reviewed selection and Evidence Trace IDs do not match.");
  }
  const traceClaimIds = stringArray(trace.claimIds, "Evidence Trace claim IDs", 6, 96);
  if (selection.claimIds.some((id) => !traceClaimIds.includes(id))) {
    return fail("The reviewed selection names a claim outside its Evidence Trace.");
  }
  const nodes = dataArray(trace.nodes, "Evidence Trace nodes", 1, 40).map((node) => dataObject(node, "Evidence Trace node"));
  const nodeMap = new Map<string, JsonObject>();
  for (const node of nodes) {
    const id = requiredString(node.id, "Evidence Trace node ID", 180);
    if (nodeMap.has(id)) return fail("The Evidence Trace contains duplicate node IDs.");
    nodeMap.set(id, node);
  }
  const edges = dataArray(trace.edges, "Evidence Trace edges", 1, 64).map((edge) => dataObject(edge, "Evidence Trace edge"));
  const limitationNodes = nodes.filter((node) => node.kind === "limitation");
  const foundations = selection.claimIds.map((claimId) =>
    traceFoundation(claimId, selection.answerId, nodeMap, edges, limitationNodes));
  const primary = mappedPrimary(selection.answerId);
  const allLimitations = withPrimary(
    stableLimitations(...foundations.map(({ allLimitations: limitations }) => limitations)),
    primary,
  );
  const actionWasAccepted = options.actionWasAccepted !== false;
  return {
    schema: "govuk-webmcp.beginner-presentation.v1",
    ok: true,
    selectionId: selection.selectionId,
    resultKind: "reviewed-answer",
    evidenceTier: "reviewed-deep-evidence",
    evidenceTierLabel: EVIDENCE_TIER_LABELS["reviewed-deep-evidence"],
    heading: requiredString(trace.question, "Evidence answer question", 200),
    foundations,
    primaryLimitation: primary,
    allLimitations,
    boundaries: boundaries(true, true),
    nextCheck: NEXT_CHECK_COPY.reviewed,
    cannotDecide: cannotDecide(selection.answerId, "reviewed-deep-evidence", true),
    acceptedInput: actionWasAccepted ? selection.acceptedInput : null,
    sourceResultDigests: {
      evidenceTrace: digest(trace.traceDigest, "Evidence Trace digest"),
      recordResult: null,
      provenanceResult: null,
    },
  };
}
