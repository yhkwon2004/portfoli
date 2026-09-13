/**
 * The ambient sand falling behind everything.
 *
 * Each grain has a depth `z`, and that one number sets its size, its brightness *and* its
 * fall speed together — so coarse grains in front visibly outrun the fine ones behind. That
 * is the same rule the 원칙 chapter argues for, stated by the background rather than in words.
 *
 * Grains are drawn as the line from their previous position to their current one. That motion
 * blur is what makes them read as falling; as dots they read as a starfield.
 *
 * Speeds are px/second, not px/frame, so the fall is the same on any refresh rate.
 */

type Grain = {
  x: number;
  y: number;
  py: number;
  /** Depth, 0 (far, fine, slow) → 1 (near, coarse, fast). */
  z: number;
  vx: number;
  vy: number;
  /** Stroke width. */
  r: number;
  /** Alpha. */
  a: number;
};

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

/** The fall a grain settles back to once a cut has finished flinging it about. */
const terminal = (z: number): number => 26 + z * 165;

export class AmbientSand {
  private grains: Grain[] = [];
  private w = 0;
  private h = 0;

  resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.seed();
  }

  private seed(): void {
    // Density by area, capped: past ~700 the extra grains only cost frame time.
    const n = Math.round(Math.min(700, (this.w * this.h) / 2500));
    this.grains = Array.from({ length: n }, () => this.newGrain(rnd(0, this.h)));
  }

  private newGrain(y: number): Grain {
    // `** 1.7` biases the distribution toward fine grains in the distance, so the few
    // coarse ones in front actually read as foreground.
    const z = Math.random() ** 1.7;
    return {
      x: rnd(0, this.w),
      y,
      py: y,
      z,
      vy: terminal(z),
      vx: rnd(-7, 7) * (0.25 + z),
      r: 0.5 + z * 2.2,
      a: 0.09 + z * 0.55,
    };
  }

  /** Fired on every chapter cut: the field scatters, then each grain falls back to its own speed. */
  burst(): void {
    const cx = this.w / 2;
    const cy = this.h / 2;
    for (const g of this.grains) {
      if (Math.random() > 0.55) continue;
      const angle = rnd(0, Math.PI * 2);
      const speed = rnd(170, 680) * (0.5 + g.z);
      g.x = cx + rnd(-20, 20);
      g.y = cy + rnd(-28, 28);
      g.py = g.y;
      g.vx = Math.cos(angle) * speed;
      g.vy = Math.sin(angle) * speed * 0.75;
      g.a = rnd(0.4, 0.95);
    }
  }

  step(dt: number): void {
    for (const g of this.grains) {
      g.py = g.y;
      g.x += g.vx * dt;
      g.y += g.vy * dt;

      // Ease back toward this grain's own terminal fall after a burst.
      const k = Math.min(1, dt * 1.5);
      g.vx += (0 - g.vx) * k;
      g.vy += (terminal(g.z) - g.vy) * k;

      if (g.y > this.h + 8) Object.assign(g, this.newGrain(-8));
      if (g.x < -8) g.x = this.w + 8;
      else if (g.x > this.w + 8) g.x = -8;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineCap = "round";
    for (const g of this.grains) {
      ctx.globalAlpha = g.a;
      // Near grains catch the specular highlight; far ones fall back into the cold steel of
      // the room behind them.
      ctx.strokeStyle = g.z > 0.62 ? "#f2f6ff" : "#7d89a3";
      ctx.lineWidth = g.r;
      ctx.beginPath();
      ctx.moveTo(g.x, g.py);
      ctx.lineTo(g.x, g.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

/** Size the backing store to the CSS box, capping DPR at 2 — past that nobody sees a grain. */
export function sizeAmbientCanvas(
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
