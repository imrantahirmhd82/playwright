import { expect, Page, test } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../../pages/SignupPage';
import { closeVisibleAd, installAdCloser } from '../../utils/adHandler';
import { ensureStaticUser } from '../../utils/staticUser';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { getRegistrationData, getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

async function addProductAndOpenCart(page: Page): Promise<void> {
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  await productsPage.open();
  await productsPage.addProduct('1');
  await cartPage.open();
}

async function openCheckout(page: Page): Promise<void> {
  await new CartPage(page).proceedToCheckout();
}

async function createOrderUser(page: Page): Promise<RegistrationDetails> {
  const uniqueId = Date.now();
  const registrationData = getRegistrationData('registration');
  const details: RegistrationDetails = {
    ...registrationData,
    name: `${registrationData.name} ${uniqueId}`,
    email: `order.user.${uniqueId}@example.com`
  };
  const signupPage = new SignupPage(page);
  await signupPage.openSignupForm();
  await signupPage.startSignup(details.name, details.email);
  await signupPage.completeRegistration(details);
  await signupPage.continueAfterAccountCreation();
  await expect(page.getByText(`Logged in as ${details.name}`)).toBeVisible();
  await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);
  return details;
}

async function verifyCheckoutReview(page: Page): Promise<void> {
  await expect(page).toHaveURL(/automationexercise\.com\/checkout/);
  await expect(page.getByText('Address Details')).toBeVisible();
  await expect(page.getByText('Review Your Order')).toBeVisible();
  await expect(page.locator(`#product-${getTestData('primary_product_id')}`)).toBeVisible();
}

test('Test Case 14: Place Order - Register while Checkout', async ({ page }) => {
  await test.step('1. Add a product and open the Cart', async () => {
    await addProductAndOpenCart(page);
  });

  await test.step('2. Proceed to checkout and register', async () => {
    await openCheckout(page);
    const registerLoginLink = page.getByRole('link', { name: /Register \/ Login/i });
    await expect(registerLoginLink).toBeVisible();
    await registerLoginLink.click();
    await page.waitForTimeout(400);
    await createOrderUser(page);
  });

  await test.step('3. Return to checkout and verify the order review', async () => {
    await page.goto('/view_cart');
    await closeVisibleAd(page);
    await page.waitForTimeout(400);
    await openCheckout(page);
    await verifyCheckoutReview(page);
  });
});

test('Test Case 15: Place Order - Register before Checkout', async ({ page }) => {
  await test.step('1. Register a new user before checkout', async () => {
    await page.goto('/');
    await closeVisibleAd(page);
    await createOrderUser(page);
  });

  await test.step('2. Add a product and proceed to checkout', async () => {
    await addProductAndOpenCart(page);
    await openCheckout(page);
    await verifyCheckoutReview(page);
  });
});

test('Test Case 16: Place Order - Login before Checkout', async ({ page }) => {
  await test.step('1. Login before checkout', async () => {
    await page.goto('/');
    await closeVisibleAd(page);
    const user = await ensureStaticUser(page);
    await expect(page.getByText(`Logged in as ${user.name}`)).toBeVisible();
    await page.waitForTimeout(400);
  });

  await test.step('2. Add a product and proceed to checkout', async () => {
    await addProductAndOpenCart(page);
    await openCheckout(page);
    await verifyCheckoutReview(page);
  });
});
