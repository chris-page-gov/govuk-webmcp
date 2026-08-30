# Final Devpost compliance review — 30 August 2026

**Status: final read-only review; engineering evidence substantially complete,
submission blocked and nothing submitted.** This review records the position at
`2026-08-30T13:00:36Z`. It does not authorise a Devpost change, public video
upload or submission.

## Decision

Do not submit yet. The public repository, licence, deployed product and local
demonstration build pass their bounded checks. The mandatory submission is not
ready because the current WebMCP receipt is not from an environment named in the
challenge rules, the demonstration has not passed its final human publication
review, there is no public YouTube URL and the retained Devpost project fields
are unpopulated.

The official rules and live Devpost challenge site remain controlling.
Repository checklists and this review are assurance aids, not additional
Devpost rules.

## Review basis

This review uses:

- the [official challenge rules](https://webmcp.devpost.com/rules);
- the authenticated, read-only [Devpost status receipt](evidence/devpost-read-only-status-2026-08-30.json)
  captured at `2026-08-30T10:23:52Z`;
- the exact [public-release verification](evidence/public-release-verification-2026-08-30.md);
- the [supported-host WebMCP receipt](evidence/supported-host-webmcp-capture-2026-08-30.json);
- the [manual Safari and VoiceOver journey](evidence/manual-voiceover-journey-2026-08-30.json);
- the [live-interaction capture receipt](evidence/demo-live-interaction-capture-2026-08-30.json); and
- the [local demonstration-video build receipt](evidence/demo-video-build-2026-08-30.json).

Devpost project state is editable and the retained receipt is time-bounded. It
must be refreshed immediately before any authorised submission.

## Compliance audit

| Requirement | Status | Evidence and exact boundary |
| --- | --- | --- |
| Registration | **Pass** | The retained authenticated Devpost state says `alreadyRegistered: true`. This review made no account change. |
| Submission window | **Open at retained observation** | The retained live deadline is `2026-09-03T20:00:00Z`, equivalent to 21:00 BST. Recheck the official site before submission. |
| Exact project submission state | **Not submitted** | Project `1406973` was `submission_pre_draft`, titled `Untitled`, with `submittedAt: null`. No submission receipt exists. |
| Entrant route and eligibility | **Human attestation required** | Chris Page must verify the entrant route, identity, age, residence, supported-country status and account identity in the final form. |
| New versus existing app status | **Human decision required** | The repository's first commit is dated 29 August 2026. Related ideas, datasets and earlier repositories are disclosed in the provenance records. The form answer must describe this history truthfully. |
| Meaningful post-start WebMCP work | **Pass for the documented implementation** | Dated commits and receipts distinguish the research baseline from the five-tool implementation, Evidence Trace, federation, deployment and final evidence work. Judges retain the final materiality decision. |
| Working public live URL | **Pass, dated observation** | <https://chris-page-gov.github.io/govuk-webmcp/> served the exact released product commit without authentication; all 20 deployed files returned HTTP 200 and matched the Pages artefact. Recheck immediately before submission. |
| Public source repository and detectable licence | **Pass** | <https://github.com/chris-page-gov/govuk-webmcp> is public and the dated live check detected the MIT licence. |
| Complete source, assets and instructions | **Pass for the immutable release; integration open** | The released source, data, tests and instructions are public at `v0.2.0-rc.1`. Current final-evidence work must still be integrated through the repository's review and protected-branch checks. Raw local media output is not itself the public source record. |
| Named WebMCP judging environment | **Blocking** | Five tools were genuinely discovered and called in `Codex In-app Browser`. The challenge names ChatGPT's desktop in-app browser or Chrome 149+ with WebMCP enabled. The retained receipt proves neither named environment and must not be relabelled. |
| Required text description | **Draft ready; form blocking** | The repository submission draft addresses the WebMCP fit and user experience. The retained Devpost project description and tagline are absent. |
| Genuine demonstration media | **Local engineering pass** | Five page-interaction clips, a labelled supported-host receipt visualisation and the manual VoiceOver sequence are bound to the exact release. The supported-host scene is not a native host recording or Site tools screenshot. |
| Manual screen-reader journey | **Completed with limitations** | Safari 26.5.2 and VoiceOver 10 were used manually with the Caption Panel. Seven checkpoints passed; the heading and live-status checkpoints retained explicit limitations. VoiceOver speech audio was not captured; the automatic spoken wording for `9 matching records; 8 shown.` was not proved; no WCAG conformance claim is made. |
| Local final video under three minutes with audio | **Local engineering pass; human review open** | `output/govuk-webmcp-demo-2026-08-30.mp4` is 142.920 seconds with H.264 video, AAC audio and an embedded English subtitle track generated from the en-GB captions. SHA-256: `efcacef9d063539435e10f12158a05267d13630cec9743c3e4d3dc33c3301d0a`. This is a local review artefact, not a published submission video. |
| Video rights, privacy, branding and playback | **Blocking human review** | The local soundtrack uses the macOS `Daniel` en-GB synthetic voice, no music and no source-clip audio. Chris Page must approve the voice publication basis and complete the final privacy, branding, caption-sync and audible-playback review. |
| Public YouTube video under three minutes with audio | **Blocking** | No public YouTube URL exists. Embedded local captions and audio do not satisfy public upload, signed-out playback or public-player caption checks. |
| Required custom submission answers | **Blocking** | In the retained live observation the project was still `Untitled` and its tagline, description and video URL were absent. The form also requires truthful answers for submitter type, country, app status, live URL, repository, tested clients, AI tools, learning level and career value. |
| Ownership, publicity, prize and tax warranties | **Human attestation required** | Repository evidence supports the disclosed ownership and resource history. Only Chris Page can make the final warranties and accept publicity, prize, tax and submission terms. |
| Final freeze and receipt | **Blocking** | The final text, repository ref, live site, public video and form answers have not been frozen together. No authorised submission or returned receipt exists. |

## Important evidence boundaries

1. Devpost's account-level relationship includes `submitted`, but the exact
   project was `submission_pre_draft` with `submittedAt: null`. Treat this
   project as **not submitted** unless an authorised submission returns a
   receipt.
2. The Codex in-app Browser receipt proves five genuine WebMCP discoveries and
   calls in that host. It does not prove ChatGPT desktop or Chrome 149+ judging
   compatibility.
3. Instrumented Chrome and Edge browser tests prove the page contract; they do
   not close the named-judging-host gap.
4. The supported-host video scene visualises a retained machine receipt. It is
   not native host footage and must remain labelled as such.
5. VoiceOver was genuinely used, but the retained evidence does not include its
   speech audio or prove the automatic live-region announcement. It is one
   bounded manual observation, not a WCAG conformance audit.
6. The synthetic narration belongs only to the local review build until Chris
   Page approves its publication basis.
7. A local, captioned, sub-three-minute MP4 is necessary review evidence but
   does not satisfy the separate public-YouTube requirement.

## Recommended completion sequence

1. Capture the five WebMCP discovery and call checks in an officially named
   judging environment: ChatGPT desktop's in-app browser or Chrome 149+ with
   WebMCP enabled. Retain the actual host name, version, page URL, inputs,
   outputs, timestamps and limitations; do not infer or relabel the host.
2. Review the local MP4 from start to finish with sound and captions. Record the
   human decisions on privacy, branding, synthetic-voice publication,
   caption synchronisation and audible playback. Amend and rebuild if needed.
3. Integrate the final-evidence branch through review and protected checks.
   Recheck the public repository, detected licence, exact release and deployed
   Pages journey after integration.
4. Complete the Devpost title, tagline, description, URLs and custom answers,
   keeping tested-client wording within the evidence actually captured. Chris
   Page should complete every eligibility, ownership and legal attestation.
5. With separate publication authority, upload the approved cut to public
   YouTube. Verify signed-out playback, duration, audible audio and the public
   caption track, then add the exact URL to Devpost.
6. Run one final read-only freeze against the official rules and live form.
   Check every public URL and retain the exact text and repository ref.
7. Submit only after explicit authority, before the controlling deadline, and
   retain the returned project URL, timestamp and submission receipt.

## Actions deliberately not performed

- no Devpost registration mutation;
- no Devpost project mutation;
- no public video upload;
- no GitHub or deployment change;
- no Devpost submission; and
- no claim of officially named judging-host coverage or WCAG conformance.
