"use client";

import { useEffect, useRef, useState } from "react";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { Split } from "@/components/motion/Split";
import { SectionHead } from "@/components/site/SectionHead";
import { Stage3D } from "@/components/three/lazy";
import { useLive } from "@/components/three/useLive";
import { aiMedia, type AiWork } from "@/data/ai";
import { topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { asset } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { clamp01, onScrollFrame, pinProgress } from "@/lib/scroll";
import { aiWorks } from "@/lib/select";
import type { Item } from "@/lib/types";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/**
 * The three AI works, as scroll-driven case studies.
 *
 * Each is a tall section with its stage pinned: scrolling through it plays the work's 3D scene
 * from its first act to its last, and the four steps beside it light in step. The reader sets
 * the pace — scroll back and the scene runs backwards. On a phone, or without WebGL, the stage
 * plays the same scene pre-rendered as a video; with motion off it holds one still frame.
 */
export function AiWorks({ onOpen }: { onOpen: OpenFn }) {
  return (
    <section className="ai" id="ai" aria-labelledby="ai-title">
      <div className="wrap section-top">
        <SectionHead idx="02" label={UI.aiIdx} a={UI.aiTitleA} b={UI.aiTitleB} note={UI.aiNote} id="ai-title" />
      </div>
      {aiWorks.map(({ work, item }, n) => (
        <CaseStudy key={item.id} work={work} item={item} n={n} onOpen={onOpen} />
      ))}
    </section>
  );
}

function CaseStudy({ work, item, n, onOpen }: { work: AiWork; item: Item; n: number; onOpen: OpenFn }) {
  const lang = useLang();
  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const media = aiMedia(work.visual);
  const { drive, active, mode, lite } = useLive(stage);
  const [phase, setPhase] = useState(-1);
  const [ready, setReady] = useState(false);
  const steps = work.steps.length;

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    let last = -2;
    return onScrollFrame(() => {
      // The first tenth of the scene plays while the case scrolls up into view, so the stage
      // is already in motion — the material falling in, the track drawing — when it pins.
      const enter = clamp01((window.innerHeight - el.getBoundingClientRect().top) / window.innerHeight);
      const p = enter * 0.1 + pinProgress(el) * 0.9;
      drive.target = p;
      el.style.setProperty("--cp", p.toFixed(4));
      const k = p <= 0 ? -1 : Math.min(steps - 1, Math.floor(p * steps));
      if (k !== last) {
        last = k;
        setPhase(k);
      }
    });
  }, [drive, steps]);

  const tags = topicTags(item).slice(0, 5);
  const shown = Math.max(0, phase);

  return (
    <article className="case" ref={outer} data-n={n} aria-labelledby={`case-${n}`}>
      <div className="case-pin">
        <div className="wrap case-grid">
          <div className="case-copy">
            <p className="case-idx" data-reveal="fade">
              <span className="mono">AI·{String(n + 1).padStart(2, "0")}</span>
              <span className="mono case-of">/ {String(aiWorks.length).padStart(2, "0")}</span>
              {item.honor && (
                <span className="chip chip-honor">
                  {text(item.honor.event, lang)} · {text(item.honor.grade, lang)}
                </span>
              )}
            </p>
            <Split v={item.t} as="h3" className="case-title" step={16} />
            <p className="case-sum" data-reveal="up" style={{ "--d": 200 } as React.CSSProperties}>
              <Txt v={item.s} />
            </p>
            <div className="case-steps-wrap" data-reveal="up" style={{ "--d": 300 } as React.CSSProperties}>
              <Txt v={UI.aiSteps} as="p" className="label" />
              <ol className="case-steps">
                {work.steps.map((s, k) => (
                  <li key={s.en} data-on={phase === k} data-done={phase > k} style={{ "--k": k } as React.CSSProperties}>
                    <b className="mono">{String(k + 1).padStart(2, "0")}</b>
                    <Txt v={s} />
                    <i aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </div>
            <div className="case-foot" data-reveal="up" style={{ "--d": 380 } as React.CSSProperties}>
              <ul className="case-tags">
                {tags.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-ghost"
                data-magnetic="0.25"
                onClick={() => onOpen(item.id, stage.current)}
              >
                <Txt v={UI.aiOpen} />
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="case-stage" data-reveal="scale">
            <div
              className="case-frame spot"
              ref={stage}
              data-id={item.id}
              data-mode={mode}
              data-ready={ready}
              data-cursor={mode === "3d" ? "SCROLL" : undefined}
            >
              <div className="case-media" data-vt="">
                <img className="case-poster" src={asset(media.poster)} alt="" loading="lazy" />
                {mode === "video" && (
                  <video
                    className="case-video"
                    src={asset(media.video)}
                    poster={asset(media.poster)}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  />
                )}
                {mode === "3d" && (
                  <Stage3D
                    scene={work.visual}
                    drive={drive}
                    active={active}
                    lite={lite}
                    className="case-canvas"
                    onReady={() => setReady(true)}
                  />
                )}
              </div>
              <div className="case-hud" aria-hidden="true">
                <span className="case-hud-tl mono">{work.code}</span>
                <span className="case-hud-tr mono">
                  {String(shown + 1).padStart(2, "0")} / {String(steps).padStart(2, "0")}
                </span>
                <span className="case-hud-bl">
                  <Txt v={work.steps[shown] ?? work.steps[0]!} />
                </span>
                <span className="case-bar">
                  <i />
                </span>
                <i className="case-corner c1" />
                <i className="case-corner c2" />
                <i className="case-corner c3" />
                <i className="case-corner c4" />
              </div>
            </div>
            <Txt v={UI.concept} as="p" className="case-note label" />
          </div>
        </div>
      </div>
    </article>
  );
}
