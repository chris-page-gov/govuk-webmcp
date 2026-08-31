# 20. Repository and release structure

## 20.1 Current repository decision

The implementation is in the dedicated public repository
`chris-page-gov/govuk-webmcp`. The preserved research pack and baseline commit
remain in this repository, so the release adds evidence without
erasing its ancestry.

The evidence-first extension was first retained as the annotated
[`v0.2.0-rc.1` pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1)
at commit `9235ee5db4df637bdb2a12e87449e871614afe68`. The corrected public
product was integrated through [pull request
12](https://github.com/chris-page-gov/govuk-webmcp/pull/12) at protected-main
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`. Historical exact-main validation run
`33323068982` and Pages run `33323152751` passed. Those observations remain
historical. Competition registration is complete. Devpost project `1406973`
remains an unpublished pre-submission draft and has not been submitted.

Package version `0.3.0-rc.1` identifies the current released federated product.
It keeps the frozen release history and adds four checksum-bound federated source
snapshots totalling 58,655 locked raw rows. Three standalone Land Registry
legislation rows are quarantined, leaving 58,652 searchable federated records,
separately from the 80 reviewed records and receipts. Pull-request validation
run `33356087333`, protected-main run `33356272534` and exact-commit Pages run
`33356452048` passed for product commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`, which is retained as annotated tag
`v0.3.0-rc.1` and deployed at
<https://chris-page-gov.github.io/govuk-webmcp/>. The tree below records that
released shape. Current-release VoiceOver and local final-video technical
evidence are complete. An isolated Chrome 152 / Chrome DevTools MCP 1.8.0
receipt also binds five completed WebMCP calls to the exact release. Owner
review, public upload and player verification, the optional fixed-model gate,
final live-rules and form review, and Devpost submission remain separate and
open.

## 20.2 Implemented tree

```text
govuk-webmcp/
├── README.md
├── PROJECT_STATUS.md
├── CODEX_HANDOVER.md
├── CHANGELOG.md
├── LICENSE
├── NOTICE.md
├── DISCLAIMER.md
├── ACCESSIBILITY.md
├── PRIVACY.md
├── SECURITY.md
├── SEED-MANIFEST.sha256
├── package.json
├── package-lock.json
├── requirements-dev.txt          # exact Python research-verifier versions
├── tsconfig.json
├── playwright.config.mjs
├── app/
│   ├── index.html                 # analytical-index-first interface
│   ├── main.ts                    # accessible rendering and bounded hash routes
│   ├── style.css
│   ├── startup-watchdog.js
│   ├── favicon.svg
│   └── data/
│       ├── catalogue.json              # 80 records
│       ├── catalogue.json.sha256
│       ├── receipts.json               # 80 packaged receipts
│       ├── receipts.json.sha256
│       ├── evidence-traces.json        # 1 Evidence Trace
│       ├── evidence-traces.json.sha256
│       ├── federation.json             # released 10-admission projection
│       ├── federation.json.sha256
│       ├── federated-search/           # ignored generated plane; copied to dist
│       │   ├── manifest.json
│       │   ├── manifest.json.sha256
│       │   ├── records/                # generated record shards
│       │   └── postings/               # generated lazy-search shards
│       └── sources/
│           ├── source-locks.json       # released five-entry registry
│           ├── govuk-content-69.lock.json
│           ├── curated-api-data.json
│           ├── answer-packs.json       # 1 authored answer pack
│           ├── corpus-admissions.json  # 10 authored decisions
│           ├── okf-federation-lock.json # authored four-source control metadata
│           └── okf-federation/         # 73 versioned checksum-bound gzip imports
│               ├── uk-living/
│               ├── ons/
│               ├── government-apis/
│               └── land-registry/
├── evals/
│   ├── webmcp-smoke.json          # model-free concrete five-tool calls
│   ├── webmcp-browser.json        # prepared model-selection and no-call cases
│   └── federated-search-quality.json # frozen authored lexical-quality fixture
├── src/
│   ├── contracts.ts
│   ├── integrity.ts
│   ├── evidence-runtime.ts
│   ├── federation-runtime.ts
│   ├── okf-federated-contracts.ts # fixed four-source and resource-budget contract
│   ├── federated-search-runtime.ts # lazy checksum-bound source-snapshot search
│   ├── combined-knowledge-runtime.ts # common reviewed and federated results
│   ├── application-actions.ts     # shared human and WebMCP controller
│   └── webmcp-tools.ts            # 5 fixed imperative registrations
├── schemas/                        # 31 released closed JSON Schemas
│   ├── catalogue.schema.json
│   ├── evidence-receipt.schema.json
│   ├── evidence-trace.schema.json
│   ├── evidence-trace-collection.schema.json
│   ├── federation-manifest.schema.json
│   ├── answer-pack-source.schema.json
│   ├── corpus-admission-source.schema.json
│   ├── search-government-knowledge-*.schema.json
│   ├── get-resource-record-*.schema.json
│   ├── show-provenance-*.schema.json
│   ├── explore-answer-foundations-*.schema.json
│   ├── compare-evidence-foundations-*.schema.json
│   ├── combined-reviewed-record-summary.schema.json
│   ├── combined-search-result.schema.json
│   ├── federated-error-result.schema.json
│   ├── federated-postings-shard.schema.json
│   ├── federated-provenance-result.schema.json
│   ├── federated-public-record-summary.schema.json
│   ├── federated-record-shard.schema.json
│   ├── federated-resource-record-result.schema.json
│   ├── federated-search-manifest.schema.json
│   ├── federated-search-result.schema.json
│   ├── okf-federation-lock.schema.json
│   └── error-result.schema.json
├── scripts/
│   ├── validate-authored-sources.mjs
│   ├── build-catalogue.mjs
│   ├── build-evidence.mjs
│   ├── run-federated-search-quality.mjs # nDCG@10/Recall@20 deterministic gate
│   ├── build-federation.mjs
│   ├── import-okf-federation.mjs  # controlled exact-source acquisition
│   ├── build-federated-search.mjs # deterministic ignored search projection
│   ├── validate-generated.mjs
│   ├── copy-static.mjs
│   ├── audit-catalogue-links.mjs
│   ├── sanitise-sbom.mjs
│   ├── write-deployment-metadata.mjs
│   ├── verify-research-pack.sh    # exact jsonschema gate and seed verifier
│   ├── capture-chrome-devtools-webmcp.mjs # guarded isolated five-tool MCP capture and evidence admission
│   ├── run-webmcp-evals-smoke.mjs # model-free pinned browser smoke wrapper
│   ├── run-webmcp-evals-browser.mjs # explicit-model, private browser eval wrapper
│   ├── setup-webmcp-explorer.sh # pinned isolated Explorer source and build
│   ├── build-demo-video.mjs        # guarded local review cut, captions and transcript
│   ├── build-host-evidence-clip.mjs # labelled receipt visualisation, not host video
│   ├── build-voiceover-screenshot-clip.mjs # guarded and visibly labelled screenshot sequence
│   ├── build-preview-scene-clips.mjs # explicitly non-live editorial previews
│   ├── capture-live-demo-clips.mjs # exact-release genuine interaction capture
│   ├── write-evidence-manifest.mjs # fail-closed allowlisted digest manifest
│   └── lib/
│       ├── deterministic-json.mjs
│       ├── webmcp-evals-harness.mjs # validated fixture, server and receipt helpers
│       └── source-locks.mjs       # exact path, file and code-reviewed digest pins
├── tests/
│   ├── unit/
│   │   ├── knowledge-runtime.test.mjs
│   │   ├── evidence-federation.test.mjs
│   │   ├── combined-knowledge-runtime.test.mjs
│   │   ├── federated-search-runtime.test.mjs
│   │   ├── federated-public-output-schema.test.mjs
│   │   ├── okf-federated-contracts.test.mjs
│   │   ├── okf-federation-data.test.mjs
│   │   ├── source-locks.test.mjs
│   │   ├── demo-video.test.mjs
│   │   ├── voiceover-screenshot-clip.test.mjs
│   │   ├── python-test-environment.test.mjs
│   │   ├── webmcp-evals-harness.test.mjs
│   │   ├── post-deployment-evidence.test.mjs
│   │   └── release-evidence.test.mjs
│   └── browser/
│       └── knowledge.spec.mjs
├── profiles/
│   └── trusted-govuk-discovery.profile.jsonld
├── examples/                       # preserved 29 August research seed
│   ├── DIGEST-METHOD.md             # historical non-contract boundary
│   ├── catalogue.example.json       # frozen illustrative bytes
│   └── evidence-receipt-example.json # frozen illustrative bytes
├── docs/
│   ├── adr/
│   │   ├── 0000-repository-seed-and-competition-boundary.md
│   │   ├── 0001-static-same-origin-webmcp-boundary.md
│   │   ├── 0002-evidence-first-federation-and-presentation-tools.md
│   │   ├── 0003-citizen-selected-agent-and-independent-assurance.md
│   │   └── 0004-okf-federated-discovery-and-evidence-tiers.md
│   └── competition/
│       ├── architecture.md
│       ├── tool-catalogue.md
│       ├── demo-storyboard.md
│       ├── federated-demo-storyboard.md
│       ├── demo-video-script.json
│       ├── demo-captions.en-GB.vtt
│       ├── demo-transcript.md
│       ├── evidence-manifest-registry.json
│       ├── devpost-submission-draft.md
│       ├── final-devpost-compliance-review-2026-08-30.md
│       ├── final-devpost-compliance-review-2026-08-31.md
│       ├── post-deployment-devpost-compliance-review-2026-08-30-edd4ce6.md
│       ├── personal-agent-webmcp-test-strategy.md
│       ├── okf-federated-personal-agent-evaluation-plan.md # A–M gates
│       ├── evaluation-set.csv
│       ├── implementation-plan.md
│       ├── backlog.md
│       └── evidence/
│           ├── security-scan-2026-08-29/
│           ├── security-diff-scan-2026-08-29/
│           ├── security-scan-2026-08-30/
│           ├── security-candidate-snapshot-2026-08-30/
│           ├── security-scan-and-remediation-2026-08-30.md
│           ├── candidate-verification-2026-08-30.md
│           ├── accessibility-test-2026-08-30.md
│           ├── evidence-first-overview-2026-08-30.png
│           ├── evidence-foundation-comparison-2026-08-30.png
│           ├── challenge-provenance.json
│           ├── supported-host-webmcp-capture-2026-08-30.json
│           ├── supported-host-webmcp-capture-v0.3.0-rc.1.json
│           ├── supported-host-webmcp-clip-v0.3.0-rc.1.json
│           ├── supported-host-webmcp-raw-receipt-v0.3.0-rc.1.json
│           ├── supported-host-webmcp-runtime-summary-2026-08-30.jpg
│           ├── supported-host-webmcp-full-page-2026-08-30.jpg
│           ├── chrome-devtools-mcp-2026-08-30-edd4ce6.json
│           ├── chrome-devtools-mcp-v0.3.0-rc.1.json
│           ├── native-devtools-webmcp-2026-08-30-edd4ce6.json
│           ├── native-devtools-webmcp-completed-2026-08-30-edd4ce6.jpeg
│           ├── native-devtools-webmcp-invalid-input-2026-08-30-edd4ce6.jpeg
│           ├── public-deployment-verification-2026-08-30-edd4ce6.md
│           ├── public-deployment-verification-v0.3.0-rc.1.md
│           ├── demo-live-interaction-capture-2026-08-30.json
│           ├── demo-live-interaction-capture-v0.3.0-rc.1.json
│           ├── manual-voiceover-journey-2026-08-30.json
│           ├── manual-voiceover-journey-v0.3.0-rc.1.json
│           ├── demo-video-build-2026-08-30.json
│           ├── demo-video-build-v0.3.0-rc.1.json
│           ├── demo-video-technical-review-2026-08-30.json
│           ├── demo-video-technical-review-v0.3.0-rc.1.json
│           ├── devpost-read-only-status-2026-08-30.json
│           ├── devpost-read-only-status-2026-08-30-edd4ce6.json
│           ├── devpost-read-only-status-v0.3.0-rc.1.json
│           ├── demo-scene-01-overview-2026-08-30.jpg
│           ├── demo-scene-02-evidence-trace-2026-08-30.jpg
│           ├── demo-scene-03-foundation-facets-2026-08-30.jpg
│           ├── demo-scene-04-comparison-2026-08-30.jpg
│           ├── demo-scene-07-evidence-estate-2026-08-30.jpg
│           ├── live-artifact-verification-2026-08-30.json
│           ├── live-artifact-verification-2026-08-30-edd4ce6.json
│           ├── live-artifact-verification-v0.3.0-rc.1.json
│           ├── live-deployment-metadata-2026-08-30.json
│           ├── live-deployment-metadata-2026-08-30-edd4ce6.json
│           ├── public-live-search-2026-08-30.png
│           ├── public-release-verification-2026-08-30.md
│           ├── site-SHA256SUMS-2026-08-30
│           ├── site-SHA256SUMS-2026-08-30-edd4ce6
│           ├── link-health-2026-08-30.json
│           └── sbom-2026-08-30.cdx.json  # local macOS ARM64 dependency view
├── research/2026-08-29/        # preserved research seed and pack
├── governance/
│   ├── assurances/
│   └── checklists/
└── .github/
    ├── dependabot.yml
    └── workflows/
        ├── ci.yml
        └── pages.yml
```

In released `v0.3.0-rc.1`, `app/data/sources/source-locks.json` contains
five registry entries. Four retain the frozen reviewed inputs; the fifth binds the project-authored
`okf-federation-lock.json`. That federation lock allows exactly four publication
identities and 73 versioned gzip artefacts under
`app/data/sources/okf-federation/`, totalling 13,021,675 stored bytes. The gzip
files are checksum-bound imported producer metadata, not generated projections
or project-authored content.

`app/data/federated-search/` is an ignored deterministic projection of those
locked imports. The current build produces 1,853 shard files — 120 record
shards and 1,733 postings shards — plus the manifest and checksum sidecar, for
1,855 files and 127,747,020 bytes in total. `scripts/copy-static.mjs` copies the
validated plane into `dist` for publication. Do not regenerate an authored lock from its projection,
edit a vendored source artefact by hand or treat generated normalisation as a
new licence for producer material.

The released 10-entry corpus federation manifest records
6 searchable admissions—2 reviewed deep-evidence collections and 4 federated
source snapshots—and 4 non-searchable admissions. The release has 5 registry
entries and 31 closed schemas. UK Legislation remains
an explicitly quarantined descriptor with no standalone collection, payload,
index or runtime request. Exactly three standalone Land Registry legislation
rows are quarantined, and the searchable projection exposes zero
`legislation.gov.uk` result links. A descriptor alone does not include or admit
a producer payload, and the 28 inert source-authored cross-references in allowed
snapshots do not create a fifth federated source.

Federated trust is not promoted by producer wording. Public links retain
producer-declared roles, exact-record authority is “Not independently
established”, and the human interface displays the recorded destination
hostname. Nine Low security findings have implemented remediations. Sealed
scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven and found
`csf_a2d9e030fda789ecd1cb0e41`, fixed post-snapshot; its coverage is
mechanically partial and stale-pending. Focused checks passed 119 of 119 then 23
of 23 for the affected post-fix subset. The full unit command passed 173 of 173
in `17128.154916 ms`. Exact-range scan
`2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` later retained ninth finding
`csf_050a3c08c471d3176e0640c3`; separately code-reviewed pins for all five
sources, a direct builder lock-byte check and mutation regressions remediate
it. Fresh immutable scan `040ad945-3723-4aef-9c03-1bb552630deb` completed 55
of 55 review items against exact fixed-tree commit
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings. Its
scope predates the later reviewed-gzip and referenced import-deadline
corrections; focused checks and the protected release workflows evidence those
later deltas separately.

The repository also pins `jsonschema` 4.26.0 and each mandatory or
Python-version-conditional runtime dependency in `requirements-dev.txt`;
`npm run python:setup` creates or reuses ignored `.venv`, installs the exact
binary distributions with no dependency resolution and runs `pip check`.
`npm run research:verify` checks the exact version before running the preserved
pack verifier. The version pins do not include distribution hashes, and a
reused `.venv` can retain unrelated packages, so the environment is not clean
or fully reproducible. The CI and Pages definitions use
`npm ci --ignore-scripts --no-audit`; Pages also installs these Python
requirements and runs semantic WebMCP smoke before deployment. These workflow
paths passed for the historical corrected deployment and again for public
`v0.3.0-rc.1`: pull-request validation `33356087333`, protected-main validation
`33356272534` and Pages run `33356452048` passed.

`chrome-devtools-mcp` 1.8.0 and `webmcp-evals` 0.0.4 are exact development
dependencies. `npm run webmcp:devtools:capture` and
`npm run webmcp:eval:smoke` write review-before-publication receipts under
ignored `.evals/`. Only the DevTools receipt retains full tool outputs. The
model-free smoke wrapper validates six `ok: true` expected-schema envelopes,
deletes the raw rows and retains counts plus a results digest. It forwards no
provider credential environment variables and gives the child an isolated
`HOME`, but the child retains the operating-system filesystem access of the
invoking user. The tracked fixtures live under `evals/`; the eight-case browser
fixture has been executed five times with Chrome 152, `webmcp-evals` 0.0.4 and
exact loopback-only `ollama:gpt-oss:20b`, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
All attempts failed the strict gate. The first three reported 8 of 102 retry-
expanded rows; 33 of 33 upstream but 32 of 33 strict; then 30 of 35 upstream.
Attempt 4 retained a null evaluation after structural validation failed;
attempt 5 retained 30 pass and 6 fail across 36 reported rows and failed
`verify-reports`. These
harnesses exercise the corrected candidate, whose tool callbacks now
tolerate an omitted execution-options argument. The unchanged, checksum-bound `v0.2.0-rc.1`
tag predates that fix; the corrected protected-main deployment contains it.

The DevTools runner also has a strictly allowlisted post-deployment mode for
the exact project Pages URL. It validates `deployment.json` and an optionally
required protected-main commit before capture, skips the local server and
writes `.evals/chrome-devtools-mcp-public.json`. The mode completed against
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` and Pages run
`33323152751`; the reviewed receipt records the exact five tools, five completed
calls, closed-input rejection and zero console errors.

`npm run webmcp:explorer:setup` built Microsoft WebMCP Explorer 0.1.0 at commit
`f7091c12420e713b11361630dc1649d5678f62ab` twice idempotently in isolated
ignored `.tools/webmcp-explorer-build/`, leaving the source checkout clean. The
clean-output allow-list passed. The recorded source-tree, package-lock and
unpacked-extension file-manifest SHA-256 values (the latter over sorted per-file
hashes and paths) are
`b7d7bf5657c4ae119da98b94914eefd9ed6dfbff38b59ddf7f5be3800d0da39f`,
`76e6d32e1aa0ba30db72b4c39b47a424f0804625f76ce513c9e2f3565be8ca6e`
and `c7070199bc0ef28baeee716c437b4603d576b10b4c4b3f7ca98dac9123b0e9e1`.
Static advisory triage and the remaining privileged-extension risks are
documented in `SECURITY.md`. No Explorer browser execution or model selection
has been performed.

## 20.3 Semantic and service boundaries

Each corpus admission stores the producer's `sourceOkfCore` separately from the
release's `targetOkfCore` 0.2. `sourceOkfCore` may be 0.1, 0.2 or undeclared;
the target field records the intended crosswalk and does not rewrite producer
history.

The repository contains a page-scoped static WebMCP application. It does not
contain a durable MCP gateway, provider credentials, provider execution or
government service operations. The 80 packaged receipts are build artefacts,
not receipts created by tool calls.

## 20.4 Published evidence and remaining gaps

Public `v0.3.0-rc.1` is bound to product commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. Pull-request validation
`33356087333`, protected-main validation `33356272534` and exact-commit Pages
run `33356452048` passed. The annotated tag peels to that commit. All 1,879
regular files in Pages artefact `9745316971`, totalling 128,548,215 bytes,
returned HTTP 200 and matched the public deployment byte for byte.

Codex In-app Browser (Browser plugin `26.825.32147`) discovered and executed all
five tools against that public release, rejected an unrelated `personalContext`
field and produced a comparison whose canonical and displayed digests matched.
No model selected a tool and no model provider was called. The paired motion
scene is explicitly a receipt reconstruction, not a host-owned recording. Five
genuine, silent public-page interaction clips are also bound to the exact
release; agent privacy and branding review passed, while owner publication
review remains open.

The fresh current-release Safari and VoiceOver Caption Panel journey is now
admitted as completed-with-limitations evidence: 7 of 9 checkpoints passed and
2 retained limitations. Its nine-frame media is a 27-second non-continuous
screenshot sequence without captured VoiceOver speech audio or a WCAG
conformance claim. The guarded pipeline also produced a technically reviewed
156.023-second local MP4 with SHA-256
`e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`.
H.264 video, AAC audio, English captions, complete video/audio decode and
normalised parity across all 40 caption cues, the script and transcript passed.

Owner playback, privacy, branding, rights, synthetic-voice publication and
caption review, public upload and player verification, and Devpost submission
remain open. Microsoft Explorer, a passing fixed-model evaluation and a
release-platform SBOM or attestation remain optional assurance work.
Competition registration is complete; the current read-only Devpost review is
retained as the local technical review in
`final-devpost-compliance-review-2026-08-31.md`. It is complete through the
Chrome observation at `2026-08-31T18:49:38.356Z`, does not record a submission
and does not replace the final live-rules and Devpost-form refresh.

The older evidence remains historical and revision-specific. The earlier
`v0.2.0-rc.1` evidence records 58 unit, 19 Chromium and 19 installed-Microsoft-
Edge checks, a signed-out live human journey and a five-tool Codex In-app
Browser observation. Pull request 12, exact-main run `33323068982`, Pages run
`33323152751`, the 20-file public comparison, Chrome 152 native-panel and Chrome
DevTools MCP 1.8.0 observations belong to corrected commit
`edd4ce6b60c38c3c9fbac86408d6b58d1495671f`. The completed-with-limitations
Safari 26.5.2 and VoiceOver 10 sequence and the technically reviewed
142.920-second local video also remain evidence only for their named
pre-federation revision; neither is carried forward as current-release proof or
public YouTube evidence.

Protected pull request 13 admitted the post-deployment evidence, evidence tests
and lockstep documentation as repository commit
`5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`. Exact-main validation run
`33327860583` passed. This evidence-only integration did not dispatch Pages or
change the deployed application bytes.

## 20.5 Historical v0.2 release evidence set

The historical v0.2 release evidence binds, without rewriting earlier evidence:

- the exact source commit, release tag and deployed revision;
- the four authored source locks and generated artefact checksums;
- the 80-record, 80-receipt, one-trace and 10-admission validation summary;
- the historical 58-unit, 19-Chromium and 19-Edge release results and the
  corrected-branch 95-unit, 20-Chrome and 20-Edge results;
- the link audit and sanitised local macOS ARM64 SBOM;
- the Pages artefact, 20-file site manifest, live deployment metadata and
  signed-out live-page and same-origin observations; and
- machine-readable challenge provenance; and
- the later supported-host capture containing five successful calls in
  `Codex In-app Browser` and explicit host-specific limitations;
- the corrected public deployment byte receipt, native Chrome WebMCP panel
  receipt and screenshots, and separate Chrome DevTools MCP 1.8.0 receipt;
- five genuine page-only interaction clips bound by source URL, required action,
  duration and SHA-256, with agent privacy/branding review and human publication
  review still pending; and
- the fail-closed video pipeline and explicit receipt-visualisation boundary;
- the completed-with-limitations manual Safari and VoiceOver evidence, including
  the retained non-continuous Caption Panel sequence and exact media/time
  binding; and
- the local review video, en-GB captions, transcript and machine build receipt.

Release-platform SBOM or attestation, final human video review, synthetic-voice
publication approval, public-player verification, and the exact approved
Devpost text and receipt remain future evidence. The local build has not been
uploaded or submitted. Do not rewrite the baseline or evidence chronology, and
do not submit to Devpost without separate instruction.
