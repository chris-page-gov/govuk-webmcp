#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  readlink,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_RECEIPT_PATH = ".evals/deterministic-build-verification.json";
const INVENTORY_SCHEMA = "govuk-webmcp.file-inventory.v1";
const RECEIPT_SCHEMA = "govuk-webmcp.deterministic-build-verification.v1";
const SHA256 = /^[a-f0-9]{64}$/u;
const SOURCE_EXCLUDED_ROOTS = Object.freeze([
  ".evals",
  ".git",
  ".playwright-cli",
  ".playwright-mcp",
  ".tools",
  ".venv",
  "coverage",
  "dist",
  "node_modules",
  "output",
  "playwright-report",
  "test-results",
]);
const SOURCE_EXCLUDED_PATHS = Object.freeze(["app/data"]);

export const DETERMINISTIC_BUILD_LIMITS = Object.freeze({
  maximumSourceFiles: 20_000,
  maximumSourceDirectories: 5_000,
  maximumSourceBytes: 512 * 1024 * 1024,
  maximumSourceFileBytes: 32 * 1024 * 1024,
  maximumDistFiles: 4_096,
  maximumDistDirectories: 512,
  maximumDistBytes: 192 * 1024 * 1024,
  maximumDistFileBytes: 8 * 1024 * 1024,
  maximumInventoryDurationMs: 5 * 60 * 1_000,
  maximumBuildDurationMs: 20 * 60 * 1_000,
  maximumVerificationDurationMs: 50 * 60 * 1_000,
  maximumCommandOutputBytes: 4 * 1024 * 1024,
  maximumReceiptBytes: 32 * 1024,
  terminationGraceMs: 5_000,
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort(compareText).map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeRelativePath(value, label = "File path", allowedPattern) {
  invariant(typeof value === "string" && value.length > 0, `${label} is empty.`);
  invariant(
    !value.startsWith("/") && !value.includes("\\") && !value.includes("\0"),
    `${label} must be a relative POSIX path.`,
  );
  invariant(
    !/[\u0000-\u001f\u007f]/u.test(value),
    `${label} contains a control character.`,
  );
  const parts = value.split("/");
  invariant(
    parts.every((part) => part.length > 0 && part !== "." && part !== ".."),
    `${label} contains an unsafe path segment.`,
  );
  invariant(!allowedPattern || allowedPattern.test(value), `${label} contains an unsupported character.`);
  return value;
}

function boundedInteger(value, maximum, label) {
  invariant(Number.isSafeInteger(value) && value >= 0 && value <= maximum, `${label} is outside its allowance.`);
  return value;
}

function exactKeys(value, expected, label) {
  const observed = Object.keys(value).sort(compareText);
  const required = [...expected].sort(compareText);
  invariant(canonicalJson(observed) === canonicalJson(required), `${label} fields are not closed.`);
}

function validateInventoryEntry(entry, limits, label) {
  invariant(entry && typeof entry === "object" && !Array.isArray(entry), `${label} is invalid.`);
  invariant(entry.type === "file" || entry.type === "symlink", `${label} type is invalid.`);
  exactKeys(
    entry,
    entry.type === "symlink"
      ? ["path", "sha256", "size", "target", "type"]
      : ["path", "sha256", "size", "type"],
    label,
  );
  safeRelativePath(entry.path, `${label} path`, limits.allowedPathPattern);
  invariant(SHA256.test(entry.sha256), `${label} SHA-256 is invalid.`);
  boundedInteger(entry.size, limits.maximumFileBytes, `${label} size`);
  if (entry.type === "symlink") {
    invariant(limits.allowSymlinks, `${label} is a symbolic link.`);
    invariant(
      typeof entry.target === "string"
        && entry.target.length > 0
        && Buffer.byteLength(entry.target, "utf8") === entry.size
        && !/[\u0000-\u001f\u007f]/u.test(entry.target),
      `${label} symbolic-link target is invalid.`,
    );
    invariant(sha256Hex(Buffer.from(entry.target, "utf8")) === entry.sha256, `${label} symbolic-link digest is invalid.`);
  } else {
    invariant(!Object.hasOwn(entry, "target"), `${label} regular file has a symbolic-link target.`);
  }
  return entry;
}

export function createInventoryManifest(entries, options) {
  const label = options?.label ?? "File inventory";
  const limits = {
    allowSymlinks: options?.allowSymlinks === true,
    allowedPathPattern: options?.allowedPathPattern,
    maximumFiles: options?.maximumFiles,
    maximumFileBytes: options?.maximumFileBytes,
    maximumTotalBytes: options?.maximumTotalBytes,
  };
  invariant(Array.isArray(entries), `${label} entries are invalid.`);
  boundedInteger(entries.length, limits.maximumFiles, `${label} file count`);
  const files = entries.map((entry, index) => Object.freeze({
    ...validateInventoryEntry(entry, limits, `${label} entry ${index + 1}`),
  })).sort((left, right) => compareText(left.path, right.path));
  invariant(files.length > 0, `${label} is empty.`);
  for (let index = 1; index < files.length; index += 1) {
    invariant(files[index - 1].path !== files[index].path, `${label} repeats ${files[index].path}.`);
  }
  const totalBytes = files.reduce((total, entry) => total + entry.size, 0);
  boundedInteger(totalBytes, limits.maximumTotalBytes, `${label} total bytes`);
  const identity = Object.freeze({
    schema: INVENTORY_SCHEMA,
    files: Object.freeze(files),
  });
  return Object.freeze({
    ...identity,
    fileCount: files.length,
    symlinkCount: files.filter(({ type }) => type === "symlink").length,
    totalBytes,
    aggregateSha256: sha256Hex(canonicalJson(identity)),
  });
}

export function validateInventoryManifest(manifest, options) {
  const label = options?.label ?? "File inventory";
  invariant(manifest && typeof manifest === "object" && !Array.isArray(manifest), `${label} manifest is invalid.`);
  invariant(manifest.schema === INVENTORY_SCHEMA, `${label} schema is invalid.`);
  invariant(Array.isArray(manifest.files), `${label} file list is invalid.`);
  const rebuilt = createInventoryManifest(manifest.files, options);
  invariant(manifest.fileCount === rebuilt.fileCount, `${label} file count is invalid.`);
  invariant(manifest.symlinkCount === rebuilt.symlinkCount, `${label} symbolic-link count is invalid.`);
  invariant(manifest.totalBytes === rebuilt.totalBytes, `${label} byte count is invalid.`);
  invariant(manifest.aggregateSha256 === rebuilt.aggregateSha256, `${label} aggregate SHA-256 is invalid.`);
  invariant(
    canonicalJson(manifest.files) === canonicalJson(rebuilt.files),
    `${label} file order is not canonical.`,
  );
  if (Object.hasOwn(manifest, "directoryCount")) {
    boundedInteger(manifest.directoryCount, options.maximumDirectories, `${label} directory count`);
  }
  return manifest;
}

export function compareInventoryManifests(left, right, label = "Build inventory") {
  invariant(left && right, `${label} comparison is missing an inventory.`);
  const maximumReportedMismatches = 16;
  const mismatches = [];
  let mismatchCount = 0;
  const record = (message) => {
    mismatchCount += 1;
    if (mismatches.length < maximumReportedMismatches) mismatches.push(message);
  };
  if (left.schema !== right.schema) record("schema");
  if (left.fileCount !== right.fileCount) record("fileCount");
  if (left.totalBytes !== right.totalBytes) record("totalBytes");
  if (left.symlinkCount !== right.symlinkCount) record("symlinkCount");
  if (left.directoryCount !== right.directoryCount) record("directoryCount");
  if (left.aggregateSha256 !== right.aggregateSha256) record("aggregateSha256");
  const maximumLength = Math.max(left.files?.length ?? 0, right.files?.length ?? 0);
  for (let index = 0; index < maximumLength; index += 1) {
    const leftEntry = left.files?.[index];
    const rightEntry = right.files?.[index];
    if (canonicalJson(leftEntry) !== canonicalJson(rightEntry)) {
      record(`files[${index}]`);
    }
  }
  return Object.freeze({
    match: mismatchCount === 0,
    mismatchCount,
    mismatches: Object.freeze(mismatches),
    reportedMismatchCount: mismatches.length,
    reportTruncated: mismatchCount > mismatches.length,
  });
}

async function hashRegularFile(path, maximumFileBytes, label) {
  const noFollow = constants.O_NOFOLLOW ?? 0;
  const handle = await open(path, constants.O_RDONLY | noFollow);
  try {
    const before = await handle.stat({ bigint: true });
    invariant(before.isFile(), `${label} is not a regular file.`);
    invariant(before.size <= BigInt(maximumFileBytes), `${label} exceeds its byte allowance.`);
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    invariant(
      before.dev === after.dev && before.ino === after.ino && before.size === after.size,
      `${label} changed while it was read.`,
    );
    invariant(BigInt(bytes.byteLength) === after.size, `${label} changed while it was read.`);
    return { sha256: sha256Hex(bytes), size: bytes.byteLength };
  } finally {
    await handle.close();
  }
}

function assertWithinDeadline(startedAt, maximumDurationMs, label) {
  invariant(performance.now() - startedAt <= maximumDurationMs, `${label} exceeded its time allowance.`);
}

export async function inventoryTree(rootPath, options) {
  const root = resolve(rootPath);
  const rootStat = await lstat(root);
  invariant(rootStat.isDirectory() && !rootStat.isSymbolicLink(), `${options.label} root must be a real directory.`);
  const startedAt = performance.now();
  const entries = [];
  let directoryCount = 0;
  let observedBytes = 0;
  const excludedRootNames = options.excludedRootNames ?? new Set();
  const excludedRelativePaths = options.excludedRelativePaths ?? new Set();

  async function walk(directory, relativeDirectory = "") {
    assertWithinDeadline(startedAt, options.maximumDurationMs, options.label);
    directoryCount += 1;
    boundedInteger(directoryCount, options.maximumDirectories, `${options.label} directory count`);
    const names = await readdir(directory);
    names.sort(compareText);
    for (const name of names) {
      if (!relativeDirectory && excludedRootNames.has(name)) continue;
      const relativePath = relativeDirectory ? `${relativeDirectory}/${name}` : name;
      if (excludedRelativePaths.has(relativePath)) continue;
      safeRelativePath(relativePath, `${options.label} path`, options.allowedPathPattern);
      const absolutePath = resolve(directory, name);
      invariant(
        relative(root, absolutePath) !== "" && !relative(root, absolutePath).startsWith(`..${sep}`),
        `${options.label} path escaped its root.`,
      );
      const stat = await lstat(absolutePath);
      if (stat.isSymbolicLink()) {
        invariant(options.allowSymlinks, `${options.label} contains symbolic link ${relativePath}.`);
        const target = await readlink(absolutePath, "utf8");
        const targetBytes = Buffer.from(target, "utf8");
        observedBytes += targetBytes.byteLength;
        boundedInteger(observedBytes, options.maximumTotalBytes, `${options.label} total bytes`);
        entries.push({
          path: relativePath,
          type: "symlink",
          target,
          size: targetBytes.byteLength,
          sha256: sha256Hex(targetBytes),
        });
      } else if (stat.isDirectory()) {
        await walk(absolutePath, relativePath);
      } else if (stat.isFile()) {
        const identity = await hashRegularFile(absolutePath, options.maximumFileBytes, `${options.label} ${relativePath}`);
        observedBytes += identity.size;
        boundedInteger(observedBytes, options.maximumTotalBytes, `${options.label} total bytes`);
        entries.push({ path: relativePath, type: "file", ...identity });
      } else {
        throw new Error(`${options.label} contains unsupported entry ${relativePath}.`);
      }
      boundedInteger(entries.length, options.maximumFiles, `${options.label} file count`);
      assertWithinDeadline(startedAt, options.maximumDurationMs, options.label);
    }
  }

  await walk(root);
  const manifest = createInventoryManifest(entries, options);
  return Object.freeze({ ...manifest, directoryCount });
}

export function sourceInventoryOptions(limits = DETERMINISTIC_BUILD_LIMITS) {
  return Object.freeze({
    label: "Build-source inventory",
    allowSymlinks: true,
    excludedRootNames: new Set(SOURCE_EXCLUDED_ROOTS),
    excludedRelativePaths: new Set(SOURCE_EXCLUDED_PATHS),
    maximumFiles: limits.maximumSourceFiles,
    maximumDirectories: limits.maximumSourceDirectories,
    maximumFileBytes: limits.maximumSourceFileBytes,
    maximumTotalBytes: limits.maximumSourceBytes,
    maximumDurationMs: limits.maximumInventoryDurationMs,
  });
}

export function distInventoryOptions(limits = DETERMINISTIC_BUILD_LIMITS) {
  return Object.freeze({
    label: "dist inventory",
    allowSymlinks: false,
    allowedPathPattern: /^[A-Za-z0-9._/-]+$/u,
    excludedRootNames: new Set(),
    maximumFiles: limits.maximumDistFiles,
    maximumDirectories: limits.maximumDistDirectories,
    maximumFileBytes: limits.maximumDistFileBytes,
    maximumTotalBytes: limits.maximumDistBytes,
    maximumDurationMs: limits.maximumInventoryDurationMs,
  });
}

export function offlineBuildEnvironment(environment = process.env) {
  const output = {};
  for (const key of [
    "ComSpec", "HOME", "PATH", "PATHEXT", "SHELL", "SystemRoot", "TEMP", "TMP", "TMPDIR",
  ]) {
    if (typeof environment[key] === "string") output[key] = environment[key];
  }
  return {
    ...output,
    CI: "1",
    LANG: "C",
    LC_ALL: "C",
    NO_PROXY: "*",
    no_proxy: "*",
    TZ: "Europe/London",
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_offline: "true",
    npm_config_update_notifier: "false",
  };
}

export function parseDeterministicBuildOptions(argv = process.argv.slice(2)) {
  invariant(Array.isArray(argv), "Deterministic-build arguments are invalid.");
  invariant(argv.length === 0, `Unknown argument: ${String(argv[0])}`);
  return Object.freeze({});
}

export function signalProcessTree(
  child,
  signal,
  platform = process.platform,
  killImplementation = process.kill,
) {
  if (
    platform !== "win32"
    && Number.isSafeInteger(child?.pid)
    && child.pid > 0
  ) {
    try {
      killImplementation(-child.pid, signal);
      return true;
    } catch {
      // The process may have closed between the state check and group signal.
    }
  }
  try {
    return child?.kill(signal) === true;
  } catch {
    return false;
  }
}

export function runBoundedCommand(command, arguments_, options = {}) {
  const spawnImplementation = options.spawnImplementation ?? spawn;
  const timeoutMs = options.timeoutMs ?? DETERMINISTIC_BUILD_LIMITS.maximumBuildDurationMs;
  const maximumOutputBytes = options.maximumOutputBytes
    ?? DETERMINISTIC_BUILD_LIMITS.maximumCommandOutputBytes;
  const terminationGraceMs = options.terminationGraceMs
    ?? DETERMINISTIC_BUILD_LIMITS.terminationGraceMs;
  invariant(typeof command === "string" && command.length > 0, "Build command is empty.");
  invariant(Array.isArray(arguments_) && arguments_.every((value) => typeof value === "string"), "Build arguments are invalid.");
  invariant(Number.isSafeInteger(timeoutMs) && timeoutMs > 0, "Build timeout is invalid.");
  invariant(Number.isSafeInteger(maximumOutputBytes) && maximumOutputBytes > 0, "Build output allowance is invalid.");

  return new Promise((resolvePromise, rejectPromise) => {
    let child;
    try {
      child = spawnImplementation(command, arguments_, {
        cwd: options.cwd,
        detached: process.platform !== "win32",
        env: options.env,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      rejectPromise(error);
      return;
    }
    let settled = false;
    let timedOut = false;
    let outputExceeded = false;
    let outputBytes = 0;
    let killTimer;
    let abandonTimer;
    let timeoutTimer;
    const chunks = [];

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      clearTimeout(killTimer);
      clearTimeout(abandonTimer);
      if (error) rejectPromise(error);
      else resolvePromise(result);
    };
    const terminate = () => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      signalProcessTree(child, "SIGTERM");
      killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) signalProcessTree(child, "SIGKILL");
      }, terminationGraceMs);
      killTimer.unref?.();
      abandonTimer = setTimeout(() => {
        finish(new Error("The build process did not stop within its termination allowance."));
      }, terminationGraceMs * 2);
      abandonTimer.unref?.();
    };
    const onOutput = (chunk) => {
      outputBytes += chunk.byteLength;
      if (outputBytes <= maximumOutputBytes) chunks.push(Buffer.from(chunk));
      if (outputBytes > maximumOutputBytes && !outputExceeded) {
        outputExceeded = true;
        terminate();
      }
    };
    child.stdout?.on("data", onOutput);
    child.stderr?.on("data", onOutput);
    child.once("error", (error) => finish(error));
    child.once("close", (exitCode, signal) => finish(null, {
      exitCode: exitCode ?? 1,
      output: Buffer.concat(chunks).toString("utf8"),
      outputBytes,
      outputExceeded,
      signal,
      timedOut,
    }));
    timeoutTimer = setTimeout(() => {
      timedOut = true;
      terminate();
    }, timeoutMs);
    timeoutTimer.unref?.();
  });
}

