import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { createKnowledgeActionController } from "../../dist/src/application-actions.js";
import { createEvidenceRuntime } from "../../dist/src/evidence-runtime.js";
import { createFederationRuntime } from "../../dist/src/federation-runtime.js";
import { createKnowledgeDiscoveryRuntime } from "../../dist/src/webmcp-tools.js";

const readData = (name) => readFile(new URL(`../../app/data/${name}`, import.meta.url), "utf8");
const readSchema = async (name) => JSON.parse(await readFile(new URL(`../../schemas/${name}`, import.meta.url), "utf8"));
const rawCatalogue = await readData("catalogue.json");
const rawCatalogueChecksum = await readData("catalogue.json.sha256");
const rawReceipts = await readData("receipts.json");
const rawReceiptsChecksum = await readData("receipts.json.sha256");
const rawEvidence = await readData("evidence-traces.json");
const rawEvidenceChecksum = await readData("evidence-traces.json.sha256");
const rawFederation = await readData("federation.json");
const rawFederationChecksum = await readData("federation.json.sha256");
const catalogue = JSON.parse(rawCatalogue);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function digestWithout(value, field) {
  const copy = structuredClone(value);
  delete copy[field];
  return sha256(canonicalJson(copy));
}

function packaged(value, filename) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  return [text, `${sha256(text)}  ${filename}\n`];
}

function reboundEvidence(mutator) {
  const collection = JSON.parse(rawEvidence);
  mutator(collection.traces[0]);
  collection.traces[0].traceDigest = digestWithout(collection.traces[0], "traceDigest");
  collection.collectionDigest = digestWithout(collection, "collectionDigest");
  return packaged(collection, "evidence-traces.json");
}

function reboundFederation(mutator) {
  const manifest = JSON.parse(rawFederation);
  mutator(manifest);
  for (const entry of manifest.collections) {
    entry.entryDigest = sha256(canonicalJson(entry.admission));
  }
  manifest.manifestDigest = digestWithout(manifest, "manifestDigest");
  return packaged(manifest, "federation.json");
}

async function evidenceRuntime() {
  return createEvidenceRuntime(
    rawEvidence,
    rawEvidenceChecksum,
    catalogue.bundleDigest,
    catalogue.records,
  );
}

async function fullActionRuntime() {
  const [discovery, evidence] = await Promise.all([
    createKnowledgeDiscoveryRuntime(rawCatalogue, rawCatalogueChecksum, rawReceipts, rawReceiptsChecksum),
    evidenceRuntime(),
  ]);
  return Object.assign(discovery, { evidence });
}

test("loads one digest-bound evidence answer and ten bounded corpus admissions", async () => {
  const [evidence, federation] = await Promise.all([
    evidenceRuntime(),
    createFederationRuntime(
      rawFederation,
      rawFederationChecksum,
      catalogue.bundleDigest,
      catalogue.records.length,
    ),
  ]);
  assert.equal(evidence.traces.length, 1);
  assert.equal(evidence.defaultAnswerId, "answer:new-child-starting-points");
  assert.equal(federation.collections.length, 10);
  assert.equal(federation.searchableCollections, 6);
  assert.equal(federation.deepEvidenceCollections, 2);
  assert.equal(federation.federatedCollections, 4);
  assert.equal(federation.federatedSourceRecordCount, 58_655);
  assert.equal(federation.federatedQuarantinedRecordCount, 3);
  assert.equal(federation.federatedRecordCount, 58_652);
  assert.deepEqual(federation.federatedSearch.collectionBindings, [
    {
      admissionId: "corpus:uk-life-course",
      collectionId: "uk-living",
      sourceRecordCount: 9_757,
      quarantinedRecordCount: 0,
      recordCount: 9_757,
    },
    {
      admissionId: "corpus:ons-metadata",
      collectionId: "ons",
      sourceRecordCount: 5_097,
      quarantinedRecordCount: 0,
      recordCount: 5_097,
    },
    {
      admissionId: "corpus:uk-government-apis",
      collectionId: "government-apis",
      sourceRecordCount: 41_598,
      quarantinedRecordCount: 0,
      recordCount: 41_598,
    },
    {
      admissionId: "corpus:land-registry-metadata",
      collectionId: "land-registry",
      sourceRecordCount: 2_203,
      quarantinedRecordCount: 3,
      recordCount: 2_200,
    },
  ]);
  assert.deepEqual(federation.federatedSearch, JSON.parse(rawFederation).federatedSearch);
  const landRegistry = federation.collections.find(({ id }) => id === "corpus:land-registry-metadata");
  assert.match(landRegistry.decision.allowedClaims[0], /2,203 source metadata records; 3 are quarantined and 2,200 are searchable/u);
  assert.equal(federation.notSearchableCollections, 4);
  assert.equal(federation.stateCounts.quarantined, 2);
  assert.deepEqual(
    federation.collections.filter(({ admissionState }) => admissionState === "searchable").map(({ id }) => id).sort(),
    [
      "corpus:curated-government-data-apis",
      "corpus:govuk-new-child",
      "corpus:land-registry-metadata",
      "corpus:ons-metadata",
      "corpus:uk-government-apis",
      "corpus:uk-life-course",
    ],
  );
});

