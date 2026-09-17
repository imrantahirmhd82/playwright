import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  async open(): Promise<void> {
    await this.page.goto('/products');
    await closeVisibleAd(this.page);
    await this.verifyTitle();
    await expect(this.page.getByRole('heading', { name: 'ALL PRODUCTS' })).toBeVisible();
    await this.waitAfterAction();
  }

  async addProduct(productId: string): Promise<void> {
    await this.page.locator(`.add-to-cart[data-product-id="${productId}"]`).first().click();
    await this.closeCartModal();
  }

  async addFirstVisibleProduct(): Promise<void> {
    const product = this.page.locator('.features_items .add-to-cart:visible').first();
    await expect(product).toBeVisible();
    await product.click();
    const modal = this.page.locator('#cartModal');
    await expect(modal).toHaveClass(/show/);
    await this.closeCartModal();
  }

  private async closeCartModal(): Promise<void> {
    const modal = this.page.locator('#cartModal');
    const continueShopping = modal.locator('button.close-modal');
    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click({ force: true });
      await expect(modal).not.toHaveClass(/show/);
    }
    await this.waitAfterAction();
  }

  async search(term: string): Promise<void> {
    await this.page.locator('#search_product').fill(term);
    await this.page.locator('#submit_search').click();
    await this.waitAfterAction();
  }

  async openProductDetails(productId: string): Promise<void> {
    await this.page.goto(`/product_details/${productId}`);
    await closeVisibleAd(this.page);
    await expect(this.page.locator('.product-information')).toBeVisible();
    await this.waitAfterAction();
  }

  async openFirstProductDetails(): Promise<void> {
    const productLink = this.page.locator('.features_items a[href^="/product_details/"]:visible').first();
    await expect(productLink).toBeVisible();
    const detailsUrl = await productLink.getAttribute('href');
    await closeVisibleAd(this.page);
    await productLink.click({ force: true });
    if (this.page.url().includes('#google_vignette') && detailsUrl) {
      await this.page.goto(detailsUrl);
    }
    await this.waitAfterAction();
  }

  async openTshirtsCategory(): Promise<void> {
    await this.open();
    await this.page.locator('a[href="#Men"]').click({ force: true });
    await expect(this.page.locator('#Men')).toHaveClass(/in/, { timeout: 10000 });
    await this.page.locator('a[href="/category_products/3"]').click();
    await this.waitAfterAction();
  }

  async openBrand(brand: string): Promise<void> {
    await closeVisibleAd(this.page);
    await this.page.locator(`a[href="/brand_products/${brand}"]`).click();
    await this.waitAfterAction();
  }

  async openCategory(categoryId: string): Promise<void> {
    await this.page.goto(`/category_products/${categoryId}`);
    await closeVisibleAd(this.page);
    await this.waitAfterAction();
  }

  async openFirstVisibleProductDetails(): Promise<void> {
    const productLink = this.page.locator('.features_items a[href^="/product_details/"]:visible').first();
    await expect(productLink).toBeVisible();
    const detailsUrl = await productLink.getAttribute('href');
    await closeVisibleAd(this.page);
    await productLink.click({ force: true });
    if (this.page.url().includes('#google_vignette') && detailsUrl) {
      await this.page.goto(detailsUrl);
    }
    await this.waitAfterAction();
  }
}
