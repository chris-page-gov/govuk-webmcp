# Security Review: govuk-webmcp

## Scope

Complete security discovery review of all 44 source-like files in the immutable working-tree snapshot against fd2b7ae3176532e96b78fa31320e7fe27ec6cf51.

- Scan mode: working_tree
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: fd2b7ae3176532e96b78fa31320e7fe27ec6cf51...fd2b7ae3176532e96b78fa31320e7fe27ec6cf51
- Snapshot digest: codex-security-snapshot/v1:sha256:2a7a423b127342ffd154628d1288132a8ef967978ce53b7f8b1b71129ba9be9d
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: Local static tracing, strict schema compilation, data validation and focused security regressions executed.
- Artifacts reviewed: 44 compact diff review items, 20 strict-compiled JSON Schemas, 493 admitted URL values, 53 focused security and assurance regressions
- Scan context: Final pre-PR Evidence Trace and bounded-federation candidate snapshot.

Limitations and exclusions:
- TAC advisory status was unknown and did not gate the scan.
- No native ChatGPT/WebMCP host call was available.
- The immutable scan snapshot predates final stricter exact-count, record-ID parity, workflow and documentation deltas.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | complete |
| Validation mode | Compact diff discovery with two independent non-overlapping source reviews. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Static same-origin TypeScript browser application that verifies four checksum-bound artefact families before creating one shared human/WebMCP action controller and registering five fixed page-scoped tools. Three tools query packaged data; two make only reversible in-memory presentation changes.

### Assets

- Integrity and provenance of four authored source locks, 80 catalogue records, 80 receipts, one Evidence Trace and ten corpus admissions.
- Truthful separation of authority, assertion, freshness, integrity, access, rights, coverage and limitations without a combined trust score.
- Fixed five-tool capability, executable/schema input parity and truthful three-query/two-presentation effect annotations.
- Human-interface availability without WebMCP and fail-closed all-or-nothing tool registration.
- Protected exact-main build and GitHub Pages publication authority.

### Trust Boundaries

- Four fixed authored files cross into deterministic generation through regular-file, exact ID/path/count and SHA-256 source-lock admission.
- Eight relative same-origin resources cross into the browser with credentials omitted, then raw checksums, closed validation, nested digests and cross-bindings gate use.
- Human fragment and WebMCP JSON input cross through bounded executable validation into one shared action controller.
- Source-derived untrusted text crosses only into inert DOM text; links cross purpose-specific credential-free HTTPS allowlists.
- Five fixed tool definitions cross into a compatible secure document.modelContext after validation; the host owns discovery, invocation, retention and AbortSignal enforcement.
- Only successful explicitly presenting actions cross into transient page state after cancellation checks.
- The exact tested main commit crosses into Pages only through a manually dispatched, scoped-permission workflow.

### Attacker Capabilities

- An unauthenticated visitor controls bounded search/filter values and URL fragments but not repository files, same-origin code or deployment authority.
- A WebMCP caller or compatible host can supply arbitrary attempted tool input, cancel calls and observe public tool/page data; no URL, credential, selector, callback or conversation-context input is accepted.
- A repository contributor may propose changes but is not assumed to hold merge, Pages environment or deployment authority.
- An upstream site controls content only after user navigation or the separately invoked link audit; the application makes no runtime provider request.
- A party controlling the static origin can co-modify code, data and sidecars and therefore already has page-content authority.

### Security Objectives

- Preserve static, same-origin, credential-free and no-runtime-provider operation.
- Admit only the exact four authored regular files and fail on ID, path, count, identity or digest mismatch.
- Validate every artefact family and relationship before WebMCP registration.
- Keep source-derived strings inert and URLs allowlisted by purpose.
- Keep schemas and executable validation in parity, reject unknown or oversized input, cap result sets and do not hash rejected complex input.
- Keep query and presentation effects truthful and page-scoped.
- Bind Pages publication to an exact tested main commit.

### Assumptions

- The supported origin serves the complete built artefact without injection; package hashes prove consistency, not independent origin or publisher authenticity.
- A native ChatGPT/WebMCP host invocation was unavailable; instrumented Chrome and Edge exercise the page contract but not host discovery.
- Host-side rollback of registered tools ultimately depends on the host honouring AbortSignal.
- Source locks do not independently prove upstream signatures, rights or current publisher accuracy.
- The snapshot captured the full substantive candidate before final stricter exact-count, record-ID parity, workflow and documentation deltas; those later changes require a separately recorded post-snapshot review.

## Findings

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Browser UI, routes, action controller and WebMCP runtime | not recorded | No issue found | Reviewed DOM sinks, CSP, links, fragment routing, closed inputs, cancellation, five fixed tools, truthful effects, registration lifecycle, checksums, nested digests, graph/binding validation and same-origin loading. No attacker-controlled value reaches an executable, credential, storage, arbitrary-network or deployment sink. |
| Authored and generated knowledge artefacts | not recorded | No issue found | Inspected as untrusted data. Sidecars and locks matched; 493 URLs were canonical credential-free HTTPS values within their purpose-specific allowlists; no active-content, prototype-sensitive or traversal-shaped value survived controls. |
| Twenty published authored, generated and tool schemas | not recorded | No issue found | All schemas compiled under strict AJV 2020 with resolved references. Registered input copies are lockstep-tested; browser startup independently enforces executable validation. |
| Deterministic builders, source admission, copying and validation | not recorded | No issue found | All read/write targets are fixed. Source admission requires exact release paths, regular non-symlink identity, O_NOFOLLOW where available, inode continuity, counts and SHA-256. No dynamic command, import, network destination or attacker-selected path sink exists. |

## Open Questions And Follow Up

- A native ChatGPT/WebMCP host was unavailable; instrumented browser tests prove the page contract, not host discovery.
- Registration rollback depends on the host honouring AbortSignal.
- Post-snapshot stricter exact-count, record-ID parity, workflow and documentation deltas are outside this immutable snapshot and need a separate bounded review.
