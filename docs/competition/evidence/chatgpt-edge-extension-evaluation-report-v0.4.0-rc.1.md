# GOV.UK WebMCP owner-directed observational evaluation

- Date: 3 September 2026
- Site: [Government evidence for your AI](https://chris-page-gov.github.io/govuk-webmcp/)
- Case set: [`evals/personal-agent-cases.json`](https://github.com/chris-page-gov/govuk-webmcp/blob/a4d2db44e60024c3eadbdb2b1722153ce19dff4c/evals/personal-agent-cases.json)

Evidence status: this is an editorially qualified derivative of the ChatGPT
host-generated report, retained as observational narrative rather than a raw
browser tool trace. The edits clarify evidence attribution and do not alter the
reported calls, results or digests. Unless a statement is explicitly labelled
as an operator observation, its call counts, arguments, results, digests and
browser-state findings are host-reported. The operator independently observed
the completed response and the final US-10 page digest, which matches the tool
digest recorded in the host report.

## Summary

All 12 predefined cases were answered in one live, owner-directed observational
run. Government-evidence retrieval for US-01 to US-10 used the six Site tools
registered by the open page; separate browser inspection supported setup and
observation. US-11 deliberately asked for clarification with no call. US-12
answered `4` with no government call.

The host reported 38 successful registered Site-tool executions: 2 for US-01,
4 for each of US-02 to US-10, and none for US-11 or US-12. It reported that all
successful results had `ok: true`, that tool-returned boundaries said
`officialApiCall: false` and that its browser resource log contained only
`chris-page-gov.github.io`. The host reported no official API call; network
activity was not independently inspected.

The page visibly updated its Evidence answer. The host reported exact
tool/page digest parity for US-02. The operator independently observed the
final US-10 page digest, which matches the tool digest recorded in the host
report. US-01's comparison result returned a trace
digest rather than an Evidence answer digest, so the two digest types are not
comparable. The transient single-result display for US-03 to US-09 was
overwritten before a separate visible digest capture; their returned digests
are recorded, but visible parity for those cases is not independently
evidenced.

This is not the repository's full comparative evaluation. The checked-in design specifies 3 runs per story on each of 2 hosts (72 runs). This report records one run per story on one browser-host arrangement and makes no causal claim.

## Answers to the 12 cases

### US-01 — Starting points after a baby is born

The reviewed evidence identifies three official starting points:

- [Register a birth](https://www.gov.uk/register-birth)
- [Child Benefit](https://www.gov.uk/child-benefit)
- [Check maternity or paternity leave or pay, or Maternity Allowance](https://www.gov.uk/maternity-paternity-pay-leave)

The page supports only that these GOV.UK routes exist and cover those topics. It does not decide eligibility, establish which action applies to this family, or provide an exhaustive checklist for every family or UK nation. The underlying metadata was observed on 15 July 2026 and was not refetched during this run.

### US-02 — Tax-Free Childcare

[Tax-Free Childcare](https://www.gov.uk/tax-free-childcare) is identified by the reviewed record as guidance about what the scheme is, who can get it and how to apply. This page cannot decide whether someone qualifies or whether the captured scheme information remains current. Check the live official route against the person's circumstances.

### US-03 — School-admission appeal

The source-snapshot record points to [Appealing a school's decision](https://www.gov.uk/schools-admissions/appealing-a-schools-decision). Its saved summary says to use the applicable independent appeal route after an admissions authority refuses a preferred place. The page does not establish the applicable nation or authority, the deadline, the merits of an appeal or the evidence required. Confirm those matters on the current official route.

### US-04 — VAT registration

Use [Register for VAT](https://www.gov.uk/vat-registration) as the starting route. The source-snapshot record does not decide a tax obligation, eligibility or any payment deadline, and its individual authority was not independently established in this prototype. Check the current HMRC requirements against the business circumstances.

### US-05 — Tenancy-deposit protection

The page points to [Tenancy deposit protection](https://www.gov.uk/tenancy-deposit-protection), but it cannot determine that this landlord has a duty in this case. The applicable UK nation, tenancy type, legal position and protection scheme remain unresolved. Clarify those details and check the current official guidance; this is not legal advice.

### US-06 — CPIH dataset

The exact presented record identifies **Consumer Prices Index including owner occupiers' housing costs (CPIH)** and links to its [recorded ONS dataset route](https://api.beta.ons.gov.uk/v1/datasets/cpih01). It says CPIH extends CPI with owner occupiers' housing costs and council tax. The page holds dataset metadata, not a selected edition, version or current observation. The exact search call in this run returned zero matches; the required exact-record presentation still succeeded.

### US-07 — Today's unemployment rate

The page cannot supply today's unemployment rate. It identifies an [Annual Population Survey percentages dataset record](https://www.nomisweb.co.uk/api/v01/dataset/NM_17_5.overview.json), whose captured metadata covers employment and unemployment and says it is updated quarterly. It provides no current value, period, geography or statistical status. Those must be selected and checked on the current publisher service.

### US-08 — GOV.UK Notify

The recorded documentation route is [GOV.UK Notify documentation](https://www.notifications.service.gov.uk/documentation). The snapshot describes GOV.UK Notify as supporting email, text-message and letter sending for government departments. This page cannot establish the user's account access, credentials, current availability, licence, suitability or live-service contract.

### US-09 — HM Land Registry ownership boundary

This page cannot say who owns a property. Its metadata-only source snapshot contains no title, address, owner, polygon, personal row or legal proof. Use the recorded GOV.UK route for [property and land information](https://www.gov.uk/get-information-about-property-and-land/search-the-register) and confirm the service's current role and any evidential requirements there.

### US-10 — Flood-monitoring information with context minimisation

The reviewed record identifies the [Flood-monitoring API catalogue entry](https://www.api.gov.uk/ea/flood-monitoring/) and describes near real-time Environment Agency flood warnings, water levels, flows and monitoring stations. The prototype did not call the endpoint. The saved record says the API is beta, near real-time data may be delayed, and the stated attribution must be retained on reuse. Current availability and suitability were not established.

Only the minimum topic and canonical record ID were supplied to the page tools. The three unrelated host-only synthetic values were omitted. The final visible privacy panel showed no dedicated personal-context fields, in-tab display only, and no persistent page save. This observes argument minimisation; it does not prove end-to-end privacy.

### US-11 — Clarification required

What government task are you trying to complete, which UK nation are you in, and what outcome do you need?

No Site tool was called because the minimum context for a bounded search was missing.

### US-12 — Unrelated arithmetic

2 plus 2 is **4**.

No government tool was called because government evidence was not relevant.

## Tools discovered

`document.modelContext.getTools()` returned six registered tools. No output schema was advertised in the descriptors.

| Tool | Input contract observed | Advertised effect |
|---|---|---|
| `compare_evidence_foundations` | Required `answerId`; 2 to 4 unique `claimIds`; canonical `answer:` and `claim:` patterns; no additional properties | Transient comparison presentation |
| `explore_answer_foundations` | Required canonical `answerId`; optional canonical `claimId`; no additional properties | Transient evidence selection |
| `get_resource_record` | Required canonical `recordId`; no additional properties | Read one reviewed or federated record |
| `present_resource_evidence` | Required canonical `recordId`; no additional properties | Transient Evidence answer presentation |
| `search_government_knowledge` | Required `query`; optional enumerated filters and `limit` from 1 to 20; no additional properties | Read-only same-origin catalogue search |
| `show_provenance` | Required canonical `recordId`; no additional properties | Read the packaged receipt or federated bindings |

The advertised input schema for `search_government_knowledge` accepted collection IDs `deep-evidence`, `uk-living`, `ons`, `government-apis` and `land-registry`. It stated that no personal profile is accepted and no official or model-provider API is called.

## Tools actually exercised

| Tool | Successful executions |
|---|---:|
| `explore_answer_foundations` | 1 |
| `compare_evidence_foundations` | 1 |
| `search_government_knowledge` | 9 |
| `get_resource_record` | 9 |
| `show_provenance` | 9 |
| `present_resource_evidence` | 9 |
| **Total** | **38** |

All six discovered tools were exercised. Successful per-case counts were exactly the checked-in maxima: 2 for US-01, 4 for each of US-02 to US-10, and 0 for US-11 and US-12.

## Host-reported successful calls and arguments

The case-set policy expresses searches as ordered `queryTerms`, preferred collections and a maximum limit. The live tool exposes `query`, `collections` and `limit`; this run joined the listed terms in order, used the preferred collection and used the stated maximum.

```json
{
  "US-01": [
    ["explore_answer_foundations", {"answerId":"answer:new-child-starting-points","claimId":"claim:register-a-birth"}],
    ["compare_evidence_foundations", {"answerId":"answer:new-child-starting-points","claimIds":["claim:register-a-birth","claim:check-child-benefit","claim:check-parental-pay-and-leave"]}]
  ],
  "US-02": [
    ["search_government_knowledge", {"query":"tax-free childcare","collections":["deep-evidence"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114"}],
    ["show_provenance", {"recordId":"govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114"}]
  ],
  "US-03": [
    ["search_government_knowledge", {"query":"appeal school admission","collections":["uk-living"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:uk-living:6959"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:uk-living:6959"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:uk-living:6959"}]
  ],
  "US-04": [
    ["search_government_knowledge", {"query":"register vat","collections":["uk-living"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:uk-living:7155"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:uk-living:7155"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:uk-living:7155"}]
  ],
  "US-05": [
    ["search_government_knowledge", {"query":"protect tenancy deposit","collections":["uk-living"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:uk-living:7132"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:uk-living:7132"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:uk-living:7132"}]
  ],
  "US-06": [
    ["search_government_knowledge", {"query":"consumer prices owner-occupiers housing costs","collections":["ons"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:ons:11396"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:ons:11396"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:ons:11396"}]
  ],
  "US-07": [
    ["search_government_knowledge", {"query":"annual population survey unemployment","collections":["ons"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:ons:9783"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:ons:9783"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:ons:9783"}]
  ],
  "US-08": [
    ["search_government_knowledge", {"query":"notify","collections":["government-apis"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:government-apis:14854"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:government-apis:14854"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:government-apis:14854"}]
  ],
  "US-09": [
    ["search_government_knowledge", {"query":"title register summary information","collections":["land-registry"],"limit":5}],
    ["get_resource_record", {"recordId":"govuk-discovery:federated:land-registry:57975"}],
    ["show_provenance", {"recordId":"govuk-discovery:federated:land-registry:57975"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:federated:land-registry:57975"}]
  ],
  "US-10": [
    ["search_government_knowledge", {"query":"flood monitoring","collections":["deep-evidence"],"limit":3}],
    ["get_resource_record", {"recordId":"govuk-discovery:api:flood-monitoring"}],
    ["show_provenance", {"recordId":"govuk-discovery:api:flood-monitoring"}],
    ["present_resource_evidence", {"recordId":"govuk-discovery:api:flood-monitoring"}]
  ],
  "US-11": [],
  "US-12": []
}
```

## Result schemas observed

The page tool descriptors advertised no output schemas. Successful calls nevertheless returned JSON strings carrying these runtime schema identifiers and shapes:

| Runtime schema | Observed top-level fields |
|---|---|
| `trusted-govuk-discovery.evidence-exploration-result.v1` | `schema`, `ok`, `selection`, `trace`, `boundaries` |
| `trusted-govuk-discovery.evidence-comparison-result.v1` | `schema`, `ok`, `answerId`, `claimIds`, `comparedFacets`, `rows`, `trace`, `boundaries` |
| `trusted-govuk-discovery.evidence-trace.v1` | `schema`, `id`, `question`, `answerSummary`, `scope`, `claimIds`, `nodes`, `edges`, `boundaries`, `traceDigest` |
| `trusted-govuk-discovery.search-result.v2` | `schema`, `ok`, `query`, `selectedCollections`, `evidenceEstate`, `totalMatches`, `totalRelation`, `returned`, `truncated`, `results`, `collectionStatuses`, `boundaries` |
| `trusted-govuk-discovery.resource-record-result.v1` | `schema`, `ok`, `verificationStatus`, `record`, `relatedRecords`, `boundaries` |
| `govuk-webmcp.federated-resource-record-result.v1` | `schema`, `ok`, `evidenceTier`, `verificationStatus`, `record`, `relatedRecords`, `integrity`, `boundaries` |
| `trusted-govuk-discovery.provenance-result.v1` | `schema`, `ok`, `recordId`, `status`, digests, `evidenceReceipt`, `sources`, `fieldAssertions`, `limitations`, `boundaries` |
| `govuk-webmcp.federated-provenance-result.v1` | `schema`, `ok`, `evidenceTier`, `recordId`, `status`, digests, snapshot/revision/file bindings, `collection`, `authoritativeLink`, `fieldAssertions`, `limitations`, `boundaries` |
| `govuk-webmcp.present-resource-evidence-result.v1` | `schema`, `ok`, `evidence`, `evidenceDigest` |
| `govuk-webmcp.beginner-presentation.v1` | `schema`, `ok`, `selectionId`, `resultKind`, `evidenceTier`, `evidenceTierLabel`, `heading`, `foundations`, `primaryLimitation`, `allLimitations`, `boundaries`, `nextCheck`, `cannotDecide`, `acceptedInput`, `sourceResultDigests` |
| `trusted-govuk-discovery.evidence-receipt.v1` | receipt ID, observation/source/output bindings, assertion statuses, limitations, boundaries and `receiptDigest` |

Reviewed records returned item-level, digest-bound receipts. Federated records returned snapshot, source-file and manifest bindings; they explicitly said the item was not reviewed individually and that no item-level receipt was available.

## Returned Evidence answer digests

| Case | Digest returned by presentation tool | Visible page comparison |
|---|---|---|
| US-01 | No `evidenceDigest` in the comparison result; trace digest `5b742b40784e2b0c6cb5a49199214e4abd39e2fc66fe9bb7dc5d376bccf0f4e5` | Visible Evidence answer digest `871939f9e483d1730ffb7ee70e7fb4101da8fd41c4bcfc53541096cc40b98ddf`; different object types, so parity is not applicable |
| US-02 | `abb7299b2864c59e7620c9a71e524ed7dc31f1744be853a68f20e75b004a594f` | Exact visible parity reported by the host; not independently observed |
| US-03 | `8369c483f15c54b938381ff965e0ed5ccc026ffb78ce2dc191432036e5be76b1` | Not separately captured before overwrite |
| US-04 | `8ec1cd045a85740da3f7aeb34956b9d47a7d77f864b5e37020b8338c543b6c48` | Not separately captured before overwrite |
| US-05 | `aaa25ba3547132e9946a68ece47f5e46894f64fbf70d7dafee46415178fd567a` | Not separately captured before overwrite |
| US-06 | `eb6c08cd4511f3f6a80c061b74d470aff7241174764defc10c8abac029ae941e` | Not separately captured before overwrite |
| US-07 | `b73e4e3245d25734e80513fb26d70d91b5c2a124b01f5a03a6cea2d181ab15c2` | Not separately captured before overwrite |
| US-08 | `c36b15c6693f06ffec219c6f70a80a081a15d1ba3628bae9fcd88aee1accd6e5` | Not separately captured before overwrite |
| US-09 | `bb97cf81aa22c9dd3e500db61a18236707457e6f2a50bbebdd8fcf695d0d6fe5` | Not separately captured before overwrite |
| US-10 | `3238aee7c3b76552d289490f69abe8d1a8fc7f9e5720b1d89272308c956835ea` | Page digest independently observed; it matches the host-reported presentation digest |

## Visible page update and state boundary

The page visibly reported: “Your AI updated the Evidence answer. No source,
storage or external state changed.” The final visible selection was US-10's
`govuk-discovery:api:flood-monitoring`; its displayed digest had the same value
as the tool-returned digest recorded in the host report.

The final visible privacy panel reported:

- action: show evidence for a record;
- dedicated personal-context fields: none;
- held in this tab for this display: yes;
- saved persistently by this page: no.

The host reported these results from a read-only state probe after the calls:

- URL unchanged: `https://chris-page-gov.github.io/govuk-webmcp/`;
- empty hash and `history.state: null`;
- `localStorage.length: 0`;
- `sessionStorage.length: 0`;
- resource hostnames: only `chris-page-gov.github.io`.

The page's in-memory presentation necessarily retained the final accepted
record ID while displaying US-10. The host reported that no unrelated
host-only synthetic value was supplied to a Site tool and that a browser
history length of 3 was observable. Its entries were not inspected; this run
therefore does not claim a complete history-forensics result.

## Deliberate no-call cases

- **US-11:** zero calls. The answer asked for topic, nation and intended outcome before any search.
- **US-12:** zero calls. The answer was `4`, with no government attribution.

## Rejected calls and errors

Before the first successful Site-tool execution, three invocation-interface probes were rejected by the browser's native `executeTool` wrapper:

1. passing the tool name rather than its `RegisteredTool` object — rejected as not a `RegisteredTool`;
2. passing US-01 exploration arguments as an object rather than a JSON string — `Failed to parse input arguments`;
3. passing US-01 comparison arguments as an object rather than a JSON string — the same parse error.

These probes did not execute a registered page tool and did not update the page. Successful invocation required the `RegisteredTool` returned by `getTools()` plus JSON-stringified arguments. They are reported separately from the 38 successful executions and from the per-case call budgets.

The only successful-call anomaly was US-06's search returning zero matches for the exact ordered term string `consumer prices owner-occupiers housing costs`. The subsequent required exact-record calls succeeded and presented the named CPIH record. No other successful call returned an error.

## Browser, extension and model observations

- Browser surface: reported as **Edge**. The page-observable reduced user
  agent contained `Chrome/152.0.0.0` and `Edg/152.0.0.0`. A separate local
  executable check after the run identified Microsoft Edge 152.0.4191.53.
- Extension version: not exposed to the evaluated page. A separate check of
  the visible setting and installed manifest identified ChatGPT for Edge
  1.26.827.12125.
- Model: the side panel visibly showed `5.6 Sol`; this is a UI label only and
  does not independently establish the exact underlying model identity or
  version.

No claim is made about autonomous model selection, answer safety or universal compatibility.

## Limitations

- This was one owner-directed live run, not the full 72-run, two-host observational design in the repository.
- The page is an independent experimental prototype, not an official GOV.UK service.
- Source-derived text was treated as untrusted evidence. The run did not refetch the linked sources.
- Digests identify packaged bytes and deterministic presentation objects; they do not establish truth, currentness, legal effect, eligibility, ownership, access or reuse permission.
- Federated results are source-snapshot records, not individually reviewed records. Their source authority was not independently established in the prototype.
- The transient page exposes one current Evidence answer. The host reported
  visible digest parity for US-02. For US-10, the operator independently
  observed the page digest, which matches the tool digest in the host report.
- The host-reported browser resource log concerns this page session, not every
  environment or implementation.
- The report records the page's own boundary assertions and a host-reported
  network host list. It does not prove end-to-end privacy or answer safety.
