/**
 * The content model.
 *
 * Everything the site renders comes from one array of `Item`s — awards, projects,
 * schooling, roles, certificates and the profile blurb are all the same shape, told
 * apart by `type`. That is what lets one dossier render any record at all, and one set of
 * selectors count every figure the site shows.
 */

/** The two languages every string ships in. */
export type Lang = "ko" | "en";

/** A bilingual string. Both halves are always present; `pick()` in i18n.ts chooses one. */
export type Bi = {
  readonly ko: string;
  readonly en: string;
};

export type ItemType =
  | "profile"
  | "education"
  | "experience"
  | "certification"
  | "award"
  | "project";

/**
 * What an image is for. `cover` is the one the tile, the pick card, the focus panel and
 * the dossier hero all show; the rest fill the dossier gallery. `certificate` marks a
 * scanned document — those must never be cropped, so the focus panel switches to
 * `object-fit: contain` for them.
 */
export type ImgRole = "cover" | "gallery" | "certificate";

export type Img = {
  /** Master-relative path, always `/assets/...`. Resolve through `src/lib/assets.ts`. */
  readonly u: string;
  /** Alt text. */
  readonly a: string;
  readonly r: ImgRole;
};

export type Link = {
  readonly label: string;
  readonly url: string;
};

/**
 * Detail-card headings, exactly as the source data spells them: unspaced Korean
 * compounds. They are a closed set so that `DETAIL_LABELS` in src/data/labels.ts is
 * forced to cover every one — a heuristic word-splitter would mis-break compounds
 * nobody proof-read, and a plain `string` key would let a new heading ship unlabelled.
 */
export type DetailKey =
  | "기술스택"
  | "대표프로젝트"
  | "막혔던부분과해결"
  | "문제정의"
  | "문제해결과리더십"
  | "배운점"
  | "분석모듈"
  | "역할"
  | "주요기술활동"
  | "진행타임라인"
  | "진행포인트"
  | "프로젝트개요"
  | "프로젝트설명"
  | "필요성"
  | "한줄소개"
  | "핵심기능"
  | "핵심축"
  | "핵심포인트"
  | "협업"
  | "환경구축메모"
  | "활동기간";

/** A detail value is either a paragraph or a bullet list. */
export type DetailValue = string | readonly string[];

export type Details = {
  readonly [K in DetailKey]?: DetailValue;
};

/**
 * A result a piece of work earned at a competition, carried on the work itself.
 *
 * Distinct from an `award` record on purpose: every award record is a scanned certificate on
 * the 7 × 5 award wall, and an honour that is only known from the author's own account has no
 * scan to hang there. Keeping it on the work also keeps the claim next to the thing it is for.
 */
export type Honor = {
  /** The competition. */
  readonly event: Bi;
  /** The result — "전국 2위", "장려상". */
  readonly grade: Bi;
  /** The category within the competition, where the author named one. */
  readonly track?: Bi;
};

export type Item = {
  readonly id: string;
  readonly type: ItemType;
  /** Title. */
  readonly t: Bi;
  /** Summary. */
  readonly s: Bi;
  /** `"2025"` or `"2025-06-04"`; `""` where the source has no date. */
  readonly year: string;
  readonly tags: readonly string[];
  /** Marks a piece of work as representative — it sorts first and wears a ★. */
  readonly featured: boolean;
  /** Author's manual ordering hint; 99 means "unranked". */
  readonly rank: number;
  readonly imgs: readonly Img[];
  readonly honor?: Honor;
  readonly details?: Details;
  readonly links?: readonly Link[];
};

export type Portfolio = {
  readonly owner: Bi;
  readonly headline: Bi;
  readonly quote: Bi;
  readonly items: readonly Item[];
};
