import { expect, Page } from '@playwright/test';
import { closeVisibleAd } from './adHandler';

/**
 * automationexercise.com intermittently responds with a "This website is under
 * heavy load (queue full)" page (which has an empty document title). These
 * helpers navigate and retry until the real page is served.
 */
async function isHeavyLoadPage(page: Page): Promise<boolean> {
  return page
    .getByText(/under heavy load|queue full/i)
    .first()
    .isVisible({ timeout: 1500 })
    .catch(() => false);
}

export async function gotoWithRetry(page: Page, url: string, attempts = 4): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await closeVisibleAd(page);

    if (await isHeavyLoadPage(page)) {
      await page.waitForTimeout(2000);
      continue;
    }

    const ready = await expect(page)
      .toHaveTitle(/\S/, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (ready) {
      return;
    }
    await page.waitForTimeout(2000);
  }

  // Final attempt so the caller sees the real assertion failure if still unready.
  await page.goto(url).catch(() => undefined);
  await closeVisibleAd(page);
}