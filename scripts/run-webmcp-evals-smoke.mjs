#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertPinnedWebmcpEvalsVersion,
  createLocalStaticServer,
  createSmokeReceipt,
  readAndValidateSmokeFixture,
  sha256Hex,
  validateSmokeEvaluation,
  withoutProviderCredentials,
} from "./lib/webmcp-evals-harness.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const fixturePath = join(repositoryRoot, "evals", "webmcp-smoke.json");
const outputDirectory = join(repositoryRoot, ".evals");
const receiptPath = join(outputDirectory, "webmcp-smoke-receipt.json");
const webmcpEvalsPackagePath = join(repositoryRoot, "node_modules", "webmcp-evals", "package.json");
const smokeChildPath = join(repositoryRoot, "scripts", "lib", "run-webmcp-evals-smoke-child.mjs");
const MAX_COMMAND_DURATION_MS = 5 * 60 * 1_000;

function runCommand(command, arguments_, options = {}) {
  return new Promise((resolveResult, reject) => {
    const stdoutHash = createHash("sha256");
    const stderrHash = createHash("sha256");
    const detached = process.platform !== "win32";
    const child = spawn(command, arguments_, {
      cwd: repositoryRoot,
      detached,
      env: options.env || process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let timedOut = false;
    let forcedTermination;
    const signalProcessTree = (signal) => {
      try {
        if (detached && child.pid) process.kill(-child.pid, signal);
        else child.kill(signal);
      } catch (error) {
        if (error?.code !== "ESRCH") {
          try {
            child.kill(signal);
          } catch {
            // The child may have exited between the timeout and fallback signal.
          }
        }
      }
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      signalProcessTree("SIGTERM");
      forcedTermination = setTimeout(() => signalProcessTree("SIGKILL"), 5_000);
      forcedTermination.unref();
    }, options.timeoutMs || MAX_COMMAND_DURATION_MS);
    timeout.unref();
    child.stdout.on("data", (chunk) => {
      stdoutHash.update(chunk);
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderrHash.update(chunk);
      process.stderr.write(chunk);
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      clearTimeout(forcedTermination);
      reject(error);
    });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timeout);
      clearTimeout(forcedTermination);
      resolveResult({
        exitCode: exitCode ?? 1,
        signal: signal || null,
        timedOut,
        stdoutSha256: stdoutHash.digest("hex"),
        stderrSha256: stderrHash.digest("hex"),
      });
    });
  });
}

async function chromeVersion() {
  const candidates = process.platform === "darwin"
    ? [["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--version"]]]
    : [["google-chrome", ["--version"]], ["google-chrome-stable", ["--version"]]];
  for (const [command, arguments_] of candidates) {
    try {
      const result = await new Promise((resolveResult, reject) => {
        const child = spawn(command, arguments_, { stdio: ["ignore", "pipe", "ignore"] });
        const chunks = [];
        const timeout = setTimeout(() => child.kill("SIGKILL"), 5_000);
        timeout.unref();
        child.stdout.on("data", (chunk) => chunks.push(chunk));
        child.once("error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once("close", (code) => {
          clearTimeout(timeout);
          resolveResult({ code, value: Buffer.concat(chunks).toString("utf8").trim() });
        });
      });
      if (result.code === 0 && result.value) return result.value;
    } catch {
      // Try the next standard Chrome binary name.
    }
  }
  throw new Error("The installed Google Chrome stable channel could not be identified.");
}

export async function runWebmcpSmoke() {
  try {
    if ((await lstat(outputDirectory)).isSymbolicLink()) {
      throw new Error("The local evaluation directory must not be a symbolic link.");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await chmod(outputDirectory, 0o700);
  let fixtureSummary = { caseCount: 0, expectedStepCount: 0, toolNames: [] };
  let fixtureSha256 = null;
  let browserVersion = "not established";
  let buildResult = {
    exitCode: 1,
    signal: null,
    stdoutSha256: null,
    stderrSha256: null,
    timedOut: false,
  };
  let smokeResult = {
    exitCode: 1,
    signal: null,
    stdoutSha256: null,
    stderrSha256: null,
    timedOut: false,
  };
  let server;
  let privateRunDirectory;
  let isolatedHome;
  let failure;
  let failurePhase = "preflight";
  try {
    const fixtureBytes = await readFile(fixturePath);
    const fixture = JSON.parse(fixtureBytes.toString("utf8"));
    fixtureSummary = await readAndValidateSmokeFixture(fixturePath);
    fixtureSha256 = sha256Hex(fixtureBytes);
    const webmcpEvalsPackage = JSON.parse(await readFile(webmcpEvalsPackagePath, "utf8"));
    assertPinnedWebmcpEvalsVersion(webmcpEvalsPackage.version);
    browserVersion = await chromeVersion();
    isolatedHome = await mkdtemp(join(tmpdir(), "govuk-webmcp-smoke-home-"));
    privateRunDirectory = await mkdtemp(join(outputDirectory, ".smoke-run-"));
    await chmod(isolatedHome, 0o700);
    await chmod(privateRunDirectory, 0o700);
    const childEnvironment = withoutProviderCredentials({
      ...process.env,
      HOME: isolatedHome,
      USERPROFILE: isolatedHome,
    });

    failurePhase = "build";
    buildResult = await runCommand("npm", ["run", "build"], { env: childEnvironment });
    if (buildResult.exitCode !== 0 || buildResult.timedOut) {
      throw new Error("The deterministic application build failed or timed out.");
    }

    failurePhase = "serve";
    server = await createLocalStaticServer(join(repositoryRoot, "dist"));
    failurePhase = "smoke";
    const rawResultPath = join(privateRunDirectory, "evaluation.json");
    smokeResult = await runCommand(process.execPath, [
      smokeChildPath,
      `${server.origin}/`,
      fixturePath,
      rawResultPath,
    ], { env: childEnvironment });
    if (smokeResult.exitCode !== 0 || smokeResult.timedOut) {
      throw new Error("The WebMCP smoke evaluation failed or timed out.");
    }
    const semantic = validateSmokeEvaluation(
      JSON.parse(await readFile(rawResultPath, "utf8")),
      fixture,
    );
    smokeResult = { ...smokeResult, ...semantic };
    console.log(
      `Validated ${semantic.passCount}/${semantic.totalExpectedSteps} successful tool envelopes across ${semantic.testCount} cases.`,
    );
    failurePhase = null;
  } catch (error) {
    failure = error;
  } finally {
    if (server) await server.close();
    if (privateRunDirectory) await rm(privateRunDirectory, { recursive: true, force: true });
    if (isolatedHome) await rm(isolatedHome, { recursive: true, force: true });
    const receipt = createSmokeReceipt({
      createdAt: new Date().toISOString(),
      browserVersion,
      fixtureSha256,
      fixtureSummary,
      buildResult,
      smokeResult,
      failurePhase,
    });
    const temporaryReceiptPath = `${receiptPath}.tmp-${process.pid}`;
    await writeFile(temporaryReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryReceiptPath, receiptPath);
    await chmod(receiptPath, 0o600);
    console.log(`WebMCP smoke receipt: ${receiptPath}`);
  }

  if (failure) throw failure;
  return receiptPath;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runWebmcpSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
