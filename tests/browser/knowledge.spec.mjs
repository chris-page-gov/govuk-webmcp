import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const rawCatalogue = await readFile("app/data/catalogue.json", "utf8");
const rawReceipts = await readFile("app/data/receipts.json", "utf8");
const rawEvidence = await readFile("app/data/evidence-traces.json", "utf8");
const rawFederation = await readFile("app/data/federation.json", "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const testOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? "4173"}`;
const answerId = "answer:new-child-starting-points";
const claimIds = [
  "claim:register-a-birth",
  "claim:check-child-benefit",
  "claim:check-parental-pay-and-leave",
];
const expectedToolNames = [
  "search_government_knowledge",
  "get_resource_record",
  "show_provenance",
  "explore_answer_foundations",
  "compare_evidence_foundations",
];

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function recordDigestInput(record) {
  const copy = structuredClone(record);
  delete copy.provenance.recordDigest;
  delete copy.provenance.bundleDigest;
  delete copy.provenance.evidenceReceiptId;
  return copy;
}

function rebuildBundle(mutator) {
  const catalogue = JSON.parse(rawCatalogue);
  const receipts = JSON.parse(rawReceipts);
  mutator(catalogue);
  for (const record of catalogue.records) {
    record.provenance.recordDigest = sha256(canonicalJson(recordDigestInput(record)));
  }
  catalogue.bundleDigest = sha256(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: catalogue.records.map((record) => record.provenance.recordDigest).sort(),
  }));
  for (const record of catalogue.records) {
    record.provenance.bundleDigest = catalogue.bundleDigest;
    record.provenance.evidenceReceiptId =
      `trusted-govuk-discovery:evidence-receipt:sha256:${record.provenance.recordDigest}`;
    const receipt = receipts.find((candidate) => candidate.output.recordId === record.id);
    receipt.id = record.provenance.evidenceReceiptId;
    receipt.output.recordDigest = record.provenance.recordDigest;
    receipt.output.bundleDigest = catalogue.bundleDigest;
    receipt.limitations = record.limitations;
    receipt.assertionStatuses = [...new Set(record.assertions.map(({ status }) => status))].sort();
    delete receipt.receiptDigest;
    receipt.receiptDigest = sha256(canonicalJson(receipt));
  }
  const catalogueText = `${JSON.stringify(catalogue, null, 2)}\n`;
  const receiptsText = `${JSON.stringify(receipts, null, 2)}\n`;
  return {
    bundleDigest: catalogue.bundleDigest,
    catalogueText,
    catalogueChecksum: `${sha256(catalogueText)}  catalogue.json\n`,
    receiptsText,
    receiptsChecksum: `${sha256(receiptsText)}  receipts.json\n`,
  };
}

function rebindDependentArtefacts(bundleDigest) {
  const evidence = JSON.parse(rawEvidence);
  evidence.catalogueBundleDigest = bundleDigest;
  for (const trace of evidence.traces) {
    const answer = trace.nodes.find(({ id }) => id === trace.id);
    answer.facets.integrity.digest = bundleDigest;
    delete trace.traceDigest;
    trace.traceDigest = sha256(canonicalJson(trace));
  }
  delete evidence.collectionDigest;
  evidence.collectionDigest = sha256(canonicalJson(evidence));
  const evidenceText = `${JSON.stringify(evidence, null, 2)}\n`;

  const federation = JSON.parse(rawFederation);
  federation.catalogueBundleDigest = bundleDigest;
  delete federation.manifestDigest;
  federation.manifestDigest = sha256(canonicalJson(federation));
  const federationText = `${JSON.stringify(federation, null, 2)}\n`;

  return {
    "evidence-traces.json": evidenceText,
    "evidence-traces.json.sha256": `${sha256(evidenceText)}  evidence-traces.json\n`,
    "federation.json": federationText,
    "federation.json.sha256": `${sha256(federationText)}  federation.json\n`,
  };
}

