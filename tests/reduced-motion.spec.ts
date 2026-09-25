import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(800);

/**
 * Reduced motion is a different code path, not a cosmetic variant.
 *
 * The whole site is motion, so "reduce" cannot mean "remove the site". What it removes is the
 * involuntary and continuous motion — the ambient sand loop, the film grain, the Ken Burns
 * drift, and the reel advancing on its own. What stays is the transition the visitor asked
 * for by changing chapter.
 */
test.describe("reduced motion", () => {
  test("the site still works and still cuts between chapters", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    await expect(page.locator("h1.name")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await settle(page);
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-ai/);
  });

  test("the ambient sand loop is stopped, not merely hidden", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    // CSS hides the canvas…
    await expect(page.locator(".sand-canvas")).toBeHidden();

    // …and the simulation behind it must actually be stopped. A hidden canvas still holds
    // whatever was last painted into it, so if the loop were running its pixels would keep
    // changing. Two samples 700ms apart being byte-identical is the real evidence.
    const pixels = () =>
      page.locator(".sand-canvas").evaluate((c) => (c as HTMLCanvasElement).toDataURL());

    const first = await pixels();
    await page.waitForTimeout(700);
    expect(await pixels()).toBe(first);
  });

  test("the hourglass is drawn once and does not repaint", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    const grab = () =>
      page.locator(".glass canvas").evaluate((c) => (c as HTMLCanvasElement).toDataURL());

    const first = await grab();
    await page.waitForTimeout(700);
    const second = await grab();

    // A running pour changes every frame; a settled one is byte-identical.
    expect(second).toBe(first);
  });

  test("the focus panel does not advance on its own", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const position = page.locator(".s-awards .fpos");
    const before = await position.textContent();
    // The reel's interval is 3.2s; wait past it.
    await page.waitForTimeout(4200);
    expect(await position.textContent()).toBe(before);
  });

  test("the panel still responds to a pointer", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    await page.locator(".wall-awards .cell").nth(6).hover();
    await expect(page.locator(".s-awards .fpos")).toContainText("07 / 35");
  });
});

test("the wireframe room is stopped too, not just the sand", async ({ page }) => {
  await page.goto("/#profile");
  await page.waitForTimeout(900);

  const pixels = () =>
    page.locator(".grid-room").evaluate((c) => (c as HTMLCanvasElement).toDataURL());

  const first = await pixels();
  await page.waitForTimeout(700);
  expect(await pixels()).toBe(first);
});

test("the AI diagrams rest on their finished frame, and the triptych stays put", async ({ page }) => {
  await page.goto("/#ai");
  await page.waitForTimeout(1200);

  const open = page.locator('.s-ai .aip[data-on="true"]');
  await expect(open).toHaveCount(1);
  await expect(open.locator(".aip-tab")).toHaveAttribute("data-n", "0");
  // No loop: nothing writes the clock, and no beat is singled out.
  await expect(open.locator(".av-tc")).toHaveText("");
  await expect(open).not.toHaveAttribute("data-phase", /./);
  // The finished frame is the one the server rendered: the gap is flagged, the case laid out.
  await expect(open.locator(".av-readout")).toHaveText("CHECKED 5/6 · 1 MISSING");

  // Nothing moves on by itself…
  await page.waitForTimeout(3000);
  await expect(open.locator(".aip-tab")).toHaveAttribute("data-n", "0");

  // …but the panels still open by hand: that is navigation, not decoration.
  await page.locator('.s-ai .aip-tab[data-n="2"]').click();
  await expect(page.locator('.s-ai .aip[data-on="true"] .aip-tab')).toHaveAttribute("data-n", "2");
});

test("the works stage stands still: one flat plate, and no reel", async ({ page }) => {
  await page.goto("/#projects");
  await page.waitForTimeout(1400);

  // Depth only reads as depth while something moves through it, so under reduced motion the
  // cluster collapses to the cover alone.
  await expect(page.locator(".s-projects .plate:visible")).toHaveCount(1);
  const flat = await page
    .locator(".s-projects .plates")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
  expect(flat.m13).toBe(0);
  expect(flat.m23).toBe(0);

  // And the reel does not advance on its own.
  const at = await page.locator(".s-projects .wm-pos").textContent();
  await page.waitForTimeout(4200);
  expect(await page.locator(".s-projects .wm-pos").textContent()).toBe(at);
});

/**
 * The motion layer's own promises under reduced motion: nothing scripted runs — no shutter, no
 * scrambling, no counting, no reticle — and the site's MOTION switch cannot turn back on what
 * the system asked to turn off.
 */
test.describe("reduced motion: the scripted layer stands down", () => {
  test("no power-on shutter, and the MOTION switch reads off and is locked", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await expect(page.locator(".boot")).toBeHidden();
    const sw = page.locator(".motionsw");
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(sw).toBeDisabled();
  });

  test("figures arrive as figures: no counting, no scrambling", async ({ page }) => {
    await page.goto("/#skills");
    await page.waitForTimeout(900);

    const seen = await page.evaluate(
      () =>
        new Promise<{ counts: string[]; scrambling: boolean }>((resolve) => {
          const counts: string[] = [];
          let scrambling = false;
          const t0 = performance.now();
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
          const tick = () => {
            const scene = document.querySelector(".s-metrics");
            if (scene?.getAttribute("data-live") === "true") {
              counts.push(scene.querySelector(".wall-head .count")?.textContent ?? "");
            }
            if (document.querySelector(".dc[data-dc]")) scrambling = true;
            if (performance.now() - t0 < 1600) requestAnimationFrame(tick);
            else resolve({ counts, scrambling });
          };
          requestAnimationFrame(tick);
        }),
    );

    expect(seen.counts.length).toBeGreaterThan(0);
    for (const c of seen.counts) expect(c).toBe("87");
    expect(seen.scrambling).toBe(false);
  });

  test("the reticle never appears", async ({ page }) => {
    await page.goto("/#awards");
    await page.waitForTimeout(900);
    await page.locator(".wall-awards .cell").nth(4).hover();
    await page.waitForTimeout(400);
    await expect(page.locator(".reticle")).toHaveAttribute("data-on", "false");
  });
});
