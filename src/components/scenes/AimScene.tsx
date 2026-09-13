"use client";

import { Txt } from "@/components/Txt";
import { STANCES, TARGET } from "@/data/aim";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * How the author works, and where they are aiming.
 *
 * Each stance carries `proof` — the actual works that back it — because "I value building
 * things" is worth nothing and "here are the four I built" is worth reading. The right-hand
 * panel names the target and then argues the fit from the same records.
 */
export function AimScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-aim" gutter top>
      <div className="aimwrap">
        <div className="vals">
          <Txt v={UI.aimEyebrow} as="p" className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties} />
          <Txt v={PORTFOLIO.quote} as="p" className="creed rise" style={{ "--i": 1 } as React.CSSProperties} />
          {STANCES.map((v, n) => (
            <article key={v.name.ko} className="val rise" style={{ "--i": n + 2 } as React.CSSProperties}>
              <b aria-hidden="true">{String(n + 1).padStart(2, "0")}</b>
              <div>
                <Txt v={v.name} as="h3" />
                <Txt v={v.body} as="p" />
                <span className="vproof" lang="ko">
                  {v.proof}
                </span>
              </div>
            </article>
          ))}
        </div>

        <aside className="aim">
          <Txt v={UI.aimTargetLabel} as="p" className="eyebrow rise" style={{ "--i": 1 } as React.CSSProperties} />
          <Txt v={TARGET.org} as="h3" className="aimtitle rise" style={{ "--i": 2 } as React.CSSProperties} />
          <Txt v={TARGET.body} as="p" className="aimbody rise" style={{ "--i": 3 } as React.CSSProperties} />
          <ul className="aimwhy rise" style={{ "--i": 4 } as React.CSSProperties}>
            {TARGET.reasons.map((r) => (
              <li key={r.name.ko}>
                <Txt v={r.name} as="b" />
                <Txt v={r.body} />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Scene>
  );
}
