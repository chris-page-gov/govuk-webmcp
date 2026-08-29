import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { createKnowledgeDiscoveryRuntime } from "../../dist/src/webmcp-tools.js";

const read = (path) => readFile(new URL(`../../app/data/${path}`, import.meta.url), "utf8");
const rawCatalogue = await read("catalogue.json");
const rawCatalogueChecksum = await read("catalogue.json.sha256");
const rawReceipts = await read("receipts.json");
const rawReceiptsChecksum = await read("receipts.json.sha256");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function runtime() {
  return createKnowledgeDiscoveryRuntime(
    rawCatalogue,
    rawCatalogueChecksum,
    rawReceipts,
    rawReceiptsChecksum,
  );
}

test("loads the complete 80-record, 80-receipt bundle", async () => {
  const discovery = await runtime();
  assert.equal(discovery.recordCount, 80);
  assert.deepEqual(discovery.facets.resourceTypes, ["api", "api-documentation", "catalogue-record", "dataset", "govuk-content"]);
  assert.ok(discovery.facets.publishers.includes("Government Digital Service"));
  assert.deepEqual(discovery.facets.accessStatuses, ["access-not-established", "authentication-required", "public"]);
});

test("search is deterministic and supports closed filters", async () => {
  const discovery = await runtime();
  const input = { query: "flood API", resourceTypes: ["api"], accessStatuses: ["public"], limit: 8 };
  const first = await discovery.search(input);
  const second = await discovery.search(input);
  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(first.results[0].recordId, "govuk-discovery:api:flood-monitoring");
  assert.equal(first.results[0].accessStatus, "public");
  assert.equal(first.results[0].licenceStatus, "confirmed");
  assert.match(first.results[0].canonicalHumanUrl, /^https:\/\/www\.api\.gov\.uk\//u);
  assert.equal(first.results[0].bundleDigest, first.catalogue.bundleDigest);
});

test("search returns bounded zero results without invention", async () => {
  const result = await (await runtime()).search({ query: "zyxwvutsrqponmlkjihgfedcba" });
  assert.equal(result.ok, true);
  assert.equal(result.totalMatches, 0);
  assert.deepEqual(result.results, []);
  assert.equal(result.boundaries.providerCall, false);
});

test("search rejects unknown, oversized and unsupported input", async () => {
  const discovery = await runtime();
  const additional = await discovery.search({ query: "content", context: "private" });
  const oversized = await discovery.search({ query: "x".repeat(161) });
  const unsupported = await discovery.search({ query: "content", resourceTypes: ["secret"] });
  assert.equal(additional.ok, false);
  assert.match(additional.error.message, /Unknown input field/u);
  assert.match(oversized.error.message, /at most 160/u);
  assert.match(unsupported.error.message, /unsupported value/u);
});

test("exact record keeps authentication and missing-licence limits closed", async () => {
  const discovery = await runtime();
  const result = await discovery.getRecord({ recordId: "govuk-discovery:api:companies-house" });
  assert.equal(result.ok, true);
  assert.equal(result.verificationStatus, "digest-bound");
  assert.equal(result.record.access.status, "authentication-required");
  assert.equal(result.record.licence.status, "missing");
  assert.match(result.record.access.note, /required/u);
  assert.equal(result.boundaries.accessAuthorityGranted, false);
});

test("exact record rejects additional fields and missing identifiers", async () => {
  const discovery = await runtime();
  const additional = await discovery.getRecord({ recordId: "govuk-discovery:api:companies-house", extra: true });
  const missing = await discovery.getRecord({ recordId: "govuk-discovery:api:not-present" });
  assert.equal(additional.ok, false);
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, "record_not_found");
});

test("provenance returns a digest-bound receipt without refetching", async () => {
  const result = await (await runtime()).showProvenance({ recordId: "govuk-discovery:dataset:ons-open-geography" });
  assert.equal(result.ok, true);
  assert.equal(result.status, "digest-bound");
  assert.equal(result.recordDigest, result.evidenceReceipt.output.recordDigest);
  assert.equal(result.bundleDigest, result.evidenceReceipt.output.bundleDigest);
  assert.equal(result.boundaries.sourceWasNotRefetched, true);
  assert.equal(result.evidenceReceipt.boundaries.cryptographicSignatureVerified, false);
});

test("fails closed when catalogue or receipt raw checksums are wrong", async () => {
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(`${rawCatalogue} `, rawCatalogueChecksum, rawReceipts, rawReceiptsChecksum),
    /catalogue checksum does not match/u,
  );
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(rawCatalogue, rawCatalogueChecksum, `${rawReceipts} `, rawReceiptsChecksum),
    /receipt checksum does not match/u,
  );
});

test("fails closed when record content changes behind a new raw checksum", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].description = "Altered after the record digest was created.";
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, `${sha256(altered)}  catalogue.json\n`, rawReceipts, rawReceiptsChecksum),
    /invalid record digest/u,
  );
});

test("fails closed for an unsafe authoritative URL", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].canonicalHumanUrl = "javascript:alert(1)";
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, `${sha256(altered)}  catalogue.json\n`, rawReceipts, rawReceiptsChecksum),
    /Authoritative human URL/u,
  );
});

test("fails closed when a receipt is rebound behind a new raw checksum", async () => {
  const decoded = JSON.parse(rawReceipts);
  decoded[0].output.recordDigest = "0".repeat(64);
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(rawCatalogue, rawCatalogueChecksum, altered, `${sha256(altered)}  receipts.json\n`),
    /not bound/u,
  );
});

test("all three tool result families validate against the published output contracts", async () => {
  const schemaNames = [
    "search-government-knowledge-output.schema.json",
    "get-resource-record-output.schema.json",
    "show-provenance-output.schema.json",
  ];
  const loadSchema = async (name) => JSON.parse(await readFile(new URL(`../../schemas/${name}`, import.meta.url), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addSchema(await loadSchema("profile-record.schema.json"));
  ajv.addSchema(await loadSchema("evidence-receipt.schema.json"));
  const validators = await Promise.all(schemaNames.map(async (name) => ajv.compile(await loadSchema(name))));
  const discovery = await runtime();
  const results = [
    await discovery.search({ query: "flood API" }),
    await discovery.getRecord({ recordId: "govuk-discovery:api:companies-house" }),
    await discovery.showProvenance({ recordId: "govuk-discovery:dataset:ons-open-geography" }),
  ];
  validators.forEach((validate, index) => {
    assert.equal(validate(results[index]), true, JSON.stringify(validate.errors, null, 2));
  });
});
