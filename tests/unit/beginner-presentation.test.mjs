import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  BeginnerPresentationContractError,
  projectRecordEvidence,
  projectReviewedAnswer,
} from "../../dist/src/beginner-presentation.js";
import { canonicalJson } from "../../dist/src/integrity.js";
import {
  executePresentResourceEvidence,
  parsePresentResourceEvidenceInput,
} from "../../dist/src/present-resource-evidence.js";
import { createCombinedKnowledgeRuntime } from "../../dist/src/combined-knowledge-runtime.js";
import { createEvidenceRuntime } from "../../dist/src/evidence-runtime.js";
import { createFederatedSearchRuntime } from "../../dist/src/federated-search-runtime.js";
import { createFederationRuntime } from "../../dist/src/federation-runtime.js";
import { createKnowledgeDiscoveryRuntime } from "../../dist/src/webmcp-tools.js";

const readData = (name) => readFile(new URL(`../../app/data/${name}`, import.meta.url), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
async function validators() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  for (const name of ["error-result", "beginner-presentation"]) {
    ajv.addSchema(JSON.parse(await readFile(`schemas/${name}.schema.json`, "utf8")));
  }
  return {
    ajv,
    presentation: ajv.getSchema("urn:govuk-webmcp:schema:beginner-presentation:v1"),
    input: ajv.compile(JSON.parse(await readFile("schemas/present-resource-evidence-input.schema.json", "utf8"))),
    output: ajv.compile(JSON.parse(await readFile("schemas/present-resource-evidence-output.schema.json", "utf8"))),
  };
}

function assertValid({ ajv }, validate, value, label) {
  assert.equal(validate(value), true, `${label}: ${ajv.errorsText(validate.errors)}`);
}

let runtimePromise;
function runtimes() {
  runtimePromise ??= (async () => {
    const [rawCatalogue, rawCatalogueChecksum, rawReceipts, rawReceiptsChecksum, rawEvidence, rawEvidenceChecksum] =
      await Promise.all([
        readData("catalogue.json"),
        readData("catalogue.json.sha256"),
        readData("receipts.json"),
        readData("receipts.json.sha256"),
        readData("evidence-traces.json"),
        readData("evidence-traces.json.sha256"),
      ]);
    const catalogue = JSON.parse(rawCatalogue);
    const reviewed = await createKnowledgeDiscoveryRuntime(
      rawCatalogue,
      rawCatalogueChecksum,
      rawReceipts,
      rawReceiptsChecksum,
    );
    const evidence = await createEvidenceRuntime(
      rawEvidence,
      rawEvidenceChecksum,
      reviewed.bundleDigest,
      catalogue.records,
    );
    const rawFederation = await readData("federation.json");
    const admitted = await createFederationRuntime(
      rawFederation,
      await readData("federation.json.sha256"),
      reviewed.bundleDigest,
      reviewed.recordCount,
    );
    const federated = await createFederatedSearchRuntime(
      await readData("federated-search/manifest.json"),
      await readData("federated-search/manifest.json.sha256"),
      async (path) => new Uint8Array(await readFile(resolve("app", path))),
      admitted.federatedSearch,
    );
    return { reviewed, evidence, combined: createCombinedKnowledgeRuntime(reviewed, federated) };
  })();
  return runtimePromise;
}

test("the closed presentation and tool schemas compile", async () => {
  const schemas = await validators();
  assert.ok(schemas.presentation);
  assertValid(schemas, schemas.input, { recordId: "govuk-discovery:federated:ons:9783" }, "input");
  assert.equal(schemas.input({ recordId: "govuk-discovery:federated:ons:9783", personalContext: "hidden" }), false);
});

