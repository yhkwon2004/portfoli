/**
 * Export the site as Figma frames: every section as an SVG whose text is real text and whose
 * boxes are real rectangles, so dropping the files onto a Figma canvas gives editable layers —
 * not a screenshot. Plus a design-system board (colours, type, components) and the tokens as
 * W3C design-token JSON.
 *
 * It photographs the built site with motion off, so every reveal is shown, every stage holds
 * its rendered poster, and nothing is caught mid-animation. The DOM → SVG conversion is
 * dom-to-svg, run inside the page; this script then makes the result Figma-friendly:
 *
 *   · one font family per text run, the one the browser actually drew it in (Hangul → Noto
 *     Sans KR), since Figma takes a family list's first name and Geist has no Hangul
 *   · gradient text (CSS background-clip: text) as a real gradient fill on the text
 *   · WebP images re-encoded as JPEG, which every SVG importer reads
 *   · the page's dark ground as each frame's first layer; @font-face blocks dropped
 *
 *   npm run build && npx serve -l 4321 out &
 *   npm run figma                     # → design/figma/
 *
 * CHROMIUM_PATH overrides the browser binary, for environments with one already installed.
 */
import { chromium } from "playwright";
import { build } from "esbuild";
import sharp from "sharp";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:4321";
const OUT = "design/figma";
const BG = "#05060a";
const SENTINEL = (k) => `rgb(1, 2, ${k + 3})`;

const lib = (
  await build({
    stdin: {
      contents: 'import { elementToSVG } from "dom-to-svg"; window.domToSvg = { elementToSVG };',
      resolveDir: process.cwd(),
    },
    bundle: true,
    format: "iife",
    write: false,
    logLevel: "silent",
  })
).outputFiles[0].text;

/** Everything shown, nothing moving, no overlays that only make sense live. */
const EXPORT_CSS = `
  html, body { background: ${BG} !important; }
  [data-reveal] { opacity: 1 !important; transform: none !important; filter: none !important; clip-path: none !important; }
  .split .u { opacity: 1 !important; transform: none !important; }
  /* the word masks exist for the rise; converted, their em-based inset clips the whole word */
  .split .w { clip-path: none !important; }
  /* the hero's second beat (the figures) lives behind the first; the frame is the first */
  .hero-beat, .hero-stats { display: none !important; }
  /* dom-to-svg paints positive z-index layers first (under their siblings); these only need DOM order */
  .hero-inner, .case-hud, .nav, .dos-bar, .nav-links a { z-index: auto !important; }
  .scrub .sw { opacity: 1 !important; }
  .stop { opacity: 1 !important; transform: none !important; }
  .tile-dots i { opacity: 0.85 !important; transform: none !important; }
  .grain, .cursor, .cursor-ring, .progress, .loader, .skip, .hero-scroll { display: none !important; }
  .aurora i { animation: none !important; }
`;

const browser = await chromium.launch({
  args: ["--no-sandbox"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

async function open(width, height, path = "/") {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error(`  page error: ${e}`));
  await page.addInitScript(() => sessionStorage.setItem("portfolio:seen", "1"));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.motion === "off");
  await page.addStyleTag({ content: EXPORT_CSS });
  await page.addScriptTag({ content: lib });
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    // Exported with motion off so nothing is mid-animation, but drawn with the switch in its
    // usual, on position — that is the state a visitor first sees.
    const sw = document.querySelector(".nav-motion");
    if (sw) {
      sw.removeAttribute("disabled");
      sw.setAttribute("aria-checked", "true");
      const l = sw.querySelector(".nav-motion-l");
      if (l) l.textContent = "MOTION";
    }
    await document.fonts.ready;
  });
  await settle(page);
  return page;
}

async function settle(page) {
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 60_000 });
  await page.waitForTimeout(250);
}

/**
 * Convert one element. `prep` runs in the page first (scroll, open a sheet, move the nav in).
 * Gradient text is repainted in a sentinel colour per element and its box recorded, so the
 * post-pass can swap each sentinel for a gradient laid across that element's own width.
 */
