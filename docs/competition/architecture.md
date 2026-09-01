# Static competition architecture, federated release and Evidence answer candidate

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
regular files to Pages artefact `9745316971`. One current supported host then
discovered and executed all five page tools; no model selected a tool and no
model provider was called:

A separate current-release manual Safari and VoiceOver journey completed with
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

## Unreleased `0.4.0-rc.1` presentation overlay

The candidate changes presentation and page-tool choreography without adding a
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

The empty candidate route selects Evidence answer. A legacy record, answer,
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

The current worktree contains this projection, composite action, sixth tool,
bounded router, renderer, shared mounts and controller integration. The build
audits all 80 reviewed and 58,652 federated records using production result
builders, the production projector and the closed presentation schema. The
prepared unit suite passes 272 of 272, and the complete candidate browser suites
pass 43 of 43 in installed Chrome and 43 of 43 in installed Edge. The offline
double build passes at 1,883 files, 128,646,550 bytes and aggregate SHA-256
`3d8a46a18ec056190d41e29b825f9f79beae15463c3922d4a8bfcacab7f7094b`.
Frozen code-snapshot security scan `aedf88e3-6a77-46af-be6b-2c672001dd46`
completed 36 of 36 items, ran 102 focused tests, found zero findings and
concluded that there is no security release blocker. Candidate-specific manual visual, Safari, VoiceOver and Caption
Panel observations and host verification remain pending. Automated checks do
not establish WCAG conformance. The diagram is not release evidence.

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

Release authentication is also separate from structural receipt validation. A
raw receipt-shaped object cannot open the evaluation claim gate. The verifier
must freshly re-observe the named GitHub Pages artefact and every live byte,
then bind an exact clean checkout and local `dist` manifest to the same commit.
Receipt v2 fixes the work budget at a 256 MiB archive, 4,096 regular files, 512
directories, 192 MiB of regular-file data, 8 MiB per file, 8 concurrent live
fetches, 60 seconds per file and 10 minutes for the whole comparison. These
controls are implemented and unit-tested locally; protected integration and an
authenticated candidate deployment remain unobserved.

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
do not change the authored sources. Thirty-one closed JSON Schemas cover the
authored, generated, input and output contracts. At runtime, the page checks
the 10 initial same-origin files — five roots and five SHA-256 sidecars — then
checks their closed structure, internal digests and bindings. An initial-root
failure leaves the human fallback error visible and prevents all five tools
from registering.

The candidate adds five closed schema files for beginner presentation,
presentation input/output, personal-agent cases and private evaluation captures
without changing the five runtime root artefact families. If the same roots and
their semantic bindings validate, the candidate registers six fixed tool
definitions or none. The schema count and focused registration path pass local
candidate checks; complete release verification remains open.

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

In the `0.4.0-rc.1` candidate, Evidence answer becomes the bare-route view and
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
hold to choose a tool and formulate the smallest valid input. Only that bounded
input reaches the page tool; the wider context is neither required nor accepted
by the page contract.

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
the displayed comparison digest. This is current deterministic host-invocation
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
The exact post-remediation local chain now passes research 4 of 4; build/data
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
the fixed candidate with zero reportable findings. Its sealed scope predates
the reviewed-gzip and referenced import-deadline CI portability corrections;
focused mutation and deadline regressions plus the protected release path
evidence those deltas separately. Pull-request validation `33356087333`,
protected-main validation `33356272534` and Pages run `33356452048` passed,
and the annotated `v0.3.0-rc.1` tag and current five-tool supported-host
observation bind the released product. The current-release VoiceOver journey
and local final-video technical review are complete under the limitations above.
A passing fixed-model evaluation remains optional; owner playback, privacy,
branding, rights and synthetic-voice publication review, public upload and
player verification, and Devpost submission remain open. No historical pre-
federation browser, accessibility, video or host receipt is carried forward as
proof of the current-release evidence.

An earlier final-candidate demonstration preflight correctly failed closed
without a deployed commit and explicit overwrite approval. It did not start
live capture and is not live-capture evidence.
