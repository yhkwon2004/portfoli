"use client";

import { Txt } from "@/components/Txt";
import { CHAPTERS } from "@/data/chapters";

type Props = {
  /** Position in CHAPTERS. Drives the slate number and name — never passed as a literal. */
  index: number;
  live: boolean;
  className: string;
  /** Keep a right gutter clear for the docked glass and the chapter rail. */
  gutter?: boolean;
  /** Start below the slate instead of centring on it — for scenes that fill the frame. */
  top?: boolean;
  children: React.ReactNode;
};

/**
 * One chapter's frame.
 *
 * Every scene is mounted at all times — that is what lets a cut be a cross-fade rather than a
 * mount, and it is why a crawler sees all twelve chapters of content in the static HTML. The
 * off-screen ones are `inert` and `aria-hidden`, so eleven hidden scenes' worth of buttons
 * stay out of the tab order and out of a screen reader's way.
 */
export function Scene({ index, live, className, gutter = false, top = false, children }: Props) {
  return (
    <section
      className={`scene ${className}`}
      data-live={live}
      data-gutter={gutter}
      data-top={top}
      aria-hidden={!live}
      {...(!live ? { inert: true } : {})}
    >
      <Slate index={index} />
      {children}
    </section>
  );
}

/** The film card that stamps in on every scene: number, chapter name, and a rule that draws. */
function Slate({ index }: { index: number }) {
  const chapter = CHAPTERS[index];
  return (
    <div className="slate">
      <b>{String(index + 1).padStart(2, "0")}</b>
      {chapter && <Txt v={chapter.name} as="span" />}
      <span className="rule" aria-hidden="true" />
    </div>
  );
}
