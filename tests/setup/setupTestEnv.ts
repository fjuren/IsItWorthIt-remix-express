import { vi, beforeEach, MockInstance } from 'vitest';
import { installGlobals } from '@remix-run/node';

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals();

export let consoleErrorSpy: MockInstance<typeof console.error>;

// setup file for all vitests. Recall setupFiles defined in vitest.config
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
