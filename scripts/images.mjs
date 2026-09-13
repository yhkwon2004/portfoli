/**
 * Build the two image tiers the site actually serves, from the photographic masters.
 *
 * The masters are 131 MB of unresized camera JPEGs and PNG screenshots — fine as an
 * archive, ruinous as a payload. Every surface in the site shows an image at one of
 * exactly two sizes, so we render exactly two:
 *
 *   thumb/  560px  — wall tiles, pick cards, focus panel, dossier gallery
 *   full/  1600px  — dossier hero plate, and the gallery's full-size view
 *
 * Both are webp. Output paths mirror the master tree, so `/assets/x/y.jpg` resolves to
 * `/assets/thumb/x/y.webp` and `/assets/full/x/y.webp` by string substitution alone —
 * see src/lib/assets.ts, which must stay in step with TIERS below.
 *
 * Usage:  node scripts/images.mjs <masters-dir> [--out public/assets]
 */
import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, relative, dirname, extname, resolve } from "node:path";

const RASTER = /\.(jpe?g|png|webp)$/i;

/** Kept in sync with `TIER` in src/lib/assets.ts. */
const TIERS = [
  { dir: "thumb", edge: 560, quality: 72 },
  { dir: "full", edge: 1600, quality: 80 },
];

const args = process.argv.slice(2);
const outFlag = args.indexOf("--out");
const outRoot = resolve(outFlag === -1 ? "public/assets" : args[outFlag + 1]);
const src = resolve(args.find((a) => !a.startsWith("--") && a !== args[outFlag + 1]) ?? "assets");

if (!existsSync(src)) {
  console.error(`masters directory not found: ${src}`);
  console.error("Usage: node scripts/images.mjs <masters-dir> [--out public/assets]");
  process.exit(1);
}

/** Every raster master, ignoring any derivative tier that already lives under src. */
const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    if (TIERS.some((t) => p === join(src, t.dir)) || p === join(src, "thumbs")) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const masters = walk(src).filter((f) => RASTER.test(f));
if (!masters.length) {
  console.error(`no raster images under ${src}`);
  process.exit(1);
}

for (const tier of TIERS) rmSync(join(outRoot, tier.dir), { recursive: true, force: true });

/** Non-raster masters (the one .svg) are copied through untouched — see assets.ts. */
const vectors = walk(src).filter((f) => !RASTER.test(f));

let written = 0;
const totals = new Map(TIERS.map((t) => [t.dir, 0]));

for (const master of masters) {
  const rel = relative(src, master).replace(/\\/g, "/");
  // `.rotate()` with no argument applies the EXIF orientation — several award scans are
  // camera photos that render sideways without it.
  const pipeline = sharp(master).rotate();
  for (const tier of TIERS) {
    const out = join(outRoot, tier.dir, rel).replace(new RegExp(`${extname(master)}$`, "i"), ".webp");
    mkdirSync(dirname(out), { recursive: true });
    await pipeline
      .clone()
      .resize(tier.edge, tier.edge, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: tier.quality })
      .toFile(out);
    totals.set(tier.dir, totals.get(tier.dir) + statSync(out).size);
  }
  written++;
}

for (const vector of vectors) {
  const rel = relative(src, vector).replace(/\\/g, "/");
  for (const tier of TIERS) {
    const out = join(outRoot, tier.dir, rel);
    mkdirSync(dirname(out), { recursive: true });
    await import("node:fs").then((fs) => fs.copyFileSync(vector, out));
  }
}

const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
console.log(`${written} masters → ${TIERS.length} tiers  (+${vectors.length} copied verbatim)`);
for (const tier of TIERS) console.log(`  ${tier.dir.padEnd(6)} ${String(tier.edge).padStart(4)}px  ${mb(totals.get(tier.dir))}`);
