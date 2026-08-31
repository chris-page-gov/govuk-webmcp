# OKF federated personal-agent evaluation plan

## Purpose

This plan evaluates the next stage of Evidence Trace: exposing four governed
Open Knowledge Format (OKF) source snapshots through the same bounded human and
WebMCP discovery journey.

The proposition is specific. Public bodies can publish static, inspectable
knowledge artefacts and small page tools. A citizen-selected AI can use
permitted context to decide which tool to call, while the page receives only
the action-specific input admitted by its closed schema. The public page does
not need to host a general-purpose model or accept the citizen's identity,
profile or general personal-context object. The value under test is precisely
that separation: OKF exposes governed evidence and WebMCP exposes bounded
actions over it to the citizen's chosen AI.

The proposition is not that WebMCP creates trust, a personal AI is private by
default, the AI will always ask better questions, or the design has already
saved public money. Provenance quality, retrieval quality, context
minimisation, user comprehension and whole-system cost require separate tests.

## Candidate boundary

The candidate keeps two evidence tiers visibly separate:

| Evidence tier | Population | What is admitted | What is not established |
| --- | ---: | --- | --- |
| Receipt-bound deep evidence | 80 records | Same-origin records with this application's packaged evidence receipts | Comprehensive GOV.UK coverage or current source certification |
| Federated source snapshot | 58,655 locked raw rows; 58,652 searchable; 3 quarantined | Four allowlisted static OKF search publications with source-native identity, snapshot and limitations | A unique-record count, local deep-evidence receipts or official endorsement |

The federated total is the sum of declared source-snapshot records, before
cross-source deduplication:

| Collection | Declared records | Important population boundary | Descriptor |
| --- | ---: | --- | --- |
| A Life in the UK | 9,757 | Includes 293 life-course service families; it is not 9,757 official services | [OKF descriptor](https://chris-page-gov.github.io/okf-uk-living/okf-explorer.json) |
| ONS data discovery | 5,097 | Metadata records, not statistical observations | [OKF descriptor](https://chris-page-gov.github.io/okf-ons/okf-explorer.json) |
| UK Government APIs | 41,598 | Catalogue records with record-specific access and rights states, not 41,598 callable APIs | [OKF descriptor](https://chris-page-gov.github.io/okf-uk-government-apis/okf-explorer.json) |
| HM Land Registry public estate | 2,203 raw; 2,200 searchable; 3 quarantined | Public metadata records only; no title, property ownership or personal records; standalone legislation rows are excluded | [OKF descriptor](https://chris-page-gov.github.io/okf-LandRegistry/okf-explorer.json) |

There is no standalone UK Legislation collection, payload, index or runtime
request. Exactly three standalone Land Registry legislation rows are
quarantined, and the searchable projection contains zero `legislation.gov.uk`
result links. The four locked snapshots retain 28 source-authored cross-
reference strings as inert, untrusted metadata: 6 in A Life in the UK, 3 in
ONS, 2 in UK Government APIs and 17 in Land Registry. They preserve source
digests and do not constitute a fifth collection. Tests must reject a
legislation collection or request and any apex or subdomain legislation result
link while keeping source strings inert; literal source-byte absence is not an
acceptance condition.

The totals are bound per source, not accepted only as an aggregate. The exact
ordered source/quarantined/searchable bindings are 9,757/0/9,757 for A Life in
the UK, 5,097/0/5,097 for ONS, 41,598/0/41,598 for UK Government APIs and
2,203/3/2,200 for HM Land Registry. Executable validation also binds each
collection's title, ordered supplementary counts, completeness statement and
first limitation before the values reach the human display. Co-digested
per-source redistribution and contradictory display wording must fail closed.

These OKF sites are independent republications maintained in the entrant's
repositories. They preserve links to underlying sources but are not official
government services and are not evidence of endorsement.

## What OKF and WebMCP each contribute

```text
citizen and permitted context
              |
              v
citizen-selected host and model
  decides whether a tool is relevant
  and derives a minimal query
              |
              v
closed WebMCP page-tool contract
  bounded input, deterministic action,
  visible human equivalent
              |
              v
static OKF evidence plane
  allowlisted snapshots, search shards,
  source routes, provenance and limitations
```

OKF contributes governed publication structure: stable identities, declared
populations, progressively loadable search and record assets, relationships,
source routes, assertion state and limitations. WebMCP contributes an explicit
machine-callable contract over actions already available on the page. The
citizen-selected AI contributes contextual reasoning and tool choice. None of
the three layers should be described as doing the work of the other two.

The public site and OKF producers host static files, not a model. A remote
personal-agent provider may nevertheless receive prompts, tool metadata,
arguments and results. A local model can keep inference local, but the browser,
local software and static hosts still have ordinary request and logging
boundaries.

## A–M acceptance matrix

The deterministic and browser gates run before any model-backed evaluation.
An observed claim is released only when its named evidence is bound to the
same candidate commit.

Eight Low findings from the federated candidate scans now have implemented
remediations: the seven covering aggregate build complexity, Land Registry row
policy, mutable-source revision claims, partial-source isolation, producer
trust self-promotion, prototype-key tokens and concurrent shard work, plus a
trailing-dot and secondary legislation-URL bypass
(`csf_a2d9e030fda789ecd1cb0e41`). Sealed scan
`9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven and found the
eighth with High confidence and Low severity. It reported no other open
reportable candidate, but its coverage is mechanically partial and has stale-
pending rows, and the eighth fix postdates its snapshot. Focused security
checks passed 119 of 119, then the affected post-fix subset passed 23 of 23.
The full unit command passed 173 of 173 in `17128.154916 ms` before the latest
three engineering remediations.

Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` subsequently completed
50 of 50 review items and dynamically reproduced three candidates: mutable
local-model identity evidence, aggregate-only per-source population binding and
cancellation-driven physical shard-work amplification. Attack-path review
classified zero as reportable vulnerabilities because the paths require
privileged loopback model-service control, repository/build or same-origin
write authority, or produce bounded self-availability impact. All three remain
engineering or evidence-integrity defects and have working-tree remediations. The
next exact-range scan, `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a`, completed 55
of 55 review items and retained one High-confidence, Low-severity co-digested
source-substitution finding (`csf_050a3c08c471d3176e0640c3`). Separately code-
reviewed pins for all five admitted source files, a direct federation-lock byte
check in the standalone builder and two mutation regressions now remediate that
path. Immutable fixed-tree scan `040ad945-3723-4aef-9c03-1bb552630deb`
completed 55 of 55 review items against exact commit
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
Release binding remains pending; the deterministic local portions of gates
A–I now have exact post-remediation observations.

The frozen authored lexical-quality runner is implemented and required by CI
and Pages after `npm test`. On the exact post-remediation candidate, the
research pack passes 4 of 4; production build/data validation passes with 80
reviewed records and 80 receipts, 58,655 raw rows, 3 quarantined rows, 58,652
searchable rows, 120 record shards and 1,733 postings shards; and the prepared
unit suite passes 193 of 193. The frozen runner passes with mean nDCG@10
`0.984698009`, Recall@20 `1`, identical cold/warm results, no legislation
collection and rejection of a legislation request. Installed Chrome and
Microsoft Edge each pass 30 of 30, six of six model-free WebMCP smoke calls pass
in real Chrome, `npm audit` reports zero vulnerabilities across 162 total
dependencies, and `git diff --check` is clean. Gate D still requires release
binding; these bounded fixture metrics are not model-quality or corpus-wide-
recall evidence. Protected CI and integration, Pages, supported-host,
accessibility, model-backed and refreshed-video evidence remain pending.

The final-candidate demonstration preflight correctly failed closed without a
deployed commit and explicit overwrite approval. It did not start live capture,
so it contributes no gate M live-capture evidence.

| Gate | Proposition | Method | Pass condition | Claim unlocked |
| --- | --- | --- | --- | --- |
| A — source allowlist | Only the four approved OKF publications can contribute results | Validate exact collection IDs, canonical HTTPS origins, paths, snapshots, counts and source-lock digests; try unknown origins, credentials, explicit ports, redirects, traversal, a standalone legislation source or request and apex, trailing-dot, subdomain or secondary legislation result links while retaining the 28 inert source-authored cross-references | Exactly four sources and 58,655 raw rows validate; exactly 3 known rows are quarantined and 58,652 are searchable; every undeclared route fails closed before consumption; no legislation collection, request or result link is created | The candidate is scoped to four named OKF source snapshots |
| B — snapshot integrity | A self-consistent checksum is not enough to establish semantic integrity | Test raw-byte corruption and co-digested changes to aggregate and per-source counts, admission/collection identity, display contract, snapshot, entry point, shard reference and cross-artefact binding | Every mutation is rejected or marks only that source unavailable; no altered value or contradictory population statement enters a result or display | Admitted bytes and their declared meaning are checked against the local source lock and exact collection contract |
| C — progressive delivery | Broad discovery does not require hydrating 58,652 searchable records at start-up or for one bounded query | Record initial and query-time requests, transferred bytes, decoded rows, retained text, heap, worker lifetime and time against committed per-source and aggregate budgets; exercise 4 active, 32 queued and 36 distinct in-flight physical-file limits | Start-up loads no full corpus; one query fetches only declared search assets and selected record chunks; the 3-second file deadline includes queue time; a slot is retained until loader settlement; every budget is enforced | The static publication is progressively retrievable within declared limits |
| D — deterministic search | Search is reproducible and honest about partial or capped postings | Use exact-ID, exact-title, publisher, topic, multi-token, ambiguous, no-match and cross-source duplicate cases; report nDCG@10, Recall@20 and prohibited-route failures on a frozen fixture | Same candidate and input produce the same ordered results and digest; approximate counts remain labelled; no result is invented | The page provides deterministic bounded discovery, not model-generated ranking |
| E — four source journeys | Every included producer is genuinely searchable and retains its own boundary | Run a synthetic life-course situation, an ONS metadata query, an API rights/access query and a Land Registry metadata query against frozen expected routes | At least one expected source-native route from each collection is returned with its producer-declared link, destination hostname, “Not independently established” authority and collection-specific limitation | All four approved source snapshots contribute usable discovery results without asserting official status |
| F — common evidence shape | Normalisation does not erase source-native identity or upgrade assurance | Validate every result's collection ID, tier, native route and ID, snapshot, digest state, source URL and destination hostname, producer-declared assertion/derivation, freshness, access, rights, coverage and limitations | Required fields survive the human and tool paths; missing remains missing; producer text never promotes a link or assertion to official; grouped duplicates preserve every source membership | A person and an agent can compare results without treating all evidence as equivalent |
| G — parity and partial failure | One source failure remains visible without disabling verified evidence | Compare human and WebMCP result digests; fail each source in turn; repeat without WebMCP | Human and tool results agree; an affected source is labelled unavailable; unaffected federated sources and the 80-record tier still work; no unverified fallback is substituted | Failure is isolated, visible and does not silently weaken assurance |
| H — context minimisation | The page does not require or accept a citizen profile | Reject `personalContext`, identity, profile, location-history and browsing-history fields; use synthetic secret markers; inspect tool arguments, app-origin requests, storage and logs | Only task-minimal schema fields reach the page action; secret persona markers do not enter tool arguments, app requests or storage; provider traffic is reported separately | The page-tool contract minimises context; it does not prove end-to-end privacy |
| I — injection and resource safety | Source material cannot become instructions or cause unbounded work | Exercise prompt-like text, markup, source-derived URLs, accessors, deep objects, oversized queries, shard fan-out, decompression, aggregate rows, timeouts, cancellation churn, queued expiry, non-cooperative loaders and worker errors | Content remains inert and untrusted; no source defines a tool or request target; every work limit and cancellation path fails cleanly; physical loads never exceed 4 even if all four cease to settle | Expanded coverage does not expand the instruction or arbitrary-network trust surface; fail-closed unavailability remains visible |
| J — independent agent selection | Tool execution and model tool choice are separate claims | Run model-free WebMCP smoke first; then use one exact fixed local tool-calling model for at least three runs per case through `webmcp-evals`; for a local Ollama run bind pre/post `/api/tags` and post-run `/api/ps` identity in receipt v2; repeat representative calls in Microsoft WebMCP Explorer Agent Step | Deterministic smoke passes before model use; every model run, alternate valid trajectory, failure and variance is retained; local identity evidence is exact and stable; an unrelated case makes no government-tool call | A named model in a named host selected the bounded tools under the recorded conditions, with daemon-reported post-run identity evidence rather than cryptographic per-response proof |
| K — accessibility and fallback | Federated status and provenance remain understandable without an agent | Test keyboard, 320 CSS-pixel reflow, forced colours, reduced motion and axe; run a focused manual screen-reader journey over collection status, results, source and limitations | The complete human journey works without WebMCP; source failures and evidence tiers have meaningful names and announcements; barriers are recorded | The federated journey has an accessible manual equivalent in the tested environments |
| L — whole-system cost | Moving inference away from the page may change, rather than remove, cost | Compare matched tasks against a defined government-hosted-assistant baseline; measure government-origin requests, bytes, static hosting, model compute, operations, assurance, maintenance, support, citizen/provider cost, latency and outcome quality | Assumptions and all cost transfers are reported; source quality and task outcomes are comparable; uncertainty is retained | Only a completed reviewed study can support a bounded cost statement |
| M — release binding | Local success does not prove the public candidate | Bind source locks, built files, schemas, evaluation fixtures, test reports, deployed commit, live bytes, browser/host/model versions and observation dates in receipts | The exact deployed candidate matches the passing artefact; signed-out human and supported-host journeys pass; planned checks remain labelled planned | Claims are traceable to an exact public candidate and observation |

The physical-work condition deliberately prefers a bounded outage to hidden
amplification. If up to four non-cooperative loaders never settle, they can keep
all four active slots indefinitely and federated loading can remain unavailable.
Queue or immediate pre-loader deadline expiry must return the scheduler-busy
result, not a false source-corruption result. The runtime must expose any
failure and must not create a fifth physical load.

## Representative deterministic cases

The source adapters should first be tested against tiny, same-origin synthetic
fixtures for both supported static-search contract versions. This keeps source
availability and producer drift out of ordinary pull-request tests. The fixture
must include:

- one valid result per source;
- a source-native identifier collision across two collections;
- one missing licence and one inferred rights basis;
- one stale observation;
- one capped posting with an approximate count;
- one prompt-like description that remains inert;
- one missing source and one semantically altered but re-digested source; and
- a legislation-shaped source and request that the allowlist rejects while an
  inert source-authored `legislation.gov.uk` cross-reference remains data.

After those fixtures pass, run a separate bounded live-source compatibility
smoke. A live-source failure is evidence about that publication at that time;
it must not be repaired by weakening the local contract or rewritten as a
passing product result.

The four positive journeys must retain source-specific meaning:

- **Life course:** identify a supported family or ask a clarifying question;
  do not give eligibility, medical, legal or financial advice.
- **ONS:** identify metadata and its provider route; do not present a catalogue
  record as the statistical observation itself.
- **Government APIs:** retain whether access and licence are declared, inferred
  or missing; do not claim an endpoint is callable.
- **Land Registry:** return public-estate metadata and its source link; state
  explicitly that no title, ownership, property or personal record is supplied.

## Personal-agent evaluation

### Model-free first

Run schema, integrity, deterministic search, human parity, browser and
`webmcp-evals` smoke checks before supplying a model. This establishes what the
page does independently of agent selection. A tool list, screenshot or
successful deterministic call is not model-selection evidence.

### Fixed-model repeated runs

Use an exact provider-prefixed model identifier and freeze the tool definitions,
prompt fixture, candidate commit and run count. Prefer a capable local
tool-calling model in a disposable profile. Run each case at least three times
and report:

- selected tool and arguments;
- whether no call, clarification or another trajectory was valid;
- returned source and evidence tier;
- unsupported fields or leaked persona markers;
- console, page and network errors;
- latency, step count and result digest; and
- per-case and aggregate variance.

Five local attempts are now preserved. Each used Chrome 152,
`webmcp-evals` 0.0.4, eight cases, three runs per case (24 case executions),
33 expected rows and exact loopback-only model `ollama:gpt-oss:20b`, whose local
inventory digest was
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
The first three used no remote credential. The initial pre-legibility attempt passed
8 of 102 retry-expanded upstream rows. Schema, tool-description and fixture
changes then exposed canonical machine identifiers and told the model to omit
unused optional arrays. Attempt 2 passed 33 of 33 upstream rows, but the strict
project verifier accepted 32 of 33 because one call still added empty optional
arrays. Attempt 3, on the security-fixed tree, passed 30 of 35 upstream rows
after two malformed-then-corrected provenance IDs and one omitted comparison.
Receipt-v2 attempt 4 at 01:53 on 31 August 2026 bound stable exact identity and
exited zero, but structural validation failed and its evaluation was null.
Receipt-v2 attempt 5 at 02:13 used fixture digest
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f` and
reported 36 rows for 33 expected rows: 30 pass, 6 fail, 0 error, 0 console errors
and 0 missing. All three provenance trajectories first supplied a malformed
canonical ID, were rejected, then recovered with a correct successful call.
`verify-reports` failed. All five attempts failed overall. They show substantial
legibility improvement, fail-closed recovery and real variance, but do not
satisfy gate J or support a model-backed pass claim.

The first three attempts used the earlier receipt contract and are not upgraded
retrospectively. Attempts 4 and 5 used receipt v2: the exact selected name and digest
reported by `/api/tags` before and after evaluation matched the daemon-reported
loaded name and digest from `/api/ps` afterwards, remained stable and recorded
`executionBound: true`. Its private JSON and HTML report SHA-256 values are
represented in tracked evidence as
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and
`3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.
Missing, ambiguous or mismatched identity evidence fails
the run. This is evidence reported by the selected local daemon after the run,
not cryptographic proof that an individual response came from particular
weights. Privileged control of the local account, model daemon or evidence
channel, tag changes between observations and a previously loaded model remain
outside the receipt's trust boundary. Inventory fetches reject redirects,
require exact `name` and `model` values and reject `remote_model` or
`remote_host` markers. An Ollama-labelled cloud proxy must therefore use the
explicit remote-provider route and approval.

Microsoft WebMCP Explorer is a privileged development harness, not a security
oracle. Use Agent Step, no credential while inspecting tools, a disposable
profile, explicit approval for presentation effects and no real personal
context. A remote-provider comparison needs separate approval, a revocable
low-limit credential and synthetic prompts. Record that the provider may
receive prompts, tool metadata, arguments and results.

### Synthetic-persona minimisation set

Use public, invented circumstances and visible sentinel values rather than real
citizen data. Include:

1. a new parent seeking official starting points;
2. a recently unemployed person where two life-course families are plausible;
3. an analyst looking for ONS metadata;
4. a developer looking for an API with explicit access and rights caveats;
5. a researcher looking for Land Registry metadata; and
6. an unrelated calculation for which no government tool should be called.

The prompt gives the agent more context than the page tool needs. The expected
behaviour is to ask a clarifying question where necessary and pass only a
general, task-minimal query and admitted filters. Do not use a personally
identifying name, address, postcode, account, health condition, benefit claim
or financial fact. A successful minimisation test shows behaviour under the
recorded model and prompt; it does not guarantee future agent behaviour.

## Earlier OKF evidence and its exact limits

The design reuses tested ideas from OKF Explorer, but those results are not
evidence that this candidate has passed:

- The [AI usage guide](https://github.com/chris-page-gov/okf-explorer/blob/main/docs/ai-okf-usage.md)
  defines descriptor-first progressive loading and requires source routes,
  assertion states and limitations to survive retrieval.
- The [SharePoint and Microsoft 365 Copilot development trial](https://github.com/chris-page-gov/okf-explorer/blob/main/docs/sharepoint-m365-copilot-trial.md)
  returned 293 of 293 safe responses and 292 of 293 strict top-1 family
  selections. The situations were authored development cases, not an
  independent holdout; the delivery path used SharePoint Word records, not
  WebMCP; and one preserved near-neighbour selected the broader Universal
  Credit family.
- The [deterministic MCP context evaluation](https://github.com/chris-page-gov/okf-explorer/blob/main/research/okf-evolution-review/evidence/mcp-context-evaluation.json)
  placed the expected record in the top-three context for seven of seven
  authored questions, with mean reciprocal rank at five of 0.8333 and mean byte
  reduction of 99.5567%. It evaluates deterministic retrieval and compactness,
  not language-model answer correctness.

No equivalent committed ChatGPT, Claude or Gemini model-selection result was
found in that evidence. These results shape prompts, identity gates,
clarification cases and failure reporting; they do not transfer a success rate
to this application or its four federated collections.

## Future study with people unfamiliar with the approach

After the technical and agent gates pass, pre-register a small usability pilot
with people who have not used OKF, WebMCP or this interface. Do not recruit or
label people as deficient; the study tests whether the design teaches its own
evidence model.

Use synthetic, non-consequential tasks in a randomised crossover comparison:

- answer-first presentation without the analytical index; and
- the evidence-first analytical index, separate facets and source exploration.

Measure whether participants can identify the authoritative source, distinguish
an official source from an independent OKF republication, find a limitation,
recognise missing access or rights evidence, avoid treating a catalogue result
as advice, and state when they would check the current source. Also record task
completion, time, confidence calibration, keyboard or assistive-technology
barriers and qualitative comprehension. Fix sample size and analysis after a
pilot and before the main study; publish null and negative results. This study
must not use real eligibility, legal, medical or financial decisions.

## Cost comparison

Evaluation E-34 remains the controlling cost gate. Compare matched tasks and
outcome quality across:

1. a defined government-hosted model-and-retrieval baseline;
2. the static OKF and WebMCP page with a citizen-selected model; and
3. the complete manual page journey where useful as a non-model reference.

Count static storage, CDN traffic, source refresh, assurance, maintenance,
operations and support on the public side. Count model inference, provider
processing, device use and user effort on the citizen side. Report whether a
cost was removed, reduced or merely transferred. No saving claim is permitted
before the assumptions, comparable outcomes and results have been independently
reviewed.

## Judge-facing account

The evidence should map cleanly to the four equally weighted judging criteria:

- **WebMCP leverage:** the page exposes explicit bounded actions over 58,652
  searchable federated records from 58,655 locked raw rows while preserving the same inspectable human
  journey. The agent receives typed evidence fields rather than reconstructing
  them from cards or screenshots.
- **Execution:** source locks, integrity checks, progressive budgets, partial-
  failure status, accessibility, human/tool parity and exact release receipts
  make the limits observable rather than hiding them.
- **Potential impact:** the candidate demonstrates how a public body could
  publish static evidence for a citizen-selected AI instead of operating a
  general-purpose assistant. Savings, privacy improvement and better questions
  remain measured hypotheses.
- **Creativity and ambition:** OKF supplies an evidence plane, WebMCP makes its
  actions machine-callable, and the analytical index keeps evidence before
  answers for people and agents alike.

Safe concise wording is:

> OKF publishes governed, progressively retrievable evidence. WebMCP exposes
> bounded actions over it to a citizen-selected AI, while the person sees the
> same sources and limitations. The page hosts no model and accepts no personal
> profile.

Always accompany that with the remote-provider boundary. Do not claim
end-to-end privacy, comprehensive or current government coverage, a unique-
record interpretation of 58,655 raw rows, official endorsement, general model accuracy, a durable MCP
gateway, service advice or a measured public saving.

The official submission boundary closes at 1:00 pm PDT on 3 September 2026. It
requires a public source repository with a visibly detectable open-source
licence, a public YouTube demonstration under three minutes with audio and the
exact live project accessible in ChatGPT's in-app browser or Chrome with WebMCP
enabled. Freeze the repository, live project and submission after close. These
requirements do not establish registration, submission or a public video upload.