test("evidence exploration and comparison are deterministic, bounded and score-free", async () => {
  const evidence = await evidenceRuntime();
  const claimIds = ["claim:register-a-birth", "claim:check-child-benefit"];
  const explorationInput = { answerId: evidence.defaultAnswerId, claimId: claimIds[0] };
  const comparisonInput = { answerId: evidence.defaultAnswerId, claimIds };
  const [firstExplore, secondExplore, firstCompare, secondCompare] = await Promise.all([
    evidence.explore(explorationInput),
    evidence.explore(explorationInput),
    evidence.compare(comparisonInput),
    evidence.compare(comparisonInput),
  ]);
  assert.deepEqual(firstExplore, secondExplore);
  assert.deepEqual(firstCompare, secondCompare);
  assert.deepEqual(JSON.parse(JSON.stringify(firstExplore)), firstExplore);
  assert.deepEqual(JSON.parse(JSON.stringify(firstCompare)), firstCompare);
  assert.equal(firstExplore.ok, true);
  assert.equal(firstCompare.ok, true);
  assert.equal(firstExplore.trace.claimIds.length, 3);
  assert.equal(firstCompare.rows.length, 2);
  assert.doesNotMatch(JSON.stringify([firstExplore, firstCompare]), /trustScore|trust_score/u);
  for (const row of firstCompare.rows) {
    assert.match(row.source.url, /^https:\/\/www\.gov\.uk\//u);
    assert.ok(row.limitations.length >= 1);
  }
});

test("evidence inputs reject unknown fields, malformed IDs, duplicates and out-of-range comparisons", async () => {
  const evidence = await evidenceRuntime();
  const answerId = evidence.defaultAnswerId;
  const validClaim = "claim:register-a-birth";
  const results = await Promise.all([
    evidence.explore({ answerId, context: "hidden" }),
    evidence.explore({ answerId: "not-an-answer" }),
    evidence.compare({ answerId, claimIds: [validClaim] }),
    evidence.compare({ answerId, claimIds: [validClaim, validClaim] }),
    evidence.compare({ answerId, claimIds: [validClaim, "claim:not-in-this-answer"] }),
  ]);
  assert.ok(results.every(({ ok }) => ok === false));
  assert.equal(results[0].error.code, "invalid_evidence_exploration_request");
  assert.equal(results[4].error.code, "claim_not_found");
});

test("evidence validation fails closed for raw tampering and rebound source URL substitutions", async () => {
  await assert.rejects(
    createEvidenceRuntime(`${rawEvidence} `, rawEvidenceChecksum, catalogue.bundleDigest, catalogue.records),
    /checksum does not match/u,
  );

  const collection = JSON.parse(rawEvidence);
  const source = collection.traces[0].nodes.find(({ kind }) => kind === "source");
  source.url = "https://www.gov.uk/altered-source";
  collection.traces[0].traceDigest = digestWithout(collection.traces[0], "traceDigest");
  collection.collectionDigest = digestWithout(collection, "collectionDigest");
  const [text, checksum] = packaged(collection, "evidence-traces.json");
  await assert.rejects(
    createEvidenceRuntime(text, checksum, catalogue.bundleDigest, catalogue.records),
    /does not match its authoritative catalogue URL/u,
  );

  for (const mutateUrl of [
    (url) => url.replace("https://www.gov.uk/", "https://www.gov.uk:443/"),
    (url) => url.replace("https://www.gov.uk/", "https://www.gov.uk:444/"),
    (url) => `${url}%`,
  ]) {
    const [alteredText, alteredChecksum] = reboundEvidence((trace) => {
      const candidateSource = trace.nodes.find(({ kind }) => kind === "source");
      candidateSource.url = mutateUrl(candidateSource.url);
    });
    await assert.rejects(
      createEvidenceRuntime(alteredText, alteredChecksum, catalogue.bundleDigest, catalogue.records),
      /not an admitted credential-free official HTTPS URL/u,
    );
  }
});

test("evidence validation rejects co-digested semantic, graph and boundary tampering", async () => {
  const cases = [
    {
      message: /unsupported status/u,
      mutate(trace) { trace.nodes.find(({ kind }) => kind === "claim").facets.assertionStatus = "government-certified"; },
    },
    {
      message: /crosses a declared runtime boundary/u,
      mutate(trace) { trace.boundaries.providerCall = true; },
    },
    {
      message: /Question .* must be a string of 10 to 200 characters/u,
      mutate(trace) { trace.question = "Too short"; },
    },
    {
      message: /Answer summary .* must be a string of 20 to 500 characters/u,
      mutate(trace) { trace.answerSummary = "Too short"; },
    },
    {
      message: /Scope .* must be a string of 20 to 500 characters/u,
      mutate(trace) { trace.scope = "Too short"; },
    },
    {
      message: /must be a valid RFC 3339 date-time/u,
      mutate(trace) {
        trace.nodes.find(({ facets }) => facets.freshness.status === "observed")
          .facets.freshness.observedAt = "2026-08-30T12:00:00";
      },
    },
    {
      message: /must be a valid RFC 3339 date-time/u,
      mutate(trace) {
        trace.nodes.find(({ facets }) => facets.freshness.status === "observed")
          .facets.freshness.observedAt = "2026-02-30T12:00:00Z";
      },
    },
    {
      message: /not bound to an official title or description assertion/u,
      mutate(trace) { trace.nodes.find(({ kind }) => kind === "source").statement = "A substituted source statement"; },
    },
    {
      message: /orphan node/u,
      mutate(trace) {
        const check = trace.nodes.find(({ kind }) => kind === "check");
        trace.edges = trace.edges.filter(({ source, target }) => source !== check.id && target !== check.id);
      },
    },
    {
      message: /invalid supports endpoint kinds/u,
      mutate(trace) {
        trace.edges.push({
          id: "edge:answer-back-to-claim",
          source: trace.id,
          target: trace.claimIds[0],
          relation: "supports",
          label: "invalid reverse support",
        });
        trace.edges.sort((left, right) => left.id.localeCompare(right.id, "en-GB"));
      },
    },
    {
      message: /invalid or duplicate edge/u,
      mutate(trace) { trace.edges[0].relation = "supersedes"; },
    },
    {
      message: /invalid or duplicate edge/u,
      mutate(trace) { trace.edges[0].relation = "contradicts"; },
    },
    {
      message: /Evidence Trace node identifier must be a non-empty string of at most 180 characters/u,
      mutate(trace) {
        const node = trace.nodes.find(({ kind }) => kind === "transformation");
        const previousId = node.id;
        node.id = `transformation:${"a".repeat(166)}`;
        for (const edge of trace.edges) {
          if (edge.source === previousId) edge.source = node.id;
          if (edge.target === previousId) edge.target = node.id;
        }
        trace.nodes.sort((left, right) => left.id.localeCompare(right.id, "en-GB"));
      },
    },
    {
      message: /Evidence Trace edge identifier must be a non-empty string of at most 220 characters/u,
      mutate(trace) {
        trace.edges[0].id = `edge:${"a".repeat(216)}`;
        trace.edges.sort((left, right) => left.id.localeCompare(right.id, "en-GB"));
      },
    },
  ];
  for (const { message, mutate } of cases) {
    const [text, checksum] = reboundEvidence(mutate);
    await assert.rejects(
      createEvidenceRuntime(text, checksum, catalogue.bundleDigest, catalogue.records),
      message,
    );
  }
});

test("relation domains reject a co-digested transformation disguised as a comparison limitation", async () => {
  const [text, checksum] = reboundEvidence((trace) => {
    const transformation = trace.nodes.find(({ kind }) => kind === "transformation");
    trace.edges.push({
      id: "edge:bogus-transformation-qualification",
      source: transformation.id,
      target: trace.claimIds[0],
      relation: "qualifies",
      label: "must not qualify",
    });
    trace.edges.sort((left, right) => left.id.localeCompare(right.id, "en-GB"));
  });

  const schemaAjv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(schemaAjv);
  schemaAjv.addSchema(await readSchema("evidence-trace.schema.json"));
  const collectionValidator = schemaAjv.compile(await readSchema("evidence-trace-collection.schema.json"));
  assert.equal(
    collectionValidator(JSON.parse(text)),
    false,
    "the published trace schema must reject a qualifies edge outside limitation -> answer or claim",
  );
  await assert.rejects(
    createEvidenceRuntime(text, checksum, catalogue.bundleDigest, catalogue.records),
    /invalid qualifies endpoint kinds: transformation -> claim/u,
  );

  const outputAjv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(outputAjv);
  for (const name of [
    "error-result.schema.json",
    "evidence-trace.schema.json",
    "explore-answer-foundations-output.schema.json",
    "compare-evidence-foundations-output.schema.json",
  ]) outputAjv.addSchema(await readSchema(name));
  const compareValidator = outputAjv.getSchema("urn:govuk-webmcp:schema:compare-evidence-foundations-output:v1");
  const evidence = await evidenceRuntime();
  const compare = await evidence.compare({
    answerId: evidence.defaultAnswerId,
    claimIds: ["claim:register-a-birth", "claim:check-child-benefit"],
  });
  const nodeKinds = new Map(compare.trace.nodes.map(({ id, kind }) => [id, kind]));
  assert.ok(compare.rows.every(({ limitations }) =>
    limitations.every(({ nodeId }) => nodeKinds.get(nodeId) === "limitation")));
  assert.equal(compareValidator(compare), true, JSON.stringify(compareValidator.errors, null, 2));
});

test("federation validation fails closed for raw tampering and an expanded searchable boundary", async () => {
  await assert.rejects(
    createFederationRuntime(
      `${rawFederation} `,
      rawFederationChecksum,
      catalogue.bundleDigest,
      catalogue.records.length,
    ),
    /checksum does not match/u,
  );

  const manifest = JSON.parse(rawFederation);
  const candidate = manifest.collections.find(({ admission }) => admission.id === "corpus:ai-infrastructure");
  candidate.admission.admissionState = "searchable";
  candidate.entryDigest = sha256(canonicalJson(candidate.admission));
  manifest.manifestDigest = digestWithout(manifest, "manifestDigest");
  const [text, checksum] = packaged(manifest, "federation.json");
  await assert.rejects(
    createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
    /exactly six searchable collections: two reviewed and four federated/u,
  );
});

test("federation validation rejects co-digested federated-search count and shape drift", async () => {
  for (const mutate of [
    (manifest) => { manifest.federatedSearch.recordCount += 1; },
    (manifest) => { manifest.federatedSearch.quarantinedRecordCount = 2; },
    (manifest) => { manifest.federatedSearch.unadmitted = true; },
  ]) {
    const [text, checksum] = reboundFederation(mutate);
    await assert.rejects(
      createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
      /federated-search source-lock and population binding is invalid|Federated-search binding contains an unknown field/u,
    );
  }
});

test("federation validation rejects co-digested per-source population redistribution", async () => {
  for (const redistributeBinding of [false, true]) {
    const [text, checksum] = reboundFederation((manifest) => {
      const landRegistry = manifest.collections.find(
        ({ admission }) => admission.id === "corpus:land-registry-metadata",
      ).admission;
      const ukLiving = manifest.collections.find(({ admission }) => admission.id === "corpus:uk-life-course").admission;
      landRegistry.population.denominator = 2_206;
      landRegistry.counts.find(({ metric }) => metric === "records").count = 2_206;
      ukLiving.population.denominator = 9_754;
      ukLiving.counts.find(({ metric }) => metric === "concepts").count = 9_754;
      if (redistributeBinding) {
        const landRegistryBinding = manifest.federatedSearch.collectionBindings.find(
          ({ collectionId }) => collectionId === "land-registry",
        );
        const ukLivingBinding = manifest.federatedSearch.collectionBindings.find(
          ({ collectionId }) => collectionId === "uk-living",
        );
        landRegistryBinding.sourceRecordCount = 2_206;
        landRegistryBinding.recordCount = 2_203;
        ukLivingBinding.sourceRecordCount = 9_754;
        ukLivingBinding.recordCount = 9_754;
      }
    });
    await assert.rejects(
      createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
      /admission does not match .* collection population binding|collection population binding is invalid/u,
    );
  }
});

test("federation validation rejects co-digested prose that contradicts a collection binding", async () => {
  const [text, checksum] = reboundFederation((manifest) => {
    const landRegistry = manifest.collections.find(
      ({ admission }) => admission.id === "corpus:land-registry-metadata",
    ).admission;
    landRegistry.decision.limitations[0] =
      "All 2,203 source metadata records are searchable; none are quarantined.";
  });
  await assert.rejects(
    createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
    /collection population binding or its validated display contract/u,
  );
});

test("federation validation cross-checks its declared 80 records against the catalogue population", async () => {
  const smallerRecordDigests = catalogue.records
    .slice(0, -1)
    .map(({ provenance }) => provenance.recordDigest)
    .sort();
  const smallerBundleDigest = sha256(canonicalJson({
    schema: "trusted-govuk-discovery.bundle-root.v1",
    recordDigests: smallerRecordDigests,
  }));
  const [text, checksum] = reboundFederation((manifest) => {
    manifest.catalogueBundleDigest = smallerBundleDigest;
  });

  await assert.rejects(
    createFederationRuntime(text, checksum, smallerBundleDigest, 79),
    /admissions account for 80 records but the catalogue contains 79/u,
  );
});

test("federation validation rejects co-digested nested trust-state tampering", async () => {
  const manifest = JSON.parse(rawFederation);
  const candidate = manifest.collections.find(({ admission }) => admission.id === "corpus:ons-metadata");
  candidate.admission.rights.accessDefault = "implicitly-public";
  candidate.entryDigest = sha256(canonicalJson(candidate.admission));
  manifest.manifestDigest = digestWithout(manifest, "manifestDigest");
  const [text, checksum] = packaged(manifest, "federation.json");
  await assert.rejects(
    createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
    /Access default .* has an unsupported value/u,
  );
});

test("federation validation mirrors published date, URL and decision bounds after digest rebinding", async () => {
  const cases = [
    {
      label: "impossible generated date",
      expected: /Federation generatedAt is not a valid date-time or null/u,
      mutate(manifest) { manifest.generatedAt = "2026-02-30T00:00:00Z"; },
    },
    {
      label: "timezone-less freshness date",
      expected: /Observed date .* is not a valid date-time or null/u,
      mutate(manifest) { manifest.collections[0].admission.freshness.observedAt = "2026-08-30T00:00:00"; },
    },
    {
      label: "non-canonical repository URL",
      expected: /outside the admitted public GitHub account/u,
      mutate(manifest) { manifest.collections[0].admission.repositoryUrl = "https://github.com/chris-page-gov/a repo"; },
    },
    {
      label: "short allowed claim",
      expected: /Allowed claims .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.allowedClaims[0] = "four"; },
    },
    {
      label: "long allowed claim",
      expected: /Allowed claims .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.allowedClaims[0] = "a".repeat(501); },
    },
    {
      label: "short forbidden claim",
      expected: /Forbidden claims .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.forbiddenClaims[0] = "four"; },
    },
    {
      label: "long forbidden claim",
      expected: /Forbidden claims .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.forbiddenClaims[0] = "f".repeat(501); },
    },
    {
      label: "short limitation",
      expected: /Limitations .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.limitations[0] = "four"; },
    },
    {
      label: "long limitation",
      expected: /Limitations .* is missing or exceeds its bounds/u,
      mutate(manifest) { manifest.collections[0].admission.decision.limitations[0] = "l".repeat(701); },
    },
  ];
  for (const { label, expected, mutate } of cases) {
    const [text, checksum] = reboundFederation(mutate);
    await assert.rejects(
      createFederationRuntime(text, checksum, catalogue.bundleDigest, catalogue.records.length),
      expected,
      label,
    );
  }
});

