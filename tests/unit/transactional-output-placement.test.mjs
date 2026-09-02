import assert from "node:assert/strict";
import {
  copyFile,
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import test from "node:test";

import {
  CommittedOutputCleanupError,
  placeRepositoryOutputs,
} from "../../scripts/lib/transactional-output-placement.mjs";

async function outputPairFixture() {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-"));
  const paths = {
    firstSource: resolve(root, "new-first.mov"),
    secondSource: resolve(root, "new-second.json"),
    firstDestination: resolve(root, "published", "first.mov"),
    secondDestination: resolve(root, "published", "second.json"),
  };
  await writeFile(paths.firstSource, "new first\n", "utf8");
  await writeFile(paths.secondSource, "new second\n", "utf8");
  await placeRepositoryOutputs([
    { source: paths.firstSource, destination: paths.firstDestination },
    { source: paths.secondSource, destination: paths.secondDestination },
  ], { root });
  await writeFile(paths.firstSource, "replacement first\n", "utf8");
  await writeFile(paths.secondSource, "replacement second\n", "utf8");
  return { root, paths };
}

test("committed output pair survives a failure deleting the second backup", async (context) => {
  const fixture = await outputPairFixture();
  context.after(() => rm(fixture.root, { recursive: true, force: true }));
  let backupRemovalCount = 0;
  let observedError;

  try {
    await placeRepositoryOutputs([
      { source: fixture.paths.firstSource, destination: fixture.paths.firstDestination },
      { source: fixture.paths.secondSource, destination: fixture.paths.secondDestination },
    ], {
      root: fixture.root,
      overwrite: true,
      fileSystem: {
        rm: async (path, options) => {
          if (path.includes(".backup-")) {
            backupRemovalCount += 1;
            if (backupRemovalCount === 2) throw new Error("injected second-backup deletion failure");
          }
          return rm(path, options);
        },
      },
      idFactory: (() => {
        let value = 0;
        return () => `fault-${value += 1}`;
      })(),
    });
  } catch (error) {
    observedError = error;
  }

  assert.ok(observedError instanceof CommittedOutputCleanupError);
  assert.equal(observedError.code, "OUTPUT_BACKUP_CLEANUP_FAILED");
  assert.equal(observedError.cleanupFailureCount, 1);
  assert.deepEqual(observedError.committedOutputs.sort(), ["published/first.mov", "published/second.json"]);
  assert.equal(observedError.leftoverBackups.length, 1);
  assert.match(observedError.leftoverBackups[0], /^published\/second\.json\.backup-/u);
  assert.match(observedError.message, /committed outputs were retained/u);
  assert.equal(await readFile(fixture.paths.firstDestination, "utf8"), "replacement first\n");
  assert.equal(await readFile(fixture.paths.secondDestination, "utf8"), "replacement second\n");
  assert.equal(await readFile(resolve(fixture.root, observedError.leftoverBackups[0]), "utf8"), "new second\n");

  const publishedFiles = await readdir(resolve(fixture.root, "published"));
  assert.equal(publishedFiles.filter((name) => name.includes(".backup-")).length, 1);
  assert.equal(publishedFiles.filter((name) => name.includes(".pending-")).length, 0);
});

test("successful replacement removes both backups", async (context) => {
  const fixture = await outputPairFixture();
  context.after(() => rm(fixture.root, { recursive: true, force: true }));
  const result = await placeRepositoryOutputs([
    { source: fixture.paths.firstSource, destination: fixture.paths.firstDestination },
    { source: fixture.paths.secondSource, destination: fixture.paths.secondDestination },
  ], { root: fixture.root, overwrite: true });

  assert.deepEqual(result, {
    committedOutputs: ["published/first.mov", "published/second.json"],
    replacedOutputCount: 2,
  });
  assert.equal(await readFile(fixture.paths.firstDestination, "utf8"), "replacement first\n");
  assert.equal(await readFile(fixture.paths.secondDestination, "utf8"), "replacement second\n");
  assert.deepEqual((await readdir(resolve(fixture.root, "published"))).sort(), ["first.mov", "second.json"]);
});

test("a four-file release set remains committed when later backup clean-up fails", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-four-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const entries = [];
  for (let index = 1; index <= 4; index += 1) {
    const source = resolve(root, `source-${index}.txt`);
    const destination = resolve(root, "published", `output-${index}.txt`);
    await writeFile(source, `initial ${index}\n`, "utf8");
    entries.push({ source, destination });
  }
  await placeRepositoryOutputs(entries, { root });
  for (const [index, { source }] of entries.entries()) await writeFile(source, `replacement ${index + 1}\n`, "utf8");
  let backupRemovalCount = 0;
  let observedError;
  try {
    await placeRepositoryOutputs(entries, {
      root,
      overwrite: true,
      fileSystem: {
        rm: async (path, options) => {
          if (path.includes(".backup-")) {
            backupRemovalCount += 1;
            if (backupRemovalCount === 3) throw new Error("injected later-backup deletion failure");
          }
          return rm(path, options);
        },
      },
    });
  } catch (error) {
    observedError = error;
  }
  assert.ok(observedError instanceof CommittedOutputCleanupError);
  assert.equal(observedError.committedOutputs.length, 4);
  for (const [index, { destination }] of entries.entries()) {
    assert.equal(await readFile(destination, "utf8"), `replacement ${index + 1}\n`);
  }
});

