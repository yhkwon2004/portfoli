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

export const RANKS = [
  { key: "대상", en: "Grand Prize", color: "#ffd489", weight: 4 },
  { key: "국가장학", en: "National Scholarship", color: "#ffd489", weight: 4 },
  { key: "최우수상", en: "Gold", color: "#f0b959", weight: 3 },
  { key: "우수상", en: "Silver", color: "#c9a06a", weight: 2 },
  { key: "장려상", en: "Merit", color: "#9d8464", weight: 1 },
  { key: "3위", en: "3rd Place", color: "#9d8464", weight: 1 },
  { key: "입선", en: "Selected", color: "#7d7058", weight: 0 },
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
