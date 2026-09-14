/**
 * The wireframe room.
 *
 * A perspective grid that reads as a corridor the camera is sitting inside: a floor and a
 * ceiling converging on a vanishing point, two side walls, and rungs that travel toward the
 * viewer and recycle. It is the reference's signature ground, and it does a job beyond
 * decoration — it gives the flat scenes in front of it a sense of depth and, because the rungs
 * move, it keeps the frame alive on chapters that have no animation of their own.
 *
 * Drawn with plain 2D projection (`screen = focal * world / depth`) rather than WebGL: it is a
 * few dozen straight lines, and a canvas2d path costs nothing next to the dependency and the
 * context-loss handling a GL surface would bring.
 */

/** How far down the frame the horizon sits. Slightly high, so the floor dominates. */
const HORIZON = 0.46;
/** Focal length in screen units. Larger = flatter, more telephoto. */
const FOCAL = 0.9;
/** Nearest and furthest rung depth. */
const NEAR = 0.55;
const FAR = 26;
/** Rungs, spaced evenly in depth. */
const RUNGS = 26;
/** Longitudinal lines either side of centre, per surface. */
const LANES = 7;
/** Half-width of the corridor in world units. */
const HALF_W = 4.6;
/** Distance from the camera axis to floor and ceiling. */
const FLOOR_Y = 1.5;
const CEIL_Y = 2.1;
/**
 * How far the room bows toward the camera at its edges, in world units.
 *
 * The reference's ground is not a flat corridor — it is a cylindrical wall with the camera
 * sitting inside it, so the grid cells compress toward the left and right of the frame. That
 * curvature is most of what makes it read as a room rather than as a perspective diagram.
 */
const BOW = 1.5;
/**
 * The bow fades out close to the camera. At full strength a near rung's edges would bow past
 * the camera plane and vanish mid-line; and the curvature has nothing to say at two world
 * units anyway — it is the far half of the room that carries it.
 */
const BOW_ONSET = 3.4;
/** Points across each bowed surface. A straight line needs two; an arc needs enough to read. */
const ARC_STEPS = 14;

export type GridTheme = {
  /** Lines at the vanishing point. */
  readonly far: string;
  /** Lines nearest the camera. */
  readonly near: string;
};

