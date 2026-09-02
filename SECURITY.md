# Security policy

## Supported boundary

This is a bounded experimental prototype, not a production service. Security
claims apply only to the exact code and generated artefacts that were tested.
Repository documentation is not proof that the same revision is merged,
deployed or available through a particular browser host.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
vulnerability reporting for this repository. Include the affected commit,
browser, reproduction steps, impact and any relevant console or network output.
Do not include credentials, personal data or unpublished public-sector
information.

The maintainer will acknowledge a report as soon as practical, assess it
against the static deployment boundary and coordinate a safe fix or documented
disposition. There is no bug bounty or guaranteed response time.

## Application security boundary

The application is static and loads only packaged, same-origin data. It makes no
runtime provider API call, creates no account and uses no cookies, analytics,
local storage, session storage or persistent server-side application storage.
Following a reviewed authoritative link or a federated producer-declared link
leaves this boundary.

Candidate release evidence uses a separate fail-closed boundary.
`scripts/lib/release-evidence-paths.mjs` fixes the canonical paths for the demo
configuration; local and private live receipts; private evaluation,
authenticated-summary and Copilot capture inputs; tracked reviewed live,
Chrome and supported-host evidence; and the exact VoiceOver manifest, clip and
nine frames. Private media remains below
`.evals/personal-agent-media/v0.4.0-rc.1/`; tracked reviewed evidence remains
below `docs/competition/evidence/`; and candidate VoiceOver media uses only the
enumerated `output/voiceover-capture/` and `output/demo-clips/` paths. Public
Chrome admission is allowed only for the
fixed public target with an exact expected commit. The mode-`0600` raw receipt,
tracked reviewed Chrome projection and tracked supported-host projection are
written as one recoverable three-file set. Paths must remain under the real
repository root, symbolic ancestors and targets are rejected, and raw overwrite
is independently explicit. The public projections bind source paths, byte
sizes and SHA-256 values while retaining only rejected field names, never the
rejected synthetic value.

The live verifier can also promote one byte-identical serialised receipt to the
canonical local mode-`0600`, optional private mode-`0600` and optional tracked
reviewed mode-`0644` paths as one recoverable set. It establishes private
directories as mode `0700`, rejects a symbolic repository or private root and
does not replace private or reviewed evidence without the destination's
separate `--overwrite-private-release-receipt` or
`--overwrite-reviewed-evidence` gate. Replacing the private release receipt marks
dependent supported-host and media evidence for recapture; supported-host
validation requires its observation to be no earlier than the new receipt.
This command stages the authenticated live receipt only. It neither creates nor
attests a Copilot observation, private combined matrix or reviewed Copilot
video; those remain separate visible-capture and human-review gates.

After both 36-slot host halves have actually been observed, the Copilot import
helper validates and merges them against that authenticated receipt. Its
optional `--stage-release-evidence` action then promotes the merged capture and
authenticated summary together to the two fixed private release paths through
one recoverable admission. The pair is no-clobber by default, uses mode `0600`
files beneath mode `0700` directories and requires
`--overwrite-release-evidence` for replacement. Staged serialisation is
preflighted against the 16 MiB per-file admission limit before run-scoped output
is created. A successful overwrite prints an invalidation warning requiring the
dependent host, personal-agent and media evidence to be recaptured. This
operation preserves machine-checked bytes and permissions; it cannot establish that the visible
Copilot journey, share link, video or human review really occurred.

A conventional restrictive process umask that preserves owner access, including
`0077`, cannot silently weaken the requested release-file mode or make a correct
admission fail. After exclusive stage creation,
admission opens that file with the no-follow flag, cross-checks the file-handle
and path identities, applies the requested mode through the opened handle and
then validates the exact mode and bytes. Permission drift after normalisation
fails closed, and the unsafe replacement is preserved rather than removed.

Supported-host preflight checks the exact six published input and output
schemas, canonical results, complete presented-evidence digest, fixed
demonstration inputs and the exact live Pages `v2` receipt. Every publication
consumer freshly authenticates the live receipt in-process, requires ordered
`initial`, `after-page-load` and `after-execution` deployment checks, matches
both stored public and private receipt bindings and derives release claims only
from the authenticated object. The fresh observation must be at or after both
stored receipt observations. Structural validity alone is not authentication.
Authentication uses explicit `owned` and `borrowed` leases: an owned lease is
revoked synchronously before asynchronous snapshot clean-up on both success and
failure, while a borrower cannot revoke the outer owner's authentication. The
final-video builder owns and ultimately revokes the shared receipt; its nested
evaluation and supported-host checks borrow it.
The legislation
boundary uses one canonical hostname classifier so the apex, subdomains, case
variants and trailing-dot forms fail consistently across build, capture and
evidence validation. VoiceOver preflight revalidates its closed manifest and
all nine bounded regular non-symbolic frame files rather than trusting the
rendered sequence alone. The no-argument VoiceOver builder obtains
`output/voiceover-capture/v0.4.0-rc.1-capture-manifest.json` from the canonical
release path module and cannot fall back to historical generic
`capture-manifest.json` evidence.

