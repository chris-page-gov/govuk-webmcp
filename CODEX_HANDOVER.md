# Codex handover

## Current outcome

Protected-main product commit `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`
is released as annotated tag `v0.3.0-rc.1`; tag object
`8278c580df4767491ef0808516dd90cc3423cb9d` peels to that commit. Pull request
16 passed run `33356087333`, protected `main` passed run `33356272534`, and
exact-commit Pages run `33356452048` deployed the same product commit at:

- <https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.3.0-rc.1>
- <https://chris-page-gov.github.io/govuk-webmcp/>

All 1,879 regular files in Pages artefact `9745316971`, totalling 128,548,215
bytes, returned HTTP 200 and matched the public deployment byte for byte. The
downloaded artefact tar SHA-256 is
`872384696f587572d794de3a4e07485aee7d2816598c86546ed178cd5aa03bf2` and
the canonical live comparison manifest SHA-256 is
`4b2336a8927d34951c94008703dec27ed79f1ad87a318526c6807eeaa4bc0183`.

The exact-release supported-host capture is complete. Codex In-app Browser
(Browser plugin `26.825.32147`) discovered and successfully executed all five
WebMCP tools, rejected an unrelated `personalContext` field and produced a
comparison whose canonical digest matched the displayed digest. Its media
scene is a labelled receipt reconstruction, not a host-owned recording; no
model selected a tool and no model provider was called. Five genuine silent
public-page clips are also captured, with agent privacy and branding review
passed and human publication review still pending.

The fresh nine-step Safari 26.5.2 and VoiceOver 10 Caption Panel journey is
paused pending macOS unlock. It is not yet a completed current-release
accessibility observation. The final demonstration video, technical review,
owner playback and publication approval are also in progress. Nothing in this
handover claims a refreshed public video, public YouTube upload or Devpost
submission.

The frozen `v0.2.0-rc.2` pre-federation baseline remains at product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935`; do not move or rewrite it. Earlier
`v0.2.0-rc.1`, corrected-main, accessibility, host and video observations remain
historical evidence for their named commits only. No `gis-ai-go` or OKF source
repository was changed.

## Released `0.3.0-rc.1` federation handover

The release implements a new federated source-snapshot discovery tier. A pre-remediation
checkpoint passed focused local data, runtime, schema, federation, Chrome,
Microsoft Edge and model-free smoke checks, the complete 144-test unit suite
and the fail-each-source browser matrix in both engines. Seven initial Low
security findings were remediated. Sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and found one
further High-confidence Low URL-boundary bypass, which was fixed after the
scanned snapshot. The exact research, production build/data, frozen lexical-
quality, installed-Chrome, installed-Microsoft-Edge and authorised model-free
smoke gates now pass where recorded. The full unit command passed 173 of 173
before the latest three engineering remediations. Immutable scan
`4ab29c3e-0a96-4596-b930-5eccb9b63ebc` subsequently completed 50 of 50 review
items, dynamically reproduced three evidence-integrity or availability defects
and classified zero as reportable vulnerabilities under attack-path policy.
All three defects were remediated nevertheless. The exact post-
remediation research, build/data, unit, frozen-quality, Chrome, Microsoft Edge,
model-free real-Chrome smoke, dependency-audit and diff-integrity gates now
pass as recorded below. Immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 review items against
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
Pull request 16's first Linux run `33354712509` then found that host
recompression did not reproduce the reviewed gzip representation. A first
correction normalised RFC 1952 operating-system byte 9, but rerun `33355108429`
proved that Linux and macOS zlib also emitted different valid DEFLATE streams.
The final correction therefore preserves the exact reviewed stored gzip after
its byte length and SHA-256 pass, boundedly decompresses it to validate the
decoded source length and SHA-256, and cross-binds those decoded bytes to the
freshly fetched source byte for byte during import. The standalone builder
independently enforces the stored and decoded bindings; it does not require a
host compressor to reproduce them. Protected run `33355787295` cleared the
gzip build gate, then exposed a later unit-test
liveness defect: Node could end an isolated pending import before an
unreferenced `AbortSignal.timeout` fired. The import-wide deadline now uses an
explicitly referenced timer, cleared in `finally`; the focused regression
passed on macOS and Linux. Pull-request validation run `33356087333` and
protected-main run `33356272534` subsequently passed, before Pages run
`33356452048` deployed and revalidated the exact release commit.

The intended, closed population is:

- 80 reviewed deep-evidence records with existing item-level receipts;
- 9,757 A Life in the UK source-snapshot records, including 293 service
  families;
- 5,097 ONS metadata source-snapshot records;
- 41,598 UK Government APIs source-snapshot records; and
- 2,203 HM Land Registry public-estate metadata source rows, of which 2,200 are
  searchable.

The four federated collections contain 58,655 locked raw rows before cross-
source deduplication. Exactly three standalone Land Registry legislation rows
are quarantined, leaving 58,652 searchable records. Neither total is a unique-
record count, and no federated record acquires the 80-record tier's item-level
receipt. There is no standalone UK Legislation collection, payload, index or
runtime request. The searchable projection contains zero `legislation.gov.uk`
result links. The locked source files retain 28 source-authored cross-reference
strings as inert, untrusted metadata: 6 in A Life in the UK, 3 in ONS, 2 in UK
Government APIs and 17 in Land Registry. Do not claim literal source-byte
exclusion.

The four populations are now bound by one exact ordered executable contract,
not only by their aggregate: source/quarantined/searchable counts are
9,757/0/9,757 for A Life in the UK, 5,097/0/5,097 for ONS,
41,598/0/41,598 for UK Government APIs and 2,203/3/2,200 for HM Land Registry.
The builder and runtime also validate each admission's title, ordered
supplementary counts, completeness statement and first limitation before the
human display uses them. A co-digested per-source redistribution or
contradictory display claim must fail closed.

The released files contain 6 searchable and 4 non-searchable corpus
admissions, 5 source-lock registry entries and 31 closed JSON Schemas, while
keeping the reviewed and federated evidence tiers distinct. These totals are
bound to product commit `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. The
stable federated reproducibility boundary is 73 versioned,
reviewed gzip artefacts totalling 13,021,675 bytes. Exact stored lengths and
SHA-256 values bind their reviewed representations; bounded decoded lengths and
SHA-256 values bind their source meaning. Import preserves those reviewed bytes
only after exact decoded-to-fetched byte matching. The deterministic builder
expands those inputs into 1,853 shard files — 120 record shards and 1,733
postings shards — plus the manifest and checksum sidecar: 1,855 ignored
generated files and 127,747,020 bytes in total. The plane is copied to `dist`;
do not commit it.

