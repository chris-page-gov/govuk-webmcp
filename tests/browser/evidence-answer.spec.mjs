import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function installModelContext(page) {
  await page.addInitScript(() => {
    const tools = new Map();
    const modelContext = {
      async registerTool(tool, options = {}) {
        if (options.signal?.aborted) throw options.signal.reason;
        if (tools.has(tool.name)) throw new DOMException("Duplicate tool.", "InvalidStateError");
        tools.set(tool.name, tool);
        options.signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
      },
      async getTools() {
        return [...tools.values()].map(({ name, title, description, inputSchema, annotations }) => ({
          name, title, description, inputSchema: structuredClone(inputSchema), annotations: structuredClone(annotations),
        }));
      },
      async executeTool(value, input = {}, options = {}) {
        const name = typeof value === "string" ? value : value.name;
        const tool = tools.get(name);
        if (!tool) throw new DOMException("Tool not found.", "NotFoundError");
        return JSON.stringify(await tool.execute(input, options));
      },
    };
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      get() { return modelContext; },
    });
  });
}

async function executeTool(page, name, input) {
  return page.evaluate(async ({ toolName, toolInput }) => {
    const tool = (await document.modelContext.getTools()).find(({ name: candidate }) => candidate === toolName);
    if (!tool) throw new Error(`Missing tool ${toolName}`);
    return JSON.parse(await document.modelContext.executeTool(tool, toolInput));
  }, { toolName: name, toolInput: input });
}

async function delayNextPresentationDigest(page) {
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(SubtleCrypto.prototype, "digest");
    if (!descriptor?.value || descriptor.configurable !== true) {
      throw new Error("SubtleCrypto.digest cannot be isolated for the presentation-race test.");
    }
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    let delayed = false;
    globalThis.__presentationDigestDelayed = false;
    Object.defineProperty(SubtleCrypto.prototype, "digest", {
      ...descriptor,
      async value(...arguments_) {
        if (!delayed) {
          delayed = true;
          globalThis.__presentationDigestDelayed = true;
          await gate;
        }
        return Reflect.apply(descriptor.value, this, arguments_);
      },
    });
    globalThis.__releasePresentationDigest = () => {
      Object.defineProperty(SubtleCrypto.prototype, "digest", descriptor);
      release();
      delete globalThis.__releasePresentationDigest;
    };
  });
}

async function releasePresentationDigest(page) {
  await page.evaluate(() => globalThis.__releasePresentationDigest());
  await page.waitForTimeout(50);
}

