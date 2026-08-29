/**
 * One page-scoped, read-only WebMCP search slice over a verified catalogue.
 * Source-derived strings are untrusted data and must be rendered as text.
 */

export type JsonObject = Record<string, unknown>;

type AssertionStatus = "official-source" | "normalised" | "inferred";

interface DiscoveryRecord {
  id: string;
  title: string;
  description: string;
  resourceType: "govuk-content" | "dataset" | "api" | "guidance";
  publisher: string;
  topics: string[];
  canonicalHumanUrl: string;
  access: {
    status: "public" | "restricted" | "authentication-required" | "access-not-established";
    note: string;
  };
  licence: {
    status: "confirmed" | "missing" | "conflicting" | "not-applicable";
    title?: string;
    url?: string;
  };
  dates: { observed: string };
  assertions: Array<{
    field: string;
    status: AssertionStatus;
    evidenceUrls: string[];
    note?: string;
  }>;
  provenance: {
    extractionMethod: string;
    recordDigest: string;
    bundleDigest: string;
    evidenceReceiptId: string;
    sources: Array<{
      url: string;
      title: string;
      publisher: string;
      observedAt: string;
    }>;
  };
  limitations: string[];
}

interface Catalogue {
  schema: "trusted-govuk-discovery.catalogue.v1";
  generatedAt: string;
  bundleDigest: string;
  records: DiscoveryRecord[];
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
const RESULT_LIMIT = 8;
const RECORD_ID = /^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const SEARCH_KEYS = new Set(["query"]);

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
    .join(",")}}`;
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

function parseChecksum(value: string): string {
  const match = value.trim().match(/^([a-f0-9]{64})(?:\s+\*?catalogue\.json)?$/u);
  if (!match) throw new Error("The catalogue checksum file is invalid.");
  return match[1]!;
}

function safeAuthoritativeUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("An authoritative source link is missing.");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.hostname !== "www.gov.uk") {
    throw new Error("Authoritative links must be credential-free HTTPS URLs on www.gov.uk.");
  }
  return url.toString();
}

function recordDigestInput(record: DiscoveryRecord): JsonObject {
  const copy = structuredClone(record) as DiscoveryRecord;
  const provenance = copy.provenance as unknown as JsonObject;
  delete provenance.recordDigest;
  delete provenance.bundleDigest;
  delete provenance.evidenceReceiptId;
  return copy as unknown as JsonObject;
}

async function validateCatalogue(catalogue: unknown): Promise<Catalogue> {
  if (catalogue === null || typeof catalogue !== "object" || Array.isArray(catalogue)) {
    throw new Error("The catalogue root must be an object.");
  }
  const candidate = catalogue as Partial<Catalogue>;
  if (candidate.schema !== "trusted-govuk-discovery.catalogue.v1") {
    throw new Error("The catalogue schema is unsupported.");
  }
  if (!SHA256.test(candidate.bundleDigest ?? "") || !Array.isArray(candidate.records)) {
    throw new Error("The catalogue bundle binding is invalid.");
  }
  if (candidate.records.length < 1 || candidate.records.length > 8) {
    throw new Error("The first-slice catalogue must contain from one to eight records.");
  }

  const identifiers = new Set<string>();
  const recordDigests: string[] = [];
  for (const record of candidate.records) {
    if (!RECORD_ID.test(record.id) || identifiers.has(record.id)) {
      throw new Error("A catalogue record identifier is invalid or duplicated.");
    }
    identifiers.add(record.id);
    safeAuthoritativeUrl(record.canonicalHumanUrl);
    for (const source of record.provenance.sources) safeAuthoritativeUrl(source.url);
    if (!record.limitations.length || !record.assertions.length) {
      throw new Error(`Record ${record.id} has no assertion or limitation evidence.`);
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

  const observedBundleDigest = await sha256Hex(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: recordDigests.sort(),
  }));
  if (candidate.bundleDigest !== observedBundleDigest) {
    throw new Error("The catalogue bundle digest is invalid.");
  }
  return candidate as Catalogue;
}

function validateSearchInput(input: unknown): string {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.getPrototypeOf(input) !== Object.prototype
  ) {
    throw new Error("Input must be a plain JSON object.");
  }
  const object = input as JsonObject;
  for (const key of Object.keys(object)) {
    if (!SEARCH_KEYS.has(key)) throw new Error(`Unknown input field: ${key}`);
  }
  if (typeof object.query !== "string") throw new Error("query must be a string.");
  const query = object.query.trim().replace(/\s+/gu, " ");
  if (!query) throw new Error("query must not be empty.");
  if (query.length > QUERY_MAX) throw new Error(`query must be at most ${QUERY_MAX} characters.`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(query)) {
    throw new Error("query contains unsupported control characters.");
  }
  return query;
}

function words(value: string): string[] {
  return value.toLocaleLowerCase("en-GB").split(/[^a-z0-9]+/u).filter(Boolean);
}

function errorResult(message: string): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code: "invalid_search_request", message, details: {} },
    limitations: [
      "No substitute source was selected.",
      "No external provider was contacted.",
    ],
  };
}

function resultFor(record: DiscoveryRecord, score: number): JsonObject {
  return {
    recordId: record.id,
    title: record.title,
    description: record.description,
    resourceType: record.resourceType,
    publisher: record.publisher,
    canonicalHumanUrl: safeAuthoritativeUrl(record.canonicalHumanUrl),
    accessStatus: record.access.status,
    accessNote: record.access.note,
    licenceStatus: record.licence.status,
    licenceTitle: record.licence.title,
    assertionStatuses: [...new Set(record.assertions.map(({ status }) => status))].sort(),
    limitations: record.limitations,
    recordDigest: record.provenance.recordDigest,
    bundleDigest: record.provenance.bundleDigest,
    match: { score },
  };
}

export interface KnowledgeDiscoveryRuntime {
  bundleDigest: string;
  search(input: unknown): Promise<JsonObject>;
}

export async function createKnowledgeDiscoveryRuntime(
  rawCatalogue: string,
  rawChecksum: string,
): Promise<KnowledgeDiscoveryRuntime> {
  const expectedChecksum = parseChecksum(rawChecksum);
  const observedChecksum = await sha256Hex(rawCatalogue);
  if (expectedChecksum !== observedChecksum) {
    throw new Error("The catalogue checksum does not match the same-origin fixture bytes.");
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(rawCatalogue);
  } catch {
    throw new Error("The catalogue is not valid JSON.");
  }
  const catalogue = await validateCatalogue(decoded);

  return {
    bundleDigest: catalogue.bundleDigest,
    async search(input: unknown): Promise<JsonObject> {
      try {
        const query = validateSearchInput(input);
        const terms = [...new Set(words(query))].slice(0, 12);
        const ranked = catalogue.records
          .map((record) => {
            const searchable = words([
              record.title,
              record.description,
              record.publisher,
              record.topics.join(" "),
            ].join(" "));
            const score = terms.reduce(
              (total, term) => total + (searchable.includes(term) ? 1 : 0),
              0,
            );
            return { record, score };
          })
          .filter(({ score }) => score > 0)
          .sort((left, right) =>
            right.score - left.score ||
            left.record.title.localeCompare(right.record.title, "en-GB") ||
            left.record.id.localeCompare(right.record.id, "en-GB"))
          .slice(0, RESULT_LIMIT);

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
          returned: ranked.length,
          truncated: false,
          results: ranked.map(({ record, score }) => resultFor(record, score)),
          boundaries: {
            pageScoped: true,
            readOnly: true,
            providerCall: false,
            durableReceiptCreated: false,
            sourceDerivedContentIsUntrusted: true,
          },
        };
      } catch (error) {
        return errorResult(error instanceof Error ? error.message : "Search failed.");
      }
    },
  };
}

async function loadRuntime(signal: AbortSignal): Promise<KnowledgeDiscoveryRuntime> {
  const [catalogueResponse, checksumResponse] = await Promise.all([
    fetch("./data/catalogue.json", { cache: "no-store", credentials: "omit", signal }),
    fetch("./data/catalogue.json.sha256", { cache: "no-store", credentials: "omit", signal }),
  ]);
  if (!catalogueResponse.ok || !checksumResponse.ok) {
    throw new Error("The same-origin catalogue fixture could not be loaded.");
  }
  return createKnowledgeDiscoveryRuntime(
    await catalogueResponse.text(),
    await checksumResponse.text(),
  );
}

export async function initialiseKnowledgeDiscovery(): Promise<{
  runtime: KnowledgeDiscoveryRuntime;
  registration: "registered" | "unavailable";
}> {
  const controller = new AbortController();
  const runtime = await loadRuntime(controller.signal);
  if (!document.modelContext?.registerTool) {
    return { runtime, registration: "unavailable" };
  }
  await document.modelContext.registerTool(
    {
      name: "search_government_knowledge",
      title: "Search government knowledge",
      description:
        "Search this page's verified, read-only GOV.UK metadata fixture. Returns authoritative human links, assertion labels and limitations. It does not contact providers or establish access rights.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string", minLength: 1, maxLength: QUERY_MAX },
        },
        required: ["query"],
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (input) => runtime.search(input),
    },
    { signal: controller.signal },
  );
  return { runtime, registration: "registered" };
}
