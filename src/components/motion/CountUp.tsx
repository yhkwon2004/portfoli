"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/site/MotionContext";

type Props = {
  value: number;
  pad?: number;
  duration?: number;
  className?: string;
};

const fmt = (n: number, pad: number) => String(n).padStart(pad, "0");
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * A figure that counts up the first time it scrolls into view.
 *
 * It writes into the text node React rendered rather than through state — a roll is ~60
 * frames, and none of them should re-render anything. React never reads the node's contents,
 * and the roll always ends on exactly the string React wrote, so the two cannot disagree. The
 * static HTML, and every visitor with motion off, simply gets the number.
 */
export function CountUp({ value, pad = 0, duration = 1400, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const { motion } = useMotion();
  const final = fmt(value, pad);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild;
    if (!el || !node || !motion) return;
    let raf = 0;
    let done = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || done) return;
        done = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / duration);
          node.nodeValue = fmt(Math.round(value * easeOutExpo(k)), pad);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        node.nodeValue = fmt(0, pad);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      node.nodeValue = final;
    };
  }, [motion, value, pad, duration, final]);

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}
