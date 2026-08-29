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
- Public security, privacy and accessibility documents, a CycloneDX SBOM and a
  dated link-health report covering 161 unique admitted official URLs.
- Canonical report, findings, coverage and manifest from the complete
  no-findings security audit of pre-release `main` commit `260d68f`.
- A SHA-pinned, manually dispatched GitHub Pages workflow that retests and
  publishes one exact artefact with machine-readable deployment metadata.
- Keyboard, 320-pixel reflow, forced-colour and reduced-motion browser
  acceptance alongside the existing axe smoke test.

### Changed

- Expanded the first tiny fixture slice to the complete Must-range catalogue and
  three-tool prototype described by the research backlog.
- Updated project status, handover, architecture, tool catalogue and backlog
  tracking in lockstep with executable behaviour.
- Pinned the current official GitHub Actions v7 releases to immutable commit
  SHAs after the merged-main workflow reported its deprecated Node runtime.
- Advanced the package release candidate to `0.1.0-rc.1` and documented that
  `private: true` prevents accidental npm publication rather than repository
  access.

### Fixed

- Direct `file://` opening now replaces the apparent permanent “Verifying…”
  state with instructions to run the application over HTTP.
- Added a 10-second catalogue startup timeout, a one-command local server and
  configurable Chrome/Edge browser-test channels and ports.
- Corrected the tool catalogue to match fail-closed startup behaviour and the
  executable credential-free HTTPS official-host admission rule.
- Corrected the architecture wording to distinguish separately reviewed source
  acquisition from the offline deterministic build.

### Security

- Unknown, malformed or oversized input fails closed; credentials and unsafe or
  unadmitted URLs prevent registration; source strings remain inert untrusted
  text; the judging path stores no query and contacts no runtime provider.
- Tool registration occurs only after catalogue, receipt, source, record and
  bundle bindings validate.
- Restricted Pages publication to a manual exact-`main` dispatch SHA; a focused
  security review had found that the initial workflow could deploy an unmerged
  branch.
- Sanitised third-party author, contributor and maintainer metadata from the
  public SBOM while retaining component, version, integrity and dependency
  evidence.

### Governance

- Published the repository and exact-commit GitHub Pages artefact after
  protected pull request `#7`; recorded signed-out repository, licence, HTTPS,
  digest and controlled live-browser evidence.
- Applied and read back strict `validate` status, pull-request, administrator,
  linear-history, conversation-resolution, force-push and deletion controls on
  `main`, plus protected-branch-only Pages deployment.
- Kept ChatGPT-host WebMCP calls open because the controlled in-app browser
  verified the human fallback but did not expose `document.modelContext`.
- Recorded Chris Page's ownership and resource assurance and applied MIT to the
  original project work while retaining item-level public-sector rights,
  attribution and access boundaries.
- Merged private pull request `#1` as
  `2f4b0761e80f3abc8c7bff9d5f1ee2db90afa677`; its exact post-merge `main`
  validation and build-artefact publication passed. Public deployment,
  competition registration and Devpost submission remain separate actions.
- Merged private pull request `#5` as
  `3a2d7faac43ec13e785a1cb694ed175c34d45553`; its exact post-merge `main`
  validation and build-artefact publication also passed.
- Rechecked the live competition rules on 29 August 2026: a public source
  repository with an open-source licence and a working live URL are required.
  Chris Page authorised those release actions; registration and submission
  remain unperformed governance gates.
- Reconciled the ownership and outside-interest risk rows with Chris Page's
  recorded assurance while retaining submission-time prize and publicity
  checks.
