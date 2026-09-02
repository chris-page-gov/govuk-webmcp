# govuk-webmcp

Public source repository for **Trusted government knowledge discovery**, an
independent experimental prototype.

<https://chris-page-gov.github.io/govuk-webmcp/> serves protected-main product
commit `a4d2db44e60024c3eadbdb2b1722153ce19dff4c`. Validation run
`33656288475` and Pages run `33657069203` passed. The authenticated live
comparison matched all 1,884 regular files and 128,653,415 bytes, with zero
byte mismatches. The annotated
[`v0.3.0-rc.1`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.3.0-rc.1)
tag preserves the earlier five-tool product bytes at commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf` as historical evidence.
The earlier product commit `9235ee5db4df637bdb2a12e87449e871614afe68`
remains unchanged as the
[`v0.2.0-rc.1` public pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1)
and historical evidence boundary.
[`v0.2.0-rc.2`](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.2)
freezes the later corrected pre-federation repository state without changing
the recorded Pages product identity. Its annotated tag resolves to product
commit `35fcedd39ed955278d3975a6dd80692fc6e32935`; it is the retained, frozen
project baseline and is not described as a GitHub-platform immutable release.

The deployed `0.4.0-rc.1` candidate retains 80 reviewed records and 58,652
searchable federated records from 58,655 locked source rows; 3 standalone
legislation rows remain quarantined. Its exact deployment and byte-verification
gates are closed. The annotated `v0.4.0-rc.1` tag, GitHub prerelease, public
video upload, owner review, signed-out playback check and final Devpost review
and submission remain separate open gates. A checkout does not prove its own
tag or release state; use GitHub metadata for that determination.

## Deployed Evidence answer candidate

The `0.4.0-rc.1` candidate does not rewrite the tagged `v0.3.0-rc.1` history.
It adds a persistent
two-view interface:

- **Evidence answer** presents a plain English, deterministic evidence result
  with its recorded source, material limitation, unknowns and next check; and
- **Technical review** retains the existing analytical index, Evidence Trace,
  full record, provenance, search and diagnostics.

Both views consume the same validated action results. The candidate also adds
`present_resource_evidence` as a sixth bounded WebMCP tool so a compatible
personal AI can ask the page to present one exact record. It accepts only a
canonical record ID, not a personal profile. Its reversible display effect is
not labelled read-only, and source-derived output remains untrusted text.
One latest-started sequence spans all three actions that can update Evidence
answer, so an older asynchronous call can return to its caller but cannot
replace a newer page selection.

The exact-release personal-agent matrix contains 36 personal Microsoft Copilot
observations and 36 local Ollama observations. Copilot tool discovery, calls
and page parity were not observable, and every answer remains unreviewed.
**No Site tool invocation or Evidence answer update was observed.**
The exact local Ollama run passed tool selection and execution in 6 cases,
failed in 30 and retained 3 runner errors. The combined claim gate is false:
neither result is a safe-host claim. Private share links, unrestricted host text
and answer text remain outside the public repository.

Separately, the exact-release Chrome DevTools supported-host observation
completed all six tools through direct, fixed calls. This proves deterministic
tool execution in that named harness, not model selection or a host-owned user
journey.

No model is embedded in the page. The page cannot see or validate the AI
host's final wording; Evidence answer therefore shows what the page supports
and asks the person to compare the AI's dates, amounts, eligibility statements
and instructions against that evidence. The eight-scene, 120.326-second local
review video presents the negative Copilot compatibility observation honestly
alongside the exact supported-host success; it does not reconstruct or imply a
Copilot tool call. Its 1920 by 1080 H.264 video runs at 30 frames per second with
`yuv420p` pixel format, 48 kHz AAC audio and embedded English `mov_text`
captions. Its SHA-256 is
`4de822637eda5a7a5b89ed7285e304f45510378ff5b3b7995e6bc59f57025e58`.
The generated cloud-versus-local observation card is privacy-minimised and
explicitly not a host recording. It supports no safe-host or causal claim;
direct six-call supported-host evidence remains separate.

This is local review material only. Owner playback and privacy, branding,
rights and voice approval, signed-out public playback and public upload remain
open.
The product tag must bind the verified product commit, and it does not imply a
Devpost submission. Validation
results are authoritative only for the revision and environment named by their
receipts. Historical partial and flaky runs remain visible rather than being
converted into a product pass.

The retained `a4fabe...` captures remain pre-integration evidence for their
named deployment. The exact-release product, live-byte, six-tool supported-host,
personal-agent and Safari VoiceOver captures now bind `a4d2db44...`. The next
release work is human review of the local cut, followed by the tag and
prerelease on that product commit, public upload and the signed-out player
check.

The VoiceOver record did not independently read deployment metadata before and
after its journey. Its commit and Pages run therefore identify the intended
candidate rather than provide a cryptographic capture-time binding; the exact
live-byte and supported-host receipts provide separate deployment evidence.

For a future build-affecting candidate, stage its ignored, mode-`0600` private
release receipt through the verifier itself after its Pages run succeeds:

```bash
WEBMCP_EXPECTED_COMMIT="$RELEASE_COMMIT" GOVUK_WEBMCP_PAGES_RUN_ID="$PAGES_RUN_ID" npm run deployment:verify-live -- --stage-private-release-receipt
```

Do not copy a receipt manually. The verifier validates the live bytes and
promotes the local and private receipts as one recoverable operation. It refuses
to replace an existing private release receipt by default. If replacement is
deliberately required, add `--overwrite-private-release-receipt` alongside
`--stage-private-release-receipt`; that explicit replacement invalidates all
dependent supported-host, personal-agent, accessibility and media evidence, so
every such capture must be repeated before the release gate can close.

The staging transaction normalises its requested file mode through a
descriptor-bound no-follow handle, so a conventional restrictive umask such as
`0077` is supported and any permission drift after `fchmod` fails closed. The
no-argument VoiceOver clip
builder selects the canonical exact `v0.4.0-rc.1` capture manifest. Focused
post-fix checks pass 116 of 116 and an independent clean review passes 71 of
71. Final local automated verification is complete: the prepared unit suite
passed 404 of 404 in 66,929.613333 ms; installed Chrome passed 43 of 43 in
16.8 seconds; installed Edge passed 43 of 43 in 16.8 seconds; and two
deterministic builds each contained 1,883 files and 128,653,230 bytes at
aggregate SHA-256
`cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
These older local counts remain scoped to their named check. Protected
integration, deployment and exact-release recapture are now evidenced by the
current receipts described above.

