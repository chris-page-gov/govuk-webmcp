import assert from "node:assert/strict";
import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";

import { admitEvidenceSet, admitPublicEvidencePair } from "../../scripts/lib/public-evidence-admission.mjs";

async function withTemporaryRepository(run) {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-evidence-admission-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function entries(root, left = "new-left\n", right = "new-right\n") {
  return [
    { path: join(root, "left.json"), content: left },
    { path: join(root, "right.json"), content: right },
  ];
}

test("public evidence admission promotes both staged files", async () => {
  await withTemporaryRepository(async (root) => {
    await admitPublicEvidencePair({ repositoryRoot: root, entries: entries(root), overwrite: false });
    assert.equal(await readFile(join(root, "left.json"), "utf8"), "new-left\n");
    assert.equal(await readFile(join(root, "right.json"), "utf8"), "new-right\n");
    assert.deepEqual((await readdir(root)).sort(), ["left.json", "right.json"]);
  });
});

test("a failed second promotion restores the complete previous pair", async () => {
  await withTemporaryRepository(async (root) => {
    await writeFile(join(root, "left.json"), "old-left\n");
    await writeFile(join(root, "right.json"), "old-right\n");
    let promotions = 0;
    const linkFile = async (source, target) => {
      if (source.includes(".admit-stage-")) {
        promotions += 1;
        if (promotions === 2) {
          const error = new Error("synthetic second-promotion failure");
          error.code = "EIO";
          throw error;
        }
      }
      return link(source, target);
    };
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: true },
        {
          accessFile: async (path) => readFile(path),
          statPath: lstat,
          linkFile,
          renameFile: rename,
          removeFile: async (path) => rm(path),
          writeFile,
        },
      ),
      /synthetic second-promotion failure/u,
    );
    assert.equal(await readFile(join(root, "left.json"), "utf8"), "old-left\n");
    assert.equal(await readFile(join(root, "right.json"), "utf8"), "old-right\n");
    assert.deepEqual((await readdir(root)).sort(), ["left.json", "right.json"]);
  });
});

test("rollback backup clean-up preserves known-good bytes when a writer swaps the restored target", async () => {
  await withTemporaryRepository(async (root) => {
    const leftPath = join(root, "left.json");
    const rightPath = join(root, "right.json");
    await writeFile(leftPath, "old-left\n");
    await writeFile(rightPath, "old-right\n");
    let promotions = 0;
    let injected = false;

    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: true },
        {
          linkFile: async (source, target) => {
            if (source.includes(".admit-stage-")) {
              promotions += 1;
              if (promotions === 2) throw new Error("synthetic second-promotion failure");
            }
            return link(source, target);
          },
          removeFile: async (path) => {
            if (!injected && path.includes(".right.json.admit-backup-")) {
              injected = true;
              await rm(rightPath);
              await writeFile(rightPath, "rollback writer replacement\n", { flag: "wx" });
            }
            return rm(path);
          },
        },
      ),
      /rollback could not restore/u,
    );

    assert.equal(await readFile(rightPath, "utf8"), "rollback writer replacement\n");
    const recoveryName = (await readdir(root))
      .find((name) => name.startsWith(".right.json.admit-recovery-"));
    assert.ok(recoveryName);
    const recoveryPath = join(root, recoveryName);
    assert.equal(await readFile(recoveryPath, "utf8"), "old-right\n");
    assert.equal((await lstat(recoveryPath)).mode & 0o777, 0o600);
  });
});

test("a failed three-file admission preserves the previously bound raw and public evidence", async () => {
  await withTemporaryRepository(async (root) => {
    const rawPath = join(root, ".evals", "raw.json");
    const reviewedPath = join(root, "docs", "reviewed.json");
    const supportedPath = join(root, "docs", "supported.json");
    await mkdir(dirname(rawPath), { recursive: true });
    await mkdir(dirname(reviewedPath), { recursive: true });
    await writeFile(rawPath, "old raw\n", { mode: 0o600 });
    await writeFile(reviewedPath, "old reviewed\n");
    await writeFile(supportedPath, "old supported\n");
    let promotions = 0;
    await assert.rejects(
      admitEvidenceSet({
        repositoryRoot: root,
        overwrite: true,
        entries: [
          { path: rawPath, content: "new raw\n", mode: 0o600 },
          { path: reviewedPath, content: "new reviewed\n", mode: 0o644 },
          { path: supportedPath, content: "new supported\n", mode: 0o644 },
        ],
      }, {
        accessFile: async (path) => readFile(path),
        statPath: lstat,
        linkFile: async (source, target) => {
          if (source.includes(".admit-stage-")) {
            promotions += 1;
            if (promotions === 3) throw new Error("synthetic third-promotion failure");
          }
          return link(source, target);
        },
        renameFile: rename,
        removeFile: async (path) => rm(path),
        writeFile,
      }),
      /synthetic third-promotion failure/u,
    );
    assert.equal(await readFile(rawPath, "utf8"), "old raw\n");
    assert.equal(await readFile(reviewedPath, "utf8"), "old reviewed\n");
    assert.equal(await readFile(supportedPath, "utf8"), "old supported\n");
  });
});

