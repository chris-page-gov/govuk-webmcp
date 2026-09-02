#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { link, lstat, open, readFile, realpath, unlink, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const dependencyVersion = "0.0.4";
const originalSha256 = "47ea1ae60866875414e653352c362f09c0740c24a9a6667cd22d72054e244fae";
const patchedSha256 = "c6612091f9bb5f134cdaccee086ec64cba39d155b7103ce5770e480c1a6ef864";
const sourceNeedle = [
  "            const agentWithExec = new ToolLoopAgent({",
  "                model: this.aiModel,",
  "                tools: aiToolsWithExecution,",
  "                instructions: SYSTEM_PROMPT,",
  "",
].join("\n");
const patchedNeedle = [
  "            const agentWithExec = new ToolLoopAgent({",
  "                model: this.aiModel,",
  "                tools: aiToolsWithExecution,",
  "                instructions: SYSTEM_PROMPT,",
  "                stopWhen: stepCountIs(this.maxSteps),",
  "",
].join("\n");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function patchBrowserStepLimitSource(source) {
  const observedSha256 = sha256(source);
  if (observedSha256 === patchedSha256) {
    return { changed: false, source, sha256: observedSha256 };
  }
  if (observedSha256 !== originalSha256) {
    throw new Error(
      `webmcp-evals browser backend has an unreviewed digest ${observedSha256}; refusing to patch it.`,
    );
  }
  const occurrences = source.split(sourceNeedle).length - 1;
  if (occurrences !== 1) {
    throw new Error("webmcp-evals browser backend does not contain the one reviewed patch location.");
  }
  const patched = source.replace(sourceNeedle, patchedNeedle);
  const outputSha256 = sha256(patched);
  if (outputSha256 !== patchedSha256) {
    throw new Error("webmcp-evals browser step-limit patch did not produce the reviewed digest.");
  }
  return { changed: true, source: patched, sha256: outputSha256 };
}

function sameIdentity(state, identity) {
  return state.dev === identity?.device && state.ino === identity?.inode;
}

function identityOf(state) {
  return { device: state.dev, inode: state.ino };
}

