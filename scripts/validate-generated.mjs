import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const profileSchema = await readJson("schemas/profile-record.schema.json");
const catalogueSchema = await readJson("schemas/catalogue.schema.json");
const receiptSchema = await readJson("schemas/evidence-receipt.schema.json");
ajv.addSchema(profileSchema);
const validateCatalogue = ajv.compile(catalogueSchema);
const validateReceipt = ajv.compile(receiptSchema);
const catalogue = await readJson("app/data/catalogue.json");
const receipts = await readJson("app/data/receipts.json");

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
console.log(`Validated ${catalogue.records.length} records and ${receipts.length} receipts against JSON Schema.`);
