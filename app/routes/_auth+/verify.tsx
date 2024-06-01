import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Label } from '~/components/UI/Label';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { redirectIfAuthenticated } from '~/utils/auth.server';
import { FormOrFieldErrorsList, combineHeaders } from '~/utils/misc';
import { verficationSessionStorage } from '~/utils/verification.server';
import { prisma } from '~/utils/db.server';
import { verifyTOTP } from '@epic-web/totp';
import { toastSessionStorage } from '~/utils/toast.server';
import {
  authSessionStorage,
  getCookieSessionExpirationDate,
} from '~/utils/session.server';
import { checkCSRF } from '~/utils/csrf.server';
import { checkHoneypot } from '~/utils/honeypot.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Verify' },
    {
      name: 'description',
      content: 'Verify your email address',
    },
  ];
};

const verifySchema = z.object({
  code: z.string({
    required_error: 'Please enter your code. It was sent to your email address',
  }),
  target: z.string().email(),
  type: z.string(),
});

async function requireOnboardEmail(request: Request) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const sessionData = verifySession.get('verifySession');
  if (!sessionData || typeof sessionData.email !== 'string') {
    throw redirect('/signup');
  }
  const { email } = sessionData;
  return email;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);
  const email = await requireOnboardEmail(request);

  return json({ email });
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfAuthenticated(request);
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  const submission = await parseWithZod(formData, {
    schema: verifySchema.superRefine(async (data, ctx) => {
      // code sent by the user
      const enteredCode = data.code;
      // get the code config from the db
      const verifyCodeConfig = await prisma.authVerificationCode.findUnique({
        select: {
          secret: true,
          period: true,
          digits: true,
          algorithm: true,
          charSet: true,
        },
        where: {
          type_target: {
            type: data.type,
            target: data.target,
          },
          OR: [
            {
              expiresAt: { gt: new Date() },
            },
            { expiresAt: null },
          ],
        },
      });
      if (!verifyCodeConfig) {
        ctx.addIssue({
          path: ['code'],
          code: 'custom',
          message: 'Invalid code',
          fatal: true,
        });
        return z.NEVER;
      }
      // determine validity of entered code
      const isValid = verifyTOTP({ otp: enteredCode, ...verifyCodeConfig });
      if (!isValid) {
        ctx.addIssue({
          path: ['code'],
          code: 'custom',
          message: 'Invalid code',
          fatal: true,
        });
        return z.NEVER;
      }
      // code is valid, delete config from db
      await prisma.authVerificationCode.delete({
        where: {
          type_target: {
            type: data.type,
            target: data.target,
          },
        },
      });
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200,
    });
  }

  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const { email, username, hashPassword, rememberMe } =
    verifySession.get('verifySession');

  if (submission.status === 'success') {
    // create the new user record in the db
    const user = await prisma.user.create({
      select: { id: true },
      data: {
        email: email,
        username: username.toLowerCase().trim(),
        roles: {
          connect: {
            name: 'user',
          },
        },
        password: {
          create: {
            hash: hashPassword,
          },
        },
      },
    });

    // show toaster success message using cookieSession
    const cookie = request.headers.get('cookie');
    const cookieSession = await toastSessionStorage.getSession(cookie);
    // replace 'set' with 'flash'. flash method automatically unsets value after the next 'get' for 'authMessage'
    cookieSession.flash('registrationMessage', {
      type: 'success',
      title: 'Signed in',
      description: 'You are signed in',
    });
    const setToastCookieHeader = await toastSessionStorage.commitSession(
      cookieSession
    );

    // set cookie session for authentication
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set('authSession', user.id);
    const setAuthCookieHeader = await authSessionStorage.commitSession(
      cookieAuthSession,
      { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
    );

    return redirect('/', {
      headers: combineHeaders(
        { 'set-cookie': setToastCookieHeader },
        { 'set-cookie': setAuthCookieHeader }
      ),
    });
  }
}

export default function VerifyRoute() {
  const data = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  // // relevant for redirect; get the redirect from search params (if null, it should be ignored)
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target') ?? '';
  const type = searchParams.get('type') ?? '';
  const [form, fields] = useForm({
    id: 'verify',
    defaultValue: {
      code: '',
      target: target,
      type: type,
    },
    constraint: getZodConstraint(verifySchema),
    lastResult: lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: verifySchema });
    },
  });

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <h1>Please check your {data.email} email</h1>
        </div>
        <div className="w-80">
          <Form method="post" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.code.id}>
                Enter your verification code below
              </Label>
              <Input {...getInputProps(fields.code, { type: 'text' })} />
              <div>
                <FormOrFieldErrorsList
                  data={fields.code.errors}
                  errorID={fields.code.errorId}
                />
              </div>
            </div>
            <div>
              <Input {...getInputProps(fields.target, { type: 'hidden' })} />
            </div>
            <div>
              <Input {...getInputProps(fields.type, { type: 'hidden' })} />
            </div>
            <div>
              <Button type="submit" name="intent" value="verifyEmail">
                Verify email
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
