/**
 * The hourglass: an actual pour, not a CSS animation.
 *
 * Grains leave the neck, fall under gravity, bounce off the sloping bulb walls, and land on
 * a heightmap pile that slumps to its angle of repose. The pile's total volume is steered
 * toward the current chapter, so the sand level *is* the progress bar — and because the pile
 * is a real heightmap being slumped, the cone it forms is a consequence of the physics
 * rather than a drawn shape.
 *
 * All geometry is in the SVG's viewBox units (200 × 300); the canvas transform in
 * `resize()` maps that to device pixels, so none of these numbers change with screen size.
 */

/** Top of the upper bulb. */
const TOP_Y = 28;
/** The neck — where the two bulbs meet. */
const NECK = 150;
/** Floor of the lower bulb. */
const BOT_Y = 272;
const SPAN = NECK - TOP_Y;

/** Half-width of the upper bulb at height y: widest at the top, pinching to the neck. */
const halfWidthTop = (y: number): number => 68 - ((y - TOP_Y) / SPAN) * 56;
/** Half-width of the lower bulb at height y: narrow at the neck, widest at the floor. */
const halfWidthBottom = (y: number): number => 12 + ((y - NECK) / SPAN) * 56;

/** Heightmap resolution. 84 columns across the floor — one per record, as it happens. */
const COLS = 84;
const X0 = 32;
const X1 = 168;
const COL_W = (X1 - X0) / COLS;

/**
 * The steepest step the pile tolerates between neighbouring columns before material slides
 * downhill. This one constant is what makes the pile form a cone instead of a tower.
 *
 * 0.675 × the column width is a slope of ~34°, which is the real angle of repose for dry
 * sand. The inherited value was 1.5 — about 56°, steeper than dry sand can actually stand,
 * and steep enough to break the pour outright: see VOLUME_FACTOR below.
 */
const REPOSE = 0.675 * COL_W;

/**
 * How much of the lower bulb a full glass fills.
 *
 * This has to leave headroom for the cone. Grains are emitted just under the neck, and a
 * grain that spawns below the pile's surface is counted as landed on its very first step —
 * so if the cone's peak ever reaches the neck, the stream stops dead.
 *
 * That is exactly what used to happen. With the old 56° repose and a 0.84 factor the peak
 * passed the neck at around 60% full, and from there to the end of the reel the hourglass
 * was a still image: no grains in flight, no motion, on five of the twelve chapters. Nothing
 * reported it because nothing measured it — the bug only surfaced when the telemetry block
 * started printing FLOW and it read 000 for half the site.
 *
 * At 34° and 0.74, the fall distance stays positive all the way to a full glass (~8 units at
 * the very end), so the stream thins as the glass fills and never stops — which is also what
 * a real hourglass does.
 */
const VOLUME_FACTOR = 0.74;

/**
 * Physics, in units-per-second.
 *
 * The original inlined these as per-*frame* numbers while scaling gravity by dt — so the
 * sand fell at a speed that tracked the refresh rate, visibly twice as fast on a 120 Hz
 * display as on a 60 Hz one. Multiplying the per-frame figures by 60 gives the identical
 * look at 60 Hz and makes it frame-rate independent everywhere else.
 */
const FPS_REF = 60;
const GRAVITY = 9.4 * FPS_REF;
const EMIT_IDLE = 2 * FPS_REF;
const EMIT_BURST = 9 * FPS_REF;
/** Above this, extra grains are invisible behind the ones already falling. */
const MAX_DROPS = 260;
/** How much pile depth one landed grain adds. */
const GRAIN_VOLUME = 0.55;
/** The fixed simulation tick. Every constant above was tuned at 60 Hz, so the tick is 60 Hz. */
const TICK = 1 / FPS_REF;
/** At most this much time is caught up in one frame — three ticks, the rAF loop's own dt cap. */
const MAX_CATCHUP = 0.05;

