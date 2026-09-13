import { PORTFOLIO } from "@/data/portfolio";
import { DOMAINS } from "@/data/domains";
import { RANKS, rankOf, rankWeight } from "@/data/ranks";
import type { Bi, Img, Item, ItemType } from "@/lib/types";

/**
 * Every collection and figure the site displays, derived once from the 84 records.
 *
 * Nothing downstream counts anything itself, and nothing hard-codes a total. "35 awards"
 * on the profile scene is `awards.length`; the grade legend is a group-by; the capability
 * chips carry a count of the works that actually carry that tag. Delete a record from
 * src/data/portfolio.ts and every number on the site follows.
 *
 * This module is import-time pure and evaluated once, so the scenes can read it directly
 * without memoising.
 */

const byType = (type: ItemType): readonly Item[] => PORTFOLIO.items.filter((i) => i.type === type);

const newestFirst = (a: Item, b: Item): number => (b.year || "").localeCompare(a.year || "");

/** Featured works sort ahead of the rest, then newest first — inside each group. */
const featuredThenNewest = (a: Item, b: Item): number =>
  a.featured === b.featured ? newestFirst(a, b) : a.featured ? -1 : 1;

export const profile: Item = PORTFOLIO.items.find((i) => i.type === "profile") ?? missing("profile");
export const education = byType("education");
export const experience = byType("experience");
export const certifications = byType("certification");

/** The award wall, newest first. 35 tiles — exactly 7 × 5, so no row is left ragged. */
export const awards: readonly Item[] = [...byType("award")].sort(newestFirst);

/** The project wall. Featured first so the reel opens on the strongest work. */
export const projects: readonly Item[] = [...byType("project")].sort(featuredThenNewest);

/** Both walls are stepped through as a set inside the dossier. */
export const SETS = { award: awards, project: projects } as const;

function missing(what: string): never {
  throw new Error(`portfolio data is missing a ${what} record`);
}

/** The image every surface leads with. */
export const cover = (item: Item): Img | null =>
  item.imgs.find((m) => m.r === "cover") ?? item.imgs[0] ?? null;

/** Everything except the cover — the dossier gallery. */
export const gallery = (item: Item): readonly Img[] => {
  const lead = cover(item);
  return item.imgs.filter((m) => m !== lead);
};

/** `"2025-06-04"` → `"2025"`. Award dates carry a day; the wall only has room for the year. */
export const year = (item: Item): string => (item.year || "").slice(0, 4);

export const itemById = (id: string): Item | undefined => PORTFOLIO.items.find((i) => i.id === id);

// ─────────────────────────────  capability map  ─────────────────────────────

/**
 * Only real work counts as evidence. Schooling and certificates are listed elsewhere on
 * their own terms; letting them back a *skill* claim would be double-counting a line on a
 * CV as proof of the thing the line claims.
 */
const EVIDENCE: readonly Item[] = PORTFOLIO.items.filter(
  (i) => i.type === "project" || i.type === "experience",
);

export const worksWithTag = (tag: string): readonly Item[] =>
  EVIDENCE.filter((i) => i.tags.includes(tag));

export const tagCount = (tag: string): number => worksWithTag(tag).length;

/** The single work that best demonstrates a tag: featured first, then most recent. */
export const strongestFor = (tag: string): Item | undefined =>
  [...worksWithTag(tag)].sort(featuredThenNewest)[0];

export type TagView = {
  readonly tag: string;
  readonly count: number;
  /** The work the chip opens — never undefined, because count > 0 guarantees one exists. */
  readonly strongest: Item;
};

export type DomainView = {
  readonly name: Bi;
  /** Tags that at least one work actually carries, heaviest first. */
  readonly tags: readonly TagView[];
  /** How many distinct works back this domain at all. */
  readonly proof: number;
};

export const domains: readonly DomainView[] = DOMAINS.map((d) => {
  // flatMap rather than map+filter: a tag nothing proves drops out here, and the empty
  // branch is what narrows `strongest` from `Item | undefined` to `Item` without a cast.
  const tags = d.tags
    .flatMap<TagView>((tag) => {
      const count = tagCount(tag);
      const strongest = strongestFor(tag);
      return count > 0 && strongest ? [{ tag, count, strongest }] : [];
    })
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  const proof = EVIDENCE.filter((i) => i.tags.some((t) => (d.tags as readonly string[]).includes(t))).length;
  return { name: d.name, tags, proof };
});

export const maxDomainProof = Math.max(...domains.map((d) => d.proof));
export const skillCount = domains.reduce((sum, d) => sum + d.tags.length, 0);

// ─────────────────────────────  profile picks  ─────────────────────────────

/** Three strongest works beside the three highest honours: proof before claims. */
export const picks: readonly Item[] = [
  ...projects.filter((p) => p.featured).slice(0, 3),
  ...[...awards].sort((a, b) => rankWeight(b) - rankWeight(a) || newestFirst(a, b)).slice(0, 3),
];

// ─────────────────────────────  metrics  ─────────────────────────────

/**
 * The grade distribution, in grade order, skipping grades nothing was awarded. This is
 * what the award wall's legend and the metrics scene both read.
 */
export const gradeDistribution: readonly { readonly rank: (typeof RANKS)[number]; readonly count: number }[] =
  RANKS.map((rank) => ({ rank, count: awards.filter((a) => rankOf(a) === rank).length })).filter(
    (x) => x.count > 0,
  );

export const ungradedAwards = awards.filter((a) => rankOf(a) === null).length;

/**
 * Records per year, awards and projects separately, over the full span present in the
 * data. Years with no output are kept so the run reads as a timeline rather than a
 * bar chart with the gaps closed up.
 */
export type YearBucket = {
  readonly year: string;
  readonly awards: number;
  readonly projects: number;
  readonly total: number;
};

export const outputByYear: readonly YearBucket[] = (() => {
  const years = [...awards, ...projects].map(year).filter((y) => y.length === 4);
  if (!years.length) return [];
  const from = Number(years.reduce((a, b) => (a < b ? a : b)));
  const to = Number(years.reduce((a, b) => (a > b ? a : b)));
  const buckets: YearBucket[] = [];
  for (let y = from; y <= to; y++) {
    const key = String(y);
    const a = awards.filter((x) => year(x) === key).length;
    const p = projects.filter((x) => year(x) === key).length;
    buckets.push({ year: key, awards: a, projects: p, total: a + p });
  }
  return buckets;
})();

export const maxYearTotal = Math.max(1, ...outputByYear.map((b) => b.total));

/**
 * Every tag across the evidence set with how many works carry it — the raw material for
 * both "depth of evidence" and the honest counterpart, how many tags rest on one record.
 */
export const tagDepth: readonly { readonly tag: string; readonly count: number }[] = [
  ...new Set(EVIDENCE.flatMap((i) => i.tags)),
]
  .map((tag) => ({ tag, count: tagCount(tag) }))
  .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

export const tagsProvenOnce = tagDepth.filter((t) => t.count === 1).length;
export const totalTags = tagDepth.length;

export const stats = {
  awards: awards.length,
  projects: projects.length,
  certifications: certifications.length,
  experience: experience.length,
  records: PORTFOLIO.items.length,
} as const;
