import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { auth } from '~/utils/auth.server';
import { DISCORD_OAUTH_NAME } from '~/utils/oAuthConnections';

export function loader() {
  return redirect('/login');
}

export function action({ request }: ActionFunctionArgs) {
  return auth.authenticate(DISCORD_OAUTH_NAME, request);
}
