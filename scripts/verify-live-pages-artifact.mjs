#!/usr/bin/env node

import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  PUBLIC_CAPTURE_TARGET,
  PUBLIC_DEPLOYMENT_REPOSITORY,
  PUBLIC_DEPLOYMENT_SCHEMA,
  validatePublicDeploymentMetadata,
} from "./lib/chrome-devtools-capture-target.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(import.meta.dirname, "..");
const RELEASE = "v0.4.0-rc.1";
const LOCAL_RECEIPT = resolve(
  repositoryRoot,
  ".evals/live-artifact-verification-v0.4.0-rc.1.json",
);
const REVIEWED_RECEIPT = resolve(
  repositoryRoot,
  "docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json",
);
const COMMIT = /^[a-f0-9]{40}$/u;
const RUN_ID = /^[1-9][0-9]*$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const MAX_API_BYTES = 8 * 1024 * 1024;
export const LIVE_PAGES_LIMITS = Object.freeze({
  maximumArchiveBytes: 256 * 1024 * 1024,
  maximumRegularFiles: 4_096,
  maximumDirectoryEntries: 512,
  maximumTotalRegularBytes: 192 * 1024 * 1024,
  maximumFileBytes: 8 * 1024 * 1024,
  fetchConcurrency: 8,
  perFileTimeoutMs: 60_000,
  comparisonTimeoutMs: 10 * 60 * 1_000,
});
const MAX_TAR_ENTRIES = LIVE_PAGES_LIMITS.maximumRegularFiles
  + LIVE_PAGES_LIMITS.maximumDirectoryEntries
  + 1;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactRegularPath(path, label) {
  invariant(typeof path === "string" && path.length > 0, `${label} is empty.`);
  invariant(!path.includes("\\") && !path.startsWith("/"), `${label} is not a relative POSIX path.`);
  const parts = path.split("/");
  invariant(
    parts.every((part) => part && part !== "." && part !== ".."),
    `${label} contains an unsafe path segment.`,
  );
  invariant(/^[A-Za-z0-9._/-]+$/u.test(path), `${label} contains an unsupported character.`);
  return path;
}

export function parseVerificationOptions(argv = process.argv.slice(2), environment = process.env) {
  const allowed = new Set(["--admit-public-evidence", "--overwrite-reviewed-evidence"]);
  for (const argument of argv) {
    invariant(allowed.has(argument), `Unknown argument: ${argument}`);
  }
  const admitPublicEvidence = argv.includes("--admit-public-evidence");
  const overwriteReviewedEvidence = argv.includes("--overwrite-reviewed-evidence");
  invariant(
    !overwriteReviewedEvidence || admitPublicEvidence,
    "--overwrite-reviewed-evidence requires --admit-public-evidence.",
  );
  const expectedCommit = environment.WEBMCP_EXPECTED_COMMIT;
  const runId = environment.GOVUK_WEBMCP_PAGES_RUN_ID;
  invariant(
    typeof expectedCommit === "string" && COMMIT.test(expectedCommit),
    "WEBMCP_EXPECTED_COMMIT must be the exact lowercase 40-character protected-main commit.",
  );
  invariant(
    typeof runId === "string" && RUN_ID.test(runId),
    "GOVUK_WEBMCP_PAGES_RUN_ID must be the exact successful Pages workflow run ID.",
  );
  return { admitPublicEvidence, expectedCommit, overwriteReviewedEvidence, runId };
}

export function validatePagesWorkflowRun(value, expectedCommit, runId) {
  invariant(value && typeof value === "object" && !Array.isArray(value), "Pages run metadata is invalid.");
  invariant(String(value.id) === runId, "Pages run metadata has the wrong run ID.");
  invariant(value.path === ".github/workflows/pages.yml", "The selected run is not the Pages workflow.");
  invariant(value.event === "workflow_dispatch", "The Pages run was not manually dispatched.");
  invariant(value.head_branch === "main", "The Pages run did not execute on protected main.");
  invariant(value.head_sha === expectedCommit, "The Pages run does not bind the expected protected-main commit.");
  invariant(
    value.status === "completed" && value.conclusion === "success",
    "The Pages run has not completed successfully.",
  );
  return {
    id: runId,
    headSha: value.head_sha,
    workflowPath: value.path,
  };
}

