/* eslint-disable jsx-a11y/no-autofocus */
import { parseWithZod } from '@conform-to/zod';
import { useForm } from '@conform-to/react';
import {
  MetaFunction,
  type ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { FieldErrorsList } from '~/utils/misc';

export const meta: MetaFunction = () => {
  return [
    { title: 'Signup' },
    {
      name: 'description',
      content: 'Sign up for an account',
    },
  ];
};

const nameMaxLength: number = 100;
const usernameMaxLength: number = 20;
const minLength: number = 3;
const passwordMaxLength: number = 100;
const emailMaxLength: number = 100;

const signupSchema = z
  .object({
    firstName: z
      .string()
      .max(nameMaxLength, {
        message: 'Must be 100 or fewer characters long',
      })
      .optional(),
    lastName: z
      .string()
      .max(nameMaxLength, {
        message: 'Must be 100 or fewer characters long',
      })
      .optional(),
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
    password: z
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: signupSchema });

  if (submission.status !== 'success') {
    return json(
      submission.reply({ hideFields: ['password', 'confirmPassword'] }), // do not want to make entered pw's accessible via http response
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    );
  }

  const { firstName, lastName, username, email, password, confirmPassword } =
    await submission.value;

  console.log({
    // TODO add to db when ready
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
  });

  if (submission.status === 'success') {
    return redirect('/');
  } else {
    // status 500?
  }
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function SignupRoute() {
  const lastResult = useActionData<typeof action>();
  const fieldErrors = lastResult?.status == 'error' ? lastResult.error : null;

  const firstNameHasError = Boolean(fieldErrors?.firstName?.length);
  const firstNameErrorID = firstNameHasError ? 'firstName-error' : undefined;
  const lastNameHasError = Boolean(fieldErrors?.lastName?.length);
  const lastNameErrorID = lastNameHasError ? 'lastName-error' : undefined;
  const usernameHasError = Boolean(fieldErrors?.username?.length);
  const usernameErrorID = usernameHasError ? 'username-error' : undefined;
  const emailHasError = Boolean(fieldErrors?.email?.length);
  const emailHasErrorID = emailHasError ? 'email-error' : undefined;
  const passwordHasError = Boolean(fieldErrors?.password?.length);
  const passwordHasErrorID = passwordHasError ? 'password-error' : undefined;
  const confirmPasswordHasError = Boolean(fieldErrors?.confirmPassword?.length);
  const confirmPasswordHasErrorID = confirmPasswordHasError
    ? 'confirmPassword-error'
    : undefined;
  const formHasErrors = false; // placeholder
  const isHydrated = useHydrated(); // to support those with slower networks; prevents waiting for JS to load on the browser and would default to browser validation

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>Signup for an account</p>
        </div>
        <div className="w-80 ">
          <Form
            id="signup-form"
            method="post"
            noValidate={isHydrated}
            aria-invalid={formHasErrors}
            aria-describedby={formHasErrors ? 'form-error' : undefined}
          >
            <div>
              <Label htmlFor="firstName">First name (Optional)</Label>
              <Input
                id="firstName"
                name="firstName"
                type="string"
                aria-invalid={firstNameHasError}
                aria-describedby={firstNameErrorID}
                autoFocus
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.firstName}
                  errorID={'firstName-error'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last name (Optional)</Label>
              <Input
                id="lastName"
                name="lastName"
                type="string"
                aria-invalid={lastNameHasError}
                aria-describedby={lastNameErrorID}
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.lastName}
                  errorID={'lastName-error'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="string"
                aria-invalid={usernameHasError}
                aria-describedby={usernameErrorID}
                required
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.username}
                  errorID={'username-error'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                aria-invalid={emailHasError}
                aria-describedby={emailHasErrorID}
                required
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.email}
                  errorID={'email-error'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                aria-invalid={passwordHasError}
                aria-describedby={passwordHasErrorID}
                required
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.password}
                  errorID={'password-error'}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                aria-invalid={confirmPasswordHasError}
                aria-describedby={confirmPasswordHasErrorID}
                required
              />
              <div>
                <FieldErrorsList
                  data={fieldErrors?.confirmPassword}
                  errorID={'confirmPassword-error'}
                />
              </div>
            </div>
            <div>
              <Button type="submit">Sign up</Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
