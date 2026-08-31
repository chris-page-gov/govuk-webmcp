import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const moduleUrl = process.env.OKF_FEDERATED_CONTRACTS_MODULE
  ? pathToFileURL(resolve(process.env.OKF_FEDERATED_CONTRACTS_MODULE)).href
  : new URL("../../dist/src/okf-federated-contracts.js", import.meta.url).href;

const {
  OKF_FEDERATED_COLLECTION_IDS,
  OKF_FEDERATION_LIMITS,
  okfFederatedSource,
  validateOkfFederationLock,
} = await import(moduleUrl);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function without(value, field) {
  const copy = structuredClone(value);
  delete copy[field];
  return copy;
}

const SOURCE_FIXTURES = {
  "uk-living": {
    title: "A Life in the UK — life-course discovery corpus",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-living",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-living/",
    revision: "4bc010eab3c9c072f68960393c1458a772aa700b",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "life-course-authority-infrastructure-2026-08-08",
    dataManifestPath: "large/data/manifest.json",
    searchManifestPath: "large/data/search/manifest.json",
    searchSchema: "okf-static-search.v1",
    records: 9757,
    recordArtifacts: 10,
    supportingArtifacts: 1,
  },
  ons: {
    title: "ONS data discovery OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-ons",
    baseUrl: "https://chris-page-gov.github.io/okf-ons/",
    revision: "b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf",
    revisionReproducibility: "deployed-bytes-observed-separately",
    snapshot: "monday-2026-07-17-r2",
    dataManifestPath: "data/manifest.json",
    searchManifestPath: "data/search/manifest.json",
    searchSchema: "okf-static-search.v2",
    records: 5097,
    recordArtifacts: 11,
    supportingArtifacts: 0,
  },
  "government-apis": {
    title: "UK Government APIs OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-government-apis",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-government-apis/",
    revision: "55c7e67947dfd86e291ca987e354429c36b453d9",
    revisionReproducibility: "exact-repository-revision",
    snapshot: null,
    dataManifestPath: "data/manifest.json",
    searchManifestPath: "data/search/manifest.json",
    searchSchema: "okf-static-search.v1",
    records: 41598,
    recordArtifacts: 42,
    supportingArtifacts: 0,
  },
  "land-registry": {
    title: "HM Land Registry public-estate OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-LandRegistry",
    baseUrl: "https://chris-page-gov.github.io/okf-LandRegistry/",
    revision: "1d708e39f2cde19610d43c5a7f5e36e4a2f947bc",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "hmlr-public-metadata-v0.2.0",
    dataManifestPath: "data/explorer/manifest.json",
    searchManifestPath: "data/explorer/search/manifest.json",
    searchSchema: "okf-static-search.v2",
    records: 2203,
    recordArtifacts: 9,
    supportingArtifacts: 0,
  },
};

function reference(label, path) {
  return { path, bytes: 128, sha256: sha256(`${label}:${path}`) };
}

function splitCount(total, chunks, index) {
  const size = Math.floor(total / chunks);
  return size + (index < total % chunks ? 1 : 0);
}

function makeArtifact(id, index, itemCount, role = "records") {
  const sourcePath = `data/search/results-${String(index).padStart(3, "0")}.json`;
  const storedPath = `app/data/sources/okf-federation/${id}/${role}-${String(index).padStart(3, "0")}.json`;
  const digest = sha256(`${id}:${role}:${index}`);
  return {
    role,
    sourcePath,
    storedPath,
    sourceBytes: 100 + index,
    sourceSha256: digest,
    storedBytes: 100 + index,
    storedSha256: digest,
    compression: "identity",
    itemCount,
  };
}

