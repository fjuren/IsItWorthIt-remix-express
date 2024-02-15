import { flatRoutes } from 'remix-flat-routes';

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'esm',
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes);
  },
};