## Beginner documentation

Start with [Evidence before answers](docs/beginners/index.md) if you are new to
AI-assisted government information. It explains how to separate an AI answer,
its recorded evidence and a decision that depends on your circumstances.

The beginner experience is specified as an experimental candidate. Its
[product requirements](docs/product/beginner-trust-pathway-prd.md),
[interface specification](docs/product/beginner-interface-specification.md),
[question and coverage matrix](docs/competition/beginner-question-coverage.md)
and [guided model evaluation](docs/competition/beginner-conversation-evaluation-2026-08-31.md)
define Evidence answer while retaining the current public interface as
Technical review. The specification remains the acceptance contract rather
than evidence of usability. The 12 questions are synthetic representative
hypotheses, not a ranked list of the most common GOV.UK Chat questions or
completed user research.

A pre-remediation checkpoint passed its production build, deterministic data
double-build, focused runtime, public-schema and federation tests, complete
unit suite, Chrome and Microsoft Edge browser suites and model-free smoke. A
sealed follow-up scan suppressed those seven and found one further Low URL-
boundary issue, which was fixed after its snapshot.
Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` subsequently completed 50
of 50 review items, dynamically reproduced three evidence-integrity or
availability defects and classified zero as reportable vulnerabilities after
attack-path analysis. The defects were fixed nevertheless. The exact post-
remediation local research, build/data, unit, frozen-quality, Chrome, Microsoft
Edge, model-free real-Chrome smoke, dependency-audit and diff-integrity gates
now pass as recorded below. Exact-range scan
`2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` completed all 55 review items and
reported one High-confidence, Low-severity source-substitution defect
(`csf_050a3c08c471d3176e0640c3`). All five admitted sources now have separately
code-reviewed imported SHA-256 pins, and the standalone federated builder checks
the reviewed lock bytes before parsing. The mutation regressions, production
build and 194-test prepared suite pass; a fresh immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb` subsequently completed all 55 review
items against `9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable
findings. That sealed scope predates the narrow CI portability corrections
described below; focused mutation and deadline regressions plus the protected
Linux rerun evidence those deltas separately. Protected-main integration, CI,
Pages deployment and exact artefact verification have since completed as
identified above.

Release-media and personal-agent provenance were then reviewed separately.
Two bounded pre-fix snapshots identified six local evidence-integrity gaps;
all were fixed with closed nested contracts, exact story and VoiceOver path
identity, full live-receipt equality and canonical private-pair replay at both
publication consumers. Exact post-remediation scan
`8111841c-37a9-430f-82ee-e0d938275c35`, snapshot
`codex-security-snapshot/v1:sha256:fa7f13cac45d27832514469e74a3dc012e85cab5da9339fbccddcd05354aa6f3`,
completed all four changed surfaces with zero reportable findings. This does
not replace owner review of the video pixels, narration, branding, rights or
playback.

## Current implementation

The current public `0.4.0-rc.1` candidate is a static TypeScript
application with:

- 80 digest-bound catalogue records and 80 matching evidence receipts;
- one digest-bound Evidence Trace for a worked answer;
- 10 corpus admissions: 2 reviewed searchable collections, 4 federated
  searchable collections and 4 non-searchable collections;
- five exact source locks for the 69-record GOV.UK import, the 11 curated data
  and API records, the authored answer pack, the corpus admissions and the
  four-source OKF federation;
- a default plain English Evidence answer and a Technical review interface,
  with the visual Evidence Trace as a progressive explanation of the same data;
  and
- six page-scoped WebMCP tools over the same deterministic action paths used by
  the human controls.

The released `0.3.0-rc.1` slice adds a separate federated source-snapshot
tier without relabelling those 80 reviewed records. Exactly four independently
republished OKF snapshots are in scope: 9,757 A Life in the UK records,
including 293 service families; 5,097 ONS metadata records; 41,598 UK
Government APIs records; and 2,203 HM Land Registry public-estate metadata
rows. The locked raw sum is 58,655 before cross-source deduplication. Exactly
three standalone Land Registry legislation rows are quarantined, leaving
2,200 searchable Land Registry records and 58,652 searchable federated records
overall. Neither total is a unique-record count, and no federated record gains
an item-level receipt by being searchable. There is no standalone UK
Legislation collection, payload, index or runtime request, and the searchable
projection contains zero `legislation.gov.uk` result links. The locked source
files retain 28 source-authored cross-reference strings as inert, untrusted
metadata: 6 in A Life in the UK, 3 in ONS, 2 in UK Government APIs and 17 in
Land Registry.

Those totals are not accepted only as an aggregate. One ordered executable
contract binds each source lock and corpus admission to its generated and lazy
search population: 9,757/0/9,757 for A Life in the UK; 5,097/0/5,097 for ONS;
41,598/0/41,598 for UK Government APIs; and 2,203/3/2,200 for HM Land Registry,
shown as source/quarantined/searchable records. The same contract validates the
title, ordered supplementary counts, completeness statement and first
limitation displayed for each collection, so a co-digested per-source
redistribution or contradictory population statement fails closed.

At the released product checkpoint, the generated files contain 6 searchable and
4 non-searchable corpus admissions, 5 source-lock registry entries and 31
closed JSON Schemas. The 73 versioned gzip source artefacts total
13,021,675 bytes. A deterministic build expands them to 1,853 shard files —
120 record shards and 1,733 postings shards — plus the manifest and checksum
sidecar: 1,855 ignored generated files and 127,747,020 bytes in total. The
plane is copied into `dist` rather than committed. The federation lock and
generated-manifest digests are cross-bound. Each reviewed gzip representation
is pinned and preserved as exact stored bytes; the build does not recompress it.
A bounded gunzip must validate the locked decoded length and SHA-256 digest,
and the importer additionally requires those decoded bytes to equal the newly
fetched raw source bytes. This keeps Mac and Linux verification independent of
host-specific compression output.
UK Government APIs records use the source-authored, collection-unique
`concept_id` as their native identity. An endpoint URL can be shared and is
therefore evidence, not a substitute identity.

The intended impact is a division of responsibility, not an embedded
assistant: OKF publishes governed, progressively retrievable evidence; WebMCP
lets a citizen-selected AI invoke bounded page actions over it; and the page
hosts no model and exposes no dedicated identity, profile or general personal-
context field. Bounded free-text search can still contain personal details, so
the interface warns against including them. The citizen's AI can use context it
already holds to choose what to ask without sending that context as a new page-
tool field. A remote model provider may still receive prompts, tool metadata,
arguments and results. Cost reduction, privacy improvement, better questions
and improved answer quality remain hypotheses that require the recorded
evaluation plan.

The last complete pre-remediation candidate checkpoint recorded the production
build; 9 of 9 deterministic
data double-build tests; 21 of 21 focused runtime and public-schema tests; 15
of 15 focused federation tests after closing the extra-searchable-collection
fail-closed gap; 29 of 29 installed-Chrome Playwright tests; 6 of 6
model-free smoke calls; 144 of 144 complete unit tests in 174.5 seconds; and 29
of 29 installed-Microsoft-Edge Playwright tests in a loopback-only run after
the expected sandbox socket restriction. The seven initial Low-finding
remediations were implemented afterwards. Sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven and found a
further High-confidence Low trailing-dot and secondary legislation-URL bypass
(`csf_a2d9e030fda789ecd1cb0e41`), which generator and runtime validation fixed
post-snapshot. The scan reported no other open reportable candidate, but its
mechanically recorded coverage is partial and includes stale-pending rows. A
focused security batch passed 119 of 119 and the affected post-fix subset
passed 23 of 23. Those intermediate results were not protected-main,
deployed-host or release evidence; the later release path is recorded below.

The released implementation applies aggregate build-work caps, prototype-safe
token indexing, per-row Land Registry admission, partial-source isolation,
per-runtime in-flight fetch sharing, explicit-port and legislation-link
rejection, and incremental same-origin response limits. The exact fixed-tree
scan and protected release validation are reported below without extending the
sealed scan beyond its recorded commit.

The last complete tree before the latest three remediations passed the research
pack 4 of 4, production build and
generated-data validation, and the frozen lexical gate with mean nDCG@10
`0.984698009`, Recall@20 `1`, identical cold/warm results and legislation
absent or rejected. Installed Chrome and Microsoft Edge each passed 29 of 29
browser tests. The first model-free smoke run failed at the expected sandbox
`EPERM` loopback boundary; the authorised outside-socket-sandbox rerun passed 6
of 6. `npm run test:unit:prepared` passed 173 of 173 in `17128.154916 ms` on
that tree. Those intermediate results were later superseded by the exact post-
remediation verification below.

The three reproduced defects are addressed in the released implementation by
exact ordered per-source population and display bindings, and by a physical
shard-fetch boundary of 4 active loads, 32 queued loads and 36 distinct in-
flight files. Each file's 3-second deadline begins before queueing, while the
physical slot is retained until the underlying loader actually settles. An
expired queue or immediate pre-loader deadline returns the dedicated scheduler-
busy result, not a false source-corruption diagnosis. This prevents cancellation
churn from multiplying physical work. If up to four
non-cooperative loaders never settle, the loader deliberately fails closed and
federated search can remain unavailable; it does not admit more physical work.
The third remediation strengthens local-model receipt identity as described
below. The complete prepared unit suite passed 194 of 194;
the complete exact post-remediation local verification now also records research
4 of 4; a successful build and data validation for 80 reviewed records, 80
receipts, 58,655 raw federated rows, 3 quarantined rows, 58,652 searchable rows,
120 record shards and 1,733 postings shards; mean nDCG@10 `0.984698009`,
Recall@20 `1`, identical cold/warm results, no legislation collection and a
rejected legislation request;
30 of 30 browser tests in both installed Chrome and Microsoft Edge; 6 of 6
model-free WebMCP smoke calls in real Chrome; zero npm-audit vulnerabilities
across 162 total dependencies; and a clean `git diff --check`. Fresh immutable
scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items with
zero reportable findings. Its sealed scope predates the reviewed-gzip and
referenced import-deadline CI portability corrections. Protected-main CI,
Pages, exact-byte and supported-host evidence were completed separately for the
release; focused current VoiceOver evidence and the refreshed local-video
technical review are also complete with limitations. A passing model-backed
result, owner review, public playback and submission remain separate open gates.

Combined and public WebMCP search preserve `federated_runtime_busy` rather than
misclassifying that scheduler state as source unavailable. The human live region
distinguishes rejected input, busy state and other failure. The correction
passed the production build, 11 of 11 focused regressions and the 193-of-193
prepared suite; the Chrome and Edge reruns each exited zero at 30 of 30.

An earlier final-candidate demonstration preflight correctly failed closed
without a deployed commit and explicit overwrite approval. The exact release
now has five recaptured public-page interaction clips, a six-tool supported-host
receipt, an eight-pass, one-limitation VoiceOver sequence and an eight-scene
120.326-second local review video. Owner approval, public upload and the
signed-out playback check remain open.

Five preserved local model attempts used Chrome 152, `webmcp-evals` 0.0.4,
eight cases, three runs per case and exact loopback-only model
`ollama:gpt-oss:20b`, local inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. The pre-legibility attempt passed 8 of 102 retry-
expanded rows. After schema, tool-description and fixture legibility changes,
attempt 2 passed 33 of 33 upstream rows but only 32 of 33 under the strict
project verifier because one call added empty optional arrays. Attempt 3 on the
security-fixed tree passed 30 of 35 upstream rows after two malformed-then-
corrected provenance IDs and one omitted comparison. Receipt-v2 attempt 4 at
01:53 on 31 August 2026 bound stable exact identity and exited zero, but
structural validation failed and its evaluation was null. Receipt-v2 attempt 5
at 02:13 ran 24 case executions against fixture digest
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`.
It reported 36 rows for 33 expected rows, with 3 additional retries, 30 pass, 6
fail and zero error, console-error or missing counts. All three provenance
trajectories first supplied a malformed canonical ID and then recovered with a
correct successful call. `verify-reports` still failed: this demonstrates fail-
closed validation and recovery, not a strict model pass. The tracked JSON and
HTML report digests are
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and
`3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.

Attempts 4 and 5 bound the exact selected model digest from `/api/tags`
before and after the run to the daemon-reported loaded-model digest from
`/api/ps` afterwards. All three observations were stable at the digest above and
the receipt recorded `executionBound: true`. The first three failed attempts
predate that contract. Even a v2 receipt is daemon-reported post-run evidence,
not cryptographic
proof that each response came from particular weights; privileged control of
the local account or model service, tag changes between observations and a
previously loaded model remain outside its trust boundary. Inventory requests
reject redirects, require both exact `name` and `model` fields, and reject
`remote_model` or `remote_host` markers so an Ollama-labelled cloud proxy cannot
be treated as a local run without explicit remote-provider approval.

This is not an official GOV.UK or UK government service. It is not a durable MCP
gateway, a production service or a comprehensive index of government
information. Pull request 12 integrated the optional-execution-options
correction and assurance harness through protected `main`; Pages run
`33323152751` deployed that exact corrected commit. A historical read-only
observation showed Devpost project `1406973` as `Untitled`, blank and
`submission_pre_draft`; this checkpoint makes no registration, submission or
public YouTube-upload claim.

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

   `npm test` is self-contained after the locked install: it applies and
   verifies the digest-bound `webmcp-evals` step-limit correction before any
   evaluator-dependent checks. `npm run webmcp:eval:patch` remains available
   as an optional explicit fail-early check; it is not an extra clean-clone
   prerequisite.

   The installed-Edge matrix and model-free evaluator smoke are separate:

   ```bash
   npm run test:browser:edge
   npm run okf-federation:quality
   npm run webmcp:eval:smoke
   npm run build:verify-deterministic
   ```

   The integrated CI and Pages workflow definitions also use
   `npm ci --ignore-scripts --no-audit`; Pages is configured to install the
   pinned Python requirements, run the frozen federated retrieval-quality gate
   after the complete suite and run semantic WebMCP smoke before deployment.
   Those definitions ran in the protected integration and corrected Pages
   deployment path. For this candidate source, the standalone
   deterministic verifier runs the normal build twice without networked npm
   configuration, proves that tracked source inputs remained unchanged and
   writes an ignored mode-`0600` receipt only after the complete `dist`
   manifests match. The settled post-hardening checkpoint contains 1,883 files
   and 128,653,230 bytes at aggregate SHA-256
   `cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.

