"use client";

import { Txt } from "@/components/Txt";
import { SectionHead } from "@/components/site/SectionHead";
import { STANCES } from "@/data/aim";
import { UI } from "@/data/ui";

/**
 * How the author works — three stances, each with the works that back it. The cards stack as
 * they are scrolled: each one sticks a little lower than the last and the next slides over it,
 * so the three end up as a deck rather than a list.
 */
export function Principles() {
  return (
    <section className="section principles" id="principles" aria-labelledby="principles-title">
      <div className="wrap">
        <SectionHead idx="07" label={UI.principlesIdx} a={UI.principlesTitleA} b={UI.principlesTitleB} id="principles-title" />
        <ol className="deck">
          {STANCES.map((s, n) => (
            <li key={s.name.en} className="deck-card glass" style={{ "--n": n } as React.CSSProperties}>
              <span className="deck-no mono">{String(n + 1).padStart(2, "0")}</span>
              <div className="deck-body">
                <Txt v={s.name} as="h3" />
                <Txt v={s.body} as="p" className="deck-text" />
                <p className="deck-proof">
                  <Txt v={UI.proof} as="span" className="label" />
                  <span lang="ko">{s.proof}</span>
                </p>
              </div>
              <span className="deck-glow" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
