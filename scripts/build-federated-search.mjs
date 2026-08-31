import { constants } from "node:fs";
import { lstat, mkdir, open, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

import {
  canonicalJson,
  deterministicGzip,
  EXPECTED_FEDERATION_SOURCES,
  FEDERATION_AUTHORED_AT,
  FEDERATION_EVIDENCE_TIER,
  FEDERATION_LOCK_PATH,
  FEDERATION_LOCK_SCHEMA,
  FEDERATION_PROFILE,
  MAX_AGGREGATE_SOURCE_BYTES,
  MAX_AGGREGATE_STORED_BYTES,
  MAX_SOURCE_BYTES,
  safeRelativePath,
  sha256,
} from "./import-okf-federation.mjs";

export const FEDERATED_SEARCH_DIRECTORY = "app/data/federated-search";
export const FEDERATED_SEARCH_MANIFEST_PATH = `${FEDERATED_SEARCH_DIRECTORY}/manifest.json`;
export const FEDERATED_SOURCE_RECORD_COUNT = 58655;
export const FEDERATED_QUARANTINED_RECORD_COUNT = 3;
export const FEDERATED_SEARCHABLE_RECORD_COUNT = 58652;
// Retained for the source-lock contract. Search manifests use the explicit
// source, quarantine and searchable counters above.
export const FEDERATED_RECORD_COUNT = FEDERATED_SOURCE_RECORD_COUNT;
export const RECORDS_PER_SHARD = 500;
export const MAX_RECORD_SHARD_BYTES = 2 * 1024 * 1024;
export const MAX_POSTINGS_SHARD_BYTES = 1024 * 1024;
export const MAX_AGGREGATE_UNIQUE_TOKENS = 200000;
export const MAX_AGGREGATE_POSTINGS = FEDERATED_SEARCHABLE_RECORD_COUNT * 64;
export const MAX_AGGREGATE_GENERATED_BYTES = 192 * 1024 * 1024;

const MAX_DESCRIPTION_LENGTH = 1200;
const MAX_FIELD_LENGTH = 500;
const MAX_TOPICS = 20;
const MAX_LIMITATIONS = 12;
const MAX_TOKENS_PER_RECORD = 64;
const MAX_POSTINGS_FRAGMENT = 5000;
const EXTRACTION_METHOD = "deterministic projection from a checksum-bound published OKF source snapshot";
const SHA256 = /^[a-f0-9]{64}$/u;
const COMMIT = /^[a-f0-9]{40}$/u;
const SOURCE_IDS = Object.freeze(EXPECTED_FEDERATION_SOURCES.map(({ id }) => id));
const SOURCE_BY_ID = new Map(EXPECTED_FEDERATION_SOURCES.map((source) => [source.id, source]));
const HMLR_SEARCHABLE_RECORD_TYPES = new Set([
  "news", "statistics", "guidance", "corporate", "repository", "form", "API", "dataset", "service",
]);
const HMLR_TYPE_FIELDS = Object.freeze(["record_type", "kind", "type", "content_type"]);
const HMLR_CLASSIFICATION_FIELDS = Object.freeze([
  ...HMLR_TYPE_FIELDS, "source_native_type", "source_family", "source_adapter", "service",
]);
const HMLR_PROHIBITED_CLASSIFICATION_PARTS = Object.freeze([
  "addressrecord", "geometryrecord", "ownerrecord", "ownership", "personalrecord", "personrecord",
  "polygonrecord", "proprietor", "propertyrecord", "propertytitle", "registeredowner", "registeredproprietor",
  "titlenumber", "titleplan", "titleregister",
]);
const HMLR_PROHIBITED_FIELD_NAMES = new Set([
  "address", "addresses", "boundary", "coordinates", "easting", "geometry", "latitude", "longitude",
  "northing", "owner", "owners", "ownername", "ownership", "personaldata", "polygon", "polygons", "postcode",
  "postcodes", "pricepaid", "person", "persons", "personname", "proprietor", "proprietors", "proprietorname", "registeredaddress",
  "registeredowner", "registeredproprietor", "tenure", "titlenumber", "titleplan", "titleregister", "uprn",
]);
const HMLR_LEGISLATION_QUARANTINE = new Map([
  ["hmlr-7642b10e17c059b3b30215d2", {
    title: "Land Registration Act 2002",
    url: "https://www.legislation.gov.uk/ukpga/2002/9/contents",
  }],
  ["hmlr-e9880f0f70f3a0ddfe2539a8", {
    title: "Land Registration Rules 2003",
    url: "https://www.legislation.gov.uk/uksi/2003/1417/contents",
  }],
  ["hmlr-c16f457f24573e504b8cc23f", {
    title: "Local Land Charges Act 1975",
    url: "https://www.legislation.gov.uk/ukpga/1975/76/contents",
  }],
]);
const RESOURCE_TYPES = new Set([
  "govuk-content", "dataset", "api", "api-documentation", "catalogue-record", "organisation", "guidance",
]);
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "it",
  "of", "on", "or", "that", "the", "their", "this", "to", "was", "were", "with",
]);
const WEIGHTS = Object.freeze({
  title: 16,
  description: 5,
  publisher: 8,
  topics: 4,
  resourceType: 3,
  sourceNativeId: 2,
});
const MASKS = Object.freeze({
  title: 1,
  description: 2,
  publisher: 4,
  topics: 8,
  resourceType: 16,
  sourceNativeId: 32,
});
const NORMALISED_ASSERTION_VALUES = new Set([
  "normalized", "normalised", "deterministically-normalized", "deterministically-normalised",
  "normalized-frozen-source-metadata", "normalised-frozen-source-metadata",
]);

