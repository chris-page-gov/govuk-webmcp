/**
 * Page-scoped WebMCP tools over verified same-origin knowledge artefacts.
 * Source-derived strings are untrusted data and must be rendered as text.
 */

import {
  type AccessStatus,
  type AssertionStatus,
  type Catalogue,
  type DiscoveryRecord,
  type EvidenceReceipt,
  type JsonObject,
  type ResourceType,
} from "./contracts.js";
import {
  createKnowledgeActionController,
  type ActionOptions,
  type ActionPresentation,
  type KnowledgeActionController,
} from "./application-actions.js";
import {
  createCombinedKnowledgeRuntime,
  type CombinedKnowledgeRuntime,
} from "./combined-knowledge-runtime.js";
import { createEvidenceRuntime, type EvidenceRuntime } from "./evidence-runtime.js";
import {
  createFederatedSearchRuntime,
  type FederatedSearchLoader,
  type FederatedSearchRuntime,
} from "./federated-search-runtime.js";
import { createFederationRuntime, type FederationRuntime } from "./federation-runtime.js";
import { canonicalJson, isRfc3339DateTime, parseChecksum, sha256Hex } from "./integrity.js";

export type {
  AccessStatus,
  AssertionStatus,
  DiscoveryRecord,
  EvidenceReceipt,
  JsonObject,
  ResourceType,
} from "./contracts.js";

interface ModelContextTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonObject;
  annotations: { readOnlyHint: boolean; untrustedContentHint: true };
  execute: (input: unknown, options?: { signal?: AbortSignal }) => Promise<JsonObject>;
}

interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
  getTools?(): Promise<Array<{ name: string }>>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const QUERY_MAX = 160;
const RESULT_LIMIT_MAX = 20;
const RELEASE_CATALOGUE_RECORD_COUNT = 80;
const REGISTRATION_TIMEOUT_MS = 3000;
const RECORD_ID = /^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,111}$/u;
const FEDERATED_RECORD_ID = /^govuk-discovery:federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5})$/u;
const RECEIPT_ID = /^trusted-govuk-discovery:evidence-receipt:sha256:[a-f0-9]{64}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const CURATED_SOURCE_LOCK = "curated-official-api-data-2026-08-29";
const RESOURCE_TYPES = new Set<ResourceType>([
  "govuk-content",
  "dataset",
  "api",
  "api-documentation",
  "catalogue-record",
  "organisation",
  "guidance",
]);
const ACCESS_STATUSES = new Set<AccessStatus>([
  "public",
  "restricted",
  "authentication-required",
  "access-not-established",
  "not-applicable",
]);
const ASSERTION_STATUSES = new Set<AssertionStatus>([
  "official-source",
  "normalised",
  "inferred",
  "model-derived",
]);
const LICENCE_STATUSES = new Set(["confirmed", "missing", "conflicting", "not-applicable"]);
const KNOWLEDGE_COLLECTIONS = new Set(["deep-evidence", "uk-living", "ons", "government-apis", "land-registry"]);
const SEARCH_KEYS = new Set(["query", "resourceTypes", "publishers", "accessStatuses", "limit"]);
const RECORD_KEYS = new Set(["recordId"]);
const CATALOGUE_KEYS = new Set(["schema", "generatedAt", "profile", "bundleDigest", "sourceLocksDigest", "records"]);
const PROFILE_KEYS = new Set([
  "id", "title", "description", "resourceType", "publisher", "steward", "topics",
  "canonicalHumanUrl", "documentationUrl", "machineEndpoint", "apiCatalogueUrl",
  "licence", "access", "dates", "sourceAuthority", "assertions", "provenance",
  "limitations", "relatedRecordIds",
]);
const LICENCE_KEYS = new Set(["status", "title", "url", "attribution"]);
const ACCESS_KEYS = new Set(["status", "evidenceUrl", "note"]);
const DATES_KEYS = new Set(["firstPublished", "modified", "observed"]);
const ASSERTION_KEYS = new Set(["field", "status", "evidenceUrls", "note"]);
const PROVENANCE_KEYS = new Set([
  "extractionMethod", "sourceLock", "sourceDigest", "recordDigest", "bundleDigest",
  "evidenceReceiptId", "sources",
]);
const SOURCE_REFERENCE_KEYS = new Set(["url", "title", "publisher", "observedAt", "digest"]);
const RECEIPT_KEYS = new Set([
  "schema", "id", "observedAt", "sourceLock", "source", "output", "assertionStatuses",
  "limitations", "boundaries", "receiptDigest",
]);
const RECEIPT_SOURCE_KEYS = new Set(["url", "title", "publisher", "sourceDigest"]);
const RECEIPT_OUTPUT_KEYS = new Set(["recordId", "recordDigest", "bundleDigest"]);
const RECEIPT_BOUNDARY_KEYS = new Set([
  "sourceWasNotRefetchedAtRuntime", "cryptographicSignatureVerified", "accessAuthorityGranted",
]);

function safePublicUrl(value: unknown, label = "URL"): string {
  if (typeof value !== "string") throw new Error(`${label} is missing.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is malformed.`);
  }
  const officialHost =
    url.hostname === "gov.uk" ||
    url.hostname.endsWith(".gov.uk") ||
    url.hostname === "data.police.uk";
  if (
    url.protocol !== "https:" || url.username || url.password || !officialHost ||
    url.toString() !== value || /%(?![a-fA-F0-9]{2})/u.test(value)
  ) {
    throw new Error(`${label} must be a credential-free HTTPS URL on an admitted official host.`);
  }
  return url.toString();
}

function ensurePlainObject(value: unknown, allowed: Set<string>): JsonObject {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error("Input must be a plain JSON object.");
  }
  const object = value as JsonObject;
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new Error(`Unknown input field: ${key.slice(0, 80)}`);
  }
  return object;
}

function closedPlainObject(
  value: unknown,
  label: string,
  allowed: ReadonlySet<string>,
  required: readonly string[],
): JsonObject {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  const object = value as JsonObject;
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new Error(`${label} contains the unknown field ${key.slice(0, 80)}.`);
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
      throw new Error(`${label} is missing the required field ${key}.`);
    }
  }
  return object;
}