test("both evidence result families validate against their closed published contracts", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const dependencyNames = [
    "error-result.schema.json",
    "evidence-trace.schema.json",
    "explore-answer-foundations-output.schema.json",
    "compare-evidence-foundations-output.schema.json",
  ];
  for (const name of dependencyNames) ajv.addSchema(await readSchema(name));
  const exploreValidator = ajv.getSchema("urn:govuk-webmcp:schema:explore-answer-foundations-output:v1");
  const compareValidator = ajv.getSchema("urn:govuk-webmcp:schema:compare-evidence-foundations-output:v1");
  assert.ok(exploreValidator);
  assert.ok(compareValidator);
  const evidence = await evidenceRuntime();
  const explore = await evidence.explore({
    answerId: evidence.defaultAnswerId,
    claimId: "claim:register-a-birth",
  });
  const compare = await evidence.compare({
    answerId: evidence.defaultAnswerId,
    claimIds: ["claim:register-a-birth", "claim:check-child-benefit"],
  });
  assert.equal(exploreValidator(explore), true, JSON.stringify(exploreValidator.errors, null, 2));
  assert.equal(compareValidator(compare), true, JSON.stringify(compareValidator.errors, null, 2));
});

test("presentation actions honour cancellation and commit a successful result once", async () => {
  const evidence = await evidenceRuntime();
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const runtime = {
    search: async () => gate,
    getRecord: async () => ({ ok: true }),
    showProvenance: async () => ({ ok: true }),
    evidence,
  };
  const presentations = [];
  const actions = createKnowledgeActionController(runtime, (value) => presentations.push(value));

  const alreadyAborted = new AbortController();
  alreadyAborted.abort(new DOMException("Cancelled before execution", "AbortError"));
  await assert.rejects(
    actions.run("explore_answer_foundations", { answerId: evidence.defaultAnswerId }, {
      origin: "webmcp", present: true, signal: alreadyAborted.signal,
    }),
    { name: "AbortError" },
  );
  assert.equal(presentations.length, 0);

  const midExecution = new AbortController();
  const pending = actions.run("search_government_knowledge", { query: "child" }, {
    origin: "webmcp", present: true, signal: midExecution.signal,
  });
  midExecution.abort(new DOMException("Cancelled during execution", "AbortError"));
  release({ schema: "test-result", ok: true });
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(presentations.length, 0);

  const result = await actions.run("explore_answer_foundations", {
    answerId: evidence.defaultAnswerId,
    claimId: "claim:check-child-benefit",
  }, { origin: "human", present: true });
  assert.equal(result.ok, true);
  assert.equal(presentations.length, 1);
  assert.equal(presentations[0].action, "explore_answer_foundations");
  assert.match(presentations[0].inputDigest, /^[a-f0-9]{64}$/u);
  assert.match(presentations[0].resultDigest, /^[a-f0-9]{64}$/u);
  assert.equal(
    presentations[0].resultDigest,
    sha256(canonicalJson(JSON.parse(JSON.stringify(presentations[0].result)))),
    "the diagnostic digest must bind the JSON value actually serialised and displayed",
  );
});

