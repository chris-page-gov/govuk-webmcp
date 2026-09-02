# Static competition architecture, federated release and Evidence answer overlay

The first diagram records the frozen pre-federation architecture through
`v0.2.0-rc.2`. Annotated tag `v0.2.0-rc.2` resolves to product commit
`35fcedd39ed955278d3975a6dd80692fc6e32935` and is retained without rewrite;
the GitHub release is not described as platform-immutable.

```text
Four exact authored source locks
  ├─ 69 locked GOV.UK content records
  ├─ 11 curated government data and API records
  ├─ 1 authored answer pack
  └─ 10 reviewed corpus-admission decisions
          │ exact ID, path, item count, SHA-256 and regular-file checks
          ▼
Deterministic generators
  ├─ catalogue: 80 records + 80 packaged evidence receipts
  ├─ evidence: 1 Evidence Trace
  └─ federation: 10 corpus admissions
          ├─ 2 searchable deep-evidence collections
          └─ 8 described, conditional, quarantined or contract-only collections
          │ JSON Schema, cross-binding and digest checks
          ▼
Four same-origin runtime artefact families, each with a SHA-256 sidecar
  ├─ catalogue
  ├─ receipts
  ├─ Evidence Trace collection
  └─ federation manifest
          │ all four validate before any tool registration
          ▼
One shared action controller
  ├─ accessible human interface
  │   ├─ analytical index first
  │   ├─ Evidence Trace and separate trust facets
  │   ├─ score-free claim comparison
  │   └─ searchable catalogue and evidence-estate boundary
  └─ five imperative WebMCP tools
      ├─ 3 read-only query tools
      └─ 2 reversible in-memory presentation tools
          │ bounded structured output; source text remains untrusted
          ▼
Person and agent inspect the same deterministic evidence and authoritative links
```

Version `0.3.0-rc.1` implements the federated architecture in released product
commit `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. Pull-request validation run
`33356087333`, protected-main run `33356272534` and exact-commit Pages run
`33356452048` passed. The complete public-byte comparison matched all 1,879
regular files to Pages artefact `9745316971`. One supported host then
discovered and executed all five page tools; no model selected a tool and no
model provider was called:

A separate `v0.3.0-rc.1` manual Safari and VoiceOver journey completed with
7 passes and 2 retained limitations. Its Caption Panel media is a 27-second
screenshot sequence, not a continuous recording; VoiceOver speech audio was
not captured and the observation is not a WCAG conformance claim. The guarded
pipeline then produced a 156.023-second local review MP4 with SHA-256
`e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`.
Technical review passed its H.264 video, AAC audio and English-caption stream
contract, complete video/audio decode, and normalised parity across all 40
caption cues, the script and transcript. These records establish local review
evidence, not human publication approval, public-player availability or
submission.

```text
80 reviewed deep-evidence records       Four locked OKF source snapshots
with 80 item-level receipts             ├─ A Life in the UK: 9,757
                                        │  including 293 service families
                                        ├─ ONS metadata: 5,097
                                        ├─ UK Government APIs: 41,598
                                        └─ HM Land Registry metadata: 2,203 raw
                                           ├─ 2,200 searchable
                                           └─ 3 legislation rows quarantined
              │                                      │
              │                                      └─ 58,655 locked raw rows
              │                                         before deduplication;
              │                                         58,652 searchable
              └──────────────────┬───────────────────┘
                                 ▼
              five exact source-lock registry entries
              ├─ four retained reviewed inputs
              └─ one four-publication federation lock
                                 │
                                 ▼
              validated same-origin evidence planes
              ├─ reviewed catalogue and receipts
              ├─ Evidence Trace and 10 corpus admissions
              │   ├─ 6 searchable
              │   └─ 4 non-searchable
              └─ manifest-first federated search
                  ├─ 73 versioned gzip inputs (13,021,675 bytes)
                  └─ 1,853 shards + manifest + sidecar
                     (1,855 files; 127,747,020 bytes)
                                 │
                                 ▼
                    one shared action controller
              ├─ complete accessible human journey
              └─ the same five page-scoped WebMCP tools
                                 │
                                 ▼
              tiered result with source, snapshot, link role,
              integrity basis and limitations; no trust score
