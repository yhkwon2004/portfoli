"use client";

import { Txt } from "@/components/Txt";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

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
    <Scene index={index} live={live} className="s-bookend s-credits">
      <div className="col-l">
        <p className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties} lang="en">
          {UI.creditsEyebrow}
        </p>
        <p className="quote rise" style={{ "--i": 1 } as React.CSSProperties}>
          <span className="mark" aria-hidden="true">
            &ldquo;
          </span>
          <Txt v={PORTFOLIO.quote} />
          <span className="mark" aria-hidden="true">
            &rdquo;
          </span>
        </p>
        <p className="tagline rise" style={{ "--i": 2 } as React.CSSProperties}>
          <Txt v={PORTFOLIO.owner} /> · <Txt v={PORTFOLIO.headline} />
        </p>
        <div className="links rise" style={{ "--i": 3 } as React.CSSProperties}>
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
