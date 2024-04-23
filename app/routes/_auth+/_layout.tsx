import { Outlet } from '@remix-run/react';
import { Document } from '~/root';
import { GeneralErrorBoundary } from '~/components/error-boundary';

// Layout without SideNav

export default function AuthLayout() {
  // throw new Error('Component error');
  return (
    <>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
