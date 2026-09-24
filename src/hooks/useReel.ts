"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long each slide holds before the reel advances, unless the caller says otherwise. */
const SLIDE_MS = 3200;
/** While a pointer holds the reel, how often to look again. */
const RECHECK_MS = 400;
/** How long a pointer on a tile suspends the reel after it stops moving. */
const HOLD_MS = 5000;

export type Reel = {
  readonly index: number;
  /** Bumped on every change, so the sweep animation can be re-triggered per turn. */
  readonly turn: number;
  /**
   * Which way the last turn went: 1 onward, −1 back. Autoplay and a wrap from the last slide to
   * the first both count as onward — the reel is still moving forward through the set.
   */
  readonly dir: 1 | -1;
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
export function useReel(
  count: number,
  active: boolean,
  autoplay: boolean,
  /**
   * How long slide `n` holds, where it should differ from the default — the works reel gives an
   * AI work the full run of its diagram rather than cutting it off a third of the way in.
   */
  holdFor?: (n: number) => number | undefined,
): Reel {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const holdUntil = useRef(0);

  const to = useCallback(
    (n: number) => {
      if (count <= 0) return;
      const next = ((n % count) + count) % count;
      setIndex((prev) => {
        if (prev === next) return prev;
        setTurn((t) => t + 1);
        // Judged on the unwrapped target, so stepping back from the first slide to the last
        // still reads as a step back.
        setDir(n < prev ? -1 : 1);
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
      setDir(1);
    }
  }

  // Entering the wall clears any hold left over from the last visit. This belongs here
  // rather than in the render adjustment above: a ref must not be written during render.
  useEffect(() => {
    if (active) holdUntil.current = 0;
  }, [active]);

  const holdRef = useRef(holdFor);
  useEffect(() => {
    holdRef.current = holdFor;
  });

  /*
   * One timeout per slide rather than an interval, so each slide can hold for its own time and
   * the clock restarts whenever the slide changes — by the reel or by hand.
   */
  useEffect(() => {
    if (!active || !autoplay || count <= 1) return;
    let id = 0;
    const tick = () => {
      if (Date.now() < holdUntil.current) {
        id = window.setTimeout(tick, RECHECK_MS); // a pointer is parked on a tile
        return;
      }
      setIndex((prev) => {
        setTurn((t) => t + 1);
        setDir(1);
        return (prev + 1) % count;
      });
    };
    id = window.setTimeout(tick, holdRef.current?.(index) ?? SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, autoplay, count, index, turn]);

  return { index, turn, dir, pick, release };
}
