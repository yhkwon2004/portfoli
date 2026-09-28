import type { Bi } from "@/lib/types";

/**
 * How to reach the author.
 *
 * The address and the four profiles are the ones the author publishes on their own
 * cinematic site (public/cinematic/content.js on the default branch), so putting them here
 * repeats a choice the author has already made rather than making it for them.
 *
 * Everything else — the pill in the frame, the sheet, the layout — already reads this array,
 * so a channel is one line and nothing else changes.
 */
export type Channel = {
  /** The mono tag down the left of the row. Latin, uppercase: it is machine voice. */
  readonly key: string;
  /** What the channel is, in words. */
  readonly label: Bi;
  /** What the visitor reads — the handle or address itself, not "click here". */
  readonly value: string;
  readonly href: string;
};

export const CONTACT: readonly Channel[] = [
  {
    key: "EMAIL",
    label: { ko: "메일", en: "Email" },
    value: "yhkwon2004@gmail.com",
    href: "mailto:yhkwon2004@gmail.com",
  },
  {
    key: "GITHUB",
    label: { ko: "코드", en: "Code" },
    value: "github.com/yhkwon2004",
    href: "https://github.com/yhkwon2004",
  },
  {
    key: "NOTION",
    label: { ko: "원문 포트폴리오", en: "Full portfolio" },
    value: "Notion",
    href: "https://befitting-paper-753.notion.site/PR-75bfaf73802f835f948881f5ba22bdc4?pvs=74",
  },
  {
    key: "BLOG",
    label: { ko: "기록", en: "Notes" },
    value: "blog.naver.com/procmd",
    href: "https://blog.naver.com/procmd",
  },
  {
    key: "INSTAGRAM",
    label: { ko: "일상", en: "Everyday" },
    value: "@dydgus_.0802",
    href: "https://www.instagram.com/dydgus_.0802",
  },
] as const satisfies readonly Channel[];
