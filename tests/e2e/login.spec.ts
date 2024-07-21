import { test, expect } from '@playwright/test';

test('Login with remember me', async ({ page }) => {
  await page.goto('/login');

  // Expect a title "to contain" a substring.
  await expect(page.getByRole('main')).toHaveText(/Log into your account/);

  await page.getByRole('textbox', { name: 'Username' }).fill('fjuren');
  await page.getByRole('textbox', { name: 'Password' }).fill('123');
  await page.getByRole('checkbox', { name: 'Remember me' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
});
