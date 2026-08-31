import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import {
  assertPinnedWebmcpEvalsVersion,
  BROWSER_EVAL_REPORTERS,
  browserEvalChildEnvironment,
  buildBrowserEvalArguments,
  CHROME_CHANNEL,
  DEFAULT_BROWSER_EVAL_RUNS,
  createSmokeReceipt,
  EXPECTED_RESULT_SCHEMAS,
  EXPECTED_TOOL_NAMES,
  MAX_BROWSER_AGENT_STEPS,
  MAX_BROWSER_EVAL_RUNS,
  observeOllamaLoadedModel,
  parseBrowserEvalConfiguration,
  PINNED_WEBMCP_EVALS_VERSION,
  preflightOllamaModel,
  resolveLoopbackOllamaHost,
  resolveStaticPath,
  validateBrowserFixture,
  validateSmokeEvaluation,
  validateSmokeFixture,
  withoutProviderCredentials,
} from "../../scripts/lib/webmcp-evals-harness.mjs";
import {
  assertBrowserReportByteLength,
  createBrowserEvalReceipt,
  MAX_BROWSER_REPORT_BYTES,
  MAX_BROWSER_REPORTED_STEPS_PER_CASE,
  validateBrowserEvaluationReport,
} from "../../scripts/run-webmcp-evals-browser.mjs";
import {
  fetchPublicDeploymentMetadata,
  parseDevtoolsCaptureTarget,
  PUBLIC_CAPTURE_TARGET,
  validatePublicDeploymentMetadata,
} from "../../scripts/lib/chrome-devtools-capture-target.mjs";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("browser evals cover every tool, all four federated collections, privacy minimisation and no-call selection", async () => {
  const browserCases = await readJson("evals/webmcp-browser.json");
  const smokeCases = await readJson("evals/webmcp-smoke.json");

  assert.equal(browserCases.length, 8);
  assert.deepEqual(
    browserCases.slice(0, 3).map(({ name, expectedCall }) => ({ name, expectedCall })),
    smokeCases.map(({ name, expectedCall }) => ({ name, expectedCall })),
  );

  assert.equal(browserCases.filter(({ expectedCall }) => Array.isArray(expectedCall) && expectedCall.length > 1).length, 2);
  assert.equal(browserCases.filter(({ expectedCall }) => expectedCall === null).length, 1);

  const calls = smokeCases.flatMap(({ expectedCall }) => expectedCall);
  assert.deepEqual([...new Set(calls.map(({ functionName }) => functionName))].sort(), [...EXPECTED_TOOL_NAMES].sort());
  const privacyCase = browserCases.find(({ name }) => name.startsWith("Minimise context"));
  assert.deepEqual(privacyCase.expectedCall, [{
    functionName: "search_government_knowledge",
    arguments: { query: "flooding", collections: ["deep-evidence"], limit: 3 },
  }]);
  assert.equal(EXPECTED_RESULT_SCHEMAS.search_government_knowledge, "trusted-govuk-discovery.search-result.v2");
  assert.equal(
    JSON.stringify(privacyCase.expectedCall[0].arguments).match(/postcode|location|email|preference/giu),
    null,
  );
  const directedCases = browserCases.slice(3, 7);
  assert.deepEqual(
    directedCases.map(({ expectedCall }) => expectedCall[0]),
    [
      {
        functionName: "search_government_knowledge",
        arguments: { query: "driver vehicle licensing agency", collections: ["uk-living"], limit: 3 },
      },
      {
        functionName: "search_government_knowledge",
        arguments: { query: "special workplace statistics", collections: ["ons"], limit: 3 },
      },
      {
        functionName: "search_government_knowledge",
        arguments: { query: "bank holidays", collections: ["government-apis"], limit: 3 },
      },
      {
        functionName: "search_government_knowledge",
        arguments: { query: "1862 property ownership records released", collections: ["land-registry"], limit: 3 },
      },
    ],
  );
  const directedArguments = directedCases.flatMap(({ expectedCall }) =>
    expectedCall.map(({ arguments: arguments_ }) => arguments_));
  const prohibitedArgumentKeys = new Set([
    "postcode", "location", "email", "preference", "profile", "history", "address", "owner", "personalContext",
  ]);
  assert.ok(directedArguments.every((arguments_) =>
    Object.keys(arguments_).every((key) => !prohibitedArgumentKeys.has(key))));
  assert.ok(directedArguments.every(({ collections }) => !collections.includes("legislation")));
  assert.match(browserCases[0].messages[0].content, /search_government_knowledge.*get_resource_record.*show_provenance/u);
  assert.match(browserCases[1].messages[0].content, /explore_answer_foundations.*compare_evidence_foundations/u);
  for (const evalCase of browserCases.slice(2, 7)) {
    const expected = evalCase.expectedCall[0];
    assert.match(evalCase.messages[0].content, /call search_government_knowledge exactly once/iu);
    assert.ok(evalCase.messages[0].content.includes(`machine token \`${expected.arguments.collections[0]}\``));
    assert.match(evalCase.messages[0].content, /omit resourceTypes, publishers and accessStatuses rather than sending empty arrays/u);
  }
  assert.deepEqual(validateBrowserFixture(browserCases), {
    caseCount: 8,
    expectedStepCount: 10,
    noCallCaseCount: 1,
    toolNames: [...EXPECTED_TOOL_NAMES].sort(),
  });
});

test("smoke fixture validation rejects missing tools and unrelated context fields", async () => {
  const fixture = await readJson("evals/webmcp-smoke.json");
  assert.deepEqual(validateSmokeFixture(fixture), {
    caseCount: 3,
    expectedStepCount: 6,
    toolNames: [...EXPECTED_TOOL_NAMES].sort(),
  });

  const missing = structuredClone(fixture);
  missing[1].expectedCall.pop();
  assert.throws(() => validateSmokeFixture(missing), /does not exercise: compare_evidence_foundations/u);

  const unrelated = structuredClone(fixture);
  unrelated[2].expectedCall[0].arguments.postcode = "TEST 1AA";
  assert.throws(() => validateSmokeFixture(unrelated), /includes an unrelated argument: postcode/u);
});

