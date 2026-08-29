/**
 * Page-scoped, read-only WebMCP tools over a verified same-origin catalogue.
 * Source-derived strings are untrusted data and must be rendered as text.
 */

export type JsonObject = Record<string, unknown>;
export type AccessStatus =
  | "public"
  | "restricted"
  | "authentication-required"
  | "access-not-established"
  | "not-applicable";
export type AssertionStatus =
  | "official-source"
  | "normalised"
  | "inferred"
  | "model-derived";
export type ResourceType =
  | "govuk-content"
  | "dataset"
  | "api"
  | "api-documentation"
  | "catalogue-record"
  | "organisation"
  | "guidance";

export interface SourceReference {
  url: string;
  title: string;
  publisher: string;
  observedAt: string;
  digest?: string;
}

export interface FieldAssertion {
  field: string;
  status: AssertionStatus;
  evidenceUrls: string[];
  note?: string;
}

export interface DiscoveryRecord {
  id: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  publisher: string;
  steward?: string;
  topics: string[];
  canonicalHumanUrl: string;
  documentationUrl?: string;
  machineEndpoint?: string;
  apiCatalogueUrl?: string;
  licence: {
    status: "confirmed" | "missing" | "conflicting" | "not-applicable";
    title?: string;
    url?: string;
    attribution?: string;
  };
  access: {
    status: AccessStatus;
    evidenceUrl?: string;
    note: string;
  };
  dates: {
    firstPublished?: string;
    modified?: string;
    observed: string;
  };
  sourceAuthority: string;
  assertions: FieldAssertion[];
  provenance: {
    extractionMethod: string;
    sourceLock?: string;
    sourceDigest: string;
    recordDigest: string;
    bundleDigest: string;
    evidenceReceiptId: string;
    sources: SourceReference[];
  };
  limitations: string[];
  relatedRecordIds: string[];
}

interface Catalogue {
  schema: "trusted-govuk-discovery.catalogue.v1";
  generatedAt: string;
  profile: "trusted-govuk-discovery.profile.v1";
  bundleDigest: string;
  sourceLocksDigest: string;
  records: DiscoveryRecord[];
}

export interface EvidenceReceipt {
  schema: "trusted-govuk-discovery.evidence-receipt.v1";
  id: string;
  observedAt: string;
  sourceLock: string;
  source: {
    url: string;
    title: string;
    publisher: string;
    sourceDigest: string;
  };
  output: {
    recordId: string;
    recordDigest: string;
    bundleDigest: string;
  };
  assertionStatuses: AssertionStatus[];
  limitations: string[];
  boundaries: {
    sourceWasNotRefetchedAtRuntime: true;
    cryptographicSignatureVerified: false;
    accessAuthorityGranted: false;
  };
  receiptDigest: string;
}

interface ModelContextTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonObject;
  annotations: { readOnlyHint: true; untrustedContentHint: true };
  execute: (input: unknown, options?: { signal?: AbortSignal }) => Promise<JsonObject>;
}

interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: { signal?: AbortSignal },
  ): Promise<void> | void;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const QUERY_MAX = 160;
const RESULT_LIMIT_MAX = 20;
const RECORD_ID = /^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/u;
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
const SEARCH_KEYS = new Set(["query", "resourceTypes", "publishers", "accessStatuses", "limit"]);
const RECORD_KEYS = new Set(["recordId"]);

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser cannot verify the catalogue checksum.");
  }
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseChecksum(value: string, filename: string): string {
  const escaped = filename.replace(".", "\\.");
  const match = value.trim().match(new RegExp(`^([a-f0-9]{64})(?:\\s+\\*?${escaped})?$`, "u"));
  if (!match) throw new Error(`The ${filename} checksum file is invalid.`);
  return match[1]!;
}

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
  if (url.protocol !== "https:" || url.username || url.password || !officialHost) {
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
    if (!allowed.has(key)) throw new Error(`Unknown input field: ${key}`);
  }
  return object;
}