test("a bare public route starts with one readable Evidence answer view", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await expect(page.locator("#evidence-answer-view")).toBeVisible();
  await expect(page.locator("#technical-review-view")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Evidence answer", exact: true })).toBeVisible();
  await expect(page.locator("h1:visible")).toHaveCount(1);
  await expect(page.locator("#evidence-answer-activity")).toHaveText("No AI action was presented to this page.");
  await expect(page.getByRole("navigation", { name: "Evidence views" })
    .getByRole("link", { name: "Evidence answer" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("status")).toContainText("WebMCP API is not available");
});

test("the human result action uses the sixth action and keeps the same selection in Technical review", async ({ page }) => {
  await page.goto("/#view=technical");
  await page.getByLabel("Search term").fill("companies house");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const result = page.locator('article.result[data-record-id="govuk-discovery:api:companies-house"]');
  await result.getByRole("button", { name: "Show evidence for this result" }).click();

  await expect(page).toHaveURL(/#view=guided&record=govuk-discovery%3Aapi%3Acompanies-house$/u);
  await expect(page.locator("#evidence-answer-view")).toBeVisible();
  await expect(page.locator("#technical-review-view")).toBeHidden();
  await expect(page.locator("#evidence-answer-heading")).toBeFocused();
  await expect(page.locator("#evidence-answer-content")).toContainText("Companies House API");
  await expect(page.locator("#evidence-answer-content")).toContainText("What the evidence supports");
  await expect(page.locator("#evidence-answer-content")).toContainText("Record reference");
  await expect(page.locator("#evidence-answer-content")).toContainText("Dedicated personal-context fields in this action");
  await expect(page.locator("#evidence-answer-content")).toContainText("What this page cannot decide");
  await expect(page.locator("#evidence-answer-content")).toContainText("From your AI");
  await expect(page.locator("#evidence-answer-content a").filter({ hasText: "Open official source" })).toHaveCount(1);
  const sectionHeadings = await page.locator("#evidence-answer-content h2").allTextContents();
  expect(sectionHeadings).toEqual([
    "What this page found",
    "What the evidence supports",
    "Evidence status",
    "Recorded source",
    "When the evidence was observed",
    "Integrity, access, rights and coverage",
    "Limits to check",
    "What this page cannot decide",
    "What was shared with this page",
    "Compare this with your AI's answer",
    "Before you rely on this",
    "See the complete technical evidence",
  ]);
  const displayedDigest = await page.locator("#evidence-answer-view").getAttribute("data-evidence-digest");
  expect(displayedDigest).toMatch(/^[a-f0-9]{64}$/u);
  await expect(page.locator("#evidence-answer-content")).toContainText(displayedDigest);

  await page.getByRole("link", { name: "See all evidence details" }).click();
  await expect(page.locator("#technical-review-view")).toBeVisible();
  await expect(page.locator("#record-panel")).toBeVisible();
  await expect(page.locator("#technical-review-heading")).toBeFocused();
  await expect(page).toHaveURL(/#view=technical&record=govuk-discovery%3Aapi%3Acompanies-house$/u);
});

test("a WebMCP presentation changes only the evidence display and rejected input rolls back", async ({ page }) => {
  await installModelContext(page);
  const originalRecordId = "govuk-discovery:api:flood-monitoring";
  await page.goto(`/#view=technical&record=${encodeURIComponent(originalRecordId)}`);
  await expect(page.getByRole("status")).toContainText("6 WebMCP tools are ready");
  await expect(page.locator("#record-panel")).toBeVisible();
  await page.getByRole("button", { name: "Close record" }).focus();
  await page.evaluate(() => scrollTo(0, 300));
  const before = await page.evaluate(() => ({ href: location.href, historyLength: history.length, activeId: document.activeElement?.id, scrollY }));
  const technicalRecordBefore = await page.locator("#record-panel").textContent();

  const recordId = "govuk-discovery:api:companies-house";
  const valid = await executeTool(page, "present_resource_evidence", { recordId });
  expect(valid.ok).toBe(true);
  expect(await page.evaluate(() => ({ href: location.href, historyLength: history.length, activeId: document.activeElement?.id, scrollY })))
    .toEqual(before);
  await expect(page.locator("#technical-review-view")).toBeVisible();
  await expect(page.locator("#record-panel")).toContainText("Flood-monitoring API");
  expect(await page.locator("#record-panel").textContent()).toBe(technicalRecordBefore);
  await expect(page.getByRole("link", { name: "Evidence answer" })).toHaveAttribute(
    "href",
    `#view=guided&record=${encodeURIComponent(recordId)}`,
  );
  await expect(page.getByRole("status")).toContainText("Evidence answer updated");
  const previous = await page.locator("#evidence-answer-view").evaluate((element) => ({
    selection: element.dataset.selectionId,
    digest: element.dataset.evidenceDigest,
    text: element.querySelector("#evidence-answer-content")?.textContent,
  }));
  expect(valid.evidenceDigest).toBe(previous.digest);

  const rejected = await executeTool(page, "present_resource_evidence", { recordId, personalContext: "must not be accepted" });
  expect(rejected).toMatchObject({ ok: false, error: { code: "invalid_present_resource_evidence_request" } });
  expect(await page.locator("#evidence-answer-view").evaluate((element) => ({
    selection: element.dataset.selectionId,
    digest: element.dataset.evidenceDigest,
    text: element.querySelector("#evidence-answer-content")?.textContent,
  }))).toEqual(previous);

  await page.getByRole("link", { name: "Evidence answer" }).click();
  await expect(page.locator("#evidence-answer-view")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#view=guided&record=${encodeURIComponent(recordId)}$`, "u"));
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", recordId);
  const stableControl = page.locator('summary[data-focus-key="evidence-questions-summary"]');
  await page.evaluate(() => scrollTo(0, 600));
  await stableControl.evaluate((element) => element.focus({ preventScroll: true }));
  const beforeActiveView = await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    focusKey: document.activeElement?.getAttribute("data-focus-key"),
    scrollY,
  }));
  const replacement = await executeTool(page, "present_resource_evidence", {
    recordId: "govuk-discovery:api:flood-monitoring",
  });
  expect(replacement.ok).toBe(true);
  expect(await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    focusKey: document.activeElement?.getAttribute("data-focus-key"),
    scrollY,
  }))).toEqual(beforeActiveView);
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute(
    "data-selection-id",
    "govuk-discovery:api:flood-monitoring",
  );
});

