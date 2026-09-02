import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { link, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import test from "node:test";

import {
  LIVE_PAGES_LIMITS,
  authenticateLivePagesReceipt,
  buildVerificationManifest,
  compareAllLiveFiles,
  createLiveVerificationReceipt,
  disposeAuthenticatedLivePagesReceipt,
  isAuthenticatedLivePagesReceipt,
  measureTarRegularPayload,
  normaliseTarEntries,
  parseVerificationOptions,
  persistLivePagesVerificationReceipt,
  selectPagesArtifact,
  validateArchiveDigest,
  validateLivePagesReceiptShape,
  validateLocalPagesBuildBinding,
  validateTarArchiveListings,
  validateDeploymentFile,
  validatePagesWorkflowRun,
  validateTarEntryTypes,
} from "../../scripts/verify-live-pages-artifact.mjs";
import { RELEASE_EVIDENCE_PATHS } from "../../scripts/lib/release-evidence-paths.mjs";

const commit = "a".repeat(40);
const runId = "33555555555";
const environment = {
  WEBMCP_EXPECTED_COMMIT: commit,
  GOVUK_WEBMCP_PAGES_RUN_ID: runId,
};

function liveReceipt(observedAt = "2026-09-02T05:00:00Z") {
  return createLiveVerificationReceipt({
    artifact: { id: 123, apiDigest: `sha256:${"c".repeat(64)}` },
    artifactTarSha256: "d".repeat(64),
    expectedCommit: commit,
    files: [
      { path: "index.html", sha256: "e".repeat(64), byteCount: 5 },
      { path: "app/main.js", sha256: "f".repeat(64), byteCount: 7 },
    ],
    mismatches: [],
    observedAt,
    runId,
    statusCounts: { "200": 2 },
  });
}

test("live verifier requires an exact commit, run and explicit evidence admission", () => {
  assert.deepEqual(parseVerificationOptions([], environment), {
    admitPublicEvidence: false,
    expectedCommit: commit,
    overwritePrivateReleaseReceipt: false,
    overwriteReviewedEvidence: false,
    runId,
    stagePrivateReleaseReceipt: false,
  });
  assert.equal(
    parseVerificationOptions(["--admit-public-evidence"], environment).admitPublicEvidence,
    true,
  );
  assert.throws(
    () => parseVerificationOptions(["--overwrite-reviewed-evidence"], environment),
    /requires --admit-public-evidence/u,
  );
  assert.equal(
    parseVerificationOptions(["--stage-private-release-receipt"], environment)
      .stagePrivateReleaseReceipt,
    true,
  );
  assert.throws(
    () => parseVerificationOptions(["--overwrite-private-release-receipt"], environment),
    /requires --stage-private-release-receipt/u,
  );
  assert.throws(() => parseVerificationOptions(["--force"], environment), /Unknown argument/u);
  assert.throws(
    () => parseVerificationOptions([], { ...environment, WEBMCP_EXPECTED_COMMIT: "A".repeat(40) }),
    /lowercase 40-character/u,
  );
  assert.throws(
    () => parseVerificationOptions([], { ...environment, GOVUK_WEBMCP_PAGES_RUN_ID: "0" }),
    /workflow run ID/u,
  );
});

test("release receipt paths have one independent exact v0.4 contract", () => {
  assert.deepEqual({
    local: RELEASE_EVIDENCE_PATHS.localLivePagesVerification,
    private: RELEASE_EVIDENCE_PATHS.privateLivePagesVerification,
    reviewed: RELEASE_EVIDENCE_PATHS.reviewedLivePagesVerification,
  }, {
    local: ".evals/live-artifact-verification-v0.4.0-rc.1.json",
    private: ".evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json",
    reviewed: "docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json",
  });
});

async function createReceiptRepository(context) {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-live-receipt-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "docs/competition/evidence"), { recursive: true });
  return root;
}

