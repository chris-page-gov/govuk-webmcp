import { createHash } from "node:crypto";

export const PUBLIC_CAPTURE_TARGET = "https://chris-page-gov.github.io/govuk-webmcp/";
export const PUBLIC_DEPLOYMENT_REPOSITORY = "chris-page-gov/govuk-webmcp";
export const PUBLIC_DEPLOYMENT_SCHEMA = "trusted-govuk-discovery.deployment.v1";

const COMMIT = /^[a-f0-9]{40}$/u;
const RUN_ID = /^[1-9][0-9]*$/u;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function exactKeys(value, expected, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object.`);
  const observed = Object.keys(value).sort();
  const required = [...expected].sort();
  invariant(JSON.stringify(observed) === JSON.stringify(required), `${label} has unknown or missing fields.`);
}

function parseExpectedCommit(rawExpectedCommit) {
  if (rawExpectedCommit === undefined || rawExpectedCommit === "") return null;
  invariant(
    typeof rawExpectedCommit === "string" && COMMIT.test(rawExpectedCommit),
    "WEBMCP_EXPECTED_COMMIT must be an exact lowercase 40-character Git commit.",
  );
  return rawExpectedCommit;
}

export function parseDevtoolsCaptureTarget(environment = process.env) {
  const rawTarget = environment.WEBMCP_DEVTOOLS_TARGET_URL;
  const expectedCommit = parseExpectedCommit(environment.WEBMCP_EXPECTED_COMMIT);
  if (rawTarget === undefined || rawTarget === "") {
    invariant(
      expectedCommit === null,
      "WEBMCP_EXPECTED_COMMIT is accepted only with the allowlisted public target.",
    );
    return {
      mode: "local",
      publicTarget: false,
      targetUrl: null,
      expectedCommit: null,
      receiptName: "chrome-devtools-mcp.json",
    };
  }

  invariant(typeof rawTarget === "string", "WEBMCP_DEVTOOLS_TARGET_URL must be a string.");
  if (rawTarget.trim() === "") {
    invariant(
      expectedCommit === null,
      "WEBMCP_EXPECTED_COMMIT is accepted only with the allowlisted public target.",
    );
    return {
      mode: "local",
      publicTarget: false,
      targetUrl: null,
      expectedCommit: null,
      receiptName: "chrome-devtools-mcp.json",
    };
  }
  let parsed;
  try {
    parsed = new URL(rawTarget.trim());
  } catch {
    throw new Error(`WEBMCP_DEVTOOLS_TARGET_URL must be exactly ${PUBLIC_CAPTURE_TARGET}.`);
  }
  const normalisedPath = parsed.pathname === "/govuk-webmcp" ? "/govuk-webmcp/" : parsed.pathname;
  parsed.pathname = normalisedPath;
  invariant(
    parsed.href === PUBLIC_CAPTURE_TARGET,
    `WEBMCP_DEVTOOLS_TARGET_URL must be exactly ${PUBLIC_CAPTURE_TARGET}.`,
  );

  return {
    mode: "public",
    publicTarget: true,
    targetUrl: PUBLIC_CAPTURE_TARGET,
    expectedCommit,
    receiptName: "chrome-devtools-mcp-public.json",
  };
}

export function validatePublicDeploymentMetadata(value, expectedCommit = null) {
  exactKeys(value, ["schema", "repository", "commit", "runId"], "Public deployment metadata");
  invariant(value.schema === PUBLIC_DEPLOYMENT_SCHEMA, "Public deployment metadata has the wrong schema.");
  invariant(
    value.repository === PUBLIC_DEPLOYMENT_REPOSITORY,
    "Public deployment metadata has the wrong repository.",
  );
  invariant(typeof value.commit === "string" && COMMIT.test(value.commit), "Public deployment metadata has an invalid commit.");
  invariant(typeof value.runId === "string" && RUN_ID.test(value.runId), "Public deployment metadata has an invalid run ID.");
  if (expectedCommit !== null) {
    invariant(COMMIT.test(expectedCommit), "Expected public commit is invalid.");
    invariant(value.commit === expectedCommit, "Public deployment commit does not match WEBMCP_EXPECTED_COMMIT.");
  }
  return {
    schema: value.schema,
    repository: value.repository,
    commit: value.commit,
    runId: value.runId,
  };
}

export async function fetchPublicDeploymentMetadata({
  expectedCommit = null,
  fetchImplementation = fetch,
} = {}) {
  const metadataUrl = new URL("deployment.json", PUBLIC_CAPTURE_TARGET).href;
  const response = await fetchImplementation(metadataUrl, {
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
  });
  invariant(response && response.ok === true, `Public deployment metadata request failed with HTTP ${String(response?.status)}.`);
  const bytes = await response.text();
  invariant(Buffer.byteLength(bytes, "utf8") <= 4_096, "Public deployment metadata exceeds 4096 bytes.");
  let value;
  try {
    value = JSON.parse(bytes);
  } catch {
    throw new Error("Public deployment metadata is not valid JSON.");
  }
  const metadata = validatePublicDeploymentMetadata(value, expectedCommit);
  return {
    url: metadataUrl,
    sha256: createHash("sha256").update(bytes, "utf8").digest("hex"),
    metadata,
  };
}