export function selectPagesArtifact(value, runId) {
  invariant(value && typeof value === "object" && !Array.isArray(value), "Pages artifact metadata is invalid.");
  invariant(Array.isArray(value.artifacts) && value.artifacts.length <= 100, "Pages artifact list is invalid or too large.");
  const candidates = value.artifacts.filter(({ name }) => name === "github-pages");
  invariant(candidates.length === 1, "The Pages run must expose exactly one github-pages artifact.");
  const artifact = candidates[0];
  invariant(Number.isSafeInteger(artifact.id) && artifact.id > 0, "The Pages artifact ID is invalid.");
  invariant(artifact.expired === false, "The Pages artifact has expired.");
  invariant(
    artifact.workflow_run === undefined || String(artifact.workflow_run?.id) === runId,
    "The Pages artifact belongs to a different workflow run.",
  );
  invariant(
    typeof artifact.digest === "string" && /^sha256:[a-f0-9]{64}$/u.test(artifact.digest),
    "The Pages artifact API digest is invalid.",
  );
  invariant(
    typeof artifact.archive_download_url === "string"
      && artifact.archive_download_url === `${artifact.url}/zip`,
    "The Pages artifact download URL is not the canonical GitHub API URL.",
  );
  return {
    id: artifact.id,
    apiDigest: artifact.digest,
    archiveDownloadUrl: artifact.archive_download_url,
  };
}

export function validateArchiveDigest(bytes, apiDigest) {
  invariant(Buffer.isBuffer(bytes) && bytes.length > 0, "The downloaded Pages archive is empty.");
  invariant(bytes.length <= LIVE_PAGES_LIMITS.maximumArchiveBytes, "The downloaded Pages archive exceeds its byte allowance.");
  const observed = `sha256:${sha256(bytes)}`;
  invariant(observed === apiDigest, "The downloaded Pages archive does not match its GitHub API digest.");
  return observed;
}

function parseTarPathListing(text) {
  invariant(typeof text === "string" && text.length > 0, "The Pages artifact tar contains no entries.");
  const rawLines = text.trimEnd().split("\n");
  invariant(
    rawLines.length > 0 && rawLines.length <= MAX_TAR_ENTRIES,
    "The Pages artifact has an invalid total entry count.",
  );
  const entries = [];
  const seen = new Set();
  for (const rawLine of rawLines) {
    invariant(!rawLine.includes("\r") && rawLine.length <= 1_024, "The Pages artifact tar has a malformed entry.");
    const root = rawLine === "." || rawLine === "./";
    const trailingSlash = rawLine.endsWith("/");
    let path;
    if (root) {
      path = ".";
    } else {
      path = rawLine.startsWith("./") ? rawLine.slice(2) : rawLine;
      if (trailingSlash) path = path.slice(0, -1);
      path = exactRegularPath(path, "Pages artifact entry");
    }
    invariant(!seen.has(path), `The Pages artifact repeats the canonical path ${path}.`);
    seen.add(path);
    entries.push({ path, root, trailingSlash });
  }
  return entries;
}

export function normaliseTarEntries(text) {
  const paths = parseTarPathListing(text)
    .filter(({ root, trailingSlash }) => !root && !trailingSlash)
    .map(({ path }) => path);
  invariant(paths.length > 0, "The Pages artifact has no regular files.");
  return paths.sort((left, right) => left.localeCompare(right, "en-GB"));
}

export function validateTarEntryTypes(text) {
  invariant(typeof text === "string" && text.length > 0, "The Pages artifact tar has no verbose entries.");
  const rawLines = text.trimEnd().split("\n");
  invariant(
    rawLines.length > 0 && rawLines.length <= MAX_TAR_ENTRIES,
    "The Pages artifact has an invalid verbose entry count.",
  );
  return rawLines.map((rawLine) => {
    invariant(!rawLine.includes("\r") && rawLine.length <= 2_048, "The Pages artifact tar has a malformed verbose entry.");
    invariant(
      rawLine.startsWith("-") || rawLine.startsWith("d"),
      "The Pages artifact tar contains a link or another unsupported entry type.",
    );
    return rawLine[0];
  });
}

