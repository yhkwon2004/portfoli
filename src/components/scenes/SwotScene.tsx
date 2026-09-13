"use client";

import { Txt } from "@/components/Txt";
import { SWOT } from "@/data/swot";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * Self-analysis, four quadrants.
 *
 * Colour-split so strengths and risks read apart before a word is read: warm for what is
 * true, cool-red for what is at risk.
 *
 * ⚠️ The copy in src/data/swot.ts is a draft derived from the records, not the author's own
 * words — see the header of that file, and `npm run audit:content`, which reports it as
 * unreviewed until the author sets SWOT_REVIEWED.
 *
 * The bullet text is Korean-only in the source, so each list is marked `lang="ko"` rather
 * than inheriting a document language it is not written in.
 */
export function SwotScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-swot" gutter top>
      <div className="wall-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="count" lang="en">
          SWOT
        </span>
        <Txt v={UI.swotEyebrow} as="p" className="eyebrow" />
      </div>
      <div className="quads">
        {SWOT.map((q, n) => (
          <article key={q.key} className={`quad quad-${q.key} rise`} style={{ "--i": n + 1 } as React.CSSProperties}>
            <header>
              <b aria-hidden="true">{q.key}</b>
              <Txt v={q.name} as="h3" />
            </header>
            <ul lang="ko">
              {q.items.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Scene>
  );
}
