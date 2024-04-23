import { Outlet } from '@remix-run/react';
import { Document } from '~/root';
import { SideNav } from '~/components/UI/SideNav';
import { GeneralErrorBoundary } from '~/components/error-boundary';

// Layout with SideNav

export default function MainLayout() {
  // throw new Error('Component error');
  return (
    <>
      {/* desktop sidenav (sidenav hidden on mobile) */}
      <aside>
        <SideNav />
      </aside>
      {/* main content */}
      <main className="flex-1 overflow-auto md:w-full">
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
