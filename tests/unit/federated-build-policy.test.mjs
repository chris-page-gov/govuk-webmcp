import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { gunzipSync } from "node:zlib";

import {
  FEDERATED_QUARANTINED_RECORD_COUNT,
  FEDERATED_SEARCHABLE_RECORD_COUNT,
  FEDERATED_SOURCE_RECORD_COUNT,
  addRecordPostings,
  assertion,
  chargeFederatedGeneratedBytes,
  classifyLandRegistryRecord,
  createFederatedBuildBudget,
  explicitAuthorityRole,
  normaliseRecord,
  partitionPostingsFragments,
  postingFragments,
} from "../../scripts/build-federated-search.mjs";

const root = new URL("../../", import.meta.url);
const lock = JSON.parse(fs.readFileSync(new URL("app/data/sources/okf-federation-lock.json", root), "utf8"));
const landRegistry = lock.sources.find(({ id }) => id === "land-registry");

function hmlrRows() {
  return landRegistry.recordArtifacts.flatMap((artifact) =>
    JSON.parse(gunzipSync(fs.readFileSync(new URL(artifact.storedPath, root)))));
}

function clone(value) {
  return structuredClone(value);
}

function postingRecord(token, ordinal) {
  return {
    ordinal,
    title: token,
    description: token,
    publisher: token,
    topics: [token],
    resourceType: token,
    sourceNativeId: token,
  };
}

test("quarantines exactly the three standalone HMLR legislation records", () => {
  assert.equal(FEDERATED_SOURCE_RECORD_COUNT, 58_655);
  assert.equal(FEDERATED_QUARANTINED_RECORD_COUNT, 3);
  assert.equal(FEDERATED_SEARCHABLE_RECORD_COUNT, 58_652);

  const rows = hmlrRows();
  const classified = rows.map(classifyLandRegistryRecord);
  assert.equal(rows.length, 2_203);
  assert.equal(classified.filter(({ status }) => status === "searchable").length, 2_200);
  assert.deepEqual(
    classified.filter(({ status }) => status === "quarantined").map(({ sourceNativeId }) => sourceNativeId).sort(),
    [
      "hmlr-7642b10e17c059b3b30215d2",
      "hmlr-e9880f0f70f3a0ddfe2539a8",
      "hmlr-c16f457f24573e504b8cc23f",
    ].sort(),
  );
});

test("rejects HMLR scope drift, sensitive fields and undeclared legislation", () => {
  const rows = hmlrRows();
  const searchable = rows.find((row) => classifyLandRegistryRecord(row).status === "searchable");
  const legislation = rows.find((row) => classifyLandRegistryRecord(row).status === "quarantined");

  const schemaDrift = clone(searchable);
  schemaDrift.schema = "okf-hmlr-title-register.v1";
  assert.throws(() => classifyLandRegistryRecord(schemaDrift), /outside the admitted metadata schema/u);

  const sensitive = clone(searchable);
  sensitive.owner_name = "Example owner";
  assert.throws(() => classifyLandRegistryRecord(sensitive), /prohibited sensitive field/u);

  const nestedSensitive = clone(searchable);
  nestedSensitive.extra = { property: { address: "1 Example Road" } };
  assert.throws(() => classifyLandRegistryRecord(nestedSensitive), /prohibited sensitive field/u);

  const titleRegister = clone(searchable);
  titleRegister.source_native_type = "title-register";
  assert.throws(() => classifyLandRegistryRecord(titleRegister), /prohibited source_native_type classification/u);

  const fourthLegislationRow = clone(legislation);
  fourthLegislationRow.record_id = "hmlr-unreviewed-legislation-record";
  fourthLegislationRow.id = "hmlr-unreviewed-legislation-record";
  assert.throws(() => classifyLandRegistryRecord(fourthLegislationRow), /undeclared standalone legislation row/u);
});

