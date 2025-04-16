// splat route

import { Link, useLocation } from 'react-router-dom';
import { GeneralErrorBoundary } from '~/components/error-boundary';

export async function loader() {
  throw new Response('Not found', { status: 404 });
}

export function ErrorBoundary() {
  const location = useLocation();
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1>Page not found</h1>
              <pre className="text-body-lg whitespace-pre-wrap break-all">
                {location.pathname}
              </pre>
            </div>
            <Link to="/" className="text-body-md underline">
              Back to Home
            </Link>
          </div>
        ),
      }}
    />
  );
}

// adding this so the error is treated as a UI route rather than a path route
export default function NotFound() {
  return <ErrorBoundary />;
}
