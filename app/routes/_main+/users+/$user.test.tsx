/**
 * @vitest-environment jsdom
 */

import { faker } from '@faker-js/faker';
import { test } from 'vitest';

function createTestUser() {
  const user = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    createdAt: faker.date.past(),
    image: {
      id: faker.string.uuid(),
    },
  };
  return user;
}

test('visit /settings/user (profile page) as a visitor', async () => {
  const user = createTestUser();
});
