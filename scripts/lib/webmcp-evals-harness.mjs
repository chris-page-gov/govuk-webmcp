import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, relative, resolve, sep } from "node:path";

export const PINNED_WEBMCP_EVALS_VERSION = "0.0.4";
export const CHROME_CHANNEL = "chrome";
export const DEFAULT_BROWSER_EVAL_RUNS = 3;
export const MAX_BROWSER_EVAL_RUNS = 10;
export const MAX_BROWSER_AGENT_STEPS = 6;
export const BROWSER_EVAL_REPORTERS = Object.freeze(["console", "json", "html"]);
export const V0_3_TOOL_NAMES = Object.freeze([
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
]);
export const EXPECTED_TOOL_NAMES = Object.freeze([
  ...V0_3_TOOL_NAMES,
  "present_resource_evidence",
]);
export const EXPECTED_RESULT_SCHEMAS = Object.freeze({
  search_government_knowledge: "trusted-govuk-discovery.search-result.v2",
  get_resource_record: "trusted-govuk-discovery.resource-record-result.v1",
  show_provenance: "trusted-govuk-discovery.provenance-result.v1",
  explore_answer_foundations: "trusted-govuk-discovery.evidence-exploration-result.v1",
  compare_evidence_foundations: "trusted-govuk-discovery.evidence-comparison-result.v1",
  present_resource_evidence: "govuk-webmcp.present-resource-evidence-result.v1",
});

const ALLOWED_ARGUMENTS = Object.freeze({
  search_government_knowledge: new Set([
    "query",
    "resourceTypes",
    "publishers",
    "accessStatuses",
    "collections",
    "limit",
  ]),
  get_resource_record: new Set(["recordId"]),
  show_provenance: new Set(["recordId"]),
  explore_answer_foundations: new Set(["answerId", "claimId"]),
  compare_evidence_foundations: new Set(["answerId", "claimIds"]),
  present_resource_evidence: new Set(["recordId"]),
});

const MIME_TYPES = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
});

function plainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function validateCall(call, caseName, stepIndex, admittedToolNames = EXPECTED_TOOL_NAMES) {
  if (!plainObject(call) || typeof call.functionName !== "string") {
    throw new Error(`${caseName} step ${stepIndex} must be a function-call object.`);
  }
  if (!admittedToolNames.includes(call.functionName)) {
    throw new Error(`${caseName} step ${stepIndex} names an unsupported tool.`);
  }
  if (!plainObject(call.arguments)) {
    throw new Error(`${caseName} step ${stepIndex} must provide concrete arguments.`);
  }
  const allowed = ALLOWED_ARGUMENTS[call.functionName];
  for (const key of Object.keys(call.arguments)) {
    if (!allowed.has(key)) {
      throw new Error(`${caseName} step ${stepIndex} includes an unrelated argument: ${key}.`);
    }
  }
  if (Object.keys(call).some((key) => !["functionName", "arguments"].includes(key))) {
    throw new Error(`${caseName} step ${stepIndex} must be required and deterministic.`);
  }
}

export function validateSmokeFixture(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("The smoke fixture must contain at least one case.");
  }
  const names = new Set();
  const toolNames = new Set();
  let expectedStepCount = 0;
  for (const [caseIndex, evalCase] of value.entries()) {
    if (!plainObject(evalCase) || typeof evalCase.name !== "string" || !evalCase.name.trim()) {
      throw new Error(`Smoke case ${caseIndex + 1} must have a name.`);
    }
    if (names.has(evalCase.name)) throw new Error(`Smoke case name is duplicated: ${evalCase.name}.`);
    names.add(evalCase.name);
    if (!Array.isArray(evalCase.messages) || evalCase.messages.length === 0) {
      throw new Error(`${evalCase.name} must contain a user message.`);
    }
    if (!Array.isArray(evalCase.expectedCall) || evalCase.expectedCall.length === 0) {
      throw new Error(`${evalCase.name} must contain at least one required call.`);
    }
    for (const [stepIndex, call] of evalCase.expectedCall.entries()) {
      validateCall(call, evalCase.name, stepIndex + 1);
      toolNames.add(call.functionName);
      expectedStepCount += 1;
    }
  }
  const missingTools = EXPECTED_TOOL_NAMES.filter((name) => !toolNames.has(name));
  if (missingTools.length > 0) {
    throw new Error(`The smoke fixture does not exercise: ${missingTools.join(", ")}.`);
  }
  return {
    caseCount: value.length,
    expectedStepCount,
    toolNames: [...toolNames].sort(),
  };
}

