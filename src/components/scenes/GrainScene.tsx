"use client";

import { Txt } from "@/components/Txt";
import { GRAINS } from "@/data/grains";
import { UI } from "@/data/ui";
import { useLang } from "@/components/LangProvider";
import { Scene } from "@/components/scenes/Scene";

/**
 * The operating principle — and the one scene that performs its own argument.
 *
 * Each bin's `size` drives its border, tint, heading size, dot diameter *and* its reveal
 * delay, so the heavy bins visibly fall first. A scene that claims "weight sets the order"
 * and then reveals its four panels in reading order would be arguing against itself.
 */
export function GrainScene({ index, live }: { index: number; live: boolean }) {
  const lang = useLang();
  const thesis = UI.grainThesis[lang];

  return (
    <Scene index={index} live={live} className="s-grain" gutter top>
      <div className="grainwrap">
        <div className="thesis">
          <Txt v={UI.grainEyebrow} as="p" className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties} />
          <Txt v={UI.grainCreed} as="p" className="creed rise" style={{ "--i": 1 } as React.CSSProperties} />
          <p className="tagline rise" style={{ "--i": 2 } as React.CSSProperties}>
            {thesis.map((run) => (run.em ? <b key={run.text}>{run.text}</b> : run.text))}
          </p>
        </div>

        {/*
          The axes sit in a wrapper, not in the matrix itself. The matrix has to clip — equal
          `1fr` rows land on fractional pixels and shave the last line off the tallest
          quadrant — and the rotated 중요도 label extends a few pixels past the matrix's left
          edge, so clipping there erased it completely.
        */}
        <div className="matrixwrap">
          <Txt v={UI.axisWeight} as="span" className="axis ay" />
          <Txt v={UI.axisUrgency} as="span" className="axis ax" />
          <div className="matrix">
          {GRAINS.map((g, n) => (
            <article
              key={g.name.ko}
              className="gq rise"
              style={{ "--i": n + 3, "--gs": g.size } as React.CSSProperties}
            >
              <span className="pile" aria-hidden="true">
                {Array.from({ length: g.dots }, (_, d) => (
                  <i key={d} style={{ "--d": d } as React.CSSProperties} />
                ))}
              </span>
              <Txt v={g.name} as="h3" />
              <Txt v={g.quadrant} as="p" className="gtag" />
              <Txt v={g.body} as="p" className="gbody" />
            </article>
          ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
