# Guided-build technical specification

## Canonical specification

The complete accepted specification is
`docs/product/beginner-interface-specification.md`. Architecture and assurance
constraints are also binding in `AGENTS.md` and
`docs/competition/codex-build-brief.md`.

## Implementation boundaries

- static TypeScript and same-origin packaged data;
- imperative `document.modelContext.registerTool` registration only after all
  artefacts validate;
- closed schemas plus executable validation at least as strict as those
  schemas;
- one pure presentation projection shared by the human and WebMCP paths;
- transactional latest-started-wins presentation updates;
- no URL, history, focus or scroll mutation from a WebMCP call;
- text-only rendering for all source-derived strings;
- compact sticky native-link navigation, not an ARIA tab widget;
- complete offline corpus projection audit plus representative browser tests;
- lockstep tests, status, handover, implementation plan, backlog and changelog.

## Verification strategy

Verify the cheapest contracts first: schema/validator parity, projection and
route unit tests, generated-data validation, full-corpus audit, deterministic
double build, Chrome and Edge, accessibility/security checks, exact protected
main, exact Pages bytes, live six-tool calls, host observations and finally
release media.
