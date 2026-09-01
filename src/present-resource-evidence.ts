import type { JsonObject } from "./contracts.js";
import {
  type BeginnerPresentation,
  BeginnerPresentationContractError,
  canonicalRecordIdFromResult,
  projectRecordEvidence,
} from "./beginner-presentation.js";
import { canonicalJson, sha256Hex } from "./integrity.js";

export interface PresentResourceEvidenceInput {
  readonly recordId: string;
}

export interface PresentResourceEvidenceRuntime {
  getRecord(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  showProvenance(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
}

/** Internal rendering context. It is never a field in the public tool result. */
export interface RecordPresentationSupport {
  readonly kind: "record";
  readonly recordResult: JsonObject;
  readonly provenanceResult: JsonObject;
}

export interface PresentResourceEvidenceSuccess extends JsonObject {
  readonly schema: "govuk-webmcp.present-resource-evidence-result.v1";
  readonly ok: true;
  /** This exact object is rendered by the Evidence answer view. */
  readonly evidence: BeginnerPresentation;
  /** Canonical SHA-256 of `evidence`; it is deliberately outside `evidence`. */
  readonly evidenceDigest: string;
}

/**
 * The action controller consumes `support`; a WebMCP handler returns only
 * `result`. Failed executions always carry null support.
 */
export interface PresentResourceEvidenceExecution {
  readonly result: JsonObject;
  readonly support: RecordPresentationSupport | null;
}

const PRESENT_INPUT_KEYS = new Set(["recordId"]);
const RECORD_ID = /^govuk-discovery:(?:(?!federated:)[a-z0-9][a-z0-9._:-]{2,111}|federated:(?:uk-living|ons|government-apis|land-registry):(?:0|[1-9][0-9]{0,5}))$/u;
export const PRESENT_RESOURCE_EVIDENCE_TIMEOUT_MS = 8_000;

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return;
  if (typeof signal.throwIfAborted === "function") signal.throwIfAborted();
  throw signal.reason ?? new DOMException("The evidence presentation was cancelled.", "AbortError");
}

function errorResult(code: string, message: string, limitations: string[]): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: { code, message, details: {} },
    limitations,
  };
}

function boundedTimeoutMilliseconds(value: number | undefined): number {
  const timeout = value ?? PRESENT_RESOURCE_EVIDENCE_TIMEOUT_MS;
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 60_000) {
    throw new TypeError("The evidence-presentation timeout must be an integer from 1 to 60,000 milliseconds.");
  }
  return timeout;
}

function presentationDeadline(
  callerSignal: AbortSignal | undefined,
  timeoutMilliseconds: number,
): {
  readonly signal: AbortSignal;
  readonly timedOut: () => boolean;
  readonly dispose: () => void;
} {
  const controller = new AbortController();
  let timeoutFired = false;
  const onCallerAbort = (): void => controller.abort(
    callerSignal?.reason ?? new DOMException("The evidence presentation was cancelled.", "AbortError"),
  );
  callerSignal?.addEventListener("abort", onCallerAbort, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timeoutFired = true;
    controller.abort(new DOMException("The evidence presentation timed out.", "TimeoutError"));
  }, timeoutMilliseconds);
  return {
    signal: controller.signal,
    timedOut: () => timeoutFired,
    dispose: () => {
      globalThis.clearTimeout(timeout);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    },
  };
}

