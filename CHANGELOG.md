# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- An in-progress `0.3.0-rc.1` federated-discovery slice for exactly four
  independently republished OKF source snapshots: 9,757 A Life in the UK
  rows, including 293 service families; 5,097 ONS metadata rows; 41,598 UK
  Government APIs rows; and 2,203 HM Land Registry public-estate metadata
  rows. The locked raw population is 58,655 rows before cross-source
  deduplication. Exactly three standalone HM Land Registry legislation records
  are quarantined, leaving 58,652 searchable federated records, including
  2,200 searchable Land Registry records. The federated tier remains separate
  from the 80 reviewed records with packaged deep-evidence receipts. No
  standalone UK Legislation collection, payload, index or runtime request is
  included, and the searchable projection contains no `legislation.gov.uk`
  result link. The locked source files still retain 28 source-authored
  cross-reference strings as inert, untrusted source metadata: 6 in A Life in
  the UK, 3 in ONS, 2 in UK Government APIs and 17 in Land Registry.
- ADR-0004 and an A–M acceptance plan covering the source allowlist, byte and
  semantic integrity, progressive delivery, deterministic search, four source
  journeys, common evidence shape, partial failure, context minimisation,
  injection and resource safety, repeated fixed-model evaluation,
  accessibility, whole-system cost and exact release binding.
- A frozen authored lexical retrieval-quality fixture and deterministic runner
  for exact ID, title, publisher, topic, multi-token, ambiguous, no-match,
  duplicate and prohibited-legislation cases. It reports nDCG@10 and Recall@20,
  enforces authored thresholds, checks cold/warm parity and binds a canonical
  result digest without claiming model or corpus-wide answer quality.
- A reproducible federated data plane comprising 73 versioned gzip source
  artefacts totalling 13,021,675 bytes. The deterministic builder expands them
  to 1,853 shard files — 120 record shards and 1,733 postings shards — plus
  `manifest.json` and its checksum sidecar: 1,855 generated files and
  127,747,020 bytes in total. The ignored plane is copied into `dist`. The lock
  and generated-manifest digests are bound by the build; record their final
  values only after the exact-tree rescan and deterministic rebuild.
- Eleven additional closed JSON Schemas for the federated lock, generated
  manifest and shards, and public federated result families, bringing the
  published candidate contract set to 31 schemas.

### Changed

- Bound the four federated collections to one exact ordered population contract
  across the source lock, corpus admissions, generated manifest and lazy search
  manifest. The candidate now derives collection coverage from executable
  source, quarantine and searchable counts and validates the human-facing title,
  ordered supplementary counts, completeness statement and first limitation as
  part of the same display contract. HM Land Registry is therefore stated
  consistently as 2,203 raw source records, 3 quarantined records and 2,200
  searchable records; standalone legislation remains excluded.
- Added a separate physical shard-work boundary beneath logical request
  concurrency: at most 4 physical loads can be active, 32 can wait and 36
  distinct files can be in flight. A file's 3-second deadline includes time in
  that queue, and a physical slot remains occupied until the underlying loader
  actually settles. Queue-deadline expiry now returns the dedicated scheduler-
  busy result rather than appearing to be source corruption, and the deadline
  is checked again immediately before the loader is invoked. If as many as four
  non-cooperative loaders never settle, federated loading fails closed and can
  remain unavailable; later calls cannot amplify physical work beyond those
  four.
- Revised the local-model browser-evaluation receipt to v2. An otherwise-
  successful Ollama run must bind the exact selected digest observed through
  `/api/tags` before and after the run and the daemon-reported loaded-model
  digest from `/api/ps` afterwards. This is post-run daemon evidence, not a
  cryptographic binding between an individual model response and model weights;
  a privileged local operator or compromised model service remains outside the
  receipt's trust boundary. Inventory requests reject redirects, require both
  the exact `name` and `model`, and reject `remote_model` or `remote_host`
  markers so an Ollama-labelled cloud proxy cannot bypass explicit remote-
  provider approval. Remote-provider receipts retain no local inventory details.
- The in-progress candidate keeps the existing five page-scoped WebMCP tools
  and complete human journey while extending the three discovery tools to
  distinguish reviewed deep evidence from federated source-snapshot evidence.
  Federated results retain their collection, snapshot, source-native identity,
  source-link role and limitations without acquiring an item-level receipt.
  Human search and WebMCP now use the same action controller and common
  deterministic result.
- Changed the corpus admission split from 2 searchable and 8 non-searchable
  entries to 6 searchable and 4 non-searchable entries. The source-lock
  registry now has 5 entries, including the closed four-source federation lock.
- Preserved every UK Government APIs record by using its source-authored,
  collection-unique `concept_id` as the source-native identity. Endpoint URLs
  can be shared and remain evidence links rather than surrogate record IDs.
