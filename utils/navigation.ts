import { Page } from '@playwright/test';
import { closeVisibleAd } from './adHandler';

/**
 * automationexercise.com intermittently responds with a "This website is under
 * heavy load (queue full)" page (which has an empty document title), and CI
 * runners are commonly served a bot-check interstitial titled
 * "One moment, please..." instead of the real page. These helpers navigate and
 * retry until the real page is served.
 */
const interstitialTitlePattern =
  /one moment|just a moment|attention required|checking your browser|please wait/i;

async function isHeavyLoadPage(page: Page): Promise<boolean> {
  return page
    .getByText(/under heavy load|queue full/i)
    .first()
    .isVisible({ timeout: 1500 })
    .catch(() => false);
}

/** True when the loaded document looks like the real site rather than an interstitial. */
async function isRealPage(page: Page): Promise<boolean> {
  if (page.isClosed()) {
    return false;
  }
  const title = (await page.title().catch(() => '')).trim();
  if (!title || interstitialTitlePattern.test(title)) {
    return false;
  }
  return !(await isHeavyLoadPage(page));
}

/**
 * Polls briefly so interstitials that resolve on their own (bot checks, queue
 * pages) do not trigger a pointless reload.
 */
async function waitForRealPage(page: Page, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  do {
    if (await isRealPage(page)) {
      return true;
    }
    await page.waitForTimeout(500).catch(() => undefined);
  } while (Date.now() < deadline && !page.isClosed());
  return false;
}

export async function gotoWithRetry(page: Page, url: string, attempts = 4): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await closeVisibleAd(page);

    // Give self-resolving interstitials (bot checks, queue pages) time to
    // settle before reloading.
    if (await waitForRealPage(page, 8000)) {
      return;
    }
    await page.waitForTimeout(2000).catch(() => undefined);
  }

  // Final attempt so the caller sees the real assertion failure if still unready.
  await page.goto(url).catch(() => undefined);
  await closeVisibleAd(page);
}