function schemaString(
  value: unknown,
  label: string,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY,
): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum) {
    const range = Number.isFinite(maximum)
      ? `from ${minimum} to ${maximum} characters`
      : `at least ${minimum} character${minimum === 1 ? "" : "s"}`;
    throw new Error(`${label} must be a string of ${range}.`);
  }
  return value;
}

function optionalSchemaString(
  value: unknown,
  label: string,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY,
): void {
  if (value !== undefined) schemaString(value, label, minimum, maximum);
}

function schemaArray(
  value: unknown,
  label: string,
  minimum: number,
  maximum = Number.POSITIVE_INFINITY,
): unknown[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    const range = Number.isFinite(maximum) ? `from ${minimum} to ${maximum}` : `at least ${minimum}`;
    throw new Error(`${label} must be an array with ${range} item${maximum === 1 ? "" : "s"}.`);
  }
  return value;
}

function uniqueStringArray(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  itemMinimum: number,
  itemMaximum = Number.POSITIVE_INFINITY,
): string[] {
  const items = schemaArray(value, label, minimum, maximum)
    .map((item, index) => schemaString(item, `${label}[${index}]`, itemMinimum, itemMaximum));
  if (new Set(items).size !== items.length) throw new Error(`${label} must not contain duplicate values.`);
  return items;
}

function dateTimeString(value: unknown, label: string): string {
  const dateTime = schemaString(value, label, 1);
  if (!isRfc3339DateTime(dateTime)) throw new Error(`${label} must be a valid RFC 3339 date-time.`);
  return dateTime;
}

function optionalDateTime(value: unknown, label: string): void {
  if (value !== undefined) dateTimeString(value, label);
}

function optionalPublicUrl(value: unknown, label: string): void {
  if (value !== undefined) safePublicUrl(value, label);
}

function assertEnum(value: unknown, label: string, allowed: ReadonlySet<string>): string {
  if (typeof value !== "string" || !allowed.has(value)) throw new Error(`${label} is unsupported.`);
  return value;
}

function validateProfileRecord(value: unknown, index: number): DiscoveryRecord {
  const label = `Catalogue record ${index}`;
  const object = closedPlainObject(value, label, PROFILE_KEYS, [
    "id", "title", "description", "resourceType", "publisher", "topics", "canonicalHumanUrl",
    "licence", "access", "dates", "sourceAuthority", "assertions", "provenance", "limitations",
    "relatedRecordIds",
  ]);
  const recordId = schemaString(object.id, `${label} id`, 1, 128);
  if (!RECORD_ID.test(recordId)) throw new Error(`${label} has an invalid identifier.`);
  schemaString(object.title, `${label} title`, 1, 300);
  schemaString(object.description, `${label} description`, 1, 2000);
  assertEnum(object.resourceType, `${label} resource type`, RESOURCE_TYPES);
  schemaString(object.publisher, `${label} publisher`, 1, 200);
  optionalSchemaString(object.steward, `${label} steward`, 1, 200);
  uniqueStringArray(object.topics, `${label} topics`, 1, 20, 1, 100);
  safePublicUrl(object.canonicalHumanUrl, `${label} authoritative human URL`);
  optionalPublicUrl(object.documentationUrl, `${label} documentation URL`);
  optionalPublicUrl(object.machineEndpoint, `${label} machine endpoint`);
  optionalPublicUrl(object.apiCatalogueUrl, `${label} API Catalogue URL`);

  const licence = closedPlainObject(object.licence, `${label} licence`, LICENCE_KEYS, ["status"]);
  assertEnum(licence.status, `${label} licence status`, LICENCE_STATUSES);
  optionalSchemaString(licence.title, `${label} licence title`);
  optionalPublicUrl(licence.url, `${label} licence URL`);
  optionalSchemaString(licence.attribution, `${label} licence attribution`);

  const access = closedPlainObject(object.access, `${label} access`, ACCESS_KEYS, ["status", "note"]);
  assertEnum(access.status, `${label} access status`, ACCESS_STATUSES);
  optionalPublicUrl(access.evidenceUrl, `${label} access evidence URL`);
  schemaString(access.note, `${label} access note`, 1);

  const dates = closedPlainObject(object.dates, `${label} dates`, DATES_KEYS, ["observed"]);
  optionalDateTime(dates.firstPublished, `${label} first-published date`);
  optionalDateTime(dates.modified, `${label} modified date`);
  dateTimeString(dates.observed, `${label} observed date`);
  schemaString(object.sourceAuthority, `${label} source authority`, 1);

  const assertions = schemaArray(object.assertions, `${label} assertions`, 1);
  assertions.forEach((assertionValue, assertionIndex) => {
    const assertionLabel = `${label} assertion ${assertionIndex}`;
    const assertion = closedPlainObject(assertionValue, assertionLabel, ASSERTION_KEYS, ["field", "status", "evidenceUrls"]);
    schemaString(assertion.field, `${assertionLabel} field`, 1);
    assertEnum(assertion.status, `${assertionLabel} status`, ASSERTION_STATUSES);
    const evidenceUrls = schemaArray(assertion.evidenceUrls, `${assertionLabel} evidence URLs`, 1);
    evidenceUrls.forEach((url, urlIndex) => safePublicUrl(url, `${assertionLabel} evidence URL ${urlIndex}`));
    optionalSchemaString(assertion.note, `${assertionLabel} note`);
  });

  const provenance = closedPlainObject(object.provenance, `${label} provenance`, PROVENANCE_KEYS, [
    "extractionMethod", "sourceDigest", "recordDigest", "bundleDigest", "evidenceReceiptId", "sources",
  ]);
  schemaString(provenance.extractionMethod, `${label} extraction method`, 1);
  optionalSchemaString(provenance.sourceLock, `${label} source lock`, 1);
  for (const [name, digest] of [
    ["source", provenance.sourceDigest],
    ["record", provenance.recordDigest],
    ["bundle", provenance.bundleDigest],
  ] as Array<[string, unknown]>) {
    if (typeof digest !== "string" || !SHA256.test(digest)) throw new Error(`${label} has an invalid ${name} digest.`);
  }
  if (typeof provenance.evidenceReceiptId !== "string" || !RECEIPT_ID.test(provenance.evidenceReceiptId)) {
    throw new Error(`${label} has an invalid evidence receipt identifier.`);
  }
  const sources = schemaArray(provenance.sources, `${label} provenance sources`, 1);
  sources.forEach((sourceValue, sourceIndex) => {
    const sourceLabel = `${label} provenance source ${sourceIndex}`;
    const source = closedPlainObject(sourceValue, sourceLabel, SOURCE_REFERENCE_KEYS, ["url", "title", "publisher", "observedAt"]);
    safePublicUrl(source.url, `${sourceLabel} URL`);
    schemaString(source.title, `${sourceLabel} title`, 1);
    schemaString(source.publisher, `${sourceLabel} publisher`, 1);
    dateTimeString(source.observedAt, `${sourceLabel} observed date`);
    if (source.digest !== undefined && (typeof source.digest !== "string" || !SHA256.test(source.digest))) {
      throw new Error(`${sourceLabel} has an invalid digest.`);
    }
  });

  const limitations = schemaArray(object.limitations, `${label} limitations`, 1, 12);
  limitations.forEach((limitation, limitationIndex) => schemaString(limitation, `${label} limitation ${limitationIndex}`, 1));
  const relatedIds = uniqueStringArray(object.relatedRecordIds, `${label} related record identifiers`, 0, 8, 1);
  if (relatedIds.some((id) => !RECORD_ID.test(id))) {
    throw new Error(`${label} has an invalid related record identifier.`);
  }
  return object as unknown as DiscoveryRecord;
}

