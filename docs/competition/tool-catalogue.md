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
screen-reader observation remains pending.

## 8.7 Explicitly excluded claims

This page-scoped prototype is not a durable MCP gateway. It does not call a
provider, operate a government service, authenticate a user, grant access,
create a durable per-call receipt or make an official decision. The packaged
receipts are static build evidence. Any future gateway, provider or service-
operation capability would require a separate architecture, authority and
assurance case.