UK Government APIs records use the source-authored, collection-unique
`concept_id` as their source-native identity. All 41,598 admitted rows have a
unique value. Endpoint URLs can be shared and therefore remain evidence links,
not surrogate record IDs.

Federated producer text cannot promote itself to official status. Links use
conservative producer-declared roles, and assertions use `producer-declared`
unless a narrowly defined normalisation is performed independently. Treat
every federated result as source-authored, untrusted metadata.

The slice retains the five fixed WebMCP tools and extends the human search,
exact-record and provenance paths with evidence-tier, collection, snapshot,
source-link role and limitation fields. Human controls and page tools use the
same controller and common deterministic result. A federated-source failure is
visible and isolated; unaffected sources and the 80-record tier continue
without an unverified fallback.

The judge-facing proposition is precise: OKF publishes governed,
progressively retrievable evidence; WebMCP lets a citizen-selected AI invoke
bounded page-scoped actions; and the static page hosts no model and accepts no
identity, profile or general personal-context object. A citizen-selected AI can
use context it already holds to decide what bounded question to ask without
passing that whole context into the page tool. A remote model provider may still
receive prompts, tool metadata, arguments and results. Reduced public cost,
improved privacy, better questions and improved answer quality remain
hypotheses for controlled evaluation, not implementation claims.

The current 1–10 delivery sequence is mapped in
[`docs/competition/implementation-plan.md`](docs/competition/implementation-plan.md),
and the A–M release gates are defined in
[`docs/competition/okf-federated-personal-agent-evaluation-plan.md`](docs/competition/okf-federated-personal-agent-evaluation-plan.md).
Complete the remaining matrix before updating any unobserved gate.

The frozen lexical quality gate is implemented as
`npm run okf-federation:quality:prepared` and is required in CI and Pages after
the complete test suite. It checks authored nDCG@10 and Recall@20 thresholds,
cold/warm parity, a canonical result digest and the prohibited legislation
request. The exact tree before the latest three remediations passed locally at
mean nDCG@10 `0.984698009`
and Recall@20 `1`, with cold/warm parity and legislation absent or rejected.
This is not model-quality or corpus-wide-recall evidence. The same gate passed
through the protected CI and Pages release path.