async function snapshotRegularFile(
  path,
  label,
  lstatImplementation,
  openImplementation,
  { expectedIdentity = null, expectedMode = null, chmodMode = null } = {},
) {
  let handle;
  try {
    handle = await openImplementation(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    if (["ELOOP", "ENOTDIR"].includes(error?.code)) {
      throw new Error(`${label} must be a regular non-symbolic file.`, { cause: error });
    }
    throw error;
  }
  try {
    const before = await handle.stat();
    const pathBefore = await lstatImplementation(path);
    if (!before.isFile() || pathBefore.isSymbolicLink() || !pathBefore.isFile()) {
      throw new Error(`${label} must be a regular non-symbolic file.`);
    }
    const openedIdentity = identityOf(before);
    if (!sameIdentity(pathBefore, openedIdentity) || (expectedIdentity && !sameIdentity(before, expectedIdentity))) {
      throw new Error(`${label} changed identity.`);
    }
    if (chmodMode !== null) await handle.chmod(chmodMode);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    const pathAfter = await lstatImplementation(path);
    if (!sameIdentity(after, openedIdentity) || !sameIdentity(pathAfter, openedIdentity)) {
      throw new Error(`${label} changed identity while its bytes were read.`);
    }
    const observedMode = after.mode & 0o7777;
    if (after.size !== bytes.byteLength) {
      throw new Error(`${label} changed size while its bytes were read.`);
    }
    if (expectedMode !== null && observedMode !== expectedMode) {
      throw new Error(`${label} has unsafe or unexpected permissions.`);
    }
    return {
      bytes,
      identity: identityOf(after),
      mode: observedMode,
      size: bytes.byteLength,
      sha256: sha256(bytes),
    };
  } finally {
    await handle.close();
  }
}

async function validateExactRegularFile(
  path,
  { identity = null, expectedMode = null, expectedSha256, expectedSize, label },
  lstatImplementation,
  openImplementation,
  { chmodMode = null } = {},
) {
  const snapshot = await snapshotRegularFile(path, label, lstatImplementation, openImplementation, {
    expectedIdentity: identity,
    expectedMode,
    chmodMode,
  });
  if (identity && !sameIdentity({ dev: snapshot.identity.device, ino: snapshot.identity.inode }, identity)) {
    throw new Error(`${label} changed identity.`);
  }
  if (snapshot.size !== expectedSize || snapshot.sha256 !== expectedSha256) {
    throw new Error(`${label} has unexpected bytes.`);
  }
  return snapshot.identity;
}

async function removeIdentityBoundFile(path, identity, lstatImplementation, unlinkImplementation) {
  let state;
  try {
    state = await lstatImplementation(path);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (!sameIdentity(state, identity)) {
    throw new Error(`The webmcp-evals patch path changed identity and was preserved for manual recovery: ${path}`);
  }
  await unlinkImplementation(path);
}

async function createVerifiedRecoveryCopy(path, snapshot, {
  writeFileImplementation,
  lstatImplementation,
  openImplementation,
  label,
}) {
  const failures = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const recoveryPath = `${path}.recovery-${process.pid}-${randomUUID()}`;
    let created = false;
    try {
      await writeFileImplementation(recoveryPath, snapshot.bytes, {
        flag: "wx",
        mode: snapshot.mode,
      });
      created = true;
      const recoveryIdentity = await validateExactRegularFile(recoveryPath, {
        expectedMode: snapshot.mode,
        expectedSha256: snapshot.sha256,
        expectedSize: snapshot.size,
        label,
      }, lstatImplementation, openImplementation, { chmodMode: snapshot.mode });
      return { identity: recoveryIdentity, path: recoveryPath };
    } catch (error) {
      failures.push(error);
      if (!created && error?.code !== "EEXIST") throw error;
    }
  }
  throw new AggregateError(failures, `${label} could not reserve and verify an exclusive recovery path.`);
}

export async function replaceWithExclusiveStage(path, source, mode, {
  writeFileImplementation = writeFile,
  linkImplementation = link,
  lstatImplementation = lstat,
  openImplementation = open,
  unlinkImplementation = unlink,
  idFactory = randomUUID,
  expectedDestination = null,
} = {}) {
  const safeMode = mode & 0o7777;
  if ((safeMode & 0o7000) !== 0 || (safeMode & 0o022) !== 0 || (safeMode & 0o600) !== 0o600) {
    throw new Error("The webmcp-evals browser backend mode must be owner-readable and writable with no special or group/other write bits.");
  }
  const identifier = idFactory();
  const temporaryPath = `${path}.tmp-${process.pid}-${identifier}`;
  const backupPath = `${path}.backup-${process.pid}-${identifier}`;
  const rollbackPath = `${path}.rollback-${process.pid}-${identifier}`;
  const intendedBytes = Buffer.from(source, "utf8");
  const intendedSha256 = sha256(intendedBytes);
  const intendedSize = intendedBytes.byteLength;
  let stagedIdentity = null;
  let backupIdentity = null;
  let promotedIdentity = null;
  let rollbackIdentity = null;
  let originalSnapshot = null;
  let preserveRollbackIdentity = false;
  try {
    try {
      await writeFileImplementation(temporaryPath, source, {
        encoding: "utf8",
        flag: "wx",
        mode: safeMode,
      });
      stagedIdentity = await validateExactRegularFile(temporaryPath, {
        expectedSha256: intendedSha256,
        expectedSize: intendedSize,
        label: "The webmcp-evals patch stage",
      }, lstatImplementation, openImplementation);
    } catch (error) {
      if (error?.code !== "EEXIST") {
        try {
          const state = await lstatImplementation(temporaryPath);
          // A failed exclusive write may leave a partial file owned by this
          // transaction. A completed write whose first validated inspection
          // finds different bytes or a symbolic link is not claimed here.
          if (!stagedIdentity && error?.message?.includes("patch stage") !== true) {
            stagedIdentity = identityOf(state);
          }
        } catch (statError) {
          if (statError?.code !== "ENOENT") {
            throw new AggregateError([error, statError], "The partial webmcp-evals patch stage could not be identified");
          }
        }
      }
      throw error;
    }
    await validateExactRegularFile(temporaryPath, {
      identity: stagedIdentity,
      expectedSha256: intendedSha256,
      expectedSize: intendedSize,
      label: "The webmcp-evals patch stage after mode enforcement",
      expectedMode: safeMode,
    }, lstatImplementation, openImplementation, { chmodMode: safeMode });
    const initialSnapshot = await snapshotRegularFile(
      path,
      "The webmcp-evals browser backend before replacement",
      lstatImplementation,
      openImplementation,
    );
    const before = await lstatImplementation(path);
    const effectiveDestination = expectedDestination ?? {
      device: initialSnapshot.identity.device,
      inode: initialSnapshot.identity.inode,
      sha256: initialSnapshot.sha256,
    };
    if (!sameIdentity(before, effectiveDestination)) {
      throw new Error("The webmcp-evals browser backend changed identity before replacement.");
    }
    if (
      (initialSnapshot.mode & 0o7000) !== 0
      || (initialSnapshot.mode & 0o022) !== 0
      || (initialSnapshot.mode & 0o400) !== 0o400
    ) {
      throw new Error("The webmcp-evals browser backend has unsafe permissions before replacement.");
    }
    await validateExactRegularFile(path, {
      identity: effectiveDestination,
      expectedMode: initialSnapshot.mode,
      expectedSha256: effectiveDestination.sha256,
      expectedSize: initialSnapshot.size,
      label: "The webmcp-evals browser backend before replacement",
    }, lstatImplementation, openImplementation);
    originalSnapshot = {
      bytes: initialSnapshot.bytes,
      identity: { device: effectiveDestination.device, inode: effectiveDestination.inode },
      mode: initialSnapshot.mode,
      sha256: effectiveDestination.sha256,
      size: initialSnapshot.size,
    };

    await linkImplementation(path, backupPath);
    backupIdentity = await validateExactRegularFile(backupPath, {
      identity: originalSnapshot.identity,
      expectedMode: originalSnapshot.mode,
      expectedSha256: originalSnapshot.sha256,
      expectedSize: originalSnapshot.size,
      label: "The webmcp-evals browser backend backup",
    }, lstatImplementation, openImplementation);
    await validateExactRegularFile(path, {
      identity: effectiveDestination,
      expectedMode: originalSnapshot.mode,
      expectedSha256: effectiveDestination.sha256,
      expectedSize: originalSnapshot.size,
      label: "The webmcp-evals browser backend at the replacement boundary",
    }, lstatImplementation, openImplementation);
    await unlinkImplementation(path);
    try {
      await linkImplementation(temporaryPath, path);
    } catch (error) {
      if (error?.code === "EEXIST") {
        throw new Error("A competing writer created the webmcp-evals browser backend after the backup window; it was preserved.", { cause: error });
      }
      throw error;
    }
    const promotedState = await lstatImplementation(path);
    if (!sameIdentity(promotedState, stagedIdentity)) {
      throw new Error("The promoted webmcp-evals browser backend does not match its validated stage.");
    }
    promotedIdentity = stagedIdentity;
    await validateExactRegularFile(path, {
      identity: promotedIdentity,
      expectedMode: safeMode,
      expectedSha256: intendedSha256,
      expectedSize: intendedSize,
      label: "The promoted webmcp-evals browser backend",
    }, lstatImplementation, openImplementation);
    await removeIdentityBoundFile(temporaryPath, stagedIdentity, lstatImplementation, unlinkImplementation);
    stagedIdentity = null;
    await validateExactRegularFile(path, {
      identity: promotedIdentity,
      expectedMode: safeMode,
      expectedSha256: intendedSha256,
      expectedSize: intendedSize,
      label: "The promoted webmcp-evals browser backend after stage clean-up",
    }, lstatImplementation, openImplementation);
    await validateExactRegularFile(backupPath, {
      identity: backupIdentity,
      expectedMode: originalSnapshot.mode,
      expectedSha256: originalSnapshot.sha256,
      expectedSize: originalSnapshot.size,
      label: "The webmcp-evals recovery backup before transaction clean-up",
    }, lstatImplementation, openImplementation);
    await removeIdentityBoundFile(backupPath, backupIdentity, lstatImplementation, unlinkImplementation);
    backupIdentity = null;
    await validateExactRegularFile(path, {
      identity: promotedIdentity,
      expectedMode: safeMode,
      expectedSha256: intendedSha256,
      expectedSize: intendedSize,
      label: "The promoted webmcp-evals browser backend after transaction clean-up",
    }, lstatImplementation, openImplementation);
    promotedIdentity = null;
  } catch (error) {
    const rollbackErrors = [];
    let targetIsPromoted = false;
    if (promotedIdentity) {
      try {
        await validateExactRegularFile(path, {
          identity: promotedIdentity,
          expectedMode: safeMode,
          expectedSha256: intendedSha256,
          expectedSize: intendedSize,
          label: "The promoted webmcp-evals browser backend during rollback",
        }, lstatImplementation, openImplementation);
        targetIsPromoted = true;
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }

    // Pin the validated original inode to a second hard link before removing a
    // valid promoted target. A mutable backup pathname is never trusted after
    // that destructive boundary.
    if (backupIdentity && targetIsPromoted) {
      try {
        await validateExactRegularFile(backupPath, {
          identity: backupIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The webmcp-evals recovery backup",
        }, lstatImplementation, openImplementation);
        await linkImplementation(backupPath, rollbackPath);
        rollbackIdentity = await validateExactRegularFile(rollbackPath, {
          identity: backupIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The pinned webmcp-evals rollback copy",
        }, lstatImplementation, openImplementation);
        await removeIdentityBoundFile(path, promotedIdentity, lstatImplementation, unlinkImplementation);
        promotedIdentity = null;
        await linkImplementation(rollbackPath, path);
        await validateExactRegularFile(path, {
          identity: rollbackIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The restored webmcp-evals browser backend",
        }, lstatImplementation, openImplementation);
        await removeIdentityBoundFile(backupPath, backupIdentity, lstatImplementation, unlinkImplementation);
        backupIdentity = null;
        await validateExactRegularFile(path, {
          identity: rollbackIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The restored webmcp-evals browser backend after backup clean-up",
        }, lstatImplementation, openImplementation);
        await removeIdentityBoundFile(rollbackPath, rollbackIdentity, lstatImplementation, unlinkImplementation);
        await validateExactRegularFile(path, {
          identity: rollbackIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The restored webmcp-evals browser backend after rollback-link clean-up",
        }, lstatImplementation, openImplementation);
        rollbackIdentity = null;
      } catch (rollbackError) {
        if (backupIdentity === null && promotedIdentity === null && originalSnapshot) {
          try {
            await createVerifiedRecoveryCopy(path, originalSnapshot, {
              writeFileImplementation,
              lstatImplementation,
              openImplementation,
              label: "The recoverable original webmcp-evals backend",
            });
          } catch (recoveryError) {
            preserveRollbackIdentity = true;
            rollbackErrors.push(recoveryError);
          }
        }
        rollbackErrors.push(new Error(
          `The webmcp-evals recovery backup changed identity or bytes; the promoted backend and recovery artefacts were preserved: ${backupPath}`,
          { cause: rollbackError },
        ));
      }
    }

    if (backupIdentity && !targetIsPromoted) {
      try {
        await validateExactRegularFile(backupPath, {
          identity: backupIdentity,
          expectedMode: originalSnapshot.mode,
          expectedSha256: originalSnapshot.sha256,
          expectedSize: originalSnapshot.size,
          label: "The recoverable webmcp-evals browser backend backup",
        }, lstatImplementation, openImplementation);
        throw new Error(`A competing webmcp-evals browser backend and its recoverable backup were preserved: ${backupPath}`);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }

    // If the final destination changed after all other links had been cleaned
    // up, preserve a fresh exact recovery copy rather than reporting a false
    // success with no known-good bytes left on disk.
    if (promotedIdentity && backupIdentity === null && !targetIsPromoted) {
      try {
        const recovery = await createVerifiedRecoveryCopy(path, {
          bytes: intendedBytes,
          mode: safeMode,
          sha256: intendedSha256,
          size: intendedSize,
        }, {
          writeFileImplementation,
          lstatImplementation,
          openImplementation,
          label: "The recoverable promoted webmcp-evals backend",
        });
        throw new Error(`The destination changed after transaction clean-up; exact promoted bytes were preserved for manual recovery: ${recovery.path}`);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length > 0) {
      const rollbackSummary = rollbackErrors
        .map((rollbackError) => rollbackError instanceof Error ? rollbackError.message : String(rollbackError))
        .join("; ");
      throw new AggregateError(
        [error, ...rollbackErrors],
        `The webmcp-evals patch failed and rollback was incomplete: ${rollbackSummary}`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    if (stagedIdentity) {
      try {
        await removeIdentityBoundFile(temporaryPath, stagedIdentity, lstatImplementation, unlinkImplementation);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
    if (rollbackIdentity && !preserveRollbackIdentity) {
      try {
        await removeIdentityBoundFile(rollbackPath, rollbackIdentity, lstatImplementation, unlinkImplementation);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
  }
}

export async function applyWebmcpEvalsBrowserStepLimitPatch(root = repositoryRoot, {
  finalOpenImplementation = open,
} = {}) {
  const packagePath = resolve(root, "node_modules/webmcp-evals/package.json");
  const backendPath = resolve(root, "node_modules/webmcp-evals/dist/backends/vercel.js");
  const [rootReal, packageReal, backendReal, packageStat, backendStat] = await Promise.all([
    realpath(root),
    realpath(packagePath),
    realpath(backendPath),
    lstat(packagePath),
    lstat(backendPath),
  ]);
  for (const [label, path, information] of [
    ["package metadata", packageReal, packageStat],
    ["browser backend", backendReal, backendStat],
  ]) {
    const fromRoot = relative(rootReal, path);
    if (!information.isFile() || information.isSymbolicLink()
        || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
      throw new Error(`webmcp-evals ${label} must be a regular non-symbolic file inside the repository.`);
    }
  }
  const package_ = JSON.parse(await readFile(packagePath, "utf8"));
  if (package_?.name !== "webmcp-evals" || package_.version !== dependencyVersion) {
    throw new Error(`The reviewed patch applies only to webmcp-evals ${dependencyVersion}.`);
  }
  const existing = await readFile(backendPath, "utf8");
  const backendMode = backendStat.mode & 0o7777;
  if ((backendMode & 0o7000) !== 0 || (backendMode & 0o022) !== 0 || (backendMode & 0o600) !== 0o600) {
    throw new Error("The reviewed webmcp-evals browser backend has unsafe permissions.");
  }
  const result = patchBrowserStepLimitSource(existing);
  if (result.changed) {
    await replaceWithExclusiveStage(backendPath, result.source, backendStat.mode, {
      expectedDestination: {
        device: backendStat.dev,
        inode: backendStat.ino,
        sha256: originalSha256,
      },
    });
  }
  await validateExactRegularFile(backendPath, {
    identity: result.changed ? null : { device: backendStat.dev, inode: backendStat.ino },
    expectedMode: backendMode,
    expectedSha256: patchedSha256,
    expectedSize: Buffer.byteLength(result.source, "utf8"),
    label: "The final webmcp-evals browser backend",
  }, lstat, finalOpenImplementation);
  process.stdout.write(
    `webmcp-evals ${dependencyVersion} browser step limit ${result.changed ? "patched" : "verified"} (${result.sha256}).\n`,
  );
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  applyWebmcpEvalsBrowserStepLimitPatch().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
