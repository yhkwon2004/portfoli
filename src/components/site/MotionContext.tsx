"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The one motion gate.
 *
 * `motion` is false under the OS's reduced-motion setting, with the site's own MOTION switch
 * off, and before the page has hydrated. Every scripted effect — the 3D scenes, the smooth
 * scroll, the cursor, the counters — reads this and nothing else, so there is exactly one
 * place that decides whether anything moves by itself. The same state is mirrored onto
 * <html data-motion> for the stylesheet.
 *
 * The switch exists for WCAG 2.2.2: the hero field, the case-study scenes and the marquees
 * all move on their own, and a visitor must be able to stop them without leaving the page.
 */
type MotionState = {
  readonly motion: boolean;
  /** The OS asked for reduced motion; the switch cannot override it. */
  readonly locked: boolean;
  readonly toggle: () => void;
};

const KEY = "portfolio:motion";

const MotionContext = createContext<MotionState>({ motion: false, locked: false, toggle: () => {} });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [off, setOff] = useState(false);
  const [ready, setReady] = useState(false);

  // Read the stored choice after mount — localStorage during render would split the static
  // HTML from the first client render.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        setOff(window.localStorage.getItem(KEY) === "off");
      } catch {
        /* private mode */
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const motion = ready && !reduced && !off;

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  const toggle = useCallback(() => {
    setOff((v) => {
      const next = !v;
      try {
        if (next) window.localStorage.setItem(KEY, "off");
        else window.localStorage.removeItem(KEY);
      } catch {
        /* the switch still works for this visit */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ motion, locked: reduced, toggle }), [motion, reduced, toggle]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = (): MotionState => useContext(MotionContext);
