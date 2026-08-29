# Local validation record

**Performed:** 29 August 2026  
**Scope:** research-pack artefacts and implementation starter only

## Passed

- TypeScript 5.8.3 strict, no-emit compilation of `src/webmcp-tools.ts` using
  `ES2022` and DOM libraries.
- Runtime fixture calls for all three exported functions using Node.js 22.16.0:
  search, exact record and provenance returned successful structured results.
- Unknown-input-field test returned the declared fail-closed error shape.
- The catalogue raw-byte SHA-256 sidecar was verified before parsing and tool
  execution in the runtime fixture.
- All six JSON Schemas pass Draft 2020-12 schema validation.
- Successful runtime results validate against their corresponding output schemas.
- The shared error result validates against all three output schemas.
- JSON/JSON-LD examples and the challenge-provenance example parse successfully.
- The illustrative source, record and bundle digests recompute exactly under the documented `project-json-c14n-v1` method.
- `scripts/verify_pack.py` passes all offline checks.
- Every source identifier cited in the report resolves to an entry in
  `source-register.csv`.

## Not performed or not claimed

- No live deployment was created or modified.
- No ChatGPT desktop Site Tools or Chrome 149+ test was performed against a public
  candidate URL.
- No participant, screen-reader, formal WCAG conformance, penetration or legal
  review was performed.
- No employer, secondment-host, collaborator or competition-administrator approval
  was obtained.
- No complete live-link or current-CORS sweep was performed; the recommended
  judging path does not depend on runtime government endpoints.

These remaining items are hard gates in the report and checklists, not implied
successes.
