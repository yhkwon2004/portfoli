"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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

/** The viewport box of whatever was pressed to open the sheet. */
export type Origin = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

type Props = {
  /** The record on screen, or null when the sheet is closed. */
  item: Item | null;
  /** The set the record came from, so ← → can step it without closing. */
  set: readonly Item[];
  /** Where the sheet opens out of — the tile, card or chip that was pressed — if known. */
  origin: Origin | null;
  /** The motion gate: off, the sheet simply fades as it always did. */
  animate: boolean;
  onStep: (delta: number) => void;
  onClose: () => void;
};

const HERO_SIZES = "min(1140px, 93vw)";
const GAL_SIZES = "(max-width: 860px) 45vw, 184px";

/** The container transform: how long the sheet takes to open out of its tile. */
const OPEN_MS = 620;
const EASE_IO = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * The full record.
 *
 * Opened from a tile, a pick card, a capability chip or the focus panel. ← → step the same
 * set — all 35 awards or all 35 works — so you can read the whole run without closing and
 * re-opening the sheet 35 times.
 *
 * ── motion ──
 * The sheet opens *out of* the thing that was pressed: a container transform. It is laid out
 * at full size from the first frame, clipped to the rectangle of the tile, and the clip opens
 * to the whole sheet while a hairline frame flies from the tile's box to the sheet's — so the
 * eye follows one object growing, rather than a panel appearing in the middle of the screen.
 * Closing runs the frame back to where it came from. Stepping a record wipes the new one in
 * from the side it came from: → from the right, ← from the left.
 *
 * The record stays rendered while the sheet fades out. Before, the content was removed the
 * instant the sheet was asked to close, so for 400 ms the visitor watched an empty frame fade.
 */
export function Dossier({ item, set, origin, animate, onStep, onClose }: Props) {
  const lang = useLang();
  const sheetRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const open = item !== null;

  /*
   * The record on display, and which way the last step went — both derived during render, the
   * documented way to track "previous" without an effect (and without a frame of the wrong
   * record). `shown` holds the last record after close so it can fade with the sheet.
   */
  const [shown, setShown] = useState<{ item: Item | null; dir: 1 | -1; open: boolean }>({
    item,
    dir: 1,
    open,
  });
  const view = item ?? shown.item;
  if (view !== shown.item || open !== shown.open) {
    // A step is a change of record while the sheet stays open; an opening always enters
    // forward, whatever record was on the sheet the last time it was closed.
    const stepping = open && shown.open && shown.item !== null;
    const back = stepping && item !== null && shown.item !== null && set.indexOf(item) < set.indexOf(shown.item);
    setShown({ item: view, dir: back ? -1 : 1, open });
  }
  const at = view ? set.indexOf(view) : -1;

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

  /*
   * The container transform. A layout effect: the sheet has just been laid out open, and the
   * clip has to be on it before that frame is painted, or it flashes full-size for one frame.
   *
   * The destination is computed from the sheet's layout size rather than read off its box,
   * because at this instant its CSS transition is still at the closed state's scale.
   */
  const wasOpen = useRef(false);
  const openedFrom = useRef<Origin | null>(null);
  useLayoutEffect(() => {
    const opening = open && !wasOpen.current;
    const closing = !open && wasOpen.current;
    wasOpen.current = open;
    const sheet = sheetRef.current;
    const zoom = zoomRef.current;
    if (!animate || !sheet || !zoom || (!opening && !closing)) return;

    if (opening) openedFrom.current = origin;
    const from = openedFrom.current;
    if (!from) return;

    const w = sheet.offsetWidth;
    const h = sheet.offsetHeight;
    const to = { x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2, w, h };
    const box = (r: Origin) => ({
      left: `${r.x}px`,
      top: `${r.y}px`,
      width: `${r.w}px`,
      height: `${r.h}px`,
    });

    if (opening) {
      // The tile's rectangle, expressed as insets of the open sheet.
      const clip = `inset(${from.y - to.y}px ${to.x + to.w - (from.x + from.w)}px ${
        to.y + to.h - (from.y + from.h)
      }px ${from.x - to.x}px)`;
      const a = sheet.animate(
        [
          { clipPath: clip, opacity: 0.5, transform: "none" },
          { clipPath: "inset(0px 0px 0px 0px)", opacity: 1, transform: "none" },
        ],
        { duration: OPEN_MS, easing: EASE_IO },
      );
      const z = zoom.animate(
        [
          { ...box(from), opacity: 1 },
          { ...box(to), opacity: 1, offset: 0.78 },
          { ...box(to), opacity: 0 },
        ],
        { duration: OPEN_MS + 120, easing: EASE_IO },
      );
      return () => {
        a.cancel();
        z.cancel();
      };
    }

    // Closing: the frame shrinks back into the tile it came out of, while the sheet fades.
    const z = zoom.animate(
      [
        { ...box(to), opacity: 0.9 },
        { ...box(from), opacity: 0.9, offset: 0.8 },
        { ...box(from), opacity: 0 },
      ],
      { duration: 480, easing: EASE_IO },
    );
    return () => z.cancel();
  }, [open, animate, origin]);

  const rank = view ? rankOf(view) : null;
  const lead = view ? cover(view) : null;
  const rest = view ? gallery(view) : [];
  const badge = view ? (rank ? rank.key : view.featured ? text(UI.featured, lang) : "") : "";

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
        {view && (
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

            {/* Re-keyed per record, so the entrance plays on every step, from the step's side. */}
            <div
              className="sheet-body"
              key={view.id}
              style={{ "--sd": shown.dir } as React.CSSProperties}
            >
              <div
                className="hero"
                style={{ "--rk": rank ? rank.color : "var(--color-sand)" } as React.CSSProperties}
              >
                {lead && <Img master={lead.u} alt={lead.a} sizes={HERO_SIZES} priority />}
                <div className="cap">
                  <span className="tagrow">
                    <span className="drank">{badge}</span>
                    <span className="dyear">{view.year}</span>
                  </span>
                  <Txt v={view.t} as="h2" />
                  <span id={titleId} className="sr-only-live">
                    {text(view.t, lang)}
                  </span>
                </div>
              </div>

              <div className="pad">
                <Txt v={view.s} as="p" className="lede" />
                {topicTags(view).length > 0 && (
                  <div className="tags">
                    {topicTags(view).map((t, n) => (
                      <span className="tag" key={t} style={{ "--k": n } as React.CSSProperties}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <DetailCards item={view} />
                {rest.length > 0 && (
                  <div className="gal">
                    {rest.map((m) => (
                      <Img key={m.u} master={m.u} alt={m.a} sizes={GAL_SIZES} />
                    ))}
                  </div>
                )}
                {view.links && view.links.length > 0 && (
                  <div className="links">
                    {view.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {/* The flying frame of the container transform. Decorative, and parked when idle. */}
      <i className="zoomrect" ref={zoomRef} aria-hidden="true" />
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
      {entries.map(([key, value], n) => (
        <section key={key} lang="ko" style={{ "--k": n } as React.CSSProperties}>
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