function makeSource(id) {
  const fixture = SOURCE_FIXTURES[id];
  const recordArtifacts = Array.from({ length: fixture.recordArtifacts }, (_, index) =>
    makeArtifact(id, index, splitCount(fixture.records, fixture.recordArtifacts, index)));
  const supportingArtifacts = Array.from({ length: fixture.supportingArtifacts }, (_, index) =>
    makeArtifact(id, fixture.recordArtifacts + index, 879, "resources"));
  const artifacts = [...recordArtifacts, ...supportingArtifacts];
  const source = {
    id,
    title: fixture.title,
    repositoryUrl: fixture.repositoryUrl,
    baseUrl: fixture.baseUrl,
    deploymentId: `pages-${id}-2026-08-30`,
    revision: fixture.revision,
    revisionReproducibility: fixture.revisionReproducibility,
    snapshot: fixture.snapshot,
    descriptor: reference(id, "okf-explorer.json"),
    dataManifest: reference(id, fixture.dataManifestPath),
    searchManifest: {
      ...reference(id, fixture.searchManifestPath),
      schema: fixture.searchSchema,
    },
    population: {
      records: fixture.records,
      unit: "search documents",
      ...(id === "uk-living" ? { serviceFamilies: 293, resources: 879 } : {}),
    },
    recordArtifacts,
    supportingArtifacts,
    requestPolicy: { credentials: "omit", redirect: "error", sameOriginOnly: true },
    budgets: {
      maximumResourceBytes: 1024,
      maximumDecodedBytes: artifacts.reduce((total, item) => total + item.sourceBytes, 0),
      maximumStoredBytes: artifacts.reduce((total, item) => total + item.storedBytes, 0),
      maximumArtifacts: artifacts.length,
    },
    rights: {
      status: "source-specific",
      statement: "Rights remain source-specific and no open licence is inferred from catalogue inclusion.",
    },
    access: {
      status: "public-static-metadata",
      statement: "Only the locked static metadata snapshot is admitted; service access is not granted.",
    },
    limitations: id === "ons"
      ? ["The repository revision does not by itself reproduce the ignored generated Pages bundle whose deployed bytes are locked separately."]
      : ["This is a bounded discovery snapshot and does not establish current accuracy or official endorsement."],
    boundaries: {
      officialApiCalls: false,
      personalContextAccepted: false,
      sourceDerivedContentIsUntrusted: true,
    },
    entryDigest: "",
  };
  source.entryDigest = sha256(canonicalJson(without(source, "entryDigest")));
  return source;
}