async function grab(page, selector, prep) {
  if (prep) await page.evaluate(prep);
  await settle(page);
  return page.evaluate(async (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`no ${selector}`);
    const grads = [];
    const touched = [];
    el.querySelectorAll("*").forEach((n) => {
      const cs = getComputedStyle(n);
      if (cs.webkitBackgroundClip !== "text" && cs.backgroundClip !== "text") return;
      const k = grads.length;
      const box = (n.closest(".grad-line, .grad-text, dd, b, p, h1, h2, h3") ?? n).getBoundingClientRect();
      grads.push({ k, x1: box.left, x2: box.right, y1: box.top, y2: box.bottom });
      touched.push([n, n.getAttribute("style")]);
      n.style.setProperty("background", "none", "important");
      n.style.setProperty("color", `rgb(1, 2, ${k + 3})`, "important");
      n.style.setProperty("-webkit-text-fill-color", `rgb(1, 2, ${k + 3})`, "important");
      n.querySelectorAll("*").forEach((c) => c.style.setProperty("-webkit-text-fill-color", "inherit", "important"));
    });
    // Images are inlined afterwards, in Node, where they can also be re-encoded.
    const doc = window.domToSvg.elementToSVG(el);
    for (const [n, s] of touched) {
      if (s === null) n.removeAttribute("style");
      else n.setAttribute("style", s);
    }
    return { svg: new XMLSerializer().serializeToString(doc), grads };
  }, selector);
}

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;
const FAMILIES = ["Instrument Serif", "Geist Mono", "Noto Sans KR", "Geist"];

/** The first real family in a CSS list, or Noto Sans KR where the run is Hangul and Geist would lack the glyphs. */
function family(list, textRun) {
  const names = list.replace(/&quot;/g, '"').split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
  const first = names.find((n) => FAMILIES.includes(n)) ?? names[0];
  if (HANGUL.test(textRun) && (first === "Geist" || first === "Geist Mono")) return "Noto Sans KR";
  return first;
}

async function finish({ svg, grads }, file) {
  let s = svg.replace(/<style>[\s\S]*?<\/style>/g, "").replace(/<!--[\s\S]*?-->/g, "");

  // one family per text run
  s = s.replace(/<text([^>]*?)font-family="([^"]*)"([^>]*)>([\s\S]*?)<\/text>/g, (_, a, fam, b, body) => {
    const run = body.replace(/<[^>]+>/g, "");
    return `<text${a}font-family="${family(fam, run)}"${b}>${body}</text>`;
  });
  // The page's classes, kept on the groups, would pull the site's own CSS back in wherever the
  // SVG is shown inline — and Figma names layers from ids, which already carry the class name.
  s = s.replace(/ (class|role|aria-[\w-]+|data-[\w-]+)="[^"]*"/g, "");
  // attributes Figma ignores, to keep the files readable
  s = s.replace(/ (font-size-adjust|font-stretch|font-variant|unicode-bidi|user-select|text-rendering|writing-mode|word-spacing|direction)="[^"]*"/g, "");

  // gradient text
  const defs = grads
    .map(
      (g) =>
        `<linearGradient id="grad-text-${g.k}" gradientUnits="userSpaceOnUse" x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x2.toFixed(1)}" y2="${g.y2.toFixed(1)}">` +
        `<stop offset="0" stop-color="#9d8cff"/><stop offset="0.6" stop-color="#57e6ff"/><stop offset="1" stop-color="#b8f7ff"/></linearGradient>`,
    )
    .join("");
  for (const g of grads) {
    const c = SENTINEL(g.k).replace(/[()]/g, "\\$&");
    s = s.replace(new RegExp(`(fill|color)="${c}"`, "g"), (_, attr) => (attr === "fill" ? `fill="url(#grad-text-${g.k})"` : `color="#9d8cff"`));
  }

  // the frame's ground, and the gradient defs, as the first children
  const vb = s.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  const [x, y, w, h] = vb ? vb.slice(1).map(Number) : [0, 0, 1440, 900];
  s = s.replace(/(<svg[^>]*>)/, `$1<defs>${defs}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${BG}"/>`);

  // every image embedded, WebP re-encoded as JPEG (PNG where there is alpha), none wider than
  // twice the size it is drawn at
  const hrefs = [...new Set([...s.matchAll(/<image\b[^>]*?href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))];
  for (const url of hrefs) {
    const res = await fetch(url.replace(/&amp;/g, "&"));
    if (!res.ok) {
      console.warn(`  ! ${url} ${res.status}`);
      continue;
    }
    const img = sharp(Buffer.from(await res.arrayBuffer()));
    const meta = await img.metadata();
    const drawn = Math.max(...[...s.matchAll(new RegExp(`href="${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*width="([\\d.]+)"`, "g"))].map((m) => Number(m[1])), 200);
    const sized = meta.width && meta.width > drawn * 2 ? img.resize({ width: Math.round(drawn * 2) }) : img;
    const alpha = meta.hasAlpha && meta.format !== "jpeg";
    const out = alpha ? await sized.png({ compressionLevel: 9 }).toBuffer() : await sized.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    s = s.split(`href="${url}"`).join(`href="data:image/${alpha ? "png" : "jpeg"};base64,${out.toString("base64")}"`);
  }

  // links still point at the local server the export ran against
  s = s.split(base).join("https://yhkwon2004.github.io/portfoli");

  writeFileSync(file, s);
  console.log(`  ${file}  ${Math.round(w)}×${Math.round(h)}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
}

// ── the frames ───────────────────────────────────────────────────────────────────────
const top = (sel, frac = 0) => `(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  const y = el.getBoundingClientRect().top + scrollY + Math.max(0, el.offsetHeight - innerHeight) * ${frac};
  window.scrollTo(0, y);
})()`;
/** The fixed nav, moved into the frame so it is captured with it. */
const navInto = (sel) => `(() => {
  const nav = document.querySelector("header.nav");
  nav.dataset.home = "1";
  document.querySelector(${JSON.stringify(sel)}).append(nav);
})()`;
const navHome = `(() => {
  const nav = document.querySelector("header.nav[data-home]");
  if (nav) document.body.prepend(nav);
})()`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/desktop`, { recursive: true });
mkdirSync(`${OUT}/mobile`, { recursive: true });

