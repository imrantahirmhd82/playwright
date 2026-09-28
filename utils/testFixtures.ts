import { expect, test as base, TestInfo } from '@playwright/test';
import { maximizeWindow } from './browserWindow';

/**
 * `--headed` overrides the configured `headless` option, so the resolved project
 * value is the reliable way to tell whether a visible browser window exists.
 */
function isHeaded(testInfo: TestInfo): boolean {
  return testInfo.project.use.headless === false;
}

/**
 * Specs import `test`/`expect` from this module instead of '@playwright/test'.
 *
 * The only addition is an automatic fixture that maximizes the browser window
 * for headed runs; headless runs keep the deterministic viewport defined in
 * playwright.config.ts. See utils/browserWindow.ts for why Firefox cannot be
 * maximized through `launchOptions`.
 */
export const test = base.extend<{ maximizedWindow: void }>({
  maximizedWindow: [
    async ({ page }, use, testInfo) => {
      if (isHeaded(testInfo)) {
        // Window sizing must never fail a test (e.g. a window manager that
        // refuses the resize), so failures are swallowed like other best-effort
        // page preparation helpers.
        await maximizeWindow(page).catch(() => undefined);
      }
      await use();
    },
    { auto: true }
  ]
});

export { expect };