export function createFederatedBuildBudget(limits = {}) {
  const maximumUniqueTokens = limits.maximumUniqueTokens ?? MAX_AGGREGATE_UNIQUE_TOKENS;
  const maximumPostings = limits.maximumPostings ?? MAX_AGGREGATE_POSTINGS;
  const maximumGeneratedBytes = limits.maximumGeneratedBytes ?? MAX_AGGREGATE_GENERATED_BYTES;
  for (const [label, value] of [
    ["unique-token", maximumUniqueTokens], ["posting", maximumPostings], ["generated-byte", maximumGeneratedBytes],
  ]) {
    if (!Number.isSafeInteger(value) || value < 1) throw new Error(`The ${label} build limit must be a positive safe integer.`);
  }
  return {
    uniqueTokens: 0,
    postings: 0,
    generatedBytes: 0,
    maximumUniqueTokens,
    maximumPostings,
    maximumGeneratedBytes,
  };
}

function chargeIndexWork(budget, { newToken, postings }) {
  if (newToken) budget.uniqueTokens += 1;
  budget.postings += postings;
  if (budget.uniqueTokens > budget.maximumUniqueTokens) {
    throw new Error(`Federated search exceeds the aggregate ${budget.maximumUniqueTokens} unique-token build cap.`);
  }
  if (budget.postings > budget.maximumPostings) {
    throw new Error(`Federated search exceeds the aggregate ${budget.maximumPostings} posting build cap.`);
  }
}

export function chargeFederatedGeneratedBytes(budget, bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) throw new Error("Generated byte accounting is invalid.");
  budget.generatedBytes += bytes;
  if (budget.generatedBytes > budget.maximumGeneratedBytes) {
    throw new Error(`Federated search exceeds the aggregate ${budget.maximumGeneratedBytes}-byte output cap.`);
  }
}

async function readRegularFile(path, label) {
  const initial = await lstat(path);
  if (!initial.isFile() || initial.isSymbolicLink()) throw new Error(`${label} must be a regular non-symlink file.`);
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== initial.dev || opened.ino !== initial.ino) {
      throw new Error(`${label} changed while being read.`);
    }
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

function plainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  return value;
}

