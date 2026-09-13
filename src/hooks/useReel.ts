"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long each slide holds before the reel advances. */
const SLIDE_MS = 3200;
/** How long a pointer on a tile suspends the reel after it stops moving. */
const HOLD_MS = 5000;

export type Reel = {
  readonly index: number;
  /** Bumped on every change, so the sweep animation can be re-triggered per turn. */
  readonly turn: number;
  /** Take the reel to a slide and suspend autoplay for a moment (a pointer or focus landed). */
  readonly pick: (n: number) => void;
  /** Release the suspension (the pointer left the wall). */
  readonly release: () => void;
};

/**
 * The showreel beside each wall.
 *
 * This is what makes 35 tiles of ~90px readable without leaving the single screen: the tiles
 * are the map, and the panel does the reading — advancing on its own so a visitor who does
 * nothing still sees every record, and yielding instantly to a pointer so a visitor who wants
 * a specific one is never fighting an animation.
 *
 * `active` is false for the wall that is off-screen. The original started both reels and
 * stopped the wrong one on each cut; keying the interval to the live chapter means the hidden
 * wall's timer simply never exists.
 */
export function useReel(count: number, active: boolean, autoplay: boolean): Reel {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const holdUntil = useRef(0);

  const to = useCallback(
    (n: number) => {
      if (count <= 0) return;
      const next = ((n % count) + count) % count;
      setIndex((prev) => {
        if (prev === next) return prev;
        setTurn((t) => t + 1);
        return next;
      });
    },
    [count],
  );

  const pick = useCallback(
    (n: number) => {
      holdUntil.current = Date.now() + HOLD_MS;
      to(n);
    },
    [to],
  );

  const release = useCallback(() => {
    holdUntil.current = 0;
  }, []);

  /*
   * Rewind whenever the wall comes back on screen, so the reel always opens on the strongest
   * record rather than wherever it happened to be left.
   *
   * Adjusted during render, comparing against the previous value — React's documented way to
   * reset state when a prop changes. Doing it in an effect instead means React commits and
   * paints the stale slide first, then immediately re-renders with slide 1: a visible flash of
   * the wrong record on every visit to the wall, and the cascading render the
   * `set-state-in-effect` rule warns about.
   */
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) {
      setIndex(0);
      setTurn((t) => t + 1);
    }
  }

  useEffect(() => {
    if (!active || !autoplay || count <= 1) return;
    // Entering the wall clears any hold left over from the last visit. This belongs here
    // rather than in the render adjustment above: a ref must not be written during render.
    holdUntil.current = 0;
    const id = window.setInterval(() => {
      if (Date.now() < holdUntil.current) return; // a pointer is parked on a tile
      setIndex((prev) => {
        setTurn((t) => t + 1);
        return (prev + 1) % count;
      });
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [active, autoplay, count]);

  return { index, turn, pick, release };
}
