import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";

function identityMatches(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

export async function readBoundedPrivateJsonNoFollow(path, label, maximumBytes) {
  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    if (["ELOOP", "ENOTDIR"].includes(error?.code)) {
      throw new Error(`${label} must be a bounded regular non-symbolic JSON file.`, { cause: error });
    }
    throw error;
  }
  try {
    const before = await handle.stat();
    const pathBefore = await lstat(path);
    if (
      !before.isFile()
      || pathBefore.isSymbolicLink()
      || !pathBefore.isFile()
      || !identityMatches(before, pathBefore)
      || before.size > maximumBytes
    ) {
      throw new Error(`${label} must be a bounded regular non-symbolic JSON file.`);
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    const pathAfter = await lstat(path);
    if (
      !identityMatches(before, after)
      || !identityMatches(before, pathAfter)
      || after.size !== before.size
      || bytes.byteLength !== before.size
      || bytes.byteLength > maximumBytes
    ) {
      throw new Error(`${label} changed while its bounded bytes were read.`);
    }
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (error) {
      throw new Error(`${label} is not valid UTF-8.`, { cause: error });
    }
    return JSON.parse(text);
  } finally {
    await handle.close();
  }
}

export async function writePrivateJsonExclusiveNoFollow(path, value, label) {
  const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(bytes);
    await handle.chmod(0o600);
    await handle.sync();
    const handleState = await handle.stat();
    const pathState = await lstat(path);
    if (
      !handleState.isFile()
      || pathState.isSymbolicLink()
      || !pathState.isFile()
      || !identityMatches(handleState, pathState)
      || handleState.size !== bytes.byteLength
    ) {
      throw new Error(`${label} changed identity or size during its exclusive write.`);
    }
  } finally {
    await handle.close();
  }
}
