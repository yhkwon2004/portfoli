"use client";

import { useRef } from "react";
import { Frame } from "@/components/ai/Frame";
import { REST, bind, tf, txt, type Model } from "@/components/ai/bind";
import { useLoop } from "@/components/ai/useLoop";
import type { VisualProps } from "@/components/ai/EvidenceVisual";
import { backOut, clamp01, easeInOutCubic, easeOutCubic, lerp, seg } from "@/lib/ease";

/**
 * AirSim 자율주행 — the simulator, as one run of its idea.
 *
 *   0.00  the virtual world builds: the track draws itself, the two signs and the bay appear,
 *         the car spawns
 *   0.25  the network trains — a wave runs through its layers while the loss curve falls
 *   0.46  the car drives the track on its own; the wheel readout follows the real curvature
 *         of the road under it
 *   0.75  approaching each sign it boxes and reads it — the turn, then the parking sign —
 *         and it pulls into the bay and stops
 *
 * The car is placed by arc length along the actual track geometry, computed here from the
 * same Bézier the road is drawn with, so it cannot drift off the tarmac and the steering
 * angle is the road's own, not a keyframed guess.
 */

type Pt = readonly [number, number];
type Cubic = readonly [Pt, Pt, Pt, Pt];

const TRACK: readonly Cubic[] = [
  [[50, 238], [124, 238], [148, 150], [222, 150]],
  [[222, 150], [282, 150], [292, 80], [350, 80]],
  [[350, 80], [404, 80], [398, 184], [442, 184]],
  [[442, 184], [460, 184], [474, 184], [490, 184]],
];

const bez = ([a, b, c, d]: Cubic, t: number): Pt => {
  const u = 1 - t;
  const w0 = u * u * u;
  const w1 = 3 * u * u * t;
  const w2 = 3 * u * t * t;
  const w3 = t * t * t;
  return [w0 * a[0] + w1 * b[0] + w2 * c[0] + w3 * d[0], w0 * a[1] + w1 * b[1] + w2 * c[1] + w3 * d[1]];
};

/** The track sampled densely, with the distance run to each sample. */
const SAMPLES: readonly { p: Pt; s: number }[] = (() => {
  const out: { p: Pt; s: number }[] = [];
  let s = 0;
  let last: Pt | null = null;
  for (const c of TRACK)
    for (let i = 0; i <= 120; i++) {
      const p = bez(c, i / 120);
      if (last) s += Math.hypot(p[0] - last[0], p[1] - last[1]);
      out.push({ p, s });
      last = p;
    }
  return out;
})();
const LENGTH = SAMPLES[SAMPLES.length - 1]?.s ?? 1;

/** The point a fraction `f` of the way along the track, by distance. */
function at(f: number): Pt {
  const target = clamp01(f) * LENGTH;
  let lo = 0;
  let hi = SAMPLES.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((SAMPLES[mid]?.s ?? 0) < target) lo = mid;
    else hi = mid;
  }
  const a = SAMPLES[lo];
  const b = SAMPLES[hi];
  if (!a || !b) return [0, 0];
  const k = b.s === a.s ? 0 : (target - a.s) / (b.s - a.s);
  return [lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k)];
}

const heading = (f: number): number => {
  const a = at(Math.max(0, f - 0.004));
  const b = at(Math.min(1, f + 0.004));
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
};

/** How far round the wheel is: the change of heading over a short run ahead, as a lock. */
const steer = (f: number): number => {
  let d = heading(Math.min(1, f + 0.03)) - heading(f);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Math.max(-35, Math.min(35, d * 1.6));
};

const TRACK_D = TRACK.map(([a, b, c, d], n) =>
  `${n === 0 ? `M${a[0]} ${a[1]}` : ""}C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`,
).join("");

/** The two signs the car has to read, and how far along the track it reads each one. */
const SIGNS = [
  { key: "turn", x: 132, y: 250, label: "TURN", at: 0.14 },
  { key: "park", x: 440, y: 146, label: "PARKING", at: 0.8 },
] as const;

/** The wheel readout, bottom middle — clear of the track and of the honour stamp's corner. */
const WHEEL: Pt = [262, 238];

const DRIVE_A = 0.46;
const DRIVE_B = 0.92;

/** The network in the corner: three layers, fully connected. */
const LAYERS: readonly (readonly number[])[] = [
  [62, 80, 98],
  [56, 71, 86, 101],
  [68, 90],
];
const LAYER_X = [74, 116, 158] as const;
const EDGES: readonly { from: Pt; to: Pt; layer: number }[] = LAYERS.slice(0, -1).flatMap((ys, l) =>
  ys.flatMap((y0) =>
    (LAYERS[l + 1] ?? []).map((y1) => ({
      from: [LAYER_X[l] ?? 0, y0] as Pt,
      to: [LAYER_X[l + 1] ?? 0, y1] as Pt,
      layer: l,
    })),
  ),
);