7. Start the verified build for manual browser use:

   ```bash
   npm run serve
   ```

   Open `http://127.0.0.1:4173/`. Do not open an HTML file directly from
   Finder; browsers restrict module and same-origin data loading from `file://`
   URLs.

## Evidence and integrity model

Five generated artefact families must pass checksum, schema, digest and cross-
binding validation before any candidate WebMCP tool can register. The frozen
baseline uses the first four; `0.3.0-rc.1` adds the fifth:

1. the catalogue and its raw-byte checksum;
2. the evidence receipts and their raw-byte checksum;
3. the Evidence Trace collection and its raw-byte checksum; and
4. the corpus federation manifest and its raw-byte checksum; and
5. the progressive federated-search manifest and its raw-byte checksum.

The frozen catalogue contains the 69 locked GOV.UK records and 11 curated
government data and API records. Those remain the two reviewed searchable
admissions. The candidate admits four more collections only to the separate
federated tier, leaving four entries described-only, conditional, quarantined
or contract-only; descriptor inclusion does not admit their payloads to search.

The frozen four reviewed source locks, plus the released federation lock, are
recorded as 5 entries in
`app/data/sources/source-locks.json`. Each registry digest must match its
separately code-reviewed value in the executable release policy, and the
federated builder directly checks the reviewed lock byte pin. Generated files
under `app/data/` must not
be edited by hand. Change the reviewed inputs under `app/data/sources/`, then
run `npm run data:build` and `npm run data:validate`.

