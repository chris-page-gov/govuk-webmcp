# Security Review: govuk-webmcp

## Scope

Complete security review of the 39-file working-tree implementation diff against fd2b7ae3176532e96b78fa31320e7fe27ec6cf51.

- Scan mode: working_tree
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: fd2b7ae3176532e96b78fa31320e7fe27ec6cf51...fd2b7ae3176532e96b78fa31320e7fe27ec6cf51
- Snapshot digest: codex-security-snapshot/v1:sha256:ec790806b470beee90957b039d8c4ad1b3269d4d168b4b77fde7c747d4c480a7
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: Local build, unit, installed-Chromium browser and targeted validation interfaces executed.
- Artifacts reviewed: 39 review items, 24 deterministic unit/contract tests, 17 Chromium browser tests, three targeted validation proofs
- Scan context: Evidence-first GOV.UK WebMCP implementation before remediation.

Limitations and exclusions:
- TAC advisory status was unknown and did not gate the scan.
- No native ChatGPT/WebMCP host call was available.
- One untracked Playwright snapshot is not shipped.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 2 |
| Severity mix | low: 2 |
| Confidence mix | high: 1, medium: 1 |
| Coverage | complete |
| Validation mode | Static source tracing plus focused real-interface reproduction. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Static same-origin browser app loading four digest-bound JSON/checksum pairs before creating one shared human/WebMCP action controller and registering five fixed tools. Three tools return read-only catalogue data; two may update only transient evidence presentation (src/webmcp-tools.ts:491-524,597-721; src/application-actions.ts:48-81).

### Assets

- Integrity and provenance of catalogue, receipts, Evidence Traces and corpus admissions (src/webmcp-tools.ts:174-288; src/evidence-runtime.ts:181-356; src/federation-runtime.ts:116-291).
- Truthful authoritative URLs and separate access, rights, assertion, freshness and limitation facets (app/index.html:115-122).
- Fixed five-tool capability and truthful three-read-only/two-presentation distinction (src/webmcp-tools.ts:597-647).
- Human availability without WebMCP and fail-closed tool registration (app/main.ts:747-781; src/webmcp-tools.ts:651-729).
- Protected exact-main build and Pages publication authority (.github/workflows/ci.yml:3-31; .github/workflows/pages.yml:3-40).

### Trust Boundaries

- Four authored sources cross into deterministic generation through the source-lock registry (app/data/sources/source-locks.json:4-37; scripts/validate-authored-sources.mjs:11-40).
- Eight relative same-origin resources cross into the browser with credentials omitted and one fetch abort signal (src/webmcp-tools.ts:491-517); CSP restricts active resources and connections to self (app/index.html:3-9).
- Raw checksums, nested digests, graph constraints, URL admission and catalogue cross-bindings gate runtime use (src/webmcp-tools.ts:174-288; src/evidence-runtime.ts:181-356; src/federation-runtime.ts:116-291).
- Untrusted source text crosses into inert DOM text and separately admitted HTTPS href values (app/main.ts:46-55,121-240,262-299,343-575).
- Untrusted page-host tool input crosses through closed schemas and executable validation into one shared action controller (src/webmcp-tools.ts:99-153,527-705).
- Only explicitly presenting actions cross from deterministic results into transient page state, after cancellation checks (src/application-actions.ts:37-79).
- Validated source crosses into public deployment only through exact-main rebuild/test and dist-only Pages publication (.github/workflows/pages.yml:15-40).

### Attacker Capabilities

- A WebMCP caller can choose JSON input but not URLs, credentials, callbacks or arbitrary context through the advertised contract.
- A navigator controls the URL fragment used for record, answer, claim and comparison routing (app/main.ts:654-695).
- Source producers control source-derived strings but not fixed tool definitions; text remains untrusted and inert.
- An ordinary runtime caller cannot modify authored sources, deployment bytes or the static origin.
- Repository or origin compromise already grants equivalent authority to replace executable JavaScript.

### Security Objectives

- Fail closed before UI enablement or registration when a mandatory artefact is invalid.
- Keep the runtime credential-free, provider-call-free and storage-free.
- Bound supported and rejected tool inputs before diagnostic work.
- Bound route parsing and all catalogue/evidence computation.
- Admit only credential-free official HTTPS links and exact corpus repository links.
- Prevent cancelled actions from committing stale presentation.
- Keep trust facets separate and score-free.

### Assumptions

- Snapshot governance files still describe three tools while source defines five; lockstep documentation is pending.
- The source-lock validator does not yet require an exact four-ID-to-path mapping; exploitation requires protected source-write/merge authority.
- The 10-second startup timer is not a hard end-to-end byte/CPU budget; ordinary tool callers cannot control same-origin artefacts.
- The whole UI intentionally fails closed if any mandatory evidence or federation artefact fails.
- SHA-256 sidecars prove consistency, not independent publisher authenticity.
- Abort-driven registration rollback depends on the browser host contract.
- No native ChatGPT/WebMCP host call was available in this offline scan.

