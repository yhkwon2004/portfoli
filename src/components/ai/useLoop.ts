"use client";

import { useLayoutEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useRafLoop } from "@/hooks/useRafLoop";
import { REST, apply, collect, type Model } from "@/components/ai/bind";

type Options = {
  /** Run the loop. False parks the diagram at REST. */
  play: boolean;
  /** One run, in ms. */
  period: number;
  /** How many captioned beats one run is split into (the host lights one at a time). */
  steps: number;
  model: (p: number) => Model;
  /** Called each time a run completes — the chapter uses it to move to the next work. */
  onLoop?: () => void;
};

/**
 * Plays one diagram.
 *
 * The clock is the shared rAF loop's `dt`, accumulated — so it pauses with a hidden tab and
 * resumes where it stopped instead of jumping, and every run starts from 0 when `play` turns
 * on. Each frame it writes the diagram, and tells the nearest `[data-ai-host]` two things the
 * surrounding captions choreograph from:
 *
 *   `--lp`        the loop position, 0 → 1 (the step bars fill from it)
 *   `data-phase`  which beat is playing
 *
 * Stopping removes both, and the host's captions fall back to their resting state: every
 * beat shown, none singled out.
 */
export function useLoop(rootRef: React.RefObject<Element | null>, opts: Options): void {
  const { play, period, steps } = opts;
  const modelRef = useLatestRef(opts.model);
  const loopRef = useLatestRef(opts.onLoop);
  const clock = useRef(0);
  const phase = useRef(-1);
  /*
   * Whether the committed props say to play. The rAF loop is stopped by a passive effect, and
   * a frame can land between the commit that parks the diagram and that effect's cleanup —
   * which would draw one more frame of the run over the resting state and leave it there.
   */
  const playing = useRef(false);
  const nodes = useRef<Map<string, Element>>(new Map());
  const host = useRef<HTMLElement | null>(null);
  const tc = useRef<Element | null>(null);

  // Before paint, so a diagram never shows its finished frame for one frame and then snaps
  // back to the empty start of its run.
  useLayoutEffect(() => {
    playing.current = play;
    const root = rootRef.current;
    if (!root) return;
    nodes.current = collect(root);
    host.current = root.closest<HTMLElement>("[data-ai-host]");
    tc.current = root.querySelector(".av-tc");
    if (play) {
      clock.current = 0;
      phase.current = -1;
      apply(nodes.current, modelRef.current(0));
      return;
    }
    apply(nodes.current, modelRef.current(REST));
    host.current?.style.removeProperty("--lp");
    host.current?.removeAttribute("data-phase");
    if (tc.current) tc.current.textContent = "";
  }, [play, rootRef, modelRef]);

  useRafLoop((dt) => {
    if (!playing.current) return;
    clock.current += dt * 1000;
    if (clock.current >= period) {
      clock.current %= period;
      loopRef.current?.();
    }
    const p = clock.current / period;
    apply(nodes.current, modelRef.current(p));

    const h = host.current;
    if (h) {
      h.style.setProperty("--lp", p.toFixed(4));
      const k = Math.min(steps - 1, Math.floor(p * steps));
      if (k !== phase.current) {
        phase.current = k;
        h.setAttribute("data-phase", String(k));
      }
    }
    const t = tc.current;
    if (t) t.textContent = `T+${(clock.current / 1000).toFixed(1).padStart(4, "0")}s`;
  }, play);
}
