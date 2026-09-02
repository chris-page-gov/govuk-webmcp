import assert from "node:assert/strict";
import { chmod, link, lstat, mkdir, mkdtemp, open, readFile, readdir, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import test from "node:test";

import {
  applyWebmcpEvalsBrowserStepLimitPatch,
  patchBrowserStepLimitSource,
  replaceWithExclusiveStage,
} from "../../scripts/apply-webmcp-evals-browser-step-limit-patch.mjs";

const backendPath = "node_modules/webmcp-evals/dist/backends/vercel.js";

async function findRecoveryCopy(root, target, expectedBytes) {
  const prefix = `${basename(target)}.recovery-`;
  for (const name of await readdir(root)) {
    if (!name.startsWith(prefix)) continue;
    const path = resolve(root, name);
    if (await readFile(path, "utf8") === expectedBytes) return path;
  }
  assert.fail(`No recovery copy for ${basename(target)} contained the expected bytes.`);
}

test("the reviewed webmcp-evals browser patch binds the configured step limit", async () => {
  const patchedSource = await readFile(backendPath, "utf8");
  const verified = patchBrowserStepLimitSource(patchedSource);
  assert.equal(verified.changed, false);
  assert.match(
    patchedSource,
    /const agentWithExec = new ToolLoopAgent\(\{[\s\S]*?stopWhen: stepCountIs\(this\.maxSteps\),/u,
  );

  const originalSource = patchedSource.replace(
    "                stopWhen: stepCountIs(this.maxSteps),\n",
    "",
  );
  const reapplied = patchBrowserStepLimitSource(originalSource);
  assert.equal(reapplied.changed, true);
  assert.equal(reapplied.source, patchedSource);
});

test("the dependency patch removes an owned partial stage and preserves an EEXIST collision", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-stage-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  await writeFile(target, "original\n");

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => "partial",
    writeFileImplementation: async (path) => {
      await writeFile(path, "partial", { flag: "wx" });
      const error = new Error("synthetic dependency partial-write failure");
      error.code = "ENOSPC";
      throw error;
    },
  }), /synthetic dependency partial-write failure/u);
  assert.deepEqual((await readdir(root)).sort(), ["vercel.js"]);

  const collision = `${target}.tmp-${process.pid}-collision`;
  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => "collision",
    writeFileImplementation: async (path) => {
      await writeFile(path, "pre-existing collision\n", { flag: "wx" });
      const error = new Error("synthetic dependency EEXIST collision");
      error.code = "EEXIST";
      throw error;
    },
  }), /synthetic dependency EEXIST collision/u);
  assert.equal(await readFile(collision, "utf8"), "pre-existing collision\n");
  assert.equal(await readFile(target, "utf8"), "original\n");

  const originalState = await lstat(target);
  let replaced = false;
  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => "late-writer",
    expectedDestination: {
      device: originalState.dev,
      inode: originalState.ino,
      sha256: "25718360e05d3c2d0963d1381e9dd4dae5fca789244ee4b9f861adcc0cc96218",
    },
    lstatImplementation: async (path) => {
      if (!replaced && path === target) {
        replaced = true;
        await rm(target);
        await writeFile(target, "late writer\n", { flag: "wx" });
      }
      return lstat(path);
    },
  }), /browser backend before replacement changed identity/u);
  assert.equal(await readFile(target, "utf8"), "late writer\n");
});

test("the dependency patch preserves a writer that appears at the final promotion seam", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-promotion-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  await writeFile(target, "original\n");
  const originalState = await lstat(target);
  let injected = false;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => "promotion-race",
    expectedDestination: {
      device: originalState.dev,
      inode: originalState.ino,
      sha256: "25718360e05d3c2d0963d1381e9dd4dae5fca789244ee4b9f861adcc0cc96218",
    },
    linkImplementation: async (source, destination) => {
      if (!injected && destination === target && source.includes(".tmp-")) {
        injected = true;
        await writeFile(target, "late writer\n", { flag: "wx" });
      }
      return link(source, destination);
    },
  }), /competing webmcp-evals browser backend.*recoverable backup.*preserved/u);

  assert.equal(await readFile(target, "utf8"), "late writer\n");
  const files = (await readdir(root)).sort();
  assert.equal(files.some((name) => name.includes(".tmp-")), false);
  assert.equal(files.some((name) => name.includes(".backup-")), true);
});

