# Beginner evidence interface specification

**Status:** accepted implementation specification; candidate implementation authorised

**Implementation status:** core `0.4.0-rc.1` projection, sixth action, bounded
two-view routing and Evidence answer rendering are present in the working tree;
exact-candidate verification and release acceptance remain pending

**Date:** 1 September 2026

**Companion requirements:**
[Beginner trust pathway product requirements](beginner-trust-pathway-prd.md)

**Authorisation boundary:** the user has authorised the experimental candidate
implementation described here. This source-contract correction does not itself
change the application, WebMCP tools, schemas, release or deployment. Release
acceptance and formative user research remain separately evidenced work and
must not be claimed before they occur. The source-contract correction is complete
for the current candidate.

## 1. Outcome

The candidate default view should help a person answer five questions before they
rely on government information:

1. What does this page's evidence support?
2. Where did that evidence come from?
3. What might the person's AI have added?
4. What is missing, conditional or out of date?
5. What is the safest current check?

The page must present a short evidence summary before technical detail. It must
retain the existing evidence-dense interface as a separate **Technical review**
view over the same canonical data and actions. Neither view may calculate a
trust score or imply that a source, checksum or AI answer is automatically
correct.

The intended change is information architecture, not a new answer-generating
service. The page remains static, contains no model and makes no runtime call to
an official API.

## 2. Decisions and non-decisions

The following decisions make this specification testable without pretending
that usability research has already approved a visual design.

| ID | Decision |
| --- | --- |
| DS-01 | In the authorised candidate, an empty URL opens **Evidence answer**, the beginner view. |
| DS-02 | **Technical review** preserves the current analytical index, Evidence Trace, comparison, full record, provenance, estate and WebMCP diagnostics. It is not deleted or reduced. |
| DS-03 | Both views use the same action controller, validated artefacts, result objects and limitations. There is no beginner-only copy of a source record. |
| DS-04 | The guided view presents deterministic page evidence, not a generated answer. Model-generated prose stays in the AI host and remains non-canonical. |
| DS-05 | The page may show the exact validated arguments it accepted for a successful action. It must not retain or render rejected WebMCP or structured arguments. A rejected human query may remain only in its form field for correction; it is not copied into activity, results, storage, analytics or canonical metadata. |
| DS-06 | The page cannot automatically know what an AI added to its final answer. It must say so and give the person a comparison method; it must not invent an AI transcript or claim to have checked one. |
| DS-07 | Source, evidence tier, an explicitly mapped decision-relevant limitation or the complete limits-to-check list, and a safe next check remain visible without opening a disclosure. Technical identifiers and the full source chain may use progressive disclosure. |
| DS-08 | A text-first evidence path is canonical. Any diagram is an alternative rendering of the same labelled relationships and has an equivalent ordered list or table. |
| DS-09 | There is no overall trust, confidence or quality score, traffic-light verdict or “trusted” badge. Authority, integrity, currentness, access, rights and coverage remain separate questions. |
| DS-10 | Search and task text, action origin and the accepted-input activity copy remain in memory only. A validated, bounded, non-personal evidence identifier may also become canonical selection state in the fragment, including when the same identifier was an accepted action argument, but only after explicit human selection or view navigation. A WebMCP call does not mutate the URL or browser history. No other accepted value enters the URL, persistent storage, analytics or canonical metadata. |
| DS-11 | The existing five tools remain unchanged for compatibility. The sixth display tool is authorised for experimental implementation only with its closed schema, executable validation, security review and WebMCP contract tests; implementation does not itself establish release or host acceptance. |
| DS-12 | Visual treatment, component styling and success thresholds remain research decisions. Semantic order, content responsibilities, states and acceptance evidence are specified here. |

## 3. Current-interface review

The current page is a strong assurance surface and the baseline for Technical
review. It is not yet a beginner interface.

| Need | Current behaviour | Specification response |
| --- | --- | --- |
| Independent identity | The prototype banner, footer and boundaries are visible. | Retain them in both views and place the independent status before any result. |
| Evidence before answer | A worked answer and analytical index appear first. | Keep the evidence-first order but replace the opening technical inventory with a task, support, limitation and next-check summary. |
| Source inspection | Source-link, hostname and role states are available, including absent links. | Keep the source name, role and link state visible, with a destination only where established; retain the full chain in Technical review. |
| Evidence tiers | Reviewed and federated tiers are explicit but use specialist language. | Lead with “reviewed record” or “wider catalogue record”, followed by the exact technical label on demand. |
| Limitations | Limitations are present, often after many facets. | Put an explicitly mapped decision-relevant limitation beside the supported statement; otherwise show the complete limits-to-check list before the source action. |
| AI additions | The page contains no model and does not receive the host's final prose. | State that boundary. Show what the page returned and ask the person to compare dates, amounts, deadlines, eligibility and instructions in the AI's wording. |
| What was shared | Technical diagnostics retain an input digest, not the accepted values. | A successful presentation action shows its exact validated input in plain English and structured form. Rejected structured input is not retained; an invalid human query may remain only in its field for correction. |
| Human and WebMCP parity | Human and tool routes share runtime actions and deterministic results. The three read-only discovery tools do not change the page display. | Preserve the shared controller. Evaluate a separately reviewed presentation action so an AI can select a record without changing the read-only discovery tools. |
| Accessibility | Semantic controls, focus handling and bounded manual evidence exist for the current journeys. | Retain those behaviours, simplify the reading order and test the new disclosures and state changes rather than inheriting a conformance claim. |
| Deep assurance | The analytical index, trace, comparison, record, provenance, corpus estate and diagnostics are extensive. | Preserve them together in Technical review, reachable at the same evidence selection. |

This review does not establish that the proposed guided order is usable. It
identifies the smallest comprehension risk to prototype: whether a person can
identify the supported statement, source, applicable mapped limitation or
limits to check, AI boundary and next check before technical evidence is
revealed.

## 4. Two views, one evidence state

### 4.1 Shared shell

Both views use this semantic order:

1. skip link;
2. independent-prototype header;
3. view navigation;
4. one `main` landmark containing the selected view;
5. a non-interrupting status region; and
6. the existing independent-status, accessibility, privacy, security and source
   links in the footer.

