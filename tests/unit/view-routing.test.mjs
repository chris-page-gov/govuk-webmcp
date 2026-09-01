import assert from "node:assert/strict";
import test from "node:test";

import {
  VIEW_LABELS,
  parseViewHash,
  routesEqual,
  routeWithView,
  serialiseViewRoute,
} from "../../dist/app/view-routing.js";

const answerId = "answer:new-child-starting-points";
const firstClaim = "claim:register-a-birth";
const secondClaim = "claim:check-child-benefit";
const recordId = "govuk-discovery:dataset:ons-open-geography";
const federatedRecordId = "govuk-discovery:federated:land-registry:2200";

function route(hash) {
  const parsed = parseViewHash(hash);
  assert.equal(parsed.kind, "route", JSON.stringify(parsed));
  return parsed;
}

function rejected(hash, view = "guided") {
  const parsed = parseViewHash(hash);
  assert.equal(parsed.kind, "invalid", JSON.stringify(parsed));
  assert.deepEqual(parsed.fallback, { view, selection: { kind: "default" } });
  assert.match(parsed.warning, /default view is shown instead\.$/u);
  assert.doesNotMatch(parsed.warning, /govuk-discovery|answer:|claim:/u);
  return parsed;
}

test("empty and explicit view fragments use the Evidence answer as the default", () => {
  assert.deepEqual(route("") , {
    kind: "route",
    route: { view: "guided", selection: { kind: "default" } },
    source: "empty",
  });
  assert.deepEqual(route("#"), route(""));
  assert.deepEqual(route("#view=guided"), {
    kind: "route",
    route: { view: "guided", selection: { kind: "default" } },
    source: "explicit",
  });
  assert.deepEqual(route("#view=technical").route, {
    view: "technical",
    selection: { kind: "default" },
  });
  assert.deepEqual(VIEW_LABELS, { guided: "Evidence answer", technical: "Technical review" });
});

test("the skip-link anchor is not interpreted as application state", () => {
  assert.deepEqual(parseViewHash("#main-content"), { kind: "anchor", id: "main-content" });
  rejected("#main-content&view=guided");
});

test("legacy evidence fragments retain the Technical review meaning", () => {
  assert.deepEqual(route(`#record=${encodeURIComponent(recordId)}`), {
    kind: "route",
    route: { view: "technical", selection: { kind: "record", recordId } },
    source: "legacy",
  });
  assert.deepEqual(route(`#answer=${encodeURIComponent(answerId)}`).route, {
    view: "technical",
    selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [] },
  });
  assert.deepEqual(
    route(`#answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(firstClaim)}`).route,
    {
      view: "technical",
      selection: { kind: "answer", answerId, claimId: firstClaim, compareClaimIds: [] },
    },
  );
  assert.deepEqual(
    route(`#answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`).route,
    {
      view: "technical",
      selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [firstClaim, secondClaim] },
    },
  );
});

test("explicit views accept bounded record, answer, claim and comparison state", () => {
  assert.deepEqual(route(`#view=guided&record=${encodeURIComponent(federatedRecordId)}`).route, {
    view: "guided",
    selection: { kind: "record", recordId: federatedRecordId },
  });
  assert.deepEqual(
    route(`#view=guided&answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(firstClaim)}`).route,
    {
      view: "guided",
      selection: { kind: "answer", answerId, claimId: firstClaim, compareClaimIds: [] },
    },
  );
  assert.deepEqual(
    route(`#view=technical&answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`).route,
    {
      view: "technical",
      selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [firstClaim, secondClaim] },
    },
  );
});

test("duplicate and unknown parameters fail closed", () => {
  for (const hash of [
    "#view=guided&view=guided",
    `#view=guided&record=${encodeURIComponent(recordId)}&record=${encodeURIComponent(recordId)}`,
    `#view=guided&answer=${encodeURIComponent(answerId)}&answer=${encodeURIComponent(answerId)}`,
    `#view=guided&answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(firstClaim)}&claim=${encodeURIComponent(firstClaim)}`,
    `#view=guided&answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`,
    "#query=child-benefit",
    "#view=guided&personalContext=private",
  ]) rejected(hash);

  rejected(`#view=technical&unexpected=value`, "technical");
});