Multi-file candidate media and release outputs from the live-interaction,
supported-host, Ollama and final-video builders use a shared promotion
transaction. Failure before complete promotion restores the previous complete
set. Backup clean-up occurs only after every new file is committed; if clean-up
then fails, the new set is kept and the error reports committed outputs and any
recoverable backup paths.

This is a recoverable set contract, not an atomic multi-file or hostile-
namespace guarantee. Release tooling requires exclusive control of the real
repository root and every output-parent namespace for the complete operation.
The helpers bind the validated ancestor device and inode chain, recheck it
immediately before and after each stage, link and removal operation, reject a
persistent substitution and do not subsequently clean up through the changed
chain. Exclusive stage creation also refuses to overwrite an existing file.
Generic output placement and dependency-patch clean-up revalidate exact bytes,
mode and expected identity before removing a validated stage, committed output
or backup. The specialised public-evidence recovery snapshots independently
bind identity, byte size and digest, but not mode. Their recovery copies are
created with private mode `0600`, and every final admitted target is still
revalidated at its requested mode `0600` or `0644` after transaction clean-up.
A filesystem-recycled inode therefore cannot make a byte-different replacement
eligible for deletion or make a wrong-mode admitted target pass final
validation.

Portable Node does not expose the `openat`, `linkat` and `unlinkat` operations
needed to root every mutation in an already-open directory handle. A process
running as the same operating-system user, or a privileged process, can rename
or replace an ancestor with a symbolic link inside the filesystem syscall
window and restore it before the pathname recheck. That concurrent namespace
mutation is outside the supported boundary and can leave an orphan stage at the
substituted location before the transaction rejects. Do not run release tooling
while another process can rename or replace its repository or output
directories. Full containment would require a reviewed native directory-
relative helper or an equivalent operating-system sandbox.

Private evaluation separately refuses symbolic `.evals` and output roots,
checks canonical containment and applies mode `0700` to directories and
`0600` to captures.

Five logical artefact families gate all WebMCP registration: the 80-record
catalogue, 80 evidence receipts, one Evidence Trace collection, the 10-entry
federation manifest and the lazy federated-search manifest. Each raw file must
match its SHA-256 sidecar. Schemas, internal digests, record-to-receipt
bindings, catalogue-to-trace bindings, catalogue-to-federation bindings and
the exact ordered per-source federation population bindings must also pass. A
failure in any root family
leaves a human-readable failure state and prevents every tool registration; no
partial tool set is accepted.

The frozen reviewed evidence estate is derived from four exact source locks;
the federated release adds a separate federation lock through the registry.
Each of the five registry entries must match a separately code-
reviewed imported SHA-256 value before its bytes are trusted. The standalone
federated-search builder additionally requires the reviewed federation-lock
byte pin before parsing, so replacing source bytes and re-digesting the mutable
registry cannot create an admitted release identity. The current build and
post-fix scan reconfirm five registry locks, 10 admission decisions and 36
schemas. Recompute them if source or contract bytes change before release
binding. Integrity
checks bind the packaged bytes and declared relationships. They are not
signatures from a government body and do not prove official endorsement,
current accuracy, access authority or an open licence.

Source-derived titles, descriptions and limitations remain untrusted data.
They are rendered as text, and admitted links must be credential-free HTTPS
URLs without explicit ports. Catalogue and Evidence Trace links use the bounded official-host
allowlist. The frozen pre-federation manifest uses a separate, exact GitHub
repository allowlist under `chris-page-gov` without admitting producer payload.
The `0.3.0-rc.1` build instead admits only four explicitly locked static
publication routes and mirrors only their declared search artefacts. An apex,
`www` or other subdomain `legislation.gov.uk` URL selected as a federated result
link fails projection. The page still performs no cross-origin producer fetch
at runtime. WebMCP output is also labelled as untrusted content.

## In-progress federated snapshot boundary

Version `0.3.0-rc.1` is adding a separate, digest-bound discovery plane for
exactly four independently republished OKF snapshots: A Life in the UK, ONS,
UK Government APIs and HM Land Registry. Their 58,655 locked raw rows remain
separate from the 80 reviewed records and item-level receipts. Exactly three
standalone Land Registry legislation rows are quarantined, leaving 58,652
searchable federated records. There is no standalone UK Legislation collection,
payload, index or runtime request, and the searchable projection contains zero
`legislation.gov.uk` result links. The locked files retain 28 source-authored
cross-reference strings as inert, untrusted metadata—6 in A Life in the UK, 3
in ONS, 2 in UK Government APIs and 17 in Land Registry—and do not claim literal
source-byte exclusion.