The view navigation is a two-item list of links labelled **Evidence answer**
and **Technical review**. The active link uses `aria-current="page"`. Switching
views preserves the selected answer, claim, comparison or record and moves
focus to the new view's `h1`. It must not rerun a search or send a tool call.

This is ordinary page navigation, not an ARIA tab widget. GOV.UK advises that
tabs are not page navigation and that content hidden in tabs can be missed; its
service-navigation guidance establishes a familiar link-based navigation
pattern. The sticky control must also leave the focused component visible, in
line with WCAG 2.2 Focus Not Obscured (Minimum). [G22; G23; A03]

### 4.2 Evidence answer

Evidence answer is the candidate default for an empty URL. It is task-led, uses
plain English first and exposes technical evidence in context.

The view uses the `h1` **Evidence answer**, matching the persistent navigation
label and the release terminology. Its introduction says that the page is
independent, contains no AI and helps a person check a saved record and its
recorded link before acting.

When a two-to-four-claim comparison is selected, Evidence answer retains the
claim IDs but shows the answer overview and a notice: **A detailed foundation
comparison is selected. Open Technical review to inspect it.** Switching back
restores the exact comparison. The guided view does not turn the comparison
into a score or silently discard it.

### 4.3 Technical review

Technical review retains the current interface and terminology, including:

- verified bundle and collection summaries;
- analytical index and Evidence Trace;
- claim-foundation comparison;
- evidence-estate admission table;
- full search filters and result metadata;
- exact record and provenance panels;
- structured JSON and relationship table; and
- WebMCP registration and result-digest diagnostics.

Its view heading is **Technical review: government knowledge evidence**. The
candidate replaces the earlier unqualified page heading with **Government
evidence for your AI** and uses the specified Technical review heading. The
shared summary carries the neutral accessible label **Knowledge evidence
summary**. Passing artefact checks must not read as a claim that the content is
true.

Extraction into a separate renderer must not change its data, tool outputs,
keyboard behaviour, deep links or current limitations. Existing browser tests
become semantic regression tests for this view; only assertions for the
deliberately neutral heading and copy may change.

The earlier runtime sentence that the page “does not accept a profile” was a
deliberate copy exception, not wording to preserve. Technical review now says
that tools expose no dedicated profile or personal-context field and that
bounded free-text search can still contain personal details.

### 4.4 URL contract

The candidate router admits only bounded fragment parameters:

```text
#view=guided
#view=guided&record=<canonical-record-id>
#view=guided&answer=<canonical-answer-id>&claim=<canonical-claim-id>
#view=guided&answer=<canonical-answer-id>&compare=<two-to-four-claim-ids>
#view=technical&record=<canonical-record-id>
#view=technical&answer=<canonical-answer-id>&claim=<canonical-claim-id>
#view=technical&answer=<canonical-answer-id>&compare=<two-to-four-claim-ids>
```

- An empty fragment opens Evidence answer in the authorised candidate.
- A legacy fragment with `record`, `answer`, `claim` or `compare` but no `view`
  opens Technical review so existing evidence links keep their meaning.
- Unknown, duplicated, oversized or incompatible parameters fail closed to the
  appropriate default with a visible explanation.
- Query and task text, action origin and the accepted-input activity copy never
  enter the URL. A validated non-personal evidence identifier may appear only
  as the canonical selection value described above.
- Back and forward navigation restore the view and evidence selection without
  repeating a search or tool call.

These routes are implemented candidate contracts, not current released
behaviour. Unit acceptance does not replace history, keyboard or real-browser
verification.

## 5. Evidence answer page regions

The following regions define content and semantic order. They do not prescribe
columns, colours, illustrations or animation.

### GE-01 — independent identity

Always visible before the task:

> Independent experimental prototype. This is not GOV.UK and does not make a
> decision about your circumstances.

Do not use a GOV.UK crown, official header or design treatment that could imply
endorsement.

### GE-02 — task entry

Use one labelled search field:

- label: **What do you need to find?**
- hint: **Use a short topic. Do not include a name, full address, account number
  or private history.**
- submit button: **Find evidence**
- examples: new baby, school appeal, VAT registration, CPIH metadata, GOV.UK
  Notify API and property information.

The field retains the existing 160-character limit and the same executable
validation as `search_government_knowledge`. Filters remain available under a
keyboard- and touch-operable **Refine the search** disclosure. A person does not
need WebMCP to use it.

Below the examples, an authored **Show the reviewed new-baby starting points
example** button calls the shared `explore_answer_foundations` application
action with only
`{"answerId":"answer:new-child-starting-points"}`. It is labelled as a worked
example, not a match to the person's circumstances. On success it moves focus
to GE-04. It neither submits the search field nor adds a WebMCP tool.

A submitted validation failure shows an error summary linked to the field and
an inline error, sets `aria-invalid="true"` and moves focus to the error
summary. Its heading is **There is a problem**, its linked message matches the
inline message, and the page title begins **Error:**. Activating the summary
link moves focus to the field. When results become available, expose a **Skip
to evidence results** link; do not move focus merely because background WebMCP
registration changed.

### GE-03 — page activity

After an action, show one short statement before the result:

- human: **You asked this page to find: “…”**;
- WebMCP presentation: **Your AI asked this page to show evidence for this
  record.**; or
- no presentation action: no new page activity is invented.

The origin label describes the observed action only. It must not claim that the
AI understood the person, preserved privacy or used no other provider.

A successful search then shows its exact or lower-bound count semantics and an
ordered list of matching records. Do not select the first match automatically.
Each result is an `article` containing:

- record title and publisher;
- **Reviewed record** or **Wider catalogue record**;
- the first admitted limitation, labelled **Limit to check** rather than ranked
  as the most important;
- recorded-link role and destination when a direct link exists; and
- a **Show evidence for this result** button.

The button calls the same combined application action used by the presentation
tool. After an explicit activation, focus moves to the selected
GE-04 heading. Search completion itself is announced politely without moving
focus. Partial results name unavailable collections and say that the results
may be incomplete.

### GE-04 — evidence summary

The summary is an `article` with a task-specific heading and these visible
parts in this order:

1. **What this page found** — the result kind and title;
2. **What the evidence supports** — a bounded source-derived statement;
3. **Evidence status** — a plain-English assurance explanation followed by its
   precise schema, kind, tier, selection and digest state;
4. **Recorded source or sources** — one entry for each supported statement,
   with source role and either meaningful link text and destination hostname or
   an explicit “No direct source link established”;
