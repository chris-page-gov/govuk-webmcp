import {
  initialiseKnowledgeDiscovery,
  type JsonObject,
  type RegistrationResult,
  type TrustedKnowledgeRuntime,
} from "../src/webmcp-tools.js";
import type {
  ActionPresentation,
  KnowledgeActionController,
} from "../src/application-actions.js";
import type {
  EvidenceTrace,
  EvidenceTraceNode,
} from "../src/evidence-runtime.js";

document.documentElement.dataset.applicationState = "starting";

const form = document.querySelector<HTMLFormElement>("#search-form")!;
const query = document.querySelector<HTMLInputElement>("#query")!;
const submit = document.querySelector<HTMLButtonElement>("button[type='submit']")!;
const status = document.querySelector<HTMLElement>("#status")!;
const results = document.querySelector<HTMLElement>("#results")!;
const recordPanel = document.querySelector<HTMLElement>("#record-panel")!;
const recordContent = document.querySelector<HTMLElement>("#record-content")!;
const provenanceContent = document.querySelector<HTMLElement>("#provenance-content")!;
const resourceType = document.querySelector<HTMLSelectElement>("#resource-type")!;
const publisher = document.querySelector<HTMLSelectElement>("#publisher")!;
const accessStatus = document.querySelector<HTMLSelectElement>("#access-status")!;
const resultLimit = document.querySelector<HTMLSelectElement>("#result-limit")!;
const clearSearch = document.querySelector<HTMLButtonElement>("#clear-search")!;
const analyticalIndex = document.querySelector<HTMLOListElement>("#analytical-index")!;
const traceDiagram = document.querySelector<HTMLElement>("#trace-diagram")!;
const foundationDetail = document.querySelector<HTMLElement>("#foundation-detail")!;
const evidenceStructured = document.querySelector<HTMLElement>("#evidence-structured")!;
const compareClaims = document.querySelector<HTMLButtonElement>("#compare-claims")!;
const comparisonPanel = document.querySelector<HTMLElement>("#comparison-panel")!;
const comparisonContent = document.querySelector<HTMLElement>("#comparison-content")!;
const routeWarning = document.querySelector<HTMLElement>("#route-warning")!;

const RAW_HASH_MAX = 1024;
const DECODED_COMPARISON_MAX = (4 * 96) + 3;

let runtime: TrustedKnowledgeRuntime | undefined;
let actions: KnowledgeActionController | undefined;
let currentTrace: EvidenceTrace | undefined;
let evidenceNeedsRedraw = false;
let recordTrigger: HTMLElement | undefined;
let comparisonTrigger: HTMLElement | undefined;
let routeController: AbortController | undefined;

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "Not established";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function friendlyStatus(value: unknown): string {
  const labels: Record<string, string> = {
    "official-source": "Taken from the official source",
    normalised: "Deterministically restated from cited source metadata",
    inferred: "Inferred and not an official assertion",
    "model-derived": "Model-derived and not authoritative",
    "digest-bound": "Packaged integrity checks passed",
    "source-linked": "Linked to a digest-bound source record",
    "authored-boundary": "Explicitly authored limitation",
    public: "Public human page recorded",
    restricted: "Restricted",
    "authentication-required": "Authentication required",
    "access-not-established": "Access not established",
    confirmed: "Licence evidence recorded",
    missing: "Licence not established",
    conflicting: "Licence evidence conflicts",
    searchable: "Searchable now",
    "described-only": "Described, not searchable",
    conditional: "Conditional admission",
    quarantined: "Quarantined",
    "contract-only": "Contract reference only",
  };
  return labels[String(value)] ?? String(value).replaceAll("-", " ");
}

function appendLabelList(parent: HTMLElement, values: string[]): void {
  const list = element("ul", undefined, "labels");
  for (const value of values) list.append(element("li", friendlyStatus(value)));
  parent.append(list);
}

function appendDefinitionList(
  parent: HTMLElement,
  entries: Array<[string, unknown]>,
  className = "metadata",
): void {
  const list = element("dl", undefined, className);
  for (const [term, value] of entries) {
    if (value === undefined || value === "") continue;
    const group = className === "summary-list" ? element("div") : undefined;
    const dt = element("dt", term);
    const dd = element("dd", String(value));
    if (group) {
      group.append(dt, dd);
      list.append(group);
    } else {
      list.append(dt, dd);
    }
  }
  parent.append(list);
}

function appendStructuredResult(parent: HTMLElement, label: string, value: JsonObject): void {
  const details = element("details", undefined, "structured");
  details.append(element("summary", label));
  details.append(element("pre", JSON.stringify(value, null, 2)));
  parent.append(details);
}

