import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function sectionBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  assert.notEqual(startIndex, -1, `missing section start: ${start}`);
  const endIndex = text.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing section end: ${end}`);
  return text.slice(startIndex, endIndex);
}

function capturedIds(text, pattern) {
  return [...text.matchAll(pattern)].map(([, value]) => value);
}

function sequence(length) {
  return Array.from({ length }, (_, index) => String(index + 1).padStart(2, "0"));
}

test("beginner interface specification closes the documentation contract without approving implementation", async () => {
  const [specification, requirements, guide] = await Promise.all([
    readFile("docs/product/beginner-interface-specification.md", "utf8"),
    readFile("docs/product/beginner-trust-pathway-prd.md", "utf8"),
    readFile("docs/beginners/index.md", "utf8"),
  ]);

  assert.match(specification, /Status:\*\* proposed implementation specification; documentation only/u);
  assert.match(specification, /does\s+not change the application, WebMCP tools, schemas, data, release or deployment/u);
  assert.match(specification, /Guided evidence/u);
  assert.match(specification, /Technical review/u);
  assert.match(specification, /same action controller, validated artefacts, result objects and limitations/u);
  assert.match(specification, /cannot automatically know what an AI added to its final answer/u);
  assert.match(specification, /Never display raw rejected values/u);
  assert.match(specification, /Every accepted-input string is untrusted data and is rendered through text-only\s+APIs/u);
  assert.match(specification, /Search and task text, action origin and the accepted-input activity copy remain in memory only/u);
  assert.match(specification, /A validated, bounded, non-personal evidence identifier may also become canonical selection state in the fragment/u);
  assert.match(specification, /including when the same identifier was an accepted action argument/u);
  assert.match(specification, /A WebMCP call does not mutate the URL or browser history/u);
  assert.match(specification, /Show the reviewed new-baby starting points\s+example/u);
  assert.match(specification, /`\{"answerId":"answer:new-child-starting-points"\}`/u);
  assert.match(specification, /The search query is bounded free text and can still\s+contain personal details/u);
  assert.doesNotMatch(specification, /No tool accepts a name/u);
  for (const field of [
    "selectionId", "resultKind", "heading", "evidenceTierLabel", "foundations", "primaryLimitation",
    "allLimitations", "boundaries", "nextCheck", "cannotDecide", "acceptedInput", "sourceResultDigests",
    "claimId", "supportedStatement", "publisher", "resourceDetails", "sourceTitle", "sourceAuthority",
    "sourceRole", "sourceUrl", "sourceHostname", "assertionStatus", "observedAt", "integrityBasis", "access",
    "rights", "coverage",
  ]) {
    assert.match(specification, new RegExp("\\| `" + field + "` \\|", "u"));
  }
  assert.match(specification, /No direct source link established/u);
  assert.match(specification, /For every other record, `primaryLimitation` is `null`/u);
  assert.match(specification, /`acceptedInput` \| Closed successful validated action input[\s\S]+or `null` when a deep link/u);
  assert.match(specification, /no overall trust, confidence or quality score/u);
  assert.match(specification, /source-contract correction/u);
  assert.match(specification, /A Life in the UK specialist-/u);
  assert.match(specification, /not an\s+implemented or approved sixth tool/u);
  assert.match(specification, /\{ "readOnlyHint": false, "untrustedContentHint": true \}/u);
  assert.match(specification, /"additionalProperties": false/u);
  assert.match(specification, /This specification does not authorise a new\s+video, publication, deployment or Devpost change/u);

  const decisions = sectionBetween(specification, "## 2. Decisions and non-decisions", "## 3. Current-interface review");
  const regions = sectionBetween(specification, "## 5. Guided-evidence page regions", "## 6. Deterministic presentation contract");
  const storyMapping = sectionBetween(specification, "## 9. Story-to-interface mapping", "## 10. Proposed implementation structure");
  const primaryLimitations = sectionBetween(specification, "### 6.4 First-prototype primary-limitation map", "## 7. Result and system states");
  const traceability = sectionBetween(specification, "### 14.1 Requirement traceability", "### 14.2 Deterministic tests");
  const functionalRequirements = sectionBetween(requirements, "## 9. Functional requirements", "## 10. Accessibility and inclusive-design requirements");
  const accessibilityRequirements = sectionBetween(requirements, "## 10. Accessibility and inclusive-design requirements", "## 11. Acceptance criteria for a future implementation");
  const acceptanceCriteria = sectionBetween(requirements, "## 11. Acceptance criteria for a future implementation", "## 12. Non-goals");

  assert.deepEqual(capturedIds(decisions, /^\| DS-(\d{2}) \|/gmu), sequence(12));
  assert.deepEqual(capturedIds(regions, /^### GE-(\d{2}) —/gmu), sequence(10));
  assert.deepEqual(capturedIds(storyMapping, /^\| US-(\d{2}) \|/gmu), sequence(12));
  assert.deepEqual(capturedIds(primaryLimitations, /^\| US-(\d{2}) \|/gmu), sequence(12));

  assert.deepEqual(capturedIds(functionalRequirements, /^- \*\*FR-(\d{2}):\*\*/gmu), sequence(22));
  assert.deepEqual(capturedIds(accessibilityRequirements, /^- \*\*AR-(\d{2}):\*\*/gmu), sequence(10));
  assert.deepEqual(capturedIds(acceptanceCriteria, /^\d+\. \*\*AC-(\d{2})\b/gmu), sequence(14));

  assert.deepEqual(capturedIds(traceability, /^\| FR-(\d{2}) \|/gmu), sequence(22));
  assert.deepEqual(capturedIds(traceability, /^\| AR-(\d{2}) \|/gmu), sequence(10));
  assert.deepEqual(capturedIds(traceability, /^\| AC-(\d{2}) \|/gmu), sequence(14));
  assert.match(requirements, /\[beginner evidence interface specification\]\(beginner-interface-specification\.md\)/u);

  assert.match(guide, /Question → evidence → limits → explanation → current source → decision/u);
  assert.match(guide, /Claim → supporting evidence → missing evidence → current source → decision/u);
  assert.match(guide, /No general profile is needed for these page actions/u);
  assert.match(guide, /AI provider may have received/u);
  assert.doesNotMatch(guide, /what was shared with the page: only the question/u);
});
