import type { JsonObject } from "./contracts.js";
import { canonicalJson, isRfc3339DateTime, parseChecksum, sha256Hex } from "./integrity.js";

export interface CorpusAdmission extends JsonObject {
  id: string;
  title: string;
  domain: string;
  repositoryUrl: string | null;
  source: JsonObject;
  producerState: string;
  admissionState: "searchable" | "described-only" | "conditional" | "quarantined" | "contract-only";
  payloadState: string;
  freshness: JsonObject;
  population: JsonObject;
  counts: JsonObject[];
  rights: JsonObject;
  semantics: JsonObject;
  delivery: JsonObject;
  decision: JsonObject;
  boundaries: JsonObject;
}

export interface FederationRuntime {
  manifestDigest: string;
  collections: CorpusAdmission[];
  federatedSearch: FederatedSearchBinding;
  searchableCollections: number;
  deepEvidenceCollections: number;
  federatedCollections: number;
  federatedSourceRecordCount: number;
  federatedQuarantinedRecordCount: number;
  federatedRecordCount: number;
  notSearchableCollections: number;
  stateCounts: Record<CorpusAdmission["admissionState"], number>;
}

export interface FederatedSearchBinding extends JsonObject {
  sourceLockSha256: string;
  sourceLockDigest: string;
  sourceRecordCount: number;
  quarantinedRecordCount: number;
  recordCount: number;
  collectionBindings: readonly FederatedCollectionBinding[];
}

export interface FederatedCollectionBinding extends JsonObject {
  admissionId: string;
  collectionId: string;
  sourceRecordCount: number;
  quarantinedRecordCount: number;
  recordCount: number;
}

