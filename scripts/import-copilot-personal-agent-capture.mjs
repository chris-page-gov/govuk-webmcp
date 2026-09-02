#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { lstat, mkdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPECTED_STORY_COUNT,
  RUNS_PER_STORY_PER_HOST,
  loadAndValidateCaseSet,
} from "./prepare-personal-agent-evals.mjs";
import {
  CAPTURE_SCHEMA,
  authenticateEvaluationReleaseReceipt,
  disposeEvaluationReleaseReceipt,
  summariseEvaluationCapture,
  validateEvaluationCapture,
} from "./verify-personal-agent-evals.mjs";
import { ensurePrivateDirectory } from "./lib/private-directory.mjs";
import {
  readBoundedPrivateJsonNoFollow,
  writePrivateJsonExclusiveNoFollow,
} from "./lib/private-json-file.mjs";
import { parseUtcRfc3339Timestamp } from "./lib/rfc3339-timestamp.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const MAX_CAPTURE_BYTES = 64 * 1024 * 1024;
const MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS = 5 * 60 * 1_000;

function inside(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

export async function createPrivateMergedEvaluationRunDirectory(
  createdAt,
  root = repositoryRoot,
  idFactory = randomUUID,
) {
  const parsedCreatedAt = parseUtcRfc3339Timestamp(createdAt, "Private merged evaluation time");
  if (parsedCreatedAt > Date.now() + MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS) {
    throw new Error("Private merged evaluation time must not be more than five minutes in the future.");
  }
  const rootState = await lstat(root);
  if (!rootState.isDirectory() || rootState.isSymbolicLink()) {
    throw new Error("The merged evaluation repository root must be a real non-symbolic directory.");
  }
  const rootRealPath = await realpath(root);
  const evalsPath = join(root, ".evals");
  const evalsRealPath = await ensurePrivateDirectory(evalsPath, rootRealPath, "The private merged .evals directory");
  const outputRoot = join(evalsPath, "personal-agent-merged");
  const outputRealPath = await ensurePrivateDirectory(outputRoot, evalsRealPath, "The private merged personal-agent output root");
  const identifier = idFactory();
  if (typeof identifier !== "string" || !/^[A-Za-z0-9-]{1,100}$/u.test(identifier)) {
    throw new Error("Private merged evaluation directory identifier is invalid.");
  }
  const runName = `${createdAt.replace(/[:.]/gu, "-")}-${process.pid}-${identifier}`;
  const directory = join(outputRoot, runName);
  await mkdir(directory, { mode: 0o700 });
  const directoryRealPath = await ensurePrivateDirectory(
    directory,
    outputRealPath,
    "The private merged evaluation run directory",
  );
  if (!inside(outputRealPath, directoryRealPath)) {
    throw new Error("The private merged evaluation run directory escaped its output root.");
  }
  return directoryRealPath;
}

export const writePrivateJsonExclusive = writePrivateJsonExclusiveNoFollow;

function expectedHostKeys(caseSet, hostId) {
  return caseSet.cases.flatMap(({ id }) =>
    Array.from({ length: RUNS_PER_STORY_PER_HOST }, (_, index) => `${hostId}/${id}/${index + 1}`));
}

function assertExactHostMatrix(capture, caseSet, hostId, label) {
  const expected = expectedHostKeys(caseSet, hostId);
  const actual = capture.runs.map((run) => `${run.hostId}/${run.caseId}/${run.repetition}`);
  if (
    capture.runs.length !== EXPECTED_STORY_COUNT * RUNS_PER_STORY_PER_HOST
    || new Set(actual).size !== actual.length
    || expected.some((key) => !actual.includes(key))
    || actual.some((key) => !expected.includes(key))
  ) {
    throw new Error(`${label} must contain exactly the 36 ${hostId} run slots.`);
  }
}

export async function mergePersonalAgentCaptures(
  localCapture,
  copilotCapture,
  loaded,
  liveReleaseReceipt,
  createdAt = new Date().toISOString(),
) {
  if (liveReleaseReceipt === undefined || liveReleaseReceipt === null) {
    throw new Error("The Copilot import requires the exact live Pages verification receipt.");
  }
  await Promise.all([
    validateEvaluationCapture(localCapture, loaded, liveReleaseReceipt),
    validateEvaluationCapture(copilotCapture, loaded, liveReleaseReceipt),
  ]);
  assertExactHostMatrix(localCapture, loaded.caseSet, "ollama-local", "The local capture");
  assertExactHostMatrix(copilotCapture, loaded.caseSet, "copilot-mcp-workspace", "The Copilot import");
  const runsByKey = new Map(
    [...copilotCapture.runs, ...localCapture.runs]
      .map((run) => [`${run.hostId}/${run.caseId}/${run.repetition}`, structuredClone(run)]),
  );
  const runs = ["copilot-mcp-workspace", "ollama-local"].flatMap((hostId) =>
    expectedHostKeys(loaded.caseSet, hostId).map((key) => runsByKey.get(key)));
  const merged = {
    schema: CAPTURE_SCHEMA,
    suiteId: loaded.caseSet.suiteId,
    caseSetSha256: loaded.caseSetSha256,
    comparisonDesign: "observational",
    createdAt,
    runs,
  };
  await validateEvaluationCapture(merged, loaded, liveReleaseReceipt);
  return merged;
}

async function readPrivateCapture(path, label) {
  return readBoundedPrivateJsonNoFollow(path, label, MAX_CAPTURE_BYTES);
}

async function main() {
  const arguments_ = process.argv.slice(2);
  if (arguments_.length !== 3 || arguments_.some((argument) => argument.startsWith("-"))) {
    throw new Error("Usage: node scripts/import-copilot-personal-agent-capture.mjs <local-private-capture.json> <copilot-private-capture.json> <live-pages-verification.json>");
  }
  const createdAt = new Date().toISOString();
  const [loaded, localCapture, copilotCapture, liveReleaseReceipt] = await Promise.all([
    loadAndValidateCaseSet(),
    readPrivateCapture(resolve(arguments_[0]), "The local capture"),
    readPrivateCapture(resolve(arguments_[1]), "The Copilot import"),
    readPrivateCapture(resolve(arguments_[2]), "The live Pages verification receipt"),
  ]);
  const authenticatedRelease = await authenticateEvaluationReleaseReceipt(liveReleaseReceipt);
  try {
    const merged = await mergePersonalAgentCaptures(
      localCapture,
      copilotCapture,
      loaded,
      authenticatedRelease,
      createdAt,
    );
    const summary = await summariseEvaluationCapture(merged, loaded, authenticatedRelease);
    const directory = await createPrivateMergedEvaluationRunDirectory(createdAt);
    const capturePath = join(directory, "private-capture.json");
    const summaryPath = join(directory, "public-summary.json");
    await writePrivateJsonExclusiveNoFollow(capturePath, merged, "The merged private capture");
    await writePrivateJsonExclusiveNoFollow(summaryPath, summary, "The merged public summary");
    process.stdout.write(`Merged private capture: ${capturePath}\nPrivacy-minimised summary: ${summaryPath}\n`);
  } finally {
    await disposeEvaluationReleaseReceipt(authenticatedRelease);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
