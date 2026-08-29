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
