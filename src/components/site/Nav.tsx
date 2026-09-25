"use client";

import { useEffect, useRef, useState } from "react";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { useMotion } from "@/components/site/MotionContext";
import { UI } from "@/data/ui";
import { PORTFOLIO } from "@/data/portfolio";
import { text } from "@/lib/i18n";
import { onScrollFrame, scrollToTarget } from "@/lib/scroll";
import type { Lang } from "@/lib/types";

export const SECTIONS = [
  { id: "ai", label: UI.nav.ai },
  { id: "skills", label: UI.nav.skills },
  { id: "works", label: UI.nav.works },
  { id: "awards", label: UI.nav.awards },
  { id: "journey", label: UI.nav.journey },
  { id: "contact", label: UI.nav.contact },
] as const;

type Props = { onLang: (l: Lang) => void };

/**
 * The floating nav: a monogram, a glass pill of section links with an indicator that slides to
 * the section being read, and the three controls — language, motion, contact.
 *
 * It tucks away while the reader scrolls down and returns the moment they scroll up, so it is
 * there when wanted and out of the way of the 3D stages otherwise. On a phone the links move
 * into a full-screen sheet behind the menu button.
 */
export function Nav({ onLang }: Props) {
  const lang = useLang();
  const { motion, locked, toggle } = useMotion();
  const [active, setActive] = useState<string>("");
  const [hidden, setHidden] = useState(false);
  const [top, setTop] = useState(true);
  const [sheet, setSheet] = useState(false);
  const pill = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLSpanElement>(null);

  // Which section is being read: the one crossing a line 40% down the viewport.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const hero = document.getElementById("top");
    const ioTop = new IntersectionObserver(([e]) => e?.isIntersecting && setActive(""), { rootMargin: "-40% 0px -55% 0px" });
    if (hero) ioTop.observe(hero);
    return () => {
      io.disconnect();
      ioTop.disconnect();
    };
  }, []);

  // Tuck away on the way down, return on the way up.
  useEffect(() => {
    let last = window.scrollY;
    return onScrollFrame(() => {
      const y = window.scrollY;
      const dy = y - last;
      if (Math.abs(dy) > 4) {
        setHidden(dy > 0 && y > 320);
        last = y;
      }
      setTop(y < 24);
    });
  }, []);

  // The indicator slides under the active link.
  useEffect(() => {
    const p = pill.current;
    const i = ind.current;
    if (!p || !i) return;
    const a = p.querySelector<HTMLElement>(`a[data-active="true"]`);
    if (!a) {
      i.style.opacity = "0";
      return;
    }
    i.style.opacity = "1";
    i.style.setProperty("--x", `${a.offsetLeft}px`);
    i.style.setProperty("--w", `${a.offsetWidth}px`);
  }, [active, lang]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setSheet(false);
    scrollToTarget(id === "top" ? 0 : `#${id}`);
    try {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
    } catch {
      /* the URL is a convenience */
    }
  };

  return (
    <header className="nav" data-hidden={hidden && !sheet} data-top={top} data-sheet={sheet}>
      <a className="nav-brand" href="#top" onClick={(e) => go(e, "top")} data-magnetic="0.2">
        <span className="nav-logo" aria-hidden="true">
          YK
        </span>
        <Txt v={PORTFOLIO.owner} as="span" className="nav-name" />
      </a>

      <nav className="nav-pill" aria-label={text(UI.menu, lang)}>
        <div className="nav-links" ref={pill}>
          <span className="nav-ind" ref={ind} aria-hidden="true" />
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-active={active === s.id}
              aria-current={active === s.id ? "true" : undefined}
              onClick={(e) => go(e, s.id)}
            >
              <Txt v={s.label} />
            </a>
          ))}
        </div>
      </nav>

      <div className="nav-tools">
        <div className="nav-lang" role="group" aria-label="Language">
          {(["ko", "en"] as const).map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => onLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="nav-motion"
          role="switch"
          aria-checked={motion}
          disabled={locked}
          title={locked ? text(UI.motionLocked, lang) : undefined}
          onClick={toggle}
          aria-label={text(motion ? UI.motionOn : UI.motionOff, lang)}
        >
          <span className="nav-motion-dot" aria-hidden="true" />
          <span className="nav-motion-l mono">{motion ? "MOTION" : "STILL"}</span>
        </button>
        <a className="btn btn-primary nav-cta" href="#contact" onClick={(e) => go(e, "contact")} data-magnetic="0.25">
          <Txt v={UI.contact} />
        </a>
        <button
          type="button"
          className="nav-burger"
          aria-expanded={sheet}
          aria-controls="nav-sheet"
          aria-label={text(sheet ? UI.close : UI.menu, lang)}
          onClick={() => setSheet((v) => !v)}
        >
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </button>
      </div>

      <div className="nav-sheet" id="nav-sheet" {...(!sheet ? { inert: true } : {})}>
        <ol>
          {SECTIONS.map((s, n) => (
            <li key={s.id} style={{ "--n": n } as React.CSSProperties}>
              <a href={`#${s.id}`} onClick={(e) => go(e, s.id)}>
                <span className="mono">{String(n + 1).padStart(2, "0")}</span>
                <Txt v={s.label} />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
