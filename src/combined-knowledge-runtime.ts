import type {
  AccessStatus,
  FederatedCollectionId,
  JsonObject,
  KnowledgeCollectionId,
  ResourceType,
} from "./contracts.js";
import type { FederatedSearchRuntime } from "./federated-search-runtime.js";

const QUERY_MAX = 160;
const RESULT_LIMIT_MAX = 20;
const SEARCH_KEYS = new Set([
  "query", "resourceTypes", "publishers", "accessStatuses", "collections", "limit",
]);
const RESOURCE_TYPES = new Set<ResourceType>([
  "govuk-content", "dataset", "api", "api-documentation", "catalogue-record", "organisation", "guidance",
]);
const ACCESS_STATUSES = new Set<AccessStatus>([
  "public", "restricted", "authentication-required", "access-not-established", "not-applicable",
]);
const COLLECTIONS = [
  "deep-evidence", "uk-living", "ons", "government-apis", "land-registry",
] as const satisfies readonly KnowledgeCollectionId[];
const FEDERATED_COLLECTIONS = COLLECTIONS.filter(
  (value): value is FederatedCollectionId => value !== "deep-evidence",
);
const FEDERATED_RECORD_ID = /^govuk-discovery:federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5})$/u;

interface ReviewedRuntime {
  readonly bundleDigest: string;
  readonly recordCount: number;
  readonly facets: {
    readonly resourceTypes: ResourceType[];
    readonly publishers: string[];
    readonly accessStatuses: AccessStatus[];
  };
  search(input: unknown): Promise<JsonObject>;
  getRecord(input: unknown): Promise<JsonObject>;
  showProvenance(input: unknown): Promise<JsonObject>;
}

export interface CombinedKnowledgeRuntime extends ReviewedRuntime {
  readonly federatedSourceRecordCount: number;
  readonly federatedQuarantinedRecordCount: number;
  readonly federatedRecordCount: number;
  readonly federatedManifestDigest: string;
  search(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  getRecord(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  showProvenance(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
}

interface SearchRequest {
  readonly query: string;
  readonly resourceTypes: ResourceType[];
  readonly publishers: string[];
  readonly accessStatuses: AccessStatus[];
  readonly collections: KnowledgeCollectionId[];
  readonly limit: number;
}

function errorResult(code: string, message: string): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code, message, details: {} },
    limitations: [
      "No substitute source was selected.",
      "No official API, model provider or personal context was contacted.",
    ],
  };
}

function plainObject(value: unknown): JsonObject {
  if (
    value === null || typeof value !== "object" || Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error("Input must be a plain JSON object.");
  }
  const object = value as JsonObject;
  const copy: JsonObject = {};
  for (const key of Reflect.ownKeys(object)) {
    if (typeof key !== "string" || !SEARCH_KEYS.has(key)) throw new Error("The search input contains an unknown field.");
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error("The search input must contain data fields only.");
    }
    copy[key] = descriptor.value as unknown;
  }
  return copy;
}

function boundedString(value: unknown, label: string, maximum: number): string {
  if (typeof value !== "string" || value.length < 1 || value.length > maximum) {
    throw new Error(`${label} must be a string from 1 to ${maximum} characters.`);
  }
  const normalised = value.trim().replace(/\s+/gu, " ");
  if (!normalised || normalised.length > maximum || /[\u0000-\u001F\u007F]/u.test(normalised)) {
    throw new Error(`${label} is empty after normalisation or contains unsupported characters.`);
  }
  return normalised;
}

