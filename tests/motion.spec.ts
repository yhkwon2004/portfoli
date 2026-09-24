import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1400);
const live = (page: Page) => page.locator('.scene[data-live="true"]');

/**
 * The motion system. Every test here checks a claim the motion makes about itself — that a
 * cut has an exit and a direction, that animated type still reads as text, that a counter
 * lands on the real figure, that nothing decorative is ever left half-played — because motion
 * that is only checked by eye is motion that quietly breaks.
 */
test.describe("the cut", () => {
  test("the outgoing chapter plays an exit, then clears", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    await page.keyboard.press("ArrowDown");
    // The chapter just left is held in its own state while it exits…
    await expect(page.locator('.scene[data-state="out"]')).toHaveClass(/s-profile/);
    await expect(live(page)).toHaveClass(/s-grain/);
    // …and released once the exit is over, before another cut could land.
    await page.waitForTimeout(900);
    await expect(page.locator('.scene[data-state="out"]')).toHaveCount(0);
  });

  test("the stage knows which way the reel moved", async ({ page }) => {
    await page.goto("/#skills");
    await settle(page);
    const stage = page.locator(".stage");

    await page.keyboard.press("ArrowDown");
    await expect(stage).toHaveAttribute("data-dir", "1");
    await settle(page);
    await page.keyboard.press("ArrowUp");
    await expect(stage).toHaveAttribute("data-dir", "-1");
    // One variable carries it to every direction-aware keyframe.
    expect(await stage.evaluate((el) => getComputedStyle(el).getPropertyValue("--dir").trim())).toBe("-1");
  });

  test("going back turns the glass over", async ({ page }) => {
    await page.goto("/#grain");
    await settle(page);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(80);
    const turning = await page.locator(".glass-in").evaluate((el) =>
      el.getAnimations().some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "rotate" in k)),
    );
    expect(turning).toBe(true);
  });

  test("pushing past the first chapter recoils instead of doing nothing", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(60);
    const recoiling = await live(page).evaluate((el) =>
      el.getAnimations().some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "translate" in k)),
    );
    expect(recoiling).toBe(true);
    await expect(live(page)).toHaveClass(/s-title/);
  });

  test("the power-on shutter is gone once the frame is open, and never blocks a click", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".boot")).toHaveCSS("pointer-events", "none");
    await page.waitForTimeout(2000);
    await expect(page.locator(".boot")).toHaveCSS("visibility", "hidden");
  });

  test("without a script, nothing is left waiting behind the shutter", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    // The shutter and the held keyframes are both switched off for a visitor with no JS.
    const noscript = html.match(/<noscript>([^]*?)<\/noscript>/)?.[1] ?? "";
    expect(noscript).toContain(".boot{display:none!important}");
    expect(noscript).toContain(".scene,.scene *,.scene *::before,.scene *::after{animation:none!important}");
  });
});

test.describe("kinetic type and decoders", () => {
  test("a split heading is still one name to a screen reader, and one string to a crawler", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const name = page.locator("h1.name");

    await expect(name).toHaveAttribute("aria-label", "권용현");
    // The letters are the only copy of the text, hidden from the accessibility tree as a unit.
    await expect(name.locator(".kin-v")).toHaveAttribute("aria-hidden", "true");
    await expect(name.locator(".u")).toHaveCount(3);
    await expect(name).toHaveText("권용현");
  });

  test("a split paragraph keeps its words as real text", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const tagline = page.locator(".s-title p.tagline");
    // Not hidden, not labelled: the words themselves are the text.
    await expect(tagline.locator("[aria-hidden]")).toHaveCount(0);
    await expect(tagline).toHaveText("도전과 함께 성장하는 문제 해결 기반 성장 전략가");
  });

  test("a decoder scrambles over the real text and leaves nothing behind", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    // Leaving the title brings the instrument block back, and its head re-reads itself.
    await page.keyboard.press("ArrowDown");
    const head = page.locator(".tel-head");
    await expect(head).toHaveAttribute("data-dc", "");
    // The real label never changes while the twin scrambles over it.
    await expect(head.locator(".dc-t")).toHaveText("SAND SYSTEM");

    await settle(page);
    await expect(page.locator(".dc[data-dc]")).toHaveCount(0);
    const leftovers = await page.locator(".dc-fx").evaluateAll((els) => els.filter((e) => e.textContent).length);
    expect(leftovers).toBe(0);
    await expect(head).toHaveText("SAND SYSTEM");
  });
});

