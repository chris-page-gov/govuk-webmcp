import assert from "node:assert/strict";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { cleanDist } from "../../scripts/clean-dist.mjs";
import { copyStatic } from "../../scripts/copy-static.mjs";
import {
  ndcgAt,
  recallAt,
  runFederatedSearchQuality,
  validateFederatedSearchQualityFixture,
} from "../../scripts/run-federated-search-quality.mjs";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("the frozen fixture covers each bounded lexical case with explicit graded judgements", async () => {
  const raw = await readJson("evals/federated-search-quality.json");
  const fixture = validateFederatedSearchQualityFixture(raw);
  assert.equal(fixture.cases.length, 8);
  assert.deepEqual(fixture.cases.map(({ category }) => category), [
    "exact-id", "title", "publisher", "topic", "multi-token", "ambiguous", "no-match", "cross-source",
  ]);
  assert.ok(fixture.cases.every(({ limit }) => limit === 20));
  assert.ok(fixture.cases.filter(({ category }) => category !== "no-match")
    .every(({ judgements }) => judgements.length >= 1 && judgements.every(({ gain, reason }) =>
      gain >= 1 && gain <= 3 && reason.length >= 20)));
  assert.deepEqual(fixture.prohibitedLegislation, {
    query: "legislation register",
    collection: "legislation",
    expectedErrorCode: "invalid_federated_search_request",
  });
});

test("fixture validation rejects unbounded, unjudged and legislation-admitting drift", async () => {
  const fixture = await readJson("evals/federated-search-quality.json");
  const cases = [
    (value) => { value.cases[0].limit = 21; },
    (value) => { value.cases[0].judgements[0].gain = 0; },
    (value) => { value.cases[0].collections = ["legislation"]; },
    (value) => { value.cases[1].id = value.cases[0].id; },
    (value) => { value.cases[1].category = "exact-id"; },
    (value) => { value.cases[0].personalContext = "must not be admitted"; },
  ];
  for (const mutate of cases) {
    const changed = structuredClone(fixture);
    mutate(changed);
    assert.throws(() => validateFederatedSearchQualityFixture(changed));
  }
  const accessor = structuredClone(fixture);
  Object.defineProperty(accessor.cases[0], "query", {
    enumerable: true,
    get() { throw new Error("must not execute"); },
  });
  assert.throws(
    () => validateFederatedSearchQualityFixture(accessor),
    /unknown or non-data field/u,
  );
});

test("nDCG and recall helpers use graded ranking and explicit relevant identifiers", () => {
  const judgements = [
    { recordId: "a", gain: 3 },
    { recordId: "b", gain: 2 },
    { recordId: "c", gain: 1 },
  ];
  assert.equal(ndcgAt(["a", "b", "c"], judgements, 10), 1);
  assert.ok(ndcgAt(["c", "b", "a"], judgements, 10) < 1);
  assert.equal(recallAt(["a", "irrelevant"], judgements, 20), 1 / 3);
  assert.equal(ndcgAt([], [], 10), null);
  assert.equal(recallAt([], [], 20), null);
});

test("the compiled runtime meets the frozen diagnostic gate and rejects legislation", async () => {
  const report = await runFederatedSearchQuality();
  assert.equal(report.caseCount, 8);
  assert.equal(report.judgedCaseCount, 7);
  assert.equal(report.metrics.meanNdcgAt10, 0.984698009);
  assert.equal(report.metrics.meanRecallAt20, 1);
  assert.equal(report.resultDigest, "122c504561bf09094d67ce38170c7c55fb2f9bf16acc671477d68da33b646b87");
  assert.equal(report.deterministicColdWarmMatch, true);
  assert.deepEqual(report.prohibitedLegislation, {
    collectionAbsent: true,
    requestRejected: true,
    errorCode: "invalid_federated_search_request",
  });
  assert.equal(report.boundaries.modelQualityClaimed, false);
  assert.equal(report.boundaries.corpusWideRecallClaimed, false);
  assert.equal(report.boundaries.officialApiCalled, false);
  assert.equal(report.boundaries.modelProviderCalled, false);
});

