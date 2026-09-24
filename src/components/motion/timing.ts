/**
 * The entrance clock, for the scripted half of the motion system.
 *
 * A `.rise` element with `--i: n` starts its entrance at `0.34s + n × 0.075s` (scene.css). A
 * decoder or a counter sitting inside that element has to start when the element does, or it
 * finishes decoding before it is visible, or starts after it has already landed. Mirroring the
 * formula here — once — is what keeps the two halves on the same beat.
 */
export const RISE_AT_MS = 340;
export const RISE_STEP_MS = 75;

/** When a `.rise` with `--i` = `i` begins its entrance, in ms after the chapter goes live. */
export const riseAt = (i: number): number => RISE_AT_MS + i * RISE_STEP_MS;
