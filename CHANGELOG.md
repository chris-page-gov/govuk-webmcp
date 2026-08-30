# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A machine-readable `challenge-provenance.json` that distinguishes the
  research baseline from the prior public release and records pull request 9,
  the product commit, annotated pre-release, exact-main validation, Pages
  artefact and explicit remaining gates.
- Complete 30 August Pages and live-byte evidence: public release verification,
  preserved deployment metadata, a 20-file site manifest and structured proof
  that every cache-busted public response returned HTTP 200 and matched the
  deployed artefact byte for byte.
- A signed-out live-browser screenshot and journey record showing the public
  search, authoritative GOV.UK result, successful same-origin requests and clean
  console.
- A structured machine receipt records that `Codex In-app Browser` discovered
  and successfully called all five page tools against the exact public release;
  the final comparison's canonical SHA-256 matched the displayed result digest.
  Two associated page-owned visual records show the post-call public-page state.
  Neither those records nor the receipt-derived animation is a host recording or
  Site tools capture.
- A guarded local demonstration-video pipeline with British-English script,
  transcript and WebVTT generation, exact release/evidence validation,
  H.264/AAC/caption checks, input hashes, five genuine live-page interaction
  captures and a privacy-safe receipt visualisation generated from the
  supported-host record. Raw clips and review cuts remain ignored local output;
  human publication review remains pending and no public video is claimed.
- A fail-closed manual-VoiceOver screenshot-sequence fallback for environments
  where continuous macOS window capture is unavailable. It requires nine
  ordered, operator-declared Safari and VoiceOver frames beneath ignored local
  output; verifies the declared release identity, hashes, paths, timestamps and
  media strength from immutable in-memory bytes; blocks network access while
  rendering; and produces a visibly labelled H.264 review scene that cannot be
  mistaken for continuous footage. The builder does not independently prove
  assistive-technology use: the manual evidence record and human frame review
  remain separate hard gates.
- A read-only Devpost status record confirming completed competition
  registration while distinguishing the exact unpublished pre-submission draft
  from Devpost's broader account-level relationship label.
- A requirement-by-requirement Devpost compliance working review that keeps the
  missing VoiceOver, final video, named judging-host, human-attestation, public
  YouTube and submission gates explicitly open until stronger evidence exists.

### Fixed

- Made the weak-image media fixture use an even-sized frame so Ubuntu and
  macOS `ffmpeg` both exercise the same fail-closed screenshot validation.
- Installed `ffmpeg` explicitly in validation and Pages jobs so the guarded
  VoiceOver media-integrity tests run in GitHub Actions rather than depending on
  runner image contents.
- Tightened the British-English demonstration narration after exact macOS
  synthesis measured the first draft at 185.842 seconds. The revised seven-scene
  track measures 138.105 seconds, leaving a 41.895-second rules margin before
  final encoding.
- Stabilised the narrow-screen keyboard acceptance check by sending Enter to
  the already focused trace and search controls while retaining explicit focus
  assertions.
- Made browser acceptances that inspect initial evidence or issue tool actions
  wait for the application’s settled `ready` state. This removes Linux CI races
  in cancelled-call and deeply nested rejection recovery while preserving the
  semantic assertions.
- Isolated the Trace and search keyboard checks from the preceding skip-link
  hash navigation, retaining real keyboard activation and focus assertions
  without allowing its asynchronous route render to replace the focused node.

### Security

- Enabled GitHub secret scanning and push protection after the repository
  became public, while retaining strict protected-branch validation.
- Hardened the SHA-256 evidence test to require bytewise ordered, unique,
  canonical repository-relative paths; reject POSIX and Windows absolute paths,
  backslashes, traversal, symbolic links, non-regular files and paths resolving
  outside the repository; cover exactly all release data, retained evidence, the
  package lock and schemas; and verify every retained digest.
- Added semantic agreement checks across the 20-file deployed-site manifest,
  structured live observations, deployment metadata and challenge provenance.

### Governance

- Advanced the status, handover, implementation plan, backlog, build brief,
  source/asset/evaluation registers, demonstration draft and compliance
  checklists in lockstep with the protected release and public evidence.
- Recorded that GitHub published the pre-release before the annotated tag
  reference was replaced to correct its tagger identity; the product commit and
  deployed bytes did not change.
