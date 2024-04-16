import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const John = await prisma.user.create({
    data: {
      id: 'd27a197e',
      email: 'JohnDoe@gmail.com',
      username: 'jdoe_1',
      firstname: 'John',
      lastname: 'Doe',
    },
  });
  const Sally = await prisma.user.create({
    data: {
      id: 'e25d497e',
      email: 'SallySmith@gmail.com',
      username: 'foxy_cleo',
      firstname: 'Sally',
      lastname: 'Smith',
    },
  });
  console.log(John, Sally);
}

main();
