# 19. Draft Devpost submission text

**Status: registered; draft only — not submitted.** Devpost project `1406973`
remains an unpublished `submission_pre_draft` in the last authenticated
read-only observation. No submission action is authorised by this document.

This draft describes the public `v0.3.0-rc.1` federated release. Protected CI,
Pages, exact public-byte comparison and current supported-host execution are
complete. Do not enter it as final submission copy until the refreshed
VoiceOver evidence is complete, Chris Page has approved the final video, its
public YouTube playback works signed out, and every live Devpost field and
human attestation has been reviewed again.

## Project title

**Evidence Trace: ask AI, inspect the evidence**

44 characters; Devpost limit: 60.

## One-line description

Evidence before answers: WebMCP lets your chosen AI search governed UK public evidence, while every result keeps its source, integrity and limitations open for you to inspect.

175 characters; Devpost limit: 200.

## Live Devpost form mapping

Authenticated read-only Devpost calls at `2026-08-31T12:16:23Z` confirmed
that project `1406973` remained `Untitled` and `submission_pre_draft`, with no
tagline, description, video URL, publication timestamp or submission timestamp.
This is a time-bounded observation of editable state, not a submission receipt.
The following remains preparation copy only.

| Live field | Prepared value or owner action |
| --- | --- |
| Submitter Type (`28249`) | **Owner decision required:** Chris Page must select the truthful individual, team or organisation route. |
| Country of residence (`28250`) | **Owner attestation required:** select the truthful country value in the live form. |
| Organisation name (`28251`, conditional) | Complete only if the organisation route is selected. |
| App Status (`28252`) | **Owner decision required:** choose `New` or `Existing` consistently with the disclosed pre-existing OKF design lineage and this repository's separately evidenced competition-period WebMCP implementation. |
| Existing-project explanation (`28253`, conditional) | If `Existing` is selected, explain that earlier OKF and `gis-ai-go` work supplied research and design lineage, while this repository's dated competition-period commits implement the five-tool WebMCP product, evidence interface, tests and deployment. |
| Live URL (`28254`) | `https://chris-page-gov.github.io/govuk-webmcp/` — exact public release commit `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`; verify it again signed out before final entry. |
| Testing instructions (`28255`, optional) | Open the deployed live URL in a currently supported WebMCP host. Confirm five tools, run `search_government_knowledge` with `{"query":"housing","collections":["uk-living","ons","government-apis","land-registry"],"limit":8}`, then inspect one returned record and its provenance. Repeat the query in the visible human interface and compare the structured fields. No account or credential should be required. |
| Public repository (`28256`) | `https://github.com/chris-page-gov/govuk-webmcp` |
| Tested agents or clients (`28257`) | Codex In-app Browser plugin 26.825.32147 completed all five tools on exact public `v0.3.0-rc.1`, rejected unrelated `personalContext` and retained fixed-query human/display parity. Historical Chrome native-panel and Chrome DevTools MCP evidence remains separately labelled. Do not imply that a model selected a tool. |
| AI tools used (`28258`) | **Draft from Chris Page's assurance:** ChatGPT, Codex, Claude and Gemini were used through Chris's personal subscriptions for research, design, implementation and review. Chris must confirm the final wording. |
| Learning level (`28259`) | **Owner assessment required:** select `None`, `Moderate` or `Significant`. |
| Career value (`28260`) | **Owner assessment required:** select `Yes` or `No`. |
| Public video URL | **Blocking:** add only after the refreshed federated cut is approved and signed-out public playback passes. |

The project title and one-line description are candidates for Chris to select
and edit, not final form values. The entrant remains responsible for the
project name, claims, form answers and final submission.

## The problem

Government information is widely published but fragmented across web pages,
dataset catalogues, API catalogues and publisher documentation. A plausible AI
answer can hide who made each claim, how the evidence was transformed, when it
was observed, whether its bytes still match, whether access and reuse are
established, and what the selected material does not cover.

Putting a general-purpose chatbot on every government website would also make
each public body responsible for operating AI infrastructure and collecting
enough citizen context to personalise an answer. That is not the only design
available.

## What we built

Evidence Trace is an independent static TypeScript prototype for **evidence
before answers**. It demonstrates an OKF publication pattern in which a
publisher makes governed evidence progressively retrievable: a small manifest
supports discovery, bounded shards support search, an exact record supports
inspection, and provenance metadata explains its source and limits.

