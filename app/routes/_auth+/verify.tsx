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
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { verficationSessionStorage } from '~/utils/verification.server';
import { checkCSRF } from '~/utils/csrf.server';
import { checkHoneypot } from '~/utils/honeypot.server';
import { verifyRequest } from './verify.server';
import { verifySchema } from '~/utils/fieldValidation';
import {
  codeSearchParams,
  targetSearchParams,
  twoFAVerificationEnabledType,
  typeSearchParams,
  unverifiedSessionKey,
  verifySessionKey,
} from '~/utils/constants';

export const meta: MetaFunction = () => {
  return [
    { title: 'Verify' },
    {
      name: 'description',
      content: 'Verify your email address',
    },
  ];
};

// ensures the user is going through the proper verification flow (sign up flow, change email flow, change password flow) rather than skipping to this page
async function requireVerificationFlow(request: Request) {
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
async function require2FAUnverificationFlow(request: Request) {
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
