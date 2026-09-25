"use client";

import { useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { HourglassSim, sizeHourglassCanvas, type Telemetry } from "@/lib/sim/hourglass";
import { useElementSize } from "@/hooks/useElementSize";
import { useRafLoop } from "@/hooks/useRafLoop";

type Props = {
  /** 0 → first chapter, 1 → last. The sand level *is* the progress bar. */
  progress: number;
  animate: boolean;
  /** Bumped on every backward cut: the glass turns over. */
  flip?: number;
  /**
   * Called with a fresh reading a few times a second, for the telemetry block.
   *
   * Sampled rather than pushed every frame: the HUD renders React, and re-rendering it 60
   * times a second to move four digits would cost more than the whole simulation does.
   */
  onTelemetry?: (t: Telemetry) => void;
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
export function Hourglass({ progress, animate, flip = 0, onTelemetry }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef(new HourglassSim());
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { w, h } = useElementSize(wrapRef);
  const reportRef = useLatestRef(onTelemetry);
  /** Seconds until the next telemetry sample. */
  const sampleIn = useRef(0);

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
      // The loop is not running, so this is the only chance to report a reading.
      reportRef.current?.(simRef.current.telemetry());
    }
  }, [progress, animate, reportRef]);

  /*
   * The turn, when the reel runs backwards. Three of the classic principles in one second:
   * anticipation (it rocks the wrong way first, as a hand would before turning it), the turn
   * itself, and overshoot (it swings a few degrees past upright and settles back). A full
   * turn rather than a half: 360° is identical to 0°, so when the animation ends there is
   * nothing to snap back from.
   *
   * Driven by the Web Animations API rather than a CSS state, because the backward state on
   * the stage lasts 420 ms and this lasts 1.1 s — a keyframe keyed to that state would be cut
   * off mid-turn. An animation started here runs to its end regardless.
   */
  const firstFlip = useRef(flip);
  useEffect(() => {
    const el = innerRef.current;
    if (!el || !animate || flip === firstFlip.current) return;
    const anim = el.animate(
      [
        { rotate: "0deg", easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
        { rotate: "-16deg", offset: 0.16, easing: "cubic-bezier(0.5, 0, 0.2, 1)" },
        { rotate: "372deg", offset: 0.66, easing: "cubic-bezier(0.3, 0, 0.3, 1)" },
        { rotate: "360deg" },
      ],
      { duration: 1100 },
    );
    return () => anim.cancel();
  }, [flip, animate]);

  useRafLoop((dt) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    simRef.current.step(dt);
    simRef.current.draw(ctx);

    // ~8 Hz: fast enough that the digits look live, slow enough that the HUD's React tree is
    // not the most expensive thing on the page.
    sampleIn.current -= dt;
    if (sampleIn.current <= 0) {
      sampleIn.current = 0.125;
      reportRef.current?.(simRef.current.telemetry());
    }
  }, animate && w > 0 && h > 0);

  return (
    <div className="glass" ref={wrapRef} aria-hidden="true">
      <div className="glass-in" ref={innerRef}>
        <canvas ref={canvasRef} />
        <svg viewBox="0 0 200 300">
          <defs>
            {/* Two bright edges and a dim middle: the read of a curved glass wall. */}
            <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(210,225,255,.16)" />
              <stop offset="32%" stopColor="rgba(210,225,255,.02)" />
              <stop offset="62%" stopColor="rgba(210,225,255,.045)" />
              <stop offset="100%" stopColor="rgba(210,225,255,.13)" />
            </linearGradient>
          </defs>
          <path className="glass-body" d="M32 28 H168 L112 150 L168 272 H32 L88 150 Z" />
          {/* pathLength="1" normalises the outline, so the draw-on is one dash of length 1. */}
          <path className="glass-shell" pathLength={1} d="M32 28 H168 L112 150 L168 272 H32 L88 150 Z" />
          <line className="glass-cap" x1="24" y1="26" x2="176" y2="26" />
          <line className="glass-cap" x1="24" y1="274" x2="176" y2="274" />
        </svg>
      </div>
    </div>
  );
}
