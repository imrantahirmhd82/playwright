/// <reference types="node" />
import { defineConfig } from '@playwright/test';

export default defineConfig({

  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'https://automationexercise.com',
    headless: !process.env.CI,
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