// import type { MetaFunction } from '@remix-run/node';

import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Link,
  MetaFunction,
  useFetcher,
  useFetchers,
  useLoaderData,
} from '@remix-run/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import {
  twoFAVerificationEnabledType,
  twoFAVerifyVerificationType,
} from '~/routes/_auth+/verify';
import { requireUser } from '~/utils/auth.server';
import { prisma } from '~/utils/db.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { Theme, getTheme, setTheme } from '~/utils/theme.server';
import { prepVerificationCode } from '~/utils/verification.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings' },
    { name: 'description', content: 'Settings page' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request); // protects route; requireUser also check authentication with helper (must be authorized)

  // check if 2FA is enabled
  const twoFAEnabled = await prisma.authVerificationCode.findUnique({
    where: {
      type_target: {
        type: twoFAVerificationEnabledType,
        target: user.id,
      },
    },
    select: { id: true },
  });

  return json({
    isTwoFAEnabled: Boolean(twoFAEnabled),
    headers: getTheme(request),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request); // protects route; requireUser also check authentication with helper (must be authorized)

  const formData = await request.formData();
  // button intent with switch statements will handle forms with multiple buttons
  const intent = formData.get('intent');
  switch (intent) {
    case 'enable-2fa':
      {
        await prepVerificationCode({
          request,
          type: twoFAVerifyVerificationType,
          target: user.id,
        });
      }

      return redirect('/two-factor/verify');
    case 'disable-2fa':
      return redirect('/two-factor/disable');
    // default:
    //   return redirect('/settings/account');
  }

  const submission = parseWithZod(formData, { schema: themeSchema });
  if (submission.status !== 'success') {
    return json({ status: 'error', submission: submission.reply() });
  }

  const reponseInit = {
    headers: {
      'set-cookie': setTheme(submission.value.theme),
    },
  };

  return json({ success: true, submission }, reponseInit);
}

export default function UserSettings() {
  const data = useLoaderData<typeof loader>(); // commented out because useOptimisticUITheme handles the loader data, to help with optimistic UI on slower networks
  const theme = useOptimisticUITheme();
  return (
    <>
      <Form method="post">
        <div>
          <h1>Settings</h1>
          <div>
            <Link to="/settings/profile" relative="path">
              Profile
            </Link>
          </div>
          <div>
            Two-factor authentication (2FA) is an extra layer of security for
            your account. If this is enabled, you will be required to use your
            username, password and a temporary code using an authenticator app
            (eg. 1Password) to access your account.
          </div>
          <div>
            {data.isTwoFAEnabled ? (
              <>
                <p className="text-green-700 font-bold">
                  You have 2FA enabled!
                </p>
                <Button name="intent" value="disable-2fa" type="submit">
                  Disable 2FA
                </Button>
              </>
            ) : (
              <Button name="intent" value="enable-2fa" type="submit">
                Enable 2FA
              </Button>
            )}
          </div>
          <Link to=".." relative="path">
            back
          </Link>
        </div>
      </Form>
      {/* TODO plan how to handle theming UX/UI */}
      <div>
        <ThemeToggle userPreferences={theme} />
      </div>
    </>
  );
}

const themeSchema = z.object({
  theme: z.enum(['light', 'dark']),
});

function ThemeToggle({ userPreferences }: { userPreferences?: Theme }) {
  const fetcher = useFetcher<typeof action>(); // recall fetcher is used for non-navigation form submits. Toggling the theme in this case

  const [form] = useForm({
    id: 'toggle-theme',
    lastResult: fetcher.data?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: themeSchema });
    },
  });
  const theme = userPreferences ?? 'light';
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  const themeLabel = {
    light: <p>Light</p>,
    dark: <p>Dark</p>,
  };

  return (
    <fetcher.Form method="post" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextTheme} />
      <div className="flex gap-2">
        <Button name="intent" value="update-theme" type="submit">
          {themeLabel[theme]}
        </Button>
      </div>
      <FormOrFieldErrorsList errorID={form.errorId} data={form.errors} />
      {/* TODO need FormError handler??? */}
    </fetcher.Form>
  );
}

// useUITheme is to support slower networks
export function useOptimisticUITheme() {
  const data = useLoaderData<typeof loader>();
  // useFetchers hook captures all page fetchers as an array
  const fetchers = useFetchers();
  const themeFetcher = fetchers.find(
    (fetcher) => fetcher.formData?.get('intent') == 'update-theme'
  );
  const optimisticUITheme = themeFetcher?.formData?.get('theme');

  return optimisticUITheme === 'light' || optimisticUITheme === 'dark'
    ? optimisticUITheme
    : data.headers;
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        500: () => <p>Sorry, something went wrong! Try again later.</p>,
      }}
    />
  );
}
