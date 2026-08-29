# Trusted GOV.UK Knowledge Discovery

## Decision-grade Deep Research and competition prototype plan

**Research date:** 29 August 2026  
**Evidence checkpoint:** 11:42 BST (10:42 UTC)  
**Controlling competition deadline:** 3 September 2026, 13:00 PDT = 20:00 UTC = **21:00 BST**  
**Provisional product:** *Trusted GOV.UK Knowledge Discovery*  
**Status:** **Technical GO; entry-governance HOLD**

> This report is a research and delivery plan, not legal advice, employer approval, security accreditation, an accessibility conformance claim, or permission to use third-party intellectual property.

### How to read the evidence

Material factual claims carry source identifiers such as **[R01]**, **[W01]** and **[GH03]**. Section 22 and the accompanying `source-register.csv` give the title, publisher, exact URL, date, reuse status, confidence and limitation for each source. “Confirmed”, “interpretation” and “recommendation” are deliberately separated.

The research inspected the live Devpost Official Rules, current OpenAI and Chrome WebMCP guidance, the current WebMCP Community Group draft, official GOV.UK and data-catalogue sources, UK licensing and propriety guidance, and commit-bound GitHub evidence. Complete Devpost rules were analysed but are not reproduced. Four short controlling phrases are quoted below within copyright limits.


# 1. Executive decision

## Decision

**Proceed immediately with the technical build, but do not submit personally until the ownership, outside-interest, prize and publicity gates are documented.**

The technically strongest route is **not** a new greenfield system. It is a narrow, static competition application derived from the WebMCP candidate added to `gis-ai-go` on 29 August 2026, using a reviewed subset of the pre-existing `okf-govuk-content` and `okf-uk-government-apis` assets. The existing candidate already demonstrates two bounded, page-scoped, read-only WebMCP tools over checksum-validated OKF data, a complete manual equivalent, no page-side storage or credentials, runtime validation beyond JSON Schema, and explicit boundaries between page tools and the persistent MCP gateway. [GH03–GH06]

The competition rules permit pre-existing projects only where they are **“meaningfully extended using WebMCP”** after the submission period begins and the new work is evidenced. The current WebMCP commit falls within the period; the pre-start baseline does not. [R01; GH02; GH03] The extension is technically substantial, but only the judges can decide whether it meets their qualitative threshold.

The principal unresolved issue is not WebMCP. It is the rule that the submission be **“solely owned by the Entrant”**, combined with UK guidance that employee-created copyright made in the course of employment normally belongs first to the employer unless an agreement says otherwise. [R01; IP01] Public-sector employment is not itself an exclusion in the rules, but employer rights, outside interests, prize acceptance, use of work resources and apparent endorsement can each become a blocker.

## Recommended entry route

1. **Preferred, after written clearance:** enter personally with a clean ownership schedule showing which code is personally owned, which components are third-party open source, which records are OGL or otherwise licensed, and which pre-existing assets are reused.
2. **Where an employer or collaborators own material:** enter through an expressly authorised team or organisation, with a named representative and written authority, or remove and independently replace the affected material. [R01]
3. **Do not submit** if ownership cannot be evidenced, if required outside-interest/prize/publicity approval is refused or remains ambiguous, if the live WebMCP URL cannot be tested from a signed-out judging context, or if the repository licence is not visible and detectable.

## Minimum competition product

A static, independent, read-only page that:

- loads a same-origin, checksum-bound corpus of approximately 30–80 reviewed GOV.UK content, dataset and API records;
- gives people accessible search, result and evidence views;
- registers three WebMCP tools: `search_government_knowledge`, `get_resource_record` and `show_provenance`;
- returns match reasons, source-derived fields, assertion status, access status, licence status, observation dates, authoritative human URLs, digests and limitations;
- never claims that catalogue inclusion grants API access;
- performs no live provider query, accepts no credentials and stores no user query;
- uses an independent visual identity and disclaimer; and
- is deployed at an immutable candidate URL before the final submission day.

## Hard blockers

| Gate | Required evidence | Current assessment |
|---|---|---|
| Entrant ownership | Signed ownership/rights schedule and relevant employer or collaborator permissions | **Unresolved — potential blocker** |
| Outside interest and conflict | Recorded WCC and, where applicable, DSIT/BDUK declaration or approval | **Unresolved — employer approval required** |
| Prize and publicity | Written route for accepting cash, credits, accounts, equipment and publicity | **Unresolved — employer approval required** |
| Competition registration | Devpost registration under the chosen entrant route | **Not verified** |
| Live WebMCP deployment | Public URL serving the post-start tool-enabled build | **Not yet evidenced** |
| Host compatibility | Recorded tests in ChatGPT desktop built-in browser and Chrome 149+ | **Not yet evidenced** |
| Rights-cleared corpus | Per-record source/licence/access review and attribution | **Partly available; subset review required** |
| Submission artefacts | Public repository, visible licence, public <3-minute YouTube video, description | **Planned, not complete** |

## Overall decision state

**Technical readiness:** amber-green.  
**Competition compliance:** amber.  
**Ownership/conflict risk:** red until documented.  
**Recommended action:** continue the build on a clean competition evidence path while obtaining written decisions in parallel; set a governance no-go gate no later than 2 September 2026.


# 2. Recommended prototype in one page

## Proposition

People commonly find plausible government links without being able to tell which page is authoritative, whether an API is actually accessible, when the metadata was last checked, or which parts of an answer are copied, normalised or inferred. The prototype turns discovery into a shared inspection task: a person and an agent use the same page, the same bounded tools and the same evidence-bearing record.

## Primary journey

1. A person opens the independent prototype and asks, for example, “What official APIs or datasets could help me understand flood risk?”
2. The human interface offers the same search directly.
3. A compatible agent discovers `search_government_knowledge` rather than guessing selectors or scraping rendered cards.
4. The tool searches only the validated local bundle and returns ranked candidate records with deterministic match reasons.
5. The page and tool result show publisher, resource type, confirmed or unestablished access, confirmed or missing licence, last observation, assertion labels, limitations and authoritative human links.
6. `get_resource_record` returns an exact record; `show_provenance` exposes the source and digest chain.
7. The person opens the publisher page and verifies the substantive claim.
8. Any narrative from an AI is visibly secondary and cannot overwrite the record.

## Scope

**In scope:** discovery metadata for GOV.UK pages, API Catalogue records and selected data.gov.uk records; static deterministic search; evidence inspection; authoritative outbound links; read-only WebMCP.

**Out of scope:** live transactions, personalisation, authentication, API keys, claims to exhaustive coverage, real-time API execution, advice based on personal data, official service status, and production service commitments.

## Corpus

Use a deliberately small corpus that includes:

- GOV.UK Content API and Search API;
- API Catalogue overview and a selection of open, authenticated, restricted and access-uncertain APIs;
- data.gov.uk/National Data Library catalogue examples;
- related authoritative GOV.UK guidance pages; and
- deliberately incomplete records for failure-path demonstration.

The full 41,598-record API bundle is evidence of reuse potential, not an MVP payload. A 30–80 record corpus is large enough to demonstrate ambiguity, relationships and access distinctions while remaining reviewable before the deadline. [GH08; GH09]

## Tool decision

| Candidate | Decision | Reason |
|---|---|---|
| `search_government_knowledge` | **Must** | Core natural-language-to-structured-discovery action |
| `get_resource_record` | **Must** | Exact record inspection and stable human-agent parity |
| `show_provenance` | **Must** | Makes evidence and digest boundaries directly inspectable |
| `explain_match` | Fold into search output | A separate call adds little value; search should return deterministic reasons |
| `list_related_resources` | Could | Relationships can first appear within the exact record |
| `compare_resources` | Should, only if core gates pass | Useful but adds schema, UI and evaluation surface |

## Architecture

A static, same-origin application is recommended. It packages a deterministic OKF-derived bundle, validates it before registering tools, and uses the same functions for manual and WebMCP interactions. This avoids CORS, availability, rate-limit and credential risks while retaining material WebMCP value. The person-agent collaboration and explicit tool surface—not live network access—is the non-trivial WebMCP contribution. [W01–W04; GH04; GH05]

## Trust claim

The prototype must not say “WebMCP makes government information trustworthy”. The defensible claim is:

> Warranted trust can improve when authoritative sourcing, visible provenance, constrained tools, evidence-preserving transformations, accessible human inspection and explicit limitations are implemented together.

## Public boundary statement

> Trusted GOV.UK Knowledge Discovery is an independent experimental prototype. It is not a GOV.UK or UK Government service and is not endorsed by any public body. Catalogue records help discovery; they do not grant access or prove that an API is available. Follow the linked publisher page for authoritative information.


# 3. Competition deadline and controlling rules

## 3.1 Controlling deadline

**Confirmed by the live Official Rules:** registration and submission end on **“September 3rd, 2026 (1:00 pm Pacific Time)”**. [R01]

Time-zone conversion, using IANA zones and the offsets in force on 3 September 2026:

```text
13:00 America/Los_Angeles (PDT, UTC−07:00)
+ 7 hours
= 20:00 UTC
+ 1 hour
= 21:00 Europe/London (BST, UTC+01:00)
```

The operational deadline is therefore **Thursday 3 September 2026 at 21:00 BST**. Submit at least several hours earlier; the plan sets an internal target of 15:00 BST.

The submission period began at 11:00 Pacific on 25 August 2026, which converts to 18:00 UTC and 19:00 BST. The `gis-ai-go` baseline commit at 16:47:33 UTC predates that point; the WebMCP candidate commit at 10:00 UTC on 29 August is inside the period. [R01; GH02; GH03]

## 3.2 Source capture

The rules were re-accessed from the live Devpost rules URL on 29 August 2026 during the research session ending at 11:42 BST. The companion evidence file contains a normalised, non-substitutive research capture and SHA-256 digest. It is **not** represented as a hash of Devpost’s full HTTP response. This limitation matters: a local digest can demonstrate that the retained research record has not changed, but it cannot prove what the live page contained independently of the quoted URL and access record.

## 3.3 Source discrepancies

| Source | Statement | Conflict | Treatment |
|---|---|---|---|
| Live Devpost Official Rules [R01] | Opening 25 August at 11:00 PT; deadline 3 September at 13:00 PT | None within controlling source | **Controls** |
| OpenAI challenge page [R02] | Opening shown as 12:00 PT; deadline shown as 13:00 PT | Opening is one hour later than R01 | Record discrepancy; use R01 |
| OpenAI Developer Community announcement [R03] | Deadline shown as 4 September 00:00 UTC | Four hours later than R01’s 20:00 UTC | Record discrepancy; do not rely on it |
| Cached snippets, third-party summaries or AI output | May vary | Potentially stale or wrong | Never controlling |

The rules themselves state that official rules and the hackathon website prevail over the optional Devpost AI helper, and that entrants remain responsible for verification. [R01]

## 3.4 Clause-level compliance matrix

Status vocabulary:

- **Confirmed by the rules**
- **Likely but requires verification**
- **Requires employer or legal approval**
- **Potential blocker**
- **No evidence found**

