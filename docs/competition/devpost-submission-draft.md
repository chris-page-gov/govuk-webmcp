# 19. Draft Devpost submission text

**Status: draft only — not submitted.** Competition registration and submission
remain separate actions requiring Chris Page's approval. The final candidate
release, live-host observation and manual screen-reader observation are still
pending.

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

The uncommitted candidate has passed 58 unit checks, 19 installed-Chrome browser
checks and the same 19 checks in Microsoft Edge. Those checks cover the five
fixed contracts, shared presentation parity, cancellation and rollback, all
four artefact failure paths, source-lock enforcement, bounded hostile input,
direct routes, inert source text, keyboard use, reflow, forced colours, reduced
motion and an automated axe smoke scan.

Before submission, the exact candidate must still be committed, released and
verified at its final public URL. Genuine discovery and calls from a supported
live WebMCP host, manual screen-reader observation, the final video and the
Devpost form also remain pending.

## Potential impact

The pattern is useful wherever public knowledge must be examined without making
an AI answer the authority. It can help developers, analysts, researchers and
the public find relevant official sources and understand evidence limits before
they rely on a claim.

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
