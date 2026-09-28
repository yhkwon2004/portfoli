"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotion } from "@/components/site/MotionContext";

/**
 * The picture that floats beside the pointer over an index — a typographic list that shows its
 * images only when asked. One element per list, moved on the compositor; it trails the pointer
 * on a short ease with motion on, and sits exactly under it with motion off.
 *
 * Only on a fine pointer: a touch screen has no hover, so there the rows carry a thumbnail
 * of their own instead (see works.css / awards.css).
 */
export function usePreview({ cert = false }: { cert?: boolean } = {}) {
  const { motion } = useMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, on: false, raf: 0 });
  const motionRef = useRef(motion);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    motionRef.current = motion;
  }, [motion]);

  useEffect(() => {
    const p = posRef.current;
    const step = () => {
      const k = motionRef.current ? 0.16 : 1;
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      boxRef.current?.style.setProperty("transform", `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`);
      p.raf = p.on || Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    tickRef.current = step;
    return () => cancelAnimationFrame(p.raf);
  }, []);

  const aim = (e: React.PointerEvent) => {
    const p = posRef.current;
    p.tx = e.clientX + 28;
    p.ty = e.clientY - 120;
  };

  const move = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    aim(e);
    const p = posRef.current;
    if (!p.raf) p.raf = requestAnimationFrame(tickRef.current);
  }, []);

  const show = useCallback((url: string | null, e: React.PointerEvent) => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (e.pointerType !== "mouse" || !url || !box || !img) return;
    const p = posRef.current;
    aim(e);
    if (!p.on) {
      // start where the pointer is, not where the preview was last left
      p.x = p.tx;
      p.y = p.ty;
    }
    p.on = true;
    if (img.getAttribute("src") !== url) img.src = url;
    box.dataset.on = "true";
    if (!p.raf) p.raf = requestAnimationFrame(tickRef.current);
  }, []);

  const hide = useCallback(() => {
    posRef.current.on = false;
    if (boxRef.current) boxRef.current.dataset.on = "false";
  }, []);

  const node = (
    <div className={`preview${cert ? " is-cert" : ""}`} ref={boxRef} data-on="false" aria-hidden="true">
      <img ref={imgRef} alt="" />
    </div>
  );

  return { node, move, show, hide };
}
