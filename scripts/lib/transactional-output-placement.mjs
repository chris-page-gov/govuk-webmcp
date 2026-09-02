import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  copyFile,
  link,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const defaultFileSystem = {
  copyFile,
  link,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
};

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function inside(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

async function validateAncestorBinding(binding, fileSystem, label) {
  if (!binding) return;
  for (const item of binding.chain) {
    let state;
    try {
      state = await fileSystem.lstat(item.path);
    } catch (error) {
      throw new Error(`${label} ancestor is unavailable: ${item.path}`, { cause: error });
    }
    invariant(
      state.isDirectory() && !state.isSymbolicLink() && hasIdentity(state, item.identity),
      `${label} ancestor changed identity or type: ${item.path}`,
    );
    const observedRealPath = await fileSystem.realpath(item.path);
    invariant(
      observedRealPath === item.realPath && inside(binding.rootRealPath, observedRealPath),
      `${label} ancestor resolves outside its validated repository binding: ${item.path}`,
    );
  }
}

async function bindAncestorChain(root, rootRealPath, parent, fileSystem) {
  const chain = [];
  const fromRoot = relative(root, parent);
  invariant(inside(root, parent), `Destination parent is outside the repository: ${parent}`);
  let current = root;
  for (const component of [null, ...fromRoot.split(sep).filter(Boolean)]) {
    if (component !== null) current = resolve(current, component);
    const state = await fileSystem.lstat(current);
    invariant(state.isDirectory() && !state.isSymbolicLink(), `Destination ancestor must be a non-symbolic directory: ${current}`);
    const observedRealPath = await fileSystem.realpath(current);
    invariant(inside(rootRealPath, observedRealPath), `Destination ancestor resolves outside the repository: ${current}`);
    chain.push({ path: current, identity: identityOf(state), realPath: observedRealPath });
  }
  const binding = { chain, rootRealPath };
  await validateAncestorBinding(binding, fileSystem, "Destination parent binding");
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

async function exists(path, fileSystem, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, "Output existence check before inspection");
  try {
    await fileSystem.lstat(path);
    await validateAncestorBinding(ancestorBinding, fileSystem, "Output existence check after inspection");
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      await validateAncestorBinding(ancestorBinding, fileSystem, "Output existence check after missing path");
      return false;
    }
    throw error;
  }
}

async function assertRegularDestination(path, fileSystem, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, "Output destination check before inspection");
  const info = await fileSystem.lstat(path);
  await validateAncestorBinding(ancestorBinding, fileSystem, "Output destination check after inspection");
  invariant(info.isFile() && !info.isSymbolicLink(), `Destination is not a regular file: ${path}`);
}

async function assertSafeExistingAncestors(root, rootRealPath, parent, fileSystem) {
  const rootState = await fileSystem.lstat(root);
  invariant(rootState.isDirectory() && !rootState.isSymbolicLink(), "Repository root must be a non-symbolic directory");
  const fromRoot = relative(root, parent);
  invariant(inside(root, parent), `Destination parent is outside the repository: ${parent}`);
  let current = root;
  for (const component of fromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, component);
    let state;
    try {
      state = await fileSystem.lstat(current);
    } catch (error) {
      if (error?.code === "ENOENT") return current;
      throw error;
    }
    invariant(!state.isSymbolicLink(), `Destination parent contains a symbolic link: ${current}`);
    invariant(state.isDirectory(), `Destination parent contains a non-directory: ${current}`);
    invariant(inside(rootRealPath, await fileSystem.realpath(current)), `Destination parent resolves outside the repository: ${current}`);
  }
  return null;
}

async function ensureSafeRepositoryParent(root, rootRealPath, parent, fileSystem) {
  await assertSafeExistingAncestors(root, rootRealPath, parent, fileSystem);
  const fromRoot = relative(root, parent);
  let current = root;
  for (const component of fromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, component);
    let state;
    try {
      state = await fileSystem.lstat(current);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      try {
        await fileSystem.mkdir(current);
      } catch (mkdirError) {
        if (mkdirError?.code !== "EEXIST") throw mkdirError;
      }
      state = await fileSystem.lstat(current);
    }
    invariant(!state.isSymbolicLink(), `Destination parent contains a symbolic link: ${current}`);
    invariant(state.isDirectory(), `Destination parent contains a non-directory: ${current}`);
    invariant(inside(rootRealPath, await fileSystem.realpath(current)), `Destination parent resolves outside the repository: ${current}`);
  }
}

