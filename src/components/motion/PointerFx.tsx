"use client";

import { useEffect, useRef } from "react";
import { follow } from "@/lib/ease";
import { pointer } from "@/lib/pointer";

type Props = {
  /** The motion gate. Off, nothing listens and nothing is drawn. */
  enabled: boolean;
  /** Changes on every cut, so the new chapter's ghost picks up the current offset at once. */
  chapter: number;
};

/**
 * Controls the reticle locks onto, and the word it shows while locked. First match wins, so
 * the specific entries come before the catch-alls.
 */
const TARGETS: readonly (readonly [string, string])[] = [
  [".cell, .pick, .fimg, .plate-near, .chip, .wtick", "OPEN"],
  [".chapters button", "GO"],
  [".nav-btns button, .wstep, .dossier .steps button", "STEP"],
  [".lang button", "LANG"],
  [".contact-pill", "CONTACT"],
  [".tel-reset", "RESET"],
  [".playbtn", "PLAY"],
  [".motionsw", "MOTION"],
  ["a[href]", "LINK ↗"],
  ["button:not([disabled])", ""],
];
/** One selector for "is this something the reticle should lock onto at all". */
const HOT = TARGETS.map(([s]) => s).join(", ");
/** Full-frame click-catchers are buttons too, but locking a reticle onto the whole screen says nothing. */
const NEVER = ".contact-scrim";

/** Controls that lean toward the pointer. Small, isolated targets only — never a tile in a grid. */
const MAGNETIC = ".nav-btns button, .contact-pill, .s-projects .wstep, .links a, .links button, .playbtn, .motionsw";
/** How far a magnetic control follows the pointer: a fraction of the offset, capped. */
const PULL = 0.3;
const PULL_MAX = 7;

/** The reticle at rest: a small square around the pointer. */
const REST = 18;
/** Clearance between a locked reticle and the edge of its target. */
const PAD = 5;

/**
 * Everything the pointer drives, in one loop.
 *
 *  · **The reticle.** A registration-mark frame that trails the pointer, and — over anything
 *    that can be pressed — leaves the pointer and locks onto the control itself, resizing to
 *    frame it with a small label: target acquisition, in the instrument language the rest of
 *    the frame speaks. The native cursor stays; this is a readout, not a replacement.
 *  · **Magnetic controls.** The few free-standing buttons lean toward the pointer as it
 *    approaches, so they feel reachable rather than static.
 *  · **Parallax.** A smoothed, normalised offset written onto the ghost word, the glass and
 *    the wash — three depths, three strengths, set in the stylesheet — and published to
 *    `pointer` for the wireframe room, which reads it in its own loop.
 *
 * The loop only runs while something is still moving and parks itself once everything has
 * converged, so an idle pointer costs nothing. Fine pointers only: on touch there is no hover
 * to acquire, and a reticle that jumps to wherever a finger lands is noise.
 */
