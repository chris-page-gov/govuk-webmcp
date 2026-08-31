# Local technical Devpost compliance review — 31 August 2026

**Status: the current release has a technically reviewed local demonstration
and an exact-release Chrome WebMCP observation. Human publication,
public-player, final live-rules and form review, and submission gates remain
open. Nothing was submitted.**

This additive local technical review records the evidence position at
`2026-08-31T18:49:38.356Z`. It does not replace the earlier reviews for their
named commits and does not authorise a Devpost change, public video upload or
submission. It is not the final live-rules and Devpost-form refresh required
immediately before submission.

## Decision

Do not submit yet. The exact public product, public repository, detectable MIT
licence, five-tool WebMCP implementation and current local video candidate have
bounded evidence. The 156.023-second video passed complete video-and-audio
decode, caption parity, transcript parity, signal measurement and sampled-frame
inspection.

The rules-named Chrome host gate is closed by a time-bound observation in an
isolated Chrome 152 profile with browser-native WebMCP enabled, exercised
through Chrome DevTools MCP 1.8.0. Chris Page must still watch the exact cut
with sound and captions, approve privacy, branding, rights and the synthetic-
voice publication basis, authorise a public
YouTube upload, verify that player signed out, complete the required Devpost
answers and legal attestations, and separately authorise submission.

The official rules and live Devpost form remain controlling. This repository is
an assurance aid, not an additional set of competition rules.

## Review basis

This review uses:

