"use client";

import { Txt } from "@/components/Txt";
import { domains, maxDomainProof, skillCount } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * The capability map — worked backwards from evidence rather than listed.
 *
 * No skill is asserted here. Each chip carries the number of real works that carry that tag,
 * its border and text brightness scale with that count, and pressing it opens the single
 * strongest of those works. A tag that nothing proves never renders, so the map cannot be
 * padded: the only way to add a skill is to add a piece of work that demonstrates it.
 */
export function SkillsScene({
  index,
  live,
  onOpen,
}: {
  index: number;
  live: boolean;
  onOpen: (id: string) => void;
}) {
  const lang = useLang();

  return (
    <Scene index={index} live={live} className="s-skills" gutter top>
      <div className="wall-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="count">{skillCount}</span>
        <Txt v={UI.skillsEyebrow} as="p" className="eyebrow" />
        <Txt v={UI.skillsHint} as="p" className="tagline" style={{ fontSize: ".74rem" }} />
      </div>

      <div className="domains">
        {domains.map((d, n) => (
          <article key={d.name.ko} className="domain rise" style={{ "--i": n + 1 } as React.CSSProperties}>
            <header>
              <Txt v={d.name} as="h3" />
              <span className="dcount">
                {d.proof}
                <i>
                  <Txt v={UI.works} />
                </i>
              </span>
            </header>
            <span
              className="dbar"
              role="img"
              aria-label={`${d.proof} / ${maxDomainProof}`}
            >
              <i style={{ "--w": `${Math.round((d.proof / maxDomainProof) * 100)}%` } as React.CSSProperties} />
            </span>
            <div className="chips">
              {d.tags.map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  className="chip"
                  // Capped at 5: past that the brightness ramp has nowhere left to go.
                  style={{ "--n": Math.min(t.count, 5) } as React.CSSProperties}
                  onClick={() => onOpen(t.strongest.id)}
                  aria-label={`${t.tag} — ${t.count} ${text(UI.works, lang)} · ${text(t.strongest.t, lang)}`}
                >
                  {t.tag}
                  <i aria-hidden="true">{t.count}</i>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Scene>
  );
}
