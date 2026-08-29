import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const source = JSON.parse(await readFile("app/data/catalogue.fixture.json", "utf8"));
const recordDigests = [];

for (const record of source.records) {
  const recordDigest = sha256(canonicalJson(record));
  recordDigests.push(recordDigest);
  record.provenance.recordDigest = recordDigest;
}
const bundleDigest = sha256(canonicalJson({
  schema: "trusted-govuk-discovery.bundle-root.v1",
  recordDigests: recordDigests.sort(),
}));
source.bundleDigest = bundleDigest;
for (const record of source.records) {
  record.provenance.bundleDigest = bundleDigest;
  record.provenance.evidenceReceiptId =
    `trusted-govuk-discovery:evidence-receipt:sha256:${record.provenance.recordDigest}`;
}

const output = `${JSON.stringify(source, null, 2)}\n`;
await writeFile("app/data/catalogue.json", output);
await writeFile(
  "app/data/catalogue.json.sha256",
  `${sha256(output)}  catalogue.json\n`,
);
