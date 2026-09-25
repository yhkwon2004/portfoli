"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/site/MotionContext";

/**
 * The pointer layer: a custom cursor, magnetic buttons, spotlight borders and card tilt.
 *
 * All four are driven from one pointermove listener on the document and one rAF loop, rather
 * than a handler on every card. Elements opt in with attributes:
 *
 *   data-magnetic       leans toward the pointer (buttons, the nav pill)
 *   .spot               its border lights where the pointer is (--mx / --my)
 *   data-tilt           rotates in 3D under the pointer
 *   data-cursor="VIEW"  the ring grows and reads a label while over it
 *
 * Only for a fine pointer with motion on. A touch device has no hover, and with motion off
 * the native cursor stays and nothing leans or tilts.
 */
export function Cursor() {
  const { motion } = useMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const root = document.documentElement;

    // Spotlight borders work for any pointer and cost nothing when idle — keep them always.
    const onSpot = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onSpot, { passive: true });

    if (!motion || !fine) {
      root.dataset.cursor = "off";
      return () => document.removeEventListener("pointermove", onSpot);
    }

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let seen = false;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const release = (el: HTMLElement | null, kind: "magnet" | "tilt") => {
      if (!el) return;
      if (kind === "magnet") {
        el.style.removeProperty("--mgx");
        el.style.removeProperty("--mgy");
      } else {
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
        root.dataset.cursor = "on";
      }
      const t = e.target as Element | null;

      const m = t?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) {
        release(magnet, "magnet");
        magnet = m;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const k = Number(magnet.dataset.magnetic) || 0.3;
        magnet.style.setProperty("--mgx", `${((x - (r.left + r.width / 2)) * k).toFixed(1)}px`);
        magnet.style.setProperty("--mgy", `${((y - (r.top + r.height / 2)) * k).toFixed(1)}px`);
      }

      const tl = t?.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (tl !== tilt) {
        release(tilt, "tilt");
        tilt = tl;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        tilt.style.setProperty("--rx", `${(((y - r.top) / r.height - 0.5) * -8).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(((x - r.left) / r.width - 0.5) * 10).toFixed(2)}deg`);
      }

      const ringEl = ring.current;
      if (ringEl) {
        const lab = t?.closest?.<HTMLElement>("[data-cursor]")?.dataset.cursor;
        const hot = t?.closest?.("a, button, [role='button'], input, label");
        ringEl.dataset.state = lab ? "label" : hot ? "hover" : "";
        if (label.current) label.current.textContent = lab ?? "";
      }
    };

    const onLeave = () => {
      root.dataset.cursor = "off";
      seen = false;
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onSpot);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      release(magnet, "magnet");
      release(tilt, "tilt");
      root.dataset.cursor = "off";
    };
  }, [motion]);

  return (
    <>
      <div className="cursor" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
    </>
  );
}
