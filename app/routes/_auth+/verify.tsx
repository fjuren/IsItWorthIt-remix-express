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
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { CheckboxConform } from '~/components/UI/Checkbox';
import { Input } from '~/components/UI/Input';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { redirectIfAuthenticated } from '~/utils/auth.server';
import { sendEmail } from '~/utils/email.server';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { verficationSessionStorage } from '~/utils/verification.server';

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
  const submission = parseWithZod(formData, { schema: verifySchema });
  console.log(submission);

  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const { email, username, hashPassword } = verifySession.get('verifySession');
  console.log(email, username, hashPassword);
  return null;
}

export default function VerifyRoute() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  const lastResult = useActionData<typeof action>();
  // // relevant for redirect; get the redirect from search params (if null, it should be ignored)
  // const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get('redirectTo');
  const [form, fields] = useForm({
    id: 'verify',
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
          <Form method="POST" {...getFormProps(form)}>
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
                  errorID={fields.code.id}
                />
              </div>
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
