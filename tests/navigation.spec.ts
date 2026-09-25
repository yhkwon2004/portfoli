import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test.describe("navigation", () => {
  test("the nav lists the sections in the order the page runs", async ({ page }) => {
    await visit(page);
    const hrefs = await page.locator(".nav-pill a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(["#ai", "#skills", "#works", "#awards", "#journey", "#contact"]);
    // …and that is the document order of the sections themselves.
    const order = await page.evaluate(() =>
      ["ai", "skills", "works", "awards", "journey", "contact"].map((id) => document.getElementById(id)!.offsetTop),
    );
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test("a nav link scrolls to its section and marks itself current", async ({ page }) => {
    await visit(page);
    await page.locator('.nav-pill a[href="#awards"]').click();
    // It lands just under the floating nav (the page's scroll-padding), not behind it.
    await expect
      .poll(() => page.evaluate(() => document.getElementById("awards")!.getBoundingClientRect().top), { timeout: 8000 })
      .toBeLessThan(120);
    expect(await page.evaluate(() => document.getElementById("awards")!.getBoundingClientRect().top)).toBeGreaterThan(-10);
    await expect(page.locator('.nav-pill a[href="#awards"]')).toHaveAttribute("aria-current", "true");
  });

  test("the skip link goes straight to the content", async ({ page }) => {
    await visit(page);
    await page.keyboard.press("Tab");
    const skip = page.locator("a.skip");
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main");
  });
});

test.describe("language", () => {
  test("switches to English and back, keeping the choice in the URL and across visits", async ({ page }) => {
    await visit(page);
    await page.locator('.nav-lang button[lang="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveAttribute("aria-label", /Yonghyun Kwon/);
    await expect(page.locator("h1")).toHaveAttribute("aria-label", /working AI/);
    await expect(page).toHaveURL(/\?lang=en/);

    // A fresh visit to the bare URL remembers it.
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.locator('.nav-lang button[lang="ko"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(page).not.toHaveURL(/lang=/);
  });

  test("?lang=en opens in English", async ({ page }) => {
    await visit(page, "/?lang=en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('.nav-lang button[lang="en"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#ai .case-note").first()).toContainText("concept visualisation");
  });
});

test.describe("the motion switch", () => {
  test("stops everything that moves by itself, and remembers", async ({ page }) => {
    await visit(page);
    const sw = page.getByRole("switch");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await expect(sw).toHaveAttribute("aria-checked", "true");

    await sw.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(sw).toHaveAttribute("aria-checked", "false");
    // Stages fall back to their still frame.
    await expect(page.locator("#ai .case-frame").first()).toHaveAttribute("data-mode", "poster");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await page.getByRole("switch").click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
  });
});
