export const EVIDENCE_RELEASE = "v0.4.0-rc.1";

const privateReleaseRoot = `.evals/personal-agent-media/${EVIDENCE_RELEASE}`;

/**
 * Canonical repository-relative paths shared by exact-release verification,
 * supported-host capture and final-video assembly.
 */
export const RELEASE_EVIDENCE_PATHS = Object.freeze({
  demoConfig: `docs/competition/demo-video-script-${EVIDENCE_RELEASE}.json`,
  localLivePagesVerification: `.evals/live-artifact-verification-${EVIDENCE_RELEASE}.json`,
  privateReleaseRoot,
  privateLivePagesVerification: `${privateReleaseRoot}/live-pages-verification.json`,
  privateEvaluationCapture: `${privateReleaseRoot}/private-capture.json`,
  privateAuthenticatedSummary: `${privateReleaseRoot}/authenticated-summary.json`,
  privateCopilotVideoCapture: `${privateReleaseRoot}/copilot-video-capture.json`,
  reviewedLivePagesVerification:
    `docs/competition/evidence/live-artifact-verification-${EVIDENCE_RELEASE}.json`,
  reviewedChromeEvidence:
    `docs/competition/evidence/chrome-devtools-mcp-${EVIDENCE_RELEASE}.json`,
  supportedHostEvidence:
    `docs/competition/evidence/supported-host-webmcp-capture-${EVIDENCE_RELEASE}.json`,
  voiceOverCaptureManifest:
    `output/voiceover-capture/${EVIDENCE_RELEASE}-capture-manifest.json`,
  voiceOverClip: `output/demo-clips/${EVIDENCE_RELEASE}/06-voiceover.mov`,
});

export const RELEASE_VOICEOVER_FRAME_PATHS = Object.freeze([
  "page-title-and-headings",
  "skip-link-and-main-focus",
  "persistent-view-navigation",
  "evidence-presentation-action",
  "evidence-answer-sections",
  "source-link-role-and-destination",
  "comparison-guide",
  "technical-review-controls",
  "focus-restoration",
].map((id, index) =>
  `output/voiceover-capture/${EVIDENCE_RELEASE}-frame-${String(index + 1).padStart(2, "0")}-${id}.png`));
