import { faker } from '@faker-js/faker';
import { bcrypt } from '~/utils/auth.server';
import { prisma } from '~/utils/db.server';

// create fake user data
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

// creates a user in the db
export async function registerUser() {
  const userData = newUserData();
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: {
        create: {
          hash: bcrypt.hashSync(userData.password, 10),
        },
      },
      roles: {
        connect: {
          name: 'user',
        },
      },
    },
  });
  console.log(`${user} created in db`);
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password: userData.password,
  };
}