test("concurrent record presentations commit only the latest-started request", async () => {
  const base = await fullActionRuntime();
  const earlierRecordId = "govuk-discovery:api:flood-monitoring";
  const laterRecordId = "govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114";
  let markEarlierStarted;
  const earlierStarted = new Promise((resolve) => { markEarlierStarted = resolve; });
  let releaseEarlier;
  const earlierGate = new Promise((resolve) => { releaseEarlier = resolve; });
  const runtime = {
    search: (...args) => base.search(...args),
    async getRecord(input, options) {
      if (input.recordId === earlierRecordId) {
        markEarlierStarted();
        await earlierGate;
      }
      return base.getRecord(input, options);
    },
    showProvenance: (...args) => base.showProvenance(...args),
    evidence: base.evidence,
  };
  const presentations = [];
  const actions = createKnowledgeActionController(runtime, (value) => presentations.push(value));
  let earlierCommitted = false;
  let laterCommitted = false;

  const earlier = actions.run(
    "present_resource_evidence",
    { recordId: earlierRecordId },
    {
      origin: "human",
      present: true,
      onPresentationCommit: () => { earlierCommitted = true; },
    },
  );
  await earlierStarted;
  const later = await actions.run(
    "present_resource_evidence",
    { recordId: laterRecordId },
    {
      origin: "human",
      present: true,
      onPresentationCommit: () => { laterCommitted = true; },
    },
  );

  assert.equal(later.ok, true);
  assert.equal(laterCommitted, true);
  assert.equal(later.evidence.selectionId, laterRecordId);
  assert.equal(presentations.length, 1);
  assert.equal(presentations[0].result.evidence.selectionId, laterRecordId);
  assert.equal(presentations[0].isCurrentEvidencePresentation(), true);
  releaseEarlier();

  const stale = await earlier;
  assert.equal(stale.ok, true, "the earlier caller still receives its valid result");
  assert.equal(earlierCommitted, false, "a stale caller must not navigate after its presentation was suppressed");
  assert.equal(stale.evidence.selectionId, earlierRecordId);
  assert.equal(presentations.length, 1, "the stale completion must not commit a second presentation");
  assert.equal(presentations[0].result.evidence.selectionId, laterRecordId);
});

