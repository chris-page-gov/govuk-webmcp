# Appendix B — prioritised backlog

## Must

1. Entrant/ownership/outside-interest decision.
2. Baseline, rights and attribution manifests.
3. 30–80 record reviewed corpus. *(Complete: 80 records and receipts.)*
4. Minimal OKF profile and JSON Schema. *(Complete: 20 closed schemas; source-native and target OKF states remain separate.)*
5. Accessible search, results, record and provenance UI. *(Complete in automated Chrome and Edge, now including the analytical index, Evidence Trace and comparison; manual screen-reader observation remains.)*
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
16. ChatGPT/Chrome tests. *(Instrumented WebMCP, Chrome and Edge are complete; an actual supported ChatGPT host call remains pending.)*
17. Public deployment, MIT licence and notices. *(Complete for `v0.1.0-rc.1`; candidate PR, exact-main and deployment evidence remain.)*
18. Demo, transcript, submission copy, final tag and hashes. *(Storyboard and draft copy are updated; video, candidate tag, registration and submission remain.)*

## Should

1. `compare_resources` after core freeze. *(Superseded for this candidate by claim-foundation comparison. Resource ranking/comparison remains deliberately absent.)*
2. Filter facets for publisher/type/access.
3. Link-health report. *(Refreshed on 30 August 2026: 161 of 161 unique admitted official URLs responded to the bounded check.)*
4. Stale-data badge/threshold.
5. Downloadable record and receipt.
6. Automated SBOM/attestation. *(Local macOS ARM64 sanitised CycloneDX SBOM
   complete; release-platform SBOM and signed attestation pending.)*
7. Accessibility statement and manual test log. *(Statement, Chrome/Edge and headed-browser evidence complete; screen-reader observation pending.)*
8. Baseline-to-submission visual compare. *(Candidate overview and comparison screenshots are retained; a final deployed side-by-side remains.)*
9. Optional small set of related-record links.
10. Public status/known-issues page.

## Could

1. Graph view of reviewed relationships. *(Complete as the accessible Evidence Trace plus relationship table.)*
2. Timeline of source observations.
3. Map for geospatial examples.
4. Multilingual labels.
5. Serverless refresh preview outside judging path.
6. Persistent MCP hand-off demo.
7. User study dashboard.
8. Additional publishers/corpora. *(Complete as a bounded 10-entry descriptor only: two are searchable and eight contribute no payload.)*
9. Declarative WebMCP experiment when host support is verified.
10. Signed publisher attestations in a future profile.
