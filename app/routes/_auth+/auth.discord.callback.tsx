// app/routes/auth.discord.callback.tsx
import type { LoaderFunctionArgs } from '@remix-run/node';
import { auth } from '~/utils/auth.server';
import { DISCORD_OAUTH_NAME } from '~/utils/oAuthConnections';

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO add toast when modularized version is ready
  const result = await auth.authenticate(DISCORD_OAUTH_NAME, request, {
    throwOnError: true,
  });
  console.log({ result });
  return auth.authenticate(DISCORD_OAUTH_NAME, request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
  // return null;
}
