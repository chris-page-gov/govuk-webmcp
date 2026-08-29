import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Pages deployment is restricted to the exact main dispatch SHA", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/u);
  assert.doesNotMatch(workflow, /pull_request:/u);
});

test("public SBOM omits third-party personal metadata", async () => {
  const text = await readFile("docs/competition/evidence/sbom.cdx.json", "utf8");
  assert.doesNotMatch(text, /"(?:author|authors|contributors|maintainers)"\s*:/u);
  assert.doesNotMatch(text, /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/u);
  const sbom = JSON.parse(text);
  assert.ok(sbom.components.length >= 14);
  assert.ok(sbom.dependencies.length >= 15);
  assert.ok(sbom.components.every((component) => component.name && component.version && component.purl));
});
