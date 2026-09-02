# Security Review: govuk-webmcp

## Scope

Security review of the immutable pull-request range a4fabe12184f47177b3a20c0e04c64d1eef9b4a8..2666f201e30c9cc0df94af133a4d0449d183337f.

- Scan mode: branch_diff
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: a4fabe12184f47177b3a20c0e04c64d1eef9b4a8...2666f201e30c9cc0df94af133a4d0449d183337f
- Snapshot digest: codex-security-snapshot/v1:sha256:e393c031c8e21478fd934e00a1590ed030c314c996c4ea6116f7b43a4a4bec9c
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: The exact head passed the repository research, build, full-corpus projection, unit, Chrome, Edge, deterministic build, retrieval-quality, WebMCP smoke, dependency and documentation checks recorded in the release handover.
- Artifacts reviewed: 34 security-relevant changed source, schema, manifest and package files, Resolved SECURITY.md and authored threat model, Unit and browser tests used as control counterevidence, Independent filesystem and media/evaluation tranche reviews

Limitations and exclusions:
- No live dynamic penetration test was performed by this diff scan.
- Documentation, generated projections and binary media were not primary discovery surfaces.
- Host, model, protected-branch and operating-system trust anchors were not independently audited.
- Excluded documentation, tests, generated public projections and binary media: Excluded from vulnerability discovery except where used as supporting contract or counterevidence.
- Excluded ignored private captures, upstream services, transitive dependencies, browser and extension internals, protected-branch configuration and host or model internals: Outside the changed-source audit and retained as external acceptance or trust boundaries.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | complete |
| Validation mode | Source-backed immutable commit-range review with complete review-item accounting and independent tranche review. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

An experimental static GOV.UK WebMCP page loads validated same-origin catalogue artefacts and exposes six closed page actions. Separate privileged local release tooling authenticates an exact protected-main Pages run, byte-compares live content, handles private host evidence and transactionally builds reviewed evidence and media.

### Assets

- Integrity, provenance and availability of the 80 reviewed and 58,652 searchable federated records
- Parity between tool output and the independently rendered Evidence answer
- The exact protected-main commit, Pages run, archive, live bytes and release receipts
- Confidentiality of private Copilot, Ollama and media inputs before explicit sanitisation
- Integrity and recoverability of known-good evidence and media destination files
- Citizen understanding that evidence does not itself decide eligibility, legal status or property ownership

### Trust Boundaries

- Browser or WebMCP input crosses closed executable validators before page data access
- Same-origin artefacts must validate completely before any WebMCP registration
- GitHub API, Pages archive and live HTTPS bytes cross exact workflow, commit, inventory and byte-comparison checks
- A structural receipt gains claim authority only after fresh process-local authentication with owned or borrowed leases
- Private ignored host evidence crosses to public reviewed evidence only through closed sanitised projections
- Stages, destinations, backups and recovery copies are constrained to canonical repository paths with identity and byte checks

### Attacker Capabilities

- Supply malformed or oversized WebMCP input and hostile source-derived text
- Alter same-origin artefacts or remote GitHub archive and live response bytes
- Propose repository changes or pre-create local files and symbolic links
- Invoke, overlap or cancel page actions
- Cannot be assumed already to control the maintainer account, protected branch, local operator account, Ollama daemon or repository namespace
- A same-user or privileged actor can race pathname operations, but hostile concurrent namespace mutation is outside the supported boundary

### Security Objectives

- Admit only exact locks and canonical identifiers, excluding legislation.gov.uk and unsafe URL forms
- Keep the page static, same-origin and storage-free with no official API or model-provider runtime call
- Render source-derived content inertly and retain sources, limitations, access, rights and coverage
- Make the Evidence answer latest-started, deterministic and rollback-safe without WebMCP navigation side effects
- Bind public evaluation and media claims to a freshly authenticated exact release
- Keep private material mode 0700/0600 and promote complete recoverable evidence or media sets

### Assumptions

- GitHub, the owner account, protected branch, supported browser host, model runner and operating-system account are external trust anchors
- Portable Node cannot make every pathname operation directory-handle-relative, so release tooling requires exclusive namespace control
- A Proxy from code already executing in the page realm is outside the browser-host JSON input boundary
- Generic output placement relies on callers to enforce appropriate source size limits
- A specialised public-evidence recovery copy is private mode 0600 while restored hard-link backups retain original inode and mode; final admitted targets are revalidated at 0600 or 0644
- Ignored private captures, upstream services, transitive dependencies, browser and extension internals, protected-branch configuration, accessibility, host behaviour, media review and Devpost compliance are outside this source-diff conclusion

## Findings

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Page tool input and action dispatch | not recorded | No issue found | No additional canonical notes were recorded. |
| DOM rendering, hash navigation and source links | not recorded | No issue found | No additional canonical notes were recorded. |
| Build, source contracts, manifests and legislation exclusion | not recorded | No issue found | No additional canonical notes were recorded. |
| Live Pages authentication and evidence admission | not recorded | No issue found | No additional canonical notes were recorded. |
| Private personal-agent evaluation and exact-release verification | not recorded | No issue found | No additional canonical notes were recorded. |
| Media capture, rendering and transactional placement | not recorded | No issue found | No additional canonical notes were recorded. |

## Open Questions And Follow Up

- How are validated Copilot capture and authenticated summary promoted to the fixed private release-evidence paths?
