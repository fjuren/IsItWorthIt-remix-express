import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, MetaFunction } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { requireUser } from '~/utils/auth.server';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { twoFAVerificationEnabled } from './two-factor.verify';
import { shouldRevalidate2Fa, unverifiedSessionKey } from './verify';
import {
  verficationSessionStorage,
  verificationRedirect,
} from '~/utils/verification.server';

export const meta: MetaFunction = () => {
  return [
    { title: '2FA disable' },
    { name: 'description', content: '2FA disable confirmation' },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request); // protects route; requireUser also check authentication with helper (must be authorized)
  await shouldRevalidate2Fa({ request, userId: user.id });
  return json({
    userId: user.id,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request); // protects route; requireUser also check authentication with helper (must be authorized)

  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  const intent = formData.get('intent');
  if (intent === 'cancel') {
    return redirect('/settings/account');
  }

  const shouldReverify2FA = await shouldRevalidate2Fa({
    request,
    userId: user.id,
  });
  if (shouldReverify2FA) {
    const unverifiedCookieSession =
      await verficationSessionStorage.getSession();
    unverifiedCookieSession.set(unverifiedSessionKey, { userId: user.id });
    const setUnverifiedSessionCookieHeader =
      await verficationSessionStorage.commitSession(unverifiedCookieSession);

    const reqUrl = new URL(request.url);

    const redirectUrl = verificationRedirect({
      request,
      redirectTo: reqUrl.pathname + reqUrl.search,
      type: twoFAVerificationEnabled,
      target: user.id,
    });

    return redirect(redirectUrl.toString(), {
      headers: {
        'set-cookie': setUnverifiedSessionCookieHeader,
      },
    });
  } else {
    await prisma.authVerificationCode.delete({
      where: {
        type_target: {
          type: twoFAVerificationEnabled,
          target: user.id,
        },
      },
    });
  }
  return redirect('/settings/account');
}

export default function VerifyRoute() {
  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <h1>Disabling your two factor authentication</h1>
        </div>
        <div>
          <p>
            You are about to disable your two factor authentication. Doing this
            will remove added security to your account. You can enable it again
            if you decide you want it back. Are you sure you want to continue?
          </p>
        </div>
        <div className="w-80">
          <Form method="post">
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Button
                type="submit"
                name="intent"
                value="cancel"
                variant={'outline'}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="submit"
                name="intent"
                value="disable-2fa"
              >
                Disable
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
