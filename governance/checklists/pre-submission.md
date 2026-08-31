# Final pre-submission checklist

## `v0.3.0-rc.1` federated candidate evidence gate

The checked evidence below belongs to the earlier 80-record release unless it
explicitly names the federated candidate. None of it can be carried forward as
proof for `v0.3.0-rc.1`. Complete this section against one exact public commit
before changing any item to checked. The last complete pre-remediation
checkpoint passed 144 of 144 unit tests and 29 of 29 installed-Microsoft-Edge
acceptance tests. Seven initial Low security findings were remediated afterwards.
A sealed scan suppressed those seven and found an eighth High-confidence Low
URL-boundary bypass, which was fixed post-snapshot. Current research,
build/data, lexical-quality, Chrome, Microsoft Edge and authorised model-free
smoke gates pass where recorded; the immutable post-fix rescan,
CI, Pages, current-host and refreshed-video evidence remain separate and
unchecked.

- [x] The current prepared unit command passed 190 of 190; Chrome and installed
  Microsoft Edge each passed 30 of 30 on the current final-candidate tree.
- [x] The current final-candidate rerun records research 4 of 4, passing production
  build/data validation, mean nDCG@10 `0.984698009`, Recall@20 `1`, cold/warm
  parity, legislation absent or rejected, and 30 of 30 in both installed Chrome
  and Microsoft Edge. The full unit result is recorded above.
- [ ] The immutable exact-tree security rescan verifies all eight Low
  findings as fixed and retains their IDs, dispositions, commands and failures.
  Sealed scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven
  and found `csf_a2d9e030fda789ecd1cb0e41`, but its coverage is mechanically
  partial and stale-pending and the eighth fix postdates its snapshot.
- [ ] Protected-main CI passes for the exact candidate commit, including
  deterministic source import, generated projection, schema, integrity, unit,
  browser, frozen nDCG@10/Recall@20 quality and security checks.
- [ ] GitHub Pages deploys the exact candidate commit and its federated assets;
  the public bytes, source locks and generated manifest match the retained
  evidence, including 58,655 raw rows, 3 quarantined rows, 58,652 searchable
  records and zero `legislation.gov.uk` result links.
- [ ] A currently supported host lists and completes all five WebMCP tools on
  that deployment, including the four-source search, exact record and
  provenance calls; record host, version, time and arguments.
- [ ] The fixed human and WebMCP journeys produce the same canonical evidence
  fields, and the page shows evidence tier, producer-declared source link,
  destination hostname, “Not independently established” source authority,
  integrity and limitations without inventing a federated item receipt or
  official status.
- [ ] A refreshed video shorter than three minutes is captured from the exact
  deployed federated candidate, accurately shows all four sources and the
  human/tool parity journey, and has reviewed captions and a transcript.
- [ ] Chris Page completes owner review of the candidate, video, synthetic
  voice, privacy, branding, rights, impact claims and remaining hypotheses.
- [ ] The approved public video URL plays signed out with sound and captions.
- [ ] A final read-only Devpost compliance review refreshes the rules, live
  fields, URLs, entrant attestations and current evidence without submitting.

## Governance no-go gate

- [ ] Entrant route is fixed and matches all accounts, repository ownership and the Devpost form.
- [x] Ownership/licence schedule is signed off; no material relies on assumed employer permission.
- [x] Outside-interest and resource assurances are recorded; prize and publicity details still need checking at submission.
- [x] Independent-prototype disclaimer and non-endorsement wording appear on
  the page and repository.
- [ ] Retain the independent-prototype and non-endorsement wording in the final
  video and submission.

## Exact build

- [x] Exact corrected product commit
  `edd4ce6b60c38c3c9fbac86408d6b58d1495671f` built and passed the documented
  suite in clean exact-main and Pages GitHub runners (`33323068982` and
  `33323152751`). The `v0.2.0-rc.1` evidence remains bound to its earlier commit.
- [x] Lock files are honoured; the post-tag evidence working tree and 14-commit
  history passed separate gitleaks scans.
- [ ] Re-scan the exact final evidence commit before submission.
- [x] Corpus and source locks rebuild deterministically; every required digest verifies.
- [x] Generated catalogue, Evidence Trace, federation manifest, schemas, records,
  receipts, notices and checksums are synchronised for the exact product commit;
  all 20 deployed files match the Pages artefact.
- [ ] **Optional release assurance:** produce a release-platform SBOM or
  attestation. The retained CycloneDX file is explicitly a local macOS ARM64
  dependency view; this is not a current official submission requirement.
- [x] Tool names, descriptions, schemas and executable validation agree.
- [x] The current working tree pins `jsonschema` 4.26.0, Chrome DevTools MCP
  1.8.0 and `webmcp-evals` 0.0.4; unnecessary transitive install scripts are
  explicitly denied.
- [x] Explicit missing licence or access states remain visible. A structurally
  absent required provenance, licence, access or human-URL field fails artefact
  admission rather than being silently inferred.
- [x] Demonstration inputs fail closed on preview-path substitution, receipt or
  media hash drift, unrelated VoiceOver media and incomplete manual journeys.
- [x] `npm run demo:preflight -- --overwrite` passes with the genuine VoiceOver
  clip, manual journey record and exact media/evidence binding.
- [x] The local video build receipt binds the 142.920-second MP4, captions,
  transcript, script and every evidence input. It is a local review receipt,
  not public-player evidence.

## Human and agent acceptance

- [x] Search, exact record and provenance work in the tested human keyboard and pointer journey; touch remains an observational gap.
- [ ] **Inclusive-design follow-up, not an official submission blocker:** finish
  the unproved screen-reader heading-rotor and automatic live-status checks.
