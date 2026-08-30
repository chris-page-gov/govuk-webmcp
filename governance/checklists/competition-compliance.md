# Competition compliance checklist

Status values: **confirmed**, **verify**, **approval required**, **blocker**.

## Entrant and dates

- [x] **Confirmed:** the 29 August 2026 live rules check gives 3 September 2026, 13:00 Pacific / 21:00 BST.
- [ ] **Verify:** Devpost registration is complete under the same individual, team or organisation identity used in the submission.
- [ ] **Verify:** entrant remains eligible by age, residence, supported-country status and account requirements.
- [ ] **Approval required:** any team or organisation representative has written authority.
- [ ] **Blocker:** no actual or apparent conflict falls within the rules' exclusions.

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

- [ ] **Verify after deployment:** the public live URL exposes material WebMCP
  behaviour in a supported judging environment. Human fallback is locally
  verified; candidate deployment and an actual ChatGPT-host tool observation
  remain pending.
- [x] **Confirmed by controlled Chrome test:** page provides the manual journey when WebMCP is unavailable.
- [x] **Confirmed by test:** five fixed tools register after all four artefact families validate. The three catalogue query tools are read-only; the two evidence tools declare their reversible in-memory page-presentation effect with `readOnlyHint: false`. No tool has a runtime provider-call, storage or credential path.
- [x] **Confirmed by schema and browser tests:** all 80 records have authoritative human-validation links.
- [x] **Confirmed by test and copy review:** catalogue inclusion is not described as access authority.
- [ ] **Verify for `0.2.0-rc.1`:** the candidate passes protected pull-request CI and a clean-clone test; then prove the exact merged `main` commit and its bound artefacts at the live URL. The corresponding evidence is complete only for the prior `0.1.0-rc.1` release.

## Required artefacts

- [x] Public source repository with all source/assets/instructions and visible licence.
- [ ] Public live deployment of the exact `0.2.0-rc.1` candidate; no demo account is required for this static prototype. The live site currently serves the prior release.
- [ ] Public YouTube video shorter than three minutes.
- [ ] English text description explaining WebMCP leverage, execution, impact, creativity and boundaries.
- [ ] Immutable release/tag, hashes, provenance manifest, SBOM/notices and submission receipt retained.
