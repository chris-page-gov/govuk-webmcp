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
    importedSha256: "3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc",
    recordCount: 69,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.CURATED_API_DATA,
    importedPath: "app/data/sources/curated-api-data.json",
    importedSha256: "f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794",
    recordCount: 11,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.ANSWER_PACKS,
    importedPath: "app/data/sources/answer-packs.json",
    importedSha256: "ea00549f465ef4d7fc65c9e5853ee2b78ab6d9823d25e9268516d7b955d70f1f",
    recordCount: 1,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.CORPUS_ADMISSIONS,
    importedPath: "app/data/sources/corpus-admissions.json",
    importedSha256: "e508693ca57615f4e988f9cd076f2d9183451303892f2ea59e40fef4fb25eaed",
    recordCount: 10,
  }),
  Object.freeze({
    id: SOURCE_LOCK_IDS.OKF_FEDERATION,
    importedPath: "app/data/sources/okf-federation-lock.json",
    importedSha256: "bcd0b2b3631aea744b802e8b0199672fea76e446abe4adf2332e9c4683302b10",
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

async function validateSourceLocksAgainstExpected(expectedSourceLocks, { rootDir = process.cwd() } = {}) {
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
  if (registry.sources.length !== expectedSourceLocks.length) {
    throw new Error(`The source-lock registry must contain exactly ${expectedSourceLocks.length} admitted sources.`);
  }

  const expectedById = new Map(expectedSourceLocks.map((source) => [source.id, source]));
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
    if (!SHA256.test(source.importedSha256) || source.importedSha256 !== expected.importedSha256) {
      throw new Error(`Source lock ${source.id} differs from its code-reviewed imported SHA-256 pin.`);
    }
    locksById.set(source.id, source);
    importedPaths.add(source.importedPath);
  }
  for (const expected of expectedSourceLocks) {
    if (!locksById.has(expected.id)) throw new Error(`Required source lock ${expected.id} is missing.`);
  }

  const sourcesById = new Map();
  for (const expected of expectedSourceLocks) {
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

export function createSourceLockValidator(expectedSourceLocks = EXPECTED_SOURCE_LOCKS) {
  if (!Array.isArray(expectedSourceLocks) || expectedSourceLocks.length !== EXPECTED_SOURCE_LOCKS.length) {
    throw new TypeError(`Expected source locks must contain exactly ${EXPECTED_SOURCE_LOCKS.length} entries.`);
  }
  const reviewedSourceLocks = expectedSourceLocks.map((source, index) => {
    const admitted = EXPECTED_SOURCE_LOCKS[index];
    if (
      source === null || typeof source !== "object" || Array.isArray(source) ||
      source.id !== admitted.id || source.importedPath !== admitted.importedPath ||
      source.recordCount !== admitted.recordCount || !SHA256.test(source.importedSha256)
    ) {
      throw new TypeError(`Expected source lock ${admitted.id} has an invalid reviewed identity or SHA-256 pin.`);
    }
    return Object.freeze({ ...source });
  });
  return (options) => validateSourceLocksAgainstExpected(reviewedSourceLocks, options);
}

export const validateSourceLocks = createSourceLockValidator();
