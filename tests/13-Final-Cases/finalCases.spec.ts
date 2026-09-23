import { expect, test, Page } from '@playwright/test';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { ensureStaticUser } from '../../utils/staticUser';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { ScrollPage } from '../../pages/ScrollPage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(120000);

const waitAfterAction = (page: Page): Promise<void> => page.waitForTimeout(400);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

async function addProduct(page: Page): Promise<void> {
  const productsPage = new ProductsPage(page);
  await productsPage.open();
  await productsPage.addProduct(getTestData('primary_product_id'));
}

async function openCheckout(page: Page): Promise<void> {
  const cartPage = new CartPage(page);
  await cartPage.open();
  await new CheckoutPage(page).proceedFromCart();
}

test('Test Case 23: Verify Address Details in Checkout', async ({ page }) => {
  await page.goto('/');
  await closeVisibleAd(page);
  const user = await ensureStaticUser(page);

  await test.step('1. Login and open checkout', async () => {
    await expect(page.getByText(`Logged in as ${user.name}`)).toBeVisible();
    await addProduct(page);
    await openCheckout(page);
  });

  await test.step('2. Verify delivery and billing addresses', async () => {
    await expect(page.getByText('Address Details')).toBeVisible();
    await expect(page.locator('#address_delivery')).toContainText(user.firstName);
    await expect(page.locator('#address_delivery')).toContainText(user.lastName);
    await expect(page.locator('#address_delivery')).toContainText(user.address);
    await expect(page.locator('#address_delivery')).toContainText(user.city);
    const billingAddress = page.getByRole('heading', { name: 'Your billing address' }).locator('..').locator('..');
    await expect(billingAddress).toContainText(user.address);
    await waitAfterAction(page);
  });
});

test('Test Case 24: Download Invoice after Purchase Order', async ({ page }) => {
  await test.step('1. Login and open checkout', async () => {
    await page.goto('/');
    await closeVisibleAd(page);
    await ensureStaticUser(page);
    await addProduct(page);
    await openCheckout(page);
  });

  await test.step('2. Place the order and download the invoice', async () => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.placeOrder();
    await checkoutPage.pay();
    await expect(page.getByText('Order Placed!')).toBeVisible();
    expect(await checkoutPage.downloadInvoice()).toMatch(/invoice/i);
  });
});

test('Test Case 25: Verify Scroll Up Using Arrow Button', async ({ page }) => {
  const scrollPage = new ScrollPage(page);
  await test.step('1. Scroll to the bottom of the Home page', async () => {
    await scrollPage.openAndScrollToFooter();
  });

  await test.step('2. Click the scroll-up arrow', async () => {
    await scrollPage.scrollToTopWithArrow();
  });
});

test('Test Case 26: Verify Scroll Up Without Arrow Button', async ({ page }) => {
  const scrollPage = new ScrollPage(page);
  await test.step('1. Scroll to the bottom of the Home page', async () => {
    await scrollPage.openAndScrollToFooter();
  });

  await test.step('2. Scroll back to the top', async () => {
    await scrollPage.scrollToTopWithoutArrow();
  });
});
