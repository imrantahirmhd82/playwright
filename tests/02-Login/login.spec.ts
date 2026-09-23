import { expect, test } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../../pages/SignupPage';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';
import { getLoginData, getUniqueRegistrationData } from '../../utils/excelData';

test.setTimeout(120000);

test.beforeEach(async ({ page }, testInfo) => {
    await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
    installAdCloser(page);
});

// Test Case 2: Login User with correct email and password
test('Test Case 2: Login User with correct email and password', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const details: RegistrationDetails = getUniqueRegistrationData();

    await test.step('Launch browser and verify the home page', async () => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Automation Exercise/);
    });

    await test.step('Create a temporary valid user for the login test', async () => {
        await signupPage.openSignupForm();
        await signupPage.startSignup(details.name, details.email);
        await signupPage.completeRegistration(details);
        await signupPage.continueAfterAccountCreation();
        await expect(page.getByText(`Logged in as ${details.name}`)).toBeVisible();
    });

    await test.step('Log out and verify the login form', async () => {
        await page.getByRole('link', { name: 'Logout' }).click();
        await expect(page.getByText('Login to your account')).toBeVisible();
    });

    await test.step('Log in with the correct email and password', async () => {
        await signupPage.login(details.email, details.password);
        await expect(page.getByText(`Logged in as ${details.name}`)).toBeVisible();
    });

    await test.step('Delete the temporary user account', async () => {
        await signupPage.deleteAccount();
        await page.getByRole('link', { name: 'Continue' }).click();
        await expect(page).toHaveURL(/automationexercise\.com\/?$/);
    });
});

// Test Case 3: Login User with incorrect email and password
test('Test Case 3: Login User with incorrect email and password', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const invalidLogin = getLoginData('invalid');

    await test.step('Launch browser and verify the home page', async () => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Automation Exercise/);
    });

    await test.step('Open Signup / Login and verify the login form', async () => {
        await signupPage.openSignupForm();
        await expect(page.getByText('Login to your account')).toBeVisible();
    });

    await test.step('Enter incorrect email and password and click Login', async () => {
        await signupPage.login(invalidLogin.email, invalidLogin.password);
    });

    await test.step('Verify the incorrect credentials error message', async () => {
        await expect(page.getByText('Your email or password is incorrect!')).toBeVisible({
            timeout: 10000
        });
    });
});
