# Implementation plan and backlog tracking

This is the lockstep implementation map for
`docs/competition/backlog.md`. It records the published `v0.2.0-rc.1`
implementation and records the later supported-host observation separately
from the completed-with-limitations manual accessibility observation and local
review video. Owner publication review and the competition submission remain
separate gates; release-platform attestation is optional assurance.

The integrated compatibility and evaluator follow-up is mapped to Must 9,
13–17 and Should 11 below. It is deployed from corrected main commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, separately from the historical
`v0.2.0-rc.1` boundary. Planned evaluation E-34 maps to the new Should 12
public-service cost-boundary measurement task.

## Sequenced 1–10 plan

| Step | Scope | Backlog mapping | Status |
| --- | --- | --- | --- |
| 1 | Preserve the baseline, ownership decisions and release gates. | Must 1–2, 17–18 | Complete |
| 2 | Admit rights-reviewed sources with exact locks and bounded claims. | Must 2–4, 10–12; Could 8 | Complete |
| 3 | Build shared fail-closed contracts, integrity checks and the action runtime. | Must 4, 9, 12–15 | Complete |
| 4 | Make the analytical index the primary evidence-before-answer view. | Must 5, 9–11; Could 1 | Complete |
| 5 | Generate one digest-bound Evidence Trace fixture. | Must 10–12; Could 1–2 | Complete |
| 6 | Add accessible exploration, comparison, direct links, history and focus restoration. | Must 5, 9–11, 16; Should 7, 9 | Complete |
| 7 | Register five bounded WebMCP tools with truthful effect annotations. | Must 6–9, 13–16 | Complete |
| 8 | Publish the 10-entry corpus admission manifest and OKF mapping boundary. | Must 2–4; Could 8 | Complete |
| 9 | Run schema, digest, source-lock, unit, browser, accessibility, Edge and security assurance. | Must 13–17; Should 3, 6–7 | Complete |
| 10 | Update lockstep documentation/evidence, integrate by PR and verify the exact deployment. | Must 17–18; Should 8, 10 | Complete |

## Verification checkpoints

### Contract and data checkpoint

- Four exact source-lock ID/path/count pairs are required.
- The deterministic build produces 80 records, 80 receipts, one Evidence Trace
  and 10 corpus admissions.
- Two admissions are searchable and account for exactly 80 records; eight
  admissions contribute no searchable payload.
- Twenty closed JSON Schemas validate authored and generated artefacts.
- Raw-byte checksum, internal digest, graph and binding failures stop startup
  and prevent all tool registration.

### Interaction checkpoint

- Human search, record, provenance, analytical-index, Trace and comparison
  journeys use the shared deterministic action layer.
- Search terms remain out of URLs and storage. Bounded answer, claim, record and
  comparison selections can be restored from URL fragments.
- The three catalogue query tools are read-only. The two exploration tools have
  only a reversible in-memory page-presentation effect and declare
  `readOnlyHint: false`.
- Every result retains authoritative links, assertion labels and limitations.
  The Trace exposes eight facets and no combined trust score.
- On 30 August 2026, `Codex In-app Browser` discovered and successfully called
  all five tools against the historical tagged deployment. The final
  comparison's canonical and displayed result digests matched. This does not
  establish support in another host.
- A Chrome DevTools MCP 1.8.0 run against the historical tagged deployment
  exposed a callback compatibility defect when the host omitted the execution-
  options object. Corrected main preserves cancellation when a signal is
  supplied and is now deployed. A public-target rerun completed all five calls
  with zero console errors.
- Chrome's native WebMCP panel recorded all five calls as `Completed`, returned
  the expected structured rejection for `limit: 21`, and retained parity for
  both presentation tools. The comparison showed 11 facet rows and its
  displayed digest prefix matched the canonical result.

### Assurance checkpoint

- `npm run test:unit`: 58 passed.
- Installed Chrome and Edge: 19 browser tests passed in each.
- The expanded axe WCAG 2.2 smoke test had no serious or critical violations;
  keyboard, history/focus, 320px, forced-colour and reduced-motion checks
  passed.
- The formal diff scan's two low findings were reproduced and fixed; an
  independent post-patch review found no bypass.
- A later immutable 44-item candidate snapshot scan completed with no
  reportable finding. Its warning about the final post-snapshot delta is
  retained alongside a separate bounded review and complete test rerun.
- Independent contract review also confirmed executable/schema parity for
  complete records and receipts, IDs, URLs, timestamps, filters, federation
  decisions and Evidence Trace relationships.
- The link audit recorded 161 of 161 unique admitted official URLs reachable by
  its bounded method; the dependency audit reported zero known vulnerabilities.