function exactKeys(value, keys, label) {
  const object = plainObject(value, label);
  const observed = Object.keys(object).sort();
  const expected = [...keys].sort();
  if (observed.length !== expected.length || observed.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} has an unsupported field set.`);
  }
  return object;
}

function exactArray(value, length, label) {
  if (!Array.isArray(value) || value.length !== length) throw new Error(`${label} must contain exactly ${length} items.`);
  return value;
}

function withoutField(value, field) {
  const copy = structuredClone(value);
  delete copy[field];
  return copy;
}

function sourceIdentity(source) {
  return {
    id: source.id,
    revision: source.revision,
    revisionReproducibility: source.revisionReproducibility,
    snapshot: source.snapshot,
    baseUrl: source.baseUrl,
    descriptor: source.descriptor,
    dataManifest: source.dataManifest,
    searchManifest: source.searchManifest,
    population: source.population,
    recordArtifacts: source.recordArtifacts,
    supportingArtifacts: source.supportingArtifacts,
  };
}

function exactReference(actual, expected, label, search = false) {
  const keys = search ? ["path", "bytes", "sha256", "schema"] : ["path", "bytes", "sha256"];
  const object = exactKeys(actual, keys, label);
  if (
    object.path !== expected.path || object.bytes !== expected.bytes || object.sha256 !== expected.sha256 ||
    (search && object.schema !== expected.schema)
  ) {
    throw new Error(`${label} differs from the reviewed published reference.`);
  }
}

function expectedArtifactPaths(source, role) {
  if (role === "resources") {
    return source.expectedSupportingArtifacts
      ? Array.from({ length: source.expectedSupportingArtifacts }, (_, index) => `large/data/resources-${index}.json`)
      : [];
  }
  if (source.id === "land-registry") {
    return Array.from({ length: 9 }, (_, index) => `data/explorer/datasets-${String(index).padStart(3, "0")}.json`);
  }
  if (source.id === "ons") return Array.from({ length: 11 }, (_, index) => `data/datasets-${index}.json`);
  if (source.id === "government-apis") return Array.from({ length: 42 }, (_, index) => `data/apis-${index}.json`);
  return Array.from({ length: 10 }, (_, index) => `large/data/records-${index}.json`);
}

function validateArtifact(artifact, source, collectionName, index) {
  exactKeys(artifact, [
    "role", "sourcePath", "storedPath", "sourceBytes", "sourceSha256", "storedBytes", "storedSha256",
    "compression", "itemCount",
  ], `${source.id} ${collectionName} artifact ${index}`);
  const expectedRole = collectionName === "recordArtifacts" ? "records" : "resources";
  const paths = expectedArtifactPaths(source, expectedRole);
  if (artifact.role !== expectedRole || artifact.sourcePath !== paths[index]) {
    throw new Error(`${source.id} ${expectedRole} artifact path or role drifted.`);
  }
  const expectedStoredPath = `app/data/sources/okf-federation/${source.id}/${expectedRole}-${String(index).padStart(3, "0")}.json.gz`;
  if (artifact.storedPath !== expectedStoredPath || artifact.compression !== "gzip") {
    throw new Error(`${source.id} stored artifact path or compression drifted.`);
  }
  safeRelativePath(artifact.sourcePath, `${source.id} source path`);
  safeRelativePath(artifact.storedPath, `${source.id} stored path`);
  if (
    !Number.isSafeInteger(artifact.sourceBytes) || artifact.sourceBytes < 2 || artifact.sourceBytes > MAX_SOURCE_BYTES ||
    !Number.isSafeInteger(artifact.storedBytes) || artifact.storedBytes < 2 || artifact.storedBytes > MAX_SOURCE_BYTES ||
    !Number.isSafeInteger(artifact.itemCount) || artifact.itemCount < 0 ||
    !SHA256.test(artifact.sourceSha256) || !SHA256.test(artifact.storedSha256)
  ) {
    throw new Error(`${source.id} artifact byte, count or digest metadata is invalid.`);
  }
  return artifact;
}

function validateLockStructure(lock) {
  const root = exactKeys(lock, [
    "schema", "profile", "evidenceTier", "authoredAt", "aggregate", "sources", "lockDigest",
  ], "Federation lock");
  if (
    root.schema !== FEDERATION_LOCK_SCHEMA || root.profile !== FEDERATION_PROFILE ||
    root.evidenceTier !== FEDERATION_EVIDENCE_TIER || root.authoredAt !== FEDERATION_AUTHORED_AT
  ) {
    throw new Error("Federation lock identity drifted.");
  }
  if (!SHA256.test(root.lockDigest) || root.lockDigest !== sha256(canonicalJson(withoutField(root, "lockDigest")))) {
    throw new Error("Federation lock digest is invalid.");
  }
  const sources = exactArray(root.sources, SOURCE_IDS.length, "Federation sources");
  if (sources.some((source, index) => source?.id !== SOURCE_IDS[index])) {
    throw new Error("Federation sources are not in the exact reviewed order.");
  }

  let artifactCount = 0;
  let decodedArtifactBytes = 0;
  let storedArtifactBytes = 0;
  let recordCount = 0;
  for (const source of sources) {
    const expected = SOURCE_BY_ID.get(source.id);
    exactKeys(source, [
      "id", "title", "repositoryUrl", "baseUrl", "deploymentId", "revision", "revisionReproducibility",
      "snapshot", "descriptor", "dataManifest", "searchManifest", "population", "recordArtifacts",
      "supportingArtifacts", "requestPolicy", "budgets", "rights", "access", "limitations", "boundaries", "entryDigest",
    ], `Federation source ${source.id}`);
    if (
      source.title !== expected.title || source.repositoryUrl !== expected.repositoryUrl || source.baseUrl !== expected.baseUrl ||
      source.deploymentId !== expected.deploymentId || source.revision !== expected.revision || !COMMIT.test(source.revision) ||
      source.revisionReproducibility !== expected.revisionReproducibility || source.snapshot !== expected.snapshot ||
      canonicalJson(source.population) !== canonicalJson(expected.population) ||
      canonicalJson(source.rights) !== canonicalJson(expected.rights) ||
      canonicalJson(source.access) !== canonicalJson(expected.access) ||
      canonicalJson(source.limitations) !== canonicalJson(expected.limitations)
    ) {
      throw new Error(`Federation source ${source.id} differs from its reviewed publication decision.`);
    }
    exactReference(source.descriptor, expected.descriptor, `${source.id} descriptor`);
    exactReference(source.dataManifest, expected.dataManifest, `${source.id} data manifest`);
    exactReference(source.searchManifest, expected.searchManifest, `${source.id} search manifest`, true);
    const recordArtifacts = exactArray(source.recordArtifacts, expected.expectedRecordArtifacts, `${source.id} record artifacts`)
      .map((artifact, index) => validateArtifact(artifact, expected, "recordArtifacts", index));
    const supportingArtifacts = exactArray(
      source.supportingArtifacts,
      expected.expectedSupportingArtifacts,
      `${source.id} supporting artifacts`,
    ).map((artifact, index) => validateArtifact(artifact, expected, "supportingArtifacts", index));
    const artifacts = [...recordArtifacts, ...supportingArtifacts];
    if (recordArtifacts.reduce((total, artifact) => total + artifact.itemCount, 0) !== expected.population.records) {
      throw new Error(`${source.id} record-artifact item counts drifted.`);
    }
    if (supportingArtifacts.reduce((total, artifact) => total + artifact.itemCount, 0) !== (expected.population.resources ?? 0)) {
      throw new Error(`${source.id} supporting-artifact item counts drifted.`);
    }
    exactKeys(source.requestPolicy, ["credentials", "redirect", "sameOriginOnly"], `${source.id} request policy`);
    if (
      source.requestPolicy.credentials !== "omit" || source.requestPolicy.redirect !== "error" ||
      source.requestPolicy.sameOriginOnly !== true
    ) {
      throw new Error(`${source.id} request policy is not fail-closed.`);
    }
    const sourceDecodedBytes = artifacts.reduce((total, artifact) => total + artifact.sourceBytes, 0);
    const sourceStoredBytes = artifacts.reduce((total, artifact) => total + artifact.storedBytes, 0);
    exactKeys(source.budgets, [
      "maximumResourceBytes", "maximumDecodedBytes", "maximumStoredBytes", "maximumArtifacts",
    ], `${source.id} budgets`);
    if (
      source.budgets.maximumResourceBytes !== MAX_SOURCE_BYTES ||
      source.budgets.maximumDecodedBytes !== sourceDecodedBytes ||
      source.budgets.maximumStoredBytes !== sourceStoredBytes ||
      source.budgets.maximumArtifacts !== artifacts.length
    ) {
      throw new Error(`${source.id} byte or artifact budget drifted.`);
    }
    if (canonicalJson(source.boundaries) !== canonicalJson({
      officialApiCalls: false,
      personalContextAccepted: false,
      sourceDerivedContentIsUntrusted: true,
    })) {
      throw new Error(`${source.id} static privacy boundary drifted.`);
    }
    if (!SHA256.test(source.entryDigest) || source.entryDigest !== sha256(canonicalJson(withoutField(source, "entryDigest")))) {
      throw new Error(`${source.id} entry digest is invalid.`);
    }
    artifactCount += artifacts.length;
    decodedArtifactBytes += sourceDecodedBytes;
    storedArtifactBytes += sourceStoredBytes;
    recordCount += expected.population.records;
  }

  const aggregate = exactKeys(root.aggregate, [
    "sourceCount", "recordCount", "artifactCount", "decodedArtifactBytes", "storedArtifactBytes",
    "sourceIdentityDigest", "aggregateDigest",
  ], "Federation aggregate");
  if (
    aggregate.sourceCount !== SOURCE_IDS.length || aggregate.recordCount !== FEDERATED_RECORD_COUNT ||
    aggregate.recordCount !== recordCount || aggregate.artifactCount !== artifactCount ||
    aggregate.decodedArtifactBytes !== decodedArtifactBytes || aggregate.storedArtifactBytes !== storedArtifactBytes ||
    decodedArtifactBytes > MAX_AGGREGATE_SOURCE_BYTES || storedArtifactBytes > MAX_AGGREGATE_STORED_BYTES
  ) {
    throw new Error("Federation aggregate counts or byte budgets drifted.");
  }
  const identityDigest = sha256(canonicalJson(sources.map(sourceIdentity)));
  if (!SHA256.test(aggregate.sourceIdentityDigest) || aggregate.sourceIdentityDigest !== identityDigest) {
    throw new Error("Federation source identity digest is invalid.");
  }
  if (
    !SHA256.test(aggregate.aggregateDigest) ||
    aggregate.aggregateDigest !== sha256(canonicalJson(withoutField(aggregate, "aggregateDigest")))
  ) {
    throw new Error("Federation aggregate digest is invalid.");
  }
  return root;
}

async function loadArtifactRows(artifact, sourceId, rootDir) {
  const stored = await readRegularFile(resolve(rootDir, artifact.storedPath), `${sourceId} stored artifact`);
  if (stored.byteLength !== artifact.storedBytes || sha256(stored) !== artifact.storedSha256) {
    throw new Error(`${sourceId} stored artifact digest mismatch.`);
  }
  let raw;
  try {
    raw = gunzipSync(stored, { maxOutputLength: MAX_SOURCE_BYTES });
  } catch (error) {
    throw new Error(`${sourceId} stored artifact cannot be safely decompressed.`, { cause: error });
  }
  if (raw.byteLength !== artifact.sourceBytes || sha256(raw) !== artifact.sourceSha256) {
    throw new Error(`${sourceId} source artifact digest mismatch.`);
  }
  const deterministic = deterministicGzip(raw);
  if (deterministic.byteLength !== stored.byteLength || !deterministic.equals(stored)) {
    throw new Error(`${sourceId} stored artifact is not the deterministic gzip representation of its locked source bytes.`);
  }
  let value;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw new Error(`${sourceId} source artifact is not valid JSON.`, { cause: error });
  }
  if (!Array.isArray(value) || value.length !== artifact.itemCount) {
    throw new Error(`${sourceId} source artifact item count mismatch.`);
  }
  return value;
}

export async function validateFederationLock(lock, { rootDir = process.cwd(), verifyFiles = true } = {}) {
  const root = validateLockStructure(lock);
  if (verifyFiles) {
    for (const source of root.sources) {
      for (const artifact of [...source.recordArtifacts, ...source.supportingArtifacts]) {
        await loadArtifactRows(artifact, source.id, rootDir);
      }
    }
  }
  return root;
}

function text(value, maximum = MAX_FIELD_LENGTH) {
  if (typeof value === "number" && Number.isFinite(value)) value = String(value);
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/gu, " ").slice(0, maximum);
}

function strings(value, maximum = MAX_TOPICS) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item, 100)).filter(Boolean))].slice(0, maximum);
}

function safeSourceUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.toString() !== value) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sourceNativeId(record) {
  for (const value of [
    record.concept_id, record.canonical_record_id, record.record_id, record.canonical_id, record.identifier,
    record.dataset_id, record.api_id, record["@id"], record.name, record.route, record.id, record.open,
  ]) {
    const candidate = text(value, 500);
    if (candidate) return candidate;
  }
  return "";
}

function compactClassification(value) {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9]+/gu, "") : "";
}

function assertNoHmlrSensitiveFields(value, path = "record") {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) assertNoHmlrSensitiveFields(item, `${path}[${index}]`);
    return;
  }
  if (value === null || typeof value !== "object") return;
  plainObject(value, `HMLR metadata object at ${path}`);
  for (const [key, item] of Object.entries(value)) {
    const compactKey = compactClassification(key);
    if ([...HMLR_PROHIBITED_FIELD_NAMES].some((field) =>
      compactKey === field || compactKey.startsWith(field) || compactKey.endsWith(field))) {
      throw new Error(`Land Registry row contains prohibited sensitive field ${path}.${key}.`);
    }
    assertNoHmlrSensitiveFields(item, `${path}.${key}`);
  }
}

function isLegislationHost(value) {
  const url = safeSourceUrl(value);
  if (url === null) return false;
  const hostname = new URL(url).hostname.replace(/\.+$/u, "").toLowerCase();
  return hostname === "legislation.gov.uk" || hostname.endsWith(".legislation.gov.uk");
}

export function classifyLandRegistryRecord(record) {
  const object = plainObject(record, "Land Registry source record");
  if (object.schema !== "okf-hmlr-record.v2") {
    throw new Error("Land Registry row is outside the admitted metadata schema.");
  }
  const nativeId = sourceNativeId(object);
  const expectedQuarantine = HMLR_LEGISLATION_QUARANTINE.get(nativeId);
  const typeValues = HMLR_TYPE_FIELDS.map((field) => object[field]);
  const legislationShaped = typeValues.includes("legislation") || object.source_native_type === "legislation" ||
    object.source_family === "legislation" || isLegislationHost(object.canonical_source_url) || isLegislationHost(object.url);
  if (expectedQuarantine) {
    if (
      typeValues.some((value) => value !== "legislation") || object.source_native_type !== "legislation" ||
      object.source_family !== "legislation" || object.title !== expectedQuarantine.title ||
      object.canonical_source_url !== expectedQuarantine.url || object.url !== expectedQuarantine.url
    ) {
      throw new Error(`Land Registry legislation quarantine record ${nativeId} drifted.`);
    }
    return Object.freeze({ status: "quarantined", reason: "standalone-legislation", sourceNativeId: nativeId });
  }
  if (legislationShaped) {
    throw new Error(`Land Registry contains an undeclared standalone legislation row ${nativeId || "without an ID"}.`);
  }
  if (typeValues.some((value) => typeof value !== "string" || !HMLR_SEARCHABLE_RECORD_TYPES.has(value)) ||
      typeValues.some((value) => value !== typeValues[0])) {
    throw new Error(`Land Registry row ${nativeId || "without an ID"} is outside the metadata-only record-type policy.`);
  }
  for (const field of HMLR_CLASSIFICATION_FIELDS) {
    const value = object[field];
    if (typeof value !== "string" || !value) {
      throw new Error(`Land Registry row ${nativeId || "without an ID"} has no bounded ${field} classification.`);
    }
    const compact = compactClassification(value);
    if (HMLR_PROHIBITED_CLASSIFICATION_PARTS.some((part) => compact.includes(part))) {
      throw new Error(`Land Registry row ${nativeId || "without an ID"} has prohibited ${field} classification ${value}.`);
    }
  }
  assertNoHmlrSensitiveFields(object);
  return Object.freeze({ status: "searchable", reason: "public-metadata", sourceNativeId: nativeId });
}

export function explicitAuthorityRole(value, fallback) {
  const role = text(value, 100).toLowerCase();
  if (role) return "producer-declared-source";
  return fallback;
}

function livingAuthorityLink(record, resources) {
  for (const id of Array.isArray(record.resource_ids) ? record.resource_ids : []) {
    const resource = resources.get(text(id, 500));
    if (!resource) continue;
    const url = safeSourceUrl(resource.source_access?.url) ?? safeSourceUrl(resource.url);
    if (!url) continue;
    return {
      url,
      role: explicitAuthorityRole(resource.source_access?.authority_role ?? resource.authority_role, "producer-declared-source"),
      label: text(resource.source_access?.label ?? resource.title ?? resource.name ?? record.title, 200) || "Open the declared source",
    };
  }
  return {
    url: null,
    role: "no-direct-authority-link",
    label: "No direct authority link in this published record",
  };
}

function authorityLink(source, record, resources) {
  if (source.id === "uk-living") return livingAuthorityLink(record, resources);
  const candidates = source.id === "land-registry"
    ? [
        [record.canonical_source_url, explicitAuthorityRole(record.authority_role, "producer-declared-source")],
        [record.url, "producer-record"],
        ...((Array.isArray(record.source_urls) ? record.source_urls : []).map((url) => [url, "producer-declared-source"])),
      ]
    : source.id === "ons"
      ? [[record.url, "producer-declared-source"], [record.documentation, "producer-declared-source"]]
      : [[record.documentation, "producer-record"], [record.url, "producer-record"]];
  for (const [candidate, role] of candidates) {
    const url = safeSourceUrl(candidate);
    if (!url) continue;
    return { url, role, label: text(record.title ?? record.name, 200) || "Open the declared source" };
  }
  return {
    url: null,
    role: "no-direct-authority-link",
    label: "No direct authority link in this published record",
  };
}

function rightsEvidence(record) {
  const licenceId = text(record.license_id ?? record.licence_id, 200) || null;
  const licenceTitle = text(record.license_title ?? record.licence_title ?? record.licence, 300) || null;
  const sourceState = text(record.licence_state ?? record.license_state ?? record.rights_state, 100) || null;
  const normalisedState = sourceState?.toLowerCase() ?? "";
  let status = "missing";
  if (normalisedState.includes("conflict")) status = "conflicting";
  else if (normalisedState === "unknown" || licenceId?.toLowerCase() === "unknown") status = "missing";
  else if (licenceId || licenceTitle) status = "confirmed";
  return {
    status,
    title: licenceTitle ?? licenceId,
    url: safeSourceUrl(record.license_source_id ?? record.licence_url ?? record.license_url),
  };
}

function accessEvidence(record) {
  const sourceValue = text(record.access_state ?? record.access_model ?? record.access, 100) || null;
  const raw = sourceValue?.toLowerCase() ?? "";
  let status = "access-not-established";
  if (["public", "anonymous", "public-repository"].includes(raw)) status = "public";
  else if (raw.includes("auth")) status = "authentication-required";
  else if (["restricted", "private"].includes(raw)) status = "restricted";
  else if (raw === "not-applicable") status = "not-applicable";
  return {
    status,
    note: sourceValue ? `Producer-declared access value: ${sourceValue}.` : "The producer record does not establish access.",
  };
}

export function assertion(record) {
  const sourceValue = text(
    record.assertion_status ?? record.assertion_provenance?.statementClass ?? record.derivation,
    120,
  ) || null;
  const raw = sourceValue?.toLowerCase() ?? "";
  const status = !sourceValue || NORMALISED_ASSERTION_VALUES.has(raw) ? "normalised" : "producer-declared";
  return { status, sourceValue };
}

function publisher(record) {
  const value = record.publisher_title ?? record.publisher;
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return text(value.title ?? value.name ?? value.label, 200) || "Publisher not stated";
  }
  return text(value, 200) || "Publisher not stated";
}

function resourceType(source, record) {
  const raw = text(record.resourceType ?? record.resource_type ?? record.record_type ?? record.type ?? record.kind, 120)
    .toLowerCase();
  if (RESOURCE_TYPES.has(raw)) return raw;
  if (raw.includes("documentation") || raw.includes("specification") || raw.includes("openapi")) return "api-documentation";
  if (raw.includes("organisation") || raw.includes("organization") || raw.includes("publisher")) return "organisation";
  if (raw.includes("guidance") || raw.includes("guide")) return "guidance";
  if (raw.includes("api")) return "api";
  if (raw.includes("dataset") || raw === "data") return "dataset";
  if (raw.includes("gov.uk") || raw.includes("govuk")) return "govuk-content";
  if (source.id === "ons") return "dataset";
  return "catalogue-record";
}

function recordLimitations(record, link) {
  const item = [...strings(record.limitations, 6), ...strings(record.caveats, 6)];
  if (!link.url) item.push("The published record has no direct authority link; no substitute URL has been invented.");
  return [...new Set(item.map((value) => text(value, 500)).filter(Boolean))]
    .slice(0, MAX_LIMITATIONS);
}

export function normaliseRecord(source, record, artifact, ordinal, resources) {
  plainObject(record, `${source.id} source record ${ordinal}`);
  const nativeId = sourceNativeId(record);
  if (!nativeId) throw new Error(`${source.id} contains a record without a source-native identifier.`);
  const title = text(record.title ?? record.name ?? record.label, 300);
  if (!title) throw new Error(`${source.id} ${nativeId} has no title.`);
  if (!Number.isSafeInteger(ordinal) || ordinal < 0 || ordinal > 999999) {
    throw new Error(`${source.id} record ordinal is outside the published 0 to 999999 boundary.`);
  }
  const link = authorityLink(source, record, resources);
  const documentationUrl = safeSourceUrl(record.documentation);
  const licence = rightsEvidence(record);
  if ([link.url, documentationUrl, licence.url].some(isLegislationHost)) {
    throw new Error(`${source.id} ${nativeId} would expose an excluded legislation.gov.uk result link.`);
  }
  const assertionEvidence = assertion(record);
  const base = {
    ordinal,
    sourceNativeId: nativeId,
    title,
    description: text(record.description ?? record.notes ?? record.context_note, MAX_DESCRIPTION_LENGTH) || "No description was published in this source record.",
    resourceType: resourceType(source, record),
    publisher: publisher(record),
    topics: [...new Set([...strings(record.topics), ...strings(record.tags)])].slice(0, MAX_TOPICS),
    authoritativeLink: link,
    documentationUrl,
    licence,
    access: accessEvidence(record),
    assertionStatus: assertionEvidence.status,
    sourcePath: artifact.sourcePath,
    sourceSha256: artifact.sourceSha256,
    limitations: recordLimitations(record, link),
  };
  return { ...base, recordDigest: sha256(canonicalJson(base)) };
}

function tokenise(value) {
  if (typeof value !== "string") return [];
  const normalised = value.normalize("NFKD").replace(/[\u0300-\u036f]/gu, "").toLowerCase();
  return [...new Set(
    [...normalised.matchAll(/[a-z0-9][a-z0-9._-]*/gu)]
      .map(([match]) => match.replace(/^[._-]+|[._-]+$/gu, ""))
      .filter((token) => token.length >= 2 && !STOP_WORDS.has(token)),
  )];
}

export function addRecordPostings(postings, record, budget = createFederatedBuildBudget()) {
  const fields = [
    ["title", record.title],
    ["description", record.description ?? ""],
    ["publisher", record.publisher ?? ""],
    ["topics", record.topics.join(" ")],
    ["resourceType", record.resourceType],
    ["sourceNativeId", record.sourceNativeId],
  ];
  const rows = new Map();
  for (const [field, value] of fields) {
    for (const token of tokenise(value)) {
      const current = rows.get(token) ?? { score: 0, mask: 0 };
      current.score += WEIGHTS[field];
      current.mask |= MASKS[field];
      rows.set(token, current);
    }
  }
  const selected = [...rows]
    .sort((left, right) => right[1].score - left[1].score || left[0].localeCompare(right[0], "en-GB"))
    .slice(0, MAX_TOKENS_PER_RECORD);
  for (const [token, value] of selected) {
    const newToken = !postings.has(token);
    chargeIndexWork(budget, { newToken, postings: 1 });
    if (newToken) postings.set(token, []);
    postings.get(token).push([record.ordinal, value.score, value.mask]);
  }
  return budget;
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value)}\n`);
}

