import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const profileSchema = await readJson("schemas/profile-record.schema.json");
const catalogueSchema = await readJson("schemas/catalogue.schema.json");
const receiptSchema = await readJson("schemas/evidence-receipt.schema.json");
const answerPackSourceSchema = await readJson("schemas/answer-pack-source.schema.json");
const evidenceTraceSchema = await readJson("schemas/evidence-trace.schema.json");
const evidenceTraceCollectionSchema = await readJson("schemas/evidence-trace-collection.schema.json");
const corpusAdmissionSourceSchema = await readJson("schemas/corpus-admission-source.schema.json");
const federationManifestSchema = await readJson("schemas/federation-manifest.schema.json");
const errorResultSchema = await readJson("schemas/error-result.schema.json");
const publicRecordSummarySchema = await readJson("schemas/public-record-summary.schema.json");
const federatedSearchManifestSchema = await readJson("schemas/federated-search-manifest.schema.json");
const federatedRecordShardSchema = await readJson("schemas/federated-record-shard.schema.json");
const federatedPostingsShardSchema = await readJson("schemas/federated-postings-shard.schema.json");
const federatedPublicRecordSummarySchema = await readJson("schemas/federated-public-record-summary.schema.json");
const federatedSearchResultSchema = await readJson("schemas/federated-search-result.schema.json");
const federatedResourceRecordResultSchema = await readJson("schemas/federated-resource-record-result.schema.json");
const federatedProvenanceResultSchema = await readJson("schemas/federated-provenance-result.schema.json");
const federatedErrorResultSchema = await readJson("schemas/federated-error-result.schema.json");
const combinedReviewedRecordSummarySchema = await readJson("schemas/combined-reviewed-record-summary.schema.json");
const combinedSearchResultSchema = await readJson("schemas/combined-search-result.schema.json");
const searchOutputSchema = await readJson("schemas/search-government-knowledge-output.schema.json");
const recordOutputSchema = await readJson("schemas/get-resource-record-output.schema.json");
const provenanceOutputSchema = await readJson("schemas/show-provenance-output.schema.json");
ajv.addSchema(profileSchema);
ajv.addSchema(evidenceTraceSchema);
ajv.addSchema(corpusAdmissionSourceSchema);
for (const schema of [
  receiptSchema,
  errorResultSchema,
  publicRecordSummarySchema,
  federatedSearchManifestSchema,
  federatedRecordShardSchema,
  federatedPostingsShardSchema,
  federatedPublicRecordSummarySchema,
  federatedSearchResultSchema,
  federatedResourceRecordResultSchema,
  federatedProvenanceResultSchema,
  federatedErrorResultSchema,
  combinedReviewedRecordSummarySchema,
  combinedSearchResultSchema,
]) ajv.addSchema(schema);
const validateCatalogue = ajv.compile(catalogueSchema);
const validateReceipt = ajv.getSchema(receiptSchema.$id);
const validateAnswerPackSource = ajv.compile(answerPackSourceSchema);
const validateEvidenceTraces = ajv.compile(evidenceTraceCollectionSchema);
const validateCorpusAdmissions = ajv.getSchema(corpusAdmissionSourceSchema.$id);
const validateFederation = ajv.compile(federationManifestSchema);
const validateFederatedSearchManifest = ajv.getSchema(federatedSearchManifestSchema.$id);
const validateFederatedRecordShard = ajv.getSchema(federatedRecordShardSchema.$id);
const validateFederatedPostingsShard = ajv.getSchema(federatedPostingsShardSchema.$id);
for (const schema of [searchOutputSchema, recordOutputSchema, provenanceOutputSchema]) ajv.compile(schema);
const catalogue = await readJson("app/data/catalogue.json");
const receipts = await readJson("app/data/receipts.json");
const answerPackSource = await readJson("app/data/sources/answer-packs.json");
const evidenceTraces = await readJson("app/data/evidence-traces.json");
const corpusAdmissions = await readJson("app/data/sources/corpus-admissions.json");
const federation = await readJson("app/data/federation.json");
const federatedManifestBytes = await readFile("app/data/federated-search/manifest.json");
const federatedManifestChecksum = await readFile("app/data/federated-search/manifest.json.sha256", "utf8");
const federatedManifest = JSON.parse(federatedManifestBytes.toString("utf8"));

