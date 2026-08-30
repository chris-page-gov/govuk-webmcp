# Codex handover

## Current outcome

The `0.2.0-rc.1` Evidence Trace and bounded-federation release is public from
product commit `9235ee5db4df637bdb2a12e87449e871614afe68`. Pull request 9
passed the protected branch boundary and was merged to `main`; exact-main
validation run `33286750188` and Pages run `33286771963` passed. The annotated
pre-release and exact public site are available at:

- <https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1>
- <https://chris-page-gov.github.io/govuk-webmcp/>

The release expands the 80-record, 80-receipt static catalogue with:

- four exact authored source locks;
- one worked Evidence Trace over three selected new-child GOV.UK records;
- an analytical index, interactive text-labelled Trace, foundation detail and a
  score-free two-to-four-claim comparison;
- eight separate evidence facets: authority, assertion, verification,
  freshness, integrity, access, rights and coverage;
- five imperative WebMCP tools over the same deterministic action controller as
  the human interface; and
- a 10-entry corpus admission manifest: two collections are searchable and
  eight remain non-searchable.

No `gis-ai-go` or OKF source repository was changed.

## Source and generated bindings

| Binding | SHA-256 or immutable reference |
| --- | --- |
| Preserved research baseline | `4c85db7` |
| `okf-govuk-content` producer commit | `94f5020cb2c7512a79c2353ee48743ad733a132c` |
| Producer Git blob | `e7f3b6a0d1efa6cb336b1b50a69228de26216aa5` |
| Imported 69-record GOV.UK source | `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc` |
| Curated 11-record source | `f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794` |
| Authored answer pack | `ea00549f465ef4d7fc65c9e5853ee2b78ab6d9823d25e9268516d7b955d70f1f` |
| Authored corpus admissions | `dc798de2d33fc9434e1dce730bb945c8fd7b6c01466cea02728c9aadf292edd0` |
| Generated catalogue bundle | `20593105f6e34d5072f566b4f7b98cab143c4333c56bbabfca831b935237945c` |
| Evidence Trace collection | `a6c38dcc1cc8defbb38a1541e5964159a1e724aa989cb362187111a801dc0a3b` |
| Federation manifest | `3b1301d55ebd232e6d4b89226ddb9cc92ee4ae0878fc5b6ac48a88594ed06d71` |

Every standalone builder validates the exact four source-lock ID/path/count
pairs and consumes the regular-file bytes returned by that validator. Generated
JSON and checksum sidecars are deterministic.

## Implemented runtime boundary

- The static same-origin application calls no official API at runtime.
- The human interface becomes usable after catalogue, receipts, Evidence Trace
  and federation validation and does not wait for WebMCP registration.
- `search_government_knowledge`, `get_resource_record` and
  `show_provenance` are read-only.
- `explore_answer_foundations` and `compare_evidence_foundations` change only
  reversible in-memory page presentation and truthfully use
  `readOnlyHint: false`.
- All five tools use closed schemas and executable validation. Unknown,
  oversized, malformed, broad, accessor-bearing and deeply nested rejected
  inputs fail closed.
- Rejected input is not serialised or hashed. Successful diagnostic input is a
  shallow admitted-data copy; the displayed result has a deterministic digest.
- Public fragment routes are bounded before parsing and comparison values are
  bounded before splitting.
- Source-derived text remains untrusted and is rendered as inert text.
- Authoritative links, assertion labels, observation dates, access, rights and
  limitations remain visible. No combined trust score is generated.
- No query, account, cookie, analytics, persistent app storage, provider call,
  canonical-data mutation or external state change is introduced.

This is page-scoped WebMCP progressive enhancement, not a durable MCP gateway,
provider integration or service-operation layer.

## Release assurance observed on 30 August 2026

