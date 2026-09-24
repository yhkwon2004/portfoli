"use client";

import { useRef } from "react";
import { Frame } from "@/components/ai/Frame";
import { REST, bind, tf, txt, type Model } from "@/components/ai/bind";
import { useLoop } from "@/components/ai/useLoop";
import type { VisualProps } from "@/components/ai/EvidenceVisual";
import { backOut, clamp01, easeInOutCubic, easeOutCubic, lerp, seg } from "@/lib/ease";

/**
 * 포즈 · 구도 생성 — the pose generator, as one run of its idea.
 *
 *   0.00  the camera's view comes up and a scan runs down it, naming what it finds
 *   0.25  segmentation: each region floods with its own colour from a seed, the way a mask
 *         grows out of the pixel it was seeded from
 *   0.50  the composition: the thirds draw, and the spot to stand on is picked where the
 *         right-hand third meets the horizon line
 *   0.75  the mannequin assembles on that spot joint by joint, takes the pose, and the shutter
 *         fires
 *
 * The frame is laid out on the rule of thirds for real: the horizon sits on the lower third
 * line and the mannequin's eyes on the upper one, so the diagram is itself an example of the
 * composition it describes.
 */

const FX0 = 70;
const FX1 = 490;
const FY0 = 30;
const FY1 = 270;
const THIRD_X = [FX0 + (FX1 - FX0) / 3, FX0 + ((FX1 - FX0) * 2) / 3] as const;
const THIRD_Y = [FY0 + (FY1 - FY0) / 3, FY0 + ((FY1 - FY0) * 2) / 3] as const;
const HORIZON = THIRD_Y[1];
const SPOT_X = THIRD_X[1];

type Pt = readonly [number, number];
const JOINTS = ["hip", "neck", "head", "shL", "shR", "elL", "elR", "haL", "haR", "hiL", "hiR", "knL", "knR", "ftL", "ftR"] as const;
type Joint = (typeof JOINTS)[number];

/** Standing, as generated. */
const NEUTRAL: Record<Joint, Pt> = {
  head: [350, 112], neck: [350, 126],
  shL: [338, 132], shR: [362, 132],
  elL: [333, 160], elR: [367, 160],
  haL: [331, 186], haR: [369, 186],
  hip: [350, 184], hiL: [342, 186], hiR: [358, 186],
  knL: [340, 220], knR: [360, 220],
  ftL: [338, 256], ftR: [362, 256],
};

/** The pose it lands on: one hand at the hip, one raised by the face, weight on one leg. */
const POSED: Record<Joint, Pt> = {
  head: [353, 111], neck: [351, 126],
  shL: [339, 131], shR: [363, 133],
  elL: [325, 114], elR: [378, 158],
  haL: [340, 100], haR: [362, 182],
  hip: [351, 184], hiL: [343, 185], hiR: [359, 187],
  knL: [347, 220], knR: [362, 221],
  ftL: [357, 256], ftR: [367, 256],
};

const BONES: readonly (readonly [Joint, Joint])[] = [
  ["neck", "hip"], ["shL", "shR"], ["hiL", "hiR"],
  ["shL", "elL"], ["elL", "haL"], ["shR", "elR"], ["elR", "haR"],
  ["hiL", "knL"], ["knL", "ftL"], ["hiR", "knR"], ["knR", "ftR"],
];

/** The regions the segmentation finds, each flooding out from its own seed. */
const REGIONS = [
  { key: "sky", label: "SKY", seed: [300, 60] as Pt, tag: [232, 56] as Pt },
  { key: "bld", label: "BUILDING", seed: [140, 150] as Pt, tag: [96, 90] as Pt },
  { key: "tree", label: "TREE", seed: [451, 134] as Pt, tag: [420, 98] as Pt },
  { key: "gnd", label: "GROUND", seed: [250, 240] as Pt, tag: [96, 262] as Pt },
] as const;

const SCAN_A = 0.04;
const SCAN_B = 0.22;

