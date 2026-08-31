# 8. Implemented baseline and federated WebMCP candidate

## 8.1 Human-agent shared page

The published `v0.2.0-rc.1` release is an 80-record, 80-receipt static
application. Its
primary view is a worked evidence-first answer, not a search box or a generated
narrative. The page presents:

1. an independent-prototype banner and verified artefact summary;
2. a text-first analytical index for the one packaged Evidence Trace;
3. a progressive visual Evidence Trace over the same deterministic data;
4. a selected-foundation view with eight separate facets;
5. a score-free comparison of two to four exact claims;
6. an evidence-estate table for 10 corpus admissions; and
7. the 80-record catalogue search, record and provenance journey.

The eight facets are authority, assertion status, verification, freshness,
integrity, access, rights and coverage. They remain separate in the index,
trace, selected-foundation view and comparison. The application does not
calculate or imply a combined trust score.

Package version `0.3.0-rc.1` is an implemented local extension, not a released
host observation. It keeps the 80 reviewed records and adds a distinct
`federated-source-snapshot` tier from exactly four locked OKF publications:
9,757 A Life in the UK records, including 293 service families; 5,097 ONS
metadata records; 41,598 UK Government APIs records; and 2,203 HM Land
Registry public-estate metadata rows. Their raw 58,655-row sum is before cross-
source deduplication. Exactly three standalone Land Registry legislation rows
are quarantined, leaving 2,200 searchable Land Registry records and 58,652
searchable federated records overall. There is no standalone UK Legislation
collection, payload, index or runtime request, and the searchable projection
contains no `legislation.gov.uk` result link. Twenty-eight source-authored
cross-reference strings remain as inert, untrusted metadata in the four locked
snapshots.

The candidate binds each collection separately as
source/quarantined/searchable records: 9,757/0/9,757 for A Life in the UK,
5,097/0/5,097 for ONS, 41,598/0/41,598 for UK Government APIs and
2,203/3/2,200 for HM Land Registry. The same executable contract validates each
collection's title, ordered supplementary counts, completeness statement and
first limitation before the human evidence-estate display uses them. A co-
digested redistribution or contradictory population statement fails closed.

WebMCP is progressive enhancement. The human interface remains usable when
`document.modelContext` is absent, registration is blocked or registration
fails. Instrumented browser tests prove the page contract and human-tool parity;
they do not prove discovery or execution by a live agent host.

## 8.2 Five fixed tools

| Tool | Purpose | Input bound | Page effect | `readOnlyHint` |
|---|---|---|---|---:|
| `search_government_knowledge` | Search 80 reviewed records and 58,652 searchable federated records from 58,655 locked raw rows | Query up to 160 characters; one to five fixed collections and other bounded filters; 1 to 20 results | None | `true` |
| `get_resource_record` | Return one exact reviewed or federated record | One reviewed or four-collection federated identifier up to 160 characters | None | `true` |
| `show_provenance` | Inspect one packaged reviewed receipt or federated snapshot chain | One reviewed or four-collection federated identifier up to 160 characters | None | `true` |
| `explore_answer_foundations` | Select the worked answer or one exact claim | One answer ID; optional claim ID, each up to 96 characters | Reversible in-memory selection | `false` |
| `compare_evidence_foundations` | Compare two to four claims from the worked answer | One answer ID and 2 to 4 unique claim IDs | Reversible in-memory comparison | `false` |

All five tools have `untrustedContentHint: true`, closed input schemas and fixed
names, titles and descriptions. Source-derived strings never become tool names
or instructions.

The candidate does not add a general question-answering tool. It extends
`search_government_knowledge`, `get_resource_record` and `show_provenance` over
the fixed evidence tiers while leaving the two Evidence Trace presentation
tools within their existing answer-pack scope. Search can name one to five
allowlisted collections: `deep-evidence`, `uk-living`, `ons`,
`government-apis` and `land-registry`. It cannot supply an origin, URL or
arbitrary collection name.

### Tool 1 — `search_government_knowledge`

**Title:** Search government knowledge

