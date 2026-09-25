"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  C,
  backOut,
  dotTexture,
  easeInOut,
  matcapTexture,
  rng,
  seg,
  stepDrive,
  type Drive,
} from "@/components/three/core";
import { basic, dispose, glow, label, sizeLabel, type Sprite } from "@/components/three/kit";
import { SIMPLEX_3D } from "@/components/three/noise";

/**
 * 포즈 · 구도 생성 — in 3D.
 *
 *   0.00  the camera's view comes up and a scan line runs down the scene, naming what it finds
 *   0.25  segmentation: each region floods with its own colour out of a seed point, the way a
 *         mask grows from the pixel it was seeded at
 *   0.50  the composition: the thirds are drawn over the frame and the spot to stand on lights
 *   0.75  a mannequin assembles on that spot limb by limb, takes the pose, and the shutter fires
 *
 * The frame is really composed on the thirds: each frame the mannequin is placed so its head
 * projects onto the upper-right intersection — whatever the canvas's aspect ratio — so the
 * scene is itself an example of the rule it describes.
 */

const SEG_VS = /* glsl */ `
  varying vec3 vW; varying vec3 vN;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/*
 * One shader for every surface of the "photograph", so the segmentation can flood across all
 * of them the same way. `uKind` picks how the surface is painted before it is segmented:
 * 0 dusk sky with a drift of cloud, 1 buildings with lit windows, 2 foliage, 3 plaza paving.
 * Then the mask: the region's class colour grows out of a seed point, hatched like an
 * annotation layer, with a bright front where it is still spreading.
 */
const SEG_FS = /* glsl */ `
  uniform vec3 uBase; uniform vec3 uSeg; uniform vec3 uSeed; uniform vec3 uSun;
  uniform float uR; uniform float uMix; uniform float uKind; uniform float uTime;
  uniform float uScan; uniform float uScanOn;
  varying vec3 vW; varying vec3 vN;
  ${SIMPLEX_3D}
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 n = normalize(vN);
    float lam = 0.38 + 0.62 * max(dot(n, normalize(vec3(-0.3, 0.55, 0.75))), 0.0);
    vec3 col;
    if (uKind < 0.5) {
      float h = clamp(vW.y / 8.5, 0.0, 1.0);
      col = mix(vec3(0.5, 0.29, 0.36), vec3(0.035, 0.05, 0.12), pow(h, 0.55));
      col = mix(col, vec3(0.95, 0.6, 0.4), exp(-pow(vW.y / 1.1, 2.0)) * 0.5);
      float cl = snoise(vec3(vW.x * 0.14 + uTime * 0.012, vW.y * 0.5, 1.7)) * 0.5 + 0.5;
      col = mix(col, col * 1.35 + vec3(0.04, 0.02, 0.05), smoothstep(0.58, 0.88, cl) * smoothstep(1.4, 3.6, vW.y) * 0.55);
    } else if (uKind < 1.5) {
      col = uBase * lam;
      if (abs(n.y) < 0.5) {
        vec2 f = vec2((abs(n.x) > 0.5 ? vW.z : vW.x) * 4.4, vW.y * 3.5);
        vec2 cell = floor(f);
        vec2 g = fract(f);
        float win = step(0.26, g.x) * step(g.x, 0.74) * step(0.3, g.y) * step(g.y, 0.8);
        float r = hash(cell + vec2(n.x * 7.0, n.z * 13.0));
        float lit = step(0.5, r);
        vec3 warm = mix(vec3(1.0, 0.7, 0.38), vec3(0.72, 0.86, 1.0), step(0.88, r));
        col = mix(col, warm * (0.55 + 0.45 * hash(cell * 1.7)), win * lit * 0.92);
        col = mix(col, col * 0.5, win * (1.0 - lit));
      } else {
        col *= 1.25;
      }
      col = mix(col, vec3(0.3, 0.2, 0.3), smoothstep(-2.0, -5.5, vW.z) * 0.5);
    } else if (uKind < 2.5) {
      col = uBase * lam;
      col *= 0.62 + 0.7 * (snoise(vW * 3.4) * 0.5 + 0.5);
    } else {
      vec2 c = vW.xz * 1.1;
      vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
      float line = 1.0 - min(min(g.x, g.y), 1.0);
      col = uBase * (0.86 + 0.28 * hash(floor(c)));
      col = mix(col, col * 0.5, line * 0.7);
      col += vec3(0.3, 0.17, 0.1) * exp(-pow((vW.x - uSun.x) / 2.6, 2.0)) * smoothstep(3.0, -5.5, vW.z) * 0.7;
      col *= 0.7 + 0.3 * smoothstep(-6.0, 1.5, vW.z);
    }
    float d = distance(vW, uSeed);
    float inside = 1.0 - smoothstep(uR - 0.2, uR, d);
    float hatch = step(0.82, fract((vW.x + vW.y - vW.z) * 3.2));
    vec3 mask = uSeg * (0.34 + 0.3 * hatch);
    col = mix(col, mask + col * 0.55, inside * uMix);
    float front = smoothstep(0.2, 0.0, abs(d - uR)) * step(0.02, uR) * (1.0 - step(13.0, uR));
    col += uSeg * front * 0.5;
    float scan = smoothstep(0.07, 0.0, abs(vW.y - uScan)) * uScanOn;
    col += vec3(0.34, 0.9, 1.0) * scan * 1.3;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SUN = new THREE.Vector3(0.1, 1.45, -5.85);

