# ADR-0000: Repository seed and competition boundary

- **Status:** superseded for publication and licence; baseline boundary retained
- **Date:** 29 August 2026

## Decision

Establish a dedicated local repository at `~/repos/govuk-webmcp` containing the
complete source-grounded research baseline and implementation contracts. The
repository is deliberately not connected to a public remote and has no final
open-source licence until ownership authority is established.

## Consequences

- Codex can build without modifying `gis-ai-go` or the OKF source repositories.
- The research pack remains byte-verifiable and auditable.
- Pre-existing assets and new competition work can be separated in history.
- Public deployment, licence selection and competition submission remain hard
  gates rather than implicit next steps.

## Supersession note

Chris Page's recorded ownership assurance and explicit public repository and
deployment instructions later resolved the publication and original-code
licence gates. The repository was published under MIT through protected pull
requests. The preserved research baseline, item-level source rights and the
separate competition registration/submission gates remain in force. See
ADR-0002.
