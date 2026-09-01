#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { projectRecordEvidence } from "../dist/src/beginner-presentation.js";
import { createCombinedKnowledgeRuntime } from "../dist/src/combined-knowledge-runtime.js";
import { createFederatedSearchRuntime } from "../dist/src/federated-search-runtime.js";
import { createFederationRuntime } from "../dist/src/federation-runtime.js";
import { createKnowledgeDiscoveryRuntime } from "../dist/src/webmcp-tools.js";

const EXPECTED_REVIEWED_RECORDS = 80;
const EXPECTED_FEDERATED_RECORDS = 58_652;

async function text(path) {
  return readFile(resolve(path), "utf8");
}

function assertSuccessful(value, label) {
  if (value?.ok !== true) throw new Error(`${label} did not resolve to a successful production result.`);
  return value;
}

function assertProjection(validate, ajv, value, label) {
  if (!validate(value)) {
    throw new Error(`${label} failed the closed Evidence answer schema: ${ajv.errorsText(validate.errors)}`);
  }
}

/**
 * Exercise the production record, provenance and presentation projections over
 * every admitted record. This is a build-time data audit, not a browser loop.
 */
export async function auditBeginnerPresentations(repositoryRoot = process.cwd()) {
  const appData = resolve(repositoryRoot, "app/data");
  const [
    rawCatalogue,
    rawCatalogueChecksum,
    rawReceipts,
    rawReceiptsChecksum,
    rawFederation,
    rawFederationChecksum,
    rawManifest,
    rawManifestChecksum,
    presentationSchema,
  ] = await Promise.all([
    text(resolve(appData, "catalogue.json")),
    text(resolve(appData, "catalogue.json.sha256")),
    text(resolve(appData, "receipts.json")),
    text(resolve(appData, "receipts.json.sha256")),
    text(resolve(appData, "federation.json")),
    text(resolve(appData, "federation.json.sha256")),
    text(resolve(appData, "federated-search/manifest.json")),
    text(resolve(appData, "federated-search/manifest.json.sha256")),
    text(resolve(repositoryRoot, "schemas/beginner-presentation.schema.json")).then(JSON.parse),
  ]);

  const catalogue = JSON.parse(rawCatalogue);
  if (!Array.isArray(catalogue.records) || catalogue.records.length !== EXPECTED_REVIEWED_RECORDS) {
    throw new Error("The production presentation audit requires exactly 80 reviewed records.");
  }
  const manifest = JSON.parse(rawManifest);
  if (!Array.isArray(manifest.collections) || manifest.recordCount !== EXPECTED_FEDERATED_RECORDS) {
    throw new Error("The production presentation audit requires exactly 58,652 federated records.");
  }

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validatePresentation = ajv.compile(presentationSchema);
  const reviewed = await createKnowledgeDiscoveryRuntime(
    rawCatalogue,
    rawCatalogueChecksum,
    rawReceipts,
    rawReceiptsChecksum,
  );
  const admission = await createFederationRuntime(
    rawFederation,
    rawFederationChecksum,
    reviewed.bundleDigest,
    reviewed.recordCount,
  );
  const federated = await createFederatedSearchRuntime(
    rawManifest,
    rawManifestChecksum,
    async (path) => new Uint8Array(await readFile(resolve(repositoryRoot, "app", path))),
    admission.federatedSearch,
  );
  const runtime = createCombinedKnowledgeRuntime(reviewed, federated);
  const started = performance.now();

  let reviewedRecords = 0;
  for (const source of catalogue.records) {
    const recordId = String(source.id);
    const [record, provenance] = await Promise.all([
      runtime.getRecord({ recordId }),
      runtime.showProvenance({ recordId }),
    ]);
    const projection = await projectRecordEvidence(
      assertSuccessful(record, `${recordId} record`),
      assertSuccessful(provenance, `${recordId} provenance`),
    );
    assertProjection(validatePresentation, ajv, projection, recordId);
    if (projection.selectionId !== recordId || projection.evidenceTier !== "reviewed-deep-evidence") {
      throw new Error(`${recordId} projected an incompatible reviewed identity or evidence tier.`);
    }
    reviewedRecords += 1;
  }

  const collectionCounts = {};
  const federatedRecords = await federated.visitValidatedRecords(async (record, provenance) => {
    const recordId = String(record.record.id);
    const projection = await projectRecordEvidence(record, provenance);
    assertProjection(validatePresentation, ajv, projection, recordId);
    if (projection.selectionId !== recordId || projection.evidenceTier !== "federated-source-snapshot") {
      throw new Error(`${recordId} projected an incompatible federated identity or evidence tier.`);
    }
    const collectionId = String(record.record.collectionId);
    collectionCounts[collectionId] = (collectionCounts[collectionId] ?? 0) + 1;
  });
  for (const collection of manifest.collections) {
    if (collectionCounts[collection.id] !== collection.recordCount) {
      throw new Error(`${collection.id} did not project its complete manifest-declared population.`);
    }
  }

  if (reviewedRecords !== EXPECTED_REVIEWED_RECORDS || federatedRecords !== EXPECTED_FEDERATED_RECORDS) {
    throw new Error("The production presentation audit did not cover the complete admitted corpus.");
  }
  return {
    schema: "govuk-webmcp.beginner-presentation-audit.v1",
    reviewedRecords,
    federatedRecords,
    collectionCounts,
    elapsedMilliseconds: Math.round(performance.now() - started),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await auditBeginnerPresentations();
  console.log(
    `Projected ${result.reviewedRecords.toLocaleString("en-GB")} reviewed and ` +
    `${result.federatedRecords.toLocaleString("en-GB")} federated records through the production Evidence answer contract ` +
    `in ${result.elapsedMilliseconds.toLocaleString("en-GB")} ms.`,
  );
}
