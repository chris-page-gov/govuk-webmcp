export type JsonObject = Record<string, unknown>;

export type AccessStatus =
  | "public"
  | "restricted"
  | "authentication-required"
  | "access-not-established"
  | "not-applicable";

export type AssertionStatus =
  | "official-source"
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
