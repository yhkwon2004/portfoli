"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { riseAt } from "@/components/motion/timing";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * The end card. Timed like one: "Fin." types itself, the quote's opening mark springs in,
 * the words follow it one at a time, and the closing mark lands last — then the byline and
 * the links, as the credits would.
 */
export function CreditsScene({
  index,
  live,
  onReplay,
}: {
  index: number;
  live: boolean;
  onReplay: () => void;
}) {
  return (
    <Scene index={index} live={live} className="s-bookend s-credits" noGhost>
      <div className="col-l">
        <Decode
          v={UI.creditsEyebrow}
          lang="en"
          as="p"
          className="eyebrow rise"
          style={{ "--i": 0 } as React.CSSProperties}
          delay={riseAt(0)}
        />
        <p className="quote">
          <span className="mark mark-open" aria-hidden="true">
            &ldquo;
          </span>
          <Kinetic
            v={PORTFOLIO.quote}
            as="span"
            style={{ "--kin-at": "0.6s", "--kin-step": "0.075s", "--kin-dur": "1s" } as React.CSSProperties}
          />
          <span className="mark mark-close" aria-hidden="true">
            &rdquo;
          </span>
        </p>
        <p className="tagline rise" style={{ "--i": 6 } as React.CSSProperties}>
          <Txt v={PORTFOLIO.owner} /> · <Txt v={PORTFOLIO.headline} />
        </p>
        <div className="links rise" style={{ "--i": 7 } as React.CSSProperties}>
          <a href="https://github.com/yhkwon2004" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <button type="button" onClick={onReplay}>
            <Txt v={UI.replay} />
          </button>
        </div>
      </div>
      <div />
    </Scene>
  );
}
