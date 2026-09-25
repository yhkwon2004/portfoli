import { expect, test } from "@playwright/test";
import { jump, visit } from "./helpers";

const dialog = (page: import("@playwright/test").Page) => page.locator(".dossier");

test.describe("the record sheet", () => {
  test("a work link opens that work", async ({ page }) => {
    await visit(page, "/#work/project-ai-airsim");
    await expect(dialog(page)).toHaveAttribute("data-open", "true");
    await expect(dialog(page).locator("h2")).toContainText("AirSim");
    await expect(dialog(page).locator(".dos-meta")).toContainText("장려상");
  });

  test("the previous site's links still resolve", async ({ page }) => {
    await visit(page, "/#projects/project-ai-pose");
    await expect(dialog(page)).toHaveAttribute("data-open", "true");
    await expect(dialog(page).locator("h2")).toContainText("포즈");
  });

  test("an award link opens the award with its certificate", async ({ page }) => {
    await visit(page);
    const id = await page.locator("#awards li[data-id]").first().getAttribute("data-id");
    await visit(page, `/#award/${id}`);
    await expect(dialog(page)).toHaveAttribute("data-open", "true");
    await expect(dialog(page).locator(".dos-media.is-cert img")).toBeVisible();
  });

  test("a link to a record that does not exist opens nothing", async ({ page }) => {
    await visit(page, "/#work/not-a-record");
    await page.waitForTimeout(400);
    await expect(dialog(page)).toHaveAttribute("data-open", "false");
  });

  test("an AI work plays its render, labelled, with the diagram and three concept stills", async ({ page }) => {
    await visit(page, "/#work/project-ai-evidence");
    const d = dialog(page);
    await expect(d.locator(".dos-media video")).toHaveAttribute("src", /evidence\.webm$/);
    await expect(d.locator(".dos-concept")).toContainText("3D 콘셉트 시각화");
    await expect(d.locator(".dos-diagram")).toBeVisible();
    await expect(d.locator(".dos-steps-list li")).toHaveCount(4);
    const stills = d.locator(".dos-gallery img");
    await expect(stills).toHaveCount(3);
    for (const img of await stills.all()) await expect(img).toHaveAttribute("alt", /학교폭력/);
  });

  test("← → step through the set, Escape closes and clears the link", async ({ page }) => {
    await visit(page, "/#work/project-ai-evidence");
    const d = dialog(page);
    await expect(d.locator(".dos-pos")).toContainText("01 /");
    await expect(d.getByRole("button", { name: "이전 기록" })).toBeDisabled();

    await page.keyboard.press("ArrowRight");
    await expect(d.locator(".dos-pos")).toContainText("02 /");
    await expect(page).toHaveURL(/#work\/project-ai-airsim$/);

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/#work\/project-ai-evidence$/);

    await page.keyboard.press("Escape");
    await expect(d).toHaveAttribute("data-open", "false");
    await expect(page).not.toHaveURL(/#work\//);
  });

  test("opening a card holds focus in the sheet and gives it back on close", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    const card = page.locator("#works li[data-id] button").first();
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toHaveAttribute("data-open", "true");
    await expect(page.locator(".dos-close")).toBeFocused();

    // Tab cycles inside; it never reaches the page behind.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest(".dossier"))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveAttribute("data-open", "false");
    await expect(card).toBeFocused();
  });

  test("Back closes a sheet opened from the page", async ({ page }) => {
    await visit(page);
    await jump(page, "works");
    await page.locator("#works li[data-id] button").first().click();
    await expect(dialog(page)).toHaveAttribute("data-open", "true");
    await page.goBack();
    await expect(dialog(page)).toHaveAttribute("data-open", "false");
  });
});
