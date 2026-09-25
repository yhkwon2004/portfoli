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
    // The 3D scenes are three.js scene graphs driven from react-three-fiber's `useFrame`: a
    // mutable graph built once and written to in place sixty times a second — positions,
    // uniforms, the camera — is how R3F is meant to be used, and re-rendering React per frame
    // instead would be the actual bug. The React Compiler's immutability and ref rules assume
    // the opposite model, so they are off for this directory only.
    files: ["src/components/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
    },
  },
];

export default config;
