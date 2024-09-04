import { parseWithZod } from '@conform-to/zod';
import { json, redirect } from '@remix-run/node';
import { z } from 'zod';
import { bcrypt } from '~/utils/auth.server';
import { verifySessionKey } from '~/utils/constants';
import { prisma } from '~/utils/db.server';
import { ResetPWSchema } from '~/utils/fieldValidation';
import { verficationSessionStorage } from '~/utils/verification.server';

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

export async function changeUserPassword({
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