The federation adds a separately digest-bound four-source OKF lock and
same-origin, progressively loaded search artefacts. It admits only A Life in
the UK, ONS, UK Government APIs and HM Land Registry; a standalone legislation
source and otherwise undeclared sources fail closed. Federated results retain
source-native identity, snapshot, source-link role, file integrity and
limitations, but remain a weaker source-snapshot evidence tier than the 80
receipt-bound records. Producer text cannot promote a federated source or
assertion to official status: output uses conservative producer-declared labels
unless a narrow normalisation is independently justified. Exact-record output
reports source authority as “Not independently established”, and the human
interface displays the recorded destination hostname. The production build
validates the current contract set and copies the ignored generated search
plane into `dist`; source inputs and the deterministic builder remain the
versioned reproducibility boundary.

The released federation also validates an exact ordered population binding for each of
the four collections across the admission and lazy search planes. Collection
coverage shown to people is derived from those structured source, quarantine
and searchable counts, while the collection-specific title, supplementary
counts, completeness statement and first limitation must match their executable
display contract. A valid self-digest cannot legitimise a per-source count
redistribution or contradictory display text.

Digest validation proves that packaged bytes and declared relationships match.
It does not prove official endorsement, current accuracy, access authority or
an open licence. Every result therefore keeps its recorded producer-declared source link,
explicit link role, assertion status and limitations visible. Source-derived
text is untrusted data and is rendered as text rather than executable content.

