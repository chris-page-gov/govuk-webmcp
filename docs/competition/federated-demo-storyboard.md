# Federated demonstration storyboard

**Status: production plan only. No refreshed federated video is claimed.**

Use this storyboard only after `v0.3.0-rc.1` is merged through protected
`main`, deployed to the public Pages URL and verified byte for byte. Record the
real deployment in one named, currently supported WebMCP host. Do not substitute
a local build, mock result or earlier release without labelling it prominently.

Target running time: **2 minutes 45 seconds**. Maximum: **2 minutes 59
seconds**, including title and closing cards.

## Story in one sentence

OKF publishes governed evidence that can be retrieved progressively; WebMCP
lets a citizen-selected AI invoke five bounded tools over it, while the same
page lets a person inspect the source, integrity and limitations without the
government page hosting a model or receiving a personal profile.

## Shot sequence

| Time | Picture and action | Narration or caption | Evidence to retain |
| --- | --- | --- | --- |
| 0:00–0:10 | Title card over the exact public URL and candidate version. Show “Independent experimental prototype”. | “Evidence Trace puts evidence before answers. This is an independent prototype, not a government service.” | Deployed commit, URL, host version and capture time. |
| 0:10–0:27 | Show the estate summary: 80 receipt-bound reviewed records, 58,655 locked raw source rows, 58,652 searchable federated records and 3 quarantined rows. Keep both evidence-tier labels readable. | “There are two honest evidence tiers: 80 reviewed records with item receipts, and 58,652 wider searchable records from 58,655 locked source rows. Three standalone legislation rows are quarantined. Wider discovery does not pretend to have deeper proof.” | Screenshot or frame showing source, searchable and quarantine counts and tier labels. |
| 0:27–0:49 | In the visible human interface, select UK Living, ONS, UK Government APIs and HM Land Registry. Search the fixed term `housing`. Pause on a balanced result set containing all four collections. | “A person can search four governed OKF sources together: UK Living, ONS, the UK Government API catalogue and metadata-only HM Land Registry.” | Exact human input, selected collections and returned canonical IDs. |
| 0:49–1:08 | Open one federated result. Point to evidence tier, collection, snapshot integrity, producer-declared human source link, destination hostname and limitations. Show the explicit absence of an item receipt and the “Not independently established” authority label. | “Each result keeps its origin, checksum-bound snapshot, producer-declared link destination and limitations visible. It does not call the source official, and this source-snapshot record has no item-level receipt.” | Record ID, link role, destination hostname, authority label, digest fields and limitation text. Do not follow an external link during the recorded deterministic path unless separately planned. |
| 1:08–1:28 | Open the supported host's WebMCP tool list. Show all five names and the closed search input contract. Briefly highlight that no `personalContext`, profile, postcode, account or free-form situation field exists. | “The page registers five bounded tools. It hosts no model and accepts no personal profile. A citizen's chosen AI can keep its private context and send only the declared query fields.” | Tool-list capture and exact input schema. |
| 1:28–1:49 | Execute `search_government_knowledge` with the same `housing`, four-collection and limit inputs. Show the structured output beside, or immediately followed by, the unchanged visible results. | “WebMCP calls the same deterministic action as the human form. The structured result and visible page describe the same evidence, rather than two separate answers.” | Tool arguments, result IDs, canonical digest or parity assertion, and page state. |
| 1:49–2:06 | Execute `get_resource_record` for the previously opened federated ID, then `show_provenance`. Keep the source link and “no item receipt” limitation visible. | “The agent can retrieve the exact record and its provenance progressively. It cannot turn a collection snapshot into an item receipt that does not exist.” | Both tool outputs and their parity with the human record. |
| 2:06–2:24 | Switch to one reviewed record and briefly show `explore_answer_foundations` followed by `compare_evidence_foundations`. Keep separate facets visible; do not show a combined score. | “For the reviewed tier, people and agents can go deeper: inspect claim foundations and compare authority, freshness, integrity, rights and coverage without hiding uncertainty in one score.” | Tool calls, visible reversible page effect and restored page state. |
| 2:24–2:37 | Show a concise boundary card: static site; no official API call; no model call; no browser storage; HM Land Registry metadata only; 3 legislation rows quarantined; no standalone legislation source and zero legislation result links. | “This static demonstration calls neither official APIs nor a model at runtime. Land Registry is metadata-only. Three standalone legislation rows are quarantined, and no legislation result link is published.” | Network capture or automated evidence supporting same-origin-only requests, no storage and the exclusion counters. |
| 2:37–2:45 | Closing card: “Your AI asks. You inspect the evidence.” Add repository and live URLs. | “WebMCP makes the citizen's AI a client of inspectable public evidence — not the authority.” | Final frame and exact URLs. |

## Fixed demonstration inputs

- Human and tool query: `housing`.
- Collections: `uk-living`, `ons`, `government-apis` and `land-registry`.
- Result limit: use the smallest tested limit that returns a representative
  result from all four sources on the exact deployment; record it in the
  receipt rather than assuming it in advance.
- Record and reviewed-claim IDs: choose them only after the deployment is
  frozen, then store the exact IDs and expected canonical fields with the video
  receipt.
- Personal-context negative check: show the published schema and, if included
  in the recording, one bounded rejection of an unknown `personalContext`
  property. Never enter real personal information.

## Required accuracy boundaries

- Say **citizen-selected AI**, not “private AI” or “on-device AI”, unless the
  recorded host and model actually establish that stronger boundary.
- Say the page receives no profile and exposes no personal-context input. Do
  not claim that a remote model provider receives no personal information.
- Say **maintained human source link** or the exact recorded link role. Do not
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

- [ ] Exact protected-main candidate commit and successful CI run.
- [ ] Exact Pages deployment run, artefact identity and signed-out availability.
- [ ] Current supported-host list and execution evidence for all five tools.
- [ ] Recorded human/tool parity values for the fixed search and record.
- [ ] Network and storage observation supporting the stated runtime boundary.
- [ ] Reviewed final IDs and representative four-source result set.

The last complete pre-remediation checkpoint passed 144 of 144 unit tests and
29 of 29 installed-Microsoft-Edge acceptance tests. Seven Low findings were
remediated afterwards. The final-candidate local rerun now passes 193 of 193
prepared unit tests and 30 of 30 tests in both installed Chrome and Microsoft
Edge. The fresh immutable fixed-tree scan, exact deployment and host evidence remain
required; neither the old checkpoint nor local checks replace them. The demo
preflight correctly failed closed without a deployed commit and explicit
overwrite approval, and no live capture started.

## Evidence still required before publication

- [ ] Capture uses the exact deployed candidate and follows this storyboard.
- [ ] Final duration is below three minutes.
- [ ] Narration, captions and transcript agree and use British English.
- [ ] Media, browser state, prompts, headers and results pass privacy and rights
  review.
- [ ] Claims match the retained host, CI, Pages, parity, network and integrity
  evidence.
- [ ] Chris Page approves the complete cut, synthetic-voice basis, branding,
  privacy and hypothesis wording.
- [ ] Public playback works signed out with audible narration and captions.
- [ ] The public URL and exact video checksum are retained before the final
  read-only Devpost compliance review.

Do not upload, publish or submit a video merely because the automated build and
decode checks pass. Those checks do not replace owner review or public-player
verification.
