# ADR-0004: OKF federated discovery and evidence tiers

- **Status:** accepted for the federated discovery candidate; live and
  model-backed evidence remains pending
- **Date:** 30 August 2026

## Context

The receipt-bound application proves evidence-first discovery over 80 reviewed
records. That is a strong assurance sample, but it does not demonstrate the
larger purpose of Open Knowledge Format (OKF): publishing governed knowledge in
a form that people, browsers and AI systems can progressively retrieve without
requiring each publisher to operate a general-purpose assistant.

Four independently published OKF source snapshots expose compatible static
search contracts:

- [A Life in the UK](https://chris-page-gov.github.io/okf-uk-living/okf-explorer.json):
  9,757 records, including 293 life-course service families;
- [ONS data discovery OKF](https://chris-page-gov.github.io/okf-ons/okf-explorer.json):
  5,097 metadata records;
- [UK Government APIs OKF](https://chris-page-gov.github.io/okf-uk-government-apis/okf-explorer.json):
  41,598 records; and
- [HM Land Registry public-estate OKF](https://chris-page-gov.github.io/okf-LandRegistry/okf-explorer.json):
  2,203 metadata records.

Together they declare 58,655 federated source-snapshot records. This is not a
unique-record count: records can overlap across collections, and each producer
defines its own population and unit. The 58,655 records are separate from the
80 local records with this application's packaged evidence receipts. There is
no standalone UK Legislation source, payload, index or runtime request. The
four locked snapshots retain 28 source-authored `legislation.gov.uk` cross-
reference strings as untrusted metadata: 6 in A Life in the UK, 3 in ONS, 2 in
UK Government APIs and 17 in Land Registry.

The source repositories and Pages publications are independent OKF
republications. They are not official government services or endorsements.
Their catalogue records support discovery and preserve links back to source
material; they do not themselves prove current accuracy, access authority,
licence, legal effect or service eligibility.

## Decision

### Preserve two explicit evidence tiers

The application will present and return two tiers without collapsing their
assurance:

1. **Receipt-bound deep evidence:** the existing 80 same-origin records, each
   bound to a packaged receipt and the application bundle digest.
2. **Federated source snapshot:** 58,655 records discoverable through the four
   allowlisted, snapshot-bound OKF static-search publications. Results retain
   producer identity, snapshot, route, source links, integrity state and
   limitations, but do not acquire a local deep-evidence receipt merely by
   being returned.

Every total, result and source-status display must identify its tier. Cross-
collection deduplication may group equivalent-looking results for presentation,
but it must preserve each source-native identity and must not manufacture a
unique population total.

### Keep WebMCP bounded and the human journey complete

The existing five imperative WebMCP tools remain the public interaction
surface. Federated discovery extends the deterministic search and record
journeys rather than creating a general question-answering tool. Human controls
and tool callbacks continue to use the same action controller and common result
shape. The full human journey remains usable when WebMCP is unavailable.

The application and its OKF producers publish static artefacts. They do not
host or call a model, call an official operational API at query time, make an
eligibility or legal decision, or create a durable service transaction. Source-
derived content remains untrusted data and cannot define tools or instructions.

### Admit only locked publication routes

The build will admit only the four named collections and their declared static
entry points. It will reject unknown origins, redirects outside the allowlist,
credentials, ports, path traversal, unsupported contracts, snapshot conflicts,
missing integrity evidence and undeclared files. A standalone legislation
source, payload, index or request is absent from the allowlist and reported
totals. The 28 retained cross-reference strings preserve source digests but
cannot define a collection, tool, instruction or network request; literal URL-
byte exclusion is not claimed.

Registration depends on the local root contract and integrity material. Query-
time validation then checks each requested static artefact before use. A failed
or unavailable federated source is reported as a partial source failure; it
does not become trusted through a fallback and does not disable the validated
80-record tier or unaffected sources.

### Minimise, but do not overstate, the personal-context boundary

A citizen-selected AI may use permitted context to decide which bounded page
tool to call. The page schemas do not accept a profile, identity, location
history, browsing history or an unrelated `personalContext` object. The agent
should derive the smallest non-personal query and filters that answer the task.

This is data minimisation, not a privacy guarantee. Free-text query fields can
still contain personal data if a caller puts it there. A remote model provider
may receive the prompt, tool definitions, arguments and returned records. A
local model can keep model inference on the device, but the browser, local
software and static host may still log ordinary activity. Lazy static-asset
paths can also reveal query-derived partitions. Evaluation must record the
actual provider and network boundary rather than infer privacy from the
architecture.

### Treat impact claims as hypotheses

The candidate demonstrates a testable division of responsibility:

- OKF publishes governed, progressively retrievable evidence;
- WebMCP exposes small, inspectable page actions over that evidence; and
- a citizen-selected AI performs contextual reasoning and tool selection.

This could reduce the need for every public body to host a model or collect a
broad personal profile. It does not establish a saving, better questions or
improved outcomes. Static hosting, publication, assurance, maintenance,
support, citizen-device use and model-provider processing all have costs and
risks that must be measured.

## Consequences

The larger corpus makes the OKF-to-WebMCP publication pattern visible while
preserving the stronger assurance of the original 80 records. It also creates
new failure, performance, privacy and evaluation obligations. The candidate
must therefore pass the bounded plan in
[OKF federated personal-agent evaluation](../competition/okf-federated-personal-agent-evaluation-plan.md)
before any federated behaviour is described as observed.

Safe judge-facing wording is:

> Independently republished OKF snapshots make governed public-sector evidence
> progressively retrievable. WebMCP exposes bounded actions over that evidence
> to a citizen-selected AI, while the same evidence and limitations remain
> visible to the person. The page hosts no model and its schemas do not accept a
> personal profile.

Do not shorten that claim to “personal data stays on the device”, “WebMCP makes
government information trustworthy”, “the AI asks better questions”, “58,655
unique records”, or “government saves money”.
