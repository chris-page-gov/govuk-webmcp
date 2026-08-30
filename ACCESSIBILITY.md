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

## Known limitations

A manual screen reader observation has not been completed. The prototype does
not claim WCAG conformance or production-service accessibility.

If you find an accessibility problem, open a GitHub issue without personal or
sensitive information. State the browser, assistive technology and affected
journey.
