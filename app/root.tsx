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

  return json(
    { honeyProps, csrfToken },
    { headers: csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : {} }
  );
}

// light/dark array

// export async function action({request}: ActionFunctionArgs) {

// }

export function Document({ children }: { children: React.ReactNode }) {
  // throw new Response('Not found', { status: 500 });

  return (
    <html lang="en" className="dark">
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body className="font-sans ">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  return (
    <Document>
      <TopNav />
      <div className="fixed flex w-full h-full">
        <Outlet />
      </div>
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

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
