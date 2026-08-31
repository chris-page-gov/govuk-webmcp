import assert from "node:assert/strict";
import test from "node:test";

import { createCombinedKnowledgeRuntime } from "../../dist/src/combined-knowledge-runtime.js";

const FEDERATED_COLLECTIONS = ["uk-living", "ons", "government-apis", "land-registry"];
const ALL_COLLECTIONS = ["deep-evidence", ...FEDERATED_COLLECTIONS];
const REVIEWED_DIGEST = "a".repeat(64);
const FEDERATED_DIGEST = "b".repeat(64);

function reviewedRow(suffix, overrides = {}) {
  return {
    recordId: `govuk-discovery:test:${suffix}`,
    title: `Reviewed ${suffix}`,
    description: `Reviewed description ${suffix}`,
    resourceType: "guidance",
    publisher: "GOV.UK",
    accessStatus: "public",
    licenceStatus: "confirmed",
    canonicalHumanUrl: `https://www.gov.uk/${suffix}`,
    limitations: ["Reviewed fixture limitation."],
    recordDigest: "c".repeat(64),
    bundleDigest: REVIEWED_DIGEST,
    ...overrides,
  };
}

function federatedRow(collectionId, ordinal, overrides = {}) {
  return {
    recordId: `govuk-discovery:federated:${collectionId}:${ordinal}`,
    evidenceTier: "federated-source-snapshot",
    collectionId,
    collectionTitle: `Collection ${collectionId}`,
    sourceNativeId: `${collectionId}:${ordinal}`,
    title: `Federated ${collectionId} ${ordinal}`,
    description: `Federated description ${collectionId} ${ordinal}`,
    resourceType: "catalogue-record",
    publisher: `Publisher ${collectionId}`,
    accessStatus: "access-not-established",
    licenceStatus: "missing",
    canonicalHumanUrl: `https://example.test/${collectionId}/${ordinal}`,
    authoritativeLink: {
      url: `https://example.test/${collectionId}/${ordinal}`,
      role: "producer-declared-source",
      label: "Open recorded source",
    },
    integrityBasis: "snapshot-file-integrity",
    linkRole: "producer-declared-source",
    snapshot: `snapshot-${collectionId}`,
    limitations: ["Federated fixture limitation."],
    ...overrides,
  };
}

function collectionStatus(collectionId, overrides = {}) {
  return {
    collectionId,
    title: `Collection ${collectionId}`,
    status: "ready",
    totalMatches: 0,
    totalRelation: "eq",
    returned: 0,
    verifiedShardFiles: 1,
    verifiedShardBytes: 128,
    ...overrides,
  };
}

function reviewedSearchResult(results = [], totalMatches = results.length) {
  return {
    schema: "trusted-govuk-discovery.search-result.v1",
    ok: true,
    query: "fixture",
    totalMatches,
    returned: results.length,
    results,
  };
}

function federatedSearchResult({
  results = [],
  collectionStatuses = FEDERATED_COLLECTIONS.map((id) => collectionStatus(id)),
  totalMatches = results.length,
  totalRelation = "eq",
} = {}) {
  return {
    schema: "govuk-webmcp.federated-search-result.v1",
    ok: true,
    query: "fixture",
    evidenceTier: "federated-source-snapshot",
    manifestDigest: FEDERATED_DIGEST,
    totalMatches,
    totalRelation,
    returned: results.length,
    truncated: totalRelation === "gte" || totalMatches > results.length,
    results,
    collectionStatuses,
    boundaries: {},
  };
}