const SHA256 = /^[a-f0-9]{64}$/u;
const COMMIT = /^[a-f0-9]{40}$/u;
const RELEASE_CATALOGUE_RECORD_COUNT = 80;
const CORPUS_ID = /^corpus:[a-z0-9][a-z0-9-]{2,80}$/u;
const ROOT_KEYS = new Set([
  "schema", "generatedAt", "catalogueBundleDigest", "admissionSourceDigest", "federatedSearch", "collections", "manifestDigest",
]);
const FEDERATED_SEARCH_KEYS = new Set([
  "sourceLockSha256", "sourceLockDigest", "sourceRecordCount", "quarantinedRecordCount", "recordCount", "collectionBindings",
]);
const FEDERATED_COLLECTION_BINDING_KEYS = new Set([
  "admissionId", "collectionId", "sourceRecordCount", "quarantinedRecordCount", "recordCount",
]);
const EXPECTED_FEDERATED_COLLECTION_BINDINGS = Object.freeze([
  Object.freeze({
    admissionId: "corpus:uk-life-course",
    collectionId: "uk-living",
    admissionTitle: "UK life-course service families",
    sourceRecordCount: 9_757,
    quarantinedRecordCount: 0,
    recordCount: 9_757,
    sourceCountMetric: "concepts",
    counts: Object.freeze([
      Object.freeze({ metric: "concepts", count: 9_757 }),
      Object.freeze({ metric: "service families", count: 293 }),
      Object.freeze({ metric: "relationships", count: 15_810 }),
      Object.freeze({ metric: "source assertions", count: 879 }),
    ]),
    completenessClaim: "Complete against the locked 9,757-record source snapshot only; 293 of those records are service families.",
    limitation: "The exact admitted producer revision records 0 accepted specialist reviews, 2 service families where specialist review is not required and 291 where specialist review is required. Search inclusion is not an item-level reviewed evidence receipt.",
  }),
  Object.freeze({
    admissionId: "corpus:ons-metadata",
    collectionId: "ons",
    admissionTitle: "ONS metadata discovery",
    sourceRecordCount: 5_097,
    quarantinedRecordCount: 0,
    recordCount: 5_097,
    sourceCountMetric: "records",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 5_097 }),
      Object.freeze({ metric: "relationships", count: 19_735 }),
    ]),
    completenessClaim: "Complete only for the four declared adapter snapshots.",
    limitation: "The deployed generated bundle is locked by observed bytes because the recorded commit alone does not reproduce its ignored Pages output; ELS rights remain not established.",
  }),
  Object.freeze({
    admissionId: "corpus:uk-government-apis",
    collectionId: "government-apis",
    admissionTitle: "UK government API and data catalogue",
    sourceRecordCount: 41_598,
    quarantinedRecordCount: 0,
    recordCount: 41_598,
    sourceCountMetric: "records",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 41_598 }),
      Object.freeze({ metric: "relationships", count: 276_996 }),
    ]),
    completenessClaim: "Bounded to the observed 41,598-record publication snapshot; not a claim about every UK public API.",
    limitation: "Licence and access evidence remain record-specific and may be missing or inferred; source-snapshot search does not make an endpoint live, public, authorised or safe to call.",
  }),
  Object.freeze({
    admissionId: "corpus:land-registry-metadata",
    collectionId: "land-registry",
    admissionTitle: "HM Land Registry metadata",
    sourceRecordCount: 2_203,
    quarantinedRecordCount: 3,
    recordCount: 2_200,
    sourceCountMetric: "records",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 2_203 }),
      Object.freeze({ metric: "relationships", count: 22_267 }),
    ]),
    completenessClaim: "Bounded to the producer release manifest.",
    limitation: "This metadata-only discovery tier excludes title-register, title-plan, ownership, address, polygon and personal rows; it is not property evidence or legal advice.",
  }),
]);
const ENTRY_KEYS = new Set(["admission", "entryDigest"]);
const ADMISSION_KEYS = new Set(["id", "title", "domain", "repositoryUrl", "source", "producerState", "admissionState", "payloadState", "freshness", "population", "counts", "rights", "semantics", "delivery", "decision", "boundaries"]);
const SOURCE_KEYS = new Set(["refType", "tag", "revision", "snapshotId", "importedSha256"]);
const FRESHNESS_KEYS = new Set(["status", "observedAt", "staleAfter"]);
const POPULATION_KEYS = new Set(["definition", "denominator", "unit", "completenessClaim"]);
const COUNT_KEYS = new Set(["metric", "count"]);
const RIGHTS_KEYS = new Set(["repositoryLicence", "upstreamPolicy", "redistribution", "perRecordReviewRequired", "accessDefault"]);
const SEMANTICS_KEYS = new Set(["sourceOkfCore", "targetOkfCore", "profile", "schemaDigest", "crosswalkStatus"]);
const DELIVERY_KEYS = new Set(["mode", "sameOriginPaths", "lazy", "maximumInitialBytes"]);
const DECISION_KEYS = new Set(["allowedClaims", "forbiddenClaims", "limitations"]);
const BOUNDARY_KEYS = new Set(["officialEndorsement", "runtimeOfficialApiCalls"]);
const REF_TYPES = new Set(["locked-import", "commit", "tag", "unversioned-local"]);
const PRODUCER_STATES = new Set(["checkpoint", "candidate", "released", "validated", "unversioned"]);
const ADMISSION_STATES = new Set(["searchable", "described-only", "conditional", "quarantined", "contract-only"]);
const PAYLOAD_STATES = new Set(["deep-evidence", "federated-source-snapshot", "lazy-candidate", "descriptor-only", "quarantined"]);
const FRESHNESS_STATES = new Set(["observed", "not-established", "not-applicable"]);
const ACCESS_STATES = new Set(["public", "restricted", "authentication-required", "access-not-established", "not-applicable"]);
const DELIVERY_MODES = new Set(["same-origin-bundle", "same-origin-lazy-index", "descriptor-only", "quarantined"]);

function exactObject(value: unknown, keys: ReadonlySet<string>, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  const object = value as JsonObject;
  for (const key of Object.keys(object)) {
    if (!keys.has(key)) throw new Error(`${label} contains an unknown field: ${key}`);
  }
  return object;
}

function boundedStrings(
  value: unknown,
  label: string,
  maximumItems: number,
  minimumLength: number,
  maximumLength: number,
): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > maximumItems ||
      value.some((item) => typeof item !== "string" || item.length < minimumLength || item.length > maximumLength)) {
    throw new Error(`${label} is missing or exceeds its bounds.`);
  }
  return value;
}