export async function readAndValidateSmokeFixture(path) {
  return validateSmokeFixture(JSON.parse(await readFile(path, "utf8")));
}

export function validateSmokeEvaluation(evaluation, fixture) {
  const fixtureSummary = validateSmokeFixture(fixture);
  if (!plainObject(evaluation) || !Array.isArray(evaluation.results)) {
    throw new Error("The smoke evaluator returned no per-call results.");
  }
  if (
    evaluation.testCount !== fixtureSummary.caseCount
    || evaluation.totalExpectedSteps !== fixtureSummary.expectedStepCount
    || evaluation.results.length !== fixtureSummary.expectedStepCount
    || evaluation.passCount !== fixtureSummary.expectedStepCount
    || evaluation.errorCount !== 0
  ) {
    throw new Error("The smoke evaluator counts do not match the bounded fixture.");
  }
  const expectedCalls = fixture.flatMap(({ expectedCall }) => expectedCall);
  for (const [index, result] of evaluation.results.entries()) {
    const expected = expectedCalls[index];
    const expectedSchema = EXPECTED_RESULT_SCHEMAS[expected.functionName];
    if (
      result?.outcome !== "pass"
      || result.functionName !== expected.functionName
      || canonicalJson(result.arguments) !== canonicalJson(expected.arguments)
      || !plainObject(result.result)
      || result.result.ok !== true
      || result.result.schema !== expectedSchema
      || Object.hasOwn(result.result, "error")
    ) {
      throw new Error(
        `Smoke result ${index + 1} did not return the expected successful ${expectedSchema} envelope.`,
      );
    }
  }
  return {
    errorCount: evaluation.errorCount,
    passCount: evaluation.passCount,
    resultsSha256: sha256Hex(canonicalJson(evaluation.results)),
    testCount: evaluation.testCount,
    totalExpectedSteps: evaluation.totalExpectedSteps,
  };
}

export function validateBrowserFixture(
  value,
  { expectedToolNames = EXPECTED_TOOL_NAMES } = {},
) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("The browser fixture must contain at least one case.");
  }
  const names = new Set();
  const toolNames = new Set();
  let noCallCaseCount = 0;
  let expectedStepCount = 0;
  for (const [caseIndex, evalCase] of value.entries()) {
    if (!plainObject(evalCase) || typeof evalCase.name !== "string" || !evalCase.name.trim()) {
      throw new Error(`Browser case ${caseIndex + 1} must have a name.`);
    }
    if (names.has(evalCase.name)) throw new Error(`Browser case name is duplicated: ${evalCase.name}.`);
    names.add(evalCase.name);
    if (!Array.isArray(evalCase.messages) || evalCase.messages.length === 0) {
      throw new Error(`${evalCase.name} must contain a user message.`);
    }
    if (evalCase.expectedCall === null) {
      noCallCaseCount += 1;
      continue;
    }
    if (!Array.isArray(evalCase.expectedCall) || evalCase.expectedCall.length === 0) {
      throw new Error(`${evalCase.name} must contain a required call or an explicit null no-call expectation.`);
    }
    for (const [stepIndex, call] of evalCase.expectedCall.entries()) {
      validateCall(call, evalCase.name, stepIndex + 1, expectedToolNames);
      toolNames.add(call.functionName);
      expectedStepCount += 1;
    }
  }
  const missingTools = expectedToolNames.filter((name) => !toolNames.has(name));
  if (missingTools.length > 0) {
    throw new Error(`The browser fixture does not exercise: ${missingTools.join(", ")}.`);
  }
  if (noCallCaseCount === 0) {
    throw new Error("The browser fixture must include a no-call selection case.");
  }
  return {
    caseCount: value.length,
    expectedStepCount,
    noCallCaseCount,
    toolNames: [...toolNames].sort(),
  };
}

export async function readAndValidateBrowserFixture(path) {
  return validateBrowserFixture(JSON.parse(await readFile(path, "utf8")));
}

const REMOTE_PROVIDER_CREDENTIALS = Object.freeze({
  anthropic: Object.freeze(["ANTHROPIC_API_KEY"]),
  google: Object.freeze(["GOOGLE_AI", "GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"]),
  openai: Object.freeze(["OPENAI_API_KEY"]),
});

function requiredString(environment, name) {
  const value = environment[name];
  return typeof value === "string" && value.trim() ? value : null;
}

