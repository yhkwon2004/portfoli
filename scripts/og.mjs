/**
 * Render the Open Graph card from the real site.
 *
 * Rather than re-draw the hero in a second technology — and get its type and its particle
 * field subtly wrong — this loads the built page at exactly 1200×630 and photographs the
 * opening screen once the neural field is live and the headline has landed. The card is then
 * the site itself, with its own fonts and its own 3D scene in the frame.
 *
 * The result is committed to public/og.png, so neither CI nor a deploy needs a browser. Re-run
 * only when the opening screen changes:
 *
 *   npm run build && npx serve -l 4321 out &
 *   node scripts/og.mjs http://127.0.0.1:4321
 *
 * CHROMIUM_PATH overrides the browser binary, for environments with one already installed.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, statSync, unlinkSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const out = "public/og.png";

const browser = await chromium.launch({
  // WebGL through the software rasteriser, so the field renders on a machine with no GPU.
  args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
mkdirSync("public", { recursive: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// The opening counter plays once per session; a card is the page after it.
await page.addInitScript(() => sessionStorage.setItem("portfolio:seen", "1"));
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForSelector('.hero-stage[data-ready="true"]', { timeout: 60_000 });
// Let the headline rise, the reveals settle and the field turn a little.
await page.waitForTimeout(3500);
const raw = `${out}.raw.png`;
await page.screenshot({ path: raw });
await browser.close();

// A 24-bit screenshot is ~800 KB and every social crawler downloads it. The card is dark with
// a narrow palette, so an indexed PNG is visually identical at a fraction of the size.
await sharp(raw).png({ compressionLevel: 9, palette: true, quality: 88 }).toFile(out);
unlinkSync(raw);
console.log(`wrote ${out} (1200x630, ${(statSync(out).size / 1024).toFixed(0)} KB)`);
