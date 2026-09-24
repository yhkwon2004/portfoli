"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAST } from "@/data/chapters";
import { useLatestRef } from "@/hooks/useLatestRef";

/** How long a cut takes before another one is accepted. Matches the CSS transition budget. */
const CUT_MS = 620;
/** The glass spins for this long when stepping backwards. */
const REVERSE_MS = 420;
/**
 * How long the outgoing chapter keeps its "leaving" state — long enough for its exit to play
 * out, and deliberately shorter than CUT_MS. Because no new cut can land before CUT_MS, the
 * leaving state has always cleared by the time a chapter could be re-entered, so a chapter
 * never goes straight from leaving to live and skips its own entrance.
 */
const OUT_MS = 560;
/** Wheel events arrive in bursts; one cut per burst. */
const WHEEL_LOCK_MS = 720;
/** Trackpads emit tiny deltas continuously — below this it is not a gesture. */
const WHEEL_MIN_DELTA = 8;
/** Swipe distance that counts as a page turn. */
const SWIPE_PX = 56;

/** 1 forward, −1 back. */
export type Dir = 1 | -1;

export type Bump = {
  /** Bumped on every refusal, so an effect can replay the recoil per attempt. */
  readonly n: number;
  readonly dir: Dir;
};

export type SceneMachine = {
  readonly chapter: number;
  /** The chapter currently playing its exit, or −1 once it has cleared. */
  readonly prev: number;
  /** Direction of the most recent cut. Persists after the cut, unlike `reversing`. */
  readonly dir: Dir;
  readonly reversing: boolean;
  /** Bumped on every cut, so effects that must re-fire per cut can depend on it. */
  readonly cut: number;
  /** A push against either end of the reel — answered with a recoil rather than silence. */
  readonly bump: Bump;
  /** Counts backward cuts only. The glass turns over once per increment. */
  readonly turns: number;
  readonly go: (to: number, reverse?: boolean) => void;
};

export type MachineOptions = {
  /**
   * Called when the visitor's own wheel, key or swipe is about to move the reel — so a caller
   * running the reel on its own (the PLAY mode) can yield to the hand on the controls, from
   * the input event itself rather than by inspecting cuts after the fact.
   */
  readonly onInput?: () => void;
};

/**
 * The projector. Owns which chapter is live and every way a visitor can change it: wheel,
 * keyboard, buttons, the chapter rail and touch.
 *
 * `blocked` is a predicate rather than a boolean so the dossier can suspend navigation
 * without this hook knowing the dossier exists — while the sheet is open the wheel has to
 * scroll it, and the arrow keys have to step records instead of chapters.
 *
 * It also keeps the two facts every transition needs and the original never tracked: which
 * way the reel moved, and which chapter is on its way out. Without them a cut can only fade
 * — the outgoing frame has no exit to play and nothing knows whether to enter from above or
 * below.
 */
export function useSceneMachine(
  blocked: () => boolean,
  { onInput }: MachineOptions = {},
  initial = 0,
): SceneMachine {
  const [chapter, setChapter] = useState(initial);
  const [prev, setPrev] = useState(-1);
  const [dir, setDir] = useState<Dir>(1);
  const [reversing, setReversing] = useState(false);
  const [cut, setCut] = useState(0);
  const [bump, setBump] = useState<Bump>({ n: 0, dir: 1 });
  const [turns, setTurns] = useState(0);

  const busyRef = useRef(false);
  const outTimer = useRef(0);
  // `go` reads the current chapter from window listeners registered once, so it needs the
  // latest value rather than the one captured when the listener was created.
  const chapterRef = useLatestRef(chapter);
  const blockedRef = useLatestRef(blocked);
  const inputRef = useLatestRef(onInput);

  const go = useCallback((to: number, reverse = false) => {
    const next = Math.max(0, Math.min(LAST, to));
    // `busyRef` alone guards a double-fire inside one cut, so `go` never needs to write the
    // chapter back into the ref — the effect in useLatestRef does that on commit.
    if (busyRef.current) return;
    if (next === chapterRef.current) {
      // Asked to go past either end. A dead key reads as a broken control; a small recoil
      // says "this is the edge" in the same language as everything else that moves.
      if (to !== next) setBump((b) => ({ n: b.n + 1, dir: to > next ? 1 : -1 }));
      return;
    }

    const back = reverse || next < chapterRef.current;
    busyRef.current = true;

    setPrev(chapterRef.current);
    setChapter(next);
    setDir(back ? -1 : 1);
    setCut((n) => n + 1);
    if (back) {
      setReversing(true);
      setTurns((n) => n + 1);
    }

    window.clearTimeout(outTimer.current);
    outTimer.current = window.setTimeout(() => setPrev(-1), OUT_MS);
    window.setTimeout(() => {
      busyRef.current = false;
    }, CUT_MS);
    if (back) window.setTimeout(() => setReversing(false), REVERSE_MS);
  }, [chapterRef]);

  /** A step from the visitor's own hand: yield any autoplay first, then move. */
  const step = useCallback(
    (to: number) => {
      inputRef.current?.();
      go(to);
    },
    [go, inputRef],
  );

  useEffect(() => () => window.clearTimeout(outTimer.current), []);

  // ── wheel ──
  useEffect(() => {
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (blockedRef.current()) return; // let the dossier sheet scroll itself
      e.preventDefault();
      const now = Date.now();
      if (now - lock < WHEEL_LOCK_MS || Math.abs(e.deltaY) < WHEEL_MIN_DELTA) return;
      lock = now;
      step(chapterRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    // `passive: false` is required to call preventDefault on wheel.
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step, blockedRef, chapterRef]);

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
          step(chapterRef.current + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          step(chapterRef.current - 1);
          break;
        case "Home":
          e.preventDefault();
          step(0);
          break;
        case "End":
          e.preventDefault();
          step(LAST);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, blockedRef, chapterRef]);

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
        if (Math.abs(dy) > SWIPE_PX) step(chapterRef.current + (dy > 0 ? 1 : -1));
      }
      startY = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [step, blockedRef, chapterRef]);

  return { chapter, prev, dir, reversing, cut, bump, turns, go };
}
