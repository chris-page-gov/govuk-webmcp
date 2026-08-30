import type { DiscoveryRecord, JsonObject } from "./contracts.js";
import { canonicalJson, isRfc3339DateTime, parseChecksum, sha256Hex } from "./integrity.js";

type NodeKind = "answer" | "claim" | "source" | "transformation" | "check" | "limitation";
type EdgeRelation = "supports" | "derived-through" | "verifies" | "qualifies";

export interface EvidenceTraceNode extends JsonObject {
  id: string;
  kind: NodeKind;
  label: string;
  statement: string;
  recordId?: string;
  url?: string;
  facets: JsonObject;
}

export interface EvidenceTraceEdge extends JsonObject {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
  label: string;
}

export interface EvidenceTrace extends JsonObject {
  schema: "trusted-govuk-discovery.evidence-trace.v1";
  id: string;
  question: string;
  answerSummary: string;
  scope: string;
  claimIds: string[];
  nodes: EvidenceTraceNode[];
  edges: EvidenceTraceEdge[];
  traceDigest: string;
  boundaries: JsonObject;
}

interface EvidenceTraceCollection {
  schema: "trusted-govuk-discovery.evidence-trace-collection.v1";
  generatedAt: string;
  catalogueBundleDigest: string;
  answerPackSourceDigest: string;
  traces: EvidenceTrace[];
  collectionDigest: string;
}

const SHA256 = /^[a-f0-9]{64}$/u;
const ANSWER_ID = /^answer:[a-z0-9][a-z0-9-]{2,88}$/u;
const CLAIM_ID = /^claim:[a-z0-9][a-z0-9-]{2,89}$/u;
const EDGE_ID = /^edge:[a-z0-9][a-z0-9:._-]+$/u;
const NODE_KINDS = new Set<NodeKind>(["answer", "claim", "source", "transformation", "check", "limitation"]);
const EDGE_RELATIONS = new Set<EdgeRelation>(["supports", "derived-through", "verifies", "qualifies"]);
const NODE_ID_BY_KIND: Readonly<Record<NodeKind, RegExp>> = {
  answer: ANSWER_ID,
  claim: CLAIM_ID,
  source: /^source:[a-z0-9][a-z0-9:._-]+$/u,
  transformation: /^transformation:[a-z0-9][a-z0-9:._-]+$/u,
  check: /^check:[a-z0-9][a-z0-9:._-]+$/u,
  limitation: /^limitation:[a-z0-9][a-z0-9:._-]+$/u,
};
const RELATION_ENDPOINT_KINDS: Readonly<Record<EdgeRelation, ReadonlySet<string>>> = {
  supports: new Set(["source:claim", "claim:answer"]),
  "derived-through": new Set(["transformation:claim"]),
  verifies: new Set(["check:source"]),
  qualifies: new Set(["limitation:answer", "limitation:claim"]),
};
const TRACE_KEYS = new Set(["schema", "id", "question", "answerSummary", "scope", "claimIds", "nodes", "edges", "traceDigest", "boundaries"]);
const NODE_KEYS = new Set(["id", "kind", "label", "statement", "recordId", "url", "facets"]);
const EDGE_KEYS = new Set(["id", "source", "target", "relation", "label"]);
const FACET_KEYS = new Set(["authority", "assertionStatus", "verification", "freshness", "integrity", "access", "rights", "coverage"]);
const BOUNDARY_KEYS = new Set(["canonicalNarrative", "pageScoped", "providerCall", "sourceRefetched", "eligibilityDecision", "singleTrustScore"]);
const COLLECTION_KEYS = new Set(["schema", "generatedAt", "catalogueBundleDigest", "answerPackSourceDigest", "traces", "collectionDigest"]);
const EXPLORE_KEYS = new Set(["answerId", "claimId"]);
const COMPARE_KEYS = new Set(["answerId", "claimIds"]);
const ASSERTION_STATUSES = new Set(["official-source", "normalised", "inferred", "model-derived", "not-applicable"]);
const VERIFICATION_STATUSES = new Set(["digest-bound", "source-linked", "authored-boundary", "not-applicable"]);
const FRESHNESS_STATUSES = new Set(["observed", "not-established", "not-applicable"]);
const INTEGRITY_STATUSES = new Set(["sha256-bound", "not-applicable"]);
const ACCESS_STATUSES = new Set(["public", "restricted", "authentication-required", "access-not-established", "not-applicable"]);
const RIGHTS_STATUSES = new Set(["confirmed", "missing", "conflicting", "not-applicable"]);
const COVERAGE_STATUSES = new Set(["bounded", "selected", "one-record", "not-applicable"]);

