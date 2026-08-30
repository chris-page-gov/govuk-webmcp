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
Following an authoritative link leaves this boundary.

Four artefact families gate all WebMCP registration: the 80-record catalogue,
80 evidence receipts, one Evidence Trace collection and the 10-entry federation
manifest. Each raw file must match its SHA-256 sidecar. Schemas, internal
digests, record-to-receipt bindings, catalogue-to-trace bindings and
catalogue-to-federation bindings must also pass. A failure in any family leaves
a human-readable failure state and prevents every tool registration; no partial
tool set is accepted.

The packaged evidence estate is derived from four exact source locks. Integrity
checks bind the packaged bytes and declared relationships. They are not
signatures from a government body and do not prove official endorsement,
current accuracy, access authority or an open licence.

Source-derived titles, descriptions and limitations remain untrusted data.
They are rendered as text, and admitted links must be credential-free HTTPS
URLs. Catalogue and Evidence Trace links use the bounded official-host
allowlist. Federation repository links use a separate, exact GitHub repository
allowlist under `chris-page-gov`; the application does not fetch or admit
producer payload from those repositories. WebMCP output is also labelled as
untrusted content.

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
`browserConsoleErrorsAccepted: false`; no model-backed run has occurred.

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