5. **When the evidence was observed** — the recorded date and an explanation
   that observation does not establish current accuracy;
6. **Integrity, access, rights and coverage** — four separate statements, not
   one trust score;
7. **Important limit** — the explicitly mapped `primaryLimitation` when one
   exists, followed by **Other recorded limits** containing every other
   applicable item. Without a mapping, show **Limits to check** and the complete
   existing list. If that list is empty, state that no limitation is recorded
   and that this does not establish that no limitation exists;
8. **What this page cannot decide** — eligibility, legal effect, a live value,
   ownership or another task-specific boundary;
9. **What was shared with this page** — the exact accepted structured fields or
   the explicit initial/restored state;
10. **Compare this with your AI's answer** — **From this page**, **From your
    AI** and **Check carefully**;
11. **Before you rely on this** — supported conclusions, remaining unknowns and
    the next appropriate check; and
12. **See the complete technical evidence** — the corresponding Technical
    review selection.

Source-derived strings are rendered as text. They never become markup,
instructions, tool names or CSS classes.

### GE-05 — evidence path

Use a numbered, selectable path rather than an overall score:

1. the person's question or selected record;
2. the exact statement supported by the page;
3. the recorded source, its role and whether a direct link is established;
4. how the packaged record was checked;
5. the main gap or limitation; and
6. the current action the person can take.

Each step is a heading or disclosure button followed by one short explanation.
The button exposes its relationship using `aria-expanded` and `aria-controls`;
opening or closing detail does not move focus. A plain ordered list is always
present. A later diagram may connect the same identifiers, but it cannot
replace the list or introduce a new inferred relationship.

### GE-06 — what came from where

Show three visibly separate statements:

- **From this page:** the exact supported statement, material limits and
  recorded source role, with a link only when one is established in the
  deterministic result;
- **From your AI:** “Your AI may have shortened, combined or added to this.
  This page cannot see or verify its final wording.”; and
- **Check carefully:** dates, amounts, deadlines, eligibility, legal steps,
  ownership claims and instructions not present in the page evidence.

Do not provide an empty text box that invites a person to paste sensitive AI
conversation content. A later host integration would require a separate privacy
and data-flow decision.

### GE-07 — what was shared with this page

For a successful human or presentation action, show a closed list of the
validated fields the page accepted, for example:

```text
Action: Show evidence for a record
Record reference: govuk-discovery:...
Dedicated personal-context fields in this action: none
Held in this tab for this display: yes
Saved persistently by this page: no
```

The structured equivalent may appear in a disclosure. Never reconstruct input
from a digest. Never display raw rejected values. For a deep link, restored
history entry or initial state with `acceptedInput: null`, say **No new action
was accepted for this restored view**. If the page cannot observe a read-only
host call because it did not request presentation, say **No AI action was
presented to this page** rather than **Nothing was shared**.

Every accepted-input string is untrusted data and is rendered through text-only
APIs. Markup, URLs, instruction-like wording and control characters in a valid
bounded query do not become HTML, links, commands or styling.

### GE-08 — explanation on demand

Use native `details` and `summary` for non-stateful explanations such as:

- Why is this called a reviewed record?
- What is a source snapshot?
- What does a checksum check?
- What is provenance?
- What are access and reuse rights?
- How can an AI use this page?

The first sentence answers the question without another link. Explanations are
available by keyboard, touch and assistive technology and never depend on
hover. Opening an explanation does not change the URL or evidence state.

### GE-09 — deeper evidence

Offer one always-available action after the summary:

- **See all evidence details** switches to Technical review at the same record
  or answer.

For each foundation with a direct recorded source link, also offer **Open the
recorded source for this statement** and open the stated destination in the
ordinary browser context with safe link attributes. If no direct link is
established, show that state and do not create or substitute a URL.

Do not label a producer-declared or independent republication link
“authoritative”. Use the role-specific labels **Open official source**, **Open
recorded source link** or **Open independent OKF record**.

### GE-10 — reflection

End each successful journey with three short prompts:

- **Supported:** what the packaged evidence supports;
- **Still unknown:** the material unanswered question; and
- **Next check:** the safest current source or clarification.

This is a deterministic recap assembled from the same presentation fields. It
does not praise trust or tell the person that the result is safe.

### Learning-loop mapping

| Stage | Regions | Beginner outcome |
| --- | --- | --- |
| Explain | GE-03 and GE-04 | Identify the kind of result, supported statement and immediate boundary. |
| Inspect | GE-04, GE-05, GE-08 and GE-09 | Inspect source role, separate assurance questions, all limitations and deeper evidence. |
| Do | GE-02, GE-03 and GE-09 | Refine the topic, select a result, show its evidence or open an established link. |
| Check | GE-04, GE-06 and GE-09 | Compare the page evidence with AI wording and the current recorded destination. |
| Reflect | GE-06, GE-07 and GE-10 | State what is supported, unknown, accepted by the page and worth checking next. |

Every successful human journey supports all five stages without requiring
Technical review, WebMCP, a model or raw JSON.

## 6. Deterministic presentation contract

The guided view needs a pure projection over existing result objects. It must
not parse free text to invent authority, rank truth or generate advice.

### 6.1 Presentation fields

Every successful guided presentation has these fields:

| Field | Meaning |
| --- | --- |
| `selectionId` | Canonical answer, claim or record identifier. |
| `resultKind` | `reviewed-answer`, `reviewed-record` or `federated-record`. |
| `heading` | Existing answer or record title, rendered as text. |
| `evidenceTierLabel` | Beginner label paired with the exact machine tier. |
| `foundations` | One to four closed foundation objects. A record has one; a reviewed answer has one per selected claim so no source or claim boundary is lost. |
| `primaryLimitation` | An explicitly mapped limitation or `null`; never an array-position fallback or model ranking. |
| `allLimitations` | Complete deduplicated overall and foundation limitations in stable source order. |
| `boundaries` | Complete existing capability and assurance boundaries. |
| `nextCheck` | A fixed template selected by result kind and capability boundary. |
| `cannotDecide` | An existing boundary such as no eligibility, live value, legal effect or ownership. |
| `acceptedInput` | Closed successful validated action input for the in-memory activity display, or `null` when a deep link, history restoration or initial state caused no newly observed action. |
| `sourceResultDigests` | Trace digest for a reviewed answer, or separately computed canonical record-result and provenance-result digests for a record. |

