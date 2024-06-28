import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { CheckboxConform } from '~/components/UI/Checkbox';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { bcrypt, redirectIfAuthenticated } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import {
  authSessionStorage,
  getCookieSessionExpirationDate,
} from '~/utils/session.server';
import {
  verficationSessionStorage,
  verificationRedirect,
} from '~/utils/verification.server';
import {
  authSessionKey,
  rememberMeKey,
  twoFAVerificationEnabledType,
  unverifiedSessionKey,
} from './verify';
import { PasswordSchema, UsernameSchema } from '~/utils/fieldValidation';
import { oAuthConnectionForm } from '~/utils/oAuthConnections';

export const meta: MetaFunction = () => {
  return [
    { title: 'Login' },
    {
      name: 'description',
      content: 'Log in to your account',
    },
  ];
};

const LoginSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  rememberMe: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await redirectIfAuthenticated(request);
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfAuthenticated(request); // using this to prevent already authed user from submitting a login request
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  const submission: any = await parseWithZod(formData, {
    schema: LoginSchema.transform(async (val, ctx) => {
      // query username in db, entered in login form
      const userAndPassword = await prisma.user.findUnique({
        select: {
          id: true,
          password: {
            select: { hash: true },
          },
        },
        where: {
          username: val.username,
        },
      });
      // if user doesn't exist
      if (!userAndPassword || !userAndPassword.password) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid username or password',
        });
        return z.NEVER;
      }

      // validate the submitted password
      const isPWvalid = await bcrypt.compare(
        val.password,
        userAndPassword.password.hash
      );
      if (!isPWvalid) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid username or password',
        });
        return z.NEVER;
      }

      return {
        ...val,
        user: { id: userAndPassword.id },
      };
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
  const { rememberMe, user, redirectTo } = await submission.value;

  // Get the user 2FA setting preference
  const twoFAEnabled = await prisma.authVerificationCode.findUnique({
    select: {
      id: true,
    },
    where: {
      type_target: {
        type: twoFAVerificationEnabledType,
        target: user.id,
      },
    },
  });
  // give true if it's enabled
  const hasTwoFAEnabled = Boolean(twoFAEnabled);
  // const verificationCodeId = twoFAEnabled ? twoFAEnabled.id : null;

  // if user exists and the submission is successful
  if (submission.status === 'success') {
    // check if they have 2fa enabled
    if (hasTwoFAEnabled) {
      // redirect to the 2FA page and set up a verify cookie session if the user has set up their 2FA
      const unverifiedCookieSession =
        await verficationSessionStorage.getSession();
      unverifiedCookieSession.set(unverifiedSessionKey, { userId: user.id });
      unverifiedCookieSession.set(rememberMeKey, { rememberMe: rememberMe });
      console.log('REMEMBER ME FROM LOGIN: ', rememberMe);

      const setUnverifiedSessionCookieHeader =
        await verficationSessionStorage.commitSession(unverifiedCookieSession);

      const redirectUrl = verificationRedirect({
        request,
        redirectTo,
        type: twoFAVerificationEnabledType,
        target: user.id,
      });

      return redirect(redirectUrl.toString(), {
        headers: { 'set-cookie': setUnverifiedSessionCookieHeader },
      });
    } else {
      const cookie = request.headers.get('cookie');
      // Continue with regular login without 2FA redirect
      const cookieAuthSession = await authSessionStorage.getSession(cookie);
      cookieAuthSession.set(authSessionKey, user.id);
      const setAuthCookieHeader = await authSessionStorage.commitSession(
        cookieAuthSession,
        { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
      );
      // docs to safeRedirect; prevents malicious redirects :) (https://github.com/sergiodxa/remix-utils#safe-redirects)
      return redirect(safeRedirect(redirectTo), {
        headers: {
          'set-cookie': setAuthCookieHeader,
        },
      });
    }
  } else {
    throw new Response('Not found', { status: 500 });
  }
}

export default function LoginRoute() {
  const lastResult = useActionData<typeof action>();
  // relevant for redirect; get the redirect from search params (if null, it should be ignored)
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [form, fields] = useForm({
    id: 'login',
    defaultValue: { redirectTo: redirectTo },
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
                  errorID={fields.username.errorId}
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
              <Input
                {...getInputProps(fields.redirectTo, { type: 'hidden' })}
              />
            </div>
            <div className="flex py-2 justify-between items-center">
              <div>
                <CheckboxConform meta={fields.rememberMe} />
                <Label className="ml-2 self-end" htmlFor={fields.rememberMe.id}>
                  Remember me
                </Label>
                <div>
                  <FormOrFieldErrorsList
                    data={fields.rememberMe.errors}
                    errorID={fields.rememberMe.id}
                  />
                </div>
              </div>
              <div>
                <Button variant="link" asChild>
                  <Link to="/forgot-password">Forgot password</Link>
                </Button>
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
            <br />
          </Form>
          <div>
            {oAuthConnectionForm({
              type: 'Login',
              oAuthConnectionName: 'Discord',
            })}
          </div>
          <div>
            <Button variant="link" asChild>
              <Link to="/signup">Don&apos;t have an account? Sign up</Link>
            </Button>
          </div>
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
