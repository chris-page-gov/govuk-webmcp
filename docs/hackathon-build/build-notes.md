# Guided-build notes

## 1 September 2026 — workflow recovery

The repository already had a project brief, implementation plan, backlog,
beginner PRD and accepted interface specification, but lacked the local state
and `docs/hackathon-build/` bridge expected by the optional Devpost guided-build
package. The bridge was created from those canonical sources; it does not
register, update or submit anything on Devpost.

Checklist item 1 is complete through PR #19 and protected-main validation run
`33528530607`. Item 2 is the current autonomous build item. Canonical project
status and release evidence remain in the established repository documents,
not in this workflow bridge.

## 1 September 2026 — Evidence answer worktree checkpoint

Candidate implementation for checklist items 2 to 5 is now visible in the
working tree: the closed projection and schemas, sixth presentation action,
bounded two-view navigation and text-only Evidence answer renderer. The items
remain unchecked because their release-specific accessibility observations,
protected deployment and six-tool
supported-host receipt are not yet complete.

This checkpoint is not a release. It records no protected pull request, Pages
deployment, `v0.4.0-rc.1` tag, GitHub release, video publication, final Devpost
review or submission. Historical `v0.3.0-rc.1` five-tool evidence remains
release-specific and is not carried forward.

Documentation-checkpoint verification run from the repository root:

- `./node_modules/.bin/tsc --noEmit` — passed;
- `node --test tests/unit/beginner-interface-specification.test.mjs
  tests/unit/guided-build-state.test.mjs` — 2 passed, 0 failed;
- Python standard-library CSV parsing confirmed consistent row widths for the
  source, evaluation, risk and asset registers; and
- `git diff --check` over the lockstep documentation files — passed.

The first attempted CSV check could not run because the repository does not
install `csv-parse`; the standard-library check replaced it. That historical
documentation-only checkpoint did not claim a full product suite.

## 2 September 2026 — settled post-hardening local verification

The optional guided-build package can now initialise from the repository-local
state, scope, PRD, specification, checklist and these notes. Its submission
status remains `not-started`; fixing the recurrent warning did not register,
update or submit a Devpost entry.

