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

Pull request 13 integrated the post-deployment evidence, evidence tests and
lockstep documentation as repository commit
`5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`; exact-main validation run
`33327860583` passed. It did not dispatch Pages or change the deployed product
bytes.

Version `0.2.0-rc.2` is the protected-main repository checkpoint immediately
before the wider OKF federation implementation. It preserves the deployed
product and historical `v0.2.0-rc.1` boundaries rather than replacing either.

Annotated tag `v0.2.0-rc.2` resolves to product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935`. It and the public pre-release are
the retained, frozen project baseline; the GitHub release is not described as
platform-immutable. Package version `0.3.0-rc.1` identifies the implemented
local federated candidate. Its production build, byte-idempotence, 144 unit
tests, 29 Chrome tests, 29 Edge tests and six model-free smoke calls passed at
the last complete pre-remediation checkpoint. Seven initial Low security
findings were remediated; a sealed follow-up scan suppressed those seven and
found an eighth Low URL-boundary issue, which was fixed after its snapshot. The
current exact research, build/data, lexical-quality, Chrome, Microsoft Edge and
authorised model-free smoke gates pass where recorded. The full unit suite now
passed 173 of 173 in `17128.154916 ms` before the latest three engineering
remediations. Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` completed
50 of 50 review items, dynamically reproduced three evidence-integrity or
availability defects and classified zero as reportable vulnerabilities under
attack-path policy. The defects have working-tree remediations nevertheless.
The exact post-remediation local research, build/data, unit, frozen-quality,
Chrome, Microsoft Edge, model-free real-Chrome smoke, dependency-audit and
diff-integrity gates now pass. Immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items against
exact commit `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable
findings. CI, Pages, release and current-candidate supported-host evidence
remain open. The preceding exact-range scan
`2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` completed 55 of 55 review items and
reported one High-confidence, Low-severity source-substitution finding
(`csf_050a3c08c471d3176e0640c3`). Its remediation adds separately code-reviewed
imported SHA-256 pins for all five admitted sources plus a direct federation-
lock byte check in the standalone builder. The source, source-and-registry and
direct-builder substitution regressions now fail closed; source validation,
the production build and 194 of 194 prepared unit tests pass.

## Completed pre-federation 1–10 plan

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

## Implemented local `0.3.0-rc.1` sequenced 1–10 plan

The new sequence is mapped to the federation items in
[`backlog.md`](backlog.md) and the A–M gates in the
[`OKF federated personal-agent evaluation plan`](okf-federated-personal-agent-evaluation-plan.md).
An implementation status does not unlock the corresponding evidence claim;
only the named gate against the exact candidate can do that.

| Step | Scope | Backlog mapping | Acceptance gates | Status |
| --- | --- | --- | --- | --- |
| 1 | Freeze the pre-federation baseline and fix the population, rights and no-overclaim boundary. | Federation 1 | A, L, M | Baseline complete; candidate release binding pending |
| 2 | Admit exactly four fixed source identities, descriptors, search manifests and mirrored artefact paths. | Federation 2 | A, B, C, I | Implemented and locally verified; release binding pending |
| 3 | Define the two evidence tiers, common record/provenance shape, closed schemas and executable validation. | Federation 3 | B, F, H, I | Implemented, including exact ordered per-source population bindings and executable collection display contracts; the current contract count is recorded below |
| 4 | Build deterministic, progressively loaded same-origin search with fixed byte, row, fan-out, memory and timeout budgets. | Federation 4 | C, D, I | Implemented with incremental exact-byte postings partitioning, aggregate build caps, streamed response caps, bounded generated-plane cleanup and separate 4-active/32-queued/36-distinct physical-fetch limits; each 3-second file deadline includes queue time and a slot is retained until loader settlement; exact local build/data and quality gates pass; release binding pending |
| 5 | Extend the three discovery tools and accessible human controls through the shared action controller; retain the two presentation tools unchanged in scope. | Federation 5 | E, F, G, H | Implemented; combined and public WebMCP search preserve `federated_runtime_busy`, while the human live region distinguishes rejected input, busy state and other failure; focused tests pass 11 of 11, prepared unit 194 of 194 and both installed browsers 30 of 30 with exit 0 |
| 6 | Surface collection status, tier, snapshot, source-link role and limitations; isolate partial source failures without a weak fallback. | Federation 6 | F, G, K | Implemented; a busy runtime is not misclassified as source unavailable, and all four genuine unavailable-source cases passed in Chrome and Edge; manual accessibility evidence pending |
| 7 | Add tiny v1/v2 fixtures plus corruption, co-digested semantic mutation, ranking, duplicate, injection and resource-exhaustion tests. | Federation 7 | A–I | Implemented, including code-reviewed source pins, same-count source-and-registry substitution, direct federation-lock substitution, per-source co-digested population/display mutation and cancellation-churn cases; the exact post-remediation frozen quality gate passes at mean nDCG@10 0.984698009 and Recall@20 1 with cold/warm parity, no legislation collection and the legislation request rejected |
| 8 | Run the four producer journeys, human/tool parity, accessibility and model-free browser/host checks against one candidate. | Federation 8 | D–K | In verification: exact final-candidate local Chrome and Edge each pass 30 of 30 and model-free WebMCP smoke passes 6 of 6 in real Chrome; focused manual accessibility and supported-host capture remain pending |
| 9 | Run at least three fixed-model selections per synthetic case and the whole-system cost comparison, retaining failures and uncertainty. | Federation 9 | J, L | Five local attempts are retained and all failed the strict gate; attempt 4 bound receipt-v2 identity but retained a null evaluation after structural validation failed; attempt 5 retained 30 pass and 6 fail but failed `verify-reports`; cost study remains planned; hypotheses only |
| 10 | Update lockstep evidence, integrate through protected review, verify exact public bytes and bind every released claim to the deployed candidate. | Federation 10 | M | Lockstep update records the sealed pre-remediation Low finding, its implemented code-pin fix and fixed-tree scan `040ad945-3723-4aef-9c03-1bb552630deb` with zero reportable findings. Pull request 16's first Linux run `33354712509` exposed a host-specific gzip header byte; the portable fixed-byte correction and regression are implemented, with CI rerun, Pages, tag, release and exact public evidence pending |

The approved federated population is 58,655 locked raw source rows:
9,757 A Life in the UK records, including 293 service families; 5,097 ONS
metadata records; 41,598 UK Government APIs records; and 2,203 HM Land
Registry public-estate metadata rows. Exactly three standalone Land Registry
legislation rows are quarantined, leaving 2,200 searchable Land Registry
records and 58,652 searchable federated records overall. The raw population
remains separate from 80 reviewed deep-evidence records and is not a count of
unique records. No standalone UK Legislation collection, payload, index or
runtime request is included, and the searchable projection contains zero
`legislation.gov.uk` result links. The four snapshots retain 28 source-authored
cross-reference strings as inert, untrusted metadata: 6 in A Life in the UK, 3
in ONS, 2 in UK Government APIs and 17 in Land Registry.

One ordered executable contract now binds every admission and search collection
to source/quarantined/searchable counts: 9,757/0/9,757 for A Life in the UK,
5,097/0/5,097 for ONS, 41,598/0/41,598 for UK Government APIs and
2,203/3/2,200 for HM Land Registry. It also binds each collection's title,
ordered supplementary counts, completeness statement and first limitation. A
self-consistent checksum cannot legitimise a per-source population
redistribution or contradictory display statement.

Federated links and assertions remain producer-declared rather than official.
Exact-record source authority is “Not independently established”, and the human
route displays the recorded destination hostname.

At this working-tree checkpoint, the fifth source-lock registry entry binds 73
versioned gzip artefacts totalling 13,021,675 bytes. The current dynamic totals
are 5 source-lock registry entries, 10 admissions and 31 schemas. The generated
same-origin search plane is ignored rather than committed as authored source;
the locally verified plane contains 1,853 shards — 120 record shards and 1,733
postings shards — plus the manifest and checksum sidecar, for 1,855 files and
127,747,020 bytes in total. The production build reconstructs and validates
that plane before copying it into the Pages artefact. The page initially loads
the manifest and checksum only, then retrieves bounded checksum-verified
postings and record shards from the same origin as a query requires.

## Observed `0.3.0-rc.1` local verification checkpoint

These results are the last complete pre-remediation checkpoint. They do not
apply to the exact current tree and do not replace protected CI, exact deployed-
byte or supported-host evidence.

- Five exact source-lock registry entries validated: four retained reviewed
  inputs and one four-publication OKF federation lock.
- The 10 corpus admissions contained 6 searchable collections and 4
  non-searchable collections. Searchable evidence remains split into 80
  reviewed records and 58,652 searchable federated records from 58,655 raw
  source rows; 3 Land Registry legislation rows are quarantined.
- Thirty-one closed schemas covered authored and generated data, all five tool
  inputs and their output families. Successful combined search uses
  `trusted-govuk-discovery.search-result.v2`; exact record and provenance
  outputs use explicit reviewed/federated unions.
- The production build completed, and the federation data test rebuilt the
  plane twice with byte-identical output.
- `npm run test:unit:prepared`: 144 of 144 passed in 174.5 seconds.
- Installed Chrome and installed Microsoft Edge: 29 browser tests passed in
  each, including all four source journeys, same-origin lazy loading, all four
  explicit unavailable-source cases, partial
  failure, human/tool parity, output boundaries and automated accessibility
  checks. The Edge run required the authorised loopback-only exception after
  the sandbox produced the expected `EPERM` socket error.
- Model-free `webmcp-evals`: six of six authored smoke calls passed their
  expected result-schema envelopes.
- The exact tree before the latest three remediations passed the frozen lexical
  gate with mean nDCG@10
  `0.984698009`, Recall@20 `1`, identical cold/warm results and legislation
  absent or rejected. It remains required by CI and Pages.
- Seven initial Low security findings were remediated after this checkpoint.
  Sealed scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and
  found an eighth High-confidence Low trailing-dot and secondary legislation-
  URL bypass (`csf_a2d9e030fda789ecd1cb0e41`), which was fixed post-snapshot.
  The scan reported no other open reportable candidate, but its coverage is
  mechanically partial and has stale-pending rows. Focused security checks
  passed 119 of 119, then the affected post-fix subset passed 23 of 23.
- The exact tree before the latest three remediations also passed the research
  pack 4 of 4, production build/data
  validation, and 29 of 29 tests in both installed Chrome and Microsoft Edge.
  The first model-free smoke attempt hit the expected sandbox `EPERM` loopback
  restriction; the authorised outside-socket-sandbox rerun passed 6 of 6. The
  `npm run test:unit:prepared` passed 173 of 173 in `17128.154916 ms` on that
  tree.
- Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` subsequently completed
  50 of 50 review items and dynamically reproduced mutable local-model identity
  evidence, aggregate-only per-source population binding and cancellation-
  driven physical shard-work amplification. Attack-path review classified zero
  as reportable vulnerabilities: exploitation respectively needs privileged
  loopback model-service control, repository/build or same-origin write
  authority, or causes bounded self-availability impact. All three remain real
  engineering or evidence-integrity defects and have working-tree remediations.