export function poseModel(p: number): Model {
  const m: Record<string, Model[string]> = {};

  // ── the scene is read ──
  m.scene = { o: seg(p, 0, 0.06) };
  const scanY = lerp(FY0, FY1, seg(p, SCAN_A, SCAN_B));
  m.scan = { t: tf(0, scanY), o: Math.min(seg(p, SCAN_A - 0.01, SCAN_A), 1 - seg(p, SCAN_B, SCAN_B + 0.02)) };
  REGIONS.forEach((r, n) => {
    // A region is named the moment the scan line reaches its tag.
    const reach = SCAN_A + (SCAN_B - SCAN_A) * ((r.tag[1] - FY0) / (FY1 - FY0));
    const pop = backOut(seg(p, reach, reach + 0.04));
    m[`tag${n}`] = { t: tf(r.tag[0], r.tag[1], 0, 0.5 + 0.5 * pop), o: clamp01(pop * 2) };
    // ── and segmented ──
    const flood = easeOutCubic(seg(p, 0.27 + n * 0.045, 0.42 + n * 0.045));
    m[`fl${n}`] = { t: tf(r.seed[0], r.seed[1], 0, 1 + 440 * flood) };
    m[`sd${n}`] = { o: p > 0.27 + n * 0.045 && flood < 1 ? 1 : 0, t: tf(r.seed[0], r.seed[1]) };
  });

  // ── composed ──
  for (let n = 0; n < 4; n++) m[`g${n}`] = { d: 1 - easeOutCubic(seg(p, 0.5 + n * 0.02, 0.6 + n * 0.02)) };
  const lock = backOut(seg(p, 0.6, 0.65));
  m.reticle = { t: tf(SPOT_X, THIRD_Y[0], 45 * (1 - lock), 1.8 - 0.8 * lock), o: seg(p, 0.6, 0.61) };
  const ping = seg(p, 0.61, 0.71);
  m.rping = { t: tf(SPOT_X, THIRD_Y[0], 0, 1 + 2.2 * ping), o: p < 0.61 ? 0 : (1 - ping) * 0.9 };
  m.thirds = { o: seg(p, 0.62, 0.66) };
  const mark = seg(p, 0.64, 0.7);
  m.spot = { t: tf(SPOT_X, 257, 0, 0.4 + 0.6 * backOut(mark)), o: mark };
  m.guide = { d: 1 - easeInOutCubic(seg(p, 0.64, 0.72)) };

  // ── the mannequin: built joint by joint, then posed ──
  const pose = easeInOutCubic(seg(p, 0.85, 0.92));
  const pos = {} as Record<Joint, Pt>;
  const shown = {} as Record<Joint, number>;
  JOINTS.forEach((j, n) => {
    const a = NEUTRAL[j];
    const b = POSED[j];
    const at = 0.75 + n * 0.006;
    const drop = backOut(seg(p, at, at + 0.035));
    shown[j] = seg(p, at, at + 0.01);
    pos[j] = [lerp(a[0], b[0], pose), lerp(a[1], b[1], pose) - 18 * (1 - drop)];
    m[`j${n}`] = { t: tf(pos[j][0], pos[j][1]), o: shown[j] };
  });
  BONES.forEach(([a, b], n) => {
    const pa = pos[a];
    const pb = pos[b];
    m[`b${n}`] = { a: { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1] }, o: Math.min(shown[a], shown[b]) };
  });
  m.torso = {
    a: { points: [pos.shL, pos.shR, pos.hiR, pos.hiL].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ") },
    o: 0.9 * Math.min(shown.shL, shown.hiR),
  };
  m.skull = { t: tf(pos.head[0], pos.head[1] - 2), o: shown.head };
  const focus = backOut(seg(p, 0.88, 0.92));
  m.focus = { t: tf(pos.head[0], pos.head[1], 0, 1.7 - 0.7 * focus), o: clamp01(focus * 2) };

  // ── the shutter ──
  m.flash = { o: 0.55 * Math.max(0, 1 - Math.abs(p - 0.952) / 0.018) };
  const shot = backOut(seg(p, 0.955, 0.99));
  m.shot = { t: tf(FX1 - 6, FY1 - 10, 0, 0.6 + 0.4 * shot), o: clamp01(shot * 2) };

  m.status = {
    txt:
      p < 0.25 ? "SCANNING" : p < 0.5 ? "SEGMENTING" : p < 0.75 ? "COMPOSING" : p < 0.95 ? "GENERATING POSE" : "CAPTURED",
  };
  return m;
}

const AT_REST = poseModel(REST);

/** Each region's shape, used both as the mask fill and nowhere else. */
function RegionShape({ k }: { k: (typeof REGIONS)[number]["key"] }) {
  switch (k) {
    case "sky":
      return <rect x={FX0} y={FY0} width={FX1 - FX0} height={HORIZON - FY0} />;
    case "bld":
      return (
        <path d={`M92 ${HORIZON}V122H126V96H160V136H202V${HORIZON}Z`} />
      );
    case "tree":
      return (
        <>
          <circle cx="451" cy="134" r="24" />
          <rect x="447.5" y="150" width="7" height={HORIZON - 150} />
        </>
      );
    case "gnd":
      return <rect x={FX0} y={HORIZON} width={FX1 - FX0} height={FY1 - HORIZON} />;
  }
}

