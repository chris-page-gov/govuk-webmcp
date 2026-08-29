# Implementation plan and backlog tracking

This file tracks implementation against the Must backlog. Update it in the same
change as code, tests, architecture decisions, `PROJECT_STATUS.md`,
`CODEX_HANDOVER.md` and `CHANGELOG.md` when their claims are affected.

## First vertical slice — complete locally

The complete `npm test` suite passed on 29 August 2026: 5 unit tests and 4
installed-Chrome tests passed. Research-pack validation also passed; optional
Python `jsonschema` meta-schema checks were skipped because that package is not
installed.

| Must item | Slice work | Evidence |
| --- | --- | --- |
| 5 | Accessible search and results UI | `app/index.html`, browser tests |
| 6 | Imperative `search_government_knowledge` registration | `src/webmcp-tools.ts`, browser tests |
| 9 | Shared deterministic page and tool result | runtime search function, parity test |
| 10 | Authoritative human link | result UI and browser assertion |
| 11 | Access, licence, assertion and limitation fields | fixture and result UI |
| 12 | Record and bundle digests | deterministic fixture build and integrity tests |
| 13 | Fail-closed validation | input, URL, record, bundle and raw checksum checks |
| 14 | Additional-property, oversized-input, tamper and inert-text cases | unit and browser tests |
| 15 | Same-origin CSP, no storage and no external runtime request | page policy and browser tests |

## Explicitly remaining

- Must 1–4: governance decisions, rights/attribution manifests, reviewed corpus
  expansion and the full profile/schema remain open.
- Must 7–8: exact-record and provenance tools are later vertical slices.
- Must 14: stale, missing, conflict and broader unsafe-URL cases need the larger
  corpus and remaining tool paths.
- Must 16: the local controlled Chromium test is complete; ChatGPT built-in
  browser and supported production-browser acceptance remain open.
- Must 17–18: licence, deployment, demo, submission and release evidence remain
  blocked governance gates.