test("smoke semantic validation rejects structured error envelopes that upstream reports as pass", async () => {
  const fixture = await readJson("evals/webmcp-smoke.json");
  const calls = fixture.flatMap(({ expectedCall }) => expectedCall);
  const evaluation = {
    testCount: fixture.length,
    totalExpectedSteps: calls.length,
    passCount: calls.length,
    errorCount: 0,
    results: calls.map((call, index) => ({
      ...call,
      testName: `Case ${index + 1}`,
      stepIndex: index + 1,
      outcome: "pass",
      result: {
        ok: true,
        schema: EXPECTED_RESULT_SCHEMAS[call.functionName],
      },
    })),
  };
  assert.equal(validateSmokeEvaluation(evaluation, fixture).passCount, 6);

  const structuredFailure = structuredClone(evaluation);
  structuredFailure.results[0].result = {
    ok: false,
    schema: "trusted-govuk-discovery.error.v1",
    error: { code: "INVALID_INPUT", message: "Synthetic failure" },
  };
  assert.throws(
    () => validateSmokeEvaluation(structuredFailure, fixture),
    /did not return the expected successful/u,
  );
});

test("runner is pinned to webmcp-evals 0.0.4 and installed Chrome stable", () => {
  assert.equal(PINNED_WEBMCP_EVALS_VERSION, "0.0.4");
  assert.equal(CHROME_CHANNEL, "chrome");
  assert.doesNotThrow(() => assertPinnedWebmcpEvalsVersion("0.0.4"));
  assert.throws(() => assertPinnedWebmcpEvalsVersion("0.0.5"), /Expected webmcp-evals 0\.0\.4/u);
});

test("package scripts expose the deterministic evaluator and isolated DevTools capture", async () => {
  const packageValue = await readJson("package.json");
  const gitignore = await readFile(".gitignore", "utf8");
  assert.equal(
    packageValue.scripts["webmcp:eval:smoke"],
    "node scripts/run-webmcp-evals-smoke.mjs",
  );
  assert.equal(
    packageValue.scripts["webmcp:devtools:capture"],
    "npm run build && node scripts/capture-chrome-devtools-webmcp.mjs",
  );
  assert.equal(
    packageValue.scripts["webmcp:eval:browser"],
    "node scripts/run-webmcp-evals-browser.mjs",
  );
  assert.equal(
    packageValue.scripts["webmcp:explorer:setup"],
    "bash scripts/setup-webmcp-explorer.sh",
  );
  assert.equal(packageValue.devDependencies["webmcp-evals"], "0.0.4");
  assert.equal(packageValue.devDependencies["chrome-devtools-mcp"], "1.8.0");
  assert.deepEqual(packageValue.allowScripts, {
    "@google/genai": false,
    fsevents: false,
    protobufjs: false,
  });
  assert.match(gitignore, /^\.evals\/$/mu);

  for (const path of [".github/workflows/ci.yml", ".github/workflows/pages.yml"]) {
    const workflow = await readFile(path, "utf8");
    assert.match(workflow, /npm ci --ignore-scripts --no-audit/u);
    assert.match(workflow, /run: npm run webmcp:eval:smoke/u);
    if (path.endsWith("ci.yml")) {
      assert.match(workflow, /\.evals\/webmcp-smoke-receipt\.json/u);
    }
  }
});

test("Explorer setup is pinned, locked and stops before browser or provider configuration", async () => {
  const source = await readFile("scripts/setup-webmcp-explorer.sh", "utf8");
  assert.match(source, /PINNED_COMMIT="f7091c12420e713b11361630dc1649d5678f62ab"/u);
  assert.match(source, /BUILD_DIRECTORY="\$\{TOOLS_DIRECTORY\}\/webmcp-explorer-build"/u);
  assert.match(source, /status --porcelain --untracked-files=all/u);
  assert.match(source, /archive "\$\{PINNED_COMMIT\}:webmcp-explorer"/u);
  assert.match(source, /npm --prefix "\$\{BUILD_DIRECTORY\}" ci --ignore-scripts --no-audit/u);
  assert.match(source, /npm --prefix "\$\{BUILD_DIRECTORY\}" run build/u);
  assert.match(source, /must not be a symbolic link/u);
  assert.match(source, /build input contains an unexpected symbolic link/u);
  assert.match(source, /Package lock SHA-256/u);
  assert.match(source, /Unpacked-extension file-manifest SHA-256/u);
  assert.match(source, /non-regular unpacked-extension entry/u);
  assert.match(source, /unexpected unpacked-extension file set/u);
  assert.doesNotMatch(source, /about:\/\/extensions|chrome:\/\/extensions|open -a|osascript/iu);
  assert.match(source, /did not load the extension/u);
});

