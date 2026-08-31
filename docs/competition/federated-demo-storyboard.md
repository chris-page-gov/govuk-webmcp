# Federated demonstration storyboard

**Status: exact-release local review cut and rules-named Chrome capture
complete. Human publication review, public-player verification, final
compliance refresh and Devpost submission remain open.**

The 31 August local technical compliance review now includes the Chrome
observation at `2026-08-31T18:49:38.356Z`; the final live-rules and Devpost-form
refresh remains open.

`v0.3.0-rc.1` is merged through protected `main`, deployed to the public Pages
URL and verified byte for byte at commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf`. The current supported-host receipt
is bound to that release. Do not substitute a local build, mock result or
earlier release without labelling it prominently.

The digest-bound local review cut runs for **156.023 seconds** (2 minutes
36.023 seconds), below the **2 minutes 59 seconds** maximum including title and
closing cards. It has not been published or submitted.

## Story in one sentence

OKF publishes governed evidence that can be retrieved progressively; WebMCP
lets a citizen-selected AI invoke five bounded tools over it, while the same
page lets a person inspect the source, integrity and limitations without the
government page hosting a model or receiving a personal profile.

## Shot sequence

| Time | Picture and action | Narration or caption | Evidence to retain |
| --- | --- | --- | --- |
| 0:00–0:22 | Start with the working human interface. Search `housing` across A Life in the UK, ONS, UK Government APIs and HM Land Registry, then pause on the balanced eight-result set. Keep “Independent experimental prototype” visible. | “Search housing across four locked OKF source snapshots. The results include A Life in the UK and ONS. They include UK Government APIs and metadata-only HM Land Registry. This is an independent prototype, not a government service.” | Exact human input, selected collections, returned canonical IDs and public release binding. |
| 0:22–0:42 | Show the estate summary: 80 receipt-bound reviewed records, 58,655 locked raw source rows, 58,652 searchable federated records and 3 quarantined rows. Keep both evidence-tier labels readable. | “Evidence Trace puts evidence before answers. Eighty reviewed records retain item-level evidence receipts. Another 58,652 records support wider governed discovery.” | Frame showing source, searchable and quarantine counts and tier labels. |
| 0:42–1:03 | Open the bound HM Land Registry result. Point to evidence tier, collection, snapshot integrity, recorded producer-declared source link, destination hostname and limitations. Show the explicit absence of an item receipt and the “Not independently established” authority label. | “This result keeps its collection and checksum-bound snapshot visible. Its source link has the producer-declared-source role. Source authority is not independently established.” | Record ID, link role, destination hostname, authority label, digest fields and limitation text. Do not follow an external link during the deterministic path. |
| 1:03–1:29 | Show the supported-host receipt visualisation: all five tool names, closed schemas, the same search, the bound record and the two reviewed-foundation calls. Clearly label it as a reconstruction, not a host recording. | “Its receipt records all five native page tools and their schemas. The page accepts no personal-context field and hosts no model. This receipt proves host invocation; no model selected a tool.” | Exact supported-host receipt, media receipt, tool arguments, result IDs and parity digests. |
| 1:29–1:52 | Switch to one reviewed record and show `explore_answer_foundations` followed by `compare_evidence_foundations`. Keep separate facets visible; do not show a combined score. | “People and agents can inspect one answer foundation and compare authority, freshness, integrity, rights, access and coverage. No combined score hides uncertainty or declares a winner.” | Visible reversible page effect, 8 facet labels, 11 comparison rows and restored page state. |
| 1:52–2:14 | Show the refreshed nine-step Safari and VoiceOver screenshot sequence with the Caption Panel visible and the non-continuous-recording limitation retained. | “A fresh manual Safari and VoiceOver journey checks headings, controls, search, source-link context, comparison, live status and focus restoration. This is not a WCAG conformance claim.” | Exact nine-frame manifest, manual observation, clip digest and acknowledged limitations. |
| 2:14–2:45 | Show the personal-AI boundary and close on “Your AI asks. You inspect the evidence.” Include the repository and live URLs. | “The page hosts no model. A citizen-selected AI sends only declared arguments. A remote provider may still receive the prompt, arguments and result. Privacy, cost and accuracy benefits remain hypotheses to test.” | Same-origin/no-storage observation, no model or official API requests, Land Registry metadata-only boundary, legislation exclusion counters and exact URLs. |

## Fixed demonstration inputs

- Human and tool query: `housing`.
- Collections: `uk-living`, `ons`, `government-apis` and `land-registry`.
- Result limit: `8`, the smallest tested human-interface value that returns a
  representative result from all four sources on the exact deployment.
- Federated record: `govuk-discovery:federated:land-registry:57845`.
- Reviewed answer: `answer:new-child-starting-points`; claims:
  `claim:register-a-birth` and `claim:check-parental-pay-and-leave`.
- Personal-context negative check: show the published schema and, if included
  in the recording, one bounded rejection of an unknown `personalContext`
  property. Never enter real personal information.

## Required accuracy boundaries

- Say **citizen-selected AI**, not “private AI” or “on-device AI”, unless the
  recorded host and model actually establish that stronger boundary.
- Say the page receives no profile and exposes no personal-context input. Do
  not claim that a remote model provider receives no personal information.
- Say **recorded producer-declared source link** or the exact recorded link role. Do not
  call every link an authoritative statement about the record.
- Show the destination hostname and say **producer-declared**, not **official**,
  for federated links and assertions. Exact-record source authority is “Not
  independently established”.
- Say **source-snapshot integrity** for the federated tier. Do not imply that an
  item has an evidence receipt when it does not.
- Say HM Land Registry is metadata-only. Do not imply title, ownership,
  property, address, polygon or personal-row coverage.
- Say there is no standalone legislation collection, payload, index or runtime
  request; 3 standalone Land Registry legislation rows are quarantined; and the
  searchable projection contains zero `legislation.gov.uk` result links. Do not
  imply that inert source-authored cross-references were rewritten out of
  checksum-bound source material.
- Present lower public cost, better questions, reduced disclosure and improved
  accuracy as hypotheses to test, not achieved impacts.

## Evidence still required before recording

- [x] Exact protected-main release commit and successful CI run.
- [x] Exact Pages deployment run, artefact identity and signed-out availability.
- [x] Current supported-host list and execution evidence for all five tools.
- [x] Recorded human/tool parity values for the fixed search and record.
- [x] Network and storage observation supporting the stated runtime boundary.
- [x] Reviewed final IDs and representative four-source result set.

The last complete pre-remediation checkpoint passed 144 of 144 unit tests and
29 of 29 installed-Microsoft-Edge acceptance tests. Seven Low findings were
remediated afterwards. The exact product release passes 194 of 194 prepared
unit tests and 30 of 30 tests in both installed Chrome and Microsoft Edge. A
prior evidence-follow-up checkpoint passed 195 of 195 locally and in protected
pull-request run `33391552626`; that run predates and does not validate the
current VoiceOver and video-evidence diff. Immutable fixed-tree scan
`040ad945-3723-4aef-9c03-1bb552630deb`
completed 55 of 55 review items against exact commit
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings.
Exact deployment, supported-host and live-interaction evidence are complete.
An isolated Chrome 152 / Chrome DevTools MCP 1.8.0 capture at
`2026-08-31T18:49:38.356Z` also discovered and completed all five tools against
the exact release, rejected `personalContext` by stable error code and recorded
zero console errors. Its first attempt stopped because the harness expected old
error prose; the stable-code harness correction and reviewed rerun passed. No
model or provider was used, and no general compatibility claim is made.
The current-release manual Safari and VoiceOver journey is also complete with
7 passes and 2 recorded limitations. Its nine-frame Caption Panel sequence is
retained as a 27-second screenshot-sequence clip: VoiceOver speech audio was
not captured, the sequence is not a continuous recording and it does not make
a WCAG conformance claim.

The guarded build produced a local 156.023-second MP4 with SHA-256
`e35d181d644fc8057a3f9757885feb322641784411ad27b7108987a1550a6fe4`. Its
H.264 video, AAC audio and English caption streams passed complete video and
audio decode, and all 40 normalised embedded caption cues matched the tracked
en-GB captions, script and transcript. This is technical evidence only: no
audible human playback or publication approval is claimed.

## Evidence still required before publication

- [x] Exact public `v0.3.0-rc.1` lists and completes all five tools in isolated
  Chrome 152 with browser-native WebMCP enabled through Chrome DevTools MCP
  1.8.0. Retain Codex In-app Browser evidence under its own name.
- [x] Final local capture uses the exact deployed release and follows this
  storyboard.
- [x] Local review-cut duration is 156.023 seconds, below three minutes.
- [x] Embedded captions, tracked captions, script and transcript agree after
  normalisation and use British English.
- [ ] Media, browser state, prompts, headers and results pass privacy and rights
  review.
- [ ] Claims match the retained host, CI, Pages, parity, network and integrity
  evidence.
- [ ] Chris Page approves the complete cut, synthetic-voice basis, branding,
  privacy, rights and hypothesis wording.
- [ ] Public playback works signed out with audible narration and captions.
- [ ] The public URL and exact video checksum are retained before the final
  read-only live-rules and Devpost-form refresh.

Do not upload, publish or submit a video merely because the automated build and
decode checks pass. Those checks do not replace owner review or public-player
verification.
