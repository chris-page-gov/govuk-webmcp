import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the optional guided-build workflow can resume from the repository state", async () => {
  const [rawState, scope, prd, spec, checklist, notes] = await Promise.all([
    readFile(".devpost-hackathon-state.json", "utf8"),
    readFile("docs/hackathon-build/scope.md", "utf8"),
    readFile("docs/hackathon-build/prd.md", "utf8"),
    readFile("docs/hackathon-build/spec.md", "utf8"),
    readFile("docs/hackathon-build/checklist.md", "utf8"),
    readFile("docs/hackathon-build/build-notes.md", "utf8"),
  ]);
  const state = JSON.parse(rawState);

  assert.equal(state.plugin, "devpost-hackathon");
  assert.equal(state.version, 2);
  assert.equal(state.hackathon.slug, "webmcp");
  assert.equal(state.learning.current_step, "build");
  assert.equal(state.learning.checklist_file, "docs/hackathon-build/checklist.md");
  assert.equal(state.next_command, "build-project");
  assert.equal(state.submission.status, "not-started");

  assert.match(scope, /experimental Evidence answer candidate/u);
  assert.match(prd, /docs\/product\/beginner-trust-pathway-prd\.md/u);
  assert.match(spec, /docs\/product\/beginner-interface-specification\.md/u);
  assert.match(notes, /does not\s+register, update or submit anything on Devpost/u);

  const items = [...checklist.matchAll(/^- \[([ x])\] \*\*(\d+)\. ([^*]+)\*\*/gmu)];
  assert.equal(items.length, 10);
  assert.deepEqual(items.map(([, , number]) => number), Array.from({ length: 10 }, (_, index) => String(index + 1)));
  assert.deepEqual(items.slice(0, 6).map((item) => item[1]), Array(6).fill("x"));
  assert.equal(items[6][1], " ");
  assert.equal(items.at(-1)[3], "Prepare Devpost handoff");
});