test("a failed second promotion removes a partial new pair", async () => {
  await withTemporaryRepository(async (root) => {
    let promotions = 0;
    const linkFile = async (source, target) => {
      promotions += 1;
      if (promotions === 2) {
        const error = new Error("synthetic second-promotion failure");
        error.code = "EIO";
        throw error;
      }
      return link(source, target);
    };
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          accessFile: async (path) => readFile(path),
          linkFile,
          statPath: lstat,
          renameFile: rename,
          removeFile: async (path) => rm(path),
          writeFile,
        },
      ),
      /synthetic second-promotion failure/u,
    );
    assert.deepEqual(await readdir(root), []);
  });
});

test("a late-created public target is preserved when overwrite is disabled", async () => {
  await withTemporaryRepository(async (root) => {
    const leftPath = join(root, "left.json");
    let firstLink = true;
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          linkFile: async (source, target) => {
            if (firstLink) {
              firstLink = false;
              await writeFile(leftPath, "competing writer\n", { flag: "wx" });
            }
            return link(source, target);
          },
        },
      ),
      /target appeared while replacement was not authorised/u,
    );
    assert.equal(await readFile(leftPath, "utf8"), "competing writer\n");
    assert.deepEqual(await readdir(root), ["left.json"]);
  });
});

test("mixed three-file policies replace only the independently authorised targets", async () => {
  await withTemporaryRepository(async (root) => {
    const rawPath = join(root, ".evals", "raw.json");
    const reviewedPath = join(root, "docs", "reviewed.json");
    const supportedPath = join(root, "docs", "supported.json");
    await mkdir(dirname(rawPath), { recursive: true });
    await mkdir(dirname(reviewedPath), { recursive: true });
    await writeFile(rawPath, "old raw\n", { mode: 0o600 });
    await admitEvidenceSet({
      repositoryRoot: root,
      entries: [
        { path: rawPath, content: "new raw\n", mode: 0o600, replaceExisting: true },
        { path: reviewedPath, content: "new reviewed\n", mode: 0o644, replaceExisting: false },
        { path: supportedPath, content: "new supported\n", mode: 0o644, replaceExisting: false },
      ],
    });
    assert.equal(await readFile(rawPath, "utf8"), "new raw\n");
    assert.equal(await readFile(reviewedPath, "utf8"), "new reviewed\n");
    assert.equal(await readFile(supportedPath, "utf8"), "new supported\n");
  });
});

test("a late raw target is preserved when only public replacement was authorised", async () => {
  await withTemporaryRepository(async (root) => {
    const rawPath = join(root, ".evals", "raw.json");
    const reviewedPath = join(root, "docs", "reviewed.json");
    const supportedPath = join(root, "docs", "supported.json");
    await mkdir(dirname(rawPath), { recursive: true });
    await mkdir(dirname(reviewedPath), { recursive: true });
    await writeFile(reviewedPath, "old reviewed\n");
    await writeFile(supportedPath, "old supported\n");
    let injected = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [
        { path: rawPath, content: "new raw\n", mode: 0o600, replaceExisting: false },
        { path: reviewedPath, content: "new reviewed\n", mode: 0o644, replaceExisting: true },
        { path: supportedPath, content: "new supported\n", mode: 0o644, replaceExisting: true },
      ],
    }, {
      linkFile: async (source, target) => {
        if (!injected && target === rawPath) {
          injected = true;
          await writeFile(rawPath, "competing raw\n", { flag: "wx", mode: 0o600 });
        }
        return link(source, target);
      },
    }), /replacement was not authorised/u);
    assert.equal(await readFile(rawPath, "utf8"), "competing raw\n");
    assert.equal(await readFile(reviewedPath, "utf8"), "old reviewed\n");
    assert.equal(await readFile(supportedPath, "utf8"), "old supported\n");
  });
});

