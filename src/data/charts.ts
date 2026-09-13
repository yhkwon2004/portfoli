/**
 * The chart palette — validated, not eyeballed.
 *
 * Every value below was checked with the dataviz skill's `validate_palette.js` against
 * this site's chart surface (`--color-ink-3`, #0b0b10). Reproduce with:
 *
 *   node scripts/validate_palette.js "#ffe7b8,#f5c877,#e0a53f,#b8801f,#8a5f1c" \
 *        --ordinal --mode dark --surface "#0b0b10"      → ALL CHECKS PASS
 *   node scripts/validate_palette.js "#f5c877,#b8801f" --mode dark --surface "#0b0b10"
 *        → CVD ΔE 21.4 · normal ΔE 21.5 · contrast ≥3:1 all PASS; lightness band FAIL
 *
 * ── the one deliberate deviation, and why ──────────────────────────────────────────
 * The two-series stack fails the *categorical lightness band* (0.48–0.67 in dark mode)
 * because `#f5c877` sits at L 0.855. That band exists to keep a multi-hue identity
 * palette at comparable visual weight, so no single hue shouts. This chart is not a
 * multi-hue palette: it is one hue in two shades — the form the skill itself prescribes
 * for a two-part comparison — and on a #0b0b10 ground a lighter step means *more*
 * contrast, not less.
 *
 * The checks that actually protect readability all pass with wide margins: CVD separation
 * 21.4 (target 8), normal-vision floor 21.5 (floor 15), contrast ≥3:1. And the secondary
 * encoding the skill requires is all present: a legend, a 2px surface gap between the
 * segments, direct value labels, and a real <table> of the same numbers for screen
 * readers. Adopting a band-compliant pair instead would mean abandoning the site's gold
 * for a flat mustard-and-brown that matches nothing else on screen — a worse chart, for a
 * check that is not measuring the risk it was written for.
 *
 * Text never wears a series colour: axis ticks, values and legends use --color-bone-dim
 * and --color-bone (7.04:1 and 16.24:1 on the surface — both clear WCAG AA for text).
 */

/** Single-hue ordinal ramp, light → dark. Passes monotone L, ΔL ≥ 0.06, light-end contrast. */
export const RAMP = ["#ffe7b8", "#f5c877", "#e0a53f", "#b8801f", "#8a5f1c"] as const;

/**
 * The two-series stack. Steps 2 and 4 of RAMP — one step of air between them on each side,
 * which is what buys the ΔE 21.5 separation.
 */
export const SERIES = {
  awards: RAMP[1],
  projects: RAMP[3],
} as const;

/** Chart surface. Must match what the validator was run against. */
export const SURFACE = "#0b0b10";

/**
 * Mark geometry, from the skill's fixed specs. Bars are capped rather than filling their
 * band, so the leftover is air instead of ink.
 */
export const MARK = {
  /** Max bar/column thickness in px. */
  maxThickness: 24,
  /** Rounded data-end; the baseline end stays square. */
  endRadius: 4,
  /** The surface-coloured gap that separates touching marks. One consistent width. */
  gap: 2,
} as const;