test.describe("counters", () => {
  test("a figure rolls up and lands exactly on the real count", async ({ page }) => {
    await page.goto("/#skills");
    await settle(page);

    // Sampled inside the page every frame from the keypress on, so the roll is observed
    // without depending on how quickly the test runner can ask.
    const samples = await page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const seen: string[] = [];
          const t0 = performance.now();
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
          const tick = () => {
            // Only once the metrics chapter is live: before that its figure is the static,
            // final one, and would read as the counter going backwards.
            const scene = document.querySelector(".s-metrics");
            if (scene?.getAttribute("data-live") === "true") {
              seen.push(scene.querySelector(".wall-head .count")?.textContent ?? "");
            }
            if (performance.now() - t0 < 2200) requestAnimationFrame(tick);
            else resolve(seen);
          };
          requestAnimationFrame(tick);
        }),
    );

    const values = samples.map(Number).filter((n) => !Number.isNaN(n));
    expect(values.length).toBeGreaterThan(10);
    // It rolled: something below the final figure was on screen…
    expect(Math.min(...values)).toBeLessThan(84);
    // …it never went backwards…
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThanOrEqual(values[i - 1] ?? 0);
    // …and it finished on the record count, not near it.
    expect(values.at(-1)).toBe(84);
  });
});

test.describe("the pointer", () => {
  test("the reticle locks onto the tile under the pointer and names the action", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const tile = page.locator(".wall-awards .cell").nth(9);
    await tile.hover();
    await page.waitForTimeout(700);

    const reticle = page.locator(".reticle");
    await expect(reticle).toHaveAttribute("data-hot", "true");
    await expect(reticle.locator(".reticle-label")).toHaveText("OPEN");

    // Framing the tile, not floating near it.
    const r = await reticle.boundingBox();
    const t = await tile.boundingBox();
    if (!r || !t) throw new Error("no boxes");
    expect(r.x).toBeLessThanOrEqual(t.x);
    expect(r.y).toBeLessThanOrEqual(t.y);
    expect(r.x + r.width).toBeGreaterThanOrEqual(t.x + t.width);
    expect(r.y + r.height).toBeGreaterThanOrEqual(t.y + t.height);
  });

  test("a falloff field swells the tiles near the pointer and leaves the far ones alone", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const tiles = page.locator(".wall-awards .cell");
    await tiles.nth(8).hover();
    await page.waitForTimeout(300);

    const fx = (n: number) => tiles.nth(n).evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--fx")));
    expect(await fx(8)).toBeGreaterThan(0.8);
    expect(await fx(34)).toBe(0);
  });

  test("the selection box travels to the tile the reel is on", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const tile = page.locator(".wall-awards .cell").nth(16);
    await tile.hover();
    await page.waitForTimeout(900);
    const [sel, cell] = await Promise.all([
      page.locator(".s-awards .wall-sel").evaluate((el) => ({ x: el.offsetLeft, y: el.offsetTop })),
      tile.evaluate((el) => ({ x: (el as HTMLElement).offsetLeft, y: (el as HTMLElement).offsetTop })),
    ]);
    expect(Math.abs(sel.x - (cell.x - 4))).toBeLessThan(2);
    expect(Math.abs(sel.y - (cell.y - 4))).toBeLessThan(2);
  });

  test("a record opens out of the tile that was pressed", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);
    await page.locator(".wall-awards .cell").nth(12).click();

    // The flying frame of the container transform is in flight…
    const flying = await page.locator(".dossier .zoomrect").evaluate((el) => el.getAnimations().length);
    expect(flying).toBeGreaterThan(0);
    // …and parked, invisible, once the sheet is open.
    await page.waitForTimeout(1300);
    await expect(page.locator(".dossier .zoomrect")).toHaveCSS("opacity", "0");
    expect(await page.locator(".dossier .zoomrect").evaluate((el) => el.getAnimations().length)).toBe(0);
  });
});