export function validateTarArchiveListings(pathText, verboseText) {
  const entries = parseTarPathListing(pathText);
  const types = validateTarEntryTypes(verboseText);
  invariant(
    entries.length === types.length,
    "The Pages artifact path and type listings have different entry counts.",
  );
  const regularPaths = [];
  const regularPathSet = new Set();
  const directoryPaths = new Set();
  const addDirectoryPath = (path) => {
    invariant(
      !regularPathSet.has(path),
      `The Pages artifact uses ${path} as both a regular file and a directory.`,
    );
    directoryPaths.add(path);
    invariant(
      directoryPaths.size <= LIVE_PAGES_LIMITS.maximumDirectoryEntries,
      "The Pages artifact exceeds the directory-entry work budget.",
    );
  };
  for (const [index, entry] of entries.entries()) {
    const type = types[index];
    if (!entry.root) {
      const parts = entry.path.split("/");
      for (let partCount = 1; partCount < parts.length; partCount += 1) {
        addDirectoryPath(parts.slice(0, partCount).join("/"));
      }
    }
    if (type === "d") {
      if (!entry.root) addDirectoryPath(entry.path);
      continue;
    }
    invariant(!entry.root && !entry.trailingSlash, "A Pages artifact regular file uses a directory path alias.");
    invariant(
      !directoryPaths.has(entry.path),
      `The Pages artifact uses ${entry.path} as both a regular file and a directory.`,
    );
    regularPathSet.add(entry.path);
    regularPaths.push(entry.path);
  }
  invariant(regularPaths.length > 0, "The Pages artifact has no regular files.");
  invariant(
    regularPaths.length <= LIVE_PAGES_LIMITS.maximumRegularFiles,
    "The Pages artifact exceeds the regular-file work budget.",
  );
  // Only the locale-independent leading type byte is consumed from `tar -tvf`.
  // GNU tar and bsdtar format size/date columns differently, so declared size is
  // not parsed here. The raw tar byte cap and post-extraction regular-file size
  // check remain the portable size controls; paths, types and the all-member
  // count are enforced before extraction.
  return regularPaths.sort((left, right) => left.localeCompare(right, "en-GB"));
}

export function validateDeploymentFile(value, expectedCommit, runId) {
  const metadata = validatePublicDeploymentMetadata(value, expectedCommit);
  invariant(metadata.repository === PUBLIC_DEPLOYMENT_REPOSITORY, "Deployment metadata has the wrong repository.");
  invariant(metadata.runId === runId, "Deployment metadata has the wrong Pages run ID.");
  return metadata;
}

export function buildVerificationManifest(files) {
  invariant(Array.isArray(files) && files.length > 0, "The verification manifest has no files.");
  const ordered = [...files].sort(({ path: left }, { path: right }) => left.localeCompare(right, "en-GB"));
  const paths = new Set();
  for (const file of ordered) {
    exactRegularPath(file.path, "Verification manifest path");
    invariant(!paths.has(file.path), `Verification manifest path is duplicated: ${file.path}.`);
    paths.add(file.path);
    invariant(SHA256.test(file.sha256), `Verification manifest digest is invalid for ${file.path}.`);
  }
  return `${ordered.map(({ path, sha256: digest }) => `${digest}  ${path}`).join("\n")}\n`;
}

export function createLiveVerificationReceipt({
  artifact,
  artifactTarSha256,
  expectedCommit,
  files,
  mismatches,
  observedAt,
  runId,
  statusCounts,
}) {
  const manifest = buildVerificationManifest(files);
  return {
    schema: "govuk-webmcp.live-pages-verification.v2",
    observedAt,
    repository: PUBLIC_DEPLOYMENT_REPOSITORY,
    baseUrl: PUBLIC_CAPTURE_TARGET,
    commit: expectedCommit,
    runId,
    artifact: {
      id: artifact.id,
      apiDigest: artifact.apiDigest,
      tarSha256: artifactTarSha256,
    },
    fileCount: files.length,
    byteCount: files.reduce((total, { byteCount }) => total + byteCount, 0),
    manifestSha256: sha256(manifest),
    statusCounts,
    mismatches,
    boundaries: {
      comparedEveryRegularArtifactFile: true,
      followedRedirects: false,
      cacheBustingQueryUsed: true,
      browserJourneyObserved: false,
      budgets: structuredClone(LIVE_PAGES_LIMITS),
    },
  };
}

