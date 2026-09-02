# Project status and hard gates

**Status model:** this source defines the `0.4.0-rc.1` Evidence answer
candidate. A repository revision does not prove whether it has been merged,
deployed or tagged. Determine the current public identity from the live
`deployment.json`, a fresh authenticated byte-comparison receipt and GitHub tag
and release metadata. The dated historical observation below remains evidence
only for commit `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`: pull request #20
passed after its Linux deadline regression was corrected, protected `main`
passed validation run `33554600300`, and Pages run `33555187118` deployed that
exact commit at <https://chris-page-gov.github.io/govuk-webmcp/>.

The subsequent release-hardening change is under pull request #21. Its first
Linux CI run `33593265033`, job `100131452398`, failed for four diagnosed
reasons: the ignored raw Chrome fixture was absent from the clean runner; two
filesystem-substitution tests assumed APFS-style inode non-reuse; and
`webmcp-evals` backup clean-up trusted a recycled device/inode pair and could
remove a replacement. The run is not a passing integration record. The
correction reconstructs the exact historical raw fixture from tracked evidence
as 133,272 bytes with SHA-256
`2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`
and makes validated clean-up bind exact bytes, mode and identity rather than
assuming an inode cannot be reused. The current prepared unit suite passes 398
of 398. The focused post-review batch passes 116 of 116. Restrictive process
umasks are now normalised by opening the new evidence stage without following a
symbolic-link leaf, cross-checking its descriptor/path identity and setting the
exact requested mode through the opened handle before mode and byte validation.
Protected integration, deployment and the final complete release gate for this
hardening revision remain to be established by their own records.

The complete live comparison observed on 1 September 2026 fetched all 1,884
regular artefact files and 128,646,735 bytes. Every request returned HTTP 200
and there were zero byte mismatches. The live manifest SHA-256 is
`23c88e4d67c4d75f687f0b4c53763ea755dcbaa566753bc3d213a5a9ba714442`.
An isolated Chrome 152.0.7977.66 observation through Chrome DevTools MCP 1.8.0
discovered and completed all six WebMCP tools against those bytes, rejected an
unrelated `personalContext` field and recorded zero console errors. The final
`present_resource_evidence` result and displayed Evidence answer shared digest
`0424acfc7ad7869b7e7320f6bea9c822a6453101f26e2719fdfe8b5c2c9fd0e3`.
No model selected a tool, no model provider was called and no host-owned
surface was captured. Review subsequently found and corrected a pre-admission
validation gap. The last pre-hardening corrected-path capture completed at
`2026-09-02T01:56:15.734Z`: its mode-`0600` raw receipt,
tracked reviewed Chrome projection and supported-host projection have SHA-256
values `2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`,
`e9d67af0799ee6772396837bd4ab8df7538ae8a11c6d5c62ef08e1b505d5a8e7`
and `b98c43fd394ea74731d59a114aecb69897a60fe978b1ebc352a4347ba1046f33`.
The rebuilt 40.966667-second ignored reconstruction has SHA-256
`db8a9eaaadc0e4b2d6716c52cec5cde995f7a1e56d54fc3e92df96089fcfb835`;
its tracked receipt has SHA-256
`4ee76fa70e48fca22e6874500d4bfa8a9c19d75bdbec5116276c23efffc5a528`.
These observations prove deployment and
deterministic tool behaviour only; they do not prove factual completeness,
official certification, current-source accuracy, open licensing, personal-AI
selection, usability or future availability.