**Current description:** Search 80 reviewed records and 58,652 searchable
records from 58,655 locked raw rows in four checksum-bound OKF source snapshots.
Three source rows are quarantined. Returns the evidence tier, source-link role,
access, rights and limitations. It accepts no personal profile and calls no
official or model-provider API.

**Input:** `query`; optional `resourceTypes`, `publishers`, `accessStatuses`,
`collections` and `limit`. The query is limited to 160 characters, publisher
arrays to 8 values, collections to 1 to 5 unique allowlisted values and output
to 20 records. Unknown fields are rejected.

**Output:** a successful current-candidate search is
`trusted-govuk-discovery.search-result.v2`. It returns selected collections,
separate reviewed and federated estate counts and digests, exact or lower-bound
total semantics, tiered summaries, per-collection availability and
deterministic `verifiedShardFiles` and `verifiedShardBytes` counters. Reviewed
summaries retain item-level receipt IDs; federated summaries retain snapshot,
source-file and link-role evidence without gaining a receipt. The published
union also retains the historical v1 success contract and the common closed
error contract.

**Human equivalent:** the search form and result list. Both call the shared
action controller, although a read-only WebMCP query does not change the page
selection.

**`0.3.0-rc.1` implementation:** search returns a common bounded summary
with evidence tier, collection, snapshot, source-native identifier, link role,
integrity basis and limitations. The 80 reviewed records retain their item-
level receipts. Federated records retain source-file and snapshot evidence but
do not gain those receipts. Collection-level partial failures are explicit.

### Tool 2 — `get_resource_record`

**Title:** Get a government resource record

**Current description:** Return one exact reviewed or federated record with its
assurance tier, source link, access, licence, assertions and limitations. A
federated result is snapshot-bound, not item-reviewed, and grants no access
authority.

**Input:** exact `recordId` matching the closed catalogue identifier pattern.
There is no fuzzy identifier resolution.

**Output:** an explicit union of the historical reviewed
`trusted-govuk-discovery.resource-record-result.v1`, the federated
`govuk-webmcp.federated-resource-record-result.v1` and the common closed error
contract. Federated success reports snapshot-file integrity, exact record and
shard digests, no related-record inference, no item-level review or receipt and
the page, API and access boundaries. It reports source authority as “Not
independently established”, preserves the producer-declared link role and
exposes the recorded destination hostname to the human interface.

**Human equivalent:** **View record and provenance** on a result.

The candidate admits only exact generated federated identifiers tied to the
four collection IDs and a bounded ordinal. It does not fuzzy-resolve a source
identifier or treat a source-snapshot result as reviewed deep evidence.

### Tool 3 — `show_provenance`

**Title:** Show record provenance

**Current description:** Inspect either an item-level reviewed receipt or the
file, snapshot and manifest bindings for a federated record. It does not refetch
an official source or independently certify it.

**Input:** exact `recordId`.

**Output:** an explicit union of the historical reviewed
`trusted-govuk-discovery.provenance-result.v1`, the federated
`govuk-webmcp.federated-provenance-result.v1` and the common closed error
contract. Federated provenance returns snapshot, revision, deployment,
source-file and manifest bindings and states that neither item-level review nor
an evidence receipt is available.

**Human equivalent:** the provenance and receipt section of the exact record
view.

For a federated record, the candidate returns the collection, revision,
snapshot, source path and source-file digest and explicitly states that no
item-level receipt exists. The recorded source link may be producer-declared or
may be absent; the interface must not relabel every link as authoritative.

### Tool 4 — `explore_answer_foundations`

**Title:** Explore answer foundations

**Current description:** Select one bounded evidence-first answer or one of its
exact claims and update this page's analytical index and Evidence Trace. The
only effect is reversible in-memory presentation; no source, storage or
external state changes.

**Input:** required `answerId` and optional `claimId`. Both use closed patterns
and a 96-character maximum.

**Output:** exact selection, the complete digest-bound Evidence Trace and
boundaries stating that there was no catalogue mutation, storage write,
provider call, external state change or single trust score.

**Why `readOnlyHint` is false:** the call may change which trace path and
foundation are visibly selected. It does not change source data or persistent
state.

**Human equivalent:** **Show foundations for claim** and the trace node
controls.

### Tool 5 — `compare_evidence_foundations`

