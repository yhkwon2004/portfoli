import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1200);

/**
 * The instrument layer added with the ALCHE-referenced reskin: the telemetry block, the
 * wireframe room, the ghost chapter word and the registration marks.
 */
test.describe("telemetry", () => {
  test("reports real readings, not placeholders", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const block = page.locator(".telemetry");
    await expect(block).toBeVisible();
    await expect(block.locator(".tel-head")).toHaveText("SAND SYSTEM");

    const values = await block.locator(".tel-grid dd").allTextContents();
    expect(values).toHaveLength(6);
    // Every field must have resolved to a reading; the dashes are the pre-boot placeholder.
    for (const v of values) expect(v).not.toMatch(/-{2,}/);
    // FLOW is a count of grains in the air, so it must be a number and non-negative.
    expect(Number(values[0])).toBeGreaterThanOrEqual(0);
  });

  test("the numbers actually move — the block is wired to the simulation", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const read = () => page.locator(".telemetry .tel-grid dd").allTextContents();
    const first = await read();
    // The pour is continuous, so across a second of simulation at least one channel must
    // change. If none does, the block is decoration and this whole device is a lie.
    await page.waitForTimeout(1100);
    const second = await read();
    expect(second.join("|")).not.toBe(first.join("|"));
  });

  test("FILL tracks the chapter, because the sand level is the progress bar", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);
    const target = () => page.locator(".telemetry .tel-grid dd").nth(2).textContent();

    const early = Number(await target());
    await page.locator(".chapters button").nth(10).click();
    await settle(page);
    const late = Number(await target());

    expect(late).toBeGreaterThan(early);
  });

  /**
   * Regression: the pour used to stop dead.
   *
   * Grains are emitted just under the neck, and a grain that spawns below the pile's surface
   * counts as landed on its first step. With the inherited 56° angle of repose the cone's peak
   * passed the neck at around 60% full — so from the middle of the reel onward the hourglass
   * was a still image, FLOW pinned at zero, on five of the twelve chapters.
   *
   * Nothing caught it because nothing measured it. This is the check that would have.
   */
  test("the pour never stalls, at any fill level", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const flow = async () => Number(await page.locator(".telemetry .tel-grid dd").first().textContent());
    const fill = async () => Number(await page.locator(".telemetry .tel-grid dd").nth(1).textContent());

    // Sample across the reel, including the late chapters where the glass is nearly full.
    for (const chapter of [1, 4, 7, 9, 10]) {
      await page.locator(".chapters button").nth(chapter).click();
      await settle(page);
      // Let the surge decay so this measures the resting stream, not the post-cut burst.
      await page.waitForTimeout(1400);

      expect(await flow(), `chapter ${chapter} (fill ${await fill()}) has no grains in flight`)
        .toBeGreaterThan(0);
    }
  });

  test("it steps aside on the bookends, where the glass owns the frame", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await expect(page.locator(".telemetry")).toHaveCSS("opacity", "0");

    await page.locator(".chapters button").nth(1).click();
    await settle(page);
    await expect(page.locator(".telemetry")).toHaveCSS("opacity", "1");
  });

  test("resetting the flow restarts the pour", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    // SRG is the post-cut surge; it decays to zero and the reset drives it back up.
    const surge = () => page.locator(".telemetry .tel-grid dd").nth(5).textContent();
    await page.waitForTimeout(1600);
    expect(Number(await surge())).toBeLessThan(0.5);

    await page.locator(".tel-reset").click();
    await page.waitForTimeout(200);
    expect(Number(await surge())).toBeGreaterThan(0.3);
  });
});

test.describe("the room and the frame", () => {
  test("the wireframe room is drawn", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);
    await expect(page.locator(".grid-room")).toBeVisible();

    // Not blank: some pixel in the canvas differs from a cleared one.
    const painted = await page.locator(".grid-room").evaluate((c) => {
      const canvas = c as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 0) return true;
      return false;
    });
    expect(painted).toBe(true);
  });

  test("the ghost word names the chapter, and stands down on the bookends", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);
    await expect(page.locator('.scene[data-live="true"] .ghost')).toHaveText("Awards");

    await page.goto("/");
    await settle(page);
    await expect(page.locator('.scene[data-live="true"] .ghost')).toHaveCount(0);
  });

  test("framed panels carry registration marks", async ({ page }) => {
    // Scoped to the live scene: every chapter stays mounted, so both wall scenes have a
    // focus panel and an unscoped selector would count the off-screen one too.
    await page.goto("/#awards");
    await settle(page);
    await expect(page.locator('.scene[data-live="true"] .focus .regmarks')).toHaveCount(1);

    await page.goto("/#metrics");
    await settle(page);
    await expect(page.locator('.scene[data-live="true"] .mpanel .regmarks')).toHaveCount(3);
  });
});
