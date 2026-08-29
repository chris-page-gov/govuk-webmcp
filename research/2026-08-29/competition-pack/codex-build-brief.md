# Appendix A — one-page build brief for Codex

## Objective

Build and deploy a static, accessible, independent WebMCP application that lets people and agents search a checksum-verified bundle of reviewed GOV.UK content, dataset and API metadata and inspect authoritative links, access/licence status, assertion labels, provenance and limitations.

## Non-negotiable boundaries

- Read-only; no transactions, authentication, credentials, telemetry or personalisation.
- No runtime calls to GOV.UK or providers in the judging path.
- Same-origin static data only.
- Three tools only: search, exact record, provenance.
- Human-visible equivalent for every tool.
- Independent branding; no GOV.UK/employer logos, fonts or colours.
- Catalogue inclusion never means access authority.
- Missing licence/access/provenance fails closed.
- Model-generated text never becomes authoritative metadata.
- Preserve pre/post-challenge evidence and third-party notices.

## Implementation

1. Start from the post-start WebMCP candidate only after rights approval, or clean-room reimplement the supplied contracts.
2. Create the profile and schema.
3. Select 30–80 reviewed records.
4. Build immutable source envelopes, record digests, bundle digest and receipts.
5. Render search/results/detail/evidence through shared functions.
6. Register tools only after data validates.
7. Publish output schemas as repository contracts; do not register a non-standard `outputSchema`.
8. Add CSP, no-storage test, network allowlist and unsafe-URL validation.
9. Add unit, browser, accessibility, injection, parity and evaluation tests.
10. Deploy exact commit and generate release evidence.

## Definition of done

- clean install/build/test;
- public URL;
- tools work in ChatGPT built-in browser and Chrome 149+;
- manual UI works without WebMCP;
- every result displays source/access/licence/date/assertion/limitation;
- source links open;
- digests verify;
- negative cases fail closed;
- repository licence detected;
- signed-out validation passes;
- 2:45 demo recorded;
- compliance checklist complete.
