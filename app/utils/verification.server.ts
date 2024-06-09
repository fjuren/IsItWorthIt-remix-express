import { generateTOTP } from '@epic-web/totp';
import { createCookieSessionStorage } from '@remix-run/node';
import { prisma } from './db.server';

interface OtpDataObj {
  type: string;
  target: string;
  secret: string;
  digits: number;
  algorithm: string;
  charSet: string;
  period: number;
  expiresAt: Date;
}

const tenMinutesInMilliseconds = 10 * 60; // 10 minutes (if you change this, make sure to change the OTP expiration code!!)
export const verficationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_verify',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.SESSION_SECRET!.split(','),
    secure: process.env.NODE_ENV === 'production',
    maxAge: tenMinutesInMilliseconds,
  },
});

// create a redirect URL with the appropriate search params
export function verificationRedirect({
  request,
  path,
  type,
  target,
}: {
  request: Request;
  path: string;
  type: string;
  target: string;
}) {
  const originUrl = new URL(request.url).origin;
  const redirect = new URL(originUrl + path);
  redirect.searchParams.set('type', type);
  redirect.searchParams.set('target', target);
  return redirect;
}

// Create a one time password (otp) code for user verification. Docs: https://www.npmjs.com/package/@epic-web/totp
export function createOtp({ target, type }: { target: string; type: string }) {
  // Create the one time password. Docs: https://www.npmjs.com/package/@epic-web/totp
  const verificationCodeConfig = generateTOTP({
    algorithm: 'SHA256',
    period: 10 * 60, // 10 mins (if you change this, make sure to changet the verifyCookieSession expiry!!)
    digits: 8,
  });

  // Used to store otp in db temporarily
  const otpToDB = {
    type: type,
    target: target,
    secret: verificationCodeConfig.secret,
    digits: verificationCodeConfig.digits,
    algorithm: verificationCodeConfig.algorithm,
    charSet: verificationCodeConfig.charSet,
    period: verificationCodeConfig.period,
    expiresAt: new Date(Date.now() + verificationCodeConfig.period * 1000),
  };
  return { otp: verificationCodeConfig.otp, otpToDB };
}

// Add/update verification code in db
export async function storeInDB({
  otpData,
  type,
  target,
}: {
  otpData: OtpDataObj;
  type: string;
  target: string;
}) {
  await prisma.authVerificationCode.upsert({
    where: {
      type_target: { type: type, target: target },
    },
    create: otpData,
    update: otpData,
  });
}