## Source and generated bindings

The first table records the frozen pre-federation bindings. The second records
the exact `v0.3.0-rc.1` release inputs and generated output validated through
the protected release path.

| Binding | SHA-256 or immutable reference |
| --- | --- |
| Preserved research baseline | `4c85db7` |
| Frozen pre-federation product commit | `35fcedd39ed955278d3975a6dd80692fc6e32935` (`v0.2.0-rc.2`) |
| `okf-govuk-content` producer commit | `94f5020cb2c7512a79c2353ee48743ad733a132c` |
| Producer Git blob | `e7f3b6a0d1efa6cb336b1b50a69228de26216aa5` |
| Imported 69-record GOV.UK source | `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc` |
| Curated 11-record source | `f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794` |
| Authored answer pack | `ea00549f465ef4d7fc65c9e5853ee2b78ab6d9823d25e9268516d7b955d70f1f` |
| Authored corpus admissions | `dc798de2d33fc9434e1dce730bb945c8fd7b6c01466cea02728c9aadf292edd0` |
| Generated catalogue bundle | `20593105f6e34d5072f566b4f7b98cab143c4333c56bbabfca831b935237945c` |
| Evidence Trace collection | `a6c38dcc1cc8defbb38a1541e5964159a1e724aa989cb362187111a801dc0a3b` |
| Federation manifest | `3b1301d55ebd232e6d4b89226ddb9cc92ee4ae0878fc5b6ac48a88594ed06d71` |

Every standalone builder validates the five source-lock ID/path/count pairs and
consumes the regular-file bytes returned by that validator.
Generated JSON and checksum sidecars are deterministic.

| Release binding | Value |
| --- | --- |
| Source-lock registry | 5 entries |
| Federated source plane | 73 versioned reviewed gzip artefacts; 13,021,675 stored bytes; exact stored and bounded decoded digest bindings; importer decoded-to-fetched byte cross-binding |
| Federation lock digest | Cross-bound and validated in the protected release path |
| Generated search plane | 1,853 shards (120 record + 1,733 postings) and 2 root files; 1,855 files and 127,747,020 bytes in total; copied into `dist` |
| Generated manifest digest | Cross-bound and validated in the protected release path |
| Contract set | 31 closed JSON Schemas |

## Implemented runtime boundary

- The static same-origin application calls no official API at runtime.
- The human interface becomes usable after catalogue, receipts, Evidence Trace
  and federation validation and does not wait for WebMCP registration.
- Human search and WebMCP discovery return the same deterministic reviewed or
  federated result shape from one action controller.
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
- Physical shard work is bounded independently of logical callers: 4 active,
  32 queued and 36 distinct in-flight files, with the queue included in each
  file's 3-second deadline and slots retained until actual loader settlement.
- Source-derived text remains untrusted and is rendered as inert text.
- Reviewed authoritative links and federated producer-declared links retain
  their distinct roles. Federated exact-record source authority is “Not
  independently established”, recorded destination hostnames are visible, and
  assertion labels, observation dates, access, rights and limitations remain
  visible. No combined trust score is generated.
- No query, account, cookie, analytics, persistent app storage, provider call,
  canonical-data mutation or external state change is introduced.

This is page-scoped WebMCP progressive enhancement, not a durable MCP gateway,
provider integration or service-operation layer.

## Candidate assurance observed locally

This table is the last complete pre-remediation checkpoint; it is not a result
for the exact current tree.

| Check | Result |
| --- | --- |
| Production build | passed |
| Deterministic data double-build | 9 of 9 passed |
| Focused runtime and public-schema tests | 21 of 21 passed |
| Focused federation tests | 15 of 15 passed after fixing the extra-searchable-collection fail-closed gap |
| Installed Google Chrome Playwright suite | 29 of 29 passed, including all four explicit unavailable-source cases |
| Model-free WebMCP smoke | 6 of 6 calls passed |
| Complete unit rerun | 144 of 144 passed in 174.5 seconds |
| Installed Microsoft Edge Playwright suite | 29 of 29 passed, including all four explicit unavailable-source cases, in a loopback-only run after the expected sandbox socket restriction |

