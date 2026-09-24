"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { riseAt } from "@/components/motion/timing";
import { useLang } from "@/components/LangProvider";
import { PORTFOLIO } from "@/data/portfolio";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";
import { text } from "@/lib/i18n";
import { aiWorks } from "@/lib/select";

/**
 * The title card.
 *
 * Choreographed as a title sequence: the eyebrow decodes, the name rises letter by letter
 * through its mask and then catches a travelling glint, the headline follows word by word,
 * and the play hint arrives last with the scroll cue already running.
 *
 * Between the headline and the hint, the reel's lead: the three AI works, each a shortcut
 * straight to its panel in the next chapter. The first thing to read after the name is what
 * the work is, not how to operate the site.
 */
export function TitleScene({
  index,
  live,
  onAi,
}: {
  index: number;
  live: boolean;
  /** Open the AI chapter on the n-th work. */
  onAi: (n: number) => void;
}) {
  const lang = useLang();
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
        <nav className="t-ai rise" style={{ "--i": 6 } as React.CSSProperties} aria-label={text(UI.titleAiLead, lang)}>
          <Txt v={UI.titleAiLead} as="span" className="t-ai-l" />
          <ol>
            {aiWorks.map(({ work, item }, n) => (
              <li key={item.id} style={{ "--k": n } as React.CSSProperties}>
                <button
                  type="button"
                  onClick={() => onAi(n)}
                  aria-label={[
                    text(item.t, lang),
                    item.honor ? `${text(item.honor.event, lang)} ${text(item.honor.grade, lang)}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                >
                  <b aria-hidden="true">{String(n + 1).padStart(2, "0")}</b>
                  <Txt v={work.short} as="span" />
                  {item.honor && <Txt v={item.honor.grade} as="i" />}
                </button>
              </li>
            ))}
          </ol>
        </nav>
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
