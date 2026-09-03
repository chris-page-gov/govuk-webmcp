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

- [x] **2. Freeze the closed Evidence answer projection**
  Spec ref: `docs/product/beginner-interface-specification.md > Deterministic presentation contract`
  What to build: Pure reviewed/federated projection, schemas, explicit machine evidence tier, complete limitations and deterministic digest.
  Acceptance: Reviewed answers and records plus every federated collection project without invented authority, access, rights or primary limitations.
  Verify: Schema/validator parity, mutation tests, digest stability and full-corpus audit.
  Checkpoint: Complete in protected product commit
  `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`; the full-corpus audit,
  deterministic double build and settled 376-unit-test suite pass. The commit
  observation is historical pre-hardening evidence.

- [x] **3. Register the sixth presentation tool**
  Spec ref: `docs/product/beginner-interface-specification.md > Candidate record-presentation action`
  What to build: Add `present_resource_evidence` to the shared action controller and imperative all-or-none WebMCP registration.
  Acceptance: Closed input, executable validation, truthful non-read-only effect, no personal fields and byte-equivalent human/tool results.
  Verify: Unit tests for invalid input, cancellation, races, rollback, annotations and five-tool compatibility.
  Checkpoint: Lifecycle and parity checks pass. Isolated Chrome 152 through
  Chrome DevTools MCP 1.8.0 discovered and completed all six tools against the
  historical pre-hardening byte-verified product commit. The last
  pre-hardening corrected-path Chrome 152.0.7977.66 observation also matched
  the tool and displayed Evidence answer digest.

- [x] **4. Add persistent Evidence answer and Technical review navigation**
  Spec ref: `docs/product/beginner-interface-specification.md > Two views, one evidence state`
  What to build: Sticky native-link navigation, bounded routing and reliable direct/back/forward links with one `h1` per active view.
  Acceptance: Empty routes open Evidence answer; legacy fragments retain Technical review; focus is visible and unobscured.
  Verify: Route unit tests plus keyboard, 320-pixel, 400% zoom and obscured-focus browser checks.
  Checkpoint: Complete 43-test Chrome and 43-test Edge suites cover history,
  focus, keyboard operation, 320-pixel width, 400% reflow, forced colours and
  reduced motion.

- [x] **5. Render complete, accessible Evidence answers**
  Spec ref: `docs/product/beginner-interface-specification.md > Evidence answer page regions`
  What to build: Ordered plain-English evidence, status, sources, facets, limitations, unknowns, accepted input, comparison guide and next check.
  Acceptance: Source-derived text is inert, null states stay explicit and a WebMCP update never changes view, URL, history, focus or scroll.
  Verify: Unit and Chrome/Edge human-tool parity, inactive-view update and rollback tests.
  Checkpoint: DOM/text-only rendering, source-link validation, complete
  limitations, unknowns, next checks, accepted input and the comparison guide
  pass unit and browser checks. Candidate-specific manual assistive-technology
  assurance remains checklist item 8.

- [x] **6. Audit the complete evidence corpus**
  Spec ref: `prd.md > Release acceptance summary`
  What to build: Offline projection validation for all 80 reviewed and 58,652 federated records with representative browser cases per collection, tier and failure state.
  Acceptance: Every admitted record projects or fails with an explicit contract error; missing and conflicting facets never become positive claims.
  Verify: Full-corpus projection audit, deterministic double build, federation validation and frozen retrieval-quality gate.
  Checkpoint: All 80 reviewed and 58,652 federated records pass the shared
  projection audit. Two 1,883-file builds are byte-identical at aggregate
  SHA-256
  `cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`;
  frozen mean nDCG@10 is `0.984698009` and Recall@20 is `1`.

- [ ] **7. Establish the cross-host evaluation contract**
  Spec ref: `prd.md > Submission proof points`
  What to build: Twelve natural stories, three repetitions per story and host, privacy-safe receipts and separate safety/tool/page-parity judgements.
  Acceptance: 72-run matrix is representable without fabricated observations; fictional markers cannot leak; clarification and out-of-scope cases make no premature call.
  Verify: Fixture and receipt validation plus three local Ollama repetitions; record cloud observations only when actually run.
  Checkpoint: The patched 36-case Ollama diagnostic converts and replays. Tool
  selection and deterministic execution each pass 6 and fail 30; all page
  parity is unobservable, all answers are unreviewed and context is 0 complete.
  The complete frozen 72-run Copilot and Ollama matrix is retained with a false
  claim gate. A later owner-operated ChatGPT Chrome extension smoke journey
  reported six ready Site tools and visibly updated the Evidence answer to the
  selected ONS Open Geography record. Its collapsed integration exposed no
  exportable exact call trace, versions or model identity, and the answer
  received only a bounded content review. A second owner-directed Chrome and
  ChatGPT extension run covered all 12 stories; its public narrative reports
  20 successful calls, 2 deliberate no-calls and 2 rejected preliminary
  probes. It discovered all 6 tools but exercised only 4 and exported no raw
  call or result trace. A separate Edge and ChatGPT extension run covered all
  12 stories; its editorially qualified host report reports 38 successful
  calls across all 6 tools and records host-reported arguments plus available
  presentation and trace digests, alongside 2 deliberate no-calls and 3
  rejected probes. The observed final US-10 page digest matches the tool digest in the
  host report, but the
  report is not a raw browser trace and its visible model label is unverified.
  None is an extra matrix slot or supports a safe-answer, autonomous-host,
  universal-compatibility or privacy claim. This item stays open only for
  future answer-safety and broader-host research, not for the competition
  submission.

