# Beginner question coverage

## Purpose

This note defines the questions the released `v0.3.0-rc.1` product can support
without implying that it contains the whole of GOV.UK or can decide a person's
case. It is evidence for personas, user stories and a future beginner interface.
It is not an answer-quality result or a claim about what people ask most often.

The useful beginner mental model is:

1. **Find the relevant evidence.** The page can identify a recorded service,
   dataset, API or guidance route.
2. **See what that evidence can establish.** The result keeps its source,
   observation boundary and limitations attached.
3. **Know when the evidence stops.** The page does not calculate eligibility,
   retrieve live facts, complete transactions or replace the responsible
   authority.

The current product is therefore an evidence-backed **discovery layer**, not a
personalised-answer engine. A citizen-selected AI may use the returned evidence
to frame a better follow-up, but the WebMCP result alone does not contain the
complete rules or live service response needed for most personal decisions.

## Evidence and frequency status

- The GOV.UK Chat comparator contains 21 deliberately balanced pilot cases.
  Its own documentation says it is not a statistically powered benchmark and
  calls for a future sample of redacted real questions. It must not be used as
  a frequency ranking.
- The A Life in the UK source contains 104 editorial competency questions
  across all 24 life-course domains. Their expected outputs are normalised
  discovery records, not generated answers or personal decisions. They provide
  breadth, not evidence of popularity.
- HM Land Registry's source personas and 24 candidate questions are task-based
  hypotheses, not completed user research.

Until an approved, privacy-preserving GOV.UK Chat sample is available, use
**representative question**, not **most common question**.

## Exact evidence estate and candidate correction

The population and source snapshots below are those released in
`v0.3.0-rc.1`. The A Life in the UK review-status sentence is the corrected
current-candidate contract and is not presented as part of that historical
release.

| Evidence tier | Released population | What it supports | What it does not support |
| --- | --- | --- | --- |
| Reviewed deep evidence | 80 receipt-bound records: 69 GOV.UK metadata records about having a new child, plus 11 reviewed API and data-discovery records | Exact page or catalogue discovery with item-level receipt, source URL, dates, access, rights and limitations | Full GOV.UK page content, personal eligibility, current amounts, deadlines, transactions or endpoint execution |
| A Life in the UK | 9,757 searchable records, including 293 service families across 24 life-course domains | Broad route and service-family discovery, jurisdiction hand-offs and supporting concepts | A decision for a person; legal, clinical, safeguarding or financial advice; complete current rules. The corrected candidate contract records no accepted specialist reviews |
| ONS | 5,097 searchable metadata records: 3,035 ONS geography, 1,617 Nomis, 337 ONS dataset and 108 Explore Local Statistics indicator records | Discovering and distinguishing candidate statistical datasets and their recorded source links | Current observations, statistical accuracy, complete ONS coverage, current endpoint access or fitness for a particular analysis |
| UK Government APIs | 41,598 searchable metadata records: 31,717 endpoints, 6,728 data products, 2,320 capability documents, 455 contracts, 245 API products, 93 schemas, 38 operations and 2 provider portals | Discovering a recorded API, dataset, contract, schema or documentation route | Proof that an endpoint is live, public, authorised, safe or openly licensed; credentials or API calls |
| HM Land Registry | 2,200 searchable metadata records: news, statistics, guidance, corporate material, repositories, forms, 17 APIs, 14 datasets and 11 services | Discovering recorded HMLR guidance, publications, datasets, services, APIs and repositories | Title-register, title-plan, ownership, address, charge, polygon, transaction or personal rows; proof of ownership; legal advice. Three standalone legislation rows are quarantined |

The 58,655 raw federated rows become 58,652 searchable rows after that
quarantine. These are source rows before cross-source deduplication, not a count
of unique services, datasets, APIs or official records. There is no standalone
UK Legislation collection and no searchable `legislation.gov.uk` result link.

### Reconciled review-status wording

The current candidate's authored federation lock and generated display
contract match the AI-consumer contract at the exact admitted source revision:
**zero** accepted specialist reviews, 2 service families where specialist
review was not required and 291 where it was required. No positive specialist-
acceptance count is admitted. Historical `v0.3.0-rc.1` receipts preserve the
earlier wording only as evidence for that release's exact bytes.

## GOV.UK Chat comparator matrix

Status meanings:

- **Direct discovery** — an exact released record can identify the intended
  source or dataset.
- **Partial discovery** — a related record exists, but the returned fields do
  not answer the material part of the question.
- **Boundary answer** — the released limitations support a safe negative or
  abstaining answer.
- **Not covered** — no sufficiently specific released record was found.

### Existing GOV.UK journey questions