```

Federated trust labels are conservative. Producer text cannot promote an
arbitrary link or assertion to official status: the public result uses a
producer-declared link role and `producer-declared` assertion status unless the
application independently performs a narrow, deterministic normalisation. An
exact federated record reports source authority as “Not independently
established”, and the human interface displays the recorded link destination
hostname so a person can inspect where the link goes.

No standalone UK Legislation collection, payload, index or runtime request is
included. Three standalone Land Registry legislation rows are quarantined, and
the searchable projection contains zero `legislation.gov.uk` result links. The
locked snapshots still retain 28 source-authored cross-reference strings as
inert, untrusted metadata: 6 in A Life in the UK, 3 in ONS, 2 in UK Government
APIs and 17 in Land Registry. Literal source-byte exclusion is therefore not an
architectural claim.

The four collections are not trusted merely because their aggregate totals
balance. One ordered executable contract binds source/quarantined/searchable
counts as 9,757/0/9,757 for A Life in the UK, 5,097/0/5,097 for ONS,
41,598/0/41,598 for UK Government APIs and 2,203/3/2,200 for HM Land Registry.
The same validation boundary fixes each admission's title, ordered
supplementary counts, completeness statement and first limitation before the
human display uses them. A co-digested redistribution or contradictory display
claim fails closed.

## `0.4.0-rc.1` presentation overlay

Version 0.4 changes presentation and page-tool choreography without adding a
model, source, runtime official-API call, catalogue copy or storage layer:

```text
validated reviewed or federated action result
                    |
                    v
pure BeginnerPresentation projection
  |-- closed evidence tier and source role
  |-- supported statement and complete limitations
  |-- cannot-decide and next-check boundaries
  |-- canonical accepted input or null on restoration
  `-- underlying result digests
           |                         |
           | same object             | same object
           v                         v
Evidence answer renderer       present_resource_evidence result
  |-- DOM and textContent only        sixth imperative page tool
  |-- validated recorded link         readOnlyHint: false
  `-- no AI transcript                untrustedContentHint: true
           |
           v
persistent Evidence answer <-> Technical review navigation
```

The persistent switch uses ordinary links rather than an ARIA tab widget. This
follows GOV.UK guidance that tabs are not page navigation and may hide content,
uses the service-navigation pattern only as semantic guidance, and keeps sticky
navigation from obscuring keyboard focus in line with WCAG 2.2 Focus Not
Obscured (Minimum). [G22; G23; A03]

The empty version 0.4 route selects Evidence answer. A legacy record, answer,
claim or comparison fragment selects Technical review so released deep links
retain their meaning. A WebMCP presentation updates the deterministic Evidence
answer in place but must not change the active view, fragment, history, focus or
scroll, and it does not replace the Technical review's currently rendered
record or provenance. An explicit human result selection updates bounded
history only after that presentation wins the latest-started transaction and
commits. One sequence covers explored answers, comparisons and record
presentations, including reviewed projection work that finishes asynchronously.
An older call may still receive its deterministic return value, but cannot
replace the latest page selection. The composite action has an eight-second
deadline; timeout, failure or cancellation retains the previous answer and
cannot expose partial evidence.

The current `0.4.0-rc.1` release-hardening worktree contains this projection,
composite action, sixth tool, bounded router, renderer, shared mounts and
controller integration. The build-integrated audit covers all 80 reviewed and
58,652 federated records using production result builders, the production
projector and the closed presentation schema. The latest prepared unit suite
passes 398 of 398. The most recent complete version 0.4 browser suites pass 43
of 43 in installed Chrome and 43 of 43 in installed Edge. The settled
deterministic check produced two identical 1,883-file, 128,653,230-byte builds
at aggregate SHA-256
`cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
Frozen code-snapshot security scan `aedf88e3-6a77-46af-be6b-2c672001dd46`
completed 36 of 36 items, ran 102 focused tests and found zero findings for its
named snapshot. The version 0.4 Safari and VoiceOver Caption Panel observation
completed with 6 passed and 3 limited checkpoints; it is a non-continuous
screenshot sequence without speech audio and does not establish WCAG
conformance. A dated, historical pre-hardening observation completed six-tool
Chrome capture and a labelled receipt reconstruction against commit
`a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`; it is not evidence for the
hardened source tree or a later tag. The diagram is not release evidence.