test("the latest-started WebMCP evidence action wins across different presentation tools", async ({ page }) => {
  await installModelContext(page);
  let markRecordReadStarted;
  const recordReadStarted = new Promise((resolve) => { markRecordReadStarted = resolve; });
  let releaseRecordRead;
  const recordReadGate = new Promise((resolve) => { releaseRecordRead = resolve; });
  await page.route("**/data/federated-search/records/**", async (route) => {
    markRecordReadStarted();
    await recordReadGate;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");

  const delayedRecordId = "govuk-discovery:federated:land-registry:57975";
  await page.evaluate((recordId) => {
    globalThis.__delayedEvidencePresentation = document.modelContext.executeTool(
      "present_resource_evidence",
      { recordId },
    );
  }, delayedRecordId);
  await recordReadStarted;

  const answerId = "answer:new-child-starting-points";
  const claimId = "claim:register-a-birth";
  const later = await executeTool(page, "explore_answer_foundations", { answerId, claimId });
  expect(later.ok).toBe(true);
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", claimId);

  releaseRecordRead();
  const delayed = await page.evaluate(async () => {
    const result = await globalThis.__delayedEvidencePresentation;
    delete globalThis.__delayedEvidencePresentation;
    return JSON.parse(result);
  });
  expect(delayed.ok).toBe(true, "a stale caller still receives its deterministic result");
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", claimId);
  await expect(page.locator("#evidence-answer-content")).toContainText("Register a birth");
  await expect(page.locator("#evidence-answer-content")).not.toContainText("HM Land Registry");
});

test("stale human evidence completions cannot rewrite the route after a later WebMCP action", async ({ page }) => {
  await installModelContext(page);
  await page.goto("/#view=technical");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");

  const explore = page.getByRole("button", { name: "Show foundations for claim 2" });
  await delayNextPresentationDigest(page);
  await explore.click();
  await expect.poll(() => page.evaluate(() => globalThis.__presentationDigestDelayed)).toBe(true);

  const firstLaterRecord = "govuk-discovery:api:companies-house";
  expect((await executeTool(page, "present_resource_evidence", { recordId: firstLaterRecord })).ok).toBe(true);
  const afterFirstLaterAction = await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    activeClaimId: document.activeElement?.dataset.claimId ?? null,
    status: document.querySelector("[role='status']")?.textContent,
  }));
  await releasePresentationDigest(page);
  expect(await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    activeClaimId: document.activeElement?.dataset.claimId ?? null,
    status: document.querySelector("[role='status']")?.textContent,
  }))).toEqual(afterFirstLaterAction);
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", firstLaterRecord);

  const selectors = page.locator("#analytical-index input[type='checkbox']");
  await selectors.nth(0).check();
  await selectors.nth(1).check();
  const compare = page.getByRole("button", { name: "Compare 2 selected claims" });
  await delayNextPresentationDigest(page);
  await compare.click();
  await expect.poll(() => page.evaluate(() => globalThis.__presentationDigestDelayed)).toBe(true);

  const secondLaterRecord = "govuk-discovery:api:flood-monitoring";
  expect((await executeTool(page, "present_resource_evidence", { recordId: secondLaterRecord })).ok).toBe(true);
  const afterSecondLaterAction = await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    activeId: document.activeElement?.id ?? null,
    status: document.querySelector("[role='status']")?.textContent,
  }));
  await releasePresentationDigest(page);
  expect(await page.evaluate(() => ({
    href: location.href,
    historyLength: history.length,
    activeId: document.activeElement?.id ?? null,
    status: document.querySelector("[role='status']")?.textContent,
  }))).toEqual(afterSecondLaterAction);
  await expect(page.locator("#comparison-panel")).toBeHidden();
  await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", secondLaterRecord);
});

