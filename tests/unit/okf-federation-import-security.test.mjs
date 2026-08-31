import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import {
  assertSafeImportDestinations,
  canonicalJson,
  deterministicGzip,
  FEDERATION_LOCK_PATH,
  importOkfFederation,
  loadReviewedFederationLock,
  resolveAllowedUrl,
  sha256,
  verifyFetchedArtifactAgainstPin,
} from "../../scripts/import-okf-federation.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

async function temporaryRoot(t, prefix) {
  const root = await mkdtemp(join(tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function seedReviewedLock(root) {
  const { bytes, lock } = await loadReviewedFederationLock({ rootDir: repositoryRoot });
  const path = resolve(root, FEDERATION_LOCK_PATH);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  return { bytes, lock };
}

function digestWithout(value, field) {
  const copy = structuredClone(value);
  delete copy[field];
  return sha256(canonicalJson(copy));
}

test("deterministic gzip has one reviewed cross-platform byte representation", () => {
  const source = Buffer.from("cross-platform deterministic gzip fixture\n", "utf8");
  const compressed = deterministicGzip(source);

  assert.equal(compressed[9], 0x13);
  assert.equal(sha256(compressed), "bc896441cf794f3070c58e29bdfa32c5207d0d6a5d3feeb990c3621ab2e2f1cf");
  assert.deepEqual(gunzipSync(compressed), source);
});

test("admits the reviewed artefact and rejects a valid same-count semantic mutation", async () => {
  const { lock } = await loadReviewedFederationLock({ rootDir: repositoryRoot });
  await assertSafeImportDestinations(repositoryRoot, lock);
  const source = lock.sources.find(({ id }) => id === "uk-living");
  const pin = source.recordArtifacts[0];
  const compressed = await readFile(resolve(repositoryRoot, pin.storedPath));
  const sourceBytes = gunzipSync(compressed);
  const records = JSON.parse(sourceBytes);

  assert.doesNotThrow(() => verifyFetchedArtifactAgainstPin(sourceBytes, records, compressed, pin));

  const changedRecords = structuredClone(records);
  changedRecords[0].title = "Altered publisher data under unchanged revision claim!";
  assert.equal(changedRecords.length, records.length);
  assert.equal(typeof changedRecords[0].concept_id, "string");
  const changedBytes = Buffer.from(JSON.stringify(changedRecords));
  const changedCompressed = deterministicGzip(changedBytes);
  assert.throws(
    () => verifyFetchedArtifactAgainstPin(changedBytes, changedRecords, changedCompressed, pin),
    /differs from its reviewed byte, digest or item-count pin/u,
  );
});

test("rejects a non-default HTTPS source port", () => {
  assert.throws(
    () => resolveAllowedUrl("https://example.gov.uk:8443/", "data.json"),
    /without a port, query or fragment/u,
  );
});

test("rejects a co-digested mutation of the reviewed lock", async (t) => {
  const root = await temporaryRoot(t, "govuk-webmcp-import-rebound-lock-");
  const { lock } = await loadReviewedFederationLock({ rootDir: repositoryRoot });
  const changed = structuredClone(lock);
  changed.sources[0].recordArtifacts[0].sourceSha256 = "0".repeat(64);
  changed.sources[0].entryDigest = digestWithout(changed.sources[0], "entryDigest");
  changed.lockDigest = digestWithout(changed, "lockDigest");
  const path = resolve(root, FEDERATION_LOCK_PATH);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(changed, null, 2)}\n`);
  await assert.rejects(
    loadReviewedFederationLock({ rootDir: root }),
    /differs from its code-reviewed byte pin/u,
  );
});

test("applies one import-wide deadline across request timeouts and removes staged output", async (t) => {
  const root = await temporaryRoot(t, "govuk-webmcp-import-deadline-");
  const { bytes } = await seedReviewedLock(root);
  let requests = 0;
  const started = Date.now();
  const fetchImpl = (_url, { signal }) => {
    requests += 1;
    return new Promise((_resolveResponse, rejectResponse) => {
      const reject = () => rejectResponse(signal.reason);
      if (signal.aborted) reject();
      else signal.addEventListener("abort", reject, { once: true });
    });
  };

  await assert.rejects(
    importOkfFederation({
      rootDir: root,
      fetchImpl,
      maximumImportDurationMs: 30,
      perRequestTimeoutMs: 1_000,
    }),
    (error) => {
      assert.equal(error.name, "TimeoutError");
      return true;
    },
  );
  assert.equal(requests, 1);
  assert.ok(Date.now() - started < 1_000, "The import-wide deadline did not terminate promptly.");
  assert.deepEqual(await readFile(resolve(root, FEDERATION_LOCK_PATH)), bytes);
  assert.deepEqual((await readdir(root)).filter((name) => name.startsWith(".okf-federation-import-")), []);
});

test("rejects destination, ancestor and final-lock symlinks without touching their targets", async (t) => {
  const { lock } = await loadReviewedFederationLock({ rootDir: repositoryRoot });

  await t.test("artefact destination", async (t) => {
    const root = await temporaryRoot(t, "govuk-webmcp-import-destination-link-");
    await seedReviewedLock(root);
    const pin = lock.sources[0].recordArtifacts[0];
    const target = resolve(root, "artefact-target.bin");
    await writeFile(target, "sentinel");
    const linkedPath = resolve(root, pin.storedPath);
    await mkdir(dirname(linkedPath), { recursive: true });
    await symlink(target, linkedPath);
    let fetches = 0;
    await assert.rejects(
      importOkfFederation({ rootDir: root, fetchImpl: () => { fetches += 1; } }),
      /unexpected or unsafe artifact|regular non-symlink file/u,
    );
    assert.equal(fetches, 0);
    assert.equal(await readFile(target, "utf8"), "sentinel");
  });

  await t.test("artefact ancestor", async (t) => {
    const root = await temporaryRoot(t, "govuk-webmcp-import-ancestor-link-");
    const outside = await temporaryRoot(t, "govuk-webmcp-import-ancestor-target-");
    await seedReviewedLock(root);
    await mkdir(resolve(root, "app/data/sources"), { recursive: true });
    await symlink(outside, resolve(root, "app/data/sources/okf-federation"));
    let fetches = 0;
    await assert.rejects(
      importOkfFederation({ rootDir: root, fetchImpl: () => { fetches += 1; } }),
      /symbolic-link ancestor/u,
    );
    assert.equal(fetches, 0);
    assert.deepEqual(await readdir(outside), []);
  });

  await t.test("final lock", async (t) => {
    const root = await temporaryRoot(t, "govuk-webmcp-import-lock-link-");
    const target = resolve(root, "lock-target.json");
    await writeFile(target, "sentinel");
    const linkedPath = resolve(root, FEDERATION_LOCK_PATH);
    await mkdir(dirname(linkedPath), { recursive: true });
    await symlink(target, linkedPath);
    let fetches = 0;
    await assert.rejects(
      importOkfFederation({ rootDir: root, fetchImpl: () => { fetches += 1; } }),
      /Reviewed federation lock must be a regular non-symlink file/u,
    );
    assert.equal(fetches, 0);
    assert.equal(await readFile(target, "utf8"), "sentinel");
  });
});
