import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1200);
const openPanel = (page: Page) => page.locator('.s-ai .aip[data-on="true"]');

/**
 * The AI works, first.
 *
 * The chapter makes four promises: it comes straight after the title and holds the three AI
 * works; the open panel's diagram actually runs, with its captions in step; a finished run
 * hands over to the next work unless someone is looking; and every way in — the title's
 * shortcuts, the tabs, the keyboard — lands on the work it names.
 */
test.describe("the AI chapter", () => {
  test("follows the title, holds the three AI works, and opens on the first", async ({ page }) => {
    await page.goto("/#ai");
    await settle(page);

    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-ai/);
    await expect(page.locator(".s-ai .aip")).toHaveCount(3);
    await expect(openPanel(page)).toHaveCount(1);
    await expect(openPanel(page).locator(".aip-title")).toHaveAttribute("aria-label", "학교폭력 증거 정리 AI 서비스");
    // The honour is stamped on the diagram.
    await expect(openPanel(page).locator(".aip-stamp")).toContainText("전국 2위");
    // Both honours are summarised in the chapter head.
    await expect(page.locator(".s-ai .ai-honors li")).toHaveCount(2);
  });

  test("the open diagram runs, and its steps light up in time with it", async ({ page }) => {
    await page.goto("/#ai");
    await page.waitForTimeout(800);

    const panel = openPanel(page);
    await expect(panel).toHaveAttribute("data-phase", "0");
    // Each beat is a quarter of the nine-second run.
    await page.waitForTimeout(2800);
    await expect(panel).toHaveAttribute("data-phase", "1");
    // The step bars are driven off the same loop position.
    const lp = await panel.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--lp")));
    expect(lp).toBeGreaterThan(0.25);
    expect(lp).toBeLessThan(0.6);
  });

  test("a finished run hands over to the next work", async ({ page }) => {
    test.setTimeout(30_000);
    await page.goto("/#ai");
    await settle(page);
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "0");

    await page.waitForTimeout(9_400);
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "1");
    // The one it left rests on its finished frame, not on whatever frame the run ended on.
    const left = page.locator(".s-ai .aip").nth(0);
    await expect(left.locator(".av-readout")).toHaveText("CHECKED 5/6 · 1 MISSING");
  });

  test("a pointer on the triptych holds the work it is on", async ({ page }) => {
    test.setTimeout(30_000);
    await page.goto("/#ai");
    await settle(page);

    await openPanel(page).locator(".aip-stage").hover();
    await page.waitForTimeout(9_600);
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "0");
  });

  test("a closed panel opens when chosen, and the keyboard walks the tabs", async ({ page }) => {
    await page.goto("/#ai");
    await settle(page);

    await page.locator('.s-ai .aip-tab[data-n="2"]').click();
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "2");
    await expect(openPanel(page).locator(".aip-title")).toHaveAttribute("aria-label", "실시간 포즈 · 구도 생성 서비스");

    const tab0 = page.locator('.s-ai .aip-tab[data-n="0"]');
    await tab0.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('.s-ai .aip-tab[data-n="1"]')).toBeFocused();
    await expect(page.locator('.s-ai .aip-tab[data-n="1"]')).toHaveAttribute("aria-expanded", "true");
    // Walking the tabs is not a cut.
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-ai/);
    // A closed panel's copy is out of reach until it opens.
    await expect(page.locator('.s-ai .aip[data-on="false"] .aip-body[inert]')).toHaveCount(2);
  });

  test("a mouse that comes to rest on a closed panel opens it", async ({ page }) => {
    await page.goto("/#ai");
    await settle(page);

    const box = await page.locator(".s-ai .aip").nth(2).boundingBox();
    if (!box) throw new Error("no panel");
    await page.mouse.move(box.x + box.width / 2, box.y + 60, { steps: 8 });
    await page.waitForTimeout(700);
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "2");
  });

  test("the title card's shortcuts open the chapter on the work they name", async ({ page }) => {
    // Regression: the pointer that pressed the shortcut is left sitting over the triptych, and
    // as the widths animate the first panel slides under it. That used to count as hovering
    // it, and the chapter opened on the first work instead of the one asked for.
    await page.goto("/");
    await settle(page);

    await page.locator(".t-ai button").nth(1).click();
    await settle(page);
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-ai/);
    await expect(openPanel(page).locator(".aip-tab")).toHaveAttribute("data-n", "1");
    await expect(openPanel(page).locator(".aip-stamp")).toContainText("장려상");
    expect(page.url()).toContain("#ai");
  });

  test("the full record opens with the diagram at its head", async ({ page }) => {
    await page.goto("/#ai");
    await settle(page);

    await openPanel(page).locator(".aip-open").click();
    const sheet = page.locator('.dossier[data-open="true"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator("h2")).toHaveText("학교폭력 증거 정리 AI 서비스");
    await expect(sheet.locator(".hero-ai svg.aiv")).toHaveCount(1);
    await expect(sheet.locator(".drank")).toHaveText("전국 2위");
    await expect(sheet.locator(".dhonor")).toContainText("HUSS AI 경진대회");
    // It is a work, so it steps the works set — and leads it.
    await expect(sheet.locator(".dpos")).toContainText("01 / 38");
  });
});
