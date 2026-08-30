# Devpost compliance working review — 30 August 2026

**Status: working review, not final and not submitted.** This document prepares
the final read-only compliance review. It must not be renamed or described as
final until the genuine VoiceOver evidence, local demonstration-video build and
human playback review exist. It does not authorise a Devpost change, public
video upload or submission.

## Review scope and controlling sources

Reviewed at `2026-08-30T10:45:10Z` against:

- the [official challenge rules](https://webmcp.devpost.com/rules);
- the live Devpost submission requirements and key dates obtained through
  authenticated read-only connector calls at `2026-08-30T10:23:52Z`;
- the single host announcement sent at `2026-08-28T16:31:50Z`;
- the [read-only Devpost status receipt](evidence/devpost-read-only-status-2026-08-30.json);
- the exact [public-release verification](evidence/public-release-verification-2026-08-30.md);
- the [supported-host WebMCP receipt](evidence/supported-host-webmcp-capture-2026-08-30.json); and
- the [genuine live-interaction capture receipt](evidence/demo-live-interaction-capture-2026-08-30.json).

The official rules and live challenge site remain controlling. Repository
checklists are assurance aids, not additional Devpost rules.

## Current requirement audit

| Requirement | Current status | Evidence and exact boundary |
| --- | --- | --- |
| Registration | **Pass** | Authenticated Devpost state says `alreadyRegistered: true`. This workflow did not register or mutate the account. |
| Submission window | **Open** | The live deadline is `2026-09-03T20:00:00Z`, equivalent to 21:00 BST. No deadline change appeared in the only current announcement. |
| Exact project submission state | **Not submitted** | Project `1406973` is `submission_pre_draft`, titled `Untitled`, with no slug, publication time or submission time. Its tagline, description and video URL are absent. |
| Entrant route and eligibility | **Human attestation required** | Chris Page must verify the individual, team or organisation route, age, residence, supported-country status and final account identity when completing the form. |
| New versus existing app status | **Human decision required** | This repository's first commit is dated 29 August 2026, after the submission period opened. Related ideas, datasets and prior repositories are disclosed in the asset and provenance records. Chris Page must choose the form answer that most truthfully describes the project and retain the dated separation. |
| Meaningful post-start WebMCP work | **Pass for the documented implementation** | The repository baseline and later five-tool, Evidence Trace, federation, deployment and supported-host history are separated by dated commits and receipts. Judges may still assess materiality. |
| Working public live URL | **Pass, dated observation** | <https://chris-page-gov.github.io/govuk-webmcp/> served the exact product commit without authentication; all 20 deployed files returned HTTP 200 and matched the Pages artefact. Recheck immediately before submission. |
| Named WebMCP judging environment | **Open** | Five tools were genuinely discovered and called in `Codex In-app Browser`. The rules name ChatGPT's desktop in-app browser or Chrome 149+ with WebMCP enabled. The current receipt does not establish either named environment. |
| Public source repository | **Pass** | <https://github.com/chris-page-gov/govuk-webmcp> is public. A live GitHub check at `2026-08-30T10:45:10Z` detected the MIT licence. The About description and homepage fields are empty, but those two metadata fields are not stated submission requirements. |
| Complete source, assets and instructions | **Pass for the immutable product release; open for current evidence work** | The released source, data, tests and instructions are public at `v0.2.0-rc.1`. The current final-evidence and video-pipeline branch is not yet integrated, so it must pass review and protected-branch checks before final reliance. Raw media is intentionally ignored local output. |
| Required text description | **Draft ready; form open** | `devpost-submission-draft.md` addresses WebMCP fit, user experience, new person-agent capability and implementation. The live Devpost project description remains empty. |
| Genuine demonstration media | **Part pass** | Five page-only interaction clips are bound to the exact release, actions, durations and SHA-256 values. The supported-host scene is a labelled receipt visualisation, not a host recording or Site tools screenshot. |
| Manual screen-reader evidence | **Blocked pending confirmed action** | No genuine VoiceOver clip or `manual-voiceover-journey-2026-08-30.json` exists. Automated accessibility tests are not a substitute and no WCAG conformance claim is made. |
| Local final video | **Blocked by VoiceOver inputs** | Exact narration timing is 138.105 seconds before final encoding. The guarded preflight rejects only the missing VoiceOver clip, manual journey record and media/time binding. No final MP4, captions, transcript or build receipt exists. |
| Public YouTube video under three minutes with audio | **Blocked** | A local cut, when built, will still not satisfy this requirement. Chris Page must approve the synthetic voice and final playback, then a publicly visible YouTube upload and public-player check must occur under separate authority. |
| Video rights, privacy and branding | **Human review required** | The planned cut uses the original interface, original script, local `Daniel` en-GB synthetic narration, no music and no source-clip audio. Agent privacy and branding review passed for five clips; human publication, voice and final-cut review remain pending. |
| Required custom submission answers | **Open** | The live form requires submitter type, country, app status, live URL, public repository, tested clients, AI tools, learning level and career-value answers. Optional fields depend on the entrant's truthful circumstances. |
| Ownership, publicity, prize and tax warranties | **Human attestation required** | Repository assurances support ownership and personal-resource use. Only Chris Page can make the final warranties and accept publicity, prize and tax terms. |
| Final freeze and receipt | **Open** | The final text, repository ref, live site, public video and form answers must be rechecked and frozen before the deadline. No submission receipt exists because no submission has been made. |

## Contradictions and authoritative resolution

1. Devpost's account-level hackathon relationship includes `submitted`, but the
   exact project is `submission_pre_draft` with `submittedAt: null`. Treat the
   project as **not submitted** until an authorised submission returns a receipt.
2. Older current-state documents said registration was unperformed. The live
   authenticated read-only status supersedes those statements: registration is
   complete, while project completion and submission remain open. Historical
   dated evidence keeps its original observation wording.
3. Instrumented Chrome and Edge tests prove the page contract, and the Codex
   receipt proves one supported host. Neither proves the rules' named ChatGPT
   desktop or Chrome 149+ judging environment.
4. A receipt visualisation proves what the retained machine receipt contains; it
   is not a native host recording. The demonstration must preserve that label.
5. A local, captioned, sub-three-minute MP4 is necessary review evidence but does
   not satisfy the separate public-YouTube requirement.
6. Devpost's read-only key-date API returned a submission start of
   `2026-08-25T19:00:00Z`, while the live official rules state 11:00 Pacific
   Time, which was `2026-08-25T18:00:00Z`. The official rules control. This does
   not affect the chronology conclusion because this repository's first commit
   is dated 29 August 2026.

## Human attestations still required

Chris Page must personally confirm, at final form completion:

- entrant route, identity, residence and eligibility;
- whether `New` or `Existing` is the most truthful app-status answer;
- ownership, third-party rights, trade marks and lack of undisclosed material;
- tested-client wording, without broadening the host evidence;
- synthetic-voice publication, privacy, branding and final audible playback;
- publicity, prize, tax and submission warranties; and
- every custom form answer and URL.

## Finalisation procedure after the manual journey

1. Bind the genuine Safari VoiceOver clip and nine exact journey checkpoints,
   including every observed issue and limitation, without a WCAG claim.
2. Run `npm run evidence:manifest` and `npm run demo:preflight`.
3. Build the local video, then verify duration, H.264 video, AAC audio, embedded
   English captions, transcript, hashes, black frames, silence and final audible
   playback.
4. Update this audit from working to final with the exact build receipt and
   retained human-review decisions.
5. Integrate the evidence branch through protected review and recheck the public
   repository, release and live URL.
6. Separately, and only with authority, upload the approved cut to YouTube,
   verify signed-out playback and captions, complete the Devpost fields and
   submit before the deadline.
7. Retain the final public URLs, exact text, timestamp and submission receipt;
   make no post-deadline edit.

## Actions deliberately not performed

- no Devpost registration mutation;
- no Devpost project mutation;
- no public video upload;
- no Devpost submission; and
- no claim that the working review is final.