test("the dependency patch preserves the promoted backend when its recovery backup is swapped", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-backup-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  const identifier = "backup-swap";
  const backup = `${target}.backup-${process.pid}-${identifier}`;
  await writeFile(target, "original\n");
  const originalState = await lstat(target);
  let injected = false;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => identifier,
    expectedDestination: {
      device: originalState.dev,
      inode: originalState.ino,
      sha256: "25718360e05d3c2d0963d1381e9dd4dae5fca789244ee4b9f861adcc0cc96218",
    },
    linkImplementation: async (source, destination) => {
      if (!injected && destination === target && source.includes(".tmp-")) {
        injected = true;
        await rm(backup);
        await writeFile(backup, "attacker backup\n", { flag: "wx" });
      }
      return link(source, destination);
    },
  }), /recovery backup changed identity.*promoted backend.*preserved/u);

  assert.equal(await readFile(target, "utf8"), "replacement\n");
  assert.equal(await readFile(backup, "utf8"), "attacker backup\n");
  const files = (await readdir(root)).sort();
  assert.equal(files.some((name) => name.includes(".tmp-")), false);
});

test("the dependency patch rejects and preserves a regular or symbolic stage swapped before first inspection", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-stage-admission-"));
  context.after(() => rm(root, { recursive: true, force: true }));

  for (const kind of ["regular", "symbolic"]) {
    const target = resolve(root, `vercel-${kind}.js`);
    const identifier = `first-inspection-${kind}`;
    const stage = `${target}.tmp-${process.pid}-${identifier}`;
    const outside = resolve(root, `outside-${kind}.txt`);
    await writeFile(target, "original\n");
    await writeFile(outside, "outside\n");
    let injected = false;

    await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
      idFactory: () => identifier,
      lstatImplementation: async (path) => {
        if (!injected && path === stage) {
          injected = true;
          await rm(stage);
          if (kind === "regular") await writeFile(stage, "attacker\n", { flag: "wx" });
          else await symlink(outside, stage);
        }
        return lstat(path);
      },
    }), /patch stage.*(?:regular non-symbolic|unexpected bytes|changed identity)/u);

    assert.equal(await readFile(target, "utf8"), "original\n");
    const stageState = await lstat(stage);
    assert.equal(kind === "symbolic" ? stageState.isSymbolicLink() : stageState.isFile(), true);
  }
});

test("the dependency patch cannot report success after a destination swap during stage or backup clean-up", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-final-gates-"));
  context.after(() => rm(root, { recursive: true, force: true }));

  for (const seam of ["stage", "backup"]) {
    const target = resolve(root, `vercel-${seam}.js`);
    const identifier = `final-${seam}`;
    await writeFile(target, "original\n");
    let injected = false;

    await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
      idFactory: () => identifier,
      unlinkImplementation: async (path) => {
        const isSeam = seam === "stage" ? path.includes(".tmp-") : path.includes(".backup-");
        if (!injected && isSeam) {
          injected = true;
          await rm(target);
          await writeFile(target, "attacker\n", { flag: "wx" });
        }
        return unlink(path);
      },
    }), /rollback was incomplete|recoverable backup|manual recovery/u);

    assert.equal(await readFile(target, "utf8"), "attacker\n");
    if (seam === "backup") {
      const recovery = await findRecoveryCopy(root, target, "replacement\n");
      assert.equal((await lstat(recovery)).mode & 0o777, 0o600);
    } else {
      assert.equal((await readdir(root)).some((name) => name.includes(`vercel-${seam}.js.backup-`)), true);
    }
  }
});

