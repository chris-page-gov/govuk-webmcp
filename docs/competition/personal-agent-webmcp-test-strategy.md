# Personal-agent WebMCP test strategy

## Purpose

This strategy tests the proposition that a public service can publish small,
bounded page tools while a citizen-selected AI supplies any useful personal
context. The service should receive only the explicit, validated tool input it
needs, rather than operating a government-hosted general-purpose assistant or
collecting an unrelated personal profile.

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
same-origin, digest-validated GOV.UK metadata bundle
                |
                v
bounded result with source links, assertions and limitations
```

The published page must not request a profile, location history or unrelated
conversation context. Closed schemas and executable validation admit only the
query, filters and identifiers required for the selected action. The static page
does not call a model provider and does not make runtime calls to official APIs.
Those properties reduce the service-side data surface; they do not control what
a separately selected agent or remote model provider retains.

A local model can keep model inference on the citizen's device, but ordinary
page requests still reach the site and local software can still log data. With a
remote model, assume that the prompt, exposed tool descriptions, tool arguments
and returned source-derived data may be sent to that provider. State the chosen
host, model location and provider policy in every demonstration receipt.

## Four complementary evidence layers

No one layer proves the whole claim. Run them in the sequence below so contract
or host-compatibility failures are found before a model-backed demonstration.

### 1. Native Chrome or Edge DevTools

Use the browser's WebMCP panel to inspect the live page, its schemas and its
invocation history, then invoke representative tools manually. Chrome documents
the Available Tools and Invoked Tools views, schema errors and manual execution
in its [WebMCP DevTools guidance](https://developer.chrome.com/docs/devtools/application/webmcp).
[Microsoft Edge 149 release notes](https://learn.microsoft.com/en-us/microsoft-edge/devtools/whats-new/149)
list WebMCP debugging as an inherited Chromium feature; record the exact Edge
build rather than infer compatibility from Chromium alone.

The research referred to “both tools”, but this release exposes five. Capture
all five names and schemas, then manually execute at least:

- `search_government_knowledge`, proving a read-only result with an authoritative
  link, assertion status and limitation; and
- `explore_answer_foundations`, proving the reversible presentation effect and
  visible page update.

Also submit one invalid input and retain the rejection. A screenshot alone is
insufficient: save the exact input, output or error, invocation status, browser
version, feature state, page URL and deployed commit in
`docs/competition/evidence/native-devtools-webmcp-2026-08-30.json`. Add the
screenshots by path and SHA-256, without cookies, headers or personal data.

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
`docs/competition/evidence/chrome-devtools-mcp-2026-08-30.json`.

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
that modification time unchanged. Its receipt remains private under `.evals/`,
and public `v0.2.0-rc.1` remains unfixed.

The repository now prepares the exact post-deployment rerun without broadening
the capture boundary. `WEBMCP_DEVTOOLS_TARGET_URL` accepts only the project
Pages URL, and `WEBMCP_EXPECTED_COMMIT` can require the protected-main commit.
Before Chrome starts, the runner validates the public `deployment.json`
schema, repository, commit and Pages run and binds the metadata digest into a
separate ignored public-target receipt. This is prepared tooling, not evidence
that the unreleased fix is already public.

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
minimisation result if the model adds any input beyond `query` and `limit`.
Only the `ollama:` route is preflighted without a download: it permits loopback
only and checks that the exact model is already installed. A remote provider
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
`browserConsoleErrorsAccepted: false`. No model-backed run has occurred.

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
3. returns the common bounded source-derived result through the human interface
   and captured host executions, while deterministic smoke independently proves
   only the six exact `ok: true` expected-schema envelopes, not full payload
   equivalence;
4. visibly applies and can reverse the two presentation effects;
5. retains authoritative links, assertions, limitations and the untrusted-output
   boundary in every path;
6. records no unexpected network destination or durable page storage; and
7. shows at least one fixed-model selection run, with failures and variance
   reported rather than hidden.

Safe submission wording is: “The government page publishes bounded,
source-linked tools that a citizen-selected browser agent can call. The page
does not host a model or ask for unrelated personal context.” Do not claim that
the architecture is private by default, that a personal agent is always more
accurate, or that it has already saved public money. Those remain hypotheses to
be measured.