/**
 * Install a deliberately small but lifecycle-accurate WebMCP host double.
 * It models Promise-based registration, duplicate rejection, signal-bound
 * unregistration, discovery, JSON serialisation and call cancellation.
 */
async function installModelContext(page, configuration = {}) {
  await page.addInitScript((config) => {
    const state = { tools: new Map(), config };
    const modelContext = {
      async registerTool(tool, options = {}) {
        if (options.signal?.aborted) {
          throw options.signal.reason ?? new DOMException("Registration was cancelled.", "AbortError");
        }
        if (state.config.hangTool === tool.name) {
          return new Promise((resolve, reject) => {
            options.signal?.addEventListener("abort", () => {
              reject(options.signal.reason ?? new DOMException("Registration was cancelled.", "AbortError"));
            }, { once: true });
          });
        }
        if (state.config.failureTool === tool.name) {
          throw new DOMException(
            "Registration rejected by the instrumented host.",
            state.config.failureName ?? "InvalidStateError",
          );
        }
        if (state.tools.has(tool.name)) {
          throw new DOMException(`A tool named ${tool.name} is already registered.`, "InvalidStateError");
        }
        state.tools.set(tool.name, tool);
        options.signal?.addEventListener("abort", () => {
          if (state.tools.get(tool.name) === tool) state.tools.delete(tool.name);
        }, { once: true });
      },
      async unregisterTool(name) {
        state.tools.delete(name);
      },
      async getTools() {
        return [...state.tools.values()].map((tool) => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: structuredClone(tool.inputSchema),
          annotations: structuredClone(tool.annotations),
        }));
      },
      async executeTool(registeredTool, input = {}, options = {}) {
        const name = typeof registeredTool === "string" ? registeredTool : registeredTool?.name;
        const tool = state.tools.get(name);
        if (!tool) throw new DOMException(`No registered tool named ${String(name)}.`, "NotFoundError");
        const controller = new AbortController();
        const relayAbort = () => controller.abort(
          options.signal.reason ?? new DOMException("Tool execution was cancelled.", "AbortError"),
        );
        if (options.signal?.aborted) relayAbort();
        else options.signal?.addEventListener("abort", relayAbort, { once: true });
        try {
          const result = state.config.omitExecutionOptions
            ? await tool.execute(input)
            : await tool.execute(input, { signal: controller.signal });
          return JSON.stringify(result);
        } finally {
          options.signal?.removeEventListener("abort", relayAbort);
        }
      },
    };
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get() { return modelContext; },
    });
  }, configuration);
}

async function registeredTools(page) {
  return page.evaluate(() => document.modelContext.getTools());
}

async function executeTool(page, name, input) {
  return page.evaluate(async ({ toolName, toolInput }) => {
    const tools = await document.modelContext.getTools();
    const registered = tools.find((tool) => tool.name === toolName);
    if (!registered) throw new Error(`Missing tool ${toolName}`);
    return JSON.parse(await document.modelContext.executeTool(registered, toolInput));
  }, { toolName: name, toolInput: input });
}

test("human search covers the verified 80-record range without WebMCP or storage", async ({ page, context }) => {
  const requests = [];
  const failedResponses = [];
  const consoleErrors = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("response", (response) => { if (!response.ok()) failedResponses.push(`${response.status()} ${response.url()}`); });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("heading", { name: "Trusted government knowledge discovery" })).toBeVisible();
  await expect(page.locator("#record-count")).toHaveText("80");
  await expect(page.locator("#collection-count")).toHaveText("2 searchable · 8 not searchable");
  await expect(page.getByRole("status")).toContainText("WebMCP API is not available");
  await expect(page.getByRole("heading", { name: "Analytical index of the answer" })).toBeVisible();
  await expect(page.locator("#analytical-index > li")).toHaveCount(3);
  await expect(page.locator("#estate-body > tr")).toHaveCount(10);

  await page.getByLabel("Search term").fill("flood API");
  await page.getByText("Filter results").click();
  await page.getByLabel("Resource type").selectOption("api");
  await page.getByRole("button", { name: "Search" }).click();
  const result = page.locator("article.result").first();
  await expect(result).toHaveAttribute("data-record-id", "govuk-discovery:api:flood-monitoring");
  await expect(result.getByRole("link", { name: "Flood-monitoring API" }))
    .toHaveAttribute("href", "https://www.api.gov.uk/ea/flood-monitoring/");
  await expect(result).toContainText("Open Government Licence v3.0");
  await expect(page).toHaveURL(`${testOrigin}/`);

  expect(requests.every((url) => new URL(url).origin === testOrigin)).toBe(true);
  expect(failedResponses).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie })))
    .toEqual({ local: 0, session: 0, cookie: "" });
  expect((await context.storageState()).cookies).toEqual([]);
});

