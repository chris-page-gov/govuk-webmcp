# Security policy

## Supported boundary

This is a bounded experimental prototype, not a production service. Security
claims apply only to the exact code and generated artefacts that were tested.
Repository documentation is not proof that the same revision is merged,
deployed or available through a particular browser host.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for this repository. Include the affected commit,
browser, reproduction steps, impact and any relevant console or network output.
Do not include credentials, personal data or unpublished public-sector
information.

The maintainer will acknowledge a report as soon as practical, assess it
against the static deployment boundary and coordinate a safe fix or documented
disposition. There is no bug bounty or guaranteed response time.

## Application security boundary

The application is static and loads only packaged, same-origin data. It makes no
runtime provider API call, creates no account and uses no cookies, analytics,
local storage, session storage or persistent server-side application storage.
Following a reviewed authoritative link or a federated producer-declared link
leaves this boundary.

Five logical artefact families gate all WebMCP registration: the 80-record
catalogue, 80 evidence receipts, one Evidence Trace collection, the 10-entry
federation manifest and the lazy federated-search manifest. Each raw file must
match its SHA-256 sidecar. Schemas, internal digests, record-to-receipt
bindings, catalogue-to-trace bindings, catalogue-to-federation bindings and
the federated record-count binding must also pass. A failure in any root family
leaves a human-readable failure state and prevents every tool registration; no
partial tool set is accepted.

The frozen reviewed evidence estate is derived from four exact source locks;
the current working candidate adds a separate federation lock through the
registry. Recompute the exact registry, admission and schema totals after the
exact-tree rescan. Integrity checks bind the packaged bytes and declared relationships. They are not
signatures from a government body and do not prove official endorsement,
current accuracy, access authority or an open licence.

Source-derived titles, descriptions and limitations remain untrusted data.
They are rendered as text, and admitted links must be credential-free HTTPS
URLs without explicit ports. Catalogue and Evidence Trace links use the bounded official-host
allowlist. The frozen pre-federation manifest uses a separate, exact GitHub
repository allowlist under `chris-page-gov` without admitting producer payload.
The `0.3.0-rc.1` build instead admits only four explicitly locked static
publication routes and mirrors only their declared search artefacts. An apex,
`www` or other subdomain `legislation.gov.uk` URL selected as a federated result
link fails projection. The page still performs no cross-origin producer fetch
at runtime. WebMCP output is also labelled as untrusted content.

## In-progress federated snapshot boundary

Version `0.3.0-rc.1` is adding a separate, digest-bound discovery plane for
exactly four independently republished OKF snapshots: A Life in the UK, ONS,
UK Government APIs and HM Land Registry. Their 58,655 locked raw rows remain
separate from the 80 reviewed records and item-level receipts. Exactly three
standalone Land Registry legislation rows are quarantined, leaving 58,652
searchable federated records. There is no standalone UK Legislation collection,
payload, index or runtime request, and the searchable projection contains zero
`legislation.gov.uk` result links. The locked files retain 28 source-authored
cross-reference strings as inert, untrusted metadata—6 in A Life in the UK, 3
in ONS, 2 in UK Government APIs and 17 in Land Registry—and do not claim literal
source-byte exclusion.

The build may mirror only the files named by the locked descriptors and search
manifests into generated same-origin paths. The browser runtime does not fetch
an OKF publisher or official operational API. Candidate validation must reject
unknown origins, credentials, explicit ports, redirects, path traversal,
undeclared files, unsupported contracts, snapshot conflicts, a legislation
collection or request and legislation result-link hosts before source-derived
content is consumed. A source-authored cross-reference string remains inert
data and cannot define a source or request.

Raw checksums alone are insufficient. Tests must also reject co-digested changes
to source identity, record count, snapshot, entry point, shard reference and
cross-artefact binding. Fixed request, compressed-byte, decoded-byte, decoded-
row, retained-text, shard-fan-out, worker-lifetime and timeout budgets constrain
progressive loading. A corrupt or unavailable lazy source must be reported as a
partial source failure without becoming trusted through a fallback or disabling
the validated 80-record tier. Root lock or manifest failure still prevents all
tool registration.

Same-origin response bodies are consumed incrementally under the fixed byte cap
rather than buffered in full before checking. `Content-Length` is parsed
strictly; declared overflow, streamed overflow, an empty body or a missing body
fails closed. The generated-plane builder uses bounded cleanup retries because
Finder can recreate `.DS_Store` during removal; static copying excludes
`.DS_Store`, and `dist` is cleaned before compilation so operating-system
metadata cannot enter the release artefact.