async function writeJson(path, value, budget) {
  const bytes = jsonBytes(value);
  chargeFederatedGeneratedBytes(budget, bytes.byteLength);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  return { bytes: bytes.byteLength, sha256: sha256(bytes) };
}

function prefixFor(token) {
  const prefix = token.replace(/[^a-z0-9]/gu, "").slice(0, 2);
  return prefix || "_";
}

async function writeRecordShards(source, records, outputRoot, budget) {
  const references = [];
  for (let start = 0, part = 0; start < records.length; start += RECORDS_PER_SHARD, part += 1) {
    const rows = records.slice(start, start + RECORDS_PER_SHARD);
    const value = {
      schema: "govuk-webmcp.federated-record-shard.v1",
      collectionId: source.id,
      firstOrdinal: rows[0].ordinal,
      lastOrdinal: rows.at(-1).ordinal,
      records: rows,
    };
    const path = `records/${source.id}/records-${String(part).padStart(3, "0")}.json`;
    const bytes = jsonBytes(value);
    if (bytes.byteLength > MAX_RECORD_SHARD_BYTES) throw new Error(`${path} exceeds the record-shard byte limit.`);
    const identity = await writeJson(resolve(outputRoot, path), value, budget);
    references.push({
      collectionId: source.id,
      path: `data/federated-search/${path}`,
      ...identity,
      firstOrdinal: rows[0].ordinal,
      lastOrdinal: rows.at(-1).ordinal,
      recordCount: rows.length,
    });
  }
  return references;
}

