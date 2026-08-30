# 19. Draft Devpost submission text

**Status: registered; draft only — not submitted.** Devpost project `1406973`
is an unpublished `submission_pre_draft` with no submission timestamp.
Submission remains a separate action requiring Chris Page's approval. The
corrected protected-main product is public and five-tool execution is observed
both in Chrome's native WebMCP panel and through Chrome DevTools MCP. The manual
Safari and VoiceOver journey and a local review video are complete with retained
limitations; the video has not been approved for publication, uploaded or
submitted.

Do not use this draft as final submission copy until Chris Page has completed
the video publication review, the approved cut has passed public-player checks
and every live Devpost field and human attestation has been refreshed.

## Project title

**Evidence Trace: show your GOV.UK working**

40 characters; Devpost limit: 60.

## One-line description

See the evidence before the answer: an accessible WebMCP prototype tracing GOV.UK claims to authoritative sources, checks and limitations, without hiding uncertainty behind a score.

181 characters; Devpost limit: 200.

## Live Devpost form mapping

Authenticated read-only Devpost calls at `2026-08-30T17:57:48Z` confirmed
that project `1406973` is still `Untitled` and `submission_pre_draft`, with no
tagline, description, video URL, publication timestamp or submission timestamp.
The following is preparation copy only; no field has been changed.

| Live field | Prepared value or owner action |
| --- | --- |
| Submitter Type (`28249`) | **Owner decision required:** Chris Page must select the truthful individual, team or organisation route. |
| Country of residence (`28250`) | **Owner attestation required:** select the truthful country value in the live form. |
| Organisation name (`28251`, conditional) | Complete only if the organisation route is selected. |
| App Status (`28252`) | **Owner decision required:** choose `New` or `Existing` consistently with the disclosed pre-existing ideas, data and related repositories. |
| Existing-project explanation (`28253`, conditional) | If `Existing` is selected, explain that earlier OKF and `gis-ai-go` work supplied research and design lineage, while this repository's dated competition-period commits implement and extend the five-tool WebMCP product, evidence interface, tests and deployment. |
| Live URL (`28254`) | `https://chris-page-gov.github.io/govuk-webmcp/` |
| Testing instructions (`28255`, optional) | Open the live URL in Chrome 149 or later with WebMCP testing enabled. In Application → WebMCP, confirm five tools, run `search_government_knowledge` with `{"query":"register a birth","limit":3}`, then run the evidence exploration and comparison tools. No account or credential is required. |
| Public repository (`28256`) | `https://github.com/chris-page-gov/govuk-webmcp` |
| Tested agents or clients (`28257`) | Chrome 152's native WebMCP panel completed all five tools plus one bounded invalid-input check on the corrected public deployment. Chrome DevTools MCP 1.8.0 independently completed the same five deterministic calls. Codex In-app Browser also completed five calls on the earlier release. No model-backed selection result, ChatGPT desktop result or Microsoft WebMCP Explorer run is claimed. |
| AI tools used (`28258`) | **Draft from Chris Page's assurance:** ChatGPT, Codex, Claude and Gemini were used through Chris's personal subscriptions for research, design, implementation and review. Chris must confirm the final wording. |
| Learning level (`28259`) | **Owner assessment required:** select `None`, `Moderate` or `Significant`. |
| Career value (`28260`) | **Owner assessment required:** select `Yes` or `No`. |
| Public video URL | **Blocking:** add only after Chris approves the cut and signed-out public YouTube playback passes. |

The project title and one-line description above are candidates for Chris to
select and edit, not final form values. The latest organiser guidance asks the
entrant to take personal responsibility for the project name and final copy.

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

The corrected product is public at
<https://chris-page-gov.github.io/govuk-webmcp/>. [Pull request
12](https://github.com/chris-page-gov/govuk-webmcp/pull/12) integrated product
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`. Exact-main run
`33323068982` and Pages run `33323152751` passed and all 20 public files matched
Pages artefact `9735478602` byte for byte. The earlier
[v0.2.0-rc.1 pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1)
remains unchanged and checksum-bound at commit
`9235ee5db4df637bdb2a12e87449e871614afe68`
as historical release and demonstration-video evidence.

Five silent page-only interaction clips now show the analytical index, Evidence
Trace, separate facets, comparison and bounded evidence estate on the
historical `v0.2.0-rc.1` public deployment. Their required actions, durations
and SHA-256 values are bound
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
require owner review. A complete technical decode counted all 4,284 video
frames and matched all 38 embedded caption cues to the tracked captions; one
non-fatal subtitle metadata warning is retained. This technical result is not
owner publication approval. No video has been uploaded or submitted.

The checks cover the five fixed contracts, shared presentation parity,
cancellation and rollback, all four artefact failure paths, source-lock
enforcement, bounded hostile input, direct routes, inert source text, keyboard
use, reflow, forced colours, reduced motion and an automated axe smoke scan.
On 30 August 2026, `Codex In-app Browser` discovered and successfully called all
five tools on the earlier exact public release. Its final comparison call
produced the same canonical and displayed result SHA-256. The corrected public
deployment was then tested in a rules-named environment: Chrome 152.0.7977.64's
native Application → WebMCP panel listed all five tools, completed all five
valid calls and displayed the structured `invalid_search_request` result for
`limit: 21`. The two presentation tools updated the visible deterministic page,
including an 11-row facet comparison with canonical/display digest parity.

Chrome DevTools MCP 1.8.0 separately discovered and completed all five tools on
the corrected public bytes, rejected synthetic `personalContext`, bound the
public deployment metadata and recorded zero console errors. Neither
native-panel execution nor Chrome DevTools MCP selected or contacted a model.
Microsoft WebMCP Explorer was built twice idempotently in an isolated
directory from its exact pinned commit, with a clean source checkout and
verified output allow-list, but was not loaded. Static triage dated 30 August
2026 found its npm advisory paths were not reachable in that exact production
build path; the privileged-extension operating risks remain. Explorer browser
execution and fixed-model selection evaluation remain unrun. A release-platform
SBOM or attestation and Explorer/model-selection evidence are optional assurance
work, not current official submission requirements. Owner approval of the local
video, public upload, completion of the Devpost form and authorised submission
remain the submission-critical work.

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
