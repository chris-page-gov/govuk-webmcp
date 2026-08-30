# Codex handover

## Current outcome

Corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` is public
through Pages run `33323152751` after pull request 12 passed the protected
branch path. The earlier `v0.2.0-rc.1` Evidence Trace and bounded-federation
release remains retained at product commit
`9235ee5db4df637bdb2a12e87449e871614afe68`; its tag and evidence were not
rewritten. The annotated pre-release and current public site are available at:

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

The optional-execution-options correction and pinned assurance harness are now
integrated and deployed. They remain later work than `v0.2.0-rc.1` and must not
be retroactively described as part of that tag.

The corrected public deployment now has reviewed Chrome DevTools MCP and
native Chrome-panel evidence. The unchanged 142.920-second video candidate has
also passed technical decode, frame-count and caption-parity review, but not
continuous owner playback or publication approval. Authenticated read-only
Devpost state at `2026-08-30T17:57:48Z` still shows project `1406973` as
`Untitled`, blank and `submission_pre_draft`; nothing was submitted.

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
- Tool execution options are optional at the host boundary. An abort signal is
  forwarded when present, but hosts that call `execute(input)` remain supported.
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
| Corrected protected-main integration | pull request 12 integrated commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` |
| Corrected Pages deployment | run `33323152751` deployed that exact main commit; all 20 public files matched Pages artefact `9735478602` byte for byte |
| Current evidence-branch unit suite | 100 of 100 passed, including post-deployment provenance, negative demonstration-media, VoiceOver and screenshot-sequence gates |
| Current evidence-branch Chrome suite | 20 of 20 passed after an authorised local-loopback exception |
| Current evidence-branch Edge suite | 20 of 20 passed after an authorised local-loopback exception |
| Current dependency audit | `npm audit --json` reported zero known vulnerabilities across 162 resolved dependencies |
| Genuine live interaction capture | five silent page-only clips; exact release, action, duration and SHA-256 receipt; agent privacy/branding review passed |
| Exact local synthetic narration timing | seven scenes total 142.826 seconds; every cue 1–8.5 seconds; 37.174-second margin below three minutes before encoding |
| Manual Safari and VoiceOver journey | completed with limitations in Safari 26.5.2 and VoiceOver 10, without WebMCP; the Caption Panel and VoiceOver were turned off afterwards |
| VoiceOver evidence binding | nine hash-bound frames, manual evidence JSON and the 27-second visibly labelled non-continuous screenshot sequence agree; no VoiceOver speech audio was captured |
| Demonstration preflight and build | passed; a 142.920-second local review MP4, en-GB captions, transcript and machine build receipt were produced |
| Local video inspection | H.264/AAC/embedded English `mov_text`; SHA-256 `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`; narration input measured -16.11 LUFS and -1.38 dBTP |
| Integrated research verification | four of four passed, including JSON Schema through version-pinned `jsonschema` 4.26.0; setup uses binary-only, no-dependency installation and `pip check`, while unhashed pins and reuse of `.venv` mean the environment is not clean or fully reproducible |
| Integrated unit suite | 95 of 95 passed |
| Integrated Chrome suite | 20 of 20 passed, including a host that omits execution options |
| Integrated Edge suite | 20 of 20 passed |
| `webmcp-evals` 0.0.4 smoke | six of six required calls passed across three model-free cases in Chrome 152; each returned `ok: true` in the expected result-schema envelope |
| Chrome DevTools MCP 1.8.0 | final hardened run at 15:53 BST on 30 August 2026 in isolated Chrome 152.0.7977.64 discovered and executed all five tools, checked closed schemas and annotations, rejected synthetic `personalContext` and recorded zero console errors |
| Public Chrome DevTools MCP 1.8.0 | exact corrected deployment discovered and completed all five calls with zero console errors |
| Native Chrome WebMCP panel | five valid calls recorded `Completed`; `limit: 21` returned the expected structured rejection; both presentation tools updated the visible page, and the comparison's 11 facet rows and digest prefix agreed with the canonical result |
| Video technical review | complete video/audio decode, 4,284 decoded frames and 38 caption cues passed; one non-fatal subtitle metadata warning retained; no audible content-parity or owner approval claimed |
| Refreshed Devpost state | project `1406973` remained `Untitled`, blank and `submission_pre_draft` at `2026-08-30T17:57:48Z`; no form or submission mutation |
| Current dependency reinstall and audit | local `npm ci --ignore-scripts --no-audit` passed and `npm audit --json` reported zero vulnerabilities across 162 application dependencies; the integrated CI and Pages definitions use the same install boundary, and Pages installs the Python pins and runs semantic smoke before deployment |
| Microsoft WebMCP Explorer build | exact commit built twice idempotently in isolated `.tools/webmcp-explorer-build/`; source checkout remained clean and the clean-output allow-list passed; source, lock and unpacked-extension file-manifest SHA-256 values recorded below |

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
- the historical post-tag
  `python3 research/2026-08-29/competition-pack/scripts/verify_pack.py` run
  passed with its optional Python `jsonschema` checks skipped because the
  package was not then installed; the current pinned environment now runs and
  passes those checks;
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
capture. The manual Safari and VoiceOver journey is now retained separately as
a completed-with-limitations evidence record. Its nine manually reviewed,
hash-bound Caption Panel frames produced an explicitly non-continuous
screenshot sequence. A heading-rotor selection was not retained and the
automatic spoken wording of the live search status was not proven; no
VoiceOver speech audio was captured and no WCAG conformance claim is made.

