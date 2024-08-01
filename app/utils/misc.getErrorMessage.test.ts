import { describe, expect, test } from 'vitest';
import { getErrorMessage } from './misc';
import { faker } from '@faker-js/faker';
import { consoleErrorSpy } from 'tests/setup/setupTestEnv';

describe('getErrorMessage unit test', () => {
  test('Regular error is a simple string', () => {
    const message = faker.lorem.words(2);
    expect(getErrorMessage(message)).toBe(message);
  });

  test('Error exists as an object and has a message param', () => {
    const message = faker.lorem.words(2);
    const error = new Error(message);
    expect(getErrorMessage(error)).toBe(message);
  });

  test('Receive an unknown type of error', () => {
    expect(getErrorMessage(undefined)).toBe('Unknown Error');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unable to get error message for error',
      undefined
    );
  });
});