The current evidence follow-up hardens how those observations can be admitted
and reused. Supported-host validation now requires the exact six published
schemas and deterministic outputs, complete Evidence answer digest, exact
`v2` live Pages receipt and byte-bound raw plus tracked reviewed Chrome
projections. Every publication consumer freshly authenticates the live receipt
in-process, requires ordered `initial`, `after-page-load` and `after-execution`
deployment checks, matches both stored public and private receipt bindings and
requires the fresh observation to be at or after both stored receipt
observations. Release claims derive only from the authenticated object.
Authentication has explicit `owned` and `borrowed` leases: owned success and
failure paths revoke before awaiting asynchronous snapshot clean-up, while a
borrower cannot revoke the outer authentication. Chrome capture
promotes the mode-`0600` raw receipt and both public projections as one
recoverable three-file operation, requires an allowlisted public target and
exact expected commit, and makes raw overwrite separately explicit. The
final-video preflight also revalidates the complete VoiceOver
manifest and all nine frame bytes. Before admitting personal-agent media it
owns one authentication of the private pre-run Pages receipt, lends it to the
exact 72-run replay and supported-host validation, byte-canonically compares
the supplied summary, and revokes it in the outer `finally` path. A shaped
structural receipt cannot manufacture `authenticated` status or bypass the
retained pre-run and fresh-observation time window. Descriptor-safe data-only
validation now covers reviewed, combined and lazy federated discovery,
Evidence Trace comparison and the shared action-budget ingress for all six
page actions. Symbols, accessors, non-enumerable fields, sparse items and extra
array properties are rejected without invoking getters. Numeric limits accept
only actual bounded integer numbers and never invoke coercion hooks. Portable
reflection does not claim to contain Proxy traps: browser-host JSON cannot
carry a Proxy, while a same-realm Proxy already has script-execution authority.
One canonical helper rejects the legislation
apex and every subdomain, including trailing-dot forms, throughout build,
capture and evidence validation.

One shared path contract now fixes every candidate release input consumed by
the live verifier, supported-host capture and final-video assembly: the demo
configuration; local and private live receipts; private evaluation, summary
and Copilot capture; reviewed live, Chrome and supported-host evidence; and the
exact VoiceOver manifest, clip and nine frames. The live verifier can promote
one serialised receipt byte-identically to the local mode-`0600`, optional
private mode-`0600` and optional reviewed mode-`0644` paths. Private and public
admission use `--stage-private-release-receipt` and
`--admit-public-evidence`; replacement requires the corresponding explicit
`--overwrite-private-release-receipt` or `--overwrite-reviewed-evidence`
option. Replacing the private receipt reports that all dependent supported-host
and media evidence must be recaptured, and later validation requires the
supported-host observation to be no earlier than the replacement.

The no-argument VoiceOver screenshot-clip builder now resolves the same
canonical candidate path,
`output/voiceover-capture/v0.4.0-rc.1-capture-manifest.json`, instead of the
historical generic `output/voiceover-capture/capture-manifest.json`. An omitted
argument can no longer select evidence from the wrong release lineage.

Live clips, the supported-host reconstruction, the Ollama diagnostic and the
four final-video outputs now use one shared promotion transaction. Failures
before complete promotion restore the previous set; backup clean-up after a
complete commit retains the new set and reports any recoverable leftovers. The
portable clean-up boundary revalidates exact file bytes and mode as well as the
expected identity immediately before removing a validated stage, committed
output or dependency backup. A filesystem-recycled inode therefore cannot make
a replacement eligible for deletion. The private local evaluator rejects
symbolic `.evals` and output roots. Video copy
now says only that there is no dedicated personal-context field and that free
text can still disclose personal details.

The corrected admission path preserves the rejected-field privacy boundary:
public projections retain only rejected field names, not rejected values. The
final three-file capture and labelled reconstruction are now byte-bound; the
evidence manifest must include these exact final bytes before review completes.
Validation counts and durations belong to their named receipts and commits;
they are not inferred from this status file. Historical partial and flaky
browser runs remain retained rather than being represented as a product pass.

