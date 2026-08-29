# Accessibility test log — 29 August 2026

## Candidate and environments

- Candidate branch: `release/public-candidate`
- Catalogue: 80 records and 80 receipts
- Google Chrome 152.0.7977.64 on macOS
- Microsoft Edge 152.0.4191.53 on macOS

## Checks completed

The same nine-test browser suite passed in Chrome and Edge. It confirmed:

- labelled search and filter controls and keyboard submission;
- human search, exact record and provenance without WebMCP;
- visible status text when WebMCP is unavailable;
- direct-file startup guidance instead of an indefinite loading state;
- a 320 CSS-pixel viewport without horizontal document overflow;
- visible content under forced-colour and reduced-motion emulation;
- no serious or critical axe findings against WCAG 2.1 A/AA rules in the
  tested search, result, record and provenance journey;
- no query storage, cookies or cross-origin runtime requests; and
- identical structured page and tool results in the instrumented WebMCP test.

Commands:

```text
PLAYWRIGHT_PORT=4176 npm run test:browser
PLAYWRIGHT_PORT=4177 npm run test:browser:edge
```

## Limitation

No manual screen-reader observation was performed. Browser automation and axe
do not establish WCAG conformance, so the project makes no conformance claim.
