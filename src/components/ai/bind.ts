/**
 * How the AI diagrams are animated: each one is a pure function of a single number.
 *
 * `model(p)` takes the position in the loop, 0 → 1, and returns what every moving part of the
 * diagram looks like at that instant — keyed by name, the way a motion-graphics timeline keys
 * layers. The same function serves both halves of the job:
 *
 *   · the render calls it once at `REST`, so the static HTML — with no JavaScript, under
 *     reduced motion, or before the chapter is reached — is the finished diagram rather than
 *     a pile of parts at the origin;
 *   · the loop calls it every frame and writes the result straight onto the SVG nodes, so a
 *     nine-second diagram never re-renders React at all.
 *
 * Because both read one function there is nothing to keep in step: the frame the loop lands
 * on when it stops is, attribute for attribute, the frame the server rendered.
 */

export type Attrs = {
  /** SVG `transform`. */
  readonly t?: string;
  readonly o?: number;
  /** `stroke-dashoffset`, for paths drawn with pathLength="1". */
  readonly d?: number;
  /** Text content. */
  readonly txt?: string;
  /** Any other attribute — a line's endpoints, a bar's width, a polygon's points. */
  readonly a?: Readonly<Record<string, number | string>>;
};

export type Model = Readonly<Record<string, Attrs>>;

/** The loop position every diagram rests at: the idea, finished. */
export const REST = 1;

const r2 = (v: number): number => Math.round(v * 100) / 100;

/** A transform about a pivot: move to (x, y), then rotate and scale around that point. */
export const tf = (x: number, y: number, rot = 0, s = 1): string =>
  `translate(${r2(x)} ${r2(y)})${rot ? ` rotate(${r2(rot)})` : ""}${s !== 1 ? ` scale(${r2(Math.max(0, s))})` : ""}`;

/** The attributes a keyed part renders with — the model at REST, as JSX props. */
export function bind(m: Model, k: string): Record<string, string | number | undefined> {
  const at = m[k];
  const out: Record<string, string | number | undefined> = { "data-k": k };
  if (!at) return out;
  if (at.t !== undefined) out.transform = at.t;
  if (at.o !== undefined) out.opacity = r2(at.o);
  if (at.d !== undefined) out.strokeDashoffset = r2(at.d);
  if (at.a) for (const [name, v] of Object.entries(at.a)) out[name] = typeof v === "number" ? r2(v) : v;
  return out;
}

/** Text a keyed part renders with at REST. */
export const txt = (m: Model, k: string): string => m[k]?.txt ?? "";

/** Every keyed part under `root`, collected once per run of the loop. */
export function collect(root: Element): Map<string, Element> {
  const map = new Map<string, Element>();
  root.querySelectorAll("[data-k]").forEach((el) => {
    const k = el.getAttribute("data-k");
    if (k) map.set(k, el);
  });
  return map;
}

/** Write one frame of the model onto the nodes. Only what the model names is touched. */
export function apply(els: Map<string, Element>, m: Model): void {
  for (const k in m) {
    const el = els.get(k);
    const at = m[k];
    if (!el || !at) continue;
    if (at.t !== undefined) el.setAttribute("transform", at.t);
    if (at.o !== undefined) el.setAttribute("opacity", String(r2(at.o)));
    if (at.d !== undefined) el.setAttribute("stroke-dashoffset", String(r2(at.d)));
    if (at.txt !== undefined && el.textContent !== at.txt) el.textContent = at.txt;
    if (at.a)
      for (const name in at.a) {
        const v = at.a[name] ?? 0;
        el.setAttribute(name, typeof v === "number" ? String(r2(v)) : v);
      }
  }
}