function segMat(kind: number, base: string, segColor: THREE.Color, seed: THREE.Vector3, mix: number) {
  return new THREE.ShaderMaterial({
    vertexShader: SEG_VS,
    fragmentShader: SEG_FS,
    uniforms: {
      uBase: { value: new THREE.Color(base) },
      uSeg: { value: segColor },
      uSeed: { value: seed },
      uSun: { value: SUN },
      uR: { value: 0 },
      uMix: { value: mix },
      uKind: { value: kind },
      uTime: { value: 0 },
      uScan: { value: 99 },
      uScanOn: { value: 0 },
    },
    fog: false,
  });
}

// ── the rig ──
type JointName =
  | "hips" | "spine" | "chest" | "neck" | "head"
  | "shL" | "elL" | "shR" | "elR"
  | "hipL" | "knL" | "hipR" | "knR";

type Pose = Partial<Record<JointName, [number, number, number]>>;

const NEUTRAL: Pose = {
  shL: [0, 0, 0.14], shR: [0, 0, -0.14],
  elL: [-0.12, 0, 0], elR: [-0.12, 0, 0],
  knL: [0.05, 0, 0], knR: [0.05, 0, 0],
};

/** One hand raised by the face, the other on the hip, weight on one leg, head tilted. */
const POSED: Pose = {
  hips: [0, 0, -0.05],
  spine: [0, 0.22, 0.04],
  neck: [0.05, -0.18, 0.2],
  shR: [-2.35, 0, -0.32], elR: [-1.55, 0, 0],
  shL: [0.22, 0, 0.62], elL: [0, 0, -1.75],
  hipL: [-0.14, 0, -0.09], knL: [0.28, 0, 0],
  hipR: [0.04, 0, 0.07], knR: [0.04, 0, 0],
};

