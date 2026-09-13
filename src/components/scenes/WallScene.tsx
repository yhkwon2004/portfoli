"use client";

import { Txt } from "@/components/Txt";
import { FocusPanel } from "@/components/FocusPanel";
import { Wall } from "@/components/Wall";
import { useReel } from "@/hooks/useReel";
import { gradeDistribution, projects, year } from "@/lib/select";
import { Scene } from "@/components/scenes/Scene";
import type { Bi, Item } from "@/lib/types";

type Props = {
  index: number;
  live: boolean;
  kind: "awards" | "projects";
  items: readonly Item[];
  eyebrow: Bi;
  /** False under reduced motion: the reel then waits for a pointer instead of advancing. */
  autoplay: boolean;
  onOpen: (id: string) => void;
};

/**
 * A wall of 35 records beside the panel that reads them.
 *
 * One component for both walls. They differ in three ways, all passed in: the award panel
 * contains its images rather than cropping them (a certificate cropped is a certificate you
 * cannot read), the award legend is a grade distribution while the works legend is a topic
 * list, and the works wall marks its featured entries with a ★.
 */
export function WallScene({ index, live, kind, items, eyebrow, autoplay, onOpen }: Props) {
  const reel = useReel(items.length, live, autoplay);
  const current = items[reel.index];

  return (
    <Scene index={index} live={live} className={`s-${kind}`} gutter top>
      <div className="wall-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="count">{items.length}</span>
        <div>
          <Txt v={eyebrow} as="p" className="eyebrow" />
          {kind === "awards" && <p className="mnote">{yearSpan(items)}</p>}
        </div>
        <span className="legend">
          {kind === "awards"
            ? gradeDistribution.map(({ rank, count }) => (
                <b key={rank.key} style={{ "--rk": rank.color } as React.CSSProperties}>
                  {rank.key}
                  <i>{count}</i>
                </b>
              ))
            : topTopics().map((t) => (
                <b key={t} style={{ "--rk": "#c9a06a" } as React.CSSProperties}>
                  {t}
                </b>
              ))}
        </span>
      </div>

      <div className="spread">
        <FocusPanel
          item={current}
          position={reel.index + 1}
          total={items.length}
          contain={kind === "awards"}
          turn={reel.turn}
          onOpen={onOpen}
        />
        <Wall
          items={items}
          kind={kind}
          active={reel.index}
          onPick={reel.pick}
          onRelease={reel.release}
          onOpen={onOpen}
        />
      </div>
    </Scene>
  );
}

/** The real span of the set, rather than a hard-coded "2023 — 2025" that will rot. */
function yearSpan(items: readonly Item[]): string {
  const years = items.map(year).filter((y) => y.length === 4);
  if (years.length === 0) return "";
  const from = years.reduce((a, b) => (a < b ? a : b));
  const to = years.reduce((a, b) => (a > b ? a : b));
  return from === to ? from : `${from} — ${to}`;
}

/** The six most common topics across the works, by count — not the first six encountered. */
function topTopics(): readonly string[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([tag]) => tag);
}
