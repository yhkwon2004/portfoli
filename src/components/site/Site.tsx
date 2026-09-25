"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { LangProvider } from "@/components/LangProvider";
import { Txt } from "@/components/Txt";
import { RevealRoot } from "@/components/motion/Reveal";
import { About } from "@/components/site/About";
import { AiWorks } from "@/components/site/AiWorks";
import { Awards } from "@/components/site/Awards";
import { Contact } from "@/components/site/Contact";
import { Cursor } from "@/components/site/Cursor";
import { Dossier } from "@/components/site/Dossier";
import { Hero } from "@/components/site/Hero";
import { Journey } from "@/components/site/Journey";
import { Loader } from "@/components/site/Loader";
import { MotionProvider } from "@/components/site/MotionContext";
import { Nav } from "@/components/site/Nav";
import { Principles } from "@/components/site/Principles";
import { Skills } from "@/components/site/Skills";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Works } from "@/components/site/Works";
import { UI } from "@/data/ui";
import { DEFAULT_LANG, isLang } from "@/lib/i18n";
import { SETS, itemById } from "@/lib/select";
import type { Item, Lang } from "@/lib/types";

const LANG_KEY = "portfolio:lang";

/** The hash a record opens at. Works and awards get their own words; anything else, `record`. */
const hashFor = (item: Item) =>
  `#${item.type === "project" ? "work" : item.type === "award" ? "award" : "record"}/${item.id}`;

/**
 * Read a record id out of the hash. The current forms are `#work/<id>` and `#award/<id>`; the
 * previous site's `#projects/<id>` and `#awards/<id>` links still resolve, because anything
 * of the shape `#<word>/<id>` naming a real record does.
 */
function recordFromHash(): string | null {
  const m = window.location.hash.match(/^#\/?[\w-]+\/([\w-]+)$/);
  const id = m?.[1];
  return id && itemById(id) ? id : null;
}

type ViewTransition = { finished: Promise<void> };
type VTDocument = Document & { startViewTransition?: (cb: () => void) => ViewTransition };

/**
 * The page: one long scroll through the work, with a record sheet over it.
 *
 * State is small and lives here — the language, which record is open — and everything else is
 * derived from the records at import time. Every section is rendered on the server, so the
 * static export carries the whole portfolio as text; the 3D stages are the only thing that
 * waits for the client.
 */
export function Site() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [openId, setOpenId] = useState<string | null>(null);
  const pushed = useRef(false);

  // ── language: ?lang= wins, then the visitor's last choice, then Korean ──
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search).get("lang");
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(LANG_KEY);
      } catch {
        /* private mode */
      }
      const next = isLang(q) ? q : isLang(stored) ? stored : DEFAULT_LANG;
      setLang(next);
      const rec = recordFromHash();
      if (rec) setOpenId(rec);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
      const url = new URL(window.location.href);
      if (l === DEFAULT_LANG) url.searchParams.delete("lang");
      else url.searchParams.set("lang", l);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* the URL is a convenience */
    }
  }, []);

  // ── the record sheet ──
  const item = openId ? itemById(openId) ?? null : null;
  const set = useMemo<readonly Item[]>(() => {
    if (!item) return [];
    if (item.type === "award") return SETS.award;
    if (item.type === "project") return SETS.project;
    return [item];
  }, [item]);

  const writeHash = (next: Item | null, mode: "push" | "replace") => {
    try {
      const base = `${window.location.pathname}${window.location.search}`;
      if (next) {
        if (mode === "push") {
          window.history.pushState({ record: next.id }, "", `${base}${hashFor(next)}`);
          pushed.current = true;
        } else window.history.replaceState({ record: next.id }, "", `${base}${hashFor(next)}`);
      } else if (pushed.current) {
        pushed.current = false;
        window.history.back();
      } else window.history.replaceState(null, "", base);
    } catch {
      /* Safari throttles history writes; the sheet still works */
    }
  };

  /*
   * Open a record out of the element that was pressed. Where View Transitions exist, the
   * pressed card's picture and the sheet's head are given the same transition name for the
   * length of one update, so the browser flies one into the other.
   */
  const open = useCallback((id: string, from?: HTMLElement | null) => {
    const doc = document as VTDocument;
    const src = from?.querySelector<HTMLElement>("[data-vt]") ?? (from?.matches("[data-vt]") ? from : null);
    const motionOn = document.documentElement.dataset.motion === "on";
    const next = itemById(id) ?? null;
    if (!next) return;
    const apply = () => {
      setOpenId(id);
      writeHash(next, "push");
    };
    if (doc.startViewTransition && motionOn && src) {
      src.style.viewTransitionName = "rec-media";
      doc.startViewTransition(() => {
        flushSync(apply);
        src.style.viewTransitionName = "";
      });
    } else apply();
  }, []);

  const close = useCallback(() => {
    const doc = document as VTDocument;
    const motionOn = document.documentElement.dataset.motion === "on";
    const id = openId;
    const target = id ? document.querySelector<HTMLElement>(`[data-id="${id}"] [data-vt]`) : null;
    const apply = () => {
      setOpenId(null);
      writeHash(null, "replace");
    };
    if (doc.startViewTransition && motionOn && target) {
      const vt = doc.startViewTransition(() => {
        flushSync(apply);
        target.style.viewTransitionName = "rec-media";
      });
      vt.finished.finally(() => {
        target.style.viewTransitionName = "";
      });
    } else apply();
  }, [openId]);

  const step = useCallback(
    (delta: number) => {
      if (!item) return;
      const next = set[set.indexOf(item) + delta];
      if (!next) return;
      setOpenId(next.id);
      writeHash(next, "replace");
    },
    [item, set],
  );

  // Back closes the sheet; forward to a record link reopens it.
  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      setOpenId(recordFromHash());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <LangProvider value={lang}>
      <MotionProvider>
        <a className="skip" href="#main">
          <Txt v={UI.skip} />
        </a>
        <SmoothScroll />
        <RevealRoot />
        <Nav onLang={changeLang} />
        <main id="main">
          <Hero />
          <About />
          <AiWorks onOpen={open} />
          <Skills onOpen={open} />
          <Works onOpen={open} />
          <Awards onOpen={open} />
          <Journey />
          <Principles />
          <Contact />
        </main>
        <Dossier item={item} set={set} onStep={step} onClose={close} />
        <Cursor />
        <div className="grain" aria-hidden="true" />
        <Loader />
      </MotionProvider>
    </LangProvider>
  );
}