function build() {
  const root = new THREE.Group();
  const dot = dotTexture();

  // ── the world: a city plaza at dusk, the kind of place people stop to take a photo ──
  const sky = segMat(0, "#000000", C.cyan, new THREE.Vector3(0, 9, -6), 0.34);
  const bld = segMat(1, "#5a5f7e", C.magenta, new THREE.Vector3(-2.7, 1.2, -2.5), 0.46);
  const tree = segMat(2, "#4f7a5c", C.green, new THREE.Vector3(3.5, 1.9, -2.7), 0.44);
  const ground = segMat(3, "#6a6078", C.amber, new THREE.Vector3(0, 0, 3.5), 0.32);
  const segs = [sky, bld, tree, ground];

  const back = new THREE.Mesh(new THREE.PlaneGeometry(34, 14), sky);
  back.position.set(0, 5.5, -6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 16), ground);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 1;
  root.add(back, floor);

  // the near blocks, and a low skyline behind them for depth
  const blocks = new THREE.Group();
  const outlines = new THREE.Group();
  const bldEdge = new THREE.LineBasicMaterial({ color: C.magenta, transparent: true, opacity: 0 });
  for (const [x, h, z, w] of [
    [-3.7, 2.4, -2.9, 0.85],
    [-2.75, 3.4, -2.5, 0.85],
    [-1.9, 1.7, -2.2, 0.85],
    [-4.6, 1.5, -3.4, 0.9],
  ] as const) {
    const geo = new THREE.BoxGeometry(w, h, 0.85);
    const b = new THREE.Mesh(geo, bld);
    b.position.set(x, h / 2, z);
    blocks.add(b);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), bldEdge);
    e.position.copy(b.position);
    outlines.add(e);
  }
  const rand = rng(11);
  for (let x = -10; x < 10; x += 0.8 + rand() * 0.5) {
    if (x > -5.2 && x < -1.3) continue; // the near blocks stand there
    const h = 0.5 + rand() * (x > 0.5 ? 1.1 : 1.8);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.7 + rand() * 0.5, h, 0.6), bld);
    b.position.set(x, h / 2, -5.3 - rand() * 0.3);
    blocks.add(b);
  }
  root.add(blocks, outlines);

  const treeG = new THREE.Group();
  treeG.position.set(3.5, 0, -2.7);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.5, 10), tree);
  trunk.position.y = 0.75;
  const crown = new THREE.Group();
  const treeEdge = new THREE.LineBasicMaterial({ color: C.green, transparent: true, opacity: 0 });
  for (const [x, y, z, r] of [
    [0, 1.98, 0, 0.92],
    [-0.5, 1.62, 0.25, 0.6],
    [0.55, 1.72, -0.1, 0.66],
    [0.1, 2.55, -0.05, 0.55],
  ] as const) {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const m = new THREE.Mesh(geo, tree);
    m.position.set(x, y, z);
    crown.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), treeEdge);
    e.position.copy(m.position);
    crown.add(e);
  }
  treeG.add(trunk, crown);
  root.add(treeG);

  // one street lamp, lit — not a class the model is asked to find, so it stays unpainted
  const lamp = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 2.5, 8), basic("#141824"));
  pole.position.y = 1.25;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), basic("#ffe0a8"));
  bulb.position.y = 2.52;
  const bulbGlow = glow("#ffb25e", 1.3, 0.5, dot);
  bulbGlow.position.y = 2.52;
  lamp.add(pole, bulb, bulbGlow);
  lamp.position.set(-0.75, 0, -1.7);
  root.add(lamp);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 18), basic("#ffe6c4"));
  sun.position.copy(SUN);
  const sunGlow = glow("#ff9d5c", 6.5, 0.5, dot);
  sunGlow.position.copy(SUN).setZ(SUN.z - 0.05);
  root.add(sun, sunGlow);

  const tags = [
    { s: label("SKY", 0.4, { color: "#57e6ff" }), h: 0.4, y: 3.9, at: new THREE.Vector3(0.4, 3.9, -5.8) },
    { s: label("BUILDING", 0.26, { color: "#f07bff" }), h: 0.26, y: 2.9, at: new THREE.Vector3(-2.75, 2.9, -2.0) },
    { s: label("TREE", 0.26, { color: "#7df0a6" }), h: 0.26, y: 3.1, at: new THREE.Vector3(3.5, 3.15, -2.7) },
    { s: label("GROUND", 0.22, { color: "#ffc857" }), h: 0.22, y: 0.2, at: new THREE.Vector3(-1.9, 0.25, -0.6) },
  ];
  tags.forEach((t) => {
    t.s.position.copy(t.at);
    root.add(t.s);
  });

  // ── the mannequin ──
  const chrome = new THREE.MeshMatcapMaterial({ matcap: matcapTexture("#e3ecff") });
  const jointMat = basic(C.cyan);
  const J: Record<JointName, THREE.Group> = {} as Record<JointName, THREE.Group>;
  const parts: { obj: THREE.Object3D; at: number }[] = [];
  let order = 0;
  const joint = (name: JointName, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    J[name] = g;
    return g;
  };
  const limb = (parent: THREE.Object3D, r: number, len: number, y: number, sx = 1) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), chrome);
    m.position.y = y;
    m.scale.x = sx;
    parent.add(m);
    parts.push({ obj: m, at: order++ });
    return m;
  };
  const pivot = (parent: THREE.Object3D) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), jointMat);
    parent.add(d);
    parts.push({ obj: d, at: order++ });
  };

  const body = new THREE.Group();
  const hips = joint("hips", body, 0, 0.98);
  limb(hips, 0.12, 0.1, 0, 1.45);
  const spine = joint("spine", hips, 0, 0.06);
  limb(spine, 0.12, 0.2, 0.2, 1.15);
  const chest = joint("chest", spine, 0, 0.36);
  limb(chest, 0.15, 0.14, 0.08, 1.35);
  const neck = joint("neck", chest, 0, 0.24);
  limb(neck, 0.045, 0.05, 0.03);
  const head = joint("head", neck, 0, 0.1);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 18), chrome);
  skull.scale.set(0.92, 1.12, 1);
  skull.position.y = 0.1;
  head.add(skull);
  parts.push({ obj: skull, at: order++ });

  for (const side of [1, -1] as const) {
    const L = side === 1;
    const sh = joint(L ? "shL" : "shR", chest, 0.24 * side, 0.15);
    pivot(sh);
    limb(sh, 0.05, 0.22, -0.15);
    const el = joint(L ? "elL" : "elR", sh, 0, -0.31);
    pivot(el);
    limb(el, 0.043, 0.2, -0.13);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), chrome);
    hand.position.y = -0.28;
    el.add(hand);
    parts.push({ obj: hand, at: order++ });
  }
  for (const side of [1, -1] as const) {
    const L = side === 1;
    const hp = joint(L ? "hipL" : "hipR", hips, 0.1 * side, -0.04);
    pivot(hp);
    limb(hp, 0.07, 0.3, -0.21);
    const kn = joint(L ? "knL" : "knR", hp, 0, -0.44);
    pivot(kn);
    limb(kn, 0.058, 0.3, -0.21);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.24), chrome);
    foot.position.set(0, -0.44, 0.06);
    kn.add(foot);
    parts.push({ obj: foot, at: order++ });
  }
  body.scale.setScalar(0.9);
  root.add(body);

  const stand = new THREE.Group();
  const standRing = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.38, 64), basic(C.cyan, 0, true));
  standRing.rotation.x = -Math.PI / 2;
  const standFill = glow(C.cyan, 1.1, 0, dot);
  standFill.rotation.x = -Math.PI / 2;
  stand.add(standRing, standFill);
  stand.position.y = 0.012;
  root.add(stand);

  // ── the overlay: the viewfinder, drawn in the camera's own plane ──
  const overlay = new THREE.Group();
  const ovMat = (c: THREE.ColorRepresentation, o = 1) =>
    new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: false, depthWrite: false });
  const thirds = [
    [[-1 / 6, -0.5], [-1 / 6, 0.5]],
    [[1 / 6, -0.5], [1 / 6, 0.5]],
    [[-0.5, -1 / 6], [0.5, -1 / 6]],
    [[-0.5, 1 / 6], [0.5, 1 / 6]],
  ].map(([a, b]) => {
    const l = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a![0], a![1], 0), new THREE.Vector3(b![0], b![1], 0)]),
      ovMat("#e6fbff", 0.7),
    );
    l.renderOrder = 20;
    overlay.add(l);
    return l;
  });
  const corners = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(
      [
        [-0.47, 0.41, -0.47, 0.47, -0.41, 0.47],
        [0.41, 0.47, 0.47, 0.47, 0.47, 0.41],
        [0.47, -0.41, 0.47, -0.47, 0.41, -0.47],
        [-0.41, -0.47, -0.47, -0.47, -0.47, -0.41],
      ].flatMap(([a, b, c, d, e, f]) => [
        new THREE.Vector3(a, b, 0), new THREE.Vector3(c, d, 0),
        new THREE.Vector3(c, d, 0), new THREE.Vector3(e, f, 0),
      ]),
    ),
    ovMat("#ffffff", 0.9),
  );
  corners.renderOrder = 20;
  overlay.add(corners);
  const reticle = new THREE.Group();
  const ret = new THREE.Mesh(new THREE.RingGeometry(0.028, 0.032, 48), new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, depthTest: false }));
  const cross = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.05, 0, 0), new THREE.Vector3(-0.034, 0, 0),
      new THREE.Vector3(0.034, 0, 0), new THREE.Vector3(0.05, 0, 0),
      new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0, -0.034, 0),
      new THREE.Vector3(0, 0.034, 0), new THREE.Vector3(0, 0.05, 0),
    ]),
    ovMat(C.cyan, 1),
  );
  reticle.add(ret, cross);
  reticle.position.set(1 / 6, 1 / 6, 0);
  reticle.renderOrder = 21;
  overlay.add(reticle);
  const focus = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(
      [
        [-1, 1, -1, 0.55, -1, 1, -0.55, 1],
        [1, 1, 1, 0.55, 1, 1, 0.55, 1],
        [1, -1, 1, -0.55, 1, -1, 0.55, -1],
        [-1, -1, -1, -0.55, -1, -1, -0.55, -1],
      ].flatMap(([a, b, c, d, e, f, g, h]) => [
        new THREE.Vector3(a, b, 0), new THREE.Vector3(c, d, 0),
        new THREE.Vector3(e, f, 0), new THREE.Vector3(g, h, 0),
      ]),
    ),
    ovMat(C.amber, 0),
  );
  focus.renderOrder = 21;
  overlay.add(focus);
  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthTest: false }),
  );
  flash.renderOrder = 30;
  overlay.add(flash);
  const thirdsTag = label("RULE OF THIRDS", 0.028, { color: "#e6fbff", border: "rgba(230,251,255,0.6)" });
  thirdsTag.position.set(1 / 6 + 0.02, 1 / 6 + 0.055, 0);
  thirdsTag.material.depthTest = false;
  thirdsTag.center.set(0, 0.5);
  overlay.add(thirdsTag);
  const shot = label("CAPTURED  ✓", 0.034, { color: "#d4ff5f", border: "#d4ff5f" });
  shot.position.set(0.43, -0.43, 0);
  shot.center.set(1, 0);
  shot.material.depthTest = false;
  overlay.add(shot);
  root.add(overlay);

  return { root, segs, tags, J, parts, body, stand, standRing, standFill, overlay, thirds, corners, reticle, focus, flash, thirdsTag, shot, crown, sunGlow, bldEdge, treeEdge, order };
}