function requiredString(value: unknown, label: string, maximum: number, minimum = 1): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum) {
    throw new Error(`${label} must contain from ${minimum} to ${maximum} characters.`);
  }
  return value;
}

function dateTimeOrNull(value: unknown, label: string): void {
  if (value === null) return;
  if (!isRfc3339DateTime(value)) {
    throw new Error(`${label} is not a valid date-time or null.`);
  }
}

function enumValue(value: unknown, allowed: ReadonlySet<string>, label: string): string {
  if (typeof value !== "string" || !allowed.has(value)) throw new Error(`${label} has an unsupported value.`);
  return value;
}

function validateRepositoryUrl(value: unknown): void {
  if (value === null) return;
  if (typeof value !== "string") throw new Error("A corpus repository URL is invalid.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("A corpus repository URL is malformed.");
  }
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (
    url.protocol !== "https:" || url.username || url.password || url.hostname !== "github.com" ||
    url.search || url.hash || pathParts.length !== 2 || pathParts[0] !== "chris-page-gov" ||
    url.toString() !== value || /%(?![a-fA-F0-9]{2})/u.test(value)
  ) {
    throw new Error("A corpus repository URL is outside the admitted public GitHub account.");
  }
}

function withoutField(value: JsonObject, field: string): JsonObject {
  const copy = structuredClone(value);
  delete copy[field];
  return copy;
}

