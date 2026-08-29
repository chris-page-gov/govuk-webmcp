# Security policy

## Supported version

Only the code on `main` and the latest published release candidate are
supported. This is a bounded experimental prototype, not a production service.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for this repository. Include the affected commit,
browser, reproduction steps, impact and any relevant console or network output.
Do not include credentials, personal data or unpublished public-sector
information.

The maintainer will acknowledge a report as soon as practical, assess it
against the static read-only deployment boundary and coordinate a safe fix or
documented disposition. There is no bug bounty or guaranteed response time.

## Security boundary

The published application is static and same-origin. It stores no query,
creates no account, uses no analytics or cookies and makes no runtime request
to a government API. WebMCP tools are read-only and register only after the
catalogue, receipts and digest bindings validate. Source-derived text remains
untrusted data.

Catalogue integrity does not prove government endorsement, current accuracy,
access authority or an open licence. Those limitations remain visible in each
record and receipt.