The build may mirror only the files named by the locked descriptors and search
manifests into generated same-origin paths. The browser runtime does not fetch
an OKF publisher or official operational API. Candidate validation must reject
unknown origins, credentials, explicit ports, redirects, path traversal,
undeclared files, unsupported contracts, snapshot conflicts, a legislation
collection or request and legislation result-link hosts before source-derived
content is consumed. A source-authored cross-reference string remains inert
data and cannot define a source or request.

Raw checksums alone are insufficient. Tests must also reject co-digested changes
to source identity, aggregate or per-source record counts, admission ID,
collection ID, snapshot, entry point, shard reference, collection display
contract and cross-artefact binding. The four ordered population bindings are
9,757 source/0 quarantined/9,757 searchable for A Life in the UK; 5,097/0/5,097
for ONS; 41,598/0/41,598 for UK Government APIs; and 2,203/3/2,200 for HM Land
Registry. The executable display contract also fixes each collection's title,
ordered supplementary counts, completeness statement and first limitation, so
valid self-digests cannot legitimise contradictory population text.

Fixed request, compressed-byte, decoded-byte, decoded-
row, retained-text, shard-fan-out, worker-lifetime and timeout budgets constrain
progressive loading. A corrupt or unavailable lazy source must be reported as a
partial source failure without becoming trusted through a fallback or disabling
the validated 80-record tier. Root lock or manifest failure still prevents all
tool registration.

Physical work has a separate boundary from logical caller concurrency: 4 loads
may be active, 32 may wait and no more than 36 distinct shard files may be in
flight. The fixed 3-second file deadline starts before the physical queue, and
an active slot remains held until the underlying loader settles even when its
caller cancels or times out. This prevents cancellation churn from multiplying
actual work. Queue-deadline expiry and a deadline reached immediately before a
loader call return the dedicated scheduler-busy result instead of falsely
labelling a source as corrupt. A non-cooperative loader is outside the browser
runtime's ability to terminate: if four such loads never settle, they can occupy
all four slots indefinitely and make federated search unavailable. The design
fails closed and does not admit a fifth physical load.

Same-origin response bodies are consumed incrementally under the fixed byte cap
rather than buffered in full before checking. `Content-Length` is parsed
strictly; declared overflow, streamed overflow, an empty body or a missing body
fails closed. The generated-plane builder uses bounded cleanup retries because
Finder can recreate `.DS_Store` during removal; static copying excludes
`.DS_Store`, and `dist` is cleaned before compilation so operating-system
metadata cannot enter the release artefact.

Federated trust remains conservative. Producer wording cannot promote a link or
assertion to official status. Exact-record output reports source authority as
“Not independently established”, retains a producer-declared link role and
shows the recorded destination hostname in the human interface.

Ten Low findings have implemented remediations:

| Finding | Remediation state |
| --- | --- |
| Crafted token distribution causes superlinear postings generation (`csf_d6045d8bfb6836f0a274850d`) | Incremental exact-byte partitioning and aggregate token, posting and generated-byte caps implemented |
| Land Registry metadata-only limits are not enforced per row (`csf_628dded1ed9a62431cf1f121`) | Exact row classification, prohibited-field rejection and three-record legislation quarantine implemented |
| Mutable source artefacts can retain fixed revision claims (`csf_a685f5df80a811659b866345`) | Mutable-source and fixed-revision consistency checks implemented |
| One federated collection can suppress healthy sources (`csf_e9078180b75895a09a282bda`) | Per-source failure isolation implemented |
| Producer text can self-promote arbitrary links and assertions to official status (`csf_13ddf953dc16e399c8c04f03`) | Producer-declared labels, unestablished authority, destination display, explicit-port rejection and legislation-host rejection implemented |
| The constructor token can crash the federated build (`csf_5b3f067459df708770da0536`) | Prototype-safe token maps implemented |
| Concurrent WebMCP calls amplify uncached shard work (`csf_afca5f27e901f0db4b730cc7`) | Per-runtime in-flight fetch sharing implemented |
| Trailing-dot and secondary legislation URLs bypass the excluded-host boundary (`csf_a2d9e030fda789ecd1cb0e41`) | Generator and runtime canonical-host checks cover primary and secondary URLs, including trailing-dot forms |
| Normal build accepts a co-digested source-lock substitution (`csf_050a3c08c471d3176e0640c3`) | All five source digests are separately pinned in executable release policy, the direct federated builder checks the reviewed lock bytes and same-count source/registry mutation tests fail closed |
| Public Chrome evidence admission trusts unauthenticated live-byte receipts (`csf_65ba47976493eb447f8cf096`) | Every supported-host publication consumer requires a fresh process-local authenticated receipt observed at or after both stored receipts, matches both stored bindings and derives release claims only from the authenticated object; explicit owned and borrowed leases prevent nested consumers from revoking or outliving the outer authentication |

