"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  C,
  backOut,
  canvasTexture,
  dotTexture,
  easeInOut,
  easeOut,
  lerp,
  rng,
  seg,
  stepDrive,
  type Drive,
} from "@/components/three/core";
import { basic, dispose, floorGrid, glow, label, lineMat, sizeLabel, type Sprite } from "@/components/three/kit";

/**
 * 학교폭력 증거 정리 — in 3D.
 *
 *   0.00  the case material falls into the room, scattered, each piece at its own angle
 *   0.22  a time axis lights along the floor and every piece flies to its place on it
 *   0.50  a scanning plane sweeps the timeline, ticking each piece — and stops on the slot
 *         where something should be and is not: the missing evidence, flagged red
 *   0.74  the sequence is joined up, the gap drawn broken, and the case is stamped laid out
 */

const SLOTS = [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75];
const MISSING = 3;
const W = 1.15;
const H = 0.82;
const CARD_Y = 0.62;
const RAIL_Y = -0.2;
const SCAN_A = 0.5;
const SCAN_B = 0.72;

type Kind = "MSG" | "IMG" | "REC" | "DOC" | "VID";
const CARDS: { kind: Kind; slot: number }[] = [
  { kind: "MSG", slot: 0 },
  { kind: "REC", slot: 1 },
  { kind: "VID", slot: 2 },
  { kind: "IMG", slot: 4 },
  { kind: "DOC", slot: 5 },
];

const passAt = (x: number) => SCAN_A + (SCAN_B - SCAN_A) * ((x + 4.6) / 9.2);

function cardTexture(kind: Kind, slot: number): THREE.CanvasTexture {
  return canvasTexture(512, 366, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 366);
    bg.addColorStop(0, "#161b2b");
    bg.addColorStop(1, "#0c0f19");
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, 512, 366, 26);
    g.fill();
    g.lineWidth = 4;
    g.strokeStyle = "#39415f";
    g.stroke();
    // the glyph
    g.save();
    g.translate(46, 46);
    g.strokeStyle = "#dfe5f2";
    g.fillStyle = "#dfe5f2";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    if (kind === "MSG") {
      g.roundRect(0, 0, 150, 96, 24);
      g.moveTo(34, 96);
      g.lineTo(22, 132);
      g.lineTo(70, 96);
      g.moveTo(30, 36);
      g.lineTo(120, 36);
      g.moveTo(30, 62);
      g.lineTo(88, 62);
    } else if (kind === "IMG") {
      g.roundRect(0, 0, 160, 118, 14);
      g.moveTo(12, 104);
      g.lineTo(58, 56);
      g.lineTo(88, 86);
      g.lineTo(112, 62);
      g.lineTo(150, 100);
      g.moveTo(128, 34);
      g.arc(120, 34, 10, 0, Math.PI * 2);
    } else if (kind === "REC") {
      [0, 22, 44, 66, 88, 110, 132, 154].forEach((x, n) => {
        const h = [30, 70, 110, 54, 126, 80, 44, 24][n] ?? 40;
        g.moveTo(x, 64 - h / 2);
        g.lineTo(x, 64 + h / 2);
      });
    } else if (kind === "DOC") {
      g.moveTo(0, 0);
      g.lineTo(96, 0);
      g.lineTo(130, 34);
      g.lineTo(130, 150);
      g.lineTo(0, 150);
      g.closePath();
      g.moveTo(96, 0);
      g.lineTo(96, 34);
      g.lineTo(130, 34);
      g.moveTo(24, 64);
      g.lineTo(106, 64);
      g.moveTo(24, 92);
      g.lineTo(106, 92);
      g.moveTo(24, 120);
      g.lineTo(76, 120);
    } else {
      g.roundRect(0, 0, 160, 118, 14);
      g.moveTo(64, 34);
      g.lineTo(108, 59);
      g.lineTo(64, 84);
      g.closePath();
    }
    g.stroke();
    g.restore();
    // skeleton text lines
    g.fillStyle = "#2a3150";
    [0, 1, 2].forEach((n) => {
      g.beginPath();
      g.roundRect(250, 64 + n * 44, n === 2 ? 150 : 210, 18, 9);
      g.fill();
    });
    g.font = '600 44px "Geist Mono", ui-monospace, monospace';
    g.fillStyle = "#9aa1b3";
    g.fillText(kind, 46, 318);
    g.fillStyle = "#57e6ff";
    g.fillText(`T${slot + 1}`, 400, 318);
  });
}

