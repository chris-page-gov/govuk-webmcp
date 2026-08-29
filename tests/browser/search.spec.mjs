import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const fixtureSource = JSON.parse(await readFile("app/data/catalogue.fixture.json", "utf8"));

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function buildFixture(mutator = () => {}) {
  const catalogue = structuredClone(fixtureSource);
  mutator(catalogue);
  const recordDigests = [];
  for (const record of catalogue.records) {
    record.provenance.recordDigest = sha256(canonicalJson(record));
    recordDigests.push(record.provenance.recordDigest);
  }
  catalogue.bundleDigest = sha256(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: recordDigests.sort(),
  }));
  for (const record of catalogue.records) {
    record.provenance.bundleDigest = catalogue.bundleDigest;
    record.provenance.evidenceReceiptId =
      `trusted-govuk-discovery:evidence-receipt:sha256:${record.provenance.recordDigest}`;
  }
  const raw = `${JSON.stringify(catalogue, null, 2)}\n`;
  return { raw, checksum: `${sha256(raw)}  catalogue.json\n` };
}

async function installModelContext(page) {
  await page.addInitScript(() => {
    globalThis.__registeredTools = [];
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get() {
        return {
          registerTool(tool) {
            globalThis.__registeredTools.push(tool);
          },
        };
      },
    });
  });
}

test("human search works without WebMCP and stores no query", async ({ page, context }) => {
  const runtimeRequests = [];
  const failedResponses = [];
  const consoleErrors = [];
  page.on("request", (request) => runtimeRequests.push(request.url()));
  page.on("response", (response) => {
    if (!response.ok()) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Trusted government knowledge discovery" })).toBeVisible();
  await expect(page.getByLabel("Search term")).toBeEnabled();
  await expect(page.getByRole("status")).toContainText("WebMCP is not available");
  await page.getByLabel("Search term").fill("content API");
  await page.getByRole("button", { name: "Search" }).click();

  const result = page.locator("article.result");
  await expect(result).toHaveAttribute("data-record-id", "govuk-discovery:govuk-content-api");
  await expect(result.getByRole("link", { name: "GOV.UK Content API" }))
    .toHaveAttribute("href", "https://www.gov.uk/help/reuse-govuk-content");
  await expect(result.getByRole("heading", { name: "Assertion status" })).toBeVisible();
  await expect(result.getByRole("heading", { name: "Limitations" })).toBeVisible();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");

  expect(runtimeRequests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  expect(failedResponses).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
  }))).toEqual({ local: 0, session: 0, cookie: "" });
  expect((await context.storageState()).cookies).toEqual([]);
});

test("registers one read-only tool with exact page/tool result parity", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("WebMCP search are ready");
  await page.getByLabel("Search term").fill("content API");
  await page.getByRole("button", { name: "Search" }).click();

  const registration = await page.evaluate(() => {
    const tool = globalThis.__registeredTools[0];
    return {
      count: globalThis.__registeredTools.length,
      name: tool.name,
      additionalProperties: tool.inputSchema.additionalProperties,
      annotations: tool.annotations,
    };
  });
  expect(registration).toEqual({
    count: 1,
    name: "search_government_knowledge",
    additionalProperties: false,
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  });

  const toolResult = await page.evaluate(() =>
    globalThis.__registeredTools[0].execute({ query: "content API" }));
  const pageResult = JSON.parse(await page.locator("#structured-result").textContent());
  expect(pageResult).toEqual(toolResult);
  expect(pageResult.results[0].recordDigest).toBe(await page.locator("article.result").getAttribute("data-record-digest"));
  expect(pageResult.results[0].bundleDigest).toBe(await page.locator("article.result").getAttribute("data-bundle-digest"));
});

test("tampering prevents search and tool registration", async ({ page }) => {
  await installModelContext(page);
  await page.route("**/data/catalogue.json.sha256", (route) =>
    route.fulfill({ body: `${"0".repeat(64)}  catalogue.json\n`, contentType: "text/plain" }));
  await page.goto("/");

  await expect(page.getByRole("status")).toContainText("checksum does not match");
  await expect(page.getByLabel("Search term")).toBeDisabled();
  expect(await page.evaluate(() => globalThis.__registeredTools.length)).toBe(0);
});

test("source-derived markup remains inert text", async ({ page }) => {
  const fixture = buildFixture((catalogue) => {
    catalogue.records[0].description = '<img src="/should-not-load" onerror="globalThis.compromised=true">';
  });
  await page.route("**/data/catalogue.json", (route) =>
    route.fulfill({ body: fixture.raw, contentType: "application/json" }));
  await page.route("**/data/catalogue.json.sha256", (route) =>
    route.fulfill({ body: fixture.checksum, contentType: "text/plain" }));
  await page.goto("/");
  await page.getByLabel("Search term").fill("content");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.locator("article.result")).toContainText("<img src=");
  await expect(page.locator("article.result img")).toHaveCount(0);
  expect(await page.evaluate(() => globalThis.compromised ?? false)).toBe(false);
});
