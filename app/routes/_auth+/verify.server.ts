import { verficationSessionStorage } from '~/utils/verification.server';
import { prisma } from '~/utils/db.server';
import { sendEmail } from '~/utils/email.server';
import { json, redirect } from '@remix-run/node';
import { verifiedResetPassword } from './reset-password';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { verifyTOTP } from '@epic-web/totp';
import { toastVerificationKey, generalToast } from '~/utils/toast.server';
import {
  authSessionStorage,
  getCookieSessionExpirationDate,
} from '~/utils/session.server';
import { parseWithZod } from '@conform-to/zod';
import { verifySchema } from '~/utils/fieldValidation';
import {
  authSessionKey,
  changeEmailType,
  codeSearchParams,
  emailType,
  lastVerifiedTimeKey,
  rememberMeKey,
  resetPasswordType,
  targetSearchParams,
  twoFAVerificationEnabledType,
  typeSearchParams,
  unverifiedSessionKey,
  verifySessionKey,
} from '~/utils/constants';
import { combineHeaders } from '~/utils/misc';
import { z } from 'zod';

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

// verifies incoming verification request, includes checking whether the entered verification code is valid using helper function 'isVerificationCodeValid'
export async function verifyRequest(request: Request, formData: FormData) {
  const submission = await parseWithZod(formData, {
    schema: verifySchema.superRefine(async (data, ctx) => {
      // verify validity of code
      const codeVerification = await isVerificationCodeValid({
        type: data[typeSearchParams],
        target: data[targetSearchParams],
        enteredCode: data[codeSearchParams],
      });
      if (!codeVerification) {
        ctx.addIssue({
          path: ['code'],
          code: 'custom',
          message: 'Invalid code',
          fatal: true,
        });
        return z.NEVER;
      }
    }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(submission.reply(), {
      status: submission.status === 'error' ? 400 : 200,
    });
  }

  const { value: submissionValue } = submission;

  async function deleteAuthCode() {
    await prisma.authVerificationCode.delete({
      where: {
        type_target: {
          type: submissionValue[typeSearchParams],
          target: submissionValue[targetSearchParams],
        },
      },
    });
  }
  // code is valid, delete config from db
  // checks method of submission to handle different verification types (email verification, phone verification, etc)
  if (submissionValue[typeSearchParams] === emailType) {
    await deleteAuthCode();
    return verifiedEmailSignup({ submission, request });
  }
  if (submissionValue[typeSearchParams] === resetPasswordType) {
    await deleteAuthCode();
    return verifiedResetPassword({ submission, request });
  }
  if (submissionValue[typeSearchParams] === changeEmailType) {
    await deleteAuthCode();
    return verifiedChangeEmail({ submission, request });
  }
  if (submissionValue[typeSearchParams] === twoFAVerificationEnabledType) {
    return verifiedUnverified2FaCode({ submission, request });
  }
}

export async function verifiedUnverified2FaCode({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  const cookie = request.headers.get('cookie');
  const verifySession = await verficationSessionStorage.getSession(cookie);
  const { userId } = verifySession.get(unverifiedSessionKey);
  const rememberMe = verifySession.get(rememberMeKey)
    ? verifySession.get(rememberMeKey)
    : null; // null if the client doesn't need to pass in their 'remember me' preference. Example flow is disabling 2FA, where a user doesn't select their 'remember me' preference. See session.server.ts for custom 'originalAuthSessionStorage' enhancement.

  const deleteVerifySessionHeader =
    await verficationSessionStorage.destroySession(verifySession);

  if (submission.status === 'success') {
    // prepping the auth session cookie and add the time of verification
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set(lastVerifiedTimeKey, Date.now());

    // checking if the user is already in the code verification flow using the verification cookie. If so, continue with regular authentication. If re-verifiying (eg. during destructive actions like disabling 2FA), the user wouldn't have a verifySession with unverifiedSessionKey yet
    if (userId) {
      cookieAuthSession.set(authSessionKey, userId);
      const setCookieAuthHeader = await authSessionStorage.commitSession(
        cookieAuthSession,
        { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
      );

      const { redirectTo } = submission.value;

      return redirect(safeRedirect(redirectTo), {
        headers: combineHeaders(
          {
            'set-cookie': setCookieAuthHeader,
          },
          {
            'set-cookie': deleteVerifySessionHeader,
          }
        ),
      });
    }
  }
  // TODO handle errors
}

// function to check if the user should reverify using a code. If within a 2 hour expiry window, the user won't need to reverify. Can use this where more 'destructive' actions taking place, like reseting password, emails, disabling 2FA etc.
export async function shouldRevalidate2Fa({
  request,
  userId,
}: {
  request: Request;
  userId: string;
}) {
  const twoFAEnabled = await prisma.authVerificationCode.findUnique({
    where: {
      type_target: { type: twoFAVerificationEnabledType, target: userId },
    },
    select: {
      id: true,
    },
  });

  const hasTwoFA = Boolean(twoFAEnabled);
  if (!hasTwoFA) return false;

  const cookieAuthSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const lastVerified = cookieAuthSession.get(lastVerifiedTimeKey);
  // returns true if there is no last verification time
  if (!lastVerified) return true;

  const timeNow = new Date();
  const expiryWindow = 1000 * 60 * 60 * 2; // 2hrs

  if (timeNow.getTime() - new Date(lastVerified).getTime() > expiryWindow) {
    return true;
  } else {
    return false;
  }
}

async function verifiedEmailSignup({
  submission,
  request,
}: {
  submission: any;
  request: Request;
}) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );
  const { email, username, hashPassword, rememberMe } =
    verifySession.get(verifySessionKey);

  if (submission.status === 'success') {
    // create the new user record in the db
    const user = await prisma.user.create({
      select: { id: true },
      data: {
        email: email,
        username: username.toLowerCase().trim(),
        roles: {
          connect: {
            name: 'user',
          },
        },
        password: {
          create: {
            hash: hashPassword,
          },
        },
      },
    });

    const setToastCookieHeader = await generalToast({
      request,
      key: toastVerificationKey,
      toastVariant: 'success',
      toastTitle: 'Signed in',
      toastDescription: 'You are signed in',
    });

    // set cookie session for authentication
    const cookie = request.headers.get('cookie');
    const cookieAuthSession = await authSessionStorage.getSession(cookie);
    cookieAuthSession.set(authSessionKey, user.id);
    const setAuthCookieHeader = await authSessionStorage.commitSession(
      cookieAuthSession,
      { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
    );

    const headers = combineHeaders(setToastCookieHeader, {
      'set-cookie': setAuthCookieHeader,
    });
    console.log('headers: ', headers);
    return redirect('/', {
      headers: headers,
    });
  }
}

// check validity of code
export async function isVerificationCodeValid({
  type,
  target,
  enteredCode,
}: {
  type: string;
  target: string;
  enteredCode: string;
}) {
  const verifyCodeConfig = await prisma.authVerificationCode.findUnique({
    select: {
      secret: true,
      period: true,
      digits: true,
      algorithm: true,
      charSet: true,
    },
    where: {
      type_target: {
        type,
        target,
      },
      OR: [
        {
          expiresAt: { gt: new Date() },
        },
        { expiresAt: null },
      ],
    },
  });
  if (!verifyCodeConfig) return false;
  // determine validity of entered code
  const isValid = verifyTOTP({ otp: enteredCode, ...verifyCodeConfig });
  if (!isValid) return false;

  // Code is valid
  return true;
}
