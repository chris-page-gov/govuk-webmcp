# Project status and hard gates

**Status:** version `0.3.0-rc.1` is an in-progress federated-discovery
candidate. A pre-remediation checkpoint passed the local production build,
complete 144-test unit suite and 29-test Chrome and Microsoft Edge acceptance
suites. Seven initial Low security findings were remediated, then sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and found one
further High-confidence Low URL-boundary bypass. That eighth issue was fixed
after the scanned snapshot. The exact research, build/data, lexical-quality,
Chrome, Microsoft Edge and authorised model-free smoke gates now pass where
recorded. `npm run test:unit:prepared` also passed 173 of 173 in
`17128.154916 ms` before the latest three engineering remediations. Immutable
scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` then completed 50 of 50 review
items, dynamically reproduced three evidence-integrity or availability defects
and classified zero as reportable vulnerabilities after attack-path analysis.
All three have working-tree remediations nevertheless. The exact post-
remediation research, build/data, unit, frozen-quality, Chrome, Microsoft Edge,
model-free real-Chrome smoke, dependency-audit and diff-integrity gates now
pass as recorded below. Immutable exact-range scan
`2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` then completed all 55 review items and
reported one High-confidence, Low-severity provenance-integrity defect
(`csf_050a3c08c471d3176e0640c3`): the normal build accepted a same-count source
and registry substitution when both were re-digested together. All five
admitted source files are now bound to separately code-reviewed imported
SHA-256 values, and the federated-search builder independently requires the
reviewed federation-lock byte pin. The new mutation regressions, production
build, source validation and 194-test prepared unit suite pass. A fresh
immutable exact-range scan, `040ad945-3723-4aef-9c03-1bb552630deb`, then
completed all 55 review items against fixed candidate
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
Pull request 16 then exposed a cross-platform reproducibility defect in Linux
validation run `33354712509`. A first correction normalised RFC 1952 operating-
system byte 9, but rerun `33355108429` proved that the Linux and macOS zlib
implementations also produced different valid DEFLATE streams. The header-only
explanation and correction were therefore insufficient. The final candidate
does not reproduce reviewed gzip bytes with the current host compressor: it
preserves the exact reviewed stored representation after validating its byte
length and SHA-256, boundedly decompresses it and validates the decoded source
length and SHA-256, and requires the importer to match those decoded bytes to
the freshly fetched source byte for byte. The builder independently enforces
the stored and decoded bindings. Protected CI has not yet revalidated this
final correction. This is not yet a protected-main integration, Pages
deployment, release or submission. The frozen
pre-federation baseline is annotated tag
`v0.2.0-rc.2` at product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935`; its public pre-release is retained
and must not be moved or rewritten. GitHub's release API does not currently
mark that pre-release platform-immutable.