| # | Clause/topic | Evidence-based position | Status | Required action |
|---:|---|---|---|---|
| 1 | Registration and submission dates | 25 Aug 2026 11:00 PT to 3 Sep 2026 13:00 PT. [R01] | Confirmed by the rules | Register and submit before 21:00 BST; internal target 15:00 BST |
| 2 | Age and country eligibility | Entrant must be of majority age and resident in an API-supported country. [R01; R04] | Confirmed by the rules | Preserve evidence that UK is listed at submission |
| 3 | UK-resident individual | UK appears on the current supported-country list. [R04] | Confirmed by the rules | Verify again on 3 Sep |
| 4 | Individual, team and organisation routes | All three routes are permitted subject to eligibility. [R01] | Confirmed by the rules | Choose route only after ownership analysis |
| 5 | Representative authorisation | Team/organisation must appoint and authorise a representative. [R01] | Confirmed by the rules | Retain written authority |
| 6 | Promotion entities, judges and conflicts | Defined people/entities and real or apparent conflicts may be excluded or disqualified. [R01] | Confirmed by the rules | Declare any relevant relationship; no current evidence of a sponsor relationship |
| 7 | Public-sector employees and employer-owned work | No public-sector employee exclusion appears; ownership and conflict clauses still apply. [R01; IP01] | Requires employer or legal approval | Obtain WCC and secondment-host review |
| 8 | IP ownership | Submission must be original and solely owned; third-party rights must be licensed. [R01] | Potential blocker | Produce a rights schedule; remove or authorise employer-owned work |
| 9 | Public repository and open-source requirement | Public GitHub/GitLab/Bitbucket repository and visible detectable open-source licence required. [R01] | Confirmed by the rules | Use a standard top-level MIT licence and verify GitHub detection |
| 10 | Acceptable open-source licences | Rules require an open-source licence but do not list an approved set. [R01] | No evidence found | Use MIT for new code; do not rely on a custom split notice as the top-level licence |
| 11 | Third-party SDK/API/data/content rights | Entrant must be authorised under applicable terms. [R01] | Confirmed by the rules | Maintain per-component and per-record attribution |
| 12 | Crown copyright/OGL | OGL permits broad reuse with attribution but excludes logos, personal data, unpublished information and third-party rights. [G14] | Confirmed by source licence | Use OGL attribution and inspect exceptions |
| 13 | GOV.UK name/logo/trade marks | Non-GOV.UK service must not use Crown/logotype, GDS Transport, GOV.UK colours or imply official status. [G12; G13] | Confirmed by official guidance | Independent identity; textual source references only |
| 14 | Warranties made on submission | Entrant warrants rights, absence of infringement and absence of malicious code. [R01] | Confirmed by the rules | Rights review, malware/secret scan, signed checklist |
| 15 | Publicity permissions | Sponsor/administrator may use contributor identity and likeness for promotion. [R01] | Requires employer or legal approval | Confirm personal and employer communications position |
| 16 | Sponsor use of entry | Entrant keeps IP; sponsor receives a non-exclusive judging licence and publicity rights. [R01] | Confirmed by the rules | Confirm entrant has power to grant those rights |
| 17 | Judging/disqualification | Sponsor controls eligibility/methodology; conflicts, rule breaches and non-viability can disqualify. [R01] | Confirmed by the rules | Make boundaries and compliance evidence easy to inspect |
| 18 | Prizes, tax and acceptance | Winners bear fees/taxes; forms may be required; prizes go to entrant/representative/organisation. [R01] | Confirmed by the rules | Obtain prize-acceptance route and tax advice if selected |
| 19 | Employer gifts/outside interests | Rules do not resolve employer policy; Civil Service frameworks require declaration/management of conflicts and benefits. [C01–C04] | Requires employer or legal approval | Written declarations and prize/publicity decision |
| 20 | Export controls/sanctions/territories | Rules exclude unsupported or sanctioned places and local-law prohibitions. [R01] | Confirmed by the rules | UK currently appears eligible; avoid restricted collaborators/assets |
| 21 | Privacy and personal data | Devpost/OpenAI process account and entry data; entrant must avoid privacy-right infringement. [R01] | Confirmed by the rules | Use only necessary account data; publish no official/personal data |
| 22 | Platform accounts | Devpost registration, repository and YouTube are required in practice; hosting and OpenAI/Chrome access are needed for testing. [R01] | Confirmed by the rules | Verify account ownership and public visibility |
| 23 | Live deployment/credentials | A working live URL must remain free and accessible through judging; private sites need credentials. [R01] | Confirmed by the rules | Prefer public no-auth static site; monitor through 21 Sep |
| 24 | Repository, video and description | Full runnable source, visible licence, English description and public YouTube demo under 3 minutes are required. [R01] | Confirmed by the rules | Complete evidence by 2 Sep |
| 25 | Copyrighted media/logos/trade marks | Video cannot contain unlicensed trade marks, music or material. [R01] | Confirmed by the rules | Record only own UI; no music; avoid third-party logos |
| 26 | Pre-existing projects | Permitted only with a material post-start WebMCP extension and clear dated separation. [R01] | Confirmed by the rules | Baseline tag, compare report, challenge changelog |
| 27 | Meaning of meaningful extension | No quantitative threshold; judges assess non-trivial WebMCP leverage and only new work. [R01] | Likely but requires verification | Show three working tools, manual parity, tests and before/after demo |
| 28 | Work-creation period | New work must be within submission period; pre-existing work is context, not judged work. [R01] | Confirmed by the rules | Keep post-start commit set clean and described |
| 29 | Prior commits/data/schemas/UI in repo | Rules do not forbid them, but require distinction and licence compliance. [R01] | Likely but requires verification | Retain baseline evidence; mark imported pre-existing assets |
| 30 | Rule preventing Chris from entering personally | No automatic rule found; sole ownership, employer rights and conflict/publicity/prize obligations could prevent a personal entry. [R01; IP01; C01] | Potential blocker | Do not submit personally until written clearance or clean-room replacement |

## 3.5 Judging implications

The four equally weighted criteria are WebMCP leverage, execution, potential impact, and creativity/ambition. [R01] The entry should therefore spend evidence budget evenly:

- **WebMCP leverage:** explicit bounded tools, shared page state, tool-specific evaluation and visible manual equivalence;
- **execution:** live immutable build, coherent UI, keyboard/screen-reader support, deterministic data and failure behaviour;
- **potential impact:** concrete discovery and verification problem, not a general “AI for government” claim;
- **creativity:** a shared evidence plane for people and agents, with assertion status and receipts rather than answer-only interaction.

The required video must be **“less than three (3) minutes”**. [R01] The proposed storyboard is 2 minutes 45 seconds.


# 4. Eligibility and conflict assessment

## 4.1 Eligibility fact pattern

**Confirmed:** a UK-resident adult can enter in principle because the rules admit individuals from supported API countries and the current OpenAI list includes the United Kingdom. [R01; R04]

**Confirmed:** teams and organisations may enter, but their representative warrants authorisation. [R01]

**No evidence found:** the rules contain no categorical exclusion for local-government employees, civil servants, secondees, or people using publicly licensed government information.

**Potential blocker:** public employment does not settle who owns the relevant code, schemas, documentation or research. UK IPO guidance says that copyright made by an employee in the course of employment normally belongs first to the employer unless an agreement provides otherwise. Crown work can engage additional rules. [IP01]

**Requires internal decision:** Civil Service outside-interest guidance requires actual, potential and perceived conflicts to be declared and managed, including work overlapping official knowledge or responsibilities. [C01; C02] The public web search did not locate a current WCC employee policy governing outside competitions, prizes, IP or external publicity. That absence must not be treated as permission. [C05]

## 4.2 Assessment of the specified conflicts

| Ref | Scenario | Assessment | Classification | Evidence or action |
|---|---|---|---|---|
| A | Employment in local and/or central-government contexts | Employment is not an automatic Devpost exclusion. It raises ownership, outside-interest and perceived endorsement questions. | Requires employer approval | WCC employing manager/HR/legal; DSIT/BDUK host manager/propriety where relevant |
| B | Work produced during employment or using employer resources | Could be employer-owned even if published in a personal repository. Repository ownership and an MIT file do not prove the entrant had authority to license it. | Potential blocker | Establish creator, time, device/account, assigned duties, funding and contract terms for each material asset |
| C | Material derived from public-sector research or collaborations | Publicly available facts may be reusable; expression, unpublished material, joint work and collaborator contributions need separate rights analysis. | Requires legal/owner verification | Contribution and source schedule; collaborator consents where needed |
| D | Cash or in-kind prize | Rules award cash, credits, subscriptions, gear and publicity. Employer gifts/outside-interest procedures may apply. | Requires employer approval | Pre-clear acceptance, allocation, tax and declaration route |
| E | Publicity misunderstood as endorsement | Named employment or familiar government visual language could imply endorsement. | High reputational risk | Independent branding, personal-capacity wording, no employer logos, pre-cleared biography |
| F | Competition rights Chris cannot personally grant | Sole-ownership warranty and sponsor judging/publicity licences require legal capacity. | Potential blocker | Do not include any component without a documented licence or ownership basis |
| G | Existing work predates competition | Permitted if clearly separated and materially extended after the start. | Manageable | Baseline `fe122…`; post-start `8c4…`; challenge-specific diff and release |
| H | GOV.UK styling/logos/content | OGL does not license official logos and forbids implied endorsement; official guidance limits brand use off GOV.UK. | Manageable if unbranded | Own visual identity; OGL attribution; source links |
| I | Restricted API catalogue entries | API Catalogue says inclusion does not imply public access. [G06] | Core product risk | Access states include `access-not-established`; never emit credentials or authority claims |
| J | ChatGPT/Codex/hosting exposes restricted information | Static public data avoids most risk; build logs, prompts, source files and git history can still leak secrets or unpublished context. | High information-assurance risk | Clean-room repository, secret scan, no official credentials/data, history review |

## 4.3 Entry-route decision

### Enter personally

Appropriate only where all of the following are evidenced:

- Chris personally owns all original competition work or holds written authority broad enough for the entry terms;
- pre-existing code and data are used under compatible licences;
- no employer or collaborator retains rights inconsistent with “solely owned”;
- outside-interest, prize and publicity decisions are recorded;
- official roles are described only where approved and without endorsement.

### Enter as an expressly authorised team

Appropriate where several individual contributors own the work jointly and can authorise a representative. The team must define ownership, prize allocation, publicity consent and licence authority in writing before submission. [R01]

### Enter through an authorised organisation

Appropriate where WCC, DSIT, BDUK or another legal entity owns material and is willing to be the entrant. This route requires organisational authority; it must not be inferred from employment or a manager’s informal encouragement. [R01]

### Do not enter until blockers are resolved

This is the current recommendation for the **personal submission decision**, even while technical work continues. The deadline compresses risk: an ambiguous ownership position cannot be repaired by adding a disclaimer after submission because the entrant makes warranties when entering. [R01]

## 4.4 Residual legal position

This report does not determine whether particular commits were made “in the course of employment”; that depends on contract terms, duties, instructions, resources, context and facts not available in public sources. [IP01] A public MIT licence can evidence intended downstream permission but may be ineffective if the licensor did not own the rights. Obtain case-specific employer/legal confirmation.


# 5. Unresolved permissions and blockers

## 5.1 Exact approvals or declarations to obtain

### Warwickshire County Council, as employer

Request a written decision covering:

1. whether the named repositories, competition branch and post-25-August work are personally owned, employer-owned, jointly owned or licensed to Chris;
2. whether entering is an outside interest, external activity or conflict requiring declaration;
3. whether working on the entry outside contracted hours with personal equipment is sufficient, or whether subject-matter overlap still requires approval;
4. whether cash, cloud credits, subscriptions, equipment and publicity may be accepted, retained or must be declined/transferred;
5. whether Chris may identify his employment in the biography and, if so, the required personal-capacity wording;
6. whether any WCC research, data, code, presentation, image, internal link, name or logo may be used;
7. whether WCC communications or legal review is required before public video/submission.

### DSIT/BDUK secondment host

Request a recorded decision covering:

1. outside-interest/conflict declaration;
2. overlap with official AI research, data-discovery, standards or agent-governance duties;
3. use of DSIT/BDUK names, role descriptions, research, contacts or non-public knowledge;
4. prize, publicity and social-media position;
5. confirmation that no official endorsement should be inferred;
6. whether any Crown copyright or departmental IP is involved.

Civil Service guidance supports declaration of actual, potential and perceived conflicts and cautions against misuse of official status or information. [C01] DSIT’s published governance evidence indicates an outside-interest framework exists, but the individual decision is not public. [C02]

### Collaborators and third parties

For every non-trivial contribution, record:

- creator/legal owner;
- contribution or source;
- licence and version;
- whether modification and redistribution are permitted;
- attribution text;
- whether publicity/video display is allowed;
- whether any data is confidential, personal, restricted or unpublished.

### Competition administrator

Send a concise written clarification request if ownership remains uncertain:

> The project uses disclosed, permissively licensed pre-existing open-source code and public OGL metadata, with a substantial post-start WebMCP extension. Does the “solely owned” condition permit this where all third-party components are fully licensed and separately identified?

The rules expressly allow open-source components subject to licence compliance, creating tension with the literal sole-ownership language. [R01] A written administrator answer is the safest way to resolve that ambiguity; no answer should be invented.

## 5.2 Blocker register

| Blocker | Owner | Evidence required | Latest safe decision |
|---|---|---|---|
| Entrant route | Chris + employer/legal | Written personal/team/organisation route | 31 Aug, 18:00 BST |
| Code/IP ownership | Chris + rights owners | Component schedule and permissions | 1 Sep, 12:00 BST |
| Prize/publicity | Employer/propriety | Written accept/decline/declare route | 1 Sep, 12:00 BST |
| Corpus rights | Build lead | Record-level licence review, attribution and exclusions | 31 Aug, build freeze |
| Live deployment | Technical lead | Exact-commit URL and signed-out test | 1 Sep, 18:00 BST |
| ChatGPT/Chrome support | Test lead | Screen recording/log of tool discovery and calls | 1 Sep, 21:00 BST |
| Public repository licence | Repository owner | GitHub detects MIT at top level | 2 Sep, 12:00 BST |
| YouTube rights | Submission lead | Own audio/UI; no unlicensed marks/music | 2 Sep, 20:00 BST |
| Submission receipt | Representative | Devpost confirmation and final hashes | 3 Sep, 15:00 BST target |

## 5.3 Clean-room fallback

If employer ownership cannot be resolved quickly, create a new competition repository using:

- newly written post-start TypeScript and CSS on personal equipment;
- the three tool contracts supplied in this pack, reviewed for independent expression;
- only data records whose OGL or other licence is explicit;
- no copied internal research, prompts, slides or text;
- no government visual identity;
- a provenance manifest identifying every third-party source.

This does not automatically solve subject-matter or conflict issues, but it narrows the ownership question.


# 6. Existing-asset and licence audit

## 6.1 Core asset register

