# Accessibility statement

This statement applies to **Trusted government knowledge discovery**, an
independent experimental prototype.

The human interface remains usable without WebMCP. Its primary evidence view is
an analytical index. The visual Evidence Trace is a progressive explanation of
the same deterministic data, not the only way to understand it.

The interface uses semantic headings, labelled controls, keyboard-operable
buttons and links, a skip link, visible focus, status messages and structured
tables. Opening and closing records and comparisons manage and restore focus.
Bounded URL-fragment routes support direct views and browser back and forward
history. Evidence paths, selection states, assertion status and limitations use
text labels; meaning is not conveyed by colour alone.

## Automated testing

The browser acceptance suite includes:

- an automated axe smoke test that includes WCAG 2.2 AA-tagged rules and fails
  on serious or critical violations in the tested expanded journey;
- keyboard operation, skip-link focus, record and comparison focus restoration,
  and browser back and forward history;
- responsive reflow at a 320-pixel viewport, with wide evidence tables kept in
  labelled horizontal scroll regions; and
- forced colours and reduced motion preferences while evidence exploration and
  search remain usable.

Automated testing covers only the tested pages, states and rules. It cannot
establish WCAG 2.2 conformance.

## Manual Safari and VoiceOver observation

On 30 August 2026, a manual operator completed the nine-step human journey in
Safari 26.5.2 with VoiceOver 10 on macOS 26.5.2. WebMCP was not used. VoiceOver's
Caption Panel was enabled for the observation; both the Caption Panel and
VoiceOver were turned off afterwards.

The observation covered the page title and headings, skip link, analytical
index controls, selected foundation, comparison table, live search status,
record and provenance view, authoritative source link and focus restoration.
The authoritative source link and record/comparison focus restoration checks
passed. Seven checks passed without a retained limitation; two completed with
the limitations below. The retained media is a hash-bound nine-frame screenshot
sequence labelled as not a continuous recording. VoiceOver speech audio was not
captured.

## In-progress federated-discovery candidate

Version `0.3.0-rc.1` is extending the same human journey to distinguish 80
reviewed deep-evidence records from 58,652 searchable records in exactly four
federated OKF source snapshots containing 58,655 locked raw rows. Exactly three
standalone Land Registry legislation rows are quarantined. The collection
selector, source and searchable counts, quarantine status, source availability,
evidence tier, snapshot, producer-declared link role, destination hostname and
limitations must be available in text and must remain operable without WebMCP.
There is no standalone UK Legislation collection or `legislation.gov.uk` result
link; source-authored cross-reference strings do not become a selectable source
or result tier.

Acceptance gate K requires keyboard operation, 320 CSS-pixel reflow, forced
colours, reduced motion, automated axe checks and a focused manual screen-
reader journey through collection status, search, record, provenance, source
link and a partial-source failure. This section records the intended boundary,
not a completed test. The earlier Safari and VoiceOver observation applies only
to the pre-federation page and cannot be reused as proof of the expanded
candidate or of WCAG conformance.

## Known limitations

- The federated interface and its partial-source status have not yet completed
  gate K against the exact `0.3.0-rc.1` release candidate.
- Eight Low security remediations have focused test evidence where recorded.
  The current Chrome and Microsoft Edge suites each pass 30 of 30, and the full
  prepared unit command passes 190 of 190. The immutable post-fix security rescan remains
  pending.
- The human live region distinguishes rejected input, a
  `federated_runtime_busy` response and other failure rather than presenting
  each as source unavailable. Focused regressions pass 11 of 11.
- The page heading hierarchy was verified through Safari accessibility data,
  but a heading-rotor selection was not retained in the nine-frame sequence.
- The live status text changed to `9 matching records; 8 shown.` while focus
  remained on Search, but the Caption Panel showed the Search button instruction
  rather than the live-region result count. The automatic spoken-status wording
  was therefore not proven.
- The manual observation covers one assistive-technology environment and does
  not claim WCAG conformance or production-service accessibility.

If you find an accessibility problem, open a GitHub issue without personal or
sensitive information. State the browser, assistive technology and affected
journey.
