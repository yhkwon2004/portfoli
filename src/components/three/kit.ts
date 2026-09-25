import * as THREE from "three";
import { labelTexture } from "@/components/three/core";

/**
 * Small constructors the three case-study scenes share. Each scene is built imperatively,
 * once, into a single THREE.Group and animated in `useFrame` from (p, t) — a scene graph of a
 * few hundred objects written as JSX would be harder to read, not easier, and every moving
 * part needs a direct handle anyway.
 */

export type Sprite = THREE.Sprite & { userData: { aspect: number } };

/** A billboard label, `h` world units tall. */
export function label(text: string, h: number, opts: Parameters<typeof labelTexture>[1] = {}): Sprite {
  const { tex, aspect } = labelTexture(text, opts);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(mat) as Sprite;
  s.userData.aspect = aspect;
  s.scale.set(h * aspect, h, 1);
  s.renderOrder = 10;
  return s;
}

/** Set a sprite's size by its height, keeping its aspect. */
export function sizeLabel(s: Sprite, h: number): void {
  s.scale.set(Math.max(0, h) * s.userData.aspect, Math.max(0, h), 1);
}

export const basic = (color: THREE.ColorRepresentation, opacity = 1, additive = false) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1 || additive,
    opacity,
    depthWrite: !additive && opacity >= 1,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });

export const lineMat = (color: THREE.ColorRepresentation, opacity = 1) =>
  new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });

/** A polyline from points. */
export function polyline(points: readonly THREE.Vector3[], mat: THREE.Material): THREE.Line {
  const g = new THREE.BufferGeometry().setFromPoints(points as THREE.Vector3[]);
  return new THREE.Line(g, mat);
}

/** A floor grid that fades out with distance, so it has no hard edge. */
export function floorGrid(size = 30, step = 0.5, color = "#1d2438"): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStep: { value: step }, uFade: { value: size * 0.32 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uStep; uniform float uFade;
      varying vec3 vW;
      void main() {
        vec2 c = vW.xz / uStep;
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        vec2 c2 = vW.xz / (uStep * 4.0);
        vec2 g2 = abs(fract(c2 - 0.5) - 0.5) / fwidth(c2);
        float major = 1.0 - min(min(g2.x, g2.y), 1.0);
        float fade = 1.0 - smoothstep(uFade * 0.25, uFade, length(vW.xz));
        float a = (line * 0.35 + major * 0.55) * fade;
        gl_FragColor = vec4(uColor * 1.6, a);
      }
    `,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** A soft additive glow disc lying on the floor or facing the camera. */
export function glow(color: THREE.ColorRepresentation, size: number, opacity: number, tex: THREE.Texture): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({
    color,
    map: tex,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
}

/** Free every GPU resource under `root`. */
export function dispose(root: THREE.Object3D): void {
  root.traverse((o) => {
    const any = o as THREE.Mesh;
    any.geometry?.dispose?.();
    const mats = Array.isArray(any.material) ? any.material : any.material ? [any.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
      m.dispose();
    }
  });
}

/** Look from `pos` at `at`, both lerped between two poses by `k`. */
export function aim(
  cam: THREE.Camera,
  a: { pos: THREE.Vector3; at: THREE.Vector3 },
  b: { pos: THREE.Vector3; at: THREE.Vector3 },
  k: number,
  tmp = new THREE.Vector3(),
): void {
  cam.position.lerpVectors(a.pos, b.pos, k);
  tmp.lerpVectors(a.at, b.at, k);
  cam.lookAt(tmp);
}