- A manual Safari 26.5.2 and VoiceOver 10 journey completed without WebMCP. Its
  retained Caption Panel sequence and manual record preserve two limitations:
  the heading-rotor selection was not retained and the automatic spoken wording
  of the live search status was not proven. No VoiceOver audio or WCAG
  conformance is claimed.
- The guarded video pipeline produced a 142.920-second local review MP4 with
  H.264 video, AAC synthetic narration, an embedded English caption track,
  separate en-GB captions, a transcript and a machine build receipt. It has not
  been published or submitted. A later technical review completed the full
  video/audio decode, counted 4,284 frames and matched all 38 caption cues; one
  non-fatal subtitle metadata warning and the absent owner playback approval
  remain explicit.
- The integrated follow-up passed four research-pack checks with version-pinned
  `jsonschema` 4.26.0, 95 unit tests, 20 Chrome tests, 20 Edge tests, six of six
  model-free `webmcp-evals` calls with `ok: true` in their expected result-schema
  envelopes, and five of five real Chrome DevTools MCP calls in an isolated
  Chrome 152.0.7977.64 profile. The final hardened DevTools run at 15:53 BST
  checked closed schemas and annotations, rejected synthetic `personalContext`,
  recorded zero console errors and disabled update checks. Python setup installs
  binary distributions without
  dependency resolution and runs `pip check`; the unhashed pins and reuse of
  `.venv` mean the environment is not clean or fully reproducible. Raw smoke
  rows were deleted after semantic validation; the ignored smoke receipt
  retains counts and a results digest, while only the ignored DevTools receipt
  retains full outputs. No model-backed selection test has been run.
- The public Chrome DevTools MCP capture is bound to corrected main commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and records five successful calls
  with zero console errors. The native Chrome-panel observation records five
  `Completed` calls, the structured `limit: 21` rejection and presentation
  parity.
- The prepared model-backed browser runner fails closed on typed upstream
  console errors and `pageerror` events; an accepted receipt records a zero
  count and `browserConsoleErrorsAccepted: false`.
- The integrated CI and Pages definitions use
  `npm ci --ignore-scripts --no-audit`; Pages also installs the version-pinned
  Python requirements and runs semantic WebMCP smoke before deployment. Those
  definitions ran before Pages run `33323152751` deployed corrected main.

PR #9 integrated the candidate into protected `main` at
`9235ee5db4df637bdb2a12e87449e871614afe68`. Exact-main validation run
`33286750188` passed, Pages run `33286771963` rebuilt, tested and deployed that
same commit, and the public site metadata and live artefact bytes were verified.
The exact commit is tagged `v0.2.0-rc.1`.

Pull request 12 later integrated the optional-execution-options correction and
pinned assurance harness through protected `main`. Pages run `33323152751`
deployed exact commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`; the earlier
tag and its evidence remain unchanged.

## Backlog status

| Backlog range | Status and evidence |
| --- | --- |
| Must 1–2 | Complete for this repository: recorded ownership assurance, preserved baseline, item-level rights and four source locks. |
| Must 3 | Complete: 69 locked GOV.UK records plus 11 reviewed companion records. |
| Must 4 | Complete: minimal profile, 20 schemas, authored/generated validators and deterministic builders. |
| Must 5 | Complete for the bounded tested journeys: automated Chrome and Edge cover search, record, provenance, analytical index, Trace and comparison; a manual Safari and VoiceOver journey completed with two retained limitations and no WCAG claim. |
| Must 6–8 | Complete in the published release: five tools include the original three query tools and two evidence-presentation tools. |
| Must 9 | Complete: one action controller, deterministic page/tool output and display-digest parity. |
| Must 10–11 | Complete: authoritative human links and visible access, rights, assertion, observation and limitation fields. |
| Must 12 | Complete: source, record, bundle, receipt, Trace, federation and raw-file digests/checksums. |
| Must 13 | Complete: all four artefact families, four exact source locks and the 80-record release boundary fail closed. |
| Must 14 | Part complete: tamper, input, URL, inert-text, missing-licence and no-match tests pass; dedicated stale and conflicting-assertion fixtures remain. |
| Must 15 | Complete: CSP, no storage and no external runtime provider request are enforced and tested. |
| Must 16 | Complete: instrumented lifecycle tests and installed Chrome and Edge contract checks passed; `Codex In-app Browser` called all five tools on the historical tagged release; and corrected deployed main passed five public Chrome DevTools MCP calls with zero console errors. Chrome's native WebMCP panel recorded five `Completed` calls, a structured rejection for `limit: 21` and presentation parity. Optional Microsoft Explorer browser execution and fixed-model selection evidence remain under Should 11. |
| Must 17 | Complete: MIT licence and notices are published; PR #9 and the exact tagged deployment remain recorded; PR #12 and Pages run `33323152751` bind corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` separately. |
| Must 18 | Part complete: submission copy, storyboard, five genuine interaction clips and their consolidated receipt, the labelled supported-host receipt visualisation, manual VoiceOver evidence and its non-continuous screenshot sequence, release hashes, competition registration, tag `v0.2.0-rc.1`, a captioned 142.920-second local review video with transcript and build receipt, its technical decode/frame/caption review, and the final read-only compliance review are complete. Owner synthetic-voice, privacy, branding and final-playback review, public upload and authorised submission remain open; the refreshed Devpost project `1406973` is `Untitled`, blank and `submission_pre_draft`. |

