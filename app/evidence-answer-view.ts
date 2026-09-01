import type {
  AcceptedPresentationInput,
  BeginnerFoundation,
  BeginnerPresentation,
  CannotDecideItem,
} from "../src/beginner-presentation.js";
import { parseViewHash, serialiseViewRoute } from "./view-routing.js";

export type EvidenceAnswerOrigin = "human" | "webmcp" | "restore";
export type EvidenceAnswerAcceptedInput = AcceptedPresentationInput;
export type EvidenceAnswerFoundation = BeginnerFoundation;
export type EvidenceAnswerPresentation = BeginnerPresentation;

export interface EvidenceAnswerViewElements {
  readonly root: HTMLElement;
  readonly heading: HTMLElement;
  readonly content: HTMLElement;
  readonly activity: HTMLElement;
  readonly status?: HTMLElement;
}

export interface EvidenceAnswerViewOptions {
  readonly technicalReviewHref?: (presentation: EvidenceAnswerPresentation) => string;
  readonly onTechnicalReviewRequest?: (
    presentation: EvidenceAnswerPresentation,
    event: MouseEvent,
  ) => void;
}

export interface EvidenceAnswerRenderOptions {
  readonly origin: EvidenceAnswerOrigin;
  readonly comparisonSelected?: boolean;
  /** SHA-256 of the canonical Evidence answer object, calculated outside it. */
  readonly evidenceDigest?: string | null;
}

export interface EvidenceAnswerView {
  renderInitial(): void;
  renderPresentation(
    presentation: EvidenceAnswerPresentation,
    options: EvidenceAnswerRenderOptions,
  ): void;
  announceFailure(message: string): void;
  focusHeading(): void;
}

const RESOURCE_DETAIL_LABELS = [
  ["recordId", "Record reference"],
  ["resourceType", "Resource type"],
  ["collectionId", "Evidence collection"],
  ["sourceNativeId", "Source reference"],
  ["snapshot", "Saved source snapshot"],
  ["revision", "Source revision"],
] as const;

const BOUNDARY_LABELS = [
  ["presentationEffect", "Display effect"],
  ["pageScoped", "Limited to this page"],
  ["sameOriginStaticReads", "Same-origin static evidence reads"],
  ["modelHostedByPage", "AI model hosted by this page"],
  ["aiAnswerObserved", "AI's final wording visible to this page"],
  ["providerCall", "Model-provider call made by this page"],
  ["officialApiCall", "Official-service API called at runtime"],
  ["sourceRefetchedAtRuntime", "Recorded source fetched again at runtime"],
  ["catalogueMutation", "Catalogue changed"],
  ["storageWrite", "Written to browser storage"],
  ["externalStateChange", "External state changed"],
  ["personalContextAccepted", "Dedicated personal-context field accepted"],
  ["durableReceiptCreated", "Durable per-call receipt created"],
  ["personalisedDecision", "Personalised decision made"],
  ["eligibilityDecision", "Eligibility decision made"],
  ["legalDecision", "Legal decision made"],
  ["liveValueProvided", "Live value provided"],
  ["ownershipRecordProvided", "Ownership record provided"],
  ["accessAuthorityGranted", "Access authority granted"],
  ["itemLevelReview", "Item-level review recorded"],
  ["evidenceReceiptAvailable", "Item-level evidence receipt available"],
  ["cryptographicSignatureVerified", "Government cryptographic signature verified"],
  ["sourceDerivedContentIsUntrusted", "Source-derived text treated as untrusted"],
  ["singleTrustScore", "Single trust score used"],
] as const;

const RESULT_KIND_LABELS: Readonly<Record<EvidenceAnswerPresentation["resultKind"], string>> = {
  "reviewed-answer": "Worked answer from a small reviewed set in this prototype",
  "reviewed-record": "Reviewed record in this prototype",
  "federated-record": "Wider catalogue record",
};

