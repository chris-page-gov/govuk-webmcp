import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

const moduleHref = process.env.FEDERATED_SEARCH_RUNTIME_MODULE
  ? new URL(process.env.FEDERATED_SEARCH_RUNTIME_MODULE, import.meta.url).href
  : new URL("../../dist/src/federated-search-runtime.js", import.meta.url).href;

const {
  FEDERATED_SEARCH_LIMITS,
  FederatedSearchRuntime,
  createFederatedSearchRuntime,
} = await import(moduleHref);

const COLLECTIONS = [
  {
    admissionId: "corpus:uk-life-course",
    id: "uk-living",
    title: "A Life in the UK — life-course discovery corpus",
    sourceCount: 9_757,
    quarantinedCount: 0,
    count: 9_757,
    first: 0,
    last: 9_756,
    snapshot: "life-course-authority-infrastructure-2026-08-08",
    revision: "4bc010eab3c9c072f68960393c1458a772aa700b",
    descriptorUrl: "https://chris-page-gov.github.io/okf-uk-living/okf-explorer.json",
    serviceFamilies: 293,
  },
  {
    admissionId: "corpus:ons-metadata",
    id: "ons",
    title: "ONS data discovery OKF",
    sourceCount: 5_097,
    quarantinedCount: 0,
    count: 5_097,
    first: 9_757,
    last: 14_853,
    snapshot: "monday-2026-07-17-r2",
    revision: "b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf",
    descriptorUrl: "https://chris-page-gov.github.io/okf-ons/okf-explorer.json",
  },
  {
    admissionId: "corpus:uk-government-apis",
    id: "government-apis",
    title: "UK Government APIs OKF",
    sourceCount: 41_598,
    quarantinedCount: 0,
    count: 41_598,
    first: 14_854,
    last: 56_451,
    snapshot: null,
    revision: "55c7e67947dfd86e291ca987e354429c36b453d9",
    descriptorUrl: "https://chris-page-gov.github.io/okf-uk-government-apis/okf-explorer.json",
  },
  {
    admissionId: "corpus:land-registry-metadata",
    id: "land-registry",
    title: "HM Land Registry public-estate OKF",
    sourceCount: 2_203,
    quarantinedCount: 3,
    count: 2_200,
    first: 56_452,
    last: 58_651,
    snapshot: "hmlr-public-metadata-v0.2.0",
    revision: "1d708e39f2cde19610d43c5a7f5e36e4a2f947bc",
    descriptorUrl: "https://chris-page-gov.github.io/okf-LandRegistry/okf-explorer.json",
  },
];