function renderSearchResult(result: JsonObject): void {
  results.replaceChildren();
  clearSearch.hidden = false;
  if (result.ok !== true) {
    results.append(element("p", String((result.error as JsonObject).message), "error"));
    return;
  }
  const matches = result.results as JsonObject[];
  if (!matches.length) results.append(element("p", "No matching records were found in this bounded catalogue."));
  for (const match of matches) {
    const article = element("article", undefined, "result");
    article.dataset.recordId = String(match.recordId);
    article.dataset.recordDigest = String(match.recordDigest);
    article.dataset.bundleDigest = String(match.bundleDigest);
    const heading = element("h3");
    const link = element("a", String(match.title));
    link.href = String(match.canonicalHumanUrl);
    link.rel = "noopener noreferrer";
    heading.append(link);
    article.append(heading, element("p", String(match.description)));
    appendDefinitionList(article, [
      ["Publisher", match.publisher],
      ["Resource type", friendlyStatus(match.resourceType)],
      ["Access", friendlyStatus(match.accessStatus)],
      ["Licence", `${friendlyStatus(match.licenceStatus)}${match.licenceTitle ? ` — ${String(match.licenceTitle)}` : ""}`],
      ["Observed", formatDate(match.lastObserved)],
    ]);
    appendLabelList(article, match.assertionStatuses as string[]);
    const limitations = element("ul", undefined, "limitations");
    for (const limitation of match.limitations as string[]) limitations.append(element("li", limitation));
    article.append(element("h4", "Limitations"), limitations);
    const inspect = element("button", "View record and provenance", "secondary");
    inspect.type = "button";
    inspect.addEventListener("click", () => void showRecord(String(match.recordId), inspect));
    article.append(inspect);
    results.append(article);
  }
  appendStructuredResult(results, "Structured search result used by the page and tool", result);
}

function renderRecord(result: JsonObject): void {
  recordContent.replaceChildren();
  if (result.ok !== true) {
    recordContent.append(element("p", String((result.error as JsonObject).message), "error"));
    return;
  }
  const record = result.record as JsonObject;
  document.querySelector<HTMLElement>("#record-heading")!.textContent = String(record.title);
  recordContent.append(element("p", String(record.description), "lede-small"));
  const source = element("a", "Open authoritative source");
  source.href = String(record.canonicalHumanUrl);
  source.rel = "noopener noreferrer";
  recordContent.append(source);
  appendDefinitionList(recordContent, [
    ["Record ID", record.id],
    ["Publisher", record.publisher],
    ["Steward", record.steward],
    ["Resource type", friendlyStatus(record.resourceType)],
    ["Source authority", record.sourceAuthority],
    ["Access", friendlyStatus((record.access as JsonObject).status)],
    ["Access evidence", (record.access as JsonObject).note],
    ["Licence", friendlyStatus((record.licence as JsonObject).status)],
    ["Licence title", (record.licence as JsonObject).title],
    ["First published", formatDate((record.dates as JsonObject).firstPublished)],
    ["Modified", formatDate((record.dates as JsonObject).modified)],
    ["Observed", formatDate((record.dates as JsonObject).observed)],
    ["Verification", friendlyStatus(result.verificationStatus)],
  ]);
  recordContent.append(element("h3", "Topics"));
  appendLabelList(recordContent, record.topics as string[]);
  recordContent.append(element("h3", "Field assertions"));
  const assertions = element("ul", undefined, "evidence-list");
  for (const assertion of record.assertions as JsonObject[]) {
    assertions.append(element("li", `${String(assertion.field)} — ${friendlyStatus(assertion.status)}${assertion.note ? `: ${String(assertion.note)}` : ""}`));
  }
  recordContent.append(assertions, element("h3", "Limitations"));
  const limitations = element("ul", undefined, "limitations");
  for (const limitation of record.limitations as string[]) limitations.append(element("li", limitation));
  recordContent.append(limitations);
  const related = result.relatedRecords as JsonObject[];
  if (related.length) {
    recordContent.append(element("h3", "Related records"));
    const list = element("ul");
    for (const item of related) {
      const button = element("button", String(item.title), "text-button");
      button.type = "button";
      button.addEventListener("click", () => void showRecord(String(item.recordId), button));
      const listItem = element("li");
      listItem.append(button);
      list.append(listItem);
    }
    recordContent.append(list);
  }
  appendStructuredResult(recordContent, "Structured record used by the page and tool", result);
}