Each `foundations` object has:

| Field | Meaning |
| --- | --- |
| `claimId` | Canonical claim identifier for an answer, or `null` for a record. |
| `supportedStatement` | Existing deterministic claim or an authored template populated only from validated record fields. |
| `publisher` | Recorded publisher or explicit “Not established”. |
| `resourceDetails` | Closed task-relevant metadata such as resource type, source-native identifier, edition, version, snapshot and revision where present; absent values are explicit. |
| `sourceTitle` | Recorded source title. |
| `sourceAuthority` | Existing independently established or unestablished authority state. |
| `sourceRole` | Official, producer-declared, independent publication or no direct authority link established. |
| `sourceUrl` | Already validated recorded destination, or `null` when no direct link is established. |
| `sourceHostname` | Visible hostname derived from `sourceUrl`, or `null` when no direct link is established. |
| `assertionStatus` | Existing source-declared, normalised, inferred or other admitted assertion or derivation state. |
| `observedAt` | Existing observation date or explicit “Not established”. |
| `integrityBasis` | Existing record, receipt, snapshot or file-integrity basis with the byte-identity boundary. |
| `access` | Existing access status and note, including missing or unestablished evidence. |
| `rights` | Existing reuse-rights status, title and note, including missing or conflicting evidence. |
| `coverage` | Existing coverage state and note, including what the result does not cover. |
| `primaryLimitation` | Explicit guidance-map limit, or `null` when no decision-relevant mapping is approved. |
| `allLimitations` | Complete existing ordered limitation list for this foundation. |

The first prototype must define the primary limitation explicitly in its
fixture or presentation mapping. It may use the first existing limitation only
where a contract test proves that authored order is decision-relevant. It must
not use a model, keyword sentiment or visual severity colour to choose one.

Publisher, assertion state, currentness, integrity, access, rights and coverage
are separate labelled questions in the guided details. Each returns an admitted
value or an explicit **Not established**, **Missing**, **Conflicting** or **Not
applicable** state. The renderer never drops an empty-looking state, replaces
it with an optimistic default or collapses these questions into a verdict.

`sourceResultDigests` bind the untouched underlying result objects; they do not
include a self-digest of the presentation object. The action controller computes
the complete presentation result digest as external action metadata, using the
same existing canonical-result process for both human and WebMCP origins.

### 6.2 Evidence-tier language

| Machine state | Beginner label | Required boundary |
| --- | --- | --- |
| `reviewed-deep-evidence` answer | Worked answer from a small reviewed set in this prototype | It is bounded, observed and not a personalised or exhaustive checklist. |
| `reviewed-deep-evidence` record | Reviewed record in this prototype | A receipt checks the packaged record, not the live source's truth or currentness. |
| `federated-source-snapshot` | Wider catalogue record | This came from a saved source collection and was not checked item by item in this prototype; authority, access and rights remain as recorded. |
| no suitable result | This evidence cannot answer that question | No substitute source or model-generated fact may be selected. |

### 6.3 Safe next-check templates

Templates are chosen from explicit result boundaries:

- reviewed route: **Open the recorded official source, confirm that it is
  current and check that it applies to your circumstances.**;
- federated route with recorded link: **Open the recorded source, check who
  published it and confirm that it is current and usable for your task.**;
- live-value request: **Use the current publisher service to choose the measure,
  geography, period and status. This page holds metadata, not today's value.**;
- ownership request: **Open the recorded GOV.UK property-information link and
  confirm its role. This page holds no title, address or owner record.**;
- jurisdictional ambiguity: **Clarify the nation, responsible authority and
  outcome before treating this route as applicable.**; and
- no suitable result: **Refine the topic or use the current official GOV.UK
  search. Do not fill the gap from memory.**

These templates are product copy, not legal, financial or eligibility advice.

### 6.4 First-prototype primary-limitation map

The first prototype uses this explicit, authored map. US-01 to US-10 map a
selected result to a primary limitation. US-11 and US-12 map the required no-
presentation outcome instead. The prototype does not choose a limitation by
array position, wording, colour or model ranking.

| Story | Selection | Primary limitation or no-presentation outcome |
| --- | --- | --- |
| US-01 | `answer:new-child-starting-points` | Three recorded starting points are not an exhaustive or personalised checklist. |
| US-02 | `govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114` | The saved guide does not decide current eligibility or scheme rules. |
| US-03 | `govuk-discovery:federated:uk-living:6959` | Authority, evidence, deadline, merits and jurisdiction are not established by this discovery record. |
| US-04 | `govuk-discovery:federated:uk-living:7155` | Discovery is not tax advice or evidence of a registration requirement. |
| US-05 | `govuk-discovery:federated:uk-living:7132` | The applicable nation, tenancy and protection scheme remain unresolved. |
| US-06 | `govuk-discovery:federated:ons:11396` | Dataset metadata is not a selected edition, version or observation. |
| US-07 | `govuk-discovery:federated:ons:9783` | The record supplies no current value, period, geography or statistical status. |
| US-08 | `govuk-discovery:federated:government-apis:14854` | The record grants no account, credential, access, licence, suitability or live-service contract. |
| US-09 | `govuk-discovery:federated:land-registry:57975` | The bundle supplies no title, address, owner, polygon, personal row or legal proof. |
| US-10 | `govuk-discovery:api:flood-monitoring` | Minimal accepted arguments do not prove that context was withheld or that the recorded source is suitable. |
| US-11 | No selection before clarification | The minimum topic, nation or outcome needed for a bounded search is missing. |
| US-12 | No selection | A government-evidence action is not relevant to the calculation. |

For every other record, `primaryLimitation` is `null`. The guided result shows
**Limits to check** with the complete `allLimitations` list before a source
action; it does not promote the first array entry as “most important”. The map
must not contain or imply a positive A Life in the UK specialist-acceptance
count. The corrected current-candidate contract records zero accepted reviews,
two service families where review is not required and 291 where it is required.

## 7. Result and system states

Every state keeps an actionable explanation and never upgrades missing
evidence.