test("direct file opening replaces the apparent verification hang with HTTP guidance", async ({ page }) => {
  await page.goto(new URL("../../dist/index.html", import.meta.url).href);
  await expect(page.getByRole("status")).toContainText("must be served over HTTP", { timeout: 5000 });
  await expect(page.locator("#record-count")).toHaveText("Unavailable");
  await expect(page.locator("#tool-status")).toHaveText("Unavailable");
});

test("registers five closed tools with truthful effects and deterministic page parity", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("5 WebMCP tools are ready");
  const registrations = await registeredTools(page);
  expect(registrations.map(({ name }) => name)).toEqual(expectedToolNames);
  expect(registrations.map(({ inputSchema }) => inputSchema.additionalProperties)).toEqual([
    false, false, false, false, false,
  ]);
  expect(registrations.map(({ annotations }) => annotations)).toEqual([
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: true, untrustedContentHint: true },
    { readOnlyHint: false, untrustedContentHint: true },
    { readOnlyHint: false, untrustedContentHint: true },
  ]);

  const duplicateError = await page.evaluate(async () => {
    const existing = (await document.modelContext.getTools())[0];
    try {
      await document.modelContext.registerTool(existing);
      return null;
    } catch (error) {
      return { name: error.name, message: error.message };
    }
  });
  expect(duplicateError).toMatchObject({ name: "InvalidStateError" });
  expect(await registeredTools(page)).toHaveLength(5);

  await page.getByLabel("Search term").fill("companies house");
  await page.getByRole("button", { name: "Search" }).click();
  const toolSearch = await executeTool(page, "search_government_knowledge", { query: "companies house", limit: 8 });
  const pageSearch = JSON.parse(await page.locator("#results details.structured pre").textContent());
  expect(pageSearch).toEqual(toolSearch);

  const inspectRecord = page.locator("article.result").first().getByRole("button", { name: "View record and provenance" });
  await inspectRecord.click();
  await expect(page.locator("#record-panel")).toBeFocused();
  const recordId = "govuk-discovery:api:companies-house";
  const toolRecord = await executeTool(page, "get_resource_record", { recordId });
  const pageRecord = JSON.parse(await page.locator("#record-content details.structured pre").textContent());
  expect(pageRecord).toEqual(toolRecord);
  const toolProvenance = await executeTool(page, "show_provenance", { recordId });
  const pageProvenance = JSON.parse(await page.locator("#provenance-content details.structured pre").textContent());
  expect(pageProvenance).toEqual(toolProvenance);
  await expect(page).toHaveURL(/#record=govuk-discovery%3Aapi%3Acompanies-house$/u);
  await page.getByRole("button", { name: "Close record" }).click();
  await expect(inspectRecord).toBeFocused();
});