function node<K extends keyof HTMLElementTagNameMap>(
  document: Document,
  tag: K,
  text?: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const value = document.createElement(tag);
  if (text !== undefined) value.textContent = text;
  if (className) value.className = className;
  return value;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not established";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "Not established";
}

function appendDefinitionList(
  document: Document,
  parent: HTMLElement | DocumentFragment,
  entries: ReadonlyArray<readonly [string, unknown]>,
): void {
  const list = node(document, "dl", undefined, "evidence-answer__details-list");
  for (const [term, value] of entries) {
    const group = node(document, "div");
    group.append(node(document, "dt", term), node(document, "dd", displayValue(value)));
    list.append(group);
  }
  parent.append(list);
}

function appendTextList(
  document: Document,
  parent: HTMLElement,
  values: readonly string[],
  ordered = false,
): void {
  const list = ordered ? node(document, "ol") : node(document, "ul");
  for (const value of values) list.append(node(document, "li", value));
  parent.append(list);
}

function sourceRoleLabel(value: string): string {
  const labels: Readonly<Record<string, string>> = {
    "official-source": "Official source",
    "producer-declared-source": "Recorded source link declared by the producer",
    "producer-record": "Independent OKF record",
    "no-direct-authority-link": "No direct authority link established",
  };
  return labels[value] ?? value.replaceAll("-", " ");
}

function sourceLinkLabel(value: string): string {
  if (value === "official-source") return "Open official source";
  if (value === "producer-record") return "Open independent OKF record";
  return "Open recorded source link";
}

export function validatedSourceHref(value: unknown, expectedHostname: unknown): string | null {
  if (
    typeof value !== "string" || value.length < 1 || value.length > 2_048 ||
    typeof expectedHostname !== "string" || !expectedHostname
  ) return null;
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" || parsed.username || parsed.password ||
      (parsed.port && parsed.port !== "443") ||
      parsed.hostname.toLocaleLowerCase("en-GB") !== expectedHostname.toLocaleLowerCase("en-GB")
    ) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function validatedTechnicalReviewHref(value: unknown): string {
  if (typeof value !== "string") return "#view=technical";
  const parsed = parseViewHash(value);
  if (parsed.kind !== "route" || parsed.route.view !== "technical") return "#view=technical";
  return serialiseViewRoute(parsed.route);
}

function normalisedCannotDecide(value: readonly CannotDecideItem[]): string[] {
  const values = value.map(({ statement }) => statement);
  return values.length
    ? values
    : ["This page does not make a decision about your circumstances."];
}

function presentationActivityText(
  presentation: EvidenceAnswerPresentation,
  origin: EvidenceAnswerOrigin,
): string {
  const accepted = presentation.acceptedInput;
  if (accepted === null) return "No new action was accepted for this restored view.";

  if (origin === "webmcp") {
    return accepted.action === "present_resource_evidence"
      ? "Your AI asked this page to show evidence for this record."
      : "Your AI asked this page to update the evidence display.";
  }
  return "You asked this page to show this evidence.";
}

function appendAcceptedInput(
  document: Document,
  article: HTMLElement,
  accepted: EvidenceAnswerAcceptedInput,
): void {
  const section = node(document, "section", undefined, "evidence-answer__activity-details");
  section.append(node(document, "h2", "What was shared with this page"));
  if (accepted === null) {
    section.append(node(document, "p", "No new action was accepted for this restored view."));
    article.append(section);
    return;
  }

  const actionLabels: Readonly<Record<Exclude<EvidenceAnswerAcceptedInput, null>["action"], string>> = {
    explore_answer_foundations: "Show a worked evidence answer",
    compare_evidence_foundations: "Compare evidence foundations",
    present_resource_evidence: "Show evidence for a record",
  };
  const entries: Array<readonly [string, unknown]> = [["Action", actionLabels[accepted.action]]];
  switch (accepted.action) {
    case "explore_answer_foundations":
      entries.push(["Answer reference", accepted.answerId], ["Claim reference", accepted.claimId]);
      break;
    case "compare_evidence_foundations":
      entries.push(["Answer reference", accepted.answerId], ["Claim references", accepted.claimIds.join(", ")]);
      break;
    case "present_resource_evidence":
      entries.push(["Record reference", accepted.recordId]);
      break;
  }
  entries.push(
    ["Dedicated personal-context fields in this action", "None"],
    ["Held in this tab for this display", "Yes"],
    ["Saved persistently by this page", "No"],
  );
  appendDefinitionList(document, section, entries);

  const structured = node(document, "details", undefined, "evidence-answer__accepted-input");
  const structuredSummary = node(document, "summary", "Show the accepted fields as structured data");
  structuredSummary.dataset.focusKey = "accepted-input-summary";
  structured.append(structuredSummary);
  structured.append(node(document, "pre", JSON.stringify(accepted, null, 2)));
  section.append(structured);
  article.append(section);
}