- Federated producer text can no longer self-promote a link or assertion to
  official status. Source links use conservative producer-declared roles, and
  source assertions use `producer-declared` unless the application can justify
  a narrower mechanical normalisation independently.
- Federated exact-record output now reports source authority as “Not
  independently established”. Human search and record views display the
  recorded link destination hostname so people can inspect where a producer-
  declared link leads.
- The judging account now states the division of responsibility precisely:
  OKF publishes governed, progressively retrievable evidence; WebMCP lets a
  citizen-selected AI invoke bounded page actions; and the static page hosts no
  model and accepts no personal profile. A remote model provider may still
  receive prompts, tool metadata, arguments and results.
- CI and Pages now run `okf-federation:quality:prepared` immediately after the
  complete test suite. The release result remains pending until that frozen gate
  passes on the exact post-remediation tree.
- Improved model legibility by publishing canonical machine identifiers,
  explicit collection tokens and omit-unused-field guidance in tool schemas,
  descriptions and the eight-case browser fixture. Five preserved local
  `webmcp-evals` attempts used Chrome 152 and the exact loopback-only
  `ollama:gpt-oss:20b` inventory digest
  `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
  The pre-legibility attempt passed 8 of 102 retry-expanded rows; the second
  upstream report passed 33 of 33 rows but the strict project verifier accepted
  only 32 because one call added empty optional arrays; the security-fixed
  third attempt passed 30 of 35 upstream rows after two malformed-then-
  corrected provenance IDs and one omitted comparison. Receipt-v2 attempt 4 at
  01:53 on 31 August 2026 bound a stable exact model identity and exited zero,
  but structural validation failed and its evaluation was null. Receipt-v2
  attempt 5 at 02:13 ran eight cases three times, producing 36 rows for
  33 expected rows: 30 passed, 6 failed, none errored or were missing, and no
  console errors were observed. Each of the three provenance trajectories first
  supplied a malformed canonical ID and then recovered with a correct successful
  call. This demonstrates fail-closed input validation and recovery, not a
  strict model pass; `verify-reports` failed. The fixture SHA-256 was
  `ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`;
  the private JSON and HTML report SHA-256 values admitted to tracked evidence
  are `4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb`
  and `3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.
  Receipt v2 recorded stable matching pre-run, post-run and loaded digests with
  `executionBound: true` for attempts 4 and 5. All five attempts failed overall and remain variance
  evidence, not a model-backed pass.

### Fixed

- Replaced host recompression equality with an exact reviewed-artefact contract.
  Pull request 16 Linux run `33354712509` exposed a gzip byte mismatch; a first
  correction normalised RFC 1952 operating-system byte 9, but rerun
  `33355108429` proved that Linux and macOS zlib also emit different valid
  DEFLATE streams. Import now preserves the exact reviewed stored gzip only
  after validating its byte length and SHA-256, boundedly decompressing it,
  validating the decoded source length and SHA-256, and matching the decoded
  bytes to the freshly fetched source byte for byte. The builder independently
  enforces the stored and decoded bindings without requiring the host
  compressor to reproduce the reviewed stream. A co-digested semantic-mutation
  regression covers the fetched-byte cross-binding. The final protected Linux
  rerun remains pending.
- Preserved the `federated_runtime_busy` code through combined and public
  WebMCP search results instead of misclassifying a busy runtime as an
  unavailable source. The human live region now distinguishes rejected input,
  a busy runtime and other failures. The post-review production build, focused
  regression set (11 of 11), complete prepared unit suite (194 of 194), Chrome
  acceptance (30 of 30, exit 0) and Microsoft Edge acceptance (30 of 30, exit
  0) passed; the earlier 187-unit result remains a pre-fix checkpoint only.
- Corrected judge-facing `collections` examples to use the executable closed-
  schema tokens `uk-living`, `ons`, `government-apis` and `land-registry`
  rather than provenance source IDs prefixed with `okf-`.

### Security

- Bound all five admitted source files to code-reviewed imported SHA-256 values
  before their bytes are trusted. The federated-search builder now also
  requires the reviewed federation-lock byte pin directly, so same-count,
  co-digested source and registry substitutions fail closed. This remediates
  High-confidence, Low-severity finding `csf_050a3c08c471d3176e0640c3` from
  immutable 55-item scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a`; its sealed
  pre-remediation evidence is retained rather than rewritten. Source-lock and
  direct-builder mutation regressions, source validation, the production build
  and all 193 prepared unit tests pass. Fresh immutable exact-range scan
  `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items against
  fixed candidate `9c6ed7d9a21574972ee564b333cbc49983058554` with zero
  reportable findings; its sealed report is retained separately.
