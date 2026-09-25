import { expect, test } from "@playwright/test";
import { jump, visit } from "./helpers";

test.describe("the works grid", () => {
  test("shows every work, AI first, and each filter shows exactly the count it claims", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    const cards = page.locator("#works .works-grid > li");
    const filters = page.locator("#works .filters button");
    const all = Number(await filters.first().locator("b").textContent());
    await expect(cards).toHaveCount(all);
    await expect(cards.first()).toHaveAttribute("data-id", "project-ai-evidence");
    await expect(page.locator("#works .works-count")).toContainText(String(all));

    const n = await filters.count();
    expect(n).toBeGreaterThan(2);
    for (let i = 1; i < n; i++) {
      const f = filters.nth(i);
      const claimed = Number(await f.locator("b").textContent());
      await f.click();
      await expect(f).toHaveAttribute("aria-pressed", "true");
      await expect(cards).toHaveCount(claimed);
      await expect(page.locator("#works .works-count")).toContainText(String(claimed));
    }

    await filters.first().click();
    await expect(cards).toHaveCount(all);
  });

  test("AI works show their rendered poster; the rest show their own photographs", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    await expect(page.locator('#works li[data-id="project-ai-airsim"] img')).toHaveAttribute("src", /drive-poster\.webp$/);
    const photo = page.locator("#works li[data-id]:not([data-id^='project-ai']) img").first();
    await expect(photo).toHaveAttribute("src", /\/assets\//);
  });
});
