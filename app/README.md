# Application workspace

This directory contains the static TypeScript prototype. Its primary human view
is an analytical index of one digest-bound worked answer. A progressive visual
Evidence Trace, an accessible claim comparison and catalogue search all use the
same deterministic action path.

The packaged evidence estate contains:

- 80 catalogue records and 80 matching evidence receipts;
- one digest-bound Evidence Trace;
- 10 corpus admissions, of which 2 are searchable and 8 are not searchable;
  and
- four exact source locks covering the 69-record GOV.UK import, 11 curated data
  and API records, one answer pack and the 10 admission decisions.

The runtime loads and validates four artefact families: catalogue, receipts,
Evidence Trace collection and federation manifest. Each has a raw-byte SHA-256
sidecar. Their schemas, internal digests and cross-bindings must also validate
before any WebMCP registration starts.

## Page tools

The page registers five fixed tools when a compatible secure host provides
`document.modelContext`:

- `search_government_knowledge`, `get_resource_record` and `show_provenance`
  query packaged data only and declare `readOnlyHint: true`;
- `explore_answer_foundations` and `compare_evidence_foundations` change only a
  reversible, transient page selection and declare `readOnlyHint: false` to
  describe that visible presentation effect accurately.

The tools are page-scoped progressive enhancement, not a durable MCP gateway.
The human interface works without them. Human and WebMCP actions use the same
controller, input budget and executable validation. Rejected input is not
included in a diagnostic input digest, and bounded URL fragments restore only
exact record, answer, claim or comparison selections.

The page treats source-derived text as untrusted, renders it inertly and keeps
authoritative URLs and limitations visible. It calls no provider API and uses
no accounts, cookies, analytics, local storage or session storage. Catalogue
inclusion and digest validation do not establish official endorsement, current
accuracy, access authority or an open licence.

Run `npm test` for research-pack, unit and browser validation. Run `npm run
serve`, then open `http://127.0.0.1:4173/` for manual use. Do not open an HTML
file directly: the startup watchdog explains that modules and same-origin data
require HTTP.

Do not edit generated artefacts by hand. Update the reviewed inputs in
`data/sources/`, run `npm run data:build`, then run `npm run data:validate`.
These instructions do not assert that the current working change is merged,
deployed or submitted to Devpost.
