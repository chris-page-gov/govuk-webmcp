let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const sbom = JSON.parse(raw);
const personalMetadataKeys = new Set(["author", "authors", "contributors", "maintainers"]);

function removePersonalMetadata(value) {
  if (Array.isArray(value)) {
    for (const item of value) removePersonalMetadata(item);
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (personalMetadataKeys.has(key)) delete value[key];
    else removePersonalMetadata(value[key]);
  }
}

removePersonalMetadata(sbom);
process.stdout.write(`${JSON.stringify(sbom, null, 2)}\n`);