const WEIGHTS = {
  title: 16,
  description: 5,
  publisher: 8,
  topics: 4,
  resourceType: 3,
  sourceNativeId: 2,
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function without(value, key) {
  return Object.fromEntries(Object.entries(value).filter(([candidate]) => candidate !== key));
}

function bytes(value) {
  return new TextEncoder().encode(JSON.stringify(value));
}

function finaliseRecord(record) {
  record.recordDigest = sha256(canonicalJson(without(record, "recordDigest")));
  return record;
}

function makeRecord(collection, ordinal, matched = false) {
  const sourceNativeId = `native:${collection.id}:${ordinal}`;
  return finaliseRecord({
    ordinal,
    sourceNativeId,
    title: matched ? `Housing evidence ${ordinal}` : `Catalogue record ${ordinal}`,
    description: matched ? "Housing service discovery metadata." : "Bounded source-snapshot metadata.",
    resourceType: "dataset",
    publisher: `${collection.title} publisher`,
    topics: matched ? ["housing"] : ["catalogue"],
    authoritativeLink: {
      url: `https://example.gov.uk/${collection.id}/${ordinal}`,
      role: "producer-declared-source",
      label: "Open the producer-declared source",
    },
    documentationUrl: null,
    licence: { status: "missing", title: null, url: null },
    access: { status: "public", note: "Producer-declared public metadata access." },
    assertionStatus: "producer-declared",
    sourcePath: `data/${collection.id}-records.json`,
    sourceSha256: sha256(`${collection.id}:source`),
    limitations: ["This item has no direct field-level review."],
    recordDigest: "",
  });
}

function fixture() {
  const assets = new Map();
  const values = new Map();
  const references = new Map();
  const matchOrdinals = new Map();
  const manifestCollections = [];

  for (const [collectionIndex, collection] of COLLECTIONS.entries()) {
    const shardCount = Math.ceil(collection.count / 500);
    const recordShards = [];
    for (let part = 0; part < shardCount; part += 1) {
      const firstOrdinal = collection.first + part * 500;
      const recordCount = Math.min(500, collection.last - firstOrdinal + 1);
      const lastOrdinal = firstOrdinal + recordCount - 1;
      recordShards.push({
        collectionId: collection.id,
        path: `data/federated-search/records/${collection.id}/records-${String(part).padStart(3, "0")}.json`,
        bytes: 128,
        sha256: sha256(`${collection.id}:unloaded:${part}`),
        firstOrdinal,
        lastOrdinal,
        recordCount,
      });
    }

    const loadedReference = recordShards.at(-1);
    const matchedOrdinals = [loadedReference.firstOrdinal, loadedReference.firstOrdinal + 1];
    matchOrdinals.set(collection.id, matchedOrdinals);
    const recordShard = {
      schema: "govuk-webmcp.federated-record-shard.v1",
      collectionId: collection.id,
      firstOrdinal: loadedReference.firstOrdinal,
      lastOrdinal: loadedReference.lastOrdinal,
      records: Array.from({ length: loadedReference.recordCount }, (_, index) =>
        makeRecord(collection, loadedReference.firstOrdinal + index, index < matchedOrdinals.length)),
    };
    const recordBytes = bytes(recordShard);
    loadedReference.bytes = recordBytes.byteLength;
    loadedReference.sha256 = sha256(recordBytes);
    assets.set(loadedReference.path, recordBytes);
    values.set(loadedReference.path, recordShard);
    references.set(loadedReference.path, loadedReference);

    const postingRows = collectionIndex === 0
      ? [[matchedOrdinals[1], 11, 1], [matchedOrdinals[0], 31, 3]].sort((left, right) => left[0] - right[0])
      : collectionIndex === 1
        ? [[matchedOrdinals[0], 21, 1], [matchedOrdinals[1], 21, 2]]
        : collectionIndex === 2
          ? [[matchedOrdinals[0], 51, 1], [matchedOrdinals[1], 6, 2]]
          : [[matchedOrdinals[0], 41, 1], [matchedOrdinals[1], 5, 2]];
    const postingsShard = {
      schema: "govuk-webmcp.federated-postings-shard.v1",
      collectionId: collection.id,
      prefix: "ho",
      part: 0,
      entries: { housing: postingRows },
    };
    const postingsBytes = bytes(postingsShard);
    const postingsReference = {
      collectionId: collection.id,
      path: `data/federated-search/postings/${collection.id}/ho-000.json`,
      bytes: postingsBytes.byteLength,
      sha256: sha256(postingsBytes),
      tokenCount: 1,
      postingCount: postingRows.length,
    };
    assets.set(postingsReference.path, postingsBytes);
    values.set(postingsReference.path, postingsShard);
    references.set(postingsReference.path, postingsReference);

    manifestCollections.push({
      id: collection.id,
      title: collection.title,
      sourceRecordCount: collection.sourceCount,
      quarantinedRecordCount: collection.quarantinedCount,
      recordCount: collection.count,
      firstOrdinal: collection.first,
      lastOrdinal: collection.last,
      ...(collection.serviceFamilies === undefined ? {} : { serviceFamilies: collection.serviceFamilies }),
      snapshot: collection.snapshot,
      revision: collection.revision,
      deploymentId: `pages-${collection.id}-2026-08-30`,
      descriptorUrl: collection.descriptorUrl,
      extractionMethod: "deterministic projection from a checksum-bound published OKF source snapshot",
      limitations: collection.id === "ons"
        ? ["The repository revision does not by itself reproduce the ignored generated Pages bundle whose deployed bytes are locked separately."]
        : ["This is a bounded discovery snapshot and does not establish current accuracy or official endorsement."],
      recordShards,
      postings: { ho: [postingsReference] },
      collectionDigest: "",
    });
  }

  const manifest = {
    schema: "govuk-webmcp.federated-search.v1",
    generatedAt: "2026-08-30T00:00:00Z",
    evidenceTier: "federated-source-snapshot",
    projectionProfile: "govuk-webmcp.federated-record-inheritance.v1",
    sourceLockSha256: sha256("raw source lock"),
    sourceLockDigest: sha256("semantic source lock"),
    sourceRecordCount: 58_655,
    quarantinedRecordCount: 3,
    recordCount: 58_652,
    collectionCount: 4,
    recordShardSize: 500,
    tokenisation: "nfkd-lowercase-ascii-alphanumeric-v1",
    weights: { ...WEIGHTS },
    collections: manifestCollections,
    manifestDigest: "",
  };

  function refreshDigests() {
    for (const collection of manifest.collections) {
      collection.collectionDigest = sha256(canonicalJson(without(collection, "collectionDigest")));
    }
    manifest.manifestDigest = sha256(canonicalJson(without(manifest, "manifestDigest")));
  }

  function refreshAsset(path) {
    const value = values.get(path);
    const reference = references.get(path);
    const encoded = bytes(value);
    assets.set(path, encoded);
    reference.bytes = encoded.byteLength;
    reference.sha256 = sha256(encoded);
  }

  refreshDigests();
  return { manifest, assets, values, references, matchOrdinals, refreshDigests, refreshAsset };
}

function manifestText(value) {
  return JSON.stringify(value);
}

function loaderFor(fixtureValue, calls = [], override) {
  return async (path, options) => {
    calls.push({ path, options });
    if (override) {
      const result = await override(path, options, fixtureValue.assets.get(path));
      if (result !== undefined) return result;
    }
    const value = fixtureValue.assets.get(path);
    if (!value) throw new Error(`Fixture has no bytes for ${path}`);
    return new Uint8Array(value);
  };
}

async function runtimeFor(fixtureValue, calls = [], override) {
  const raw = manifestText(fixtureValue.manifest);
  return createFederatedSearchRuntime(
    raw,
    `${sha256(raw)}  manifest.json\n`,
    loaderFor(fixtureValue, calls, override),
    bindingFor(fixtureValue),
  );
}

function bindingFor(fixtureValue) {
  const {
    sourceLockSha256,
    sourceLockDigest,
    sourceRecordCount,
    quarantinedRecordCount,
    recordCount,
  } = fixtureValue.manifest;
  return {
    sourceLockSha256,
    sourceLockDigest,
    sourceRecordCount,
    quarantinedRecordCount,
    recordCount,
    collectionBindings: COLLECTIONS.map((collection) => ({
      admissionId: collection.admissionId,
      collectionId: collection.id,
      sourceRecordCount: collection.sourceCount,
      quarantinedRecordCount: collection.quarantinedCount,
      recordCount: collection.count,
    })),
  };
}

async function waitFor(predicate, maximumMilliseconds = 500) {
  const deadline = performance.now() + maximumMilliseconds;
  while (!predicate() && performance.now() < deadline) {
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 5));
  }
  return predicate();
}

function collectionStatus(result, id) {
  return result.collectionStatuses.find(({ collectionId }) => collectionId === id);
}