Version `0.3.0-rc.1` remains a historical tagged release at protected-main
product commit `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. Its annotated tag and retained
five-tool, accessibility and media evidence remain historical evidence for that
commit and are not rewritten as `0.4.0-rc.1` evidence.

## `0.4.0-rc.1` Evidence answer candidate

The `0.4.0-rc.1` candidate is separate
from the released five-tool `v0.3.0-rc.1` history above. It defines a closed
beginner-presentation projection for reviewed answers,
reviewed records and all four federated collections; the bounded
`present_resource_evidence` action and sixth WebMCP registration; persistent
**Evidence answer** and **Technical review** navigation; bounded fragment
routing; and a text-only Evidence answer renderer over the same deterministic
presentation object returned by the tool.

The candidate worktree also contains five additional closed schemas, a natural
personal-agent evaluation fixture and a repaired repository-local optional
guided-build state. The guided-build repair points to the repository's existing
scope, PRD, specification, checklist and backlog. It has
`submission.status: not-started` and did not register, update or submit a
Devpost entry.

The shared controller now uses one latest-started sequence for all three
Evidence answer actions, including human route, status and focus effects. Each
captured personal-agent call sequence is replayed from a private,
manifest-verified snapshot of receipt-bound `dist` bytes under a unique module
identity. The public summary copies neither
unrestricted host/browser text nor hashes of it. Its strong claim gate requires
a freshly authenticated exact live Pages observation, an authenticated Git
checkout under the policy described below and a byte-identical local `dist`;
a merely well-shaped receipt is reported as `structurally-valid` and cannot
open the gate. Copilot evidence must
bind visible Microsoft Edge MCP Workspace and an observed Copilot share link,
and privacy-marker checks normalise encoded and Unicode forms.

The live artefact verifier validates and counts directory entries as well as
regular files before extraction, measures logical payload bytes and enforces the
work budgets recorded in receipt schema v2. These controls close the initial
review's defects and the independent follow-up's authentication, replay,
privacy, host-binding and resource-budget defects. Historical code-snapshot scan
`aedf88e3-6a77-46af-be6b-2c672001dd46`, digest
`codex-security-snapshot/v1:sha256:54069030a2b50cc5a9a084c5973fc06d4b07ea898acab187d3c543c9aa70df0e`,
completed 36 of 36 items, ran 102 focused tests, found zero findings and
concluded that there was no security release blocker for that snapshot. The
later pre-fix scan `dcfed744-0676-40c1-a0ef-84dd3cc7b52b` found one Low,
high-confidence receipt-authentication defect; the fresh-authentication changes
above remediate it. Historical sealed post-fix working-tree scan
`185ce6fa-a47f-4c5e-9888-c63a9f932205`, snapshot
`codex-security-snapshot/v1:sha256:012c0b4bb3e60271f8d60fca9475976a473ac0a267f87354810e51c2d575c0ad`,
completed all 33 selected executable-source items with complete configured
coverage and zero reportable findings for that snapshot. The clean-run,
portable clean-up, canonical-path, secure receipt-staging and
evidence-descendant authentication changes described here alter executable
source after that sealed scan, so it remains historical evidence and does not
close the current changed-source security gate. A fresh review of the current
snapshot remains required.

Non-executable documentation, tests, generated projections, binary media,
ignored private captures, transitive dependencies and upstream services retain
the scan's stated exclusions or supporting-evidence status.

Settled post-hardening product checks on 2 September 2026 include research 4 of
4; a passing production build and full-corpus projection audit for all 80
reviewed and 58,652 federated records; 398 of 398 prepared unit tests; 43 of 43
installed Chrome and 43 of 43 installed Microsoft Edge
tests; frozen mean nDCG@10
`0.984698009` and Recall@20 `1`; 7 of 7 model-free WebMCP smoke envelopes; and
zero npm-audit vulnerabilities across 162 dependencies. Two complete builds
each produced 1,883 files and 128,653,230 bytes with aggregate SHA-256
`cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
The complete browser suites include bare and legacy routes, human and WebMCP
presentation, inactive-view preservation, complete limitations,
representative tiers, keyboard use, 320 CSS pixels, 400% reflow, forced colours
and reduced motion. The first in-sandbox browser start failed because loopback
binding was prohibited; the authorised reruns passed and this environmental
failure is not represented as a product failure.

Protected integration, exact Pages comparison and the isolated-Chrome six-tool
observation are historical pre-hardening evidence for product commit
`a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`. The 36-run Copilot capture,
complete cross-host comparison, final video, signed-out public-player review
and final Devpost review require exact-release evidence. Tag and GitHub-release
state must be read from GitHub metadata rather than inferred from this file. The candidate
Safari and VoiceOver journey is complete with explicit limitations. The
36-run local Ollama diagnostic is complete but unclaimable. Historical
`v0.3.0-rc.1` evidence must not be relabelled as `0.4.0-rc.1` evidence.

Normal evaluation continues to require a clean checkout at the exact Pages
commit. Final-video authentication alone may use a clean evidence-descendant
commit so reviewed release evidence can be assembled after deployment without
changing the tagged product bytes. That exception requires the Pages product
commit as an ancestor, a stable HEAD and exact Git change set before and after
authentication and revalidation, `A` or `M` changes only, and a closed allowlist
of documentation `.md`, `.csv` and `.vtt` files, reviewed evidence JSON and the
exact `v0.4.0-rc.1` VoiceOver manifest, nine frames and clip. It rejects
`AGENTS.md`, runtime, workflow, package, source, script and test changes.

