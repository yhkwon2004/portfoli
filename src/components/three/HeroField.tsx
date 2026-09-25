"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIMPLEX_3D } from "@/components/three/noise";
import { rng, stepDrive, type Drive } from "@/components/three/core";

/**
 * The hero: a field of light that is first a brain and then a neural network.
 *
 * Every particle carries two positions — one on a brain-like surface, one in a five-layer
 * network — and the vertex shader morphs between them as the reader scrolls out of the hero.
 * The same is true of the synapses: each line has a pair of endpoints in both shapes, so as
 * the cortex unfolds into layers the connections re-route with it. It is the site's thesis
 * drawn once: the thing that thinks, becoming the thing that is engineered.
 *
 * Everything that moves is in the shaders — a simplex-noise breath, a twinkle per particle,
 * pulses running along the synapses, and a pointer that parts the field around it — so the
 * CPU does one uniform write per frame.
 */

const LAYERS = [9, 15, 20, 15, 7];
const LAYER_X = [-2.7, -1.35, 0, 1.35, 2.7];

type Built = { points: THREE.BufferGeometry; lines: THREE.BufferGeometry };

function nodes(): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  LAYERS.forEach((n, l) => {
    const r = 0.35 + n * 0.062;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + l * 0.4;
      out.push(new THREE.Vector3(LAYER_X[l] ?? 0, Math.sin(a) * r, Math.cos(a) * r));
    }
  });
  return out;
}

/** A point on the brain-like surface: two hemispheres, a fissure, and folded gyri. */
function brainPoint(r: () => number, out: THREE.Vector3): THREE.Vector3 {
  const u = r() * 2 - 1;
  const th = r() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  let x = s * Math.cos(th);
  const y = u;
  const z = s * Math.sin(th);
  const fold = 1 + 0.055 * Math.sin(9 * th + 5 * u) * Math.cos(7 * u * Math.PI) + (r() - 0.5) * 0.03;
  x = x * 1.38 * fold;
  let yy = y * 1.12 * fold;
  const zz = z * 1.62 * fold;
  // the longitudinal fissure: hemispheres pulled apart, the top pinched in along the seam
  x += Math.sign(x) * 0.1;
  if (Math.abs(x) < 0.32 && yy > 0) yy -= (0.32 - Math.abs(x)) * 0.55;
  // flatter underside
  if (yy < -0.5) yy = -0.5 + (yy + 0.5) * 0.55;
  return out.set(x, yy + 0.1, zz);
}

function build(count: number, seed = 7): Built {
  const r = rng(seed);
  const net = nodes();
  const edges: [number, number][] = [];
  let base = 0;
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const a = LAYERS[l] ?? 0;
    const b = LAYERS[l + 1] ?? 0;
    for (let i = 0; i < a; i++)
      for (let c = 0; c < 3; c++) edges.push([base + i, base + a + Math.floor(r() * b)]);
    base += a;
  }

  const A = new Float32Array(count * 3);
  const B = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const kind = r();
    if (kind < 0.86) brainPoint(r, v);
    else if (kind < 0.92) v.set((r() - 0.5) * 0.9, -0.95 + (r() - 0.5) * 0.35, -1.1 + (r() - 0.5) * 0.7); // cerebellum
    else v.set((r() - 0.5) * 2.2, (r() - 0.5) * 1.6, (r() - 0.5) * 2.6); // a sparse inner glow
    A.set([v.x, v.y, v.z], i * 3);

    // In the network, most particles gather on a node; the rest stream along an edge.
    if (r() < 0.72) {
      const n = net[Math.floor(r() * net.length)] ?? v;
      const g = () => (r() + r() + r() - 1.5) * 0.09;
      B.set([n.x + g(), n.y + g(), n.z + g()], i * 3);
    } else {
      const e = edges[Math.floor(r() * edges.length)] ?? [0, 0];
      const p0 = net[e[0]] ?? v;
      const p1 = net[e[1]] ?? v;
      const t = r();
      B.set([p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t, p0.z + (p1.z - p0.z) * t], i * 3);
    }
    seeds[i] = r();
  }
  const points = new THREE.BufferGeometry();
  points.setAttribute("position", new THREE.BufferAttribute(A, 3));
  points.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  points.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  // Synapses: each a polyline of SEGS pieces, so a pulse can travel along it.
  const SEGS = 10;
  const lineCount = Math.min(420, edges.length * 2);
  const verts = lineCount * SEGS * 2;
  const LA = new Float32Array(verts * 3);
  const LB = new Float32Array(verts * 3);
  const LT = new Float32Array(verts);
  const LS = new Float32Array(verts);
  const a0 = new THREE.Vector3();
  const a1 = new THREE.Vector3();
  let w = 0;
  for (let i = 0; i < lineCount; i++) {
    // in the brain: two nearby surface points, bowed slightly outward
    brainPoint(r, a0);
    let best = Infinity;
    const cand = new THREE.Vector3();
    for (let k = 0; k < 12; k++) {
      brainPoint(r, cand);
      const d = cand.distanceTo(a0);
      if (d > 0.18 && d < best) {
        best = d;
        a1.copy(cand);
      }
    }
    const e = edges[i % edges.length] ?? [0, 0];
    const b0 = net[e[0]] ?? a0;
    const b1 = net[e[1]] ?? a1;
    const s = r();
    for (let k = 0; k < SEGS; k++)
      for (const t of [k / SEGS, (k + 1) / SEGS]) {
        const bow = Math.sin(t * Math.PI) * 0.08;
        LA.set(
          [
            a0.x + (a1.x - a0.x) * t + a0.x * bow,
            a0.y + (a1.y - a0.y) * t + a0.y * bow,
            a0.z + (a1.z - a0.z) * t + a0.z * bow,
          ],
          w * 3,
        );
        LB.set([b0.x + (b1.x - b0.x) * t, b0.y + (b1.y - b0.y) * t, b0.z + (b1.z - b0.z) * t], w * 3);
        LT[w] = t;
        LS[w] = s;
        w++;
      }
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(LA, 3));
  lines.setAttribute("aB", new THREE.BufferAttribute(LB, 3));
  lines.setAttribute("aT", new THREE.BufferAttribute(LT, 1));
  lines.setAttribute("aSeed", new THREE.BufferAttribute(LS, 1));
  return { points, lines };
}

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uMouse;
  attribute vec3 aB;
  attribute float aSeed;
  ${SIMPLEX_3D}
  vec3 field(vec3 a) {
    float m = smoothstep(0.0, 1.0, uMorph);
    vec3 p = mix(a, aB, m);
    float n = snoise(p * 0.55 + vec3(0.0, 0.0, uTime * 0.07));
    p += normalize(p + 1e-4) * n * mix(0.16, 0.06, m);
    return p;
  }
  vec4 place(vec3 p, out float push) {
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uMouse;
    float dist = length(d);
    push = smoothstep(0.42, 0.0, dist);
    mv.xy += normalize(d + 1e-5) * push * 0.35 * (-mv.z) * 0.18;
    return mv;
  }