test("DevTools capture uses a clean bounded browser and keeps the receipt local by default", async () => {
  const source = await readFile("scripts/capture-chrome-devtools-webmcp.mjs", "utf8");
  const targetSource = await readFile("scripts/lib/chrome-devtools-capture-target.mjs", "utf8");
  const browserEvalSource = await readFile("scripts/run-webmcp-evals-browser.mjs", "utf8");
  const smokeSource = await readFile("scripts/run-webmcp-evals-smoke.mjs", "utf8");
  assert.match(targetSource, /receiptName: "chrome-devtools-mcp\.json"/u);
  assert.match(targetSource, /receiptName: "chrome-devtools-mcp-public\.json"/u);
  assert.match(source, /captureTarget\.receiptName/u);
  assert.match(source, /captureTarget\.mode === "local"/u);
  assert.match(source, /fetchPublicDeploymentMetadata/u);
  assert.match(source, /deploymentMetadataValidated: publicDeployment !== null/u);
  assert.match(source, /--isolated=true/u);
  assert.match(source, /--allowed-url-pattern=/u);
  assert.match(source, /--no-usage-statistics/u);
  assert.match(source, /CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS: "1"/u);
  assert.match(source, /--no-performance-crux/u);
  assert.match(source, /--redact-network-headers=true/u);
  assert.match(source, /--no-category-extensions/u);
  assert.match(source, /remoteProviderCalled: false/u);
  assert.match(source, /exact closed application input schema/u);
  assert.match(source, /untrusted-content annotations/u);
  assert.match(source, /list_console_messages/u);
  assert.match(source, /Object\.keys\(consoleState\)\.length === 0/u);
  assert.match(source, /emitted \$\{consoleErrors\.length\} console error/u);
  assert.match(source, /timeout: CLI_TIMEOUT_MS/u);
  assert.match(source, /server\.kill\("SIGKILL"\)/u);
  assert.match(source, /personalContext: "synthetic context that the page contract must reject"/u);
  assert.match(source, /invalid personal-context field did not fail closed/u);
  assert.match(source, /schema: "trusted-govuk-discovery\.search-result\.v2"/u);
  assert.match(source, /collections: \["deep-evidence"\]/u);
  for (const runner of [browserEvalSource, smokeSource]) {
    assert.match(runner, /process\.kill\(-child\.pid, signal\)/u);
    assert.match(runner, /timedOut/u);
  }
  assert.equal(
    [...browserEvalSource.matchAll(/preflightOllamaModel\(configuration\)/gu)].length,
    2,
  );
  assert.match(browserEvalSource, /localModelInventoryAfter = await preflightOllamaModel/u);
  assert.match(browserEvalSource, /localModelLoadedAfter = await observeOllamaLoadedModel/u);
  assert.match(browserEvalSource, /receipt\.execution\.failurePhase === "model-postflight"/u);
  assert.match(browserEvalSource, /govuk-webmcp-browser-home-/u);
  assert.match(smokeSource, /govuk-webmcp-smoke-home-/u);
});

test("DevTools public capture target is exactly allowlisted and has a separate receipt", () => {
  assert.deepEqual(parseDevtoolsCaptureTarget({}), {
    mode: "local",
    publicTarget: false,
    targetUrl: null,
    expectedCommit: null,
    receiptName: "chrome-devtools-mcp.json",
  });
  const commit = "a".repeat(40);
  assert.deepEqual(parseDevtoolsCaptureTarget({
    WEBMCP_DEVTOOLS_TARGET_URL: "https://chris-page-gov.github.io/govuk-webmcp",
    WEBMCP_EXPECTED_COMMIT: commit,
  }), {
    mode: "public",
    publicTarget: true,
    targetUrl: PUBLIC_CAPTURE_TARGET,
    expectedCommit: commit,
    receiptName: "chrome-devtools-mcp-public.json",
  });

  for (const target of [
    "http://chris-page-gov.github.io/govuk-webmcp/",
    "https://chris-page-gov.github.io/govuk-webmcp/extra",
    "https://chris-page-gov.github.io/govuk-webmcp/?query=one",
    "https://chris-page-gov.github.io/govuk-webmcp/#fragment",
    "https://example.invalid/govuk-webmcp/",
  ]) {
    assert.throws(
      () => parseDevtoolsCaptureTarget({ WEBMCP_DEVTOOLS_TARGET_URL: target }),
      /must be exactly/u,
    );
  }
  assert.throws(
    () => parseDevtoolsCaptureTarget({ WEBMCP_EXPECTED_COMMIT: commit }),
    /accepted only with the allowlisted public target/u,
  );
  assert.throws(
    () => parseDevtoolsCaptureTarget({
      WEBMCP_DEVTOOLS_TARGET_URL: PUBLIC_CAPTURE_TARGET,
      WEBMCP_EXPECTED_COMMIT: "A".repeat(40),
    }),
    /lowercase 40-character Git commit/u,
  );
});

test("DevTools public capture validates and digests exact deployment metadata", async () => {
  const commit = "b".repeat(40);
  const metadata = {
    schema: "trusted-govuk-discovery.deployment.v1",
    repository: "chris-page-gov/govuk-webmcp",
    commit,
    runId: "33333333333",
  };
  assert.deepEqual(validatePublicDeploymentMetadata(metadata, commit), metadata);
  assert.throws(
    () => validatePublicDeploymentMetadata({ ...metadata, runId: 33333333333 }, commit),
    /invalid run ID/u,
  );
  assert.throws(
    () => validatePublicDeploymentMetadata({ ...metadata, unexpected: true }, commit),
    /unknown or missing fields/u,
  );
  assert.throws(
    () => validatePublicDeploymentMetadata(metadata, "c".repeat(40)),
    /does not match WEBMCP_EXPECTED_COMMIT/u,
  );

  let requestedUrl;
  let requestedOptions;
  const body = `${JSON.stringify(metadata, null, 2)}\n`;
  const binding = await fetchPublicDeploymentMetadata({
    expectedCommit: commit,
    fetchImplementation: async (url, options) => {
      requestedUrl = url;
      requestedOptions = options;
      return { ok: true, status: 200, text: async () => body };
    },
  });
  assert.equal(requestedUrl, `${PUBLIC_CAPTURE_TARGET}deployment.json`);
  assert.deepEqual(requestedOptions, {
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
  });
  assert.deepEqual(binding.metadata, metadata);
  assert.match(binding.sha256, /^[a-f0-9]{64}$/u);
  assert.equal(binding.url, requestedUrl);
});

