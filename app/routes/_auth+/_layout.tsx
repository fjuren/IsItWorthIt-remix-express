import { Outlet } from '@remix-run/react';
import { Document } from '~/root';
import { TopNav } from '~/components/UI/TopNav';
import { ThemeProvider } from '~/utils/theme-provider';

export default function App() {
  // throw new Error('Component error');
  return (
    <ThemeProvider>
      <Document>
        <TopNav />
        <div className="fixed flex w-full h-full">
          {/* main content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </Document>
    </ThemeProvider>
  );
}
