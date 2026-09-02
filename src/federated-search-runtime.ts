/**
 * Lazy, same-origin search over the checksum-bound OKF federation projection.
 *
 * Source-derived strings remain untrusted data. This module never interprets
 * them as instructions, fetch targets or executable content.
 */

import type { JsonObject } from "./contracts.js";
import type { FederatedSearchBinding } from "./federation-runtime.js";
import {
  OKF_FEDERATED_COLLECTION_IDS,
  type OkfFederatedCollectionId,
} from "./okf-federated-contracts.js";
import { canonicalJson, isRfc3339DateTime, parseChecksum, sha256Hex } from "./integrity.js";

export const FEDERATED_SEARCH_LIMITS = Object.freeze({
  maximumManifestBytes: 4 * 1024 * 1024,
  maximumQueryCharacters: 160,
  maximumQueryTokens: 12,
  maximumResults: 20,
  maximumResultShards: 8,
  maximumRecordShardBytes: 2 * 1024 * 1024,
  maximumPostingsShardBytes: 1024 * 1024,
  maximumReferences: 4096,
  maximumPostingsReferencesPerPrefix: 16,
  maximumFetchFilesPerOperation: 64,
  maximumFetchBytesPerOperation: 24 * 1024 * 1024,
  maximumCacheFiles: 64,
  maximumCacheBytes: 32 * 1024 * 1024,
  maximumConcurrentOperations: 4,
  maximumQueuedOperations: 32,
  maximumConcurrentPhysicalFetches: 4,
  maximumQueuedPhysicalFetches: 32,
  maximumDistinctInFlightFiles: 36,
  maximumOperationMilliseconds: 10_000,
  maximumFileMilliseconds: 3_000,
});

export type FederatedSearchPath = `data/federated-search/${string}`;

export interface FederatedSearchLoadOptions {
  readonly credentials: "omit";
  readonly redirect: "error";
  readonly signal: AbortSignal;
}

export type FederatedSearchLoader = (
  path: FederatedSearchPath,
  options: FederatedSearchLoadOptions,
) => Promise<Uint8Array | ArrayBuffer>;

export interface FederatedCollectionMetadata extends JsonObject {
  id: OkfFederatedCollectionId;
  title: string;
  sourceRecordCount: number;
  quarantinedRecordCount: number;
  recordCount: number;
  firstOrdinal: number;
  lastOrdinal: number;
  snapshot: string | null;
  revision: string;
  deploymentId: string;
  descriptorUrl: string;
  extractionMethod: string;
  limitations: string[];
  collectionDigest: string;
  serviceFamilies?: number;
}

export interface FederatedCollectionStatus extends JsonObject {
  collectionId: OkfFederatedCollectionId;
  title: string;
  status: "ready" | "unavailable";
  totalMatches: number;
  totalRelation: "eq" | "gte";
  returned: number;
  verifiedShardFiles: number;
  verifiedShardBytes: number;
  limitation?: string;
}

export interface FederatedSearchResult extends JsonObject {
  schema: "govuk-webmcp.federated-search-result.v1";
  ok: true;
  query: string;
  evidenceTier: "federated-source-snapshot";
  manifestDigest: string;
  totalMatches: number;
  totalRelation: "eq" | "gte";
  returned: number;
  truncated: boolean;
  results: JsonObject[];
  collectionStatuses: FederatedCollectionStatus[];
  boundaries: JsonObject;
}

export interface FederatedRecordResult extends JsonObject {
  schema: "govuk-webmcp.federated-resource-record-result.v1";
  ok: true;
  evidenceTier: "federated-source-snapshot";
  verificationStatus: "snapshot-file-integrity";
  record: JsonObject;
  relatedRecords: [];
  integrity: JsonObject;
  boundaries: JsonObject;
}

export interface FederatedProvenanceResult extends JsonObject {
  schema: "govuk-webmcp.federated-provenance-result.v1";
  ok: true;
  evidenceTier: "federated-source-snapshot";
  recordId: string;
  status: "federated-source-linked";
  observationDate: string;
  sourceLock: string;
  sourceDigest: string;
  recordDigest: string;
  bundleDigest: string;
  snapshot: string | null;
  revision: string;
  sourcePath: string;
  sourceFileDigest: string;
  evidenceReceiptAvailable: false;
  collection: JsonObject;
  authoritativeLink: JsonObject;
  fieldAssertions: JsonObject[];
  limitations: string[];
  boundaries: JsonObject;
}

export type FederatedRecordVisitor = (
  record: FederatedRecordResult,
  provenance: FederatedProvenanceResult,
) => void | Promise<void>;

export interface FederatedErrorResult extends JsonObject {
  schema: "govuk-webmcp.federated-error.v1";
  ok: false;
  error: JsonObject;
  limitations: string[];
}

interface ExpectedCollection {
  readonly admissionId: string;
  readonly id: OkfFederatedCollectionId;
  readonly title: string;
  readonly sourceRecordCount: number;
  readonly quarantinedRecordCount: number;
  readonly recordCount: number;
  readonly firstOrdinal: number;
  readonly lastOrdinal: number;
  readonly snapshot: string | null;
  readonly revision: string;
  readonly descriptorUrl: string;
  readonly serviceFamilies?: number;
}

const EXPECTED_COLLECTIONS: readonly ExpectedCollection[] = Object.freeze([
  Object.freeze({
    admissionId: "corpus:uk-life-course",
    id: "uk-living",
    title: "A Life in the UK — life-course discovery corpus",
    sourceRecordCount: 9_757,
    quarantinedRecordCount: 0,
    recordCount: 9_757,
    firstOrdinal: 0,
    lastOrdinal: 9_756,
    snapshot: "life-course-authority-infrastructure-2026-08-08",
    revision: "4bc010eab3c9c072f68960393c1458a772aa700b",
    descriptorUrl: "https://chris-page-gov.github.io/okf-uk-living/okf-explorer.json",
    serviceFamilies: 293,
  }),
  Object.freeze({
    admissionId: "corpus:ons-metadata",
    id: "ons",
    title: "ONS data discovery OKF",
    sourceRecordCount: 5_097,
    quarantinedRecordCount: 0,
    recordCount: 5_097,
    firstOrdinal: 9_757,
    lastOrdinal: 14_853,
    snapshot: "monday-2026-07-17-r2",
    revision: "b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf",
    descriptorUrl: "https://chris-page-gov.github.io/okf-ons/okf-explorer.json",
  }),
  Object.freeze({
    admissionId: "corpus:uk-government-apis",
    id: "government-apis",
    title: "UK Government APIs OKF",
    sourceRecordCount: 41_598,
    quarantinedRecordCount: 0,
    recordCount: 41_598,
    firstOrdinal: 14_854,
    lastOrdinal: 56_451,
    snapshot: null,
    revision: "55c7e67947dfd86e291ca987e354429c36b453d9",
    descriptorUrl: "https://chris-page-gov.github.io/okf-uk-government-apis/okf-explorer.json",
  }),
  Object.freeze({
    admissionId: "corpus:land-registry-metadata",
    id: "land-registry",
    title: "HM Land Registry public-estate OKF",
    sourceRecordCount: 2_203,
    quarantinedRecordCount: 3,
    recordCount: 2_200,
    firstOrdinal: 56_452,
    lastOrdinal: 58_651,
    snapshot: "hmlr-public-metadata-v0.2.0",
    revision: "1d708e39f2cde19610d43c5a7f5e36e4a2f947bc",
    descriptorUrl: "https://chris-page-gov.github.io/okf-LandRegistry/okf-explorer.json",
  }),
]);

const SHA256 = /^[a-f0-9]{64}$/u;
const COMMIT = /^[a-f0-9]{40}$/u;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;
const RECORD_ID = /^govuk-discovery:federated:(uk-living|ons|government-apis|land-registry):(0|[1-9][0-9]{0,5})$/u;
const TOKEN = /^[a-z0-9](?:[a-z0-9._-]{0,498}[a-z0-9])?$/u;
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it", "of", "on",
  "or", "that", "the", "their", "this", "to", "was", "were", "with",
]);
const RESOURCE_TYPES = new Set([
  "govuk-content", "dataset", "api", "api-documentation", "catalogue-record", "organisation", "guidance",
]);
const AUTHORITY_LINK_ROLES = new Set([
  "producer-declared-source", "producer-record", "no-direct-authority-link",
]);
const LICENCE_STATUSES = new Set(["confirmed", "missing", "conflicting", "not-applicable"]);
const ACCESS_STATUSES = new Set([
  "public", "restricted", "authentication-required", "access-not-established", "not-applicable",
]);
const ASSERTION_STATUSES = new Set(["producer-declared", "normalised", "inferred", "model-derived", "unclassified"]);
const WEIGHTS = Object.freeze({
  title: 16,
  description: 5,
  publisher: 8,
  topics: 4,
  resourceType: 3,
  sourceNativeId: 2,
});
const MATCH_FIELDS = Object.freeze([
  [1, "title"],
  [2, "description"],
  [4, "publisher"],
  [8, "topics"],
  [16, "resourceType"],
  [32, "sourceNativeId"],
] as const);