if (!validateCatalogue(catalogue)) {
  throw new Error(`Catalogue schema validation failed: ${ajv.errorsText(validateCatalogue.errors)}`);
}
for (const receipt of receipts) {
  if (!validateReceipt(receipt)) {
    throw new Error(`Receipt schema validation failed: ${ajv.errorsText(validateReceipt.errors)}`);
  }
}
if (receipts.length !== catalogue.records.length) {
  throw new Error("Receipt and record counts differ.");
}
for (const [label, validate, value] of [
  ["answer-pack source", validateAnswerPackSource, answerPackSource],
  ["Evidence Trace collection", validateEvidenceTraces, evidenceTraces],
  ["corpus-admission source", validateCorpusAdmissions, corpusAdmissions],
  ["federation manifest", validateFederation, federation],
  ["federated search manifest", validateFederatedSearchManifest, federatedManifest],
]) {
  if (!validate(value)) throw new Error(`${label} schema validation failed: ${ajv.errorsText(validate.errors)}`);
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const checksumMatch = federatedManifestChecksum.trim().match(/^([a-f0-9]{64})\s+\*?manifest\.json$/u);
if (!checksumMatch || checksumMatch[1] !== sha256(federatedManifestBytes)) {
  throw new Error("Federated search manifest checksum validation failed.");
}

let federatedRecords = 0;
let recordShards = 0;
let postingsShards = 0;
const visitedShardPaths = new Set();
const declaredRecordShards = federatedManifest.collections.reduce(
  (total, collection) => total + collection.recordShards.length,
  0,
);
const declaredPostingsShards = federatedManifest.collections.reduce(
  (total, collection) => total + Object.values(collection.postings)
    .reduce((subtotal, references) => subtotal + references.length, 0),
  0,
);
const federatedValidationStarted = performance.now();
for (const collection of federatedManifest.collections) {
  for (const reference of collection.recordShards) {
    if (visitedShardPaths.has(reference.path)) throw new Error(`Duplicate federated shard path: ${reference.path}`);
    visitedShardPaths.add(reference.path);
    const shardBytes = await readFile(`app/${reference.path}`);
    if (shardBytes.byteLength !== reference.bytes || sha256(shardBytes) !== reference.sha256) {
      throw new Error(`${reference.path} differs from its manifest byte lock.`);
    }
    const shard = JSON.parse(shardBytes.toString("utf8"));
    if (!validateFederatedRecordShard(shard)) {
      throw new Error(`${reference.path} schema validation failed: ${ajv.errorsText(validateFederatedRecordShard.errors)}`);
    }
    if (
      shard.collectionId !== reference.collectionId || shard.firstOrdinal !== reference.firstOrdinal ||
      shard.lastOrdinal !== reference.lastOrdinal || shard.records.length !== reference.recordCount
    ) {
      throw new Error(`${reference.path} does not match its manifest identity and count.`);
    }
    federatedRecords += shard.records.length;
    recordShards += 1;
  }

  for (const prefix of Object.keys(collection.postings).sort((left, right) => left.localeCompare(right, "en-GB"))) {
    for (const [part, reference] of collection.postings[prefix].entries()) {
      if (visitedShardPaths.has(reference.path)) throw new Error(`Duplicate federated shard path: ${reference.path}`);
      visitedShardPaths.add(reference.path);
      const shardBytes = await readFile(`app/${reference.path}`);
      if (shardBytes.byteLength !== reference.bytes || sha256(shardBytes) !== reference.sha256) {
        throw new Error(`${reference.path} differs from its manifest byte lock.`);
      }
      const shard = JSON.parse(shardBytes.toString("utf8"));
      if (!validateFederatedPostingsShard(shard)) {
        throw new Error(`${reference.path} schema validation failed: ${ajv.errorsText(validateFederatedPostingsShard.errors)}`);
      }
      const tokenCount = Object.keys(shard.entries).length;
      const postingCount = Object.values(shard.entries)
        .reduce((total, rows) => total + rows.length, 0);
      if (
        shard.collectionId !== collection.id || reference.collectionId !== collection.id ||
        shard.prefix !== prefix || shard.part !== part ||
        tokenCount !== reference.tokenCount || postingCount !== reference.postingCount
      ) {
        throw new Error(`${reference.path} does not match its manifest collection, prefix, part or posting counts.`);
      }
      postingsShards += 1;
    }
  }
}
if (federatedRecords !== federatedManifest.recordCount) {
  throw new Error("Federated record shards do not account for the manifest population.");
}
if (
  recordShards !== declaredRecordShards || postingsShards !== declaredPostingsShards ||
  visitedShardPaths.size !== declaredRecordShards + declaredPostingsShards
) {
  throw new Error("Federated shard validation did not visit every unique manifest-declared file exactly once.");
}
const federatedValidationMilliseconds = Math.round(performance.now() - federatedValidationStarted);

console.log(
  `Validated ${catalogue.records.length} reviewed records, ${receipts.length} receipts, ` +
  `${federatedRecords} federated stored records in ${recordShards} shards, ` +
  `all ${postingsShards} postings shards, ${evidenceTraces.traces.length} Evidence Trace ` +
  `and ${federation.collections.length} corpus admissions against JSON Schema ` +
  `(${federatedValidationMilliseconds.toLocaleString("en-GB")} ms for all federated shard files).`,
);
