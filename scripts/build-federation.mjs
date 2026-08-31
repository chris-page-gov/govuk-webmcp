import {
  canonicalJson,
  readJson,
  sha256,
  writeJsonWithChecksum,
} from "./lib/deterministic-json.mjs";
import { SOURCE_LOCK_IDS, validateSourceLocks } from "./lib/source-locks.mjs";

const validatedSources = await validateSourceLocks();
const lockedSource = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.CORPUS_ADMISSIONS);
const lockedFederation = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.OKF_FEDERATION);
const rawSource = lockedSource.bytes;
const source = lockedSource.value;
const rawFederationLock = lockedFederation.bytes;
const federationLock = lockedFederation.value;
const catalogue = await readJson("app/data/catalogue.json");

const SHA256 = /^[a-f0-9]{64}$/u;
const FEDERATED_SOURCE_RECORD_COUNT = 58_655;
const FEDERATED_QUARANTINED_RECORD_COUNT = 3;
const FEDERATED_SEARCHABLE_RECORD_COUNT = 58_652;
const FEDERATED_COLLECTION_BINDINGS = Object.freeze([
  Object.freeze({
    admissionId: "corpus:uk-life-course",
    collectionId: "uk-living",
    sourceRecordCount: 9_757,
    quarantinedRecordCount: 0,
    recordCount: 9_757,
  }),
  Object.freeze({
    admissionId: "corpus:ons-metadata",
    collectionId: "ons",
    sourceRecordCount: 5_097,
    quarantinedRecordCount: 0,
    recordCount: 5_097,
  }),
  Object.freeze({
    admissionId: "corpus:uk-government-apis",
    collectionId: "government-apis",
    sourceRecordCount: 41_598,
    quarantinedRecordCount: 0,
    recordCount: 41_598,
  }),
  Object.freeze({
    admissionId: "corpus:land-registry-metadata",
    collectionId: "land-registry",
    sourceRecordCount: 2_203,
    quarantinedRecordCount: 3,
    recordCount: 2_200,
  }),
]);
const ADMISSION_SOURCE_COUNT_METRICS = Object.freeze(new Map([
  ["corpus:uk-life-course", "concepts"],
  ["corpus:ons-metadata", "records"],
  ["corpus:uk-government-apis", "records"],
  ["corpus:land-registry-metadata", "records"],
]));
const FEDERATED_ADMISSION_DISPLAY_CONTRACTS = Object.freeze(new Map([
  ["corpus:uk-life-course", Object.freeze({
    title: "UK life-course service families",
    counts: Object.freeze([
      Object.freeze({ metric: "concepts", count: 9_757 }),
      Object.freeze({ metric: "service families", count: 293 }),
      Object.freeze({ metric: "relationships", count: 15_810 }),
      Object.freeze({ metric: "source assertions", count: 879 }),
    ]),
    completenessClaim: "Complete against the locked 9,757-record source snapshot only; 293 of those records are service families.",
    limitation: "291 of 293 service families still require specialist review; search inclusion is not an item-level reviewed evidence receipt.",
  })],
  ["corpus:ons-metadata", Object.freeze({
    title: "ONS metadata discovery",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 5_097 }),
      Object.freeze({ metric: "relationships", count: 19_735 }),
    ]),
    completenessClaim: "Complete only for the four declared adapter snapshots.",
    limitation: "The deployed generated bundle is locked by observed bytes because the recorded commit alone does not reproduce its ignored Pages output; ELS rights remain not established.",
  })],
  ["corpus:uk-government-apis", Object.freeze({
    title: "UK government API and data catalogue",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 41_598 }),
      Object.freeze({ metric: "relationships", count: 276_996 }),
    ]),
    completenessClaim: "Bounded to the observed 41,598-record publication snapshot; not a claim about every UK public API.",
    limitation: "Licence and access evidence remain record-specific and may be missing or inferred; source-snapshot search does not make an endpoint live, public, authorised or safe to call.",
  })],
  ["corpus:land-registry-metadata", Object.freeze({
    title: "HM Land Registry metadata",
    counts: Object.freeze([
      Object.freeze({ metric: "records", count: 2_203 }),
      Object.freeze({ metric: "relationships", count: 22_267 }),
    ]),
    completenessClaim: "Bounded to the producer release manifest.",
    limitation: "This metadata-only discovery tier excludes title-register, title-plan, ownership, address, polygon and personal rows; it is not property evidence or legal advice.",
  })],
]));