test("smoke subprocess environment does not receive model-provider credentials", () => {
  const original = {
    PATH: "/usr/bin",
    OPENAI_API_KEY: "secret-a",
    ANTHROPIC_API_KEY: "secret-b",
    GEMINI_API_KEY: "secret-c",
    GOOGLE_AI: "secret-d",
    RANDOM_SECRET: "secret-e",
  };
  const sanitised = withoutProviderCredentials(original);
  assert.equal(sanitised.PATH, "/usr/bin");
  assert.equal(sanitised.OPENAI_API_KEY, undefined);
  assert.equal(sanitised.ANTHROPIC_API_KEY, undefined);
  assert.equal(sanitised.GEMINI_API_KEY, undefined);
  assert.equal(sanitised.GOOGLE_AI, undefined);
  assert.equal(sanitised.RANDOM_SECRET, undefined);
  assert.equal(sanitised.NO_COLOR, "1");
  assert.equal(original.OPENAI_API_KEY, "secret-a");
});

test("browser model configuration is explicit, provider-prefixed and run-bounded", () => {
  assert.equal(DEFAULT_BROWSER_EVAL_RUNS, 3);
  assert.equal(MAX_BROWSER_EVAL_RUNS, 10);
  assert.equal(MAX_BROWSER_AGENT_STEPS, 6);
  assert.throws(() => parseBrowserEvalConfiguration({}), /Set WEBMCP_EVAL_MODEL explicitly/u);
  assert.throws(
    () => parseBrowserEvalConfiguration({ WEBMCP_EVAL_MODEL: "gpt-5" }),
    /allowed provider prefix/u,
  );
  assert.throws(
    () => parseBrowserEvalConfiguration({ WEBMCP_EVAL_MODEL: "ollama:qwen2.5", WEBMCP_EVAL_RUNS: "11" }),
    /integer from 1 to 10/u,
  );
  assert.throws(
    () => parseBrowserEvalConfiguration({ WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b" }),
    /WEBMCP_EVAL_PRESENTATION_APPROVED=1/u,
  );
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
  });
  assert.equal(configuration.backend, "vercel");
  assert.equal(configuration.providerClass, "local-loopback");
  assert.equal(configuration.presentationApproved, true);
  assert.equal(configuration.runs, 3);
});

test("remote browser evaluation requires a deliberate approval and expected credential", () => {
  assert.throws(
    () => parseBrowserEvalConfiguration({
      WEBMCP_EVAL_MODEL: "anthropic:claude-sonnet-4-5",
      WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    }),
    /WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1/u,
  );
  assert.throws(
    () => parseBrowserEvalConfiguration({
      WEBMCP_EVAL_MODEL: "openai:gpt-5-mini",
      WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
      WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
    }),
    /openai provider credential is not configured/u,
  );
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "google:gemini-2.5-flash",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
    GOOGLE_AI: "not-recorded",
    WEBMCP_EVAL_RUNS: "2",
  });
  assert.equal(configuration.provider, "google");
  assert.equal(configuration.providerClass, "remote");
  assert.equal(configuration.credentialName, "GOOGLE_AI");
  assert.equal(configuration.runs, 2);
});

test("Ollama is constrained to loopback and its exact model is preflighted without download", async () => {
  assert.deepEqual(resolveLoopbackOllamaHost("http://localhost:11434/v1"), {
    apiOrigin: "http://localhost:11434",
    vercelBaseUrl: "http://localhost:11434/v1",
  });
  assert.throws(() => resolveLoopbackOllamaHost("https://localhost:11434"), /must use HTTP/u);
  assert.throws(() => resolveLoopbackOllamaHost("http://192.0.2.1:11434"), /127\.0\.0\.1/u);
  assert.throws(() => resolveLoopbackOllamaHost("http://localhost:11434/private"), /optional \/v1 path/u);

  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    OLLAMA_HOST: "http://127.0.0.1:11434",
  });
  let requestedUrl;
  let requestedOptions;
  const inventoryIdentity = await preflightOllamaModel(configuration, async (url, options) => {
    requestedUrl = url;
    requestedOptions = options;
    return {
      ok: true,
      json: async () => ({
        models: [{
          name: "qwen2.5:14b",
          model: "qwen2.5:14b",
          digest: `sha256:${"A".repeat(64)}`,
        }],
      }),
    };
  });
  assert.equal(requestedUrl, "http://127.0.0.1:11434/api/tags");
  assert.equal(requestedOptions.redirect, "error");
  assert.deepEqual(inventoryIdentity, { name: "qwen2.5:14b", digest: "a".repeat(64) });
  assert.equal(Object.isFrozen(inventoryIdentity), true);
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({ models: [{ name: "different:latest", digest: "b".repeat(64) }] }),
    })),
    /exact Ollama model qwen2\.5:14b is not installed/u,
  );
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [{ name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "short" }],
      }),
    })),
    /no validated inventory digest/u,
  );
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [
          { name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "a".repeat(64) },
          { name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "b".repeat(64) },
        ],
      }),
    })),
    /ambiguous inventory identity/u,
  );
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [{
          name: "qwen2.5:14b",
          model: "different:14b",
          digest: "a".repeat(64),
        }],
      }),
    })),
    /no validated inventory identity/u,
  );
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [{
          name: "qwen2.5:14b",
          model: "qwen2.5:14b",
          digest: "a".repeat(64),
          remote_model: "qwen2.5:14b",
          remote_host: "https://ollama.com",
        }],
      }),
    })),
    /is remote-backed/u,
  );
  await assert.rejects(
    preflightOllamaModel(configuration, async () => ({
      ok: true,
      json: async () => ({ models: [], path: "/private/model" }),
    })),
    /not a bounded models array/u,
  );
  let remoteFetchCalled = false;
  const remoteConfiguration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "openai:gpt-5-mini",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
    OPENAI_API_KEY: "not-recorded",
  });
  assert.equal(await preflightOllamaModel(remoteConfiguration, async () => {
    remoteFetchCalled = true;
  }), null);
  assert.equal(remoteFetchCalled, false);
});

