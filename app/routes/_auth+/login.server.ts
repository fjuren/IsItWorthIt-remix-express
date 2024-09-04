import { safeRedirect } from 'remix-utils/safe-redirect';
import {
  authSessionStorage,
  getCookieSessionExpirationDate,
} from '~/utils/session.server';
import {
  verficationSessionStorage,
  verificationRedirect,
} from '~/utils/verification.server';
import {
  authSessionKey,
  rememberMeKey,
  twoFAVerificationEnabledType,
  unverifiedSessionKey,
} from '~/utils/constants';
import { prisma } from '~/utils/db.server';
import { combineHeaders } from '~/utils/misc';
import { redirect } from '@remix-run/react';
import { generalToast, toastVerificationKey } from '~/utils/toast.server';

// this function handles authentication supports oAuth, 2FA and regular login flows
export async function handleAuthSession(
  {
    request,
    userId,
    rememberMe,
    redirectTo,
    oAuthConnectionName,
  }: {
    request: Request;
    userId: string;
    rememberMe?: boolean;
    redirectTo: string;
    oAuthConnectionName?: string;
  },
  responseInit?: ResponseInit
) {
  // Get the user 2FA setting preference
  const twoFAEnabled = await prisma.authVerificationCode.findUnique({
    select: {
      id: true,
    },
    where: {
      type_target: {
        type: twoFAVerificationEnabledType,
        target: userId,
      },
    },
  });
  // give true if it's enabled
  const hasTwoFAEnabled = Boolean(twoFAEnabled);
  // check if they have 2fa enabled
  if (hasTwoFAEnabled) {
    // redirect to the 2FA page and set up a verify cookie session if the user has set up their 2FA
    const unverifiedCookieSession =
      await verficationSessionStorage.getSession();
    unverifiedCookieSession.set(unverifiedSessionKey, { userId: userId });
    unverifiedCookieSession.set(rememberMeKey, { rememberMe: rememberMe });

    const setUnverifiedSessionCookieHeader =
      await verficationSessionStorage.commitSession(unverifiedCookieSession);

    const redirectUrl = verificationRedirect({
      request,
      redirectTo,
      type: twoFAVerificationEnabledType,
      target: userId,
    });

    return redirect(redirectUrl.toString(), {
      headers: combineHeaders(responseInit?.headers, {
        'set-cookie': setUnverifiedSessionCookieHeader,
      }),
    });
  } else if (!hasTwoFAEnabled) {
    const cookie = request.headers.get('cookie');
    // Continue with regular login without 2FA redirect
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set(authSessionKey, userId);
    const setAuthCookieHeader = await authSessionStorage.commitSession(
      cookieAuthSession,
      { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
    );
    const setToastCookieHeader = await generalToast({
      //BUG toast doesn't display when successfully connecting an oAuth connection with an existing user. Might have to do with the toast ID?
      request,
      key: toastVerificationKey,
      toastVariant: 'success',
      toastTitle: "You're in!",
      toastDescription: `Your ${oAuthConnectionName} account has been successfully linked`,
    });

    const headers = combineHeaders(
      responseInit?.headers,
      setToastCookieHeader,
      {
        'set-cookie': setAuthCookieHeader,
      }
    );

    // docs to safeRedirect; prevents malicious redirects :) (https://github.com/sergiodxa/remix-utils#safe-redirects)
    return redirect(safeRedirect(redirectTo), {
      headers: headers,
    });
  } else {
    throw new Response('Not found', { status: 500 });
  }
}
