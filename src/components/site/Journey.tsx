"use client";

import { useEffect, useRef } from "react";
import { Txt } from "@/components/Txt";
import { SectionHead } from "@/components/site/SectionHead";
import { UI } from "@/data/ui";
import { clamp01, onScrollFrame } from "@/lib/scroll";
import { certifications, education, experience } from "@/lib/select";
import type { Item } from "@/lib/types";

/** "2023-2029" → "2023 — 2029". */
const span = (y: string) => y.replace("-", " — ");

/** Some school records' summary is only their date range again — the year line already says it. */
const restates = (item: Item) => item.s.ko.replace(/\D/g, "") === item.year.replace(/\D/g, "");

/**
 * Schooling and roles on one vertical line that draws itself down as the reader passes it;
 * each stop lights when the line reaches it. Credentials sit beside, as the ledger they are.
 */
export function Journey() {
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = line.current;
    if (!el) return;
    return onScrollFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01((vh * 0.62 - r.top) / r.height);
      el.style.setProperty("--tp", p.toFixed(4));
      el.querySelectorAll<HTMLElement>(".stop").forEach((s) => {
        const top = s.offsetTop / r.height;
        s.dataset.lit = String(p >= top);
      });
    });
  }, []);

  const Stop = ({ item }: { item: Item }) => (
    <li className="stop">
      <span className="stop-dot" aria-hidden="true" />
      <span className="stop-year mono">{span(item.year)}</span>
      <Txt v={item.t} as="h4" className="stop-title" />
      {!restates(item) && <Txt v={item.s} as="p" className="stop-sub" />}
    </li>
  );

  return (
    <section className="section journey" id="journey" aria-labelledby="journey-title">
      <div className="wrap">
        <SectionHead idx="06" label={UI.journeyIdx} a={UI.journeyTitleA} b={UI.journeyTitleB} id="journey-title" />
        <div className="journey-grid">
          <div className="timeline" ref={line}>
            <i className="tl-line" aria-hidden="true" />
            <Txt v={UI.education} as="p" className="label tl-group" />
            <ol>
              {education.map((e) => (
                <Stop key={e.id} item={e} />
              ))}
            </ol>
            <Txt v={UI.experience} as="p" className="label tl-group" />
            <ol>
              {experience.map((e) => (
                <Stop key={e.id} item={e} />
              ))}
            </ol>
          </div>
          <aside className="creds glass" data-reveal="up">
            <Txt v={UI.credentials} as="h3" className="label" />
            <ol>
              {certifications.map((c) => (
                <li key={c.id}>
                  <span className="mono">{c.year}</span>
                  <Txt v={c.t} as="span" />
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