export function postingFragments(postings) {
  const grouped = new Map();
  for (const token of [...postings.keys()].sort((left, right) => left.localeCompare(right, "en-GB"))) {
    const rows = postings.get(token);
    const prefix = prefixFor(token);
    if (!grouped.has(prefix)) grouped.set(prefix, []);
    for (let offset = 0; offset < rows.length; offset += MAX_POSTINGS_FRAGMENT) {
      grouped.get(prefix).push([token, rows.slice(offset, offset + MAX_POSTINGS_FRAGMENT)]);
    }
  }
  return grouped;
}

function encodedPostingEntryBytes(token, rows) {
  return Buffer.byteLength(JSON.stringify(token)) + 1 + Buffer.byteLength(JSON.stringify(rows));
}

function emptyPostingsShardBytes(collectionId, prefix, part) {
  return jsonBytes({
    schema: "govuk-webmcp.federated-postings-shard.v1",
    collectionId,
    prefix,
    part,
    entries: {},
  }).byteLength;
}

export function partitionPostingsFragments(
  collectionId,
  prefix,
  fragments,
  { maximumBytes = MAX_POSTINGS_SHARD_BYTES } = {},
) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 2) {
    throw new Error("The postings-shard byte limit must be a positive safe integer.");
  }
  const partitions = [];
  let entries = Object.create(null);
  let entryBytes = new Map();
  let entryCount = 0;
  let entriesContentBytes = 0;
  let emptyShardBytes = emptyPostingsShardBytes(collectionId, prefix, 0);
  const projectedBytes = (count, contentBytes) => emptyShardBytes + contentBytes + Math.max(0, count - 1);
  const flush = () => {
    if (!entryCount) return;
    partitions.push({
      entries,
      bytes: projectedBytes(entryCount, entriesContentBytes),
    });
    entries = Object.create(null);
    entryBytes = new Map();
    entryCount = 0;
    entriesContentBytes = 0;
    emptyShardBytes = emptyPostingsShardBytes(collectionId, prefix, partitions.length);
  };
  for (const [token, rows] of fragments) {
    const present = Object.hasOwn(entries, token);
    const combinedRows = present ? [...entries[token], ...rows] : rows;
    const combinedEntryBytes = encodedPostingEntryBytes(token, combinedRows);
    const nextCount = entryCount + (present ? 0 : 1);
    const nextContentBytes = entriesContentBytes - (entryBytes.get(token) ?? 0) + combinedEntryBytes;
    if (projectedBytes(nextCount, nextContentBytes) > maximumBytes && entryCount) flush();

    const afterFlushPresent = Object.hasOwn(entries, token);
    const retainedRows = afterFlushPresent ? [...entries[token], ...rows] : rows;
    const retainedEntryBytes = encodedPostingEntryBytes(token, retainedRows);
    const retainedCount = entryCount + (afterFlushPresent ? 0 : 1);
    const retainedContentBytes = entriesContentBytes - (entryBytes.get(token) ?? 0) + retainedEntryBytes;
    if (projectedBytes(retainedCount, retainedContentBytes) > maximumBytes) {
      throw new Error(`${collectionId} ${prefix} posting fragment exceeds the shard byte limit.`);
    }
    entries[token] = retainedRows;
    entryBytes.set(token, retainedEntryBytes);
    entryCount = retainedCount;
    entriesContentBytes = retainedContentBytes;
  }
  flush();
  return partitions;
}