test("WebMCP exploration and comparison update only the matching visible deterministic result", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("5 WebMCP tools are ready");
  await page.getByLabel("Search term").focus();

  const explore = await executeTool(page, "explore_answer_foundations", { answerId, claimId: claimIds[0] });
  await expect(page.getByLabel("Search term")).toBeFocused();
  await expect(page.locator(`.trace-node[data-node-id="${claimIds[0]}"]`).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#foundation-detail")).toContainText("GOV.UK has guidance on registering a birth");
  expect(JSON.parse(await page.locator("#evidence-structured pre").textContent())).toEqual(explore.trace);
  await expect(page.locator("#diagnostic-last-action")).toHaveText("WebMCP: explore_answer_foundations");
  await expect(page.locator("#diagnostic-parity")).toContainText("Displayed deterministic result");
  await expect(page.locator("#webmcp-diagnostics")).toHaveAttribute("data-result-digest", /^[a-f0-9]{64}$/u);
  await expect(page.getByRole("status")).toContainText("No source, storage or external state changed");

  const comparison = await executeTool(page, "compare_evidence_foundations", {
    answerId,
    claimIds: claimIds.slice(0, 2),
  });
  await expect(page.getByLabel("Search term")).toBeFocused();
  await expect(page.locator("#comparison-panel")).toBeVisible();
  await expect(page.locator("#comparison-content .comparison-table tbody tr")).toHaveCount(11);
  await expect(page.locator("#comparison-content")).toContainText("without a combined trust score");
  expect(JSON.parse(await page.locator("#comparison-content details.structured pre").textContent())).toEqual(comparison);
  await expect(page.locator("#diagnostic-last-action")).toHaveText("WebMCP: compare_evidence_foundations");
  await page.getByRole("button", { name: "Close comparison" }).click();
  await expect(page.getByRole("button", { name: "Compare 2 selected claims" })).toBeFocused();
});

test("WebMCP callbacks tolerate hosts that omit execution options", async ({ page }) => {
  await installModelContext(page, { omitExecutionOptions: true });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("5 WebMCP tools are ready");

  const recordId = "govuk-discovery:api:companies-house";
  const calls = [
    {
      name: "search_government_knowledge",
      input: { query: "register a birth", limit: 3 },
      schema: "trusted-govuk-discovery.search-result.v1",
    },
    {
      name: "get_resource_record",
      input: { recordId },
      schema: "trusted-govuk-discovery.resource-record-result.v1",
    },
    {
      name: "show_provenance",
      input: { recordId },
      schema: "trusted-govuk-discovery.provenance-result.v1",
    },
    {
      name: "explore_answer_foundations",
      input: { answerId, claimId: claimIds[0] },
      schema: "trusted-govuk-discovery.evidence-exploration-result.v1",
    },
    {
      name: "compare_evidence_foundations",
      input: { answerId, claimIds: claimIds.slice(0, 2) },
      schema: "trusted-govuk-discovery.evidence-comparison-result.v1",
    },
  ];

  for (const call of calls) {
    const result = await executeTool(page, call.name, call.input);
    expect(result, call.name).toMatchObject({ ok: true, schema: call.schema });
    expect(result, call.name).not.toHaveProperty("error");
  }

  const searchResult = await executeTool(page, "search_government_knowledge", {
    query: "register a birth",
    limit: 3,
  });
  expect(searchResult.returned).toBe(3);
  expect(searchResult.results[0].canonicalHumanUrl).toMatch(/^https:\/\/www\.gov\.uk\//u);
});

test("a deeply nested rejected WebMCP input remains a bounded displayed error", async ({ page }) => {
  await installModelContext(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("5 WebMCP tools are ready");
  const originalSummary = await page.locator("#answer-summary").textContent();
  const result = await page.evaluate(async () => {
    let nested = { leaf: true };
    for (let index = 0; index < 20_000; index += 1) nested = { nested };
    const registered = (await document.modelContext.getTools())
      .find(({ name }) => name === "explore_answer_foundations");
    return JSON.parse(await document.modelContext.executeTool(registered, { unexpected: nested }));
  });
  expect(result).toMatchObject({ ok: false, error: { code: "invalid_evidence_exploration_request" } });
  await expect(page.locator("#diagnostic-input-digest")).toHaveText("Not retained for rejected input");
  await expect(page.locator("#answer-summary .error")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("WebMCP evidence request was rejected");

  const selectors = page.locator("#analytical-index input[type='checkbox']");
  await selectors.nth(0).check();
  await selectors.nth(1).check();
  const humanCompare = page.getByRole("button", { name: "Compare 2 selected claims" });
  await humanCompare.click();
  await expect(page.locator("#comparison-panel")).toBeVisible();
  await expect(page).toHaveURL(/&compare=/u);
  await page.getByRole("button", { name: "Close comparison" }).click();
  await expect(humanCompare).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`#answer=${encodeURIComponent(answerId)}$`, "u"));

  const recovered = await executeTool(page, "explore_answer_foundations", { answerId, claimId: claimIds[0] });
  expect(recovered.ok).toBe(true);
  await expect(page.locator("#answer-summary .error")).toHaveCount(0);
  await expect(page.locator("#answer-summary")).toHaveText(originalSummary);
  await expect(page.locator(`.trace-node[data-node-id="${claimIds[0]}"]`).first()).toHaveAttribute("aria-pressed", "true");
  expect(pageErrors).toEqual([]);
});

test("human Evidence Trace controls support comparison, direct links and focus restoration", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  const exploreClaim = page.getByRole("button", { name: "Show foundations for claim 2" });
  await exploreClaim.click();
  await expect(page.locator(`.trace-node[data-node-id="${claimIds[1]}"]`).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#foundation-detail")).toContainText("Child Benefit guidance");
  await expect(page).toHaveURL(new RegExp(`#answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(claimIds[1])}$`, "u"));
  await expect(page.getByRole("link", { name: "Open authoritative source for claim 2" }))
    .toHaveAttribute("href", /^https:\/\/(?:www\.)?gov\.uk\//u);

  const selectors = page.locator("#analytical-index input[type='checkbox']");
  await selectors.nth(0).check();
  await selectors.nth(1).check();
  const compare = page.getByRole("button", { name: "Compare 2 selected claims" });
  await expect(compare).toBeEnabled();
  await compare.click();
  await expect(page.locator("#comparison-panel")).toBeVisible();
  await expect(page.locator("#comparison-content table")).toContainText("Authority");
  await expect(page.locator("#comparison-content table")).toContainText("Limitations");
  await page.getByRole("button", { name: "Close comparison" }).click();
  await expect(compare).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`#answer=${encodeURIComponent(answerId)}$`, "u"));
  await page.goBack();
  await expect(page.locator("#comparison-panel")).toBeVisible();
  await page.goForward();
  await expect(page.locator("#comparison-panel")).toBeHidden();

  const relationshipDetails = page.locator("#evidence-structured details");
  await relationshipDetails.locator("summary").click();
  await expect(relationshipDetails.getByRole("region", { name: "Evidence Trace relationship table" })).toBeVisible();
  await expect(relationshipDetails.locator("tbody tr")).toHaveCount(17);
});