test("validates the production identity, exposes immutable metadata and remains lazy", async () => {
  const value = fixture();
  const calls = [];
  const runtime = await runtimeFor(value, calls);
  assert.ok(runtime instanceof FederatedSearchRuntime);
  assert.equal(runtime.sourceRecordCount, 58_655);
  assert.equal(runtime.quarantinedRecordCount, 3);
  assert.equal(runtime.recordCount, 58_652);
  assert.deepEqual(runtime.collectionIds, ["uk-living", "ons", "government-apis", "land-registry"]);
  assert.equal(runtime.collections[0].recordCount, 9_757);
  assert.equal(runtime.collections[3].sourceRecordCount, 2_203);
  assert.equal(runtime.collections[3].quarantinedRecordCount, 3);
  assert.equal(runtime.collections[3].recordCount, 2_200);
  assert.equal(runtime.collections[3].lastOrdinal, 58_651);
  assert.ok(Object.isFrozen(runtime.collections));
  assert.ok(Object.isFrozen(runtime.collections[0]));
  assert.equal(calls.length, 0, "manifest validation must not fetch a postings or record shard");
});

test("ranks within each source, merges sources fairly and uses exact credential-free loader options", async () => {
  const value = fixture();
  const calls = [];
  const runtime = await runtimeFor(value, calls);
  const result = await runtime.search({ query: "housing", limit: 8 });
  assert.equal(result.ok, true);
  assert.equal(result.totalMatches, 8);
  assert.equal(result.totalRelation, "eq");
  assert.equal(result.returned, 8);
  assert.deepEqual(
    result.results.slice(0, 4).map(({ collectionId }) => collectionId),
    ["uk-living", "ons", "government-apis", "land-registry"],
  );
  assert.deepEqual(result.results.slice(0, 4).map(({ match }) => match.localRank), [1, 1, 1, 1]);
  assert.equal(result.results[0].match.explanation, "Source-local lexical relevance; this is not a trust score.");
  assert.equal(result.results[0].evidenceReceiptId, undefined);
  assert.ok(calls.every(({ options }) => options.credentials === "omit" && options.redirect === "error" && options.signal instanceof AbortSignal));
  assert.equal(collectionStatus(result, "uk-living").verifiedShardFiles, 2);
  assert.equal(collectionStatus(result, "uk-living").verifiedShardBytes,
    value.assets.get("data/federated-search/postings/uk-living/ho-000.json").byteLength +
    value.assets.get("data/federated-search/records/uk-living/records-019.json").byteLength);

  const callsBeforeCacheHit = calls.length;
  const repeated = await runtime.search({ query: "housing", limit: 8 });
  assert.deepEqual(repeated, result, "cache reuse must not change the canonical page/tool result");
  assert.equal(calls.length, callsBeforeCacheHit, "verified shards should be served from the bounded cache");
});

test("applies the closed collection filter without initialising unselected sources", async () => {
  const value = fixture();
  const calls = [];
  const runtime = await runtimeFor(value, calls);
  const result = await runtime.search({ query: "housing", collections: ["ons"], limit: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.totalMatches, 2);
  assert.deepEqual(result.results.map(({ collectionId }) => collectionId), ["ons", "ons"]);
  assert.deepEqual(result.collectionStatuses.map(({ collectionId }) => collectionId), ["ons"]);
  assert.ok(calls.every(({ path }) => path.includes("/ons/")));
});

test("rejects personal context, URL fields and hostile search input before any load or caller hook", async () => {
  const value = fixture();
  const calls = [];
  const runtime = await runtimeFor(value, calls);
  for (const input of [
    { query: "housing", personalContext: { age: 42 } },
    { query: "housing", profile: "private" },
    { query: "housing", location: "home" },
    { query: "housing", history: ["earlier query"] },
    { query: "housing", URL: "https://example.gov.uk/" },
    { query: "housing", collections: ["legislation"] },
    { query: "one two three four five six seven eight nine ten eleven twelve thirteen" },
  ]) {
    const result = await runtime.search(input);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "invalid_federated_search_request");
  }
  let getterCalls = 0;
  let coercionCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, "query", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "housing";
    },
  });
  assert.equal((await runtime.search(accessor)).ok, false);

  const inherited = ["ons"];
  const prototype = Object.create(Array.prototype);
  Object.defineProperty(prototype, "map", {
    configurable: true,
    get() {
      getterCalls += 1;
      return Array.prototype.map;
    },
  });
  Object.setPrototypeOf(inherited, prototype);

  const indexedAccessor = ["ons"];
  Object.defineProperty(indexedAccessor, "0", {
    configurable: true,
    enumerable: true,
    get() {
      getterCalls += 1;
      return "ons";
    },
  });

  const hiddenIndex = ["ons"];
  Object.defineProperty(hiddenIndex, "0", {
    configurable: true,
    enumerable: false,
    value: "ons",
  });

  const namedExtra = ["ons"];
  Object.defineProperty(namedExtra, "privateContext", {
    configurable: true,
    enumerable: false,
    get() {
      getterCalls += 1;
      return "must not be read";
    },
  });

  const symbolExtra = ["ons"];
  Object.defineProperty(symbolExtra, Symbol("private-context"), {
    configurable: true,
    enumerable: true,
    get() {
      getterCalls += 1;
      return "must not be read";
    },
  });

  const numericPseudoIndex = ["ons"];
  Object.defineProperty(numericPseudoIndex, "4294967295", {
    configurable: true,
    enumerable: true,
    value: "must be rejected",
  });

  const coerciveCollection = {
    valueOf() {
      coercionCalls += 1;
      return "ons";
    },
    [Symbol.toPrimitive]() {
      coercionCalls += 1;
      return "ons";
    },
  };
  const coerciveLimit = {
    valueOf() {
      coercionCalls += 1;
      return 2;
    },
    [Symbol.toPrimitive]() {
      coercionCalls += 1;
      return 2;
    },
  };

  for (const collections of [
    inherited,
    indexedAccessor,
    hiddenIndex,
    new Array(1),
    namedExtra,
    symbolExtra,
    numericPseudoIndex,
    [coerciveCollection],
  ]) {
    const result = await runtime.search({ query: "housing", collections });
    assert.equal(result.ok, false, "federated search admitted a hostile collections representation");
    assert.equal(result.error.code, "invalid_federated_search_request");
  }
  const coerciveLimitResult = await runtime.search({ query: "housing", limit: coerciveLimit });
  assert.equal(coerciveLimitResult.ok, false);
  assert.equal(coerciveLimitResult.error.code, "invalid_federated_search_request");
  assert.equal(getterCalls, 0);
  assert.equal(coercionCalls, 0);
  assert.equal(calls.length, 0);
});

