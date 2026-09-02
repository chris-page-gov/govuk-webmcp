# Application workspace

This directory contains the static TypeScript prototype. The unreleased
`0.4.0-rc.1` candidate opens with an accessible **Evidence answer** and keeps
the existing analytical index, progressive Evidence Trace, claim comparison
and catalogue search together as **Technical review**. Both views use the same
deterministic action path and evidence state.

The packaged evidence estate contains:

- 80 catalogue records and 80 matching evidence receipts;
- 58,655 locked raw source rows across A Life in the UK, ONS, UK Government
  APIs and HM Land Registry, producing 58,652 searchable federated records
  without item-level reviewed receipts after 3 rows are quarantined;
- one digest-bound Evidence Trace;
- 10 corpus admissions, of which 6 are searchable (2 reviewed and 4 federated)
  and 4 are not searchable; and
- five exact registry locks: the 69-record GOV.UK import, 11 curated data and
  API records, one answer pack, 10 admission decisions and the four-source OKF
  federation lock.

These lock and admission counts, and the schema total below, are working-tree
observations reconfirmed by the current build and sealed post-fix scan.
Recompute them if source or contract bytes change before release binding.

The four federated populations sum to 58,655 raw rows before cross-source
deduplication. Exactly three standalone HM Land Registry legislation rows are
quarantined, leaving 2,200 searchable Land Registry records and 58,652
searchable federated records overall. Neither total counts unique government
resources. HM Land Registry supplies metadata only; no title, ownership,
address, polygon or personal row is admitted. UK Legislation remains explicitly
excluded as a standalone collection, payload, index and runtime request. The
searchable projection contains no `legislation.gov.uk` result link. The locked
source bytes retain 28 inert, source-authored cross-references as untrusted
metadata.

The runtime loads and validates five registration-root artefact families:
catalogue, receipts, Evidence Trace collection, corpus federation manifest and
federated-search manifest. Each root has a raw-byte SHA-256 sidecar. The
candidate has 36 published schemas: the 31 schemas released with
`v0.3.0-rc.1` plus 5 closed Evidence answer and evaluation contracts. Their
internal digests and cross-bindings must validate before any WebMCP
registration starts. Lazily requested federated record and postings shards are
separately checked against the validated manifest.

## Authored, imported and generated data

`data/sources/source-locks.json` contains five registry entries. The fifth binds
the project-authored `data/sources/okf-federation-lock.json`, which in turn
allows exactly four producer snapshots and 73 versioned gzip artefacts under
`data/sources/okf-federation/`. Those gzip files total 13,021,675 bytes and are
checksum-bound imported metadata, not project-authored content.

`data/federated-search/` is an ignored deterministic build projection. The
current build creates 1,853 shard files — 120 record shards and 1,733 postings
shards — plus the manifest and checksum sidecar: 1,855 generated files and
127,747,020 bytes in total. `scripts/copy-static.mjs` copies this plane into
`dist` after validation.
Do not edit the lock, vendored imports or generated projection by hand. A source
refresh must use the controlled importer and update its exact source evidence;
ordinary rebuilding uses `npm run data:build` followed by
`npm run data:validate`.

## Page tools

The candidate page registers six fixed tools when a compatible secure host provides
`document.modelContext`:

- `search_government_knowledge`, `get_resource_record` and `show_provenance`
  query packaged data only and declare `readOnlyHint: true`;
- `explore_answer_foundations` and `compare_evidence_foundations` change only a
  reversible, transient page selection and declare `readOnlyHint: false` to
  describe that visible presentation effect accurately; and
- `present_resource_evidence` validates one canonical record identifier,
  returns the exact closed Evidence answer object rendered by the page and
  changes only reversible in-memory presentation, so it also declares
  `readOnlyHint: false`.

The five `v0.3.0-rc.1` tool contracts remain unchanged. The sixth tool is an
unreleased candidate until protected integration and live supported-host
verification complete.

The tools are page-scoped progressive enhancement, not a durable MCP gateway.
The human interface works without them. Human and WebMCP actions use the same
controller, input budget and executable validation. Rejected input is not
included in a diagnostic input digest, and bounded URL fragments restore only
an explicit view and exact record, answer, claim or comparison selections.
An empty URL opens Evidence answer; a legacy evidence fragment without a view
retains its Technical review meaning.

The page treats source-derived text as untrusted, renders it inertly and keeps
maintained source URLs, their conservative producer-declared roles and
limitations visible. Producer text cannot promote a federated link or assertion
to official status. Exact-record output reports source authority as “Not
independently established”, and the page displays the recorded destination
hostname. The page calls no provider API and uses
no accounts, cookies, analytics, local storage or session storage. Catalogue
inclusion and digest validation do not establish official endorsement, current
accuracy, access authority or an open licence.

Run `npm test` for research-pack, unit and browser validation. Run `npm run
okf-federation:quality` for the rebuild-bound frozen nDCG@10/Recall@20 gate.
Run `npm run serve`, then open `http://127.0.0.1:4173/` for manual use. Do not open an HTML
file directly: the startup watchdog explains that modules and same-origin data
require HTTP.

The `v0.3.0-rc.1` product bytes have passed protected-main validation, been
merged and deployed. The six-tool `0.4.0-rc.1` worktree is not yet a release,
deployment or supported-host observation. Candidate manual VoiceOver and
Caption Panel evidence, personal-agent evaluation, demonstration video, owner
publication review and Devpost submission remain separate gates.
