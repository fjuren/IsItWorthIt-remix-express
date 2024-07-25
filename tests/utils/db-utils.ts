import { faker } from '@faker-js/faker';

export function newUserData() {
  const randFirstname = faker.person.firstName();
  const randLastname = faker.person.lastName();
  const randUsername = faker.internet.userName({
    firstName: randFirstname.toLowerCase(),
    lastName: randLastname.toLowerCase(),
  });
  return {
    username: randUsername,
    name: randFirstname,
    displayName: '',
    email: `${randUsername}@domain.com`,
    password: faker.internet.password(),
  };
}
