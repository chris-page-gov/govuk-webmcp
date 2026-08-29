# Trusted GOV.UK Knowledge Discovery — competition research pack

**Research date:** 29 August 2026  
**Decision:** technical GO; entry-governance HOLD  
**Controlling deadline used:** 3 September 2026, 13:00 PDT = 21:00 BST

This pack turns the supplied Deep Research brief into an evidence-grounded plan,
implementation starter and submission-control set for an independent, read-only
WebMCP prototype. It is not an official GOV.UK or UK Government service and it
contains no employer approval, legal clearance, security accreditation or WCAG
conformance claim.

## Start here

1. `decision-grade-report.md` — full 23-section report and source register.
2. `codex-build-brief.md` — one-page implementation brief.
3. `backlog.md` — prioritised Must, Should and Could work.
4. `src/webmcp-tools.ts` — valid TypeScript starter for three imperative tools.
5. `schemas/` — separate Draft 2020-12 input and output schemas.
6. `examples/` — minimal OKF record, runtime catalogue fixture and evidence receipt.
7. `competition-rules-matrix.csv`, `asset-register.csv`, `risk-register.csv` and `evaluation-set.csv` — machine-readable decision controls.
8. `checklists/` — competition and final submission gates.
9. `source-register.csv` — 59-source machine-readable register.
10. `evidence/` — rules research capture, provenance example and file hashes.
11. `scripts/verify_pack.py` — offline integrity, schema and source-reference checks.

## Recommended product boundary

The judging path is a static, same-origin application. It packages a manually
reviewed 30–80 record GOV.UK/API metadata corpus, verifies the published bytes,
then registers exactly three read-only tools:

- `search_government_knowledge`
- `get_resource_record`
- `show_provenance`

Every tool has a human-visible equivalent. No tool grants API access, performs a
transaction, accepts a credential, stores a query, calls a provider at runtime or
turns model-generated prose into authoritative metadata.

## Entry condition

Do not submit personally until the entrant can truthfully evidence ownership and
licensing, outside-interest/conflict approval, prize acceptance and publicity
permission. Where an employer or collaborator owns material, use an expressly
authorised team or organisation route, or remove and independently replace it.

## Verify the pack

```bash
python3 scripts/verify_pack.py
tsc --noEmit --strict --target ES2022 --module ES2022 --lib ES2022,DOM src/webmcp-tools.ts
```

`examples/catalogue.example.json` and its `.sha256` sidecar provide a one-record
runtime fixture. `examples/DIGEST-METHOD.md` explains the reproducible illustrative
source, record and bundle digests.
