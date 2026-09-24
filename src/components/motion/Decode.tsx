"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/components/LangProvider";
import { useCut, useSceneLive } from "@/components/motion/context";
import { easeOutExpo } from "@/lib/ease";
import { resolve } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

type Tag = "span" | "p" | "b" | "h3" | "div";

type Props = {
  v: Bi | string;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
  /** When to start after the chapter goes live, in ms — matched to the element's own entrance. */
  delay?: number;
  /** Language of a plain-string label, when it is not the document's (the Latin eyebrows). */
  lang?: string;
  /**
   * Force a replay when this changes, for decoders outside a chapter (the telemetry head,
   * the contact card) whose "live" moment is something other than a cut.
   */
  replay?: unknown;
};

/** Pools by script, so a label scrambles in its own alphabet and keeps roughly its own width. */
const HANGUL = "가각간갈감강개거건검게격견결경계고곡골공과관교구국군권귀규그극근금기김나남내너노누느니다단달담대더도동두드디라람래러로루류르리마만말매머명모목무문미바박반방배버번벌범변보복본부분불비사산살상새서석선설성세소속손수숙순스승시신실심아안알암애야약양어언얼업여역연열영예오온완외요용우운원위유육윤은을음의이인일임자작잔장재저적전절점정제조종주준중지직진질차창채처천철청체초총최추축춘출충취치친칠카타탄태터토통투트파판패편평포표품프피필하학한할함합항해행향허험혁현형호홍화확환활황회효후훈휘흥희";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const DIGIT = "0123456789";

const pick = (pool: string): string => pool[Math.floor(Math.random() * pool.length)] ?? "";

/** A stand-in for one character, from the same script. Punctuation and spaces hold still. */
function glyph(ch: string): string {
  if (/[가-힯]/.test(ch)) return pick(HANGUL);
  if (/[A-Z]/.test(ch)) return pick(UPPER);
  if (/[a-z]/.test(ch)) return pick(LOWER);
  if (/[0-9]/.test(ch)) return pick(DIGIT);
  return ch;
}

/** How often the unresolved glyphs re-roll. Faster than this reads as noise, not as decoding. */
const ROLL_MS = 46;

/**
 * A label that decodes itself: every character scrambles, then locks into place from left to
 * right — the instrument voice of the site assembling its own readout.
 *
 * The real text is never touched. It stays in the DOM, in the accessibility tree and in the
 * static HTML throughout; while the decoder runs it is only painted transparent, and the
 * scramble is drawn by an `aria-hidden` twin laid over it. The twin is empty at rest, so
 * `textContent` is the label and nothing else — before, during and after — for a crawler, a
 * screen reader and a test alike.
 *
 * Runs once per entrance of its chapter, and again when the language changes while it is on
 * screen — the switch re-types the labels rather than swapping them. Never under reduced
 * motion: the gate is `motion` in the cut context, the same one every scripted effect reads.
 */
export function Decode({ v, as = "span", className, style, delay = 0, lang: fixed, replay }: Props) {
  const lang = useLang();
  const r = typeof v === "string" ? { text: v, lang: fixed } : resolve(v, lang);
  const live = useSceneLive();
  const { motion, play } = useCut();
  const armed = motion && play && live;

  const rootRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  /** The entrance waits for its delay; a language switch mid-chapter should not. */
  const ranFor = useRef<unknown>(null);

  const text = r.text;

  useEffect(() => {
    const root = rootRef.current;
    const fx = fxRef.current;
    if (!armed || !root || !fx) {
      ranFor.current = null;
      return;
    }

    const first = ranFor.current !== replay;
    ranFor.current = replay;
    const wait = first ? delay : 0;
    const chars = Array.from(text);
    const n = chars.length;
    const duration = 320 + n * 24;
    const scramble = (resolved: number) =>
      chars.map((ch, i) => (i < resolved || ch === " " ? ch : glyph(ch))).join("");

    root.setAttribute("data-dc", "");
    fx.textContent = scramble(0);

    // One clock for start and progress. rAF's own timestamp is a different clock (the frame's
    // start), and a tween that mixes the two is only right while they happen to agree.
    const start = performance.now() + wait;
    let last = 0;
    let raf = requestAnimationFrame(function tick() {
      const now = performance.now();
      if (now >= start) {
        const t = (now - start) / duration;
        if (t >= 1) {
          fx.textContent = "";
          root.removeAttribute("data-dc");
          return;
        }
        if (now - last >= ROLL_MS) {
          last = now;
          fx.textContent = scramble(Math.floor(easeOutExpo(t) * n));
        }
      }
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      fx.textContent = "";
      root.removeAttribute("data-dc");
    };
  }, [armed, text, delay, replay]);

  const El = as as React.ElementType;
  return (
    <El ref={rootRef} className={`dc${className ? ` ${className}` : ""}`} style={style} lang={r.lang}>
      <span className="dc-t">{text}</span>
      <span className="dc-fx" ref={fxRef} aria-hidden="true" />
    </El>
  );
}
