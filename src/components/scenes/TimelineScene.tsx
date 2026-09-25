"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { riseAt } from "@/components/motion/timing";
import { education, experience } from "@/lib/select";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * Schooling and roles on one rail.
 *
 * The rail draws itself left to right over 2.1s and each node lights just after the line
 * reaches it, so the sequence reads as chronology rather than as eight cards appearing.
 * The span in the heading is derived from the records, so it cannot drift from them.
 */
export function TimelineScene({ index, live }: { index: number; live: boolean }) {
  const nodes = [...education, ...experience];
  const years = nodes.map((n) => n.year).filter(Boolean);
  const span = years.length > 0 ? `${years.reduce((a, b) => (a < b ? a : b)).slice(0, 4)} — ${years.reduce((a, b) => (a > b ? a : b)).slice(0, 4)}` : "";

  return (
    <Scene index={index} live={live} className="s-timeline" gutter>
      <div className="rail-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <Decode v={UI.timelineEyebrow} as="p" className="eyebrow" delay={riseAt(0)} />
        <Decode v={span} as="p" className="tagline" style={{ fontSize: ".8rem" }} delay={riseAt(0) + 300} />
      </div>
      <div className="rail">
        {nodes.map((item, n) => (
          <div className="node" key={item.id} style={{ "--i": n } as React.CSSProperties}>
            <span className="pip" aria-hidden="true" />
            {/* Each year decodes as its node lands — the node's own delay, 0.42s + n × 0.17s. */}
            <Decode v={item.year} className="yr" delay={420 + n * 170} />
            <Txt v={item.t} as="span" className="ttl" />
            <Txt v={item.s} as="span" className="sub" />
          </div>
        ))}
      </div>
    </Scene>
  );
}
