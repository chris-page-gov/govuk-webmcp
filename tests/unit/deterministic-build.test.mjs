import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";

import {
  DETERMINISTIC_BUILD_LIMITS,
  assertIgnoredReceipt,
  canonicalJson,
  compareInventoryManifests,
  createDeterministicBuildReceipt,
  createInventoryManifest,
  distInventoryOptions,
  inventoryTree,
  offlineBuildEnvironment,
  parseDeterministicBuildOptions,
  runBoundedCommand,
  safeRelativePath,
  sha256Hex,
  signalProcessTree,
  sourceInventoryOptions,
  validateInventoryManifest,
} from "../../scripts/verify-deterministic-build.mjs";

function file(path, text) {
  const bytes = Buffer.from(text, "utf8");
  return { path, type: "file", size: bytes.byteLength, sha256: sha256Hex(bytes) };
}

function manifest(entries, overrides = {}) {
  return createInventoryManifest(entries, {
    label: "fixture",
    allowSymlinks: false,
    maximumFiles: 16,
    maximumFileBytes: 1_024,
    maximumTotalBytes: 4_096,
    ...overrides,
  });
}

test("safe relative paths reject aliases, traversal and control characters", () => {
  assert.equal(safeRelativePath("data/records-001.json"), "data/records-001.json");
  for (const path of ["", "/absolute", "../escape", "a/../b", "a//b", "a\\b", "a\nb"]) {
    assert.throws(() => safeRelativePath(path), /empty|relative POSIX|control|unsafe/u);
  }
  assert.throws(
    () => safeRelativePath("data/question?.json", "dist path", /^[A-Za-z0-9._/-]+$/u),
    /unsupported character/u,
  );
});

test("inventory manifests sort every file and derive a canonical aggregate digest", () => {
  const first = manifest([file("z.txt", "last"), file("a.txt", "first")]);
  const second = manifest([file("a.txt", "first"), file("z.txt", "last")]);
  assert.deepEqual(first.files.map(({ path }) => path), ["a.txt", "z.txt"]);
  assert.equal(first.aggregateSha256, second.aggregateSha256);
  assert.equal(compareInventoryManifests(first, second).match, true);
  assert.equal(validateInventoryManifest(first, {
    label: "fixture",
    allowSymlinks: false,
    maximumFiles: 16,
    maximumDirectories: 4,
    maximumFileBytes: 1_024,
    maximumTotalBytes: 4_096,
  }), first);
  assert.equal(canonicalJson({ z: 1, a: 2 }), '{"a":2,"z":1}');

  const forged = { ...first, aggregateSha256: "0".repeat(64) };
  assert.throws(() => validateInventoryManifest(forged, {
    label: "fixture",
    allowSymlinks: false,
    maximumFiles: 16,
    maximumDirectories: 4,
    maximumFileBytes: 1_024,
    maximumTotalBytes: 4_096,
  }), /aggregate SHA-256/u);
  assert.throws(
    () => manifest([{ ...file("a.txt", "first"), mtime: 123 }]),
    /fields are not closed/u,
  );
});

test("complete comparison fails closed on path, size, digest and population drift", () => {
  const baseline = manifest([file("a.txt", "one"), file("b.txt", "two")]);
  const changed = manifest([file("a.txt", "ONE"), file("c.txt", "two"), file("d.txt", "three")]);
  const comparison = compareInventoryManifests(baseline, changed);
  assert.equal(comparison.match, false);
  assert.ok(comparison.mismatchCount >= 4);
  assert.ok(comparison.mismatches.includes("fileCount"));
  assert.ok(comparison.mismatches.includes("aggregateSha256"));
  assert.ok(comparison.mismatches.some((value) => value.startsWith("files[")));
});

test("dist inventory hashes nested regular files and rejects links and byte excess", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-deterministic-unit-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "data"));
  await writeFile(join(root, "index.html"), "home");
  await writeFile(join(root, "data", "record.json"), '{"id":1}\n');
  const options = {
    ...distInventoryOptions(),
    maximumFiles: 4,
    maximumDirectories: 3,
    maximumFileBytes: 32,
    maximumTotalBytes: 64,
    maximumDurationMs: 5_000,
  };
  const observed = await inventoryTree(root, options);
  assert.deepEqual(observed.files.map(({ path }) => path), ["data/record.json", "index.html"]);
  assert.equal(observed.directoryCount, 2);
  assert.equal(observed.symlinkCount, 0);

  await symlink("index.html", join(root, "alias.html"));
  await assert.rejects(inventoryTree(root, options), /symbolic link/u);
  await rm(join(root, "alias.html"));
  await writeFile(join(root, "large.bin"), "x".repeat(33));
  await assert.rejects(inventoryTree(root, options), /byte allowance/u);
});

