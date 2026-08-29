import { readFile } from "node:fs/promises";

const catalogue = JSON.parse(await readFile("app/data/catalogue.json", "utf8"));
const fields = new Map();

function add(url, recordId, field) {
  if (!url) return;
  const uses = fields.get(url) ?? [];
  uses.push({ recordId, field });
  fields.set(url, uses);
}

for (const record of catalogue.records) {
  add(record.canonicalHumanUrl, record.id, "canonicalHumanUrl");
  add(record.documentationUrl, record.id, "documentationUrl");
  add(record.apiCatalogueUrl, record.id, "apiCatalogueUrl");
  add(record.licence?.url, record.id, "licence.url");
  add(record.access?.evidenceUrl, record.id, "access.evidenceUrl");
  for (const source of record.provenance.sources) add(source.url, record.id, "provenance.sources.url");
  for (const assertion of record.assertions) {
    for (const url of assertion.evidenceUrls) add(url, record.id, "assertions.evidenceUrls");
  }
}

const allowed = (url) => {
  const host = new URL(url).hostname;
  return host === "gov.uk" || host.endsWith(".gov.uk") || host === "data.police.uk";
};

async function check([url, uses]) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    if (!allowed(url)) throw new Error("URL is outside the admitted official-host boundary");
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "govuk-webmcp-link-audit/0.1 (+https://github.com/chris-page-gov/govuk-webmcp)" },
    });
    return {
      url,
      uses,
      outcome: response.status >= 200 && response.status < 400 ? "reachable" : "attention",
      status: response.status,
      redirectLocation: response.headers.get("location"),
    };
  } catch (error) {
    return { url, uses, outcome: "attention", error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

const queue = [...fields.entries()].sort(([left], [right]) => left.localeCompare(right));
const results = [];
const worker = async () => {
  while (queue.length) {
    const item = queue.shift();
    if (item) results.push(await check(item));
  }
};
await Promise.all(Array.from({ length: 8 }, worker));
results.sort((left, right) => left.url.localeCompare(right.url));

const observations = catalogue.records.map((record) => record.dates.observed).sort();
const report = {
  schema: "trusted-govuk-discovery.link-health.v1",
  checkedAt: new Date().toISOString(),
  method: "One bounded HEAD request per unique admitted official URL; redirects are recorded but not followed.",
  limitations: [
    "A successful response does not establish access rights, licence status, content accuracy or future availability.",
    "Some working services reject or throttle HEAD requests; attention is not proof that a link is broken.",
  ],
  catalogue: {
    recordCount: catalogue.records.length,
    bundleDigest: catalogue.bundleDigest,
    oldestObservation: observations.at(0),
    newestObservation: observations.at(-1),
  },
  summary: {
    uniqueUrls: results.length,
    reachable: results.filter(({ outcome }) => outcome === "reachable").length,
    attention: results.filter(({ outcome }) => outcome === "attention").length,
  },
  results,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
