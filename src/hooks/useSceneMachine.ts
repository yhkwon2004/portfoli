"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAST } from "@/data/chapters";
import { useLatestRef } from "@/hooks/useLatestRef";

/** How long a cut takes before another one is accepted. Matches the CSS transition budget. */
const CUT_MS = 620;
/** The glass spins for this long when stepping backwards. */
const REVERSE_MS = 420;
/** Wheel events arrive in bursts; one cut per burst. */
const WHEEL_LOCK_MS = 720;
/** Trackpads emit tiny deltas continuously — below this it is not a gesture. */
const WHEEL_MIN_DELTA = 8;
/** Swipe distance that counts as a page turn. */
const SWIPE_PX = 56;

export type SceneMachine = {
  readonly chapter: number;
  readonly reversing: boolean;
  /** Bumped on every cut, so effects that must re-fire per cut can depend on it. */
  readonly cut: number;
  readonly go: (to: number, reverse?: boolean) => void;
};

/**
 * The projector. Owns which chapter is live and every way a visitor can change it: wheel,
 * keyboard, buttons, the chapter rail and touch.
 *
 * `blocked` is a predicate rather than a boolean so the dossier can suspend navigation
 * without this hook knowing the dossier exists — while the sheet is open the wheel has to
 * scroll it, and the arrow keys have to step records instead of chapters.
 */
export function useSceneMachine(blocked: () => boolean, initial = 0): SceneMachine {
  const [chapter, setChapter] = useState(initial);
  const [reversing, setReversing] = useState(false);
  const [cut, setCut] = useState(0);

  const busyRef = useRef(false);
  // `go` reads the current chapter from window listeners registered once, so it needs the
  // latest value rather than the one captured when the listener was created.
  const chapterRef = useLatestRef(chapter);
  const blockedRef = useLatestRef(blocked);

  const go = useCallback((to: number, reverse = false) => {
    const next = Math.max(0, Math.min(LAST, to));
    // `busyRef` alone guards a double-fire inside one cut, so `go` never needs to write the
    // chapter back into the ref — the effect in useLatestRef does that on commit.
    if (next === chapterRef.current || busyRef.current) return;

    const back = reverse || next < chapterRef.current;
    busyRef.current = true;

    setChapter(next);
    setCut((n) => n + 1);
    if (back) setReversing(true);

    window.setTimeout(() => {
      busyRef.current = false;
    }, CUT_MS);
    if (back) window.setTimeout(() => setReversing(false), REVERSE_MS);
  }, [chapterRef]);

  // ── wheel ──
  useEffect(() => {
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (blockedRef.current()) return; // let the dossier sheet scroll itself
      e.preventDefault();
      const now = Date.now();
      if (now - lock < WHEEL_LOCK_MS || Math.abs(e.deltaY) < WHEEL_MIN_DELTA) return;
      lock = now;
      go(chapterRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    // `passive: false` is required to call preventDefault on wheel.
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [go, blockedRef, chapterRef]);

  // ── keyboard ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (blockedRef.current()) return;
      // Never hijack a key someone is using to type or to operate a control.
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName ?? "")) return;
      // Space and the arrows must still work the button they are focused on.
      if (e.key === " " && el?.tagName === "BUTTON") return;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(chapterRef.current + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(chapterRef.current - 1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(LAST);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, blockedRef, chapterRef]);

  // ── touch ──
  useEffect(() => {
    let startY: number | null = null;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? null;
    };
    const onEnd = (e: TouchEvent) => {
      if (startY === null || blockedRef.current()) {
        startY = null;
        return;
      }
      const endY = e.changedTouches[0]?.clientY;
      if (endY !== undefined) {
        const dy = startY - endY;
        if (Math.abs(dy) > SWIPE_PX) go(chapterRef.current + (dy > 0 ? 1 : -1));
      }
      startY = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [go, blockedRef, chapterRef]);

  return { chapter, reversing, cut, go };
}
