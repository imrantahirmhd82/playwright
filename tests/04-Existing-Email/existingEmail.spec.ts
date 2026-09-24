import { expect, test } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../../pages/SignupPage';
import { ensureStaticUser } from '../../utils/staticUser';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';
import { gotoWithRetry } from '../../utils/navigation';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

// Test Case 5: Register User with existing email
test('Test Case 5: Register User with existing email', async ({ page }) => {
  const signupPage = new SignupPage(page);
  let staticUser: RegistrationDetails;

  await test.step('Launch browser and verify the home page', async () => {
    await gotoWithRetry(page, '/');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });

  await test.step('Ensure the static user exists, then open the signup form', async () => {
    staticUser = await ensureStaticUser(page);
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.getByText('Login to your account')).toBeVisible();
    await signupPage.openSignupForm();
  });

  await test.step('Enter the existing email and click Signup', async () => {
    await page.locator('[data-qa="signup-name"]').fill(staticUser.name);
    await page.locator('[data-qa="signup-email"]').fill(staticUser.email);
    await page.getByRole('button', { name: 'Signup' }).click();
  });

  await test.step('Verify the existing-email error message', async () => {
    await expect(page.getByText('Email Address already exist!')).toBeVisible({
      timeout: 5000
    });
  });
});