## Human and WebMCP actions

The human interface remains fully usable without WebMCP. Human controls and
page tools use the same action controller and deterministic runtime:

- `search_government_knowledge`, `get_resource_record` and `show_provenance`
  only query verified packaged data and truthfully declare
  `readOnlyHint: true`;
- `explore_answer_foundations` and `compare_evidence_foundations` update a
  reversible, transient selection in the visible page, so they truthfully
  declare `readOnlyHint: false` even though they do not change a source,
  browser storage or external state; and
- the `0.4.0-rc.1` candidate contract adds `present_resource_evidence`, which
  accepts one canonical record ID and reversibly presents the exact closed
  Evidence answer returned to its caller, so it also declares
  `readOnlyHint: false`.

For the released `0.3.0-rc.1` application, the three discovery tools accept the fixed
collection allowlist and return either reviewed deep evidence or federated
source-snapshot evidence. Human search and WebMCP use the same action
controller and common deterministic result. The two presentation tools retain
their existing Evidence Trace boundary. One federated source failure is
reported explicitly without silently removing the source, weakening integrity
or disabling unaffected evidence.

All five `v0.3.0-rc.1` tools have closed, bounded input schemas and repeat
validation in executable code. The `v0.4.0-rc.1` executable boundary is
deliberately stricter than JSON Schema: it accepts only ordinary plain objects
with allowed own enumerable string data properties and dense arrays with
canonical indices. It rejects symbols, accessors, non-enumerable properties,
sparse items and extra array properties without invoking getters. Rejected
input is not hashed or retained in the diagnostic input digest. URL-fragment
routes are length-bounded and comparison is limited to two to four exact claim
identifiers.

