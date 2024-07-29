/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test';
import { newUserData } from 'tests/utils/db-utils';
import { prisma } from '~/utils/db.server';
// import '../mocks/node';
// import { requireMockEmail } from 'tests/mocks/resendHandlers';
import { extractOtp } from 'tests/utils/playwright-utils';
import { requireMockEmail } from 'tests/mocks/resendHandlers';

export const test = base.extend<{
  userData: {
    email: string;
    username: string;
    name: string | null;
    password: string;
  };
}>({
  userData: async ({}, use) => {
    const userData = newUserData();
    const createUser = {
      email: userData.email,
      username: userData.username,
      name: userData.name,
      password: userData.password,
    };

    await use(createUser);

    const deletedUser = await prisma.user.delete({
      select: { username: true },
      where: { username: createUser.username },
    });
    console.log(`User ${deletedUser.username} deleted successfully`);
  },
});

test('Signup flow with OTP only', async ({ page, userData }) => {
  const onboardingUser = userData;
  await page.goto('/signup');

  await page.getByRole('textbox', { name: 'Email' }).fill(onboardingUser.email);
  await page
    .getByRole('textbox', { name: /username/i })
    .fill(onboardingUser.username);
  await page
    .getByLabel('Password', { exact: true })
    .fill(onboardingUser.password);
  await page
    .getByLabel(/confirm password/i, { exact: true })
    .fill(onboardingUser.password);
  await page.getByRole('checkbox', { name: /remember me/i }).click();
  await page.getByRole('button', { name: /sign up/i }).click();

  await expect(
    page.getByText(/Enter your verification code below/i)
  ).toBeVisible();
  const email = await requireMockEmail({ emailAddress: onboardingUser.email });
  await expect(email.from).toBe('fakeemail@gmail.com');
  await expect(email.to).toBe(onboardingUser.email);
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
