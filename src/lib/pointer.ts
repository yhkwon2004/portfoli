/**
 * The pointer, as one shared, mutable reading.
 *
 * Several layers respond to the pointer — the reticle, the magnetic controls, the ghost word,
 * the glass, the wireframe room — and two of them live inside their own canvas loops. Rather
 * than each attaching a listener and each keeping its own smoothing, one writer (PointerFx)
 * keeps this current and every reader samples it in its own frame.
 *
 * A plain object, not React state: it changes at pointer rate, and nothing about it should
 * ever cause a render.
 */
export const pointer = {
  /** Client coordinates of the last pointer event. */
  x: 0,
  y: 0,
  /** Smoothed, −1 … 1 across the viewport, 0 at centre. The value parallax layers read. */
  lx: 0,
  ly: 0,
  /** False until the first move, and again once the pointer leaves the window. */
  inside: false,
};
