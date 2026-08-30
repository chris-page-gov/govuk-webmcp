import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { createKnowledgeDiscoveryRuntime, TOOL_INPUT_SCHEMAS } from "../../dist/src/webmcp-tools.js";
import { canonicalJson } from "../../dist/src/integrity.js";

const read = (path) => readFile(new URL(`../../app/data/${path}`, import.meta.url), "utf8");
const rawCatalogue = await read("catalogue.json");
const rawCatalogueChecksum = await read("catalogue.json.sha256");
const rawReceipts = await read("receipts.json");
const rawReceiptsChecksum = await read("receipts.json.sha256");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const serialise = (value) => `${JSON.stringify(value, null, 2)}\n`;
const checksum = (raw, filename) => `${sha256(raw)}  ${filename}\n`;

function rebindCatalogue(catalogue) {
  const recordDigests = catalogue.records.map((record) => {
    const digestInput = structuredClone(record);
    delete digestInput.provenance.recordDigest;
    delete digestInput.provenance.bundleDigest;
    delete digestInput.provenance.evidenceReceiptId;
    const recordDigest = sha256(canonicalJson(digestInput));
    record.provenance.recordDigest = recordDigest;
    return recordDigest;
  });
  const bundleDigest = sha256(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: [...recordDigests].sort(),
  }));
  catalogue.bundleDigest = bundleDigest;
  catalogue.records.forEach((record) => {
    record.provenance.bundleDigest = bundleDigest;
    record.provenance.evidenceReceiptId =
      `trusted-govuk-discovery:evidence-receipt:sha256:${record.provenance.recordDigest}`;
  });
}

function rebindReceipt(receipt) {
  const digestInput = structuredClone(receipt);
  delete digestInput.receiptDigest;
  receipt.receiptDigest = sha256(canonicalJson(digestInput));
}

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

test("catalogue schema and runtime reject a coherently re-digested 79-record release", async () => {
  const removedId = "govuk-discovery:govuk-content:fdd55911-6fcc-4b9e-be9f-34e93298b691";
  const decodedCatalogue = JSON.parse(rawCatalogue);
  decodedCatalogue.records = decodedCatalogue.records.filter(({ id }) => id !== removedId);
  assert.equal(decodedCatalogue.records.length, 79);
  rebindCatalogue(decodedCatalogue);

  const decodedReceipts = JSON.parse(rawReceipts)
    .filter(({ output }) => output.recordId !== removedId);
  for (const receipt of decodedReceipts) {
    receipt.output.bundleDigest = decodedCatalogue.bundleDigest;
    rebindReceipt(receipt);
  }
  assert.equal(decodedReceipts.length, 79);

  const alteredCatalogue = serialise(decodedCatalogue);
  const alteredReceipts = serialise(decodedReceipts);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addSchema(JSON.parse(await readFile(
    new URL("../../schemas/profile-record.schema.json", import.meta.url),
    "utf8",
  )));
  const validateCatalogue = ajv.compile(JSON.parse(await readFile(
    new URL("../../schemas/catalogue.schema.json", import.meta.url),
    "utf8",
  )));
  assert.equal(validateCatalogue(decodedCatalogue), false, "the published schema must require exactly 80 records");
  assert.match(ajv.errorsText(validateCatalogue.errors), /fewer than 80 items/u);

  await assert.rejects(
    createKnowledgeDiscoveryRuntime(
      alteredCatalogue,
      checksum(alteredCatalogue, "catalogue.json"),
      alteredReceipts,
      checksum(alteredReceipts, "receipts.json"),
    ),
    /from 80 to 80 items/u,
  );
});