test("Ollama loaded-model observation is exact, bounded and identity-only", async () => {
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
  });
  let requestedUrl;
  let requestedOptions;
  const loadedIdentity = await observeOllamaLoadedModel(configuration, async (url, options) => {
    requestedUrl = url;
    requestedOptions = options;
    return {
      ok: true,
      json: async () => ({
        models: [{
          name: "qwen2.5:14b",
          model: "qwen2.5:14b",
          digest: `sha256:${"A".repeat(64)}`,
          size: 1,
          size_vram: 1,
          expires_at: "2026-08-31T01:00:00Z",
        }],
      }),
    };
  });
  assert.equal(requestedUrl, "http://127.0.0.1:11434/api/ps");
  assert.equal(requestedOptions.redirect, "error");
  assert.deepEqual(loadedIdentity, { name: "qwen2.5:14b", digest: "a".repeat(64) });
  assert.equal(Object.isFrozen(loadedIdentity), true);
  assert.deepEqual(Object.keys(loadedIdentity).sort(), ["digest", "name"]);

  await assert.rejects(
    observeOllamaLoadedModel(configuration, async () => ({
      ok: true,
      json: async () => ({ models: [] }),
    })),
    /was not reported as loaded/u,
  );
  await assert.rejects(
    observeOllamaLoadedModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [
          { name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "a".repeat(64) },
          { name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "b".repeat(64) },
        ],
      }),
    })),
    /ambiguous loaded identity/u,
  );
  for (const models of [
    [{ name: "qwen2.5:14b", model: "qwen2.5:14b", digest: "short" }],
    [{ name: "qwen2.5:14b", model: "different:14b", digest: "a".repeat(64) }],
  ]) {
    await assert.rejects(
      observeOllamaLoadedModel(configuration, async () => ({
        ok: true,
        json: async () => ({ models }),
      })),
      /no validated loaded digest/u,
    );
  }
  await assert.rejects(
    observeOllamaLoadedModel(configuration, async () => ({
      ok: true,
      json: async () => ({
        models: [{
          name: "qwen2.5:14b",
          model: "qwen2.5:14b",
          digest: "a".repeat(64),
          remote_model: "qwen2.5:14b",
        }],
      }),
    })),
    /reported as remote-backed/u,
  );
  await assert.rejects(
    observeOllamaLoadedModel(configuration, async () => ({
      ok: true,
      json: async () => ({ models: [], path: "/private/model" }),
    })),
    /not a bounded models array/u,
  );
  await assert.rejects(
    observeOllamaLoadedModel(configuration, async () => ({
      ok: true,
      json: async () => ({ models: Array.from({ length: 257 }, () => ({})) }),
    })),
    /not a bounded models array/u,
  );

  const remoteConfiguration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "openai:gpt-5-mini",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
    OPENAI_API_KEY: "not-recorded",
  });
  let remoteFetchCalled = false;
  assert.equal(await observeOllamaLoadedModel(remoteConfiguration, async () => {
    remoteFetchCalled = true;
  }), null);
  assert.equal(remoteFetchCalled, false);
});

test("browser evaluator receives only a minimal provider environment", () => {
  const remoteEnvironment = {
    PATH: "/usr/bin",
    HOME: "/Users/example",
    OPENAI_API_KEY: "required-secret",
    ANTHROPIC_API_KEY: "unrelated-secret",
    RANDOM_SECRET: "never-forward",
  };
  const remoteConfiguration = parseBrowserEvalConfiguration({
    ...remoteEnvironment,
    WEBMCP_EVAL_MODEL: "openai:gpt-5-mini",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
  });
  const childEnvironment = browserEvalChildEnvironment(remoteEnvironment, remoteConfiguration);
  assert.equal(childEnvironment.OPENAI_API_KEY, "required-secret");
  assert.equal(childEnvironment.ANTHROPIC_API_KEY, undefined);
  assert.equal(childEnvironment.RANDOM_SECRET, undefined);
  assert.equal(childEnvironment.NO_COLOR, "1");

  const ollamaConfiguration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
  });
  assert.equal(
    browserEvalChildEnvironment({ PATH: "/usr/bin" }, ollamaConfiguration).OLLAMA_HOST,
    "http://127.0.0.1:11434/v1",
  );
});

test("browser CLI uses the live fixture, stable Chrome and all reporters as its final option", () => {
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
  });
  const arguments_ = buildBrowserEvalArguments({
    configuration,
    cliPath: "/repo/node_modules/webmcp-evals/dist/bin/webmcp-evals.js",
    fixturePath: "/repo/evals/webmcp-browser.json",
    outputDirectory: "/repo/.evals/webmcp-browser/run",
    targetUrl: "http://127.0.0.1:43210/",
  });
  assert.equal(arguments_[0], "/repo/node_modules/webmcp-evals/dist/bin/webmcp-evals.js");
  assert.equal(arguments_[arguments_.indexOf("--backend") + 1], "vercel");
  assert.equal(arguments_[arguments_.indexOf("--chrome-channel") + 1], "chrome");
  assert.equal(arguments_[arguments_.indexOf("--max-steps") + 1], "6");
  assert.deepEqual(arguments_.slice(-4), ["--reporter", ...BROWSER_EVAL_REPORTERS]);
  assert.equal(arguments_.includes("--open"), false);
  assert.equal(arguments_.includes("--analyze"), false);
});

