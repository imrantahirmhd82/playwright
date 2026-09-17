import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SubscriptionPage extends BasePage {
  async subscribe(email: string): Promise<void> {
    const emailField = this.page.locator('#susbscribe_email');
    await expect(emailField).toBeVisible();
    await emailField.fill(email);
    await this.page.locator('#subscribe').click();
    await this.waitAfterAction();
  }

  async expectSuccess(): Promise<void> {
    await expect(this.page.locator('#success-subscribe .alert')).toHaveText(
      'You have been successfully subscribed!'
    );
  }
}
