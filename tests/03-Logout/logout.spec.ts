import { expect, test } from '@playwright/test';
import { ensureStaticUser } from '../../utils/staticUser';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

// Test Case 4: Logout User
test('Test Case 4: Logout User', async ({ page }) => {
  await test.step('Launch browser and verify the home page', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });

  await test.step('Ensure the static user exists and is logged in', async () => {
    await ensureStaticUser(page);
  });

  await test.step('Click Logout and verify the user is logged out', async () => {
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/automationexercise\.com\/login/);
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

});