test.describe("the projector's controls", () => {
  test("PLAY runs the timecode, and a hand on the controls stops it", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const play = page.locator(".playbtn");
    await play.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".stage")).toHaveAttribute("data-playing", "true");

    const tc = page.locator(".timecode");
    const a = await tc.textContent();
    await page.waitForTimeout(700);
    expect(await tc.textContent()).not.toBe(a);

    await page.keyboard.press("ArrowDown");
    await expect(play).toHaveAttribute("aria-pressed", "false");
  });

  test("PLAY holds each chapter for its twelve seconds, then cuts to the next", async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto("/#profile");
    await settle(page);

    await page.locator(".playbtn").click();
    await page.waitForTimeout(11_000);
    await expect(live(page)).toHaveClass(/s-profile/);
    await page.waitForTimeout(2_600);
    await expect(live(page)).toHaveClass(/s-grain/);
    // Still playing, and the timecode is past the new chapter's mark.
    await expect(page.locator(".playbtn")).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator(".timecode").textContent()).toMatch(/^00:00:2[4-9]:/);
  });

  test("the MOTION switch stops the loops, and is remembered", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const sw = page.locator(".motionsw");
    await expect(sw).toHaveAttribute("role", "switch");
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(page.locator(".stage")).toHaveAttribute("data-motion", "off");

    // Off means stopped, not hidden: the hourglass does not repaint.
    await expect(page.locator(".sand-canvas")).toBeHidden();
    const grab = () => page.locator(".glass canvas").evaluate((c) => (c as HTMLCanvasElement).toDataURL());
    const first = await grab();
    await page.waitForTimeout(700);
    expect(await grab()).toBe(first);

    await page.reload();
    await settle(page);
    await expect(page.locator(".motionsw")).toHaveAttribute("aria-checked", "false");
    await page.locator(".motionsw").click();
    await expect(page.locator(".stage")).toHaveAttribute("data-motion", "on");
  });

  test("the chapter rail's playhead sits on the current chapter", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await page.locator(".chapters button").nth(7).click();
    await page.waitForTimeout(900);

    const [head, button] = await Promise.all([
      page.locator(".ph-head").boundingBox(),
      page.locator(".chapters button").nth(7).boundingBox(),
    ]);
    if (!head || !button) throw new Error("no boxes");
    expect(Math.abs(head.y + head.height / 2 - (button.y + button.height / 2))).toBeLessThan(3);
  });
});

/**
 * Regression: the pour stalled on a slow machine.
 *
 * The slump that holds the pile at its angle of repose used to run a fixed number of passes
 * per frame, so at a low frame rate more grains landed between slumps, the cone grew too
 * steep, and its peak reached the neck — the same stall the 56° repose once caused. Under a
 * 6× CPU throttle the original code read FLOW 000 at chapters 7, 9 and 10. The simulation now
 * steps in fixed ticks, so the pile is the same at any frame rate.
 */
test("the pour never stalls on a slow machine either", async ({ page }) => {
  test.setTimeout(60_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });

  await page.goto("/#profile");
  await page.waitForTimeout(2500);
  const flow = async () => Number(await page.locator(".telemetry .tel-grid dd").first().textContent());

  for (const chapter of [7, 9, 10]) {
    await page.locator(".chapters button").nth(chapter).click();
    await page.waitForTimeout(4500);
    expect(await flow(), `chapter ${chapter} stalled under a slow frame rate`).toBeGreaterThan(0);
  }
});
