import { useRouteLoaderData } from '@remix-run/react';
import { loader as rootLoader } from '../root';

// used to handle whether a logged in user is present, where being logged in optional
export function useOptionalUser() {
  // userRouteLoaderData just gives the route url **path**
  const data = useRouteLoaderData<typeof rootLoader>('root');
  return data?.user ? data.user : null;
}

// used to ensure a logged in user is present. A logged in user is always required
export function useUser() {
  const userExists = useOptionalUser();
  if (userExists) {
    return userExists;
  }
  throw new Error(
    'Authed user does not exist but is required. If authed user is not required, consider using useOptionalUser'
  );
}
