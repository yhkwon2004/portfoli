import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * The site is a static export, so the tests run against the real built output served as plain
 * files — the same bytes a deploy publishes. `npm test` builds first (see package.json).
 *
 * CHROMIUM_PATH lets an environment that already has a browser point at it instead of
 * downloading one; CI installs its own and leaves the variable unset.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...(process.env.CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] } }
      : {}),
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      // Without this the reduced-motion specs also run here, with motion on, and fail.
      testIgnore: /reduced-motion\.spec\.ts/,
    },
    {
      // The whole site is motion; the reduced-motion path is a different code path, not a
      // cosmetic variant, so it gets its own run.
      name: "reduced-motion",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      },
      testMatch: /reduced-motion\.spec\.ts/,
    },
  ],

  webServer: {
    command: `npx --yes serve -l ${PORT} out`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
