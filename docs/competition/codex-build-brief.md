# Appendix A — published `v0.2.0-rc.1` brief for Codex

## Objective

Maintain and verify the published, accessible, static and independent WebMCP
application that lets people and agents see the evidence before an answer. The
primary journey starts with an analytical index, then exposes one Evidence
Trace, separate trust facets, score-free comparison, the same result through
WebMCP and the bounded evidence estate.

## Release facts to preserve

- 80 reviewed records and 80 packaged evidence receipts.
- Four exact authored source locks: 69 GOV.UK records, 11 curated government
  data and API records, 1 answer pack and 10 corpus-admission decisions.
- One digest-bound Evidence Trace.
- Ten corpus admissions: 2 searchable and 8 not searchable.
- Eight separate facets: authority, assertion status, verification, freshness,
  integrity, access, rights and coverage. Never add a combined trust score.
- Five fixed imperative tools: 3 read-only query tools and 2 reversible
  in-memory presentation tools with `readOnlyHint: false`.
- One shared action controller for human controls and WebMCP callbacks.
- Catalogue, receipts, Evidence Trace and federation manifest all validate
  before any tool registers.

## Non-negotiable boundaries

- The human interface must remain complete when WebMCP is unavailable.
- No runtime call to GOV.UK, a data provider or a model provider.
- No transaction, authentication, credential, telemetry, personalisation or
  browser-storage write.
- The two presentation tools may change only reversible in-memory selection and
  comparison state.
- Catalogue inclusion never grants access or permission to reuse.
- Missing, stale or conflicting access, rights and provenance stay explicit.
- `sourceOkfCore` records the producer declaration separately from the target
  OKF core 0.2 mapping.
- A corpus descriptor or crosswalk does not admit, copy or make its payload
  searchable.
- Model-generated text never becomes canonical metadata.
- Independent branding only; do not use GOV.UK, employer or sponsor branding.
- Do not claim a persistent or durable MCP gateway, provider execution,
  government service operation, access decision or per-call durable receipt.

## Implemented shape

1. Validate the four authored locks before generation. Bind each expected ID to
   its exact path, item count, SHA-256 and regular non-symlink file.
2. Deterministically build the 80-record catalogue, 80 receipts, one Evidence
   Trace and 10-entry federation manifest.
3. Validate JSON Schema, raw checksums, internal digests and cross-artefact
   bindings.
4. Load four same-origin artefact families and fail closed before registration
   if any family is missing or invalid.
5. Present the analytical index first; keep the visual trace a progressive
   explanation of the same data.
6. Render each facet separately and compare two to four claims without ranking
   or scoring them.
7. Route human and WebMCP actions through `KnowledgeActionController`.
8. Register `search_government_knowledge`, `get_resource_record` and
   `show_provenance` as read-only query tools.
9. Register `explore_answer_foundations` and
   `compare_evidence_foundations` with `readOnlyHint: false` and explicit
   transient-presentation boundaries.
10. Publish output schemas as repository contracts; do not register a
    non-standard `outputSchema` property.

## Security checks to retain

- closed schemas plus executable input validation;
- a cheap common root-input budget before action dispatch or diagnostic
  hashing;
- bounded queries, identifiers, arrays, result counts and hash routes;
- credential-free HTTPS links on admitted official hosts only;
- inert rendering and `untrustedContentHint: true` for source-derived text;
- exact source-lock ID/path/count/digest checks with no symbolic links or file
  identity changes;
- all-or-none registration, cancellation and registration timeout behaviour;
  and
- no storage and no unexpected external request in browser checks.

## Observed evidence

- `npm run test:unit`: 58 checks passed.
- Installed Chrome: 19 browser checks passed.
- Microsoft Edge: the same 19 browser checks passed.
- The browser suite includes keyboard, 320-pixel reflow, forced colours,
  reduced motion and an axe smoke scan. These do not constitute a manual
  screen-reader observation or a WCAG conformance claim.
- PR #9 integrated the release into protected `main` at
  `9235ee5db4df637bdb2a12e87449e871614afe68`.
- Exact-main validation run `33286750188` passed 58 unit and 19 Chromium
  browser checks.
- Pages run `33286771963` rebuilt, retested and deployed that exact commit;
  deployment metadata and live artefact bytes matched it.
- The exact release commit is tagged `v0.2.0-rc.1`.

## Published definition of done

The sequenced product build, protected-branch integration and public deployment
are complete. Preserve PR #9, exact-main run `33286750188`, Pages run
`33286771963`, release commit
`9235ee5db4df637bdb2a12e87449e871614afe68` as the immutable product
identity. Preserve exact annotated tag object
`0a41f7a6f0123c3aba9742bbf6167b8a8ceb2b82` as the recorded unsigned release
pointer; GitHub does not enforce immutable releases or signed tags here.

## Open evidence and submission gates

- Observe all five tools and representative calls natively in a supported
  WebMCP host.
- Complete the manual screen-reader observation.
- Produce a release-platform SBOM or signed release attestation; the existing
  dated SBOM remains a local macOS ARM64 dependency view.
- Record the sub-three-minute demonstration and transcript.
- Complete the compliance checklist and obtain separate approval before any
  competition registration or Devpost submission.
