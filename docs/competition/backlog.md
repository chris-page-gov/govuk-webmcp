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
13. Fail-closed validation. *(Complete for the historical `v0.2` release's four artefact families and four exact source locks. The local federated candidate validates five source-lock registry entries against separately code-reviewed imported SHA-256 pins, directly pins the federation-lock bytes in the standalone builder, and validates the additional manifest-first lazy plane plus exact ordered per-source population and display contracts. Same-count source-and-registry substitution now fails closed. Exact post-remediation build/data, unit, browser and smoke verification passes, and immutable scan `040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 items with zero reportable findings; release binding remains open.)*
14. Injection, unsafe URL, stale/missing/conflict/no-match tests. *(Part complete: injection, unsafe URL, missing licence, no-match, deep-input and bounded-fragment cases pass; dedicated stale and conflicting-assertion fixtures remain.)*
15. CSP, no storage, no external runtime request. *(Complete.)*
16. ChatGPT/Chrome tests. *(Complete: instrumented WebMCP and installed Chrome and Edge contract checks passed, and `Codex In-app Browser` called all five tools on the historical tagged release. Corrected main is deployed; Chrome DevTools MCP completed all five public calls with zero console errors, while Chrome's native WebMCP panel recorded five valid `Completed` calls, the expected structured rejection for `limit: 21`, and visible-page parity for both presentation tools. Pull request 13 admitted the evidence and its tests; exact-main validation run `33327860583` passed. Five local fixed-model attempts are retained but all failed the strict gate; attempt 4 retained a null evaluation after structural validation failed and attempt 5 recovered after rejected malformed IDs but failed `verify-reports`. A passing model result and Microsoft WebMCP Explorer browser execution remain under Should 11.)*
17. Public deployment, MIT licence and notices. *(Complete: PR #9 integrated tagged commit `9235ee5db4df637bdb2a12e87449e871614afe68`, with exact-main run `33286750188` and Pages run `33286771963`; PR #12 later integrated corrected main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, deployed by Pages run `33323152751`. The historical tag remains unchanged.)*
18. Demo, transcript, submission copy, final tag and hashes. *(Part complete: storyboard, guarded build tooling, five genuine live interaction clips with exact release/action/duration/hash binding and agent review, supported-host receipt visualisation, the manual Safari and VoiceOver record and its visibly labelled non-continuous screenshot sequence, submission copy, a historical read-only Devpost-state review, release hashes and historical tag `v0.2.0-rc.1` are complete. The `v0.2.0-rc.2` repository checkpoint freezes the corrected pre-federation state without changing the recorded Pages product identity. A 142.920-second local review video with H.264 video, AAC synthetic narration, embedded English captions, separate en-GB captions, transcript and build receipt is also complete. Full technical decode, 4,284-frame and 38-caption-cue checks passed with one retained non-fatal subtitle metadata warning, but no audible content-parity or owner approval is claimed. This checkpoint makes no registration, submission or public YouTube-upload claim. Owner synthetic-voice, privacy, branding and final-playback review, public upload and Devpost submission remain open.)*

The current official submission boundary closes at 1:00 pm PDT on 3 September
2026. It requires a public source repository with a visibly detectable open-
source licence, a public YouTube demonstration under three minutes with audio
and the exact live project accessible in ChatGPT's in-app browser or Chrome with
WebMCP enabled. Freeze the repository, live project and submission after close.

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

Each collection's source/quarantined/searchable population is now bound
independently as well as in aggregate: 9,757/0/9,757 for A Life in the UK,
5,097/0/5,097 for ONS, 41,598/0/41,598 for UK Government APIs and
2,203/3/2,200 for HM Land Registry. The executable display contract also fixes
each title, ordered supplementary counts, completeness statement and first
limitation, so a co-digested redistribution or contradictory display claim
fails closed.

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
   executable-contract tests pass locally. Exact post-remediation build/data
   validation and all 187 prepared unit tests now pass; immutable security
   rescan and release binding remain pending under gates B, F, H and I.)*
4. Build deterministic progressive search with explicit request, byte,
   decompression, row, retained-text, shard-fan-out, memory, worker and timeout
   budgets. *(Implemented with incremental exact-byte postings partitioning,
   aggregate token/posting/generated-byte caps, streamed response byte limits
   and bounded generated-plane cleanup. Physical work is separately limited to
   4 active loads, 32 queued loads and 36 distinct in-flight files. The 3-second
   file deadline includes queue time and a slot is retained until actual loader
   settlement. Queue or immediate pre-loader deadline expiry is reported as
   scheduler busy, not source corruption; four non-cooperative loaders can
   therefore keep federation loading unavailable, but cannot amplify work
   beyond those four. The output
   has 1,853 ignored deterministic shard files — 120
   record shards and 1,733 postings shards — plus the manifest and sidecar,
   totalling 1,855 files and 127,747,020 bytes. The
   post-remediation production build and data validation pass locally with
   58,655 raw rows, 3 quarantined rows, 58,652 searchable rows, 120 record
   shards and 1,733 postings shards. The frozen lexical gate reports mean
   nDCG@10 `0.984698009`, Recall@20 `1`,
   identical cold/warm results, no legislation collection and rejection of a
   legislation request; release
   binding still keeps gates C, D and I open.)*
5. Extend the accessible human journey and the three discovery tools through
   the shared action controller, while retaining the two presentation tools'
   existing scope. *(Implemented locally. The exact post-remediation candidate
   passes 30 Chrome tests, 30 Edge tests and six of six model-free WebMCP smoke
   calls in real Chrome. Combined and public WebMCP search preserve
   `federated_runtime_busy`; the human live region distinguishes rejected input,
   busy state and other failure. The focused regression set passes 11 of 11 and
   the prepared unit suite passes 193 of 193. Current-candidate supported-host
   evidence remains pending under gates E, F, G and H.)*
6. Show collection availability, evidence tier, source snapshot, link role and
   limitations; isolate one source failure without an unverified fallback.
   *(Implemented with deterministic verified-shard file and byte counters and
   explicit unavailable status. Busy runtime is not misclassified as source
   unavailable. The exact post-remediation candidate passes
   all 30 Chrome and all 30 Edge tests, including the fail-each-source matrix;
   current-candidate manual accessibility evidence remains pending
   under gates F, G and K.)*
7. Add tiny v1/v2 fixtures and raw-corruption, co-digested semantic mutation,
   search-quality, duplicate, injection and exhaustion tests. *(Implemented for
   contracts, corruption, semantic mutation, deterministic ranking,
   partial-failure, input closure, cancellation and bounded shard work. The
   complete 144-test unit run passed in 174.5 seconds at the pre-remediation
   checkpoint. The frozen nDCG@10 and Recall@20 fixture and runner are required
   by CI and Pages and now pass locally with mean nDCG@10 `0.984698009`,
   Recall@20 `1`, cold/warm parity and no admitted legislation result or
   request. The exact post-remediation prepared unit suite passes 193 of 193,
   including same-count source-and-registry substitution, direct builder lock
   substitution, per-source semantic mutation and physical cancellation churn;
   immutable scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55
   items with zero reportable findings; release binding remains pending under
   gates A–I.)*
8. Run model-free four-source, parity, browser and accessibility journeys
   against one exact candidate. *(In verification: the exact post-remediation
   candidate passes research 4 of 4; production build/data validation with 80
   reviewed records and 80 receipts, 58,655 raw rows, 3 quarantined rows,
   58,652 searchable rows, 120 record shards and 1,733 postings shards; the
   frozen lexical gate at mean nDCG@10 `0.984698009`, Recall@20 `1`, cold/warm
   parity, no legislation collection and rejection of a legislation request;
   193 of 193 prepared unit tests; 30 Chrome tests; 30 Edge tests; six of six
   model-free WebMCP smoke calls in real Chrome; zero npm-audit vulnerabilities
   across 162 total dependencies; and a clean `git diff --check`. Sealed
   scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed seven earlier Low
   findings and found one further High-confidence Low URL bypass, now fixed
   post-snapshot. Its coverage is mechanically partial and has stale-pending
   rows. Focused security checks passed 119 of 119, then the affected post-fix
   subset passed 23 of 23. The full unit command then passed 173 of 173.
   Immutable scan `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` later completed 50 of
   50 review items, dynamically reproduced three further engineering or
   evidence-integrity defects and classified zero as reportable vulnerabilities
   under attack-path policy. Exact per-source and display binding, physical-
   work bounds and model receipt v2 address them. The immutable exact post-
   remediation scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` completed 55 of 55
   items and reported one Low co-digested source-substitution finding, now
   remediated with separately code-reviewed source pins and direct builder lock
   validation. Fresh immutable fixed-tree scan
   `040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 items with zero
   reportable findings. The focused manual screen-reader journey and current-
   candidate supported-host
   capture remain pending under gates D–K.)*
9. Run each synthetic fixed-model case at least three times, retain failures
   and variance, and compare whole-system costs under declared assumptions.
   *(Five local attempts used Chrome 152, `webmcp-evals` 0.0.4, eight cases,
   three runs per case and exact loopback-only `ollama:gpt-oss:20b` digest
   `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
   They failed overall at 8 of 102 retry-expanded rows, then 32 of 33 strict
   rows despite 33 of 33 upstream, then 30 of 35 upstream on the security-fixed
   tree. Receipt-v2 attempt 4 at 01:53 on 31 August 2026 bound stable identity
   and exited zero, but structural validation failed and its evaluation was
   null. Receipt-v2 attempt 5 at 02:13 ran 24 case executions from fixture digest
   `ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`.
   It reported 36 rows for 33 expected rows, with 3 retries, 30 pass, 6 fail and
   zero error, console-error or missing counts. All three provenance trajectories
   recovered after malformed canonical IDs were rejected, but `verify-reports`
   failed. Receipt v2 bound stable matching `/api/tags` before and after the run
   to daemon-reported `/api/ps` loaded-model evidence and recorded
   `executionBound: true`. That is
   post-run daemon evidence, not cryptographic per-response proof. Redirects,
   incomplete inventory identities and remote-backed Ollama rows fail before
   evaluation; privileged daemon control, tag changes between observations and
   a previously loaded model remain outside the receipt boundary. Model
   legibility and fail-closed recovery improved, but all five attempts failed and
   gate J remains open. The gate L cost study remains planned and no cost,
   privacy or quality benefit is claimed.)*
10. Update lockstep evidence, integrate through protected review, verify exact
    public bytes and bind every released statement to the deployed candidate.
    *(Documentation retains the sealed 55-item pre-remediation scan and its Low
    finding alongside the implemented code-pin fix and zero-finding fixed-tree
    scan `040ad945-3723-4aef-9c03-1bb552630deb`. CI, Pages, tag, release,
    deployed-byte and supported-host evidence remain
    pending under gate M. The final-candidate
    demo preflight correctly failed closed without a deployed commit and
    explicit overwrite approval; it did not start live capture.)*

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
    Five exact local fixed-model attempts and their failures and variance are
    retained, but no model-backed pass exists. Attempts 4 and 5 exercised receipt v2,
    binding matching pre/post `/api/tags` identity to daemon-reported post-run
    `/api/ps` loaded-model identity with `executionBound: true`; this is not
    cryptographic per-response proof. Explorer browser evidence and a
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
