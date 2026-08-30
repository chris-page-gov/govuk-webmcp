import { createHash } from "node:crypto";
import { lstat, readdir, readFile, realpath, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, posix, relative, resolve, sep, win32 } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = "docs/competition/evidence/SHA256SUMS";
const registryPath = "docs/competition/evidence-manifest-registry.json";

function bytewise(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function safePath(path) {
  if (isAbsolute(path) || win32.isAbsolute(path) || path.includes("\\")) return false;
  if (posix.normalize(path) !== path) return false;
  return !path.split("/").some((part) => part === "." || part === ".." || part === "");
}

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(resolve(repositoryRoot, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Evidence inputs cannot be symbolic links: ${path}`);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile() && !path.endsWith("/.DS_Store")) files.push(path);
    else if (!entry.isFile()) throw new Error(`Evidence input must be a regular file: ${path}`);
  }
  return files;
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function validateRegistry(registry) {
  invariant(registry && typeof registry === "object" && !Array.isArray(registry), "Evidence-manifest registry must be an object");
  const keys = Object.keys(registry).sort(bytewise);
  invariant(JSON.stringify(keys) === JSON.stringify(["files", "purpose", "schema", "status"]), "Evidence-manifest registry has unknown or missing fields");
  invariant(registry.schema === "trusted-govuk-discovery.evidence-manifest-registry.v1", "Evidence-manifest registry has the wrong schema");
  invariant(registry.status === "reviewed-allowlist-for-local-release-evidence", "Evidence-manifest registry must retain its reviewed local-evidence boundary");
  invariant(typeof registry.purpose === "string" && registry.purpose.length > 0 && registry.purpose.length <= 500, "Evidence-manifest registry purpose is invalid");
  invariant(Array.isArray(registry.files) && registry.files.length > 0, "Evidence-manifest registry must name files");
  for (const path of registry.files) invariant(safePath(path) && path.startsWith("docs/competition/evidence/") && path !== manifestPath, `Evidence-manifest registry path is unsafe: ${path}`);
  invariant(new Set(registry.files).size === registry.files.length, "Evidence-manifest registry paths must be unique");
  invariant(JSON.stringify(registry.files) === JSON.stringify([...registry.files].sort(bytewise)), "Evidence-manifest registry paths must be bytewise ordered");
  return registry.files;
}

async function main() {
  const registry = JSON.parse(await readFile(resolve(repositoryRoot, registryPath), "utf8"));
  const registeredEvidence = validateRegistry(registry);
  const discoveredEvidence = (await listFiles("docs/competition/evidence")).filter((path) => path !== manifestPath).sort(bytewise);
  invariant(JSON.stringify(discoveredEvidence) === JSON.stringify(registeredEvidence), "Evidence-manifest registry must explicitly admit every evidence file and reject unregistered files");
  const paths = [
    ...await listFiles("app/data"),
    ...registeredEvidence,
    "package-lock.json",
    ...await listFiles("schemas"),
  ].sort(bytewise);

  if (new Set(paths).size !== paths.length) throw new Error("Evidence manifest paths must be unique");
  const rootReal = await realpath(repositoryRoot);
  const lines = [];
  for (const path of paths) {
    if (!safePath(path)) throw new Error(`Unsafe evidence manifest path: ${path}`);
    const absolute = resolve(repositoryRoot, path);
    const information = await lstat(absolute);
    if (!information.isFile() || information.isSymbolicLink()) {
      throw new Error(`Evidence input must be a regular non-symbolic-link file: ${path}`);
    }
    const resolved = await realpath(absolute);
    const fromRoot = relative(rootReal, resolved);
    if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
      throw new Error(`Evidence input resolves outside the repository: ${path}`);
    }
    const digest = createHash("sha256").update(await readFile(resolved)).digest("hex");
    lines.push(`${digest}  ${path}`);
  }
  await writeFile(resolve(repositoryRoot, manifestPath), `${lines.join("\n")}\n`, "utf8");
  process.stdout.write(`Wrote ${paths.length} evidence manifest entries.\n`);
}

await main();
