# Codex handover

## Current outcome

The complete public release candidate is merged to `main`. It expands the
preserved baseline and first slice to an 80-record, 80-receipt static catalogue
with three imperative WebMCP tools and an accessible human journey over one
deterministic execution layer.

Private review publication:

- repository: `chris-page-gov/govuk-webmcp`;
- pull request: `#1`, merged;
- merge commit: `2f4b0761e80f3abc8c7bff9d5f1ee2db90afa677`;
- implementation commit: `9dabfd26e5333aa37549b7bcf43e5401be9ed707`;
- exact post-merge `main` GitHub Actions run `33272094321`: passed, including
  the static build artefact;
- Dependabot configuration check: passed.

Private pull request `#5` merged the browser-startup follow-on as
`3a2d7faac43ec13e785a1cb694ed175c34d45553`. It replaces the apparent
direct-file “Verifying…” hang with HTTP guidance, adds `npm run serve`, bounds
startup to 10 seconds and makes the existing browser suite selectable for Edge.
Exact post-merge `main` run `33272360982` passed, retained the static build
artefact and emitted no deprecated action-runtime warning.

## Source locks

- preserved research baseline commit: `4c85db7`;
- `okf-govuk-content` commit:
  `94f5020cb2c7512a79c2353ee48743ad733a132c`;
- source Git blob: `e7f3b6a0d1efa6cb336b1b50a69228de26216aa5`;
- imported 69-record SHA-256:
  `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc`;
- curated 11-record SHA-256:
  `f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794`;
- generated bundle digest:
  `20593105f6e34d5072f566b4f7b98cab143c4333c56bbabfca831b935237945c`.

These references are provenance, not authority to alter any source repository.
No `gis-ai-go` or OKF source repository was modified.

## Implemented boundary

- static, same-origin and read-only;
- human interface works without WebMCP;
- exactly three closed, bounded tools register after full integrity validation;
- no runtime official API call, credential, analytics, cookie or query storage;
- source-derived text is untrusted and rendered inertly;
- authoritative links, access, licence, assertions and limitations stay visible;
- original code is MIT licensed; source-specific rights remain explicit.

## Final local validation on 29 August 2026

- `npm run test:unit`: 14 passed;
- `PLAYWRIGHT_PORT=4178 npm run test:browser`: 9 installed-Chrome tests passed;
- `PLAYWRIGHT_PORT=4177 npm run test:browser:edge`: the same 9 tests passed in
  Microsoft Edge 152.0.4191.53;
- the browser suites include direct-file guidance and an axe smoke test with no
  serious or critical violations;
- catalogue JSON Schema validation: 80 records and 80 receipts passed;
- preserved research-pack validation: 4 checks passed; optional Python
  `jsonschema` meta-schema checks were skipped because that package is not
  installed;
- `npm audit --audit-level=moderate`: 0 vulnerabilities;
- gitleaks 8.30.1 found no secret in the six-commit history or working tree; and
- a clean clone at the release commit passed an offline `npm ci` and the
  complete 14-unit/contract plus 9-Chrome-test suite on isolated port 4179.

## Public release evidence

The complete build and browser-startup follow-on are merged. Public-source and
deployment authorisation is now recorded. The release candidate includes
public policy documents, SBOM, a 161-URL official-link HEAD audit, expanded
responsive and forced-colour browser acceptance and a manual Pages deployment
workflow that publishes only after the complete suite passes.

The complete pre-release `main` security audit found no reportable issue. A
focused release-diff review found and closed a branch-dispatch Pages promotion
gap and removed third-party person metadata from the generated SBOM. Canonical
scan evidence and remediation verification are retained in
`docs/competition/evidence/`.

Public pull request `#7` was rebase-merged as
`ef3b6f496924250c5dfb9cc52ea124468035a3dc`. Exact-main validation run
`33276000462` and Pages run `33276042312` passed. The public repository,
licence and HTTPS site resolved without authentication; deployment metadata and
the live catalogue digest matched the exact commit and repository artefact.
The controlled live-browser search passed with no console errors and only
same-origin static requests. Branch protection and protected-branch-only Pages
deployment were read back from GitHub. Full evidence is in
`docs/competition/evidence/public-release-verification-2026-08-29.md`.

The controlled in-app browser did not expose `document.modelContext`, so it
verified the human fallback but not WebMCP tool registration or calls in
ChatGPT's supported built-in-browser host. Manual screen-reader testing,
competition registration and Devpost submission also remain unperformed.

## Recommended next step

Capture the three registrations and representative tool calls in ChatGPT's
supported built-in browser against the exact final candidate URL. Complete the
manual screen-reader observation, then prepare the public video and Devpost
form for Chris Page's separate registration and submission approval. Do not
register or submit to Devpost without that instruction.
