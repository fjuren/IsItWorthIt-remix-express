// required file for migration to React Router v7
// eslint-disable-next-line import/no-unresolved
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "remix-flat-routes";
// import { flatRoutes } from "@react-router/fs-routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

// Use flatRoutes with remixRoutesOptionAdapter to properly configure routes
export default remixRoutesOptionAdapter((defineRoutes) => {
  return flatRoutes("routes", defineRoutes, {
    ignoredRouteFiles: ["**/.*", "**/*.test.*"], // Ignore dot files and test files
  });
}) satisfies RouteConfig;
