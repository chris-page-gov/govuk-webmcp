# Illustrative digest method

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