function renderProvenance(result: JsonObject): void {
  provenanceContent.replaceChildren();
  if (result.ok !== true) {
    provenanceContent.append(element("p", String((result.error as JsonObject).message), "error"));
    return;
  }
  appendDefinitionList(provenanceContent, [
    ["Status", friendlyStatus(result.status)],
    ["Observation date", formatDate(result.observationDate)],
    ["Source lock", result.sourceLock ?? "curated official source record"],
    ["Source digest", result.sourceDigest],
    ["Record digest", result.recordDigest],
    ["Bundle digest", result.bundleDigest],
    ["Receipt digest", (result.evidenceReceipt as JsonObject).receiptDigest],
  ]);
  provenanceContent.append(element("p", "The receipt verifies packaged bytes and bindings. It is not a government signature or a fresh source check.", "hint"));
  appendStructuredResult(provenanceContent, "Structured provenance used by the page and tool", result);
}

function traceNodes(trace: EvidenceTrace): Map<string, EvidenceTraceNode> {
  return new Map(trace.nodes.map((node) => [node.id, node]));
}

function connectedNodes(trace: EvidenceTrace, claimIds: string[]): Set<string> {
  const selected = new Set<string>([trace.id, ...claimIds]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of trace.edges) {
      if (selected.has(edge.target) && !selected.has(edge.source)) {
        selected.add(edge.source);
        changed = true;
      }
    }
  }
  return selected;
}

function selectFoundation(nodeId: string): void {
  if (!currentTrace) return;
  const node = traceNodes(currentTrace).get(nodeId);
  if (!node) return;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".trace-node")) {
    button.setAttribute("aria-pressed", String(button.dataset.nodeId === nodeId));
  }
  foundationDetail.replaceChildren(element("h4", node.label), element("p", node.statement));
  if (node.url) {
    const link = element("a", "Open authoritative source");
    link.href = node.url;
    link.rel = "noopener noreferrer";
    foundationDetail.append(link);
  }
  const facets = node.facets;
  appendDefinitionList(foundationDetail, [
    ["Type", friendlyStatus(node.kind)],
    ["Authority", facets.authority],
    ["Assertion", friendlyStatus(facets.assertionStatus)],
    ["Verification", friendlyStatus(facets.verification)],
    ["Freshness", `${friendlyStatus((facets.freshness as JsonObject).status)}${(facets.freshness as JsonObject).observedAt ? ` — ${formatDate((facets.freshness as JsonObject).observedAt)}` : ""}`],
    ["Integrity", friendlyStatus((facets.integrity as JsonObject).status)],
    ["Access", `${friendlyStatus((facets.access as JsonObject).status)} — ${String((facets.access as JsonObject).note)}`],
    ["Rights", `${friendlyStatus((facets.rights as JsonObject).status)} — ${String((facets.rights as JsonObject).note)}`],
    ["Coverage", `${friendlyStatus((facets.coverage as JsonObject).status)} — ${String((facets.coverage as JsonObject).note)}`],
  ], "summary-list");
}

