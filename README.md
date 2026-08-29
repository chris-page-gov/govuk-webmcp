# govuk-webmcp

Local competition-development repository for the independent experimental
prototype provisionally titled **Trusted GOV.UK Knowledge Discovery**.

## Current status

This repository contains the preserved 29 August 2026 research baseline and a
first local vertical slice: accessible search and one page-scoped WebMCP tool
over a tiny checksum-verified fixture. See `CHANGELOG.md` and
`docs/competition/implementation-plan.md` for lockstep status.

It is **not yet a competition submission**, **not an official GOV.UK or UK
Government service**, and **must not be published or connected to a public
remote until the ownership, outside-interest, prize and publicity gates in
`PROJECT_STATUS.md` are resolved**.

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

## Key implementation artefacts

- `src/webmcp-tools.ts` — proposed imperative WebMCP registrations.
- `schemas/` — input/output and record/receipt schemas.
- `examples/` — minimal OKF and evidence-receipt examples.
- `docs/competition/codex-build-brief.md` — one-page build contract.
- `docs/competition/backlog.md` — Must/Should/Could backlog.
- `governance/checklists/` — competition and pre-submission gates.

## Controlling deadline

The live Devpost Official Rules recorded on 29 August 2026 state a close of
**3 September 2026 at 13:00 PDT / 20:00 UTC / 21:00 BST**. Recheck the live
rules immediately before submission.
