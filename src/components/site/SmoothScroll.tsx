"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMotion } from "@/components/site/MotionContext";

/**
 * Inertial scrolling, and the scroll-progress bar across the top edge.
 *
 * Lenis eases the document's real scroll position, so the page keeps native scrolling
 * semantics — keyboard, find-in-page, anchors, the scrollbar — while wheel input glides.
 * It only runs with motion on; with motion off the browser scrolls exactly as it would have.
 *
 * The instance is exposed on `window.__lenis` for the two callers that need to drive it
 * (anchor navigation, and the record sheet, which stops it while open).
 */
export function SmoothScroll() {
  const { motion } = useMotion();

  useEffect(() => {
    if (!motion) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [motion]);

  // The progress bar: one CSS variable, written per scroll frame.
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".progress");
    if (!bar) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--sp", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    write();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="progress" aria-hidden="true" />;
}