- [ ] **8. Complete browser, accessibility and security assurance**
  Spec ref: `spec.md > Verification strategy`
  What to build: Chrome, Edge, axe, manual reflow/zoom/forced-colour/reduced-motion, Safari VoiceOver/Caption Panel and scoped security evidence.
  Acceptance: No serious accessibility error, unsafe URL/input handling, storage, unintended external request or unreported environmental limitation.
  Verify: Automated suites, scoped security scan and exact manual observation receipts.
  Checkpoint: Automated Chrome, Edge and accessibility checks pass. Codex
  Security scan `5944866f-336d-4f27-8b36-d0d8269f2824`, snapshot
  `codex-security-snapshot/v1:sha256:e393c031c8e21478fd934e00a1590ed030c314c996c4ea6116f7b43a4a4bec9c`,
  completed exact range
  `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8..2666f201e30c9cc0df94af133a4d0449d183337f`
  with complete configured coverage and zero findings; its portable record is
  under `docs/competition/evidence/security-scan-2026-09-02-pre-staging/`.
  The canonical personal-agent pair producer postdates that snapshot and still
  needs the final changed-source review.
  The retained Safari and VoiceOver
  Caption Panel observation is historical pre-hardening evidence: 6 checkpoints
  passed and 3 were limited, with no captured speech audio and no WCAG claim.
  The exact-release nine-step Safari, VoiceOver and Caption Panel recapture
  remains pending after the hardened deployment. The no-argument clip builder
  is pinned to the canonical exact `v0.4.0-rc.1` manifest. Keep this item open for that
  recapture and the remaining manual visual and formative accessibility
  boundaries.

- [ ] **9. Publish and verify the release candidate**
  Spec ref: `spec.md > Verification strategy`
  What to build: Linear protected-main merge, manual Pages deployment, byte comparison, live six-tool execution, tag and GitHub prerelease.
  Acceptance: Public page, repository and release resolve to the same immutable commit; earlier tags remain unmoved.
  Verify: Protected-main CI, Pages run, every-file byte comparison and supported-host live calls.
  Checkpoint: PR #20, protected-main run `33554600300`, Pages run `33555187118`,
  exact comparison of 1,884 files and 128,646,735 bytes, and isolated-Chrome
  execution of all six tools with final tool/page digest parity pass. The host
  observation selected no model and captured no host-owned surface. The final
  corrected-path three-file capture and labelled reconstruction are byte-bound
  to that pre-integration deployment. Keep this item open: merge the
  build-affecting hardening first, deploy and byte-compare the new protected-main
  product commit, recapture every exact-release input, then tag that same commit
  and publish the GitHub prerelease. A later evidence-only record must not move
  the tag.

- [ ] **10. Prepare Devpost handoff**
  Spec ref: `prd.md > Submission proof points`
  What to build: Under-three-minute captioned demonstration, screenshots, public links, release receipts and final compliance review materials.
  Acceptance: Personal email, avatar and unrelated tabs are redacted; branding/rights are cleared; signed-out video playback succeeds; no submission is implied.
  Verify: Media integrity and privacy review, signed-out public playback, rules/form refresh and confirmation that the next separate command is `prepare-submission`.
  Checkpoint: Five silent candidate page clips exist and agent privacy and
  branding review passed. The supported-host scene is a rebuilt, visibly
  labelled receipt reconstruction rather than a host recording. The candidate
  VoiceOver sequence and its nine source
  frames are bound and packaged for the release build. The local Ollama
  diagnostic remains unclaimable; its generated clip is visibly labelled as a
  diagnostic receipt, not a host recording or page update. The complete host
  matrix, one successful ChatGPT Chrome extension visual smoke journey and a
  second 12-story public narrative are retained with their limitations. The
  second run reports 20 successful calls and 2 deliberate no-calls, but only 4
  of 6 discovered tools were exercised and no raw call or result trace was
  exported. The Edge follow-up records all 6 tools exercised; the observed
  final US-10 page digest matches its report, with 3 rejected probes and no raw browser
  trace. Chris will record the required public YouTube demonstration; do not
  rebuild the existing local cut. Public-player verification, the tag and
  prerelease, custom answers and the separately authorised Devpost action
  remain open.