test("a late public target is preserved when only raw replacement was authorised", async () => {
  await withTemporaryRepository(async (root) => {
    const rawPath = join(root, ".evals", "raw.json");
    const reviewedPath = join(root, "docs", "reviewed.json");
    const supportedPath = join(root, "docs", "supported.json");
    await mkdir(dirname(rawPath), { recursive: true });
    await mkdir(dirname(reviewedPath), { recursive: true });
    await writeFile(rawPath, "old raw\n", { mode: 0o600 });
    let injected = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [
        { path: rawPath, content: "new raw\n", mode: 0o600, replaceExisting: true },
        { path: reviewedPath, content: "new reviewed\n", mode: 0o644, replaceExisting: false },
        { path: supportedPath, content: "new supported\n", mode: 0o644, replaceExisting: false },
      ],
    }, {
      linkFile: async (source, target) => {
        if (!injected && target === reviewedPath) {
          injected = true;
          await writeFile(reviewedPath, "competing reviewed\n", { flag: "wx" });
        }
        return link(source, target);
      },
    }), /replacement was not authorised/u);
    assert.equal(await readFile(rawPath, "utf8"), "old raw\n");
    assert.equal(await readFile(reviewedPath, "utf8"), "competing reviewed\n");
    await assert.rejects(readFile(supportedPath), /ENOENT/u);
  });
});

test("an overwrite-authorised but unbacked late target is preserved with the rest of the set", async () => {
  await withTemporaryRepository(async (root) => {
    const firstPath = join(root, "first.json");
    const secondPath = join(root, "second.json");
    await writeFile(secondPath, "old second\n");
    let injected = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      overwrite: true,
      entries: [
        { path: firstPath, content: "new first\n", mode: 0o644 },
        { path: secondPath, content: "new second\n", mode: 0o644 },
      ],
    }, {
      linkFile: async (source, target) => {
        if (!injected && target === firstPath) {
          injected = true;
          await writeFile(firstPath, "late first\n", { flag: "wx" });
        }
        return link(source, target);
      },
    }), /appeared after the replacement backup window/u);
    assert.equal(await readFile(firstPath, "utf8"), "late first\n");
    assert.equal(await readFile(secondPath, "utf8"), "old second\n");
    assert.deepEqual((await readdir(root)).sort(), ["first.json", "second.json"]);
  });
});

test("a staging failure does not remove a temporary path the transaction did not create", async () => {
  await withTemporaryRepository(async (root) => {
    const removals = [];
    let preExistingStage;
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          accessFile: async (path) => readFile(path),
          statPath: lstat,
          renameFile: rename,
          removeFile: async (path) => {
            removals.push(path);
          },
          writeFile: async (path) => {
            preExistingStage = path;
            await writeFile(path, "pre-existing stage\n", { flag: "wx" });
            const error = new Error("synthetic exclusive staging failure");
            error.code = "EEXIST";
            throw error;
          },
        },
      ),
      /synthetic exclusive staging failure/u,
    );
    assert.deepEqual(removals, []);
    assert.equal(await readFile(preExistingStage, "utf8"), "pre-existing stage\n");
  });
});

test("a partial staging write is removed after the write rejects", async () => {
  await withTemporaryRepository(async (root) => {
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          writeFile: async (path) => {
            await writeFile(path, "partial evidence", { flag: "wx" });
            const error = new Error("synthetic partial-write failure");
            error.code = "ENOSPC";
            throw error;
          },
        },
      ),
      /synthetic partial-write failure/u,
    );
    assert.deepEqual(await readdir(root), []);
  });
});

test("a regular-file swap before the first stage inspection is rejected", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "evidence.json");
    let stagePath;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "intended evidence\n", mode: 0o644, replaceExisting: false }],
    }, {
      writeFile: async (path, content, options) => {
        stagePath = path;
        await writeFile(path, content, options);
        await rm(path);
        await writeFile(path, "attacker evidence\n", { flag: "wx" });
      },
    }), /differs from the intended evidence bytes/u);

    await assert.rejects(readFile(target), /ENOENT/u);
    assert.equal(await readFile(stagePath, "utf8"), "attacker evidence\n");
  });
});

test("a symbolic-link swap before the first stage inspection is rejected without promotion", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "evidence.json");
    const referent = join(root, "referent.json");
    await writeFile(referent, "referent remains\n");
    let stagePath;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "intended evidence\n", mode: 0o644, replaceExisting: false }],
    }, {
      writeFile: async (path, content, options) => {
        stagePath = path;
        await writeFile(path, content, options);
        await rm(path);
        await symlink(referent, path);
      },
    }), /regular non-symbolic file/u);

    await assert.rejects(readFile(target), /ENOENT/u);
    assert.equal((await lstat(stagePath)).isSymbolicLink(), true);
    assert.equal(await readFile(referent, "utf8"), "referent remains\n");
  });
});