test("a promotion failure still restores the complete previous pair", async (context) => {
  const fixture = await outputPairFixture();
  context.after(() => rm(fixture.root, { recursive: true, force: true }));
  let pendingPromotionCount = 0;

  await assert.rejects(
    placeRepositoryOutputs([
      { source: fixture.paths.firstSource, destination: fixture.paths.firstDestination },
      { source: fixture.paths.secondSource, destination: fixture.paths.secondDestination },
    ], {
      root: fixture.root,
      overwrite: true,
      fileSystem: {
        link: async (source, destination) => {
          if (source.includes(".pending-")) {
            pendingPromotionCount += 1;
            if (pendingPromotionCount === 2) throw new Error("injected second-output promotion failure");
          }
          return link(source, destination);
        },
      },
    }),
    /injected second-output promotion failure/u,
  );

  assert.equal(await readFile(fixture.paths.firstDestination, "utf8"), "new first\n");
  assert.equal(await readFile(fixture.paths.secondDestination, "utf8"), "new second\n");
  assert.deepEqual((await readdir(resolve(fixture.root, "published"))).sort(), ["first.mov", "second.json"]);
});

test("rollback backup clean-up preserves known-good bytes when a writer swaps the restored output", async (context) => {
  const fixture = await outputPairFixture();
  context.after(() => rm(fixture.root, { recursive: true, force: true }));
  let pendingPromotionCount = 0;
  let injected = false;

  await assert.rejects(placeRepositoryOutputs([
    { source: fixture.paths.firstSource, destination: fixture.paths.firstDestination },
    { source: fixture.paths.secondSource, destination: fixture.paths.secondDestination },
  ], {
    root: fixture.root,
    overwrite: true,
    fileSystem: {
      link: async (source, destination) => {
        if (source.includes(".pending-")) {
          pendingPromotionCount += 1;
          if (pendingPromotionCount === 2) throw new Error("injected second-output promotion failure");
        }
        return link(source, destination);
      },
      rm: async (path, options) => {
        if (!injected && path.includes(".backup-")) {
          injected = true;
          const restoredDestination = path.slice(0, path.indexOf(".backup-"));
          await rm(restoredDestination);
          await writeFile(restoredDestination, "rollback writer replacement\n", { flag: "wx" });
        }
        return rm(path, options);
      },
    },
  }), /rollback was incomplete/u);

  assert.equal(await readFile(fixture.paths.secondDestination, "utf8"), "rollback writer replacement\n");
  const recoveryName = (await readdir(resolve(fixture.root, "published")))
    .find((name) => name.startsWith("second.json.recovery-"));
  assert.ok(recoveryName);
  const recoveryPath = resolve(fixture.root, "published", recoveryName);
  assert.equal(await readFile(recoveryPath, "utf8"), "new second\n");
  assert.equal((await lstat(recoveryPath)).mode & 0o777, 0o600);
});

test("a late-created output is preserved when overwrite is disabled", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "candidate output\n", "utf8");
  let firstLink = true;

  await assert.rejects(
    placeRepositoryOutputs([{ source, destination }], {
      root,
      fileSystem: {
        link: async (temporary, target) => {
          if (firstLink) {
            firstLink = false;
            await writeFile(destination, "competing writer\n", { flag: "wx" });
          }
          return link(temporary, target);
        },
      },
    }),
    /destination appeared while overwrite was disabled/u,
  );

  assert.equal(await readFile(destination, "utf8"), "competing writer\n");
  assert.deepEqual(await readdir(resolve(root, "published")), ["output.txt"]);
});

