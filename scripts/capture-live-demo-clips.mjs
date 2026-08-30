import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");
const outputRoot = join(repositoryRoot, "output/demo-clips");
const receiptPath = join(
  repositoryRoot,
  "docs/competition/evidence/demo-live-interaction-capture-2026-08-30.json",
);

const product = {
  url: "https://chris-page-gov.github.io/govuk-webmcp/",
  release: "v0.2.0-rc.1",
  commit: "9235ee5db4df637bdb2a12e87449e871614afe68",
};

const answerId = "answer:new-child-starting-points";
const claimIds = ["claim:register-a-birth", "claim:check-child-benefit"];
const answerRoute = `#answer=${encodeURIComponent(answerId)}`;
const sceneDurationMilliseconds = 36_000;

const scenes = [
  {
    sceneId: "overview",
    fileName: "demo-scene-01-overview-2026-08-30.mov",
    route: answerRoute,
    actions: ["load-public-release", "open-analytical-index"],
    run: async (page) => {
      await hold(page, 2_000);
      await smoothScroll(page, "#answer-heading");
      await hold(page, 1_500);
      await smoothScroll(page, "#answer-basis");
      await hold(page, 1_600);
      await smoothScroll(page, "#analytical-index-heading");
      await page.getByRole("link", { name: "Open authoritative source for claim 1" }).focus();
      await hold(page, 2_400);
    },
  },
  {
    sceneId: "trace",
    fileName: "demo-scene-02-evidence-trace-2026-08-30.mov",
    route: answerRoute,
    actions: ["select-answer", "open-evidence-trace"],
    run: async (page) => {
      await smoothScroll(page, "#trace-heading");
      await hold(page, 2_000);
      await page.getByRole("button", { name: "Show foundations for claim 1" }).click();
      await hold(page, 1_600);
      await smoothScroll(page, "#trace-diagram");
      await hold(page, 2_400);
      await smoothScroll(page, "#foundation-panel");
      await hold(page, 2_000);
    },
  },
  {
    sceneId: "facets",
    fileName: "demo-scene-03-foundation-facets-2026-08-30.mov",
    route: answerRoute,
    actions: ["select-foundation", "inspect-eight-trust-facets"],
    run: async (page) => {
      await smoothScroll(page, "#analytical-index-heading");
      await page.getByRole("button", { name: "Show foundations for claim 2" }).focus();
      await hold(page, 1_400);
      await page.getByRole("button", { name: "Show foundations for claim 2" }).click();
      await hold(page, 1_800);
      await smoothScroll(page, "#foundation-panel");
      await hold(page, 3_000);
    },
  },
  {
    sceneId: "comparison",
    fileName: "demo-scene-04-comparison-2026-08-30.mov",
    route: answerRoute,
    actions: [
      "select-claim-register-a-birth",
      "select-claim-check-child-benefit",
      "open-comparison",
    ],
    run: async (page) => {
      await smoothScroll(page, "#analytical-index-heading");
      const checkboxes = page.locator("#analytical-index input[type='checkbox']");
      await checkboxes.nth(0).check();
      await hold(page, 900);
      await checkboxes.nth(1).check();
      await hold(page, 1_200);
      await page.getByRole("button", { name: "Compare 2 selected claims" }).click();
      await page.locator("#comparison-panel").waitFor({ state: "visible" });
      await hold(page, 1_700);
      await smoothScroll(page, "#comparison-content");
      await hold(page, 3_000);
    },
  },
  {
    sceneId: "estate",
    fileName: "demo-scene-07-evidence-estate-2026-08-30.mov",
    route: answerRoute,
    actions: ["open-evidence-estate"],
    run: async (page) => {
      await smoothScroll(page, "#estate-heading");
      await hold(page, 2_200);
      await page.locator(".estate-table").focus();
      await hold(page, 1_300);
      await smoothScroll(page, "#estate-body tr:nth-child(6)");
      await hold(page, 2_200);
      await smoothScroll(page, "#federation-digest");
      await hold(page, 2_000);
    },
  },
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function parseArguments(argv) {
  const unknown = argv.filter((argument) => argument !== "--overwrite");
  invariant(unknown.length === 0, `Unknown argument: ${unknown.join(", ")}`);
  return { overwrite: argv.includes("--overwrite") };
}

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = capture ? `\n${result.stderr || result.stdout}` : "";
    throw new Error(`${command} failed with exit code ${result.status}${detail}`);
  }
  return result.stdout ?? "";
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function inside(parent, candidate) {
  const path = relative(parent, candidate);
  return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !path.startsWith(sep);
}

async function assertSafeExistingFile(path, label) {
  if (!(await pathExists(path))) return;
  const info = await lstat(path);
  invariant(info.isFile() && !info.isSymbolicLink(), `${label} is not a regular non-symbolic file: ${path}`);
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function probeDuration(path) {
  const value = Number(run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    path,
  ], true).trim());
  invariant(Number.isFinite(value) && value > 0, `Captured clip has no positive duration: ${path}`);
  return value;
}

async function hold(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function smoothScroll(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });
  await locator.evaluate((element) => element.scrollIntoView({ behavior: "smooth", block: "center" }));
  await hold(page, 1_500);
}

async function waitForVerifiedRuntime(page) {
  await page.waitForFunction(() => {
    const count = document.querySelector("#record-count")?.textContent?.trim();
    const query = document.querySelector("#query");
    const warning = document.querySelector("#route-warning");
    return count === "80" && query instanceof HTMLInputElement && !query.disabled && warning?.hidden !== false;
  });
}

