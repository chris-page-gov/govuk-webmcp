import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const federatedModuleHref = process.env.FEDERATED_SEARCH_RUNTIME_MODULE
  ? new URL(process.env.FEDERATED_SEARCH_RUNTIME_MODULE, import.meta.url).href
  : new URL("../../dist/src/federated-search-runtime.js", import.meta.url).href;
const combinedModuleHref = process.env.COMBINED_KNOWLEDGE_RUNTIME_MODULE
  ? new URL(process.env.COMBINED_KNOWLEDGE_RUNTIME_MODULE, import.meta.url).href
  : new URL("../../dist/src/combined-knowledge-runtime.js", import.meta.url).href;
const federationModuleHref = process.env.FEDERATION_RUNTIME_MODULE
  ? new URL(process.env.FEDERATION_RUNTIME_MODULE, import.meta.url).href
  : new URL("../../dist/src/federation-runtime.js", import.meta.url).href;
const toolsModuleHref = process.env.WEBMCP_TOOLS_MODULE
  ? new URL(process.env.WEBMCP_TOOLS_MODULE, import.meta.url).href
  : new URL("../../dist/src/webmcp-tools.js", import.meta.url).href;

const { createFederatedSearchRuntime } = await import(federatedModuleHref);
const { createCombinedKnowledgeRuntime } = await import(combinedModuleHref);
const { createFederationRuntime } = await import(federationModuleHref);
const { createKnowledgeDiscoveryRuntime } = await import(toolsModuleHref);

const schemaNames = [
  "profile-record",
  "evidence-receipt",
  "error-result",
  "public-record-summary",
  "federated-record-shard",
  "federated-public-record-summary",
  "federated-search-result",
  "federated-resource-record-result",
  "federated-provenance-result",
  "combined-reviewed-record-summary",
  "combined-search-result",
];

async function validator() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  for (const name of schemaNames) {
    ajv.addSchema(JSON.parse(await readFile(`schemas/${name}.schema.json`, "utf8")));
  }
  const searchOutput = ajv.compile(JSON.parse(
    await readFile("schemas/search-government-knowledge-output.schema.json", "utf8"),
  ));
  const recordOutput = ajv.compile(JSON.parse(
    await readFile("schemas/get-resource-record-output.schema.json", "utf8"),
  ));
  const provenanceOutput = ajv.compile(JSON.parse(
    await readFile("schemas/show-provenance-output.schema.json", "utf8"),
  ));
  return {
    ajv,
    directSearch: ajv.getSchema("urn:govuk-webmcp:schema:federated-search-result:v1"),
    searchOutput,
    recordOutput,
    provenanceOutput,
  };
}

function assertValid(ajv, validate, value, label) {
  assert.equal(validate(value), true, `${label}: ${ajv.errorsText(validate.errors)}`);
}

test("real federated search, record and provenance outputs match their published schemas", async () => {
  const reviewed = await createKnowledgeDiscoveryRuntime(
    await readFile("app/data/catalogue.json", "utf8"),
    await readFile("app/data/catalogue.json.sha256", "utf8"),
    await readFile("app/data/receipts.json", "utf8"),
    await readFile("app/data/receipts.json.sha256", "utf8"),
  );
  const admitted = await createFederationRuntime(
    await readFile("app/data/federation.json", "utf8"),
    await readFile("app/data/federation.json.sha256", "utf8"),
    reviewed.bundleDigest,
    reviewed.recordCount,
  );
  const rawManifest = await readFile("app/data/federated-search/manifest.json", "utf8");
  const rawManifestChecksum = await readFile("app/data/federated-search/manifest.json.sha256", "utf8");
  const federated = await createFederatedSearchRuntime(
    rawManifest,
    rawManifestChecksum,
    async (path) => new Uint8Array(await readFile(resolve("app", path))),
    admitted.federatedSearch,
  );
  const combined = createCombinedKnowledgeRuntime(reviewed, federated);
  const directSearch = await federated.search({ query: "housing", limit: 8 });
  const combinedSearch = await combined.search({ query: "housing", limit: 8 });
  const recordId = directSearch.results[0].recordId;
  const record = await combined.getRecord({ recordId });
  const provenance = await combined.showProvenance({ recordId });
  const schemas = await validator();

  assertValid(schemas.ajv, schemas.directSearch, directSearch, "Direct federated search output");
  assertValid(schemas.ajv, schemas.searchOutput, combinedSearch, "Combined tool search output");
  assertValid(schemas.ajv, schemas.recordOutput, record, "Federated tool record output");
  assertValid(schemas.ajv, schemas.provenanceOutput, provenance, "Federated tool provenance output");
  assert.equal(provenance.evidenceReceiptAvailable, false);
});
