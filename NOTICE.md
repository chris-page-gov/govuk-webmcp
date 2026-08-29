# Licence and attribution notice

## Original project work

Original code and documentation in this repository are copyright 2026 Chris
Page and licensed under the MIT licence in `LICENSE`.

The implementation is a clean project-specific build. No code was copied from
`gis-ai-go`, `okf-explorer` or another OKF source repository.

## Locked GOV.UK metadata corpus

`app/data/sources/govuk-content-69.lock.json` contains 69 GOV.UK metadata
records imported from:

- repository: `chris-page-gov/okf-govuk-content`;
- commit: `94f5020cb2c7512a79c2353ee48743ad733a132c`;
- path: `bundle/data/records-0.json.gz`;
- Git blob: `e7f3b6a0d1efa6cb336b1b50a69228de26216aa5`;
- imported-byte SHA-256:
  `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc`.

Contains public sector information licensed under the Open Government Licence
v3.0 where applicable. The OGL excludes, among other things, logos and crests,
personal data, unpublished information and third-party rights. Linked pages,
attachments, images and third-party material may have different terms.

## Curated official API and dataset metadata

`app/data/sources/curated-api-data.json` contains 11 normalised records authored
for this project from the official pages cited within each record. Catalogue
inclusion never proves public access or an open licence. A missing licence stays
`missing`; authentication and access limitations remain explicit.

The Environment Agency flood-monitoring record retains the required attribution:
“This uses Environment Agency flood and river level data from the real-time data
API (Beta).”

The ONS Open Geography record records OGL v3.0 with the explicit caveat “except
where otherwise stated”.

## Standards and dependencies

The profile links to DCMI, PROV and Schema.org vocabularies. Those links do not
copy or relicense the standards. Development dependencies and exact versions
are recorded in `package-lock.json`; their own licences apply.

No GOV.UK crown, wordmark, GDS Transport font or employer logo is included.
