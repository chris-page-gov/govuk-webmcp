export type AppView = "guided" | "technical";

export const VIEW_LABELS: Readonly<Record<AppView, string>> = Object.freeze({
  guided: "Evidence answer",
  technical: "Technical review",
});

export type EvidenceSelection =
  | { readonly kind: "default" }
  | { readonly kind: "record"; readonly recordId: string }
  | {
      readonly kind: "answer";
      readonly answerId: string;
      readonly claimId: string | null;
      readonly compareClaimIds: readonly string[];
    };

export interface ViewRoute {
  readonly view: AppView;
  readonly selection: EvidenceSelection;
}

export type ParsedViewHash =
  | {
      readonly kind: "route";
      readonly route: ViewRoute;
      readonly source: "empty" | "explicit" | "legacy";
    }
  | { readonly kind: "anchor"; readonly id: "main-content" }
  | {
      readonly kind: "invalid";
      readonly fallback: ViewRoute;
      readonly warning: string;
    };

const RAW_HASH_MAX = 1_024;
const PARAMETER_KEYS = new Set(["view", "record", "answer", "claim", "compare"]);
const RECORD_ID = /^govuk-discovery:(?:(?!federated:)[a-z0-9][a-z0-9._:-]{2,111}|federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5}))$/u;
const ANSWER_ID = /^answer:[a-z0-9][a-z0-9-]{2,88}$/u;
const CLAIM_ID = /^claim:[a-z0-9][a-z0-9-]{2,89}$/u;

function defaultRoute(view: AppView): ViewRoute {
  return { view, selection: { kind: "default" } };
}

function fallbackView(params: URLSearchParams | undefined, raw: string): AppView {
  const views = params?.getAll("view") ?? [];
  if (views.length === 1 && (views[0] === "guided" || views[0] === "technical")) {
    return views[0];
  }
  const rawViews = [...raw.matchAll(/(?:^|&)view=(guided|technical)(?=&|$)/gu)];
  if (rawViews.length === 1) return rawViews[0]![1] as AppView;
  return /(?:^|&)(?:record|answer|claim|compare)=/u.test(raw) ? "technical" : "guided";
}

function invalid(
  warning: string,
  params: URLSearchParams | undefined,
  raw: string,
): ParsedViewHash {
  return { kind: "invalid", fallback: defaultRoute(fallbackView(params, raw)), warning };
}

function validRecordId(value: string): boolean {
  return value.length >= 3 && value.length <= 160 && RECORD_ID.test(value);
}

function validAnswerId(value: string): boolean {
  return value.length >= 8 && value.length <= 96 && ANSWER_ID.test(value);
}

function validClaimId(value: string): boolean {
  return value.length >= 8 && value.length <= 96 && CLAIM_ID.test(value);
}

/**
 * Parse the complete location hash. Invalid application state is returned as a
 * fixed warning plus a safe default; caller-owned fragment text is never copied
 * into the warning.
 */
