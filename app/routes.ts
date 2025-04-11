// required file for migration to React Router v7
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
import { flatRoutes } from "remix-flat-routes";

// Use the adapter to convert your existing flat routes
export default remixRoutesOptionAdapter((defineRoutes) =>
  flatRoutes("routes", defineRoutes, {
    ignoredRouteFiles: ['**/*.test.{js,jsx,ts,tsx}', '**/*.server.*']
  })
);
