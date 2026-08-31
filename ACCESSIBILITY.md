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

## Historical Safari and VoiceOver observation

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

## Current federated-release Safari and VoiceOver observation

Version `0.3.0-rc.1` extends the same human journey to distinguish 80 reviewed
deep-evidence records from 58,652 searchable records in exactly four
federated OKF source snapshots containing 58,655 locked raw rows. Exactly three
standalone Land Registry legislation rows are quarantined. The collection
selector, source and searchable counts, quarantine status, source availability,
evidence tier, snapshot, producer-declared link role, destination hostname and
limitations must be available in text and must remain operable without WebMCP.
There is no standalone UK Legislation collection or `legislation.gov.uk` result
link; source-authored cross-reference strings do not become a selectable source
or result tier. The release is deployed from exact product commit
`b0bd634579a3abf82bdd1fc83ff688535e0db0bf` through Pages run `33356452048`.

On 31 August 2026, a manual operator completed the current nine-step journey in
Safari 26.5.2 with VoiceOver 10 on macOS 26.5.2. WebMCP was not used and the
Caption Panel was visible. Seven checkpoints passed; two completed with the
limitations below. The retained media is a hash-bound nine-frame, 27-second
screenshot sequence rather than a continuous recording. VoiceOver speech audio
was not captured. VoiceOver and the Caption Panel were turned off afterwards.

The guarded local final video includes that sequence. The 156.023-second MP4's
H.264 video, AAC audio and English caption streams passed technical review,
complete video/audio decode and normalised caption parity. That technical
review did not include audible human playback, does not turn the screenshot
sequence into a continuous recording and does not establish accessibility or
WCAG conformance. Owner playback and caption review remain open before
publication.

## Known limitations

- The current manual journey did not retain a heading-rotor selection and did
  not prove automatic spoken live-status wording. These are the 2 recorded
  limitations; the other 7 checkpoints passed.
- The nine-step manual journey did not exercise a partial-source failure.
  Deterministic and browser coverage of that state remains separate from the
  manual VoiceOver observation.
- Nine Low security remediations have focused test evidence where recorded.
  The current Chrome and Microsoft Edge suites each pass 30 of 30, and the full
  prepared unit command passes 194 of 194. Fresh immutable exact-range scan
  `040ad945-3723-4aef-9c03-1bb552630deb` completed 55 of 55 review items with
  zero reportable findings. Automated and manual observations remain bounded to
  their named environments and journeys.
- The human live region distinguishes rejected input, a
  `federated_runtime_busy` response and other failure rather than presenting
  each as source unavailable. Focused regressions pass 11 of 11.
- The current page title and level-one heading were visible while VoiceOver was
  active, but a heading-rotor selection was not retained in the nine-frame
  sequence.
- The current visible status read `797 matching records; 8 shown.`, but the
  Caption Panel showed `Filter results, collapsed, summary` rather than that
  status. The automatic spoken-status wording was therefore not proven.
- The manual observation covers one assistive-technology environment and does
  not claim WCAG conformance or production-service accessibility.

If you find an accessibility problem, open a GitHub issue without personal or
sensitive information. State the browser, assistive technology and affected
journey.
