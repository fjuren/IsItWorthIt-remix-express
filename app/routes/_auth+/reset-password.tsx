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
import { bcrypt, redirectIfAuthenticated } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { ConfirmSchema, PasswordSchema } from '~/utils/fieldValidation';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { verficationSessionStorage } from '~/utils/verification.server';
import { verifySessionKey } from '~/utils/constants';
const ResetPWSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: ConfirmSchema,
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: "Passwords don't match",
      });
    }
  });

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request);
  const { username } = await requireResetPasswordUserData(request);
  return { username };
}

export async function action({ request }: ActionFunctionArgs) {
  const { email } = await requireResetPasswordUserData(request);
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  return await changeUserPassword({ request, email, formData });
}

// ensures the user is going through the reset password flow as designed
export async function requireResetPasswordUserData(request: Request) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const sessionData = verifySession.get(verifySessionKey);
  if (
    !sessionData ||
    typeof sessionData.username !== 'string' ||
    typeof sessionData.email !== 'string'
  ) {
    throw redirect('/signup');
  }
  const { username, email } = sessionData;
  return { username, email };
}

async function changeUserPassword({
  request,
  email,
  formData,
}: {
  request: Request;
  email: string;
  formData: FormData;
}) {
  const submission = await parseWithZod(formData, {
    schema: ResetPWSchema.superRefine(async (val, ctx) => {
      const changePassword = await prisma.user.update({
        select: { id: true },
        where: {
          email: email,
        },
        data: {
          password: {
            update: {
              hash: bcrypt.hashSync(val.password, 10),
            },
          },
        },
      });
      if (!changePassword) {
        ctx.addIssue({
          path: ['Password'],
          code: 'custom',
          message: 'There is a problem with the account. Please try again',
          fatal: true,
        });
        return z.NEVER;
      }
    }),
    async: true,
  });
  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    );
  }
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  if (submission.status === 'success') {
    return redirect('/login', {
      headers: {
        'set-cookie': await verficationSessionStorage.destroySession(
          verifySession
        ),
      },
    });
  } else {
    throw new Response('Not found', { status: 500 });
  }
}

export async function verifiedResetPassword({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  // target will be the entered username or email
  const { target } = submission.value;
  const user = await prisma.user.findFirstOrThrow({
    select: { email: true, username: true },
    where: {
      OR: [{ username: target }, { email: target }],
    },
  });
  // intentionally not informing the user the email/username is incorrect in case someone is fishing for existing data
  if (!user) {
    submission.error.code = ['Invalid code'];
    throw new Error('Invalid code', submission);
  }
  // add email to session cookie (note: this will replace the existing verification cookie. Checking the user is going through the flow as expected)
  const verifyCookieSession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  verifyCookieSession.set(verifySessionKey, {
    username: user.username,
    email: user.email,
  });
  const setVerifyCookieSession = await verficationSessionStorage.commitSession(
    verifyCookieSession
  );
  return redirect('/reset-password', {
    headers: { 'set-cookie': await setVerifyCookieSession },
  });
}

export default function ResetPasswordRoute() {
  const data = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: 'reset-password',
    // constraint: getZodConstraint(ForgotPWSchema),
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ResetPWSchema });
    },
  });
  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Hey {data.username}, let&apos;s get your password reset.</p>
        </div>
        <div className="w-80">
          <Form method="POST" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.password.id}>New password</Label>
              <Input
                {...getInputProps(fields.password, { type: 'password' })}
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.password.errors}
                  errorID={fields.password.errorId}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={fields.confirmPassword.id}>
                Confirm new password
              </Label>
              <Input
                {...getInputProps(fields.confirmPassword, { type: 'password' })}
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.confirmPassword.errors}
                  errorID={fields.confirmPassword.errorId}
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
              <Button type="submit" name="intent" value="recoverPassword">
                Rest password
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
