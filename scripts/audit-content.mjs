/**
 * Content audit — the checks a type system cannot make.
 *
 * `npm run typecheck` proves every record has the right *shape*. This proves things about what
 * the records actually say:
 *
 *   · which English fields were never translated (33 of 35 project records, at time of writing)
 *   · whether every image path in the data has a rendered file behind it
 *   · whether every AI work has its rendered concept media (video, poster, three stills)
 *   · no figure is typed into the copy deck by hand — every count on the page is derived
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

// ── 3b. works with no date ───────────────────────────────────────────────────
// A work without a year sorts correctly (featured works go by rank) but is missing from the
// skills section's output-per-year chart, and shows no year on its card or its sheet.
const undated = D.items.filter((i) => i.type === "project" && !i.year).map((i) => i.id);
if (undated.length) {
  note(
    "warn",
    `${undated.length} works have no year (${undated.join(", ")}). They are left out of the ` +
      `output-per-year chart; add the year in src/data/portfolio.ts once it is known.`,
  );
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

// ── 5. the AI works' rendered media ──────────────────────────────────────────
// scripts/render-media.mjs draws these from the same 3D scenes the page runs live. A missing
// file is not fatal to the page — it falls back to the live scene or the diagram — but the
// reader without WebGL, and every phone, would see nothing where the work should be.
const aiSource = readFileSync("src/data/ai.ts", "utf8");
const kinds = [...aiSource.matchAll(/visual: "(\w+)"/g)].map((m) => m[1]);
const media = kinds.flatMap((k) => [`${k}.webm`, `${k}-poster.webp`, `${k}-1.webp`, `${k}-2.webp`, `${k}-3.webp`]);
const missingMedia = media.filter((f) => !existsSync(join("public/media/ai", f)));
for (const f of ["public/media/hero-poster.webp", "public/og.png"]) if (!existsSync(f)) missingMedia.push(f);
if (missingMedia.length) {
  note("fail", `${missingMedia.length} rendered media files are missing (${missingMedia.slice(0, 4).join(", ")}${missingMedia.length > 4 ? " …" : ""}). Run \`npm run media\`.`);
}

// ── 6. no hand-typed counts in the copy deck ─────────────────────────────────
// The inherited "장려상 7" was a figure typed into prose that the records had moved past. The
// copy deck now takes every count from src/lib/select.ts; a digit followed by a counter word
// means someone typed one back in. "단 1건" is a definition (proven by a single work), not a count.
const deck = readFileSync("src/data/ui.ts", "utf8")
  .split("\n")
  .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
  .join("\n");
for (const m of deck.matchAll(/(?<![\w$.{])(?<!단 )(\d+)\s?(건|개|점|awards|projects|works)/g)) {
  note("fail", `src/data/ui.ts types a count by hand: "${m[0]}". Derive it from stats in src/lib/select.ts.`);
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
