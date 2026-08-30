# govuk-webmcp

Public source repository for **Trusted government knowledge discovery**, an
independent experimental prototype.

The `v0.2.0-rc.1` product release is available at
<https://chris-page-gov.github.io/govuk-webmcp/>. It was integrated through
[pull request 9](https://github.com/chris-page-gov/govuk-webmcp/pull/9), is
bound to product commit `9235ee5db4df637bdb2a12e87449e871614afe68`, and is
retained as a [public pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1).

## Current implementation

The current working implementation is a static TypeScript application with:

- 80 digest-bound catalogue records and 80 matching evidence receipts;
- one digest-bound Evidence Trace for a worked answer;
- 10 reviewed corpus admissions: 2 searchable collections and 8 collections
  that are described but not searchable;
- four exact source locks for the 69-record GOV.UK import, the 11 curated data
  and API records, the authored answer pack, and the corpus admissions;
- an analytical-index-first human interface, with the visual Evidence Trace as
  a progressive explanation of the same data; and
- five page-scoped WebMCP tools over the same deterministic action path used by
  the human controls.

This is not an official GOV.UK or UK government service. It is not a durable MCP
gateway, a production service or a comprehensive index of government
information. The published release passed exact-main validation in run
`33286750188` and was deployed from the same product commit in Pages run
`33286771963`. Competition registration is complete. The only Devpost project,
`1406973`, remains an unpublished pre-submission draft and no submission has
been made.

## Start here

1. Read `PROJECT_STATUS.md`.
2. Read `AGENTS.md` before allowing Codex to change the repository.
3. Read `CODEX_HANDOVER.md`.
4. Read `research/2026-08-29/deep-research-report.md` for the decision-grade
   report.
5. Install the locked Node dependencies and the version-pinned Python research
   verifier in a repository-local virtual environment:

   ```bash
   npm ci --ignore-scripts --no-audit
   npm run python:setup
   ```

   `requirements-dev.txt` pins `jsonschema` 4.26.0 and each mandatory or
   Python-version-conditional runtime dependency. `python:setup` creates or
   reuses `.venv`, installs those exact pins with `--only-binary=:all:` and
   `--no-deps`, then runs `pip check`. `npm run research:verify` uses `.venv`
   first, checks the exact `jsonschema` version and then runs the preserved
   research-pack verifier. The pins do not include distribution hashes, and a
   reused virtual environment can retain unrelated packages, so this is not a
   clean or fully reproducible Python supply-chain environment.

6. Run the core local suite:

   ```bash
   npm test
   ```

   The installed-Edge matrix and model-free evaluator smoke are separate:

   ```bash
   npm run test:browser:edge
   npm run webmcp:eval:smoke
   ```

   The unreleased CI and Pages workflow definitions also use
   `npm ci --ignore-scripts --no-audit`; Pages is configured to install the
   pinned Python requirements and run semantic WebMCP smoke before deployment.
   These workflow edits have not yet run.

7. Start the verified build for manual browser use:

   ```bash
   npm run serve
   ```

   Open `http://127.0.0.1:4173/`. Do not open an HTML file directly from
   Finder; browsers restrict module and same-origin data loading from `file://`
   URLs.

## Evidence and integrity model

Four generated artefact families must all pass checksum, schema, digest and
cross-binding validation before any WebMCP tool can register:

1. the catalogue and its raw-byte checksum;
2. the evidence receipts and their raw-byte checksum;
3. the Evidence Trace collection and its raw-byte checksum; and
4. the corpus federation manifest and its raw-byte checksum.

The catalogue contains the 69 locked GOV.UK records and 11 curated government
data and API records. Those are the only two searchable admissions. The other
eight admissions remain described-only, conditional, quarantined or
contract-only; descriptor inclusion does not admit their payloads to search.

The four reviewed source locks are recorded in
`app/data/sources/source-locks.json`. Generated files under `app/data/` must not
be edited by hand. Change the reviewed inputs under `app/data/sources/`, then
run `npm run data:build` and `npm run data:validate`.

Digest validation proves that packaged bytes and declared relationships match.
It does not prove official endorsement, current accuracy, access authority or
an open licence. Every result therefore keeps authoritative human links,
assertion status and limitations visible. Source-derived text is untrusted data
and is rendered as text rather than executable content.

## Human and WebMCP actions

The human interface remains fully usable without WebMCP. Human controls and
page tools use the same action controller and deterministic runtime:

- `search_government_knowledge`, `get_resource_record` and `show_provenance`
  only query verified packaged data and truthfully declare
  `readOnlyHint: true`;
- `explore_answer_foundations` and `compare_evidence_foundations` update a
  reversible, transient selection in the visible page, so they truthfully
  declare `readOnlyHint: false` even though they do not change a source,
  browser storage or external state.

All five tools have closed, bounded input schemas and repeat validation in
executable code. A shared input budget rejects broad roots and accessors before
dispatch. Rejected input is not hashed or retained in the diagnostic input
digest. URL-fragment routes are length-bounded and comparison is limited to two
to four exact claim identifiers.

These tools are registered imperatively on the current page when a compatible
secure browser host exposes `document.modelContext`. They are available only in
that page context. They do not provide an independently callable, durable MCP
gateway, provider authentication, persistent sessions or durable call
receipts. Instrumented browser tests cover registration and calls. On 30 August
2026, `Codex In-app Browser` also discovered and successfully called all five
tools against the exact public release; the final comparison's canonical and
displayed result digests matched. This is evidence for that host and time only,
not a general browser-support claim.

## Local WebMCP interoperability checks

Node 22.12 or later is required by the pinned test toolchain. These local
tooling commands complement, but do not replace, the normal unit and Playwright
suites:

```bash
npm run webmcp:devtools:capture
npm run webmcp:eval:smoke
npm run webmcp:explorer:setup
```

`webmcp:devtools:capture` uses `chrome-devtools-mcp` 1.8.0 and Chrome 150 or
later. It builds the application, starts an isolated Chrome profile restricted
to the loopback origin, calls `list_webmcp_tools` with the selected `pageId`,
then calls `execute_webmcp_tool` for each of the five fixed tools. Its full local
receipt also records a synthetic unrelated-context field failing closed. It is
written to the ignored `.evals/chrome-devtools-mcp.json` path and may
contain source-derived tool output, so review it before copying any part into
release evidence. The final hardened local run at 15:53 BST on 30 August 2026
used Chrome 152.0.7977.64, discovered and executed all five tools, verified the
closed schemas and annotations, rejected `personalContext` and recorded no
console error. The runner sets `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An
earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json`; the final run left that file's
modification time unchanged. This remains local-candidate evidence.

After an exact candidate has been integrated and Pages reports that commit in
`deployment.json`, the same runner has a separate fail-closed public mode:

```bash
WEBMCP_DEVTOOLS_TARGET_URL='https://chris-page-gov.github.io/govuk-webmcp/' \
WEBMCP_EXPECTED_COMMIT='<40-character-main-commit>' \
npm run webmcp:devtools:capture
```

Only that exact public URL is accepted. The runner validates the deployment
schema, repository, commit and Pages run before capture, binds the raw metadata
digest into `.evals/chrome-devtools-mcp-public.json`, and does not start the
loopback server. The ignored receipt still requires human review before any
part is admitted to public evidence.

`webmcp:eval:smoke` uses `webmcp-evals` 0.0.4, the concrete calls in
`evals/webmcp-smoke.json`, installed stable Chrome and a same-origin loopback
build. The wrapper gives the third-party child process a small operating
environment with an isolated `HOME`; no provider credential environment
variables are forwarded. This limits inherited configuration, but the child
still has the operating-system filesystem access of the invoking user. The six
authored calls must each return `ok: true` with the expected result-schema
envelope. Raw evaluator rows are deleted after validation; the ignored
`.evals/webmcp-smoke-receipt.json` retains only semantic counts and a digest of
the validated results. Smoke mode does not prove model selection or complete
payload equivalence.

`evals/webmcp-browser.json` adds a no-call case for a later model-backed browser
evaluation. The fail-closed wrapper is available after an exact installed local
model has been selected:

```bash
WEBMCP_EVAL_PRESENTATION_APPROVED=1 \
WEBMCP_EVAL_MODEL='ollama:<exact-installed-model>' \
npm run webmcp:eval:browser
```

Only the `ollama:` route is preflighted without downloading a model. It uses
three runs by default, serves only the loopback build, enforces an exact
context-minimisation call and writes private JSON, HTML and receipt files
beneath ignored `.evals/webmcp-browser/`. It fails closed on any upstream
console error or `pageerror`; an accepted receipt can report only
`browserConsoleErrorCount: 0` and states
`browserConsoleErrorsAccepted: false`. A remote `anthropic:`, `openai:` or
`google:` run must additionally name the exact model, acknowledge both the
reversible presentation effects and changed data boundary, and use the
provider's API credential, for example:

```bash
WEBMCP_EVAL_PRESENTATION_APPROVED=1 \
WEBMCP_EVAL_REMOTE_PROVIDER_APPROVED=1 \
WEBMCP_EVAL_MODEL='openai:<exact-model>' \
npm run webmcp:eval:browser
```

A consumer chat subscription does not itself supply a CLI API credential. No
model-backed evaluation has yet been run, so do not supply a remote credential
merely to make this optional check pass.

`webmcp:explorer:setup` checks out Microsoft WebMCP Explorer 0.1.0 at exact
commit `f7091c12420e713b11361630dc1649d5678f62ab`, installs its lock with
`--ignore-scripts` and builds the unpacked extension in isolated ignored
`.tools/webmcp-explorer-build/`. Two consecutive builds were byte-identical and
left the source checkout clean. The recorded SHA-256 values are
`b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`
for the source tree,
`76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
for the package lock and
`c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`
for the unpacked-extension file manifest (a digest over sorted per-file hashes
and paths). The clean-output allow-list also passed. Static triage dated 30
August 2026 found
the reported npm advisory paths were not reachable in this exact production
build path. That is not a general security clearance: the extension still has
`<all_urls>` access, can retain credentials in `chrome.storage.local`, enables
`dangerouslyAllowBrowser`, has no prompt-injection mitigation and can
autoexecute Agent Run/Chat.

If Explorer evidence is required, use a disposable browser profile. Inspect the
Tools pane first without a credential; then prefer an exact local loopback model
and Agent Step. Delete the profile afterwards. Only if a remote run is
necessary, use a revocable low-limit key and synthetic prompts without personal
context. The setup command itself does not load the extension, alter browser
flags or configure a provider, and no Explorer browser execution or model
selection is claimed here.

The current working-tree candidate also accepts hosts that invoke a tool as
`execute(input)` without a second execution-options object, while still
forwarding cancellation when a host supplies an `AbortSignal`. The public
`v0.2.0-rc.1` deployment predates that compatibility fix. A local capture from
this candidate is therefore not evidence that the public deployment is fixed.

## Privacy and operating boundary

The page loads only its packaged same-origin artefacts. It makes no runtime call
to a provider API and uses no accounts, cookies, analytics or browser storage API.
Search terms are not put in the URL or stored. Bounded answer, claim, record and
comparison selections can appear in the URL fragment so that the human view can
be restored; see `PRIVACY.md` for the page and browser-host boundary.

Original application code is MIT licensed. `NOTICE.md` retains item-level
rights and access limits for source material. Catalogue inclusion never grants
access or permission to reuse linked material.

## Key implementation artefacts

- `src/application-actions.ts` — shared action, presentation and diagnostic
  boundary.
- `src/webmcp-tools.ts` — catalogue runtime and imperative WebMCP registration.
- `src/evidence-runtime.ts` — Evidence Trace validation and exploration.
- `src/federation-runtime.ts` — corpus-admission validation.
- `app/data/sources/` — reviewed source locks and authored inputs.
- `app/data/` — deterministic generated artefacts and checksum sidecars.
- `schemas/` — closed input, output and generated-artefact schemas.
- `SECURITY.md`, `PRIVACY.md` and `ACCESSIBILITY.md` — public operating
  boundaries and known limitations.
- `docs/competition/evidence/` — dated candidate and release evidence, including
  exact deployment metadata, live-byte verification and explicit remaining
  gates. Start with the
  [30 August 2026 public release verification](docs/competition/evidence/public-release-verification-2026-08-30.md).
  The later
  [supported-host capture](docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json)
  records five successful calls in `Codex In-app Browser`.
  The
  [live-interaction capture receipt](docs/competition/evidence/demo-live-interaction-capture-2026-08-30.json)
  binds five genuine page-only demonstration clips to the exact release,
  required actions, durations and SHA-256 values. The WebMCP scene is a labelled
  receipt visualisation rather than a host recording. Raw media under `output/`
  is deliberately Git-ignored local review material and must be preserved until
  the final build and human publication review are complete.
  The
  [manual Safari and VoiceOver record](docs/competition/evidence/manual-voiceover-journey-2026-08-30.json)
  is completed with two retained limitations and makes no WCAG conformance
  claim. The
  [local video build receipt](docs/competition/evidence/demo-video-build-2026-08-30.json)
  binds a captioned 142.920-second review cut, transcript and source evidence;
  it is not proof of public YouTube publication or a named judging host. The
  [final read-only compliance review](docs/competition/final-devpost-compliance-review-2026-08-30.md)
  records the remaining owner, named-host, public-video and submission gates.
  A separate
  [read-only Devpost status record](docs/competition/evidence/devpost-read-only-status-2026-08-30.json)
  distinguishes completed registration from the unsubmitted project draft.
  Each record applies only to the revision and observation it names.
