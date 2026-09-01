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

## 1 September 2026 — final local candidate verification

The optional guided-build package can now initialise from the repository-local
state, scope, PRD, specification, checklist and these notes. Its submission
status remains `not-started`; fixing the recurrent warning did not register,
update or submit a Devpost entry.

The current candidate passes research-pack verification; the production build
and complete 80-reviewed plus 58,652-federated projection audit; 272 of 272 unit
tests; 43 of 43 installed-Chrome and 43 of 43 installed-Edge tests; frozen mean
nDCG@10 `0.984698009` and Recall@20 `1`; 7 of 7 model-free smoke envelopes;
zero npm-audit vulnerabilities across 162 dependencies; and the pinned Python
environment checks. `npm run build:verify-deterministic` confirms two complete
1,883-file, 128,646,550-byte builds at aggregate SHA-256
`3d8a46a18ec056190d41e29b825f9f79beae15463c3922d4a8bfcacab7f7094b`.
Frozen code-snapshot security scan `aedf88e3-6a77-46af-be6b-2c672001dd46`,
digest
`codex-security-snapshot/v1:sha256:54069030a2b50cc5a9a084c5973fc06d4b07ea898acab187d3c543c9aa70df0e`,
completed 36 of 36 items, ran 102 focused tests, found zero findings and
concluded that there is no security release blocker.

After protected integration, use a clean checkout of the exact successful Pages
commit. Run `npm run deployment:verify-live` with that commit and the exact
Pages run ID, review the ignored mode-`0600` receipt and confirm the checkout
stays clean before and after replay. Admit reviewed evidence only in a separate
post-deployment evidence change. Candidate manual Safari, VoiceOver and Caption
Panel observations, live six-tool calls, both 36-run host matrices, nine-scene
video, exact release tag and public-player review remain pending.