The worktree now also contains guarded candidate release tooling. It can verify
the exact successful manual Pages run, downloaded artefact digest,
`deployment.json` identity and every regular deployed file before admitting a
versioned live-byte receipt. Receipt schema v2 fixes the archive at no more than
256 MiB, 4,096 files, 512 directories, 192 MiB of regular-file payload and 8 MiB
per file, with eight concurrent fetches, a 60-second per-file deadline and a
ten-minute whole-comparison deadline. The separate `v0.4.0-rc.1` nine-scene
capture and video plan targets the current Evidence answer, sixth tool,
Technical review, a genuine private Copilot capture, a separately labelled
local Ollama diagnostic receipt visualisation and nine candidate VoiceOver
checkpoints. Redaction and privacy, branding, rights, voice and playback review
remain fail-closed gates. The exact candidate Pages artefact
has been compared and five silent page-only interaction clips have been
captured. Their agent privacy and branding review passed; human publication
review remains pending. Their v4 receipt records an initial deployment check,
checks immediately before and after every scene and a final check; its SHA-256
is `4ce8b09bad6a8b9d5a981d31c2e5ad4f0d1d3030d4eba1758e93f4000c0870aa`.
The candidate manual Safari 26.5.2 and VoiceOver 10
Caption Panel journey at the public candidate URL is also complete with limitations: 6 of 9 checkpoints
passed and 3 are limited. The record retains eight explicit limitation
statements. VoiceOver speech audio was not
captured, the 27-second sequence is not continuous footage and no WCAG
conformance is claimed. The Caption Panel and VoiceOver were verified off
afterwards. The retained capture did not independently snapshot deployment
metadata before and after the journey; its commit and Pages run identify the
intended candidate rather than a cryptographic capture-time binding. The exact clip SHA-256 is
`704532eaf6c01706d33ae201efc7b98131b1399340bfea6ca948c2ac775f4921`;
its capture-manifest SHA-256 is
`4d96de5240d2c15d1ff57330371ba8334381381a2eb9e0c4c178651f6d05b3ef`.
The manual evidence SHA-256 is
`77b6737c0ca21661c536f3e62a7fc071c27652290e5c14dcb4dd1474509ac69f`.
The clip, nine source frames and manifest are intentionally tracked as 11
narrowly allowlisted release-build inputs totalling 5,584,101 bytes; including
the tracked manual evidence makes 5,591,303 bytes. No other local output is
admitted. The isolated-Chrome host record is deterministic
tool evidence, not a personal-AI recording; the Copilot and complete cross-
host comparison, privacy redaction and signed-out public-player check remain
separate gates.

The patched 36-case local Ollama diagnostic is complete for exact model digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
Its capture-schema-v3 mode-`0600` private capture is
`.evals/personal-agent-local/2026-09-02T02-04-23-905Z-75561/private-capture.json`,
with SHA-256
`ac6dd41ef1733b2ea8e553da5d7aa5666c5f55d23643a89fb57d22632c63f5a8`;
the tracked privacy-minimised summary SHA-256 is
`a249548772fefed95b87db48c27ccda8f66baa09e43a2087c8dc6390509f283f`.
It records 36 local observations and all 36 Copilot slots as missing. Of 118
recognised calls, 108 returned deterministic `ok: true` results and 10 retained
deterministic `ok: false` rejections across nine runs; two unavailable or null-
result attempts remain runner diagnostics only. Tool selection and
deterministic execution each pass 6 runs and fail 30. Page parity is not
observable for all 36, all answers are unreviewed and no run has complete
context. Browser-console, page-error, network-error and latency telemetry are
explicitly not observable. Runner errors are observed: 34 runs are clean and
2 retain bounded errors. Interaction-step measurements are observed from 1 to
6. US-10 tool-argument checks pass 3 of 3 and tool-result checks pass 3 of 3
with no synthetic-marker leakage. Conversion and deterministic replay pass,
while the authenticated verifier correctly refuses the dirty, unbound loopback
context.
The claim gate is false. This diagnostic does not establish safe local answers
and does not complete the cross-host matrix.

