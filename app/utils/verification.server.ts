import { createCookieSessionStorage } from '@remix-run/node';

const tenMinutesInMilliseconds = 10 * 60; // 10 minutes (if you change this, make sure to change the OTP expiration code!!)
export const verficationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_verify',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.SESSION_SECRET!.split(','),
    secure: process.env.NODE_ENV === 'production',
    maxAge: tenMinutesInMilliseconds,
  },
});
