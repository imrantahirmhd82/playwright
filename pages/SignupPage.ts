import { expect, Page } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { gotoWithRetry } from '../utils/navigation';

export type RegistrationDetails = {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
};

export class SignupPage {
  constructor(private readonly page: Page) {}

  async openSignupForm(): Promise<void> {
    const signupHeading = this.page.getByText('New User Signup!');
    for (let attempt = 1; attempt <= 2; attempt++) {
      await closeVisibleAd(this.page);
      await this.page
        .getByRole('link', { name: 'Signup / Login' })
        .click({ timeout: 10000 })
        .catch(() => undefined);
      if (await signupHeading.isVisible({ timeout: 8000 }).catch(() => false)) {
        return;
      }
      // A slow navigation or the "heavy load (queue full)" page can leave us off
      // the login form; fall back to a direct, retried navigation.
      await gotoWithRetry(this.page, '/login');
      if (await signupHeading.isVisible({ timeout: 8000 }).catch(() => false)) {
        return;
      }
    }
    await expect(signupHeading).toBeVisible();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.page.locator('[data-qa="signup-name"]').fill(name);
    await this.page.locator('[data-qa="signup-email"]').fill(email);
    await this.page.getByRole('button', { name: 'Signup' }).click();
    await expect(this.page.getByText('Enter Account Information')).toBeVisible();
  }

  /**
   * Starts a signup and reports whether a brand new account form was opened.
   * Returns false when the email is already registered (the site shows an
   * "Email Address already exist!" error instead of the account form).
   */
  async startSignupIfNew(name: string, email: string): Promise<boolean> {
    await this.page.locator('[data-qa="signup-name"]').fill(name);
    await this.page.locator('[data-qa="signup-email"]').fill(email);
    await this.page.getByRole('button', { name: 'Signup' }).click();
    const accountInfo = this.page.getByText('Enter Account Information');
    const emailExists = this.page.getByText('Email Address already exist!');
    await expect(accountInfo.or(emailExists)).toBeVisible({ timeout: 10000 });
    return accountInfo.isVisible().catch(() => false);
  }

  async completeRegistration(details: RegistrationDetails): Promise<void> {
    await this.page.locator('#id_gender1').check();
    await this.page.locator('[data-qa="password"]').fill(details.password);
    await this.page.locator('[data-qa="days"]').selectOption('10');
    await this.page.locator('[data-qa="months"]').selectOption('5');
    await this.page.locator('[data-qa="years"]').selectOption('1990');
    await this.page.locator('#newsletter').check();
    await this.page.locator('#optin').check();
    await this.page.locator('[data-qa="first_name"]').fill(details.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(details.lastName);
    await this.page.locator('[data-qa="company"]').fill(details.company);
    await this.page.locator('[data-qa="address"]').fill(details.address);
    await this.page.locator('[data-qa="address2"]').fill(details.address2);
    await this.page.locator('[data-qa="country"]').selectOption({ label: details.country });
    await this.page.locator('[data-qa="state"]').fill(details.state);
    await this.page.locator('[data-qa="city"]').fill(details.city);
    await this.page.locator('[data-qa="zipcode"]').fill(details.zipcode);
    await this.page.locator('[data-qa="mobile_number"]').fill(details.mobileNumber);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async continueAfterAccountCreation(name?: string): Promise<void> {
    await expect(this.page.getByText('Account Created!')).toBeVisible();
    await this.page.waitForTimeout(400);
    await this.page.getByRole('link', { name: 'Continue' }).click();
    await this.settleAfterAccountCreation();
    if (name) {
      await this.expectLoggedIn(name);
    }
  }

  /**
   * Google vignette/ad interstitials commonly hijack the post-signup navigation
   * (the URL keeps a "#google_vignette" hash and the logged-in header is gone).
   * Retreat to a clean home navigation until the real page is served.
   */
  private async settleAfterAccountCreation(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await closeVisibleAd(this.page);
      const url = this.page.url();
      if (/automationexercise\.com\/?$/.test(url) && !url.includes('#google_vignette')) {
        return;
      }
      await gotoWithRetry(this.page, '/');
    }
  }

  /** Asserts the header shows the expected user, retrying once after a clean reload. */
  async expectLoggedIn(name: string): Promise<void> {
    const loggedIn = this.page.getByText(`Logged in as ${name}`);
    if (await loggedIn.isVisible({ timeout: 8000 }).catch(() => false)) {
      return;
    }
    await gotoWithRetry(this.page, '/');
    await closeVisibleAd(this.page);
    await expect(loggedIn).toBeVisible({ timeout: 15000 });
  }

  async deleteAccount(): Promise<void> {
    await this.page.getByRole('link', { name: 'Delete Account' }).click();
    await expect(this.page.getByText('Account Deleted!')).toBeVisible();
    await this.page.waitForTimeout(400);
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator('[data-qa="login-email"]').fill(email);
    await this.page.locator('[data-qa="login-password"]').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}
