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
commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`. Exact-main validation run
`33323068982` and Pages run `33323152751` passed. The live site is
<https://chris-page-gov.github.io/govuk-webmcp/>. Competition registration is
complete. Devpost project `1406973` remains an unpublished pre-submission draft
and has not been submitted.

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
│       ├── federation.json             # 10 corpus admissions
│       ├── federation.json.sha256
│       └── sources/
│           ├── source-locks.json       # exactly 4 authored locks
│           ├── govuk-content-69.lock.json
│           ├── curated-api-data.json
│           ├── answer-packs.json       # 1 authored answer pack
│           └── corpus-admissions.json  # 10 authored decisions
├── evals/
│   ├── webmcp-smoke.json          # model-free concrete five-tool calls
│   └── webmcp-browser.json        # prepared model-selection and no-call cases
├── src/
│   ├── contracts.ts
│   ├── integrity.ts
│   ├── evidence-runtime.ts
│   ├── federation-runtime.ts
│   ├── application-actions.ts     # shared human and WebMCP controller
│   └── webmcp-tools.ts            # 5 fixed imperative registrations
├── schemas/
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
│   └── error-result.schema.json
├── scripts/
│   ├── validate-authored-sources.mjs
│   ├── build-catalogue.mjs
│   ├── build-evidence.mjs
│   ├── build-federation.mjs
│   ├── validate-generated.mjs
│   ├── copy-static.mjs
│   ├── audit-catalogue-links.mjs
│   ├── sanitise-sbom.mjs
│   ├── write-deployment-metadata.mjs
│   ├── verify-research-pack.sh    # exact jsonschema gate and seed verifier
│   ├── capture-chrome-devtools-webmcp.mjs # isolated five-tool MCP capture
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
│       └── source-locks.mjs       # exact path and regular-file checks
├── tests/
│   ├── unit/
│   │   ├── knowledge-runtime.test.mjs
│   │   ├── evidence-federation.test.mjs
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
│   │   └── 0003-citizen-selected-agent-and-independent-assurance.md
│   └── competition/
│       ├── architecture.md
│       ├── tool-catalogue.md
│       ├── demo-storyboard.md
│       ├── demo-video-script.json
│       ├── demo-captions.en-GB.vtt
│       ├── demo-transcript.md
│       ├── evidence-manifest-registry.json
│       ├── devpost-submission-draft.md
│       ├── final-devpost-compliance-review-2026-08-30.md
│       ├── post-deployment-devpost-compliance-review-2026-08-30-edd4ce6.md
│       ├── personal-agent-webmcp-test-strategy.md
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
│           ├── supported-host-webmcp-runtime-summary-2026-08-30.jpg
│           ├── supported-host-webmcp-full-page-2026-08-30.jpg
│           ├── chrome-devtools-mcp-2026-08-30-edd4ce6.json
│           ├── native-devtools-webmcp-2026-08-30-edd4ce6.json
│           ├── native-devtools-webmcp-completed-2026-08-30-edd4ce6.jpeg
│           ├── native-devtools-webmcp-invalid-input-2026-08-30-edd4ce6.jpeg
│           ├── public-deployment-verification-2026-08-30-edd4ce6.md
│           ├── demo-live-interaction-capture-2026-08-30.json
│           ├── manual-voiceover-journey-2026-08-30.json
│           ├── demo-video-build-2026-08-30.json
│           ├── demo-video-technical-review-2026-08-30.json
│           ├── devpost-read-only-status-2026-08-30.json
│           ├── devpost-read-only-status-2026-08-30-edd4ce6.json
│           ├── demo-scene-01-overview-2026-08-30.jpg
│           ├── demo-scene-02-evidence-trace-2026-08-30.jpg
│           ├── demo-scene-03-foundation-facets-2026-08-30.jpg
│           ├── demo-scene-04-comparison-2026-08-30.jpg
│           ├── demo-scene-07-evidence-estate-2026-08-30.jpg
│           ├── live-artifact-verification-2026-08-30.json
│           ├── live-artifact-verification-2026-08-30-edd4ce6.json
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

Generated files are projections of the four exact authored locks. The authored
files under `app/data/sources/` must not be regenerated from the projections.
The 10-entry federation manifest is descriptive governance data: 2 admissions
are searchable and 8 are not. A descriptor does not include or admit a producer
payload.

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
paths passed for the protected integration and corrected Pages deployment.

`chrome-devtools-mcp` 1.8.0 and `webmcp-evals` 0.0.4 are exact development
dependencies. `npm run webmcp:devtools:capture` and
`npm run webmcp:eval:smoke` write review-before-publication receipts under
ignored `.evals/`. Only the DevTools receipt retains full tool outputs. The
model-free smoke wrapper validates six `ok: true` expected-schema envelopes,
deletes the raw rows and retains counts plus a results digest. It forwards no
provider credential environment variables and gives the child an isolated
`HOME`, but the child retains the operating-system filesystem access of the
invoking user. The tracked fixtures live under `evals/`; the browser fixture is
prepared for a later model-backed run and has not yet been executed. These
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

The corrected public product has the following evidence:

- pull request 12 passed 95 unit, 20 Chrome and 20 installed-Microsoft-Edge
  checks before integration;
- exact-main run `33323068982` passed its complete validation workflow;
- Pages run `33323152751` rebuilt and retested the same commit;
- every one of the 20 deployed files returned HTTP 200 and matched the Pages
  artefact byte for byte.

The earlier `v0.2.0-rc.1` evidence separately records 58 unit, 19 Chromium and
19 installed-Microsoft-Edge checks plus a signed-out live human journey. On
30 August 2026, `Codex In-app Browser` discovered and successfully called all
five tools on that historical public deployment; the final comparison's
canonical and displayed result digests matched. Chrome 152's native WebMCP
panel later listed and completed all five tools on the corrected public
deployment and retained a structured invalid-input result; Chrome DevTools MCP
1.8.0 independently completed all five calls with zero console errors. Five
genuine public-page interaction clips and their consolidated receipt are also
complete. The supported-host motion scene is a labelled receipt visualisation,
not host-owned video. A separate fail-closed builder can turn nine operator-
declared, hash-bound Safari and VoiceOver frames under ignored
`output/voiceover-capture/` into the existing VoiceOver scene path; it labels
the result as a screenshot sequence, not a continuous recording, and renders
only immutable verified bytes without network access. The manual Safari 26.5.2
and VoiceOver 10 journey is now retained separately as completed with
limitations; the evidence record states that no VoiceOver speech audio was
captured, a heading-rotor selection was not retained and the automatic spoken
wording of the live search status was not proven. The Caption Panel and
VoiceOver were turned off afterwards. This does not establish WCAG conformance.

The guarded pipeline subsequently produced a 142.920-second local review MP4,
separate en-GB captions, a transcript and a machine build receipt. The video has
H.264 video, AAC synthetic narration and an embedded English caption track; its
SHA-256 is
`efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`.
A later technical review completed the video/audio decode, counted 4,284 video
frames and matched all 38 caption cues, while retaining one non-fatal subtitle
metadata warning and explicitly excluding audible content-parity or owner
approval. Synthetic-voice publication, privacy, branding, final playback,
public video upload and Devpost submission remain pending. Microsoft Explorer,
fixed-model evaluation and a release-platform SBOM or attestation remain
optional assurance work. Competition registration is complete; the refreshed
Devpost project remains `Untitled`, blank and `submission_pre_draft`.

Protected pull request 13 admitted the post-deployment evidence, evidence tests
and lockstep documentation as repository commit
`5f2295f5f55dfb4f6c089019c53c32c22c3ae86a`. Exact-main validation run
`33327860583` passed. This evidence-only integration did not dispatch Pages or
change the deployed application bytes.

## 20.5 Release evidence set

The release evidence binds, without rewriting earlier evidence:

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
