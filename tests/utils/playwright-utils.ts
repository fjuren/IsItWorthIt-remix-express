/* eslint-disable no-empty-pattern */
import { test as base } from '@playwright/test';
import { registerUser } from './db-utils';
import { prisma } from '~/utils/db.server';
import { authSessionStorage } from '~/utils/session.server';
import * as setCookieParser from 'set-cookie-parser';
import { authSessionKey } from '~/utils/constants';

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
};

// parses email body for the OTP from the newly created email stored in the file system
export function extractOtp(emailHtmlBody: string) {
  const match = emailHtmlBody.match(/code (\d+)\./);
  const otpCode = match ? match[1] : '';
  return otpCode;
}

export const test = base.extend<{
  createRegisteredUser(): User;
  userLogin(): Promise<User>;
}>({
  // registers a user. Don't need to sign up the user in the test when using this
  createRegisteredUser: async ({}, use) => {
    const registeredUser = await registerUser();

    await use(() => registeredUser);

    const deletedUser = await prisma.user.delete({
      select: { username: true },
      where: { username: registeredUser.username },
    });
    console.log(`User ${deletedUser} has been deleted from db`);
  },
  // userLogin is a custom fixture for auto authenticating the user
  userLogin: async ({ page }, use) => {
    let username: string | undefined = undefined;
    await use(async () => {
      const registeredUser = await registerUser();
      username = registeredUser.username;

      const cookieAuthSession = await authSessionStorage.getSession();
      cookieAuthSession.set(authSessionKey, registeredUser.id);
      const setAuthCookieHeader = await authSessionStorage.commitSession(
        cookieAuthSession
      );

      // commitAuthSession needs to be parsed since Playwright API addCookies requires name value
      // await browserContext.addCookies([cookieObject1, cookieObject2]);
      // from docs: Can use setCookieParser.parse for array of cookies
      const cookie = setCookieParser.parseString(setAuthCookieHeader);

      await page.context().addCookies([
        {
          name: cookie.name,
          value: cookie.value,
          domain: 'localhost',
          path: '/',
        },
      ]);

      return registeredUser;
    });

    if (username) {
      const deletedUser = await prisma.user.delete({
        select: { username: true },
        where: { username: username },
      });
      console.log(`User ${deletedUser} has been deleted from db`);
    } else {
      console.log('user not found');
    }
  },
});

// test has custom fixtures. So this allows me to import expect in my test cases using the new test with base.extend
export const { expect } = test;
