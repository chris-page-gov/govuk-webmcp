# Final pre-submission checklist

## Governance no-go gate

- [ ] Entrant route is fixed and matches all accounts, repository ownership and the Devpost form.
- [x] Ownership/licence schedule is signed off; no material relies on assumed employer permission.
- [x] Outside-interest and resource assurances are recorded; prize and publicity details still need checking at submission.
- [ ] Independent-prototype disclaimer and non-endorsement wording appear on the page and repository; video and submission remain pending.

## Exact build

- [ ] Clean clone from the exact `0.2.0-rc.1` release candidate succeeds using documented commands. This was established for the prior release and must be repeated after merge.
- [ ] Lock files are honoured and the final history and tree pass gitleaks; the pre-documentation working-tree pass found no leak, but the final exact commit must be rescanned.
- [x] Corpus and source locks rebuild deterministically; every required digest verifies.
- [ ] Generated catalogue, Evidence Trace, federation manifest, schemas, records, receipts, notices, checksums and SBOM are synchronised for the exact release commit. Working-tree checks have passed; exact-commit evidence remains.
- [x] Tool names, descriptions, schemas and executable validation agree.
- [x] Explicit missing licence or access states remain visible. A structurally
  absent required provenance, licence, access or human-URL field fails artefact
  admission rather than being silently inferred.

## Human and agent acceptance

- [x] Search, exact record and provenance work in the tested human keyboard and pointer journey; touch remains an observational gap.
- [ ] Screen-reader names, headings, live regions, focus order, status/error messages and link purpose have been checked.
- [x] Narrow-screen reflow, forced-colours, reduced-motion and automated contrast rules pass; manual zoom remains an observational gap.
- [ ] ChatGPT desktop built-in browser tool registration and calls are recorded against the exact candidate URL.
- [ ] Chrome 149+ registration/call behaviour is recorded against the exact candidate URL.
- [ ] Unsupported-browser/manual fallback is recorded against the deployed `0.2.0-rc.1` candidate. It is already recorded for the prior release.
- [x] Malicious metadata, overlong input, unknown keys, unsafe URLs, digest
  mismatch and explicit missing licence/access states produce safe outcomes.
  The dedicated stale and conflicting-assertion fixtures remain pending.

## Public evidence

- [ ] Live URL resolves without authentication and serves the exact `0.2.0-rc.1` commit metadata and matching catalogue, Evidence Trace and federation digests. The current live proof is for the prior release.
- [x] Public repository resolves without authentication; the MIT licence is visible and detectable.
- [x] All 161 unique admitted official URLs returned a 2xx or 3xx response to the bounded 30 August 2026 HEAD audit; this does not prove future availability or rights.
- [ ] Video is public, under three minutes, audible, captioned and free of unlicensed media or misleading branding.
- [ ] Devpost text contains no production-readiness, official-endorsement, comprehensive-coverage or guaranteed-accuracy claim.
- [ ] All submitted URLs are copied back from the final Devpost form and tested.

## Freeze and preserve

- [ ] Submit before the controlling deadline; do not rely on community or cached later timestamps.
- [ ] Save Devpost confirmation, timestamp, submitted text and screenshots.
- [ ] Create final annotated tag/release without rebuilding different bytes.
- [ ] Record SHA-256 hashes for code, site artefact, corpus, schemas, video transcript and submission text.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
