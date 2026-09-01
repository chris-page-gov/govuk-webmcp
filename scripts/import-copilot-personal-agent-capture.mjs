#!/usr/bin/env node

import { chmod, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
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

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(repositoryRoot, ".evals", "personal-agent-merged");
const MAX_CAPTURE_BYTES = 64 * 1024 * 1024;

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
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_CAPTURE_BYTES) {
    throw new Error(`${label} must be a bounded regular non-symbolic-link JSON file.`);
  }
  return JSON.parse(await readFile(path, "utf8"));
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
    const directory = join(outputRoot, `${createdAt.replace(/[:.]/gu, "-")}-${process.pid}`);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await chmod(directory, 0o700);
    const capturePath = join(directory, "private-capture.json");
    const summaryPath = join(directory, "public-summary.json");
    await writeFile(capturePath, `${JSON.stringify(merged, null, 2)}\n`, { mode: 0o600 });
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
    await Promise.all([chmod(capturePath, 0o600), chmod(summaryPath, 0o600)]);
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