Sealed pre-fix standard scan `dcfed744-0676-40c1-a0ef-84dd3cc7b52b`
identified the tenth finding with High confidence and Low severity. Its source
coverage is explicitly partial. Focused remediation tests pass 31 of 31, and
the current integrated prepared unit suite passes 404 of 404.
Those test results do not replace an exact post-fix working-tree security
review.

Sealed post-fix working-tree scan `185ce6fa-a47f-4c5e-9888-c63a9f932205`,
snapshot
`codex-security-snapshot/v1:sha256:012c0b4bb3e60271f8d60fca9475976a473ac0a267f87354810e51c2d575c0ad`,
subsequently completed all 33 selected executable-source items with complete
configured coverage and zero reportable findings. Its vulnerability-discovery
scope excluded non-executable documentation, tests, generated projections,
binary media, ignored private captures, transitive dependencies and upstream
services; relevant contracts and tests were used as supporting evidence. The
later clean-run reconstruction, portable clean-up, canonical-path, secure
receipt-staging and evidence-descendant authentication changes alter executable
source after this scan. It remains historical evidence and closes the local
changed-source security gate only for its own snapshot.

Codex Security scan `5944866f-336d-4f27-8b36-d0d8269f2824`, snapshot
`codex-security-snapshot/v1:sha256:e393c031c8e21478fd934e00a1590ed030c314c996c4ea6116f7b43a4a4bec9c`,
then completed the immutable range
`a4fabe12184f47177b3a20c0e04c64d1eef9b4a8..2666f201e30c9cc0df94af133a4d0449d183337f`
with complete configured coverage and zero reportable findings. Its portable
four-file record is retained under
`docs/competition/evidence/security-scan-2026-09-02-pre-staging/`. This closes
the local changed-source security review for that exact range. The canonical
personal-agent pair producer above was added after the sealed snapshot and
requires a final changed-source review; the scan does not prove protected
integration, deployment, exact-release staging, host or model behaviour,
accessibility, Copilot observation or human media review.

The subsequent independent review identified the restrictive-umask and
no-argument VoiceOver-default defects described above. Their focused post-fix
batch passes 116 of 116, and the complete prepared unit suite passes 404 of
404. Those results do not establish protected CI, deployment or the final full
release gate.

Sealed scan `9c2c0929-bb88-437b-a185-74a7f8bdec6a` suppressed the first seven
findings and identified the eighth with High confidence and Low severity. It
recorded no other open reportable candidate, but its coverage has mechanically
partial and stale-pending rows, and the eighth fix postdates its snapshot. A
focused security batch passed 119 of 119 and the affected post-fix subset
passed 23 of 23. These are implemented candidate controls, not completed
release security evidence. Gates A–I and M, the immutable exact-tree security
rescan later passed against the fixed executable candidate as recorded below;
gate M still requires protected integration and exact release binding. The exact
research, build/data, lexical-quality, installed-Chrome, installed-Microsoft-
Edge and authorised model-free smoke gates pass where separately recorded. On
the exact tree before the three later remediations,
`npm run test:unit:prepared` passed 173 of 173 in `17128.154916 ms`.

A later immutable scan,
`4ab29c3e-0a96-4596-b930-5eccb9b63ebc`, completed 50 of 50 review items and
dynamically reproduced three further candidates:

| Candidate | Attack-path disposition | Engineering response |
| --- | --- | --- |
| Mutable local Ollama tag could leave a misleading model-identity receipt | Not reportable: substitution requires privileged control of the loopback model service or local account | Receipt v2 requires matching `/api/tags` identities before and after the run plus the daemon-reported `/api/ps` loaded digest afterwards |
| Aggregate-only population totals permitted a co-digested per-source redistribution and contradictory display claim | Not reportable: the path requires repository/build or same-origin write authority | Exact ordered per-source population and executable display-contract bindings reject the mutation |
| Cancellation churn could create more physical shard work than the logical concurrency cap implied | Not reportable: the observed impact is bounded self-availability, not a cross-user or trust-boundary compromise | Separate physical active, queue and distinct-file limits, a queue-inclusive deadline and settlement-bound slot lifetime constrain the work |