function displayPath(root, path) {
  const value = relative(root, path);
  return value.length > 0 && !isAbsolute(value) ? value : path;
}

async function attempt(operation, failures, path) {
  try {
    await operation();
  } catch (error) {
    failures.push({ path, error });
  }
}

function identityOf(state) {
  return { device: state.dev, inode: state.ino };
}

function hasIdentity(state, identity) {
  return state.dev === identity?.device && state.ino === identity?.inode;
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
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
  const before = await fileSystem.lstat(path);
  invariant(before.isFile() && !before.isSymbolicLink(), `${label} must be a regular non-symbolic file: ${path}`);
  if (expectedIdentity) invariant(hasIdentity(before, expectedIdentity), `${label} changed identity: ${path}`);
  const bytes = await fileSystem.readFile(path);
  const after = await fileSystem.lstat(path);
  await validateAncestorBinding(ancestorBinding, fileSystem, `${label} after inspection`);
  invariant(hasIdentity(after, identityOf(before)), `${label} changed identity while its bytes were read: ${path}`);
  invariant(after.size === bytes.byteLength, `${label} size changed while its bytes were read: ${path}`);
  const snapshot = {
    identity: identityOf(after),
    sizeBytes: bytes.byteLength,
    sha256: digest(bytes),
  };
  if (retainBytes) snapshot.bytes = bytes;
  return snapshot;
}

function sameSnapshot(left, right) {
  return hasIdentity({ dev: left.identity.device, ino: left.identity.inode }, right.identity)
    && left.sizeBytes === right.sizeBytes
    && left.sha256 === right.sha256;
}