function appendFoundWhat(
  document: Document,
  article: HTMLElement,
  presentation: EvidenceAnswerPresentation,
): void {
  article.append(node(document, "h2", "What this page found"));
  article.append(
    node(document, "p", RESULT_KIND_LABELS[presentation.resultKind], "evidence-answer__result-kind"),
    node(document, "h3", presentation.heading, "evidence-answer__result-heading"),
    node(document, "p", `${presentation.evidenceTierLabel} (${presentation.evidenceTier})`, "evidence-answer__tier"),
  );
}

function appendSupportedStatements(
  document: Document,
  article: HTMLElement,
  foundations: readonly EvidenceAnswerFoundation[],
): void {
  article.append(node(document, "h2", "What the evidence supports"));
  if (foundations.length === 1) {
    article.append(node(document, "p", foundations[0]!.supportedStatement));
  } else {
    appendTextList(document, article, foundations.map(({ supportedStatement }) => supportedStatement), true);
  }
}

function evidenceStatusText(presentation: EvidenceAnswerPresentation): string {
  if (presentation.evidenceTier === "reviewed-deep-evidence") {
    return "This evidence was checked at item level in this prototype and has a digest-bound evidence receipt.";
  }
  return "This wider-catalogue evidence passed snapshot and file-integrity checks, but it has not had item-level review in this prototype.";
}

function appendEvidenceStatus(
  document: Document,
  article: HTMLElement,
  presentation: EvidenceAnswerPresentation,
  evidenceDigest: string | null | undefined,
): void {
  article.append(
    node(document, "h2", "Evidence status"),
    node(document, "p", evidenceStatusText(presentation)),
  );
  appendDefinitionList(document, article, [
    ["Machine schema", presentation.schema],
    ["Result kind", presentation.resultKind],
    ["Evidence tier", presentation.evidenceTier],
    ["Selection reference", presentation.selectionId],
    ["Evidence answer digest", evidenceDigest ?? "Not created for this restored view"],
  ]);
}

function formatObservedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function appendFreshness(
  document: Document,
  article: HTMLElement,
  foundations: readonly EvidenceAnswerFoundation[],
): void {
  article.append(node(document, "h2", "When the evidence was observed"));
  const list = node(document, "ol", undefined, "evidence-answer__freshness");
  foundations.forEach((foundation) => {
    const item = node(document, "li");
    item.append(
      node(document, "h3", foundation.sourceTitle),
      node(document, "p", `Observed on ${formatObservedAt(foundation.observedAt)} (${foundation.observedAt}).`),
      node(document, "p", "This records when the source metadata was captured. It does not prove that the underlying information is still current."),
    );
    list.append(item);
  });
  article.append(list);
}

