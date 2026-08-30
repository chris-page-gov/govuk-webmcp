import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

export async function writeJsonWithChecksum(path, value) {
  const output = `${JSON.stringify(value, null, 2)}\n`;
  const checksumPath = `${path}.sha256`;
  const temporaryOutput = `${path}.tmp-${process.pid}`;
  const temporaryChecksum = `${checksumPath}.tmp-${process.pid}`;
  await writeFile(temporaryOutput, output);
  await writeFile(temporaryChecksum, `${sha256(output)}  ${path.split("/").at(-1)}\n`);
  await rename(temporaryOutput, path);
  await rename(temporaryChecksum, checksumPath);
}