test("rejects raw checksum, self-digest and fully co-digested manifest semantic drift", async () => {
  const checksumFixture = fixture();
  const raw = manifestText(checksumFixture.manifest);
  await assert.rejects(
    createFederatedSearchRuntime(
      raw,
      `${"0".repeat(64)}  manifest.json\n`,
      loaderFor(checksumFixture),
      bindingFor(checksumFixture),
    ),
    /checksum does not match/u,
  );

  const selfDigestFixture = fixture();
  selfDigestFixture.manifest.generatedAt = "2026-08-30T01:00:00Z";
  const selfDigestRaw = manifestText(selfDigestFixture.manifest);
  await assert.rejects(
    createFederatedSearchRuntime(
      selfDigestRaw,
      `${sha256(selfDigestRaw)}  manifest.json\n`,
      loaderFor(selfDigestFixture),
      bindingFor(selfDigestFixture),
    ),
    /manifest digest does not match/u,
  );

  const countFixture = fixture();
  countFixture.manifest.collections[0].recordCount += 1;
  countFixture.refreshDigests();
  await assert.rejects(
    runtimeFor(countFixture),
    /lazy collection does not match its admitted collection population binding|count or ordinal range has drifted/u,
  );

  const traversalFixture = fixture();
  traversalFixture.manifest.collections[0].recordShards[0].path =
    "data/federated-search/records/uk-living/%2e%2e/records-000.json";
  traversalFixture.refreshDigests();
  await assert.rejects(runtimeFor(traversalFixture), /exact same-origin namespace/u);

  const schemaFixture = fixture();
  schemaFixture.manifest.schema = "govuk-webmcp.federated-search.v2";
  schemaFixture.refreshDigests();
  await assert.rejects(runtimeFor(schemaFixture), /schema is unsupported/u);
});

test("rejects a fully co-digested source-lock substitution against the separately admitted binding", async () => {
  for (const field of ["sourceLockSha256", "sourceLockDigest"]) {
    const value = fixture();
    const admittedBinding = bindingFor(value);
    value.manifest[field] = sha256(`substituted ${field}`);
    value.refreshDigests();
    const raw = manifestText(value.manifest);
    const calls = [];
    await assert.rejects(
      createFederatedSearchRuntime(
        raw,
        `${sha256(raw)}  manifest.json\n`,
        loaderFor(value, calls),
        admittedBinding,
      ),
      /not bound to the separately admitted source lock/u,
    );
    assert.equal(calls.length, 0, "binding failure must occur before any lazy shard can load");
  }
});

test("rejects a co-digested lazy per-source population that disagrees with the admission binding", async () => {
  const value = fixture();
  const calls = [];
  value.manifest.collections[2].sourceRecordCount -= 1;
  value.manifest.collections[2].recordCount -= 1;
  value.manifest.collections[3].sourceRecordCount += 1;
  value.manifest.collections[3].recordCount += 1;
  value.refreshDigests();

  await assert.rejects(
    createFederatedSearchRuntime(
      manifestText(value.manifest),
      `${sha256(manifestText(value.manifest))}  manifest.json\n`,
      loaderFor(value, calls),
      bindingFor(fixture()),
    ),
    /lazy collection does not match its admitted collection population binding/u,
  );
  assert.equal(calls.length, 0, "per-source population binding must fail before any lazy shard can load");
});

test("rejects a manifest whose worst valid query can exceed one collection budget", async () => {
  const value = fixture();
  const collection = value.manifest.collections[0];
  for (const prefix of ["aa", "ab", "ac", "ad"]) {
    collection.postings[prefix] = Array.from({ length: 16 }, (_, part) => ({
      collectionId: collection.id,
      path: `data/federated-search/postings/${collection.id}/${prefix}-${String(part).padStart(3, "0")}.json`,
      bytes: 2,
      sha256: sha256(`${prefix}:${part}`),
      tokenCount: 1,
      postingCount: 1,
    }));
  }
  value.refreshDigests();
  await assert.rejects(runtimeFor(value), /exceed its fixed per-collection fetch budget/u);
});

test("starts each selected collection independently when another collection is slow", async () => {
  const value = fixture();
  const calls = [];
  let releaseSlow;
  const slowBytes = value.assets.get("data/federated-search/postings/uk-living/ho-000.json");
  const slow = new Promise((resolvePromise) => {
    releaseSlow = () => resolvePromise(new Uint8Array(slowBytes));
  });
  const runtime = await runtimeFor(value, calls, async (path) => {
    if (path === "data/federated-search/postings/uk-living/ho-000.json") return slow;
    return undefined;
  });

  const pending = runtime.search({ query: "housing", limit: 8 });
  const otherCollectionsStarted = await waitFor(() => ["ons", "government-apis", "land-registry"].every((id) =>
    calls.some(({ path }) => path === `data/federated-search/postings/${id}/ho-000.json`)));
  releaseSlow();
  const result = await pending;

  assert.equal(otherCollectionsStarted, true, "a slow first source must not prevent the other selected sources from starting");
  assert.equal(result.ok, true);
  assert.ok(result.collectionStatuses.every(({ status }) => status === "ready"));
});