The media contract now reflects that result instead of requiring an impossible
successful local-host recording. `demo:ollama-diagnostic-clip` will generate a
labelled offline visualisation only after independently replaying the exact
private capture against the current evaluation contract and matching it byte
for byte to the tracked public summary. Its closed receipt binds both source
digests and the exact model digest, carries the failed and unknown criteria and
states that no host recording or page update is shown. The Copilot scene still
requires a genuine visible supported-host call, Evidence answer update and
owner-human review. The generated diagnostic release-media clip is 37 seconds
long, contains 1,849,825 bytes and has SHA-256
`95bb7ab39361546021601cbb126a41d4530916ab08d9d709abbe89c7cd623f63`.
Its tracked public receipt is
`docs/competition/evidence/ollama-local-diagnostic-clip-v0.4.0-rc.1.json`;
its SHA-256 is
`182f9308464e5ba1773e316965f627a200d6df2f38a85a70a4a37e3178296fe4`.
The clip remains ignored release media. The mode-`0600` private source capture
is inside the ignored `.evals` directory and outside tracked history. This
evidence does not create a local-
host safety or deployed-page parity claim.

The historical `v0.3.0-rc.1` evidence follow-up is separate from the current
candidate. Codex
In-app Browser (Browser plugin `26.825.32147`) discovered and executed all five
WebMCP tools on the exact public release, rejected an unrelated
`personalContext` field and produced a comparison whose canonical and displayed
digests matched. This is machine evidence from a host capability interface, not
a host-owned recording and not evidence that a model selected a tool. Five
silent public-page interaction clips are also captured with agent privacy and
branding review complete. Codex In-app Browser retains its own host name.
Separately, isolated Chrome 152 with browser-native WebMCP enabled discovered
and completed all five tools on the exact release through Chrome DevTools MCP
1.8.0 at `2026-08-31T18:49:38.356Z`. It rejected unrelated `personalContext`
with stable error code `invalid_search_request`, recorded zero console errors
and called no model provider. This closes the rules-named Chrome observation
gate without proving ChatGPT support, model selection or general browser
compatibility. A fresh nine-step Safari 26.5.2 and VoiceOver 10
Caption Panel journey against the exact release is complete with limitations:
seven checkpoints passed; a heading-rotor selection was not retained; and the
automatic spoken live-status wording was not proved. VoiceOver speech audio was
not captured, no WCAG conformance is claimed, and the Caption Panel and
VoiceOver were turned off afterwards. The resulting 156.023-second local review
video has SHA-256
`e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`.
Technical review passed the complete video/audio decode, 4,678-frame count and
40-cue caption-parity checks while retaining one non-blocking subtitle metadata
warning. It did not include audible or continuous human playback review. Do not
describe the video as owner-approved, published or submitted.