Sealed post-fix working-tree scan `185ce6fa-a47f-4c5e-9888-c63a9f932205`,
snapshot
`codex-security-snapshot/v1:sha256:012c0b4bb3e60271f8d60fca9475976a473ac0a267f87354810e51c2d575c0ad`,
subsequently completed all 33 selected executable-source items with complete
configured coverage and zero reportable findings. It is historical after the
subsequent release-evidence implementation changes; final security review for
the exact candidate remains a separate gate.

The first pull-request validation of the release-hardening branch, run
`33593265033` and job `100131452398`, failed before integration. A clean runner
exposed four portability and preservation problems: one demonstration-video
test tried to load an ignored raw Chrome fixture during module initialisation;
two identity-swap tests assumed APFS inode behaviour that Linux does not
guarantee; and WebMCP evaluation-patch backup clean-up trusted a recycled
device/inode pair. The corrected test reconstructs the historical fixture from
tracked reviewed evidence as exactly 133,272 bytes with SHA-256
`2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`.
Validated clean-up and rollback now recheck exact bytes and mode as well as file
identity. These corrections pass the 398-test prepared unit suite locally;
protected integration has not yet passed.

Independent follow-up review found and corrected two further local release
risks. Evidence staging now normalises a restrictive process umask to the exact
requested file mode through the already opened, no-follow file descriptor
before validating bytes, identity and permissions; mode drift after that
descriptor-bound correction fails closed. The no-argument VoiceOver clip
builder now resolves the canonical exact
`v0.4.0-rc.1-capture-manifest.json` path instead of the obsolete unversioned
manifest. The focused post-fix set passes 116 of 116 and the prepared unit suite
passes 398 of 398. Local automated verification is complete; protected
integration, deployment and exact-candidate security and manual evidence remain
pending.

Personal-agent captures are untrusted observations, not their own execution
oracle. When an exact call trace is observable, the verifier copies the
receipt-bound `dist` bytes into a private, manifest-verified snapshot, loads the
compiled production runtime under a unique module identity and confines replay
caches to that one validation. Captured outputs must equal the replayed outputs,
and page parity is derived from the replay rather than from a captured
self-digest. The snapshot, working build and clean exact Git identity are
rechecked after replay. Marker checks
decode bounded percent and HTML representations, normalise Unicode, fold case
and ignore separator variation. The public summary retains counts and fixed
product classes but neither free-text host or browser values nor hashes of
those values. It may retain safe observation dates, fixed product classes,
bounded Chromium versions, fixed tool-name sequences and deterministic
selection/digest pairs. A Copilot observation must bind visible Microsoft Edge
and an observed canonical Copilot share link; the link remains private. A
claimable answer judgement requires human or domain-specialist review. Page
observations require literal `null` history state and empty local and session
storage; local runs additionally require the exact credential-free loopback root
URL with no query or fragment.

Media admission does not convert a failed local evaluation into a successful
host demonstration. The cloud Copilot scene still requires genuine visible
Microsoft Edge MCP Workspace media, a Site-tool invocation, an Evidence answer
update and owner-human review. The local Ollama scene instead uses a generated,
visibly labelled diagnostic receipt visualisation. Its executable closed
contract independently replays all 36 private runs, matches the tracked public
summary, binds both source-byte digests and the exact model inventory digest,
and retains failed, unobserved and unreviewed states. It cannot claim a host
recording, page update, live-release parity or safe local answers. The complete
72-run and release-authentication gates below remain unchanged.

Exact-release receipt paths are defined once in the canonical release-evidence
path module. The live verifier always stages
`.evals/live-artifact-verification-v0.4.0-rc.1.json` as mode `0600`. With the
explicit private-staging option it writes identical bytes to
`.evals/personal-agent-media/v0.4.0-rc.1/live-pages-verification.json`, also as
mode `0600`; with the separate public-admission option it may write the reviewed
copy at
`docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json` as mode
`0644`. These one to three outputs are admitted in one recoverable transaction.
The private and reviewed destinations each have an independent explicit
overwrite gate. A release operator must use the verifier's staging action and
must not manually copy the receipt. Replacing the private release receipt
invalidates the dependent supported-host and media evidence, which must then be
recaptured against that receipt.