export function parseViewHash(hash: string): ParsedViewHash {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return { kind: "route", route: defaultRoute("guided"), source: "empty" };
  if (raw === "main-content") return { kind: "anchor", id: "main-content" };
  if (raw.length > RAW_HASH_MAX) {
    return invalid("The requested view was too large to process safely. The default view is shown instead.", undefined, raw);
  }
  if (/%(?![0-9a-f]{2})/iu.test(raw)) {
    return invalid("The requested view contained malformed encoding. The default view is shown instead.", undefined, raw);
  }

  const params = new URLSearchParams(raw);
  const entries = [...params.entries()];
  if (entries.some(([key]) => !PARAMETER_KEYS.has(key))) {
    return invalid("The requested view contained an unsupported parameter. The default view is shown instead.", params, raw);
  }
  for (const key of PARAMETER_KEYS) {
    if (params.getAll(key).length > 1) {
      return invalid("The requested view repeated a parameter. The default view is shown instead.", params, raw);
    }
  }

  const viewValue = params.get("view");
  if (viewValue !== null && viewValue !== "guided" && viewValue !== "technical") {
    return invalid("The requested view name was not recognised. The default view is shown instead.", params, raw);
  }
  const hasEvidenceParameter = ["record", "answer", "claim", "compare"]
    .some((key) => params.has(key));
  const source = viewValue === null && hasEvidenceParameter ? "legacy" : "explicit";
  const view: AppView = viewValue ?? (hasEvidenceParameter ? "technical" : "guided");

  const recordId = params.get("record");
  const answerId = params.get("answer");
  const claimId = params.get("claim");
  const comparison = params.get("compare");

  if (recordId !== null) {
    if (answerId !== null || claimId !== null || comparison !== null) {
      return invalid("A record view cannot be combined with answer or comparison state. The default view is shown instead.", params, raw);
    }
    if (!validRecordId(recordId)) {
      return invalid("The requested record reference was malformed. The default view is shown instead.", params, raw);
    }
    return { kind: "route", route: { view, selection: { kind: "record", recordId } }, source };
  }

  if (claimId !== null && comparison !== null) {
    return invalid("A claim and a comparison cannot be selected together. The default view is shown instead.", params, raw);
  }
  if ((claimId !== null || comparison !== null) && answerId === null) {
    return invalid("A claim or comparison requires an answer reference. The default view is shown instead.", params, raw);
  }
  if (answerId !== null && !validAnswerId(answerId)) {
    return invalid("The requested answer reference was malformed. The default view is shown instead.", params, raw);
  }
  if (claimId !== null && !validClaimId(claimId)) {
    return invalid("The requested claim reference was malformed. The default view is shown instead.", params, raw);
  }

  let compareClaimIds: string[] = [];
  if (comparison !== null) {
    compareClaimIds = comparison.split(",");
    if (
      compareClaimIds.length < 2 || compareClaimIds.length > 4 ||
      compareClaimIds.some((value) => !validClaimId(value)) ||
      new Set(compareClaimIds).size !== compareClaimIds.length
    ) {
      return invalid("The requested comparison must contain two to four different claim references. The default view is shown instead.", params, raw);
    }
  }

  if (answerId !== null) {
    return {
      kind: "route",
      route: {
        view,
        selection: {
          kind: "answer",
          answerId,
          claimId,
          compareClaimIds,
        },
      },
      source,
    };
  }

  if (entries.length !== (viewValue === null ? 0 : 1)) {
    return invalid("The requested view contained incompatible state. The default view is shown instead.", params, raw);
  }
  return { kind: "route", route: defaultRoute(view), source };
}

function appendSelection(params: URLSearchParams, selection: EvidenceSelection): void {
  switch (selection.kind) {
    case "default":
      break;
    case "record":
      params.set("record", selection.recordId);
      break;
    case "answer":
      params.set("answer", selection.answerId);
      if (selection.claimId !== null) params.set("claim", selection.claimId);
      if (selection.compareClaimIds.length) params.set("compare", selection.compareClaimIds.join(","));
      break;
  }
}

export function routesEqual(left: ViewRoute, right: ViewRoute): boolean {
  if (left.view !== right.view || left.selection.kind !== right.selection.kind) return false;
  if (left.selection.kind === "default" && right.selection.kind === "default") return true;
  if (left.selection.kind === "record" && right.selection.kind === "record") {
    return left.selection.recordId === right.selection.recordId;
  }
  if (left.selection.kind !== "answer" || right.selection.kind !== "answer") return false;
  const rightComparison = right.selection.compareClaimIds;
  return left.selection.answerId === right.selection.answerId &&
    left.selection.claimId === right.selection.claimId &&
    left.selection.compareClaimIds.length === rightComparison.length &&
    left.selection.compareClaimIds.every((value, index) => value === rightComparison[index]);
}

/** Return a canonical fragment with stable view, record, answer, claim and comparison ordering. */
export function serialiseViewRoute(route: ViewRoute): string {
  if (route.view !== "guided" && route.view !== "technical") {
    throw new TypeError("The view route has an unsupported view.");
  }
  if (
    route.selection.kind === "answer" &&
    route.selection.claimId !== null &&
    route.selection.compareClaimIds.length
  ) {
    throw new TypeError("The view route cannot select a claim and comparison together.");
  }
  const params = new URLSearchParams();
  params.set("view", route.view);
  appendSelection(params, route.selection);
  const fragment = `#${params.toString()}`;
  const parsed = parseViewHash(fragment);
  if (parsed.kind !== "route" || !routesEqual(parsed.route, route)) {
    throw new TypeError("The view route contains invalid or incompatible evidence state.");
  }
  return fragment;
}

export function routeWithView(route: ViewRoute, view: AppView): ViewRoute {
  switch (route.selection.kind) {
    case "default":
      return { view, selection: { kind: "default" } };
    case "record":
      return { view, selection: { kind: "record", recordId: route.selection.recordId } };
    case "answer":
      return {
        view,
        selection: {
          kind: "answer",
          answerId: route.selection.answerId,
          claimId: route.selection.claimId,
          compareClaimIds: [...route.selection.compareClaimIds],
        },
      };
  }
}
