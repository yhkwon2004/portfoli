"use client";

import { useEffect, useRef } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHead } from "@/components/site/SectionHead";
import { rankOf, topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { text } from "@/lib/i18n";
import { onScrollFrame, pinProgress } from "@/lib/scroll";
import { awards, cover, gradeDistribution, stats, year } from "@/lib/select";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/**
 * The awards, as a sideways run of certificates.
 *
 * On a wide screen the section is as tall as the strip is wide, and its stage is pinned: the
 * reader scrolls down and the certificates travel left, so all 35 pass under the eye without a
 * horizontal scrollbar anywhere. On a phone the strip is a plain native horizontal scroller
 * with snap points — pinning a sideways gallery under a thumb that wants to scroll the page is
 * a fight nobody wins.
 */
export function Awards({ onOpen }: { onOpen: OpenFn }) {
  const lang = useLang();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr) return;
    const wide = window.matchMedia("(min-width: 861px)");
    let run = 0;
    const size = () => {
      if (!wide.matches) {
        el.style.removeProperty("height");
        tr.style.removeProperty("transform");
        run = 0;
        return;
      }
      run = Math.max(0, tr.scrollWidth - tr.clientWidth);
      el.style.height = `${run + window.innerHeight * 1.15}px`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(tr);
    wide.addEventListener("change", size);
    const off = onScrollFrame(() => {
      if (!run) return;
      const p = pinProgress(el);
      tr.style.transform = `translate3d(${(-p * run).toFixed(1)}px, 0, 0)`;
      el.style.setProperty("--ap", p.toFixed(4));
    });
    return () => {
      ro.disconnect();
      wide.removeEventListener("change", size);
      off();
    };
  }, []);

  return (
    <section className="awards" id="awards" ref={section} aria-labelledby="awards-title">
      <div className="awards-pin">
        <div className="wrap">
          <SectionHead idx="05" label={UI.awardsIdx} a={UI.awardsTitleA} b={UI.awardsTitleB} id="awards-title">
            <div className="awards-sum">
              <p className="awards-big mono" aria-hidden="true">
                <CountUp value={stats.awards} />
              </p>
              <ul className="legend">
                {gradeDistribution.map((g) => (
                  <li key={g.rank.key}>
                    <i style={{ background: g.rank.color }} aria-hidden="true" />
                    <span>{lang === "en" ? g.rank.en : g.rank.key}</span>
                    <b className="mono">{g.count}</b>
                  </li>
                ))}
              </ul>
              <Txt v={UI.awardsNote} as="p" className="shead-note awards-note" />
            </div>
          </SectionHead>
        </div>
        <ol className="awards-track" ref={track}>
          {awards.map((a) => {
            const r = rankOf(a);
            const img = cover(a);
            return (
              <li key={a.id} data-id={a.id}>
                <button
                  type="button"
                  className="award glass spot"
                  onClick={(e) => onOpen(a.id, e.currentTarget)}
                  data-cursor="OPEN"
                  style={{ "--rk": r?.color ?? "var(--color-fg-3)" } as React.CSSProperties}
                  aria-label={[r ? (lang === "en" ? r.en : r.key) : "", year(a), text(a.t, lang)].filter(Boolean).join(" · ")}
                >
                  <span className="award-media" data-vt="">
                    {img && <Img master={img.u} alt="" sizes="300px" />}
                  </span>
                  <span className="award-meta">
                    <span className="award-top mono">
                      <b>{r ? (lang === "en" ? r.en : r.key) : ""}</b>
                      <span>{year(a)}</span>
                    </span>
                    <Txt v={a.t} as="span" className="award-title" />
                    <span className="award-tags">{topicTags(a).slice(0, 2).join(" · ")}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="wrap awards-rail" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