test("an overwrite-authorised but unbacked late output is preserved during rollback", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-overwrite-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const firstSource = resolve(root, "first-source.txt");
  const secondSource = resolve(root, "second-source.txt");
  const firstDestination = resolve(root, "published", "first.txt");
  const secondDestination = resolve(root, "published", "second.txt");
  await writeFile(firstSource, "new first\n");
  await writeFile(secondSource, "new second\n");
  await mkdir(resolve(root, "published"));
  await writeFile(secondDestination, "old second\n");
  let injected = false;

  await assert.rejects(placeRepositoryOutputs([
    { source: firstSource, destination: firstDestination },
    { source: secondSource, destination: secondDestination },
  ], {
    root,
    overwrite: true,
    fileSystem: {
      link: async (temporary, target) => {
        if (!injected && target === firstDestination) {
          injected = true;
          await writeFile(firstDestination, "late first\n", { flag: "wx" });
        }
        return link(temporary, target);
      },
    },
  }), /appeared after the replacement backup window/u);

  assert.equal(await readFile(firstDestination, "utf8"), "late first\n");
  assert.equal(await readFile(secondDestination, "utf8"), "old second\n");
  assert.deepEqual((await readdir(resolve(root, "published"))).sort(), ["first.txt", "second.txt"]);
});

for (const lateTargetKind of ["symbolic link", "directory"]) {
  test(`a late-created ${lateTargetKind} is rejected and preserved before overwrite backup`, async (context) => {
    const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-type-race-"));
    context.after(() => rm(root, { recursive: true, force: true }));
    const source = resolve(root, "source.txt");
    const destination = resolve(root, "published", "output.txt");
    const referent = resolve(root, "referent.txt");
    await writeFile(source, "candidate output\n", "utf8");
    await writeFile(referent, "referent remains\n", "utf8");
    let destinationChecks = 0;

    await assert.rejects(
      placeRepositoryOutputs([{ source, destination }], {
        root,
        overwrite: true,
        fileSystem: {
          lstat: async (path) => {
            if (path === destination) {
              destinationChecks += 1;
              if (destinationChecks === 2) {
                if (lateTargetKind === "symbolic link") await symlink(referent, destination);
                else await mkdir(destination);
              }
            }
            return lstat(path);
          },
        },
      }),
      /Destination is not a regular file/u,
    );

    const targetInfo = await lstat(destination);
    assert.equal(targetInfo.isSymbolicLink(), lateTargetKind === "symbolic link");
    assert.equal(targetInfo.isDirectory(), lateTargetKind === "directory");
    assert.equal(await readFile(referent, "utf8"), "referent remains\n");
    assert.deepEqual((await readdir(resolve(root, "published"))).sort(), ["output.txt"]);
  });
}

test("a partial pending copy is removed after copy rejects", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-partial-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "candidate output\n");
  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      copyFile: async (_source, temporary) => {
        await writeFile(temporary, "partial output", { flag: "wx" });
        const error = new Error("synthetic partial-copy failure");
        error.code = "ENOSPC";
        throw error;
      },
    },
  }), /synthetic partial-copy failure/u);
  assert.deepEqual(await readdir(resolve(root, "published")), []);
});

test("a regular-file stage swap before first inspection cannot be promoted", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-stage-swap-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "intended output\n");

  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      copyFile: async (sourcePath, stagePath, flags) => {
        await copyFile(sourcePath, stagePath, flags);
        await rm(stagePath);
        await writeFile(stagePath, "attacker output\n", { flag: "wx" });
      },
    },
  }), /Pending output bytes differ from the validated source/u);

  await assert.rejects(readFile(destination), /ENOENT/u);
  const pending = (await readdir(resolve(root, "published"))).find((name) => name.includes(".pending-"));
  assert.ok(pending);
  assert.equal(await readFile(resolve(root, "published", pending), "utf8"), "attacker output\n");
});

test("a symbolic-link stage swap before first inspection cannot be promoted", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-stage-symlink-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const referent = resolve(root, "referent.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "intended output\n");
  await writeFile(referent, "referent remains\n");

  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      copyFile: async (sourcePath, stagePath, flags) => {
        await copyFile(sourcePath, stagePath, flags);
        await rm(stagePath);
        await symlink(referent, stagePath);
      },
    },
  }), /Pending output (?:is not a regular file|must be a regular non-symbolic file)/u);

  await assert.rejects(readFile(destination), /ENOENT/u);
  assert.equal(await readFile(referent, "utf8"), "referent remains\n");
  const pending = (await readdir(resolve(root, "published"))).find((name) => name.includes(".pending-"));
  assert.ok(pending);
  assert.equal((await lstat(resolve(root, "published", pending))).isSymbolicLink(), true);
});