test("one latest-started sequence spans all three Evidence-answer actions and async render work", async () => {
  const base = await fullActionRuntime();
  const delayedRecordId = "govuk-discovery:api:flood-monitoring";
  let markRecordStarted;
  const recordStarted = new Promise((resolve) => { markRecordStarted = resolve; });
  let releaseRecord;
  const recordGate = new Promise((resolve) => { releaseRecord = resolve; });
  const runtime = {
    search: (...args) => base.search(...args),
    async getRecord(input, options) {
      if (input.recordId === delayedRecordId) {
        markRecordStarted();
        await recordGate;
      }
      return base.getRecord(input, options);
    },
    showProvenance: (...args) => base.showProvenance(...args),
    evidence: base.evidence,
  };
  const presentations = [];
  const actions = createKnowledgeActionController(runtime, (value) => presentations.push(value));
  let delayedCommitted = false;

  const delayed = actions.run(
    "present_resource_evidence",
    { recordId: delayedRecordId },
    {
      origin: "webmcp",
      present: true,
      onPresentationCommit: () => { delayedCommitted = true; },
    },
  );
  await recordStarted;

  const answerId = base.evidence.defaultAnswerId;
  const claimIds = ["claim:register-a-birth", "claim:check-child-benefit"];
  const explored = await actions.run(
    "explore_answer_foundations",
    { answerId, claimId: claimIds[0] },
    { origin: "webmcp", present: true },
  );
  assert.equal(explored.ok, true);
  assert.equal(presentations.length, 1);
  const exploredPresentation = presentations[0];
  assert.equal(exploredPresentation.action, "explore_answer_foundations");
  assert.equal(exploredPresentation.isCurrentEvidencePresentation(), true);

  const compared = await actions.run(
    "compare_evidence_foundations",
    { answerId, claimIds },
    { origin: "webmcp", present: true },
  );
  assert.equal(compared.ok, true);
  assert.equal(presentations.length, 2);
  const comparedPresentation = presentations[1];
  assert.equal(comparedPresentation.action, "compare_evidence_foundations");
  assert.equal(
    exploredPresentation.isCurrentEvidencePresentation(),
    false,
    "an asynchronous renderer holding the earlier presentation must see it become stale",
  );
  assert.equal(comparedPresentation.isCurrentEvidencePresentation(), true);

  releaseRecord();
  const delayedResult = await delayed;
  assert.equal(delayedResult.ok, true, "a stale caller must still receive its deterministic result");
  assert.equal(delayedCommitted, false);
  assert.equal(presentations.length, 2, "the older record action must not overwrite the later comparison");
  assert.equal(comparedPresentation.isCurrentEvidencePresentation(), true);
});

