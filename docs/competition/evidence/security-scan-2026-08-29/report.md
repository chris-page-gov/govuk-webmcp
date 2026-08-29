# Security Review: govuk-webmcp

## Scope

Complete repository-wide static audit of the current target revision.

- Scan mode: repository
- Target kind: git_revision
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision: 260d68fb1c76ed83ace8f72ff57050113c2e2a95
- Inventory strategy: repository
- Included paths: .
- Excluded paths: none
- Runtime or test status: not recorded
- Scan context: Pre-publication review of commit 260d68fb1c76ed83ace8f72ff57050113c2e2a95.

Limitations and exclusions:
- Runtime host behaviour and future public-host configuration were not present in the target revision.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | complete |
| Validation mode | not recorded |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Static TypeScript browser application built from two frozen checksum-locked sources into an 80-record catalogue and 80 receipts. The browser verifies four fixed same-origin resources before enabling the human UI and three bounded read-only WebMCP tools. Build and CI are privileged release surfaces; provider APIs, accounts, persistence and Devpost operations are absent.

### Assets

- Frozen-source, catalogue, receipt and release-byte integrity.
- Truthful access, licence, assertion, observation and limitation fields.
- Bounded read-only tool identity and behaviour.
- Inert source text and the absence of credentials, personal data, provider calls, analytics and storage.

### Trust Boundaries

- Maintainer-controlled frozen inputs enter the deterministic build after committed SHA-256 checks.
- Fixed same-origin catalogue and receipt bytes enter the browser only after checksum, URL, record, bundle and receipt validation.
- The validated runtime enters the WebMCP host through three closed read-only registrations; host caller authorisation and retention are external.
- Locked dependencies and SHA-pinned Actions enter CI with contents:read before a revision-named artefact is produced.
- Authoritative links leave the origin only after user navigation to admitted credential-free HTTPS official hosts.

### Attacker Capabilities

- A visitor or tool caller controls bounded query, filters, limit, recordId and fragment, but not origin, repository, CI or providers.
- A source publisher may control frozen strings, which remain inert text and untrusted tool output.
- Repository, CI or origin compromise can coherently replace code and co-located checksums and already has equivalent authority.
- A WebMCP host controls caller isolation and output handling but receives no page write, storage or provider-network capability.

### Security Objectives

- Fail closed before UI or tool enablement on any integrity or contract failure.
- Remain static, same-origin, credential-free and read-only.
- Reject unknown fields, arbitrary context, caller URLs and oversized or unsupported input.
- Render source content inertly and preserve visible source, provenance, status and limitations.
- Bind any public release to an exact reviewed revision and verify it signed out and in the target host.

### Assumptions

- Target is the 108 tracked files at 260d68fb1c76ed83ace8f72ff57050113c2e2a95; concurrent changes are excluded.
- Checksums establish package consistency, not publisher identity, freshness or an external trust root.
- sourceLocksDigest is not independently rooted in the browser.
- Sequential registration has no rollback; partial visibility is a non-security availability/host-semantics uncertainty.
- Public hosting was absent at the target revision and must be verified after deployment.
- Current user publication authority supersedes stale tracked restrictions; registration and submission remain unauthorised.

## Findings

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Executable application and WebMCP runtime | not recorded | No issue found | All 108 tracked files were classified and reviewed in coherent groups. Executable build, browser, WebMCP and CI paths were traced; generated and imported content was inspected as inert data. Independent baseline and focused review found no reportable vulnerability. |
| Co-located integrity bindings | not recorded | No issue found | No unprivileged capability gain. Origin or repository control can replace both data and checksums and already has equivalent authority; UI limitations are accurate. |
| Sequential WebMCP registration | not recorded | No issue found | Possible partial registration affects readiness or availability only; every independently registered tool is bounded and read-only. |
| CI and dependency execution | not recorded | No issue found | Current target has contents:read, SHA-pinned Actions, locked npm install, fixed dist allowlist and no deployment or secret-consuming authority. |
| Research, governance and generated data | not recorded | No issue found | Non-executable imported text remains data; research examples are not compiled or copied into dist; credential-pattern and security-sink searches found no release-impacting issue. |
| Independent baseline audit | not recorded | No issue found | No reportable vulnerabilities; bounded input, inert rendering, same-origin fetch and fail-closed integrity controls verified. |
| Independent architecture review | not recorded | No issue found | Mapped source/build/browser/WebMCP/CI boundaries; architecture mapping does not count as completed source coverage. |
| Independent baseline audit | not recorded | No issue found | No reportable vulnerabilities. |

## Open Questions And Follow Up

- WebMCP host semantics for partial sequential registration are not established by repository source; no security impact was found.