export function PointerFx({ enabled, chapter }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLElement>(null);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const box = boxRef.current;
    const label = labelRef.current;
    if (!enabled || !box || !label) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let prev = 0;
    let hot: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    let idleSince = 0;
    // The reticle's current frame, eased toward its target each frame.
    const cur = { x: -100, y: -100, w: REST, h: REST };
    let placed = false;

    const targetFrame = () => {
      if (hot && hot.isConnected) {
        const r = hot.getBoundingClientRect();
        return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 };
      }
      return { x: pointer.x - REST / 2, y: pointer.y - REST / 2, w: REST, h: REST };
    };

    const layers = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>('.scene[data-live="true"] .ghost, .glass, .wash'));

    /** Lock onto whatever pressable thing is under `el`, or release. */
    const retarget = (el: Element | null) => {
      const found = el?.closest<HTMLElement>(HOT) ?? null;
      const next = found && !found.matches(NEVER) ? found : null;
      if (next === hot) return;
      hot = next;
      const word = next ? (TARGETS.find(([s]) => next.matches(s))?.[1] ?? "") : "";
      box.dataset.hot = next ? "true" : "false";
      label.textContent = word;
    };

    const frame = (now: number) => {
      const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 0.016;
      prev = now;

      // What is under a still pointer can change — a sheet opens over the tile, a reel turns
      // under it — so while the loop is awake it re-reads the element under the pointer
      // rather than trusting the last move.
      if (pointer.inside) retarget(document.elementFromPoint(pointer.x, pointer.y));

      // Reticle: quick to follow, a touch slower when it has a target to settle onto.
      const t = targetFrame();
      if (!placed) {
        Object.assign(cur, t);
        placed = true;
      }
      const k = follow(hot ? 0.26 : 0.34, dt);
      cur.x += (t.x - cur.x) * k;
      cur.y += (t.y - cur.y) * k;
      cur.w += (t.w - cur.w) * k;
      cur.h += (t.h - cur.h) * k;
      box.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
      box.style.width = `${cur.w.toFixed(1)}px`;
      box.style.height = `${cur.h.toFixed(1)}px`;

      // Parallax: slow, heavy smoothing — a room turning, not a sticker following the mouse.
      const tx = pointer.inside ? (pointer.x / window.innerWidth) * 2 - 1 : 0;
      const ty = pointer.inside ? (pointer.y / window.innerHeight) * 2 - 1 : 0;
      const p = follow(0.07, dt);
      pointer.lx += (tx - pointer.lx) * p;
      pointer.ly += (ty - pointer.ly) * p;
      for (const el of layers()) {
        el.style.setProperty("--lx", pointer.lx.toFixed(4));
        el.style.setProperty("--ly", pointer.ly.toFixed(4));
      }

      const settled =
        Math.abs(t.x - cur.x) + Math.abs(t.y - cur.y) + Math.abs(t.w - cur.w) + Math.abs(t.h - cur.h) < 0.4 &&
        Math.abs(tx - pointer.lx) + Math.abs(ty - pointer.ly) < 0.002;
      if (settled && now - idleSince > 900) {
        raf = 0;
        prev = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      idleSince = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick.current = wake;

    const release = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.inside) {
        pointer.inside = true;
        box.dataset.on = "true";
      }

      const el = e.target instanceof Element ? e.target : null;
      retarget(el);

      const m = el?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = Math.max(-PULL_MAX, Math.min(PULL_MAX, (e.clientX - (r.left + r.width / 2)) * PULL));
        const dy = Math.max(-PULL_MAX, Math.min(PULL_MAX, (e.clientY - (r.top + r.height / 2)) * PULL));
        m.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      }
      wake();
    };

    const onLeave = () => {
      pointer.inside = false;
      hot = null;
      box.dataset.on = "false";
      box.dataset.hot = "false";
      release();
      wake();
    };
    const onDown = () => {
      box.dataset.down = "true";
    };
    // A press is often followed by something opening under the pointer; stay awake to see it.
    const onUp = () => {
      box.dataset.down = "false";
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    // Content under a still pointer can move (a reel turns, a chapter cuts); keep locked.
    window.addEventListener("resize", wake);

    return () => {
      cancelAnimationFrame(raf);
      release();
      kick.current = () => {};
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", wake);
      box.dataset.on = "false";
      pointer.inside = false;
      pointer.lx = pointer.ly = 0;
      for (const el of layers()) {
        el.style.removeProperty("--lx");
        el.style.removeProperty("--ly");
      }
    };
  }, [enabled]);

  // A cut swaps which ghost is live; hand the new one the current offset straight away.
  useEffect(() => {
    kick.current();
  }, [chapter]);

  return (
    <div className="reticle" ref={boxRef} data-on="false" data-hot="false" aria-hidden="true">
      <b className="reticle-label" ref={labelRef} />
    </div>
  );
}
