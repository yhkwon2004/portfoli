import type { Bi } from "@/lib/types";

/**
 * How to reach the author.
 *
 * ── on the missing email ──────────────────────────────────────────────────────────────
 * There is no email address here, and its absence is deliberate rather than an oversight.
 * Putting one on a public page publishes it to every scraper that reads the page, and that
 * is the author's decision to make, not this file's. Add it below when you want it:
 *
 *   { key: "EMAIL", label: { ko: "메일", en: "Email" },
 *     value: "you@example.com", href: "mailto:you@example.com" },
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
    key: "GITHUB",
    label: { ko: "코드", en: "Code" },
    value: "github.com/yhkwon2004",
    href: "https://github.com/yhkwon2004",
  },
] as const satisfies readonly Channel[];
