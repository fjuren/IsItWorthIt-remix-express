import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { authSessionStorage } from '~/utils/session.server';

export async function loader() {
  return redirect('/');
}

export async function action({ request }: LoaderFunctionArgs) {
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
