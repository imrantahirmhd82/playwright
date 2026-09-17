import { expect, test } from '@playwright/test';
import { installAdCloser, closeVisibleAd } from '../../utils/adHandler';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ProductsPage } from '../../pages/ProductsPage';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { HomePage } from '../../pages/Homepage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

test('Test Case 9: Search Product', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  await test.step('1. Open the Products page', async () => {
    await productsPage.open();
  });

  await test.step('2. Search for a product', async () => {
    await productsPage.search(getTestData('search_term'));
  });

  await test.step('3. Verify searched products are visible', async () => {
    await expect(page).toHaveURL(new RegExp(`automationexercise\\.com\\/products\\?search=${getTestData('search_term')}`));
    await expect(page.getByRole('heading', { name: /SEARCHED PRODUCTS/i })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();
  });
});

test('Test Case 10: Verify Subscription in Home Page', async ({ page }) => {
  const homePage = new HomePage(page);
  const subscriptionPage = new SubscriptionPage(page);
  await test.step('1. Open the Home page', async () => {
    await homePage.open();
    await closeVisibleAd(page);
  });

  await test.step('2. Subscribe with an email address', async () => {
    await subscriptionPage.subscribe(getTestData('subscription_email'));
  });

  await test.step('3. Verify the subscription confirmation', async () => {
    await subscriptionPage.expectSuccess();
  });
});
