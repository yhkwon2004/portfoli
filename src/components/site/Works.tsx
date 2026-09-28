"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { SectionHead } from "@/components/site/SectionHead";
import { usePreview } from "@/components/site/Preview";
import { useMotion } from "@/components/site/MotionContext";
import { aiMedia, aiWorkFor, isScene } from "@/data/ai";
import { topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { asset, src } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { cover, domains, domainsOf, projects, year } from "@/lib/select";
import type { Item } from "@/lib/types";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/** The picture a work is shown by: its rendered poster if it is an AI scene, else its cover. */
function pictureOf(item: Item): { url: string; master: string | null } | null {
  const ai = aiWorkFor(item.id);
  if (ai && isScene(ai.visual)) return { url: asset(aiMedia(ai.visual).poster), master: null };
  const c = cover(item);
  return c ? { url: src(c.u, "thumb"), master: c.u } : null;
}

/**
 * The work, in two registers. First a few selected pieces, large, as pictures. Then the whole
 * body of work as an index — a typographic list that shows each piece's picture only when the
 * pointer asks for it, filterable by field. A filter never re-orders what survives: the rows
 * that stay glide to their new places (a FLIP) and the ones that leave simply go.
 */
export function Works({ onOpen }: { onOpen: OpenFn }) {
  const lang = useLang();
  const { motion } = useMotion();
  const [filter, setFilter] = useState(-1);
  const list = useRef<HTMLOListElement>(null);
  const before = useRef<Map<string, DOMRect>>(new Map());
  const preview = usePreview();

  // The AI works have a section of their own above; the selection here is the rest of the best.
  const selected = projects.filter((p) => p.featured && !aiWorkFor(p.id)).slice(0, 4);
  const rows = filter < 0 ? projects : projects.filter((p) => domainsOf(p).includes(filter));
  const counts = domains.map((_, n) => projects.filter((p) => domainsOf(p).includes(n)).length);

  const pick = (n: number) => {
    const g = list.current;
    if (g && motion) {
      before.current = new Map(
        Array.from(g.querySelectorAll<HTMLElement>("[data-id]")).map((el) => [el.dataset.id ?? "", el.getBoundingClientRect()]),
      );
    }
    setFilter(n);
  };

  useLayoutEffect(() => {
    const g = list.current;
    const prev = before.current;
    if (!g || !prev.size) return;
    g.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      const was = prev.get(el.dataset.id ?? "");
      const now = el.getBoundingClientRect();
      if (!was) {
        el.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], {
          duration: 560,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
        return;
      }
      const dy = was.top - now.top;
      if (Math.abs(dy) < 1) return;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
        duration: 760,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    });
    before.current = new Map();
  }, [filter]);

  return (
    <section className="section works" id="works" aria-labelledby="works-title">
      <div className="wrap">
        <SectionHead idx="04" label={UI.worksIdx} a={UI.worksTitleA} b={UI.worksTitleB} id="works-title" />

        <Txt v={UI.selected} as="h3" className="label works-sub" />
        <ul className="works-selected">
          {selected.map((w, n) => (
            <li key={w.id} data-reveal="up" style={{ "--d": (n % 2) * 90 } as React.CSSProperties} data-id={w.id}>
              <Feature item={w} n={n} onOpen={onOpen} />
            </li>
          ))}
        </ul>

        <div className="works-index-head">
          <Txt v={UI.index} as="h3" className="label works-sub" />
          <div className="filters" role="group" aria-label={text(UI.filterLabel, lang)}>
            <button type="button" className="chip" aria-pressed={filter < 0} onClick={() => pick(-1)}>
              <Txt v={UI.filterAll} /> <b>{projects.length}</b>
            </button>
            {domains.map((d, n) => (
              <button key={d.name.en} type="button" className="chip" aria-pressed={filter === n} onClick={() => pick(n)}>
                <Txt v={d.name} /> <b>{counts[n]}</b>
              </button>
            ))}
          </div>
        </div>
        <p className="works-count label" aria-live="polite">
          {rows.length} <Txt v={UI.shown} />
        </p>

        <div className="wx-cols label" aria-hidden="true">
          <span>No.</span>
          <Txt v={UI.colTitle} as="span" />
          <Txt v={UI.colField} as="span" />
          <Txt v={UI.colYear} as="span" />
        </div>
        <ol className="works-index" ref={list} onPointerMove={preview.move} onPointerLeave={preview.hide}>
          {rows.map((w) => {
            const pic = pictureOf(w);
            const field = domainsOf(w)[0];
            const n = projects.indexOf(w) + 1;
            return (
              <li key={w.id} data-id={w.id}>
                <button
                  type="button"
                  className="wx-row"
                  data-ai={!!aiWorkFor(w.id) || undefined}
                  onClick={(e) => onOpen(w.id, e.currentTarget)}
                  onPointerEnter={(e) => preview.show(pic?.url ?? null, e)}
                  aria-label={[text(w.t, lang), year(w), w.honor ? `${text(w.honor.event, lang)} ${text(w.honor.grade, lang)}` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                >
                  <span className="wx-no mono">{String(n).padStart(2, "0")}</span>
                  <span className="wx-thumb" aria-hidden="true">
                    {pic && (pic.master ? <Img master={pic.master} alt="" sizes="96px" /> : <img src={pic.url} alt="" loading="lazy" />)}
                  </span>
                  <span className="wx-title">
                    <Txt v={w.t} />
                    {w.honor && <span className="wx-honor mono">{text(w.honor.grade, lang)}</span>}
                  </span>
                  <span className="wx-field">{field !== undefined ? text(domains[field]!.name, lang) : ""}</span>
                  <span className="wx-year mono">{year(w) || "—"}</span>
                  <span className="wx-arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16">
                      <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {preview.node}
    </section>
  );
}

function Feature({ item, n, onOpen }: { item: Item; n: number; onOpen: OpenFn }) {
  const lang = useLang();
  const pic = pictureOf(item);
  const tags = topicTags(item).slice(0, 3);
  const field = domainsOf(item)[0];
  return (
    <button
      type="button"
      className="feature"
      data-tilt=""
      data-cursor="OPEN"
      onClick={(e) => onOpen(item.id, e.currentTarget)}
      aria-label={[text(item.t, lang), year(item)].filter(Boolean).join(" · ")}
    >
      <span className="feature-media" data-vt="">
        {pic?.master ? (
          <Img master={pic.master} alt="" sizes="(max-width: 860px) 92vw, 46vw" />
        ) : pic ? (
          <img src={pic.url} alt="" loading="lazy" />
        ) : null}
        {item.imgs[0]?.concept && <Txt v={UI.conceptVisual} as="span" className="feature-concept mono" />}
      </span>
      <span className="feature-body">
        <span className="feature-meta mono">
          <span>{String(n + 1).padStart(2, "0")}</span>
          <span>{field !== undefined ? text(domains[field]!.name, lang) : ""}</span>
          <span>{year(item)}</span>
        </span>
        <Txt v={item.t} as="span" className="feature-title" />
        <span className="feature-tags">{tags.join(" · ")}</span>
      </span>
    </button>
  );
}
