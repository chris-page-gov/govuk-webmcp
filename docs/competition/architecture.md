# Static competition architecture

```text
Reviewed official public sources
  ├─ GOV.UK human pages
  ├─ GOV.UK Content/Search metadata
  ├─ API Catalogue records
  └─ data.gov.uk records
          │ separately reviewed and frozen before build
          ▼
Frozen source locks + source digests
          │ deterministic normalisation; assertion labels retained
          ▼
GOV.UK Discovery OKF profile
  ├─ official-source assertions
  ├─ normalised fields
  ├─ inferred relationships
  └─ model-derived suggestions (optional, never authoritative)
          │ record/bundle digests + evidence receipts
          ▼
Same-origin static catalogue and evidence receipts + SHA-256 sidecars
          │ verify before registration
          ▼
One canonical execution layer
  ├─ accessible human search/detail/provenance views
  └─ three imperative WebMCP tools
          │ compact structured untrusted output
          ▼
Person and agent inspect the same record and open the authoritative source
```

The executable build makes no network acquisition. It consumes only the two
committed frozen input files after checking their locked digests. Public release
uses a manually dispatched GitHub Pages workflow that checks out one exact
`main` revision, installs the lockfile, runs the complete suite, writes that
revision to `deployment.json` and deploys the resulting `dist/` directory.

The optional agent narrative is presentation only. It cannot alter the bundle,
assertion status, access state, licence state, evidence receipt or authoritative
link. No runtime provider request is part of the judging path.
