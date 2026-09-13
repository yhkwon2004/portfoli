"use client";

import { useEffect, useId, useRef } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { DETAIL_LABELS } from "@/data/labels";
import { rankOf, topicTags } from "@/data/ranks";
import { cover, gallery } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { UI } from "@/data/ui";
import type { DetailKey, Item } from "@/lib/types";

type Props = {
  /** The record on screen, or null when the sheet is closed. */
  item: Item | null;
  /** The set the record came from, so ← → can step it without closing. */
  set: readonly Item[];
  onStep: (delta: number) => void;
  onClose: () => void;
};

const HERO_SIZES = "min(1140px, 93vw)";
const GAL_SIZES = "(max-width: 860px) 45vw, 184px";

/**
 * The full record.
 *
 * Opened from a tile, a pick card, a capability chip or the focus panel. ← → step the same
 * set — all 35 awards or all 35 works — so you can read the whole run without closing and
 * re-opening the sheet 35 times.
 */
export function Dossier({ item, set, onStep, onClose }: Props) {
  const lang = useLang();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const open = item !== null;
  const at = item ? set.indexOf(item) : -1;

  useFocusTrap(sheetRef, open);

  // Esc closes; the arrows step the set. Capturing means the projector never sees these while
  // the sheet is open, so an arrow press cannot change chapter behind the visitor's back.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onStep(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onStep(-1);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose, onStep]);

  // The sheet is the one scrollable surface on the site; reset it on every record so a long
  // one does not leave the next opened halfway down.
  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
  }, [item]);

  const rank = item ? rankOf(item) : null;
  const lead = item ? cover(item) : null;
  const rest = item ? gallery(item) : [];
  const badge = item ? (rank ? rank.key : item.featured ? text(UI.featured, lang) : "") : "";

  return (
    <div
      className="dossier"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-labelledby={open ? titleId : undefined}
      aria-label={open ? undefined : text(UI.dialogLabel, lang)}
      // Clicking the backdrop closes; clicks inside the sheet must not.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // `inert` keeps the closed sheet out of the tab order and the a11y tree entirely, which
      // `visibility: hidden` alone does not reliably do across browsers.
      {...(!open ? { inert: true } : {})}
    >
      <div className="sheet" ref={sheetRef}>
        {item && (
          <>
            <div className="bar-top">
              <button type="button" onClick={onClose}>
                ✕ <Txt v={UI.close} />
              </button>
              <span className="steps">
                <span className="dpos">
                  {String(at + 1).padStart(2, "0")} / {set.length}
                </span>
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  disabled={at <= 0}
                  aria-label={text(UI.prevRecord, lang)}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  disabled={at >= set.length - 1}
                  aria-label={text(UI.nextRecord, lang)}
                >
                  →
                </button>
              </span>
            </div>

            <div
              className="hero"
              style={{ "--rk": rank ? rank.color : "var(--color-sand)" } as React.CSSProperties}
            >
              {lead && <Img master={lead.u} alt={lead.a} sizes={HERO_SIZES} priority />}
              <div className="cap">
                <span className="tagrow">
                  <span className="drank">{badge}</span>
                  <span className="dyear">{item.year}</span>
                </span>
                <Txt v={item.t} as="h2" />
                <span id={titleId} className="sr-only-live">
                  {text(item.t, lang)}
                </span>
              </div>
            </div>

            <div className="pad">
              <Txt v={item.s} as="p" className="lede" />
              {topicTags(item).length > 0 && (
                <div className="tags">
                  {topicTags(item).map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <DetailCards item={item} />
              {rest.length > 0 && (
                <div className="gal">
                  {rest.map((m) => (
                    <Img key={m.u} master={m.u} alt={m.a} sizes={GAL_SIZES} />
                  ))}
                </div>
              )}
              {item.links && item.links.length > 0 && (
                <div className="links">
                  {item.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The record's detail fields, two columns on a wide sheet. Headings come from the explicit
 * table in src/data/labels.ts; the bodies are Korean-only in the source data, so each card is
 * marked `lang="ko"` rather than inheriting a document language it is not written in.
 */
function DetailCards({ item }: { item: Item }) {
  const entries = Object.entries(item.details ?? {}) as [DetailKey, string | readonly string[]][];
  if (entries.length === 0) return null;

  return (
    <div className="det">
      {entries.map(([key, value]) => (
        <section key={key} lang="ko">
          <Txt v={DETAIL_LABELS[key]} as="h3" />
          {Array.isArray(value) ? (
            <ul>
              {value.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p>{value as string}</p>
          )}
        </section>
      ))}
    </div>
  );
}