export function resolveLoopbackOllamaHost(rawHost = "http://127.0.0.1:11434") {
  let parsed;
  try {
    parsed = new URL(rawHost);
  } catch {
    throw new Error("OLLAMA_HOST must be an absolute loopback HTTP URL.");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]", "::1"].includes(hostname)) {
    throw new Error("OLLAMA_HOST must use HTTP on 127.0.0.1, localhost or ::1.");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("OLLAMA_HOST must not contain credentials, a query or a fragment.");
  }
  if (!["", "/", "/v1", "/v1/"].includes(parsed.pathname)) {
    throw new Error("OLLAMA_HOST may contain only the optional /v1 path.");
  }
  return {
    apiOrigin: parsed.origin,
    vercelBaseUrl: `${parsed.origin}/v1`,
  };
}

export function parseBrowserEvalConfiguration(environment) {
  const model = requiredString(environment, "WEBMCP_EVAL_MODEL");
  if (!model) {
    throw new Error(
      "Set WEBMCP_EVAL_MODEL explicitly to an ollama:, anthropic:, openai: or google: model.",
    );
  }
  const modelMatch = /^(ollama|anthropic|openai|google):([A-Za-z0-9][A-Za-z0-9._:/@-]{0,127})$/u.exec(model);
  if (!modelMatch) {
    throw new Error(
      "WEBMCP_EVAL_MODEL must use an allowed provider prefix and a bounded model identifier.",
    );
  }
  const provider = modelMatch[1];
  const modelIdentifier = modelMatch[2];
  const rawRuns = requiredString(environment, "WEBMCP_EVAL_RUNS") || String(DEFAULT_BROWSER_EVAL_RUNS);
  if (!/^(?:[1-9]|10)$/u.test(rawRuns)) {
    throw new Error(`WEBMCP_EVAL_RUNS must be an integer from 1 to ${MAX_BROWSER_EVAL_RUNS}.`);
  }
  const runs = Number(rawRuns);

  if (environment.WEBMCP_EVAL_PRESENTATION_APPROVED !== "1") {
    throw new Error(
      "Set WEBMCP_EVAL_PRESENTATION_APPROVED=1 to approve the bounded reversible page-presentation calls in the authored fixture.",
    );
  }

  if (provider === "ollama") {
    const ollama = resolveLoopbackOllamaHost(
      requiredString(environment, "OLLAMA_HOST") || "http://127.0.0.1:11434",
    );
    return {
      backend: "vercel",
      credentialName: null,
      model,
      modelIdentifier,
      ollama,
      presentationApproved: true,
      provider,
      providerClass: "local-loopback",
      remoteProviderApproved: false,
      runs,
    };
  }

  if (environment.WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED !== "1") {
    throw new Error(
      "Set WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1 to acknowledge that prompts, tool metadata and results will be sent to the selected remote provider.",
    );
  }
  const credentialName = REMOTE_PROVIDER_CREDENTIALS[provider]
    .find((name) => requiredString(environment, name));
  if (!credentialName) {
    throw new Error(`The selected ${provider} provider credential is not configured.`);
  }
  return {
    backend: "vercel",
    credentialName,
    model,
    modelIdentifier,
    ollama: null,
    presentationApproved: true,
    provider,
    providerClass: "remote",
    remoteProviderApproved: true,
    runs,
  };
}

export function browserEvalChildEnvironment(environment, configuration) {
  const childEnvironment = {};
  for (const name of [
    "APPDATA",
    "CI",
    "HOME",
    "LANG",
    "LC_ALL",
    "LOCALAPPDATA",
    "PATH",
    "SystemRoot",
    "TEMP",
    "TERM",
    "TMP",
    "TMPDIR",
    "TZ",
    "USERPROFILE",
    "WINDIR",
  ]) {
    if (typeof environment[name] === "string") childEnvironment[name] = environment[name];
  }
  childEnvironment.NO_COLOR = "1";
  if (configuration.provider === "ollama") {
    childEnvironment.OLLAMA_HOST = configuration.ollama.vercelBaseUrl;
  } else {
    childEnvironment[configuration.credentialName] = environment[configuration.credentialName];
  }
  return childEnvironment;
}

