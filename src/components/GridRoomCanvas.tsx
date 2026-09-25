"use client";

import { useEffect, useRef } from "react";
import { GridRoom, sizeGridCanvas, type GridTheme } from "@/lib/sim/grid";
import { useElementSize } from "@/hooks/useElementSize";
import { useRafLoop } from "@/hooks/useRafLoop";
import type { Bump, Dir } from "@/hooks/useSceneMachine";
import { pointer } from "@/lib/pointer";

type Props = {
  /** 0 → first chapter, 1 → last. Slides the corridor sideways as the reel advances. */
  progress: number;
  /** Direction of the last cut: forward rushes the corridor at the camera, back rewinds it. */
  dir?: Dir;
  /** A push past either end of the reel; the corridor recoils. */
  bump?: Bump;
  animate: boolean;
};

/**
 * Depth colours. Far lines sit in the navy of the room itself; near lines pick up the accent,
 * so the corridor reads as lit from where the viewer is standing.
 */
const THEME: GridTheme = { far: "#1b2447", near: "#4361ff" };

/**
 * The wireframe room behind every scene. Decorative, so `aria-hidden`.
 *
 * Under reduced motion the loop never starts and the room is drawn once — still a corridor,
 * just not a moving one, which is the right reading of "reduce" for a background whose whole
 * job is depth rather than incident.
 */
export function GridRoomCanvas({ progress, dir = 1, bump, animate }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef(new GridRoom());
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { w, h } = useElementSize(ref);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !w || !h) return;
    const sized = sizeGridCanvas(canvas);
    if (!sized) return;
    ctxRef.current = sized.ctx;
    roomRef.current.resize(sized.w, sized.h);
    roomRef.current.draw(sized.ctx, THEME);
  }, [w, h]);

  useEffect(() => {
    roomRef.current.aim(progress, dir);
    // Reduced motion never steps, so aim would otherwise not take effect until a resize.
    if (!animate) {
      const ctx = ctxRef.current;
      if (ctx) {
        roomRef.current.step(0.5);
        roomRef.current.draw(ctx, THEME);
      }
    }
    // `dir` changes in the same commit as `progress` on every cut; reading it here rather than
    // listing it keeps the aim to one call per cut.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, animate]);

  const bumpN = bump?.n ?? 0;
  const bumpDir = bump?.dir ?? 1;
  useEffect(() => {
    if (bumpN > 0 && animate) roomRef.current.recoil(bumpDir);
  }, [bumpN, bumpDir, animate]);

  useRafLoop((dt) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    roomRef.current.look(pointer.lx, pointer.ly);
    roomRef.current.step(dt);
    roomRef.current.draw(ctx, THEME);
  }, animate && w > 0 && h > 0);

  return <canvas ref={ref} className="grid-room" aria-hidden="true" />;
}
