import { readFileSync } from "node:fs";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaDirectory = new URL("../../schemas/", import.meta.url);

function loadSchema(name) {
  return JSON.parse(readFileSync(new URL(`${name}.schema.json`, schemaDirectory), "utf8"));
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

for (const name of [
  "profile-record",
  "evidence-receipt",
  "error-result",
  "public-record-summary",
  "federated-record-shard",
  "combined-reviewed-record-summary",
  "federated-public-record-summary",
  "combined-search-result",
  "federated-resource-record-result",
  "federated-provenance-result",
  "evidence-trace",
  "beginner-presentation",
  "explore-answer-foundations-output",
]) {
  ajv.addSchema(loadSchema(name));
}

const inputSchemaNames = Object.freeze({
  search_government_knowledge: "search-government-knowledge-input",
  get_resource_record: "get-resource-record-input",
  show_provenance: "show-provenance-input",
  explore_answer_foundations: "explore-answer-foundations-input",
  compare_evidence_foundations: "compare-evidence-foundations-input",
  present_resource_evidence: "present-resource-evidence-input",
});

const publishedInputSchemas = new Map(Object.entries(inputSchemaNames).map(([name, schemaName]) => {
  const schema = loadSchema(schemaName);
  delete schema.$schema;
  delete schema.$id;
  delete schema.title;
  return [name, schema];
}));

const outputSchemaNames = Object.freeze({
  search_government_knowledge: "search-government-knowledge-output",
  get_resource_record: "get-resource-record-output",
  show_provenance: "show-provenance-output",
  explore_answer_foundations: "explore-answer-foundations-output",
  compare_evidence_foundations: "compare-evidence-foundations-output",
  present_resource_evidence: "present-resource-evidence-output",
});

const inputValidators = new Map(Object.entries(inputSchemaNames).map(([name, schemaName]) => [
  name,
  ajv.compile(loadSchema(schemaName)),
]));
const outputValidators = new Map(Object.entries(outputSchemaNames).map(([name, schemaName]) => [
  name,
  schemaName === "explore-answer-foundations-output"
    ? ajv.getSchema("urn:govuk-webmcp:schema:explore-answer-foundations-output:v1")
    : ajv.compile(loadSchema(schemaName)),
]));
const errorValidator = ajv.getSchema("urn:govuk-webmcp:schema:error-result:v1");

function validate(validator, value, label) {
  if (!validator(value)) {
    throw new Error(`${label} does not match its published closed schema: ${ajv.errorsText(validator.errors)}`);
  }
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export function validateSupportedHostPublishedInputSchema(name, inputSchema) {
  const expected = publishedInputSchemas.get(name);
  if (!expected) throw new Error(`Unsupported supported-host tool contract: ${String(name)}`);
  if (canonicalJson(inputSchema) !== canonicalJson(expected)) {
    throw new Error(`${name} discovered input schema differs from the published closed contract`);
  }
}

export function validateSupportedHostCallSchemas(name, input, output) {
  const inputValidator = inputValidators.get(name);
  const outputValidator = outputValidators.get(name);
  if (!inputValidator || !outputValidator) throw new Error(`Unsupported supported-host tool contract: ${String(name)}`);
  validate(inputValidator, input, `${name} input`);
  validate(outputValidator, output, `${name} output`);
}

export function validateSupportedHostRejectedResult(output) {
  validate(errorValidator, output, "Rejected supported-host result");
}
