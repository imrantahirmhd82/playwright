import { expect, test } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../../pages/SignupPage';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';
import { getUniqueRegistrationData } from '../../utils/excelData';

test.setTimeout(120000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

// Test Case 1: Register User
test('Test Case 1: Register User', async ({ page }) => {
  const signupPage = new SignupPage(page);
  const details: RegistrationDetails = getUniqueRegistrationData('registration');

  await test.step('Launch browser and verify the home page', async () => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });

  await test.step('Open Signup / Login and verify the signup form', async () => {
    await signupPage.openSignupForm();
  });

  await test.step('Enter name and email and click Signup', async () => {
    await signupPage.startSignup(details.name, details.email);
  });

  await test.step('Fill account and address details and create the account', async () => {
    await signupPage.completeRegistration(details);
  });

  await test.step('Verify account creation and continue', async () => {
    await signupPage.continueAfterAccountCreation();
    await expect(page.getByText(`Logged in as ${details.name}`)).toBeVisible();
  });

  await test.step('Delete the account and verify deletion', async () => {
    await signupPage.deleteAccount();
    await page.getByRole('link', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });
});