function runtimeStubs({
  reviewedResult = reviewedSearchResult(),
  federatedResult = federatedSearchResult(),
} = {}) {
  const calls = {
    reviewedSearch: [],
    reviewedRecord: [],
    reviewedProvenance: [],
    federatedSearch: [],
    federatedRecord: [],
    federatedProvenance: [],
  };
  const reviewed = {
    bundleDigest: REVIEWED_DIGEST,
    recordCount: 80,
    facets: {
      resourceTypes: ["dataset", "guidance"],
      publishers: ["GOV.UK", "Office for National Statistics"],
      accessStatuses: ["access-not-established", "public"],
    },
    async search(input) {
      calls.reviewedSearch.push(input);
      return reviewedResult;
    },
    async getRecord(...args) {
      calls.reviewedRecord.push(args);
      return { schema: "reviewed-record", ok: true, route: "reviewed" };
    },
    async showProvenance(...args) {
      calls.reviewedProvenance.push(args);
      return { schema: "reviewed-provenance", ok: true, route: "reviewed" };
    },
  };
  const federated = {
    sourceRecordCount: 58_655,
    quarantinedRecordCount: 3,
    recordCount: 58_652,
    manifestDigest: FEDERATED_DIGEST,
    collectionIds: [...FEDERATED_COLLECTIONS],
    async search(...args) {
      calls.federatedSearch.push(args);
      return federatedResult;
    },
    async getRecord(...args) {
      calls.federatedRecord.push(args);
      return { schema: "federated-record", ok: true, route: "federated" };
    },
    async showProvenance(...args) {
      calls.federatedProvenance.push(args);
      return { schema: "federated-provenance", ok: true, route: "federated" };
    },
  };
  return {
    calls,
    combined: createCombinedKnowledgeRuntime(reviewed, federated),
  };
}

test("search defaults to the reviewed tier and all four federated collections", async () => {
  const { calls, combined } = runtimeStubs();
  const result = await combined.search({ query: "  council   tax  " });

  assert.equal(result.ok, true);
  assert.deepEqual(result.selectedCollections, ALL_COLLECTIONS);
  assert.deepEqual(calls.reviewedSearch, [{ query: "council tax", limit: 20 }]);
  assert.deepEqual(calls.federatedSearch[0][0], {
    query: "council tax",
    collections: FEDERATED_COLLECTIONS,
    limit: 20,
  });
  assert.equal(result.evidenceEstate.reviewedRecordCount, 80);
  assert.equal(result.evidenceEstate.federatedSourceRecordCount, 58_655);
  assert.equal(result.evidenceEstate.federatedQuarantinedRecordCount, 3);
  assert.equal(result.evidenceEstate.federatedRecordCount, 58_652);
  assert.equal(result.evidenceEstate.federatedCollectionCount, 4);
});

test("balanced merge is deterministic across reviewed evidence and four federated groups", async () => {
  const reviewedResults = [reviewedRow("r1"), reviewedRow("r2")];
  const federatedResults = FEDERATED_COLLECTIONS.flatMap((collectionId, index) => [
    federatedRow(collectionId, index * 2),
    federatedRow(collectionId, index * 2 + 1),
  ]);
  const statuses = FEDERATED_COLLECTIONS.map((collectionId) =>
    collectionStatus(collectionId, { totalMatches: 2, returned: 2 }));
  const { combined } = runtimeStubs({
    reviewedResult: reviewedSearchResult(reviewedResults),
    federatedResult: federatedSearchResult({
      results: federatedResults,
      collectionStatuses: statuses,
      totalMatches: federatedResults.length,
    }),
  });

  const input = { query: "evidence", limit: 10 };
  const first = await combined.search(input);
  const second = await combined.search(input);
  assert.deepEqual(first, second);
  assert.deepEqual(first.results.map(({ recordId }) => recordId), [
    reviewedResults[0].recordId,
    federatedResults[0].recordId,
    federatedResults[2].recordId,
    federatedResults[4].recordId,
    federatedResults[6].recordId,
    reviewedResults[1].recordId,
    federatedResults[1].recordId,
    federatedResults[3].recordId,
    federatedResults[5].recordId,
    federatedResults[7].recordId,
  ]);
});

