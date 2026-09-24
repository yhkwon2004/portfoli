"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { riseAt } from "@/components/motion/timing";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * The title card.
 *
 * Choreographed as a title sequence: the eyebrow decodes, the name rises letter by letter
 * through its mask and then catches a travelling glint, the headline follows word by word,
 * and the play hint arrives last with the scroll cue already running.
 */
export function TitleScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-bookend s-title" noGhost>
      <div className="col-l">
        <Decode
          v={UI.titleEyebrow}
          lang="en"
          as="p"
          className="eyebrow rise"
          style={{ "--i": 0 } as React.CSSProperties}
          delay={riseAt(0)}
        />
        {/* The one h1 on the page. Every other scene heads at h2. */}
        <Kinetic
          v={PORTFOLIO.owner}
          as="h1"
          className="name"
          style={{ "--kin-at": "0.46s" } as React.CSSProperties}
        />
        <Kinetic
          v={PORTFOLIO.headline}
          as="p"
          className="tagline"
          style={{ "--kin-at": "0.86s", "--kin-step": "0.045s" } as React.CSSProperties}
        />
        <p className="begin rise" style={{ "--i": 7 } as React.CSSProperties}>
          <span className="dot" aria-hidden="true" />
          <Txt v={UI.titleHint} />
          {/* The scroll cue: a dash running down a short track, over and over. */}
          <span className="cue" aria-hidden="true" />
        </p>
      </div>
      {/* Holds the right half of the grid open for the hero-sized hourglass. */}
      <div />
    </Scene>
  );
}
