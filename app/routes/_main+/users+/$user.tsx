// import type { MetaFunction } from '@remix-run/node';

import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
// import { db } from 'app/utils/db.server'; // local db
import { prisma } from '~/utils/db.server';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { invariantResponse } from '~/utils/misc';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.firstname ?? params.user;
  return [
    { title: `${displayName}'s profile` },
    { name: 'description', content: `${displayName}'s profile page` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  console.log(params);
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      firstname: true,
      lastname: true,
      createdAt: true,
      image: { select: { blob: true, altText: true } },
    },
    where: { username: params.user },
  });

  // throw new Error('Component error');
  invariantResponse(user, `User not found`, { status: 404 });
  return json({ user });
}

export default function UsernameRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <img src={data.user.image?.blob} alt="" />
      <h1>{data.user.firstname}&apos;s profile page</h1>
      <p>Joined {data.user.createdAt}</p>
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
