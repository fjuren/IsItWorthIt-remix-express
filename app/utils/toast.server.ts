import { createCookieSessionStorage } from '@remix-run/node';

// const { getSession, commitSession, destroySession } =

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_toast',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.SESSION_SECRET!.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});