test("all action paths reject deeply nested unknown input without hashing caller-owned values", async () => {
  const runtime = await fullActionRuntime();
  const presentations = [];
  const actions = createKnowledgeActionController(runtime, (value) => presentations.push(value));
  let nested = { leaf: true };
  for (let index = 0; index < 20_000; index += 1) nested = { nested };
  const rejected = { unexpected: nested };
  const names = [
    "search_government_knowledge",
    "get_resource_record",
    "show_provenance",
    "explore_answer_foundations",
    "compare_evidence_foundations",
    "present_resource_evidence",
  ];

  const results = [];
  for (const name of names) {
    results.push(await actions.run(name, rejected, { origin: "webmcp", present: true }));
  }
  const cyclic = {};
  cyclic.answerId = cyclic;
  results.push(await actions.run(
    "explore_answer_foundations",
    cyclic,
    { origin: "webmcp", present: true },
  ));
  results.push(await actions.run(
    "explore_answer_foundations",
    { answerId: 1n },
    { origin: "webmcp", present: true },
  ));

  assert.ok(results.every(({ ok }) => ok === false));
  assert.equal(presentations.length, names.length + 2);
  assert.ok(presentations.every(({ inputDigest }) => inputDigest === null));
  assert.ok(presentations.every(({ resultDigest }) => /^[a-f0-9]{64}$/u.test(resultDigest)));
  assert.ok(presentations.every(({ result }) => JSON.stringify(result).length < 1_000));
});

