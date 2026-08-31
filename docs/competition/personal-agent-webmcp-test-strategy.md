# Personal-agent WebMCP test strategy

## Purpose

This strategy tests the proposition that a public service can publish governed
static evidence and small, bounded page tools while a citizen-selected AI uses
permitted context to decide which action is relevant. The service should
receive only the explicit, validated tool input it needs, rather than operating
a government-hosted general-purpose assistant or collecting an unrelated
personal profile.

This is the product boundary the submission must make obvious: OKF exposes the
governed evidence plane; WebMCP exposes bounded actions over it; and the
citizen-selected AI contributes contextual reasoning without making the public
page host an AI or accept a general personal-context object.

The [user-supplied ChatGPT research](https://chatgpt.com/share/6a942aa1-cd04-83eb-af1d-a0c73074c736)
is a secondary research input. Its proposed four-layer evidence stack is adopted
below where it is supported by the linked primary sources. Product, security and
compatibility claims must continue to follow the primary evidence and observed
test results rather than the generated research text.

This is a cost and privacy hypothesis, not a measured saving or a guarantee that
a personal agent will ask better questions. A later comparison must measure
government-origin requests, bytes, compute and support effort against a defined
server-side AI baseline. It must not count the citizen's model cost as if it had
disappeared. This measurement is evaluation E-34 and backlog Should 12; it is
planned work, not current prototype evidence.

The federated candidate extends the evidence plane, not the privacy or cost
claim. Its detailed gates are in the
[OKF federated personal-agent evaluation plan](okf-federated-personal-agent-evaluation-plan.md)
and its architecture decision is
[ADR-0004](../adr/0004-okf-federated-discovery-and-evidence-tiers.md).

## Intended boundary

```text
citizen and permitted personal context
                |
                v
citizen-selected agent and model
  |             |
  |             +---- remote provider, if selected
  |                   (prompt, tool metadata and results may leave the device)
  v
browser host discovers and calls fixed page tools
                |
                v
same-origin, digest-validated evidence contracts
  |                               |
  v                               v
80 receipt-bound records    58,652 searchable records from
                            58,655 locked rows in four OKF snapshots
                |
                v
bounded result with source links, assertions and limitations
```

The published page must not request a profile, identity, location history,
browsing history or unrelated conversation context. Closed schemas and
executable validation admit only the query, filters and identifiers required
for the selected action. The static page does not call a model provider and
does not make runtime calls to official APIs. Those properties reduce the
service-side data surface; they do not control what a separately selected agent
or remote model provider retains. A free-text query can still contain personal
data if a caller puts it there, so the agent should derive a general,
task-minimal query rather than forwarding a profile or conversation extract.

A local model can keep model inference on the citizen's device, but ordinary
page requests still reach the site and local software can still log data. With a
remote model, assume that the prompt, exposed tool descriptions, tool arguments
and returned source-derived data may be sent to that provider. State the chosen
host, model location and provider policy in every demonstration receipt.

## Federated OKF candidate boundary

The candidate adds four independently republished OKF source snapshots:

- 9,757 A Life in the UK records, including 293 service families;
- 5,097 ONS metadata records;
- 41,598 UK Government APIs records; and
- 2,203 HM Land Registry public-estate metadata rows, of which 2,200 are
  searchable.

Their locked raw sum is 58,655 rows before cross-source deduplication. Exactly
three standalone Land Registry legislation rows are quarantined, leaving
58,652 searchable federated records. Neither total is a unique-record count,
and the federated tier remains separate from the 80 local records
with packaged deep-evidence receipts. Every human and tool result must name its
evidence tier and preserve the producer's route, snapshot, source links and
limitations. A federated result does not acquire a local receipt merely because
the application returns it.

There is no standalone UK Legislation collection, payload, index or runtime
request, and the searchable projection contains zero `legislation.gov.uk`
result links. The four named collections retain 28 source-authored cross-
reference strings as inert, untrusted metadata—6 in A Life in the UK, 3 in ONS,
2 in UK Government APIs and 17 in Land Registry—so literal source-byte absence
is not claimed. Tests must prove that those strings cannot create a fifth
collection, request or apex/subdomain legislation result link. A failed source remains visibly
unavailable while unaffected sources and the validated 80-record tier continue;
the application must not replace it with an unverified fallback.

One exact ordered contract binds source/quarantined/searchable counts for every
collection: 9,757/0/9,757 for A Life in the UK, 5,097/0/5,097 for ONS,
41,598/0/41,598 for UK Government APIs and 2,203/3/2,200 for HM Land Registry.
Executable validation also binds each title, ordered supplementary counts,
completeness statement and first limitation, so a co-digested per-source
redistribution or contradictory display claim fails closed.

The OKF publications are independent discovery republications, not official
government services or endorsements. They do not grant access, establish an
open licence, provide service advice or prove current source accuracy. No
federated behaviour becomes submission evidence until its exact candidate has
passed the new deterministic, browser, live-host and release-binding gates.
Federated links and assertions must remain producer-declared rather than
official; exact-record output reports source authority as “Not independently
established”, and the human route displays the recorded destination hostname.

The working tree contains remediations for nine Low security findings. Sealed
scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed seven earlier findings
and found one further High-confidence Low trailing-dot and secondary
legislation-URL bypass (`csf_a2d9e030fda789ecd1cb0e41`), which was fixed after
its snapshot. The scan reported no other open reportable candidate, but its
coverage is mechanically partial and has stale-pending rows. Focused security
checks passed 119 of 119, then the affected post-fix subset passed 23 of 23.
The current research, build/data, lexical-quality, Chrome, Microsoft Edge and
authorised model-free smoke gates pass where recorded. The full unit command
passed 173 of 173 in `17128.154916 ms` before the latest three engineering
remediations.

Immutable scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` later completed 55 of
55 review items and reported the ninth, High-confidence Low co-digested source-
substitution finding (`csf_050a3c08c471d3176e0640c3`). Separately code-
reviewed source pins, a direct builder lock-byte check and mutation regressions
now remediate it. Immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items against
exact commit `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable
findings.

Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` subsequently completed
50 of 50 review items and dynamically reproduced mutable local-model identity
evidence, aggregate-only per-source population binding and cancellation-driven
physical shard-work amplification. Attack-path review classified zero as
reportable vulnerabilities because the paths require privileged model-service
control, repository/build or same-origin write authority, or cause bounded
self-availability impact. The defects have working-tree remediations anyway.
The exact post-remediation local chain now passes research 4 of 4; build/data
validation with 80 reviewed records and 80 receipts, 58,655 raw rows, 3
quarantined rows, 58,652 searchable rows, 120 record shards and 1,733 postings
shards; 194 of 194 prepared unit tests; frozen quality at mean nDCG@10
`0.984698009`, Recall@20 `1`, cold/warm parity, no legislation collection and a
rejected legislation request; 30 of 30 tests in both Chrome and Edge; six of
six model-free WebMCP smoke calls in real Chrome; zero npm-audit vulnerabilities
across 162 total dependencies; and a clean `git diff --check`. The immutable
scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` completed 55 of 55 items and
retained one Low co-digested source-substitution finding. Separately code-
reviewed pins for all five sources, a direct builder lock-byte check and
mutation regressions remediate it. Immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 items against exact
commit `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
Protected CI, Pages deployment and supported-host evidence are complete. The
current-release manual Safari and VoiceOver journey also completed with 7
passes and 2 retained limitations. Its Caption Panel media is a 27-second
non-continuous screenshot sequence; VoiceOver speech audio was not captured and
no WCAG conformance is claimed. The guarded pipeline produced a technically
reviewed 156.023-second local MP4 with SHA-256
`e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`.
H.264 video, AAC audio, English captions, complete video/audio decode and all 40
normalised caption cues passed. A passing model-backed evaluation remains
optional assurance. Owner playback, privacy, branding, rights and synthetic-
voice publication review, public-player verification and Devpost submission
remain prerequisites for the corresponding publication claims.

The final-candidate demonstration preflight correctly failed closed because no
deployed commit and no explicit overwrite approval were supplied. It did not
start live capture and must not be used as supported-host or video evidence.
After deployment, the separately bound current-release captures, VoiceOver
record and local video build passed the guarded path; they do not retroactively
change that historical failure or prove public upload or submission.

The physical shard layer admits at most 4 active loads, 32 queued loads and 36
distinct in-flight files. Each 3-second file deadline begins before queueing,
and a physical slot remains held until the underlying loader actually settles.
This stops cancelled logical calls from amplifying physical work. If four non-
cooperative loaders never settle, all four slots can remain occupied and
federated loading can remain unavailable; the runtime fails closed rather than
starting another load. Queue or immediate pre-loader deadline expiry is
reported as scheduler busy rather than source corruption.

## Four complementary evidence layers

No one layer proves the whole claim. Run them in the sequence below so contract
or host-compatibility failures are found before a model-backed demonstration.

### 1. Native Chrome or Edge DevTools

Use the browser's WebMCP panel to inspect the live page, its schemas and its
invocation history, then invoke representative tools through the panel controls.
Chrome documents the Available Tools and Invoked Tools views, schema errors and
manual execution in its
[WebMCP DevTools guidance](https://developer.chrome.com/docs/devtools/application/webmcp).
The retained corrected-main capture used Playwright to operate those native
panel controls; it is native-panel evidence, not a claim of manual operation.
[Microsoft Edge 149 release notes](https://learn.microsoft.com/en-us/microsoft-edge/devtools/whats-new/149)
list WebMCP debugging as an inherited Chromium feature; record the exact Edge
build rather than infer compatibility from Chromium alone.

The research referred to “both tools”, but this release exposes five. Capture
all five names and schemas, then execute through the panel controls at least:

- `search_government_knowledge`, proving a read-only result with an authoritative
  link, assertion status and limitation; and
- `explore_answer_foundations`, proving the reversible presentation effect and
  visible page update.

Also submit one invalid input and retain the rejection. A screenshot alone is
insufficient: save the exact input, output or error, invocation status, browser
version, feature state, page URL and deployed commit in
`docs/competition/evidence/native-devtools-webmcp-2026-08-30-edd4ce6.json`. Add the
screenshots by path and SHA-256, without cookies, headers or personal data.

This route was completed against the corrected public deployment on 30 August
2026 in a disposable Chrome 152.0.7977.64 profile. The launch enabled
`WebMCP`, `DevToolsWebMCPSupport` and `WebMCPTesting`; Chrome's release guidance
describes the corresponding `#devtools-webmcp-support` and
`#enable-webmcp-testing` flags. The native Application → WebMCP panel listed
the exact five tools and recorded five completed valid calls. The two
presentation calls produced the same displayed-result digest prefixes as the
canonical results, with the comparison rendering 11 separate facet rows.
`limit: 21` was accepted by the panel form but the executable tool validation
returned the structured `invalid_search_request` result with `ok: false`. The
panel was driven through its own Paste and Run controls over a loopback-only
Playwright attachment to the disposable DevTools frontend because the macOS
accessibility bridge exposed keyboard focus but not a working pointer action
for the tool cards. This is deterministic native-panel execution evidence, not
an AI-agent or model-selection run.

### 2. Microsoft WebMCP Explorer

The [Microsoft Edge WebMCP Explorer pinned at
`f7091c12420e713b11361630dc1649d5678f62ab`](https://github.com/MicrosoftEdge/webmcp-labs/tree/f7091c12420e713b11361630dc1649d5678f62ab/webmcp-explorer),
not an unpinned moving branch, has been prepared but not loaded. Its README
documents manual tool execution,
agent and chat modes, Anthropic, OpenAI, Azure OpenAI and OpenAI-compatible
endpoints including Ollama and LM Studio.

Use a tool-calling local model first if it is capable enough. This demonstrates
that the page does not require a government-hosted model. An Anthropic run may
then provide an independent remote-provider comparison, but it changes the data
boundary and is not needed to prove local execution. Record the Explorer commit,
extension build digest, browser build, provider class, exact model identifier,
prompt, discovered tool list, proposed calls, approvals, results, console errors
and final visible state in
`docs/competition/evidence/webmcp-explorer-2026-08-30.json`. Record only whether
a credential was configured, never the credential itself.

Explorer is a privileged development harness, not a security oracle. Its pinned
README warns that page tool metadata and results are passed to the model as-is.
The extension requests `<all_urls>`, can persist credentials in
`chrome.storage.local`, sets `dangerouslyAllowBrowser`, has no prompt-injection
mitigation and can autoexecute Agent Run/Chat. Run it only against this
controlled site in a disposable profile. Inspect Tools first without a
credential, keep iframe discovery off unless required, then prefer an exact
local loopback model and Agent Step. Require explicit approval for presentation
tools, include an adversarial source-text case that must remain data rather than
instructions, and delete the disposable profile afterwards. If a remote run is
necessary, use a revocable low-limit key and synthetic prompts without personal
context. This follows the WebMCP community's current [security and privacy
considerations](https://github.com/webmachinelearning/webmcp#security-and-privacy-considerations).

`npm run webmcp:explorer:setup` prepares the exact pinned source and unpacked
build in isolated ignored `.tools/webmcp-explorer-build/` with
`--ignore-scripts`. It ran twice idempotently, verified its clean-output
allow-list and left the pinned source checkout clean. The source-tree,
package-lock and unpacked-extension file-manifest SHA-256 values (the latter
over sorted per-file hashes and paths) are
`b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
`76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
Static triage dated 30 August 2026 found the npm advisory paths were not
reachable in that exact production build path; the operating risks above
remain. The script does not load the extension or configure a provider, and no
Explorer browser execution or model selection is claimed.

### 3. Codex with Chrome DevTools MCP 1.8.0

Pin [`chrome-devtools-mcp` 1.8.0](https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/chrome-devtools-mcp-v1.8.0)
and enable its experimental WebMCP category. Version 1.8.0 requires Chrome 150+
with `--enable-features=WebMCP`; its [tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/chrome-devtools-mcp-v1.8.0/docs/tool-reference.md#webmcp)
defines the two exact MCP operations for a selected page:

1. `list_webmcp_tools` with the selected `pageId`;
2. `execute_webmcp_tool` with that `pageId`, `toolName` and JSON-stringified
   `input`.

Capture the unabridged tool-list response, followed by exact calls for the same
read-only and presentation cases used in the native panel. Record server version,
Chrome version, launch flags, selected page URL, deployed commit, MCP request and
response, page console output, resulting URL and visible state in
`docs/competition/evidence/chrome-devtools-mcp-2026-08-30-edd4ce6.json`.

A real 1.8.0 public-page run found a compatibility defect before this strategy
was written. `execute_webmcp_tool` returned
`{ "status": "Error", "errorText": "" }`; the page console reported
`WebMCP tool execution failed: Uncaught TypeError: Cannot read properties of undefined (reading 'signal') (0 args)`.
All five callbacks required and dereferenced the execution-options argument,
while Chrome DevTools MCP and `webmcp-evals` invoked them with input only. The
fix direction is to make execution options optional and forward an abort signal
only when the host supplies one. Keep cancellation behaviour when a signal is
available and retain a browser regression for the omitted-options path. The
post-fix list and execution receipt remains the acceptance evidence; a passing
unit test alone does not replace it.

The final hardened local capture at 15:53 BST on 30 August 2026 used Chrome
152.0.7977.64, discovered and executed all five tools, checked their closed
schemas and annotations, rejected synthetic `personalContext` and recorded zero
console errors. The runner set `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An
earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final rerun left
that modification time unchanged. Its receipt remains private under `.evals/`.
The unchanged, checksum-bound `v0.2.0-rc.1` evidence remains at the earlier affected commit; the
later protected-main deployment contains the correction.

The repository now prepares the exact post-deployment rerun without broadening
the capture boundary. `WEBMCP_DEVTOOLS_TARGET_URL` accepts only the project
Pages URL, and `WEBMCP_EXPECTED_COMMIT` can require the protected-main commit.
Before Chrome starts, the runner validates the public `deployment.json`
schema, repository, commit and Pages run and binds the metadata digest into a
separate ignored public-target receipt.

The post-deployment capture completed against protected-main commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and Pages run `33323152751`.
Chrome DevTools MCP 1.8.0 in isolated Chrome 152.0.7977.64 discovered the exact
five tools, completed all five calls, rejected synthetic `personalContext` and
recorded no console errors. The capture bound the validated public
`deployment.json` digest and the five deterministic result digests. The
reviewed receipt is retained alongside the raw ignored capture; no model was
selected or contacted.

### 4. `webmcp-evals` 0.0.4

Pin [`webmcp-evals` 0.0.4](https://github.com/GoogleChromeLabs/webmcp-tools/tree/webmcp-evals-v0.0.4/webmcp-evals),
published from the [Google Chrome Labs WebMCP tools
repository](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals).
Use its three modes for different claims:

- `smoke` executes authored expected calls against the live page without a model
  or API key. Each of the six calls must return `ok: true` in its expected
  result-schema envelope. This is the deterministic browser contract gate, not
  a complete payload-equivalence check.
- `local` evaluates model selection against a static tool-schema file. It tests
  descriptions, schemas and expected arguments without page execution.
- `browser` lets the selected model choose and execute live page tools. It tests
  the end-to-end selection and execution path.

Do not call model-backed `local` or `browser` results deterministic. Pin the
package, backend, exact model identifier, evaluation fixture and run count;
repeat ambiguous cases and report variance and valid alternative trajectories.
Keep the deterministic smoke gate model-free.

The repository wrapper requires an explicit provider-prefixed model, defaults
to three bounded runs, uses the upstream six-step cap plus a 30-minute process
timeout, requires `WEBMCP_EVAL_PRESENTATION_APPROVED=1`, and rejects a context-
minimisation result unless the model sends exactly `query`, `collections` and
`limit`, with `collections: ["deep-evidence"]` and no unused optional arrays.
Only the `ollama:` route is preflighted without a download: it permits loopback
only and checks that the exact model is already installed. Receipt v2 also
requires an otherwise-successful local run to bind that exact `/api/tags`
identity before and after evaluation to the daemon-reported loaded identity
from `/api/ps` afterwards. Missing, ambiguous or mismatched evidence fails the
run. This is daemon-reported post-run evidence, not cryptographic proof that an
individual response came from particular weights. Redirects, mismatched
`name`/`model` fields and `remote_model` or `remote_host` markers fail before
evaluation; an Ollama-labelled cloud proxy must use the explicit remote-
provider path and approval. A remote provider
also requires `WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1` and the appropriate API
credential. Both local and remote commands must include the presentation
approval. A ChatGPT, Claude or Gemini consumer subscription does not itself
provide a CLI API credential.

The model-free smoke child receives an isolated `HOME` and no provider
credential environment variables are forwarded. This limits inherited
configuration, but the child retains the operating-system filesystem access of
the invoking user. After semantic validation, the wrapper deletes raw smoke
rows and retains counts plus a results digest; only the separate DevTools
receipt retains full tool outputs.

The prepared model-backed browser runner validates and fails closed on any
upstream console error or `pageerror`. Acceptance can record only
`browserConsoleErrorCount: 0`, with
`browserConsoleErrorsAccepted: false`.

Five local attempts used Chrome 152, `webmcp-evals` 0.0.4, eight cases, three
runs per case (24 case executions), 33 expected rows and exact loopback-only
model `ollama:gpt-oss:20b`, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. The pre-legibility attempt passed 8 of 102 retry-
expanded rows. After schema, tool-description and fixture legibility changes,
attempt 2 passed 33 of 33 upstream rows but the strict verifier accepted 32 of
33 because one call added empty optional arrays. Attempt 3 on the security-
fixed tree passed 30 of 35 upstream rows after two malformed-then-corrected
provenance IDs and one omitted comparison. Receipt-v2 attempt 4 at 01:53 on 31
August 2026 bound stable exact identity and exited zero, but structural
validation failed and its evaluation was null. Receipt-v2 attempt 5 at 02:13 used
fixture digest
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f` and
reported 36 rows for 33 expected rows, including 3 retries: 30 passed, 6 failed,
and none errored, were missing or produced console errors. All three provenance
trajectories first supplied a malformed canonical ID, were rejected, then
recovered with a correct successful call. `verify-reports` failed. All five
failed overall. Preserve their private reports as failure and variance evidence;
do not call legibility or fail-closed recovery a model-backed pass.

The first three historical attempts predate receipt v2 and are not upgraded by
the new identity rule. Attempts 4 and 5 bound stable pre-run, post-run and loaded-model
identity at the digest above and recorded `executionBound: true`. Its private
JSON and HTML reports are represented in tracked documentation by SHA-256 values
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and
`3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.
Privileged control of the local account, model daemon or
evidence channel, tag changes between observations and a previously loaded
model remain outside the receipt's trust boundary.

The wrapper initially stores private JSON, HTML and sanitised receipt files
beneath ignored `.evals/webmcp-browser/`. After human review, copy only the
approved evidence summary, command boundary, fixture and report SHA-256 values
into `docs/competition/evidence/webmcp-evals-2026-08-30.json`. Exclude `.env`,
API keys, cookies, browser-profile data, raw unreviewed reports and unredacted
network headers.

## Safe test environment

For every agent-backed run:

- use a temporary, isolated browser profile with no personal browsing history,
  saved credentials, extensions or unrelated open tabs;
- allow only the deployed project origin and the explicitly selected model
  endpoint; block or record all other destinations;
- enable network-header redaction and disable optional usage telemetry and CrUX
  lookups where the harness supports those controls;
- use synthetic prompts and the public fixture only;
- require confirmation before a tool with a page-presentation effect and never
  broaden the test to transactional or authenticated sites;
- use an isolated `HOME` for third-party child processes while recognising that
  this does not remove their operating-system filesystem access;
- preserve console and network failures, including empty error strings, rather
  than editing them out of the demonstration; and
- checksum the receipt, screenshots and generated reports, then bind them to the
  exact deployed commit.

The Chrome DevTools MCP project itself warns that an MCP client can inspect or
modify data in its browser instance. Isolation and URL allow-listing are
therefore test controls, not optional tidying.

## Acceptance and submission wording

The evidence stack passes only when the same deployed commit:

1. lists exactly the five intended tools and their closed schemas;
2. rejects invalid and additional inputs;
3. returns the common bounded source-derived result and its evidence tier
   through the human interface and captured host executions, while
   deterministic smoke independently proves only its authored expected-schema
   envelopes, not full payload equivalence or model selection;
4. visibly applies and can reverse the two presentation effects;
5. retains reviewed authoritative links and federated producer-declared links,
   destination hostnames, assertions, limitations and the untrusted-output
   boundary in every path without promoting federated authority;
6. records no unexpected network destination or durable page storage, and
   reports query-derived static-asset requests rather than treating them as
   proof that no activity is visible to a host;
7. shows isolated partial-source failure without disabling the 80-record tier
   or silently weakening integrity; and
8. shows repeated fixed-model selection runs, with the exact model, provider
   boundary, receipt-v2 local daemon identity where applicable, failures and
   variance reported rather than hidden.

Safe submission wording is: “Independently republished OKF snapshots make
governed public-sector evidence progressively retrievable. WebMCP exposes
bounded actions over that evidence to a citizen-selected AI, while the person
sees the same sources and limitations. The page hosts no model and its schemas
do not accept an identity, profile or general personal-context object.” Always
state that a remote provider may see
prompts, tool metadata, arguments and results. Do not claim that the
architecture is private by default, that a personal agent is always more
accurate, that 58,655 raw rows means unique records, or that the design has
already saved public money. Those remain hypotheses to be measured.

Current official compliance requires completion by 1:00 pm PDT on 3 September
2026, a public source repository with a visibly detectable open-source licence,
a public YouTube demonstration under three minutes with audio and the exact live
project accessible in ChatGPT's in-app browser or Chrome with WebMCP enabled.
Freeze the repository, live project and submission after the close. These are
requirements, not claims of registration, submission or a public upload.
