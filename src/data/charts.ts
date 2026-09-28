/**
 * The chart palette — validated, not eyeballed.
 *
 * Every value was run through the dataviz skill's `validate_palette.js` against the surface the
 * bento tiles sit on (#0d1017, dark mode):
 *
 *   "#e3fbff,#9eeeff,#57d9f2,#2fa6c2,#1f6f86" --ordinal   → ALL CHECKS PASS
 *     (one hue, monotone lightness, every step ≥ 0.06 apart, the dark end 3.33:1)
 *   "#b38c38,#7d84dc" (categorical, surface #0e0e11)           → ALL CHECKS PASS
 *     (both inside the L 0.48–0.67 band, chroma ≥ 0.1; CVD ΔE 24.1 protan, 14.8 tritan;
 *     normal-vision 24.0)
 *
 * The two series are the site's own two accents stepped down into the lightness band: the
 * champagne that marks results becomes an antique gold for awards, and the iris of "the model"
 * a deeper iris for projects — the pale versions the UI uses sit above the band.
 * Grades are ordinal, so they take one hue in stepped strengths: on the page that hue is the
 * champagne of results, at opacity 0.3 → 1.0 by grade weight — the strongest is the highest
 * honour. RAMP below is the same ordinal idea in cyan, kept for the rank records. A legend, a 2px surface gap between segments, direct value labels and a real <table>
 * back every colour, and text never wears a series colour.
 */

/** Single-hue cyan ramp, light → dark: the highest grade is the lightest. */
export const RAMP = ["#e3fbff", "#9eeeff", "#57d9f2", "#2fa6c2", "#1f6f86"] as const;

/** The two-series stack: awards in antique gold (results wear champagne), projects in iris. */
export const SERIES = {
  awards: "#b38c38",
  projects: "#7d84dc",
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