The release retains the full correction history rather than rewriting it.
Immutable fixed-tree scan `040ad945-3723-4aef-9c03-1bb552630deb` reviewed 55 of
55 items against `9c6ed7d9a21574972ee564b333cbc49983058554` with zero
reportable findings. The exact reviewed-gzip and referenced import-deadline
corrections exposed by earlier Linux runs were subsequently validated through
the passing protected release path above. The frozen pre-federation baseline is
annotated tag `v0.2.0-rc.2` at product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935`; it remains historical and must not
be moved or rewritten. Historical release and deployment observations below
remain evidence for their named commits only.

Competition registration is complete. The latest authenticated read-only Devpost
observation, completed at `2026-08-31T12:16:25Z` after starting at
`2026-08-31T12:16:23Z`, showed project `1406973` as `Untitled`,
blank and `submission_pre_draft`, with no video URL, publication timestamp or
submission timestamp. No Devpost submission or public YouTube upload is
claimed.

## Beginner trust-pathway discovery and implementation status

The discovery baseline added product research and evaluation evidence without
changing the released `v0.3.0-rc.1` interface, WebMCP tools, data contracts or
public deployment at that historical checkpoint. Historical pre-hardening
product commit `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8` deployed the first
`0.4.0-rc.1` dual-view and presentation-tool architecture. The beginner
experience treats the existing evidence-dense page as the retained
**Technical review** view and starts instead with five questions: what is being
claimed, which source supports it, what the AI added, what is missing and what
safe check comes next.

The companion `docs/product/beginner-interface-specification.md` defines the
second **Evidence answer** view over the same action controller and canonical
results. The `v0.4.0-rc.1` source implements its projection, route, renderer,
shared controller and sixth tool. Settled local automated checks are recorded;
exact public-byte, isolated-Chrome and bounded VoiceOver evidence currently
retained for this version binds only the historical pre-hardening commit.
Candidate manual VoiceOver evidence records 6 passed and 3 limited checkpoints
with eight explicit limitation statements. Exact-release Copilot, complete
host-comparison, final-media, tag and GitHub-release state must be established
from their own live records, and no formative participant result or WCAG conformance may be
inferred from implementation, automated tests or the one-environment manual
observation.

The discovery pack now contains four synthetic personas, 12 representative
user stories, a plain English full learning pathway and an exact coverage
matrix across the released evidence estate and 21 fork-local GOV.UK Chat pilot
cases. No ranked GOV.UK Chat question-frequency dataset was found. The stories
are therefore hypotheses informed by official GDS research, not “most common
questions” or completed user research.

One guided local Chrome 152 / `webmcp-evals` 0.0.4 run used exact
`ollama:gpt-oss:20b` digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
All 12 stories produced final text; every intended first search and both
no-call decisions worked. The ordered matcher reported 13 pass, 16 fail and 0
error across 29 scored steps. Eight failure pairs arise from an ambiguous
fixture that expected separate record and provenance calls after asking the
model only to “inspect and show provenance”; each actual provenance call
succeeded before the model answered. Qualitative review remains a hard
failure: US-02, US-03, US-09 and US-10 contained material unsupported or
rights-inaccurate claims. This run is diagnostic and does not close the
existing strict model-backed gate or establish beginner comprehension. A
privacy-reviewed machine receipt admits the 19 actual calls, arguments, result
digests and review labels without committing full prompts, model prose or tool
payloads.

The separate A Life in the UK factual gate is closed for the current candidate.
The authored federation lock, closed schema, corpus admission, generated
display contract, executable runtime boundary and tests now match the producer's
exact-revision AI-consumer contract: 0 accepted specialist reviews, 2 service
families where specialist review is not required and 291 where it is required.
No positive specialist-acceptance claim is admitted. Historical
`v0.3.0-rc.1` receipts retain the earlier wording as immutable evidence for
their named release bytes; they are not current candidate truth.

## Released `0.3.0-rc.1` federated boundary

The released slice extends discovery without weakening the assurance of
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

The release keeps five fixed, page-scoped tools and the complete accessible
human equivalent over one common deterministic result. OKF supplies governed,
progressively retrievable evidence; WebMCP lets a citizen-selected AI invoke
bounded page actions over it. The page hosts no model and its closed schemas
expose no dedicated identity, profile or general personal-context field.
Bounded free-text search can still contain personal details. This does not
establish end-to-end privacy: a remote model provider may receive prompts, tool
metadata, arguments and results, and the static host may observe ordinary or
query-derived asset requests. The released page's broader “does not accept a
profile” sentence remains a known copy limitation for the separately authorised
beginner-interface implementation.

The released files record 6 searchable and 4 non-searchable corpus admissions,
5 source-lock registry entries and 31 closed JSON Schemas. These are
release-bound counts for product commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. The stable reproducibility
boundary is 73 versioned, reviewed gzip source artefacts totalling 13,021,675
bytes. Their
exact stored byte lengths and SHA-256 values bind the reviewed representations;
bounded decompression plus decoded lengths and SHA-256 values bind their source
meaning. Import preserves those reviewed bytes only after matching each decoded
payload to the freshly fetched source byte for byte. The deterministic builder
expands those inputs to 1,853 shard files — 120 record shards and 1,733 postings
shards — plus the manifest and checksum sidecar: 1,855 ignored generated files
and 127,747,020 bytes in total. The production build copies that same-origin
plane into `dist`. The federation lock and generated-manifest digests are
cross-bound and were validated in the protected release path.
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
quality remain testable hypotheses. The exact build, protected integration,
deployment, live-byte identity, bounded manual VoiceOver observation, local
video-build and technical-review gates are closed. The fixed-model,
inclusive-design follow-up, owner-review, public-video and submission gates
remain open.

The frozen lexical retrieval-quality gate is implemented and required by CI
and Pages after `npm test`. It measures bounded nDCG@10 and Recall@20 cases,
cold/warm determinism and prohibited-legislation behaviour. The release tree
passed at mean nDCG@10 `0.984698009` and Recall@20 `1`, with identical cold/warm
results and legislation absent or rejected, including through protected CI and
Pages. This bounded lexical result does not establish model quality or corpus-
wide recall.

## Release-candidate assurance chronology

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

The release contains remediations for eight earlier Low findings: the seven
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
integrity defects. The release addresses them through exact ordered
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
- release-candidate prepared unit suite: 194 of 194 passed;
- prior evidence-follow-up prepared unit checkpoint: 195 of 195 passed locally
  and in pull-request validation run `33391552626`; that run predates the
  current VoiceOver and video-evidence diff and does not validate it;
- frozen retrieval quality: mean nDCG@10 `0.984698009`, Recall@20 `1`, identical
  cold/warm results, no legislation collection and the legislation request
  rejected;
- installed Google Chrome and Microsoft Edge: 30 of 30 browser tests passed in
  each;
- model-free WebMCP smoke: 6 of 6 passed in real Chrome;
- exact-release Chrome WebMCP observation: 5 of 5 tools discovered and
  completed in isolated Chrome 152 through Chrome DevTools MCP 1.8.0, with the
  invalid personal-context input rejected and zero console errors;
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
Those results were pre-release local checkpoints. Pull-request validation
`33356087333`, protected-main validation `33356272534`, Pages run `33356452048`,
the complete live-byte comparison and exact-release supported-host capture now
provide their respective release evidence. Fresh manual accessibility evidence,
the refreshed local video and its technical review are now complete with their
recorded limitations. A passing model-backed evaluation, the unproved
screen-reader checks, owner publication review, public playback and submission
remain open.

The 31 August local technical compliance review is complete through the
current Chrome observation at `2026-08-31T18:49:38.356Z`. It is an intermediate
evidence review, not the final live-rules and Devpost-form refresh; that final
refresh remains open.

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

## Current release boundary

The public repository is
[`chris-page-gov/govuk-webmcp`](https://github.com/chris-page-gov/govuk-webmcp).
`main` is protected. A dated historical observation found that the live Pages
site resolved to candidate product commit
`a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`, deployed by Pages run
`33555187118` and verified byte for byte across all 1,884 files.
Public pre-release
[`v0.3.0-rc.1`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.3.0-rc.1)
remains bound to product commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`; its historical Pages run was
`33356452048` and all 1,879 files matched at that time. Those observations do
not establish the current live identity; consult the live deployment metadata
and a fresh receipt. GitHub secret scanning and push protection remain enabled.