Corrected main commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f` is the current public Pages
deployment from run `33323152751`. Pull request 12 integrated the optional-
execution-options correction and pinned assurance harness through protected
`main`. Competition registration is complete. Devpost project `1406973`
remains `Untitled`, blank and `submission_pre_draft`, with no video URL,
publication timestamp or submission timestamp at the read-only
`2026-08-30T17:57:48Z` observation.

Pull request 13 subsequently admitted the corrected public-host, video-review
and read-only Devpost evidence plus its tests and lockstep documentation as
repository commit `5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`. Exact-main
validation run `33327860583` passed. That evidence-only integration did not
dispatch Pages or change the public application bytes, so the deployment
identity above remains `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`.

The tagged `v0.2.0-rc.1` release at
`9235ee5db4df637bdb2a12e87449e871614afe68` and its earlier verification remain
historical evidence; the tag has not been moved to the corrected deployment.

Version `0.2.0-rc.2` is the repository checkpoint that freezes the corrected
host-compatibility implementation and subsequently integrated evidence before
the multi-corpus OKF federation work. It does not rewrite `v0.2.0-rc.1` or
claim a new Pages product deployment; the deployed application identity remains
the separately recorded `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`.

## In-progress `0.3.0-rc.1` federated boundary

The current working slice extends discovery without weakening the assurance of
the existing reviewed catalogue:

| Evidence tier | Declared population | Boundary |
| --- | ---: | --- |
| Reviewed deep evidence | 80 records | Existing same-origin records with 80 packaged item-level receipts |
| Federated source snapshot | 58,655 locked raw rows | Four locked, independently republished OKF snapshots with source, snapshot, file-integrity and limitation evidence, but no local item-level receipt; 58,652 rows are searchable and 3 are quarantined |

The raw federated total is exactly 9,757 A Life in the UK rows, including 293
service families; 5,097 ONS metadata rows; 41,598 UK Government APIs rows; and
2,203 HM Land Registry public-estate metadata rows. Exactly three standalone
Land Registry legislation records are quarantined, leaving 2,200 searchable
Land Registry records and 58,652 searchable federated records overall. The raw
sum is before cross-source deduplication and is not a count of unique services,
datasets, APIs, properties or official records. There is no standalone UK
Legislation collection, payload, index or runtime request, and the searchable
projection contains zero `legislation.gov.uk` result links. The locked source
files retain 28 source-authored cross-reference strings as inert, untrusted
metadata—6 in A Life in the UK, 3 in ONS, 2 in UK Government APIs and 17 in
Land Registry—so literal source-byte absence is not claimed.

The federation contract now binds those populations per source rather than only
in aggregate. Its exact ordered source/quarantined/searchable values are
9,757/0/9,757 for A Life in the UK, 5,097/0/5,097 for ONS,
41,598/0/41,598 for UK Government APIs and 2,203/3/2,200 for HM Land Registry.
Executable validation also binds each collection's title, ordered supplementary
counts, completeness statement and first limitation before they can be shown.
A co-digested per-source redistribution or contradictory display claim therefore
fails closed. Source identity is additionally bound outside the mutable
registry: every admitted source digest must match executable release policy
before its bytes are trusted, and the standalone federated-search builder
checks the reviewed federation-lock bytes before parsing them.

The candidate keeps five fixed, page-scoped tools and the complete accessible
human equivalent over one common deterministic result. OKF supplies governed,
progressively retrievable evidence; WebMCP lets a citizen-selected AI invoke
bounded page actions over it. The page hosts no model and its closed schemas
accept no identity, profile or general personal-context object. This does not
establish end-to-end privacy: a remote model provider may receive prompts, tool
metadata, arguments and results, and the static host may observe ordinary or
query-derived asset requests.

The current generated files record 6 searchable and 4 non-searchable corpus
admissions, 5 source-lock registry entries and 31 closed JSON Schemas. These
working-tree totals must be recomputed after the exact-tree remediation rescan;
they are not release-bound counts. The stable reproducibility boundary is 73
versioned, reviewed gzip source artefacts totalling 13,021,675 bytes. Their
exact stored byte lengths and SHA-256 values bind the reviewed representations;
bounded decompression plus decoded lengths and SHA-256 values bind their source
meaning. Import preserves those reviewed bytes only after matching each decoded
payload to the freshly fetched source byte for byte. The deterministic builder
expands those inputs to 1,853 shard files — 120 record shards and 1,733 postings
shards — plus the manifest and checksum sidecar: 1,855 ignored generated files
and 127,747,020 bytes in total. The production build copies that same-origin
plane into `dist`. The federation lock and generated-manifest digests are cross-
bound, but their final candidate values must be recorded after the exact-tree
rescan and deterministic rebuild.
UK Government APIs records use their source-authored, collection-unique
`concept_id`; shared endpoint URLs are not used as record identity.

Federated source labels are deliberately conservative. Producer text cannot
promote a link or assertion to official status: links retain a
producer-declared role, and assertions use `producer-declared` unless the
application independently performs a narrowly defined normalisation. Exact-
record output reports source authority as “Not independently established”, and
human search and record views display the recorded destination hostname.

The A–M acceptance matrix in
[`docs/competition/okf-federated-personal-agent-evaluation-plan.md`](docs/competition/okf-federated-personal-agent-evaluation-plan.md)
controls any later claim about source admission, integrity, progressive
delivery, ranking, producer coverage, evidence parity, partial failure,
context minimisation, safety, model choice, accessibility, cost or release
binding. Cost reduction, privacy improvement, better questions and answer
quality remain testable hypotheses. Only the focused checks recorded below are
observed; their results do not complete the A–M matrix.

The frozen lexical retrieval-quality gate is implemented and required by CI
and Pages after `npm test`. It measures bounded nDCG@10 and Recall@20 cases,
cold/warm determinism and prohibited-legislation behaviour. The exact tree
before the latest three remediations passed locally at mean nDCG@10
`0.984698009` and Recall@20 `1`, with
identical cold/warm results and legislation absent or rejected. This bounded
lexical result does not establish model quality or corpus-wide recall; CI and
Pages release binding remain pending.

## Candidate assurance observed locally

The following is the last complete pre-remediation checkpoint, not a result for
the exact current tree:

- production build: passed;
- deterministic data double-build: 9 of 9 passed;
- focused runtime and public-schema tests: 21 of 21 passed;
- focused federation tests: 15 of 15 passed after fixing the
  extra-searchable-collection fail-closed gap;
- installed Google Chrome Playwright suite: 29 of 29 passed, including one
  explicit unavailable-source case for each of the four federated collections;
- model-free WebMCP smoke: 6 of 6 calls passed;
- complete unit rerun: 144 of 144 passed in 174.5 seconds; and
- installed Microsoft Edge Playwright suite: 29 of 29 passed in a
  loopback-only run after the expected sandbox socket restriction.

The working tree contains remediations for eight earlier Low findings: the seven
initial issues covering postings complexity, Land Registry row admission,
mutable-source revision claims, partial-source isolation, producer trust self-
promotion, prototype-key tokens and concurrent shard work, plus the later
trailing-dot and secondary legislation-URL bypass
(`csf_a2d9e030fda789ecd1cb0e41`). The sealed scan suppressed the first seven and
reported no other open reportable candidate, but its mechanically recorded
coverage is partial and has stale-pending rows, and the eighth fix postdates its
snapshot. A focused security batch passed 119 of 119; the affected post-fix
subset then passed 23 of 23. Executable validation rejects explicit URL ports
and legislation result-link hosts, including trailing-dot forms and secondary
URLs; response bodies are streamed under the fixed byte cap; and generated-
plane cleanup and copying prevent Finder metadata entering the release
artefact. On the exact tree before the latest three remediations, the research
pack passed 4 of 4, the
production build and generated-data validation passed, and the frozen lexical
gate reported mean nDCG@10 `0.984698009`, Recall@20 `1`, identical cold/warm
results and no admitted legislation result or request. Installed Chrome and
Microsoft Edge each passed 29 of 29 browser tests. The first model-free smoke
attempt hit the expected sandbox `EPERM` loopback restriction; the authorised
outside-socket-sandbox rerun passed 6 of 6. `npm run test:unit:prepared` passed
173 of 173 in `17128.154916 ms` on that tree.

The later immutable scan
`4ab29c3e-0a96-4596-b930-5eccb9b63ebc` completed 50 of 50 review items and
dynamically reproduced three further candidates: mutable local-model identity
evidence, aggregate-only per-source population binding and cancellation-driven
physical shard-work amplification. Attack-path review found zero reportable
vulnerabilities because the respective paths require privileged loopback-model
control, repository/build or same-origin write authority, or have bounded self-
availability impact. The issues are still real engineering or evidence-
integrity defects. The working candidate addresses them through exact ordered
per-source and display-contract validation; a physical boundary of 4 active,
32 queued and 36 distinct in-flight shard files; a queue-inclusive 3-second
file deadline with slots held until actual loader settlement; and local-model
receipt v2. Queue expiry and a deadline reached immediately before invocation
return the dedicated scheduler-busy result rather than source-corruption
diagnostics. Up to four non-cooperative loaders can still retain every physical
slot indefinitely, making federated loading unavailable while the runtime fails
closed.

The exact post-remediation local verification now records:

- research pack: 4 of 4 passed;
- production build and generated-data validation: passed for 80 reviewed
  records, 80 receipts, 58,655 raw federated rows, 3 quarantined rows, 58,652
  searchable rows, 120 record shards and 1,733 postings shards;
- focused combined/public-search regressions: 11 of 11 passed;
- prepared unit suite: 194 of 194 passed;
- frozen retrieval quality: mean nDCG@10 `0.984698009`, Recall@20 `1`, identical
  cold/warm results, no legislation collection and the legislation request
  rejected;
- installed Google Chrome and Microsoft Edge: 30 of 30 browser tests passed in
  each;
- model-free WebMCP smoke: 6 of 6 passed in real Chrome;
- `npm audit`: zero vulnerabilities across 162 total dependencies; and
- `git diff --check`: clean.

Combined and public WebMCP search now preserve `federated_runtime_busy` rather
than misclassifying a busy runtime as source unavailable. The human live region
separately identifies rejected input, a busy runtime and other failures. Both
installed-browser reruns exited zero with the 30-of-30 results above.

The final-candidate demonstration preflight correctly failed closed because no
deployed commit and no explicit overwrite approval were supplied. It did not
start live capture, so no live-capture result is claimed.

The first immutable exact-range scan of the candidate completed 55 of 55 review
items and retained one Low source-substitution finding. Its code-reviewed-pin
remediation and focused bypass review pass. The fresh immutable full-range scan
`040ad945-3723-4aef-9c03-1bb552630deb` then completed 55 of 55 review items
against `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
These local results are not protected-main CI, Pages, current supported-host,
focused manual
accessibility, passing model-backed, refreshed-video or release evidence.

