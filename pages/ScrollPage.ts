import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ScrollPage extends BasePage {
  async openAndScrollToFooter(): Promise<void> {
    await this.page.goto('/');
    await this.page.locator('footer').scrollIntoViewIfNeeded();
    await this.waitAfterAction();
    await expect(this.page.locator('footer')).toBeVisible();
  }

  async scrollToTopWithArrow(): Promise<void> {
    await this.page.locator('#scrollUp').click();
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeLessThan(100);
    await this.waitAfterAction();
  }

  async scrollToTopWithoutArrow(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeLessThan(100);
    await this.waitAfterAction();
  }
}