function boundedString(value: unknown, name: string, maximum: number): string {
  if (typeof value !== "string") throw new Error(`${name} must be a string.`);
  if (value.length > maximum) throw new Error(`${name} must be at most ${maximum} characters before normalisation.`);
  const normalised = value.trim().replace(/\s+/gu, " ");
  if (!normalised) throw new Error(`${name} must not be empty.`);
  if (normalised.length > maximum) throw new Error(`${name} must be at most ${maximum} characters.`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(normalised)) {
    throw new Error(`${name} contains unsupported control characters.`);
  }
  return normalised;
}

function enumArray<T extends string>(
  value: unknown,
  name: string,
  allowed: ReadonlySet<string>,
  maximum: number,
): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maximum) {
    throw new Error(`${name} must be an array with at most ${maximum} values.`);
  }
  const output: T[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !allowed.has(item)) {
      throw new Error(`${name} contains an unsupported value.`);
    }
    if (output.includes(item as T)) throw new Error(`${name} must not contain duplicate values.`);
    output.push(item as T);
  }
  return output;
}

function integerLimit(value: unknown): number {
  if (value === undefined) return 8;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > RESULT_LIMIT_MAX) {
    throw new Error(`limit must be an integer from 1 to ${RESULT_LIMIT_MAX}.`);
  }
  return Number(value);
}

function words(value: string): string[] {
  return value.toLocaleLowerCase("en-GB").split(/[^a-z0-9]+/u).filter(Boolean);
}

function recordDigestInput(record: DiscoveryRecord): JsonObject {
  const copy = structuredClone(record) as DiscoveryRecord;
  const provenance = copy.provenance as unknown as JsonObject;
  delete provenance.recordDigest;
  delete provenance.bundleDigest;
  delete provenance.evidenceReceiptId;
  return copy as unknown as JsonObject;
}

function receiptDigestInput(receipt: EvidenceReceipt): JsonObject {
  const copy = structuredClone(receipt) as EvidenceReceipt;
  delete (copy as unknown as JsonObject).receiptDigest;
  return copy as unknown as JsonObject;
}

async function validateCatalogue(catalogue: unknown): Promise<Catalogue> {
  const root = closedPlainObject(catalogue, "The catalogue root", CATALOGUE_KEYS, [
    "schema", "generatedAt", "profile", "bundleDigest", "sourceLocksDigest", "records",
  ]);
  if (
    root.schema !== "trusted-govuk-discovery.catalogue.v1" ||
    root.profile !== "trusted-govuk-discovery.profile.v1"
  ) {
    throw new Error("The catalogue schema or profile is unsupported.");
  }
  dateTimeString(root.generatedAt, "The catalogue generation date");
  if (
    typeof root.bundleDigest !== "string" || !SHA256.test(root.bundleDigest) ||
    typeof root.sourceLocksDigest !== "string" || !SHA256.test(root.sourceLocksDigest)
  ) {
    throw new Error("The catalogue bundle binding is invalid.");
  }
  const records = schemaArray(
    root.records,
    "The reviewed catalogue records",
    RELEASE_CATALOGUE_RECORD_COUNT,
    RELEASE_CATALOGUE_RECORD_COUNT,
  )
    .map((record, index) => validateProfileRecord(record, index));
  const candidate = root as unknown as Catalogue;

  const identifiers = new Set<string>();
  const recordDigests: string[] = [];
  for (const record of records) {
    if (!RECORD_ID.test(record.id) || identifiers.has(record.id)) {
      throw new Error("A catalogue record identifier is invalid or duplicated.");
    }
    identifiers.add(record.id);
    const observedRecordDigest = await sha256Hex(canonicalJson(recordDigestInput(record)));
    if (record.provenance.recordDigest !== observedRecordDigest) {
      throw new Error(`Record ${record.id} has an invalid record digest.`);
    }
    if (record.provenance.evidenceReceiptId !==
        `trusted-govuk-discovery:evidence-receipt:sha256:${observedRecordDigest}`) {
      throw new Error(`Record ${record.id} has an evidence receipt identifier that is not derived from its record digest.`);
    }
    if (record.provenance.bundleDigest !== candidate.bundleDigest) {
      throw new Error(`Record ${record.id} is not bound to this catalogue.`);
    }
    recordDigests.push(observedRecordDigest);
  }

  for (const record of records) {
    for (const relatedId of record.relatedRecordIds) {
      if (!identifiers.has(relatedId)) throw new Error(`Record ${record.id} has an unknown related record.`);
    }
  }

  const observedBundleDigest = await sha256Hex(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: recordDigests.sort(),
  }));
  if (candidate.bundleDigest !== observedBundleDigest) {
    throw new Error("The catalogue bundle digest is invalid.");
  }
  candidate.records = records;
  return candidate as Catalogue;
}