function nodeButton(node: EvidenceTraceNode): HTMLButtonElement {
  const button = element("button", node.label, "trace-node");
  button.type = "button";
  button.dataset.nodeId = node.id;
  button.dataset.kind = node.kind;
  button.dataset.kindLabel = friendlyStatus(node.kind);
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${friendlyStatus(node.kind)}: ${node.label}. ${node.statement}`);
  button.addEventListener("click", () => selectFoundation(node.id));
  return button;
}

function sourceForClaim(trace: EvidenceTrace, claimId: string, nodes: Map<string, EvidenceTraceNode>): EvidenceTraceNode {
  const edge = trace.edges.find((candidate) =>
    candidate.target === claimId && candidate.relation === "supports" && nodes.get(candidate.source)?.kind === "source");
  return nodes.get(edge!.source)!;
}

function limitationsFor(trace: EvidenceTrace, claimId: string, nodes: Map<string, EvidenceTraceNode>): EvidenceTraceNode[] {
  return trace.edges
    .filter((edge) => edge.relation === "qualifies" && (edge.target === claimId || edge.target === trace.id))
    .map((edge) => nodes.get(edge.source)!)
    .filter((node, index, values) => values.findIndex(({ id }) => id === node.id) === index);
}

function renderRelationshipTable(trace: EvidenceTrace, nodes: Map<string, EvidenceTraceNode>): HTMLElement {
  const wrapper = element("div", undefined, "table-scroll");
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-label", "Evidence Trace relationship table");
  wrapper.tabIndex = 0;
  const table = element("table");
  table.append(element("caption", "Evidence Trace relationships in accessible tabular form"));
  const thead = element("thead");
  const header = element("tr");
  for (const label of ["Foundation", "Relationship", "Supported component"]) {
    const th = element("th", label);
    th.scope = "col";
    header.append(th);
  }
  thead.append(header);
  const tbody = element("tbody");
  for (const edge of trace.edges) {
    const row = element("tr");
    const from = element("th", nodes.get(edge.source)!.label);
    from.scope = "row";
    row.append(from, element("td", edge.label), element("td", nodes.get(edge.target)!.label));
    tbody.append(row);
  }
  table.append(thead, tbody);
  wrapper.append(table);
  return wrapper;
}

function renderEvidenceSkeleton(trace: EvidenceTrace): void {
  currentTrace = trace;
  const nodes = traceNodes(trace);
  const answerNode = nodes.get(trace.id)!;
  document.querySelector("#answer-question")!.textContent = trace.question;
  document.querySelector("#answer-summary")!.replaceChildren(
    element("p", trace.answerSummary, "lede-small"),
    element("p", trace.scope, "limitations"),
  );
  const sourceDates = trace.nodes
    .filter(({ kind }) => kind === "source")
    .map(({ facets }) => (facets.freshness as JsonObject).observedAt)
    .filter((value): value is string => typeof value === "string")
    .sort();
  const mainLimit = trace.nodes
    .filter(({ kind }) => kind === "limitation")
    .sort((left, right) => {
      const leftUses = trace.edges.filter(({ source, relation }) => source === left.id && relation === "qualifies").length;
      const rightUses = trace.edges.filter(({ source, relation }) => source === right.id && relation === "qualifies").length;
      return rightUses - leftUses || left.id.localeCompare(right.id, "en-GB");
    })[0]!;
  const basis = document.querySelector<HTMLElement>("#answer-basis")!;
  basis.replaceChildren();
  for (const [term, value] of [
    ["Evidence collection", `${trace.claimIds.length} selected records from the locked 69-record new-child collection within the 80-record catalogue`],
    ["Observed", sourceDates.length ? formatDate(sourceDates[0]) : "Not established"],
    ["Integrity", `Evidence Trace ${trace.traceDigest.slice(0, 12)}… and each source record are SHA-256 bound`],
    ["Coverage", String((answerNode.facets.coverage as JsonObject).note)],
    ["Main limitation", mainLimit.statement],
  ]) {
    const group = element("div");
    group.append(element("dt", term), element("dd", value));
    basis.append(group);
  }

  analyticalIndex.replaceChildren();
  for (const [index, claimId] of trace.claimIds.entries()) {
    const claim = nodes.get(claimId)!;
    const source = sourceForClaim(trace, claimId, nodes);
    const limitations = limitationsFor(trace, claimId, nodes);
    const item = element("li");
    item.dataset.claimId = claimId;
    const selector = element("div", undefined, "claim-select");
    const checkbox = element("input");
    checkbox.type = "checkbox";
    checkbox.value = claimId;
    checkbox.id = `compare-${claimId.slice(6)}`;
    checkbox.setAttribute("aria-label", `Select claim ${index + 1} for comparison`);
    checkbox.addEventListener("change", updateCompareButton);
    const label = element("label", claim.statement);
    label.htmlFor = checkbox.id;
    selector.append(checkbox, label);
    item.append(selector);
    appendDefinitionList(item, [
      ["Assertion", friendlyStatus(claim.facets.assertionStatus)],
      ["Authoritative source", source.label],
      ["Observed", formatDate((source.facets.freshness as JsonObject).observedAt)],
      ["Integrity", friendlyStatus(claim.facets.verification)],
      ["Access", friendlyStatus((claim.facets.access as JsonObject).status)],
      ["Rights", friendlyStatus((claim.facets.rights as JsonObject).status)],
      ["Principal limitation", limitations[0]?.statement ?? "No explicit limitation was found."],
    ], "summary-list");
    const actionsRow = element("div", undefined, "claim-actions");
    const sourceLink = element("a", `Open authoritative source for claim ${index + 1}`);
    sourceLink.href = source.url!;
    sourceLink.rel = "noopener noreferrer";
    const explore = element("button", `Show foundations for claim ${index + 1}`, "secondary");
    explore.type = "button";
    explore.dataset.claimId = claimId;
    explore.addEventListener("click", async () => {
      if (!actions) return;
      await actions.run("explore_answer_foundations", { answerId: trace.id, claimId }, { origin: "human", present: true });
      history.pushState(null, "", `#answer=${encodeURIComponent(trace.id)}&claim=${encodeURIComponent(claimId)}`);
      status.textContent = `Evidence Trace updated to show foundations for claim ${index + 1}.`;
      document.querySelector<HTMLElement>("#foundation-panel")!.focus();
    });
    actionsRow.append(sourceLink, explore);
    item.append(actionsRow);
    analyticalIndex.append(item);
  }

  traceDiagram.replaceChildren();
  const answer = element("div", undefined, "trace-answer");
  answer.append(nodeButton(answerNode));
  const answerLimitations = limitationsFor(trace, trace.id, nodes);
  for (const limitation of answerLimitations) {
    answer.append(element("span", "Qualified by", "relationship"), nodeButton(limitation));
  }
  const paths = element("ol", undefined, "trace-paths");
  for (const claimId of trace.claimIds) {
    const claim = nodes.get(claimId)!;
    const path = element("li", undefined, "trace-path");
    const claimColumn = element("div");
    claimColumn.append(element("span", "Supports the answer", "relationship"), nodeButton(claim));
    const foundations = element("div", undefined, "trace-foundations");
    for (const edge of trace.edges.filter(({ target }) => target === claimId)) {
      const foundation = nodes.get(edge.source)!;
      const group = element("div");
      group.append(element("span", edge.label, "relationship"), nodeButton(foundation));
      if (foundation.kind === "source") {
        for (const checkEdge of trace.edges.filter(({ target, relation }) => target === foundation.id && relation === "verifies")) {
          group.append(element("span", checkEdge.label, "relationship"), nodeButton(nodes.get(checkEdge.source)!));
        }
      }
      foundations.append(group);
    }
    for (const limitation of limitationsFor(trace, claimId, nodes).filter((candidate) => !answerLimitations.some(({ id }) => id === candidate.id))) {
      const group = element("div");
      group.append(element("span", "qualifies", "relationship"), nodeButton(limitation));
      foundations.append(group);
    }
    path.append(claimColumn, foundations);
    paths.append(path);
  }
  traceDiagram.append(answer, paths);

  evidenceStructured.replaceChildren();
  const details = element("details", undefined, "structured");
  details.append(element("summary", "Evidence relationships table and structured data"));
  details.append(renderRelationshipTable(trace, nodes));
  details.append(element("pre", JSON.stringify(trace, null, 2)));
  evidenceStructured.append(details);
}

