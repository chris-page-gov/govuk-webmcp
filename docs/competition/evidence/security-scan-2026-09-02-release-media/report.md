# Security Review: govuk-webmcp

## Scope

Final focused security review of exact working-tree snapshot codex-security-snapshot/v1:sha256:fa7f13cac45d27832514469e74a3dc012e85cab5da9339fbccddcd05354aa6f3 over protected product base a4d2db44e60024c3eadbdb2b1722153ce19dff4c.

- Scan mode: working_tree
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: a4d2db44e60024c3eadbdb2b1722153ce19dff4c...a4d2db44e60024c3eadbdb2b1722153ce19dff4c
- Snapshot digest: codex-security-snapshot/v1:sha256:fa7f13cac45d27832514469e74a3dc012e85cab5da9339fbccddcd05354aa6f3
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: node --test tests/unit/demo-video.test.mjs passed 36 of 36 in 538.93 ms; targeted git diff --check passed.
- Artifacts reviewed: package.json, scripts/build-demo-video.mjs, scripts/build-personal-agent-comparison-clip.mjs, output/voiceover-capture/v0.4.0-rc.1-capture-manifest.json, Focused 36-test mutation result and independent static review
- Scan context: The threat model was generated during this scan. Complete four-item review and an independent read-only reviewer confirmed the six targeted provenance, privacy and canonical-path remediations. No candidate vulnerability survived discovery.

Limitations and exclusions:
- No live penetration test or media rebuild was performed.
- Visual truth, genuine host or assistive-technology operation and publication approval remain manual gates.
- Non-executable documentation, other generated evidence and the unchanged deployed static application were supporting context rather than primary discovery surfaces.
- Excluded deployed static browser application: The protected deployed product commit is unchanged.
- Excluded visual truth, genuine host/VoiceOver operation, answer safety and publication approval: These remain explicitly separate manual evidence gates.
- Excluded same-user PATH or concurrent ancestor replacement: Explicitly outside the supported hostile boundary.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | complete |
| Validation mode | Exact-snapshot source-backed four-item diff review with independent static review and focused injected-fake/mutation counterevidence. |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Text: # Final scoped release-evidence threat model This diff contains privileged local release tooling and generated evidence, not a change to the deployed static browser application. Protected assets are the confidentiality of mode-0600 personal-agent inputs; the integrity of the public 72-run aggregate, exact live-release binding and canonical private-source derivation; exact VoiceOver evidence identity; and recoverable media outputs. Tracked JSON crosses closed executable validators. Every personal-agent publication consumer now requires a freshly authenticated live Pages receipt, replays the canonical private 72-run capture and authenticated summary, and requires canonical equality with the tracked public projection. The aggregate uses exact nested shapes and exact ordered US-01 to US-12 coverage for both hosts. VoiceOver admission requires the canonical manifest and nine ordered canonical frame paths as well as byte digests and image checks. Dynamic HTML is escaped, browser rendering is offline with network requests aborted, fixed media executables receive argument arrays without a shell, and outputs use bounded canonical file admission plus recoverable no-clobber promotion. A realistic attacker may propose malformed, symbolic, path-traversing or semantically forged inputs, but is not assumed to control the protected branch, maintainer account, authenticated live receipt, mode-0600 canonical private pair or local release operator. Same-user PATH and namespace races remain explicitly outside the hostile boundary. Residual manual obligations are visual truth, genuine host and assistive- technology operation, answer safety, privacy/branding/rights review and public upload approval. Structural and digest checks do not establish those facts. This model applies to exact working-tree snapshot `codex-security-snapshot/v1:sha256:fa7f13cac45d27832514469e74a3dc012e85cab5da9339fbccddcd05354aa6f3` over base `a4d2db44e60024c3eadbdb2b1722153ce19dff4c`. No Critical or High issue is supportable without a lower-privileged reachable path that publishes private material, executes attacker-controlled code or forges evidence without authority equivalent to changing the reviewed repository. A protected-write-path correctness defect with no privilege delta does not survive the security reportability gate, though it must still be fixed before release.

## Findings

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Personal-agent final-video evidence admission | Private provenance replay and exact live/public/private parity | No issue found | Fresh live authentication, borrowed-lease private replay, canonical public/private equality and disposal are mandatory. |
| Standalone personal-agent comparison publication | Authentication bypass in an alternate publication consumer | No issue found | The builder now loads canonical mode-0600 inputs, authenticates the live release once, replays the private 72-run pair and requires exact public parity before rendering. |
| Public aggregate schema and story coverage | Private nested fields or false 12-story coverage | No issue found | Every nested object is closed; both hosts require exact ordered US-01 to US-12 rows with three observations and aggregate reconciliation. |
| VoiceOver manifest and frame identity | Alternate co-digested evidence admitted as the candidate | No issue found | Exact canonical manifest and ordered nine frame paths, digests, timing and image checks are required. |
| HTML, network and subprocess boundary | Active markup, unintended requests or shell injection | No issue found | Data-derived values are escaped, rendering is offline with request abortion, and fixed media tools receive argument arrays without a shell. |
| Path and output boundary | Traversal, symbols, overwrite and partial promotion | No issue found | Inputs are bounded canonical regular files and output uses recoverable no-clobber transactional placement. |