Five model-backed attempts are preserved as local variance evidence. They used
Chrome 152, `webmcp-evals` 0.0.4, eight cases, three runs per case and the exact
loopback-only model `ollama:gpt-oss:20b`, whose local inventory digest was
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`;
the first three used no remote credential. The initial pre-legibility fixture
passed 8 of 102 retry-expanded rows. After schema, tool-description and fixture
legibility changes, attempt 2 passed 33 of 33 upstream rows but only 32 of 33
under the strict project verifier because one call added empty optional arrays.
Attempt 3, on the security-fixed tree, passed 30 of 35 upstream rows after two
malformed-then-corrected provenance IDs and one omitted comparison.

Receipt-v2 attempt 4 at 01:53 on 31 August 2026 bound the stable exact model
identity and exited zero, but structural validation failed and its evaluation
was null. Receipt-v2 attempt 5 at 02:13 exercised 24 case executions against fixture digest
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`.
It reported 36 rows for 33 expected rows, including 3 additional retries: 30
passed, 6 failed, none errored or were missing, and no console errors occurred.
All three provenance trajectories first supplied a malformed canonical ID, were
rejected, then recovered with a correct successful call. Fail-closed validation
and recovery were therefore observed, but `verify-reports` failed and this is
not a strict model pass. The private JSON and HTML reports are represented in
tracked documentation only by SHA-256 values
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and
`3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.

Attempts 4 and 5 used receipt v2. They bound the exact selected digest observed through
`/api/tags` before and after the run to the daemon-reported loaded digest from
`/api/ps` afterwards; all three were stable at the digest above and the receipt
recorded `executionBound: true`. The first three failures predate that rule. The
v2 identity is daemon-reported post-run
evidence, not cryptographic proof that each response came from particular model
weights; privileged local-account or model-service control, tag changes between
observations and a previously loaded model remain outside the receipt's trust
boundary. Redirects, incomplete inventory identity and `remote_model` or
`remote_host` markers fail before evaluation, preventing an Ollama-labelled
cloud proxy from using the local path without explicit remote-provider approval.
All five attempts failed overall. Gate J and a strict model-backed pass remain
open.

No protected-main CI, federated Pages deployment, exact live-host binding or
`0.3.0-rc.1` tag is claimed.

## Current release boundary

The public repository is
[`chris-page-gov/govuk-webmcp`](https://github.com/chris-page-gov/govuk-webmcp).
`main` is protected. The retained public pre-release is
[`v0.2.0-rc.1`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1),
at product commit `9235ee5db4df637bdb2a12e87449e871614afe68`.
The later
[`v0.2.0-rc.2`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.2)
repository checkpoint preserves the complete pre-federation main state without
changing that historical product tag.
<https://chris-page-gov.github.io/govuk-webmcp/> now serves corrected main
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`; its `deployment.json` binds
that commit to Pages run `33323152751`. All 20 public files matched Pages
artefact `9735478602` byte for byte. GitHub secret scanning and push protection
are enabled.