export async function preflightOllamaModel(configuration, fetchImplementation = fetch) {
  if (configuration.provider !== "ollama") return null;
  let response;
  try {
    response = await fetchImplementation(`${configuration.ollama.apiOrigin}/api/tags`, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new Error("The loopback Ollama service could not be reached; no model was downloaded.");
  }
  if (!response.ok) {
    throw new Error(`The loopback Ollama model inventory returned HTTP ${response.status}.`);
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The loopback Ollama model inventory was not valid JSON.");
  }
  if (
    !plainObject(payload)
    || Object.keys(payload).join(",") !== "models"
    || !Array.isArray(payload.models)
    || payload.models.length > 256
    || payload.models.some((entry) => !plainObject(entry))
  ) {
    throw new Error("The loopback Ollama model inventory was not a bounded models array.");
  }
  const matchingEntries = payload.models.filter((entry) =>
    [entry.name, entry.model].some((value) => value === configuration.modelIdentifier));
  if (matchingEntries.length === 0) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} is not installed; the harness will not download it.`,
    );
  }
  if (matchingEntries.length !== 1) {
    throw new Error(`The exact Ollama model ${configuration.modelIdentifier} has an ambiguous inventory identity.`);
  }
  const matchingEntry = matchingEntries[0];
  if (
    matchingEntry.name !== configuration.modelIdentifier
    || matchingEntry.model !== configuration.modelIdentifier
  ) {
    throw new Error(`The exact Ollama model ${configuration.modelIdentifier} has no validated inventory identity.`);
  }
  if (
    Object.hasOwn(matchingEntry, "remote_model")
    || Object.hasOwn(matchingEntry, "remote_host")
  ) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} is remote-backed; select an installed local model or use an approved remote-provider route.`,
    );
  }
  const rawDigest = matchingEntry.digest;
  if (typeof rawDigest !== "string") {
    throw new Error(`The exact Ollama model ${configuration.modelIdentifier} has no validated inventory digest.`);
  }
  const digest = rawDigest.replace(/^sha256:/iu, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/u.test(digest)) {
    throw new Error(`The exact Ollama model ${configuration.modelIdentifier} has no validated inventory digest.`);
  }
  return Object.freeze({
    name: configuration.modelIdentifier,
    digest,
  });
}

export async function observeOllamaLoadedModel(configuration, fetchImplementation = fetch) {
  if (configuration.provider !== "ollama") return null;
  let response;
  try {
    response = await fetchImplementation(`${configuration.ollama.apiOrigin}/api/ps`, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new Error("The loopback Ollama loaded-model state could not be reached.");
  }
  if (!response.ok) {
    throw new Error(`The loopback Ollama loaded-model state returned HTTP ${response.status}.`);
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The loopback Ollama loaded-model state was not valid JSON.");
  }
  if (
    !plainObject(payload)
    || Object.keys(payload).join(",") !== "models"
    || !Array.isArray(payload.models)
    || payload.models.length > 256
    || payload.models.some((entry) => !plainObject(entry))
  ) {
    throw new Error("The loopback Ollama loaded-model state was not a bounded models array.");
  }
  const matchingEntries = payload.models.filter((entry) =>
    [entry.name, entry.model].some((value) => value === configuration.modelIdentifier));
  if (matchingEntries.length === 0) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} was not reported as loaded after evaluation.`,
    );
  }
  if (matchingEntries.length !== 1) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} has an ambiguous loaded identity.`,
    );
  }
  const matchingEntry = matchingEntries[0];
  if (
    matchingEntry.name !== configuration.modelIdentifier
    || matchingEntry.model !== configuration.modelIdentifier
    || typeof matchingEntry.digest !== "string"
  ) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} has no validated loaded digest.`,
    );
  }
  if (
    Object.hasOwn(matchingEntry, "remote_model")
    || Object.hasOwn(matchingEntry, "remote_host")
  ) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} was reported as remote-backed after evaluation.`,
    );
  }
  const digest = matchingEntry.digest.replace(/^sha256:/iu, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/u.test(digest)) {
    throw new Error(
      `The exact Ollama model ${configuration.modelIdentifier} has no validated loaded digest.`,
    );
  }
  return Object.freeze({
    name: configuration.modelIdentifier,
    digest,
  });
}