- Completed immutable candidate scan
  `4ab29c3e-0a96-4596-b930-5eccb9b63ebc` over 50 of 50 review items. It
  dynamically reproduced three candidates: a mutable local-model identity
  receipt, aggregate-only federated population binding and cancellation-driven
  physical shard-work amplification. Attack-path review classified zero as
  reportable vulnerabilities because exploitation respectively requires
  privileged loopback model-service control, repository/build or same-origin
  write authority, or causes bounded self-availability impact only. The defects
  nevertheless affect evidence integrity or engineering resilience, so all
  three have working-tree remediations rather than being dismissed. The
  immutable rescan of the complete post-remediation tree remains pending.
- Implemented remediations for seven initial Low findings from the federated candidate
  scan: superlinear postings generation (`csf_d6045d8bfb6836f0a274850d`),
  unenforced Land Registry row limits (`csf_628dded1ed9a62431cf1f121`), mutable
  source artefacts retaining fixed-revision claims
  (`csf_a685f5df80a811659b866345`), one failing collection suppressing healthy
  sources (`csf_e9078180b75895a09a282bda`), producer self-promotion of arbitrary
  links and assertions (`csf_13ddf953dc16e399c8c04f03`), the `constructor`
  token crashing the builder (`csf_5b3f067459df708770da0536`) and concurrent
  calls amplifying uncached shard work (`csf_afca5f27e901f0db4b730cc7`). Focused
  remediation checks have passed where recorded. Sealed scan
  `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed those seven findings.
- The same sealed scan found one further High-confidence, Low-severity
  trailing-dot and secondary legislation-URL bypass
  (`csf_a2d9e030fda789ecd1cb0e41`). Generator and runtime validation were fixed
  after the scanned snapshot, and the affected focused tests passed 23 of 23
  after an earlier focused security batch passed 119 of 119. The sealed scan
  reported no other open reportable candidate, but its coverage record contains
  mechanically partial and stale-pending rows and predates this last fix. An
  immutable exact-tree rescan therefore remains pending; none of the eight
  remediations is yet release evidence. The current full unit command
  `npm run test:unit:prepared` passed 173 of 173 in `17128.154916 ms`.
- Executable federated URL validation now matches the closed schema by rejecting
  explicit ports. Projection also rejects any apex, `www` or other subdomain
  `legislation.gov.uk` result link. Same-origin response bodies are consumed
  incrementally under the fixed byte cap; malformed `Content-Length`, empty or
  missing bodies, declared overflow and streamed overflow fail closed.
- Generated-plane cleanup now retries a bounded number of times when Finder
  recreates `.DS_Store`; the production copy omits `.DS_Store`, and `dist` is
  cleaned before compilation so operating-system metadata cannot enter the
  release artefact.
- The candidate design admits only four locked, credential-free HTTPS
  publications, mirrors only declared artefacts to the same-origin build and
  applies byte, decoded-size, row, fan-out and time budgets. Unknown origins,
  redirects, traversal, a legislation collection or request, and co-digested
  semantic substitutions fail closed. The focused federation suite passed 15
  of 15 after closing an extra-searchable-collection fail-closed gap. This is
  local candidate evidence, not a completed release assurance claim.
- CI and Pages now fetch complete Git history so the release-evidence test can
  resolve and verify the retained annotated `v0.2.0-rc.2` baseline instead of
  depending on history that is present only in a developer checkout. Unit tests
  lock that workflow requirement.
- Corrected the security and competition assurance wording to distinguish the
  historical release's four root artefact families from the federated
  candidate's fifth lazy-search-manifest family.
- Expanded the partial-source browser matrix to fail A Life in the UK, ONS,
  UK Government APIs and HM Land Registry independently, while requiring every
  unaffected selected source to remain ready and usable in both Chrome and
  Microsoft Edge.

### Governance

- Recorded the current official submission boundary: entries close at 1:00 pm
  PDT on 3 September 2026; the entry must provide a public source repository
  with a visibly detectable open-source licence, a public YouTube demonstration
  under three minutes with audio, and the exact live project accessible through
  ChatGPT's in-app browser or Chrome with WebMCP enabled. The repository, live
  project and submission must remain frozen after the close. This records
  requirements only; it does not claim registration, submission or a YouTube
  upload.
- Made the judge-facing technical boundary explicit: OKF exposes governed,
  progressively retrievable evidence, while WebMCP lets a citizen-selected
  personal AI invoke bounded page actions over that evidence. The static page
  neither hosts an AI nor accepts an identity, profile or general personal-
  context object. This is a contract and architecture statement, not proof of
  end-to-end privacy, model quality or public-sector cost reduction.
- Retained annotated tag `v0.2.0-rc.2` and its public pre-release as the frozen
  pre-federation baseline at product commit
  `35fcedd39ed955278d3975a6dd80692fc6e32935`. This is a project history
  boundary that must not be moved or rewritten; it is not described as a
  GitHub-platform immutable release.
- Kept cost reduction, privacy improvement, better questions and improved
  answer quality as hypotheses requiring controlled evaluation.
- Recorded the pre-remediation local candidate checkpoint: production build; 9 of 9
  deterministic data double-build tests; 21 of 21 focused runtime and public-
  schema tests; 15 of 15 focused federation tests; 29 of 29 installed-Chrome
  Playwright tests; 6 of 6 model-free smoke calls; 144 of 144 complete unit
  tests in 174.5 seconds; and 29 of 29 installed-Microsoft-Edge Playwright
  tests in a loopback-only run after the expected sandbox socket restriction.
  The seven initial Low-finding remediations were implemented afterwards. A
  sealed follow-up scan suppressed those seven and found one further Low URL-
  boundary bypass, which was fixed post-snapshot. Focused security checks
  passed 119 of 119 and the affected post-fix subset passed 23 of 23, but the
  complete exact-tree suite and rescan were still pending at that checkpoint.
- Recorded the exact post-remediation local verification: research 4 of 4;
  successful deterministic build and data validation for 80 reviewed records,
  80 receipts, 58,655 raw federated rows, 3 quarantined rows, 58,652 searchable
  rows, 120 record shards and 1,733 postings shards; 194 of 194 prepared unit
  tests; mean nDCG@10 `0.984698009`, Recall@20 `1`, identical cold/warm results,
  no legislation collection and rejection of a legislation request; 30 of 30
  tests in installed Chrome and
  30 of 30 in installed Microsoft Edge; 6 of 6 model-free WebMCP smoke calls in
  real Chrome; zero npm-audit vulnerabilities across 162 total dependencies;
  and a clean `git diff --check`. Fresh immutable exact-range scan
  `040ad945-3723-4aef-9c03-1bb552630deb` completed all 55 review items with zero
  reportable findings. Protected-main CI and merge, Pages, current-host capture, focused manual
  accessibility evidence, passing model-backed evaluation, refreshed video and
  submission remain pending.
- Recorded that the final-candidate demonstration preflight correctly failed
  closed when no deployed commit and no explicit overwrite approval were
  supplied. It did not start live capture and is not live-capture evidence.

## [0.2.0-rc.2] - 2026-08-30

### Added

- A machine-readable `challenge-provenance.json` that distinguishes the
  research baseline from the prior public release and records pull request 9,
  the product commit, annotated pre-release, exact-main validation, Pages
  artefact and explicit remaining gates.
- Complete 30 August Pages and live-byte evidence: public release verification,
  preserved deployment metadata, a 20-file site manifest and structured proof
  that every cache-busted public response returned HTTP 200 and matched the
  deployed artefact byte for byte.
- A signed-out live-browser screenshot and journey record showing the public
  search, authoritative GOV.UK result, successful same-origin requests and clean
  console.
- A structured machine receipt records that `Codex In-app Browser` discovered
  and successfully called all five page tools against the historical tagged
  deployment; the final comparison's canonical SHA-256 matched the displayed
  result digest.
  Two associated page-owned visual records show the post-call public-page state.
  Neither those records nor the receipt-derived animation is a host recording or
  Site tools capture.
- A guarded local demonstration-video pipeline with British-English script,
  transcript and WebVTT generation, exact release/evidence validation,
  H.264/AAC/caption checks, input hashes, five genuine live-page interaction
  captures and a privacy-safe receipt visualisation generated from the
  supported-host record. Raw clips and review cuts remain ignored local output;
  human publication review remains pending and no public video is claimed.
- A fail-closed manual-VoiceOver screenshot-sequence fallback for environments
  where continuous macOS window capture is unavailable. It requires nine
  ordered, operator-declared Safari and VoiceOver frames beneath ignored local
  output; verifies the declared release identity, hashes, paths, timestamps and
  media strength from immutable in-memory bytes; blocks network access while
  rendering; and produces a visibly labelled H.264 review scene that cannot be
  mistaken for continuous footage. The builder does not independently prove
  assistive-technology use: the manual evidence record and human frame review
  remain separate hard gates.
- A manual Safari 26.5.2 and VoiceOver 10 journey using the Caption Panel,
  retained as nine hash-bound frames and a completed-with-limitations evidence
  record. The automatic spoken live-status wording and a retained heading-rotor
  selection remain unproven; no VoiceOver audio or WCAG conformance is claimed.
  The Caption Panel and VoiceOver were turned off after capture.
- A 142.920-second local review video with H.264 video, AAC synthetic narration,
  embedded English captions, separate en-GB captions, a transcript and a
  machine build receipt. The cut remains unpublished pending owner review and
  has SHA-256
  `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`.
- A read-only Devpost status record confirming completed competition
  registration while distinguishing the exact unpublished pre-submission draft
  from Devpost's broader account-level relationship label.
- A final read-only, requirement-by-requirement Devpost compliance review that
  distinguishes the completed local evidence from the still-open named
  judging-host, owner-review, public YouTube and submission gates.
- A Python development environment version-pinned to `jsonschema` 4.26.0 and
  each mandatory or Python-version-conditional runtime dependency, with a
  local/CI wrapper that installs binary distributions without dependency
  resolution, runs `pip check` and makes the research pack's JSON Schema checks
  mandatory instead of optional. The pins do not include distribution hashes,
  and a reused `.venv` can retain unrelated packages, so this is not a clean or
  fully reproducible Python supply-chain environment.
- A personal-agent WebMCP test strategy that separates page registration,
  browser execution, agent selection and submission evidence. It incorporates
  the supplied ChatGPT research as a secondary input and corrects it against
  primary Chrome, Microsoft and Google Chrome Labs sources.
- ADR-0003 records the citizen-selected-agent boundary, optional callback
  compatibility and four-layer independent assurance decision without claiming
  measured savings, default privacy or general host support.
- Pinned `chrome-devtools-mcp` 1.8.0 and `webmcp-evals` 0.0.4 development
  harnesses. The deterministic evaluator requires six calls across all five
  tools to return `ok: true` in their expected result-schema envelopes, while
  the browser fixture adds context minimisation and a no-call case for a later
  fixed-model selection run.
- A fail-closed model-backed browser-evaluation wrapper with explicit model and
  remote-provider acknowledgement, bounded repeated runs, loopback-only local
  model preflight, exact context-minimisation checking, private reports and
  sanitised receipts. It validates and rejects any upstream console error or
  `pageerror`; accepted receipts record `browserConsoleErrorCount: 0` and
  `browserConsoleErrorsAccepted: false`. At this `0.2.0-rc.2` history
  checkpoint no model-backed run had yet been performed; three later candidate
  attempts are recorded under Unreleased and all failed overall.
- A repeatable local setup for Microsoft WebMCP Explorer 0.1.0 pinned to commit
  `f7091c12420e713b11361630dc1649d5678f62ab`. It built twice idempotently in
  isolated ignored `.tools/webmcp-explorer-build/` and left the source checkout
  clean, while the clean-output allow-list passed. The recorded source-tree,
  package-lock and unpacked-extension file-manifest SHA-256 values are
  `b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
  `76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
  and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
  The script does not load the extension, change browser flags or configure a
  provider.
- The model-free evaluator smoke and its machine receipt are now part of pull-
  request and `main` CI, using the runner-installed stable Chrome rather than a
  downloaded browser.
- A separate Chrome DevTools MCP public-target mode that accepts only the exact
  project Pages URL, validates and hashes its deployment metadata, optionally
  requires the protected-main commit, skips the loopback server and writes an
  ignored review-before-publication receipt.
- Post-deployment evidence for corrected main commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, published by Pages run
  `33323152751`. Chrome DevTools MCP 1.8.0 discovered and successfully called
  all five tools against that public deployment with zero console errors.
- Native Chrome WebMCP-panel evidence in which all five valid calls completed. A
  search using the out-of-range `limit: 21` returned the expected structured
  rejection. Both presentation tools updated the visible page; the comparison
  showed 11 facet rows and its displayed digest prefix matched the canonical
  result.
- A technical review receipt for the unchanged 142.920-second video candidate:
  the complete video/audio decode, 4,284-frame count and all 38 caption cues
  passed, with one non-fatal subtitle metadata warning retained. The receipt
  explicitly excludes audible content-parity, owner playback and publication
  approval.
- A refreshed authenticated read-only Devpost receipt at
  `2026-08-30T17:57:48Z`. Project `1406973` remains `Untitled`, blank and
  `submission_pre_draft`, with no video URL, publication timestamp, submission
  timestamp or completed human attestations. No Devpost state was changed.
- A post-deployment evidence unit gate covering corrected Pages bindings,
  public Chrome and native-panel execution, screenshot privacy review, the
  technical-video boundary and the live unsubmitted Devpost state.

### Changed

- Raised the development Node.js floor to 22.12.0 to match the pinned WebMCP
  evaluator and made three unnecessary transitive dependency install scripts
  explicitly denied.
- Expanded the current unit suite to 100 tests. Configured the CI and
  Pages workflows to install Node dependencies with
  `npm ci --ignore-scripts --no-audit`; Pages also installs the version-pinned
  Python requirements before mandatory research validation and semantic WebMCP
  smoke before deployment. The protected integration and Pages path ran these
  definitions before deploying corrected main in run `33323152751`.
- Changed the smoke receipt to retain semantic counts and a results digest after
  deleting the raw evaluator rows. Only the ignored DevTools receipt retains
  full tool outputs.
- Documented the intended division of responsibility: the static page publishes
  bounded, source-linked tools, while a citizen-selected agent may use personal
  context to choose them. A remote model provider may still receive prompt and
  tool data; only a correctly configured local model keeps inference local.

### Fixed

- Encoded the CI and Pages Python install command as a folded YAML scalar. The
  original unquoted `--only-binary=:all:` token ended with a colon before
  whitespace, so GitHub rejected both workflow files before creating a job.
  A unit regression now protects the parse-safe form.
- Capped the rendered VoiceOver screenshot sequence at its validated manifest
  duration so ffmpeg cannot turn the repeated final still into an additional
  hold; the post-encode probe still rejects output that is short or otherwise
  differs from the declared duration.
- Corrected the authoritative-link frame label to claim its visually supported
  accessible name, not a displayed URL, and extended the narration so the final
  accessible-name and focus-restoration frames are present in the review cut.
- Made the weak-image media fixture use an even-sized frame so Ubuntu and
  macOS `ffmpeg` both exercise the same fail-closed screenshot validation.
- Installed `ffmpeg` explicitly in validation and Pages jobs so the guarded
  VoiceOver media-integrity tests run in GitHub Actions rather than depending on
  runner image contents.
- Tightened the British-English demonstration narration after exact macOS
  synthesis measured the first draft at 185.842 seconds. The revised seven-scene
  track measures 142.826 seconds, leaving a 37.174-second rules margin before
  final encoding.
- Stabilised the narrow-screen keyboard acceptance check by sending Enter to
  the already focused trace and search controls while retaining explicit focus
  assertions.
- Made browser acceptances that inspect initial evidence or issue tool actions
  wait for the application’s settled `ready` state. This removes Linux CI races
  in cancelled-call and deeply nested rejection recovery while preserving the
  semantic assertions.
- Isolated the Trace and search keyboard checks from the preceding skip-link
  hash navigation, retaining real keyboard activation and focus assertions
  without allowing its asynchronous route render to replace the focused node.
- Made every WebMCP callback accept a host that omits the optional execution
  options object. Chrome DevTools MCP 1.8.0 exposed the defect in the public
  tagged release; corrected main retains cancellation when a signal is supplied.
  The correction is deployed from
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and passed five public Chrome
  DevTools MCP calls with zero console errors.

### Security

- Enabled GitHub secret scanning and push protection after the repository
  became public, while retaining strict protected-branch validation.
- Hardened the SHA-256 evidence test to require bytewise ordered, unique,
  canonical repository-relative paths; reject POSIX and Windows absolute paths,
  backslashes, traversal, symbolic links, non-regular files and paths resolving
  outside the repository; cover exactly all release data, retained evidence, the
  package lock and schemas; and verify every retained digest.
- Added semantic agreement checks across the 20-file deployed-site manifest,
  structured live observations, deployment metadata and challenge provenance.
- Isolated the new DevTools and evaluator browser runs to loopback-only clean
  profiles. Model-free third-party child processes receive a small environment,
  an isolated `HOME` and no forwarded provider credential environment
  variables; they still retain the operating-system filesystem access of the
  invoking user. Receipts have private permissions under ignored paths, with
  explicit retention and remote-provider boundaries.
- Set `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1` in the hardened DevTools runner.
  An earlier pre-hardening run wrote
  `~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST; the final 15:53 BST
  rerun left that modification time unchanged. The ignored receipt remains the
  only evaluator receipt with full tool outputs.