test("rollback pins validated original bytes before removing the promoted target", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-rollback-pin-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  const identifier = "rollback-pin";
  const backup = `${target}.backup-${process.pid}-${identifier}`;
  const rollback = `${target}.rollback-${process.pid}-${identifier}`;
  await writeFile(target, "original\n");
  let failStageCleanup = true;
  let swappedBackup = false;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => identifier,
    unlinkImplementation: async (path) => {
      if (failStageCleanup && path.includes(".tmp-")) {
        failStageCleanup = false;
        throw new Error("synthetic stage clean-up failure");
      }
      return unlink(path);
    },
    linkImplementation: async (source, destination) => {
      await link(source, destination);
      if (!swappedBackup && destination === rollback) {
        swappedBackup = true;
        await rm(backup);
        await writeFile(backup, "attacker backup\n", { flag: "wx" });
      }
    },
  }), /rollback was incomplete|changed identity|synthetic stage clean-up failure/u);

  assert.equal(await readFile(target, "utf8"), "original\n");
  assert.equal(await readFile(backup, "utf8"), "attacker backup\n");
});

test("file-descriptor validation rejects ABA swaps around stage and promoted reads", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-aba-"));
  context.after(() => rm(root, { recursive: true, force: true }));

  const stageTarget = resolve(root, "stage-vercel.js");
  const stageIdentifier = "stage-aba";
  const stagePath = `${stageTarget}.tmp-${process.pid}-${stageIdentifier}`;
  await writeFile(stageTarget, "original\n");
  let stageInjected = false;
  await assert.rejects(replaceWithExclusiveStage(stageTarget, "replacement\n", 0o600, {
    idFactory: () => stageIdentifier,
    openImplementation: async (path, flags) => {
      const handle = await open(path, flags);
      if (!stageInjected && path === stagePath) {
        stageInjected = true;
        await rm(stagePath);
        await writeFile(stagePath, "XXXXXXXXXXX\n", { flag: "wx" });
      }
      return handle;
    },
  }), /patch stage.*changed identity/u);
  assert.equal(await readFile(stageTarget, "utf8"), "original\n");
  assert.equal(await readFile(stagePath, "utf8"), "XXXXXXXXXXX\n");

  const promotedTarget = resolve(root, "promoted-vercel.js");
  const promotedIdentifier = "promoted-aba";
  await writeFile(promotedTarget, "original\n");
  let targetOpenCount = 0;
  await assert.rejects(replaceWithExclusiveStage(promotedTarget, "replacement\n", 0o600, {
    idFactory: () => promotedIdentifier,
    openImplementation: async (path, flags) => {
      const handle = await open(path, flags);
      if (path === promotedTarget) {
        targetOpenCount += 1;
        if (targetOpenCount === 4) {
          await rm(promotedTarget);
          await writeFile(promotedTarget, "XXXXXXXXXXX\n", { flag: "wx" });
        }
      }
      return handle;
    },
  }), /rollback was incomplete|recoverable backup/u);
  assert.equal(await readFile(promotedTarget, "utf8"), "XXXXXXXXXXX\n");
  assert.equal((await readdir(root)).some((name) => name.includes("promoted-vercel.js.backup-")), true);
});

test("stage mode enforcement cannot follow a symlink swapped after validation", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-chmod-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  const outside = resolve(root, "outside-private.json");
  const identifier = "chmod-symlink";
  const stage = `${target}.tmp-${process.pid}-${identifier}`;
  await writeFile(target, "original\n");
  await writeFile(outside, "private\n", { mode: 0o600 });
  const beforeMode = (await lstat(outside)).mode & 0o777;
  let stageOpenCount = 0;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o644, {
    idFactory: () => identifier,
    openImplementation: async (path, flags) => {
      const handle = await open(path, flags);
      if (path === stage) {
        stageOpenCount += 1;
        if (stageOpenCount === 2) {
          await rm(stage);
          await symlink(outside, stage);
        }
      }
      return handle;
    },
  }), /patch stage after mode enforcement.*regular non-symbolic|changed identity/u);

  assert.equal((await lstat(outside)).mode & 0o777, beforeMode);
  assert.equal(await readFile(target, "utf8"), "original\n");
  assert.equal((await lstat(stage)).isSymbolicLink(), true);
});

