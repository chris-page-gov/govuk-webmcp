# Project status and hard gates

**Status:** the `0.2.0-rc.1` Evidence Trace and bounded-federation release is
public from product commit
`9235ee5db4df637bdb2a12e87449e871614afe68`. Pull request 9 passed the protected
branch boundary and was merged to `main`; exact-main validation run
`33286750188` and Pages run `33286771963` passed. Competition registration is
complete. Devpost project `1406973` remains an unpublished pre-submission draft
with no submission timestamp.

An unreleased local follow-up now adds independent-host and evaluator assurance.
It is working-tree evidence only: it has not been committed, reviewed, deployed
or included in the public pre-release described below.

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
a receipt visualisation, not a host recording.

A manual Safari 26.5.2 and VoiceOver 10 journey was completed on 30 August 2026
without WebMCP. The retained nine-frame, hash-bound Caption Panel sequence is
visibly labelled as not a continuous recording and is bound to the manual
evidence record and generated VoiceOver scene. The observation completed seven
checks and retained two limitations: a heading-rotor selection was not retained,
and the automatic spoken wording of the live search status was not proven.
VoiceOver speech audio was not captured. The Caption Panel and VoiceOver were
turned off after the journey. This one environment does not establish WCAG
conformance.

The guarded local review video was then built at
`output/govuk-webmcp-demo-2026-08-30.mp4`. It is 142.920 seconds long and has
SHA-256 `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`,
H.264 video, AAC narration and an embedded English caption track. The separate
en-GB captions, transcript and build receipt are retained. Its synthetic local
`Daniel` narration is non-silent, with measured input integrated loudness
-16.11 LUFS and true peak -1.38 dBTP. This is a local review build only: owner
review of the synthetic voice, privacy, branding and final playback remains
pending, and no video has been uploaded or submitted.

## Unreleased host-compatibility and evaluator follow-up

A direct `chrome-devtools-mcp` 1.8.0 run against the public release discovered
all five tools, but every attempted execution failed because the host called the
tool callback without an execution-options object and the page dereferenced
`options.signal`. The page's tools remained callable in the separately observed
Codex in-app host, so this is a host-interoperability defect rather than a data
or registration failure.

The local candidate makes execution options and their abort signal optional,
while preserving cancellation whenever the host supplies a signal. The current
working tree has passed:

- all four research-pack checks, including JSON Schema validation through the
  version-pinned `jsonschema` 4.26.0 environment. Setup uses binary-only,
  no-dependency installation plus `pip check`; the unhashed pins and reused
  `.venv` mean this is not a clean or fully reproducible environment;
- 95 unit tests;
- 20 installed-Chrome and 20 installed-Microsoft-Edge browser tests, including
  the omitted-options regression;
- six model-free `webmcp-evals` 0.0.4 smoke calls across three cases and all five
  tools, each returning `ok: true` in the expected result-schema envelope;
- discovery and successful execution of all five tools through
  `chrome-devtools-mcp` 1.8.0 in an isolated Chrome 152.0.7977.64 loopback run
  at 15:53 BST on 30 August 2026, with closed schemas and annotations checked,
  fail-closed rejection of a synthetic `personalContext` field and zero console
  errors;
- an application audit reporting zero known vulnerabilities across 162
  dependencies; and
- two idempotent locked builds of Microsoft WebMCP Explorer 0.1.0 from commit
  `f7091c12420e713b11361630dc1649d5678f62ab` in isolated ignored
  `.tools/webmcp-explorer-build/`. The source checkout remained clean; the
  source-tree, package-lock and unpacked-extension file-manifest SHA-256 values
  (the latter over sorted per-file hashes and paths) were
  respectively
  `b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
  `76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
  and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
  The clean-output allow-list passed.

The unreleased CI and Pages workflow definitions are configured to use
`npm ci --ignore-scripts --no-audit`. Pages is also configured to install the
version-pinned Python requirements and run semantic WebMCP smoke before
deployment. These workflow edits have not yet run in CI or Pages.

The detailed DevTools receipt is stored under ignored `.evals/` because it
contains full tool outputs and describes a local working tree, not a deployed
commit. Raw evaluator smoke rows are deleted after semantic validation. The
ignored smoke receipt retains the six-of-six counts and a digest of the
validated results, not full outputs. Its child process received an isolated
`HOME`; no provider credential environment variables were forwarded, although
it retained
the operating-system filesystem access of the invoking user. The tracked
fixtures also include a no-call case and context-minimisation case for later
model-selection evaluation. The model-backed runner is fail closed until an
exact provider-prefixed model and explicit presentation approval are supplied.
Only the `ollama:` route is preflighted without downloading a model. No remote
provider was called, no model-backed `webmcp-evals` run was performed and the
Explorer extension was not loaded. The prepared browser runner now fails closed
on any typed upstream console error or `pageerror`; only an accepted zero count
can enter a receipt, which records `browserConsoleErrorsAccepted: false`.

The hardened DevTools runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final hardened run
left that modification time unchanged. This is an observed cache boundary, not
an operating-system sandbox claim.

Static triage dated 30 August 2026 found the Explorer npm advisory paths were
not reachable in the exact production build path. Operational risks remain:
`<all_urls>` access, persistent `chrome.storage.local` credentials,
`dangerouslyAllowBrowser`, no prompt-injection mitigation and autoexecution in
Agent Run/Chat. Any later Explorer run must use a disposable profile, inspect
the Tools pane first without a credential, then prefer a local loopback model
and Agent Step, and delete the profile afterwards. A remote run is exceptional
and must use a revocable low-limit key and no personal context.

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
  service-operation integration;
- do not publish the local review video until the owner has approved the
  synthetic-voice publication basis, privacy, branding and final playback; and
- do not change an accepted submission after the competition deadline.

## Next safe task

Review and integrate the optional-execution-options compatibility fix and its
pinned test harness through the protected pull-request path, then deploy and
repeat native DevTools plus exact `list_webmcp_tools` and
`execute_webmcp_tool` capture against that deployed commit. After that, use a
disposable Microsoft WebMCP Explorer profile: inspect Tools first without a
credential, prefer an exact local loopback model and Agent Step, then delete the
profile. Use a revocable low-limit key and no personal context only if a remote
run is necessary. Run the fixed-model `webmcp-evals` fixture with
`WEBMCP_EVAL_PRESENTATION_APPROVED=1`; only `ollama:` is preflighted without a
download. Record whether processing is local or remote. These steps are needed
before the new host claims enter the demonstration or Devpost text.

The existing owner privacy, branding, synthetic-voice and complete-playback
review remains open. Public video upload and completion or submission of the
Devpost pre-draft remain separate actions requiring explicit owner instruction.
A release-platform SBOM or signed attestation remains unavailable.