export function PoseVisual({ play, period, steps, onLoop, fit }: VisualProps) {
  const ref = useRef<SVGSVGElement>(null);
  useLoop(ref, { play, period, steps, model: poseModel, onLoop });
  const m = AT_REST;

  return (
    <Frame ref={ref} code="POSE / COMPOSITION" fit={fit}>
      {(uid) => (
        <>
          <defs>
            {REGIONS.map((r, n) => (
              <clipPath key={r.key} id={`${uid}-fl${n}`}>
                <circle r="1" {...bind(m, `fl${n}`)} />
              </clipPath>
            ))}
            <clipPath id={`${uid}-view`}>
              <rect x={FX0} y={FY0} width={FX1 - FX0} height={FY1 - FY0} />
            </clipPath>
          </defs>

          {/* what the camera sees */}
          <g className="av-scene" clipPath={`url(#${uid}-view)`} {...bind(m, "scene")}>
            <circle className="av-sun" cx="432" cy="70" r="15" />
            <path className="av-hills" d={`M${FX0} ${HORIZON}L150 172L214 182L286 158L352 178L420 166L${FX1} ${HORIZON}`} />
            <path className="av-bld" d={`M92 ${HORIZON}V122H126V96H160V136H202V${HORIZON}`} />
            <path className="av-win" d="M100 132h6M112 132h6M100 146h6M112 146h6M134 108h6M146 108h6M134 124h6M146 124h6M172 148h6M184 148h6" />
            <circle className="av-tree" cx="451" cy="134" r="24" />
            <path className="av-tree" d={`M451 158V${HORIZON}`} />
            <path className="av-horizon" d={`M${FX0} ${HORIZON}H${FX1}`} />
            <path className="av-lead" d={`M196 ${FY1}L${SPOT_X - 64} ${HORIZON}M372 ${FY1}L${SPOT_X - 48} ${HORIZON}`} />

            {/* segmentation: each mask floods out of its seed */}
            {REGIONS.map((r, n) => (
              <g key={r.key} className={`av-mask av-mask-${r.key}`} clipPath={`url(#${uid}-fl${n})`}>
                <RegionShape k={r.key} />
              </g>
            ))}
          </g>
          {REGIONS.map((r, n) => (
            <circle key={r.key} className="av-seed" r="3" {...bind(m, `sd${n}`)} />
          ))}

          {/* the scan */}
          <g className="av-scan av-scan-h" {...bind(m, "scan")}>
            <rect x={FX0} y="-10" width={FX1 - FX0} height="20" className="av-scan-glow" />
            <path d={`M${FX0} 0H${FX1}`} />
          </g>

          {REGIONS.map((r, n) => (
            <g key={r.key} className={`av-tag av-tag-${r.key}`} {...bind(m, `tag${n}`)}>
              <rect x="0" y="-8" width={r.label.length * 5.4 + 10} height="12" rx="1.5" />
              <text x="5" y="1.5">
                {r.label}
              </text>
            </g>
          ))}

          {/* the thirds, and the spot they pick */}
          {[
            `M${THIRD_X[0]} ${FY0}V${FY1}`,
            `M${THIRD_X[1]} ${FY0}V${FY1}`,
            `M${FX0} ${THIRD_Y[0]}H${FX1}`,
            `M${FX0} ${THIRD_Y[1]}H${FX1}`,
          ].map((d, n) => (
            <path key={d} className="av-third" d={d} pathLength={1} {...bind(m, `g${n}`)} />
          ))}
          <path className="av-guide" d={`M280 150Q330 170 ${SPOT_X} 250`} pathLength={1} {...bind(m, "guide")} />
          <ellipse className="av-spot" rx="22" ry="5" {...bind(m, "spot")} />
          <circle className="av-ping" r="12" {...bind(m, "rping")} />
          <g className="av-reticle" {...bind(m, "reticle")}>
            <circle r="11" />
            <path d="M-17 0h8M9 0h8M0 -17v8M0 9v8" />
          </g>
          <text className="av-mini av-thirds-l" x={SPOT_X - 20} y={THIRD_Y[0] - 16} textAnchor="end" {...bind(m, "thirds")}>
            RULE OF THIRDS
          </text>

          {/* the mannequin */}
          <polygon className="av-torso" fill={`url(#${uid}-chrome)`} {...bind(m, "torso")} />
          {BONES.map(([a, b], n) => (
            <line key={`${a}-${b}`} className="av-bone" {...bind(m, `b${n}`)} />
          ))}
          <g className="av-skull" {...bind(m, "skull")}>
            <circle r="9" fill={`url(#${uid}-chrome)`} />
          </g>
          {/* The head is the skull above; every other joint is a pivot. */}
          {JOINTS.map((j, n) =>
            j === "head" ? null : <circle key={j} className="av-joint" r="2.6" {...bind(m, `j${n}`)} />,
          )}
          <g className="av-focus" {...bind(m, "focus")}>
            <path d="M-16 -9v-7h7M9 -16h7v7M16 9v7h-7M-9 16h-7v-7" />
          </g>

          {/* the viewfinder */}
          <path className="av-viewfinder" d={`M${FX0} ${FY0 + 16}V${FY0}H${FX0 + 16}M${FX1 - 16} ${FY0}H${FX1}V${FY0 + 16}M${FX1} ${FY1 - 16}V${FY1}H${FX1 - 16}M${FX0 + 16} ${FY1}H${FX0}V${FY1 - 16}`} />
          <rect className="av-flash" x={FX0} y={FY0} width={FX1 - FX0} height={FY1 - FY0} {...bind(m, "flash")} />
          <g className="av-shot" {...bind(m, "shot")}>
            <text textAnchor="end">CAPTURED ✓</text>
          </g>

          {/* Top right, not under the name: the viewfinder's corner is where the others put it. */}
          <text className="av-readout" x="496" y="22" textAnchor="end" data-k="status">
            {txt(m, "status")}
          </text>
        </>
      )}
    </Frame>
  );
}
