import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  validatedSourceHref,
  validatedTechnicalReviewHref,
} from "../../dist/app/evidence-answer-view.js";

test("source links require matching credential-free HTTPS destinations", () => {
  assert.equal(
    validatedSourceHref("https://www.gov.uk/register-birth", "www.gov.uk"),
    "https://www.gov.uk/register-birth",
  );
  assert.equal(
    validatedSourceHref("https://WWW.GOV.UK:443/register-birth", "www.gov.uk"),
    "https://www.gov.uk/register-birth",
  );
  for (const [value, hostname] of [
    [null, "www.gov.uk"],
    ["https://www.gov.uk/register-birth", null],
    ["http://www.gov.uk/register-birth", "www.gov.uk"],
    ["https://person:secret@www.gov.uk/register-birth", "www.gov.uk"],
    ["https://www.gov.uk:444/register-birth", "www.gov.uk"],
    ["https://example.com/register-birth", "www.gov.uk"],
    ["javascript:alert(1)", "www.gov.uk"],
    ["not a URL", "www.gov.uk"],
    [`https://www.gov.uk/${"x".repeat(2_100)}`, "www.gov.uk"],
  ]) {
    assert.equal(validatedSourceHref(value, hostname), null);
  }
});

test("Technical review links are canonical internal application routes", () => {
  assert.equal(validatedTechnicalReviewHref("#view=technical"), "#view=technical");
  assert.equal(
    validatedTechnicalReviewHref("#record=govuk-discovery%3Adataset%3Aons-open-geography"),
    "#view=technical&record=govuk-discovery%3Adataset%3Aons-open-geography",
  );
  assert.equal(validatedTechnicalReviewHref("#view=guided"), "#view=technical");
  assert.equal(validatedTechnicalReviewHref("https://example.com/"), "#view=technical");
  assert.equal(validatedTechnicalReviewHref("javascript:alert(1)"), "#view=technical");
  assert.equal(validatedTechnicalReviewHref(null), "#view=technical");
});

test("the Evidence answer renderer retains its text-only and initial-activity contracts", async () => {
  const source = await readFile(new URL("../../app/evidence-answer-view.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/u);
  assert.match(source, /No AI action was presented to this page\./u);
  assert.match(source, /Your AI may have shortened, combined or added to this\. This page cannot see or verify its final wording\./u);
  assert.match(source, /See all evidence details/u);
});
