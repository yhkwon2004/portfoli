/**
 * Easing for the handful of tweens that run in script rather than CSS — the counters, the
 * decoders and the timecode. Kept to the same three characters as the CSS tokens, so a number
 * rolling up beside a bar growing reads as one motion rather than two that happen to overlap.
 */

/** --ease-house, near enough: a hard deceleration into the final value. */
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** --ease-io: for things that travel from one known value to another. */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/**
 * Frame-rate independent smoothing: the fraction of the remaining distance to cover this
 * frame so that the follow feels the same at 60 Hz and 120 Hz. `rate` is the fraction per
 * 60 Hz frame.
 */
export const follow = (rate: number, dt: number): number => 1 - (1 - rate) ** (dt * 60);

// ── for the AI diagrams, which are keyframed as functions of one loop position ──

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Where `p` sits between `a` and `b`, clamped: 0 before, 1 after — one keyframe's local time. */
export const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/** --ease-settle's shape: overshoots by ~10% and comes back. For things that land. */
export const backOut = (t: number): number => {
  const c1 = 1.70158;
  const u = t - 1;
  return 1 + (c1 + 1) * u * u * u + c1 * u * u;
};