| Command or observation | Result |
| --- | --- |
| `npm run test:unit` | 58 of 58 passed |
| `PLAYWRIGHT_PORT=4210 npm run test:browser:prepared` | 19 of 19 passed in installed Chrome |
| `PLAYWRIGHT_PORT=4211 npm run test:browser:edge:prepared` | 19 of 19 passed in installed Microsoft Edge |
| Expanded axe WCAG 2.2 smoke | no serious or critical violations |
| Keyboard, focus/history, 320px, forced colours, reduced motion | passed |
| Manual headed Playwright index/comparison journey | completed and screenshots visually inspected |
| `npm audit --json` | zero known vulnerabilities across 33 dependencies |
| Bounded official-link HEAD audit | 161 unique URLs reachable; 0 attention |
| Local macOS ARM64 CycloneDX SBOM | 14 components; personal author/contributor metadata absent; release-platform evidence remains pending |
| Protected pull-request integration | pull request 9 merged to `main` after its required check passed |
| Exact-main validation | run `33286750188` passed for `9235ee5db4df637bdb2a12e87449e871614afe68` |
| Exact Pages deployment | run `33286771963` rebuilt, retested and deployed the same product commit |
| Public artefact comparison | all 20 Pages artefact files returned HTTP 200 and matched the live bytes |
| Signed-out live-browser journey | passed with successful same-origin data requests and no console warning or error |
| Public repository hardening | protected `main`, secret scanning and push protection enabled |
| Current evidence-branch unit suite | 69 of 69 passed, including negative demonstration-media, VoiceOver and screenshot-sequence gates |
| Current evidence-branch Chrome suite | 19 of 19 passed after an authorised local-loopback exception |
| Current evidence-branch Edge suite | 19 of 19 passed after an authorised local-loopback exception |
| Genuine live interaction capture | five silent page-only clips; exact release, action, duration and SHA-256 receipt; agent privacy/branding review passed |
| Exact local synthetic narration timing | seven scenes total 138.105 seconds; every cue 1–8.5 seconds; 41.895-second margin below three minutes before encoding |
| Demonstration preflight | fails closed only on the missing VoiceOver clip, manual journey JSON and media/time binding |
| Safari capture readiness | Mac unlocked; canonical public route verified ready in Safari 26.5.2. Continuous `screencapture` remains unavailable, so the guarded visibly labelled screenshot-sequence fallback is ready; VoiceOver has not been enabled and no manual observation is claimed |

Post-tag evidence-branch closure used these exact checks:

- `npm run test:unit`: the deterministic build and 59 unit tests passed;
- `PLAYWRIGHT_PORT=4215 npm run test:browser:prepared`: all 19 Chromium tests
  passed after the keyboard-flake correction;
- `PLAYWRIGHT_PORT=4216 npm run test:browser:edge:prepared`: the same 19 tests
  passed in installed Microsoft Edge;
- pull request 10 validation run `33289132374` passed before its evidence and
  test-only commits were rebase-merged at
  `52111598a63db8012670fa94636860c2ae7a403b`; the first exact-main run
  `33289173022` then exposed a second unsettled test baseline in deeply nested
  rejected-input recovery after all 59 unit tests had passed;
- the follow-up systematically settles the application `ready` state before
  acceptance cases inspect initial evidence or issue a tool action, and starts
  the independent Trace/search keyboard checks from a fresh base route after
  the skip-link hash check; the two readiness-sensitive cases passed 100 of 100
  repeated Chrome runs, the keyboard case passed 50 of 50 repeated Edge runs,
  and both complete 19-test suites passed 95 of 95 runs;
- `python3 research/2026-08-29/competition-pack/scripts/verify_pack.py`:
  passed, with optional Python `jsonschema` meta-schema checks skipped because
  that package is not installed;
- all four edited CSV registers parsed successfully with consistent row widths;
- both repository and 20-file site SHA-256 manifests verified;
- `git diff --check`: passed; and
- `gitleaks detect --source . --no-banner --redact --exit-code 1`: no leak
  found across 14 commits; `gitleaks dir . --no-banner --redact --exit-code 1`
  also found no leak in the 3.16 MB working tree.

