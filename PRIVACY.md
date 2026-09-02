# Privacy notice

## What the page processes

The frozen public page processes search terms in the browser against the
80-record same-origin static catalogue. The released `0.3.0-rc.1` application
can search 58,652 records from 58,655 locked raw rows in exactly
four OKF source snapshots through progressively loaded, same-origin static
assets. Exactly three standalone Land Registry legislation rows are
quarantined. It does not contact
the OKF publishers, an official operational API or a model provider at query
time. There is no standalone UK Legislation source, payload, index or runtime
request, and the searchable projection exposes zero `legislation.gov.uk`
result links. Source-authored cross-reference strings remain in the locked
snapshots as inert, untrusted metadata; their presence in source text does not
admit a link or collection.

The application does not add search terms to the URL, write them to local
storage or session storage, or deliberately log them. A static host can still
observe ordinary requests and query-derived asset paths, alongside ordinary
network metadata. That is a narrower boundary than sending a profile to the
page, not proof that searching is unobservable.

The application does not use accounts, cookies, analytics, advertising,
tracking pixels or persistent server-side application storage. Its five WebMCP
tools accept only bounded action-specific inputs. The federated search contract
adds only a fixed collection allowlist; it does not request unrelated
conversation, identity, a personal profile, location or browsing history.

The `0.4.0-rc.1` candidate adds a sixth tool,
`present_resource_evidence`. Its only accepted field is one canonical record
identifier. It adds no dedicated name, address, identity, profile, location-
history, browsing-history, conversation-history or general personal-context
field. The candidate can show the exact validated arguments it accepted, but
it must never retain or display rejected structured input.

That closed shape is minimisation, not secrecy. Search remains a bounded
free-text field and can contain a name, address or other personal detail if a
person or AI host puts one there. The demonstration therefore says that there
is no dedicated personal-context field and that free text can still disclose
personal details; it does not claim that the schema keeps context private.

## URL fragments and browser history

The released page can put bounded record, answer, claim and comparison
identifiers in the URL fragment. The candidate additionally places the fixed
`guided` or `technical` view name in the fragment. This allows an exact human
view to be linked and restored through browser back and forward history. Search
terms, action origin and activity wording are never included in these
fragments.

Raw fragments are limited to 1,024 characters. Comparison fragments are
separately length-limited and can identify only two to four exact claims.
Oversized, duplicated, unknown, incompatible or malformed candidate fragments
are discarded and a safe default view is shown. A WebMCP call does not itself
change the fragment or browser history; only an explicit human selection or
view change may serialise a validated evidence identifier.

A URL fragment is not sent to this static host in the ordinary HTTP request,
but it can remain in browser history, copied links, screenshots, browser sync
or a browser host's own records. Those browser and host behaviours are outside
this page's storage boundary.

## WebMCP host boundary

In the release, two evidence exploration tools can update only reversible,
transient page presentation and three query tools return packaged data without
changing the page. The candidate adds one further reversible presentation
tool. Rejected tool input is not retained in the page's diagnostic input
digest or Evidence answer. No tool creates a new durable receipt for the call,
a persistent session or external state.

Federated exact-record output reports source authority as “Not independently
established”. Links and assertions remain producer-declared; producer wording
cannot promote them to official status. The visible destination hostname helps
a person inspect where a recorded link leads. This is an assurance boundary,
not a privacy claim about the destination site.

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

The proposition that this arrangement improves privacy, asks better questions,
improves answer quality or reduces public cost is an evaluation hypothesis. A
valid test must distinguish the page's admitted arguments and same-origin
requests from provider-side prompt, tool-metadata, argument and result
processing. It must not use real personal data merely to make the demonstration
feel personalised.

Evidence answer does not receive the AI host's final prose. It therefore cannot
claim to compare, validate or store that prose. Its comparison guide is fixed
page copy over deterministic evidence, not a transcript or model assessment.

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

Private local evaluation refuses symbolic `.evals`, personal-agent output and
run-directory boundaries, checks canonical containment inside the repository
and applies mode `0700` to each directory. Private captures remain mode `0600`.
For supported-host evidence, the ignored raw receipt and the two public
projections are promoted as one recoverable set. The public projections bind
the raw bytes but retain only the names of rejected fields, not the rejected
synthetic value.

Exact personal-agent host and browser version strings remain only in the
private mode-`0600` capture because a nominal version field can include account
or unrelated interface text. The public evaluation summary retains
host-version status counts, fixed browser product labels and a browser version
only when the value has the bounded Chromium form `major.0.build.patch`. It contains
neither the free-text values nor hashes of them. Safe observation dates, fixed
tool-name sequences and deterministic page selection/digest pairs may be
published. It counts share-link observability without publishing the link. The
canonical repository, public URL and protected-main commit are copied only from
a freshly authenticated live Pages observation that also binds a clean
unchanged checkout and a byte-identical local `dist` plus private execution
snapshot.

The retained dirty local diagnostic is not eligible for an authenticated
cross-host media source. After the final deployment, its 36 local slots must be
rerun from the clean exact-release checkout and bound to that deployment; any
unobserved page, network, latency or answer-review dimension remains explicitly
unknown. Final-video preflight freshly authenticates the release receipt rather
than trusting a stored summary labelled `authenticated`.

Observable call sequences are replayed through the receipt-bound production
runtime snapshot before evaluation; captured output cannot become public truth
by self-digesting it. Synthetic privacy markers are checked through up to eight
stable percent and numeric-entity decoding rounds, Unicode NFKC normalisation,
case folding and punctuation removal. Each fixed story also requires the exact
generated canonical search string, so changed order, extra separators, encoded
values, hashes or otherwise unrelated additions cannot pass as task-minimal
arguments.

The evaluation plan adds a synthetic-persona minimisation test with visible
sentinel values, a no-call case and at least three runs per fixed model after
model-free checks pass. It must report any sentinel reaching page-tool
arguments, application-origin requests or storage, and report remote-provider
traffic separately. Candidate-specific repeated natural-model, browser-host
and provider-boundary evidence remains pending for `0.4.0-rc.1`.

The candidate video plan requires a genuine visible Copilot observation for
the cloud scene. Its local scene may use only the separately labelled Ollama
diagnostic receipt visualisation; that is not a host recording or a successful
page update. The private inputs can contain account, host, prompt, share-link or
model-run detail and must remain mode `0600`. The builder's
redaction and privacy gates do not make raw inputs publishable: only a separately
reviewed cut may proceed to branding, rights, voice, caption, signed-out playback
and publication review. The candidate has not yet produced or published that
video.

The admitted native-panel screenshots were captured from a disposable,
unconnected Chrome profile containing only the public project. They were
visually reviewed before admission and contain no personal tab, account,
credential, prompt, cookie or request header. The raw DevTools and panel
receipts, ephemeral debugging target identifiers and temporary profile paths
remain ignored; only sanitised, checksum-bound observations are retained.

## Hosting and external links

A static host may process ordinary request data under its own privacy terms.
Following a reviewed authoritative link or a federated producer-declared link
leaves this prototype; the destination organisation's privacy and cookie
notices then apply.

Do not enter personal, sensitive or unpublished information into the search
box or a tool call. The catalogue is a research fixture, not a channel for
contacting a public body. Catalogue inclusion does not establish official
endorsement, current accuracy, access authority or an open licence.
