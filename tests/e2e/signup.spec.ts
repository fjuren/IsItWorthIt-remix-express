/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test';
import { newUserData } from 'tests/utils/db-utils';
import { prisma } from '~/utils/db.server';
import '../mocks/node';
import { requireMockEmail } from 'tests/mocks/resendHandlers';
import { extractOtp } from 'tests/utils/playwright-utils';

const test = base.extend<{
  newUser: {
    email: string;
    username: string;
    name: string | null;
    password: string;
  };
}>({
  newUser: async ({}, use) => {
    const userData = newUserData();
    const createUser = {
      email: userData.email,
      username: userData.username,
      name: userData.name,
      password: userData.password,
    };
    await use(createUser);
    await prisma.user.deleteMany({
      where: { id: createUser.username },
    });
  },
});

test('Signup flow', async ({ page, newUser }) => {
  const newUserData = await newUser;
  await page.goto('/signup');

  await page.getByRole('textbox', { name: 'Email' }).fill(newUserData.email);
  await page
    .getByRole('textbox', { name: /username/i })
    .fill(newUserData.username);
  await page.getByLabel('Password', { exact: true }).fill(newUserData.password);
  await page
    .getByLabel(/confirm password/i, { exact: true })
    .fill(newUserData.password);
  await page.getByRole('checkbox', { name: /remember me/i }).click();
  await page.getByRole('button', { name: /sign up/i }).click();

  await expect(
    page.getByText(/Enter your verification code below/i)
  ).toBeVisible();
  const email = await requireMockEmail({ emailAddress: newUserData.email });
  await expect(email.from).toBe('fakeemail@gmail.com');
  await expect(email.to).toBe(newUserData.email);
  await expect(email.subject).toBe('Confirm email');

  // Extract OTP code from the HTML
  const otpCode = extractOtp(email.html) as string;

  await page
    .getByRole('textbox', { name: /Enter your verification code below/i })
    .fill(otpCode);
  await page.getByRole('button', { name: /verify/i }).click();
  await expect(page.getByText(/Invalid code/i)).not.toBeVisible();

  await expect(page).toHaveURL(`/`);
  // from success toast message
  await expect(page.getByText('Signed in', { exact: true })).toBeVisible();
});