The release contains:

- 80 searchable records and 80 evidence receipts;
- four exact authored source locks;
- one digest-bound Evidence Trace over three selected GOV.UK records;
- a 10-entry corpus admission manifest, with two searchable and eight
  non-searchable entries;
- an analytical-index-first human interface with a text-labelled Evidence
  Trace, separate foundation facets and claim comparison without a trust score;
- five imperative WebMCP tools over one deterministic action controller; and
- 20 closed JSON Schemas plus catalogue, receipt, Trace and federation raw-byte
  checksums.

The three catalogue query tools are read-only. The two exploration tools have a
truthfully declared reversible in-memory page-presentation effect and therefore
use `readOnlyHint: false`. Neither class writes storage, changes canonical
metadata, calls a provider or changes external state.

## Assurance observed for the release

- `npm run test:unit`: 58 passed;
- installed Google Chrome Playwright suite: 19 passed;
- installed Microsoft Edge Playwright suite: 19 passed;
- the expanded axe WCAG 2.2 smoke test reported no serious or critical
  violations;
- the 320 CSS-pixel, keyboard, focus/history, forced-colour and reduced-motion
  checks passed;
- the formal diff scan found two low-severity robustness issues; both were
  reproduced, fixed and independently re-reviewed with no bypass found;
- a later immutable 44-item candidate snapshot scan completed with no
  reportable finding; its working-tree-change warning and the reviewed
  post-snapshot fail-closed delta are retained in candidate evidence;
