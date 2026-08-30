# Project status and hard gates

**Status:** the `0.2.0-rc.1` Evidence Trace and bounded-federation candidate is
implemented and locally assured on branch `feat/evidence-trace-federation`.
It is not yet committed, merged or deployed. Public source and deployment are
authorised; competition registration and Devpost submission remain separate,
explicit and unperformed actions.

## Current release boundary

The public repository is
[`chris-page-gov/govuk-webmcp`](https://github.com/chris-page-gov/govuk-webmcp).
`main` is protected. The currently deployed site at
<https://chris-page-gov.github.io/govuk-webmcp/> still represents commit
`fd2b7ae` and tag `v0.1.0-rc.1` until this candidate passes pull-request,
exact-main and deployment verification.

The candidate contains:

- 80 searchable records and 80 evidence receipts;
- four exact authored source locks;
- one digest-bound Evidence Trace over three selected GOV.UK records;
- a 10-entry corpus admission manifest, with two searchable and eight
  non-searchable entries;
- an analytical-index-first human interface with a text-labelled Evidence
  Trace, separate foundation facets and claim comparison without a trust score;
- five imperative WebMCP tools over one deterministic action controller; and
- 20 closed JSON Schemas plus catalogue, receipt, Trace and federation raw-byte
  checksums.

The three catalogue query tools are read-only. The two exploration tools have a
truthfully declared reversible in-memory page-presentation effect and therefore
use `readOnlyHint: false`. Neither class writes storage, changes canonical
metadata, calls a provider or changes external state.

## Assurance observed for the working-tree candidate

- `npm run test:unit`: 58 passed;
- installed Google Chrome Playwright suite: 19 passed;
- installed Microsoft Edge Playwright suite: 19 passed;
- the expanded axe WCAG 2.2 smoke test reported no serious or critical
  violations;
- the 320 CSS-pixel, keyboard, focus/history, forced-colour and reduced-motion
  checks passed;
- the formal diff scan found two low-severity robustness issues; both were
  reproduced, fixed and independently re-reviewed with no bypass found;
- a later immutable 44-item candidate snapshot scan completed with no
  reportable finding; its working-tree-change warning and the reviewed
  post-snapshot fail-closed delta are retained in candidate evidence;
- the shared validator rejected every required-lock omission or redirection and
  every standalone builder failed before source consumption;
- executable validators and closed schemas now agree on canonical IDs, URLs,
  timestamps, filter uniqueness, complete records, receipts and Trace relations;
- `npm audit --json`: zero known vulnerabilities; and
- the 30 August link-health audit recorded 161 of 161 unique admitted official
  URLs as reachable by its bounded HEAD method.

These are pre-commit observations. They do not replace pull-request CI,
exact-commit deployment or signed-out live verification.

## Mandatory source and claim boundaries

- Only the 69-record GOV.UK collection and 11-record curated companion
  collection are searchable. The other eight estate entries are descriptors or
  gated candidates; no producer payload was copied or silently admitted.
- `sourceOkfCore` records the producer's native declaration when established.
  `targetOkfCore: "0.2"` records this project's descriptive mapping target. It
  is not a claim that every producer is natively OKF 0.2.
- The GOV.UK imported bytes and Git blob are verified, but the historical
  upstream revision was not available in the local checkout.
- The cached ONS release ZIP has a locally observed SHA-256 but no independently
  retrieved official checksum sidecar.
- `okf-testing` remains quarantined because the local directory is unversioned
  and has no established licence.
- Catalogue or descriptor inclusion never establishes official endorsement,
  current accuracy, access authority or an open licence.

No `gis-ai-go` or OKF source repository has been modified.

## Governance gates

Chris Page's recorded assurance resolves personal ownership, resource-use,
outside-interest and original-code licence questions for this repository.
Public branch/PR publication and Pages deployment are authorised. The following
remain gated:

- do not register for the competition or submit to Devpost without a separate
  instruction;
- do not claim WCAG conformance, official endorsement, comprehensive coverage,
  production readiness or guaranteed accuracy;
- do not describe page-scoped WebMCP as a durable MCP gateway or as provider or
  service-operation integration; and
- do not change an accepted submission after the competition deadline.

## Next safe task

Commit this lockstep candidate in small reviewable commits, open a pull request,
wait for protected-branch checks, merge only when green, and publish the exact
merged `main` commit. Then record signed-out live data/digest/browser evidence.
An actual supported-host WebMCP call, a manual screen-reader observation, the
public demo video and Devpost registration/submission remain subsequent tasks.
