// import the test db setup for testing
import './setupTestDB';
import { vi, beforeEach, MockInstance, afterEach } from 'vitest';
// import { installGlobals } from '@remix-run/node';
import { cleanup } from '@testing-library/react';

// This installs globals such as "fetch", "Response", "Request" and "Headers".
// installGlobals(); <- no longer needed since node v20 +

// globally applied cleanup for component testing tests (recall that I can remove this if I didn't want this set globally and instead  wanted to import it to each test file)
afterEach(async () => {
  cleanup();
});

export let consoleErrorSpy: MockInstance<typeof console.error>;

// setup file for all vitests. Recall setupFiles defined in vitest.config
beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
