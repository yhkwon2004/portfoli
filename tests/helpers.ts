import type { Page } from "@playwright/test";

/**
 * Open the page the way a returning visitor sees it: the opening counter plays once per
 * session, so a test that is not about the counter starts after it.
 */
export async function visit(page: Page, path = "/"): Promise<void> {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("portfolio:seen", "1");
    } catch {
      /* private mode */
    }
  });
  await page.goto(path);
  // Hydrated: the motion gate has written its state onto <html>.
  await page.waitForFunction(() => document.documentElement.dataset.motion !== undefined);
}

/**
 * Scroll so a fraction of a section's run is behind the reader — 0 puts its top at the top of
 * the viewport, 1 its bottom at the bottom. Goes through Lenis when it is running, so the
 * smooth scroller and the page agree about where they are.
 */
export async function jump(page: Page, id: string, frac = 0): Promise<void> {
  await page.evaluate(
    ([id, frac]) => {
      const el = document.getElementById(id as string);
      if (!el) throw new Error(`no #${id}`);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const y = Math.round(top + Math.max(0, el.offsetHeight - window.innerHeight) * (frac as number));
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    },
    [id, frac] as const,
  );
  // One scroll frame for the bus to publish the new position.
  await page.waitForTimeout(250);
}
