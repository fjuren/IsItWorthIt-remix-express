// import type { MetaFunction } from '@remix-run/node';

import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { db } from 'app/utils/db.server';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { invariantResponse } from '~/utils/misc';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user ?? params.user;
  return [
    { title: `${displayName}'s profile` },
    { name: 'description', content: `${displayName}'s profile page` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const user = db.user.findFirst({
    where: {
      username: {
        equals: params.user,
      },
    },
  });
  // throw new Error('Component error');
  invariantResponse(user, `User not found`, { status: 404 });
  return json({ user: user.name, username: user.username });
}

export default function UsernameRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>{data.username} profile page</h1>
      <Link to="settings">Settings</Link>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      defaultStatusHandler={({ error }) => (
        <p>
          Default Error Handler: {error.status} - {error.data}
        </p>
      )}
      statusHandlers={{
        404: ({ error, params }) => (
          <p>
            {error.status}: No user with the username {params.user} exists
          </p>
        ),
      }}
    />
  );
}
