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
- On 30 August 2026, `Codex In-app Browser` discovered and successfully called
  all five tools on the historical `v0.2.0-rc.1` public deployment. The final
  comparison's canonical and displayed result digests matched. No other host or
  revision support is inferred.
- On the same date, a manual Safari 26.5.2 and VoiceOver 10 journey completed
  without WebMCP. Its separate evidence record retains two limitations: a
  heading-rotor selection was not retained and the automatic spoken wording of
  the live search status was not proven. VoiceOver speech audio was not
  captured, and no WCAG conformance is inferred.
- The guarded pipeline produced a 142.920-second local review MP4, separate
  en-GB captions, a transcript and a machine build receipt. It has not been
  approved for publication, uploaded or submitted.
- PR #12 integrated the execution-options correction and assurance stack at
  protected-main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`.
  Exact-main run `33323068982` and Pages run `33323152751` passed; all 20 live
  files matched Pages artefact `9735478602` byte for byte.
- In disposable Chrome 152.0.7977.64, the corrected public page's native WebMCP
  panel listed the exact five tools, completed all five valid calls and showed
  a structured `invalid_search_request` result for `limit: 21`. Chrome DevTools
  MCP 1.8.0 independently completed all five public calls, rejected synthetic
  `personalContext` and recorded zero console errors. Neither path used a model.

## Host-compatibility and independent-assurance follow-up

- The research verifier now uses a version-pinned `jsonschema` 4.26.0
  environment and passes all four checks locally. Setup installs binary
  distributions without dependency resolution and runs `pip check`; the pins
  have no distribution hashes and a reused `.venv` can retain unrelated
  packages, so the environment is not clean or fully reproducible.
- An earlier Chrome DevTools MCP 1.8.0 run discovered all five tools on
  `v0.2.0-rc.1` but exposed a callback defect when it omitted the
  execution-options object.
- The integrated correction accepts omitted options, preserves cancellation
  when a signal is supplied, and passed 95 unit, 20 Chrome and 20 Edge tests on
  the protected change.
- The corrected build also passes six model-free `webmcp-evals` 0.0.4
  calls, each with `ok: true` and the expected result-schema envelope, and all
  five Chrome DevTools MCP calls in isolated Chrome 152.0.7977.64. The final
  hardened DevTools run at 15:53 BST checked closed schemas and annotations,
  rejected synthetic `personalContext`, recorded zero console errors and
  disabled update checks. Raw smoke rows were deleted after semantic
  validation; the smoke receipt retains counts and a results digest, while only
  the DevTools receipt retains full outputs.
- The prepared model-backed browser runner rejects typed upstream console errors
  and `pageerror` events; an accepted receipt records a zero count and
  `browserConsoleErrorsAccepted: false`. No model-backed run has occurred.
- The CI and Pages definitions install Node
  dependencies with `--ignore-scripts`; Pages also installs the version-pinned
  Python requirements and runs semantic WebMCP smoke before deployment. These
  definitions ran successfully for the protected integration and deployment.
- Microsoft WebMCP Explorer 0.1.0 was built twice idempotently in isolated
  `.tools/webmcp-explorer-build/` from its exact pinned commit, leaving the
  source checkout clean and passing the clean-output allow-list. The source-
  tree, package-lock and unpacked-extension file-manifest SHA-256 values (the
  latter over sorted per-file hashes and paths) are respectively
  `b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
  `76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
  and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
  Static triage dated 30 August 2026 found the npm advisory paths were not
  reachable in that exact production build path, but the privileged extension
  risks documented in `SECURITY.md` remain. Explorer browser execution and
  fixed-model tool-selection evaluation have not been run.

## Published definition of done

The sequenced product build, protected-branch integration and corrected public
deployment are complete. Preserve PR #12, exact-main run `33323068982`, Pages
run `33323152751` and corrected product commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f` as the current deployment
identity. Preserve the earlier `v0.2.0-rc.1` chronology and exact annotated tag
object `0a41f7a6f0123c3aba9742bbf6167b8a8ceb2b82` as the recorded unsigned
release pointer; GitHub does not enforce immutable releases or signed tags here.

## Open submission gates

- Complete Chris Page's synthetic-voice publication, privacy, branding,
  caption, transcript and full audible playback review of the sub-three-minute
  local demonstration; publish only after that review and separate authority.
- Complete the compliance checklist and obtain separate approval before
  completing or submitting the existing Devpost pre-draft.

## Optional assurance

- Produce a release-platform SBOM or signed release attestation; the existing
  dated SBOM remains a local macOS ARM64 dependency view. This is not a current
  official submission prerequisite.