| Repository/path | Purpose and current evidence | Latest inspected commit / period | Licence/rights | Reuse decision | Work needed |
|---|---|---|---|---|---|
| `gis-ai-go` | Governed geospatial catalogue, MCP gateway, releases, receipts, threat/evaluation assets and public Explorer. [GH01; GH07] | Baseline `fe122…` before start; candidate `8c4…` after start | MIT code; source-specific data; entrant ownership unresolved | **Use as technical base only after rights gate** | Competition branch/repo, GOV.UK corpus, deployment, host tests |
| `apps/webmcp-explorer` | Static candidate with two bounded WebMCP tools, manual parity, runtime validation, no storage/credentials/external runtime request. [GH04; GH05] | Added 29 Aug within period | Repository MIT, subject to ownership | **High-value post-start asset** | Rename/profile tools; authoritative human links; publish |
| `apps/webmcp-explorer/src/webmcp-adapter.ts` | Feature detection and imperative tool registration. [GH06] | Post-start | MIT, subject to ownership | Reuse or clean-room adapt | Three GOV.UK tools; current draft contract; output validation |
| `docs/implementation/WEBMCP_EXPLORER_CANDIDATE.md` | Boundary, architecture, tests, limitations and manual fallback. [GH05] | Post-start | MIT/docs, subject to ownership | Reuse as evidence | Competition-specific appendix and before/after comparison |
| `okf-govuk-content` | 69-record checksummed GOV.UK demonstrator; allowlisted Content API metadata; five read-only MCP tools; explicit non-authoritative and rights boundaries. [GH08] | `94f502…`, 18 Aug, pre-start | MIT code/docs; OGL where applicable; exceptions | **Best GOV.UK baseline corpus** | Review 30–69 records; convert to profile; retain notices |
| `okf-uk-government-apis` | 41,598 API records with source/access/confidence/provenance fields and sharded JSON-LD/YAML-LD. [GH09] | `55c7e…`, 18 Aug, pre-start | MIT code/docs; generated-record rights vary; custom split notice | **Use reviewed subset only** | Select 15–30 records; record-level rights/access review |
| `okf-explorer` | Deterministic static search/facets/graph, external bundle contracts, tests and hosted examples. [GH10] | `c8af0…`, 18 Aug, pre-start | MIT code; CC BY-NC 4.0 content/docs | Reuse MIT code selectively | Avoid mixed-license docs/content unless attributed and compatible |
| `okf-ons` | Mature publication lifecycle, static explorer, checksums and metadata-only separation. [GH11] | `b0283…`, 18 Aug, pre-start | MIT code; source rights vary | Pattern exemplar, not corpus | Borrow tests/manifest concepts only |
| `okf-planning` | Provenance-rich domain bundle with JSON/YAML-LD, DCAT/PROV/SKOS and rule-derived relations. [GH12] | Pre-start | MIT code; record-specific rights | Pattern exemplar | No MVP import |
| `okf-els-api` | Demonstrates unverified and access-not-checked API metadata from a non-public source. [GH13] | Pre-start | MIT code; source uncertain/private | **Do not import records** | Use only the pattern for `access-not-established` |
| `okf-LandRegistry` | Extensive evidence/release/governance pattern with independent/non-endorsed status. [GH14] | Pre-start | Mixed/source-specific | Design evidence only | No deadline import |
| OKF specification | Core OKF model pinned in the estate. [GH15] | Pre-start external standard | Apache-2.0 repository; inspect file notices | Use as normative baseline | Label JSON-LD/DCAT/PROV/receipt fields as profile extensions |

## 6.2 Relevant wider `okf-*` estate

The account also contains domain repositories such as `okf-uk-legislation`, `okf-uk-living`, `okf-ai-infrastructure` and `okf-heritage-coventry-warwickshire`. They are not materially necessary to the narrow GOV.UK/API prototype and were not path-level rights-audited in this research. They must not be imported merely because their names begin with `okf-`. The competition corpus should be justified record by record, not accumulated by repository count.

## 6.3 Important technical findings

### Existing WebMCP extension

The candidate README states that the page translates a person’s question into two bounded page-tool calls over the same generated OKF catalogue, validates the catalogue before registration, marks results read-only and untrusted, and uses no model key, provider credential, storage, analytics or external runtime request. [GH04] The implementation note adds fail-closed registration, same-function manual parity, deterministic catalogue search and explicit page-versus-gateway boundaries. [GH05]

This is credible post-start evidence. It is also deliberately **not** a deployed competition entry: the current supported Pages artefact remains the pre-existing Explorer, and current documentation does not claim Chrome 149+ or ChatGPT host validation. [GH04; GH05; GH07]

### GOV.UK content bundle

`okf-govuk-content` is the closest source-aligned corpus because it packages only a small allowlisted demonstrator, separates generation/retrieval timestamps, exposes checksums and rights audits, and distinguishes metadata from authority. [GH08] Its 69 records are an appropriate upper bound for manual review.

### API bundle

`okf-uk-government-apis` proves that a public API OKF bundle already exists and is reusable in principle. [GH09] Its scale is a liability for a five-day competition build: the full bundle would increase loading, licensing, stale-data and evaluation risk. Import only records that demonstrate the needed access conditions and relationships.

### Explorer code

`okf-explorer` provides reusable deterministic UI patterns, but its mixed licensing must be respected: code is MIT while some content/docs are CC BY-NC 4.0. [GH10] Copying the whole repository into a commercial-prize submission would create avoidable ambiguity. Reuse identified MIT files or reimplement the small UI.

## 6.4 Pre/post-start evidence strategy

1. Tag or record the baseline commit `fe122579dc3aba07387c0c201ce5539b50a40108`.
2. Record the challenge start as 25 August 2026 18:00 UTC.
3. Preserve the post-start commit `8c4c3e0df7b19926507b541fc11077d2912b94ee`.
4. Create `CHALLENGE_BASELINE.md` listing all imported pre-existing repositories, SHAs, paths and licences.
5. Create `CHALLENGE_CHANGELOG.md` containing only post-start work.
6. Generate a machine-readable `challenge-provenance.json`.
7. Produce a compare report from baseline to competition tag, grouping changes into WebMCP tools, UI parity, corpus/profile, security/accessibility, deployment and evidence.
8. Tag the submission `webmcp-challenge-2026-submission`.
9. Publish checksums for source tree, built site, corpus, schemas, video transcript and submission text.
10. Demonstrate the **new** behaviour explicitly: baseline page has no competition tool surface; submission page exposes and executes the three governed tools.

A new repository may make judging clearer, but it must retain original upstream SHAs and not falsely imply that imported pre-existing assets were created during the challenge.


# 7. User need and trust hypothesis

## 7.1 Primary problem

The problem is not “users need an AI answer”. It is that people and agents struggle to identify authoritative government resources and to inspect the evidence behind a discovery claim.

Priority user questions are:

- What official material exists about this topic?
- Is this a page, dataset, API, catalogue description or guidance?
- Which body publishes or stewards it?
- Is access public, authenticated, restricted or not established?
- Which licence is confirmed, and what is missing?
- What human-readable publisher page should I open?
- When was this metadata observed?
- Which fields are source assertions, normalised values, inferred relationships or model-derived suggestions?
- What evidence and limitations accompany the record?
- What should the system refuse to claim?

## 7.2 Trust hypothesis

> People will place greater **warranted** trust in AI-assisted government knowledge discovery when the AI exposes the same structured evidence, provenance, limitations and authoritative links that a human can inspect directly.

WebMCP is an enabling interaction mechanism, not the trust source. The current draft defines tool metadata and annotations but acknowledges that implementations cannot verify that tool behaviour matches its description and that over-parameterised tools can leak personal context. [W01] Trust therefore depends on constrained implementation, visible evidence and human verification.

## 7.3 Measurable tests

| Measure | Method | MVP pass criterion |
|---|---|---|
| Source-link visibility | Observe first result and exact record | Authoritative human URL visible without expanding raw JSON |
| Human verification success | Give participant a factual claim to check | ≥80% open the intended source and locate supporting/contradicting evidence within 2 minutes |
| Provenance comprehension | Ask what the digest proves | ≥70% distinguish integrity of capture from truth/official endorsement |
| Assertion-status comprehension | Ask which field is inferred | ≥80% identify at least one source-derived and one inferred field |
| Access-boundary comprehension | Use restricted/uncertain API record | 100% do not interpret listing as access permission |
| Refusal/limitation quality | Missing licence/provenance/no match cases | No invented licence, access state, source or result |
| Stale metadata handling | Present old observation date | Date and staleness warning shown in UI and tool output |
| Accessibility | Keyboard, screen reader, zoom, narrow viewport | All core journeys operable; no agent-only capability |
| Human/tool consistency | Compare UI and tool JSON | Same record IDs, assertions, links and limitations |
| Prompt-injection resistance | Embed instruction-like metadata | Returned as quoted/untrusted data; never executed or promoted to tool metadata |

Do not use a generic “Did you trust it?” score as the principal measure. Collect task evidence, error types and explanation quality.


# 8. Proposed WebMCP experience

## 8.1 Human-agent shared page

The page contains four visible regions:

1. **Independent-prototype banner** — status, corpus date, disclaimer and accessibility link.
2. **Search** — query and bounded filters; keyboard-operable and submitted through the same function as the WebMCP tool.
3. **Results** — ranked cards with source, access, licence, assertion labels, limitations and authoritative links.
4. **Record/evidence drawer or page** — complete record, source chain, digest verification and raw JSON.

WebMCP registration is progressive enhancement. Where unavailable, the page says so and the complete manual journey remains usable. OpenAI’s current Site Tools documentation says tools are available only while the page remains open, depend on the selected account/model and are currently discovered in the ChatGPT desktop built-in browser rather than through Chrome’s ChatGPT surface. [W04] The competition rules separately permit judges to test through that built-in browser or Chrome 149+ with WebMCP enabled. [R01]

## 8.2 Recommended tool set

### Tool 1 — `search_government_knowledge`

**Title:** Search government knowledge  
**Description:** Search the page’s validated metadata bundle for GOV.UK content, public-sector datasets and APIs; return source-derived metadata, deterministic match reasons, authoritative human links and limitations. Do not contact providers or infer access.

**Input:** query, optional resource types, publishers, access statuses and limit. Query maximum 160 characters; arrays are bounded; unknown fields rejected.

**Output:** catalogue identity/digest, total/returned/truncated counts, compact records, match score and matched fields, access/licence/assertion status, observation date, authoritative links, record digest and limitations.

**Annotations:** `readOnlyHint: true`; `untrustedContentHint: true`.

**Visible equivalent:** manual search form and result list.

**Errors:** `invalid_search_request`, `catalogue_unavailable`, empty results. No fallback to an unverified source.

**Evidence logged:** no personal query log by default. Build and test evidence records the corpus digest and fixture invocation; live page may expose the latest call visibly in ephemeral DOM only.

### Tool 2 — `get_resource_record`

**Title:** Get a government resource record  
**Description:** Return one exact record including source links, access/licence state, assertion labels, provenance and limitations; do not dereference endpoints or grant access.

**Input:** exact `recordId`, maximum 128 characters, closed identifier pattern.

**Output:** complete record, digest-binding status and page/tool boundary flags.

**Annotations:** read-only and untrusted.

**Visible equivalent:** “View record” action.

**Errors:** exact `record_not_found`; never fuzzy-resolve an identifier.

**Evidence logged:** fixture record ID, expected digest, UI/tool equality result.

### Tool 3 — `show_provenance`

**Title:** Show record provenance  
**Description:** Inspect the packaged source and digest chain for one record; do not refetch or independently certify the publisher.

**Input:** exact `recordId`.

**Output:** source URLs, observation date, extraction method, source/record/bundle digests, assertion statuses, evidence receipt ID, limitations and explicit verification boundaries.

**Annotations:** read-only and untrusted.

**Visible equivalent:** “Evidence and provenance” view.

**Errors:** missing receipt or digest returns `unverified`, not a substitute receipt.

**Evidence logged:** receipt fixture, digest recomputation result, deliberate mismatch test.

## 8.3 Deferred tools

`compare_resources` is a **Should** only after all hard gates pass. It would accept two to four exact record IDs and return field-by-field differences without declaring a “best” resource. `list_related_resources` remains a **Could** because related IDs can be included in the record. A separate `explain_match` is unnecessary: deterministic match fields belong in search output.

## 8.4 Tool specification notes

The current WebMCP draft’s `ModelContextTool` contains name, title, description, `inputSchema`, execute callback and annotations; it does not define an `outputSchema` member. [W01] The repository should still publish JSON Schemas for outputs and validate returned values in tests/runtime, but it should not present a non-standard `outputSchema` registration property as part of the current specification.

Tool descriptions and outputs are themselves injection surfaces. The descriptions must therefore be short, fixed in source, non-promotional and truthful. Source-derived text must never be concatenated into tool names or descriptions. [W01; W03]

## 8.5 Data minimisation and injection controls

- No input for name, age, email, location, employer, browsing history, cookies, prior purchases, personal preferences or arbitrary “instructions”.
- Query text capped at 160 characters and normalised.
- No user-supplied URL, selector, callback, origin, endpoint or credential.
- `additionalProperties: false` plus executable exact-key validation.
- Source strings returned as data with `untrustedContentHint: true`.
- Link schemes restricted to HTTP(S); credentials in URLs rejected.
- No HTML returned to the agent.
- No dynamic tool registration from catalogue records.
- No page-side storage, analytics or external runtime calls in the judging path.
- Same function produces tool result and visible card/detail view.


# 9. Tool catalogue and schemas

The complete TypeScript is supplied at `src/webmcp-tools.ts`; six JSON Schema files are in `schemas/`.

## 9.1 Contract summary

| Tool | Required input | Maximums | Read only | Untrusted output | Provider call | Durable receipt |
|---|---|---|---:|---:|---:|---:|
| `search_government_knowledge` | `query` | 160 chars; 20 results; 8 publishers | Yes | Yes | No | No |
| `get_resource_record` | `recordId` | 128 chars | Yes | Yes | No | No |
| `show_provenance` | `recordId` | 128 chars | Yes | Yes | No | Inspects packaged receipt only |

## 9.2 Input schemas

