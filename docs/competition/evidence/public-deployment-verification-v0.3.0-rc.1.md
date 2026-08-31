# Public deployment verification — v0.3.0-rc.1

## Exact release boundary

- Public site: <https://chris-page-gov.github.io/govuk-webmcp/>
- Repository: `chris-page-gov/govuk-webmcp`
- Product commit: `b0bd634579a3abf82bdd1fc83ff688535e0db0bf`
- Annotated tag object: `8278c580df4767491ef0808516dd90cc3423cb9d`
- Release: `v0.3.0-rc.1 — governed OKF federated discovery`
- Pull request: <https://github.com/chris-page-gov/govuk-webmcp/pull/16>
- Passing pull-request validation run: `33356087333`
- Passing protected-main validation run: `33356272534`
- Passing exact-commit Pages run: `33356452048`
- Pages artefact: `9745316971`
- Pages artefact API digest:
  `sha256:3d7a7eb777d3b99504c9fb0533b89cb37ffc2d66dcad7a000e86ca6674e5727d`
- Downloaded `artifact.tar` SHA-256:
  `872384696f587572d794de3a4e07485aee7d2816598c86546ed178cd5aa03bf2`

The protected pull-request, protected-main and Pages workflows all passed. The
annotated release tag peels to the protected-main commit, and `origin/main`
resolved to that same commit when this record was prepared.

## Complete live-byte comparison

At `2026-08-31T04:20:45.247Z`, the verifier downloaded the exact Pages
artefact and fetched every regular artefact file from the public site using a
cache-busting query without following redirects. All 1,879 requests returned
HTTP 200. The 128,548,215 fetched bytes matched the downloaded artefact byte
for byte, with no missing, additional or mismatched file. The canonical live
comparison manifest SHA-256 was
`4b2336a8927d34951c94008703dec27ed79f1ad87a318526c6807eeaa4bc0183`.

The machine-readable summary is retained in
`live-artifact-verification-v0.3.0-rc.1.json`. The downloaded Pages artefact,
its extracted files and the per-file working manifest remain local temporary
verification material rather than repository content.

## Published evidence boundary

The deployed release contains 80 item-reviewed records and 58,652 searchable
records from 58,655 checksum-locked source rows across UK Living, ONS, UK
Government APIs and HM Land Registry. Three standalone legislation records
are quarantined. No `legislation.gov.uk` collection, payload, index or result
link is published.

The complete byte comparison establishes deployment identity, not factual
completeness, official certification, open licensing, current source accuracy
or future availability. HM Land Registry contributes metadata-only discovery:
no title, ownership, address, polygon or personal rows are included.
