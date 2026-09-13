import type { Bi, Lang } from "@/lib/types";

export const LANGS = ["ko", "en"] as const;
export const DEFAULT_LANG: Lang = "ko";

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** Hangul syllables, jamo and compatibility jamo. */
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;

export type Resolved = {
  readonly text: string;
  /** The language the returned text is actually written in. */
  readonly lang: Lang;
  /** True when `lang` was asked for but the string was not available in it. */
  readonly fallback: boolean;
};

/**
 * Choose one half of a bilingual string — and report which language actually came back.
 *
 * 33 of the 35 project records still carry Korean in their `en` fields (run
 * `npm run audit:i18n` for the list). Rendering that text inside an `en` document is not
 * merely untidy: a screen reader set to English will read Korean syllables with English
 * phonemes, and the browser will hyphenate and line-break it under English rules. So when
 * the fallback fires we say so, and the caller stamps `lang="ko"` on that element — the
 * text is still the author's, but it is now labelled truthfully.
 *
 * This is deliberately a graceful degradation and not a fix. The fix is a human
 * translating those 66 fields in src/data/portfolio.ts.
 */
export function resolve(bi: Bi, lang: Lang): Resolved {
  const wanted = bi[lang];
  if (lang === "en" && HANGUL.test(wanted)) {
    return { text: wanted, lang: "ko", fallback: true };
  }
  return { text: wanted, lang, fallback: false };
}

/** The plain string, for attributes (`alt`, `aria-label`, `title`) that cannot carry markup. */
export const text = (bi: Bi, lang: Lang): string => resolve(bi, lang).text;
