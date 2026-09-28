import { Page } from '@playwright/test';

/** Browser chrome (title bar, toolbars, borders) is not part of the page viewport. */
async function browserChromeSize(page: Page): Promise<{ width: number; height: number }> {
  return page.evaluate(() => ({
    width: Math.max(0, window.outerWidth - window.innerWidth),
    height: Math.max(0, window.outerHeight - window.innerHeight)
  }));
}

/**
 * Grows the browser window until it covers the screen work area.
 *
 * Playwright can only be asked to *start* maximized through the
 * `--start-maximized` launch flag, which is a Chromium option: Firefox silently
 * ignores it (verified against Playwright 1.63 - the headed window keeps its
 * default size whether the flag is passed or not).
 *
 * Resizing the viewport is the one lever that works in every engine, because in
 * headed mode the browser resizes its own window to match the requested
 * viewport. Screen work area minus the measured browser chrome therefore yields
 * a window that fills the screen without pushing content behind the taskbar.
 * `window.resizeTo()` is not an option - Firefox blocks it for the main window.
 *
 * Call it before the test navigates (the popup rendered by the beforeEach hooks
 * comes later) and only for headed runs.
 */
export async function maximizeWindow(page: Page): Promise<void> {
  const screen = await page.evaluate(() => ({
    width: window.screen.availWidth,
    height: window.screen.availHeight
  }));
  const chrome = await browserChromeSize(page);
  await page.setViewportSize({
    width: Math.max(320, screen.width - chrome.width),
    height: Math.max(240, screen.height - chrome.height)
  });
}