The candidate exposes two deliberately different evidence tiers:

- **80 receipt-bound reviewed records** from the original curated GOV.UK
  evidence plane, with deep claim, relationship and integrity evidence; and
- **58,655 locked raw source rows, producing 58,652 searchable source-snapshot
  records** across UK Living, the Office for National Statistics, the UK
  Government API catalogue and metadata-only HM Land Registry discovery.

The federated tier preserves source identity, snapshot integrity, a producer-
declared human link where supplied, its destination hostname, and visible
access, rights, currentness and coverage limitations. It does not call that
link official or invent an item-level receipt. HM Land Registry contributes
metadata discovery only: no title, property, ownership, address, polygon or
personal rows are included. Exactly three standalone Land Registry legislation
rows are quarantined, leaving 2,200 searchable Land Registry records. There is
no standalone `legislation.gov.uk` collection, payload, search index or runtime
request, and the searchable projection contains zero `legislation.gov.uk`
result links.

## Why WebMCP changes the design

A compatible agent discovers five bounded tools on the same inspectable page:

- `search_government_knowledge`;
- `get_resource_record`;
- `show_provenance`;
- `explore_answer_foundations`; and
- `compare_evidence_foundations`.

The first three are read-only query tools. The final two truthfully declare a
reversible in-memory page-presentation effect. All five use closed schemas and
executable input validation. None accepts a personal profile, broad
`personalContext`, account credential or arbitrary prompt.

The important WebMCP step is separation of responsibilities. The static public
page publishes deterministic evidence tools but hosts no model. A
citizen-selected AI can use preferences or circumstances it already knows to
decide which bounded call is useful, without sending that private context to
this page. The WebMCP call exposes only the declared tool metadata, explicit
arguments and deterministic result to its caller; the static host may still
observe ordinary or query-derived same-origin asset requests.
If the citizen selects a remote AI provider, that provider can still receive
prompts, tool metadata, arguments and results; the page cannot control or hide
that separate boundary.

This differs from an embedded government chatbot. Evidence Trace does not ask a
public body to run a conversational model, maintain a user profile or make the
AI answer authoritative. It lets the citizen's chosen agent query publisher
evidence and then keeps the foundations available for human inspection.

## The complete human equivalent

WebMCP is an enhancement, not the only route. A person can use the same page to:

1. select one or more reviewed or federated collections;
2. search the catalogue with the same bounded query;
3. inspect each result's evidence tier, collection and publisher;
4. open the recorded producer-declared source link;
5. read integrity, snapshot, access, rights, currentness and coverage limits;
6. inspect an exact record or packaged provenance; and
7. explore and compare the deeper foundations available for reviewed claims.

Human controls and WebMCP callbacks share the same application actions and
deterministic runtime. The demonstration must therefore show human/tool parity
for the same query rather than merely show that tool names exist.

## Trust and safety design

WebMCP does not make a source trustworthy, and catalogue inclusion is not
permission, public access or official approval. The prototype contributes an
inspectable chain:

- exact source locks, checksums and deterministic generated projections;
- exact ordered per-source population and human-display contracts, so a valid
  self-digest cannot hide a count redistribution or contradictory claim;
- fail-closed validation before the five tools register;
- closed, bounded contracts repeated in executable validation;
- source-specific failure isolation and lazy same-origin retrieval;
- a separate physical shard-work cap of 4 active, 32 queued and 36 distinct in-
  flight files, with queue time inside the 3-second deadline and each slot held
  until its loader actually settles;
- a frozen deterministic nDCG@10/Recall@20 retrieval-quality gate required by
  CI and Pages, without presenting lexical fixture metrics as model quality;
- inert rendering and `untrustedContentHint: true` for source-derived text;
- visible evidence tier, link role, assertion state and limitations;
- conservative `producer-declared` trust labels, “Not independently
  established” source authority and visible link destination hostnames;
- fail-closed rejection of explicit URL ports and any apex, trailing-dot,
  subdomain or secondary `legislation.gov.uk` result link;
- no runtime call to an official API or model provider;
- no browser storage of queries, profiles, accounts or credentials; and
- a fully usable accessible human route when WebMCP is absent.