test("the common input budget rejects broad roots and accessors before dispatch", async () => {
  let calls = 0;
  const rejectingRuntime = {
    search: async () => { calls += 1; return { ok: true }; },
    getRecord: async () => { calls += 1; return { ok: true }; },
    showProvenance: async () => { calls += 1; return { ok: true }; },
    evidence: {
      explore: async () => { calls += 1; return { ok: true }; },
      compare: async () => { calls += 1; return { ok: true }; },
    },
  };
  const presentations = [];
  const actions = createKnowledgeActionController(rejectingRuntime, (value) => presentations.push(value));
  const broad = Object.fromEntries(Array.from({ length: 17 }, (_, index) => [`field${index}`, index]));
  const accessor = {};
  Object.defineProperty(accessor, "query", { enumerable: true, get: () => "must not execute" });

  for (const input of [broad, accessor]) {
    const result = await actions.run("search_government_knowledge", input, { origin: "webmcp", present: true });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, "input_budget_exceeded");
  }
  assert.equal(calls, 0);
  assert.equal(presentations.length, 2);
  assert.ok(presentations.every(({ inputDigest }) => inputDigest === null));
});

test("accepted inputs retain canonical property-order-independent diagnostic digests", async () => {
  const evidence = await evidenceRuntime();
  const presentations = [];
  const actions = createKnowledgeActionController({
    search: async () => ({ ok: true }),
    getRecord: async () => ({ ok: true }),
    showProvenance: async () => ({ ok: true }),
    evidence,
  }, (value) => presentations.push(value));
  const answerId = evidence.defaultAnswerId;
  const claimId = "claim:register-a-birth";
  await actions.run("explore_answer_foundations", { answerId, claimId }, { origin: "human", present: true });
  await actions.run("explore_answer_foundations", { claimId, answerId }, { origin: "human", present: true });
  assert.match(presentations[0].inputDigest, /^[a-f0-9]{64}$/u);
  assert.equal(presentations[0].inputDigest, presentations[1].inputDigest);
});
