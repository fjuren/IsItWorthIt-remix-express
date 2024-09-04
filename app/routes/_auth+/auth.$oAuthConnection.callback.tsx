// app/routes/auth.discord.callback.tsx
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { auth } from '~/utils/oAuthConnections/discord.server';
import { capitalizeFirstLetter, combineHeaders } from '~/utils/misc';
import { prisma } from '~/utils/db.server';
import { handleAuthSession } from './login.server';
import { getUserId } from '~/utils/auth.server';
import { verficationSessionStorage } from '~/utils/verification.server';
import { oAuthRedirectSessionStorage } from '~/utils/oAuthConnections.server';
import { verifySessionKey } from '~/utils/constants';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const oAuthConnectionName = capitalizeFirstLetter(
    params.oAuthConnection as string
  );

  const oAuthSession = await oAuthRedirectSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const redirectTo = oAuthSession.get(auth.sessionKey) ?? '/';
  const destoryRedirectTo = await oAuthRedirectSessionStorage.destroySession(
    oAuthSession
  );

  // TODO add toast when modularized version is ready
  // oAuthUserProfile is the profile data from the oAuth connection provider
  const oAuthUserProfile = await auth
    .authenticate(oAuthConnectionName, request, {
      throwOnError: true,
    })
    .catch(async (err) => {
      console.log('Issue with oAuth provider: ', err);
      throw await redirect('/login');
    });

  const alreadyLoggedIn = await getUserId(request);
  const oAuthEmailExists = oAuthUserProfile.email ?? undefined;

  const existingConnection = await prisma.oAuthConnection.findUnique({
    where: {
      connectionId_connectionName: {
        connectionName: oAuthConnectionName,
        connectionId: oAuthUserProfile.id,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      email: oAuthEmailExists,
    },
    select: {
      id: true,
    },
  });

  // if oAuth is alredy created and the user is already logged in, just take them to the login page. User a toast message to say they're already logged in
  if (existingConnection && alreadyLoggedIn) {
    // TODO add toast message
    return redirect(redirectTo.toString(), {
      headers: { 'set-cookie': destoryRedirectTo },
    });
  }

  // If an oAuth connection is already established in the db, simply log them in
  if (existingConnection) {
    console.log('existingConnection');
    return handleAuthSession(
      {
        request,
        userId: existingConnection.userId,
        rememberMe: true,
        redirectTo: redirectTo.toString(),
      },
      {
        headers: { 'set-cookie': destoryRedirectTo },
      }
    );
  }
  // if no existing connection, but user exists, connect them
  else if (!existingConnection && user) {
    console.log('!existingConnection && user');
    // update user with connection, then log them in
    const userConnection = await prisma.oAuthConnection.create({
      data: {
        connectionName: oAuthConnectionName,
        connectionId: oAuthUserProfile.id,
        userId: user.id,
      },
    });
    return handleAuthSession(
      {
        request,
        userId: user.id,
        redirectTo: redirectTo.toString(),
        oAuthConnectionName: userConnection.connectionName,
      },
      {
        headers: { 'set-cookie': destoryRedirectTo },
      }
    );
  }

  // if there is no connection and previous checks are null, this is a net new user. Onboard/signup the user with a new connection
  const verifyCookieSession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  verifyCookieSession.set(verifySessionKey, { oAuthUserProfile });
  const setVerifyCookieSession = await verficationSessionStorage.commitSession(
    verifyCookieSession
  );

  const cleanRedirectToForOnboard =
    redirectTo === '/' ? null : new URLSearchParams({ redirectTo });
  console.log(cleanRedirectToForOnboard);

  const onboardRedirectTo = [
    `/onboard/${oAuthConnectionName}`,
    cleanRedirectToForOnboard,
  ]
    .filter(Boolean)
    .join('?');

  return redirect(onboardRedirectTo.toString(), {
    headers: combineHeaders(
      { 'set-cookie': setVerifyCookieSession },
      { 'set-cookie': destoryRedirectTo }
    ),
  });
}
