// added to avoid sending bcrypt to the client (See remix docs https://remix.run/docs/en/main/discussion/server-vs-client)
// @ts-expect-error check this error
import bcrypt from 'bcryptjs';
import { redirect } from '@remix-run/node';
import { authSessionStorage } from './session.server';
import { prisma } from './db.server';

export { bcrypt };

// Checks there's a user ID and a user that exists. If so return the user's ID
export async function getUserId(request: Request) {
  const cookie = request.headers.get('cookie');
  const authCookieSession = await authSessionStorage.getSession(cookie);
  const userId = authCookieSession.get('authSession');

  if (!userId) return null;
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw await logout(request);
  }
  return user.id;
}

// Redirects the user to the homepage if authenticated
export async function redirectIfAuthenticated(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect('/');
  }
  return null;
}

// Returns the authenticated users userId. If no userId is found, redirect the user to the login page (ie. Gives userId if available, otherwise protect the route from unauthenticated users)
export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect('/login');
  }
  return userId;
}

// TODO REFACTOR- add login utility here

export async function logout(request: Request) {
  const cookie = request.headers.get('cookie');
  const cookieAuthSession = await authSessionStorage.getSession(cookie);
  const setAuthCookieHeader = await authSessionStorage.destroySession(
    cookieAuthSession
  );

  return redirect('/', {
    headers: {
      'set-cookie': setAuthCookieHeader,
    },
  });
}
