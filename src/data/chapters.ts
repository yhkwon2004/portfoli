import type { Bi } from "@/lib/types";

/**
 * The reel. Order here is the only source of chapter identity: scene components are
 * rendered in this order, and each one's number and name are stamped from its own index.
 * Inserting a chapter never means renumbering anything by hand.
 */
export type Chapter = {
  readonly id: ChapterId;
  readonly name: Bi;
};

export const CHAPTERS = [
  { id: "title", name: { ko: "표제", en: "Title" } },
  { id: "ai", name: { ko: "AI 대표작", en: "AI Works" } },
  { id: "profile", name: { ko: "인물", en: "Subject" } },
  { id: "grain", name: { ko: "원칙", en: "Principle" } },
  { id: "timeline", name: { ko: "연대기", en: "Chronicle" } },
  { id: "skills", name: { ko: "역량", en: "Capability" } },
  { id: "metrics", name: { ko: "지표", en: "Metrics" } },
  { id: "awards", name: { ko: "수상", en: "Awards" } },
  { id: "projects", name: { ko: "작업", en: "Works" } },
  { id: "certs", name: { ko: "자격", en: "Credentials" } },
  { id: "swot", name: { ko: "분석", en: "Analysis" } },
  { id: "aim", name: { ko: "지향", en: "Direction" } },
  { id: "credits", name: { ko: "엔딩", en: "Credits" } },
] as const satisfies readonly { id: string; name: Bi }[];

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export const LAST = CHAPTERS.length - 1;

/** Index of a chapter by id — so nothing downstream hard-codes a number. */
export const chapterAt = (id: ChapterId): number => CHAPTERS.findIndex((c) => c.id === id);

export const isChapterId = (v: unknown): v is ChapterId =>
  CHAPTERS.some((c) => c.id === v);
