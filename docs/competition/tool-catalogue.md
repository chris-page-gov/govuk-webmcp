# 8. Implemented WebMCP experience

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

WebMCP is progressive enhancement. The human interface remains usable when
`document.modelContext` is absent, registration is blocked or registration
fails. Instrumented browser tests prove the page contract and human-tool parity;
they do not prove discovery or execution by a live agent host.

## 8.2 Five fixed tools

| Tool | Purpose | Input bound | Page effect | `readOnlyHint` |
|---|---|---|---|---:|
| `search_government_knowledge` | Search 80 validated records | Query up to 160 characters; filters bounded; 1 to 20 results | None | `true` |
| `get_resource_record` | Return one exact record | One identifier up to 128 characters | None | `true` |
| `show_provenance` | Inspect one packaged receipt and source chain | One identifier up to 128 characters | None | `true` |
| `explore_answer_foundations` | Select the worked answer or one exact claim | One answer ID; optional claim ID, each up to 96 characters | Reversible in-memory selection | `false` |
| `compare_evidence_foundations` | Compare two to four claims from the worked answer | One answer ID and 2 to 4 unique claim IDs | Reversible in-memory comparison | `false` |

All five tools have `untrustedContentHint: true`, closed input schemas and fixed
names, titles and descriptions. Source-derived strings never become tool names
or instructions.

### Tool 1 — `search_government_knowledge`

**Title:** Search government knowledge

**Description:** Search the page's verified, read-only 80-record GOV.UK
metadata catalogue. Return authoritative human links, assertion labels and
limitations without contacting providers or establishing access rights.

**Input:** `query`; optional `resourceTypes`, `publishers`, `accessStatuses`
and `limit`. The query is limited to 160 characters, publisher arrays to 8
values and output to 20 records. Unknown fields are rejected.

**Output:** catalogue date, bundle digest and record count; deterministic match
counts and fields; compact record summaries; access, licence and assertion
states; authoritative links; record and bundle digests; packaged receipt IDs;
and limitations.

**Human equivalent:** the search form and result list. Both call the shared
action controller, although a read-only WebMCP query does not change the page
selection.

### Tool 2 — `get_resource_record`

**Title:** Get a government resource record

**Description:** Return one exact digest-bound record, including authoritative
links, access and licence status, assertions and limitations. It grants no
access authority.

**Input:** exact `recordId` matching the closed catalogue identifier pattern.
There is no fuzzy identifier resolution.

**Output:** the complete record, related record summaries, digest-bound status
and explicit page, provider and access boundaries.

**Human equivalent:** **View record and provenance** on a result.

### Tool 3 — `show_provenance`

**Title:** Show record provenance

**Description:** Inspect the packaged source, assertion and digest evidence for
one record. It does not refetch or independently certify the source.

**Input:** exact `recordId`.

**Output:** observation date, extraction method, source lock where applicable,
source, record and bundle digests, the packaged evidence receipt, source links,
field assertions and limitations.

**Human equivalent:** the provenance and receipt section of the exact record
view.

### Tool 4 — `explore_answer_foundations`

**Title:** Explore answer foundations

**Description:** Select one bounded evidence-first answer or one of its exact
claims and update the page's analytical index and Evidence Trace. The only
effect is reversible in-memory presentation.

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

**Description:** Compare two to four exact claims in one evidence-first answer
and update the page's accessible comparison. It does not rank sources or change
catalogue, storage, network or external state.

**Input:** required `answerId` and 2 to 4 unique `claimIds`. Unknown, duplicate,
malformed or out-of-answer identifiers fail closed.

**Output:** one row per claim, its authoritative source, all eight separate
facets, linked limitations, the complete trace and explicit effect boundaries.

**Why `readOnlyHint` is false:** the call opens a reversible in-memory
comparison and selects the matching trace paths.

**Human equivalent:** select claim checkboxes, then **Compare selected claims**.

## 8.3 Registration and shared execution

The page registers tools imperatively with `document.modelContext.registerTool`
only after four same-origin artefact families have validated:

1. the catalogue and its checksum, including 80 record digests, safe official
   URLs and the bundle root;
2. the 80 receipts and their checksum, including one-to-one record, source and
   bundle bindings;
3. the one-trace Evidence Trace collection and its checksum, including graph,
   facet, source-record and digest bindings; and
4. the 10-entry federation manifest and its checksum, including admission,
   payload, semantic and catalogue bindings.

The application registers all five fixed definitions or none. Local definition
checks reject duplicate names or an open schema. Registration has a three-second
timeout and a failed or blocked attempt withdraws the partial registration
lifetime while leaving the verified human interface available.

