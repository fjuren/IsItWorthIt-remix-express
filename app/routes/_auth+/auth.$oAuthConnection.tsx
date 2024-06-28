import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { auth } from '~/utils/oAuthConnections/discord.server';

export function loader() {
  return redirect('/login');
}

export function action({ request, params }: ActionFunctionArgs) {
  const oAuthConnectionName = params.oAuthConnection as string;

  return auth.authenticate(oAuthConnectionName, request);
}