- Statically triaged the Microsoft WebMCP Explorer npm advisories on 30 August
  2026 as not reachable in the exact production build path. Operational risks
  remain: `<all_urls>` access, persistent credentials in
  `chrome.storage.local`, `dangerouslyAllowBrowser`, no prompt-injection
  mitigation and autoexecution in Agent Run/Chat. The extension was not loaded
  and received no credential.

### Governance

- Advanced the status, handover, implementation plan, backlog, build brief,
  source/asset/evaluation registers, demonstration draft and compliance
  checklists in lockstep with the protected release and public evidence.
- Advanced the machine provenance and active submission checklists for the
  completed manual observation, guarded preflight, local video build and final
  read-only review. At that checkpoint the named-host, owner-review, public-
  video and submission gates remained open.
- Recorded that GitHub published the pre-release before the annotated tag
  reference was replaced to correct its tagger identity; the product commit and
  deployed bytes did not change.
- Kept the post-tag verification record separate from the immutable
  `v0.2.0-rc.1` product commit. At that checkpoint, supported-host WebMCP was
  observed only for the named Codex in-app browser and recorded time.
  Registration, the bounded manual screen-reader journey and local video build
  were complete; later corrected-main host evidence is recorded separately.
- Kept the corrected local host-compatibility result separate from the unchanged
  public `v0.2.0-rc.1` bytes. Microsoft WebMCP Explorer browser loading and any
  model-backed evaluator run remain pending. The documented Explorer route uses
  a disposable profile, Tools inspection without credentials, then a local
  loopback model and Agent Step, followed by profile deletion; a necessary
  remote run must use a revocable low-limit key and no personal context.
