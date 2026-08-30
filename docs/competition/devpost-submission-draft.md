# 19. Draft Devpost submission text

**Status: registered; draft only — not submitted.** Devpost project `1406973`
is an unpublished `submission_pre_draft` with no submission timestamp.
Submission remains a separate action requiring Chris Page's approval. The
`v0.2.0-rc.1` product release is public and supported-host calls are observed in
`Codex In-app Browser`. The manual Safari and VoiceOver journey and a local
review video are complete with retained limitations; the video has not been
approved for publication, uploaded or submitted.

Do not use this draft as final submission copy until the unreleased
execution-options correction has passed protected integration, public deployment
and repeat host capture.

## Project title

**Evidence Trace: show your GOV.UK working**

40 characters; Devpost limit: 60.

## One-line description

See the evidence before the answer: an accessible WebMCP prototype tracing GOV.UK claims to authoritative sources, checks and limitations, without hiding uncertainty behind a score.

181 characters; Devpost limit: 200.

## The problem

Government information is widely published but fragmented across GOV.UK pages,
dataset catalogues, API catalogues and publisher documentation. A plausible
answer can hide important differences: who made a claim, how it was transformed,
when its source was observed, whether its bytes still match, whether access and
reuse are established, and what the selected evidence does not cover.

## What we built

The prototype packages 80 reviewed GOV.UK content, public data and API metadata
records with 80 digest-bound evidence receipts. Four exact authored source locks
feed deterministic generators: the 69-record GOV.UK collection, 11 curated
government data and API records, 1 answer pack and 10 corpus-admission
decisions.

The page opens on an analytical index for one worked Evidence Trace. A person
can follow the same evidence as a labelled graph, inspect one foundation and
compare claims. Eight trust facets remain separate: authority, assertion status,
verification, freshness, integrity, access, rights and coverage. The prototype
does not turn them into a combined score.

The evidence-estate view describes 10 corpus admissions. Only 2 reviewed
deep-evidence collections, together accounting for all 80 records, are
searchable. The other 8 remain described-only, conditional, quarantined or
contract-only. Producer `sourceOkfCore` declarations remain separate from the
target OKF core 0.2 mapping. A descriptor does not admit or redistribute a
producer payload.

## Why WebMCP is a strong fit

A compatible agent discovers five explicit tools on the same inspectable page:

- `search_government_knowledge`;
- `get_resource_record`;
- `show_provenance`;
- `explore_answer_foundations`; and
- `compare_evidence_foundations`.

The first three are read-only query tools. The last two have
`readOnlyHint: false` because they can update the visible trace selection or
comparison. That effect is reversible and held only in memory: it does not
change the catalogue, browser storage, network or external state.

WebMCP is material because the agent receives exact record, claim, relationship,
facet and limitation fields instead of reconstructing them from presentation
markup. Human controls and tool callbacks pass through one shared action
controller, so the structured result and visible result use the same
deterministic operation.

The broader pattern is deliberately not a government-hosted general-purpose
assistant. A public body can publish small, inspectable tools over authoritative
evidence; a citizen-selected agent can use context it already holds to decide
which tool to call and send only the bounded fields that action needs. This can
reduce duplicated public-sector AI infrastructure and unnecessary context
collection, but no cost saving or accuracy improvement has yet been measured.
If the citizen selects a remote model provider, prompts, tool metadata,
arguments and results may still leave the device. The page does not control that
provider boundary.

## Trust and safety design

WebMCP does not make a source trustworthy. The prototype contributes an
inspectable evidence chain:

- authoritative human links and explicit limitations;
- closed, bounded schemas repeated in executable validation;
- four checksummed runtime artefact validations before any tool registers;
- fail-closed record, receipt, graph, digest and corpus-admission bindings;
- bounded root inputs and direct-link hashes;
- exact regular-file source locks that reject path swaps and symbolic links;
- inert rendering and `untrustedContentHint: true` for source-derived text; and
- a complete manual journey when WebMCP is unavailable.

The application is a static TypeScript site. It makes no runtime call to GOV.UK,
a data provider or a model provider and stores no query, account or credential.
Packaged receipts are static build evidence; a tool call does not create a
durable receipt.

## What people and agents can do together

A person can start with the answer's analytical index, inspect a claim's
Evidence Trace, compare its separate facets and open the authoritative source.
An agent can select the same exact answer and claims through WebMCP and return
the same structured evidence. Both see missing or conflicting rights, uncertain
access, observation dates, coverage limits and the absence of a combined trust
score.