async function writePostingsShards(source, postings, outputRoot, budget) {
  const manifest = {};
  for (const [prefix, fragments] of [...postingFragments(postings)]
    .sort(([left], [right]) => left.localeCompare(right, "en-GB"))) {
    const partitions = partitionPostingsFragments(source.id, prefix, fragments);
    manifest[prefix] = [];
    for (const [part, partition] of partitions.entries()) {
      const partEntries = partition.entries;
      const value = {
        schema: "govuk-webmcp.federated-postings-shard.v1",
        collectionId: source.id,
        prefix,
        part,
        entries: partEntries,
      };
      const path = `postings/${source.id}/${prefix}-${String(part).padStart(3, "0")}.json`;
      const identity = await writeJson(resolve(outputRoot, path), value, budget);
      if (identity.bytes !== partition.bytes || identity.bytes > MAX_POSTINGS_SHARD_BYTES) {
        throw new Error(`${path} violates exact postings-shard byte accounting.`);
      }
      manifest[prefix].push({
        collectionId: source.id,
        path: `data/federated-search/${path}`,
        ...identity,
        tokenCount: Object.keys(partEntries).length,
        postingCount: Object.values(partEntries).reduce((total, rows) => total + rows.length, 0),
      });
    }
  }
  return manifest;
}

