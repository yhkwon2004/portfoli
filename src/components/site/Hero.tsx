"use client";

import { useEffect, useRef, useState } from "react";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { Stage3D } from "@/components/three/lazy";
import { useLive } from "@/components/three/useLive";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { asset } from "@/lib/assets";
import { resolve, text } from "@/lib/i18n";
import { onScrollFrame, pinProgress, scrollToTarget } from "@/lib/scroll";
import { aiWorks, profile, stats, tagDepth } from "@/lib/select";
import type { Bi } from "@/lib/types";

/** A line of the headline, split into characters inside an aria-hidden copy. */
function Chars({ v, from }: { v: Bi | string; from: number }) {
  const lang = useLang();
  const t = typeof v === "string" ? v : resolve(v, lang).text;
  let i = from;
  return (
    <>
      {t.split(/(\s+)/).map((w, wi) =>
        /^\s+$/.test(w) ? (
          " "
        ) : (
          <span className="w" key={wi}>
            {Array.from(w).map((c, ci) => (
              <span className="u" key={ci} style={{ "--i": i++ } as React.CSSProperties}>
                {c}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}

/**
 * The hero: the neural field, the name, and the claim — and, as the reader scrolls, the field
 * unfolding from a brain into a network while the words give way to the figures behind them.
 *
 * The section is tall and its stage is pinned, so the first two screens of scrolling play the
 * morph rather than moving the page; `--hp` (0 → 1) carries that progress to the stylesheet.
 */
export function Hero() {
  const lang = useLang();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { drive, active, mode, lite } = useLive(stage, { mobile3d: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    return onScrollFrame(() => {
      const p = pinProgress(el);
      drive.target = p;
      el.style.setProperty("--hp", p.toFixed(4));
    });
  }, [drive]);

  const l1 = resolve(UI.heroLine1, lang).text;
  const l2 = resolve(UI.heroLine2, lang).text;
  const owner = resolve(PORTFOLIO.owner, lang).text;
  const honours = aiWorks.flatMap(({ item }) =>
    item.honor ? [`${text(item.honor.event, lang)} ${text(item.honor.grade, lang)}`] : [],
  );
  const ticker = tagDepth.slice(0, 22).map((t) => t.tag);

  return (
    <>
      <section className="hero" id="top" ref={section} aria-labelledby="hero-title">
        <div className="hero-pin">
          <div className="aurora" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="hero-stage" ref={stage} data-ready={ready}>
            <img className="hero-poster" src={asset("/media/hero-poster.webp")} alt="" aria-hidden="true" />
            {mode === "3d" && (
              <Stage3D
                scene="hero"
                drive={drive}
                active={active}
                lite={lite}
                className="hero-canvas"
                onReady={() => setReady(true)}
              />
            )}
          </div>
          <div className="hero-veil" aria-hidden="true" />

          <div className="wrap hero-inner">
            <p className="hero-kicker label" data-reveal="fade">
              <span className="live-dot" aria-hidden="true" />
              {UI.heroKicker}
            </p>
            <h1 className="hero-title" id="hero-title" aria-label={`${owner} — ${l1} ${l2}`}>
              <span aria-hidden="true">
                <span className="hero-name split" style={{ "--d": 150, "--step": "40ms" } as React.CSSProperties}>
                  <Chars v={owner} from={0} />
                  {/* The romanised name beside the Korean one; in English it would only say it twice. */}
                {lang === "ko" && <span className="hero-name-en serif-i">{PORTFOLIO.owner.en}</span>}
                </span>
                <span className="hero-line split" style={{ "--d": 420 } as React.CSSProperties}>
                  <Chars v={l1} from={0} />
                </span>
                <span className="hero-line split grad-line" style={{ "--d": 560 } as React.CSSProperties}>
                  <Chars v={l2} from={0} />
                </span>
              </span>
            </h1>
            <div className="hero-foot">
              <p className="hero-sub" data-reveal="up" style={{ "--d": 760 } as React.CSSProperties}>
                <Txt v={profile.t} />
              </p>
              <div className="hero-cta" data-reveal="up" style={{ "--d": 900 } as React.CSSProperties}>
                <a
                  className="btn btn-primary"
                  href="#ai"
                  data-magnetic="0.3"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget("#ai");
                  }}
                >
                  <Txt v={UI.heroCta} />
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </a>
                <a
                  className="btn btn-ghost"
                  href="#works"
                  data-magnetic="0.3"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget("#works");
                  }}
                >
                  <Txt v={UI.heroCta2} />
                </a>
              </div>
            </div>
            <ul className="hero-honors" data-reveal="fade" style={{ "--d": 1100 } as React.CSSProperties}>
              {honours.map((h) => (
                <li key={h} className="chip chip-honor">
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* The second beat: the field has become a network, and the figures take the stage. */}
          <div className="wrap hero-beat" aria-hidden="true">
            <Txt v={UI.heroBeat} as="p" className="hero-beat-line" />
          </div>
          <dl className="wrap hero-stats">
            <div>
              <dt>
                <Txt v={UI.statAi} />
              </dt>
              <dd>
                <CountUp value={stats.ai} pad={2} />
              </dd>
            </div>
            <div>
              <dt>
                <Txt v={UI.statAwards} />
              </dt>
              <dd>
                <CountUp value={stats.awards} />
              </dd>
            </div>
            <div>
              <dt>
                <Txt v={UI.statProjects} />
              </dt>
              <dd>
                <CountUp value={stats.projects} />
              </dd>
            </div>
            <div>
              <dt>
                <Txt v={UI.statTags} />
              </dt>
              <dd>
                <CountUp value={stats.tags} />
              </dd>
            </div>
          </dl>

          <div className="hero-scroll" aria-hidden="true">
            <span className="label">
              <Txt v={UI.heroScroll} />
            </span>
            <i />
          </div>
        </div>
      </section>

      {/* After the pinned run, not inside it — inside, it would scroll up across the stage mid-morph. */}
      <div className="hero-ticker" aria-label={ticker.join(", ")}>
        <Marquee
          duration={46}
          items={ticker.map((t) => (
            <>
              <span>{t}</span>
              <span className="tick-star" aria-hidden="true">
                ✦
              </span>
            </>
          ))}
        />
      </div>
    </>
  );
}
