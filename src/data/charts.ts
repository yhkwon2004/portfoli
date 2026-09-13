/**
 * The chart palette — validated, not eyeballed.
 *
 * Every value below was checked with the dataviz skill's `validate_palette.js` against this
 * site's chart surface (`--color-void-3`, #0f1220). Reproduce with:
 *
 *   node scripts/validate_palette.js "#eef3ff,#c2d0ea,#94a4c6,#66759c,#414e70" \
 *        --ordinal --mode dark --surface "#0f1220"        → ALL CHECKS PASS
 *   node scripts/validate_palette.js "#4361ff,#1fa8a0" --mode dark --surface "#0f1220"
 *                                                        → ALL CHECKS PASS
 *
 * ── what changed with the reskin ──────────────────────────────────────────────────────
 * The previous gold palette could not clear the categorical *lightness band*: a single-hue
 * two-shade encoding puts one slot far outside 0.48–0.67 by construction, and the deviation
 * had to be documented and justified. The chrome palette has no such problem, because it
 * brings a second hue the old one did not have. The accent blue and a teal from the same
 * dispersion family both sit inside the band at full chroma, so the two-series stack is now
 * fully compliant on all six checks rather than compliant-with-an-exception:
 *
 *   CVD separation 22.7 (target 8) · normal-vision floor 25.9 (floor 15) · contrast ≥3:1
 *
 * Teal was picked over the other passing candidates for its tritan margin (10.5 against
 * 6–9 elsewhere). Tritan is the weakest channel for a blue-versus-blue-green pair, so it is
 * the one worth optimising; the green that scored highest overall belongs to no part of this
 * site and would read as a third brand colour wandering into a chart.
 *
 * The secondary encoding the skill asks for is present regardless: a legend, a 2px surface gap
 * between the segments, direct value labels, and a real <table> of the same numbers for screen
 * readers.
 *
 * Text never wears a series colour: axis ticks, values and legends use --color-steel and
 * --color-ice, both of which clear WCAG AA for text on this surface.
 */

/** Single-hue chrome ramp, light → dark. Passes monotone L, ΔL ≥ 0.06, light-end contrast. */
export const RAMP = ["#eef3ff", "#c2d0ea", "#94a4c6", "#66759c", "#414e70"] as const;

/**
 * The two-series stack. The accent the whole site already uses, against a teal from its
 * dispersion family — so the chart introduces no colour the rest of the page has not.
 */
export const SERIES = {
  awards: "#4361ff",
  projects: "#1fa8a0",
} as const;

/** Single-series bars. The accent, since there is no second identity to tell apart. */
export const SOLO = "#4361ff";

/** Chart surface. Must match what the validator was run against. */
export const SURFACE = "#0f1220";

/**
 * Mark geometry, from the skill's fixed specs. Bars are capped rather than filling their band,
 * so the leftover is air instead of ink.
 */
export const MARK = {
  /** Max bar/column thickness in px. */
  maxThickness: 24,
  /** Rounded data-end; the baseline end stays square. */
  endRadius: 4,
  /** The surface-coloured gap that separates touching marks. One consistent width. */
  gap: 2,
} as const;
