import { expect, Locator, Page } from '@playwright/test';
import { closeVisibleAd } from './adHandler';

/**
 * Click an "Add to cart" control and dismiss the confirmation modal.
 *
 * The modal only appears after the add-to-cart request succeeds, so waiting for
 * it also guarantees the item reached the cart before the caller navigates away
 * (an early navigation aborts the request and leaves the cart empty).
 *
 * Returns false when no confirmation showed. That is deliberately not a failure:
 * the storefront's click handler is not always bound when a page is used straight
 * after `domcontentloaded` (the first click is then a no-op - observed in Test
 * Case 16), and the callers that depend on the item verify the cart contents
 * themselves (see CartPage.ensureProductInCart()).
 */
export async function addToCartAndCloseModal(
  page: Page,
  addToCartButton: Locator,
  attempts = 2
): Promise<boolean> {
  const modal = page.locator('#cartModal');
  const continueShopping = modal.locator('button.close-modal');

  // A click that produces no confirmation is almost always a handler that was not
  // bound yet, so make sure every script finished loading before the first try.
  await page.waitForLoadState('load').catch(() => undefined);

  for (let attempt = 0; attempt < attempts; attempt++) {
    await closeVisibleAd(page);
    // Retries use force: the point of a retry is the request, not the hit test,
    // which an ad overlay can keep failing.
    await addToCartButton.click({ force: attempt > 0 }).catch(() => undefined);

    const confirmed = await expect(modal)
      .toHaveClass(/show/, { timeout: attempt === 0 ? 10000 : 5000 })
      .then(() => true)
      .catch(() => false);
    if (!confirmed) {
      continue;
    }

    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click({ force: true });
      await expect(modal).not.toHaveClass(/show/).catch(() => undefined);
    }
    await page.waitForTimeout(400);
    return true;
  }

  return false;
}