const authenticatedLiveReceipts = new WeakMap();

function assertExactKeys(value, expected, label) {
  invariant(
    value && typeof value === "object" && !Array.isArray(value)
      && canonicalJson(Object.keys(value).sort()) === canonicalJson([...expected].sort()),
    `${label} has unknown or missing fields.`,
  );
}

export function validateLivePagesReceiptShape(receipt) {
  assertExactKeys(
    receipt,
    [
      "schema",
      "observedAt",
      "repository",
      "baseUrl",
      "commit",
      "runId",
      "artifact",
      "fileCount",
      "byteCount",
      "manifestSha256",
      "statusCounts",
      "mismatches",
      "boundaries",
    ],
    "The live Pages verification receipt",
  );
  invariant(
    receipt.schema === "govuk-webmcp.live-pages-verification.v2",
    "The live Pages verification receipt has the wrong schema.",
  );
  invariant(
    typeof receipt.observedAt === "string" && Number.isFinite(Date.parse(receipt.observedAt)),
    "The live Pages verification receipt has no valid observation time.",
  );
  invariant(
    receipt.repository === PUBLIC_DEPLOYMENT_REPOSITORY,
    "The live Pages verification receipt does not name the canonical repository.",
  );
  invariant(
    receipt.baseUrl === PUBLIC_CAPTURE_TARGET,
    "The live Pages verification receipt does not name the canonical public URL.",
  );
  invariant(
    typeof receipt.commit === "string" && COMMIT.test(receipt.commit),
    "The live Pages verification receipt has no exact protected-main commit.",
  );
  invariant(
    typeof receipt.runId === "string" && RUN_ID.test(receipt.runId),
    "The live Pages verification receipt has no exact Pages run ID.",
  );
  assertExactKeys(receipt.artifact, ["id", "apiDigest", "tarSha256"], "The live Pages artefact binding");
  invariant(
    Number.isSafeInteger(receipt.artifact.id) && receipt.artifact.id > 0,
    "The live Pages verification receipt has an invalid artefact ID.",
  );
  invariant(
    typeof receipt.artifact.apiDigest === "string"
      && /^sha256:[a-f0-9]{64}$/u.test(receipt.artifact.apiDigest),
    "The live Pages verification receipt has an invalid API digest.",
  );
  invariant(
    typeof receipt.artifact.tarSha256 === "string" && SHA256.test(receipt.artifact.tarSha256),
    "The live Pages verification receipt has an invalid tar digest.",
  );
  invariant(
    Number.isSafeInteger(receipt.fileCount)
      && receipt.fileCount > 0
      && receipt.fileCount <= LIVE_PAGES_LIMITS.maximumRegularFiles,
    "The live Pages verification receipt has an invalid compared-file count.",
  );
  invariant(
    Number.isSafeInteger(receipt.byteCount)
      && receipt.byteCount >= receipt.fileCount
      && receipt.byteCount <= LIVE_PAGES_LIMITS.maximumTotalRegularBytes,
    "The live Pages verification receipt has an invalid compared-byte count.",
  );
  invariant(
    typeof receipt.manifestSha256 === "string" && SHA256.test(receipt.manifestSha256),
    "The live Pages verification receipt has an invalid manifest digest.",
  );
  assertExactKeys(receipt.statusCounts, ["200"], "The live Pages HTTP status counts");
  invariant(
    receipt.statusCounts["200"] === receipt.fileCount,
    "The live Pages verification receipt does not bind HTTP 200 for every compared file.",
  );
  invariant(
    Array.isArray(receipt.mismatches) && receipt.mismatches.length === 0,
    "The live Pages verification receipt is not a clean byte comparison.",
  );
  assertExactKeys(
    receipt.boundaries,
    ["comparedEveryRegularArtifactFile", "followedRedirects", "cacheBustingQueryUsed", "browserJourneyObserved", "budgets"],
    "The live Pages verification boundaries",
  );
  invariant(
    receipt.boundaries.comparedEveryRegularArtifactFile === true
      && receipt.boundaries.followedRedirects === false
      && receipt.boundaries.cacheBustingQueryUsed === true
      && receipt.boundaries.browserJourneyObserved === false
      && canonicalJson(receipt.boundaries.budgets) === canonicalJson(LIVE_PAGES_LIMITS),
    "The live Pages verification receipt does not retain the full byte-comparison boundary and budgets.",
  );
  return receipt;
}