async function verifyPublicRelease() {
  const response = await fetch(new URL("deployment.json", product.url), {
    headers: { accept: "application/json" },
    redirect: "error",
  });
  invariant(response.ok, `Deployment metadata returned HTTP ${response.status}`);
  const metadata = await response.json();
  invariant(metadata?.schema === "trusted-govuk-discovery.deployment.v1", "Deployment metadata schema is wrong");
  invariant(metadata.repository === "chris-page-gov/govuk-webmcp", "Deployment metadata repository is wrong");
  invariant(metadata.commit === product.commit, "Public deployment does not match the configured product commit");
  invariant(metadata.runId === "33286771963", "Public deployment run does not match the verified release");
}

async function captureScene(browser, scene, work) {
  const rawDirectory = join(work, `raw-${scene.sceneId}`);
  await mkdir(rawDirectory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: rawDirectory, size: { width: 1920, height: 1080 } },
    locale: "en-GB",
    timezoneId: "Europe/London",
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const productOrigin = new URL(product.url).origin;
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === productOrigin) await route.continue();
    else await route.abort("blockedbyclient");
  });

  const page = await context.newPage();
  const video = page.video();
  const recordStarted = Date.now();
  const sourceUrl = `${product.url}${scene.route}`;
  await page.goto(sourceUrl, { waitUntil: "networkidle" });
  await waitForVerifiedRuntime(page);
  const contentReady = Date.now();
  await scene.run(page);
  const remaining = sceneDurationMilliseconds - (Date.now() - contentReady);
  if (remaining > 0) await hold(page, remaining);
  await context.close();
  const rawPath = await video.path();
  const trimSeconds = Math.max(0, (contentReady - recordStarted) / 1_000);
  const preparedPath = join(work, scene.fileName);
  run("ffmpeg", [
    "-nostdin", "-hide_banner", "-y",
    "-ss", trimSeconds.toFixed(3),
    "-i", rawPath,
    "-an",
    "-vf", "fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-movflags", "+faststart",
    preparedPath,
  ]);
  const durationSeconds = probeDuration(preparedPath);
  invariant(durationSeconds >= 34 && durationSeconds <= 38, `${scene.sceneId} clip duration is outside the 34 to 38 second capture window`);
  return {
    sceneId: scene.sceneId,
    source: preparedPath,
    destination: join(outputRoot, scene.fileName),
    receipt: {
      sceneId: scene.sceneId,
      path: `output/demo-clips/${scene.fileName}`,
      sha256: await sha256File(preparedPath),
      durationSeconds,
      capturedAt: new Date(contentReady).toISOString(),
      actions: scene.actions,
      sourceUrl,
    },
  };
}

async function placeOutputs(entries, receiptSource, overwrite) {
  const all = [
    ...entries.map(({ source, destination }) => ({ source, destination })),
    { source: receiptSource, destination: receiptPath },
  ];
  for (const { destination } of all) {
    invariant(
      inside(repositoryRoot, destination),
      `Capture destination is outside the repository: ${destination}`,
    );
    await assertSafeExistingFile(destination, "Capture destination");
    invariant(overwrite || !(await pathExists(destination)), `Capture destination exists; review it and rerun with --overwrite: ${destination}`);
  }

  const prepared = [];
  const backups = [];
  const committed = [];
  try {
    for (const { source, destination } of all) {
      await mkdir(dirname(destination), { recursive: true });
      const temporary = `${destination}.pending-${process.pid}-${randomUUID()}`;
      await copyFile(source, temporary);
      prepared.push({ temporary, destination });
    }
    for (const { destination } of prepared) {
      if (await pathExists(destination)) {
        const backup = `${destination}.backup-${process.pid}-${randomUUID()}`;
        await rename(destination, backup);
        backups.push({ destination, backup });
      }
    }
    for (const item of prepared) {
      await rename(item.temporary, item.destination);
      committed.push(item.destination);
    }
    for (const { backup } of backups) await rm(backup, { force: true });
  } catch (error) {
    for (const destination of committed.reverse()) await rm(destination, { force: true });
    for (const { destination, backup } of backups.reverse()) {
      if (await pathExists(backup)) await rename(backup, destination);
    }
    for (const { temporary } of prepared) await rm(temporary, { force: true });
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  await verifyPublicRelease();
  run("ffmpeg", ["-version"], true);
  run("ffprobe", ["-version"], true);
  const work = await mkdtemp(join(tmpdir(), "govuk-webmcp-live-capture-"));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const browserVersion = browser.version();
    const results = [];
    for (const scene of scenes) results.push(await captureScene(browser, scene, work));
    await browser.close();
    browser = undefined;
    const receipt = {
      schema: "trusted-govuk-discovery.demo-live-interaction-capture.v1",
      capturedAt: new Date().toISOString(),
      product,
      captureMethod: "playwright-public-site-interaction",
      browser: {
        name: "Playwright Chromium",
        version: browserVersion,
      },
      reviews: {
        privacy: "pending-agent-review",
        branding: "pending-agent-review",
        humanPublicationReview: "pending",
      },
      noBrowserChrome: true,
      audioCaptured: false,
      clips: results.map(({ receipt }) => receipt),
    };
    const temporaryReceipt = join(work, "demo-live-interaction-capture-2026-08-30.json");
    await writeFile(temporaryReceipt, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    await placeOutputs(results, temporaryReceipt, options.overwrite);
    process.stdout.write(`${JSON.stringify({
      status: "captured",
      product,
      receipt: relative(repositoryRoot, receiptPath).split(sep).join("/"),
      clips: receipt.clips,
    }, null, 2)}\n`);
  } finally {
    if (browser) await browser.close();
    await rm(work, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) await main();