test("a late parent swap during staging cannot admit or overwrite evidence outside the repository", async () => {
  const outside = await mkdtemp(join(tmpdir(), "govuk-webmcp-evidence-admission-parent-outside-"));
  try {
    await withTemporaryRepository(async (root) => {
      const parent = join(root, "evidence");
      const target = join(parent, "evidence.json");
      const externalTarget = join(outside, "evidence.json");
      await mkdir(parent);
      await writeFile(externalTarget, "external writer remains\n");
      let externalStage;
      let injected = false;

      await assert.rejects(admitEvidenceSet({
        repositoryRoot: root,
        entries: [{ path: target, content: "candidate evidence\n", mode: 0o644, replaceExisting: false }],
      }, {
        writeFile: async (path, content, options) => {
          if (!injected && path.includes(".admit-stage-")) {
            injected = true;
            await rm(parent, { recursive: true });
            await symlink(outside, parent);
            externalStage = join(outside, basename(path));
          }
          return writeFile(path, content, options);
        },
      }), /validated parent chain changed|ancestor changed identity or type/u);

      assert.equal((await lstat(parent)).isSymbolicLink(), true);
      assert.equal(await readFile(externalTarget, "utf8"), "external writer remains\n");
      assert.equal(await readFile(externalStage, "utf8"), "candidate evidence\n");
      assert.deepEqual(
        (await readdir(outside)).sort(),
        [basename(externalStage), "evidence.json"].sort(),
      );
    });
  } finally {
    await rm(outside, { recursive: true, force: true });
  }
});

test("a backed target that reappears is preserved with its recoverable backup", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "left.json");
    await writeFile(target, "old evidence\n");
    let injected = false;
    await assert.rejects(
      admitEvidenceSet({
        repositoryRoot: root,
        overwrite: true,
        entries: [{ path: target, content: "new evidence\n", mode: 0o644 }],
      }, {
        linkFile: async (source, destination) => {
          if (!injected && source.includes(".admit-stage-")) {
            injected = true;
            await writeFile(destination, "late evidence\n", { flag: "wx" });
          }
          return link(source, destination);
        },
      }),
      /rollback could not restore|replacement backup window/u,
    );
    assert.equal(await readFile(target, "utf8"), "late evidence\n");
    const backup = (await readdir(root)).find((name) => name.includes(".admit-backup-"));
    assert.ok(backup);
    assert.equal(await readFile(join(root, backup), "utf8"), "old evidence\n");
  });
});

test("rollback preserves a writer replacement of an already promoted target", async () => {
  await withTemporaryRepository(async (root) => {
    let promotion = 0;
    const firstTarget = join(root, "left.json");
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          linkFile: async (source, target) => {
            if (source.includes(".admit-stage-")) {
              promotion += 1;
              if (promotion === 1) {
                await link(source, target);
                await rm(target);
                await writeFile(target, "writer replacement\n", { flag: "wx" });
                return;
              }
              throw new Error("synthetic later promotion failure");
            }
            return link(source, target);
          },
        },
      ),
      /rollback could not restore|synthetic later promotion failure/u,
    );
    assert.equal(await readFile(firstTarget, "utf8"), "writer replacement\n");
  });
});

test("rollback preserves an in-place byte change to an already promoted target", async () => {
  await withTemporaryRepository(async (root) => {
    let promotion = 0;
    const firstTarget = join(root, "left.json");
    await assert.rejects(
      admitPublicEvidencePair(
        { repositoryRoot: root, entries: entries(root), overwrite: false },
        {
          linkFile: async (source, target) => {
            if (source.includes(".admit-stage-")) {
              promotion += 1;
              if (promotion === 2) {
                await writeFile(firstTarget, "changed!\n");
                throw new Error("synthetic later promotion failure");
              }
            }
            return link(source, target);
          },
        },
      ),
      /rollback could not restore/u,
    );
    assert.equal(await readFile(firstTarget, "utf8"), "changed!\n");
  });
});

test("evidence admission normalises a restrictive creation mode before validation", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "reviewed.json");
    await admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "reviewed evidence\n", mode: 0o644, replaceExisting: false }],
    }, {
      writeFile: (path, content, options) => writeFile(path, content, {
        ...options,
        mode: options.mode & ~0o077,
      }),
    });
    assert.equal(await readFile(target, "utf8"), "reviewed evidence\n");
    assert.equal((await lstat(target)).mode & 0o777, 0o644);
  });
});