function manifestSummary(manifest) {
  return Object.freeze({
    aggregateSha256: manifest.aggregateSha256,
    directoryCount: manifest.directoryCount,
    fileCount: manifest.fileCount,
    symlinkCount: manifest.symlinkCount,
    totalBytes: manifest.totalBytes,
  });
}

export function createDeterministicBuildReceipt({
  buildScript,
  firstBuild,
  secondBuild,
  sourceBefore,
  sourceAfterFirst,
  sourceAfterSecond,
  limits = DETERMINISTIC_BUILD_LIMITS,
}) {
  invariant(typeof buildScript === "string" && buildScript.length > 0 && buildScript.length <= 2_048, "The normal build script is invalid.");
  const sourceOptions = sourceInventoryOptions(limits);
  const distOptions = distInventoryOptions(limits);
  validateInventoryManifest(sourceBefore, sourceOptions);
  validateInventoryManifest(sourceAfterFirst, sourceOptions);
  validateInventoryManifest(sourceAfterSecond, sourceOptions);
  validateInventoryManifest(firstBuild, distOptions);
  validateInventoryManifest(secondBuild, distOptions);
  const sourceFirstComparison = compareInventoryManifests(sourceBefore, sourceAfterFirst, "Source after first build");
  const sourceSecondComparison = compareInventoryManifests(sourceBefore, sourceAfterSecond, "Source after second build");
  const buildComparison = compareInventoryManifests(firstBuild, secondBuild, "dist builds");
  invariant(sourceFirstComparison.match, `The first build changed its source inputs: ${sourceFirstComparison.mismatches.join(", ")}.`);
  invariant(sourceSecondComparison.match, `The second build changed its source inputs: ${sourceSecondComparison.mismatches.join(", ")}.`);
  invariant(buildComparison.match, `The two complete dist manifests differ: ${buildComparison.mismatches.join(", ")}.`);

  const receiptBase = {
    schema: RECEIPT_SCHEMA,
    status: "pass",
    command: {
      executable: "npm",
      arguments: ["run", "build"],
      executions: 2,
      networkMode: "npm-offline-with-proxy-environment-removed",
      normalBuildScript: buildScript,
    },
    source: manifestSummary(sourceBefore),
    builds: [
      { ordinal: 1, ...manifestSummary(firstBuild) },
      { ordinal: 2, ...manifestSummary(secondBuild) },
    ],
    comparison: {
      completeManifestMatch: true,
      aggregateDigestMatch: firstBuild.aggregateSha256 === secondBuild.aggregateSha256,
      sourceIdentityStable: true,
    },
    limits: { ...limits },
    receiptPath: DEFAULT_RECEIPT_PATH,
  };
  const receipt = Object.freeze({
    ...receiptBase,
    receiptSha256: sha256Hex(canonicalJson(receiptBase)),
  });
  const bytes = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  invariant(bytes.byteLength <= limits.maximumReceiptBytes, "The deterministic-build receipt exceeds its byte allowance.");
  return { bytes, receipt };
}