for (const fixture of [
  ["reviewed", "govuk-discovery:api:flood-monitoring", "reviewed-deep-evidence"],
  ["UK Living", "govuk-discovery:federated:uk-living:6945", "federated-source-snapshot"],
  ["ONS", "govuk-discovery:federated:ons:9757", "federated-source-snapshot"],
  ["UK Government APIs", "govuk-discovery:federated:government-apis:14854", "federated-source-snapshot"],
  ["HM Land Registry", "govuk-discovery:federated:land-registry:56493", "federated-source-snapshot"],
]) {
  test(`${fixture[0]} record deep links restore a complete Evidence answer`, async ({ page }) => {
    await page.goto(`/#view=guided&record=${encodeURIComponent(fixture[1])}`);
    await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
    await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-presentation-state", "presented");
    await expect(page.locator("#evidence-answer-view")).toHaveAttribute("data-selection-id", fixture[1]);
    await expect(page.locator("#evidence-answer-content")).toContainText(fixture[2]);
    await expect(page.locator("#evidence-answer-activity")).toContainText("No new action was accepted for this restored view");
    await expect(page.locator("#evidence-answer-content")).toContainText("All limits for this statement");
    await expect(page.locator("#evidence-answer-content")).toContainText("Next check");
  });
}

test("a mapped primary limitation remains distinct while every other recorded limit is visible", async ({ page }) => {
  const recordId = "govuk-discovery:federated:government-apis:14854";
  await page.goto(`/#view=guided&record=${encodeURIComponent(recordId)}`);
  const article = page.locator("#evidence-answer-content article");
  await expect(article.getByRole("heading", { name: "Important limit", exact: true })).toBeVisible();
  await expect(article).toContainText(
    "The record grants no account, credential, access, licence, suitability or live-service contract.",
  );
  const otherHeading = article.getByRole("heading", { name: "Other recorded limits", exact: true });
  await expect(otherHeading).toBeVisible();
  const otherLimits = otherHeading.locator("xpath=following-sibling::ul[1]/li");
  expect(await otherLimits.count()).toBeGreaterThan(0);
});

test("both views retain serious-error-free semantics at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const route of ["/", "/#view=technical"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("sticky view navigation does not obscure routed focus at the 400% reflow width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/#view=guided&record=govuk-discovery%3Aapi%3Acompanies-house");
  await expect(page.locator("html")).toHaveAttribute("data-application-state", "ready");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));

  await page.getByRole("link", { name: "Technical review" }).click();
  await expect(page.locator("#technical-review-heading")).toBeFocused();
  expect(await page.evaluate(() => {
    const navigation = document.querySelector(".view-navigation")?.getBoundingClientRect();
    const focused = document.activeElement?.getBoundingClientRect();
    return Boolean(navigation && focused && focused.top >= navigation.bottom - 1 && focused.bottom <= innerHeight);
  })).toBe(true);

  await page.getByRole("link", { name: "Evidence answer" }).click();
  await expect(page.locator("#evidence-answer-heading")).toBeFocused();
  expect(await page.evaluate(() => {
    const navigation = document.querySelector(".view-navigation")?.getBoundingClientRect();
    const focused = document.activeElement?.getBoundingClientRect();
    return Boolean(navigation && focused && focused.top >= navigation.bottom - 1 && focused.bottom <= innerHeight);
  })).toBe(true);
});
