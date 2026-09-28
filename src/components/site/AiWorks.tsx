"use client";

import { useEffect, useRef, useState } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { Split } from "@/components/motion/Split";
import { SectionHead } from "@/components/site/SectionHead";
import { Stage3D } from "@/components/three/lazy";
import { useLive } from "@/components/three/useLive";
import { aiMedia, type AiVisualKind, type AiWork } from "@/data/ai";
import { topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { asset } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { clamp01, onScrollFrame, pinProgress } from "@/lib/scroll";
import { aiWorks } from "@/lib/select";
import type { Item } from "@/lib/types";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/**
 * The AI works, as scroll-driven case studies.
 *
 * Each is a tall section with its stage pinned: scrolling through it plays the work from its
 * first step to its last, and the steps beside it light in step. The reader sets the pace —
 * scroll back and it runs backwards. A work explained by a 3D scene plays that scene (on a
 * phone, or without WebGL, the same scene pre-rendered as video; with motion off, one still).
 * A work with real product screens shows those instead, one per step.
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
  const [phase, setPhase] = useState(-1);
  const steps = work.steps.length;
  const progressRef = useRef<(p: number) => void>(() => {});

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    let last = -2;
    return onScrollFrame(() => {
      // The first tenth of the story plays while the case scrolls up into view, so the stage
      // is already moving — the material falling in, the track drawing — when it pins.
      const enter = clamp01((window.innerHeight - el.getBoundingClientRect().top) / window.innerHeight);
      const p = enter * 0.1 + pinProgress(el) * 0.9;
      progressRef.current(p);
      el.style.setProperty("--cp", p.toFixed(4));
      const k = p <= 0 ? -1 : Math.min(steps - 1, Math.floor(p * steps));
      if (k !== last) {
        last = k;
        setPhase(k);
      }
    });
  }, [steps]);

  const tags = topicTags(item).slice(0, 5);
  const shown = Math.max(0, phase);
  const scene = work.visual === "screens" ? null : work.visual;

  return (
    <article
      className="case"
      ref={outer}
      data-n={n}
      data-stage={work.visual}
      aria-labelledby={`case-${n}`}
      style={{ "--steps": steps } as React.CSSProperties}
    >
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
              {item.year && <span className="mono case-year">{item.year}</span>}
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
              <button type="button" className="btn btn-ghost" data-magnetic="0.2" onClick={() => onOpen(item.id, stage.current)}>
                <Txt v={UI.aiOpen} />
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="case-stage" data-reveal="scale">
            {scene ? (
              <SceneStage kind={scene} work={work} item={item} stage={stage} shown={shown} steps={steps} progressRef={progressRef} />
            ) : (
              <ScreensStage work={work} item={item} stage={stage} phase={shown} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

type StageProps = { work: AiWork; item: Item; stage: React.RefObject<HTMLDivElement | null> };

/** A 3D scene, its pre-rendered video, or its poster — whichever this visitor can afford. */
function SceneStage({
  kind,
  work,
  item,
  stage,
  shown,
  steps,
  progressRef,
}: StageProps & { kind: AiVisualKind; shown: number; steps: number; progressRef: React.RefObject<(p: number) => void> }) {
  const media = aiMedia(kind);
  const { drive, active, mode, lite } = useLive(stage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    progressRef.current = (p) => {
      drive.target = p;
    };
  }, [drive, progressRef]);

  return (
    <>
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
            <Stage3D scene={kind} drive={drive} active={active} lite={lite} className="case-canvas" onReady={() => setReady(true)} />
          )}
        </div>
        <Hud work={work} shown={shown} steps={steps} />
      </div>
      <Txt v={UI.concept} as="p" className="case-note label" />
    </>
  );
}

/**
 * The product's own screens in a window, one per step: each slides in over the last, and the
 * current one pans slowly down its length as the reader scrolls — as if being read.
 */
function ScreensStage({ work, item, stage, phase }: StageProps & { phase: number }) {
  const lang = useLang();
  const screens = item.imgs.slice(0, work.steps.length);
  const credit = screens.find((s) => s.credit)?.credit;
  return (
    <>
      <div className="case-frame case-screens" ref={stage} data-id={item.id} data-mode="screens">
        <div className="win" data-vt="">
          <div className="win-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="mono">{work.short.en.toLowerCase()}</span>
          </div>
          <div className="win-body">
            {screens.map((s, k) => (
              <figure key={s.u} className="win-shot" data-on={phase === k} data-past={phase > k} style={{ "--k": k } as React.CSSProperties}>
                <Img master={s.u} alt={s.a} sizes="(max-width: 860px) 92vw, 760px" />
              </figure>
            ))}
          </div>
        </div>
        <Hud work={work} shown={phase} steps={work.steps.length} />
      </div>
      <p className="case-note label">
        {text(UI.realScreens, lang)}
        {credit && (
          <>
            {" — "}
            <a href={credit.url} target="_blank" rel="noopener noreferrer">
              {credit.label}
            </a>
          </>
        )}
      </p>
    </>
  );
}

function Hud({ work, shown, steps }: { work: AiWork; shown: number; steps: number }) {
  return (
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
  );
}
