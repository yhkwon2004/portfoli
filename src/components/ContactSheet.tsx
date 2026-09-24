"use client";

import { useEffect, useId, useRef } from "react";
import { Txt } from "@/components/Txt";
import { Kinetic } from "@/components/motion/Kinetic";
import { TARGET } from "@/data/aim";
import { CONTACT } from "@/data/contact";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Contact, as a card in the frame.
 *
 * The reference keeps one pill in the top-right corner — Contact / Recruit — and it is the
 * only thing on its header that is not navigation. This site had no equivalent: the single
 * way to reach the author was a GitHub link in the last chapter, twelve cuts from the front
 * door, which a recruiter who opens the page and wants an address will never reach.
 *
 * It is a card rather than a form. A form on a static export has nowhere to post; a form that
 * silently does nothing is worse than no form. What a visitor actually needs is the address
 * and what the author is looking for, both of which are already in the content model.
 */
export function ContactSheet({ open, onClose }: Props) {
  const lang = useLang();
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(sheetRef, open);

  // Captured, like the dossier's: while the card is open the projector must not see Escape
  // or the arrows, or dismissing the card would also change the chapter behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  return (
    <div className="contact" data-open={open} aria-hidden={!open} {...(!open ? { inert: true } : {})}>
      <button
        type="button"
        className="contact-scrim"
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        className="contact-card"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <span className="regmarks" aria-hidden="true" />

        <header className="contact-head">
          <Txt v={UI.contactEyebrow} as="p" className="eyebrow" />
          <button type="button" className="contact-x" onClick={onClose}>
            <span aria-hidden="true">×</span> <Txt v={UI.close} />
          </button>
        </header>

        {/*
          The name assembles itself each time the card opens — re-keyed on `open`, so the
          letters rise again on every visit rather than only the first.
        */}
        <Kinetic key={String(open)} id={titleId} v={PORTFOLIO.owner} as="h2" className="contact-name" />
        <Txt v={PORTFOLIO.headline} as="p" className="contact-line" />

        {/*
          The stated target, from the same constant the 지향 chapter renders. A recruiter's
          first question is what this person is aiming at, and answering it here saves them
          the reel. `org` carries a newline for the chapter's two-line setting; this is one
          line of prose, so it is flattened.
        */}
        <p className="contact-aim">
          <b>{text(UI.contactAim, lang)}</b>
          {text(TARGET.org, lang).replace(/\n/g, " ")}
        </p>

        <ul className="contact-list">
          {CONTACT.map((c, n) => (
            <li key={c.key} style={{ "--k": n } as React.CSSProperties}>
              <b className="contact-key">{c.key}</b>
              <Txt v={c.label} as="span" className="contact-label" />
              <a href={c.href} target="_blank" rel="noopener noreferrer">
                {c.value}
              </a>
            </li>
          ))}
        </ul>

        <Txt v={UI.contactNote} as="p" className="contact-note" />
      </div>
    </div>
  );
}
