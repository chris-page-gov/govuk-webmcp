import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createSourceLockValidator,
  EXPECTED_SOURCE_LOCKS,
  SOURCE_LOCK_IDS,
  validateSourceLocks,
} from "../../scripts/lib/source-locks.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const registryPath = "app/data/sources/source-locks.json";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function sourceValue(source) {
  if (source.id === SOURCE_LOCK_IDS.ANSWER_PACKS) {
    return { packs: [{ id: "answer:fixture" }] };
  }
  if (source.id === SOURCE_LOCK_IDS.CORPUS_ADMISSIONS) {
    return { collections: Array.from({ length: source.recordCount }, (_, index) => ({ id: `corpus:${index}` })) };
  }
  if (source.id === SOURCE_LOCK_IDS.OKF_FEDERATION) {
    return { sources: Array.from({ length: source.recordCount }, (_, index) => ({ id: `okf:${index}` })) };
  }
  return Array.from({ length: source.recordCount }, (_, index) => ({ id: index }));
}

async function writeRegistry(fixture) {
  await writeFile(fixture.registryFile, `${JSON.stringify(fixture.registry, null, 2)}\n`);
}

async function fixture(t) {
  const rootDir = await mkdtemp(join(tmpdir(), "govuk-webmcp-source-locks-"));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  const sources = [];
  const bytesById = new Map();
  const expectedSourceLocks = [];
  for (const expected of EXPECTED_SOURCE_LOCKS) {
    const bytes = Buffer.from(`${JSON.stringify(sourceValue(expected))}\n`);
    const importedSha256 = sha256(bytes);
    const absolutePath = resolve(rootDir, expected.importedPath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, bytes);
    bytesById.set(expected.id, bytes);
    sources.push({
      id: expected.id,
      importedPath: expected.importedPath,
      importedSha256,
      recordCount: expected.recordCount,
    });
    expectedSourceLocks.push({ ...expected, importedSha256 });
  }
  const value = {
    rootDir,
    registryFile: resolve(rootDir, registryPath),
    registry: {
      schema: "trusted-govuk-discovery.source-locks.v1",
      generatedAt: "2026-08-30T00:00:00Z",
      sources,
    },
    bytesById,
    expectedSourceLocks,
  };
  await writeRegistry(value);
  return value;
}

function validateFixtureSourceLocks(value, expectedSourceLocks = value.expectedSourceLocks) {
  return createSourceLockValidator(expectedSourceLocks)({ rootDir: value.rootDir });
}

async function runScript(script, cwd) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [join(repositoryRoot, "scripts", script)], { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolveResult({ code, stdout, stderr }));
  });
}

test("admits exactly the five expected regular source files and returns their verified bytes", async (t) => {
  const value = await fixture(t);
  const admitted = await validateFixtureSourceLocks(value);
  assert.deepEqual([...admitted.sourcesById.keys()], EXPECTED_SOURCE_LOCKS.map(({ id }) => id));
  for (const expected of EXPECTED_SOURCE_LOCKS) {
    assert.deepEqual(admitted.sourcesById.get(expected.id).bytes, value.bytesById.get(expected.id));
  }
});

test("the tracked sources match all five code-reviewed imported SHA-256 pins", async () => {
  const admitted = await validateSourceLocks({ rootDir: repositoryRoot });
  for (const expected of EXPECTED_SOURCE_LOCKS) {
    assert.equal(admitted.sourcesById.get(expected.id).lock.importedSha256, expected.importedSha256);
  }
});

for (const expected of EXPECTED_SOURCE_LOCKS) {
  test(`rejects missing required source lock ${expected.id}`, async (t) => {
    const value = await fixture(t);
    value.registry.sources = value.registry.sources.filter(({ id }) => id !== expected.id);
    await writeRegistry(value);
    await assert.rejects(
      validateFixtureSourceLocks(value),
      /must contain exactly 5 admitted sources/u,
    );
  });
}

test("rejects an extra source lock", async (t) => {
  const value = await fixture(t);
  value.registry.sources.push({
    id: "extra:not-admitted",
    importedPath: "app/data/sources/extra.json",
    importedSha256: "0".repeat(64),
    recordCount: 1,
  });
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /must contain exactly 5 admitted sources/u,
  );
});

test("rejects duplicate source-lock identifiers", async (t) => {
  const value = await fixture(t);
  value.registry.sources[1].id = value.registry.sources[0].id;
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /identifier .* is duplicated/u,
  );
});

test("rejects duplicate imported paths", async (t) => {
  const value = await fixture(t);
  value.registry.sources[1].importedPath = value.registry.sources[0].importedPath;
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /path .* is duplicated/u,
  );
});