test("coalesces in-flight paths while preserving each caller's logical usage counters", async () => {
  const value = fixture();
  const calls = [];
  let activeLoads = 0;
  let maximumActiveLoads = 0;
  const runtime = await runtimeFor(value, calls, async (_path, _options, original) => {
    activeLoads += 1;
    maximumActiveLoads = Math.max(maximumActiveLoads, activeLoads);
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 20));
    activeLoads -= 1;
    return new Uint8Array(original);
  });

  const results = await Promise.all(Array.from({ length: 12 }, () =>
    runtime.search({ query: "housing", limit: 8 })));
  assert.ok(results.every(({ ok }) => ok === true));
  assert.ok(results.every((result) => JSON.stringify(result) === JSON.stringify(results[0])));
  assert.equal(calls.length, new Set(calls.map(({ path }) => path)).size, "each cold path should have one physical load");
  assert.equal(calls.length, 8, "four postings and four record paths are physically needed");
  assert.ok(maximumActiveLoads <= FEDERATED_SEARCH_LIMITS.maximumConcurrentOperations);
  assert.equal(collectionStatus(results[0], "uk-living").verifiedShardFiles, 2);
  assert.equal(collectionStatus(results.at(-1), "uk-living").verifiedShardFiles, 2);
});

test("bounds active and queued operations with a deterministic busy result", async () => {
  const value = fixture();
  const calls = [];
  let releaseFirstLoad;
  const firstLoad = new Promise((resolvePromise) => {
    releaseFirstLoad = resolvePromise;
  });
  const runtime = await runtimeFor(value, calls, async (path, _options, original) => {
    if (path === "data/federated-search/postings/uk-living/ho-000.json") {
      await firstLoad;
      return new Uint8Array(original);
    }
    return undefined;
  });

  const pending = Array.from({ length: 40 }, () =>
    runtime.search({ query: "housing", collections: ["uk-living"], limit: 2 }));
  assert.equal(await waitFor(() => calls.length === 1), true);
  releaseFirstLoad();
  const results = await Promise.all(pending);
  const busy = results.filter((result) => result.ok === false && result.error.code === "federated_runtime_busy");
  const successful = results.filter((result) => result.ok === true);

  assert.equal(busy.length, 4);
  assert.equal(successful.length, 36);
  assert.equal(calls.length, 2, "queued callers should reuse the one postings path and one record path");
});

test("isolates a failed or byte-corrupt postings source and reports a lower bound", async () => {
  for (const mode of ["failure", "corruption"]) {
    const value = fixture();
    const calls = [];
    const runtime = await runtimeFor(value, calls, async (path, _options, original) => {
      if (path === "data/federated-search/postings/ons/ho-000.json") {
        if (mode === "failure") throw new Error("simulated local failure");
        const corrupt = new Uint8Array(original);
        corrupt[0] ^= 1;
        return corrupt;
      }
      return undefined;
    });
    const result = await runtime.search({ query: "housing", limit: 8 });
    assert.equal(result.ok, true);
    assert.equal(result.totalRelation, "gte");
    assert.equal(collectionStatus(result, "ons").status, "unavailable");
    assert.equal(collectionStatus(result, "ons").verifiedShardFiles, 1);
    assert.ok(result.results.length > 0);
    assert.ok(result.results.every(({ collectionId }) => collectionId !== "ons"));
    assert.ok(result.collectionStatuses.filter(({ status }) => status === "ready").length === 3);
  }
});

test("rejects a co-digested semantic postings mutation while preserving other sources", async () => {
  const value = fixture();
  const path = "data/federated-search/postings/ons/ho-000.json";
  value.values.get(path).entries.housing[0][0] = 0;
  value.refreshAsset(path);
  value.refreshDigests();
  const runtime = await runtimeFor(value);
  const result = await runtime.search({ query: "housing", limit: 8 });
  assert.equal(result.ok, true);
  assert.equal(collectionStatus(result, "ons").status, "unavailable");
  assert.equal(result.totalRelation, "gte");
  assert.ok(result.results.every(({ collectionId }) => collectionId !== "ons"));
});

test("rejects co-digested ordinal, path, port, legislation-host and official-status mutations during hydration", async () => {
  for (const mutation of ["ordinal", "source-path", "assertion-status", "authority-role", "authority-port", "legislation-host"]) {
    const value = fixture();
    const path = "data/federated-search/records/land-registry/records-004.json";
    const record = value.values.get(path).records[0];
    if (mutation === "ordinal") record.ordinal = 0;
    else if (mutation === "source-path") record.sourcePath = "data/%2e%2e/private.json";
    else if (mutation === "assertion-status") record.assertionStatus = "official-source";
    else if (mutation === "authority-role") record.authoritativeLink.role = "official-source";
    else if (mutation === "authority-port") record.authoritativeLink.url = "https://example.invalid:8443/record";
    else record.documentationUrl = "https://www.legislation.gov.uk./ukpga/2002/9/contents";
    record.recordDigest = sha256(canonicalJson(without(record, "recordDigest")));
    value.refreshAsset(path);
    value.refreshDigests();
    const runtime = await runtimeFor(value);
    const result = await runtime.search({ query: "housing", limit: 8 });
    assert.equal(result.ok, true);
    assert.equal(collectionStatus(result, "land-registry").status, "unavailable");
    assert.equal(result.totalRelation, "gte");
    assert.ok(result.results.every(({ collectionId }) => collectionId !== "land-registry"));
  }
});

