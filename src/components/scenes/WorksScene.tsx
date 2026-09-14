"use client";

import { useCallback, useRef } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { Scene } from "@/components/scenes/Scene";
import { useReel } from "@/hooks/useReel";
import { topicTags } from "@/data/ranks";
import { cover, gallery } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import type { Item } from "@/lib/types";

type Props = {
  index: number;
  live: boolean;
  items: readonly Item[];
  /** False under reduced motion: no reel, no parallax, the plates lie flat. */
  animate: boolean;
  onOpen: (id: string) => void;
};

/**
 * Where each plate hangs in the room.
 *
 * `x`/`y` are percentages of the room, off its centre; `z` is real depth in pixels, which the
 * room's `perspective` turns into both scale and parallax; `w` is the plate's width, again as
 * a percentage of the room. The four are deliberately uneven — a work is one object seen from
 * an angle, not a grid — and the near plate is the cover, so the thing that identifies the
 * work is the thing closest to the reader.
 *
 * The outermost plates stop around ±33%, short of the chapter rail and the telemetry block.
 * A plate that reached the frame edge would look better and sit under the navigation.
 */
const SLOTS = [
  { x: 2, y: 0, z: 0, w: 43, r: -7, t: 1.2 },
  { x: -32, y: 10, z: -300, w: 37, r: 12, t: -2.2 },
  { x: 33, y: -18, z: -520, w: 34, r: -14, t: 2.6 },
  { x: 28, y: 22, z: -190, w: 29, r: 6, t: -1.4 },
] as const;

/** The near plate is ~43% of a ~1230px room; the 560px tier covers it at 2× DPR. */
const PLATE_SIZES = "(max-width: 860px) 60vw, 34vw";

/**
 * 08 — Works, as plates hanging in the wireframe room.
 *
 * The previous version of this chapter was a 7×5 grid of 90px tiles beside a reading panel:
 * a good index, and a bad way to look at a project. Thirty-five works rendered at the size of
 * a postage stamp all look like the same work.
 *
 * So the chapter shows one at a time and gives it the room. Each work's own images become
 * plates at four depths, the pointer moves the whole cluster against that depth, and the
 * record reads at the bottom left the way the reference sets its own work captions. The wall
 * is not gone — it is the scale along the bottom, which is still all thirty-five and is still
 * the fastest way to reach a specific one.
 */
export function WorksScene({ index, live, items, animate, onOpen }: Props) {
  const lang = useLang();
  const reel = useReel(items.length, live, animate);
  const item = items[reel.index];
  const roomRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);

  /*
   * Parallax is written straight onto the node rather than held in state. A pointer crossing
   * the room fires this sixty times a second, and sixty renders a second of a scene holding
   * four images is a frame budget spent on nothing — the only thing that changes is two
   * numbers the transform reads.
   */
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = roomRef.current;
      if (!animate || !el) return;
      const box = el.getBoundingClientRect();
      el.style.setProperty("--px", ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
      el.style.setProperty("--py", ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
    },
    [animate],
  );

  const onLeave = useCallback(() => {
    const el = roomRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
  }, []);

  /** Arrow keys along the scale, stopped before the projector can read them as a chapter. */
  const onScaleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const from = Number((e.target as HTMLElement).dataset.n);
      if (Number.isNaN(from)) return;
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      const to =
        step !== 0 ? from + step : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
      if (to < 0 || to >= items.length) return;
      e.preventDefault();
      e.stopPropagation();
      const tick = scaleRef.current?.children[to];
      if (tick instanceof HTMLElement) tick.focus();
    },
    [items.length],
  );

  const plates = item ? [cover(item), ...gallery(item)].filter((i) => i !== null).slice(0, 4) : [];

  return (
    <Scene index={index} live={live} className="s-projects" gutter top>
      <div className="wall-head rise" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="count">{items.length}</span>
        <div>
          <Txt v={UI.projectsEyebrow} as="p" className="eyebrow" />
        </div>
      </div>

      <div
        className="worksroom"
        ref={roomRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={() => reel.pick(reel.index)}
      >
        {/* Re-keyed per turn so the plates fly in again on every change of work. */}
        <div className="plates" key={reel.turn}>
          {plates.map((img, n) => {
            const slot = SLOTS[n] ?? SLOTS[0];
            const style = {
              "--x": slot.x,
              "--y": slot.y,
              "--z": slot.z,
              "--w": slot.w,
              "--r": slot.r,
              "--t": slot.t,
              "--i": n,
            } as React.CSSProperties;

            // Only the near plate takes focus: four tab stops onto the same record is three
            // too many, and the other three are the same record seen from further away.
            return n === 0 && item ? (
              <button
                key={img.u}
                type="button"
                className="plate plate-near"
                style={style}
                onClick={() => onOpen(item.id)}
                aria-label={`${item.year} ${text(item.t, lang)} — ${text(UI.picksHint, lang)}`}
              >
                <Img master={img.u} alt="" sizes={PLATE_SIZES} priority />
                <i className="pedge" aria-hidden="true" />
              </button>
            ) : (
              <span key={img.u} className="plate" style={style} aria-hidden="true">
                <Img master={img.u} alt="" sizes={PLATE_SIZES} />
                <i className="pedge" aria-hidden="true" />
              </span>
            );
          })}
        </div>

        {item && (
          <figcaption className="wmeta" key={`m${reel.turn}`}>
            <span className="wm-top">
              <b className="wm-year">{item.year}</b>
              {item.featured && <span className="wm-flag">{text(UI.featured, lang)}</span>}
            </span>
            <Txt v={item.t} as="h3" className="wm-title" />
            <Txt v={item.s} as="p" className="wm-sum" />
            <span className="wm-tags">
              {topicTags(item)
                .slice(0, 5)
                .map((t) => (
                  <span key={t}>{t}</span>
                ))}
            </span>
          </figcaption>
        )}
      </div>

      <div className="worksbar">
        <button
          type="button"
          className="wstep"
          onClick={() => reel.pick(reel.index - 1)}
          aria-label={text(UI.prevWork, lang)}
        >
          ←
        </button>
        <b className="wm-pos">
          {String(reel.index + 1).padStart(2, "0")} / {items.length}
        </b>
        <button
          type="button"
          className="wstep"
          onClick={() => reel.pick(reel.index + 1)}
          aria-label={text(UI.nextWork, lang)}
        >
          →
        </button>

        {/*
          The whole set, as a scale. This is the wall's job — reach any of the thirty-five
          directly — at the size the job actually needs, and it doubles as the progress
          readout the reference puts down its left edge.
        */}
        <div
          className="wscale"
          ref={scaleRef}
          role="group"
          aria-label={text(UI.worksIndex, lang)}
          onKeyDown={onScaleKey}
          onPointerLeave={reel.release}
        >
          {items.map((w, n) => (
            <button
              key={w.id}
              type="button"
              data-n={n}
              className={`wtick${w.featured ? " star" : ""}`}
              aria-current={n === reel.index}
              aria-label={`${w.year} ${text(w.t, lang)}`}
              onPointerEnter={() => reel.pick(n)}
              onFocus={() => reel.pick(n)}
              onClick={() => onOpen(w.id)}
            />
          ))}
        </div>

        <Txt v={UI.worksHint} as="span" className="wm-hint" />
      </div>
    </Scene>
  );
}