Federated trust remains conservative. Producer wording cannot promote a link or
assertion to official status. Exact-record output reports source authority as
“Not independently established”, retains a producer-declared link role and
shows the recorded destination hostname in the human interface.

Eight Low findings have implemented remediations:

| Finding | Remediation state |
| --- | --- |
| Crafted token distribution causes superlinear postings generation (`csf_d6045d8bfb6836f0a274850d`) | Incremental exact-byte partitioning and aggregate token, posting and generated-byte caps implemented |
| Land Registry metadata-only limits are not enforced per row (`csf_628dded1ed9a62431cf1f121`) | Exact row classification, prohibited-field rejection and three-record legislation quarantine implemented |
| Mutable source artefacts can retain fixed revision claims (`csf_a685f5df80a811659b866345`) | Mutable-source and fixed-revision consistency checks implemented |
| One federated collection can suppress healthy sources (`csf_e9078180b75895a09a282bda`) | Per-source failure isolation implemented |
| Producer text can self-promote arbitrary links and assertions to official status (`csf_13ddf953dc16e399c8c04f03`) | Producer-declared labels, unestablished authority, destination display, explicit-port rejection and legislation-host rejection implemented |
| The constructor token can crash the federated build (`csf_5b3f067459df708770da0536`) | Prototype-safe token maps implemented |
| Concurrent WebMCP calls amplify uncached shard work (`csf_afca5f27e901f0db4b730cc7`) | Per-runtime in-flight fetch sharing implemented |
| Trailing-dot and secondary legislation URLs bypass the excluded-host boundary (`csf_a2d9e030fda789ecd1cb0e41`) | Generator and runtime canonical-host checks cover primary and secondary URLs, including trailing-dot forms |

Sealed scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven
findings and identified the eighth with High confidence and Low severity. It
recorded no other open reportable candidate, but its coverage has mechanically
partial and stale-pending rows, and the eighth fix postdates its snapshot. A
focused security batch passed 119 of 119 and the affected post-fix subset
passed 23 of 23. These are implemented candidate controls, not completed
release security evidence. Gates A–I and M, the immutable exact-tree security
rescan must pass against one exact release candidate
before the findings are described as verified fixed for release. The exact
research, build/data, lexical-quality, installed-Chrome, installed-Microsoft-
Edge and authorised model-free smoke gates pass where separately recorded. The
current `npm run test:unit:prepared` also passed 173 of 173 in
`17128.154916 ms`.

## Action and input boundary

The human interface and all five WebMCP tools use one deterministic action
controller. Three tools only query verified packaged data and declare
`readOnlyHint: true`. The two evidence exploration tools change reversible,
transient presentation state and therefore declare `readOnlyHint: false`; they
do not change sources, browser storage, the network or external state.

Tool schemas are closed and bounded, and executable code revalidates every
input. Before dispatch, the shared input budget accepts at most 16 plain root
keys, each at most 128 characters, without walking rejected nested values or
executing accessors. Root-key enumeration is still proportional to the root
object presented by the caller. Only accepted, bounded diagnostic inputs are
hashed. Rejected, cyclic, accessor-backed or over-budget input receives no
input digest. Result diagnostics bind the serialised deterministic result
instead.

Human URL-fragment routing is also bounded. Raw fragments over 1,024 characters
are discarded, comparison values are length-limited, and comparison accepts
only two to four exact claim identifiers. Malformed routes fail closed to the
default evidence view.

## WebMCP boundary

The five tools are registered imperatively into the current page when a
compatible secure host exposes `document.modelContext`. This page-scoped
integration is not an independently callable or durable MCP gateway. It has no
provider-authentication facility, persistent session, service operation or
durable tool receipt, and it does not prove that a particular browser or agent
host has discovered or called the tools.

The page neither hosts a model nor asks for unrelated personal context. This is
a page-contract property, not a security claim about a citizen-selected agent.
The browser host can observe tool definitions, inputs, outputs and visible page
state. A remote model provider may also receive those items and relevant prompt
context. A correctly configured local model can keep inference local, but the
host, model runner and browser can still log data. Only bounded, action-specific
inputs belong in page-tool calls.

## Independent harness security

