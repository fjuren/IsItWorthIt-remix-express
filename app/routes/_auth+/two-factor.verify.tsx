import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { requireUser } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { sendEmail } from '~/utils/email.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { getTOTPAuthUri } from '@epic-web/totp';
// @ts-expect-error ignoring type error
import * as QRCode from 'qrcode';
import {
  isVerificationCodeValid,
  twoFAVerificationEnabledType,
  twoFAVerifyVerificationType,
} from './verify';
import { toastSessionStorage } from '~/utils/toast.server';
import { twoFaScema } from '~/utils/fieldValidation';

const twoFactorSchema = z.object({
  twoFactorCode: twoFaScema,
});

export async function loader({ request }: LoaderFunctionArgs) {
  // recall requireUser ensure authentication and offers redirects
  const user = await requireUser(request);
  const verificationFromDb = await prisma.authVerificationCode.findUnique({
    where: {
      type_target: { type: twoFAVerifyVerificationType, target: user.id },
      expiresAt: { gt: new Date() },
    },
    select: {
      secret: true,
      period: true,
      digits: true,
      algorithm: true,
    },
  });
  if (!verificationFromDb) {
    return redirect('/settings/account');
  }

  const userEmail = await prisma.user.findFirstOrThrow({
    where: { id: user.id },
    select: { email: true },
  });

  const otpUri = getTOTPAuthUri({
    ...verificationFromDb, // needs the secret, period, digits and algo
    accountName: userEmail.email,
    issuer: new URL(request.url).host, // will show the auth app what website it's for
  });

  const qrCode = await QRCode.toDataURL(otpUri);

  return json({
    // headers: getTheme(request),
    user,
    qrCode,
    otpUri,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);

  // handle if the user decides to cancel setting up 2fa
  if (formData.get('intent') === 'cancel') {
    await prisma.authVerificationCode.deleteMany({
      where: { type: twoFAVerifyVerificationType, target: user.id },
    });
    return redirect('/settings/account');
  }

  const submission = await parseWithZod(formData, {
    schema: twoFactorSchema.superRefine(async (val, ctx) => {
      // adding this so the 'cancel' button can submit without triggering code validation
      if (!val.twoFactorCode) {
        ctx.addIssue({
          path: ['twoFactorCode'],
          code: 'custom',
          message: 'Invalid code. It may be expired.',
          fatal: true,
        });
        return z.NEVER;
      }

      // first confirming the correct 2fa-verify code is in the db
      const verifiedVerification = await prisma.authVerificationCode.findUnique(
        {
          where: {
            type_target: {
              type: twoFAVerifyVerificationType,
              target: user.id,
            },
          },
        }
      );
      // unlikely error but throw an error if the type target isn't found
      if (!verifiedVerification) {
        ctx.addIssue({
          path: ['twoFactorCode'],
          code: 'custom',
          message: 'Invalid code. It may be expired.',
          fatal: true,
        });
        return z.NEVER;
      }
      // now validating the submitted code
      const enteredCodeIsValid = await isVerificationCodeValid({
        enteredCode: val.twoFactorCode,
        type: twoFAVerifyVerificationType,
        target: user.id,
      });

      if (!enteredCodeIsValid) {
        ctx.addIssue({
          path: ['twoFactorCode'],
          code: 'custom',
          message: 'Invalid code. It may be expired.',
          fatal: true,
        });
        return z.NEVER;
      }

      // update 2FA in the db by changing the type from '2FA-verify' to '2FA-enabled'. Doing this to confirm the user has successfully enabled 2FA to their account by updating this in the db.
      await prisma.authVerificationCode.update({
        where: {
          type_target: {
            type: twoFAVerifyVerificationType,
            target: user.id,
          },
        },
        data: {
          type: twoFAVerificationEnabledType,
          expiresAt: null, // removes expiration date so it's now always enabled
        },
      });
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      { status: submission.status === 'error' ? 400 : 200 }
    );
  }

  const userEmail = await prisma.user.findFirstOrThrow({
    where: {
      id: user.id,
    },
    select: { email: true },
  });

  const response = await sendEmail({
    to: userEmail.email,
    subject: '2FA enabled',
    text: 'You improved you security using 2FA',
    html: `<p>Hi ${user.username}, Fantastic news! You have taken another step to protect your account by successfully applying 2FA to your account. Hurrah! IMPORTANT: Please make sure you don't lose access to your authentication app as you will need to use it when logging into your account. If you ever need to disable 2FA, you can go to your account settings to disable it.</p>`,
  });

  const cookie = request.headers.get('cookie');
  const cookieSession = await toastSessionStorage.getSession(cookie);

  if (response.status === 'success') {
    // show toaster success message using cookieSession
    // replace 'set' with 'flash'. flash method automatically unsets value after the next 'get' for 'authMessage'
    cookieSession.flash('registrationMessage', {
      type: 'success',
      title: '2FA enabled',
      description: 'Your account has 2FA applied!',
    });
    // TODO add general toast
    // BUG toast is just blank
    const setToastCookieHeader = await toastSessionStorage.commitSession(
      cookieSession
    );
    return redirect('/settings/account', {
      headers: { 'set-cookie': setToastCookieHeader },
    });
  }

  // handle toast if it fails
  cookieSession.flash('registrationMessage', {
    type: 'destructive',
    title: '2FA failed',
    description: 'Sorry something went wrong :(',
  });
  const setToastCookieHeader = await toastSessionStorage.commitSession(
    cookieSession
  );
  return redirect('/settings/account', {
    headers: { 'set-cookie': setToastCookieHeader },
  });
}

export default function TwoFactorVerifyRoute() {
  const data = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: '2fa',
    // constraint: getZodConstraint(twoFactorSchema),
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: twoFactorSchema });
    },
  });
  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Scan this QR code with your authenticator app.</p>
        </div>
        <img
          src={data.qrCode}
          alt="QR code for authentication app"
          className="h-52 w-52"
        ></img>
        <br />
        <div>
          <p>
            You can instead manually copy the full code below to your
            authenticator app:
          </p>
        </div>
        <div>
          <p>{data.otpUri}</p>
        </div>
        <br />
        <div>
          <p>
            Once your account is added to the authenticator app, you can enter
            the code below. Once this is done, you will need to use the
            authenticator app every time you would like to log into your IIWI
            account.{' '}
            <b>
              <u>Do not lose access to the authenticator app.</u>
            </b>{' '}
            Losing access to the app means you will lose access to your IIWI
            account.
          </p>
        </div>
        <div className="w-80">
          <Form method="POST" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.twoFactorCode.id}>Two factor code</Label>
              <Input
                {...getInputProps(fields.twoFactorCode, { type: 'text' })}
                placeholder="12345678"
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.twoFactorCode.errors}
                  errorID={fields.twoFactorCode.errorId}
                />
              </div>
            </div>
            <div>
              <FormOrFieldErrorsList
                data={form.errors}
                errorID={form.errorId}
              />
            </div>
            <div className="py-2">
              <Button type="submit" name="intent" value="twoFactorCode">
                Submit
              </Button>
              <Button
                type="submit"
                name="intent"
                value="cancel"
                variant={'outline'}
              >
                Cancel
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