function validateReceiptStructure(value: unknown, index: number): EvidenceReceipt {
  const label = `Evidence receipt ${index}`;
  const object = closedPlainObject(value, label, RECEIPT_KEYS, [
    "schema", "id", "observedAt", "sourceLock", "source", "output", "assertionStatuses",
    "limitations", "boundaries", "receiptDigest",
  ]);
  if (object.schema !== "trusted-govuk-discovery.evidence-receipt.v1") {
    throw new Error(`${label} uses an unsupported schema.`);
  }
  if (typeof object.id !== "string" || !RECEIPT_ID.test(object.id)) {
    throw new Error(`${label} has an invalid identifier.`);
  }
  dateTimeString(object.observedAt, `${label} observed date`);
  schemaString(object.sourceLock, `${label} source lock`, 1);

  const source = closedPlainObject(object.source, `${label} source`, RECEIPT_SOURCE_KEYS, [
    "url", "title", "publisher", "sourceDigest",
  ]);
  safePublicUrl(source.url, `${label} source URL`);
  schemaString(source.title, `${label} source title`, 1);
  schemaString(source.publisher, `${label} source publisher`, 1);
  if (typeof source.sourceDigest !== "string" || !SHA256.test(source.sourceDigest)) {
    throw new Error(`${label} has an invalid source digest.`);
  }

  const output = closedPlainObject(object.output, `${label} output`, RECEIPT_OUTPUT_KEYS, [
    "recordId", "recordDigest", "bundleDigest",
  ]);
  if (typeof output.recordId !== "string" || !RECORD_ID.test(output.recordId)) {
    throw new Error(`${label} has an invalid output record identifier.`);
  }
  for (const [name, digest] of [["record", output.recordDigest], ["bundle", output.bundleDigest]] as Array<[string, unknown]>) {
    if (typeof digest !== "string" || !SHA256.test(digest)) throw new Error(`${label} has an invalid output ${name} digest.`);
  }

  const statuses = schemaArray(object.assertionStatuses, `${label} assertion statuses`, 1, ASSERTION_STATUSES.size)
    .map((status, statusIndex) => assertEnum(status, `${label} assertion status ${statusIndex}`, ASSERTION_STATUSES));
  if (new Set(statuses).size !== statuses.length) throw new Error(`${label} has duplicate assertion statuses.`);
  const limitations = schemaArray(object.limitations, `${label} limitations`, 1, 12);
  limitations.forEach((limitation, limitationIndex) => schemaString(limitation, `${label} limitation ${limitationIndex}`, 1));

  const boundaries = closedPlainObject(object.boundaries, `${label} boundaries`, RECEIPT_BOUNDARY_KEYS, [
    "sourceWasNotRefetchedAtRuntime", "cryptographicSignatureVerified", "accessAuthorityGranted",
  ]);
  if (
    boundaries.sourceWasNotRefetchedAtRuntime !== true ||
    boundaries.cryptographicSignatureVerified !== false ||
    boundaries.accessAuthorityGranted !== false
  ) {
    throw new Error(`${label} has invalid runtime boundary constants.`);
  }
  if (typeof object.receiptDigest !== "string" || !SHA256.test(object.receiptDigest)) {
    throw new Error(`${label} has an invalid receipt digest.`);
  }
  return object as unknown as EvidenceReceipt;
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function validateReceipts(
  value: unknown,
  catalogue: Catalogue,
): Promise<Map<string, EvidenceReceipt>> {
  if (!Array.isArray(value) || value.length !== catalogue.records.length) {
    throw new Error("The evidence receipt collection is incomplete.");
  }
  const receipts = new Map<string, EvidenceReceipt>();
  const records = new Map(catalogue.records.map((record) => [record.id, record]));
  for (const [index, receiptValue] of value.entries()) {
    const candidate = validateReceiptStructure(receiptValue, index);
    const record = records.get(candidate.output.recordId);
    if (!record || receipts.has(candidate.id)) {
      throw new Error("An evidence receipt is unsupported, duplicated or has no record.");
    }
    const recordSource = record.provenance.sources[0]!;
    const expectedSourceLock = record.provenance.sourceLock ?? CURATED_SOURCE_LOCK;
    const expectedAssertionStatuses = [...new Set(record.assertions.map(({ status }) => status))].sort();
    if (
      candidate.id !== record.provenance.evidenceReceiptId ||
      candidate.observedAt !== record.dates.observed ||
      candidate.sourceLock !== expectedSourceLock ||
      candidate.source.url !== recordSource.url ||
      candidate.source.title !== recordSource.title ||
      candidate.source.publisher !== recordSource.publisher ||
      candidate.source.sourceDigest !== record.provenance.sourceDigest ||
      candidate.output.recordDigest !== record.provenance.recordDigest ||
      candidate.output.bundleDigest !== catalogue.bundleDigest ||
      !sameStrings(candidate.assertionStatuses, expectedAssertionStatuses) ||
      !sameStrings(candidate.limitations, record.limitations)
    ) {
      throw new Error(`Receipt ${candidate.id} is not bound to its record and bundle.`);
    }
    const observedReceiptDigest = await sha256Hex(canonicalJson(receiptDigestInput(candidate)));
    if (candidate.receiptDigest !== observedReceiptDigest) {
      throw new Error(`Receipt ${candidate.id} has an invalid digest.`);
    }
    receipts.set(candidate.id, candidate);
  }
  if (receipts.size !== records.size) throw new Error("The evidence receipt collection is incomplete.");
  return receipts;
}

function errorResult(code: string, message: string, details: JsonObject = {}): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code, message, details },
    limitations: ["No substitute source was selected.", "No external provider was contacted."],
  };
}

