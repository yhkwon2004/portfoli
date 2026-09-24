"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AiVisual } from "@/components/ai/AiVisual";
import { Txt } from "@/components/Txt";
import { CountUp } from "@/components/motion/CountUp";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { riseAt } from "@/components/motion/timing";
import { Scene } from "@/components/scenes/Scene";
import { useLang } from "@/components/LangProvider";
import { topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { text } from "@/lib/i18n";
import { aiWorks } from "@/lib/select";
import type { Honor } from "@/lib/types";

/** A request from outside the chapter — the title card's shortcuts — to open on a given work. */
export type AiAsk = { readonly n: number; readonly k: number };

type Props = {
  index: number;
  live: boolean;
  /** The motion gate. Off, nothing loops and the reel never advances by itself. */
  animate: boolean;
  ask: AiAsk;
  onOpen: (id: string) => void;
};

/** How long a pointer resting on a closed panel waits before opening it — intent, not transit. */
const INTENT_MS = 260;
/** After a panel changes, how long hover is ignored while the widths are still moving. */
const SETTLE_MS = 1000;

/**
 * The AI works, first — an expanding triptych.
 *
 * Three panels share the frame. One is open: its diagram runs the work's idea once, and the
 * four beats of that run light up beside it in step, so the panel explains itself without a
 * word being read. When the run ends the next panel opens — the reel's own rhythm, one
 * diagram per work — and a pointer anywhere on the triptych holds it where it is.
 *
 * The closed panels are not hidden: they are the same diagram, narrowed to a strip, at rest on
 * its finished frame. Opening one is a width change, not a swap — the strip widens into the
 * whole picture and starts running — so the three read as one object seen three ways, which
 * is what they are: three uses of one discipline.
 *
 * ── the width, without the reflow ──
 * Each panel's text column is laid out at the *open* panel's width, always, and the panel
 * clips it. As a panel grows, its copy is revealed rather than re-wrapped on every frame of
 * the transition — the jitter that makes most accordions look cheap.
 */
export function AiScene({ index, live, animate, ask, onOpen }: Props) {
  const lang = useLang();
  const uid = useId();
  const [view, setView] = useState({ at: 0, turn: 0, dir: 1 as 1 | -1 });
  const held = useRef(false);
  const intent = useRef(0);
  const intentFor = useRef(-1);
  const changedAt = useRef(0);
  const tabs = useRef<HTMLDivElement>(null);

  const to = useCallback((n: number) => {
    setView((v) => {
      const at = ((n % aiWorks.length) + aiWorks.length) % aiWorks.length;
      return at === v.at ? v : { at, turn: v.turn + 1, dir: n < v.at ? -1 : 1 };
    });
  }, []);

  /*
   * Opening the chapter rewinds to the first work; a shortcut from the title opens on the one
   * it named. Adjusted during render, against the previous values — as in useReel — so the
   * stale panel is never painted first.
   */
  //
  // A shortcut usually lands *before* the chapter goes live — the cut has its own timing — so
  // it is held as pending, and the arrival that follows keeps the work it asked for instead of
  // rewinding over it.
  const [seen, setSeen] = useState({ live, k: ask.k, pending: false });
  if (live !== seen.live || ask.k !== seen.k) {
    const asked = ask.k !== seen.k;
    const arriving = live && !seen.live;
    setSeen({ live, k: ask.k, pending: asked ? !live : false });
    if (asked) setView((v) => ({ at: ask.n, turn: v.turn + 1, dir: 1 }));
    else if (arriving && !seen.pending) setView((v) => ({ at: 0, turn: v.turn + 1, dir: 1 }));
  }

  // A cleared hold on every visit, and no intent timer left behind by the last one.
  useEffect(() => {
    held.current = false;
    return () => window.clearTimeout(intent.current);
  }, [live]);

  useEffect(() => {
    changedAt.current = performance.now();
  }, [view.turn]);

  /** A run finished. Move on — unless someone is looking at it. */
  const onLoop = useCallback(() => {
    if (!held.current) setView((v) => ({ at: (v.at + 1) % aiWorks.length, turn: v.turn + 1, dir: 1 }));
  }, []);

  /*
   * Hover-to-open, for a mouse that is actually moving. Two things would otherwise open panels
   * nobody pointed at: while the widths animate, a closed panel slides under a pointer that has
   * not moved, and the browser reports that as the pointer entering it; and a touch has no
   * hover at all — its tap is the click.
   */
  const hover = (n: number, e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || (!e.movementX && !e.movementY)) return;
    // The event's own timestamp is on the same clock as performance.now().
    if (e.timeStamp - changedAt.current < SETTLE_MS || intentFor.current === n) return;
    window.clearTimeout(intent.current);
    intentFor.current = n;
    intent.current = window.setTimeout(() => {
      intentFor.current = -1;
      to(n);
    }, INTENT_MS);
  };
  const unhover = () => {
    window.clearTimeout(intent.current);
    intentFor.current = -1;
  };

  /** ← → Home End along the tabs, kept from the projector, which would read them as a cut. */
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const from = Number((e.target as HTMLElement).dataset.n);
    if (Number.isNaN(from)) return;
    const last = aiWorks.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? Math.min(last, from + 1)
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? Math.max(0, from - 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    e.preventDefault();
    e.stopPropagation();
    tabs.current?.querySelector<HTMLElement>(`.aip-tab[data-n="${next}"]`)?.focus();
    to(next);
  };

  return (
    <Scene index={index} live={live} className="s-ai" gutter top>
      <div className="wall-head ai-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <CountUp className="count" value={aiWorks.length} pad={2} delay={riseAt(0)} duration={900} />
        <div className="ai-heading">
          <Decode v={UI.aiEyebrow} as="p" className="eyebrow" delay={riseAt(0) + 80} />
          <Kinetic
            v={UI.aiTitle}
            as="h2"
            className="ai-title"
            style={{ "--kin-at": "0.42s", "--kin-step": "0.03s" } as React.CSSProperties}
          />
        </div>
        <ul className="ai-honors">
          {aiWorks.flatMap(({ item }, k) =>
            item.honor
              ? [
                  <li key={item.id} style={{ "--k": k } as React.CSSProperties}>
                    <b>{text(item.honor.grade, lang)}</b> {text(item.honor.event, lang)}
                  </li>,
                ]
              : [],
          )}
        </ul>
      </div>

      <div
        className="triptych"
        ref={tabs}
        role="group"
        aria-label={text(UI.aiTabs, lang)}
        style={{ "--rd": view.dir } as React.CSSProperties}
        onPointerEnter={() => (held.current = true)}
        onPointerLeave={() => {
          held.current = false;
          unhover();
        }}
        onFocus={() => (held.current = true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) held.current = false;
        }}
        onKeyDown={onKey}
      >
        {aiWorks.map(({ work, item }, n) => {
          const on = n === view.at;
          const body = `${uid}-b${n}`;
          const tags = topicTags(item).slice(0, 5);
          return (
            <article
              key={item.id}
              className="aip rise"
              data-on={on}
              data-ai-host=""
              style={{ "--i": 1 + n, "--n": n } as React.CSSProperties}
            >
              <div className="aip-stage">
                <AiVisual kind={work.visual} play={live && animate && on} onLoop={on ? onLoop : undefined} />
                {on && item.honor && <Stamp key={view.turn} honor={item.honor} />}
              </div>

              {/*
                The tab. Closed, it covers the whole panel — the panel is one big target —
                and carries the panel's label. Open, it shrinks to the number in the corner.
              */}
              <button
                type="button"
                className="aip-tab"
                data-n={n}
                aria-expanded={on}
                aria-controls={body}
                onClick={() => to(n)}
                onPointerMove={(e) => !on && hover(n, e)}
                onPointerLeave={unhover}
              >
                <span className="aip-no">AI·{String(n + 1).padStart(2, "0")}</span>
                <Txt v={work.short} as="span" className="aip-short" />
                {item.honor && <Txt v={item.honor.grade} as="span" className="aip-hon" />}
                <span className="sr-only-live">
                  {text(item.t, lang)} — {text(UI.aiExpand, lang)}
                </span>
              </button>

              <div className="aip-body" id={body} {...(!on ? { inert: true } : {})}>
                {/* Re-keyed each time the panel opens, so its copy assembles again. */}
                <div className="aip-copy" key={on ? `on${view.turn}` : "rest"}>
                  <div className="aip-main">
                    <p className="aip-code">
                      <span>AI·{String(n + 1).padStart(2, "0")}</span>
                      {item.honor && <Txt v={item.honor.event} as="span" className="aip-track" />}
                      {item.honor?.track && <Txt v={item.honor.track} as="span" className="aip-track" />}
                    </p>
                    <Kinetic
                      v={item.t}
                      as="h3"
                      className="aip-title"
                      style={{ "--kin-at": "0.12s", "--kin-step": "0.022s", "--kin-dur": "0.7s" } as React.CSSProperties}
                    />
                    <Txt v={item.s} as="p" className="aip-sum" />
                    <span className="aip-tags">
                      {tags.map((t, k) => (
                        <span key={t} style={{ "--k": k } as React.CSSProperties}>
                          {t}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="aip-side">
                    <Txt v={UI.aiSteps} as="p" className="aip-steps-h" />
                    <ol className="aip-steps">
                      {work.steps.map((s, k) => (
                        <li key={s.en} style={{ "--k": k } as React.CSSProperties}>
                          <b>{String(k + 1).padStart(2, "0")}</b>
                          <Txt v={s} as="span" />
                          <i aria-hidden="true" />
                        </li>
                      ))}
                    </ol>
                    <button type="button" className="aip-open" onClick={() => onOpen(item.id)}>
                      <Txt v={UI.aiOpen} /> <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <Txt v={UI.aiHint} as="p" className="ai-hint rise" style={{ "--i": 5 } as React.CSSProperties} />
    </Scene>
  );
}

/**
 * The honour, stamped onto the diagram: it lands from above the page at an angle, overshoots,
 * and throws a ring — the one object in the chapter that arrives with weight.
 */
function Stamp({ honor }: { honor: Honor }) {
  return (
    <span className="aip-stamp">
      <span className="st-ring" aria-hidden="true" />
      <Txt v={honor.grade} as="b" />
      <Txt v={honor.event} as="span" />
    </span>
  );
}
