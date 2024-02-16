// Throws error if user doesn't exist and redirects to login

export async function requireUser(testUser: string) {
  const user = testUser;
  if (!user) {
    throw new Response(null, { status: 302, headers: { location: '/' } });
  }
}

export function invariantResponse(
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit
): asserts condition {
  if (!condition) {
    throw new Response(
      typeof message === 'function'
        ? message()
        : message ||
          'An invariant failed, please provide a message to explain why.',
      { status: 400, ...responseInit }
    );
  }
}