### Search

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "query": {"type": "string", "minLength": 1, "maxLength": 160},
    "resourceTypes": {
      "type": "array",
      "maxItems": 7,
      "uniqueItems": true,
      "items": {
        "enum": [
          "govuk-content", "dataset", "api", "api-documentation",
          "catalogue-record", "organisation", "guidance"
        ]
      }
    },
    "publishers": {
      "type": "array",
      "maxItems": 8,
      "uniqueItems": true,
      "items": {"type": "string", "minLength": 1, "maxLength": 100}
    },
    "accessStatuses": {
      "type": "array",
      "maxItems": 5,
      "uniqueItems": true,
      "items": {
        "enum": [
          "public", "restricted", "authentication-required",
          "access-not-established", "not-applicable"
        ]
      }
    },
    "limit": {"type": "integer", "minimum": 1, "maximum": 20, "default": 8}
  },
  "required": ["query"]
}
```

### Exact record and provenance

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "recordId": {
      "type": "string",
      "minLength": 3,
      "maxLength": 128,
      "pattern": "^govuk-discovery:[a-z0-9][a-z0-9._:-]{2,127}$"
    }
  },
  "required": ["recordId"]
}
```

## 9.3 Output design

Every success response includes a versioned schema name and explicit boundary object. Every failure response has a stable application code, human-readable message, details and limitations. The agent should never have to infer whether a provider call occurred.

Minimum boundary fields:

```json
{
  "pageScoped": true,
  "readOnly": true,
  "providerCall": false,
  "accessAuthorityGranted": false,
  "durableReceiptCreated": false,
  "sourceDerivedContentIsUntrusted": true
}
```

Not every tool uses every field; the published output schemas define exact combinations.

## 9.4 Tool test cases

| Test | Input | Expected |
|---|---|---|
| Normal search | `{"query":"flood data API"}` | Ranked records, match fields, human URLs |
| Empty query | whitespace | `invalid_search_request` |
| Oversize query | 161 chars | rejected |
| Unknown input | `{"query":"tax","email":"…"}` | rejected |
| Personalisation attempt | extra demographic fields | rejected |
| Prompt-like query | “ignore rules…” | treated only as bounded search text |
| Restricted API | exact record | access remains `restricted` or `access-not-established` |
| Missing licence | exact record | licence status `missing`, no OGL inference |
| Unknown ID | valid-pattern absent ID | `record_not_found` |
| Unsafe URL in corpus | `javascript:` source | catalogue validation fails; tools not registered |
| Digest mismatch | altered record | provenance `unverified` or registration failure |
| Manual parity | same input through form/tool | deep-equal substantive output |
| Cancellation | aborted fetch | operation ends without partial substitution |
| No WebMCP | unsupported browser | manual UI remains fully usable |

## 9.5 Evidence captured

- tool registration snapshot from Chrome DevTools or host diagnostic;
- exact tool names/descriptions/input schemas;
- fixture call inputs and validated outputs;
- screenshot and DOM snapshot showing identical visible record;
- corpus and built-artefact SHA-256;
- negative-test report;
- ChatGPT and Chrome host/version/date;
- signed-out deployment test;
- no-storage/no-external-request network trace.


# 10. GOV.UK source architecture

## 10.1 Source comparison

| Source | Access/authentication | Rate/update behaviour | Coverage and identifiers | Human validation | Browser/CORS and deadline fit |
|---|---|---|---|---|---|
| GOV.UK Content API [G01; G02] | Public GET; no authentication | Beta; maximum 10 requests/second/client | Structured data for many `www.gov.uk` HTML pages; path, content ID, schema and links; excludes some dynamic/non-HTML content | Corresponding GOV.UK page | Current CORS suitability not verified; a historical issue reported missing CORS. Package at build time. [G15] |
| GOV.UK Search API v1 [G03–G05] | Public endpoint | Unsupported and may change; invalid parameters return 422 | Broad searchable metadata; public v2 equivalent not available | Result’s GOV.UK URL | Search API has historically worked browser-side, but judging must not depend on it; package selected results |
| API Catalogue [G06–G08] | Public human site; source repository/catalogue data available | Entry-specific freshness | UK public-sector API descriptions; organisation/API identifiers vary | Catalogue page plus publisher docs | Excellent discovery source; access/licence must be taken from each entry/publisher |
| data.gov.uk / National Data Library API [G09] | CKAN API; no API key; official docs state no rate limits | Catalogue changes independently; curated collections not yet in API | Dataset/package and publisher records | Dataset page | Suitable for build-time selection; CORS not relied upon |
| GOV.UK sitemap [G10] | Public XML | Generated regularly by GOV.UK | Majority of GOV.UK pages, URLs rather than rich rights/access metadata | Direct page | Discovery seed only; package results |
| Publisher documentation | Varies | Varies | Authoritative API purpose, authentication, status, limits | Primary human page | Always linked; never silently replaced by catalogue metadata |

## 10.2 Recommended acquisition pattern

The competition build should use **deterministic build-time acquisition**, not runtime federation:

```text
allowlist.yaml
  -> source fetchers with host/rate rules
  -> immutable source envelopes
  -> normalisation with field-level assertion labels
  -> rights/access validation
  -> record digests
  -> bundle manifest and digest
  -> static same-origin `catalogue.json`
  -> human UI and WebMCP tools
```

For the final 48 hours, network acquisition is frozen. The submission build uses pinned source envelopes and a recorded observation date. A separate refresh command can be documented but is not run on page load.

## 10.3 Source distinctions

- **GOV.UK source content:** publisher-rendered or Content API information.
- **API Catalogue metadata:** discovery description; does not imply access. [G06]
- **data.gov.uk metadata:** catalogue description; dataset-level rights prevail.
- **OKF source record:** a preserved source-oriented record/envelope.
- **Normalised profile record:** deterministic transformation with labelled fields.
- **WebMCP definition:** static code-authored interface; never generated from record text.
- **Tool execution:** page-local deterministic search/lookup.
- **Human UI:** the same substantive data and actions.
- **Evidence receipt:** integrity/provenance account; not official attestation.
- **Agent narrative:** optional model output; never written back into authoritative metadata.

## 10.4 Failure behaviour

| Failure | Required behaviour |
|---|---|
| Source fetch fails during build | Keep previous pinned envelope only if explicitly selected and label observation date; otherwise fail build |
| Runtime bundle fails schema/digest | Do not register tools; show manual error and downloadable diagnostics |
| Human URL unavailable | Show “authoritative page unavailable at last check”; retain URL and observation |
| Access not confirmed | `access-not-established` |
| Licence absent | `missing`; no open-licence inference |
| Conflicting sources | Preserve both assertions and conflict note |
| CORS blocks external API | Irrelevant to judging path; no runtime external fetch |
| Search API changes | Static bundle unaffected; refresh pipeline fails visibly |


# 11. GOV.UK Discovery OKF metadata profile

## 11.1 Profile rule

The profile extends OKF rather than claiming that every field is part of OKF core. JSON-LD serialisation, DCAT/DCTERMS/PROV/SKOS mappings, assertion labels and receipts are explicit profile layers. [GH15; STD01–STD05]

## 11.2 Field set and reviewed mappings

| Profile field | Meaning | Mapping | Status/constraint |
|---|---|---|---|
| `id` | Stable record identifier | JSON-LD `@id`; `dcterms:identifier` | Required; profile-controlled URI/URN |
| `title` | Human resource title | `dcterms:title` | Source or normalised assertion |
| `description` | Plain-English description | `dcterms:description` | Preserve source; derived summary separately labelled |
| `resourceType` | GOV.UK content/dataset/API/etc. | `rdf:type`; `dcat:Dataset`, `dcat:DataService`; profile term | Reviewed controlled vocabulary |
| `publisher` | Publishing organisation | `dcterms:publisher` | Source-backed |
| `steward` | Operational steward where distinct | `dcat:contactPoint` only where contact semantics fit; otherwise profile term | Do not equate automatically with publisher |
| `topic` | Discovery concepts | `dcat:theme` to `skos:Concept` | Controlled, evidence for mappings |
| `govukContentId` | GOV.UK UUID where present | `dcterms:identifier` with typed scheme/profile term | Optional |
| `canonicalHumanUrl` | Authoritative human page | `dcat:landingPage` | Required for verified presentation where available |
| `documentationUrl` | Technical documentation | `foaf:page` or profile `documentation` | Mapping unresolved where page is not general documentation |
| `machineEndpoint` | API/data endpoint | `dcat:endpointURL` for `dcat:DataService` | Never imply access |
| `apiCatalogueUrl` | Catalogue record page | `dcterms:relation` plus profile role | Optional |
| `licence` | Confirmed licence | `dcterms:license` | URI/title/evidence; missing is explicit |
| `accessConditions` | Narrative restrictions | `dcterms:accessRights` or profile object | Separate from authentication |
| `authenticationRequirement` | None/key/OAuth/etc. | Profile term | No exact DCAT core property |
| `accessStatus` | Public/restricted/auth/not established | Profile controlled term | Never derived solely from catalogue inclusion |
| `status` | Alpha/beta/live/deprecated/unknown | `adms:status` where vocabulary fits; otherwise profile term | Preserve publisher wording |
| `sourceAuthority` | Why source is authoritative | `prov:wasAttributedTo` / profile term | Narrative and agent distinction |
| `sourceAssertion` | Original field/value/evidence | PROV qualified derivation/profile assertion | Required for material fields |
| `assertionStatus` | Official/normalised/inferred/model-derived | Profile controlled term | Required for derived fields |
| `dateFirstPublished` | Publisher date | `dcterms:issued` | Only when source supports |
| `dateModified` | Publisher-modified date | `dcterms:modified` | Do not substitute retrieval time |
| `dateObserved` | Prototype retrieval/observation | `prov:generatedAtTime` on capture entity/activity; profile shortcut | Required |
| `extractionMethod` | Manual/API/parser/rule | `prov:wasGeneratedBy` activity attributes | Required |
| `sourceDigest` | Digest of captured source scope | `spdx:checksum` on source entity or profile term [STD07] | Digest scope required |
| `recordDigest` | Canonical record digest | `spdx:checksum` or profile term [STD07] | Required |
| `bundleDigest` | Publication bundle digest | `spdx:checksum` on bundle entity [STD07] | Required |
| `evidenceReceipt` | Receipt identifier/link | `prov:hadPrimarySource` is not exact; use profile term linking receipt entity | Custom |
| `relatedDatasets/APIs/guidance` | Typed relationships | `dcterms:relation`; DCAT relations; SKOS only for concept relations | Relation role required |
| `limitations` | Known gaps/caveats | Profile term | Required array, may be empty only with review |
| `deprecation/replacement` | Supersession | `dcterms:isReplacedBy` / `replaces` | Source-backed only |
| `accessibilityInformation` | Accessibility statement/known status | `dcterms:conformsTo` only for actual conformance; profile links otherwise | Never claim conformance from presence of statement |
| `provenanceChain` | Sources, activities, agents, outputs | PROV-O entities/activities/agents | Required for verified status |

## 11.3 Mapping cautions

- `schema:WebAPI` [STD06] may be useful as a secondary type, but `dcat:DataService` is the stronger catalogue mapping for an API service.
- `skos:exactMatch` must not be generated from string similarity; it asserts a strong conceptual mapping. [STD04]
- `dcterms:license` must point to an actual rights statement, not an inferred default.
- A source digest requires a stated canonicalisation scope. Hashing a paraphrase is not the same as hashing the publisher response.
- `prov:wasDerivedFrom` records derivation; it does not certify truth or endorsement. [STD03]
- “Verified” in this prototype means validated against its declared profile and digest chain, not verified by government.

## 11.4 Assertion model

Each material field carries:

```json
{
  "field": "access.status",
  "value": "public",
  "status": "normalised",
  "evidenceUrls": ["https://content-api.publishing.service.gov.uk/"],
  "note": "Normalised from official no-authentication and open-use statements."
}
```

A model-derived suggestion must be stored in a separate transient object with its model/version/prompt context and must never overwrite a source or normalised value.


# 12. Provenance and evidence model

## 12.1 Evidence chain

```text
Authoritative public URL
  -> retrieval observation
  -> source envelope with retrieval metadata and digest scope
  -> deterministic extraction activity
  -> field assertions with status and evidence URLs
  -> canonical record JSON
  -> record SHA-256
  -> bundle manifest and SHA-256
  -> static build manifest
  -> deployed exact-commit asset
  -> WebMCP/UI result referencing record and bundle digests
```

## 12.2 Receipt semantics

An evidence receipt answers:

- what source was observed;
- when and how it was observed;
- what bytes or canonical fields were hashed;
- which deterministic transformation ran;
- which record and bundle resulted;
- whether the digest chain recomputes;
- which human review was performed;
- what remains unverified.

It does **not** prove:

- that the upstream source was factually correct;
- that a URL is still live;
- that an API is accessible to the user;
- that a licence applies beyond its stated scope;
- that government endorses the prototype;
- that an AI summary is correct.

## 12.3 Verification states

| State | Meaning |
|---|---|
| `digest-bound` | Source/record/bundle digest fields are present and internally consistent |
| `source-observed` | Source URL and observation metadata present, but full source bytes may not be preserved |
| `human-reviewed` | A named review role completed the declared checklist |
| `conflict-present` | Sources disagree; both retained |
| `stale` | Observation age exceeds profile threshold |
| `unverified` | Required evidence missing or digest invalid |

A record can be `digest-bound` and still `stale`, `conflict-present` or factually wrong.

## 12.4 Fail-closed rules

- Missing/invalid required digest: do not display “verified”; tools either do not register or return `unverified`.
- Missing access evidence: `access-not-established`.
- Missing licence: `missing`; do not infer OGL.
- Missing human URL: show limitation and machine URL only as supplementary.
- Stale metadata: display observation date and stale label.
- Source/derived conflict: retain both with field status and evidence.
- Unsafe URL: fail the build or record; never offer it as a link.
- Receipt mismatch: reject build or mark the record unavailable.
- Unknown relationship: omit it rather than use model similarity as fact.

