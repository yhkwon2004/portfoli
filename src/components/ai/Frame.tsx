"use client";

import { useId } from "react";

/** Every diagram draws in the same 560 × 300 box, so the three read as one set. */
export const VW = 560;
export const VH = 300;

type Props = {
  ref?: React.Ref<SVGSVGElement>;
  /** Machine voice in the top-left corner. */
  code: string;
  /** `slice` fills any box; `meet` shows the whole diagram, for a box that must not crop it. */
  fit?: "slice" | "meet";
  children: (uid: string) => React.ReactNode;
};

/**
 * The instrument every AI diagram is drawn inside: the void, a 20-unit grid, four corner
 * marks and two readouts — the diagram's name and a clock the loop writes into (`.av-tc`).
 *
 * `slice` by default: the box is always filled edge to edge, whatever shape its container
 * is — a tall panel shows the middle of the diagram, a wide one all of it. Every diagram keeps
 * its action inside the middle 440 units for that reason. The dossier asks for `meet`: its
 * head is far wider than the diagram, and slicing it would cut off the top and bottom.
 *
 * Decorative to assistive technology. Everything a diagram shows is also said in words right
 * beside it — the steps list, the summary — so the SVG itself stays silent.
 */
export function Frame({ ref, code, fit = "slice", children }: Props) {
  // useId's output carries characters that are awkward inside `url(#…)`; the ids only need to
  // be unique on the page.
  const uid = `av${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      ref={ref}
      className="aiv"
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio={`xMidYMid ${fit}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" className="av-gridline" />
        </pattern>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" className="av-glow-0" />
          <stop offset="1" className="av-glow-1" />
        </radialGradient>
        <linearGradient id={`${uid}-chrome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#d7dde8" />
          <stop offset="1" stopColor="#5d6678" />
        </linearGradient>
      </defs>
      <rect className="av-bg" width={VW} height={VH} />
      <rect className="av-grid" width={VW} height={VH} fill={`url(#${uid}-grid)`} />
      {children(uid)}
      <g className="av-hud">
        <text className="av-code" x="64" y="22">
          {code}
        </text>
        <text className="av-tc" x="64" y="282" />
        <path className="av-corner" d="M52 14h-10v10M508 14h10v10M52 286h-10v-10M508 286h10v-10" />
      </g>
    </svg>
  );
}
