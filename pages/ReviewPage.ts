import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTestData } from '../utils/excelData';

export class ReviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async submit(reviewText: string): Promise<void> {
    await expect(this.page.locator('#review-form')).toBeVisible();
    await this.page.locator('#name').fill(getTestData('review_name'));
    await this.page.locator('#email').fill(getTestData('review_email'));
    await this.page.locator('#review').fill(reviewText);
    await this.page.locator('#review-form button[type="submit"]').click();
    await this.waitAfterAction();
    await expect(this.page.locator('#review-section .alert-success')).toHaveText(
      'Thank you for your review.'
    );
  }

  async addRecommendedProduct(): Promise<void> {
    const recommendedProduct = this.page.locator('#recommended-item-carousel .add-to-cart:visible').first();
    await expect(recommendedProduct).toBeVisible();
    await recommendedProduct.click();
    const cartModal = this.page.locator('#cartModal');
    await expect(cartModal).toHaveClass(/show/);
    const continueShopping = cartModal.locator('button.close-modal');
    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click({ force: true });
      await expect(cartModal).not.toHaveClass(/show/);
    }
    await this.waitAfterAction();
  }
}