export function livePagesReceiptBinding(receipt) {
  validateLivePagesReceiptShape(receipt);
  const { observedAt: _observedAt, ...binding } = receipt;
  return structuredClone(binding);
}

export function isAuthenticatedLivePagesReceipt(receipt) {
  if (receipt === null || typeof receipt !== "object") return false;
  const authenticatedBindingSha256 = authenticatedLiveReceipts.get(receipt);
  if (authenticatedBindingSha256 === undefined) return false;
  try {
    return sha256(canonicalJson(receipt))
      === authenticatedBindingSha256;
  } catch {
    return false;
  }
}

export async function authenticateLivePagesReceipt(
  candidate,
  collectImplementation = collectLivePagesArtifactVerification,
) {
  const expected = validateLivePagesReceiptShape(candidate);
  const result = await collectImplementation({
    expectedCommit: expected.commit,
    runId: expected.runId,
    admitPublicEvidence: false,
    overwriteReviewedEvidence: false,
  });
  const observed = validateLivePagesReceiptShape(result?.receipt);
  invariant(
    canonicalJson(livePagesReceiptBinding(observed))
      === canonicalJson(livePagesReceiptBinding(expected)),
    "The supplied live Pages receipt does not match a fresh authenticated observation.",
  );
  authenticatedLiveReceipts.set(
    observed,
    sha256(canonicalJson(observed)),
  );
  return observed;
}

async function ghApiJson(endpoint) {
  const { stdout } = await execFileAsync("gh", ["api", endpoint], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: MAX_API_BYTES,
    timeout: 30_000,
  });
  invariant(Buffer.byteLength(stdout, "utf8") <= MAX_API_BYTES, "GitHub API response exceeds its byte allowance.");
  try {
    return JSON.parse(stdout);
  } catch {
    throw new Error("GitHub API returned invalid JSON.");
  }
}

async function ghApiBytes(endpoint) {
  const { stdout } = await execFileAsync("gh", ["api", endpoint], {
    cwd: repositoryRoot,
    encoding: "buffer",
    maxBuffer: LIVE_PAGES_LIMITS.maximumArchiveBytes,
    timeout: 120_000,
  });
  return Buffer.from(stdout);
}

async function commandText(command, arguments_, maximumBytes = MAX_API_BYTES) {
  const { stdout } = await execFileAsync(command, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: maximumBytes,
    timeout: 120_000,
  });
  return stdout;
}

export function measureTarRegularPayload(
  tarPath,
  {
    maximumBytes = LIVE_PAGES_LIMITS.maximumTotalRegularBytes,
    spawnImplementation = spawn,
    timeoutMs = 120_000,
  } = {},
) {
  return new Promise((resolveResult, reject) => {
    invariant(Number.isSafeInteger(maximumBytes) && maximumBytes > 0, "The tar payload byte budget is invalid.");
    invariant(Number.isSafeInteger(timeoutMs) && timeoutMs > 0, "The tar payload timeout is invalid.");
    const child = spawnImplementation("tar", ["-xOf", tarPath], {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    let totalBytes = 0;
    let stderrBytes = 0;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolveResult(value);
    };
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish(new Error("The Pages artifact logical-byte preflight exceeded its time budget."));
    }, timeoutMs);
    timer.unref();
    child.once("error", (error) => finish(error));
    child.stdout.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maximumBytes) {
        child.kill("SIGTERM");
        finish(new Error("The Pages artifact exceeds the aggregate-byte work budget before extraction."));
      }
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > MAX_API_BYTES) {
        child.kill("SIGTERM");
        finish(new Error("The tar payload preflight emitted too much diagnostic output."));
      }
    });
    child.once("close", (code) => {
      if (code !== 0) {
        finish(new Error("The tar payload preflight did not complete successfully."));
      } else {
        finish(null, totalBytes);
      }
    });
  });
}

