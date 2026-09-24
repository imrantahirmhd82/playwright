import { Page } from '@playwright/test';

export async function showTestExecutionPopup(page: Page, testTitle: string): Promise<void> {
  await page.setContent(`
    <div id="test-execution-popup" role="dialog" aria-live="assertive">
      <div class="popup-content">
        <p>${testTitle}</p>
      </div>
    </div>
    <style>
      #test-execution-popup {
        align-items: center;
        background: rgba(0, 0, 0, 0.72);
        display: flex;
        height: 100vh;
        justify-content: center;
        left: 0;
        position: fixed;
        top: 0;
        width: 100vw;
        z-index: 9999;
      }
      .popup-content {
        background: #ffffff;
        border: 3px solid #3498db;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
        color: #222222;
        font: 700 24px Arial, sans-serif;
        padding: 28px 40px;
        text-align: center;
      }
    </style>
  `);
  await page.waitForTimeout(400);
}
