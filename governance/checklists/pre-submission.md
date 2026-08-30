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
- [x] The current working tree pins `jsonschema` 4.26.0, Chrome DevTools MCP
  1.8.0 and `webmcp-evals` 0.0.4; unnecessary transitive install scripts are
  explicitly denied.
- [x] Explicit missing licence or access states remain visible. A structurally
  absent required provenance, licence, access or human-URL field fails artefact
  admission rather than being silently inferred.
- [x] Demonstration inputs fail closed on preview-path substitution, receipt or
  media hash drift, unrelated VoiceOver media and incomplete manual journeys.
- [x] `npm run demo:preflight -- --overwrite` passes with the genuine VoiceOver
  clip, manual journey record and exact media/evidence binding.
- [x] The local video build receipt binds the 142.920-second MP4, captions,
  transcript, script and every evidence input. It is a local review receipt,
  not public-player evidence.

## Human and agent acceptance

- [x] Search, exact record and provenance work in the tested human keyboard and pointer journey; touch remains an observational gap.
- [ ] Screen-reader names, headings, live regions, focus order, status/error messages and link purpose have been checked.
- [x] The VoiceOver record covers every exact journey checkpoint, records two
  retained limitations, and binds the actual Safari scene by path, SHA-256 and
  capture interval without claiming WCAG conformance.
- [x] All nine screenshot-sequence frames were reviewed against the manual
  Safari and VoiceOver observation, the non-continuous label remains visible
  throughout, and the builder's declared metadata is not treated as independent
  proof of assistive-technology use.
- [x] Narrow-screen reflow, forced-colours, reduced-motion and automated contrast rules pass; manual zoom remains an observational gap.
- [x] `Codex In-app Browser` discovered and successfully called all five tools
  against the exact published URL on 30 August 2026. The final comparison's
  canonical and displayed result digests matched; this does not establish
  support in another host.
- [ ] ChatGPT desktop built-in browser tool registration and calls are recorded
  against the exact published URL.
- [ ] Native Chrome 150+ or Edge WebMCP panel registration/call behaviour is
  recorded against the exact corrected published URL. Chrome DevTools MCP 1.8.0
  discovered the current public tools but exposed an execution-options defect;
  the corrected working tree passes all five calls locally in Chrome 152 and is
  not yet deployed.
- [x] The pinned model-free `webmcp-evals` smoke suite completed six of six
  authored calls across all five tools in isolated Chrome 152 without provider
  credentials. This is execution evidence, not model-selection evidence.
- [ ] Microsoft WebMCP Explorer is run from its pinned source revision in a
  fresh profile, first in Tools/Agent Step mode, with the exact provider class,
  model and extension digest recorded and no credential retained in evidence.
- [ ] The browser-selection fixture is repeated with one fixed explicitly local
  or remote model; no-call, context-minimisation, variance and valid alternate
  trajectories are reported rather than hidden.
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
- [ ] Independent-host reports and screenshots have been reviewed for prompts,
  personal context, credentials, cookies, profile data and unredacted headers
  before any evidence is admitted or published.

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
- [x] Final read-only compliance review reconciles the live form requirements, project
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
- [x] Retain SHA-256 freeze evidence for the local final video, captions,
  transcript and build receipt.
- [ ] Retain SHA-256 freeze evidence for the final submitted text when it
  exists.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