| State | Required message and action |
| --- | --- |
| Verifying | “Checking the packaged evidence before enabling search.” Controls are disabled and the status is announced once. |
| Ready, no task | Explain what can be searched, give examples and state that the page contains no AI. |
| Searching | Keep the submitted topic visible, mark the results region busy and announce completion once. |
| Reviewed result | Use the reviewed label, item-receipt boundary, official link where established and all material limitations. |
| Federated result | Use the source-snapshot label, recorded link role and no-item-review boundary. |
| Partial collection failure | Show the available collections and name each unavailable collection; do not describe the result count as complete. |
| No match | “No matching record was found in the selected evidence.” Offer refinement and official search; do not choose a substitute. |
| Unsupported decision | State the boundary, show relevant metadata only if available and identify the current official check. |
| Invalid input | Explain the permitted correction. State that no action was executed and do not echo rejected nested values. |
| Artefact validation failure | Keep all tools and search disabled. Explain that the evidence could not be verified. |
| WebMCP unavailable or blocked | Keep the human journey fully usable. Put browser diagnostics in Technical review and use a short optional explanation in Evidence answer. |
| Presentation tool rejected | Keep the previous view unchanged, announce the rejection once and state that no source, storage or external state changed. |
| Clarification needed | This is a host outcome, not a page result. The host asks only for the minimum topic, nation or outcome before a bounded call. |
| Unrelated request | No government tool call and no page mutation is the successful outcome. |

## 8. Human and WebMCP choreography

### 8.1 Shared deterministic flow

```text
human control or fixed WebMCP tool
  -> closed schema and executable input validation
  -> same-origin canonical action
  -> reviewed or federated runtime
  -> deterministic result and digest
  -> Evidence answer projector or Technical review renderer
```

The model's final explanation is outside this flow. It may consume a tool
result, but it cannot write canonical metadata or silently replace the page's
supported statement.

### 8.2 Existing tools

The first prototype retains all five existing tools and their current output:

- `search_government_knowledge`;
- `get_resource_record`;
- `show_provenance`;
- `explore_answer_foundations`; and
- `compare_evidence_foundations`.

The three discovery tools stay read-only and do not gain a hidden display side
effect. The two existing presentation tools continue to update only reversible
in-memory answer and comparison selection.

### 8.3 Candidate record-presentation action

The current model diagnostic exposed an ambiguous search → record → provenance
sequence. The candidate implements one additional explicit action:

```json
{
  "name": "present_resource_evidence",
  "input": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "recordId": {
        "type": "string",
        "minLength": 8,
        "maxLength": 160
      }
    },
    "required": ["recordId"]
  }
}
```

The executable validator must apply the same closed canonical record-ID pattern
as `get_resource_record`. On success, the action obtains the exact record and
provenance through the shared runtime, creates the deterministic presentation
object in section 6, updates the selected page view and returns that same
object. Its annotation cannot claim read-only behaviour because it changes the
reversible in-memory display selection. It performs no storage, catalogue or
external-state write and makes no external network request.

Its required annotations are exactly
`{ "readOnlyHint": false, "untrustedContentHint": true }`: the display change
is not read-only and every source-derived string remains untrusted content. A
WebMCP execution does not change `location.hash` or add browser-history state.
Only a later explicit human selection or view-navigation action may serialise
the already validated identifier as the bounded fragment selection in section
4.4.

The human equivalent is **Show evidence for this result** and calls the
same application action. The action performs no storage, catalogue or external-
state write and makes no official-service or model-provider request. A
federated selection may still lazily read checksum-bound same-origin manifest,
posting and record shards under the existing budgets. The tool is part of the
`v0.4.0-rc.1` product contract. Any supported-host claim requires its own fresh,
authenticated exact-release observation; the retained `a4fabe…` observation is
historical pre-hardening evidence.

Executable validation is deliberately stricter than JSON Schema. It accepts
only ordinary plain objects with allowed own enumerable string data properties
and dense canonical-index arrays; symbols, accessors, non-enumerable fields,
sparse items and extra array properties are rejected without invoking getters.
Supported-host publication must freshly authenticate the Pages receipt
in-process, require ordered `initial`, `after-page-load` and `after-execution`
deployment checks and match both stored public and private receipt bindings.

Presentation is transactional. Validation and projection finish before commit;
one latest-started sequence spans `explore_answer_foundations`,
`compare_evidence_foundations` and `present_resource_evidence`. An older call
may still return its deterministic result to its caller, but neither its direct
commit nor a later asynchronous reviewed projection may replace the newer page
selection. A human route changes only after its presentation commits. A WebMCP
presentation while Technical review is open
updates Evidence answer and announces that fact without changing the active
view, URL, history, focus, scroll, rendered record or provenance. Cancellation,
failure or the fixed eight-second timeout retains the previous answer and
cannot expose a partial display. Before release acceptance the action requires:

1. input and output schemas;
2. executable validation and tamper tests;
3. cancellation, timeout and lifecycle tests;
4. exact page/result digest-parity tests;
5. host discovery and execution evidence;
6. accessibility observations for the resulting display change;
7. security review of the accepted-input display.

Formative user research comparing it with the current two-call record and
provenance path remains required after the experimental candidate and must not
be represented as completed release evidence.

If the evaluation finds no comprehension or reliability benefit, retain the
five-tool contract and use the combined action only inside the human interface.

## 9. Story-to-interface mapping

| Stories | Default result | Required visible boundary | Next check |
| --- | --- | --- | --- |
| US-01 | Reviewed worked answer with three starting points | Bounded directory, not an exhaustive or personalised checklist | Open each current GOV.UK route that is relevant. |
| US-02 | Reviewed Tax-Free Childcare record | Route metadata does not decide eligibility or current scheme rules | Open the current official service. |
| US-03 | UK Living discovery result | Jurisdiction, authority, evidence, deadline and merits are not decided | Confirm the responsible authority and current appeal route. |
| US-04 | UK Living VAT route | Discovery is not tax advice or a registration obligation | Check current HMRC requirements. |
| US-05 | UK Living deposit route | Nation, tenancy and scheme remain unresolved | Clarify jurisdiction and tenancy, then use the applicable official route. |
| US-06 | ONS dataset metadata | Dataset metadata is not an observation | Open the ONS source and select the required edition or version. |
| US-07 | ONS metadata-only boundary | No runtime value, period, geography or statistical status | Check the current publisher service. |
| US-08 | Government APIs discovery result | Catalogue inclusion grants no account, credential, access or suitability | Open the recorded documentation and verify the current contract. |
| US-09 | Land Registry metadata boundary | No title, address, owner, polygon or legal proof | Open the recorded GOV.UK property-information link and retain its producer-declared role. |
| US-10 | Task-minimal flood discovery | Show exact accepted query; do not claim that withheld context was tested unless marker evidence exists | Open the recorded flood-data source and confirm current access and terms. |
| US-11 | No page action before clarification | The host needs a topic, nation or outcome and must ask only for what is needed | Answer the minimum clarifying question. |
| US-12 | No page action | Government evidence is irrelevant to the calculation | Use the AI's ordinary calculation capability without government attribution. |

