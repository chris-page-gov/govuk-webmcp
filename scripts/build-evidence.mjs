import {
  canonicalJson,
  readJson,
  sha256,
  writeJsonWithChecksum,
} from "./lib/deterministic-json.mjs";
import { SOURCE_LOCK_IDS, validateSourceLocks } from "./lib/source-locks.mjs";

const validatedSources = await validateSourceLocks();
const lockedSource = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.ANSWER_PACKS);
const rawSource = lockedSource.bytes;
const source = lockedSource.value;
const catalogue = await readJson("app/data/catalogue.json");
const records = new Map(catalogue.records.map((record) => [record.id, record]));

if (source.schema !== "trusted-govuk-discovery.answer-pack-source.v1") {
  throw new Error("The answer-pack source schema is unsupported.");
}
if (!Array.isArray(source.packs) || source.packs.length < 1 || source.packs.length > 8) {
  throw new Error("The answer-pack source must contain from one to eight packs.");
}

const answerIds = new Set();
const sourceNodeId = (recordId, evidenceField) => `source:${recordId}:${evidenceField}`;
const transformationNodeId = (claimId) => `transformation:${claimId.slice("claim:".length)}`;
const checkNodeId = (claimId) => `check:${claimId.slice("claim:".length)}-digest`;

function recordFacets(record, coverageNote) {
  return {
    authority: record.sourceAuthority,
    assertionStatus: "official-source",
    verification: "digest-bound",
    freshness: {
      status: "observed",
      observedAt: record.dates.observed,
      note: "No freshness deadline is asserted; use the authoritative page for current information."
    },
    integrity: {
      status: "sha256-bound",
      digest: record.provenance.recordDigest,
      note: "The packaged record passed its SHA-256 binding checks."
    },
    access: {
      status: record.access.status,
      note: record.access.note
    },
    rights: {
      status: record.licence.status,
      ...(record.licence.title ? { title: record.licence.title } : {}),
      note: record.licence.attribution ?? "No broader reuse permission is inferred from catalogue inclusion."
    },
    coverage: {
      status: "one-record",
      note: coverageNote
    }
  };
}

function derivedFacets(record, authority, coverageNote) {
  const facets = recordFacets(record, coverageNote);
  facets.authority = authority;
  facets.assertionStatus = "normalised";
  facets.verification = "source-linked";
  return facets;
}

