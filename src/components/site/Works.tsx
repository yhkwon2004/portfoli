"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { SectionHead } from "@/components/site/SectionHead";
import { useMotion } from "@/components/site/MotionContext";
import { aiMedia, aiWorkFor } from "@/data/ai";
import { topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { asset } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { cover, domains, domainsOf, projects, year } from "@/lib/select";
import type { Item } from "@/lib/types";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

const SIZES = "(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw";

/**
 * Every work, filterable by field. A filter never re-colours or re-orders what survives — the
 * cards that stay glide to their new places (a FLIP: measured before, measured after, and
 * animated across the difference), and the ones that leave simply go.
 */
export function Works({ onOpen }: { onOpen: OpenFn }) {
  const lang = useLang();
  const { motion } = useMotion();
  const [filter, setFilter] = useState(-1);
  const grid = useRef<HTMLUListElement>(null);
  const before = useRef<Map<string, DOMRect>>(new Map());

  const list = filter < 0 ? projects : projects.filter((p) => domainsOf(p).includes(filter));
  const counts = domains.map((_, n) => projects.filter((p) => domainsOf(p).includes(n)).length);

  const pick = (n: number) => {
    const g = grid.current;
    if (g && motion) {
      before.current = new Map(
        Array.from(g.querySelectorAll<HTMLElement>("[data-id]")).map((el) => [el.dataset.id ?? "", el.getBoundingClientRect()]),
      );
    }
    setFilter(n);
  };

  useLayoutEffect(() => {
    const g = grid.current;
    const prev = before.current;
    if (!g || !prev.size) return;
    g.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      const was = prev.get(el.dataset.id ?? "");
      const now = el.getBoundingClientRect();
      if (!was) {
        el.animate([{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "none" }], {
          duration: 520,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        });
        return;
      }
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
        duration: 700,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    });
    before.current = new Map();
  }, [filter]);

  return (
    <section className="section works" id="works" aria-labelledby="works-title">
      <div className="wrap">
        <SectionHead idx="04" label={UI.worksIdx} a={UI.worksTitleA} b={UI.worksTitleB} id="works-title">
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
        </SectionHead>
        <p className="works-count label" aria-live="polite">
          {list.length} <Txt v={UI.shown} />
        </p>
        <ul className="works-grid" ref={grid}>
          {list.map((w, n) => (
            <li key={w.id} data-id={w.id} data-reveal="up" style={{ "--d": (n % 3) * 70 } as React.CSSProperties}>
              <WorkCard item={w} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WorkCard({ item, onOpen }: { item: Item; onOpen: OpenFn }) {
  const lang = useLang();
  const { motion } = useMotion();
  const ai = aiWorkFor(item.id);
  const media = ai ? aiMedia(ai.visual) : null;
  const img = cover(item);
  const video = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const tags = topicTags(item).slice(0, 3);
  const y = year(item);

  return (
    <button
      type="button"
      className="work glass spot"
      data-tilt=""
      data-cursor="OPEN"
      data-ai={!!ai || undefined}
      onClick={(e) => onOpen(item.id, e.currentTarget)}
      onPointerEnter={() => {
        setHover(true);
        if (motion) video.current?.play().catch(() => {});
      }}
      onPointerLeave={() => {
        setHover(false);
        video.current?.pause();
      }}
      aria-label={[text(item.t, lang), y, item.honor ? `${text(item.honor.event, lang)} ${text(item.honor.grade, lang)}` : ""]
        .filter(Boolean)
        .join(" · ")}
    >
      <span className="work-media" data-vt="">
        {media ? (
          <>
            <img src={asset(media.poster)} alt="" loading="lazy" />
            {motion && (
              <video
                ref={video}
                src={hover ? asset(media.video) : undefined}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                data-on={hover}
              />
            )}
          </>
        ) : img ? (
          <Img master={img.u} alt="" sizes={SIZES} />
        ) : (
          <span className="work-blank mono" aria-hidden="true">
            {item.t.en.slice(0, 2).toUpperCase()}
          </span>
        )}
        {item.featured && (
          <span className="work-flag mono">
            ★ <Txt v={UI.featured} />
          </span>
        )}
      </span>
      <span className="work-body">
        <span className="work-meta mono">
          <span>{y || "AI"}</span>
          {item.honor && <span className="work-honor">{text(item.honor.grade, lang)}</span>}
        </span>
        <Txt v={item.t} as="span" className="work-title" />
        <span className="work-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      </span>
      <span className="work-arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
    </button>
  );
}