- the [official challenge rules](https://webmcp.devpost.com/rules);
- the authenticated, read-only [current Devpost status receipt](evidence/devpost-read-only-status-v0.3.0-rc.1.json)
  captured on 31 August 2026;
- the [exact public-release verification](evidence/public-deployment-verification-v0.3.0-rc.1.md);
- the [current supported-host WebMCP receipt](evidence/supported-host-webmcp-capture-v0.3.0-rc.1.json);
- the [current Chrome DevTools MCP receipt](evidence/chrome-devtools-mcp-v0.3.0-rc.1.json);
- the [current manual Safari and VoiceOver journey](evidence/manual-voiceover-journey-v0.3.0-rc.1.json);
- the [current live-interaction capture](evidence/demo-live-interaction-capture-v0.3.0-rc.1.json);
- the [current local video build receipt](evidence/demo-video-build-v0.3.0-rc.1.json); and
- the [current video technical review](evidence/demo-video-technical-review-v0.3.0-rc.1.json).

Devpost state is editable and the retained receipt predates this video build.
It must be refreshed immediately before any authorised submission rather than
being rewritten retrospectively.

## Compliance audit

| Requirement | Status | Evidence and boundary |
| --- | --- | --- |
| Submission window | **Open at retained observation** | The authenticated receipt records a deadline of `2026-09-03T20:00:00Z`, equivalent to 21:00 BST. Recheck the official site before submission. |
| Exact project state | **Not submitted** | Project `1406973` was `submission_pre_draft`, titled `Untitled`, with no tagline, description, video URL, publication timestamp or submission timestamp. |
| Entrant route and eligibility | **Human attestation required** | Chris Page must select the submitter route and verify identity, age, residence, account identity and every eligibility answer in the final form. |
| Existing versus new work | **Human answer required; provenance ready** | Dated repository evidence separates the research baseline, related pre-existing OKF work and competition-period WebMCP implementation. The form answer must preserve that distinction. |
| Working public live URL | **Pass at dated observation** | The exact `v0.3.0-rc.1` deployment at <https://chris-page-gov.github.io/govuk-webmcp/> matched Pages artefact `9745316971`: 1,879 regular files, 128,548,215 bytes and HTTP 200 for every compared response. |
| Public source repository and licence | **Pass at retained observation** | <https://github.com/chris-page-gov/govuk-webmcp> was public and the authenticated requirement receipt records a detectable open-source licence requirement. Repository evidence identifies MIT. Recheck after final integration. |
| WebMCP leverage | **Pass in two named current hosts** | The page exposes five closed-schema tools over the same validated data used by the human interface. Current `v0.3.0-rc.1` evidence records all five calls in Codex In-app Browser and, at `2026-08-31T18:49:38.356Z`, in isolated Chrome 152 with browser-native WebMCP enabled through Chrome DevTools MCP 1.8.0. The Chrome run rejected unrelated `personalContext` with stable error code `invalid_search_request` and recorded zero console errors. These one-time observations prove deterministic host execution, not model tool choice, ChatGPT support or universal compatibility. |
| Evidence scope | **Pass with limitations visible** | The product exposes 80 reviewed records and 58,652 searchable federated records from four locked OKF snapshots. Three standalone legislation rows remain quarantined. Land Registry is metadata-only and source authority is not inferred. |
| Human fallback and accessibility observation | **Completed with limitations** | Safari 26.5.2 and VoiceOver 10 were used manually with the Caption Panel. Seven checkpoints passed and two retained limitations: no heading-rotor selection and no proved automatic spoken live-status wording. VoiceOver audio was not captured; the nine-frame sequence is not continuous and is not a WCAG conformance assessment. |
| Genuine demonstration media | **Local engineering pass** | Five public-page interaction clips, a clearly labelled supported-host receipt reconstruction and the admitted VoiceOver screenshot sequence are bound to the exact release. The host scene is not presented as a host recording. |
| Video under three minutes with audio | **Technical pass; human gate open** | `output/govuk-webmcp-demo-v0.3.0-rc.1.mp4` is 156.023 seconds, SHA-256 `e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`, with 1920×1080 H.264 video, mono AAC audio and an English subtitle track. All 4,678 frames decoded and all 40 normalised caption cues matched the script and transcript. |
| Video signal and sampled-frame review | **Technical pass with one non-fatal observation** | Audio measured −16.1 LUFS, 1.8 LU range and −1.4 dBFS true peak. Three decoded-frame contact sheets showed no obvious corruption. FFmpeg's subtitle `UDTA` retry was non-fatal; probing, extraction and complete decoding succeeded. |
| Video rights, privacy, branding and audible playback | **Blocking human review** | The soundtrack is locally generated with the macOS `Daniel` en-GB synthetic voice; source-clip audio and music are absent. No agent signal test can replace owner review of the exact cut, caption synchronisation, privacy, branding, rights and publication basis. |
| Public YouTube video | **Blocking** | The local MP4 has no public URL. Public upload, signed-out playback, audible audio and public-player captions are unverified. |
| Required project copy and custom answers | **Blocking** | The retained Devpost draft is blank. The form requires the title, pitch, description, live URL, public repository, tested clients, AI tools, learning and career-value answers, alongside the human submitter, country and app-status choices. |
| Ownership, publicity, prize and tax warranties | **Human attestation required** | Repository provenance supports the disclosed work history. Only Chris Page can make the final legal and personal attestations. |
| Protected integration and final freeze | **Open** | The current evidence work is on the review branch. It must pass protected checks and be integrated before the public repository ref, live URL, video URL and form copy are frozen together. |
| Submission receipt | **Blocking** | No authorised submission or returned receipt exists. A saved draft is not a submission. |

## Important evidence boundaries

1. The current supported-host receipt proves genuine discovery and execution in
   its named Codex Browser environment. It does not relabel that host as
   ChatGPT desktop or native Chrome.
2. The current Chrome receipt is bound to release commit `b0bd634` and Pages run
   `33356452048`. The first current-release attempt stopped only because the
   capture harness expected obsolete error prose; the harness was changed to
   assert stable error code `invalid_search_request`, and the reviewed rerun
   passed. This is a harness correction, not a product-failure claim.
3. Historical native Chrome and Chrome DevTools MCP observations remain bound
   to the earlier corrected public commit. They are not rewritten as current
   evidence.
4. The supported-host video scene is a receipt reconstruction and says so on
   screen. It is not host-owned footage and does not claim model selection.
5. The VoiceOver scene uses admitted, unique screenshots with the Caption Panel
   visible. It is deliberately labelled as a non-continuous sequence; the
   synthetic demonstration narration is separate from VoiceOver speech.
6. The current video is a local, ignored review artefact. Its build and
   technical-review receipts retain exact hashes, but those records do not
   grant publication approval or satisfy the public-YouTube requirement.
7. The Devpost receipt is immutable evidence of its observation time. Its
   then-false video readiness field remains correct for that time and must not
   be altered after the fact.

## Recommended completion sequence

1. Chris watches the exact local MP4 from start to finish with audio and
   captions, then records the privacy, branding, rights, caption-sync,
   synthetic-voice and publication decisions.
2. Amend and rebuild under a new evidence filename if that review finds a
   problem; do not rewrite the admitted receipts.
3. Integrate the evidence branch through the protected pull request and verify
   canonical CI and the public repository state.
4. With explicit publication approval, upload the approved cut to public
   YouTube and verify duration, audible sound and captions while signed out.
5. Complete every Devpost field and human attestation, using only the tested
   host and model claims supported by the retained evidence.
6. Run one final read-only refresh of the official rules, live form, public
   repository, Pages URL and YouTube player.
7. Submit only after separate explicit authorisation and retain the returned
   project URL, timestamp and submission receipt.

## Actions deliberately not performed

- no Devpost project mutation;
- no public video upload;
- no owner, eligibility, residence, rights, tax or publicity attestation;
- no claim of model-selection quality or WCAG conformance; and
- no Devpost submission.
