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
import { admitEvidenceSet, MAX_EVIDENCE_ADMISSION_BYTES } from "./lib/public-evidence-admission.mjs";
import { RELEASE_EVIDENCE_PATHS } from "./lib/release-evidence-paths.mjs";
import { parseUtcRfc3339Timestamp } from "./lib/rfc3339-timestamp.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const MAX_CAPTURE_BYTES = 64 * 1024 * 1024;
const MAX_EVALUATION_FUTURE_SKEW_MILLISECONDS = 5 * 60 * 1_000;
const USAGE = "Usage: node scripts/import-copilot-personal-agent-capture.mjs <local-private-capture.json> <copilot-private-capture.json> <live-pages-verification.json> [--stage-release-evidence [--overwrite-release-evidence]]";
const PRIVATE_RELEASE_EVIDENCE_OVERWRITE_WARNING = "WARNING: Canonical private release evidence was replaced. All dependent supported-host, personal-agent and media evidence must be recaptured.\n";

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

export function parseImportArguments(arguments_) {
  if (!Array.isArray(arguments_) || arguments_.some((argument) => typeof argument !== "string")) {
    throw new Error(USAGE);
  }
  const positional = [];
  let stageReleaseEvidence = false;
  let overwriteReleaseEvidence = false;
  const seenOptions = new Set();
  for (const argument of arguments_) {
    if (["--stage-release-evidence", "--overwrite-release-evidence"].includes(argument)) {
      if (seenOptions.has(argument)) throw new Error(`Duplicate argument: ${argument}`);
      seenOptions.add(argument);
      if (argument === "--stage-release-evidence") stageReleaseEvidence = true;
      else overwriteReleaseEvidence = true;
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown argument: ${argument}`);
    } else {
      positional.push(argument);
    }
  }
  if (positional.length !== 3) throw new Error(USAGE);
  if (overwriteReleaseEvidence && !stageReleaseEvidence) {
    throw new Error("--overwrite-release-evidence requires --stage-release-evidence.");
  }
  return {
    localCapturePath: resolve(positional[0]),
    copilotCapturePath: resolve(positional[1]),
    liveReleaseReceiptPath: resolve(positional[2]),
    stageReleaseEvidence,
    overwriteReleaseEvidence,
  };
}

export async function ensurePrivateReleaseEvidenceDirectory(root = repositoryRoot) {
  const rootState = await lstat(root);
  if (!rootState.isDirectory() || rootState.isSymbolicLink()) {
    throw new Error("The release-evidence repository root must be a real non-symbolic directory.");
  }
  let parentRealPath = await realpath(root);
  let current = root;
  for (const component of RELEASE_EVIDENCE_PATHS.privateReleaseRoot.split("/")) {
    current = join(current, component);
    parentRealPath = await ensurePrivateDirectory(
      current,
      parentRealPath,
      `The private release-evidence directory ${component}`,
    );
  }
  return parentRealPath;
}

export function preflightPrivateReleaseEvidence(mergedCapture, authenticatedSummary) {
  const entries = [
    {
      content: `${JSON.stringify(mergedCapture, null, 2)}\n`,
      label: "The canonical private capture",
    },
    {
      content: `${JSON.stringify(authenticatedSummary, null, 2)}\n`,
      label: "The canonical authenticated summary",
    },
  ];
  for (const { content, label } of entries) {
    if (Buffer.byteLength(content, "utf8") > MAX_EVIDENCE_ADMISSION_BYTES) {
      throw new Error(`${label} exceeds the ${MAX_EVIDENCE_ADMISSION_BYTES}-byte evidence admission limit.`);
    }
  }
  return entries;
}

export function formatStagedPrivateReleaseEvidenceOutput(staged, overwrite) {
  const locations = `Canonical private capture: ${staged.capturePath}\nCanonical authenticated summary: ${staged.summaryPath}\n`;
  return overwrite ? `${locations}${PRIVATE_RELEASE_EVIDENCE_OVERWRITE_WARNING}` : locations;
}

export async function stagePrivateReleaseEvidence(
  mergedCapture,
  authenticatedSummary,
  {
    root = repositoryRoot,
    overwrite = false,
    admitImplementation = admitEvidenceSet,
  } = {},
) {
  if (typeof overwrite !== "boolean") {
    throw new Error("Private release-evidence overwrite must be boolean.");
  }
  if (mergedCapture?.schema !== CAPTURE_SCHEMA) {
    throw new Error("The canonical private capture has not passed the supported capture contract.");
  }
  if (
    authenticatedSummary?.schema !== "govuk-webmcp.personal-agent-evaluation-summary.v2"
    || authenticatedSummary.liveReleaseBinding?.status !== "authenticated"
    || authenticatedSummary.suiteId !== mergedCapture.suiteId
    || authenticatedSummary.caseSetSha256 !== mergedCapture.caseSetSha256
    || authenticatedSummary.observedRunCount !== mergedCapture.runs?.length
  ) {
    throw new Error("The canonical personal-agent summary is not the authenticated summary for this capture.");
  }

  const [capture, summary] = preflightPrivateReleaseEvidence(mergedCapture, authenticatedSummary);
  await ensurePrivateReleaseEvidenceDirectory(root);
  const capturePath = resolve(root, RELEASE_EVIDENCE_PATHS.privateEvaluationCapture);
  const summaryPath = resolve(root, RELEASE_EVIDENCE_PATHS.privateAuthenticatedSummary);
  await admitImplementation({
    repositoryRoot: root,
    entries: [
      {
        path: capturePath,
        content: capture.content,
        mode: 0o600,
        replaceExisting: overwrite,
      },
      {
        path: summaryPath,
        content: summary.content,
        mode: 0o600,
        replaceExisting: overwrite,
      },
    ],
  });
  return { capturePath, summaryPath };
}

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
  const options = parseImportArguments(process.argv.slice(2));
  const createdAt = new Date().toISOString();
  const [loaded, localCapture, copilotCapture, liveReleaseReceipt] = await Promise.all([
    loadAndValidateCaseSet(),
    readPrivateCapture(options.localCapturePath, "The local capture"),
    readPrivateCapture(options.copilotCapturePath, "The Copilot import"),
    readPrivateCapture(options.liveReleaseReceiptPath, "The live Pages verification receipt"),
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
    if (options.stageReleaseEvidence) preflightPrivateReleaseEvidence(merged, summary);
    const directory = await createPrivateMergedEvaluationRunDirectory(createdAt);
    const capturePath = join(directory, "private-capture.json");
    const summaryPath = join(directory, "public-summary.json");
    await writePrivateJsonExclusiveNoFollow(capturePath, merged, "The merged private capture");
    await writePrivateJsonExclusiveNoFollow(summaryPath, summary, "The merged public summary");
    process.stdout.write(`Merged private capture: ${capturePath}\nPrivacy-minimised summary: ${summaryPath}\n`);
    if (options.stageReleaseEvidence) {
      const staged = await stagePrivateReleaseEvidence(merged, summary, {
        overwrite: options.overwriteReleaseEvidence,
      });
      process.stdout.write(formatStagedPrivateReleaseEvidenceOutput(staged, options.overwriteReleaseEvidence));
    }
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
