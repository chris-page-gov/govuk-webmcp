/**
 * Trusted GOV.UK Knowledge Discovery — competition WebMCP tools.
 *
 * Current WebMCP drafts define inputSchema but not outputSchema on the
 * ModelContextTool Web IDL. Output schemas are maintained separately and the
 * returned values are validated by application code and tests.
 *
 * The tools are:
 * - read-only;
 * - page-scoped;
 * - deterministic over a same-origin, checksum-verified metadata bundle;
 * - visibly equivalent to the human interface;
 * - explicitly marked as returning untrusted source-derived content.
 */

type JsonObject = Record<string, unknown>;

type AccessStatus =
  | "public"
  | "restricted"
  | "authentication-required"
  | "access-not-established"
  | "not-applicable";

type AssertionStatus =
  | "official-source"
  | "normalised"
  | "inferred"
  | "model-derived";

type ResourceType =
  | "govuk-content"
  | "dataset"
  | "api"
  | "api-documentation"
  | "catalogue-record"
  | "organisation"
  | "guidance";

interface SourceReference {
  url: string;
  title: string;
  publisher: string;
  observedAt: string;
  digest?: string;
}

interface FieldAssertion {
  field: string;
  status: AssertionStatus;
  evidenceUrls: string[];
  note?: string;
}

interface DiscoveryRecord {
  id: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  publisher: string;
  steward?: string;
  topics: string[];
  canonicalHumanUrl?: string;
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
    note?: string;
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
    sourceDigest?: string;
    recordDigest: string;
    bundleDigest: string;
    evidenceReceiptId?: string;
    sources: SourceReference[];
  };
  limitations: string[];
  relatedRecordIds: string[];
}

interface Catalogue {
  schema: "trusted-govuk-discovery.catalogue.v1";
  generatedAt: string;
  bundleDigest: string;
  records: DiscoveryRecord[];
}

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonObject;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (
    input: JsonObject,
    options: { signal: AbortSignal },
  ) => Promise<unknown>;
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
const RECORD_ID = /^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$/;
const ALLOWED_KEYS = {
  search: new Set(["query", "resourceTypes", "publishers", "accessStatuses", "limit"]),
  get: new Set(["recordId"]),
  provenance: new Set(["recordId"]),
} as const;

function errorResult(
  code: string,
  message: string,
  details: JsonObject = {},
): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code, message, details },
    limitations: [
      "No substitute source was selected.",
      "No external provider was contacted.",
    ],
  };
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
  const normalised = value.trim().replace(/\s+/g, " ");
  if (!normalised) throw new Error(`${name} must not be empty.`);
  if (normalised.length > maximum) {
    throw new Error(`${name} must be at most ${maximum} characters.`);
  }
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

function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only HTTP(S) source links are permitted.");
  }
  if (url.username || url.password) throw new Error("Credential-bearing URLs are forbidden.");
  return url.toString();
}

function words(value: string): string[] {
  return value.toLocaleLowerCase("en-GB").split(/[^a-z0-9]+/u).filter(Boolean);
}