function checkTexture(): THREE.CanvasTexture {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = "#57e6ff";
    g.beginPath();
    g.arc(64, 64, 58, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#041016";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(36, 66);
    g.lineTo(56, 86);
    g.lineTo(94, 44);
    g.stroke();
  });
}

function build() {
  const root = new THREE.Group();
  const r = rng(11);
  const dot = dotTexture();

  root.add(floorGrid(34, 0.5));
  const floorGlow = glow(C.violet, 16, 0.18, dot);
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = -0.62;
  root.add(floorGlow);

  // the time axis
  const rail = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.025, 0.025), basic(C.cyan));
  rail.position.y = RAIL_Y;
  const railGlow = glow(C.cyan, 1, 0.5, dot);
  railGlow.scale.set(10.5, 0.6, 1);
  railGlow.position.set(0, RAIL_Y, -0.02);
  root.add(rail, railGlow);

  const ticks = new THREE.Group();
  SLOTS.forEach((x, n) => {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.02), basic(C.fg3, 0));
    tick.position.set(x, RAIL_Y, 0);
    const lab = label(`T${n + 1}`, 0.2, { color: "#9aa1b3", border: "rgba(0,0,0,0)", bg: "rgba(0,0,0,0)" });
    lab.position.set(x, RAIL_Y - 0.32, 0);
    ticks.add(tick, lab);
  });
  root.add(ticks);

  // the material
  const check = checkTexture();
  const side = basic("#1a1f2e");
  const back = basic("#0d1019");
  const cards = CARDS.map((c) => {
    const g = new THREE.Group();
    const face = new THREE.MeshBasicMaterial({ map: cardTexture(c.kind, c.slot), transparent: true });
    const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.05), [side, side, side, side, face, back]);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), lineMat(C.cyan, 0));
    const tick = new THREE.Sprite(new THREE.SpriteMaterial({ map: check, transparent: true, depthWrite: false }));
    tick.position.set(W / 2 - 0.05, H / 2 - 0.05, 0.06);
    tick.renderOrder = 11;
    g.add(box, edges, tick);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.012, CARD_Y - H / 2 - RAIL_Y, 0.012), basic(C.fg4, 0));
    stem.position.set(SLOTS[c.slot] ?? 0, (CARD_Y - H / 2 + RAIL_Y) / 2, 0);
    root.add(g, stem);
    return {
      ...c,
      g,
      edges,
      tick,
      stem,
      from: new THREE.Vector3((r() - 0.5) * 7.5, 0.7 + r() * 1.9, -2.4 + r() * 3.4),
      rot: new THREE.Euler((r() - 0.5) * 1.1, (r() - 0.5) * 1.6, (r() - 0.5) * 0.9),
      drop: 2.5 + r() * 1.5,
    };
  });

  // the gap
  const mx = SLOTS[MISSING] ?? 0;
  const missing = new THREE.Group();
  missing.position.set(mx, CARD_Y, 0);
  const pts = [
    new THREE.Vector3(-W / 2, -H / 2, 0),
    new THREE.Vector3(W / 2, -H / 2, 0),
    new THREE.Vector3(W / 2, H / 2, 0),
    new THREE.Vector3(-W / 2, H / 2, 0),
    new THREE.Vector3(-W / 2, -H / 2, 0),
  ];
  const dashMat = new THREE.LineDashedMaterial({ color: C.rose, dashSize: 0.09, gapSize: 0.06, transparent: true });
  const dash = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dashMat);
  dash.computeLineDistances();
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(W, H), basic(C.rose, 0.12, true));
  const q = label("?", 0.42, { color: "#ff6b88", bg: "rgba(0,0,0,0)", border: "rgba(0,0,0,0)", size: 80 });
  const miss = label("MISSING", 0.2, { color: "#ff6b88", border: "#ff6b88" });
  miss.position.y = H / 2 + 0.24;
  missing.add(dash, fill, q, miss);
  const missStem = new THREE.Mesh(new THREE.BoxGeometry(0.012, CARD_Y - H / 2 - RAIL_Y, 0.012), basic(C.rose, 0));
  missStem.position.set(mx, (CARD_Y - H / 2 + RAIL_Y) / 2, 0);
  root.add(missing, missStem);
  const ripples = [0, 1].map(() => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.34, 64), basic(C.rose, 0, true));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(mx, RAIL_Y + 0.01, 0);
    root.add(ring);
    return ring;
  });

  // the scanner
  const scanner = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 2.6), basic("#e6fbff", 0.9, true));
  const bladeGlow = glow(C.cyan, 1, 0.55, dot);
  bladeGlow.scale.set(1.1, 3.2, 1);
  blade.position.y = bladeGlow.position.y = 0.55;
  scanner.add(blade, bladeGlow);
  root.add(scanner);

  // the joined-up sequence: an arc from every slot to the next, the two into the gap in red
  const arcs = new THREE.Group();
  const arcLines = SLOTS.slice(0, -1).map((x, n) => {
    const x2 = SLOTS[n + 1] ?? x;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x, CARD_Y + H / 2 + 0.05, 0),
      new THREE.Vector3((x + x2) / 2, CARD_Y + H / 2 + 0.75, 0),
      new THREE.Vector3(x2, CARD_Y + H / 2 + 0.05, 0),
    );
    const broken = n === MISSING - 1 || n === MISSING;
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const mat = broken
      ? new THREE.LineDashedMaterial({ color: C.rose, dashSize: 0.07, gapSize: 0.07, transparent: true })
      : lineMat(C.cyan, 0.9);
    const line = new THREE.Line(geo, mat);
    if (broken) line.computeLineDistances();
    arcs.add(line);
    return line;
  });
  root.add(arcs);

  const stamp = label("LAID OUT  ✓", 0.34, { color: "#d4ff5f", border: "#d4ff5f", size: 52 });
  stamp.position.set(0, 2.55, 0.4);
  root.add(stamp);

  return { root, cards, missing, dashMat, fill, q, miss, missStem, ripples, scanner, arcLines, stamp, rail, railGlow, ticks };
}

