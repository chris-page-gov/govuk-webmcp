# Project status and hard gates

**Status:** the `0.2.0-rc.1` Evidence Trace and bounded-federation release is
public from product commit
`9235ee5db4df637bdb2a12e87449e871614afe68`. Pull request 9 passed the protected
branch boundary and was merged to `main`; exact-main validation run
`33286750188` and Pages run `33286771963` passed. Competition registration is
complete. Devpost project `1406973` remains an unpublished pre-submission draft
with no submission timestamp.

## Current release boundary

The public repository is
[`chris-page-gov/govuk-webmcp`](https://github.com/chris-page-gov/govuk-webmcp).
`main` is protected. The public pre-release is
[`v0.2.0-rc.1`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1),
and <https://chris-page-gov.github.io/govuk-webmcp/> serves the exact tagged
product commit. The deployed `deployment.json` binds that commit to Pages run
`33286771963`. GitHub secret scanning and push protection are enabled.

The release contains:

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

## Assurance observed for the release

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

Pull request 9, exact-main validation run `33286750188` and Pages run
`33286771963` all passed for the product commit. The complete 20-file Pages
artefact was fetched from the public site and every live response returned HTTP
200 with byte-for-byte agreement. A signed-out browser journey passed with no
console warning or error and only successful same-origin data requests. The
post-tag evidence records these observations separately from the immutable
product commit.

On 30 August 2026, the supported `Codex In-app Browser` host discovered all
five tools on that exact public release and returned successful results from all
five. The final `compare_evidence_foundations` call updated the visible
comparison and its canonical result SHA-256 matched the displayed result digest
`3baa3281849855b86e929fd5fad8984580066ac4e275063341c1d9102dc903b1`.
This observation is specific to the named host and time; it does not establish
support in ChatGPT desktop, native Chrome or any other host.

Five silent clips now record genuine interaction with the exact public page for
the analytical index, Evidence Trace, separate facets, comparison and evidence
estate. A consolidated receipt binds every clip to its release URL, required
actions, duration and SHA-256; agent privacy and branding review passed, while
human publication review remains pending. The supported-host scene is explicitly
a receipt visualisation, not a host recording. Continuous macOS window capture
is unavailable in the current environment, so a guarded fallback can render
nine operator-reviewed, hash-bound Safari and VoiceOver frames as a visibly
labelled screenshot sequence. It verifies immutable bytes and declared capture
metadata but does not independently prove assistive-technology use; the manual
journey record and human frame review remain hard gates. The video preflight
still fails closed because the genuine VoiceOver clip, manual journey record and
their media/time binding do not yet exist. No final MP4, captions, transcript or
build receipt has been produced or published.

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
Public branch/PR publication, branch protection, the annotated pre-release and
Pages deployment are complete for `v0.2.0-rc.1`. The following remain gated:

- do not submit to Devpost without a separate instruction;
- do not claim WCAG conformance, official endorsement, comprehensive coverage,
  production readiness or guaranteed accuracy;
- do not describe page-scoped WebMCP as a durable MCP gateway or as provider or
  service-operation integration; and
- do not change an accepted submission after the competition deadline.

## Next safe task

The post-tag evidence is maintained separately from the unchanged product
bytes. Supported-host discovery and calls are now recorded for the exact public
release in `Codex In-app Browser`. The next task is to perform and record a
manual VoiceOver journey in Safari and create the missing
`output/demo-clips/demo-scene-06-voiceover-2026-08-30.mov` and
`docs/competition/evidence/manual-voiceover-journey-2026-08-30.json` with their
exact binding. Then complete the demonstration video, captions, transcript,
build receipt and final Devpost compliance review. A release-platform SBOM or
signed attestation remains unavailable. Completion and submission of the
Devpost pre-draft remain separate actions requiring explicit owner instruction.
