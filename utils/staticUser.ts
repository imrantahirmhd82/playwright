import { expect, Page } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../pages/SignupPage';
import { getRegistrationData } from './excelData';

/**
 * Ensures the "static" user defined in testData/Users.xlsx is signed in and
 * returns its details. The workbook remains the single source of truth: no
 * random replacement user is generated.
 *
 * Flow:
 *   1. Try to log in with the workbook user (it usually already exists).
 *   2. If the account does not exist yet, register it with the same details.
 */
export async function ensureStaticUser(page: Page): Promise<RegistrationDetails> {
  const staticUser = getRegistrationData('static');
  const signupPage = new SignupPage(page);
  const loggedInUser = page.getByText(`Logged in as ${staticUser.name}`);

  await signupPage.openSignupForm();
  await signupPage.login(staticUser.email, staticUser.password);

  const loginResult = await expect(loggedInUser)
    .toBeVisible({ timeout: 15000 })
    .then(() => 'logged-in' as const)
    .catch(() => 'failed' as const);
  if (loginResult === 'logged-in') {
    return staticUser;
  }

  // The account is not usable with the stored credentials. Register the same
  // workbook user if the email is still free; otherwise surface the problem.
  await signupPage.openSignupForm();
  const openedSignup = await signupPage.startSignupIfNew(staticUser.name, staticUser.email);
  if (!openedSignup) {
    throw new Error(
      `Static user from Users.xlsx (${staticUser.email}) already exists but could not be logged in. ` +
        'Update the password in testData/Users.xlsx (User Registration, scenario "static").'
    );
  }

  await signupPage.completeRegistration(staticUser);
  await signupPage.continueAfterAccountCreation();
  await expect(loggedInUser).toBeVisible();
  return staticUser;
}