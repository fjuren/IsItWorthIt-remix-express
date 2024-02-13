// import { cssBundleHref } from "@remix-run/css-bundle";
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
import globalStylesheet from './styles/global.css';
import tailwindFontsStylesheet from './styles/tailwind.css';

export const links: LinksFunction = () => {
  // ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  return [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: faviconAssetUrl, // importing faviconAssetUrl gave favicon asset a remix fingerprint
    },
    {
      rel: 'stylesheet',
      href: globalStylesheet,
    },
    {
      rel: 'stylesheet',
      href: tailwindFontsStylesheet,
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