The candidate source passes research-pack verification; the production build
and complete 80-reviewed plus 58,652-federated projection audit; 398 of 398 unit
tests; 43 of 43 installed-Chrome and 43 of 43 installed-Edge tests; frozen mean
nDCG@10 `0.984698009` and Recall@20 `1`; 7 of 7 model-free smoke envelopes;
zero npm-audit vulnerabilities across 162 dependencies; and the pinned Python
environment checks. `npm run build:verify-deterministic` confirms two complete
1,883-file, 128,653,230-byte builds at aggregate SHA-256
`cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
Historical code-snapshot security scan `aedf88e3-6a77-46af-be6b-2c672001dd46`,
digest
`codex-security-snapshot/v1:sha256:54069030a2b50cc5a9a084c5973fc06d4b07ea898acab187d3c543c9aa70df0e`,
completed 36 of 36 items, ran 102 focused tests and found zero findings for its
snapshot. Later pre-fix scan `dcfed744-0676-40c1-a0ef-84dd3cc7b52b` found one
Low receipt-authentication defect. Its fresh-authentication remediation has
focused and integrated test coverage. Sealed post-fix scan
`185ce6fa-a47f-4c5e-9888-c63a9f932205` completed all 33 selected
executable-source items with complete configured coverage and zero reportable
findings for its exact snapshot.

After protected integration, use a clean checkout of the exact successful Pages
commit. Run `npm run deployment:verify-live` with that commit and the exact
Pages run ID, review the ignored mode-`0600` receipt and confirm the checkout
stays clean before and after replay. Admit reviewed evidence only in a separate
post-deployment evidence change. Candidate manual Safari, VoiceOver and Caption
Panel observations, live six-tool calls, both 36-run host matrices, nine-scene
video, exact release tag and public-player review remain pending.

## 1 September 2026 — first PR validation follow-up

Pull request 20 validation run `33552638564` reached the prepared unit suite.
It recorded 270 passes, 0 assertion failures and 2 cancellations, then skipped
the later quality and smoke jobs. The cancelled cases were the live Pages tar
logical-byte deadline and complete-response deadline. Both operations awaited
timers that had been unreferenced; on the Linux runner the event loop could
finish before either deadline fired. The verifier now retains those two
deadline handles until their operations settle. Historical released receipts
and all timeout bounds remain unchanged.

## 1 September 2026 — protected integration and exact deployment

The corrected pull request #20 passed and merged as protected-main product
commit `a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`. Protected-main validation run
`33554600300` passed. Manual Pages run `33555187118` deployed that same commit.

The version 2 live verifier compared all 1,884 regular artefact files and
128,646,735 bytes with the public site. Every request returned HTTP 200 and
there were zero mismatches. Isolated Chrome 152 through Chrome DevTools MCP
1.8.0 then discovered and completed all six WebMCP tools, rejected an unrelated
`personalContext` field and recorded zero console errors. No model selected a
tool and no model provider was called. The observation used Chrome
152.0.7977.66 and matched the final tool and displayed Evidence answer digest
`0424acfc7ad7869b7e7320f6bea9c822a6453101f26e2719fdfe8b5c2c9fd0e3`.
It captures no host-owned surface. Review found and corrected a pre-admission
validation gap. The last pre-hardening corrected-path capture at
`2026-09-02T01:56:15.734Z` has raw, reviewed Chrome and
supported-host SHA-256 values
`2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`,
`e9d67af0799ee6772396837bd4ab8df7538ae8a11c6d5c62ef08e1b505d5a8e7`
and `b98c43fd394ea74731d59a114aecb69897a60fe978b1ebc352a4347ba1046f33`.
Its rebuilt 40.966667-second ignored receipt reconstruction has SHA-256
`db8a9eaaadc0e4b2d6716c52cec5cde995f7a1e56d54fc3e92df96089fcfb835`;
the tracked clip receipt has SHA-256
`4ee76fa70e48fca22e6874500d4bfa8a9c19d75bdbec5116276c23efffc5a528`.

The corrected path validates all six published input and output schemas,
canonical results, the complete presentation digest and exact live Pages `v2`
receipt. Raw, reviewed and supported-host projections are promoted as one
recoverable set; raw overwrite and reviewed-evidence overwrite are separately
explicit. Final-video preflight revalidates the closed VoiceOver manifest and
all nine frame bytes. The build, capture and evidence paths share one canonical
legislation-host rejection, generated media use one recoverable output
transaction, private `.evals` roots may not be symbolic and privacy copy makes
clear that bounded free text can still disclose personal details. The settled
production build and all 398 prepared unit tests pass; the
personal-agent suite passes 32 of 32. Current Chrome and Edge reruns each pass
43 of 43. The first current Chrome run's single cancellation-test failure did
not reproduce standalone, over 10 concurrent repetitions or in the complete
rerun and is retained as a runner/test flake rather than a product pass.

Checklist items 2 to 6 are complete. Item 9 remains open because the separate
post-deployment evidence change must be reviewed, merged, deployed and compared
again before the annotated tag and GitHub prerelease are created.

## 1 September 2026 — evaluation and media follow-up

The patched 36-case local Ollama diagnostic is complete. Its capture-schema-v3
mode-`0600` private capture SHA-256 is
`ac6dd41ef1733b2ea8e553da5d7aa5666c5f55d23643a89fb57d22632c63f5a8`;
the tracked privacy-minimised summary SHA-256 is
`a249548772fefed95b87db48c27ccda8f66baa09e43a2087c8dc6390509f283f`.
It records 36 observed local and 36 missing Copilot runs. Among 118 recognised
calls, 108 are deterministic successes and 10 explicit rejections across nine
runs; two unavailable or null-result attempts remain runner diagnostics. Tool
selection and deterministic execution each pass 6 and fail 30. Page parity is
not observable for all 36, all answers are unreviewed and context is 0 complete.
Browser-console, page-error, network-error and latency telemetry are not
observable; runner errors are observed with 34 clean and 2 bounded-error runs,
and interaction steps are observed from 1 to 6.
US-10 tool-argument checks pass 3 of 3 and tool-result checks pass 3 of 3
without synthetic-marker leakage. Conversion and replay pass, while
authenticated verification correctly refuses the dirty, unbound loopback
context. The claim gate remains
false and the Copilot matrix remains missing.

Five silent exact-release page clips have been captured for the Evidence
answer, human presentation, comparison guide, Technical review and personal-AI
boundary. Agent privacy and branding review passed; human publication review
remains pending. The v4 interaction receipt SHA-256 is
`4ce8b09bad6a8b9d5a981d31c2e5ad4f0d1d3030d4eba1758e93f4000c0870aa`
and binds checks before and after every scene. The candidate Safari and
VoiceOver Caption Panel journey completed with 6 passed and 3 limited
checkpoints and eight limitation statements. The exact 27-second clip,
nine source frames and capture manifest are hash-bound and narrowly tracked as
11 release-build inputs totalling 5,584,101 bytes; including the manual
evidence makes 5,591,303 bytes. Speech audio was not captured, there is no
independent capture-time deployment binding and no WCAG claim is made. The
Caption Panel and VoiceOver were verified off afterwards.

The truthful local Ollama diagnostic visualisation is also generated. Its
37-second, 1,849,825-byte ignored release-media clip has SHA-256
`95bb7ab39361546021601cbb126a41d4530916ab08d9d709abbe89c7cd623f63`;
the tracked public receipt binds the exact private-source digest without
admitting private bytes to tracked history, the public summary and model digests, failed and
unknown criteria and the no-host-recording/no-page-update boundary. The
receipt has SHA-256
`182f9308464e5ba1773e316965f627a200d6df2f38a85a70a4a37e3178296fe4`.
Against pre-integration product commit `a4fabe...`, final-video preflight fails
only on the three absent genuine Copilot artefacts. This hardening changes built
bytes, so those inputs are not final-release evidence. Merge and deploy the
hardening first; then recapture every exact-release page, Chrome, supported-host
and VoiceOver input, rerun 36 clean release-bound local slots and 36 visible
Copilot slots, and build the video before tagging that deployed product commit.
The complete host comparison, final video, tag, GitHub prerelease, final Devpost
review and submission remain open.

The optional guided-build package now initialises from the repository-local
state and bridge; the recurrent missing-state warning is fixed. Its
`submission.status` remains `not-started`. No Devpost entry was registered,
updated or submitted.

## 2 September 2026 — clean-runner portability and receipt staging

Pull request 21 validation run `33593265033`, job `100131452398`, failed for
four recorded reasons. The demonstration-video unit module read the ignored
`.evals/chrome-devtools-mcp-public.json` fixture while it was being loaded, so a
clean runner could not initialise the test. Two namespace-substitution tests
assumed that replacing a file must change its device or inode; the Linux runner
could immediately reuse the inode. Finally, the `webmcp-evals` patcher's backup
cleanup trusted that recycled device/inode pair and could remove a same-name
replacement. The last case was a real evidence-preservation defect, not merely
a platform-specific test expectation.

The clean-runner fixture is now reconstructed from tracked reviewed Chrome and
supported-host evidence before use. Its reconstructed raw bytes are exactly
133,272 bytes with SHA-256
`2078a6aab131c5724a7d9364183641107c56efd446dbf6452226ebffa9d1b25e`.
Portable cleanup, rollback and promotion checks now bind exact bytes, mode,
size and the available identity metadata; changed validated outputs are
preserved rather than removed, including where Linux reuses an inode. The
integrated prepared unit suite passes 398 of 398. A new
protected CI success, hardened Pages deployment and exact-release recapture are
not yet claimed.

Two independent follow-up reviews corrected the remaining local boundaries.
Descriptor-bound, no-follow mode normalisation now handles a restrictive umask
and rejects permission drift after `fchmod`; the no-argument VoiceOver clip
builder now selects the canonical exact `v0.4.0-rc.1` capture manifest. Focused
post-fix checks pass 116 of 116 and an independent clean review passes 71 of
71. Final local automated verification is complete: the prepared unit suite
passed 398 of 398 in 67,006.169333 ms; installed Chrome passed 43 of 43 in
17.7 seconds; installed Edge passed 43 of 43 in 17.5 seconds; and two
deterministic builds each contained 1,883 files and 128,653,230 bytes at
aggregate SHA-256
`cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
Protected integration, deployment, exact-release recapture and the final
current-snapshot security and manual gates remain separate.

For that future successful Pages run, the operator must securely create both
ignored receipts through the verifier:

```bash
WEBMCP_EXPECTED_COMMIT="$RELEASE_COMMIT" GOVUK_WEBMCP_PAGES_RUN_ID="$PAGES_RUN_ID" npm run deployment:verify-live -- --stage-private-release-receipt
```

There is no manual-copy step. The private receipt is mode `0600` and is not
overwritten by default. Supplying
`--overwrite-private-release-receipt` together with the staging flag is an
explicit invalidation event: every dependent host, personal-agent,
accessibility and media capture must then be repeated.
