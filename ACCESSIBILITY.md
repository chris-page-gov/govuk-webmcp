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

## Known limitations

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
