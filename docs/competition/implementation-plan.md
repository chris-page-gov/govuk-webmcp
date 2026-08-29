# Implementation plan and backlog tracking

This is the lockstep implementation map for the research backlog in
`docs/competition/backlog.md`.

## Complete public release candidate

The prototype implements the full technical Must range through public
deployment. Competition registration, video publication and Devpost submission
remain separately controlled. It contains 80 records and 80 evidence receipts,
the upper bound selected by Must 3.

| Must item | Status | Evidence |
| --- | --- | --- |
| 1 | Complete for this repository | `governance/assurances/2026-08-29-chris-page-ownership-assurance.md` |
| 2 | Complete | source locks, `NOTICE.md`, baseline commit `4c85db7` |
| 3 | Complete | 69 locked GOV.UK records plus 11 reviewed official records |
| 4 | Complete | `profiles/`, record/catalogue/receipt schemas and schema validator |
| 5 | Complete in controlled Chrome and Edge | accessible search, filter, record and provenance UI; browser tests |
| 6–8 | Complete | three imperative registrations and unit/browser tests |
| 9 | Complete | shared runtime and deep-equal page/tool output assertions |
| 10–11 | Complete | human URLs and explicit access, licence, assertion, date and limitation fields |
| 12 | Complete | source, record, bundle and receipt digests and checksum sidecars |
| 13–14 | Complete for packaged corpus | closed inputs; malformed, no-match, tamper, receipt-binding, unsafe-URL and inert-text tests |
| 15 | Complete in controlled Chrome and Edge | CSP, no cookie/storage and same-origin-only request assertions |
| 16 | Part complete | installed Chrome and Edge suites and controlled live human journey passed; the available in-app browser did not expose `document.modelContext`, so ChatGPT host tool calls remain |
| 17 | Complete | public repository, MIT, notices, policies, protected `main`, exact-commit Pages deployment, SBOM, link health and signed-out acceptance |
| 18 | Not started by design | demo, submission copy, tag and Devpost actions require separate instruction |

## Implemented Should items

- Bounded publisher, resource type and access filters.
- Related-record links in exact record results.
- Automated dependency updates and accessibility smoke testing.
- Direct-file startup guidance, bounded startup and a one-command local server.
- A 161-URL admitted-official-host link-health evidence report.
- CycloneDX SBOM and public security, privacy and accessibility boundaries.

## Next safe release step

Verify the three registrations and representative calls in ChatGPT's supported
built-in-browser host, complete the manual screen-reader observation, and
prepare the video and Devpost form for a separate submission decision.
Competition registration and submission remain separate actions.
