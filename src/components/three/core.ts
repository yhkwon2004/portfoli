import * as THREE from "three";

/**
 * What every 3D scene is driven by: two numbers.
 *
 *   p  where the story is, 0 → 1. Live, it follows the reader's scroll through the section;
 *      during a media render it is set frame by frame.
 *   t  seconds of idle life — the breathing, drifting and spinning that happen whatever the
 *      story's position.
 *
 * Scenes read these in `useFrame` and never own a clock of their own, which is what makes a
 * render deterministic: the same (p, t) always draws the same frame.
 */
export type Drive = {
  p: number;
  /** Where p is heading; live, p eases toward it so a scroll wheel's steps become a glide. */
  target: number;
  t: number;
  /** Normalised pointer, −1 → 1, for parallax; parked at 9 while the pointer is elsewhere. */
  mx: number;
  my: number;
  /** True when a render harness is setting p and t directly. */
  capture: boolean;
};

export const createDrive = (): Drive => ({ p: 0, target: 0, t: 0, mx: 9, my: 9, capture: false });

/** Advance a live drive by one frame. A render harness skips this and sets p/t itself. */
export function stepDrive(d: Drive, dt: number): void {
  if (d.capture) return;
  const k = 1 - Math.exp(-Math.min(dt, 0.1) * 5);
  d.t += Math.min(dt, 0.1);
  d.p += (d.target - d.p) * k;
}

// ── keyframing helpers (the same vocabulary the SVG diagrams use) ──

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number): number => 1 - (1 - t) ** 3;
export const backOut = (t: number): number => {
  const c1 = 1.70158;
  const u = t - 1;
  return 1 + (c1 + 1) * u * u * u + c1 * u * u;
};

/** A deterministic PRNG, so the "random" scatter is the same on every load and every render. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── palette, as three.js colours ──

export const C = {
  bg: new THREE.Color("#05060a"),
  bg3: new THREE.Color("#10131c"),
  grid: new THREE.Color("#1a2033"),
  line: new THREE.Color("#2a3150"),
  fg: new THREE.Color("#f3f5fa"),
  fg3: new THREE.Color("#9aa1b3"),
  fg4: new THREE.Color("#6f7689"),
  violet: new THREE.Color("#9d8cff"),
  cyan: new THREE.Color("#57e6ff"),
  lime: new THREE.Color("#d4ff5f"),
  rose: new THREE.Color("#ff6b88"),
  amber: new THREE.Color("#ffc857"),
  green: new THREE.Color("#7df0a6"),
  magenta: new THREE.Color("#f07bff"),
};

// ── canvas textures: labels, icons, matcaps — drawn once, no image files ──

const FONT = '"Geist Mono", ui-monospace, Menlo, monospace';

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (g) draw(g);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A pill label, for sprites that name things in the scene. */
export function labelTexture(
  text: string,
  opts: { color?: string; bg?: string; border?: string; size?: number } = {},
): { tex: THREE.CanvasTexture; aspect: number } {
  const size = opts.size ?? 44;
  const pad = size * 0.6;
  const measure = document.createElement("canvas").getContext("2d");
  if (measure) measure.font = `600 ${size}px ${FONT}`;
  const tw = measure ? measure.measureText(text).width : text.length * size * 0.62;
  const w = Math.ceil(tw + pad * 2 + size * 0.2);
  const h = Math.ceil(size * 1.9);
  const tex = canvasTexture(w, h, (g) => {
    g.font = `600 ${size}px ${FONT}`;
    g.textBaseline = "middle";
    const r = h / 2;
    g.beginPath();
    g.roundRect(2, 2, w - 4, h - 4, r - 2);
    g.fillStyle = opts.bg ?? "rgba(5,6,10,0.82)";
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = opts.border ?? opts.color ?? "#57e6ff";
    g.stroke();
    g.fillStyle = opts.color ?? "#57e6ff";
    g.fillText(text, pad + size * 0.1, h / 2 + 2);
  });
  return { tex, aspect: w / h };
}

/** A matcap — the lit-sphere trick that gives the mannequin and the car their chrome. */
export function matcapTexture(tint = "#cfe9ff"): THREE.CanvasTexture {
  return canvasTexture(256, 256, (g) => {
    const base = g.createRadialGradient(96, 84, 8, 128, 128, 128);
    base.addColorStop(0, "#ffffff");
    base.addColorStop(0.18, tint);
    base.addColorStop(0.55, "#5d6678");
    base.addColorStop(0.86, "#161a26");
    base.addColorStop(1, "#0b0d14");
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    // a cold rim from below-right, the way a studio floor bounces light
    const rim = g.createRadialGradient(190, 200, 60, 190, 200, 140);
    rim.addColorStop(0, "rgba(87,230,255,0)");
    rim.addColorStop(0.75, "rgba(87,230,255,0)");
    rim.addColorStop(1, "rgba(87,230,255,0.55)");
    g.globalCompositeOperation = "lighter";
    g.fillStyle = rim;
    g.fillRect(0, 0, 256, 256);
  });
}

/** A soft round dot, for point sprites and glows. */
export function dotTexture(): THREE.CanvasTexture {
  return canvasTexture(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.35, "rgba(255,255,255,0.55)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  });
}

/** Is WebGL usable here at all? Checked once; a failure means the poster stands in. */
let webgl: boolean | null = null;
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}
