import { createCookieSessionStorage } from '@remix-run/node';

export const oAuthConnectionSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_oAuth_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    //maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET?.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});
