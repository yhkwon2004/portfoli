"use client";

import { useRef } from "react";
import { Frame } from "@/components/ai/Frame";
import { REST, bind, tf, txt, type Model } from "@/components/ai/bind";
import { useLoop } from "@/components/ai/useLoop";
import { backOut, clamp01, easeInOutCubic, easeOutCubic, lerp, seg } from "@/lib/ease";

/**
 * 학교폭력 증거 정리 — the evidence organiser, as one run of its idea.
 *
 *   0.00  the case material arrives scattered: a message, a photo, a recording, a statement,
 *         a clip, each dropped in at its own angle
 *   0.25  the time axis draws, and each piece flies to its place on it, in order
 *   0.50  a checker runs along the axis ticking each piece — and stops on the slot where
 *         something should be and is not: the missing evidence, flagged
 *   0.75  the sequence is joined up and the case is stamped as laid out
 *
 * The five kinds of material are illustrative — the diagram is about order and gaps, not a
 * claim about which formats the service reads.
 */

const AXIS_Y = 214;
const SLOT_X = [100, 172, 244, 316, 388, 460] as const;
const MISSING = 3;
const W = 56;
const H = 42;
const CARD_Y = 150;
const X0 = 72;
const X1 = 488;

type Kind = "msg" | "img" | "rec" | "doc" | "vid";

/** Where each piece lands (its slot on the axis) and where it first falls (scattered). */
const CARDS: readonly { kind: Kind; label: string; slot: number; sx: number; sy: number; sr: number }[] = [
  { kind: "msg", label: "MSG", slot: 0, sx: 292, sy: 50, sr: -12 },
  { kind: "img", label: "IMG", slot: 4, sx: 112, sy: 62, sr: 9 },
  { kind: "rec", label: "REC", slot: 1, sx: 404, sy: 84, sr: 14 },
  { kind: "doc", label: "DOC", slot: 5, sx: 196, sy: 104, sr: -7 },
  { kind: "vid", label: "VID", slot: 2, sx: 334, sy: 124, sr: -16 },
];

/** The moment the checker's line crosses a slot. The sweep is linear — a scan, not a gesture. */
const SCAN_A = 0.5;
const SCAN_B = 0.72;
const passAt = (slot: number): number => SCAN_A + (SCAN_B - SCAN_A) * (((SLOT_X[slot] ?? 0) - X0) / (X1 - X0));

/** The joined-up sequence, arcing over the cards from slot to slot. */
const SEQ_D = SLOT_X.slice(1)
  .map((x, n) => {
    const from = SLOT_X[n] ?? 0;
    return `Q${(from + x) / 2} ${CARD_Y - 26} ${x} ${CARD_Y - 6}`;
  })
  .reduce((d, q) => `${d} ${q}`, `M${SLOT_X[0]} ${CARD_Y - 6}`);

export function evidenceModel(p: number): Model {
  const m: Record<string, Model[string]> = {};
  let ticked = 0;

  CARDS.forEach((c, i) => {
    const a0 = 0.02 + i * 0.034;
    const pop = backOut(seg(p, a0, a0 + 0.1));
    const move = easeInOutCubic(seg(p, 0.27 + c.slot * 0.028, 0.41 + c.slot * 0.028));
    // Scattered pieces drift a little while they wait to be sorted; sorted ones sit still.
    const bob = (1 - move) * 2.6 * Math.sin(Math.PI * 2 * (p * 2.2 + i * 0.27));
    const x = lerp(c.sx, (SLOT_X[c.slot] ?? 0) - W / 2, move) + W / 2;
    const y = lerp(c.sy, CARD_Y, move) + H / 2 + bob;
    m[`c${i}`] = { t: tf(x, y, lerp(c.sr, 0, move), 0.55 + 0.45 * pop), o: seg(p, a0, a0 + 0.04) };

    const at = passAt(c.slot);
    const tick = backOut(seg(p, at, at + 0.04));
    if (p >= at) ticked++;
    m[`k${i}`] = { t: tf(W - 8, 8, 0, tick), o: clamp01(tick * 2) };
    m[`s${i}`] = { o: seg(p, 0.41 + c.slot * 0.028, 0.47 + c.slot * 0.028) };
  });

  m.axis = { d: 1 - easeOutCubic(seg(p, 0.25, 0.4)) };
  m.ticks = { o: seg(p, 0.3, 0.42) };

  const scanning = Math.min(seg(p, SCAN_A - 0.015, SCAN_A), 1 - seg(p, SCAN_B, SCAN_B + 0.025));
  m.scan = { t: tf(lerp(X0, X1, seg(p, SCAN_A, SCAN_B)), 0), o: scanning };

  // The gap: found by the checker, flagged, and left flagged.
  const gap = passAt(MISSING);
  const found = backOut(seg(p, gap, gap + 0.05));
  m.miss = { t: tf(SLOT_X[MISSING], CARD_Y + H / 2, 0, 0.6 + 0.4 * found), o: seg(p, gap, gap + 0.02) };
  m.mstem = { o: seg(p, gap, gap + 0.03) };
  for (const [key, delay] of [["ping0", 0], ["ping1", 0.06]] as const) {
    const r = seg(p, gap + delay, gap + delay + 0.1);
    m[key] = { t: tf(SLOT_X[MISSING], CARD_Y + H / 2, 0, 1 + 2.4 * r), o: p < gap + delay ? 0 : (1 - r) * 0.9 };
  }

  m.seq = { d: 1 - easeInOutCubic(seg(p, 0.76, 0.9)) };
  const stamp = seg(p, 0.86, 0.93);
  m.stamp = { t: tf(280, 96, -6, 1.9 - 0.9 * backOut(stamp)), o: seg(p, 0.86, 0.875) };

  m.count = {
    txt: p < SCAN_A ? `${CARDS.length + 1} SLOTS` : `CHECKED ${ticked}/${CARDS.length + 1}${p >= gap ? " · 1 MISSING" : ""}`,
  };
  return m;
}

