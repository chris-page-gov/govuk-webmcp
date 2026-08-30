# Post-deployment Devpost compliance review — corrected public build

**Status: named Chrome host evidence complete; submission still blocked and
nothing submitted.** This additive review records the position at
`2026-08-30T17:57:48Z`. It updates, but does not overwrite, the earlier
[full read-only review](final-devpost-compliance-review-2026-08-30.md).

## Decision

Do not submit yet. The corrected public build now closes the earlier
rules-named browser-host gap. The remaining blockers are human and publication
gates: Chris Page must review and approve the complete local video with audible
sound and captions, approve its synthetic-voice publication basis, publish the
approved cut to YouTube, verify the public player signed out, complete the
Devpost fields and legal attestations, and explicitly authorise submission.

The remaining work has three different statuses:

- **Official submission blockers:** complete project copy and required custom
  answers, add the working live and public-repository URLs, publish the
  sub-three-minute video with audio on public YouTube, and complete the actual
  submission.
- **Owner-only gates:** Chris reviews continuous playback, privacy, branding,
  caption synchronisation and the synthetic voice, chooses the entrant/app
  status answers, and makes the eligibility, ownership, publicity, prize, tax
  and other legal attestations.
- **Optional assurance:** Microsoft WebMCP Explorer, fixed-model selection
  evaluation, stronger screen-reader observations and a release-platform SBOM
  or attestation may strengthen the evidence but are not current official
  submission requirements.

## Current controlling requirements

The [official rules](https://webmcp.devpost.com/rules) were rechecked on
30 August 2026. They continue to state that:

- the deadline is 3 September 2026 at 13:00 Pacific time, equivalent to 21:00
  BST;
- judges may use ChatGPT's in-app browser or Chrome 149 or later with WebMCP
  testing enabled;
- the live project and public open-source repository must be accessible; and
- the public YouTube demonstration must be under three minutes, include audio
  and show the functioning project and its WebMCP use.

The rules and live Devpost form remain controlling. Repository checklists are
assurance aids only.

Authenticated read-only connector calls at `2026-08-30T17:57:48Z` confirmed
that Devpost project `1406973` remains `Untitled` in
`submission_pre_draft`, with no tagline, description, video URL, publication
or submission timestamp. The latest organiser announcement explicitly warns
that a saved draft is not a submission. No form or registration state was
changed by this review.

## Evidence changes since the earlier review

| Area | Updated status | Exact boundary |
| --- | --- | --- |
| Corrected public deployment | **Pass at dated observation** | Protected-main commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`; exact-main run `33323068982`; Pages run `33323152751`; artefact `9735478602`; all 20 public files matched the downloaded artefact. |
| Native rules-named Chrome route | **Pass at dated observation** | Chrome 152.0.7977.64 ran in a disposable profile with `WebMCP`, `DevToolsWebMCPSupport` and `WebMCPTesting`. Application → WebMCP listed the exact five tools and recorded five completed valid calls against the public URL. |
| Native input validation | **Pass** | The panel submitted `limit: 21`; executable page validation returned `trusted-govuk-discovery.error.v1`, `ok: false`, code `invalid_search_request`. The panel reports a completed call because the tool returned a structured bounded result, not because the input was accepted. |
| Native presentation parity | **Pass** | `explore_answer_foundations` and `compare_evidence_foundations` updated the page's in-memory presentation. The comparison contained 11 facet rows and the displayed result digest prefix matched canonical result `3baa3281849855b86e929fd5fad8984580066ac4e275063341c1d9102dc903b1`. |
| Chrome DevTools MCP 1.8.0 | **Pass at dated observation** | Isolated Chrome 152 discovered the exact five public tools, completed all five calls, rejected synthetic `personalContext`, bound the public deployment metadata and recorded zero console errors. No model was selected or contacted. |
| Browser/tool distinction | **Retained limitation** | Native-panel execution and Chrome DevTools MCP prove deterministic browser-host execution. They do not prove that a particular AI model will select the right tool, and they do not establish Microsoft Explorer or ChatGPT desktop behaviour. |
| Demonstration video | **Technical review passed; human gate open** | The existing 142.920-second candidate remains bound to unchanged, checksum-bound `v0.2.0-rc.1` evidence and SHA-256 `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`. A full video/audio decode, 4,284-frame count and all 38 caption cues passed technical review; one non-fatal subtitle metadata warning was retained. This is not owner approval and the video is not silently rebound to the later deployment. |
| Devpost draft | **Blocking** | Live read-only state shows project `1406973` is still `Untitled`, `submission_pre_draft`, with blank project copy and no video URL or submission timestamp. The retained observation does not establish that the required custom answers and human attestations are complete. |
| Public video and submission | **Blocking** | No public YouTube URL, completed Devpost field set, final human attestations or submission receipt exist. |

## Capture method and limitation

The native panel was observed in the disposable browser window. macOS exposed
the panel's accessible names and keyboard focus, but its accessibility bridge
did not dispatch the tool-card pointer action reliably. Playwright therefore
attached over `127.0.0.1:9226` to the disposable Chrome DevTools frontend and
activated the panel's own tool cards, Paste control, Run control and result
tabs. The temporary clipboard reader was overridden only inside that DevTools
page so no Mac clipboard value was read or replaced. This was browser UI
automation of the native test panel, not a direct call into the product's
JavaScript and not a model-backed run.

The screenshots contain only the public project and the disposable unconnected
Chrome profile. Raw receipts, profile paths and debugging targets remain
ignored; reviewed evidence retains no cookie, credential, personal tab,
personal prompt or unredacted request header.

## Remaining completion sequence

1. Chris Page watches the local candidate from start to finish with audio and
   captions and records the privacy, branding, caption-sync, synthetic-voice and
   publication decisions.
2. Amend and rebuild under additive v2 filenames if that review finds an issue;
   do not overwrite the checksum-bound v1 receipt.
3. With publication approval, upload the approved cut to public YouTube and
   verify signed-out playback, duration, audio and public captions.
4. Select the final project name and copy, complete every required Devpost
   field and human attestation, then run one final read-only freeze against the
   live form and official rules.
5. Submit only after explicit authorisation and retain the returned receipt.

## Actions deliberately not performed

- no Microsoft WebMCP Explorer or model-backed evaluation;
- no Devpost form mutation;
- no public video upload;
- no eligibility, ownership, tax or publicity attestation on Chris Page's
  behalf; and
- no Devpost submission.
