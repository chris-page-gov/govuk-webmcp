# Appendix E — commit and release evidence strategy

This appendix preserves the 29 August 2026 research-baseline proposal. The JSON
below is a template, not current release evidence, and its `TO_BE_SET` values
must not be cited as completed. The exact-release workflow will publish a dated
machine-readable provenance record under `docs/competition/evidence/` only
after the protected merge supplies the commit, tag, site and artefact digests.

## Preserved machine-readable `challenge-provenance.json` template

```json
{
  "schema": "trusted-govuk-discovery.challenge-provenance.v1",
  "challenge": {
    "start": "2026-08-25T18:00:00Z",
    "deadline": "2026-09-03T20:00:00Z",
    "rulesUrl": "https://webmcp.devpost.com/rules"
  },
  "preExisting": [
    {
      "repository": "chris-page-gov/gis-ai-go",
      "commit": "fe122579dc3aba07387c0c201ce5539b50a40108",
      "timestamp": "2026-08-25T16:47:33Z"
    },
    {
      "repository": "chris-page-gov/okf-govuk-content",
      "commit": "94f5020cb2c7512a79c2353ee48743ad733a132c"
    },
    {
      "repository": "chris-page-gov/okf-uk-government-apis",
      "commit": "55c7e67947dfd86e291ca987e354429c36b453d9"
    }
  ],
  "postStartEvidence": [
    {
      "repository": "chris-page-gov/gis-ai-go",
      "commit": "8c4c3e0df7b19926507b541fc11077d2912b94ee",
      "timestamp": "2026-08-29T10:00:00Z",
      "purpose": "static WebMCP explorer candidate"
    }
  ],
  "submission": {
    "repository": "TO_BE_SET",
    "commit": "TO_BE_SET",
    "tag": "webmcp-challenge-2026-submission",
    "siteDigest": "TO_BE_SET",
    "bundleDigest": "TO_BE_SET"
  }
}
```

## Human evidence

- one-page baseline/new-work table;
- permanent compare links;
- screenshots of tool registration and calls;
- exact build and test commands;
- final release notes organised by judging criterion;
- signed checklist naming reviewer and date;
- Devpost receipt and immutable copies of submitted text.
