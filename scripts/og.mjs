/**
 * Render the Open Graph card from the real site.
 *
 * Rather than re-draw the hero in a second technology — and get its fonts, gold and hourglass
 * subtly wrong — this loads the built page at exactly 1200×630 and photographs the opening
 * chapter. The card is then the site, with the correct Cinzel/Cormorant/Myeongjo faces and the
 * live sand simulation in the frame.
 *
 * The result is committed to public/og.png, so neither CI nor a deploy needs a browser. Re-run
 * only when the opening chapter changes:
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

const launch = {
  args: ["--no-sandbox"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
};

mkdirSync("public", { recursive: true });
const browser = await chromium.launch(launch);
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(base, { waitUntil: "networkidle" });
// Let the letterbox bars slide in, the title rise, and the pour establish itself.
await page.waitForTimeout(3000);
const raw = `${out}.raw.png`;
await page.screenshot({ path: raw });
await browser.close();

// A 24-bit screenshot of this page is ~720 KB and every social crawler downloads it. The
// palette is almost entirely gold on near-black, so an indexed PNG is visually identical at
// an eighth the size.
await sharp(raw).png({ compressionLevel: 9, palette: true, quality: 80 }).toFile(out);
unlinkSync(raw);
console.log(`wrote ${out} (1200x630, ${(statSync(out).size / 1024).toFixed(0)} KB)`);
