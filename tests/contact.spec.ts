import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1400);
const card = (page: Page) => page.locator('.contact[data-open="true"] .contact-card');

/**
 * The contact card, opened from the pill in the frame.
 *
 * The pill is the only affordance on this site that is not navigation, and the only way to
 * reach the author from wherever you happen to be. Three things have to hold: it is reachable
 * from every chapter, it behaves like a dialog for the keyboard, and dismissing it does not
 * also move the reel — the arrows and Escape belong to the projector everywhere else.
 */
test.describe("contact", () => {
  test("the pill is in the frame on every chapter, not buried in one", async ({ page }) => {
    for (const id of ["title", "skills", "projects", "credits"]) {
      await page.goto(`/#${id}`);
      await settle(page);
      await expect(page.locator(".contact-pill")).toBeVisible();
    }
  });

  test("opens a dialog that holds focus and names itself", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);
    await page.locator(".contact-pill").click();

    const sheet = card(page);
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute("aria-modal", "true");
    // Labelled by the name, so a screen reader announces whose card this is.
    await expect(sheet.locator(".contact-name")).toHaveText("권용현");

    // Focus is inside, and Tab keeps it there rather than walking onto the scene behind.
    await expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  });

  test("carries a real address, not a dead form", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);
    await page.locator(".contact-pill").click();

    const links = card(page).locator(".contact-list a");
    await expect(links).not.toHaveCount(0);
    // Every channel has to go somewhere real and open away from the reel.
    for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toMatch(/^(https?:|mailto:|tel:)/);
    }
    await expect(links.first()).toHaveAttribute("rel", /noopener/);
  });

  test("Escape closes it without also stepping the chapter", async ({ page }) => {
    await page.goto("/#skills");
    await settle(page);
    await page.locator(".contact-pill").click();
    await expect(card(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await settle(page);
    await expect(page.locator(".contact")).toHaveAttribute("data-open", "false");
    // The projector must not have seen that keystroke.
    await expect(page.locator('.scene[data-live="true"]')).toHaveClass(/s-skills/);
  });

  test("the closed card is inert — its links are not tabbable", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);
    await expect(page.locator(".contact")).toHaveAttribute("data-open", "false");

    /*
     * Asked directly, rather than by measuring layout: `visibility: hidden` leaves
     * `offsetParent` set, so counting "visible" descendants says nothing about whether the
     * keyboard can reach them. What makes them unreachable is `inert` on the container — so
     * the test is whether focus actually refuses to land on one.
     */
    await expect(page.locator(".contact")).toHaveAttribute("inert", "");
    const took = await page.locator(".contact-list a").first().evaluate((el) => {
      (el as HTMLElement).focus();
      return document.activeElement === el;
    });
    expect(took).toBe(false);
  });
});
