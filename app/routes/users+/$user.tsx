// import type { MetaFunction } from '@remix-run/node';

import { LoaderFunctionArgs, json } from '@remix-run/node';
import {
  Link,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { db } from 'app/utils/db.server';
import { invariantResponse } from '~/utils/misc';
// export const meta: MetaFunction = () => {
//   return [{ title: 'Home' }, { name: 'description', content: 'Homepage' }];
// };

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

export default function Username() {
  const params = useParams();
  return (
    <div>
      <h1>{params.user} profile page</h1>
      <Link to="settings">Settings</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const params = useParams();

  let errorMessage = <p>Oh no, something went wrong. Sorry about that.</p>;
  if (isRouteErrorResponse(error) && error.status === 404) {
    errorMessage = <p>No username of {params.user} was found</p>;
  }

  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
      {errorMessage}
    </div>
  );
}
