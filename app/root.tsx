import { cssBundleHref } from '@remix-run/css-bundle';
import type {
  // ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import faviconAssetUrl from './assets/favicon.ico';
import tailwindFontsStylesheet from './styles/tailwind.css';
// import './styles/global.css';
import { GeneralErrorBoundary } from './components/error-boundary';
import { HoneypotProvider } from 'remix-utils/honeypot/react';
import { honeypot } from './utils/honeypot.server';
import { csrf } from './utils/csrf.server';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';
import { TopNav } from './components/UI/TopNav';
import { getTheme } from './utils/theme.server';
import { useOptimisticUITheme } from './routes/_main+/settings+/account+/_index';
import { Toaster } from './components/UI/Toaster';
import {
  toastVerificationKey,
  toastSessionStorage,
} from './utils/toast.server';
import { useToast } from './utils/Use-Toast';
import { combineHeaders } from './utils/misc';
import { useEffect } from 'react';
import { authSessionStorage } from './utils/session.server';
import { prisma } from './utils/db.server';
import { useOptionalUser } from './utils/user';
import { getUserId } from './utils/auth.server';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: faviconAssetUrl, // importing faviconAssetUrl gave favicon asset a remix fingerprint
    },
    {
      rel: 'stylesheet',
      href: tailwindFontsStylesheet,
    },
    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const honeyProps = honeypot.getInputProps();
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);
  const cookie = request.headers.get('cookie');
  const toastCookieSession = await toastSessionStorage.getSession(cookie);
  const toast = toastCookieSession.get(toastVerificationKey);
  const authCookieSession = await authSessionStorage.getSession(cookie);
  const userId = await getUserId(request);

  const user = userId
    ? await prisma.user.findUnique({
        select: { id: true, username: true },
        where: {
          id: userId,
        },
      })
    : null;

  // This is to handle weird cases, eg. if the user is deleted somehow but their cookie session still exists, we should log them out/destroy their auth session
  if ((await userId) && !user) {
    return redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(
          authCookieSession
        ),
      },
    });
  }

  return json(
    {
      honeyProps,
      csrfToken,
      headers: getTheme(request),
      toast,
      user,
    },
    {
      headers: combineHeaders(
        csrfCookieHeader
          ? {
              'set-cookie': csrfCookieHeader,
            }
          : null,
        {
          'set-cookie': await toastSessionStorage.commitSession(
            toastCookieSession
          ),
        }
      ),
    }
  );
}

export function Document({ children }: { children: React.ReactNode }) {
  // throw new Response('Not found', { status: 500 });
  // const data = useLoaderData<typeof loader>();
  // const theme = data.headers;
  const theme = useOptimisticUITheme();

  return (
    <html lang="en" className={theme}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body className="font-sans ">
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();
  const loggedInUser = useOptionalUser();
  // const isLoggedInUser = loggedInUser?.id === data.user?.id; // TODO show/hide UI components when they're ready

  return (
    <Document>
      <TopNav loggedInUser={loggedInUser} />
      <div className="fixed flex w-full h-full">
        <Outlet />
      </div>
      {data.toast ? <RenderToast toastCookie={data.toast} /> : null}
    </Document>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <HoneypotProvider {...data.honeyProps}>
      <AuthenticityTokenProvider token={data.csrfToken}>
        <App />
      </AuthenticityTokenProvider>
    </HoneypotProvider>
  );
}

// BUG from docs; if the toast only renders once when making repeatable changes (ie. delete), it's because no id is set (BUG)
function RenderToast({ toastCookie }: { toastCookie: any }) {
  const { toast } = useToast();
  useEffect(() => {
    toast({
      type: 'foreground',
      variant: toastCookie.toastVariant, // success
      title: toastCookie.toastTitle,
      description: toastCookie.toastDescription,
    });
  }, [toastCookie, toast]);
  return null;
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
