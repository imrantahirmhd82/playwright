import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { gotoWithRetry } from '../utils/navigation';
import { BasePage } from './BasePage';
import { getTestData } from '../utils/excelData';

export class CheckoutPage extends BasePage {
  async proceedFromCart(): Promise<void> {
    await this.page.getByText('Proceed To Checkout').click();
    await this.waitAfterAction();
  }

  async expectReview(productId = '1'): Promise<void> {
    await expect(this.page).toHaveURL(/automationexercise\.com\/checkout/);
    await expect(this.page.getByText('Address Details')).toBeVisible();
    await expect(this.page.getByText('Review Your Order')).toBeVisible();
    await expect(this.page.locator(`#product-${productId}`)).toBeVisible();
  }

  async placeOrder(): Promise<void> {
    await closeVisibleAd(this.page);
    const placeOrderLink = this.page.getByRole('link', { name: /Place Order/i });
    // The "Proceed To Checkout" click can be hijacked by an ad/bot-check
    // interstitial, in which case the checkout page never opens. Navigate
    // directly when the Place Order link is missing so the flow can continue.
    if (!(await placeOrderLink.isVisible().catch(() => false))) {
      await gotoWithRetry(this.page, '/checkout');
      await closeVisibleAd(this.page);
    }
    await expect(placeOrderLink).toBeVisible({ timeout: 15000 });
    await placeOrderLink.click();

    // The payment page can also be replaced by an interstitial; without this
    // recovery `pay()` waits forever for the card form (CI: Test Case 24).
    const paymentForm = this.page.locator('[data-qa="name-on-card"]');
    const formShown = await paymentForm
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!formShown) {
      await gotoWithRetry(this.page, '/payment');
      await closeVisibleAd(this.page);
    }
    await expect(paymentForm).toBeVisible({ timeout: 15000 });
    await this.waitAfterAction();
  }

  async pay(): Promise<void> {
    await this.page.locator('[data-qa="name-on-card"]').fill(getTestData('card_name'));
    await this.page.locator('[data-qa="card-number"]').fill(getTestData('card_number'));
    await this.page.locator('[data-qa="cvc"]').fill(getTestData('card_cvc'));
    await this.page.locator('[data-qa="expiry-month"]').fill(getTestData('card_expiry_month'));
    await this.page.locator('[data-qa="expiry-year"]').fill(getTestData('card_expiry_year'));
    await closeVisibleAd(this.page);
    await this.page.getByRole('button', { name: /Pay and Confirm Order/i }).click();
    await this.waitAfterAction();
  }

  async downloadInvoice(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('link', { name: /Download Invoice/i }).click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }
}
