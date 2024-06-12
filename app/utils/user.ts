import { useRouteLoaderData } from '@remix-run/react';
import { loader as rootLoader } from '../root';

// used to handle whether a logged in user is present. Using this for when being logged in optional (helps for show/hide UI components)
export function useOptionalUser() {
  // userRouteLoaderData just gives the route url **path**
  const data = useRouteLoaderData<typeof rootLoader>('root');
  return data?.user ? data.user : null;
}

// used to ensure a logged in user is present (doesn't care who is logged in). A logged in user is always required for where we place this utility function
export function useUser() {
  const userMightExists = useOptionalUser();
  if (userMightExists) {
    return userMightExists;
  }
  throw new Error(
    'Authed user does not exist but is required. If authed user is not required, consider using useOptionalUser'
  );
}
