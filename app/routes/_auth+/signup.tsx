/* eslint-disable jsx-a11y/no-autofocus */
// using conform to support with:
// - Schema validation support
// - Progressively enhanced experience (eg. hydrating to leverage out of box browser errors for slow network speeds)
// - Accessibility support (ie. using getZodConstraint which assigns values to input attributes like aria-describedby)

import {
  MetaFunction,
  type ActionFunctionArgs,
  json,
  redirect,
  LoaderFunctionArgs,
} from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
// import { useEffect, useState } from 'react';
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { checkHoneypot } from '~/utils/honeypot.server';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import { bcrypt, redirectIfAuthenticated } from '~/utils/auth.server';
import { CheckboxConform } from '~/components/UI/Checkbox';
import { sendEmail } from '~/utils/email.server';
import { verficationSessionStorage } from '~/utils/verification.server';
import { generateTOTP } from '@epic-web/totp';

export const meta: MetaFunction = () => {
  return [
    { title: 'Signup' },
    {
      name: 'description',
      content: 'Sign up for an account',
    },
  ];
};

// const nameMaxLength: number = 100;
const usernameMaxLength: number = 20;
const minLength: number = 3;
const passwordMaxLength: number = 100;
const emailMaxLength: number = 100;

const signupSchema = z
  .object({
    // name: z
    //   .string()
    //   .max(nameMaxLength, {
    //     message: 'Must be 100 or fewer characters long',
    //   })
    //   .optional(),
    // displayName: z
    //   .string()
    //   .max(nameMaxLength, {
    //     message: 'Must be 100 or fewer characters long',
    //   })
    //   .optional(),
    username: z
      .string({ required_error: 'Please enter your username' })
      .min(minLength, { message: 'Username is too short' })
      .max(usernameMaxLength, {
        message: 'Must be 20 or fewer characters long',
      }),
    email: z
      .string({ required_error: 'Please enter your email address' })
      .min(minLength, { message: 'Email is too short' })
      .max(emailMaxLength, { message: 'Email is too long' })
      .email({
        message: 'Please enter a valid email address',
      }),
    password: z // TODO improve security requirement validation for passwords
      .string({ required_error: 'Please enter your password' })
      .min(minLength, { message: 'Password is too short' })
      .max(passwordMaxLength, {
        message: 'Must be 100 or fewer characters long',
      }),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' })
      .max(passwordMaxLength, {
        message: 'Must be 100 or fewer characters long',
      }),
    rememberMe: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: "Passwords don't match",
      });
    }
  });

