"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * A ref that always holds the most recent value, for reading from callbacks that outlive the
 * render they were created in — window listeners, intervals, rAF loops.
 *
 * The assignment happens in an effect rather than during render. Writing `ref.current = value`
 * in the render body is the familiar shorthand, but it mutates during render, which breaks
 * under concurrent rendering: React may render a component without committing it, and the ref
 * would then hold a value that was never shown. (React's own lint rule, `react-hooks/refs`,
 * flags exactly this.) Committing the write to an effect ties the ref to what is actually on
 * screen.
 *
 * The one-commit lag this introduces is not observable here: every reader is an event handler
 * or a timer callback, and those only run after the commit that the effect belongs to.
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
