import { expect, Page } from '@playwright/test';
import { RegistrationDetails, SignupPage } from '../pages/SignupPage';
import { getRegistrationData } from './excelData';

function createReplacementUser(previousUser: RegistrationDetails): RegistrationDetails {
  const uniqueId = Date.now();
  return {
    ...previousUser,
    name: `Automation Static User ${uniqueId}`,
    email: `automation.static.user.${uniqueId}@example.com`
  };
}

export async function ensureStaticUser(page: Page): Promise<RegistrationDetails> {
  const savedUser = getRegistrationData('static');
  const signupPage = new SignupPage(page);

  await signupPage.openSignupForm();
  await signupPage.login(savedUser.email, savedUser.password);

  const loggedInUser = page.getByText(`Logged in as ${savedUser.name}`);
  if (await loggedInUser.isVisible({ timeout: 7000 }).catch(() => false)) {
    return savedUser;
  }

  await expect(page.getByText('Your email or password is incorrect!')).toBeVisible({
    timeout: 10000
  });

  const replacementUser = createReplacementUser(savedUser);
  await signupPage.startSignup(replacementUser.name, replacementUser.email);
  await signupPage.completeRegistration(replacementUser);
  await signupPage.continueAfterAccountCreation();
  await expect(page.getByText(`Logged in as ${replacementUser.name}`)).toBeVisible();
  return replacementUser;
}
