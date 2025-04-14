import { ActionFunctionArgs, redirect } from 'react-router';
import { oAuthRedirectSessionStorage } from '~/utils/oAuthConnections.server';
import { auth } from '~/utils/oAuthConnections/discord.server';

export function loader() {
  return redirect('/login');
}

export async function action({ request, params }: ActionFunctionArgs) {
  const oAuthConnectionName = params.oAuthConnection as string;

  try {
    return await auth.authenticate(oAuthConnectionName, request, {
      successRedirect: '/',
      failureRedirect: '/signup',
    });
  } catch (err) {
    if (err instanceof Response) {
      const checkReferer = request.headers.get('referer');
      const refererURL = checkReferer ? new URL(checkReferer) : null;
      const searchParams = refererURL?.searchParams;
      const redirectTo = searchParams?.get('redirectTo');
      const oAuthRedirectSession = await oAuthRedirectSessionStorage.getSession(
        request.headers.get('cookie')
      );
      oAuthRedirectSession.set(auth.sessionKey, redirectTo);
      err.headers.append(
        'set-cookie',
        (await oAuthRedirectSessionStorage.commitSession(
          oAuthRedirectSession
        )) ?? '/'
      );
    }
    throw err;
  }
}

// return await auth.authenticate(oAuthConnectionName, request, {
//   successRedirect: '/settings/profile',
//   failureRedirect: '/signup',
// });
// }
