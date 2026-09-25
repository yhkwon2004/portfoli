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
  matcapTexture,
  rng,
  seg,
  stepDrive,
  type Drive,
} from "@/components/three/core";
import { basic, dispose, floorGrid, glow, label, lineMat, sizeLabel, type Sprite } from "@/components/three/kit";

/**
 * AirSim 자율주행 — in 3D.
 *
 *   0.00  the virtual world builds itself: the track lays down, the signs and the bay rise
 *   0.22  a network hangs over the track and trains — activations run through its layers
 *   0.46  the car drives the track on its own, lidar sweeping, a chase camera behind it
 *   0.75  it boxes and reads each sign as it passes — the turn, then parking — and parks
 *
 * The car is placed by arc length on the same curve the road is built from, and faces along
 * its tangent, so it can never leave the tarmac and its heading is the road's own.
 */

const PATH = [
  [-7.2, 2.4], [-4.8, 2.5], [-2.9, 1.9], [-1.4, 0.4], [0.2, -1.2], [2.2, -2.0],
  [4.1, -1.5], [5.2, -0.1], [5.6, 1.4], [5.75, 2.9], [5.8, 3.9],
] as const;
const ROAD_W = 1.5;
const SAMPLES = 420;
const SIGNS = [
  { key: "turn", u: 0.3, side: 1, text: "TURN  ✓" },
  { key: "park", u: 0.86, side: -1, text: "PARKING  ✓" },
] as const;
const DRIVE_A = 0.46;
const DRIVE_B = 0.92;

function signTexture(kind: "turn" | "park"): THREE.CanvasTexture {
  return canvasTexture(256, 256, (g) => {
    g.fillStyle = "#1f3bd1";
    g.beginPath();
    g.roundRect(8, 8, 240, 240, 34);
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = "#ffffff";
    g.stroke();
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#ffffff";
    if (kind === "park") {
      g.font = '800 170px "Geist", system-ui, sans-serif';
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("P", 128, 138);
    } else {
      g.lineWidth = 22;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(92, 206);
      g.lineTo(92, 120);
      g.quadraticCurveTo(92, 78, 136, 78);
      g.lineTo(170, 78);
      g.stroke();
      g.beginPath();
      g.moveTo(150, 44);
      g.lineTo(196, 78);
      g.lineTo(150, 112);
      g.closePath();
      g.fill();
    }
  });
}

/** A tower's face: dark glazing in a grid, some bays lit — two tones, so faces read as lit and shaded. */
function facadeTexture(seed: number, tone: number): THREE.CanvasTexture {
  const r = rng(seed);
  return canvasTexture(128, 256, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, `rgb(${34 * tone},${40 * tone},${62 * tone})`);
    grad.addColorStop(1, `rgb(${14 * tone},${17 * tone},${28 * tone})`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 256);
    for (let y = 10; y < 246; y += 18)
      for (let x = 10; x < 118; x += 22) {
        const lit = r() > 0.62;
        g.fillStyle = lit
          ? r() > 0.8
            ? "rgba(160,220,255,0.9)"
            : "rgba(255,196,120,0.85)"
          : `rgba(${60 * tone},${70 * tone},${100 * tone},0.55)`;
        g.fillRect(x, y, 13, 9);
      }
  });
}

/** The car's side profile, in metres: boot, rear screen, roof, windscreen, bonnet. */
function carShape(): THREE.Shape {
  const sh = new THREE.Shape();
  sh.moveTo(-0.5, 0.1);
  sh.lineTo(-0.52, 0.28);
  sh.lineTo(-0.32, 0.32);
  sh.lineTo(-0.17, 0.49);
  sh.lineTo(0.12, 0.5);
  sh.lineTo(0.28, 0.34);
  sh.lineTo(0.5, 0.3);
  sh.lineTo(0.53, 0.14);
  sh.lineTo(0.5, 0.1);
  sh.closePath();
  return sh;
}
function glassShape(): THREE.Shape {
  const sh = new THREE.Shape();
  sh.moveTo(-0.29, 0.335);
  sh.lineTo(-0.16, 0.475);
  sh.lineTo(0.11, 0.485);
  sh.lineTo(0.255, 0.345);
  sh.closePath();
  return sh;
}

