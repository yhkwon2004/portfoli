/**
 * Render the site's media from its own 3D scenes: for each AI work a looping WebM, a poster
 * and three stills; the hero's poster; and nothing else. No stock footage, no screen recorder.
 *
 * The built site carries a harness at /render/ that mounts one scene with its clock stopped.
 * This drives it frame by frame — every frame rendered exactly, however slow the software
 * rasteriser — and WebCodecs in the page encodes them to VP9, so the clip is identical on any
 * machine and no frame is ever dropped. The files are committed under public/media/, so
 * neither CI nor a deploy needs a browser. Re-run when a scene changes:
 *
 *   npm run build && npx serve -l 4321 out &
 *   npm run media                       # or: node scripts/render-media.mjs <base> [scene…]
 *
 * These are concept visualisations drawn for this site, and every surface that shows one
 * labels it so — none of them is footage of the work itself.
 *
 * CHROMIUM_PATH overrides the browser binary, for environments with one already installed.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, statSync, writeFileSync } from "node:fs";

const [base = "http://127.0.0.1:4321", ...only] = process.argv.slice(2);
const OUT = "public/media";

/*
 * Where each still is taken, in scene progress (0 → 1). The three stills are the scene's
 * acts; the poster is its last beat — the finished picture, which is what a reader who never
 * presses play should see.
 */
const AI = {
  evidence: { stills: [0.17, 0.52, 0.8], poster: 0.97 },
  drive: { stills: [0.32, 0.6, 0.76], poster: 0.99 },
  pose: { stills: [0.12, 0.45, 0.72], poster: 0.97 },
};
const CLIP = { fps: 30, seconds: 10, bitrate: 1_900_000, hold: 0.12 };
const W = 1280;
const H = 720;

const browser = await chromium.launch({
  args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

async function stage(scene, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error(`  [${scene}] ${e}`));
  await page.goto(`${base}/render/?scene=${scene}&w=${w}&h=${h}`);
  await page.waitForFunction(() => window.__stage?.ready, null, { timeout: 120_000 });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** A still from the harness, re-encoded by sharp: the browser's own WebP encoder is weaker. */
async function still(page, p, file, { width = W, quality = 84 } = {}) {
  const url = await page.evaluate(([p]) => window.__stage.still(p, 2 + p * 9, "image/png"), [p]);
  await sharp(Buffer.from(url.split(",")[1], "base64"))
    .resize({ width })
    .webp({ quality, effort: 6 })
    .toFile(file);
  return file;
}

const kb = (f) => `${(statSync(f).size / 1024).toFixed(0)} KB`;
mkdirSync(`${OUT}/ai`, { recursive: true });

for (const [scene, plan] of Object.entries(AI)) {
  if (only.length && !only.includes(scene)) continue;
  console.log(`${scene}`);
  const page = await stage(scene, W, H);
  for (const [n, p] of plan.stills.entries()) {
    const f = await still(page, p, `${OUT}/ai/${scene}-${n + 1}.webp`);
    console.log(`  still ${n + 1} @${p}  ${kb(f)}`);
  }
  const poster = await still(page, plan.poster, `${OUT}/ai/${scene}-poster.webp`, { quality: 80 });
  console.log(`  poster @${plan.poster}  ${kb(poster)}`);

  const t0 = Date.now();
  const b64 = await page.evaluate((o) => window.__stage.record(o), CLIP);
  const video = `${OUT}/ai/${scene}.webm`;
  writeFileSync(video, Buffer.from(b64, "base64"));
  console.log(`  video ${CLIP.seconds}s ${CLIP.fps}fps  ${kb(video)}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  await page.close();
}

if (!only.length || only.includes("hero")) {
  // The hero's poster stands in for the live field until it is ready: the brain at rest,
  // placed as the page places it on a wide screen.
  console.log("hero");
  const page = await stage("hero", 1600, 1000);
  const f = await still(page, 0, `${OUT}/hero-poster.webp`, { width: 1600, quality: 78 });
  console.log(`  poster  ${kb(f)}`);
  await page.close();
}

await browser.close();