function scoreRecord(record: DiscoveryRecord, query: string): {
  score: number;
  matchedFields: string[];
} {
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

function publicSummary(record: DiscoveryRecord, match?: {
  score: number;
  matchedFields: string[];
}): JsonObject {
  return {
    recordId: record.id,
    title: record.title,
    description: record.description,
    resourceType: record.resourceType,
    publisher: record.publisher,
    accessStatus: record.access.status,
    licenceStatus: record.licence.status,
    licenceTitle: record.licence.title,
    lastObserved: record.dates.observed,
    assertionStatuses: [...new Set(record.assertions.map((a) => a.status))].sort(),
    canonicalHumanUrl: safeHttpUrl(record.canonicalHumanUrl),
    documentationUrl: safeHttpUrl(record.documentationUrl),
    apiCatalogueUrl: safeHttpUrl(record.apiCatalogueUrl),
    recordDigest: record.provenance.recordDigest,
    evidenceReceiptId: record.provenance.evidenceReceiptId,
    limitations: record.limitations.slice(0, 8),
    match: match
      ? {
          score: match.score,
          matchedFields: match.matchedFields,
          explanation:
            match.matchedFields.length > 0
              ? `Matched normalised query terms in: ${match.matchedFields.join(", ")}.`
              : "No lexical match.",
        }
      : undefined,
  };
}

function validateCatalogue(catalogue: Catalogue): void {
  if (catalogue.schema !== "trusted-govuk-discovery.catalogue.v1") {
    throw new Error("Unsupported catalogue schema.");
  }
  if (!/^[a-f0-9]{64}$/u.test(catalogue.bundleDigest)) {
    throw new Error("Catalogue bundle digest is absent or invalid.");
  }
  const ids = new Set<string>();
  for (const record of catalogue.records) {
    if (!RECORD_ID.test(record.id) || ids.has(record.id)) {
      throw new Error("Catalogue record identity is invalid or duplicated.");
    }
    ids.add(record.id);
    if (!/^[a-f0-9]{64}$/u.test(record.provenance.recordDigest)) {
      throw new Error(`Record ${record.id} has no valid record digest.`);
    }
    if (record.provenance.bundleDigest !== catalogue.bundleDigest) {
      throw new Error(`Record ${record.id} is not bound to this catalogue.`);
    }
    for (const candidate of [
      record.canonicalHumanUrl,
      record.documentationUrl,
      record.machineEndpoint,
      record.apiCatalogueUrl,
      record.licence.url,
      record.access.evidenceUrl,
      ...record.provenance.sources.map((s) => s.url),
    ]) {
      if (candidate) safeHttpUrl(candidate);
    }
  }
}

function parseSha256File(value: string): string {
  const match = value.trim().match(/^([a-f0-9]{64})(?:\s+\*?catalogue\.json)?$/u);
  if (!match) throw new Error("Catalogue checksum file is invalid.");
  return match[1];
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser cannot verify the catalogue checksum.");
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function loadCatalogue(signal: AbortSignal): Promise<Catalogue> {
  const [catalogueResponse, checksumResponse] = await Promise.all([
    fetch("./data/catalogue.json", {
      credentials: "omit",
      cache: "no-store",
      signal,
    }),
    fetch("./data/catalogue.json.sha256", {
      credentials: "omit",
      cache: "no-store",
      signal,
    }),
  ]);

  if (!catalogueResponse.ok) {
    throw new Error(`Catalogue load failed with HTTP ${catalogueResponse.status}.`);
  }
  if (!checksumResponse.ok) {
    throw new Error(`Catalogue checksum load failed with HTTP ${checksumResponse.status}.`);
  }

  const [rawCatalogue, checksumText] = await Promise.all([
    catalogueResponse.text(),
    checksumResponse.text(),
  ]);
  const expectedDigest = parseSha256File(checksumText);
  const observedDigest = await sha256Hex(rawCatalogue);
  if (observedDigest !== expectedDigest) {
    throw new Error("Catalogue checksum does not match the published bytes.");
  }

  let catalogue: Catalogue;
  try {
    catalogue = JSON.parse(rawCatalogue) as Catalogue;
  } catch {
    throw new Error("Catalogue is not valid JSON.");
  }
  validateCatalogue(catalogue);
  return catalogue;
}

export async function searchGovernmentKnowledge(
  input: JsonObject,
  options: { signal: AbortSignal },
): Promise<JsonObject> {
  try {
    const object = ensurePlainObject(input, ALLOWED_KEYS.search);
    const query = boundedString(object.query, "query", QUERY_MAX);
    const resourceTypes = enumArray<ResourceType>(
      object.resourceTypes,
      "resourceTypes",
      new Set<ResourceType>([
        "govuk-content",
        "dataset",
        "api",
        "api-documentation",
        "catalogue-record",
        "organisation",
        "guidance",
      ]),
      7,
    );
    const accessStatuses = enumArray<AccessStatus>(
      object.accessStatuses,
      "accessStatuses",
      new Set<AccessStatus>([
        "public",
        "restricted",
        "authentication-required",
        "access-not-established",
        "not-applicable",
      ]),
      5,
    );
    const rawPublishers = object.publishers;
    if (
      rawPublishers !== undefined &&
      (!Array.isArray(rawPublishers) || rawPublishers.length > 8)
    ) {
      throw new Error("publishers must contain at most eight strings.");
    }
    const publishers = rawPublishers === undefined
      ? []
      : (rawPublishers as unknown[]).map((publisher, index) =>
          boundedString(publisher, `publishers[${index}]`, 100),
        );
    const limit = integerLimit(object.limit);

    const catalogue = await loadCatalogue(options.signal);
    const ranked = catalogue.records
      .filter((record) => !resourceTypes.length || resourceTypes.includes(record.resourceType))
      .filter((record) => !accessStatuses.length || accessStatuses.includes(record.access.status))
      .filter(
        (record) =>
          !publishers.length ||
          publishers.some((p) => p.toLocaleLowerCase("en-GB") === record.publisher.toLocaleLowerCase("en-GB")),
      )
      .map((record) => ({ record, match: scoreRecord(record, query) }))
      .filter(({ match }) => match.score > 0)
      .sort(
        (a, b) =>
          b.match.score - a.match.score ||
          a.record.title.localeCompare(b.record.title, "en-GB") ||
          a.record.id.localeCompare(b.record.id, "en-GB"),
      );

    return {
      schema: "trusted-govuk-discovery.search-result.v1",
      ok: true,
      query,
      catalogue: {
        generatedAt: catalogue.generatedAt,
        bundleDigest: catalogue.bundleDigest,
        recordCount: catalogue.records.length,
      },
      totalMatches: ranked.length,
      returned: Math.min(ranked.length, limit),
      truncated: ranked.length > limit,
      results: ranked.slice(0, limit).map(({ record, match }) => publicSummary(record, match)),
      boundaries: {
        pageScoped: true,
        readOnly: true,
        providerCall: false,
        durableReceiptCreated: false,
        sourceDerivedContentIsUntrusted: true,
      },
    };
  } catch (error) {
    return errorResult(
      "invalid_search_request",
      error instanceof Error ? error.message : "Search failed.",
    );
  }
}

export async function getResourceRecord(
  input: JsonObject,
  options: { signal: AbortSignal },
): Promise<JsonObject> {
  try {
    const object = ensurePlainObject(input, ALLOWED_KEYS.get);
    const recordId = boundedString(object.recordId, "recordId", 128);
    if (!RECORD_ID.test(recordId)) throw new Error("recordId has an invalid format.");

    const catalogue = await loadCatalogue(options.signal);
    const record = catalogue.records.find((candidate) => candidate.id === recordId);
    if (!record) return errorResult("record_not_found", "No exact catalogue record was found.", { recordId });

    const verified =
      Boolean(record.provenance.recordDigest) &&
      Boolean(record.provenance.bundleDigest) &&
      record.provenance.bundleDigest === catalogue.bundleDigest;

    return {
      schema: "trusted-govuk-discovery.resource-record-result.v1",
      ok: true,
      verificationStatus: verified ? "digest-bound" : "unverified",
      record: {
        ...record,
        canonicalHumanUrl: safeHttpUrl(record.canonicalHumanUrl),
        documentationUrl: safeHttpUrl(record.documentationUrl),
        machineEndpoint: safeHttpUrl(record.machineEndpoint),
        apiCatalogueUrl: safeHttpUrl(record.apiCatalogueUrl),
      },
      boundaries: {
        pageScoped: true,
        readOnly: true,
        providerCall: false,
        accessAuthorityGranted: false,
        sourceDerivedContentIsUntrusted: true,
      },
    };
  } catch (error) {
    return errorResult(
      "invalid_record_request",
      error instanceof Error ? error.message : "Record lookup failed.",
    );
  }
}

export async function showProvenance(
  input: JsonObject,
  options: { signal: AbortSignal },
): Promise<JsonObject> {
  try {
    const object = ensurePlainObject(input, ALLOWED_KEYS.provenance);
    const recordId = boundedString(object.recordId, "recordId", 128);
    if (!RECORD_ID.test(recordId)) throw new Error("recordId has an invalid format.");

    const catalogue = await loadCatalogue(options.signal);
    const record = catalogue.records.find((candidate) => candidate.id === recordId);
    if (!record) return errorResult("record_not_found", "No exact catalogue record was found.", { recordId });

    const digestBound =
      /^[a-f0-9]{64}$/u.test(record.provenance.recordDigest) &&
      record.provenance.bundleDigest === catalogue.bundleDigest;

    return {
      schema: "trusted-govuk-discovery.provenance-result.v1",
      ok: true,
      recordId,
      status: digestBound ? "digest-bound" : "unverified",
      observationDate: record.dates.observed,
      extractionMethod: record.provenance.extractionMethod,
      sourceDigest: record.provenance.sourceDigest,
      recordDigest: record.provenance.recordDigest,
      bundleDigest: catalogue.bundleDigest,
      evidenceReceiptId: record.provenance.evidenceReceiptId,
      sources: record.provenance.sources.map((source) => ({
        ...source,
        url: safeHttpUrl(source.url),
      })),
      fieldAssertions: record.assertions,
      limitations: record.limitations,
      boundaries: {
        receiptInspectedOnly: true,
        sourceWasNotRefetched: true,
        cryptographicSignatureVerified: false,
        sourceDerivedContentIsUntrusted: true,
      },
    };
  } catch (error) {
    return errorResult(
      "invalid_provenance_request",
      error instanceof Error ? error.message : "Provenance lookup failed.",
    );
  }
}

export async function registerTrustedGovukDiscoveryTools(): Promise<AbortController | null> {
  if (!document.modelContext?.registerTool) return null;

  const controller = new AbortController();
  const sharedAnnotations = {
    readOnlyHint: true,
    untrustedContentHint: true,
  };

  await document.modelContext.registerTool(
    {
      name: "search_government_knowledge",
      title: "Search government knowledge",
      description:
        "Search this page's validated, read-only metadata bundle for GOV.UK content, public-sector datasets and APIs. Returns source-derived metadata, match reasons, authoritative human links and limitations. It does not contact providers or establish access rights.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string", minLength: 1, maxLength: QUERY_MAX },
          resourceTypes: {
            type: "array",
            maxItems: 7,
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "govuk-content",
                "dataset",
                "api",
                "api-documentation",
                "catalogue-record",
                "organisation",
                "guidance",
              ],
            },
          },
          publishers: {
            type: "array",
            maxItems: 8,
            uniqueItems: true,
            items: { type: "string", minLength: 1, maxLength: 100 },
          },
          accessStatuses: {
            type: "array",
            maxItems: 5,
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "public",
                "restricted",
                "authentication-required",
                "access-not-established",
                "not-applicable",
              ],
            },
          },
          limit: { type: "integer", minimum: 1, maximum: RESULT_LIMIT_MAX, default: 8 },
        },
        required: ["query"],
      },
      annotations: sharedAnnotations,
      execute: searchGovernmentKnowledge,
    },
    { signal: controller.signal },
  );

  await document.modelContext.registerTool(
    {
      name: "get_resource_record",
      title: "Get a government resource record",
      description:
        "Return one exact metadata record from this page's validated bundle, including authoritative human links, access and licence status, assertion labels, provenance and limitations. It does not dereference the endpoint or grant access.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          recordId: {
            type: "string",
            minLength: 3,
            maxLength: 128,
            pattern: "^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$",
          },
        },
        required: ["recordId"],
      },
      annotations: sharedAnnotations,
      execute: getResourceRecord,
    },
    { signal: controller.signal },
  );

  await document.modelContext.registerTool(
    {
      name: "show_provenance",
      title: "Show record provenance",
      description:
        "Inspect the evidence and digest chain already packaged for one record. Returns sources, observation date, assertion status and limitations. It does not refetch or independently certify the source.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          recordId: {
            type: "string",
            minLength: 3,
            maxLength: 128,
            pattern: "^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$",
          },
        },
        required: ["recordId"],
      },
      annotations: sharedAnnotations,
      execute: showProvenance,
    },
    { signal: controller.signal },
  );

  return controller;
}