| Case and representative question | Released evidence | Discoverable now | Answerable from WebMCP context alone |
| --- | --- | --- | --- |
| `PARITY-001` — How can I pay my VAT bill and when must it arrive? | No exact record. Nearest: `govuk-discovery:federated:uk-living:7155`, **Register for VAT**, <https://www.gov.uk/vat-registration> | **Not covered** for payment | **No.** Registration metadata does not establish payment routes or deadlines |
| `PARITY-002` — I have started working for myself. How do I register for Self Assessment? | Related: `govuk-discovery:federated:uk-living:7036`, **File Self Assessment**, <https://www.gov.uk/self-assessment-tax-returns>; and `govuk-discovery:federated:uk-living:7154`, **Register for Income Tax**, <https://www.gov.uk/income-tax> | **Partial discovery** | **No.** Neither result is the exact registration service or its prerequisites |
| `PARITY-003` — What is Tax-Free Childcare and how much can government pay? | Reviewed `govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114`, **Tax-Free Childcare**, <https://www.gov.uk/tax-free-childcare>; federated `govuk-discovery:federated:uk-living:7228` | **Direct discovery** | **No.** The metadata identifies the guide but contains no current amount or personal eligibility calculation |
| `PARITY-004` — When can a child stop using a car seat or booster seat? | No exact released record | **Not covered** | **No** |
| `PARITY-005` — I am turning 70. How do I renew my driving licence? | No exact released record | **Not covered** | **No** |
| `PARITY-006` — Must my landlord protect my tenancy deposit and tell me where it is held? | `govuk-discovery:federated:uk-living:7132`, **Protect a tenancy deposit**, <https://www.gov.uk/tenancy-deposit-protection> | **Direct discovery** of the route | **No.** The result does not contain the duties, timing and prescribed-information rules needed for the answer |
| `PARITY-007` — How do I appeal a refused school place? | `govuk-discovery:federated:uk-living:6959`, **Appeal a school admission decision**, <https://www.gov.uk/schools-admissions/appealing-a-schools-decision> | **Direct discovery** of the appeal route | **Partly.** It identifies an independent appeal route but not the complete current procedure, deadline or local exception |
| `PARITY-008` — Do I need an Energy Performance Certificate when selling my home? | No exact record. Nearest: `govuk-discovery:federated:uk-living:7106`, **Move home**, <https://www.gov.uk/selling-a-home> | **Not covered** for the EPC question | **No.** A broad selling-a-home route is not evidence of the specific duty or exceptions |

This comparison is deliberately strict. Finding a broadly related page is not
the same as possessing the evidence needed to answer the question.

### ONS dataset-discovery questions

| Case and representative question | Exact released record and recorded source | Discoverable now | Answerable from WebMCP context alone |
| --- | --- | --- | --- |
| `AUG-001` — Which monthly inflation dataset includes owner occupiers' housing costs? | `govuk-discovery:federated:ons:11396` / `ons-data-api:dataset:cpih01`, **Consumer Prices Index including owner occupiers' housing costs (CPIH)**, <https://api.beta.ons.gov.uk/v1/datasets/cpih01> | **Direct discovery** | **Yes, for dataset identification.** Not for a current inflation value |
| `AUG-002` — Which dataset shows whether the UK economy grew in the latest month? | `govuk-discovery:federated:ons:11457` / `ons-data-api:dataset:gdp-to-four-decimal-places`, **GDP monthly estimate**, <https://api.beta.ons.gov.uk/v1/datasets/gdp-to-four-decimal-places> | **Direct discovery** | **Yes, for dataset identification.** Not for the latest GDP result |
| `AUG-003` — Which dataset gives local-authority population estimates by age and sex? | `govuk-discovery:federated:ons:10553` / `nomis:dataset:NM_2002_1`, **Population estimates - local authority based by single year of age**, <https://www.nomisweb.co.uk/api/v01/dataset/NM_2002_1.overview.json> | **Direct discovery** | **Yes, for dataset identification.** Selection dimensions and current values still require the source |
| `AUG-004` — Which dataset contains the unemployment rate measured by the Labour Force Survey? | `govuk-discovery:federated:ons:9783` / `nomis:dataset:NM_17_5`, **annual population survey (variables (percentages))**, <https://www.nomisweb.co.uk/api/v01/dataset/NM_17_5.overview.json> | **Direct discovery** | **Partly.** The description exposes unemployment and survey coverage; the precise measure and current value require source inspection |
| `AUG-005` — Which dataset gives life expectancy at birth by local authority and deprivation? | `govuk-discovery:federated:ons:11525` / `ons-data-api:dataset:life-expectancy-by-local-authority`, **Life Expectancy by Local Authority**, <https://api.beta.ons.gov.uk/v1/datasets/life-expectancy-by-local-authority> | **Direct discovery** | **Yes, for the candidate dataset.** The returned projection does not prove every requested dimension or fitness for use |
| `AUG-006` — Which dataset has weekly deaths registered by registration date? | `govuk-discovery:federated:ons:11404` / `ons-data-api:dataset:weekly-deaths-age-sex`, **Deaths registered weekly in England and Wales by age and sex**, <https://api.beta.ons.gov.uk/v1/datasets/weekly-deaths-age-sex> | **Direct discovery** | **Yes, for the candidate dataset.** Not for a current count or revision state |
| `AUG-007` — Which Census 2021 dataset measures occupancy rating by rooms? | `govuk-discovery:federated:ons:11601` / `ons-data-api:dataset:TS053`, **Occupancy rating for rooms**, <https://api.beta.ons.gov.uk/v1/datasets/TS053> | **Direct discovery** | **Yes, for dataset identification.** Not for a derived overcrowding conclusion |
| `AUG-008` — Is claimant count the same as the survey unemployment rate? | Survey record `govuk-discovery:federated:ons:9783`; claimant-count example `govuk-discovery:federated:ons:9839` / `nomis:dataset:NM_11_1`, <https://www.nomisweb.co.uk/api/v01/dataset/NM_11_1.overview.json> | **Direct discovery** of distinct records and descriptions | **Partly.** The evidence supports non-equivalence; a precise methodological comparison needs the source definitions |

