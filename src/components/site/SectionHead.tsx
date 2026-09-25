"use client";

import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { resolve } from "@/lib/i18n";
import type { Bi } from "@/lib/types";

type Props = {
  idx: string;
  label: Bi;
  /** The title's two halves: the second is set in the italic serif — in English. */
  a: Bi;
  b: Bi;
  note?: Bi;
  id?: string;
  children?: React.ReactNode;
};

/**
 * The head every section shares: an index and a label in the machine voice, a two-part title,
 * and an optional note set against it. In English the second half of the title drops into the
 * italic serif — the one warm note in a mono-and-grotesque system; Korean has no italic, so
 * it stays in the gothic and takes the gradient instead.
 */
export function SectionHead({ idx, label, a, b, note, id, children }: Props) {
  const lang = useLang();
  const rb = resolve(b, lang);
  const full = `${resolve(a, lang).text} ${rb.text}`;
  return (
    <header className="shead">
      <div>
        <p className="shead-idx" data-reveal="fade">
          <b>{idx}</b>
          <i aria-hidden="true" />
          <Txt v={label} as="span" className="label" />
        </p>
        <h2 id={id} aria-label={full} lang={rb.lang} data-reveal="up" style={{ "--d": 60 } as React.CSSProperties}>
          <span aria-hidden="true">
            <Txt v={a} /> <span className={lang === "en" ? "serif-i" : "grad-text"}>{rb.text}</span>
          </span>
        </h2>
      </div>
      {(note || children) && (
        <div className="shead-side" data-reveal="up" style={{ "--d": 160 } as React.CSSProperties}>
          {note && <Txt v={note} as="p" className="shead-note" />}
          {children}
        </div>
      )}
    </header>
  );
}
