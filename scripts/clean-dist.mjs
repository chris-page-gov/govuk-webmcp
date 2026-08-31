#!/usr/bin/env node

import { lstat, rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));

export async function cleanDist(repositoryRoot = DEFAULT_REPOSITORY_ROOT) {
  const root = resolve(repositoryRoot);
  const target = resolve(root, "dist");
  if (relative(root, target) !== "dist" || target === root || target === resolve(sep)) {
    throw new Error("The build clean target must be the repository's exact dist directory.");
  }
  try {
    const stat = await lstat(target);
    if (stat.isSymbolicLink()) throw new Error("The build clean target must not be a symbolic link.");
    if (!stat.isDirectory()) throw new Error("The build clean target must be a directory when it exists.");
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  await rm(target, { recursive: true, force: true });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  cleanDist().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
