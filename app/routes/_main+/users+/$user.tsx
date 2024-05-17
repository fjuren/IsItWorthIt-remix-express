// import type { MetaFunction } from '@remix-run/node';

import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
// import { db } from 'app/utils/db.server'; // local db
import { prisma } from '~/utils/db.server';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { invariantResponse } from '~/utils/misc';
import { requireUserId } from '~/utils/auth.server';
import { useOptionalUser } from '~/utils/user';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.firstname ?? params.user;
  return [
    { title: `${displayName}'s profile` },
    { name: 'description', content: `${displayName}'s profile page` },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request); // protects route (must be authenticated)
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      username: true,
      email: true,
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
  const loggedInUser = useOptionalUser();
  const isLoggedInUser = loggedInUser?.id === data.user.id;
  return (
    <div>
      <div>
        <div>Profile</div>
        {/* <Link to="settings">
          Settings (add this to profile dropdown or open slide-out menu. Design
          tbd)
        </Link> */}
      </div>
      <div>
        <div>
          <img src={data.user.image?.blob} alt="" />
        </div>
        <div>
          <h2>{data.user.firstname}</h2>
        </div>
        <div>
          <h2>{data.user.lastname}</h2>
        </div>
        <div>
          <p>
            Joined {new Date(data.user.createdAt).toISOString().split('T')[0]}
          </p>
        </div>
      </div>
      <div>
        <div>Username: {data.user.username}</div>
        {isLoggedInUser ? <div>Email: {data.user.email}</div> : null}
      </div>
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