**Title:** Compare evidence foundations

**Current description:** Compare two to four exact claims in one evidence-first
answer and update this page's accessible comparison. It does not rank sources
or change catalogue, storage, network or external state.

**Input:** required `answerId` and 2 to 4 unique `claimIds`. Unknown, duplicate,
malformed or out-of-answer identifiers fail closed.

**Output:** one row per claim, its authoritative source, all eight separate
facets, linked limitations, the complete trace and explicit effect boundaries.

**Why `readOnlyHint` is false:** the call opens a reversible in-memory
comparison and selects the matching trace paths.

**Human equivalent:** select claim checkboxes, then **Compare selected claims**.

## 8.3 Registration and shared execution

At this working-tree checkpoint the repository publishes 31 closed JSON
Schemas; recompute the exact contract count after the exact-tree rescan. The current search input and
successful v2 output, reviewed and federated record summaries, federated
manifest and shards, and reviewed/federated exact-record and provenance unions
are all checked against their executable counterparts.

The page registers tools imperatively with `document.modelContext.registerTool`
only after five same-origin artefact families have validated:

1. the catalogue and its checksum, including 80 record digests, safe official
   URLs and the bundle root;
2. the 80 receipts and their checksum, including one-to-one record, source and
   bundle bindings;
3. the one-trace Evidence Trace collection and its checksum, including graph,
   facet, source-record and digest bindings; and
4. the 10-entry federation manifest and its checksum, including admission,
   payload, semantic and catalogue bindings; and
5. the lazy federated-search manifest and its checksum, including the four
   collection identities, 58,655 raw source rows, 3 quarantined rows, 58,652
   searchable records, source-lock digest and every declared postings and
   record-shard identity.

The application registers all five fixed definitions or none. Local definition
checks reject duplicate names or an open schema. Registration has a three-second
timeout and a failed or blocked attempt withdraws the partial registration
lifetime while leaving the verified human interface available.

Human controls and tool callbacks call the same `KnowledgeActionController`.
The controller applies a cheap root-input budget before action-specific
validation, honours cancellation, hashes only admitted diagnostic input and
commits a presentation result only when the action allows it. This keeps the
structured tool result and the visible deterministic result aligned.

The candidate's build admission adds the fifth source-lock registry entry for
the digest-bound four-publication federation lock. The browser does not fetch
that authored lock: it receives the validated same-origin lazy-search manifest
as the fifth start-up artefact family. A start-up checksum, manifest, schema or
binding failure still prevents all registration. After a valid root is
established, a failed lazy collection is isolated and returned as explicit
source status while unaffected sources and the reviewed tier remain available.
Each collection status reports deterministic `verifiedShardFiles` and
`verifiedShardBytes` counters. This behaviour has local unit, Chrome and Edge
evidence but not current-candidate CI, deployed or supported-host evidence.

The execution-options argument is optional at the page-host boundary. Some
hosts, including the pinned Chrome DevTools MCP and `webmcp-evals` paths, invoke
a callback as `execute(input)` without a second object. The corrected product
therefore forwards an `AbortSignal` only when the host supplies one; the
ordinary cancellation path is unchanged. A browser regression invokes all five
tools with the execution-options argument omitted; the separate ignored Chrome
DevTools MCP receipt provides independent real-host evidence for all five. The
unchanged, checksum-bound `v0.2.0-rc.1` evidence predates this fix. The later protected-main
deployment includes it and has separate public-host receipts.

The current `ModelContextTool` shape uses `name`, `title`, `description`,
`inputSchema`, annotations and an execute callback. The repository publishes
closed output schemas for validation, but it does not register a non-standard
`outputSchema` property.

## 8.4 Source and federation boundary

The historical `v0.2` generation starts from four exact source-lock registry
entries: 69 GOV.UK content records, 11 curated government data and API records,
1 answer pack and 10 corpus-admission decisions. At this working-tree
checkpoint the candidate requires a fifth entry binding the exact four-
publication OKF federation lock. Registry
validation binds exact IDs, paths, item counts and SHA-256 values and rejects
symbolic links, non-regular files, path swaps and changed file identity.

