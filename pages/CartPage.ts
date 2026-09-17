import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async open(): Promise<void> {
    await this.page.goto('/view_cart');
    await closeVisibleAd(this.page);
    await expect(this.page.locator('#cart_info')).toBeVisible();
    await this.waitAfterAction();
  }

  async clear(): Promise<void> {
    await this.open();
    const rows = this.page.locator('#cart_info tbody tr');
    while (await rows.count() > 0) {
      await rows.first().locator('.cart_quantity_delete').click();
      await this.waitAfterAction();
    }
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByText('Proceed To Checkout').click();
    await this.waitAfterAction();
  }

  async verifyProduct(productId: string): Promise<void> {
    await expect(this.page.locator(`#product-${productId}`)).toBeVisible();
  }
}