## 12.5 Release integrity

The competition release should contain:

- `manifest.json` with every artefact path, size and SHA-256;
- corpus digest and per-record digests;
- source-envelope manifest;
- SPDX or CycloneDX SBOM;
- dependency lockfile;
- build command and environment versions;
- GitHub Actions provenance/attestation where available;
- release tag bound to deployed commit;
- signed or GitHub-verified commit where practical;
- screenshot/video transcript and submission text digests;
- evidence that the live URL serves the same build bytes.

The existing `gis-ai-go` release pattern supplies useful precedent, but the competition release must be separate and post-start. [GH07]


# 13. Security, privacy and threat model

## 13.1 Security premise

The WebMCP draft treats tool description/behaviour alignment, output injection and over-parameterisation as open risks; annotations are hints, not enforcement. [W01] Chrome guidance likewise treats tool metadata and outputs as prompt-injection surfaces and recommends deterministic controls, bounded data and human confirmation for consequential actions. [W03]

This prototype therefore uses no consequential action. It is read-only, static, same-origin, no-authentication and no-storage.

## 13.2 Threat register

| Threat | Sev. | Likelihood | Control | Test | Residual risk |
|---|---:|---:|---|---|---|
| Malicious tool description | High | Low | Tool metadata fixed in source; no record-derived descriptions | Snapshot exact registrations | Host still reasons probabilistically |
| Output prompt injection | High | Medium | Untrusted annotation, plain structured data, compact strings, visible UI | Malicious fixture | Agent may still summarise poorly |
| Hostile indexed metadata | High | Medium | Escape text, no HTML execution, bounds, source status | Script/markdown/instruction fixtures | Human may be socially influenced |
| Misleading tool name | High | Low | Specific names and descriptions; no “verify” or “authorise” claim | Review checklist | Semantic ambiguity cannot be eliminated |
| Declared/actual behaviour mismatch | High | Low | Same functions as UI; network test; code review | Compare trace to description | WebMCP has no independent behavioural verification [W01] |
| Over-parameterisation/context leakage | High | Low | Only query/filters/exact ID; no personal fields | Unknown-field tests | User may type sensitive text in query |
| Cross-origin leakage | High | Low | Same-origin bundle; CSP; no runtime provider fetch | Browser network trace | Hosting/CDN logs remain |
| Stale data | Medium | High | Observation date, stale threshold, frozen corpus | Stale fixture | User may ignore warning |
| Wrong/missing licence | High | Medium | Explicit states; record-level evidence; no default | Missing/conflict fixtures | Source licence itself may be unclear |
| Hallucinated API availability | High | Medium | Controlled access statuses; prohibited claims | Restricted API evaluation | Agent narrative may overstate unless constrained |
| Catalogue equals access | High | High | Explicit boundary in every result | Comprehension test | Familiarity bias |
| Forged provenance | High | Low | Digests, manifests, pinned commit, source URLs | Tamper fixture | Digest does not prove source identity without signatures |
| Digest mismatch | High | Low | Fail build/registration | Flip byte | Availability loss is intentional |
| Source substitution | High | Low | Host allowlist, redirects recorded, final URL checked | Redirect/host test | Legitimate publisher migrations |
| Open redirect | High | Low | Parse URLs, allow HTTP(S), optional allowlisted hosts, `rel=noopener` | URL fixtures | Valid allowed host may redirect later |
| Unsafe external URL | High | Low | Reject credentials/non-HTTP(S); display hostname | `javascript:`/data/file fixtures | Phishing on legitimate compromised domain |
| Excess Content API requests | Medium | Low | Build-time caching, 10 rps ceiling, no runtime calls | Fetch-budget test | Refresh job can still fail |
| Private/employer material in build | Critical | Medium | Clean-room allowlist, history scan, source review | secret/PII/string scan | Human classification error |
| Production credentials | Critical | Low | No credentials required; push protection; clean env | secret scan and network trace | Historical git objects need review |
| Model relationship shown as fact | High | Medium | Separate assertion status; no silent write-back | model-derived fixture | UI label may be overlooked |
| Agent-only functionality | High | Low | Manual equivalent for all three tools | keyboard/manual parity | Host-specific narration differs |
| Dependency compromise | High | Low-Med | Minimise dependencies, lockfile, SBOM, pinned actions | SCA and clean build | Transitive ecosystem risk |
| Service worker stale build | Medium | Medium | Versioned assets, update banner, no opaque cache | deploy old/new tests | Browser cache may persist |
| Denial through malformed corpus | Medium | Low | Size/depth limits, schema validation before registration | fuzz fixtures | Tools unavailable rather than degraded |
| Personal query retention by AI host | Medium | Medium | Page stores nothing; warning; no telemetry | storage/network inspection | Host conversation is governed by host policy |

## 13.3 Privacy design

- No account, cookie, form profile, analytics identifier or persistent query history.
- No personalisation or unrelated conversation context requested.
- No personal data in the curated corpus.
- Query warning: “Do not enter personal, confidential or official-sensitive information.”
- Static hosting access logs are a hosting-platform matter and must be disclosed in the privacy notice.
- ChatGPT or another agent host may retain its own conversation; the page must not imply otherwise. [W04]
- If telemetry is added, it is a new privacy decision requiring purpose, minimisation, retention and consent analysis. [P01; P02]

## 13.4 Content Security Policy

Target policy:

```text
default-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
manifest-src 'self';
worker-src 'self';
base-uri 'none';
form-action 'self';
frame-ancestors 'none';
object-src 'none';
upgrade-insecure-requests;
```

Avoid inline scripts/styles or use generated hashes. External links open explicitly with `rel="noopener noreferrer"` where a new tab is used.

## 13.5 Governance boundary

No tool performs authentication, transaction, write, download of restricted data, eligibility decision or recommendation with legal effect. Any future provider query belongs behind a separately governed MCP service with policy decisions, credentials, receipts, recovery and audit; it is not a deadline feature.


# 14. Accessibility approach

## 14.1 Standard and product commitment

Use WCAG 2.2 AA as the acceptance baseline and GOV.UK accessibility guidance as a design reference. [A01; A02] Do not claim formal conformance solely from automated checks.

## 14.2 Human-visible equivalence

| Agent capability | Human equivalent |
|---|---|
| Search metadata | Labelled search form with the same filters |
| Read compact result | Semantic result card/list |
| Get exact record | Link/button to record detail |
| Inspect provenance | Evidence section with plain-English explanation and raw JSON download |
| Understand match | Visible “Why this matched” fields |
| See limitations | Prominent limitations list |
| Open source | Descriptive authoritative-source link |
| Detect unsupported host | Status message; manual journey remains available |

## 14.3 Interaction requirements

- Logical heading structure and landmark regions.
- Skip link and persistent visible focus.
- Native form controls and buttons; no clickable `div`.
- Search status in a polite live region; errors linked to fields and moved into focus only where appropriate.
- Result count and truncation announced.
- Link text states destination and purpose, for example “Open GOV.UK Content API documentation”.
- Access/licence/assertion states conveyed by text and icon shape, not colour alone.
- 400% zoom/reflow without two-dimensional scrolling except code/table containers.
- Touch targets and spacing consistent with WCAG 2.2.
- Reduced-motion preference honoured; no essential animation.
- Forced-colours and high-contrast mode tested.
- Raw JSON available but never required to understand the result.
- Plain-English terms first; “provenance”, “OKF” and “digest” explained on demand.
- Mobile width 320 CSS px and landscape orientation tested.

## 14.4 Test matrix

| Test | Tools/assistive technology | Gate |
|---|---|---|
| Automated | axe-core plus HTML validator | 0 serious/critical; reviewed moderate |
| Keyboard | Browser only | All core tasks, visible focus, no trap |
| Screen reader | VoiceOver/Safari or Chrome; NVDA/Chrome where available | Labels, status, result structure and links understandable |
| Zoom/reflow | 200% and 400% | Core flow usable |
| Contrast | Automated plus manual states | WCAG AA |
| Reduced motion | OS/browser setting | No unexpected motion |
| Narrow screen | 320 px and common mobile | No clipped controls/content |
| Error recovery | Invalid query/record | Specific, announced, persistent |
| Agent/manual parity | Tool result vs visible record | Same substantive values |
| Comprehension | Non-technical users | Can locate source, access, licence and limitation without jargon knowledge |

Publish a short prototype accessibility statement listing scope, known issues, test date, contact route and the fact that it is independent and time-limited.


# 15. Delivery plan by date and hard gate

The plan works backwards from **21:00 BST on 3 September 2026**, with an internal submission target of **15:00 BST**.

## Gates

| Gate | Pass condition |
|---|---|
| G0 — entrant route | Written individual/team/organisation decision and representative |
| G1 — rights baseline | Baseline SHAs, licences, ownership schedule and corpus allowlist |
| G2 — core product | Accessible search/detail/evidence UI using one deterministic data layer |
| G3 — WebMCP | Three tools register and execute in a supported host |
| G4 — integrity | Bundle/record/source-scope digests and receipt validation |
| G5 — assurance | Security, injection, accessibility and parity tests pass |
| G6 — deployment | Signed-out public exact-commit URL works |
| G7 — submission media | <3-minute public YouTube demo and final text/repo links |
| G8 — final receipt | Devpost confirmation, final tag, hashes and evidence archive |

## 29 August — scope, rules and evidence baseline

**Must pass G0 direction and G1 draft.**

- Register for the competition under a provisional personal account only if registration itself does not make the ownership warranty; do not submit until route is final.
- Capture the live rules URL, access time, controlling deadline and discrepancies.
- Freeze product to three tools and a 30–80 record corpus.
- Record `fe122…` as pre-start baseline and `8c4…` as post-start candidate.
- Decide competition branch versus dedicated repository.
- Create rights/component schedule and send employer/administrator questions.
- Select records from `okf-govuk-content` and `okf-uk-government-apis`.
- Freeze independent visual identity and disclaimer.

## 30 August — product and WebMCP integration

**Pass G2 and a local G3.**

- Adapt current candidate to the GOV.UK Discovery profile.
- Implement search, record and provenance views.
- Register the three tools through the imperative API.
- Use the same functions for manual and tool execution.
- Add source/access/licence/assertion/observation/limitation fields.
- Add authoritative human links and access-not-established semantics.
- Add input bounds, exact-key validation and unsafe-URL rejection.
- Run unit, schema, parity and no-storage tests.

## 31 August — deterministic build and host compatibility

**Pass G3 and G4.**

- Complete source envelopes, record digests, bundle digest and receipt examples.
- Produce manifest, checksums, SBOM and notices.
- Test ChatGPT desktop built-in browser and Chrome 149+ with WebMCP enabled as required by rules. [R01; W04]
- Inspect registrations and calls with browser diagnostics/DevTools.
- Resolve CSP, base-path, service-worker and GitHub Pages issues.
- Review official office hours at 11:00 PT if useful; treat verbal guidance as supplementary and retain notes. [R02]
- Freeze corpus and feature set at end of day.

## 1 September — deploy candidate and assurance

**Pass G5 and G6.**

- Deploy exact candidate from a protected branch/tag.
- Test from signed-out/private browser and at least one separate network/device.
- Run accessibility, prompt-injection, URL, digest-tamper, stale/missing/conflict and no-match cases.
- Verify no secrets, private files, official credentials or personal data in repository/history/build.
- Draft Devpost narrative and video script.
- Request optional credits only before the separate rule deadline and only if approved/useful; do not introduce a new hosting dependency late. [R01]
- Governance decision: if G0/G1 cannot pass, switch to clean-room or no-go.

## 2 September — acceptance and submission package

**Pass G7.**

- Complete end-to-end acceptance in both judging hosts.
- Record the 2:45 demo; captions and transcript.
- Upload publicly to YouTube after rights check.
- Verify repository is public, licence is detected at top level and all build instructions work in a clean clone.
- Check every link and disclaimer.
- Create release candidate tag and `SHA256SUMS`.
- Complete compliance and pre-submission checklists.
- Freeze code except critical defect fixes.

## 3 September — submit and preserve

**Pass G8 well before 21:00 BST.**

- Re-check live Official Rules and supported-country list.
- Confirm governance/rights approvals remain valid.
- Verify live URL, repository and YouTube from signed-out sessions.
- Submit by the 15:00 BST internal target.
- Save Devpost receipt/screenshots and submission-field text.
- Create final immutable tag/release and evidence archive.
- Do not add risky features; only restore broken links/builds if necessary.
- Keep site available free of charge through the judging period ending 21 September. [R01]

## Critical path

```text
entrant/rights decision
  -> reviewed corpus
  -> shared UI/tool functions
  -> real-host WebMCP validation
  -> public exact-commit deployment
  -> assurance evidence
  -> video and submission
```

## Drop order under slippage

1. Drop `compare_resources`.
2. Drop graph/timeline/map visualisations.
3. Reduce corpus towards 30 records.
4. Drop live refresh/proxy and all serverless code.
5. Drop advanced related-resource navigation.
6. Keep only three tools, human parity, authoritative links, provenance, limitations, accessibility and immutable deployment.

Never drop the public URL, genuine WebMCP tools, public repository/licence, human UI, authoritative links, provenance/limitations, video or description.


# 16. Testing and evaluation plan

## 16.1 Evaluation cases