- Preserved `v0.2.0-rc.1` at
  `9235ee5db4df637bdb2a12e87449e871614afe68` as historical evidence while
  recording corrected main and Pages run `33323152751` separately. The existing
  142.920-second local video candidate and its digest remain unchanged; owner
  playback and publication approval, public upload, final Devpost submission
  and release-platform SBOM or attestation remain open.
- Integrated the post-deployment evidence, deterministic evidence tests and
  lockstep documentation through protected pull request 13 as repository
  commit `5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`; exact-main validation run
  `33327860583` passed. No Pages deployment or public application-byte change
  was made by that evidence-only integration.
- Added a Should 12 measurement task for the E-34 public-service cost-boundary
  hypothesis. No saving is claimed without a comparable server-side baseline,
  page-tool measurements and declared whole-system assumptions.

## [0.2.0-rc.1] - 2026-08-30

### Added

- A digest-bound Evidence Trace for the worked question “Which GOV.UK sources
  should I check after a baby is born?”, generated from one locked answer pack
  and three existing catalogue records.
- An analytical-index-first human view, a text-labelled interactive Evidence
  Trace, an accessible relationship table, separate foundation details and a
  two-to-four-claim comparison without a combined trust score.
- Eight independently visible evidence facets: authority, assertion,
  verification, freshness, integrity, access, rights and coverage.
