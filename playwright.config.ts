/// <reference types="node" />
import { defineConfig } from '@playwright/test';

export default defineConfig({

  testDir: './tests',
  workers: 1,
  // Long end-to-end flows against a live site can be slow; keep a generous
  // global budget and retry only in CI to absorb network/ad flakiness.
  timeout: 120000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'https://automationexercise.com',
    // CI runners do not provide an X server, so the suite must never launch a headed browser.
    headless: true,
    viewport: null,
    launchOptions: {
      args: ['--start-maximized']
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },

  // In CI the "github" reporter emits per-test ::error:: annotations, which makes
  // failures (and their assertion messages) visible directly from the checks API.
  reporter: process.env.CI ? [['github'], ['html']] : [['html'], ['list']]
});
