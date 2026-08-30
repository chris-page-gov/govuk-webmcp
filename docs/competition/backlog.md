# Appendix B — prioritised backlog

## Must

1. Entrant/ownership/outside-interest decision.
2. Baseline, rights and attribution manifests.
3. 30–80 record reviewed corpus. *(Complete: 80 records and receipts.)*
4. Minimal OKF profile and JSON Schema. *(Complete: 20 closed schemas; source-native and target OKF states remain separate.)*
5. Accessible search, results, record and provenance UI. *(Complete for the bounded tested journeys: automated Chrome and Edge cover the analytical index, Evidence Trace and comparison; a manual Safari and VoiceOver journey completed with two retained limitations and no WCAG claim.)*
6. `search_government_knowledge`. *(Complete.)*
7. `get_resource_record`. *(Complete.)*
8. `show_provenance`. *(Complete.)*
9. Shared execution functions and UI/tool parity. *(Complete for five tools through one action controller.)*
10. Authoritative human links. *(Complete.)*
11. Access/licence/assertion/observation/limitation fields. *(Complete, with eight separate Trace facets and no combined score.)*
12. Source/record/bundle digests and receipt. *(Complete and extended to Evidence Trace and federation bindings.)*
13. Fail-closed validation. *(Complete for all four artefact families and four exact source locks.)*
14. Injection, unsafe URL, stale/missing/conflict/no-match tests. *(Part complete: injection, unsafe URL, missing licence, no-match, deep-input and bounded-fragment cases pass; dedicated stale and conflicting-assertion fixtures remain.)*
15. CSP, no storage, no external runtime request. *(Complete.)*
16. ChatGPT/Chrome tests. *(Complete: instrumented WebMCP and installed Chrome and Edge contract checks passed, and `Codex In-app Browser` called all five tools on the historical tagged release. Corrected main is deployed; Chrome DevTools MCP completed all five public calls with zero console errors, while Chrome's native WebMCP panel recorded five valid `Completed` calls, the expected structured rejection for `limit: 21`, and visible-page parity for both presentation tools. Optional Microsoft WebMCP Explorer browser execution and fixed-model selection evidence remain under Should 11.)*
17. Public deployment, MIT licence and notices. *(Complete: PR #9 integrated tagged commit `9235ee5db4df637bdb2a12e87449e871614afe68`, with exact-main run `33286750188` and Pages run `33286771963`; PR #12 later integrated corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, deployed by Pages run `33323152751`. The historical tag remains unchanged.)*
18. Demo, transcript, submission copy, final tag and hashes. *(Part complete: storyboard, guarded build tooling, five genuine live interaction clips with exact release/action/duration/hash binding and agent review, supported-host receipt visualisation, the manual Safari and VoiceOver record and its visibly labelled non-continuous screenshot sequence, submission copy, competition registration, final read-only compliance review, release hashes and tag `v0.2.0-rc.1` are complete. A 142.920-second local review video with H.264 video, AAC synthetic narration, embedded English captions, separate en-GB captions, transcript and build receipt is also complete. Full technical decode, 4,284-frame and 38-caption-cue checks passed with one retained non-fatal subtitle metadata warning, but no audible content-parity or owner approval is claimed. The refreshed Devpost project remains `Untitled`, blank and `submission_pre_draft`. Owner synthetic-voice, privacy, branding and final-playback review, public upload and Devpost submission remain open.)*

## Should

1. `compare_resources` after core freeze. *(Superseded for this release by claim-foundation comparison. Resource ranking/comparison remains deliberately absent.)*
2. Filter facets for publisher/type/access.
3. Link-health report. *(Refreshed on 30 August 2026: 161 of 161 unique admitted official URLs responded to the bounded check.)*
4. Stale-data badge/threshold.
5. Downloadable record and receipt.
6. Automated SBOM/attestation. *(Local macOS ARM64 sanitised CycloneDX SBOM
   complete; release-platform SBOM and signed attestation pending.)*
7. Accessibility statement and manual test log. *(Statement, Chrome/Edge and headed-browser evidence complete; a manual Safari and VoiceOver observation completed with two retained limitations. VoiceOver audio was not captured and no WCAG conformance is claimed.)*
8. Baseline-to-submission visual compare. *(Part complete: separate retained public search captures show `v0.1.0-rc.1` and deployed `v0.2.0-rc.1`; a bound side-by-side comparison artefact remains.)*
9. Optional small set of related-record links.
10. Public status/known-issues page.
11. Independent WebMCP host and evaluator matrix. *(Part complete:
    pinned Chrome DevTools MCP and `webmcp-evals` harnesses, context-minimisation
    and no-call fixtures, isolated model-free receipts, exact public-commit
    Chrome DevTools MCP execution and native Chrome-panel evidence exist.
    Explorer browser and fixed-model evidence remain. Explorer
    0.1.0 was built twice idempotently from its exact pinned commit in isolated
    `.tools/webmcp-explorer-build/`; static triage dated 30 August 2026 found the
    npm advisory paths were not reachable in that exact production build path,
    but the privileged-extension operating risks in `SECURITY.md` remain.)*
12. Public-service cost-boundary measurement. *(Planned as evaluation E-34:
    compare a declared server-side AI baseline with the page-tool architecture
    while holding source quality and user outcomes comparable; measure
    government-origin requests, bytes, compute and support effort alongside
    citizen-provider whole-system cost. The static prototype does not itself
    prove a public saving.)*

## Could

1. Graph view of reviewed relationships. *(Complete as the accessible Evidence Trace plus relationship table.)*
2. Timeline of source observations.
3. Map for geospatial examples.
4. Multilingual labels.
5. Serverless refresh preview outside judging path.
6. Persistent MCP hand-off demo.
7. User study dashboard.
8. Additional publishers/corpora. *(Complete as a bounded 10-entry descriptor only: two are searchable and eight contribute no payload.)*
9. Declarative WebMCP experiment in a future release; the current imperative
   path is observed only in the bounded Codex in-app, Chrome DevTools MCP and
   native Chrome-panel environments recorded in the evidence.
10. Signed publisher attestations in a future profile.