- `explore_answer_foundations` and `compare_evidence_foundations` WebMCP tools
  over the same deterministic action controller as the human interface.
- A digest-bound 10-entry corpus admission manifest. Two reviewed collections
  provide all 80 searchable records; eight entries remain described-only,
  conditional, contract-only or quarantined and contribute no searchable
  payload.
- Exact locks for the authored answer pack and corpus admissions, bringing the
  source-lock registry to four required ID/path/count bindings.
- Deterministic Evidence Trace and federation builders, checksum sidecars and
  closed JSON Schemas, bringing the published contract set to 20 schemas.
- Browser coverage for history and focus restoration, rejected deeply nested
  tool input, oversized and malformed fragment routes, Evidence Trace and
  federation tampering, and the expanded WCAG 2.2 journey.
- Dated Chrome, Edge, accessibility, link-health, SBOM, visual and security
  evidence for the candidate.
- An executable release-evidence check that verifies every path and digest in
  `docs/competition/evidence/SHA256SUMS`.
- A regression check that preserves the 29 August research-seed examples as
  byte-bound historical illustrations and prevents them being mistaken for
  current 0.2 contracts.

### Changed

- The complete validation command now builds once, then runs prepared unit and
  browser stages against that same artefact; standalone unit and browser
  commands retain their own build prerequisite.
