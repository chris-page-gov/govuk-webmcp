# Security Review: govuk-webmcp

## Scope

Focused working-tree release-candidate diff.

- Scan mode: working_tree
- Target kind: git_diff
- Target ID: target_sha256_9df5a1a7d372c8ced6a9178a294cc62356833a0d5ebcd20101fb7c6456d1fe79
- Revision range: 260d68fb1c76ed83ace8f72ff57050113c2e2a95...260d68fb1c76ed83ace8f72ff57050113c2e2a95
- Snapshot digest: codex-security-snapshot/v1:sha256:772ffaba8e25f91f5c4eccd080f6d2ace930de8e8dd8e0dfa13414b8c2f96438
- Inventory strategy: diff
- Included paths: .
- Excluded paths: none
- Runtime or test status: not recorded
- Scan context: Public Pages pre-release review.

Limitations and exclusions:
- Compact source inventory contained four changed source files; deployment YAML and evidence were additionally reviewed manually.
- Documentation-only additions after snapshot capture were reviewed separately.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 1 |
| Severity mix | medium: 1 |
| Confidence mix | high: 1 |
| Coverage | complete |
| Validation mode | not recorded |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

The release-candidate diff adds public evidence and a privileged manual GitHub Pages publication path.

### Assets

- Exact-main release integrity and trusted public-site contents.
- Pages deployment authority and OIDC token scope.
- Catalogue/source privacy and truthful evidence.

### Trust Boundaries

- A repository collaborator selects a workflow_dispatch ref that crosses into a job with Pages write and OIDC.
- Branch-controlled package scripts produce dist before SHA-pinned Pages actions deploy it.
- Catalogue URLs cross into bounded HEAD requests only after official-host admission.

### Attacker Capabilities

- A collaborator may control a branch and have workflow-dispatch authority without protected-main merge authority.
- An unauthenticated visitor cannot trigger the workflow.
- A repository administrator retains intended release authority.

### Security Objectives

- Deploy only an exact tested main revision.
- Do not let pull-request or unmerged branch bytes execute with deployment authority.
- Keep link audit requests bounded to admitted official hosts.
- Publish no credentials, private data or misleading host claims.

### Assumptions

- GitHub authenticates workflow dispatchers.
- Environment branch restrictions are external and not yet configured.
- The captured snapshot precedes the main-only remediation.

## Findings

| Finding | Severity | Confidence | Detailed write-up |
| --- | --- | --- | --- |
| [Manual Pages dispatch can deploy an unmerged branch](#finding-1) | medium | high | inline below |

### Confidence Scale

| Label | Meaning |
| --- | --- |
| high | Direct evidence supports the finding with no material unresolved blocker. |
| medium | Evidence supports a plausible issue, but material runtime or reachability proof remains. |
| low | Evidence is incomplete and the item is retained only for explicit follow-up. |

<a id="finding-1"></a>

### [1] Manual Pages dispatch can deploy an unmerged branch

| Field | Value |
| --- | --- |
| Severity | medium |
| Confidence | high |
| Confidence rationale | Direct static trace from workflow_dispatch ref through default checkout and branch scripts to deploy-pages. |
| Category | improper-access-control |
| CWE | CWE-284 |
| Affected lines | .github/workflows/pages.yml:3-4, .github/workflows/pages.yml:17, .github/workflows/pages.yml:23, package.json:9-20, .github/workflows/pages.yml:32-35 |

#### Summary

The initial manual Pages workflow accepted a non-main dispatch ref and deployed its branch-controlled build without an exact-main guard.

#### Root Cause

The privileged deployment job lacked a main-ref authorisation guard and relied on checkout's selected dispatch ref.

#### Validation

High-confidence static validation established the selected-ref source, missing guard, branch-controlled scripts and deploy sink.

#### Dataflow

Selected branch ref -\> default checkout -\> branch npm scripts -\> uploaded dist -\> deploy-pages.

#### Reachability

Reachable to a repository collaborator with workflow-dispatch authority; unauthenticated users cannot trigger it.

#### Severity

**Medium** — High public-site integrity impact with medium likelihood limited to a collaborator able to dispatch Actions.

Additional runtime or deployment evidence could raise or lower this severity.

#### Remediation

Require the dispatch ref to be refs/heads/main, explicitly check out github.sha and restrict the GitHub Pages environment to main as defence in depth.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Changed application and scripts | not recorded | No issue found | Official compact inventory fully reviewed. |
| Initial Pages workflow | not recorded | Reported | Missing main-only dispatch guard allowed non-main deployment in the captured snapshot. |
| Public policies and release evidence | not recorded | No issue found | Reviewed for credentials, private data, active content and misleading security claims. Third-party SBOM personal metadata was found separately and removed after snapshot. |
| Browser acceptance changes | not recorded | No issue found | No new attacker-controlled sink. |
