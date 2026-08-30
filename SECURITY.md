# Security policy

## Supported boundary

This is a bounded experimental prototype, not a production service. Security
claims apply only to the exact code and generated artefacts that were tested.
Repository documentation is not proof that the same revision is merged,
deployed or available through a particular browser host.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for this repository. Include the affected commit,
browser, reproduction steps, impact and any relevant console or network output.
Do not include credentials, personal data or unpublished public-sector
information.

The maintainer will acknowledge a report as soon as practical, assess it
against the static deployment boundary and coordinate a safe fix or documented
disposition. There is no bug bounty or guaranteed response time.

## Application security boundary

The application is static and loads only packaged, same-origin data. It makes no
runtime provider API call, creates no account and uses no cookies, analytics,
local storage, session storage or persistent server-side application storage.
Following an authoritative link leaves this boundary.

Four artefact families gate all WebMCP registration: the 80-record catalogue,
80 evidence receipts, one Evidence Trace collection and the 10-entry federation
manifest. Each raw file must match its SHA-256 sidecar. Schemas, internal
digests, record-to-receipt bindings, catalogue-to-trace bindings and
catalogue-to-federation bindings must also pass. A failure in any family leaves
a human-readable failure state and prevents every tool registration; no partial
tool set is accepted.

The packaged evidence estate is derived from four exact source locks. Integrity
checks bind the packaged bytes and declared relationships. They are not
signatures from a government body and do not prove official endorsement,
current accuracy, access authority or an open licence.

Source-derived titles, descriptions and limitations remain untrusted data.
They are rendered as text, and admitted links must be credential-free HTTPS
URLs. Catalogue and Evidence Trace links use the bounded official-host
allowlist. Federation repository links use a separate, exact GitHub repository
allowlist under `chris-page-gov`; the application does not fetch or admit
producer payload from those repositories. WebMCP output is also labelled as
untrusted content.

## Action and input boundary

The human interface and all five WebMCP tools use one deterministic action
controller. Three tools only query verified packaged data and declare
`readOnlyHint: true`. The two evidence exploration tools change reversible,
transient presentation state and therefore declare `readOnlyHint: false`; they
do not change sources, browser storage, the network or external state.

Tool schemas are closed and bounded, and executable code revalidates every
input. Before dispatch, the shared input budget accepts at most 16 plain root
keys, each at most 128 characters, without walking rejected nested values or
executing accessors. Root-key enumeration is still proportional to the root
object presented by the caller. Only accepted, bounded diagnostic inputs are
hashed. Rejected, cyclic, accessor-backed or over-budget input receives no
input digest. Result diagnostics bind the serialised deterministic result
instead.

Human URL-fragment routing is also bounded. Raw fragments over 1,024 characters
are discarded, comparison values are length-limited, and comparison accepts
only two to four exact claim identifiers. Malformed routes fail closed to the
default evidence view.

## WebMCP boundary

The five tools are registered imperatively into the current page when a
compatible secure host exposes `document.modelContext`. This page-scoped
integration is not an independently callable or durable MCP gateway. It has no
provider credentials, persistent session, service operation or durable tool
receipt, and it does not prove that a particular browser or agent host has
discovered or called the tools.