test("evidence admission rejects permissions that drift after descriptor-bound normalisation", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "private.json");
    let stagePath;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "private evidence\n", mode: 0o600, replaceExisting: false }],
    }, {
      writeFile: async (path, content, options) => {
        stagePath = path;
        await writeFile(path, content, options);
      },
      openFile: async (...arguments_) => {
        const handle = await open(...arguments_);
        return {
          stat: (...statArguments) => handle.stat(...statArguments),
          chmod: async (mode) => {
            await handle.chmod(mode);
            await handle.chmod(0o644);
          },
          close: () => handle.close(),
        };
      },
    }), /wrong permissions after mode normalisation/u);
    await assert.rejects(readFile(target), /ENOENT/u);
    assert.equal((await lstat(stagePath)).mode & 0o777, 0o644);
  });
});

test("a backup-name collision preserves both the original and colliding file", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "left.json");
    await writeFile(target, "original evidence\n");
    let collisionPath;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      overwrite: true,
      entries: [{ path: target, content: "replacement evidence\n", mode: 0o644 }],
    }, {
      linkFile: async (source, destination) => {
        if (destination.includes(".admit-backup-")) {
          collisionPath = destination;
          await writeFile(destination, "backup collision\n", { flag: "wx" });
        }
        return link(source, destination);
      },
    }), /EEXIST/u);
    assert.equal(await readFile(target, "utf8"), "original evidence\n");
    assert.equal(await readFile(collisionPath, "utf8"), "backup collision\n");
  });
});

test("promotion rejects a stage that changed identity before linking", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "left.json");
    let swapped = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "validated evidence\n", mode: 0o644, replaceExisting: false }],
    }, {
      linkFile: async (source, destination) => {
        if (!swapped && source.includes(".admit-stage-")) {
          swapped = true;
          await rm(source);
          await writeFile(source, "malicious evidence\n", { flag: "wx" });
        }
        return link(source, destination);
      },
    }), /rollback could not restore|does not match its validated stage/u);
    assert.equal(await readFile(target, "utf8"), "malicious evidence\n");
    const preservedStage = (await readdir(root)).find((name) => name.includes(".admit-stage-"));
    assert.ok(preservedStage);
    assert.equal(await readFile(join(root, preservedStage), "utf8"), "malicious evidence\n");
  });
});

test("a writer replacing a committed target during stage clean-up prevents success", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "evidence.json");
    let injected = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "intended evidence\n", mode: 0o644, replaceExisting: false }],
    }, {
      removeFile: async (path) => {
        if (!injected && path.includes(".admit-stage-")) {
          injected = true;
          await rm(target);
          await writeFile(target, "late writer\n", { flag: "wx" });
        }
        return rm(path);
      },
    }), /rollback could not restore|committed public-evidence target before backup clean-up/u);
    assert.equal(await readFile(target, "utf8"), "late writer\n");
  });
});

test("a writer replacing a committed target during backup clean-up prevents success", async () => {
  await withTemporaryRepository(async (root) => {
    const target = join(root, "evidence.json");
    await writeFile(target, "old evidence\n");
    let injected = false;
    await assert.rejects(admitEvidenceSet({
      repositoryRoot: root,
      entries: [{ path: target, content: "intended evidence\n", mode: 0o644, replaceExisting: true }],
    }, {
      removeFile: async (path) => {
        if (!injected && path.includes(".admit-backup-")) {
          injected = true;
          await rm(target);
          await writeFile(target, "late writer\n", { flag: "wx" });
        }
        return rm(path);
      },
    }), /could not be verified after transaction clean-up/u);
    assert.equal(await readFile(target, "utf8"), "late writer\n");
    const recoveryName = (await readdir(root))
      .find((name) => name.startsWith(".evidence.json.admit-recovery-"));
    assert.ok(recoveryName);
    const recoveryPath = join(root, recoveryName);
    assert.equal(await readFile(recoveryPath, "utf8"), "intended evidence\n");
    assert.equal((await lstat(recoveryPath)).mode & 0o777, 0o600);
  });
});

test("public evidence admission rejects path escape and symbolic targets", async () => {
  await withTemporaryRepository(async (root) => {
    await assert.rejects(
      admitPublicEvidencePair({
        repositoryRoot: root,
        entries: [
          { path: resolve(root, "../outside.json"), content: "outside\n" },
          { path: join(root, "right.json"), content: "right\n" },
        ],
        overwrite: false,
      }),
      /stay inside the repository root/u,
    );

    await writeFile(join(root, "real.json"), "unchanged\n");
    await symlink(join(root, "real.json"), join(root, "left.json"));
    await assert.rejects(
      admitPublicEvidencePair({ repositoryRoot: root, entries: entries(root), overwrite: true }),
      /must not be a symbolic link/u,
    );
    assert.equal(await readFile(join(root, "real.json"), "utf8"), "unchanged\n");
  });
});