Attack-path review therefore classified zero findings from this scan as
reportable vulnerabilities. That disposition does not make the reproduced
defects acceptable: they affect evidence fidelity or resilience and are being
fixed. Exact post-remediation local verification passed research 4 of 4;
production build and data validation for 80 reviewed records, 80 receipts,
58,655 raw rows, 3 quarantined rows, 58,652 searchable rows, 120 record shards
and 1,733 postings shards; 194 of 194 prepared unit tests; the frozen quality
gate at mean nDCG@10 `0.984698009` and Recall@20 `1` with cold/warm parity, no
legislation collection and a rejected legislation request; 30 of 30 browser
tests in installed Chrome and 30 of 30 in installed Microsoft Edge; 6 of 6
model-free WebMCP smoke calls in real Chrome; zero npm-audit vulnerabilities
across 162 total dependencies; and `git diff --check`.

Immutable exact-range scan `2b3097c7-6f9f-45fb-baee-ee8b2d125a3a` then
completed 55 of 55 review items against `d9a8eb116652d32fb705f7e597c267359119fe93`
and reported the ninth finding above with High confidence and Low severity.
The sealed report is retained under
`docs/competition/evidence/security-scan-2026-08-31-pre-remediation/`.
The separately code-reviewed source pins, direct builder check and mutation
regressions were implemented after that immutable snapshot. Fresh immutable
exact-range scan `040ad945-3723-4aef-9c03-1bb552630deb` then completed 55 of
55 review items against fixed candidate
`9c6ed7d9a21574972ee564b333cbc49983058554` with zero reportable findings. Its
sealed scope predates the subsequent narrow CI portability corrections. The
first makes the exact reviewed stored bytes, their locked length and
SHA-256 digest the compressed-artefact contract; bounded gunzip then validates
the decoded source length and digest, while the importer cross-binds the decoded
bytes to the newly fetched raw source bytes. It preserves the reviewed bytes
without host recompression. The second replaces an unreferenced
`AbortSignal.timeout` with a referenced, finally-cleared import-wide deadline
timer so a pending operation cannot lose its enforcement handle. Focused
mutation and deadline regressions plus the protected Linux rerun must evidence
those deltas separately rather than retroactively widening the sealed scan.
The sealed report is retained under
`docs/competition/evidence/security-scan-2026-08-31-fixed-candidate/`. This is
complete local security evidence for that named snapshot only; later executable
changes require their own review, while protected CI, exact deployment and
supported-host observations remain separate release claims.

The final-candidate demonstration preflight also failed closed as intended when
no deployed commit and no explicit overwrite approval were supplied. It did not
start live capture and supplies no live-capture evidence.

For an earlier Evidence answer candidate snapshot, frozen code-snapshot scan
`aedf88e3-6a77-46af-be6b-2c672001dd46`, digest
`codex-security-snapshot/v1:sha256:54069030a2b50cc5a9a084c5973fc06d4b07ea898acab187d3c543c9aa70df0e`,
completed 36 of 36 items, ran 102 focused tests, found zero findings and
concluded that there was no security release blocker for that snapshot. The
later sealed pre-fix scan `dcfed744-0676-40c1-a0ef-84dd3cc7b52b` identified the
tenth finding above. Its remediation is covered by the focused and integrated
tests recorded above, and sealed post-fix scan
`185ce6fa-a47f-4c5e-9888-c63a9f932205` closes the local changed-source security
gate for its exact snapshot as recorded above. Deployment, host, accessibility,
personal-agent and media claims remain separately gated.

Residual operational boundaries remain explicit. Removing networked npm
configuration is not operating-system isolation; some local media and evaluation
subprocesses do not have process-group-wide hard deadlines; media still depends
on private receipts plus human review; and the deterministic double build is a
local release check rather than a CI-enforced step.

The standalone deterministic verifier runs the normal production build twice
with networked npm configuration removed. It inventories tracked source inputs
before and after each build, compares every regular non-link `dist` path, size
and SHA-256 value and writes an ignored mode-`0600` receipt only after equality.
It does not make the working tree a trusted release: protected integration,
authenticated Pages artefact and live-byte comparison still bind the deployable
commit.

## Action and input boundary

The released human interface and all five released WebMCP tools use one
deterministic action controller. Three tools only query verified packaged data
and declare `readOnlyHint: true`. The two evidence exploration tools change
reversible, transient presentation state and therefore declare
`readOnlyHint: false`; they do not change sources, browser storage, the network
or external state.

The `0.4.0-rc.1` candidate adds
`present_resource_evidence` through that controller. Its one-field input is
closed and executable validation accepts only a canonical reviewed or admitted
federated record identifier. It resolves the exact record before provenance,
cross-checks their identifier, tier and digest bindings, and returns no partial
presentation if either stage or the projection fails. Its
`readOnlyHint: false` annotation is required because it can update reversible
page presentation. It does not grant authority, fetch an official API, mutate
the catalogue, write storage or create a durable receipt.