async function regularFiles(root) {
  const rootReal = await realpath(root);
  const files = [];
  let totalBytes = 0;
  let directoryCount = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      const info = await lstat(path);
      invariant(!info.isSymbolicLink(), "The Pages artifact contains a symbolic link.");
      if (info.isDirectory()) {
        directoryCount += 1;
        invariant(
          directoryCount <= LIVE_PAGES_LIMITS.maximumDirectoryEntries,
          "The extracted Pages artifact exceeds the directory-entry work budget.",
        );
        await visit(path);
        continue;
      }
      invariant(info.isFile(), "The Pages artifact contains a non-regular entry.");
      invariant(
        info.size > 0 && info.size <= LIVE_PAGES_LIMITS.maximumFileBytes,
        "A Pages artifact file has an invalid size.",
      );
      invariant(
        files.length < LIVE_PAGES_LIMITS.maximumRegularFiles,
        "The extracted Pages artifact exceeds the regular-file work budget.",
      );
      totalBytes += info.size;
      invariant(
        totalBytes <= LIVE_PAGES_LIMITS.maximumTotalRegularBytes,
        "The extracted Pages artifact exceeds the aggregate-byte work budget.",
      );
      const fileReal = await realpath(path);
      const pathFromRoot = relative(rootReal, fileReal);
      invariant(
        pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${sep}`),
        "A Pages artifact file resolves outside the extraction root.",
      );
      files.push({
        absolutePath: fileReal,
        path: exactRegularPath(pathFromRoot.split(sep).join("/"), "Extracted Pages artifact path"),
        byteCount: info.size,
      });
    }
  }
  await visit(root);
  return {
    files: files.sort(({ path: left }, { path: right }) => left.localeCompare(right, "en-GB")),
    totalBytes,
  };
}

export async function validateLocalPagesBuildBinding(
  receipt,
  root = resolve(repositoryRoot, "dist"),
) {
  const expected = validateLivePagesReceiptShape(receipt);
  const inventory = await regularFiles(root);
  invariant(
    inventory.files.length === expected.fileCount,
    "The local Pages build file count does not match the authenticated receipt.",
  );
  invariant(
    inventory.totalBytes === expected.byteCount,
    "The local Pages build byte count does not match the authenticated receipt.",
  );
  const manifestFiles = [];
  for (const file of inventory.files) {
    manifestFiles.push({
      path: file.path,
      sha256: sha256(await readFile(file.absolutePath)),
    });
  }
  invariant(
    sha256(buildVerificationManifest(manifestFiles)) === expected.manifestSha256,
    "The local Pages build manifest does not match the authenticated receipt.",
  );
  const deploymentFile = inventory.files.find(({ path }) => path === "deployment.json");
  invariant(deploymentFile, "The local Pages build contains no deployment.json.");
  validateDeploymentFile(
    JSON.parse(await readFile(deploymentFile.absolutePath, "utf8")),
    expected.commit,
    expected.runId,
  );
  return expected;
}

async function readResponseBytes(response, maximumBytes, signal = null) {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    invariant(/^\d+$/u.test(contentLength), "A live response has a malformed Content-Length header.");
    invariant(Number(contentLength) <= maximumBytes, "A live response exceeds its expected byte allowance.");
  }
  invariant(response.body, "A live response has no body.");
  const read = (async () => {
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      const bytes = Buffer.from(chunk);
      length += bytes.length;
      invariant(length <= maximumBytes, "A live response exceeds its expected byte allowance.");
      chunks.push(bytes);
    }
    return Buffer.concat(chunks, length);
  })();
  return signal === null ? read : abortable(read, signal);
}

function abortable(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolveResult, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(promise).then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolveResult(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

async function compareLiveFile(file, cacheKey, fetchImplementation = fetch, comparisonSignal) {
  const expected = await readFile(file.absolutePath);
  invariant(expected.length === file.byteCount, `Artifact file changed while reading: ${file.path}.`);
  const url = new URL(file.path.split("/").map(encodeURIComponent).join("/"), PUBLIC_CAPTURE_TARGET);
  url.searchParams.set("verify", cacheKey);
  let response;
  const perFileSignal = AbortSignal.timeout(LIVE_PAGES_LIMITS.perFileTimeoutMs);
  const signal = comparisonSignal
    ? AbortSignal.any([comparisonSignal, perFileSignal])
    : perFileSignal;
  try {
    response = await abortable(fetchImplementation(url, {
      cache: "no-store",
      credentials: "omit",
      redirect: "manual",
      signal,
    }), signal);
  } catch (error) {
    if (comparisonSignal?.aborted) throw comparisonSignal.reason;
    return {
      path: file.path,
      status: 0,
      byteCount: file.byteCount,
      sha256: sha256(expected),
      mismatch: `request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  if (response.status !== 200) {
    return {
      path: file.path,
      status: response.status,
      byteCount: file.byteCount,
      sha256: sha256(expected),
      mismatch: `expected HTTP 200, received ${response.status}`,
    };
  }
  try {
    const observed = await readResponseBytes(response, file.byteCount + 1, signal);
    return {
      path: file.path,
      status: response.status,
      byteCount: file.byteCount,
      sha256: sha256(expected),
      mismatch: observed.equals(expected)
        ? null
        : `live bytes differ (expected ${file.byteCount}/${sha256(expected)}, received ${observed.length}/${sha256(observed)})`,
    };
  } catch (error) {
    if (comparisonSignal?.aborted) throw comparisonSignal.reason;
    return {
      path: file.path,
      status: response.status,
      byteCount: file.byteCount,
      sha256: sha256(expected),
      mismatch: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function compareAllLiveFiles(
  files,
  cacheKey,
  {
    comparisonTimeoutMs = LIVE_PAGES_LIMITS.comparisonTimeoutMs,
    fetchImplementation = fetch,
  } = {},
) {
  invariant(
    Array.isArray(files)
      && files.length > 0
      && files.length <= LIVE_PAGES_LIMITS.maximumRegularFiles,
    "The live comparison file set is empty or exceeds its work budget.",
  );
  invariant(
    Number.isSafeInteger(comparisonTimeoutMs) && comparisonTimeoutMs > 0,
    "The whole-comparison timeout is invalid.",
  );
  const results = new Array(files.length);
  let nextIndex = 0;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error("The complete live Pages comparison exceeded its time budget."));
  }, comparisonTimeoutMs);
  timer.unref();
  async function worker() {
    while (!controller.signal.aborted && nextIndex < files.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await compareLiveFile(
        files[index],
        cacheKey,
        fetchImplementation,
        controller.signal,
      );
    }
  }
  try {
    await Promise.all(Array.from({
      length: Math.min(LIVE_PAGES_LIMITS.fetchConcurrency, files.length),
    }, worker));
    if (controller.signal.aborted) throw controller.signal.reason;
    return results;
  } finally {
    clearTimeout(timer);
  }
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function atomicWrite(path, bytes, { overwrite, mode }) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  if (await pathExists(path)) {
    const info = await lstat(path);
    invariant(info.isFile() && !info.isSymbolicLink(), `Evidence destination is not a regular file: ${path}`);
    invariant(overwrite, `Evidence destination exists; review it before using the explicit overwrite gate: ${path}`);
  }
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, bytes, { flag: "wx", mode });
  await rename(temporary, path);
  await chmod(path, mode);
}