test("returns an exact record and provenance without inventing an item-level receipt", async () => {
  const value = fixture();
  const runtime = await runtimeFor(value);
  const ordinal = value.matchOrdinals.get("uk-living")[0];
  const recordId = `govuk-discovery:federated:uk-living:${ordinal}`;
  const recordResult = await runtime.getRecord({ recordId });
  assert.equal(recordResult.ok, true);
  assert.equal(recordResult.verificationStatus, "snapshot-file-integrity");
  assert.equal(recordResult.record.id, recordId);
  assert.equal(recordResult.record.collectionTitle, COLLECTIONS[0].title);
  assert.equal(recordResult.record.sourceAuthority, "Not independently established");
  assert.equal(recordResult.record.sourceNativeIdSha256, sha256(recordResult.record.sourceNativeId));
  assert.deepEqual(recordResult.record.limitations, [
    "This item has no direct field-level review.",
    "This is a bounded discovery snapshot and does not establish current accuracy or official endorsement.",
  ]);
  assert.equal(recordResult.record.evidenceReceiptId, undefined);
  assert.equal(recordResult.integrity.recordShard.path, "data/federated-search/records/uk-living/records-019.json");

  const provenance = await runtime.showProvenance({ recordId });
  assert.equal(provenance.ok, true);
  assert.equal(provenance.status, "federated-source-linked");
  assert.equal(provenance.evidenceReceiptAvailable, false);
  assert.equal(provenance.evidenceReceipt, undefined);
  assert.equal(provenance.boundaries.cryptographicSignatureVerified, false);
  assert.equal(provenance.collection.sourceNativeIdSha256, recordResult.record.sourceNativeIdSha256);
  assert.deepEqual(provenance.limitations, recordResult.record.limitations);

  assert.equal((await runtime.getRecord({ recordId: "govuk-discovery:federated:uk-living:09500" })).ok, false);
  assert.equal((await runtime.showProvenance({ recordId, URL: "https://example.gov.uk/" })).ok, false);
});

test("stops after eight distinct result shards while retaining an exact match total", async () => {
  const value = fixture();
  const source = COLLECTIONS[2];
  const collection = value.manifest.collections[2];
  const selectedReferences = collection.recordShards.slice(-9);
  const rows = [];
  for (const [index, reference] of selectedReferences.entries()) {
    const shard = {
      schema: "govuk-webmcp.federated-record-shard.v1",
      collectionId: source.id,
      firstOrdinal: reference.firstOrdinal,
      lastOrdinal: reference.lastOrdinal,
      records: Array.from({ length: reference.recordCount }, (_, recordIndex) =>
        makeRecord(source, reference.firstOrdinal + recordIndex, recordIndex === 0)),
    };
    value.values.set(reference.path, shard);
    value.references.set(reference.path, reference);
    value.refreshAsset(reference.path);
    rows.push([reference.firstOrdinal, 100 - index, 1]);
  }
  const postingsPath = "data/federated-search/postings/government-apis/ho-000.json";
  value.values.get(postingsPath).entries.housing = rows;
  value.references.get(postingsPath).postingCount = rows.length;
  value.refreshAsset(postingsPath);
  value.refreshDigests();

  const calls = [];
  const runtime = await runtimeFor(value, calls);
  const result = await runtime.search({ query: "housing", collections: ["government-apis"], limit: 20 });
  assert.equal(result.ok, true);
  assert.equal(result.totalMatches, 9);
  assert.equal(result.returned, 8);
  assert.equal(result.truncated, true);
  assert.equal(calls.filter(({ path }) => path.includes("/records/government-apis/")).length, 8);
});

test("one caller can cancel without cancelling another caller's shared in-flight path", async () => {
  const value = fixture();
  const controller = new AbortController();
  const runtime = await runtimeFor(value, [], async (path, _options, original) => {
    if (path === "data/federated-search/postings/ons/ho-000.json") {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 40));
      return new Uint8Array(original);
    }
    return undefined;
  });
  const started = performance.now();
  const cancelled = runtime.search(
    { query: "housing", collections: ["ons"] },
    { signal: controller.signal },
  );
  const surviving = runtime.search({ query: "housing", collections: ["ons"] });
  setTimeout(() => controller.abort(new Error("cancelled by test")), 10);
  await assert.rejects(cancelled, /cancelled by test/u);
  assert.ok(performance.now() - started < 500, "cancellation should not wait for the loader or file timeout");
  const result = await surviving;
  assert.equal(result.ok, true);
  assert.equal(collectionStatus(result, "ons").status, "ready");
});

test("removes an expired physical-fetch waiter without leaking a reserved slot", async () => {
  const runtime = await runtimeFor(fixture());
  const releases = [];
  const activeDeadline = performance.now() + 1_000;
  for (let index = 0; index < FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches; index += 1) {
    releases.push(await runtime.acquirePhysicalFetch(activeDeadline));
  }
  assert.equal(runtime.activePhysicalFetches, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);

  const queued = runtime.acquirePhysicalFetch(performance.now() + 30);
  assert.equal(runtime.physicalFetchWaiters.length, 1);
  await assert.rejects(
    queued,
    (error) => error instanceof Error && error.name === "FederatedPhysicalFetchSchedulingError" &&
      /could not start the physical shard fetch before its fixed file deadline/u.test(error.message),
  );
  assert.equal(runtime.physicalFetchWaiters.length, 0);
  assert.equal(runtime.activePhysicalFetches, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);

  for (const release of releases) release();
  assert.equal(runtime.activePhysicalFetches, 0);
  assert.equal(runtime.physicalFetchWaiters.length, 0);
});

test("reports physical scheduler expiry as runtime busy rather than a source failure", async () => {
  const scenarios = [
    {
      label: "search",
      invoke: (runtime) => runtime.search({ query: "housing", collections: ["ons"], limit: 1 }),
    },
    {
      label: "exact record",
      invoke: (runtime) => runtime.getRecord({ recordId: "govuk-discovery:federated:ons:9757" }),
    },
  ];

  for (const scenario of scenarios) {
    const calls = [];
    const runtime = await runtimeFor(fixture(), calls);
    const releases = [];
    const activeDeadline = performance.now() + 10_000;
    for (let index = 0; index < FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches; index += 1) {
      releases.push(await runtime.acquirePhysicalFetch(activeDeadline));
    }

    const pending = scenario.invoke(runtime);
    assert.equal(await waitFor(() => runtime.physicalFetchWaiters.length === 1), true,
      `${scenario.label} should wait behind the occupied physical slots`);
    runtime.physicalFetchWaiters[0].deadline = performance.now() - 1;
    releases.shift()();

    const result = await pending;
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "federated_runtime_busy");
    assert.match(result.error.message, /could not start the physical shard fetch before its fixed file deadline/u);
    assert.equal(calls.length, 0, `${scenario.label} scheduler expiry must not be reported after calling the loader`);

    for (const release of releases) release();
    assert.equal(await waitFor(() => runtime.inFlight.size === 0), true);
    assert.equal(runtime.activePhysicalFetches, 0);
    assert.equal(runtime.physicalFetchWaiters.length, 0);
  }
});

