# Competition compliance checklist

Status values: **confirmed**, **verify**, **approval required**, **blocker**.

## `v0.3.0-rc.1` federated candidate compliance gate

Existing confirmations below preserve historical observations for the earlier
80-record release. They do not establish compliance of the federated candidate.
Complete this section against one exact public commit before using the candidate
in a submission. The last complete pre-remediation checkpoint passed 144 of 144
unit tests and 29 of 29 installed-Microsoft-Edge acceptance tests. Seven initial Low
security findings were remediated afterwards. A sealed scan suppressed those
seven and found an eighth High-confidence Low URL-boundary bypass, which was
fixed post-snapshot. The current research, build/data, lexical-quality, Chrome,
Microsoft Edge and authorised model-free smoke gates pass where recorded; the
immutable post-fix security rescan remains open, as do the
deployment, host and media gates below.

- [x] **Re-verified locally after remediation:** the current full unit command
  passed 173 of 173 in `17128.154916 ms`; Chrome and installed Microsoft Edge
  each passed 29 of 29 on the current tree.
- [x] **Current partial rerun recorded:** research passed 4 of 4, production
  build/data validation passed, the frozen lexical gate reported mean nDCG@10
  `0.984698009`, Recall@20 `1`, cold/warm parity and legislation absent or
  rejected, and installed Chrome and Microsoft Edge each passed 29 of 29. The
  full unit result is recorded above.
- [ ] **Re-scan the exact tree:** all eight Low findings are verified
  fixed against one immutable candidate; retain their IDs, dispositions,
  commands and failures. Sealed scan
  `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven and found
  `csf_a2d9e030fda789ecd1cb0e41`, but has mechanically partial and stale-pending
  coverage and predates the eighth fix.
- [ ] **Verify in CI:** protected-main checks pass for the exact candidate,
  including deterministic source import and generation, semantic and checksum
  failure cases, schemas, tests, the frozen nDCG@10/Recall@20 quality gate and
  publication boundaries.
- [ ] **Verify on Pages:** the exact candidate commit, five-tool contracts, 80
  reviewed records, 58,655 locked raw source rows, 3 quarantined rows and 58,652
  searchable federated records are served with matching hashes; there is no
  standalone legislation collection or request and no `legislation.gov.uk`
  result link.
- [ ] **Verify in a current supported host:** list and complete all five WebMCP
  calls on the deployed candidate, record exact host details, and do not claim
  model selection unless separately observed.
- [ ] **Verify parity and privacy boundary:** the fixed human and tool journeys
  return the same canonical fields; no tool accepts a personal profile or
  `personalContext`; the federated tier does not claim an item receipt or
  official status; links and assertions remain producer-declared; exact-record
  source authority is “Not independently
  established”; and the human view shows each recorded destination hostname.
- [ ] **Produce refreshed evidence:** record a federated demonstration shorter
  than three minutes from the exact deployment, with all four sources, accurate
  narration, captions, transcript and retained build evidence.
- [ ] **Owner approval required:** Chris Page approves the final candidate,
  synthetic-voice basis, media, privacy, branding, rights, statements about
  WebMCP impact and the explicit hypothesis boundaries.
- [ ] **Verify public video:** the approved URL plays signed out with audio and
  captions and identifies the exact candidate shown.
- [ ] **Final review required:** repeat the live Devpost and rules review,
  reconcile every field and URL with current evidence, and retain the result
  without submitting.

## Entrant and dates

- [x] **Confirmed:** the 29 August 2026 live rules check gives 3 September 2026, 13:00 Pacific / 21:00 BST.
- [x] **Confirmed by authenticated read-only Devpost check:** competition
  registration is complete.
- [ ] **Verify before submission:** the individual, team or organisation route
  and identity in the final form match the registered entrant.
- [ ] **Verify:** entrant remains eligible by age, residence, supported-country status and account requirements.
- [ ] **Approval required:** any team or organisation representative has written authority.
- [x] **Confirmed by entrant assurance for the declared repository scope:** no
  actual or apparent outside-interest conflict blocks build or publication.

## Ownership and rights

- [x] **Confirmed:** Chris Page's assurance identifies the original work and personal development resources; `NOTICE.md` separates source-specific material.
- [x] **Confirmed:** original repository code and documentation are owned by Chris Page; source-specific warranties remain bounded by the notice.
- [ ] **Verify:** pre-existing work is disclosed and the judged WebMCP extension is separately evidenced after 25 August 2026 11:00 PDT.
- [x] **Confirmed:** top-level MIT licence is visible and `NOTICE.md` does not imply a blanket data licence.
- [ ] **Verify:** all copied code, metadata, images, fonts, music, logos and trade marks have a recorded reuse basis.
- [ ] **Verify:** GOV.UK/Crown material carries OGL attribution only where applicable; excluded logos, trade marks, personal data and third-party works are not copied.

## Employment, conflicts, prize and publicity

- [x] **Confirmed by entrant assurance:** original work used Chris Page's owned MacBook and personal subscriptions; no outside interest blocks this repository.
- [x] **Confirmed by entrant assurance:** no secondment-host resource or unpublished material is in scope for this repository.
- [ ] **Verify before submission:** prize, tax and promotional arrangements remain accurate at submission time.
- [ ] **Verify:** submission language does not imply endorsement by WCC, DSIT, BDUK, GDS, GOV.UK or another public body.

## Technical submission

- [x] **Confirmed on the public site:** the unchanged, checksum-bound
  `v0.2.0-rc.1` evidence is
  retained and corrected protected-main commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` is deployed with its signed-out
  human fallback verified.
