# Security Review: govuk-webmcp

## Scope

Complete exact-range review of all 55 security-relevant items changed from v0.2.0-rc.2 to fixed candidate 9c6ed7d.

- Scan mode: branch_diff
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: 35fcedd39ed955278d3975a6dd80692fc6e32935...9c6ed7d9a21574972ee564b333cbc49983058554
- Snapshot digest: codex-security-snapshot/v1:sha256:77e22674c167accddae3c849ef48d333fd9ec9476a1bb561c540f03093020630
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: Production build and 193 prepared unit tests passed before scan; reviewers added 33 source/federation tests, 54 runtime tests, 88 WebMCP/evidence tests, 6 focused Chrome tests and 58,652-record/122,533-link inspection.
- Artifacts reviewed: 55 of 55 prepared review items, Source import/admission/build pipeline and all five executable source pins, Federated and combined browser runtimes plus all 58,652 generated records, Five WebMCP tools and closed schemas, DOM rendering, CSP, evaluator and demo evidence pipeline

Limitations and exclusions:
- No third-party penetration test
- Supported-host and assistive-technology release observations remain pending
- Repository authenticity is rooted in protected review, not publisher signatures

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | complete |
| Validation mode | Exact commit-range static review plus independent source-substitution proofs, focused unit/browser suites and complete generated-corpus link/content scan. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

A public static Pages application builds checksum-labelled government discovery data from repository-vendored OKF source snapshots and exposes five read-only or reversible-presentation WebMCP tools. Primary risks are source substitution, untrusted-content execution, cross-origin retrieval, resource exhaustion, privacy leakage and release-evidence spoofing.

### Assets

- Integrity and provenance of four OKF source snapshots and 58,652 searchable records
- Citizen trust in human and WebMCP result parity
- Browser origin, credentials and availability
- Release and supported-host evidence

### Trust Boundaries

- Repository-authored source locks into deterministic build
- Same-origin static assets into browser runtime
- Untrusted source text into structured tool output and DOM text nodes
- Host or evaluator around page WebMCP registration

### Attacker Capabilities

- Supply altered source or metadata bytes upstream
- Submit a repository change subject to protected review
- Provide hostile free-text query or source-authored strings
- Invoke WebMCP tools repeatedly within or outside schema bounds

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

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Source and build supply chain | not recorded | No issue found | All five tracked sources match separately code-reviewed pins; normal admission rejects registry drift before consumption; direct builder verifies reviewed lock bytes. Production co-digested mutation rejected and focused tests passed 33 of 33. |
| Federated runtime, untrusted data and resource controls | not recorded | No issue found | Same-origin integrity, canonical URLs, inert rendering, physical work bounds and partial failure reviewed. Runtime tests passed 54 of 54, Chrome 6 of 6 and 58,652 records/122,533 URLs contained no unsafe or legislation result link. |
| Five WebMCP tools, privacy and host boundaries | not recorded | No issue found | Closed bounded schemas, executable validation, effects, untrusted hints, registration rollback and no caller-controlled fetch reviewed. Focused tool/evidence tests passed 88 of 88. |
| Evaluator, release evidence and demonstration authenticity | not recorded | No issue found | Credential allowlisting, loopback model boundary, exact release binding and reconstruction labelling reviewed. Pending observations are not claimed as current-candidate evidence. |
| Published schemas and generated-data contracts | not recorded | No issue found | Closed schemas, generated bindings, quality fixtures and output envelopes reviewed and exercised through build and tests. |
