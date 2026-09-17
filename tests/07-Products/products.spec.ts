import { expect, test } from '@playwright/test';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { ProductsPage } from '../../pages/ProductsPage';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

test('Test Case 8: Verify All Products and Product Details', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  await test.step('1. Open the Products page', async () => {
    await productsPage.open();
  });

  await test.step('2. Verify all products are displayed', async () => {
    const productCards = page.locator('.features_items .product-image-wrapper');
    await expect(productCards.first()).toBeVisible();
    await expect(productCards).toHaveCount(await productCards.count());
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  await test.step('3. Open the first product details page', async () => {
    await productsPage.openFirstProductDetails();
  });

  await test.step('4. Verify the product details', async () => {
    await expect(page).toHaveURL(/automationexercise\.com\/product_details\/\d+/);
    await expect(page.locator('.product-information')).toBeVisible();
    await expect(page.locator('.product-information h2')).toBeVisible();
    await expect(page.getByText('Availability:')).toBeVisible();
    await expect(page.getByText('Condition:')).toBeVisible();
    await expect(page.getByText('Brand:')).toBeVisible();
  });

  await test.step('5. Open the T-shirts category', async () => {
    await productsPage.openTshirtsCategory();
    await expect(page).toHaveURL(/automationexercise\.com\/category_products\/3/);
    await expect(page.getByRole('heading', { name: /Men.*Tshirts.*Products/i })).toBeVisible();
  });

  await test.step('6. Filter T-shirts by the Babyhug brand', async () => {
    await productsPage.openBrand('Babyhug');
    await expect(page).toHaveURL(/automationexercise\.com\/brand_products\/Babyhug/);
    await expect(page.getByRole('heading', { name: /brand.*babyhug.*products/i })).toBeVisible();
  });

  await test.step('7. Open and verify a Babyhug product detail page', async () => {
    await productsPage.openFirstVisibleProductDetails();
    await expect(page).toHaveURL(/automationexercise\.com\/product_details\/\d+/);
    await expect(page.locator('.product-information')).toBeVisible();
    await expect(page.locator('.product-information h2')).toBeVisible();
    await expect(page.getByText('Availability:')).toBeVisible();
    await expect(page.getByText('Condition:')).toBeVisible();
    await expect(page.getByText('Brand:')).toBeVisible();
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
  });
});
