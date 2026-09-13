import { RAMP } from "@/data/charts";
import type { Item } from "@/lib/types";

/**
 * Award grades.
 *
 * The source data files the grade as just another tag. Promoting it to its own axis is
 * what turns the award wall from 35 unreadable thumbnails into a rank map you can read at
 * a glance — and it frees each tile of a title far too small to read anyway.
 *
 * `weight` orders them for "the three highest honours" on the profile scene; `color` is
 * the tile's border and badge colour.
 */
export type Rank = {
  readonly key: string;
  readonly en: string;
  readonly color: string;
  readonly weight: number;
};

/**
 * Grade → a step of the validated chrome ramp, by weight.
 *
 * The grades are *ordinal*: swapping 대상 and 입선 changes what the wall says. So they take one
 * hue in monotone lightness steps rather than separate hues, and the step comes from the same
 * ramp the charts use — `RAMP` in src/data/charts.ts, which carries the validation record.
 * That way a grade is the same colour on a wall tile, on a dossier badge and in the metrics
 * bar chart, and there is one ramp to check rather than three palettes to keep in step.
 *
 * Two grades sharing a step is correct where they genuinely share a tier (대상 and 국가장학 are
 * both weight 4); the label beside the swatch tells them apart.
 */
const step = (weight: number): string => RAMP[Math.max(0, Math.min(RAMP.length - 1, 4 - weight))] ?? RAMP[2];

export const RANKS = [
  { key: "대상", en: "Grand Prize", color: step(4), weight: 4 },
  { key: "국가장학", en: "National Scholarship", color: step(4), weight: 4 },
  { key: "최우수상", en: "Gold", color: step(3), weight: 3 },
  { key: "우수상", en: "Silver", color: step(2), weight: 2 },
  { key: "장려상", en: "Merit", color: step(1), weight: 1 },
  { key: "3위", en: "3rd Place", color: step(1), weight: 1 },
  { key: "입선", en: "Selected", color: step(0), weight: 0 },
] as const satisfies readonly Rank[];

/** The grade an item carries, or null if it has none (every project, and a few awards). */
export const rankOf = (item: Item): Rank | null =>
  RANKS.find((r) => item.tags.includes(r.key)) ?? null;

export const rankWeight = (item: Item): number => rankOf(item)?.weight ?? -1;

/**
 * The tags worth showing once the grade has its own badge. Without this the topic chips on
 * every award read "대상 · 창업 · ESG" — one third of them noise.
 */
export const topicTags = (item: Item): readonly string[] =>
  item.tags.filter((t) => !RANKS.some((r) => r.key === t));
