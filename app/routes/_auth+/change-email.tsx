import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from 'react-router';
import { data } from 'react-router';
import { Form, useActionData } from 'react-router-dom';
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
import { changeEmailType, verifySessionKey } from '~/utils/constants';

const ChangeEmailSchema = z.object({
  email: EmailSchema,
});

export async function loader({ request }: LoaderFunctionArgs) {
  // recall requireUser ensure authentication and offers redirects
  const user = await requireUser(request);
  return {
    // headers: getTheme(request),
    user,
  };
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
    return data(
      {
        result: submission.reply(),
      },
      { status: submission.status === 'error' ? 400 : 200 }
    );
  }
  const { email } = submission.value;

  const { otp, redirectTo } = await prepVerificationCode({
    request,
    type: changeEmailType,
    target: email,
  });

  const response = await sendEmail({
    to: email,
    subject: 'Confirm email',
    text: 'Please confirm your email address',
    html: `<p>Please confirm your email address by entering this code ${otp}. It expires in 10 minutes.</p>`,
  });

  // console.log('resonse.status??? ', response.status);
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