if (
  federationLock.schema !== "govuk-webmcp.okf-federation-lock.v1" ||
  !Array.isArray(federationLock.sources) || federationLock.sources.length !== 4 ||
  typeof federationLock.lockDigest !== "string" || !SHA256.test(federationLock.lockDigest)
) {
  throw new Error("The OKF federation source lock is malformed.");
}
const federationLockDigestInput = { ...federationLock };
delete federationLockDigestInput.lockDigest;
if (sha256(canonicalJson(federationLockDigestInput)) !== federationLock.lockDigest) {
  throw new Error("The OKF federation source lock semantic digest is invalid.");
}
const federationSourceRecordCount = federationLock.sources.reduce(
  (total, sourceLock) => total + Number(sourceLock.population?.records ?? 0),
  0,
);
if (federationSourceRecordCount !== FEDERATED_SOURCE_RECORD_COUNT) {
  throw new Error("The OKF federation source lock no longer accounts for exactly 58,655 source records.");
}
for (const binding of FEDERATED_COLLECTION_BINDINGS) {
  const sourceLock = federationLock.sources.find(({ id }) => id === binding.collectionId);
  if (sourceLock?.population?.records !== binding.sourceRecordCount) {
    throw new Error(`The ${binding.collectionId} source lock no longer matches its admitted population binding.`);
  }
}

if (source.schema !== "govuk-webmcp.corpus-admission-source.v1") {
  throw new Error("The corpus-admission source schema is unsupported.");
}
if (!Array.isArray(source.collections) || source.collections.length < 1 || source.collections.length > 16) {
  throw new Error("The corpus-admission source must contain from one to sixteen collections.");
}

const identifiers = new Set();
for (const admission of source.collections) {
  if (identifiers.has(admission.id)) throw new Error(`Duplicate corpus admission: ${admission.id}`);
  identifiers.add(admission.id);
  if (Object.hasOwn(admission, "entryDigest")) throw new Error(`Authored admission ${admission.id} must not contain a generated digest.`);
  if (admission.boundaries?.officialEndorsement !== false || admission.boundaries?.runtimeOfficialApiCalls !== false) {
    throw new Error(`Corpus admission ${admission.id} crosses the independent static boundary.`);
  }
  if (!Array.isArray(admission.decision?.limitations) || !admission.decision.limitations.length ||
      !Array.isArray(admission.decision?.allowedClaims) || !admission.decision.allowedClaims.length ||
      !Array.isArray(admission.decision?.forbiddenClaims) || !admission.decision.forbiddenClaims.length) {
    throw new Error(`Corpus admission ${admission.id} has incomplete decision evidence.`);
  }
  if (
    admission.admissionState === "searchable" &&
    !["deep-evidence", "federated-source-snapshot"].includes(admission.payloadState)
  ) {
    throw new Error(`Searchable corpus ${admission.id} is not admitted to a supported evidence tier.`);
  }
  if (admission.source.refType !== "unversioned-local" && !admission.source.revision) {
    throw new Error(`Versioned corpus ${admission.id} has no immutable revision.`);
  }
}

