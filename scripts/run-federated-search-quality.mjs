#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const FIXTURE_RELATIVE_PATH = "evals/federated-search-quality.json";
const SHA256 = /^[a-f0-9]{64}$/u;
const CASE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const RECORD_ID = /^govuk-discovery:federated:(uk-living|ons|government-apis|land-registry):(0|[1-9][0-9]{0,5})$/u;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;
const COLLECTIONS = Object.freeze(["uk-living", "ons", "government-apis", "land-registry"]);
const CATEGORY_ORDER = Object.freeze([
  "exact-id", "title", "publisher", "topic", "multi-token", "ambiguous", "no-match", "cross-source",
]);
const ROOT_KEYS = new Set([
  "schema", "evaluationProfile", "manifestDigest", "cutoffs", "thresholds", "expectedResultDigest", "cases",
  "prohibitedLegislation",
]);
const CUTOFF_KEYS = new Set(["ndcg", "recall"]);
const THRESHOLD_KEYS = new Set(["minimumMeanNdcgAt10", "minimumMeanRecallAt20"]);
const CASE_KEYS = new Set([
  "id", "category", "query", "collections", "limit", "expectedTotalMatches", "judgements", "rationale",
]);
const JUDGEMENT_KEYS = new Set(["recordId", "gain", "reason"]);
const LEGISLATION_KEYS = new Set(["query", "collection", "expectedErrorCode"]);

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactObject(value, allowed, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain data object.`);
  }
  const object = value;
  for (const key of Reflect.ownKeys(object)) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (typeof key !== "string" || !allowed.has(key) || !descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} contains an unknown or non-data field.`);
    }
  }
  for (const key of allowed) {
    if (!Object.hasOwn(object, key)) throw new Error(`${label} is missing ${key}.`);
  }
  return object;
}

function dataArray(value, label, minimum, maximum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new Error(`${label} must contain from ${minimum} to ${maximum} items.`);
  }
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => key !== "length" && (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/u.test(key)))) {
    throw new Error(`${label} must contain indexed data items only.`);
  }
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new Error(`${label} must not contain accessors or empty positions.`);
    }
  }
  return value;
}

function boundedString(value, label, minimum, maximum) {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum || CONTROL_CHARACTERS.test(value)) {
    throw new Error(`${label} must be a bounded string without control characters.`);
  }
  return value;
}

