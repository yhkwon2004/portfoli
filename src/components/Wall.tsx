"use client";

import { useCallback, useRef } from "react";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { rankOf } from "@/data/ranks";
import { cover, year } from "@/lib/select";
import { text } from "@/lib/i18n";
import { useLang } from "@/components/LangProvider";
import { UI } from "@/data/ui";
import type { Item } from "@/lib/types";

type Props = {
  items: readonly Item[];
  kind: "awards" | "projects";
  /** Which tile the focus panel is showing, so it can be lit and the rest stepped back. */
  active: number;
  onPick: (n: number) => void;
  onRelease: () => void;
  onOpen: (id: string) => void;
};

/** The tile is ~90px wide at 7 columns, so the 560px tier is always the right file. */
const TILE_SIZES = "(max-width: 760px) 25vw, (max-width: 1180px) 20vw, 13vw";

/**
 * A wall of 35 tiles. The wall is the map; the focus panel beside it does the reading.
 *
 * Keyboard navigation is new here. The original left 35 buttons in a 7-column grid reachable
 * only by pressing Tab 35 times, with no way to move up or down a row — and the arrow keys
 * were swallowed by the chapter machine, so a keyboard user could not explore a wall at all.
 * This grid maps the arrows onto the visual layout and stops them before they reach the
 * projector, reading the real column count off the rendered geometry rather than assuming 7
 * (it is 5 or 4 at narrower widths).
 */
export function Wall({ items, kind, active, onPick, onRelease, onOpen }: Props) {
  const lang = useLang();
  const gridRef = useRef<HTMLDivElement>(null);

  /**
   * Columns, measured rather than assumed: the same component renders at 7, 5 and 4 columns,
   * and a hard-coded 7 would make Down jump three rows on a phone.
   */
  const columns = useCallback((): number => {
    const grid = gridRef.current;
    if (!grid) return 1;
    const cols = window.getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    return Math.max(1, cols);
  }, []);

  const focusTile = useCallback((n: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const clamped = Math.max(0, Math.min(items.length - 1, n));
    const tile = grid.children[clamped];
    if (tile instanceof HTMLElement) tile.focus();
  }, [items.length]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const from = Number(target.dataset.n);
      if (Number.isNaN(from)) return;

      const cols = columns();
      const moves: Record<string, number> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowDown: cols,
        ArrowUp: -cols,
      };

      if (e.key in moves) {
        const to = from + (moves[e.key] ?? 0);
        // Only claim the key if the move lands on a tile; at the wall's edge let the
        // projector have it, so Right on the last tile still advances the chapter.
        if (to >= 0 && to < items.length) {
          e.preventDefault();
          e.stopPropagation();
          focusTile(to);
        }
        return;
      }
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        e.stopPropagation();
        focusTile(e.key === "Home" ? 0 : items.length - 1);
      }
    },
    [columns, focusTile, items.length],
  );

  return (
    <div
      ref={gridRef}
      className={`wall wall-${kind}`}
      data-picking="true"
      role="group"
      aria-label={text(kind === "awards" ? UI.awardsEyebrow : UI.projectsEyebrow, lang)}
      onKeyDown={onKeyDown}
      onPointerOver={(e) => {
        const n = Number((e.target as HTMLElement).closest<HTMLElement>(".cell")?.dataset.n);
        if (!Number.isNaN(n)) onPick(n);
      }}
      onFocus={(e) => {
        const n = Number((e.target as HTMLElement).closest<HTMLElement>(".cell")?.dataset.n);
        if (!Number.isNaN(n)) onPick(n);
      }}
      onPointerLeave={onRelease}
    >
      {items.map((item, n) => {
        const img = cover(item);
        const rank = rankOf(item);
        const star = kind === "projects" && item.featured;
        return (
          <button
            key={item.id}
            type="button"
            data-n={n}
            className={`cell${star ? " star" : ""}${img ? "" : " noimg"}${n === active ? " on" : ""}`}
            style={{ "--i": n, ...(rank ? { "--rk": rank.color } : {}) } as React.CSSProperties}
            onClick={() => onOpen(item.id)}
            aria-label={`${year(item) || ""} ${text(item.t, lang)}`}
          >
            {img && <Img master={img.u} alt="" sizes={TILE_SIZES} className="" />}
            <span className="meta">
              <span className="y">{kind === "awards" ? year(item) : item.year}</span>
              {/*
                On the award wall the grade replaces the title: at 90px the title is
                unreadable anyway, and the grade turns the wall into a rank map you can
                scan. The full title is still on the button's accessible name.
              */}
              {kind === "awards" && rank ? (
                <span className="rank">{rank.key}</span>
              ) : (
                <Txt v={item.t} as="span" className="t" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
