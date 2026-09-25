/**
 * One scroll clock for the whole page.
 *
 * Every scrubbed effect — the hero morph, the pinned case studies, the sideways awards, the
 * paragraph that brightens as you read it — needs "where is this element relative to the
 * viewport, this frame". Giving each its own scroll listener means a dozen handlers reading
 * layout a dozen times per event, often several events per frame. Instead there is one
 * listener, it only schedules, and one rAF callback runs every subscriber in the same frame —
 * so all the reads happen together, then all the writes.
 *
 * Lenis animates the document's real scroll position, so its easing arrives here as ordinary
 * scroll events: nothing below needs to know smooth scrolling exists.
 */

type Sub = () => void;

const subs = new Set<Sub>();
let raf = 0;
let installed = false;

const run = () => {
  raf = 0;
  subs.forEach((fn) => fn());
};

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(run);
};

/** Call `fn` on every frame the page scrolls or resizes (and once now). Returns an unsubscribe. */
export function onScrollFrame(fn: Sub): () => void {
  if (!installed && typeof window !== "undefined") {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    installed = true;
  }
  subs.add(fn);
  schedule();
  return () => {
    subs.delete(fn);
  };
}

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Progress through a tall section whose content is pinned with `position: sticky`: 0 when its
 * top reaches the top of the viewport, 1 when its bottom reaches the bottom.
 */
export function pinProgress(el: Element): number {
  const r = el.getBoundingClientRect();
  const run = r.height - window.innerHeight;
  return run > 0 ? clamp01(-r.top / run) : r.top <= 0 ? 1 : 0;
}

/**
 * Progress of an element passing through the viewport: 0 as its top enters at the bottom,
 * 1 as its bottom leaves at the top.
 */
export function passProgress(el: Element): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp01((vh - r.top) / (r.height + vh));
}

/** Smooth-scroll to a target, through Lenis when it is running. */
export function scrollToTarget(target: string | HTMLElement | number): void {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -8, duration: 1.4 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ block: "start" });
}