- Kept the post-tag verification record separate from the immutable
  `v0.2.0-rc.1` product commit. Supported-host WebMCP is now observed only for
  the named Codex in-app browser and recorded time. Registration is observed as
  complete; manual screen-reader, release-platform SBOM or attestation, video
  publication and Devpost submission remain explicitly unperformed.

## [0.2.0-rc.1] - 2026-08-30

### Added

- A digest-bound Evidence Trace for the worked question “Which GOV.UK sources
  should I check after a baby is born?”, generated from one locked answer pack
  and three existing catalogue records.
- An analytical-index-first human view, a text-labelled interactive Evidence
  Trace, an accessible relationship table, separate foundation details and a
  two-to-four-claim comparison without a combined trust score.
- Eight independently visible evidence facets: authority, assertion,
  verification, freshness, integrity, access, rights and coverage.
- `explore_answer_foundations` and `compare_evidence_foundations` WebMCP tools
  over the same deterministic action controller as the human interface.
- A digest-bound 10-entry corpus admission manifest. Two reviewed collections
  provide all 80 searchable records; eight entries remain described-only,
  conditional, contract-only or quarantined and contribute no searchable
  payload.
- Exact locks for the authored answer pack and corpus admissions, bringing the
  source-lock registry to four required ID/path/count bindings.
- Deterministic Evidence Trace and federation builders, checksum sidecars and
  closed JSON Schemas, bringing the published contract set to 20 schemas.
- Browser coverage for history and focus restoration, rejected deeply nested
  tool input, oversized and malformed fragment routes, Evidence Trace and
  federation tampering, and the expanded WCAG 2.2 journey.
- Dated Chrome, Edge, accessibility, link-health, SBOM, visual and security
  evidence for the candidate.
- An executable release-evidence check that verifies every path and digest in
  `docs/competition/evidence/SHA256SUMS`.
- A regression check that preserves the 29 August research-seed examples as
  byte-bound historical illustrations and prevents them being mistaken for
  current 0.2 contracts.

### Changed

- The complete validation command now builds once, then runs prepared unit and
  browser stages against that same artefact; standalone unit and browser
  commands retain their own build prerequisite.
- Advanced the package candidate from `0.1.0-rc.1` to `0.2.0-rc.1`.
- Split tool effects truthfully: search, exact record and provenance remain
  read-only; the two exploration tools declare their reversible in-memory page
  presentation effect with `readOnlyHint: false`.
- Enabled the accessible human interface immediately after all four artefact
  families validate, without waiting for WebMCP registration to settle.
- Replaced separate human/tool execution paths with one cancellable action
  controller and deterministic result/display digest diagnostics.
- Made `npm run data:build` validate all four source locks before rebuilding the
  catalogue, receipts, Evidence Trace and federation manifest.
- Recorded source-native `sourceOkfCore` separately from the descriptive
  `targetOkfCore: "0.2"` mapping; target mapping does not claim native OKF 0.2
  conformance or admit producer payload.
- Updated project, handover, architecture, tool, backlog, accessibility,
  security, privacy, demo and submission-draft documentation in lockstep.
- Pinned Python 3.14.6 and the exact `actions/setup-python` revision in both CI
  and Pages workflows so the research verifier does not depend on runner drift.
- Labelled the dated CycloneDX SBOM as the local macOS ARM64 dependency view;
  release-platform SBOM evidence remains a separate release task.

### Fixed

- Made executable record admission match the closed profile schemas, including
  nested source, licence, assertion, limitation, boundary and relation fields;
  co-digested schema-invalid records now fail before runtime use.
- Bound every receipt field to its catalogue record and derived identifier, and
  reject duplicate normalised filters instead of accepting inputs forbidden by
  `uniqueItems`.
- Aligned canonical record-ID, GOV.UK/GitHub URL, RFC 3339 timestamp and
  federation decision bounds across JSON Schema and all executable validators.
- Restricted Evidence Trace relationships to their admitted endpoint domains,
  rejected unused contradiction nodes and kept comparison limitations sourced
  only from limitation nodes.
- A rejected evidence-presentation request no longer leaves the worked answer
  summary stuck in an error state; the next valid request redraws the complete
  trace, and rejected WebMCP actions now report that no display update occurred.
