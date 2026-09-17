import { expect, Page } from '@playwright/test';

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
    await this.page.getByRole('link', { name: 'Signup / Login' }).click();
    await expect(this.page.getByText('New User Signup!')).toBeVisible();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.page.locator('[data-qa="signup-name"]').fill(name);
    await this.page.locator('[data-qa="signup-email"]').fill(email);
    await this.page.getByRole('button', { name: 'Signup' }).click();
    await expect(this.page.getByText('Enter Account Information')).toBeVisible();
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

  async continueAfterAccountCreation(): Promise<void> {
    await expect(this.page.getByText('Account Created!')).toBeVisible();
    await this.page.waitForTimeout(400);
      await this.page.waitForTimeout(400);
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }

  async deleteAccount(): Promise<void> {
    await this.page.getByRole('link', { name: 'Delete Account' }).click();
    await expect(this.page.getByText('Account Deleted!')).toBeVisible();
    await this.page.waitForTimeout(400);
      await this.page.waitForTimeout(400);
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator('[data-qa="login-email"]').fill(email);
    await this.page.locator('[data-qa="login-password"]').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}
