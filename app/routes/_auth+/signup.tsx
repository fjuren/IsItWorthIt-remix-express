/* eslint-disable jsx-a11y/no-autofocus */
import {
  MetaFunction,
  type ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { useEffect } from 'react';
import { z } from 'zod';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';

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
const minLength: number = 1;
const passwordMaxLength: number = 100;

const signupSchema = z
  .object({
    firstName: z.string().max(nameMaxLength, {
      message: 'Must be 100 or fewer characters long',
    }),
    lastName: z.string().max(nameMaxLength, {
      message: 'Must be 100 or fewer characters long',
    }),
    username: z
      .string()
      .min(1, { message: 'Please enter your username' })
      .max(usernameMaxLength, {
        message: 'Must be 20 or fewer characters long',
      })
      .trim(),
    email: z
      .string()
      .min(minLength, { message: 'please enter your email' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(minLength, { message: 'please enter your password' })
      .max(passwordMaxLength, {
        message: 'Must be 100 or fewer characters long',
      }),
    confirmPassword: z
      .string()
      .min(minLength, { message: 'please re-enter your password' })
      .max(passwordMaxLength, {
        message: 'Must be 100 or fewer characters long',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = signupSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!result.success) {
    return json({
      status: 'error',
      statusCode: 400,
      errors: result.error.flatten(),
    });
  }

  const { firstName, lastName, username, email, password, confirmPassword } =
    result.data;

  console.log({
    // TODO add to db when ready
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
  });

  return redirect('/');
}

// need loader?

export default function SignupRoute() {
  const actionData = useActionData<typeof action>();
  const formHasErrors = false; // placeholder
  const hasErrors = false; // placeholder

  return (
    <div>
      <Card>
        <div>
          <p>Signup for an account</p>
        </div>
        <div className="w-80 ">
          <Form
            method="post"
            aria-invalid={formHasErrors || undefined}
            aria-describedby={formHasErrors ? 'form-error' : undefined}
          >
            <div>
              <Label htmlFor="firstName">First name (Optional)</Label>
              <Input
                id="firstName"
                name="firstName"
                type="string"
                aria-invalid={hasErrors || undefined} //TODO make this conditional per error logic
                aria-describedby={hasErrors ? 'firstName-error' : undefined}
                autoFocus
              />
              <div>
                <ul id="firstName-error">
                  <li>{/*TODO error message - create an error utility */}</li>
                </ul>
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last name (Optional)</Label>
              <Input id="lastName" name="lastName" type="string" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="string"
                // required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                // required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                // required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                // required
              />
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