All 12 remain synthetic representative hypotheses. Passing a deterministic
fixture does not establish that a beginner understood the result.

## 10. Proposed implementation structure

This structure keeps data and presentation modular so the technical baseline
does not have to be rebuilt when beginner copy is revised.

The projection, copy, composite action, shared-controller extension, sixth
registration, route, renderer, mounts and styles listed below are visible in
the current worktree, and the automated Chrome and Edge suites pass. Natural
host evaluation, live supported-host and manual accessibility evidence remain
pending. File presence is not proof that the complete acceptance matrix passes.

| File or module | Responsibility |
| --- | --- |
| `src/beginner-presentation.ts` | Pure, model-free projection from validated action results to the closed presentation object. No DOM and no source fetch. |
| `src/beginner-presentation-copy.ts` | Fixed en-GB labels, explanations and safe next-check templates. No source-derived markup. |
| `src/present-resource-evidence.ts` | Validate the bounded record selection, obtain canonical record and provenance results and return the shared deterministic presentation. |
| `src/application-actions.ts` | Continue to own shared action execution; the accepted-input field must contain only post-validation canonical values. |
| `src/webmcp-tools.ts` | Keep the five released definitions stable and add the candidate presentation tool only with its separate closed contract and verification. |
| `app/view-routing.ts` | Parse the bounded view and evidence fragment, preserve legacy links and reject incompatible state. |
| `app/evidence-answer-view.ts` | Render GE-01 to GE-10 from presentation objects and shared application state. |
| Existing technical renderer | Retain the current renderer and diagnostics without semantic loss; do not refactor it solely for this release. |
| `app/main.ts` | Verify artefacts, create one action controller, coordinate views and registration, and own no business copy. |
| `app/index.html` | Shared landmarks, view navigation and empty semantic mount points. |
| `app/style.css` | Shared tokens, visible focus, reflow, forced-colour and reduced-motion treatment; no meaning by colour alone. |
| `schemas/beginner-presentation.schema.json` | Closed authorised presentation contract. |
| `schemas/present-resource-evidence-input.schema.json` | Closed authorised tool input contract. |
| `schemas/present-resource-evidence-output.schema.json` | Closed deterministic result union for the authorised tool. |
| `tests/unit/beginner-presentation.test.mjs` | Projection, primary-limit, source-role, unknown-state and inert-text tests. |
| `tests/browser/evidence-answer.spec.mjs` | Guided human flow, view parity, routing, focus, status and WebMCP presentation tests. |
| `evals/personal-agent-cases.json` and `evals/generated/personal-agent-run-plan.json` | Twelve natural host/tool-selection stories and the generated 72-slot Copilot/Ollama run plan. |

No generated catalogue, source lock or evidence receipt is copied into a UI
module. Generated artefacts remain generated; human-readable copy and
presentation mappings remain authored and validated.

## 11. Accessibility and inclusive-content contract

### 11.1 Structure and operation

- One `h1` per selected view, followed by headings in order.
- Native form controls, links, buttons and `details` before custom widgets.
- A visible skip link and visible keyboard focus in both views.
- Results, errors and view changes announced once through appropriate status
  patterns; routine disclosure changes are not repeatedly announced.
- Focus moves to the error summary after validation failure; its link moves to
  the invalid field. A successful search is announced without moving focus.
  An explicit result selection moves focus to the GE-04 heading, and closing a
  record, explanation or comparison returns focus to the invoking control.
- The full guided loop works at 320 CSS pixels and 400% zoom. Only labelled
  technical tables or code may scroll in two dimensions.
- Forced colours and reduced motion preserve every state and relationship.
- No essential text appears only on hover, in colour, in an icon, in a diagram
  or after pointer movement.

### 11.2 Language

Lead with the person's task. Use these plain English questions before the
technical labels:

| Technical term | First explanation |
| --- | --- |
| Evidence tier | How closely was this record checked in this prototype? |
| Provenance | Where did this record come from, and what happened to it? |
| Assertion | What does the evidence actually say? |
| Snapshot | A fixed copy recorded at a stated time. |
| Checksum or digest | A code used to detect whether the declared packaged bytes changed. It does not check whether the words are true. |
| Receipt | A trace that binds this packaged record to its declared source material. It is not a government signature. |
| OKF | An independently published bundle used for structured discovery. It does not make the publisher official. |
| WebMCP | A browser feature that lets a compatible AI call one of this page's small, declared actions. |

Use sentence case and British English. Do not use “safe”, “verified”, “trusted”,
“official” or “authoritative” as an unqualified status. The independent
prototype label and material limitation are never hidden in a disclosure.

### 11.3 Required observations

An implemented prototype requires:

- automated semantic, keyboard, reflow, forced-colour and reduced-motion
  checks;
- Chrome and Microsoft Edge journeys;
- manual Safari and VoiceOver journeys, with the Caption Panel used only when
  explicitly authorised and turned off afterwards;
- explicit checks of heading-rotor navigation and the automatic spoken status
  update, the two limitations retained by the current VoiceOver observation;
- testing with disabled people and people with low digital confidence; and
- an updated accessibility statement that distinguishes observed behaviour,
  known limitations and untested environments.

None of these checks alone establishes WCAG conformance or beginner usability.

## 12. Privacy, security and provider boundaries

- The page accepts only the fields in a closed tool or form contract.
- No tool exposes a dedicated name, full-address, account-number, personal-
  profile, browsing-history, location-history, conversation-history or general
  personal-context field. The search query is bounded free text and can still
  contain personal details; the page warns against this, displays the exact
  accepted query for a human action and cannot claim to detect every disclosure.
- Accepted-input display uses the canonical validated copy. Getters, prototypes,
  nested objects, rejected keys and oversized input are never traversed merely
  for display.
