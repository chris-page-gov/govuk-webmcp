# Changelog

All notable changes to this project are documented in this file. The format is
based on Keep a Changelog. The project does not yet use semantic versions.

## [Unreleased]

### Added

- Complete 80-record discovery catalogue: all 69 records from the locked
  `okf-govuk-content` source plus 11 reviewed official API, dataset and
  catalogue records.
- An 80-receipt provenance collection, source-lock manifest, minimal discovery
  profile and JSON Schemas for records, bundles, receipts and all tool inputs
  and outputs.
- Accessible human search, filter, record, related-record and provenance views
  with durable record hashes and downloadable structured parity output.
- Imperative, read-only `search_government_knowledge`, `get_resource_record`
  and `show_provenance` WebMCP registrations over the same execution layer as
  the human interface.
- Deterministic source, record, bundle, receipt and raw-file SHA-256 validation.
- Input, integrity, output-contract, injection, URL, storage, network, parity,
  direct-link and automated accessibility tests.
- MIT licence, source-specific attribution notice, Chris Page ownership
  assurance, private GitHub Actions validation and dependency update policy.

### Changed

- Expanded the first tiny fixture slice to the complete Must-range catalogue and
  three-tool prototype described by the research backlog.
- Updated project status, handover, architecture, tool catalogue and backlog
  tracking in lockstep with executable behaviour.
- Pinned the current official GitHub Actions v7 releases to immutable commit
  SHAs after the merged-main workflow reported its deprecated Node runtime.

### Fixed

- Direct `file://` opening now replaces the apparent permanent “Verifying…”
  state with instructions to run the application over HTTP.
- Added a 10-second catalogue startup timeout, a one-command local server and
  configurable Chrome/Edge browser-test channels and ports.

### Security

- Unknown, malformed or oversized input fails closed; credentials and unsafe or
  unadmitted URLs prevent registration; source strings remain inert untrusted
  text; the judging path stores no query and contacts no runtime provider.
- Tool registration occurs only after catalogue, receipt, source, record and
  bundle bindings validate.

### Governance

- Recorded Chris Page's ownership and resource assurance and applied MIT to the
  original project work while retaining item-level public-sector rights,
  attribution and access boundaries.
- Merged private pull request `#1` as
  `2f4b0761e80f3abc8c7bff9d5f1ee2db90afa677`; its exact post-merge `main`
  validation and build-artefact publication passed. Public deployment,
  competition registration and Devpost submission remain separate actions.