function receiptPersistenceOptions(overrides = {}) {
  return {
    admitPublicEvidence: false,
    overwritePrivateReleaseReceipt: false,
    overwriteReviewedEvidence: false,
    stagePrivateReleaseReceipt: false,
    ...overrides,
  };
}

test("live verification stages identical private and public receipts with exact modes", async (context) => {
  const root = await createReceiptRepository(context);
  const receipt = liveReceipt();
  const result = await persistLivePagesVerificationReceipt(
    receipt,
    receiptPersistenceOptions({
      admitPublicEvidence: true,
      stagePrivateReleaseReceipt: true,
    }),
    { repositoryPath: root },
  );
  const expected = `${JSON.stringify(receipt, null, 2)}\n`;
  const [localBytes, privateBytes, reviewedBytes] = await Promise.all([
    readFile(result.localPath, "utf8"),
    readFile(result.privatePath, "utf8"),
    readFile(result.reviewedPath, "utf8"),
  ]);
  assert.equal(localBytes, expected);
  assert.equal(privateBytes, expected);
  assert.equal(reviewedBytes, expected);
  const [localState, privateState, reviewedState] = await Promise.all([
    lstat(result.localPath),
    lstat(result.privatePath),
    lstat(result.reviewedPath),
  ]);
  assert.equal(localState.mode & 0o777, 0o600);
  assert.equal(privateState.mode & 0o777, 0o600);
  assert.equal(reviewedState.mode & 0o777, 0o644);
  for (const directory of [
    ".evals",
    ".evals/personal-agent-media",
    RELEASE_EVIDENCE_PATHS.privateReleaseRoot,
  ]) {
    assert.equal((await lstat(join(root, directory))).mode & 0o777, 0o700);
  }
});

test("private release receipt replacement is explicit and invalid attempts change no receipt", async (context) => {
  const root = await createReceiptRepository(context);
  const firstReceipt = liveReceipt("2026-09-02T05:00:00Z");
  const selected = receiptPersistenceOptions({
    admitPublicEvidence: true,
    stagePrivateReleaseReceipt: true,
  });
  const first = await persistLivePagesVerificationReceipt(firstReceipt, selected, { repositoryPath: root });
  const firstBytes = `${JSON.stringify(firstReceipt, null, 2)}\n`;
  const secondReceipt = liveReceipt("2026-09-02T05:01:00Z");
  await assert.rejects(
    persistLivePagesVerificationReceipt(secondReceipt, selected, { repositoryPath: root }),
    /already exists and replacement was not authorised/u,
  );
  assert.equal(await readFile(first.localPath, "utf8"), firstBytes);
  assert.equal(await readFile(first.privatePath, "utf8"), firstBytes);
  assert.equal(await readFile(first.reviewedPath, "utf8"), firstBytes);

  const replacement = await persistLivePagesVerificationReceipt(
    secondReceipt,
    receiptPersistenceOptions({
      overwritePrivateReleaseReceipt: true,
      stagePrivateReleaseReceipt: true,
    }),
    { repositoryPath: root },
  );
  const secondBytes = `${JSON.stringify(secondReceipt, null, 2)}\n`;
  assert.equal(await readFile(replacement.localPath, "utf8"), secondBytes);
  assert.equal(await readFile(replacement.privatePath, "utf8"), secondBytes);
  assert.equal(await readFile(first.reviewedPath, "utf8"), firstBytes);
});

