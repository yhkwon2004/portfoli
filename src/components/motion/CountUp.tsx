"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useCut, useSceneLive } from "@/components/motion/context";
import { easeOutExpo } from "@/lib/ease";

type Props = {
  value: number;
  /** Where the roll starts. Read at the moment the chapter goes live, not on every render. */
  from?: number;
  /** Zero-pad to this many digits, for figures that have to hold a column (`07`). */
  pad?: number;
  /** ms after the chapter goes live — matched to the element's own entrance. */
  delay?: number;
  duration?: number;
  className?: string;
};

const format = (n: number, pad: number): string => String(n).padStart(pad, "0");

/**
 * A figure that counts itself up when its chapter arrives.
 *
 * Written straight into the text node React already rendered, rather than through state: a
 * number rolling for 900 ms would otherwise be ~55 renders of whatever component holds it,
 * and the site's rule is that nothing re-renders React at frame rate. React owns the node and
 * never looks at its contents — it compares props — so as long as the roll finishes on
 * exactly the string React wrote, the two can never disagree. Cleanup writes the final value
 * back unconditionally, so an interrupted roll cannot leave a wrong figure behind.
 *
 * The static HTML carries the real figure, and so does every render: with JavaScript off, or
 * under reduced motion, or before the chapter is reached, the number is simply the number.
 */
export function CountUp({ value, from = 0, pad = 0, delay = 0, duration = 900, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const live = useSceneLive();
  const { motion, play } = useCut();
  const armed = motion && play && live;
  const final = format(value, pad);

  // `from` changes with every cut (the slate rolls from the previous chapter's number); the
  // roll should start from wherever it was when the chapter went live, so it is sampled then.
  const fromRef = useRef(from);
  useLayoutEffect(() => {
    fromRef.current = from;
  });

  // Park the figure at its start before the first paint of the entrance, so it never shows
  // the final value for a frame and then jumps back down to zero.
  useLayoutEffect(() => {
    const node = ref.current?.firstChild;
    if (!armed || !node || fromRef.current === value) return;
    node.nodeValue = format(fromRef.current, pad);
  }, [armed, value, pad]);

  useEffect(() => {
    const node = ref.current?.firstChild;
    if (!armed || !node) return;
    const a = fromRef.current;
    if (a === value) return;

    const start = performance.now() + delay;
    let shown = "";
    // performance.now() throughout, never rAF's timestamp: one clock for start and progress.
    let raf = requestAnimationFrame(function tick() {
      const t = Math.max(0, (performance.now() - start) / duration);
      if (t >= 1) {
        node.nodeValue = final;
        return;
      }
      const s = format(Math.round(a + (value - a) * easeOutExpo(t)), pad);
      // Only touch the DOM when the digit actually changes — most frames it does not.
      if (s !== shown) node.nodeValue = shown = s;
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      node.nodeValue = final;
    };
  }, [armed, value, pad, delay, duration, final]);

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}