test("a late parent swap during staging cannot promote or overwrite outside the repository", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-parent-race-"));
  const outside = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-parent-outside-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  context.after(() => rm(outside, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const parent = resolve(root, "published");
  const destination = resolve(parent, "output.txt");
  const externalDestination = resolve(outside, "output.txt");
  await writeFile(source, "candidate output\n");
  await mkdir(parent);
  await writeFile(externalDestination, "external writer remains\n");
  let externalStage;

  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      copyFile: async (sourcePath, temporaryPath, flags) => {
        await rm(parent, { recursive: true });
        await symlink(outside, parent);
        externalStage = resolve(outside, basename(temporaryPath));
        return copyFile(sourcePath, temporaryPath, flags);
      },
    },
  }), /validated parent chain changed|ancestor changed identity or type/u);

  assert.equal((await lstat(parent)).isSymbolicLink(), true);
  assert.equal(await readFile(externalDestination, "utf8"), "external writer remains\n");
  assert.equal(await readFile(externalStage, "utf8"), "candidate output\n");
  assert.deepEqual(
    (await readdir(outside)).sort(),
    [basename(externalStage), "output.txt"].sort(),
  );
});

test("an exclusive-copy collision preserves the pre-existing pending file", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-copy-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "candidate output\n");
  let collisionPath;
  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      copyFile: async (_source, temporary) => {
        collisionPath = temporary;
        await writeFile(temporary, "pre-existing pending\n", { flag: "wx" });
        const error = new Error("synthetic exclusive-copy collision");
        error.code = "EEXIST";
        throw error;
      },
    },
  }), /synthetic exclusive-copy collision/u);
  assert.equal(await readFile(collisionPath, "utf8"), "pre-existing pending\n");
});

test("a symlinked destination ancestor cannot create directories outside the repository", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-root-"));
  const outside = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-outside-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  context.after(() => rm(outside, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  await writeFile(source, "candidate output\n");
  await symlink(outside, resolve(root, "output"));
  await assert.rejects(placeRepositoryOutputs([{
    source,
    destination: resolve(root, "output", "demo-clips", "candidate.mov"),
  }], { root }), /contains a symbolic link/u);
  assert.deepEqual(await readdir(outside), []);
});

test("a backed destination that reappears is preserved with its recoverable backup", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-backed-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "new output\n");
  await mkdir(resolve(root, "published"));
  await writeFile(destination, "old output\n");
  let injected = false;
  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    overwrite: true,
    fileSystem: {
      link: async (temporary, target) => {
        if (!injected && temporary.includes(".pending-")) {
          injected = true;
          await writeFile(target, "late output\n", { flag: "wx" });
        }
        return link(temporary, target);
      },
    },
  }), /rollback was incomplete|replacement backup window/u);
  assert.equal(await readFile(destination, "utf8"), "late output\n");
  const backup = (await readdir(resolve(root, "published"))).find((name) => name.includes(".backup-"));
  assert.ok(backup);
  assert.equal(await readFile(resolve(root, "published", backup), "utf8"), "old output\n");
});

test("rollback preserves a writer replacement of an already promoted output", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-promoted-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const firstSource = resolve(root, "first-source.txt");
  const secondSource = resolve(root, "second-source.txt");
  const firstDestination = resolve(root, "published", "first.txt");
  const secondDestination = resolve(root, "published", "second.txt");
  await writeFile(firstSource, "first candidate\n");
  await writeFile(secondSource, "second candidate\n");
  let promotion = 0;
  await assert.rejects(placeRepositoryOutputs([
    { source: firstSource, destination: firstDestination },
    { source: secondSource, destination: secondDestination },
  ], {
    root,
    fileSystem: {
      link: async (temporary, target) => {
        if (temporary.includes(".pending-")) {
          promotion += 1;
          if (promotion === 1) {
            await link(temporary, target);
            await rm(target);
            await writeFile(target, "writer replacement\n", { flag: "wx" });
            return;
          }
          throw new Error("synthetic later promotion failure");
        }
        return link(temporary, target);
      },
    },
  }), /rollback was incomplete|synthetic later promotion failure/u);
  assert.equal(await readFile(firstDestination, "utf8"), "writer replacement\n");
});

