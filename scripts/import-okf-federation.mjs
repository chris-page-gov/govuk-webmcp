import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, mkdtemp, open, realpath, rename, rm } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export const FEDERATION_LOCK_SCHEMA = "govuk-webmcp.okf-federation-lock.v1";
export const FEDERATION_PROFILE = "govuk-webmcp.okf-federated-search.v1";
export const FEDERATION_EVIDENCE_TIER = "federated-source-snapshot";
export const FEDERATION_LOCK_PATH = "app/data/sources/okf-federation-lock.json";
export const FEDERATION_SOURCE_DIRECTORY = "app/data/sources/okf-federation";
export const FEDERATION_AUTHORED_AT = "2026-08-30T00:00:00Z";
export const REVIEWED_FEDERATION_LOCK_SHA256 = "bcd0b2b3631aea744b802e8b0199672fea76e446abe4adf2332e9c4683302b10";
export const MAX_SOURCE_BYTES = 16 * 1024 * 1024;
export const MAX_AGGREGATE_SOURCE_BYTES = 450 * 1024 * 1024;
export const MAX_AGGREGATE_STORED_BYTES = 32 * 1024 * 1024;
export const MAX_REQUEST_DURATION_MS = 60_000;
export const MAX_IMPORT_DURATION_MS = 10 * 60_000;

const SHA256 = /^[a-f0-9]{64}$/u;
const COMMIT = /^[a-f0-9]{40}$/u;
const SAFE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*$/u;