test("rechecks an absolute deadline after a queued physical slot is granted", async () => {
  const calls = [];
  const runtime = await runtimeFor(fixture(), calls);
  const releases = [];
  const activeDeadline = performance.now() + 10_000;
  for (let index = 0; index < FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches; index += 1) {
    releases.push(await runtime.acquirePhysicalFetch(activeDeadline));
  }

  const pending = runtime.search({ query: "housing", collections: ["ons"], limit: 1 });
  assert.equal(await waitFor(() => runtime.physicalFetchWaiters.length === 1), true);
  const queuedDeadline = runtime.physicalFetchWaiters[0].deadline;
  const performancePrototype = Object.getPrototypeOf(performance);
  const originalNow = performancePrototype.now;
  releases.shift()();
  performancePrototype.now = () => queuedDeadline + 1;
  let result;
  try {
    // Keep the deterministic crossed deadline in place through both async
    // grant continuations; no wall-clock scheduling race is involved.
    result = await pending;
  } finally {
    performancePrototype.now = originalNow;
  }

  assert.equal(result.ok, false);
  assert.equal(result.error.code, "federated_runtime_busy");
  assert.equal(calls.length, 0, "an expired grant must never invoke the physical loader");

  for (const release of releases) release();
  assert.equal(await waitFor(() => runtime.inFlight.size === 0), true);
  assert.equal(runtime.activePhysicalFetches, 0);
  assert.equal(runtime.physicalFetchWaiters.length, 0);
});

