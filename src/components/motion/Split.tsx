"use client";

import { useLang } from "@/components/LangProvider";
import { resolve } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

type Props = {
  v: Bi | string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** A heading may split per character; running text always splits per word. */
  by?: "char" | "word";
  className?: string;
  /** Extra delay before the first unit, in ms. */
  delay?: number;
  /** Delay between units, in ms. */
  step?: number;
  /** Offset the unit index — to continue a stagger from a previous line. */
  from?: number;
};

/**
 * Split-text reveal: each unit rises through its word's mask when the element scrolls in.
 *
 * Accessibility decides the markup. A heading carries its whole text as `aria-label` and its
 * split copy is `aria-hidden` — so a screen reader says "권용현", not "권, 용, 현". Anything
 * else splits only by word and keeps the words as real text, because `aria-label` is not
 * allowed on a paragraph and hiding its only copy would erase it.
 */
export function Split({ v, as = "span", by = "char", className, delay = 0, step, from = 0 }: Props) {
  const lang = useLang();
  const r = typeof v === "string" ? { text: v, lang: undefined } : resolve(v, lang);
  const heading = as === "h1" || as === "h2" || as === "h3";
  const unit = heading ? by : "word";
  const Tag = as;

  let i = from;
  const words = r.text.split(/(\s+)/);
  const body = words.map((w, wi) => {
    if (/^\s+$/.test(w)) return w.includes("\n") ? <br key={wi} /> : " ";
    if (!w) return null;
    const units = unit === "char" ? Array.from(w) : [w];
    return (
      <span className="w" key={wi}>
        {units.map((u, ui) => (
          <span className="u" key={ui} style={{ "--i": i++ } as React.CSSProperties}>
            {u}
          </span>
        ))}
      </span>
    );
  });

  const style = { "--d": delay, ...(step ? { "--step": `${step}ms` } : {}) } as React.CSSProperties;
  const cls = `split${className ? ` ${className}` : ""}`;

  return heading ? (
    <Tag className={cls} style={style} lang={r.lang} aria-label={r.text}>
      <span aria-hidden="true">{body}</span>
    </Tag>
  ) : (
    <Tag className={cls} style={style} lang={r.lang}>
      {body}
    </Tag>
  );
}