test("stage and final validation reject unsafe or post-fchmod permission drift", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-mode-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const unsafeTarget = resolve(root, "unsafe-vercel.js");
  await writeFile(unsafeTarget, "original\n", { mode: 0o777 });
  await assert.rejects(
    replaceWithExclusiveStage(unsafeTarget, "replacement\n", 0o777),
    /mode must be owner-readable and writable.*no special or group\/other write bits/u,
  );

  const target = resolve(root, "drift-vercel.js");
  const identifier = "mode-drift";
  const stage = `${target}.tmp-${process.pid}-${identifier}`;
  await writeFile(target, "original\n", { mode: 0o600 });
  let stageOpenCount = 0;
  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => identifier,
    openImplementation: async (path, flags) => {
      const handle = await open(path, flags);
      if (path !== stage || ++stageOpenCount !== 2) return handle;
      return {
        chmod: async (mode) => {
          await handle.chmod(mode);
          await handle.chmod(0o777);
        },
        close: (...arguments_) => handle.close(...arguments_),
        readFile: (...arguments_) => handle.readFile(...arguments_),
        stat: (...arguments_) => handle.stat(...arguments_),
      };
    },
  }), /patch stage after mode enforcement.*unsafe or unexpected permissions/u);
  assert.equal(await readFile(target, "utf8"), "original\n");
  await assert.rejects(lstat(stage), /ENOENT/u);
});

test("rollback clean-up swaps cannot remove every known-good original copy", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-rollback-cleanup-"));
  context.after(() => rm(root, { recursive: true, force: true }));

  for (const seam of ["backup", "rollback"]) {
    const target = resolve(root, `vercel-${seam}.js`);
    const identifier = `rollback-cleanup-${seam}`;
    await writeFile(target, "original\n", { mode: 0o600 });
    let failStageCleanup = true;
    let injected = false;

    await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
      idFactory: () => identifier,
      unlinkImplementation: async (path) => {
        if (failStageCleanup && path.includes(".tmp-")) {
          failStageCleanup = false;
          throw new Error("synthetic stage clean-up failure");
        }
        if (!injected && path.includes(`.${seam}-`)) {
          injected = true;
          await rm(target);
          await writeFile(target, "attacker\n", { flag: "wx", mode: 0o600 });
        }
        return unlink(path);
      },
    }), /rollback was incomplete/u);

    assert.equal(await readFile(target, "utf8"), "attacker\n");
    const recovery = await findRecoveryCopy(root, target, "original\n");
    assert.equal(await readFile(recovery, "utf8"), "original\n");
    assert.equal((await lstat(recovery)).mode & 0o777, 0o600);
  }
});

test("a success backup-unlink swap cannot block exact recovery with the observable transaction name", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-recovery-collision-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  const identifier = "success-recovery-collision";
  const collision = `${target}.recovery-${process.pid}-${identifier}`;
  await writeFile(target, "original\n", { mode: 0o644 });
  let injected = false;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o644, {
    idFactory: () => identifier,
    unlinkImplementation: async (path) => {
      if (!injected && path.includes(".backup-")) {
        injected = true;
        await rm(target);
        await writeFile(target, "attacker\n", { flag: "wx", mode: 0o644 });
        await writeFile(collision, "collision\n", { flag: "wx", mode: 0o644 });
      }
      return unlink(path);
    },
  }), /rollback was incomplete/u);

  assert.equal(await readFile(target, "utf8"), "attacker\n");
  assert.equal(await readFile(collision, "utf8"), "collision\n");
  const recovery = await findRecoveryCopy(root, target, "replacement\n");
  assert.equal((await lstat(recovery)).mode & 0o777, 0o644);
});

