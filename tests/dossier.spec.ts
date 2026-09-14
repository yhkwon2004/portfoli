import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1200);
const openDossier = (page: Page) => page.locator('.dossier[data-open="true"]');

/** Open the awards wall and click its first tile. */
async function openFirstAward(page: Page) {
  await page.goto("/#awards");
  await settle(page);
  await page.locator(".wall-awards .cell").first().click();
  await expect(openDossier(page)).toBeVisible();
}

test.describe("the dossier", () => {
  test("opens from a tile and shows the full record", async ({ page }) => {
    await openFirstAward(page);

    const sheet = openDossier(page);
    await expect(sheet.locator("h2")).toBeVisible();
    await expect(sheet.locator(".dpos")).toContainText("/ 35");
  });

  test("steps through the whole set without closing", async ({ page }) => {
    await openFirstAward(page);
    const sheet = openDossier(page);

    await expect(sheet.locator(".dpos")).toContainText("01 / 35");
    // The first record has nothing before it.
    await expect(sheet.locator('button[aria-label="이전 기록"]')).toBeDisabled();

    await sheet.locator('button[aria-label="다음 기록"]').click();
    await expect(sheet.locator(".dpos")).toContainText("02 / 35");

    await page.keyboard.press("ArrowRight");
    await expect(sheet.locator(".dpos")).toContainText("03 / 35");

    await page.keyboard.press("ArrowLeft");
    await expect(sheet.locator(".dpos")).toContainText("02 / 35");

    // Stepping records must never move the chapter underneath.
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-awards/);
  });

  test("Escape closes it and focus returns to the tile that opened it", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const tile = page.locator(".wall-awards .cell").nth(3);
    await tile.focus();
    await tile.press("Enter");
    await expect(openDossier(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".dossier")).toHaveAttribute("data-open", "false");

    // Focus restoration is what makes keyboard use of the wall bearable — without it focus
    // lands back at the top of the document after every record.
    await expect(tile).toBeFocused();
  });

  test("holds Tab inside the sheet", async ({ page }) => {
    await openFirstAward(page);
    const sheet = openDossier(page);

    // Walk far enough to have wrapped at least once.
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");

    const inside = await sheet.evaluate((el) => el.contains(document.activeElement));
    expect(inside).toBe(true);
  });

  test("the closed sheet is inert — its controls are not tabbable", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await expect(page.locator(".dossier")).toHaveAttribute("data-open", "false");
    // `inert` keeps the closed dialog out of the tab order and the a11y tree entirely.
    await expect(page.locator(".dossier")).toHaveAttribute("inert", "");
  });

  test("closing returns to the chapter, not to the top of the reel", async ({ page }) => {
    await page.goto("/#projects/project-autonomous");
    await settle(page);
    await expect(openDossier(page)).toBeVisible();

    await page.locator('.dossier .bar-top button').first().click();
    await expect(page.locator(".dossier")).toHaveAttribute("data-open", "false");
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-projects/);
  });

  test("a capability chip opens the work that proves it", async ({ page }) => {
    await page.goto("/#skills");
    await settle(page);

    await page.locator(".chip").first().click();
    const sheet = openDossier(page);
    await expect(sheet).toBeVisible();
    // The chip opens a real piece of work, and a piece of work belongs to the works set — so
    // you can keep stepping from wherever the chip dropped you rather than being marooned on
    // one record.
    await expect(sheet.locator(".dpos")).toContainText("/ 35");
  });
});

test.describe("the walls", () => {
  test("both chapters reach all 35 records", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);
    await expect(page.locator(".wall-awards .cell")).toHaveCount(35);

    // Works dropped the tile grid for one project at a time; the scale along the bottom is
    // what still reaches any of the 35 directly, so it is what has to be complete.
    await page.goto("/#projects");
    await settle(page);
    await expect(page.locator(".s-projects .wtick")).toHaveCount(35);
  });

  test("arrow keys move focus around the tile grid", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const tiles = page.locator(".wall-awards .cell");
    await tiles.first().focus();

    await page.keyboard.press("ArrowRight");
    await expect(tiles.nth(1)).toBeFocused();

    // Down moves by one visual row. At 1440px the wall is 7 columns wide.
    await page.keyboard.press("ArrowDown");
    await expect(tiles.nth(8)).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(tiles.nth(1)).toBeFocused();

    // Navigating the grid must not also change the chapter.
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-awards/);
  });

  test("the works stage follows the tick under the pointer", async ({ page }) => {
    await page.goto("/#projects");
    await settle(page);

    await page.locator(".s-projects .wtick").nth(4).hover();
    await expect(page.locator(".s-projects .wm-pos")).toContainText("05 / 35");
    await expect(page.locator(".s-projects .wtick").nth(4)).toHaveAttribute("aria-current", "true");
    // The plates are the work under the pointer, and there is exactly one near plate.
    await expect(page.locator(".s-projects .plate-near")).toHaveCount(1);
  });
});
