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

## Evidence Trace and corpus admission descriptors

`app/data/sources/answer-packs.json` is original project-authored metadata. Its
generated Evidence Trace cites only records already admitted to the catalogue;
it does not copy the linked page content or turn a normalised statement into an
official assertion.

`app/data/sources/corpus-admissions.json` records bounded descriptions and
admission decisions for the candidate collections. At this working-tree
checkpoint, two reviewed deep-evidence collections provide 80 records with
item-level receipts and four federated source snapshots contain 58,655 locked
raw rows, of which 58,652 are searchable and 3 are quarantined. Other entries
remain described-only, contract-only or quarantined and contribute no
searchable payload. The current build and sealed post-fix scan reconfirm these
totals; recompute them if source or contract bytes change before release
binding.

Repository licence labels are recorded as source metadata, not as a blanket
licence for linked records or upstream material. Rights, access and
redistribution boundaries remain source-specific.

## Vendored federated OKF snapshot metadata

`app/data/sources/okf-federation-lock.json` is project-authored control metadata
for exactly four independently republished source snapshots:

- 9,757 A Life in the UK records, including 293 service families, at commit
  `4bc010eab3c9c072f68960393c1458a772aa700b`;
- 5,097 ONS metadata records at commit
  `b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf`;
- 41,598 UK Government APIs records at commit
  `55c7e67947dfd86e291ca987e354429c36b453d9`; and
- 2,203 HM Land Registry public-estate metadata rows at commit
  `1d708e39f2cde19610d43c5a7f5e36e4a2f947bc`.

The declared raw sum is 58,655 rows before cross-source deduplication and is not
a count of unique services, datasets, APIs, properties or official records.
Exactly three standalone Land Registry legislation rows are quarantined,
leaving 2,200 searchable Land Registry records and 58,652 searchable federated
records overall. The Land Registry snapshot contains metadata only: no title,
ownership, address, polygon or personal row is admitted.

The 73 gzip artefacts under `app/data/sources/okf-federation/`, totalling
13,021,675 stored bytes, are versioned, checksum-bound imports of producer
snapshot metadata. They are not project-authored content, and this project's MIT
licence does not relicense them. Each record retains the rights, access and reuse
boundary recorded for its producer and linked source. Inclusion does not
establish an open licence, official endorsement, current accuracy or authority
to access or reuse the linked material.

Federated producer wording cannot promote a link or assertion to official
status. Public results retain producer-declared roles, exact-record source
authority is “Not independently established”, and the human interface displays
the recorded destination hostname.

There is no standalone UK Legislation collection, payload, index or runtime
request, and the searchable projection exposes zero `legislation.gov.uk`
result links. The vendored snapshots retain 28 source-authored cross-reference
strings as inert, untrusted metadata: 6 in A Life in the UK, 3 in ONS, 2 in UK
Government APIs and 17 in Land Registry. Those strings do not admit a
legislation collection or change the rights of the linked material.

`app/data/federated-search/` is an ignored deterministic projection of the
locked imports. The current build produces 1,853 shard files — 120 record shards
and 1,733 postings shards — plus the manifest and checksum sidecar, for 1,855
files and 127,747,020 bytes in total, and copies that generated plane into
`dist` during a build.
Generated projection does not replace or broaden the source-specific notices
above.

## Standards and dependencies

The profile links to DCMI, PROV and Schema.org vocabularies. Those links do not
copy or relicense the standards. Development dependencies and exact versions
are recorded in `package-lock.json`; their own licences apply.

No GOV.UK crown, wordmark, GDS Transport font or employer logo is included.
