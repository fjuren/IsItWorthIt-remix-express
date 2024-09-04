import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { redirectIfAuthenticated } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import {
  changeUserPassword,
  requireResetPasswordUserData,
} from './reset-password.server';
import { ResetPWSchema } from '~/utils/fieldValidation';

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
