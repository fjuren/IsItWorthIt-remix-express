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
import './styles/global.css';
import { GeneralErrorBoundary } from './components/error-boundary';
import { TopNav } from './components/UI/TopNav';
import { SideNav } from './components/UI/SideNav';
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

// export async function loader() {
//   throw new Error('loader error');
//   return json({});
// }

export function Document({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* header in TopNav */}
        <TopNav />

        <div className="fixed flex w-full h-full">
          {/* desktop sidenav (sidenav hidden on mobile) */}
          <aside>
            <SideNav />
          </aside>
          {/* main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
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
    <ThemeProvider>
      <Document>
        <>
          <Outlet />
        </>
      </Document>
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