function publicSummary(record: DiscoveryRecord, match?: { score: number; matchedFields: string[] }): JsonObject {
  return {
    recordId: record.id,
    title: record.title,
    description: record.description,
    resourceType: record.resourceType,
    publisher: record.publisher,
    accessStatus: record.access.status,
    accessNote: record.access.note,
    licenceStatus: record.licence.status,
    ...(record.licence.title ? { licenceTitle: record.licence.title } : {}),
    lastObserved: record.dates.observed,
    assertionStatuses: [...new Set(record.assertions.map(({ status }) => status))].sort(),
    canonicalHumanUrl: safePublicUrl(record.canonicalHumanUrl, "Authoritative human URL"),
    ...(record.documentationUrl ? { documentationUrl: record.documentationUrl } : {}),
    ...(record.apiCatalogueUrl ? { apiCatalogueUrl: record.apiCatalogueUrl } : {}),
    recordDigest: record.provenance.recordDigest,
    bundleDigest: record.provenance.bundleDigest,
    evidenceReceiptId: record.provenance.evidenceReceiptId,
    limitations: record.limitations.slice(0, 8),
    ...(match ? { match: {
      score: match.score,
      matchedFields: match.matchedFields,
      explanation: `Matched normalised query terms in: ${match.matchedFields.join(", ")}.`,
    } } : {}),
  };
}

function scoreRecord(record: DiscoveryRecord, query: string): { score: number; matchedFields: string[] } {
  const terms = [...new Set(words(query))].slice(0, 12);
  const fields: Array<[string, string, number]> = [
    ["title", record.title, 8],
    ["description", record.description, 4],
    ["publisher", record.publisher, 3],
    ["topics", record.topics.join(" "), 2],
    ["resourceType", record.resourceType, 1],
  ];
  let score = 0;
  const matchedFields = new Set<string>();
  for (const term of terms) {
    for (const [name, text, weight] of fields) {
      if (words(text).includes(term)) {
        score += weight;
        matchedFields.add(name);
      }
    }
  }
  return { score, matchedFields: [...matchedFields].sort() };
}