test("reviewed explore and compare results project canonical accepted input and complete stable limitations", async () => {
  const { evidence } = await runtimes();
  const answerId = evidence.defaultAnswerId;
  const claimIds = ["claim:register-a-birth", "claim:check-child-benefit"];
  const [explore, compare] = await Promise.all([
    evidence.explore({ answerId, claimId: claimIds[0] }),
    evidence.compare({ answerId, claimIds }),
  ]);
  const [explored, compared, schemas] = await Promise.all([
    projectReviewedAnswer(explore),
    projectReviewedAnswer(compare),
    validators(),
  ]);

  assertValid(schemas, schemas.presentation, explored, "reviewed exploration presentation");
  assertValid(schemas, schemas.presentation, compared, "reviewed comparison presentation");
  assert.deepEqual(explored.acceptedInput, {
    action: "explore_answer_foundations",
    answerId,
    claimId: claimIds[0],
  });
  assert.deepEqual(compared.acceptedInput, {
    action: "compare_evidence_foundations",
    answerId,
    claimIds,
  });
  assert.equal(explored.selectionId, claimIds[0]);
  assert.equal(compared.selectionId, answerId);
  assert.equal(compared.foundations.length, 2);
  assert.equal(compared.evidenceTier, "reviewed-deep-evidence");
  assert.equal(compared.primaryLimitation, "Three recorded starting points are not an exhaustive or personalised checklist.");
  assert.equal(new Set(compared.allLimitations).size, compared.allLimitations.length);
  assert.equal(compared.sourceResultDigests.evidenceTrace, compare.trace.traceDigest);
  assert.equal("evidenceDigest" in compared, false, "the presentation must not contain its own digest");

  const restored = await projectReviewedAnswer(compare, { actionWasAccepted: false });
  assert.equal(restored.acceptedInput, null);
});

test("source-derived strings remain inert data in the pure projection", async () => {
  const { evidence } = await runtimes();
  const result = structuredClone(await evidence.explore({
    answerId: evidence.defaultAnswerId,
    claimId: "claim:register-a-birth",
  }));
  const hostile = '<img src=x onerror="document.body.dataset.pwned=1">';
  result.trace.nodes.find(({ id }) => id === "claim:register-a-birth").statement = hostile;
  const projected = await projectReviewedAnswer(result);
  assert.equal(projected.foundations[0].supportedStatement, hostile);
  assert.equal(JSON.parse(JSON.stringify(projected)).foundations[0].supportedStatement, hostile);
});

test("all reviewed records project with a receipt boundary and canonical result digests", async () => {
  const { reviewed } = await runtimes();
  const catalogue = JSON.parse(await readData("catalogue.json"));
  const schemas = await validators();
  for (const source of catalogue.records) {
    const [record, provenance] = await Promise.all([
      reviewed.getRecord({ recordId: source.id }),
      reviewed.showProvenance({ recordId: source.id }),
    ]);
    const projected = await projectRecordEvidence(record, provenance);
    assertValid(schemas, schemas.presentation, projected, source.id);
    assert.equal(projected.selectionId, source.id);
    assert.equal(projected.evidenceTier, "reviewed-deep-evidence");
    assert.equal(projected.boundaries.itemLevelReview, true);
    assert.equal(projected.boundaries.evidenceReceiptAvailable, true);
    assert.equal(projected.sourceResultDigests.recordResult, sha256(canonicalJson(record)));
    assert.equal(projected.sourceResultDigests.provenanceResult, sha256(canonicalJson(provenance)));
  }
});

test("reviewed and all four federated collections retain exact tiers and only mapped primary limitations", async () => {
  const { combined } = await runtimes();
  const cases = [
    ["govuk-discovery:api:flood-monitoring", "reviewed-deep-evidence", true],
    ["govuk-discovery:federated:uk-living:6959", "federated-source-snapshot", true],
    ["govuk-discovery:federated:ons:9783", "federated-source-snapshot", true],
    ["govuk-discovery:federated:government-apis:14854", "federated-source-snapshot", true],
    ["govuk-discovery:federated:land-registry:57975", "federated-source-snapshot", true],
    ["govuk-discovery:federated:uk-living:0", "federated-source-snapshot", false],
  ];
  const schemas = await validators();
  for (const [recordId, tier, mapped] of cases) {
    const record = await combined.getRecord({ recordId });
    const provenance = await combined.showProvenance({ recordId });
    assert.equal(record.ok, true, recordId);
    assert.equal(provenance.ok, true, recordId);
    const projected = await projectRecordEvidence(record, provenance);
    assertValid(schemas, schemas.presentation, projected, recordId);
    assert.equal(projected.evidenceTier, tier);
    assert.equal(projected.primaryLimitation === null, !mapped);
    assert.equal(projected.foundations[0].primaryLimitation === null, !mapped);
    assert.equal(new Set(projected.allLimitations).size, projected.allLimitations.length);
    if (tier === "federated-source-snapshot") {
      assert.equal(projected.boundaries.itemLevelReview, false);
      assert.equal(projected.boundaries.evidenceReceiptAvailable, false);
      assert.notEqual(projected.foundations[0].sourceRole, "official-source");
    }
  }
});