/** A measured reading of the pour. See `HourglassSim.telemetry()`. */
export type Telemetry = {
  /** Grains in the air right now. */
  readonly flow: number;
  /** Eased fill level, 0–1. */
  readonly fill: number;
  /** Where the fill is heading, 0–1. */
  readonly target: number;
  /** Summed heightmap, normalised against the bulb, 0–1. */
  readonly volume: number;
  /** The angle the pile has actually settled at, in degrees. */
  readonly repose: number;
  /** How hard the neck is running after the last cut, 0–1. */
  readonly surge: number;
};

type Drop = {
  x: number;
  y: number;
  /** Position last frame — the grain is drawn as the line between the two, which is what reads as falling. */
  py: number;
  vx: number;
  vy: number;
  /** Stroke width; varying it is most of what makes the stream look granular. */
  s: number;
};

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

export class HourglassSim {
  private readonly heap = new Float32Array(COLS);
  private drops: Drop[] = [];
  /** 0 → all sand up top, 1 → all of it fallen. Eases toward `target`. */
  private level = 0;
  private target = 0;
  /** Decays after each cut; while it is high the neck runs hard. */
  private pourBoost = 0;
  /** Fractional carry so a per-second emission rate survives being sampled per frame. */
  private emitCarry = 0;
  /** Simulated time not yet stepped — less than one TICK after every `step()`. */
  private carry = 0;

  /** Point the pour at a new fill fraction and open the neck for a moment. */
  pourTo(fraction: number): void {
    this.target = Math.max(0, Math.min(1, fraction));
    this.pourBoost = 1;
  }

  /** Jump straight to a level with no animation — the reduced-motion path. */
  settleTo(fraction: number): void {
    this.target = this.level = Math.max(0, Math.min(1, fraction));
    this.pourBoost = 0;
    this.drops = [];
    const depth = this.level * SPAN * VOLUME_FACTOR;
    this.heap.fill(depth);
  }

  /**
   * Advance the pour by `dt` seconds, in fixed 1/60 s ticks.
   *
   * Gravity and emission were already per-second, but the slump is not a rate: it is three
   * passes per call, whatever the call's length. So at a low frame rate each call landed more
   * grains between slumps, the cone came out steeper than its angle of repose, and past about
   * 80% full its peak reached the neck — where a grain spawns inside the pile and lands on its
   * first step, and the stream stops dead. The regression test caught exactly that when heavier
   * frames lowered the headless browser's frame rate — the same stall the 56° repose once
   * caused, by a different road — and under a 6× CPU throttle the untouched original stalls
   * on three chapters too.
   *
   * Stepping in fixed ticks makes the pile the same at 25 Hz, 60 Hz and 144 Hz. The leftover
   * fraction carries to the next frame; the carry is capped so a stalled tab cannot come back
   * and try to simulate the time it was away.
   */
  step(dt: number): void {
    this.carry = Math.min(this.carry + dt, MAX_CATCHUP);
    while (this.carry >= TICK) {
      this.carry -= TICK;
      this.emit(TICK);
      this.fall(TICK);
      this.slump();
      this.steerVolume(TICK);
    }
  }

  /** Always a trickle, so the glass is never a still image; hard right after a cut. */
  private emit(dt: number): void {
    this.emitCarry += (EMIT_IDLE + this.pourBoost * EMIT_BURST) * dt;
    const want = Math.floor(this.emitCarry);
    this.emitCarry -= want;

    for (let i = 0; i < want; i++) {
      if (this.drops.length > MAX_DROPS || this.level >= 0.999) break;
      this.drops.push({
        x: 100 + rnd(-1.8, 1.8),
        y: NECK + 1,
        py: NECK + 1,
        vx: rnd(-0.06, 0.06) * FPS_REF,
        vy: rnd(0.9, 1.5) * FPS_REF,
        s: rnd(0.55, 1.15),
      });
    }
    this.pourBoost = Math.max(0, this.pourBoost - dt * 1.1);
  }

