import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TestCasesPage extends BasePage {
  async openFromHeader(): Promise<void> {
    await this.page.locator('header a[href="/test_cases"]').click();
    await this.waitAfterAction();
  }

  async openFromHero(): Promise<void> {
    await this.page.goto('/');
    await this.page.locator('a.test_cases_list:visible').first().click();
    if (this.page.url().includes('#google_vignette')) {
      await this.page.goto('/test_cases');
    }
    await this.waitAfterAction();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/automationexercise\.com\/test_cases/);
    await expect(this.page.getByRole('heading', { name: /test cases/i }).first()).toBeVisible();
  }
}