test("three-receipt admission rolls back every target after a later promotion failure", async (context) => {
  const root = await createReceiptRepository(context);
  const initialReceipt = liveReceipt("2026-09-02T05:00:00Z");
  const initial = await persistLivePagesVerificationReceipt(
    initialReceipt,
    receiptPersistenceOptions({
      admitPublicEvidence: true,
      stagePrivateReleaseReceipt: true,
    }),
    { repositoryPath: root },
  );
  const initialBytes = `${JSON.stringify(initialReceipt, null, 2)}\n`;
  const privateTarget = initial.privatePath;
  await assert.rejects(
    persistLivePagesVerificationReceipt(
      liveReceipt("2026-09-02T05:02:00Z"),
      receiptPersistenceOptions({
        admitPublicEvidence: true,
        overwritePrivateReleaseReceipt: true,
        overwriteReviewedEvidence: true,
        stagePrivateReleaseReceipt: true,
      }),
      {
        repositoryPath: root,
        admissionFileSystem: {
          async linkFile(source, destination) {
            if (source.includes(".admit-stage-") && destination === privateTarget) {
              throw new Error("Injected private receipt promotion failure.");
            }
            return link(source, destination);
          },
        },
      },
    ),
    /Injected private receipt promotion failure/u,
  );
  for (const path of [initial.localPath, initial.privatePath, initial.reviewedPath]) {
    assert.equal(await readFile(path, "utf8"), initialBytes);
  }
  const names = await readdir(root, { recursive: true });
  assert.equal(names.some((name) => name.includes(".admit-stage-") || name.includes(".admit-backup-")), false);
});

test("receipt persistence rejects invalid options and symbolic repository roots before mutation", async (context) => {
  const parent = await mkdtemp(join(tmpdir(), "govuk-webmcp-live-root-"));
  context.after(() => rm(parent, { recursive: true, force: true }));
  const root = join(parent, "repository");
  await mkdir(join(root, "docs/competition/evidence"), { recursive: true });
  await assert.rejects(
    persistLivePagesVerificationReceipt(
      liveReceipt(),
      { stagePrivateReleaseReceipt: "yes" },
      { repositoryPath: root },
    ),
    /stagePrivateReleaseReceipt must be a boolean/u,
  );
  await assert.rejects(lstat(join(root, ".evals")), (error) => error?.code === "ENOENT");

  const linkedRoot = join(parent, "repository-link");
  await symlink(root, linkedRoot);
  await assert.rejects(
    persistLivePagesVerificationReceipt(
      liveReceipt(),
      receiptPersistenceOptions({ stagePrivateReleaseReceipt: true }),
      { repositoryPath: linkedRoot },
    ),
    /real non-symbolic directory/u,
  );
  await assert.rejects(lstat(join(root, ".evals")), (error) => error?.code === "ENOENT");
});

test("live verifier accepts only a successful manual Pages run on exact protected main", () => {
  const value = {
    id: Number(runId),
    path: ".github/workflows/pages.yml",
    event: "workflow_dispatch",
    head_branch: "main",
    head_sha: commit,
    status: "completed",
    conclusion: "success",
  };
  assert.equal(validatePagesWorkflowRun(value, commit, runId).headSha, commit);
  assert.throws(
    () => validatePagesWorkflowRun({ ...value, event: "push" }, commit, runId),
    /not manually dispatched/u,
  );
  assert.throws(
    () => validatePagesWorkflowRun({ ...value, head_sha: "b".repeat(40) }, commit, runId),
    /expected protected-main commit/u,
  );
  assert.throws(
    () => validatePagesWorkflowRun({ ...value, conclusion: "failure" }, commit, runId),
    /completed successfully/u,
  );
});

test("live verifier selects one unexpired github-pages artifact and verifies its archive digest", () => {
  const archive = Buffer.from("bounded archive fixture", "utf8");
  const digest = `sha256:${createHash("sha256").update(archive).digest("hex")}`;
  const url = "https://api.github.com/repos/chris-page-gov/govuk-webmcp/actions/artifacts/123";
  const payload = {
    artifacts: [{
      id: 123,
      name: "github-pages",
      expired: false,
      digest,
      url,
      archive_download_url: `${url}/zip`,
      workflow_run: { id: Number(runId) },
    }],
  };
  const selected = selectPagesArtifact(payload, runId);
  assert.deepEqual(selected, { id: 123, apiDigest: digest, archiveDownloadUrl: `${url}/zip` });
  assert.equal(validateArchiveDigest(archive, digest), digest);
  assert.throws(
    () => selectPagesArtifact({ artifacts: [...payload.artifacts, ...payload.artifacts] }, runId),
    /exactly one/u,
  );
  assert.throws(
    () => selectPagesArtifact({ artifacts: [{ ...payload.artifacts[0], expired: true }] }, runId),
    /expired/u,
  );
  assert.throws(() => validateArchiveDigest(Buffer.from("drift"), digest), /does not match/u);
});

