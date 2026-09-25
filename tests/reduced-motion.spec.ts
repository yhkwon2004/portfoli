import { expect, test } from "@playwright/test";
import { jump, visit } from "./helpers";

/*
 * Run by the "reduced-motion" project only (playwright.config.ts), with the OS setting on.
 * This is a different path through the code, not a cosmetic variant: no smooth scroll, no
 * WebGL, no autoplaying video, no counter — and nothing may be left hidden behind an
 * animation that will now never run.
 */
test.describe("with reduced motion", () => {
  test("motion is off, and the switch says why it cannot be turned on", async ({ page }) => {
    await visit(page);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    const sw = page.getByRole("switch");
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(sw).toHaveAttribute("title", /.+/);
  });

  test("the opening counter never plays", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.motion !== undefined);
    await expect(page.locator(".loader")).toHaveCount(0);
  });

  test("nothing is left invisible: every heading is shown at once", async ({ page }) => {
    await visit(page);
    for (const id of ["ai", "skills", "works", "awards", "journey", "contact"]) {
      await jump(page, id);
      const h = page.locator(`#${id} h2`).first();
      await expect(h).toHaveCSS("opacity", "1");
    }
  });

  test("stages hold one still frame; nothing autoplays", async ({ page }) => {
    await visit(page);
    await jump(page, "ai", 0.05);
    const frames = page.locator("#ai .case-frame");
    for (const f of await frames.all()) await expect(f).toHaveAttribute("data-mode", "poster");
    await expect(page.locator("#ai video")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);

    await visit(page, "/#work/project-ai-airsim");
    await expect(page.locator(".dossier .dos-media img")).toHaveAttribute("src", /drive-poster\.webp$/);
    await expect(page.locator(".dossier video")).toHaveCount(0);
  });

  test("figures are written out in full, not counted up", async ({ page }) => {
    await visit(page);
    const dd = page.locator(".hero-stats dd").first();
    await expect(dd).toHaveText(/^\d+$/);
    expect(Number(await dd.textContent())).toBeGreaterThan(0);
  });
});
