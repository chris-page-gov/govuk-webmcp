# Static competition architecture and federated release

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

The worked answer opens on a text-first analytical index. The visual Evidence
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
observation bind the released product. A passing fixed-model evaluation, the
refreshed current-release VoiceOver journey, final video, owner review,
public-player verification and Devpost submission remain open. No historical
pre-federation browser, accessibility, video or host receipt is carried
forward as proof of those open gates.

An earlier final-candidate demonstration preflight correctly failed closed
without a deployed commit and explicit overwrite approval. It did not start
live capture and is not live-capture evidence.
