// import type { MetaFunction } from '@remix-run/node';

import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import {
  Form,
  Link,
  MetaFunction,
  useFetcher,
  useLoaderData,
} from '@remix-run/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { FieldErrorsList } from '~/utils/misc';
import { Theme, getTheme, setTheme } from '~/utils/theme.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Settings' },
    { name: 'description', content: 'Settings page' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    headers: getTheme(request),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
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
  const data = useLoaderData<typeof loader>();
  const theme = data.headers;

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <ThemeToggle userPreferences={theme} />
      </div>
      <Link to=".." relative="path">
        back
      </Link>
    </div>
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
      <FieldErrorsList errorID={form.errorId} data={form.errors} />
      {/* TODO need FormError handler??? */}
    </fetcher.Form>
  );
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
