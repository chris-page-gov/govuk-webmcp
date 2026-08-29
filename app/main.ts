import {
  initialiseKnowledgeDiscovery,
  type JsonObject,
  type KnowledgeDiscoveryRuntime,
} from "../src/webmcp-tools.js";

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
let runtime: KnowledgeDiscoveryRuntime | undefined;

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

function appendLabelList(parent: HTMLElement, values: string[]): void {
  const list = element("ul", undefined, "labels");
  for (const value of values) list.append(element("li", value));
  parent.append(list);
}

function appendDefinitionList(parent: HTMLElement, entries: Array<[string, unknown]>): void {
  const list = element("dl", undefined, "metadata");
  for (const [term, value] of entries) {
    if (value === undefined || value === "") continue;
    list.append(element("dt", term), element("dd", String(value)));
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
    const error = result.error as JsonObject;
    results.append(element("p", String(error.message), "error"));
    return;
  }

  const matches = result.results as JsonObject[];
  if (!matches.length) {
    results.append(element("p", "No matching records were found in this bounded catalogue."));
  }
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
      ["Resource type", match.resourceType],
      ["Access", match.accessStatus],
      ["Licence", `${String(match.licenceStatus)}${match.licenceTitle ? ` — ${String(match.licenceTitle)}` : ""}`],
      ["Observed", match.lastObserved],
    ]);
    appendLabelList(article, match.assertionStatuses as string[]);
    const limitations = element("ul", undefined, "limitations");
    for (const limitation of match.limitations as string[]) limitations.append(element("li", limitation));
    article.append(element("h4", "Limitations"), limitations);
    const inspect = element("button", "View record and provenance", "secondary");
    inspect.type = "button";
    inspect.addEventListener("click", () => void showRecord(String(match.recordId)));
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
  const heading = document.querySelector<HTMLElement>("#record-heading")!;
  heading.textContent = String(record.title);
  recordContent.append(element("p", String(record.description), "lede-small"));
  const source = element("a", "Open authoritative source");
  source.href = String(record.canonicalHumanUrl);
  source.rel = "noopener noreferrer";
  recordContent.append(source);
  appendDefinitionList(recordContent, [
    ["Record ID", record.id],
    ["Publisher", record.publisher],
    ["Steward", record.steward],
    ["Resource type", record.resourceType],
    ["Source authority", record.sourceAuthority],
    ["Access", (record.access as JsonObject).status],
    ["Access evidence", (record.access as JsonObject).note],
    ["Licence", (record.licence as JsonObject).status],
    ["Licence title", (record.licence as JsonObject).title],
    ["First published", (record.dates as JsonObject).firstPublished],
    ["Modified", (record.dates as JsonObject).modified],
    ["Observed", (record.dates as JsonObject).observed],
    ["Verification", result.verificationStatus],
  ]);
  recordContent.append(element("h3", "Topics"));
  appendLabelList(recordContent, record.topics as string[]);
  recordContent.append(element("h3", "Field assertions"));
  const assertions = element("ul", undefined, "evidence-list");
  for (const assertion of record.assertions as JsonObject[]) {
    assertions.append(element("li", `${String(assertion.field)} — ${String(assertion.status)}${assertion.note ? `: ${String(assertion.note)}` : ""}`));
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
      button.addEventListener("click", () => void showRecord(String(item.recordId)));
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
    ["Status", result.status],
    ["Observation date", result.observationDate],
    ["Source lock", result.sourceLock ?? "curated official source record"],
    ["Source digest", result.sourceDigest],
    ["Record digest", result.recordDigest],
    ["Bundle digest", result.bundleDigest],
    ["Receipt digest", ((result.evidenceReceipt as JsonObject).receiptDigest)],
  ]);
  provenanceContent.append(element("p", "The receipt verifies packaged bytes and bindings. It is not a government signature or a fresh source check.", "hint"));
  appendStructuredResult(provenanceContent, "Structured provenance used by the page and tool", result);
}

async function showRecord(recordId: string, updateHash = true): Promise<void> {
  if (!runtime) return;
  const [recordResult, provenanceResult] = await Promise.all([
    runtime.getRecord({ recordId }),
    runtime.showProvenance({ recordId }),
  ]);
  renderRecord(recordResult);
  renderProvenance(provenanceResult);
  recordPanel.hidden = false;
  if (updateHash) history.pushState(null, "", `#record=${encodeURIComponent(recordId)}`);
  recordPanel.focus();
}

function closeRecord(updateHash = true): void {
  recordPanel.hidden = true;
  recordContent.replaceChildren();
  provenanceContent.replaceChildren();
  if (updateHash && location.hash.startsWith("#record=")) history.pushState(null, "", location.pathname);
}

function populateSelect(select: HTMLSelectElement, values: string[]): void {
  for (const value of values) {
    const option = element("option", value);
    option.value = value;
    select.append(option);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!runtime) return;
  const input: JsonObject = { query: query.value, limit: Number(resultLimit.value) };
  if (resourceType.value) input.resourceTypes = [resourceType.value];
  if (publisher.value) input.publishers = [publisher.value];
  if (accessStatus.value) input.accessStatuses = [accessStatus.value];
  const result = await runtime.search(input);
  renderSearchResult(result);
  status.textContent = result.ok === true
    ? `${String(result.totalMatches)} matching records; ${String(result.returned)} shown.`
    : "The search input was rejected.";
});

clearSearch.addEventListener("click", () => {
  form.reset();
  results.replaceChildren(element("p", "No search has been run."));
  clearSearch.hidden = true;
  query.focus();
});
document.querySelector<HTMLButtonElement>("#close-record")!.addEventListener("click", () => closeRecord());
window.addEventListener("hashchange", () => {
  const match = location.hash.match(/^#record=(.+)$/u);
  if (match) void showRecord(decodeURIComponent(match[1]!), false);
  else closeRecord(false);
});

try {
  const initialised = await initialiseKnowledgeDiscovery();
  runtime = initialised.runtime;
  populateSelect(resourceType, runtime.facets.resourceTypes);
  populateSelect(publisher, runtime.facets.publishers);
  populateSelect(accessStatus, runtime.facets.accessStatuses);
  for (const control of [query, submit, resourceType, publisher, accessStatus, resultLimit]) control.disabled = false;
  document.querySelector("#record-count")!.textContent = String(runtime.recordCount);
  document.querySelector("#bundle-digest")!.textContent = runtime.bundleDigest.slice(0, 12);
  document.querySelector("#tool-status")!.textContent = initialised.registration === "registered" ? "3 WebMCP tools" : "Human interface";
  status.textContent = initialised.registration === "registered"
    ? "Catalogue and receipts verified. Human search and 3 WebMCP tools are ready."
    : "Catalogue and receipts verified. The human interface is ready; WebMCP is not available in this browser.";
  const match = location.hash.match(/^#record=(.+)$/u);
  if (match) await showRecord(decodeURIComponent(match[1]!), false);
  document.documentElement.dataset.applicationState = "ready";
} catch (error) {
  document.documentElement.dataset.applicationState = "failed";
  status.textContent = `Search unavailable: ${error instanceof Error ? error.message : "catalogue validation failed."}`;
  document.querySelector("#record-count")!.textContent = "Unavailable";
  document.querySelector("#bundle-digest")!.textContent = "Validation failed";
  document.querySelector("#tool-status")!.textContent = "Unavailable";
}
