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
ajv.addSchema(profileSchema);
ajv.addSchema(evidenceTraceSchema);
ajv.addSchema(corpusAdmissionSourceSchema);
const validateCatalogue = ajv.compile(catalogueSchema);
const validateReceipt = ajv.compile(receiptSchema);
const validateAnswerPackSource = ajv.compile(answerPackSourceSchema);
const validateEvidenceTraces = ajv.compile(evidenceTraceCollectionSchema);
const validateCorpusAdmissions = ajv.getSchema(corpusAdmissionSourceSchema.$id);
const validateFederation = ajv.compile(federationManifestSchema);
const catalogue = await readJson("app/data/catalogue.json");
const receipts = await readJson("app/data/receipts.json");
const answerPackSource = await readJson("app/data/sources/answer-packs.json");
const evidenceTraces = await readJson("app/data/evidence-traces.json");
const corpusAdmissions = await readJson("app/data/sources/corpus-admissions.json");
const federation = await readJson("app/data/federation.json");

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
]) {
  if (!validate(value)) throw new Error(`${label} schema validation failed: ${ajv.errorsText(validate.errors)}`);
}
console.log(`Validated ${catalogue.records.length} records, ${receipts.length} receipts, ${evidenceTraces.traces.length} Evidence Trace and ${federation.collections.length} corpus admissions against JSON Schema.`);
