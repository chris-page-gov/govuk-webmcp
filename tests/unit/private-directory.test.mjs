import assert from "node:assert/strict";
import { chmod, lstat, mkdir, mkdtemp, realpath, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { ensurePrivateDirectory } from "../../scripts/lib/private-directory.mjs";

test("a symbolic .evals directory is rejected without chmod following its referent", async () => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-private-directory-"));
  try {
    const outside = join(root, "outside");
    const repository = join(root, "repository");
    await mkdir(outside);
    await mkdir(repository);
    await chmod(outside, 0o755);
    await symlink(outside, join(repository, ".evals"));
    const modeBefore = (await lstat(outside)).mode & 0o777;
    await assert.rejects(
      ensurePrivateDirectory(
        join(repository, ".evals"),
        await realpath(repository),
        "The local .evals evidence directory",
      ),
      /real non-symbolic directory/u,
    );
    assert.equal((await lstat(outside)).mode & 0o777, modeBefore);
    assert.equal((await lstat(join(repository, ".evals"))).isSymbolicLink(), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