The historical federation manifest contains 10 admissions: 2 searchable
deep-evidence collections and 8 that were described-only, conditional,
quarantined or contract-only. At this working-tree checkpoint the 10-entry
manifest has 6 searchable admissions — the same 2 reviewed collections and 4
federated source snapshots — and 4 non-searchable admissions. Recompute the
exact admission, lock and schema totals after the exact-tree rescan.
`sourceOkfCore` records the producer
declaration separately from the `targetOkfCore` 0.2 mapping. A descriptor or
crosswalk does not by itself admit, redistribute or make a producer payload
searchable.

The `0.3.0-rc.1` candidate admits exactly four previously governed OKF
publications into a separate source-snapshot search tier. It does not promote
the remaining admissions. The four locked populations total 58,655 raw rows
and remain separate from the 80 deep-evidence records. Three standalone Land
Registry legislation rows are quarantined, leaving 58,652 searchable records.
Land Registry contributes public-estate metadata only; no title, ownership,
address, polygon or personal row is admitted. UK Legislation contributes no
standalone collection, payload, index, total or runtime request, and any apex,
`www` or subdomain `legislation.gov.uk` result link fails projection. The 28
retained source-authored cross-reference strings cannot define a collection,
tool, instruction or network request.

The versioned input plane consists of 73 checksum-bound gzip artefacts under
`app/data/sources/okf-federation/`, totalling 13,021,675 bytes. The deterministic
builder creates 1,853 ignored shard files — 120 record shards and 1,733
postings shards — plus the manifest and checksum sidecar under
`app/data/federated-search/`: 1,855 files and 127,747,020 bytes in total.
Production builds validate and copy that plane to `dist` for Pages. The authored
gzip bytes and generated projection stay distinct.

At start-up the page loads the federated manifest and checksum, not every
record. Queries can fetch only declared files below the same-origin
`data/federated-search/` namespace, with credentials omitted, redirects
rejected, exact byte and SHA-256 checks and bounded file, byte, result-shard and
time budgets. Response bodies are read incrementally under the fixed byte cap;
strict declared-length, empty-body, missing-body and streamed-overflow checks
fail closed. There is no official-source, legislation or model-provider runtime
fallback.

## 8.5 Input, route and injection controls

- Inputs must be plain JSON objects with closed action-specific keys.
- A common pre-validation budget rejects more than 16 root keys, root keys over
  128 characters, accessors and complex diagnostic values before dispatch.
- Query, identifier, array and result bounds are repeated in executable code;
  JSON Schema is not the only control.
- Hash routes are limited before decoding; malformed or oversized record,
  answer, claim and comparison routes fall back safely.
- No input accepts a user URL, selector, callback, origin, endpoint,
  credential, personal detail, browsing history or arbitrary instruction.
- Federated search accepts only the five fixed collection values. The page
  schemas do not accept a profile, identity, location history, conversation
  history or general `personalContext` object.
- Reviewed authoritative links must be credential-free HTTPS URLs on admitted
  official hosts. Federated links must be credential-free HTTPS and retain
  their explicit producer-record, producer-declared-source or
  no-direct-authority-link role; producer text can never upgrade that role to
  official. Federated assertions use `producer-declared` unless a narrow
  normalisation is independently justified.
- Source text is rendered as inert text and returned as untrusted data; no HTML
  is returned to an agent.
- There is no page-side query storage, analytics, provider call or external
  runtime request.

## 8.6 Errors and assurance state

Stable errors distinguish invalid searches, records, provenance requests,
evidence selections, comparisons and missing exact identifiers. A checksum,
digest, graph, URL, source-lock or admission failure blocks registration rather
than manufacturing an unverified substitute.