The `0.4.0-rc.1` candidate adds
`present_resource_evidence` as that sixth closed action. It obtains the exact
record and provenance sequentially, projects one closed Evidence answer and
returns the same presentation object shown by the page. The exact-release
Chrome DevTools observation completed all six tools against product commit
`a4d2db44e60024c3eadbdb2b1722153ce19dff4c` and matched the tool and
displayed Evidence answer digest. The calls were direct and fixed: no model
selected a tool and no host-owned interaction surface was captured.

These tools are registered imperatively on the current page when a compatible
secure browser host exposes `document.modelContext`. They are available only in
that page context. They do not provide an independently callable, durable MCP
gateway, provider authentication, persistent sessions or durable call
receipts. Instrumented browser tests cover registration and calls. On 30 August
2026, `Codex In-app Browser` discovered and successfully called all five tools
against the historical tagged deployment. The exact-release Chrome 152 and
Chrome DevTools MCP 1.8.0 receipt records all six candidate tools against
`a4d2db44...`. These observations are specific to their hosts, versions,
commits and times; neither proves model selection, personal-AI answer safety or
general browser support.

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
then calls `execute_webmcp_tool` for each of the six candidate tools. Its full local
receipt also records a synthetic unrelated-context field failing closed. It is
written to the ignored `.evals/chrome-devtools-mcp.json` path and may
contain source-derived tool output, so review it before copying any part into
release evidence. This six-tool expectation applies to `v0.4.0-rc.1` and
should fail closed against the five-tool `v0.3.0-rc.1` release. The historical
hardened local run at 15:53 BST on 30 August 2026
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

Only that exact public URL is accepted. The runner freshly authenticates the
live Pages receipt in-process, requires ordered `initial`, `after-page-load`
and `after-execution` deployment checks, and validates the deployment schema,
repository, commit and Pages run before capture. A stored, copied, merely
well-shaped or subsequently mutated receipt cannot open this gate. The runner
binds the raw metadata digest into `.evals/chrome-devtools-mcp-public.json` and
does not start the loopback server. This default public capture remains
ignored. After manual
review, `--admit-public-evidence` may write the reviewed exact-release receipt
only for the allowlisted public target. Admission also binds the complete live-
byte verification, omits local page identifiers and fails closed if the
reviewed target exists unless `--overwrite-reviewed-evidence` is explicitly
supplied. Against corrected deployed main, the earlier capture discovered and completed
all five tools with zero console errors. Chrome's native WebMCP panel separately
recorded five valid calls as `Completed`; `limit: 21` returned the expected
structured rejection. Both presentation tools updated the visible page; the
comparison showed 11 facet rows and its displayed digest prefix matched the
canonical result. These bounded observations do not establish general browser
or host support.

At `2026-08-31T18:49:38.356Z`, the guarded admission path retained a reviewed
rerun against exact public `v0.3.0-rc.1`: isolated Chrome 152 discovered and
completed all five tools, rejected unrelated `personalContext` by stable error
code `invalid_search_request`, recorded zero console errors and used no model
provider. The first current-release capture stopped only because the harness
expected obsolete rejection prose; the stable-code correction and rerun
passed. The reviewed receipt SHA-256 is
`4d87c3d55379266f68f633896e016f9294b991aa88458ea3f4b91b883c430396`.

`webmcp:eval:smoke` uses `webmcp-evals` 0.0.4, the concrete calls in
`evals/webmcp-smoke.json`, installed stable Chrome and a same-origin loopback
build. The wrapper gives the third-party child process a small operating
environment with an isolated `HOME`; no provider credential environment
variables are forwarded. This limits inherited configuration, but the child
still has the operating-system filesystem access of the invoking user. The
seven authored calls across three cases must each return `ok: true` with the
expected result-schema envelope. Raw evaluator rows are deleted after
validation; the ignored
`.evals/webmcp-smoke-receipt.json` retains only semantic counts and a digest of
the validated results. Smoke mode does not prove model selection or complete
payload equivalence.

`evals/webmcp-browser.json` defines eight cases, including a no-call case, for
model-backed browser evaluation. The fail-closed wrapper accepts an exact
installed local model:

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

