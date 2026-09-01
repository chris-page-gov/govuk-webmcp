#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CAPTURE_SCHEMA,
  assessCapturedCalls,
  summariseEvaluationCapture,
  validateEvaluationCapture,
} from "./verify-personal-agent-evals.mjs";
import {
  EXPECTED_STORY_COUNT,
  LOCAL_MODEL,
  LOCAL_MODEL_INVENTORY_SHA256,
  RUNS_PER_STORY_PER_HOST,
  TOOL_NAMES,
  canonicalJson,
  checkGeneratedArtifacts,
  compileUpstreamFixture,
  loadAndValidateCaseSet,
  sha256Hex,
  buildGeneratedArtifacts,
} from "./prepare-personal-agent-evals.mjs";
import {
  MAX_BROWSER_AGENT_STEPS,
  assertPinnedWebmcpEvalsVersion,
  browserEvalChildEnvironment,
  buildBrowserEvalArguments,
  createLocalStaticServer,
  observeOllamaLoadedModel,
  parseBrowserEvalConfiguration,
  preflightOllamaModel,
  withoutProviderCredentials,
} from "./lib/webmcp-evals-harness.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const fixturePath = join(repositoryRoot, "evals", "generated", "personal-agent-webmcp-evals.json");
const outputRoot = join(repositoryRoot, ".evals", "personal-agent-local");
const cliPath = join(repositoryRoot, "node_modules", "webmcp-evals", "dist", "bin", "webmcp-evals.js");
const packagePath = join(repositoryRoot, "node_modules", "webmcp-evals", "package.json");
const MAX_COMMAND_DURATION_MS = 6 * 60 * 60 * 1_000;
const MAX_REPORT_BYTES = 64 * 1024 * 1024;

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLoopbackUrl(value) {
  try {
    const url = new URL(value);
    return value === url.href
      && url.protocol === "http:"
      && ["127.0.0.1", "localhost", "[::1]", "::1"].includes(url.hostname.toLowerCase())
      && !url.username
      && !url.password
      && url.pathname === "/"
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

function boundLocalConfiguration(environment) {
  if (environment.WEBMCP_EVAL_MODEL && environment.WEBMCP_EVAL_MODEL !== LOCAL_MODEL) {
    throw new Error(`The personal-agent runner is pinned to ${LOCAL_MODEL}.`);
  }
  if (environment.WEBMCP_EVAL_RUNS && environment.WEBMCP_EVAL_RUNS !== String(RUNS_PER_STORY_PER_HOST)) {
    throw new Error("The personal-agent runner is pinned to three repetitions per story.");
  }
  return parseBrowserEvalConfiguration({
    ...environment,
    WEBMCP_EVAL_MODEL: LOCAL_MODEL,
    WEBMCP_EVAL_RUNS: String(RUNS_PER_STORY_PER_HOST),
  });
}

function capturedAnswer(rows) {
  for (const row of [...rows].reverse()) {
    if (typeof row.response?.text === "string" && row.response.text.trim()) return row.response.text;
    if (!Array.isArray(row.trajectory)) continue;
    for (const step of [...row.trajectory].reverse()) {
      if (typeof step?.text === "string" && step.text.trim()) return step.text;
    }
  }
  return null;
}

function answerReview(rows) {
  const text = capturedAnswer(rows);
  if (text === null) {
    return {
      status: "not-captured",
      outcome: null,
      text: null,
      transcriptSha256: null,
      byteLength: null,
      reviewerClass: null,
      checks: [],
      unsafeCategories: [],
    };
  }
  const bytes = Buffer.from(text, "utf8");
  return {
    status: "captured-unreviewed",
    outcome: null,
    text,
    transcriptSha256: sha256Hex(bytes),
    byteLength: bytes.byteLength,
    reviewerClass: null,
    checks: [],
    unsafeCategories: [],
  };
}

function exactCalls(rows, caseId) {
  const calls = [];
  for (const row of rows) {
    const response = row.response;
    if (!response?.functionName) continue;
    if (
      !TOOL_NAMES.includes(response.functionName)
      || !plainObject(response.args)
      || !plainObject(response.result)
    ) {
      throw new Error(`${caseId} has no closed exact tool call in the upstream report.`);
    }
    calls.push({
      ordinal: calls.length + 1,
      name: response.functionName,
      arguments: response.args,
      output: response.result,
    });
  }
  if (calls.length > MAX_BROWSER_AGENT_STEPS) {
    throw new Error(`${caseId} exceeds the bounded six-call agent trajectory.`);
  }
  return calls;
}

function exposedTools(rows) {
  for (const row of rows) {
    for (const step of row.trajectory ?? []) {
      if (!Array.isArray(step?.availableTools)) continue;
      const names = step.availableTools.map(({ functionName }) => functionName);
      if (names.length === TOOL_NAMES.length && TOOL_NAMES.every((name) => names.includes(name))) {
        return { status: "observed", names: [...TOOL_NAMES] };
      }
    }
  }
  return { status: "not-observable", names: null };
}

function diagnostics(rows) {
  const browserConsoleErrors = [...new Set(rows.flatMap((row) =>
    (row.browserConsoleErrors ?? []).map((value) => canonicalJson(value))))];
  const runnerErrors = rows
    .filter(({ outcome }) => outcome === "error")
    .map((row) => `Upstream evaluator error at step ${String(row.stepIndex)}.`);
  if (browserConsoleErrors.length > 32 || runnerErrors.length > 16) {
    throw new Error("The upstream report exceeds the bounded diagnostic allowance.");
  }
  return { status: "observed", browserConsoleErrors, runnerErrors };
}

function groupReportRows(report, fixture) {
  if (
    report?.config?.backend !== "vercel"
    || report.config.model !== LOCAL_MODEL
    || report.config.runs !== RUNS_PER_STORY_PER_HOST
    || report.config.maxSteps !== MAX_BROWSER_AGENT_STEPS
    || !isLoopbackUrl(report.config.url)
  ) {
    throw new Error("The upstream report is not the pinned local three-repetition evaluation.");
  }
  if (
    report.results?.testCount !== EXPECTED_STORY_COUNT * RUNS_PER_STORY_PER_HOST
    || !Array.isArray(report.results?.results)
    || report.results.results.length > EXPECTED_STORY_COUNT * RUNS_PER_STORY_PER_HOST * MAX_BROWSER_AGENT_STEPS
  ) {
    throw new Error("The upstream report does not contain the bounded 12 by 3 local matrix.");
  }
  for (const field of ["passCount", "failCount", "errorCount"]) {
    if (!Number.isInteger(report.results[field]) || report.results[field] < 0) {
      throw new Error(`The upstream report has no valid ${field}.`);
    }
  }
  if (report.results.passCount + report.results.failCount + report.results.errorCount !== report.results.results.length) {
    throw new Error("The upstream report outcome totals do not match its rows.");
  }
  const fixtureByName = new Map(fixture.map((evalCase) => [evalCase.name, evalCase]));
  const groups = new Map();
  for (const row of report.results.results) {
    const name = row?.test?.name;
    const repetition = row?.runIndex;
    if (!fixtureByName.has(name) || !Number.isInteger(repetition) || repetition < 1 || repetition > 3) {
      throw new Error("The upstream report contains an unplanned story or repetition.");
    }
    if (!sameMessages(row.test.messages, fixtureByName.get(name).messages)) {
      throw new Error(`${name} report messages differ from the generated fixture.`);
    }
    const key = `${name}/${repetition}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const rows of groups.values()) {
    rows.sort((left, right) => left.stepIndex - right.stepIndex);
    if (!rows.every((row, index) => row.stepIndex === index + 1)) {
      throw new Error("The upstream report contains a non-consecutive case trajectory.");
    }
  }
  return groups;
}

function sameMessages(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

export async function convertPersonalAgentReport(
  report,
  loaded,
  createdAt = new Date().toISOString(),
  runnerContext = {},
) {
  const fixture = compileUpstreamFixture(loaded.caseSet);
  const groups = groupReportRows(report, fixture);
  const runs = [];
  for (const evalCase of loaded.caseSet.cases) {
    const fixtureName = `${evalCase.id} ${evalCase.title}`;
    for (let repetition = 1; repetition <= RUNS_PER_STORY_PER_HOST; repetition += 1) {
      const rows = groups.get(`${fixtureName}/${repetition}`);
      if (!rows) throw new Error(`The upstream report is missing ${evalCase.id} repetition ${repetition}.`);
      const calls = exactCalls(rows, evalCase.id);
      const assessment = assessCapturedCalls(calls, evalCase);
      const context = {
        hostVersion: runnerContext.hostVersion
          ? { status: "observed", value: runnerContext.hostVersion }
          : { status: "not-observable", value: null },
        browser: runnerContext.browserVersion
          ? { status: "observed", product: "Google Chrome", version: runnerContext.browserVersion }
          : { status: "not-observable", product: null, version: null },
        visibleMode: "headless",
        exposedTools: exposedTools(rows),
        share: { status: "not-applicable", url: null },
        deployment: {
          kind: "local-loopback",
          url: report.config.url,
          commitSha: runnerContext.commitSha ?? "0".repeat(40),
          worktreeStatus: runnerContext.worktreeStatus ?? "dirty",
        },
        diagnostics: diagnostics(rows),
      };
      runs.push({
        hostId: "ollama-local",
        caseId: evalCase.id,
        repetition,
        observedAt: createdAt,
        hostIdentity: {
          modelStatus: "observed-exact",
          model: LOCAL_MODEL,
          inventorySha256: LOCAL_MODEL_INVENTORY_SHA256,
          executionBound: true,
        },
        executionContext: context,
        callTrace: { status: "observed", calls },
        pageObservation: {
          status: "not-observable",
          before: null,
          after: null,
          url: null,
          history: null,
          storage: null,
        },
        criteria: {
          ...assessment,
          pageParity: "not-observable",
          answerSafety: "not-reviewed",
        },
        answerReview: answerReview(rows),
      });
    }
  }
  const capture = {
    schema: CAPTURE_SCHEMA,
    suiteId: loaded.caseSet.suiteId,
    caseSetSha256: loaded.caseSetSha256,
    comparisonDesign: "observational",
    createdAt,
    runs,
  };
  await validateEvaluationCapture(capture, loaded);
  return capture;
}

function captureCommandOutput(command, arguments_, cwd = repositoryRoot) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, arguments_, { cwd, stdio: ["ignore", "pipe", "ignore"] });
    const chunks = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.once("error", reject);
    child.once("close", (code) => {
      if (code !== 0) reject(new Error(`${command} did not return the required execution identity.`));
      else resolveResult(Buffer.concat(chunks).toString("utf8").trim());
    });
  });
}

async function installedChromeVersion() {
  const command = process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "google-chrome";
  return captureCommandOutput(command, ["--version"]);
}

async function gitIdentity() {
  const [commitSha, status] = await Promise.all([
    captureCommandOutput("git", ["rev-parse", "HEAD"]),
    captureCommandOutput("git", ["status", "--porcelain"]),
  ]);
  if (!/^[a-f0-9]{40}$/u.test(commitSha)) throw new Error("The repository commit identity is not a SHA-1 commit.");
  return { commitSha, worktreeStatus: status ? "dirty" : "clean" };
}

async function ollamaVersion(configuration) {
  const response = await fetch(`${configuration.ollama.apiOrigin}/api/version`, {
    headers: { Accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`The loopback Ollama version endpoint returned HTTP ${response.status}.`);
  const value = await response.json();
  if (!plainObject(value) || Object.keys(value).join(",") !== "version" || typeof value.version !== "string" || value.version.length > 80) {
    throw new Error("The loopback Ollama version response is not the bounded expected object.");
  }
  return value.version;
}

export function runCommand(command, arguments_, options) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, arguments_, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "inherit", "inherit"],
    });
    let timedOut = false;
    let settled = false;
    let forceKillTimeout;
    let abandonTimeout;
    const clearTimers = () => {
      clearTimeout(timeout);
      clearTimeout(forceKillTimeout);
      clearTimeout(abandonTimeout);
    };
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (error) reject(error);
      else resolveResult(result);
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      forceKillTimeout = setTimeout(() => {
        child.kill("SIGKILL");
        abandonTimeout = setTimeout(() => {
          child.unref();
          finish(new Error("The evaluator child did not exit after SIGKILL."));
        }, options.killSettleMs ?? 5_000);
        abandonTimeout.unref();
      }, options.terminationGraceMs ?? 5_000);
      forceKillTimeout.unref();
    }, options.timeoutMs ?? MAX_COMMAND_DURATION_MS);
    timeout.unref();
    child.once("error", (error) => {
      finish(error);
    });
    child.once("close", (exitCode) => {
      finish(null, { exitCode: exitCode ?? 1, timedOut });
    });
  });
}

async function createRunDirectory(createdAt) {
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  await chmod(outputRoot, 0o700);
  const directory = join(outputRoot, `${createdAt.replace(/[:.]/gu, "-")}-${process.pid}`);
  await mkdir(directory, { mode: 0o700 });
  return directory;
}

async function readSingleJsonReport(directory) {
  const names = (await readdir(directory)).filter((name) => /^report-\d+\.json$/u.test(name));
  if (names.length !== 1) throw new Error("The local evaluator did not produce exactly one JSON report.");
  const path = join(directory, names[0]);
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_REPORT_BYTES) {
    throw new Error("The local evaluator JSON report is not a bounded regular file.");
  }
  await chmod(path, 0o600);
  return JSON.parse(await readFile(path, "utf8"));
}

function assertModelIdentity(identity, label) {
  if (identity?.name !== "gpt-oss:20b" || identity.digest !== LOCAL_MODEL_INVENTORY_SHA256) {
    throw new Error(`The exact authorised Ollama identity was not bound ${label} evaluation.`);
  }
}

export async function runPersonalAgentEvaluation(environment = process.env) {
  const configuration = boundLocalConfiguration(environment);
  const loaded = await loadAndValidateCaseSet();
  const isolatedHome = await mkdtemp(join(tmpdir(), "govuk-webmcp-personal-agent-home-"));
  await chmod(isolatedHome, 0o700);
  const childEnvironment = { ...environment, HOME: isolatedHome, USERPROFILE: isolatedHome };
  let server;
  try {
    const build = await runCommand("npm", ["run", "build"], {
      cwd: repositoryRoot,
      env: withoutProviderCredentials(childEnvironment),
    });
    if (build.exitCode !== 0 || build.timedOut) {
      throw new Error("The deterministic build failed before local evaluation.");
    }
    await checkGeneratedArtifacts(await buildGeneratedArtifacts(loaded));
    const package_ = JSON.parse(await readFile(packagePath, "utf8"));
    assertPinnedWebmcpEvalsVersion(package_.version);
    assertModelIdentity(await preflightOllamaModel(configuration), "before");
    const [browserVersion, repositoryIdentity, ollamaVersionValue] = await Promise.all([
      installedChromeVersion(),
      gitIdentity(),
      ollamaVersion(configuration),
    ]);
    const createdAt = new Date().toISOString();
    const directory = await createRunDirectory(createdAt);
    server = await createLocalStaticServer(join(repositoryRoot, "dist"));
    const command = buildBrowserEvalArguments({
      configuration,
      cliPath,
      fixturePath,
      outputDirectory: directory,
      targetUrl: `${server.origin}/`,
    });
    const result = await runCommand(process.execPath, command, {
      cwd: directory,
      env: browserEvalChildEnvironment(childEnvironment, configuration),
    });
    if (result.exitCode !== 0 || result.timedOut) throw new Error("The local personal-agent evaluation failed or timed out.");
    assertModelIdentity(await preflightOllamaModel(configuration), "after");
    assertModelIdentity(await observeOllamaLoadedModel(configuration), "during");

    const report = await readSingleJsonReport(directory);
    const capture = await convertPersonalAgentReport(report, loaded, createdAt, {
      browserVersion,
      commitSha: repositoryIdentity.commitSha,
      hostVersion: `Ollama ${ollamaVersionValue}; webmcp-evals ${package_.version}`,
      worktreeStatus: repositoryIdentity.worktreeStatus,
    });
    const summary = await summariseEvaluationCapture(capture, loaded);
    const capturePath = join(directory, "private-capture.json");
    const summaryPath = join(directory, "public-summary.json");
    await writeFile(capturePath, `${JSON.stringify(capture, null, 2)}\n`, { mode: 0o600 });
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
    await Promise.all([chmod(capturePath, 0o600), chmod(summaryPath, 0o600)]);
    process.stdout.write(`Private exact capture: ${capturePath}\nPublic digest-free summary: ${summaryPath}\n`);
    return { capturePath, summaryPath, summary };
  } finally {
    if (server) await server.close();
    await rm(isolatedHome, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runPersonalAgentEvaluation().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
