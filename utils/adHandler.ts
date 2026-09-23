import { Page } from '@playwright/test';

const closeButtonSelector =
  '[aria-label="Close"], [title="Close"], .close, .close-button, button:has-text("Close")';

export async function closeVisibleAd(page: Page): Promise<void> {
  try {
    if (page.isClosed()) {
      return;
    }
    const closeButtons = page.locator(closeButtonSelector);
    const count = await closeButtons.count();
    for (let index = 0; index < count; index++) {
      const closeButton = closeButtons.nth(index);
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click({ force: true }).catch(() => undefined);
        return;
      }
    }
  } catch {
    // Ad/overlay cleanup is best-effort: a navigation or test teardown can
    // invalidate the page mid-call, and that must never fail a test.
  }
}

export function installAdCloser(page: Page): void {
  let running = false;
  // Ads can appear after navigation; keep cleanup non-blocking for every test.
  page.on('load', () => {
    if (running || page.isClosed()) {
      return;
    }
    running = true;
    void closeVisibleAd(page).finally(() => {
      running = false;
    });
  });
}