const SOURCE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "land-registry",
    title: "HM Land Registry public-estate OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-LandRegistry",
    baseUrl: "https://chris-page-gov.github.io/okf-LandRegistry/",
    deploymentId: "5860288274",
    revision: "1d708e39f2cde19610d43c5a7f5e36e4a2f947bc",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "hmlr-public-metadata-v0.2.0",
    descriptor: Object.freeze({
      path: "okf-explorer.json",
      bytes: 11287,
      sha256: "36d21eee6b3fcf85ea1a9f9a6501e39d73acba3aef9904c4120075878d4b4b5d",
    }),
    dataManifest: Object.freeze({
      path: "data/explorer/manifest.json",
      bytes: 21557,
      sha256: "8c59a3578fad8e5a5e67e70f66db19683bf41826e205fdc53c72ccd0b9a7f5dc",
    }),
    searchManifest: Object.freeze({
      path: "data/explorer/search/manifest.json",
      bytes: 22773,
      sha256: "25d47dab9b157dc96b27208e67af12d4ac5c35abfb4fb8dd89062cccba4f8707",
      schema: "okf-static-search.v2",
    }),
    population: Object.freeze({ records: 2203, unit: "search documents" }),
    expectedRecordArtifacts: 9,
    expectedSupportingArtifacts: 0,
    recordPathPattern: /^data\/explorer\/datasets-\d{3}\.json$/u,
    rights: Object.freeze({
      status: "source-specific",
      statement: "Per-record rights and access evidence are retained from the producer; inclusion does not grant rights to property data.",
    }),
    access: Object.freeze({
      status: "public-static-metadata",
      statement: "Metadata routes only; no title, property, ownership, address, polygon or personal records are included.",
    }),
    limitations: Object.freeze([
      "Metadata-only source snapshot; it contains no title-register, title-plan, ownership, address, polygon or personal rows.",
      "The producer is independent and is not endorsed by HM Land Registry.",
      "A record link and catalogue inclusion do not establish permission, legal effect or current operational availability.",
    ]),
  }),
  Object.freeze({
    id: "ons",
    title: "ONS data discovery OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-ons",
    baseUrl: "https://chris-page-gov.github.io/okf-ons/",
    deploymentId: "5969704658",
    revision: "b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf",
    revisionReproducibility: "deployed-bytes-observed-separately",
    snapshot: "monday-2026-07-17-r2",
    descriptor: Object.freeze({
      path: "okf-explorer.json",
      bytes: 6208,
      sha256: "a317360e11996059da9957d89d25e7b9cf5c9b94f31184e36baeee74a4af2719",
    }),
    dataManifest: Object.freeze({
      path: "data/manifest.json",
      bytes: 3644,
      sha256: "464aab1ad75fdf518ba31c394ecd78521b2e839602e6eaa97184bab89729ff09",
    }),
    searchManifest: Object.freeze({
      path: "data/search/manifest.json",
      bytes: 78812,
      sha256: "371de3b41a8c294313263de0d1795e98494ce061a053b9df99aac10efb97f53c",
      schema: "okf-static-search.v2",
    }),
    population: Object.freeze({ records: 5097, unit: "search documents" }),
    expectedRecordArtifacts: 11,
    expectedSupportingArtifacts: 0,
    recordPathPattern: /^data\/datasets-\d+\.json$/u,
    rights: Object.freeze({
      status: "source-specific",
      statement: "Rights remain source-specific; metadata inclusion does not grant access to a statistical service or observation payload.",
    }),
    access: Object.freeze({
      status: "public-static-metadata",
      statement: "Metadata discovery only; source endpoints and selection requirements remain producer-controlled.",
    }),
    limitations: Object.freeze([
      "The snapshot contains metadata from four declared adapters, not current statistical observations.",
      "The repository revision does not by itself reproduce the ignored generated Pages bundle; its deployed bytes are locked separately.",
      "A result does not establish statistical accuracy, currentness, endpoint access or permission to reuse linked material.",
    ]),
  }),
  Object.freeze({
    id: "government-apis",
    title: "UK Government APIs OKF",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-government-apis",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-government-apis/",
    deploymentId: "5969350495",
    revision: "55c7e67947dfd86e291ca987e354429c36b453d9",
    revisionReproducibility: "exact-repository-revision",
    snapshot: null,
    descriptor: Object.freeze({
      path: "okf-explorer.json",
      bytes: 6390,
      sha256: "9f268bbe014317384aa49cf39b42388f1bfe8b8c3d96b122da3ca7a58cd03c19",
    }),
    dataManifest: Object.freeze({
      path: "data/manifest.json",
      bytes: 6906,
      sha256: "f1f82072950b83e6b5300b93ff55dc7b82d1f7045a085f7533afd2fba8fcbbca",
    }),
    searchManifest: Object.freeze({
      path: "data/search/manifest.json",
      bytes: 74160,
      sha256: "8586ef20a136340509b20814fa5bf12c0bc88c6c36c8f50d5ac9c2efb426ccb5",
      schema: "okf-static-search.v1",
    }),
    population: Object.freeze({ records: 41598, unit: "search documents" }),
    expectedRecordArtifacts: 42,
    expectedSupportingArtifacts: 0,
    recordPathPattern: /^data\/apis-\d+\.json$/u,
    rights: Object.freeze({
      status: "source-specific",
      statement: "Licence and access evidence are record-specific; missing or inferred evidence remains visible and fails closed.",
    }),
    access: Object.freeze({
      status: "public-static-metadata",
      statement: "Catalogue metadata only; no endpoint is called and no credential, authorisation or service availability is implied.",
    }),
    limitations: Object.freeze([
      "The snapshot describes 41,598 records and is not a claim about every UK public API or dataset.",
      "Many producer records have missing, inferred or incomplete licence and access evidence.",
      "A catalogue result does not establish that an endpoint is live, public, authorised, openly licensed or safe to call.",
    ]),
  }),
  Object.freeze({
    id: "uk-living",
    title: "A Life in the UK — life-course discovery corpus",
    repositoryUrl: "https://github.com/chris-page-gov/okf-uk-living",
    baseUrl: "https://chris-page-gov.github.io/okf-uk-living/",
    deploymentId: "5943077379",
    revision: "4bc010eab3c9c072f68960393c1458a772aa700b",
    revisionReproducibility: "exact-repository-revision",
    snapshot: "life-course-authority-infrastructure-2026-08-08",
    descriptor: Object.freeze({
      path: "okf-explorer.json",
      bytes: 3378,
      sha256: "ff69f0162a4ba93156b150ae4eea0070c8c8a81187ed5cc7d2425f37b8db34dc",
    }),
    dataManifest: Object.freeze({
      path: "large/data/manifest.json",
      bytes: 1590,
      sha256: "fe0e11219ceec88702ca8a5d536d6d0ac0425f3bb29c7586884cfb0e56c957b4",
    }),
    searchManifest: Object.freeze({
      path: "large/data/search/manifest.json",
      bytes: 13344,
      sha256: "112608e17bca06d6b92313dbcdcff1f1798a2bfdc2cb11724a3d26b88d3d5e26",
      schema: "okf-static-search.v1",
    }),
    population: Object.freeze({
      records: 9757,
      unit: "search documents",
      serviceFamilies: 293,
      resources: 879,
    }),
    expectedRecordArtifacts: 10,
    expectedSupportingArtifacts: 1,
    recordPathPattern: /^large\/data\/records-\d+\.json$/u,
    supportingPathPattern: /^large\/data\/resources-\d+\.json$/u,
    rights: Object.freeze({
      status: "source-specific",
      statement: "Repository-authored structures and summaries use the producer notice; upstream content remains link-only.",
    }),
    access: Object.freeze({
      status: "public-static-metadata",
      statement: "Discovery routes only; jurisdiction, eligibility and provider decisions remain with the linked current authority.",
    }),
    limitations: Object.freeze([
      "The snapshot contains 9,757 records and governed concepts, including 293 service families; those counts are not interchangeable.",
      "Only 2 of 293 service families had named specialist acceptance at publication time.",
      "The source links and original summaries do not decide eligibility or provide legal, clinical, safeguarding or financial advice.",
    ]),
  }),
]);

