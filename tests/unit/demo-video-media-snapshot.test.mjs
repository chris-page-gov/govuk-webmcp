import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { snapshotVerifiedMediaInputs } from "../../scripts/build-demo-video.mjs";

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function fixture(root) {
  const source = join(root, "source.mov");
  await writeFile(source, "reviewed media bytes\n");
  const info = await lstat(source);
  return {
    source,
    media: new Map([["example", {
      absolutePath: source,
      relativePath: "output/demo-clips/v0.4.0-rc.1/example.mov",
      sizeBytes: info.size,
      device: info.dev,
      inode: info.ino,
      sha256: await sha256(source),
    }]]),
  };
}

test("final-video media is consumed from a digest-matched private snapshot", async () => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-media-snapshot-"));
  try {
    const { media } = await fixture(root);
    const snapshots = await snapshotVerifiedMediaInputs(media, root);
    assert.notEqual(snapshots.get("example").absolutePath, media.get("example").absolutePath);
    assert.equal(await readFile(snapshots.get("example").absolutePath, "utf8"), "reviewed media bytes\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("final-video media snapshot fails if the source is replaced after preflight", async () => {
  const root = await mkdtemp(join(tmpdir(), "govuk-webmcp-media-snapshot-race-"));
  try {
    const { source, media } = await fixture(root);
    const originalCopy = async (from, to) => {
      const displaced = join(root, "displaced.mov");
      await rename(from, displaced);
      await writeFile(from, "different media bytes\n");
      await writeFile(to, await readFile(from));
    };
    await assert.rejects(
      snapshotVerifiedMediaInputs(media, root, { copyFileImplementation: originalCopy }),
      /changed while|does not match/u,
    );
    assert.equal(await readFile(source, "utf8"), "different media bytes\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
