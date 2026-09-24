import { expect, test } from '@playwright/test';
import { showTestExecutionPopup } from '../../utils/testExecutionPopup';
import { installAdCloser } from '../../utils/adHandler';
import { gotoWithRetry } from '../../utils/navigation';
import { ContactUsPage } from '../../pages/ContactUsPage';
import { getTestData } from '../../utils/excelData';

test.setTimeout(60000);

test.beforeEach(async ({ page }, testInfo) => {
  await showTestExecutionPopup(page, `Executing ${testInfo.title}`);
  installAdCloser(page);
});

test('Test Case 6: Contact Us Form', async ({ page }) => {
  const contactDetails = {
    name: getTestData('contact_name'),
    email: getTestData('contact_email'),
    subject: getTestData('contact_subject'),
    message: getTestData('contact_message')
  };
  const contactUsPage = new ContactUsPage(page);

  await test.step('1. Open the Contact Us page', async () => {
    await contactUsPage.open();
  });

  await test.step('2. Fill contact details and skip file upload', async () => {
    await contactUsPage.fillForm(contactDetails);
  });

  await test.step('3-5. Submit and accept the browser confirmation', async () => {
    await contactUsPage.submitAndAcceptConfirmation();
  });

  await test.step('6-7. Validate data and submit again when the form remains', async () => {
    const formStillVisible = await page.locator('#contact-us-form').isVisible().catch(() => false);
    if (!formStillVisible) return;
    const fields = [
      [contactUsPage.nameField, contactDetails.name],
      [contactUsPage.emailField, contactDetails.email],
      [contactUsPage.subjectField, contactDetails.subject],
      [contactUsPage.messageField, contactDetails.message]
    ] as const;
    for (const [field, value] of fields) {
      if (!(await field.inputValue())) await field.fill(value);
      await expect(field).toHaveValue(value);
    }
    await contactUsPage.submitButton.focus();
    await contactUsPage.submitButton.click();
  });

  await test.step('8. Verify the successful inline message', async () => {
    await expect(page.locator('.status.alert.alert-success')).toHaveText(
      'Success! Your details have been submitted successfully.',
      { timeout: 10000 }
    );
  });

  await test.step('9. Return to the Home page', async () => {
    await page.locator('#form-section a.btn-success').click();
    if (page.url().includes('#google_vignette')) {
      await gotoWithRetry(page, '/');
    }
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });
});