async function frames(dir, width, height, mobile) {
  console.log(`${dir} ${width}×${height}`);
  const page = await open(width, height);
  const run = async (name, selector, prep) => finish(await grab(page, selector, prep), `${OUT}/${dir}/${name}.svg`);

  await run("01-hero", ".hero-pin", `${top("#top")}; ${navInto(".hero-pin")}`);
  await page.evaluate(navHome);
  await run("02-about", "#about", top("#about"));
  if (mobile) {
    await run("03-ai-works", "#ai", top("#ai"));
  } else {
    await run("03-ai-intro", "#ai > .wrap", `${top("#ai")}; document.querySelector("#ai > .wrap").style.paddingBlock = "120px 40px"`);
    const n = await page.locator("#ai article.case").count();
    for (let i = 0; i < n; i++) {
      // held at the third step: the stage, its HUD and the step list all mid-story
      await run(`0${4 + i}-case-${i + 1}`, `#ai article.case[data-n="${i}"] .case-pin`, top(`#ai article.case[data-n="${i}"]`, 0.62));
    }
  }
  await run("07-skills", "#skills", top("#skills"));
  if (mobile) {
    // the full list is 38 cards long; the first eight show the pattern
    await page.evaluate(() => document.querySelectorAll("#works .works-grid > li:nth-child(n+9)").forEach((li) => (li.style.display = "none")));
  }
  await run("08-works", "#works", top("#works"));
  await run("09-awards", mobile ? "#awards" : ".awards-pin", top("#awards", mobile ? 0 : 0.001));
  await run("10-journey", "#journey", top("#journey"));
  await run("11-principles", "#principles", top("#principles"));
  await run("12-contact", "#contact", top("#contact"));
  if (mobile) {
    await page.evaluate(() => window.scrollTo(0, 0));
    // a script click: with the export's z-index flattening, the hero sits over the bar
    await page.evaluate(() => document.querySelector("button[aria-controls='nav-sheet']").click());
    await page.waitForTimeout(900);
    // the sheet is fixed full-screen inside a 72px bar; give the pair a box the size of the screen
    await run(
      "13-menu",
      "#menu-frame",
      `(() => {
        const f = document.createElement("div");
        f.id = "menu-frame";
        f.style.cssText = "position:fixed;inset:0;z-index:200";
        f.append(document.querySelector("header.nav"));
        document.body.append(f);
      })()`,
    );
  }
  await page.close();

  // the record sheet, opened on an AI work, drawn at its full length
  const sheet = await open(width, height, "/#work/project-ai-airsim");
  await sheet.waitForSelector('.dossier[data-open="true"]');
  await finish(
    await grab(sheet, ".dos-sheet", `(() => {
      const d = document.querySelector(".dossier");
      d.style.position = "absolute";
      d.style.inset = "0 0 auto 0";
      const s = document.querySelector(".dos-sheet");
      s.style.height = "auto";
      s.style.overflow = "visible";
      s.style.transform = "none";
    })()`),
    `${OUT}/${dir}/14-record-sheet.svg`,
  );
  await sheet.close();
}

