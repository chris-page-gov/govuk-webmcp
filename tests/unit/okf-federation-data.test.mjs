import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  buildFederatedSearch,
  FEDERATED_QUARANTINED_RECORD_COUNT,
  FEDERATED_RECORD_COUNT,
  FEDERATED_SEARCHABLE_RECORD_COUNT,
  FEDERATED_SOURCE_RECORD_COUNT,
  MAX_POSTINGS_SHARD_BYTES,
  MAX_RECORD_SHARD_BYTES,
  validateFederationLock,
} from "../../scripts/build-federated-search.mjs";
import {
  canonicalJson,
  EXPECTED_FEDERATION_SOURCES,
  FEDERATION_LOCK_PATH,
  resolveAllowedUrl,
  sha256,
} from "../../scripts/import-okf-federation.mjs";

const ROOT = resolve(import.meta.dirname, "../..");

async function filesUnder(directory, prefix = "") {
  const rows = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) rows.push(...await filesUnder(path, name));
    else rows.push({ name, bytes: await readFile(path) });
  }
  return rows.sort((left, right) => left.name.localeCompare(right.name, "en-GB"));
}

function treeDigest(rows) {
  const hash = createHash("sha256");
  for (const row of rows) hash.update(row.name).update("\0").update(row.bytes).update("\0");
  return hash.digest("hex");
}

async function sourceLock() {
  return JSON.parse(await readFile(resolve(ROOT, FEDERATION_LOCK_PATH), "utf8"));
}

function withoutField(value, field) {
  const copy = structuredClone(value);
  delete copy[field];
  return copy;
}

function sourceIdentity(source) {
  return {
    id: source.id,
    revision: source.revision,
    revisionReproducibility: source.revisionReproducibility,
    snapshot: source.snapshot,
    baseUrl: source.baseUrl,
    descriptor: source.descriptor,
    dataManifest: source.dataManifest,
    searchManifest: source.searchManifest,
    population: source.population,
    recordArtifacts: source.recordArtifacts,
    supportingArtifacts: source.supportingArtifacts,
  };
}

function redigest(lock) {
  for (const source of lock.sources) {
    source.entryDigest = sha256(canonicalJson(withoutField(source, "entryDigest")));
  }
  const artifacts = lock.sources.flatMap((source) => [...source.recordArtifacts, ...source.supportingArtifacts]);
  lock.aggregate = {
    sourceCount: lock.sources.length,
    recordCount: lock.sources.reduce((total, source) => total + source.population.records, 0),
    artifactCount: artifacts.length,
    decodedArtifactBytes: artifacts.reduce((total, artifact) => total + artifact.sourceBytes, 0),
    storedArtifactBytes: artifacts.reduce((total, artifact) => total + artifact.storedBytes, 0),
    sourceIdentityDigest: sha256(canonicalJson(lock.sources.map(sourceIdentity))),
    aggregateDigest: "",
  };
  lock.aggregate.aggregateDigest = sha256(canonicalJson(withoutField(lock.aggregate, "aggregateDigest")));
  lock.lockDigest = sha256(canonicalJson(withoutField(lock, "lockDigest")));
  return lock;
}

test("the exact four public OKF source identities are fixed in display order", () => {
  assert.deepEqual(EXPECTED_FEDERATION_SOURCES.map(({ id }) => id), [
    "uk-living", "ons", "government-apis", "land-registry",
  ]);
  assert.equal(
    EXPECTED_FEDERATION_SOURCES.reduce((total, source) => total + source.population.records, 0),
    FEDERATED_RECORD_COUNT,
  );
  for (const source of EXPECTED_FEDERATION_SOURCES) {
    assert.match(source.baseUrl, /^https:\/\/chris-page-gov\.github\.io\/[A-Za-z0-9-]+\/$/u);
    assert.match(source.revision, /^[a-f0-9]{40}$/u);
    assert.match(source.descriptor.sha256, /^[a-f0-9]{64}$/u);
  }
});

test("URL resolution stays inside each exact credential-free source base", () => {
  const source = EXPECTED_FEDERATION_SOURCES[0];
  assert.equal(resolveAllowedUrl(source.baseUrl, source.descriptor.path), `${source.baseUrl}${source.descriptor.path}`);
  for (const path of [
    "../outside.json", "https://example.test/outside.json", "data/../../outside.json",
    "data\\outside.json", "data/file.json?x=1",
  ]) {
    assert.throws(() => resolveAllowedUrl(source.baseUrl, path), /safe relative path|escapes/u);
  }
  assert.throws(
    () => resolveAllowedUrl("https://person:secret@chris-page-gov.github.io/okf-uk-living/", "okf-explorer.json"),
    /credential-free/u,
  );
});

test("the source lock and every deterministic gzip source artifact validate offline", async () => {
  const lock = await sourceLock();
  const validated = await validateFederationLock(lock, { rootDir: ROOT });
  assert.equal(validated.aggregate.recordCount, FEDERATED_RECORD_COUNT);
  assert.equal(validated.aggregate.artifactCount, 73);
  assert.deepEqual(validated.sources.map(({ id }) => id), ["uk-living", "ons", "government-apis", "land-registry"]);
});