### Evidence-boundary questions

| Case and question | Status from the exact release | What a trustworthy answer should say |
| --- | --- | --- |
| `BOUNDARY-001` — Does the ONS bundle contain every ONS dataset? | **Boundary answer** | No. It is a 5,097-record snapshot from four declared adapters, not a completeness claim |
| `BOUNDARY-002` — Can the bundle tell me today's unemployment rate? | **Boundary answer** | No. It contains metadata, not current statistical observations |
| `BOUNDARY-003` — Is this an official ONS publication endorsed by ONS? | **Boundary answer** | No. The OKF publication is independent; its recorded source publisher must not be confused with endorsement or semantic authority |
| `BOUNDARY-004` — Does missing quality or methodology evidence mean the dataset is poor quality? | **Boundary answer** | No. Missing evidence is not adverse evidence, and the release does not certify statistical accuracy or fitness for use |
| `BOUNDARY-005` — Which ONSUD release does `ONSUD_LATEST` describe and what period does it cover? | **Partial discovery:** `govuk-discovery:federated:ons:13855` / `ons-open-geography:dataset:9beb2361978146f8ac85da18d21ee266`, <https://geoportal.statistics.gov.uk/api/search/v1/collections/dataset/items/9beb2361978146f8ac85da18d21ee266> | The released projection can identify the record and must not infer dates from “LATEST”. It exposes only snapshot observation, not the separate record-level release, reference and coverage fields required to answer the question |

## Coverage beyond the GOV.UK Chat pilot

The comparator under-represents two large released collections. These examples
are suitable for later user stories, provided they remain discovery questions.

| Representative question | Exact released evidence | Supported outcome and boundary |
| --- | --- | --- |
| Is there a government service for sending emails, texts or letters? | `govuk-discovery:federated:government-apis:14854`, **GOV.UK Notify**, <https://www.notifications.service.gov.uk/documentation> | Discover the documentation. Do not imply that a citizen can use it, that access is anonymous or that the page calls the API |
| Is there a Companies House API? | `govuk-discovery:federated:government-apis:14865`, **Companies House**, <https://developer.companieshouse.gov.uk/api/docs/> | Discover the documentation. Authentication, authorisation, live status and licence must be checked at the source |
| Is there police data documentation? | `govuk-discovery:federated:government-apis:14941`, **Police API**, <https://data.police.uk/docs/> | Discover the documentation. Coverage, timeliness and disclosure constraints remain source-specific |
| Where can I find title-register and title-summary information? | `govuk-discovery:federated:land-registry:57975` / `hmlr-0247fef3f8f438433e219b9b`, <https://www.gov.uk/get-information-about-property-and-land/search-the-register> | Discover the public guidance and its warning that an online download is not official proof. The bundle contains no property or ownership row |
| Where can I find Price Paid Data? | `govuk-discovery:federated:land-registry:57274` / `hmlr-50c23ef0cb3340008e9f8b0e`, <https://www.gov.uk/guidance/about-the-price-paid-data> | Discover the guidance. A historic transaction value is not a present valuation, and catalogue dates are not dataset or legal currency |
| Is there an HMLR land and property data API? | `govuk-discovery:federated:land-registry:58613` / `hmlr-526ee7957c0f5063c20f8c76`, <https://use-land-property-data.service.gov.uk/api-documentation> | Discover the authenticated API documentation. The page must not call it, store credentials or imply that API access overrides a dataset licence |

