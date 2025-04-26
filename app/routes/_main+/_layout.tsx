import { Outlet, useOutletContext } from 'react-router-dom';
import { Document } from '~/root';
import { SideNav } from '~/components/UI/SideNav';
import { GeneralErrorBoundary } from '~/components/error-boundary';

// Layout with SideNav

export default function MainLayout() {
  const theme = useOutletContext();
  // throw new Error('Component error');
  return (
    <>
      {/* desktop sidenav (sidenav hidden on mobile) */}
      <aside>
        <SideNav />
      </aside>
      {/* main content */}
      <main className="flex flex-col flex-1 items-center gap-4 overflow-auto mt-2 mb-24">
        <Outlet context={theme} />
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