The reviewed tier has digest-bound item receipts. The wider source-snapshot tier
does not. Producer text cannot promote a federated link or assertion to official
status. The interface and tool result state those differences rather than turn
mixed evidence into a single trust score.

## What people and agents can do together

A citizen can ask their own AI a contextual question while the AI sends only a
small, declared query to the evidence page. The agent can search across the four
federated sources, inspect an exact record and follow its provenance. The person
can reproduce that journey visibly, open the source and challenge access,
rights, currentness or coverage. For the 80 reviewed records, both can also
inspect and compare deeper claim foundations.

This is a testable continuation of the purpose of OKF bundles: make evidence
portable and machine-actionable without making an AI answer canonical.

## What is demonstrated and what remains a hypothesis

The implementation can demonstrate deterministic discovery, bounded execution,
human/tool parity, source integrity and the absence of a personal-context input.
It does **not** yet demonstrate that a personal AI asks better questions, that
citizens disclose less information overall, that government operating costs
fall, or that answers become more accurate. Those are research hypotheses.

The next evaluation should compare an embedded-assistant baseline with the
publisher-tool pattern using fixed tasks and explicit measures: task success,
source-following, unsupported claims, personal data disclosed to each party,
tool-call variance, latency, bytes transferred and estimated operating cost.
Remote-provider and local-model runs must be reported separately, including
valid no-call and alternate-call outcomes.

Five local Chrome 152 attempts used `webmcp-evals` 0.0.4, eight cases, three
runs per case and exact loopback-only `ollama:gpt-oss:20b` inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. They failed overall: 8 of 102 retry-expanded rows;
then 33 of 33 upstream but 32 of 33 under the strict verifier; then 30 of 35
upstream. Receipt-v2 attempt 4 bound stable identity and exited zero but retained
a null evaluation after structural validation failed. Receipt-v2 attempt 5
retained 30 pass and 6 fail across 36 reported rows and failed `verify-reports`.
The legibility improvement and variance are useful evidence, but the
submission must not claim a model-backed pass.

Attempts 4 and 5 used receipt v2, matching the selected digest reported by
`/api/tags` before and after evaluation to the daemon-reported loaded digest
from `/api/ps` afterwards, with stable identity and `executionBound: true`.
That is post-run daemon
identity evidence, not cryptographic proof about an individual response, and it
does not upgrade the three historical failures. Redirects and remote-backed
Ollama identities fail the local route; explicit remote-provider approval is
still required for a cloud model.

## Release and submission observations

