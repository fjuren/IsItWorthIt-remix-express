import { createCookieSessionStorage } from '@remix-run/node';

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_auth_session',
    // expires: new Date(Date.now() + 60_000),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: process.env.SESSION_SECRET?.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});