- Advanced the package candidate from `0.1.0-rc.1` to `0.2.0-rc.1`.
- Split tool effects truthfully: search, exact record and provenance remain
  read-only; the two exploration tools declare their reversible in-memory page
  presentation effect with `readOnlyHint: false`.
- Enabled the accessible human interface immediately after all four artefact
  families validate, without waiting for WebMCP registration to settle.
- Replaced separate human/tool execution paths with one cancellable action
  controller and deterministic result/display digest diagnostics.
- Made `npm run data:build` validate all four source locks before rebuilding the
  catalogue, receipts, Evidence Trace and federation manifest.
- Recorded source-native `sourceOkfCore` separately from the descriptive
  `targetOkfCore: "0.2"` mapping; target mapping does not claim native OKF 0.2
  conformance or admit producer payload.
- Updated project, handover, architecture, tool, backlog, accessibility,
  security, privacy, demo and submission-draft documentation in lockstep.
- Pinned Python 3.14.6 and the exact `actions/setup-python` revision in both CI
  and Pages workflows so the research verifier does not depend on runner drift.
- Labelled the dated CycloneDX SBOM as the local macOS ARM64 dependency view;
  release-platform SBOM evidence remains a separate release task.

### Fixed

- Made executable record admission match the closed profile schemas, including
  nested source, licence, assertion, limitation, boundary and relation fields;
  co-digested schema-invalid records now fail before runtime use.
- Bound every receipt field to its catalogue record and derived identifier, and
  reject duplicate normalised filters instead of accepting inputs forbidden by
  `uniqueItems`.
- Aligned canonical record-ID, GOV.UK/GitHub URL, RFC 3339 timestamp and
  federation decision bounds across JSON Schema and all executable validators.
