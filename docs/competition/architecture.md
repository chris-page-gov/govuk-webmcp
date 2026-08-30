# Static competition architecture

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

## Authored and generated boundaries

The four authored locks are the only generator inputs admitted by this
candidate. A lock binds an expected identifier to one exact repository path,
item count and SHA-256 value. The validator rejects extra or duplicate locks,
path swaps, count changes, directories, symbolic links and a file that changes
while it is being opened.

The generators produce the catalogue and receipts, the Evidence Trace
collection and the federation manifest. They do not change the authored
sources. At runtime, the page checks each artefact's same-origin bytes against
its sidecar, then checks its closed structure, internal digests and bindings.
A failure in any of the four artefact families leaves the human fallback error
visible and prevents all five tools from registering.

The federation manifest records `sourceOkfCore` separately from
`targetOkfCore`. The target is OKF core 0.2 for every admission; the source may
be 0.1, 0.2 or undeclared. A crosswalk or descriptor records an assessed
relationship only. It does not admit, copy or make the producer payload
searchable. Only the two reviewed deep-evidence collections account for the 80
searchable records.

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

The page makes no runtime call to GOV.UK, a data provider or a model provider.
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
collection is a hypothesis for measurement, not a demonstrated saving.

## Independent assurance boundary

Native browser developer tools, Microsoft WebMCP Explorer, Chrome DevTools MCP
and `webmcp-evals` provide complementary development evidence. They are not
part of the deployed static application and none is, by itself, proof of the
whole architecture. Manual inspection tests discovery and invocation;
Chrome DevTools MCP tests an independent automation path; model-free
`webmcp-evals` smoke tests check deterministic browser execution; and a
separately identified model-backed run can test tool selection.

For the corrected public deployment, the first and third layers are now
observed separately: Chrome 152's native WebMCP panel completed all five valid
calls and displayed a structured invalid-input result, while Chrome DevTools
MCP 1.8.0 completed the same five-tool public journey with zero console errors.
Both are deterministic host-execution evidence. Microsoft Explorer and a fixed
model-selection run remain deliberately open rather than being inferred from
those results.

These harnesses operate only against the public synthetic fixture in an
isolated browser profile with no unrelated tabs, saved credentials or personal
extensions. Exact tool and harness versions, browser build, page revision and
model location belong in each receipt. Credentials, cookies, personal prompts
and unredacted headers do not. Raw reports remain local until reviewed because
they can contain prompts, tool metadata, arguments, results, console output and
page URLs; retained submission evidence is sanitised, checksummed and bound to
the exact tested revision.
