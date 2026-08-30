# govuk-webmcp

Public source repository for **Trusted government knowledge discovery**, an
independent experimental prototype.

The `v0.2.0-rc.1` product release is available at
<https://chris-page-gov.github.io/govuk-webmcp/>. It was integrated through
[pull request 9](https://github.com/chris-page-gov/govuk-webmcp/pull/9), is
bound to product commit `9235ee5db4df637bdb2a12e87449e871614afe68`, and is
retained as a [public pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1).

## Current implementation

The current working implementation is a static TypeScript application with:

- 80 digest-bound catalogue records and 80 matching evidence receipts;
- one digest-bound Evidence Trace for a worked answer;
- 10 reviewed corpus admissions: 2 searchable collections and 8 collections
  that are described but not searchable;
- four exact source locks for the 69-record GOV.UK import, the 11 curated data
  and API records, the authored answer pack, and the corpus admissions;
- an analytical-index-first human interface, with the visual Evidence Trace as
  a progressive explanation of the same data; and
- five page-scoped WebMCP tools over the same deterministic action path used by
  the human controls.

This is not an official GOV.UK or UK government service. It is not a durable MCP
gateway, a production service or a comprehensive index of government
information. The published release passed exact-main validation in run
`33286750188` and was deployed from the same product commit in Pages run
`33286771963`. Competition registration and Devpost submission have not been
performed.

## Start here

1. Read `PROJECT_STATUS.md`.
2. Read `AGENTS.md` before allowing Codex to change the repository.
3. Read `CODEX_HANDOVER.md`.
4. Read `research/2026-08-29/deep-research-report.md` for the decision-grade
   report.
5. Run the complete local suite:

   ```bash
   npm test
   ```

6. Start the verified build for manual browser use:

   ```bash
   npm run serve
   ```

   Open `http://127.0.0.1:4173/`. Do not open an HTML file directly from
   Finder; browsers restrict module and same-origin data loading from `file://`
   URLs.

## Evidence and integrity model

Four generated artefact families must all pass checksum, schema, digest and
cross-binding validation before any WebMCP tool can register:

1. the catalogue and its raw-byte checksum;
2. the evidence receipts and their raw-byte checksum;
3. the Evidence Trace collection and its raw-byte checksum; and
4. the corpus federation manifest and its raw-byte checksum.

The catalogue contains the 69 locked GOV.UK records and 11 curated government
data and API records. Those are the only two searchable admissions. The other
eight admissions remain described-only, conditional, quarantined or
contract-only; descriptor inclusion does not admit their payloads to search.

The four reviewed source locks are recorded in
`app/data/sources/source-locks.json`. Generated files under `app/data/` must not
be edited by hand. Change the reviewed inputs under `app/data/sources/`, then
run `npm run data:build` and `npm run data:validate`.

Digest validation proves that packaged bytes and declared relationships match.
It does not prove official endorsement, current accuracy, access authority or
an open licence. Every result therefore keeps authoritative human links,
assertion status and limitations visible. Source-derived text is untrusted data
and is rendered as text rather than executable content.

## Human and WebMCP actions

The human interface remains fully usable without WebMCP. Human controls and
page tools use the same action controller and deterministic runtime:

- `search_government_knowledge`, `get_resource_record` and `show_provenance`
  only query verified packaged data and truthfully declare
  `readOnlyHint: true`;
- `explore_answer_foundations` and `compare_evidence_foundations` update a
  reversible, transient selection in the visible page, so they truthfully
  declare `readOnlyHint: false` even though they do not change a source,
  browser storage or external state.

All five tools have closed, bounded input schemas and repeat validation in
executable code. A shared input budget rejects broad roots and accessors before
dispatch. Rejected input is not hashed or retained in the diagnostic input
digest. URL-fragment routes are length-bounded and comparison is limited to two
to four exact claim identifiers.

These tools are registered imperatively on the current page when a compatible
secure browser host exposes `document.modelContext`. They are available only in
that page context. They do not provide an independently callable, durable MCP
gateway, provider authentication, persistent sessions or durable call
receipts. Instrumented browser tests cover registration and calls, but native
discovery and invocation by a supported live WebMCP host remain unobserved.

## Privacy and operating boundary

The page loads only its packaged same-origin artefacts. It makes no runtime call
to a provider API and uses no accounts, cookies, analytics or browser storage API.
Search terms are not put in the URL or stored. Bounded answer, claim, record and
comparison selections can appear in the URL fragment so that the human view can
be restored; see `PRIVACY.md` for the page and browser-host boundary.

Original application code is MIT licensed. `NOTICE.md` retains item-level
rights and access limits for source material. Catalogue inclusion never grants
access or permission to reuse linked material.

## Key implementation artefacts

- `src/application-actions.ts` — shared action, presentation and diagnostic
  boundary.
- `src/webmcp-tools.ts` — catalogue runtime and imperative WebMCP registration.
- `src/evidence-runtime.ts` — Evidence Trace validation and exploration.
- `src/federation-runtime.ts` — corpus-admission validation.
- `app/data/sources/` — reviewed source locks and authored inputs.
- `app/data/` — deterministic generated artefacts and checksum sidecars.
- `schemas/` — closed input, output and generated-artefact schemas.
- `SECURITY.md`, `PRIVACY.md` and `ACCESSIBILITY.md` — public operating
  boundaries and known limitations.
- `docs/competition/evidence/` — dated candidate and release evidence, including
  exact deployment metadata, live-byte verification and explicit remaining
  gates. Start with the
  [30 August 2026 public release verification](docs/competition/evidence/public-release-verification-2026-08-30.md).
  Each record applies only to the revision and observation it names.
