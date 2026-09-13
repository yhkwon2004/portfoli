"use client";

import { Txt } from "@/components/Txt";
import { CHAPTERS } from "@/data/chapters";

type Props = {
  /** Position in CHAPTERS. Drives the slate number, the name and the ghost — never a literal. */
  index: number;
  live: boolean;
  className: string;
  /** Keep gutters clear for the chapter rail (left) and the telemetry block (right). */
  gutter?: boolean;
  /** Start below the slate instead of centring on it — for scenes that fill the frame. */
  top?: boolean;
  /** Suppress the oversized ghost word. The bookends give that job to the hourglass. */
  noGhost?: boolean;
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
export function Scene({
  index,
  live,
  className,
  gutter = false,
  top = false,
  noGhost = false,
  children,
}: Props) {
  const chapter = CHAPTERS[index];

  return (
    <section
      className={`scene ${className}`}
      data-live={live}
      data-gutter={gutter}
      data-top={top}
      aria-hidden={!live}
      {...(!live ? { inert: true } : {})}
    >
      {/*
        The ghost: the chapter's English name at display scale, bled off both edges, behind
        everything. Always the English name — at 28vw a Korean word is three or four glyphs
        and reads as a logo rather than as a word running off the frame.

        Decorative: it restates the slate directly beneath it.
      */}
      {!noGhost && chapter && (
        <span className="ghost" aria-hidden="true">
          {chapter.name.en}
        </span>
      )}

      <div className="slate">
        <b>{String(index + 1).padStart(2, "0")}</b>
        {chapter && <Txt v={chapter.name} as="span" />}
        <span className="rule" aria-hidden="true" />
      </div>

      {children}
    </section>
  );
}
