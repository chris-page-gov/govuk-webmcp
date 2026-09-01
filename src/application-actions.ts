import type { JsonObject } from "./contracts.js";
import type { EvidenceRuntime } from "./evidence-runtime.js";
import { canonicalJson, sha256Hex } from "./integrity.js";
import {
  executePresentResourceEvidence,
  type RecordPresentationSupport,
} from "./present-resource-evidence.js";

export type KnowledgeActionName =
  | "search_government_knowledge"
  | "get_resource_record"
  | "show_provenance"
  | "explore_answer_foundations"
  | "compare_evidence_foundations"
  | "present_resource_evidence";

export interface ActionPresentation {
  action: KnowledgeActionName;
  origin: "human" | "webmcp" | "restore";
  inputDigest: string | null;
  resultDigest: string;
  result: JsonObject;
  /** Validated source results for the Technical review renderer; never returned by a page tool. */
  support: RecordPresentationSupport | null;
  /**
   * Internal liveness check for asynchronous render work. A later-started
   * Evidence-answer action makes this return false before that later action
   * has to finish.
   */
  isCurrentEvidencePresentation: () => boolean;
}

export interface ActionOptions {
  origin: "human" | "webmcp" | "restore";
  present: boolean;
  /** False only when rebuilding presentation from a deep link or history entry. */
  actionWasAccepted?: boolean;
  /** Internal acknowledgement that this request, rather than a stale request, committed its presentation. */
  onPresentationCommit?: () => void;
  signal?: AbortSignal;
}

interface PureKnowledgeRuntime {
  search(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  getRecord(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  showProvenance(input: unknown, options?: { readonly signal?: AbortSignal }): Promise<JsonObject>;
  evidence: EvidenceRuntime;
}

export interface KnowledgeActionController {
  run(action: KnowledgeActionName, input: unknown, options: ActionOptions): Promise<JsonObject>;
}

function changesEvidencePresentation(action: KnowledgeActionName): boolean {
  return action === "explore_answer_foundations" ||
    action === "compare_evidence_foundations" ||
    action === "present_resource_evidence";
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return;
  if (typeof signal.throwIfAborted === "function") signal.throwIfAborted();
  throw signal.reason ?? new DOMException("The tool call was cancelled.", "AbortError");
}

function normaliseForJsonDigest(value: unknown): unknown {
  const serialised = JSON.stringify(value);
  return serialised === undefined ? null : JSON.parse(serialised) as unknown;
}

const ROOT_INPUT_KEY_LIMIT = 16;
const ROOT_INPUT_KEY_LENGTH_LIMIT = 128;

function inputBudgetError(): JsonObject {
  return {
    schema: "trusted-govuk-discovery.error.v1",
    ok: false,
    error: {
      code: "input_budget_exceeded",
      message: "The input exceeds the safe processing budget.",
      details: {},
    },
    limitations: [
      "No action was executed.",
      "No source, storage or external provider was contacted.",
    ],
  };
}

/**
 * Apply a cheap boundary before action-specific validation. This deliberately
 * inspects root metadata only: rejected nested values must never be traversed
 * merely to produce diagnostics.
 */
function exceedsRootInputBudget(value: unknown): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    let keys = 0;
    for (const key in value) {
      if (!Object.hasOwn(value, key)) continue;
      keys += 1;
      if (keys > ROOT_INPUT_KEY_LIMIT || key.length > ROOT_INPUT_KEY_LENGTH_LIMIT) return true;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, "value")) return true;
    }
    return false;
  } catch {
    return true;
  }
}

function admittedDiagnosticInput(value: unknown): JsonObject | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return undefined;
    const keys = Reflect.ownKeys(value);
    if (keys.length > ROOT_INPUT_KEY_LIMIT) return undefined;
    const copy: JsonObject = {};
    for (const key of keys) {
      if (typeof key !== "string" || key.length > ROOT_INPUT_KEY_LENGTH_LIMIT) return undefined;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, "value")) return undefined;
      const item = descriptor.value as unknown;
      if (Array.isArray(item)) {
        if (item.length > 8 || Reflect.ownKeys(item).some((candidate) =>
          candidate !== "length" &&
          (typeof candidate !== "string" || !/^\d+$/u.test(candidate)))) return undefined;
        const values: Array<string | number | boolean | null> = [];
        for (let index = 0; index < item.length; index += 1) {
          const itemDescriptor = Object.getOwnPropertyDescriptor(item, String(index));
          if (!itemDescriptor?.enumerable || !Object.hasOwn(itemDescriptor, "value")) return undefined;
          const entry = itemDescriptor.value as unknown;
          if (entry !== null && !["string", "number", "boolean"].includes(typeof entry)) return undefined;
          values.push(entry as string | number | boolean | null);
        }
        copy[key] = values;
      } else if (item === null || ["string", "number", "boolean"].includes(typeof item)) {
        copy[key] = item;
      } else {
        return undefined;
      }
    }
    return copy;
  } catch {
    return undefined;
  }
}

export function createKnowledgeActionController(
  runtime: PureKnowledgeRuntime,
  commitPresentation?: (presentation: ActionPresentation) => void,
): KnowledgeActionController {
  let latestEvidencePresentation = 0;
  return {
    async run(action, input, options): Promise<JsonObject> {
      throwIfAborted(options.signal);
      const evidencePresentationSequence = options.present && changesEvidencePresentation(action)
        ? ++latestEvidencePresentation
        : null;
      const isCurrentEvidencePresentation = (): boolean =>
        evidencePresentationSequence === null || evidencePresentationSequence === latestEvidencePresentation;
      const diagnosticInput = admittedDiagnosticInput(input);
      let result: JsonObject;
      let support: RecordPresentationSupport | null = null;
      if (exceedsRootInputBudget(input)) {
        result = inputBudgetError();
      } else {
        const runtimeOptions = options.signal ? { signal: options.signal } : {};
        switch (action) {
          case "search_government_knowledge":
            result = await runtime.search(input, runtimeOptions);
            break;
          case "get_resource_record":
            result = await runtime.getRecord(input, runtimeOptions);
            break;
          case "show_provenance":
            result = await runtime.showProvenance(input, runtimeOptions);
            break;
          case "explore_answer_foundations":
            result = await runtime.evidence.explore(input);
            break;
          case "compare_evidence_foundations":
            result = await runtime.evidence.compare(input);
            break;
          case "present_resource_evidence": {
            const execution = await executePresentResourceEvidence(runtime, input, {
              ...runtimeOptions,
              ...(options.actionWasAccepted === undefined
                ? {}
                : { actionWasAccepted: options.actionWasAccepted }),
            });
            result = execution.result;
            support = execution.support;
            break;
          }
        }
      }
      throwIfAborted(options.signal);
      if (options.present) {
        const inputDigest = result.ok === true && diagnosticInput !== undefined
          ? await sha256Hex(canonicalJson(diagnosticInput))
          : null;
        const resultDigest = await sha256Hex(canonicalJson(normaliseForJsonDigest(result)));
        throwIfAborted(options.signal);
        if (isCurrentEvidencePresentation()) {
          if (commitPresentation) {
            commitPresentation({
              action,
              origin: options.origin,
              inputDigest,
              resultDigest,
              result,
              support,
              isCurrentEvidencePresentation,
            });
            options.onPresentationCommit?.();
          }
        }
      }
      return result;
    },
  };
}
