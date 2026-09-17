import { defineConfig } from '@playwright/test';

export default defineConfig({

  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'https://automationexercise.com',
    headless: false,
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