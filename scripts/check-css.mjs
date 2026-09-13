/**
 * Guard against malformed colour literals in the stylesheets and simulations.
 *
 * A hex that is not 3, 4, 6 or 8 digits is silently dropped by CSS and quietly ignored by
 * canvas — the gradient stop simply does not appear, and nothing anywhere reports it. Two of
 * these slipped in during the reskin (`#3b4considered`, `#6f7near`) and neither the type
 * checker, the linter nor the build said a word. This is the thing that would have.
 *
 * Run by `npm run verify`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/*
 * Scoped to where colours actually live. Scanning all of src/ instead flags every URL
 * fragment the site uses for deep links (`${SITE_URL}/#person`, `#projects/<id>`), and no
 * pattern reliably separates `#certs` from a typo'd `#6f7near` — both open with hex digits.
 * Narrowing the search is more honest than a clever regex that is wrong either way.
 */
const ROOTS = ["src/styles", "src/lib/sim", "src/data"];
const EXT = new Set([".css", ".ts", ".tsx"]);
/** A `#` followed by hex-ish word characters — deliberately loose, so bad ones are caught. */
const HEXISH = /#[0-9a-zA-Z]+/g;
const VALID = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    return statSync(p).isDirectory() ? walk(p) : EXT.has(extname(p)) ? [p] : [];
  });

const bad = [];
for (const file of ROOTS.flatMap(walk)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, n) => {
    // Comments describe colours (`#rrggbb`) without being ones, and `url(#glassGrad)`
    // references an SVG gradient by id. Neither is a literal the browser will parse.
    const stripped = line
      .replace(/\/\/.*$/, "")
      .replace(/\/\*.*?\*\//g, "")
      .replace(/^\s*\*.*$/, "")
      .replace(/url\(#[^)]*\)/g, "");
    for (const m of stripped.match(HEXISH) ?? []) {
      if (!VALID.test(m)) bad.push(`${file}:${n + 1}  ${m}`);
    }
  });
}

if (bad.length) {
  console.error(`malformed colour literals (${bad.length}):`);
  for (const b of bad) console.error(`  ${b}`);
  process.exit(1);
}
console.log("colour literals: all well-formed");