function build() {
  const root = new THREE.Group();
  const r = rng(5);
  const dot = dotTexture();
  const chrome = matcapTexture("#d8eeff");

  // the simulator's ground, a shade off black so the world reads as a place, and its horizon
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), basic("#090c15"));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.004;
  root.add(ground);
  const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(28, 28, 18, 64, 1, true),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying float vY;
        void main() {
          float h = clamp((vY + 9.0) / 18.0, 0.0, 1.0);
          vec3 c = mix(vec3(0.075, 0.09, 0.19), vec3(0.02, 0.024, 0.04), smoothstep(0.5, 0.95, h));
          c += vec3(0.08, 0.26, 0.34) * exp(-pow((h - 0.5) / 0.05, 2.0)) * 0.55;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    }),
  );
  horizon.position.y = 8.5;
  root.add(horizon);

  root.add(floorGrid(40, 0.5));
  const floorGlow = glow(C.cyan, 22, 0.1, dot);
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.002;
  root.add(floorGlow);

  // ── the track ──
  const curve = new THREE.CatmullRomCurve3(PATH.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
  const pts = curve.getSpacedPoints(SAMPLES);
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  const pos = new Float32Array((SAMPLES + 1) * 2 * 3);
  pts.forEach((p, i) => {
    const tan = curve.getTangentAt(i / SAMPLES);
    const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const l = p.clone().addScaledVector(n, ROAD_W / 2);
    const rr = p.clone().addScaledVector(n, -ROAD_W / 2);
    left.push(l.clone().setY(0.012));
    right.push(rr.clone().setY(0.012));
    pos.set([l.x, 0.005, l.z, rr.x, 0.005, rr.z], i * 6);
  });
  const idx: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  roadGeo.setIndex(idx);
  const road = new THREE.Mesh(roadGeo, basic("#1a2031"));
  const edgeMat = lineMat("#c9d2e6", 0.85);
  const edgeL = new THREE.Line(new THREE.BufferGeometry().setFromPoints(left), edgeMat);
  const edgeR = new THREE.Line(new THREE.BufferGeometry().setFromPoints(right), edgeMat);
  const dashPts: THREE.Vector3[] = [];
  for (let i = 0; i < SAMPLES - 4; i += 8) dashPts.push(pts[i]!.clone().setY(0.015), pts[i + 4]!.clone().setY(0.015));
  const lane = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(dashPts), lineMat("#ffc857", 0.8));
  const trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts.map((p) => p.clone().setY(0.02))),
    lineMat(C.cyan, 1),
  );
  root.add(road, edgeL, edgeR, lane, trail);

  // ── the scenery the simulator puts round the track: towers, trees, cones ──
  // Placed at random, but never on the road or within a car's width of it.
  const clear = (x: number, z: number, m: number) => pts.every((q) => (q.x - x) ** 2 + (q.z - z) ** 2 > (ROAD_W / 2 + m) ** 2);
  const scenery: { obj: THREE.Object3D; at: number }[] = [];
  const faces = [0, 1, 2, 3].map((k) => [facadeTexture(20 + k, 1), facadeTexture(40 + k, 0.62)] as const);
  const roofMat = basic("#1b2134");
  const towerAt = (x: number, z: number, w: number, d: number, h: number, k: number) => {
    const [lit, shade] = faces[k % faces.length]!;
    const litM = new THREE.MeshBasicMaterial({ map: lit });
    const shadeM = new THREE.MeshBasicMaterial({ map: shade });
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [shadeM, shadeM, roofMat, roofMat, litM, litM]);
    box.position.set(x, h / 2, z);
    const g = new THREE.Group();
    g.add(box);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), lineMat("#3b4a78", 0.6));
    edges.position.copy(box.position);
    g.add(edges);
    root.add(g);
    scenery.push({ obj: g, at: Math.hypot(x + 0.6, z - 0.8) });
  };
  let towers = 0;
  for (let tries = 0; towers < 16 && tries < 400; tries++) {
    const x = -11 + r() * 22;
    const z = -8 + r() * 15;
    const w = 0.8 + r() * 1.0;
    if (!clear(x, z, 1.1 + w / 2) || Math.hypot(x - 5.8, z - 3.9) < 2.4) continue;
    towerAt(x, z, w, 0.8 + r() * 1.0, 0.9 + r() * (Math.abs(z) > 4 ? 3.2 : 1.8), towers);
    towers++;
  }
  // foliage gets its own matcap: the chrome one runs to white, which reads as frosted glass
  const leafCap = canvasTexture(128, 128, (g) => {
    const gr = g.createRadialGradient(48, 42, 4, 64, 64, 64);
    gr.addColorStop(0, "#9df5c0");
    gr.addColorStop(0.35, "#3fae78");
    gr.addColorStop(0.8, "#14402d");
    gr.addColorStop(1, "#08140f");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });
  const leafMat = new THREE.MeshMatcapMaterial({ matcap: leafCap, flatShading: true });
  const barkMat = basic("#2a2230");
  let trees = 0;
  for (let tries = 0; trees < 34 && tries < 600; tries++) {
    const x = -10 + r() * 20;
    const z = -7 + r() * 14;
    if (!clear(x, z, 0.6) || Math.hypot(x - 5.8, z - 3.9) < 1.6) continue;
    const g = new THREE.Group();
    const h = 0.55 + r() * 0.5;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.2 + r() * 0.14, h, 7), leafMat);
    crown.position.y = 0.22 + h / 2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.24, 6), barkMat);
    trunk.position.y = 0.12;
    g.add(trunk, crown);
    g.position.set(x, 0, z);
    root.add(g);
    scenery.push({ obj: g, at: Math.hypot(x + 0.6, z - 0.8) });
    trees++;
  }
  const coneMat = new THREE.MeshMatcapMaterial({ matcap: matcapTexture("#ffae5c") });
  const coneAt = pts[Math.floor(SAMPLES * 0.95)]!;
  for (let k = 0; k < 5; k++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 10), coneMat);
    c.position.set(coneAt.x - 1.05 - (k % 2) * 0.12, 0.09, coneAt.z - 0.5 + k * 0.32);
    root.add(c);
    scenery.push({ obj: c, at: 9 });
  }
  const maxAt = Math.max(...scenery.map((sc) => sc.at));

  // ── the bay, at the end of the run ──
  const end = pts[SAMPLES]!;
  const endTan = curve.getTangentAt(1);
  const bay = new THREE.Group();
  bay.position.copy(end);
  bay.rotation.y = Math.atan2(-endTan.z, endTan.x);
  const bayLines = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.75, 0.02, -0.55),
      new THREE.Vector3(0.75, 0.02, -0.55),
      new THREE.Vector3(0.75, 0.02, 0.55),
      new THREE.Vector3(-0.75, 0.02, 0.55),
    ]),
    lineMat("#e6ecf8", 1),
  );
  const bayFill = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), basic(C.cyan, 0, true));
  bayFill.rotation.x = -Math.PI / 2;
  bayFill.position.y = 0.018;
  const parked = label("PARKED", 0.26, { color: "#d4ff5f", border: "#d4ff5f" });
  parked.position.set(0, 1.2, 0);
  bay.add(bayLines, bayFill, parked);
  root.add(bay);

  // ── signs, and the boxes the car draws round them ──
  const signs = SIGNS.map((sg) => {
    const p = curve.getPointAt(sg.u);
    const tan = curve.getTangentAt(sg.u);
    const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const g = new THREE.Group();
    g.position.copy(p).addScaledVector(n, sg.side * (ROAD_W / 2 + 0.55));
    g.rotation.y = Math.atan2(-tan.z, tan.x) - Math.PI / 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), basic("#8a93ad"));
    post.position.y = 0.5;
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      new THREE.MeshBasicMaterial({ map: signTexture(sg.key), transparent: true }),
    );
    plate.position.y = 1.12;
    // the back of the sign is a blank plate, not the face seen through the metal
    const rear = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.48), basic("#3a4260"));
    rear.rotation.y = Math.PI;
    rear.position.set(0, 1.12, -0.005);
    g.add(rear);
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.72, 1.55, 0.4)),
      lineMat(C.amber, 0),
    );
    box.position.y = 0.78;
    const tag = label(sg.text, 0.2, { color: "#ffc857", border: "#ffc857" });
    tag.position.y = 1.78;
    g.add(post, plate, box, tag);
    root.add(g);
    return { ...sg, g, box, tag };
  });

  // ── the car ──
  const car = new THREE.Group();
  const shell = new THREE.MeshMatcapMaterial({ matcap: chrome });
  const bodyGeo = new THREE.ExtrudeGeometry(carShape(), {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 1,
  });
  bodyGeo.translate(0, 0, -0.23);
  const body = new THREE.Mesh(bodyGeo, shell);
  const glassGeo = new THREE.ExtrudeGeometry(glassShape(), { depth: 0.53, bevelEnabled: false });
  glassGeo.translate(0, 0.004, -0.265);
  const glass = new THREE.Mesh(glassGeo, basic("#0a1322"));
  const glassEdge = new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo, 30), lineMat(C.cyan, 0.7));
  car.add(body, glass, glassEdge);
  const wheelGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.09, 20);
  const wheelMat = basic("#05070c");
  const rimGeo = new THREE.TorusGeometry(0.065, 0.014, 6, 20);
  const rimMat = basic("#8a93ad");
  const wheels: THREE.Group[] = [];
  for (const [x, z] of [[0.31, 0.27], [0.31, -0.27], [-0.31, 0.27], [-0.31, -0.27]] as const) {
    const w = new THREE.Group();
    const tyre = new THREE.Mesh(wheelGeo, wheelMat);
    tyre.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.z = z > 0 ? 0.046 : -0.046;
    w.add(tyre, rim);
    w.position.set(x, 0.11, z);
    car.add(w);
    wheels.push(w);
  }
  const head = basic("#e8fdff");
  for (const z of [0.16, -0.16]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.12), head);
    l.position.set(0.53, 0.25, z);
    car.add(l);
  }
  // headlight throw on the road ahead
  const beam = glow("#bfefff", 1, 0.22, dot);
  beam.rotation.x = -Math.PI / 2;
  beam.scale.set(1.6, 0.9, 1);
  beam.position.set(1.15, 0.012, 0);
  car.add(beam);
  const brakeMat = basic(C.rose, 0.25, true);
  const brake = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.44), brakeMat);
  brake.position.set(-0.535, 0.265, 0);
  car.add(brake);
  const under = glow(C.cyan, 1, 0.4, dot);
  under.rotation.x = -Math.PI / 2;
  under.scale.set(1.9, 1.2, 1);
  under.position.y = 0.01;
  car.add(under);

  // the sensor: a sweeping fan of rays and the ring of returns it reads
  const lidar = new THREE.Group();
  lidar.position.y = 0.56;
  const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16), basic(C.cyan));
  puck.position.y = -0.03;
  lidar.add(puck);
  const RAYS = 30;
  const rayPos = new Float32Array(RAYS * 6);
  const rayCol = new Float32Array(RAYS * 6);
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 0.9 - Math.PI * 0.45;
    const len = 1.3 + r() * 0.5;
    rayPos.set([0, 0, 0, Math.cos(a) * len, -0.5, Math.sin(a) * len], i * 6);
    rayCol.set([0.34, 0.9, 1, 0.02, 0.05, 0.08], i * 6);
  }
  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute("position", new THREE.BufferAttribute(rayPos, 3));
  rayGeo.setAttribute("color", new THREE.BufferAttribute(rayCol, 3));
  const rays = new THREE.LineSegments(
    rayGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  lidar.add(rays);
  const RET = 160;
  const retPos = new Float32Array(RET * 3);
  for (let i = 0; i < RET; i++) {
    const a = (i / RET) * Math.PI * 2;
    const d = 1.55 + Math.sin(a * 5) * 0.18 + r() * 0.15;
    retPos.set([Math.cos(a) * d, -0.53, Math.sin(a) * d], i * 3);
  }
  const retGeo = new THREE.BufferGeometry();
  retGeo.setAttribute("position", new THREE.BufferAttribute(retPos, 3));
  const returns = new THREE.Points(
    retGeo,
    new THREE.PointsMaterial({ color: C.cyan, size: 0.05, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  lidar.add(returns);
  car.add(lidar);
  root.add(car);

  const spawn = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.5, 64), basic(C.cyan, 0, true));
  spawn.rotation.x = -Math.PI / 2;
  spawn.position.copy(pts[0]!).setY(0.02);
  root.add(spawn);

  // ── the network, hung over the track while it trains ──
  const net = new THREE.Group();
  net.position.set(-0.4, 2.9, -0.6);
  const layers = [4, 7, 9, 7, 3];
  const nodePos: number[] = [];
  const nodeLayer: number[] = [];
  const nodesXY: THREE.Vector3[][] = [];
  layers.forEach((n, l) => {
    const col: THREE.Vector3[] = [];
    for (let k = 0; k < n; k++) {
      const v = new THREE.Vector3((l - 2) * 1.05, (k - (n - 1) / 2) * 0.32, 0);
      col.push(v);
      nodePos.push(v.x, v.y, v.z);
      nodeLayer.push(l);
    }
    nodesXY.push(col);
  });
  const edgePos: number[] = [];
  const edgeLayer: number[] = [];
  for (let l = 0; l < layers.length - 1; l++)
    for (const a of nodesXY[l] ?? [])
      for (const b of nodesXY[l + 1] ?? []) {
        edgePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        edgeLayer.push(l, l + 1);
      }
  const netUniforms = { uTime: { value: 0 }, uOn: { value: 0 } };
  const netMat = (isPoint: boolean) =>
    new THREE.ShaderMaterial({
      uniforms: { ...netUniforms, uPoint: { value: isPoint ? 1 : 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uOn; uniform float uPoint;
        attribute float aLayer; varying float vA;
        void main() {
          float wave = max(0.0, sin(uTime * 4.0 - aLayer * 1.25));
          vA = (0.18 + 0.82 * wave) * uOn;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uPoint * (14.0 + 16.0 * wave) * (6.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uPoint; varying float vA;
        void main() {
          float a = vA;
          if (uPoint > 0.5) { float r = length(gl_PointCoord - 0.5); a *= smoothstep(0.5, 0.1, r); }
          gl_FragColor = vec4(mix(vec3(0.616, 0.549, 1.0), vec3(0.341, 0.902, 1.0), 0.5), a * (uPoint > 0.5 ? 1.0 : 0.45));
        }
      `,
    });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(nodePos, 3));
  nodeGeo.setAttribute("aLayer", new THREE.Float32BufferAttribute(nodeLayer, 1));
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));
  edgeGeo.setAttribute("aLayer", new THREE.Float32BufferAttribute(edgeLayer, 1));
  const nodeMat = netMat(true);
  const edgeMatN = netMat(false);
  net.add(new THREE.LineSegments(edgeGeo, edgeMatN), new THREE.Points(nodeGeo, nodeMat));
  const training = label("TRAINING", 0.22, { color: "#9d8cff", border: "#9d8cff" });
  training.position.set(0, 1.25, 0);
  net.add(training);
  root.add(net);

  return { root, curve, road, edgeL, edgeR, lane, trail, bay, bayLines, bayFill, parked, signs, car, wheels, beam, lidar, rays, returns, brakeMat, spawn, net, nodeMat, edgeMatN, training, pts, scenery, maxAt };
}

export function DriveScene({ drive }: { drive: Drive }) {
  const s = useMemo(build, []);
  const { camera } = useThree();
  useEffect(() => () => dispose(s.root), [s]);

  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      look: new THREE.Vector3(),
      lookB: new THREE.Vector3(),
      center: new THREE.Vector3(-0.6, 0, 0.8),
      bayCam: new THREE.Vector3(),
      bayLook: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((_, dt) => {
    stepDrive(drive, dt);
    const { p, t } = drive;
    const total = SAMPLES * 6;

    // ── the world builds ──
    const laid = easeOut(seg(p, 0.02, 0.2));
    s.road.geometry.setDrawRange(0, Math.floor((total * laid) / 6) * 6);
    const edge = Math.floor((SAMPLES + 1) * laid);
    s.edgeL.geometry.setDrawRange(0, edge);
    s.edgeR.geometry.setDrawRange(0, edge);
    s.lane.geometry.setDrawRange(0, Math.floor(((SAMPLES - 4) / 4) * laid) * 2);
    s.bay.scale.setScalar(Math.max(0.001, backOut(seg(p, 0.15, 0.21))));
    // the scenery rises in a ripple out from the middle of the world
    s.scenery.forEach((sc) => {
      const at = 0.03 + (sc.at / s.maxAt) * 0.14;
      const up = backOut(seg(p, at, at + 0.05));
      sc.obj.scale.set(1, Math.max(0.001, up), 1);
      sc.obj.visible = p > at;
    });
    s.signs.forEach((sg, n) => {
      const up = backOut(seg(p, 0.12 + n * 0.03, 0.19 + n * 0.03));
      sg.g.scale.set(1, Math.max(0.001, up), 1);
    });

    // ── the network trains ──
    const on = seg(p, 0.2, 0.26) * (1 - seg(p, 0.44, 0.5));
    s.nodeMat.uniforms.uOn!.value = on;
    s.edgeMatN.uniforms.uOn!.value = on;
    s.nodeMat.uniforms.uTime!.value = t;
    s.edgeMatN.uniforms.uTime!.value = t;
    s.net.visible = on > 0.01;
    s.net.position.y = 2.9 + Math.sin(t * 0.8) * 0.06;
    // the hologram faces the lens, with a slow sway
    s.net.quaternion.copy(camera.quaternion);
    s.net.rotateY(Math.sin(t * 0.3) * 0.25);
    (s.training.material as THREE.SpriteMaterial).opacity = on * seg(p, 0.22, 0.3) * (1 - seg(p, 0.44, 0.5));

    // ── the drive ──
    const u = easeInOut(seg(p, DRIVE_A, DRIVE_B));
    s.curve.getPointAt(u, tmp.p);
    s.curve.getTangentAt(Math.min(0.999, Math.max(0.001, u)), tmp.t);
    s.car.position.copy(tmp.p);
    s.car.rotation.y = Math.atan2(-tmp.t.z, tmp.t.x);
    const spawn = backOut(seg(p, 0.18, 0.24));
    s.car.scale.setScalar(Math.max(0.001, spawn));
    s.car.visible = p > 0.18;
    const ringK = seg(p, 0.18, 0.32);
    s.spawn.scale.setScalar(1 + ringK * 4);
    (s.spawn.material as THREE.MeshBasicMaterial).opacity = p < 0.18 ? 0 : (1 - ringK) * 0.8;
    s.trail.geometry.setDrawRange(0, Math.floor((SAMPLES + 1) * u));
    // wheels turn with the distance covered — about 22 m of track, 0.11 m tyres
    s.wheels.forEach((w) => (w.rotation.z = -u * 200));
    (s.beam.material as THREE.MeshBasicMaterial).opacity = p > 0.2 && p < DRIVE_B ? 0.22 : 0.08;

    const live = p > 0.2 && p < DRIVE_B + 0.02;
    s.lidar.rotation.y = live ? Math.sin(t * 2.2) * 0.6 : 0;
    s.returns.rotation.y = t * 0.4;
    (s.rays.material as THREE.LineBasicMaterial).opacity = live ? 0.55 : 0.2;
    (s.returns.material as THREE.PointsMaterial).opacity = live ? 0.9 : 0.3;
    s.brakeMat.opacity = p > DRIVE_B - 0.03 ? 0.95 : 0.25;

    // ── reading the signs ──
    s.signs.forEach((sg) => {
      const read = seg(u, sg.u - 0.12, sg.u - 0.05);
      (sg.box.material as THREE.LineBasicMaterial).opacity = read;
      sg.box.scale.setScalar(Math.max(0.001, 1.6 - 0.6 * backOut(read)));
      (sg.tag.material as THREE.SpriteMaterial).opacity = read;
      sizeLabel(sg.tag as Sprite, 0.2 * (0.6 + 0.4 * backOut(read)));
    });

    // ── parked ──
    const done = seg(p, DRIVE_B, DRIVE_B + 0.05);
    (s.bayFill.material as THREE.MeshBasicMaterial).opacity = done * (0.22 + 0.1 * Math.sin(t * 4));
    (s.parked.material as THREE.SpriteMaterial).opacity = done;
    sizeLabel(s.parked as Sprite, 0.26 * (0.6 + 0.4 * backOut(done)));

    // ── camera: overview → chase → over the bay ──
    const ang = -0.2 + Math.sin(t * 0.08) * 0.12 + p * 0.25;
    tmp.a.set(tmp.center.x + Math.sin(ang) * 12.5, 8.6, tmp.center.z + Math.cos(ang) * 12.5);
    tmp.look.copy(tmp.center);
    const fwd = tmp.t.clone().setY(0).normalize();
    tmp.b.copy(tmp.p).addScaledVector(fwd, -3.6).setY(2.1);
    tmp.lookB.copy(tmp.p).addScaledVector(fwd, 2.4).setY(0.35);
    const chase = easeInOut(seg(p, 0.42, 0.52));
    camera.position.lerpVectors(tmp.a, tmp.b, chase);
    tmp.look.lerp(tmp.lookB, chase);
    // parked: pull up and round to a three-quarter view of the bay
    const end = easeInOut(seg(p, 0.92, 1));
    if (end > 0) {
      // framed wide enough to keep the parking sign it read in the shot with the car
      const sign = s.signs[1]!.g.position;
      tmp.bayLook.copy(s.bay.position).lerp(sign, 0.4).setY(0.45);
      tmp.bayCam.copy(tmp.bayLook).add(new THREE.Vector3(-4.4, 3.5, 2.2));
      camera.position.lerp(tmp.bayCam, end);
      tmp.look.lerp(tmp.bayLook, end);
    }
    if (Math.abs(drive.mx) < 1.5) camera.position.x += drive.mx * 0.5 * (1 - chase);
    camera.lookAt(tmp.look);
  });

  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 12, 30]} />
      <primitive object={s.root} />
    </>
  );
}
