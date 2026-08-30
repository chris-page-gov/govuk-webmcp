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
