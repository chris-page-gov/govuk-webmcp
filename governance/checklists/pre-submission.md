# Final pre-submission checklist

## Governance no-go gate

- [ ] Entrant route is fixed and matches all accounts, repository ownership and the Devpost form.
- [ ] Ownership/licence schedule is signed off; no material relies on assumed employer permission.
- [ ] Outside-interest, conflict, prize and publicity decisions are recorded.
- [ ] Independent-prototype disclaimer and non-endorsement wording appear on the page, repository, video and submission.

## Exact build

- [ ] Clean clone from the release candidate succeeds using documented commands.
- [ ] Lock files are honoured; secret scan is clean; no `.env`, tokens, cookies, official credentials or private URLs are present.
- [ ] Corpus and source locks rebuild deterministically; every required digest verifies.
- [ ] Generated artefact, schemas, records, receipts, notices and SBOM are synchronised.
- [ ] Tool names, descriptions, schemas and executable validation agree.
- [ ] Missing provenance, licence, access or human URL fails closed to the declared limitation state.

## Human and agent acceptance

- [ ] Search, exact record and provenance work in the human UI with mouse, touch and keyboard.
- [ ] Screen-reader names, headings, live regions, focus order, status/error messages and link purpose have been checked.
- [ ] Narrow-screen, zoom/reflow, forced-colours, contrast and reduced-motion checks pass.
- [ ] ChatGPT desktop built-in browser tool registration and calls are recorded against the exact candidate URL.
- [ ] Chrome 149+ registration/call behaviour is recorded against the exact candidate URL.
- [ ] Unsupported-browser/manual fallback is recorded.
- [ ] Malicious metadata, overlong input, unknown keys, unsafe URLs, digest mismatch and stale/missing fields produce safe outcomes.

## Public evidence

- [ ] Live URL resolves from a signed-out session and serves the intended commit/build root.
- [ ] Public repository resolves from a signed-out session; licence is visible and detectable.
- [ ] Authoritative GOV.UK, API Catalogue, data.gov.uk and publisher links open correctly.
- [ ] Video is public, under three minutes, audible, captioned and free of unlicensed media or misleading branding.
- [ ] Devpost text contains no production-readiness, official-endorsement, comprehensive-coverage or guaranteed-accuracy claim.
- [ ] All submitted URLs are copied back from the final Devpost form and tested.

## Freeze and preserve

- [ ] Submit before the controlling deadline; do not rely on community or cached later timestamps.
- [ ] Save Devpost confirmation, timestamp, submitted text and screenshots.
- [ ] Create final annotated tag/release without rebuilding different bytes.
- [ ] Record SHA-256 hashes for code, site artefact, corpus, schemas, video transcript and submission text.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
