import assert from "node:assert/strict";
import test from "node:test";

import { searchPresentationStatus } from "../../dist/src/search-presentation-status.js";

test("search presentation distinguishes rejected, busy and unavailable results", () => {
  assert.equal(
    searchPresentationStatus({ ok: false, error: { code: "invalid_search_request" } }),
    "The search input was rejected.",
  );
  assert.equal(
    searchPresentationStatus({ ok: false, error: { code: "federated_runtime_busy" } }),
    "Federated search is temporarily busy. No substitute source was selected. Try again.",
  );
  assert.equal(
    searchPresentationStatus({ ok: false, error: { code: "federated_record_unavailable" } }),
    "The search could not be completed. No substitute source was selected.",
  );
});

test("search presentation retains exact and lower-bound success semantics", () => {
  assert.equal(
    searchPresentationStatus({
      ok: true,
      totalMatches: 4,
      totalRelation: "eq",
      returned: 4,
      collectionStatuses: [{ status: "ready" }],
    }),
    "4 matching records; 4 shown.",
  );
  assert.equal(
    searchPresentationStatus({
      ok: true,
      totalMatches: 3,
      totalRelation: "gte",
      returned: 3,
      collectionStatuses: [{ status: "unavailable" }],
    }),
    "3 matching records or more; 3 shown. One or more collections were unavailable; available evidence is shown.",
  );
});