The unchanged, checksum-bound `v0.2.0-rc.1` evidence remains bound to commit
`9235ee5db4df637bdb2a12e87449e871614afe68`. The corrected public deployment is
protected-main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`: exact-main
validation run `33323068982` and Pages run `33323152751` passed, and all 20 live
files matched the downloaded Pages artefact byte for byte. The release tree
also passed the installed Microsoft Edge suite before integration. The browser
suites include instrumented
five-tool registration, parity, cancellation, rollback, integrity failure,
bounded hash routes, inert source text, keyboard, reflow, forced-colour,
reduced-motion and axe smoke checks. On 30 August 2026, `Codex In-app Browser`
discovered and successfully called all five tools on the historical
`v0.2.0-rc.1` public deployment; the final comparison's canonical and displayed
result digests matched. This is a time-, revision- and host-specific
observation, not a general support claim. Manual
Safari and VoiceOver observation is separately recorded as completed with
limitations; it does not establish WCAG conformance or support in another
WebMCP host. On the corrected public deployment, Chrome 152's native Application
→ WebMCP panel separately listed all five tools, recorded five completed valid
calls and showed the structured `invalid_search_request` result for `limit: 21`.
The exploration and comparison calls updated the visible deterministic state;
the comparison rendered 11 facet rows and the displayed result digest matched
the canonical digest prefix. Chrome DevTools MCP 1.8.0 also completed all five
public-page calls and recorded zero console errors. Neither path selected or
contacted a model.

Those observations predate the federated candidate. They must not be cited as
evidence that the four new source snapshots load, rank, fail partially, remain
accessible or work through a supported host. The candidate requires fresh
model-free tests, repeated fixed-model runs and exact release binding under the
A–M plan.

The last complete pre-remediation `0.3.0-rc.1` checkpoint included a successful
production build, a byte-idempotent reconstruction of the federated plane, 144
of 144 unit tests in 174.5 seconds, 29 Chrome tests, 29 installed-Microsoft-Edge
tests and six of six model-free evaluator smoke calls. These checks covered all
four source journeys,
the search v2 and exact-record/provenance union contracts, manifest-first lazy
loading, same-origin requests, deterministic shard counters, failing each
federated source independently, partial failure,
input closure, human/tool parity and automated accessibility. The Edge run used
an authorised loopback-only exception after the sandbox produced the expected
`EPERM` socket error. Seven initial Low security findings were remediated
afterwards, including aggregate build budgets, per-row Land Registry policy, source-
revision consistency, partial-source isolation, producer-declared trust labels,
prototype-safe token keys and per-runtime in-flight fetch sharing. The fix also
rejects explicit URL ports in executable validation, not only the schema. The
sealed follow-up scan suppressed those seven and found one further High-
confidence Low trailing-dot and secondary legislation-URL bypass
(`csf_a2d9e030fda789ecd1cb0e41`), fixed post-snapshot. The scan has mechanically
partial and stale-pending coverage. Focused security checks passed 119 of 119
and the affected post-fix subset passed 23 of 23. The current research,
build/data, lexical-quality, Chrome, Microsoft Edge and authorised model-free
smoke gates pass where recorded. The full unit command passed 173 of 173 in
`17128.154916 ms` before the latest three engineering remediations. Immutable
scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` then completed 50 of 50 review
items, dynamically reproduced mutable local-model identity, aggregate-only per-
source population binding and cancellation-driven physical shard-work
amplification, and classified zero as reportable vulnerabilities under attack-
path policy. Working-tree remediations add exact per-source/display binding,
4-active/32-queued/36-distinct physical work limits and model receipt v2. The
exact post-remediation candidate now passes research 4 of 4; build/data
validation with 80 reviewed records and 80 receipts, 58,655 raw rows, 3
quarantined rows, 58,652 searchable rows, 120 record shards and 1,733 postings
shards; 190 of 190 prepared unit tests; frozen quality at mean nDCG@10
`0.984698009`, Recall@20 `1`, cold/warm parity, no legislation collection and a
rejected legislation request; 30 of 30 tests in both Chrome and Edge; six of
six model-free WebMCP smoke calls in real Chrome; zero npm-audit vulnerabilities
across 162 total dependencies; and a clean `git diff --check`. The immutable
exact post-remediation security rescan, protected CI, Pages, final tag and
release, current-candidate supported-host capture, a passing fixed-model
evaluation, refreshed manual screen-reader journey and video remain pending.

The final-candidate demonstration preflight correctly failed closed without a
deployed commit and explicit overwrite approval. It did not start live capture,
so no live host or video evidence is claimed.

## 8.7 Pinned local interoperability harnesses