Supported-host evidence has three deliberately separate layers: an ignored
mode-`0600` raw Chrome DevTools receipt, a tracked reviewed Chrome projection
and a tracked supported-host projection. One recoverable admission transaction
writes all three or restores the previous set. Public admission is allowed only
for the fixed public target with an exact expected commit; replacing the raw
receipt and replacing reviewed evidence are separately explicit operations.
The supported-host projection binds both source artefacts by path, byte size and
SHA-256. Final-video preflight validates the six published input and output
schemas, every canonical result digest, the complete presented-evidence digest,
the tracked reviewed projection and its exact `v2` live Pages receipt before
using a labelled receipt reconstruction. Every consumer must also receive a
fresh process-local authenticated live receipt, match its observation-
independent binding to both stored receipts and derive release claims from the
authenticated object. Supported-host capture also requires the ordered
`initial`, `after-page-load` and `after-execution` deployment observations to
agree on the exact deployment identity and to enclose the host execution. A
stored, copied, mutated or merely well-shaped receipt cannot satisfy that
process-local authentication. Release-specific commit, run, deployment,
artefact and browser/runtime version values are observation inputs, not values
compiled before deployment: the configured commit/run, freshly verified
deployment, authenticated receipt and both projections must agree exactly.

The media pipeline uses one transactional output-placement component for live
interaction clips, supported-host and Ollama visualisations, and the four final
video outputs. Failure before every pending output is promoted removes partial
new files and restores all backups. Backup clean-up is a separate post-commit
phase: if it fails, the complete new outputs remain in place and the error
identifies committed outputs and any recoverable backup paths.

VoiceOver assurance remains a manual observation, but the final-video build no
longer trusts only the already-rendered clip. It revalidates the closed capture
manifest, exact environment and limitation statements, nine unique ordered
frame paths and digests, capture interval and hold duration, then checks every
frame as a bounded regular non-symbolic file. This byte binding does not turn
one screenshot sequence into continuous footage or WCAG conformance.

Release authentication is also separate from structural receipt validation. A
raw receipt-shaped object cannot open the evaluation claim gate. The verifier
must freshly re-observe the named GitHub Pages artefact and every live byte,
then bind the local `dist` manifest to the Pages product commit. Ordinary
evaluation authentication still requires a clean checkout at that exact
commit. Receipt v2 fixes the work budget at a 256 MiB archive, 4,096 regular
files, 512 directories, 192 MiB of regular-file data, 8 MiB per file, 8
concurrent live fetches, 60 seconds per file and 10 minutes for the whole
comparison. These controls are implemented and unit-tested locally. Their
release status is established only by protected integration and a fresh
authenticated deployment receipt for the exact product commit; it is not
inferred from this document.

Only final-video personal-agent admission may authenticate from a clean,
reviewed evidence descendant while the page runtime remains pinned to its
ancestor Pages product commit. The policy admits only `A` or `M` changes: inert
`.md`, `.csv` and `.vtt` files under `docs/`, reviewed evidence JSON, the
approved top-level documentation files, and the exact version 0.4 VoiceOver
manifest, nine frame images and clip. It rejects a dirty checkout, a product
commit that is not an ancestor, deletes, renames, copies, type changes,
non-canonical paths and any code, workflow, package or other page-runtime
change. NUL-delimited Git output is parsed as strict UTF-8, and both `HEAD` and
the exact admitted change set are pinned and rechecked through authentication
and replay.

Final-video personal-agent admission performs that authentication in-process,
replays the exact 72-run capture within the retained pre-run/fresh-observation
window, exact-compares the supplied summary and disposes the authentication. A
dirty unbound diagnostic cannot supply the local half. Any claimable local half
must contain 36 slots captured after the exact product deployment from either
the product checkout or the admitted clean evidence descendant; the receipt
records whether that condition has been met. Integration, exact deployment,
live host capture, release VoiceOver capture, final video and tagging remain
pending.

## Authored and generated boundaries

The frozen pre-federation release has four source-lock registry entries. The
federated release has five: the same four reviewed inputs plus
`okf-federation:public-pages-2026-08-30`, which binds the project-authored
four-publication federation lock. A registry entry binds an expected
identifier to one exact repository path, item count and SHA-256 value. The
validator rejects extra or duplicate entries, path swaps, count changes,
directories, symbolic links and a file that changes while it is being opened.

