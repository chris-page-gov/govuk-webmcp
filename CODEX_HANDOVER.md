# Codex handover

## Current outcome

The `0.2.0-rc.1` Evidence Trace and bounded-federation candidate is implemented
on `feat/evidence-trace-federation`. It is not yet committed, merged or
deployed. The public site still serves the prior `fd2b7ae`
`v0.1.0-rc.1` release until the candidate completes protected pull-request,
exact-main and Pages verification.

The candidate expands the 80-record, 80-receipt static catalogue with:

- four exact authored source locks;
- one worked Evidence Trace over three selected new-child GOV.UK records;
- an analytical index, interactive text-labelled Trace, foundation detail and a
  score-free two-to-four-claim comparison;
- eight separate evidence facets: authority, assertion, verification,
  freshness, integrity, access, rights and coverage;
- five imperative WebMCP tools over the same deterministic action controller as
  the human interface; and
- a 10-entry corpus admission manifest: two collections are searchable and
  eight remain non-searchable.

No `gis-ai-go` or OKF source repository was changed.

## Source and generated bindings

| Binding | SHA-256 or immutable reference |
| --- | --- |
| Preserved research baseline | `4c85db7` |
| `okf-govuk-content` producer commit | `94f5020cb2c7512a79c2353ee48743ad733a132c` |
| Producer Git blob | `e7f3b6a0d1efa6cb336b1b50a69228de26216aa5` |
| Imported 69-record GOV.UK source | `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc` |
| Curated 11-record source | `f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794` |
| Authored answer pack | `ea00549f465ef4d7fc65c9e5853ee2b78ab6d9823d25e9268516d7b955d70f1f` |
| Authored corpus admissions | `dc798de2d33fc9434e1dce730bb945c8fd7b6c01466cea02728c9aadf292edd0` |
| Generated catalogue bundle | `20593105f6e34d5072f566b4f7b98cab143c4333c56bbabfca831b935237945c` |
| Evidence Trace collection | `a6c38dcc1cc8defbb38a1541e5964159a1e724aa989cb362187111a801dc0a3b` |
| Federation manifest | `3b1301d55ebd232e6d4b89226ddb9cc92ee4ae0878fc5b6ac48a88594ed06d71` |

Every standalone builder validates the exact four source-lock ID/path/count
pairs and consumes the regular-file bytes returned by that validator. Generated
JSON and checksum sidecars are deterministic.

## Implemented runtime boundary

- The static same-origin application calls no official API at runtime.
- The human interface becomes usable after catalogue, receipts, Evidence Trace
  and federation validation and does not wait for WebMCP registration.
- `search_government_knowledge`, `get_resource_record` and
  `show_provenance` are read-only.
- `explore_answer_foundations` and `compare_evidence_foundations` change only
  reversible in-memory page presentation and truthfully use
  `readOnlyHint: false`.
- All five tools use closed schemas and executable validation. Unknown,
  oversized, malformed, broad, accessor-bearing and deeply nested rejected
  inputs fail closed.
- Rejected input is not serialised or hashed. Successful diagnostic input is a
  shallow admitted-data copy; the displayed result has a deterministic digest.
- Public fragment routes are bounded before parsing and comparison values are
  bounded before splitting.
- Source-derived text remains untrusted and is rendered as inert text.
- Authoritative links, assertion labels, observation dates, access, rights and
  limitations remain visible. No combined trust score is generated.
- No query, account, cookie, analytics, persistent app storage, provider call,
  canonical-data mutation or external state change is introduced.

This is page-scoped WebMCP progressive enhancement, not a durable MCP gateway,
provider integration or service-operation layer.

## Local assurance observed on 30 August 2026

| Command or observation | Result |
| --- | --- |
| `npm run test:unit` | 58 of 58 passed |
| `PLAYWRIGHT_PORT=4210 npm run test:browser:prepared` | 19 of 19 passed in installed Chrome |
| `PLAYWRIGHT_PORT=4211 npm run test:browser:edge:prepared` | 19 of 19 passed in installed Microsoft Edge |
| Expanded axe WCAG 2.2 smoke | no serious or critical violations |
| Keyboard, focus/history, 320px, forced colours, reduced motion | passed |
| Manual headed Playwright index/comparison journey | completed and screenshots visually inspected |
| `npm audit --json` | zero known vulnerabilities across 33 dependencies |
| Bounded official-link HEAD audit | 161 unique URLs reachable; 0 attention |
| Local macOS ARM64 CycloneDX SBOM | 14 components; personal author/contributor metadata absent; release-platform evidence remains pending |

The formal candidate diff scan has ID
`0735e481-5df9-43fe-8f3a-04bc3d9b797c`. It reported two low-severity
robustness findings: rejected-input diagnostic stack exhaustion
(`csf_41bd1a86df6723af9809e17f`) and an unbounded comparison fragment
(`csf_f203d8431e5137ec989af24d`). Both were reproduced, fixed and verified as
`fixed`; one fresh independent reviewer found no bypass. A separately
security-suppressed source-lock admission gap was resolved as a provenance
assurance defect.

Canonical pre-remediation scan output and the remediation record are retained
under `docs/competition/evidence/`. A later immutable 44-item candidate
snapshot scan (`8dda47c2-46d1-4a1f-9e00-15bbaa684cdb`) completed with no
reportable finding. Its preserved warning records that the final stricter
count, identifier, workflow, test and documentation delta followed the
snapshot; that delta and the final test matrix are recorded separately in
`candidate-verification-2026-08-30.md`. Final pull-request CI, exact-main and
live verification have not yet run for this candidate.

## Residual limitations

- The GOV.UK imported bytes and Git blob are verified, but the historical
  producer revision was not available in the local checkout.
- The cached ONS release ZIP has a local SHA-256 but no independently retrieved
  official checksum sidecar.
- The local `okf-testing` directory is unversioned and has no established
  licence; it remains quarantined.
- `targetOkfCore: "0.2"` is a descriptive target mapping. It does not replace
  the separately recorded `sourceOkfCore` state or admit producer payload.
- Source locks prove reproducible local admission, not publisher signatures or
  external attestation.
- No manual screen-reader observation has been performed and no WCAG
  conformance claim is made.
- The available controlled in-app browser previously lacked
  `document.modelContext`; an actual supported-host WebMCP call remains
  unverified.
- The public demo video, competition registration and Devpost submission remain
  unperformed.

## Recommended next step

Create small signed commits, open a pull request and require the protected
`validate` check. Merge only when green, deploy the exact merged `main`
commit and record signed-out live repository, digest, same-origin, console and
human-journey evidence. Follow with actual supported-host WebMCP and manual
screen-reader observations where the necessary environments are available.
Do not register for or submit to Devpost without a separate instruction.
