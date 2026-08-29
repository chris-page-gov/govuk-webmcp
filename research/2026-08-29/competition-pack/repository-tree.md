# 20. Repository and release structure

## 20.1 Recommended repository decision

Use a dedicated public competition repository **only if** doing so is consistent with the ownership decision. Suggested name:

```text
trusted-govuk-knowledge-discovery
```

A dedicated repository improves judge comprehension and top-level licence detection. It must disclose, not erase, its ancestry.

Alternative: use a protected `webmcp-challenge-2026` branch in `gis-ai-go` if ownership and repository context are approved. This preserves history but creates more cognitive and mixed-scope burden.

## 20.2 Proposed tree

```text
trusted-govuk-knowledge-discovery/
├── README.md
├── LICENSE
├── NOTICE.md
├── DISCLAIMER.md
├── SECURITY.md
├── ACCESSIBILITY.md
├── PRIVACY.md
├── CHALLENGE_BASELINE.md
├── CHALLENGE_CHANGELOG.md
├── challenge-provenance.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── webmcp-tools.ts
│   ├── catalogue.ts
│   ├── validation.ts
│   ├── search.ts
│   ├── provenance.ts
│   ├── render.ts
│   └── styles.css
├── public/
│   ├── data/
│   │   ├── catalogue.json
│   │   ├── manifest.json
│   │   ├── source-envelopes/
│   │   └── receipts/
│   ├── schemas/
│   └── SHA256SUMS
├── sources/
│   ├── allowlist.yaml
│   ├── rights.yaml
│   └── observations/
├── scripts/
│   ├── build-data.ts
│   ├── verify-data.ts
│   ├── verify-links.ts
│   ├── verify-artefact.ts
│   └── compare-baseline.ts
├── schemas/
│   ├── profile-record.schema.json
│   ├── evidence-receipt.schema.json
│   └── tool-*.schema.json
├── tests/
│   ├── unit/
│   ├── fixtures/
│   ├── browser/
│   ├── accessibility/
│   ├── security/
│   └── evaluation/
├── docs/
│   ├── architecture.md
│   ├── profile.md
│   ├── provenance.md
│   ├── threat-model.md
│   ├── evaluation.md
│   ├── rules-compliance.md
│   └── demo-script.md
└── .github/
    └── workflows/
        ├── ci.yml
        ├── pages.yml
        ├── codeql.yml
        └── release.yml
```

## 20.3 Release contents

Tag: `webmcp-challenge-2026-submission`

Release assets:

- source archive;
- built static site archive;
- `SHA256SUMS`;
- SBOM;
- corpus manifest;
- source/rights manifest;
- challenge provenance;
- baseline-to-submission report;
- test summary;
- accessibility statement;
- video transcript;
- exact Devpost text;
- rules evidence capture.

## 20.4 Commit strategy

1. `chore: establish challenge baseline and rights manifest`
2. `feat: add GOV.UK Discovery OKF profile and reviewed corpus`
3. `feat: add accessible human search and record views`
4. `feat(webmcp): register three read-only discovery tools`
5. `feat: add provenance receipts and digest validation`
6. `test: add security accessibility parity and evaluation cases`
7. `docs: add competition boundaries licences and submission evidence`
8. `deploy: publish immutable competition candidate`
9. `release: bind final submission artefacts and hashes`

Do not squash away chronology after the fact. A tidy history is useful, but timestamped evidence is more important.