function applyEvidenceSelection(claimIds: string[]): void {
  if (!currentTrace) return;
  const path = connectedNodes(currentTrace, claimIds);
  for (const button of document.querySelectorAll<HTMLButtonElement>(".trace-node")) {
    button.classList.toggle("on-selected-path", path.has(button.dataset.nodeId!));
  }
  selectFoundation(claimIds[0] ?? currentTrace.id);
}

function renderEvidenceResult(result: JsonObject): void {
  if (result.ok !== true) {
    // Force a complete redraw after the next valid action. Otherwise an error
    // can replace the summary while the unchanged trace digest suppresses the
    // render that would restore it.
    evidenceNeedsRedraw = true;
    document.querySelector("#answer-summary")!.replaceChildren(element("p", String((result.error as JsonObject).message), "error"));
    return;
  }
  const trace = result.trace as unknown as EvidenceTrace;
  if (evidenceNeedsRedraw || currentTrace?.traceDigest !== trace.traceDigest) {
    renderEvidenceSkeleton(trace);
    evidenceNeedsRedraw = false;
  }
  applyEvidenceSelection((result.selection as JsonObject).claimIds as string[]);
  document.querySelector<HTMLElement>("#answer-panel")!.dataset.traceDigest = trace.traceDigest;
}

function renderComparisonResult(result: JsonObject): void {
  comparisonContent.replaceChildren();
  if (result.ok !== true) {
    comparisonContent.append(element("p", String((result.error as JsonObject).message), "error"));
    comparisonPanel.hidden = false;
    return;
  }
  const rows = result.rows as JsonObject[];
  const comparedClaimIds = result.claimIds as string[];
  for (const checkbox of analyticalIndex.querySelectorAll<HTMLInputElement>("input[type='checkbox']")) {
    checkbox.checked = comparedClaimIds.includes(checkbox.value);
  }
  updateCompareButton();
  applyEvidenceSelection(comparedClaimIds);
  const tableWrapper = element("div", undefined, "table-scroll");
  tableWrapper.setAttribute("role", "region");
  tableWrapper.setAttribute("aria-label", "Evidence foundation comparison");
  tableWrapper.tabIndex = 0;
  const table = element("table", undefined, "comparison-table");
  table.append(element("caption", "Claim foundations compared without a combined trust score"));
  const head = element("thead");
  const headingRow = element("tr");
  const empty = element("th", "Facet");
  empty.scope = "col";
  headingRow.append(empty);
  rows.forEach((row, index) => {
    const th = element("th", `Claim ${index + 1}`);
    th.scope = "col";
    headingRow.append(th);
  });
  head.append(headingRow);
  const body = element("tbody");
  const values: Array<[string, (row: JsonObject) => string]> = [
    ["Claim", (row) => String(row.statement)],
    ["Source", (row) => String((row.source as JsonObject).title)],
    ["Authority", (row) => String((row.facets as JsonObject).authority)],
    ["Assertion", (row) => friendlyStatus((row.facets as JsonObject).assertionStatus)],
    ["Verification", (row) => friendlyStatus((row.facets as JsonObject).verification)],
    ["Freshness", (row) => `${friendlyStatus(((row.facets as JsonObject).freshness as JsonObject).status)} — ${formatDate(((row.facets as JsonObject).freshness as JsonObject).observedAt)}`],
    ["Integrity", (row) => friendlyStatus(((row.facets as JsonObject).integrity as JsonObject).status)],
    ["Access", (row) => friendlyStatus(((row.facets as JsonObject).access as JsonObject).status)],
    ["Rights", (row) => friendlyStatus(((row.facets as JsonObject).rights as JsonObject).status)],
    ["Coverage", (row) => String(((row.facets as JsonObject).coverage as JsonObject).note)],
    ["Limitations", (row) => (row.limitations as JsonObject[]).map(({ statement }) => String(statement)).join(" ")],
  ];
  for (const [label, read] of values) {
    const tr = element("tr");
    const th = element("th", label);
    th.scope = "row";
    tr.append(th, ...rows.map((row) => element("td", read(row))));
    body.append(tr);
  }
  table.append(head, body);
  tableWrapper.append(table);
  comparisonContent.append(tableWrapper);
  appendStructuredResult(comparisonContent, "Structured comparison used by the page and tool", result);
  comparisonPanel.hidden = false;
  comparisonPanel.dataset.traceDigest = String((result.trace as JsonObject).traceDigest);
}