const ROOT_KEYS = new Set([
  "schema", "generatedAt", "evidenceTier", "projectionProfile", "sourceLockSha256", "sourceLockDigest", "recordCount",
  "sourceRecordCount", "quarantinedRecordCount", "collectionCount", "recordShardSize", "tokenisation", "weights", "collections",
  "manifestDigest",
]);
const WEIGHT_KEYS = new Set(Object.keys(WEIGHTS));
const COLLECTION_KEYS = new Set([
  "id", "title", "sourceRecordCount", "quarantinedRecordCount", "recordCount", "firstOrdinal", "lastOrdinal", "serviceFamilies",
  "snapshot", "revision",
  "deploymentId", "descriptorUrl", "extractionMethod", "limitations", "recordShards", "postings", "collectionDigest",
]);
const ADMISSION_COLLECTION_BINDING_KEYS = new Set([
  "admissionId", "collectionId", "sourceRecordCount", "quarantinedRecordCount", "recordCount",
]);
const RECORD_REFERENCE_KEYS = new Set(["collectionId", "path", "bytes", "sha256", "firstOrdinal", "lastOrdinal", "recordCount"]);
const POSTINGS_REFERENCE_KEYS = new Set(["collectionId", "path", "bytes", "sha256", "tokenCount", "postingCount"]);
const RECORD_SHARD_KEYS = new Set(["schema", "collectionId", "firstOrdinal", "lastOrdinal", "records"]);
const POSTINGS_SHARD_KEYS = new Set(["schema", "collectionId", "prefix", "part", "entries"]);
const RECORD_KEYS = new Set([
  "ordinal", "sourceNativeId", "title", "description", "resourceType", "publisher", "topics", "authoritativeLink",
  "documentationUrl", "licence", "access", "assertionStatus", "sourcePath", "sourceSha256", "limitations", "recordDigest",
]);
const AUTHORITY_LINK_KEYS = new Set(["url", "role", "label"]);
const LICENCE_KEYS = new Set(["status", "title", "url"]);
const ACCESS_KEYS = new Set(["status", "note"]);
const SEARCH_INPUT_KEYS = new Set(["query", "collections", "limit"]);
const RECORD_INPUT_KEYS = new Set(["recordId"]);

interface RecordShardReference {
  readonly collectionId: OkfFederatedCollectionId;
  readonly path: FederatedSearchPath;
  readonly bytes: number;
  readonly sha256: string;
  readonly firstOrdinal: number;
  readonly lastOrdinal: number;
  readonly recordCount: number;
}

interface PostingsShardReference {
  readonly collectionId: OkfFederatedCollectionId;
  readonly path: FederatedSearchPath;
  readonly bytes: number;
  readonly sha256: string;
  readonly tokenCount: number;
  readonly postingCount: number;
  readonly part: number;
}

interface ValidatedCollection {
  readonly metadata: FederatedCollectionMetadata;
  readonly recordShards: readonly RecordShardReference[];
  readonly postings: ReadonlyMap<string, readonly PostingsShardReference[]>;
}

interface ValidatedManifest {
  readonly generatedAt: string;
  readonly sourceLockSha256: string;
  readonly sourceLockDigest: string;
  readonly manifestDigest: string;
  readonly sourceRecordCount: 58_655;
  readonly quarantinedRecordCount: 3;
  readonly recordCount: 58_652;
  readonly collections: readonly ValidatedCollection[];
}

interface FederatedRecord extends JsonObject {
  id: string;
  ordinal: number;
  evidenceTier: "federated-source-snapshot";
  collectionId: OkfFederatedCollectionId;
  sourceNativeId: string;
  sourceNativeIdSha256: string;
  title: string;
  description: string;
  resourceType: string;
  publisher: string;
  topics: string[];
  authoritativeLink: JsonObject;
  documentationUrl: string | null;
  licence: JsonObject;
  access: JsonObject;
  assertionStatus: string;
  observedAt: string;
  snapshot: string | null;
  revision: string;
  deploymentId: string;
  sourcePath: string;
  sourceSha256: string;
  extractionMethod: string;
  limitations: string[];
  recordDigest: string;
}

interface ResolvedFederatedRecord {
  readonly collection: ValidatedCollection;
  readonly reference: RecordShardReference;
  readonly record: FederatedRecord;
}

interface RankedCandidate {
  readonly collection: ValidatedCollection;
  readonly ordinal: number;
  readonly score: number;
  readonly mask: number;
  readonly localRank: number;
  readonly reference: RecordShardReference;
}

interface LoadedCandidate extends RankedCandidate {
  readonly record: FederatedRecord;
}

interface SourceSearchState {
  readonly collection: ValidatedCollection;
  status: "ready" | "unavailable";
  totalMatches: number;
  candidates: RankedCandidate[];
  returned: number;
  verifiedShardFiles: number;
  verifiedShardBytes: number;
  readonly budget: OperationBudget;
}

interface CacheEntry {
  readonly bytes: number;
  readonly value: unknown;
}

interface OperationWaiter {
  readonly signal: AbortSignal | undefined;
  readonly resolve: (release: () => void) => void;
  readonly reject: (reason?: unknown) => void;
  readonly onAbort: () => void;
}

interface PhysicalFetchWaiter {
  readonly deadline: number;
  readonly resolve: (release: () => void) => void;
  readonly reject: (reason?: unknown) => void;
  readonly timeout: ReturnType<typeof setTimeout>;
}

interface InFlightFile {
  readonly result: Promise<unknown>;
  readonly settled: Promise<void>;
}

function plainObject(
  value: unknown,
  allowed: ReadonlySet<string>,
  required: readonly string[],
  label: string,
): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  const object = value as JsonObject;
  const copy: JsonObject = {};
  const keys = Reflect.ownKeys(object);
  for (const key of keys) {
    if (typeof key !== "string" || !allowed.has(key)) throw new Error(`${label} contains an unknown field.`);
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} must contain data fields only.`);
    }
    copy[key] = descriptor.value as unknown;
  }
  for (const key of required) {
    if (!Object.hasOwn(copy, key)) throw new Error(`${label} is missing ${key}.`);
  }
  return copy;
}

function dataArray(value: unknown, label: string, minimum: number, maximum: number): unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new Error(`${label} must be a plain data array.`);
  }
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, "value") ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < minimum || lengthDescriptor.value > maximum) {
    throw new Error(`${label} must contain from ${minimum} to ${maximum} items.`);
  }
  const length = lengthDescriptor.value;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => {
    if (key === "length") return false;
    if (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/u.test(key)) return true;
    const index = Number(key);
    return !Number.isSafeInteger(index) || index < 0 || index >= length;
  })) {
    throw new Error(`${label} must contain indexed data items only.`);
  }
  const copy: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} must not contain accessors or empty positions.`);
    }
    copy.push(descriptor.value as unknown);
  }
  return copy;
}

function stringValue(value: unknown, label: string, minimum: number, maximum: number): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || CONTROL_CHARACTERS.test(value)) {
    throw new Error(`${label} must be a bounded string without control characters.`);
  }
  return value;
}