function dataArray(value: unknown, label: string, minimum: number, maximum: number): unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new Error(`${label} must be a plain data array.`);
  }
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, "value") ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < minimum || lengthDescriptor.value > maximum) {
    throw new Error(`${label} must be an array with from ${minimum} to ${maximum} values.`);
  }
  const length = lengthDescriptor.value;
  if (Reflect.ownKeys(value).some((key) => {
    if (key === "length") return false;
    if (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/u.test(key)) return true;
    const index = Number(key);
    return !Number.isSafeInteger(index) || index < 0 || index >= length;
  })) {
    throw new Error(`${label} must contain indexed data values only.`);
  }
  const copy: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} must not contain accessors or empty positions.`);
    }
    copy.push(descriptor.value);
  }
  return copy;
}

function enumArray<T extends string>(
  value: unknown,
  label: string,
  allowed: ReadonlySet<string>,
  maximum: number,
): T[] {
  if (value === undefined) return [];
  const values = dataArray(value, label, 0, maximum);
  const output: T[] = [];
  for (const item of values) {
    if (typeof item !== "string" || !allowed.has(item)) throw new Error(`${label} contains an unsupported value.`);
    if (output.includes(item as T)) throw new Error(`${label} must not contain duplicate values.`);
    output.push(item as T);
  }
  return output;
}

function parseSearchInput(value: unknown): SearchRequest {
  const object = plainObject(value);
  const query = boundedString(object.query, "query", QUERY_MAX);
  const resourceTypes = enumArray<ResourceType>(object.resourceTypes, "resourceTypes", RESOURCE_TYPES, 7);
  const accessStatuses = enumArray<AccessStatus>(object.accessStatuses, "accessStatuses", ACCESS_STATUSES, 5);
  const collections = object.collections === undefined
    ? [...COLLECTIONS]
    : enumArray<KnowledgeCollectionId>(object.collections, "collections", new Set(COLLECTIONS), 5);
  if (!collections.length) throw new Error("collections must contain at least one evidence collection.");

  let publishers: string[] = [];
  if (object.publishers !== undefined) {
    publishers = dataArray(object.publishers, "publishers", 0, 8)
      .map((publisher, index) => boundedString(publisher, `publishers[${index}]`, 100));
    const keys = publishers.map((publisher) => publisher.toLocaleLowerCase("en-GB"));
    if (new Set(keys).size !== keys.length) throw new Error("publishers must not contain duplicate values after normalisation.");
  }

  const limit = object.limit === undefined ? 8 : object.limit;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > RESULT_LIMIT_MAX) {
    throw new Error(`limit must be an integer from 1 to ${RESULT_LIMIT_MAX}.`);
  }
  return { query, resourceTypes, publishers, accessStatuses, collections, limit };
}

function reviewedInput(request: SearchRequest): JsonObject {
  return {
    query: request.query,
    ...(request.resourceTypes.length ? { resourceTypes: request.resourceTypes } : {}),
    ...(request.publishers.length ? { publishers: request.publishers } : {}),
    ...(request.accessStatuses.length ? { accessStatuses: request.accessStatuses } : {}),
    limit: RESULT_LIMIT_MAX,
  };
}

function reviewedSummary(value: JsonObject): JsonObject {
  return {
    ...value,
    evidenceTier: "reviewed-deep-evidence",
    collectionId: "deep-evidence",
    collectionTitle: "Reviewed deep evidence",
    integrityBasis: "digest-bound",
    linkRole: "official-source",
  };
}

function matchesFederatedFilters(value: JsonObject, request: SearchRequest): boolean {
  if (request.resourceTypes.length && !request.resourceTypes.includes(value.resourceType as ResourceType)) return false;
  if (request.accessStatuses.length && !request.accessStatuses.includes(value.accessStatus as AccessStatus)) return false;
  if (request.publishers.length) {
    const publisher = String(value.publisher).toLocaleLowerCase("en-GB");
    if (!request.publishers.some((candidate) => candidate.toLocaleLowerCase("en-GB") === publisher)) return false;
  }
  return true;
}

function balancedResults(
  groups: ReadonlyMap<KnowledgeCollectionId, readonly JsonObject[]>,
  order: readonly KnowledgeCollectionId[],
  limit: number,
): JsonObject[] {
  const results: JsonObject[] = [];
  const maximum = Math.max(0, ...order.map((id) => groups.get(id)?.length ?? 0));
  for (let rank = 0; rank < maximum && results.length < limit; rank += 1) {
    for (const id of order) {
      const result = groups.get(id)?.[rank];
      if (result) results.push(result);
      if (results.length >= limit) break;
    }
  }
  return results;
}

function lowerBoundedFilters(request: SearchRequest): boolean {
  return Boolean(request.resourceTypes.length || request.publishers.length || request.accessStatuses.length);
}

function publicFederatedResult(result: JsonObject): JsonObject {
  if (result.ok === true) return result;
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: result.error as JsonObject,
    limitations: Array.isArray(result.limitations)
      ? result.limitations
      : ["The federated evidence could not be returned."],
  };
}

function federatedRecordRequest(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    return false;
  }
  const descriptor = Object.getOwnPropertyDescriptor(value, "recordId");
  return Boolean(descriptor && Object.hasOwn(descriptor, "value") &&
    typeof descriptor.value === "string" && FEDERATED_RECORD_ID.test(descriptor.value));
}

export function createCombinedKnowledgeRuntime(
  reviewed: ReviewedRuntime,
  federated: FederatedSearchRuntime,
): CombinedKnowledgeRuntime {
  return {
    bundleDigest: reviewed.bundleDigest,
    recordCount: reviewed.recordCount,
    federatedSourceRecordCount: federated.sourceRecordCount,
    federatedQuarantinedRecordCount: federated.quarantinedRecordCount,
    federatedRecordCount: federated.recordCount,
    federatedManifestDigest: federated.manifestDigest,
    facets: reviewed.facets,

    async search(input: unknown, options: { readonly signal?: AbortSignal } = {}): Promise<JsonObject> {
      let request: SearchRequest;
      try {
        request = parseSearchInput(input);
      } catch (error) {
        return errorResult("invalid_search_request", error instanceof Error ? error.message : "Search failed.");
      }
      const useReviewed = request.collections.includes("deep-evidence");
      const selectedFederated = request.collections.filter(
        (value): value is FederatedCollectionId => FEDERATED_COLLECTIONS.includes(value as FederatedCollectionId),
      );
      const [reviewedResult, federatedResult] = await Promise.all([
        useReviewed ? reviewed.search(reviewedInput(request)) : Promise.resolve(undefined),
        selectedFederated.length
          ? federated.search(
              { query: request.query, collections: selectedFederated, limit: RESULT_LIMIT_MAX },
              options,
            )
          : Promise.resolve(undefined),
      ]);
      if (reviewedResult && reviewedResult.ok !== true) return reviewedResult;
      if (federatedResult && federatedResult.ok !== true) {
        return publicFederatedResult(federatedResult as unknown as JsonObject);
      }

      const reviewedResults = reviewedResult
        ? (reviewedResult.results as JsonObject[]).map(reviewedSummary)
        : [];
      const rawFederatedResults = federatedResult ? federatedResult.results as JsonObject[] : [];
      const federatedResults = rawFederatedResults.filter((result) => matchesFederatedFilters(result, request));
      const groups = new Map<KnowledgeCollectionId, JsonObject[]>();
      groups.set("deep-evidence", reviewedResults);
      for (const collectionId of selectedFederated) {
        groups.set(collectionId, federatedResults.filter((result) => result.collectionId === collectionId));
      }
      const merged = balancedResults(groups, request.collections, request.limit);
      const hasFederatedFilters = selectedFederated.length > 0 && lowerBoundedFilters(request);
      const federatedStatuses = federatedResult ? federatedResult.collectionStatuses as JsonObject[] : [];
      const unavailable = federatedStatuses.some(({ status }) => status !== "ready");
      const reviewedTotal = reviewedResult ? Number(reviewedResult.totalMatches) : 0;
      const federatedTotal = federatedResult
        ? hasFederatedFilters ? federatedResults.length : Number(federatedResult.totalMatches)
        : 0;
      const totalMatches = reviewedTotal + federatedTotal;
      const totalRelation = hasFederatedFilters || unavailable || federatedResult?.totalRelation === "gte" ? "gte" : "eq";
      const collectionStatuses: JsonObject[] = [];
      if (useReviewed) {
        collectionStatuses.push({
          collectionId: "deep-evidence",
          title: "Reviewed deep evidence",
          evidenceTier: "reviewed-deep-evidence",
          status: "ready",
          totalMatches: reviewedTotal,
          totalRelation: "eq",
          returned: merged.filter(({ collectionId }) => collectionId === "deep-evidence").length,
          verifiedShardFiles: 0,
          verifiedShardBytes: 0,
        });
      }
      for (const status of federatedStatuses) {
        const collectionId = status.collectionId as FederatedCollectionId;
        const filteredCount = federatedResults.filter((result) => result.collectionId === collectionId).length;
        collectionStatuses.push({
          ...status,
          evidenceTier: "federated-source-snapshot",
          ...(hasFederatedFilters ? {
            totalMatches: filteredCount,
            totalRelation: "gte",
            limitation: "Federated filters are applied to the bounded candidate window; the displayed total is a lower bound.",
          } : {}),
          returned: merged.filter((result) => result.collectionId === collectionId).length,
        });
      }
      return {
        schema: "trusted-govuk-discovery.search-result.v2",
        ok: true,
        query: request.query,
        selectedCollections: request.collections,
        evidenceEstate: {
          reviewedRecordCount: reviewed.recordCount,
          reviewedBundleDigest: reviewed.bundleDigest,
          federatedSourceRecordCount: federated.sourceRecordCount,
          federatedQuarantinedRecordCount: federated.quarantinedRecordCount,
          federatedRecordCount: federated.recordCount,
          federatedCollectionCount: federated.collectionIds.length,
          federatedManifestDigest: federated.manifestDigest,
        },
        totalMatches,
        totalRelation,
        returned: merged.length,
        truncated: totalRelation === "gte" || totalMatches > merged.length,
        results: merged,
        collectionStatuses,
        boundaries: {
          pageScoped: true,
          readOnly: true,
          providerCall: false,
          officialApiCall: false,
          sameOriginStaticReads: true,
          personalContextAccepted: false,
          durableReceiptCreated: false,
          sourceDerivedContentIsUntrusted: true,
          rankingIsTrustAssessment: false,
        },
      };
    },

    async getRecord(input: unknown, options: { readonly signal?: AbortSignal } = {}): Promise<JsonObject> {
      if (!federatedRecordRequest(input)) return reviewed.getRecord(input);
      return publicFederatedResult(await federated.getRecord(input, options));
    },

    async showProvenance(input: unknown, options: { readonly signal?: AbortSignal } = {}): Promise<JsonObject> {
      if (!federatedRecordRequest(input)) return reviewed.showProvenance(input);
      return publicFederatedResult(await federated.showProvenance(input, options));
    },
  };
}
