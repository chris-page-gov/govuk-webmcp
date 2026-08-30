import {
  canonicalJson,
  readJson,
  sha256,
  writeJsonWithChecksum,
} from "./lib/deterministic-json.mjs";
import { SOURCE_LOCK_IDS, validateSourceLocks } from "./lib/source-locks.mjs";

const validatedSources = await validateSourceLocks();
const lockedSource = validatedSources.sourcesById.get(SOURCE_LOCK_IDS.CORPUS_ADMISSIONS);
const rawSource = lockedSource.bytes;
const source = lockedSource.value;
const catalogue = await readJson("app/data/catalogue.json");

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
  if (admission.admissionState === "searchable" && admission.payloadState !== "deep-evidence") {
    throw new Error(`Searchable corpus ${admission.id} is not admitted to the deep-evidence plane.`);
  }
  if (admission.source.refType !== "unversioned-local" && !admission.source.revision) {
    throw new Error(`Versioned corpus ${admission.id} has no immutable revision.`);
  }
}

const searchable = source.collections.filter(({ admissionState }) => admissionState === "searchable");
const searchableIds = new Set(searchable.map(({ id }) => id));
if (
  searchable.length !== 2 || !searchableIds.has("corpus:govuk-new-child") ||
  !searchableIds.has("corpus:curated-government-data-apis") ||
  searchable.reduce((total, admission) => total + admission.population.denominator, 0) !== 80
) {
  throw new Error("Only the reviewed 69-record GOV.UK collection and 11-record curated companion collection may be searchable in this release.");
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
  collections: source.collections
    .map((admission) => ({ admission, entryDigest: sha256(canonicalJson(admission)) }))
    .sort((left, right) => left.admission.id.localeCompare(right.admission.id, "en-GB"))
};
manifest.manifestDigest = sha256(canonicalJson(manifest));

await writeJsonWithChecksum("app/data/federation.json", manifest);
console.log(`Built ${manifest.collections.length} corpus admissions: ${manifest.manifestDigest}`);