export async function loader({ request }: LoaderFunctionArgs) {
  return await redirectIfAuthenticated(request);
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectIfAuthenticated(request); // using this to prevent already authed user from submitting a signup request

  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: signupSchema.superRefine(async (val, ctx) => {
      // get the user using email if it exists
      const existingEmail = await prisma.user.findUnique({
        select: {
          id: true,
        },
        where: {
          email: val.email,
        },
      });
      // throw validation error if the email already exists
      if (existingEmail) {
        ctx.addIssue({
          path: ['email'],
          code: 'custom',
          message: 'Email already exists',
          fatal: true,
        });
        return z.NEVER;
      }
      //  get the user using username if it exists
      const existingUsername = await prisma.user.findUnique({
        select: {
          id: true,
        },
        where: {
          username: val.username,
        },
      });
      // throw validation error if the username already exists
      if (existingUsername) {
        ctx.addIssue({
          path: ['username'],
          code: 'custom',
          message: 'Username already exists',
          fatal: true,
        });
        return z.NEVER;
      }
      return val;
    }),
    // .transform(async (val) => {
    //   // create user if username checks out and hash the submitted password
    //   const user = await prisma.user.create({
    //     select: { id: true },
    //     data: {
    //       email: val.email.toLowerCase(),
    //       username: val.username.toLowerCase().trim(),
    //       // name: val.name,
    //       // displayName: val.displayName,
    //       roles: {
    //         connect: {
    //           name: 'user',
    //         },
    //       },
    //       password: {
    //         create: {
    //           hash: bcrypt.hashSync(val.password, 10),
    //         },
    //       },
    //     },
    //   });
    //   return { ...val, user };
    // }),
    async: true,
  });
  delete submission.payload.password;

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply({
          hideFields: ['password', 'confirmPassword'],
        }), // do not want to make entered pw's accessible via http response
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    );
  }
  // const { rememberMe, user } = await submission.value;
  const { username, email, password, rememberMe } = await submission.value;
  const hashPassword = bcrypt.hashSync(password, 10);

  if (submission.status === 'success') {
    // // show toaster success message using cookieSession
    // const cookie = request.headers.get('cookie');
    // const cookieSession = await toastSessionStorage.getSession(cookie);
    // // replace 'set' with 'flash'. flash method automatically unsets value after the next 'get' for 'authMessage'
    // cookieSession.flash('registrationMessage', {
    //   type: 'success',
    //   title: 'Signed in',
    //   description: 'You are signed in',
    // });
    // const setToastCookieHeader = await toastSessionStorage.commitSession(
    //   cookieSession
    // );

    // // set cookie session for authentication
    // const cookieAuthSession = await authSessionStorage.getSession(cookie);
    // cookieAuthSession.set('authSession', user.id);
    // const setAuthCookieHeader = await authSessionStorage.commitSession(
    //   cookieAuthSession,
    //   { expires: rememberMe ? getCookieSessionExpirationDate() : undefined }
    // );

    // return redirect('/', {
    //   headers: combineHeaders(
    //     { 'set-cookie': setToastCookieHeader },
    //     { 'set-cookie': setAuthCookieHeader }
    //   ),
    // });

    // verification session cookie for onboarding
    const verifyCookieSession = await verficationSessionStorage.getSession(
      request.headers.get('cookie')
    );
    verifyCookieSession.set('verifySession', {
      username,
      email,
      hashPassword,
      rememberMe,
    });
    const setVerifyCookieSession =
      await verficationSessionStorage.commitSession(verifyCookieSession);

    // create the redirect URL with the appropriate search params
    const originUrl = new URL(request.url).origin;
    const verificationRedirect = new URL(originUrl + '/verify');
    const type = 'email';
    const target = email;
    verificationRedirect.searchParams.set('type', type);
    verificationRedirect.searchParams.set('target', target);

    // Create the one time password. Docs: https://www.npmjs.com/package/@epic-web/totp
    const verificationCodeConfig = generateTOTP({
      algorithm: 'SHA256',
      period: 10 * 60, // 10 mins (if you change this, make sure to changet the verifyCookieSession expiry!!)
      digits: 8,
    });

    const verificationTempData = {
      type: 'email',
      target: email,
      secret: verificationCodeConfig.secret,
      digits: verificationCodeConfig.digits,
      algorithm: verificationCodeConfig.algorithm,
      charSet: verificationCodeConfig.charSet,
      period: verificationCodeConfig.period,
      expiresAt: new Date(Date.now() + verificationCodeConfig.period * 1000),
    };

    // Set the generatedCodeConfig params to the db (note: This will only be temporarily added)
    await prisma.authVerificationCode.upsert({
      where: {
        type_target: { type: verificationTempData.type, target: email },
      },
      create: verificationTempData,
      update: verificationTempData,
    });

    const response = await sendEmail({
      to: email,
      subject: 'Confirm email',
      text: 'Please confirm your email address',
      html: `<p>Please confirm your email address by entering this code ${verificationCodeConfig.otp}. It expires in 10 minutes.</p>`,
    });

    if (response.status === 'success') {
      return redirect(verificationRedirect.toString(), {
        headers: { 'set-cookie': setVerifyCookieSession },
      });
    }
  } else {
    throw new Response('Not found', { status: 500 });
  }
}

export default function SignupRoute() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    // getZodConstraint configures the Zod fields with appropriate attributes
    constraint: getZodConstraint(signupSchema),
    // runs validation logic on the client (before it runs on the server, quicker validation for slow networks)
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signupSchema });
    },
  });

  // Using conform utilities to replace manual field settings (eg input id's, aria fields) to support with accessbility (https://conform.guide/accessibility). Left fieldErrors below to show old way without conform
  // const fieldErrors = lastResult?.status == 'error' ? lastResult.error : null;
  // const firstNameHasError = Boolean(fieldErrors?.firstName?.length);
  // const firstNameErrorID = firstNameHasError ? 'firstName-error' : undefined;

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Signup for an account</p>
        </div>
        <div className="w-80 ">
          <Form method="post" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            <div>
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input {...getInputProps(fields.email, { type: 'email' })} />
              <div>
                <FormOrFieldErrorsList
                  data={fields.email.errors}
                  errorID={fields.email.errorId}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={fields.username.id}>Username</Label>
              <Input
                {...getInputProps(fields.username, { type: 'text' })}
                // required
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.username.errors}
                  errorID={fields.username.errorId}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={fields.password.id}>Password</Label>
              <Input
                {...getInputProps(fields.password, { type: 'password' })}
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
                Confirm password
              </Label>
              <Input
                {...getInputProps(fields.confirmPassword, { type: 'password' })}
              />
              <div>
                <FormOrFieldErrorsList
                  data={fields.confirmPassword.errors}
                  errorID={fields.confirmPassword.errorId}
                />
              </div>
            </div>
            <div className="flex py-2">
              <CheckboxConform meta={fields.rememberMe} />
              <Label className="ml-2 self-end" htmlFor={fields.rememberMe.id}>
                Remember me
              </Label>
              <div>
                <FormOrFieldErrorsList
                  data={fields.rememberMe.errors}
                  errorID={fields.rememberMe.id}
                />
              </div>
            </div>
            <div>
              <FormOrFieldErrorsList
                data={form.errors}
                errorID={form.errorId}
              />
            </div>
            <div>
              <Button type="submit" name="intent" value="signup">
                Sign up
              </Button>
            </div>
          </Form>
          <div>
            <Button variant="link" asChild>
              <Link to="/login">Already have an account? Log in</Link>
            </Button>
          </div>
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
