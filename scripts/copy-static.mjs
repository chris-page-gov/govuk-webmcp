import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/data", { recursive: true });
for (const path of ["index.html", "style.css", "favicon.svg", "startup-watchdog.js"]) {
  await cp(`app/${path}`, `dist/${path}`);
}
await cp("app/data/catalogue.json", "dist/data/catalogue.json");
await cp("app/data/catalogue.json.sha256", "dist/data/catalogue.json.sha256");
await cp("app/data/receipts.json", "dist/data/receipts.json");
await cp("app/data/receipts.json.sha256", "dist/data/receipts.json.sha256");
