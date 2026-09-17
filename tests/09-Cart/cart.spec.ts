import { expect, test } from '@playwright/test';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

async function continueAfterAddingProduct(page: Parameters<typeof test>[0]['page']): Promise<void> {
  const cartModal = page.locator('#cartModal');
  const continueShopping = cartModal.locator('button.close-modal');
  if (await continueShopping.isVisible().catch(() => false)) {
    await continueShopping.click({ force: true });
    await expect(cartModal).not.toHaveClass(/show/);
  }
  await page.waitForTimeout(400);
  await page.waitForTimeout(400);
  await page.waitForTimeout(400);
  await page.waitForTimeout(400);
}

test('Test Case 11: Verify Subscription in Cart Page', async ({ page }) => {
  const cartPage = new CartPage(page);
  const subscriptionPage = new SubscriptionPage(page);
  await test.step('1. Open the Cart page', async () => {
    await cartPage.open();
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.getByRole('heading', { name: 'Subscription' })).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('2. Subscribe from the Cart page', async () => {
    await subscriptionPage.subscribe(getTestData('cart_subscription_email'));
  });

  await test.step('3. Verify the subscription confirmation', async () => {
    await subscriptionPage.expectSuccess();
  });
});

test('Test Case 12: Add Products in Cart', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  await test.step('1. Open the Products page', async () => {
    await productsPage.open();
  });

  await test.step('2. Add two products to the Cart', async () => {
    await productsPage.addProduct(getTestData('primary_product_id'));
    await productsPage.open();
    await productsPage.addProduct(getTestData('secondary_product_id'));
  });

  await test.step('3. Verify both products are in the Cart', async () => {
    await cartPage.open();
    await expect(page.locator('#cart_info tbody tr')).toHaveCount(2);
  });
});

test('Test Case 13: Verify Product Quantity in Cart', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  await test.step('1. Open a product details page', async () => {
    await productsPage.openProductDetails(getTestData('primary_product_id'));
  });

  await test.step('2. Set the product quantity and add it to the Cart', async () => {
    const quantityField = page.locator('#quantity');
    await expect(quantityField).toBeVisible();
    await quantityField.fill(getTestData('quantity'));
    await page.locator('button:has-text("Add to cart")').click();
    await continueAfterAddingProduct(page);
  });

  await test.step('3. Verify the quantity in the Cart', async () => {
    await cartPage.open();
    await expect(page.locator(`#product-${getTestData('primary_product_id')} .cart_quantity button`)).toHaveText(getTestData('quantity'));
  });
});