export const EXPECTED_FEDERATION_SOURCES = Object.freeze(
  ["uk-living", "ons", "government-apis", "land-registry"].map((id) =>
    SOURCE_DEFINITIONS.find((source) => source.id === id)),
);

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
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

export function deterministicGzip(value) {
  const compressed = gzipSync(value, { level: 9, mtime: 0 });
  // RFC 1952 byte 9 identifies the compressor's operating system. Node writes
  // the host value, which made the reviewed Mac-authored bytes differ on the
  // Linux release runner despite an identical DEFLATE stream. Retain the
  // reviewed snapshot's explicit macOS value as part of this release contract.
  compressed[9] = 0x13;
  return compressed;
}

export function safeRelativePath(value, label = "Resource path") {
  if (typeof value !== "string" || value.length < 1 || value.length > 240 || !SAFE_PATH.test(value) || value.includes("\\")) {
    throw new Error(`${label} is not a safe relative path.`);
  }
  return value;
}

function exactHttpsUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is malformed.`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash || url.search || url.toString() !== value) {
    throw new Error(`${label} must be an exact credential-free HTTPS URL without a port, query or fragment.`);
  }
  return url;
}

export function resolveAllowedUrl(baseUrl, path) {
  const base = exactHttpsUrl(baseUrl, "Source base URL");
  const safePath = safeRelativePath(path);
  const resolved = new URL(safePath, base);
  if (resolved.origin !== base.origin || !resolved.pathname.startsWith(base.pathname) || resolved.username || resolved.password) {
    throw new Error("Resource URL escapes its exact allowed source base.");
  }
  return resolved.toString();
}

function exactDuration(value, label) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 60 * 60_000) {
    throw new Error(`${label} must be an integer from 1 millisecond to 1 hour.`);
  }
  return value;
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  throw signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
}

async function awaitWithAbort(value, signal) {
  throwIfAborted(signal);
  return await new Promise((resolvePromise, rejectPromise) => {
    const abort = () => rejectPromise(signal.reason ?? new DOMException("The operation was aborted.", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(value).then(
      (result) => {
        signal.removeEventListener("abort", abort);
        resolvePromise(result);
      },
      (error) => {
        signal.removeEventListener("abort", abort);
        rejectPromise(error);
      },
    );
  });
}

async function readBoundedResponse(response, url, maximumBytes, signal) {
  const declared = response.headers.get("content-length");
  if (declared !== null && (!Number.isSafeInteger(Number(declared)) || Number(declared) > maximumBytes)) {
    throw new Error(`${url} exceeds the ${maximumBytes}-byte response limit.`);
  }
  if (!response.body) {
    const bytes = new Uint8Array(await awaitWithAbort(response.arrayBuffer(), signal));
    if (bytes.byteLength > maximumBytes) throw new Error(`${url} exceeds the response limit.`);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const part = await awaitWithAbort(reader.read(), signal);
      if (part.done) break;
      length += part.value.byteLength;
      if (length > maximumBytes) {
        throw new Error(`${url} exceeds the response limit while streaming.`);
      }
      chunks.push(part.value);
    }
  } catch (error) {
    await reader.cancel(error).catch(() => {});
    throw error;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function fetchAllowedBytes(source, path, {
  fetchImpl = fetch,
  maximumBytes = MAX_SOURCE_BYTES,
  operationSignal,
  perRequestTimeoutMs = MAX_REQUEST_DURATION_MS,
} = {}) {
  if (!EXPECTED_FEDERATION_SOURCES.some((candidate) => candidate.id === source.id && candidate.baseUrl === source.baseUrl)) {
    throw new Error("Source is outside the exact federation allowlist.");
  }
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || maximumBytes > MAX_SOURCE_BYTES) {
    throw new Error("Response byte limit is outside the reviewed boundary.");
  }
  const requestedUrl = resolveAllowedUrl(source.baseUrl, path);
  const requestSignal = AbortSignal.timeout(exactDuration(perRequestTimeoutMs, "Per-request timeout"));
  const signal = operationSignal ? AbortSignal.any([operationSignal, requestSignal]) : requestSignal;
  throwIfAborted(signal);
  const pendingResponse = fetchImpl(requestedUrl, {
    headers: { Accept: "application/json" },
    credentials: "omit",
    redirect: "error",
    signal,
  });
  const response = await awaitWithAbort(pendingResponse, signal);
  if (!response.ok) throw new Error(`${requestedUrl}: ${response.status} ${response.statusText}`);
  const responseUrl = response.url || requestedUrl;
  const parsedResponseUrl = exactHttpsUrl(responseUrl, "Response URL");
  const parsedBase = new URL(source.baseUrl);
  if (
    parsedResponseUrl.origin !== parsedBase.origin ||
    !parsedResponseUrl.pathname.startsWith(parsedBase.pathname) ||
    parsedResponseUrl.toString() !== requestedUrl
  ) {
    throw new Error(`${requestedUrl} did not return from its exact allowed URL.`);
  }
  return readBoundedResponse(response, requestedUrl, maximumBytes, signal);
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

function referencePath(value, label) {
  if (typeof value === "string") return safeRelativePath(value, label);
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return safeRelativePath(value.path, label);
  }
  throw new Error(`${label} is malformed.`);
}

function validateExactReference(bytes, expected, label) {
  if (bytes.byteLength !== expected.bytes || sha256(bytes) !== expected.sha256) {
    throw new Error(`${label} differs from its exact published byte lock.`);
  }
}

function exactSourceDescriptor(source, descriptor, dataManifest, searchManifest) {
  if (
    descriptor === null || typeof descriptor !== "object" || Array.isArray(descriptor) ||
    descriptor.schema !== "okf-explorer-large-corpus.v1" || descriptor.kind !== "okf-large-corpus"
  ) {
    throw new Error(`${source.id} descriptor has an unsupported large-corpus identity.`);
  }
  if ((descriptor.snapshot ?? null) !== source.snapshot) throw new Error(`${source.id} descriptor snapshot drifted.`);
  if (descriptor.entrypoints?.data_manifest !== source.dataManifest.path) throw new Error(`${source.id} data-manifest path drifted.`);
  if (descriptor.entrypoints?.search_manifest !== source.searchManifest.path) throw new Error(`${source.id} search-manifest path drifted.`);
  if (searchManifest?.schema !== source.searchManifest.schema) throw new Error(`${source.id} search schema drifted.`);
  if ((searchManifest?.snapshot ?? searchManifest?.snapshot_id ?? null) !== source.snapshot) {
    throw new Error(`${source.id} search snapshot drifted.`);
  }
  const observedRecords = dataManifest?.counts?.records ?? dataManifest?.counts?.datasets;
  if (observedRecords !== source.population.records) throw new Error(`${source.id} population count drifted.`);
  if (searchManifest?.counts?.documents !== source.population.records) throw new Error(`${source.id} search-document count drifted.`);
}

function exactArtifactPaths(source, dataManifest) {
  const recordPaths = dataManifest?.chunks?.datasets;
  if (!Array.isArray(recordPaths) || recordPaths.length !== source.expectedRecordArtifacts) {
    throw new Error(`${source.id} record artifact count drifted.`);
  }
  const records = recordPaths.map((value, index) => referencePath(value, `${source.id} record artifact ${index}`));
  if (records.some((path) => !source.recordPathPattern.test(path)) || new Set(records).size !== records.length) {
    throw new Error(`${source.id} record artifact path set is invalid.`);
  }
  const supportingValues = source.expectedSupportingArtifacts ? dataManifest?.chunks?.resources : [];
  if (!Array.isArray(supportingValues) || supportingValues.length !== source.expectedSupportingArtifacts) {
    throw new Error(`${source.id} supporting artifact count drifted.`);
  }
  const supporting = supportingValues.map((value, index) => referencePath(value, `${source.id} supporting artifact ${index}`));
  if (supporting.some((path) => !source.supportingPathPattern?.test(path)) || new Set(supporting).size !== supporting.length) {
    throw new Error(`${source.id} supporting artifact path set is invalid.`);
  }
  return { records, supporting };
}

async function assertNoUnexpectedFiles(directory, expectedPaths) {
  let stat;
  try {
    stat = await lstat(directory);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${directory} must be a regular directory.`);
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || entry.isSymbolicLink() || !expectedPaths.has(resolve(directory, entry.name))) {
      throw new Error(`${directory} contains an unexpected or unsafe artifact: ${entry.name}`);
    }
  }
}