test("all five registered input contracts stay in lockstep with the published schemas", async () => {
  const files = {
    search_government_knowledge: "search-government-knowledge-input.schema.json",
    get_resource_record: "get-resource-record-input.schema.json",
    show_provenance: "show-provenance-input.schema.json",
    explore_answer_foundations: "explore-answer-foundations-input.schema.json",
    compare_evidence_foundations: "compare-evidence-foundations-input.schema.json",
  };
  for (const [name, filename] of Object.entries(files)) {
    const published = JSON.parse(await readFile(new URL(`../../schemas/${filename}`, import.meta.url), "utf8"));
    delete published.$schema;
    delete published.$id;
    delete published.title;
    assert.deepEqual(TOOL_INPUT_SCHEMAS[name], published, `${name} drifted from ${filename}`);
  }
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

test("search rejects duplicate filters wherever the published schema uses uniqueItems", async () => {
  const discovery = await runtime();
  const duplicateResourceTypes = await discovery.search({ query: "content", resourceTypes: ["api", "api"] });
  const duplicateAccessStatuses = await discovery.search({ query: "content", accessStatuses: ["public", "public"] });
  const duplicateNormalisedPublishers = await discovery.search({
    query: "content",
    publishers: ["Government Digital Service", " Government  Digital Service "],
  });
  for (const result of [duplicateResourceTypes, duplicateAccessStatuses, duplicateNormalisedPublishers]) {
    assert.equal(result.ok, false);
    assert.match(result.error.message, /duplicate values/u);
  }
});

test("record identifiers use one canonical 128-character boundary in schemas and executable validation", async () => {
  const prefix = "govuk-discovery:";
  const atBoundary = `${prefix}${"a".repeat(112)}`;
  const overBoundary = `${prefix}${"a".repeat(113)}`;
  assert.equal(atBoundary.length, 128);
  assert.equal(overBoundary.length, 129);

  const discovery = await runtime();
  const admitted = await discovery.getRecord({ recordId: atBoundary });
  const rejected = await discovery.getRecord({ recordId: overBoundary });
  const paddedRecord = await discovery.getRecord({ recordId: " govuk-discovery:api:companies-house " });
  const paddedProvenance = await discovery.showProvenance({ recordId: " govuk-discovery:api:companies-house " });
  assert.equal(admitted.error.code, "record_not_found");
  assert.equal(rejected.error.code, "invalid_record_request");
  assert.equal(paddedRecord.error.code, "invalid_record_request");
  assert.equal(paddedProvenance.error.code, "invalid_provenance_request");
  assert.match(rejected.error.message, /at most 128 characters|invalid format/u);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validateProfile = ajv.compile(JSON.parse(await readFile(
    new URL("../../schemas/profile-record.schema.json", import.meta.url),
    "utf8",
  )));
  const candidate = structuredClone(JSON.parse(rawCatalogue).records[0]);
  candidate.id = atBoundary;
  assert.equal(validateProfile(candidate), true, JSON.stringify(validateProfile.errors, null, 2));
  candidate.id = overBoundary;
  assert.equal(validateProfile(candidate), false, "the profile schema must reject a 129-character record ID");
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

test("fails closed when a co-digested record violates the complete profile contract", async () => {
  for (const [label, mutate, expected] of [
    ["invalid licence status", (record) => { record.licence.status = "apparently-open"; }, /licence status is unsupported/u],
    ["unknown nested field", (record) => { record.access.privateNote = "not in the closed profile"; }, /unknown field privateNote/u],
    ["impossible observed date", (record) => { record.dates.observed = "2026-02-30T00:00:00Z"; }, /valid RFC 3339 date-time/u],
    ["timezone-less observed date", (record) => { record.dates.observed = "2026-08-30T00:00:00"; }, /valid RFC 3339 date-time/u],
  ]) {
    const decoded = JSON.parse(rawCatalogue);
    mutate(decoded.records[0]);
    rebindCatalogue(decoded);
    const altered = serialise(decoded);
    await assert.rejects(
      createKnowledgeDiscoveryRuntime(altered, checksum(altered, "catalogue.json"), rawReceipts, rawReceiptsChecksum),
      expected,
      label,
    );
  }
});

test("fails closed for an unsafe authoritative URL", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].canonicalHumanUrl = "javascript:alert(1)";
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, `${sha256(altered)}  catalogue.json\n`, rawReceipts, rawReceiptsChecksum),
    /authoritative human URL/iu,
  );
});

test("fails closed when a co-digested URL would be normalised before output", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].canonicalHumanUrl = "https://www.gov.uk/an unsafe path";
  rebindCatalogue(decoded);
  const altered = serialise(decoded);
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, checksum(altered, "catalogue.json"), rawReceipts, rawReceiptsChecksum),
    /credential-free HTTPS URL/u,
  );
});

test("fails closed when a receipt identifier is not derived from its record digest", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].provenance.evidenceReceiptId =
    `trusted-govuk-discovery:evidence-receipt:sha256:${"0".repeat(64)}`;
  const altered = serialise(decoded);
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, checksum(altered, "catalogue.json"), rawReceipts, rawReceiptsChecksum),
    /not derived from its record digest/u,
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

test("fails closed when self-digested receipt metadata is substituted", async () => {
  const mutations = [
    ["observed date", (receipt) => { receipt.observedAt = "2026-08-30T00:00:00Z"; }, /not bound/u],
    ["source lock", (receipt) => { receipt.sourceLock = "substituted-source-lock"; }, /not bound/u],
    ["source URL", (receipt) => { receipt.source.url = "https://www.gov.uk/"; }, /not bound/u],
    ["source title", (receipt) => { receipt.source.title = "Substituted official title"; }, /not bound/u],
    ["source publisher", (receipt) => { receipt.source.publisher = "Cabinet Office"; }, /not bound/u],
    ["source digest", (receipt) => { receipt.source.sourceDigest = "0".repeat(64); }, /not bound/u],
    ["assertion status order", (receipt) => { receipt.assertionStatuses.reverse(); }, /not bound/u],
    ["limitation", (receipt) => { receipt.limitations[0] = "Substituted limitation."; }, /not bound/u],
    ["source-refetch boundary", (receipt) => { receipt.boundaries.sourceWasNotRefetchedAtRuntime = false; }, /boundary constants/u],
    ["signature boundary", (receipt) => { receipt.boundaries.cryptographicSignatureVerified = true; }, /boundary constants/u],
    ["access boundary", (receipt) => { receipt.boundaries.accessAuthorityGranted = true; }, /boundary constants/u],
    ["unknown nested field", (receipt) => { receipt.source.unpublished = true; }, /unknown field unpublished/u],
  ];
  for (const [label, mutate, expected] of mutations) {
    const decoded = JSON.parse(rawReceipts);
    mutate(decoded[0]);
    rebindReceipt(decoded[0]);
    const altered = serialise(decoded);
    await assert.rejects(
      createKnowledgeDiscoveryRuntime(rawCatalogue, rawCatalogueChecksum, altered, checksum(altered, "receipts.json")),
      expected,
      label,
    );
  }
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
  ajv.addSchema(await loadSchema("error-result.schema.json"));
  ajv.addSchema(await loadSchema("public-record-summary.schema.json"));
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
