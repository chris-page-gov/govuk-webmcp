import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import {
  bindReleaseConfig,
  repositoryRoot,
  validateConfig,
} from "./build-demo-video.mjs";
import {
  assertMatchingPublicDeploymentSnapshot,
  fetchPublicDeploymentMetadata,
  PUBLIC_CAPTURE_TARGET,
} from "./lib/chrome-devtools-capture-target.mjs";
import { isLegislationHostname } from "./lib/legislation-host.mjs";
import { resolveCanonicalRepositoryPath } from "./lib/repository-relative-path.mjs";
import { placeRepositoryOutputs } from "./lib/transactional-output-placement.mjs";
import { RELEASE_EVIDENCE_PATHS } from "./lib/release-evidence-paths.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const configPath = resolve(repositoryRoot, RELEASE_EVIDENCE_PATHS.demoConfig);
const sceneDurationMilliseconds = 32_000;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function parseArguments(argv) {
  const unknown = argv.filter((argument) => argument !== "--overwrite");
  invariant(unknown.length === 0, `Unknown argument: ${unknown.join(", ")}`);
  return { overwrite: argv.includes("--overwrite") };
}

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}${capture ? `\n${result.stderr || result.stdout}` : ""}`);
  return result.stdout ?? "";
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256Canonical(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function inside(parent, candidate) {
  const fromParent = relative(parent, candidate);
  return fromParent !== "" && fromParent !== ".." && !fromParent.startsWith(`..${sep}`) && !isAbsolute(fromParent);
}

export function resolveLiveCaptureRepositoryPath(relativePath, label, options = {}) {
  return resolveCanonicalRepositoryPath(repositoryRoot, relativePath, { label, ...options });
}

function probeDuration(path) {
  const value = Number(run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path,
  ], true).trim());
  invariant(Number.isFinite(value) && value > 0, `Captured clip has no positive duration: ${path}`);
  return value;
}

async function hold(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function smoothScroll(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });
  await locator.evaluate((element) => element.scrollIntoView({ behavior: "smooth", block: "center" }));
  await hold(page, 1_200);
}

function numberFromText(value, label) {
  const parsed = Number(String(value).replaceAll(",", "").trim());
  invariant(Number.isSafeInteger(parsed) && parsed >= 0, `${label} is not a non-negative integer`);
  return parsed;
}

function toolCountsFromText(value) {
  const match = /^(\d+) registered of (\d+) expected:/u.exec(String(value).trim());
  invariant(match, "Tool diagnostics do not expose registered and expected counts");
  return {
    registered: numberFromText(match[1], "Registered tool count"),
    expected: numberFromText(match[2], "Expected tool count"),
  };
}

async function waitForVerifiedRuntime(page) {
  await page.waitForFunction(() =>
    document.documentElement.dataset.applicationState === "ready"
      && document.querySelector("#record-count")?.textContent?.trim() === "80"
      && document.querySelector("#federated-record-count")?.textContent?.trim() === "58,652"
      && document.querySelector("#federated-source-record-count")?.textContent?.trim() === "58,655"
      && document.querySelector("#federated-quarantined-count")?.textContent?.trim() === "3"
      && document.querySelector("#query") instanceof HTMLInputElement
      && !document.querySelector("#query").disabled
      && document.querySelector("#route-warning")?.hidden !== false,
  );
}

async function selectOnlyCollections(page, selected) {
  const wanted = new Set(selected);
  for (const input of await page.locator("#collection-filter input[name='collection']").all()) {
    await input.setChecked(wanted.has(await input.getAttribute("value")));
  }
}

export async function waitForRenderedSearchResult(page) {
  await page.locator("#results article.result").first().waitFor({ state: "visible" });
  const structuredResult = page.locator("#results details.structured pre");
  await structuredResult.waitFor({ state: "attached" });
  return structuredResult;
}

async function runFederatedSearch(page, inputs) {
  const filters = page.locator("details.filters");
  if (!(await filters.evaluate((element) => element.open))) await filters.locator("summary").click();
  await page.getByLabel("Search term").fill(inputs.query);
  await selectOnlyCollections(page, inputs.collections);
  await page.getByLabel("Maximum results").selectOption(String(inputs.limit));
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const structuredResult = await waitForRenderedSearchResult(page);
  const result = JSON.parse(await structuredResult.textContent());
  invariant(result.ok === true && result.schema === "trusted-govuk-discovery.search-result.v2", "The deployed four-source search did not return the combined result contract");
  invariant(JSON.stringify(result.selectedCollections) === JSON.stringify(inputs.collections), "The deployed search selected different collections");
  invariant(result.returned === result.results.length && result.returned <= inputs.limit, "The deployed search returned count is inconsistent with its limit");
  invariant(JSON.stringify([...new Set(result.results.map(({ collectionId }) => collectionId))].sort()) === JSON.stringify([...inputs.collections].sort()), "The deployed housing search did not return every selected collection");
  invariant(result.collectionStatuses.length === inputs.collections.length && result.collectionStatuses.every(({ collectionId, evidenceTier, status }) => inputs.collections.includes(collectionId) && evidenceTier === "federated-source-snapshot" && status === "ready"), "The deployed housing search did not retain four ready federated collection states");
  invariant(result.results.every(({ evidenceTier }) => evidenceTier === "federated-source-snapshot"), "The deployed four-source search returned the wrong evidence tier");
  const excluded = result.results.filter(({ canonicalHumanUrl }) => canonicalHumanUrl && isLegislationHostname(new URL(canonicalHumanUrl).hostname));
  invariant(excluded.length === 0, "The deployed housing search returned a legislation.gov.uk link");
  return result;
}

function chooseFederatedRecord(result) {
  const preferred = result.results.find(({ collectionId }) => collectionId === "land-registry") ?? result.results[0];
  invariant(preferred && typeof preferred.recordId === "string", "The frozen search has no representative federated record");
  return preferred.recordId;
}

function sceneDefinitions(config, state) {
  const inputs = config.demonstrationInputs;
  const answerRoute = `#answer=${encodeURIComponent(inputs.reviewedAnswerId)}`;
  return [
    {
      sceneId: "evidence-answer",
      route: "",
      run: async (page) => {
        await page.locator("#evidence-answer-view").waitFor({ state: "visible" });
        await smoothScroll(page, "#evidence-answer-heading");
        return {
          activeView: "guided",
          heading: (await page.locator("#evidence-answer-heading").textContent()).trim(),
          activity: (await page.locator("#evidence-answer-activity").textContent()).trim(),
          presentationState: await page.locator("#evidence-answer-view").getAttribute("data-presentation-state"),
        };
      },
    },
    {
      sceneId: "present-evidence",
      route: "#view=technical",
      run: async (page) => {
        await smoothScroll(page, "#search-heading");
        const result = await runFederatedSearch(page, inputs);
        state.searchResult = result;
        state.federatedRecordId = chooseFederatedRecord(result);
        const article = page.locator(`article.result[data-record-id="${state.federatedRecordId}"]`);
        await smoothScroll(page, `article.result[data-record-id="${state.federatedRecordId}"]`);
        await article.getByRole("button", { name: "Show evidence for this result" }).click();
        await page.locator("#evidence-answer-view").waitFor({ state: "visible" });
        await page.locator(`#evidence-answer-view[data-selection-id="${state.federatedRecordId}"]`).waitFor({ state: "visible" });
        const structured = JSON.parse(await page.locator("#evidence-answer-content details.evidence-answer__structured-result pre").textContent());
        state.evidenceDigest = await page.locator("#evidence-answer-view").getAttribute("data-evidence-digest");
        invariant(/^[a-f0-9]{64}$/u.test(state.evidenceDigest ?? ""), "Presented Evidence answer has no exact digest");
        state.presentation = structured;
        await smoothScroll(page, "#evidence-answer-content");
        return {
          query: inputs.query,
          collections: inputs.collections,
          limit: inputs.limit,
          selectedRecordId: state.federatedRecordId,
          resultKind: structured.resultKind,
          evidenceDigest: state.evidenceDigest,
          sourceCount: structured.foundations.length,
          limitationCount: structured.allLimitations.length,
          routeView: "guided",
        };
      },
    },
    {
      sceneId: "comparison-guide",
      route: "#view=guided",
      run: async (page) => {
        invariant(state.federatedRecordId && state.evidenceDigest, "Comparison guide requires the previously selected Evidence answer");
        await page.evaluate((recordId) => {
          window.location.hash = `view=guided&record=${encodeURIComponent(recordId)}`;
        }, state.federatedRecordId);
        await page.locator(`#evidence-answer-view[data-selection-id="${state.federatedRecordId}"]`).waitFor({ state: "visible" });
        const digest = await page.locator("#evidence-answer-view").getAttribute("data-evidence-digest");
        const restored = JSON.parse(await page.locator("#evidence-answer-content details.evidence-answer__structured-result pre").textContent());
        invariant(restored.acceptedInput === null, "Restored Evidence answer must not claim that a new page action was accepted");
        invariant(digest === sha256Canonical(restored), "Restored Evidence answer digest does not bind its exact evidence object");
        invariant(
          canonicalJson(restored) === canonicalJson({ ...state.presentation, acceptedInput: null }),
          "Restored Evidence answer differs from the human action beyond its accepted-input boundary",
        );
        await smoothScroll(page, ".evidence-answer__comparison-guide");
        return {
          selectedRecordId: state.federatedRecordId,
          actionEvidenceDigest: state.evidenceDigest,
          restoredEvidenceDigest: digest,
          restoredAcceptedInput: null,
          sameEvidenceExceptAcceptedInput: true,
          guideHeadings: await page.locator(".evidence-answer__comparison-guide h3").allTextContents(),
          sourceLinkCount: await page.locator(".evidence-answer__sources a").count(),
          limitationCount: state.presentation.allLimitations.length,
        };
      },
    },
    {
      sceneId: "technical-review",
      route: answerRoute,
      run: async (page) => {
        const legacyRoutePreserved = !new URL(page.url()).hash.includes("view=");
        const firstClaim = page.locator(`#analytical-index li[data-claim-id="${inputs.reviewedClaimIds[0]}"]`);
        await firstClaim.getByRole("button", { name: /Show foundations/u }).click();
        await page.locator("#foundation-panel").waitFor({ state: "visible" });
        for (const claimId of inputs.reviewedClaimIds) await page.locator(`#analytical-index input[value="${claimId}"]`).check();
        await page.getByRole("button", { name: "Compare 2 selected claims" }).click();
        await page.locator("#comparison-panel").waitFor({ state: "visible" });
        const comparisonRowCount = await page.locator("#comparison-content table tbody tr").count();
        const toolCounts = toolCountsFromText(await page.locator("#diagnostic-tools").textContent());
        await smoothScroll(page, "#comparison-content");
        return {
          activeView: "technical",
          answerId: inputs.reviewedAnswerId,
          claimIds: inputs.reviewedClaimIds,
          comparisonRowCount,
          registeredToolCount: toolCounts.registered,
          expectedToolCount: toolCounts.expected,
          trustScoreShown: (await page.locator("#foundation-panel, #comparison-panel").allTextContents()).some((text) => /trust score\s*[:=]\s*\d/iu.test(text)),
          legacyRoutePreserved,
        };
      },
    },
    {
      sceneId: "boundary",
      route: "#view=technical",
      run: async (page, requestUrls) => {
        invariant(state.searchResult, "Boundary capture requires the frozen search observation first");
        await smoothScroll(page, "#webmcp-impact-heading");
        await smoothScroll(page, "#webmcp-diagnostics");
        await smoothScroll(page, "#estate-heading");
        const bodyText = await page.locator("body").innerText();
        const collectionValues = await page.locator("#collection-filter input[name='collection']").evaluateAll((inputs_) => inputs_.map((input) => input.value));
        const origin = new URL(config.productUrl).origin;
        const externalRequests = requestUrls.filter((url) => new URL(url).origin !== origin);
        const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }));
        const toolCounts = toolCountsFromText(await page.locator("#diagnostic-tools").textContent());
        return {
          sameOriginOnly: externalRequests.length === 0,
          browserStorage: storage,
          modelProviderRequestCount: externalRequests.filter((url) => /openai|anthropic|gemini|generativelanguage/iu.test(url)).length,
          officialApiRequestCount: externalRequests.filter((url) => /(?:^|\.)gov\.uk$/u.test(new URL(url).hostname)).length,
          landRegistryMetadataOnly: /HM Land Registry metadata/iu.test(bodyText) && /metadata-only/iu.test(bodyText),
          standaloneLegislationCollection: collectionValues.some((value) => /legislation/iu.test(value)),
          standaloneLegislationPayload: requestUrls.some((url) => /legislation.*(?:payload|records)/iu.test(url)),
          standaloneLegislationIndex: requestUrls.some((url) => /legislation.*(?:index|postings)/iu.test(url)),
          legislationRuntimeRequestCount: requestUrls.filter((url) => isLegislationHostname(new URL(url).hostname)).length,
          excludedHostnameResultLinkCount: state.searchResult.results.filter(({ canonicalHumanUrl }) => canonicalHumanUrl && isLegislationHostname(new URL(canonicalHumanUrl).hostname)).length,
          impactClaimsFramedAsHypotheses: /hypotheses to test, not guarantees/iu.test(bodyText),
          remoteProviderDisclosureVisible: /remote AI provider may receive/iu.test(bodyText),
          registeredToolCount: toolCounts.registered,
          expectedToolCount: toolCounts.expected,
          reviewedRecordCount: numberFromText(await page.locator("#record-count").textContent(), "Reviewed count"),
          federatedSourceRecordCount: numberFromText(await page.locator("#federated-source-record-count").textContent(), "Federated source count"),
          federatedRecordCount: numberFromText(await page.locator("#federated-record-count").textContent(), "Federated searchable count"),
          federatedQuarantinedRecordCount: numberFromText(await page.locator("#federated-quarantined-count").textContent(), "Federated quarantine count"),
        };
      },
    },
  ];
}