- The physical-fetch remediation permits 4 active, 32 queued and 36 distinct
  in-flight shard files. A file's 3-second deadline starts before queueing, and
  its slot remains held until the underlying loader settles. Queue or immediate
  pre-loader deadline expiry returns a scheduler-busy result, not a source-
  corruption result. Up to four loaders that never settle can therefore retain
  every slot and make federation loading unavailable, but cancellation churn
  cannot admit additional physical work.
- Exact post-remediation local verification passed research 4 of 4; production
  build and data validation for 80 reviewed records, 80 receipts, 58,655 raw
  rows, 3 quarantined rows, 58,652 searchable rows, 120 record shards and 1,733
  postings shards; 194 of 194 prepared unit tests; mean nDCG@10 `0.984698009`
  and Recall@20 `1` with cold/warm parity, no legislation collection and the
  legislation request rejected; 30 of 30 tests in installed Chrome and 30 of 30
  in installed Microsoft Edge; 6 of 6 model-free WebMCP smoke calls in real
  Chrome; zero npm-audit vulnerabilities across 162 total dependencies; and a
  clean `git diff --check`. Immutable fixed-tree scan
  `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items
  against exact commit `9c6ed7d9a21574972ee564b333cbc49983058554` with zero
  reportable findings.
- The post-review busy-state correction preserved `federated_runtime_busy`
  through combined/public WebMCP search, made the human live region distinguish
  rejected input, busy state and other failure, and passed the production build,
  11 of 11 focused regressions and 194 of 194 prepared unit tests. Chrome and
  Edge each exited zero with 30 of 30.
- The final-candidate demonstration preflight correctly failed closed without a
  deployed commit and explicit overwrite approval. It did not start live capture
  and supplies no live-capture evidence.
- Five local `webmcp-evals` attempts used Chrome 152, eight cases, three runs
  per case and exact loopback-only `ollama:gpt-oss:20b` model digest
  `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
  with the first three using no remote credentials. The pre-legibility attempt passed 8 of 102 retry-
  expanded rows. Attempt 2 passed 33 of 33 upstream after schema, tool and
  fixture legibility changes, but 32 of 33 under the strict verifier because
  one call added empty optional arrays. Attempt 3 on the security-fixed tree
  passed 30 of 35 upstream after two malformed-then-corrected provenance IDs
  and one omitted comparison. Receipt-v2 attempt 4 at 01:53 on 31 August 2026
  bound stable exact identity and exited zero, but structural validation failed
  and its evaluation was null. Receipt-v2 attempt 5 at 02:13 ran 24 case executions
  from fixture digest
  `ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`.
  It produced 36 rows for 33 expected rows: 30 pass, 6 fail, 0 error, 0 console
  errors and 0 missing. Each of the three provenance trajectories recovered
  after a malformed canonical ID was rejected, but `verify-reports` failed. All
  five attempts failed overall; gate J remains open.
