import { expect } from '@playwright/test';
import { closeVisibleAd } from '../utils/adHandler';
import { BasePage } from './BasePage';

export class ScrollPage extends BasePage {
  async openAndScrollToFooter(): Promise<void> {
    await this.page.goto('/');
    await this.page.locator('footer').scrollIntoViewIfNeeded();
    await this.waitAfterAction();
    await expect(this.page.locator('footer')).toBeVisible();
  }

  async scrollToTopWithArrow(): Promise<void> {
    const arrow = this.page.locator('#scrollUp');
    for (let attempt = 1; attempt <= 3; attempt++) {
      await closeVisibleAd(this.page);
      await arrow.scrollIntoViewIfNeeded().catch(() => undefined);
      await arrow.click({ force: true }).catch(() => undefined);
      const scrolled = await expect
        .poll(() => this.page.evaluate(() => window.scrollY), { timeout: 3000 })
        .toBeLessThan(100)
        .then(() => true)
        .catch(() => false);
      if (scrolled) {
        await this.waitAfterAction();
        return;
      }
    }
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeLessThan(100);
    await this.waitAfterAction();
  }

  async scrollToTopWithoutArrow(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => this.page.evaluate(() => window.scrollY)).toBeLessThan(100);
    await this.waitAfterAction();
  }
}
