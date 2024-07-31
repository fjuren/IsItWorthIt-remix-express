import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['app/**/*.{ts,tsx}'],
      all: true,
    },
    include: ['**/app/utils/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },
});
