import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Pages deployment is restricted to the exact main dispatch SHA", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/u);
  assert.doesNotMatch(workflow, /pull_request:/u);
});

test("current public SBOM matches the candidate and omits third-party personal metadata", async () => {
  const text = await readFile("docs/competition/evidence/sbom-2026-08-30.cdx.json", "utf8");
  assert.doesNotMatch(text, /"(?:author|authors|contributors|maintainers)"\s*:/u);
  assert.doesNotMatch(text, /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/u);
  const sbom = JSON.parse(text);
  assert.equal(sbom.metadata.component.name, "govuk-webmcp");
  assert.equal(sbom.metadata.component.version, "0.2.0-rc.1");
  assert.ok(sbom.components.length >= 14);
  assert.ok(sbom.dependencies.length >= 15);
  assert.ok(sbom.components.every((component) => component.name && component.version && component.purl));
});

test("release evidence manifest binds every listed candidate artefact", async () => {
  const manifest = await readFile("docs/competition/evidence/SHA256SUMS", "utf8");
  const entries = manifest.trim().split("\n").map((line) => {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/u);
    assert.ok(match, `Malformed SHA256SUMS entry: ${line}`);
    return { expected: match[1], path: match[2] };
  });
  assert.ok(entries.length >= 35);
  for (const entry of entries) {
    const observed = createHash("sha256").update(await readFile(entry.path)).digest("hex");
    assert.equal(observed, entry.expected, `Evidence digest mismatch for ${entry.path}`);
  }
});

test("research-seed examples remain byte-bound historical illustrations", async () => {
  const examples = [
    {
      path: "examples/catalogue.example.json",
      expectedDigest: "4f7689d3df8ea9d50516daf3f79a313f5636de32cccb614f4da4f971cb98f95b",
      schemaPath: "schemas/catalogue.schema.json",
    },
    {
      path: "examples/evidence-receipt-example.json",
      expectedDigest: "2f8282aa98b95de7a6759506f702bd5843663766c1deb7485d22411f5ea09140",
      schemaPath: "schemas/evidence-receipt.schema.json",
    },
  ];

  const digestMethod = await readFile("examples/DIGEST-METHOD.md", "utf8");
  assert.match(digestMethod, /frozen\s+illustrations from the research seed created on 29 August 2026/u);
  assert.match(digestMethod, /not fixtures for the\s+current `0\.2\.0-rc\.1` contracts/u);

  for (const example of examples) {
    const raw = await readFile(example.path);
    const observedDigest = createHash("sha256").update(raw).digest("hex");
    assert.equal(observedDigest, example.expectedDigest, `${example.path} no longer matches the research baseline`);

    const value = JSON.parse(raw.toString("utf8"));
    const schema = JSON.parse(await readFile(example.schemaPath, "utf8"));
    const missingCurrentFields = schema.required.filter((field) => !(field in value));
    assert.ok(
      missingCurrentFields.length > 0,
      `${example.path} must be replaced by a separately named current-contract example if it becomes contract-valid`,
    );
  }

  const catalogueSidecar = await readFile("examples/catalogue.example.json.sha256", "utf8");
  assert.equal(
    catalogueSidecar,
    `${examples[0].expectedDigest}  catalogue.json\n`,
    "The preserved catalogue sidecar drifted from its baseline value",
  );
});