test("receipt creation requires stable source and complete matching dist manifests", () => {
  const source = { ...manifest([file("package.json", "source")]), directoryCount: 1 };
  const dist = { ...manifest([file("index.html", "built")]), directoryCount: 1 };
  const result = createDeterministicBuildReceipt({
    buildScript: "npm run data:build && tsc",
    firstBuild: dist,
    secondBuild: dist,
    sourceBefore: source,
    sourceAfterFirst: source,
    sourceAfterSecond: source,
  });
  assert.equal(result.receipt.status, "pass");
  assert.equal(result.receipt.command.executions, 2);
  assert.equal(result.receipt.comparison.completeManifestMatch, true);
  assert.equal(result.receipt.builds[0].aggregateSha256, result.receipt.builds[1].aggregateSha256);
  assert.match(result.receipt.receiptSha256, /^[a-f0-9]{64}$/u);
  assert.ok(result.bytes.byteLength <= DETERMINISTIC_BUILD_LIMITS.maximumReceiptBytes);

  const changedDist = { ...manifest([file("index.html", "drift")]), directoryCount: 1 };
  assert.throws(
    () => createDeterministicBuildReceipt({
      buildScript: "npm run data:build && tsc",
      firstBuild: dist,
      secondBuild: changedDist,
      sourceBefore: source,
      sourceAfterFirst: source,
      sourceAfterSecond: source,
    }),
    /complete dist manifests differ/u,
  );
  const changedSource = { ...manifest([file("package.json", "changed")]), directoryCount: 1 };
  assert.throws(
    () => createDeterministicBuildReceipt({
      buildScript: "npm run data:build && tsc",
      firstBuild: dist,
      secondBuild: dist,
      sourceBefore: source,
      sourceAfterFirst: changedSource,
      sourceAfterSecond: changedSource,
    }),
    /first build changed its source inputs/u,
  );
});

test("receipt admission requires the ignored private evaluation directory", () => {
  assert.equal(assertIgnoredReceipt("dist/\n.evals/\n"), true);
  assert.throws(() => assertIgnoredReceipt("dist/\n"), /not ignored/u);
});

test("the build environment is offline, fixed-locale and excludes ambient credentials", () => {
  const observed = offlineBuildEnvironment({
    HOME: "/tmp/home",
    PATH: "/bin",
    HTTPS_PROXY: "http://proxy.example",
    NODE_OPTIONS: "--require=/tmp/ambient.cjs",
    OPENAI_API_KEY: "private",
  });
  assert.equal(observed.HOME, "/tmp/home");
  assert.equal(observed.PATH, "/bin");
  assert.equal(observed.npm_config_offline, "true");
  assert.equal(observed.LC_ALL, "C");
  assert.equal(observed.TZ, "Europe/London");
  assert.equal(Object.hasOwn(observed, "HTTPS_PROXY"), false);
  assert.equal(Object.hasOwn(observed, "NODE_OPTIONS"), false);
  assert.equal(Object.hasOwn(observed, "OPENAI_API_KEY"), false);
});

test("source scope excludes installed dependencies and the CLI is closed", () => {
  const options = sourceInventoryOptions();
  assert.equal(options.excludedRootNames.has("node_modules"), true);
  assert.equal(options.excludedRelativePaths.has("app/data"), true);
  assert.deepEqual(parseDeterministicBuildOptions([]), {});
  assert.throws(() => parseDeterministicBuildOptions(["--quick"]), /Unknown argument/u);
});

test("POSIX termination signals the detached process group and safely falls back", () => {
  const signals = [];
  const childSignals = [];
  const child = {
    pid: 31415,
    kill(signal) {
      childSignals.push(signal);
      return true;
    },
  };
  assert.equal(signalProcessTree(child, "SIGTERM", "darwin", (pid, signal) => {
    signals.push([pid, signal]);
  }), true);
  assert.deepEqual(signals, [[-31415, "SIGTERM"]]);
  assert.deepEqual(childSignals, []);

  assert.equal(signalProcessTree(child, "SIGKILL", "linux", () => {
    throw new Error("group absent");
  }), true);
  assert.deepEqual(childSignals, ["SIGKILL"]);
});

test("the bounded runner starts the exact command in a detached POSIX group", async () => {
  let observed;
  const child = new EventEmitter();
  child.pid = 27182;
  child.exitCode = null;
  child.signalCode = null;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => true;
  const promise = runBoundedCommand("npm", ["run", "build"], {
    cwd: "/fixture",
    env: { PATH: "/bin" },
    maximumOutputBytes: 1_024,
    timeoutMs: 1_000,
    spawnImplementation(command, arguments_, options) {
      observed = { arguments_, command, options };
      queueMicrotask(() => {
        child.exitCode = 0;
        child.stdout.end();
        child.stderr.end();
        child.emit("close", 0, null);
      });
      return child;
    },
  });
  const result = await promise;
  assert.deepEqual([observed.command, observed.arguments_], ["npm", ["run", "build"]]);
  assert.equal(observed.options.detached, process.platform !== "win32");
  assert.equal(observed.options.shell, false);
  assert.equal(result.exitCode, 0);
  assert.equal(result.timedOut, false);
});
