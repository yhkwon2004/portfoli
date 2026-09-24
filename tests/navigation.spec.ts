import { expect, test, type Page } from "@playwright/test";

/** Wait for the scene machine to settle: the cut takes 620ms and the rise another ~350ms. */
const settle = (page: Page) => page.waitForTimeout(1200);

const liveScene = (page: Page) => page.locator('.scene[data-live="true"]');

test.describe("the projector", () => {
  test("opens on the title chapter, in Korean", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(liveScene(page)).toHaveClass(/s-title/);
    await expect(page.locator("h1.name")).toHaveText("권용현");
    // The rail marks exactly one chapter as current.
    await expect(page.locator('.chapters button[aria-current="true"]')).toHaveCount(1);
  });

  test("advances and steps back through chapters", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    // The AI works come straight after the title.
    await page.locator('.nav-btns button[aria-label="다음 장면"]').click();
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-ai/);

    await page.keyboard.press("ArrowDown");
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-profile/);

    await page.keyboard.press("ArrowUp");
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-ai/);
  });

  test("Home and End jump to the bookends", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    await page.keyboard.press("End");
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-credits/);
    // The last chapter disables its own forward button.
    await expect(page.locator('.nav-btns button[aria-label="다음 장면"]')).toBeDisabled();

    await page.keyboard.press("Home");
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-title/);
    await expect(page.locator('.nav-btns button[aria-label="이전 장면"]')).toBeDisabled();
  });

  test("every chapter in the rail is reachable and announces itself", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    const buttons = page.locator(".chapters button");
    const count = await buttons.count();
    expect(count).toBe(13);

    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
      await settle(page);
      await expect(buttons.nth(i)).toHaveAttribute("aria-current", "true");
      // The live region is the only thing that tells a screen reader the scene changed.
      await expect(page.locator('[role="status"]')).toContainText(`${i + 1} / ${count}`);
    }
  });
});

test.describe("deep links", () => {
  test("a chapter fragment opens that chapter", async ({ page }) => {
    await page.goto("/#awards");
    await settle(page);
    await expect(liveScene(page)).toHaveClass(/s-awards/);
  });

  test("a record fragment opens that record's sheet", async ({ page }) => {
    await page.goto("/#projects/project-autonomous");
    await settle(page);

    const dossier = page.locator('.dossier[data-open="true"]');
    await expect(dossier).toBeVisible();
    await expect(dossier.locator("h2")).toHaveText("자율주행 프로젝트");
  });

  test("an unknown fragment falls back to the first chapter rather than breaking", async ({ page }) => {
    await page.goto("/#not-a-chapter/not-a-record");
    await settle(page);

    await expect(liveScene(page)).toHaveClass(/s-title/);
    await expect(page.locator(".dossier")).toHaveAttribute("data-open", "false");
  });

  test("navigating writes the chapter back to the URL", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await page.locator(".chapters button").nth(7).click();
    await settle(page);

    expect(page.url()).toContain("#awards");
  });
});

test.describe("language", () => {
  test("switching to English changes the document language and the URL", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    await page.locator('.lang button[lang="en"]').click();
    await settle(page);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1.name")).toHaveText("Yonghyun Kwon");
    expect(page.url()).toContain("lang=en");
    await expect(page.locator('.lang button[lang="en"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("an untranslated record is labelled as Korean rather than read as English", async ({ page }) => {
    // 33 of the 35 project records have no English text. The EN view shows the Korean and
    // marks it lang="ko" so a screen reader pronounces it correctly — see src/lib/i18n.ts.
    await page.goto("/?lang=en#projects/project-autonomous");
    await settle(page);

    const title = page.locator('.dossier[data-open="true"] h2');
    await expect(title).toHaveAttribute("lang", "ko");
    await expect(title).toHaveText("자율주행 프로젝트");
  });

  test("the choice survives a reload", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    await page.locator('.lang button[lang="en"]').click();
    await settle(page);

    await page.goto("/");
    await settle(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
