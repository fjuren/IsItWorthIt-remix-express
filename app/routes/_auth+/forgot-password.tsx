import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { redirectIfAuthenticated } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { EmailSchema, UsernameSchema } from '~/utils/fieldValidation';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';

const ForgotPWSchema = z.object({
  usernameOrEmail: z.union([UsernameSchema, EmailSchema]),
});

export async function loader({ request }: LoaderFunctionArgs) {
  return await redirectIfAuthenticated(request);
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfAuthenticated(request); // using this to prevent already authed user from submitting a login request
  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: ForgotPWSchema.superRefine(async (val, ctx) => {
      // check if username or email exists
      const userEmail = await prisma.user.findFirst({
        select: { email: true },
        where: {
          OR: [
            { username: val.usernameOrEmail },
            { email: val.usernameOrEmail },
          ],
        },
      });
      if (!userEmail) {
        ctx.addIssue({
          path: ['usernameOrEmail'],
          code: 'custom',
          message: 'Username or email does not exist',
          fatal: true,
        });
        return z.NEVER;
      }
      console.log('YES! User found: ', userEmail);
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

  // if either username or email exist, and submission is successful, send email with code and redirect user to code verification page

  return;
}

export default function ForgotPasswordRoute() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: 'forgot-password',
    // constraint: getZodConstraint(ForgotPWSchema),
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ForgotPWSchema });
    },
  });
  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Forgot your password? No problem!</p>
        </div>
        <div className="w-80">
          <Form method="POST" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.usernameOrEmail.id}>
                Username or Email
              </Label>
              <Input
                {...getInputProps(fields.usernameOrEmail, { type: 'text' })}
                // autoFocus
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.usernameOrEmail.errors}
                  errorID={fields.usernameOrEmail.errorId}
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
                Recover password
              </Button>
            </div>
          </Form>
          <div className="flex py-2">
            <div>
              <Button variant="link" asChild>
                <Link to="/login">Return to login</Link>
              </Button>
            </div>
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
