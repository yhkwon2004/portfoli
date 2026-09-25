"use client";

import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { CountUp } from "@/components/motion/CountUp";
import { SectionHead } from "@/components/site/SectionHead";
import { SERIES, SURFACE } from "@/data/charts";
import { UI } from "@/data/ui";
import { text } from "@/lib/i18n";
import { domains, gradeDistribution, maxYearTotal, outputByYear, stats } from "@/lib/select";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/**
 * Capabilities, as a bento: one tile per field, each claim a count of real works — and beside
 * them the three charts that keep the claims honest (grades, depth, output per year). Every
 * chip opens the strongest work behind its skill.
 */
export function Skills({ onOpen }: { onOpen: OpenFn }) {
  const lang = useLang();
  const [lead, ...rest] = domains;
  const thinShare = stats.thinTags / Math.max(1, stats.tags);

  return (
    <section className="section skills" id="skills" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHead idx="03" label={UI.skillsIdx} a={UI.skillsTitleA} b={UI.skillsTitleB} note={UI.skillsNote} id="skills-title" />
        <div className="bento" style={{ "--chart-surface": SURFACE } as React.CSSProperties}>
          {lead && (
            <article className="tile tile-lead glass spot" data-reveal="up">
              <header className="tile-head">
                <Txt v={lead.name} as="h3" />
                <p className="tile-big">
                  <CountUp value={lead.proof} />
                  <Txt v={UI.proofLabel} as="span" className="label" />
                </p>
              </header>
              <ol className="bars">
                {lead.tags.slice(0, 9).map((t, n) => (
                  <li key={t.tag} style={{ "--w": t.count / (lead.tags[0]?.count ?? 1), "--n": n } as React.CSSProperties}>
                    <button type="button" onClick={(e) => onOpen(t.strongest.id, e.currentTarget)} data-cursor="OPEN">
                      <span className="bar-name">{t.tag}</span>
                      <span className="bar-track" aria-hidden="true">
                        <i />
                      </span>
                      <b className="mono">
                        {t.count}
                        <span className="sr-only"> {text(UI.works, lang)}</span>
                      </b>
                    </button>
                  </li>
                ))}
              </ol>
            </article>
          )}

          {rest.map((d, n) => (
            <article key={d.name.en} className="tile tile-domain glass spot" data-reveal="up" style={{ "--d": 80 + n * 60 } as React.CSSProperties}>
              <header className="tile-head">
                <Txt v={d.name} as="h3" />
                <p className="tile-num mono">{d.proof}</p>
              </header>
              {/* One mark per work behind the field: the count above, made countable. */}
              <p className="tile-dots" aria-hidden="true">
                {Array.from({ length: d.proof }, (_, k) => (
                  <i key={k} style={{ "--k": k } as React.CSSProperties} />
                ))}
              </p>
              {d.tags[0] && (
                <button type="button" className="tile-work" onClick={(e) => onOpen(d.tags[0]!.strongest.id, e.currentTarget)} data-cursor="OPEN">
                  <Txt v={UI.leadWork} as="span" className="label" />
                  <Txt v={d.tags[0].strongest.t} as="span" className="tile-work-t" />
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              )}
              <ul className="tile-chips">
                {d.tags.slice(0, 7).map((t) => (
                  <li key={t.tag}>
                    <button type="button" className="chip" onClick={(e) => onOpen(t.strongest.id, e.currentTarget)}>
                      {t.tag} <b>{t.count}</b>
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <article className="tile tile-grades glass" data-reveal="up" style={{ "--d": 120 } as React.CSSProperties}>
            <header className="tile-head">
              <Txt v={UI.gradesTitle} as="h3" />
              <p className="tile-num mono">{stats.awards}</p>
            </header>
            <div className="stack" role="img" aria-label={gradeDistribution.map((g) => `${lang === "en" ? g.rank.en : g.rank.key} ${g.count}`).join(", ")}>
              {gradeDistribution.map((g) => (
                <i key={g.rank.key} style={{ flexGrow: g.count, background: g.rank.color }} title={`${g.rank.key} ${g.count}`} />
              ))}
            </div>
            <ul className="legend">
              {gradeDistribution.map((g) => (
                <li key={g.rank.key}>
                  <i style={{ background: g.rank.color }} aria-hidden="true" />
                  <span lang={lang === "en" ? "en" : "ko"}>{lang === "en" ? g.rank.en : g.rank.key}</span>
                  <b className="mono">{g.count}</b>
                </li>
              ))}
            </ul>
          </article>

          <article className="tile tile-depth glass" data-reveal="up" style={{ "--d": 180 } as React.CSSProperties}>
            <header className="tile-head">
              <Txt v={UI.depthTitle} as="h3" />
            </header>
            <div className="ring" role="img" aria-label={`${stats.thinTags} / ${stats.tags}`} style={{ "--share": thinShare } as React.CSSProperties}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="50" className="ring-bg" />
                <circle cx="60" cy="60" r="50" className="ring-fg" pathLength={1} />
              </svg>
              <p>
                <b className="mono">
                  {stats.thinTags}
                  <span> / {stats.tags}</span>
                </b>
              </p>
            </div>
            <Txt v={UI.depthNote} as="p" className="tile-note" />
          </article>

          <article className="tile tile-output glass" data-reveal="up" style={{ "--d": 240 } as React.CSSProperties}>
            <header className="tile-head">
              <Txt v={UI.outputTitle} as="h3" />
              <ul className="legend legend-inline">
                <li>
                  <i style={{ background: SERIES.awards }} aria-hidden="true" />
                  <Txt v={UI.statAwards} />
                </li>
                <li>
                  <i style={{ background: SERIES.projects }} aria-hidden="true" />
                  <Txt v={UI.statProjects} />
                </li>
              </ul>
            </header>
            <div className="cols" role="img" aria-describedby="output-table">
              {outputByYear.map((b, n) => (
                <div className="col" key={b.year} style={{ "--n": n } as React.CSSProperties} title={`${b.year}: ${b.awards} + ${b.projects}`}>
                  <b className="mono">{b.total}</b>
                  <span className="col-bar" style={{ height: `${(b.total / maxYearTotal) * 100}%` }}>
                    <i style={{ flexGrow: b.projects, background: SERIES.projects }} />
                    <i style={{ flexGrow: b.awards, background: SERIES.awards }} />
                  </span>
                  <span className="mono col-year">{b.year}</span>
                </div>
              ))}
            </div>
            <table className="sr-only" id="output-table">
              <caption>{text(UI.outputTitle, lang)}</caption>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">{text(UI.statAwards, lang)}</th>
                  <th scope="col">{text(UI.statProjects, lang)}</th>
                </tr>
              </thead>
              <tbody>
                {outputByYear.map((b) => (
                  <tr key={b.year}>
                    <th scope="row">{b.year}</th>
                    <td>{b.awards}</td>
                    <td>{b.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>
      </div>
    </section>
  );
}