function identityInput(source) {
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

function rebind(lock) {
  for (const source of lock.sources) {
    source.entryDigest = sha256(canonicalJson(without(source, "entryDigest")));
  }
  const artifacts = lock.sources.flatMap((source) => [...source.recordArtifacts, ...source.supportingArtifacts]);
  lock.aggregate.sourceCount = lock.sources.length;
  lock.aggregate.recordCount = lock.sources.reduce((total, source) => total + source.population.records, 0);
  lock.aggregate.artifactCount = artifacts.length;
  lock.aggregate.decodedArtifactBytes = artifacts.reduce((total, item) => total + item.sourceBytes, 0);
  lock.aggregate.storedArtifactBytes = artifacts.reduce((total, item) => total + item.storedBytes, 0);
  lock.aggregate.sourceIdentityDigest = sha256(canonicalJson(lock.sources.map(identityInput)));
  lock.aggregate.aggregateDigest = sha256(canonicalJson(without(lock.aggregate, "aggregateDigest")));
  lock.lockDigest = sha256(canonicalJson(without(lock, "lockDigest")));
  return lock;
}

function makeFixture() {
  const sources = OKF_FEDERATED_COLLECTION_IDS.map(makeSource);
  return rebind({
    schema: "govuk-webmcp.okf-federation-lock.v1",
    profile: "govuk-webmcp.okf-federated-search.v1",
    evidenceTier: "federated-source-snapshot",
    authoredAt: "2026-08-30T22:00:00+01:00",
    aggregate: {
      sourceCount: 4,
      recordCount: 58655,
      artifactCount: 73,
      decodedArtifactBytes: 0,
      storedArtifactBytes: 0,
      sourceIdentityDigest: "",
      aggregateDigest: "",
    },
    sources,
    lockDigest: "",
  });
}

async function rejectsCoDigested(mutator, pattern) {
  const fixture = makeFixture();
  mutator(fixture);
  rebind(fixture);
  await assert.rejects(validateOkfFederationLock(fixture), pattern);
}

test("validates and freezes exactly the four admitted federation sources", async () => {
  const fixture = makeFixture();
  const validated = await validateOkfFederationLock(fixture);
  assert.ok(Object.isFrozen(OKF_FEDERATED_COLLECTION_IDS));
  assert.deepEqual(validated.sources.map(({ id }) => id), ["uk-living", "ons", "government-apis", "land-registry"]);
  assert.equal(validated.aggregate.recordCount, 58655);
  assert.equal(validated.aggregate.artifactCount, 73);
  assert.equal(okfFederatedSource(validated, "ons").population.records, 5097);
  assert.equal(okfFederatedSource(validated, "ons").revisionReproducibility, "deployed-bytes-observed-separately");
  assert.ok(Object.isFrozen(validated));
  assert.ok(Object.isFrozen(validated.sources));
  assert.ok(Object.isFrozen(validated.sources[0].recordArtifacts[0]));

  fixture.sources[0].title = "Caller-owned mutation";
  assert.equal(validated.sources[0].title, "A Life in the UK — life-course discovery corpus");
});

test("rejects stale raw lock, entry, aggregate and identity digests", async () => {
  for (const mutate of [
    (lock) => { lock.sources[0].deploymentId = "pages-changed-after-signing"; },
    (lock) => { lock.sources[0].entryDigest = "a".repeat(64); },
    (lock) => { lock.aggregate.sourceIdentityDigest = "b".repeat(64); lock.lockDigest = sha256(canonicalJson(without(lock, "lockDigest"))); },
    (lock) => { lock.aggregate.aggregateDigest = "c".repeat(64); lock.lockDigest = sha256(canonicalJson(without(lock, "lockDigest"))); },
  ]) {
    const fixture = makeFixture();
    mutate(fixture);
    await assert.rejects(validateOkfFederationLock(fixture), /digest/u);
  }
});

test("rejects unsupported schema, profile, evidence tier and search profile after re-digesting", async () => {
  await rejectsCoDigested((lock) => { lock.schema = "govuk-webmcp.okf-federation-lock.v2"; }, /schema is unsupported/u);
  await rejectsCoDigested((lock) => { lock.profile = "govuk-webmcp.okf-federated-search.v2"; }, /profile is unsupported/u);
  await rejectsCoDigested((lock) => { lock.evidenceTier = "deep-evidence"; }, /evidence tier is unsupported/u);
  await rejectsCoDigested((lock) => { lock.sources[0].searchManifest.schema = "okf-static-search.v2"; }, /schema is unsupported or has drifted/u);
});

test("rejects legislation, unknown sources, duplicates, omissions and order drift", async () => {
  await rejectsCoDigested((lock) => { lock.sources[0].id = "uk-legislation"; }, /Legislation is explicitly outside/u);
  await rejectsCoDigested((lock) => { lock.sources[0].id = "another-source"; }, /unsupported collection identifier/u);
  await rejectsCoDigested((lock) => { lock.sources[1].id = "uk-living"; }, /duplicate source identifiers/u);

  const omitted = makeFixture();
  omitted.sources.pop();
  rebind(omitted);
  await assert.rejects(validateOkfFederationLock(omitted), /exactly four admitted sources/u);

  const reordered = makeFixture();
  [reordered.sources[0], reordered.sources[1]] = [reordered.sources[1], reordered.sources[0]];
  rebind(reordered);
  await assert.rejects(validateOkfFederationLock(reordered), /deterministic collection order/u);
});

test("rejects arbitrary origins, credentials and permissive redirect policies", async () => {
  await rejectsCoDigested((lock) => { lock.sources[0].baseUrl = "https://example.org/okf-uk-living/"; }, /exact credential-free admitted HTTPS URL/u);
  await rejectsCoDigested((lock) => { lock.sources[0].repositoryUrl = "https://user:secret@github.com/chris-page-gov/okf-uk-living"; }, /exact credential-free admitted HTTPS URL/u);
  await rejectsCoDigested((lock) => { lock.sources[0].requestPolicy.redirect = "follow"; }, /permit credentials, redirects or another origin/u);
  await rejectsCoDigested((lock) => { lock.sources[0].requestPolicy.credentials = "include"; }, /permit credentials, redirects or another origin/u);
  await rejectsCoDigested((lock) => { lock.sources[0].requestPolicy.sameOriginOnly = false; }, /permit credentials, redirects or another origin/u);
});

test("rejects raw, encoded, backslash and stored-directory path traversal", async () => {
  for (const path of ["../secret.json", "data/%2e%2e/secret.json", "data\\..\\secret.json", "data//secret.json"]) {
    await rejectsCoDigested((lock) => { lock.sources[0].recordArtifacts[0].sourcePath = path; }, /safe relative path/u);
  }
  await rejectsCoDigested(
    (lock) => { lock.sources[0].recordArtifacts[0].storedPath = "app/data/sources/okf-federation/ons/records-000.json"; },
    /outside its admitted collection directory/u,
  );
});

test("rejects co-digested release count, revision, reproducibility and snapshot drift", async () => {
  await rejectsCoDigested((lock) => { lock.sources[0].population.records += 1; }, /population count or unit has drifted/u);
  await rejectsCoDigested((lock) => { lock.sources[0].revision = "f".repeat(40); }, /revision has drifted/u);
  await rejectsCoDigested(
    (lock) => { lock.sources[1].revisionReproducibility = "exact-repository-revision"; },
    /revision reproducibility has drifted/u,
  );
  await rejectsCoDigested((lock) => { lock.sources[3].snapshot = "another-snapshot"; }, /snapshot has drifted/u);
  await rejectsCoDigested((lock) => { lock.sources[2].snapshot = "invented-snapshot"; }, /snapshot has drifted/u);
});

test("rejects co-digested digest and byte drift in identity artifacts", async () => {
  await rejectsCoDigested(
    (lock) => { lock.sources[0].recordArtifacts[0].sourceSha256 = "e".repeat(64); },
    /identity representation has byte or digest drift/u,
  );
  await rejectsCoDigested(
    (lock) => { lock.sources[0].recordArtifacts[0].sourceBytes += 1; },
    /identity representation has byte or digest drift/u,
  );
  await rejectsCoDigested(
    (lock) => { lock.sources[0].recordArtifacts[1].storedPath = lock.sources[0].recordArtifacts[0].storedPath; },
    /duplicate artifact path/u,
  );
});

test("rejects source and aggregate values beyond the fixed budgets", async () => {
  await rejectsCoDigested((lock) => {
    const artifact = lock.sources[0].recordArtifacts[0];
    artifact.sourceBytes = OKF_FEDERATION_LIMITS.maximumResourceBytes + 1;
    artifact.storedBytes = artifact.sourceBytes;
    lock.sources[0].budgets.maximumResourceBytes = artifact.sourceBytes;
    lock.sources[0].budgets.maximumDecodedBytes = artifact.sourceBytes;
    lock.sources[0].budgets.maximumStoredBytes = artifact.storedBytes;
  }, /maximum resource bytes|source bytes/u);

  await rejectsCoDigested((lock) => {
    lock.sources[0].budgets.maximumArtifacts = OKF_FEDERATION_LIMITS.maximumArtifactsPerSource + 1;
  }, /maximum artifacts/u);
});

test("requires the ONS deployment reproducibility limitation and static privacy boundaries", async () => {
  await rejectsCoDigested((lock) => {
    lock.sources[1].limitations = ["A generic limitation which omits the required reproducibility boundary."];
  }, /must disclose that its revision does not reproduce/u);
  await rejectsCoDigested((lock) => { lock.sources[2].boundaries.officialApiCalls = true; }, /static, context-minimised federation boundary/u);
  await rejectsCoDigested((lock) => { lock.sources[2].boundaries.personalContextAccepted = true; }, /static, context-minimised federation boundary/u);
});

test("rejects unknown fields and accessor-bearing input without evaluating the accessor", async () => {
  const extra = makeFixture();
  extra.sources[0].personalContext = "private";
  rebind(extra);
  await assert.rejects(validateOkfFederationLock(extra), /unknown field/u);

  const accessor = makeFixture();
  let evaluated = false;
  Object.defineProperty(accessor.sources[0], "title", {
    enumerable: true,
    get() {
      evaluated = true;
      return "Do not evaluate";
    },
  });
  await assert.rejects(validateOkfFederationLock(accessor), /data fields only/u);
  assert.equal(evaluated, false);
});
