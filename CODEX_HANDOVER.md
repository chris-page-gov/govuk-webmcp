# Codex handover

## Current outcome

The complete private verification build is merged to `main`. It expands the
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

- `npm run test:unit`: 12 passed;
- `PLAYWRIGHT_PORT=4174 npm run test:browser`: 8 installed-Chrome tests passed;
- `PLAYWRIGHT_PORT=4175 npm run test:browser:edge`: the same 8 tests passed in
  Microsoft Edge 152.0.4191.53;
- the browser suites include direct-file guidance and an axe smoke test with no
  serious or critical violations;
- catalogue JSON Schema validation: 80 records and 80 receipts passed;
- preserved research-pack validation: 4 checks passed; optional Python
  `jsonschema` meta-schema checks were skipped because that package is not
  installed;
- live `npm audit` was not run because the approval boundary did not permit
  sending the private dependency manifest to the npm advisory endpoint;
- port 4173 was already occupied by a separate Python server, so the new
  configurable test port was verified on isolated ports 4174 and 4175 without
  stopping that process.

## Remaining release evidence

The complete build and browser-startup follow-on are merged. A public HTTPS
deployment, ChatGPT built-in-browser observation, signed-out acceptance, manual
assistive-technology test, competition registration and Devpost submission have
not been performed and must not be inferred from local tests.

## Recommended next step

Refresh `http://127.0.0.1:4173/` in Edge to verify the corrected local journey.
After a separate public-deployment instruction, capture host-specific and
signed-out evidence before any submission work.
