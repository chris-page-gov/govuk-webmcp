# 20. Repository and release structure

## 20.1 Current repository decision

The implementation is in the dedicated public repository
`chris-page-gov/govuk-webmcp`. The preserved research pack and baseline commit
remain in this repository, so the release adds evidence without
erasing its ancestry.

The evidence-first extension was integrated through
[pull request 9](https://github.com/chris-page-gov/govuk-webmcp/pull/9) at
product commit `9235ee5db4df637bdb2a12e87449e871614afe68`. Exact-main validation
run `33286750188` passed, Pages run `33286771963` deployed the same commit, and
the annotated `v0.2.0-rc.1` tag has a
[public pre-release](https://github.com/chris-page-gov/govuk-webmcp/releases/tag/v0.2.0-rc.1).
The live site is <https://chris-page-gov.github.io/govuk-webmcp/>. Competition
registration is complete. Devpost project `1406973` remains an unpublished
pre-submission draft and has not been submitted.

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
│           ├── demo-live-interaction-capture-2026-08-30.json
│           ├── manual-voiceover-journey-2026-08-30.json
│           ├── demo-video-build-2026-08-30.json
│           ├── devpost-read-only-status-2026-08-30.json
│           ├── demo-scene-01-overview-2026-08-30.jpg
│           ├── demo-scene-02-evidence-trace-2026-08-30.jpg
│           ├── demo-scene-03-foundation-facets-2026-08-30.jpg
│           ├── demo-scene-04-comparison-2026-08-30.jpg
│           ├── demo-scene-07-evidence-estate-2026-08-30.jpg
│           ├── live-artifact-verification-2026-08-30.json
│           ├── live-deployment-metadata-2026-08-30.json
│           ├── public-live-search-2026-08-30.png
│           ├── public-release-verification-2026-08-30.md
│           ├── site-SHA256SUMS-2026-08-30
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
or fully reproducible. The unreleased CI and Pages definitions use
`npm ci --ignore-scripts --no-audit`; Pages also installs these Python
requirements and runs semantic WebMCP smoke before deployment. These workflow
edits have not yet run.

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
harnesses exercise the local working candidate, whose tool callbacks now
tolerate an omitted execution-options argument. The public `v0.2.0-rc.1`
deployment predates that fix, so local receipts are not public-deployment
evidence.

The DevTools runner also has a strictly allowlisted post-deployment mode for
the exact project Pages URL. It validates `deployment.json` and an optionally
required protected-main commit before capture, skips the local server and
writes `.evals/chrome-devtools-mcp-public.json`. The mode is prepared but has
not yet been run against the unreleased fix.

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

The exact product commit has the following published evidence:

- exact-main run `33286750188` passed 58 unit checks and 19 Chromium browser
  checks;
- Pages run `33286771963` rebuilt and retested the same commit;
- every one of the 20 deployed files returned HTTP 200 and matched the Pages
  artefact byte for byte; and
- a signed-out live human journey completed without a console error or warning.

The same source tree also passed 19 installed-Microsoft-Edge checks before
publication. That result remains candidate evidence rather than an Edge run in
the canonical Linux workflow. On 30 August 2026, `Codex In-app Browser`
discovered and successfully called all five tools on the exact public release;
the final comparison's canonical and displayed result digests matched. Five
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
Synthetic-voice publication, privacy, branding and final-playback review,
release-platform SBOM or attestation, public video upload and Devpost submission
remain pending. Competition registration is complete.

## 20.5 Release evidence set

The release evidence binds, without rewriting earlier evidence:

- the exact source commit, release tag and deployed revision;
- the four authored source locks and generated artefact checksums;
- the 80-record, 80-receipt, one-trace and 10-admission validation summary;
- the 58-unit and 19-Chromium exact-main results, plus the separately bounded
  Edge result;
- the link audit and sanitised local macOS ARM64 SBOM;
- the Pages artefact, 20-file site manifest, live deployment metadata and
  signed-out live-page and same-origin observations; and
- machine-readable challenge provenance; and
- the later supported-host capture containing five successful calls in
  `Codex In-app Browser` and explicit host-specific limitations;
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
