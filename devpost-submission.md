# Title

Evidence Answer: check what your AI tells you

## One-line Summary

Your compatible AI can query bounded government evidence, while an accessible
Evidence Answer shows every source, limitation and unknown so you can check
before you act.

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

The public candidate combines 80 deeply reviewed records with 58,652
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
critique and evaluation planning. Microsoft Copilot in Edge MCP Workspace and
a pinned local Ollama model were evaluated as distinct personal-AI host
arrangements. Their results are reported observationally, not as a causal model
comparison.

The latest personal Copilot observation could read the active page but did not
produce an observable Site-tool call or Evidence answer update. The local
Ollama evaluation also had mixed results. These negative findings are retained:
the candidate makes no claim that either host answers safely or supports every
WebMCP interaction.

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
3. Ask the host to use Site tools to search for `ONS statistics`, then inspect
   the most relevant record, its source and limitations, and present its
   evidence.
4. If the host does not expose page tools, use the Technical review interface
   to perform the same human search. This is a recorded compatibility outcome,
   not a site failure.
5. Compare the AI's prose with the Evidence answer. Check the source link,
   evidence tier, observation date, every limitation, the remaining unknowns
   and the next check.

Exact direct Chrome DevTools evidence has completed all six WebMCP tools
against the deployed release and matched the final tool/page digest. That is a
fixed-call supported-host result; it does not claim that a model selected the
tools.

## Public Demo Link

<https://chris-page-gov.github.io/govuk-webmcp/>

## Public Repository Link

<https://github.com/chris-page-gov/govuk-webmcp>

## Demo Video

TODO: add the public YouTube URL after owner review, upload and signed-out
playback verification of the exact 120.326-second captioned release cut.

## Screenshot Shot List

1. The public Evidence answer landing view and verified corpus totals.
2. Human search and a selected result in Technical review.
3. A completed Evidence answer showing its source and limitations.
4. Direct supported-host confirmation of all six WebMCP tools.
5. Personal Copilot beside the candidate, honestly showing that no Site-tool
   invocation or Evidence answer update was observed.

## Submission Readiness Notes

- The live Devpost project is `1406973`, currently `Untitled` and
  `submission_pre_draft`.
- The official deadline is 3 September 2026 at 20:00 UTC (9pm BST).
- The live application and public repository exist.
- The exact release tag and GitHub prerelease remain to be created.
- The local video exists but is not yet public; owner and signed-out playback
  review remain required.
- The final Devpost submission remains a separate explicit action.

## Known Limitations

- WebMCP is experimental and host support varies.
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
| Agents or clients tested | Google Chrome with WebMCP enabled through direct Chrome DevTools calls: all six fixed calls completed with page/result digest parity. Microsoft Copilot in personal Edge MCP Workspace: page reading completed, but no Site-tool invocation or Evidence answer update was observed. Local Ollama `gpt-oss:20b`: 36 diagnostic runs with 6 tool-selection/execution passes, 30 failures and 3 runner errors. These observations support no universal-compatibility or safe-answer claim. |
| AI tools used | ChatGPT, Codex, Claude, Gemini, Microsoft Copilot and local Ollama. |
| Learning | `Significant` — owner to confirm before submission |
| Career value | `Yes` — owner to confirm before submission |