async function readRegularFile(path, label) {
  const initial = await lstat(path);
  if (!initial.isFile() || initial.isSymbolicLink()) throw new Error(`${label} must be a regular non-symlink file.`);
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.dev !== initial.dev || opened.ino !== initial.ino) {
      throw new Error(`${label} changed while being read.`);
    }
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

async function regularRootIdentity(root) {
  const stat = await lstat(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Import root must be a regular non-symlink directory.");
  if (await realpath(root) !== root) throw new Error("Import root must use its exact canonical path.");
  return { dev: stat.dev, ino: stat.ino };
}

async function assertRootIdentity(root, identity) {
  const stat = await lstat(root);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.dev !== identity.dev || stat.ino !== identity.ino) {
    throw new Error("Import root changed during the federation import.");
  }
}

function containedRelativePath(root, target, label) {
  const value = relative(root, target);
  if (!value || isAbsolute(value) || value === ".." || value.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)) {
    throw new Error(`${label} escapes the import root.`);
  }
  return value;
}

async function existingStat(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function assertSafeDestination(root, target, label) {
  const value = containedRelativePath(root, target, label);
  const parts = value.split(/[\\/]/u);
  let current = root;
  for (const part of parts.slice(0, -1)) {
    current = resolve(current, part);
    const stat = await existingStat(current);
    if (!stat) return;
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`${label} has a non-directory or symbolic-link ancestor: ${relative(root, current)}`);
    }
  }
  const destination = await existingStat(target);
  if (destination && (!destination.isFile() || destination.isSymbolicLink())) {
    throw new Error(`${label} must be absent or a regular non-symlink file.`);
  }
}

