# Title

Government Knowledge for Your AI

## One-line Summary

Your AI uses WebMCP to access government knowledge, while you can inspect the
sources, provenance and limits behind every result.

## Product Story

The owner-approved long-form Devpost description is maintained in
[`docs/competition/devpost-product-story.md`](docs/competition/devpost-product-story.md).
It is the canonical copy for the live project description; the sections below
remain the field-ready technical and evaluation reference.

## Problem

Government information is authoritative only within its scope, yet it is
spread across guidance, data catalogues, API directories and publisher
documentation. A fluent AI answer can conceal which source supports a claim,
when that source was observed, what has been transformed and what the evidence
cannot decide.

Embedding a separate chatbot in every public service is not the only answer.
It can duplicate model costs and ask citizens to repeat personal circumstances
that their chosen AI may already know.

## Solution

Evidence Answer is an experimental, static WebMCP application that lets a
person's chosen AI request task-minimal government evidence from the active
webpage. The page does not host a model or accept a personal-profile field. It
returns a bounded, deterministic evidence object and independently renders the
same object in an accessible Evidence answer, so the person can compare the
AI's prose with the source, status, limitations, remaining unknowns and next
appropriate check.

The public candidate combines 80 receipt-bound reviewed records with 58,652
searchable source-snapshot records from four governed OKF collections: A Life
in the UK, Office for National Statistics metadata, the UK Government API
catalogue and metadata-only HM Land Registry discovery. Three standalone
legislation rows are quarantined. The application makes no runtime request to
an official API.

## Why This Matters

WebMCP creates a useful division of responsibility. A personal AI can interpret
the person's circumstances, while the publisher supplies deterministic,
inspectable evidence without operating the conversational model. The person
can reproduce the search manually, follow the authoritative or
producer-declared link, and see where judgement or an authoritative service is
still required.

This makes “show me the evidence” part of the interaction rather than an
afterthought. It also demonstrates a route towards machine-actionable public
information that does not make an AI answer canonical.

## How We Used AI

Personal ChatGPT, Claude and Gemini subscriptions supported research, design
critique and evaluation planning. In an owner-operated Google Chrome and
ChatGPT extension smoke journey, ChatGPT reported all six Site tools ready,
followed the bounded ONS search request and visibly updated Evidence Answer to
the selected ONS Open Geography record. Its retained answer included the
source link and all four displayed limitations. The collapsed integration
exposed no exportable exact call trace, versions or model identity, and the
answer received only a bounded content review.

A second owner-directed ChatGPT Chrome extension evaluation covered all 12
published stories. Its public narrative reports 20 successful calls, two
deliberate no-call cases and two rejected preliminary probes. All six tools
were discovered, but only four were exercised and the share exported no raw
call or result trace. It is supplemental observational evidence, not proof of
answer safety, autonomous host behaviour or universal compatibility.

An owner-authorised Edge and ChatGPT extension follow-up also covered all 12
stories. Its editorially qualified host report reports 38 successful calls
across all six tools and records host-reported arguments plus the available
presentation and trace digests, alongside two deliberate no-call cases and
three rejected interface probes. The operator observed the final US-10 page
digest, which matches the tool digest in the host report. The report is not a
raw browser trace and its visible model
label is unverified, so this remains one supplemental directed observation.

No Site-tool invocation or Evidence answer update was observed for Microsoft
Copilot or Gemini. The pinned local Ollama evaluation had mixed results. All
are reported observationally, not as a causal model comparison or evidence
that any host answers safely or supports every WebMCP interaction.

## How We Used Codex

Codex turned the research and product brief into a modular TypeScript
implementation, generated and validated the source-snapshot corpus, built the
shared human/tool action layer, wrote contract and browser tests, completed
security reviews, captured release evidence and maintained the implementation
plan, backlog, status, handover and changelog in lockstep.

