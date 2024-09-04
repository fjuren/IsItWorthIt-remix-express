/* eslint-disable jsx-a11y/no-autofocus */
// using conform to support with:
// - Schema validation support
// - Progressively enhanced experience (eg. hydrating to leverage out of box browser errors for slow network speeds)
// - Accessibility support (ie. using getZodConstraint which assigns values to input attributes like aria-describedby)

import {
  MetaFunction,
  type ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Link,
  Params,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
// import { useEffect, useState } from 'react';
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { Button } from '~/components/UI/Button';
import { Card } from '~/components/UI/Card';
import { Input } from '~/components/UI/Input';
import { Label } from '~/components/UI/Label';
import { FormOrFieldErrorsList, combineHeaders } from '~/utils/misc';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { checkHoneypot } from '~/utils/honeypot.server';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { checkCSRF } from '~/utils/csrf.server';
import { prisma } from '~/utils/db.server';
import {
  onboardWithOAuthConnection,
  redirectIfAuthenticated,
} from '~/utils/auth.server';
import { CheckboxConform } from '~/components/UI/Checkbox';
import { verficationSessionStorage } from '~/utils/verification.server';
import { authSessionKey, verifySessionKey } from '~/utils/constants';
import { EmailSchema, UsernameSchema } from '~/utils/fieldValidation';
import {
  DISCORD_OAUTH_NAME,
  OauthServicesNameSchema,
} from '~/utils/oAuthConnections';
import { generalToast, toastVerificationKey } from '~/utils/toast.server';
import {
  authSessionStorage,
  getCookieSessionExpirationDate,
} from '~/utils/session.server';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '~/components/UI/Avatar';
import { discordAvatarToUrl } from '~/utils/oAuthConnections/discord.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Setup account' },
    {
      name: 'description',
      content: 'Finish setting up your new account',
    },
  ];
};

const oAuthOnboardSchema = z.object({
  email: EmailSchema,
  username: UsernameSchema,
  avatar: z.string().optional(),
  rememberMe: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await redirectIfAuthenticated(request); // using this to prevent already authed user using this page
  const { email, username, avatar, oAuthConnectionUserId } =
    await requireOAuthData({
      request,
      params,
    });
  const oAuthConnectionName = params.oAuthConnection;

  let oAuthAvatar = null;
  if (oAuthConnectionName === DISCORD_OAUTH_NAME) {
    oAuthAvatar = discordAvatarToUrl(oAuthConnectionUserId, avatar);
  }

  return json({
    email,
    username,
    oAuthConnectionUserId,
    oAuthAvatar,
    oAuthConnectionName,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await redirectIfAuthenticated(request);
  const { oAuthConnectionUserId, oAuthConnectionName } = await requireOAuthData(
    { request, params }
  );

  const formData = await request.formData();
  await checkCSRF(formData, request.headers);
  checkHoneypot(formData);

  const submission = await parseWithZod(formData, {
    schema: oAuthOnboardSchema
      .superRefine(async (val, ctx) => {
        // get the user using email if it exists
        const existingUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            OR: [
              {
                email: val.email,
              },
              {
                username: val.username,
              },
            ],
          },
        });
        // throw validation error if the username or email already exists
        if (existingUser) {
          ctx.addIssue({
            path: ['email'],
            code: 'custom',
            message: 'User with this email or username already exists',
            fatal: true,
          });
          return z.NEVER;
        }
        if (existingUser) {
          ctx.addIssue({
            path: ['username'],
            code: 'custom',
            message: 'User with this email or username already exists',
            fatal: true,
          });
          return z.NEVER;
        }
        return;
      })
      .transform(async (data) => {
        const user = await onboardWithOAuthConnection({
          oAuthUser: {
            oAuthConnectionProviderId: oAuthConnectionUserId,
            email: data.email,
            oAuthConnectionProviderName: oAuthConnectionName,
            username: data.username,
            avatar: data.avatar,
          },
        });
        return { data, user };
        // TODO create the new user now with the proper connection. Create a special function for this
      }),
    async: true,
  });

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    );
  }

  const { data, user } = await submission.value;

  if (submission.status === 'success') {
    // authenticate
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
      {
        expires: data.rememberMe ? getCookieSessionExpirationDate() : undefined,
      }
    );

    return redirect(data.redirectTo ?? '/', {
      headers: combineHeaders(setToastCookieHeader, {
        'set-cookie': setAuthCookieHeader,
      }),
    });
  } else {
    throw new Response('Not found', { status: 500 });
  }
}

async function requireOAuthData({
  request,
  params,
}: {
  request: Request;
  params: Params;
}) {
  const verifySession = await verficationSessionStorage.getSession(
    request.headers.get('cookie')
  );

  // const oAuthConnectionData = verifySession.get(verifySessionKey);
  const { oAuthUserProfile } = verifySession.get(verifySessionKey);
  if (!oAuthUserProfile) {
    throw redirect('/signup');
  }
  const result = z
    .object({
      email: z.string(),
      username: UsernameSchema,
      oAuthConnectionUserId: z.string(),
      oAuthConnectionName: OauthServicesNameSchema,
      avatar: z.string().optional(),
    })
    .safeParse({
      email: oAuthUserProfile.email,
      username: oAuthUserProfile.userName,
      oAuthConnectionUserId: oAuthUserProfile.id,
      oAuthConnectionName: params.oAuthConnection,
      avatar: oAuthUserProfile.avatar,
    });
  if (result.success) {
    return result.data;
  } else {
    console.log(result.error);
    throw redirect('/signup');
  }
}

export default function OnboardOAuthConnectionRoute() {
  const data = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    // getZodConstraint configures the Zod fields with appropriate attributes
    constraint: getZodConstraint(oAuthOnboardSchema),
    defaultValue: {
      email: data.email,
      username: data.username,
      avatar: data.oAuthAvatar,
      redirectTo,
    },
    // runs validation logic on the client (before it runs on the server, quicker validation for slow networks)
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: oAuthOnboardSchema });
    },
  });

  return (
    <div className="flex w-fit m-auto py-10">
      <Card>
        <div>
          <p>
            Complete your account setup with {data.oAuthConnectionName}! Change
            your details if you&apos;d like
          </p>
        </div>
        <div className="w-80 ">
          <Form method="post" {...getFormProps(form)}>
            <HoneypotInputs />
            <AuthenticityTokenInput />
            {fields.avatar ? (
              <div>
                <Avatar className="bg-blackA1 inline-flex h-[70px] w-[70px] select-none items-center justify-center overflow-hidden rounded-full align-middle">
                  <AvatarImage
                    className="h-full w-full rounded-[inherit] object-cover"
                    src={fields.avatar.value}
                    alt="Profile image. This can be changed later."
                  />
                  <AvatarFallback
                    className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-black text-[15px] font-medium"
                    delayMs={600}
                  >
                    CT
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : null}
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
              <Input
                {...getInputProps(fields.redirectTo, { type: 'hidden' })}
              />
            </div>
            <div>
              <FormOrFieldErrorsList
                data={form.errors}
                errorID={form.errorId}
              />
            </div>
            <div>
              <Button type="submit" name="intent" value="signup">
                Submit
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