export function EvidenceScene({ drive }: { drive: Drive }) {
  const s = useMemo(build, []);
  const { camera } = useThree();
  useEffect(() => () => dispose(s.root), [s]);

  const from = useMemo(() => ({ pos: new THREE.Vector3(1.2, 2.6, 9.6), at: new THREE.Vector3(0, 1.1, 0) }), []);
  const mid = useMemo(() => ({ pos: new THREE.Vector3(-0.3, 1.9, 8.8), at: new THREE.Vector3(0, 0.6, 0) }), []);
  const to = useMemo(() => ({ pos: new THREE.Vector3(0.2, 1.5, 8.4), at: new THREE.Vector3(0, 0.85, 0) }), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const e = useMemo(() => new THREE.Euler(), []);

  useFrame((_, dt) => {
    stepDrive(drive, dt);
    const { p, t } = drive;

    // ── camera: a slow descent from above the scatter to eye level with the timeline ──
    const k1 = easeInOut(seg(p, 0, 0.5));
    const k2 = easeInOut(seg(p, 0.5, 1));
    const a = k2 > 0 ? mid : from;
    const b = k2 > 0 ? to : mid;
    const k = k2 > 0 ? k2 : k1;
    camera.position.lerpVectors(a.pos, b.pos, k);
    camera.position.x += Math.sin(t * 0.25) * 0.25 + (Math.abs(drive.mx) < 1.5 ? drive.mx * 0.4 : 0);
    camera.position.y += Math.abs(drive.my) < 1.5 ? drive.my * 0.2 : 0;
    look.lerpVectors(a.at, b.at, k);
    camera.lookAt(look);

    // ── the axis draws in ──
    const axis = easeOut(seg(p, 0.2, 0.34));
    s.rail.scale.x = Math.max(0.001, axis);
    s.railGlow.scale.x = Math.max(0.001, 10.5 * axis);
    s.ticks.children.forEach((c) => {
      ((c as THREE.Mesh).material as THREE.Material & { opacity: number }).opacity = seg(p, 0.28, 0.38);
    });

    // ── the material: drop in scattered, then fly to its slot ──
    s.cards.forEach((c, n) => {
      const a0 = 0.02 + n * 0.03;
      const land = backOut(seg(p, a0, a0 + 0.1));
      const move = easeInOut(seg(p, 0.22 + c.slot * 0.028, 0.37 + c.slot * 0.028));
      const x = SLOTS[c.slot] ?? 0;
      const hover = (1 - move) * 0.12 * Math.sin(t * 1.1 + n * 1.7);
      c.g.position.set(
        lerp(c.from.x, x, move),
        lerp(c.from.y + (1 - land) * c.drop, CARD_Y, move) + hover + move * 0.015 * Math.sin(t * 1.6 + n),
        lerp(c.from.z, 0, move),
      );
      e.set(c.rot.x * (1 - move) + Math.sin(t * 0.7 + n) * 0.06 * (1 - move), c.rot.y * (1 - move), c.rot.z * (1 - move));
      c.g.quaternion.setFromEuler(e);
      c.g.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * land));
      c.g.visible = p > a0;
      (c.stem.material as THREE.MeshBasicMaterial).opacity = seg(p, 0.37 + c.slot * 0.028, 0.44 + c.slot * 0.028);

      const at = passAt(x);
      const hit = seg(p, at, at + 0.04);
      c.tick.scale.setScalar(Math.max(0.001, 0.26 * backOut(hit)));
      (c.tick.material as THREE.SpriteMaterial).opacity = Math.min(1, hit * 3);
      // the edge flashes as the scan passes, then settles to a quiet outline
      (c.edges.material as THREE.LineBasicMaterial).opacity =
        seg(p, 0.3, 0.45) * 0.25 + Math.max(0, 1 - Math.abs(p - at) * 30) * 0.75;
    });

    // ── the scanner ──
    const sweeping = Math.min(seg(p, SCAN_A - 0.015, SCAN_A), 1 - seg(p, SCAN_B, SCAN_B + 0.03));
    s.scanner.position.x = lerp(-4.6, 4.6, seg(p, SCAN_A, SCAN_B));
    s.scanner.visible = sweeping > 0.001;
    s.scanner.children.forEach((c) => (((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = sweeping * 0.8));

    // ── the gap: found, flagged, and left flagged ──
    const gapAt = passAt(SLOTS[MISSING] ?? 0);
    const found = backOut(seg(p, gapAt, gapAt + 0.05));
    s.missing.visible = p >= gapAt;
    s.missing.scale.setScalar(Math.max(0.001, 0.6 + 0.4 * found));
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    s.dashMat.opacity = found;
    (s.fill.material as THREE.MeshBasicMaterial).opacity = found * (0.1 + 0.12 * pulse);
    (s.q.material as THREE.SpriteMaterial).opacity = found;
    (s.miss.material as THREE.SpriteMaterial).opacity = found;
    (s.missStem.material as THREE.MeshBasicMaterial).opacity = found * 0.8;
    s.ripples.forEach((ring, n) => {
      const rr = p < gapAt ? 0 : ((t * 0.7 + n * 0.5) % 1);
      ring.scale.setScalar(1 + rr * 5);
      (ring.material as THREE.MeshBasicMaterial).opacity = p < gapAt ? 0 : (1 - rr) * 0.7 * found;
    });

    // ── joined up ──
    const join = seg(p, 0.74, 0.9);
    s.arcLines.forEach((line, n) => {
      const local = seg(join, n / 5, (n + 1) / 5);
      line.geometry.setDrawRange(0, Math.floor(49 * local));
    });

    // ── stamped ──
    const st = seg(p, 0.88, 0.95);
    s.stamp.visible = st > 0;
    sizeLabel(s.stamp as Sprite, 0.34 * (2 - backOut(st)));
    (s.stamp.material as THREE.SpriteMaterial).opacity = Math.min(1, st * 4);
    s.stamp.material.rotation = -0.12 * (1 - st) - 0.05;
  });

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 9, 22]} />
      <primitive object={s.root} />
    </>
  );
}
