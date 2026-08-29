# Implementation plan and backlog tracking

This is the lockstep implementation map for the research backlog in
`docs/competition/backlog.md`.

## Complete private verification build

The prototype implements the full technical Must range that can be verified
without a separately authorised public deployment or competition submission.
It contains 80 records and 80 evidence receipts, the upper bound selected by
Must 3.

| Must item | Status | Evidence |
| --- | --- | --- |
| 1 | Complete for this repository | `governance/assurances/2026-08-29-chris-page-ownership-assurance.md` |
| 2 | Complete | source locks, `NOTICE.md`, baseline commit `4c85db7` |
| 3 | Complete | 69 locked GOV.UK records plus 11 reviewed official records |
| 4 | Complete | `profiles/`, record/catalogue/receipt schemas and schema validator |
| 5 | Complete in controlled Chrome | accessible search, filter, record and provenance UI; browser tests |
| 6–8 | Complete | three imperative registrations and unit/browser tests |
| 9 | Complete | shared runtime and deep-equal page/tool output assertions |
| 10–11 | Complete | human URLs and explicit access, licence, assertion, date and limitation fields |
| 12 | Complete | source, record, bundle and receipt digests and checksum sidecars |
| 13–14 | Complete for packaged corpus | closed inputs; malformed, no-match, tamper, receipt-binding, unsafe-URL and inert-text tests |
| 15 | Complete in controlled Chrome | CSP, no cookie/storage and same-origin-only request assertions |
| 16 | Part complete | installed-Chrome suite passed; ChatGPT built-in-browser test needs a deployed HTTPS URL |
| 17 | Part complete | MIT and notices complete; public deployment is not authorised by the private publication request |
| 18 | Not started by design | demo, submission copy, tag and Devpost actions require separate instruction |

## Implemented Should items

- Bounded publisher, resource type and access filters.
- Related-record links in exact record results.
- Automated dependency updates and accessibility smoke testing.

## Next safe release step

Review and merge the private pull request. If Chris Page separately authorises a
public deployment, capture signed-out HTTPS, supported-host, link-health and
manual accessibility evidence before preparing any competition submission.