- Attempts 4 and 5 used receipt v2. The model digest matched through `/api/tags` before
  and after evaluation and daemon-reported `/api/ps` afterwards, was stable and
  recorded `executionBound: true`. This is post-run daemon evidence, not
  cryptographic proof for an individual response. The JSON report SHA-256 was
  `4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb`; the HTML
  report SHA-256 was
  `3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.
- Local inventory calls reject redirects, require exact matching `name` and
  `model` fields and reject `remote_model` or `remote_host` markers before and
  after evaluation. An Ollama-labelled cloud proxy therefore requires the
  explicit remote-provider path and approval. Privileged daemon control, tag
  changes between observations and a previously loaded model remain outside the
  receipt boundary.
- Protected CI, Pages, final tag and release, current-candidate supported-host
  capture, a passing fixed-model result and refreshed manual screen-reader
  evidence have not yet been completed.

## Observed pre-federation verification checkpoints

The results below apply to the exact pre-federation revisions they name. They
do not satisfy an A–M gate for `0.3.0-rc.1`.

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
  retains full outputs. At that historical pre-federation checkpoint, no model-
  backed selection test had been run; three later local candidate attempts are
  recorded above and all failed the strict gate.
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
| Must 1–2 | Complete locally for the candidate: recorded ownership assurance, preserved baseline, item-level rights and five source-lock registry entries. The historical release had four. |
| Must 3 | Complete: 69 locked GOV.UK records plus 11 reviewed companion records. |
| Must 4 | Complete locally for the candidate: minimal profile, 31 schemas, authored/generated validators and deterministic builders. The historical release had 20 schemas. |
| Must 5 | Complete for the bounded tested journeys: automated Chrome and Edge cover search, record, provenance, analytical index, Trace and comparison; a manual Safari and VoiceOver journey completed with two retained limitations and no WCAG claim. |
| Must 6–8 | Complete in the published release: five tools include the original three query tools and two evidence-presentation tools. |
| Must 9 | Complete: one action controller, deterministic page/tool output and display-digest parity. |
| Must 10–11 | Complete: authoritative human links and visible access, rights, assertion, observation and limitation fields. |
| Must 12 | Complete: source, record, bundle, receipt, Trace, federation and raw-file digests/checksums. |
| Must 13 | Implemented locally for the candidate: the initial artefacts, lazy manifest, exact ordered per-source population/display contracts and separate 80 reviewed plus 58,655-raw, 3-quarantined and 58,652-searchable federated boundaries fail closed. Five exact source-lock registry entries validate, the post-remediation local suite passes and immutable fixed-tree scan `040ad945-3723-4aef-9c03-1bb552630deb` reports zero findings. Historical release assurance remains bound to its four artefact families and four locks. |
| Must 14 | Part complete: tamper, input, URL, inert-text, missing-licence and no-match tests pass; dedicated stale and conflicting-assertion fixtures remain. |
| Must 15 | Complete: CSP, no storage and no external runtime provider request are enforced and tested. |
| Must 16 | Complete: instrumented lifecycle tests and installed Chrome and Edge contract checks passed; `Codex In-app Browser` called all five tools on the historical tagged release; and corrected deployed main passed five public Chrome DevTools MCP calls with zero console errors. Chrome's native WebMCP panel recorded five `Completed` calls, a structured rejection for `limit: 21` and presentation parity. Five local model attempts are retained but all failed; attempt 4 failed structural validation and attempt 5 demonstrated fail-closed malformed-ID recovery but failed strict verification. A passing result and Microsoft Explorer browser execution remain under Should 11. |
| Must 17 | Complete: MIT licence and notices are published; PR #9 and the exact tagged deployment remain recorded; PR #12 and Pages run `33323152751` bind corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` separately. |
| Must 18 | Part complete: submission copy, storyboard, five genuine interaction clips and their consolidated receipt, the labelled supported-host receipt visualisation, manual VoiceOver evidence and its non-continuous screenshot sequence, release hashes, tag `v0.2.0-rc.1`, a captioned 142.920-second local review video with transcript and build receipt, its technical decode/frame/caption review, and a historical read-only Devpost-state review are complete. Owner synthetic-voice, privacy, branding and final-playback review, public YouTube upload and authorised submission remain open; this checkpoint makes no registration, submission or upload claim. |
| Federation 1–10 | Implemented locally for `0.3.0-rc.1`: exact final-candidate local verification passes research 4 of 4, build/data validation, frozen lexical quality, 30 Chrome, 30 Edge, six model-free real-Chrome smoke calls, 193 unit tests, zero npm-audit vulnerabilities across 162 dependencies and `git diff --check`. The earlier 144-, 173-, 182-, 187- and 190-unit results and 29-test browser runs remain historical checkpoints only. Exact-range scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` retained one Low source-substitution finding, now remediated with code-reviewed pins; immutable fixed-tree scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 items against `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings. Five fixed-model attempts are retained and all failed; attempt 4 retained a null evaluation after structural validation failed and attempt 5 failed `verify-reports`. Manual current-candidate accessibility, supported-host evidence, protected integration, exact deployment and submission-media refresh remain pending. |

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
  panel evidence. Five exact local fixed-model attempts are retained with all
  failures and variance, but none passed. Attempts 4 and 5 exercised receipt v2 with
  stable pre/post `/api/tags`, daemon-reported post-run `/api/ps` identity and
  `executionBound: true`, without claiming cryptographic per-response proof;
  Microsoft Explorer remains. The exact
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
- Could 8: at this working-tree checkpoint the bounded 10-entry estate
  descriptor has 6 searchable and 4 non-searchable admissions. The four
  source-snapshot admissions are
  local payload federation; their release status remains separate from the 2
  reviewed deep-evidence collections.

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

