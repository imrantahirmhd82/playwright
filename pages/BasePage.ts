import { expect, Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async waitAfterAction(): Promise<void> {
    await this.page.waitForTimeout(400);
  }

  protected async verifyTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/Automation Exercise/);
  }
}