async function buildCollection(source, firstOrdinal, rootDir, outputRoot, budget) {
  const resources = new Map();
  for (const artifact of source.supportingArtifacts) {
    const rows = await loadArtifactRows(artifact, source.id, rootDir);
    for (const row of rows) {
      plainObject(row, `${source.id} supporting resource`);
      const id = text(row.id ?? row.identifier ?? row["@id"], 500);
      if (!id || resources.has(id)) throw new Error(`${source.id} has an invalid or duplicate supporting-resource identifier.`);
      resources.set(id, row);
    }
  }

  const records = [];
  const postings = new Map();
  const nativeIds = new Set();
  const quarantinedNativeIds = new Set();
  let sourceRecordCount = 0;
  let ordinal = firstOrdinal;
  for (const artifact of source.recordArtifacts) {
    const rows = await loadArtifactRows(artifact, source.id, rootDir);
    for (const row of rows) {
      sourceRecordCount += 1;
      const nativeId = sourceNativeId(row);
      if (!nativeId || nativeIds.has(nativeId)) {
        throw new Error(`${source.id} has an invalid or duplicate source-native record identifier.`);
      }
      nativeIds.add(nativeId);
      if (source.id === "land-registry") {
        const classification = classifyLandRegistryRecord(row);
        if (classification.status === "quarantined") {
          quarantinedNativeIds.add(classification.sourceNativeId);
          continue;
        }
      }
      const record = normaliseRecord(source, row, artifact, ordinal, resources);
      records.push(record);
      addRecordPostings(postings, record, budget);
      ordinal += 1;
    }
  }
  const expectedQuarantineCount = source.id === "land-registry" ? HMLR_LEGISLATION_QUARANTINE.size : 0;
  if (sourceRecordCount !== source.population.records) throw new Error(`${source.id} source record count drifted.`);
  if (
    quarantinedNativeIds.size !== expectedQuarantineCount ||
    (source.id === "land-registry" && [...HMLR_LEGISLATION_QUARANTINE.keys()].some((id) => !quarantinedNativeIds.has(id)))
  ) {
    throw new Error(`${source.id} quarantine membership drifted.`);
  }
  if (records.length !== sourceRecordCount - expectedQuarantineCount) {
    throw new Error(`${source.id} searchable record count drifted.`);
  }
  const recordShards = await writeRecordShards(source, records, outputRoot, budget);
  const postingShards = await writePostingsShards(source, postings, outputRoot, budget);
  const collectionBase = {
    id: source.id,
    title: source.title,
    sourceRecordCount,
    quarantinedRecordCount: quarantinedNativeIds.size,
    recordCount: records.length,
    firstOrdinal,
    lastOrdinal: ordinal - 1,
    ...(source.population.serviceFamilies ? { serviceFamilies: source.population.serviceFamilies } : {}),
    snapshot: source.snapshot,
    revision: source.revision,
    deploymentId: source.deploymentId,
    descriptorUrl: new URL(source.descriptor.path, source.baseUrl).toString(),
    extractionMethod: EXTRACTION_METHOD,
    limitations: source.limitations,
    recordShards,
    postings: postingShards,
  };
  return {
    collection: { ...collectionBase, collectionDigest: sha256(canonicalJson(collectionBase)) },
    nextOrdinal: ordinal,
    sourceRecordCount,
    quarantinedRecordCount: quarantinedNativeIds.size,
  };
}