export function PoseScene({ drive }: { drive: Drive }) {
  const s = useMemo(build, []);
  const { camera, size } = useThree();
  useEffect(() => () => dispose(s.root), [s]);

  const tmp = useMemo(
    () => ({
      a: new THREE.Vector3(-0.2, 2.2, 9.4),
      b: new THREE.Vector3(0.1, 1.5, 6.5),
      la: new THREE.Vector3(0, 1.7, -1.5),
      lb: new THREE.Vector3(0.3, 1.3, -0.5),
      aimAt: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      look: new THREE.Vector3(),
      head: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      qa: new THREE.Quaternion(),
      qb: new THREE.Quaternion(),
    }),
    [],
  );

  useFrame((_, dt) => {
    stepDrive(drive, dt);
    const { p, t } = drive;
    const cam = camera as THREE.PerspectiveCamera;

    // ── the mannequin stands at a fixed mark; the camera is aimed so its head sits on the
    //    upper-right third — solved from the lens's own field of view, so it holds at any aspect.
    s.body.position.set(1.35, 0, 0.35);
    s.stand.position.set(1.35, 0.012, 0.35);
    const vhalf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const hhalf = vhalf * cam.aspect;
    tmp.head.set(1.35, 1.6, 0.35);
    tmp.dir.subVectors(tmp.head, tmp.b).normalize();
    const yawH = Math.atan2(tmp.dir.x, -tmp.dir.z);
    const pitchH = Math.asin(tmp.dir.y);
    const yaw = yawH - Math.atan(hhalf / 3);
    const pitch = pitchH - Math.atan(vhalf / 3);
    tmp.aimAt.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).add(tmp.b);

    // ── camera: a slow push in while the scene is read, then still for the shot ──
    const k = easeInOut(seg(p, 0, 0.5));
    cam.position.lerpVectors(tmp.a, tmp.b, k);
    tmp.look.lerpVectors(tmp.la, tmp.aimAt, k);
    if (Math.abs(drive.mx) < 1.5 && p < 0.5) cam.position.x += drive.mx * 0.3 * (1 - k);
    cam.lookAt(tmp.look);
    cam.updateMatrixWorld();
    void size;

    // ── read: the scan line, and the names it finds ──
    const scanK = seg(p, 0.03, 0.23);
    const scanY = 6.2 - scanK * 6.5;
    const scanOn = Math.min(seg(p, 0.02, 0.04), 1 - seg(p, 0.23, 0.26));
    const flood = s.segs.map((m, n) => {
      m.uniforms.uScan!.value = scanY;
      m.uniforms.uScanOn!.value = scanOn;
      m.uniforms.uTime!.value = t;
      // ── segment: each region floods out of its seed ──
      const f = easeInOut(seg(p, 0.27 + n * 0.045, 0.45 + n * 0.045));
      m.uniforms.uR!.value = f * 14;
      return f;
    });
    // the mask's outline settles on the solid regions once their flood has reached them
    s.bldEdge.opacity = seg(flood[1] ?? 0, 0.15, 0.6) * 0.75;
    s.treeEdge.opacity = seg(flood[2] ?? 0, 0.1, 0.5) * 0.55;
    s.tags.forEach((tg) => {
      const reach = 0.03 + 0.2 * ((6.2 - tg.y) / 6.5);
      const pop = backOut(seg(p, reach, reach + 0.04));
      sizeLabel(tg.s as Sprite, tg.h * pop);
      (tg.s.material as THREE.SpriteMaterial).opacity = Math.min(1, pop * 2);
    });
    s.crown.rotation.z = Math.sin(t * 0.9) * 0.03;
    (s.sunGlow.material as THREE.MeshBasicMaterial).opacity = 0.46 + 0.05 * Math.sin(t * 1.3);

    // ── the overlay rides in front of the lens ──
    const dist = 1;
    const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    s.overlay.position.copy(cam.position).add(tmp.fwd.set(0, 0, -dist).applyQuaternion(cam.quaternion));
    s.overlay.quaternion.copy(cam.quaternion);
    s.overlay.scale.set(h * cam.aspect, h, 1);
    // sprites inside a non-uniformly scaled group would stretch; undo the x stretch
    for (const sp of [s.thirdsTag, s.shot]) sp.scale.x = (sp.scale.y * (sp as Sprite).userData.aspect) / cam.aspect;

    const compose = seg(p, 0.5, 0.6);
    s.thirds.forEach((l, n) => {
      const local = seg(compose, n * 0.15, 0.55 + n * 0.15);
      l.scale.set(n < 2 ? 1 : local, n < 2 ? local : 1, 1);
      (l.material as THREE.LineBasicMaterial).opacity = 0.65 * Math.min(1, local * 2);
    });
    (s.corners.material as THREE.LineBasicMaterial).opacity = 0.35 + 0.55 * seg(p, 0.02, 0.1);
    const lock = backOut(seg(p, 0.6, 0.66));
    s.reticle.visible = p > 0.6;
    const rs = Math.max(0.001, 1.9 - 0.9 * lock);
    s.reticle.scale.set(rs / cam.aspect, rs, 1);
    s.reticle.rotation.z = (1 - lock) * 1.2;
    (s.thirdsTag.material as THREE.SpriteMaterial).opacity = seg(p, 0.62, 0.68);
    const mark = seg(p, 0.64, 0.7);
    s.standRing.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * backOut(mark)) * (1 + 0.08 * Math.sin(t * 4)));
    (s.standRing.material as THREE.MeshBasicMaterial).opacity = mark * 0.9;
    (s.standFill.material as THREE.MeshBasicMaterial).opacity = mark * 0.35;

    // ── the mannequin: assembled part by part, then posed ──
    const n = s.order;
    s.parts.forEach((pt) => {
      const at = 0.75 + (pt.at / n) * 0.09;
      const grow = backOut(seg(p, at, at + 0.03));
      pt.obj.visible = p > at;
      const sx = pt.obj.userData.sx ?? (pt.obj.userData.sx = pt.obj.scale.x);
      const sy = pt.obj.userData.sy ?? (pt.obj.userData.sy = pt.obj.scale.y);
      const sz = pt.obj.userData.sz ?? (pt.obj.userData.sz = pt.obj.scale.z);
      const g = Math.max(0.001, grow);
      pt.obj.scale.set((sx as number) * g, (sy as number) * g, (sz as number) * g);
    });
    const pose = easeInOut(seg(p, 0.85, 0.93));
    (Object.keys(s.J) as JointName[]).forEach((name) => {
      const a = NEUTRAL[name] ?? [0, 0, 0];
      const b = POSED[name] ?? [0, 0, 0];
      tmp.qa.setFromEuler(tmp.e.set(a[0], a[1], a[2]));
      tmp.qb.setFromEuler(tmp.e.set(b[0], b[1], b[2]));
      s.J[name].quaternion.slerpQuaternions(tmp.qa, tmp.qb, pose);
    });
    // a breath once it stands
    s.J.chest.position.y = 0.36 + Math.sin(t * 1.8) * 0.004 * seg(p, 0.85, 0.9);

    const fz = backOut(seg(p, 0.88, 0.92));
    s.focus.visible = p > 0.88;
    const fs = 0.07 * Math.max(0.001, 1.7 - 0.7 * fz);
    s.focus.scale.set(fs / cam.aspect, fs * 1.25, 1);
    s.focus.position.set(1 / 6, 1 / 6, 0);
    (s.focus.material as THREE.LineBasicMaterial).opacity = Math.min(1, fz * 2);

    // ── the shutter ──
    (s.flash.material as THREE.MeshBasicMaterial).opacity = 0.6 * Math.max(0, 1 - Math.abs(p - 0.952) / 0.016);
    const sh = backOut(seg(p, 0.955, 0.99));
    (s.shot.material as THREE.SpriteMaterial).opacity = Math.min(1, sh * 2);
  });

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <primitive object={s.root} />
    </>
  );
}

