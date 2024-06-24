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

// below overrides the commitSession for authSessionStorage. Used to solve the bug related to authSession expires date (if user selected 'remember me' at login), where if a 'remember me' option is not part of a flow but the user submits a verification code, it resets the authSession to expire during the session rather than the set expiry date. Below prevents this 'reset'.
export const originalAuthSessionStorage = authSessionStorage.commitSession;

Object.defineProperty(authSessionStorage, 'commitSession', {
  value: async (...args: Parameters<typeof originalAuthSessionStorage>) => {
    const [session, options] = args;
    if (options?.expires) {
      session.set('expires', options.expires);
    }
    if (options?.maxAge) {
      const expires = new Date(Date.now() + options.maxAge * 1000);
      session.set('expires', expires);
    }
    const expires = session.has('expires')
      ? new Date(session.get('expires'))
      : undefined;
    const setCookieHeader = await originalAuthSessionStorage(session, {
      ...options,
      expires,
    });
    return setCookieHeader;
  },
});