await frames("desktop", 1440, 900, false);
await frames("mobile", 390, 844, true);

// ── the design-system board ──────────────────────────────────────────────────────────
console.log("design system");
{
  const page = await open(1440, 900);
  await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    const el = (tag, style = "", text = "") => {
      const e = document.createElement(tag);
      e.style.cssText = style;
      if (text) e.textContent = text;
      return e;
    };
    const board = el("div", `position:absolute;left:0;top:0;z-index:9999;width:1440px;padding:88px 80px 120px;background:#05060a;display:grid;gap:80px;font-family:var(--font-sans);color:var(--color-fg)`);
    board.id = "ds-board";
    const section = (title, note) => {
      const s = el("section", "display:grid;gap:28px");
      const h = el("div", "display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid var(--color-line-2);padding-bottom:14px");
      h.append(el("h2", "font-size:28px;font-weight:600;letter-spacing:-0.03em", title));
      if (note) h.append(el("p", "font-family:var(--font-mono);font-size:12px;color:var(--color-fg-3);letter-spacing:0.08em", note));
      s.append(h);
      board.append(s);
      return s;
    };

    // header
    const head = el("header", "display:grid;gap:14px");
    head.append(el("p", "font-family:var(--font-mono);font-size:12px;letter-spacing:0.16em;color:var(--color-cyan)", "DESIGN SYSTEM — AI PORTFOLIO"));
    const t = el("h1", "font-size:72px;font-weight:600;letter-spacing:-0.05em;line-height:1");
    t.append("권용현 ");
    t.append(el("span", "font-family:var(--font-serif);font-style:italic;font-weight:400;color:var(--color-fg-2)", "Yonghyun Kwon"));
    head.append(t);
    head.append(el("p", "max-width:760px;color:var(--color-fg-3);font-size:17px;line-height:1.7", "연구실의 밤처럼 — 차가운 검정 위에 모델을 뜻하는 보라→시안 그라디언트 하나, 그리고 결과(수상 · 완료)에만 쓰는 라임 하나."));
    board.append(head);

    // colours
    const groups = [
      ["Ground", ["bg", "bg-2", "bg-3", "bg-4", "grid"]],
      ["Lines", ["line", "line-2", "line-3"]],
      ["Text", ["fg", "fg-2", "fg-3", "fg-4"]],
      ["Brand", ["violet", "cyan", "lime"]],
      ["Diagram / status", ["rose", "amber", "green", "magenta"]],
    ];
    const colours = section("Colour", "tokens.css · @theme");
    for (const [name, keys] of groups) {
      const row = el("div", "display:grid;grid-template-columns:180px repeat(5, 200px);gap:16px;align-items:start");
      row.append(el("p", "font-size:15px;font-weight:500;padding-top:8px;color:var(--color-fg-2)", name));
      for (const k of keys) {
        const val = v(`--color-${k}`);
        const card = el("div", "display:grid;gap:10px");
        card.append(el("div", `height:96px;border-radius:14px;background:${val};border:1px solid rgba(255,255,255,0.12)`));
        card.append(el("p", "font-size:14px;font-weight:500", `--color-${k}`));
        card.append(el("p", "font-family:var(--font-mono);font-size:12px;color:var(--color-fg-3)", val));
        row.append(card);
      }
      colours.append(row);
    }
    const gRow = el("div", "display:grid;grid-template-columns:180px 1fr 1fr;gap:16px;align-items:start");
    gRow.append(el("p", "font-size:15px;font-weight:500;padding-top:8px;color:var(--color-fg-2)", "Gradient"));
    for (const k of ["--gradient", "--gradient-soft"]) {
      const card = el("div", "display:grid;gap:10px");
      card.append(el("div", `height:96px;border-radius:14px;background:${v(k)};border:1px solid rgba(255,255,255,0.12)`));
      card.append(el("p", "font-size:14px;font-weight:500", k));
      card.append(el("p", "font-family:var(--font-mono);font-size:12px;color:var(--color-fg-3)", v(k).replace(/\s+/g, " ")));
      gRow.append(card);
    }
    colours.append(gRow);

    // type — measured off the live elements, so the board states what the page really uses
    const type = section("Typography", "Geist · Noto Sans KR · Geist Mono · Instrument Serif");
    const samples = [
      ["Display / hero", ".hero-line", "현장의 문제를,"],
      ["H2 / section", ".shead h2", "근거로 세는 역량 지도"],
      ["H3 / case", ".case-title", "AirSim 자율주행 시뮬레이터"],
      ["H3 / card", ".deck-body h3", "만들어서 검증한다"],
      ["Body", ".case-sum", "가상환경에서의 딥러닝 학습으로 조향과 주차 신호 인식을 다룬 AirSim 기반 자율주행 시뮬레이터입니다."],
      ["Label / mono", ".label", "AI · 01 / 03 — EVIDENCE"],
      ["Serif italic (EN)", ".hero-name-en", "Yonghyun Kwon"],
    ];
    for (const [name, sel, text] of samples) {
      const ref = document.querySelector(sel);
      if (!ref) continue;
      const cs = getComputedStyle(ref);
      const row = el("div", "display:grid;grid-template-columns:180px 1fr 300px;gap:16px;align-items:center;border-bottom:1px solid var(--color-line);padding-bottom:22px");
      row.append(el("p", "font-size:15px;font-weight:500;color:var(--color-fg-2)", name));
      row.append(
        el(
          "p",
          `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};font-style:${cs.fontStyle};letter-spacing:${cs.letterSpacing};line-height:${cs.lineHeight};text-transform:${cs.textTransform};color:var(--color-fg)`,
          text,
        ),
      );
      const fam = cs.fontFamily.split(",")[0].replace(/"/g, "");
      row.append(el("p", "font-family:var(--font-mono);font-size:12px;line-height:1.7;color:var(--color-fg-3)", `${fam} ${cs.fontWeight} · ${Math.round(parseFloat(cs.fontSize))}px · lh ${cs.lineHeight} · ls ${cs.letterSpacing}`));
      type.append(row);
    }

    // components — cloned from the page itself
    const comps = section("Components", "cloned from the live page");
    const grid = el("div", "display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:28px;align-items:start");
    const cell = (name, node, width = "auto") => {
      const c = el("div", "display:grid;gap:14px;align-content:start");
      c.append(el("p", "font-family:var(--font-mono);font-size:12px;letter-spacing:0.08em;color:var(--color-fg-3)", name));
      const holder = el("div", `width:${width};position:relative`);
      holder.append(node);
      c.append(holder);
      grid.append(c);
    };
    const clone = (sel) => document.querySelector(sel)?.cloneNode(true);
    const buttons = el("div", "display:flex;gap:12px;flex-wrap:wrap");
    [clone(".hero-cta .btn-primary"), clone(".hero-cta .btn-ghost")].forEach((b) => b && buttons.append(b));
    cell("Button / primary · ghost", buttons);
    const chips = el("div", "display:flex;gap:8px;flex-wrap:wrap");
    [clone(".case-tags .chip"), clone(".chip-honor"), clone(".filters .chip")].forEach((c) => c && chips.append(c));
    cell("Chip / tag · honour · filter", chips);
    const pill = clone(".nav-pill");
    if (pill) cell("Nav / pill", pill);
    const work = clone("#works .works-grid > li .work");
    if (work) cell("Card / work (AI)", work, "420px");
    const award = clone("#awards .award");
    if (award) cell("Card / award", award, "260px");
    const steps = clone(".case-steps-wrap");
    if (steps) {
      steps.style.setProperty("--cp", "0.6");
      steps.querySelectorAll("li").forEach((li, k) => {
        li.dataset.done = String(k < 2);
        li.dataset.on = String(k === 2);
      });
      cell("Steps / case study", steps, "420px");
    }
    const tile = clone(".tile-domain");
    if (tile) cell("Tile / bento", tile, "440px");
    const deck = clone(".deck-card");
    if (deck) {
      deck.style.position = "relative";
      deck.style.top = "0";
      deck.style.minHeight = "0";
      cell("Card / principle", deck, "440px");
    }
    const frame = clone(".case-frame");
    if (frame) {
      frame.style.width = "440px";
      cell("Stage / 3D frame + HUD", frame, "440px");
    }
    comps.append(grid);

    // shape
    const shape = section("Radius · spacing · motion", "");
    const specs = [
      ["--radius", v("--radius")],
      ["--radius-sm", v("--radius-sm")],
      ["--nav-h", v("--nav-h")],
      ["--maxw", v("--maxw")],
      ["--gutter", v("--gutter")],
      ["--ease-out", v("--ease-out")],
      ["--ease-in-out", v("--ease-in-out")],
    ];
    const tbl = el("div", "display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:16px");
    for (const [k, val] of specs) {
      const c = el("div", "padding:18px;border-radius:14px;border:1px solid var(--color-line-2);background:var(--color-bg-2);display:grid;gap:8px");
      c.append(el("p", "font-size:14px;font-weight:500", k));
      c.append(el("p", "font-family:var(--font-mono);font-size:12px;color:var(--color-fg-3);word-break:break-all", val));
      tbl.append(c);
    }
    shape.append(tbl);

    document.body.append(board);
    window.scrollTo(0, 0);
  });
  await finish(await grab(page, "#ds-board"), `${OUT}/design-system.svg`);
  await page.close();
}