The separately tagged `v0.3.0-rc.1` release contains:

- 80 item-reviewed searchable records with 80 evidence receipts;
- 58,652 searchable source-snapshot records from 58,655 locked raw rows across
  UK Living, ONS, UK Government APIs and HM Land Registry, with three standalone
  legislation records quarantined;
- five source-lock registry entries and 73 reviewed gzip artefacts;
- one digest-bound Evidence Trace over three selected GOV.UK records;
- a 10-entry corpus admission manifest, with 6 searchable and 4 non-searchable
  entries;
- an analytical-index-first human interface with a text-labelled Evidence
  Trace, separate foundation facets and claim comparison without a trust score;
- five imperative WebMCP tools over one deterministic action controller; and
- 31 closed JSON Schemas plus catalogue, receipt, Trace, federation and lazy-
  search integrity bindings.

The three catalogue query tools are read-only. The two exploration tools have a
truthfully declared reversible in-memory page-presentation effect and therefore
use `readOnlyHint: false`. Neither class writes storage, changes canonical
metadata, calls a provider or changes external state.

## Historical pre-federation assurance retained

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

The 30 August public-target Chrome DevTools MCP 1.8.0 capture validated the
earlier corrected deployment, discovered all five tools and completed all five
calls with zero console errors. Separately, Chrome's native WebMCP panel recorded all five
calls as `Completed`; a search with `limit: 21` returned the expected structured
validation rejection. Both presentation tools updated the visible page; the
comparison showed 11 facet rows and its displayed digest prefix matched the
canonical result. These are time-, browser- and host-specific observations,
not general WebMCP compatibility claims.