test("combined results keep evidence tiers, link roles and integrity bases separate", async () => {
  const deep = reviewedRow("birth");
  const federated = federatedRow("land-registry", 56_452, {
    linkRole: "no-direct-authority-link",
    canonicalHumanUrl: undefined,
    authoritativeLink: {
      url: null,
      role: "no-direct-authority-link",
      label: "No direct authority link established",
    },
  });
  const { combined } = runtimeStubs({
    reviewedResult: reviewedSearchResult([deep]),
    federatedResult: federatedSearchResult({
      results: [federated],
      collectionStatuses: [collectionStatus("land-registry", { totalMatches: 1, returned: 1 })],
      totalMatches: 1,
    }),
  });

  const result = await combined.search({
    query: "land evidence",
    collections: ["deep-evidence", "land-registry"],
  });
  const [deepResult, federatedResult] = result.results;
  assert.deepEqual(
    {
      evidenceTier: deepResult.evidenceTier,
      collectionId: deepResult.collectionId,
      linkRole: deepResult.linkRole,
      integrityBasis: deepResult.integrityBasis,
    },
    {
      evidenceTier: "reviewed-deep-evidence",
      collectionId: "deep-evidence",
      linkRole: "official-source",
      integrityBasis: "digest-bound",
    },
  );
  assert.deepEqual(
    {
      evidenceTier: federatedResult.evidenceTier,
      collectionId: federatedResult.collectionId,
      linkRole: federatedResult.linkRole,
      integrityBasis: federatedResult.integrityBasis,
      authoritativeLink: federatedResult.authoritativeLink,
    },
    {
      evidenceTier: "federated-source-snapshot",
      collectionId: "land-registry",
      linkRole: "no-direct-authority-link",
      integrityBasis: "snapshot-file-integrity",
      authoritativeLink: {
        url: null,
        role: "no-direct-authority-link",
        label: "No direct authority link established",
      },
    },
  );
});

test("combined search rejects personal, arbitrary and invalid collection fields before dispatch", async () => {
  const { calls, combined } = runtimeStubs();
  const cases = [
    [{ query: "birth", personalContext: { postcode: "AB1 2CD" } }, /unknown field/u],
    [{ query: "birth", arbitrary: true }, /unknown field/u],
    [{ query: "birth", collections: [] }, /at least one evidence collection/u],
    [{ query: "birth", collections: ["ons", "ons"] }, /duplicate values/u],
    [{ query: "birth", collections: ["legislation"] }, /unsupported value/u],
  ];
  for (const [input, message] of cases) {
    const result = await combined.search(input);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "invalid_search_request");
    assert.match(result.error.message, message);
  }
  assert.equal(calls.reviewedSearch.length, 0);
  assert.equal(calls.federatedSearch.length, 0);
});

test("deep filters are forwarded exactly while federated filtered totals remain lower bounds", async () => {
  const matching = federatedRow("ons", 9_757, {
    resourceType: "dataset",
    publisher: "Office for National Statistics",
    accessStatus: "public",
  });
  const outsideFilter = federatedRow("ons", 9_758, {
    resourceType: "catalogue-record",
    publisher: "Another publisher",
    accessStatus: "access-not-established",
  });
  const { calls, combined } = runtimeStubs({
    reviewedResult: reviewedSearchResult([
      reviewedRow("ons-reviewed", {
        resourceType: "dataset",
        publisher: "Office for National Statistics",
      }),
    ], 2),
    federatedResult: federatedSearchResult({
      results: [matching, outsideFilter],
      collectionStatuses: [collectionStatus("ons", { totalMatches: 12, returned: 2 })],
      totalMatches: 12,
    }),
  });
  const input = {
    query: "population estimates",
    resourceTypes: ["dataset"],
    publishers: ["Office for National Statistics"],
    accessStatuses: ["public"],
    collections: ["deep-evidence", "ons"],
    limit: 10,
  };
  const result = await combined.search(input);

  assert.deepEqual(calls.reviewedSearch, [{
    query: "population estimates",
    resourceTypes: ["dataset"],
    publishers: ["Office for National Statistics"],
    accessStatuses: ["public"],
    limit: 20,
  }]);
  assert.deepEqual(calls.federatedSearch[0][0], {
    query: "population estimates",
    collections: ["ons"],
    limit: 20,
  });
  assert.deepEqual(result.results.map(({ recordId }) => recordId), [
    "govuk-discovery:test:ons-reviewed",
    matching.recordId,
  ]);
  assert.equal(result.totalMatches, 3);
  assert.equal(result.totalRelation, "gte");
  assert.equal(result.truncated, true);
  const onsStatus = result.collectionStatuses.find(({ collectionId }) => collectionId === "ons");
  assert.equal(onsStatus.totalMatches, 1);
  assert.equal(onsStatus.totalRelation, "gte");
  assert.equal(
    onsStatus.limitation,
    "Federated filters are applied to the bounded candidate window; the displayed total is a lower bound.",
  );
});