function renderEstate(knowledgeRuntime: TrustedKnowledgeRuntime): void {
  const body = document.querySelector<HTMLTableSectionElement>("#estate-body")!;
  body.replaceChildren();
  for (const admission of knowledgeRuntime.federation.collections) {
    const row = element("tr");
    const heading = element("th");
    heading.scope = "row";
    if (admission.repositoryUrl) {
      const link = element("a", admission.title);
      link.href = admission.repositoryUrl;
      link.rel = "noopener noreferrer";
      heading.append(link);
    } else {
      heading.textContent = admission.title;
    }
    const counts = admission.counts.map((count) =>
      `${Number(count.count).toLocaleString("en-GB")} ${String(count.metric)}`).join("; ") || "Not a corpus";
    const decision = admission.decision;
    row.append(
      heading,
      element("td", friendlyStatus(admission.admissionState)),
      element("td", `${counts}. ${String((admission.population as JsonObject).completenessClaim)}`),
      element("td", `${String((decision.allowedClaims as string[])[0])} Limitation: ${String((decision.limitations as string[])[0])}`),
    );
    body.append(row);
  }
  document.querySelector("#collection-count")!.textContent = `${knowledgeRuntime.federation.searchableCollections} searchable · ${knowledgeRuntime.federation.notSearchableCollections} not searchable`;
  document.querySelector("#federation-digest")!.textContent = knowledgeRuntime.federation.manifestDigest;
}

function updateCompareButton(): void {
  const selected = analyticalIndex.querySelectorAll<HTMLInputElement>("input[type='checkbox']:checked").length;
  compareClaims.disabled = selected < 2 || selected > 4;
  compareClaims.textContent = selected ? `Compare ${selected} selected claims` : "Compare selected claims";
}

function updatePresentationDiagnostics(presentation: ActionPresentation): void {
  document.querySelector("#diagnostic-last-action")!.textContent = `${presentation.origin === "webmcp" ? "WebMCP" : "Human"}: ${presentation.action}`;
  document.querySelector("#diagnostic-input-digest")!.textContent = presentation.inputDigest ?? "Not retained for rejected input";
  document.querySelector("#diagnostic-parity")!.textContent = `Displayed deterministic result ${presentation.resultDigest.slice(0, 12)}…`;
  document.querySelector<HTMLElement>("#webmcp-diagnostics")!.dataset.resultDigest = presentation.resultDigest;
}