export interface KnowledgeDiscoveryRuntime {
  bundleDigest: string;
  recordCount: number;
  facets: {
    resourceTypes: ResourceType[];
    publishers: string[];
    accessStatuses: AccessStatus[];
  };
  search(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  getRecord(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  showProvenance(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
}

export interface TrustedKnowledgeRuntime extends CombinedKnowledgeRuntime {
  evidence: EvidenceRuntime;
  federation: FederationRuntime;
  federatedSearch: FederatedSearchRuntime;
}

export async function createKnowledgeDiscoveryRuntime(
  rawCatalogue: string,
  rawCatalogueChecksum: string,
  rawReceipts: string,
  rawReceiptsChecksum: string,
): Promise<KnowledgeDiscoveryRuntime> {
  if (parseChecksum(rawCatalogueChecksum, "catalogue.json") !== await sha256Hex(rawCatalogue)) {
    throw new Error("The catalogue checksum does not match the same-origin bytes.");
  }
  if (parseChecksum(rawReceiptsChecksum, "receipts.json") !== await sha256Hex(rawReceipts)) {
    throw new Error("The receipt checksum does not match the same-origin bytes.");
  }
  let decodedCatalogue: unknown;
  let decodedReceipts: unknown;
  try {
    decodedCatalogue = JSON.parse(rawCatalogue);
    decodedReceipts = JSON.parse(rawReceipts);
  } catch {
    throw new Error("The catalogue or receipt collection is not valid JSON.");
  }
  const catalogue = await validateCatalogue(decodedCatalogue);
  const receipts = await validateReceipts(decodedReceipts, catalogue);
  const records = new Map(catalogue.records.map((record) => [record.id, record]));

  return {
    bundleDigest: catalogue.bundleDigest,
    recordCount: catalogue.records.length,
    facets: {
      resourceTypes: [...new Set(catalogue.records.map(({ resourceType }) => resourceType))].sort(),
      publishers: [...new Set(catalogue.records.map(({ publisher }) => publisher))].sort((a, b) => a.localeCompare(b, "en-GB")),
      accessStatuses: [...new Set(catalogue.records.map(({ access }) => access.status))].sort(),
    },
    async search(input: unknown): Promise<JsonObject> {
      try {
        const object = ensurePlainObject(input, SEARCH_KEYS);
        const query = boundedString(object.query, "query", QUERY_MAX);
        const resourceTypes = enumArray<ResourceType>(object.resourceTypes, "resourceTypes", RESOURCE_TYPES, 7);
        const accessStatuses = enumArray<AccessStatus>(object.accessStatuses, "accessStatuses", ACCESS_STATUSES, 5);
        const rawPublishers = object.publishers;
        if (rawPublishers !== undefined && (!Array.isArray(rawPublishers) || rawPublishers.length > 8)) {
          throw new Error("publishers must contain at most eight strings.");
        }
        const publishers = rawPublishers === undefined ? [] : Array.from(
          rawPublishers as unknown[],
          (publisher, index) => boundedString(publisher, `publishers[${index}]`, 100),
        );
        const publisherKeys = publishers.map((publisher) => publisher.toLocaleLowerCase("en-GB"));
        if (new Set(publisherKeys).size !== publisherKeys.length) {
          throw new Error("publishers must not contain duplicate values after normalisation.");
        }
        const limit = integerLimit(object.limit);
        const ranked = catalogue.records
          .filter((record) => !resourceTypes.length || resourceTypes.includes(record.resourceType))
          .filter((record) => !accessStatuses.length || accessStatuses.includes(record.access.status))
          .filter((record) => !publishers.length || publishers.some((publisher) =>
            publisher.toLocaleLowerCase("en-GB") === record.publisher.toLocaleLowerCase("en-GB")))
          .map((record) => ({ record, match: scoreRecord(record, query) }))
          .filter(({ match }) => match.score > 0)
          .sort((left, right) =>
            right.match.score - left.match.score ||
            left.record.title.localeCompare(right.record.title, "en-GB") ||
            left.record.id.localeCompare(right.record.id, "en-GB"));

        return {
          schema: "trusted-govuk-discovery.search-result.v1",
          ok: true,
          query,
          catalogue: { generatedAt: catalogue.generatedAt, bundleDigest: catalogue.bundleDigest, recordCount: catalogue.records.length },
          totalMatches: ranked.length,
          returned: Math.min(ranked.length, limit),
          truncated: ranked.length > limit,
          results: ranked.slice(0, limit).map(({ record, match }) => publicSummary(record, match)),
          boundaries: { pageScoped: true, readOnly: true, providerCall: false, durableReceiptCreated: false, sourceDerivedContentIsUntrusted: true },
        };
      } catch (error) {
        return errorResult("invalid_search_request", error instanceof Error ? error.message : "Search failed.");
      }
    },
    async getRecord(input: unknown): Promise<JsonObject> {
      try {
        const object = ensurePlainObject(input, RECORD_KEYS);
        const recordId = boundedString(object.recordId, "recordId", 128);
        if (recordId !== object.recordId || !RECORD_ID.test(recordId)) {
          throw new Error("recordId has an invalid format.");
        }
        const record = records.get(recordId);
        if (!record) return errorResult("record_not_found", "No exact catalogue record was found.", { recordId });
        return {
          schema: "trusted-govuk-discovery.resource-record-result.v1",
          ok: true,
          verificationStatus: "digest-bound",
          record,
          relatedRecords: record.relatedRecordIds.map((id) => publicSummary(records.get(id)!)),
          boundaries: { pageScoped: true, readOnly: true, providerCall: false, accessAuthorityGranted: false, sourceDerivedContentIsUntrusted: true },
        };
      } catch (error) {
        return errorResult("invalid_record_request", error instanceof Error ? error.message : "Record lookup failed.");
      }
    },
    async showProvenance(input: unknown): Promise<JsonObject> {
      try {
        const object = ensurePlainObject(input, RECORD_KEYS);
        const recordId = boundedString(object.recordId, "recordId", 128);
        if (recordId !== object.recordId || !RECORD_ID.test(recordId)) {
          throw new Error("recordId has an invalid format.");
        }
        const record = records.get(recordId);
        if (!record) return errorResult("record_not_found", "No exact catalogue record was found.", { recordId });
        const receipt = receipts.get(record.provenance.evidenceReceiptId)!;
        return {
          schema: "trusted-govuk-discovery.provenance-result.v1",
          ok: true,
          recordId,
          status: "digest-bound",
          observationDate: record.dates.observed,
          extractionMethod: record.provenance.extractionMethod,
          ...(record.provenance.sourceLock ? { sourceLock: record.provenance.sourceLock } : {}),
          sourceDigest: record.provenance.sourceDigest,
          recordDigest: record.provenance.recordDigest,
          bundleDigest: catalogue.bundleDigest,
          evidenceReceipt: receipt,
          sources: record.provenance.sources,
          fieldAssertions: record.assertions,
          limitations: record.limitations,
          boundaries: { receiptInspectedOnly: true, sourceWasNotRefetched: true, cryptographicSignatureVerified: false, sourceDerivedContentIsUntrusted: true },
        };
      } catch (error) {
        return errorResult("invalid_provenance_request", error instanceof Error ? error.message : "Provenance lookup failed.");
      }
    },
  };
}

function exactSameOriginUrl(path: string, prefix: string): URL {
  if (!path.startsWith(prefix) || path.includes("\\") || path.includes("%") || path.includes("..")) {
    throw new Error("A knowledge artefact path is outside its fixed same-origin namespace.");
  }
  const url = new URL(`./${path}`, document.baseURI);
  const scope = new URL(`./${prefix}`, document.baseURI);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || url.username || url.password) {
    throw new Error("A knowledge artefact URL is outside its fixed same-origin namespace.");
  }
  return url;
}

export async function readBoundedResponseBytes(
  response: Response,
  signal: AbortSignal,
  maximumBytes: number,
): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1) {
    throw new Error("The same-origin response byte budget is invalid.");
  }
  const declared = response.headers.get("content-length");
  if (
    declared !== null &&
    (!/^(?:0|[1-9][0-9]*)$/u.test(declared) || !Number.isSafeInteger(Number(declared)) || Number(declared) > maximumBytes)
  ) {
    throw new Error("A checksum-bound same-origin knowledge artefact exceeds its fixed byte budget.");
  }
  if (!response.body) {
    throw new Error("A checksum-bound same-origin knowledge artefact has no readable response body.");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel("The fixed same-origin response byte budget was exceeded.");
        throw new Error("A checksum-bound same-origin knowledge artefact exceeds its fixed byte budget.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (total < 1) {
    throw new Error("A checksum-bound same-origin knowledge artefact exceeds its fixed byte budget.");
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function fetchSameOriginBytes(
  path: string,
  prefix: string,
  signal: AbortSignal,
  maximumBytes: number,
): Promise<Uint8Array> {
  const url = exactSameOriginUrl(path, prefix);
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    signal,
  });
  if (!response.ok || response.url !== url.toString()) {
    throw new Error("A checksum-bound same-origin knowledge artefact could not be loaded from its exact URL.");
  }
  return readBoundedResponseBytes(response, signal, maximumBytes);
}

async function fetchSameOriginText(path: string, signal: AbortSignal): Promise<string> {
  const bytes = await fetchSameOriginBytes(`data/${path}`, "data/", signal, 4 * 1024 * 1024);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("A checksum-bound same-origin knowledge artefact is not valid UTF-8.");
  }
}

function federatedLoader(): FederatedSearchLoader {
  return async (path, options) => fetchSameOriginBytes(
    path,
    "data/federated-search/",
    options.signal,
    2 * 1024 * 1024,
  );
}

