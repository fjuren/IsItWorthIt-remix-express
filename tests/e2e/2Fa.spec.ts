/* eslint-disable no-empty-pattern */
import { test } from 'tests/utils/playwright-utils';
const { expect } = test;
import otpForTesting from '../../otp';

test('User can add 2FA after login, and login again with 2FA', async ({
  page,
  userLogin,
}) => {
  // userLogin is a custom fixture for auto authenticating the user
  await userLogin();

  await page.goto('/settings/account');
  await page.waitForURL('/settings/account');

  await page.getByRole('button', { name: /Enable 2FA/i }).click();

  await page.waitForURL('/two-factor/verify');
  const copyPasteCode = (await page
    .locator('p')
    .filter({ hasText: 'otpauth' })
    .textContent()) as string;

  const otp = otpForTesting(copyPasteCode);

  // enable 2FA
  await page.getByRole('textbox', { name: /two factor code/i }).fill(otp);
  await page.getByRole('button', { name: /submit/i }).click();

  // check email to ensure email was submitting for successful activation
  // TODO get email & ensure subject is correct

  // 2FA enabled
  await page.waitForURL('/settings/account');
  expect(page.getByRole('main')).toHaveText(/You have 2fa enabled/i);

  // go to disable 2FA route
  await page.getByRole('button', { name: /disable 2fa/i }).click();

  // click disable 2FA button
  await page.waitForURL('/two-factor/disable');
  expect(page.getByRole('main')).toHaveText(
    /disabling your two factor authentication/i
  );
  await page.getByRole('button', { name: /disable/i }).click();

  // give 2FA code to disable 2FA
  await page.waitForURL(/.*verify\?.*/);
  expect(page.getByRole('main')).toHaveText(
    /Please check your 2FA application/i
  );
  await page
    .getByRole('textbox', { name: /Enter your verification code below/i })
    .fill(otp);
  await page.getByRole('button', { name: /Verify/i }).click();

  // click disable 2FA button (again, after reconfirmign with 2FA code)
  await page.waitForURL('/two-factor/disable');
  expect(page.getByRole('main')).toHaveText(
    /disabling your two factor authentication/i
  );
  await page.getByRole('button', { name: /disable/i }).click();

  await page.waitForURL('/settings/account');
  expect(page.waitForURL('/settings/account'));

  // TODO logic is set to not show 2FA prompt within 2hrs of giving a 2FA code (for convenience). So this block should be run after a delay of 2 hours
});

test('login', async ({ page, createRegisteredUser }) => {
  const registeredUser = createRegisteredUser();
  // TODO use for login test
  await page.goto('/login');

  await expect(page.getByRole('main')).toHaveText(/Log into your account/);
  await page
    .getByRole('textbox', { name: 'Username' })
    .fill(registeredUser.username);
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(registeredUser.password);
  await page.getByRole('checkbox', { name: 'Remember me' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
});
