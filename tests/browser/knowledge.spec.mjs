import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const rawCatalogue = await readFile("app/data/catalogue.json", "utf8");
const rawReceipts = await readFile("app/data/receipts.json", "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const testOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? "4173"}`;

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
    catalogueText,
    catalogueChecksum: `${sha256(catalogueText)}  catalogue.json\n`,
    receiptsText,
    receiptsChecksum: `${sha256(receiptsText)}  receipts.json\n`,
  };
}

async function installModelContext(page) {
  await page.addInitScript(() => {
    globalThis.__registeredTools = [];
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get() {
        return { registerTool(tool) { globalThis.__registeredTools.push(tool); } };
      },
    });
  });
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
  await expect(page.getByRole("status")).toContainText("WebMCP is not available");
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

test("registers three closed read-only tools with page parity", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("3 WebMCP tools are ready");
  const registrations = await page.evaluate(() => globalThis.__registeredTools.map((tool) => ({
    name: tool.name,
    additionalProperties: tool.inputSchema.additionalProperties,
    annotations: tool.annotations,
  })));
  expect(registrations).toEqual([
    { name: "search_government_knowledge", additionalProperties: false, annotations: { readOnlyHint: true, untrustedContentHint: true } },
    { name: "get_resource_record", additionalProperties: false, annotations: { readOnlyHint: true, untrustedContentHint: true } },
    { name: "show_provenance", additionalProperties: false, annotations: { readOnlyHint: true, untrustedContentHint: true } },
  ]);

  await page.getByLabel("Search term").fill("companies house");
  await page.getByRole("button", { name: "Search" }).click();
  const toolSearch = await page.evaluate(() => globalThis.__registeredTools[0].execute({ query: "companies house", limit: 8 }));
  const pageSearch = JSON.parse(await page.locator("#results details.structured pre").textContent());
  expect(pageSearch).toEqual(toolSearch);

  await page.locator("article.result").first().getByRole("button", { name: "View record and provenance" }).click();
  const recordId = "govuk-discovery:api:companies-house";
  const toolRecord = await page.evaluate((id) => globalThis.__registeredTools[1].execute({ recordId: id }), recordId);
  const pageRecord = JSON.parse(await page.locator("#record-content details.structured pre").textContent());
  expect(pageRecord).toEqual(toolRecord);
  const toolProvenance = await page.evaluate((id) => globalThis.__registeredTools[2].execute({ recordId: id }), recordId);
  const pageProvenance = JSON.parse(await page.locator("#provenance-content details.structured pre").textContent());
  expect(pageProvenance).toEqual(toolProvenance);
  await expect(page).toHaveURL(/#record=govuk-discovery%3Aapi%3Acompanies-house$/u);
});

test("catalogue tampering prevents all tool registration", async ({ page }) => {
  await installModelContext(page);
  await page.route("**/data/catalogue.json.sha256", (route) =>
    route.fulfill({ body: `${"0".repeat(64)}  catalogue.json\n`, contentType: "text/plain" }));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("catalogue checksum does not match");
  await expect(page.getByLabel("Search term")).toBeDisabled();
  expect(await page.evaluate(() => globalThis.__registeredTools.length)).toBe(0);
});

test("receipt tampering prevents all tool registration", async ({ page }) => {
  await installModelContext(page);
  await page.route("**/data/receipts.json.sha256", (route) =>
    route.fulfill({ body: `${"0".repeat(64)}  receipts.json\n`, contentType: "text/plain" }));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("receipt checksum does not match");
  expect(await page.evaluate(() => globalThis.__registeredTools.length)).toBe(0);
});

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
  };
  await page.route("**/data/*", (route) => {
    const filename = route.request().url().split("/").at(-1);
    return route.fulfill({ body: routes[filename], contentType: filename.endsWith(".json") ? "application/json" : "text/plain" });
  });
  await page.goto("/");
  await page.getByLabel("Search term").fill("bank holidays");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("article.result").first()).toContainText("<img src=");
  await expect(page.locator("article.result img")).toHaveCount(0);
  await page.locator("article.result").first().getByRole("button", { name: "View record and provenance" }).click();
  await expect(page.locator("#record-content")).toContainText("<img src=");
  await expect(page.locator("#record-content img")).toHaveCount(0);
  expect(await page.evaluate(() => globalThis.compromised ?? false)).toBe(false);
});

test("a direct record hash restores the human record and provenance view", async ({ page }) => {
  await page.goto("/#record=govuk-discovery%3Adataset%3Aons-open-geography");
  await expect(page.locator("#record-panel")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ONS Open Geography portal" })).toBeVisible();
  await expect(page.locator("#provenance-content")).toContainText("digest-bound");
});

test("automated accessibility smoke test finds no serious or critical violations", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search term").fill("child benefit");
  await page.getByRole("button", { name: "Search" }).click();
  await page.locator("article.result").first().getByRole("button", { name: "View record and provenance" }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"))
    .toEqual([]);
});
