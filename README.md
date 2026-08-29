# govuk-webmcp

Public source repository for the independent experimental prototype
**Trusted government knowledge discovery**.

## Current status

This repository contains the preserved 29 August 2026 research baseline and the
complete static prototype: accessible search, exact record and provenance views,
plus three page-scoped WebMCP tools over an 80-record, 80-receipt,
checksum-verified catalogue. See `CHANGELOG.md` and
`docs/competition/implementation-plan.md` for lockstep status and evidence.

It is **not a competition submission** and **not an official GOV.UK or UK
government service**. Chris Page has authorised public source and deployment
for release verification. Competition registration and Devpost submission are
separate actions and have not been performed.

## Start here

1. Read `PROJECT_STATUS.md`.
2. Read `CODEX_HANDOVER.md`.
3. Read `AGENTS.md` before allowing Codex to change the repository.
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
   Finder; browsers restrict module and data loading from `file://` URLs.

## Key implementation artefacts

- `src/webmcp-tools.ts` — implemented imperative WebMCP registrations and the
  shared verified execution layer.
- `app/data/sources/` — reviewed source locks and frozen input records.
- `app/data/catalogue.json` and `app/data/receipts.json` — deterministic,
  same-origin generated artefacts.
- `schemas/` — input/output and record/receipt schemas.
- `examples/` — minimal OKF and evidence-receipt examples.
- `docs/competition/codex-build-brief.md` — one-page build contract.
- `docs/competition/backlog.md` — Must/Should/Could backlog.
- `governance/` — ownership assurance, competition and pre-submission gates.
- `SECURITY.md`, `PRIVACY.md` and `ACCESSIBILITY.md` — public operating
  boundaries and known limitations.
- `docs/competition/evidence/` — generated SBOM, dated link-health evidence and
  the canonical security review of the pre-release `main` revision.

## Public release boundary

The live challenge rules require a working URL and public repository with an
open-source licence. The repository therefore uses MIT for Chris Page's
original work while `NOTICE.md` retains item-level source rights and access
limits. The npm package remains marked `private` to prevent accidental package
registry publication; that field does not restrict access to this repository.

GitHub Pages deployment is manual and promotes the same artefact only after the
complete test suite passes. The deployed `deployment.json` identifies its exact
commit and workflow run. Do not infer a deployment from source availability.

## Controlling deadline

The live Devpost Official Rules recorded on 29 August 2026 state a close of
**3 September 2026 at 13:00 PDT / 20:00 UTC / 21:00 BST**. Recheck the live
rules immediately before submission.
