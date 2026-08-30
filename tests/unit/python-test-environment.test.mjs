import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const wrapperPath = "scripts/verify-research-pack.sh";
const expectedRequirements = [
  "jsonschema==4.26.0",
  "attrs==26.1.0",
  "jsonschema-specifications==2025.9.1",
  "referencing==0.37.0",
  "rpds-py==2026.6.3",
  "typing-extensions==4.15.0",
];

async function makeFixture(t, { venvVersion, pathVersion } = {}) {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "govuk-webmcp-python-env-"));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));

  const repositoryRoot = join(fixtureRoot, "repository");
  const scriptDirectory = join(repositoryRoot, "scripts");
  const fakeBin = join(fixtureRoot, "bin");
  await mkdir(scriptDirectory, { recursive: true });
  await mkdir(fakeBin, { recursive: true });
  await writeFile(
    join(repositoryRoot, "requirements-dev.txt"),
    `${expectedRequirements.join("\n")}\n`,
  );
  await writeFile(
    join(scriptDirectory, "verify-research-pack.sh"),
    await readFile(wrapperPath),
  );
  await chmod(join(scriptDirectory, "verify-research-pack.sh"), 0o755);

  if (venvVersion !== undefined) {
    const venvBin = join(repositoryRoot, ".venv", "bin");
    await mkdir(venvBin, { recursive: true });
    await writeFakePython(join(venvBin, "python"), venvVersion, "venv");
  }
  if (pathVersion !== undefined) {
    await writeFakePython(join(fakeBin, "python3"), pathVersion, "path");
  }

  return {
    fakeBin,
    repositoryRoot,
    wrapper: join(scriptDirectory, "verify-research-pack.sh"),
  };
}

async function writeFakePython(path, version, marker) {
  const versionCommand = version === null
    ? "exit 1"
    : `printf '%s\\n' '${version}'`;
  await writeFile(path, `#!/bin/sh
if [ "$1" = "-c" ]; then
  ${versionCommand}
  exit 0
fi
printf '%s\\n' '${marker}'
`);
  await chmod(path, 0o755);
}

async function runWrapper(fixture) {
  return new Promise((resolve, reject) => {
    const child = spawn(fixture.wrapper, [], {
      cwd: fixture.repositoryRoot,
      env: {
        ...process.env,
        PATH: `${fixture.fakeBin}:/usr/bin:/bin`,
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stderr, stdout }));
  });
}

test("pins the installed jsonschema dependency graph exactly", async () => {
  const requirements = (await readFile("requirements-dev.txt", "utf8"))
    .split("\n")
    .filter((line) => line && !line.startsWith("#"));
  assert.deepEqual(requirements, expectedRequirements);
  assert.ok(requirements.every((requirement) => /^[a-z-]+==[0-9][0-9.]+$/u.test(requirement)));
});

test("wires the pinned environment into local and CI verification", async () => {
  const packageValue = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(packageValue.scripts["research:verify"], "bash scripts/verify-research-pack.sh");
  assert.match(packageValue.scripts["python:setup"], /requirements-dev\.txt/u);
  assert.match(packageValue.scripts["python:setup"], /--only-binary=:all: --no-deps/u);
  assert.match(packageValue.scripts["python:setup"], /python -m pip check/u);

  for (const path of [".github/workflows/ci.yml", ".github/workflows/pages.yml"]) {
    const workflow = await readFile(path, "utf8");
    assert.match(workflow, /python -m pip install .*--requirement requirements-dev\.txt/u);
    assert.match(workflow, /npm ci --ignore-scripts --no-audit/u);
    assert.ok(
      workflow.indexOf("--requirement requirements-dev.txt") < workflow.indexOf("npm test"),
      `${path} must install the pinned Python verifier before running npm test.`,
    );
  }
});

test("uses the repository virtual environment before PATH", async (t) => {
  const fixture = await makeFixture(t, {
    pathVersion: "4.26.0",
    venvVersion: "4.26.0",
  });
  const result = await runWrapper(fixture);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout, "venv\n");
});

test("falls back to python3 on PATH", async (t) => {
  const fixture = await makeFixture(t, { pathVersion: "4.26.0" });
  const result = await runWrapper(fixture);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.stdout, "path\n");
});

test("rejects the wrong jsonschema version", async (t) => {
  const fixture = await makeFixture(t, { venvVersion: "4.25.1" });
  const result = await runWrapper(fixture);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /4\.25\.1 is installed; 4\.26\.0 is required/u);
});

test("rejects an environment without jsonschema", async (t) => {
  const fixture = await makeFixture(t, { venvVersion: null });
  const result = await runWrapper(fixture);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /jsonschema 4\.26\.0 is required but is not installed/u);
});
