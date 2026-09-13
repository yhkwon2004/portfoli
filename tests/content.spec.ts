import { expect, test, type Page } from "@playwright/test";

const settle = (page: Page) => page.waitForTimeout(1200);

/**
 * These assert the *figures*, because every one of them is derived from the records rather
 * than written into the markup. If a record is added or removed and a number here stops
 * matching, that is the derivation breaking — not the test being stale.
 */
test.describe("derived figures", () => {
  test("the profile counts match the record set", async ({ page }) => {
    await page.goto("/#profile");
    await settle(page);

    const stats = page.locator(".stat-row .stat b");
    await expect(stats.nth(0)).toHaveText("35"); // awards
    await expect(stats.nth(1)).toHaveText("35"); // projects
    await expect(stats.nth(2)).toHaveText("5"); // certifications
    await expect(stats.nth(3)).toHaveText("5"); // roles
    // Three strongest works beside the three highest honours.
    await expect(page.locator(".picks .pick")).toHaveCount(6);
  });

  test("the award legend sums to the wall", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);

    const counts = await page.locator(".s-awards .legend b i").allTextContents();
    const total = counts.reduce((sum, n) => sum + Number(n), 0);
    expect(total).toBe(35);
  });

  test("the metrics scene publishes a table view for every chart", async ({ page }) => {
    await page.goto("/#metrics");
    await settle(page);

    const tables = page.locator(".s-metrics table");
    await expect(tables).toHaveCount(3);

    // Each plot must actually point at its table, or `role="img"` is an empty promise.
    const plots = page.locator('.s-metrics [role="img"][aria-describedby]');
    await expect(plots).toHaveCount(3);

    // Attribute selector rather than an id selector: React's useId produces ids containing
    // «:», which are legal in HTML but need escaping in a CSS selector — and CSS.escape is a
    // browser API that does not exist in the Node process running this test.
    for (const id of await plots.evaluateAll((els) => els.map((e) => e.getAttribute("aria-describedby")))) {
      expect(id).toBeTruthy();
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    }
  });

  test("the metrics figures match the records", async ({ page }) => {
    await page.goto("/#metrics");
    await settle(page);

    // Output per year: 2023 → 13, 2024 → 23, 2025 → 26, 2026 → 8.
    await expect(page.locator(".mcol .mtotal").nth(0)).toHaveText("13");
    await expect(page.locator(".mcol .mtotal").nth(1)).toHaveText("23");
    await expect(page.locator(".mcol .mtotal").nth(2)).toHaveText("26");
    await expect(page.locator(".mcol .mtotal").nth(3)).toHaveText("8");

    // The unflattering number is on screen, not only in the data.
    await expect(page.locator(".mstat b")).toHaveText("69 / 90");
  });

  test("the capability map never claims a skill nothing proves", async ({ page }) => {
    await page.goto("/#skills");
    await settle(page);

    const counts = await page.locator(".chip i").allTextContents();
    expect(counts.length).toBeGreaterThan(0);
    for (const n of counts) expect(Number(n)).toBeGreaterThan(0);
  });
});

test.describe("static output", () => {
  test("all twelve chapters are in the HTML before any script runs", async ({ page }) => {
    // JavaScript off: what a crawler, or a visitor on a failed bundle, actually receives.
    await page.context().addInitScript(() => {});
    const response = await page.request.get("/");
    const html = await response.text();

    expect(html).toContain("권용현");
    expect((html.match(/class="scene /g) ?? []).length).toBe(12);
    // A few records from different chapters, to prove it is the content and not just chrome.
    expect(html).toContain("자율주행 프로젝트");
    expect(html).toContain("SWOT");
  });

  test("structured data describes the same record set the page renders", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    expect(blocks.length).toBe(2);

    const person = JSON.parse(blocks[0]![1]!);
    expect(person["@type"]).toBe("Person");
    expect(person.award).toHaveLength(35);
    expect(person.hasCredential).toHaveLength(5);

    const works = JSON.parse(blocks[1]![1]!);
    expect(works.mainEntity.itemListElement).toHaveLength(35);
  });
});
