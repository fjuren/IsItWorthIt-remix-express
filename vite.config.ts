import { flatRoutes } from 'remix-flat-routes';

// /** @type {import('@remix-run/dev').AppConfig} */
// export default {
//   ignoredRouteFiles: ['**/.*'],
//   serverModuleFormat: 'esm',
//   // appDirectory: "app",
//   // assetsBuildDirectory: "public/build",
//   // publicPath: "/build/",
//   // serverBuildPath: "build/index.js",
//   routes: async (defineRoutes) => {
//     return flatRoutes('routes', defineRoutes, {
//       ignoredRouteFiles: ['**/*.test.{js,jsx,ts,tsx}'],
//     });
//   },
// };

import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
      // appDirectory: "app",
      // assetsBuildDirectory: "public/build",
      // publicPath: "/build/",
      // serverBuildPath: "build/index.js",
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: ['**/*.test.{js,jsx,ts,tsx}'],
        });
      },
    }),
    tsconfigPaths(),
  ],
});
