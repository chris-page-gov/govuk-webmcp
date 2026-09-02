# Accessibility statement

This statement applies to **Trusted government knowledge discovery**, an
independent experimental prototype.

The released human interface remains usable without WebMCP. Its primary
evidence view is an analytical index. The visual Evidence Trace is a
progressive explanation of the same deterministic data, not the only way to
understand it.

The interface uses semantic headings, labelled controls, keyboard-operable
buttons and links, a skip link, visible focus, status messages and structured
tables. Opening and closing records and comparisons manage and restore focus.
Bounded URL-fragment routes support direct views and browser back and forward
history. Evidence paths, selection states, assertion status and limitations use
text labels; meaning is not conveyed by colour alone.

## Evidence answer accessibility boundary

The `0.4.0-rc.1` candidate adds persistent native-link navigation
between **Evidence answer** and **Technical review**. The empty candidate route
opens Evidence answer; legacy evidence fragments retain Technical review. Each
active view has its own level-one heading, the active link uses
`aria-current="page"`, sticky navigation reserves scroll space and explicit
human view changes move focus to the selected view heading.

Evidence answer uses semantic headings, lists, definition lists, links and
`details`. It presents the supported statement, evidence tier, material limit,
recorded sources, next check and cannot-decide boundary before optional
technical data. Source-derived strings are added as text only. A WebMCP update
is designed not to change the active view, URL, history, focus or scroll; an
explicit human selection may navigate to Evidence answer and create bounded
history.

The final automated candidate suites pass 43 of 43 tests in installed Google
Chrome and 43 of 43 in installed Microsoft Edge. They include serious-error-free axe
smoke checks, keyboard operation, sticky-navigation focus clearance, 320 CSS
pixel layout, 400% reflow, forced colours, reduced motion and preservation of
the active Technical review view, URL, history, focus and scroll during a
background WebMCP presentation.

These are automated observations of named browsers and states. A bounded
Safari, VoiceOver and Caption Panel journey was completed against historical
pre-hardening product commit
`a4fabe12184f47177b3a20c0e04c64d1eef9b4a8`: 6 of 9 checkpoints passed and 3
were limited. It was a non-continuous screenshot sequence without VoiceOver
speech audio or independent capture-time deployment binding. Exact-release
manual recapture remains required after any build-affecting hardening. No
existing `v0.3.0-rc.1` manual observation is carried forward, and no WCAG
conformance or beginner-comprehension claim is made.

## Released automated testing

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

- Candidate sticky navigation, view focus, inactive-view update, route
  restoration, result reading order and accepted-input disclosure have
  automated coverage in installed Chrome and Edge. The retained candidate
  manual observation is historical pre-hardening evidence and must be
  recaptured for the exact release bytes.
- The current manual journey did not retain a heading-rotor selection and did
  not prove automatic spoken live-status wording. These are the 2 recorded
  limitations; the other 7 checkpoints passed.
- The nine-step manual journey did not exercise a partial-source failure.
  Deterministic and browser coverage of that state remains separate from the
  manual VoiceOver observation.
- Ten Low security remediations retain their named focused evidence. The
  Evidence answer candidate passes 381 of 381 unit tests and 43 of 43 browser
  tests in each of installed Chrome and Edge. Historical code-snapshot scan
  `aedf88e3-6a77-46af-be6b-2c672001dd46` completed 36 of 36 items, ran 102
  focused tests and found zero findings for its snapshot. Later pre-fix scan
  `dcfed744-0676-40c1-a0ef-84dd3cc7b52b` identified the tenth Low finding;
  focused and integrated tests cover its fresh receipt-authentication
  remediation. Sealed post-fix scan
  `185ce6fa-a47f-4c5e-9888-c63a9f932205` completed all 33 selected
  executable-source items with complete configured coverage and zero
  reportable findings for its exact snapshot.
  Automated and manual observations remain bounded to their named environments
  and journeys.
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
