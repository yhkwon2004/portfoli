"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { riseAt } from "@/components/motion/timing";
import { SWOT } from "@/data/swot";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * Self-analysis, four quadrants.
 *
 * Colour-split so strengths and risks read apart before a word is read: warm for what is
 * true, cool-red for what is at risk.
 *
 * The four open out of the centre of the cross, each wiping open from its own inner corner,
 * and each quadrant's letter flips down into place like a split-flap board — the matrix is
 * unfolded rather than laid out, which is what a 2×2 is: one idea split four ways.
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
        <Decode v="SWOT" lang="en" className="count" delay={riseAt(0)} />
        <Decode v={UI.swotEyebrow} as="p" className="eyebrow" delay={riseAt(0) + 120} />
      </div>
      <div className="quads">
        {SWOT.map((q, n) => (
          <article key={q.key} className={`quad quad-${q.key}`} style={{ "--i": n + 1 } as React.CSSProperties}>
            <span className="regmarks" aria-hidden="true" />
            <header>
              <b aria-hidden="true">{q.key}</b>
              <Txt v={q.name} as="h3" />
            </header>
            <ul lang="ko">
              {q.items.map((line, k) => (
                <li key={line} style={{ "--k": k } as React.CSSProperties}>
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Scene>
  );
}
