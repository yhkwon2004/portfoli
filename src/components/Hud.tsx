"use client";

import { useLayoutEffect, useRef } from "react";
import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { CHAPTERS, LAST } from "@/data/chapters";
import { FPS, SECONDS_PER_CHAPTER } from "@/data/reel";
import { LANGS } from "@/lib/i18n";
import { text } from "@/lib/i18n";
import { clamp01, easeInOutCubic } from "@/lib/ease";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import type { Dir } from "@/hooks/useSceneMachine";
import type { Lang } from "@/lib/types";

/** `hh:mm:ss:ff`, with each field kept in range. */
function timecode(totalSeconds: number): string {
  const frames = Math.max(0, Math.floor(totalSeconds * FPS + 1e-6));
  const ff = frames % FPS;
  const whole = Math.floor(frames / FPS);
  const hh = Math.floor(whole / 3600);
  const mm = Math.floor((whole % 3600) / 60);
  const ss = whole % 60;
  return [hh, mm, ss, ff].map((n) => String(n).padStart(2, "0")).join(":");
}

/** How long the timecode takes to scrub from one chapter's mark to another's. */
const SCRUB_MS = 640;

type Props = {
  chapter: number;
  dir: Dir;
  onGo: (n: number) => void;
  onLang: (l: Lang) => void;
  onContact: () => void;
  chaptersId: string;
  playing: boolean;
  /** `performance.now()` when the current chapter's hold began, while playing. */
  playSince: number;
  onPlay: () => void;
  motionOn: boolean;
  /** The OS asks for reduced motion, which the switch cannot override. */
  motionLocked: boolean;
  onMotion: () => void;
  animate: boolean;
};

/**
 * The frame's instrumentation: recording light, language switch, chapter rail, timecode,
 * the projector's controls, step buttons and the draining progress bar.
 *
 * The chapter number and name are read out of CHAPTERS by index, so inserting a chapter
 * renumbers the rail, the slates and the timecode at once with nothing to edit by hand.
 */
export function Hud({
  chapter,
  dir,
  onGo,
  onLang,
  onContact,
  chaptersId,
  playing,
  playSince,
  onPlay,
  motionOn,
  motionLocked,
  onMotion,
  animate,
}: Props) {
  const lang = useLang();
  const progress = chapter / LAST;

  return (
    <div className="hud">
      <div className="topbar">
        <div className="rec">
          {/* The wordmark's triangle — drawn, not set, so it needs no glyph or asset. */}
          <i className="mark" aria-hidden="true" />
          <Decode v={UI.rec} delay={500} />
        </div>
        <div className="topright">
          {/*
            The one curve in a square frame, after the reference's Contact / Recruit pill.
            It sits in the chrome rather than in a chapter because a visitor who wants an
            address wants it from wherever they are, not a dozen cuts away.
          */}
          <button type="button" className="contact-pill" onClick={onContact}>
            <i aria-hidden="true" />
            <Txt v={UI.contactOpen} />
          </button>
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
      </div>

      <nav
        className="chapters"
        id={chaptersId}
        aria-label={text(UI.chapterNav, lang)}
        data-dir={dir}
        style={{ "--n": chapter } as React.CSSProperties}
      >
        {/*
          The playhead: one lit segment on a track down the rail, which travels to the current
          chapter instead of the highlight simply jumping there. Its two ends move at different
          times — the leading edge first, the trailing edge a beat later — so in flight it
          stretches toward where it is going and snaps back to size on arrival: follow-through,
          the difference between a thing that moves and a thing that is moved.
        */}
        <i className="ph-track" aria-hidden="true" />
        <i className="ph-head" aria-hidden="true" />
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
        <div className="footl">
          {/*
            A timecode, not a clock: 12 seconds per chapter is a plausible reel pace and makes
            the frame read as footage. At rest it sits on the chapter's mark; on a cut it scrubs
            to the next mark, frames flickering, the way a deck shuttles; and while PLAY runs it
            is the playhead itself, counting the chapter's twelve seconds in real time.

            Carried properly into minutes. The original printed the seconds straight into the
            middle field, so from chapter 6 on it read "00:72:00" and by the end "00:120:00" —
            a minute count no timecode can have. Adding a chapter here made it "00:132:00".
          */}
          <Timecode
            seconds={chapter * SECONDS_PER_CHAPTER}
            playing={playing}
            since={playSince}
            animate={animate}
          />
          <button
            type="button"
            className="playbtn"
            onClick={onPlay}
            aria-pressed={playing}
            title={text(UI.playHint, lang)}
          >
            <i aria-hidden="true" data-state={playing ? "pause" : "play"} />
            {/* Visually dropped on a phone, where the glyph alone has to fit; still the name. */}
            <span className="lbl">
              <Txt v={playing ? UI.pause : UI.play} />
            </span>
          </button>
          <button
            type="button"
            className="motionsw"
            role="switch"
            aria-checked={motionOn && !motionLocked}
            onClick={onMotion}
            disabled={motionLocked}
            title={motionLocked ? text(UI.motionLocked, lang) : undefined}
          >
            <span className="lbl">
              <Txt v={UI.motion} />
            </span>
            <i aria-hidden="true" />
            <b aria-hidden="true">{motionOn && !motionLocked ? "ON" : "OFF"}</b>
          </button>
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
        {/* While playing, the current chapter's segment fills over its twelve seconds. */}
        {playing && chapter < LAST && (
          <b
            key={chapter}
            className="drain-play"
            style={
              {
                "--from": progress,
                "--span": 1 / LAST,
                "--hold": `${SECONDS_PER_CHAPTER}s`,
              } as React.CSSProperties
            }
          />
        )}
      </div>
    </div>
  );
}

/**
 * The timecode, driven straight into its text node — it changes every frame while it scrubs or
 * plays, and nothing else in the HUD should re-render with it. At rest the node holds exactly
 * the string React rendered, so the two never disagree.
 */
function Timecode({
  seconds,
  playing,
  since,
  animate,
}: {
  seconds: number;
  playing: boolean;
  since: number;
  animate: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /** What is on screen right now, in seconds — where a scrub has to start from. */
  const shown = useRef(seconds);

  // A layout effect: React has just written the new chapter's mark into the node, and the
  // scrub has to put the old value back before that frame is painted.
  useLayoutEffect(() => {
    const node = ref.current?.firstChild;
    if (!node) return;
    let raf = 0;
    let last = "";
    const write = (t: number) => {
      shown.current = t;
      const s = timecode(t);
      if (s !== last) node.nodeValue = last = s;
    };

    // Every reading is off performance.now() — the same clock `since` was taken from. rAF's
    // own timestamp is the frame's start on a different clock, and mixing the two is exactly
    // how a timecode ends up reading minus fifty hours.
    if (playing) {
      const tick = () => {
        write(seconds + Math.max(0, performance.now() - since) / 1000);
        raf = requestAnimationFrame(tick);
      };
      tick();
    } else if (animate && Math.abs(shown.current - seconds) > 1 / FPS) {
      const from = shown.current;
      const start = performance.now();
      write(from);
      const tick = () => {
        const t = clamp01((performance.now() - start) / SCRUB_MS);
        write(from + (seconds - from) * easeInOutCubic(t));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else {
      write(seconds);
    }
    return () => {
      cancelAnimationFrame(raf);
      // Never leave the node holding a value React did not write.
      if (!playing) node.nodeValue = timecode(seconds);
    };
  }, [seconds, playing, since, animate]);

  return (
    <div className="timecode" ref={ref} aria-hidden="true">
      {timecode(seconds)}
    </div>
  );
}
