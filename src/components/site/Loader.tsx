"use client";

import { useEffect, useRef, useState } from "react";
import { Txt } from "@/components/Txt";
import { UI } from "@/data/ui";

const KEY = "portfolio:seen";
const MS = 1100;

/**
 * The opening: a counter runs to 100 while a line fills, then the whole sheet wipes upward
 * off the page. Once per session, never with reduced motion, and never in the way — the page
 * underneath is fully rendered and interactive the whole time, and the sheet takes no input.
 */
export function Loader() {
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const num = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const off = document.documentElement.dataset.motion === "off";
    if (seen || reduced || off) {
      const raf = requestAnimationFrame(() => setSkip(true));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / MS);
      const e = 1 - (1 - k) ** 3;
      if (num.current) num.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
      root.current?.style.setProperty("--lp", e.toFixed(3));
      if (k < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (skip) return null;
  return (
    <div className="loader" ref={root} data-done={done} aria-hidden="true">
      <div>
        <b ref={num}>000</b>
        <Txt v={UI.loading} as="p" className="label" />
      </div>
      <i className="bar" />
    </div>
  );
}
