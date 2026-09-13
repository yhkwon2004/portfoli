"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Re-render whoever is reading this when the OS preference changes mid-session. */
const subscribe = (onChange: () => void): (() => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;

/**
 * The static HTML is built once, long before any visitor's preference is known, so the server
 * snapshot has to be a fixed value. `false` is the safe one: it matches the markup, and the
 * client corrects it before any simulation starts.
 */
const getServerSnapshot = (): boolean => false;

/**
 * Whether the visitor has asked for reduced motion.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: a media query is exactly the
 * external, mutable source this API exists for. It reads the real value on the client's first
 * render instead of painting once with a guess and then correcting, it cannot tear under
 * concurrent rendering, and it keeps the initial read out of an effect body — which the
 * original one-off `matchMedia(...).matches` could not do, and which also never noticed a
 * visitor changing the setting while the page was open.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
