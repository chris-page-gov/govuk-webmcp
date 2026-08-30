# Working-tree security scan and remediation — 30 August 2026

## Evidence boundary

This is pre-commit working-tree evidence. The initial scan was sealed before
remediation; the fixes and independent review described below apply to the
subsequent uncommitted working tree based on
`fd2b7ae3176532e96b78fa31320e7fe27ec6cf51`. This record does not establish the
security of a final commit, CI artefact or live deployment.

It must be paired with an exact final commit, clean-clone or exact-commit
validation, canonical CI, deployment-byte verification and the final live
browser/WebMCP journey before release claims are made.

## Canonical pre-remediation scan

- Scan ID: `0735e481-5df9-43fe-8f3a-04bc3d9b797c`
- Baseline commit: `fd2b7ae3176532e96b78fa31320e7fe27ec6cf51`
- Target: the 39-file working-tree implementation diff against that baseline
- Snapshot digest:
  `codex-security-snapshot/v1:sha256:ec790806b470beee90957b039d8c4ad1b3269d4d168b4b77fde7c747d4c480a7`
- Outcome: complete coverage with two reportable low-severity findings
- Important limitation: no native ChatGPT/WebMCP host call was available

The mechanically retained canonical export is in
`security-scan-2026-08-30/`:

| File | SHA-256 |
| --- | --- |
| `report.md` | `bb7f22b0c38a5dc9be522437f69a297806e65cbba29f757d63f7294402baa702` |
| `scan-manifest.json` | `e62c4ec4a481dd7b44ef87404a7f2a12a9fa4f43d2c954fcb60ac477395c49e1` |
| `findings.json` | `fd8b605ff4bb91586c71cc19fa6f89994468160e6468ef339dbcf7bee75c6cd4` |
| `coverage.json` | `6561685a67487f704c44fb11ff68f88cd87b02dc05cb2d618fed57c9656c7082` |
| `exports/results.sarif` | `73bb48379e52bdece268be3dec57fb5c85920b171e467550d3635b9745b41f4d` |

The scan checkpoints, candidate ledger and source snapshot were deliberately
not copied. The manifest's preserved-source references therefore identify scan
internals rather than additional files in this bounded evidence export.

## Findings and remedies

### `csf_41bd1a86df6723af9809e17f` — fixed

The scan reproduced stack exhaustion when rejected tool input containing a
20,000-level nested object was recursively canonicalised for a diagnostic hash.

The common action controller now applies a cheap root-input budget before
dispatch: it rejects more than 16 enumerable own root keys, key names longer
than 128 characters and accessor properties encountered at that boundary.
Diagnostic input has the stricter requirement of no more than 16 own keys and
is admitted only as a small flat object containing primitive values or arrays
of no more than eight primitive values. Only successful, admitted input is
hashed. Rejected input is represented by a bounded result and a null diagnostic
input digest, so nested, cyclic or otherwise rejected caller-owned values are
not traversed for hashing.

Regression coverage sends the 20,000-level object through every action path and
through the instrumented browser tool interface. It also covers cyclic input,
`BigInt`, broad roots and accessors, checking for bounded error output, no page
error and no dispatch when the common budget rejects the input.

Independent post-patch verdict: `fixed`.

### `csf_f203d8431e5137ec989af24d` — fixed

The scan found that a public comparison hash was split into every token before
the two-to-four-claim semantic limit was applied.

Routing now rejects a raw fragment longer than 1,024 characters before
constructing `URLSearchParams`. It separately rejects a decoded comparison
longer than 387 characters — four 96-character identifiers and three separators
— before splitting. More than four tokens or an empty token is converted into a
small rejected comparison request. The page restores the default evidence view
with a visible warning after an oversized route rather than allocating across
the original fragment.

Regression coverage exercises a 10,000-character public fragment, malformed
comparison tokens and a valid three-claim journey, checking that the
page remains ready and records no page error.

Independent post-patch verdict: `fixed`.

### Source-lock admission — resolved as a provenance assurance defect

The initial review reproduced omission of a required source lock. It was
security-suppressed because exploitation required protected-repository write
authority, which already carries equivalent application authority. It remained
a provenance assurance defect and was remediated.

One shared source-admission module now requires exactly these four identifier,
path and authored-item-count bindings before any standalone builder consumes a
source:

| Source-lock identifier | Required path | Items | Imported SHA-256 |
| --- | --- | ---: | --- |
| `okf-govuk-content:new-child-69` | `app/data/sources/govuk-content-69.lock.json` | 69 | `3777086d570663e358d36be256b8fc590ac7f6909eacd2216904a7fab9d7a6bc` |
| `curated-official-api-data-2026-08-29` | `app/data/sources/curated-api-data.json` | 11 | `f09b76edd88c7981059b596c9c381f25ac8e1a6cb47a45d675e8972519bed794` |
| `answer-packs:curated-2026-08-30` | `app/data/sources/answer-packs.json` | 1 | `ea00549f465ef4d7fc65c9e5853ee2b78ab6d9823d25e9268516d7b955d70f1f` |
| `corpus-admissions:reviewed-2026-08-30` | `app/data/sources/corpus-admissions.json` | 10 | `dc798de2d33fc9434e1dce730bb945c8fd7b6c01466cea02728c9aadf292edd0` |

The admission step rejects missing, extra or duplicate identifiers; duplicate,
redirected or swapped paths; incorrect declared counts; changed source bytes;
and observed item-count drift. Each source must be a regular non-symlink file;
the validator opens it without following a final symlink where the platform
supports that flag and checks that the opened device and inode still match the
inspected file. Tests also prove that each of the three standalone builders
fails before source consumption when the registry is incomplete.

Independent post-patch verdict: `resolved as a provenance assurance defect`.

## Independent review

An independent post-patch reviewer traced the changes and adversarial tests for
all three items. Its summary was:

> No security findings. All three fixes are effective in the reviewed working tree.

That verdict is scoped to the reviewed working tree. The reviewer also retained
two non-bypass limitations:

- root admission still uses `Reflect.ownKeys`, so work at the root remains
  proportional to the number of root keys before the small diagnostic copy is
  admitted; and
- source locks and SHA-256 checks are reproducibility and consistency controls,
  not signatures or independent proof of publisher authenticity.

Neither limitation was found to bypass the applied fixes, but both prevent a
broader security or authenticity claim.

## Post-remediation checks

The following commands completed successfully against the remediated candidate:

```text
npm run test:unit
```

Result: 46 of 46 unit and contract tests passed.

```text
PLAYWRIGHT_PORT=4202 npx playwright test
```

Result: 19 of 19 tests passed in installed Google Chrome.

```text
PLAYWRIGHT_PORT=4203 npm run test:browser:edge
```

Result: the same 19 of 19 tests passed in installed Microsoft Edge.

```text
npm audit --audit-level=moderate
```

Result: zero vulnerabilities reported.

A gitleaks pre-documentation pass found no leaks in the candidate. Because this
record and the copied scan export were added afterwards, secret scanning must be
rerun over the final exact working tree and commit before publication.

Source admission reported exactly four validated authored source locks before
generation. This establishes the bounded mapping recorded above; it does not
turn catalogue inclusion into access, licence or source-authenticity evidence.