const LOSS_D = "M178 60C186 88 192 100 204 104S224 108 236 109";

export function driveModel(p: number): Model {
  const m: Record<string, Model[string]> = {};

  // ── the world builds ──
  const laid = 1 - easeOutCubic(seg(p, 0.02, 0.2));
  m.road = { d: laid };
  m.tarmac = { d: laid };
  m.lane = { o: seg(p, 0.14, 0.22) };
  m.bay = { d: 1 - easeOutCubic(seg(p, 0.12, 0.22)) };
  SIGNS.forEach((s, n) => {
    const pop = backOut(seg(p, 0.14 + n * 0.03, 0.2 + n * 0.03));
    m[`sg${n}`] = { t: tf(s.x, s.y, 0, pop), o: clamp01(pop * 3) };
  });

  // ── the network trains ──
  m.net = { o: seg(p, 0.2, 0.26) };
  const training = seg(p, 0.26, 0.5);
  EDGES.forEach((e, n) => {
    // Three waves pass through, each lighting a layer's edges a beat after the one before.
    const wave = training > 0 && training < 1 ? Math.max(0, Math.sin(Math.PI * 2 * (training * 3 - e.layer * 0.18))) : 0;
    m[`e${n}`] = { o: 0.16 + 0.84 * wave * (0.6 + 0.4 * ((n * 7) % 5) / 4) };
  });
  LAYERS.forEach((ys, l) =>
    ys.forEach((_, n) => {
      const wave = training > 0 && training < 1 ? Math.max(0, Math.sin(Math.PI * 2 * (training * 3 - l * 0.18 - 0.08))) : 0;
      m[`n${l}${n}`] = { t: tf(LAYER_X[l] ?? 0, ys[n] ?? 0, 0, 1 + 0.6 * wave) };
    }),
  );
  m.loss = { d: 1 - easeOutCubic(training) };
  m.train = { a: { width: 94 * training } };

  // ── the drive ──
  const f = easeInOutCubic(seg(p, DRIVE_A, DRIVE_B));
  const [x, y] = at(f);
  const spawn = backOut(seg(p, 0.18, 0.25));
  m.car = { t: tf(x, y, heading(f), 0.4 + 0.6 * spawn), o: seg(p, 0.18, 0.2) };
  const spawnRing = seg(p, 0.18, 0.3);
  m.spawn = { t: tf(TRACK[0]?.[0][0] ?? 0, TRACK[0]?.[0][1] ?? 0, 0, 1 + 2.6 * spawnRing), o: p < 0.18 ? 0 : (1 - spawnRing) * 0.8 };
  // The sensor sweeps while the car is live; parked, it settles facing ahead.
  const live = p > 0.2 && p < DRIVE_B;
  m.sweep = { t: `rotate(${live ? (22 * Math.sin(Math.PI * 2 * p * 5)).toFixed(1) : 0})`, o: live ? 1 : 0.5 };
  m.cone = { o: seg(p, 0.2, 0.26) * (p > DRIVE_B ? 0.45 : 1) };
  m.trail = { d: 1 - f };
  m.brake = { o: p >= DRIVE_B - 0.02 ? 1 : 0 };

  const wheel = f > 0 && f < 1 ? steer(f) : 0;
  m.wheel = { t: tf(WHEEL[0], WHEEL[1], wheel * 2.4) };
  m.steer = { txt: `${wheel >= 0 ? "+" : "−"}${Math.abs(wheel).toFixed(0).padStart(2, "0")}°` };

  // ── reading the signs ──
  SIGNS.forEach((s, n) => {
    const read = seg(p, lerp(DRIVE_A, DRIVE_B, s.at) - 0.03, lerp(DRIVE_A, DRIVE_B, s.at) + 0.02);
    m[`bx${n}`] = { t: tf(s.x, s.y, 0, 1.8 - 0.8 * backOut(read)), o: clamp01(read * 2) };
  });

  // ── parked ──
  const parked = seg(p, DRIVE_B, DRIVE_B + 0.05);
  m.bayfill = { o: 0.9 * parked };
  m.parked = { t: tf(490, 226, 0, 0.6 + 0.4 * backOut(parked)), o: clamp01(parked * 2) };
  m.status = {
    txt: p < 0.2 ? "BUILDING WORLD" : p < DRIVE_A ? "TRAINING" : p < DRIVE_B ? "AUTONOMOUS" : "PARKED",
  };
  return m;
}

const AT_REST = driveModel(REST);

