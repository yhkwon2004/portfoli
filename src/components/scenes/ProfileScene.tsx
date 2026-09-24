"use client";

import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { CountUp } from "@/components/motion/CountUp";
import { Decode } from "@/components/motion/Decode";
import { Kinetic } from "@/components/motion/Kinetic";
import { riseAt } from "@/components/motion/timing";
import { PORTFOLIO } from "@/data/portfolio";
import { rankOf } from "@/data/ranks";
import { cover, picks, profile, stats, year } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";
import type { Item } from "@/lib/types";

const PICK_SIZES = "(max-width: 860px) 30vw, 15vw";

/**
 * Who, in four numbers and six pieces of evidence.
 *
 * The pick row is the argument of the whole scene: three strongest works beside the three
 * highest honours, so the claim above them arrives already supported. Every number in the
 * stat row is a `.length`, so none of them can go stale.
 */
export function ProfileScene({
  index,
  live,
  onOpen,
}: {
  index: number;
  live: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <Scene index={index} live={live} className="s-profile" gutter top>
      <div className="col-l">
        <Decode
          v={UI.profileEyebrow}
          as="p"
          className="eyebrow rise"
          style={{ "--i": 0 } as React.CSSProperties}
          delay={riseAt(0)}
        />
        <Kinetic
          v={PORTFOLIO.owner}
          as="h2"
          className="who"
          style={{ "--kin-at": "0.4s", "--kin-step": "0.06s" } as React.CSSProperties}
        />
        <Txt v={profile.t} as="p" className="tagline rise" style={{ "--i": 2 } as React.CSSProperties} />
      </div>

      <div className="col-r">
        <Txt v={profile.s} as="p" className="tagline rise" style={{ "--i": 3 } as React.CSSProperties} />
        <div className="tags rise" style={{ "--i": 4 } as React.CSSProperties}>
          {profile.tags.map((t, n) => (
            <span className="tag" key={t} style={{ "--k": n } as React.CSSProperties}>
              {t}
            </span>
          ))}
        </div>
        <div className="stat-row rise" style={{ "--i": 5 } as React.CSSProperties}>
          <Stat n={stats.awards} label={UI.statAwards} k={0} />
          <Stat n={stats.projects} label={UI.statProjects} k={1} />
          <Stat n={stats.certifications} label={UI.statCerts} k={2} />
          <Stat n={stats.experience} label={UI.statRoles} k={3} />
        </div>
      </div>

      <div className="picks">
        <p className="phead rise" style={{ "--i": 6 } as React.CSSProperties}>
          <Txt v={UI.picksTitle} as="span" className="eyebrow" />
          <Txt v={UI.picksHint} as="span" className="phint" />
        </p>
        <div className="prow">
          {picks.map((item, n) => (
            <Pick key={item.id} item={item} n={n} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </Scene>
  );
}

/** The stat row rises at `--i: 5`; each figure then counts up, a beat after the one before. */
function Stat({ n, label, k }: { n: number; label: typeof UI.statAwards; k: number }) {
  return (
    <div className="stat">
      <b>
        <CountUp value={n} delay={riseAt(5) + 60 + k * 90} duration={1000} />
      </b>
      <Txt v={label} as="span" />
    </div>
  );
}

function Pick({ item, n, onOpen }: { item: Item; n: number; onOpen: (id: string) => void }) {
  const lang = useLang();
  const img = cover(item);
  const rank = rankOf(item);
  const badge = rank ? rank.key : text(UI.featured, lang);

  return (
    <button
      type="button"
      className="pick rise"
      // Offset past the six `.rise` elements above, so the picks land last.
      style={{ "--i": 7 + n, ...(rank ? { "--rk": rank.color } : {}) } as React.CSSProperties}
      onClick={() => onOpen(item.id)}
      aria-label={`${badge} · ${year(item)} · ${text(item.t, lang)}`}
    >
      {img && <Img master={img.u} alt="" sizes={PICK_SIZES} />}
      <span className="pmeta">
        <span className="ptop">
          <b>{badge}</b>
          <i>{year(item)}</i>
        </span>
        <Txt v={item.t} as="span" className="ptitle" />
      </span>
    </button>
  );
}
