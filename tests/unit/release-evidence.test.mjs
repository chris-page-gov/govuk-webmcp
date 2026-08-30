import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { posix, relative, sep, win32 } from "node:path";
import test from "node:test";

const EXPECTED_PRODUCT_COMMIT = "9235ee5db4df637bdb2a12e87449e871614afe68";
const EXPECTED_PAGES_RUN_ID = 33286771963;

test("Pages deployment is restricted to the exact main dispatch SHA", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/u);
  assert.doesNotMatch(workflow, /pull_request:/u);
});

test("current public SBOM matches the published release and omits third-party personal metadata", async () => {
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

async function listFilesRecursively(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(entryPath)));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function parseSha256Manifest(text, label) {
  assert.equal(text.includes("\r"), false, `${label} must use deterministic LF line endings`);
  return text.trimEnd().split("\n").map((line) => {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/u);
    assert.ok(match, `Malformed ${label} entry: ${line}`);
    return { expected: match[1], path: match[2] };
  });
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

test("supported-host WebMCP capture binds five native calls to the public release", async () => {
  const evidence = JSON.parse(await readFile(
    "docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json",
    "utf8",
  ));
  const expectedNames = [
    "search_government_knowledge",
    "get_resource_record",
    "show_provenance",
    "explore_answer_foundations",
    "compare_evidence_foundations",
  ];
  const expectedSchemas = [
    "trusted-govuk-discovery.search-result.v1",
    "trusted-govuk-discovery.resource-record-result.v1",
    "trusted-govuk-discovery.provenance-result.v1",
    "trusted-govuk-discovery.evidence-exploration-result.v1",
    "trusted-govuk-discovery.evidence-comparison-result.v1",
  ];

  assert.equal(evidence.schema, "trusted-govuk-discovery.supported-host-webmcp-capture.v1");
  assert.equal(evidence.page.origin, "https://chris-page-gov.github.io");
  assert.equal(evidence.page.release, "v0.2.0-rc.1");
  assert.equal(evidence.page.productCommit, EXPECTED_PRODUCT_COMMIT);
  assert.equal(evidence.page.url.startsWith("https://chris-page-gov.github.io/govuk-webmcp/"), true);
  assert.equal(evidence.host.name, "Codex In-app Browser");
  assert.equal(evidence.host.type, "iab");
  assert.equal(evidence.host.capabilities.includes("webmcp"), true);
  assert.equal(evidence.capture.pageAuthenticationRequired, false);
  assert.equal(evidence.capture.hostVersion, null);
  assert.match(evidence.capture.hostVersionLimitation, /did not expose/u);

  assert.equal(evidence.discovery.toolCount, 5);
  assert.deepEqual(evidence.discovery.tools.map((tool) => tool.name), expectedNames);
  assert.equal(new Set(expectedNames).size, expectedNames.length);
  assert.ok(evidence.discovery.tools.every((tool) => tool.inputSchema.additionalProperties === false));
  assert.deepEqual(
    evidence.discovery.tools.map((tool) => tool.annotations.readOnlyHint),
    [true, true, true, false, false],
  );
  assert.ok(evidence.discovery.tools.every((tool) => tool.annotations.untrustedContentHint === true));

  assert.deepEqual(evidence.calls.map((call) => call.name), expectedNames);
  assert.deepEqual(evidence.calls.map((call) => call.callSequence), [1, 2, 3, 4, 5]);
  assert.deepEqual(evidence.calls.map((call) => call.result.schema), expectedSchemas);
  assert.ok(evidence.calls.every((call) => call.result.ok === true));
  for (const call of evidence.calls) {
    const digest = createHash("sha256").update(canonicalJson(call.result)).digest("hex");
    assert.equal(digest, call.canonicalResultDigest, `${call.name} canonical result digest drifted`);
  }

  const [search, record, provenance, explore, compare] = evidence.calls;
  assert.equal(search.result.returned, 3);
  assert.equal(search.result.totalMatches, 69);
  assert.ok(search.result.results.every((result) => result.canonicalHumanUrl.startsWith("https://www.gov.uk/")));
  assert.ok(search.result.results.every((result) => result.limitations.length > 0));
  assert.equal(record.result.record.id, provenance.result.recordId);
  assert.equal(record.result.record.canonicalHumanUrl, "https://www.gov.uk/child-benefit");
  assert.ok(provenance.result.sources.some((source) => source.url === "https://www.gov.uk/child-benefit"));

  assert.equal(explore.pageObservation.resultDigest, explore.canonicalResultDigest);
  assert.equal(compare.pageObservation.resultDigest, compare.canonicalResultDigest);
  assert.equal(evidence.finalPageObservation.displayResultDigest, compare.canonicalResultDigest);
  assert.equal(evidence.finalPageObservation.canonicalCallResultDigest, compare.canonicalResultDigest);
  assert.equal(evidence.finalPageObservation.digestParity, true);
  assert.deepEqual(evidence.finalPageObservation.selectedClaims, compare.input.claimIds);
  assert.deepEqual(evidence.finalPageObservation.comparisonSourceUrls, [
    "https://www.gov.uk/register-birth",
    "https://www.gov.uk/child-benefit",
  ]);
  for (const presentation of [explore.result, compare.result]) {
    assert.equal(presentation.boundaries.providerCall, false);
    assert.equal(presentation.boundaries.storageWrite, false);
    assert.equal(presentation.boundaries.catalogueMutation, false);
    assert.equal(presentation.boundaries.externalStateChange, false);
  }

  for (const artefact of evidence.artefacts) {
    const digest = createHash("sha256").update(await readFile(artefact.path)).digest("hex");
    assert.equal(digest, artefact.sha256, `${artefact.path} drifted from its capture receipt`);
  }

  const challenge = JSON.parse(await readFile(
    "docs/competition/evidence/challenge-provenance.json",
    "utf8",
  ));
  const hostEvidence = challenge.postReleaseEvidence.supportedHostWebmcp;
  assert.equal(hostEvidence.evidencePath, "docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json");
  assert.equal(hostEvidence.productCommit, EXPECTED_PRODUCT_COMMIT);
  assert.equal(hostEvidence.discoveredToolCount, 5);
  assert.equal(hostEvidence.successfulCallCount, 5);
  assert.equal(hostEvidence.comparisonResultDigest, compare.canonicalResultDigest);
  assert.equal(challenge.gates.nativeSupportedHostToolDiscoveryObserved, true);
  assert.equal(challenge.gates.nativeSupportedHostToolCallObserved, true);
  assert.equal(challenge.gates.manualScreenReaderObservationPerformed, true);
  assert.equal(challenge.gates.demoVideoPreflightPassed, true);
  assert.equal(challenge.gates.localDemoVideoBuilt, true);
  assert.equal(challenge.gates.finalDevpostComplianceReviewCompleted, true);
  assert.equal(challenge.gates.demoVideoHumanReviewComplete, false);
  assert.equal(challenge.gates.videoPublished, false);
  assert.equal(challenge.gates.devpostRegistrationPerformedByThisWorkflow, false);
  assert.equal(challenge.gates.devpostSubmissionPerformed, false);

  const manualVoiceOver = challenge.postReleaseEvidence.manualVoiceOver;
  assert.equal(manualVoiceOver.evidencePath, "docs/competition/evidence/manual-voiceover-journey-2026-08-30.json");
  assert.equal(manualVoiceOver.status, "completed-with-limitations");
  assert.equal(manualVoiceOver.journeyCheckpointCount, 9);
  assert.equal(manualVoiceOver.passedCheckpointCount, 7);
  assert.equal(manualVoiceOver.limitedCheckpointCount, 2);
  assert.equal(manualVoiceOver.screenReaderAudioCaptured, false);
  assert.equal(manualVoiceOver.media.sha256, "5b5b19c914fabd0062fb5ec3813a452ab567a614c94b505ffd8edc7259a9ffdf");

  const demoPipeline = challenge.postReleaseEvidence.demoPipeline;
  assert.equal(demoPipeline.preflightPassed, true);
  assert.deepEqual(demoPipeline.expectedMissingInputs, []);
  assert.equal(demoPipeline.localFinalVideoBuilt, true);
  assert.equal(demoPipeline.localFinalVideo.durationSeconds, 142.92);
  assert.equal(demoPipeline.localFinalVideo.sha256, "efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a");
  assert.equal(demoPipeline.publicVideoPublished, false);
  assert.equal(
    challenge.postReleaseEvidence.finalDevpostComplianceReview.evidencePath,
    "docs/competition/final-devpost-compliance-review-2026-08-30.md",
  );
});

test("release evidence manifest is safe, complete, ordered and digest-bound", async () => {
  const manifest = await readFile("docs/competition/evidence/SHA256SUMS", "utf8");
  const entries = parseSha256Manifest(manifest, "SHA256SUMS");
  assert.ok(entries.length >= 35);

  const paths = entries.map((entry) => entry.path);
  assert.deepEqual(paths, [...paths].sort(), "SHA256SUMS paths must remain bytewise ordered");
  assert.equal(new Set(paths).size, paths.length, "SHA256SUMS paths must be unique");

  const repositoryRoot = await realpath(".");
  for (const entryPath of paths) {
    assert.equal(posix.isAbsolute(entryPath), false, `POSIX absolute evidence path is not allowed: ${entryPath}`);
    assert.equal(win32.isAbsolute(entryPath), false, `Windows absolute evidence path is not allowed: ${entryPath}`);
    assert.equal(entryPath.includes("\\"), false, `Backslash evidence path is not allowed: ${entryPath}`);
    assert.equal(posix.normalize(entryPath), entryPath, `Non-canonical evidence path is not allowed: ${entryPath}`);
    assert.equal(
      entryPath.split("/").some((segment) => segment === "." || segment === ".."),
      false,
      `Traversal evidence path is not allowed: ${entryPath}`,
    );
    assert.equal(entryPath.endsWith("/.DS_Store"), false, `Local macOS metadata is not release evidence: ${entryPath}`);

    const fileStatus = await lstat(entryPath);
    assert.equal(fileStatus.isSymbolicLink(), false, `Symbolic links are not release evidence: ${entryPath}`);
    assert.equal(fileStatus.isFile(), true, `Release evidence must be a regular file: ${entryPath}`);

    const resolvedPath = await realpath(entryPath);
    const pathFromRoot = relative(repositoryRoot, resolvedPath);
    assert.equal(
      pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || posix.isAbsolute(pathFromRoot) || win32.isAbsolute(pathFromRoot),
      false,
      `Release evidence resolves outside the repository: ${entryPath}`,
    );
  }

  const evidenceFiles = (await listFilesRecursively("docs/competition/evidence"))
    .filter((path) => path !== "docs/competition/evidence/SHA256SUMS")
    .sort();
  const manifestedEvidenceFiles = paths
    .filter((path) => path.startsWith("docs/competition/evidence/"))
    .sort();
  assert.deepEqual(
    manifestedEvidenceFiles,
    evidenceFiles,
    "SHA256SUMS must bind every evidence file except itself",
  );

  const releaseDataFiles = (await listFilesRecursively("app/data"))
    .filter((path) => !path.endsWith("/.DS_Store"))
    .sort();
  const contractFiles = (await listFilesRecursively("schemas")).sort();
  const expectedPaths = [...releaseDataFiles, ...evidenceFiles, "package-lock.json", ...contractFiles].sort();
  assert.deepEqual(paths, expectedPaths, "SHA256SUMS must contain exactly the release data, evidence, package lock and schemas");

  for (const entry of entries) {
    const observed = createHash("sha256").update(await readFile(entry.path)).digest("hex");
    assert.equal(observed, entry.expected, `Evidence digest mismatch for ${entry.path}`);
  }
});

test("live Pages evidence agrees across manifest, observation, metadata and provenance", async () => {
  const siteManifest = parseSha256Manifest(
    await readFile("docs/competition/evidence/site-SHA256SUMS-2026-08-30", "utf8"),
    "site-SHA256SUMS-2026-08-30",
  );
  assert.equal(siteManifest.length, 20, "The published site evidence must retain all 20 deployed files");
  assert.deepEqual(
    siteManifest.map((entry) => entry.path),
    siteManifest.map((entry) => entry.path).sort(),
    "The published site manifest must remain bytewise ordered",
  );

  const live = JSON.parse(await readFile("docs/competition/evidence/live-artifact-verification-2026-08-30.json", "utf8"));
  assert.equal(live.productCommit, EXPECTED_PRODUCT_COMMIT);
  assert.equal(live.pagesRunId, EXPECTED_PAGES_RUN_ID);
  assert.equal(live.results.length, siteManifest.length);
  assert.ok(live.results.every((result) => result.status === 200 && result.equalsPagesArtifact === true));
  assert.deepEqual(
    live.results.map((result) => ({ expected: result.sha256, path: result.path })),
    siteManifest,
    "Every recorded live response must match the downloaded Pages artefact manifest",
  );

  const deploymentBytes = await readFile("docs/competition/evidence/live-deployment-metadata-2026-08-30.json");
  const deployment = JSON.parse(deploymentBytes.toString("utf8"));
  const deploymentDigest = createHash("sha256").update(deploymentBytes).digest("hex");
  const deploymentManifestEntry = siteManifest.find((entry) => entry.path === "deployment.json");
  assert.ok(deploymentManifestEntry, "The site manifest must include deployment.json");
  assert.equal(deploymentDigest, deploymentManifestEntry.expected);
  assert.equal(deployment.commit, EXPECTED_PRODUCT_COMMIT);
  assert.equal(Number(deployment.runId), EXPECTED_PAGES_RUN_ID);

  const provenance = JSON.parse(await readFile("docs/competition/evidence/challenge-provenance.json", "utf8"));
  assert.equal(provenance.candidate.commit, EXPECTED_PRODUCT_COMMIT);
  assert.equal(provenance.candidate.deployment.runId, EXPECTED_PAGES_RUN_ID);
  assert.equal(provenance.candidate.deployment.artifactId, live.artifactId);
  assert.equal(provenance.candidate.deployment.deploymentMetadataSha256, deploymentDigest);
  assert.equal(provenance.candidate.release.targetCommit, EXPECTED_PRODUCT_COMMIT);
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