function settleBeforeAbort<T>(pending: Promise<T>, signal: AbortSignal): Promise<T> {
  throwIfAborted(signal);
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const onAbort = (): void => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", onAbort);
      reject(signal.reason ?? new DOMException("The evidence presentation was cancelled.", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    pending.then(
      (value) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

/** Validate the exact closed input without normalising or echoing rejected data. */
export function parsePresentResourceEvidenceInput(value: unknown): PresentResourceEvidenceInput {
  if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new BeginnerPresentationContractError("The presentation input must be a plain data object.");
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string" || !PRESENT_INPUT_KEYS.has(key)) {
      throw new BeginnerPresentationContractError("The presentation input contains an unknown field.");
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) {
      throw new BeginnerPresentationContractError("The presentation input must contain enumerable data fields only.");
    }
  }
  const descriptor = Object.getOwnPropertyDescriptor(value, "recordId");
  const recordId = descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
  if (
    typeof recordId !== "string" || recordId.length < 3 || recordId.length > 160 ||
    /[\u0000-\u001F\u007F]/u.test(recordId) || !RECORD_ID.test(recordId)
  ) {
    throw new BeginnerPresentationContractError("recordId has an invalid format.");
  }
  return { recordId };
}

/**
 * Resolve and project one record without returning partial evidence.
 *
 * Resolution is deliberately sequential: provenance is requested only after
 * an exact successful record result supplies the canonical identifier.
 */
async function executeAcceptedResourceEvidence(
  runtime: PresentResourceEvidenceRuntime,
  acceptedInput: PresentResourceEvidenceInput,
  signal: AbortSignal,
  actionWasAccepted: boolean,
): Promise<PresentResourceEvidenceExecution> {
  const runtimeOptions = { signal };
  const recordResult = await runtime.getRecord(acceptedInput, runtimeOptions);
  throwIfAborted(signal);
  if (recordResult.ok !== true) return { result: recordResult, support: null };

  let canonicalRecordId: string;
  try {
    canonicalRecordId = canonicalRecordIdFromResult(recordResult);
  } catch (error) {
    if (!(error instanceof BeginnerPresentationContractError)) throw error;
    return {
      result: errorResult(
        "evidence_contract_mismatch",
        "The record result does not meet the Evidence answer contract.",
        ["No partial evidence presentation was returned.", "No substitute source was selected."],
      ),
      support: null,
    };
  }
  throwIfAborted(signal);

  const provenanceResult = await runtime.showProvenance({ recordId: canonicalRecordId }, runtimeOptions);
  throwIfAborted(signal);
  if (provenanceResult.ok !== true) return { result: provenanceResult, support: null };

  try {
    const evidence = await projectRecordEvidence(recordResult, provenanceResult, {
      actionWasAccepted,
    });
    const result: PresentResourceEvidenceSuccess = {
      schema: "govuk-webmcp.present-resource-evidence-result.v1",
      ok: true,
      evidence,
      evidenceDigest: await sha256Hex(canonicalJson(evidence)),
    };
    throwIfAborted(signal);
    return {
      result,
      support: { kind: "record", recordResult, provenanceResult },
    };
  } catch (error) {
    if (!(error instanceof BeginnerPresentationContractError)) throw error;
    return {
      result: errorResult(
        "evidence_contract_mismatch",
        "The record and provenance results do not describe the same verified evidence.",
        ["No partial evidence presentation was returned.", "No substitute source was selected."],
      ),
      support: null,
    };
  }
}

export async function executePresentResourceEvidence(
  runtime: PresentResourceEvidenceRuntime,
  input: unknown,
  options: {
    readonly signal?: AbortSignal;
    readonly actionWasAccepted?: boolean;
    /** Internal deterministic test seam; production calls use the fixed eight-second bound. */
    readonly timeoutMilliseconds?: number;
  } = {},
): Promise<PresentResourceEvidenceExecution> {
  throwIfAborted(options.signal);
  let acceptedInput: PresentResourceEvidenceInput;
  try {
    acceptedInput = parsePresentResourceEvidenceInput(input);
  } catch (error) {
    return {
      result: errorResult(
        "invalid_present_resource_evidence_request",
        error instanceof Error ? error.message : "The presentation input is invalid.",
        ["No action was executed.", "No source, storage or external provider was contacted."],
      ),
      support: null,
    };
  }

  const timeoutMilliseconds = boundedTimeoutMilliseconds(options.timeoutMilliseconds);
  const deadline = presentationDeadline(options.signal, timeoutMilliseconds);
  try {
    return await settleBeforeAbort(
      executeAcceptedResourceEvidence(
        runtime,
        acceptedInput,
        deadline.signal,
        options.actionWasAccepted !== false,
      ),
      deadline.signal,
    );
  } catch (error) {
    if (!deadline.timedOut()) throw error;
    return {
      result: errorResult(
        "evidence_presentation_timeout",
        `The evidence presentation exceeded its ${timeoutMilliseconds.toLocaleString("en-GB")}-millisecond time limit.`,
        ["The previous Evidence answer remains unchanged.", "No partial evidence presentation was returned."],
      ),
      support: null,
    };
  } finally {
    deadline.dispose();
  }
}