## Implemented Should and Could work

- Should 2: bounded publisher, resource-type and access filters.
- Should 3: a dated 161-URL official-link health report.
- Should 6: local macOS ARM64 sanitised CycloneDX SBOM; release-platform SBOM
  evidence and a signed release attestation remain future work.
- Should 7: accessibility statement, automated/manual-browser evidence and a
  completed-with-limitations Safari and VoiceOver observation. This does not
  establish WCAG conformance.
- Should 8: part complete through retained separate `v0.1.0-rc.1` and
  `v0.2.0-rc.1` public search captures; a bound side-by-side comparison
  artefact remains.
- Should 9: bounded related-record links.
- Should 11: part complete through pinned Chrome DevTools MCP and
  `webmcp-evals` harnesses, isolated loopback execution, context-minimisation and
  no-call fixtures, exact public-commit DevTools MCP execution and native Chrome-
  panel evidence. Microsoft Explorer and fixed-model evidence remain. The exact
  Explorer 0.1.0 source was built twice
  idempotently in isolated `.tools/webmcp-explorer-build/`, leaving its source
  checkout clean and passing the clean-output allow-list. Static triage dated
  30 August 2026 found the npm advisory paths were not reachable in that exact
  production build path, but the
  privileged-extension operating risks in `SECURITY.md` remain. The extension
  has not been loaded.
- Should 12: planned through E-34. Define a comparable server-side AI baseline,
  hold source quality and user outcomes comparable, and measure government-
  origin requests, bytes, compute and support effort alongside citizen-provider
  whole-system costs. No public saving is claimed from the static prototype.
- Could 1: an accessible Evidence Trace graph and relationship table.
- Could 8: a bounded 10-entry estate descriptor. Only two collections are
  searchable; this is not payload federation.

`compare_resources` is not implemented. The completed comparison contrasts
the foundations of two to four claims in one answer and deliberately does not
rank resources. Timeline, map, multilingual, refresh, persistent MCP, user-study
and signed-publisher-attestation items remain future work.

## Published release and remaining gates

The tagged product-integration and publication sequence remains complete: PR #9
merged to protected `main`, exact-main run `33286750188` passed, Pages run
`33286771963` deployed commit
`9235ee5db4df637bdb2a12e87449e871614afe68`, live metadata and artefact bytes
matched that release, and the commit is tagged `v0.2.0-rc.1`. Separately, PR #12
integrated the compatibility correction and Pages run `33323152751` deployed
exact corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`.

Supported-host discovery and calls were observed for the historical tagged
deployment in `Codex In-app Browser`. Five genuine public-page interaction
clips and their release/action/duration/hash receipt are complete, and the
guarded pipeline rejects preview substitutions, unrelated VoiceOver media and
receipt drift. The manual Safari and VoiceOver journey, Caption Panel frame
sequence and exact media/time binding are complete. The guarded build produced
the captioned, 142.920-second local review MP4, transcript and build receipt.
The latest read-only Devpost check at `2026-08-30T17:57:48Z` found project
`1406973` still `Untitled`, blank and `submission_pre_draft`. The remaining
sequence is:

1. Complete the owner's continuous playback, synthetic-voice publication,
   privacy, branding and caption-sync review.
2. Upload the approved exact video digest to public YouTube and verify the
   player signed out, including audible audio and captions.
3. Complete the title, description, URLs, custom answers and owner attestations
   in the live Devpost form; run one final read-only freeze.
4. Submit only with separate authority and retain the returned receipt.
5. Optionally run Microsoft WebMCP Explorer/fixed-model selection evidence,
   E-34 cost-boundary measurement and a release-platform SBOM or attestation;
   these are not current official submission prerequisites.
