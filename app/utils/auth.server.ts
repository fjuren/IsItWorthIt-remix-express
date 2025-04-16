// added to avoid sending bcrypt to the client (See remix docs https://remix.run/docs/en/main/discussion/server-vs-client)
// @ts-expect-error check this error
import bcrypt from 'bcryptjs';
import { redirect } from 'react-router';
import { authSessionStorage } from './session.server';
import { prisma } from './db.server';
import { OAuthUser } from './oAuthConnections/oAuthConnection';
import { DISCORD_OAUTH_NAME } from './oAuthConnections';
import { discordAvatarToUrl } from './oAuthConnections/discord.server';
import { authSessionKey } from './constants';

export { bcrypt };

// Checks there's a user ID from authenticated cookie and that a user that exists. If so return the user's ID. Log them out otherwise
export async function getUserId(request: Request) {
  const cookie = request.headers.get('cookie');
  const authCookieSession = await authSessionStorage.getSession(cookie);
  const userId = authCookieSession.get(authSessionKey);

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

// Redirects the user to the homepage if authenticated (eg. redirect if authed user attempts to go to /signup route)
export async function redirectIfAuthenticated(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect('/');
  }
  return null;
}

// Ensures authentication and offers support for redirects (useful for sending a user to an authenticated page and offers a redirect once logged in - better UX implementation).
// Returns the authenticated users userId. If no userId is found, checks whether the user is being redirected. (ie. Gives userId if available, otherwise protect the route from unauthenticated users and offers redirect functionality)
export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const userId = await getUserId(request);
  const requestUrl = new URL(request.url);
  if (!userId) {
    // explicitly set redirectTo to null if explicitly given (ie. can prevent redirect altogether with giving null)
    if (redirectTo === null) {
      redirectTo = null;
    } else {
      // if redirectTo not explicitely given, use the current URL's path and query string as the default redirectTo value. Otherwise use whatever is given in redirectTo
      // note that this checks for both null and undefined (ie nothing explicetly given)
      if (redirectTo == null) {
        redirectTo = `${requestUrl.pathname}${requestUrl.search}`;
      }
    }
    // if the redirectTo is available, use URLSearchParams to create a search query using params set by latest defined redirectTo.
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    // if there's an explicit redirect, this will first have the user login; and the url will include the login path + redirect (ie. search params)
    // When taken to login page, URL will show redirectTo parameters already. This is NOT part of the login loader!!
    const loginRedirect = ['/login', loginParams?.toString()]
      .filter(Boolean)
      .join('?');
    throw redirect(loginRedirect);
  }
  return userId;
}

// Ensure authorization. If the userId doesn't match the intended user, redirects the user to the homepage. (ie. Protects the routes from unauthorized users)
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      username: true,
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw await logout(request);
  }
  return user;
}

// TODO REFACTOR- add login utility here

// for oAuth onboarding; creates a new user and makes relates them to their oAuth connection
export async function onboardWithOAuthConnection({
  oAuthUser,
}: {
  oAuthUser: OAuthUser;
}) {
  const discordAvatarUrl = discordAvatarToUrl(
    oAuthUser.oAuthConnectionProviderId,
    oAuthUser.avatar
  );
  const newUser = await prisma.user.create({
    data: {
      email: oAuthUser.email,
      username: oAuthUser.username,
      image:
        oAuthUser.oAuthConnectionProviderName === DISCORD_OAUTH_NAME
          ? {
              create: {
                altText: 'Users profile image',
                contentType: '.png',
                blob: discordAvatarUrl,
              },
            }
          : undefined,
      roles: {
        connect: {
          name: 'user',
        },
      },
      oAuthConnections: {
        create: [
          {
            connectionName: oAuthUser.oAuthConnectionProviderName,
            connectionId: oAuthUser.oAuthConnectionProviderId,
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });
  return newUser;
}

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