// ── tokens, as W3C design-token JSON (Tokens Studio, Figma variables import) ─────────
{
  const css = readFileSync("src/styles/tokens.css", "utf8");
  const color = {};
  for (const m of css.matchAll(/--color-([\w-]+):\s*([^;]+);/g)) color[m[1]] = { $type: "color", $value: m[2].trim() };
  const tokens = {
    $description: "권용현 AI Portfolio — design tokens, from src/styles/tokens.css",
    color,
    gradient: {
      brand: { $type: "gradient", $value: [{ color: "#9d8cff", position: 0 }, { color: "#57e6ff", position: 0.6 }, { color: "#b8f7ff", position: 1 }] },
    },
    font: {
      sans: { $type: "fontFamily", $value: ["Geist", "Noto Sans KR"] },
      kr: { $type: "fontFamily", $value: ["Noto Sans KR"] },
      mono: { $type: "fontFamily", $value: ["Geist Mono"] },
      serif: { $type: "fontFamily", $value: ["Instrument Serif"] },
    },
    radius: {
      lg: { $type: "dimension", $value: "22px" },
      sm: { $type: "dimension", $value: "14px" },
      pill: { $type: "dimension", $value: "999px" },
    },
    size: {
      "nav-h": { $type: "dimension", $value: "72px" },
      maxw: { $type: "dimension", $value: "1440px" },
    },
    easing: {
      out: { $type: "cubicBezier", $value: [0.16, 1, 0.3, 1] },
      "in-out": { $type: "cubicBezier", $value: [0.65, 0, 0.35, 1] },
      spring: { $type: "cubicBezier", $value: [0.34, 1.56, 0.64, 1] },
    },
  };
  writeFileSync(`${OUT}/tokens.json`, `${JSON.stringify(tokens, null, 2)}\n`);
  console.log(`  ${OUT}/tokens.json`);
}

await browser.close();
