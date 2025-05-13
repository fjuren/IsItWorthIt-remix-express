// Throws error if user doesn't exist and redirects to login

import { NavigateFunction } from "react-router";
import { filterOptions } from "./constants";

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

export function FormOrFieldErrorsList({
  data,
  errorID,
}: {
  data?: Array<string | undefined | null> | undefined | null;
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

// A header can't have multiple of the same property (eg. set-cookie). So this utility effectively combines the values into a single header property
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null>
) {
  const combined = new Headers();
  headers.forEach((header) => {
    if (header) {
      const [value] = new Headers(header).entries();
      combined.append(value[0], value[1]);
    }
  });
  return combined;
}

// export function combineHeaders(
//   ...headers: Array<ResponseInit['headers'] | null>
// ) {
//   const combined = new Headers();
//   headers.forEach((header) => {
//     if (header) {
//       const entries = new Headers(header).entries();
//       for (const [key, value] of entries) {
//         combined.append(key, value);
//       }
//     }
//   });
//   return combined;
// }

// simply capitalizes the first letter of a word
export function capitalizeFirstLetter(word: string) {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// excludedParmakey = params that are part of the regular form submission; includedParamkey = params you wish to keep on form submit 
export function handleSearchParams(
  searchParams: URLSearchParams,
  excludedParamKey?: string | string[]
) {
  const excludedKeys = Array.isArray(excludedParamKey)
    ? excludedParamKey
    : excludedParamKey ? [excludedParamKey] : [];

  return Array.from(searchParams.entries())
    .filter(([k]) => !excludedKeys.includes(k))
    .map(([k, v]) => (
      <input key={k} type="hidden" name={k} value={v} />
    ));
}


export function resetInputs(inputType: 'filter' | 'search', navigate: NavigateFunction) {
    const params = new URLSearchParams(location.search);
    if (inputType === 'search') {
      params.delete('gameTitle')
    } else if (inputType === 'filter') {
      for (const k in filterOptions) {
        params.delete(k)
      }
    }
    navigate(`?${params.toString()}`)
  }