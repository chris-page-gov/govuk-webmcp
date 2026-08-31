import { cp, lstat, mkdir, readdir, rm, unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));

async function removeFinderMetadata(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.name === ".DS_Store") {
      const stat = await lstat(path);
      if (stat.isDirectory() && !stat.isSymbolicLink()) {
        throw new Error("A Finder metadata path in dist is unexpectedly a directory.");
      }
      await unlink(path);
    } else if (entry.isDirectory() && !entry.isSymbolicLink()) {
      await removeFinderMetadata(path);
    }
  }
}

export async function copyStatic(options = {}) {
  const repositoryRoot = resolve(options.repositoryRoot ?? DEFAULT_REPOSITORY_ROOT);
  const appRoot = resolve(options.appRoot ?? repositoryRoot, options.appRoot ? "" : "app");
  const distRoot = resolve(options.distRoot ?? repositoryRoot, options.distRoot ? "" : "dist");
  await mkdir(resolve(distRoot, "data"), { recursive: true });
  for (const path of ["index.html", "style.css", "favicon.svg", "startup-watchdog.js"]) {
    await cp(resolve(appRoot, path), resolve(distRoot, path));
  }
  for (const path of [
    "catalogue.json", "catalogue.json.sha256", "receipts.json", "receipts.json.sha256",
    "evidence-traces.json", "evidence-traces.json.sha256", "federation.json", "federation.json.sha256",
  ]) {
    await cp(resolve(appRoot, "data", path), resolve(distRoot, "data", path));
  }
  const federatedDestination = resolve(distRoot, "data", "federated-search");
  await rm(federatedDestination, { recursive: true, force: true });
  await cp(resolve(appRoot, "data", "federated-search"), federatedDestination, {
    recursive: true,
    filter: (source) => basename(source) !== ".DS_Store",
  });
  await removeFinderMetadata(distRoot);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  copyStatic().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
