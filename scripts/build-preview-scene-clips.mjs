import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(repositoryRoot, "output/demo-preview-clips");
const sources = [
  ["docs/competition/evidence/demo-scene-01-overview-2026-08-30.jpg", "demo-scene-01-overview-2026-08-30.mov"],
  ["docs/competition/evidence/demo-scene-02-evidence-trace-2026-08-30.jpg", "demo-scene-02-evidence-trace-2026-08-30.mov"],
  ["docs/competition/evidence/demo-scene-03-foundation-facets-2026-08-30.jpg", "demo-scene-03-foundation-facets-2026-08-30.mov"],
  ["docs/competition/evidence/demo-scene-04-comparison-2026-08-30.jpg", "demo-scene-04-comparison-2026-08-30.mov"],
  ["docs/competition/evidence/demo-scene-07-evidence-estate-2026-08-30.jpg", "demo-scene-07-evidence-estate-2026-08-30.mov"],
];

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  const overwrite = process.argv.slice(2).includes("--overwrite");
  await mkdir(outputDirectory, { recursive: true });
  const records = [];
  for (const [sourceRelative, destinationName] of sources) {
    const source = join(repositoryRoot, sourceRelative);
    const destination = join(outputDirectory, destinationName);
    if ((await exists(destination)) && !overwrite) {
      throw new Error(`Preview clip exists; rerun with --overwrite after review: ${destination}`);
    }
    if (overwrite) await rm(destination, { force: true });
    run("ffmpeg", [
      "-nostdin", "-hide_banner", "-y", "-loop", "1", "-framerate", "30", "-i", source,
      "-t", "35",
      "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xf6f4ef,zoompan=z='min(zoom+0.00012,1.055)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1050:s=1920x1080:fps=30,format=yuv420p",
      "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", destination,
    ]);
    records.push({
      source: sourceRelative,
      sourceSha256: await sha256(source),
      clip: `output/demo-preview-clips/${destinationName}`,
      clipSha256: await sha256(destination),
      durationSeconds: 35,
    });
  }
  const manifest = {
    schema: "trusted-govuk-discovery.demo-preview-clips.v1",
    status: "preview-from-retained-still-captures-not-live-interaction",
    purpose: "Pipeline and editorial review only. Replace with live interaction clips where the final review requires them.",
    records,
  };
  const manifestPath = join(outputDirectory, "preview-clips.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ manifest: manifestPath, clipCount: records.length }, null, 2)}\n`);
}

await main();
