import { extname, isAbsolute, posix, resolve, win32 } from "node:path";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Validate the spelling of a repository-relative path before resolving it.
 * This deliberately rejects normalisable aliases so policy checks and audit
 * receipts always describe the same canonical repository entry.
 */
export function assertCanonicalRepositoryRelativePath(value, {
  label = "Repository path",
  prefix = null,
  extensions = null,
  maximumLength = 300,
} = {}) {
  invariant(typeof value === "string" && value.length > 0, `${label} must be a non-empty string`);
  invariant(value.length <= maximumLength, `${label} is too long`);
  invariant(
    !isAbsolute(value)
      && !win32.isAbsolute(value)
      && !/^[A-Za-z]:/u.test(value)
      && !/^\\\\[?.]\\/u.test(value),
    `${label} must be repository-relative`,
  );
  invariant(!value.includes("\\"), `${label} must use canonical POSIX separators`);
  invariant(!/[\u0000-\u001f\u007f]/u.test(value), `${label} contains a control character`);
  invariant(posix.normalize(value) === value, `${label} is not a canonical POSIX path`);
  const segments = value.split("/");
  invariant(
    segments.every((segment) => segment !== "" && segment !== "." && segment !== ".."),
    `${label} contains an unsafe path segment`,
  );
  if (prefix !== null) {
    invariant(
      typeof prefix === "string"
      && prefix.endsWith("/")
      && posix.normalize(prefix) === prefix
      && value.startsWith(prefix)
      && value.length > prefix.length,
      `${label} must stay beneath ${prefix}`,
    );
  }
  if (extensions !== null) {
    invariant(
      Array.isArray(extensions)
      && extensions.includes(extname(value).toLowerCase()),
      `${label} has an unsupported extension`,
    );
  }
  return value;
}

export function resolveCanonicalRepositoryPath(root, value, options = {}) {
  return resolve(root, assertCanonicalRepositoryRelativePath(value, options));
}
