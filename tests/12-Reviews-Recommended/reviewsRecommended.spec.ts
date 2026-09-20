import { expect, Page, test } from '@playwright/test';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ReviewPage } from '../../pages/ReviewPage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

async function clearCart(page: Page): Promise<void> {
  await page.goto('/view_cart');
  await closeVisibleAd(page);
  await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
  const cartRows = page.locator('#cart_info tbody tr');
  while (await cartRows.count() > 0) {
    await cartRows.first().locator('.cart_quantity_delete').click();
    await page.waitForTimeout(400);
  }
}

async function closeCartModal(page: Page): Promise<void> {
  const cartModal = page.locator('#cartModal');
  const continueShopping = cartModal.locator('button.close-modal');
  if (await continueShopping.isVisible().catch(() => false)) {
    await continueShopping.click({ force: true });
    await expect(cartModal).not.toHaveClass(/show/);
  }
  await page.waitForTimeout(400);
}

test.afterEach(async ({ page }) => {
  await clearCart(page).catch(() => undefined);
});

test('Test Case 21: Add Review on Product', async ({ page }) => {
  const reviewPage = new ReviewPage(page);
  await test.step('1. Add a product and open it from the Cart', async () => {
    await page.goto('/products');
    await closeVisibleAd(page);
    await expect(page.getByRole('heading', { name: 'ALL PRODUCTS' })).toBeVisible();
    await page.locator(`.add-to-cart[data-product-id="${getTestData('primary_product_id')}"]`).first().click();
    await expect(page.locator('#cartModal')).toHaveClass(/show/);
    await closeCartModal(page);
    await page.goto('/view_cart');
    await closeVisibleAd(page);
    await page.waitForTimeout(400);
    const productDetailsLink = page.locator('#cart_info tbody tr').first().locator('a[href^="/product_details/"]');
    await expect(productDetailsLink).toBeVisible();
    await page.goto(await productDetailsLink.getAttribute('href') as string);
    await expect(page.locator('.product-information')).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('2. Submit a product review', async () => {
    await reviewPage.submit(getTestData('review_text'));
  });
});

test('Test Case 22: Add Recommended Product to Cart', async ({ page }) => {
  const reviewPage = new ReviewPage(page);
  await test.step('1. Open the Home page and view Recommended Items', async () => {
    await page.goto('/');
    await closeVisibleAd(page);
    await expect(page.locator('.recommended_items')).toBeVisible();
    await expect(page.locator('#recommended-item-carousel')).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('2. Add a recommended product to the Cart', async () => {
    await reviewPage.addRecommendedProduct();
  });

  await test.step('3. Open the recommended product from the Cart', async () => {
    await page.goto('/view_cart');
    await closeVisibleAd(page);
    await page.waitForTimeout(400);
    const recommendedDetailsLink = page.locator('#cart_info tbody tr').first().locator('a[href^="/product_details/"]');
    await expect(recommendedDetailsLink).toBeVisible();
    await page.goto(await recommendedDetailsLink.getAttribute('href') as string);
    await expect(page.locator('.product-information')).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('4. Submit and verify the recommended product review', async () => {
    await reviewPage.submit(getTestData('recommended_review_text'));
  });
});
