import { parseCommandString } from 'execa';
import { afterAll, afterEach, beforeAll } from 'vitest';

// this points to the location of the test db for local testing
const databaseFile = `../tests/prisma/testData.sqlite`;
// resetting the DATABASE_URL env. variable temporarily for testing locally in a test db
process.env.DATABASE_URL = `file:${databaseFile}`;

beforeAll(async () => {
  // resets db, starts with a clean test db
  await parseCommandString(
    'prisma migrate reset --force --skip-seed --skip-generate'
    // { stdio: 'inherit' }
  );
});

afterEach(async () => {
  // recall order matters for imports. So we need to import prisma at this point, not at the start of the file (if we import it at the start of the file, note that it would be run before we redefine process.env.DATABASE_URL)
  const { prisma } = await import('~/utils/db.server');
  await prisma.user.deleteMany();
});

afterAll(async () => {
  const { prisma } = await import('~/utils/db.server');
  await prisma.$disconnect();
});