- the shared validator rejected every required-lock omission or redirection and
  every standalone builder failed before source consumption;
- executable validators and closed schemas now agree on canonical IDs, URLs,
  timestamps, filter uniqueness, complete records, receipts and Trace relations;
- `npm audit --json`: zero known vulnerabilities; and
- the 30 August link-health audit recorded 161 of 161 unique admitted official
  URLs as reachable by its bounded HEAD method.

Pull request 9, exact-main validation run `33286750188` and Pages run
`33286771963` all passed for the product commit. The complete 20-file Pages
artefact was fetched from the public site and every live response returned HTTP
200 with byte-for-byte agreement. A signed-out browser journey passed with no
console warning or error and only successful same-origin data requests. The
post-tag evidence records these observations separately from the immutable
product commit.

On 30 August 2026, the supported `Codex In-app Browser` host discovered all
five tools on the historical tagged deployment and returned successful results
from all five. The final `compare_evidence_foundations` call updated the visible
comparison and its canonical result SHA-256 matched the displayed result digest
`3baa3281849855b86e929fd5fad8984580066ac4e275063341c1d9102dc903b1`.
This observation is specific to the named host and time; it does not establish
support in ChatGPT desktop, native Chrome or any other host.

Five silent clips now record genuine interaction with the exact public page for
the analytical index, Evidence Trace, separate facets, comparison and evidence
estate. A consolidated receipt binds every clip to its release URL, required
actions, duration and SHA-256; agent privacy and branding review passed, while
human publication review remains pending. The supported-host scene is explicitly
a receipt visualisation, not a host recording.

A manual Safari 26.5.2 and VoiceOver 10 journey was completed on 30 August 2026
without WebMCP. The retained nine-frame, hash-bound Caption Panel sequence is
visibly labelled as not a continuous recording and is bound to the manual
evidence record and generated VoiceOver scene. The observation completed seven
checks and retained two limitations: a heading-rotor selection was not retained,
and the automatic spoken wording of the live search status was not proven.
VoiceOver speech audio was not captured. The Caption Panel and VoiceOver were
turned off after the journey. This one environment does not establish WCAG
conformance.

The guarded local review video was then built at
`output/govuk-webmcp-demo-2026-08-30.mp4`. It is 142.920 seconds long and has
SHA-256 `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`,
H.264 video, AAC narration and an embedded English caption track. The separate
en-GB captions, transcript and build receipt are retained. Its synthetic local
`Daniel` narration is non-silent, with measured input integrated loudness
-16.11 LUFS and true peak -1.38 dBTP. This is a local review build only: owner
review of the synthetic voice, privacy, branding and final playback remains
pending, and no video has been uploaded or submitted. A later technical review
completed the full video/audio decode, counted 4,284 video frames and matched
all 38 embedded caption cues; it retained one non-fatal subtitle metadata
warning and did not perform audible content-parity or owner publication review.