Seven initial Low findings were remediated after this checkpoint. Sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and reported one
further High-confidence Low trailing-dot and secondary legislation-URL bypass
(`csf_a2d9e030fda789ecd1cb0e41`). Generator and runtime validation fixed it
after the scanned snapshot. A focused security batch passed 119 of 119, then
the affected post-fix subset passed 23 of 23. The sealed scan reported no other
open reportable candidate, but its mechanically recorded coverage is partial
and includes stale-pending rows. Fresh exact-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` later reviewed 55 of 55 items with zero
reportable findings.
The exact tree before the latest three remediations passed 173 of 173 under
`npm run test:unit:prepared` in `17128.154916 ms`. Neither the checkpoint nor
the focused checks are
protected-main CI, Pages, supported-host, release-tag or Devpost evidence.

The fixed-model gate has been exercised but has not passed. All five local
attempts used Chrome 152, `webmcp-evals` 0.0.4, eight cases, three runs per case
and the exact loopback-only `ollama:gpt-oss:20b` inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. The pre-legibility attempt passed 8 of 102 retry-
expanded rows. After schema, tool-description and fixture legibility changes,
attempt 2 passed 33 of 33 upstream rows but the strict verifier accepted 32 of
33 because one call added empty optional arrays. Attempt 3 on the security-
fixed tree passed 30 of 35 upstream rows after two malformed-then-corrected
provenance IDs and one omitted comparison. Receipt-v2 attempt 4 at 01:53 on 31
August 2026 bound stable exact model identity and exited zero, but structural
validation failed and its evaluation was null. Receipt-v2 attempt 5 at 02:13 ran 24
case executions from fixture digest
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`.
It reported 36 rows for 33 expected rows, including 3 additional retries: 30
passed, 6 failed, and none errored, were missing or produced console errors.
All three provenance trajectories recovered with a correct successful call
after first supplying a malformed canonical ID. Fail-closed input validation
and recovery were observed, but `verify-reports` failed. Preserve all five
failures and their variance; do not call this a model-backed pass or close gate
J.

The same pre-latest-remediation tree separately passed the research pack 4 of 4, the
production build and generated-data validation, and the frozen lexical gate
with mean nDCG@10 `0.984698009`, Recall@20 `1`, identical cold/warm results and
legislation absent or rejected. Installed Chrome and Microsoft Edge each passed
29 of 29 browser tests. The first model-free smoke attempt failed at the
expected sandbox `EPERM` loopback boundary; the authorised rerun outside that
socket sandbox passed 6 of 6. `npm run test:unit:prepared` passed 173 of 173 in
`17128.154916 ms`.

The later scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` completed 50 of 50
review items and dynamically reproduced three candidates: mutable local Ollama
identity evidence, aggregate-only per-source population binding and
cancellation-driven physical shard-work amplification. Attack-path review
classified zero as reportable vulnerabilities because the paths require
privileged loopback model-service control, repository/build or same-origin
write authority, or cause bounded self-availability impact. Preserve that
security disposition, but do not discard the engineering defects.

The candidate remediations are:

- the ordered per-source population and display contracts described above;
- at most 4 active physical shard loads, 32 queued loads and 36 distinct in-
  flight files, with the 3-second file deadline beginning before queueing and a
  slot held until the underlying loader actually settles; queue or immediate
  pre-loader deadline expiry returns the scheduler-busy result rather than a
  source-corruption diagnosis; and
- local-model receipt v2, requiring the selected digest through `/api/tags`
  both before and after a run and the daemon-reported loaded digest through
  `/api/ps` afterwards before an otherwise-successful local run can pass.

Attempts 4 and 5 exercised receipt v2: pre-run, post-run and loaded-model observations
were stable at the full digest above and the receipt recorded
`executionBound: true`. Its ignored private reports are represented in tracked
documentation by JSON SHA-256
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and HTML
SHA-256 `3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.

If four non-cooperative physical loaders never settle, they can retain all four
slots indefinitely and make federated search unavailable; the runtime fails
closed rather than admitting more work. The v2 model identity is daemon-
reported post-run evidence, not cryptographic per-response proof, and
privileged local account or model-service control, tag changes between
observations and a previously loaded model remain outside its trust boundary.
Inventory redirects, incomplete `name`/`model` identities and `remote_model` or
`remote_host` markers fail before evaluation, so an Ollama-labelled cloud proxy
cannot use the local path without explicit remote-provider approval. The
historical failed model attempts predate v2 and remain failures.

