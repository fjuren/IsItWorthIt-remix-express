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
import { safeRedirect } from 'remix-utils/safe-redirect';

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
export const authSessionKey = 'auth-Session';
export const verifySessionKey = 'verified-session-key';
export const unverifiedSessionKey = 'unverified-session-key';
export const lastVerifiedTimeKey = 'last-verified-time';
export const rememberMeKey = 'remember-me';

// verification type key
export const twoFAVerifyVerificationType = '2fa-verify';
export const twoFAVerificationEnabledType = '2fa-enabled';
export const emailType = 'email';
export const resetPasswordType = 'reset-password';
export const changeEmailType = 'change-email';

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
  redirectTo: z.string().optional(),
});

// ensures the user is going through the proper verification flow (sign up flow, change email flow, change password flow) rather than skipping to this page
export async function requireVerificationFlow(request: Request) {
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

// ensure the user is going through the proper 2FA flow
export async function require2FAUnverificationFlow(request: Request) {
  const unverifiedSession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const unverifiedSessionData = await unverifiedSession.get(
    unverifiedSessionKey
  );

  if (
    !unverifiedSessionData ||
    typeof unverifiedSessionData.userId !== 'string'
  ) {
    throw redirect('/signup');
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const typeParam = new URL(request.url).searchParams.get(typeSearchParams);
  if (typeParam === twoFAVerificationEnabledType) {
    await require2FAUnverificationFlow(request);
  } else {
    await requireVerificationFlow(request);
  }
  return json({ typeParam });
}

export async function action({ request }: ActionFunctionArgs) {
  const typeParam = new URL(request.url).searchParams.get(typeSearchParams);
  if (typeParam === twoFAVerificationEnabledType) {
    await require2FAUnverificationFlow(request);
  } else {
    await requireVerificationFlow(request);
  }

  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
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

  async function deleteAuthCode() {
    await prisma.authVerificationCode.delete({
      where: {
        type_target: {
          type: submissionValue[typeSearchParams],
          target: submissionValue[targetSearchParams],
        },
      },
    });
  }
  // code is valid, delete config from db
  // checks method of submission to handle different verification types (email verification, phone verification, etc)
  if (submissionValue[typeSearchParams] === emailType) {
    await deleteAuthCode();
    return verifiedEmailSignup({ submission, request });
  }
  if (submissionValue[typeSearchParams] === resetPasswordType) {
    await deleteAuthCode();
    return verifiedResetPassword({ submission, request });
  }
  if (submissionValue[typeSearchParams] === changeEmailType) {
    await deleteAuthCode();
    return verifiedChangeEmail({ submission, request });
  }
  if (submissionValue[typeSearchParams] === twoFAVerificationEnabledType) {
    return verifiedUnverified2FaCode({ submission, request });
  }
}

export async function verifiedUnverified2FaCode({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  const cookie = request.headers.get('cookie');
  const verifySession = await verficationSessionStorage.getSession(cookie);
  const { userId } = verifySession.get(unverifiedSessionKey);
  const rememberMe = verifySession.get(rememberMeKey)
    ? verifySession.get(rememberMeKey)
    : null; // null if the client doesn't need to pass in their 'remember me' preference. Example flow is disabling 2FA, where a user doesn't select their 'remember me' preference. See session.server.ts for custom 'originalAuthSessionStorage' enhancement.

  const deleteVerifySessionHeader =
    await verficationSessionStorage.destroySession(verifySession);

  if (submission.status === 'success') {
    // prepping the auth session cookie and add the time of verification
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set(lastVerifiedTimeKey, Date.now());

    // checking if the user is already in the code verification flow using the verification cookie. If so, continue with regular authentication. If re-verifiying (eg. during destructive actions like disabling 2FA), the user wouldn't have a verifySession with unverifiedSessionKey yet
    if (userId) {
      cookieAuthSession.set(authSessionKey, userId);
      const setCookieAuthHeader = await authSessionStorage.commitSession(
        cookieAuthSession,
        { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
      );

      const { redirectTo } = submission.value;

      return redirect(safeRedirect(redirectTo), {
        headers: combineHeaders(
          {
            'set-cookie': setCookieAuthHeader,
          },
          {
            'set-cookie': deleteVerifySessionHeader,
          }
        ),
      });
    }
  }
  // TODO handle errors
}

// function to check if the user should reverify using a code. If within a 2 hour expiry window, the user won't need to reverify. Can use this where more 'destructive' actions taking place, like reseting password, emails, disabling 2FA etc.
export async function shouldRevalidate2Fa({
  request,
  userId,
}: {
  request: Request;
  userId: string;
}) {
  const twoFAEnabled = await prisma.authVerificationCode.findUnique({
    where: {
      type_target: { type: twoFAVerificationEnabledType, target: userId },
    },
    select: {
      id: true,
    },
  });

  const hasTwoFA = Boolean(twoFAEnabled);
  if (!hasTwoFA) return false;

  const cookieAuthSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const lastVerified = cookieAuthSession.get(lastVerifiedTimeKey);
  if (!lastVerified) return true;

  const timeNow = new Date();
  const expiryWindow = 1000 * 10; // 2hrs

  if (timeNow.getTime() - new Date(lastVerified).getTime() > expiryWindow) {
    return true;
  } else {
    return false;
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
    cookieAuthSession.set(authSessionKey, user.id);
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
      redirectTo: searchParams.get('redirectTo') ?? '',
    },
    constraint: getZodConstraint(verifySchema),
    lastResult: lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: verifySchema });
    },
  });

  const non2FaVerifications = (
    <>
      <h1>Please check your email {searchParams.get(targetSearchParams)}</h1>
    </>
  );

  const pageHeading: Record<
    'email' | 'reset-password' | 'change-email' | '2fa-enabled',
    JSX.Element
  > = {
    email: non2FaVerifications,
    'reset-password': non2FaVerifications,
    'change-email': non2FaVerifications,
    '2fa-enabled': (
      <>
        <h1>Please check your 2FA application</h1>
      </>
    ),
  };

  const typeForHeadingControl = searchParams.get(typeSearchParams) as
    | 'email'
    | 'reset-password'
    | 'change-email'
    | '2fa-enabled'
    | null;

  if (
    typeForHeadingControl === null ||
    !(typeForHeadingControl in pageHeading)
  ) {
    throw new Response('Not found', { status: 500 });
  }

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>{pageHeading[typeForHeadingControl]}</div>
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
              <Input
                {...getInputProps(fields.redirectTo, { type: 'hidden' })}
              />
            </div>
            <div>
              <Button type="submit" name="intent" value="verifyCode">
                Verify
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
