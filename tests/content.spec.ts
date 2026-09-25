import { expect, test } from "@playwright/test";
import { visit } from "./helpers";

test.describe("the page", () => {
  test("opens in Korean, with the name and the claim as its one h1", async ({ page }) => {
    await visit(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveAttribute("aria-label", /권용현/);
    await expect(h1).toHaveAttribute("aria-label", /동작하는 AI로/);
  });

  test("carries every section, each labelled by its own heading", async ({ page }) => {
    await visit(page);
    for (const id of ["about", "ai", "skills", "works", "awards", "journey", "principles", "contact"]) {
      const section = page.locator(`section#${id}`);
      await expect(section, id).toHaveCount(1);
      const labelledBy = await section.getAttribute("aria-labelledby");
      expect(labelledBy, id).toBeTruthy();
      await expect(page.locator(`#${labelledBy}`), id).toHaveCount(1);
    }
  });

  test("is fully present as text in the static HTML, before any script runs", async ({ request }) => {
    const html = await (await request.get("/")).text();
    // The three AI works lead, and every one of them is in the document as text.
    expect(html).toContain("학교폭력 증거 정리 AI 서비스");
    expect(html).toContain("AirSim 자율주행 시뮬레이터");
    expect(html).toContain("실시간 포즈");
    // Honours as the author states them.
    expect(html).toContain("HUSS AI 경진대회");
    expect(html).toContain("미래자동차 경진대회");
  });

  test("describes itself to crawlers and link previews", async ({ page }) => {
    await visit(page);
    await expect(page).toHaveTitle(/AI Portfolio/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.png/);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.length).toBeGreaterThan(0);
    const types = ld.map((s) => JSON.parse(s)["@type"]);
    expect(types).toContain("Person");
  });

  test("ships the OG card and every rendered medium it links to", async ({ request }) => {
    for (const path of [
      "/og.png",
      "/media/hero-poster.webp",
      ...["evidence", "drive", "pose"].flatMap((k) => [
        `/media/ai/${k}.webm`,
        `/media/ai/${k}-poster.webp`,
        `/media/ai/${k}-1.webp`,
        `/media/ai/${k}-2.webp`,
        `/media/ai/${k}-3.webp`,
      ]),
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect((await res.body()).length, path).toBeGreaterThan(2000);
    }
  });

  test("keeps the render harness out of search", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/render\//);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/render");
  });
});
