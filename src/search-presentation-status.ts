import type { JsonObject } from "./contracts.js";

function errorCode(result: JsonObject): string | undefined {
  if (result.error === null || typeof result.error !== "object" || Array.isArray(result.error)) {
    return undefined;
  }
  const value = (result.error as JsonObject).code;
  return typeof value === "string" ? value : undefined;
}

export function searchPresentationStatus(result: JsonObject): string {
  if (result.ok === true) {
    const partial = Array.isArray(result.collectionStatuses) &&
      (result.collectionStatuses as JsonObject[]).some(({ status }) => status !== "ready");
    const lowerBound = result.totalRelation && result.totalRelation !== "eq" ? " or more" : "";
    const summary = `${String(result.totalMatches)} matching records${lowerBound}; ${String(result.returned)} shown.`;
    return partial
      ? `${summary} One or more collections were unavailable; available evidence is shown.`
      : summary;
  }

  switch (errorCode(result)) {
    case "invalid_search_request":
    case "input_budget_exceeded":
      return "The search input was rejected.";
    case "federated_runtime_busy":
      return "Federated search is temporarily busy. No substitute source was selected. Try again.";
    default:
      return "The search could not be completed. No substitute source was selected.";
  }
}