for (const [index, expected] of EXPECTED_SOURCE_LOCKS.entries()) {
  test(`rejects admitted identifier ${expected.id} redirected to another path`, async (t) => {
    const value = await fixture(t);
    const redirectedPath = `app/data/sources/redirected-${index}.json`;
    await writeFile(resolve(value.rootDir, redirectedPath), value.bytesById.get(expected.id));
    value.registry.sources[index].importedPath = redirectedPath;
    await writeRegistry(value);
    await assert.rejects(
      validateFixtureSourceLocks(value),
      new RegExp(`Source lock ${expected.id} must bind`, "u"),
    );
  });
}

test("rejects swapped paths even when IDs and paths remain individually complete", async (t) => {
  const value = await fixture(t);
  const firstPath = value.registry.sources[0].importedPath;
  value.registry.sources[0].importedPath = value.registry.sources[1].importedPath;
  value.registry.sources[1].importedPath = firstPath;
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /must bind app\/data\/sources\/govuk-content-69\.lock\.json/u,
  );
});

test("rejects a source whose bytes no longer match its SHA-256 lock", async (t) => {
  const value = await fixture(t);
  const expected = EXPECTED_SOURCE_LOCKS[0];
  const changed = Buffer.from(`${JSON.stringify(Array.from({ length: expected.recordCount }, (_, index) => ({ changed: index })))}\n`);
  await writeFile(resolve(value.rootDir, expected.importedPath), changed);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    new RegExp(`Source lock mismatch for ${expected.id}`, "u"),
  );
});

test("rejects a same-count source and registry substitution even when both are co-digested", async (t) => {
  const value = await fixture(t);
  const expected = EXPECTED_SOURCE_LOCKS[0];
  const changed = Buffer.from(`${JSON.stringify(Array.from(
    { length: expected.recordCount },
    (_, index) => ({ substituted: index }),
  ))}\n`);
  await writeFile(resolve(value.rootDir, expected.importedPath), changed);
  value.registry.sources[0].importedSha256 = sha256(changed);
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    new RegExp(`Source lock ${expected.id} differs from its code-reviewed imported SHA-256 pin`, "u"),
  );
});

test("rejects a locked source whose observed item count changed", async (t) => {
  const value = await fixture(t);
  const expected = EXPECTED_SOURCE_LOCKS[0];
  const changed = Buffer.from(`${JSON.stringify(Array.from({ length: expected.recordCount - 1 }, (_, index) => ({ id: index })))}\n`);
  await writeFile(resolve(value.rootDir, expected.importedPath), changed);
  value.registry.sources[0].importedSha256 = sha256(changed);
  await writeRegistry(value);
  const reviewedChangedSource = value.expectedSourceLocks.map((source) => (
    source.id === expected.id ? { ...source, importedSha256: sha256(changed) } : source
  ));
  await assert.rejects(
    validateFixtureSourceLocks(value, reviewedChangedSource),
    /does not match its authored item count/u,
  );
});

test("rejects a lock that changes the release item count", async (t) => {
  const value = await fixture(t);
  value.registry.sources[0].recordCount -= 1;
  await writeRegistry(value);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /must declare exactly 69 authored items/u,
  );
});

test("rejects a symlink even when its target bytes match the lock", async (t) => {
  const value = await fixture(t);
  const expected = EXPECTED_SOURCE_LOCKS[0];
  const lockedPath = resolve(value.rootDir, expected.importedPath);
  const targetPath = resolve(value.rootDir, "app/data/sources/symlink-target.json");
  await writeFile(targetPath, value.bytesById.get(expected.id));
  await rm(lockedPath);
  await symlink(targetPath, lockedPath);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /must be a regular non-symlink file/u,
  );
});

test("rejects a directory in place of a locked regular file", async (t) => {
  const value = await fixture(t);
  const expected = EXPECTED_SOURCE_LOCKS[0];
  const lockedPath = resolve(value.rootDir, expected.importedPath);
  await rm(lockedPath);
  await mkdir(lockedPath);
  await assert.rejects(
    validateFixtureSourceLocks(value),
    /must be a regular non-symlink file/u,
  );
});

test("every standalone builder rejects an incomplete registry before consuming a source", async (t) => {
  const value = await fixture(t);
  value.registry.sources.pop();
  await writeRegistry(value);
  for (const script of ["build-catalogue.mjs", "build-evidence.mjs", "build-federation.mjs"]) {
    const result = await runScript(script, value.rootDir);
    assert.notEqual(result.code, 0, `${script} unexpectedly succeeded: ${result.stdout}`);
    assert.match(result.stderr, /must contain exactly 5 admitted sources/u, `${script} did not fail at source admission`);
  }
});