function integer(value: unknown, label: string, minimum: number, maximum: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}.`);
  }
  return value;
}

function digest(value: unknown, label: string): string {
  if (typeof value !== "string" || !SHA256.test(value)) throw new Error(`${label} must be a lower-case SHA-256 digest.`);
  return value;
}

function isLegislationHost(url: URL): boolean {
  const hostname = url.hostname.replace(/\.+$/u, "").toLowerCase();
  return hostname === "legislation.gov.uk" || hostname.endsWith(".legislation.gov.uk");
}

function exactHttpsUrl(value: unknown, expected: string | undefined, label: string): string {
  const text = stringValue(value, label, 8, 2_048);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`${label} is malformed.`);
  }
  if (
    url.protocol !== "https:" || url.username || url.password || url.port || isLegislationHost(url) ||
    url.toString() !== text || (expected !== undefined && text !== expected)
  ) {
    throw new Error(`${label} must be an admitted, credential-free canonical HTTPS URL.`);
  }
  return text;
}

function optionalHttpsUrl(value: unknown, label: string): string | null {
  if (value === null) return null;
  return exactHttpsUrl(value, undefined, label);
}

function withoutField(object: JsonObject, field: string): JsonObject {
  return Object.fromEntries(Object.entries(object).filter(([key]) => key !== field));
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function prefixFor(token: string): string {
  return token.replace(/[^a-z0-9]/gu, "").slice(0, 2) || "_";
}

function tokeniseQuery(query: string): string[] {
  const normalised = query.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase();
  const tokens = [...new Set([...normalised.matchAll(/[a-z0-9][a-z0-9._-]*/gu)]
    .map(([match]) => match.replace(/^[._-]+|[._-]+$/gu, ""))
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token)))];
  if (!tokens.length) throw new Error("query must contain at least one searchable term of two or more characters.");
  if (tokens.length > FEDERATED_SEARCH_LIMITS.maximumQueryTokens) {
    throw new Error(`query must contain at most ${FEDERATED_SEARCH_LIMITS.maximumQueryTokens} distinct searchable terms.`);
  }
  return tokens;
}

async function sha256Bytes(value: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("This browser cannot verify federated search bytes.");
  const digestValue = await globalThis.crypto.subtle.digest(
    "SHA-256",
    value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer,
  );
  return [...new Uint8Array(digestValue)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeRecordPath(value: unknown, id: OkfFederatedCollectionId, part: number): FederatedSearchPath {
  const expected = `data/federated-search/records/${id}/records-${String(part).padStart(3, "0")}.json`;
  if (value !== expected || typeof value !== "string" || value.length > 240 || value.includes("%") || value.includes("\\")) {
    throw new Error(`${id} record shard path is outside its exact same-origin namespace.`);
  }
  return value as FederatedSearchPath;
}

function safePostingsPath(
  value: unknown,
  id: OkfFederatedCollectionId,
  prefix: string,
  part: number,
): FederatedSearchPath {
  const expected = `data/federated-search/postings/${id}/${prefix}-${String(part).padStart(3, "0")}.json`;
  if (value !== expected || typeof value !== "string" || value.length > 240 || value.includes("%") || value.includes("\\")) {
    throw new Error(`${id} postings shard path is outside its exact same-origin namespace.`);
  }
  return value as FederatedSearchPath;
}

function exactEnum(value: unknown, allowed: ReadonlySet<string>, label: string): string {
  if (typeof value !== "string" || !allowed.has(value)) throw new Error(`${label} is unsupported.`);
  return value;
}

function stringArray(value: unknown, label: string, minimum: number, maximum: number, itemMaximum: number): string[] {
  const array = dataArray(value, label, minimum, maximum);
  const output = array.map((item, index) => stringValue(item, `${label} ${index}`, 1, itemMaximum));
  if (new Set(output).size !== output.length) throw new Error(`${label} must not contain duplicates.`);
  return output;
}

function validateRecordReference(
  value: unknown,
  collection: ExpectedCollection,
  part: number,
  expectedFirst: number,
): RecordShardReference {
  const object = plainObject(value, RECORD_REFERENCE_KEYS, [...RECORD_REFERENCE_KEYS], `${collection.id} record reference ${part}`);
  if (object.collectionId !== collection.id) throw new Error(`${collection.id} record reference has the wrong collection identifier.`);
  const recordCount = integer(object.recordCount, `${collection.id} record reference count`, 1, 500);
  const firstOrdinal = integer(object.firstOrdinal, `${collection.id} record reference first ordinal`, expectedFirst, expectedFirst);
  const expectedLast = expectedFirst + recordCount - 1;
  const lastOrdinal = integer(object.lastOrdinal, `${collection.id} record reference last ordinal`, expectedLast, expectedLast);
  if (lastOrdinal > collection.lastOrdinal) throw new Error(`${collection.id} record reference exceeds its collection range.`);
  return Object.freeze({
    collectionId: collection.id,
    path: safeRecordPath(object.path, collection.id, part),
    bytes: integer(object.bytes, `${collection.id} record reference bytes`, 2, FEDERATED_SEARCH_LIMITS.maximumRecordShardBytes),
    sha256: digest(object.sha256, `${collection.id} record reference digest`),
    firstOrdinal,
    lastOrdinal,
    recordCount,
  });
}

function validatePostingsReference(
  value: unknown,
  collection: ExpectedCollection,
  prefix: string,
  part: number,
): PostingsShardReference {
  const object = plainObject(value, POSTINGS_REFERENCE_KEYS, [...POSTINGS_REFERENCE_KEYS], `${collection.id} postings reference`);
  if (object.collectionId !== collection.id) throw new Error(`${collection.id} postings reference has the wrong collection identifier.`);
  return Object.freeze({
    collectionId: collection.id,
    path: safePostingsPath(object.path, collection.id, prefix, part),
    bytes: integer(object.bytes, `${collection.id} postings reference bytes`, 2, FEDERATED_SEARCH_LIMITS.maximumPostingsShardBytes),
    sha256: digest(object.sha256, `${collection.id} postings reference digest`),
    tokenCount: integer(object.tokenCount, `${collection.id} postings token count`, 1, 100_000),
    postingCount: integer(object.postingCount, `${collection.id} posting count`, 1, 5_000_000),
    part,
  });
}

function validateWorstPermittedAccess(
  collectionId: OkfFederatedCollectionId,
  recordShards: readonly RecordShardReference[],
  postings: ReadonlyMap<string, readonly PostingsShardReference[]>,
): void {
  const prefixUsage = [...postings.values()].map((references) => ({
    files: references.length,
    bytes: references.reduce((total, reference) => total + reference.bytes, 0),
  }));
  const recordUsage = [...recordShards].sort((left, right) => right.bytes - left.bytes)
    .slice(0, FEDERATED_SEARCH_LIMITS.maximumResultShards);
  const maximumRecordFiles = recordUsage.length;
  const maximumRecordBytes = recordUsage.reduce((total, reference) => total + reference.bytes, 0);
  const maximumPostingsFiles = [...prefixUsage].sort((left, right) => right.files - left.files)
    .slice(0, FEDERATED_SEARCH_LIMITS.maximumQueryTokens)
    .reduce((total, usage) => total + usage.files, 0);
  const maximumPostingsBytes = [...prefixUsage].sort((left, right) => right.bytes - left.bytes)
    .slice(0, FEDERATED_SEARCH_LIMITS.maximumQueryTokens)
    .reduce((total, usage) => total + usage.bytes, 0);
  if (maximumPostingsFiles + maximumRecordFiles > FEDERATED_SEARCH_LIMITS.maximumFetchFilesPerOperation ||
      maximumPostingsBytes + maximumRecordBytes > FEDERATED_SEARCH_LIMITS.maximumFetchBytesPerOperation) {
    throw new Error(`${collectionId} can exceed its fixed per-collection fetch budget under one valid request.`);
  }
}

function validateFederatedSearchBinding(value: unknown): FederatedSearchBinding {
  const object = plainObject(value, new Set([
    "sourceLockSha256", "sourceLockDigest", "sourceRecordCount", "quarantinedRecordCount", "recordCount", "collectionBindings",
  ]), [
    "sourceLockSha256", "sourceLockDigest", "sourceRecordCount", "quarantinedRecordCount", "recordCount", "collectionBindings",
  ], "Federated-search admission binding");
  const rawCollectionBindings = dataArray(
    object.collectionBindings,
    "Federated-search admission collection bindings",
    EXPECTED_COLLECTIONS.length,
    EXPECTED_COLLECTIONS.length,
  );
  const collectionBindings = rawCollectionBindings.map((candidate, index) => {
    const expected = EXPECTED_COLLECTIONS[index]!;
    const admitted = plainObject(
      candidate,
      ADMISSION_COLLECTION_BINDING_KEYS,
      [...ADMISSION_COLLECTION_BINDING_KEYS],
      `Federated-search admission collection binding ${index}`,
    );
    if (
      admitted.admissionId !== expected.admissionId || admitted.collectionId !== expected.id ||
      admitted.sourceRecordCount !== expected.sourceRecordCount ||
      admitted.quarantinedRecordCount !== expected.quarantinedRecordCount ||
      admitted.recordCount !== expected.recordCount ||
      Number(admitted.sourceRecordCount) !== Number(admitted.recordCount) + Number(admitted.quarantinedRecordCount)
    ) {
      throw new Error(`${expected.id} does not match its exact admitted collection population binding.`);
    }
    return Object.freeze({
      admissionId: expected.admissionId,
      collectionId: expected.id,
      sourceRecordCount: expected.sourceRecordCount,
      quarantinedRecordCount: expected.quarantinedRecordCount,
      recordCount: expected.recordCount,
    });
  });
  const binding = {
    sourceLockSha256: digest(object.sourceLockSha256, "Admitted source-lock byte digest"),
    sourceLockDigest: digest(object.sourceLockDigest, "Admitted source-lock semantic digest"),
    sourceRecordCount: integer(object.sourceRecordCount, "Admitted source record count", 58_655, 58_655),
    quarantinedRecordCount: integer(object.quarantinedRecordCount, "Admitted quarantine count", 3, 3),
    recordCount: integer(object.recordCount, "Admitted searchable record count", 58_652, 58_652),
    collectionBindings: Object.freeze(collectionBindings),
  };
  if (
    binding.sourceRecordCount !== binding.recordCount + binding.quarantinedRecordCount ||
    binding.collectionBindings.reduce((total, admitted) => total + admitted.sourceRecordCount, 0) !==
      binding.sourceRecordCount ||
    binding.collectionBindings.reduce((total, admitted) => total + admitted.quarantinedRecordCount, 0) !==
      binding.quarantinedRecordCount ||
    binding.collectionBindings.reduce((total, admitted) => total + admitted.recordCount, 0) !== binding.recordCount
  ) {
    throw new Error("The admitted federated source, quarantine and searchable counts disagree.");
  }
  return Object.freeze(binding) as FederatedSearchBinding;
}

async function validateManifest(value: unknown, expectedBinding: FederatedSearchBinding): Promise<ValidatedManifest> {
  const binding = validateFederatedSearchBinding(expectedBinding);
  const root = plainObject(value, ROOT_KEYS, [...ROOT_KEYS], "Federated search manifest");
  if (root.schema !== "govuk-webmcp.federated-search.v1") throw new Error("The federated search manifest schema is unsupported.");
  if (root.evidenceTier !== "federated-source-snapshot") throw new Error("The federated search evidence tier is unsupported.");
  if (root.projectionProfile !== "govuk-webmcp.federated-record-inheritance.v1") {
    throw new Error("The federated record inheritance profile is unsupported.");
  }
  if (!isRfc3339DateTime(root.generatedAt)) throw new Error("The federated search generation date is not RFC 3339.");
  const sourceLockSha256 = digest(root.sourceLockSha256, "Federated source-lock byte digest");
  const sourceLockDigest = digest(root.sourceLockDigest, "Federated source-lock semantic digest");
  if (sourceLockSha256 !== binding.sourceLockSha256 || sourceLockDigest !== binding.sourceLockDigest) {
    throw new Error("The federated search manifest is not bound to the separately admitted source lock.");
  }
  if (
    root.sourceRecordCount !== binding.sourceRecordCount ||
    root.quarantinedRecordCount !== binding.quarantinedRecordCount ||
    root.recordCount !== binding.recordCount || root.collectionCount !== 4 || root.recordShardSize !== 500
  ) {
    throw new Error("The federated search counts or fixed record-shard size have drifted.");
  }
  if (root.tokenisation !== "nfkd-lowercase-ascii-alphanumeric-v1") {
    throw new Error("The federated search tokenisation profile is unsupported.");
  }
  const weights = plainObject(root.weights, WEIGHT_KEYS, [...WEIGHT_KEYS], "Federated search weights");
  for (const [field, expected] of Object.entries(WEIGHTS)) {
    if (weights[field] !== expected) throw new Error("The federated relevance weights have drifted.");
  }
  const rawCollections = dataArray(root.collections, "Federated search collections", 4, 4);
  const paths = new Set<string>();
  let referenceCount = 0;
  const collections: ValidatedCollection[] = [];
  for (const [index, rawCollection] of rawCollections.entries()) {
    const expected = EXPECTED_COLLECTIONS[index]!;
    const admitted = binding.collectionBindings[index]!;
    const object = plainObject(
      rawCollection,
      COLLECTION_KEYS,
      [...COLLECTION_KEYS].filter((key) => key !== "serviceFamilies"),
      `Federated collection ${index}`,
    );
    if (
      object.id !== admitted.collectionId || object.sourceRecordCount !== admitted.sourceRecordCount ||
      object.quarantinedRecordCount !== admitted.quarantinedRecordCount || object.recordCount !== admitted.recordCount
    ) {
      throw new Error(`${expected.id} lazy collection does not match its admitted collection population binding.`);
    }
    if (object.id !== expected.id || object.title !== expected.title ||
        object.sourceRecordCount !== expected.sourceRecordCount ||
        object.quarantinedRecordCount !== expected.quarantinedRecordCount ||
        object.recordCount !== expected.recordCount ||
        Number(object.sourceRecordCount) !== Number(object.recordCount) + Number(object.quarantinedRecordCount) ||
        object.firstOrdinal !== expected.firstOrdinal || object.lastOrdinal !== expected.lastOrdinal ||
        object.snapshot !== expected.snapshot || object.revision !== expected.revision || !COMMIT.test(expected.revision)) {
      throw new Error(`${expected.id} identity, count or ordinal range has drifted from the admitted source snapshot.`);
    }
    if (expected.serviceFamilies === undefined) {
      if (object.serviceFamilies !== undefined) throw new Error(`${expected.id} contains an unsupported service-family count.`);
    } else if (object.serviceFamilies !== expected.serviceFamilies) {
      throw new Error(`${expected.id} service-family count has drifted.`);
    }
    const deploymentId = stringValue(object.deploymentId, `${expected.id} deployment ID`, 3, 160);
    const descriptorUrl = exactHttpsUrl(object.descriptorUrl, expected.descriptorUrl, `${expected.id} descriptor URL`);
    if (object.extractionMethod !== "deterministic projection from a checksum-bound published OKF source snapshot") {
      throw new Error(`${expected.id} extraction method is unsupported.`);
    }
    const limitations = stringArray(object.limitations, `${expected.id} limitations`, 1, 12, 500);
    if (expected.id === "ons" && !limitations.some((item) => /revision does not by itself reproduce the ignored generated Pages bundle/iu.test(item))) {
      throw new Error("ons must retain its generated Pages reproducibility limitation.");
    }
    const rawRecordReferences = dataArray(
      object.recordShards,
      `${expected.id} record references`,
      Math.ceil(expected.recordCount / 500),
      Math.ceil(expected.recordCount / 500),
    );
    const recordShards: RecordShardReference[] = [];
    let nextOrdinal = expected.firstOrdinal;
    for (const [part, rawReference] of rawRecordReferences.entries()) {
      const reference = validateRecordReference(rawReference, expected, part, nextOrdinal);
      if (part < rawRecordReferences.length - 1 && reference.recordCount !== 500) {
        throw new Error(`${expected.id} has a non-terminal short record shard.`);
      }
      nextOrdinal = reference.lastOrdinal + 1;
      if (paths.has(reference.path)) throw new Error("The federated manifest contains a duplicate shard path.");
      paths.add(reference.path);
      recordShards.push(reference);
      referenceCount += 1;
    }
    if (nextOrdinal !== expected.lastOrdinal + 1) throw new Error(`${expected.id} record shards do not cover its exact ordinal range.`);

    const postingsObject = plainObject(object.postings, new Set(Reflect.ownKeys(object.postings as object).filter(
      (key): key is string => typeof key === "string")), [], `${expected.id} postings map`);
    const prefixes = Object.keys(postingsObject);
    if (prefixes.length < 1 || prefixes.length > 1_333 || prefixes.some((prefix) =>
      !/^(?:_|[a-z0-9]{1,2})$/u.test(prefix))) {
      throw new Error(`${expected.id} postings prefixes are invalid.`);
    }
    const postings = new Map<string, readonly PostingsShardReference[]>();
    for (const prefix of [...prefixes].sort((left, right) => left.localeCompare(right, "en-GB"))) {
      const rawReferences = dataArray(
        postingsObject[prefix],
        `${expected.id} ${prefix} postings references`,
        1,
        FEDERATED_SEARCH_LIMITS.maximumPostingsReferencesPerPrefix,
      );
      const references = rawReferences.map((reference, part) =>
        validatePostingsReference(reference, expected, prefix, part));
      for (const reference of references) {
        if (paths.has(reference.path)) throw new Error("The federated manifest contains a duplicate shard path.");
        paths.add(reference.path);
        referenceCount += 1;
      }
      postings.set(prefix, Object.freeze(references));
    }
    const collectionDigest = digest(object.collectionDigest, `${expected.id} collection digest`);
    if (collectionDigest !== await sha256Hex(canonicalJson(withoutField(object, "collectionDigest")))) {
      throw new Error(`${expected.id} collection digest does not match its metadata.`);
    }
    const metadata: FederatedCollectionMetadata = {
      id: expected.id,
      title: expected.title,
      sourceRecordCount: expected.sourceRecordCount,
      quarantinedRecordCount: expected.quarantinedRecordCount,
      recordCount: expected.recordCount,
      firstOrdinal: expected.firstOrdinal,
      lastOrdinal: expected.lastOrdinal,
      ...(expected.serviceFamilies === undefined ? {} : { serviceFamilies: expected.serviceFamilies }),
      snapshot: expected.snapshot,
      revision: expected.revision,
      deploymentId,
      descriptorUrl,
      extractionMethod: object.extractionMethod,
      limitations,
      collectionDigest,
    };
    collections.push(Object.freeze({
      metadata: deepFreeze(metadata),
      recordShards: Object.freeze(recordShards),
      postings,
    }));
    validateWorstPermittedAccess(expected.id, recordShards, postings);
  }
  if (referenceCount > FEDERATED_SEARCH_LIMITS.maximumReferences) {
    throw new Error("The federated manifest exceeds its fixed shard-reference budget.");
  }
  const manifestDigest = digest(root.manifestDigest, "Federated search manifest digest");
  if (manifestDigest !== await sha256Hex(canonicalJson(withoutField(root, "manifestDigest")))) {
    throw new Error("The federated search manifest digest does not match its content.");
  }
  return Object.freeze({
    generatedAt: root.generatedAt as string,
    sourceLockSha256,
    sourceLockDigest,
    manifestDigest,
    sourceRecordCount: 58_655,
    quarantinedRecordCount: 3,
    recordCount: 58_652,
    collections: Object.freeze(collections),
  });
}

function parseSearchInput(value: unknown): {
  readonly query: string;
  readonly tokens: readonly string[];
  readonly collections: readonly OkfFederatedCollectionId[];
  readonly limit: number;
} {
  const object = plainObject(value, SEARCH_INPUT_KEYS, ["query"], "Federated search input");
  const rawQuery = stringValue(
    object.query,
    "query",
    1,
    FEDERATED_SEARCH_LIMITS.maximumQueryCharacters,
  );
  const query = rawQuery.trim().replace(/\s+/gu, " ");
  if (!query || query.length > FEDERATED_SEARCH_LIMITS.maximumQueryCharacters) throw new Error("query is empty after normalisation.");
  const tokens = tokeniseQuery(query);
  let collections: OkfFederatedCollectionId[];
  if (object.collections === undefined) {
    collections = [...OKF_FEDERATED_COLLECTION_IDS];
  } else {
    const rawCollections = dataArray(object.collections, "collections", 1, 4);
    collections = rawCollections.map((item) => {
      if (typeof item !== "string" || !OKF_FEDERATED_COLLECTION_IDS.includes(item as OkfFederatedCollectionId)) {
        if (typeof item === "string" && item.includes("legislation")) throw new Error("Legislation is excluded from this federation.");
        throw new Error("collections contains an unsupported collection.");
      }
      return item as OkfFederatedCollectionId;
    });
    if (new Set(collections).size !== collections.length) throw new Error("collections must not contain duplicates.");
    collections.sort((left, right) => OKF_FEDERATED_COLLECTION_IDS.indexOf(left) - OKF_FEDERATED_COLLECTION_IDS.indexOf(right));
  }
  const limit = object.limit === undefined
    ? 8
    : integer(object.limit, "limit", 1, FEDERATED_SEARCH_LIMITS.maximumResults);
  return { query, tokens, collections, limit };
}

function parseRecordInput(value: unknown): { readonly recordId: string; readonly collectionId: OkfFederatedCollectionId; readonly ordinal: number } {
  const object = plainObject(value, RECORD_INPUT_KEYS, ["recordId"], "Federated record input");
  const recordId = stringValue(object.recordId, "recordId", 1, 160);
  const match = RECORD_ID.exec(recordId);
  if (!match) throw new Error("recordId is not a canonical federated record identifier.");
  const collectionId = match[1] as OkfFederatedCollectionId;
  const ordinal = Number(match[2]);
  const expected = EXPECTED_COLLECTIONS[OKF_FEDERATED_COLLECTION_IDS.indexOf(collectionId)]!;
  if (ordinal < expected.firstOrdinal || ordinal > expected.lastOrdinal ||
      recordId !== `govuk-discovery:federated:${collectionId}:${String(ordinal)}`) {
    throw new Error("recordId is outside its collection range or is not canonical decimal form.");
  }
  return { recordId, collectionId, ordinal };
}

function errorResult(code: string, message: string, details: JsonObject = {}): FederatedErrorResult {
  return {
    schema: "govuk-webmcp.federated-error.v1",
    ok: false,
    error: { code, message, details },
    limitations: [
      "No substitute source was selected.",
      "No official API, external provider or personal context was contacted.",
    ],
  };
}

function findRecordReference(collection: ValidatedCollection, ordinal: number): RecordShardReference {
  const index = Math.floor((ordinal - collection.metadata.firstOrdinal) / 500);
  const reference = collection.recordShards[index];
  if (!reference || ordinal < reference.firstOrdinal || ordinal > reference.lastOrdinal) {
    throw new Error("The requested ordinal has no exact record-shard reference.");
  }
  return reference;
}

function matchedFields(mask: number): string[] {
  return MATCH_FIELDS.filter(([bit]) => (mask & bit) !== 0).map(([, field]) => field);
}

class OperationBudget {
  readonly startedAt = performance.now();
  files = 0;
  bytes = 0;
  readonly perCollection = new Map<OkfFederatedCollectionId, { files: number; bytes: number }>();

  constructor(readonly signal: AbortSignal | undefined) {}

  checkTime(): void {
    if (this.signal?.aborted) {
      if (typeof this.signal.throwIfAborted === "function") this.signal.throwIfAborted();
      throw this.signal.reason ?? new DOMException("The operation was cancelled.", "AbortError");
    }
    if (performance.now() - this.startedAt > FEDERATED_SEARCH_LIMITS.maximumOperationMilliseconds) {
      throw new Error("The fixed federated search time budget was exceeded.");
    }
  }

  admit(id: OkfFederatedCollectionId, bytes: number): void {
    this.checkTime();
    if (this.files + 1 > FEDERATED_SEARCH_LIMITS.maximumFetchFilesPerOperation ||
        this.bytes + bytes > FEDERATED_SEARCH_LIMITS.maximumFetchBytesPerOperation) {
      throw new Error("The fixed federated search fetch budget was exceeded.");
    }
    this.files += 1;
    this.bytes += bytes;
    const current = this.perCollection.get(id) ?? { files: 0, bytes: 0 };
    current.files += 1;
    current.bytes += bytes;
    this.perCollection.set(id, current);
  }

  usage(id: OkfFederatedCollectionId): { files: number; bytes: number } {
    return this.perCollection.get(id) ?? { files: 0, bytes: 0 };
  }
}

function isCallerAbort(error: unknown, signal: AbortSignal | undefined): boolean {
  return Boolean(signal?.aborted) && (error === signal?.reason || (error instanceof DOMException && error.name === "AbortError"));
}

class FederatedRuntimeBusyError extends Error {
  constructor(message = "The bounded federated runtime already has its maximum queued operations.") {
    super(message);
    this.name = "FederatedRuntimeBusyError";
  }
}

class FederatedPhysicalFetchSchedulingError extends FederatedRuntimeBusyError {
  constructor() {
    super("The bounded federated runtime could not start the physical shard fetch before its fixed file deadline.");
    this.name = "FederatedPhysicalFetchSchedulingError";
  }
}

function fileTimeoutError(): DOMException {
  return new DOMException("The shard fetch timed out.", "TimeoutError");
}

function copyBytes(value: Uint8Array | ArrayBuffer): Uint8Array {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  throw new Error("The same-origin loader returned an unsupported byte container.");
}

function canonicalRecordId(collectionId: OkfFederatedCollectionId, ordinal: number): string {
  return `govuk-discovery:federated:${collectionId}:${String(ordinal)}`;
}

async function validateRecord(
  value: unknown,
  collection: ValidatedCollection,
  ordinal: number,
  observedAt: string,
): Promise<FederatedRecord> {
  const label = `${collection.metadata.id} federated record ${ordinal}`;
  const object = plainObject(value, RECORD_KEYS, [...RECORD_KEYS], label);
  if (object.ordinal !== ordinal) throw new Error(`${label} ordinal is invalid.`);
  const sourceNativeId = stringValue(object.sourceNativeId, `${label} source-native ID`, 1, 500);
  const title = stringValue(object.title, `${label} title`, 1, 300);
  const description = stringValue(object.description, `${label} description`, 1, 1_200);
  const resourceType = exactEnum(object.resourceType, RESOURCE_TYPES, `${label} resource type`);
  const publisher = stringValue(object.publisher, `${label} publisher`, 1, 200);
  const topics = stringArray(object.topics, `${label} topics`, 0, 20, 100);
  const link = plainObject(object.authoritativeLink, AUTHORITY_LINK_KEYS, [...AUTHORITY_LINK_KEYS], `${label} authority link`);
  const linkRole = exactEnum(link.role, AUTHORITY_LINK_ROLES, `${label} authority-link role`);
  const linkUrl = optionalHttpsUrl(link.url, `${label} authority-link URL`);
  stringValue(link.label, `${label} authority-link label`, 1, 200);
  if ((linkRole === "no-direct-authority-link") !== (linkUrl === null)) {
    throw new Error(`${label} authority-link role and URL disagree.`);
  }
  const documentationUrl = optionalHttpsUrl(object.documentationUrl, `${label} documentation URL`);
  const licence = plainObject(object.licence, LICENCE_KEYS, [...LICENCE_KEYS], `${label} licence`);
  exactEnum(licence.status, LICENCE_STATUSES, `${label} licence status`);
  if (licence.title !== null) stringValue(licence.title, `${label} licence title`, 1, 300);
  optionalHttpsUrl(licence.url, `${label} licence URL`);
  const access = plainObject(object.access, ACCESS_KEYS, [...ACCESS_KEYS], `${label} access`);
  exactEnum(access.status, ACCESS_STATUSES, `${label} access status`);
  stringValue(access.note, `${label} access note`, 1, 1_000);
  const assertionStatus = exactEnum(object.assertionStatus, ASSERTION_STATUSES, `${label} assertion status`);
  const sourcePath = stringValue(object.sourcePath, `${label} source path`, 1, 240);
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(sourcePath) ||
      sourcePath.includes("..") || sourcePath.includes("%") || sourcePath.includes("//")) {
    throw new Error(`${label} source path is unsafe.`);
  }
  const sourceSha256 = digest(object.sourceSha256, `${label} source digest`);
  const itemLimitations = stringArray(object.limitations, `${label} item limitations`, 0, 12, 500);
  const recordDigest = digest(object.recordDigest, `${label} record digest`);
  if (recordDigest !== await sha256Hex(canonicalJson(withoutField(object, "recordDigest")))) {
    throw new Error(`${label} record digest does not match its content.`);
  }
  const record: FederatedRecord = {
    id: canonicalRecordId(collection.metadata.id, ordinal),
    ordinal,
    evidenceTier: "federated-source-snapshot",
    collectionId: collection.metadata.id,
    sourceNativeId,
    sourceNativeIdSha256: await sha256Hex(sourceNativeId),
    title,
    description,
    resourceType,
    publisher,
    topics,
    authoritativeLink: link,
    documentationUrl,
    licence,
    access,
    assertionStatus,
    observedAt,
    snapshot: collection.metadata.snapshot,
    revision: collection.metadata.revision,
    deploymentId: collection.metadata.deploymentId,
    sourcePath,
    sourceSha256,
    extractionMethod: collection.metadata.extractionMethod,
    limitations: [...new Set([...itemLimitations, ...collection.metadata.limitations])],
    recordDigest,
  };
  return deepFreeze(record);
}

function summary(candidate: LoadedCandidate, generatedAt: string): JsonObject {
  const { record, collection, localRank, score, mask } = candidate;
  const link = record.authoritativeLink;
  const licence = record.licence;
  const access = record.access;
  return {
    recordId: record.id,
    evidenceTier: "federated-source-snapshot",
    collectionId: collection.metadata.id,
    collectionTitle: collection.metadata.title,
    sourceNativeId: record.sourceNativeId,
    sourceNativeIdSha256: record.sourceNativeIdSha256,
    title: record.title,
    description: record.description,
    resourceType: record.resourceType,
    publisher: record.publisher,
    accessStatus: access.status,
    accessNote: access.note,
    licenceStatus: licence.status,
    ...(licence.title === null ? {} : { licenceTitle: licence.title }),
    lastObserved: record.observedAt,
    assertionStatuses: [record.assertionStatus],
    ...(link.url === null ? {} : { canonicalHumanUrl: link.url }),
    ...(record.documentationUrl === null ? {} : { documentationUrl: record.documentationUrl }),
    snapshot: collection.metadata.snapshot,
    revision: collection.metadata.revision,
    deploymentId: collection.metadata.deploymentId,
    integrityBasis: "snapshot-file-integrity",
    linkRole: link.role,
    recordDigest: record.recordDigest,
    limitations: record.limitations,
    match: {
      localRank,
      score,
      matchedFields: matchedFields(mask),
      explanation: "Source-local lexical relevance; this is not a trust score.",
    },
  };
}

function presentedRecord(record: FederatedRecord, collection: ValidatedCollection, generatedAt: string): JsonObject {
  const link = record.authoritativeLink;
  return {
    ...record,
    collectionTitle: collection.metadata.title,
    canonicalHumanUrl: link.url,
    linkRole: link.role,
    sourceAuthority: "Not independently established",
    dates: { observed: record.observedAt },
    assertions: [{
      field: "record",
      status: record.assertionStatus,
      evidenceUrls: link.url === null ? [] : [link.url],
      note: "Federated source-snapshot status; this record has not received item-level review.",
    }],
  };
}

function federatedRecordResult(
  resolved: ResolvedFederatedRecord,
  manifest: ValidatedManifest,
): FederatedRecordResult {
  const { collection, reference, record } = resolved;
  return deepFreeze({
    schema: "govuk-webmcp.federated-resource-record-result.v1",
    ok: true,
    evidenceTier: "federated-source-snapshot",
    verificationStatus: "snapshot-file-integrity",
    record: presentedRecord(record, collection, manifest.generatedAt),
    relatedRecords: [],
    integrity: {
      manifestDigest: manifest.manifestDigest,
      sourceLockDigest: manifest.sourceLockDigest,
      recordShard: { path: reference.path, bytes: reference.bytes, sha256: reference.sha256 },
      recordDigest: record.recordDigest,
      recordDigestScope: "Closed stored item-specific record excluding recordDigest; shard, collection and manifest digests bind inherited fields.",
    },
    boundaries: {
      pageScoped: true,
      readOnly: true,
      officialApiCall: false,
      accessAuthorityGranted: false,
      itemLevelReview: false,
      evidenceReceiptAvailable: false,
      sourceDerivedContentIsUntrusted: true,
    },
  });
}

function federatedProvenanceResult(
  resolved: ResolvedFederatedRecord,
  manifest: ValidatedManifest,
): FederatedProvenanceResult {
  const { collection, record } = resolved;
  return deepFreeze({
    schema: "govuk-webmcp.federated-provenance-result.v1",
    ok: true,
    evidenceTier: "federated-source-snapshot",
    recordId: record.id,
    status: "federated-source-linked",
    observationDate: record.observedAt,
    sourceLock: manifest.sourceLockDigest,
    sourceDigest: record.sourceSha256,
    recordDigest: record.recordDigest,
    bundleDigest: manifest.manifestDigest,
    snapshot: collection.metadata.snapshot,
    revision: collection.metadata.revision,
    sourcePath: record.sourcePath,
    sourceFileDigest: record.sourceSha256,
    evidenceReceiptAvailable: false,
    collection: {
      id: collection.metadata.id,
      title: collection.metadata.title,
      descriptorUrl: collection.metadata.descriptorUrl,
      snapshot: collection.metadata.snapshot,
      revision: collection.metadata.revision,
      deploymentId: collection.metadata.deploymentId,
      sourceNativeId: record.sourceNativeId,
      sourceNativeIdSha256: record.sourceNativeIdSha256,
    },
    authoritativeLink: record.authoritativeLink,
    fieldAssertions: [{
      field: "record",
      status: record.assertionStatus,
      note: "Producer-derived source-snapshot assertion; no item-level evidence receipt is claimed.",
    }],
    limitations: record.limitations,
    boundaries: {
      sameOriginSnapshotVerified: true,
      sourceWasNotRefetchedAtRuntime: true,
      itemLevelReview: false,
      evidenceReceiptAvailable: false,
      cryptographicSignatureVerified: false,
      accessAuthorityGranted: false,
      sourceDerivedContentIsUntrusted: true,
    },
  });
}

/**
 * A validated lazy runtime. Construct it with `createFederatedSearchRuntime` so
 * the manifest checksum and all semantic locks are checked first.
 */
export class FederatedSearchRuntime {
  readonly manifestDigest: string;
  readonly sourceLockDigest: string;
  readonly sourceRecordCount: number;
  readonly quarantinedRecordCount: number;
  readonly recordCount: number;
  readonly collectionIds: readonly OkfFederatedCollectionId[];
  readonly collections: readonly FederatedCollectionMetadata[];

  private readonly collectionById: ReadonlyMap<OkfFederatedCollectionId, ValidatedCollection>;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, InFlightFile>();
  private readonly operationWaiters: OperationWaiter[] = [];
  private readonly physicalFetchWaiters: PhysicalFetchWaiter[] = [];
  private cacheBytes = 0;
  private activeOperations = 0;
  private activePhysicalFetches = 0;

  private constructor(
    private readonly manifest: ValidatedManifest,
    private readonly loader: FederatedSearchLoader,
  ) {
    this.manifestDigest = manifest.manifestDigest;
    this.sourceLockDigest = manifest.sourceLockDigest;
    this.sourceRecordCount = manifest.sourceRecordCount;
    this.quarantinedRecordCount = manifest.quarantinedRecordCount;
    this.recordCount = manifest.recordCount;
    this.collectionIds = Object.freeze(manifest.collections.map(({ metadata }) => metadata.id));
    this.collections = Object.freeze(manifest.collections.map(({ metadata }) => metadata));
    this.collectionById = new Map(manifest.collections.map((collection) => [collection.metadata.id, collection]));
    Object.freeze(this.collectionById);
  }

  static async create(
    rawManifest: string,
    rawManifestChecksum: string,
    loader: FederatedSearchLoader,
    expectedBinding: FederatedSearchBinding,
  ): Promise<FederatedSearchRuntime> {
    if (typeof loader !== "function") throw new Error("A same-origin byte loader is required.");
    if (typeof rawManifest !== "string") throw new Error("The federated search manifest must be text.");
    const manifestBytes = new TextEncoder().encode(rawManifest);
    if (manifestBytes.byteLength < 2 || manifestBytes.byteLength > FEDERATED_SEARCH_LIMITS.maximumManifestBytes) {
      throw new Error("The federated search manifest exceeds its fixed byte budget.");
    }
    if (parseChecksum(rawManifestChecksum, "manifest.json") !== await sha256Bytes(manifestBytes)) {
      throw new Error("The federated search manifest checksum does not match the same-origin bytes.");
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(rawManifest);
    } catch {
      throw new Error("The federated search manifest is not valid JSON.");
    }
    return new FederatedSearchRuntime(await validateManifest(decoded, expectedBinding), loader);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheBytes = 0;
  }

  private cacheGet(path: string): unknown | undefined {
    const existing = this.cache.get(path);
    if (!existing) return undefined;
    this.cache.delete(path);
    this.cache.set(path, existing);
    return existing.value;
  }

  private cachePut(path: string, value: unknown, bytes: number): void {
    const previous = this.cache.get(path);
    if (previous) {
      this.cacheBytes -= previous.bytes;
      this.cache.delete(path);
    }
    this.cache.set(path, { value, bytes });
    this.cacheBytes += bytes;
    while (this.cache.size > FEDERATED_SEARCH_LIMITS.maximumCacheFiles ||
           this.cacheBytes > FEDERATED_SEARCH_LIMITS.maximumCacheBytes) {
      const oldest = this.cache.entries().next().value as [string, CacheEntry] | undefined;
      if (!oldest) break;
      this.cache.delete(oldest[0]);
      this.cacheBytes -= oldest[1].bytes;
    }
  }

  private operationRelease(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.activeOperations -= 1;
      while (this.operationWaiters.length) {
        const waiter = this.operationWaiters.shift()!;
        waiter.signal?.removeEventListener("abort", waiter.onAbort);
        if (waiter.signal?.aborted) {
          waiter.reject(waiter.signal.reason ?? new DOMException("The operation was cancelled.", "AbortError"));
          continue;
        }
        this.activeOperations += 1;
        waiter.resolve(this.operationRelease());
        break;
      }
    };
  }

  private async acquireOperation(signal: AbortSignal | undefined): Promise<() => void> {
    if (signal?.aborted) {
      if (typeof signal.throwIfAborted === "function") signal.throwIfAborted();
      throw signal.reason ?? new DOMException("The operation was cancelled.", "AbortError");
    }
    if (this.activeOperations < FEDERATED_SEARCH_LIMITS.maximumConcurrentOperations) {
      this.activeOperations += 1;
      return this.operationRelease();
    }
    if (this.operationWaiters.length >= FEDERATED_SEARCH_LIMITS.maximumQueuedOperations) {
      throw new FederatedRuntimeBusyError();
    }
    return new Promise<() => void>((resolve, reject) => {
      const waiter = {} as OperationWaiter;
      const onAbort = (): void => {
        const index = this.operationWaiters.indexOf(waiter);
        if (index >= 0) this.operationWaiters.splice(index, 1);
        signal?.removeEventListener("abort", onAbort);
        reject(signal?.reason ?? new DOMException("The operation was cancelled.", "AbortError"));
      };
      Object.assign(waiter, { signal, resolve, reject, onAbort });
      signal?.addEventListener("abort", onAbort, { once: true });
      this.operationWaiters.push(waiter);
    });
  }

  private physicalFetchRelease(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.activePhysicalFetches -= 1;
      while (this.physicalFetchWaiters.length) {
        const waiter = this.physicalFetchWaiters.shift()!;
        clearTimeout(waiter.timeout);
        if (performance.now() >= waiter.deadline) {
          waiter.reject(new FederatedPhysicalFetchSchedulingError());
          continue;
        }
        this.activePhysicalFetches += 1;
        waiter.resolve(this.physicalFetchRelease());
        break;
      }
    };
  }

  private async acquirePhysicalFetch(deadline: number): Promise<() => void> {
    if (performance.now() >= deadline) throw new FederatedPhysicalFetchSchedulingError();
    if (this.activePhysicalFetches < FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches) {
      this.activePhysicalFetches += 1;
      return this.physicalFetchRelease();
    }
    if (this.physicalFetchWaiters.length >= FEDERATED_SEARCH_LIMITS.maximumQueuedPhysicalFetches) {
      throw new FederatedRuntimeBusyError(
        "The bounded federated runtime already has its maximum queued physical shard fetches.",
      );
    }
    return new Promise<() => void>((resolve, reject) => {
      const waiter = {} as PhysicalFetchWaiter;
      const timeout = setTimeout(() => {
        const index = this.physicalFetchWaiters.indexOf(waiter);
        if (index < 0) return;
        this.physicalFetchWaiters.splice(index, 1);
        reject(new FederatedPhysicalFetchSchedulingError());
      }, Math.max(1, deadline - performance.now()));
      Object.assign(waiter, { deadline, resolve, reject, timeout });
      this.physicalFetchWaiters.push(waiter);
    });
  }

  private fetchAndValidateJson(
    reference: { readonly path: FederatedSearchPath; readonly bytes: number; readonly sha256: string },
  ): InFlightFile {
    const deadline = performance.now() + FEDERATED_SEARCH_LIMITS.maximumFileMilliseconds;
    let resolveResult!: (value: unknown) => void;
    let rejectResult!: (reason?: unknown) => void;
    const result = new Promise<unknown>((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = reject;
    });
    const settled = (async (): Promise<void> => {
      let releasePhysicalFetch: (() => void) | undefined;
      try {
        releasePhysicalFetch = await this.acquirePhysicalFetch(deadline);
        if (performance.now() >= deadline) throw new FederatedPhysicalFetchSchedulingError();
        await this.fetchAndValidateJsonWithinSlot(
          reference,
          deadline,
          resolveResult,
          rejectResult,
        );
      } catch (error) {
        rejectResult(error);
      } finally {
        releasePhysicalFetch?.();
      }
    })();
    return Object.freeze({ result, settled });
  }

  private async fetchAndValidateJsonWithinSlot(
    reference: { readonly path: FederatedSearchPath; readonly bytes: number; readonly sha256: string },
    deadline: number,
    resolveResult: (value: unknown) => void,
    rejectResult: (reason?: unknown) => void,
  ): Promise<void> {
    const controller = new AbortController();
    const expire = (): void => {
      const error = fileTimeoutError();
      controller.abort(error);
      rejectResult(error);
    };
    const timeout = setTimeout(expire, Math.max(1, deadline - performance.now()));
    let loaded: Uint8Array | ArrayBuffer;
    try {
      loaded = await this.loader(reference.path, {
        credentials: "omit",
        redirect: "error",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (controller.signal.aborted || performance.now() >= deadline) {
      if (!controller.signal.aborted) rejectResult(fileTimeoutError());
      return;
    }
    const bytes = copyBytes(loaded);
    if (bytes.byteLength !== reference.bytes || await sha256Bytes(bytes) !== reference.sha256) {
      throw new Error("A fetched federated search shard failed its exact byte or checksum lock.");
    }
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("A fetched federated search shard is not valid UTF-8.");
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(text);
    } catch {
      throw new Error("A fetched federated search shard is not valid JSON.");
    }
    const frozen = deepFreeze(decoded);
    this.cachePut(reference.path, frozen, bytes.byteLength);
    resolveResult(frozen);
  }

  private async waitForInFlight(pending: Promise<unknown>, budget: OperationBudget): Promise<unknown> {
    budget.checkTime();
    const remaining = Math.max(
      1,
      FEDERATED_SEARCH_LIMITS.maximumOperationMilliseconds - (performance.now() - budget.startedAt),
    );
    let rejectAbort: ((reason?: unknown) => void) | undefined;
    const abortPromise = new Promise<never>((_resolve, reject) => {
      rejectAbort = reject;
    });
    const onAbort = (): void => rejectAbort?.(
      budget.signal?.reason ?? new DOMException("The operation was cancelled.", "AbortError"));
    budget.signal?.addEventListener("abort", onAbort, { once: true });
    const timeout = setTimeout(
      () => rejectAbort?.(new DOMException("The federated operation timed out.", "TimeoutError")),
      remaining,
    );
    try {
      const value = await Promise.race([pending, abortPromise]);
      budget.checkTime();
      return value;
    } finally {
      clearTimeout(timeout);
      budget.signal?.removeEventListener("abort", onAbort);
    }
  }

  private async loadJson(
    collectionId: OkfFederatedCollectionId,
    reference: { readonly path: FederatedSearchPath; readonly bytes: number; readonly sha256: string },
    budget: OperationBudget,
  ): Promise<unknown> {
    budget.checkTime();
    budget.admit(collectionId, reference.bytes);
    const cached = this.cacheGet(reference.path);
    if (cached !== undefined) return cached;
    let pending = this.inFlight.get(reference.path);
    if (!pending) {
      if (this.inFlight.size >= FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles) {
        throw new FederatedRuntimeBusyError(
          "The bounded federated runtime already has its maximum distinct in-flight shard files.",
        );
      }
      pending = this.fetchAndValidateJson(reference);
      this.inFlight.set(reference.path, pending);
      void pending.settled.then(
        () => {
          if (this.inFlight.get(reference.path) === pending) this.inFlight.delete(reference.path);
        },
        () => {
          if (this.inFlight.get(reference.path) === pending) this.inFlight.delete(reference.path);
        },
      );
    }
    return this.waitForInFlight(pending.result, budget);
  }

  private async postingRows(
    collection: ValidatedCollection,
    tokens: readonly string[],
    budget: OperationBudget,
  ): Promise<Map<number, { score: number; mask: number }>> {
    const byPrefix = new Map<string, string[]>();
    for (const token of tokens) {
      const prefix = prefixFor(token);
      const list = byPrefix.get(prefix) ?? [];
      list.push(token);
      byPrefix.set(prefix, list);
    }
    const rowsByToken = new Map<string, Map<number, { score: number; mask: number }>>();
    for (const token of tokens) rowsByToken.set(token, new Map());
    for (const [prefix, prefixTokens] of byPrefix) {
      const references = collection.postings.get(prefix);
      if (!references) continue;
      for (const reference of references) {
        const value = await this.loadJson(collection.metadata.id, reference, budget);
        const shard = plainObject(value, POSTINGS_SHARD_KEYS, [...POSTINGS_SHARD_KEYS], `${collection.metadata.id} postings shard`);
        if (shard.schema !== "govuk-webmcp.federated-postings-shard.v1" ||
            shard.collectionId !== collection.metadata.id || shard.prefix !== prefix || shard.part !== reference.part) {
          throw new Error(`${collection.metadata.id} postings shard identity is invalid.`);
        }
        const entries = plainObject(
          shard.entries,
          new Set(Reflect.ownKeys(shard.entries as object).filter((key): key is string => typeof key === "string")),
          [],
          `${collection.metadata.id} postings entries`,
        );
        const entryTokens = Object.keys(entries);
        if (entryTokens.length !== reference.tokenCount) {
          throw new Error(`${collection.metadata.id} postings token count is invalid.`);
        }
        let postingCount = 0;
        for (const token of entryTokens) {
          if (token.length < 2 || token.length > 500 || !TOKEN.test(token) || prefixFor(token) !== prefix || STOP_WORDS.has(token)) {
            throw new Error(`${collection.metadata.id} postings contain an invalid token.`);
          }
          const rawRows = dataArray(entries[token], `${collection.metadata.id} ${token} postings`, 1, reference.postingCount);
          postingCount += rawRows.length;
          let previousOrdinal = collection.metadata.firstOrdinal - 1;
          for (const [rowIndex, rawRow] of rawRows.entries()) {
            const row = dataArray(rawRow, `${collection.metadata.id} posting row ${rowIndex}`, 3, 3);
            const ordinal = integer(
              row[0],
              `${collection.metadata.id} posting ordinal`,
              collection.metadata.firstOrdinal,
              collection.metadata.lastOrdinal,
            );
            if (ordinal <= previousOrdinal) throw new Error(`${collection.metadata.id} postings are not strictly ordinal-sorted.`);
            previousOrdinal = ordinal;
            const score = integer(row[1], `${collection.metadata.id} posting score`, 1, 1_000);
            const mask = integer(row[2], `${collection.metadata.id} posting field mask`, 1, 63);
            const selectedRows = rowsByToken.get(token);
            if (selectedRows) {
              if (selectedRows.has(ordinal)) throw new Error(`${collection.metadata.id} postings duplicate an ordinal for one token.`);
              selectedRows.set(ordinal, { score, mask });
            }
          }
        }
        if (postingCount !== reference.postingCount) throw new Error(`${collection.metadata.id} postings count is invalid.`);
      }
    }
    const first = rowsByToken.get(tokens[0]!)!;
    const combined = new Map<number, { score: number; mask: number }>();
    for (const [ordinal, row] of first) combined.set(ordinal, { ...row });
    for (const token of tokens.slice(1)) {
      const rows = rowsByToken.get(token)!;
      for (const [ordinal, candidate] of combined) {
        const next = rows.get(ordinal);
        if (!next) combined.delete(ordinal);
        else {
          candidate.score += next.score;
          candidate.mask |= next.mask;
        }
      }
    }
    return combined;
  }

  private async rankedCandidates(
    collection: ValidatedCollection,
    tokens: readonly string[],
    budget: OperationBudget,
  ): Promise<RankedCandidate[]> {
    const rows = await this.postingRows(collection, tokens, budget);
    return [...rows]
      .sort((left, right) => right[1].score - left[1].score || left[0] - right[0])
      .map(([ordinal, match], index) => ({
        collection,
        ordinal,
        score: match.score,
        mask: match.mask,
        localRank: index + 1,
        reference: findRecordReference(collection, ordinal),
      }));
  }

  private async loadRecordShard(
    collection: ValidatedCollection,
    reference: RecordShardReference,
    budget: OperationBudget,
  ): Promise<ReadonlyMap<number, FederatedRecord>> {
    const value = await this.loadJson(collection.metadata.id, reference, budget);
    const shard = plainObject(value, RECORD_SHARD_KEYS, [...RECORD_SHARD_KEYS], `${collection.metadata.id} record shard`);
    if (shard.schema !== "govuk-webmcp.federated-record-shard.v1" || shard.collectionId !== collection.metadata.id ||
        shard.firstOrdinal !== reference.firstOrdinal || shard.lastOrdinal !== reference.lastOrdinal) {
      throw new Error(`${collection.metadata.id} record shard identity is invalid.`);
    }
    const rawRecords = dataArray(
      shard.records,
      `${collection.metadata.id} record-shard records`,
      reference.recordCount,
      reference.recordCount,
    );
    const records = await Promise.all(rawRecords.map((record, index) =>
      validateRecord(record, collection, reference.firstOrdinal + index, this.manifest.generatedAt)));
    budget.checkTime();
    return new Map(records.map((record) => [record.ordinal, record]));
  }

  async search(
    input: unknown,
    options: { readonly signal?: AbortSignal | undefined } = {},
  ): Promise<FederatedSearchResult | FederatedErrorResult> {
    let request: ReturnType<typeof parseSearchInput>;
    try {
      request = parseSearchInput(input);
    } catch (error) {
      return errorResult("invalid_federated_search_request", error instanceof Error ? error.message : "The search input is invalid.");
    }
    let release: (() => void) | undefined;
    try {
      release = await this.acquireOperation(options.signal);
      return await this.searchValidated(request, options);
    } catch (error) {
      if (isCallerAbort(error, options.signal)) throw error;
      if (error instanceof FederatedRuntimeBusyError) {
        return errorResult("federated_runtime_busy", error.message);
      }
      throw error;
    } finally {
      release?.();
    }
  }

  private async searchValidated(
    request: ReturnType<typeof parseSearchInput>,
    options: { readonly signal?: AbortSignal | undefined },
  ): Promise<FederatedSearchResult> {
    const states: SourceSearchState[] = request.collections.map((collectionId) => {
      const collection = this.collectionById.get(collectionId)!;
      return {
        collection,
        status: "ready",
        totalMatches: 0,
        candidates: [],
        returned: 0,
        verifiedShardFiles: 0,
        verifiedShardBytes: 0,
        budget: new OperationBudget(options.signal),
      } satisfies SourceSearchState;
    });
    await Promise.all(states.map(async (state) => {
      try {
        state.candidates = await this.rankedCandidates(state.collection, request.tokens, state.budget);
        state.totalMatches = state.candidates.length;
      } catch (error) {
        if (isCallerAbort(error, options.signal)) throw error;
        if (error instanceof FederatedRuntimeBusyError) throw error;
        state.status = "unavailable";
        state.candidates = [];
        state.totalMatches = 0;
      } finally {
        const usage = state.budget.usage(state.collection.metadata.id);
        state.verifiedShardFiles = usage.files;
        state.verifiedShardBytes = usage.bytes;
      }
    }));

    const selected: RankedCandidate[] = [];
    const selectedPaths = new Set<string>();
    let shardLimited = false;
    const maximumLocalRank = Math.max(0, ...states.map(({ candidates }) => candidates.length));
    for (let rank = 0; rank < maximumLocalRank && selected.length < request.limit; rank += 1) {
      for (const state of states) {
        const candidate = state.candidates[rank];
        if (!candidate) continue;
        const isNewPath = !selectedPaths.has(candidate.reference.path);
        if (isNewPath && selectedPaths.size >= FEDERATED_SEARCH_LIMITS.maximumResultShards) {
          shardLimited = true;
          continue;
        }
        selected.push(candidate);
        selectedPaths.add(candidate.reference.path);
        if (selected.length >= request.limit) break;
      }
    }
    if (selected.length < request.limit && states.some(({ candidates }) => candidates.length > 0) &&
        selectedPaths.size >= FEDERATED_SEARCH_LIMITS.maximumResultShards) shardLimited = true;

    const loaded = new Map<string, ReadonlyMap<number, FederatedRecord>>();
    const failedCollections = new Set<OkfFederatedCollectionId>();
    const stateById = new Map(states.map((state) => [state.collection.metadata.id, state]));
    const uniqueCandidates = new Map<string, RankedCandidate>();
    for (const candidate of selected) uniqueCandidates.set(candidate.reference.path, candidate);
    await Promise.all([...uniqueCandidates.values()].map(async (candidate) => {
      try {
        loaded.set(
          candidate.reference.path,
          await this.loadRecordShard(
            candidate.collection,
            candidate.reference,
            stateById.get(candidate.collection.metadata.id)!.budget,
          ),
        );
      } catch (error) {
        if (isCallerAbort(error, options.signal)) throw error;
        if (error instanceof FederatedRuntimeBusyError) throw error;
        failedCollections.add(candidate.collection.metadata.id);
      }
    }));
    const hydrated: LoadedCandidate[] = [];
    for (const candidate of selected) {
      if (failedCollections.has(candidate.collection.metadata.id)) continue;
      const record = loaded.get(candidate.reference.path)?.get(candidate.ordinal);
      if (!record) {
        failedCollections.add(candidate.collection.metadata.id);
        continue;
      }
      hydrated.push({ ...candidate, record });
    }
    const finalHydrated = hydrated.filter(({ collection }) => !failedCollections.has(collection.metadata.id));
    for (const state of states) {
      if (failedCollections.has(state.collection.metadata.id)) {
        state.status = "unavailable";
        state.totalMatches = 0;
        state.candidates = [];
      }
      state.returned = finalHydrated.filter(({ collection }) => collection.metadata.id === state.collection.metadata.id).length;
      const usage = state.budget.usage(state.collection.metadata.id);
      state.verifiedShardFiles = usage.files;
      state.verifiedShardBytes = usage.bytes;
    }
    const unavailable = states.some(({ status }) => status === "unavailable");
    const totalMatches = states.reduce((total, state) => total + state.totalMatches, 0);
    const result: FederatedSearchResult = {
      schema: "govuk-webmcp.federated-search-result.v1",
      ok: true,
      query: request.query,
      evidenceTier: "federated-source-snapshot",
      manifestDigest: this.manifest.manifestDigest,
      totalMatches,
      totalRelation: unavailable ? "gte" : "eq",
      returned: finalHydrated.length,
      truncated: unavailable || shardLimited || totalMatches > finalHydrated.length,
      results: finalHydrated.map((candidate) => summary(candidate, this.manifest.generatedAt)),
      collectionStatuses: states.map((state) => ({
        collectionId: state.collection.metadata.id,
        title: state.collection.metadata.title,
        status: state.status,
        totalMatches: state.totalMatches,
        totalRelation: state.status === "ready" ? "eq" : "gte",
        returned: state.returned,
        verifiedShardFiles: state.verifiedShardFiles,
        verifiedShardBytes: state.verifiedShardBytes,
        ...(state.status === "ready" ? {} : {
          limitation: "This checksum-bound collection was unavailable or invalid; results from other ready collections remain usable.",
        }),
      })),
      boundaries: {
        pageScoped: true,
        readOnly: true,
        officialApiCall: false,
        sameOriginStaticReads: true,
        personalContextAccepted: false,
        durableReceiptCreated: false,
        sourceDerivedContentIsUntrusted: true,
        rankingIsTrustAssessment: false,
      },
    };
    return deepFreeze(result);
  }

  private async exactRecordWithinOperation(
    input: unknown,
    options: { readonly signal?: AbortSignal | undefined },
  ): Promise<(ResolvedFederatedRecord & { readonly request: ReturnType<typeof parseRecordInput> }) | FederatedErrorResult> {
    let request: ReturnType<typeof parseRecordInput>;
    try {
      request = parseRecordInput(input);
    } catch (error) {
      return errorResult("invalid_federated_record_request", error instanceof Error ? error.message : "The record input is invalid.");
    }
    const collection = this.collectionById.get(request.collectionId)!;
    const reference = findRecordReference(collection, request.ordinal);
    const budget = new OperationBudget(options.signal);
    try {
      const records = await this.loadRecordShard(collection, reference, budget);
      const record = records.get(request.ordinal);
      if (!record || record.id !== request.recordId) {
        return errorResult("federated_record_not_found", "No exact federated record was found.", { recordId: request.recordId });
      }
      return { request, collection, reference, record };
    } catch (error) {
      if (isCallerAbort(error, options.signal)) throw error;
      if (error instanceof FederatedRuntimeBusyError) throw error;
      return errorResult(
        "federated_record_unavailable",
        "The checksum-bound record shard is unavailable or invalid.",
        { recordId: request.recordId },
      );
    }
  }

  private async exactRecord(
    input: unknown,
    options: { readonly signal?: AbortSignal | undefined },
  ): Promise<(ResolvedFederatedRecord & { readonly request: ReturnType<typeof parseRecordInput> }) | FederatedErrorResult> {
    let release: (() => void) | undefined;
    try {
      release = await this.acquireOperation(options.signal);
      return await this.exactRecordWithinOperation(input, options);
    } catch (error) {
      if (isCallerAbort(error, options.signal)) throw error;
      if (error instanceof FederatedRuntimeBusyError) {
        return errorResult("federated_runtime_busy", error.message);
      }
      throw error;
    } finally {
      release?.();
    }
  }

  /**
   * Visit every checksum-validated stored record once using the same result
   * builders as the public exact-record methods. Intended for deterministic
   * build assurance; it makes no network or provider call beyond the supplied
   * same-origin shard loader.
   */
  async visitValidatedRecords(
    visitor: FederatedRecordVisitor,
    options: { readonly signal?: AbortSignal | undefined } = {},
  ): Promise<number> {
    if (typeof visitor !== "function") throw new TypeError("A federated record visitor is required.");
    let release: (() => void) | undefined;
    let visited = 0;
    try {
      release = await this.acquireOperation(options.signal);
      for (const collection of this.manifest.collections) {
        for (const reference of collection.recordShards) {
          const budget = new OperationBudget(options.signal);
          const records = await this.loadRecordShard(collection, reference, budget);
          const visits: Promise<void>[] = [];
          for (let ordinal = reference.firstOrdinal; ordinal <= reference.lastOrdinal; ordinal += 1) {
            budget.checkTime();
            const record = records.get(ordinal);
            if (!record) throw new Error(`${collection.metadata.id} record shard omitted ordinal ${ordinal}.`);
            const resolved = { collection, reference, record };
            visits.push(Promise.resolve(visitor(
              federatedRecordResult(resolved, this.manifest),
              federatedProvenanceResult(resolved, this.manifest),
            )));
          }
          await Promise.all(visits);
          visited += visits.length;
          budget.checkTime();
        }
      }
      if (visited !== this.manifest.recordCount) {
        throw new Error("The federated visitor did not cover the complete manifest population.");
      }
      return visited;
    } finally {
      release?.();
    }
  }

  async getRecord(
    input: unknown,
    options: { readonly signal?: AbortSignal | undefined } = {},
  ): Promise<FederatedRecordResult | FederatedErrorResult> {
    const resolved = await this.exactRecord(input, options);
    if ("ok" in resolved) return resolved;
    return federatedRecordResult(resolved, this.manifest);
  }

  async showProvenance(
    input: unknown,
    options: { readonly signal?: AbortSignal | undefined } = {},
  ): Promise<FederatedProvenanceResult | FederatedErrorResult> {
    const resolved = await this.exactRecord(input, options);
    if ("ok" in resolved) return resolved;
    return federatedProvenanceResult(resolved, this.manifest);
  }
}

export async function createFederatedSearchRuntime(
  rawManifest: string,
  rawManifestChecksum: string,
  loader: FederatedSearchLoader,
  expectedBinding: FederatedSearchBinding,
): Promise<FederatedSearchRuntime> {
  return FederatedSearchRuntime.create(rawManifest, rawManifestChecksum, loader, expectedBinding);
}
