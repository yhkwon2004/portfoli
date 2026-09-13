"use client";

import { useId } from "react";
import { Txt } from "@/components/Txt";
import { RAMP, SERIES, SOLO, SURFACE } from "@/data/charts";
import {
  gradeDistribution,
  stats,
  maxYearTotal,
  outputByYear,
  tagDepth,
  tagsProvenOnce,
  totalTags,
} from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/** Bars past this just repeat the tail; the stat tile carries what they would have said. */
const DEPTH_ROWS = 10;

/**
 * 지표 — the chapter this port adds.
 *
 * The rest of the site argues in prose; this one hands over the numbers and lets them argue.
 * Every figure is counted off src/data/portfolio.ts at render time (see src/lib/select.ts) —
 * nothing here is a literal, so none of it can go stale the way the inherited SWOT copy did.
 *
 * It also shows the unflattering number. "69 of 90 tags rest on a single work" is the weakest
 * fact in the data, and putting it on screen beside the award count is the reason to believe
 * the award count. A metrics screen that only flatters is an advertisement.
 *
 * Design decisions and the palette's validation record live in src/data/charts.ts.
 */
export function MetricsScene({ index, live }: { index: number; live: boolean }) {
  const lang = useLang();

  return (
    <Scene index={index} live={live} className="s-metrics" gutter top>
      <div className="wall-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        {/* The headline is the size of the evidence base, which is what makes the rest credible. */}
        <span className="count">{stats.records}</span>
        <div>
          <Txt v={UI.metricsEyebrow} as="p" className="eyebrow" />
          <Txt v={UI.metricsHint} as="p" className="mnote" />
        </div>
      </div>

      {/* The validated surface is applied here, so the colour the palette was checked against
          is provably the colour the panels are painted. */}
      <div className="metrics" style={{ "--chart-surface": SURFACE } as React.CSSProperties}>
        <OutputPanel lang={lang} />
        <GradePanel lang={lang} />
        <DepthPanel lang={lang} />
      </div>
    </Scene>
  );
}

/* ─────────────────  output per year: stacked columns, two series  ───────────────── */

