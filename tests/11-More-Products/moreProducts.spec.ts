import { expect, test } from '@playwright/test';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { ensureStaticUser } from '../../utils/staticUser';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

test.afterEach(async ({ page }) => {
  await clearCart(page).catch(() => undefined);
});

async function addProduct(page: Parameters<typeof test>[0]['page'], productId?: string): Promise<void> {
  const productsPage = new ProductsPage(page);
  if (productId) {
    await productsPage.addProduct(productId);
    return;
  }
  await productsPage.addFirstVisibleProduct();
}

async function clearCart(page: Parameters<typeof test>[0]['page']): Promise<void> {
  await new CartPage(page).clear();

  await expect(page.locator('#empty_cart')).toBeVisible();
}

test('Test Case 17: Remove Products From Cart', async ({ page }) => {
  await test.step('1. Add a product and open the Cart', async () => {
    await page.goto('/products');
    await closeVisibleAd(page);
    await expect(page.getByRole('heading', { name: 'ALL PRODUCTS' })).toBeVisible();
    await page.waitForTimeout(400);
      await page.waitForTimeout(400);
      await page.waitForTimeout(400);
      await page.waitForTimeout(400);
      await page.waitForTimeout(400);
      await page.waitForTimeout(400);
    await addProduct(page);
    await page.goto('/view_cart');
    await closeVisibleAd(page);
    await expect(page.locator('#product-1')).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('2. Remove the product from the Cart', async () => {
    await page.locator('#product-1 .cart_quantity_delete').click();
    await page.waitForTimeout(400);
  });

  await test.step('3. Verify the product was removed', async () => {
    await expect(page.locator('#product-1')).toHaveCount(0);
    await expect(page.locator('#empty_cart')).toBeVisible();
  });
});

test('Test Case 18: View Category Products', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  await test.step('1. Open a product category', async () => {
    await productsPage.openCategory('1');
  });

  await test.step('2. Verify category products', async () => {
    await expect(page).toHaveURL(/automationexercise\.com\/category_products\/1/);
    await expect(page.getByRole('heading', { name: /Women.*Dress Products/i })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();
  });
});

test('Test Case 19: View and Cart Brand Products', async ({ page }) => {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  await test.step('1. Open a brand products page', async () => {
    await page.goto('/brand_products/Polo');
    await closeVisibleAd(page);
    await page.waitForTimeout(400);
  });

  await test.step('2. Verify brand products', async () => {
    await expect(page).toHaveURL(/automationexercise\.com\/brand_products\/Polo/);
    await expect(page.getByRole('heading', { name: /Brand - Polo Products/i })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();
  });

  await test.step('3. Add a brand product and verify the Cart', async () => {
    await productsPage.addFirstVisibleProduct();
    await cartPage.open();
    await expect(page.locator('#cart_info tbody tr').first()).toBeVisible();
  });
});

test('Test Case 20: Add two Products and Verify Cart After Login', async ({ page }) => {
  await test.step('1. Add two different products to the Cart', async () => {
    await page.goto('/products');
    await closeVisibleAd(page);
    await expect(page.getByRole('heading', { name: 'ALL PRODUCTS' })).toBeVisible();
    await page.waitForTimeout(400);
    await addProduct(page, getTestData('primary_product_id'));
    await page.goto('/products');
    await closeVisibleAd(page);
    await expect(page.getByRole('heading', { name: 'ALL PRODUCTS' })).toBeVisible();
    await page.waitForTimeout(400);
    await addProduct(page, getTestData('secondary_product_id'));
  });

  await test.step('2. Login to the account', async () => {
    await page.goto('/');
    await closeVisibleAd(page);
    const user = await ensureStaticUser(page);
    await expect(page.getByText(`Logged in as ${user.name}`)).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('3. Verify both selected products remain in the Cart', async () => {
    await page.goto('/view_cart');
    await closeVisibleAd(page);
    await page.waitForTimeout(400);
    await expect(page.locator(`#product-${getTestData('primary_product_id')}`)).toBeVisible();
    await expect(page.locator(`#product-${getTestData('secondary_product_id')}`)).toBeVisible();
    await expect(page.locator(`#product-${getTestData('primary_product_id')} .cart_quantity button`)).toHaveText(/\d+/);
    await expect(page.locator(`#product-${getTestData('secondary_product_id')} .cart_quantity button`)).toHaveText(/\d+/);
  });

  await test.step('4. Clear the selected products before ending the test', async () => {
    await clearCart(page);
  });
});
