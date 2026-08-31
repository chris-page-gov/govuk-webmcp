import type { JsonObject } from "./contracts.js";
import { canonicalJson, isRfc3339DateTime, sha256Hex } from "./integrity.js";

export const OKF_FEDERATED_COLLECTION_IDS = Object.freeze([
  "uk-living",
  "ons",
  "government-apis",
  "land-registry",
] as const);

export type OkfFederatedCollectionId = typeof OKF_FEDERATED_COLLECTION_IDS[number];
export type OkfStaticSearchSchema = "okf-static-search.v1" | "okf-static-search.v2";
export type OkfArtifactCompression = "identity" | "gzip";
export type OkfRevisionReproducibility =
  | "exact-repository-revision"
  | "deployed-bytes-observed-separately";

export const OKF_FEDERATION_LIMITS = Object.freeze({
  maximumPathLength: 240,
  maximumResourceBytes: 16 * 1024 * 1024,
  maximumDecodedArtifactBytes: 450 * 1024 * 1024,
  maximumStoredArtifactBytes: 32 * 1024 * 1024,
  maximumArtifactsPerSource: 64,
  maximumLimitationsPerSource: 12,
});

export interface OkfLockedResourceReference {
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface OkfLockedSearchManifestReference extends OkfLockedResourceReference {
  readonly schema: OkfStaticSearchSchema;
}

export interface OkfLockedArtifact {
  readonly role: "records" | "resources" | "supporting";
  readonly sourcePath: string;
  readonly storedPath: string;
  readonly sourceBytes: number;
  readonly sourceSha256: string;
  readonly storedBytes: number;
  readonly storedSha256: string;
  readonly compression: OkfArtifactCompression;
  readonly itemCount: number;
}

export interface OkfLockedPopulation {
  readonly records: number;
  readonly unit: "search documents";
  readonly serviceFamilies?: number;
  readonly resources?: number;
}

export interface OkfLockedSourceBudgets {
  readonly maximumResourceBytes: number;
  readonly maximumDecodedBytes: number;
  readonly maximumStoredBytes: number;
  readonly maximumArtifacts: number;
}

export interface OkfFederatedSourceLock {
  readonly id: OkfFederatedCollectionId;
  readonly title: string;
  readonly repositoryUrl: string;
  readonly baseUrl: string;
  readonly deploymentId: string;
  readonly revision: string;
  readonly revisionReproducibility: OkfRevisionReproducibility;
  readonly snapshot: string | null;
  readonly descriptor: OkfLockedResourceReference;
  readonly dataManifest: OkfLockedResourceReference;
  readonly searchManifest: OkfLockedSearchManifestReference;
  readonly population: OkfLockedPopulation;
  readonly recordArtifacts: readonly OkfLockedArtifact[];
  readonly supportingArtifacts: readonly OkfLockedArtifact[];
  readonly requestPolicy: {
    readonly credentials: "omit";
    readonly redirect: "error";
    readonly sameOriginOnly: true;
  };
  readonly budgets: OkfLockedSourceBudgets;
  readonly rights: {
    readonly status: "source-specific" | "not-established";
    readonly statement: string;
  };
  readonly access: {
    readonly status: "public-static-metadata";
    readonly statement: string;
  };
  readonly limitations: readonly string[];
  readonly boundaries: {
    readonly officialApiCalls: false;
    readonly personalContextAccepted: false;
    readonly sourceDerivedContentIsUntrusted: true;
  };
  readonly entryDigest: string;
}

export interface OkfFederationLockAggregate {
  readonly sourceCount: 4;
  readonly recordCount: 58655;
  readonly artifactCount: 73;
  readonly decodedArtifactBytes: number;
  readonly storedArtifactBytes: number;
  readonly sourceIdentityDigest: string;
  readonly aggregateDigest: string;
}

export interface ValidatedOkfFederationLock {
  readonly schema: "govuk-webmcp.okf-federation-lock.v1";
  readonly profile: "govuk-webmcp.okf-federated-search.v1";
  readonly evidenceTier: "federated-source-snapshot";
  readonly authoredAt: string;
  readonly aggregate: OkfFederationLockAggregate;
  readonly sources: readonly OkfFederatedSourceLock[];
  readonly lockDigest: string;
}

interface ExpectedSource {
  readonly title: string;
  readonly repositoryUrl: string;
  readonly baseUrl: string;
  readonly revision: string;
  readonly revisionReproducibility: OkfRevisionReproducibility;
  readonly snapshot: string | null;
  readonly dataManifestPath: string;
  readonly searchManifestPath: string;
  readonly searchSchema: OkfStaticSearchSchema;
  readonly records: number;
  readonly recordArtifacts: number;
  readonly supportingArtifacts: number;
}

const EXPECTED_SOURCES: Readonly<Record<OkfFederatedCollectionId, ExpectedSource>> = Object.freeze({
  "uk-living": Object.freeze({
    title: "A Life in the UK — life-course discovery corpus",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-living",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-living/",
    revision: "4bc010eab3c9c072f68960393c1458a772aa700b",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "life-course-authority-infrastructure-2026-08-08",
    dataManifestPath: "large/data/manifest.json",
    searchManifestPath: "large/data/search/manifest.json",
    searchSchema: "okf-static-search.v1",
    records: 9757,
    recordArtifacts: 10,
    supportingArtifacts: 1,
  }),
  ons: Object.freeze({
    title: "ONS data discovery OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-ons",
    baseUrl: "https://chris-page-gov.github.io/okf-ons/",
    revision: "b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf",
    revisionReproducibility: "deployed-bytes-observed-separately",
    snapshot: "monday-2026-07-17-r2",
    dataManifestPath: "data/manifest.json",
    searchManifestPath: "data/search/manifest.json",
    searchSchema: "okf-static-search.v2",
    records: 5097,
    recordArtifacts: 11,
    supportingArtifacts: 0,
  }),
  "government-apis": Object.freeze({
    title: "UK Government APIs OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-government-apis",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-government-apis/",
    revision: "55c7e67947dfd86e291ca987e354429c36b453d9",
    revisionReproducibility: "exact-repository-revision",
    snapshot: null,
    dataManifestPath: "data/manifest.json",
    searchManifestPath: "data/search/manifest.json",
    searchSchema: "okf-static-search.v1",
    records: 41598,
    recordArtifacts: 42,
    supportingArtifacts: 0,
  }),
  "land-registry": Object.freeze({
    title: "HM Land Registry public-estate OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-LandRegistry",
    baseUrl: "https://chris-page-gov.github.io/okf-LandRegistry/",
    revision: "1d708e39f2cde19610d43c5a7f5e36e4a2f947bc",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "hmlr-public-metadata-v0.2.0",
    dataManifestPath: "data/explorer/manifest.json",
    searchManifestPath: "data/explorer/search/manifest.json",
    searchSchema: "okf-static-search.v2",
    records: 2203,
    recordArtifacts: 9,
    supportingArtifacts: 0,
  }),
});

const SHA256 = /^[a-f0-9]{64}$/u;
const REVISION = /^[a-f0-9]{40}$/u;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;
const SAFE_RELATIVE_PATH = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u;
const ROOT_KEYS = new Set(["schema", "profile", "evidenceTier", "authoredAt", "aggregate", "sources", "lockDigest"]);
const AGGREGATE_KEYS = new Set([
  "sourceCount", "recordCount", "artifactCount", "decodedArtifactBytes",
  "storedArtifactBytes", "sourceIdentityDigest", "aggregateDigest",
]);
const SOURCE_KEYS = new Set([
  "id", "title", "repositoryUrl", "baseUrl", "deploymentId", "revision",
  "revisionReproducibility", "snapshot", "descriptor", "dataManifest",
  "searchManifest", "population", "recordArtifacts", "supportingArtifacts",
  "requestPolicy", "budgets", "rights", "access", "limitations", "boundaries",
  "entryDigest",
]);
const REFERENCE_KEYS = new Set(["path", "bytes", "sha256"]);
const SEARCH_REFERENCE_KEYS = new Set(["path", "bytes", "sha256", "schema"]);
const POPULATION_KEYS = new Set(["records", "unit", "serviceFamilies", "resources"]);
const ARTIFACT_KEYS = new Set([
  "role", "sourcePath", "storedPath", "sourceBytes", "sourceSha256",
  "storedBytes", "storedSha256", "compression", "itemCount",
]);
const REQUEST_POLICY_KEYS = new Set(["credentials", "redirect", "sameOriginOnly"]);
const BUDGET_KEYS = new Set(["maximumResourceBytes", "maximumDecodedBytes", "maximumStoredBytes", "maximumArtifacts"]);
const RIGHTS_KEYS = new Set(["status", "statement"]);
const ACCESS_KEYS = new Set(["status", "statement"]);
const BOUNDARY_KEYS = new Set(["officialApiCalls", "personalContextAccepted", "sourceDerivedContentIsUntrusted"]);

function exactObject(
  value: unknown,
  allowedKeys: ReadonlySet<string>,
  requiredKeys: readonly string[],
  label: string,
): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  const object = value as JsonObject;
  for (const key of Reflect.ownKeys(object)) {
    if (typeof key !== "string" || !allowedKeys.has(key)) {
      throw new Error(`${label} contains an unknown field.`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} must contain data fields only.`);
    }
  }
  for (const key of requiredKeys) {
    if (!Object.hasOwn(object, key)) throw new Error(`${label} is missing ${key}.`);
  }
  return object;
}

function stringValue(value: unknown, label: string, minimum: number, maximum: number): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || CONTROL_CHARACTERS.test(value)) {
    throw new Error(`${label} must contain from ${minimum} to ${maximum} safe characters.`);
  }
  return value;
}

function integer(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isSafeInteger(value) || Number(value) < minimum || Number(value) > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}.`);
  }
  return Number(value);
}