The first one-command `npm test` browser phase could not bind a loopback socket
in the restricted sandbox, so its research, build, unit and browser stages were
also run separately. During the readiness follow-up,
`PLAYWRIGHT_PORT=4227 npm test` ran with the authorised local loopback exception
and passed the research verifier, deterministic build, 59 unit tests and all 19
Chrome tests. Only browser serving used that exception.

The formal candidate diff scan has ID
`0735e481-5df9-43fe-8f3a-04bc3d9b797c`. It reported two low-severity
robustness findings: rejected-input diagnostic stack exhaustion
(`csf_41bd1a86df6723af9809e17f`) and an unbounded comparison fragment
(`csf_f203d8431e5137ec989af24d`). Both were reproduced, fixed and verified as
`fixed`; one fresh independent reviewer found no bypass. A separately
security-suppressed source-lock admission gap was resolved as a provenance
assurance defect.

Canonical pre-remediation scan output and the remediation record are retained
under `docs/competition/evidence/`. A later immutable 44-item candidate
snapshot scan (`8dda47c2-46d1-4a1f-9e00-15bbaa684cdb`) completed with no
reportable finding. Its preserved warning records that the final stricter
count, identifier, workflow, test and documentation delta followed the
snapshot; that delta and the final test matrix are recorded separately in
`candidate-verification-2026-08-30.md`.

The protected pull-request, exact-main, release, Pages artefact and signed-out
live-browser evidence is recorded separately in
`public-release-verification-2026-08-30.md` and the machine-readable
`challenge-provenance.json`. Those post-tag records verify the immutable product
commit; they do not claim to be contained in it.

The current evidence branch also contains the fail-closed demonstration
pipeline, five genuine public-page interaction clips in ignored local output,
their consolidated receipt, and a clearly labelled supported-host receipt
visualisation. The visualisation is not host-owned video or a Site tools
capture. A guarded fallback can render nine manually reviewed Safari and
VoiceOver frames from immutable verified bytes as an explicitly non-continuous
screenshot sequence. The builder validates the declared capture metadata but
does not prove VoiceOver use; the separate manual observation remains required.
No final MP4, caption file, transcript or build receipt exists yet.

## Residual limitations

- The GOV.UK imported bytes and Git blob are verified, but the historical
  producer revision was not available in the local checkout.
- The cached ONS release ZIP has a local SHA-256 but no independently retrieved
  official checksum sidecar.
- The local `okf-testing` directory is unversioned and has no established
  licence; it remains quarantined.
- `targetOkfCore: "0.2"` is a descriptive target mapping. It does not replace
  the separately recorded `sourceOkfCore` state or admit producer payload.
- Source locks prove reproducible local admission, not publisher signatures or
  external attestation.
- No manual screen-reader observation has been performed and no WCAG
  conformance claim is made.
- On 30 August 2026, `Codex In-app Browser` discovered all five tools on the
  exact public release and returned successful results from all five. The final
  comparison call had matching canonical and displayed result digests. This is
  a time- and host-specific observation, not evidence for ChatGPT desktop,
  native Chrome or any other host; no before-and-after focus comparison was
  recorded.
- Competition registration is complete. The public demo video and Devpost
  submission remain unperformed; project `1406973` is still an unpublished
  pre-submission draft.

## Recommended next step

This post-tag evidence is maintained separately from the unchanged product
bytes. Supported-host discovery and five representative calls are now recorded
for the exact public release in `Codex In-app Browser`. Next, perform and record
the manual VoiceOver journey in Safari and create the missing
`output/demo-clips/demo-scene-06-voiceover-2026-08-30.mov` and
`docs/competition/evidence/manual-voiceover-journey-2026-08-30.json` with exact
media/time binding. Then complete the demonstration video, captions, transcript,
build receipt and final compliance review. Do not claim a release-platform SBOM
or signed attestation from the retained local macOS ARM64 dependency view. The
public video and Devpost submission remain unperformed; do not submit without a
separate instruction and final compliance check.
