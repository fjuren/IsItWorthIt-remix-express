import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import faviconAssetUrl from './assets/favicon.ico';
import tailwindFontsStylesheet from './styles/tailwind.css';
// import './styles/global.css';
import { GeneralErrorBoundary } from './components/error-boundary';
import { ThemeProvider, useTheme } from './utils/theme-provider';
import clsx from 'clsx';

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

export function Document({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme();
  // throw new Response('Not found', { status: 500 });

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body className="font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
