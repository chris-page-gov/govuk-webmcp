import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { resolve } from "node:path";

export const SOURCE_LOCK_IDS = Object.freeze({
  GOVUK_CONTENT: "okf-govuk-content:new-child-69",
  CURATED_API_DATA: "curated-official-api-data-2026-08-29",
  ANSWER_PACKS: "answer-packs:curated-2026-08-30",
  CORPUS_ADMISSIONS: "corpus-admissions:reviewed-2026-08-30",
  OKF_FEDERATION: "okf-federation:public-pages-2026-08-30",
});

export const EXPECTED_SOURCE_LOCKS = Object.freeze([
  Object.freeze({
    id: SOURCE_LOCK_IDS.GOVUK_CONTENT,
    importedPath: "app/data/sources/govuk-content-69.lock.json",
    recordCount: 69,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.CURATED_API_DATA,
    importedPath: "app/data/sources/curated-api-data.json",
    recordCount: 11,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.ANSWER_PACKS,
    importedPath: "app/data/sources/answer-packs.json",
    recordCount: 1,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.CORPUS_ADMISSIONS,
    importedPath: "app/data/sources/corpus-admissions.json",
    recordCount: 10,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.OKF_FEDERATION,
    importedPath: "app/data/sources/okf-federation-lock.json",
    recordCount: 4,
  }),
]);

const REGISTRY_PATH = "app/data/sources/source-locks.json";
const SHA256 = /^[a-f0-9]{64}$/u;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function readRegularFile(path, label) {
  let initial;
  try {
    initial = await lstat(path);
  } catch (error) {
    throw new Error(`${label} could not be inspected as a regular file.`, { cause: error });
  }
  if (initial.isSymbolicLink() || !initial.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file.`);
  }

  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== initial.dev || opened.ino !== initial.ino) {
      throw new Error(`${label} changed while it was being admitted.`);
    }
    return await handle.readFile();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(label)) throw error;
    throw new Error(`${label} could not be read as a regular non-symlink file.`, { cause: error });
  } finally {
    await handle?.close();
  }
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

function itemCount(value) {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") {
    if (Array.isArray(value.packs)) return value.packs.length;
    if (Array.isArray(value.collections)) return value.collections.length;
    if (Array.isArray(value.sources)) return value.sources.length;
  }
  return undefined;
}

export async function validateSourceLocks({ rootDir = process.cwd() } = {}) {
  const repositoryRoot = resolve(rootDir);
  const registryBytes = await readRegularFile(
    resolve(repositoryRoot, REGISTRY_PATH),
    "The source-lock registry",
  );
  const registry = parseJson(registryBytes, "The source-lock registry");
  if (
    registry === null || typeof registry !== "object" || Array.isArray(registry) ||
    registry.schema !== "trusted-govuk-discovery.source-locks.v1" ||
    typeof registry.generatedAt !== "string" || !registry.generatedAt ||
    !Array.isArray(registry.sources)
  ) {
    throw new Error("The source-lock registry is malformed.");
  }
  if (registry.sources.length !== EXPECTED_SOURCE_LOCKS.length) {
    throw new Error(`The source-lock registry must contain exactly ${EXPECTED_SOURCE_LOCKS.length} admitted sources.`);
  }

  const expectedById = new Map(EXPECTED_SOURCE_LOCKS.map((source) => [source.id, source]));
  const locksById = new Map();
  const importedPaths = new Set();
  for (const source of registry.sources) {
    if (source === null || typeof source !== "object" || Array.isArray(source) || typeof source.id !== "string") {
      throw new Error("A source-lock entry is malformed.");
    }
    if (locksById.has(source.id)) throw new Error(`Source-lock identifier ${source.id} is duplicated.`);
    if (typeof source.importedPath !== "string") throw new Error(`Source lock ${source.id} has no imported path.`);
    if (importedPaths.has(source.importedPath)) throw new Error(`Source-lock path ${source.importedPath} is duplicated.`);
    const expected = expectedById.get(source.id);
    if (!expected) throw new Error(`Source lock ${source.id} is not admitted by this release.`);
    if (source.importedPath !== expected.importedPath) {
      throw new Error(`Source lock ${source.id} must bind ${expected.importedPath}.`);
    }
    if (source.recordCount !== expected.recordCount) {
      throw new Error(`Source lock ${source.id} must declare exactly ${expected.recordCount} authored items.`);
    }
    locksById.set(source.id, source);
    importedPaths.add(source.importedPath);
  }
  for (const expected of EXPECTED_SOURCE_LOCKS) {
    if (!locksById.has(expected.id)) throw new Error(`Required source lock ${expected.id} is missing.`);
  }

  const sourcesById = new Map();
  for (const expected of EXPECTED_SOURCE_LOCKS) {
    const lock = locksById.get(expected.id);
    const bytes = await readRegularFile(
      resolve(repositoryRoot, expected.importedPath),
      `Locked source ${expected.id}`,
    );
    if (!SHA256.test(lock.importedSha256) || sha256(bytes) !== lock.importedSha256) {
      throw new Error(`Source lock mismatch for ${expected.id}.`);
    }
    const value = parseJson(bytes, `Locked source ${expected.id}`);
    if (itemCount(value) !== expected.recordCount) {
      throw new Error(`Source lock ${expected.id} does not match its authored item count.`);
    }
    sourcesById.set(expected.id, Object.freeze({ lock, bytes, value }));
  }

  return Object.freeze({ registry, registryBytes, sourcesById });
}
