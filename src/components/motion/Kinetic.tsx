"use client";

import { useLang } from "@/components/LangProvider";
import { resolve } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

type Heading = "h1" | "h2" | "h3";
type Block = "p" | "span" | "div";

type Props = {
  v: Bi | string;
  as: Heading | Block;
  /**
   * The unit that moves. Only a heading may split by character — see the note on
   * accessibility below — so a paragraph asked for `char` quietly moves by word instead.
   */
  by?: "char" | "word";
  className?: string;
  style?: React.CSSProperties;
  id?: string;
};

/**
 * Kinetic type: text that assembles itself, unit by unit, rising through a mask.
 *
 * This is the text animator of a motion-graphics package — the per-character offset with a
 * stagger — done with markup and CSS. Each word is a clipped box and each unit inside it
 * rises from below its own baseline, so the letters appear to come up *through* the line
 * rather than fading in over it. Every unit carries `--ci`, its index across the whole string,
 * and the stylesheet turns that into the stagger; nothing here knows any timing.
 *
 * ── accessibility, which decides the markup ──
 * A string split into one inline-block per character is read letter by letter by some screen
 * readers — "권, 용, 현" — which is the usual cost of this effect and the reason it is often
 * a bad idea. So there are two shapes:
 *
 *  · A **heading** is named by `aria-label` and its split copy is `aria-hidden`. Headings are
 *    one of the roles whose name may come from the author, so this is announced as one clean
 *    string, and `textContent` is still exactly the text — the split copy is the only copy.
 *  · Anything else splits by **word** and keeps the words as real text. `aria-label` is not
 *    permitted on a paragraph, and hiding its only copy would erase it; a word per box reads
 *    naturally, and the spaces between words are real text nodes, so neither a crawler nor
 *    `textContent` sees anything but the sentence.
 *
 * Line breaks in the source (`\n`, which the creed and the target title carry) become `<br>`.
 */
export function Kinetic({ v, as, by = "char", className, style, id }: Props) {
  const lang = useLang();
  const r = typeof v === "string" ? { text: v, lang: undefined } : resolve(v, lang);
  const heading = as === "h1" || as === "h2" || as === "h3";
  const unit = heading ? by : "word";

  let ci = 0;
  const lines = r.text.split("\n").map((line, li, all) => {
    const words = line.split(/ +/).filter(Boolean);
    const out: React.ReactNode[] = [];
    words.forEach((word, wi) => {
      if (wi > 0) out.push(" ");
      const units =
        unit === "char"
          ? Array.from(word).map((ch) => (
              <span key={ci} className="u" style={{ "--ci": ci++ } as React.CSSProperties}>
                {ch}
              </span>
            ))
          : [
              <span key={ci} className="u" style={{ "--ci": ci++ } as React.CSSProperties}>
                {word}
              </span>,
            ];
      out.push(
        <span key={`w${li}-${wi}`} className="w">
          {units}
        </span>,
      );
    });
    if (li < all.length - 1) out.push(<br key={`br${li}`} />);
    return out;
  });

  const Tag = as;
  const cls = `kin${className ? ` ${className}` : ""}`;
  const count = { "--cn": ci, ...style } as React.CSSProperties;

  return heading ? (
    <Tag id={id} className={cls} style={count} lang={r.lang} aria-label={r.text} data-by={unit}>
      <span className="kin-v" aria-hidden="true">
        {lines}
      </span>
    </Tag>
  ) : (
    <Tag id={id} className={cls} style={count} lang={r.lang} data-by={unit}>
      {lines}
    </Tag>
  );
}
