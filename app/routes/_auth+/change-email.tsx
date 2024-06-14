import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
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
import { requireUser } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { sendEmail } from '~/utils/email.server';
import { EmailSchema } from '~/utils/fieldValidation';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import {
  prepVerificationCode,
  verficationSessionStorage,
} from '~/utils/verification.server';
import { verifySessionKey } from './verify';

const ChangeEmailSchema = z.object({
  email: EmailSchema,
});

export async function loader({ request }: LoaderFunctionArgs) {
  // recall requireUser ensure authentication and offers redirects
  const user = await requireUser(request);
  return json({
    // headers: getTheme(request),
    user,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: ChangeEmailSchema.superRefine(async (val, ctx) => {
      // check if the email already exists globally; schema does not allow duplicate emails. Inform user email exists if true
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: val.email,
        },
      });
      // throw validation error if the email already exists
      if (existingEmail) {
        ctx.addIssue({
          path: ['email'],
          code: 'custom',
          message: 'Email already exists',
          fatal: true,
        });
        return z.NEVER;
      }
      return val;
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
  const { email } = submission.value;

  const { otp, redirectTo } = await prepVerificationCode({
    request,
    type: 'change-email',
    target: email,
  });

  const response = await sendEmail({
    to: email,
    subject: 'Confirm email',
    text: 'Please confirm your email address',
    html: `<p>Please confirm your email address by entering this code ${otp}. It expires in 10 minutes.</p>`,
  });

  if (response.status === 'success') {
    const verifySession = await verficationSessionStorage.getSession(
      request.headers.get('cookie')
    );
    verifySession.set(verifySessionKey, { email, id: user.id });
    const committedVerifyCookieSession =
      await verficationSessionStorage.commitSession(verifySession);

    return redirect(redirectTo, {
      headers: { 'set-cookie': committedVerifyCookieSession },
    });
  }
}

export async function verifiedChangeEmail({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  // email = new email that is being set
  const { email, id } = verifySession.get(verifySessionKey);

  if (!email) {
    submission.error[''] = [
      'To protect your email, enter the code using the same device that you used to reset your email. Your original code will expire in 10 minutes.',
    ];
    return json({ status: 'error', submission } as const, { status: 400 });
  }

  const oldEmailUser = await prisma.user.findUniqueOrThrow({
    select: {
      email: true, // old email
    },
    where: {
      id: id,
    },
  });

  const newEmailUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      email: email, // new email
    },
  });

  // intentionally not informing the user the email/username is incorrect in case someone is fishing for existing data
  if (!newEmailUser) {
    submission.error.code = ['Invalid code'];
    throw new Error('Invalid code', submission);
  }

  await sendEmail({
    to: oldEmailUser.email,
    subject: 'IIWI Email Change Notice',
    text: 'Your email has changed',
    html: `<p>Hello beloved user, your account email address has changed, your old email ${oldEmailUser.email} is no longer valid. If you did not make this change, pleaes contact us immediately and share the following ID so we can help: ${id}</p>`,
  });

  return redirect('/settings/profile', {
    headers: {
      'set-cookie': await verficationSessionStorage.destroySession(
        verifySession
      ),
    },
  });
}

export default function ChangeEmailRoute() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: 'change-email',
    // constraint: getZodConstraint(ForgotPWSchema),
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangeEmailSchema });
    },
  });
  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Enter your new email address</p>
        </div>
        <div className="w-80">
          <Form method="POST" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input
                {...getInputProps(fields.email, { type: 'text' })}
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.email.errors}
                  errorID={fields.email.errorId}
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
              <Button
                type="submit"
                name="intent"
                value="changeEmailConfirmation"
              >
                Send confirmation
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
