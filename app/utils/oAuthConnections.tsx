import { Form } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';

export const DISCORD_OAUTH_NAME = 'Discord';
export const GMAIL_OATH_NAME = 'Gmail';

// enum oAuthServiceNames {
//   discord = DISCORD_OAUTH_NAME,
//   gmail = GMAIL_OATH_NAME,
// }

const oAuthServiceNames = [DISCORD_OAUTH_NAME, GMAIL_OATH_NAME] as const;
export const OauthServicesNameSchema = z.enum(oAuthServiceNames);
export type ServiceName = z.infer<typeof OauthServicesNameSchema>;

export function oAuthConnectionForm({
  type,
  oAuthServiceName,
}: {
  type: 'Login' | 'Signup';
  oAuthServiceName: ServiceName;
}) {
  const formAction = `/auth/${oAuthServiceName}`;

  return (
    <Form action={formAction} method="POST">
      <Button type="submit" name="intent" value="oauth">
        {type} with {oAuthServiceName}
      </Button>
    </Form>
  );
}
