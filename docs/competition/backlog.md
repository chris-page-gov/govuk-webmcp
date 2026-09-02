# Appendix B — prioritised backlog

## Must

1. Entrant/ownership/outside-interest decision.
2. Baseline, rights and attribution manifests.
3. 30–80 record reviewed corpus. *(Complete: 80 records and receipts.)*
4. Minimal OKF profile and JSON Schema. *(Complete for the historical `v0.2` release with 20 closed schemas, `v0.3.0-rc.1` with 31 and the hardened `0.4.0-rc.1` source candidate with 36. Source-native and target OKF states remain separate. No hardened deployment or tag is inferred.)*
5. Accessible search, results, record and provenance UI. *(Complete for the bounded released Chrome and Edge journeys covering the analytical index, Evidence Trace and comparison. The hardened Evidence answer structure is implemented and its automated suites pass 43 of 43 in Chrome and 43 of 43 in Edge. The 6-pass/3-limited Safari and VoiceOver record, with eight limitation statements, no captured speech audio, no WCAG claim and no independent capture-time deployment binding, belongs to historical pre-hardening commit `a4fabe...` and must not be relabelled as hardened-release evidence.)*
6. `search_government_knowledge`. *(Complete.)*
7. `get_resource_record`. *(Complete.)*
8. `show_provenance`. *(Complete.)*
9. Shared execution functions and UI/tool parity. *(Complete in the hardened source through one action controller and presentation object. Automated parity passes in the 43-test Chrome and Edge suites. Descriptor-safe data-only parsing covers reviewed, combined and lazy federated discovery, Evidence Trace comparison and shared action-budget ingress; it rejects symbols, accessors, non-enumerables, sparse arrays and extra array properties without invoking getters. Numeric limits accept only actual bounded integers without coercion. Host JSON cannot carry a Proxy, and containment of a same-realm Proxy whose creator already has script-execution authority is not claimed. The earlier isolated-Chrome six-tool observation and displayed digest parity belong only to historical pre-hardening commit `a4fabe...`; personal-AI host selection, hardened live execution and answer quality remain separate gates.)*
10. Authoritative human links. *(Complete.)*
11. Access/licence/assertion/observation/limitation fields. *(Complete, with eight separate Trace facets and no combined score.)*
12. Source/record/bundle digests and receipt. *(Complete and extended to Evidence Trace and federation bindings.)*
13. Fail-closed validation. *(Complete for public `v0.3.0-rc.1`: five source-lock registry entries validate against separately code-reviewed imported SHA-256 pins; the standalone builder directly pins the federation-lock bytes; and the manifest-first lazy plane plus exact ordered per-source population and display contracts validate. Same-count source-and-registry substitution fails closed. Post-remediation build/data, unit, browser and smoke verification passes, immutable scan `040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 items with zero reportable findings, and all 1,879 public files matched the retained Pages artefact.)*
14. Injection, unsafe URL, stale/missing/conflict/no-match tests. *(Part complete: injection, unsafe URL, missing licence, no-match, deep-input and bounded-fragment cases pass; dedicated stale and conflicting-assertion fixtures remain.)*
15. CSP, no storage, no external runtime request. *(Complete.)*
16. ChatGPT/Chrome tests. *(Part complete for host execution: the historical five-tool observations remain release-bound. Current release-hardening work passes 398 of 398 prepared unit tests; the most recent complete runtime suites pass 43 of 43 Chrome tests, 43 of 43 Edge tests and seven of seven model-free smoke calls. Chrome 152.0.7977.66 and Chrome DevTools MCP 1.8.0 completed all six tools only against historical pre-hardening commit `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8` and Pages run `33555187118`; that observation is not final-release evidence. Hardened admission freshly authenticates the exact live receipt process-locally, requires ordered initial, after-page-load and after-execution checks, requires the fresh observation at or after both stored observations, exact-matches the stored private/raw and public/reviewed pair by identity, size and digest, and uses explicit owned/borrowed leases. Ordinary evaluation requires the exact clean Pages commit; only final-video admission may use a clean, tightly allowlisted evidence descendant whose page runtime remains pinned to the ancestor commit. The patched Ollama diagnostic retains 36 local runs, 6 tool-selection and deterministic-execution passes and 30 failures; page parity is unobservable, answers are unreviewed and all 36 Microsoft Copilot MCP Workspace observations remain missing. No hardened live-host or model-safety claim is made.)*
17. Public deployment, MIT licence and notices. *(Part complete: the licence and notices are public. PR #20, historical pre-hardening commit `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8` and Pages run `33555187118` retain their exact chronology but are not final-release evidence. Hardened integration is pending in PR #21. Its first validation run `33593265033`, job `100131452398`, failed on clean-runner portability and preservation assumptions; local corrections now pass 398 prepared unit tests but protected validation has not yet passed. Deploy and byte-compare only the exact hardened protected-main commit after integration. Tag only that deployed commit after exact-release recapture. Earlier release identities remain unchanged.)*
18. Demo, transcript, submission copy, final tag and hashes. *(Part complete: historical pre-hardening page, Chrome, VoiceOver and supported-host evidence plus the separately unclaimable local diagnostic retain their exact identities and limitations. Once item 17 is demonstrably complete, recapture or rebuild every release-context input that does not name the exact hardened deployment; run a clean 36-slot local matrix and 36 visible Copilot slots; then build and review the final video and tag only that deployed protected-main product commit. If work resumes after any gate has changed, verify live state and continue from the first unmet gate. Human review, signed-out public playback, GitHub prerelease, public upload and authorised submission remain open. No new deployment, final host matrix, final video, tag, WCAG conformance, personal-AI safety, submission or upload claim is made.)*

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
   baseline; do not describe the GitHub release as platform-immutable. *(Complete;
   public `v0.3.0-rc.1` is separately release-bound under gate M.)*
2. Lock exactly four source identities, descriptors, manifests, snapshots,
   counts, files and same-origin target paths. Reject a legislation collection
   or request and every undeclared origin or route without treating inert
   source-authored cross-references as a fifth source. *(Implemented through
   the current federation lock and 73 reviewed gzip
   artefacts totalling 13,021,675 bytes. Each exact stored length and SHA-256 is
   bound to the decoded raw length and SHA-256; import preserves the reviewed
   stored bytes only after a byte-for-byte fetched-source cross-check, without
   host recompression. The focused source-contract checks and public release
   binding passed under gates A–C and I.)*
3. Publish separate `reviewed-deep-evidence` and
   `federated-source-snapshot` contracts, closed schemas and executable
   validators with a common evidence shape. *(Implemented with search result v2
   and reviewed/federated record and provenance unions; focused schema and
   executable-contract tests pass. Exact post-remediation build/data validation
   and all 194 prepared unit tests pass; immutable fixed-tree scan
   `040ad945-3723-4aef-9c03-1bb552630deb` and release binding close gates B, F,
   H and I.)*
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
   legislation request; public release binding closes gates C, D and I.)*
5. Extend the accessible human journey and the three discovery tools through
   the shared action controller, while retaining the two presentation tools'
   existing scope. *(Implemented locally. The exact post-remediation candidate
   passes 30 Chrome tests, 30 Edge tests and six of six model-free WebMCP smoke
   calls in real Chrome. Combined and public WebMCP search preserve
   `federated_runtime_busy`; the human live region distinguishes rejected input,
   busy state and other failure. The focused regression set passes 11 of 11 and
   the release prepared unit suite passes 194 of 194; the evidence follow-up
   passes 195 of 195 locally. Current-release supported-host
   execution and fixed-query parity are retained under gates E, F, G and H.)*
6. Show collection availability, evidence tier, source snapshot, link role and
   limitations; isolate one source failure without an unverified fallback.
   *(Implemented with deterministic verified-shard file and byte counters and
   explicit unavailable status. Busy runtime is not misclassified as source
   unavailable. The exact post-remediation candidate passes
   all 30 Chrome and all 30 Edge tests, including the fail-each-source matrix;
   historical `v0.3.0-rc.1` manual accessibility evidence is complete with two
   retained limitations under gates F, G and K. The candidate-specific Safari
   and VoiceOver journey is also complete with 6 passed and 3 limited
   checkpoints, while the no-WCAG and no-formative-comprehension boundaries
   remain.)*
7. Add tiny v1/v2 fixtures and raw-corruption, co-digested semantic mutation,
   search-quality, duplicate, injection and exhaustion tests. *(Implemented for
   contracts, corruption, semantic mutation, deterministic ranking,
   partial-failure, input closure, cancellation and bounded shard work. The
   complete 144-test unit run passed in 174.5 seconds at the pre-remediation
   checkpoint. The frozen nDCG@10 and Recall@20 fixture and runner are required
   by CI and Pages and now pass locally with mean nDCG@10 `0.984698009`,
   Recall@20 `1`, cold/warm parity and no admitted legislation result or
   request. The exact post-remediation prepared unit suite passes 194 of 194,
   including same-count source-and-registry substitution, direct builder lock
   substitution, per-source semantic mutation and physical cancellation churn;
   immutable scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55
   items with zero reportable findings; public release binding closes gates
   A–I for this product release.)*
8. Run model-free four-source, parity, browser and accessibility journeys
   against one exact candidate. *(In verification: the exact post-remediation
   candidate passes research 4 of 4; production build/data validation with 80
   reviewed records and 80 receipts, 58,655 raw rows, 3 quarantined rows,
   58,652 searchable rows, 120 record shards and 1,733 postings shards; the
   frozen lexical gate at mean nDCG@10 `0.984698009`, Recall@20 `1`, cold/warm
   parity, no legislation collection and rejection of a legislation request;
   194 of 194 prepared unit tests; 30 Chrome tests; 30 Edge tests; six of six
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
   reportable findings. The pre-federation focused manual screen-reader journey
   and current-release supported-host and isolated-Chrome captures are complete.
   The refreshed
   current-release manual screen-reader journey is also complete with two
   retained limitations under gates D–K and makes no WCAG claim.)*
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
    scan `040ad945-3723-4aef-9c03-1bb552630deb`. Pull request 16's first
    protected Linux run `33354712509` exposed host-dependent gzip output. Its
    header-only correction was disproved by second protected Linux run
    `33355108429`, which also differed in the DEFLATE stream. The final contract
    binds the exact reviewed stored-gzip length and SHA-256 to the decoded raw
    length and SHA-256; import preserves the reviewed stored bytes only after
    proving that they decode byte-for-byte to the freshly fetched raw source,
    and the builder validates that binding without host recompression. The
    next protected run `33355787295` cleared the build gate, then exposed an
    unreferenced import-wide timeout whose isolated test could end before the
    deadline fired. The deadline now uses a referenced, finally-cleared timer
    and focused macOS/Linux regressions pass. PR validation `33356087333`,
    exact-main validation `33356272534` and Pages `33356452048` then passed;
    PR #16 merged as `b0bd634579a3abf82bdd1fc83ff688535e0db0bf` and annotated
    tag and pre-release `v0.3.0-rc.1` bind that commit. All 1,879 deployed
    regular files (128,548,215 bytes) returned HTTP 200 and matched Pages
    artefact `9745316971`; current supported-host execution also completed.
    Gate M is complete for product release. Submission media and human
    attestations remain separate open gates.)*

The controlling A–M matrix is in
[`okf-federated-personal-agent-evaluation-plan.md`](okf-federated-personal-agent-evaluation-plan.md).
Implementation progress alone does not turn a planned test into observed
evidence.

## Beginner trust pathway — discovery and evaluation slice

This sequenced backlog began as the documentation-first route from the released
technical interface to a testable beginner experience. Experimental
implementation is now authorised and in progress; deployment, host evidence,
formative acceptance and Devpost submission remain separate gates.

1. **Evidence and frequency boundary — complete.** Register official GOV.UK
   Chat/user-needs research and the fork-local comparator. Call the questions
   representative hypotheses; do not claim a ranked “most common” list.
2. **Exact coverage matrix — complete.** Map the released reviewed and
   federated estate to the comparator and representative life-course, ONS, API
   and Land Registry questions. Mark discovery, partial, boundary and absent
   outcomes separately from full answerability.
3. **Synthetic personas and stories — complete.** Retain four clearly
   fictional personas and US-01 to US-12. No persona may be described as a
   research participant or prevalence segment.
4. **Beginner learning pathway and PRD — complete.** Teach answer, evidence and
   decision as separate things; use Explain–Inspect–Do–Check–Reflect; translate
   technical facets into task questions; never create a combined trust score.
5. **Guided conversation fixture — complete.** Cover all five tools, both
   evidence tiers, every federated collection, an expected task-minimal
   argument shape, clarification and unrelated no-call behaviour. Validate the
   12-story order, 27 expected calls and two no-call decisions in unit tests.
   The first diagnostic did not supply private marker values, so actual marker
   withholding remains part of step 10.
6. **Exact model-client diagnostic — complete with limitations.** Retain the
   exact local model digest, browser, evaluator, fixture/report digests and
   ignored raw-report boundary. Admit a privacy-reviewed per-story receipt
   without full model prose or result payloads. Treat 13/29 as ordered call
   matching, not answer quality.
7. **Qualitative answer review — complete; not passed.** Keep sources,
   supported-versus-added statements, limitations, plain English, safe next
   steps and privacy/no-call behaviour separate. Four material unsafe answers
   block an acceptance claim.
8. **Source-contract reconciliation — complete for the hardened candidate source.**
   The authored A Life in the UK lock, closed schema, corpus admission,
   generated display contract, executable runtime boundary and tests now record
   zero accepted specialist reviews, two service families where review is not
   required and 291 where it is required. Historical `v0.3.0-rc.1` evidence is
   retained unchanged.
9. **Technical review and UI specification — hardened implementation complete;
   live release gate state-neutral.** The source contains the closed projection,
   sixth `present_resource_evidence` action, bounded persistent two-view
   navigation and Evidence answer renderer while retaining Technical review.
   Descriptor-safe validators reject exotic object and array descriptors
   without invoking getters. The prepared unit suite passed 398 of 398 in
   67,006.169333 ms; installed Chrome passed 43 of 43 in 17.7 seconds;
   installed Edge passed 43 of 43 in 17.5 seconds; and two deterministic builds
   each contained 1,883 files and 128,653,230 bytes at aggregate SHA-256
   `cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
   The
   deployed `a4fabe...` implementation and its 6-pass/3-limited Safari and
   VoiceOver record are historical pre-hardening evidence only; no WCAG or
   hardened-deployment claim follows.
10. **Formative and repeated evaluation — partly observed; acceptance open.**
    The three-run local Ollama diagnostic is complete for all 12 stories, with
    failures and unknowns retained and the claim gate false. All 36 Copilot
    observations and all formative comprehension work with non-technical and
    assistive-technology users remain pending.

The corresponding evidence and detailed status are in
[`implementation-plan.md`](implementation-plan.md),
[`beginner-question-coverage.md`](beginner-question-coverage.md),
[`beginner-conversation-evaluation-2026-08-31.md`](beginner-conversation-evaluation-2026-08-31.md)
and [`../product/beginner-trust-pathway-prd.md`](../product/beginner-trust-pathway-prd.md).
The proposed dual-view contract is in
[`../product/beginner-interface-specification.md`](../product/beginner-interface-specification.md).

### `0.4.0-rc.1` Evidence answer implementation checklist

1. **Closed projection — complete.**
   The build-integrated audit passes all 80 reviewed and 58,652 admitted
   federated records against the production projector and closed presentation
   schema. `npm run build:verify-deterministic` confirms two complete 1,883-file,
   128,653,230-byte builds at aggregate SHA-256
   `cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`;
   398 of 398 prepared unit tests pass. The prior public-byte gate remains
   historical pre-hardening evidence for `a4fabe...`; hardened integration and
   deployment status must be read live rather than inferred here.
2. **Sixth tool — complete.** Closed input, cancellation, timeout, no partial
   presentation and all-or-none registration tests pass. One latest-started
   sequence spans all three presentation actions, with a cross-tool unit and
   Chrome race regression. Descriptor-safe data-only parsing covers reviewed,
   combined and lazy federated discovery, Evidence Trace comparison and shared
   action-budget ingress. It rejects symbols, accessors, non-enumerables, sparse
   arrays and extra array properties without invoking getters. Numeric limits
   accept only actual bounded integers without coercion. Host JSON cannot carry
   a Proxy; same-realm Proxy containment is not claimed. The earlier six-tool
   Chrome call set covers only the historical pre-hardening deployment.
3. **Persistent views — automated acceptance complete.** Empty, explicit,
   legacy and invalid route unit checks pass;
   complete 43-test Chrome and Edge suites verify heading focus,
   sticky-navigation clearance, cross-tool latest-started routing and
   inactive-view preservation. The release-specific manual assistive-
   technology observation remains under item 5.
4. **Evidence answer rendering — automated acceptance complete.** Focused unit
   and Chrome checks cover inert rendering, validated
   links, mapped primary plus all other limitations, unknowns, next checks,
   accepted fields, Technical review parity and inactive-view updates without
   view, URL, history, focus or scroll mutation.
5. **Release assurance implemented locally; integration and live acceptance
   pending.** The first exhaustive candidate security-diff review completed
   with zero reportable vulnerabilities; the release-hardening defects it
   exposed now have targeted regressions. Current local gates include research
   4 of 4; the settled deterministic double-build identity in item 1; 398 of
   398 unit;
   43 of 43 Chrome; 43 of 43 Edge;
   mean nDCG@10 `0.984698009`; Recall@20 `1`; seven of seven model-free smoke
   calls; and zero npm-audit vulnerabilities. Final
   code-snapshot security scan `aedf88e3-6a77-46af-be6b-2c672001dd46`
   completed 36 of 36 items, ran 102 focused tests, found zero findings and
   concluded that there is no security release blocker for that named snapshot.
   PR #20, protected-main run `33554600300`, Pages run `33555187118`, exact
   comparison of 1,884 files and 128,646,735 bytes, isolated-Chrome execution
   and VoiceOver media are historical pre-hardening evidence only.
   Hardened supported-host admission must freshly authenticate the exact live
   receipt in-process, retain ordered initial/after-page-load/after-execution
   checks, observe at or after both stored receipts, exact-match the stored
   private/raw and public/reviewed pair and use explicit owned/borrowed leases.
   Final-video owns the shared receipt, nested consumers borrow it and the outer
   `finally` revokes it; owned success and failure paths revoke before awaiting
   asynchronous clean-up. Sealed post-fix scan
   `185ce6fa-a47f-4c5e-9888-c63a9f932205`, snapshot
   `codex-security-snapshot/v1:sha256:012c0b4bb3e60271f8d60fca9475976a473ac0a267f87354810e51c2d575c0ad`,
   completed all 33 selected executable-source items with complete configured
   coverage and zero reportable findings for its historical snapshot. Later
   release-evidence changes require their own final review.
   The first PR #21 validation, run `33593265033` and job `100131452398`, found
   four clean-runner failures: an ignored raw Chrome fixture read during test
   module initialisation, two APFS-specific inode-reuse assumptions and backup
   clean-up that trusted a recycled device/inode pair. The fixture is now
   reconstructed from tracked evidence as exactly 133,272 bytes with SHA-256
   `2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`;
   validated clean-up and rollback also recheck exact bytes and mode. These
   corrections pass locally, but a green protected validation is not claimed.
   The patched Ollama diagnostic is complete but unclaimable. The candidate
   Copilot matrix, complete host comparison, hardened live evidence, final
   media, tag and GitHub prerelease are not claimed. Inspect live GitHub and
   Pages state before choosing the next integration or deployment action.
   Historical five-tool evidence is not a substitute.
6. **Canonical release-evidence admission — implemented locally; live use
   pending.** One canonical path contract now serves the live verifier,
   supported-host capture and final-video builders. The live verifier, rather
   than a manual copy, can stage identical mode-`0600` local and private receipts
   and an optional mode-`0644` reviewed receipt in one recoverable admission.
   A restrictive process umask is normalised to the requested mode through an
   opened no-follow descriptor before bytes, identity and permissions are
   validated; any subsequent mode drift fails closed.
   Private and reviewed overwrites require independent explicit gates; replacing
   the private receipt invalidates dependent supported-host and media evidence.
   Final-video authentication may use only a clean descendant with `A` or `M`
   changes to inert `docs/` `.md`, `.csv` or `.vtt` files, reviewed evidence
   JSON, approved top-level documents and exact VoiceOver assets. It pins and
   rechecks `HEAD` and the exact change set, retains the ancestor Pages runtime,
   and rejects dirty state, deletes, renames, code, workflow and package changes.
   The no-argument VoiceOver builder now selects the canonical exact
   `v0.4.0-rc.1` capture manifest. Focused post-fix tests pass 116 of 116 and the
   prepared suite passes 398 of 398. Local automated verification is complete.
   Protected integration, exact deployment, hardened live-host and VoiceOver
   capture, final media, tag and GitHub prerelease remain pending.

## Should

1. `compare_resources` after core freeze. *(Superseded for this release by claim-foundation comparison. Resource ranking/comparison remains deliberately absent.)*
2. Filter facets for publisher/type/access.
3. Link-health report. *(Refreshed on 30 August 2026: 161 of 161 unique admitted official URLs responded to the bounded check.)*
4. Stale-data badge/threshold.
5. Downloadable record and receipt.
6. Automated SBOM/attestation. *(Local macOS ARM64 sanitised CycloneDX SBOM
   complete; release-platform SBOM and signed attestation pending.)*
7. Accessibility statement and manual test log. *(Statement, Chrome/Edge,
   headed-browser and release-specific Safari and VoiceOver evidence are
   complete for the bounded journeys. The historical journey retains two
   limitations and the candidate journey retains three; VoiceOver speech audio
   is not claimed and no WCAG conformance is claimed.)*
8. Baseline-to-submission visual compare. *(Part complete: separate retained public search captures show `v0.1.0-rc.1` and deployed `v0.2.0-rc.1`; a bound side-by-side comparison artefact remains.)*
9. Optional small set of related-record links.
10. Public status/known-issues page.
11. Independent WebMCP host and evaluator matrix. *(Part complete:
    pinned Chrome DevTools MCP and `webmcp-evals` harnesses, context-minimisation
    and no-call fixtures, isolated model-free receipts, exact current-release
    Chrome DevTools MCP execution and historical native Chrome-panel evidence
    exist.
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
8. Additional publishers/corpora. *(The 10-entry descriptor has 6 searchable
   and 4 non-searchable admissions. The four-source payload federation is
   integrated, deployed and tagged as `v0.3.0-rc.1` under Federation 1–10.)*
9. Declarative WebMCP experiment in a future release; the current imperative
   path is observed only in the bounded Codex in-app, Chrome DevTools MCP and
   native Chrome-panel environments recorded in the evidence.
10. Signed publisher attestations in a future profile.
