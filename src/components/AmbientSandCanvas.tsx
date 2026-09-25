"use client";

import { useEffect, useRef } from "react";
import { AmbientSand, sizeAmbientCanvas } from "@/lib/sim/ambient";
import { useElementSize } from "@/hooks/useElementSize";
import { useRafLoop } from "@/hooks/useRafLoop";

type Props = {
  /** Bumped on each chapter cut; every change scatters the field. */
  cut: number;
  /** Direction of that cut: forward is a warp outward, back sends the sand rising. */
  dir?: 1 | -1;
  /** False under reduced motion — the field is then drawn once and left alone. */
  animate: boolean;
};

/**
 * The ambient sand behind every scene. Decorative, so `aria-hidden`.
 *
 * Under `prefers-reduced-motion` the CSS hides this canvas outright, but we also stop the
 * loop rather than animate something invisible.
 */
export function AmbientSandCanvas({ cut, dir = 1, animate }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const simRef = useRef(new AmbientSand());
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { w, h } = useElementSize(ref);

  // Re-size the backing store and re-seed the field whenever the box changes.
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !w || !h) return;
    const sized = sizeAmbientCanvas(canvas);
    if (!sized) return;
    ctxRef.current = sized.ctx;
    simRef.current.resize(sized.w, sized.h);
    // Paint one frame immediately so a resize never leaves an empty canvas for a beat.
    simRef.current.draw(sized.ctx);
  }, [w, h]);

  // Nothing has cut on first render, so hold the initial value and only burst on a change.
  const firstCut = useRef(cut);
  useEffect(() => {
    if (cut !== firstCut.current) simRef.current.burst(dir);
    // `dir` lands in the same commit as `cut`; one burst per cut, in that cut's direction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cut]);

  useRafLoop((dt) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    simRef.current.step(dt);
    simRef.current.draw(ctx);
  }, animate && w > 0 && h > 0);

  return <canvas ref={ref} className="sand-canvas" aria-hidden="true" />;
}