test("browser receipt records versions and report digests without credentials", () => {
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "anthropic:claude-sonnet-4-5",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED: "1",
    ANTHROPIC_API_KEY: "must-not-appear",
  });
  const receipt = createBrowserEvalReceipt({
    applicationPackage: { name: "govuk-webmcp", version: "0.2.0" },
    browserVersion: "Google Chrome 152.0.7977.64",
    fixtureSha256: "c".repeat(64),
    commandResult: { exitCode: 0, signal: null, timedOut: false },
    configuration,
    createdAt: "2026-08-30T12:00:00.000Z",
    evaluation: {
      browserConsoleErrorCount: 0,
      testCount: 12,
      passCount: 18,
      failCount: 0,
      errorCount: 0,
    },
    failurePhase: null,
    fixtureSummary: {
      caseCount: 4,
      expectedStepCount: 6,
      noCallCaseCount: 1,
      toolNames: [...EXPECTED_TOOL_NAMES].sort(),
    },
    reports: [
      { format: "json", path: "report-1.json", bytes: 123, sha256: "a".repeat(64) },
      { format: "html", path: "report-1.html", bytes: 456, sha256: "b".repeat(64) },
    ],
  });
  assert.equal(receipt.status, "passed");
  assert.equal(receipt.schema, "trusted-govuk-discovery.webmcp-evals-browser-receipt.v2");
  assert.equal(receipt.model.providerClass, "remote");
  assert.equal(receipt.model.localInventory, null);
  assert.equal(receipt.model.presentationApproved, true);
  assert.equal(receipt.runner.webmcpEvalsVersion, "0.0.4");
  assert.equal(receipt.fixture.sha256, "c".repeat(64));
  assert.equal(receipt.assurance.autoAnalysisRun, false);
  assert.equal(receipt.assurance.autoOpenUsed, false);
  assert.equal(receipt.assurance.browserConsoleErrorsAccepted, false);
  assert.equal(receipt.reports[0].sha256, "a".repeat(64));
  assert.equal(JSON.stringify(receipt).includes("must-not-appear"), false);
  assert.equal(JSON.stringify(receipt).includes("ANTHROPIC_API_KEY"), false);
  assert.throws(
    () => createBrowserEvalReceipt({
      applicationPackage: { name: "govuk-webmcp", version: "0.2.0" },
      browserVersion: "Google Chrome 152.0.7977.64",
      fixtureSha256: "c".repeat(64),
      commandResult: { exitCode: 0, signal: null, timedOut: false },
      configuration,
      createdAt: "2026-08-30T12:00:00.000Z",
      evaluation: {
        browserConsoleErrorCount: 0,
        testCount: 12,
        passCount: 18,
        failCount: 0,
        errorCount: 0,
      },
      failurePhase: null,
      fixtureSummary: {
        caseCount: 4,
        expectedStepCount: 6,
        noCallCaseCount: 1,
        toolNames: [...EXPECTED_TOOL_NAMES].sort(),
      },
      localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      reports: [],
    }),
    /remote provider receipt must not contain a local model identity/u,
  );
});

test("browser receipt binds stable before and after local model identities without local paths", () => {
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:gpt-oss:20b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
  });
  const base = {
    applicationPackage: { name: "govuk-webmcp", version: "0.2.0" },
    browserVersion: "Google Chrome 152.0.7977.64",
    fixtureSha256: "c".repeat(64),
    commandResult: { exitCode: 0, signal: null, timedOut: false },
    configuration,
    createdAt: "2026-08-30T12:00:00.000Z",
    evaluation: {
      browserConsoleErrorCount: 0,
      testCount: 24,
      passCount: 33,
      failCount: 0,
      errorCount: 0,
    },
    failurePhase: null,
    fixtureSummary: {
      caseCount: 8,
      expectedStepCount: 10,
      noCallCaseCount: 1,
      toolNames: [...EXPECTED_TOOL_NAMES].sort(),
    },
    reports: [],
  };
  const receipt = createBrowserEvalReceipt({
    ...base,
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelLoadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
  });
  assert.equal(receipt.status, "passed");
  assert.equal(receipt.execution.failurePhase, null);
  assert.deepEqual(receipt.model.localInventory, {
    before: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    after: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    loadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    stable: true,
    executionBound: true,
  });
  assert.equal(JSON.stringify(receipt).includes("/Users/"), false);

  const changed = createBrowserEvalReceipt({
    ...base,
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: { name: "gpt-oss:20b", digest: "2".repeat(64) },
    localModelLoadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
  });
  assert.equal(changed.status, "failed");
  assert.equal(changed.execution.failurePhase, "model-postflight");
  assert.equal(changed.model.localInventory.stable, false);
  assert.equal(changed.model.localInventory.executionBound, false);

  const loadedMismatch = createBrowserEvalReceipt({
    ...base,
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelLoadedAfter: { name: "gpt-oss:20b", digest: "2".repeat(64) },
  });
  assert.equal(loadedMismatch.status, "failed");
  assert.equal(loadedMismatch.execution.failurePhase, "model-postflight");
  assert.equal(loadedMismatch.model.localInventory.stable, true);
  assert.equal(loadedMismatch.model.localInventory.executionBound, false);

  const unavailable = createBrowserEvalReceipt({
    ...base,
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: null,
    localModelLoadedAfter: null,
  });
  assert.equal(unavailable.status, "failed");
  assert.equal(unavailable.execution.failurePhase, "model-postflight");
  assert.deepEqual(unavailable.model.localInventory.after, null);
  assert.deepEqual(unavailable.model.localInventory.loadedAfter, null);
  assert.equal(unavailable.model.localInventory.executionBound, false);

  const notLoaded = createBrowserEvalReceipt({
    ...base,
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelLoadedAfter: null,
  });
  assert.equal(notLoaded.status, "failed");
  assert.equal(notLoaded.execution.failurePhase, "model-postflight");
  assert.equal(notLoaded.model.localInventory.stable, true);
  assert.equal(notLoaded.model.localInventory.executionBound, false);

  const failedRun = createBrowserEvalReceipt({
    ...base,
    commandResult: { exitCode: 1, signal: null, timedOut: false },
    evaluation: null,
    failurePhase: "evaluate",
    localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    localModelInventoryAfter: null,
    localModelLoadedAfter: null,
  });
  assert.equal(failedRun.status, "failed");
  assert.equal(failedRun.execution.failurePhase, "evaluate");
  assert.equal(failedRun.execution.command.exitCode, 1);
  assert.equal(failedRun.model.localInventory.stable, false);

  assert.throws(
    () => createBrowserEvalReceipt({
      ...base,
      localModelInventoryBefore: {
        name: "gpt-oss:20b",
        digest: "1".repeat(64),
        path: "/private/model",
      },
      localModelInventoryAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      localModelLoadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    }),
    /inventory before identity is missing or invalid/u,
  );
  assert.throws(
    () => createBrowserEvalReceipt({
      ...base,
      localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      localModelInventoryAfter: { name: "different:20b", digest: "1".repeat(64) },
      localModelLoadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    }),
    /inventory after identity is missing or invalid/u,
  );
  assert.throws(
    () => createBrowserEvalReceipt({
      ...base,
      localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      localModelLoadedAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
    }),
    /inventory after identity is missing or invalid/u,
  );
  assert.throws(
    () => createBrowserEvalReceipt({
      ...base,
      localModelInventoryBefore: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      localModelInventoryAfter: { name: "gpt-oss:20b", digest: "1".repeat(64) },
      localModelLoadedAfter: {
        name: "gpt-oss:20b",
        digest: "1".repeat(64),
        path: "/private/model",
      },
    }),
    /inventory loaded-after identity is missing or invalid/u,
  );
});