Candidate Evidence answer rendering uses DOM creation and `textContent`, not
source-derived HTML. A source link is created only for a credential-free HTTPS
URL whose hostname equals the separately validated recorded hostname; missing
or rejected destinations remain visible as text. The candidate route parser
rejects unknown, duplicate, incompatible, malformed and oversized fragment
state. One controller-owned latest-started sequence covers all three actions
that can update Evidence answer. A stale action can return to its caller but
cannot commit, complete an older asynchronous projection or announce a stale
failure over the newer answer. These code boundaries still require
candidate-specific browser and security verification before release.

The candidate Pages verifier validates the downloaded archive digest and then
checks every tar member path and entry type before extraction. Directory and
regular-file aliases share one duplicate namespace; traversal, absolute paths,
links, special files and mismatched path/type listings fail closed. Receipt
schema v2 binds a 256 MiB downloaded-archive cap, 4,096 regular files, 512
directory entries, 192 MiB aggregate regular-file payload and 8 MiB per file.
The logical tar payload is measured before extraction and must equal the
post-extraction total. Live comparison uses at most eight concurrent fetches, a
60-second per-file deadline and one ten-minute whole-comparison deadline.
Post-extraction real-path, symbolic-link and exact listed-file checks remain in
force.

The personal-agent claim gate accepts only an in-process authenticated live
Pages receipt. Authentication freshly repeats the GitHub artefact and live-byte
observation, requires ordered `initial`, `after-page-load` and
`after-execution` deployment checks, compares every binding except the new
observation time, requires that new observation to be at or after both stored
receipt observations, verifies a checkout admitted by the selected policy and
checks local `dist` file count, byte count, manifest and `deployment.json`.
Normal evaluation uses the `exact-pages-commit` policy and therefore requires a
clean unchanged checkout at the exact Pages commit. Authentication is
mutation-sensitive: changing a branded receipt closes the gate. A raw but
well-shaped receipt is reported only as `structurally-valid`.

Final-video authentication alone may select the
`clean-evidence-descendant` policy. It requires the product commit to be an
ancestor of a clean descendant, permits only `A` or `M` changes and pins the
same HEAD and exact NUL-safe Git change set before authentication, afterwards
and during retained revalidation. Its closed path allowlist admits only
documentation `.md`, `.csv` and `.vtt` files, reviewed JSON below
`docs/competition/evidence/`, selected top-level public documentation and the
exact `v0.4.0-rc.1` VoiceOver manifest, nine frames and clip. It rejects
`AGENTS.md`, runtime, workflow, package, source, script, test, deletion,
rename, copy, type-change and non-canonical path changes. This is an
evidence-assembly exception, not permission to evaluate changed page code.

Authentication objects have explicit `owned` and `borrowed` leases. An owned
consumer revokes synchronously on both success and failure before it awaits
asynchronous snapshot clean-up; a borrowed consumer cleans its own snapshot but
cannot revoke the outer authentication. Final-video preflight owns one
in-process authentication object and observation window, lends it to evaluation
replay and supported-host validation, and revokes it in its outer `finally`
path. Release-specific commit, run, deployment, artefact and browser/runtime
values are supplied by the final configuration and independently validated
receipts; they are not frozen to a pre-integration deployment in source. A
retained dirty or unbound local diagnostic cannot be reused as the release-bound
local half of the 72-run matrix.

Every observable call trajectory is replayed in order through a private,
manifest-verified snapshot of receipt-bound `dist`, loaded under a unique module
identity; captured outputs must equal the replay, and page parity derives from
replayed output. Replay caches are scoped to one validation. The authenticated
receipt is immutable, and the snapshot, working `dist` and clean Git identity
admitted by that evaluation's selected policy are rechecked after replay.
Public Copilot runs must bind the canonical deployment, visible Microsoft Edge
MCP Workspace and an observed canonical Copilot share link. The link and exact
free-text host/browser values remain private. The public summary contains no
hashes of those values and publishes a browser version only when it has the
bounded Chromium form
`major.0.build.patch`. Synthetic markers
are checked across nested percent-encoded, numeric-entity, Unicode-normalised,
case-folded and punctuation-insensitive forms. Fixed search stories admit only
their exact generated canonical query string, so reordered, separator-only,
encoded, hashed or otherwise unrelated additions fail the minimal-argument
criterion.

The claim gate accepts answer-safety judgements only when every reviewed answer
was reviewed by a human or domain specialist; an agent-only review remains
recordable but non-claimable. An admitted page observation must retain literal
`null` history state and exact empty local and session storage. A local host URL
must be a credential-free HTTP loopback root with no query or fragment.

