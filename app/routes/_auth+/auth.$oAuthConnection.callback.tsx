// app/routes/auth.discord.callback.tsx
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { auth } from '~/utils/oAuthConnections/discord.server';
import { capitalizeFirstLetter } from '~/utils/misc';
import { prisma } from '~/utils/db.server';
import { handleAuthSession } from './login';
import { getUserId } from '~/utils/auth.server';
import { verficationSessionStorage } from '~/utils/verification.server';
import { verifySessionKey } from './verify';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const oAuthConnectionName = capitalizeFirstLetter(
    params.oAuthConnection as string
  );

  // TODO add toast when modularized version is ready
  // userProfile is the profile data from the oAuth connection provider
  const userProfile = await auth
    .authenticate(oAuthConnectionName, request, {
      throwOnError: true,
    })
    .catch(async (err) => {
      console.log('Issue with oAuth provider: ', err);
      throw await redirect('/login');
    });
  console.log({ userProfile });
  console.log(`You are authed with ${oAuthConnectionName}`);

  const alreadyLoggedIn = await getUserId(request);
  const oAuthEmailExists = userProfile.email ?? undefined;

  const existingConnection = await prisma.oAuthConnection.findUnique({
    where: {
      connectionId_connectionName: {
        connectionName: oAuthConnectionName,
        connectionId: userProfile.id,
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      email: oAuthEmailExists,
    },
    select: {
      email: true,
    },
  });

  // if oAuth is alredy created and the user is already logged in, just take them to the login page
  if (existingConnection && alreadyLoggedIn) {
    // TODO add toast message
    return redirect('/');
  }

  // If an oAuth connection is already established in the db, have them log in
  if (existingConnection) {
    return handleAuthSession({
      request,
      userId: existingConnection.userId,
      rememberMe: true,
      redirectTo: '/',
    });
  }
  // if no existing connection, but user exists, connect them
  else if (!existingConnection && userProfile.email === user?.email) {
    // update user with connection, then log them in
  }

  // if there is no connection and previous checks are null, onboard/signup the user with a new connection
  const verifyCookieSession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  verifyCookieSession.set(verifySessionKey, { userProfile });
  const setVerifyCookieSession = await verficationSessionStorage.commitSession(
    verifyCookieSession
  );

  return redirect(`/onboard/${oAuthConnectionName}`, {
    headers: { 'set-cookie': setVerifyCookieSession },
  });
}