The local toolchain separates deterministic execution evidence from model
selection evidence:

```bash
npm run python:setup
npm run research:verify
npm run webmcp:devtools:capture
npm run webmcp:eval:smoke
```

`requirements-dev.txt` pins `jsonschema` 4.26.0 and its resolved runtime
dependencies. `python:setup` creates or reuses repository-local `.venv`,
installs binary distributions without dependency resolution and runs
`pip check`. `research:verify` prefers that environment, rejects a different
`jsonschema` version and runs the preserved research-pack verifier. The exact
versions do not include distribution hashes, and a reused `.venv` can retain
unrelated packages, so this is not a clean or fully reproducible Python supply-
chain environment. The CI and Pages definitions install Node dependencies with
`npm ci --ignore-scripts --no-audit`; Pages also installs the version-pinned
Python requirements and runs semantic WebMCP smoke before deployment. These
paths passed for the protected integration and corrected Pages deployment.

`webmcp:devtools:capture` uses the exactly pinned `chrome-devtools-mcp` 1.8.0
with Chrome 150 or later. It builds and serves the candidate on loopback, starts
an isolated Chrome profile with an exact origin allow-list, calls
`list_webmcp_tools` with the selected `pageId`, then calls
`execute_webmcp_tool` with a JSON input for all five tools. The fail-closed
wrapper checks each completion status and output schema and writes the complete
local result to ignored `.evals/chrome-devtools-mcp.json`. It also submits one
synthetic unrelated personal-context field and requires a closed error result.
It does not use a
model, contact a model provider or establish that the same fix is deployed. The
final hardened run at 15:53 BST on 30 August 2026 used Chrome 152.0.7977.64,
checked the closed schemas and annotations, completed all five calls, rejected
`personalContext` and recorded zero console errors. The runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`; an earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json`, while the final run left its
modification time unchanged.

The runner also has a separate post-deployment mode. Set
`WEBMCP_DEVTOOLS_TARGET_URL` to exactly
`https://chris-page-gov.github.io/govuk-webmcp/` and
`WEBMCP_EXPECTED_COMMIT` to the lowercase 40-character protected-main commit.
It refuses any other URL, validates the exact `deployment.json` schema,
repository, commit and Pages run, records the metadata bytes' SHA-256, skips the
loopback server and writes the full result to ignored
`.evals/chrome-devtools-mcp-public.json`. That post-deployment mode ran against
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and Pages run
`33323152751`. The reviewed receipt records five discovered tools, five
completed calls, a closed-input rejection and zero console errors; the complete
raw response remains ignored and private.

`webmcp:eval:smoke` uses the exactly pinned `webmcp-evals` 0.0.4 and
`evals/webmcp-smoke.json`. Three synthetic cases make six concrete calls that
cover all five tools. The wrapper builds the application, serves only the
same-origin candidate, selects installed stable Chrome, gives the third-party
child process a small operating environment with an isolated `HOME` and no
forwarded provider credential environment variables. The child nevertheless
retains the operating-system filesystem access of the invoking user. Every call
must return `ok: true` with its expected result-schema envelope. Raw evaluator
rows are deleted after validation; ignored
`.evals/webmcp-smoke-receipt.json` retains only semantic counts and a results
digest. Smoke mode does not establish complete payload equivalence or measure
agent tool selection. Only the DevTools receipt above retains full tool outputs.

`evals/webmcp-browser.json` contains eight cases, including context minimisation
and an unrelated no-call case. It drives model-backed browser evaluation
through `npm run webmcp:eval:browser`. The
wrapper requires an explicit provider-prefixed model and
`WEBMCP_EVAL_PRESENTATION_APPROVED=1`, bounds runs and agent steps, and checks
that the context-minimisation call contains exactly `query`, `collections` and
`limit`, including `collections: ["deep-evidence"]` and no empty optional
arrays. Only
the `ollama:` route is preflighted on loopback without downloading a model. For
an otherwise-successful local run, receipt v2 must match the selected identity
from `/api/tags` before and after evaluation to the daemon-reported loaded
identity from `/api/ps` afterwards. This is daemon-reported post-run evidence,
not cryptographic per-response proof. Redirects, mismatched `name`/`model`
fields and `remote_model` or `remote_host` markers fail before evaluation; an
Ollama-labelled cloud proxy must use the explicit remote-provider route. A
remote route additionally requires `WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1` and
the provider credential. Both local and remote commands must include the
presentation approval, for example:

```bash
WEBMCP_EVAL_PRESENTATION_APPROVED=1 \
WEBMCP_EVAL_MODEL='ollama:<exact-installed-model>' \
npm run webmcp:eval:browser

WEBMCP_EVAL_PRESENTATION_APPROVED=1 \
WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1 \
WEBMCP_EVAL_MODEL='openai:<exact-model>' \
npm run webmcp:eval:browser
```

The wrapper writes private, ignored reports and a sanitised receipt. Five local
attempts used Chrome 152, `webmcp-evals` 0.0.4, eight cases, three runs per case
and exact loopback-only model `ollama:gpt-oss:20b`, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. Their first three results were 8 of 102 retry-expanded rows,
then 33 of 33 upstream but 32 of 33 strict because one call added empty optional
arrays, then 30 of 35 upstream after two malformed-then-corrected provenance
IDs and one omitted comparison. Receipt-v2 attempt 4 bound stable identity but
retained a null evaluation after structural validation failed. Receipt-v2
attempt 5 retained 30 pass and 6 fail across 36 reported rows and failed
`verify-reports`. All failed overall. Any later run must retain
these failures and record the exact model, provider boundary, fixture digest,
run count and variance. The wrapper fails closed on any upstream console error
or `pageerror`; acceptance records `browserConsoleErrorCount: 0` and
`browserConsoleErrorsAccepted: false`.

The first three historical attempts predate receipt v2 and are not upgraded by it.
Privileged local-account, daemon or evidence-channel control remains outside
the receipt trust boundary, as do tag changes between observations and a
previously loaded model.

The federated runtime independently limits physical shard work to 4 active
loads, 32 queued loads and 36 distinct in-flight files. A file's 3-second
deadline starts before queueing and its slot remains held until the underlying
loader settles. Queue or immediate pre-loader deadline expiry returns the
scheduler-busy result rather than a source-corruption result. Four non-
cooperative loaders can therefore retain all slots and leave federated loading
unavailable, but cancellation cannot amplify physical work beyond those four.

`npm run webmcp:explorer:setup` separately checks out and builds Microsoft
WebMCP Explorer 0.1.0 at commit
`f7091c12420e713b11361630dc1649d5678f62ab` in isolated ignored
`.tools/webmcp-explorer-build/`, using `--ignore-scripts`. Two consecutive
builds were byte-identical, left the source checkout clean and passed the clean-
output allow-list. The source-tree, package-lock and unpacked-extension file-
manifest SHA-256 values (the latter over sorted per-file hashes and paths) are
`b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
`76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
Static triage dated 30 August 2026 found the reported npm advisory paths were
not reachable in that exact production extension path. Operational risks still
include `<all_urls>`, persistent `chrome.storage.local` credentials,
`dangerouslyAllowBrowser`, no prompt-injection mitigation and autoexecution in
Agent Run/Chat.

Explorer acceptance must use a disposable profile. Inspect Tools first without
a credential, prefer an exact local loopback model with Agent Step and delete
the profile afterwards. If a remote run is necessary, use a revocable low-limit
key and no personal context. The setup stops before browser loading or provider
configuration; no Explorer browser execution or model selection is claimed.

## 8.8 Explicitly excluded claims

This page-scoped prototype is not a durable MCP gateway. It does not call a
provider, operate a government service, authenticate a user, grant access,
create a durable per-call receipt or make an official decision. The packaged
receipts are static build evidence. Any future gateway, provider or service-
operation capability would require a separate architecture, authority and
assurance case.

The federated candidate is also not an official service, a comprehensive or
unique-record government index, a source-currentness certificate or proof that
an API is callable, a person is eligible or a property record is supplied. The
page hosts no model and accepts no personal profile, but a remote provider may
receive prompts, tool metadata, arguments and results. Any claim of lower cost,
better privacy, better questions or better answers remains an evaluation
hypothesis.
