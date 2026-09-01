# Build checklist

## Build preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Two reviewable pull requests, then protected-main verification
- **Verification:** Yes
- **Check-in cadence:** Speed-run with verification at each risk boundary

## Checklist

- [x] **1. Reconcile the specialist-review source contract**
  Spec ref: `spec.md > Implementation boundaries`
  What to build: Correct authored locks, generators, generated displays and tests while preserving historical `v0.3.0-rc.1` receipts.
  Acceptance: Current candidate text records 0 accepted reviews, 2 not required and 291 required; no historical receipt changes.
  Verify: Source validation, semantic tamper tests, full unit/browser gates, PR #19 and exact protected-main validation.

- [ ] **2. Freeze the closed Evidence answer projection**
  Spec ref: `docs/product/beginner-interface-specification.md > Deterministic presentation contract`
  What to build: Pure reviewed/federated projection, schemas, explicit machine evidence tier, complete limitations and deterministic digest.
  Acceptance: Reviewed answers and records plus every federated collection project without invented authority, access, rights or primary limitations.
  Verify: Schema/validator parity, mutation tests, digest stability and full-corpus audit.
  Checkpoint: Projection, copy, schemas and focused full-corpus candidate tests
  are present in the worktree. Keep this item open until the exact candidate
  command and deterministic build gates pass.

- [ ] **3. Register the sixth presentation tool**
  Spec ref: `docs/product/beginner-interface-specification.md > Candidate record-presentation action`
  What to build: Add `present_resource_evidence` to the shared action controller and imperative all-or-none WebMCP registration.
  Acceptance: Closed input, executable validation, truthful non-read-only effect, no personal fields and byte-equivalent human/tool results.
  Verify: Unit tests for invalid input, cancellation, races, rollback, annotations and five-tool compatibility.
  Checkpoint: The composite action, controller path and six-definition
  all-or-none registration are present. Keep this item open until lifecycle,
  parity and supported-host checks pass.

- [ ] **4. Add persistent Evidence answer and Technical review navigation**
  Spec ref: `docs/product/beginner-interface-specification.md > Two views, one evidence state`
  What to build: Sticky native-link navigation, bounded routing and reliable direct/back/forward links with one `h1` per active view.
  Acceptance: Empty routes open Evidence answer; legacy fragments retain Technical review; focus is visible and unobscured.
  Verify: Route unit tests plus keyboard, 320-pixel, 400% zoom and obscured-focus browser checks.
  Checkpoint: Candidate mounts, native links, sticky styling, bounded router and
  controller integration are present. Real-browser history, focus and reflow
  acceptance remains open.

- [ ] **5. Render complete, accessible Evidence answers**
  Spec ref: `docs/product/beginner-interface-specification.md > Evidence answer page regions`
  What to build: Ordered plain-English evidence, status, sources, facets, limitations, unknowns, accepted input, comparison guide and next check.
  Acceptance: Source-derived text is inert, null states stay explicit and a WebMCP update never changes view, URL, history, focus or scroll.
  Verify: Unit and Chrome/Edge human-tool parity, inactive-view update and rollback tests.
  Checkpoint: The DOM/text-only renderer, recorded-source link validation,
  limitation, unknown, next-check, accepted-input and comparison-guide regions
  are present. Browser and assistive-technology acceptance remains open.

- [ ] **6. Audit the complete evidence corpus**
  Spec ref: `prd.md > Release acceptance summary`
  What to build: Offline projection validation for all 80 reviewed and 58,652 federated records with representative browser cases per collection, tier and failure state.
  Acceptance: Every admitted record projects or fails with an explicit contract error; missing and conflicting facets never become positive claims.
  Verify: Full-corpus projection audit, deterministic double build, federation validation and frozen retrieval-quality gate.

- [ ] **7. Establish the cross-host evaluation contract**
  Spec ref: `prd.md > Submission proof points`
  What to build: Twelve natural stories, three repetitions per story and host, privacy-safe receipts and separate safety/tool/page-parity judgements.
  Acceptance: 72-run matrix is representable without fabricated observations; fictional markers cannot leak; clarification and out-of-scope cases make no premature call.
  Verify: Fixture and receipt validation plus three local Ollama repetitions; record cloud observations only when actually run.

- [ ] **8. Complete browser, accessibility and security assurance**
  Spec ref: `spec.md > Verification strategy`
  What to build: Chrome, Edge, axe, manual reflow/zoom/forced-colour/reduced-motion, Safari VoiceOver/Caption Panel and scoped security evidence.
  Acceptance: No serious accessibility error, unsafe URL/input handling, storage, unintended external request or unreported environmental limitation.
  Verify: Automated suites, scoped security scan and exact manual observation receipts.

- [ ] **9. Publish and verify the release candidate**
  Spec ref: `spec.md > Verification strategy`
  What to build: Linear protected-main merge, manual Pages deployment, byte comparison, live six-tool execution, tag and GitHub prerelease.
  Acceptance: Public page, repository and release resolve to the same immutable commit; earlier tags remain unmoved.
  Verify: Protected-main CI, Pages run, every-file byte comparison and supported-host live calls.

- [ ] **10. Prepare Devpost handoff**
  Spec ref: `prd.md > Submission proof points`
  What to build: Under-three-minute captioned demonstration, screenshots, public links, release receipts and final compliance review materials.
  Acceptance: Personal email, avatar and unrelated tabs are redacted; branding/rights are cleared; signed-out video playback succeeds; no submission is implied.
  Verify: Media integrity and privacy review, signed-out public playback, rules/form refresh and confirmation that the next separate command is `prepare-submission`.