test("a rollback-link swap cannot block exact recovery with the observable transaction name", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-rollback-recovery-collision-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const target = resolve(root, "vercel.js");
  const identifier = "rollback-recovery-collision";
  const collision = `${target}.recovery-${process.pid}-${identifier}`;
  await writeFile(target, "original\n", { mode: 0o600 });
  let failStageCleanup = true;
  let injected = false;

  await assert.rejects(replaceWithExclusiveStage(target, "replacement\n", 0o600, {
    idFactory: () => identifier,
    unlinkImplementation: async (path) => {
      if (failStageCleanup && path.includes(".tmp-")) {
        failStageCleanup = false;
        throw new Error("synthetic stage clean-up failure");
      }
      if (!injected && path.includes(".rollback-")) {
        injected = true;
        await rm(target);
        await writeFile(target, "attacker\n", { flag: "wx", mode: 0o600 });
        await writeFile(collision, "collision\n", { flag: "wx", mode: 0o600 });
      }
      return unlink(path);
    },
  }), /rollback was incomplete/u);

  assert.equal(await readFile(target, "utf8"), "attacker\n");
  assert.equal(await readFile(collision, "utf8"), "collision\n");
  const recovery = await findRecoveryCopy(root, target, "original\n");
  assert.equal((await lstat(recovery)).mode & 0o777, 0o600);
});

test("the no-change dependency verification rejects a late ABA pathname swap", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-evals-patch-no-change-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const packageDirectory = resolve(root, "node_modules/webmcp-evals");
  const backendDirectory = resolve(packageDirectory, "dist/backends");
  const packagePath = resolve(packageDirectory, "package.json");
  const target = resolve(backendDirectory, "vercel.js");
  await mkdir(backendDirectory, { recursive: true });
  await writeFile(packagePath, '{"name":"webmcp-evals","version":"0.0.4"}\n');
  const patchedSource = await readFile(backendPath, "utf8");
  await writeFile(target, patchedSource);
  let injected = false;

  await assert.rejects(applyWebmcpEvalsBrowserStepLimitPatch(root, {
    finalOpenImplementation: async (path, flags) => {
      const handle = await open(path, flags);
      if (!injected && path === target) {
        injected = true;
        await rm(target);
        await writeFile(target, "X".repeat(Buffer.byteLength(patchedSource, "utf8")));
      }
      return handle;
    },
  }), /final webmcp-evals browser backend.*changed identity/u);
  assert.match(await readFile(target, "utf8"), /^X+$/u);
});

test("the webmcp-evals patch refuses dependency drift", async () => {
  const patchedSource = await readFile(backendPath, "utf8");
  assert.throws(
    () => patchBrowserStepLimitSource(`${patchedSource}\n// unreviewed drift\n`),
    /unreviewed digest/u,
  );
});

test("test, CI and evaluator entry points explicitly reapply the reviewed browser patch", async () => {
  const package_ = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(
    package_.scripts["webmcp:eval:patch"],
    "node scripts/apply-webmcp-evals-browser-step-limit-patch.mjs",
  );
  for (const name of ["test", "test:unit"]) {
    assert.match(
      package_.scripts[name],
      /^npm run webmcp:eval:patch && /u,
      `npm run ${name} must verify or apply the reviewed dependency patch before any test work`,
    );
  }
  assert.match(package_.scripts["webmcp:eval:browser"], /^npm run webmcp:eval:patch && /u);
  const runner = await readFile("scripts/run-personal-agent-evals.mjs", "utf8");
  assert.match(runner, /await applyWebmcpEvalsBrowserStepLimitPatch\(repositoryRoot\);/u);
  for (const path of [".github/workflows/ci.yml", ".github/workflows/pages.yml"]) {
    const workflow = await readFile(path, "utf8");
    const install = workflow.indexOf("npm ci --ignore-scripts --no-audit");
    const patch = workflow.indexOf("npm run webmcp:eval:patch");
    const test = workflow.indexOf("npm test");
    assert.ok(install >= 0 && patch > install && test > patch, `${path} must patch after install and before tests`);
  }
});
