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
  and successfully called all five page tools against the historical tagged
  deployment; the final comparison's canonical SHA-256 matched the displayed
  result digest.
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
- A manual Safari 26.5.2 and VoiceOver 10 journey using the Caption Panel,
  retained as nine hash-bound frames and a completed-with-limitations evidence
  record. The automatic spoken live-status wording and a retained heading-rotor
  selection remain unproven; no VoiceOver audio or WCAG conformance is claimed.
  The Caption Panel and VoiceOver were turned off after capture.
- A 142.920-second local review video with H.264 video, AAC synthetic narration,
  embedded English captions, separate en-GB captions, a transcript and a
  machine build receipt. The cut remains unpublished pending owner review and
  has SHA-256
  `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`.
- A read-only Devpost status record confirming completed competition
  registration while distinguishing the exact unpublished pre-submission draft
  from Devpost's broader account-level relationship label.
- A final read-only, requirement-by-requirement Devpost compliance review that
  distinguishes the completed local evidence from the still-open named
  judging-host, owner-review, public YouTube and submission gates.
- A Python development environment version-pinned to `jsonschema` 4.26.0 and
  each mandatory or Python-version-conditional runtime dependency, with a
  local/CI wrapper that installs binary distributions without dependency
  resolution, runs `pip check` and makes the research pack's JSON Schema checks
  mandatory instead of optional. The pins do not include distribution hashes,
  and a reused `.venv` can retain unrelated packages, so this is not a clean or
  fully reproducible Python supply-chain environment.
- A personal-agent WebMCP test strategy that separates page registration,
  browser execution, agent selection and submission evidence. It incorporates
  the supplied ChatGPT research as a secondary input and corrects it against
  primary Chrome, Microsoft and Google Chrome Labs sources.
- ADR-0003 records the citizen-selected-agent boundary, optional callback
  compatibility and four-layer independent assurance decision without claiming
  measured savings, default privacy or general host support.
- Pinned `chrome-devtools-mcp` 1.8.0 and `webmcp-evals` 0.0.4 development
  harnesses. The deterministic evaluator requires six calls across all five
  tools to return `ok: true` in their expected result-schema envelopes, while
  the browser fixture adds context minimisation and a no-call case for a later
  fixed-model selection run.
- A fail-closed model-backed browser-evaluation wrapper with explicit model and
  remote-provider acknowledgement, bounded repeated runs, loopback-only local
  model preflight, exact context-minimisation checking, private reports and
  sanitised receipts. It validates and rejects any upstream console error or
  `pageerror`; accepted receipts record `browserConsoleErrorCount: 0` and
  `browserConsoleErrorsAccepted: false`. No model-backed run has yet been
  performed.
- A repeatable local setup for Microsoft WebMCP Explorer 0.1.0 pinned to commit
  `f7091c12420e713b11361630dc1649d5678f62ab`. It built twice idempotently in
  isolated ignored `.tools/webmcp-explorer-build/` and left the source checkout
  clean, while the clean-output allow-list passed. The recorded source-tree,
  package-lock and unpacked-extension file-manifest SHA-256 values are
  `b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
  `76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
  and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
  The script does not load the extension, change browser flags or configure a
  provider.
- The model-free evaluator smoke and its machine receipt are now part of pull-
  request and `main` CI, using the runner-installed stable Chrome rather than a
  downloaded browser.
- A separate Chrome DevTools MCP public-target mode that accepts only the exact
  project Pages URL, validates and hashes its deployment metadata, optionally
  requires the protected-main commit, skips the loopback server and writes an
  ignored review-before-publication receipt.
- Post-deployment evidence for corrected main commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, published by Pages run
  `33323152751`. Chrome DevTools MCP 1.8.0 discovered and successfully called
  all five tools against that public deployment with zero console errors.
- Native Chrome WebMCP-panel evidence in which all five valid calls completed. A
  search using the out-of-range `limit: 21` returned the expected structured
  rejection. Both presentation tools updated the visible page; the comparison
  showed 11 facet rows and its displayed digest prefix matched the canonical
  result.
- A technical review receipt for the unchanged 142.920-second video candidate:
  the complete video/audio decode, 4,284-frame count and all 38 caption cues
  passed, with one non-fatal subtitle metadata warning retained. The receipt
  explicitly excludes audible content-parity, owner playback and publication
  approval.
- A refreshed authenticated read-only Devpost receipt at
  `2026-08-30T17:57:48Z`. Project `1406973` remains `Untitled`, blank and
  `submission_pre_draft`, with no video URL, publication timestamp, submission
  timestamp or completed human attestations. No Devpost state was changed.
- A post-deployment evidence unit gate covering corrected Pages bindings,
  public Chrome and native-panel execution, screenshot privacy review, the
  technical-video boundary and the live unsubmitted Devpost state.

### Changed

- Raised the development Node.js floor to 22.12.0 to match the pinned WebMCP
  evaluator and made three unnecessary transitive dependency install scripts
  explicitly denied.