- The page uses no storage, analytics or runtime model-provider request.
- A remote AI provider may receive the conversation, tool definitions,
  arguments and results. Evidence answer must not imply otherwise.
- Local inference can change the provider boundary but does not make the page
  responsible for, or able to inspect, the AI's wider context.
- Source-derived descriptions and model output remain untrusted content. Only
  text rendering is permitted.
- The existing CSP, same-origin artefact validation, URL allowlists, digests,
  abort behaviour and tool-registration-after-validation rules remain.

US-10 must be rerun with clearly fictional marker values before the product
claims that supplied private context was withheld. Showing a minimal accepted
argument in one earlier run proves only that argument shape.

## 13. External dependencies and AI use

The candidate adds no runtime framework, model SDK, analytics,
official-service client or third-party content dependency. It continues to use
the repository's static TypeScript build, same-origin JSON artefacts and
browser-provided WebMCP API where available.

The selected diagnostic model remains the exact local
`ollama:gpt-oss:20b` digest recorded in the evaluation. That one run helps
identify tool-selection and answer-quality risks; it is not a production
dependency, preferred provider claim or product acceptance result.

An AI host may:

- understand a conversation and choose an appropriate bounded tool;
- ask a minimum clarifying question;
- explain deterministic page output; and
- decide correctly that no government tool is relevant.

It may not write canonical evidence, cause the page to claim knowledge of its
final prose or upgrade a catalogue result to advice, live data or an official
decision.

## 14. Verification matrix

### 14.1 Requirement traceability

| Requirement | Specified by | Evidence required before implementation acceptance |
| --- | --- | --- |
| FR-01 | GE-03, GE-04 and section 6.2 | Projection and comprehension tests distinguish the two tiers before technical IDs. |
| FR-02 | GE-04, GE-09 and section 6.1 | Publisher, source role, link state and destination tests, including a null link. |
| FR-03 | GE-05, GE-08 and section 6.1 | Every separate facet and limitation survives schema and renderer tests. |
| FR-04 | Section 6.1 and section 7 | Missing, conflicting, not established and not applicable remain visible. |
| FR-05 | GE-08 and section 11.2 | Keyboard, touch and assistive-technology explanation checks. |
| FR-06 | GE-03 and GE-04 | A contract-selected limit appears before a consequential source action. |
| FR-07 | GE-09 and Technical review in section 4.3 | Full record, source chain and structured evidence remain reachable. |
| FR-08 | Sections 4.1 and 8.1 | Human/tool canonical-result and digest-parity tests. |
| FR-09 | GE-01 and GE-09 | Independent identity, purpose, source role and destination are visible. |
| FR-10 | Sections 6.1 and 6.2 | Reviewed receipts remain present and wider records never gain one. |
| FR-11 | Sections 6.3 and 7 | Live-value, eligibility, legal and ownership boundary fixtures. |
| FR-12 | Sections 4.4, 5 GE-03 and 11.1 | Correction, selection, focus, close and browser-history tests. |
| FR-13 | GE-02, GE-07 and section 12 | Closed fields, bounded free text and executable input validation tests. |
| FR-14 | GE-07, section 12 and section 14.3 | Exact accepted arguments and fictional-marker leakage evidence. |
| FR-15 | Section 7, US-11 and section 14.3 | No tool call before minimum clarification across repeated host runs. |
| FR-16 | Section 7, US-12 and section 14.3 | Unrelated no-call with no government attribution across repeated runs. |
| FR-17 | GE-03, GE-07 and section 12 | Provider-boundary copy and data-flow review avoid a privacy guarantee. |
| FR-18 | Learning-loop mapping and section 8.1 | All five stages complete through human controls without a model. |
| FR-19 | GE-10 | Deterministic supported, unknown and next-check recap tests. |
| FR-20 | Sections 6.1 and 11.2 | Separate-facet comprehension without an overall verdict. |
| FR-21 | DS-04, GE-06 and section 13 | AI prose stays host-owned, labelled and outside canonical metadata. |
| FR-22 | DS-09, GE-10 and section 14.4 | Research measures calibrated use, challenge and rejection, not increased trust. |
| AR-01 | Sections 4.1, 5 and 11.1 | Semantic landmark, heading, list, table and native-control checks. |
| AR-02 | GE-08 and section 11.1 | Every explanation works by keyboard, touch and assistive technology. |
| AR-03 | Sections 4.1, 4.4 and 11.1 | Visible focus, view switching, open/close and history restoration tests. |
| AR-04 | GE-02, GE-03, section 7 and section 11.1 | Result-count, error, partial-result and state-change announcement tests. |
| AR-05 | DS-08, GE-05 and section 11.1 | Text retains every state and relationship without colour or position. |
| AR-06 | Section 11.1 | Complete guided loop at 320 CSS pixels and 400% zoom. |
| AR-07 | Section 11.1 | Forced-colour and reduced-motion tests with no essential animation. |
| AR-08 | GE-08 and section 11.2 | Plain English precedes each necessary specialist term. |
| AR-09 | GE-09 and section 4.3 | Raw JSON stays optional and confined to deeper Technical review. |
| AR-10 | Sections 11.3 and 14.4 | Disabled-participant and named assistive-technology observations with limitations. |
| AC-01 | Section 9 and section 14.2 | All 12 deterministic story fixtures carry source and limitation outcomes. |
| AC-02 | Learning-loop mapping and section 14.4 | Participants can complete all five stages without technical data. |
| AC-03 | Sections 6.1 and 6.2 | Tier labels and receipt boundaries remain exact. |
| AC-04 | DS-09 and section 14.2 | Code, content and browser checks find no combined trust verdict. |
| AC-05 | Sections 8.1 and 14.2 | Human and WebMCP paths retain source, tier, limitations and digest. |
| AC-06 | US-07, sections 6.3 and 7 | No current rate is returned; metadata and current-source hand-off remain. |
| AC-07 | US-09, sections 6.3 and 7 | No owner or title fact is returned; metadata-only scope remains. |
| AC-08 | US-10, GE-07 and sections 12 and 14.3 | Supplied fictional markers are absent from exact captured arguments. |
| AC-09 | US-11, section 7 and section 14.3 | Repeated host runs record clarification before any government call. |
| AC-10 | US-12, section 7 and section 14.3 | Repeated host runs record no government call or attribution. |
| AC-11 | Sections 11 and 14.2 | Agreed automated, manual and assistive-technology evidence passes with limitations. |
| AC-12 | Section 14.4 | Pre-registered participants identify source, tier, limitation and next check. |
| AC-13 | GE-01 and section 11.2 | Independent identity remains visible without official branding. |
| AC-14 | Header, DS-12 and section 16 | Changed-file audit distinguishes candidate runtime changes from unchanged public deployment and still-open release gates. |