Tool schemas are closed and bounded, and executable code revalidates every
input. One descriptor-safe data-only boundary covers reviewed discovery,
combined discovery, lazy federated discovery, Evidence Trace comparison and
the shared action-budget ingress used by all six page actions. Before dispatch,
the shared input budget accepts at most 16 plain, enumerable string data
properties, each with a key of at most 128 characters, without walking rejected
nested values or executing accessors. Symbols, non-enumerable fields and
accessors fail closed. Action-specific object and array validators likewise
inspect descriptors and copy only enumerable data properties, rejecting sparse,
accessor-backed or extra indexed array fields without invoking them. Numeric
limits are non-coercive: only actual bounded integer numbers are accepted;
strings, booleans and objects with conversion hooks are rejected without
invoking those hooks. Root-key enumeration is still proportional to the root
object presented by the caller. Only accepted, bounded diagnostic inputs are
hashed. Rejected, cyclic, exotic or over-budget input receives no input digest.
Result diagnostics bind the serialised deterministic result instead.

Portable JavaScript reflection cannot establish that a Proxy is trap-free, so
hostile Proxy containment is not claimed. Browser-host JSON inputs cannot carry
a Proxy. Code that constructs a Proxy in the same JavaScript realm already has
script-execution authority and is outside this data-only host-input boundary.

Human URL-fragment routing is also bounded. Raw fragments over 1,024 characters
are discarded, comparison values are length-limited, and comparison accepts
only two to four exact claim identifiers. Candidate routes also admit only the
fixed `guided` and `technical` views and fail closed on unknown, duplicate or
incompatible parameters.

## WebMCP boundary

The five released tools are registered imperatively into the current page when
a compatible secure host exposes `document.modelContext`. The candidate
definition set contains six tools and still registers all or none only after
the same artefact validation succeeds. This page-scoped
integration is not an independently callable or durable MCP gateway. It has no
provider-authentication facility, persistent session, service operation or
durable tool receipt, and it does not prove that a particular browser or agent
host has discovered or called the tools.

The page neither hosts a model nor accepts an identity, profile or general
personal-context object. This is a page-contract property, not a security claim
about a citizen-selected agent.
The browser host can observe tool definitions, inputs, outputs and visible page
state. A remote model provider may also receive those items and relevant prompt
context. A correctly configured local model can keep inference local, but the
host, model runner and browser can still log data. Only bounded, action-specific
inputs belong in page-tool calls.

A dated isolated-Chrome observation discovered and called the six-tool
`0.4.0-rc.1` set against the exact pre-integration `a4fabe...` deployment. It
selected no model and captured no host-owned surface. That receipt is specific
to its named bytes and cannot authenticate a later build, current host support
or personal-AI selection. The retained five-tool observations are likewise
release-specific and cannot be carried forward as candidate evidence.

## Independent harness security

Native browser developer tools, Microsoft WebMCP Explorer, Chrome DevTools MCP
and `webmcp-evals` have broader browser access than the page itself. Treat them
as privileged development harnesses, not production dependencies or security
oracles. Pin package versions and extension source revisions, verify the
resolved dependency lock and build from the recorded source before use.

Every independent run must:

- use a fresh, isolated browser profile with no accounts, saved credentials,
  personal extensions, history or unrelated tabs;
- restrict navigation to the exact local or deployed project origin and the
  deliberately selected model endpoint;
- use only synthetic prompts and the public fixture, with no personal data,
  credentials or unpublished public-sector information;
- redact network headers and disable optional telemetry or CrUX lookups where
  the harness provides those controls;
- require explicit approval before a presentation tool is allowed to alter the
  visible page state; and
- retain exact failures and unexpected network destinations for review rather
  than removing them from the record.

Explorer passes page-supplied tool metadata and results to the selected model,
so source-derived text remains untrusted and must not become an instruction to
the harness or model. Chrome DevTools MCP can inspect and modify its browser
instance; it must never attach to a personal browsing profile. Upstream
`webmcp-evals` browser runs may disable the Chromium sandbox, so run them only
against this controlled fixture under an unprivileged local account, never on
an authenticated or sensitive site.

