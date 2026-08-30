# Final pre-submission checklist

## Governance no-go gate

- [ ] Entrant route is fixed and matches all accounts, repository ownership and the Devpost form.
- [x] Ownership/licence schedule is signed off; no material relies on assumed employer permission.
- [x] Outside-interest and resource assurances are recorded; prize and publicity details still need checking at submission.
- [x] Independent-prototype disclaimer and non-endorsement wording appear on
  the page and repository.
- [ ] Retain the independent-prototype and non-endorsement wording in the final
  video and submission.

## Exact build

- [x] Exact product commit `9235ee5db4df637bdb2a12e87449e871614afe68`
  built and passed the documented suite in clean exact-main and Pages GitHub
  runners (`33286750188` and `33286771963`).
- [x] Lock files are honoured; the post-tag evidence working tree and 14-commit
  history passed separate gitleaks scans.
- [ ] Re-scan the exact final evidence commit before submission.
- [x] Corpus and source locks rebuild deterministically; every required digest verifies.
- [x] Generated catalogue, Evidence Trace, federation manifest, schemas, records,
  receipts, notices and checksums are synchronised for the exact product commit;
  all 20 deployed files match the Pages artefact.
- [ ] Produce a release-platform SBOM or attestation. The retained CycloneDX
  file is explicitly a local macOS ARM64 dependency view.
- [x] Tool names, descriptions, schemas and executable validation agree.
- [x] Explicit missing licence or access states remain visible. A structurally
  absent required provenance, licence, access or human-URL field fails artefact
  admission rather than being silently inferred.
- [x] Demonstration inputs fail closed on preview-path substitution, receipt or
  media hash drift, unrelated VoiceOver media and incomplete manual journeys.
- [ ] `npm run demo:preflight` passes with the genuine VoiceOver clip and manual
  journey record; the current expected failure is limited to those missing
  inputs and their binding.
- [ ] The final local video build receipt binds the sub-three-minute MP4,
  captions, transcript, script and every evidence input.

## Human and agent acceptance

- [x] Search, exact record and provenance work in the tested human keyboard and pointer journey; touch remains an observational gap.
- [ ] Screen-reader names, headings, live regions, focus order, status/error messages and link purpose have been checked.
- [ ] The VoiceOver record covers every exact journey checkpoint, records any
  issue or limitation, and binds the actual Safari scene by path, SHA-256 and
  capture interval without claiming WCAG conformance.
- [ ] If the screenshot-sequence fallback is used, all nine source frames have
  been human-reviewed as genuine Safari and VoiceOver observations, the
  non-continuous label remains visible throughout, and the builder's declared
  metadata is not treated as independent proof of assistive-technology use.
- [x] Narrow-screen reflow, forced-colours, reduced-motion and automated contrast rules pass; manual zoom remains an observational gap.
- [x] `Codex In-app Browser` discovered and successfully called all five tools
  against the exact published URL on 30 August 2026. The final comparison's
  canonical and displayed result digests matched; this does not establish
  support in another host.
- [ ] ChatGPT desktop built-in browser tool registration and calls are recorded
  against the exact published URL.
- [ ] Native Chrome 149+ WebMCP registration/call behaviour is recorded against
  the exact published URL. Instrumented Chromium contract tests have passed,
  but they are not a supported-host observation.
- [x] The unsupported-host manual fallback was recorded against the deployed
  `v0.2.0-rc.1` site in a signed-out Chromium session where
  `document.modelContext` was absent.
- [x] Malicious metadata, overlong input, unknown keys, unsafe URLs, digest
  mismatch and explicit missing licence/access states produce safe outcomes.
  The dedicated stale and conflicting-assertion fixtures remain pending.
- [x] Five genuine public-page interaction clips are release/action/duration/hash
  bound and passed agent privacy and branding review; none contains browser
  chrome or source audio.
- [ ] Human publication review confirms the retained clips, receipt
  visualisation, VoiceOver scene and final cut are truthful, private and free of
  misleading branding.

## Public evidence

- [x] The live URL resolves without authentication and serves exact product
  commit `9235ee5db4df637bdb2a12e87449e871614afe68`, Pages run
  `33286771963`, and matching catalogue, receipt, Evidence Trace and federation
  bytes.
- [x] Public repository resolves without authentication; the MIT licence is visible and detectable.
- [x] All 161 unique admitted official URLs returned a 2xx or 3xx response to the bounded 30 August 2026 HEAD audit; this does not prove future availability or rights.
- [ ] Video is publicly visible on YouTube, under three minutes, audible and
  covers both the working project and its WebMCP use. Retain accurate captions,
  a transcript and evidence that it is free of unlicensed media or misleading
  branding.
- [ ] Chris Page approves the installed `Daniel` synthetic voice for public use
  and verifies final playback, embedded captions and public-player captions.
- [ ] Devpost text contains no production-readiness, official-endorsement, comprehensive-coverage or guaranteed-accuracy claim.
- [ ] Final compliance review reconciles the live form requirements, project
  `1406973`, named judging environments, public-YouTube boundary and all human
  attestations without treating the local cut as submission evidence.
- [ ] All submitted URLs are copied back from the final Devpost form and tested.

## Freeze and preserve

- [ ] Submit before the controlling deadline; do not rely on community or cached later timestamps.
- [ ] Save Devpost confirmation, timestamp, submitted text and screenshots.
- [x] Annotated tag `v0.2.0-rc.1` and its public pre-release target the exact
  deployed product commit without rebuilding different product bytes.
- [x] SHA-256 hashes are retained for the Pages artefact, all deployed site
  files, corpus files, package lock, schemas and dated evidence.
- [ ] Retain SHA-256 freeze evidence for the final video transcript and submitted
  text when those artefacts exist.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
