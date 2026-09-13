"use client";

import { useEffect } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

/**
 * One requestAnimationFrame loop, shared by both sand simulations.
 *
 * Three things it does that the original loop did not:
 *
 *  · **Stops when the page is hidden.** The original ran its two canvases forever, burning
 *    CPU and battery in a background tab for a page nobody was looking at.
 *  · **Stops when `active` goes false.** Reduced-motion and unmount both take the same path,
 *    so there is no way to leave a loop running.
 *  · **Resets the clock on resume.** `dt` is clamped to 50 ms as a backstop, but after a tab
 *    switch the honest value is "one frame", not "four minutes" — so the first frame back
 *    starts from a fresh timestamp instead of a clamped lie.
 *
 * `onFrame` is held in a ref, so passing a fresh closure each render does not restart the loop.
 */
export function useRafLoop(onFrame: (dt: number) => void, active: boolean): void {
  const frameRef = useLatestRef(onFrame);

  useEffect(() => {
    if (!active) return;

    let raf = 0;
    let prev = 0;
    let stopped = false;

    const tick = (now: number) => {
      if (stopped) return;
      // First frame of a run has no previous timestamp; 16 ms is the honest guess.
      const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016;
      prev = now;
      frameRef.current(dt);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || stopped) return;
      prev = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();

    return () => {
      stopped = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, frameRef]);
}
