"use client";

import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { Marquee } from "@/components/motion/Marquee";
import { TARGET } from "@/data/aim";
import { CONTACT } from "@/data/contact";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { resolve } from "@/lib/i18n";
import { scrollToTarget } from "@/lib/scroll";

/**
 * The close: a headline at poster size, the ways to reach the author as big hover rows, the
 * aim, the author's own line, and a ticker running the invitation off both edges.
 */
export function Contact() {
  const lang = useLang();
  const a = resolve(UI.contactTitleA, lang);
  const b = resolve(UI.contactTitleB, lang);

  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap">
        <p className="shead-idx" data-reveal="fade">
          <b>08</b>
          <i aria-hidden="true" />
          <Txt v={UI.contactIdx} as="span" className="label" />
        </p>
        <h2 className="contact-title" id="contact-title" aria-label={`${a.text} ${b.text}`} lang={a.lang}>
          <span aria-hidden="true">
            <span className="ct-line" data-reveal="up">
              {a.text}
            </span>
            <span className="ct-line grad-text" data-reveal="up" style={{ "--d": 120 } as React.CSSProperties}>
              {lang === "en" ? <span className="serif-i">{b.text}</span> : b.text}
            </span>
          </span>
        </h2>

        <div className="contact-grid">
          <ul className="channels">
            {CONTACT.map((c, n) => (
              <li key={c.key} data-reveal="up" style={{ "--d": 200 + n * 80 } as React.CSSProperties}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">
                  <span className="mono ch-key">{c.key}</span>
                  <span className="ch-val">{c.value}</span>
                  <Txt v={c.label} as="span" className="ch-label" />
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <div className="contact-aim glass" data-reveal="up" style={{ "--d": 260 } as React.CSSProperties}>
            <Txt v={UI.contactAim} as="p" className="label" />
            <p className="aim-org">
              <Txt v={TARGET.org} />
            </p>
            <Txt v={TARGET.body} as="p" className="aim-body" />
            <Txt v={UI.contactNote} as="p" className="label aim-note" />
          </div>
        </div>

        <blockquote className="quote" data-reveal="blur">
          <p>
            <span aria-hidden="true">“</span>
            <Txt v={PORTFOLIO.quote} />
            <span aria-hidden="true">”</span>
          </p>
        </blockquote>
      </div>

      <div className="contact-ticker" aria-hidden="true">
        <Marquee
          duration={30}
          items={["Let’s build", "함께 만들어요", "AI · Autonomy · Hardware", "권용현"].map((t) => (
            <>
              <span>{t}</span>
              <span className="tick-star">✦</span>
            </>
          ))}
        />
      </div>

      <footer className="wrap footer">
        <p className="mono">© {PORTFOLIO.owner.en}</p>
        <Txt v={UI.builtWith} as="p" className="mono" />
        <a
          href="#top"
          className="mono footer-top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget(0);
          }}
        >
          <Txt v={UI.backToTop} /> ↑
        </a>
      </footer>
    </section>
  );
}
