"use client";

import { useEffect, type RefObject } from "react";

type Options = {
  /** Which children the field acts on. */
  readonly selector: string;
  /** Distance, in CSS px, at which the field has fallen to nothing. */
  readonly radius: number;
  /** The motion gate. Off, no listener is attached and every child rests at 0. */
  readonly active: boolean;
};

/**
 * A falloff field under the pointer — the effector of a motion-graphics package.
 *
 * In Cinema 4D's MoGraph a spherical falloff moves over a grid of clones and each clone
 * responds by its distance from the centre: full strength inside, nothing past the radius,
 * a smooth ramp between. This is that, over real DOM children. Each child gets `--fx`, 0…1,
 * and the stylesheet decides what the field *does* — swell and lift on the award wall, grow
 * like a waveform on the works scale. The field only ever writes one number per child.
 *
 * Centres are measured from layout (`offsetLeft`/`offsetTop`), not from the painted box, so
 * the field is unaffected by the entrance animations and by its own scaling. They are
 * re-measured each time the pointer enters, which covers resizes and reflows without a
 * ResizeObserver per tile. Writes are coalesced to one per frame, and a child whose value has
 * not changed is not touched. Fine pointers only.
 */
export function useFalloff(ref: RefObject<HTMLElement | null>, { selector, radius, active }: Options): void {
  useEffect(() => {
    const root = ref.current;
    if (!root || !active) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    type Probe = { el: HTMLElement; x: number; y: number; fx: number };
    let probes: Probe[] = [];
    let raf = 0;
    let px = 0;
    let py = 0;

    const measure = () => {
      const base = root.getBoundingClientRect();
      probes = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => ({
        el,
        x: base.left + el.offsetLeft + el.offsetWidth / 2,
        y: base.top + el.offsetTop + el.offsetHeight / 2,
        fx: 0,
      }));
    };

    const apply = () => {
      raf = 0;
      for (const p of probes) {
        const d = Math.hypot(px - p.x, py - p.y);
        const t = Math.max(0, 1 - d / radius);
        // Smoothstep, so the edge of the field has no visible rim.
        const fx = Math.round(t * t * (3 - 2 * t) * 1000) / 1000;
        if (fx !== p.fx) {
          p.fx = fx;
          p.el.style.setProperty("--fx", String(fx));
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      // The pointer can already be inside when the wall goes live, with no enter to measure on.
      if (probes.length === 0) measure();
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onEnter = (e: PointerEvent) => {
      measure();
      onMove(e);
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      for (const p of probes) {
        p.fx = 0;
        p.el.style.setProperty("--fx", "0");
      }
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [ref, selector, radius, active]);
}