## Exact post-remediation local verification

| Check | Observed result |
| --- | --- |
| Research pack | 4 of 4 passed |
| Production build and generated-data validation | Passed: 80 reviewed records, 80 receipts, 58,655 raw federated rows, 3 quarantined rows, 58,652 searchable rows, 120 record shards and 1,733 postings shards |
| Focused combined/public-search regressions | 11 of 11 passed |
| Prepared unit suite | 194 of 194 passed |
| Frozen retrieval-quality gate | Mean nDCG@10 `0.984698009`; Recall@20 `1`; identical cold/warm results; legislation collection absent and legislation request rejected |
| Installed Google Chrome | 30 of 30 browser tests passed |
| Installed Microsoft Edge | 30 of 30 browser tests passed |
| Model-free WebMCP smoke | 6 of 6 calls passed in real Chrome |
| Dependency audit | Zero vulnerabilities across 162 total dependencies |
| Patch integrity | `git diff --check` clean |

Combined and public WebMCP search now preserve `federated_runtime_busy` rather
than translating that scheduler state into source unavailable. The human live
region distinguishes rejected input, a busy runtime and other failures. The
Chrome and Edge reruns each exited zero with 30 of 30 tests passed.

The final-candidate demonstration preflight correctly failed closed because no
deployed commit and no explicit overwrite approval were supplied. It did not
start live capture and must not be described as live-capture evidence.