export async function buildFederatedSearch({ rootDir = process.cwd(), outputDirectory } = {}) {
  const root = resolve(rootDir);
  const lockBytes = await readRegularFile(resolve(root, FEDERATION_LOCK_PATH), "Federation source lock");
  let lock;
  try {
    lock = JSON.parse(lockBytes.toString("utf8"));
  } catch (error) {
    throw new Error("Federation source lock is not valid JSON.", { cause: error });
  }
  validateLockStructure(lock);
  const outputRoot = outputDirectory ? resolve(outputDirectory) : resolve(root, FEDERATED_SEARCH_DIRECTORY);
  if (!outputDirectory) {
    let outputStat;
    try {
      outputStat = await lstat(outputRoot);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    if (outputStat?.isSymbolicLink() || (outputStat && !outputStat.isDirectory())) {
      throw new Error("The generated federated-search output path must be a regular directory.");
    }
    if (outputStat) {
      await rm(outputRoot, { recursive: true, maxRetries: 5, retryDelay: 100 });
    }
  }
  await mkdir(outputRoot, { recursive: true });
  const collections = [];
  const budget = createFederatedBuildBudget();
  let sourceRecordCount = 0;
  let quarantinedRecordCount = 0;
  let nextOrdinal = 0;
  for (const source of lock.sources) {
    const built = await buildCollection(source, nextOrdinal, root, outputRoot, budget);
    collections.push(built.collection);
    sourceRecordCount += built.sourceRecordCount;
    quarantinedRecordCount += built.quarantinedRecordCount;
    nextOrdinal = built.nextOrdinal;
  }
  if (
    sourceRecordCount !== FEDERATED_SOURCE_RECORD_COUNT ||
    quarantinedRecordCount !== FEDERATED_QUARANTINED_RECORD_COUNT ||
    nextOrdinal !== FEDERATED_SEARCHABLE_RECORD_COUNT ||
    sourceRecordCount - quarantinedRecordCount !== nextOrdinal
  ) {
    throw new Error("Federated source, quarantine or searchable record count drifted.");
  }
  const manifestBase = {
    schema: "govuk-webmcp.federated-search.v1",
    projectionProfile: "govuk-webmcp.federated-record-inheritance.v1",
    generatedAt: lock.authoredAt,
    evidenceTier: FEDERATION_EVIDENCE_TIER,
    sourceLockSha256: sha256(lockBytes),
    sourceLockDigest: lock.lockDigest,
    sourceRecordCount,
    quarantinedRecordCount,
    recordCount: nextOrdinal,
    collectionCount: collections.length,
    recordShardSize: RECORDS_PER_SHARD,
    tokenisation: "nfkd-lowercase-ascii-alphanumeric-v1",
    weights: WEIGHTS,
    collections,
  };
  const manifest = { ...manifestBase, manifestDigest: sha256(canonicalJson(manifestBase)) };
  const manifestIdentity = await writeJson(resolve(outputRoot, "manifest.json"), manifest, budget);
  const checksumBytes = Buffer.from(`${manifestIdentity.sha256}  manifest.json\n`);
  chargeFederatedGeneratedBytes(budget, checksumBytes.byteLength);
  await writeFile(resolve(outputRoot, "manifest.json.sha256"), checksumBytes);
  return { manifest, manifestIdentity, buildBudget: Object.freeze({ ...budget }) };
}

function isMain() {
  return Boolean(process.argv[1]) && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
}

if (isMain()) {
  const result = await buildFederatedSearch();
  console.log(
    `Built ${result.manifest.recordCount} searchable records from ${result.manifest.sourceRecordCount} source rows; ` +
    `quarantined ${result.manifest.quarantinedRecordCount}: ${result.manifest.manifestDigest}`,
  );
}