test("tar listing and manifests reject traversal, aliases and duplicate paths", () => {
  assert.deepEqual(
    normaliseTarEntries("./\n./index.html\n./app/\n./app/main.js\n"),
    ["app/main.js", "index.html"],
  );
  assert.throws(() => normaliseTarEntries("../secret\n"), /unsafe path segment/u);
  assert.throws(() => normaliseTarEntries("../escape/\nindex.html\n"), /unsafe path segment/u);
  assert.throws(() => normaliseTarEntries("/absolute/\nindex.html\n"), /relative POSIX path/u);
  assert.throws(() => normaliseTarEntries("index.html\n./index.html\n"), /repeats/u);
  assert.throws(() => normaliseTarEntries("./app/\napp/\nindex.html\n"), /canonical path/u);
  assert.throws(() => normaliseTarEntries("./app/\napp\n"), /canonical path/u);
  assert.throws(() => normaliseTarEntries("./\n.\nindex.html\n"), /canonical path/u);
  assert.throws(() => normaliseTarEntries("folder name/index.html\n"), /unsupported character/u);
  assert.throws(
    () => normaliseTarEntries(`${Array.from({
      length: LIVE_PAGES_LIMITS.maximumRegularFiles
        + LIVE_PAGES_LIMITS.maximumDirectoryEntries
        + 2,
    }, (_, index) => `dir-${index}/`).join("\n")}\n`),
    /invalid total entry count/u,
  );
  assert.deepEqual(
    validateTarArchiveListings(
      "./\n./app/\n./app/main.js\n./index.html\n",
      "drwxr-xr-x  0 owner group 0 Sep  1 12:00 ./\n"
        + "drwxr-xr-x  0 owner group 0 Sep  1 12:00 ./app/\n"
        + "-rw-r--r--  0 owner group 5 Sep  1 12:00 ./app/main.js\n"
        + "-rw-r--r--  0 owner group 5 Sep  1 12:00 ./index.html\n",
    ),
    ["app/main.js", "index.html"],
  );
  assert.deepEqual(
    validateTarArchiveListings(
      "index.html\n",
      "-rw-r--r-- owner/group 5 2026-09-01 12:00 index.html\n",
    ),
    ["index.html"],
  );
  assert.throws(
    () => validateTarArchiveListings(
      "./\n./index.html\n",
      "drwxr-xr-x  0 owner group 0 Sep  1 12:00 ./\n",
    ),
    /different entry counts/u,
  );
  assert.throws(
    () => validateTarArchiveListings(
      "./app/\n",
      "-rw-r--r--  0 owner group 5 Sep  1 12:00 ./app/\n",
    ),
    /directory path alias/u,
  );
  validateTarEntryTypes(
    "drwxr-xr-x  0 owner group 0 Sep  1 12:00 ./app/\n"
      + "-rw-r--r--  0 owner group 5 Sep  1 12:00 ./app/main.js\n",
  );
  assert.throws(
    () => validateTarEntryTypes("lrwxr-xr-x  0 owner group 0 Sep  1 12:00 ./escape -> ../outside\n"),
    /link or another unsupported entry type/u,
  );
  assert.throws(
    () => validateTarEntryTypes("hrw-r--r--  0 owner group 0 Sep  1 12:00 ./alias link to ./index.html\n"),
    /link or another unsupported entry type/u,
  );

  const regularPaths = Array.from(
    { length: LIVE_PAGES_LIMITS.maximumRegularFiles },
    (_, index) => `file-${index}.txt`,
  );
  const regularListing = `${regularPaths.join("\n")}\n`;
  const regularVerbose = `${regularPaths.map((path) =>
    `-rw-r--r-- owner/group 1 2026-09-01 12:00 ${path}`).join("\n")}\n`;
  assert.equal(
    validateTarArchiveListings(regularListing, regularVerbose).length,
    LIVE_PAGES_LIMITS.maximumRegularFiles,
  );
  const overRegularPaths = [...regularPaths, "one-too-many.txt"];
  assert.throws(
    () => validateTarArchiveListings(
      `${overRegularPaths.join("\n")}\n`,
      `${overRegularPaths.map((path) =>
        `-rw-r--r-- owner/group 1 2026-09-01 12:00 ${path}`).join("\n")}\n`,
    ),
    /regular-file work budget/u,
  );

  const directoryPaths = Array.from(
    { length: LIVE_PAGES_LIMITS.maximumDirectoryEntries },
    (_, index) => `dir-${index}/`,
  );
  assert.equal(
    validateTarArchiveListings(
      `${directoryPaths.join("\n")}\nindex.html\n`,
      `${directoryPaths.map((path) =>
        `drwxr-xr-x owner/group 0 2026-09-01 12:00 ${path}`).join("\n")}\n`
        + "-rw-r--r-- owner/group 1 2026-09-01 12:00 index.html\n",
    ).length,
    1,
  );
  const overDirectoryPaths = [...directoryPaths, "one-too-many/"];
  assert.throws(
    () => validateTarArchiveListings(
      `${overDirectoryPaths.join("\n")}\nindex.html\n`,
      `${overDirectoryPaths.map((path) =>
        `drwxr-xr-x owner/group 0 2026-09-01 12:00 ${path}`).join("\n")}\n`
        + "-rw-r--r-- owner/group 1 2026-09-01 12:00 index.html\n",
    ),
    /directory-entry work budget/u,
  );

  const implicitDeepPaths = ["a", "b"].map((prefix) =>
    `${Array.from({ length: 300 }, () => prefix).join("/")}/index.html`);
  assert.throws(
    () => validateTarArchiveListings(
      `${implicitDeepPaths.join("\n")}\n`,
      `${implicitDeepPaths.map((path) =>
        `-rw-r--r-- owner/group 1 2026-09-01 12:00 ${path}`).join("\n")}\n`,
    ),
    /directory-entry work budget/u,
  );

  const explicitDeepPaths = ["a", "b"].map((prefix) =>
    `${Array.from({ length: 300 }, () => prefix).join("/")}/`);
  assert.throws(
    () => validateTarArchiveListings(
      `${explicitDeepPaths.join("\n")}\nindex.html\n`,
      `${explicitDeepPaths.map((path) =>
        `drwxr-xr-x owner/group 0 2026-09-01 12:00 ${path}`).join("\n")}\n`
        + "-rw-r--r-- owner/group 1 2026-09-01 12:00 index.html\n",
    ),
    /directory-entry work budget/u,
  );

  assert.throws(
    () => validateTarArchiveListings(
      "app\napp/index.html\n",
      "-rw-r--r-- owner/group 1 2026-09-01 12:00 app\n"
        + "-rw-r--r-- owner/group 1 2026-09-01 12:00 app/index.html\n",
    ),
    /both a regular file and a directory/u,
  );
  assert.throws(
    () => validateTarArchiveListings(
      "app/index.html\napp\n",
      "-rw-r--r-- owner/group 1 2026-09-01 12:00 app/index.html\n"
        + "-rw-r--r-- owner/group 1 2026-09-01 12:00 app\n",
    ),
    /both a regular file and a directory/u,
  );

  const manifest = buildVerificationManifest([
    { path: "index.html", sha256: "b".repeat(64) },
    { path: "app/main.js", sha256: "a".repeat(64) },
  ]);
  assert.equal(
    manifest,
    `${"a".repeat(64)}  app/main.js\n${"b".repeat(64)}  index.html\n`,
  );
  assert.throws(
    () => buildVerificationManifest([
      { path: "index.html", sha256: "b".repeat(64) },
      { path: "index.html", sha256: "b".repeat(64) },
    ]),
    /duplicated/u,
  );
});

