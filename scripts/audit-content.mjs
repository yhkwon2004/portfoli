/**
 * Content audit — the checks a type system cannot make.
 *
 * `npm run typecheck` proves every record has the right *shape*. This proves things about what
 * the records actually say:
 *
 *   · which English fields were never translated (33 of 35 project records, at time of writing)
 *   · whether the SWOT screen has been reviewed by the author
 *   · whether every image path in the data has a rendered file behind it
 *   · the figures the prose quotes, recounted, so a stale number is caught the way the
 *     inherited "장려상 7" was
 *
 * Reports and exits 0 by default — these are facts for a human to act on, not build failures.
 * `--strict` turns every finding into a non-zero exit, for a release checklist.
 */
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const strict = process.argv.includes("--strict");
const findings = [];
const note = (level, line) => findings.push({ level, line });

/**
 * The data module is TypeScript, so read it as text and take the object literal it exports.
 * Anchor on the export itself — the first `{` in the file belongs to the type import.
 *
 * The generator writes this literal with JSON.stringify, so it is always valid JSON; if that
 * ever stops being true this throws loudly rather than auditing a partial object.
 */
const source = readFileSync("src/data/portfolio.ts", "utf8");
const MARKER = "export const PORTFOLIO = ";
const start = source.indexOf(MARKER);
const end = source.lastIndexOf("} as const satisfies");
if (start === -1 || end === -1) {
  console.error("could not find the PORTFOLIO literal in src/data/portfolio.ts");
  process.exit(1);
}
const D = JSON.parse(source.slice(start + MARKER.length, end + 1));

const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

// ── 1. untranslated English ──────────────────────────────────────────────────
const untranslated = [];
for (const item of D.items)
  for (const field of ["t", "s"])
    if (HANGUL.test(item[field].en)) untranslated.push(`${item.id}.${field}`);

if (untranslated.length) {
  const byType = new Map();
  for (const id of untranslated) {
    const type = D.items.find((i) => id.startsWith(`${i.id}.`))?.type ?? "?";
    byType.set(type, (byType.get(type) ?? 0) + 1);
  }
  note(
    "warn",
    `${untranslated.length} English fields still contain Korean ` +
      `(${[...byType].map(([t, n]) => `${t}: ${n}`).join(", ")}). ` +
      `The EN view falls back to Korean and labels it lang="ko"; the fix is a human translation.`,
  );
}

// ── 2. unreviewed SWOT ───────────────────────────────────────────────────────
if (/export const SWOT_REVIEWED = false/.test(readFileSync("src/data/swot.ts", "utf8"))) {
  note(
    "warn",
    "The 분석 (SWOT) screen is still marked unreviewed. It is the one screen not in the author's " +
      "own words — read every line, then set SWOT_REVIEWED = true in src/data/swot.ts.",
  );
}

// ── 3. every image in the data has rendered files ────────────────────────────
const TIERS = ["thumb", "full"];
const missing = [];
for (const item of D.items)
  for (const img of item.imgs ?? []) {
    const rel = img.u.replace(/^\/?assets\//, "");
    const webp = /\.(jpe?g|png|webp)$/i.test(rel) ? rel.replace(/\.(jpe?g|png|webp)$/i, ".webp") : rel;
    for (const tier of TIERS)
      if (!existsSync(join("public/assets", tier, webp))) missing.push(`${tier}/${webp}`);
  }
if (missing.length) {
  note("fail", `${missing.length} image files referenced by the data do not exist: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? " …" : ""}. Re-run scripts/images.mjs against the masters.`);
}

// ── 4. recount the figures the prose quotes ──────────────────────────────────
const RANKS = [["대상", 4], ["국가장학", 4], ["최우수상", 3], ["우수상", 2], ["장려상", 1], ["3위", 1], ["입선", 0]];
const awards = D.items.filter((i) => i.type === "award");
const evidence = D.items.filter((i) => i.type === "project" || i.type === "experience");
const tags = [...new Set(evidence.flatMap((i) => i.tags))];
const tagCount = (t) => evidence.filter((i) => i.tags.includes(t)).length;

const counted = {
  awards: awards.length,
  projects: D.items.filter((i) => i.type === "project").length,
  grades: Object.fromEntries(
    RANKS.map(([k]) => [k, awards.filter((a) => RANKS.find(([r]) => a.tags.includes(r))?.[0] === k).length]).filter(([, n]) => n),
  ),
  tags: tags.length,
  provenOnce: tags.filter((t) => tagCount(t) === 1).length,
};

/*
 * Every figure the 분석 prose states, re-checked against the recount — comments included,
 * since the file's own provenance header quotes the same numbers.
 *
 * Two things this has to get right:
 *
 *   · check *every* occurrence, not the first. The first "대상 4" in the file is in the header
 *     comment, and matching only that would let a wrong figure in a bullet through.
 *   · not match a label inside a longer one. "우수상 12" naively matches the tail of
 *     "최우수상 10", so each label is anchored with a lookbehind for a preceding hangul
 *     syllable — Korean has no \b.
 */
const swotText = readFileSync("src/data/swot.ts", "utf8");
const claims = [
  ["수상", counted.awards, "건", "award total"],
  ...Object.entries(counted.grades).map(([grade, n]) => [grade, n, "", `grade ${grade}`]),
  ["기술 태그", counted.tags, "개", "tag total"],
];

for (const [label, expected, suffix, what] of claims) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![가-힣])${escaped} (\\d+)${suffix}`, "g");
  for (const m of swotText.matchAll(re)) {
    if (Number(m[1]) !== expected) {
      note("fail", `분석 prose says "${m[0]}" but the records say ${expected} (${what}).`);
    }
  }
}

// The "N개가 단 1건" claim has its own shape.
for (const m of swotText.matchAll(/(\d+)개가 단 1건/g)) {
  if (Number(m[1]) !== counted.provenOnce) {
    note("fail", `분석 prose says ${m[1]} tags are proven by a single work; the records say ${counted.provenOnce}.`);
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log("content audit");
console.log(`  records ${D.items.length} · awards ${counted.awards} · projects ${counted.projects}`);
console.log(`  grades  ${Object.entries(counted.grades).map(([k, n]) => `${k} ${n}`).join(" · ")}`);
console.log(`  tags    ${counted.tags} distinct, ${counted.provenOnce} proven by a single work`);
console.log("");

if (!findings.length) {
  console.log("  ✓ nothing to report");
  process.exit(0);
}
for (const f of findings) console.log(`  ${f.level === "fail" ? "✗" : "!"} ${f.line}\n`);

const failed = findings.some((f) => f.level === "fail");
process.exit(failed || strict ? 1 : 0);
