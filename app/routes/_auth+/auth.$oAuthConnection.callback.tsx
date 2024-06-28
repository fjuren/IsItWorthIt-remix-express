// app/routes/auth.discord.callback.tsx
import type { LoaderFunctionArgs } from '@remix-run/node';
import { auth } from '~/utils/oAuthConnections/discord.server';
import { capitalizeFirstLetter } from '~/utils/misc';
import { DISCORD_OAUTH_NAME } from '~/utils/oAuthConnections';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const oAuthConnectionName = capitalizeFirstLetter(
    params.oAuthConnection as string
  );

  // TODO add toast when modularized version is ready
  const result = await auth.authenticate(oAuthConnectionName, request, {
    throwOnError: true,
  });
  console.log({ result });
  console.log(`You are authed with ${oAuthConnectionName}`);
  return auth.authenticate(DISCORD_OAUTH_NAME, request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
  // return null;
}