export function DriveVisual({ play, period, steps, onLoop, fit }: VisualProps) {
  const ref = useRef<SVGSVGElement>(null);
  useLoop(ref, { play, period, steps, model: driveModel, onLoop });
  const m = AT_REST;

  return (
    <Frame ref={ref} code="AIRSIM / AUTONOMOUS" fit={fit}>
      {(uid) => (
        <>
          {/* the track: two strokes make the kerbs, a dashed third the lane line */}
          <path className="av-road-edge" d={TRACK_D} pathLength={1} {...bind(m, "road")} />
          <path className="av-road" d={TRACK_D} pathLength={1} {...bind(m, "tarmac")} />
          <path className="av-lane" d={TRACK_D} {...bind(m, "lane")} />
          <path className="av-trail" d={TRACK_D} pathLength={1} {...bind(m, "trail")} />

          {/* the bay at the end of the run */}
          <rect className="av-bayfill" x="464" y="164" width="48" height="40" {...bind(m, "bayfill")} />
          <path className="av-bay" d="M464 164H512V204H464" pathLength={1} {...bind(m, "bay")} />
          <g className="av-parked" {...bind(m, "parked")}>
            <text textAnchor="middle">PARKED</text>
          </g>

          {/* signs, and the boxes the car draws round them as it reads them */}
          {SIGNS.map((s, n) => (
            <g key={s.key}>
              <g className="av-sign" {...bind(m, `sg${n}`)}>
                <path d="M0 0V18" />
                <rect x="-9" y="-18" width="18" height="18" rx="2" />
                {s.key === "park" ? (
                  <text y="-4.5" textAnchor="middle">
                    P
                  </text>
                ) : (
                  <path className="av-sign-glyph" d="M-3 -4V-9Q-3 -13 1 -13H4M1.5 -15.5L4 -13L1.5 -10.5" />
                )}
              </g>
              <g className="av-box" {...bind(m, `bx${n}`)}>
                <path d="M-15 -17v-7h7M8 -24h7v7M15 3v7h-7M-8 10h-7v-7" />
                <text x="-15" y="-29">
                  {s.label} ✓
                </text>
              </g>
            </g>
          ))}

          {/* the network */}
          <g className="av-net" {...bind(m, "net")}>
            {EDGES.map((e, n) => (
              <path key={n} className="av-edge" d={`M${e.from[0]} ${e.from[1]}L${e.to[0]} ${e.to[1]}`} {...bind(m, `e${n}`)} />
            ))}
            {LAYERS.map((ys, l) =>
              ys.map((_, n) => <circle key={`${l}${n}`} className="av-node" r="3.4" {...bind(m, `n${l}${n}`)} />),
            )}
            <path className="av-loss-axis" d="M176 56V112H240" />
            <path className="av-loss" d={LOSS_D} pathLength={1} {...bind(m, "loss")} />
            <text className="av-mini" x="178" y="124">
              LOSS
            </text>
            <rect className="av-bar-bg" x="64" y="113" width="94" height="3" />
            <rect className="av-bar" x="64" y="113" height="3" {...bind(m, "train")} />
            <text className="av-mini" x="64" y="124">
              TRAIN
            </text>
          </g>

          {/* the wheel readout */}
          <g className="av-wheelbox">
            <circle cx={WHEEL[0]} cy={WHEEL[1]} r="20" className="av-wheel-rim" />
            <g className="av-wheel" {...bind(m, "wheel")}>
              <path d="M-20 0H20M0 0V20" />
              <circle r="4.5" />
            </g>
            <text className="av-mini" x={WHEEL[0] + 30} y={WHEEL[1] - 6}>
              STEER
            </text>
            <text className="av-readout" x={WHEEL[0] + 30} y={WHEEL[1] + 8} data-k="steer">
              {txt(m, "steer")}
            </text>
          </g>

          <circle className="av-ping" cx="0" cy="0" r="10" {...bind(m, "spawn")} />
          <g {...bind(m, "car")}>
            <g {...bind(m, "sweep")}>
              <path className="av-cone" d="M10 0L78 -28A80 80 0 0 1 78 28Z" fill={`url(#${uid}-glow)`} {...bind(m, "cone")} />
            </g>
            <rect className="av-car" x="-12" y="-6.5" width="24" height="13" rx="3" />
            <rect className="av-car-glass" x="2" y="-4.5" width="6" height="9" rx="1.5" />
            <g className="av-brake" {...bind(m, "brake")}>
              <rect x="-12.5" y="-5.5" width="2" height="3" />
              <rect x="-12.5" y="2.5" width="2" height="3" />
            </g>
          </g>

          <text className="av-readout" x="64" y="38" data-k="status">
            {txt(m, "status")}
          </text>
        </>
      )}
    </Frame>
  );
}
