import { Outlet } from '@remix-run/react';
import { Document } from '~/root';
import { TopNav } from '~/components/UI/TopNav';
import { SideNav } from '~/components/UI/SideNav';
import { GeneralErrorBoundary } from '~/components/error-boundary';

export default function MainLayout() {
  // throw new Error('Component error');
  return (
    <Document>
      <TopNav />
      <div className="fixed flex w-full h-full">
        {/* desktop sidenav (sidenav hidden on mobile) */}
        <aside>
          <SideNav />
        </aside>
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