function appendAssuranceFacets(
  document: Document,
  article: HTMLElement,
  foundations: readonly EvidenceAnswerFoundation[],
): void {
  article.append(node(document, "h2", "Integrity, access, rights and coverage"));
  foundations.forEach((foundation, index) => {
    const section = node(document, "section", undefined, "evidence-answer__assurance");
    if (foundations.length > 1) {
      section.append(node(document, "h3", `Checks for statement ${index + 1}`));
    }
    appendDefinitionList(document, section, [
      ["Integrity", `${foundation.integrityBasis.status} — ${foundation.integrityBasis.note}`],
      ["Access", `${foundation.access.status} — ${foundation.access.note}`],
      ["Rights", `${foundation.rights.status} — ${foundation.rights.note}`],
      ["Coverage", `${foundation.coverage.status} — ${foundation.coverage.note}`],
    ]);
    article.append(section);
  });
}

function appendLimitations(
  document: Document,
  article: HTMLElement,
  presentation: EvidenceAnswerPresentation,
): void {
  if (presentation.primaryLimitation !== null) {
    article.append(
      node(document, "h2", "Important limit"),
      node(document, "p", presentation.primaryLimitation, "evidence-answer__limitation"),
    );
    const remaining = presentation.allLimitations.filter((value) => value !== presentation.primaryLimitation);
    if (remaining.length) {
      article.append(node(document, "h3", "Other recorded limits"));
      appendTextList(document, article, remaining);
    }
    return;
  }
  article.append(node(document, "h2", "Limits to check"));
  if (presentation.allLimitations.length) {
    appendTextList(document, article, presentation.allLimitations);
  } else {
    article.append(node(
      document,
      "p",
      "No limitation is recorded. This does not establish that no limitation exists.",
      "evidence-answer__limitation",
    ));
  }
}

function appendSources(
  document: Document,
  article: HTMLElement,
  foundations: readonly EvidenceAnswerFoundation[],
): void {
  article.append(node(document, "h2", foundations.length === 1 ? "Recorded source" : "Recorded sources"));
  const list = node(document, "ol", undefined, "evidence-answer__sources");
  foundations.forEach((foundation, index) => {
    const item = node(document, "li");
    item.append(
      node(document, "h3", foundation.sourceTitle),
      node(document, "p", `Supports: ${foundation.supportedStatement}`),
      node(document, "p", `Source role: ${sourceRoleLabel(foundation.sourceRole)}`),
      node(document, "p", `Recorded authority: ${foundation.sourceAuthority}`),
      node(document, "p", `Publisher: ${foundation.publisher}`),
    );
    const href = validatedSourceHref(foundation.sourceUrl, foundation.sourceHostname);
    if (href) {
      const link = node(document, "a", sourceLinkLabel(foundation.sourceRole));
      link.href = href;
      link.rel = "noopener noreferrer";
      link.dataset.focusKey = `source-link-${index}`;
      const hostname = new URL(href).hostname;
      item.append(link, node(document, "p", `Destination: ${hostname}`, "evidence-answer__destination"));
    } else {
      item.append(node(document, "p", "No direct source link established."));
    }
    list.append(item);
  });
  article.append(list);
}

function appendComparisonGuide(document: Document, article: HTMLElement): void {
  const section = node(document, "section", undefined, "evidence-answer__comparison-guide");
  section.append(node(document, "h2", "Compare this with your AI's answer"));
  for (const [heading, copy] of [
    ["From this page", "The supported statements, material limits and recorded source roles shown above came from this page's deterministic evidence."],
    ["From your AI", "Your AI may have shortened, combined or added to this. This page cannot see or verify its final wording."],
    ["Check carefully", "Compare dates, amounts, deadlines, eligibility, legal steps, ownership claims and instructions with what this page actually shows."],
  ] as const) {
    const item = node(document, "div");
    item.append(node(document, "h3", heading), node(document, "p", copy));
    section.append(item);
  }
  article.append(section);
}

