import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { gotoWithRetry } from '../utils/navigation';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  async open(): Promise<void> {
    await gotoWithRetry(this.page, '/products');
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
    await gotoWithRetry(this.page, `/product_details/${productId}`);
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
      await gotoWithRetry(this.page, detailsUrl);
    }
    await this.waitAfterAction();
  }

  async openTshirtsCategory(): Promise<void> {
    const tshirtsLink = this.page.locator('a[href="/category_products/3"]');
    // The category sidebar is rendered on every page, so only run the full
    // (retried) Products navigation when the link is missing. Re-navigating
    // unconditionally burned the whole test budget mid-flow on CI (Test Case 8
    // timed out at the end of this method).
    if ((await tshirtsLink.count()) === 0) {
      await this.open();
    }
    // Expand the "Men" category panel; retry the toggle until the panel is open.
    const menPanel = this.page.locator('#Men');
    for (let attempt = 0; attempt < 3; attempt++) {
      await closeVisibleAd(this.page);
      if (await menPanel.evaluate(el => el.classList.contains('in')).catch(() => false)) {
        break;
      }
      await this.page.locator('a[href="#Men"]').first().click({ force: true }).catch(() => undefined);
      await this.waitAfterAction();
    }

    await closeVisibleAd(this.page);
    // Bounded click: a stuck panel or overlay must never hang the test; when
    // the click does not go through, ensureUrl falls back to a direct,
    // retried navigation to the category page.
    await tshirtsLink.first().click({ timeout: 5000 }).catch(() => undefined);
    await this.ensureUrl('/category_products/3');
    await this.waitAfterAction();
  }

  async openBrand(brand: string): Promise<void> {
    await closeVisibleAd(this.page);
    await this.page.locator(`a[href="/brand_products/${brand}"]`).click().catch(() => undefined);
    await this.ensureUrl(`/brand_products/${brand}`);
    await this.waitAfterAction();
  }

  /**
   * Ad interstitials can hijack a link click and leave the URL with a
   * "#google_vignette" hash instead of the intended page. If the expected
   * fragment is missing, fall back to a direct, retried navigation.
   */
  private async ensureUrl(fragment: string): Promise<void> {
    if (!this.page.url().includes('#google_vignette') && this.page.url().includes(fragment)) {
      return;
    }
    await gotoWithRetry(this.page, fragment);
    await closeVisibleAd(this.page);
  }

  async openCategory(categoryId: string): Promise<void> {
    await gotoWithRetry(this.page, `/category_products/${categoryId}`);
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
      await gotoWithRetry(this.page, detailsUrl);
    }
    await this.waitAfterAction();
  }
}
