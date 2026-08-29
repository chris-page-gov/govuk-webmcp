# Project status and hard gates

**Status:** full technical build, public GitHub source and public static
deployment are authorised. Competition registration and submission remain
separate explicit actions and have not been performed.

**Implementation:** baseline commit `4c85db7` preserves the research seed. Chris
Page's 29 August 2026 assurance resolves the personal ownership, resource-use,
outside-interest and original-code licence gates for this repository. The
`chris-page-gov/govuk-webmcp` repository began as a private review boundary and
is now public under the authorised branch/PR workflow. Pull request `#1` was merged as
`2f4b0761e80f3abc8c7bff9d5f1ee2db90afa677`; the exact post-merge `main`
workflow passed and retained the static build artefact.
Private pull request `#5` then merged the Edge startup guidance and current
SHA-pinned GitHub Actions as
`3a2d7faac43ec13e785a1cb694ed175c34d45553`; its exact post-merge `main`
workflow passed.

The live 29 August 2026 rules check confirmed that a public source repository
with an open-source licence and a working live URL are submission requirements.
Pull request `#7` was rebase-merged as
`ef3b6f496924250c5dfb9cc52ea124468035a3dc`; its exact-main validation and
manually dispatched Pages workflow passed. The repository is public, `main` is
protected and the live prototype is available at
<https://chris-page-gov.github.io/govuk-webmcp/>. Signed-out availability,
deployment metadata, catalogue digest, same-origin requests and the human
search journey were verified and retained under `docs/competition/evidence/`.
The controlled in-app browser did not expose `document.modelContext`, so an
actual ChatGPT WebMCP host registration and call remains unverified.

The complete static security audit of pre-release `main` commit `260d68f`
covered all 108 tracked files and produced no reportable findings. Its canonical
report, coverage, findings and manifest are retained under
`docs/competition/evidence/security-scan-2026-08-29/`. The release-candidate
diff was reviewed separately. Its initial Pages workflow had one medium
promotion-boundary finding and its raw SBOM exposed third-party person metadata;
both are fixed and independently re-reviewed, with regression tests. The
pre-remediation canonical scan and verification note are retained under
`docs/competition/evidence/security-diff-scan-2026-08-29/`.

## Source-material boundaries that remain mandatory

- Retain the item-level rights and access review for all public-sector and
  third-party source material.
- Do not turn catalogue inclusion into a blanket access or licence claim.
- Confirmation that no official credentials, restricted information, personal
  data or unpublished material enter the repository or deployed build.

## Technical direction already agreed

- Static, same-origin, read-only application.
- Curated, rights-reviewed GOV.UK/API/data corpus rather than the full estate.
- Three critical WebMCP tools: search, get record and show provenance.
- Human interface and tools call the same deterministic engine.
- Missing access or licence evidence remains “not established”.
- No GOV.UK crown, wordmark, GDS Transport, GOV.UK brand colours or employer
  logos.
- Independent-prototype disclaimer on the application, repository and video.

## Still requires a separate explicit instruction

- Do not register for the competition or submit to Devpost.
- Do not claim WCAG conformance, official endorsement, comprehensive coverage,
  production readiness or guaranteed accuracy.
- Do not change the repository, live site or submission after the 3 September
  2026 13:00 Pacific deadline if a submission has been accepted.

## Next safe task

Record the three WebMCP registrations and representative calls in ChatGPT's
supported built-in browser against the final candidate URL. Then perform the
manual screen-reader observation and prepare the sub-three-minute public demo
video and Devpost form for Chris Page's separate submission approval.
