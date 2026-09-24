"use client";

import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { rankOf, topicTags } from "@/data/ranks";
import { cover } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import type { Item } from "@/lib/types";

type Props = {
  item: Item | undefined;
  position: number;
  total: number;
  /** Awards are portrait documents: contain them rather than crop them. */
  contain?: boolean;
  /** Bumped on each turn, so the sweep and the blur-in re-fire. */
  turn: number;
  /** Which way the reel turned: the new record wipes in from that side. */
  dir?: 1 | -1;
  onOpen: (id: string) => void;
};

/** The panel is ~37% of the frame on wide screens, full width on narrow ones. */
const PANEL_SIZES = "(max-width: 860px) 34vw, 30vw";

/**
 * The reading surface beside a wall.
 *
 * Every block reserves its full height, so a short record leaves a gap rather than shuffling
 * everything below it upward mid-reel — the panel is showing 35 records in sequence, and a
 * layout that resized on each would be unreadable.
 */
export function FocusPanel({ item, position, total, contain = false, turn, dir = 1, onOpen }: Props) {
  const lang = useLang();
  if (!item) return null;

  const rank = rankOf(item);
  const img = cover(item);
  const badge = rank ? rank.key : item.featured ? text(UI.featured, lang) : "";

  return (
    <figure
      className={`focus${contain ? " contain" : ""}`}
      style={{ "--rk": rank ? rank.color : "var(--color-sand)", "--rd": dir } as React.CSSProperties}
      // The key restarts the sweep and blur-in animations; without it CSS would only play
      // them once, on mount.
      key={turn}
      data-turn="true"
    >
      {/* The reference frames its panels with corner crosshairs; so does a film gate. */}
      <span className="regmarks" aria-hidden="true" />
      <button
        type="button"
        className="fimg"
        onClick={() => onOpen(item.id)}
        aria-label={`${text(item.t, lang)} — ${text(UI.picksHint, lang)}`}
      >
        {img && <Img master={img.u} alt={img.a} sizes={PANEL_SIZES} priority />}
        <i className="sweep" aria-hidden="true" />
      </button>
      <figcaption className="fbody">
        <span className="fhead">
          <span className="frank">{badge}</span>
          <Decode v={item.year} className="fyear" delay={60} />
        </span>
        {/*
          A turn is a small title sequence: the title sets itself word by word, and the summary,
          the points and the tags follow it down the panel in that order.
        */}
        <Kinetic
          v={item.t}
          as="h3"
          by="word"
          className="ftitle"
          style={{ "--kin-at": "0.1s", "--kin-step": "0.04s", "--kin-dur": "0.7s" } as React.CSSProperties}
        />
        <Txt v={item.s} as="p" className="fsum" />
        <ul className="fpoints">
          {bullets(item).map((b, n) => (
            <li key={b} lang="ko" style={{ "--k": n } as React.CSSProperties}>
              {b}
            </li>
          ))}
        </ul>
        <span className="ftags">
          {topicTags(item)
            .slice(0, 6)
            .map((t, n) => (
              <span key={t} style={{ "--k": n } as React.CSSProperties}>
                {t}
              </span>
            ))}
        </span>
        <span className="fnav">
          <b className="fpos">
            {String(position).padStart(2, "0")} / {total}
          </b>
          <Txt v={UI.focusHint} as="span" className="fhint" />
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * The richest three lines a record has. The first array in `details` is whichever of
 * 핵심포인트 / 핵심기능 / 주요기술활동 that record happens to carry — they are alternative
 * spellings of the same thing across the source data, so taking the first array found beats
 * naming them all and missing one.
 *
 * Korean-only in the source, hence `lang="ko"` on the list items above.
 */
function bullets(item: Item): readonly string[] {
  const firstList = Object.values(item.details ?? {}).find(
    (v): v is readonly string[] => Array.isArray(v) && v.length > 0,
  );
  return (firstList ?? []).slice(0, 3);
}
