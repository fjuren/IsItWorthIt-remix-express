import { createCookieSessionStorage } from '@remix-run/node';

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_auth_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: process.env.SESSION_SECRET?.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});

// Create session expiration utility function
const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
export function getCookieSessionExpirationDate() {
  return new Date(Date.now() + thirtyDaysInMilliseconds);
}