The separate catalogue route also lets a person or agent search the 80 admitted
records, inspect an exact record and show its packaged provenance. Catalogue
inclusion is never presented as current access, permission to reuse or official
approval.

## Current evidence and remaining work

The `v0.2.0-rc.1` product release is public at
<https://chris-page-gov.github.io/govuk-webmcp/> and retained as a
[GitHub pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1).
[Pull request 9](https://github.com/chris-page-gov/govuk-webmcp/pull/9)
integrated product commit `9235ee5db4df637bdb2a12e87449e871614afe68`.
Exact-main run `33286750188` passed 58 unit checks and 19 Chromium browser
checks; Pages run `33286771963` rebuilt and deployed the same commit. All 20
public files matched the Pages artefact byte for byte, and a signed-out human
journey completed without a console error or warning. The same source tree also
passed 19 installed-Microsoft-Edge checks before publication.

Five silent page-only interaction clips now show the analytical index, Evidence
Trace, separate facets, comparison and bounded evidence estate on the exact
public release. Their required actions, durations and SHA-256 values are bound
in one consolidated receipt and passed agent privacy and branding review; human
publication review remains pending. The supported-host video scene is a labelled
receipt visualisation, not a host recording. A manual Safari 26.5.2 and
VoiceOver 10 journey completed without WebMCP and is retained as a visibly
labelled, hash-bound non-continuous Caption Panel sequence. A heading-rotor
selection was not retained, the automatic spoken wording of the live search
status was not proven, and no VoiceOver speech audio or WCAG conformance is
claimed. The Caption Panel and VoiceOver were turned off afterwards.

The guarded pipeline produced a 142.920-second local review MP4 with H.264
video, AAC synthetic narration, embedded English captions, separate en-GB
captions, a transcript and a machine build receipt. The local synthetic
`Daniel` voice publication basis, privacy, branding and final playback still
require owner review. No video has been uploaded or submitted.

The checks cover the five fixed contracts, shared presentation parity,
cancellation and rollback, all four artefact failure paths, source-lock
enforcement, bounded hostile input, direct routes, inert source text, keyboard
use, reflow, forced colours, reduced motion and an automated axe smoke scan.
On 30 August 2026, `Codex In-app Browser` discovered and successfully called all
five tools on the exact public release. Its final comparison call produced the
same canonical and displayed result SHA-256. This observation is specific to
that host and time; it does not establish support in ChatGPT desktop, Chrome or
another host. A release-platform SBOM or attestation, owner approval of the
local video, public upload, completion of the Devpost form and authorised
submission remain pending.

A later Chrome DevTools MCP 1.8.0 run discovered all five tools on those public
bytes but exposed a callback defect when the host omitted execution options.
The corrected local candidate subsequently passed all five Chrome DevTools MCP
calls, six of six model-free `webmcp-evals` calls with `ok: true` in their
expected result-schema envelopes, 95 unit tests and 20 tests in each of Chrome
and Edge. The final hardened DevTools run used Chrome 152.0.7977.64, rejected
synthetic `personalContext` and recorded zero console errors. It has not been
committed, deployed or admitted as public submission evidence. Microsoft WebMCP
Explorer was built twice idempotently in an isolated
directory from its exact pinned commit, with a clean source checkout and
verified output allow-list, but was not loaded. Static triage dated 30 August
2026 found its npm advisory paths were not reachable in that exact production
build path; the privileged-extension operating risks remain. Explorer browser
execution and fixed-model selection evaluation remain unrun.

## Potential impact

The pattern is useful wherever public knowledge must be examined without making
an AI answer the authority. It can help developers, analysts, researchers and
the public find relevant official sources and understand evidence limits before
they rely on a claim. It also offers a testable alternative to every public body
hosting its own general-purpose assistant: publish bounded evidence tools, let a
citizen-selected agent personalise the journey, and measure what data and public
infrastructure that avoids before claiming a saving.

## Creativity and ambition

The prototype treats the webpage as a shared evidence plane for people and
agents. It puts an analytical index before the visual trace, makes claim-level
checks and limitations interactive, and lets WebMCP reproduce the same bounded
selection. The result is evidence before answer, with uncertainty kept visible
instead of compressed into a confidence badge.

## Boundary

This is an independent experimental prototype. It is not a GOV.UK or UK
government service and is not endorsed by any public body. It does not provide
access to restricted APIs, call providers, authenticate users, operate public
services or make official decisions. It is not a durable MCP gateway and makes
no claim of comprehensive or current coverage. Follow the linked publisher page
for authoritative information.