test("retains physical slots for non-cooperative loaders and expires abandoned queued work", async () => {
  const value = fixture();
  const source = COLLECTIONS[2];
  const collection = value.manifest.collections[2];
  const prefixes = Array.from({ length: 8 }, (_, index) => `p${String(index)}`);
  const targetPaths = new Set();
  for (const prefix of prefixes) {
    const token = `${prefix}probe`;
    const path = `data/federated-search/postings/${source.id}/${prefix}-000.json`;
    const postingsShard = {
      schema: "govuk-webmcp.federated-postings-shard.v1",
      collectionId: source.id,
      prefix,
      part: 0,
      entries: { [token]: [[source.first, 1, 1]] },
    };
    const reference = {
      collectionId: source.id,
      path,
      bytes: 1,
      sha256: sha256("pending"),
      tokenCount: 1,
      postingCount: 1,
    };
    collection.postings[prefix] = [reference];
    value.values.set(path, postingsShard);
    value.references.set(path, reference);
    value.refreshAsset(path);
    targetPaths.add(path);
  }
  value.refreshDigests();

  const calls = [];
  const heldReleases = [];
  let activePhysicalLoads = 0;
  let peakPhysicalLoads = 0;
  const runtime = await runtimeFor(value, calls, async (path, _options, original) => {
    if (!targetPaths.has(path)) return undefined;
    activePhysicalLoads += 1;
    peakPhysicalLoads = Math.max(peakPhysicalLoads, activePhysicalLoads);
    await new Promise((resolvePromise) => {
      let settled = false;
      heldReleases.push(() => {
        if (settled) return;
        settled = true;
        activePhysicalLoads -= 1;
        resolvePromise();
      });
    });
    return new Uint8Array(original);
  });

  for (const [index, prefix] of prefixes.entries()) {
    const controller = new AbortController();
    const pending = runtime.search(
      { query: `${prefix}probe`, collections: [source.id], limit: 1 },
      { signal: controller.signal },
    );
    assert.equal(
      await waitFor(() => runtime.inFlight.size === index + 1),
      true,
      `non-cooperative path ${index + 1} should enter the bounded in-flight set`,
    );
    controller.abort(new Error(`cancelled non-cooperative call ${index + 1}`));
    await assert.rejects(pending, new RegExp(`cancelled non-cooperative call ${index + 1}`, "u"));
  }

  assert.equal(runtime.activeOperations, 0);
  assert.equal(runtime.inFlight.size, prefixes.length);
  assert.equal(runtime.activePhysicalFetches, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(runtime.physicalFetchWaiters.length,
    prefixes.length - FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(activePhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(peakPhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(calls.filter(({ path }) => targetPaths.has(path)).length,
    FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);

  assert.equal(
    await waitFor(
      () => runtime.inFlight.size === FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches
        && runtime.physicalFetchWaiters.length === 0,
      FEDERATED_SEARCH_LIMITS.maximumFileMilliseconds + 1_500,
    ),
    true,
    "queued work with no surviving caller should expire from the in-flight set",
  );
  assert.equal(runtime.activePhysicalFetches, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(activePhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(peakPhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(calls.filter(({ path }) => targetPaths.has(path)).length,
    FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches,
    "an expired queued path must never reach the non-cooperative loader");

  for (const release of heldReleases) release();
  assert.equal(await waitFor(() => runtime.inFlight.size === 0, 2_000), true);
  assert.equal(runtime.activePhysicalFetches, 0);
  assert.equal(runtime.physicalFetchWaiters.length, 0);
  assert.equal(activePhysicalLoads, 0);
  assert.equal(peakPhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.ok([...targetPaths].every((path) => !runtime.cache.has(path)),
    "bytes returned after the file deadline must not enter the verified cache");
});

test("bounds physical shard fetches and distinct in-flight work under cancellation churn", async () => {
  const value = fixture();
  const source = COLLECTIONS[2];
  const collection = value.manifest.collections[2];
  const prefixes = Array.from({ length: 40 }, (_, index) =>
    `${String.fromCharCode("k".charCodeAt(0) + Math.floor(index / 10))}${String(index % 10)}`);
  const targetPaths = new Set();
  for (const prefix of prefixes) {
    const token = `${prefix}probe`;
    const path = `data/federated-search/postings/${source.id}/${prefix}-000.json`;
    const postingsShard = {
      schema: "govuk-webmcp.federated-postings-shard.v1",
      collectionId: source.id,
      prefix,
      part: 0,
      entries: { [token]: [[source.first, 1, 1]] },
    };
    const reference = {
      collectionId: source.id,
      path,
      bytes: 1,
      sha256: sha256("pending"),
      tokenCount: 1,
      postingCount: 1,
    };
    collection.postings[prefix] = [reference];
    value.values.set(path, postingsShard);
    value.references.set(path, reference);
    value.refreshAsset(path);
    targetPaths.add(path);
  }
  value.refreshDigests();

  const calls = [];
  const heldReleases = [];
  let holdPhysicalLoads = true;
  let activePhysicalLoads = 0;
  let peakPhysicalLoads = 0;
  const runtime = await runtimeFor(value, calls, async (path, options, original) => {
    if (!targetPaths.has(path)) return undefined;
    activePhysicalLoads += 1;
    peakPhysicalLoads = Math.max(peakPhysicalLoads, activePhysicalLoads);
    try {
      if (holdPhysicalLoads) {
        await new Promise((resolvePromise, rejectPromise) => {
          let settled = false;
          const finish = (callback) => {
            if (settled) return;
            settled = true;
            options.signal.removeEventListener("abort", onAbort);
            callback();
          };
          const onAbort = () => finish(() => rejectPromise(
            options.signal.reason ?? new DOMException("Shard fetch cancelled", "AbortError")));
          options.signal.addEventListener("abort", onAbort, { once: true });
          heldReleases.push(() => finish(resolvePromise));
        });
      }
      return new Uint8Array(original);
    } finally {
      activePhysicalLoads -= 1;
    }
  });

  for (const [index, prefix] of prefixes.slice(0, FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles).entries()) {
    const controller = new AbortController();
    const pending = runtime.search(
      { query: `${prefix}probe`, collections: [source.id], limit: 1 },
      { signal: controller.signal },
    );
    assert.equal(
      await waitFor(() => runtime.inFlight.size === index + 1),
      true,
      `distinct manifest-backed path ${index + 1} should enter the bounded in-flight set`,
    );
    controller.abort(new Error(`cancelled churn call ${index + 1}`));
    await assert.rejects(pending, new RegExp(`cancelled churn call ${index + 1}`, "u"));
    assert.equal(runtime.activeOperations, 0, "caller cancellation should release the logical operation slot");
    assert.ok(runtime.inFlight.size <= FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles);
  }

  assert.equal(runtime.inFlight.size, FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles);
  assert.equal(runtime.activePhysicalFetches, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(runtime.physicalFetchWaiters.length, FEDERATED_SEARCH_LIMITS.maximumQueuedPhysicalFetches);
  assert.equal(activePhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(peakPhysicalLoads, FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(calls.filter(({ path }) => targetPaths.has(path)).length,
    FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);

  for (const prefix of prefixes.slice(FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles)) {
    const result = await runtime.search({ query: `${prefix}probe`, collections: [source.id], limit: 1 });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "federated_runtime_busy");
    assert.match(result.error.message, /maximum distinct in-flight shard files/u);
    assert.equal(runtime.inFlight.size, FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles);
  }
  assert.equal(calls.filter(({ path }) => targetPaths.has(path)).length,
    FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches,
    "saturated distinct-path admission must not call or queue another physical loader");

  holdPhysicalLoads = false;
  for (const release of heldReleases) release();
  assert.equal(await waitFor(() => runtime.inFlight.size === 0, 2_000), true);
  assert.equal(runtime.activePhysicalFetches, 0);
  assert.equal(runtime.physicalFetchWaiters.length, 0);
  assert.equal(activePhysicalLoads, 0);
  assert.ok(peakPhysicalLoads <= FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches);
  assert.equal(calls.filter(({ path }) => targetPaths.has(path)).length,
    FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles);
});

test("publishes fixed retrieval, cache and result-shard budgets", () => {
  assert.deepEqual(
    {
      query: FEDERATED_SEARCH_LIMITS.maximumQueryCharacters,
      tokens: FEDERATED_SEARCH_LIMITS.maximumQueryTokens,
      results: FEDERATED_SEARCH_LIMITS.maximumResults,
      resultShards: FEDERATED_SEARCH_LIMITS.maximumResultShards,
      fetchFiles: FEDERATED_SEARCH_LIMITS.maximumFetchFilesPerOperation,
      activeOperations: FEDERATED_SEARCH_LIMITS.maximumConcurrentOperations,
      queuedOperations: FEDERATED_SEARCH_LIMITS.maximumQueuedOperations,
      activePhysicalFetches: FEDERATED_SEARCH_LIMITS.maximumConcurrentPhysicalFetches,
      queuedPhysicalFetches: FEDERATED_SEARCH_LIMITS.maximumQueuedPhysicalFetches,
      distinctInFlightFiles: FEDERATED_SEARCH_LIMITS.maximumDistinctInFlightFiles,
    },
    {
      query: 160,
      tokens: 12,
      results: 20,
      resultShards: 8,
      fetchFiles: 64,
      activeOperations: 4,
      queuedOperations: 32,
      activePhysicalFetches: 4,
      queuedPhysicalFetches: 32,
      distinctInFlightFiles: 36,
    },
  );
});
