
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

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_singleFetch: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
      },
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
      // appDirectory: "app",
      // assetsBuildDirectory: "public/build",
      // publicPath: "/build/",
      // serverBuildPath: "build/index.js",
    }),
    tsconfigPaths(),
  ],
});