async function loadRuntime(signal: AbortSignal): Promise<TrustedKnowledgeRuntime> {
  const paths = [
    "catalogue.json",
    "catalogue.json.sha256",
    "receipts.json",
    "receipts.json.sha256",
    "evidence-traces.json",
    "evidence-traces.json.sha256",
    "federation.json",
    "federation.json.sha256",
    "federated-search/manifest.json",
    "federated-search/manifest.json.sha256",
  ];
  const [
    rawCatalogue,
    rawCatalogueChecksum,
    rawReceipts,
    rawReceiptsChecksum,
    rawEvidence,
    rawEvidenceChecksum,
    rawFederation,
    rawFederationChecksum,
    rawFederatedSearch,
    rawFederatedSearchChecksum,
  ] =
    await Promise.all(paths.map((path) => fetchSameOriginText(path, signal)));
  const discovery = await createKnowledgeDiscoveryRuntime(rawCatalogue!, rawCatalogueChecksum!, rawReceipts!, rawReceiptsChecksum!);
  const decodedCatalogue = JSON.parse(rawCatalogue!) as Catalogue;
  const [evidence, federation] = await Promise.all([
    createEvidenceRuntime(rawEvidence!, rawEvidenceChecksum!, discovery.bundleDigest, decodedCatalogue.records),
    createFederationRuntime(
      rawFederation!,
      rawFederationChecksum!,
      discovery.bundleDigest,
      discovery.recordCount,
    ),
  ]);
  const federatedSearch = await createFederatedSearchRuntime(
    rawFederatedSearch!,
    rawFederatedSearchChecksum!,
    federatedLoader(),
    federation.federatedSearch,
  );
  if (
    federatedSearch.sourceRecordCount !== federation.federatedSourceRecordCount ||
    federatedSearch.quarantinedRecordCount !== federation.federatedQuarantinedRecordCount ||
    federatedSearch.recordCount !== federation.federatedRecordCount
  ) {
    throw new Error("The lazy federated-search source, quarantine or searchable count does not match the admitted corpus manifest.");
  }
  const combined = createCombinedKnowledgeRuntime(discovery, federatedSearch);
  return Object.assign(combined, { evidence, federation, federatedSearch });
}

const searchInputSchema: JsonObject = {
  type: "object",
  additionalProperties: false,
  description: "Search terms and optional exact filters only. Keep personal context outside this page-scoped tool call.",
  properties: {
    query: {
      type: "string", minLength: 1, maxLength: QUERY_MAX,
      description: "The exact search terms. Do not add personal context or rewrite an explicitly supplied query.",
    },
    resourceTypes: {
      type: "array", maxItems: 7, uniqueItems: true, items: { $ref: "#/$defs/resourceType" },
      description: "Optional exact machine tokens: govuk-content, dataset, api, api-documentation, catalogue-record, organisation and guidance. Omit this property when unused; do not send an empty array or display labels.",
    },
    publishers: {
      type: "array", maxItems: 8, uniqueItems: true, items: { type: "string", minLength: 1, maxLength: 100 },
      description: "Optional exact publisher names. Omit this property when unused; do not send an empty array.",
    },
    accessStatuses: {
      type: "array", maxItems: 5, uniqueItems: true, items: { $ref: "#/$defs/accessStatus" },
      description: "Optional exact access-status machine tokens. Omit this property when unused; do not send an empty array or display labels.",
    },
    collections: {
      type: "array", minItems: 1, maxItems: 5, uniqueItems: true, items: { $ref: "#/$defs/knowledgeCollection" },
      description: "Optional exact machine tokens: deep-evidence, uk-living, ons, government-apis and land-registry. Omit this property to search all collections; never send an empty array or a display label.",
    },
    limit: {
      type: "integer", minimum: 1, maximum: RESULT_LIMIT_MAX, default: 8,
      description: "Maximum results from 1 to 20. Use an explicitly requested value exactly; omit it only to accept the default of 8.",
    },
  },
  required: ["query"],
  $defs: {
    resourceType: { type: "string", enum: [...RESOURCE_TYPES] },
    accessStatus: { type: "string", enum: [...ACCESS_STATUSES] },
    knowledgeCollection: { type: "string", enum: [...KNOWLEDGE_COLLECTIONS] },
  },
};

const recordInputSchema: JsonObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    recordId: { type: "string", minLength: 3, maxLength: 160, pattern: "^govuk-discovery:(?:[a-z0-9][a-z0-9._:-]{2,111}|federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5}))$" },
  },
  required: ["recordId"],
};

const answerInputSchema: JsonObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    answerId: { type: "string", minLength: 8, maxLength: 96, pattern: "^answer:[a-z0-9][a-z0-9-]{2,88}$" },
    claimId: { type: "string", minLength: 8, maxLength: 96, pattern: "^claim:[a-z0-9][a-z0-9-]{2,89}$" },
  },
  required: ["answerId"],
};

const comparisonInputSchema: JsonObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    answerId: { type: "string", minLength: 8, maxLength: 96, pattern: "^answer:[a-z0-9][a-z0-9-]{2,88}$" },
    claimIds: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      uniqueItems: true,
      items: { type: "string", minLength: 8, maxLength: 96, pattern: "^claim:[a-z0-9][a-z0-9-]{2,89}$" },
    },
  },
  required: ["answerId", "claimIds"],
};

export const TOOL_INPUT_SCHEMAS: Readonly<Record<string, JsonObject>> = Object.freeze({
  search_government_knowledge: searchInputSchema,
  get_resource_record: recordInputSchema,
  show_provenance: recordInputSchema,
  explore_answer_foundations: answerInputSchema,
  compare_evidence_foundations: comparisonInputSchema,
});

export type RegistrationState = "registered" | "unavailable" | "blocked" | "failed";

export interface RegistrationResult {
  state: RegistrationState;
  expectedNames: string[];
  registeredNames: string[];
  reason: string;
  dispose?: () => void;
}

const EXPECTED_TOOL_NAMES = [
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
] as const;

export const TOOL_DESCRIPTIONS: Readonly<Record<(typeof EXPECTED_TOOL_NAMES)[number], string>> = Object.freeze({
  search_government_knowledge: "Search 80 reviewed records and 58,652 searchable records from four checksum-bound OKF source snapshots. Use exact collection IDs deep-evidence, uk-living, ons, government-apis or land-registry; omit unused optional filters rather than sending empty arrays or display labels. Three source records are quarantined. It accepts no personal profile and calls no official or model-provider API.",
  get_resource_record: "Return one exact reviewed or federated record using its canonical govuk-discovery: record ID exactly, not a display label. Includes its assurance tier, source link, access, licence, assertions and limitations. A federated result is snapshot-bound, not item-reviewed, and grants no access authority.",
  show_provenance: "Inspect provenance using the canonical govuk-discovery: record ID exactly, not a display label. Returns either an item-level reviewed receipt or the file, snapshot and manifest bindings for a federated record. It does not refetch or independently certify an official source.",
  explore_answer_foundations: "Use canonical answer: and optional claim: IDs exactly, not display labels, to select one bounded evidence-first answer or claim and update this page's analytical index and Evidence Trace. The only effect is reversible in-memory presentation; no source, storage or external state changes.",
  compare_evidence_foundations: "Use one canonical answer: ID and two to four canonical claim: IDs exactly, not display labels, to update this page's accessible comparison. It does not rank sources or change catalogue, storage, network or external state.",
});

