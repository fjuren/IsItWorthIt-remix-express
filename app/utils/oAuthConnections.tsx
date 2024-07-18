import { Form } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Input } from '~/components/UI/Input';

export const DISCORD_OAUTH_NAME = 'Discord';
export const GMAIL_OATH_NAME = 'Gmail';

// enum oAuthConnectionNames {
//   discord = DISCORD_OAUTH_NAME,
//   gmail = GMAIL_OATH_NAME,
// }

const oAuthConnectionNames = [DISCORD_OAUTH_NAME, GMAIL_OATH_NAME] as const;
export const OauthServicesNameSchema = z.enum(oAuthConnectionNames);
export type ServiceName = z.infer<typeof OauthServicesNameSchema>;

export function oAuthConnectionForm({
  type,
  oAuthConnectionName,
  redirectTo,
}: {
  type: 'Login' | 'Signup';
  oAuthConnectionName: ServiceName;
  redirectTo?: string | null;
}) {
  const formAction = `/auth/${oAuthConnectionName}`;

  return (
    <Form action={formAction} method="POST">
      {redirectTo ? (
        <Input name="redirect-ro" value={redirectTo} type="hidden"></Input>
      ) : null}
      <Button type="submit" name="intent" value="oauth">
        {type} with {oAuthConnectionName}
      </Button>
    </Form>
  );
}