test("record and provenance ID, tier and binding mismatches fail closed", async () => {
  const { combined } = await runtimes();
  const recordId = "govuk-discovery:federated:ons:9783";
  const record = await combined.getRecord({ recordId });
  const provenance = await combined.showProvenance({ recordId });
  const wrongId = structuredClone(provenance);
  wrongId.recordId = "govuk-discovery:federated:ons:11396";
  await assert.rejects(
    projectRecordEvidence(record, wrongId),
    (error) => error instanceof BeginnerPresentationContractError && /IDs do not match/u.test(error.message),
  );
  const wrongTier = structuredClone(provenance);
  wrongTier.evidenceTier = "reviewed-deep-evidence";
  await assert.rejects(
    projectRecordEvidence(record, wrongTier),
    (error) => error instanceof BeginnerPresentationContractError && /evidence tiers do not match/u.test(error.message),
  );
  const wrongDigest = structuredClone(provenance);
  wrongDigest.recordDigest = "0".repeat(64);
  await assert.rejects(
    projectRecordEvidence(record, wrongDigest),
    (error) => error instanceof BeginnerPresentationContractError && /bindings do not match/u.test(error.message),
  );
});

test("the composite action is sequential, canonical, digest-bound and keeps support out of public output", async () => {
  const { combined } = await runtimes();
  const recordId = "govuk-discovery:federated:government-apis:14854";
  const calls = [];
  const runtime = {
    async getRecord(input, options) {
      calls.push(["record", input, options]);
      return combined.getRecord(input, options);
    },
    async showProvenance(input, options) {
      calls.push(["provenance", input, options]);
      return combined.showProvenance(input, options);
    },
  };
  const execution = await executePresentResourceEvidence(runtime, { recordId });
  const schemas = await validators();
  assertValid(schemas, schemas.output, execution.result, "composite output");
  assert.deepEqual(calls.map(([name]) => name), ["record", "provenance"]);
  assert.deepEqual(calls[1][1], { recordId });
  assert.equal(execution.result.evidence.acceptedInput.recordId, recordId);
  assert.equal(execution.result.evidenceDigest, sha256(canonicalJson(execution.result.evidence)));
  assert.equal("evidenceDigest" in execution.result.evidence, false);
  assert.equal("support" in execution.result, false);
  assert.equal(execution.support.kind, "record");
  assert.equal(execution.support.recordResult.record.id, recordId);
  assert.equal(execution.support.provenanceResult.recordId, recordId);
  assert.equal(schemas.output({ ...execution.result, support: execution.support }), false);

  const restored = await executePresentResourceEvidence(runtime, { recordId }, { actionWasAccepted: false });
  assert.equal(restored.result.evidence.acceptedInput, null);
});

test("the composite derives provenance and accepted input from the successful record result", async () => {
  const { reviewed } = await runtimes();
  const canonicalId = "govuk-discovery:api:flood-monitoring";
  const callerId = "govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114";
  const [record, provenance] = await Promise.all([
    reviewed.getRecord({ recordId: canonicalId }),
    reviewed.showProvenance({ recordId: canonicalId }),
  ]);
  let provenanceInput;
  const execution = await executePresentResourceEvidence({
    async getRecord() { return record; },
    async showProvenance(input) { provenanceInput = input; return provenance; },
  }, { recordId: callerId });
  assert.deepEqual(provenanceInput, { recordId: canonicalId });
  assert.equal(execution.result.evidence.selectionId, canonicalId);
  assert.deepEqual(execution.result.evidence.acceptedInput, {
    action: "present_resource_evidence",
    recordId: canonicalId,
  });
});