test("incompatible combinations fail closed to the selected or legacy view", () => {
  rejected(`#view=guided&record=${encodeURIComponent(recordId)}&answer=${encodeURIComponent(answerId)}`);
  rejected(`#view=technical&answer=${encodeURIComponent(answerId)}&claim=${encodeURIComponent(firstClaim)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`, "technical");
  rejected(`#claim=${encodeURIComponent(firstClaim)}`, "technical");
  rejected(`#compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`, "technical");
});

test("malformed names, identifiers, encoding and oversized fragments fail closed", () => {
  rejected("#view=evidence");
  rejected("#view=");
  rejected("#view=guided&record=not-a-record");
  rejected("#view=guided&record=govuk-discovery%3Afederated%3Alegislation%3A1");
  rejected("#view=guided&record=govuk-discovery%3Afederated%3Aunknown%3A1");
  rejected("#view=guided&answer=answer%3Ax");
  rejected(`#view=guided&answer=${encodeURIComponent(answerId)}&claim=claim%3Ax`);
  rejected("#view=guided&record=%E0%A4%A");
  rejected(`#${"x".repeat(1_025)}`);
});

test("the serialiser rejects excluded or unknown federated collection identifiers", () => {
  for (const recordId of [
    "govuk-discovery:federated:legislation:1",
    "govuk-discovery:federated:unknown:1",
  ]) {
    assert.throws(
      () => serialiseViewRoute({ view: "guided", selection: { kind: "record", recordId } }),
      /invalid or incompatible evidence state/u,
    );
  }
});

test("comparisons require two to four different, well-formed claim references", () => {
  const thirdClaim = "claim:check-parental-pay-and-leave";
  const fourthClaim = "claim:check-registering-with-a-doctor";
  const fifthClaim = "claim:check-local-services";
  for (const values of [
    [firstClaim],
    [firstClaim, firstClaim],
    [firstClaim, "not-a-claim"],
    [firstClaim, secondClaim, thirdClaim, fourthClaim, fifthClaim],
    [firstClaim, "", secondClaim],
  ]) {
    rejected(`#answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(values.join(","))}`, "technical");
  }
  assert.deepEqual(
    route(`#view=guided&answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent([firstClaim, secondClaim, thirdClaim, fourthClaim].join(","))}`).route.selection,
    {
      kind: "answer",
      answerId,
      claimId: null,
      compareClaimIds: [firstClaim, secondClaim, thirdClaim, fourthClaim],
    },
  );
});

test("serialisation is stable, explicit and round trips without losing selection", () => {
  const routes = [
    { view: "guided", selection: { kind: "default" } },
    { view: "technical", selection: { kind: "record", recordId } },
    { view: "guided", selection: { kind: "answer", answerId, claimId: firstClaim, compareClaimIds: [] } },
    { view: "technical", selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [firstClaim, secondClaim] } },
  ];
  assert.equal(serialiseViewRoute(routes[0]), "#view=guided");
  assert.equal(
    serialiseViewRoute(routes[3]),
    `#view=technical&answer=${encodeURIComponent(answerId)}&compare=${encodeURIComponent(`${firstClaim},${secondClaim}`)}`,
  );
  for (const value of routes) {
    const fragment = serialiseViewRoute(value);
    const parsed = route(fragment);
    assert.equal(parsed.source, "explicit");
    assert.equal(routesEqual(parsed.route, value), true);
    assert.equal(serialiseViewRoute(parsed.route), fragment);
  }
});

test("serialisation rejects invalid caller-owned route objects", () => {
  assert.throws(
    () => serialiseViewRoute({ view: "guided", selection: { kind: "record", recordId: "invalid" } }),
    /invalid or incompatible/u,
  );
  assert.throws(
    () => serialiseViewRoute({
      view: "guided",
      selection: { kind: "answer", answerId, claimId: firstClaim, compareClaimIds: [firstClaim, secondClaim] },
    }),
    /cannot select a claim and comparison/u,
  );
});

test("switching view returns a fresh selection object without changing evidence state", () => {
  const original = {
    view: "guided",
    selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [firstClaim, secondClaim] },
  };
  const switched = routeWithView(original, "technical");
  assert.deepEqual(switched, {
    view: "technical",
    selection: original.selection,
  });
  assert.notEqual(switched, original);
  assert.notEqual(switched.selection, original.selection);
  assert.notEqual(switched.selection.compareClaimIds, original.selection.compareClaimIds);
  assert.deepEqual(original, {
    view: "guided",
    selection: { kind: "answer", answerId, claimId: null, compareClaimIds: [firstClaim, secondClaim] },
  });
});