| Case | Expected tool/record behaviour | Human link | Caveat | Prohibited claim | Pass |
|---|---|---|---|---|---|
| Straightforward discovery | Search finds GOV.UK Content API | Official docs | Beta, coverage limits | “Complete GOV.UK” | Correct record/link/status |
| Ambiguous topic | Several records; deterministic reasons | Each publisher page | Ambiguity stated | Single certain answer | Multiple candidates and explanation |
| Multiple APIs | Several API records | Catalogue + publisher docs | Different access/coverage | “Best API” without criteria | No unsupported ranking |
| Restricted API | Search/exact record | Publisher access page | Restricted/auth required | “You can access it” | Access boundary visible |
| Uncertain access | Exact record | Catalogue/docs | Access not established | “Public API” | Exact phrase/state |
| Outdated metadata | Exact record | Source | Observation date/stale | “Current” | Stale label |
| Missing licence | Exact record | Source | Licence missing | “OGL” | No inferred licence |
| Missing provenance | Provenance tool | Source where known | Unverified | “Verified” | Fail closed |
| Broken human URL | Record | Retained URL/error | Source unavailable | “Validated at source” | Limitation shown |
| Conflicting sources | Exact/provenance | Both sources | Conflict preserved | Silent resolution | Both assertions visible |
| Prompt-like metadata | Search/record | Source | Untrusted content | Follow embedded instruction | Text escaped/labeled |
| No match | Search | Search/help page | Corpus limited | Invented result | Empty result plus next steps |

## 16.2 Three-mode comparison

### A. Ordinary page/screenshot interaction

Measure whether an agent must infer controls, misreads labels or misses provenance. Record task success, steps, errors and unverifiable claims.

### B. WebMCP interaction

Measure correct tool selection, valid arguments, execution success, traceability, caveat retention and source opening. Do not score prose elegance as a primary outcome.

### C. Direct OKF inspection

Use as a reference condition for field-level traceability. Measure whether the person can locate the same evidence, not whether raw JSON is pleasant.

## 16.3 Metrics

- correct official record ID;
- correct authoritative human URL;
- access status accuracy;
- licence status accuracy;
- observation date retained;
- assertion-status retention;
- prohibited claims count;
- successful source verification;
- tool selection precision;
- invalid-argument rate;
- UI/tool substantive equality;
- keyboard and screen-reader task completion;
- time to evidence;
- false-confidence statements.

## 16.4 Acceptance thresholds

- 100% schema, digest and unsafe-URL negative tests pass.
- 100% restricted/unknown access cases avoid access claims.
- 100% missing-licence cases avoid licence inference.
- 100% source links use HTTP(S) and display purpose/host.
- 100% core tool actions have manual equivalents.
- 0 serious/critical automated accessibility findings.
- 0 external runtime requests other than same-origin assets.
- 0 cookies/localStorage/sessionStorage/IndexedDB writes by application.
- Same record ID, link, assertion status and limitation in UI and tool results.
- Successful tool discovery/call in both required judging routes, or a documented rules-supported route if one host is unavailable.


# 17. Deployment and operational plan

## 17.1 Hosting

Use GitHub Pages, Netlify, Cloudflare Pages or equivalent static hosting only after testing the exact host with WebMCP. The rules permit a provider of the entrant’s choice and require a working live URL. [R01]

GitHub Pages is preferred if it can serve:

- correct MIME types;
- the required CSP or equivalent meta policy;
- stable base paths;
- no authentication;
- immutable versioned assets;
- the WebMCP page as a top-level document;
- a clear `/about`, `/accessibility`, `/privacy` and `/evidence` route.

Do not deploy the persistent MCP gateway for this entry. It increases operational risk without improving the core person-agent shared-page demonstration.