## Findings

| Finding | Severity | Confidence | Detailed write-up |
| --- | --- | --- | --- |
| [Comparison route splits an unbounded public hash fragment](#finding-1) | low | medium | inline below |
| [Rejected tool input can exhaust the page during diagnostic hashing](#finding-2) | low | high | inline below |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct evidence supports the finding with no material unresolved blocker. |
| medium | Evidence supports a plausible issue, but material runtime or reachability proof remains. |
| low | Evidence is incomplete and the item is retained only for explicit follow-up. |

<a id="finding-1"></a>

### [1] Comparison route splits an unbounded public hash fragment

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | medium |
| Confidence rationale | Static tracing proves the missing pre-allocation bound. Chrome accepted a 1,000,054-character, 50,000-token fragment in about 1.23 seconds without crashing, confirming reachability but not severe impact at that size. |
| Category | resource-exhaustion |
| CWE | CWE-20, CWE-400 |
| Affected lines | app/main.ts:654-682, src/evidence-runtime.ts:386-401, src/application-actions.ts:73-74 |

#### Summary

Hash routing materialises every comma-separated comparison token before enforcing the two-to-four-claim limit, then passes the rejected array through diagnostic hashing. An unusually long crafted link can consume main-thread time and memory.

#### Root Cause

Semantic claim-count validation ran only after unbounded string parsing and allocation.

#### Validation

Chrome accepted a 1,000,054-character fragment with 50,000 claim tokens; no page error occurred in the bounded proof.

#### Dataflow

Public hash -\> URLSearchParams -\> unbounded split/filter -\> rejected compare action -\> diagnostic hashing.

#### Reachability

Reachable through a public crafted link; browser URL limits and single-tab scope constrain impact.

#### Severity

**Low** — Public crafted-link reachability is real, but only transient one-tab availability is affected and exploitation requires an unusually long fragment.

Additional runtime or deployment evidence could raise or lower this severity.

#### Remediation

Reject overlong fragments before URLSearchParams processing and parse at most four bounded comparison identifiers before invoking the action controller.

<a id="finding-2"></a>

### [2] Rejected tool input can exhaust the page during diagnostic hashing

| Field | Value |
| --- | --- |
| Severity | low |
| Confidence | high |
| Confidence rationale | The real generated catalogue runtime and shared controller reproduced a RangeError with a 20,000-level rejected object; static source establishes the complete path. |
| Category | resource-exhaustion |
| CWE | CWE-20, CWE-400, CWE-674 |
| Affected lines | src/webmcp-tools.ts:605-647, src/application-actions.ts:43-45, src/application-actions.ts:53-75, src/integrity.ts:3-8 |

#### Summary

After executable validation rejects tool input, the shared controller still serialises, parses and recursively canonicalises the original raw object for a diagnostic digest. A sufficiently deep or broad object can overflow the stack or stall the browser main thread.

#### Root Cause

Diagnostic parity hashing trusted the raw caller object after the supported contract rejected it.

#### Validation

Actual package-interface reproduction returned RangeError: Maximum call stack size exceeded for a 20,000-level input.

#### Dataflow

Tool input -\> validator error -\> raw input normalisation -\> recursive canonical JSON -\> page-context resource exhaustion.

#### Reachability

Reachable to a compatible WebMCP caller if host schema enforcement is absent or bypassed; impact is one visiting page context.

#### Severity

**Low** — Reproducible at the untrusted tool boundary but limited to one page/tool context, with no persistence, disclosure, credential access or external mutation.

Additional runtime or deployment evidence could raise or lower this severity.

#### Remediation

Apply a small structural and serialised-byte budget before dispatch, hash only accepted bounded input or a bounded rejection marker, and bound reflected unknown-field diagnostics.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Browser UI, route state and WebMCP actions | not recorded | Reported | DOM, CSP, links, five tools, annotations, validation, cancellation, registration and routing reviewed. Two low availability findings survived. |
| Evidence Trace and federation runtimes | not recorded | No issue found | Closed nested validation, graphs, cross-bindings, URLs, corpus states and computation bounds reviewed. |
| Authored and generated knowledge artefacts | not recorded | No issue found | Inspected as untrusted data; current sidecars and locks match; no active content, credential or unsafe URL survived controls. |
| Published knowledge and tool schemas | not recorded | No issue found | All changed schemas compiled; registered input copies are lockstep-tested; host schemas do not substitute for executable bounds. |
| Deterministic builders and source admission | not recorded | Rejected | Required-lock omission reproduced but rejected as a security finding because exploitation requires protected source-write/merge authority with equivalent application authority. It remains an assurance defect for remediation. |
| Untracked Playwright snapshot | not recorded | Not applicable | Developer artefact; not copied, compiled or shipped. |

## Open Questions And Follow Up

- A native ChatGPT/WebMCP host was unavailable; instrumented browser tests prove the page contract, not host discovery.
- The 10-second startup signal is not a complete byte/CPU budget; oversized same-origin artefacts require origin or protected source authority.
