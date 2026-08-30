# Candidate verification and post-snapshot delta — 30 August 2026

## Evidence boundary

This record covers the final pre-commit working tree based on
`fd2b7ae3176532e96b78fa31320e7fe27ec6cf51`. It is not evidence for a merged
commit, canonical GitHub Actions run or deployed site. Those require the
protected pull-request and exact-deployment sequence.

The sealed security export in `security-candidate-snapshot-2026-08-30/` covers
an immutable snapshot taken before the last stricter count, identifier,
workflow, test and documentation changes. The post-snapshot review below is
therefore recorded separately. This file does not relabel the sealed scan as an
exact-final scan.

## Environment

| Component | Observed version |
| --- | --- |
| macOS | 26.5.2 (build 25F84), Apple silicon |
| Node.js | 26.7.0 |
| npm | 11.19.0 |
| Python | 3.14.6 |
| Google Chrome | 152.0.7977.64 |
| Microsoft Edge | 152.0.4191.53 |

The CI and Pages workflows use Node.js 22 and pin Python 3.14.6. Local version
coverage is useful but does not replace that canonical Linux CI environment.

## Final working-tree results

| Check | Result |
| --- | --- |
| Research baseline verifier | Passed checksum, example digest, JSON syntax and source-register checks. The optional Python `jsonschema` meta-schema check was skipped because that package is not installed locally. |
| Deterministic build | Validated four authored locks; built 80 records, 80 receipts, one Evidence Trace and 10 corpus admissions; all 20 published schemas passed generated-data validation. |
| Prepared unit and contract suite | 58 of 58 passed. |
| Installed Chrome suite | 19 of 19 passed on isolated loopback port 4210. |
| Installed Edge suite | 19 of 19 passed on isolated loopback port 4211. |
| Accessibility automation | The browser journey included axe WCAG 2.2 tags, keyboard use, focus/history, 320 CSS-pixel reflow, forced colours and reduced motion; no serious or critical axe violation was reported. This is not a conformance assessment. |
| Dependency audit | `npm audit --json` reported zero vulnerabilities at every severity. |
| Secret scan | Gitleaks scanned the complete current working tree with `--no-git --redact` and found no leaks. |
| Text and data hygiene | `git diff --check` passed and all five competition CSV files parsed successfully. |
| Evidence manifest | Every path then listed in `docs/competition/evidence/SHA256SUMS` matched. The manifest is regenerated after adding this record and the sealed candidate scan, then checked again. |

The deterministic bundle digests were:

- catalogue bundle:
  `20593105f6e34d5072f566b4f7b98cab143c4333c56bbabfca831b935237945c`;
- Evidence Trace:
  `a6c38dcc1cc8defbb38a1541e5964159a1e724aa989cb362187111a801dc0a3b`;
- federation manifest:
  `3b1301d55ebd232e6d4b89226ddb9cc92ee4ae0878fc5b6ac48a88594ed06d71`.

## Sealed security snapshot

Codex Security scan `8dda47c2-46d1-4a1f-9e00-15bbaa684cdb` reviewed all
44 source-like inventory items in immutable snapshot
`codex-security-snapshot/v1:sha256:2a7a423b127342ffd154628d1288132a8ef967978ce53b7f8b1b71129ba9be9d`.
It recorded complete coverage and no reportable finding. Two independent,
non-overlapping reviews covered the browser/WebMCP runtime and the
build/schema/data inventory.

The bounded canonical export contains:

| File | SHA-256 |
| --- | --- |
| `coverage.json` | `aa8fa97f907a8199ddbbdde8a29ac42ad34d711e124b12436c1b3d274222ea0a` |
| `findings.json` | `1528a2b913fdb4ef5c67a8682db2bc70700f63337efffb251b1a95a3ab23e682` |
| `report.md` | `099b66508420096aac7976a689fb7b3a55e93e7d96faf8225b4866ddc5abdd9e` |
| `scan-manifest.json` | `8d5f066776dce59a9c3c3050411b25079f7652aa85e498823e48ae7e7eeb8e07` |
| `exports/results.sarif` | `441ec939d9253896ae0cc1e88b0a8d9d08eacf8b6007df8b1bf331dacbb9f0b2` |

The scan's TAC advisory status was unknown and did not gate work. A native
ChatGPT/WebMCP host call was unavailable. The host's treatment of an aborted
registration lifetime remains outside page control.

## Post-snapshot delta review

The scan tool correctly warned that the working tree changed while the scan
was running. The later executable delta was deliberately narrow and
fail-closed:

- catalogue schema and runtime admission now require exactly 80 records;
- federation validation receives the validated catalogue count and requires
  the two searchable admissions to account for that exact population;
- co-digested 79-record catalogue, receipt and federation regressions are
  rejected;
- exact record and provenance actions reject whitespace-padded identifiers so
  executable behaviour matches the anchored schemas; and
- the keyboard browser check now waits for the verified ready state and settled
  focus before sending Enter, removing a test race without changing product
  behaviour.

The remaining later changes pin the workflow Python version, preserve the
historical example boundary, clarify the separate official-source and exact
GitHub federation allowlists, update lockstep documentation and add the sealed
scan export. Independent current-tree reviewers found no plausible security
candidate in the runtime or build/schema/data scopes. The complete 58-unit,
19-Chrome and 19-Edge suites then passed after those changes.

## Environmental and test observations

- The aggregate `npm test` command completed the research, build and all 58
  unit checks before the sandbox denied the Playwright loopback bind with
  `EPERM`. The identical prepared Chrome suite passed outside that sandbox.
- Port 4173 was already occupied by an unrelated existing local server. It was
  left untouched; final Chrome and Edge runs used ports 4210 and 4211.
- A newly added parity regression initially expected the record-lookup error
  code from the provenance action. The implementation correctly returned
  `invalid_provenance_request`; the test expectation was corrected and the
  complete 58-test suite then passed.
- An earlier keyboard run exposed readiness/focus timing in the test. Repeated
  focused checks and the final 19-test runs in both browsers passed after the
  explicit readiness and focus assertions were added.

## Remaining release evidence gates

- protected pull-request CI for the exact commit;
- exact `main` SHA confirmation after integration;
- exact-commit Pages deployment metadata and byte/digest verification;
- a signed-out live human journey, console check and supported-host WebMCP
  discovery/call observation;
- a manual screen-reader journey;
- a release-platform SBOM or attestation if claimed; and
- the separately authorised competition registration and submission steps.

Registration for, or submission to, Devpost has not been performed by this
verification work.