test("browser report validation requires exact successful results and no-call behaviour", async () => {
  const configuration = parseBrowserEvalConfiguration({
    WEBMCP_EVAL_MODEL: "ollama:qwen2.5:14b",
    WEBMCP_EVAL_PRESENTATION_APPROVED: "1",
    WEBMCP_EVAL_RUNS: "1",
  });
  const fixture = await readJson("evals/webmcp-browser.json");
  const fixtureSummary = validateBrowserFixture(fixture);
  const reportRows = fixture.flatMap((evalCase) => {
    if (evalCase.expectedCall === null) {
      return [{
        test: evalCase,
        response: { text: "4" },
        outcome: "pass",
        runIndex: 1,
        stepIndex: 1,
      }];
    }
    return evalCase.expectedCall.map((call, callIndex) => ({
      test: {
        name: evalCase.name,
        messages: evalCase.messages,
        expectedCall: [call],
      },
      response: {
        functionName: call.functionName,
        args: structuredClone(call.arguments),
        result: {
          ok: true,
          schema: EXPECTED_RESULT_SCHEMAS[call.functionName],
        },
      },
      outcome: "pass",
      runIndex: 1,
      stepIndex: callIndex + 1,
    }));
  });
  const baseReport = {
    config: {
      backend: "vercel",
      maxSteps: MAX_BROWSER_AGENT_STEPS,
      model: configuration.model,
      runs: 1,
      url: "http://127.0.0.1:43210/",
    },
    results: {
      testCount: fixtureSummary.caseCount,
      passCount: reportRows.length,
      failCount: 0,
      errorCount: 0,
      results: reportRows,
    },
  };
  assert.deepEqual(
    validateBrowserEvaluationReport(
      baseReport,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    {
      additionalStepCount: 0,
      browserConsoleErrorCount: 0,
      errorCount: 0,
      expectedStepCount: 11,
      failCount: 0,
      missingStepCount: 0,
      passCount: 11,
      reportedStepCount: 11,
      testCount: 8,
    },
  );

  const terminalCaseError = structuredClone(baseReport);
  terminalCaseError.results.results.splice(0, 3, {
    test: structuredClone(fixture[0]),
    response: null,
    outcome: "error",
    runIndex: 1,
    stepIndex: 1,
  });
  terminalCaseError.results.passCount = 8;
  terminalCaseError.results.errorCount = 1;
  assert.deepEqual(
    validateBrowserEvaluationReport(
      terminalCaseError,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    {
      additionalStepCount: 0,
      browserConsoleErrorCount: 0,
      errorCount: 1,
      expectedStepCount: 11,
      failCount: 0,
      missingStepCount: 3,
      passCount: 8,
      reportedStepCount: 9,
      testCount: 8,
    },
  );

  const boundedRetryFailure = structuredClone(baseReport);
  const failedExpectedStep = boundedRetryFailure.results.results[2];
  failedExpectedStep.outcome = "fail";
  failedExpectedStep.response = {
    functionName: "show_provenance",
    args: { recordId: "govuk-discovery:api:flood-" },
    result: {
      ok: false,
      schema: "trusted-govuk-discovery.error.v1",
      error: { code: "record_not_found", message: "Synthetic malformed identifier" },
    },
  };
  const additionalRetry = structuredClone(failedExpectedStep);
  additionalRetry.test.expectedCall = null;
  additionalRetry.response = {
    functionName: "show_provenance",
    args: { recordId: "govuk-discovery:api:flood-monitoring" },
    result: {
      ok: true,
      schema: EXPECTED_RESULT_SCHEMAS.show_provenance,
    },
  };
  additionalRetry.stepIndex = 4;
  boundedRetryFailure.results.results.splice(3, 0, additionalRetry);
  boundedRetryFailure.results.passCount = 10;
  boundedRetryFailure.results.failCount = 2;
  assert.deepEqual(
    validateBrowserEvaluationReport(
      boundedRetryFailure,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    {
      additionalStepCount: 1,
      browserConsoleErrorCount: 0,
      errorCount: 0,
      expectedStepCount: 11,
      failCount: 2,
      missingStepCount: 0,
      passCount: 10,
      reportedStepCount: 12,
      testCount: 8,
    },
  );

  const dishonestOutcomeTotals = structuredClone(boundedRetryFailure);
  dishonestOutcomeTotals.results.passCount = 12;
  dishonestOutcomeTotals.results.failCount = 0;
  assert.throws(
    () => validateBrowserEvaluationReport(
      dishonestOutcomeTotals,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /outcome totals do not match/u,
  );

  const additionalPass = structuredClone(boundedRetryFailure);
  additionalPass.results.results[3].outcome = "pass";
  additionalPass.results.passCount = 11;
  additionalPass.results.failCount = 1;
  assert.throws(
    () => validateBrowserEvaluationReport(
      additionalPass,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /invalid additional unrequested tool step outcome/u,
  );

  const nonTerminalError = structuredClone(baseReport);
  nonTerminalError.results.results[1].outcome = "error";
  nonTerminalError.results.results[1].response = null;
  nonTerminalError.results.passCount = 10;
  nonTerminalError.results.errorCount = 1;
  assert.throws(
    () => validateBrowserEvaluationReport(
      nonTerminalError,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /invalid non-terminal error result/u,
  );

  const wrongMaxSteps = structuredClone(baseReport);
  wrongMaxSteps.config.maxSteps += 1;
  assert.throws(
    () => validateBrowserEvaluationReport(
      wrongMaxSteps,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /configuration does not match/u,
  );

  const excessiveCaseSteps = structuredClone(baseReport);
  excessiveCaseSteps.results.results[2].outcome = "fail";
  const excessiveRows = [];
  for (let stepIndex = 4; stepIndex <= MAX_BROWSER_REPORTED_STEPS_PER_CASE + 1; stepIndex += 1) {
    const extra = structuredClone(excessiveCaseSteps.results.results[2]);
    extra.test.expectedCall = null;
    extra.stepIndex = stepIndex;
    excessiveRows.push(extra);
  }
  excessiveCaseSteps.results.results.splice(3, 0, ...excessiveRows);
  excessiveCaseSteps.results.passCount = 10;
  excessiveCaseSteps.results.failCount = excessiveRows.length + 1;
  assert.throws(
    () => validateBrowserEvaluationReport(
      excessiveCaseSteps,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /exceeds the bounded tool-step allowance/u,
  );

  const excessiveTrajectory = structuredClone(baseReport);
  excessiveTrajectory.results.results[0].trajectory = Array.from(
    { length: MAX_BROWSER_AGENT_STEPS + 1 },
    () => ({}),
  );
  assert.throws(
    () => validateBrowserEvaluationReport(
      excessiveTrajectory,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /exceeds the bounded agent trajectory/u,
  );

  const consoleFailure = structuredClone(baseReport);
  consoleFailure.results.results[0].browserConsoleErrors = [{
    kind: "pageerror",
    message: "Synthetic page failure",
    toolCalls: [],
  }];
  assert.throws(
    () => validateBrowserEvaluationReport(
      consoleFailure,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /contains a browser console or page error/u,
  );

  const extraContext = structuredClone(baseReport);
  extraContext.results.results.find(({ test }) =>
    test.name === "Minimise context sent to a catalogue search").response.args.publishers = ["example"];
  assert.throws(
    () => validateBrowserEvaluationReport(
      extraContext,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /did not match the exact authored call/u,
  );

  const structuredFailure = structuredClone(baseReport);
  structuredFailure.results.results[0].response.result = {
    ok: false,
    schema: "trusted-govuk-discovery.error.v1",
    error: { code: "INVALID_INPUT", message: "Synthetic failure" },
  };
  assert.throws(
    () => validateBrowserEvaluationReport(
      structuredFailure,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /was not a successful/u,
  );

  const unexpectedCall = structuredClone(baseReport);
  unexpectedCall.results.results.at(-1).response = {
    functionName: "search_government_knowledge",
    args: { query: "2 plus 2" },
  };
  assert.throws(
    () => validateBrowserEvaluationReport(
      unexpectedCall,
      configuration,
      "http://127.0.0.1:43210/",
      fixture,
    ),
    /no-call case executed an unexpected page tool/u,
  );
});

test("browser report files have a fixed byte ceiling", () => {
  assert.doesNotThrow(() => assertBrowserReportByteLength(MAX_BROWSER_REPORT_BYTES));
  for (const byteLength of [-1, 1.5, Number.MAX_SAFE_INTEGER, MAX_BROWSER_REPORT_BYTES + 1]) {
    assert.throws(
      () => assertBrowserReportByteLength(byteLength),
      /exceeds the bounded file-size allowance/u,
    );
  }
});

test("local static path resolution stays inside dist", () => {
  const root = resolve("dist");
  assert.equal(resolveStaticPath(root, "/"), resolve(root, "index.html"));
  assert.equal(resolveStaticPath(root, "/app/main.js?cache=off"), resolve(root, "app/main.js"));
  assert.throws(() => resolveStaticPath(root, "/%2e%2e/secret"), /outside the build directory/u);
  assert.throws(() => resolveStaticPath(root, "/..%5csecret"), /outside the build directory/u);
});

test("receipt is machine-readable and states the smoke boundary", () => {
  const result = {
    exitCode: 0,
    signal: null,
    stdoutSha256: "a".repeat(64),
    stderrSha256: "b".repeat(64),
    timedOut: false,
    errorCount: 0,
    passCount: 6,
    totalExpectedSteps: 6,
  };
  const receipt = createSmokeReceipt({
    createdAt: "2026-08-30T12:00:00.000Z",
    browserVersion: "Google Chrome 152.0.7977.64",
    fixtureSha256: "c".repeat(64),
    fixtureSummary: { caseCount: 3, expectedStepCount: 6, toolNames: [...EXPECTED_TOOL_NAMES].sort() },
    buildResult: result,
    smokeResult: result,
  });
  assert.equal(receipt.status, "passed");
  assert.equal(receipt.assurance.providerApiCalled, false);
  assert.equal(receipt.assurance.rawToolResultsRetained, false);
  assert.equal(receipt.assurance.semanticCountsRetained, true);
  assert.equal(receipt.fixture.sha256, "c".repeat(64));
  assert.equal(receipt.assurance.secretsRequired, false);
  assert.match(receipt.assurance.verifies, /Tool availability plus ok:true execution/u);
  assert.match(receipt.assurance.doesNotVerify, /Agent tool selection/u);
});