A consumer chat subscription does not itself supply a CLI API credential. The
five recorded attempts used exact local model `ollama:gpt-oss:20b`, inventory
digest `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
Chrome 152, `webmcp-evals` 0.0.4 and three runs per case; the first three used no
remote credential.
The pre-legibility attempt passed 8 of 102 retry-expanded rows. After schema,
tool-description and fixture legibility changes, attempt 2 passed 33 of 33
upstream rows but the strict verifier accepted 32 of 33 because one call added
empty optional arrays. Attempt 3 on the security-fixed tree passed 30 of 35
upstream rows after two malformed-then-corrected provenance IDs and one omitted
comparison. Attempt 4 exited zero but retained a null evaluation after structural
validation failed. Attempt 5 passed 30 and failed 6 of 36 reported rows, with zero
errors, console errors or missing rows, and failed `verify-reports`. All five
attempts failed overall. Do not supply a remote
credential merely to turn this optional failed gate into a different data-
boundary test.

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

The public implementation also accepts hosts that invoke a tool as
`execute(input)` without a second execution-options object, while still
forwarding cancellation when a host supplies an `AbortSignal`. Historical
`v0.2.0-rc.1` bytes predate that compatibility fix; corrected main is deployed
at the `v0.3.0-rc.1` release commit identified above.

The exact-release local Ollama evaluation passed tool selection and execution
in 6 of 36 runs, failed in 30 and retained 3 runner errors. The personal
Microsoft Copilot half recorded 36 observations but exposed no observable tool
discovery, call trace or page parity, and every answer remains unreviewed. No
safe-host claim follows. The completed local review video still requires owner
playback and privacy, branding, rights, voice and caption approval before public
upload. Final Devpost review and submission remain open. A release-platform SBOM or attestation is optional
additional assurance, not a current official submission prerequisite.

Current official compliance requires completion by 1:00 pm PDT on 3 September
2026, a public source repository with a visibly detectable open-source licence,
a public YouTube video under three minutes with audio and the exact live project
accessible in ChatGPT's in-app browser or Chrome with WebMCP enabled. Freeze the
repository, live project and submission after the close. These are requirements,
not claims of registration, submission or a public video upload.

## Privacy and operating boundary

The page loads only its packaged same-origin artefacts. The released federated tier
also mirrors its locked static search files to that origin; it does not query an
official operational API or an OKF producer at runtime. The static host can
observe ordinary and query-derived asset requests. The application uses no
accounts, cookies, analytics or browser storage API. Search terms are not put
in the URL or stored. Bounded answer, claim, record and comparison selections
can appear in the URL fragment so that the human view can be restored; see
`PRIVACY.md` for the page and browser-host boundary.

Original application code is MIT licensed. `NOTICE.md` retains item-level
rights and access limits for source material. Catalogue inclusion never grants
access or permission to reuse linked material.

## Key implementation artefacts

- `src/application-actions.ts` — shared action, presentation and diagnostic
  boundary.
- `src/webmcp-tools.ts` — catalogue runtime and imperative WebMCP registration.
- `src/combined-knowledge-runtime.ts` — common deterministic reviewed and
  federated result boundary shared by human controls and WebMCP.
- `src/federated-search-runtime.ts` — progressively loaded federated search,
  exact-record and provenance runtime.
- `src/evidence-runtime.ts` — Evidence Trace validation and exploration.
- `src/beginner-presentation.ts` and
  `src/beginner-presentation-copy.ts` — candidate closed projection and fixed
  en-GB explanation copy.
- `src/present-resource-evidence.ts` — candidate sequential exact-record and
  provenance presentation action.
- `src/federation-runtime.ts` — corpus-admission validation.
- `src/okf-federated-contracts.ts` — fixed four-source snapshot and resource-
  budget contract for the released federation.
- `app/data/sources/okf-federation-lock.json` — authored release lock for the
  four admitted source snapshots and 73 versioned gzip artefacts; generated
  federation search files are ignored and not hand-edited.
- `app/data/sources/` — reviewed source locks and authored inputs.
- `app/data/` — deterministic generated artefacts and checksum sidecars.
- `app/view-routing.ts` and `app/evidence-answer-view.ts` — candidate bounded
  view state and DOM/text-only Evidence answer rendering.
- `scripts/verify-live-pages-artifact.mjs` — candidate exact-run verifier for
  the downloaded Pages artefact, deployment identity and every public file; it
  writes ignored local evidence by default, can securely stage the mode-`0600`
  private release receipt without a manual copy and requires separate explicit
  flags for replacement or admission of reviewed evidence.
- `scripts/import-copilot-personal-agent-capture.mjs` — validates the exact
  two-host matrix against that authenticated receipt, preserves unique
  run-scoped outputs and, with `--stage-release-evidence`, promotes the merged
  capture and authenticated summary together to the canonical private release
  paths. The pair is preflighted against the 16 MiB per-file admission limit
  before run-scoped output is created. It is no-clobber by default; an explicit
  successful overwrite prints the required recapture warning. It remains
  private and is not proof that the manual Copilot or human-review steps occurred.
- `scripts/verify-deterministic-build.mjs` — candidate offline double-build
  verifier; it checks stable source inputs and complete `dist` byte identity,
  then writes an ignored local receipt.
- `docs/competition/demo-video-script-v0.4.0-rc.1.json` and the demo scripts —
  Evidence answer capture/build contract. Exact-release page clips, supported-
  host evidence, a bounded VoiceOver frame sequence and a local Ollama
  diagnostic exist with explicit limitations. The local cut describes the
  Copilot observation as a compatibility finding and does not reconstruct a
  Site tool call. Redaction, privacy, branding, rights, voice, owner-playback,
  public-upload and signed-out public-player gates remain required.
- `schemas/` — closed input, output and generated-artefact schemas.
- `SECURITY.md`, `PRIVACY.md` and `ACCESSIBILITY.md` — public operating
  boundaries and known limitations.
- [`ADR-0004`](docs/adr/0004-okf-federated-discovery-and-evidence-tiers.md)
  and the
  [A–M evaluation plan](docs/competition/okf-federated-personal-agent-evaluation-plan.md)
  — candidate architecture, no-overclaim language and release gates.
- `docs/competition/evidence/` — dated candidate and release evidence, including
  exact deployment metadata, live-byte verification and explicit remaining
  gates. The current `0.4.0-rc.1` set includes the
  [live byte-comparison receipt](docs/competition/evidence/live-artifact-verification-v0.4.0-rc.1.json),
  [reviewed Chrome DevTools receipt](docs/competition/evidence/chrome-devtools-mcp-v0.4.0-rc.1.json),
  [supported-host capture](docs/competition/evidence/supported-host-webmcp-capture-v0.4.0-rc.1.json)
  and
  [manual Safari and VoiceOver record](docs/competition/evidence/manual-voiceover-journey-v0.4.0-rc.1.json).
  Start the historical release trail with the
  [30 August 2026 public release verification](docs/competition/evidence/public-release-verification-2026-08-30.md).
  The later corrected-main evidence comprises the
  [20-file public-byte verification](docs/competition/evidence/live-artifact-verification-2026-08-30-edd4ce6.json),
  [public Chrome DevTools MCP receipt](docs/competition/evidence/chrome-devtools-mcp-2026-08-30-edd4ce6.json),
  [native Chrome WebMCP-panel receipt](docs/competition/evidence/native-devtools-webmcp-2026-08-30-edd4ce6.json)
  and
  [post-deployment compliance review](docs/competition/post-deployment-devpost-compliance-review-2026-08-30-edd4ce6.md).
  The later
  [supported-host capture](docs/competition/evidence/supported-host-webmcp-capture-2026-08-30.json)
  records five successful calls in `Codex In-app Browser`.
  The
  [live-interaction capture receipt](docs/competition/evidence/demo-live-interaction-capture-2026-08-30.json)
  binds five genuine page-only demonstration clips to the exact release,
  required actions, durations and SHA-256 values. The WebMCP scene is a labelled
  receipt visualisation rather than a host recording. Raw media under `output/`
  is deliberately Git-ignored local review material and must be preserved until
  human publication review is complete.
  Historical `v0.3.0-rc.1` evidence is retained in the
  [manual Safari and VoiceOver record](docs/competition/evidence/manual-voiceover-journey-v0.3.0-rc.1.json),
  [local video build receipt](docs/competition/evidence/demo-video-build-v0.3.0-rc.1.json)
  and
  [technical review](docs/competition/evidence/demo-video-technical-review-v0.3.0-rc.1.json).
  The exact-release browser evidence also includes the
  [reviewed Chrome DevTools MCP receipt](docs/competition/evidence/chrome-devtools-mcp-v0.3.0-rc.1.json).
  The manual record completed with two limitations and no WCAG claim. The
  156.023-second video's full decode, 4,678 frames and 40 normalised caption cues
  passed technical review, but audible continuous playback and owner publication
  approval were not performed.
  The
  [manual Safari and VoiceOver record](docs/competition/evidence/manual-voiceover-journey-2026-08-30.json)
  is the historical pre-federation observation, completed with two retained
  limitations and no WCAG conformance claim. The
  [local video build receipt](docs/competition/evidence/demo-video-build-2026-08-30.json)
  binds a captioned 142.920-second review cut, transcript and source evidence;
  the separate
  [technical review](docs/competition/evidence/demo-video-technical-review-2026-08-30.json)
  records the full decode, 4,284-frame and 38-caption-cue checks without claiming
  owner approval. Neither is proof of public YouTube publication. The
  [final read-only compliance review](docs/competition/final-devpost-compliance-review-2026-08-30.md)
  is the retained checkpoint before the corrected-main Chrome observations;
  the
  [31 August local technical compliance review](docs/competition/final-devpost-compliance-review-2026-08-31.md)
  incorporates the current Chrome capture but is not the final live-rules and
  form refresh. Owner review, public-video and submission gates remain open.
  A separate
  [read-only Devpost status record](docs/competition/evidence/devpost-read-only-status-2026-08-30.json)
  distinguishes completed registration from the unsubmitted project draft; the
  [refreshed form-state receipt](docs/competition/evidence/devpost-read-only-status-2026-08-30-edd4ce6.json)
  records the later blank `submission_pre_draft` state without changing it.
  Each record applies only to the revision and observation it names.