On 31 August 2026, a fresh public-target rerun in isolated Chrome
152.0.7977.64 with browser-native WebMCP enabled bound the same five successful
calls to exact release commit `b0bd634` and Pages run `33356452048`. It rejected
`personalContext` by stable error code `invalid_search_request`, recorded zero
console errors and used no model or provider. The first current-release capture
stopped only because the harness expected obsolete error prose; the harness was
changed to assert the stable code and the reviewed rerun passed. This remains a
one-time Chrome observation, not a general compatibility claim.

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
  collection and 11-record curated companion collection. Released
  `v0.3.0-rc.1` adds exactly four locked federated source snapshots
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
Public branch and pull-request publication, branch protection, the historical
pre-releases, protected `v0.3.0-rc.1` release and exact Pages deployment are
complete. The following remain gated:

- treat 1:00 pm PDT on 3 September 2026 as the official close; require a public
  repository with a visibly detectable open-source licence, a public YouTube
  video under three minutes with audio and the exact live project accessible in
  ChatGPT's in-app browser or Chrome with WebMCP enabled;
- retain the exact-release Codex In-app Browser and isolated Chrome 152
  observations under their own host and capture-mechanism names; the current
  Chrome receipt closes the rules-named host gate without establishing ChatGPT
  support, model selection or general compatibility;
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

Against the pre-integration `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`
deployment, demonstration preflight currently fails only on the three
intentionally absent genuine Copilot artefacts. That is a diagnostic of the old
candidate inputs, not readiness for the next release commit: every exact-release
receipt and media input must be recaptured or rebuilt after the hardening branch
is integrated and deployed. Generated or reconstructed Copilot media remains
prohibited.

First complete pull request #21's assurance cycle: preserve failed run
`33593265033`, job `100131452398`, as evidence of the clean-run and Linux
portability defects; retain the current 398-test prepared-unit pass; complete a
fresh security review of the corrected executable snapshot; and require a green
protected pull-request run before merge. Only then deploy and authenticate the
exact protected-main product commit. Do not reuse the pre-hardening Pages,
Chrome, supported-host, VoiceOver or media receipts as release evidence for
that commit.

For the product-evidence lane, retain the completed patched 36-case Ollama
diagnostic with all its failures and unknowns as historical diagnostic evidence,
without upgrading it into acceptance. After the final protected-main deployment,
run a fresh 36-slot local matrix from a clean exact-release checkout and build,
bind every run to that deployment and retain its unknown page and answer states
unless they are genuinely observed and reviewed. Capture the separate 36-run
Microsoft Copilot MCP Workspace matrix only through the visible owner-controlled
host, with a fresh conversation and private observed share link for each slot.
Only those two newly release-bound halves may form the 72-run authenticated
media source. Formative research remains unobserved and must not be inferred
from synthetic personas, automated tests or either model host. The page cannot
inspect or validate the AI host's final prose.

For any `v0.4.0-rc.1` release candidate, integrate build-affecting changes
through protected review, deploy and byte-compare that exact protected-main
commit. Recapture and rebind the live interaction, six-tool Chrome,
supported-host, Safari VoiceOver and Caption Panel evidence against that
deployment; rebuild the release-context media receipts and run both fresh
36-slot host matrices. Build and review a redacted under-three-minute video
only from those exact verified bytes, the personal-AI Site-tools journey,
Evidence answer comparison, Technical review and truthful local Ollama
diagnostic. Create the annotated tag on that same protected-main product
commit; a later evidence-documentation commit may record the observations but
must not move the tag or trigger claims for a different deployment. Complete
audible playback, privacy, branding, rights and caption review and verify any
public player signed out. The historical 156.023-second video remains evidence
for `v0.3.0-rc.1` only.
Perform the final read-only rules and Devpost-form refresh afterwards;
submission remains a separate explicit action.

Do not move the `v0.3.0-rc.1` tag or substitute historical pre-federation
accessibility, host or video evidence. The strict model-backed gate, public
YouTube upload and Devpost submission remain open; upload and submission are
separate explicit actions.