async function ensureRegularDirectory(root, directory, label) {
  const value = containedRelativePath(root, resolve(directory, ".import-placeholder"), label);
  const parts = value.split(/[\\/]/u).slice(0, -1);
  let current = root;
  for (const part of parts) {
    current = resolve(current, part);
    let stat = await existingStat(current);
    if (!stat) {
      try {
        await mkdir(current);
      } catch (error) {
        if (error?.code !== "EEXIST") throw error;
      }
      stat = await lstat(current);
    }
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`${label} has a non-directory or symbolic-link ancestor: ${relative(root, current)}`);
    }
  }
}

async function writeStagedFile(stagingRoot, storedPath, bytes) {
  const safePath = safeRelativePath(storedPath, "Staged artifact path");
  const target = resolve(stagingRoot, safePath);
  await ensureRegularDirectory(stagingRoot, dirname(target), "Staged artifact path");
  const handle = await open(
    target,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0),
    0o644,
  );
  try {
    await handle.writeFile(bytes);
  } finally {
    await handle.close();
  }
}

async function promoteStagedFile(root, stagingRoot, storedPath, label) {
  const safePath = safeRelativePath(storedPath, label);
  const staged = resolve(stagingRoot, safePath);
  const target = resolve(root, safePath);
  await assertSafeDestination(root, target, label);
  await ensureRegularDirectory(root, dirname(target), label);
  const stagedStat = await lstat(staged);
  if (!stagedStat.isFile() || stagedStat.isSymbolicLink()) throw new Error(`${label} staging file is unsafe.`);
  await rename(staged, target);
  const finalStat = await lstat(target);
  if (!finalStat.isFile() || finalStat.isSymbolicLink()) throw new Error(`${label} promotion did not create a regular file.`);
}

