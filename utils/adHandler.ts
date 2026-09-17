import { Page } from '@playwright/test';

const closeButtonSelector =
  '[aria-label="Close"], [title="Close"], .close, .close-button, button:has-text("Close")';

export async function closeVisibleAd(page: Page): Promise<void> {
  const closeButtons = page.locator(closeButtonSelector);

  for (let index = 0; index < await closeButtons.count(); index++) {
    const closeButton = closeButtons.nth(index);
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click({ force: true }).catch(() => undefined);
      return;
    }
  }
}

export function installAdCloser(page: Page): void {
  // Ads can appear after navigation; keep cleanup non-blocking for every test.
  page.on('load', () => {
    void closeVisibleAd(page);
  });
}
