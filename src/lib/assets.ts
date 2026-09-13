/**
 * Image URL resolution.
 *
 * Content records store the path of the photographic master (`/assets/evidence/x.jpg`),
 * but the site never serves masters — `scripts/images.mjs` pre-renders each one at the
 * two sizes the design uses, and those are what ship:
 *
 *   /assets/thumb/evidence/x.webp   560px   tiles, pick cards, focus panel, gallery
 *   /assets/full/evidence/x.webp   1600px   dossier hero plate
 *
 * Both tiers mirror the master tree, so resolving one is a string substitution. The tier
 * names and edge lengths here must match TIERS in scripts/images.mjs.
 */

export const TIER = {
  thumb: { dir: "thumb", edge: 560 },
  full: { dir: "full", edge: 1600 },
} as const;

export type Tier = keyof typeof TIER;

/**
 * GitHub Pages serves a project site under `/<repo>`, so every asset URL needs that
 * prefix. Read at module scope: Next inlines `NEXT_PUBLIC_*` at build time, so this is a
 * constant in the bundle, not a runtime lookup.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Raster masters get converted to webp; anything else (the one .svg) is copied verbatim. */
const RASTER = /\.(jpe?g|png|webp)$/i;

/**
 * The URL of `master` at `tier`.
 *
 * A vector master has no size to render, so both tiers hold the same copied file and the
 * extension is left alone.
 */
export function src(master: string, tier: Tier = "thumb"): string {
  const rel = master.replace(/^\/?assets\//, "");
  const path = RASTER.test(rel) ? rel.replace(RASTER, ".webp") : rel;
  return `${BASE}/assets/${TIER[tier].dir}/${path}`;
}

/**
 * A `srcset` offering both tiers, so a browser on a wide or high-DPR screen can pick the
 * 1600px file for a large box while a phone showing a 90px tile stays on the 560px one.
 * Pair it with a `sizes` attribute describing the box, or the browser assumes full width.
 */
export function srcSet(master: string): string {
  return (["thumb", "full"] as const)
    .map((t) => `${src(master, t)} ${TIER[t].edge}w`)
    .join(", ");
}

/** Prefix a public-directory path (favicons, og image) with the deployment base path. */
export const asset = (path: string): string => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
