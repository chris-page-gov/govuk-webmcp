import {
  canonicalJson,
  sha256,
  writeJsonWithChecksum,
} from "./lib/deterministic-json.mjs";
import { SOURCE_LOCK_IDS, validateSourceLocks } from "./lib/source-locks.mjs";

const validatedSources = await validateSourceLocks();
const locks = validatedSources.registry;
const sourceRecords = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.GOVUK_CONTENT).value;
const curatedRecords = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.CURATED_API_DATA).value;
if (sourceRecords.length !== 69 || curatedRecords.length !== 11) {
  throw new Error("The complete catalogue must contain 69 locked GOV.UK records and 11 curated records.");
}

const govukRecords = sourceRecords.map((source) => {
  const topics = [...new Set([
    source.document_type,
    ...source.demo.journey_groups.map((value) => value.replaceAll("-", " ")),
  ])];
  return {
    id: `govuk-discovery:govuk-content:${source.canonical_content_id}`,
    title: source.title,
    description: source.description.trim(),
    resourceType: "govuk-content",
    publisher: source.publisher_title,
    topics,
    canonicalHumanUrl: source.url,
    documentationUrl: source.evidence_url,
    licence: {
      status: "confirmed",
      title: "Open Government Licence v3.0 for reused GOV.UK metadata, where applicable",
      url: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
      attribution: "Contains public sector information licensed under the Open Government Licence v3.0 where applicable.",
    },
    access: {
      status: source.access_model === "anonymous" ? "public" : "access-not-established",
      evidenceUrl: source.evidence_url,
      note: source.access_model === "anonymous"
        ? "The captured official metadata declares anonymous access to the human page."
        : "Access was not established from the captured source metadata.",
    },
    dates: {
      firstPublished: source.first_published_at,
      modified: source.public_updated_at,
      observed: source.retrieved_at,
    },
    sourceAuthority: "GOV.UK Publishing",
    assertions: [
      {
        field: "title",
        status: "official-source",
        evidenceUrls: [source.evidence_url],
      },
      {
        field: "description",
        status: "official-source",
        evidenceUrls: [source.evidence_url],
      },
      {
        field: "topics",
        status: "normalised",
        evidenceUrls: [source.evidence_url],
        note: "Normalised from the captured GOV.UK document type and bounded journey group.",
      },
    ],
    provenance: {
      extractionMethod: "deterministic projection from the locked GOV.UK Content API metadata corpus",
      sourceLock: "okf-govuk-content:new-child-69",
      sourceDigest: source.evidence_sha256,
      sources: [
        {
          url: source.url,
          title: source.title,
          publisher: source.publisher_title,
          observedAt: source.retrieved_at,
        },
        {
          url: source.evidence_url,
          title: `${source.title} — captured GOV.UK Content API metadata`,
          publisher: "GOV.UK Publishing",
          observedAt: source.retrieved_at,
          digest: source.evidence_sha256,
        },
      ],
    },
    limitations: [
      "This is metadata captured from GOV.UK, not a copy of the complete page or service.",
      "Linked attachments, images and third-party material may have different rights.",
      "The record was observed on 15 July 2026 and may have changed since then.",
      "Catalogue inclusion does not grant authority to use a linked transaction or restricted service.",
    ],
    relatedRecordIds: [],
    _journeyGroups: source.demo.journey_groups,
  };
});

for (const record of govukRecords) {
  const peers = govukRecords.filter((candidate) =>
    candidate.id !== record.id &&
    candidate._journeyGroups.some((group) => record._journeyGroups.includes(group)));
  record.relatedRecordIds = peers.slice(0, 3).map(({ id }) => id);
}
for (const record of govukRecords) delete record._journeyGroups;

const records = [...govukRecords, ...curatedRecords]
  .sort((left, right) => left.id.localeCompare(right.id, "en-GB"));
const recordDigests = [];

for (const record of records) {
  if (!record.provenance.sourceDigest) {
    record.provenance.sourceDigest = sha256(canonicalJson(record.provenance.sources));
  }
  const recordDigest = sha256(canonicalJson(record));
  recordDigests.push(recordDigest);
  record.provenance.recordDigest = recordDigest;
}

const bundleDigest = sha256(canonicalJson({
  schema: "trusted-govuk-discovery.bundle-root.v1",
  recordDigests: [...recordDigests].sort(),
}));

for (const record of records) {
  record.provenance.bundleDigest = bundleDigest;
  record.provenance.evidenceReceiptId =
    `trusted-govuk-discovery:evidence-receipt:sha256:${record.provenance.recordDigest}`;
}

const catalogue = {
  schema: "trusted-govuk-discovery.catalogue.v1",
  generatedAt: locks.generatedAt,
  profile: "trusted-govuk-discovery.profile.v1",
  bundleDigest,
  sourceLocksDigest: sha256(canonicalJson(locks)),
  records,
};

const receipts = records.map((record) => {
  const receipt = {
    schema: "trusted-govuk-discovery.evidence-receipt.v1",
    id: record.provenance.evidenceReceiptId,
    observedAt: record.dates.observed,
    sourceLock: record.provenance.sourceLock ?? "curated-official-api-data-2026-08-29",
    source: {
      url: record.provenance.sources[0].url,
      title: record.provenance.sources[0].title,
      publisher: record.provenance.sources[0].publisher,
      sourceDigest: record.provenance.sourceDigest,
    },
    output: {
      recordId: record.id,
      recordDigest: record.provenance.recordDigest,
      bundleDigest,
    },
    assertionStatuses: [...new Set(record.assertions.map(({ status }) => status))].sort(),
    limitations: record.limitations,
    boundaries: {
      sourceWasNotRefetchedAtRuntime: true,
      cryptographicSignatureVerified: false,
      accessAuthorityGranted: false,
    },
  };
  receipt.receiptDigest = sha256(canonicalJson(receipt));
  return receipt;
});

await writeJsonWithChecksum("app/data/catalogue.json", catalogue);
await writeJsonWithChecksum("app/data/receipts.json", receipts);
console.log(`Built ${records.length} records and ${receipts.length} receipts: ${bundleDigest}`);
