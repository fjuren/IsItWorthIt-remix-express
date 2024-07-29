/* eslint-disable no-empty-pattern */
import { test } from 'tests/utils/playwright-utils';
const { expect } = test;

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
