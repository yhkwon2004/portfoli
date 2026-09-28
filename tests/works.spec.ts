import { expect, test } from "@playwright/test";
import { jump, visit } from "./helpers";

test.describe("the works", () => {
  test("lead with a few selected pieces, none of them the AI works shown above", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    const picks = page.locator("#works .works-selected > li");
    await expect(picks).toHaveCount(4);
    for (const p of await picks.all()) await expect(p).not.toHaveAttribute("data-id", /^project-ai-|^project-factline$/);
  });

  test("the index lists every work, AI first, and each filter shows exactly the count it claims", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    const rows = page.locator("#works .works-index > li");
    const filters = page.locator("#works .filters button");
    const all = Number(await filters.first().locator("b").textContent());
    await expect(rows).toHaveCount(all);
    await expect(rows.first()).toHaveAttribute("data-id", "project-ai-evidence");
    await expect(page.locator("#works .works-count")).toContainText(String(all));

    const n = await filters.count();
    expect(n).toBeGreaterThan(2);
    for (let i = 1; i < n; i++) {
      const f = filters.nth(i);
      const claimed = Number(await f.locator("b").textContent());
      await f.click();
      await expect(f).toHaveAttribute("aria-pressed", "true");
      await expect(rows).toHaveCount(claimed);
      await expect(page.locator("#works .works-count")).toContainText(String(claimed));
    }

    await filters.first().click();
    await expect(rows).toHaveCount(all);
  });

  test("AI works show their rendered poster; the rest show their own photographs", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    await expect(page.locator('#works .works-index li[data-id="project-ai-airsim"] img')).toHaveAttribute("src", /drive-poster\.webp$/);
    const photo = page.locator("#works .works-selected li[data-id] img").first();
    await expect(photo).toHaveAttribute("src", /\/assets\//);
  });

  test("hovering a row of the index floats its picture beside the pointer", async ({ page }) => {
    await visit(page);
    await jump(page, "works", 0.5);
    const preview = page.locator("#works .preview");
    await expect(preview).toHaveAttribute("data-on", "false");
    const row = page.locator('#works .works-index li[data-id="project-ai-airsim"] .wx-row');
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await expect(preview).toHaveAttribute("data-on", "true");
    await expect(preview.locator("img")).toHaveAttribute("src", /drive-poster\.webp$/);
    await page.mouse.move(2, 2);
    await expect(preview).toHaveAttribute("data-on", "false");
  });
});