Immutable exact-range scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a`
completed 55 of 55 review items and reported one High-confidence,
Low-severity source-substitution finding (`csf_050a3c08c471d3176e0640c3`).
The normal build trusted a source digest supplied by the same mutable registry.
All five admitted sources now have separately code-reviewed imported SHA-256
pins, the standalone federated-search builder checks the reviewed federation-
lock bytes before parsing, and same-count co-digested source/registry mutation
tests fail closed. Source validation, the production build and 194 of 194
prepared unit tests pass. Fresh immutable exact-range scan
`040ad945-3723-4aef-9c03-1bb552630deb` then completed 55 of 55 review items
against fixed candidate `9c6ed7d9a21574972ee564b333cbc49983058554`
with zero reportable findings. These were local candidate checkpoints.
Pull-request validation `33356087333`, protected-main validation `33356272534`,
Pages run `33356452048`, the complete live-byte comparison and exact-release
supported-host capture now provide their respective release evidence. Fresh
manual accessibility evidence, a passing model-backed evaluation, the
refreshed video and submission remain open.

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
| Post-deployment evidence unit suite | 100 of 100 passed, including post-deployment provenance, negative demonstration-media, VoiceOver and screenshot-sequence gates |
| Post-deployment evidence Chrome suite | 20 of 20 passed after an authorised local-loopback exception |
| Post-deployment evidence Edge suite | 20 of 20 passed after an authorised local-loopback exception |
| Evidence integration | pull request 13 merged as `5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`; exact-main validation run `33327860583` passed |
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

Post-tag evidence closure used these exact checks:

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

The historical pre-federation evidence set also contains the fail-closed demonstration
pipeline, five genuine public-page interaction clips in ignored local output,
their consolidated receipt, and a clearly labelled supported-host receipt
visualisation. The visualisation is not host-owned video or a Site tools
capture. Its manual Safari and VoiceOver journey is retained separately as a
completed-with-limitations historical evidence record. Its nine manually reviewed,
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
evaluation fixture now contains eight cases, including context minimisation and
an unrelated no-call case. Five local attempts used Chrome 152,
`webmcp-evals` 0.0.4, three runs per case and exact model
`ollama:gpt-oss:20b`, whose local inventory digest was
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
Inference stayed on the loopback model endpoint; the first three attempts used
no remote credential. The initial pre-legibility report passed 8 of 102 retry-expanded
rows. After schema, tool-description and fixture legibility changes, attempt 2
passed 33 of 33 upstream rows but failed the strict verifier at 32 of 33 because
one call added empty optional arrays. Attempt 3, on the security-fixed tree,
passed 30 of 35 upstream rows after two malformed-then-corrected provenance IDs
and one omitted comparison. Receipt-v2 attempt 4 exited zero with stable bound
identity but retained a null evaluation after structural validation failed.
Receipt-v2 attempt 5 reported 30 pass and 6 fail
across 36 rows for 33 expected rows. Its 3 retries recovered from rejected
malformed provenance IDs, with zero error, console-error or missing counts, but
`verify-reports` failed. Browser evaluation requires
`WEBMCP_EVAL_PRESENTATION_APPROVED=1`; the wrapper rejects any typed upstream
console error or `pageerror`. All five receipts are failures and are retained
as variance evidence; no model-backed pass is claimed.

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

## Post-remediation security state

Eight Low findings have implemented remediations: superlinear postings work
(`csf_d6045d8bfb6836f0a274850d`), Land Registry row-policy enforcement
(`csf_628dded1ed9a62431cf1f121`), mutable-source revision claims
(`csf_a685f5df80a811659b866345`), partial-source isolation
(`csf_e9078180b75895a09a282bda`), producer trust self-promotion
(`csf_13ddf953dc16e399c8c04f03`), the `constructor` token crash
(`csf_5b3f067459df708770da0536`), concurrent uncached shard work
(`csf_afca5f27e901f0db4b730cc7`) and the trailing-dot and secondary legislation-
URL bypass (`csf_a2d9e030fda789ecd1cb0e41`). Sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven and found the
eighth with High confidence and Low severity; the last fix postdates that
snapshot. The scan recorded no other open reportable candidate, but its
coverage includes mechanically partial and stale-pending rows. A focused
security batch passed 119 of 119 and the affected post-fix subset passed 23 of
23. Executable URL validation rejects explicit ports and any apex, trailing-dot
or subdomain `legislation.gov.uk` result link, including secondary URLs. Same-
origin response bodies are streamed
under the fixed byte cap with strict declared-length, missing-body and empty-
body checks. Generated-plane cleanup has bounded retries for Finder metadata;
static copying filters `.DS_Store`, and `dist` is cleaned before compilation.
The complete fixed-candidate scan is
`040ad945-3723-4aef-9c03-1bb552630deb`; it reviewed 55 of 55 items and reported
zero findings. Retain the sealed pre-remediation scan and its Low finding as
evidence; do not rewrite it as a no-finding result. Protected CI and exact
deployed-byte binding subsequently passed for `v0.3.0-rc.1` as recorded at the
start of this handover.

## Residual limitations

- The released `v0.3.0-rc.1` federation has 58,655 raw rows and
  produces 58,652 searchable records after three standalone Land Registry
  legislation rows are quarantined. They are four source-snapshot populations
  rather than unique government entities, reviewed item-level receipts or a
  claim of comprehensive current coverage. Exact deployment binding is
  complete; model-backed, fresh accessibility, refreshed-video and submission
  evidence remain open.
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
- The historical pre-federation Safari and VoiceOver observation completed with
  two retained limitations: a heading-rotor selection was not retained, and the
  Caption Panel did not prove the automatic spoken wording of the live search
  status. VoiceOver audio was not captured. A fresh exact-release nine-step
  recapture is paused pending macOS unlock and must not yet be described as
  complete. Neither observation establishes WCAG conformance.
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
  Five exact local-model attempts are retained and show improved legibility,
  fail-closed recovery, failures and variance, but none passed the strict gate.
  Explorer remains
  unrun; a remote provider would change the data boundary.
- The pre-federation demonstration exists only as a local review build. The
  exact-release final demonstration, synthetic-voice publication, privacy,
  branding and final playback reviews remain pending. A
  historical read-only record showed project `1406973` as `Untitled`, blank and
  `submission_pre_draft`; this checkpoint makes no registration, submission or
  public YouTube-upload claim.

Official compliance requirements checked for handover are: the deadline is
1:00 pm PDT on 3 September 2026; the source repository must be public with a
visibly detectable open-source licence; the public YouTube demonstration must
be under three minutes and include audio; and the exact live project must be
accessible in ChatGPT's in-app browser or Chrome with WebMCP enabled. Freeze the
repository, live project and submission after the close.

## Recommended next step

Resume the exact-release nine-step Safari and VoiceOver Caption Panel journey
when the Mac is unlocked, complete and hash-bind the observations, then turn
the Caption Panel and VoiceOver off. Build the final demonstration from the
exact-release clips, complete technical and owner playback, privacy, branding,
voice and caption review, and verify any public video while signed out before
the final Devpost compliance review.

Do not move the `v0.3.0-rc.1` tag or reuse pre-federation accessibility, host or
video evidence as proof of the expanded release. Public YouTube upload and
Devpost submission remain separate explicit actions.
