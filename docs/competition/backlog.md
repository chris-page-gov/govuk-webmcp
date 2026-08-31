# Appendix B — prioritised backlog

## Must

1. Entrant/ownership/outside-interest decision.
2. Baseline, rights and attribution manifests.
3. 30–80 record reviewed corpus. *(Complete: 80 records and receipts.)*
4. Minimal OKF profile and JSON Schema. *(Complete for the historical `v0.2` release with 20 closed schemas. At the current working-tree checkpoint the local `0.3.0-rc.1` candidate has 31 closed schemas; recompute that total after the exact-tree rescan. Source-native and target OKF states remain separate.)*
5. Accessible search, results, record and provenance UI. *(Complete for the bounded tested journeys: automated Chrome and Edge cover the analytical index, Evidence Trace and comparison; a manual Safari and VoiceOver journey completed with two retained limitations and no WCAG claim.)*
6. `search_government_knowledge`. *(Complete.)*
7. `get_resource_record`. *(Complete.)*
8. `show_provenance`. *(Complete.)*
9. Shared execution functions and UI/tool parity. *(Complete for five tools through one action controller.)*
10. Authoritative human links. *(Complete.)*
11. Access/licence/assertion/observation/limitation fields. *(Complete, with eight separate Trace facets and no combined score.)*
12. Source/record/bundle digests and receipt. *(Complete and extended to Evidence Trace and federation bindings.)*
13. Fail-closed validation. *(Complete for the historical `v0.2` release's four artefact families and four exact source locks. The local federated candidate validates five source-lock registry entries and the additional manifest-first lazy plane; integrated release verification remains open.)*
14. Injection, unsafe URL, stale/missing/conflict/no-match tests. *(Part complete: injection, unsafe URL, missing licence, no-match, deep-input and bounded-fragment cases pass; dedicated stale and conflicting-assertion fixtures remain.)*
15. CSP, no storage, no external runtime request. *(Complete.)*
16. ChatGPT/Chrome tests. *(Complete: instrumented WebMCP and installed Chrome and Edge contract checks passed, and `Codex In-app Browser` called all five tools on the historical tagged release. Corrected main is deployed; Chrome DevTools MCP completed all five public calls with zero console errors, while Chrome's native WebMCP panel recorded five valid `Completed` calls, the expected structured rejection for `limit: 21`, and visible-page parity for both presentation tools. Pull request 13 admitted the evidence and its tests; exact-main validation run `33327860583` passed. Three local fixed-model attempts are retained but all failed the strict gate; a passing model result and Microsoft WebMCP Explorer browser execution remain under Should 11.)*
17. Public deployment, MIT licence and notices. *(Complete: PR #9 integrated tagged commit `9235ee5db4df637bdb2a12e87449e871614afe68`, with exact-main run `33286750188` and Pages run `33286771963`; PR #12 later integrated corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, deployed by Pages run `33323152751`. The historical tag remains unchanged.)*
18. Demo, transcript, submission copy, final tag and hashes. *(Part complete: storyboard, guarded build tooling, five genuine live interaction clips with exact release/action/duration/hash binding and agent review, supported-host receipt visualisation, the manual Safari and VoiceOver record and its visibly labelled non-continuous screenshot sequence, submission copy, competition registration, final read-only compliance review, release hashes and historical tag `v0.2.0-rc.1` are complete. The `v0.2.0-rc.2` repository checkpoint freezes the corrected pre-federation state without changing the recorded Pages product identity. A 142.920-second local review video with H.264 video, AAC synthetic narration, embedded English captions, separate en-GB captions, transcript and build receipt is also complete. Full technical decode, 4,284-frame and 38-caption-cue checks passed with one retained non-fatal subtitle metadata warning, but no audible content-parity or owner approval is claimed. The refreshed Devpost project remains `Untitled`, blank and `submission_pre_draft`. Owner synthetic-voice, privacy, branding and final-playback review, public upload and Devpost submission remain open.)*

## Federation `0.3.0-rc.1` — sequenced 1–10 slice

This slice extends discovery without changing the status of the 80 reviewed
deep-evidence records. It admits exactly four independently republished source
snapshots totalling 58,655 raw rows: 9,757 A Life in the UK rows, including 293
service families; 5,097 ONS metadata rows; 41,598 UK Government APIs rows; and
2,203 HM Land Registry public-estate metadata rows. Exactly three standalone
Land Registry legislation rows are quarantined, leaving 2,200 searchable Land
Registry records and 58,652 searchable federated records overall. The raw sum
is before cross-source deduplication. No standalone UK Legislation collection,
payload, index or runtime request is included, and the searchable projection
contains zero `legislation.gov.uk` result links. The locked snapshots retain 28
source-authored cross-reference strings as inert, untrusted metadata: 6 in A
Life in the UK, 3 in ONS, 2 in UK Government APIs and 17 in Land Registry.

Federated links and assertions remain producer-declared rather than official;
exact-record authority is “Not independently established”, and the human route
shows the recorded destination hostname.

1. Freeze annotated `v0.2.0-rc.2` at product commit
   `35fcedd39ed955278d3975a6dd80692fc6e32935` as the retained pre-federation
   baseline; do not describe the GitHub release as platform-immutable. *(Baseline
   complete; candidate release binding remains gate M.)*
2. Lock exactly four source identities, descriptors, manifests, snapshots,
   counts, files and same-origin target paths. Reject a legislation collection
   or request and every undeclared origin or route without treating inert
   source-authored cross-references as a fifth source. *(Implemented and
   verified locally through the current federation lock, 73
   checksum-bound gzip artefacts totalling 13,021,675 bytes and focused source
   contract tests; release binding remains pending under gates A–C and I.)*
3. Publish separate `reviewed-deep-evidence` and
   `federated-source-snapshot` contracts, closed schemas and executable
   validators with a common evidence shape. *(Implemented with search result v2
   and reviewed/federated record and provenance unions; focused schema and
   executable-contract tests pass locally. Recompute the exact contract count
   after the exact-tree rescan. Full integrated verification remains pending
   under gates B, F, H and I.)*
4. Build deterministic progressive search with explicit request, byte,
   decompression, row, retained-text, shard-fan-out, memory, worker and timeout
   budgets. *(Implemented with incremental exact-byte postings partitioning,
   aggregate token/posting/generated-byte caps, streamed response byte limits
   and bounded generated-plane cleanup. The output has 1,853 ignored deterministic shard files — 120
   record shards and 1,733 postings shards — plus the manifest and sidecar,
   totalling 1,855 files and 127,747,020 bytes. The
   production build and a byte-idempotence check passed locally. The current
   frozen lexical gate reports mean nDCG@10 `0.984698009`, Recall@20 `1`,
   identical cold/warm results and legislation absent or rejected; release
   binding still keeps gates C, D and I open.)*
5. Extend the accessible human journey and the three discovery tools through
   the shared action controller, while retaining the two presentation tools'
   existing scope. *(Implemented locally. The current post-fix tree passed 29
   Chrome tests and 29 Edge tests. Its first model-free smoke attempt hit the
   expected sandbox `EPERM` loopback restriction; the authorised outside-
   socket-sandbox rerun passed six of six. Current-candidate supported-host
   evidence remains pending under gates E, F, G and H.)*
6. Show collection availability, evidence tier, source snapshot, link role and
   limitations; isolate one source failure without an unverified fallback.
   *(Implemented with deterministic verified-shard file and byte counters and
   explicit unavailable status. The fail-each-source matrix passes in Chrome
   and Edge; current-candidate manual accessibility evidence remains pending
   under gates F, G and K.)*
7. Add tiny v1/v2 fixtures and raw-corruption, co-digested semantic mutation,
   search-quality, duplicate, injection and exhaustion tests. *(Implemented for
   contracts, corruption, semantic mutation, deterministic ranking,
   partial-failure, input closure, cancellation and bounded shard work. The
   complete 144-test unit run passed in 174.5 seconds at the pre-remediation
   checkpoint. The frozen nDCG@10 and Recall@20 fixture and runner are required
   by CI and Pages and now pass locally with mean nDCG@10 `0.984698009`,
   Recall@20 `1`, cold/warm parity and no admitted legislation result or
   request. The current `npm run test:unit:prepared` passed 173 of 173 in
   `17128.154916 ms`; release binding remains pending under gates A–I.)*
8. Run model-free four-source, parity, browser and accessibility journeys
   against one exact candidate. *(In verification: the current post-fix tree
   passed research 4 of 4, production build/data validation, 29 Chrome tests,
   29 Edge tests and an authorised six-of-six model-free smoke rerun. Sealed
   scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed seven earlier Low
   findings and found one further High-confidence Low URL bypass, now fixed
   post-snapshot. Its coverage is mechanically partial and has stale-pending
   rows. Focused security checks passed 119 of 119, then the affected post-fix
   subset passed 23 of 23. The full unit command passed 173 of 173. The
   immutable post-fix rescan,
   focused manual screen-reader journey and current-candidate supported-host
   capture remain pending under gates D–K.)*
9. Run each synthetic fixed-model case at least three times, retain failures
   and variance, and compare whole-system costs under declared assumptions.
   *(Three local attempts used Chrome 152, `webmcp-evals` 0.0.4, eight cases,
   three runs per case and exact loopback-only `ollama:gpt-oss:20b` digest
   `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
   They failed overall at 8 of 102 retry-expanded rows, then 32 of 33 strict
   rows despite 33 of 33 upstream, then 30 of 35 upstream on the security-fixed
   tree. Model legibility improved, but gate J remains open; the gate L cost
   study remains planned and no cost, privacy or quality benefit is claimed.)*
10. Update lockstep evidence, integrate through protected review, verify exact
    public bytes and bind every released statement to the deployed candidate.
    *(Documentation is in progress; CI, Pages, tag, release, deployed-byte and
    supported-host evidence remain pending under gate M.)*

The controlling A–M matrix is in
[`okf-federated-personal-agent-evaluation-plan.md`](okf-federated-personal-agent-evaluation-plan.md).
Implementation progress alone does not turn a planned test into observed
evidence.

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
    Three exact local fixed-model attempts and their failures and variance are
    retained, but no model-backed pass exists. Explorer browser evidence and a
    passing fixed-model result remain. Explorer
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
8. Additional publishers/corpora. *(The 10-entry descriptor now has 6
   searchable and 4 non-searchable admissions. The four-source payload
   federation is implemented locally under Federation 1–10 above; protected
   integration and exact deployment remain pending.)*
9. Declarative WebMCP experiment in a future release; the current imperative
   path is observed only in the bounded Codex in-app, Chrome DevTools MCP and
   native Chrome-panel environments recorded in the evidence.
10. Signed publisher attestations in a future profile.