const traces = source.packs.map((pack) => {
  if (answerIds.has(pack.id)) throw new Error(`Duplicate answer pack: ${pack.id}`);
  answerIds.add(pack.id);
  const claimIds = new Set();
  const limitationIds = new Set();
  const nodes = [
    {
      id: pack.id,
      kind: "answer",
      label: "Directory answer",
      statement: pack.answerSummary,
      facets: {
        authority: "Curated directory answer over admitted source metadata",
        assertionStatus: "normalised",
        verification: "source-linked",
        freshness: {
          status: "not-established",
          note: "The answer has no independent freshness claim; its sources retain their observation dates."
        },
        integrity: {
          status: "sha256-bound",
          digest: catalogue.bundleDigest,
          note: "Every selected record is bound to the validated catalogue bundle."
        },
        access: {
          status: "not-applicable",
          note: "The answer grants no access or permission."
        },
        rights: {
          status: "not-applicable",
          note: "Rights remain attached to each cited source record."
        },
        coverage: {
          status: "bounded",
          note: `${pack.claims.length} selected starting points from the ${catalogue.records.length}-record catalogue; not exhaustive.`
        }
      }
    }
  ];
  const edges = [];

  for (const claim of pack.claims) {
    if (claimIds.has(claim.id)) throw new Error(`Duplicate claim in ${pack.id}: ${claim.id}`);
    claimIds.add(claim.id);
    const record = records.get(claim.recordId);
    if (!record) throw new Error(`Claim ${claim.id} names an unknown record: ${claim.recordId}`);
    const assertion = record.assertions.find(({ field }) => field === claim.evidenceField);
    if (!assertion || assertion.status !== "official-source") {
      throw new Error(`Claim ${claim.id} has no official source assertion for ${claim.evidenceField}.`);
    }
    const evidenceValue = record[claim.evidenceField];
    const sourceId = sourceNodeId(record.id, claim.evidenceField);
    const transformationId = transformationNodeId(claim.id);
    const checkId = checkNodeId(claim.id);
    nodes.push(
      {
        id: claim.id,
        kind: "claim",
        label: record.title,
        statement: claim.statement,
        recordId: record.id,
        facets: derivedFacets(
          record,
          "Curated deterministic normalisation of cited official metadata",
          "One selected statement within a bounded directory answer."
        )
      },
      {
        id: sourceId,
        kind: "source",
        label: record.title,
        statement: evidenceValue,
        recordId: record.id,
        url: record.canonicalHumanUrl,
        facets: recordFacets(record, "One admitted catalogue record; linked page content was not copied or refetched at runtime.")
      },
      {
        id: transformationId,
        kind: "transformation",
        label: "Deterministic restatement",
        statement: claim.transformationNote,
        recordId: record.id,
        facets: derivedFacets(
          record,
          "Original project transformation rule",
          "This rule applies only to the named claim and source field."
        )
      },
      {
        id: checkId,
        kind: "check",
        label: "Packaged integrity check",
        statement: "The source record, evidence receipt and catalogue bundle bindings passed deterministic SHA-256 checks.",
        recordId: record.id,
        facets: {
          ...derivedFacets(record, "Local deterministic validation runtime", "Integrity was checked for this packaged record, not for the current live page."),
          assertionStatus: "not-applicable",
          verification: "digest-bound"
        }
      }
    );
    edges.push(
      { id: `edge:${claim.id.slice(6)}-answer`, source: claim.id, target: pack.id, relation: "supports", label: "supports answer" },
      { id: `edge:${claim.id.slice(6)}-source`, source: sourceId, target: claim.id, relation: "supports", label: "supports claim" },
      { id: `edge:${claim.id.slice(6)}-transformation`, source: transformationId, target: claim.id, relation: "derived-through", label: "derived through" },
      { id: `edge:${claim.id.slice(6)}-check`, source: checkId, target: sourceId, relation: "verifies", label: "checks packaged bytes" }
    );
  }

  for (const limitation of pack.limitations) {
    if (limitationIds.has(limitation.id)) throw new Error(`Duplicate limitation in ${pack.id}: ${limitation.id}`);
    limitationIds.add(limitation.id);
    nodes.push({
      id: limitation.id,
      kind: "limitation",
      label: `${limitation.kind[0].toUpperCase()}${limitation.kind.slice(1)} limitation`,
      statement: limitation.statement,
      facets: {
        authority: "Curated project boundary",
        assertionStatus: "normalised",
        verification: "authored-boundary",
        freshness: { status: "not-applicable", note: "This is a standing interpretation boundary." },
        integrity: { status: "sha256-bound", digest: catalogue.bundleDigest, note: "The limitation is packaged with the evidence trace." },
        access: { status: "not-applicable", note: "The limitation grants no access." },
        rights: { status: "not-applicable", note: "The limitation makes no rights claim." },
        coverage: { status: "not-applicable", note: "The limitation qualifies the nodes named by its edges." }
      }
    });
    for (const target of limitation.appliesTo) {
      if (target !== pack.id && !claimIds.has(target)) {
        throw new Error(`Limitation ${limitation.id} names an unknown target: ${target}`);
      }
      edges.push({
        id: `edge:${limitation.id.slice(11)}-${target.replace(":", "-")}`,
        source: limitation.id,
        target,
        relation: "qualifies",
        label: "qualifies"
      });
    }
  }

  const trace = {
    schema: "trusted-govuk-discovery.evidence-trace.v1",
    id: pack.id,
    question: pack.question,
    answerSummary: pack.answerSummary,
    scope: pack.scope,
    claimIds: [...claimIds],
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id, "en-GB")),
    edges: edges.sort((left, right) => left.id.localeCompare(right.id, "en-GB")),
    boundaries: {
      canonicalNarrative: false,
      pageScoped: true,
      providerCall: false,
      sourceRefetched: false,
      eligibilityDecision: false,
      singleTrustScore: false
    }
  };
  trace.traceDigest = sha256(canonicalJson(trace));
  return trace;
});

const collection = {
  schema: "trusted-govuk-discovery.evidence-trace-collection.v1",
  generatedAt: source.authoredAt,
  catalogueBundleDigest: catalogue.bundleDigest,
  answerPackSourceDigest: sha256(rawSource),
  traces
};
collection.collectionDigest = sha256(canonicalJson(collection));

await writeJsonWithChecksum("app/data/evidence-traces.json", collection);
console.log(`Built ${traces.length} Evidence Trace: ${collection.collectionDigest}`);
