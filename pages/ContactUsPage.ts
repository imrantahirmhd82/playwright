import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactUsPage extends BasePage {
  readonly nameField = this.page.locator('input[name="name"]');
  readonly emailField = this.page.locator('input[name="email"]');
  readonly subjectField = this.page.locator('input[name="subject"]');
  readonly messageField = this.page.locator('textarea[name="message"]');
  readonly submitButton = this.page.locator('[data-qa="submit-button"]');

  async open(): Promise<void> {
    await this.page.goto('/contact_us');
    await this.verifyTitle();
    await expect(this.page.getByText('GET IN TOUCH')).toBeVisible();
  }

  async fillForm(details: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await this.nameField.fill(details.name);
    await this.emailField.fill(details.email);
    await this.subjectField.fill(details.subject);
    await this.messageField.fill(details.message);
    await expect(this.nameField).toHaveValue(details.name);
    await expect(this.emailField).toHaveValue(details.email);
    await expect(this.subjectField).toHaveValue(details.subject);
    await expect(this.messageField).toHaveValue(details.message);
    await this.waitAfterAction();
  }

  async submitAndAcceptConfirmation(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.focus();
    const dialogHandled = new Promise<void>((resolve, reject) => {
      this.page.once('dialog', async dialog => {
        try {
          expect(dialog.type()).toBe('confirm');
          expect(dialog.message()).toBe('Press OK to proceed!');
          await dialog.accept();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    await this.submitButton.click();
    await dialogHandled;
  }
}
