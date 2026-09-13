"use client";

import { Txt } from "@/components/Txt";
import { CHAPTERS, LAST } from "@/data/chapters";
import { LANGS } from "@/lib/i18n";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import type { Lang } from "@/lib/types";

/** Notional reel pace. Nothing is actually timed; this only has to look like footage. */
const SECONDS_PER_CHAPTER = 12;

/** `hh:mm:ss`, with each field kept in range. */
function timecode(totalSeconds: number): string {
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
}

type Props = {
  chapter: number;
  onGo: (n: number) => void;
  onLang: (l: Lang) => void;
  chaptersId: string;
};

/**
 * The frame's instrumentation: recording light, language switch, chapter rail, timecode,
 * step buttons and the draining progress bar.
 *
 * The chapter number and name are read out of CHAPTERS by index, so inserting a chapter
 * renumbers the rail, the slates and the timecode at once with nothing to edit by hand.
 */
export function Hud({ chapter, onGo, onLang, chaptersId }: Props) {
  const lang = useLang();
  const progress = chapter / LAST;

  return (
    <div className="hud">
      <div className="topbar">
        <div className="rec">
          <i aria-hidden="true" />
          <span>{UI.rec}</span>
        </div>
        <div className="lang">
          {LANGS.map((l, n) => (
            <span key={l}>
              {n > 0 && <span aria-hidden="true"> / </span>}
              <button
                type="button"
                onClick={() => onLang(l)}
                aria-pressed={l === lang}
                // The label is in the language it switches to — the one string on the site
                // that must not follow the active language.
                lang={l}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
      </div>

      <nav className="chapters" id={chaptersId} aria-label={text(UI.chapterNav, lang)}>
        {CHAPTERS.map((c, n) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onGo(n)}
            aria-current={n === chapter}
          >
            <Txt v={c.name} as="span" />
            <span className="tick" aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="footbar">
        {/*
          A timecode, not a clock: 12 seconds per chapter is a plausible reel pace and makes
          the frame read as footage. Nothing measures real elapsed time, so nothing can drift.

          Carried properly into minutes. The original printed the seconds straight into the
          middle field, so from chapter 6 on it read "00:72:00" and by the end "00:120:00" —
          a minute count no timecode can have. Adding a chapter here made it "00:132:00".
        */}
        <div className="timecode" aria-hidden="true">
          {timecode(chapter * SECONDS_PER_CHAPTER)}
        </div>
        <div className="nav-btns">
          <button
            type="button"
            onClick={() => onGo(chapter - 1)}
            disabled={chapter === 0}
            aria-label={text(UI.prevScene, lang)}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onGo(chapter + 1)}
            disabled={chapter === LAST}
            aria-label={text(UI.nextScene, lang)}
          >
            ↓
          </button>
        </div>
      </div>

      <div
        className="drain"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={CHAPTERS.length}
        aria-valuenow={chapter + 1}
        aria-label={text(UI.chapterNav, lang)}
      >
        <i style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
