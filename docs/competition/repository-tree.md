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
│   ├── build-demo-video.mjs        # guarded local review cut, captions and transcript
│   ├── build-host-evidence-clip.mjs # labelled receipt visualisation, not host video
│   ├── build-preview-scene-clips.mjs # explicitly non-live editorial previews
│   ├── capture-live-demo-clips.mjs # exact-release genuine interaction capture
│   ├── write-evidence-manifest.mjs # fail-closed allowlisted digest manifest
│   └── lib/
│       ├── deterministic-json.mjs
│       └── source-locks.mjs       # exact path and regular-file checks
├── tests/
│   ├── unit/
│   │   ├── knowledge-runtime.test.mjs
│   │   ├── evidence-federation.test.mjs
│   │   ├── source-locks.test.mjs
│   │   ├── demo-video.test.mjs
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
│   └── competition/
│       ├── architecture.md
│       ├── tool-catalogue.md
│       ├── demo-storyboard.md
│       ├── demo-video-script.json
│       ├── evidence-manifest-registry.json
│       ├── devpost-submission-draft.md
│       ├── devpost-compliance-working-review-2026-08-30.md
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
not host-owned video. Manual screen-reader observation, release-platform SBOM or
attestation, final local video and public video remain pending; competition
registration is complete and Devpost submission has not occurred.

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
- the fail-closed video pipeline and explicit receipt-visualisation boundary.

Manual screen-reader, release-platform SBOM or attestation, final demonstration
video, captions and transcript, and the exact approved Devpost text and receipt
remain future evidence. Current video preflight fails only for the missing
VoiceOver clip, manual journey JSON and their binding. Do not rewrite the
baseline or evidence chronology, and do not submit to Devpost without separate
instruction.
