import { expect, test } from "@playwright/test";
import { jump, visit } from "./helpers";

test.describe("the AI case studies", () => {
  test("come first after the introduction, three of them, in rank order", async ({ page }) => {
    await visit(page);
    const cases = page.locator("#ai article.case");
    await expect(cases).toHaveCount(3);
    await expect(cases.nth(0).locator(".case-title")).toHaveAttribute("aria-label", /학교폭력/);
    await expect(cases.nth(1).locator(".case-title")).toHaveAttribute("aria-label", /AirSim/);
    await expect(cases.nth(2).locator(".case-title")).toHaveAttribute("aria-label", /포즈/);
    // The honours sit on the works that won them — and only on those.
    await expect(cases.nth(0).locator(".chip-honor")).toContainText("전국 2위");
    await expect(cases.nth(1).locator(".chip-honor")).toContainText("장려상");
    await expect(cases.nth(2).locator(".chip-honor")).toHaveCount(0);
  });

  test("say plainly that the pictures are concept visualisations", async ({ page }) => {
    await visit(page);
    const notes = page.locator("#ai .case-note");
    await expect(notes).toHaveCount(3);
    for (const n of await notes.all()) await expect(n).toContainText("3D 콘셉트 시각화");
  });

  test("scrolling through a case plays it: the steps light in order and the HUD follows", async ({ page }) => {
    await visit(page);
    const first = page.locator("#ai article.case").first();
    const steps = first.locator(".case-steps li");
    await expect(steps).toHaveCount(4);

    const caseTop = async (frac: number) => {
      await page.evaluate((frac) => {
        const el = document.querySelector<HTMLElement>("#ai article.case")!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const y = top + (el.offsetHeight - window.innerHeight) * frac;
        const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      }, frac);
      await page.waitForTimeout(300);
    };

    await caseTop(0.05);
    await expect(steps.nth(0)).toHaveAttribute("data-on", "true");
    await expect(first.locator(".case-hud-tr")).toContainText("01 / 04");

    await caseTop(0.6);
    await expect(steps.nth(2)).toHaveAttribute("data-on", "true");
    await expect(steps.nth(0)).toHaveAttribute("data-done", "true");
    await expect(first.locator(".case-hud-tr")).toContainText("03 / 04");

    // …and back: the reader sets the pace in both directions.
    await caseTop(0.3);
    await expect(steps.nth(1)).toHaveAttribute("data-on", "true");
    await expect(steps.nth(2)).toHaveAttribute("data-on", "false");
  });

  test("always show something in the stage: a poster, the video, or the live scene", async ({ page }) => {
    await visit(page);
    await jump(page, "ai", 0.05);
    const frame = page.locator("#ai .case-frame").first();
    await expect(frame).toHaveAttribute("data-mode", /^(poster|video|3d)$/);
    // The poster is always underneath, whatever plays over it.
    await expect(frame.locator("img.case-poster")).toHaveAttribute("src", /evidence-poster\.webp$/);
  });

  test("open their full record from the case study", async ({ page }) => {
    await visit(page);
    await jump(page, "ai", 0.08);
    await page.locator("#ai article.case").first().getByRole("button", { name: "케이스 스터디" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("data-open", "true");
    await expect(dialog.locator("h2")).toContainText("학교폭력");
    await expect(page).toHaveURL(/#work\/project-ai-evidence$/);
  });
});