test("deployment metadata and receipt retain exact release identity and complete-comparison boundary", async (t) => {
  assert.equal(validateDeploymentFile({
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit,
    runId,
  }, commit, runId).commit, commit);
  assert.throws(() => validateDeploymentFile({
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit,
    runId: "1",
  }, commit, runId), /wrong Pages run ID/u);

  const receipt = createLiveVerificationReceipt({
    artifact: { id: 123, apiDigest: `sha256:${"c".repeat(64)}` },
    artifactTarSha256: "d".repeat(64),
    expectedCommit: commit,
    files: [
      { path: "index.html", sha256: "e".repeat(64), byteCount: 5 },
      { path: "app/main.js", sha256: "f".repeat(64), byteCount: 7 },
    ],
    mismatches: [],
    observedAt: "2026-09-01T20:00:00Z",
    runId,
    statusCounts: { "200": 2 },
  });
  assert.equal(receipt.schema, "govuk-webmcp.live-pages-verification.v2");
  assert.equal(receipt.fileCount, 2);
  assert.equal(receipt.byteCount, 12);
  assert.equal(receipt.commit, commit);
  assert.equal(receipt.runId, runId);
  assert.equal(receipt.boundaries.comparedEveryRegularArtifactFile, true);
  assert.deepEqual(receipt.boundaries.budgets, LIVE_PAGES_LIMITS);
  assert.deepEqual(receipt.mismatches, []);
  assert.equal(validateLivePagesReceiptShape(receipt), receipt);

  const observed = await authenticateLivePagesReceipt(receipt, async () => ({
    receipt: { ...structuredClone(receipt), observedAt: "2026-09-01T20:01:00Z" },
  }));
  assert.equal(isAuthenticatedLivePagesReceipt(observed), true);
  assert.equal(isAuthenticatedLivePagesReceipt(receipt), false);
  observed.manifestSha256 = "a".repeat(64);
  assert.equal(validateLivePagesReceiptShape(observed), observed);
  assert.equal(isAuthenticatedLivePagesReceipt(observed), false);

  const observedTimeMutation = await authenticateLivePagesReceipt(receipt, async () => ({
    receipt: { ...structuredClone(receipt), observedAt: "2026-09-01T20:02:00Z" },
  }));
  observedTimeMutation.observedAt = "2026-09-01T20:03:00Z";
  assert.equal(isAuthenticatedLivePagesReceipt(observedTimeMutation), false);

  const disposableObservation = await authenticateLivePagesReceipt(receipt, async () => ({
    receipt: { ...structuredClone(receipt), observedAt: "2026-09-01T20:04:00Z" },
  }));
  assert.equal(isAuthenticatedLivePagesReceipt(disposableObservation), true);
  assert.equal(disposeAuthenticatedLivePagesReceipt(disposableObservation), true);
  assert.equal(isAuthenticatedLivePagesReceipt(disposableObservation), false);
  assert.equal(disposeAuthenticatedLivePagesReceipt(disposableObservation), false);

  let failedOperationObservation;
  await assert.rejects(async () => {
    failedOperationObservation = await authenticateLivePagesReceipt(receipt, async () => ({
      receipt: { ...structuredClone(receipt), observedAt: "2026-09-01T20:05:00Z" },
    }));
    try {
      throw new Error("bounded admission failed");
    } finally {
      disposeAuthenticatedLivePagesReceipt(failedOperationObservation);
    }
  }, /bounded admission failed/u);
  assert.equal(isAuthenticatedLivePagesReceipt(failedOperationObservation), false);

  const alteredBudget = structuredClone(receipt);
  alteredBudget.boundaries.budgets.maximumRegularFiles -= 1;
  assert.throws(
    () => validateLivePagesReceiptShape(alteredBudget),
    /full byte-comparison boundary and budgets/u,
  );

  const localRoot = await mkdtemp(join(tmpdir(), "govuk-webmcp-live-binding-"));
  t.after(() => rm(localRoot, { recursive: true, force: true }));
  const deploymentBytes = Buffer.from(`${JSON.stringify({
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit,
    runId,
  })}\n`, "utf8");
  const indexBytes = Buffer.from("verified page\n", "utf8");
  await Promise.all([
    writeFile(join(localRoot, "deployment.json"), deploymentBytes),
    writeFile(join(localRoot, "index.html"), indexBytes),
  ]);
  const localFiles = [
    {
      path: "deployment.json",
      byteCount: deploymentBytes.length,
      sha256: createHash("sha256").update(deploymentBytes).digest("hex"),
    },
    {
      path: "index.html",
      byteCount: indexBytes.length,
      sha256: createHash("sha256").update(indexBytes).digest("hex"),
    },
  ];
  const localReceipt = createLiveVerificationReceipt({
    artifact: { id: 123, apiDigest: `sha256:${"c".repeat(64)}` },
    artifactTarSha256: "d".repeat(64),
    expectedCommit: commit,
    files: localFiles,
    mismatches: [],
    observedAt: "2026-09-01T20:00:00Z",
    runId,
    statusCounts: { "200": 2 },
  });
  assert.equal(await validateLocalPagesBuildBinding(localReceipt, localRoot), localReceipt);
  await writeFile(join(localRoot, "index.html"), "changed page\n", "utf8");
  await assert.rejects(
    () => validateLocalPagesBuildBinding(localReceipt, localRoot),
    /local Pages build/u,
  );
});

