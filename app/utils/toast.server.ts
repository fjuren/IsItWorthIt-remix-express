import { createCookieSessionStorage } from '@remix-run/node';
import { z } from 'zod';

// const { getSession, commitSession, destroySession } =

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'iiwi_toast',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.SESSION_SECRET!.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
});

export const toastVerificationKey = 'registrationMessage';

export const toastVariants = ['success', 'fail'] as const;
export const toastSchema = z.enum(toastVariants);
export type ToastVariants = z.infer<typeof toastSchema>;

export async function generalToast({
  request,
  key,
  toastVariant,
  toastTitle = 'Notification', // gives a title for the toast. 'Notification' is default
  toastDescription = '', // explains what happened. Blank is default
}: {
  request: Request;
  key: string;
  toastVariant: ToastVariants;
  toastTitle?: string;
  toastDescription?: string;
}) {
  try {
    const cookie = request.headers.get('cookie');
    const toastSession = await toastSessionStorage.getSession(cookie);

    // replace 'set' with 'flash'. flash method automatically unsets value after the next 'get' for 'authMessage'
    toastSession.flash(key, {
      toastVariant,
      toastTitle,
      toastDescription, // explains what happened
    });
    const toastCookie = await toastSessionStorage.commitSession(toastSession);
    return new Headers({ 'set-cookie': toastCookie });
  } catch (error) {
    console.error('Error handling toast message:', error);
    throw new Error('Failed to handle toast message');
  }
}
