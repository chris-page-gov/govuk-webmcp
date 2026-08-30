# Privacy notice

## What the page processes

Search terms are processed in the browser against the 80-record same-origin
static catalogue. The application does not add them to the URL, write them to
local storage or session storage, send them to a government or other provider
API, or deliberately log them.

The application does not use accounts, cookies, analytics, advertising,
tracking pixels or persistent server-side application storage. Its five WebMCP
tools accept only bounded action-specific inputs. They do not request unrelated
conversation, identity or personal context.

## URL fragments and browser history

The page can put bounded record, answer, claim and comparison identifiers in
the URL fragment. This allows an exact human view to be linked and restored
through browser back and forward history. Search terms are never included in
these fragments.

Raw fragments are limited to 1,024 characters. Comparison fragments are
separately length-limited and can identify only two to four exact claims.
Oversized or malformed fragments are discarded and the default evidence view
is shown.

A URL fragment is not sent to this static host in the ordinary HTTP request,
but it can remain in browser history, copied links, screenshots, browser sync
or a browser host's own records. Those browser and host behaviours are outside
this page's storage boundary.

## WebMCP host boundary

The two evidence exploration tools can update only reversible, transient page
presentation. The three query tools return packaged data without changing the
page. Rejected tool input is not retained in the page's diagnostic input digest.
No tool creates a new durable receipt for the call, a persistent session or
external state.

A compatible browser or agent host may observe tool names, inputs, outputs and
the current page independently of this application. Its logging, history,
telemetry, model processing and retention are governed by that host and are
outside this notice. Page-scoped WebMCP is not a private or durable MCP gateway.

## Personal-agent design

The government page does not host a model, ask for an identity or profile, or
request unrelated personal context. The intended pattern is for a
citizen-selected agent to use only context that it is permitted to hold, choose
a suitable page tool and send the smallest input allowed by that tool's closed
schema. The page does not need the wider context to return its deterministic,
source-linked result.

This separation limits what the page requests; it does not govern the citizen's
agent. A browser host can see the page and the tools it exposes. A remote model
provider may receive relevant prompts, tool metadata, inputs and outputs, and
may retain them under its own terms. A correctly configured local model can
keep model inference on the citizen's device, although the browser still makes
ordinary requests to the static host and local applications may keep logs. Do
not treat “personal agent” as meaning “private by default”.

## Test evidence and retention

Native developer tools, Microsoft WebMCP Explorer, Chrome DevTools MCP and
`webmcp-evals` are used only as development and assurance harnesses. Tests use
the public synthetic fixture in a fresh, isolated browser profile with no
personal browsing history, accounts, saved credentials, unrelated tabs or
personal extensions. Prompts and tool inputs must not contain personal,
sensitive or unpublished information.

Harness configuration can contain model-provider credentials, and generated
reports can contain prompts, tool descriptions, arguments, results, console
messages and page URLs. Credentials, cookies, browser profiles and unredacted
network headers must never be committed or included in demonstration evidence.
Raw reports remain excluded from version control until a human has reviewed and
sanitised them. Any evidence retained in the repository records the provider
class and model identifier, not its credential, and is checksummed against the
tested revision. Provider-side logging and retention remain subject to the
selected provider's privacy terms.

The admitted native-panel screenshots were captured from a disposable,
unconnected Chrome profile containing only the public project. They were
visually reviewed before admission and contain no personal tab, account,
credential, prompt, cookie or request header. The raw DevTools and panel
receipts, ephemeral debugging target identifiers and temporary profile paths
remain ignored; only sanitised, checksum-bound observations are retained.

## Hosting and external links

A static host may process ordinary request data under its own privacy terms.
Following an authoritative source link leaves this prototype; the destination
organisation's privacy and cookie notices then apply.

Do not enter personal, sensitive or unpublished information into the search
box or a tool call. The catalogue is a research fixture, not a channel for
contacting a public body. Catalogue inclusion does not establish official
endorsement, current accuracy, access authority or an open licence.