The hardened Chrome DevTools MCP runner sets
`CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. An earlier pre-hardening run wrote
`~/.cache/chrome-devtools-mcp/latest.json` at 14:37 BST on 30 August 2026; the
final 15:53 BST rerun left that modification time unchanged. This observed
boundary does not turn the privileged harness into an operating-system sandbox.
The prepared model-backed browser-evaluation wrapper also rejects any upstream
console error or `pageerror`, validates the diagnostic shape and records
`browserConsoleErrorsAccepted: false`. Five local runs used Chrome 152,
`webmcp-evals` 0.0.4, eight cases, three runs per case and exact loopback model
`ollama:gpt-oss:20b`, inventory digest
`17052f91a42e97930aa6e28a6c6c06a983e6a58dbb00434885a0cf5313e376f7`,
with the first three using no remote credentials. The pre-legibility attempt passed 8 of 102 retry-
expanded rows; attempt 2 passed 33 of 33 upstream rows but 32 of 33 under the
strict verifier because one call added empty optional arrays; and attempt 3 on
the security-fixed tree passed 30 of 35 upstream rows after two malformed-then-
corrected provenance IDs and one omitted comparison. Receipt-v2 attempt 4 bound
stable exact identity and exited zero, but structural validation failed and its
evaluation was null. Receipt-v2 attempt 5 reported 36 rows
for 33 expected rows: 30 passed, 6 failed, none errored or were missing, and no
console errors occurred. Each of three malformed provenance trajectories was
rejected before a correct retry succeeded. This is useful fail-closed recovery
evidence, but `verify-reports` failed. All five private reports remain failure
and variance evidence, not a security or model-selection pass.

The first three historical attempts used the earlier receipt contract. Attempts
4 and 5 used receipt v2 and showed the same exact model name and digest in `/api/tags`
before and after evaluation and as the daemon-reported loaded model in `/api/ps`
after evaluation. The observations were stable and the receipt recorded
`executionBound: true`. The fixture SHA-256 was
`ce0cb0264a836c26911b09b2fc1c362dcc70d979fb0aa1a49d6a94de0f4ee93f`; the
tracked JSON and HTML report SHA-256 values were
`4864596182a483b75cd966357e46fd8047a5bea08062132d574443ebf3ffcbfb` and
`3f7e27724abc9346820ef6ce293f9b416609d6f9a947423033e4045e52a252ff`.
Absent, ambiguous or
mismatched evidence fails the run without replacing an earlier failure reason.
Inventory fetches reject redirects, require exact `name` and `model` values,
and reject `remote_model` or `remote_host` markers before evaluation and in the
post-run loaded state. Ollama's own [cloud-model documentation](https://docs.ollama.com/cloud)
explains that cloud models can be accessed through its local API; this check
prevents that proxy route using the local path without explicit remote-provider
approval. The receipt rejects extra
local identity or path fields, and remote-provider receipts contain no local
inventory. This binds post-run evidence reported by the selected daemon; it is
not cryptographic proof that a particular response was generated by particular
weights, and it cannot defend against privileged control of the account, daemon
or evidence channel, tag changes between observations or a model that was
already loaded before evaluation.

The native Chrome-panel capture used a separately named temporary Chrome app
clone, a disposable profile, no extensions or sign-in, loopback-only remote
debugging and the exact public origin. Playwright attached only to that
DevTools frontend. To exercise the panel's native Paste control without reading
or replacing the Mac clipboard, the capture temporarily replaced
`navigator.clipboard.readText` inside the disposable DevTools page and restored
it before each Run action. The exact temporary browser process and profile must
be stopped and removed after capture; neither is submission evidence.

The model-free evaluator wrapper forwards no provider credential environment
variables and gives the child an isolated `HOME`. This reduces inherited
provider configuration; it is not an operating-system sandbox. The child still
has the filesystem access of the invoking user. Raw smoke rows are deleted
after semantic validation, and only counts plus a results digest remain in the
ignored smoke receipt. The ignored DevTools receipt is the only one of those two
receipts that retains full tool outputs.

Static triage dated 30 August 2026 found that the npm advisories reported for
the exact Microsoft WebMCP Explorer 0.1.0 build are not reachable in that
production extension path. This narrow result is not a general security
clearance. The extension requests `<all_urls>`, can persist credentials in
`chrome.storage.local`, sets `dangerouslyAllowBrowser`, has no prompt-injection
mitigation and can autoexecute Agent Run/Chat. Do not silently run
`npm audit fix`, because that would replace the evidenced upstream dependency
graph.

Any Explorer execution must use a disposable browser profile. Inspect the Tools
pane first without a credential, then prefer an exact local loopback model and
Agent Step. Delete the profile afterwards. If a remote run is necessary, use a
revocable low-limit key and synthetic prompts without personal context. Do not
use Agent Run or Chat autoexecution for acceptance evidence. The current record
contains the isolated, idempotent build only; it does not claim an Explorer
browser execution or model selection.

Provider secrets belong only in the harness's approved local credential
mechanism or process environment. Never write them into commands, fixtures,
screenshots or receipts. Generated JSON and HTML reports can contain prompts,
tool schemas, arguments, results, trajectories, console output and URLs. Keep
raw reports outside version control until they have been reviewed and
sanitised; checksum any retained evidence and bind it to the exact browser,
harness, model location, page URL and tested commit.
