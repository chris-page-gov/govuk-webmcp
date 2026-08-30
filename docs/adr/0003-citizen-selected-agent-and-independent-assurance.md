# ADR-0003: Citizen-selected agent and independent assurance

- **Status:** accepted for the unreleased host-compatibility follow-up
- **Date:** 30 August 2026

## Context

A public body does not need to operate a general-purpose assistant merely to
make authoritative information usable by AI. The page can expose small,
inspectable actions over evidence it already publishes, while a citizen-selected
agent uses permitted context to decide which action is relevant. This could
avoid duplicating model infrastructure across public services and avoid asking a
service for unrelated personal context. Neither benefit has yet been measured.

Page registration, browser execution and model tool selection are separate
technical layers. Instrumented application tests or successful discovery in one
host do not prove that another host can execute a callback or that a model will
select the correct tool. The public `v0.2.0-rc.1` release demonstrated this
distinction: Chrome DevTools MCP 1.8.0 discovered all five tools but exposed a
callback error when it omitted the optional execution-options object.

## Decision

- Keep the government-facing application static and model-free. It publishes
  bounded, source-linked page tools and does not request an identity, profile,
  location history or unrelated conversation context.
- Let a citizen-selected host and model decide which page tool to call. Send
  only the smallest action-specific input admitted by the closed schema.
- Do not describe a personal agent as private by default. A remote provider may
  receive prompts, tool metadata, inputs and results. Record model location and
  provider class in every model-backed receipt.
- Prefer a correctly configured local tool-calling model for the first
  independent-agent demonstration, while retaining the ordinary static-host and
  local-logging boundaries.
- Accept both `execute(input)` and `execute(input, options)` WebMCP host calls.
  Forward cancellation only when a host supplies an abort signal.
- Use four complementary assurance layers: native browser DevTools, Microsoft
  WebMCP Explorer, Chrome DevTools MCP and pinned `webmcp-evals` smoke/browser
  evaluation. Keep model-free execution evidence separate from model-selection
  evidence.
- Run every independent harness in a fresh profile against synthetic public
  data. Keep credentials and raw reports out of version control until reviewed;
  checksum any retained evidence against the exact deployed commit.

## Consequences

The page remains a low-complexity progressive enhancement with a complete human
journey and no model-provider runtime dependency. A personal agent can
contextualise the journey without the page accepting general personal context,
but the user's chosen host and provider remain separate data-processing and
cost boundaries.

The submission can claim a testable architectural pattern, not a demonstrated
public-sector saving, guaranteed privacy or improved accuracy. Native-panel,
Explorer and fixed-model evidence remain required before broad cross-host or
agent-selection claims. The compatibility correction must be integrated,
deployed and recaptured before it becomes public-release evidence.