test("co-digested semantic count, snapshot, revision and path mutations fail closed", async (t) => {
  const original = await sourceLock();
  const cases = [
    ["count", (lock) => { lock.sources[0].population.records += 1; }],
    ["snapshot", (lock) => { lock.sources[0].snapshot = "substituted-snapshot"; }],
    ["revision", (lock) => { lock.sources[0].revision = "0".repeat(40); }],
    ["path", (lock) => { lock.sources[0].descriptor.path = "substituted/okf-explorer.json"; }],
  ];
  for (const [label, mutate] of cases) {
    await t.test(label, async () => {
      const changed = structuredClone(original);
      mutate(changed);
      redigest(changed);
      await assert.rejects(
        validateFederationLock(changed, { rootDir: ROOT, verifyFiles: false }),
        /drifted|differs|decision/u,
      );
    });
  }
});

test("the offline build is byte-idempotent and emits isolated bounded digest-bound collections", async () => {
  const output = await mkdtemp(join(os.tmpdir(), "govuk-webmcp-federation-"));
  const first = await buildFederatedSearch({ rootDir: ROOT, outputDirectory: output });
  const firstFiles = await filesUnder(output);
  const firstDigest = treeDigest(firstFiles);
  const second = await buildFederatedSearch({ rootDir: ROOT, outputDirectory: output });
  const secondFiles = await filesUnder(output);
  assert.equal(treeDigest(secondFiles), firstDigest);
  assert.equal(second.manifest.manifestDigest, first.manifest.manifestDigest);
  assert.equal(second.manifest.sourceRecordCount, FEDERATED_SOURCE_RECORD_COUNT);
  assert.equal(second.manifest.quarantinedRecordCount, FEDERATED_QUARANTINED_RECORD_COUNT);
  assert.equal(second.manifest.recordCount, FEDERATED_SEARCHABLE_RECORD_COUNT);
  assert.equal(FEDERATED_RECORD_COUNT, FEDERATED_SOURCE_RECORD_COUNT);
  assert.equal(second.manifest.projectionProfile, "govuk-webmcp.federated-record-inheritance.v1");
  assert.equal(second.manifest.sourceLockDigest, (await sourceLock()).lockDigest);
  assert.deepEqual(second.manifest.collections.map(({ id }) => id), [
    "uk-living", "ons", "government-apis", "land-registry",
  ]);

  let nextOrdinal = 0;
  for (const collection of second.manifest.collections) {
    assert.equal(collection.sourceRecordCount, collection.recordCount + collection.quarantinedRecordCount);
    assert.equal(collection.firstOrdinal, nextOrdinal);
    assert.equal(collection.lastOrdinal, nextOrdinal + collection.recordCount - 1);
    assert.equal(
      collection.recordShards.reduce((total, shard) => total + shard.recordCount, 0),
      collection.recordCount,
    );
    for (const shard of collection.recordShards) {
      assert.equal(shard.collectionId, collection.id);
      assert.ok(shard.path.includes(`/records/${collection.id}/`));
      assert.ok(shard.bytes <= MAX_RECORD_SHARD_BYTES);
    }
    for (const references of Object.values(collection.postings)) {
      for (const shard of references) {
        assert.equal(shard.collectionId, collection.id);
        assert.ok(shard.path.includes(`/postings/${collection.id}/`));
        assert.ok(shard.bytes <= MAX_POSTINGS_SHARD_BYTES);
      }
    }
    nextOrdinal = collection.lastOrdinal + 1;
  }
  assert.equal(nextOrdinal, FEDERATED_SEARCHABLE_RECORD_COUNT);
  assert.equal(
    second.manifest.collections.reduce((total, collection) => total + collection.sourceRecordCount, 0),
    FEDERATED_SOURCE_RECORD_COUNT,
  );
  assert.equal(
    second.manifest.collections.reduce((total, collection) => total + collection.quarantinedRecordCount, 0),
    FEDERATED_QUARANTINED_RECORD_COUNT,
  );

  const firstRecordReference = second.manifest.collections[0].recordShards[0];
  const firstRecordShard = JSON.parse(await readFile(join(output, firstRecordReference.path.replace("data/federated-search/", "")), "utf8"));
  const firstRecord = firstRecordShard.records[0];
  assert.equal(firstRecord.ordinal, 0);
  assert.equal(`govuk-discovery:federated:${firstRecordShard.collectionId}:${firstRecord.ordinal}`, "govuk-discovery:federated:uk-living:0");
  assert.match(sha256(firstRecord.sourceNativeId), /^[a-f0-9]{64}$/u);
  assert.equal(firstRecord.id, undefined);
  assert.equal(firstRecord.collectionId, undefined);
  assert.equal(firstRecord.sourceNativeIdSha256, undefined);
  assert.equal(firstRecord.recordDigest, sha256(canonicalJson(withoutField(firstRecord, "recordDigest"))));

  const manifestBytes = await readFile(join(output, "manifest.json"));
  const checksum = (await readFile(join(output, "manifest.json.sha256"), "utf8")).split(/\s+/u)[0];
  assert.equal(checksum, sha256(manifestBytes));
});