The generators produce the catalogue and receipts, the Evidence Trace
collection, the corpus-admission manifest and the federated search plane. They
do not change the authored sources. The `0.4.0-rc.1` contract has 36 closed JSON
Schemas covering the authored, generated, input and output contracts; historical
`v0.3.0-rc.1` had 31. At runtime, the page checks
the 10 initial same-origin files — five roots and five SHA-256 sidecars — then
checks their closed structure, internal digests and bindings. An initial-root
failure leaves the human fallback error visible and prevents every tool from
registering: five in `v0.3.0-rc.1` or six in `0.4.0-rc.1`.

The `0.4.0-rc.1` contract adds five closed schema files for beginner presentation,
presentation input/output, personal-agent cases and private evaluation captures
without changing the five runtime root artefact families. If the same roots and
their semantic bindings validate, it registers six fixed tool definitions or
none. The schema count and focused registration path pass the settled source-tree
checks. Merge, deployment, host and tag status must still be established from
their own authenticated records rather than inferred from this architecture.

The corpus-admission manifest records `sourceOkfCore` separately from
`targetOkfCore`. The target is OKF core 0.2 for every admission; the source may
be 0.1, 0.2 or undeclared. A crosswalk or descriptor records an assessed
relationship only. It does not by itself admit, copy or make a producer payload
searchable. The released manifest has 6 searchable
admissions: 2 reviewed deep-evidence collections accounting for 80 records and
4 federated source-snapshot collections accounting for 58,652 searchable
records from 58,655 locked raw rows. Three Land Registry legislation rows are
quarantined. The other 4 admissions remain non-searchable. The release has 10
admissions, 5 source-lock entries and 31 schemas.

The four-source OKF lock binds exact collection identity, publication base,
revision or observed deployment bytes, snapshot, descriptor, data and search
manifests, artefacts, counts, digests, rights, access and resource budgets. Its
73 versioned gzip artefacts total 13,021,675 bytes. Each exact reviewed stored
representation is digest-pinned and preserved; the builder does not recompress
it. Bounded gunzip validates the locked decoded length and SHA-256 digest, and
the importer requires those decoded bytes to equal the newly fetched raw source
bytes. This avoids treating host-specific Mac/Linux compression output as the
evidence contract while retaining the checksum-bound snapshot. The builder
creates 1,853 ignored shard files — 120 record shards and 1,733 postings shards
— plus the manifest and checksum sidecar, for 1,855 files and 127,747,020 bytes
in total. The plane is included in the validated Pages artefact and is not
committed as authored source. Only
declared files are projected to same-origin paths. A source-snapshot record
retains those bindings but does not gain the reviewed tier's item-level
receipt.

The page loads only the federated manifest and checksum at start-up. A query
then requests checksum-bound postings and only the record shards needed for
its bounded result. Every collection status reports deterministic
`verifiedShardFiles` and `verifiedShardBytes` counters. A bad lazy shard marks
that collection unavailable while the reviewed tier and other valid
collections remain usable; no external or source-origin fallback is attempted.

Logical calls and physical shard work have separate admission boundaries. At
most 4 physical loads are active, 32 wait and 36 distinct files are in flight.
The file's fixed 3-second deadline begins before queueing and its physical slot
remains occupied until the underlying loader actually settles. Cancellation
therefore cannot multiply physical work. Queue or immediate pre-loader deadline
expiry returns a scheduler-busy result rather than a source-corruption result.
If four non-cooperative loaders never
settle, they can retain every slot and leave federation loading unavailable;
the runtime fails closed rather than admitting a fifth load.

## Evidence-first interaction

In released `v0.3.0-rc.1`, the worked answer opens on a text-first analytical index. The visual Evidence
Trace is a progressive explanation of the same data. Each node keeps eight
facets separate: authority, assertion status, verification, freshness,
integrity, access, rights and coverage. Comparison preserves those fields and
the linked limitations; it never produces a combined trust score.

Human controls and WebMCP calls pass through one action controller. Search,
exact-record and provenance calls are read-only. Evidence exploration and
comparison have `readOnlyHint: false` because they can update the page's
current selection and comparison. That effect is reversible and held only in
memory: it does not change the catalogue, browser storage, network or external
state.