const searchable = source.collections.filter(({ admissionState }) => admissionState === "searchable");
const deepEvidence = searchable.filter(({ payloadState }) => payloadState === "deep-evidence");
const federatedSnapshots = searchable.filter(({ payloadState }) => payloadState === "federated-source-snapshot");
const deepEvidenceIds = new Set(deepEvidence.map(({ id }) => id));
const federatedIds = new Set(federatedSnapshots.map(({ id }) => id));
if (
  deepEvidence.length !== 2 || !deepEvidenceIds.has("corpus:govuk-new-child") ||
  !deepEvidenceIds.has("corpus:curated-government-data-apis") ||
  deepEvidence.reduce((total, admission) => total + admission.population.denominator, 0) !== 80
) {
  throw new Error("The deep-evidence tier must remain the reviewed 69-record GOV.UK collection and 11-record curated companion collection.");
}
if (
  federatedSnapshots.length !== 4 ||
  !["corpus:uk-life-course", "corpus:ons-metadata", "corpus:uk-government-apis", "corpus:land-registry-metadata"]
    .every((id) => federatedIds.has(id)) ||
  federatedSnapshots.reduce((total, admission) => total + admission.population.denominator, 0) !== 58655
) {
  throw new Error("The federated source-snapshot tier must contain only the four locked 58,655-record OKF collections.");
}
for (const binding of FEDERATED_COLLECTION_BINDINGS) {
  const admission = federatedSnapshots.find(({ id }) => id === binding.admissionId);
  const sourceCountMetric = ADMISSION_SOURCE_COUNT_METRICS.get(binding.admissionId);
  const displayContract = FEDERATED_ADMISSION_DISPLAY_CONTRACTS.get(binding.admissionId);
  const admittedSourceCount = admission?.counts.find(({ metric }) => metric === sourceCountMetric)?.count;
  if (
    admission?.population.denominator !== binding.sourceRecordCount ||
    admittedSourceCount !== binding.sourceRecordCount ||
    binding.sourceRecordCount !== binding.recordCount + binding.quarantinedRecordCount ||
    admission.title !== displayContract?.title ||
    admission.population.completenessClaim !== displayContract?.completenessClaim ||
    admission.decision.limitations[0] !== displayContract?.limitation ||
    canonicalJson(admission.counts) !== canonicalJson(displayContract?.counts)
  ) {
    throw new Error(`The ${binding.admissionId} admission no longer matches its population binding or validated display contract.`);
  }
}
if (
  FEDERATED_COLLECTION_BINDINGS.reduce((total, binding) => total + binding.sourceRecordCount, 0) !==
    FEDERATED_SOURCE_RECORD_COUNT ||
  FEDERATED_COLLECTION_BINDINGS.reduce((total, binding) => total + binding.quarantinedRecordCount, 0) !==
    FEDERATED_QUARANTINED_RECORD_COUNT ||
  FEDERATED_COLLECTION_BINDINGS.reduce((total, binding) => total + binding.recordCount, 0) !==
    FEDERATED_SEARCHABLE_RECORD_COUNT
) {
  throw new Error("The per-collection federation bindings no longer match the admitted aggregate population.");
}
const legislation = source.collections.find(({ id }) => id === "corpus:uk-legislation");
if (
  legislation?.admissionState !== "quarantined" || legislation.payloadState !== "quarantined" ||
  legislation.delivery?.mode !== "descriptor-only"
) {
  throw new Error("The UK legislation collection must remain visibly excluded from search and payload delivery.");
}
if (catalogue.records.filter(({ resourceType }) => resourceType === "govuk-content").length !== 69) {
  throw new Error("The searchable corpus admission no longer matches the catalogue's 69 GOV.UK records.");
}
if (catalogue.records.filter(({ resourceType }) => resourceType !== "govuk-content").length !== 11) {
  throw new Error("The searchable companion admission no longer matches the catalogue's 11 curated data and API records.");
}

const manifest = {
  schema: "govuk-webmcp.corpus-admission.v1",
  generatedAt: source.authoredAt,
  catalogueBundleDigest: catalogue.bundleDigest,
  admissionSourceDigest: sha256(rawSource),
  federatedSearch: {
    sourceLockSha256: sha256(rawFederationLock),
    sourceLockDigest: federationLock.lockDigest,
    sourceRecordCount: FEDERATED_SOURCE_RECORD_COUNT,
    quarantinedRecordCount: FEDERATED_QUARANTINED_RECORD_COUNT,
    recordCount: FEDERATED_SEARCHABLE_RECORD_COUNT,
    collectionBindings: FEDERATED_COLLECTION_BINDINGS.map((binding) => ({ ...binding })),
  },
  collections: source.collections
    .map((admission) => ({ admission, entryDigest: sha256(canonicalJson(admission)) }))
    .sort((left, right) => left.admission.id.localeCompare(right.admission.id, "en-GB"))
};
manifest.manifestDigest = sha256(canonicalJson(manifest));

await writeJsonWithChecksum("app/data/federation.json", manifest);
console.log(`Built ${manifest.collections.length} corpus admissions: ${manifest.manifestDigest}`);
