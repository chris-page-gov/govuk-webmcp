import { createHash } from "node:crypto";

export const PUBLIC_CAPTURE_TARGET = "https://chris-page-gov.github.io/govuk-webmcp/";
export const PUBLIC_DEPLOYMENT_REPOSITORY = "chris-page-gov/govuk-webmcp";
export const PUBLIC_DEPLOYMENT_SCHEMA = "trusted-govuk-discovery.deployment.v1";

const COMMIT = /^[a-f0-9]{40}$/u;
const RUN_ID = /^[1-9][0-9]*$/u;
const MAX_DEPLOYMENT_METADATA_BYTES = 4_096;
const DEPLOYMENT_METADATA_TIMEOUT_MS = 10_000;

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

export function assertPublicEvidenceAdmissionTarget(target, admissionRequested) {
  invariant(typeof admissionRequested === "boolean", "Public-evidence admission state must be boolean.");
  if (!admissionRequested) return target;
  invariant(target?.publicTarget === true, "Public evidence can be admitted only from the allowlisted public target.");
  invariant(target.expectedCommit !== null && COMMIT.test(target.expectedCommit), "Public evidence admission requires an exact WEBMCP_EXPECTED_COMMIT.");
  return target;
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

export function assertMatchingPublicDeploymentSnapshot(expected, observed, label = "Public deployment") {
  invariant(expected && observed, `${label} snapshots are required.`);
  invariant(
    expected.url === observed.url
      && expected.sha256 === observed.sha256
      && JSON.stringify(expected.metadata) === JSON.stringify(observed.metadata),
    `${label} metadata changed during capture. Discard the mixed capture and retry against one stable deployment.`,
  );
  return observed;
}

function deadlineError() {
  const error = new Error("Public deployment metadata request exceeded its 10-second deadline.");
  error.name = "TimeoutError";
  return error;
}

function settleBeforeAbort(promise, signal) {
  if (signal.aborted) return Promise.reject(deadlineError());
  return new Promise((resolve, reject) => {
    const abort = () => {
      cleanup();
      reject(deadlineError());
    };
    const cleanup = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(promise).then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

async function readBoundedDeploymentMetadata(response, signal) {
  const declaredLength = response.headers?.get?.("content-length");
  if (declaredLength !== null && declaredLength !== undefined) {
    invariant(/^(?:0|[1-9][0-9]*)$/u.test(declaredLength), "Public deployment metadata has an invalid Content-Length.");
    invariant(Number(declaredLength) <= MAX_DEPLOYMENT_METADATA_BYTES, "Public deployment metadata exceeds 4096 bytes.");
  }
  invariant(response.body && typeof response.body.getReader === "function", "Public deployment metadata response has no readable body.");
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await settleBeforeAbort(reader.read(), signal);
      if (done) break;
      invariant(value instanceof Uint8Array, "Public deployment metadata returned a non-byte body chunk.");
      received += value.byteLength;
      invariant(received <= MAX_DEPLOYMENT_METADATA_BYTES, "Public deployment metadata exceeds 4096 bytes.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Public deployment metadata is not valid UTF-8.");
  }
}

export async function fetchPublicDeploymentMetadata({
  expectedCommit = null,
  fetchImplementation = fetch,
  timeoutMs = DEPLOYMENT_METADATA_TIMEOUT_MS,
} = {}) {
  invariant(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= DEPLOYMENT_METADATA_TIMEOUT_MS, "Public deployment metadata timeout is invalid.");
  const metadataUrl = new URL("deployment.json", PUBLIC_CAPTURE_TARGET).href;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let bytes;
  let response;
  try {
    response = await settleBeforeAbort(fetchImplementation(metadataUrl, {
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: controller.signal,
    }), controller.signal);
    invariant(response && response.ok === true, `Public deployment metadata request failed with HTTP ${String(response?.status)}.`);
    bytes = await readBoundedDeploymentMetadata(response, controller.signal);
  } finally {
    clearTimeout(timeout);
  }
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