The guarded build produced local review video
`output/govuk-webmcp-demo-2026-08-30.mp4`, separate en-GB captions, a transcript
and a machine build receipt. The 142.920-second MP4 contains H.264 video, AAC
audio and an embedded English caption track. Its SHA-256 is
`efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`.
Synthetic `Daniel` narration was used only for this local review build; owner
approval of its publication basis, privacy, branding and final playback remains
pending. A technical review completed the full video/audio decode, counted
4,284 frames and matched all 38 caption cues, while retaining one non-fatal
subtitle metadata warning and explicitly excluding audible content-parity. The
file has not been uploaded or submitted.

## Corrected public independent-host follow-up

The user-supplied ChatGPT research is captured as a secondary input in
`docs/competition/personal-agent-webmcp-test-strategy.md`; primary Chrome,
Microsoft and Google Chrome Labs sources govern the exact versions and claims.
The intended pattern is that a static public page exposes bounded,
source-linked tools while a citizen-selected agent decides which tool to call.
The page neither hosts a model nor asks for unrelated personal context. A
remote personal-agent provider may nevertheless receive prompts, tool metadata,
arguments and results; only a correctly configured local model keeps inference
local.

The first real Chrome DevTools MCP 1.8.0 execution against the historical tagged
release failed after successful five-tool discovery. The console reported that
`options.signal` was read from an undefined execution-options argument. The
integrated fix makes that argument optional and retains cancellation when a
signal exists. The following exact pre-integration commands passed:

- `npm run research:verify` — four of four checks;
- `.venv/bin/python -m pip check` — no broken requirements;
- `npm run build` — 80 records, 80 receipts, one Evidence Trace and 10 corpus
  admissions validated;
- `npm run test:unit:prepared` — 95 of 95;
- `PLAYWRIGHT_PORT=4235 npm run test:browser:prepared` — 20 of 20;
- `PLAYWRIGHT_PORT=4236 npm run test:browser:edge:prepared` — 20 of 20;
- `npm run webmcp:eval:smoke` — six of six calls across three cases, all with
  `ok: true` and the expected result-schema envelope;
- `WEBMCP_DEVTOOLS_PORT=4231 npm run webmcp:devtools:capture` — five tools
  discovered, five calls completed, closed schemas and annotations checked,
  one synthetic `personalContext` input rejected and zero console errors at
  15:53 BST in Chrome 152.0.7977.64;
- `npm ci --ignore-scripts --no-audit` — 143 packages installed without
  dependency lifecycle scripts;
- `npm audit --json` — zero vulnerabilities across 162 application
  dependencies; and
