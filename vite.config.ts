
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

import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { envOnlyMacros } from 'vite-env-only';

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    envOnlyMacros(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
