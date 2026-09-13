"use client";

import { useEffect, useRef } from "react";
import { HourglassSim, sizeHourglassCanvas } from "@/lib/sim/hourglass";
import { useElementSize } from "@/hooks/useElementSize";
import { useRafLoop } from "@/hooks/useRafLoop";

type Props = {
  /** 0 → first chapter, 1 → last. The sand level *is* the progress bar. */
  progress: number;
  animate: boolean;
};

/**
 * The hourglass: progress meter, transition device and mascot.
 *
 * The SVG supplies only the vessel — outline, caps and the glass sheen. Everything inside it
 * is simulated per frame on the canvas underneath (src/lib/sim/hourglass.ts).
 *
 * Decorative to a screen reader: the same progress is stated in words by the chapter live
 * region and the chapter rail, so announcing a sand level here would only be noise.
 */
export function Hourglass({ progress, animate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef(new HourglassSim());
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { w, h } = useElementSize(wrapRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !w || !h) return;
    const ctx = sizeHourglassCanvas(canvas);
    if (!ctx) return;
    ctxRef.current = ctx;
    simRef.current.draw(ctx);
  }, [w, h]);

  // Aim the pour at the new chapter. Under reduced motion, jump the level instead of pouring.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (animate) {
      simRef.current.pourTo(progress);
    } else {
      simRef.current.settleTo(progress);
      if (ctx) simRef.current.draw(ctx);
    }
  }, [progress, animate]);

  useRafLoop((dt) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    simRef.current.step(dt);
    simRef.current.draw(ctx);
  }, animate && w > 0 && h > 0);

  return (
    <div className="glass" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <svg viewBox="0 0 200 300">
        <defs>
          {/* Two bright edges and a dim middle: the read of a curved glass wall. */}
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,.13)" />
            <stop offset="32%" stopColor="rgba(255,255,255,.015)" />
            <stop offset="62%" stopColor="rgba(255,255,255,.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,.10)" />
          </linearGradient>
        </defs>
        <path className="glass-body" d="M32 28 H168 L112 150 L168 272 H32 L88 150 Z" />
        <path className="glass-shell" d="M32 28 H168 L112 150 L168 272 H32 L88 150 Z" />
        <line className="glass-cap" x1="24" y1="26" x2="176" y2="26" />
        <line className="glass-cap" x1="24" y1="274" x2="176" y2="274" />
      </svg>
    </div>
  );
}