function spawnFixture(chunks, { close = true } = {}) {
  return () => {
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => {
      child.stdout.destroy();
      child.stderr.destroy();
      return true;
    };
    queueMicrotask(() => {
      for (const chunk of chunks) child.stdout.write(chunk);
      if (close) {
        child.stdout.end();
        child.stderr.end();
        child.emit("close", 0);
      }
    });
    return child;
  };
}

test("tar payload preflight enforces aggregate bytes and its deadline", async () => {
  assert.equal(await measureTarRegularPayload("fixture.tar", {
    maximumBytes: 7,
    spawnImplementation: spawnFixture([Buffer.alloc(3), Buffer.alloc(4)]),
    timeoutMs: 100,
  }), 7);
  await assert.rejects(
    () => measureTarRegularPayload("fixture.tar", {
      maximumBytes: 6,
      spawnImplementation: spawnFixture([Buffer.alloc(7)]),
      timeoutMs: 100,
    }),
    /aggregate-byte work budget before extraction/u,
  );
  await assert.rejects(
    () => measureTarRegularPayload("fixture.tar", {
      maximumBytes: 7,
      spawnImplementation: spawnFixture([], { close: false }),
      timeoutMs: 10,
    }),
    /logical-byte preflight exceeded its time budget/u,
  );
});

test("complete live comparison has a shared deadline even when response bodies stall", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-live-timeout-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const path = join(root, "index.html");
  await writeFile(path, "a", "utf8");
  const stalledBody = {
    async *[Symbol.asyncIterator]() {
      await new Promise(() => {});
    },
  };
  await assert.rejects(
    () => compareAllLiveFiles([
      { absolutePath: path, path: "index.html", byteCount: 1 },
    ], "test", {
      comparisonTimeoutMs: 10,
      fetchImplementation: async () => ({
        status: 200,
        headers: new Headers(),
        body: stalledBody,
      }),
    }),
    /complete live Pages comparison exceeded its time budget/u,
  );
});
