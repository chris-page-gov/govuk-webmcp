/**
 * Authored, model-free copy used by the Evidence answer projection.
 *
 * Source-derived strings never enter this module. Renderers must continue to
 * treat every string in a presentation as inert text.
 */

export const EVIDENCE_TIER_LABELS = Object.freeze({
  "reviewed-deep-evidence": "Reviewed evidence in this prototype",
  "federated-source-snapshot": "Wider catalogue source snapshot",
} as const);

export const NEXT_CHECK_COPY = Object.freeze({
  reviewed:
    "Open the recorded official source, confirm that it is current and check that it applies to your circumstances.",
  federated:
    "Open the recorded source, check who published it and confirm that it is current and usable for your task.",
  noRecordedLink:
    "No direct source link is recorded for this item. Refine the topic or use the current official GOV.UK search; do not fill the gap from memory.",
  liveValue:
    "Use the current publisher service to choose the measure, geography, period and status. This page holds metadata, not today's value.",
  ownership:
    "Open the recorded GOV.UK property-information link and confirm its role. This page holds no title, address or owner record.",
  jurisdiction:
    "Clarify the nation, responsible authority and outcome before treating this route as applicable.",
} as const);

export const PRIMARY_LIMITATION_BY_SELECTION: Readonly<Record<string, string>> = Object.freeze({
  "answer:new-child-starting-points":
    "Three recorded starting points are not an exhaustive or personalised checklist.",
  "govuk-discovery:govuk-content:6e2a4012-2448-47fd-b7ec-a47396e4b114":
    "The saved guide does not decide current eligibility or scheme rules.",
  "govuk-discovery:federated:uk-living:6959":
    "Authority, evidence, deadline, merits and jurisdiction are not established by this discovery record.",
  "govuk-discovery:federated:uk-living:7155":
    "Discovery is not tax advice or evidence of a registration requirement.",
  "govuk-discovery:federated:uk-living:7132":
    "The applicable nation, tenancy and protection scheme remain unresolved.",
  "govuk-discovery:federated:ons:11396":
    "Dataset metadata is not a selected edition, version or observation.",
  "govuk-discovery:federated:ons:9783":
    "The record supplies no current value, period, geography or statistical status.",
  "govuk-discovery:federated:government-apis:14854":
    "The record grants no account, credential, access, licence, suitability or live-service contract.",
  "govuk-discovery:federated:land-registry:57975":
    "The bundle supplies no title, address, owner, polygon, personal row or legal proof.",
  "govuk-discovery:api:flood-monitoring":
    "Minimal accepted arguments do not prove that context was withheld or that the recorded source is suitable.",
});

export const CANNOT_DECIDE_COPY = Object.freeze({
  personalisedApplicability: {
    kind: "personalised-applicability",
    statement: "This packaged evidence does not decide what applies to a person's circumstances.",
  },
  currentness: {
    kind: "currentness",
    statement: "A checksum can identify the packaged bytes; it does not establish that the source is still current.",
  },
  eligibility: {
    kind: "eligibility",
    statement: "This evidence does not decide eligibility or entitlement.",
  },
  itemLevelAuthority: {
    kind: "item-level-authority",
    statement: "Catalogue inclusion does not establish that this individual source-snapshot record is authoritative.",
  },
  accessAndRights: {
    kind: "access-and-rights",
    statement: "This evidence does not grant access or permission to reuse the recorded material.",
  },
  liveValue: {
    kind: "live-value",
    statement: "This metadata does not supply a current statistical value, period, geography or publication status.",
  },
  legalEffect: {
    kind: "legal-effect",
    statement: "This discovery record does not establish legal effect or provide legal advice.",
  },
  ownership: {
    kind: "ownership",
    statement: "This metadata contains no title, address, owner, polygon or personal record.",
  },
} as const);

export const INTEGRITY_COPY = Object.freeze({
  reviewed:
    "A SHA-256 digest and evidence receipt bind the packaged record. They do not prove that the source statement is true or current.",
  reviewedAnswer:
    "The Evidence Trace and its record-backed foundations are SHA-256 bound. This does not prove that the source statement is true or current.",
  federated:
    "Record, shard, source-lock and manifest digests bind the saved source snapshot. The item was not reviewed individually in this prototype.",
} as const);

export const COVERAGE_COPY = Object.freeze({
  reviewedRecord: {
    status: "one-record",
    note: "One reviewed catalogue record; linked source content was not refetched at runtime.",
  },
  federatedRecord: {
    status: "one-source-snapshot-record",
    note: "One saved source-collection record with no item-level review in this prototype.",
  },
} as const);

export const RIGHTS_NOTES = Object.freeze({
  confirmed: "The recorded metadata names reuse terms. Confirm the current terms at the recorded source.",
  missing: "No record-level licence was established from the admitted sources.",
  conflicting: "The admitted sources contain conflicting reuse-rights evidence.",
  "not-applicable": "Reuse rights are not applicable to this recorded item.",
} as const);