function boundedInteger(value, label, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}.`);
  }
  return value;
}

function boundedMetric(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be a finite number from zero to one.`);
  }
  return value;
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateFederatedSearchQualityFixture(value) {
  const root = exactObject(value, ROOT_KEYS, "Federated-search quality fixture");
  if (root.schema !== "govuk-webmcp.federated-search-quality.v1") throw new Error("The quality fixture schema is unsupported.");
  if (root.evaluationProfile !== "frozen-authored-lexical-relevance-v1") {
    throw new Error("The quality fixture evaluation profile is unsupported.");
  }
  if (typeof root.manifestDigest !== "string" || !SHA256.test(root.manifestDigest) ||
      typeof root.expectedResultDigest !== "string" || !SHA256.test(root.expectedResultDigest)) {
    throw new Error("The quality fixture manifest or result digest is invalid.");
  }
  const cutoffs = exactObject(root.cutoffs, CUTOFF_KEYS, "Quality cutoffs");
  if (cutoffs.ndcg !== 10 || cutoffs.recall !== 20) throw new Error("The quality cutoffs must remain nDCG@10 and Recall@20.");
  const thresholds = exactObject(root.thresholds, THRESHOLD_KEYS, "Quality thresholds");
  boundedMetric(thresholds.minimumMeanNdcgAt10, "Minimum mean nDCG@10");
  boundedMetric(thresholds.minimumMeanRecallAt20, "Minimum mean Recall@20");

  const rawCases = dataArray(root.cases, "Quality cases", CATEGORY_ORDER.length, CATEGORY_ORDER.length);
  const caseIds = new Set();
  const categories = new Set();
  const cases = rawCases.map((value, index) => {
    const item = exactObject(value, CASE_KEYS, `Quality case ${index + 1}`);
    const id = boundedString(item.id, `Quality case ${index + 1} identifier`, 3, 80);
    if (!CASE_ID.test(id) || caseIds.has(id)) throw new Error("Quality case identifiers must be unique canonical slugs.");
    caseIds.add(id);
    if (item.category !== CATEGORY_ORDER[index] || categories.has(item.category)) {
      throw new Error("Quality cases must cover each required category once in the fixed order.");
    }
    categories.add(item.category);
    const query = boundedString(item.query, `Query for ${id}`, 2, 160);
    const collections = dataArray(item.collections, `Collections for ${id}`, 1, COLLECTIONS.length).map((collection) => {
      if (typeof collection !== "string" || !COLLECTIONS.includes(collection)) {
        throw new Error(`Collections for ${id} include an unsupported collection.`);
      }
      return collection;
    });
    if (new Set(collections).size !== collections.length || collections.some((collection, collectionIndex) =>
      collectionIndex > 0 && COLLECTIONS.indexOf(collections[collectionIndex - 1]) > COLLECTIONS.indexOf(collection))) {
      throw new Error(`Collections for ${id} must be unique and in fixed display order.`);
    }
    if (item.limit !== 20) throw new Error(`The result limit for ${id} must remain 20.`);
    const expectedTotalMatches = boundedInteger(item.expectedTotalMatches, `Expected total matches for ${id}`, 0, 58_652);
    const rawJudgements = dataArray(item.judgements, `Judgements for ${id}`, item.category === "no-match" ? 0 : 1, 20);
    const recordIds = new Set();
    const judgements = rawJudgements.map((value, judgementIndex) => {
      const judgement = exactObject(value, JUDGEMENT_KEYS, `Judgement ${judgementIndex + 1} for ${id}`);
      if (typeof judgement.recordId !== "string" || !RECORD_ID.test(judgement.recordId) || recordIds.has(judgement.recordId)) {
        throw new Error(`Judgements for ${id} contain an invalid or duplicate record identifier.`);
      }
      const collectionId = RECORD_ID.exec(judgement.recordId)[1];
      if (!collections.includes(collectionId)) throw new Error(`A judgement for ${id} is outside its selected collections.`);
      recordIds.add(judgement.recordId);
      return {
        recordId: judgement.recordId,
        gain: boundedInteger(judgement.gain, `Gain for ${judgement.recordId}`, 1, 3),
        reason: boundedString(judgement.reason, `Reason for ${judgement.recordId}`, 20, 300),
      };
    });
    if ((item.category === "no-match") !== (expectedTotalMatches === 0 && judgements.length === 0)) {
      throw new Error("Only the no-match case may declare zero matches and no relevance judgements.");
    }
    return {
      id,
      category: item.category,
      query,
      collections,
      limit: 20,
      expectedTotalMatches,
      judgements,
      rationale: boundedString(item.rationale, `Rationale for ${id}`, 20, 500),
    };
  });

  const prohibited = exactObject(root.prohibitedLegislation, LEGISLATION_KEYS, "Prohibited-legislation check");
  if (prohibited.collection !== "legislation" || prohibited.expectedErrorCode !== "invalid_federated_search_request") {
    throw new Error("The prohibited-legislation collection or expected failure code has drifted.");
  }
  boundedString(prohibited.query, "Prohibited-legislation query", 2, 160);
  return deepFreeze({
    schema: root.schema,
    evaluationProfile: root.evaluationProfile,
    manifestDigest: root.manifestDigest,
    cutoffs: { ndcg: 10, recall: 20 },
    thresholds: {
      minimumMeanNdcgAt10: thresholds.minimumMeanNdcgAt10,
      minimumMeanRecallAt20: thresholds.minimumMeanRecallAt20,
    },
    expectedResultDigest: root.expectedResultDigest,
    cases,
    prohibitedLegislation: {
      query: prohibited.query,
      collection: "legislation",
      expectedErrorCode: "invalid_federated_search_request",
    },
  });
}

function gainsById(judgements) {
  return new Map(judgements.map(({ recordId, gain }) => [recordId, gain]));
}

function dcg(gains) {
  return gains.reduce((total, gain, index) => total + ((2 ** gain) - 1) / Math.log2(index + 2), 0);
}

export function ndcgAt(rankedRecordIds, judgements, cutoff = 10) {
  const gains = gainsById(judgements);
  const observed = dcg(rankedRecordIds.slice(0, cutoff).map((recordId) => gains.get(recordId) ?? 0));
  const ideal = dcg(judgements.map(({ gain }) => gain).sort((left, right) => right - left).slice(0, cutoff));
  return ideal === 0 ? null : observed / ideal;
}

export function recallAt(rankedRecordIds, judgements, cutoff = 20) {
  if (!judgements.length) return null;
  const relevant = new Set(judgements.map(({ recordId }) => recordId));
  return new Set(rankedRecordIds.slice(0, cutoff).filter((recordId) => relevant.has(recordId))).size / relevant.size;
}

