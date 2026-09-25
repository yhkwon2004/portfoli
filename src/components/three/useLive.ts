"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/site/MotionContext";
import { createDrive, hasWebGL, type Drive } from "@/components/three/core";

export type StageMode = "poster" | "video" | "3d";

/**
 * Everything a section with a live 3D stage needs, in one hook.
 *
 *   drive   the (p, t) object the scene reads; the caller sets `drive.target` from scroll
 *   active  whether the stage is near the viewport — off-screen stages stop drawing
 *   mode    what the stage can afford to be:
 *             3d      motion on, WebGL present, a wide enough screen
 *             video   motion on but a phone or no WebGL: the pre-rendered loop instead
 *             poster  motion off: one still frame, nothing moving
 *
 * The server always renders the poster; the mode is decided after mount, so the static HTML
 * and the first client render agree.
 */
export function useLive(
  ref: React.RefObject<HTMLElement | null>,
  opts: { mobile3d?: boolean } = {},
): { drive: Drive; active: boolean; mode: StageMode; lite: boolean } {
  const { motion } = useMotion();
  const drive = useRef<Drive>(createDrive()).current;
  const [active, setActive] = useState(false);
  const [env, setEnv] = useState<{ webgl: boolean; narrow: boolean } | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setEnv({ webgl: hasWebGL(), narrow: window.matchMedia("(max-width: 860px)").matches }),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(!!e?.isIntersecting), { rootMargin: "25% 0px 25% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  // The pointer, normalised over the stage; parked far away when it leaves.
  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      drive.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      drive.my = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const leave = () => {
      drive.mx = 9;
      drive.my = 9;
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, motion, drive]);

  const mode: StageMode = !env || !motion ? "poster" : env.webgl && (!env.narrow || opts.mobile3d) ? "3d" : "video";
  return { drive, active, mode, lite: !!env?.narrow };
}