test("the build removes stale dist content and federated copying excludes Finder metadata", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-build-hygiene-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryRoot = resolve(root, "repository");
  const appRoot = resolve(repositoryRoot, "app");
  const distRoot = resolve(repositoryRoot, "dist");
  await mkdir(resolve(distRoot, "stale"), { recursive: true });
  await writeFile(resolve(distRoot, "stale", ".DS_Store"), "stale");
  await cleanDist(repositoryRoot);
  await assert.rejects(lstat(distRoot), { code: "ENOENT" });

  await mkdir(resolve(appRoot, "data", "federated-search", "records"), { recursive: true });
  for (const path of ["index.html", "style.css", "favicon.svg", "startup-watchdog.js"]) {
    await writeFile(resolve(appRoot, path), path);
  }
  for (const path of [
    "catalogue.json", "catalogue.json.sha256", "receipts.json", "receipts.json.sha256",
    "evidence-traces.json", "evidence-traces.json.sha256", "federation.json", "federation.json.sha256",
  ]) {
    await writeFile(resolve(appRoot, "data", path), path);
  }
  await writeFile(resolve(appRoot, "data", "federated-search", "manifest.json"), "{}");
  await writeFile(resolve(appRoot, "data", "federated-search", ".DS_Store"), "Finder metadata");
  await writeFile(resolve(appRoot, "data", "federated-search", "records", "records-000.json"), "{}");
  await writeFile(resolve(appRoot, "data", "federated-search", "records", ".DS_Store"), "Finder metadata");
  await mkdir(resolve(distRoot, "data"), { recursive: true });
  await writeFile(resolve(distRoot, ".DS_Store"), "Finder metadata recreated during compilation");
  await writeFile(resolve(distRoot, "data", ".DS_Store"), "Finder metadata recreated during compilation");
  await copyStatic({ appRoot, distRoot });

  assert.equal(await readFile(resolve(distRoot, "data", "federated-search", "manifest.json"), "utf8"), "{}");
  assert.equal(await readFile(resolve(distRoot, "data", "federated-search", "records", "records-000.json"), "utf8"), "{}");
  await assert.rejects(lstat(resolve(distRoot, "data", "federated-search", ".DS_Store")), { code: "ENOENT" });
  await assert.rejects(lstat(resolve(distRoot, "data", "federated-search", "records", ".DS_Store")), { code: "ENOENT" });
  await assert.rejects(lstat(resolve(distRoot, ".DS_Store")), { code: "ENOENT" });
  await assert.rejects(lstat(resolve(distRoot, "data", ".DS_Store")), { code: "ENOENT" });
});

test("the dist cleaner refuses a symbolic-link target without touching its referent", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-clean-symlink-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const repositoryRoot = resolve(root, "repository");
  const protectedDirectory = resolve(root, "protected");
  await mkdir(repositoryRoot, { recursive: true });
  await mkdir(protectedDirectory, { recursive: true });
  await writeFile(resolve(protectedDirectory, "keep.txt"), "keep");
  await symlink(protectedDirectory, resolve(repositoryRoot, "dist"));

  await assert.rejects(cleanDist(repositoryRoot), /must not be a symbolic link/u);
  assert.equal(await readFile(resolve(protectedDirectory, "keep.txt"), "utf8"), "keep");
});

test("package scripts clean before compilation and expose the frozen quality gate", async () => {
  const packageValue = await readJson("package.json");
  assert.equal(packageValue.scripts["dist:clean"], "node scripts/clean-dist.mjs");
  assert.equal(
    packageValue.scripts["evidence:presentation:audit"],
    "node scripts/audit-beginner-presentations.mjs",
  );
  assert.equal(
    packageValue.scripts.build,
    "npm run data:build && npm run data:validate && npm run dist:clean && tsc && npm run evidence:presentation:audit && node scripts/copy-static.mjs",
  );
  assert.equal(
    packageValue.scripts["okf-federation:quality:prepared"],
    "node scripts/run-federated-search-quality.mjs",
  );
  assert.equal(
    packageValue.scripts["okf-federation:quality"],
    "npm run build && npm run okf-federation:quality:prepared",
  );
});
