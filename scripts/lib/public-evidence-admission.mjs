import { createHash, randomUUID } from "node:crypto";
import {
  access,
  link,
  lstat,
  readFile,
  realpath,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

const MAX_PUBLIC_EVIDENCE_BYTES = 16 * 1024 * 1024;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function isWithin(root, candidate) {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot !== ""
    && pathFromRoot !== ".."
    && !pathFromRoot.startsWith(`..${sep}`)
    && !isAbsolute(pathFromRoot);
}

async function pathExists(path, fileSystem, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, "Public-evidence existence check before inspection");
  try {
    await fileSystem.accessFile(path);
    await validateAncestorBinding(ancestorBinding, fileSystem, "Public-evidence existence check after inspection");
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      await validateAncestorBinding(ancestorBinding, fileSystem, "Public-evidence existence check after missing path");
      return false;
    }
    throw error;
  }
}

async function assertSafeTarget(root, target, fileSystem) {
  invariant(isAbsolute(target), "A public-evidence target must be an absolute path.");
  invariant(isWithin(root, target), "A public-evidence target must stay inside the repository root.");

  const parent = dirname(target);
  let current = root;
  const parentFromRoot = relative(root, parent);
  for (const component of parentFromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, component);
    const state = await fileSystem.statPath(current);
    invariant(!state.isSymbolicLink(), "A public-evidence target directory must not be a symbolic link.");
    invariant(state.isDirectory(), "A public-evidence target parent must be a directory.");
  }

  try {
    const state = await fileSystem.statPath(target);
    invariant(!state.isSymbolicLink(), "An existing public-evidence target must not be a symbolic link.");
    invariant(state.isFile(), "An existing public-evidence target must be a regular file.");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const defaultFileSystem = Object.freeze({
  accessFile: access,
  linkFile: link,
  statPath: lstat,
  readFile,
  realPath: realpath,
  renameFile: rename,
  removeFile: unlink,
  writeFile,
});

function identityOf(state) {
  return { device: state.dev, inode: state.ino };
}

function hasIdentity(state, identity) {
  return state.dev === identity?.device && state.ino === identity?.inode;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function validateAncestorBinding(binding, fileSystem, label) {
  if (!binding) return;
  for (const item of binding.chain) {
    let state;
    try {
      state = await fileSystem.statPath(item.path);
    } catch (error) {
      throw new Error(`${label} ancestor is unavailable: ${item.path}`, { cause: error });
    }
    invariant(
      state.isDirectory() && !state.isSymbolicLink() && hasIdentity(state, item.identity),
      `${label} ancestor changed identity or type: ${item.path}`,
    );
    const observedRealPath = await fileSystem.realPath(item.path);
    invariant(
      observedRealPath === item.realPath
        && (observedRealPath === binding.rootRealPath || isWithin(binding.rootRealPath, observedRealPath)),
      `${label} ancestor resolves outside its validated repository binding: ${item.path}`,
    );
  }
}

async function bindAncestorChain(root, rootRealPath, parent, fileSystem) {
  invariant(parent === root || isWithin(root, parent), "A public-evidence parent must stay inside the repository root.");
  const chain = [];
  const fromRoot = relative(root, parent);
  let current = root;
  for (const component of [null, ...fromRoot.split(sep).filter(Boolean)]) {
    if (component !== null) current = resolve(current, component);
    const state = await fileSystem.statPath(current);
    invariant(state.isDirectory() && !state.isSymbolicLink(), "A public-evidence ancestor must be a non-symbolic directory.");
    const observedRealPath = await fileSystem.realPath(current);
    invariant(
      observedRealPath === rootRealPath || isWithin(rootRealPath, observedRealPath),
      "A public-evidence ancestor must resolve inside the repository root.",
    );
    chain.push({ path: current, identity: identityOf(state), realPath: observedRealPath });
  }
  const binding = { chain, rootRealPath };
  await validateAncestorBinding(binding, fileSystem, "Public-evidence parent binding");
  return binding;
}

async function runBoundMutation(binding, fileSystem, label, operation) {
  // Node does not expose openat-style directory-relative mutation. These
  // checks therefore bind and reject every observable ancestor change around
  // the syscall, but cannot make the pathname lookup atomic against a process
  // that swaps and restores the complete chain inside that syscall window.
  await validateAncestorBinding(binding, fileSystem, `${label} before operation`);
  try {
    const result = await operation();
    await validateAncestorBinding(binding, fileSystem, `${label} after operation`);
    return result;
  } catch (error) {
    try {
      await validateAncestorBinding(binding, fileSystem, `${label} after failed operation`);
    } catch (bindingError) {
      throw new AggregateError(
        [error, bindingError],
        `${label} failed after its validated parent chain changed; external paths were preserved.`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function validateEvidenceBytes(path, entry, fileSystem, label, expectedIdentity = null, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} before inspection`);
  const before = await fileSystem.statPath(path);
  invariant(before.isFile() && !before.isSymbolicLink(), `${label} must be a regular non-symbolic file: ${path}`);
  if (expectedIdentity) invariant(hasIdentity(before, expectedIdentity), `${label} changed identity: ${path}`);
  const bytes = await fileSystem.readFile(path);
  const after = await fileSystem.statPath(path);
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} after inspection`);
  invariant(hasIdentity(after, identityOf(before)), `${label} changed identity while its bytes were verified: ${path}`);
  invariant(after.size === bytes.byteLength && bytes.byteLength === entry.expectedBytes.byteLength, `${label} has the wrong size: ${path}`);
  invariant(sha256(bytes) === entry.expectedSha256 && bytes.equals(entry.expectedBytes), `${label} differs from the intended evidence bytes: ${path}`);
  return identityOf(after);
}

async function snapshotRegularFile(
  path,
  label,
  fileSystem,
  expectedIdentity = null,
  retainBytes = false,
  ancestorBinding = null,
) {
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} before inspection`);
  const before = await fileSystem.statPath(path);
  invariant(before.isFile() && !before.isSymbolicLink(), `${label} must be a regular non-symbolic file: ${path}`);
  if (expectedIdentity) invariant(hasIdentity(before, expectedIdentity), `${label} changed identity: ${path}`);
  const bytes = await fileSystem.readFile(path);
  const after = await fileSystem.statPath(path);
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} after inspection`);
  invariant(hasIdentity(after, identityOf(before)), `${label} changed identity while its bytes were verified: ${path}`);
  invariant(after.size === bytes.byteLength, `${label} changed size while its bytes were verified: ${path}`);
  const snapshot = {
    identity: identityOf(after),
    sizeBytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
  if (retainBytes) snapshot.bytes = bytes;
  return snapshot;
}

async function validateSnapshot(path, snapshot, label, fileSystem, expectedIdentity, ancestorBinding = null) {
  const observed = await snapshotRegularFile(path, label, fileSystem, expectedIdentity, false, ancestorBinding);
  invariant(
    observed.sizeBytes === snapshot.sizeBytes && observed.sha256 === snapshot.sha256,
    `${label} differs from the known-good bytes: ${path}`,
  );
}

async function removeIdentityBoundFileOrThrow(path, identity, fileSystem, label, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} before removal inspection`);
  try {
    const state = await fileSystem.statPath(path);
    if (identity && !hasIdentity(state, identity)) {
      throw new Error(`${label} changed identity and was preserved for manual recovery: ${path}`);
    }
    await runBoundMutation(
      ancestorBinding,
      fileSystem,
      label,
      () => fileSystem.removeFile(path),
    );
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function removeIdentityBoundFile(path, identity, fileSystem, failures, label, ancestorBinding = null) {
  try {
    await removeIdentityBoundFileOrThrow(path, identity, fileSystem, label, ancestorBinding);
  } catch (error) {
    failures.push(error);
  }
}

async function createVerifiedRecoveryCopy(destination, snapshot, label, fileSystem, ancestorBinding) {
  invariant(Buffer.isBuffer(snapshot.bytes), `${label} does not have retained recovery bytes: ${destination}`);
  for (let attemptIndex = 0; attemptIndex < 3; attemptIndex += 1) {
    const recovery = resolve(dirname(destination), `.${basename(destination)}.admit-recovery-${process.pid}-${randomUUID()}`);
    try {
      await runBoundMutation(
        ancestorBinding,
        fileSystem,
        label,
        () => fileSystem.writeFile(recovery, snapshot.bytes, { flag: "wx", mode: 0o600 }),
      );
    } catch (error) {
      if (error?.code === "EEXIST") continue;
      throw error;
    }
    const recoverySnapshot = await snapshotRegularFile(recovery, label, fileSystem, null, false, ancestorBinding);
    invariant(
      recoverySnapshot.sizeBytes === snapshot.sizeBytes && recoverySnapshot.sha256 === snapshot.sha256,
      `${label} differs from the known-good bytes: ${recovery}`,
    );
    return { path: recovery, identity: recoverySnapshot.identity };
  }
  throw new Error(`${label} could not reserve an exclusive recovery path for: ${destination}`);
}

async function assertPathAbsent(path, label, fileSystem, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} absence check before inspection`);
  try {
    await fileSystem.statPath(path);
  } catch (error) {
    if (error?.code === "ENOENT") {
      await validateAncestorBinding(ancestorBinding, fileSystem, `${label} absence check after inspection`);
      return;
    }
    throw error;
  }
  throw new Error(`${label} still exists after clean-up and was preserved for manual recovery: ${path}`);
}

async function ensureVerifiedRecoveryCopy(recovery, destination, snapshot, label, fileSystem, ancestorBinding) {
  try {
    await validateSnapshot(recovery.path, snapshot, label, fileSystem, recovery.identity, ancestorBinding);
    return recovery;
  } catch {
    return createVerifiedRecoveryCopy(destination, snapshot, `${label} replacement`, fileSystem, ancestorBinding);
  }
}

async function removeWithRecoveryGuard({
  cleanupPath,
  cleanupIdentity,
  destination,
  destinationIdentity,
  snapshot,
  fileSystem,
  ancestorBinding,
  label,
}) {
  const recovery = await createVerifiedRecoveryCopy(destination, snapshot, `${label} recovery copy`, fileSystem, ancestorBinding);
  try {
    await removeIdentityBoundFileOrThrow(cleanupPath, cleanupIdentity, fileSystem, label, ancestorBinding);
    await assertPathAbsent(cleanupPath, `${label} path`, fileSystem, ancestorBinding);
    await validateSnapshot(destination, snapshot, `${label} destination after backup clean-up`, fileSystem, destinationIdentity, ancestorBinding);
  } catch (error) {
    const preserved = await ensureVerifiedRecoveryCopy(
      recovery,
      destination,
      snapshot,
      `${label} recovery copy after failed backup clean-up`,
      fileSystem,
      ancestorBinding,
    );
    throw new Error(
      `${label} failed; a private known-good recovery copy was preserved for manual recovery: ${preserved.path}`,
      { cause: error },
    );
  }

  try {
    await removeIdentityBoundFileOrThrow(recovery.path, recovery.identity, fileSystem, `${label} recovery copy`, ancestorBinding);
    await assertPathAbsent(recovery.path, `${label} recovery copy`, fileSystem, ancestorBinding);
  } catch (error) {
    const preserved = await ensureVerifiedRecoveryCopy(
      recovery,
      destination,
      snapshot,
      `${label} recovery copy after failed recovery clean-up`,
      fileSystem,
      ancestorBinding,
    );
    throw new Error(
      `${label} recovery clean-up failed; a private known-good recovery copy was preserved for manual recovery: ${preserved.path}`,
      { cause: error },
    );
  }

  try {
    await validateSnapshot(destination, snapshot, `${label} destination after recovery clean-up`, fileSystem, destinationIdentity, ancestorBinding);
  } catch (error) {
    const replacement = await createVerifiedRecoveryCopy(
      destination,
      snapshot,
      `${label} replacement recovery copy`,
      fileSystem,
      ancestorBinding,
    );
    throw new Error(
      `${label} destination changed during recovery clean-up; a private known-good recovery copy was preserved for manual recovery: ${replacement.path}`,
      { cause: error },
    );
  }
}

async function rollbackAdmission({ entries, promoted, backups, staged }, fileSystem) {
  const rollbackErrors = [];
  for (const entry of [...promoted].reverse()) {
    await removeIdentityBoundFile(
      entry.path,
      entry.promotedIdentity,
      fileSystem,
      rollbackErrors,
      "A promoted public-evidence target",
      entry.ancestorBinding,
    );
  }
  for (const entry of [...backups].reverse()) {
    try {
      const backupState = await fileSystem.statPath(entry.backupPath);
      const backupIdentity = entry.backupIdentity ?? identityOf(backupState);
      if (!hasIdentity(backupState, backupIdentity)) {
        throw new Error(`A public-evidence backup changed identity and was preserved for manual recovery: ${entry.backupPath}`);
      }
      const backupSnapshot = await snapshotRegularFile(
        entry.backupPath,
        "A public-evidence backup before rollback clean-up",
        fileSystem,
        backupIdentity,
        true,
        entry.ancestorBinding,
      );
      try {
        const existingDestination = await fileSystem.statPath(entry.path);
        if (!hasIdentity(existingDestination, backupIdentity)) {
          throw new Error(`A public-evidence target changed identity and both it and the backup were preserved for manual recovery: ${entry.path}`);
        }
      } catch (destinationError) {
        if (destinationError?.code !== "ENOENT") throw destinationError;
        await runBoundMutation(
          entry.ancestorBinding,
          fileSystem,
          "Public-evidence rollback restore link",
          () => fileSystem.linkFile(entry.backupPath, entry.path),
        );
        const destinationState = await fileSystem.statPath(entry.path);
        if (!hasIdentity(destinationState, backupIdentity)) {
          throw new Error(`A restored public-evidence target changed identity and both copies were preserved for manual recovery: ${entry.path}`);
        }
      }
      await validateSnapshot(
        entry.path,
        backupSnapshot,
        "A restored public-evidence target before rollback backup clean-up",
        fileSystem,
        backupIdentity,
        entry.ancestorBinding,
      );
      await removeWithRecoveryGuard({
        cleanupPath: entry.backupPath,
        cleanupIdentity: backupIdentity,
        destination: entry.path,
        destinationIdentity: backupIdentity,
        snapshot: backupSnapshot,
        fileSystem,
        ancestorBinding: entry.ancestorBinding,
        label: "Public-evidence rollback backup clean-up",
      });
    } catch (error) {
      if (error?.code !== "ENOENT") rollbackErrors.push(error);
    }
  }
  for (const entry of entries) {
    if (staged.has(entry.path)) {
      await removeIdentityBoundFile(
        entry.temporaryPath,
        entry.stagedIdentity,
        fileSystem,
        rollbackErrors,
        "A staged public-evidence file",
        entry.ancestorBinding,
      );
    }
  }
  return rollbackErrors;
}

async function validatePromotedEvidenceSet(promoted, fileSystem, label) {
  for (const entry of promoted) {
    await validateEvidenceBytes(
      entry.path,
      entry,
      fileSystem,
      label,
      entry.promotedIdentity,
      entry.ancestorBinding,
    );
  }
}

/**
 * Admit a small related evidence set as one recoverable operation. POSIX does
 * not provide a multi-path atomic rename, so existing files are first backed
 * up and every partial promotion is rolled back before an error escapes.
 */
export async function admitEvidenceSet({
  repositoryRoot,
  entries,
  overwrite,
}, overrides = {}) {
  const fileSystem = { ...defaultFileSystem, ...overrides };
  invariant(isAbsolute(repositoryRoot), "The public-evidence repository root must be absolute.");
  invariant(Array.isArray(entries) && entries.length >= 1 && entries.length <= 3, "Evidence admission requires from one to three related files.");
  invariant(overwrite === undefined || typeof overwrite === "boolean", "Public evidence overwrite must be a boolean when supplied.");

  const rootState = await fileSystem.statPath(repositoryRoot);
  invariant(rootState.isDirectory() && !rootState.isSymbolicLink(), "The public-evidence repository root must be a non-symbolic directory.");
  const rootRealPath = await fileSystem.realPath(repositoryRoot);

  const transactionId = `${process.pid}-${randomUUID()}`;
  const prepared = [];
  for (const entry of entries) {
    const observedKeys = Object.keys(entry ?? {}).sort();
    const legacyKeys = ["content", "mode", "path"].sort();
    const policyKeys = ["content", "mode", "path", "replaceExisting"].sort();
    invariant(
      entry && typeof entry === "object" && !Array.isArray(entry)
        && (
          JSON.stringify(observedKeys) === JSON.stringify(legacyKeys)
          || JSON.stringify(observedKeys) === JSON.stringify(policyKeys)
        ),
      "Each evidence entry must contain exactly path, content, mode and optionally replaceExisting.",
    );
    invariant(typeof entry.content === "string", "Public-evidence content must be a string.");
    invariant([0o600, 0o644].includes(entry.mode), "Evidence file mode must be 0600 or 0644.");
    invariant(Buffer.byteLength(entry.content) <= MAX_PUBLIC_EVIDENCE_BYTES, "A public-evidence file exceeds the 16 MiB admission limit.");
    invariant(isAbsolute(entry.path), "A public-evidence target must be an absolute path.");
    const replaceExisting = Object.hasOwn(entry, "replaceExisting") ? entry.replaceExisting : overwrite;
    invariant(typeof replaceExisting === "boolean", "Each evidence entry must have an explicit boolean replacement policy.");
    const target = resolve(entry.path);
    await assertSafeTarget(repositoryRoot, target, fileSystem);
    const ancestorBinding = await bindAncestorChain(
      repositoryRoot,
      rootRealPath,
      dirname(target),
      fileSystem,
    );
    prepared.push({
      path: target,
      content: entry.content,
      expectedBytes: Buffer.from(entry.content, "utf8"),
      expectedSha256: sha256(Buffer.from(entry.content, "utf8")),
      mode: entry.mode,
      replaceExisting,
      existed: await pathExists(target, fileSystem, ancestorBinding),
      temporaryPath: resolve(dirname(target), `.${basename(target)}.admit-stage-${transactionId}`),
      backupPath: resolve(dirname(target), `.${basename(target)}.admit-backup-${transactionId}`),
      ancestorBinding,
    });
  }
  invariant(new Set(prepared.map(({ path }) => path)).size === prepared.length, "Evidence targets must be distinct.");
  if (prepared.some(({ existed, replaceExisting }) => existed && !replaceExisting)) {
    throw new Error("Public evidence already exists and replacement was not authorised for that target.");
  }

  const staged = new Set();
  const backups = [];
  const promoted = [];
  try {
    for (const entry of prepared) {
      staged.add(entry.path);
      let writeCompleted = false;
      try {
        await runBoundMutation(
          entry.ancestorBinding,
          fileSystem,
          "Public-evidence staging write",
          () => fileSystem.writeFile(entry.temporaryPath, entry.content, {
            encoding: "utf8",
            flag: "wx",
            mode: entry.mode,
          }),
        );
        writeCompleted = true;
        entry.stagedIdentity = await validateEvidenceBytes(
          entry.temporaryPath,
          entry,
          fileSystem,
          "A staged public-evidence file",
          null,
          entry.ancestorBinding,
        );
      } catch (error) {
        try {
          await validateAncestorBinding(
            entry.ancestorBinding,
            fileSystem,
            "Public-evidence staging failure clean-up",
          );
        } catch (bindingError) {
          staged.delete(entry.path);
          throw new AggregateError(
            [error, bindingError],
            "Public-evidence staging failed after its validated parent chain changed; external paths were preserved.",
            { cause: error },
          );
        }
        // O_EXCL means EEXIST proves this transaction did not create the path.
        // Other failures may occur after creation and therefore remain owned
        // by this transaction for rollback.
        if (error?.code === "EEXIST" || writeCompleted) staged.delete(entry.path);
        else {
          try {
            entry.stagedIdentity = identityOf(await fileSystem.statPath(entry.temporaryPath));
          } catch (statError) {
            if (statError?.code === "ENOENT") staged.delete(entry.path);
            else throw new AggregateError([error, statError], "Public evidence staging failed and the partial stage could not be identified");
          }
        }
        throw error;
      }
    }
    for (const entry of prepared) {
      if (entry.replaceExisting) {
        if (!await pathExists(entry.path, fileSystem, entry.ancestorBinding)) continue;
        await assertSafeTarget(repositoryRoot, entry.path, fileSystem);
        await validateAncestorBinding(entry.ancestorBinding, fileSystem, "Public-evidence backup source before inspection");
        const targetState = await fileSystem.statPath(entry.path);
        await validateAncestorBinding(entry.ancestorBinding, fileSystem, "Public-evidence backup source after inspection");
        const targetIdentity = identityOf(targetState);
        await runBoundMutation(
          entry.ancestorBinding,
          fileSystem,
          "Public-evidence backup link",
          () => fileSystem.linkFile(entry.path, entry.backupPath),
        );
        backups.push(entry);
        entry.backupIdentity = targetIdentity;
        const backupState = await fileSystem.statPath(entry.backupPath);
        invariant(hasIdentity(backupState, targetIdentity), `A public-evidence backup has the wrong identity: ${entry.backupPath}`);
        const removalErrors = [];
        await removeIdentityBoundFile(
          entry.path,
          targetIdentity,
          fileSystem,
          removalErrors,
          "A public-evidence target being backed up",
          entry.ancestorBinding,
        );
        if (removalErrors.length > 0) throw removalErrors[0];
      }
    }
    for (const entry of prepared) {
      await validateEvidenceBytes(
        entry.temporaryPath,
        entry,
        fileSystem,
        "A staged public-evidence file before promotion",
        entry.stagedIdentity,
        entry.ancestorBinding,
      );
      try {
        await runBoundMutation(
          entry.ancestorBinding,
          fileSystem,
          "Public-evidence promotion link",
          () => fileSystem.linkFile(entry.temporaryPath, entry.path),
        );
      } catch (error) {
        if (error?.code === "EEXIST") {
          throw new Error(
            entry.replaceExisting
              ? `A public-evidence target appeared after the replacement backup window: ${entry.path}`
              : `A public-evidence target appeared while replacement was not authorised: ${entry.path}`,
            { cause: error },
          );
        }
        throw error;
      }
      const promotedState = await fileSystem.statPath(entry.path);
      let currentStageState = null;
      try {
        currentStageState = await fileSystem.statPath(entry.temporaryPath);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
      const promotedMatchesValidatedStage = hasIdentity(promotedState, entry.stagedIdentity);
      const promotedMatchesSwappedSource = currentStageState
        && !hasIdentity(currentStageState, entry.stagedIdentity)
        && hasIdentity(promotedState, identityOf(currentStageState));
      entry.promotedIdentity = promotedMatchesValidatedStage || promotedMatchesSwappedSource
        ? identityOf(promotedState)
        : entry.stagedIdentity;
      promoted.push(entry);
      invariant(
        promotedMatchesValidatedStage,
        `A promoted public-evidence target does not match its validated stage: ${entry.path}`,
      );
      await validateEvidenceBytes(
        entry.path,
        entry,
        fileSystem,
        "A promoted public-evidence target",
        entry.promotedIdentity,
        entry.ancestorBinding,
      );
      const stagedRemovalErrors = [];
      await removeIdentityBoundFile(
        entry.temporaryPath,
        entry.stagedIdentity,
        fileSystem,
        stagedRemovalErrors,
        "A staged public-evidence file after promotion",
        entry.ancestorBinding,
      );
      if (stagedRemovalErrors.length > 0) throw stagedRemovalErrors[0];
      staged.delete(entry.path);
    }
    await validatePromotedEvidenceSet(
      promoted,
      fileSystem,
      "A committed public-evidence target before backup clean-up",
    );
  } catch (error) {
    const rollbackErrors = await rollbackAdmission(
      { entries: prepared, promoted, backups, staged },
      fileSystem,
    );
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Public evidence admission failed and rollback could not restore the complete prior set.",
      );
    }
    throw error;
  }

  const cleanupErrors = [];
  for (const entry of backups) {
    try {
      const committedSnapshot = await snapshotRegularFile(
        entry.path,
        "A committed public-evidence target before guarded backup clean-up",
        fileSystem,
        entry.promotedIdentity,
        true,
        entry.ancestorBinding,
      );
      invariant(
        committedSnapshot.sizeBytes === entry.expectedBytes.byteLength
          && committedSnapshot.sha256 === entry.expectedSha256,
        `A committed public-evidence target differs from the intended evidence bytes before guarded backup clean-up: ${entry.path}`,
      );
      await removeWithRecoveryGuard({
        cleanupPath: entry.backupPath,
        cleanupIdentity: entry.backupIdentity,
        destination: entry.path,
        destinationIdentity: entry.promotedIdentity,
        snapshot: committedSnapshot,
        fileSystem,
        ancestorBinding: entry.ancestorBinding,
        label: "Committed public-evidence backup clean-up",
      });
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  try {
    await validatePromotedEvidenceSet(
      promoted,
      fileSystem,
      "A committed public-evidence target after transaction clean-up",
    );
  } catch (error) {
    cleanupErrors.push(error);
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "The public evidence set could not be verified after transaction clean-up.",
    );
  }
  return prepared.map(({ path }) => path);
}

export async function admitPublicEvidencePair(args, fileSystem = {}) {
  invariant(Array.isArray(args?.entries) && args.entries.length === 2, "Public evidence admission requires exactly two files.");
  const entries = args.entries.map((entry) => {
    invariant(
      entry && typeof entry === "object" && !Array.isArray(entry)
        && JSON.stringify(Object.keys(entry).sort()) === JSON.stringify(["content", "path"].sort()),
      "Each public-evidence entry must contain exactly path and content.",
    );
    return { ...entry, mode: 0o644 };
  });
  return admitEvidenceSet({ ...args, entries }, fileSystem);
}
