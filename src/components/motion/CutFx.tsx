"use client";

import { CHAPTERS } from "@/data/chapters";

/**
 * Interference lines, as fractions of the frame height. Uneven on purpose — evenly spaced
 * lines read as a grid, uneven ones as a signal.
 */
const SLATS = [14, 27, 41, 58, 69, 83] as const;

type Props = {
  /** The chapter being cut to. Its number rides on the scan line. */
  chapter: number;
  /** False until the first real cut, so the opening frame does not play a transition. */
  run: boolean;
};

/**
 * The cut, as a transition layer over the frame.
 *
 * The original was a single gradient band crossing the screen. This is the same gesture
 * broken into the layers a motion designer would stack for it: a soft band of light, a hard
 * scan line running just ahead of it with the incoming chapter's number riding on its end,
 * and a burst of interference lines that flash across the frame in the direction of travel.
 * All of it runs top to bottom going forward and bottom to top coming back — the same
 * `--dir` the chapters use, so the light and the content always travel together.
 *
 * Re-keyed per cut by the caller; CSS alone would play it once. Decorative throughout.
 */
export function CutFx({ chapter, run }: Props) {
  return (
    <div className="cutfx" data-run={run} aria-hidden="true">
      <i className="cut-band" />
      <i className="cut-scan">
        <b>
          {String(chapter + 1).padStart(2, "0")} · {CHAPTERS[chapter]?.name.en ?? ""}
        </b>
      </i>
      <span className="cut-slats">
        {SLATS.map((y, k) => (
          <i key={y} style={{ "--y": `${y}%`, "--k": k } as React.CSSProperties} />
        ))}
      </span>
    </div>
  );
}