The separate `v0.2.0-rc.2` checkpoint freezes pre-federation product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935`. The working `0.3.0-rc.1`
candidate has no inherited release assurance: the earlier Pages, host,
accessibility and video receipts cover only the revisions they name.

Supported-host discovery and calls were observed for the historical tagged
deployment in `Codex In-app Browser`. Five genuine public-page interaction
clips and their release/action/duration/hash receipt are complete, and the
guarded pipeline rejects preview substitutions, unrelated VoiceOver media and
receipt drift. The manual Safari and VoiceOver journey, Caption Panel frame
sequence and exact media/time binding are complete. The guarded build produced
the captioned, 142.920-second local review MP4, transcript and build receipt.
The latest read-only Devpost check at `2026-08-30T17:57:48Z` found project
`1406973` still `Untitled`, blank and `submission_pre_draft`. The remaining
official compliance boundary is: close at 1:00 pm PDT on 3 September 2026; use
a public repository with a visibly detectable open-source licence; provide a
public YouTube video under three minutes with audio; make the exact live project
accessible in ChatGPT's in-app browser or Chrome with WebMCP enabled; and freeze
the repository, live project and submission after close. These requirements do
not establish registration, submission or upload. The remaining sequence is
now:

1. Finish the focused manual accessibility evidence; immutable fixed-tree scan
   `040ad945-3723-4aef-9c03-1bb552630deb` has completed against exact commit
   `9c6ed7d9a21574972ee564b333cbc49983058554`, while the deterministic, browser
   and smoke gates are recorded separately from the remaining observations.
2. Capture current-candidate supported-host evidence and refine the model-
   legibility fixture only through transparent machine identifiers; rerun the
   same fixed local model while retaining the five failed attempts and without
   inheriting pre-federation results.
3. Revalidate pull request 16's portable-gzip correction in protected Linux CI,
   complete A–M release binding, then verify the exact deployed bytes before
   describing the expanded experience as live.
4. Rebuild and review the demonstration video against that exact candidate,
   then complete owner privacy, branding, voice and caption decisions.
5. Upload only an approved exact video digest, complete the Devpost form and
   submit only with separate authority, retaining the returned receipt.