## Representative life-course breadth

The A Life in the UK source supplies route discovery across all 24 domains.
Examples include:

- pregnancy and birth: `govuk-discovery:federated:uk-living:7210`, **Take maternity leave**,
  <https://www.gov.uk/maternity-pay-leave>;
- citizenship: `govuk-discovery:federated:uk-living:7090`, **Maintain electoral registration**,
  <https://www.gov.uk/register-to-vote>;
- death: `govuk-discovery:federated:uk-living:7145`, **Register a death**,
  <https://www.gov.uk/register-a-death>;
- disability and care: `govuk-discovery:federated:uk-living:7074`, **Get a social-care needs
  assessment**, <https://www.nhs.uk/social-care-and-support/help-from-social-services-and-charities/getting-a-needs-assessment/>;
- work: `govuk-discovery:federated:uk-living:7141`, **Receive the National Minimum Wage**,
  <https://www.gov.uk/national-minimum-wage-rates>;
- further education: `govuk-discovery:federated:uk-living:7077`, **Get student finance**,
  <https://www.gov.uk/student-finance>;
- health: `govuk-discovery:federated:uk-living:7161`, **Register with a GP**,
  <https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/>;
- later life: `govuk-discovery:federated:uk-living:7075`, **Get a State Pension forecast**,
  <https://www.gov.uk/check-state-pension>;
- consumer rights: `govuk-discovery:federated:uk-living:7032`, **Exercise consumer rights for
  goods**, <https://www.gov.uk/consumer-protection-rights>;
- business: `govuk-discovery:federated:uk-living:7148`, **Register as a sole trader**,
  <https://www.gov.uk/set-up-sole-trader>;
- local environment: `govuk-discovery:federated:uk-living:7171`, **Report fly-tipping**,
  <https://www.gov.uk/report-flytipping>; and
- transport enforcement: `govuk-discovery:federated:uk-living:7191`, **Respond to a speeding
  notice**, <https://www.gov.uk/speeding-penalties>.

The remaining domains are early years, finding work and unemployment, holidays
and living overseas, housing and community life, ideas and research, money and
benefits, police and legal services, public and private transport,
relationships and family change, rubbish and the street, school years, and
transition to adulthood. Every service-family result remains a source-linked
navigation hand-off rather than a personal decision.

## Hard product boundaries for every future story

1. The static page hosts no model and makes no runtime call to an official API.
2. WebMCP accepts no identity, profile or general personal-context object.
3. Search results are metadata and source links, not complete official page
   bodies, transactions, statistical observations or property records.
4. A result never grants access, credentials, permission to reuse, legal
   effect, entitlement or approval.
5. Reviewed and federated evidence must stay distinct. Federated records are
   checksum-bound source snapshots without item-level receipts or independent
   source-authority certification.
6. Source-derived text is untrusted. An AI should cite the recorded link,
   expose the limitation and abstain when the evidence does not answer the
   material question.
7. The user's AI may use context it already holds to choose a bounded tool
   query, but the WebMCP page does not receive that whole context. This reduces
   unnecessary disclosure to the page; it does not prove end-to-end privacy
   from the model provider.

## Evidence paths

- Release boundary and counts: [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md)
- Reviewed records: [`app/data/catalogue.json`](../../app/data/catalogue.json)
- Exact source locks and collection limitations:
  [`app/data/sources/okf-federation-lock.json`](../../app/data/sources/okf-federation-lock.json)
- Deterministic released projections:
  `app/data/federated-search/records/{uk-living,ons,government-apis,land-registry}/`
- GOV.UK Chat comparator at inspected commit `b4ec302aa42f3ab5e2a4b5e2b507f1cd32d28f35`:
  <https://github.com/chris-page-gov/govuk-chat/blob/b4ec302aa42f3ab5e2a4b5e2b507f1cd32d28f35/evaluation/okf/cases.yml>
- Life-course competency contract at the exact admitted revision
  `4bc010eab3c9c072f68960393c1458a772aa700b`:
  <https://github.com/chris-page-gov/okf-uk-living/blob/4bc010eab3c9c072f68960393c1458a772aa700b/evaluation/competency-questions/README.md>
- Life-course AI-consumer review-status contract at that revision:
  <https://github.com/chris-page-gov/okf-uk-living/blob/4bc010eab3c9c072f68960393c1458a772aa700b/evaluation/ai-consumer/README.md#evaluation-design>
- HM Land Registry metadata-only boundary at the exact admitted revision
  `1d708e39f2cde19610d43c5a7f5e36e4a2f947bc`:
  <https://github.com/chris-page-gov/okf-LandRegistry/blob/1d708e39f2cde19610d43c5a7f5e36e4a2f947bc/docs/scope-and-coverage.md>