function OutputPanel({ lang }: { lang: "ko" | "en" }) {
  const tableId = useId();

  return (
    <section className="mpanel rise" style={{ "--i": 1 } as React.CSSProperties}>
      <span className="regmarks" aria-hidden="true" />
      <header>
        <Txt v={UI.metricOutput} as="h3" />
        <Txt v={UI.metricOutputNote} as="span" className="mnote" />
      </header>

      {/* Two series, so a legend is always present — identity is never colour alone. */}
      <div className="mlegend">
        <span>
          <i style={{ "--sw": SERIES.awards } as React.CSSProperties} aria-hidden="true" />
          <Txt v={UI.statAwards} />
        </span>
        <span>
          <i style={{ "--sw": SERIES.projects } as React.CSSProperties} aria-hidden="true" />
          <Txt v={UI.statProjects} />
        </span>
      </div>

      <div className="mplot">
        <div className="mcols" role="img" aria-describedby={tableId}>
          {outputByYear.map((b, n) => (
            <div className="mcol" key={b.year}>
              {/* The total on the cap — one selective direct label, in a text token. */}
              <span className="mtotal">{b.total}</span>
              <div
                className="mstack"
                style={
                  {
                    "--h": `${(b.total / maxYearTotal) * 100}%`,
                    "--i": n,
                  } as React.CSSProperties
                }
              >
                {/*
                  Awards sit on top of projects; the 2px gap between them is in the CSS.
                  A zero-count series is omitted rather than rendered at zero height — an
                  empty first child would otherwise take the 4px rounded cap that belongs to
                  whichever segment is actually on top (2026 has projects but no awards).
                */}
                {b.awards > 0 && (
                  <span
                    className="mseg"
                    style={{ "--sw": SERIES.awards, flexGrow: b.awards } as React.CSSProperties}
                    title={`${b.year} · ${text(UI.statAwards, lang)} ${b.awards}`}
                  />
                )}
                {b.projects > 0 && (
                  <span
                    className="mseg"
                    style={{ "--sw": SERIES.projects, flexGrow: b.projects } as React.CSSProperties}
                    title={`${b.year} · ${text(UI.statProjects, lang)} ${b.projects}`}
                  />
                )}
              </div>
              <span className="mx">{b.year}</span>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        id={tableId}
        caption={text(UI.metricOutput, lang)}
        columns={[text(UI.metricOutput, lang), text(UI.statAwards, lang), text(UI.statProjects, lang)]}
        rows={outputByYear.map((b) => [b.year, String(b.awards), String(b.projects)])}
      />
    </section>
  );
}

/* ─────────────────  award grades: ordinal bars  ───────────────── */

/**
 * Grade → step of the validated ordinal ramp, by the grade's own weight.
 *
 * The grades are ordinal, not nominal — swapping 대상 and 입선 would change what the chart
 * says — so they take one hue in monotone lightness steps rather than separate hues. Two
 * grades sharing a step is correct where they genuinely share a tier (대상/국가장학 both
 * weight 4), and the bar's own label tells them apart.
 */
const stepForWeight = (weight: number): string => RAMP[Math.max(0, Math.min(RAMP.length - 1, 4 - weight))] ?? RAMP[2];

function GradePanel({ lang }: { lang: "ko" | "en" }) {
  const tableId = useId();
  const max = Math.max(...gradeDistribution.map((g) => g.count), 1);

  return (
    <section className="mpanel rise" style={{ "--i": 2 } as React.CSSProperties}>
      <span className="regmarks" aria-hidden="true" />
      <header>
        <Txt v={UI.metricGrades} as="h3" />
        <Txt v={UI.metricGradesNote} as="span" className="mnote" />
      </header>

      <div className="mplot">
        <div className="mbars" role="img" aria-describedby={tableId}>
          {gradeDistribution.map(({ rank, count }, n) => (
            <div className="mbar" key={rank.key} title={`${rank.key} ${count}`}>
              <span className="mlabel" lang="ko">
                {rank.key}
              </span>
              <span className="mval">{count}</span>
              <span className="mtrack">
                <i
                  className="mfill"
                  style={
                    {
                      "--w": `${(count / max) * 100}%`,
                      "--sw": stepForWeight(rank.weight),
                      "--i": n,
                    } as React.CSSProperties
                  }
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        id={tableId}
        caption={text(UI.metricGrades, lang)}
        columns={[text(UI.metricGrades, lang), text(UI.statAwards, lang)]}
        rows={gradeDistribution.map(({ rank, count }) => [
          lang === "ko" ? rank.key : rank.en,
          String(count),
        ])}
      />
    </section>
  );
}

/* ─────────────────  depth of evidence: single-series bars + the honest counterweight  ───────────────── */

function DepthPanel({ lang }: { lang: "ko" | "en" }) {
  const tableId = useId();
  const rows = tagDepth.slice(0, DEPTH_ROWS);
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="mpanel rise" style={{ "--i": 3 } as React.CSSProperties}>
      <span className="regmarks" aria-hidden="true" />
      <header>
        <Txt v={UI.metricDepth} as="h3" />
        <span className="mnote">{text(UI.metricDepthNote, lang).replace("{n}", String(rows.length))}</span>
      </header>

      <div className="mplot">
        {/* One series: the heading names what is plotted, so a one-swatch legend would only
            restate it and cost a row. */}
        <div className="mbars" role="img" aria-describedby={tableId}>
          {rows.map((r, n) => (
            <div className="mbar" key={r.tag} title={`${r.tag} — ${r.count}`}>
              <span className="mlabel">{r.tag}</span>
              <span className="mval">{r.count}</span>
              <span className="mtrack">
                <i
                  className="mfill"
                  style={
                    { "--w": `${(r.count / max) * 100}%`, "--sw": SOLO, "--i": n } as React.CSSProperties
                  }
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* A single headline number is a stat tile, not a one-bar chart. */}
      <p className="mstat">
        <b>
          {tagsProvenOnce} / {totalTags}
        </b>
        <Txt v={UI.metricThin} as="span" />
      </p>

      <DataTable
        id={tableId}
        caption={text(UI.metricDepth, lang)}
        columns={[text(UI.metricDepth, lang), text(UI.works, lang)]}
        rows={tagDepth.map((r) => [r.tag, String(r.count)])}
      />
    </section>
  );
}

/* ─────────────────  the table view every chart is described by  ───────────────── */

/**
 * The same numbers as a real table, visually hidden and wired to the chart through
 * `aria-describedby`.
 *
 * This is what makes `role="img"` on the plot honest: a screen reader gets the figures rather
 * than a shrug, and it satisfies the requirement that a chart always have a table view — here
 * without spending any of a single fixed screen on it. The depth table lists all
 * {totalTags} tags, not only the ten bars drawn, so nothing is gated behind the truncation.
 */
function DataTable({
  id,
  caption,
  columns,
  rows,
}: {
  id: string;
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <table id={id} className="sr-only-live">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.join("|")}>
            {r.map((cell, i) =>
              i === 0 ? (
                <th key={cell} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={`${r[0]}-${i}`}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