## Corrected main and independent-host assurance

A direct `chrome-devtools-mcp` 1.8.0 run against the historical tagged release
discovered all five tools, but every attempted execution failed because the host
called the tool callback without an execution-options object and the page
dereferenced `options.signal`. The page's tools remained callable in the
separately observed Codex in-app host, so this is a host-interoperability defect
rather than a data or registration failure.

The corrected implementation makes execution options and their abort signal
optional while preserving cancellation whenever the host supplies a signal.
It is integrated and deployed from
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f`. Before integration, the candidate
passed:

- all four research-pack checks, including JSON Schema validation through the
  version-pinned `jsonschema` 4.26.0 environment. Setup uses binary-only,
  no-dependency installation plus `pip check`; the unhashed pins and reused
  `.venv` mean this is not a clean or fully reproducible environment;
- 95 unit tests;
- 20 installed-Chrome and 20 installed-Microsoft-Edge browser tests, including
  the omitted-options regression;
- six model-free `webmcp-evals` 0.0.4 smoke calls across three cases and all five
  tools, each returning `ok: true` in the expected result-schema envelope;
- discovery and successful execution of all five tools through
  `chrome-devtools-mcp` 1.8.0 in an isolated Chrome 152.0.7977.64 loopback run
  at 15:53 BST on 30 August 2026, with closed schemas and annotations checked,
  fail-closed rejection of a synthetic `personalContext` field and zero console
  errors;
- an application audit reporting zero known vulnerabilities across 162
  dependencies; and
- two idempotent locked builds of Microsoft WebMCP Explorer 0.1.0 from commit
  `f7091c12420e713b11361630dc1649d5678f62ab` in isolated ignored
  `.tools/webmcp-explorer-build/`. The source checkout remained clean; the
  source-tree, package-lock and unpacked-extension file-manifest SHA-256 values
  (the latter over sorted per-file hashes and paths) were
  respectively
  `b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
  `76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
  and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
  The clean-output allow-list passed.

The integrated CI and Pages workflow definitions use
`npm ci --ignore-scripts --no-audit`. Pages is also configured to install the
version-pinned Python requirements and run semantic WebMCP smoke before
deployment. Those checks ran in the protected integration and Pages path that
produced run `33323152751`.

The public-target Chrome DevTools MCP 1.8.0 capture validated that corrected
deployment, discovered all five tools and completed all five calls with zero
console errors. Separately, Chrome's native WebMCP panel recorded all five
calls as `Completed`; a search with `limit: 21` returned the expected structured
validation rejection. Both presentation tools updated the visible page; the
comparison showed 11 facet rows and its displayed digest prefix matched the
canonical result. These are time-, browser- and host-specific observations,
not general WebMCP compatibility claims.

Raw evaluator smoke rows are deleted after semantic validation. The ignored
smoke receipt retains the six-of-six counts and a digest of the validated
results, not full outputs. Its child process received an isolated `HOME`; no
provider credential environment variables were forwarded, although it retained
the operating-system filesystem access of the invoking user. The tracked
fixtures include a no-call case and context-minimisation case. The fail-closed
browser runner was exercised five times with the exact locally installed
`ollama:gpt-oss:20b` model, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
eight cases and three runs per case. It used Chrome 152, `webmcp-evals` 0.0.4
and loopback-only inference; the first three attempts used no remote credential.
Those attempts failed overall: 8 of 102 retry-expanded upstream rows passed before the
legibility changes; attempt 2 passed 33 of 33 upstream but 32 of 33 under the
strict verifier because one call added empty optional arrays; and attempt 3 on
the security-fixed tree passed 30 of 35 upstream after two malformed-then-
corrected provenance IDs and one omitted comparison. Receipt-v2 attempt 4 bound
stable exact identity and exited zero but retained a null evaluation after
structural validation failed. Receipt-v2 attempt 5 reported 30 pass and 6 fail across 36 rows, with 3 retries beyond the 33 expected
rows and zero error, console-error or missing counts. Its three provenance
trajectories recovered from rejected malformed IDs, but `verify-reports`
failed. The failures and variance are retained, so no model-backed pass is
claimed. The Explorer extension was
not loaded. The runner still fails closed on any typed upstream console error
or `pageerror`; only an accepted zero count can enter a passing receipt, which
records `browserConsoleErrorsAccepted: false`.

The hardened DevTools runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final hardened run
left that modification time unchanged. This is an observed cache boundary, not
an operating-system sandbox claim.

Static triage dated 30 August 2026 found the Explorer npm advisory paths were
not reachable in the exact production build path. Operational risks remain:
`<all_urls>` access, persistent `chrome.storage.local` credentials,
`dangerouslyAllowBrowser`, no prompt-injection mitigation and autoexecution in
Agent Run/Chat. Any later Explorer run must use a disposable profile, inspect
the Tools pane first without a credential, then prefer a local loopback model
and Agent Step, and delete the profile afterwards. A remote run is exceptional
and must use a revocable low-limit key and no personal context.

## Mandatory source and claim boundaries

- The frozen `v0.2.0-rc.2` baseline searches only the 69-record GOV.UK
  collection and 11-record curated companion collection. The in-progress
  `0.3.0-rc.1` candidate adds exactly four locked federated source snapshots
  totalling 58,655 raw rows, of which 58,652 are searchable and 3 standalone
  Land Registry legislation rows are quarantined, separately from those 80
  reviewed records. No other
  corpus is admitted and there is no standalone UK Legislation source,
  payload, index or runtime request. Source-authored cross-reference strings do
  not constitute a fifth collection.
- A federated result is a source-snapshot discovery record, not a reviewed
  item-level receipt, official endorsement, current-source certification or
  count of unique government entities.
- The searchable projection exposes no `legislation.gov.uk` result link.
  Federated roles and assertions are producer-declared rather than official;
  digest validation does not change that status.
- UK Government APIs `concept_id` is the source-native record identity because
  it is present and unique across all 41,598 admitted records. Endpoint URLs
  can be shared, so they remain evidence links rather than surrogate IDs.
- `sourceOkfCore` records the producer's native declaration when established.
  `targetOkfCore: "0.2"` records this project's descriptive mapping target. It
  is not a claim that every producer is natively OKF 0.2.
- The GOV.UK imported bytes and Git blob are verified, but the historical
  upstream revision was not available in the local checkout.
- The cached ONS release ZIP has a locally observed SHA-256 but no independently
  retrieved official checksum sidecar.
- `okf-testing` remains quarantined because the local directory is unversioned
  and has no established licence.
- Catalogue or descriptor inclusion never establishes official endorsement,
  current accuracy, access authority or an open licence.

No `gis-ai-go` or OKF source repository has been modified.

## Governance gates

Chris Page's recorded assurance resolves personal ownership, resource-use,
outside-interest and original-code licence questions for this repository.
Public branch/PR publication, branch protection, the historical annotated pre-
release and corrected Pages deployment are complete. The following remain
gated:

- treat 1:00 pm PDT on 3 September 2026 as the official close; require a public
  repository with a visibly detectable open-source licence, a public YouTube
  video under three minutes with audio and the exact live project accessible in
  ChatGPT's in-app browser or Chrome with WebMCP enabled;
- freeze the repository, live project and submission after the close;
- do not submit to Devpost without a separate instruction;
- do not claim WCAG conformance, official endorsement, comprehensive coverage,
  production readiness or guaranteed accuracy;
- do not describe page-scoped WebMCP as a durable MCP gateway or as provider or
  service-operation integration;
- do not publish the local review video until the owner has approved the
  synthetic-voice publication basis, privacy, branding and final playback; and
- do not change an accepted submission after the competition deadline.

## Next safe task

Finish the remaining A–M candidate matrix without weakening the four-source
allowlist, evidence-tier distinction or fail-closed budgets. Push the exact-
reviewed-gzip and decoded-source cross-binding correction to pull request 16,
require its exact Linux CI rerun to pass, merge without bypassing branch
protection, deploy the exact main commit and bind the live artefact back to that
commit before tagging or refreshing submission evidence.

Until that work is complete, do not describe federated behaviour as released,
deployed, CI-validated or observed in a live WebMCP host. The existing video,
public-upload and Devpost gates remain open and must be reassessed against the
exact federated release candidate rather than inherited from the frozen
pre-federation baseline.
