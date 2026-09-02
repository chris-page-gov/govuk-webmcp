import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const observationPath =
  "docs/competition/evidence/manual-copilot-presentation-observation-v0.4.0-rc.1.json";

test("the supplemental Copilot observation is closed, release-bound and privacy-minimised", async () => {
  const raw = await readFile(observationPath, "utf8");
  const observation = JSON.parse(raw);

  assert.deepEqual(Object.keys(observation), [
    "schema",
    "recordedAt",
    "observationTiming",
    "release",
    "method",
    "environment",
    "prompt",
    "hostObservation",
    "pageObservation",
    "overallStatus",
    "claimImpact",
    "limitations",
  ]);
  assert.deepEqual(Object.keys(observation.release), [
    "version",
    "commitSha",
    "pagesRunId",
    "publicUrl",
  ]);
  assert.deepEqual(Object.keys(observation.environment), [
    "browserName",
    "browserVersion",
    "host",
    "profileClass",
    "workProfileUsed",
    "accountIdentifierRetained",
    "underlyingModel",
  ]);
  assert.deepEqual(Object.keys(observation.environment.underlyingModel), [
    "status",
    "value",
  ]);
  assert.deepEqual(Object.keys(observation.prompt), [
    "text",
    "siteToolsExplicitlyRequested",
    "evidencePresentationExplicitlyRequested",
    "personalContextIncluded",
  ]);
  assert.deepEqual(Object.keys(observation.hostObservation), [
    "responseCompleted",
    "siteToolInvocation",
    "presentationToolInvocation",
    "exactCallTrace",
    "answerTextRetained",
    "privateShareUrlRetained",
  ]);
  assert.deepEqual(Object.keys(observation.pageObservation), [
    "beforeActivityText",
    "afterActivityText",
    "evidenceAnswerUpdated",
  ]);

  assert.equal(observation.release.version, "0.4.0-rc.1");
  assert.equal(
    observation.release.commitSha,
    "a4d2db44e60024c3eadbdb2b1722153ce19dff4c",
  );
  assert.equal(observation.release.pagesRunId, "33657069203");
  assert.equal(observation.environment.browserName, "Microsoft Edge");
  assert.equal(observation.environment.browserVersion, "152.0.4191.53");
  assert.equal(observation.environment.profileClass, "owner-controlled-personal");
  assert.equal(observation.environment.workProfileUsed, false);
  assert.equal(observation.environment.accountIdentifierRetained, false);
  assert.deepEqual(observation.environment.underlyingModel, {
    status: "not-disclosed",
    value: null,
  });
  assert.equal(observation.prompt.siteToolsExplicitlyRequested, true);
  assert.equal(observation.prompt.evidencePresentationExplicitlyRequested, true);
  assert.equal(observation.prompt.personalContextIncluded, false);
  assert.equal(observation.hostObservation.siteToolInvocation, "not-observed");
  assert.equal(observation.hostObservation.presentationToolInvocation, "not-observed");
  assert.equal(observation.hostObservation.exactCallTrace, "not-exposed");
  assert.equal(observation.hostObservation.answerTextRetained, false);
  assert.equal(observation.hostObservation.privateShareUrlRetained, false);
  assert.equal(
    observation.pageObservation.beforeActivityText,
    "No AI action was presented to this page.",
  );
  assert.equal(
    observation.pageObservation.afterActivityText,
    observation.pageObservation.beforeActivityText,
  );
  assert.equal(observation.pageObservation.evidenceAnswerUpdated, false);
  assert.equal(
    observation.overallStatus,
    "completed-without-observed-site-tool-call",
  );
  assert.equal(
    observation.claimImpact,
    "does-not-change-false-personal-agent-claim-gate",
  );
  assert.equal(observation.limitations.length, 5);

  assert.doesNotMatch(raw, /@[a-z0-9.-]+/iu);
  assert.doesNotMatch(raw, /copilot\.microsoft\.com\/shares\//iu);
  assert.doesNotMatch(raw, /crpage@msn\.com/iu);
});