async function captureScene(browser, config, sceneConfig, definition, work) {
  const rawDirectory = resolve(work, `raw-${definition.sceneId}`);
  await mkdir(rawDirectory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: rawDirectory, size: { width: 1920, height: 1080 } },
    locale: "en-GB",
    timezoneId: "Europe/London",
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const productOrigin = new URL(config.productUrl).origin;
  const requestUrls = [];
  context.on("request", (request) => requestUrls.push(request.url()));
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === productOrigin) await route.continue();
    else await route.abort("blockedbyclient");
  });

  const page = await context.newPage();
  const video = page.video();
  const recordStarted = Date.now();
  const sourceUrl = `${config.productUrl}${definition.route}`;
  await page.goto(sourceUrl, { waitUntil: "networkidle" });
  await waitForVerifiedRuntime(page);
  const contentReady = Date.now();
  const observation = await definition.run(page, requestUrls);
  const remaining = sceneDurationMilliseconds - (Date.now() - contentReady);
  if (remaining > 0) await hold(page, remaining);
  await context.close();
  const rawPath = await video.path();
  const trimSeconds = Math.max(0, (contentReady - recordStarted) / 1_000);
  const preparedPath = resolve(work, `${definition.sceneId}.mov`);
  run("ffmpeg", [
    "-nostdin", "-hide_banner", "-y", "-ss", trimSeconds.toFixed(3), "-i", rawPath,
    "-an", "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", preparedPath,
  ]);
  const durationSeconds = probeDuration(preparedPath);
  invariant(durationSeconds >= 30 && durationSeconds <= 34, `${definition.sceneId} clip duration is outside the 30 to 34 second capture window`);
  return {
    sceneId: definition.sceneId,
    source: preparedPath,
    destination: resolveLiveCaptureRepositoryPath(sceneConfig.media.path, `Scene ${definition.sceneId} output`, {
      prefix: "output/demo-clips/v0.4.0-rc.1/",
      extensions: [".mov", ".mp4", ".mkv"],
    }),
    receipt: {
      sceneId: definition.sceneId,
      path: sceneConfig.media.path,
      sha256: await sha256File(preparedPath),
      durationSeconds,
      capturedAt: new Date(contentReady).toISOString(),
      actions: sceneConfig.requiredActions,
      sourceUrl,
      observation,
    },
  };
}

