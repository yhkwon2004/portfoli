/**
 * The chart palette — validated, not eyeballed.
 *
 * Every value was run through the dataviz skill's `validate_palette.js` against the surface the
 * bento tiles sit on (#0d1017, dark mode):
 *
 *   "#e3fbff,#9eeeff,#57d9f2,#2fa6c2,#1f6f86" --ordinal   → ALL CHECKS PASS
 *     (one hue, monotone lightness, every step ≥ 0.06 apart, the dark end 3.33:1)
 *   "#0f9fbd,#8b73f5" (categorical)                        → ALL CHECKS PASS
 *     (both inside the L 0.48–0.67 band; CVD ΔE 10.7 deutan, 9.1 tritan; normal-vision 18+)
 *
 * The two series are the site's own two hues — the cyan and violet of the gradient — stepped
 * down into the lightness band; the brighter versions the rest of the UI uses sat above it.
 * Grades are ordinal, so they take one hue in light → dark steps: the brightest is the highest
 * honour. A legend, a 2px surface gap between segments, direct value labels and a real <table>
 * back every colour, and text never wears a series colour.
 */

/** Single-hue cyan ramp, light → dark: the highest grade is the lightest. */
export const RAMP = ["#e3fbff", "#9eeeff", "#57d9f2", "#2fa6c2", "#1f6f86"] as const;

/** The two-series stack: awards in cyan, projects in violet — the site's own two hues. */
export const SERIES = {
  awards: "#0f9fbd",
  projects: "#8b73f5",
} as const;

/** Single-series bars. The accent, since there is no second identity to tell apart. */
export const SOLO = "#0f9fbd";

/**
 * The chart surface — the colour every ratio above was measured against.
 *
 * Exported and applied to the panels as `--chart-surface`, rather than left as a comment
 * beside a duplicate hex in the stylesheet. The validation record is only worth anything if
 * the value that was validated is the value that gets painted, and two copies of a hex in two
 * files is exactly how that stops being true.
 */
export const SURFACE = "#0d1017";
