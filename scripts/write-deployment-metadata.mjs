import { mkdir, writeFile } from "node:fs/promises";

const commit = process.env.GITHUB_SHA;
const runId = process.env.GITHUB_RUN_ID;
const repository = process.env.GITHUB_REPOSITORY;

if (!commit || !/^[a-f0-9]{40}$/u.test(commit) || !runId || !/^\d+$/u.test(runId) || !repository) {
  throw new Error("GitHub deployment metadata is incomplete or invalid.");
}

await mkdir("dist", { recursive: true });
await writeFile("dist/deployment.json", `${JSON.stringify({
  schema: "trusted-govuk-discovery.deployment.v1",
  repository,
  commit,
  runId,
}, null, 2)}\n`);