async function placeOutputs(entries, receiptSource, receiptPath, overwrite) {
  const all = [...entries.map(({ source, destination }) => ({ source, destination })), { source: receiptSource, destination: receiptPath }];
  return placeRepositoryOutputs(all, { root: repositoryRoot, overwrite });
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const config = bindReleaseConfig(validateConfig(JSON.parse(await readFile(configPath, "utf8"))));
  invariant(config.productUrl === PUBLIC_CAPTURE_TARGET, "Demo capture is restricted to the allowlisted public Pages URL");
  const deployment = await fetchPublicDeploymentMetadata({ expectedCommit: config.productCommit });
  invariant(deployment.metadata.runId === config.pagesRunId, "Public deployment run does not match GOVUK_WEBMCP_DEMO_PAGES_RUN_ID");
  const deploymentChecks = [{
    label: "initial",
    observedAt: new Date().toISOString(),
    metadataSha256: deployment.sha256,
    commit: deployment.metadata.commit,
    runId: deployment.metadata.runId,
  }];
  run("ffmpeg", ["-version"], true);
  run("ffprobe", ["-version"], true);
  const state = {};
  const definitions = sceneDefinitions(config, state);
  const configuredScenes = new Map(config.scenes.filter(({ kind }) => kind === "interaction").map((scene) => [scene.id, scene]));
  invariant(definitions.every(({ sceneId }) => configuredScenes.has(sceneId)) && definitions.length === configuredScenes.size, "Capture definitions do not match the configured interaction scenes");
  const work = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-live-capture-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const browserVersion = browser.version();
    const results = [];
    for (const definition of definitions) {
      const beforeDeployment = await fetchPublicDeploymentMetadata({ expectedCommit: config.productCommit });
      assertMatchingPublicDeploymentSnapshot(
        deployment,
        beforeDeployment,
        `Public deployment before ${definition.sceneId}`,
      );
      deploymentChecks.push({
        label: `before:${definition.sceneId}`,
        observedAt: new Date().toISOString(),
        metadataSha256: beforeDeployment.sha256,
        commit: beforeDeployment.metadata.commit,
        runId: beforeDeployment.metadata.runId,
      });
      results.push(await captureScene(browser, config, configuredScenes.get(definition.sceneId), definition, work));
      const afterDeployment = await fetchPublicDeploymentMetadata({ expectedCommit: config.productCommit });
      assertMatchingPublicDeploymentSnapshot(
        deployment,
        afterDeployment,
        `Public deployment after ${definition.sceneId}`,
      );
      deploymentChecks.push({
        label: `after:${definition.sceneId}`,
        observedAt: new Date().toISOString(),
        metadataSha256: afterDeployment.sha256,
        commit: afterDeployment.metadata.commit,
        runId: afterDeployment.metadata.runId,
      });
    }
    await browser.close();
    browser = undefined;
    const finalDeployment = await fetchPublicDeploymentMetadata({ expectedCommit: config.productCommit });
    assertMatchingPublicDeploymentSnapshot(
      deployment,
      finalDeployment,
      "Public deployment after the complete interaction capture",
    );
    deploymentChecks.push({
      label: "complete",
      observedAt: new Date().toISOString(),
      metadataSha256: finalDeployment.sha256,
      commit: finalDeployment.metadata.commit,
      runId: finalDeployment.metadata.runId,
    });
    invariant(state.federatedRecordId, "Capture did not bind a federated record from the exact deployed search");
    const receipt = {
      schema: "govuk-webmcp.demo-live-interaction-capture.v4",
      capturedAt: new Date().toISOString(),
      page: { url: config.productUrl, release: config.release, productCommit: config.productCommit, pagesRunId: config.pagesRunId },
      deployment: { metadataUrl: deployment.url, metadataSha256: deployment.sha256 },
      deploymentChecks,
      demonstration: { ...config.demonstrationInputs, federatedRecordId: state.federatedRecordId },
      captureMethod: "playwright-public-site-interaction",
      browser: { name: "Playwright Chromium", version: browserVersion },
      reviews: { privacy: "pending-agent-review", branding: "pending-agent-review", humanPublicationReview: "pending" },
      noBrowserChrome: true,
      audioCaptured: false,
      clips: results.map(({ receipt: clip }) => clip),
    };
    const temporaryReceipt = resolve(work, "demo-live-interaction-capture.json");
    await writeFile(temporaryReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    const receiptPath = resolveLiveCaptureRepositoryPath(config.interactionCaptureReceipt, "Live interaction capture receipt", {
      prefix: "docs/competition/evidence/",
      extensions: [".json"],
    });
    await placeOutputs(results, temporaryReceipt, receiptPath, options.overwrite);
    process.stdout.write(`${JSON.stringify({ status: "captured-pending-review", page: receipt.page, deployment: receipt.deployment, demonstration: receipt.demonstration, receipt: config.interactionCaptureReceipt, clips: receipt.clips }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