export class GridRoom {
  private w = 0;
  private h = 0;
  /** Travel, in depth units. Fractional part drives the rungs; it never needs resetting. */
  private travel = 0;
  /** Lateral camera offset, eased toward `targetPan` when the chapter changes. */
  private pan = 0;
  private targetPan = 0;
  /** 0 → still, 1 → full speed. Lifted on a cut, then decays. */
  private surge = 0;

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
  }

  /**
   * Aim the room. Each chapter sits at a slightly different lateral offset, so cutting between
   * chapters slides the corridor sideways — the frame moves even when the scene is static.
   */
  aim(chapterFraction: number): void {
    // ±0.8 world units across the whole reel, which is a visible but unshowy parallax.
    this.targetPan = (chapterFraction - 0.5) * 1.6;
    this.surge = 1;
  }

  step(dt: number): void {
    this.surge = Math.max(0, this.surge - dt * 0.9);
    // Base drift plus the post-cut surge: the corridor lurches forward on a cut, then settles.
    this.travel += dt * (0.55 + this.surge * 5.5);
    this.pan += (this.targetPan - this.pan) * Math.min(1, dt * 1.6);
  }

  /**
   * The depth of a point at lateral position `u` (-1 at the left wall, +1 at the right) on a
   * rung nominally at `z`. Squared in `u`, so the middle of the frame is unmoved and the
   * edges pull forward.
   */
  private bowed(u: number, z: number): number {
    return z - BOW * u * u * Math.min(1, z / BOW_ONSET);
  }

  /** Project a world point onto the canvas. Returns null when it is behind the camera. */
  private project(x: number, y: number, z: number): readonly [number, number] | null {
    if (z <= 0.05) return null;
    const s = (FOCAL * Math.min(this.w, this.h * 1.9)) / z;
    return [this.w / 2 + (x - this.pan) * s, this.h * HORIZON + y * s];
  }

  draw(ctx: CanvasRenderingContext2D, theme: GridTheme): void {
    ctx.clearRect(0, 0, this.w, this.h);
    if (!this.w || !this.h) return;

    ctx.lineCap = "butt";

    // Rungs travel toward the camera and recycle, so `travel` only ever advances.
    const spacing = (FAR - NEAR) / RUNGS;
    const offset = this.travel % spacing;

    for (let i = 0; i < RUNGS; i++) {
      const z = NEAR + i * spacing + offset;
      if (z > FAR) continue;
      // Fade with depth, and fade the nearest rung back out so recycling is invisible.
      const depth = (z - NEAR) / (FAR - NEAR);
      const alpha = (1 - depth) ** 1.8 * Math.min(1, (z - NEAR) / 1.4);
      this.rung(ctx, z, alpha, theme);
    }

    // Longitudinal lines run the length of the corridor and do not move, which is what gives
    // the travelling rungs something to travel against.
    for (let i = -LANES; i <= LANES; i++) {
      const u = i / LANES;
      this.rail(ctx, u, FLOOR_Y, theme);
      this.rail(ctx, u, -CEIL_Y, theme);
    }
  }

  /**
   * One cross-section of the room: the floor arc, the ceiling arc, and the two short walls
   * joining their ends. Sampled rather than drawn as a rectangle, because the surfaces are
   * curved — see BOW.
   */
  private rung(ctx: CanvasRenderingContext2D, z: number, alpha: number, theme: GridTheme): void {
    if (alpha <= 0.004) return;

    const arc = (y: number, reverse: boolean): readonly (readonly [number, number])[] | null => {
      const pts: (readonly [number, number])[] = [];
      for (let i = 0; i <= ARC_STEPS; i++) {
        const u = -1 + (2 * (reverse ? ARC_STEPS - i : i)) / ARC_STEPS;
        const p = this.project(u * HALF_W, y, this.bowed(u, z));
        // One point behind the camera makes the whole cross-section meaningless.
        if (!p) return null;
        pts.push(p);
      }
      return pts;
    };

    const floor = arc(FLOOR_Y, false);
    const ceil = arc(-CEIL_Y, true);
    if (!floor || !ceil) return;

    ctx.strokeStyle = mix(theme.far, theme.near, 1 - (z - NEAR) / (FAR - NEAR));
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [i, p] of [...floor, ...ceil].entries()) {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /**
   * One longitudinal line, drawn as a gradient from the vanishing point to the near plane.
   *
   * `u` is the lateral position, not a world x: the bow varies with depth, so a rail at a
   * fixed `u` is not a straight line in the world and has to be sampled like the rungs.
   */
  private rail(ctx: CanvasRenderingContext2D, u: number, y: number, theme: GridTheme): void {
    const near = this.project(u * HALF_W, y, this.bowed(u, NEAR));
    const far = this.project(u * HALF_W, y, this.bowed(u, FAR));
    if (!near || !far) return;

    /*
     * The rails are what turn a stack of rectangles into a corridor, so they have to be read
     * as continuous lines running away from the viewer. Drawn from the near colour throughout
     * rather than the far one — at the far end the room's own navy is almost the ground colour
     * and the line simply disappeared, leaving the rungs floating unconnected.
     */
    const grad = ctx.createLinearGradient(far[0], far[1], near[0], near[1]);
    grad.addColorStop(0, withAlpha(theme.near, 0));
    grad.addColorStop(0.22, withAlpha(theme.near, 0.3));
    grad.addColorStop(0.6, withAlpha(theme.near, 0.18));
    grad.addColorStop(1, withAlpha(theme.near, 0.05));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= ARC_STEPS; i++) {
      const z = FAR + ((NEAR - FAR) * i) / ARC_STEPS;
      const p = this.project(u * HALF_W, y, this.bowed(u, z));
      if (!p) continue;
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }
}

/** Parse `#rrggbb` once per call — the palette is two constants, so this is never hot. */
const parse = (hex: string): readonly [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const mix = (a: string, b: string, t: number): string => {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(r1 + (r2 - r1) * k)} ${Math.round(g1 + (g2 - g1) * k)} ${Math.round(b1 + (b2 - b1) * k)})`;
};

const withAlpha = (hex: string, a: number): string => {
  const [r, g, b] = parse(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** Size the backing store to the CSS box, capping DPR at 2 — past that nobody sees a hairline. */
export function sizeGridCanvas(
  canvas: HTMLCanvasElement,
): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return null;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
