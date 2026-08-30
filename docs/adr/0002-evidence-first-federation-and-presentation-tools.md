# ADR-0002: Evidence-first federation and presentation tools

- **Status:** accepted for the `0.2.0-rc.1` candidate
- **Date:** 30 August 2026

## Context

The first public release proves deterministic search, exact record and
provenance over 80 reviewed records. The next stage must help a non-specialist
inspect the foundations of an answer without implying that one opaque score can
settle authority, freshness, integrity, access, rights and coverage. Related
OKF repositories describe a much larger evidence estate, but they have
different source versions, rights, populations and assurance states.

## Decision

- Make an analytical index the primary answer view and use an interactive,
  text-labelled Evidence Trace as a progressive explanation of the same data.
- Publish one bounded, digest-bound worked answer derived deterministically
  from three existing catalogue records. Keep generated narrative outside
  canonical source metadata.
- Expose authority, assertion, verification, freshness, integrity, access,
  rights and coverage separately. Do not calculate a combined trust score.
- Admit corpus descriptions through an exact four-lock build boundary. Only the
  two reviewed collections that already account for all 80 catalogue records
  are searchable. Eight other entries remain non-searchable descriptors or
  gated candidates and contribute no payload.
- Record producer-native `sourceOkfCore` separately from this project's
  descriptive `targetOkfCore: "0.2"` mapping. Do not turn target mapping into a
  native-conformance or payload-admission claim.
- Retain the three read-only catalogue query tools. Add
  `explore_answer_foundations` and `compare_evidence_foundations` with a
  reversible in-memory page-presentation effect and therefore
  `readOnlyHint: false`.
- Route human and WebMCP interactions through one cancellable deterministic
  action controller. Register tools only after catalogue, receipt, Evidence
  Trace and federation validation succeeds.
- Keep input, URL-fragment and result sizes bounded. Do not serialise rejected
  caller input for diagnostics.

## Consequences

The page can show evidence before answers and let a person or page-scoped agent
select the same deterministic view. A missing WebMCP API or a non-settling
registration does not hold the human interface unavailable.

The estate table describes scope and admission decisions; it is not a federated
query engine. The two presentation tools change no catalogue, storage, network
or external state. The prototype remains static, same-origin and independent.
It is not a durable MCP gateway, provider integration, service-operation layer,
official GOV.UK service, eligibility decision or comprehensive knowledge base.

Source locks establish reproducible local admission, not publisher signatures
or current source accuracy. Manual screen-reader and supported-host WebMCP
observations remain separate evidence requirements.