It also helped expose an important distinction: a persuasive response that
mentions Site tools is not evidence of a WebMCP call. Release receipts therefore
separate direct machine-observed tool execution, page presentation, personal
host observations and human accessibility observations.

## Key Features

- Six page-scoped WebMCP tools registered imperatively only after data,
  schemas and digests validate.
- Closed input schemas and executable validation, with bounded strings and
  result counts and no dedicated personal-context input.
- A default plain-English Evidence answer and a detailed Technical review,
  both usable without WebMCP.
- One deterministic presentation projection shared by human controls and the
  `present_resource_evidence` action.
- Visible source role, organisation, hostname, observation date, integrity,
  access, rights, coverage, limitations, unknowns and next check.
- 80 receipt-bound reviewed records and 58,652 searchable federated
  source-snapshot records.
- Static, same-origin delivery with no model, account, profile, runtime
  official-API request or browser storage.
- Accessible keyboard navigation, reflow and assistive-technology evidence,
  with limitations stated rather than converted into a conformance claim.

## Architecture

The browser loads a checksum-bound same-origin manifest, schemas and immutable
data shards. Validation completes before the human search and six WebMCP tools
become available. Search, record inspection, provenance, foundation exploration,
comparison and evidence presentation all call the same application actions.
Source-derived strings are treated as untrusted and rendered inertly.

The presentation action validates and builds its complete result before
committing page state. It is reversible, latest-started-request wins and a
failed request leaves the previous answer intact. A WebMCP call does not alter
the URL, history, focus or scroll position.

## Testing Instructions

1. Open <https://chris-page-gov.github.io/govuk-webmcp/> in Google Chrome with
   WebMCP enabled. No credentials are required.
2. Confirm the page reports that all knowledge artefacts are verified and six
   WebMCP tools are ready.
3. In the ChatGPT extension or another compatible host, ask it to use Site
   tools to search for `ONS statistics`, then inspect the most relevant record,
   its source and limitations, and present its evidence.
4. If the host does not expose page tools, use the Technical review interface
   to perform the same human search. This is a recorded compatibility outcome,
   not a site failure.
5. Compare the AI's prose with the Evidence answer. Check the source link,
   evidence tier, observation date, every limitation, the remaining unknowns
   and the next check.

One owner-operated ChatGPT Chrome extension journey completed the visible
search-and-present outcome. A second owner-directed run covered all 12 stories
and its public narrative reports 20 successful calls and two deliberate
no-call cases. It discovered all six tools but exercised only four, rejected
two preliminary probes and exported no raw call or result trace. Separately,
an Edge and ChatGPT extension run reported 38 successful calls across all six
tools and recorded host-reported arguments plus available presentation and
trace digests in its narrative report; the observed final US-10 page digest
matches the tool digest in that report. It had three rejected interface probes
and no raw browser trace. Exact direct Chrome DevTools evidence
also completed all six WebMCP tools against the deployed release and matched
the final tool/page digest. These observations do not establish answer safety,
autonomous tool selection or universal compatibility.

## Public Demo Link

<https://chris-page-gov.github.io/govuk-webmcp/>

## Public Repository Link

<https://github.com/chris-page-gov/govuk-webmcp>

## Demo Video

TODO: add Chris's public, under-three-minute YouTube demonstration after
signed-out playback verification. Do not rebuild the existing 120.326-second
local review cut; it remains an optional private reference.

## Screenshot Shot List

1. The public Evidence answer landing view and verified corpus totals.
2. Human search and a selected result in Technical review.
3. A completed Evidence answer showing its source and limitations.
4. ChatGPT in Chrome completing the ONS search-and-present journey beside the
   visibly updated Evidence answer.
5. The independent direct six-tool receipt and the honest Copilot, Gemini and
   Ollama limitations.

## Submission Readiness Notes

- The live Devpost project `1406973` is populated and publicly viewable, but
  its challenge submission timestamp remains null.
