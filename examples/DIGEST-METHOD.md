# Illustrative digest method

## Status of these examples

`catalogue.example.json` and `evidence-receipt-example.json` are frozen
illustrations from the research seed created on 29 August 2026. They document
the digest design considered at that point; they are not fixtures for the
current `0.2.0-rc.1` contracts and do not validate against the current closed
schemas under `schemas/`.

Their bytes are deliberately preserved as baseline evidence. Current release
contract examples are the generated, source-locked artefacts under `app/data/`.
If a current standalone example is needed, add a separately named and versioned
file instead of rewriting these historical illustrations.

The example hashes are reproducible rather than decorative. They use a deliberately
simple project method called `project-json-c14n-v1`:

1. serialise the declared JSON value as UTF-8;
2. sort every object key lexicographically;
3. remove insignificant whitespace;
4. preserve array order; and
5. calculate SHA-256 over those bytes.

This is **not** JSON-LD RDF Dataset Canonicalization and it must not be represented
as a publisher signature or government attestation. A production profile should
pin a standard canonicalisation method and its version.

Example values:

- source digest: `2d11117472231f7c79609e053001cdf7f53c5b910e83c917cce5cf58ed436f99`
- record digest: `5429d7458d32b32ea266c04743673218cd21959634c8077f989e7e8d864363db`
- bundle digest: `2d9dd82a16750413125a44d66cdde31fa4a4b57249dbd43f90e62e8dd72196be`
- raw catalogue file digest: `4f7689d3df8ea9d50516daf3f79a313f5636de32cccb614f4da4f971cb98f95b`
- raw evidence receipt file digest: `2f8282aa98b95de7a6759506f702bd5843663766c1deb7485d22411f5ea09140`

The record digest covers the JSON-LD example after `okfx:sourceDigest` is added and
before `okfx:recordDigest`, `okfx:bundleDigest` and `okfx:evidenceReceipt` are
added. The bundle digest covers:

```json
{
  "schema": "trusted-govuk-discovery.bundle-root.v1",
  "recordDigests": [
    "5429d7458d32b32ea266c04743673218cd21959634c8077f989e7e8d864363db"
  ]
}
```