`;

const POINT_VS = /* glsl */ `
  uniform float uSize;
  uniform float uPixel;
  varying vec3 vColor;
  varying float vAlpha;
  ${COMMON}
  void main() {
    vec3 p = field(position);
    float push;
    vec4 mv = place(p, push);
    gl_Position = projectionMatrix * mv;
    float s = 0.35 + aSeed * 0.75;
    gl_PointSize = uSize * uPixel * s / -mv.z * (1.0 + push * 0.9);
    float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 60.0);
    vAlpha = mix(0.35, 1.0, tw);
    vec3 violet = vec3(0.616, 0.549, 1.0);
    vec3 cyan = vec3(0.341, 0.902, 1.0);
    vec3 lime = vec3(0.831, 1.0, 0.373);
    vColor = mix(violet, cyan, smoothstep(-1.6, 1.6, p.x + p.y * 0.4));
    vColor = mix(vColor, lime, step(0.965, aSeed) * 0.9);
    vColor += push * 0.25;
  }
`;

const POINT_FS = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

const LINE_VS = /* glsl */ `
  attribute float aT;
  varying float vA;
  varying vec3 vColor;
  ${COMMON}
  void main() {
    vec3 p = field(position);
    float push;
    vec4 mv = place(p, push);
    gl_Position = projectionMatrix * mv;
    float s = fract(uTime * (0.22 + aSeed * 0.25) + aSeed * 7.0);
    float pulse = exp(-pow((aT - s) * 7.0, 2.0));
    vA = 0.07 + pulse * 0.75;
    vColor = mix(vec3(0.616, 0.549, 1.0), vec3(0.341, 0.902, 1.0), aT);
  }
`;

const LINE_FS = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  varying vec3 vColor;
  void main() { gl_FragColor = vec4(vColor, vA * uOpacity); }
`;

export function HeroField({ drive, count = 16000 }: { drive: Drive; count?: number }) {
  const group = useRef<THREE.Group>(null);
  const { points, lines } = useMemo(() => build(count), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uSize: { value: 30 },
      uPixel: { value: 1 },
      uOpacity: { value: 1 },
    }),
    [],
  );
  const pointMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: POINT_VS,
        fragmentShader: POINT_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: LINE_VS,
        fragmentShader: LINE_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );

  useFrame((state, dt) => {
    stepDrive(drive, dt);
    const p = drive.p;
    uniforms.uTime.value = drive.t;
    uniforms.uMorph.value = THREE.MathUtils.smoothstep(p, 0.12, 0.72);
    uniforms.uPixel.value = state.gl.getPixelRatio();
    // The pointer, eased, in normalised device coordinates. Off-canvas it parks far away.
    const m = uniforms.uMouse.value;
    const tx = drive.capture ? 9 : drive.mx;
    const ty = drive.capture ? 9 : drive.my;
    m.x += (tx - m.x) * 0.12;
    m.y += (ty - m.y) * 0.12;
    uniforms.uOpacity.value = 1 - THREE.MathUtils.smoothstep(p, 0.82, 1) * 0.7;
    // Parallax only while the pointer is actually over the field (off it, mx/my park at 9).
    const px = drive.capture || Math.abs(drive.mx) > 1.5 ? 0 : drive.mx;
    const py = drive.capture || Math.abs(drive.my) > 1.5 ? 0 : drive.my;
    const g = group.current;
    if (g) {
      // a three-quarter view of the brain, turning to face the network side-on as it unfolds
      const m = uniforms.uMorph.value;
      g.rotation.y = THREE.MathUtils.lerp(-0.95 + drive.t * 0.05, 0.32 + Math.sin(drive.t * 0.2) * 0.12, m) + px * 0.12;
      g.rotation.x = THREE.MathUtils.lerp(0.28, 0.12, m) - py * 0.08;
      g.position.y = p * 0.25;
      // On a wide screen the field sits right of centre, beside the headline rather than
      // under it, and drifts back toward the middle as it opens into the network.
      const aspect = state.size.width / Math.max(1, state.size.height);
      g.position.x = Math.min(2, Math.max(0, (aspect - 1) * 2.4)) * (1 - m * 0.45);
    }
    state.camera.position.z = 6.4 + p * 0.8;
  });

  return (
    <group ref={group}>
      <points geometry={points} material={pointMat} frustumCulled={false} />
      <lineSegments geometry={lines} material={lineMat} frustumCulled={false} />
    </group>
  );
}