function rounded(value) {
  return value === null ? null : Number(value.toFixed(9));
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

async function exactFileLoader(repositoryRoot) {
  const releaseRoot = resolve(repositoryRoot, "dist");
  const namespace = resolve(releaseRoot, "data", "federated-search");
  const realNamespace = await realpath(namespace);
  const namespacePrefix = `${namespace}${sep}`;
  const realNamespacePrefix = `${realNamespace}${sep}`;
  return async (path, options) => {
    if (options.credentials !== "omit" || options.redirect !== "error") {
      throw new Error("The quality loader requires the runtime's exact credential-free options.");
    }
    options.signal.throwIfAborted();
    if (typeof path !== "string" || !path.startsWith("data/federated-search/") ||
        path.includes("%") || path.includes("\\") || path.split("/").includes("..")) {
      throw new Error("The quality loader path is outside the exact same-origin namespace.");
    }
    const absolute = resolve(releaseRoot, path);
    if (!absolute.startsWith(namespacePrefix)) throw new Error("The quality loader resolved outside its same-origin namespace.");
    const stat = await lstat(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("The quality loader accepts regular shard files only.");
    const realAbsolute = await realpath(absolute);
    if (!realAbsolute.startsWith(realNamespacePrefix)) throw new Error("The quality loader rejected a linked shard ancestor.");
    return new Uint8Array(await readFile(realAbsolute, { signal: options.signal }));
  };
}

async function loadRuntime(repositoryRoot) {
  const distRoot = resolve(repositoryRoot, "dist", "src");
  const [{ createFederatedSearchRuntime }, { createFederationRuntime }, { createKnowledgeDiscoveryRuntime }] = await Promise.all([
    import(pathToFileURL(resolve(distRoot, "federated-search-runtime.js"))),
    import(pathToFileURL(resolve(distRoot, "federation-runtime.js"))),
    import(pathToFileURL(resolve(distRoot, "webmcp-tools.js"))),
  ]);
  const dataRoot = resolve(repositoryRoot, "dist", "data");
  const reviewed = await createKnowledgeDiscoveryRuntime(
    await readFile(resolve(dataRoot, "catalogue.json"), "utf8"),
    await readFile(resolve(dataRoot, "catalogue.json.sha256"), "utf8"),
    await readFile(resolve(dataRoot, "receipts.json"), "utf8"),
    await readFile(resolve(dataRoot, "receipts.json.sha256"), "utf8"),
  );
  const federation = await createFederationRuntime(
    await readFile(resolve(dataRoot, "federation.json"), "utf8"),
    await readFile(resolve(dataRoot, "federation.json.sha256"), "utf8"),
    reviewed.bundleDigest,
    reviewed.recordCount,
  );
  const runtime = await createFederatedSearchRuntime(
    await readFile(resolve(dataRoot, "federated-search", "manifest.json"), "utf8"),
    await readFile(resolve(dataRoot, "federated-search", "manifest.json.sha256"), "utf8"),
    await exactFileLoader(repositoryRoot),
    federation.federatedSearch,
  );
  return runtime;
}

async function executeCases(runtime, fixture) {
  const outputs = [];
  for (const item of fixture.cases) {
    const input = { query: item.query, collections: item.collections, limit: item.limit };
    const result = await runtime.search(input);
    if (!result.ok) throw new Error(`Quality case ${item.id} failed with ${result.error.code}.`);
    if (result.totalRelation !== "eq" || result.totalMatches !== item.expectedTotalMatches ||
        result.returned !== Math.min(item.expectedTotalMatches, item.limit) || result.truncated ||
        result.collectionStatuses.some(({ status }) => status !== "ready")) {
      throw new Error(`Quality case ${item.id} drifted from its complete frozen candidate boundary.`);
    }
    outputs.push({ id: item.id, input, result });
  }
  return outputs;
}

function measureCases(outputs, fixture) {
  const cases = outputs.map(({ id, result }, index) => {
    const fixtureCase = fixture.cases[index];
    if (fixtureCase.id !== id) throw new Error("Quality case execution order drifted.");
    const rankedRecordIds = result.results.map(({ recordId }) => recordId);
    return {
      id,
      category: fixtureCase.category,
      totalMatches: result.totalMatches,
      returned: result.returned,
      ndcgAt10: rounded(ndcgAt(rankedRecordIds, fixtureCase.judgements, fixture.cutoffs.ndcg)),
      recallAt20: rounded(recallAt(rankedRecordIds, fixtureCase.judgements, fixture.cutoffs.recall)),
    };
  });
  const judged = cases.filter(({ ndcgAt10, recallAt20 }) => ndcgAt10 !== null && recallAt20 !== null);
  return {
    cases,
    meanNdcgAt10: rounded(mean(judged.map(({ ndcgAt10 }) => ndcgAt10))),
    meanRecallAt20: rounded(mean(judged.map(({ recallAt20 }) => recallAt20))),
  };
}

export async function runFederatedSearchQuality(options = {}) {
  const repositoryRoot = resolve(options.repositoryRoot ?? DEFAULT_REPOSITORY_ROOT);
  const fixturePath = resolve(repositoryRoot, FIXTURE_RELATIVE_PATH);
  if (relative(repositoryRoot, fixturePath).startsWith("..")) throw new Error("The quality fixture is outside the repository.");
  const fixtureBytes = await readFile(fixturePath);
  const fixture = validateFederatedSearchQualityFixture(JSON.parse(fixtureBytes.toString("utf8")));
  const runtime = await loadRuntime(repositoryRoot);
  if (runtime.manifestDigest !== fixture.manifestDigest) {
    throw new Error("The quality fixture is not bound to the current federated-search manifest.");
  }

  const firstOutputs = await executeCases(runtime, fixture);
  const warmOutputs = await executeCases(runtime, fixture);
  if (canonicalJson(firstOutputs) !== canonicalJson(warmOutputs)) {
    throw new Error("Cold and warm deterministic federated search results disagree.");
  }
  const prohibitedInput = {
    query: fixture.prohibitedLegislation.query,
    collections: [fixture.prohibitedLegislation.collection],
    limit: 20,
  };
  const prohibitedResult = await runtime.search(prohibitedInput);
  const legislationCollectionAbsent = !runtime.collectionIds.includes("legislation");
  const legislationRequestRejected = prohibitedResult.ok === false &&
    prohibitedResult.error.code === fixture.prohibitedLegislation.expectedErrorCode;
  if (!legislationCollectionAbsent || !legislationRequestRejected) {
    throw new Error("The prohibited legislation collection or request did not remain excluded.");
  }

  const metrics = measureCases(firstOutputs, fixture);
  if (metrics.meanNdcgAt10 < fixture.thresholds.minimumMeanNdcgAt10 ||
      metrics.meanRecallAt20 < fixture.thresholds.minimumMeanRecallAt20) {
    throw new Error("The frozen federated retrieval metrics fell below their authored diagnostic thresholds.");
  }
  const resultDigestInput = {
    schema: "govuk-webmcp.federated-search-quality-results.v1",
    manifestDigest: runtime.manifestDigest,
    cases: firstOutputs,
    prohibitedLegislation: {
      input: prohibitedInput,
      result: prohibitedResult,
      collectionAbsent: legislationCollectionAbsent,
    },
  };
  const resultDigest = sha256Hex(canonicalJson(resultDigestInput));
  if (options.enforceExpectedDigest !== false && resultDigest !== fixture.expectedResultDigest) {
    throw new Error(`The deterministic result digest drifted: expected ${fixture.expectedResultDigest}, observed ${resultDigest}.`);
  }
  return deepFreeze({
    schema: "govuk-webmcp.federated-search-quality-report.v1",
    evaluationProfile: fixture.evaluationProfile,
    fixturePath: FIXTURE_RELATIVE_PATH,
    fixtureSha256: sha256Hex(fixtureBytes),
    manifestDigest: runtime.manifestDigest,
    caseCount: fixture.cases.length,
    judgedCaseCount: metrics.cases.filter(({ ndcgAt10 }) => ndcgAt10 !== null).length,
    metrics,
    thresholds: fixture.thresholds,
    resultDigest,
    deterministicColdWarmMatch: true,
    prohibitedLegislation: {
      collectionAbsent: legislationCollectionAbsent,
      requestRejected: legislationRequestRejected,
      errorCode: prohibitedResult.error.code,
    },
    boundaries: {
      modelQualityClaimed: false,
      semanticAnswerQualityClaimed: false,
      corpusWideRecallClaimed: false,
      recallJudgementScope: "Only the frozen explicit relevant-record identifiers in this bounded lexical fixture.",
      officialApiCalled: false,
      modelProviderCalled: false,
      sourceDerivedContentIsUntrusted: true,
    },
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runFederatedSearchQuality().then(
    (report) => console.log(`${JSON.stringify(report, null, 2)}\n`),
    (error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    },
  );
}
