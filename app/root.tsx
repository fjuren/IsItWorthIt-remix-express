import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import faviconAssetUrl from './assets/favicon.ico';
import tailwindFontsStylesheet from './styles/tailwind.css';
import './styles/global.css';
import { GeneralErrorBoundary } from './components/error-boundary';

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

// export async function loader() {
//   throw new Error('loader error');
//   return json({});
// }

export function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col justify-between bg-background text-foreground">
        <header className="container mx-auto py-6">
          <nav className="flex justify-between">
            <Link to="/">Home</Link>
            <Link to="/users/johndoe">Profile</Link>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  // throw new Error('Component error');
  return (
    <Document>
      <div className="flex-1">
        <Outlet />
      </div>
    </Document>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