test("a post-rename backup stat failure still restores the original output", async (context) => {
  const fixture = await outputPairFixture();
  context.after(() => rm(fixture.root, { recursive: true, force: true }));
  let injected = false;
  await assert.rejects(placeRepositoryOutputs([
    { source: fixture.paths.firstSource, destination: fixture.paths.firstDestination },
    { source: fixture.paths.secondSource, destination: fixture.paths.secondDestination },
  ], {
    root: fixture.root,
    overwrite: true,
    fileSystem: {
      lstat: async (path) => {
        if (!injected && path.includes(".backup-")) {
          injected = true;
          const error = new Error("synthetic post-rename stat failure");
          error.code = "EIO";
          throw error;
        }
        return lstat(path);
      },
    },
  }), /synthetic post-rename stat failure/u);
  assert.equal(await readFile(fixture.paths.firstDestination, "utf8"), "new first\n");
  assert.equal(await readFile(fixture.paths.secondDestination, "utf8"), "new second\n");
  assert.deepEqual((await readdir(resolve(fixture.root, "published"))).sort(), ["first.mov", "second.json"]);
});

test("a backup-name collision preserves both the original output and collision", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-backup-collision-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "replacement output\n");
  await mkdir(resolve(root, "published"));
  await writeFile(destination, "original output\n");
  let collisionPath;
  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    overwrite: true,
    fileSystem: {
      link: async (from, to) => {
        if (to.includes(".backup-")) {
          collisionPath = to;
          await writeFile(to, "backup collision\n", { flag: "wx" });
        }
        return link(from, to);
      },
    },
  }), /EEXIST/u);
  assert.equal(await readFile(destination, "utf8"), "original output\n");
  assert.equal(await readFile(collisionPath, "utf8"), "backup collision\n");
});

test("promotion rejects a pending file that changed identity before linking", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-stage-swap-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "validated output\n");
  let swapped = false;
  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      link: async (temporary, target) => {
        if (!swapped && temporary.includes(".pending-")) {
          swapped = true;
          await rm(temporary);
          await writeFile(temporary, "swapped output\n", { flag: "wx" });
        }
        return link(temporary, target);
      },
    },
  }), /rollback was incomplete|does not match its validated stage/u);
  assert.equal(await readFile(destination, "utf8"), "swapped output\n");
});

test("a writer replacing a committed output during pending clean-up prevents success", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-pending-cleanup-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "intended output\n");
  let injected = false;

  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    fileSystem: {
      rm: async (path, options) => {
        if (!injected && path.includes(".pending-")) {
          injected = true;
          await rm(destination);
          await writeFile(destination, "late writer\n", { flag: "wx" });
        }
        return rm(path, options);
      },
    },
  }), /rollback was incomplete|before backup clean-up/u);
  assert.equal(await readFile(destination, "utf8"), "late writer\n");
});

test("a writer replacing a committed output during backup clean-up prevents success", async (context) => {
  const root = await mkdtemp(resolve(tmpdir(), "govuk-webmcp-output-placement-backup-cleanup-race-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const source = resolve(root, "source.txt");
  const destination = resolve(root, "published", "output.txt");
  await writeFile(source, "old output\n");
  await placeRepositoryOutputs([{ source, destination }], { root });
  await writeFile(source, "intended replacement\n");
  let injected = false;

  await assert.rejects(placeRepositoryOutputs([{ source, destination }], {
    root,
    overwrite: true,
    fileSystem: {
      rm: async (path, options) => {
        if (!injected && path.includes(".backup-")) {
          injected = true;
          await rm(destination);
          await writeFile(destination, "late writer\n", { flag: "wx" });
        }
        return rm(path, options);
      },
    },
  }), /could not verify the committed outputs after transaction clean-up/u);
  assert.equal(await readFile(destination, "utf8"), "late writer\n");
  const recoveryName = (await readdir(resolve(root, "published")))
    .find((name) => name.startsWith("output.txt.recovery-"));
  assert.ok(recoveryName);
  const recoveryPath = resolve(root, "published", recoveryName);
  assert.equal(await readFile(recoveryPath, "utf8"), "intended replacement\n");
  assert.equal((await lstat(recoveryPath)).mode & 0o777, 0o600);
});