function commitPresentation(presentation: ActionPresentation): void {
  switch (presentation.action) {
    case "search_government_knowledge":
      renderSearchResult(presentation.result);
      status.textContent = presentation.result.ok === true
        ? `${String(presentation.result.totalMatches)} matching records; ${String(presentation.result.returned)} shown.`
        : "The search input was rejected.";
      break;
    case "get_resource_record":
      renderRecord(presentation.result);
      break;
    case "show_provenance":
      renderProvenance(presentation.result);
      break;
    case "explore_answer_foundations":
      renderEvidenceResult(presentation.result);
      if (presentation.origin === "webmcp") {
        status.textContent = presentation.result.ok === true
          ? "WebMCP updated the Evidence Trace. No source, storage or external state changed."
          : "The WebMCP evidence request was rejected. No display selection, source, storage or external state changed.";
      }
      break;
    case "compare_evidence_foundations":
      renderComparisonResult(presentation.result);
      if (presentation.origin === "webmcp") {
        status.textContent = presentation.result.ok === true
          ? "WebMCP updated the evidence comparison. No source, storage or external state changed."
          : "The WebMCP comparison request was rejected. No evidence comparison, source, storage or external state changed.";
      }
      break;
  }
  updatePresentationDiagnostics(presentation);
}

async function showRecord(recordId: string, trigger?: HTMLElement, updateHash = true): Promise<void> {
  if (!actions) return;
  if (trigger && !recordPanel.contains(trigger)) recordTrigger = trigger;
  const [recordResult, provenanceResult] = await Promise.all([
    actions.run("get_resource_record", { recordId }, { origin: "human", present: false }),
    actions.run("show_provenance", { recordId }, { origin: "human", present: false }),
  ]);
  renderRecord(recordResult);
  renderProvenance(provenanceResult);
  recordPanel.hidden = false;
  if (updateHash) history.pushState(null, "", `#record=${encodeURIComponent(recordId)}`);
  recordPanel.focus();
}

function closeRecord(updateHash = true, restoreFocus = true): void {
  recordPanel.hidden = true;
  recordContent.replaceChildren();
  provenanceContent.replaceChildren();
  if (updateHash && location.hash.startsWith("#record=")) history.pushState(null, "", location.pathname);
  if (restoreFocus) {
    if (recordTrigger?.isConnected) recordTrigger.focus();
    else query.focus();
  }
  recordTrigger = undefined;
}

function hideComparison(restoreFocus = false, clearSelection = true): void {
  comparisonPanel.hidden = true;
  comparisonContent.replaceChildren();
  if (clearSelection) {
    for (const checkbox of analyticalIndex.querySelectorAll<HTMLInputElement>("input[type='checkbox']")) {
      checkbox.checked = false;
    }
    updateCompareButton();
  }
  if (restoreFocus) {
    const target = comparisonTrigger?.isConnected ? comparisonTrigger : compareClaims;
    target.focus();
  }
  comparisonTrigger = undefined;
}

async function applyHashRoute(): Promise<void> {
  if (!actions || !runtime) return;
  routeController?.abort(new DOMException("A newer route replaced this one.", "AbortError"));
  routeController = new AbortController();
  const signal = routeController.signal;
  let encodedRoute = location.hash.slice(1);
  routeWarning.hidden = true;
  routeWarning.textContent = "";
  if (encodedRoute.length > RAW_HASH_MAX) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    encodedRoute = "";
    routeWarning.textContent = "The requested view was too large to process safely. The default evidence view is shown instead.";
    routeWarning.hidden = false;
  }
  const params = new URLSearchParams(encodedRoute);
  const recordId = params.get("record");
  try {
    if (recordId) {
      hideComparison(false);
      if (!currentTrace) {
        await actions.run(
          "explore_answer_foundations",
          { answerId: runtime.evidence.defaultAnswerId },
          { origin: "human", present: true, signal },
        );
      }
      await showRecord(recordId, undefined, false);
      return;
    }
    closeRecord(false, false);
    const answerId = params.get("answer") ?? runtime.evidence.defaultAnswerId;
    const claimId = params.get("claim");
    const compare = params.get("compare");
    if (compare !== null && compare.length > DECODED_COMPARISON_MAX) {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      routeWarning.textContent = "The requested comparison was too large to process safely. The default evidence view is shown instead.";
      routeWarning.hidden = false;
      hideComparison(false);
      await actions.run(
        "explore_answer_foundations",
        { answerId: runtime.evidence.defaultAnswerId },
        { origin: "human", present: true, signal },
      );
      return;
    }
    if (compare) {
      const claimIds = compare.split(",");
      await actions.run(
        "compare_evidence_foundations",
        { answerId, claimIds: claimIds.length > 4 || claimIds.some((value) => !value) ? [] : claimIds },
        { origin: "human", present: true, signal },
      );
    } else {
      hideComparison(false);
      await actions.run(
        "explore_answer_foundations",
        { answerId, ...(claimId ? { claimId } : {}) },
        { origin: "human", present: true, signal },
      );
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
  }
}

function populateSelect(select: HTMLSelectElement, values: string[]): void {
  for (const value of values) {
    const option = element("option", value);
    option.value = value;
    select.append(option);
  }
}