Human controls and tool callbacks call the same `KnowledgeActionController`.
The controller applies a cheap root-input budget before action-specific
validation, honours cancellation, hashes only admitted diagnostic input and
commits a presentation result only when the action allows it. This keeps the
structured tool result and the visible deterministic result aligned.

The execution-options argument is optional at the page-host boundary. Some
hosts, including the pinned Chrome DevTools MCP and `webmcp-evals` paths, invoke
a callback as `execute(input)` without a second object. The working candidate
therefore forwards an `AbortSignal` only when the host supplies one; the
ordinary cancellation path is unchanged. A browser regression invokes all five
tools with the execution-options argument omitted; the separate ignored Chrome
DevTools MCP receipt provides independent real-host evidence for all five. The
public `v0.2.0-rc.1` deployment predates this fix, so the working-tree result
must not be presented as public-release evidence.

The current `ModelContextTool` shape uses `name`, `title`, `description`,
`inputSchema`, annotations and an execute callback. The repository publishes
closed output schemas for validation, but it does not register a non-standard
`outputSchema` property.

## 8.4 Source and federation boundary

Generation starts only after four exact authored source locks validate: 69
GOV.UK content records, 11 curated government data and API records, 1 answer
pack and 10 corpus-admission decisions. Lock validation binds exact IDs, paths,
item counts and SHA-256 values and rejects symbolic links, non-regular files,
path swaps and changed file identity.

The federation manifest contains 10 admissions: 2 searchable deep-evidence
collections and 8 that are described-only, conditional, quarantined or
contract-only. `sourceOkfCore` records the producer declaration separately from
the `targetOkfCore` 0.2 mapping. A descriptor or crosswalk does not admit,
redistribute or make a producer payload searchable.

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
- Authoritative links must be credential-free HTTPS URLs on admitted official
  hosts.
- Source text is rendered as inert text and returned as untrusted data; no HTML
  is returned to an agent.
- There is no page-side query storage, analytics, provider call or external
  runtime request.

## 8.6 Errors and assurance state

Stable errors distinguish invalid searches, records, provenance requests,
evidence selections, comparisons and missing exact identifiers. A checksum,
digest, graph, URL, source-lock or admission failure blocks registration rather
than manufacturing an unverified substitute.

Exact-main validation run `33286750188` passed 58 unit checks and 19 Chromium
browser checks for product commit
`9235ee5db4df637bdb2a12e87449e871614afe68`. Pages run `33286771963`
rebuilt and deployed that same commit at
<https://chris-page-gov.github.io/govuk-webmcp/>; all 20 live files matched the
Pages artefact byte for byte. The same source tree passed 19 installed Microsoft
Edge checks before publication. The browser suites include instrumented
five-tool registration, parity, cancellation, rollback, integrity failure,
bounded hash routes, inert source text, keyboard, reflow, forced-colour,
reduced-motion and axe smoke checks. On 30 August 2026, `Codex In-app Browser`
discovered and successfully called all five tools on the exact public release;
the final comparison's canonical and displayed result digests matched. This is
a time- and host-specific observation, not a general support claim. Manual
Safari and VoiceOver observation is separately recorded as completed with
limitations; it does not establish WCAG conformance or support in another
WebMCP host.

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
chain environment. The unreleased CI and
Pages definitions install Node dependencies with
`npm ci --ignore-scripts --no-audit`; Pages also installs the version-pinned
Python requirements and runs semantic WebMCP smoke before deployment. These
workflow edits have not yet run.

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
`.evals/chrome-devtools-mcp-public.json`. This prepared mode is not public-host
evidence until it is run after deployment and its private receipt is reviewed.

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

`evals/webmcp-browser.json` retains the same positive journeys and adds an
unrelated no-call case. It is prepared input for a later model-backed browser
evaluation through `npm run webmcp:eval:browser`, not evidence of one. The
wrapper requires an explicit provider-prefixed model and
`WEBMCP_EVAL_PRESENTATION_APPROVED=1`, bounds runs and agent steps, and checks
that the context-minimisation call contains exactly `query` and `limit`. Only
the `ollama:` route is preflighted on loopback without downloading a model. A
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

The wrapper writes private, ignored reports and a sanitised receipt. No model-
backed evaluation has been run, and no model or remote provider has been
selected for it. Any later run must record the exact model, provider boundary,
fixture digest, run count and variance and must keep its credentials and
unreviewed reports out of the repository. It validates and fails closed on any
upstream console error or `pageerror`; acceptance records
`browserConsoleErrorCount: 0` and `browserConsoleErrorsAccepted: false`.

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