export function buildBrowserEvalArguments({
  configuration,
  cliPath,
  fixturePath,
  outputDirectory,
  targetUrl,
}) {
  const arguments_ = [
    cliPath,
    "--backend",
    "vercel",
    "--model",
    configuration.model,
    "--runs",
    String(configuration.runs),
    "--max-steps",
    String(MAX_BROWSER_AGENT_STEPS),
    "--chrome-channel",
    CHROME_CHANNEL,
    "--output-dir",
    outputDirectory,
    "browser",
    "--url",
    targetUrl,
    "--evals",
    fixturePath,
    "--reporter",
    ...BROWSER_EVAL_REPORTERS,
  ];
  if (arguments_.slice(-BROWSER_EVAL_REPORTERS.length - 1)[0] !== "--reporter") {
    throw new Error("The variadic reporter option must be the final CLI argument group.");
  }
  return arguments_;
}

export function assertPinnedWebmcpEvalsVersion(version) {
  if (version !== PINNED_WEBMCP_EVALS_VERSION) {
    throw new Error(
      `Expected webmcp-evals ${PINNED_WEBMCP_EVALS_VERSION}, received ${String(version)}. Run npm ci.`,
    );
  }
}

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function withoutProviderCredentials(environment) {
  const sanitised = {};
  for (const name of [
    "APPDATA",
    "CI",
    "HOME",
    "LANG",
    "LC_ALL",
    "LOCALAPPDATA",
    "PATH",
    "SystemRoot",
    "TEMP",
    "TERM",
    "TMP",
    "TMPDIR",
    "TZ",
    "USERPROFILE",
    "WINDIR",
  ]) {
    if (typeof environment[name] === "string") sanitised[name] = environment[name];
  }
  sanitised.NO_COLOR = "1";
  return sanitised;
}

export function resolveStaticPath(rootDirectory, rawUrl = "/") {
  const pathname = rawUrl.split(/[?#]/u, 1)[0] || "/";
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new Error("The request path is not valid UTF-8.");
  }
  if (decoded.includes("\0") || decoded.split("/").includes("..") || decoded.includes("\\")) {
    throw new Error("The request path is outside the build directory.");
  }
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const root = resolve(rootDirectory);
  const candidate = resolve(root, relativePath);
  const fromRoot = relative(root, candidate);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`)) {
    throw new Error("The request path is outside the build directory.");
  }
  return candidate;
}

export async function createLocalStaticServer(rootDirectory) {
  const server = createServer(async (request, response) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end();
        return;
      }
      const path = resolveStaticPath(rootDirectory, request.url);
      const status = await lstat(path);
      if (!status.isFile() || status.isSymbolicLink()) throw new Error("Not a regular build file.");
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": MIME_TYPES[extname(path)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      if (request.method === "HEAD") {
        response.end();
      } else {
        createReadStream(path).on("error", () => response.destroy()).pipe(response);
      }
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found\n");
    }
  });

  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolveListen();
    });
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    await new Promise((resolveClose) => server.close(resolveClose));
    throw new Error("The local test server did not expose a TCP port.");
  }
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: async () => await new Promise((resolveClose, reject) => {
      server.close((error) => error ? reject(error) : resolveClose());
    }),
  };
}

export function createSmokeReceipt({
  createdAt,
  browserVersion,
  fixtureSha256,
  fixtureSummary,
  buildResult,
  smokeResult,
  failurePhase = null,
}) {
  const passed = failurePhase === null
    && buildResult.exitCode === 0
    && buildResult.timedOut === false
    && smokeResult.exitCode === 0
    && smokeResult.timedOut === false
    && smokeResult.errorCount === 0
    && smokeResult.passCount === smokeResult.totalExpectedSteps;
  return {
    schema: "trusted-govuk-discovery.webmcp-evals-smoke-receipt.v1",
    createdAt,
    status: passed ? "passed" : "failed",
    runner: {
      webmcpEvalsVersion: PINNED_WEBMCP_EVALS_VERSION,
      chromeChannel: CHROME_CHANNEL,
      browserVersion,
      target: "same-origin loopback build",
    },
    fixture: {
      path: "evals/webmcp-smoke.json",
      sha256: fixtureSha256,
      caseCount: fixtureSummary.caseCount,
      expectedStepCount: fixtureSummary.expectedStepCount,
      toolNames: fixtureSummary.toolNames,
    },
    phases: {
      build: buildResult,
      smoke: smokeResult,
      failurePhase,
    },
    assurance: {
      verifies: "Tool availability plus ok:true execution in the exact expected result schema for every authored concrete call.",
      doesNotVerify: "Agent tool selection; run the browser or local-model evaluation suite for selection evidence.",
      providerApiCalled: false,
      rawToolResultsRetained: false,
      semanticCountsRetained: true,
      secretsRequired: false,
    },
  };
}