function webMcpActionOptions(
  present: boolean,
  options?: { signal?: AbortSignal },
): ActionOptions {
  const base: ActionOptions = { origin: "webmcp", present };
  return options?.signal ? { ...base, signal: options.signal } : base;
}

function fixedToolDefinitions(actions: KnowledgeActionController): ModelContextTool[] {
  const untrusted = { untrustedContentHint: true } as const;
  return [
    {
      name: "search_government_knowledge",
      title: "Search government knowledge",
      description: TOOL_DESCRIPTIONS.search_government_knowledge,
      inputSchema: searchInputSchema,
      annotations: { readOnlyHint: true, ...untrusted },
      execute: (input, options) => actions.run("search_government_knowledge", input, webMcpActionOptions(false, options)),
    },
    {
      name: "get_resource_record",
      title: "Get a government resource record",
      description: TOOL_DESCRIPTIONS.get_resource_record,
      inputSchema: recordInputSchema,
      annotations: { readOnlyHint: true, ...untrusted },
      execute: (input, options) => actions.run("get_resource_record", input, webMcpActionOptions(false, options)),
    },
    {
      name: "show_provenance",
      title: "Show record provenance",
      description: TOOL_DESCRIPTIONS.show_provenance,
      inputSchema: recordInputSchema,
      annotations: { readOnlyHint: true, ...untrusted },
      execute: (input, options) => actions.run("show_provenance", input, webMcpActionOptions(false, options)),
    },
    {
      name: "explore_answer_foundations",
      title: "Explore answer foundations",
      description: TOOL_DESCRIPTIONS.explore_answer_foundations,
      inputSchema: answerInputSchema,
      annotations: { readOnlyHint: false, ...untrusted },
      execute: (input, options) => actions.run("explore_answer_foundations", input, webMcpActionOptions(true, options)),
    },
    {
      name: "compare_evidence_foundations",
      title: "Compare evidence foundations",
      description: TOOL_DESCRIPTIONS.compare_evidence_foundations,
      inputSchema: comparisonInputSchema,
      annotations: { readOnlyHint: false, ...untrusted },
      execute: (input, options) => actions.run("compare_evidence_foundations", input, webMcpActionOptions(true, options)),
    },
  ];
}

async function registerTools(actions: KnowledgeActionController): Promise<RegistrationResult> {
  const expectedNames = [...EXPECTED_TOOL_NAMES];
  if (!globalThis.isSecureContext) {
    return { state: "unavailable", expectedNames, registeredNames: [], reason: "WebMCP requires a secure context." };
  }
  const modelContext = document.modelContext;
  if (!modelContext?.registerTool) {
    return { state: "unavailable", expectedNames, registeredNames: [], reason: "The WebMCP API is not available in this browser." };
  }
  const definitions = fixedToolDefinitions(actions);
  if (new Set(definitions.map(({ name }) => name)).size !== definitions.length ||
      definitions.some(({ inputSchema }) => inputSchema.additionalProperties !== false)) {
    return { state: "failed", expectedNames, registeredNames: [], reason: "The fixed tool definitions failed local prevalidation." };
  }
  const lifetime = new AbortController();
  const registeredNames: string[] = [];
  let registrationTimer: number | undefined;
  try {
    const registrationAttempt = async (): Promise<void> => {
      for (const definition of definitions) {
        lifetime.signal.throwIfAborted();
        await modelContext.registerTool(definition, { signal: lifetime.signal });
        lifetime.signal.throwIfAborted();
        registeredNames.push(definition.name);
      }
    };
    const timeout = new Promise<never>((_, reject) => {
      registrationTimer = globalThis.setTimeout(() => {
        lifetime.abort();
        reject(new DOMException("WebMCP registration timed out.", "TimeoutError"));
      }, REGISTRATION_TIMEOUT_MS);
    });
    await Promise.race([registrationAttempt(), timeout]);
    return {
      state: "registered",
      expectedNames,
      registeredNames,
      reason: "All five fixed tools registered after reviewed evidence, admissions and the lazy federated-search manifest validated.",
      dispose: () => lifetime.abort(),
    };
  } catch (error) {
    lifetime.abort();
    const name = error instanceof DOMException || error instanceof Error ? error.name : "Error";
    const state: RegistrationState = name === "NotAllowedError" || name === "SecurityError" ? "blocked" : "failed";
    return {
      state,
      expectedNames,
      registeredNames: [],
      reason: name === "TimeoutError"
        ? "WebMCP registration timed out after 3 seconds; the verified human interface remains available."
        : `WebMCP registration ${state === "blocked" ? "was blocked by the browser or policy" : "failed"}; the verified human interface remains available.`,
    };
  } finally {
    if (registrationTimer !== undefined) globalThis.clearTimeout(registrationTimer);
  }
}

export async function initialiseKnowledgeDiscovery(
  commitPresentation?: (presentation: ActionPresentation) => void,
): Promise<{
  runtime: TrustedKnowledgeRuntime;
  actions: KnowledgeActionController;
  registration: Promise<RegistrationResult>;
}> {
  const loadController = new AbortController();
  const timeout = globalThis.setTimeout(() => loadController.abort(), 10000);
  try {
    const runtime = await loadRuntime(loadController.signal);
    const actions = createKnowledgeActionController(runtime, commitPresentation);
    const registration = registerTools(actions);
    return { runtime, actions, registration };
  } catch (error) {
    if (loadController.signal.aborted) {
      throw new Error("Knowledge artefact startup timed out after 10 seconds.");
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
