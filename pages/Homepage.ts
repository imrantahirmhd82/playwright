import { expect } from '@playwright/test';
import { gotoWithRetry } from '../utils/navigation';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async open(): Promise<void> {
    await gotoWithRetry(this.page, '/');
    await this.verifyTitle();
  }

  async openProducts(): Promise<void> {
    await this.page.locator('header a[href="/products"]').click();
    await this.waitAfterAction();
  }

  async openCart(): Promise<void> {
    await this.page.locator('header a[href="/view_cart"]').click();
    await this.waitAfterAction();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }

  async verifyLoggedInAs(name: string): Promise<void> {
    await expect(this.page.getByText(`Logged in as ${name}`)).toBeVisible();
  }
}