Native browser developer tools, Microsoft WebMCP Explorer, Chrome DevTools MCP
and `webmcp-evals` have broader browser access than the page itself. Treat them
as privileged development harnesses, not production dependencies or security
oracles. Pin package versions and extension source revisions, verify the
resolved dependency lock and build from the recorded source before use.

Every independent run must:

- use a fresh, isolated browser profile with no accounts, saved credentials,
  personal extensions, history or unrelated tabs;
- restrict navigation to the exact local or deployed project origin and the
  deliberately selected model endpoint;
- use only synthetic prompts and the public fixture, with no personal data,
  credentials or unpublished public-sector information;
- redact network headers and disable optional telemetry or CrUX lookups where
  the harness provides those controls;
- require explicit approval before a presentation tool is allowed to alter the
  visible page state; and
- retain exact failures and unexpected network destinations for review rather
  than removing them from the record.

Explorer passes page-supplied tool metadata and results to the selected model,
so source-derived text remains untrusted and must not become an instruction to
the harness or model. Chrome DevTools MCP can inspect and modify its browser
instance; it must never attach to a personal browsing profile. Upstream
`webmcp-evals` browser runs may disable the Chromium sandbox, so run them only
against this controlled fixture under an unprivileged local account, never on
an authenticated or sensitive site.

The hardened Chrome DevTools MCP runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST on 30 August 2026; the
final 15:53 BST rerun left that modification time unchanged. This observed
boundary does not turn the privileged harness into an operating-system sandbox.
The prepared model-backed browser-evaluation wrapper also rejects any upstream
console error or `pageerror`, validates the diagnostic shape and records
`browserConsoleErrorsAccepted: false`. Three local runs used Chrome 152,
`webmcp-evals` 0.0.4, eight cases, three runs per case and exact loopback model
`ollama:gpt-oss:20b`, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
without remote credentials. The pre-legibility attempt passed 8 of 102 retry-
expanded rows; attempt 2 passed 33 of 33 upstream rows but 32 of 33 under the
strict verifier because one call added empty optional arrays; and attempt 3 on
the security-fixed tree passed 30 of 35 upstream rows after two malformed-then-
corrected provenance IDs and one omitted comparison. All three failed overall;
their private reports remain failure and variance evidence, not a security or
model-selection pass.

The native Chrome-panel capture used a separately named temporary Chrome app
clone, a disposable profile, no extensions or sign-in, loopback-only remote
debugging and the exact public origin. Playwright attached only to that
DevTools frontend. To exercise the panel's native Paste control without reading
or replacing the Mac clipboard, the capture temporarily replaced
`navigator.clipboard.readText` inside the disposable DevTools page and restored
it before each Run action. The exact temporary browser process and profile must
be stopped and removed after capture; neither is submission evidence.

The model-free evaluator wrapper forwards no provider credential environment
variables and gives the child an isolated `HOME`. This reduces inherited
provider configuration; it is not an operating-system sandbox. The child still
has the filesystem access of the invoking user. Raw smoke rows are deleted
after semantic validation, and only counts plus a results digest remain in the
ignored smoke receipt. The ignored DevTools receipt is the only one of those two
receipts that retains full tool outputs.

Static triage dated 30 August 2026 found that the npm advisories reported for
the exact Microsoft WebMCP Explorer 0.1.0 build are not reachable in that
production extension path. This narrow result is not a general security
clearance. The extension requests `<all_urls>`, can persist credentials in
`chrome.storage.local`, sets `dangerouslyAllowBrowser`, has no prompt-injection
mitigation and can autoexecute Agent Run/Chat. Do not silently run
`npm audit fix`, because that would replace the evidenced upstream dependency
graph.

Any Explorer execution must use a disposable browser profile. Inspect the Tools
pane first without a credential, then prefer an exact local loopback model and
Agent Step. Delete the profile afterwards. If a remote run is necessary, use a
revocable low-limit key and synthetic prompts without personal context. Do not
use Agent Run or Chat autoexecution for acceptance evidence. The current record
contains the isolated, idempotent build only; it does not claim an Explorer
browser execution or model selection.

Provider secrets belong only in the harness's approved local credential
mechanism or process environment. Never write them into commands, fixtures,
screenshots or receipts. Generated JSON and HTML reports can contain prompts,
tool schemas, arguments, results, trajectories, console output and URLs. Keep
raw reports outside version control until they have been reviewed and
sanitised; checksum any retained evidence and bind it to the exact browser,
harness, model location, page URL and tested commit.