test("one unavailable federated collection preserves reviewed and unaffected source results", async () => {
  const deep = reviewedRow("reviewed");
  const living = federatedRow("uk-living", 0);
  const api = federatedRow("government-apis", 14_854);
  const statuses = [
    collectionStatus("uk-living", { totalMatches: 1, returned: 1 }),
    collectionStatus("ons", {
      status: "unavailable",
      limitation: "ONS fixture source is unavailable.",
      verifiedShardFiles: 0,
      verifiedShardBytes: 0,
    }),
    collectionStatus("government-apis", { totalMatches: 1, returned: 1 }),
    collectionStatus("land-registry"),
  ];
  const { combined } = runtimeStubs({
    reviewedResult: reviewedSearchResult([deep]),
    federatedResult: federatedSearchResult({
      results: [living, api],
      collectionStatuses: statuses,
      totalMatches: 2,
    }),
  });

  const result = await combined.search({ query: "public evidence", limit: 8 });
  assert.equal(result.ok, true);
  assert.deepEqual(new Set(result.results.map(({ recordId }) => recordId)), new Set([
    deep.recordId,
    living.recordId,
    api.recordId,
  ]));
  assert.equal(result.totalMatches, 3);
  assert.equal(result.totalRelation, "gte");
  assert.equal(result.truncated, true);
  assert.equal(
    result.collectionStatuses.find(({ collectionId }) => collectionId === "ons").status,
    "unavailable",
  );
  assert.equal(
    result.collectionStatuses.find(({ collectionId }) => collectionId === "deep-evidence").status,
    "ready",
  );
});

test("record and provenance requests route by the closed federated identifier", async () => {
  const { calls, combined } = runtimeStubs();
  const federatedInput = { recordId: "govuk-discovery:federated:land-registry:58651" };
  const reviewedInput = { recordId: "govuk-discovery:api:flood-monitoring" };

  assert.equal((await combined.getRecord(federatedInput)).route, "federated");
  assert.equal((await combined.getRecord(reviewedInput)).route, "reviewed");
  assert.equal((await combined.showProvenance(federatedInput)).route, "federated");
  assert.equal((await combined.showProvenance(reviewedInput)).route, "reviewed");

  assert.deepEqual(calls.federatedRecord[0][0], federatedInput);
  assert.deepEqual(calls.reviewedRecord[0], [reviewedInput]);
  assert.deepEqual(calls.federatedProvenance[0][0], federatedInput);
  assert.deepEqual(calls.reviewedProvenance[0], [reviewedInput]);
});

test("AbortSignal is forwarded to every federated method", async () => {
  const { calls, combined } = runtimeStubs();
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const recordInput = { recordId: "govuk-discovery:federated:ons:9757" };

  await combined.search({ query: "population", collections: ["ons"] }, options);
  await combined.getRecord(recordInput, options);
  await combined.showProvenance(recordInput, options);

  assert.equal(calls.federatedSearch[0][1].signal, controller.signal);
  assert.equal(calls.federatedRecord[0][1].signal, controller.signal);
  assert.equal(calls.federatedProvenance[0][1].signal, controller.signal);
});