const AT_REST = evidenceModel(REST);

/** The glyph on each piece of material, in the card's own 56 × 42 box. */
function Glyph({ kind }: { kind: Kind }) {
  switch (kind) {
    case "msg":
      return (
        <g className="av-glyph">
          <rect x="9" y="7" width="26" height="15" rx="4" />
          <path d="M15 22l-2 5 7-5" />
          <path d="M14 13h16M14 17h10" />
        </g>
      );
    case "img":
      return (
        <g className="av-glyph">
          <rect x="9" y="6" width="28" height="20" rx="2" />
          <path d="M11 24l8-8 5 5 4-4 7 7" />
          <circle cx="30" cy="11" r="2.4" />
        </g>
      );
    case "rec":
      return (
        <g className="av-glyph">
          <path d="M10 16v0M14 12v8M18 8v16M22 13v6M26 6v20M30 11v10M34 14v4" />
        </g>
      );
    case "doc":
      return (
        <g className="av-glyph">
          <path d="M12 5h14l6 6v16H12z" />
          <path d="M26 5v6h6M16 15h12M16 19h12M16 23h8" />
        </g>
      );
    case "vid":
      return (
        <g className="av-glyph">
          <rect x="9" y="6" width="28" height="20" rx="2" />
          <path d="M20 11l7 5-7 5z" />
        </g>
      );
  }
}

export function EvidenceVisual({ play, period, steps, onLoop, fit }: VisualProps) {
  const ref = useRef<SVGSVGElement>(null);
  useLoop(ref, { play, period, steps, model: evidenceModel, onLoop });
  const m = AT_REST;

  return (
    <Frame ref={ref} code="EVIDENCE / TIMELINE" fit={fit}>
      {() => (
        <>
          {/* the time axis */}
          <path className="av-axis" d={`M${X0} ${AXIS_Y}H${X1}`} pathLength={1} {...bind(m, "axis")} />
          <g className="av-ticks" {...bind(m, "ticks")}>
            {SLOT_X.map((x, n) => (
              <g key={x}>
                <path d={`M${x} ${AXIS_Y - 4}v8`} />
                <text x={x} y={AXIS_Y + 18} textAnchor="middle">
                  T{n + 1}
                </text>
              </g>
            ))}
          </g>

          {/* the joined-up sequence */}
          <path className="av-seq" d={SEQ_D} pathLength={1} {...bind(m, "seq")} />

          {/* stems from each placed piece down to its tick */}
          {CARDS.map((c, i) => (
            <path
              key={`s${c.slot}`}
              className="av-stem"
              d={`M${SLOT_X[c.slot]} ${CARD_Y + H}V${AXIS_Y}`}
              {...bind(m, `s${i}`)}
            />
          ))}
          <path className="av-stem av-stem-miss" d={`M${SLOT_X[MISSING]} ${CARD_Y + H}V${AXIS_Y}`} {...bind(m, "mstem")} />

          {/* the missing slot: a dashed outline where a piece should be */}
          <circle className="av-ping av-ping-miss" r="16" {...bind(m, "ping0")} />
          <circle className="av-ping av-ping-miss" r="16" {...bind(m, "ping1")} />
          <g className="av-miss" {...bind(m, "miss")}>
            <rect x={-W / 2} y={-H / 2} width={W} height={H} rx="3" />
            <text className="av-miss-q" y="3" textAnchor="middle">
              ?
            </text>
            {/* Inside the slot, where every other piece carries its label — above it, the joined-up
                sequence would run straight through the word. */}
            <text className="av-miss-l" y={H / 2 - 5} textAnchor="middle">
              MISSING
            </text>
          </g>

          {/* the material */}
          {CARDS.map((c, i) => (
            <g key={c.kind} className="av-card" {...bind(m, `c${i}`)}>
              <g transform={`translate(${-W / 2} ${-H / 2})`}>
                <rect className="av-card-bg" width={W} height={H} rx="3" />
                <Glyph kind={c.kind} />
                <text className="av-card-l" x="8" y="37">
                  {c.label}
                </text>
                <g className="av-tick" {...bind(m, `k${i}`)}>
                  <circle r="6" />
                  <path d="M-3 0l2 2.6 4-4.6" />
                </g>
              </g>
            </g>
          ))}

          {/* the checker */}
          <g className="av-scan" {...bind(m, "scan")}>
            <rect x="-14" y="40" width="28" height="186" className="av-scan-glow" />
            <path d="M0 40V226" />
          </g>

          <g className="av-stamp" {...bind(m, "stamp")}>
            <rect x="-58" y="-15" width="116" height="30" rx="2" />
            <text y="5" textAnchor="middle">
              LAID OUT
            </text>
          </g>

          <text className="av-readout" x="64" y="38" data-k="count">
            {txt(m, "count")}
          </text>
        </>
      )}
    </Frame>
  );
}

export type VisualProps = {
  play: boolean;
  period: number;
  steps: number;
  onLoop?: () => void;
  fit?: "slice" | "meet";
};
