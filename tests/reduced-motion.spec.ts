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
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-profile/);
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