- Closing a comparison opened by WebMCP now restores focus to the human compare
  control even though there was no human trigger element to remember.
- Regenerated the dated candidate SBOM so its component identity is
  `0.2.0-rc.1`, and added an executable release-evidence assertion for that
  version.
- Rejected tool input is no longer serialised or recursively canonicalised for
  diagnostics. A shallow admitted-data projection is hashed only for successful
  requests; rejected input is displayed as “Not retained for rejected input”.
- Public fragment routes are bounded before parsing and comparison values are
  bounded before splitting. Oversized routes reset to the default evidence view
  with a visible explanation instead of exhausting or disabling the page.
- Every standalone builder now consumes the exact regular-file bytes returned
  by a shared, closed source-lock validator, so missing, extra, redirected,
  swapped, symlinked or changed source entries fail before generation.
- Added a path-scoped `cr-at-eol` Git attribute for the preserved competition
  CSVs, allowing ordinary `git diff --check` without rewriting seeded line
  endings.
- Corrected documentation so expandable structured output is not called a
  download.
- Clarified the separate exact federation-repository allowlist instead of
  implying that GitHub repository links use the official-source host policy.
- Bound the candidate catalogue to exactly 80 records in both schema and
  executable validation, and made federation admission cross-check that same
  validated count so a coherently re-digested smaller bundle fails closed.
- Rejected whitespace-padded record identifiers in executable lookup so exact
  record and provenance behaviour matches the published anchored schemas.

### Security

- Completed a formal diff scan of the Evidence Trace/federation candidate. Two
  low-severity robustness findings were reproduced, fixed and independently
  re-reviewed with no bypass found.
- Completed and retained a later immutable 44-item candidate snapshot scan
  with no reportable finding, together with an explicit reviewed-delta record
  for the stricter changes made after that snapshot.
- Added common root-input budgets, bounded diagnostic values, truncated unknown
  field names and fail-closed tests for deeply nested, cyclic, `BigInt`, broad
  and accessor-bearing input.
- Retained the static same-origin boundary, credential-free admitted HTTPS
  hosts, inert source-derived text, closed schemas, CSP, no query storage and no
  runtime provider request.
- Refreshed the dependency audit with zero known vulnerabilities and the link
  audit with 161 of 161 admitted official URLs responding to the bounded check.

### Governance

- Preserved the page-scoped experiment boundary: this is not a durable MCP
  gateway, provider integration, service-operation layer, official GOV.UK
  service or eligibility decision system.
- Kept rights, access and population claims item- or collection-specific. A
  descriptor in the estate table does not grant permission to copy or search a
  producer payload.
- Retained the recorded GOV.UK historical-revision, ONS checksum-sidecar and
  unversioned/unlicensed `okf-testing` limitations.
- Kept competition registration and Devpost submission as explicit unperformed
  gates. Updating the submission draft is not a submission.

## [0.1.0-rc.1] - 2026-08-29

### Added

- An 80-record, 80-receipt catalogue comprising 69 locked GOV.UK records and
  11 reviewed official API, dataset and catalogue records.
- Accessible human search, filters, exact record and provenance views over the
  same deterministic runtime as three imperative WebMCP tools.
- Source, record, bundle, receipt and raw-file SHA-256 validation; nine closed
  input/output contracts; unit, Chrome, Edge and accessibility checks.
- Public security, privacy and accessibility documents, a sanitised CycloneDX
  SBOM, 161-URL link-health evidence and an exact-commit Pages workflow.

### Fixed

- Direct `file://` opening now replaces the apparent permanent “Verifying…”
  state with instructions to serve the application over HTTP.
- WebMCP registration has a three-second rollback timeout and cannot hold the
  verified human interface unavailable.
- The Pages workflow can publish only a manually selected exact `main` commit.

### Governance

- Published the repository and exact-commit Pages artefact through protected
  pull requests and recorded signed-out live-browser verification.
- Applied MIT to original project code while retaining source-specific rights,
  attribution, access and endorsement boundaries.
- Preserved competition registration and Devpost submission as separate,
  unperformed actions.

[Unreleased]: https://github.com/chris-page-gov/govuk-webmcp/compare/v0.2.0-rc.1...HEAD
[0.2.0-rc.1]: https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1
[0.1.0-rc.1]: https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.1.0-rc.1
