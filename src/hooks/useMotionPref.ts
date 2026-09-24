"use client";

import { useEffect } from "react";

/**
 * The site's own motion switch, remembered across visits.
 *
 * `prefers-reduced-motion` is the right default and stays authoritative: when the OS asks for
 * less motion, the switch cannot turn it back on. But it is a setting most people never find,
 * and this site now moves a great deal — the corridor, the sand, the reels, the type. WCAG
 * 2.2.2 asks that anything moving on its own for more than five seconds can be paused by the
 * visitor, on the page, without leaving it. This is that control.
 *
 * Off means exactly what reduced motion means everywhere else here: the loops stop rather
 * than hide, the reels wait for a pointer, and a cut is still a cut, just a short one.
 */
export const MOTION_KEY = "hourglass:motion";

/** Whether the visitor switched motion off on an earlier visit. Read after mount only. */
export function readMotionOff(): boolean {
  try {
    return window.localStorage.getItem(MOTION_KEY) === "off";
  } catch {
    return false;
  }
}

export function useStoredMotion(off: boolean, ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    try {
      if (off) window.localStorage.setItem(MOTION_KEY, "off");
      else window.localStorage.removeItem(MOTION_KEY);
    } catch {
      /* private mode: the switch still works for this visit */
    }
  }, [off, ready]);
}
