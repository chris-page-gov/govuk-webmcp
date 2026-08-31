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
  },
  collections: source.collections
    .map((admission) => ({ admission, entryDigest: sha256(canonicalJson(admission)) }))
    .sort((left, right) => left.admission.id.localeCompare(right.admission.id, "en-GB"))
};
manifest.manifestDigest = sha256(canonicalJson(manifest));

await writeJsonWithChecksum("app/data/federation.json", manifest);
console.log(`Built ${manifest.collections.length} corpus admissions: ${manifest.manifestDigest}`);