The historical public evidence relates to the earlier 80-record product.
Protected-main commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f` passed exact-main run
`33323068982` and Pages run `33323152751`; 20 public files matched Pages
artefact `9735478602`. The checksum-bound
[`v0.2.0-rc.1` pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1)
remains historical evidence.

On 30 August 2026, Chrome 152's native WebMCP panel and Chrome DevTools MCP
1.8.0 each completed the five earlier tools on the corrected public release.
Codex In-app Browser completed five calls on the earlier tagged release. These
observations do not prove model-led tool selection, ChatGPT desktop support or
universal browser support.

Pull request 16 passed validation run `33356087333` and merged public
`v0.3.0-rc.1` as commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. Exact-main run `33356272534`
and Pages run `33356452048` passed. The annotated tag and public pre-release
bind that commit. A byte-for-byte check compared all 1,879 regular deployed
files, totalling 128,548,215 bytes, with Pages artefact `9745316971`: every
request returned HTTP 200 and no file differed.

Codex In-app Browser plugin 26.825.32147 then completed all five WebMCP tools
on the exact public release. Its four-source `housing` query returned eight
bounded results; exact record, provenance, exploration and comparison calls
completed; unrelated `personalContext` was rejected; and the canonical and
displayed 11-row comparison digests matched. This is supported-host execution
and human/display parity evidence. No model selected the tools.

The previous 142.920-second local review MP4, captions, transcript, receipts and
manual Safari and VoiceOver evidence remain evidence for the pre-federation
journey. That video was not approved for publication, uploaded or submitted and
must not be presented as the federated demonstration. A refreshed video must be
recorded from the exact deployed release and pass owner and signed-out public
player review. The refreshed VoiceOver journey and video build remain open
pending the macOS capture environment; no WCAG conformance is claimed.

## `v0.3.0-rc.1` submission evidence gate

The exact post-remediation candidate passes research 4 of 4; production
build/data validation with 80 reviewed records and 80 receipts, 58,655 raw
rows, 3 quarantined rows, 58,652 searchable rows, 120 record shards and 1,733
postings shards; 194 of 194 prepared unit tests; and the frozen lexical gate at
mean nDCG@10 `0.984698009`, Recall@20 `1`, cold/warm parity, no legislation
collection and rejection of a legislation request. Installed Chrome and
Microsoft Edge each pass 30 of 30, and six of six model-free WebMCP smoke calls
pass in real Chrome. `npm audit` reports zero vulnerabilities across 162 total
dependencies and `git diff --check` is clean. The earlier 144-of-144 and 173-of-
173 results are historical pre-remediation checkpoints only.

Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` then completed 50 of 50
review items, dynamically reproduced three engineering or evidence-integrity
defects and classified zero as reportable vulnerabilities under attack-path
policy. The defects have working-tree remediations and the exact local verification
above exercises them. Exact-range scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a`
then retained one High-confidence, Low-severity co-digested source-substitution
finding. Separately code-reviewed pins for all five source files, a direct
builder lock-byte check and mutation regressions remediate it. Immutable fixed-
tree scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review
items against exact commit `9c6ed7d9a21574972ee564b333cbc49983058554` with
zero reportable findings. Protected CI and merge, Pages, exact public-byte
comparison and current supported-host execution are complete. Refreshed
VoiceOver evidence and the final video remain open. A strict model-backed pass
remains optional additional assurance; none is claimed.

The earlier final-candidate demonstration preflight correctly failed closed
because no deployed commit and no explicit overwrite approval were supplied.
After the exact deployment, guarded current-release human and supported-host captures
completed. The refreshed VoiceOver and final video build are still in progress,
so they do not yet supply submission-video evidence.

- [x] Protected-main CI passes for exact release commit
  `b0bd634579a3abf82bdd1fc83ff688535e0db0bf` in run `33356272534` after PR
  validation run `33356087333`.
- [x] GitHub Pages run `33356452048` serves that exact commit and its federated
  artefacts; all 1,879 regular files match artefact `9745316971`.
- [x] The installed Microsoft Edge acceptance suite passes 30 of 30 tests for
  the candidate.
- [x] The installed Chrome acceptance suite passes 30 of 30 tests for the
  candidate.
- [x] The full post-remediation prepared unit suite passes 194 of 194; the
  historical 144-of-144, 173-of-173 and 190-of-190 checkpoints remain
  separately labelled.
- [x] Codex In-app Browser plugin 26.825.32147 lists and completes all five
  WebMCP tools on public `v0.3.0-rc.1`; no model-selection claim is made.
- [x] Human and tool routes return the same canonical fields for the fixed
  query, including a matching displayed 11-row comparison digest.
- [ ] The refreshed nine-step Safari and VoiceOver journey is completed and
  reviewed with its limitations and without a WCAG conformance claim.
- [ ] The refreshed under-three-minute federated video is recorded from the
  deployed candidate and includes accurate captions and a transcript.
- [ ] Chris Page approves the cut, synthetic-voice basis, privacy, branding and
  submission claims.
- [ ] A public video URL works signed out.
- [ ] The final live Devpost fields, rules, attestations and URLs are reviewed
  without submitting.

## Potential impact

The pattern is useful wherever public knowledge must be examined without making
an AI answer the authority. It could let many public publishers expose small,
inspectable evidence tools while citizens choose the agent that contextualises
their journey. The intended benefits — less duplicated public AI
infrastructure, better questions and less context disclosed to a government
site — remain measurable propositions, not claimed outcomes.

## Creativity and ambition

The prototype treats the webpage as a shared evidence plane for people and
agents. It combines a human analytical index with progressively retrievable OKF
evidence and five bounded WebMCP tools. Separate facets, evidence tiers and
limitations remain visible instead of being compressed into a confidence badge.

## Boundary

This is an independent experimental prototype. It is not a GOV.UK or UK
government service and is not endorsed by any public body. It does not provide
access to restricted APIs, call providers, authenticate users, operate public
services or make official decisions. It is not a durable MCP gateway and makes
no claim of comprehensive or current coverage. Follow each recorded producer-
declared source link and independently verify its authority, currentness,
access and rights.
