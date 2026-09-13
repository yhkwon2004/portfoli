import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "public/**", "test-results/**", "playwright-report/**"] },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Every image on this site is served from one of the two pre-rendered tiers that
      // scripts/images.mjs produces, through the <Img> component in src/components/Img.tsx.
      // next/image exists to do the resizing we already did at build time, and under
      // `output: "export"` it cannot optimize anything anyway — so a bare <img> with an
      // explicit srcset is both smaller and the honest description of what happens.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // The canvas simulations are hot loops that run 60x a second on typed arrays. Reusing
    // one mutable object per grain and writing to it in place is the point, not an oversight.
    files: ["src/hooks/use*Sand.ts", "src/hooks/useHourglass.ts", "src/lib/sim/**"],
    rules: { "no-param-reassign": "off" },
  },
];

export default config;