function boundedString(value: unknown, name: string, maximum: number): string {
  if (typeof value !== "string") throw new Error(`${name} must be a string.`);
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
    if (!output.includes(item as T)) output.push(item as T);
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
  if (catalogue === null || typeof catalogue !== "object" || Array.isArray(catalogue)) {
    throw new Error("The catalogue root must be an object.");
  }
  const candidate = catalogue as Partial<Catalogue>;
  if (
    candidate.schema !== "trusted-govuk-discovery.catalogue.v1" ||
    candidate.profile !== "trusted-govuk-discovery.profile.v1"
  ) {
    throw new Error("The catalogue schema or profile is unsupported.");
  }
  if (
    !SHA256.test(candidate.bundleDigest ?? "") ||
    !SHA256.test(candidate.sourceLocksDigest ?? "") ||
    !Array.isArray(candidate.records)
  ) {
    throw new Error("The catalogue bundle binding is invalid.");
  }
  if (candidate.records.length < 30 || candidate.records.length > 80) {
    throw new Error("The reviewed catalogue must contain from 30 to 80 records.");
  }

  const identifiers = new Set<string>();
  const recordDigests: string[] = [];
  for (const record of candidate.records) {
    if (!RECORD_ID.test(record.id) || identifiers.has(record.id)) {
      throw new Error("A catalogue record identifier is invalid or duplicated.");
    }
    identifiers.add(record.id);
    if (!RESOURCE_TYPES.has(record.resourceType) || !ACCESS_STATUSES.has(record.access.status)) {
      throw new Error(`Record ${record.id} has an unsupported type or access state.`);
    }
    if (!record.title || !record.description || !record.publisher || !DATE_TIME.test(record.dates.observed)) {
      throw new Error(`Record ${record.id} is missing required source metadata.`);
    }
    safePublicUrl(record.canonicalHumanUrl, "Authoritative human URL");
    for (const [label, value] of [
      ["Documentation URL", record.documentationUrl],
      ["Machine endpoint", record.machineEndpoint],
      ["API Catalogue URL", record.apiCatalogueUrl],
      ["Licence URL", record.licence.url],
      ["Access evidence URL", record.access.evidenceUrl],
    ] as Array<[string, string | undefined]>) {
      if (value) safePublicUrl(value, label);
    }
    for (const source of record.provenance.sources) safePublicUrl(source.url, "Provenance source URL");
    for (const assertion of record.assertions) {
      for (const url of assertion.evidenceUrls) safePublicUrl(url, "Assertion evidence URL");
    }
    if (!record.limitations.length || !record.assertions.length || !record.provenance.sources.length) {
      throw new Error(`Record ${record.id} has incomplete assertion, source or limitation evidence.`);
    }
    if (!SHA256.test(record.provenance.sourceDigest)) {
      throw new Error(`Record ${record.id} has an invalid source digest.`);
    }
    const observedRecordDigest = await sha256Hex(canonicalJson(recordDigestInput(record)));
    if (record.provenance.recordDigest !== observedRecordDigest) {
      throw new Error(`Record ${record.id} has an invalid record digest.`);
    }
    if (record.provenance.bundleDigest !== candidate.bundleDigest) {
      throw new Error(`Record ${record.id} is not bound to this catalogue.`);
    }
    recordDigests.push(observedRecordDigest);
  }

  for (const record of candidate.records) {
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
  return candidate as Catalogue;
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
  for (const candidate of value as EvidenceReceipt[]) {
    const record = records.get(candidate.output?.recordId);
    if (
      candidate.schema !== "trusted-govuk-discovery.evidence-receipt.v1" ||
      !record ||
      receipts.has(candidate.id)
    ) {
      throw new Error("An evidence receipt is unsupported, duplicated or has no record.");
    }
    safePublicUrl(candidate.source.url, "Receipt source URL");
    if (
      candidate.id !== record.provenance.evidenceReceiptId ||
      candidate.output.recordDigest !== record.provenance.recordDigest ||
      candidate.output.bundleDigest !== catalogue.bundleDigest ||
      candidate.source.sourceDigest !== record.provenance.sourceDigest
    ) {
      throw new Error(`Receipt ${candidate.id} is not bound to its record and bundle.`);
    }
    const observedReceiptDigest = await sha256Hex(canonicalJson(receiptDigestInput(candidate)));
    if (candidate.receiptDigest !== observedReceiptDigest) {
      throw new Error(`Receipt ${candidate.id} has an invalid digest.`);
    }
    receipts.set(candidate.id, candidate);
  }
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
    licenceTitle: record.licence.title,
    lastObserved: record.dates.observed,
    assertionStatuses: [...new Set(record.assertions.map(({ status }) => status))].sort(),
    canonicalHumanUrl: safePublicUrl(record.canonicalHumanUrl, "Authoritative human URL"),
    documentationUrl: record.documentationUrl,
    apiCatalogueUrl: record.apiCatalogueUrl,
    recordDigest: record.provenance.recordDigest,
    bundleDigest: record.provenance.bundleDigest,
    evidenceReceiptId: record.provenance.evidenceReceiptId,
    limitations: record.limitations.slice(0, 8),
    match: match ? {
      score: match.score,
      matchedFields: match.matchedFields,
      explanation: `Matched normalised query terms in: ${match.matchedFields.join(", ")}.`,
    } : undefined,
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
  search(input: unknown): Promise<JsonObject>;
  getRecord(input: unknown): Promise<JsonObject>;
  showProvenance(input: unknown): Promise<JsonObject>;
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
        const publishers = rawPublishers === undefined ? [] : (rawPublishers as unknown[])
          .map((publisher, index) => boundedString(publisher, `publishers[${index}]`, 100));
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
        if (!RECORD_ID.test(recordId)) throw new Error("recordId has an invalid format.");
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
        if (!RECORD_ID.test(recordId)) throw new Error("recordId has an invalid format.");
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
          sourceLock: record.provenance.sourceLock,
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

async function loadRuntime(signal: AbortSignal): Promise<KnowledgeDiscoveryRuntime> {
  const paths = ["catalogue.json", "catalogue.json.sha256", "receipts.json", "receipts.json.sha256"];
  const responses = await Promise.all(paths.map((path) =>
    fetch(`./data/${path}`, { cache: "no-store", credentials: "omit", signal })));
  if (responses.some((response) => !response.ok)) {
    throw new Error("The same-origin catalogue or receipt collection could not be loaded.");
  }
  const [rawCatalogue, rawCatalogueChecksum, rawReceipts, rawReceiptsChecksum] =
    await Promise.all(responses.map((response) => response.text()));
  return createKnowledgeDiscoveryRuntime(rawCatalogue!, rawCatalogueChecksum!, rawReceipts!, rawReceiptsChecksum!);
}

const recordInputSchema: JsonObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    recordId: { type: "string", minLength: 3, maxLength: 128, pattern: "^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$" },
  },
  required: ["recordId"],
};

