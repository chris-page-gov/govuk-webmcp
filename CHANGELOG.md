# Changelog

All notable changes to this project are documented in this file. The format is
based on Keep a Changelog, and the project does not yet use semantic versions
because publication and licensing remain governance gates.

## [Unreleased]

### Added

- First local static vertical slice with an accessible human search over a tiny
  same-origin GOV.UK metadata fixture.
- Imperative, read-only `search_government_knowledge` WebMCP registration using
  the same deterministic result as the page.
- Deterministic fixture generation with raw-file, record and bundle SHA-256
  validation before search or tool registration.
- Visible authoritative source, access, licence, assertion and limitation
  evidence.
- Unit tests for input and integrity boundaries and controlled Chromium tests
  for accessibility, parity, inert source text, no storage and no external
  runtime requests.
- ADR-0001 and Must-backlog implementation tracking.
- Independent local favicon with browser assertions for clean HTTP responses and
  console output.

### Changed

- Agent instructions now require documentation, changelog, status, handover,
  backlog tracking and tests to remain in lockstep with affected code.

### Security

- Unknown or oversized input fails closed, authoritative links are constrained
  to credential-free GOV.UK HTTPS URLs, and source strings are rendered as text.

### Governance

- No remote, publication, deployment, final licence, registration or submission
  was created. Existing governance gates remain unchanged.