The controller and every action-specific validator inspect caller-owned root
and array descriptors before reading values. Executable validation is
deliberately stricter than JSON Schema: it copies only allowed own enumerable
string data properties from ordinary plain objects and only dense,
canonical-index data items from arrays. Symbols, non-enumerable properties,
accessors, sparse arrays and extra array properties fail closed without invoking
a getter. Rejected exotic or over-budget input is not included in the diagnostic
input digest.

In the `0.4.0-rc.1` contract, Evidence answer becomes the bare-route view and
Technical review retains that released analytical interface. Both consume the
same controller results. The sixth action has the same reversible-presentation
boundary as the two exploration actions, while the three discovery queries
remain read-only. The page still cannot inspect or validate the host AI's final
prose.

## Runtime and service boundary

The page makes no runtime call to GOV.UK, an OKF producer, an operational data
provider or a model provider. The federated release loads only generated
same-origin static search assets from the fixed
`data/federated-search/` namespace, with credentials omitted and redirects
rejected. Response bodies are consumed incrementally under the fixed byte cap;
strict `Content-Length`, missing-body, empty-body and streamed-overflow checks
fail closed. The static host can observe ordinary and query-derived asset
requests.
Packaged evidence receipts describe the static build; tool calls do not create
a durable receipt. This prototype does not implement or claim a durable MCP
gateway, provider execution, authentication, service operations or an access
decision. Authoritative human URLs and limitations remain the route for
checking source information.

## Personal-agent boundary

The intended division of responsibility is that the public body publishes a
small, inspectable set of page tools while the citizen selects the browser host
and any model that uses them:

```text
citizen and permitted personal context
                |
                v
citizen-selected host and model
  |             |
  |             +---- optional remote model provider
  |                   (may receive prompts, tool metadata, inputs and outputs)
  v
browser calls a bounded page tool
                |
                v
same-origin validated bundle -> deterministic, source-linked result
```

The static government page does not host a model and its schemas do not request
an identity, profile, location history, unrelated conversation or other
general personal context. A citizen's agent may use context it is permitted to
hold to choose a tool and formulate the smallest valid input. The schema has no
dedicated personal-context field, but its bounded free-text search field can
still carry personal details if a person or host puts them there. The page
contract reduces what it asks for; it cannot make user-entered free text
private or govern what the host sends to a remote model provider.

That page boundary is not a claim that every agent arrangement is local or
private. The citizen-selected host can observe the page, tool definitions,
inputs and results. If it uses a remote model provider, those items and relevant
prompt context may be sent to that provider under its own terms. A correctly
configured local model can keep model inference on the citizen's device, but
ordinary requests for the static page still reach its host and local software
may retain logs. The proposed reduction in government-hosted AI cost and data
collection is a hypothesis for measurement, not a demonstrated saving. Better
questions, improved privacy and improved answer quality are separate
hypotheses, not consequences inferred from the architecture.

## Independent assurance boundary

Native browser developer tools, Microsoft WebMCP Explorer, Chrome DevTools MCP
and `webmcp-evals` provide complementary development evidence. They are not
part of the deployed static application and none is, by itself, proof of the
whole architecture. Manual inspection tests discovery and invocation;
Chrome DevTools MCP tests an independent automation path; model-free
`webmcp-evals` smoke tests check deterministic browser execution; and a
separately identified model-backed run can test tool selection.

For the historical corrected public deployment, the first and third layers were
observed separately: Chrome 152's native WebMCP panel completed all five valid
calls and displayed a structured invalid-input result, while Chrome DevTools
MCP 1.8.0 completed the same five-tool public journey with zero console errors.
Both are deterministic host-execution evidence. Microsoft Explorer and a
passing fixed-model selection result remain deliberately open. Five local
model attempts are retained separately as failed variance evidence rather than
being inferred from deterministic host execution. The first three predate
receipt v2. Attempt 4 bound stable identity but retained a null evaluation after
structural validation failed; attempt 5 retained 30 pass and 6 fail across 36
reported rows and failed `verify-reports`. Separately, Codex In-app Browser
(Browser plugin `26.825.32147`) discovered and executed all five tools against
public `v0.3.0-rc.1`, rejected an unrelated `personalContext` field and matched
the displayed comparison digest. This is deterministic host-invocation
evidence, not a host-owned recording, a model-selection result or a general
compatibility claim.