function reviewedSourceFor(lock, source) {
  const reviewed = lock.sources?.find((candidate) => candidate?.id === source.id);
  if (!reviewed) throw new Error(`${source.id} is absent from the reviewed federation lock.`);
  return reviewed;
}

function reviewedArtifactFor(reviewedSource, role, index, sourcePath, storedPath) {
  const collection = role === "records" ? reviewedSource.recordArtifacts : reviewedSource.supportingArtifacts;
  const pin = collection?.[index];
  if (
    !pin || pin.role !== role || pin.sourcePath !== sourcePath || pin.storedPath !== storedPath ||
    pin.compression !== "gzip" || !Number.isSafeInteger(pin.itemCount) ||
    !Number.isSafeInteger(pin.sourceBytes) || !Number.isSafeInteger(pin.storedBytes) ||
    !SHA256.test(pin.sourceSha256) || !SHA256.test(pin.storedSha256)
  ) {
    throw new Error(`${reviewedSource.id} ${role} artifact ${index} differs from its reviewed pin identity.`);
  }
  return pin;
}

export function verifyFetchedArtifactAgainstPin(sourceBytes, value, compressed, pin, label = "Fetched artifact") {
  if (
    !Array.isArray(value) || value.length !== pin.itemCount ||
    sourceBytes.byteLength !== pin.sourceBytes || sha256(sourceBytes) !== pin.sourceSha256 ||
    compressed.byteLength !== pin.storedBytes || sha256(compressed) !== pin.storedSha256
  ) {
    throw new Error(`${label} differs from its reviewed byte, digest or item-count pin.`);
  }
}

export async function loadReviewedFederationLock({ rootDir = process.cwd() } = {}) {
  const root = resolve(rootDir);
  await regularRootIdentity(root);
  const bytes = await readRegularFile(resolve(root, FEDERATION_LOCK_PATH), "Reviewed federation lock");
  if (sha256(bytes) !== REVIEWED_FEDERATION_LOCK_SHA256) {
    throw new Error("Reviewed federation lock differs from its code-reviewed byte pin.");
  }
  let lock;
  try {
    lock = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error("Reviewed federation lock is not valid JSON.", { cause: error });
  }
  if (
    lock?.schema !== FEDERATION_LOCK_SCHEMA || lock.profile !== FEDERATION_PROFILE ||
    lock.evidenceTier !== FEDERATION_EVIDENCE_TIER || lock.authoredAt !== FEDERATION_AUTHORED_AT ||
    lock.lockDigest !== sha256(canonicalJson(withoutField(lock, "lockDigest"))) ||
    !Array.isArray(lock.sources) || lock.sources.length !== EXPECTED_FEDERATION_SOURCES.length ||
    lock.sources.some((source, index) => source?.id !== EXPECTED_FEDERATION_SOURCES[index].id)
  ) {
    throw new Error("Reviewed federation lock has an invalid semantic identity.");
  }
  return { bytes, lock };
}

export async function assertSafeImportDestinations(rootDir, lock) {
  const root = resolve(rootDir);
  const identity = await regularRootIdentity(root);
  for (const source of lock.sources) {
    const artifacts = [...source.recordArtifacts, ...source.supportingArtifacts];
    const expectedPaths = new Set(artifacts.map((artifact) => resolve(root, artifact.storedPath)));
    await assertNoUnexpectedFiles(resolve(root, FEDERATION_SOURCE_DIRECTORY, source.id), expectedPaths);
    for (const artifact of artifacts) {
      safeRelativePath(artifact.storedPath, `${source.id} reviewed stored path`);
      await assertSafeDestination(root, resolve(root, artifact.storedPath), `${source.id} reviewed stored artifact`);
    }
  }
  await assertSafeDestination(root, resolve(root, FEDERATION_LOCK_PATH), "Federation lock destination");
  await assertRootIdentity(root, identity);
  return identity;
}

