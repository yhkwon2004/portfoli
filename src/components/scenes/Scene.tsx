"use client";

import { CountUp } from "@/components/motion/CountUp";
import { Decode } from "@/components/motion/Decode";
import { SceneLiveProvider, useCut } from "@/components/motion/context";
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
 * mount, and it is why a crawler sees every chapter's content in the static HTML. The
 * off-screen ones are `inert` and `aria-hidden`, so the hidden scenes' buttons stay out of
 * the tab order and out of a screen reader's way.
 *
 * A scene is in one of three states, and the stylesheet choreographs each:
 *
 *   live — on screen; its entrances play
 *   out  — the chapter just cut away from, for the ~half-second its exit takes
 *   idle — everything else
 *
 * `data-live` is kept as it was: the tests, `inert` and `aria-hidden` all mean "on screen",
 * which a leaving chapter is not.
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
  const { prev } = useCut();
  const state = live ? "live" : prev === index ? "out" : "idle";

  return (
    <section
      className={`scene ${className}`}
      data-live={live}
      data-state={state}
      data-shown={state !== "idle"}
      data-gutter={gutter}
      data-top={top}
      aria-hidden={!live}
      {...(!live ? { inert: true } : {})}
    >
      <SceneLiveProvider value={live}>
        {/*
          The ghost: the chapter's English name at display scale, bled off both edges, behind
          everything. Always the English name — at 28vw a Korean word is three or four glyphs
          and reads as a logo rather than as a word running off the frame.

          Decorative: it restates the slate directly beneath it. Which is also what frees it to
          be split into letters — nothing reads it, so it can be as kinetic as it likes. Each
          letter carries its index from both ends, so the stylesheet can sweep the word in
          from whichever side the reel is travelling from.
        */}
        {!noGhost && chapter && (
          <>
            <span className="ghost" aria-hidden="true">
              <span className="gi">
                {Array.from(chapter.name.en).map((ch, n, all) => (
                  <span
                    key={n}
                    className="gl"
                    style={{ "--li": n, "--lr": all.length - 1 - n } as React.CSSProperties}
                  >
                    {/* A space would collapse at the end of an inline-block; hold it open. */}
                    {ch === " " ? "\u00a0" : ch}
                  </span>
                ))}
              </span>
            </span>
            {/*
              The veil. A sampled pixel inside a ghost stroke reads rgb(47,58,79), and body
              copy crossing one drops from 6.93:1 to 3.89:1 — under AA, and invisible to a
              contrast audit because the ghost is a sibling of the text rather than its
              background. This sits between the two: the word stays at full strength out at
              the edges of the frame, and fades back where the sentences are.
            */}
            <span className="veil" aria-hidden="true" />
          </>
        )}

        <div className="slate">
          {/*
            The frame counter rolls from the chapter the reel just left — a jump from 02 to 09
            reads as the counter running through 03…08, the way a real one would.
          */}
          <b>
            <CountUp value={index + 1} from={prev >= 0 ? prev + 1 : index + 1} pad={2} delay={180} duration={520} />
          </b>
          {chapter && <Decode v={chapter.name} as="span" delay={320} />}
          <span className="rule" aria-hidden="true" />
        </div>

        {children}
      </SceneLiveProvider>
    </section>
  );
}
