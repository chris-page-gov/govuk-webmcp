# Security Review: govuk-webmcp

## Scope

Complete exact-range review of the 55 security-relevant changed-file inventory from v0.2.0-rc.2 to d9a8eb1.

- Scan mode: branch_diff
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: 35fcedd39ed955278d3975a6dd80692fc6e32935...d9a8eb116652d32fb705f7e597c267359119fe93
- Snapshot digest: codex-security-snapshot/v1:sha256:e6f9c8ac28324c2b3761585121cbd6981a839503cf4f6a6f6d23ac19b153d21b
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: Deterministic local build/unit/browser/evaluation suites were green; focused runtime/security tests passed 51 of 51.
- Artifacts reviewed: 55 of 55 prepared review items, Source import/admission/build pipeline, Federated and combined browser runtimes, Five WebMCP tools and schemas, DOM rendering, CSP, evaluator and demo evidence pipeline

Limitations and exclusions:
- No third-party penetration test
- Supported-host and assistive-technology release observations remained pending
- Repository-write exploitation depends on merge authority

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 1 |
| Severity mix | low: 1 |
| Confidence mix | high: 1 |
| Coverage | complete |
| Validation mode | Exact commit-range static review plus focused dynamic mutation and 51-test runtime/security counterevidence suite. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

A public static Pages application builds checksum-labelled government discovery data from repository-vendored OKF source snapshots and exposes five read-only WebMCP tools. Primary risks are source substitution, untrusted-content execution, cross-origin retrieval, resource exhaustion, privacy leakage and release-evidence spoofing.

### Assets

- Integrity and provenance of four OKF source snapshots and 58,652 searchable records
- Citizen trust in human and WebMCP result parity
- Browser origin, credentials and availability
- Release and supported-host evidence

### Trust Boundaries

- Repository-authored source locks into deterministic build
- Same-origin static assets into browser runtime
- Untrusted source text into structured tool output and DOM text nodes
- Host or evaluator around the page's WebMCP registration

### Attacker Capabilities

- Supply altered source or metadata bytes upstream
- Submit or merge a repository change under the applicable collaboration controls
- Provide hostile free-text query or source-authored strings
- Invoke WebMCP tools repeatedly within schema bounds

### Security Objectives

- Reject unreviewed source identities before generation
- Keep runtime fetching same-origin, credential-free and bounded
- Keep source text inert and visibly untrusted
- Expose deterministic human/tool parity with explicit limitations

### Assumptions

- Protected-main and Pages workflow remain enforced
- Native browser fetch honours AbortSignal
- GitHub and the authenticated user account are outside application scope

## Findings

| Finding | Severity | Confidence | Detailed write-up |
| --- | --- | --- | --- |
| [Normal build accepts co-digested source-lock substitution](#finding-1) | low | high | inline below |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct evidence supports the finding with no material unresolved blocker. |
| medium | Evidence supports a plausible issue, but material runtime or reachability proof remains. |
| low | Evidence is incomplete and the item is retained only for explicit follow-up. |

<a id="finding-1"></a>

### [1] Normal build accepts co-digested source-lock substitution

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | Static dataflow and a dynamic same-count co-digested mutation both reproduced acceptance on the exact scanned commit. |
| Category | supply-chain-integrity |
| CWE | CWE-345 |
| Affected lines | scripts/lib/source-locks.mjs:91-149, scripts/build-federated-search.mjs:231-403, scripts/import-okf-federation.mjs:605-627 |

#### Summary

The normal source admission path validates imported source bytes against a digest supplied by the same mutable registry. A repository-level change can therefore replace same-count source data, recompute all nested and registry digests, and publish altered records under checksum-bound provenance claims without changing a separately admitted release identity.

#### Root Cause

The code-reviewed release policy binds source identifiers, paths and counts, while the expected byte digest is read from source-locks.json alongside the data it is meant to authenticate. The independent federation-lock byte pin is not exercised by normal build admission.

#### Validation

A same-count federation-lock mutation with recomputed entry, aggregate and lock digests was accepted by the production semantic validator; code inspection confirms normal source admission trusts the registry's co-mutable digest.

#### Dataflow

Alter vendored bytes -\> recompute embedded pins -\> recompute registry importedSha256 -\> normal validation and build accept -\> Pages publishes altered provenance-labelled result.

#### Reachability

Reachable only through a committed repository data mutation followed by review/merge, normal CI/build and Pages deployment.

#### Severity

**Low** — Successful exploitation can publish forged source-derived records under the project's provenance claims, but requires merged repository write authority and cannot be triggered by a page visitor or upstream network attacker.

Additional runtime or deployment evidence could raise or lower this severity.

#### Remediation

Add separately code-reviewed imported SHA-256 values for every admitted source to executable release policy; require the registry digest to match before trusting bytes; directly require the reviewed federation-lock byte pin in its standalone builder; add a same-count co-digested source-and-registry mutation regression test.

Tests:
- Normal production source validation passes exact pins
- Same-count source and registry co-mutation fails before content consumption
- Federated builder rejects any federation lock whose raw bytes differ from the reviewed pin

Preventive controls:
- Exact paths, counts and schemas
- Manual importer code-reviewed byte pin
- Protected main and Pages workflow
- Same-origin deterministic runtime validation

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Source and build supply chain | not recorded | Reported | One low-severity co-digested source-substitution provenance defect reproduced. |
| Federated runtime and resource controls | not recorded | No issue found | Integrity, same-origin loading, cancellation, concurrency, queue and partial-failure controls reviewed; bounded residuals retained. |
| WebMCP inputs, outputs and untrusted content | not recorded | No issue found | All five tools, executable validation, inert rendering, HTTPS link checks and privacy boundary reviewed. |
| Release evidence and evaluator | not recorded | No issue found | Credential allowlisting and exact-commit evidence binding reviewed; pending real observations are not claimed. |