export async function importOkfFederation({
  rootDir = process.cwd(),
  fetchImpl = fetch,
  maximumImportDurationMs = MAX_IMPORT_DURATION_MS,
  perRequestTimeoutMs = MAX_REQUEST_DURATION_MS,
} = {}) {
  const root = resolve(rootDir);
  const rootIdentity = await regularRootIdentity(root);
  const { lock: reviewedLock } = await loadReviewedFederationLock({ rootDir: root });
  await assertSafeImportDestinations(root, reviewedLock);
  const importDurationMs = exactDuration(maximumImportDurationMs, "Import-wide timeout");
  exactDuration(perRequestTimeoutMs, "Per-request timeout");
  const stagingRoot = await mkdtemp(resolve(root, ".okf-federation-import-"));
  const stagingStat = await lstat(stagingRoot);
  if (!stagingStat.isDirectory() || stagingStat.isSymbolicLink()) throw new Error("Federation staging root is unsafe.");
  const operationSignal = AbortSignal.timeout(importDurationMs);
  const fetchOptions = { fetchImpl, operationSignal, perRequestTimeoutMs };
  const importedSources = [];
  let aggregateSourceBytes = 0;
  let aggregateStoredBytes = 0;
  let aggregateArtifactCount = 0;

  try {
    for (const source of EXPECTED_FEDERATION_SOURCES) {
      throwIfAborted(operationSignal);
      const reviewedSource = reviewedSourceFor(reviewedLock, source);
      const descriptorBytes = await fetchAllowedBytes(source, source.descriptor.path, fetchOptions);
      const dataManifestBytes = await fetchAllowedBytes(source, source.dataManifest.path, fetchOptions);
      const searchManifestBytes = await fetchAllowedBytes(source, source.searchManifest.path, fetchOptions);
      validateExactReference(descriptorBytes, source.descriptor, `${source.id} descriptor`);
      validateExactReference(dataManifestBytes, source.dataManifest, `${source.id} data manifest`);
      validateExactReference(searchManifestBytes, source.searchManifest, `${source.id} search manifest`);
      const descriptor = parseJson(descriptorBytes, `${source.id} descriptor`);
      const dataManifest = parseJson(dataManifestBytes, `${source.id} data manifest`);
      const searchManifest = parseJson(searchManifestBytes, `${source.id} search manifest`);
      exactSourceDescriptor(source, descriptor, dataManifest, searchManifest);
      const paths = exactArtifactPaths(source, dataManifest);
      const artifacts = [];
      const sourceDirectory = resolve(root, FEDERATION_SOURCE_DIRECTORY, source.id);
      let sourceRecordCount = 0;
      let supportingCount = 0;

      for (const [role, sourcePaths] of [["records", paths.records], ["resources", paths.supporting]]) {
        for (const [index, sourcePath] of sourcePaths.entries()) {
          throwIfAborted(operationSignal);
          const sourceBytes = await fetchAllowedBytes(source, sourcePath, fetchOptions);
          aggregateSourceBytes += sourceBytes.byteLength;
          if (aggregateSourceBytes > MAX_AGGREGATE_SOURCE_BYTES) throw new Error("Federation source bytes exceed the aggregate limit.");
          const value = parseJson(sourceBytes, `${source.id} ${sourcePath}`);
          if (!Array.isArray(value)) throw new Error(`${source.id} ${sourcePath} must contain a JSON array.`);
          if (role === "records") sourceRecordCount += value.length;
          else supportingCount += value.length;
          const compressed = deterministicGzip(sourceBytes);
          aggregateStoredBytes += compressed.byteLength;
          if (aggregateStoredBytes > MAX_AGGREGATE_STORED_BYTES) throw new Error("Federation stored bytes exceed the aggregate limit.");
          const storedName = `${role}-${String(index).padStart(3, "0")}.json.gz`;
          const absoluteStoredPath = resolve(sourceDirectory, storedName);
          const storedPath = relative(root, absoluteStoredPath).replaceAll("\\", "/");
          safeRelativePath(storedPath, "Stored artifact path");
          const reviewedArtifact = reviewedArtifactFor(reviewedSource, role, index, sourcePath, storedPath);
          verifyFetchedArtifactAgainstPin(
            sourceBytes,
            value,
            compressed,
            reviewedArtifact,
            `${source.id} ${sourcePath}`,
          );
          await writeStagedFile(stagingRoot, storedPath, compressed);
          artifacts.push({
            role,
            sourcePath,
            storedPath,
            sourceBytes: sourceBytes.byteLength,
            sourceSha256: sha256(sourceBytes),
            storedBytes: compressed.byteLength,
            storedSha256: sha256(compressed),
            compression: "gzip",
            itemCount: value.length,
          });
          aggregateArtifactCount += 1;
        }
      }
      if (sourceRecordCount !== source.population.records) throw new Error(`${source.id} imported record count drifted.`);
      if ((source.population.resources ?? 0) !== supportingCount) throw new Error(`${source.id} imported supporting-resource count drifted.`);

      const recordArtifacts = artifacts.filter(({ role }) => role === "records");
      const supportingArtifacts = artifacts.filter(({ role }) => role !== "records");
      const decodedBytes = artifacts.reduce((total, artifact) => total + artifact.sourceBytes, 0);
      const storedBytes = artifacts.reduce((total, artifact) => total + artifact.storedBytes, 0);
      const importedSource = {
        id: source.id,
        title: source.title,
        repositoryUrl: source.repositoryUrl,
        baseUrl: source.baseUrl,
        deploymentId: source.deploymentId,
        revision: source.revision,
        revisionReproducibility: source.revisionReproducibility,
        snapshot: source.snapshot,
        descriptor: source.descriptor,
        dataManifest: source.dataManifest,
        searchManifest: source.searchManifest,
        population: source.population,
        recordArtifacts,
        supportingArtifacts,
        requestPolicy: {
          credentials: "omit",
          redirect: "error",
          sameOriginOnly: true,
        },
        budgets: {
          maximumResourceBytes: MAX_SOURCE_BYTES,
          maximumDecodedBytes: decodedBytes,
          maximumStoredBytes: storedBytes,
          maximumArtifacts: artifacts.length,
        },
        rights: source.rights,
        access: source.access,
        limitations: source.limitations,
        boundaries: {
          officialApiCalls: false,
          personalContextAccepted: false,
          sourceDerivedContentIsUntrusted: true,
        },
        entryDigest: "",
      };
      importedSource.entryDigest = sha256(canonicalJson(withoutField(importedSource, "entryDigest")));
      importedSources.push(importedSource);
    }

    const sourceIdentityDigest = sha256(canonicalJson(importedSources.map(sourceIdentity)));
    const aggregate = {
      sourceCount: importedSources.length,
      recordCount: importedSources.reduce((total, source) => total + source.population.records, 0),
      artifactCount: aggregateArtifactCount,
      decodedArtifactBytes: aggregateSourceBytes,
      storedArtifactBytes: aggregateStoredBytes,
      sourceIdentityDigest,
      aggregateDigest: "",
    };
    aggregate.aggregateDigest = sha256(canonicalJson(withoutField(aggregate, "aggregateDigest")));
    const lock = {
      schema: FEDERATION_LOCK_SCHEMA,
      profile: FEDERATION_PROFILE,
      evidenceTier: FEDERATION_EVIDENCE_TIER,
      authoredAt: FEDERATION_AUTHORED_AT,
      aggregate,
      sources: importedSources,
      lockDigest: "",
    };
    lock.lockDigest = sha256(canonicalJson(withoutField(lock, "lockDigest")));
    const lockBytes = Buffer.from(`${JSON.stringify(lock, null, 2)}\n`);
    if (sha256(lockBytes) !== REVIEWED_FEDERATION_LOCK_SHA256) {
      throw new Error("Generated federation lock differs from the reviewed byte pin.");
    }
    await writeStagedFile(stagingRoot, FEDERATION_LOCK_PATH, lockBytes);

    throwIfAborted(operationSignal);
    await assertRootIdentity(root, rootIdentity);
    await assertSafeImportDestinations(root, reviewedLock);
    for (const importedSource of importedSources) {
      for (const artifact of [...importedSource.recordArtifacts, ...importedSource.supportingArtifacts]) {
        throwIfAborted(operationSignal);
        await promoteStagedFile(root, stagingRoot, artifact.storedPath, `${importedSource.id} stored artifact`);
      }
    }
    throwIfAborted(operationSignal);
    await promoteStagedFile(root, stagingRoot, FEDERATION_LOCK_PATH, "Federation lock destination");
    await assertRootIdentity(root, rootIdentity);
    return lock;
  } finally {
    const stagingRelative = relative(root, stagingRoot);
    if (/^\.okf-federation-import-[^/\\]+$/u.test(stagingRelative)) {
      await rm(stagingRoot, { recursive: true, force: true });
    }
  }
}

function isMain() {
  return Boolean(process.argv[1]) && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
}

if (isMain()) {
  const lock = await importOkfFederation();
  console.log(`Imported ${lock.aggregate.recordCount} records from ${lock.aggregate.sourceCount} locked OKF sources.`);
}
