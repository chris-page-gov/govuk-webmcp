#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { executeSmokeEvals } from "../../node_modules/webmcp-evals/dist/evaluator/smokeEvaluator.js";

const [targetUrl, fixturePath, resultPath] = process.argv.slice(2);
if (!targetUrl || !fixturePath || !resultPath) {
  throw new Error("Expected a loopback URL, fixture path and private result path.");
}

const parsedTarget = new URL(targetUrl);
if (
  parsedTarget.protocol !== "http:"
  || !["127.0.0.1", "localhost", "[::1]", "::1"].includes(parsedTarget.hostname.toLowerCase())
) {
  throw new Error("The smoke child accepts only a loopback HTTP target.");
}

const fixture = JSON.parse(await readFile(resolve(fixturePath), "utf8"));
const evaluation = await executeSmokeEvals(fixture, {
  url: parsedTarget.href,
  timeoutMs: 30_000,
  verbose: false,
  chromeChannel: "chrome",
});
await writeFile(resolve(resultPath), `${JSON.stringify(evaluation)}\n`, { mode: 0o600 });
