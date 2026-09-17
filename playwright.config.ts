/// <reference types="node" />
import { defineConfig } from '@playwright/test';

export default defineConfig({

  testDir: './tests',
  workers: 1,
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

  reporter: [
    ['html']
  ]
});
