"use client";

import { Txt } from "@/components/Txt";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

export function TitleScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-bookend s-title">
      <div className="col-l">
        <p className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties} lang="en">
          {UI.titleEyebrow}
        </p>
        {/* The one h1 on the page. Every other scene heads at h2. */}
        <Txt v={PORTFOLIO.owner} as="h1" className="name rise" style={{ "--i": 1 } as React.CSSProperties} />
        <Txt v={PORTFOLIO.headline} as="p" className="tagline rise" style={{ "--i": 2 } as React.CSSProperties} />
        <p className="begin rise" style={{ "--i": 3 } as React.CSSProperties}>
          <span className="dot" aria-hidden="true" />
          <Txt v={UI.titleHint} />
        </p>
      </div>
      {/* Holds the right half of the grid open for the hero-sized hourglass. */}
      <div />
    </Scene>
  );
}