test("an already-cancelled WebMCP call rejects without changing the display", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("5 WebMCP tools are ready");
  const diagnostic = page.locator("#diagnostic-last-action");
  await expect(diagnostic).toHaveText("Human: explore_answer_foundations");
  const before = await diagnostic.textContent();
  const cancellation = await page.evaluate(async ({ selectedAnswer, selectedClaim }) => {
    const registered = (await document.modelContext.getTools())
      .find(({ name }) => name === "explore_answer_foundations");
    const controller = new AbortController();
    controller.abort(new DOMException("Cancelled by the test host.", "AbortError"));
    try {
      await document.modelContext.executeTool(
        registered,
        { answerId: selectedAnswer, claimId: selectedClaim },
        { signal: controller.signal },
      );
      return null;
    } catch (error) {
      return { name: error.name, message: error.message };
    }
  }, { selectedAnswer: answerId, selectedClaim: claimIds[2] });
  expect(cancellation).toEqual({ name: "AbortError", message: "Cancelled by the test host." });
  await expect(diagnostic).toHaveText(before);
});

test("a registration exception rolls back earlier registrations and leaves human search ready", async ({ page }) => {
  await installModelContext(page, { failureTool: "explore_answer_foundations", failureName: "InvalidStateError" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("human interface is ready");
  await expect(page.getByRole("status")).toContainText("registration failed");
  await expect(page.getByLabel("Search term")).toBeEnabled();
  expect(await registeredTools(page)).toEqual([]);
  await expect(page.locator("#diagnostic-tools")).toContainText("0 registered of 5 expected");
  await page.getByLabel("Search term").fill("child benefit");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("article.result").first()).toBeVisible();
});

test("a browser policy rejection is diagnosed without disabling the human interface", async ({ page }) => {
  await installModelContext(page, { failureTool: "search_government_knowledge", failureName: "NotAllowedError" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.getByRole("status")).toContainText("registration was blocked by the browser or policy");
  await expect(page.getByLabel("Search term")).toBeEnabled();
  expect(await registeredTools(page)).toEqual([]);
});

test("a non-settling registration cannot hold the verified human interface", async ({ page }) => {
  await installModelContext(page, { hangTool: "show_provenance" });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready", { timeout: 5000 });
  await expect(page.getByLabel("Search term")).toBeEnabled({ timeout: 5000 });
  await expect(page.getByRole("status")).toContainText("human interface is ready while WebMCP registration is checked");

  await expect(page.getByRole("status")).toContainText("registration timed out after 3 seconds", { timeout: 5000 });
  await expect(page.getByLabel("Search term")).toBeEnabled();
  expect(await registeredTools(page)).toEqual([]);
  await expect(page.locator("#diagnostic-tools")).toContainText("0 registered of 5 expected");
});

for (const integrityFailure of [
  { label: "catalogue", checksum: "catalogue.json.sha256", message: "catalogue checksum does not match" },
  { label: "receipt", checksum: "receipts.json.sha256", message: "receipt checksum does not match" },
  { label: "Evidence Trace", checksum: "evidence-traces.json.sha256", message: "Evidence Trace checksum does not match" },
  { label: "federation", checksum: "federation.json.sha256", message: "federation checksum does not match" },
]) {
  test(`${integrityFailure.label} tampering prevents all tool registration`, async ({ page }) => {
    await installModelContext(page);
    await page.route(`**/data/${integrityFailure.checksum}`, (route) =>
      route.fulfill({ body: `${"0".repeat(64)}  ${integrityFailure.checksum.replace(".sha256", "")}\n`, contentType: "text/plain" }));
    await page.goto("/");
    await expect(page.getByRole("status")).toContainText(integrityFailure.message);
    await expect(page.getByLabel("Search term")).toBeDisabled();
    expect(await registeredTools(page)).toEqual([]);
  });
}

test("source-derived markup remains inert text in search and record views", async ({ page }) => {
  const bundle = rebuildBundle((catalogue) => {
    const record = catalogue.records.find(({ id }) => id === "govuk-discovery:api:bank-holidays");
    record.description = '<img src="/should-not-load" onerror="globalThis.compromised=true"> bank holidays';
  });
  const routes = {
    "catalogue.json": bundle.catalogueText,
    "catalogue.json.sha256": bundle.catalogueChecksum,
    "receipts.json": bundle.receiptsText,
    "receipts.json.sha256": bundle.receiptsChecksum,
    ...rebindDependentArtefacts(bundle.bundleDigest),
  };
  await page.route("**/data/*", (route) => {
    const filename = route.request().url().split("/").at(-1);
    if (!(filename in routes)) return route.continue();
    return route.fulfill({ body: routes[filename], contentType: filename.endsWith(".json") ? "application/json" : "text/plain" });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await page.getByLabel("Search term").fill("bank holidays");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("article.result").first()).toContainText("<img src=");
  await expect(page.locator("article.result img")).toHaveCount(0);
  await page.locator("article.result").first().getByRole("button", { name: "View record and provenance" }).click();
  await expect(page.locator("#record-content")).toContainText("<img src=");
  await expect(page.locator("#record-content img")).toHaveCount(0);
  expect(await page.evaluate(() => globalThis.compromised ?? false)).toBe(false);
});

test("direct record and evidence hashes restore deterministic human views", async ({ page }) => {
  await page.goto("/#record=govuk-discovery%3Adataset%3Aons-open-geography");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator("#record-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ONS Open Geography portal" })).toBeVisible();
  await expect(page.locator("#provenance-content")).toContainText("digest-bound");

  await page.goto(`/#answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(claimIds[2])}`);
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator(`.trace-node[data-node-id="${claimIds[2]}"]`).first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#foundation-detail")).toContainText("maternity or paternity leave or pay");
});

test("oversized and malformed hash comparisons fail closed without disabling the page", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`/#compare=${"x".repeat(10_000)}`);
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator("#route-warning")).toBeVisible();
  await expect(page.locator("#route-warning")).toContainText("too large to process safely");
  await expect(page).toHaveURL(`${testOrigin}/`);
  await expect(page.locator("#analytical-index > li")).toHaveCount(3);

  await page.goto(`/#answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(`${claimIds[0]},,${claimIds[1]}`)}`);
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator("#comparison-panel .error")).toContainText("two to four exact claim identifiers");

  await page.goto(`/#answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(claimIds.join(","))}`);
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator("#comparison-content .comparison-table")).toBeVisible();
  await expect(page.locator("#comparison-content .comparison-table thead th")).toHaveCount(4);
  expect(pageErrors).toEqual([]);
});

