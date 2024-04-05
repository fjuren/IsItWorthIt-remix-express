// Throws error if user doesn't exist and redirects to login

export async function requireUser(testUser: string) {
  const user = testUser;
  if (!user) {
    throw new Response(null, { status: 302, headers: { location: '/' } });
  }
}

/**
 * Does its best to get a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  console.error('Unable to get error message for error', error);
  return 'Unknown Error';
}

export function invariantResponse(
  condition: any,
  message?: string | (() => string),
  responseInit?: ResponseInit
): asserts condition {
  if (!condition) {
    throw new Response( // Recall that throwing Responses will be rendered in the ErrorBoundary
      typeof message === 'function'
        ? message()
        : message ||
          'An invariant failed, please provide a message to explain why.',
      { status: 400, ...responseInit }
    );
  }
}

export function FieldErrorsList({
  data,
  errorID,
}: {
  data?: string[] | null | undefined;
  errorID?: string;
}) {
  return (
    <ul id={errorID}>
      {data?.map((e, i) => (
        <li className={'text-destructive text-xs'} key={i}>
          {e}
        </li>
      ))}
    </ul>
  );
}
