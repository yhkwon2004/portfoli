"use client";

import { resolve } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import type { Bi } from "@/lib/types";

type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "b" | "i" | "div" | "li" | "figcaption";

type Props = {
  v: Bi;
  /** Render as this element and stamp `lang` on it. Omit to emit a bare text node. */
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * One half of a bilingual string, labelled with the language it is actually in.
 *
 * This replaces the original's approach of shipping *both* languages into the DOM and hiding
 * one with `html[data-lang] .en { display: none }`. That looked cheap and cost three real
 * things: a screen reader read every string twice (`display: none` hides from the a11y tree,
 * but the technique invited `visibility`/`opacity` variants that don't), a crawler saw every
 * sentence duplicated, and the DOM carried twice the nodes it needed on a page with 84
 * records. Rendering one language from state fixes all three.
 *
 * When `as` is given, `lang` goes on the element — needed both for `:lang()` styling of the
 * display type and, on the 33 project records whose English is still Korean, to stop an
 * English screen reader sounding out hangul with English phonemes.
 */
export function Txt({ v, as, className, style }: Props) {
  const lang = useLang();
  const r = resolve(v, lang);

  if (as) {
    const Tag = as;
    return (
      <Tag className={className} style={style} lang={r.lang}>
        {r.text}
      </Tag>
    );
  }
  // No element of our own: only wrap when the language differs from the document's, so the
  // markup stays clean in the common case.
  return r.fallback ? <span lang={r.lang}>{r.text}</span> : <>{r.text}</>;
}