function appendFoundationDetails(
  document: Document,
  article: HTMLElement,
  presentation: EvidenceAnswerPresentation,
): void {
  const details = node(document, "details", undefined, "evidence-answer__full-details");
  const detailsSummary = node(document, "summary", "Check each evidence question");
  detailsSummary.dataset.focusKey = "evidence-questions-summary";
  details.append(detailsSummary);
  presentation.foundations.forEach((foundation, index) => {
    const section = node(document, "section");
    section.append(node(document, "h3", presentation.foundations.length === 1
      ? "Evidence details"
      : `Evidence details for statement ${index + 1}`));
    appendDefinitionList(document, section, [
      ["What is asserted?", foundation.assertionStatus],
      ["Who published it?", foundation.publisher],
      ["What authority is recorded?", foundation.sourceAuthority],
      ["What source role is recorded?", sourceRoleLabel(foundation.sourceRole)],
      ["When was it observed?", foundation.observedAt],
      ["How was the packaged evidence checked?", foundation.integrityBasis.status],
      ["Integrity boundary", foundation.integrityBasis.note],
      ["Integrity digest", foundation.integrityBasis.digest],
      ["What access is recorded?", foundation.access.status],
      ["Access evidence", foundation.access.note],
      ["What reuse rights are recorded?", foundation.rights.status],
      ["Licence title", foundation.rights.title],
      ["Rights evidence", foundation.rights.note],
      ["What does it cover?", foundation.coverage.status],
      ["Coverage boundary", foundation.coverage.note],
      ...RESOURCE_DETAIL_LABELS.map(([field, label]) => [label, foundation.resourceDetails[field]] as const),
    ]);
    if (foundation.allLimitations.length) {
      section.append(node(document, "h4", "All limits for this statement"));
      appendTextList(document, section, foundation.allLimitations);
    }
    details.append(section);
  });

  const boundaries = node(document, "section");
  boundaries.append(node(document, "h3", "Page and assurance boundaries"));
  appendDefinitionList(document, boundaries, BOUNDARY_LABELS.map(([field, label]) => [
    label,
    presentation.boundaries[field],
  ]));
  details.append(boundaries);

  const identifiers = node(document, "section");
  identifiers.append(node(document, "h3", "Technical evidence identifiers"));
  appendDefinitionList(document, identifiers, [
    ["Selection reference", presentation.selectionId],
    ["Evidence Trace digest", presentation.sourceResultDigests.evidenceTrace],
    ["Record-result digest", presentation.sourceResultDigests.recordResult],
    ["Provenance-result digest", presentation.sourceResultDigests.provenanceResult],
  ]);
  details.append(identifiers);

  const structured = node(document, "details", undefined, "evidence-answer__structured-result");
  const structuredSummary = node(document, "summary", "Show the structured Evidence answer");
  structuredSummary.dataset.focusKey = "structured-evidence-summary";
  structured.append(structuredSummary);
  structured.append(node(document, "pre", JSON.stringify(presentation, null, 2)));
  details.append(structured);
  article.append(details);
}

function appendReflection(
  document: Document,
  article: HTMLElement,
  presentation: EvidenceAnswerPresentation,
): void {
  const unknown = normalisedCannotDecide(presentation.cannotDecide);
  const section = node(document, "section", undefined, "evidence-answer__reflection");
  section.append(node(document, "h2", "Before you rely on this"));
  appendDefinitionList(document, section, [
    ["Supported", presentation.foundations.map(({ supportedStatement }) => supportedStatement).join("; ")],
    ["Still unknown", unknown.join("; ")],
    ["Next check", presentation.nextCheck],
  ]);
  article.append(section);
}

function safeStatusMessage(value: string): string {
  const text = value.trim().replace(/\s+/gu, " ");
  return text.slice(0, 500);
}

