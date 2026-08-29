import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createKnowledgeDiscoveryRuntime } from "../../dist/src/webmcp-tools.js";

const cataloguePath = new URL("../../app/data/catalogue.json", import.meta.url);
const checksumPath = new URL("../../app/data/catalogue.json.sha256", import.meta.url);
const rawCatalogue = await readFile(cataloguePath, "utf8");
const rawChecksum = await readFile(checksumPath, "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

test("returns a deterministic result with source, assertions and limitations", async () => {
  const runtime = await createKnowledgeDiscoveryRuntime(rawCatalogue, rawChecksum);
  const first = await runtime.search({ query: "  content   API " });
  const second = await runtime.search({ query: "content API" });

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(first.query, "content API");
  assert.equal(first.results[0].recordId, "govuk-discovery:govuk-content-api");
  assert.match(first.results[0].canonicalHumanUrl, /^https:\/\/www\.gov\.uk\//u);
  assert.deepEqual(first.results[0].assertionStatuses, ["inferred", "official-source"]);
  assert.ok(first.results[0].limitations.length > 0);
  assert.equal(first.results[0].bundleDigest, first.catalogue.bundleDigest);
});

test("rejects additional properties and oversized input without throwing", async () => {
  const runtime = await createKnowledgeDiscoveryRuntime(rawCatalogue, rawChecksum);
  const additional = await runtime.search({ query: "content", context: "private" });
  const oversized = await runtime.search({ query: "x".repeat(161) });

  assert.equal(additional.ok, false);
  assert.match(additional.error.message, /Unknown input field/u);
  assert.equal(oversized.ok, false);
  assert.match(oversized.error.message, /at most 160/u);
});

test("fails closed when the raw catalogue checksum is wrong", async () => {
  await assert.rejects(
    createKnowledgeDiscoveryRuntime(`${rawCatalogue} `, rawChecksum),
    /checksum does not match/u,
  );
});

test("fails closed when record content changes behind a new raw checksum", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].description = "Altered after the record digest was created.";
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;

  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, `${sha256(altered)}  catalogue.json\n`),
    /invalid record digest/u,
  );
});

test("fails closed for a non-GOV.UK authoritative URL", async () => {
  const decoded = JSON.parse(rawCatalogue);
  decoded.records[0].canonicalHumanUrl = "https://example.invalid/source";
  const altered = `${JSON.stringify(decoded, null, 2)}\n`;

  await assert.rejects(
    createKnowledgeDiscoveryRuntime(altered, `${sha256(altered)}  catalogue.json\n`),
    /Authoritative links/u,
  );
});