test("never promotes producer text to an official federated label", () => {
  for (const value of ["official", "unofficial", "not official", "OFFICIAL-SOURCE", "producer-declared"]) {
    assert.equal(explicitAuthorityRole(value, "producer-record"), "producer-declared-source");
  }
  assert.equal(explicitAuthorityRole(null, "producer-record"), "producer-record");

  for (const value of ["official", "unofficial", "not official", "model-derived", "inferred"]) {
    assert.equal(assertion({ assertion_status: value }).status, "producer-declared");
  }
  assert.equal(assertion({ assertion_status: "deterministically-normalised" }).status, "normalised");
  assert.equal(assertion({}).status, "normalised");

  const record = normaliseRecord(
    { id: "land-registry" },
    {
      record_id: "metadata-1",
      title: "Recorded metadata",
      description: "Source-derived description",
      publisher_title: "Example producer",
      canonical_source_url: "https://example.invalid/record",
      authority_role: "not official",
      assertion_status: "official",
    },
    { sourcePath: "data/explorer/datasets-000.json", sourceSha256: "0".repeat(64) },
    56_452,
    new Map(),
  );
  assert.equal(record.authoritativeLink.role, "producer-declared-source");
  assert.equal(record.assertionStatus, "producer-declared");

  for (const excludedUrl of [
    "https://legislation.gov.uk/ukpga/2002/9/contents",
    "https://www.legislation.gov.uk/ukpga/2002/9/contents",
    "https://data.legislation.gov.uk/example",
    "https://www.legislation.gov.uk./ukpga/2002/9/contents",
  ]) {
    for (const field of ["url", "documentation", "licence_url"]) {
      assert.throws(
        () => normaliseRecord(
          { id: "government-apis" },
          { id: `excluded-${field}-${excludedUrl}`, title: "Excluded link", [field]: excludedUrl },
          { sourcePath: "data/search/records-000.json", sourceSha256: "0".repeat(64) },
          1,
          new Map(),
        ),
        /excluded legislation\.gov\.uk result link/u,
      );
    }
  }
});

test("partitions constructor safely with exact incremental byte accounting", () => {
  const record = postingRecord("constructor", 0);
  const postings = new Map();
  addRecordPostings(postings, record, createFederatedBuildBudget());
  const fragments = postingFragments(postings).get("co");
  const first = partitionPostingsFragments("ons", "co", fragments);
  const second = partitionPostingsFragments("ons", "co", fragments);
  assert.deepEqual(first, second);
  assert.deepEqual(first[0].entries.constructor, [[0, 38, 63]]);

  for (const [part, partition] of first.entries()) {
    const value = {
      schema: "govuk-webmcp.federated-postings-shard.v1",
      collectionId: "ons",
      prefix: "co",
      part,
      entries: partition.entries,
    };
    assert.equal(Buffer.byteLength(`${JSON.stringify(value)}\n`), partition.bytes);
  }

  const manyFragments = Array.from({ length: 30 }, (_, index) => [
    `aa${String(index).padStart(3, "0")}`,
    [[index, 1, 1]],
  ]);
  const split = partitionPostingsFragments("ons", "aa", manyFragments, { maximumBytes: 220 });
  assert.ok(split.length > 1);
  for (const [part, partition] of split.entries()) {
    const value = {
      schema: "govuk-webmcp.federated-postings-shard.v1",
      collectionId: "ons",
      prefix: "aa",
      part,
      entries: partition.entries,
    };
    assert.equal(Buffer.byteLength(`${JSON.stringify(value)}\n`), partition.bytes);
    assert.ok(partition.bytes <= 220);
  }
});

test("enforces aggregate unique-token, posting and generated-byte caps", () => {
  const tokenBudget = createFederatedBuildBudget({
    maximumUniqueTokens: 1,
    maximumPostings: 10,
    maximumGeneratedBytes: 10,
  });
  const tokenPostings = new Map();
  addRecordPostings(tokenPostings, postingRecord("alpha", 0), tokenBudget);
  assert.throws(
    () => addRecordPostings(tokenPostings, postingRecord("beta", 1), tokenBudget),
    /unique-token build cap/u,
  );

  const postingBudget = createFederatedBuildBudget({
    maximumUniqueTokens: 10,
    maximumPostings: 1,
    maximumGeneratedBytes: 10,
  });
  const repeatedPostings = new Map();
  addRecordPostings(repeatedPostings, postingRecord("alpha", 0), postingBudget);
  assert.throws(
    () => addRecordPostings(repeatedPostings, postingRecord("alpha", 1), postingBudget),
    /posting build cap/u,
  );

  const byteBudget = createFederatedBuildBudget({
    maximumUniqueTokens: 1,
    maximumPostings: 1,
    maximumGeneratedBytes: 4,
  });
  chargeFederatedGeneratedBytes(byteBudget, 4);
  assert.throws(() => chargeFederatedGeneratedBytes(byteBudget, 1), /byte output cap/u);
});