- Restricted Evidence Trace relationships to their admitted endpoint domains,
  rejected unused contradiction nodes and kept comparison limitations sourced
  only from limitation nodes.
- A rejected evidence-presentation request no longer leaves the worked answer
  summary stuck in an error state; the next valid request redraws the complete
  trace, and rejected WebMCP actions now report that no display update occurred.
- Closing a comparison opened by WebMCP now restores focus to the human compare
  control even though there was no human trigger element to remember.
- Regenerated the dated candidate SBOM so its component identity is
  `0.2.0-rc.1`, and added an executable release-evidence assertion for that
  version.
- Rejected tool input is no longer serialised or recursively canonicalised for
  diagnostics. A shallow admitted-data projection is hashed only for successful
  requests; rejected input is displayed as “Not retained for rejected input”.
- Public fragment routes are bounded before parsing and comparison values are
  bounded before splitting. Oversized routes reset to the default evidence view
  with a visible explanation instead of exhausting or disabling the page.
- Every standalone builder now consumes the exact regular-file bytes returned
  by a shared, closed source-lock validator, so missing, extra, redirected,
  swapped, symlinked or changed source entries fail before generation.
- Added a path-scoped `cr-at-eol` Git attribute for the preserved competition
  CSVs, allowing ordinary `git diff --check` without rewriting seeded line
  endings.
- Corrected documentation so expandable structured output is not called a
  download.
- Clarified the separate exact federation-repository allowlist instead of
  implying that GitHub repository links use the official-source host policy.
- Bound the candidate catalogue to exactly 80 records in both schema and
  executable validation, and made federation admission cross-check that same
  validated count so a coherently re-digested smaller bundle fails closed.
- Rejected whitespace-padded record identifiers in executable lookup so exact
  record and provenance behaviour matches the published anchored schemas.

### Security

- Completed a formal diff scan of the Evidence Trace/federation candidate. Two
  low-severity robustness findings were reproduced, fixed and independently
  re-reviewed with no bypass found.
- Completed and retained a later immutable 44-item candidate snapshot scan
  with no reportable finding, together with an explicit reviewed-delta record
  for the stricter changes made after that snapshot.
- Added common root-input budgets, bounded diagnostic values, truncated unknown
  field names and fail-closed tests for deeply nested, cyclic, `BigInt`, broad
  and accessor-bearing input.
- Retained the static same-origin boundary, credential-free admitted HTTPS
  hosts, inert source-derived text, closed schemas, CSP, no query storage and no
  runtime provider request.
- Refreshed the dependency audit with zero known vulnerabilities and the link
  audit with 161 of 161 admitted official URLs responding to the bounded check.

### Governance

- Preserved the page-scoped experiment boundary: this is not a durable MCP
  gateway, provider integration, service-operation layer, official GOV.UK
  service or eligibility decision system.
- Kept rights, access and population claims item- or collection-specific. A
  descriptor in the estate table does not grant permission to copy or search a
  producer payload.
- Retained the recorded GOV.UK historical-revision, ONS checksum-sidecar and
  unversioned/unlicensed `okf-testing` limitations.
- Kept competition registration and Devpost submission as explicit unperformed
  gates. Updating the submission draft is not a submission.

## [0.1.0-rc.1] - 2026-08-29

### Added

- An 80-record, 80-receipt catalogue comprising 69 locked GOV.UK records and
  11 reviewed official API, dataset and catalogue records.
- Accessible human search, filters, exact record and provenance views over the
  same deterministic runtime as three imperative WebMCP tools.
- Source, record, bundle, receipt and raw-file SHA-256 validation; nine closed
  input/output contracts; unit, Chrome, Edge and accessibility checks.
- Public security, privacy and accessibility documents, a sanitised CycloneDX
  SBOM, 161-URL link-health evidence and an exact-commit Pages workflow.

### Fixed

- Direct `file://` opening now replaces the apparent permanent “Verifying…”
  state with instructions to serve the application over HTTP.
- WebMCP registration has a three-second rollback timeout and cannot hold the
  verified human interface unavailable.
- The Pages workflow can publish only a manually selected exact `main` commit.

### Governance

- Published the repository and exact-commit Pages artefact through protected
  pull requests and recorded signed-out live-browser verification.
- Applied MIT to original project code while retaining source-specific rights,
  attribution, access and endorsement boundaries.
- Preserved competition registration and Devpost submission as separate,
  unperformed actions.

[Unreleased]: https://github.com/chris-page-gov/govuk-webmcp/compare/v0.2.0-rc.2...HEAD
[0.2.0-rc.2]: https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.2
[0.2.0-rc.1]: https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1
[0.1.0-rc.1]: https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.1.0-rc.1
