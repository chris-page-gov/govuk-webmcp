import { constants } from "node:fs";
import { lstat, mkdir, open, realpath } from "node:fs/promises";
import { isAbsolute, relative, sep } from "node:path";

function inside(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

/** Establish a mode-0700 directory without following a symbolic-link leaf. */
export async function ensurePrivateDirectory(path, parentRealPath, label) {
  try {
    await mkdir(path, { mode: 0o700 });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }

  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  } catch (error) {
    if (["ELOOP", "ENOTDIR"].includes(error?.code)) {
      throw new Error(`${label} must be a real non-symbolic directory.`, { cause: error });
    }
    throw error;
  }
  try {
    const state = await handle.stat();
    const pathState = await lstat(path);
    const resolved = await realpath(path);
    if (
      !state.isDirectory()
      || pathState.isSymbolicLink()
      || !pathState.isDirectory()
      || pathState.dev !== state.dev
      || pathState.ino !== state.ino
      || !inside(parentRealPath, resolved)
    ) {
      throw new Error(`${label} resolves outside its private repository parent.`);
    }
    await handle.chmod(0o700);
    const stateAfter = await handle.stat();
    const pathStateAfter = await lstat(path);
    const resolvedAfter = await realpath(path);
    if (
      !stateAfter.isDirectory()
      || pathStateAfter.isSymbolicLink()
      || !pathStateAfter.isDirectory()
      || pathStateAfter.dev !== stateAfter.dev
      || pathStateAfter.ino !== stateAfter.ino
      || !inside(parentRealPath, resolvedAfter)
    ) {
      throw new Error(`${label} changed while its private boundary was established.`);
    }
    return resolvedAfter;
  } finally {
    await handle.close();
  }
}
