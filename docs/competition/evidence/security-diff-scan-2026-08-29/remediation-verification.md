# Release-candidate security remediation verification

The focused working-tree scan captured the initial release workflow and found
one medium-severity promotion-boundary vulnerability: a collaborator could
dispatch the Pages workflow on a non-`main` branch and publish those unmerged
bytes.

The release candidate now closes that path with both controls:

- the deploy job runs only when `github.ref == 'refs/heads/main'`; and
- checkout explicitly uses the triggering `github.sha`.

`tests/unit/release-evidence.test.mjs` asserts the main-only condition, exact
SHA checkout and absence of a pull-request trigger. An independent focused
re-review confirmed the original path is closed. The repository's GitHub Pages
environment must also be restricted to `main` after public visibility enables
that setting, as defence in depth.

The same publication-hygiene pass found third-party natural-person names and an
email address in npm's raw SBOM output. `scripts/sanitise-sbom.mjs` now removes
person-author metadata, and the regression test prevents those fields or email
patterns from returning. Component names, versions, package URLs, integrity
hashes, licences and dependency relationships remain.
