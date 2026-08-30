# Accessibility test log — 30 August 2026

## Evidence boundary

This record describes the current uncommitted candidate in the working tree at
baseline `fd2b7ae3176532e96b78fa31320e7fe27ec6cf51`. It is pre-commit evidence,
not evidence for a final commit, CI run or deployed site.

The checks below provide useful automated and manual observations. They are not
an accessibility conformance assessment. No manual screen-reader observation
was performed and the project makes no WCAG conformance claim.

## Deterministic and browser results

The following commands completed successfully against the current candidate:

```text
npm run test:unit
```

Result: 46 of 46 unit and contract tests passed.

```text
PLAYWRIGHT_PORT=4202 npx playwright test
```

Result: 19 of 19 Playwright tests passed in installed Google Chrome.

```text
PLAYWRIGHT_PORT=4203 npm run test:browser:edge
```

Result: the same 19 of 19 Playwright tests passed in installed Microsoft Edge.

The expanded browser journey exercised the evidence-first answer, Evidence
Trace, claim comparison, catalogue search, record view and provenance view.
The axe scan included WCAG 2.2 AA tags and returned zero serious or critical
violations in that tested state.

## Interaction and presentation observations

The browser suite passed the following candidate-specific checks:

- keyboard use of the skip link, Evidence Trace controls, search and claim
  comparison;
- focus restoration after closing the comparison and deterministic state under
  browser back and forward navigation;
- a 320 CSS-pixel-wide viewport with no uncontained horizontal overflow, while
  wide data tables remain inside intentionally scrollable containers;
- visible evidence and search content with forced colours active; and
- the same journey with reduced motion active.

A headed Playwright session was also inspected manually. Its snapshot was
compared before and after selecting two claims and clicking **Compare 2 selected
claims**; the resulting comparison matched the expected click-driven state.
This was a visual and interaction check, not an assistive-technology test.

Two retained screenshots were visually inspected:

- `evidence-first-overview-2026-08-30.png` (1,200 × 818 pixels; SHA-256
  `4be32f70aa28913460ce3012db64fe04f91a725b9ed4bd146417076408a7e3a7`)
  shows the independent-prototype label, page heading, candidate summary and
  start of the worked evidence-first answer without visible overlap or clipping;
- `evidence-foundation-comparison-2026-08-30.png` (864 × 975 pixels; SHA-256
  `b378dba916f6ace764ad71ee9a590c9756809a0161478a23cd97bfb8134838c7`)
  shows the two-claim comparison with readable facet headings, wrapped content,
  limitations and no visible overlap or clipping.

Screenshots cannot demonstrate keyboard operability, accessible names,
programmatic semantics or screen-reader output. Those claims rely only on
the checks explicitly described above.

## Remaining accessibility gate

Perform and record a manual screen-reader journey against the final exact
candidate. Then pair this working-tree record with the final commit identifier,
exact-commit CI results and live-site verification. Until then, this log must
not be presented as release-level or deployed accessibility evidence.