export function assertIgnoredReceipt(gitignoreText) {
  invariant(typeof gitignoreText === "string", ".gitignore is unreadable.");
  const lines = gitignoreText.split(/\r?\n/u).map((line) => line.trim());
  invariant(lines.includes(".evals/"), "The deterministic-build receipt directory is not ignored by .gitignore.");
  return true;
}

async function writeIgnoredReceipt(repositoryRoot, bytes) {
  const evalsRoot = resolve(repositoryRoot, ".evals");
  const receiptPath = resolve(repositoryRoot, DEFAULT_RECEIPT_PATH);
  invariant(relative(repositoryRoot, receiptPath) === DEFAULT_RECEIPT_PATH, "The deterministic-build receipt path escaped the repository.");
  try {
    const stat = await lstat(evalsRoot);
    invariant(stat.isDirectory() && !stat.isSymbolicLink(), ".evals must be a real directory when it exists.");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await mkdir(evalsRoot, { mode: 0o700 });
  }
  try {
    const stat = await lstat(receiptPath);
    invariant(stat.isFile() && !stat.isSymbolicLink(), "The deterministic-build receipt path must be a regular file.");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const temporaryPath = resolve(evalsRoot, `.deterministic-build-verification-${process.pid}.tmp`);
  invariant(dirname(temporaryPath) === evalsRoot, "The temporary receipt path escaped .evals.");
  try {
    await writeFile(temporaryPath, bytes, { flag: "wx", mode: 0o600 });
    await chmod(temporaryPath, 0o600);
    await rename(temporaryPath, receiptPath);
    await chmod(receiptPath, 0o600);
  } finally {
    await rm(temporaryPath, { force: true });
  }
  return receiptPath;
}

function remainingBuildTime(startedAt, limits) {
  const remaining = limits.maximumVerificationDurationMs - (performance.now() - startedAt);
  invariant(remaining > 0, "Deterministic build verification exceeded its total time allowance.");
  return Math.min(remaining, limits.maximumBuildDurationMs);
}

async function executeNormalBuild(repositoryRoot, environment, timeoutMs, limits) {
  const result = await runBoundedCommand("npm", ["run", "build"], {
    cwd: repositoryRoot,
    env: environment,
    maximumOutputBytes: limits.maximumCommandOutputBytes,
    terminationGraceMs: limits.terminationGraceMs,
    timeoutMs,
  });
  invariant(!result.timedOut, "npm run build exceeded its time allowance.");
  invariant(!result.outputExceeded, "npm run build exceeded its output allowance.");
  invariant(result.exitCode === 0, `npm run build failed with exit code ${result.exitCode}.`);
}

export async function verifyDeterministicBuild(options = {}) {
  const repositoryRoot = resolve(options.repositoryRoot ?? DEFAULT_REPOSITORY_ROOT);
  const limits = Object.freeze({ ...DETERMINISTIC_BUILD_LIMITS, ...(options.limits ?? {}) });
  const startedAt = performance.now();
  invariant(repositoryRoot !== resolve(sep), "The repository root cannot be the filesystem root.");
  const packagePath = resolve(repositoryRoot, "package.json");
  const packageValue = JSON.parse(await readFile(packagePath, "utf8"));
  const buildScript = packageValue?.scripts?.build;
  invariant(typeof buildScript === "string" && buildScript.length > 0, "package.json does not define the normal build script.");
  assertIgnoredReceipt(await readFile(resolve(repositoryRoot, ".gitignore"), "utf8"));
  const sourceOptions = sourceInventoryOptions(limits);
  const distOptions = distInventoryOptions(limits);
  const environment = offlineBuildEnvironment(options.environment ?? process.env);

  const sourceBefore = await inventoryTree(repositoryRoot, sourceOptions);
  await executeNormalBuild(repositoryRoot, environment, remainingBuildTime(startedAt, limits), limits);
  const firstBuild = await inventoryTree(resolve(repositoryRoot, "dist"), distOptions);
  const sourceAfterFirst = await inventoryTree(repositoryRoot, sourceOptions);
  invariant(
    compareInventoryManifests(sourceBefore, sourceAfterFirst, "Source after first build").match,
    "The first build changed its source inputs; a second build was not attempted.",
  );
  await executeNormalBuild(repositoryRoot, environment, remainingBuildTime(startedAt, limits), limits);
  const secondBuild = await inventoryTree(resolve(repositoryRoot, "dist"), distOptions);
  const sourceAfterSecond = await inventoryTree(repositoryRoot, sourceOptions);
  invariant(
    performance.now() - startedAt <= limits.maximumVerificationDurationMs,
    "Deterministic build verification exceeded its total time allowance.",
  );
  const { bytes, receipt } = createDeterministicBuildReceipt({
    buildScript,
    firstBuild,
    secondBuild,
    sourceBefore,
    sourceAfterFirst,
    sourceAfterSecond,
    limits,
  });
  await writeIgnoredReceipt(repositoryRoot, bytes);
  process.stdout.write(bytes);
  return receipt;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  Promise.resolve().then(() => parseDeterministicBuildOptions()).then(() => verifyDeterministicBuild()).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
