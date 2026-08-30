# Implementation plan and backlog tracking

This is the lockstep implementation map for
`docs/competition/backlog.md`. It records the published `v0.2.0-rc.1`
implementation and records the later supported-host observation separately
from the remaining accessibility, attestation, video and competition-submission
evidence.

## Sequenced 1–10 plan

| Step | Scope | Backlog mapping | Status |
| --- | --- | --- | --- |
| 1 | Preserve the baseline, ownership decisions and release gates. | Must 1–2, 17–18 | Complete |
| 2 | Admit rights-reviewed sources with exact locks and bounded claims. | Must 2–4, 10–12; Could 8 | Complete |
| 3 | Build shared fail-closed contracts, integrity checks and the action runtime. | Must 4, 9, 12–15 | Complete |
| 4 | Make the analytical index the primary evidence-before-answer view. | Must 5, 9–11; Could 1 | Complete |
| 5 | Generate one digest-bound Evidence Trace fixture. | Must 10–12; Could 1–2 | Complete |
| 6 | Add accessible exploration, comparison, direct links, history and focus restoration. | Must 5, 9–11, 16; Should 7, 9 | Complete |
| 7 | Register five bounded WebMCP tools with truthful effect annotations. | Must 6–9, 13–16 | Complete |
| 8 | Publish the 10-entry corpus admission manifest and OKF mapping boundary. | Must 2–4; Could 8 | Complete |
| 9 | Run schema, digest, source-lock, unit, browser, accessibility, Edge and security assurance. | Must 13–17; Should 3, 6–7 | Complete |
| 10 | Update lockstep documentation/evidence, integrate by PR and verify the exact deployment. | Must 17–18; Should 8, 10 | Complete |

## Verification checkpoints

### Contract and data checkpoint

- Four exact source-lock ID/path/count pairs are required.
- The deterministic build produces 80 records, 80 receipts, one Evidence Trace
  and 10 corpus admissions.
- Two admissions are searchable and account for exactly 80 records; eight
  admissions contribute no searchable payload.
- Twenty closed JSON Schemas validate authored and generated artefacts.
- Raw-byte checksum, internal digest, graph and binding failures stop startup
  and prevent all tool registration.

### Interaction checkpoint

- Human search, record, provenance, analytical-index, Trace and comparison
  journeys use the shared deterministic action layer.
- Search terms remain out of URLs and storage. Bounded answer, claim, record and
  comparison selections can be restored from URL fragments.
- The three catalogue query tools are read-only. The two exploration tools have
  only a reversible in-memory page-presentation effect and declare
  `readOnlyHint: false`.
- Every result retains authoritative links, assertion labels and limitations.
  The Trace exposes eight facets and no combined trust score.
- On 30 August 2026, `Codex In-app Browser` discovered and successfully called
  all five tools against the exact public release. The final comparison's
  canonical and displayed result digests matched. This does not establish
  support in another host.

### Assurance checkpoint

- `npm run test:unit`: 58 passed.
- Installed Chrome and Edge: 19 browser tests passed in each.
- The expanded axe WCAG 2.2 smoke test had no serious or critical violations;
  keyboard, history/focus, 320px, forced-colour and reduced-motion checks
  passed.
- The formal diff scan's two low findings were reproduced and fixed; an
  independent post-patch review found no bypass.
- A later immutable 44-item candidate snapshot scan completed with no
  reportable finding. Its warning about the final post-snapshot delta is
  retained alongside a separate bounded review and complete test rerun.
- Independent contract review also confirmed executable/schema parity for
  complete records and receipts, IDs, URLs, timestamps, filters, federation
  decisions and Evidence Trace relationships.
- The link audit recorded 161 of 161 unique admitted official URLs reachable by
  its bounded method; the dependency audit reported zero known vulnerabilities.

PR #9 integrated the candidate into protected `main` at
`9235ee5db4df637bdb2a12e87449e871614afe68`. Exact-main validation run
`33286750188` passed, Pages run `33286771963` rebuilt, tested and deployed that
same commit, and the public site metadata and live artefact bytes were verified.
The exact commit is tagged `v0.2.0-rc.1`.

## Backlog status