export async function collectLivePagesArtifactVerification(options) {
  const runEndpoint = `repos/${PUBLIC_DEPLOYMENT_REPOSITORY}/actions/runs/${options.runId}`;
  const artifactEndpoint = `${runEndpoint}/artifacts?per_page=100`;
  validatePagesWorkflowRun(
    await ghApiJson(runEndpoint),
    options.expectedCommit,
    options.runId,
  );
  const artifact = selectPagesArtifact(await ghApiJson(artifactEndpoint), options.runId);
  const work = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-pages-verify-"));
  try {
    const archivePath = resolve(work, "github-pages.zip");
    const tarPath = resolve(work, "artifact.tar");
    const extractedPath = resolve(work, "artifact");
    const archiveBytes = await ghApiBytes(`repos/${PUBLIC_DEPLOYMENT_REPOSITORY}/actions/artifacts/${artifact.id}/zip`);
    validateArchiveDigest(archiveBytes, artifact.apiDigest);
    await writeFile(archivePath, archiveBytes, { mode: 0o600 });
    const members = (await commandText("unzip", ["-Z1", archivePath])).trimEnd().split("\n");
    invariant(
      members.length === 1 && members[0] === "artifact.tar",
      "The github-pages archive must contain exactly artifact.tar.",
    );
    const { stdout: tarBytes } = await execFileAsync("unzip", ["-p", archivePath, "artifact.tar"], {
      cwd: repositoryRoot,
      encoding: "buffer",
      maxBuffer: LIVE_PAGES_LIMITS.maximumArchiveBytes,
      timeout: 120_000,
    });
    const artifactTarBytes = Buffer.from(tarBytes);
    invariant(
      artifactTarBytes.length > 0
        && artifactTarBytes.length <= LIVE_PAGES_LIMITS.maximumArchiveBytes,
      "artifact.tar has an invalid size.",
    );
    await writeFile(tarPath, artifactTarBytes, { mode: 0o600 });
    const pathListing = await commandText("tar", ["-tf", tarPath], 32 * 1024 * 1024);
    const verboseListing = await commandText("tar", ["-tvf", tarPath], 32 * 1024 * 1024);
    const listedPaths = validateTarArchiveListings(pathListing, verboseListing);
    const measuredPayloadBytes = await measureTarRegularPayload(tarPath);
    await mkdir(extractedPath, { mode: 0o700 });
    await commandText("tar", ["-xf", tarPath, "-C", extractedPath]);
    const inventory = await regularFiles(extractedPath);
    const files = inventory.files;
    invariant(
      inventory.totalBytes === measuredPayloadBytes,
      "The extracted Pages byte total differs from the pre-extraction logical-byte measurement.",
    );
    invariant(
      canonicalJson(files.map(({ path }) => path)) === canonicalJson(listedPaths),
      "The extracted Pages files do not match the validated tar listing.",
    );
    const deploymentFile = files.find(({ path }) => path === "deployment.json");
    invariant(deploymentFile, "The Pages artifact contains no deployment.json.");
    validateDeploymentFile(
      JSON.parse(await readFile(deploymentFile.absolutePath, "utf8")),
      options.expectedCommit,
      options.runId,
    );
    const comparisons = await compareAllLiveFiles(
      files,
      `${options.expectedCommit.slice(0, 12)}-${options.runId}`,
    );
    const statusCounts = {};
    const mismatches = [];
    for (const comparison of comparisons) {
      const status = String(comparison.status);
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
      if (comparison.mismatch !== null) {
        mismatches.push({ path: comparison.path, status: comparison.status, reason: comparison.mismatch });
      }
    }
    const receipt = createLiveVerificationReceipt({
      artifact,
      artifactTarSha256: sha256(artifactTarBytes),
      expectedCommit: options.expectedCommit,
      files: comparisons,
      mismatches,
      observedAt: new Date().toISOString(),
      runId: options.runId,
      statusCounts,
    });
    invariant(mismatches.length === 0, `Live Pages verification found ${mismatches.length} mismatch(es).`);
    invariant(statusCounts["200"] === files.length, "Not every live Pages artifact returned HTTP 200.");
    return { receipt };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

export async function verifyLivePagesArtifact(options) {
  const { receipt } = await collectLivePagesArtifactVerification(options);
  const bytes = `${JSON.stringify(receipt, null, 2)}\n`;
  await atomicWrite(LOCAL_RECEIPT, bytes, { overwrite: true, mode: 0o600 });
  if (options.admitPublicEvidence) {
    await atomicWrite(REVIEWED_RECEIPT, bytes, {
      overwrite: options.overwriteReviewedEvidence,
      mode: 0o644,
    });
  }
  return {
    receipt,
    localPath: LOCAL_RECEIPT,
    reviewedPath: options.admitPublicEvidence ? REVIEWED_RECEIPT : null,
  };
}

async function main() {
  const result = await verifyLivePagesArtifact(parseVerificationOptions());
  process.stdout.write(`${JSON.stringify({
    status: "verified",
    release: RELEASE,
    commit: result.receipt.commit,
    runId: result.receipt.runId,
    fileCount: result.receipt.fileCount,
    byteCount: result.receipt.byteCount,
    mismatches: result.receipt.mismatches.length,
    localReceipt: relative(repositoryRoot, result.localPath),
    reviewedReceipt: result.reviewedPath ? relative(repositoryRoot, result.reviewedPath) : null,
  }, null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