function updateRegistrationDiagnostics(registration: RegistrationResult): void {
  document.querySelector("#diagnostic-secure-context")!.textContent = globalThis.isSecureContext ? "Yes" : "No";
  document.querySelector("#diagnostic-artefacts")!.textContent = "Catalogue, receipts, Evidence Trace and federation manifest validated";
  document.querySelector("#diagnostic-registration")!.textContent = `${friendlyStatus(registration.state)} — ${registration.reason}`;
  document.querySelector("#diagnostic-tools")!.textContent = `${registration.registeredNames.length} registered of ${registration.expectedNames.length} expected: ${registration.expectedNames.join(", ")}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!actions) return;
  const input: JsonObject = { query: query.value, limit: Number(resultLimit.value) };
  if (resourceType.value) input.resourceTypes = [resourceType.value];
  if (publisher.value) input.publishers = [publisher.value];
  if (accessStatus.value) input.accessStatuses = [accessStatus.value];
  await actions.run("search_government_knowledge", input, { origin: "human", present: true });
});

clearSearch.addEventListener("click", () => {
  form.reset();
  results.replaceChildren(element("p", "No search has been run."));
  clearSearch.hidden = true;
  query.focus();
});

compareClaims.addEventListener("click", async () => {
  if (!actions || !currentTrace) return;
  const claimIds = [...analyticalIndex.querySelectorAll<HTMLInputElement>("input[type='checkbox']:checked")].map(({ value }) => value);
  comparisonTrigger = compareClaims;
  await actions.run("compare_evidence_foundations", { answerId: currentTrace.id, claimIds }, { origin: "human", present: true });
  history.pushState(null, "", `#answer=${encodeURIComponent(currentTrace.id)}&compare=${encodeURIComponent(claimIds.join(","))}`);
  status.textContent = `Evidence comparison updated for ${claimIds.length} selected claims.`;
  comparisonPanel.focus();
});

document.querySelector<HTMLButtonElement>("#close-comparison")!.addEventListener("click", () => {
  hideComparison(true, false);
  if (currentTrace) history.pushState(null, "", `#answer=${encodeURIComponent(currentTrace.id)}`);
});
document.querySelector<HTMLButtonElement>("#close-record")!.addEventListener("click", () => closeRecord());

window.addEventListener("hashchange", () => void applyHashRoute());

try {
  const initialised = await initialiseKnowledgeDiscovery(commitPresentation);
  runtime = initialised.runtime;
  actions = initialised.actions;
  renderEstate(runtime);
  populateSelect(resourceType, runtime.facets.resourceTypes);
  populateSelect(publisher, runtime.facets.publishers);
  populateSelect(accessStatus, runtime.facets.accessStatuses);
  for (const control of [query, submit, resourceType, publisher, accessStatus, resultLimit]) control.disabled = false;
  document.querySelector("#record-count")!.textContent = String(runtime.recordCount);
  document.querySelector("#bundle-digest")!.textContent = runtime.bundleDigest.slice(0, 12);
  document.querySelector("#tool-status")!.textContent = "Human interface ready";
  status.textContent = "All knowledge artefacts verified. The human interface is ready while WebMCP registration is checked.";
  document.querySelector("#diagnostic-secure-context")!.textContent = globalThis.isSecureContext ? "Yes" : "No";
  document.querySelector("#diagnostic-artefacts")!.textContent = "Catalogue, receipts, Evidence Trace and federation manifest validated";
  document.querySelector("#diagnostic-registration")!.textContent = "Registration check in progress; human controls are already available";
  void initialised.registration.then((registration) => {
    document.querySelector("#tool-status")!.textContent = registration.state === "registered" ? "5 WebMCP tools" : "Human interface";
    status.textContent = registration.state === "registered"
      ? "All knowledge artefacts verified. Human search and 5 WebMCP tools are ready."
      : `All knowledge artefacts verified. The human interface is ready. ${registration.reason}`;
    updateRegistrationDiagnostics(registration);
  });

  await applyHashRoute();
  document.documentElement.dataset.applicationState = "ready";
} catch (error) {
  document.documentElement.dataset.applicationState = "failed";
  status.textContent = `Search unavailable: ${error instanceof Error ? error.message : "knowledge artefact validation failed."}`;
  document.querySelector("#record-count")!.textContent = "Unavailable";
  document.querySelector("#bundle-digest")!.textContent = "Validation failed";
  document.querySelector("#collection-count")!.textContent = "Unavailable";
  document.querySelector("#tool-status")!.textContent = "Unavailable";
  document.querySelector("#diagnostic-artefacts")!.textContent = "Validation failed";
  document.querySelector("#diagnostic-registration")!.textContent = "No tools registered";
}
