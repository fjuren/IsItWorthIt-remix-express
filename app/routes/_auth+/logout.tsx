import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { logout } from '~/utils/auth.server';

export async function loader() {
  return redirect('/');
}

export async function action({ request }: LoaderFunctionArgs) {
  return await logout(request);
}
