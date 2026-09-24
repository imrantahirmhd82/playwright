import { expect, test } from '@playwright/test';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';
import { gotoWithRetry } from '../../utils/navigation';
import { TestCasesPage } from '../../pages/TestCasesPage';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

test('Test Case 7: Verify Test Cases Page', async ({ page }) => {
  const testCasesPage = new TestCasesPage(page);
  await test.step('1. Launch the browser and verify the home page', async () => {
    await gotoWithRetry(page, '/');
    await expect(page).toHaveTitle(/Automation Exercise/);
  });

  await test.step('2. Open Test Cases from the top navigation bar', async () => {
    await testCasesPage.openFromHeader();
    await testCasesPage.expectLoaded();
  });

  await test.step('3. Open Test Cases from the animated bar', async () => {
    await testCasesPage.openFromHero();
    await testCasesPage.expectLoaded();
  });
});
