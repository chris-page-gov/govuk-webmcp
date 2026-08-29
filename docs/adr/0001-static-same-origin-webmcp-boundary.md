# ADR-0001: Static same-origin WebMCP boundary

- **Status:** accepted for the first local vertical slice
- **Date:** 29 August 2026

## Context

The prototype must let a person and a page-scoped agent search the same reviewed
metadata without introducing runtime provider calls, credentials or an implied
official service. The preserved research and source locks pre-date this build.
Implementation after baseline commit `4c85db7` is competition-period work and
does not alter those source repositories.

## Decision

- Identify the application as an independent experimental prototype.
- Serve a static catalogue and raw-byte checksum from the same origin.
- Make no runtime call to GOV.UK, another provider or an official API.
- Keep the intended boundary at three read-only tools: search, exact record and
  provenance. Implement only `search_government_knowledge` in this slice.
- Use one deterministic search function for the accessible page and tool paths.
- Display authoritative GOV.UK links, assertion labels and limitations in human
  and structured results.
- Treat imported strings as untrusted data and render them with text nodes.
- Reject unknown and oversized input. Recompute record and bundle digests and
  register no tool when checksum, URL or structural validation fails.
- Treat missing access, licence or provenance evidence as not established. Do
  not infer authority from catalogue inclusion.

## Consequences

The human search works when WebMCP is absent. A verified fixture is required
before search is enabled or a tool is registered. The first slice cannot claim
comprehensive coverage, durable receipts, provider access, official endorsement
or production readiness. Corpus expansion and the remaining two tools require
later backlog slices and governance decisions.