export function createEvidenceAnswerView(
  elements: EvidenceAnswerViewElements,
  viewOptions: EvidenceAnswerViewOptions = {},
): EvidenceAnswerView {
  const { root, heading, content, activity, status } = elements;
  const document = root.ownerDocument;
  if (heading.ownerDocument !== document || content.ownerDocument !== document || activity.ownerDocument !== document) {
    throw new TypeError("Evidence answer elements must belong to the same document.");
  }
  if (status && status.ownerDocument !== document) {
    throw new TypeError("The Evidence answer status element must belong to the same document.");
  }
  if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;

  function renderInitial(): void {
    root.dataset.presentationState = "empty";
    delete root.dataset.selectionId;
    delete root.dataset.resultKind;
    activity.textContent = "No AI action was presented to this page.";
    content.replaceChildren(node(
      document,
      "p",
      "Find a short topic or ask a compatible AI to use this page's tools. Evidence selected by the page will appear here.",
    ));
  }

  function renderPresentation(
    presentation: EvidenceAnswerPresentation,
    options: EvidenceAnswerRenderOptions,
  ): void {
    root.dataset.presentationState = "presented";
    root.dataset.selectionId = presentation.selectionId;
    root.dataset.resultKind = presentation.resultKind;
    activity.textContent = presentationActivityText(presentation, options.origin);

    const article = node(document, "article", undefined, "evidence-answer__result");
    appendFoundWhat(document, article, presentation);
    if (options.comparisonSelected) {
      article.append(node(
        document,
        "p",
        "A detailed foundation comparison is selected. Open Technical review to inspect it.",
        "evidence-answer__comparison-notice",
      ));
    }
    appendSupportedStatements(document, article, presentation.foundations);
    appendEvidenceStatus(document, article, presentation, options.evidenceDigest);
    appendSources(document, article, presentation.foundations);
    appendFreshness(document, article, presentation.foundations);
    appendAssuranceFacets(document, article, presentation.foundations);
    appendLimitations(document, article, presentation);
    article.append(node(document, "h2", "What this page cannot decide"));
    appendTextList(document, article, normalisedCannotDecide(presentation.cannotDecide));
    appendAcceptedInput(document, article, presentation.acceptedInput);
    appendComparisonGuide(document, article);
    appendReflection(document, article, presentation);
    appendFoundationDetails(document, article, presentation);

    const deeper = node(document, "section", undefined, "evidence-answer__deeper-evidence");
    deeper.append(node(document, "h2", "See the complete technical evidence"));
    const requestedHref = viewOptions.technicalReviewHref?.(presentation) ?? "#view=technical";
    const technicalLink = node(document, "a", "See all evidence details");
    technicalLink.href = validatedTechnicalReviewHref(requestedHref);
    technicalLink.dataset.focusKey = "technical-review-link";
    if (viewOptions.onTechnicalReviewRequest) {
      technicalLink.addEventListener("click", (event) => {
        viewOptions.onTechnicalReviewRequest?.(presentation, event);
      });
    }
    deeper.append(technicalLink);
    article.append(deeper);
    content.replaceChildren(article);

    if (status) {
      status.textContent = options.origin === "webmcp"
        ? "Your AI updated the Evidence answer. No source, storage or external state changed."
        : options.origin === "restore"
          ? "The saved Evidence answer view was restored. No new action was accepted."
          : "The Evidence answer was updated from this page's deterministic evidence.";
    }
  }

  return {
    renderInitial,
    renderPresentation,
    announceFailure(message): void {
      if (status) status.textContent = `The evidence could not be presented. ${safeStatusMessage(message)}`;
    },
    focusHeading(): void {
      heading.focus();
    },
  };
}

function requiredElement<T extends HTMLElement>(document: Document, selector: string): T {
  const value = document.querySelector<T>(selector);
  if (!value) throw new Error(`The Evidence answer mount is missing: ${selector}`);
  return value;
}

/** Resolve the agreed shell IDs while keeping createEvidenceAnswerView independently injectable. */
export function evidenceAnswerViewElements(document: Document): EvidenceAnswerViewElements {
  const status = document.querySelector<HTMLElement>("#status");
  return {
    root: requiredElement(document, "#evidence-answer-view"),
    heading: requiredElement(document, "#evidence-answer-heading"),
    content: requiredElement(document, "#evidence-answer-content"),
    activity: requiredElement(document, "#evidence-answer-activity"),
    ...(status ? { status } : {}),
  };
}
