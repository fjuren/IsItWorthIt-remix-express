import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, MetaFunction, json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { checkCSRF } from '~/utils/csrf.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { FieldErrorsList } from '~/utils/misc';

export const meta: MetaFunction = () => {
  return [
    { title: 'Login' },
    {
      name: 'description',
      content: 'Log in to your account',
    },
  ];
};

const usernameMaxLength: number = 20;
const minLength: number = 3;
const passwordMaxLength: number = 100;

const loginSchema = z.object({
  username: z
    .string({ required_error: 'Please enter your username' })
    .min(minLength, { message: 'Username is too short' })
    .max(usernameMaxLength, {
      message: 'Must be 20 or fewer characters long',
    }),
  password: z
    .string({ required_error: 'Please enter your password' })
    .min(minLength, { message: 'Password is too short' })
    .max(passwordMaxLength, {
      message: 'Must be 100 or fewer characters long',
    }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);
  if (submission.status !== 'success') {
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
  const { username, password } = await submission.value;
  console.log(username, password);
  return null;
}

export default function LoginRoute() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    constraint: getZodConstraint(loginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
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
                <FieldErrorsList
                  data={fields.username.errors}
                  errorID={fields.username.id}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={fields.password.id}>Pasword</Label>
              <Input
                {...getInputProps(fields.password, { type: 'password' })}
              />
              <div>
                <FieldErrorsList
                  data={fields.password.errors}
                  errorID={fields.password.id}
                />
              </div>
            </div>
            <div>
              <Button type="submit">Log in</Button>
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