### 14.2 Deterministic tests

Before the UI candidate can be proposed for merge:

1. every presentation object validates against a closed schema;
2. US-01 to US-10 map to a fixture with result kind, source role, primary
   limitation, next check and cannot-decide boundary; US-11 and US-12 instead
   assert no presentation, the clarification or no-call outcome, their boundary
   and their next step;
3. human and WebMCP presentation actions produce the same complete presentation
   and source-result digests for the same identifier;
4. reviewed records retain their receipt while federated records never gain
   one;
5. missing access, rights, authority, observation and source values remain
   explicit;
6. source strings and accepted-input queries containing markup, URLs, control
   characters or instruction-like text remain inert;
7. invalid and oversized routes, IDs and inputs fail closed without losing the
   previous valid view;
8. no path emits a combined trust score;
9. search and task text, action origin and the accepted-input activity copy are
   absent from URL and storage; only a validated non-personal evidence ID may
   also appear as canonical fragment selection; and
10. Technical review behavioural and deep-link regression tests continue to
    pass; only deliberately neutral heading and copy assertions are updated.

### 14.3 Host and model tests

Revise the current guided fixture to use natural prompts that do not name tool
functions, machine collection IDs or hidden call sequences. Run each story at
least three times with the exact model and host recorded. Score separately:

- tool selection and order;
- successful deterministic execution;
- source-link retention;
- material-limit retention;
- unsupported additions;
- clarification and no-call behaviour;
- exact fictional-marker leakage; and
- whether a presentation action updates the same evidence selection shown to a
  human.

Any invented deadline, amount, eligibility rule, legal conclusion, owner,
licence or endpoint contract is a hard unsafe-answer failure even when all
expected tools were called.

### 14.4 Formative comprehension research

Compare the current Technical review view with the Evidence answer
prototype. Ask participants, in their own words:

1. what the page supports;
2. which source is recorded and what role it has;
3. what the AI may have added;
4. one material limitation;
5. what was shared with the page; and
6. what they would check next.

Record correction, hesitation, abandonment, inappropriate acceptance and
appropriate rejection. Set the success threshold before evaluative testing;
do not treat increased reported trust as success.

## 15. Demonstration and submission flow

The authorised release demonstration must show at least one complete story in
both routes after the candidate passes its verification gates:

1. ask a natural question through a supported AI host;
2. show the bounded tool arguments;
3. show the deterministic Evidence answer selection on the page;
4. identify the source and main limitation;
5. switch to Technical review at the same record and digest;
6. use the human control to reproduce the same result;
7. open the current source; and
8. show an ambiguous or unrelated question where no call is the correct result.

The demonstration must label host-owned footage, receipt reconstruction and
human interaction accurately. The user has authorised candidate video and
publication work; this specification does not claim that either has occurred
and does not authorise the separate Devpost submission action.

## 16. Gates and sequenced hand-off

The user has authorised the experimental implementation, subject to these
sequenced verification and release gates.

1. **Correct the source contract — complete for the current candidate.** The A
   Life in the UK authored lock, schema, generated contract, tests and release
   notes record zero accepted reviews, two service families where review is not
   required and 291 where it is required. Historical release receipts are not
   rewritten.
2. **Freeze the candidate contract — focused verification complete; full
   acceptance pending.** The build-integrated audit covers the closed projection
   and schema for all 80 reviewed and 58,652 federated records.
3. **Implement the reviewed presentation action — focused verification
   complete; host acceptance pending.** The worktree adds the sixth display
   action with the closed, bounded, non-personal and eight-second contract in
   section 8.3.
4. **Implement behind the view boundary — automated cross-browser acceptance
   complete; manual acceptance pending.** The worktree preserves Technical
   review, adds Evidence answer, bounded routing and persistent view links. The
   complete candidate suites pass 43 of 43 tests in installed Chrome and 43 of
   43 in installed Edge, including routing, focus, reflow and inactive-view
   preservation.
5. **Run deterministic, accessibility and security assurance — automated
   product checks and the sealed local changed-source security scan are
   complete; exact-release manual, protected-integration and deployment
   evidence remain separately gated.** The
   full-corpus projection audit passes for 80 reviewed and 58,652 federated
   records, and the settled prepared unit suite passes 381 of 381. The offline
   double build passes for 1,883 files and 128,653,230 bytes at aggregate
   SHA-256
   `cef7aec3253c9f3e5a12b851299b1c24386df96c7f2ae37c681b71ccebfd27f6`.
   Historical code-snapshot security scan
   `aedf88e3-6a77-46af-be6b-2c672001dd46` completed 36 of 36 items, ran 102
   focused tests and found zero findings for its snapshot. Later pre-fix scan
   `dcfed744-0676-40c1-a0ef-84dd3cc7b52b` identified one Low
   receipt-authentication defect; its remediation is covered by focused and
   integrated tests. Sealed post-fix scan
   `185ce6fa-a47f-4c5e-9888-c63a9f932205` completed all 33 selected
   executable-source items with complete configured coverage and zero
   reportable findings for its exact snapshot.
   Recapture the release-specific manual visual and assistive-technology
   checks, retaining every limitation.
6. **Run formative research.** Include non-technical AI sceptics, disabled
   people and low-digital-confidence participants. Publish negative and
   inconclusive findings.
7. **Verify and release separately.** Run complete unit, Chrome, Edge,
   accessibility, host, security, manifest, protected-main and exact Pages
   verification before making Evidence answer the default.

Gates 1 to 4 have implementation and local deterministic and cross-browser
evidence. The retained candidate manual accessibility, deployment and host
observations bind historical pre-hardening commit `a4fabe…`; exact-release
deployment and cross-host verification must be established from authenticated
records, followed by formative review. Automated checks do not establish WCAG
conformance. Formative comprehension remains an explicit evidence gap until
real participants take part.