- [x] **Confirmed in one supported host:** `Codex In-app Browser` discovered and
  successfully called all five tools on the historical `v0.2.0-rc.1` public
  deployment on 30 August 2026. The observation is specific to that host,
  revision and time.
- [x] **Confirmed in a named judging environment:** a disposable Chrome
  152.0.7977.64 profile with WebMCP testing enabled loaded the corrected public
  URL. Its native Application → WebMCP panel listed all five tools, completed
  all five valid calls and displayed the structured rejection for invalid
  `limit: 21`.
- [x] **Confirmed independently on the same public revision:** Chrome DevTools
  MCP 1.8.0 completed all five calls, rejected synthetic `personalContext` and
  recorded zero console errors. This is deterministic host execution, not
  model-selection evidence.
- [x] **Confirmed locally without a model provider:** `webmcp-evals` 0.0.4
  completed six of six authored smoke calls across all five tools on the
  authorised rerun outside the socket sandbox. The first in-sandbox attempt
  failed with the expected loopback `EPERM`. This does not prove agent
  selection.
- [x] **Failed local-model attempts retained:** three Chrome 152 attempts used
  eight cases, three runs per case and exact loopback-only
  `ollama:gpt-oss:20b`, inventory digest
  `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
  without remote credentials. Results were 8 of 102 retry-expanded rows, 32 of
  33 strict rows despite 33 of 33 upstream, and 30 of 35 upstream. All failed;
  improved model legibility is not a passing model-selection claim.
- [ ] **Optional assurance, not a submission blocker:** run the pinned Microsoft WebMCP
  Explorer and obtain a passing fixed-model browser evaluation in an isolated
  profile, recording local-versus-remote processing, no-call behaviour and
  variance without discarding the three failed attempts.
- [x] **Confirmed by controlled Chrome test:** page provides the manual journey when WebMCP is unavailable.
- [x] **Confirmed by test for the historical release:** five fixed tools
  register after its four artefact families validate. The federated candidate
  adds the lazy search manifest as a fifth logical root family and still
  registers no tool until all five validate. The three catalogue query tools
  are read-only; the two evidence tools declare their reversible in-memory
  page-presentation effect with `readOnlyHint: false`. No tool has a runtime
  provider-call, storage or credential path.
- [x] **Confirmed by schema and browser tests:** all 80 records have authoritative human-validation links.
- [x] **Confirmed by test and copy review:** catalogue inclusion is not described as access authority.
- [x] **Confirmed for the corrected protected-main deployment:** pull request
  12 passed and integrated through protected `main`; exact-main run
  `33323068982` and Pages run `33323152751` rebuilt and tested product commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, and all 20 live files matched
  artefact `9735478602`. The earlier `v0.2.0-rc.1` evidence remains historical.

## Required artefacts

- [x] Public source repository with all source/assets/instructions and visible licence.
- [x] Public live deployment of exact corrected product commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` at
  <https://chris-page-gov.github.io/govuk-webmcp/>; no demo account is required.
- [x] Five genuine page-only interaction clips are bound to the exact public
  release, required actions, durations and SHA-256 values; agent privacy and
  branding review passed.
- [ ] Chris Page completes the human publication review of every retained clip
  and the final edit.
- [x] Genuine manual VoiceOver journey record and scene media exist with exact
  path, SHA-256, capture-time and journey-step binding, with two retained
  limitations and no WCAG conformance claim.
- [x] The nine actual Safari and VoiceOver frames were reviewed and the
  resulting scene stays visibly labelled as a screenshot sequence, not a
  continuous recording; manifest declarations alone do not satisfy this gate.
- [x] Guarded video preflight passes and the local build receipt binds the
  142.920-second MP4, captions, transcript, script and evidence inputs. This is
  not public-player evidence.
- [ ] Chris Page approves the synthetic-voice publication basis and verifies the
  final audible playback, captions, transcript, privacy and branding.
- [ ] Publicly visible YouTube video shorter than three minutes, with audio that
  shows the working project and explains its WebMCP use.
- [x] English draft text explains WebMCP leverage, execution, impact, creativity
  and boundaries; final entry and submission remain separate gates.
- [x] The annotated `v0.2.0-rc.1` tag, public pre-release, product and Pages
  hashes, challenge provenance, local macOS ARM64 SBOM and notices are retained.
- [ ] **Optional release assurance:** produce a release-platform SBOM or signed
  attestation; this is not a current official submission requirement.
- [x] Final read-only Devpost compliance review checks every current required field and
  records the named-host, local-video/public-YouTube and human-attestation
  boundaries without submitting.
- [x] Post-deployment compliance review refreshed after the corrected exact
  commit was deployed and the Chrome native-panel and DevTools MCP reports were
  privacy-reviewed.
- [ ] Enter and verify the final project title, tagline (one-line description)
  and full project description in Devpost.
- [ ] Enter and verify the public live URL and public repository URL in the
  Devpost form.
- [ ] Complete the nine required custom answers: submitter type, country, app
  status, live URL, repository, tested agents or clients, AI tools used,
  learning level and career value. Complete any conditional organisation or
  existing-project fields truthfully.
- [ ] Add the approved public YouTube URL to Devpost and verify it signed out.
- [ ] Retain the final submission receipt after an authorised submission.
