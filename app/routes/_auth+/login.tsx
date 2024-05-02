import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { authSessionStorage } from '~/utils/session.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Login' },
    {
      name: 'description',
      content: 'Log in to your account',
    },
  ];
};

const usernameMaxLength: number = 20;
const minLength: number = 3;
const passwordMaxLength: number = 100;

const LoginSchema = z.object({
  username: z
    .string({ required_error: 'Please enter your username' })
    .min(minLength, { message: 'Username is too short' })
    .max(usernameMaxLength, {
      message: 'Must be 20 or fewer characters long',
    }),
  password: z
    .string({ required_error: 'Please enter your password' })
    .min(minLength, { message: 'Password is too short' })
    .max(passwordMaxLength, {
      message: 'Must be 100 or fewer characters long',
    }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: LoginSchema.transform(async (val, ctx) => {
      // query username in db, entered in login form
      const user = await prisma.user.findUnique({
        select: { id: true },
        where: {
          username: val.username,
        },
      });
      // if user doesn't exist
      if (!user) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid username or password',
        });
        return z.NEVER;
      }
      return { ...val, user };
    }),
    async: true,
  });
  // remove this from the submission back to the client
  delete submission.payload.password;

  if (submission.status != 'success') {
    return json(
      {
        result: submission.reply({
          hideFields: ['password'],
        }),
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    );
  }

  const { user } = await submission.value;

  // if user exists and the submission is successful
  if (submission.status === 'success') {
    // login cook set
    const cookie = request.headers.get('cookie');
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set('authSession', user.id);
    const setCookieHeader = await authSessionStorage.commitSession(
      cookieAuthSession
    );
    return redirect('/', {
      headers: {
        'set-cookie': setCookieHeader,
      },
    });
  } else {
    throw new Response('Not found', { status: 500 });
  }
}

export default function LoginRoute() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: 'login',
    constraint: getZodConstraint(LoginSchema),
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
  });

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Log into your account</p>
        </div>
        <div className="w-80">
          <Form method="POST" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.username.id}>Username</Label>
              <Input
                {...getInputProps(fields.username, { type: 'text' })}
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.username.errors}
                  errorID={fields.username.id}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={fields.password.id}>Pasword</Label>
              <Input
                {...getInputProps(fields.password, { type: 'password' })}
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.password.errors}
                  errorID={fields.password.id}
                />
              </div>
            </div>
            <div>
              <FormOrFieldErrorsList
                data={form.errors}
                errorID={form.errorId}
              />
            </div>
            <div>
              <Button type="submit" name="intent" value="login">
                Log in
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
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
