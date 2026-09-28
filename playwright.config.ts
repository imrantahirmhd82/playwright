/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 2,

  timeout: 120000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'https://automationexercise.com',
    // CI runners provide no display, so headless is the default. Run
    // `npx playwright test --headed` locally to watch the browser; the
    // `maximizedWindow` fixture (utils/testFixtures.ts) then fills the screen.
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // `devices` carries its own viewport and is spread last, so the page size
        // must be declared here to take effect. This is the deterministic size for
        // headless/CI runs; headed runs are resized to the screen work area by the
        // `maximizedWindow` fixture, because Firefox has no maximize flag
        // (`--start-maximized` is a Chromium-only launch option).
        viewport: { width: 1280, height: 720 }
      }
    }
  ],

  // In CI the "github" reporter emits per-test ::error:: annotations, which makes
  // failures (and their assertion messages) visible directly from the checks API.
  reporter: process.env.CI ? [['github'], ['html']] : [['html'], ['list']]
});