test("the composite returns no partial support on invalid input or either runtime failure", async () => {
  const recordId = "govuk-discovery:api:flood-monitoring";
  const recordFailure = {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code: "record_not_found", message: "No exact record was found.", details: {} },
    limitations: ["No substitute source was selected."],
  };
  let recordCalls = 0;
  let provenanceCalls = 0;
  const invalid = await executePresentResourceEvidence({
    async getRecord() { recordCalls += 1; return recordFailure; },
    async showProvenance() { provenanceCalls += 1; return recordFailure; },
  }, { recordId, personalContext: "must not be accepted" });
  assert.equal(invalid.result.error.code, "invalid_present_resource_evidence_request");
  assert.equal(invalid.support, null);
  assert.equal(recordCalls, 0);
  assert.equal(provenanceCalls, 0);

  const firstFailure = await executePresentResourceEvidence({
    async getRecord() { recordCalls += 1; return recordFailure; },
    async showProvenance() { provenanceCalls += 1; return recordFailure; },
  }, { recordId });
  assert.equal(firstFailure.result, recordFailure);
  assert.equal(firstFailure.support, null);
  assert.equal(provenanceCalls, 0, "provenance must not run after record failure");

  const { reviewed } = await runtimes();
  const record = await reviewed.getRecord({ recordId });
  const secondFailure = await executePresentResourceEvidence({
    async getRecord() { return record; },
    async showProvenance() { provenanceCalls += 1; return recordFailure; },
  }, { recordId });
  assert.equal(secondFailure.result, recordFailure);
  assert.equal(secondFailure.support, null);
  assert.equal(provenanceCalls, 1);
});

test("cancellation before or between sequential calls rejects without provenance or partial support", async () => {
  const controller = new AbortController();
  controller.abort(new DOMException("Cancelled before execution", "AbortError"));
  let calls = 0;
  await assert.rejects(
    executePresentResourceEvidence({
      async getRecord() { calls += 1; return {}; },
      async showProvenance() { calls += 1; return {}; },
    }, { recordId: "govuk-discovery:api:flood-monitoring" }, { signal: controller.signal }),
    { name: "AbortError" },
  );
  assert.equal(calls, 0);

  const { reviewed } = await runtimes();
  const between = new AbortController();
  let provenanceCalls = 0;
  await assert.rejects(
    executePresentResourceEvidence({
      async getRecord(input) {
        const result = await reviewed.getRecord(input);
        between.abort(new DOMException("Cancelled between calls", "AbortError"));
        return result;
      },
      async showProvenance() { provenanceCalls += 1; return {}; },
    }, { recordId: "govuk-discovery:api:flood-monitoring" }, { signal: between.signal }),
    { name: "AbortError" },
  );
  assert.equal(provenanceCalls, 0);
});

test("the composite timeout fails closed even when a loader ignores its abort signal", async () => {
  let provenanceCalls = 0;
  const started = performance.now();
  const execution = await executePresentResourceEvidence({
    async getRecord() {
      return new Promise(() => {});
    },
    async showProvenance() {
      provenanceCalls += 1;
      return {};
    },
  }, { recordId: "govuk-discovery:api:flood-monitoring" }, { timeoutMilliseconds: 10 });

  assert.equal(execution.result.ok, false);
  assert.equal(execution.result.error.code, "evidence_presentation_timeout");
  assert.equal(execution.support, null);
  assert.equal(provenanceCalls, 0);
  assert.ok(performance.now() - started < 500, "the fixed deadline must not wait for an uncooperative loader");
});

test("published and executable input validation stay in parity at exact boundaries", async () => {
  const schemas = await validators();
  const cases = [
    [{ recordId: "govuk-discovery:api:flood-monitoring" }, true],
    [{ recordId: "govuk-discovery:federated:land-registry:57975" }, true],
    [{ recordId: " govuk-discovery:api:flood-monitoring" }, false],
    [{ recordId: "govuk-discovery:federated:legislation:1" }, false],
    [{ recordId: "govuk-discovery:api:flood-monitoring", extra: true }, false],
    [{}, false],
  ];
  for (const [value, expected] of cases) {
    assert.equal(schemas.input(value), expected, JSON.stringify(value));
    if (expected) assert.deepEqual(parsePresentResourceEvidenceInput(value), value);
    else assert.throws(() => parsePresentResourceEvidenceInput(value), BeginnerPresentationContractError);
  }
});

test("projection and envelope digests are stable across repeat execution", async () => {
  const { combined } = await runtimes();
  const input = { recordId: "govuk-discovery:federated:land-registry:57975" };
  const first = await executePresentResourceEvidence(combined, input);
  const second = await executePresentResourceEvidence(combined, structuredClone(input));
  assert.deepEqual(first.result, second.result);
  assert.equal(first.result.evidenceDigest, sha256(canonicalJson(first.result.evidence)));
});
