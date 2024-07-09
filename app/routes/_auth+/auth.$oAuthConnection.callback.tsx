// app/routes/auth.discord.callback.tsx
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { auth } from '~/utils/oAuthConnections/discord.server';
import { capitalizeFirstLetter } from '~/utils/misc';
import { prisma } from '~/utils/db.server';
import { handleAuthSession } from './login';
import { getUserId } from '~/utils/auth.server';
import { verficationSessionStorage } from '~/utils/verification.server';
import { verifySessionKey } from './verify';
import { generalToast, toastVerificationKey } from '~/utils/toast.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const oAuthConnectionName = capitalizeFirstLetter(
    params.oAuthConnection as string
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
  console.log({ oAuthUserProfile });
  console.log(`You are authed with ${oAuthConnectionName}`);

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
    return redirect('/');
  }

  // If an oAuth connection is already established in the db, simply log them in
  if (existingConnection) {
    return handleAuthSession({
      request,
      userId: existingConnection.userId,
      rememberMe: true,
      redirectTo: '/',
    });
  }
  // if no existing connection, but user exists, connect them
  else if (!existingConnection && user) {
    // update user with connection, then log them in
    await prisma.oAuthConnection.create({
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
        redirectTo: '/',
      },
      {
        headers: await generalToast({
          //BUG toast doesn't display when successfully connecting an oAuth connection with an existing user
          request,
          key: toastVerificationKey,
          toastVariant: 'success',
          toastTitle: "You're in!",
          toastDescription: `Your ${oAuthConnectionName} account has been successfully linked`,
        }),
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

  return redirect(`/onboard/${oAuthConnectionName}`, {
    headers: { 'set-cookie': setVerifyCookieSession },
  });
}