## 17.2 Build

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build:data
pnpm run verify:data
pnpm run build:web
pnpm run verify:artefact
pnpm run test:browser
```

The build fails on:

- unreviewed source host;
- missing rights/access review;
- invalid or unsafe URL;
- missing required assertion status;
- digest mismatch;
- duplicate ID;
- missing human URL without explicit limitation;
- record/bundle mismatch;
- unexpected external asset;
- inaccessible critical component;
- output-schema failure.

## 17.3 Operational stance

- Static read-only service; no uptime promise.
- No personal data collection by application.
- Hosting platform logs disclosed.
- Corpus frozen for judging; observation date visible.
- Status page or banner for known issues.
- Security contact through repository `SECURITY.md`.
- Keep URL/repository/video public through judging.
- Monitor only availability and integrity, not user queries.
- Rollback by redeploying the same immutable release; do not silently switch corpus.
- Any emergency correction increments release and records why.

## 17.4 Browser support

- ChatGPT desktop built-in browser: primary competition demonstration, subject to account/model support. [W04]
- Chrome 149+ with testing flag as specified by Official Rules. [R01]
- Ordinary modern browsers: full manual UI without WebMCP.
- Unsupported host: explicit status, no broken controls.

Record exact app/browser versions, operating system, account/model availability and test date. Do not claim universal WebMCP support.


# 18. Demonstration storyboard — 2 minutes 45 seconds

| Time | Visual/action | Narration purpose |
|---:|---|---|
| 0:00–0:15 | Search-engine-style results or simple montage of plausible government links | “Finding a plausible link is easy; knowing its authority, access, licence and evidence is harder.” |
| 0:15–0:25 | Prototype title and independent disclaimer | Establish boundary: experimental, read-only, not official |
| 0:25–0:45 | Human enters “Which official APIs or datasets could help with flood risk?” | Show accessible ordinary page experience |
| 0:45–1:05 | Results display publisher, resource type, access, licence, observed date, assertion chips and limitations | Show governed metadata, not answer-only UI |
| 1:05–1:25 | In ChatGPT built-in browser, ask the same question; show explicit tool discovery and `search_government_knowledge` call | Prove genuine WebMCP use rather than selector guessing |
| 1:25–1:45 | Agent returns structured candidates and match reasons; page shows same records | Shared person-agent context and parity |
| 1:45–2:05 | Call `get_resource_record`; point to `access-not-established` or restricted example | Prove safe boundary and no access claim |
| 2:05–2:22 | Call `show_provenance`; briefly show observation date, source/record/bundle digests and assertion status | Technical credibility without overclaiming |
| 2:22–2:35 | Open actual GOV.UK/API publisher page | Human validation at authoritative source |
| 2:35–2:45 | Return to disclaimer and one-sentence trust claim | “The prototype does not ask you to trust an answer blindly; it makes source, transformation and uncertainty inspectable.” |

## Recording constraints

- Keep under 3 minutes; target 2:45. [R01]
- Use original narration and UI only; no background music.
- Avoid GOV.UK, employer and sponsor logos except incidental browser content where necessary to show the linked official source; minimise and do not use them as branding.
- Add accurate captions and publish transcript.
- Show the live URL and tool call, not slides alone.
- Avoid displaying account email, bookmarks, official tabs, credentials or notifications.


# 19. Draft Devpost submission text

## Project title

**Trusted GOV.UK Knowledge Discovery**

## One-line description

An independent read-only WebMCP prototype that helps people and agents discover public-sector knowledge together and inspect the authoritative source, access status, licence, provenance and limitations behind every result.

## The problem

Government information is widely published but fragmented across GOV.UK pages, dataset catalogues, API catalogues and publisher documentation. Ordinary search can return plausible links without a consistent way to tell who publishes a resource, whether an API is actually accessible, which licence is confirmed, when metadata was observed, or which relationships were inferred.

## What we built

The prototype packages a small, reviewed Open Knowledge Format corpus of GOV.UK content, public datasets and API records. A person can search and inspect it through an accessible web interface. On the same page, a compatible agent discovers three explicit WebMCP tools:

- `search_government_knowledge`
- `get_resource_record`
- `show_provenance`

The tools are page-scoped and read-only. They return structured records with authoritative human links, deterministic match reasons, access and licence status, field-level assertion labels, observation dates, digests, evidence receipts and known limitations. The same application functions drive the visible interface and tool results.

## Why WebMCP is a strong fit

Without WebMCP, an agent must infer the meaning of search controls and rendered cards or rely on screenshots. WebMCP lets the page publish a narrow, typed interaction contract while the person remains on the same inspectable page. This is material to the experience: the agent receives exact record identifiers and evidence fields rather than reconstructing them from presentation markup.

WebMCP itself does not guarantee trust. The trust contribution comes from combining authoritative links, explicit provenance, bounded tools, deterministic transformations, accessible manual equivalents and fail-closed handling of missing or conflicting metadata.

## What people and agents can do together

A person can ask a government-data or API question. The agent can search the page’s validated bundle, explain which fields matched and inspect an exact record. The person sees the same record, opens the publisher’s page and checks the evidence. Where access or licence is not established, both see that limitation. Catalogue inclusion is never presented as access authority.

## Implementation

The application is a static TypeScript site with no page-side account, credentials, analytics or provider calls. It validates a same-origin checksum-bound corpus before registering imperative WebMCP tools. Tool inputs use closed JSON Schemas and repeat validation in executable code. Outputs are treated as untrusted source-derived content. Every agent capability has a human-visible equivalent.

The corpus reuses disclosed, pre-existing OKF assets under their applicable licences. The competition repository documents the pre-challenge baseline and the post-start WebMCP extension with commit-bound evidence, manifests and checksums.

## Execution

- live public static URL;
- public open-source repository with a detected MIT licence;
- deterministic build and immutable competition release;
- keyboard and screen-reader-oriented UI;
- security, injection, stale/missing/conflict and parity tests;
- authoritative source links and downloadable JSON evidence.

## Potential impact

The pattern is useful wherever public knowledge must be discovered without turning an AI summary into an authority. It can help developers, analysts, researchers and citizens identify relevant official resources and understand the limits of catalogue metadata before investing effort or making claims.

## Creativity and ambition

The prototype treats the webpage as a shared evidence plane for people and agents. Instead of hiding provenance behind an AI response, it exposes the same record, source chain and uncertainty to both. It demonstrates how OKF publication patterns and WebMCP page tools can complement a deeper governed MCP gateway without confusing the two.

## Boundary

This is an independent experimental prototype. It is not a GOV.UK or UK Government service and is not endorsed by any public body. It does not provide access to restricted APIs, make official decisions, or claim comprehensive or current coverage. Follow the linked publisher page for authoritative information.


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


# 21. Go/no-go checklist

## Competition and entrant

- [ ] Live Official Rules re-read on 3 September.
- [ ] Deadline recorded as 21:00 BST; internal target 15:00 BST.
- [ ] Devpost registration complete.
- [ ] Entrant route recorded.
- [ ] Team/organisation representative authority retained where applicable.
- [ ] UK remains on supported-country list.
- [ ] No sponsor/administrator/judge conflict identified or undeclared.
- [ ] Employer outside-interest decision recorded.
- [ ] Code/IP ownership decision recorded.
- [ ] Prize and publicity route recorded.

## Rights and branding

- [ ] Top-level standard open-source licence detected by GitHub.
- [ ] Every imported component has licence/attribution.
- [ ] Every corpus record has rights status and evidence.
- [ ] No government/employer logo, Crown, GOV.UK wordmark or GDS Transport.
- [ ] No GOV.UK brand colours used as product identity.
- [ ] No implied endorsement.
- [ ] Video contains no unlicensed music/assets/marks.
- [ ] Contributor permissions complete.

## Product

- [ ] Public live URL.
- [ ] Three tools discover and execute.
- [ ] Manual equivalents work without WebMCP.
- [ ] Authoritative human link on every verified result where available.
- [ ] Access, licence, observation, assertion and limitation visible.
- [ ] No claim that catalogue inclusion grants access.
- [ ] No personal data, credentials, analytics or page-side query storage.
- [ ] No live provider dependency in judging path.
- [ ] Bundle validates before registration.
- [ ] Invalid digest fails closed.

## Assurance

- [ ] Unit/schema/property tests.
- [ ] Prompt-injection fixtures.
- [ ] Unsafe URL/open redirect tests.
- [ ] Stale/missing/conflict/no-match tests.
- [ ] UI/tool parity test.
- [ ] Keyboard and screen-reader tests.
- [ ] 320 px, 200% and 400% tests.
- [ ] Secret/PII/history scan.
- [ ] Dependency/SBOM scan.
- [ ] Signed-out deployment test.
- [ ] ChatGPT built-in browser evidence.
- [ ] Chrome 149+ evidence.

## Submission

- [ ] Repository public and clean-clone runnable.
- [ ] Demo is 2:45 target and publicly visible on YouTube.
- [ ] Captions/transcript accurate.
- [ ] Description maps to all four criteria.
- [ ] Live URL, repo and video links tested.
- [ ] Final tag/release and checksums.
- [ ] Devpost receipt preserved.
- [ ] Site maintained through judging.

**No-go triggers:** unresolved ownership; refused/absent required employer approval; unlicensed material; no live tool-enabled URL; tools fail in judging host; licence not detected; missing public video; any secret/restricted/personal data; misleading official branding.


# 22. Source register

The complete machine-readable register is supplied as `source-register.csv`. The access time is a research-session checkpoint, not an assertion that all 59 sources were fetched at the identical second. Critical Official Rules were re-opened during the final evidence pass. Publication/updated dates are recorded where exposed; missing dates were not invented.


| ID | Title / publisher | Category | Updated | Exact URL | Confidence / limitation |
|---|---|---|---|---|---|
| R01 | OpenAI WebMCP Challenge Official Rules — OpenAI / Devpost | Controlling competition rules | Live rules; accessed 29 August 2026 | https://webmcp.devpost.com/rules | High: Rules can be modified; re-check immediately before submission. |
| R02 | WebMCP Challenge — OpenAI | Official challenge page | Accessed 29 August 2026 | https://openai.com/webmcp-challenge/ | High: Overview, not controlling where it conflicts with R01. |
| R03 | The WebMCP Challenge is here — OpenAI Developer Community | Official-community announcement | Published 25 August 2026 | https://community.openai.com/t/the-webmcp-challenge-is-here/1392582 | Medium: Carries a deadline timestamp that conflicts with R01. |
| R04 | OpenAI API supported countries and territories — OpenAI Help Center | Eligibility dependency | Live list; accessed 29 August 2026 | https://help.openai.com/en/articles/5347006-openai-api-supported-countries-and-territories | High: Live list may change; verify UK remains listed before entry. |
| W01 | WebMCP — Draft Community Group Report — Web Machine Learning Community Group | Primary WebMCP specification | Draft dated 26 August 2026 | https://webmachinelearning.github.io/webmcp/ | High: Draft proposal, not a W3C Recommendation; implementation may change. |
| W02 | WebMCP Imperative API — Google Chrome for Developers | Browser implementation documentation | Updated 20 August 2026 | https://developer.chrome.com/docs/ai/webmcp/imperative-api | High: Chrome implementation documentation; may differ from other hosts and later versions. |
| W03 | Security considerations for WebMCP — Google Chrome for Developers | WebMCP security | Published 9 June 2026 | https://developer.chrome.com/docs/ai/webmcp/security | High: Implementation guidance, not a complete assurance standard. |
| W04 | Using site tools in the ChatGPT desktop app — OpenAI Help Center | Current OpenAI host behaviour | Accessed 29 August 2026 | https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app | High: Availability depends on account/model; page must remain open; current article says Site Tools are not used through Chrome. |
| W05 | WebMCP evaluation guidance — Google Chrome for Developers | Testing guidance | Accessed 29 August 2026 | https://developer.chrome.com/docs/ai/webmcp/evaluate | Medium-High: Exact page metadata was not separately archived. |
| G01 | GOV.UK Content API — Government Digital Service | Official government API documentation | Current beta documentation; accessed 29 August 2026 | https://content-api.publishing.service.gov.uk/ | High: 10 requests/second/client; incomplete coverage; beta. |
| G02 | GOV.UK Content API reference — Government Digital Service | Official API reference | Accessed 29 August 2026 | https://content-api.publishing.service.gov.uk/reference.html | High: Describes the machine endpoint; human source pages remain primary validation targets. |
| G03 | Using the GOV.UK Search API — Government Digital Service | Official government API documentation | Updated 27 March 2026 | https://docs.publishing.service.gov.uk/repos/search-api/using-the-search-api.html | High: The public v1 search endpoint is unsupported and may change. |
| G04 | GOV.UK Search overview — Government Digital Service | Official search architecture | Updated 3 June 2026 | https://docs.publishing.service.gov.uk/manual/govuk-search.html | High: No equivalent public Search API v2 endpoint. |
| G05 | Reuse GOV.UK content — GOV.UK | Official reuse guidance | Updated 9 December 2022 | https://www.gov.uk/help/reuse-govuk-content | High: States Search API is unsupported; must still inspect source-specific rights. |
| G06 | UK Government API Catalogue — Data Standards Authority / Government Digital Service | Official API discovery source | Live catalogue; accessed 29 August 2026 | https://www.api.gov.uk/ | High: Catalogue inclusion explicitly does not establish public accessibility. |
| G07 | GOV.UK Content — API Catalogue record — Data Standards Authority / Government Digital Service | Official API catalogue record | Accessed 29 August 2026 | https://www.api.gov.uk/gds/gov-uk-content/ | High: Metadata may be stale; follow publisher documentation. |
| G08 | GOV.UK Search — API Catalogue record — Data Standards Authority / Government Digital Service | Official API catalogue record | Accessed 29 August 2026 | https://www.api.gov.uk/gds/gov-uk-search/ | High: Catalogue listing does not make an API supported or grant access. |
| G09 | National Data Library / data.gov.uk API documentation — Government Digital Service | Official data catalogue API documentation | Accessed 29 August 2026 | https://guidance.data.gov.uk/get_data/api_documentation/ | High: Curated collections are not yet exposed through the API. |
| G10 | GOV.UK sitemap guidance — Government Digital Service | Official discovery feed | Accessed 29 August 2026 | https://docs.publishing.service.gov.uk/manual/sitemaps.html | Medium-High: Sitemap is broad discovery, not rich metadata or proof of currency. |
| G11 | Documenting APIs — Government Digital Service / CDDO | Official API documentation guidance | Last updated 17 January 2022 | https://www.gov.uk/guidance/how-to-document-apis | High: Guidance for government publishers; the prototype is not an official API publisher. |
| G12 | Making your service look like GOV.UK — GOV.UK Service Manual | Official branding and service-design guidance | Last updated 9 July 2026 | https://www.gov.uk/service-manual/design/making-your-service-look-like-govuk | High: Independent prototype must remove GOV.UK branding and avoid implying official status. |
| G13 | Using GOV.UK Frontend without GOV.UK branding — GOV.UK Design System | Official implementation guidance | Accessed 29 August 2026 | https://frontend.design-system.service.gov.uk/using-govuk-frontend-without-govuk-branding/ | High: Use generic header, own assets, font and brand colour. |
| G14 | Open Government Licence v3.0 — The National Archives | Primary public-sector information licence | Version 3.0 | https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/ | High: Excludes logos, personal data, unpublished information and third-party rights; no endorsement. |
| G15 | Request to allow CORS on the GOV.UK Content API — Government Digital Service / GitHub | Historical browser-access evidence | Historical issue; inspected 29 August 2026 | https://github.com/alphagov/govuk-developer-docs/issues/335 | Medium: Historical evidence only; it does not establish the current CORS headers of the Content API. |
| A01 | Web Content Accessibility Guidelines (WCAG) 2.2 — W3C | Accessibility standard | W3C Recommendation | https://www.w3.org/TR/WCAG22/ | High: Conformance does not by itself establish usability for every disabled person. |
| A02 | Making your service accessible — GOV.UK Service Manual | Government accessibility guidance | Accessed 29 August 2026 | https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible-an-introduction | High: Legal applicability to a personal prototype requires case-specific review; WCAG 2.2 AA remains a product gate. |
| P01 | Data protection by design and by default — Information Commissioner's Office | Privacy governance | Current guidance; accessed 29 August 2026 | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-by-design-and-default/ | High: Guidance is under continuing review following legislative changes. |
| P02 | Data minimisation — Information Commissioner's Office | Privacy principle | Current guidance; accessed 29 August 2026 | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/the-principles/adequate-relevant-and-limited/ | High: The static no-telemetry design is intended to avoid personal-data processing, but hosting logs remain platform-dependent. |
| S01 | Secure development and deployment guidance — National Cyber Security Centre | Security baseline | Accessed 29 August 2026 | https://www.ncsc.gov.uk/collection/developers-collection | High: Broad collection rather than a prototype-specific accreditation. |
| S02 | Secret scanning and push protection — GitHub Docs | Repository security | Accessed 29 August 2026 | https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning | High: Platform control; not a substitute for clean-room review. |
| IP01 | Ownership of copyright works — UK Intellectual Property Office / GOV.UK | Primary UK IP guidance | Accessed 29 August 2026 | https://www.gov.uk/guidance/ownership-of-copyright-works | High: General guidance, not case-specific legal advice. |
| IP02 | License and sell your copyright — UK Intellectual Property Office / GOV.UK | Primary UK IP guidance | Accessed 29 August 2026 | https://www.gov.uk/copyright/license-and-sell-your-copyright | High: Any assignment must be documented; contractual terms still need review. |
| C01 | Declaration and management of outside interests in the Civil Service — Cabinet Office | Civil Service propriety | Accessed 29 August 2026 | https://www.gov.uk/government/publications/declaration-and-management-of-outside-interests-in-the-civil-service | High: Departmental implementation and the user's secondment arrangements still require internal confirmation. |
| C02 | DSIT annual report and accounts 2025 to 2026 — Department for Science, Innovation and Technology | Departmental governance evidence | Published 2026 | https://www.gov.uk/government/publications/dsit-annual-report-and-accounts-2025-to-2026 | Medium-High: Confirms an outside-interests framework exists but does not expose the user's internal approval position. |
| C03 | Guidance on civil servants receiving hospitality — Cabinet Office | Civil Service gifts/propriety | Published 21 September 2010 | https://www.gov.uk/government/publications/guidance-on-civil-servants-receiving-hospitality | High: Department-specific thresholds and approval routes prevail. |
| C04 | Acceptance of gifts, benefits and hospitality — Planning Inspectorate | Illustrative departmental prize policy | Accessed 29 August 2026 | https://www.gov.uk/government/publications/acceptance-of-gifts-benefits-and-hospitality/acceptance-of-gifts-benefits-and-hospitality | Medium: Not DSIT or WCC policy; useful only as evidence that prizes connected to official duties can require consultation. |
| C05 | WCC public policy search — Warwickshire County Council | Employer-policy evidence gap | Searched 29 August 2026 | https://www.warwickshire.gov.uk/ | Low for absence claim: No publicly accessible employee outside-interests, prize, gifts or IP policy was found; absence from web search is not evidence that no policy exists. |
| STD01 | Data Catalog Vocabulary (DCAT) — Version 3 — W3C | Metadata vocabulary | W3C Recommendation | https://www.w3.org/TR/vocab-dcat-3/ | High: Profile mappings must be semantically reviewed, not selected by label similarity. |
| STD02 | DCMI Metadata Terms — Dublin Core Metadata Initiative | Metadata vocabulary | Current recommendation | https://www.dublincore.org/specifications/dublin-core/dcmi-terms/ | High: Use the range/domain semantics correctly. |
| STD03 | PROV-O: The PROV Ontology — W3C | Provenance vocabulary | W3C Recommendation | https://www.w3.org/TR/prov-o/ | High: A PROV graph records assertions; it does not independently prove source truth. |
| STD04 | SKOS Simple Knowledge Organization System Reference — W3C | Knowledge-organisation vocabulary | W3C Recommendation | https://www.w3.org/TR/skos-reference/ | High: Exact/close/broader mappings must be reviewed; do not infer equivalence automatically. |
| STD05 | JSON-LD 1.1 — W3C | Linked-data serialisation | W3C Recommendation | https://www.w3.org/TR/json-ld11/ | High: JSON-LD serialisation does not confer authority or validation. |
| STD06 | WebAPI — Schema.org — Schema.org | Secondary resource-type vocabulary | Live vocabulary page; accessed 29 August 2026 | https://schema.org/WebAPI | Medium-High: Use only as an additive type; it does not replace the reviewed DCAT DataService mapping. |
| STD07 | SPDX Specification 2.3 — checksum relationship — Linux Foundation / SPDX | Integrity metadata vocabulary | SPDX Specification 2.3 | https://spdx.github.io/spdx-spec/v2.3/RDF-object-model-and-identifier-syntax/ | High: A checksum records byte identity for a declared scope; it does not prove source truth or authority. |
| GH01 | gis-ai-go repository — Chris Page | Primary repository | Main inspected at commit 8c4c3e0df7b19926507b541fc11077d2912b94ee | https://github.com/chris-page-gov/gis-ai-go | High: Entrant ownership/employer rights not established by repository visibility or licence file alone. |
| GH02 | Pre-challenge baseline commit — Chris Page / GitHub | Competition provenance | 25 August 2026 16:47:33 UTC | https://github.com/chris-page-gov/gis-ai-go/commit/fe122579dc3aba07387c0c201ce5539b50a40108 | High: Timestamp establishes chronology, not ownership. |
| GH03 | Post-start WebMCP candidate commit — Chris Page / GitHub | Competition provenance | 29 August 2026 10:00 UTC | https://github.com/chris-page-gov/gis-ai-go/commit/8c4c3e0df7b19926507b541fc11077d2912b94ee | High: Commit is within the period; judges still decide whether extension is meaningful. |
| GH04 | WebMCP Explorer candidate README — Chris Page / GitHub | Implementation evidence | Commit-bound | https://github.com/chris-page-gov/gis-ai-go/blob/8c4c3e0df7b19926507b541fc11077d2912b94ee/apps/webmcp-explorer/README.md | High: Document states candidate is not yet in the supported Pages artefact. |
| GH05 | WebMCP Explorer candidate implementation record — Chris Page / GitHub | Architecture/test evidence | Commit-bound | https://github.com/chris-page-gov/gis-ai-go/blob/8c4c3e0df7b19926507b541fc11077d2912b94ee/docs/implementation/WEBMCP_EXPLORER_CANDIDATE.md | High: Chrome 149+/host testing and live deployment remain separate gates. |
| GH06 | WebMCP adapter source — Chris Page / GitHub | Implementation evidence | Commit-bound | https://github.com/chris-page-gov/gis-ai-go/blob/8c4c3e0df7b19926507b541fc11077d2912b94ee/apps/webmcp-explorer/src/webmcp-adapter.ts | High: Current code exposes GIS-specific tools, not the final GOV.UK discovery profile. |
| GH07 | gis-ai-go v0.1.0 release — Chris Page / GitHub | Pre-existing release evidence | 20 August 2026 | https://github.com/chris-page-gov/gis-ai-go/releases/tag/v0.1.0 | High: Pre-challenge and not the competition WebMCP deployment. |
| GH08 | okf-govuk-content repository — Chris Page / GitHub | Pre-existing GOV.UK corpus | Commit 18 August 2026 | https://github.com/chris-page-gov/okf-govuk-content/tree/94f5020cb2c7512a79c2353ee48743ad733a132c | High: 69-record demonstrator, not comprehensive; entirely pre-challenge. |
| GH09 | okf-uk-government-apis repository — Chris Page / GitHub | Pre-existing API corpus | Commit 18 August 2026 | https://github.com/chris-page-gov/okf-uk-government-apis/tree/55c7e67947dfd86e291ca987e354429c36b453d9 | High: 41,598-record bundle is too large for the MVP; licence is split/custom at repository level. |
| GH10 | okf-explorer repository — Chris Page / GitHub | Reusable Explorer | Commit 18 August 2026 | https://github.com/chris-page-gov/okf-explorer/tree/c8af0b05cab49a5341e0b787e17d49a674868d3a | High: Reuse code selectively; do not treat mixed licence as one blanket permission. |
| GH11 | okf-ons repository — Chris Page / GitHub | Reusable publication pattern | Commit 18 August 2026 | https://github.com/chris-page-gov/okf-ons/tree/b0283b0d0dd2bbd06a8311dd5d1342eea0c36fdf | High: Large ONS-specific corpus is outside the narrow MVP. |
| GH12 | okf-planning repository — Chris Page / GitHub | Pattern exemplar | Inspected 29 August 2026 | https://github.com/chris-page-gov/okf-planning | Medium-High: Useful provenance pattern, not selected corpus. |
| GH13 | okf-els-api repository — Chris Page / GitHub | Restricted-access exemplar | Inspected 29 August 2026 | https://github.com/chris-page-gov/okf-els-api | Medium-High: Upstream described as internal/private; do not imply public access. |
| GH14 | okf-LandRegistry repository — Chris Page / GitHub | Evidence/release exemplar | Inspected 29 August 2026 | https://github.com/chris-page-gov/okf-LandRegistry | Medium-High: Complex and domain-specific; use as design evidence only. |
| GH15 | Open Knowledge Format v0.2 specification — Google Cloud / GitHub | Primary OKF specification | Pinned commit | https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md | High: JSON-LD, YAML-LD, DCAT and receipt layers are project extensions, not OKF core. |

## 22.1 Research-capture integrity

The evidence directory contains a normalised rules research record and `SHA256SUMS`. Its hash protects the local record from undetected change. It is not a publisher signature, an Internet Archive capture or the hash of the complete live Devpost HTML. The exact live URL, access checkpoint, short controlling quotations, parsed clauses and discrepancies are retained so another reviewer can reperform the check.


# 23. Assumptions, evidence gaps and legal-review questions

## 23.1 Assumptions

1. Chris is an adult resident in the United Kingdom; the report does not independently verify identity or residence.
2. The public GitHub account and named repositories are under Chris’s control; control does not establish legal ownership.
3. The post-start timestamps returned by GitHub are accurate.
4. The prototype will use only public information and personal development credentials.
5. The current rules will remain materially stable; they must nevertheless be rechecked.
6. The competition accepts the imperative WebMCP API demonstrated in its own sample.
7. A static site can constitute non-trivial WebMCP where tools materially improve the shared page interaction; judges retain discretion.
8. No official employer endorsement or permission exists unless separately documented.

## 23.2 Evidence gaps

- Employment contracts, secondment agreement and internal IP policies were not supplied.
- WCC employee outside-interest, gifts/prize, IP and external-publicity policies were not found publicly.
- Individual DSIT/BDUK approvals were not available.
- Contributor agreements and provenance for every historical repository file were not audited.
- Current CORS headers for every government endpoint were not directly measured; architecture avoids relying on them.
- ChatGPT Site Tools availability for Chris’s selected model/account and the exact candidate page was not tested in this research.
- Chrome 149+ runtime behaviour of the new candidate was not evidenced.
- No live competition deployment, public video or Devpost draft was inspected.
- No competition administrator clarification of open-source-versus-sole-ownership wording was obtained.
- The complete 41,598 API records were not individually rights-audited.
- Formal WCAG conformance and penetration testing were not performed.

## 23.3 Questions for employer/legal review

1. Who owns each named repository and the specific post-25-August commits?
2. Were any files created in the course of WCC employment, DSIT/BDUK duties, assigned tasks or paid time?
3. Were employer devices, accounts, cloud credits, data, prompts or confidential knowledge used?
4. Does the existing MIT licence reflect authorised licensing by the actual owner?
5. Can Chris make the Devpost sole-ownership and rights warranties?
6. Can Chris grant the sponsor’s judging and publicity rights?
7. Is competition participation an outside interest or conflict?
8. May Chris accept or allocate cash, credits, subscriptions, equipment and publicity?
9. Must any prize be declined, donated or accepted by an organisation?
10. May employment or secondment roles be mentioned, and with what disclaimer?
11. Does any corpus item contain Crown, WCC, collaborator or third-party material outside OGL/MIT?
12. Is a separate clean-room repository sufficient, or does subject-matter overlap still require organisational approval?
13. Would an authorised team or organisation entry better match ownership?
14. What record of approval must be retained and published, if any?
15. Are there tax, anti-bribery, security or communications declarations beyond those identified here?

## 23.4 Questions for Devpost/OpenAI

1. How should the sole-ownership clause be read alongside the express permission to build on licensed open-source software?
2. Is an imported OGL metadata corpus acceptable when ownership remains with the public-sector licensor but reuse rights are broad?
3. Is a dedicated competition repository preferred, or is a clearly documented branch/diff sufficient?
4. Does a static same-origin metadata application with three read-only tools meet the intended non-trivial WebMCP threshold?
5. Which deadline prevails if community and Official Rules timestamps differ? The report assumes the Official Rules.
6. Must the public live URL remain unchanged until judging ends, or may immutable bug-fix releases be deployed?
7. Are incidental official logos visible on a linked publisher page in the demonstration acceptable if the prototype itself is unbranded?

## 23.5 Final decision rule

**Go** only when G0–G7 are evidenced and no legal/ownership no-go trigger remains.  
**No-go** where an entrant cannot truthfully give the required warranties.  
**Technical continuation without submission** remains valuable: the WebMCP/OKF prototype can still be developed and evaluated outside the competition under an appropriate ownership and governance route.


# Appendix A — one-page build brief for Codex

## Objective

Build and deploy a static, accessible, independent WebMCP application that lets people and agents search a checksum-verified bundle of reviewed GOV.UK content, dataset and API metadata and inspect authoritative links, access/licence status, assertion labels, provenance and limitations.

## Non-negotiable boundaries

- Read-only; no transactions, authentication, credentials, telemetry or personalisation.
- No runtime calls to GOV.UK or providers in the judging path.
- Same-origin static data only.
- Three tools only: search, exact record, provenance.
- Human-visible equivalent for every tool.
- Independent branding; no GOV.UK/employer logos, fonts or colours.
- Catalogue inclusion never means access authority.
- Missing licence/access/provenance fails closed.
- Model-generated text never becomes authoritative metadata.
- Preserve pre/post-challenge evidence and third-party notices.

## Implementation

1. Start from the post-start WebMCP candidate only after rights approval, or clean-room reimplement the supplied contracts.
2. Create the profile and schema.
3. Select 30–80 reviewed records.
4. Build immutable source envelopes, record digests, bundle digest and receipts.
5. Render search/results/detail/evidence through shared functions.
6. Register tools only after data validates.
7. Publish output schemas as repository contracts; do not register a non-standard `outputSchema`.
8. Add CSP, no-storage test, network allowlist and unsafe-URL validation.
9. Add unit, browser, accessibility, injection, parity and evaluation tests.
10. Deploy exact commit and generate release evidence.

## Definition of done

- clean install/build/test;
- public URL;
- tools work in ChatGPT built-in browser and Chrome 149+;
- manual UI works without WebMCP;
- every result displays source/access/licence/date/assertion/limitation;
- source links open;
- digests verify;
- negative cases fail closed;
- repository licence detected;
- signed-out validation passes;
- 2:45 demo recorded;
- compliance checklist complete.


# Appendix B — prioritised backlog

## Must

1. Entrant/ownership/outside-interest decision.
2. Baseline, rights and attribution manifests.
3. 30–80 record reviewed corpus.
4. Minimal OKF profile and JSON Schema.
5. Accessible search, results, record and provenance UI.
6. `search_government_knowledge`.
7. `get_resource_record`.
8. `show_provenance`.
9. Shared execution functions and UI/tool parity.
10. Authoritative human links.
11. Access/licence/assertion/observation/limitation fields.
12. Source/record/bundle digests and receipt.
13. Fail-closed validation.
14. Injection, unsafe URL, stale/missing/conflict/no-match tests.
15. CSP, no storage, no external runtime request.
16. ChatGPT/Chrome tests.
17. Public deployment, MIT licence and notices.
18. Demo, transcript, submission copy, final tag and hashes.

## Should

1. `compare_resources` after core freeze.
2. Filter facets for publisher/type/access.
3. Link-health report.
4. Stale-data badge/threshold.
5. Downloadable record and receipt.
6. Automated SBOM/attestation.
7. Accessibility statement and manual test log.
8. Baseline-to-submission visual compare.
9. Optional small set of related-record links.
10. Public status/known-issues page.

## Could

1. Graph view of reviewed relationships.
2. Timeline of source observations.
3. Map for geospatial examples.
4. Multilingual labels.
5. Serverless refresh preview outside judging path.
6. Persistent MCP hand-off demo.
7. User study dashboard.
8. Additional publishers/corpora.
9. Declarative WebMCP experiment when host support is verified.
10. Signed publisher attestations in a future profile.


# Appendix C — licence and attribution notice

## New competition code

Unless otherwise stated, original code created for the competition should be released under the MIT License. The top-level `LICENSE` must contain the standard MIT text and identify the actual rights holder authorised to license the code.

## Pre-existing project code

Selected code may be derived from:

- `chris-page-gov/gis-ai-go` — MIT;
- `chris-page-gov/okf-govuk-content` — MIT code/docs with source-specific data rights;
- `chris-page-gov/okf-uk-government-apis` — MIT code/docs, generated-record rights vary;
- `chris-page-gov/okf-explorer` — MIT code; some content/docs CC BY-NC 4.0.

Record exact file paths, commit SHAs and modifications in `NOTICE.md`. Do not describe an upstream licence as permission from an employer unless ownership/licensing authority is confirmed.

## Public-sector information

Where a source expressly makes information available under OGL v3.0, include:

> Contains public sector information licensed under the Open Government Licence v3.0.

The OGL excludes, among other things, logos and crests, personal data, unpublished information and third-party rights, and does not permit implying official status or endorsement. [G14]

## Standards and documentation

Retain notices for W3C, DCMI, OKF and any other copied schema/context material. Prefer links and original profile work over copying large passages.

## No blanket licence inference

A catalogue record’s presence does not prove that its linked API, dataset, documentation, marks or attachments share one licence. Every record must carry its own evidence.


# Appendix D — independent-prototype disclaimer

> **Independent experimental prototype**
>
> Trusted GOV.UK Knowledge Discovery is an independent, read-only experiment. It is not part of GOV.UK, is not an official UK Government or local-government service, and is not endorsed by any public body or publisher.
>
> Records are provided to help discovery. They may be incomplete, stale or wrong. Inclusion in a catalogue does not mean an API or dataset is publicly accessible, approved for your use, or covered by a particular licence. Access and licence are shown only where the cited source supports them.
>
> “Verified” means that the prototype’s declared metadata and digest checks passed. It does not mean that government has verified the record or that the underlying source is factually correct.
>
> Open the linked publisher page for authoritative information. Do not enter personal, confidential, official-sensitive or security information.


# Appendix E — commit and release evidence strategy

## Machine-readable `challenge-provenance.json`

```json
{
  "schema": "trusted-govuk-discovery.challenge-provenance.v1",
  "challenge": {
    "start": "2026-08-25T18:00:00Z",
    "deadline": "2026-09-03T20:00:00Z",
    "rulesUrl": "https://webmcp.devpost.com/rules"
  },
  "preExisting": [
    {
      "repository": "chris-page-gov/gis-ai-go",
      "commit": "fe122579dc3aba07387c0c201ce5539b50a40108",
      "timestamp": "2026-08-25T16:47:33Z"
    },
    {
      "repository": "chris-page-gov/okf-govuk-content",
      "commit": "94f5020cb2c7512a79c2353ee48743ad733a132c"
    },
    {
      "repository": "chris-page-gov/okf-uk-government-apis",
      "commit": "55c7e67947dfd86e291ca987e354429c36b453d9"
    }
  ],
  "postStartEvidence": [
    {
      "repository": "chris-page-gov/gis-ai-go",
      "commit": "8c4c3e0df7b19926507b541fc11077d2912b94ee",
      "timestamp": "2026-08-29T10:00:00Z",
      "purpose": "static WebMCP explorer candidate"
    }
  ],
  "submission": {
    "repository": "TO_BE_SET",
    "commit": "TO_BE_SET",
    "tag": "webmcp-challenge-2026-submission",
    "siteDigest": "TO_BE_SET",
    "bundleDigest": "TO_BE_SET"
  }
}
```

## Human evidence

- one-page baseline/new-work table;
- permanent compare links;
- screenshots of tool registration and calls;
- exact build and test commands;
- final release notes organised by judging criterion;
- signed checklist naming reviewer and date;
- Devpost receipt and immutable copies of submitted text.