test("axe WCAG 2.2 scan finds no serious or critical violations in the expanded journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await page.getByRole("button", { name: "Show foundations for claim 1" }).click();
  const selectors = page.locator("#analytical-index input[type='checkbox']");
  await selectors.nth(0).check();
  await selectors.nth(1).check();
  await page.getByRole("button", { name: "Compare 2 selected claims" }).click();
  await page.getByLabel("Search term").fill("child benefit");
  await page.getByRole("button", { name: "Search" }).click();
  await page.locator("article.result").first().getByRole("button", { name: "View record and provenance" }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"))
    .toEqual([]);
});

test("keyboard, 320px reflow, forced colours and reduced motion retain evidence and search", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  expect(await page.evaluate(() => ({
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    forced: matchMedia("(forced-colors: active)").matches,
  }))).toEqual({ reduced: true, forced: true });

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await expect(page).toHaveURL(`${testOrigin}/#main-content`);

  // The skip link intentionally starts a hash navigation. Settle a fresh base
  // route before the separate Trace and search keyboard checks so its route
  // render cannot replace the focused node under test.
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");

  const traceNode = page.locator(".trace-node").first();
  await traceNode.focus();
  await expect(traceNode).toBeFocused();
  await traceNode.press("Enter");
  await expect(traceNode).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#foundation-detail")).not.toBeEmpty();

  await page.getByLabel("Search term").focus();
  await page.keyboard.type("flood API");
  await page.keyboard.press("Tab");
  const searchButton = page.getByRole("button", { name: "Search" });
  await expect(searchButton).toBeFocused();
  await searchButton.press("Enter");
  await expect(page.locator("article.result").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Source code" })).toBeVisible();
  const reflow = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const intentionallyScrollable = [...document.querySelectorAll(".table-scroll")].map((wrapper) => ({
      right: wrapper.getBoundingClientRect().right,
      width: wrapper.getBoundingClientRect().width,
      overflowX: getComputedStyle(wrapper).overflowX,
    }));
    const uncontainedOverflow = [...document.querySelectorAll("*")]
      .filter((element) => element.getBoundingClientRect().right > viewport + 1)
      .filter((element) => {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          if (["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(parent).overflowX)) return false;
          parent = parent.parentElement;
        }
        return true;
      })
      .map((element) => `${element.tagName.toLocaleLowerCase("en-GB")}#${element.id}.${String(element.className)}`);
    return { viewport, intentionallyScrollable, uncontainedOverflow };
  });
  expect(reflow.uncontainedOverflow).toEqual([]);
  expect(reflow.intentionallyScrollable.length).toBeGreaterThan(0);
  expect(reflow.intentionallyScrollable.every(({ right, width, overflowX }) =>
    right <= reflow.viewport + 1 && width <= reflow.viewport && overflowX === "auto")).toBe(true);
});
