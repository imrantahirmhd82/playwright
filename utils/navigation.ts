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
  /one moment|just a moment|attention required|checking your browser|please wait|warning: security risk|secure connection failed|server not found|problem loading page|this site can't be reached|hmm, we're having trouble finding that site|did not connect/i;

/**
 * Markers that only appear in the body of browser or Cloudflare error documents.
 * The title check alone cannot catch them: Firefox serves its network/TLS
 * failures (observed: PR_END_OF_FILE_ERROR) with the generic "Warning: Security
 * Risk" title, and Cloudflare 5xx pages keep a normal-looking title such as
 * "automationexercise.com | 520: Web server is returning an unknown error".
 */
const unavailablePageTextPattern =
  /under heavy load|queue full|secure connection failed|pr_end_of_file_error|error code: 5\d\d|web server is returning an unknown error|unknown connection issue between cloudflare and the origin|bad gateway|service temporarily unavailable/i;

async function isUnavailablePage(page: Page): Promise<boolean> {
  return page
    .getByText(unavailablePageTextPattern)
    .first()
    .isVisible({ timeout: 1500 })
    .catch(() => false);
}

/** True when the loaded document is the real site, not an interstitial/error page. */
async function isRealPage(page: Page): Promise<boolean> {
  if (page.isClosed()) {
    return false;
  }
  const title = (await page.title().catch(() => '')).trim();
  if (!title || interstitialTitlePattern.test(title)) {
    return false;
  }
  return !(await isUnavailablePage(page));
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