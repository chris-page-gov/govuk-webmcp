export type JsonObject = Record<string, unknown>;

export type AccessStatus =
  | "public"
  | "restricted"
  | "authentication-required"
  | "access-not-established"
  | "not-applicable";

export type AssertionStatus =
  | "official-source"
  | "producer-declared"
  | "normalised"
  | "inferred"
  | "model-derived";

export type ResourceType =
  | "govuk-content"
  | "dataset"
  | "api"
  | "api-documentation"
  | "catalogue-record"
  | "organisation"
  | "guidance";

export interface SourceReference {
  url: string;
  title: string;
  publisher: string;
  observedAt: string;
  digest?: string;
}

export interface FieldAssertion {
  field: string;
  status: AssertionStatus;
  evidenceUrls: string[];
  note?: string;
}

export interface DiscoveryRecord {
  id: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  publisher: string;
  steward?: string;
  topics: string[];
  canonicalHumanUrl: string;
  documentationUrl?: string;
  machineEndpoint?: string;
  apiCatalogueUrl?: string;
  licence: {
    status: "confirmed" | "missing" | "conflicting" | "not-applicable";
    title?: string;
    url?: string;
    attribution?: string;
  };
  access: {
    status: AccessStatus;
    evidenceUrl?: string;
    note: string;
  };
  dates: {
    firstPublished?: string;
    modified?: string;
    observed: string;
  };
  sourceAuthority: string;
  assertions: FieldAssertion[];
  provenance: {
    extractionMethod: string;
    sourceLock?: string;
    sourceDigest: string;
    recordDigest: string;
    bundleDigest: string;
    evidenceReceiptId: string;
    sources: SourceReference[];
  };
  limitations: string[];
  relatedRecordIds: string[];
}

export interface Catalogue {
  schema: "trusted-govuk-discovery.catalogue.v1";
  generatedAt: string;
  profile: "trusted-govuk-discovery.profile.v1";
  bundleDigest: string;
  sourceLocksDigest: string;
  records: DiscoveryRecord[];
}

export interface EvidenceReceipt {
  schema: "trusted-govuk-discovery.evidence-receipt.v1";
  id: string;
  observedAt: string;
  sourceLock: string;
  source: {
    url: string;
    title: string;
    publisher: string;
    sourceDigest: string;
  };
  output: {
    recordId: string;
    recordDigest: string;
    bundleDigest: string;
  };
  assertionStatuses: AssertionStatus[];
  limitations: string[];
  boundaries: {
    sourceWasNotRefetchedAtRuntime: true;
    cryptographicSignatureVerified: false;
    accessAuthorityGranted: false;
  };
  receiptDigest: string;
}

export type EvidenceTier = "reviewed-deep-evidence" | "federated-source-snapshot";

export type FederatedCollectionId =
  | "uk-living"
  | "ons"
  | "government-apis"
  | "land-registry";

export type KnowledgeCollectionId = "deep-evidence" | FederatedCollectionId;

export type AuthorityLinkRole =
  | "official-source"
  | "producer-declared-source"
  | "producer-record"
  | "no-direct-authority-link";

export interface FederatedRecordSummary extends JsonObject {
  id: string;
  ordinal: number;
  evidenceTier: "federated-source-snapshot";
  collectionId: FederatedCollectionId;
  sourceNativeId: string;
  sourceNativeIdSha256: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  publisher: string;
  topics: string[];
  authoritativeLink: {
    url: string | null;
    role: AuthorityLinkRole;
    label: string;
  };
  documentationUrl: string | null;
  licence: {
    status: "confirmed" | "missing" | "conflicting" | "not-applicable";
    title: string | null;
    url: string | null;
  };
  access: {
    status: AccessStatus;
    note: string;
  };
  assertionStatus: AssertionStatus | "unclassified";
  observedAt: string;
  snapshot: string | null;
  revision: string;
  deploymentId: string;
  sourcePath: string;
  sourceSha256: string;
  extractionMethod: string;
  limitations: string[];
  recordDigest: string;
}
