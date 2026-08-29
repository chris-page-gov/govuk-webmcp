# Final pre-submission checklist

## Governance no-go gate

- [ ] Entrant route is fixed and matches all accounts, repository ownership and the Devpost form.
- [x] Ownership/licence schedule is signed off; no material relies on assumed employer permission.
- [x] Outside-interest and resource assurances are recorded; prize and publicity details still need checking at submission.
- [ ] Independent-prototype disclaimer and non-endorsement wording appear on the page and repository; video and submission remain pending.

## Exact build

- [ ] Clean clone from the release candidate succeeds using documented commands.
- [x] Lock files are honoured; gitleaks found no secret in the six-commit history or working tree; no `.env`, token, official credential or private URL is present.
- [x] Corpus and source locks rebuild deterministically; every required digest verifies.
- [x] Generated artefact, schemas, records, receipts, notices and SBOM are synchronised for the release candidate.
- [x] Tool names, descriptions, schemas and executable validation agree.
- [x] Missing provenance, licence, access or human URL fails closed to the declared limitation state.

## Human and agent acceptance

- [x] Search, exact record and provenance work in the tested human keyboard and pointer journey; touch remains an observational gap.
- [ ] Screen-reader names, headings, live regions, focus order, status/error messages and link purpose have been checked.
- [x] Narrow-screen reflow, forced-colours, reduced-motion and automated contrast rules pass; manual zoom remains an observational gap.
- [ ] ChatGPT desktop built-in browser tool registration and calls are recorded against the exact candidate URL.
- [ ] Chrome 149+ registration/call behaviour is recorded against the exact candidate URL.
- [ ] Unsupported-browser/manual fallback is recorded.
- [x] Malicious metadata, overlong input, unknown keys, unsafe URLs, digest mismatch and stale/missing fields produce safe outcomes.

## Public evidence

- [ ] Live URL resolves from a signed-out session and serves the intended commit/build root.
- [ ] Public repository resolves from a signed-out session; licence is visible and detectable.
- [x] All 161 unique admitted official URLs returned a 2xx or 3xx response to the bounded 29 August 2026 HEAD audit; this does not prove future availability or rights.
- [ ] Video is public, under three minutes, audible, captioned and free of unlicensed media or misleading branding.
- [ ] Devpost text contains no production-readiness, official-endorsement, comprehensive-coverage or guaranteed-accuracy claim.
- [ ] All submitted URLs are copied back from the final Devpost form and tested.

## Freeze and preserve

- [ ] Submit before the controlling deadline; do not rely on community or cached later timestamps.
- [ ] Save Devpost confirmation, timestamp, submitted text and screenshots.
- [ ] Create final annotated tag/release without rebuilding different bytes.
- [ ] Record SHA-256 hashes for code, site artefact, corpus, schemas, video transcript and submission text.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
