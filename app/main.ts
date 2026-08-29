import {
  initialiseKnowledgeDiscovery,
  type JsonObject,
  type KnowledgeDiscoveryRuntime,
} from "../src/webmcp-tools.js";

const form = document.querySelector<HTMLFormElement>("#search-form")!;
const query = document.querySelector<HTMLInputElement>("#query")!;
const submit = document.querySelector<HTMLButtonElement>("button[type='submit']")!;
const status = document.querySelector<HTMLElement>("#status")!;
const results = document.querySelector<HTMLElement>("#results")!;
let runtime: KnowledgeDiscoveryRuntime | undefined;

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSearchResult(result: JsonObject): void {
  results.replaceChildren();
  if (result.ok !== true) {
    const error = result.error as JsonObject;
    results.append(element("p", String(error.message)));
    return;
  }

  const matches = result.results as JsonObject[];
  if (!matches.length) results.append(element("p", "No matching records were found."));
  for (const match of matches) {
    const article = element("article");
    article.className = "result";
    article.dataset.recordId = String(match.recordId);
    article.dataset.recordDigest = String(match.recordDigest);
    article.dataset.bundleDigest = String(match.bundleDigest);

    const heading = element("h3");
    const link = element("a", String(match.title));
    link.href = String(match.canonicalHumanUrl);
    link.rel = "noopener noreferrer";
    heading.append(link);
    article.append(heading, element("p", String(match.description)));
    article.append(element("p", `Publisher: ${String(match.publisher)}`));
    article.append(element("p", `Access: ${String(match.accessStatus)} — ${String(match.accessNote)}`));
    article.append(element("p", `Licence: ${String(match.licenceStatus)} — ${String(match.licenceTitle ?? "not established")}`));

    const assertionHeading = element("h4", "Assertion status");
    const assertions = element("ul");
    assertions.className = "labels";
    for (const assertion of match.assertionStatuses as string[]) {
      assertions.append(element("li", assertion));
    }
    article.append(assertionHeading, assertions, element("h4", "Limitations"));
    const limitations = element("ul");
    for (const limitation of match.limitations as string[]) {
      limitations.append(element("li", limitation));
    }
    article.append(limitations);
    results.append(article);
  }

  const details = element("details");
  details.append(element("summary", "Structured result used by the page and tool"));
  const raw = element("pre", JSON.stringify(result, null, 2));
  raw.id = "structured-result";
  details.append(raw);
  results.append(details);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!runtime) return;
  const result = await runtime.search({ query: query.value });
  renderSearchResult(result);
  status.textContent = result.ok === true
    ? `${String(result.totalMatches)} matching record found.`
    : "The search input was rejected.";
});

try {
  const initialised = await initialiseKnowledgeDiscovery();
  runtime = initialised.runtime;
  query.disabled = false;
  submit.disabled = false;
  status.textContent = initialised.registration === "registered"
    ? "Fixture verified. Human search and WebMCP search are ready."
    : "Fixture verified. Human search is ready; WebMCP is not available in this browser.";
} catch (error) {
  status.textContent = `Search unavailable: ${error instanceof Error ? error.message : "fixture validation failed."}`;
}
