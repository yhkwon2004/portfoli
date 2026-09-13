"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { CHAPTERS, isChapterId, type ChapterId } from "@/data/chapters";
import { DEFAULT_LANG, isLang } from "@/lib/i18n";
import { itemById } from "@/lib/select";
import type { Lang } from "@/lib/types";

/**
 * Deep linking — a capability the original had no form of.
 *
 * Because the whole site was one CSR page with no routing, there was no way to send someone
 * a link to the award wall, let alone to one record. Reloading always dropped you back at
 * chapter 1. Now the location carries all three pieces of view state:
 *
 *   /?lang=en#projects/project-autonomous
 *      └ language      └ chapter   └ open record
 *
 * Chapter changes use `replaceState`: a wheel gesture per history entry would make the Back
 * button useless. Opening a record uses `pushState`, so Back closes the sheet — which is what
 * a phone's back gesture is expected to do, and the only history entry worth recording.
 */

export type LinkState = {
  readonly chapter: number;
  readonly item: string | null;
  readonly lang: Lang;
};

const chapterIndex = (id: ChapterId): number => CHAPTERS.findIndex((c) => c.id === id);

/**
 * What the current URL says. Falls back to the defaults for anything absent or unrecognised,
 * so a hand-edited or stale link degrades to the opening chapter instead of a blank screen.
 */
export function readLink(): LinkState {
  if (typeof window === "undefined") return { chapter: 0, item: null, lang: DEFAULT_LANG };

  const hash = window.location.hash.replace(/^#\/?/, "");
  const [rawChapter, rawItem] = hash.split("/");
  const chapter = isChapterId(rawChapter) ? chapterIndex(rawChapter) : 0;

  // Only accept an id that names a real record — otherwise the sheet would open empty.
  const item = rawItem && itemById(rawItem) ? rawItem : null;

  const param = new URLSearchParams(window.location.search).get("lang");
  const lang = isLang(param) ? param : DEFAULT_LANG;

  return { chapter, item, lang };
}

const hrefFor = ({ chapter, item, lang }: LinkState): string => {
  const id = CHAPTERS[chapter]?.id ?? CHAPTERS[0]?.id ?? "title";
  const search = lang === DEFAULT_LANG ? "" : `?lang=${lang}`;
  const frag = item ? `#${id}/${item}` : `#${id}`;
  return `${window.location.pathname}${search}${frag}`;
};

export function useDeepLink(
  state: LinkState,
  /**
   * Whether the page has finished reading its own initial URL.
   *
   * Without this gate the writer runs on mount with the default state and immediately
   * replaces the location — so opening `/#projects/project-autonomous` would rewrite itself
   * to `/#title` before anything had a chance to act on it. The writer must not speak until
   * the reader has finished.
   */
  ready: boolean,
  onPop: (next: LinkState) => void,
): void {
  const onPopRef = useLatestRef(onPop);

  // The previous item id, so we can tell "a record opened" from "the chapter moved".
  const prevItem = useRef<string | null>(state.item);
  const href = useRef("");

  useEffect(() => {
    if (!ready) return;
    const next = hrefFor(state);
    if (next === href.current) return;

    const opening = state.item !== null && prevItem.current === null;
    href.current = next;
    prevItem.current = state.item;

    // A failed history write must never take the page down — Safari throttles these, and
    // a file:// origin rejects them outright.
    try {
      if (opening) window.history.pushState(null, "", next);
      else window.history.replaceState(null, "", next);
    } catch {
      /* the URL is a convenience here, not load-bearing */
    }
  }, [state, ready]);

  useEffect(() => {
    const onPopState = () => {
      href.current = hrefFor(readLink());
      prevItem.current = readLink().item;
      onPopRef.current(readLink());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [onPopRef]);
}

/** Remember the chosen language so a returning visitor is not reset to Korean. */
export const LANG_KEY = "hourglass:lang";

export function useStoredLang(lang: Lang, ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* private mode; the URL still carries it */
    }
  }, [lang, ready]);
}

/**
 * The language to open with: an explicit `?lang=` wins, then the visitor's last choice, then
 * Korean.
 *
 * Deliberately *not* `navigator.language`. Sniffing the browser is the usual default and it
 * would be wrong here: 33 of the 35 project records have no English text at all, so sending
 * an English-locale visitor to the English view hands them a half-translated page they did
 * not ask for, with the site's weakest surface first. Korean is the language this portfolio
 * is actually written in, and the KO/EN switch is in the top-right corner of every scene.
 *
 * Revisit this once `npm run audit:i18n` reports zero untranslated fields.
 *
 * Read in an effect rather than during render — touching `localStorage` while rendering would
 * make the static HTML and the first client render disagree.
 */
export function useInitialLang(): () => Lang {
  return useCallback(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl)) return fromUrl;
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (isLang(stored)) return stored;
    } catch {
      /* private mode — fall through to the default */
    }
    return DEFAULT_LANG;
  }, []);
}
