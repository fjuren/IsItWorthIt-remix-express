import { test, expect } from '@playwright/test';

test('Signup, pw doesnt match', async ({ page }) => {
  await page.goto('/signup');

  await page.getByRole('textbox', { name: 'Email' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: /username/i }).fill('testuser');
  await page.getByLabel('Password', { exact: true }).fill('123');
  await page.getByLabel(/confirm password/i, { exact: true }).fill('124');
  await page.getByRole('checkbox', { name: /remember me/i }).click();
  await page.getByRole('button', { name: /sign up/i }).click();

  await expect(page.locator("text=Passwords don't match")).toBeVisible();
});