function digest(value: unknown, label: string): string {
  if (typeof value !== "string" || !SHA256.test(value)) throw new Error(`${label} must be a lowercase SHA-256 digest.`);
  return value;
}

function safeRelativePath(value: unknown, label: string): string {
  const path = stringValue(value, label, 1, OKF_FEDERATION_LIMITS.maximumPathLength);
  if (
    !SAFE_RELATIVE_PATH.test(path) || path.startsWith("/") || path.includes("\\") ||
    path.includes("//") || path.includes("%") || path.includes("?") || path.includes("#") ||
    path.split("/").some((part) => part === "." || part === "..")
  ) {
    throw new Error(`${label} must be a canonical safe relative path without traversal or encoding.`);
  }
  return path;
}

function exactHttpsUrl(value: unknown, expected: string, label: string): void {
  if (typeof value !== "string") throw new Error(`${label} must be an exact admitted HTTPS URL.`);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an exact admitted HTTPS URL.`);
  }
  if (
    parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port ||
    parsed.search || parsed.hash || parsed.toString() !== value || value !== expected
  ) {
    throw new Error(`${label} must be the exact credential-free admitted HTTPS URL.`);
  }
}

function reference(value: unknown, label: string, expectedPath?: string): OkfLockedResourceReference {
  const object = exactObject(value, REFERENCE_KEYS, ["path", "bytes", "sha256"], label);
  const path = safeRelativePath(object.path, `${label} path`);
  if (expectedPath !== undefined && path !== expectedPath) throw new Error(`${label} path has drifted from the admitted release.`);
  const bytes = integer(object.bytes, `${label} bytes`, 1, OKF_FEDERATION_LIMITS.maximumResourceBytes);
  return Object.freeze({ path, bytes, sha256: digest(object.sha256, `${label} digest`) });
}

function searchReference(
  value: unknown,
  label: string,
  expectedPath: string,
  expectedSchema: OkfStaticSearchSchema,
): OkfLockedSearchManifestReference {
  const object = exactObject(value, SEARCH_REFERENCE_KEYS, ["path", "bytes", "sha256", "schema"], label);
  const path = safeRelativePath(object.path, `${label} path`);
  if (path !== expectedPath) throw new Error(`${label} path has drifted from the admitted release.`);
  if (object.schema !== expectedSchema) throw new Error(`${label} schema is unsupported or has drifted.`);
  return Object.freeze({
    path,
    bytes: integer(object.bytes, `${label} bytes`, 1, OKF_FEDERATION_LIMITS.maximumResourceBytes),
    sha256: digest(object.sha256, `${label} digest`),
    schema: expectedSchema,
  });
}

function artifact(value: unknown, sourceId: OkfFederatedCollectionId, label: string): OkfLockedArtifact {
  const object = exactObject(value, ARTIFACT_KEYS, [...ARTIFACT_KEYS], label);
  if (object.role !== "records" && object.role !== "resources" && object.role !== "supporting") {
    throw new Error(`${label} role is unsupported.`);
  }
  if (object.compression !== "identity" && object.compression !== "gzip") {
    throw new Error(`${label} compression is unsupported.`);
  }
  const sourcePath = safeRelativePath(object.sourcePath, `${label} source path`);
  const storedPath = safeRelativePath(object.storedPath, `${label} stored path`);
  if (!storedPath.startsWith(`app/data/sources/okf-federation/${sourceId}/`)) {
    throw new Error(`${label} stored path is outside its admitted collection directory.`);
  }
  const sourceBytes = integer(object.sourceBytes, `${label} source bytes`, 1, OKF_FEDERATION_LIMITS.maximumResourceBytes);
  const storedBytes = integer(object.storedBytes, `${label} stored bytes`, 1, OKF_FEDERATION_LIMITS.maximumResourceBytes);
  const sourceSha256 = digest(object.sourceSha256, `${label} source digest`);
  const storedSha256 = digest(object.storedSha256, `${label} stored digest`);
  if (object.compression === "identity" && (sourceBytes !== storedBytes || sourceSha256 !== storedSha256)) {
    throw new Error(`${label} identity representation has byte or digest drift.`);
  }
  return Object.freeze({
    role: object.role,
    sourcePath,
    storedPath,
    sourceBytes,
    sourceSha256,
    storedBytes,
    storedSha256,
    compression: object.compression,
    itemCount: integer(object.itemCount, `${label} item count`, 0, 1_000_000),
  }) as OkfLockedArtifact;
}

function boundedStatement(value: unknown, label: string): string {
  return stringValue(value, label, 10, 700);
}

function withoutField(value: JsonObject, field: string): JsonObject {
  const clone = structuredClone(value);
  delete clone[field];
  return clone;
}

function identityInput(source: OkfFederatedSourceLock): JsonObject {
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

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

async function validateSource(value: unknown, index: number): Promise<OkfFederatedSourceLock> {
  const label = `OKF federation source ${index}`;
  const object = exactObject(value, SOURCE_KEYS, [...SOURCE_KEYS], label);
  if (typeof object.id === "string" && object.id.includes("legislation")) {
    throw new Error("Legislation is explicitly outside this federation lock.");
  }
  if (!OKF_FEDERATED_COLLECTION_IDS.includes(object.id as OkfFederatedCollectionId)) {
    throw new Error(`${label} has an unsupported collection identifier.`);
  }
  const id = object.id as OkfFederatedCollectionId;
  if (id !== OKF_FEDERATED_COLLECTION_IDS[index]) {
    throw new Error("OKF federation sources are duplicated, missing or outside deterministic collection order.");
  }
  const expected = EXPECTED_SOURCES[id];
  if (object.title !== expected.title) throw new Error(`${id} title has drifted from the admitted release.`);
  exactHttpsUrl(object.repositoryUrl, expected.repositoryUrl, `${id} repository URL`);
  exactHttpsUrl(object.baseUrl, expected.baseUrl, `${id} base URL`);
  stringValue(object.deploymentId, `${id} deployment ID`, 3, 160);
  if (typeof object.revision !== "string" || !REVISION.test(object.revision) || object.revision !== expected.revision) {
    throw new Error(`${id} revision has drifted from the verified Pages deployment identity.`);
  }
  if (object.revisionReproducibility !== expected.revisionReproducibility) {
    throw new Error(`${id} revision reproducibility has drifted from the verified boundary.`);
  }
  if (object.snapshot !== expected.snapshot) throw new Error(`${id} snapshot has drifted from the verified descriptor.`);
  const descriptor = reference(object.descriptor, `${id} descriptor`, "okf-explorer.json");
  const dataManifest = reference(object.dataManifest, `${id} data manifest`, expected.dataManifestPath);
  const searchManifest = searchReference(object.searchManifest, `${id} search manifest`, expected.searchManifestPath, expected.searchSchema);

  const populationObject = exactObject(object.population, POPULATION_KEYS, ["records", "unit"], `${id} population`);
  if (populationObject.records !== expected.records || populationObject.unit !== "search documents") {
    throw new Error(`${id} population count or unit has drifted from the verified search manifest.`);
  }
  if (id === "uk-living") {
    if (populationObject.serviceFamilies !== 293 || populationObject.resources !== 879) {
      throw new Error("uk-living population facets have drifted from the verified descriptor.");
    }
  } else if (populationObject.serviceFamilies !== undefined || populationObject.resources !== undefined) {
    throw new Error(`${id} contains unsupported population facets.`);
  }
  const population: OkfLockedPopulation = Object.freeze({
    records: expected.records,
    unit: "search documents",
    ...(id === "uk-living" ? { serviceFamilies: 293, resources: 879 } : {}),
  });

  if (!Array.isArray(object.recordArtifacts) || object.recordArtifacts.length !== expected.recordArtifacts) {
    throw new Error(`${id} record-artifact count has drifted from the admitted publication shape.`);
  }
  if (!Array.isArray(object.supportingArtifacts) || object.supportingArtifacts.length !== expected.supportingArtifacts) {
    throw new Error(`${id} supporting-artifact count has drifted from the admitted publication shape.`);
  }
  const recordArtifacts = object.recordArtifacts.map((entry, artifactIndex) =>
    artifact(entry, id, `${id} record artifact ${artifactIndex}`));
  const supportingArtifacts = object.supportingArtifacts.map((entry, artifactIndex) =>
    artifact(entry, id, `${id} supporting artifact ${artifactIndex}`));
  if (recordArtifacts.some(({ role }) => role !== "records") || supportingArtifacts.some(({ role }) => role === "records")) {
    throw new Error(`${id} artifact roles do not match their declared collections.`);
  }
  if (recordArtifacts.reduce((total, entry) => total + entry.itemCount, 0) !== expected.records) {
    throw new Error(`${id} record-artifact items do not account for its verified population.`);
  }
  const allArtifacts = [...recordArtifacts, ...supportingArtifacts];
  const sourcePaths = new Set<string>();
  const storedPaths = new Set<string>();
  for (const entry of allArtifacts) {
    if (sourcePaths.has(entry.sourcePath) || storedPaths.has(entry.storedPath)) {
      throw new Error(`${id} contains a duplicate artifact path.`);
    }
    sourcePaths.add(entry.sourcePath);
    storedPaths.add(entry.storedPath);
  }

  const requestPolicy = exactObject(object.requestPolicy, REQUEST_POLICY_KEYS, [...REQUEST_POLICY_KEYS], `${id} request policy`);
  if (requestPolicy.credentials !== "omit" || requestPolicy.redirect !== "error" || requestPolicy.sameOriginOnly !== true) {
    throw new Error(`${id} request policy would permit credentials, redirects or another origin.`);
  }
  const budgetsObject = exactObject(object.budgets, BUDGET_KEYS, [...BUDGET_KEYS], `${id} budgets`);
  const budgets: OkfLockedSourceBudgets = Object.freeze({
    maximumResourceBytes: integer(budgetsObject.maximumResourceBytes, `${id} maximum resource bytes`, 1, OKF_FEDERATION_LIMITS.maximumResourceBytes),
    maximumDecodedBytes: integer(budgetsObject.maximumDecodedBytes, `${id} maximum decoded bytes`, 1, OKF_FEDERATION_LIMITS.maximumDecodedArtifactBytes),
    maximumStoredBytes: integer(budgetsObject.maximumStoredBytes, `${id} maximum stored bytes`, 1, OKF_FEDERATION_LIMITS.maximumStoredArtifactBytes),
    maximumArtifacts: integer(budgetsObject.maximumArtifacts, `${id} maximum artifacts`, 1, OKF_FEDERATION_LIMITS.maximumArtifactsPerSource),
  });
  const decodedBytes = allArtifacts.reduce((total, entry) => total + entry.sourceBytes, 0);
  const storedBytes = allArtifacts.reduce((total, entry) => total + entry.storedBytes, 0);
  if (
    allArtifacts.some(({ sourceBytes, storedBytes: artefactStoredBytes }) =>
      sourceBytes > budgets.maximumResourceBytes || artefactStoredBytes > budgets.maximumResourceBytes) ||
    decodedBytes > budgets.maximumDecodedBytes || storedBytes > budgets.maximumStoredBytes ||
    allArtifacts.length > budgets.maximumArtifacts
  ) {
    throw new Error(`${id} artifacts exceed the declared bounded retrieval budget.`);
  }

  const rightsObject = exactObject(object.rights, RIGHTS_KEYS, [...RIGHTS_KEYS], `${id} rights`);
  if (rightsObject.status !== "source-specific" && rightsObject.status !== "not-established") {
    throw new Error(`${id} rights status is unsupported.`);
  }
  const accessObject = exactObject(object.access, ACCESS_KEYS, [...ACCESS_KEYS], `${id} access`);
  if (accessObject.status !== "public-static-metadata") throw new Error(`${id} access status is unsupported.`);
  if (!Array.isArray(object.limitations) || object.limitations.length < 1 ||
      object.limitations.length > OKF_FEDERATION_LIMITS.maximumLimitationsPerSource) {
    throw new Error(`${id} must retain from 1 to ${OKF_FEDERATION_LIMITS.maximumLimitationsPerSource} limitations.`);
  }
  const limitations = object.limitations.map((item, limitationIndex) =>
    boundedStatement(item, `${id} limitation ${limitationIndex}`));
  if (id === "ons" && !limitations.some((item) => /revision does not by itself reproduce the ignored generated Pages bundle/iu.test(item))) {
    throw new Error("ons must disclose that its revision does not reproduce the ignored generated Pages bundle.");
  }
  const boundariesObject = exactObject(object.boundaries, BOUNDARY_KEYS, [...BOUNDARY_KEYS], `${id} boundaries`);
  if (
    boundariesObject.officialApiCalls !== false || boundariesObject.personalContextAccepted !== false ||
    boundariesObject.sourceDerivedContentIsUntrusted !== true
  ) {
    throw new Error(`${id} crosses the static, context-minimised federation boundary.`);
  }

  const candidate: OkfFederatedSourceLock = {
    id,
    title: expected.title,
    repositoryUrl: expected.repositoryUrl,
    baseUrl: expected.baseUrl,
    deploymentId: object.deploymentId as string,
    revision: expected.revision,
    revisionReproducibility: expected.revisionReproducibility,
    snapshot: expected.snapshot,
    descriptor,
    dataManifest,
    searchManifest,
    population,
    recordArtifacts,
    supportingArtifacts,
    requestPolicy: { credentials: "omit", redirect: "error", sameOriginOnly: true },
    budgets,
    rights: {
      status: rightsObject.status as "source-specific" | "not-established",
      statement: boundedStatement(rightsObject.statement, `${id} rights statement`),
    },
    access: {
      status: "public-static-metadata",
      statement: boundedStatement(accessObject.statement, `${id} access statement`),
    },
    limitations,
    boundaries: {
      officialApiCalls: false,
      personalContextAccepted: false,
      sourceDerivedContentIsUntrusted: true,
    },
    entryDigest: digest(object.entryDigest, `${id} entry digest`),
  };
  const observedEntryDigest = await sha256Hex(canonicalJson(withoutField(object, "entryDigest")));
  if (candidate.entryDigest !== observedEntryDigest) throw new Error(`${id} entry digest does not match its locked metadata.`);
  return deepFreeze(candidate);
}

/**
 * Validate the fixed, offline four-source OKF federation lock. The return value
 * is a deeply frozen copy and does not retain mutable caller-owned objects.
 */
export async function validateOkfFederationLock(value: unknown): Promise<ValidatedOkfFederationLock> {
  const root = exactObject(value, ROOT_KEYS, [...ROOT_KEYS], "OKF federation lock");
  if (root.schema !== "govuk-webmcp.okf-federation-lock.v1") {
    throw new Error("The OKF federation lock schema is unsupported.");
  }
  if (root.profile !== "govuk-webmcp.okf-federated-search.v1") {
    throw new Error("The OKF federation lock profile is unsupported.");
  }
  if (root.evidenceTier !== "federated-source-snapshot") {
    throw new Error("The OKF federation evidence tier is unsupported.");
  }
  if (!isRfc3339DateTime(root.authoredAt)) throw new Error("The OKF federation authored date is not RFC 3339.");
  if (!Array.isArray(root.sources) || root.sources.length !== OKF_FEDERATED_COLLECTION_IDS.length) {
    throw new Error("The OKF federation lock must contain exactly four admitted sources.");
  }
  const suppliedIds = root.sources.map((source) =>
    source !== null && typeof source === "object" && !Array.isArray(source) ? (source as JsonObject).id : undefined);
  if (suppliedIds.some((id) => typeof id === "string" && id.includes("legislation"))) {
    throw new Error("Legislation is explicitly outside this federation lock.");
  }
  if (new Set(suppliedIds).size !== suppliedIds.length) throw new Error("The OKF federation lock contains duplicate source identifiers.");

  const sources: OkfFederatedSourceLock[] = [];
  for (const [index, source] of root.sources.entries()) sources.push(await validateSource(source, index));

  const aggregateObject = exactObject(root.aggregate, AGGREGATE_KEYS, [...AGGREGATE_KEYS], "OKF federation aggregate");
  const artifacts = sources.flatMap((source) => [...source.recordArtifacts, ...source.supportingArtifacts]);
  const decodedArtifactBytes = artifacts.reduce((total, entry) => total + entry.sourceBytes, 0);
  const storedArtifactBytes = artifacts.reduce((total, entry) => total + entry.storedBytes, 0);
  if (
    aggregateObject.sourceCount !== 4 || aggregateObject.recordCount !== 58655 || aggregateObject.artifactCount !== 73 ||
    aggregateObject.decodedArtifactBytes !== decodedArtifactBytes || aggregateObject.storedArtifactBytes !== storedArtifactBytes
  ) {
    throw new Error("The OKF federation aggregate count or byte totals have drifted from its source locks.");
  }
  if (decodedArtifactBytes > OKF_FEDERATION_LIMITS.maximumDecodedArtifactBytes ||
      storedArtifactBytes > OKF_FEDERATION_LIMITS.maximumStoredArtifactBytes) {
    throw new Error("The OKF federation aggregate exceeds its fixed byte budget.");
  }
  const observedIdentityDigest = await sha256Hex(canonicalJson(sources.map(identityInput)));
  if (digest(aggregateObject.sourceIdentityDigest, "OKF federation source identity digest") !== observedIdentityDigest) {
    throw new Error("The OKF federation source identity digest has drifted.");
  }
  const observedAggregateDigest = await sha256Hex(canonicalJson(withoutField(aggregateObject, "aggregateDigest")));
  if (digest(aggregateObject.aggregateDigest, "OKF federation aggregate digest") !== observedAggregateDigest) {
    throw new Error("The OKF federation aggregate digest has drifted.");
  }
  const observedLockDigest = await sha256Hex(canonicalJson(withoutField(root, "lockDigest")));
  if (digest(root.lockDigest, "OKF federation lock digest") !== observedLockDigest) {
    throw new Error("The OKF federation lock digest does not match its content.");
  }

  const validated: ValidatedOkfFederationLock = {
    schema: "govuk-webmcp.okf-federation-lock.v1",
    profile: "govuk-webmcp.okf-federated-search.v1",
    evidenceTier: "federated-source-snapshot",
    authoredAt: root.authoredAt,
    aggregate: {
      sourceCount: 4,
      recordCount: 58655,
      artifactCount: 73,
      decodedArtifactBytes,
      storedArtifactBytes,
      sourceIdentityDigest: observedIdentityDigest,
      aggregateDigest: aggregateObject.aggregateDigest as string,
    },
    sources,
    lockDigest: root.lockDigest as string,
  };
  return deepFreeze(validated);
}

export function okfFederatedSource(
  lock: ValidatedOkfFederationLock,
  id: OkfFederatedCollectionId,
): OkfFederatedSourceLock {
  const source = lock.sources.find((candidate) => candidate.id === id);
  if (!source) throw new Error(`The validated federation has no ${id} source.`);
  return source;
}
