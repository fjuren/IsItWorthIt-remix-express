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
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { GeneralErrorBoundary } from '~/components/error-boundary';
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
import { verifiedResetPassword } from './reset-password';
import { verifiedChangeEmail } from './change-email';

export const meta: MetaFunction = () => {
  return [
    { title: 'Verify' },
    {
      name: 'description',
      content: 'Verify your email address',
    },
  ];
};

// cookie key variable
export const verifySessionKey = 'verifySession';

// search params
export const codeSearchParams = 'code';
export const typeSearchParams = 'type';
export const targetSearchParams = 'target';

const verifySchema = z.object({
  [codeSearchParams]: z.string({
    required_error: 'Please enter your code. It was sent to your email address',
  }),
  [targetSearchParams]: z.string(),
  [typeSearchParams]: z.string(),
});

// ensures the user is going through the email flow rather than skipping to this page
export async function requireVerificationEmail(request: Request) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const sessionData = verifySession.get(verifySessionKey);
  if (!sessionData || typeof sessionData.email !== 'string') {
    throw redirect('/signup');
  }
  const { email } = sessionData;
  return email;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireVerificationEmail(request);

  return null;
  // json({ email });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireVerificationEmail(request);
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  console.log('ACTION');
  return verifyRequest(request, formData);
}

// verifies incoming verification request, includes checking whether the entered verification code is valid using helper function 'isVerificationCodeValid'
export async function verifyRequest(request: Request, formData: FormData) {
  const submission = await parseWithZod(formData, {
    schema: verifySchema.superRefine(async (data, ctx) => {
      // verify validity of code
      const codeVerification = await isVerificationCodeValid({
        type: data[typeSearchParams],
        target: data[targetSearchParams],
        enteredCode: data[codeSearchParams],
      });
      if (!codeVerification) {
        ctx.addIssue({
          path: ['code'],
          code: 'custom',
          message: 'Invalid code',
          fatal: true,
        });
        return z.NEVER;
      }
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200,
    });
  }

  const { value: submissionValue } = submission;

  // code is valid, delete config from db
  await prisma.authVerificationCode.delete({
    where: {
      type_target: {
        type: submissionValue[typeSearchParams],
        target: submissionValue[targetSearchParams],
      },
    },
  });
  // checks method of submission to handle different verification types (email verification, phone verification, etc)
  if (submissionValue[typeSearchParams] === 'email') {
    return verifiedEmailSignup({ submission, request });
  }
  if (submissionValue[typeSearchParams] === 'reset-password') {
    return verifiedResetPassword({ submission, request });
  }
  if (submissionValue[typeSearchParams] === 'change-email') {
    return verifiedChangeEmail({ submission, request });
  }
}

async function verifiedEmailSignup({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const { email, username, hashPassword, rememberMe } =
    verifySession.get(verifySessionKey);

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

// check validity of code
export async function isVerificationCodeValid({
  type,
  target,
  enteredCode,
}: {
  type: string;
  target: string;
  enteredCode: string;
}) {
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
        type,
        target,
      },
      OR: [
        {
          expiresAt: { gt: new Date() },
        },
        { expiresAt: null },
      ],
    },
  });
  if (!verifyCodeConfig) return false;
  // determine validity of entered code
  const isValid = verifyTOTP({ otp: enteredCode, ...verifyCodeConfig });
  if (!isValid) return false;

  // Code is valid
  return true;
}

export default function VerifyRoute() {
  // const data = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  // // relevant for redirect; get the redirect from search params (if null, it should be ignored)
  const [searchParams] = useSearchParams();
  const [form, fields] = useForm({
    id: 'verify',
    defaultValue: {
      code: searchParams.get(codeSearchParams) ?? '',
      target: searchParams.get(targetSearchParams) ?? '',
      type: searchParams.get(typeSearchParams) ?? '',
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
          <h1>
            Please check your email {searchParams.get(targetSearchParams)}
          </h1>
        </div>
        <div className="w-80">
          <Form method="post" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields[codeSearchParams].id}>
                Enter your verification code below
              </Label>
              <Input
                {...getInputProps(fields[codeSearchParams], { type: 'text' })}
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields[codeSearchParams].errors}
                  errorID={fields[codeSearchParams].errorId}
                />
              </div>
            </div>
            <div>
              <Input
                {...getInputProps(fields[targetSearchParams], {
                  type: 'hidden',
                })}
              />
            </div>
            <div>
              <Input
                {...getInputProps(fields[typeSearchParams], { type: 'hidden' })}
              />
            </div>
            <div>
              <Button type="submit" name="intent" value="verifyCode">
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
