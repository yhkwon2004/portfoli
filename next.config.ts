import type { NextConfig } from "next";

/**
 * The site is a single static page, so it ships as a static export: no server, no
 * revalidation, nothing to run. That makes it deployable to GitHub Pages, Vercel, or
 * any bucket without changing a line.
 *
 * GitHub Pages serves a project site from `/<repo>`, so both the router and every asset
 * URL need that prefix — while Vercel and local `next dev` serve from the root. Rather
 * than hard-code either, the prefix comes from the environment: the Pages workflow sets
 * NEXT_PUBLIC_BASE_PATH, everything else leaves it empty.
 *
 * It has to be NEXT_PUBLIC_* because src/lib/assets.ts reads it in the browser to build
 * image URLs; a server-only variable would inline as "" there and 404 every image.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  // Static export has no image-optimization server. We don't need one: scripts/images.mjs
  // pre-renders every image at the two sizes the design actually uses.
  images: { unoptimized: true },
  // Pages serves `/x/` from `/x/index.html`; trailing slashes keep relative URLs honest.
  trailingSlash: true,
  reactStrictMode: true,
  // A type error must fail the build, not ship. (Next's default already does this; stated
  // explicitly so nobody "fixes" a red build by flipping it on.)
  //
  // Next 16 removed `next lint`, so `next build` no longer runs ESLint at all — linting is
  // its own step. `npm run verify` and the CI workflow run typecheck, lint and build in
  // sequence for exactly that reason; `npm run build` alone does not lint.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