- [x] The VoiceOver record covers every exact journey checkpoint, records two
  retained limitations, and binds the actual Safari scene by path, SHA-256 and
  capture interval without claiming WCAG conformance.
- [x] All nine screenshot-sequence frames were reviewed against the manual
  Safari and VoiceOver observation, the non-continuous label remains visible
  throughout, and the builder's declared metadata is not treated as independent
  proof of assistive-technology use.
- [x] Narrow-screen reflow, forced-colours, reduced-motion and automated contrast rules pass; manual zoom remains an observational gap.
- [x] `Codex In-app Browser` discovered and successfully called all five tools
  against the historical `v0.2.0-rc.1` public deployment on 30 August 2026. The
  final comparison's canonical and displayed result digests matched; this does
  not establish support in another host or revision.
- [x] One rules-named judging route is recorded against the exact published
  URL: native Chrome 152's WebMCP panel listed all five tools, completed all five
  valid calls and showed the safe `limit: 21` rejection. This does not establish
  ChatGPT desktop support.
- [x] Chrome DevTools MCP 1.8.0 separately completed all five calls on the exact
  corrected deployment, rejected `personalContext` and recorded zero console
  errors. This does not establish agent model selection.
- [x] The pinned model-free `webmcp-evals` smoke suite completed six of six
  authored calls across all five tools in isolated Chrome 152 without provider
  credentials on the authorised outside-socket-sandbox rerun. The first in-
  sandbox attempt failed with the expected loopback `EPERM`. This is execution
  evidence, not model-selection evidence.
- [x] Three failed local-model attempts are retained with Chrome 152,
  `webmcp-evals` 0.0.4, eight cases, three runs per case, no remote credential
  and exact `ollama:gpt-oss:20b` inventory digest
  `17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`.
  Results were 8 of 102 retry-expanded rows, 32 of 33 strict rows despite 33 of
  33 upstream, and 30 of 35 upstream. This records improved legibility and
  variance, not a model-backed pass.
- [ ] **Optional assurance:** Microsoft WebMCP Explorer is run from its pinned source revision in a
  fresh profile, first in Tools/Agent Step mode, with the exact provider class,
  model and extension digest recorded and no credential retained in evidence.
- [ ] **Optional assurance:** obtain a strict passing browser-selection result
  with one fixed explicitly local or remote model; no-call, context-
  minimisation, variance and valid alternate trajectories are reported without
  hiding the three failed local attempts.
- [x] The unsupported-host manual fallback was recorded against the deployed
  `v0.2.0-rc.1` site in a signed-out Chromium session where
  `document.modelContext` was absent.
- [x] Malicious metadata, overlong input, unknown keys, unsafe URLs, digest
  mismatch and explicit missing licence/access states produce safe outcomes.
  The dedicated stale and conflicting-assertion fixtures remain pending.
- [x] Five genuine public-page interaction clips are release/action/duration/hash
  bound and passed agent privacy and branding review; none contains browser
  chrome or source audio.
- [ ] Human publication review confirms the retained clips, receipt
  visualisation, VoiceOver scene and final cut are truthful, private and free of
  misleading branding.
- [x] The admitted Chrome native-panel and Chrome DevTools MCP reports and
  screenshots were reviewed for prompts, personal context, credentials,
  cookies, profile data and unredacted headers. Apply the same gate to any later
  Explorer or model-backed receipt.

## Public evidence

- [x] The live URL resolves without authentication and serves exact corrected
  product commit `edd4ce6b60c38c3c9fbac86408d6b58d1495671f`, Pages run
  `33323152751`, and matching catalogue, receipt, Evidence Trace and federation
  bytes.
- [x] Public repository resolves without authentication; the MIT licence is visible and detectable.
- [x] All 161 unique admitted official URLs returned a 2xx or 3xx response to the bounded 30 August 2026 HEAD audit; this does not prove future availability or rights.
- [ ] Video is publicly visible on YouTube, under three minutes, audible and
  covers both the working project and its WebMCP use. Retain accurate captions,
  a transcript and evidence that it is free of unlicensed media or misleading
  branding.
- [ ] Chris Page approves the installed `Daniel` synthetic voice for public use
  and verifies final playback, embedded captions and public-player captions.
- [ ] Devpost text contains no production-readiness, official-endorsement, comprehensive-coverage or guaranteed-accuracy claim.
- [x] Final read-only compliance review reconciles the live form requirements, project
  `1406973`, named judging environments, public-YouTube boundary and all human
  attestations without treating the local cut as submission evidence.
- [ ] Final project title, tagline (one-line description) and full project
  description are entered and checked in the live form.
- [ ] Live and repository URLs are entered in the live form and verified signed
  out.
- [ ] The nine required custom answers are completed truthfully: submitter type,
  country, app status, live URL, repository, tested agents or clients, AI tools
  used, learning level and career value. Any conditional organisation or
  existing-project fields are also complete where applicable.
- [ ] The approved public YouTube URL is entered and verified signed out.
- [ ] All submitted URLs are copied back from the final Devpost form and tested.

## Freeze and preserve

- [ ] Submit before the controlling deadline; do not rely on community or cached later timestamps.
- [ ] Save Devpost confirmation, timestamp, submitted text and screenshots.
- [x] Annotated tag `v0.2.0-rc.1` and its public pre-release target the exact
  deployed product commit without rebuilding different product bytes.
- [x] SHA-256 hashes are retained for the Pages artefact, all deployed site
  files, corpus files, package lock, schemas and dated evidence.
- [x] Retain SHA-256 freeze evidence for the local final video, captions,
  transcript and build receipt.
- [ ] Retain SHA-256 freeze evidence for the final submitted text when it
  exists.
- [ ] Avoid last-minute feature changes after acceptance; only evidence-preserving fixes may cross the freeze gate.