Attempts 4 and 5 used receipt v2: the exact
selected identity from `/api/tags` before and after evaluation must match the
daemon-reported loaded identity from `/api/ps` afterwards. That is post-run
daemon evidence, not cryptographic proof that an individual response came from
particular weights. Privileged local-account or model-service control remains
outside the receipt's trust boundary, as do tag changes between observations
and a model that was already loaded. Redirects, incomplete `name`/`model`
identities and `remote_model` or `remote_host` markers fail before evaluation,
so an Ollama-labelled cloud proxy must use the explicit remote-provider path.

These harnesses operate only against the public synthetic fixture in an
isolated browser profile with no unrelated tabs, saved credentials or personal
extensions. Exact tool and harness versions, browser build, page revision and
model location belong in each receipt. Credentials, cookies, personal prompts
and unredacted headers do not. Raw reports remain local until reviewed because
they can contain prompts, tool metadata, arguments, results, console output and
page URLs; retained submission evidence is sanitised, checksummed and bound to
the exact tested revision.

For `0.3.0-rc.1`, the A–M matrix adds source allowlisting, semantic mutation,
progressive-budget, deterministic-ranking, four-producer, evidence-shape,
partial-failure, context-minimisation, injection/resource, repeated fixed-model,
accessibility, whole-system-cost and release-binding gates. Local production
build, byte-idempotence, 144 unit tests, 29 Chrome tests, 29 Edge tests and six
model-free smoke calls were observed at the last complete pre-remediation
checkpoint. The unit run completed in 174.5 seconds. Seven initial Low security
findings were remediated; sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and found one
further High-confidence Low URL bypass, fixed post-snapshot. Focused security
checks passed 119 of 119 and the affected post-fix subset passed 23 of 23. The
scan's mechanically partial and stale-pending coverage and the post-snapshot
fix kept the immutable rescan open at that checkpoint. The later research,
build/data, lexical-quality, Chrome, Microsoft Edge and authorised model-free
smoke gates pass where recorded; `npm run test:unit:prepared` passed 173 of 173 in
`17128.154916 ms` before the latest three engineering remediations. Immutable
scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` then completed 50 of 50 review
items, dynamically reproduced mutable model identity, aggregate-only
per-source population binding and cancellation-driven physical-work
amplification, and classified zero as reportable vulnerabilities after attack-
path analysis. The defects were remediated nevertheless.
The exact post-remediation `v0.3.0-rc.1` local chain passes research 4 of 4;
build/data
validation with 80 reviewed records and 80 receipts, 58,655 raw rows, 3
quarantined rows, 58,652 searchable rows, 120 record shards and 1,733 postings
shards; 194 of 194 prepared unit tests; 30 of 30 tests in both Chrome and Edge;
six of six model-free WebMCP smoke calls in real Chrome; zero npm-audit
vulnerabilities across 162 total dependencies; and a clean `git diff --check`.
The frozen lexical result is mean nDCG@10 `0.984698009`, Recall@20 `1`,
cold/warm parity, no legislation collection and rejection of a legislation
request. Exact-range scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` completed 55
of 55 review items and retained one Low co-digested source-substitution finding.
Separately code-reviewed pins for all five source files, a direct builder lock-
byte check and mutation regressions remediate it. Fresh immutable scan
`040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 review items against
the fixed `v0.3.0-rc.1` product with zero reportable findings. Its sealed scope
predates
the reviewed-gzip and referenced import-deadline CI portability corrections;
focused mutation and deadline regressions plus the protected release path
evidence those deltas separately. Pull-request validation `33356087333`,
protected-main validation `33356272534` and Pages run `33356452048` passed,
and the annotated `v0.3.0-rc.1` tag and five-tool supported-host observation
bind that released product. The `v0.3.0-rc.1` VoiceOver journey
and local final-video technical review are complete under the limitations above.
A passing fixed-model evaluation remains optional. The retained
`v0.3.0-rc.1` evidence records owner playback, privacy, branding, rights and
synthetic-voice publication review, public upload and player verification, and
Devpost submission as open at its observation date. No historical pre-
federation browser, accessibility, video or host receipt is carried forward as
proof of `v0.3.0-rc.1` evidence.

An earlier `v0.3.0-rc.1` final-candidate demonstration preflight correctly
failed closed without a deployed commit and explicit overwrite approval. It did
not start live capture and is not live-capture evidence.