- `npm run webmcp:explorer:setup` twice — built WebMCP Explorer 0.1.0
  idempotently from exact
  commit `f7091c12420e713b11361630dc1649d5678f62ab` without dependency
  lifecycle scripts in isolated `.tools/webmcp-explorer-build/`, while the
  pinned source checkout remained clean.

Only the ignored local DevTools receipt contains full local tool outputs. Raw
smoke rows were deleted after semantic validation; the ignored smoke receipt
retains the six-of-six counts and results digest. The smoke child received an
isolated `HOME`; no provider credential environment variables were forwarded,
but it retained the operating-system filesystem access of the invoking user. A
separate public-
target capture is bound to corrected deployed main and records five completed
Chrome DevTools MCP calls with zero console errors. Chrome's native WebMCP panel
also recorded five `Completed` calls, the expected structured rejection for
`limit: 21`, and presentation parity with the visible page. The tracked browser
evaluation fixture adds a context-minimisation and an unrelated no-call case,
but no local or remote model has yet been selected or run. Browser evaluation also requires
`WEBMCP_EVAL_PRESENTATION_APPROVED=1`; only `ollama:` is preflighted without a
download. The prepared wrapper rejects any typed upstream console error or
`pageerror`; an accepted receipt reports `browserConsoleErrorCount: 0` and
`browserConsoleErrorsAccepted: false`. No model-backed run is claimed.

The hardened DevTools runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final hardened run
left that modification time unchanged. The private receipt records the final
local candidate. The historical public `v0.2.0-rc.1` bytes remain unchanged;
corrected main is deployed separately from
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f`.

The Explorer source-tree SHA-256 is
`b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
the package-lock SHA-256 is
`76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
and the unpacked-extension file-manifest SHA-256 (over sorted per-file hashes
and paths) is
`c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
Static triage dated 30 August 2026 found the reported npm advisory paths were
not reachable in that exact production build path. Operational risks remain:
`<all_urls>`, persistent credentials in `chrome.storage.local`,
`dangerouslyAllowBrowser`, no prompt-injection mitigation and autoexecution in
Agent Run/Chat. The extension has not been loaded, no browser flag or provider
was configured, and no Explorer browser execution is claimed.

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
- The manual Safari and VoiceOver observation completed with two retained
  limitations: a heading-rotor selection was not retained, and the Caption
  Panel did not prove the automatic spoken wording of the live search status.
  VoiceOver audio was not captured. The one tested environment does not
  establish WCAG conformance.
- On 30 August 2026, `Codex In-app Browser` discovered all five tools on the
  historical tagged deployment and returned successful results from all five.
  The final comparison call had matching canonical and displayed result
  digests. This is
  a time- and host-specific observation, not evidence for ChatGPT desktop,
  native Chrome or any other host; no before-and-after focus comparison was
  recorded.
- The historical tagged release has the confirmed Chrome DevTools MCP 1.8.0
  execution compatibility defect. Corrected main is deployed and passed the
  bounded public DevTools MCP and native Chrome-panel observations; neither is
  a general compatibility guarantee.
- The model-free evaluator proves six exact successful result-schema envelopes,
  not complete payload equivalence or that an agent selects the right tool.
  Explorer and fixed-model selection evidence remain unrun; a remote provider
  would change the data boundary.
- Competition registration is complete. The demonstration exists only as a
  local review build; synthetic-voice publication, privacy, branding and final
  playback reviews remain pending. No public video upload or Devpost submission
  has occurred; the refreshed project `1406973` is still `Untitled`, blank and
  `submission_pre_draft` with no submission timestamp.

## Recommended next step

Chris Page reviews the unchanged 142.920-second candidate continuously with
audio and captions, then records the privacy, branding, caption-sync and
synthetic-voice publication decisions. If approved, publish that exact digest
to public YouTube, verify it signed out and complete the prepared Devpost fields
and owner attestations. Do not submit without a separate instruction and final
read-only freeze.

Microsoft WebMCP Explorer, fixed-model selection evaluation and a release-
platform SBOM or signed attestation remain optional assurance work, not current
official submission blockers. If undertaken, retain the documented disposable-
profile, provider-boundary and no-personal-context controls.
