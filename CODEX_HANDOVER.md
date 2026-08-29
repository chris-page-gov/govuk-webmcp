# Codex handover

## Objective

Turn this repository seed into a locally runnable, competition-ready static
prototype while preserving the research, governance and evidence boundaries.

## First Codex session

1. Confirm the working directory is exactly `~/repos/govuk-webmcp`.
2. Read `PROJECT_STATUS.md`, `AGENTS.md`, this file and
   `docs/competition/codex-build-brief.md` in that order.
3. Run the nested research-pack validator and report the result without changing
   the preserved pack.
4. Inspect the current repository tree and create a short implementation plan
   mapped to the Must backlog.
5. Create an ADR under `docs/adr/0001-static-same-origin-webmcp-boundary.md`
   covering:
   - independent-prototype identity;
   - static same-origin architecture;
   - no runtime credentials or official API dependency;
   - three critical read-only tools;
   - shared human/tool execution engine;
   - assertion and fail-closed policy;
   - pre-existing versus competition-period evidence.
6. Scaffold the application under `app/` without deleting or relocating the
   research baseline.
7. Implement one end-to-end vertical slice first:
   - load and validate a tiny same-origin fixture;
   - visible human search;
   - `search_government_knowledge` registration;
   - identical structured result in page and tool paths;
   - authoritative link, assertion status and limitation display;
   - unit and browser tests.
8. Stop after the vertical slice and provide a diff, test evidence and next
   risks. Do not publish or deploy.

## Source locks to preserve

- `gis-ai-go` pre-WebMCP baseline:
  `fe122579dc3aba07387c0c201ce5539b50a40108`
- `gis-ai-go` WebMCP candidate:
  `8c4c3e0df7b19926507b541fc11077d2912b94ee`
- `okf-govuk-content` reviewed state:
  `94f5020cb2c7512a79c2353ee48743ad733a132c`
- `okf-uk-government-apis` reviewed state:
  `55c7e67947dfd86e291ca987e354429c36b453d9`
- `okf-explorer` reviewed boundary:
  `c8af0b05cab49a5341e0b787e17d49a674868d3a`

These are evidence references, not instructions to copy everything. Reuse only
paths whose licence and ownership have been reviewed.

## Completion definition for the first milestone

- clean local build;
- human search works with WebMCP absent;
- one real imperative WebMCP tool is discoverable in the controlled test;
- runtime rejects additional properties and oversized input;
- source text remains inert and untrusted;
- bundle tampering prevents tool registration;
- human and tool output share record ID and bundle digest;
- no network request, cookie, analytics or persistent query storage;
- all claims remain inside the independent experimental boundary.

## Agent tracking

Baseline commit `4c85db7` preserves the seed before competition-period code.
The first vertical slice is implemented in the working tree and mapped in
`docs/competition/implementation-plan.md`.

Final local validation on 29 August 2026:

- `npm test`: passed;
- preserved research-pack checks: 4 passed, with optional `jsonschema`
  meta-schema validation skipped because the Python package is not installed;
- unit tests: 5 passed;
- installed-Chrome browser tests: 4 passed;
- initial sandboxed browser run could not bind localhost (`EPERM`); the identical
  suite passed with permission to use a localhost-only server.

Stop after validating this slice. The next recommended implementation task is a
separate reviewed-corpus/profile slice before adding `get_resource_record`; do
not start it without a new instruction.