- Expanded the current unit suite to 100 tests. Configured the CI and
  Pages workflows to install Node dependencies with
  `npm ci --ignore-scripts --no-audit`; Pages also installs the version-pinned
  Python requirements before mandatory research validation and semantic WebMCP
  smoke before deployment. The protected integration and Pages path ran these
  definitions before deploying corrected main in run `33323152751`.
- Changed the smoke receipt to retain semantic counts and a results digest after
  deleting the raw evaluator rows. Only the ignored DevTools receipt retains
  full tool outputs.
- Documented the intended division of responsibility: the static page publishes
  bounded, source-linked tools, while a citizen-selected agent may use personal
  context to choose them. A remote model provider may still receive prompt and
  tool data; only a correctly configured local model keeps inference local.

### Fixed

- Encoded the CI and Pages Python install command as a folded YAML scalar. The
  original unquoted `--only-binary=:all:` token ended with a colon before
  whitespace, so GitHub rejected both workflow files before creating a job.
  A unit regression now protects the parse-safe form.
- Capped the rendered VoiceOver screenshot sequence at its validated manifest
  duration so ffmpeg cannot turn the repeated final still into an additional
  hold; the post-encode probe still rejects output that is short or otherwise
  differs from the declared duration.
- Corrected the authoritative-link frame label to claim its visually supported
  accessible name, not a displayed URL, and extended the narration so the final
  accessible-name and focus-restoration frames are present in the review cut.
- Made the weak-image media fixture use an even-sized frame so Ubuntu and
  macOS `ffmpeg` both exercise the same fail-closed screenshot validation.
- Installed `ffmpeg` explicitly in validation and Pages jobs so the guarded
  VoiceOver media-integrity tests run in GitHub Actions rather than depending on
  runner image contents.
- Tightened the British-English demonstration narration after exact macOS
  synthesis measured the first draft at 185.842 seconds. The revised seven-scene
  track measures 142.826 seconds, leaving a 37.174-second rules margin before
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
- Made every WebMCP callback accept a host that omits the optional execution
  options object. Chrome DevTools MCP 1.8.0 exposed the defect in the public
  tagged release; corrected main retains cancellation when a signal is supplied.
  The correction is deployed from
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and passed five public Chrome
  DevTools MCP calls with zero console errors.

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
- Isolated the new DevTools and evaluator browser runs to loopback-only clean
  profiles. Model-free third-party child processes receive a small environment,
  an isolated `HOME` and no forwarded provider credential environment
  variables; they still retain the operating-system filesystem access of the
  invoking user. Receipts have private permissions under ignored paths, with
  explicit retention and remote-provider boundaries.
- Set `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1` in the hardened DevTools runner.
  An earlier pre-hardening run wrote
  `~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final 15:53 BST
  rerun left that modification time unchanged. The ignored receipt remains the
  only evaluator receipt with full tool outputs.
- Statically triaged the Microsoft WebMCP Explorer npm advisories on 30 August
  2026 as not reachable in the exact production build path. Operational risks
  remain: `<all_urls>` access, persistent credentials in
  `chrome.storage.local`, `dangerouslyAllowBrowser`, no prompt-injection
  mitigation and autoexecution in Agent Run/Chat. The extension was not loaded
  and received no credential.

### Governance

- Advanced the status, handover, implementation plan, backlog, build brief,
  source/asset/evaluation registers, demonstration draft and compliance
  checklists in lockstep with the protected release and public evidence.
- Advanced the machine provenance and active submission checklists for the
  completed manual observation, guarded preflight, local video build and final
  read-only review. At that checkpoint the named-host, owner-review, public-
  video and submission gates remained open.
- Recorded that GitHub published the pre-release before the annotated tag
  reference was replaced to correct its tagger identity; the product commit and
  deployed bytes did not change.
- Kept the post-tag verification record separate from the immutable
  `v0.2.0-rc.1` product commit. At that checkpoint, supported-host WebMCP was
  observed only for the named Codex in-app browser and recorded time.
  Registration, the bounded manual screen-reader journey and local video build
  were complete; later corrected-main host evidence is recorded separately.
- Kept the corrected local host-compatibility result separate from the unchanged
  public `v0.2.0-rc.1` bytes. Microsoft WebMCP Explorer browser loading and any
  model-backed evaluator run remain pending. The documented Explorer route uses
  a disposable profile, Tools inspection without credentials, then a local
  loopback model and Agent Step, followed by profile deletion; a necessary
  remote run must use a revocable low-limit key and no personal context.
- Preserved `v0.2.0-rc.1` at
  `9235ee5db4df637bdb2a12e87449e871614afe68` as historical evidence while
  recording corrected main and Pages run `33323152751` separately. The existing
  142.920-second local video candidate and its digest remain unchanged; owner
  playback and publication approval, public upload, final Devpost submission
  and release-platform SBOM or attestation remain open.
- Integrated the post-deployment evidence, deterministic evidence tests and
  lockstep documentation through protected pull request 13 as repository
  commit `5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`; exact-main validation run
  `33327860583` passed. No Pages deployment or public application-byte change
  was made by that evidence-only integration.
- Added a Should 12 measurement task for the E-34 public-service cost-boundary
  hypothesis. No saving is claimed without a comparable server-side baseline,
  page-tool measurements and declared whole-system assumptions.

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