- The official deadline is 3 September 2026 at 20:00 UTC (9pm BST).
- The live application and public repository exist.
- The exact release tag and GitHub prerelease remain to be created.
- Chris will record the required public YouTube demonstration. The existing
  local cut will not be rebuilt. Signed-out playback remains required.
- GitHub Pages is the only repository-recorded, exact-byte-verified candidate
  and is the sole submission URL. No second ChatGPT Sites deployment is
  recorded in this repository; do not spend the submission window trying to
  synchronise or claim one.
- The final Devpost submission remains a separate explicit action.

## Known Limitations

- WebMCP is experimental and host support varies.
- The successful ChatGPT Chrome extension journey is one owner-operated visual
  smoke observation. Its exact call trace, versions and model identity were
  not captured, and its answer received only a bounded content review.
- The second Chrome extension run is an owner-directed public narrative: it
  reports 12 stories, 20 successful calls and 2 deliberate no-calls, but only
  4 of 6 discovered tools were exercised, 2 preliminary probes were rejected
  and no raw call or result trace was exported.
- The Edge extension follow-up is one owner-directed run. Its report records
  38 successful calls, host-reported arguments and available presentation and
  trace digests across all 6 tools, but it is not a raw browser trace; 3
  interface probes were rejected and the
  visible model label was not independently verified.
- The latest personal Microsoft Copilot observation did not expose or invoke
  the page tools; it used ordinary page-reading instead.
- The local Ollama evaluation produced mixed tool-selection results and does
  not support a safe-answer claim.
- Federated records are source-snapshot metadata, not individually reviewed
  facts or live service responses.
- HM Land Registry coverage is metadata discovery only; it contains no title,
  owner, address, polygon or legal proof.
- The page cannot decide eligibility, legal duties, property ownership or a
  current statistic, and it cannot inspect the personal AI's final prose.
- The assistive-technology journey records observed behaviour and explicit
  limitations; it is not a WCAG conformance claim.

## TODO Official Form Fields

| Field | Prepared answer |
| --- | --- |
| Submitter Type | `Individual` |
| Country of residence | `United Kingdom` — owner to confirm before submission |
| Organisation name | Leave blank for an individual entry |
| App Status | `Existing` — transparent choice because the OKF design lineage predates the competition |
| Existing-project explanation | Earlier OKF and GIS AI GO work supplied the research and design lineage. During the competition period this repository implemented the six-tool Evidence answer application, four-source federation, accessible human interface, deterministic tests, protected deployment and release evidence. |
| Live URL | `https://chris-page-gov.github.io/govuk-webmcp/` |
| Testing instructions | Use the five-step procedure above; no credentials are required. |
| Public repository | `https://github.com/chris-page-gov/govuk-webmcp` |
| Agents or clients tested | Google Chrome with the ChatGPT extension completed one visible search-and-present journey. A second owner-directed Chrome narrative covers all 12 stories and reports 20 successful calls and 2 deliberate no-calls; it exercised 4 of 6 tools, rejected 2 probes and exported no raw trace. An Edge 152.0.4191.53 and ChatGPT for Edge 1.26.827.12125 follow-up reports 38 successful calls across all 6 tools and records host-reported arguments plus available presentation and trace digests in its narrative report; the observed final US-10 page digest matches the tool digest in that report. It had 3 rejected probes and no raw browser trace, and `5.6 Sol` is an unverified UI label. Separately, Chrome DevTools MCP 1.8.0 completed all six fixed direct calls with deterministic page-result parity. No Site-tool invocation or Evidence answer update was observed for personal Microsoft Copilot or Gemini. Local Ollama `gpt-oss:20b` selected and executed tools in 6 of 36 runs, failed in 30 and recorded 3 runner errors. No autonomous-host, universal-compatibility, privacy or safe-answer claim is made. |
| AI tools used | ChatGPT, Codex, Claude, Gemini, Microsoft Copilot and local Ollama. |
| Learning | `Significant` — owner to confirm before submission |
| Career value | `Yes` — owner to confirm before submission |
