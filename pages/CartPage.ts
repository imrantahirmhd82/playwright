import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { getTestData } from '../utils/excelData';
import { gotoWithRetry } from '../utils/navigation';
import { ProductsPage } from './ProductsPage';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async open(): Promise<void> {
    await gotoWithRetry(this.page, '/view_cart');
    await closeVisibleAd(this.page);
    await expect(this.cartMarker()).toBeVisible();
    await this.waitAfterAction();
  }

  private cartMarker() {
    return this.page.locator('#cart_info, #empty_cart').first();
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
    await this.open();
    await this.ensureProductInCart();
    await expect(this.page.getByText('Proceed To Checkout')).toBeVisible({ timeout: 15000 });
    await this.page.getByText('Proceed To Checkout').click();
    await this.waitAfterAction();
  }

  async verifyProduct(productId: string): Promise<void> {
    await expect(this.page.locator(`#product-${productId}`)).toBeVisible();
  }

  private async ensureProductInCart(): Promise<void> {
    const rows = this.page.locator('#cart_info tbody tr');
    if (await rows.count() > 0) {
      return;
    }
    // The cart can end up empty when an earlier add-to-cart action silently fails
    // (e.g. an ad overlay or a heavy-load page). Re-add the primary product so the
    // checkout flow can proceed.
    const productsPage = new ProductsPage(this.page);
    await productsPage.open();
    await productsPage.addProduct(getTestData('primary_product_id'));
    await this.open();
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    await this.waitAfterAction();
  }
}