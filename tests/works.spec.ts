import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1400);

/**
 * 08 — Works, rebuilt as plates hanging in the room.
 *
 * The chapter used to be a 7×5 grid of 90px tiles. What replaced it only earns the change if
 * three things are true: one work holds the frame at a time, the plates are at real depth
 * rather than scaled copies on one plane, and every one of the thirty-five is still reachable
 * directly. Those are the three tests.
 */
test.describe("the works stage", () => {
  test("gives the frame to one work, with its record beside it", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    const stage = page.locator(".s-projects");
    await expect(stage.locator(".wm-title")).toBeVisible();
    await expect(stage.locator(".wm-pos")).toContainText("/ 35");
    // One work means one focusable plate, whatever else is floating behind it.
    await expect(stage.locator(".plate-near")).toHaveCount(1);
    await expect(stage.locator(".plate")).not.toHaveCount(0);
  });

  test("the plates stand at different depths, not on one plane", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    // A work with a gallery, so there is more than one plate to compare.
    await page.locator(".s-projects .wtick").nth(1).hover();
    await settle(page);

    const depths = await page.locator(".s-projects .plate").evaluateAll((els) =>
      els.map((el) => new DOMMatrix(getComputedStyle(el).transform).m43),
    );
    expect(depths.length).toBeGreaterThan(1);
    // If this ever collapses to a single value the parallax has nothing to act on and the
    // whole device is a flat collage.
    expect(new Set(depths.map((d) => Math.round(d))).size).toBeGreaterThan(1);
  });

  test("the cluster turns with the pointer", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    const plates = page.locator(".s-projects .plates");
    const box = await page.locator(".s-projects .worksroom").boundingBox();
    if (!box) throw new Error("no room");

    await page.mouse.move(box.x + box.width * 0.12, box.y + box.height * 0.2);
    await page.waitForTimeout(700);
    const left = await plates.evaluate((el) => getComputedStyle(el).transform);

    await page.mouse.move(box.x + box.width * 0.88, box.y + box.height * 0.8);
    await page.waitForTimeout(700);
    const right = await plates.evaluate((el) => getComputedStyle(el).transform);

    expect(right).not.toBe(left);
  });

  test("every one of the thirty-five is still one click away", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    const ticks = page.locator(".s-projects .wtick");
    await expect(ticks).toHaveCount(35);

    await ticks.nth(20).hover();
    await settle(page);
    await expect(page.locator(".s-projects .wm-pos")).toContainText("21 / 35");

    // And the tick opens the full record, the same as a tile used to.
    await ticks.nth(20).click();
    await expect(page.locator('.dossier[data-open="true"]')).toBeVisible();
  });

  test("the step buttons move the reel and stay inside the chapter", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    const pos = page.locator(".s-projects .wm-pos");
    await expect(pos).toContainText("01 / 35");

    await page.locator('.s-projects button[aria-label="다음 작업"]').click();
    await settle(page);
    await expect(pos).toContainText("02 / 35");

    await page.locator('.s-projects button[aria-label="이전 작업"]').click();
    await settle(page);
    await expect(pos).toContainText("01 / 35");

    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-projects/);
  });

  test("arrow keys walk the scale without changing the chapter", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    const ticks = page.locator(".s-projects .wtick");
    await ticks.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(ticks.nth(1)).toBeFocused();

    await page.keyboard.press("End");
    await expect(ticks.nth(34)).toBeFocused();

    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-projects/);
  });
});