| Backlog range | Status and evidence |
| --- | --- |
| Must 1–2 | Complete for this repository: recorded ownership assurance, preserved baseline, item-level rights and four source locks. |
| Must 3 | Complete: 69 locked GOV.UK records plus 11 reviewed companion records. |
| Must 4 | Complete: minimal profile, 20 schemas, authored/generated validators and deterministic builders. |
| Must 5 | Complete in automated Chrome and Edge: search, record, provenance, analytical index, Trace and comparison. Manual screen-reader observation remains. |
| Must 6–8 | Complete in the published release: five tools include the original three query tools and two evidence-presentation tools. |
| Must 9 | Complete: one action controller, deterministic page/tool output and display-digest parity. |
| Must 10–11 | Complete: authoritative human links and visible access, rights, assertion, observation and limitation fields. |
| Must 12 | Complete: source, record, bundle, receipt, Trace, federation and raw-file digests/checksums. |
| Must 13 | Complete: all four artefact families, four exact source locks and the 80-record release boundary fail closed. |
| Must 14 | Part complete: tamper, input, URL, inert-text, missing-licence and no-match tests pass; dedicated stale and conflicting-assertion fixtures remain. |
| Must 15 | Complete: CSP, no storage and no external runtime provider request are enforced and tested. |
| Must 16 | Complete for the bounded supported-host gate: instrumented lifecycle tests and installed Chrome and Edge passed, then `Codex In-app Browser` discovered and successfully called all five tools on the exact public release. This does not establish native support in ChatGPT desktop, Chrome or another host. |
| Must 17 | Complete for `v0.2.0-rc.1`: MIT licence and notices are published; PR #9, exact-main validation and exact-commit Pages deployment are recorded. |
| Must 18 | Part complete: submission copy, storyboard, five genuine interaction clips with a consolidated release/action/duration/hash receipt, the labelled supported-host receipt visualisation, a fail-closed and visibly labelled VoiceOver screenshot-sequence fallback, release hashes, competition registration and the `v0.2.0-rc.1` tag are complete. Human clip review, genuine VoiceOver media/evidence, final video/captions/transcript, final compliance review and authorised submission remain open; Devpost project `1406973` is still an unpublished pre-submission draft. |

## Implemented Should and Could work

- Should 2: bounded publisher, resource-type and access filters.
- Should 3: a dated 161-URL official-link health report.
- Should 6: local macOS ARM64 sanitised CycloneDX SBOM; release-platform SBOM
  evidence and a signed release attestation remain future work.
- Should 7: accessibility statement plus automated/manual-browser evidence; a
  screen-reader observation remains.
- Should 8: part complete through retained separate `v0.1.0-rc.1` and
  `v0.2.0-rc.1` public search captures; a bound side-by-side comparison
  artefact remains.
- Should 9: bounded related-record links.
- Could 1: an accessible Evidence Trace graph and relationship table.
- Could 8: a bounded 10-entry estate descriptor. Only two collections are
  searchable; this is not payload federation.

`compare_resources` is not implemented. The completed comparison contrasts
the foundations of two to four claims in one answer and deliberately does not
rank resources. Timeline, map, multilingual, refresh, persistent MCP, user-study
and signed-publisher-attestation items remain future work.

## Published release and remaining gates

The product-integration and publication sequence is complete: PR #9 merged to
protected `main`, exact-main run `33286750188` passed, Pages run `33286771963`
deployed commit `9235ee5db4df637bdb2a12e87449e871614afe68`, live metadata and artefact bytes
matched that release, and the commit is tagged `v0.2.0-rc.1`.

Supported-host discovery and calls are now observed for the exact public release
in `Codex In-app Browser`. Five genuine public-page interaction clips and their
release/action/duration/hash receipt are complete, and the guarded pipeline
rejects preview substitutions, unrelated VoiceOver media and receipt drift. The
current `npm run demo:preflight` stops only for the missing genuine VoiceOver
clip, manual journey JSON and media/time binding. No final MP4, captions,
transcript or build receipt exists. The following evidence or owner-governed
actions remain open:

1. Complete a manual screen-reader observation. Because continuous macOS
   capture is unavailable, preserve and review the nine actual Safari and
   VoiceOver frames, then use the guarded screenshot-sequence builder; its
   declared metadata is not a substitute for the manual observation.
2. Produce a release-platform SBOM or signed release attestation.
3. Complete the prepared guarded video build with the genuine manual
   VoiceOver clip, then review the captions, transcript and local cut before
   any public upload.
4. Complete the final compliance review, then complete and submit the existing
   Devpost pre-draft only with separate owner approval. A read-only working
   review now maps every requirement and contradiction; it must remain non-final
   until the genuine VoiceOver evidence and local video build exist.