function exactObject(value: unknown, keys: ReadonlySet<string>, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain JSON object.`);
  }
  const object = value as JsonObject;
  for (const key of Object.keys(object)) {
    if (!keys.has(key)) throw new Error(`${label} contains an unknown field: ${key.slice(0, 80)}`);
  }
  return object;
}

function requiredString(value: unknown, label: string, maximum: number, minimum = 1): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum) {
    const length = minimum === 1
      ? `a non-empty string of at most ${maximum}`
      : `a string of ${minimum} to ${maximum}`;
    throw new Error(`${label} must be ${length} characters.`);
  }
  return value;
}

function optionalString(value: unknown, label: string, maximum: number): void {
  if (value !== undefined) requiredString(value, label, maximum);
}

function enumValue(value: unknown, allowed: ReadonlySet<string>, label: string): string {
  if (typeof value !== "string" || !allowed.has(value)) throw new Error(`${label} has an unsupported status.`);
  return value;
}

function dateTime(value: unknown, label: string): void {
  if (!isRfc3339DateTime(value)) throw new Error(`${label} must be a valid RFC 3339 date-time.`);
}

function safeOfficialUrl(value: unknown): string {
  const text = requiredString(value, "Evidence source URL", 2048);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error("An Evidence Trace source URL is malformed.");
  }
  const officialHost = url.hostname === "gov.uk" || url.hostname.endsWith(".gov.uk") || url.hostname === "data.police.uk";
  if (
    url.protocol !== "https:" || url.username || url.password || !officialHost ||
    url.toString() !== text || /%(?![a-fA-F0-9]{2})/u.test(text)
  ) {
    throw new Error("An Evidence Trace source URL is not an admitted credential-free official HTTPS URL.");
  }
  return url.toString();
}

function digestInput<T extends JsonObject>(value: T, field: string): T {
  const copy = structuredClone(value);
  delete copy[field];
  return copy;
}

function resultBoundaries(): JsonObject {
  return {
    presentationEffect: "transient-local-selection",
    catalogueMutation: false,
    storageWrite: false,
    providerCall: false,
    externalStateChange: false,
    sourceDerivedContentIsUntrusted: true,
    singleTrustScore: false,
  };
}

function errorResult(code: string, message: string, details: JsonObject = {}): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code, message, details },
    limitations: ["No substitute evidence was selected.", "No external provider was contacted."],
  };
}

function validateFacets(value: unknown, nodeId: string): void {
  const facets = exactObject(value, FACET_KEYS, `Facets for ${nodeId}`);
  for (const key of FACET_KEYS) {
    if (!(key in facets)) throw new Error(`Node ${nodeId} is missing the ${key} trust facet.`);
  }
  requiredString(facets.authority, `Authority for ${nodeId}`, 200);
  enumValue(facets.assertionStatus, ASSERTION_STATUSES, `Assertion status for ${nodeId}`);
  enumValue(facets.verification, VERIFICATION_STATUSES, `Verification status for ${nodeId}`);
  const freshness = exactObject(facets.freshness, new Set(["status", "observedAt", "note"]), `freshness facet for ${nodeId}`);
  enumValue(freshness.status, FRESHNESS_STATUSES, `Freshness for ${nodeId}`);
  if (freshness.status === "observed" && freshness.observedAt === undefined) {
    throw new Error(`Observed freshness for ${nodeId} requires an observation date.`);
  }
  if (freshness.observedAt !== undefined) dateTime(freshness.observedAt, `Observation date for ${nodeId}`);
  optionalString(freshness.note, `Freshness note for ${nodeId}`, 300);
  const integrity = exactObject(facets.integrity, new Set(["status", "digest", "note"]), `integrity facet for ${nodeId}`);
  enumValue(integrity.status, INTEGRITY_STATUSES, `Integrity for ${nodeId}`);
  if (integrity.status === "sha256-bound" && (typeof integrity.digest !== "string" || !SHA256.test(integrity.digest))) {
    throw new Error(`Digest-bound node ${nodeId} requires a valid integrity digest.`);
  }
  optionalString(integrity.note, `Integrity note for ${nodeId}`, 300);
  const access = exactObject(facets.access, new Set(["status", "note"]), `access facet for ${nodeId}`);
  enumValue(access.status, ACCESS_STATUSES, `Access for ${nodeId}`);
  requiredString(access.note, `Access note for ${nodeId}`, 400);
  const rights = exactObject(facets.rights, new Set(["status", "title", "note"]), `rights facet for ${nodeId}`);
  enumValue(rights.status, RIGHTS_STATUSES, `Rights for ${nodeId}`);
  optionalString(rights.title, `Rights title for ${nodeId}`, 200);
  requiredString(rights.note, `Rights note for ${nodeId}`, 400);
  const coverage = exactObject(facets.coverage, new Set(["status", "note"]), `coverage facet for ${nodeId}`);
  enumValue(coverage.status, COVERAGE_STATUSES, `Coverage for ${nodeId}`);
  requiredString(coverage.note, `Coverage note for ${nodeId}`, 400);
  if (integrity.digest !== undefined && (typeof integrity.digest !== "string" || !SHA256.test(integrity.digest))) {
    throw new Error(`Node ${nodeId} has an invalid integrity digest.`);
  }
}

function validateEdgeDomain(
  edge: EvidenceTraceEdge,
  source: EvidenceTraceNode,
  target: EvidenceTraceNode,
): void {
  const endpointKinds = `${source.kind}:${target.kind}`;
  if (!RELATION_ENDPOINT_KINDS[edge.relation].has(endpointKinds)) {
    throw new Error(
      `Evidence Trace edge ${edge.id} has invalid ${edge.relation} endpoint kinds: ${source.kind} -> ${target.kind}.`,
    );
  }
  if (
    (edge.relation === "supports" && source.kind === "source") ||
    edge.relation === "derived-through" ||
    edge.relation === "verifies"
  ) {
    if (source.recordId === undefined || source.recordId !== target.recordId) {
      throw new Error(`Evidence Trace edge ${edge.id} crosses catalogue record domains.`);
    }
  }
}

async function validateTrace(
  candidate: unknown,
  records: ReadonlyMap<string, DiscoveryRecord>,
): Promise<EvidenceTrace> {
  const trace = exactObject(candidate, TRACE_KEYS, "Evidence Trace") as unknown as EvidenceTrace;
  if (trace.schema !== "trusted-govuk-discovery.evidence-trace.v1" || !ANSWER_ID.test(trace.id)) {
    throw new Error("An Evidence Trace has an unsupported schema or identifier.");
  }
  requiredString(trace.question, `Question for ${trace.id}`, 200, 10);
  requiredString(trace.answerSummary, `Answer summary for ${trace.id}`, 500, 20);
  requiredString(trace.scope, `Scope for ${trace.id}`, 500, 20);
  const boundaries = exactObject(trace.boundaries, BOUNDARY_KEYS, `Boundaries for ${trace.id}`);
  if (
    boundaries.canonicalNarrative !== false || boundaries.pageScoped !== true ||
    boundaries.providerCall !== false || boundaries.sourceRefetched !== false ||
    boundaries.eligibilityDecision !== false || boundaries.singleTrustScore !== false
  ) {
    throw new Error(`Evidence Trace ${trace.id} crosses a declared runtime boundary.`);
  }
  if (!Array.isArray(trace.claimIds) || trace.claimIds.length < 2 || trace.claimIds.length > 6 ||
      trace.claimIds.some((id) => typeof id !== "string" || !CLAIM_ID.test(id)) ||
      new Set(trace.claimIds).size !== trace.claimIds.length) {
    throw new Error(`Evidence Trace ${trace.id} has invalid claim identifiers.`);
  }
  if (!Array.isArray(trace.nodes) || trace.nodes.length < 8 || trace.nodes.length > 40 ||
      !Array.isArray(trace.edges) || trace.edges.length < 7 || trace.edges.length > 64) {
    throw new Error(`Evidence Trace ${trace.id} exceeds its node or edge bounds.`);
  }
  if (!SHA256.test(trace.traceDigest)) throw new Error(`Evidence Trace ${trace.id} has an invalid digest format.`);
  const observedTraceDigest = await sha256Hex(canonicalJson(digestInput(trace, "traceDigest")));
  if (observedTraceDigest !== trace.traceDigest) throw new Error(`Evidence Trace ${trace.id} has an invalid digest.`);

  const nodes = new Map<string, EvidenceTraceNode>();
  for (const candidateNode of trace.nodes) {
    const node = exactObject(candidateNode, NODE_KEYS, "Evidence Trace node") as unknown as EvidenceTraceNode;
    const nodeId = requiredString(node.id, "Evidence Trace node identifier", 180);
    if (nodes.has(nodeId) || !NODE_KINDS.has(node.kind) || !NODE_ID_BY_KIND[node.kind].test(nodeId)) {
      throw new Error(`Evidence Trace ${trace.id} has an invalid or duplicate node.`);
    }
    requiredString(node.label, `Label for ${node.id}`, 160);
    requiredString(node.statement, `Statement for ${node.id}`, 600);
    validateFacets(node.facets, node.id);
    if (node.url !== undefined) safeOfficialUrl(node.url);
    if (node.recordId !== undefined) {
      const record = records.get(node.recordId);
      if (!record) throw new Error(`Node ${node.id} names an unknown catalogue record.`);
      const integrity = node.facets.integrity as JsonObject;
      if (integrity.digest !== record.provenance.recordDigest) {
        throw new Error(`Record-backed node ${node.id} does not match its catalogue record digest.`);
      }
      if (node.kind === "source") {
        if (safeOfficialUrl(node.url) !== safeOfficialUrl(record.canonicalHumanUrl)) {
          throw new Error(`Source node ${node.id} does not match its authoritative catalogue URL.`);
        }
        const evidenceField = node.statement === record.title ? "title" : node.statement === record.description ? "description" : undefined;
        if (!evidenceField || !record.assertions.some(({ field, status }) => field === evidenceField && status === "official-source")) {
          throw new Error(`Source node ${node.id} is not bound to an official title or description assertion.`);
        }
      }
    }
    if (node.kind === "source" && node.recordId === undefined) {
      throw new Error(`Source node ${node.id} is not bound to a catalogue record.`);
    }
    if (node.kind !== "source" && node.url !== undefined) {
      throw new Error(`Non-source node ${node.id} must not claim an authoritative URL.`);
    }
    nodes.set(node.id, node);
  }
  if (trace.nodes.some((node, index) => index > 0 && trace.nodes[index - 1]!.id.localeCompare(node.id, "en-GB") > 0)) {
    throw new Error(`Evidence Trace ${trace.id} nodes are not in deterministic identifier order.`);
  }

  const answerNodes = [...nodes.values()].filter(({ kind }) => kind === "answer");
  if (answerNodes.length !== 1 || answerNodes[0]!.id !== trace.id) {
    throw new Error(`Evidence Trace ${trace.id} must contain exactly one matching answer node.`);
  }
  for (const claimId of trace.claimIds) {
    if (nodes.get(claimId)?.kind !== "claim") throw new Error(`Evidence Trace ${trace.id} is missing claim node ${claimId}.`);
  }

  const edgeIds = new Set<string>();
  const triples = new Set<string>();
  const connected = new Set<string>();
  const adjacency = new Map<string, string[]>();
  for (const candidateEdge of trace.edges) {
    const edge = exactObject(candidateEdge, EDGE_KEYS, "Evidence Trace edge") as unknown as EvidenceTraceEdge;
    const edgeId = requiredString(edge.id, "Evidence Trace edge identifier", 220);
    const sourceId = requiredString(edge.source, `Source for ${edgeId}`, 180);
    const targetId = requiredString(edge.target, `Target for ${edgeId}`, 180);
    if (!EDGE_ID.test(edgeId) || edgeIds.has(edgeId) || !EDGE_RELATIONS.has(edge.relation)) {
      throw new Error(`Evidence Trace ${trace.id} has an invalid or duplicate edge.`);
    }
    const source = nodes.get(sourceId);
    const target = nodes.get(targetId);
    if (!source || !target || sourceId === targetId) {
      throw new Error(`Evidence Trace edge ${edge.id} has an invalid endpoint.`);
    }
    validateEdgeDomain(edge, source, target);
    const triple = `${edge.source}\u0000${edge.relation}\u0000${edge.target}`;
    if (triples.has(triple)) throw new Error(`Evidence Trace ${trace.id} has a duplicate relationship.`);
    requiredString(edge.label, `Label for ${edge.id}`, 80);
    edgeIds.add(edge.id);
    triples.add(triple);
    connected.add(edge.source);
    connected.add(edge.target);
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
  }
  if (trace.edges.some((edge, index) => index > 0 && trace.edges[index - 1]!.id.localeCompare(edge.id, "en-GB") > 0)) {
    throw new Error(`Evidence Trace ${trace.id} edges are not in deterministic identifier order.`);
  }
  if ([...nodes.keys()].some((id) => !connected.has(id))) throw new Error(`Evidence Trace ${trace.id} has an orphan node.`);

  for (const claimId of trace.claimIds) {
    const sourceEdge = trace.edges.find(({ source, target, relation }) =>
      target === claimId && relation === "supports" && nodes.get(source)?.kind === "source");
    const claim = nodes.get(claimId)!;
    const source = sourceEdge ? nodes.get(sourceEdge.source) : undefined;
    const hasSource = source !== undefined && claim.recordId !== undefined && claim.recordId === source.recordId;
    const supportsAnswer = trace.edges.some(({ source, target, relation }) =>
      source === claimId && target === trace.id && relation === "supports");
    const hasLimitation = trace.edges.some(({ source, target, relation }) =>
      relation === "qualifies" && (target === claimId || target === trace.id) && nodes.get(source)?.kind === "limitation");
    if (!hasSource || !supportsAnswer || !hasLimitation) {
      throw new Error(`Claim ${claimId} is not connected to its source, answer and an explicit limitation.`);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`Evidence Trace ${trace.id} contains a relationship cycle.`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of adjacency.get(id) ?? []) visit(target);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of nodes.keys()) visit(id);
  return trace;
}

export interface EvidenceRuntime {
  collectionDigest: string;
  traces: EvidenceTrace[];
  defaultAnswerId: string;
  explore(input: unknown): Promise<JsonObject>;
  compare(input: unknown): Promise<JsonObject>;
}

export async function createEvidenceRuntime(
  rawCollection: string,
  rawChecksum: string,
  catalogueBundleDigest: string,
  catalogueRecords: DiscoveryRecord[],
): Promise<EvidenceRuntime> {
  if (parseChecksum(rawChecksum, "evidence-traces.json") !== await sha256Hex(rawCollection)) {
    throw new Error("The Evidence Trace checksum does not match the same-origin bytes.");
  }
  let decoded: unknown;
  try {
    decoded = JSON.parse(rawCollection);
  } catch {
    throw new Error("The Evidence Trace collection is not valid JSON.");
  }
  const candidate = exactObject(decoded, COLLECTION_KEYS, "Evidence Trace collection") as unknown as EvidenceTraceCollection;
  if (
    candidate.schema !== "trusted-govuk-discovery.evidence-trace-collection.v1" ||
    candidate.catalogueBundleDigest !== catalogueBundleDigest ||
    !SHA256.test(candidate.answerPackSourceDigest) ||
    !SHA256.test(candidate.collectionDigest) ||
    !Array.isArray(candidate.traces) || candidate.traces.length < 1 || candidate.traces.length > 8
  ) {
    throw new Error("The Evidence Trace collection binding is invalid.");
  }
  dateTime(candidate.generatedAt, "Evidence Trace generatedAt");
  const observedCollectionDigest = await sha256Hex(canonicalJson(digestInput(candidate as unknown as JsonObject, "collectionDigest")));
  if (observedCollectionDigest !== candidate.collectionDigest) {
    throw new Error("The Evidence Trace collection digest is invalid.");
  }
  const recordMap = new Map(catalogueRecords.map((record) => [record.id, record]));
  const traces = await Promise.all(candidate.traces.map((trace) => validateTrace(trace, recordMap)));
  const traceMap = new Map(traces.map((trace) => [trace.id, trace]));
  if (traceMap.size !== traces.length) throw new Error("The Evidence Trace collection has duplicate answer identifiers.");

  return {
    collectionDigest: candidate.collectionDigest,
    traces,
    defaultAnswerId: traces[0]!.id,
    async explore(input: unknown): Promise<JsonObject> {
      try {
        const object = exactObject(input, EXPLORE_KEYS, "Evidence exploration input");
        const answerId = requiredString(object.answerId, "answerId", 96);
        if (!ANSWER_ID.test(answerId)) throw new Error("answerId has an invalid format.");
        const trace = traceMap.get(answerId);
        if (!trace) return errorResult("answer_not_found", "No exact evidence answer was found.", { answerId });
        let claimId: string | undefined;
        if (object.claimId !== undefined) {
          claimId = requiredString(object.claimId, "claimId", 96);
          if (!CLAIM_ID.test(claimId)) throw new Error("claimId has an invalid format.");
          if (!trace.claimIds.includes(claimId)) return errorResult("claim_not_found", "The claim does not belong to this answer.", { answerId, claimId });
        }
        return {
          schema: "trusted-govuk-discovery.evidence-exploration-result.v1",
          ok: true,
          selection: { mode: claimId ? "claim" : "overview", answerId, claimIds: claimId ? [claimId] : trace.claimIds },
          trace,
          boundaries: resultBoundaries(),
        };
      } catch (error) {
        return errorResult("invalid_evidence_exploration_request", error instanceof Error ? error.message : "Evidence exploration failed.");
      }
    },
    async compare(input: unknown): Promise<JsonObject> {
      try {
        const object = exactObject(input, COMPARE_KEYS, "Evidence comparison input");
        const answerId = requiredString(object.answerId, "answerId", 96);
        if (!ANSWER_ID.test(answerId)) throw new Error("answerId has an invalid format.");
        const trace = traceMap.get(answerId);
        if (!trace) return errorResult("answer_not_found", "No exact evidence answer was found.", { answerId });
        if (!Array.isArray(object.claimIds) || object.claimIds.length < 2 || object.claimIds.length > 4) {
          throw new Error("claimIds must contain from two to four exact claim identifiers.");
        }
        const claimIds = object.claimIds.map((value, index) => requiredString(value, `claimIds[${index}]`, 96));
        if (new Set(claimIds).size !== claimIds.length || claimIds.some((id) => !CLAIM_ID.test(id))) {
          throw new Error("claimIds must be unique and use the supported identifier format.");
        }
        const unknown = claimIds.find((id) => !trace.claimIds.includes(id));
        if (unknown) return errorResult("claim_not_found", "A claim does not belong to this answer.", { answerId, claimId: unknown });
        const nodes = new Map(trace.nodes.map((node) => [node.id, node]));
        const rows = claimIds.map((claimId) => {
          const claim = nodes.get(claimId)!;
          const sourceEdge = trace.edges.find((edge) => edge.target === claimId && edge.relation === "supports" && nodes.get(edge.source)?.kind === "source")!;
          const source = nodes.get(sourceEdge.source)!;
          const limitationIds = [...new Set(trace.edges
            .filter((edge) =>
              edge.relation === "qualifies" &&
              (edge.target === claimId || edge.target === trace.id) &&
              nodes.get(edge.source)?.kind === "limitation")
            .map((edge) => edge.source))];
          return {
            claimId,
            statement: claim.statement,
            source: {
              nodeId: source.id,
              recordId: source.recordId,
              title: source.label,
              url: source.url,
            },
            facets: claim.facets,
            limitations: limitationIds.map((id) => {
              const limitation = nodes.get(id);
              if (limitation?.kind !== "limitation") {
                throw new Error(`Evidence comparison selected a non-limitation node: ${id}`);
              }
              return { nodeId: id, statement: limitation.statement };
            }),
          };
        });
        return {
          schema: "trusted-govuk-discovery.evidence-comparison-result.v1",
          ok: true,
          answerId,
          claimIds,
          comparedFacets: ["authority", "assertionStatus", "verification", "freshness", "integrity", "access", "rights", "coverage"],
          rows,
          trace,
          boundaries: resultBoundaries(),
        };
      } catch (error) {
        return errorResult("invalid_evidence_comparison_request", error instanceof Error ? error.message : "Evidence comparison failed.");
      }
    },
  };
}
