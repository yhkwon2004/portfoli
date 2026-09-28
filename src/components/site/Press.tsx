"use client";

import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { SectionHead } from "@/components/site/SectionHead";
import { PRESS, type Press as PressT } from "@/data/press";
import { UI } from "@/data/ui";
import { text } from "@/lib/i18n";
import { itemById } from "@/lib/select";

type OpenFn = (id: string, from?: HTMLElement | null) => void;

/** "2026-06-02" → "2026.06.02" */
const date = (d: string) => d.replaceAll("-", ".");

/**
 * Press: what the university and its programmes published about the work, newest first. The
 * lead story runs large; the rest follow as a quiet grid. Every card says whether the report
 * names the author or only covers an event they were part of, credits its photograph, and
 * links to the original — the card is a pointer to the source, never a substitute for it.
 */
export function Press({ onOpen }: { onOpen: OpenFn }) {
  const [lead, ...rest] = [...PRESS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="section press" id="press" aria-labelledby="press-title">
      <div className="wrap">
        <SectionHead idx="06" label={UI.pressIdx} a={UI.pressTitleA} b={UI.pressTitleB} note={UI.pressNote} id="press-title" />
        {lead && <Story p={lead} lead onOpen={onOpen} />}
        <ul className="press-grid">
          {rest.map((p, n) => (
            <li key={p.id} data-reveal="up" style={{ "--d": (n % 3) * 80 } as React.CSSProperties}>
              <Story p={p} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Story({ p, lead = false, onOpen }: { p: PressT; lead?: boolean; onOpen: OpenFn }) {
  const lang = useLang();
  const record = p.related.map((id) => itemById(id)).find(Boolean);
  return (
    <article className={`story${lead ? " story-lead" : ""}`} data-reveal={lead ? "up" : undefined}>
      <a className="story-media" href={p.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
        <Img master={p.image.u} alt="" sizes={lead ? "(max-width: 860px) 92vw, 58vw" : "(max-width: 860px) 92vw, 30vw"} />
      </a>
      <div className="story-body">
        <p className="story-meta mono">
          <span>{date(p.date)}</span>
          <Txt v={p.publisher} />
          <span className={`story-rel${p.relation === "direct" ? " is-direct" : ""}`}>
            <Txt v={p.relation === "direct" ? UI.relDirect : UI.relRelated} />
          </span>
        </p>
        <h3 className="story-title">
          <a href={p.url} target="_blank" rel="noopener noreferrer">
            <Txt v={p.title} />
          </a>
        </h3>
        {p.original && (
          <p className="story-orig" lang="ko">
            “{p.original}”
          </p>
        )}
        {lead && <Txt v={p.summary} as="p" className="story-sum" />}
        <p className="story-foot">
          <a className="story-link" href={p.url} target="_blank" rel="noopener noreferrer">
            <Txt v={UI.readArticle} /> <span aria-hidden="true">↗</span>
          </a>
          {record && (
            <button type="button" className="story-link" onClick={(e) => onOpen(record.id, e.currentTarget)}>
              <Txt v={UI.relatedRecord} /> <span aria-hidden="true">→</span>
            </button>
          )}
          <span className="story-credit mono">
            {text(UI.photoBy, lang)} · {p.image.credit.label}
          </span>
        </p>
      </div>
    </article>
  );
}
