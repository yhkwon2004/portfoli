"use client";

import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHead } from "@/components/site/SectionHead";
import { usePreview } from "@/components/site/Preview";
import { rankOf, topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { src } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { awards, cover, gradeDistribution, stats, year } from "@/lib/select";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/** "2025-06-04" → "06.04"; a bare year has no day to show. */
const day = (y: string) => (y.length >= 10 ? `${y.slice(5, 7)}.${y.slice(8, 10)}` : "—");

/** The awards, newest year first, each year's awards in date order. */
const byYear = (() => {
  const years = [...new Set(awards.map(year))].sort().reverse();
  return years.map((y) => ({ y, list: awards.filter((a) => year(a) === y) }));
})();

/**
 * The awards, as a ledger.
 *
 * A certificate scan is a picture of paper — thirty-five of them in a row read as a stack of
 * paperwork. So the list is set as type: year by year, one line an award, the grade in the
 * one colour reserved for results. The certificate itself floats up beside the pointer when
 * a line is hovered, and opens in full when it is chosen.
 */
export function Awards({ onOpen }: { onOpen: OpenFn }) {
  const lang = useLang();
  const preview = usePreview({ cert: true });
  const total = gradeDistribution.reduce((s, g) => s + g.count, 0);

  return (
    <section className="section awards" id="awards" aria-labelledby="awards-title">
      <div className="wrap">
        <SectionHead idx="05" label={UI.awardsIdx} a={UI.awardsTitleA} b={UI.awardsTitleB} id="awards-title">
          <div className="awards-sum">
            <p className="awards-big" aria-hidden="true">
              <CountUp value={stats.awards} />
            </p>
            <div
              className="grade-bar"
              role="img"
              aria-label={gradeDistribution.map((g) => `${lang === "en" ? g.rank.en : g.rank.key} ${g.count}`).join(", ")}
            >
              {gradeDistribution.map((g) => (
                <i key={g.rank.key} style={{ flexGrow: g.count, "--o": 0.3 + 0.7 * (g.rank.weight / 4) } as React.CSSProperties} />
              ))}
            </div>
            <ul className="grade-legend">
              {gradeDistribution.map((g) => (
                <li key={g.rank.key} style={{ "--o": 0.3 + 0.7 * (g.rank.weight / 4) } as React.CSSProperties}>
                  <i aria-hidden="true" />
                  <span>{lang === "en" ? g.rank.en : g.rank.key}</span>
                  <b className="mono">{g.count}</b>
                </li>
              ))}
            </ul>
            <p className="sr-only">{`${total} / ${stats.awards}`}</p>
          </div>
        </SectionHead>
        <Txt v={UI.awardsNote} as="p" className="awards-note" />

        <div className="ledger" onPointerMove={preview.move} onPointerLeave={preview.hide}>
          {byYear.map(({ y, list }) => (
            <section key={y} className="ledger-year" aria-labelledby={`awards-${y}`}>
              <header className="ledger-head" data-reveal="fade">
                <h3 id={`awards-${y}`} className="ledger-y">
                  {y}
                </h3>
                <span className="mono">{String(list.length).padStart(2, "0")}</span>
              </header>
              <ol>
                {list.map((a) => {
                  const r = rankOf(a);
                  const c = cover(a);
                  const grade = r ? (lang === "en" ? r.en : r.key) : "";
                  return (
                    <li key={a.id} data-id={a.id}>
                      <button
                        type="button"
                        className="lg-row"
                        data-top={r ? r.weight >= 3 : false}
                        onClick={(e) => onOpen(a.id, e.currentTarget)}
                        onPointerEnter={(e) => preview.show(c ? src(c.u, "thumb") : null, e)}
                        aria-label={[grade, a.year, text(a.t, lang)].filter(Boolean).join(" · ")}
                      >
                        <span className="lg-date mono">{day(a.year)}</span>
                        <span className="lg-thumb" aria-hidden="true" data-vt="">
                          {c && <Img master={c.u} alt="" sizes="72px" />}
                        </span>
                        <span className="lg-grade">{grade}</span>
                        <Txt v={a.t} as="span" className="lg-title" />
                        <span className="lg-tags mono">{topicTags(a).slice(0, 2).join(" · ")}</span>
                        <span className="lg-arrow" aria-hidden="true">
                          <svg viewBox="0 0 16 16">
                            <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      </div>
      {preview.node}
    </section>
  );
}