  /** Fall, bounce off the sloping walls, then land on the pile. */
  private fall(dt: number): void {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const g = this.drops[i];
      if (!g) continue;
      g.py = g.y;
      g.vy += GRAVITY * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;

      const wall = halfWidthBottom(Math.min(g.y, BOT_Y)) - 1;
      if (g.x < 100 - wall) {
        g.x = 100 - wall;
        g.vx = Math.abs(g.vx) * 0.4;
      } else if (g.x > 100 + wall) {
        g.x = 100 + wall;
        g.vx = -Math.abs(g.vx) * 0.4;
      }

      const col = Math.min(COLS - 1, Math.max(0, Math.floor((g.x - X0) / COL_W)));
      if (g.y >= BOT_Y - (this.heap[col] ?? 0)) {
        this.heap[col] = (this.heap[col] ?? 0) + GRAIN_VOLUME;
        this.drops.splice(i, 1);
      }
    }
  }

  /** Shove material downhill until no step between columns exceeds the angle of repose. */
  private slump(): void {
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < COLS - 1; i++) {
        const a = this.heap[i] ?? 0;
        const b = this.heap[i + 1] ?? 0;
        const d = a - b;
        if (d > REPOSE) {
          const m = (d - REPOSE) * 0.4;
          this.heap[i] = a - m;
          this.heap[i + 1] = b + m;
        } else if (-d > REPOSE) {
          const m = (-d - REPOSE) * 0.4;
          this.heap[i + 1] = b - m;
          this.heap[i] = a + m;
        }
      }
    }
  }

  /**
   * Steer the pile's total volume toward the chapter. Without this the pile would only ever
   * grow, and the level would stop meaning progress the moment you stepped backwards.
   */
  private steerVolume(dt: number): void {
    this.level += (this.target - this.level) * Math.min(1, dt * 1.7);
    let volume = 0;
    for (let i = 0; i < COLS; i++) volume += this.heap[i] ?? 0;
    const wanted = this.level * SPAN * COLS * VOLUME_FACTOR;
    if (volume > 0.01) {
      const k = 1 + (wanted / volume - 1) * Math.min(1, dt * 2.6);
      for (let i = 0; i < COLS; i++) this.heap[i] = (this.heap[i] ?? 0) * k;
    }
  }

  /**
   * A reading of the simulation's real state, for the HUD.
   *
   * Every field is measured, not staged: `flow` counts the grains actually in the air this
   * frame, `fill` is the eased level the pile is being steered toward, `volume` is the summed
   * heightmap, and `repose` is the steepest column-to-column step the slump left behind — the
   * angle of repose the pile has actually settled at, which drifts as it grows.
   *
   * This is what makes the telemetry block honest. The reference's `MainLogo Quaternion`
   * readout narrates a real 3D object; if these numbers were decorative the device would be a
   * lie, and a portfolio that lies in its chrome is worse than one with no chrome.
   */
  telemetry(): Telemetry {
    let volume = 0;
    let steepest = 0;
    for (let i = 0; i < COLS; i++) {
      volume += this.heap[i] ?? 0;
      if (i < COLS - 1) {
        const step = Math.abs((this.heap[i] ?? 0) - (this.heap[i + 1] ?? 0));
        if (step > steepest) steepest = step;
      }
    }
    return {
      flow: this.drops.length,
      fill: this.level,
      target: this.target,
      // Normalised against the full bulb so the figure reads 0–1 like the others.
      volume: volume / (SPAN * COLS),
      // As an angle: the slump caps the step at REPOSE per column of width COL_W.
      repose: (Math.atan2(steepest, COL_W) * 180) / Math.PI,
      surge: this.pourBoost,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, 200, 300);
    const topY = TOP_Y + SPAN * this.level;

    if (this.level < 0.995) this.drawUpperMass(ctx, topY);
    this.drawPile(ctx);
    this.drawNeckAndGrains(ctx);
  }

  /**
   * The mass still up top: bulb walls down to the neck, with a funnel dip carved into its
   * surface that deepens as the level drops — the same hollow real sand leaves behind.
   */
  private drawUpperMass(ctx: CanvasRenderingContext2D, topY: number): void {
    const hw = halfWidthTop(topY);
    const dip = 4 + 13 * this.level;
    ctx.beginPath();
    ctx.moveTo(100 - hw, topY);
    ctx.quadraticCurveTo(100, topY + dip * 2, 100 + hw, topY);
    ctx.lineTo(112, NECK);
    ctx.lineTo(88, NECK);
    ctx.closePath();
    // Chrome, not sand: a bright specular band near the surface falling to a cold shadow at
    // the neck. Three stops rather than two — the mid stop is what reads as a curved metal
    // face instead of a flat ramp.
    const grad = ctx.createLinearGradient(0, topY, 0, NECK);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.42, "#c3ccdc");
    grad.addColorStop(1, "#4a5468");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.62)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    speckle(ctx, 100 - hw, topY + 2, hw * 2, NECK - topY, 34);
  }

  private drawPile(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(X0, BOT_Y);
    for (let i = 0; i < COLS; i++) ctx.lineTo(X0 + i * COL_W + COL_W / 2, BOT_Y - (this.heap[i] ?? 0));
    ctx.lineTo(X1, BOT_Y);
    ctx.closePath();

    // Clip to the bulb: a pile steeper than the glass would otherwise spill through the wall.
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(88, NECK);
    ctx.lineTo(112, NECK);
    ctx.lineTo(X1, BOT_Y);
    ctx.lineTo(X0, BOT_Y);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, BOT_Y - SPAN, 0, BOT_Y);
    grad.addColorStop(0, "#eef2f9");
    grad.addColorStop(0.55, "#98a2b6");
    grad.addColorStop(1, "#3b4356");
    ctx.fillStyle = grad;
    ctx.fill();
    speckle(ctx, X0, BOT_Y - SPAN, X1 - X0, SPAN, 30);
    ctx.restore();
  }

  /** Neck bloom and the falling grains, composited additively so overlaps flare. */
  private drawNeckAndGrains(ctx: CanvasRenderingContext2D): void {
    ctx.globalCompositeOperation = "lighter";
    if (this.level < 0.995) {
      // The neck is the one place the accent blue touches the glass — it reads as the light
      // the wireframe room is casting through the pour. It swells with the surge: the glow is
      // brightest and widest while the neck is running hard after a cut, and contracts back as
      // the flow thins — a secondary motion driven by the same number SRG reads out.
      const r = 26 * (1 + this.pourBoost * 0.65);
      const glow = ctx.createRadialGradient(100, NECK, 0, 100, NECK, r);
      glow.addColorStop(0, `rgba(150,180,255,${(0.55 + this.pourBoost * 0.3).toFixed(3)})`);
      glow.addColorStop(0.45, `rgba(67,97,255,${(0.22 + this.pourBoost * 0.14).toFixed(3)})`);
      glow.addColorStop(1, "rgba(67,97,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(100, NECK, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(240,246,255,.92)";
    ctx.lineCap = "round";
    for (const g of this.drops) {
      ctx.lineWidth = g.s;
      ctx.beginPath();
      ctx.moveTo(g.x, g.py);
      ctx.lineTo(g.x, g.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }
}

/**
 * A scatter of bright pinpricks over a mass — what makes it read as grains rather than
 * paint. Re-randomised every frame on purpose: the shimmer is the grain.
 */
function speckle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  n: number,
): void {
  ctx.fillStyle = "rgba(255,255,255,.42)";
  for (let i = 0; i < n; i++) ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 0.7, 0.7);
}

/** Size the backing store for the current CSS box, mapping the 200×300 viewBox onto it. */
export function sizeHourglassCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // 1.5× headroom so the glass stays sharp at the hero scale(1.2) on the bookend scenes.
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2) * 1.5;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(canvas.width / 200, 0, 0, canvas.height / 300, 0, 0);
  return ctx;
}
