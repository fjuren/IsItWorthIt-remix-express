import { Outlet } from '@remix-run/react';
import { Document } from '~/root';
import { TopNav } from '~/components/UI/TopNav';
import { GeneralErrorBoundary } from '~/components/error-boundary';

export default function AuthLayout() {
  // throw new Error('Component error');
  return (
    <Document>
      <TopNav />
      <div className="fixed flex w-full h-full">
        {/* main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
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