async function removeIdentityBoundFile(path, identity, fileSystem, ancestorBinding = null) {
  await validateAncestorBinding(ancestorBinding, fileSystem, "Output removal before inspection");
  let state;
  try {
    state = await fileSystem.lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (identity) {
    invariant(hasIdentity(state, identity), `Output transaction path changed identity and was preserved for manual recovery: ${path}`);
  }
  await runBoundMutation(
    ancestorBinding,
    fileSystem,
    "Output removal",
    () => fileSystem.rm(path, { force: true }),
  );
}

async function validateSnapshot(path, snapshot, label, fileSystem, expectedIdentity, ancestorBinding = null) {
  const observed = await snapshotRegularFile(path, label, fileSystem, expectedIdentity, false, ancestorBinding);
  invariant(
    observed.sizeBytes === snapshot.sizeBytes && observed.sha256 === snapshot.sha256,
    `${label} bytes differ from the known-good copy: ${path}`,
  );
}

async function createVerifiedRecoveryCopy(destination, snapshot, label, fileSystem, ancestorBinding) {
  invariant(Buffer.isBuffer(snapshot.bytes), `${label} does not have retained recovery bytes: ${destination}`);
  for (let attemptIndex = 0; attemptIndex < 3; attemptIndex += 1) {
    const recovery = `${destination}.recovery-${process.pid}-${randomUUID()}`;
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
    await fileSystem.lstat(path);
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
    await removeIdentityBoundFile(cleanupPath, cleanupIdentity, fileSystem, ancestorBinding);
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
    await removeIdentityBoundFile(recovery.path, recovery.identity, fileSystem, ancestorBinding);
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

async function validateCommittedOutputs(committed, fileSystem, label) {
  for (const item of committed) {
    const snapshot = await snapshotRegularFile(item.destination, label, fileSystem, item.identity, false, item.ancestorBinding);
    invariant(
      snapshot.sizeBytes === item.snapshot.sizeBytes && snapshot.sha256 === item.snapshot.sha256,
      `${label} bytes differ from the validated stage: ${item.destination}`,
    );
  }
}

export class CommittedOutputCleanupError extends Error {
  constructor(root, committed, cleanupFailures, leftovers) {
    const committedOutputs = committed.map((path) => displayPath(root, path));
    const leftoverBackups = leftovers.map((path) => displayPath(root, path));
    const failureCount = cleanupFailures.length;
    const leftoverSummary = leftoverBackups.length > 0
      ? ` Leftover backup${leftoverBackups.length === 1 ? "" : "s"}: ${leftoverBackups.join(", ")}.`
      : " No leftover backup was detected, but clean-up could not be confirmed.";
    super(
      `Output promotion committed ${committedOutputs.length} file${committedOutputs.length === 1 ? "" : "s"}, `
      + `but backup clean-up reported ${failureCount} error${failureCount === 1 ? "" : "s"}. `
      + `The committed outputs were retained.${leftoverSummary}`,
      { cause: new AggregateError(cleanupFailures.map(({ error }) => error), "Backup clean-up failures") },
    );
    this.name = "CommittedOutputCleanupError";
    this.code = "OUTPUT_BACKUP_CLEANUP_FAILED";
    this.committedOutputs = committedOutputs;
    this.cleanupFailureCount = failureCount;
    this.leftoverBackups = leftoverBackups;
  }
}

/**
 * Replace a related set of repository outputs as one promotion transaction.
 *
 * A failure before every pending file has been promoted rolls the transaction
 * back. Backup clean-up is deliberately a separate phase: once all new files
 * are committed, a clean-up failure is reported without removing those files.
 */
export async function placeRepositoryOutputs(entries, {
  root,
  overwrite = false,
  fileSystem: overrides = {},
  idFactory = randomUUID,
} = {}) {
  invariant(Array.isArray(entries) && entries.length > 0, "At least one output entry is required");
  invariant(typeof root === "string" && isAbsolute(root), "Repository root must be an absolute path");
  invariant(typeof overwrite === "boolean", "Overwrite must be a boolean");
  invariant(typeof idFactory === "function", "Output identifier factory must be a function");
  const fileSystem = { ...defaultFileSystem, ...overrides };
  const rootRealPath = await fileSystem.realpath(root);
  const destinations = new Set();

  for (const entry of entries) {
    invariant(entry && typeof entry.source === "string" && isAbsolute(entry.source), "Output source must be an absolute path");
    invariant(entry && typeof entry.destination === "string" && isAbsolute(entry.destination), "Output destination must be an absolute path");
    invariant(inside(root, entry.destination), `Destination is outside the repository: ${entry.destination}`);
    invariant(!destinations.has(entry.destination), `Duplicate output destination: ${entry.destination}`);
    destinations.add(entry.destination);
    await assertSafeExistingAncestors(root, rootRealPath, dirname(entry.destination), fileSystem);
    if (await exists(entry.destination, fileSystem)) {
      await assertRegularDestination(entry.destination, fileSystem);
      invariant(overwrite, `Output exists; rerun with --overwrite after review: ${entry.destination}`);
    }
  }

  const prepared = [];
  const staged = new Map();
  const backups = [];
  const committed = [];
  try {
    for (const { source, destination } of entries) {
      const parent = dirname(destination);
      await ensureSafeRepositoryParent(root, rootRealPath, parent, fileSystem);
      const ancestorBinding = await bindAncestorChain(root, rootRealPath, parent, fileSystem);
      const sourceSnapshot = await snapshotRegularFile(source, "Output source", fileSystem);
      const identifier = idFactory();
      invariant(typeof identifier === "string" && /^[A-Za-z0-9-]{1,100}$/u.test(identifier), "Output identifier is invalid");
      const temporary = `${destination}.pending-${process.pid}-${identifier}`;
      staged.set(temporary, { ancestorBinding, identity: null });
      let copyCompleted = false;
      try {
        await runBoundMutation(
          ancestorBinding,
          fileSystem,
          "Output staging copy",
          () => fileSystem.copyFile(source, temporary, fsConstants.COPYFILE_EXCL),
        );
        copyCompleted = true;
        const stagedSnapshot = await snapshotRegularFile(temporary, "Pending output", fileSystem, null, false, ancestorBinding);
        const stagedIdentity = stagedSnapshot.identity;
        invariant(
          stagedSnapshot.sizeBytes === sourceSnapshot.sizeBytes && stagedSnapshot.sha256 === sourceSnapshot.sha256,
          `Pending output bytes differ from the validated source: ${temporary}`,
        );
        staged.set(temporary, { ancestorBinding, identity: stagedIdentity });
        const sourceAfterCopy = await snapshotRegularFile(source, "Output source after copy", fileSystem, sourceSnapshot.identity);
        invariant(sameSnapshot(sourceAfterCopy, sourceSnapshot), `Output source changed during staging: ${source}`);
        prepared.push({ temporary, destination, stagedIdentity, stagedSnapshot, ancestorBinding });
      } catch (error) {
        try {
          await validateAncestorBinding(ancestorBinding, fileSystem, "Output staging failure clean-up");
        } catch (bindingError) {
          staged.delete(temporary);
          throw new AggregateError(
            [error, bindingError],
            "Output staging failed after its validated parent chain changed; external paths were preserved.",
            { cause: error },
          );
        }
        // COPYFILE_EXCL means EEXIST proves this transaction did not create
        // the path. Other failures may leave a partial file to clean up.
        if (error?.code === "EEXIST") staged.delete(temporary);
        else if (copyCompleted && staged.get(temporary)?.identity === null) staged.delete(temporary);
        else {
          try {
            staged.set(temporary, {
              ancestorBinding,
              identity: identityOf(await fileSystem.lstat(temporary)),
            });
          } catch (statError) {
            if (statError?.code === "ENOENT") staged.delete(temporary);
            else throw new AggregateError([error, statError], "Output staging failed and the partial file could not be identified");
          }
        }
        throw error;
      }
    }

    if (overwrite) {
      for (const { destination, ancestorBinding } of prepared) {
        if (!await exists(destination, fileSystem, ancestorBinding)) continue;
        await assertRegularDestination(destination, fileSystem, ancestorBinding);
        const identifier = idFactory();
        invariant(typeof identifier === "string" && /^[A-Za-z0-9-]{1,100}$/u.test(identifier), "Output identifier is invalid");
        const backup = `${destination}.backup-${process.pid}-${identifier}`;
        await validateAncestorBinding(ancestorBinding, fileSystem, "Output backup source before inspection");
        const destinationState = await fileSystem.lstat(destination);
        await validateAncestorBinding(ancestorBinding, fileSystem, "Output backup source after inspection");
        const backupIdentity = identityOf(destinationState);
        await runBoundMutation(
          ancestorBinding,
          fileSystem,
          "Output backup link",
          () => fileSystem.link(destination, backup),
        );
        const backupEntry = { destination, backup, identity: backupIdentity, ancestorBinding };
        backups.push(backupEntry);
        const backupState = await fileSystem.lstat(backup);
        invariant(hasIdentity(backupState, backupIdentity), `Output backup has the wrong identity: ${backup}`);
        await removeIdentityBoundFile(destination, backupIdentity, fileSystem, ancestorBinding);
      }
    }

    for (const item of prepared) {
      const currentStage = await snapshotRegularFile(
        item.temporary,
        "Pending output before promotion",
        fileSystem,
        item.stagedIdentity,
        false,
        item.ancestorBinding,
      );
      invariant(
        currentStage.sizeBytes === item.stagedSnapshot.sizeBytes && currentStage.sha256 === item.stagedSnapshot.sha256,
        `Pending output bytes changed before promotion: ${item.temporary}`,
      );
      try {
        await runBoundMutation(
          item.ancestorBinding,
          fileSystem,
          "Output promotion link",
          () => fileSystem.link(item.temporary, item.destination),
        );
      } catch (error) {
        if (error?.code === "EEXIST") {
          throw new Error(
            overwrite
              ? `An output destination appeared after the replacement backup window: ${item.destination}`
              : `An output destination appeared while overwrite was disabled: ${item.destination}`,
            { cause: error },
          );
        }
        throw error;
      }
      committed.push({
        destination: item.destination,
        identity: item.stagedIdentity,
        snapshot: item.stagedSnapshot,
        ancestorBinding: item.ancestorBinding,
      });
      const committedState = await fileSystem.lstat(item.destination);
      invariant(
        hasIdentity(committedState, item.stagedIdentity),
        `Committed output does not match its validated stage: ${item.destination}`,
      );
      const committedSnapshot = await snapshotRegularFile(
        item.destination,
        "Committed output",
        fileSystem,
        item.stagedIdentity,
        false,
        item.ancestorBinding,
      );
      invariant(
        committedSnapshot.sizeBytes === item.stagedSnapshot.sizeBytes && committedSnapshot.sha256 === item.stagedSnapshot.sha256,
        `Committed output bytes differ from the validated stage: ${item.destination}`,
      );
      await removeIdentityBoundFile(item.temporary, item.stagedIdentity, fileSystem, item.ancestorBinding);
      staged.delete(item.temporary);
    }
    await validateCommittedOutputs(committed, fileSystem, "Committed output before backup clean-up");
  } catch (error) {
    const rollbackFailures = [];
    for (const { destination, identity, ancestorBinding } of [...committed].reverse()) {
      await attempt(
        () => removeIdentityBoundFile(destination, identity, fileSystem, ancestorBinding),
        rollbackFailures,
        destination,
      );
    }
    for (const { destination, backup, identity, ancestorBinding } of [...backups].reverse()) {
      await attempt(async () => {
        if (!await exists(backup, fileSystem, ancestorBinding)) return;
        await validateAncestorBinding(ancestorBinding, fileSystem, "Output rollback backup before inspection");
        const backupState = await fileSystem.lstat(backup);
        await validateAncestorBinding(ancestorBinding, fileSystem, "Output rollback backup after inspection");
        const effectiveIdentity = identity ?? identityOf(backupState);
        invariant(hasIdentity(backupState, effectiveIdentity), `Output backup changed identity and was preserved for manual recovery: ${backup}`);
        const backupSnapshot = await snapshotRegularFile(
          backup,
          "Output backup before rollback clean-up",
          fileSystem,
          effectiveIdentity,
          true,
          ancestorBinding,
        );
        if (await exists(destination, fileSystem, ancestorBinding)) {
          await validateAncestorBinding(ancestorBinding, fileSystem, "Output rollback destination before inspection");
          const existingDestination = await fileSystem.lstat(destination);
          await validateAncestorBinding(ancestorBinding, fileSystem, "Output rollback destination after inspection");
          invariant(hasIdentity(existingDestination, effectiveIdentity), `Output destination changed identity and both it and the backup were preserved for manual recovery: ${destination}`);
        } else {
          await runBoundMutation(
            ancestorBinding,
            fileSystem,
            "Output rollback restore link",
            () => fileSystem.link(backup, destination),
          );
          const destinationState = await fileSystem.lstat(destination);
          invariant(hasIdentity(destinationState, effectiveIdentity), `Restored output changed identity and both copies were preserved for manual recovery: ${destination}`);
        }
        await validateSnapshot(
          destination,
          backupSnapshot,
          "Restored output before rollback backup clean-up",
          fileSystem,
          effectiveIdentity,
          ancestorBinding,
        );
        await removeWithRecoveryGuard({
          cleanupPath: backup,
          cleanupIdentity: effectiveIdentity,
          destination,
          destinationIdentity: effectiveIdentity,
          snapshot: backupSnapshot,
          fileSystem,
          ancestorBinding,
          label: "Output rollback backup clean-up",
        });
      }, rollbackFailures, backup);
    }
    for (const [temporary, stagedState] of staged) {
      await attempt(
        () => removeIdentityBoundFile(
          temporary,
          stagedState.identity,
          fileSystem,
          stagedState.ancestorBinding,
        ),
        rollbackFailures,
        temporary,
      );
    }
    if (rollbackFailures.length > 0) {
      throw new AggregateError(
        [error, ...rollbackFailures.map(({ error: rollbackError }) => rollbackError)],
        "Output promotion failed and rollback was incomplete",
        { cause: error },
      );
    }
    throw error;
  }

  const cleanupFailures = [];
  for (const { destination, backup, identity, ancestorBinding } of backups) {
    await attempt(async () => {
      const committedItem = committed.find((item) => item.destination === destination);
      invariant(committedItem, `Committed output is missing for backup clean-up: ${destination}`);
      const committedSnapshot = await snapshotRegularFile(
        destination,
        "Committed output before guarded backup clean-up",
        fileSystem,
        committedItem.identity,
        true,
        ancestorBinding,
      );
      invariant(
        committedSnapshot.sizeBytes === committedItem.snapshot.sizeBytes
          && committedSnapshot.sha256 === committedItem.snapshot.sha256,
        `Committed output bytes differ from the validated stage before guarded backup clean-up: ${destination}`,
      );
      await removeWithRecoveryGuard({
        cleanupPath: backup,
        cleanupIdentity: identity,
        destination,
        destinationIdentity: committedItem.identity,
        snapshot: committedSnapshot,
        fileSystem,
        ancestorBinding,
        label: "Committed output backup clean-up",
      });
    }, cleanupFailures, backup);
  }

  const leftovers = [];
  for (const { backup, ancestorBinding } of backups) {
    await attempt(async () => {
      if (await exists(backup, fileSystem, ancestorBinding)) leftovers.push(backup);
    }, cleanupFailures, backup);
  }
  const finalValidationFailures = [];
  await attempt(
    () => validateCommittedOutputs(committed, fileSystem, "Committed output after transaction clean-up"),
    finalValidationFailures,
    "committed outputs",
  );
  if (finalValidationFailures.length > 0) {
    throw new AggregateError(
      finalValidationFailures.map(({ error }) => error),
      "Output promotion could not verify the committed outputs after transaction clean-up.",
    );
  }
  if (cleanupFailures.length > 0 || leftovers.length > 0) {
    throw new CommittedOutputCleanupError(root, committed.map(({ destination }) => destination), cleanupFailures, leftovers);
  }

  return {
    committedOutputs: committed.map(({ destination }) => displayPath(root, destination)),
    replacedOutputCount: backups.length,
  };
}