export async function initialiseKnowledgeDiscovery(): Promise<{
  runtime: KnowledgeDiscoveryRuntime;
  registration: "registered" | "unavailable";
}> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 10000);
  try {
    const runtime = await loadRuntime(controller.signal);
    if (!document.modelContext?.registerTool) return { runtime, registration: "unavailable" };
    const annotations = { readOnlyHint: true, untrustedContentHint: true } as const;
    await document.modelContext.registerTool({
      name: "search_government_knowledge",
      title: "Search government knowledge",
      description: "Search this page's verified, read-only GOV.UK metadata catalogue. Returns authoritative human links, assertion labels and limitations. It does not contact providers or establish access rights.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string", minLength: 1, maxLength: QUERY_MAX },
          resourceTypes: { type: "array", maxItems: 7, uniqueItems: true, items: { type: "string", enum: [...RESOURCE_TYPES] } },
          publishers: { type: "array", maxItems: 8, uniqueItems: true, items: { type: "string", minLength: 1, maxLength: 100 } },
          accessStatuses: { type: "array", maxItems: 5, uniqueItems: true, items: { type: "string", enum: [...ACCESS_STATUSES] } },
          limit: { type: "integer", minimum: 1, maximum: RESULT_LIMIT_MAX, default: 8 },
        },
        required: ["query"],
      },
      annotations,
      execute: (input) => runtime.search(input),
    }, { signal: controller.signal });
    await document.modelContext.registerTool({
      name: "get_resource_record",
      title: "Get a government resource record",
      description: "Return one exact digest-bound record, including authoritative links, access and licence status, assertions and limitations. It grants no access authority.",
      inputSchema: recordInputSchema,
      annotations,
      execute: (input) => runtime.getRecord(input),
    }, { signal: controller.signal });
    await document.modelContext.registerTool({
      name: "show_provenance",
      title: "Show record provenance",
      description: "Inspect the packaged source, assertion and digest evidence for one record. It does not refetch or independently certify the source.",
      inputSchema: recordInputSchema,
      annotations,
      execute: (input) => runtime.showProvenance(input),
    }, { signal: controller.signal });
    return { runtime, registration: "registered" };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Catalogue startup timed out after 10 seconds.");
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