export async function createFederationRuntime(
  rawManifest: string,
  rawChecksum: string,
  catalogueBundleDigest: string,
  catalogueRecordCount: number,
): Promise<FederationRuntime> {
  if (!Number.isInteger(catalogueRecordCount) || catalogueRecordCount < 0) {
    throw new Error("The catalogue record count supplied to the federation is invalid.");
  }
  if (parseChecksum(rawChecksum, "federation.json") !== await sha256Hex(rawManifest)) {
    throw new Error("The federation checksum does not match the same-origin bytes.");
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(rawManifest);
  } catch {
    throw new Error("The federation manifest is not valid JSON.");
  }
  const root = exactObject(decoded, ROOT_KEYS, "Federation manifest");
  if (
    root.schema !== "govuk-webmcp.corpus-admission.v1" ||
    root.catalogueBundleDigest !== catalogueBundleDigest ||
    typeof root.admissionSourceDigest !== "string" || !SHA256.test(root.admissionSourceDigest) ||
    typeof root.manifestDigest !== "string" || !SHA256.test(root.manifestDigest) ||
    !Array.isArray(root.collections) || root.collections.length < 1 || root.collections.length > 16
  ) {
    throw new Error("The federation manifest binding is invalid.");
  }
  dateTimeOrNull(root.generatedAt, "Federation generatedAt");
  if (root.generatedAt === null) throw new Error("Federation generatedAt must not be null.");
  const observedManifestDigest = await sha256Hex(canonicalJson(withoutField(root, "manifestDigest")));
  if (observedManifestDigest !== root.manifestDigest) throw new Error("The federation manifest digest is invalid.");
  const federatedSearchObject = exactObject(root.federatedSearch, FEDERATED_SEARCH_KEYS, "Federated-search binding");
  for (const key of FEDERATED_SEARCH_KEYS) {
    if (!(key in federatedSearchObject)) throw new Error(`The federated-search binding is missing ${key}.`);
  }
  if (
    typeof federatedSearchObject.sourceLockSha256 !== "string" || !SHA256.test(federatedSearchObject.sourceLockSha256) ||
    typeof federatedSearchObject.sourceLockDigest !== "string" || !SHA256.test(federatedSearchObject.sourceLockDigest) ||
    federatedSearchObject.sourceRecordCount !== 58_655 ||
    federatedSearchObject.quarantinedRecordCount !== 3 ||
    federatedSearchObject.recordCount !== 58_652 ||
    Number(federatedSearchObject.sourceRecordCount) !==
      Number(federatedSearchObject.recordCount) + Number(federatedSearchObject.quarantinedRecordCount)
  ) {
    throw new Error("The federated-search source-lock and population binding is invalid.");
  }
  if (!Array.isArray(federatedSearchObject.collectionBindings) ||
      federatedSearchObject.collectionBindings.length !== EXPECTED_FEDERATED_COLLECTION_BINDINGS.length) {
    throw new Error("The federated-search collection population bindings are invalid.");
  }
  const collectionBindings = federatedSearchObject.collectionBindings.map((candidate, index) => {
    const expected = EXPECTED_FEDERATED_COLLECTION_BINDINGS[index]!;
    const binding = exactObject(
      candidate,
      FEDERATED_COLLECTION_BINDING_KEYS,
      `Federated-search collection binding ${index}`,
    );
    for (const key of FEDERATED_COLLECTION_BINDING_KEYS) {
      if (!(key in binding)) throw new Error(`Federated-search collection binding ${index} is missing ${key}.`);
    }
    if (
      binding.admissionId !== expected.admissionId || binding.collectionId !== expected.collectionId ||
      binding.sourceRecordCount !== expected.sourceRecordCount ||
      binding.quarantinedRecordCount !== expected.quarantinedRecordCount ||
      binding.recordCount !== expected.recordCount ||
      Number(binding.sourceRecordCount) !== Number(binding.recordCount) + Number(binding.quarantinedRecordCount)
    ) {
      throw new Error(`The ${expected.collectionId} collection population binding is invalid.`);
    }
    return Object.freeze({
      admissionId: expected.admissionId,
      collectionId: expected.collectionId,
      sourceRecordCount: expected.sourceRecordCount,
      quarantinedRecordCount: expected.quarantinedRecordCount,
      recordCount: expected.recordCount,
    }) as FederatedCollectionBinding;
  });
  if (
    collectionBindings.reduce((total, binding) => total + binding.sourceRecordCount, 0) !==
      federatedSearchObject.sourceRecordCount ||
    collectionBindings.reduce((total, binding) => total + binding.quarantinedRecordCount, 0) !==
      federatedSearchObject.quarantinedRecordCount ||
    collectionBindings.reduce((total, binding) => total + binding.recordCount, 0) !==
      federatedSearchObject.recordCount
  ) {
    throw new Error("The federated-search collection bindings do not match the aggregate population binding.");
  }
  const federatedSearch = Object.freeze({
    sourceLockSha256: federatedSearchObject.sourceLockSha256,
    sourceLockDigest: federatedSearchObject.sourceLockDigest,
    sourceRecordCount: Number(federatedSearchObject.sourceRecordCount),
    quarantinedRecordCount: Number(federatedSearchObject.quarantinedRecordCount),
    recordCount: Number(federatedSearchObject.recordCount),
    collectionBindings: Object.freeze(collectionBindings),
  }) as FederatedSearchBinding;

  const identifiers = new Set<string>();
  const collections: CorpusAdmission[] = [];
  for (const candidate of root.collections) {
    const entry = exactObject(candidate, ENTRY_KEYS, "Federation entry");
    const admission = exactObject(entry.admission, ADMISSION_KEYS, "Corpus admission") as unknown as CorpusAdmission;
    if (!CORPUS_ID.test(admission.id) || identifiers.has(admission.id)) throw new Error("A corpus admission identifier is invalid or duplicated.");
    identifiers.add(admission.id);
    if (typeof entry.entryDigest !== "string" || !SHA256.test(entry.entryDigest) ||
        await sha256Hex(canonicalJson(admission)) !== entry.entryDigest) {
      throw new Error(`Corpus admission ${admission.id} has an invalid entry digest.`);
    }
    validateRepositoryUrl(admission.repositoryUrl);
    requiredString(admission.title, `Title for ${admission.id}`, 160, 3);
    requiredString(admission.domain, `Domain for ${admission.id}`, 120, 3);
    enumValue(admission.producerState, PRODUCER_STATES, `Producer state for ${admission.id}`);
    enumValue(admission.admissionState, ADMISSION_STATES, `Admission state for ${admission.id}`);
    enumValue(admission.payloadState, PAYLOAD_STATES, `Payload state for ${admission.id}`);
    const source = exactObject(admission.source, SOURCE_KEYS, `Source for ${admission.id}`);
    for (const key of SOURCE_KEYS) {
      if (!(key in source)) throw new Error(`Source for ${admission.id} is missing ${key}.`);
    }
    const refType = enumValue(source.refType, REF_TYPES, `Reference type for ${admission.id}`);
    if (refType !== "unversioned-local" && (typeof source.revision !== "string" || !COMMIT.test(source.revision))) {
      throw new Error(`Versioned corpus ${admission.id} has no immutable revision.`);
    }
    if (refType === "unversioned-local" && source.revision !== null) {
      throw new Error(`Unversioned corpus ${admission.id} must not claim an immutable revision.`);
    }
    if (refType === "tag") requiredString(source.tag, `Tag for ${admission.id}`, 100);
    if (source.tag !== null && typeof source.tag !== "string") throw new Error(`Tag for ${admission.id} must be a string or null.`);
    if (source.snapshotId !== null && typeof source.snapshotId !== "string") throw new Error(`Snapshot ID for ${admission.id} must be a string or null.`);
    if (source.importedSha256 !== null && (typeof source.importedSha256 !== "string" || !SHA256.test(source.importedSha256))) {
      throw new Error(`Imported digest for ${admission.id} is invalid.`);
    }
    const freshness = exactObject(admission.freshness, FRESHNESS_KEYS, `Freshness for ${admission.id}`);
    for (const key of FRESHNESS_KEYS) {
      if (!(key in freshness)) throw new Error(`Freshness for ${admission.id} is missing ${key}.`);
    }
    const freshnessStatus = enumValue(freshness.status, FRESHNESS_STATES, `Freshness status for ${admission.id}`);
    dateTimeOrNull(freshness.observedAt, `Observed date for ${admission.id}`);
    dateTimeOrNull(freshness.staleAfter, `Stale-after date for ${admission.id}`);
    if (freshnessStatus === "observed" && freshness.observedAt === null) {
      throw new Error(`Observed corpus ${admission.id} requires an observation date.`);
    }
    const population = exactObject(admission.population, POPULATION_KEYS, `Population for ${admission.id}`);
    for (const key of POPULATION_KEYS) {
      if (!(key in population)) throw new Error(`Population for ${admission.id} is missing ${key}.`);
    }
    requiredString(population.definition, `Population definition for ${admission.id}`, 500, 10);
    requiredString(population.unit, `Population unit for ${admission.id}`, 80);
    requiredString(population.completenessClaim, `Completeness claim for ${admission.id}`, 400, 5);
    if (population.denominator !== null && (!Number.isInteger(population.denominator) || Number(population.denominator) < 0)) {
      throw new Error(`Population denominator for ${admission.id} is invalid.`);
    }
    if (!Array.isArray(admission.counts) || admission.counts.length > 8) throw new Error(`Corpus admission ${admission.id} has invalid counts.`);
    const countMetrics = new Set<string>();
    for (const value of admission.counts) {
      const count = exactObject(value, COUNT_KEYS, `Count for ${admission.id}`);
      const metric = requiredString(count.metric, `Count metric for ${admission.id}`, 80);
      if (countMetrics.has(metric) || !Number.isInteger(count.count) || Number(count.count) < 0) {
        throw new Error(`Corpus admission ${admission.id} has an invalid count.`);
      }
      countMetrics.add(metric);
    }
    const rights = exactObject(admission.rights, RIGHTS_KEYS, `Rights for ${admission.id}`);
    for (const key of RIGHTS_KEYS) {
      if (!(key in rights)) throw new Error(`Rights for ${admission.id} is missing ${key}.`);
    }
    requiredString(rights.repositoryLicence, `Repository licence for ${admission.id}`, 200);
    requiredString(rights.upstreamPolicy, `Upstream policy for ${admission.id}`, 500, 5);
    requiredString(rights.redistribution, `Redistribution statement for ${admission.id}`, 300, 5);
    if (typeof rights.perRecordReviewRequired !== "boolean") throw new Error(`Per-record review flag for ${admission.id} is invalid.`);
    enumValue(rights.accessDefault, ACCESS_STATES, `Access default for ${admission.id}`);
    const semantics = exactObject(admission.semantics, SEMANTICS_KEYS, `Semantics for ${admission.id}`);
    for (const key of SEMANTICS_KEYS) {
      if (!(key in semantics)) throw new Error(`Semantics for ${admission.id} is missing ${key}.`);
    }
    if (semantics.sourceOkfCore !== null && semantics.sourceOkfCore !== "0.1" && semantics.sourceOkfCore !== "0.2") {
      throw new Error(`Corpus ${admission.id} has an unsupported source OKF core declaration.`);
    }
    if (semantics.targetOkfCore !== "0.2") {
      throw new Error(`Corpus ${admission.id} is not explicitly mapped to the OKF 0.2 target core.`);
    }
    requiredString(semantics.profile, `Semantic profile for ${admission.id}`, 160, 3);
    requiredString(semantics.crosswalkStatus, `Crosswalk status for ${admission.id}`, 100, 3);
    if (semantics.schemaDigest !== null && (typeof semantics.schemaDigest !== "string" || !SHA256.test(semantics.schemaDigest))) {
      throw new Error(`Schema digest for ${admission.id} is invalid.`);
    }
    const delivery = exactObject(admission.delivery, DELIVERY_KEYS, `Delivery for ${admission.id}`);
    for (const key of DELIVERY_KEYS) {
      if (!(key in delivery)) throw new Error(`Delivery for ${admission.id} is missing ${key}.`);
    }
    enumValue(delivery.mode, DELIVERY_MODES, `Delivery mode for ${admission.id}`);
    if (!Array.isArray(delivery.sameOriginPaths) || delivery.sameOriginPaths.length > 8 ||
        delivery.sameOriginPaths.some((path) => typeof path !== "string" || !/^[a-z0-9/.-]+$/u.test(path)) ||
        new Set(delivery.sameOriginPaths).size !== delivery.sameOriginPaths.length) {
      throw new Error(`Same-origin paths for ${admission.id} are invalid.`);
    }
    if (typeof delivery.lazy !== "boolean" || !Number.isInteger(delivery.maximumInitialBytes) ||
        Number(delivery.maximumInitialBytes) < 0 || Number(delivery.maximumInitialBytes) > 1_048_576) {
      throw new Error(`Delivery budget for ${admission.id} is invalid.`);
    }
    const decision = exactObject(admission.decision, DECISION_KEYS, `Decision for ${admission.id}`);
    boundedStrings(decision.allowedClaims, `Allowed claims for ${admission.id}`, 8, 5, 500);
    boundedStrings(decision.forbiddenClaims, `Forbidden claims for ${admission.id}`, 8, 5, 500);
    boundedStrings(decision.limitations, `Limitations for ${admission.id}`, 12, 5, 700);
    const boundaries = exactObject(admission.boundaries, BOUNDARY_KEYS, `Boundaries for ${admission.id}`);
    if (boundaries.officialEndorsement !== false || boundaries.runtimeOfficialApiCalls !== false) {
      throw new Error(`Corpus admission ${admission.id} crosses the independent static boundary.`);
    }
    collections.push(admission);
  }

  if (collections.some((collection, index) => index > 0 && collections[index - 1]!.id.localeCompare(collection.id, "en-GB") > 0)) {
    throw new Error("The federation entries are not in deterministic corpus identifier order.");
  }

  const searchable = collections.filter(({ admissionState }) => admissionState === "searchable");
  const deepEvidence = searchable.filter(({ payloadState }) => payloadState === "deep-evidence");
  const federatedSnapshots = searchable.filter(({ payloadState }) => payloadState === "federated-source-snapshot");
  const deepEvidenceIds = new Set(deepEvidence.map(({ id }) => id));
  const federatedIds = new Set(federatedSnapshots.map(({ id }) => id));
  if (searchable.length !== 6 || deepEvidence.length + federatedSnapshots.length !== searchable.length) {
    throw new Error("The federation must expose exactly six searchable collections: two reviewed and four federated.");
  }
  if (
    deepEvidence.length !== 2 || !deepEvidenceIds.has("corpus:govuk-new-child") ||
    !deepEvidenceIds.has("corpus:curated-government-data-apis")
  ) {
    throw new Error("The federation must preserve exactly the two reviewed deep-evidence collections.");
  }
  const deepEvidenceRecords = deepEvidence.reduce((total, admission) => {
    const recordCount = admission.counts.find(({ metric }) => metric === "records")?.count;
    if (admission.payloadState !== "deep-evidence" || recordCount !== admission.population.denominator) {
      throw new Error(`Deep-evidence corpus ${admission.id} no longer matches its reviewed boundary.`);
    }
    return total + Number(recordCount);
  }, 0);
  if (deepEvidenceRecords !== catalogueRecordCount) {
    throw new Error(
      `The deep-evidence corpus admissions account for ${deepEvidenceRecords} records but the catalogue contains ${catalogueRecordCount}.`,
    );
  }
  if (
    federatedSnapshots.length !== 4 ||
    !["corpus:uk-life-course", "corpus:ons-metadata", "corpus:uk-government-apis", "corpus:land-registry-metadata"]
      .every((id) => federatedIds.has(id))
  ) {
    throw new Error("The federation must expose exactly the four admitted OKF source snapshots.");
  }
  for (const [index, binding] of federatedSearch.collectionBindings.entries()) {
    const expected = EXPECTED_FEDERATED_COLLECTION_BINDINGS[index]!;
    const admission = federatedSnapshots.find(({ id }) => id === binding.admissionId);
    const admittedSourceCount = admission?.counts.find(({ metric }) => metric === expected.sourceCountMetric)?.count;
    if (
      admission?.population.denominator !== binding.sourceRecordCount ||
      admittedSourceCount !== binding.sourceRecordCount ||
      admission.title !== expected.admissionTitle ||
      admission.population.completenessClaim !== expected.completenessClaim ||
      (admission.decision.limitations as unknown[])[0] !== expected.limitation ||
      canonicalJson(admission.counts) !== canonicalJson(expected.counts)
    ) {
      throw new Error(
        `The ${binding.admissionId} admission does not match the ${binding.collectionId} collection population binding or its validated display contract.`,
      );
    }
  }
  const federatedSourceRecordCount = federatedSnapshots.reduce((total, admission) => {
    if (!Number.isInteger(admission.population.denominator) || Number(admission.population.denominator) < 1) {
      throw new Error(`Federated corpus ${admission.id} has no valid source-snapshot denominator.`);
    }
    return total + Number(admission.population.denominator);
  }, 0);
  if (federatedSourceRecordCount !== federatedSearch.sourceRecordCount) {
    throw new Error(
      `The federated source snapshots account for ${federatedSourceRecordCount} rather than ${federatedSearch.sourceRecordCount} source records.`,
    );
  }
  const legislation = collections.find(({ id }) => id === "corpus:uk-legislation");
  if (
    legislation?.admissionState !== "quarantined" || legislation.payloadState !== "quarantined" ||
    legislation.delivery.mode !== "descriptor-only"
  ) {
    throw new Error("The UK legislation collection must remain explicitly excluded.");
  }
  if (catalogueRecordCount !== RELEASE_CATALOGUE_RECORD_COUNT) {
    throw new Error(`The federation requires the exact ${RELEASE_CATALOGUE_RECORD_COUNT}-record release catalogue.`);
  }
  const stateCounts = Object.fromEntries([...ADMISSION_STATES].map((state) => [
    state,
    collections.filter(({ admissionState }) => admissionState === state).length,
  ])) as FederationRuntime["stateCounts"];
  return {
    manifestDigest: root.manifestDigest,
    collections,
    federatedSearch,
    searchableCollections: searchable.length,
    deepEvidenceCollections: deepEvidence.length,
    federatedCollections: federatedSnapshots.length,
    federatedSourceRecordCount,
    federatedQuarantinedRecordCount: federatedSearch.quarantinedRecordCount,
    federatedRecordCount: federatedSearch.recordCount,
    notSearchableCollections: collections.length - searchable.length,
    stateCounts,
  };
}
